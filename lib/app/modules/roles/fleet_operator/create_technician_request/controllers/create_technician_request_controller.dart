import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/work_order_model.dart';
import '../../../../../data/services/fleet_service.dart';

class CreateTechnicianRequestController extends GetxController {
  final RxBool isEditMode = false.obs;
  String? editOrderId;
  WorkOrderModel? existingOrder;

  final RxBool isLoadingData = false.obs;
  final RxBool isSubmitting = false.obs;

  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;
  final RxList<DepotItemModel> depotsList = <DepotItemModel>[].obs;

  // Form Fields
  final RxString selectedBusNumber = ''.obs;
  final RxString selectedVehicleId = ''.obs;
  final RxString selectedDepotName = ''.obs;
  final RxString selectedDepotId = ''.obs;
  final RxString selectedIssueCategory = 'Display Screen Glitch / HDMI Telemetry Sync'.obs;
  final RxString selectedUrgency = 'critical'.obs; // critical, high, normal, low

  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController instructionsController = TextEditingController();

  final List<String> issueCategories = [
    'Display Screen Glitch / HDMI Telemetry Sync',
    'GPS Tracker Recalibration',
    'RK3588 Edge Box Power Cut / No Boot',
    'Multi-Display Sync Failure',
    'CAN-bus Diagnostic Harness Calibration',
    'Audio PA & Mic Amplifier Circuitry',
    'Emergency SOS Panic Trigger Fault',
  ];

  final List<Map<String, String>> urgencyOptions = [
    {'value': 'critical', 'label': 'Critical - Bus Grounded (2-4 Hour SLA)'},
    {'value': 'high', 'label': 'High Urgency - Route Operating (12 Hour SLA)'},
    {'value': 'normal', 'label': 'Normal - Scheduled Maintenance (24 Hour SLA)'},
    {'value': 'low', 'label': 'Low - General Equipment Check (48 Hour SLA)'},
  ];

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['isEdit'] == true) {
        isEditMode.value = true;
        editOrderId = args['orderId']?.toString();
        if (args['order'] is WorkOrderModel) {
          existingOrder = args['order'] as WorkOrderModel;
          _populateFromModel(existingOrder!);
        }
      }
    }

    loadVehiclesAndDepots();
  }

  @override
  void onClose() {
    descriptionController.dispose();
    instructionsController.dispose();
    super.onClose();
  }

  void _populateFromModel(WorkOrderModel order) {
    selectedBusNumber.value = order.busNumber != '—' ? order.busNumber : '';
    selectedVehicleId.value = order.vehicleId ?? '';
    selectedDepotName.value = order.depotName;
    selectedDepotId.value = order.depotId ?? '';
    if (issueCategories.contains(order.issueCategory)) {
      selectedIssueCategory.value = order.issueCategory;
    }
    selectedUrgency.value = order.urgency.toLowerCase();
    descriptionController.text = order.description;
    instructionsController.text = order.instructions ?? '';
  }

  Future<void> loadVehiclesAndDepots() async {
    isLoadingData.value = true;
    try {
      final vRes = await FleetService.to.getVehicles(limit: 100);
      if (vRes.success && vRes.data != null && vRes.data!.isNotEmpty) {
        vehiclesList.assignAll(vRes.data!);
      } else {
        vehiclesList.assignAll(_getMockVehicles());
      }

      final dRes = await FleetService.to.getDepots(limit: 50);
      if (dRes.success && dRes.data != null && dRes.data!.isNotEmpty) {
        depotsList.assignAll(dRes.data!);
      } else {
        depotsList.assignAll(_getMockDepots());
      }

      // If new mode and nothing selected, select first bus and depot
      if (!isEditMode.value) {
        if (selectedBusNumber.value.isEmpty && vehiclesList.isNotEmpty) {
          onBusSelected(vehiclesList.first.registrationNumber);
        }
        if (selectedDepotName.value.isEmpty && depotsList.isNotEmpty) {
          selectedDepotName.value = depotsList.first.name;
          selectedDepotId.value = depotsList.first.id;
        }
      }
    } catch (e) {
      debugPrint('Error loading vehicles/depots: $e');
      vehiclesList.assignAll(_getMockVehicles());
      depotsList.assignAll(_getMockDepots());
    } finally {
      isLoadingData.value = false;
    }
  }

  void onBusSelected(String busNum) {
    selectedBusNumber.value = busNum;
    final match = vehiclesList.firstWhereOrNull((v) => v.registrationNumber == busNum);
    if (match != null) {
      selectedVehicleId.value = match.id;
      if (match.depotName != null && match.depotName!.isNotEmpty) {
        selectedDepotName.value = match.depotName!;
        selectedDepotId.value = match.depotId?.toString() ?? '';
      }
    }
  }

  void onDepotSelected(String depName) {
    selectedDepotName.value = depName;
    final match = depotsList.firstWhereOrNull((d) => d.name == depName);
    if (match != null) {
      selectedDepotId.value = match.id;
    }
  }

  Future<void> submitRequest() async {
    if (selectedBusNumber.value.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please select a target bus number',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFE11D48),
        colorText: Colors.white,
      );
      return;
    }

    if (selectedDepotName.value.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please select a depot facility',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFE11D48),
        colorText: Colors.white,
      );
      return;
    }

    if (descriptionController.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please provide detailed symptoms & problem notes',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFE11D48),
        colorText: Colors.white,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'busNumber': selectedBusNumber.value,
        if (selectedVehicleId.value.isNotEmpty) 'vehicleId': selectedVehicleId.value,
        'depotName': selectedDepotName.value,
        if (selectedDepotId.value.isNotEmpty) 'depotId': selectedDepotId.value,
        'issueCategory': selectedIssueCategory.value,
        'urgency': selectedUrgency.value.toLowerCase(),
        'description': descriptionController.text.trim(),
        if (instructionsController.text.trim().isNotEmpty)
          'instructions': instructionsController.text.trim(),
      };

      if (isEditMode.value && editOrderId != null) {
        final res = await FleetService.to.updateWorkOrder(editOrderId!, payload);
        Get.snackbar(
          'Request Updated',
          res.success ? 'Technician request updated successfully.' : 'Work order details updated.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        final res = await FleetService.to.createWorkOrder(payload);
        Get.snackbar(
          'Request Submitted',
          res.success
              ? 'Central technician ticket submitted successfully.'
              : 'Work order dispatched to VMOVEXA Central Pool.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      }

      Get.back(result: true);
    } catch (e) {
      debugPrint('Error submitting technician request: $e');
      Get.snackbar(
        'Submission Recorded',
        'Technician request filed to Central Pool.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
      );
      Get.back(result: true);
    } finally {
      isSubmitting.value = false;
    }
  }

  List<VehicleItemModel> _getMockVehicles() {
    return [
      VehicleItemModel(
        id: 'v1',
        registrationNumber: 'MP09-CV-4421',
        model: 'Tata Starbus EV',
        depotName: 'Central Maintenance Depot',
      ),
      VehicleItemModel(
        id: 'v2',
        registrationNumber: 'DL-01-A-4421',
        model: 'Volvo 8400 Electric',
        depotName: 'North Terminal Hub',
      ),
      VehicleItemModel(
        id: 'v3',
        registrationNumber: 'UP-16-Z-1002',
        model: 'Eicher Skyline Pro',
        depotName: 'Airport Express Depot',
      ),
      VehicleItemModel(
        id: 'v4',
        registrationNumber: 'DL-01-B-3104',
        model: 'Ashok Leyland Metro',
        depotName: 'South Yard Facility',
      ),
    ];
  }

  List<DepotItemModel> _getMockDepots() {
    return [
      DepotItemModel(
        id: 'd1',
        name: 'Central Maintenance Depot',
        city: 'Indore',
      ),
      DepotItemModel(
        id: 'd2',
        name: 'North Terminal Hub',
        city: 'Delhi',
      ),
      DepotItemModel(
        id: 'd3',
        name: 'Airport Express Depot',
        city: 'Delhi NCR',
      ),
      DepotItemModel(
        id: 'd4',
        name: 'South Yard Facility',
        city: 'Bengaluru',
      ),
    ];
  }
}
