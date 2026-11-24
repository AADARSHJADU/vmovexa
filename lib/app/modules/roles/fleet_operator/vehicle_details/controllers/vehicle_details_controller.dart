import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class VehicleDetailsController extends GetxController {
  final Rx<VehicleItemModel?> vehicle = Rx<VehicleItemModel?>(null);
  final RxBool isLoading = true.obs;
  final RxBool isDeleting = false.obs;
  String? vehicleId;

  // Resolved Driver Details
  final RxnString resolvedDriverPhone = RxnString();
  final RxnString resolvedDriverName = RxnString();
  final RxnString resolvedDriverEmpId = RxnString();

  // Convenient Getters for UI
  String get registrationNumber => vehicle.value?.registrationNumber ?? 'N/A';
  String get fleetName => vehicle.value?.fleetName ?? 'General Fleet';
  String get modelName {
    final v = vehicle.value;
    if (v == null) return 'Transit Bus';
    final full = '${v.make} ${v.model}'.trim();
    return full.isNotEmpty ? full : (v.vehicleType.isNotEmpty ? v.vehicleType : 'Standard Bus');
  }
  String get vin => (vehicle.value?.vin != null && vehicle.value!.vin.isNotEmpty) ? vehicle.value!.vin : '—';
  String get vehicleType => vehicle.value?.vehicleType ?? 'Non-Sleeper';
  String get fuelType => vehicle.value?.fuelType ?? 'electric';
  String get status => vehicle.value?.status ?? 'active';
  int get capacity => vehicle.value?.capacity ?? 42;
  String get depotName => vehicle.value?.depotName ?? 'Central Depot';
  String get assignedRoute => vehicle.value?.assignedRoute ?? 'Route 101: Indiranagar - Majestic';
  String get source => (vehicle.value?.source != null && vehicle.value!.source!.isNotEmpty) ? vehicle.value!.source! : 'Indiranagar Central';
  String get destination => (vehicle.value?.destination != null && vehicle.value!.destination!.isNotEmpty) ? vehicle.value!.destination! : 'Kempegowda Bus Station';
  String get driverName =>
      resolvedDriverName.value ?? vehicle.value?.assignedDriverName ?? 'No Driver Assigned';
  String? get driverPhone =>
      resolvedDriverPhone.value ?? vehicle.value?.driverPhone;
  String? get driverEmpId =>
      resolvedDriverEmpId.value ?? vehicle.value?.driverEmpId;
  String get gpsDeviceId => vehicle.value?.gpsDeviceId ?? 'GPS-TRK-00123';
  double? get speedKmh => vehicle.value?.speedKmh;
  int? get batterySocPct => vehicle.value?.batterySocPct;
  List<FleetDocumentModel> get documents => vehicle.value?.documents ?? [];
  List<String> get photos => vehicle.value?.photos ?? [];

  int get totalDisplays => vehicle.value?.displaysCount ?? 6;
  int get leftDisplays => vehicle.value?.leftDisplays ?? 2;
  int get rightDisplays => vehicle.value?.rightDisplays ?? 2;
  int get rearDisplays => vehicle.value?.rearDisplays ?? 1;
  int get emergencyDisplays => vehicle.value?.emergencyDisplays ?? 1;

  @override
  void onInit() {
    super.onInit();
    _handleArguments();
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args == null) {
      isLoading.value = false;
      return;
    }

    if (args is VehicleItemModel) {
      vehicle.value = args;
      vehicleId = args.id;
      loadVehicleDetails();
    } else if (args is Map) {
      final mapArgs = Map<String, dynamic>.from(args);
      if (mapArgs['vehicle'] is VehicleItemModel) {
        vehicle.value = mapArgs['vehicle'] as VehicleItemModel;
      } else if (mapArgs['vehicle'] is Map) {
        vehicle.value = VehicleItemModel.fromJson(Map<String, dynamic>.from(mapArgs['vehicle']));
      }
      vehicleId = (mapArgs['vehicleId'] ?? mapArgs['id'])?.toString();
      loadVehicleDetails();
    } else if (args is String && args.isNotEmpty) {
      vehicleId = args;
      loadVehicleDetails();
    } else {
      isLoading.value = false;
    }
  }

  Future<void> loadVehicleDetails() async {
    if (vehicleId == null || vehicleId!.isEmpty) {
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    try {
      final res = await FleetService.to.getVehicle(vehicleId!);
      if (res.success && res.data != null) {
        if (res.data is VehicleItemModel) {
          vehicle.value = res.data;
        } else if (res.data is Map) {
          final map = Map<String, dynamic>.from(res.data as dynamic);
          if (map['vehicle'] is Map) {
            vehicle.value = VehicleItemModel.fromJson(Map<String, dynamic>.from(map['vehicle']));
          } else {
            vehicle.value = VehicleItemModel.fromJson(map);
          }
        }
      }

      final v = vehicle.value;
      if (v != null) {
        if (v.driverPhone != null && v.driverPhone!.isNotEmpty) {
          resolvedDriverPhone.value = v.driverPhone;
        }
        if (v.assignedDriverName != null && v.assignedDriverName!.isNotEmpty) {
          resolvedDriverName.value = v.assignedDriverName;
        }
        if (v.driverEmpId != null && v.driverEmpId!.isNotEmpty) {
          resolvedDriverEmpId.value = v.driverEmpId;
        }

        final dId = v.assignedDriverId?.toString();
        if ((resolvedDriverPhone.value == null || resolvedDriverPhone.value!.isEmpty) &&
            dId != null &&
            dId.isNotEmpty) {
          _fetchDriverDetails(dId);
        }
      }
    } catch (e) {
      debugPrint('Error loading vehicle details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchDriverDetails(String dId) async {
    try {
      final dRes = await FleetService.to.getDriver(dId);
      if (dRes.success && dRes.data != null) {
        if (dRes.data is DriverItemModel) {
          final d = dRes.data as DriverItemModel;
          if (d.phone.isNotEmpty) resolvedDriverPhone.value = d.phone;
          if (d.name.isNotEmpty) resolvedDriverName.value = d.name;
          if (d.empId.isNotEmpty) resolvedDriverEmpId.value = d.empId;
        } else if (dRes.data is Map) {
          final map = Map<String, dynamic>.from(dRes.data as dynamic);
          final dObj = map['driver'] is Map ? map['driver'] : (map['data'] is Map ? map['data'] : map);
          final phone = dObj['phone']?.toString() ??
              dObj['phoneNumber']?.toString() ??
              dObj['phone_number']?.toString() ??
              dObj['mobile']?.toString() ??
              dObj['contact_number']?.toString() ??
              dObj['user']?['phone']?.toString();
          final name = dObj['name']?.toString() ??
              dObj['full_name']?.toString() ??
              dObj['user']?['name']?.toString();
          final emp = dObj['emp_id']?.toString() ??
              dObj['badge_id']?.toString() ??
              dObj['code']?.toString();

          if (phone != null && phone.isNotEmpty) resolvedDriverPhone.value = phone;
          if (name != null && name.isNotEmpty) resolvedDriverName.value = name;
          if (emp != null && emp.isNotEmpty) resolvedDriverEmpId.value = emp;
        }
      }
    } catch (_) {
      // Non-critical fallback
    }
  }

  Future<void> goToEditVehicle() async {
    final id = vehicleId ?? vehicle.value?.id;
    if (id == null || id.isEmpty) return;

    final res = await Get.toNamed(Routes.ADD_VEHICLE, arguments: {
      'id': id,
      'vehicleId': id,
      'vehicle': vehicle.value,
    });
    if (res == true) {
      await loadVehicleDetails();
    }
  }

  Future<void> confirmDeleteVehicle() async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 8),
            Text(
              'delete_vehicle'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'delete_vehicle_confirm_desc'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () => Get.back(result: true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('delete_btn'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _executeDeleteVehicle();
    }
  }

  Future<void> _executeDeleteVehicle() async {
    final idToDelete = vehicleId ?? vehicle.value?.id;
    if (idToDelete == null || idToDelete.isEmpty) return;

    isDeleting.value = true;
    try {
      final res = await FleetService.to.deleteVehicle(idToDelete);
      if (res.success) {
        Get.back(result: true);
        Get.snackbar(
          'vehicle_deleted'.tr,
          'vehicle_deleted_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to delete vehicle',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      isDeleting.value = false;
    }
  }

  void startLiveTracking() {
    Get.toNamed(Routes.LIVE_TRACKING, arguments: {
      'vehicleName': registrationNumber,
      'fleetName': fleetName,
      'vehicleId': vehicleId,
    });
  }

  Future<void> callDriver() async {
    // If phone is missing, try to fetch driver if ID is present
    if ((driverPhone == null || driverPhone!.trim().isEmpty) &&
        vehicle.value?.assignedDriverId != null) {
      await _fetchDriverDetails(vehicle.value!.assignedDriverId.toString());
    }

    final rawPhone = driverPhone ?? '';
    final cleanPhone = rawPhone.replaceAll(RegExp(r'[^\d+]'), '');

    if (cleanPhone.isEmpty) {
      Get.snackbar(
        'driver'.tr,
        'driver_contact_not_available'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        icon: const Icon(Icons.phone_disabled_rounded, color: Colors.white),
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    final uri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {
      try {
        await launchUrl(uri);
      } catch (e) {
        Get.snackbar(
          'calling_driver'.tr,
          'dialing_driver_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
        );
      }
    }
  }
}
