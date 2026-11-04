import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../model/schedule_trip_model.dart';

class ScheduleController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Tabs ----------------
  final RxInt selectedTabIndex = 0.obs; // 0 = Today, 1 = Upcoming
  void selectTab(int index) => selectedTabIndex.value = index;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Today ----------------
  final RxString todayDateLabel = ''.obs;
  final RxString todayGroupLabel = ''.obs;
  final RxList<ScheduleTrip> todayTrips = <ScheduleTrip>[].obs;

  int get todayTripCount => todayTrips.length;
  double get todayTotalDistanceKm => todayTrips.fold(0.0, (sum, t) => sum + t.distanceKm);
  final RxString todayTotalDuration = '--'.obs;

  // ---------------- Upcoming ----------------
  final RxList<ScheduleTrip> upcomingTrips = <ScheduleTrip>[].obs;
  int get upcomingTripCount => upcomingTrips.length;

  @override
  void onInit() {
    super.onInit();
    final now = DateTime.now();
    todayDateLabel.value = DateFormat('MMMM d, y').format(now);
    todayGroupLabel.value = 'Today, ${DateFormat('MMMM d').format(now)}';
    fetchSchedule();
  }

  Future<void> fetchSchedule() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _fetchTodaySchedule(),
        _fetchTripHistory(),
      ]);
    } catch (e) {
      debugPrint('ScheduleController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchTodaySchedule() async {
    final response = await _driverService.getTodaySchedule();
    if (response.success && response.data != null) {
      final data = response.data!;
      final routeName = data.assignedRoute?.name ??
          (data.assignedRoute?.routeNumber != null
              ? 'Route ${data.assignedRoute?.routeNumber}'
              : 'Corridor Route');
      final fromDepot = data.assignedRoute?.fromStop ?? 'Depot';
      final toDepot = data.assignedRoute?.toStop ?? 'Terminus';

      // Compute total duration dynamically from shift
      if (data.shift != null && data.shift!.startTime != null && data.shift!.endTime != null) {
        todayTotalDuration.value = _computeDuration(data.shift!.startTime!, data.shift!.endTime!);
      } else {
        todayTotalDuration.value = '--';
      }

      if (data.upcomingTrips.isNotEmpty) {
        int tripIdx = 1;
        final mapped = data.upcomingTrips.map((t) {
          ScheduleTripStatus status = ScheduleTripStatus.pending;
          if (t.status == 'in_progress') status = ScheduleTripStatus.onDuty;
          if (t.status == 'completed') status = ScheduleTripStatus.completed;

          String startTime = t.scheduledDeparture ?? (data.shift?.startTime ?? '--:--');
          if (startTime.contains('T')) {
            try {
              final parsed = DateTime.parse(startTime).toLocal();
              startTime = DateFormat('hh:mm a').format(parsed);
            } catch (_) {}
          }

          final trip = ScheduleTrip(
            id: t.id ?? 'trip_$tripIdx',
            routeName: routeName,
            tripLabel: 'Trip $tripIdx',
            fromDepot: t.fromStop ?? fromDepot,
            toDepot: t.toStop ?? toDepot,
            startTime: startTime,
            endTime: data.shift?.endTime ?? '--:--',
            startPoint: t.fromStop ?? fromDepot,
            endPoint: t.toStop ?? toDepot,
            distanceKm: 0.0,
            status: status,
            date: DateTime.now(),
            dayLabel: DateFormat('EEEE').format(DateTime.now()),
          );
          tripIdx++;
          return trip;
        }).toList();

        todayTrips.assignAll(mapped);
      } else if (data.assignedRoute != null) {
        todayTrips.assignAll([
          ScheduleTrip(
            id: 'trip_today_1',
            routeName: routeName,
            tripLabel: 'Trip 1',
            fromDepot: fromDepot,
            toDepot: toDepot,
            startTime: data.shift?.startTime ?? '--:--',
            endTime: data.shift?.endTime ?? '--:--',
            startPoint: fromDepot,
            endPoint: toDepot,
            distanceKm: 0.0,
            status: ScheduleTripStatus.onDuty,
            date: DateTime.now(),
            dayLabel: DateFormat('EEEE').format(DateTime.now()),
          ),
        ]);
      } else {
        todayTrips.clear();
      }
    } else {
      todayTrips.clear();
    }
  }

  Future<void> _fetchTripHistory() async {
    final response = await _driverService.getTrips(page: 1, limit: 20);
    if (response.success && response.data != null && response.data!.rows.isNotEmpty) {
      int idx = 1;
      final mapped = response.data!.rows.map((row) {
        DateTime dt = DateTime.now();
        if (row.startTime != null) {
          try {
            dt = DateTime.parse(row.startTime!).toLocal();
          } catch (_) {}
        }

        ScheduleTripStatus st = ScheduleTripStatus.scheduled;
        if (row.status == 'completed') st = ScheduleTripStatus.completed;

        String sTime = row.startTime != null ? DateFormat('hh:mm a').format(dt) : '--:--';
        String eTime = row.endTime != null ? DateFormat('hh:mm a').format(DateTime.parse(row.endTime!).toLocal()) : '--:--';

        return ScheduleTrip(
          id: row.id ?? 'up_$idx',
          routeName: row.routeName ?? (row.routeNumber != null ? 'Route ${row.routeNumber}' : 'Corridor Route'),
          tripLabel: 'Trip $idx',
          fromDepot: 'Origin',
          toDepot: 'Destination',
          startTime: sTime,
          endTime: eTime,
          startPoint: 'Origin',
          endPoint: 'Destination',
          distanceKm: row.distanceKm > 0 ? row.distanceKm : 0.0,
          status: st,
          date: dt,
          dayLabel: DateFormat('EEEE').format(dt),
        );
      }).toList();

      upcomingTrips.assignAll(mapped);
    } else {
      upcomingTrips.clear();
    }
  }

  String _computeDuration(String start, String end) {
    try {
      final sParts = start.split(':');
      final eParts = end.split(':');
      final sMin = int.parse(sParts[0]) * 60 + int.parse(sParts[1]);
      final eMin = int.parse(eParts[0]) * 60 + int.parse(eParts[1]);
      int diff = eMin - sMin;
      if (diff < 0) diff += 24 * 60;
      final h = diff ~/ 60;
      final m = diff % 60;
      return '${h}h ${m}m';
    } catch (_) {
      return '$start - $end';
    }
  }

  Future<void> onRefresh() async {
    await fetchSchedule();
  }

  // ---------------- Actions ----------------
  void onCalendarTap() {}

  void onTripTap(ScheduleTrip trip) {
    Get.toNamed(Routes.MY_ROUTE, arguments: {'routeName': trip.routeName});
  }

  void onBackPressed() {
    if (Get.key.currentState?.canPop() == true) {
      Get.back();
    } else {
      Get.offAllNamed(Routes.DRIVER_DASHBOARD);
    }
  }
}
