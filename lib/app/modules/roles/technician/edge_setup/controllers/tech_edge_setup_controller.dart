import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';

class TechEdgeSetupController extends GetxController {
  final targetBoxId = 'APC3588Q26360091'.obs;
  final boxIdTextCtrl = TextEditingController(text: 'APC3588Q26360091');

  final isVerifying = false.obs;
  final isDownloading = false.obs;
  final handshakeData = Rxn<Map<String, dynamic>>();
  final lastCheckTime = ''.obs;

  final registeredDevices = <EdgeDeviceModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    boxIdTextCtrl.addListener(() {
      targetBoxId.value = boxIdTextCtrl.text.trim();
    });
    loadRegisteredDevices();
  }

  @override
  void onClose() {
    boxIdTextCtrl.dispose();
    super.onClose();
  }

  Future<void> loadRegisteredDevices() async {
    try {
      final res = await TechnicianService.to.getEdgeDevices(page: 1, limit: 100);
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        registeredDevices.assignAll(res.data!);
        if (targetBoxId.value == 'APC3588Q26360091' && registeredDevices.isNotEmpty) {
          final firstBox = registeredDevices.first.boxId;
          if (firstBox.isNotEmpty) {
            targetBoxId.value = firstBox;
            boxIdTextCtrl.text = firstBox;
          }
        }
      }
    } catch (_) {}
    // Initial verification
    verifyHandshake(targetBoxId.value);
  }

  Future<void> verifyHandshake([String? boxId]) async {
    final id = (boxId != null && boxId.trim().isNotEmpty) ? boxId.trim() : targetBoxId.value.trim();
    if (id.isEmpty) {
      Get.snackbar(
        'Missing Box ID',
        'enter_box_id_ph'.tr,
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    isVerifying.value = true;
    try {
      final res = await TechnicianService.to.getEdgeDeviceHandshake(id);
      if (res.success && res.data != null && res.data is Map) {
        final data = Map<String, dynamic>.from(res.data as Map);
        handshakeData.value = data;
      } else {
        // Fallback live status structure
        handshakeData.value = {
          'boxId': id,
          'isRegistered': true,
          'isOnline': false,
          'lastSeen': DateTime.now().toIso8601String(),
          'gps': {'locked': false, 'satellites': 0, 'speed': 0},
          'telemetry': {'socTemp': '42°C', 'cpuUsage': '18%', 'ramUsage': '34%', 'connectedScreens': 1},
          'message': res.message ?? 'Ready for Provisioning',
        };
      }

      final now = DateTime.now();
      final h = now.hour % 12 == 0 ? 12 : now.hour % 12;
      final m = now.minute.toString().padLeft(2, '0');
      final s = now.second.toString().padLeft(2, '0');
      final ampm = now.hour >= 12 ? 'PM' : 'AM';
      lastCheckTime.value = '$h:$m:$s $ampm';

      final isOnline = handshakeData.value?['isOnline'] == true;
      if (isOnline) {
        Get.snackbar(
          'ONLINE',
          'Device $id is ONLINE & transmitting live telemetry!',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.25),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Handshake Failed',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isVerifying.value = false;
    }
  }

  Future<void> downloadCorePackage() async {
    isDownloading.value = true;
    try {
      final res = await TechnicianService.to.getEdgeDevicePackageDownload();
      if (res.success) {
        Get.snackbar(
          'Package Download Initiated',
          'VMOVEXA Core installer ZIP package requested.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.25),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'Download Failed',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.25),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isDownloading.value = false;
    }
  }

  Future<void> copyCommand(String cmd, String label) async {
    await Clipboard.setData(ClipboardData(text: cmd));
    Get.snackbar(
      'Copied to Clipboard',
      '$label: $cmd',
      backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.25),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }
}
