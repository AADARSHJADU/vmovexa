import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
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
  }

  Future<void> fetchDevices() async {
    isLoading.value = true;
    try {
      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        allDevices.assignAll(res.data!);
      } else {
        allDevices.assignAll(_mockDevices());
      }
    } catch (_) {
      allDevices.assignAll(_mockDevices());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async {
    currentPage.value = 1;
    await fetchDevices();
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

  // ---------------- Device Quick Actions (matching admin panel) ----------------

  /// Toggle Active / Inactive state (PATCH /edge-devices/:id/toggle)
  Future<void> toggleDeviceActive(EdgeDeviceModel device) async {
    final nextStatus = !device.isActive;
    try {
      final res = await TechnicianService.to.toggleEdgeDevice(device.id.toString(), nextStatus);
      if (res.success) {
        Get.snackbar(
          nextStatus ? 'Device Activated' : 'Device Deactivated',
          '${device.boxId} is now ${nextStatus ? 'Active' : 'Inactive'}.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDevices();
      } else {
        Get.snackbar(
          'Toggle Failed',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
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
        title: const Text('Reboot Edge Device', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text(
          'Send remote restart command via MQTT to ${device.boxId}? The device will briefly go offline.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reboot Now'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await TechnicianService.to.rebootEdgeDevice(device.id.toString());
      Get.snackbar(
        'Reboot Dispatched',
        (res.message != null && res.message!.isNotEmpty) ? res.message! : 'Restart command sent via MQTT to ${device.boxId}.',
        backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      await fetchDevices();
    } catch (e) {
      Get.snackbar(
        'Reboot Error',
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
        title: const Text('Delete Edge Device', style: TextStyle(color: Color(0xFFEF4444), fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to delete Edge Device "${device.boxId}"? This action cannot be undone.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await TechnicianService.to.deleteEdgeDevice(device.id.toString());
      if (res.success) {
        Get.snackbar(
          'Device Deleted',
          'Edge Device ${device.boxId} has been removed.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchDevices();
      } else {
        Get.snackbar(
          'Delete Failed',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    }
  }

  /// Configure Hardware Shortcut
  void configureHardware(EdgeDeviceModel device) {
    Get.toNamed(Routes.HARDWARE_CONFIGURATION, arguments: {'deviceId': device.boxId});
  }

  /// Register New Device
  void onRegisterNewDevice() {
    Get.toNamed(Routes.REGISTER_DISPLAY_DEVICE);
  }

  // ---------------- Mock data matching Admin Panel ----------------
  List<EdgeDeviceModel> _mockDevices() {
    return [
      EdgeDeviceModel(
        id: 1,
        boxId: 'VMX-BOX-8801',
        deviceId: 'VMX-BOX-8801',
        name: 'Front Bulkhead Player',
        mac: '00:1A:2B:3C:4D:5E',
        vehicleRegistration: 'MH12 AB 1234',
        depotName: 'Mumbai Central Depot',
        status: 'online',
        isActive: true,
        agentVersion: 'v2.4.1',
        simNetwork: 'Airtel 4G IoT',
        ipAddress: '192.168.4.10',
        lastHeartbeat: '2 mins ago',
        createdAt: '2026-10-10',
      ),
      EdgeDeviceModel(
        id: 2,
        boxId: 'VMX-BOX-8802',
        deviceId: 'VMX-BOX-8802',
        name: 'Rear Passenger Screen',
        mac: '00:1A:2B:3C:4D:5F',
        vehicleRegistration: 'MH12 AB 5678',
        depotName: 'Andheri Depot',
        status: 'offline',
        isActive: true,
        agentVersion: 'v2.4.0',
        simNetwork: 'Jio 5G',
        ipAddress: '192.168.4.11',
        lastHeartbeat: '15 mins ago',
        createdAt: '2026-10-09',
      ),
      EdgeDeviceModel(
        id: 3,
        boxId: 'VMX-BOX-8803',
        deviceId: 'VMX-BOX-8803',
        name: 'Side Banner Player',
        mac: '00:1A:2B:3C:4D:60',
        vehicleRegistration: 'MH12 AB 9101',
        depotName: 'Thane Depot',
        status: 'warning',
        isActive: false,
        agentVersion: 'v2.3.9',
        simNetwork: 'Wi-Fi',
        ipAddress: '192.168.4.12',
        lastHeartbeat: '2 hours ago',
        createdAt: '2026-10-08',
      ),
      EdgeDeviceModel(
        id: 4,
        boxId: 'VMX-BOX-8804',
        deviceId: 'VMX-BOX-8804',
        name: 'Driver Console Link',
        mac: '00:1A:2B:3C:4D:61',
        vehicleRegistration: 'MH12 AB 1122',
        depotName: 'Borivali Depot',
        status: 'online',
        isActive: true,
        agentVersion: 'v2.4.1',
        simNetwork: 'Airtel 4G IoT',
        ipAddress: '192.168.4.13',
        lastHeartbeat: 'Just now',
        createdAt: '2026-10-05',
      ),
    ];
  }
}
