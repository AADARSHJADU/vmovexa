import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

class ShiftPreset {
  final String label;
  final String hours;
  final String? start;
  final String? end;
  final String icon;

  const ShiftPreset({
    required this.label,
    required this.hours,
    this.start,
    this.end,
    required this.icon,
  });
}

class AddFleetController extends GetxController {
  final formKey = GlobalKey<FormState>();

  // Mode & Identity
  final RxBool isEditMode = false.obs;
  String? editFleetId;
  final RxBool isLoadingData = false.obs;
  final RxBool isSubmitting = false.obs;

  // Platform Admin vs Fleet Manager Mode
  final RxBool isPlatformAdmin = false.obs;

  // 1. Fleet Division & Enterprise Details
  final nameController = TextEditingController();
  final codeController = TextEditingController();
  final descController = TextEditingController();
  final RxString selectedFleetType = 'Intracity Transit'.obs;
  final List<String> fleetTypes = [
    'Intracity Transit',
    'Intercity Line',
    'Airport Express',
    'Corporate Charter',
    'EV Clean Transit',
    'School Fleet',
  ];

  // 2. Operator & Contact Person Credentials
  final contactPersonController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final designationController = TextEditingController(text: 'Fleet Operator Lead');
  final departmentController = TextEditingController(text: 'Transit Operations');
  final passwordController = TextEditingController();
  final RxBool isPasswordVisible = false.obs;

  // 3. Base Hub & Operational Schedule
  final RxList<DepotItemModel> depotsList = <DepotItemModel>[].obs;
  final RxBool isLoadingDepots = false.obs;
  final Rxn<dynamic> selectedDepotId = Rxn<dynamic>();
  final locationController = TextEditingController(text: 'Bangalore Central Hub');
  final timeZoneController = TextEditingController(text: 'Asia/Kolkata (IST)');

  // Working Shift Presets (mirrors Admin Panel AddFleetOperatorPage)
  final List<ShiftPreset> shiftPresets = const [
    ShiftPreset(label: 'Full Transit', hours: '05:00 AM - 11:30 PM', start: '05:00', end: '23:30', icon: '☀️'),
    ShiftPreset(label: 'Morning Shift', hours: '06:00 AM - 02:00 PM', start: '06:00', end: '14:00', icon: '🌅'),
    ShiftPreset(label: 'Evening Shift', hours: '02:00 PM - 10:00 PM', start: '14:00', end: '22:00', icon: '🌇'),
    ShiftPreset(label: 'Night Shift', hours: '10:00 PM - 06:00 AM', start: '22:00', end: '06:00', icon: '🌙'),
    ShiftPreset(label: '24/7 Operations', hours: '12:00 AM - 11:59 PM', start: '00:00', end: '23:59', icon: '🔄'),
    ShiftPreset(label: 'Custom Shift', hours: 'custom', icon: '⚙️'),
  ];
  final RxString selectedShiftPreset = 'Full Transit'.obs;
  final RxString workingHours = '05:00 AM - 11:30 PM'.obs;
  final Rx<TimeOfDay> customStartTime = const TimeOfDay(hour: 5, minute: 0).obs;
  final Rx<TimeOfDay> customEndTime = const TimeOfDay(hour: 23, minute: 30).obs;

  // 4. Operational Targets & Quotas
  final assignedBusesController = TextEditingController(text: '50');
  final activeDriversController = TextEditingController(text: '65');

  // 5. Brand Logo / Avatar Media
  final RxString avatarUrl = ''.obs;
  final RxBool isUploadingLogo = false.obs;
  final ImagePicker _picker = ImagePicker();

  // 6. Enterprise Compliance & KYC Documents
  final RxList<FleetDocumentModel> documentsList = <FleetDocumentModel>[].obs;
  final RxBool isUploadingDoc = false.obs;

  final List<String> kycCategories = const [
    'Fleet Registration',
    'Transport License',
    'GST Certificate',
    'Operator Aadhaar/PAN',
  ];

  // Validation Errors Map for high-fidelity error messaging
  final RxMap<String, String> fieldErrors = <String, String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    _checkRole();
    loadDepots();

    // Check if editing existing fleet passed via arguments
    final args = Get.arguments;
    if (args != null) {
      if (args is FleetItemModel) {
        isEditMode.value = true;
        editFleetId = args.id;
        _populateFromFleetModel(args);
        _loadFleetDetails(args.id);
      } else if (args is FleetDetailModel) {
        isEditMode.value = true;
        editFleetId = args.id;
        _populateFromDetailModel(args);
        _loadFleetDetails(args.id);
      } else if (args is Map) {
        final mapArgs = Map<String, dynamic>.from(args);
        if (mapArgs['id'] != null) {
          isEditMode.value = true;
          editFleetId = mapArgs['id'].toString();
          _loadFleetDetails(editFleetId!);
        }
      } else if (args is String && args.isNotEmpty) {
        isEditMode.value = true;
        editFleetId = args;
        _loadFleetDetails(editFleetId!);
      }
    }
  }

  void _populateFromDetailModel(FleetDetailModel f) {
    nameController.text = f.name;
    codeController.text = f.code;
    descController.text = f.description;
    if (fleetTypes.contains(f.fleetType)) {
      selectedFleetType.value = f.fleetType;
    }
    contactPersonController.text = f.contactPerson;
    emailController.text = f.email;
    phoneController.text = f.phone;
    designationController.text = f.designation;
    departmentController.text = f.department;
    if (f.depotId != null) selectedDepotId.value = f.depotId;
    locationController.text = f.location;
    timeZoneController.text = f.timeZone;
    workingHours.value = f.workingHours;
    _detectPreset(f.workingHours);
    assignedBusesController.text = f.assignedBuses.toString();
    activeDriversController.text = f.activeDriversCount.toString();
    if (f.logoUrl.isNotEmpty) avatarUrl.value = f.logoUrl;
    if (f.documents.isNotEmpty) documentsList.assignAll(f.documents);
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

  Future<void> loadDepots() async {
    isLoadingDepots.value = true;
    try {
      final res = await FleetService.to.getDepots();
      if (res.success && res.data != null) {
        depotsList.assignAll(res.data!);
        if (selectedDepotId.value == null && depotsList.isNotEmpty) {
          selectedDepotId.value = depotsList.first.id;
        }
      }
    } catch (e) {
      debugPrint('Error loading depots: $e');
    } finally {
      isLoadingDepots.value = false;
    }
  }

  Future<void> _loadFleetDetails(String id) async {
    isLoadingData.value = true;
    try {
      final res = await FleetService.to.getFleet(id);
      if (res.success && res.data != null) {
        final data = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : <String, dynamic>{};
        _populateFromMap(data);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load fleet details: $e',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isLoadingData.value = false;
    }
  }

  void _populateFromFleetModel(FleetItemModel f) {
    nameController.text = f.name;
    descController.text = f.description;
    assignedBusesController.text = f.vehicleCount.toString();
    activeDriversController.text = f.driverCount.toString();
  }

  void _populateFromMap(Map<String, dynamic> data) {
    nameController.text = (data['name'] ?? data['fleetName'] ?? '').toString();
    codeController.text = (data['code'] ?? '').toString();
    descController.text = (data['description'] ?? '').toString();

    final ft = data['fleet_type'] ?? data['fleetType'];
    if (ft != null && fleetTypes.contains(ft.toString())) {
      selectedFleetType.value = ft.toString();
    }

    contactPersonController.text = (data['contact_person'] ?? data['contactPerson'] ?? data['name'] ?? '').toString();
    emailController.text = (data['email'] ?? '').toString();
    phoneController.text = (data['phone'] ?? '').toString();
    designationController.text = (data['designation'] ?? 'Fleet Operator Lead').toString();
    departmentController.text = (data['department'] ?? 'Transit Operations').toString();

    final depId = data['depot_id'] ?? data['depotId'] ?? data['depot']?['id'];
    if (depId != null) {
      selectedDepotId.value = depId;
    }

    locationController.text = (data['location'] ?? data['city'] ?? 'Bangalore Central Hub').toString();
    timeZoneController.text = (data['time_zone'] ?? data['timezone'] ?? 'Asia/Kolkata (IST)').toString();

    final hours = (data['working_hours'] ?? data['workingHours'] ?? '05:00 AM - 11:30 PM').toString();
    workingHours.value = hours;
    _detectPreset(hours);

    assignedBusesController.text = (data['assigned_buses'] ?? data['assignedBuses'] ?? '50').toString();
    activeDriversController.text = (data['active_drivers_count'] ?? data['activeDriversCount'] ?? '65').toString();

    final logo = data['logo_url'] ?? data['logoUrl'] ?? data['avatarUrl'] ?? data['avatar_url'];
    if (logo != null && logo.toString().isNotEmpty) {
      avatarUrl.value = logo.toString();
    }

    if (data['documents'] is List) {
      final docs = (data['documents'] as List)
          .map((d) => FleetDocumentModel.fromJson(Map<String, dynamic>.from(d as Map)))
          .toList();
      documentsList.assignAll(docs);
    }
  }

  void _detectPreset(String hoursStr) {
    for (final p in shiftPresets) {
      if (p.hours.toLowerCase() == hoursStr.trim().toLowerCase()) {
        selectedShiftPreset.value = p.label;
        return;
      }
    }
    selectedShiftPreset.value = 'Custom Shift';
  }

  void selectShiftPreset(ShiftPreset preset) {
    selectedShiftPreset.value = preset.label;
    if (preset.hours != 'custom') {
      workingHours.value = preset.hours;
    } else {
      _applyCustomHours();
    }
    fieldErrors.remove('workingHours');
  }

  void updateCustomTime({TimeOfDay? start, TimeOfDay? end}) {
    if (start != null) customStartTime.value = start;
    if (end != null) customEndTime.value = end;
    _applyCustomHours();
  }

  void _applyCustomHours() {
    final s = _formatTimeOfDay(customStartTime.value);
    final e = _formatTimeOfDay(customEndTime.value);
    workingHours.value = '$s - $e';
  }

  String _formatTimeOfDay(TimeOfDay tod) {
    final hour12 = tod.hourOfPeriod == 0 ? 12 : tod.hourOfPeriod;
    final minuteStr = tod.minute.toString().padLeft(2, '0');
    final period = tod.period == DayPeriod.am ? 'AM' : 'PM';
    return '${hour12.toString().padLeft(2, '0')}:$minuteStr $period';
  }

  void togglePasswordVisibility() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  // ---------------- Logo Upload ----------------
  Future<void> pickAndUploadLogo(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 85);
      if (file == null) return;

      isUploadingLogo.value = true;
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'fleet_logo',
      );

      if (res.success && res.data != null) {
        final url = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? '';
        avatarUrl.value = url.toString();
        Get.snackbar('Success', 'Fleet logo uploaded successfully!',
            snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      } else {
        Get.snackbar('Upload Failed', res.message ?? 'Failed to upload fleet logo',
            snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to pick image: $e',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isUploadingLogo.value = false;
    }
  }

  // ---------------- Document KYC Upload ----------------
  Future<void> pickAndUploadDocument(String category, ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(source: source, imageQuality: 90);
      if (file == null) return;

      isUploadingDoc.value = true;
      Get.snackbar('Uploading', 'Uploading $category...',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.blueAccent.withValues(alpha: 0.8),
          colorText: Colors.white);

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'fleet_document',
      );

      if (res.success && res.data != null) {
        final uploadedUrl = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? '';
        final newDoc = FleetDocumentModel(
          name: file.name,
          category: category,
          purpose: category,
          url: uploadedUrl.toString(),
          localPath: file.path,
          uploadedAt: DateTime.now().toIso8601String(),
        );

        // Replace existing document of this category if present, else append
        final existingIdx = documentsList.indexWhere((FleetDocumentModel d) => d.category == category || d.purpose == category);
        if (existingIdx >= 0) {
          documentsList[existingIdx] = newDoc;
        } else {
          documentsList.add(newDoc);
        }

        Get.snackbar('Success', '$category uploaded successfully!',
            snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      } else {
        Get.snackbar('Upload Failed', res.message ?? 'Failed to upload document',
            snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Error uploading document: $e',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isUploadingDoc.value = false;
    }
  }

  void removeDocument(int index) {
    if (index >= 0 && index < documentsList.length) {
      final removed = documentsList.removeAt(index);
      Get.snackbar('Removed', '${removed.category} removed',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.black87, colorText: Colors.white);
    }
  }

  // ---------------- Validation & Submission ----------------
  bool validateForm() {
    fieldErrors.clear();

    if (nameController.text.trim().isEmpty) {
      fieldErrors['name'] = 'Fleet Operator / Company Name is required';
    } else if (nameController.text.trim().length < 2) {
      fieldErrors['name'] = 'Company Name must be at least 2 characters';
    }

    final email = emailController.text.trim();
    if (email.isEmpty) {
      fieldErrors['email'] = 'Email Address is required';
    } else if (!GetUtils.isEmail(email)) {
      fieldErrors['email'] = 'Please enter a valid email address';
    }

    final phone = phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (phone.isEmpty) {
      fieldErrors['phone'] = 'Mobile Phone number is required';
    } else if (phone.length < 10 || phone.length > 15) {
      fieldErrors['phone'] = 'Please enter a valid 10 to 15 digit phone number';
    }

    if (!isEditMode.value && passwordController.text.isNotEmpty && passwordController.text.length < 6) {
      fieldErrors['password'] = 'Password must be at least 6 characters';
    }

    if (selectedDepotId.value == null && depotsList.isNotEmpty) {
      fieldErrors['depotId'] = 'Please select an assigned home depot base';
    }

    if (locationController.text.trim().isEmpty) {
      fieldErrors['location'] = 'Primary Hub Location is required';
    }

    final buses = int.tryParse(assignedBusesController.text.trim());
    if (buses == null || buses < 0 || buses > 10000) {
      fieldErrors['assignedBuses'] = 'Assigned buses must be a number (0 - 10,000)';
    }

    final drivers = int.tryParse(activeDriversController.text.trim());
    if (drivers == null || drivers < 0 || drivers > 10000) {
      fieldErrors['activeDriversCount'] = 'Active drivers must be a number (0 - 10,000)';
    }

    if (fieldErrors.isNotEmpty) {
      Get.snackbar(
        'Validation Errors',
        'Please correct the highlighted fields before submitting.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent.withValues(alpha: 0.9),
        colorText: Colors.white,
      );
      return false;
    }

    return true;
  }

  Future<void> submitFleet() async {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
      final payload = {
        'name': nameController.text.trim(),
        if (codeController.text.trim().isNotEmpty) 'code': codeController.text.trim(),
        'description': descController.text.trim(),
        'fleet_type': selectedFleetType.value,
        'fleetType': selectedFleetType.value,
        'contact_person': contactPersonController.text.trim().isNotEmpty
            ? contactPersonController.text.trim()
            : nameController.text.trim(),
        'contactPerson': contactPersonController.text.trim().isNotEmpty
            ? contactPersonController.text.trim()
            : nameController.text.trim(),
        'designation': designationController.text.trim(),
        'department': departmentController.text.trim(),
        'phone': phoneController.text.trim(),
        'email': emailController.text.trim().toLowerCase(),
        if (passwordController.text.trim().isNotEmpty) 'password': passwordController.text.trim(),
        if (selectedDepotId.value != null) ...{
          'depot_id': selectedDepotId.value,
          'depotId': selectedDepotId.value,
        },
        'location': locationController.text.trim(),
        'time_zone': timeZoneController.text.trim(),
        'working_hours': workingHours.value,
        'workingHours': workingHours.value,
        'assigned_buses': int.tryParse(assignedBusesController.text.trim()) ?? 0,
        'assignedBuses': int.tryParse(assignedBusesController.text.trim()) ?? 0,
        'active_drivers_count': int.tryParse(activeDriversController.text.trim()) ?? 0,
        'activeDriversCount': int.tryParse(activeDriversController.text.trim()) ?? 0,
        if (avatarUrl.value.isNotEmpty) ...{
          'logo_url': avatarUrl.value,
          'avatarUrl': avatarUrl.value,
        },
        'documents': documentsList.map((FleetDocumentModel d) => d.toJson()).toList(),
        if (!isEditMode.value) 'status': isPlatformAdmin.value ? 'active' : 'pending_approval',
      };

      if (isEditMode.value && editFleetId != null) {
        final res = await FleetService.to.updateFleet(editFleetId!, payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar('Fleet Updated', 'Fleet changes saved successfully!',
              snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Update Failed', res.message ?? 'Failed to update fleet',
              snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
        }
      } else {
        final res = await FleetService.to.createFleet(payload);
        if (res.success) {
          Get.back(result: true);
          final successMsg = isPlatformAdmin.value
              ? 'Fleet created & auto-approved!'
              : 'Fleet submitted! Admin will review and approve.';
          Get.snackbar('Success', successMsg,
              snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Creation Failed', res.message ?? 'Failed to create fleet',
              snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred: $e',
          snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    nameController.dispose();
    codeController.dispose();
    descController.dispose();
    contactPersonController.dispose();
    emailController.dispose();
    phoneController.dispose();
    designationController.dispose();
    departmentController.dispose();
    passwordController.dispose();
    locationController.dispose();
    timeZoneController.dispose();
    assignedBusesController.dispose();
    activeDriversController.dispose();
    super.onClose();
  }
}
