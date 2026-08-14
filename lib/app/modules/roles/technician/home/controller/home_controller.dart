import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/technician/display_devices/view/display_devices_view.dart';
import '../../../../../routes/app_routes.dart';
import '../model/home_models.dart';

class HomeController extends GetxController {
  // ---------------- Sync status ----------------
  final RxBool isSynced = true.obs;
  final RxString lastSyncedText = 'Just now'.obs;

  // ---------------- Technician name ----------------
  final RxString technicianName = 'Technician'.obs;

  // ---------------- Loading state ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Bottom nav ----------------
  final RxInt currentNavIndex = 0.obs;

  // ---------------- Stats (Offline / Online / Issues) ----------------
  final RxList<DeviceStat> deviceStats = <DeviceStat>[].obs;

  // ---------------- Quick actions grid ----------------
  final RxList<QuickAction> quickActions = <QuickAction>[].obs;

  // ---------------- Today's tasks ----------------
  final RxList<DashboardTask> todaysTasks = <DashboardTask>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository calls
      _loadDeviceStats();
      _loadQuickActions();
      _loadTodaysTasks();
      _refreshSyncStatus();
    } finally {
      isLoading.value = false;
    }
  }

  void _loadDeviceStats() {
    deviceStats.assignAll([
      DeviceStat(
        count: '5',
        title: 'Offline Devices',
        subtitle: 'Needs Attention',
        color: const Color(0xFFFF4D4D),
        icon: Icons.warning_amber_rounded,
      ),
      DeviceStat(
        count: '18',
        title: 'Online Devices',
        subtitle: 'All Good',
        color: const Color(0xFF2ECC71),
        icon: Icons.check_circle_outline,
      ),
      DeviceStat(
        count: '3',
        title: 'Devices with Issues',
        subtitle: 'Action Required',
        color: const Color(0xFFFFA726),
        icon: Icons.error_outline,
      ),
    ]);
  }

  void _loadQuickActions() {
    quickActions.assignAll([
      QuickAction(
        title: 'Display Devices',
        subtitle: 'Register & Manage Display Devices',
        icon: Icons.desktop_windows_outlined,
        color: const Color(0xFFB042FF),
        route: Routes.REGISTER_DISPLAY_DEVICE,
      ),
      QuickAction(
        title: 'Hardware Configuration',
        subtitle: 'Configure Hardware Settings',
        icon: Icons.settings_outlined,
        color: const Color(0xFF3FA9F5),
        route: Routes.HARDWARE_CONFIGURATION,
      ),
      QuickAction(
        title: 'GPS Installation',
        subtitle: 'Install and Assign GPS Devices',
        icon: Icons.location_on_outlined,
        color: const Color(0xFF2EE6C7),
        route: Routes.GPS_INSTALLATION,
      ),
      QuickAction(
        title: 'Device Diagnostics',
        subtitle: 'Run Diagnostics and Check Health',
        icon: Icons.monitor_heart_outlined,
        color: const Color(0xFFFF3D9A),
        route: '/device-diagnostics',
      ),
      QuickAction(
        title: 'Hardware Status',
        subtitle: 'Monitor Hardware Status',
        icon: Icons.insights_outlined,
        color: const Color(0xFFFFA726),
        route: '/hardware-status',
      ),
      QuickAction(
        title: 'Connectivity Troubleshooting',
        subtitle: 'Troubleshoot Connectivity Issues',
        icon: Icons.wifi_tethering,
        color: const Color(0xFF7C6FF0),
        route: '/connectivity-troubleshooting',
      ),
    ]);
  }

  void _loadTodaysTasks() {
    todaysTasks.assignAll([
      DashboardTask(
        id: 'task_1',
        title: 'Register new display device',
        subtitle: 'Bus MH12 AB 1234',
        icon: Icons.desktop_windows_outlined,
        iconColor: const Color(0xFFB042FF),
        status: TaskStatus.pending,
      ),
      DashboardTask(
        id: 'task_2',
        title: 'Install GPS device',
        subtitle: 'Vehicle MH12 AB 5678',
        icon: Icons.location_on_outlined,
        iconColor: const Color(0xFF3FA9F5),
        status: TaskStatus.pending,
      ),
      DashboardTask(
        id: 'task_3',
        title: 'Check offline device',
        subtitle: 'Device ID: VMX-DP-1023',
        icon: Icons.bolt_outlined,
        iconColor: const Color(0xFFFFA726),
        status: TaskStatus.inProgress,
      ),
    ]);
  }

  void _refreshSyncStatus() {
    isSynced.value = true;
    lastSyncedText.value = 'Just now';
  }

  // ---------------- Actions ----------------

  void onStatCardTap(DeviceStat stat) {
    // Navigate to relevant device list filtered by this stat
    // Get.toNamed('/devices', arguments: {'filter': stat.title});
  }

  void onQuickActionTap(QuickAction action) {
    print('action-=--$action');
    Get.toNamed(action.route);
  }

  void onTaskTap(DashboardTask task) {
    Get.toNamed('/task-detail', arguments: task.id);
  }

  void onViewAllTasks() {
    Get.toNamed('/tasks');
  }

  void onNavTap(int index) {
    currentNavIndex.value = index;
    switch (index) {
      case 0:
        // already on dashboard/home
        break;
      case 1:
        Get.toNamed('/display-devices');
        break;
      case 2:
        Get.toNamed('/device-diagnostics');
        break;
      case 3:
        Get.toNamed('/hardware-status');
        break;
      case 4:
        Get.toNamed('/more');
        break;
    }
  }

  Future<void> onRefresh() async {
    await fetchDashboardData();
  }
}
