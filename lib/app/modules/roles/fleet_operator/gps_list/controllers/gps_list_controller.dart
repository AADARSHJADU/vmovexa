import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class GpsListController extends GetxController {
  final RxList<GpsDeviceModel> devices = <GpsDeviceModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  final RxString activeTab = 'All'.obs;
  final RxString viewMode = 'table'.obs; // 'table' or 'grid'

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text.trim();
    });
    fetchDevices();
  }

  Future<void> fetchDevices() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getGpsDevices(
        limit: 100,
        search: searchQuery.value,
        status: activeTab.value == 'All' ? '' : activeTab.value.toLowerCase(),
      );
      if (res.success && res.data != null) {
        devices.assignAll(res.data!);
      } else {
        devices.clear();
      }
    } catch (e) {
      debugPrint('Error fetching GPS devices: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void setActiveTab(String tab) {
    activeTab.value = tab;
  }

  void setViewMode(String mode) {
    viewMode.value = mode;
  }

  List<GpsDeviceModel> get filteredDevices {
    final q = searchQuery.value.toLowerCase();
    return devices.where((g) {
      final matchesSearch = q.isEmpty ||
          g.code.toLowerCase().contains(q) ||
          g.id.toString().toLowerCase().contains(q) ||
          g.imei.toLowerCase().contains(q) ||
          g.vendor.toLowerCase().contains(q) ||
          g.model.toLowerCase().contains(q) ||
          g.serialNumber.toLowerCase().contains(q) ||
          (g.vehicle?.busNumber.toLowerCase().contains(q) ?? false) ||
          (g.vehicle?.model.toLowerCase().contains(q) ?? false) ||
          (g.vehicleId != null && g.vehicleId.toString().contains(q));

      bool matchesTab = true;
      if (activeTab.value == 'Available') matchesTab = g.isAvailable;
      if (activeTab.value == 'Assigned') matchesTab = g.isAssigned;
      if (activeTab.value == 'Pending') matchesTab = g.isPending;
      if (activeTab.value == 'Rejected') matchesTab = g.isRejected;

      return matchesSearch && matchesTab;
    }).toList();
  }

  int get totalCount => devices.length;
  int get availableCount => devices.where((g) => g.isAvailable).length;
  int get assignedCount => devices.where((g) => g.isAssigned).length;
  int get pendingCount => devices.where((g) => g.isPending).length;
  int get rejectedCount => devices.where((g) => g.isRejected).length;

  int countForTab(String tab) {
    switch (tab) {
      case 'All':
        return totalCount;
      case 'Available':
        return availableCount;
      case 'Assigned':
        return assignedCount;
      case 'Pending':
        return pendingCount;
      case 'Rejected':
        return rejectedCount;
      default:
        return 0;
    }
  }

  Future<void> handleDelete(GpsDeviceModel device) async {
    if (device.isAssigned) {
      Get.snackbar(
        'Action Prohibited',
        'Cannot delete a GPS device that is currently assigned to a vehicle.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.shade700,
        colorText: Colors.white,
      );
      return;
    }

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Delete GPS Device',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to delete GPS Device ${device.displayCode}?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.deleteGpsDevice(device.id.toString());
        if (res.success) {
          Get.snackbar(
            'Success',
            'GPS device deleted successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          fetchDevices();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to delete GPS device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to delete device: $e');
      }
    }
  }

  Future<void> handleApprove(GpsDeviceModel device) async {
    try {
      final res = await FleetService.to.approveGpsDevice(device.id.toString());
      if (res.success) {
        Get.snackbar(
          'Approved',
          'GPS Device ${device.displayCode} approved successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchDevices();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to approve GPS device',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to approve: $e');
    }
  }

  Future<void> showRejectDialog(GpsDeviceModel device) async {
    final reasonController = TextEditingController();

    final result = await Get.dialog<String>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Reject GPS Device: ${device.displayCode}',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please provide a reason for rejecting this GPS unit:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'e.g. Incompatible hardware / Incorrect IMEI / Antenna faulty',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF334155)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF6366F1)),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: reasonController.text.trim()),
            child: const Text('Confirm Reject', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (result != null && result.isNotEmpty) {
      try {
        final res = await FleetService.to.rejectGpsDevice(device.id.toString(), result);
        if (res.success) {
          Get.snackbar(
            'Device Rejected',
            'GPS Device ${device.displayCode} rejected.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.amber.shade800,
            colorText: Colors.white,
          );
          fetchDevices();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to reject GPS device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to reject: $e');
      }
    }
  }

  void goToDetails(GpsDeviceModel device) {
    Get.toNamed(Routes.GPS_DETAILS, arguments: {'id': device.id.toString(), 'device': device});
  }

  void goToEdit(GpsDeviceModel device) {
    Get.toNamed(Routes.ADD_GPS, arguments: {'id': device.id.toString(), 'device': device});
  }

  void goToAssign(GpsDeviceModel device) {
    Get.toNamed(Routes.ASSIGN_GPS, arguments: {'id': device.id.toString(), 'gpsDevice': device});
  }

  void goToAdd() {
    Get.toNamed(Routes.ADD_GPS);
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
