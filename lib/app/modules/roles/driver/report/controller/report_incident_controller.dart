import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/incident_submitted_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/review_incident_view.dart';

import '../view/additional_information_view.dart';

class ReportIncidentController extends GetxController {
  // ---------------- Stepper (Location step intentionally removed) ----------------
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

  final locationCtrl = TextEditingController(text: 'Andheri Depot, Mumbai, Maharashtra');

  final Rx<DateTime> selectedDateTime = DateTime(2025, 5, 14, 6, 45).obs;

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

  final RxList<String> photoPaths = <String>[].obs; // local file paths / URLs
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

  void onUploadPhoto() {
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
    // TODO: integrate image_picker; mock-adding a placeholder path for now
    photoPaths.add('mock_photo_${photoPaths.length + 1}.jpg');
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

  // null = not answered yet, true = Yes, false = No
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
      // TODO: replace with real API call to submit the incident report
      await Future.delayed(const Duration(seconds: 1, milliseconds: 200));
      final now = DateTime.now();
      incidentId.value = 'INC-2025-05-14-${(now.millisecondsSinceEpoch % 100000).toString().padLeft(5, '0')}';
      submittedOnDateTime.value = DateTime(2025, 5, 14, 6, 45);
      currentStep.value = 4;
      Get.off(() => const IncidentSubmittedView());
    } finally {
      isSubmitting.value = false;
    }
  }

  // ---------------- Post-submit actions ----------------
  void onGoToHome() {
    Get.until((route) => route.isFirst);
  }

  void onShareReport() {
    // TODO: integrate share_plus to share the incident summary
  }

  void resetWizard() {
    currentStep.value = 1;
    selectedIncidentType.value = null;
    descriptionCtrl.clear();
    locationCtrl.text = 'Andheri Depot, Mumbai, Maharashtra';
    selectedDateTime.value = DateTime(2025, 5, 14, 6, 45);
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
