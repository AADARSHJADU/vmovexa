import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../data/services/http_client_service.dart';

class DriverModel {
  final String name;
  final String empId;
  final String dlNo;
  final String dlExpiry;
  final String status;

  DriverModel({
    required this.name,
    required this.empId,
    required this.dlNo,
    required this.dlExpiry,
    required this.status,
  });
}

class ShiftPreset {
  final String label;
  final String icon;
  final String start;
  final String end;
  final String durationLabel;

  const ShiftPreset({
    required this.label,
    required this.icon,
    required this.start,
    required this.end,
    required this.durationLabel,
  });
}

class AddDriverController extends GetxController {
  final formKey = GlobalKey<FormState>();

  // Mode
  final RxBool isEditMode = false.obs;
  String? editDriverId;

  // Loading states
  final RxBool isLoadingData = false.obs;
  final RxBool isSubmitting = false.obs;

  // Personal Information
  final nameController = TextEditingController();
  final empIdController = TextEditingController();
  final badgeIdController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final dobController = TextEditingController();
  final RxBool obscurePassword = true.obs;

  // Address
  final addressController = TextEditingController();
  final cityController = TextEditingController();
  final stateController = TextEditingController();
  final pincodeController = TextEditingController();

  // Commercial License
  final licenseNoController = TextEditingController();
  final issueDateController = TextEditingController();
  final expiryDateController = TextEditingController();
  final authorityController = TextEditingController();
  final medicalFitnessController = TextEditingController();
  final RxBool aadhaarVerified = false.obs;

  // Emergency Contact
  final emergencyContactNameController = TextEditingController();
  final emergencyContactPhoneController = TextEditingController();

  // Operations & Work details
  final experienceYearsController = TextEditingController(text: '5 Years');
  final joiningDateController = TextEditingController();
  final notesController = TextEditingController();

  // Dropdown Selections
  final RxString selectedGender = 'Male'.obs;
  final List<String> genders = const ['Male', 'Female', 'Other'];

  final RxString selectedBloodGroup = 'B+'.obs;
  final List<String> bloodGroups = const ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  final RxString selectedLicenseType = 'Commercial Heavy (HMV)'.obs;
  final List<String> licenseTypes = const [
    'Commercial Heavy (HMV)',
    'Light Motor Vehicle (LMV)',
    'Commercial Driver License (CDL)',
  ];

  final RxString selectedEmergencyRelation = 'Spouse'.obs;
  final List<String> emergencyRelations = const [
    'Spouse',
    'Parent',
    'Sibling',
    'Son/Daughter',
    'Friend',
    'Relative',
    'Other',
  ];

  final RxString status = 'available'.obs;
  final List<String> statuses = const ['available', 'on_duty', 'off_duty', 'pending_approval'];

  // Dynamic Dropdown Lists from API
  final RxList<DepotItemModel> depotsList = <DepotItemModel>[].obs;
  final RxnString selectedDepotId = RxnString();
  final RxString initialDepotName = ''.obs;

  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;
  final RxnString selectedVehicleId = RxnString();
  final RxString initialVehicleReg = ''.obs;

  // Shift presets (matching AdminAddDriverPage.jsx)
  final List<ShiftPreset> shiftPresets = const [
    ShiftPreset(label: 'Morning Shift', icon: '🌅', start: '06:00', end: '14:00', durationLabel: '06:00 AM - 02:00 PM (8h)'),
    ShiftPreset(label: 'Evening Shift', icon: '🌇', start: '14:00', end: '22:00', durationLabel: '02:00 PM - 10:00 PM (8h)'),
    ShiftPreset(label: 'Night Feeder', icon: '🌙', start: '22:00', end: '06:00', durationLabel: '10:00 PM - 06:00 AM (8h)'),
    ShiftPreset(label: 'Split Roster', icon: '⏱️', start: '07:00', end: '19:00', durationLabel: '07:00 AM - 07:00 PM (12h)'),
    ShiftPreset(label: 'Custom Shift', icon: '⚡', start: '', end: '', durationLabel: 'Custom Hours'),
  ];
  final RxString selectedShiftPreset = 'Morning Shift'.obs;
  final RxString shiftStartTime = '06:00'.obs;
  final RxString shiftEndTime = '14:00'.obs;

  // Documents & Media Upload
  final ImagePicker _picker = ImagePicker();
  final RxBool isUploadingAvatar = false.obs;
  final RxBool isUploadingDoc = false.obs;
  final RxString avatarUrl = ''.obs;

  final List<String> kycDocCategories = const [
    'Driving License (Front)',
    'Driving License (Back)',
    'Aadhaar Card (Front)',
    'Aadhaar Card (Back)',
    'Medical Fitness Certificate',
    'Police Verification Certificate',
    'Address Proof',
    'Other Compliance Certificate',
  ];
  final RxString selectedDocCategory = 'Driving License (Front)'.obs;
  final RxList<FleetDocumentModel> documents = <FleetDocumentModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    _handleArguments();
    loadDropdownData();
  }

  void _handleArguments() {
    final args = Get.arguments;
    if (args is DriverItemModel) {
      isEditMode.value = true;
      editDriverId = args.id;
      _populateFromDriverModel(args);
      _loadDriverFullDetails(args.id);
    } else if (args is Map) {
      final mapArgs = Map<String, dynamic>.from(args);
      if (mapArgs['id'] != null || mapArgs['driverId'] != null) {
        isEditMode.value = true;
        editDriverId = (mapArgs['id'] ?? mapArgs['driverId']).toString();
        if (mapArgs['driver'] is DriverItemModel) {
          _populateFromDriverModel(mapArgs['driver'] as DriverItemModel);
        }
        _loadDriverFullDetails(editDriverId!);
      }
    } else if (args is String && args.isNotEmpty) {
      isEditMode.value = true;
      editDriverId = args;
      _loadDriverFullDetails(args);
    }
  }

  void _populateFromDriverModel(DriverItemModel d) {
    nameController.text = d.name;
    empIdController.text = d.empId;
    badgeIdController.text = d.badgeId.isNotEmpty ? d.badgeId : d.displayBadgeId;
    phoneController.text = d.phone;
    emailController.text = d.email;
    dobController.text = d.dob;
    selectedGender.value = genders.contains(d.gender) ? d.gender : 'Male';
    selectedBloodGroup.value = bloodGroups.contains(d.bloodGroup) ? d.bloodGroup : 'B+';

    addressController.text = d.address;
    cityController.text = d.city;
    stateController.text = d.state;
    pincodeController.text = d.pincode;

    licenseNoController.text = d.licenseNumber != 'N/A' ? d.licenseNumber : '';
    selectedLicenseType.value = licenseTypes.contains(d.licenseType) ? d.licenseType : 'Commercial Heavy (HMV)';
    issueDateController.text = d.issueDate;
    expiryDateController.text = d.dlExpiry;
    authorityController.text = d.issuingAuthority;
    medicalFitnessController.text = d.medicalFitnessValidUntil;
    aadhaarVerified.value = d.aadhaarVerified;

    emergencyContactNameController.text = d.emergencyContactName;
    selectedEmergencyRelation.value = emergencyRelations.contains(d.emergencyContactRelation)
        ? d.emergencyContactRelation
        : 'Spouse';
    emergencyContactPhoneController.text = d.emergencyContact;

    experienceYearsController.text = d.experienceYears.isNotEmpty ? d.experienceYears : '5 Years';
    joiningDateController.text = d.joiningDate;
    notesController.text = d.notes;
    status.value = d.status.isNotEmpty ? d.status : 'available';
    avatarUrl.value = d.avatarUrl;

    if (d.depotId != null && d.depotId!.isNotEmpty) {
      selectedDepotId.value = d.depotId;
    }
    initialDepotName.value = d.depotName;

    if (d.assignedBusId != null && d.assignedBusId!.isNotEmpty) {
      selectedVehicleId.value = d.assignedBusId;
    }
    initialVehicleReg.value = d.assignedVehicleReg ?? '';

    // Parse shift preset
    _parseShiftString(d.activeShift);

    if (d.documents.isNotEmpty) {
      documents.assignAll(d.documents);
    }
  }

  void _parseShiftString(String shiftStr) {
    if (shiftStr.isEmpty) return;
    for (final p in shiftPresets) {
      if (shiftStr.toLowerCase().contains(p.label.toLowerCase())) {
        selectedShiftPreset.value = p.label;
        shiftStartTime.value = p.start;
        shiftEndTime.value = p.end;
        return;
      }
    }
    selectedShiftPreset.value = 'Custom Shift';
  }

  Future<void> _loadDriverFullDetails(String id) async {
    try {
      final res = await FleetService.to.getDriver(id);
      if (res.success && res.data != null) {
        final d = res.data is Map<String, dynamic>
            ? DriverItemModel.fromJson(res.data)
            : DriverItemModel.fromJson(Map<String, dynamic>.from(res.data as Map));
        _populateFromDriverModel(d);
      }
    } catch (_) {}
  }

  Future<void> loadDropdownData() async {
    isLoadingData.value = true;
    try {
      await Future.wait([
        _loadDepots(),
        _loadVehicles(),
      ]);
    } finally {
      isLoadingData.value = false;
    }
  }

  Future<void> _loadDepots() async {
    try {
      final res = await FleetService.to.getDepots(limit: 100);
      if (res.success && res.data != null) {
        depotsList.assignAll(res.data!);
        if (!isEditMode.value && selectedDepotId.value == null && depotsList.isNotEmpty) {
          selectedDepotId.value = depotsList.first.id.toString();
        }
      }
    } catch (_) {}
  }

  Future<void> _loadVehicles() async {
    try {
      final res = await FleetService.to.getVehicles(limit: 100);
      if (res.success && res.data != null) {
        vehiclesList.assignAll(res.data!);
      }
    } catch (_) {}
  }

  void selectShiftPreset(ShiftPreset preset) {
    selectedShiftPreset.value = preset.label;
    if (preset.start.isNotEmpty && preset.end.isNotEmpty) {
      shiftStartTime.value = preset.start;
      shiftEndTime.value = preset.end;
    }
  }

  String get activeShiftString {
    final p = shiftPresets.firstWhereOrNull((pr) => pr.label == selectedShiftPreset.value);
    if (p != null && p.start.isNotEmpty) {
      return p.durationLabel;
    }
    return '${shiftStartTime.value} - ${shiftEndTime.value} (Custom)';
  }

  void selectDate(BuildContext context, TextEditingController controller) async {
    final now = DateTime.now();
    DateTime initial = now;
    if (controller.text.isNotEmpty) {
      final parts = controller.text.split('-');
      if (parts.length == 3) {
        initial = DateTime(int.tryParse(parts[0]) ?? now.year, int.tryParse(parts[1]) ?? now.month, int.tryParse(parts[2]) ?? now.day);
      }
    }

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1950),
      lastDate: DateTime(2045),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF10B981),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final formatted = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      controller.text = formatted;
    }
  }

  void selectTime(BuildContext context, RxString targetTime) async {
    int h = 6;
    int m = 0;
    final parts = targetTime.value.split(':');
    if (parts.length == 2) {
      h = int.tryParse(parts[0]) ?? 6;
      m = int.tryParse(parts[1]) ?? 0;
    }

    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: h, minute: m),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF10B981),
              onPrimary: Colors.white,
              surface: Color(0xFF1E293B),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      targetTime.value = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      selectedShiftPreset.value = 'Custom Shift';
    }
  }

  // ---------------- Driver Profile Avatar Upload ----------------
  Future<void> pickAndUploadAvatar(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      if (file == null) return;

      isUploadingAvatar.value = true;
      Get.snackbar(
        'Uploading Avatar',
        'Uploading driver badge photo...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'avatar',
      );

      if (res.success && res.data != null) {
        final url = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? res.data?['avatar_url'] ?? '';
        avatarUrl.value = url.toString();
        Get.snackbar(
          'Photo Uploaded',
          'Driver photo updated successfully!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        // Fallback to local path
        avatarUrl.value = file.path;
        Get.snackbar(
          'Photo Attached',
          'Driver photo attached.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      debugPrint('Avatar pick error: $e');
      Get.snackbar(
        'Error',
        'Failed to select image: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingAvatar.value = false;
    }
  }

  void removeAvatar() {
    avatarUrl.value = '';
  }

  // ---------------- Compliance KYC Document Upload ----------------
  Future<void> pickAndUploadKycDocument(ImageSource source) async {
    final category = selectedDocCategory.value;
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 90,
      );
      if (file == null) return;

      isUploadingDoc.value = true;
      Get.snackbar(
        'Uploading Document',
        'Uploading $category...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'driver_kyc',
      );

      String docUrl = file.path;
      if (res.success && res.data != null) {
        docUrl = res.data?['url'] ?? res.data?['file_url'] ?? res.data?['filePath'] ?? file.path;
      }

      final newDoc = FleetDocumentModel(
        name: file.name.isNotEmpty ? file.name : '$category Image',
        category: category,
        purpose: category,
        url: docUrl,
        localPath: file.path,
        uploadedAt: DateTime.now().toIso8601String(),
      );

      // If document of same category already exists, replace it, else append
      final existingIdx = documents.indexWhere((d) => d.category == category || d.purpose == category);
      if (existingIdx >= 0) {
        documents[existingIdx] = newDoc;
      } else {
        documents.add(newDoc);
      }

      Get.snackbar(
        'Document Uploaded',
        '$category attached successfully!',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      debugPrint('Document pick error: $e');
      Get.snackbar(
        'Error',
        'Failed to pick document: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingDoc.value = false;
    }
  }

  void removeDocument(int index) {
    if (index >= 0 && index < documents.length) {
      documents.removeAt(index);
    }
  }

  Future<void> saveDriver() async {
    // 1. Full name validation
    final name = nameController.text.trim();
    if (name.isEmpty) {
      _showError('Driver Full Name is required.');
      return;
    }
    if (name.length < 3) {
      _showError('Driver Full Name must be at least 3 characters.');
      return;
    }

    // 2. Phone validation (10-digit Indian number)
    final cleanPhone = phoneController.text.trim().replaceAll(RegExp(r'\D'), '').replaceFirst(RegExp(r'^91'), '');
    if (cleanPhone.isEmpty) {
      _showError('Driver mobile phone number is required.');
      return;
    }
    if (cleanPhone.length != 10) {
      _showError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // 3. Commercial DL Number validation
    final cleanDL = licenseNoController.text.trim();
    if (cleanDL.isEmpty) {
      _showError('Commercial Driving License (DL) number is required.');
      return;
    }
    if (cleanDL.length < 6) {
      _showError('Commercial DL number must be at least 6 characters.');
      return;
    }

    // 4. DL Expiry Date validation
    final dlExp = expiryDateController.text.trim();
    if (dlExp.isEmpty) {
      _showError('DL Expiry Date is required.');
      return;
    }

    // 5. RTO Authority
    final rtoAuth = authorityController.text.trim();
    if (rtoAuth.isEmpty) {
      _showError('RTO Issuing Authority is required (e.g. RTO Indore).');
      return;
    }

    // 6. Address & Pincode
    final addr = addressController.text.trim();
    if (addr.isEmpty) {
      _showError('Driver residential address is required.');
      return;
    }
    final pincode = pincodeController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (pincode.isNotEmpty && pincode.length != 6) {
      _showError('PIN Code must be a 6-digit Indian postal code.');
      return;
    }

    // 7. Emergency Contact
    final emgPhone = emergencyContactPhoneController.text.trim().replaceAll(RegExp(r'\D'), '').replaceFirst(RegExp(r'^91'), '');
    if (emgPhone.isNotEmpty && emgPhone == cleanPhone) {
      _showError('Emergency contact phone cannot be the same as driver mobile phone.');
      return;
    }

    // 8. Home Depot
    if (selectedDepotId.value == null || selectedDepotId.value!.isEmpty) {
      _showError('Please assign a Home Depot to this driver.');
      return;
    }

    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'name': name,
        'phone': phoneController.text.trim(),
        if (empIdController.text.trim().isNotEmpty) 'emp_id': empIdController.text.trim(),
        if (badgeIdController.text.trim().isNotEmpty) 'badge_id': badgeIdController.text.trim(),
        if (badgeIdController.text.trim().isNotEmpty) 'badgeId': badgeIdController.text.trim(),
        if (emailController.text.trim().isNotEmpty) 'email': emailController.text.trim(),
        if (!isEditMode.value && passwordController.text.isNotEmpty) 'password': passwordController.text,
        if (dobController.text.trim().isNotEmpty) 'dob': dobController.text.trim(),
        'gender': selectedGender.value,
        'blood_group': selectedBloodGroup.value,
        'address': addr,
        if (cityController.text.trim().isNotEmpty) 'city': cityController.text.trim(),
        if (stateController.text.trim().isNotEmpty) 'state': stateController.text.trim(),
        if (pincode.isNotEmpty) 'pincode': pincode,
        'license_number': cleanDL,
        'dl_number': cleanDL,
        'license_type': selectedLicenseType.value,
        if (issueDateController.text.trim().isNotEmpty) 'issue_date': issueDateController.text.trim(),
        'license_expiry': dlExp,
        'dl_expiry': dlExp,
        'issuing_authority': rtoAuth,
        if (medicalFitnessController.text.trim().isNotEmpty) 'medical_fitness_valid_until': medicalFitnessController.text.trim(),
        'aadhaar_verified': aadhaarVerified.value,
        'emergency_contact_name': emergencyContactNameController.text.trim(),
        'emergency_contact_relation': selectedEmergencyRelation.value,
        'emergency_contact': emergencyContactPhoneController.text.trim(),
        'depot_id': int.tryParse(selectedDepotId.value!) ?? selectedDepotId.value,
        if (selectedVehicleId.value != null && selectedVehicleId.value!.isNotEmpty)
          'assigned_bus_id': int.tryParse(selectedVehicleId.value!) ?? selectedVehicleId.value,
        if (selectedVehicleId.value != null && selectedVehicleId.value!.isNotEmpty)
          'vehicle_id': int.tryParse(selectedVehicleId.value!) ?? selectedVehicleId.value,
        'active_shift': activeShiftString,
        'experience_years': experienceYearsController.text.trim(),
        if (joiningDateController.text.trim().isNotEmpty) 'joining_date': joiningDateController.text.trim(),
        if (notesController.text.trim().isNotEmpty) 'notes': notesController.text.trim(),
        if (avatarUrl.value.isNotEmpty) 'avatar_url': avatarUrl.value,
        'status': status.value,
        'documents': documents.map((d) => d.toJson()).toList(),
      };

      if (isEditMode.value && editDriverId != null) {
        final res = await FleetService.to.updateDriver(editDriverId!, payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Success',
            'Driver $name updated successfully!',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          _showError(res.message ?? 'Failed to update driver');
        }
      } else {
        final res = await FleetService.to.addDriver(payload);
        if (res.success) {
          Get.back(result: true);
          Get.snackbar(
            'Success',
            'Driver $name onboarded successfully!',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          _showError(res.message ?? 'Failed to onboard driver');
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
    empIdController.dispose();
    badgeIdController.dispose();
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    dobController.dispose();
    addressController.dispose();
    cityController.dispose();
    stateController.dispose();
    pincodeController.dispose();
    licenseNoController.dispose();
    issueDateController.dispose();
    expiryDateController.dispose();
    authorityController.dispose();
    medicalFitnessController.dispose();
    emergencyContactNameController.dispose();
    emergencyContactPhoneController.dispose();
    experienceYearsController.dispose();
    joiningDateController.dispose();
    notesController.dispose();
    super.onClose();
  }
}
