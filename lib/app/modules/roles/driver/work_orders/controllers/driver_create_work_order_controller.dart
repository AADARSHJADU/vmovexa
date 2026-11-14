import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/services/driver_service.dart';

class DriverCreateWorkOrderController extends GetxController {
  final RxBool isLoadingProfile = false.obs;
  final RxBool isSubmitting = false.obs;

  // Assigned Vehicle & Depot info
  final RxString assignedBusNumber = ''.obs;
  final RxString assignedVehicleId = ''.obs;
  final RxString assignedDepotName = ''.obs;
  final RxString assignedDepotId = ''.obs;
  final RxString assignedFleetName = ''.obs;
  final RxBool hasAssignedBus = false.obs;

  // Form selections
  final RxString selectedIssueCategory = 'Engine / Mechanical'.obs;
  final RxString selectedUrgency = 'normal'.obs; // critical, high, normal, low

  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController instructionsController = TextEditingController();

  final List<String> issueCategories = [
    'Engine / Mechanical',
    'Brakes / Steering',
    'Electrical / Battery',
    'Tyres / Wheels',
    'Body / Exterior Damage',
    'Air Conditioning / HVAC',
    'GPS / Tracking Device',
    'Display Screen / Media',
    'Fuel System',
    'Lights / Signals',
    'Doors / Windows',
    'Seats / Interior',
    'Other',
  ];

  final List<Map<String, String>> urgencyOptions = [
    {
      'value': 'critical',
      'label': 'Critical — Grounded (2-4h SLA)',
      'badge': '2-4h SLA',
    },
    {
      'value': 'high',
      'label': 'High — Needs repair soon (12h SLA)',
      'badge': '12h SLA',
    },
    {
      'value': 'normal',
      'label': 'Normal — Scheduled repair (24h SLA)',
      'badge': '24h SLA',
    },
    {
      'value': 'low',
      'label': 'Low — Minor / Cosmetic (48h SLA)',
      'badge': '48h SLA',
    },
  ];

  @override
  void onInit() {
    super.onInit();
    loadDriverProfile();
  }

  @override
  void onClose() {
    descriptionController.dispose();
    instructionsController.dispose();
    super.onClose();
  }

  Future<void> loadDriverProfile() async {
    isLoadingProfile.value = true;
    try {
      final res = await DriverService.to.getProfile();
      if (res.success && res.data != null) {
        final profile = res.data!;
        final vehicle = profile.assignedVehicle;
        if (vehicle != null && (vehicle.registrationNumber?.isNotEmpty == true || vehicle.id?.isNotEmpty == true)) {
          assignedBusNumber.value = vehicle.registrationNumber ?? 'Bus #${vehicle.id}';
          assignedVehicleId.value = vehicle.id ?? '';
          assignedFleetName.value = profile.organization?.name ?? 'VMOVEXA Fleet';
          assignedDepotName.value = 'Central Maintenance Depot';
          hasAssignedBus.value = true;
        } else {
          hasAssignedBus.value = false;
        }
      }
    } catch (e) {
      debugPrint('Error loading driver vehicle profile: $e');
    } finally {
      isLoadingProfile.value = false;
    }
  }

  void selectCategory(String cat) {
    selectedIssueCategory.value = cat;
  }

  void selectUrgency(String urg) {
    selectedUrgency.value = urg;
  }

  Future<void> submitWorkOrder() async {
    final desc = descriptionController.text.trim();
    if (desc.isEmpty) {
      Get.snackbar(
        'required_field'.tr,
        'enter_issue_description'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      final res = await DriverService.to.reportDriverWorkOrder(
        description: desc,
        issueCategory: selectedIssueCategory.value,
        priority: selectedUrgency.value,
        vehicleId: assignedVehicleId.value.isNotEmpty ? assignedVehicleId.value : null,
      );

      if (res.success) {
        Get.snackbar(
          'success'.tr,
          'work_order_created_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );
        await Future.delayed(const Duration(milliseconds: 500));
        Get.back(result: true);
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_to_submit_request'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint('Error creating work order: $e');
      Get.snackbar(
        'error'.tr,
        'failed_to_submit_request'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }
}

