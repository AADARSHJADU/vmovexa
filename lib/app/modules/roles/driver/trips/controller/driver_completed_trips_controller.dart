import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class DriverCompletedTripsController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Loading & Refreshing ----------------
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // ---------------- Trips Data & Pagination ----------------
  final RxList<DriverTripItem> trips = <DriverTripItem>[].obs;
  final RxInt totalCompleted = 0.obs;
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 6.obs;
  final RxInt totalPages = 1.obs;

  // ---------------- Filter & Search ----------------
  final RxString timeFilter = 'all'.obs; // 'all' | 'today' | 'week'
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  Timer? _searchDebounceTimer;

  // ---------------- Selected Trip for Summary Modal ----------------
  final Rxn<DriverTripItem> selectedTripDetails = Rxn<DriverTripItem>();

  // ---------------- Driver Profile Info ----------------
  final Rxn<DriverProfileData> profile = Rxn<DriverProfileData>();

  @override
  void onInit() {
    super.onInit();
    loadProfile();
    fetchTrips();
  }

  @override
  void onClose() {
    _searchDebounceTimer?.cancel();
    searchController.dispose();
    super.onClose();
  }

  // ---------------- Fetch Profile ----------------
  Future<void> loadProfile() async {
    try {
      final res = await _driverService.getProfile();
      if (res.success && res.data != null) {
        profile.value = res.data;
      }
    } catch (e) {
      debugPrint('DriverCompletedTripsController loadProfile error: $e');
    }
  }

  String get driverStatus {
    final p = profile.value;
    if (p?.status != null && p!.status!.isNotEmpty) {
      return p.status!.replaceAll('_', ' ').capitalizeFirst ?? p.status!;
    }
    return 'active_duty_label'.tr;
  }

  String get driverName {
    final p = profile.value;
    if (p?.name != null && p!.name!.isNotEmpty) {
      return p.name!;
    }
    final user = Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null;
    return user?.name ?? 'Driver';
  }

  // ---------------- Computed Metrics ----------------
  String get totalDistanceStr {
    double sum = 0.0;
    for (final t in trips) {
      final dist = double.tryParse(t.distanceKm?.toString() ?? '') ??
          double.tryParse(t.coveredKm?.toString() ?? '') ??
          0.0;
      sum += dist;
    }
    return sum.toStringAsFixed(2);
  }

  String get totalHoursStr {
    int totalMinutes = 0;
    for (final t in trips) {
      if (t.startedAt == null || t.endedAt == null) continue;
      try {
        final s = DateTime.parse(t.startedAt!).toLocal();
        final e = DateTime.parse(t.endedAt!).toLocal();
        final diff = e.difference(s);
        if (!diff.isNegative) {
          totalMinutes += diff.inMinutes;
        }
      } catch (_) {}
    }
    final h = totalMinutes ~/ 60;
    final m = totalMinutes % 60;
    if (h > 0) return '${h}h ${m}m';
    if (m > 0) return '${m}m';
    return trips.isNotEmpty ? '${trips.length * 15}m' : '0m';
  }

  // ---------------- Fetch Trips ----------------
  Future<void> fetchTrips() async {
    isLoading.value = true;
    try {
      final res = await _driverService.getTrips(
        page: currentPage.value,
        limit: pageSize.value,
        status: 'completed',
        period: timeFilter.value != 'all' ? timeFilter.value : null,
        search: searchQuery.value.trim().isNotEmpty ? searchQuery.value.trim() : null,
      );
      if (res.success && res.data != null) {
        trips.assignAll(res.data!.rows);
        totalCompleted.value = res.data!.count;
        totalPages.value = res.data!.totalPages > 0 ? res.data!.totalPages : 1;
        currentPage.value = res.data!.currentPage;
      }
    } catch (e) {
      debugPrint('DriverCompletedTripsController fetchTrips error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------- Time Filter Switch ----------------
  void setTimeFilter(String filter) {
    if (timeFilter.value == filter) return;
    timeFilter.value = filter;
    currentPage.value = 1;
    fetchTrips();
  }

  // ---------------- Search Controls ----------------
  void onSearchChanged(String val) {
    searchQuery.value = val;
    _searchDebounceTimer?.cancel();
    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      currentPage.value = 1;
      fetchTrips();
    });
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    currentPage.value = 1;
    fetchTrips();
  }

  // ---------------- Pagination ----------------
  void changePage(int page) {
    if (page < 1 || page > totalPages.value || page == currentPage.value) return;
    currentPage.value = page;
    fetchTrips();
  }

  // ---------------- Modal Handling ----------------
  void openTripDetails(DriverTripItem trip) {
    selectedTripDetails.value = trip;
  }

  void closeTripDetails() {
    selectedTripDetails.value = null;
  }

  // ---------------- Navigation ----------------
  void navigateToActiveCockpit() {
    Get.toNamed(Routes.MY_ROUTE);
  }

  // ---------------- Refresh ----------------
  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      await Future.wait([
        fetchTrips(),
        loadProfile(),
      ]);
    } finally {
      isRefreshing.value = false;
    }
  }
}
