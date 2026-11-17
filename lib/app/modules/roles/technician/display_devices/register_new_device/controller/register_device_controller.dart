import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/data/models/api_response_model.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import '../../controller/display_devices_controller.dart';
import '../../../technician_dashboard/controller/technician_dashboard_controller.dart';
import '../view/register_device_view.dart';
import '../view/registration_success_view.dart';

class RegisterDeviceController extends GetxController {
  // ---------------- Mode Variables ----------------
  final RxBool isEditMode = false.obs;
  final Rxn<dynamic> editingDeviceId = Rxn<dynamic>();

  // ---------------- Form Controllers ----------------
  final boxIdCtrl = TextEditingController();
  final macCtrl = TextEditingController();
  final agentVersionCtrl = TextEditingController(text: 'v2.4.1');
  final simNetworkCtrl = TextEditingController(text: 'Airtel 4G IoT');

  // ---------------- State Variables ----------------
  final RxBool isActive = true.obs;
  final RxBool isSaving = false.obs;
  final RxBool isLoadingLookups = false.obs;
  final RxnString boxIdError = RxnString();
  final RxnString orgError = RxnString();

  // ---------------- Reference Datasets (Admin Parity) ----------------
  final RxList<OrganizationItemModel> organizations = <OrganizationItemModel>[].obs;
  final RxList<FleetItemModel> fleets = <FleetItemModel>[].obs;
  final RxList<VehicleItemModel> vehicles = <VehicleItemModel>[].obs;
  final RxList<DepotItemModel> depots = <DepotItemModel>[].obs;

  // ---------------- Cascading Selection States ----------------
  // 1. Organization -> 2. Fleet -> 3. Vehicle -> Auto Depot
  final Rxn<dynamic> selectedOrganizationId = Rxn<dynamic>();
  final Rxn<dynamic> selectedFleetId = Rxn<dynamic>();
  final Rxn<dynamic> selectedVehicleId = Rxn<dynamic>();
  final Rxn<dynamic> selectedDepotId = Rxn<dynamic>();

  // ---------------- Success Information ----------------
  final Rxn<DateTime> registeredOnDateTime = Rxn<DateTime>();
  final RxString registeredDeviceBoxId = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _checkEditMode();
    boxIdCtrl.addListener(() {
      if (boxIdCtrl.text.trim().isNotEmpty && boxIdError.value != null) {
        boxIdError.value = null;
      }
    });
    loadReferenceData();
  }

  @override
  void onClose() {
    boxIdCtrl.dispose();
    macCtrl.dispose();
    agentVersionCtrl.dispose();
    simNetworkCtrl.dispose();
    super.onClose();
  }

  // ---------------- Detect Edit Mode from Arguments ----------------
  void _checkEditMode() {
    final args = Get.arguments;
    if (args == null) return;

    if (args is EdgeDeviceModel) {
      _populateFromDevice(args);
    } else if (args is Map) {
      _populateFromMap(Map<String, dynamic>.from(args));
    }
  }

  void _populateFromDevice(EdgeDeviceModel d) {
    isEditMode.value = true;
    editingDeviceId.value = d.id;
    boxIdCtrl.text = d.boxId;
    macCtrl.text = d.mac;
    agentVersionCtrl.text = d.agentVersion.isNotEmpty ? d.agentVersion : 'v2.4.1';
    simNetworkCtrl.text = d.simNetwork.isNotEmpty ? d.simNetwork : 'Airtel 4G IoT';
    isActive.value = d.isActive;

    if (d.vehicleId != null) {
      selectedVehicleId.value = d.vehicleId;
    }
    if (d.depotId != null) {
      selectedDepotId.value = d.depotId;
    }
  }

  void _populateFromMap(Map<String, dynamic> map) {
    isEditMode.value = true;
    editingDeviceId.value = map['id'];
    boxIdCtrl.text = map['boxId']?.toString() ?? map['box_id']?.toString() ?? '';
    macCtrl.text = map['mac']?.toString() ?? '';
    agentVersionCtrl.text = map['agentVersion']?.toString() ?? map['agent_version']?.toString() ?? 'v2.4.1';
    simNetworkCtrl.text = map['simNetwork']?.toString() ?? map['sim_network']?.toString() ?? 'Airtel 4G IoT';
    if (map['isActive'] != null) {
      isActive.value = map['isActive'] == true;
    } else if (map['is_active'] != null) {
      isActive.value = map['is_active'] == true;
    }
    if (map['organizationId'] != null || map['organization_id'] != null) {
      selectedOrganizationId.value = map['organizationId'] ?? map['organization_id'];
    }
    if (map['fleetId'] != null || map['fleet_id'] != null) {
      selectedFleetId.value = map['fleetId'] ?? map['fleet_id'];
    }
    if (map['vehicleId'] != null || map['vehicle_id'] != null) {
      selectedVehicleId.value = map['vehicleId'] ?? map['vehicle_id'];
    }
    if (map['depotId'] != null || map['depot_id'] != null) {
      selectedDepotId.value = map['depotId'] ?? map['depot_id'];
    }
  }

  // ---------------- Load Reference Datasets ----------------
  Future<void> loadReferenceData() async {
    isLoadingLookups.value = true;
    try {
      final results = await Future.wait([
        TechnicianService.to.getOrganizations(limit: 100),
        TechnicianService.to.getFleets(limit: 200),
        TechnicianService.to.getVehicles(limit: 200),
        TechnicianService.to.getDepots(limit: 200),
      ]);

      final orgRes = results[0] as ApiResponseModel<List<OrganizationItemModel>>;
      if (orgRes.success && orgRes.data != null) {
        organizations.assignAll(orgRes.data!);
      }

      final fleetRes = results[1] as ApiResponseModel<List<FleetItemModel>>;
      if (fleetRes.success && fleetRes.data != null) {
        fleets.assignAll(fleetRes.data!);
      }

      final vehRes = results[2] as ApiResponseModel<List<VehicleItemModel>>;
      if (vehRes.success && vehRes.data != null) {
        vehicles.assignAll(vehRes.data!);
      }

      final depRes = results[3] as ApiResponseModel<List<DepotItemModel>>;
      if (depRes.success && depRes.data != null) {
        depots.assignAll(depRes.data!);
      }

      // If in edit mode, auto-resolve cascading parent selections
      if (isEditMode.value) {
        _syncEditModeSelections();
      }
    } catch (_) {
      // Handled silently
    } finally {
      isLoadingLookups.value = false;
    }
  }

  void _syncEditModeSelections() {
    if (selectedVehicleId.value != null) {
      final v = vehicles.firstWhereOrNull((item) => item.id.toString() == selectedVehicleId.value.toString());
      if (v != null) {
        if (selectedOrganizationId.value == null && v.organizationId != null) {
          selectedOrganizationId.value = v.organizationId;
        }
        if (selectedFleetId.value == null && v.fleetId != null) {
          selectedFleetId.value = v.fleetId;
        }
        if (selectedDepotId.value == null && v.depotId != null) {
          selectedDepotId.value = v.depotId;
        }
      }
    }

    if (selectedFleetId.value != null && selectedOrganizationId.value == null) {
      final f = fleets.firstWhereOrNull((item) => item.id.toString() == selectedFleetId.value.toString());
      if (f != null && f.organizationId != null) {
        selectedOrganizationId.value = f.organizationId;
      }
      if (selectedDepotId.value == null && f?.depotId != null) {
        selectedDepotId.value = f!.depotId;
      }
    }
  }

  // ---------------- Cascading Filtering (Matches Web Admin) ----------------

  /// Fleets strictly filtered by selected Organization
  List<FleetItemModel> get availableFleets {
    final orgId = selectedOrganizationId.value;
    if (orgId == null || orgId.toString().isEmpty) return [];
    return fleets.where((f) {
      if (f.organizationId == null) return true;
      return f.organizationId.toString() == orgId.toString();
    }).toList();
  }

  /// Vehicles strictly filtered by selected Organization AND selected Fleet
  List<VehicleItemModel> get availableVehicles {
    final orgId = selectedOrganizationId.value;
    if (orgId == null || orgId.toString().isEmpty) return [];

    final flId = selectedFleetId.value;
    return vehicles.where((v) {
      final matchOrg = v.organizationId == null || v.organizationId.toString() == orgId.toString();
      if (flId == null || flId.toString().isEmpty) return matchOrg;
      return matchOrg && (v.fleetId != null && v.fleetId.toString() == flId.toString());
    }).toList();
  }

  // Selected Entities
  OrganizationItemModel? get selectedOrganization {
    final id = selectedOrganizationId.value;
    if (id == null) return null;
    return organizations.firstWhereOrNull((o) => o.id.toString() == id.toString());
  }

  FleetItemModel? get selectedFleet {
    final id = selectedFleetId.value;
    if (id == null) return null;
    return fleets.firstWhereOrNull((f) => f.id.toString() == id.toString());
  }

  VehicleItemModel? get selectedVehicleModel {
    final id = selectedVehicleId.value;
    if (id == null) return null;
    return vehicles.firstWhereOrNull((v) => v.id.toString() == id.toString());
  }

  // Derived assigned depot from vehicle or fleet (Auto-resolved like Web)
  String? get assignedDepotName {
    final veh = selectedVehicleModel;
    if (veh != null && veh.depotName != null && veh.depotName!.isNotEmpty) {
      return veh.depotName;
    }

    final fl = selectedFleet;
    if (fl != null && fl.depotName != null && fl.depotName!.isNotEmpty) {
      return fl.depotName;
    }

    final depId = selectedDepotId.value;
    if (depId != null) {
      final d = depots.firstWhereOrNull((dep) => dep.id.toString() == depId.toString());
      if (d != null) return d.name;
    }
    return null;
  }

  // ---------------- Cascading Change Handlers ----------------

  /// Step 1: Organization Change -> Resets Fleet, Vehicle & Depot
  void onOrganizationChanged(dynamic newOrgId) {
    if (newOrgId == null || newOrgId == '') {
      selectedOrganizationId.value = null;
      selectedFleetId.value = null;
      selectedVehicleId.value = null;
      selectedDepotId.value = null;
      return;
    }

    selectedOrganizationId.value = newOrgId;
    selectedFleetId.value = null;
    selectedVehicleId.value = null;
    selectedDepotId.value = null;
    orgError.value = null;
  }

  /// Step 2: Fleet Change -> Resets Vehicle, Auto-syncs Depot
  void onFleetChanged(dynamic newFleetId) {
    if (newFleetId == null || newFleetId == '') {
      selectedFleetId.value = null;
      selectedVehicleId.value = null;
      selectedDepotId.value = null;
      return;
    }

    selectedFleetId.value = newFleetId;
    selectedVehicleId.value = null;

    final fl = fleets.firstWhereOrNull((f) => f.id.toString() == newFleetId.toString());
    if (fl != null && fl.depotId != null) {
      selectedDepotId.value = fl.depotId;
    } else {
      selectedDepotId.value = null;
    }
  }

  /// Step 3: Vehicle Change -> Syncs Depot & vehicle binding
  void onVehicleChanged(dynamic newVehicleId) {
    if (newVehicleId == null || newVehicleId == '') {
      selectedVehicleId.value = null;
      return;
    }

    selectedVehicleId.value = newVehicleId;
    final veh = vehicles.firstWhereOrNull((v) => v.id.toString() == newVehicleId.toString());
    if (veh != null && veh.depotId != null) {
      selectedDepotId.value = veh.depotId;
    }
  }

  // ---------------- Helper Getters for Success View ----------------
  String get registeredDeviceId =>
      registeredDeviceBoxId.value.isNotEmpty
          ? registeredDeviceBoxId.value
          : (boxIdCtrl.text.trim().isNotEmpty ? boxIdCtrl.text.trim() : '—');

  String get registeredDeviceTypeLabel => 'RK3588 Edge Box';

  RxString get selectedVehicle {
    final v = selectedVehicleModel;
    if (v != null) {
      final label = v.registrationNumber.isNotEmpty ? 'Bus ${v.registrationNumber}' : 'Bus #${v.id}';
      return label.obs;
    }
    return 'common.unassigned'.tr.obs;
  }

  String get registeredVehicleDepot => assignedDepotName ?? '—';

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get registeredOnText {
    final dt = registeredOnDateTime.value ?? DateTime.now();
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  // ---------------- QR Scan / Dialog ----------------
  void onScanQr() {
    if (isEditMode.value) return; // Box ID locked in edit mode

    Get.defaultDialog(
      title: 'scan_qr_barcode_title'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
      backgroundColor: const Color(0xFF15151F),
      radius: 14,
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Column(
          children: [
            const Icon(Icons.qr_code_scanner_rounded, color: Color(0xFFB042FF), size: 54),
            const SizedBox(height: 12),
            Text(
              'align_rk3588_serial_desc'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton(
                  onPressed: () => Get.back(),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF334155)),
                  ),
                  child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70)),
                ),
                const SizedBox(width: 10),
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      final simulatedSerial = 'APC3588Q${(DateTime.now().millisecondsSinceEpoch % 100000000).toString().padLeft(8, '0')}';
                      boxIdCtrl.text = simulatedSerial;
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                    ),
                    child: Text('autofill_serial_btn'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void onBackPressed() => Get.back();

  // ---------------- Submit Registration or Update ----------------
  Future<void> onRegisterDevice() async {
    final boxId = boxIdCtrl.text.trim();
    if (boxId.isEmpty) {
      boxIdError.value = 'box_id_required'.tr;
      Get.snackbar(
        'missing_information'.tr,
        'box_id_required'.tr,
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    if (selectedOrganizationId.value == null || selectedOrganizationId.value.toString().isEmpty) {
      orgError.value = 'select_org_first'.tr;
      Get.snackbar(
        'missing_information'.tr,
        'select_org_first'.tr,
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return;
    }

    isSaving.value = true;
    try {
      final payload = <String, dynamic>{
        'boxId': boxId,
        'box_id': boxId,
        'mac': macCtrl.text.trim().isNotEmpty ? macCtrl.text.trim() : null,
        'organizationId': _toNumber(selectedOrganizationId.value),
        if (selectedFleetId.value != null && selectedFleetId.value.toString().isNotEmpty)
          'fleetId': _toNumber(selectedFleetId.value),
        'vehicleId': selectedVehicleId.value != null && selectedVehicleId.value.toString().isNotEmpty
            ? _toNumber(selectedVehicleId.value)
            : null,
        'vehicle_id': selectedVehicleId.value != null && selectedVehicleId.value.toString().isNotEmpty
            ? _toNumber(selectedVehicleId.value)
            : null,
        'depotId': selectedDepotId.value != null && selectedDepotId.value.toString().isNotEmpty
            ? _toNumber(selectedDepotId.value)
            : null,
        'depot_id': selectedDepotId.value != null && selectedDepotId.value.toString().isNotEmpty
            ? _toNumber(selectedDepotId.value)
            : null,
        'agentVersion': agentVersionCtrl.text.trim().isNotEmpty ? agentVersionCtrl.text.trim() : 'v2.4.1',
        'agent_version': agentVersionCtrl.text.trim().isNotEmpty ? agentVersionCtrl.text.trim() : 'v2.4.1',
        'simNetwork': simNetworkCtrl.text.trim().isNotEmpty ? simNetworkCtrl.text.trim() : 'Airtel 4G IoT',
        'sim_network': simNetworkCtrl.text.trim().isNotEmpty ? simNetworkCtrl.text.trim() : 'Airtel 4G IoT',
        'isActive': isActive.value,
        'is_active': isActive.value,
      };

      if (isEditMode.value && editingDeviceId.value != null) {
        // Edit Mode: Update Device (PATCH /edge-devices/:id)
        final res = await TechnicianService.to.updateEdgeDevice(editingDeviceId.value, payload);
        if (res.success) {
          Get.snackbar(
            'edit_edge_device'.tr,
            'device_updated_success'.tr,
            backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(12),
          );

          if (Get.isRegistered<DisplayDevicesController>()) {
            Get.find<DisplayDevicesController>().fetchDevices();
          }

          Get.back();
        } else {
          Get.snackbar(
            'update_failed'.tr,
            res.displayErrorMessage,
            backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(12),
          );
        }
      } else {
        // Add Mode: Register Device (POST /edge-devices)
        final res = await TechnicianService.to.registerEdgeDevice(payload);
        if (res.success) {
          registeredOnDateTime.value = DateTime.now();
          registeredDeviceBoxId.value = boxId;

          Get.snackbar(
            'device_registered'.tr,
            'device_registered_success'.tr,
            backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(12),
          );

          if (Get.isRegistered<DisplayDevicesController>()) {
            Get.find<DisplayDevicesController>().fetchDevices();
          }

          Get.off(() => const RegistrationSuccessView());
        } else {
          Get.snackbar(
            'registration_failed'.tr,
            res.displayErrorMessage,
            backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
            margin: const EdgeInsets.all(12),
          );
        }
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isSaving.value = false;
    }
  }

  // ---------------- Navigation Handlers ----------------
  void onGoToDisplayDevices() {
    Get.until((route) => route.isFirst);
    if (Get.isRegistered<TechnicianDashboardController>()) {
      Get.find<TechnicianDashboardController>().onNavItemTapped(2);
    }
  }

  void onRegisterAnotherDevice() {
    resetForm();
    Get.off(() => const RegisterDeviceView());
  }

  void resetForm() {
    isEditMode.value = false;
    editingDeviceId.value = null;
    boxIdCtrl.clear();
    macCtrl.clear();
    agentVersionCtrl.text = 'v2.4.1';
    simNetworkCtrl.text = 'Airtel 4G IoT';
    isActive.value = true;
    boxIdError.value = null;
    orgError.value = null;
    selectedOrganizationId.value = null;
    selectedFleetId.value = null;
    selectedVehicleId.value = null;
    selectedDepotId.value = null;
    registeredOnDateTime.value = null;
    registeredDeviceBoxId.value = '';
  }

  dynamic _toNumber(dynamic v) {
    if (v == null) return null;
    return int.tryParse(v.toString()) ?? v;
  }
}
