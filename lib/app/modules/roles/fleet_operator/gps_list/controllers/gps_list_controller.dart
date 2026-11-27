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
  final RxString activeTab = 'All'.obs; // 'All', 'Assigned', 'Spare'
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
      );
      if (res.success && res.data != null) {
        devices.assignAll(res.data!);
      } else {
        devices.clear();
      }
    } catch (e) {
      debugPrint('Error fetching Edge devices: $e');
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
          g.boxId.toLowerCase().contains(q) ||
          g.code.toLowerCase().contains(q) ||
          g.id.toString().toLowerCase().contains(q) ||
          g.mac.toLowerCase().contains(q) ||
          g.imei.toLowerCase().contains(q) ||
          g.vendor.toLowerCase().contains(q) ||
          g.model.toLowerCase().contains(q) ||
          g.serialNumber.toLowerCase().contains(q) ||
          g.sim.toLowerCase().contains(q) ||
          g.network.toLowerCase().contains(q) ||
          (g.vehicle?.busNumber.toLowerCase().contains(q) ?? false) ||
          (g.vehicle?.model.toLowerCase().contains(q) ?? false) ||
          (g.vehicle?.vin.toLowerCase().contains(q) ?? false) ||
          (g.vehicle?.depotName.toLowerCase().contains(q) ?? false) ||
          (g.vehicle?.fleetName.toLowerCase().contains(q) ?? false) ||
          (g.vehicleId != null && g.vehicleId.toString().contains(q));

      bool matchesTab = true;
      if (activeTab.value == 'Assigned') matchesTab = g.isAssigned;
      if (activeTab.value == 'Spare') matchesTab = !g.isAssigned;

      return matchesSearch && matchesTab;
    }).toList();
  }

  int get totalCount => devices.length;
  int get assignedCount => devices.where((g) => g.isAssigned).length;
  int get spareCount => devices.where((g) => !g.isAssigned).length;

  int countForTab(String tab) {
    switch (tab) {
      case 'All':
        return totalCount;
      case 'Assigned':
        return assignedCount;
      case 'Spare':
        return spareCount;
      default:
        return 0;
    }
  }

  /// Unlink Edge Device & GPS from vehicle (matching frontend handleUnlink)
  Future<void> handleUnlink(GpsDeviceModel device) async {
    final busLabel = device.vehicle?.busNumber.isNotEmpty == true
        ? device.vehicle!.busNumber
        : (device.vehicleId != null ? 'Bus #${device.vehicleId}' : 'assigned vehicle');
    final deviceLabel = device.displayCode;

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Unlink Edge Device',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Unlink Edge Device $deviceLabel from $busLabel? (Connected GPS stream will also be detached)',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Unlink', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.assignGpsVehicle(device.id.toString(), null);
        if (res.success) {
          Get.snackbar(
            'Success',
            'Edge Device & GPS unlinked successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          fetchDevices();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to unlink device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to unlink device: $e');
      }
    }
  }

  /// Reboot Edge Device hardware
  Future<void> handleReboot(GpsDeviceModel device) async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Reboot Edge Device: ${device.displayCode}',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'Are you sure you want to send a hardware reboot command? The device will temporarily restart.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Reboot Unit', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.rebootEdgeDevice(device.id.toString());
        if (res.success) {
          Get.snackbar(
            'Reboot Signal Sent',
            'Hardware restart signal dispatched to ${device.displayCode}.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to send reboot signal',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to reboot: $e');
      }
    }
  }

  /// Delete Edge Device record (matching frontend)
  Future<void> handleDelete(GpsDeviceModel device) async {
    if (device.isAssigned) {
      Get.snackbar(
        'Action Prohibited',
        'Cannot delete an Edge Device that is currently assigned to a vehicle.',
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
          'Delete Edge Device',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to delete Edge Device record ${device.displayCode}?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('delete'.tr, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white)),
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
            'Edge device record deleted successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          fetchDevices();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to delete device',
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

  void goToVehicleDetails(dynamic vehicleId) {
    if (vehicleId != null && vehicleId.toString().isNotEmpty) {
      Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {'id': vehicleId.toString()});
    }
  }

  void goToLiveTracking(dynamic vehicleId, [String? busNumber]) {
    if (vehicleId != null && vehicleId.toString().isNotEmpty) {
      Get.toNamed(Routes.LIVE_TRACKING, arguments: {
        'vehicleId': vehicleId.toString(),
        if (busNumber != null && busNumber.isNotEmpty) 'vehicleName': busNumber,
      });
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
