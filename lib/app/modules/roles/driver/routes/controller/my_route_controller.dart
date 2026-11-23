import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class MyRouteController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Tab State ----------------
  final RxString activeTab = 'active'.obs; // 'active' | 'completed'

  // ---------------- Loading States ----------------
  final RxBool isLoadingActive = false.obs;
  final RxBool isLoadingCompleted = false.obs;
  final RxBool isActionLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // ---------------- Active Route / Cockpit State ----------------
  final Rxn<DriverActiveRouteData> rawActiveRoute = Rxn<DriverActiveRouteData>();
  final Rxn<DriverProfileData> profile = Rxn<DriverProfileData>();
  final RxList<DriverSlotModel> todaySlots = <DriverSlotModel>[].obs;
  final RxnInt selectedSlotId = RxnInt();
  final RxBool showTechDetails = false.obs;

  // ---------------- Completed Trips State ----------------
  final RxList<DriverTripItem> completedTrips = <DriverTripItem>[].obs;
  final RxInt totalCompleted = 0.obs;
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 6.obs;
  final RxInt totalPages = 1.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  Timer? _searchDebounceTimer;
  final Rxn<DriverTripItem> selectedTripDetails = Rxn<DriverTripItem>();

  @override
  void onInit() {
    super.onInit();
    fetchInitialData();
  }

  @override
  void onClose() {
    _searchDebounceTimer?.cancel();
    searchController.dispose();
    super.onClose();
  }

  Future<void> fetchInitialData() async {
    isLoadingActive.value = true;
    try {
      await Future.wait([
        fetchActiveRoute(slotId: selectedSlotId.value),
        loadProfile(),
        fetchCompletedTrips(),
      ]);
    } finally {
      isLoadingActive.value = false;
    }
  }

  // ---------------- KYC Verification Check ----------------
  bool get isDocumentsVerified {
    final p = profile.value;
    if (p == null) return true;
    final isDocVerified = p.documentsVerified ?? p.verified ?? true;
    final isStatusValid = p.status != 'pending_approval' &&
        p.status != 'compliance_blocked' &&
        p.status != 'rejected';
    final isKycOk = p.kycRejected != true;
    return isDocVerified && isStatusValid && isKycOk;
  }

  // ---------------- Active Route Computed Status ----------------
  DriverSlotModel? get currentSlot {
    if (selectedSlotId.value != null && todaySlots.isNotEmpty) {
      final found = todaySlots.firstWhereOrNull((s) => s.id == selectedSlotId.value);
      if (found != null) return found;
    }
    return rawActiveRoute.value?.selectedSlot ?? rawActiveRoute.value?.slot;
  }

  bool get isTripInProgress {
    final slot = currentSlot;
    final rawStatus = (rawActiveRoute.value?.rawStatus ??
            rawActiveRoute.value?.status ??
            slot?.status ??
            '')
        .toLowerCase();
    return rawStatus == 'in_progress' ||
        rawStatus == 'in transit' ||
        slot?.isInProgress == true;
  }

  bool get isTripCompleted {
    final slot = currentSlot;
    final rawStatus = (rawActiveRoute.value?.rawStatus ??
            rawActiveRoute.value?.status ??
            slot?.status ??
            '')
        .toLowerCase();
    return rawStatus == 'completed' || slot?.isCompleted == true;
  }

  bool get hasNoAssignments {
    final r = rawActiveRoute.value;
    final slot = currentSlot;
    final hasBus = (r?.busNumber != null && r!.busNumber!.isNotEmpty) ||
        (r?.vehicle?.busNumber != null && r!.vehicle!.busNumber!.isNotEmpty) ||
        (slot?.busNumber != null && slot!.busNumber!.isNotEmpty);
    final hasRoute = (r?.routeName != null && r!.routeName!.isNotEmpty) ||
        (slot?.routeName != null && slot!.routeName!.isNotEmpty);
    return !hasBus && !hasRoute && slot == null && todaySlots.isEmpty;
  }

  int? get currentTripId {
    final tId = rawActiveRoute.value?.tripId;
    if (tId != null) return int.tryParse(tId);
    return null;
  }

  // ---------------- Load Profile ----------------
  Future<void> loadProfile() async {
    try {
      final res = await _driverService.getProfile();
      if (res.success && res.data != null) {
        profile.value = res.data;
      }
    } catch (e) {
      debugPrint('MyRouteController loadProfile error: $e');
    }
  }

  // ---------------- Fetch Active Route ----------------
  Future<void> fetchActiveRoute({int? slotId}) async {
    try {
      final res = await _driverService.getActiveRoute(slotId: slotId);
      if (res.success && res.data != null) {
        rawActiveRoute.value = res.data;
        if (res.data!.todaySlots.isNotEmpty) {
          todaySlots.assignAll(res.data!.todaySlots);
        }
        if (slotId != null) {
          selectedSlotId.value = slotId;
        } else if (res.data!.selectedSlot?.id != null) {
          selectedSlotId.value = res.data!.selectedSlot!.id;
        } else if (todaySlots.isNotEmpty && selectedSlotId.value == null) {
          selectedSlotId.value = todaySlots.first.id;
        }
      }
    } catch (e) {
      debugPrint('MyRouteController fetchActiveRoute error: $e');
    }
  }

  // ---------------- Select Slot from Timetable Switcher ----------------
  Future<void> selectSlot(DriverSlotModel slot) async {
    if (slot.id == null || slot.id == selectedSlotId.value) return;
    selectedSlotId.value = slot.id;
    isLoadingActive.value = true;
    try {
      await fetchActiveRoute(slotId: slot.id);
    } finally {
      isLoadingActive.value = false;
    }
  }

  // ---------------- Toggle Tech Details ----------------
  void toggleTechDetails() {
    showTechDetails.value = !showTechDetails.value;
  }

  // ---------------- Start Trip Action ----------------
  Future<void> onStartTrip({bool forceNew = false}) async {
    if (!isDocumentsVerified) {
      Get.snackbar(
        'driver_routes.kyc_verification_required'.tr,
        'driver_routes.kyc_verification_msg'.tr,
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.amberAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    isActionLoading.value = true;
    try {
      final activeSlotId = selectedSlotId.value ?? (currentSlot?.id);
      final tripRes = await _driverService.startTrip(
        slotId: activeSlotId,
        forceNew: forceNew,
      );
      await _driverService.updateDutyStatus(status: 'on_duty');

      Get.snackbar(
        'driver_routes.live_in_transit'.tr,
        tripRes.message ?? 'Trip started! You are now live on route.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );

      await Future.wait([
        fetchActiveRoute(slotId: activeSlotId),
        loadProfile(),
      ]);
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isActionLoading.value = false;
    }
  }

  // ---------------- End Trip Action ----------------
  Future<void> onEndTrip() async {
    isActionLoading.value = true;
    try {
      final activeSlotId = selectedSlotId.value ?? (currentSlot?.id);
      final endRes = await _driverService.endTrip(
        tripId: currentTripId,
        slotId: activeSlotId,
        coveredKm: rawActiveRoute.value?.coveredKm is num
            ? (rawActiveRoute.value!.coveredKm as num)
            : null,
      );
      await _driverService.updateDutyStatus(status: 'off_duty');

      Get.snackbar(
        'driver_routes.shift_run_completed'.tr,
        endRes.message ?? 'Trip completed successfully and archived to your log!',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );

      await Future.wait([
        fetchActiveRoute(slotId: activeSlotId),
        loadProfile(),
        if (activeTab.value == 'completed') fetchCompletedTrips(),
      ]);
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isActionLoading.value = false;
    }
  }

  // ---------------- Completed Trips (Tab 2) ----------------
  Future<void> fetchCompletedTrips() async {
    isLoadingCompleted.value = true;
    try {
      final res = await _driverService.getTrips(
        page: currentPage.value,
        limit: pageSize.value,
        status: 'completed',
        search: searchQuery.value.trim().isNotEmpty ? searchQuery.value.trim() : null,
      );
      if (res.success && res.data != null) {
        completedTrips.assignAll(res.data!.rows);
        totalCompleted.value = res.data!.count;
        totalPages.value = res.data!.totalPages > 0 ? res.data!.totalPages : 1;
        currentPage.value = res.data!.currentPage;
      }
    } catch (e) {
      debugPrint('MyRouteController fetchCompletedTrips error: $e');
    } finally {
      isLoadingCompleted.value = false;
    }
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
    _searchDebounceTimer?.cancel();
    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      currentPage.value = 1;
      fetchCompletedTrips();
    });
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    currentPage.value = 1;
    fetchCompletedTrips();
  }

  void changePage(int page) {
    if (page < 1 || page > totalPages.value || page == currentPage.value) return;
    currentPage.value = page;
    fetchCompletedTrips();
  }

  void openTripDetails(DriverTripItem trip) {
    selectedTripDetails.value = trip;
  }

  void closeTripDetails() {
    selectedTripDetails.value = null;
  }

  // ---------------- Tab Switching ----------------
  void switchTab(String tab) {
    if (activeTab.value == tab) return;
    activeTab.value = tab;
    if (tab == 'completed') {
      fetchCompletedTrips();
    }
  }

  // ---------------- Refresh ----------------
  Future<void> onRefresh() async {
    isRefreshing.value = true;
    try {
      if (activeTab.value == 'active') {
        await Future.wait([
          fetchActiveRoute(slotId: selectedSlotId.value),
          loadProfile(),
        ]);
      } else {
        await fetchCompletedTrips();
      }
    } finally {
      isRefreshing.value = false;
    }
  }

  // ---------------- Navigation ----------------
  void navigateToSchedule() {
    Get.toNamed(Routes.DRIVER_SCHEDULE);
  }

  void navigateToDocuments() {
    Get.toNamed(Routes.DRIVER_DOCUMENT);
  }

  void onBackPressed() {
    Get.back();
  }
}
