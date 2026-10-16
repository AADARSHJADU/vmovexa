import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/fleet_operator/fleet_list/controllers/fleet_list_controller.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class FleetDetailsController extends GetxController {
  final RxString fleetId = ''.obs;
  final Rxn<FleetDetailModel> fleet = Rxn<FleetDetailModel>();
  final RxList<VehicleItemModel> assignedVehicles = <VehicleItemModel>[].obs;

  final RxBool isLoading = true.obs;
  final RxBool isLoadingVehicles = false.obs;
  final RxBool isUpdatingStatus = false.obs;

  // Active Tab: 'overview' | 'vehicles' | 'activity'
  final RxString activeTab = 'overview'.obs;

  // Role permissions
  final RxBool isPlatformAdmin = false.obs;

  // Track if any modification occurred to reload list on back
  bool hasChanges = false;

  @override
  void onInit() {
    super.onInit();
    _checkRole();
    _parseArguments();
  }

  void _checkRole() {
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user != null) {
        final roleStr = (user.role ?? user.displayRole).toUpperCase();
        if (roleStr.contains('SUPER-ADMIN') || roleStr.contains('ADMIN') || roleStr.contains('ROOT')) {
          isPlatformAdmin.value = true;
        }
      }
    }
  }

  void _parseArguments() {
    final args = Get.arguments;
    if (args == null) {
      // Default fallback
      fleetId.value = 'FLT20240521001';
      fleet.value = FleetDetailModel(
        id: 'FLT20240521001',
        name: 'City Bus Fleet',
        status: 'active',
        assignedBuses: 24,
        activeDriversCount: 31,
      );
      isLoading.value = false;
      return;
    }

    if (args is Fleet) {
      fleetId.value = args.id;
      // Optimistic initial view while fetching latest from API
      fleet.value = FleetDetailModel(
        id: args.id,
        name: args.name,
        status: args.status.toLowerCase(),
        assignedBuses: args.vehiclesCount,
        activeDriversCount: args.driversCount,
      );
    } else if (args is FleetItemModel) {
      fleetId.value = args.id;
      fleet.value = FleetDetailModel(
        id: args.id,
        name: args.name,
        description: args.description,
        status: args.status.toLowerCase(),
        assignedBuses: args.vehicleCount,
        activeDriversCount: args.driverCount,
        depotName: args.depotName ?? 'Central Base Depot',
      );
    } else if (args is FleetDetailModel) {
      fleetId.value = args.id;
      fleet.value = args;
    } else if (args is Map) {
      fleetId.value = (args['id'] ?? '').toString();
    } else if (args is String) {
      fleetId.value = args;
    }

    if (fleetId.value.isNotEmpty) {
      loadFleetDetails();
      loadAssignedVehicles();
    } else {
      isLoading.value = false;
    }
  }

  Future<void> loadFleetDetails() async {
    if (fleet.value == null) {
      isLoading.value = true;
    }
    try {
      final res = await FleetService.to.getFleet(fleetId.value);
      if (res.success && res.data != null) {
        final data = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : <String, dynamic>{};
        fleet.value = FleetDetailModel.fromJson(data);
      }
    } catch (e) {
      debugPrint('Error loading fleet details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadAssignedVehicles() async {
    isLoadingVehicles.value = true;
    try {
      final res = await FleetService.to.getVehicles(limit: 50);
      if (res.success && res.data != null) {
        final currentFleetName = fleet.value?.name.trim().toLowerCase() ?? '';
        final currentId = fleetId.value.trim().toLowerCase();

        final filtered = res.data!.where((v) {
          final vFleetName = (v.fleetName ?? '').trim().toLowerCase();
          final matchesName = currentFleetName.isNotEmpty && vFleetName == currentFleetName;
          return matchesName || v.id == currentId;
        }).toList();

        assignedVehicles.assignAll(filtered);
      }
    } catch (e) {
      debugPrint('Error loading vehicles: $e');
    } finally {
      isLoadingVehicles.value = false;
    }
  }

  void switchTab(String tabKey) {
    activeTab.value = tabKey;
  }

  Future<void> toggleStatus(String newStatus) async {
    if (fleet.value == null) return;
    isUpdatingStatus.value = true;
    try {
      final res = await FleetService.to.updateFleetStatus(fleetId.value, newStatus);
      if (res.success) {
        hasChanges = true;
        Get.snackbar(
          'Status Updated',
          'Fleet operation set to ${newStatus.toUpperCase()}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        await loadFleetDetails();
      } else {
        Get.snackbar(
          'Update Failed',
          res.message ?? 'Failed to update fleet status',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not update status: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isUpdatingStatus.value = false;
    }
  }

  Future<void> approveFleet() async {
    if (fleet.value == null) return;
    isUpdatingStatus.value = true;
    try {
      final res = await FleetService.to.approveFleet(fleetId.value);
      if (res.success) {
        hasChanges = true;
        Get.snackbar(
          'Fleet Approved',
          'Fleet operation approved and activated!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        await loadFleetDetails();
      } else {
        Get.snackbar(
          'Approval Failed',
          res.message ?? 'Failed to approve fleet',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not approve fleet: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isUpdatingStatus.value = false;
    }
  }

  Future<void> rejectFleet(String reason) async {
    if (fleet.value == null) return;
    isUpdatingStatus.value = true;
    try {
      final res = await FleetService.to.rejectFleet(fleetId.value, reason);
      if (res.success) {
        hasChanges = true;
        Get.snackbar(
          'Fleet Rejected',
          'Fleet operation rejected.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
        await loadFleetDetails();
      } else {
        Get.snackbar(
          'Rejection Failed',
          res.message ?? 'Failed to reject fleet',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Could not reject fleet: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isUpdatingStatus.value = false;
    }
  }

  void showRejectDialog(BuildContext context) {
    final reasonController = TextEditingController(text: 'Requirements not fulfilled');

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF161926),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Reject Fleet Registration',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Please enter the rejection reason for this fleet operator:',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: reasonController,
                maxLines: 3,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Enter reason...',
                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF0D0F19),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF2E334D)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFFEF4444)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      final reason = reasonController.text.trim();
                      if (reason.isEmpty) return;
                      Get.back();
                      rejectFleet(reason);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEF4444),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Confirm Reject', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> goToEditFleet() async {
    final currentFleet = fleet.value;
    final result = await Get.toNamed(
      Routes.ADD_FLEET,
      arguments: currentFleet ?? {'id': fleetId.value},
    );
    if (result == true) {
      hasChanges = true;
      await loadFleetDetails();
      await loadAssignedVehicles();
    }
  }

  void goToAddVehicle() {
    Get.toNamed(Routes.ADD_VEHICLE, arguments: {
      'fleet_id': fleetId.value,
      'fleet_name': fleet.value?.name,
    });
  }

  void goToAddDriver() {
    Get.toNamed(Routes.ADD_DRIVER);
  }

  void goToAssignGps() {
    Get.toNamed(Routes.ASSIGN_GPS);
  }

  void backToFleetList() {
    Get.back(result: hasChanges);
  }
}
