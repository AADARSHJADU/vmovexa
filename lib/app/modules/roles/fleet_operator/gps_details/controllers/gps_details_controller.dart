import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class GpsDetailsController extends GetxController {
  final Rxn<GpsDeviceModel> device = Rxn<GpsDeviceModel>();
  final RxBool isLoading = true.obs;
  late final String deviceId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      deviceId = args['id']?.toString() ?? '';
      if (args['device'] is GpsDeviceModel) {
        device.value = args['device'] as GpsDeviceModel;
      }
    } else if (args != null) {
      deviceId = args.toString();
    } else {
      deviceId = '';
    }

    if (deviceId.isNotEmpty) {
      fetchDeviceDetails();
    } else {
      isLoading.value = false;
    }
  }

  Future<void> fetchDeviceDetails() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getGpsDevice(deviceId);
      if (res.success && res.data != null) {
        device.value = res.data;
      }
    } catch (e) {
      debugPrint('Error fetching GPS device details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> handleUnassign() async {
    final d = device.value;
    final busLabel = d?.vehicle?.busNumber.isNotEmpty == true
        ? d!.vehicle!.busNumber
        : (d?.vehicleId != null ? 'Bus #${d!.vehicleId}' : 'vehicle');

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Unassign GPS Tracker',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to unassign GPS tracker ${d?.displayCode} from $busLabel?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Unassign', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.assignGpsVehicle(deviceId, null);
        if (res.success) {
          Get.snackbar(
            'GPS Unassigned',
            'GPS device unassigned from vehicle!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          fetchDeviceDetails();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to unassign GPS device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to unassign: $e');
      }
    }
  }

  Future<void> handleApprove() async {
    try {
      final res = await FleetService.to.approveGpsDevice(deviceId);
      if (res.success) {
        Get.snackbar(
          'Device Approved',
          'GPS Device ${device.value?.displayCode} approved successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        fetchDeviceDetails();
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

  Future<void> showRejectDialog() async {
    final reasonController = TextEditingController();

    final result = await Get.dialog<String>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Reject GPS Device: ${device.value?.displayCode}',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please provide a reason for rejecting this device:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Enter rejection notes...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
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
        final res = await FleetService.to.rejectGpsDevice(deviceId, result);
        if (res.success) {
          Get.snackbar(
            'Device Rejected',
            'GPS device rejected.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.amber.shade800,
            colorText: Colors.white,
          );
          fetchDeviceDetails();
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

  Future<void> handleDelete() async {
    final d = device.value;
    if (d?.isAssigned == true) {
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
        title: const Text('Delete GPS Device', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Delete GPS device ${d?.displayCode} (${d?.imei})?',
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
        final res = await FleetService.to.deleteGpsDevice(deviceId);
        if (res.success) {
          Get.back(); // Pop details screen
          Get.snackbar(
            'Deleted',
            'GPS Device deleted successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
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
        Get.snackbar('Error', 'Failed to delete: $e');
      }
    }
  }

  void goToEdit() async {
    final updated = await Get.toNamed(Routes.ADD_GPS, arguments: {'id': deviceId, 'device': device.value});
    if (updated != null) {
      fetchDeviceDetails();
    }
  }

  void goToAssign() async {
    final result = await Get.toNamed(Routes.ASSIGN_GPS, arguments: {'id': deviceId, 'gpsDevice': device.value});
    if (result != null) {
      fetchDeviceDetails();
    }
  }

  void goToVehicleDetails() {
    final vId = device.value?.vehicleId;
    if (vId != null && vId.toString().isNotEmpty) {
      Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {'id': vId.toString()});
    }
  }
}
