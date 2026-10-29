import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/modules/roles/technician/technician_dashboard/controller/technician_dashboard_controller.dart';
import 'package:vmovexa/app/modules/roles/technician/work_orders/views/work_order_resolution_sheet.dart';
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

  void _loadUserProfile() {
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user != null) {
        technicianName.value = (user.name != null && user.name!.isNotEmpty) ? user.name! : 'Technician';
        technicianEmail.value = user.email ?? '';
        final rawRole = user.role;
        technicianRole.value = (rawRole != null && rawRole.isNotEmpty)
            ? rawRole.replaceAll('ROLE-', '').replaceAll('-', ' ')
            : 'Central Field Technician';
        depotName.value = user.organizationName ?? 'Central Depot';
        badgeId.value = user.code ?? user.enrollmentNo ?? (user.id != null ? 'TECH-${user.id}' : 'TECH-001');
        avatarUrl.value = ApiConstants.resolveFileUrl(user.avatarUrl);
      }
    }
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      _loadUserProfile();
      await Future.wait([
        _fetchDeviceKpis(),
        _fetchTodaysWorkOrders(),
      ]);
      _refreshSyncStatus();
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchDeviceKpis() async {
    try {
      final statsRes = await TechnicianService.to.getTechnicianStats();
      if (statsRes.success && statsRes.data != null && statsRes.data is Map) {
        final map = Map<String, dynamic>.from(statsRes.data as Map);
        final tot = int.tryParse(map['totalDevices']?.toString() ?? map['total_devices']?.toString() ?? '0') ?? 0;
        if (tot > 0) {
          totalDevicesCount.value = tot;
          onlineDevicesCount.value = int.tryParse(map['onlineDevices']?.toString() ?? map['online_devices']?.toString() ?? '0') ?? 0;
          offlineDevicesCount.value = int.tryParse(map['offlineDevices']?.toString() ?? map['offline_devices']?.toString() ?? '0') ?? 0;
          issuesDevicesCount.value = int.tryParse(map['issuesDevices']?.toString() ?? map['issues_devices']?.toString() ?? '0') ?? 0;
          return;
        }
      }

      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null) {
        final List<EdgeDeviceModel> list = res.data!;
        totalDevicesCount.value = list.length;
        onlineDevicesCount.value = list.where((d) => d.status == 'online').length;
        offlineDevicesCount.value = list.where((d) => d.status == 'offline').length;
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
    WorkOrderResolutionSheet.show(
      context,
      order,
      onResolved: fetchDashboardData,
    );
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
