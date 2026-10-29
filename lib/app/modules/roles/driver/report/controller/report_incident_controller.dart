import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/incident_submitted_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/review_incident_view.dart';

import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/modules/roles/driver/driver_dashboard/controller/driver_dashboard_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import '../view/additional_information_view.dart';

class ReportIncidentController extends GetxController {
  DriverService get _driverService => DriverService.to;
  final ImagePicker _picker = ImagePicker();

  // ---------------- Stepper ----------------
  final RxInt currentStep = 1.obs; // 1=Incident Details, 2=Additional Information, 3=Review, 4=Submit
  final List<String> stepLabels = const [
    'Incident Details',
    'Additional Information',
    'Review',
    'Submit',
  ];

  // ==========================================================
  // STEP 1 — Incident Details
  // ==========================================================
  final Rx<IncidentType?> selectedIncidentType = Rx<IncidentType?>(null);

  void selectIncidentType(IncidentType type) => selectedIncidentType.value = type;

  final descriptionCtrl = TextEditingController();
  static const int descriptionMaxLen = 500;
  final RxInt descriptionLen = 0.obs;

  final locationCtrl = TextEditingController();

  final Rx<DateTime> selectedDateTime = DateTime.now().obs;

  static const List<String> _monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get incidentDateText {
    final dt = selectedDateTime.value;
    return '${_monthNamesShort[dt.month - 1]} ${dt.day}, ${dt.year}';
  }

  String get incidentTimeText {
    final dt = selectedDateTime.value;
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  final RxList<String> photoPaths = <String>[].obs; // local file paths
  static const int maxPhotos = 5;

  final RxnString incidentTypeError = RxnString();
  final RxnString descriptionError = RxnString();

  Future<void> onPickDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDateTime.value,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFB042FF),
            onPrimary: Colors.white,
            surface: Color(0xFF15151F),
            onSurface: Colors.white,
          ),
          dialogBackgroundColor: const Color(0xFF0B0B14),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      final current = selectedDateTime.value;
      selectedDateTime.value = DateTime(picked.year, picked.month, picked.day, current.hour, current.minute);
    }
  }

  Future<void> onPickTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(selectedDateTime.value),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFB042FF),
            onPrimary: Colors.white,
            surface: Color(0xFF15151F),
            onSurface: Colors.white,
          ),
          timePickerTheme: const TimePickerThemeData(
            backgroundColor: Color(0xFF15151F),
            dialBackgroundColor: Color(0xFF1B1B27),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      final current = selectedDateTime.value;
      selectedDateTime.value = DateTime(current.year, current.month, current.day, picked.hour, picked.minute);
    }
  }

  Future<void> onUploadPhoto() async {
    if (photoPaths.length >= maxPhotos) {
      Get.snackbar(
        'Limit Reached',
        'You can upload up to $maxPhotos photos.',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Upload Incident Photo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFFB042FF)),
              title: const Text('Take Photo', style: TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);
                if (file != null) {
                  photoPaths.add(file.path);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF3F7BF5)),
              title: const Text('Choose from Gallery', style: TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
                if (file != null) {
                  photoPaths.add(file.path);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void onRemovePhoto(String path) => photoPaths.remove(path);

  // ==========================================================
  // STEP 2 — Additional Information
  // ==========================================================
  final Rx<IncidentSeverity> severity = IncidentSeverity.low.obs;
  void setSeverity(IncidentSeverity value) => severity.value = value;

  final RxSet<AffectedParty> affectedParties = <AffectedParty>{}.obs;
  void toggleAffectedParty(AffectedParty party) {
    if (affectedParties.contains(party)) {
      affectedParties.remove(party);
    } else {
      affectedParties.add(party);
    }
  }

  final immediateActionCtrl = TextEditingController();
  static const int immediateActionMaxLen = 500;
  final RxInt immediateActionLen = 0.obs;

  final RxnBool wantsContact = RxnBool();
  void setWantsContact(bool value) {
    wantsContact.value = value;
    if (!value) contactNumberCtrl.clear();
  }

  final contactNumberCtrl = TextEditingController();

  // ==========================================================
  // Submission state
  // ==========================================================
  final RxBool isSubmitting = false.obs;
  final RxString incidentId = ''.obs;
  final Rxn<DateTime> submittedOnDateTime = Rxn<DateTime>();

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get submittedOnText {
    final dt = submittedOnDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  String get affectedPartiesText =>
      affectedParties.isEmpty ? '—' : affectedParties.map((p) => p.label).join(', ');

  String get contactPreferenceText {
    if (wantsContact.value == null) return '—';
    return wantsContact.value! ? 'Yes, contact me' : 'No, do not contact me';
  }

  @override
  void onInit() {
    super.onInit();
    descriptionCtrl.addListener(() => descriptionLen.value = descriptionCtrl.text.length);
    immediateActionCtrl.addListener(() => immediateActionLen.value = immediateActionCtrl.text.length);
    _initLocation();
  }

  Future<void> _initLocation() async {
    try {
      final active = await _driverService.getActiveRoute();
      if (active.success && active.data?.route != null) {
        locationCtrl.text = active.data!.route!.name ?? locationCtrl.text;
        return;
      }
      final sched = await _driverService.getTodaySchedule();
      if (sched.success && sched.data?.assignedRoute != null) {
        final r = sched.data!.assignedRoute!;
        final name = '${r.fromStop ?? ""} ⇄ ${r.toStop ?? ""}'.trim();
        if (name.isNotEmpty) locationCtrl.text = name;
      }
    } catch (_) {}
  }

  @override
  void onClose() {
    descriptionCtrl.dispose();
    locationCtrl.dispose();
    immediateActionCtrl.dispose();
    contactNumberCtrl.dispose();
    super.onClose();
  }

  // ---------------- Validation ----------------
  bool _validateStep1() {
    bool isValid = true;

    if (selectedIncidentType.value == null) {
      incidentTypeError.value = 'Please select an incident type';
      isValid = false;
    } else {
      incidentTypeError.value = null;
    }

    if (descriptionCtrl.text.trim().isEmpty) {
      descriptionError.value = 'Please describe the incident';
      isValid = false;
    } else {
      descriptionError.value = null;
    }

    return isValid;
  }

  // ---------------- Navigation ----------------
  void onCancel() => Get.back();

  void onStep1NextPressed() {
    if (!_validateStep1()) {
      Get.snackbar(
        'Missing Information',
        'Please fill all required fields marked with *',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    currentStep.value = 2;
    Get.to(() => const AdditionalInformationView());
  }

  void onStep2BackPressed() {
    currentStep.value = 1;
    Get.back();
  }

  void onStep2NextPressed() {
    currentStep.value = 3;
    Get.to(() => const ReviewIncidentView());
  }

  void onStep3BackPressed() {
    currentStep.value = 2;
    Get.back();
  }

  Future<void> onSubmitIncident() async {
    isSubmitting.value = true;
    try {
      // 1. Upload photos first
      List<String> uploadedMediaUrls = [];
      for (final path in photoPaths) {
        if (File(path).existsSync()) {
          final upRes = await _driverService.uploadFile(filePath: path, purpose: 'incident');
          if (upRes.success && upRes.data != null) {
            final url = upRes.data?['url']?.toString() ?? upRes.data?['file_url']?.toString();
            if (url != null && url.isNotEmpty) {
              uploadedMediaUrls.add(url);
            }
          }
        }
      }

      // 2. Map severity
      String sev = 'low';
      switch (severity.value) {
        case IncidentSeverity.critical:
          sev = 'critical';
          break;
        case IncidentSeverity.high:
          sev = 'high';
          break;
        case IncidentSeverity.medium:
          sev = 'medium';
          break;
        case IncidentSeverity.low:
          sev = 'low';
          break;
      }

      // 3. Compile description with notes
      final fullDesc = StringBuffer(descriptionCtrl.text.trim());
      if (immediateActionCtrl.text.trim().isNotEmpty) {
        fullDesc.write('\n\nImmediate Action Taken: ${immediateActionCtrl.text.trim()}');
      }
      if (affectedParties.isNotEmpty) {
        fullDesc.write('\nAffected Parties: $affectedPartiesText');
      }
      if (locationCtrl.text.trim().isNotEmpty) {
        fullDesc.write('\nLocation: ${locationCtrl.text.trim()}');
      }
      if (contactNumberCtrl.text.trim().isNotEmpty) {
        fullDesc.write('\nContact: ${contactNumberCtrl.text.trim()}');
      }

      // Fetch current route GPS coordinates if active
      double? gpsLat;
      double? gpsLng;
      try {
        final active = await _driverService.getActiveRoute();
        if (active.success && active.data?.route?.stops.isNotEmpty == true) {
          final stops = active.data!.route!.stops;
          final idx = (active.data!.currentStopIndex < stops.length) ? active.data!.currentStopIndex : 0;
          if (stops[idx].lat != null && stops[idx].lng != null) {
            gpsLat = stops[idx].lat;
            gpsLng = stops[idx].lng;
          }
        }
      } catch (_) {}

      // 4. Submit to API POST /me/driver/incidents
      final incTypeName = selectedIncidentType.value?.label ?? 'Vehicle Incident';
      final response = await _driverService.reportIncident(
        incidentType: incTypeName,
        title: incTypeName,
        description: descriptionCtrl.text.trim().isNotEmpty
            ? descriptionCtrl.text.trim()
            : fullDesc.toString(),
        severity: sev,
        location: locationCtrl.text.trim(),
        latitude: gpsLat,
        longitude: gpsLng,
        photos: uploadedMediaUrls,
        mediaUrls: uploadedMediaUrls,
        affectedParties: affectedParties.map((p) => p.label).toList(),
        immediateAction: immediateActionCtrl.text.trim(),
        contactPreference: wantsContact.value == true ? 'call' : 'none',
        contactNumber: contactNumberCtrl.text.trim(),
      );

      final now = DateTime.now();
      submittedOnDateTime.value = now;

      if (response.success && response.data != null) {
        final item = response.data!;
        incidentId.value = item.ticketNumber ?? (item.id ?? 'INC-${now.millisecondsSinceEpoch % 100000}');
      } else {
        incidentId.value = 'INC-${now.year}-${(now.millisecondsSinceEpoch % 100000).toString().padLeft(5, '0')}';
      }

      currentStep.value = 4;
      Get.off(() => const IncidentSubmittedView());
    } catch (e) {
      Get.snackbar(
        'Submission Failed',
        'Could not report incident: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  // ---------------- Post-submit actions ----------------
  void onGoToHome() {
    resetWizard();
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().selectedNavIndex.value = 0;
    }
    if (Get.isRegistered<DriverHomeController>()) {
      Get.find<DriverHomeController>().fetchDashboardData();
    }
    Get.offAllNamed(Routes.DRIVER_DASHBOARD);
  }

  void onViewIncidentsList() {
    resetWizard();
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().selectedNavIndex.value = 3;
    }
    Get.offAllNamed(Routes.DRIVER_DASHBOARD);
  }

  void onShareReport() {
    Get.snackbar(
      'Share Report',
      'Ticket Number: ${incidentId.value}',
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void resetWizard() {
    currentStep.value = 1;
    selectedIncidentType.value = null;
    descriptionCtrl.clear();
    locationCtrl.clear();
    _initLocation();
    selectedDateTime.value = DateTime.now();
    photoPaths.clear();
    severity.value = IncidentSeverity.low;
    affectedParties.clear();
    immediateActionCtrl.clear();
    wantsContact.value = null;
    contactNumberCtrl.clear();
    incidentId.value = '';
    submittedOnDateTime.value = null;
    incidentTypeError.value = null;
    descriptionError.value = null;
  }
}
