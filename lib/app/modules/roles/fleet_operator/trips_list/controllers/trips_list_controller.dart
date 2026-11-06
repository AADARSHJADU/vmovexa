import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/trip_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class TripsListController extends GetxController {
  final RxList<TripItemModel> trips = <TripItemModel>[].obs;
  final RxBool isLoading = false.obs;

  // Search & Filter
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString activeTab = 'All'.obs; // All, in_progress, completed, scheduled

  // Pagination
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 6.obs;
  final RxInt totalItems = 0.obs;
  final RxInt totalPages = 1.obs;

  Timer? _debounceTimer;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(_onSearchChanged);
    fetchTrips();
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
      if (searchQuery.value != searchController.text.trim()) {
        searchQuery.value = searchController.text.trim();
        currentPage.value = 1;
        fetchTrips();
      }
    });
  }

  void setActiveTab(String tabId) {
    if (activeTab.value == tabId) return;
    activeTab.value = tabId;
    currentPage.value = 1;
    fetchTrips();
  }

  Future<void> fetchTrips() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getTrips(
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
        status: activeTab.value == 'All' ? '' : activeTab.value,
      );

      if (res.success && res.data != null) {
        trips.assignAll(res.data!);
        totalItems.value = res.data!.length;
        totalPages.value = (totalItems.value / pageSize.value).ceil().clamp(1, 999);
      } else {
        trips.clear();
        totalItems.value = 0;
        totalPages.value = 1;
      }
    } catch (e) {
      debugPrint('Error loading trips: $e');
      trips.clear();
      totalItems.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  // KPI Metrics calculated across all available trips
  int get inProgressCount => trips.where((t) => t.status == 'in_progress').length;
  int get completedCount => trips.where((t) => t.status == 'completed').length;
  int get scheduledCount => trips.where((t) => t.status == 'scheduled').length;
  int get totalRecordedCount => trips.length;

  void goToPage(int page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchTrips();
    }
  }

  void openTripDetails(TripItemModel trip) {
    Get.toNamed(Routes.TRIP_DETAILS, arguments: {
      'trip': trip,
      'tripId': trip.id,
      'vehicleName': trip.vehicle?.busNumber ?? 'Transit Bus',
      'driverName': trip.driver?.name ?? 'Assigned Driver',
    });
  }

  void openLiveRadar() {
    Get.toNamed(Routes.LIVE_TRACKING);
  }
}
