import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class DriverDetailsController extends GetxController {
  final Rxn<DriverItemModel> driver = Rxn<DriverItemModel>();
  final RxBool isLoading = false.obs;
  final RxBool isActionLoading = false.obs;
  String driverId = '';

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is DriverItemModel) {
      driver.value = args;
      driverId = args.id;
      loadDriverDetails(driverId);
    } else if (args is Map) {
      driverId = (args['id'] ?? args['driverId'] ?? '').toString();
      if (args['driver'] is DriverItemModel) {
        driver.value = args['driver'] as DriverItemModel;
      }
      if (driverId.isNotEmpty) {
        loadDriverDetails(driverId);
      }
    } else if (args is String && args.isNotEmpty) {
      driverId = args;
      loadDriverDetails(driverId);
    }
  }

  Future<void> loadDriverDetails(String id) async {
    if (id.isEmpty) return;
    isLoading.value = true;
    try {
      final res = await FleetService.to.getDriver(id);
      if (res.success && res.data != null) {
        final data = res.data;
        if (data is Map<String, dynamic>) {
          driver.value = DriverItemModel.fromJson(data);
        } else if (data is Map) {
          driver.value = DriverItemModel.fromJson(Map<String, dynamic>.from(data));
        }
      } else {
        // Fallback: search in list
        final listRes = await FleetService.to.getDrivers(limit: 100);
        if (listRes.success && listRes.data != null) {
          final found = listRes.data!.firstWhereOrNull((d) => d.id == id);
          if (found != null) {
            driver.value = found;
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading driver details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleDutyStatus(String newStatus) async {
    if (driverId.isEmpty) return;
    isActionLoading.value = true;
    try {
      final res = await FleetService.to.updateDriverStatus(driverId, newStatus);
      if (res.success) {
        Get.snackbar(
          'Status Updated',
          'Driver duty status updated to ${newStatus.toUpperCase()}',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadDriverDetails(driverId);
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to update duty status',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isActionLoading.value = false;
    }
  }

  Future<void> verifyDriverDocs() async {
    if (driverId.isEmpty) return;
    isActionLoading.value = true;
    try {
      final res = await FleetService.to.verifyDriverDocuments(driverId);
      if (res.success) {
        Get.snackbar(
          'KYC Verified',
          'Driver KYC & Driving License documents have been verified.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadDriverDetails(driverId);
      } else {
        Get.snackbar(
          'Verification Failed',
          res.message ?? 'Failed to verify driver KYC documents',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isActionLoading.value = false;
    }
  }

  void confirmDeleteDriver() {
    final d = driver.value;
    final name = d?.name ?? 'this driver';
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Delete Driver Profile',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Text(
          'Are you sure you want to terminate & remove $name from the active drivers roster? This action cannot be undone.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              await _executeDeleteDriver();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Delete Driver', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _executeDeleteDriver() async {
    if (driverId.isEmpty) return;
    isActionLoading.value = true;
    try {
      final res = await FleetService.to.deleteDriver(driverId);
      if (res.success) {
        Get.back(result: true);
        Get.snackbar(
          'Driver Removed',
          'Driver has been successfully deleted from roster.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'Delete Failed',
          res.message ?? 'Could not delete driver profile',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isActionLoading.value = false;
    }
  }

  Future<void> goToEditDriver() async {
    if (driver.value == null) return;
    final result = await Get.toNamed(Routes.ADD_DRIVER, arguments: driver.value);
    if (result == true) {
      await loadDriverDetails(driverId);
    }
  }
}
