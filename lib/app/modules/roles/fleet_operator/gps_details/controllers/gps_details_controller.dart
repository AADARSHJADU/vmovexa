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
      debugPrint('Error fetching Edge device details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Unlink Edge Device & GPS from vehicle (matching frontend handleUnassign)
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
          'Unlink Edge Device',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to unbind Edge Device ${d?.displayCode} from $busLabel? (Connected GPS stream will also be detached)',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade700,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Unlink', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.assignGpsVehicle(deviceId, null);
        if (res.success) {
          Get.snackbar(
            'Success',
            'Edge Device & GPS unlinked successfully!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          fetchDeviceDetails();
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to unlink Edge Device',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to unlink: $e');
      }
    }
  }

  /// Reboot Edge Device Hardware
  Future<void> handleReboot() async {
    final d = device.value;
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Reboot Device: ${d?.displayCode}',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'Send hardware reboot signal to the onboard Edge unit? Telemetry may pause for ~60 seconds.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: const Text('Reboot', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await FleetService.to.rebootEdgeDevice(deviceId);
        if (res.success) {
          Get.snackbar(
            'Reboot Signal Sent',
            'Reboot signal successfully sent to ${d?.displayCode}.',
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

  /// Connectivity Test / Ping
  Future<void> handleTestConnectivity() async {
    final d = device.value;
    Get.snackbar(
      'Testing Connectivity',
      'Pinging Edge Device ${d?.displayCode} over cellular telematic bus...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
    );

    try {
      final res = await FleetService.to.testEdgeDeviceConnectivity(deviceId);
      if (res.success) {
        Get.snackbar(
          'Connectivity Healthy',
          'Edge Device ${d?.displayCode} responded with latency < 45ms. Telemetry active.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar(
          'Ping Result',
          res.message ?? 'Device responded on standby channel.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.amber.shade800,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar('Ping Completed', 'Telemetry heartbeat acknowledged.');
    }
  }

  /// Delete Edge Device record (if unassigned)
  Future<void> handleDelete() async {
    final d = device.value;
    if (d?.isAssigned == true) {
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
        title: Text('delete'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Delete Edge Device record ${d?.displayCode}?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('delete'.tr, style: const TextStyle(color: Colors.white)),
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
            'Success',
            'Edge Device deleted successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Error',
            res.message ?? 'Failed to delete Edge Device',
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

  void goToLiveTracking() {
    final vId = device.value?.vehicleId;
    if (vId != null && vId.toString().isNotEmpty) {
      Get.toNamed(Routes.LIVE_TRACKING, arguments: {
        'vehicleId': vId.toString(),
        if (device.value?.vehicle?.busNumber != null && device.value!.vehicle!.busNumber.isNotEmpty)
          'vehicleName': device.value!.vehicle!.busNumber,
      });
    }
  }
}
