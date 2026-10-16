import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';

class AddDepotController extends GetxController {
  final formKey = GlobalKey<FormState>();

  // Mode
  final RxBool isEditMode = false.obs;
  String? editDepotId;

  // Loading
  final RxBool isSubmitting = false.obs;
  final RxBool isLoadingData = false.obs;

  // Text Controllers
  final nameController = TextEditingController();
  final codeController = TextEditingController();
  final capacityController = TextEditingController(text: '35');
  final evChargersController = TextEditingController(text: '6');
  final maintenanceBaysController = TextEditingController(text: '2');
  final washingBaysController = TextEditingController(text: '1');

  // Location
  final addressController = TextEditingController();
  final cityController = TextEditingController(text: 'Indore');
  final stateController = TextEditingController(text: 'Madhya Pradesh');
  final pincodeController = TextEditingController();
  final latitudeController = TextEditingController(text: '22.7533');
  final longitudeController = TextEditingController(text: '75.8937');
  final geofenceRadiusController = TextEditingController(text: '300');

  // Personnel & Helplines
  final contactPersonController = TextEditingController();
  final contactPhoneController = TextEditingController();
  final emergencyPhoneController = TextEditingController();
  final emailController = TextEditingController();
  final operatingHoursController = TextEditingController(text: '24x7');

  // Dropdown Selections
  final RxString selectedDepotType = 'main_terminal'.obs;
  final List<Map<String, String>> depotTypes = const [
    {'value': 'main_terminal', 'label': 'Main Operating Terminal'},
    {'value': 'sub_depot', 'label': 'Sub Depot / Outstation'},
    {'value': 'maintenance_yard', 'label': 'Heavy Maintenance Yard'},
    {'value': 'parking_lot', 'label': 'Night Stabling Lot'},
  ];

  final RxString selectedStatus = 'operational'.obs;
  final List<String> statuses = const ['operational', 'maintenance', 'closed'];

  // Multi-select Fuel & Energy Types
  final List<String> availableFuelTypes = const [
    'EV Charging (DC Fast)',
    'Diesel',
    'CNG (Compressed Natural Gas)',
    'Hydrogen / LNG',
  ];
  final RxList<String> selectedFuelTypes = <String>[
    'EV Charging (DC Fast)',
    'Diesel',
  ].obs;

  // Multi-select Amenities
  final List<String> availableAmenities = const [
    'Driver Rest Lounge',
    '24/7 CCTV & Security Gate',
    'Canteen / Cafeteria',
    'Spare Parts & Tool Store',
    'First Aid / Medical Desk',
    'Automated Washing Station',
    'Solar PV Rooftop Generation',
  ];
  final RxList<String> selectedAmenities = <String>[
    'Driver Rest Lounge',
    '24/7 CCTV & Security Gate',
  ].obs;

  @override
  void onInit() {
    super.onInit();
    _handleArguments();
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args is DepotItemModel) {
      isEditMode.value = true;
      editDepotId = args.id.toString();
      _populateFromModel(args);
      _loadFreshDetails(editDepotId!);
    } else if (args is Map) {
      final mapArgs = Map<String, dynamic>.from(args);
      if (mapArgs['id'] != null || mapArgs['depotId'] != null) {
        isEditMode.value = true;
        editDepotId = (mapArgs['id'] ?? mapArgs['depotId']).toString();
        if (mapArgs['depot'] is DepotItemModel) {
          _populateFromModel(mapArgs['depot'] as DepotItemModel);
        }
        _loadFreshDetails(editDepotId!);
      }
    } else if (args is String && args.isNotEmpty) {
      isEditMode.value = true;
      editDepotId = args;
      _loadFreshDetails(args);
    }
  }

  void _populateFromModel(DepotItemModel d) {
    nameController.text = d.name;
    codeController.text = d.code;
    capacityController.text = d.capacity.toString();
    evChargersController.text = d.evChargers.toString();
    maintenanceBaysController.text = d.maintenanceBays.toString();
    washingBaysController.text = d.washingBays.toString();

    addressController.text = d.address;
    cityController.text = d.city.isNotEmpty ? d.city : 'Indore';
    stateController.text = d.state.isNotEmpty ? d.state : 'Madhya Pradesh';
    pincodeController.text = d.pincode;
    if (d.latitude != null) latitudeController.text = d.latitude.toString();
    if (d.longitude != null) longitudeController.text = d.longitude.toString();
    geofenceRadiusController.text = d.geofenceRadius.toString();

    contactPersonController.text = d.contactPerson;
    contactPhoneController.text = d.contactPhone;
    emergencyPhoneController.text = d.emergencyPhone;
    emailController.text = d.email;
    operatingHoursController.text = d.operatingHours.isNotEmpty ? d.operatingHours : '24x7';

    selectedDepotType.value = d.depotType.isNotEmpty ? d.depotType : 'main_terminal';
    selectedStatus.value = statuses.contains(d.status) ? d.status : 'operational';

    if (d.fuelTypes.isNotEmpty) {
      selectedFuelTypes.assignAll(d.fuelTypes);
    }
    if (d.amenities.isNotEmpty) {
      selectedAmenities.assignAll(d.amenities);
    }
  }

  Future<void> _loadFreshDetails(String id) async {
    isLoadingData.value = true;
    try {
      final res = await FleetService.to.getDepot(id);
      if (res.success && res.data != null) {
        _populateFromModel(res.data!);
      }
    } catch (_) {} finally {
      isLoadingData.value = false;
    }
  }

  void toggleFuelType(String fuel) {
    if (selectedFuelTypes.contains(fuel)) {
      selectedFuelTypes.remove(fuel);
    } else {
      selectedFuelTypes.add(fuel);
    }
  }

  void toggleAmenity(String amenity) {
    if (selectedAmenities.contains(amenity)) {
      selectedAmenities.remove(amenity);
    } else {
      selectedAmenities.add(amenity);
    }
  }

  Future<void> saveDepot() async {
    final name = nameController.text.trim();
    if (name.isEmpty) {
      _showError('Depot Facility Name is required.');
      return;
    }
    if (name.length < 3) {
      _showError('Depot Facility Name must be at least 3 characters.');
      return;
    }

    final addr = addressController.text.trim();
    if (addr.isEmpty) {
      _showError('Complete street address is required.');
      return;
    }

    final pincode = pincodeController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (pincode.isNotEmpty && pincode.length != 6) {
      _showError('Postal PIN code must be 6 digits.');
      return;
    }

    final phone = contactPhoneController.text.trim().replaceAll(RegExp(r'\D'), '').replaceFirst(RegExp(r'^91'), '');
    if (phone.isNotEmpty && phone.length != 10) {
      _showError('Helpline contact phone must be 10 digits.');
      return;
    }

    final lat = double.tryParse(latitudeController.text.trim());
    final lng = double.tryParse(longitudeController.text.trim());

    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'name': name,
        if (codeController.text.trim().isNotEmpty) 'code': codeController.text.trim().toUpperCase(),
        'depot_type': selectedDepotType.value,
        'status': selectedStatus.value,
        'capacity': int.tryParse(capacityController.text.trim()) ?? 25,
        'ev_chargers': int.tryParse(evChargersController.text.trim()) ?? 0,
        'maintenance_bays': int.tryParse(maintenanceBaysController.text.trim()) ?? 0,
        'washing_bays': int.tryParse(washingBaysController.text.trim()) ?? 0,
        'fuel_types': selectedFuelTypes.join(', '),
        'amenities': selectedAmenities.toList(),
        'address': addr,
        if (cityController.text.trim().isNotEmpty) 'city': cityController.text.trim(),
        if (stateController.text.trim().isNotEmpty) 'state': stateController.text.trim(),
        if (pincode.isNotEmpty) 'pincode': pincode,
        'country': 'India',
        'latitude': ?lat,
        'longitude': ?lng,
        'geofence_radius': int.tryParse(geofenceRadiusController.text.trim()) ?? 300,
        if (contactPersonController.text.trim().isNotEmpty) 'contact_person': contactPersonController.text.trim(),
        if (contactPhoneController.text.trim().isNotEmpty) 'contact_phone': contactPhoneController.text.trim(),
        if (emergencyPhoneController.text.trim().isNotEmpty) 'emergency_phone': emergencyPhoneController.text.trim(),
        if (emailController.text.trim().isNotEmpty) 'email': emailController.text.trim(),
        'operating_hours': operatingHoursController.text.trim().isNotEmpty ? operatingHoursController.text.trim() : '24x7',
      };

      if (isEditMode.value && editDepotId != null) {
        final res = await FleetService.to.updateDepot(editDepotId!, payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Success',
            'Depot $name updated successfully!',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          _showError(res.message ?? 'Failed to update depot facility');
        }
      } else {
        final res = await FleetService.to.addDepot(payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Success',
            'Depot $name created successfully!',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          _showError(res.message ?? 'Failed to create depot facility');
        }
      }
    } catch (e) {
      _showError(e.toString());
    } finally {
      isSubmitting.value = false;
    }
  }

  void _showError(String msg) {
    Get.snackbar(
      'Validation Error',
      msg,
      backgroundColor: Colors.redAccent,
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(12),
    );
  }

  @override
  void onClose() {
    nameController.dispose();
    codeController.dispose();
    capacityController.dispose();
    evChargersController.dispose();
    maintenanceBaysController.dispose();
    washingBaysController.dispose();
    addressController.dispose();
    cityController.dispose();
    stateController.dispose();
    pincodeController.dispose();
    latitudeController.dispose();
    longitudeController.dispose();
    geofenceRadiusController.dispose();
    contactPersonController.dispose();
    contactPhoneController.dispose();
    emergencyPhoneController.dispose();
    emailController.dispose();
    operatingHoursController.dispose();
    super.onClose();
  }
}
