import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/modules/roles/driver/driver_dashboard/controller/driver_dashboard_controller.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class ScheduleController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Tabs (0: Today, 1: Upcoming, 2: All) ----------------
  final RxInt selectedTabIndex = 0.obs;

  // ---------------- Loading & Refreshing ----------------
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // ---------------- Search & Filters ----------------
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString shiftTypeFilter = 'ALL'.obs; // ALL, morning, evening, night
  final RxString statusFilter = 'ALL'.obs; // ALL, scheduled, in_progress, completed

  Timer? _debounceTimer;

  // ---------------- Data Lists ----------------
  final RxList<DriverShiftItem> todayShifts = <DriverShiftItem>[].obs;
  final RxList<DriverShiftItem> upcomingShifts = <DriverShiftItem>[].obs;
  final RxList<DriverShiftItem> allShifts = <DriverShiftItem>[].obs;

  // ---------------- Counters & Metrics ----------------
  final RxInt todayCount = 0.obs;
  final RxInt upcomingCount = 0.obs;
  final RxInt totalCount = 0.obs;

  final RxString todayDateLabel = ''.obs;
  final RxString todayGroupLabel = ''.obs;
  final RxString todayTotalDuration = '--'.obs;

  // ---------------- Selected Shift for Details Modal ----------------
  final Rx<DriverShiftItem?> selectedShift = Rx<DriverShiftItem?>(null);

  @override
  void onInit() {
    super.onInit();
    final now = DateTime.now();
    todayDateLabel.value = DateFormat('MMMM d, y').format(now);
    todayGroupLabel.value = 'Today, ${DateFormat('MMMM d').format(now)}';

    searchController.addListener(_onSearchChanged);
    fetchSchedule();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    searchController.removeListener(_onSearchChanged);
    searchController.dispose();
    super.onClose();
  }

  void _onSearchChanged() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      final text = searchController.text.trim();
      if (searchQuery.value != text) {
        searchQuery.value = text;
      }
    });
  }

  void selectTab(int index) {
    if (selectedTabIndex.value == index) return;
    selectedTabIndex.value = index;
  }

  void setShiftTypeFilter(String filter) {
    shiftTypeFilter.value = filter;
  }

  void setStatusFilter(String filter) {
    statusFilter.value = filter;
  }

  void clearFilters() {
    searchController.clear();
    searchQuery.value = '';
    shiftTypeFilter.value = 'ALL';
    statusFilter.value = 'ALL';
  }

  Future<void> fetchSchedule() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadTodaySchedule(),
        _loadUpcomingSchedule(),
      ]);

      // Combine into allShifts
      final combined = <DriverShiftItem>[...todayShifts, ...upcomingShifts];
      allShifts.assignAll(combined);
      totalCount.value = combined.length;
    } catch (e) {
      debugPrint('ScheduleController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadTodaySchedule() async {
    try {
      final res = await _driverService.getTodaySchedule(tab: 'today');
      if (res.success && res.data != null) {
        final data = res.data!;
        if (data.schedules.isNotEmpty) {
          todayShifts.assignAll(data.schedules);
          todayCount.value = data.schedules.length;
        } else if (data.assignedRoute != null) {
          final single = DriverShiftItem(
            id: 'today_shift_1',
            slotId: 'SLT-101',
            slotCode: 'SLT-101',
            routeNumber: data.assignedRoute?.routeNumber ?? '102',
            routeName: data.assignedRoute?.name ?? 'Central Transit Corridor',
            busNumber: 'DL-01-AB-1234',
            shiftTypeLabel: data.shift?.shiftType ?? 'Morning Peak',
            startTime: data.shift?.startTime ?? '06:00 AM',
            endTime: data.shift?.endTime ?? '02:00 PM',
            date: 'Today',
            startDepot: data.assignedRoute?.fromStop ?? 'Depot North',
            endDepot: data.assignedRoute?.toStop ?? 'Terminal South',
            distance: '24.5 km',
            duration: '8h 00m',
            frequency: '15 mins',
            status: 'Scheduled',
            isCompleted: false,
            isInTransit: false,
            isToday: true,
          );
          todayShifts.assignAll([single]);
          todayCount.value = 1;
        } else {
          todayShifts.clear();
          todayCount.value = 0;
        }

        // Calculate duration from first shift
        if (todayShifts.isNotEmpty) {
          final first = todayShifts.first;
          if (first.duration != null && first.duration!.isNotEmpty) {
            todayTotalDuration.value = first.duration!;
          } else {
            todayTotalDuration.value = _computeDuration(first.startTime ?? '06:00', first.endTime ?? '14:00');
          }
        }
      } else {
        todayShifts.clear();
        todayCount.value = 0;
      }
    } catch (e) {
      debugPrint('Error loading today schedule: $e');
      todayShifts.clear();
      todayCount.value = 0;
    }
  }

  Future<void> _loadUpcomingSchedule() async {
    try {
      final res = await _driverService.getTodaySchedule(tab: 'upcoming');
      if (res.success && res.data != null) {
        final data = res.data!;
        if (data.schedules.isNotEmpty) {
          upcomingShifts.assignAll(data.schedules);
          upcomingCount.value = data.schedules.length;
        } else {
          // If upcoming endpoint returned empty, check upcomingTrips or create future shifts
          upcomingShifts.clear();
          upcomingCount.value = 0;
        }
      } else {
        upcomingShifts.clear();
        upcomingCount.value = 0;
      }
    } catch (e) {
      debugPrint('Error loading upcoming schedule: $e');
      upcomingShifts.clear();
      upcomingCount.value = 0;
    }
  }

  // ---------------- Current Tab Shifts with Active Filters ----------------
  List<DriverShiftItem> get currentFilteredShifts {
    List<DriverShiftItem> source;
    if (selectedTabIndex.value == 0) {
      source = todayShifts;
    } else if (selectedTabIndex.value == 1) {
      source = upcomingShifts;
    } else {
      source = allShifts;
    }

    final q = searchQuery.value.toLowerCase().trim();
    final st = shiftTypeFilter.value.toLowerCase().trim();
    final stat = statusFilter.value.toLowerCase().trim();

    return source.where((s) {
      final route = (s.routeNumber ?? '').toLowerCase();
      final name = (s.routeName ?? '').toLowerCase();
      final bus = (s.busNumber ?? '').toLowerCase();
      final start = (s.startDepot ?? '').toLowerCase();
      final end = (s.endDepot ?? '').toLowerCase();
      final slot = (s.slotCode ?? '').toLowerCase();

      final matchesQuery = q.isEmpty ||
          route.contains(q) ||
          name.contains(q) ||
          bus.contains(q) ||
          start.contains(q) ||
          end.contains(q) ||
          slot.contains(q);

      final shiftType = (s.shiftTypeLabel ?? '').toLowerCase();
      final matchesShiftType = st == 'all' || shiftType.contains(st);

      final status = (s.status ?? '').toLowerCase();
      bool matchesStatus = true;
      if (stat != 'all') {
        if (stat == 'scheduled') {
          matchesStatus = status.contains('scheduled') || status.contains('ready');
        } else if (stat == 'in_progress') {
          matchesStatus = s.isInTransit || status.contains('transit') || status.contains('progress');
        } else if (stat == 'completed') {
          matchesStatus = s.isCompleted || status.contains('completed');
        }
      }

      return matchesQuery && matchesShiftType && matchesStatus;
    }).toList();
  }

  // ---------------- Distance Metric ----------------
  double get todayTotalDistanceKm {
    double total = 0.0;
    for (final s in todayShifts) {
      if (s.distance != null) {
        final numPart = s.distance!.replaceAll(RegExp(r'[^0-9.]'), '');
        final parsed = double.tryParse(numPart);
        if (parsed != null) total += parsed;
      }
    }
    return total;
  }

  String _computeDuration(String start, String end) {
    try {
      final sClean = start.replaceAll(RegExp(r'[^\d:]'), '');
      final eClean = end.replaceAll(RegExp(r'[^\d:]'), '');
      final sParts = sClean.split(':');
      final eParts = eClean.split(':');
      final sMin = int.parse(sParts[0]) * 60 + int.parse(sParts[1]);
      final eMin = int.parse(eParts[0]) * 60 + int.parse(eParts[1]);
      int diff = eMin - sMin;
      if (diff < 0) diff += 24 * 60;
      final h = diff ~/ 60;
      final m = diff % 60;
      return '${h}h ${m}m';
    } catch (_) {
      return '$start – $end';
    }
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      await fetchSchedule();
    } finally {
      isRefreshing.value = false;
    }
  }

  // ---------------- Navigation & Actions ----------------
  void onShiftTap(DriverShiftItem shift) {
    selectedShift.value = shift;
  }

  void onDispatchRoute(DriverShiftItem shift) {
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(1);
    } else {
      Get.toNamed(Routes.MY_ROUTE, arguments: {
        'slotId': shift.slotId,
        'routeNumber': shift.routeNumber,
      });
    }
  }

  void openLiveCockpit() {
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().setNavIndex(1);
    } else {
      Get.toNamed(Routes.MY_ROUTE);
    }
  }

  void onBackPressed() {
    if (Get.key.currentState?.canPop() == true) {
      Get.back();
    } else {
      Get.offAllNamed(Routes.DRIVER_DASHBOARD);
    }
  }
}
