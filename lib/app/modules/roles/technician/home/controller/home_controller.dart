import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/modules/roles/technician/home/model/home_models.dart';
import 'package:vmovexa/app/modules/roles/technician/technician_dashboard/controller/technician_dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';

class HomeController extends GetxController {
  // ---------------- Sync status ----------------
  final RxBool isSynced = true.obs;
  final RxString lastSyncedText = 'Just now'.obs;

  // ---------------- Loading state ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Technician Profile Info ----------------
  final RxString technicianName = 'Technician'.obs;
  final RxString technicianEmail = ''.obs;
  final RxString technicianRole = 'Central Field Technician'.obs;
  final RxString depotName = 'Central Depot'.obs;
  final RxString badgeId = 'TECH-001'.obs;
  final RxString avatarUrl = ''.obs;

  // ---------------- Rating & Performance Stats (matching Admin Panel) ----------------
  final Rx<TechnicianStatsModel> stats = TechnicianStatsModel.defaultMock().obs;

  double? get averageRating => stats.value.averageRating;
  String get formattedRating => stats.value.formattedRating;
  int get totalRatingsCount => stats.value.totalRatingsCount;
  String get certLevel => stats.value.certLevel ?? 'Master Level 3';
  List<TechRatingBreakdownItem> get ratingBreakdown => stats.value.ratingBreakdown;
  List<TechnicianReviewItem> get recentRatings => stats.value.recentRatings;

  // ---------------- Live KPIs (matching admin panel metrics) ----------------
  final RxInt onlineDevicesCount = 0.obs;
  final RxInt offlineDevicesCount = 0.obs;
  final RxInt issuesDevicesCount = 0.obs;
  final RxInt totalDevicesCount = 0.obs;

  // ---------------- Today's Tasks / Field Work Orders ----------------
  final RxList<WorkOrderModel> todaysWorkOrders = <WorkOrderModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserProfile();
    fetchDashboardData();
  }

  Future<void> _loadUserProfile() async {
    // 1. Cached user
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user != null) {
        _applyUserData(user);
      }
    }

    // 2. Fresh user data from GET /auth/me
    try {
      if (Get.isRegistered<AuthService>()) {
        final res = await AuthService.to.getMe();
        if (res.success && res.data != null) {
          _applyUserData(res.data!);
        }
      }
    } catch (_) {}
  }

  void _applyUserData(dynamic user) {
    technicianName.value = (user.name != null && user.name.toString().isNotEmpty)
        ? user.name.toString()
        : 'Technician';
    technicianEmail.value = user.email?.toString() ?? '';
    final rawRole = user.role?.toString();
    technicianRole.value = (rawRole != null && rawRole.isNotEmpty)
        ? rawRole.replaceAll('ROLE-', '').replaceAll('-', ' ')
        : 'Central Field Technician';
    depotName.value = user.organizationName?.toString() ?? 'Central Depot';
    badgeId.value = user.code?.toString() ??
        user.enrollmentNo?.toString() ??
        (user.id != null ? 'TECH-${user.id}' : 'TECH-001');
    if (user.avatarUrl != null) {
      avatarUrl.value = ApiConstants.resolveFileUrl(user.avatarUrl.toString());
    }
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      await _loadUserProfile();
      await Future.wait([
        _fetchStatsAndKpis(),
        _fetchTodaysWorkOrders(),
      ]);
      _refreshSyncStatus();
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchStatsAndKpis() async {
    try {
      final statsRes = await TechnicianService.to.getTechnicianStats();
      if (statsRes.success && statsRes.data != null) {
        stats.value = statsRes.data!;
        if (stats.value.totalDevices > 0) {
          totalDevicesCount.value = stats.value.totalDevices;
          onlineDevicesCount.value = stats.value.onlineDevices;
          offlineDevicesCount.value = stats.value.offlineDevices;
          issuesDevicesCount.value = stats.value.issuesDevices;
          return;
        }
      }

      // Fallback: Query edge devices directly if totalDevices wasn't provided in stats
      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null) {
        final List<EdgeDeviceModel> list = res.data!;
        totalDevicesCount.value = list.length;
        onlineDevicesCount.value = list.where((d) => d.status.toLowerCase() == 'online').length;
        offlineDevicesCount.value = list.where((d) => d.status.toLowerCase() == 'offline').length;
        issuesDevicesCount.value = list.where((d) => d.hasIssues).length;
      }
    } catch (_) {}
  }

  Future<void> _fetchTodaysWorkOrders() async {
    try {
      final res = await TechnicianService.to.getMyWorkOrders(page: 1, limit: 10);
      if (res.success && res.data != null) {
        todaysWorkOrders.assignAll(res.data!);
      }
    } catch (_) {}
  }

  void _refreshSyncStatus() {
    isSynced.value = true;
    lastSyncedText.value = 'Just now';
  }

  // ---------------- Actions & Navigation ----------------

  void openDrawer() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().openDrawer();
    }
  }

  void goToNotifications() {
    Get.toNamed(Routes.ALERT_NOTIFICATION);
  }

  void onViewAllTasks() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().onNavItemTapped(1); // Field Work Orders tab
    }
  }

  void goToEdgeDevicesTab() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().onNavItemTapped(2); // Edge Devices tab
    }
  }

  void goToHardwareConfigTab() {
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().onNavItemTapped(3); // Hardware Config tab
    }
  }

  void goToGpsInstallation() {
    Get.toNamed(Routes.GPS_INSTALLATION);
  }

  void goToDiagnostics() {
    Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
  }

  void goToConnectivity() {
    Get.toNamed(Routes.CONNECTIVITY_TROUBLESHOOTING);
  }

  void goToHardwareStatus() {
    Get.toNamed(Routes.HARDWARE_STATUS);
  }

  void onTaskTap(BuildContext context, WorkOrderModel order) {
    Get.toNamed(Routes.TECHNICIAN_WORK_ORDER_DETAILS, arguments: order)?.then((_) => fetchDashboardData());
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
