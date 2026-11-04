import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import '../model/assigned_route_model.dart';

class MyRouteController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Route state ----------------
  final Rxn<AssignedRoute> route = Rxn<AssignedRoute>();
  final Rxn<DriverActiveRouteData> rawActiveRoute = Rxn<DriverActiveRouteData>();

  final RxBool isRouteStarted = false.obs;
  final RxBool isStarting = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchRoute();
  }

  Future<void> fetchRoute() async {
    isLoading.value = true;
    try {
      // 1. Try fetching currently active route from API
      final activeResponse = await _driverService.getActiveRoute();
      if (activeResponse.success && activeResponse.data != null && (activeResponse.data?.route != null || activeResponse.data?.routeName != null)) {
        rawActiveRoute.value = activeResponse.data;
        isRouteStarted.value = (activeResponse.data?.rawStatus == 'in_progress');
        await _mapActiveRouteToAssigned(activeResponse.data!);
        return;
      }

      // 2. Fallback to today's assigned schedule route from API
      final scheduleResponse = await _driverService.getTodaySchedule();
      if (scheduleResponse.success && scheduleResponse.data != null) {
        final sched = scheduleResponse.data!;
        if (sched.assignedRoute != null) {
          await _mapScheduleToAssigned(sched);
          return;
        }
      }

      // 3. No route assigned on backend
      route.value = null;
      isRouteStarted.value = false;
    } catch (e) {
      debugPrint('MyRouteController fetchRoute error: $e');
      route.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _mapActiveRouteToAssigned(DriverActiveRouteData active) async {
    final stopsList = active.stops.map((s) {
      RouteStopType type = RouteStopType.stop;
      final stType = (s.type ?? '').toLowerCase();
      if (stType == 'start' || s.order == 1) {
        type = RouteStopType.start;
      } else if (stType == 'end' || s.order == active.stops.length) {
        type = RouteStopType.end;
      }
      return RouteStop(
        name: s.name ?? 'Stop',
        time: s.eta ?? '--:--',
        distanceKm: double.tryParse((s.distance ?? '').replaceAll(RegExp(r'[^\d.]'), '')) ?? 0.0,
        type: type,
      );
    }).toList();

    final fromName = active.origin ?? (stopsList.isNotEmpty ? stopsList.first.name : 'Origin');
    final toName = active.destination ?? (stopsList.isNotEmpty ? stopsList.last.name : 'Destination');

    String busNo = active.busNumber ?? 'Assigned Vehicle';
    String busModel = active.vehicleType ?? 'Transit Bus';
    if (busNo == 'Assigned Vehicle') {
      final profileRes = await _driverService.getProfile();
      if (profileRes.success && profileRes.data?.assignedVehicle != null) {
        final v = profileRes.data!.assignedVehicle!;
        busNo = v.registrationNumber ?? busNo;
        busModel = '${v.make ?? ""} ${v.model ?? ""}'.trim();
        if (busModel.isEmpty) busModel = 'Transit Bus';
      }
    }

    final double totalDist = double.tryParse((active.totalDistance ?? '').replaceAll(RegExp(r'[^\d.]'), '')) ?? 0.0;
    final rName = active.routeName ?? active.route?.name ?? (active.routeNumber != null ? 'Route ${active.routeNumber}' : 'Active Route');

    final bool isDuty = active.rawStatus == 'in_progress' ||
        (active.status?.toLowerCase().contains('progress') == true) ||
        (active.status?.toLowerCase().contains('duty') == true);

    route.value = AssignedRoute(
      routeName: rName,
      fromDepot: fromName,
      toDepot: toName,
      busNumber: busNo,
      isOnDuty: isDuty,
      startTime: active.departureTime ?? (active.tripStartedAt != null ? _formatTime(active.tripStartedAt!) : '--:--'),
      endTime: active.endTime ?? 'Ongoing',
      totalDistanceKm: totalDist,
      stops: stopsList,
      routeType: active.routeType ?? 'Intracity Transit',
      frequency: active.frequency ?? 'Every 15 mins',
      passengersEstimate: active.passengersEstimate ?? '${active.passengersOnboard} Onboard',
      vehicleId: active.vehicleCode ?? active.tripId ?? 'Active Trip',
      busType: busModel,
    );
  }

  Future<void> _mapScheduleToAssigned(DriverScheduleData sched) async {
    final r = sched.assignedRoute!;
    final stopsList = [
      RouteStop(
        name: r.fromStop ?? 'Start Stop',
        time: sched.shift?.startTime ?? '--:--',
        distanceKm: 0.0,
        type: RouteStopType.start,
      ),
      RouteStop(
        name: r.toStop ?? 'End Stop',
        time: sched.shift?.endTime ?? '--:--',
        distanceKm: 0.0,
        type: RouteStopType.end,
      ),
    ];

    String busNo = 'Scheduled Bus';
    String busModel = 'Standard Transit';
    final profileRes = await _driverService.getProfile();
    if (profileRes.success && profileRes.data?.assignedVehicle != null) {
      final v = profileRes.data!.assignedVehicle!;
      busNo = v.registrationNumber ?? busNo;
      busModel = '${v.make ?? ""} ${v.model ?? ""}'.trim();
      if (busModel.isEmpty) busModel = 'Standard Transit';
    }

    route.value = AssignedRoute(
      routeName: r.name ?? (r.routeNumber != null ? 'Route ${r.routeNumber}' : 'Scheduled Route'),
      fromDepot: r.fromStop ?? 'Depot',
      toDepot: r.toStop ?? 'Destination',
      busNumber: busNo,
      isOnDuty: false,
      startTime: sched.shift?.startTime ?? '--:--',
      endTime: sched.shift?.endTime ?? '--:--',
      totalDistanceKm: 0.0,
      stops: stopsList,
      routeType: 'Scheduled Service',
      frequency: 'Every Day',
      passengersEstimate: '--',
      vehicleId: sched.date ?? 'Today',
      busType: busModel,
    );
  }

  String _formatTime(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$hour12:$minute $period';
    } catch (_) {
      return raw;
    }
  }

  int? get currentTripId {
    final tId = rawActiveRoute.value?.tripId;
    if (tId != null) return int.tryParse(tId);
    return null;
  }

  Future<void> onRefresh() async {
    await fetchRoute();
  }

  // ---------------- Actions ----------------
  Future<void> onStartRoute() async {
    if (isRouteStarted.value) {
      Get.snackbar(
        'Already Running',
        'This route is already in progress.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    isStarting.value = true;
    try {
      // 1. Call POST /api/v1/me/driver/trip/start
      final tripRes = await _driverService.startTrip(forceNew: true);
      // 2. Set duty status to on_duty
      await _driverService.updateDutyStatus(status: 'on_duty');

      isRouteStarted.value = true;
      Get.snackbar(
        'Route Started',
        tripRes.message ?? 'Trip started successfully! Duty status is On Duty.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      await fetchRoute();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not start route: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isStarting.value = false;
    }
  }

  Future<void> onEndRoute() async {
    isStarting.value = true;
    try {
      // 1. Call POST /api/v1/me/driver/trip/end
      final endRes = await _driverService.endTrip(
        tripId: currentTripId,
        coveredKm: route.value?.totalDistanceKm,
      );
      // 2. Set duty status to off_duty
      await _driverService.updateDutyStatus(status: 'off_duty');

      isRouteStarted.value = false;
      Get.snackbar(
        'Trip Ended',
        endRes.message ?? 'Trip completed successfully! Duty status is Off Duty.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      await fetchRoute();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not end route: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isStarting.value = false;
    }
  }

  void onViewOnMap() {
    Get.snackbar(
      'Live Map',
      'Displaying GPS coordinates for ${route.value?.routeName ?? "Route"}',
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void onOpenFilterSheet() {}

  void onBackPressed() => Get.back();
}
