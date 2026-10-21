import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class AssignGpsController extends GetxController {
  final searchController = TextEditingController();
  final RxString searchPattern = ''.obs;
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;

  // Context: Assigning Vehicle to GPS Device (Admin panel flow)
  final Rxn<GpsDeviceModel> device = Rxn<GpsDeviceModel>();
  String deviceId = '';

  // Vehicle list & selection
  final RxList<VehicleItemModel> vehicles = <VehicleItemModel>[].obs;
  final Rxn<String> selectedVehicleId = Rxn<String>();

  // Context: Assigning GPS to Vehicle (Onboarding flow fallback)
  final RxList<GpsDeviceModel> availableGpsDevices = <GpsDeviceModel>[].obs;
  final Rxn<GpsDeviceModel> selectedGps = Rxn<GpsDeviceModel>();
  String vehicleName = '';
  String fleetName = '';
  String vehicleType = '';
  String driverName = '';
  dynamic vehicleId;
  bool isVehicleOnboardingFlow = false;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;

    if (args is Map) {
      if (args['gpsDevice'] is GpsDeviceModel) {
        device.value = args['gpsDevice'] as GpsDeviceModel;
        deviceId = device.value!.id.toString();
        if (device.value!.vehicleId != null) {
          selectedVehicleId.value = device.value!.vehicleId.toString();
        }
      } else if (args['id'] != null) {
        deviceId = args['id'].toString();
      }

      vehicleName = args['vehicleName']?.toString() ?? '';
      fleetName = args['fleetName']?.toString() ?? '';
      vehicleType = args['vehicleType']?.toString() ?? '';
      driverName = args['driverName']?.toString() ?? '';
      vehicleId = args['vehicleId'];

      if (deviceId.isEmpty && vehicleName.isNotEmpty) {
        isVehicleOnboardingFlow = true;
      }
    }

    searchController.addListener(() {
      searchPattern.value = searchController.text.trim().toLowerCase();
    });

    _loadData();
  }

  Future<void> _loadData() async {
    isLoading.value = true;
    try {
      if (isVehicleOnboardingFlow) {
        // Load available GPS units
        final res = await FleetService.to.getGpsDevices(status: 'available');
        if (res.success && res.data != null) {
          availableGpsDevices.assignAll(res.data!);
        }
      } else {
        // Load target GPS unit & all fleet vehicles
        final results = await Future.wait([
          if (device.value == null && deviceId.isNotEmpty)
            FleetService.to.getGpsDevice(deviceId)
          else
            Future.value(null),
          FleetService.to.getVehicles(limit: 100),
        ]);

        final gpsRes = results[0];
        if (gpsRes != null && gpsRes.success && gpsRes.data != null) {
          device.value = gpsRes.data as GpsDeviceModel;
          if (device.value!.vehicleId != null) {
            selectedVehicleId.value = device.value!.vehicleId.toString();
          }
        }

        final vehiclesRes = results[results.length - 1];
        if (vehiclesRes != null && vehiclesRes.success && vehiclesRes.data != null) {
          vehicles.assignAll(vehiclesRes.data as List<VehicleItemModel>);
        }
      }
    } catch (e) {
      debugPrint('Error loading assign GPS data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  // Filtered vehicles for Admin Assign flow
  List<VehicleItemModel> get filteredVehicles {
    final q = searchPattern.value;
    if (q.isEmpty) return vehicles;
    return vehicles.where((v) {
      return v.busNumber.toLowerCase().contains(q) ||
          v.registrationNumber.toLowerCase().contains(q) ||
          v.model.toLowerCase().contains(q) ||
          (v.depotName?.toLowerCase().contains(q) ?? false) ||
          v.code.toLowerCase().contains(q);
    }).toList();
  }

  // Filtered devices for Onboarding flow
  List<GpsDeviceModel> get filteredDevices {
    final q = searchPattern.value;
    if (q.isEmpty) return availableGpsDevices;
    return availableGpsDevices.where((g) {
      return g.displayCode.toLowerCase().contains(q) ||
          g.imei.toLowerCase().contains(q) ||
          g.model.toLowerCase().contains(q) ||
          g.vendor.toLowerCase().contains(q);
    }).toList();
  }

  void selectVehicle(VehicleItemModel v) {
    selectedVehicleId.value = v.id.toString();
  }

  void selectGps(GpsDeviceModel g) {
    selectedGps.value = g;
  }

  // Assign GPS Device to selected vehicle (Admin panel flow)
  Future<void> handleAssign() async {
    if (selectedVehicleId.value == null || selectedVehicleId.value!.isEmpty) {
      Get.snackbar(
        'Selection Required',
        'Please select a fleet vehicle to assign this GPS unit.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.amber.shade800,
        colorText: Colors.white,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      final res = await FleetService.to.assignGpsVehicle(deviceId, selectedVehicleId.value);
      if (res.success) {
        Get.back(result: true);
        Get.snackbar(
          'Assignment Successful',
          'GPS Device successfully assigned and activated!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to assign GPS device',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar('Error', 'Assignment failed: $e');
    } finally {
      isSubmitting.value = false;
    }
  }

  // Unassign GPS Device from current vehicle (Admin panel flow)
  Future<void> handleUnassign() async {
    final d = device.value;
    final busLabel = d?.vehicle?.busNumber.isNotEmpty == true
        ? d!.vehicle!.busNumber
        : (d?.vehicleId != null ? 'Bus #${d!.vehicleId}' : 'current vehicle');

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF161922),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Unassign GPS Tracker', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Unassign GPS device ${d?.displayCode} from $busLabel?',
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber.shade700),
            onPressed: () => Get.back(result: true),
            child: const Text('Unassign', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      isSubmitting.value = true;
      try {
        final res = await FleetService.to.assignGpsVehicle(deviceId, null);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'GPS Unassigned',
            'GPS device unassigned from vehicle!',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
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
        Get.snackbar('Error', 'Unassignment failed: $e');
      } finally {
        isSubmitting.value = false;
      }
    }
  }

  // Onboarding flow confirm
  void confirmAssignment() async {
    if (selectedGps.value == null) {
      Get.snackbar(
        'Selection Required',
        'Please select a GPS device by clicking on its card, or register a new one.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.amber.shade800,
        colorText: Colors.white,
      );
      return;
    }

    if (vehicleId != null) {
      isSubmitting.value = true;
      try {
        await FleetService.to.assignGpsVehicle(selectedGps.value!.id.toString(), vehicleId.toString());
      } catch (_) {}
      isSubmitting.value = false;
    }

    Get.toNamed(Routes.SETUP_COMPLETE, arguments: {
      'fleetName': fleetName,
      'vehicleName': vehicleName,
      'driverName': driverName,
      'gpsName': selectedGps.value!.displayCode,
    });
  }

  void skipForNow() {
    Get.toNamed(Routes.SETUP_COMPLETE, arguments: {
      'fleetName': fleetName,
      'vehicleName': vehicleName,
      'driverName': driverName,
      'gpsName': 'None Connected',
    });
  }

  void goToAddGps() async {
    final result = await Get.toNamed(Routes.ADD_GPS);
    if (result == true) {
      _loadData();
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
