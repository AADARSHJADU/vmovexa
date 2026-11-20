import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart' show VehicleItemModel;
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../routes/app_routes.dart';

class DisplayDevicesController extends GetxController {
  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;
  final RxBool isActionLoading = false.obs;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;

  // ---------------- Filter Tab ('All', 'Online', 'Offline', 'Active', 'Inactive') ----------------
  final RxString activeTab = 'All'.obs;

  // ---------------- Master list (all devices) ----------------
  final RxList<EdgeDeviceModel> allDevices = <EdgeDeviceModel>[].obs;
  final RxList<VehicleItemModel> availableVehicles = <VehicleItemModel>[].obs;

  // ---------------- Pagination ----------------
  final RxInt currentPage = 1.obs;
  final int pageSize = 6;

  // Filtered list (search + tab filter applied)
  List<EdgeDeviceModel> get filteredDevices {
    var list = allDevices.toList();

    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((d) {
        return d.boxId.toLowerCase().contains(q) ||
            d.mac.toLowerCase().contains(q) ||
            d.vehicleRegistration.toLowerCase().contains(q) ||
            d.simNetwork.toLowerCase().contains(q) ||
            d.depotName.toLowerCase().contains(q);
      }).toList();
    }

    if (activeTab.value == 'Online') {
      list = list.where((d) => d.isOnline).toList();
    } else if (activeTab.value == 'Offline') {
      list = list.where((d) => d.isOffline).toList();
    } else if (activeTab.value == 'Active') {
      list = list.where((d) => d.isActive).toList();
    } else if (activeTab.value == 'Inactive') {
      list = list.where((d) => !d.isActive).toList();
    }

    return list;
  }

  // Devices shown on the current page
  List<EdgeDeviceModel> get pagedDevices {
    final list = filteredDevices;
    final start = (currentPage.value - 1) * pageSize;
    if (start >= list.length) return [];
    final end = (start + pageSize).clamp(0, list.length);
    return list.sublist(start, end);
  }

  int get totalPages {
    final total = filteredDevices.length;
    if (total == 0) return 1;
    return (total / pageSize).ceil();
  }

  int get showingFrom {
    if (filteredDevices.isEmpty) return 0;
    return (currentPage.value - 1) * pageSize + 1;
  }

  int get showingTo {
    final end = currentPage.value * pageSize;
    return end > filteredDevices.length ? filteredDevices.length : end;
  }

  // ---------------- Summary counts (matching Admin Panel KPIs) ----------------
  int get totalDevices => allDevices.length;
  int get onlineCount => allDevices.where((d) => d.isOnline).length;
  int get offlineCount => allDevices.where((d) => d.isOffline).length;
  int get activeCount => allDevices.where((d) => d.isActive).length;
  int get inactiveCount => allDevices.where((d) => !d.isActive).length;

  @override
  void onInit() {
    super.onInit();
    fetchDevices();
    loadVehicles();
  }

  Future<void> loadVehicles() async {
    try {
      final res = await TechnicianService.to.getVehicles(page: 1, limit: 100);
      if (res.success && res.data != null) {
        availableVehicles.assignAll(res.data!);
      }
    } catch (_) {}
  }

  Future<void> fetchDevices() async {
    isLoading.value = true;
    try {
      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null) {
        allDevices.assignAll(res.data!);
      } else {
        allDevices.clear();
      }
    } catch (_) {
      allDevices.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    currentPage.value = 1;
    await Future.wait([fetchDevices(), loadVehicles()]);
  }

  // ---------------- Search / filter actions ----------------
  void onSearchChanged(String value) {
    searchQuery.value = value;
    currentPage.value = 1;
  }

  void setActiveTab(String tab) {
    activeTab.value = tab;
    currentPage.value = 1;
  }

  // ---------------- Pagination actions ----------------
  void goToPage(int page) {
    if (page < 1 || page > totalPages) return;
    currentPage.value = page;
  }

  void nextPage() => goToPage(currentPage.value + 1);
  void previousPage() => goToPage(currentPage.value - 1);

  // ---------------- Navigation Actions ----------------
  void goToEdgeSetup() {
    Get.toNamed(Routes.TECH_EDGE_SETUP);
  }

  void configureHardware(EdgeDeviceModel device) {
    Get.toNamed(Routes.HARDWARE_CONFIGURATION, arguments: {'deviceId': device.boxId});
  }

  void onRegisterNewDevice() {
    Get.toNamed(Routes.REGISTER_DISPLAY_DEVICE);
  }

  // ---------------- Device Quick Actions (matching admin panel) ----------------

  /// Toggle Active / Inactive state (PATCH /edge-devices/:id/toggle)
  Future<void> toggleDeviceActive(EdgeDeviceModel device) async {
    final nextStatus = !device.isActive;
    try {
      final res = await TechnicianService.to.toggleEdgeDevice(device.id.toString(), nextStatus);
      if (res.success) {
        Get.snackbar(
          nextStatus ? 'device_activated'.tr : 'device_deactivated'.tr,
          '${device.boxId} is now ${nextStatus ? 'Active' : 'Inactive'}.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDevices();
      } else {
        Get.snackbar(
          'toggle_failed'.tr,
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    }
  }

  /// Remote Reboot (POST /edge-devices/:id/reboot)
  Future<void> rebootDevice(BuildContext context, EdgeDeviceModel device) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'reboot_edge_device'.tr,
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Text(
          '${'reboot_confirm_msg'.tr} (${device.boxId})',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white54)),
          ),
          InkWell(
            onTap: () => Navigator.pop(ctx, true),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'reboot_now'.tr,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await TechnicianService.to.rebootEdgeDevice(device.id.toString());
      Get.snackbar(
        'reboot_dispatched'.tr,
        (res.message != null && res.message!.isNotEmpty)
            ? res.message!
            : 'Restart command sent via MQTT to ${device.boxId}.',
        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      await fetchDevices();
    } catch (e) {
      Get.snackbar(
        'reboot_error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    }
  }

  /// Delete Edge Device (DELETE /edge-devices/:id)
  Future<void> deleteDevice(BuildContext context, EdgeDeviceModel device) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'delete_edge_device'.tr,
          style: const TextStyle(color: Color(0xFFEF4444), fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Text(
          '${'delete_device_confirm_msg'.tr} (${device.boxId})',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('delete'.tr),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await TechnicianService.to.deleteEdgeDevice(device.id.toString());
      if (res.success) {
        Get.snackbar(
          'device_deleted'.tr,
          'Edge Device ${device.boxId} has been removed.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDevices();
      } else {
        Get.snackbar(
          'delete_failed'.tr,
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    }
  }

  /// Navigate to full-page Edit Device (matches Admin Panel RegisterEdgeDevicePage edit flow)
  void goToEditDevice(EdgeDeviceModel device) {
    Get.toNamed(Routes.REGISTER_DISPLAY_DEVICE, arguments: device);
  }
}
