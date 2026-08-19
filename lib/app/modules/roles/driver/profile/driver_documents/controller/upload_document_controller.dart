import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../view/document_submitted_view.dart';
import '../view/preview_document_view.dart';

class UploadDocumentController extends GetxController {
  UploadDocumentController({required this.documentTitle, required this.documentIcon});

  // ---------------- Which document this wizard instance is for ----------------
  final String documentTitle;
  final IconData documentIcon;

  // ---------------- Stepper ----------------
  final RxInt currentStep = 1.obs; // 1=Upload, 2=Preview, 3=Submit, 4=Done
  final List<String> stepLabels = const ['Upload', 'Preview', 'Submit', 'Done'];

  // ---------------- Step 1: Upload ----------------
  final RxBool hasFile = false.obs;
  final RxString fileName = ''.obs;
  final RxString fileSizeText = ''.obs;
  final RxString fileType = ''.obs;
  final Rxn<DateTime> uploadedOnDateTime = Rxn<DateTime>();

  final RxString previewQualityLabel = 'Looks Good'.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _formatDateTime(DateTime dt) {
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${dt.day} $month ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  String get uploadedOnText => uploadedOnDateTime.value == null ? '—' : _formatDateTime(uploadedOnDateTime.value!);

  void onPickFromCamera() => _mockPickFile();
  void onPickFromGallery() => _mockPickFile();

  void _mockPickFile() {
    // TODO: integrate image_picker / file_picker; mocking a selected file for now
    hasFile.value = true;
    fileName.value = 'DL_Rohit_Kumar.jpg';
    fileSizeText.value = '1.24 MB';
    fileType.value = 'JPG';
    uploadedOnDateTime.value = DateTime(2025, 5, 20, 10, 30);
    currentStep.value = 2;
    Get.to(() => const PreviewDocumentView());
  }

  // ---------------- Step 2: Preview ----------------
  void onRetakeReplace() {
    currentStep.value = 1;
    Get.back();
  }

  // ---------------- Step 3 -> 4: Submit ----------------
  final RxBool isSubmitting = false.obs;
  final RxString reviewStatusLabel = 'Under Review'.obs;
  final RxString expectedReviewTime = 'Within 24 - 48 hours'.obs;
  final Rxn<DateTime> submittedOnDateTime = Rxn<DateTime>();

  String get submittedOnText => submittedOnDateTime.value == null ? '—' : _formatDateTime(submittedOnDateTime.value!);

  Future<void> onSubmitDocument() async {
    currentStep.value = 3;
    isSubmitting.value = true;
    try {
      // TODO: replace with a real upload/submit API call
      await Future.delayed(const Duration(seconds: 1, milliseconds: 300));
      submittedOnDateTime.value = DateTime(2025, 5, 20, 10, 30);
      currentStep.value = 4;
      Get.off(() => const DocumentSubmittedView());
    } finally {
      isSubmitting.value = false;
    }
  }

  void onBackPressed() => Get.back();

  void onInfoTap() {
    // TODO: show a help sheet with document guidelines
  }

  // ---------------- Post-submit actions ----------------
  void onGoToDashboard() {
    Get.until((route) => route.isFirst);
  }

  void onUploadAnotherDocument() {
    // Pop the whole wizard stack, landing back on the Driver Documents list.
    Get.until((route) => route.settings.name == '/driver-documents' || route.isFirst);
  }
}
