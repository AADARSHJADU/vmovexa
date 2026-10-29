import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/modules/roles/driver/driver_dashboard/controller/driver_dashboard_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/controller/driver_profile_controller.dart';
import '../view/document_submitted_view.dart';
import '../view/preview_document_view.dart';
import 'driver_documents_controller.dart';

class UploadDocumentController extends GetxController {
  UploadDocumentController({
    required this.documentTitle,
    required this.documentIcon,
    this.documentTypeKey = 'license',
    this.existingDocumentId,
    this.existingUrl,
    this.existingFileName,
    this.existingFileSize,
    this.existingStatus,
    this.isReadOnly = false,
  });

  DriverService get _driverService => DriverService.to;
  final ImagePicker _picker = ImagePicker();

  // ---------------- Which document this instance is for ----------------
  final String documentTitle;
  final IconData documentIcon;
  final String documentTypeKey;
  final String? existingDocumentId;
  final String? existingUrl;
  final String? existingFileName;
  final String? existingFileSize;
  final String? existingStatus;
  final bool isReadOnly;

  // ---------------- Stepper ----------------
  final RxInt currentStep = 1.obs; // 1=Upload, 2=Preview, 3=Submit, 4=Done
  final List<String> stepLabels = const ['Upload', 'Preview', 'Submit', 'Done'];

  // ---------------- File State ----------------
  final RxBool hasFile = false.obs;
  final RxString filePath = ''.obs; // local file path if picked
  final RxString remoteUrl = ''.obs; // server file URL if already uploaded
  final RxString fileName = ''.obs;
  final RxString fileSizeText = ''.obs;
  final RxString fileType = ''.obs;
  final RxString documentStatus = 'Upload'.obs;
  final Rxn<DateTime> uploadedOnDateTime = Rxn<DateTime>();

  final RxString previewQualityLabel = 'Looks Good'.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  @override
  void onInit() {
    super.onInit();
    if (existingUrl != null && existingUrl!.isNotEmpty) {
      remoteUrl.value = existingUrl!;
      hasFile.value = true;
      fileName.value = existingFileName ?? existingUrl!.split('/').last;
      fileSizeText.value = existingFileSize ?? 'Attached';
      documentStatus.value = existingStatus ?? 'Uploaded';
      currentStep.value = 2; // Show preview directly
    }
  }

  String _formatDateTime(DateTime dt) {
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${dt.day} $month ${dt.year}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  String get uploadedOnText => uploadedOnDateTime.value == null ? '—' : _formatDateTime(uploadedOnDateTime.value!);

  Future<void> onPickFromCamera() async {
    try {
      final XFile? photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 85);
      if (photo != null) {
        await _processPickedFile(photo.path);
      }
    } catch (e) {
      Get.snackbar('Error', 'Camera error: $e', backgroundColor: const Color(0xFF15151F), colorText: Colors.redAccent);
    }
  }

  Future<void> onPickFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (image != null) {
        await _processPickedFile(image.path);
      }
    } catch (e) {
      Get.snackbar('Error', 'Gallery error: $e', backgroundColor: const Color(0xFF15151F), colorText: Colors.redAccent);
    }
  }

  Future<void> _processPickedFile(String path) async {
    final file = File(path);
    if (!await file.exists()) return;

    final bytes = await file.length();
    final mb = (bytes / (1024 * 1024)).toStringAsFixed(2);
    final ext = path.split('.').last.toUpperCase();
    final name = path.split(Platform.pathSeparator).last;

    filePath.value = path;
    remoteUrl.value = ''; // replaced by newly picked local file
    hasFile.value = true;
    fileName.value = name;
    fileSizeText.value = '$mb MB';
    fileType.value = ext;
    uploadedOnDateTime.value = DateTime.now();

    currentStep.value = 2;
    Get.to(() => const PreviewDocumentView());
  }

  // ---------------- Step 2: Preview & Replace ----------------
  void onRetakeReplace() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Replace Document',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Select new image to replace current document.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.camera_alt_outlined, color: Color(0xFF8B5CF6)),
              title: const Text('Take a photo', style: TextStyle(color: Colors.white)),
              onTap: () {
                Get.back();
                onPickFromCamera();
              },
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.photo_library_outlined, color: Color(0xFF38BDF8)),
              title: const Text('Choose from gallery', style: TextStyle(color: Colors.white)),
              onTap: () {
                Get.back();
                onPickFromGallery();
              },
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  // ---------------- Step 3 -> 4: Submit ----------------
  final RxBool isSubmitting = false.obs;
  final RxString reviewStatusLabel = 'Under Review'.obs;
  final RxString expectedReviewTime = 'Within 24 - 48 hours'.obs;
  final Rxn<DateTime> submittedOnDateTime = Rxn<DateTime>();

  String get submittedOnText => submittedOnDateTime.value == null ? '—' : _formatDateTime(submittedOnDateTime.value!);

  Future<void> onSubmitDocument() async {
    if (filePath.value.isEmpty && remoteUrl.value.isEmpty) {
      Get.snackbar('Missing File', 'Please select a document image first.', backgroundColor: const Color(0xFF15151F), colorText: Colors.white);
      return;
    }

    // If already on server and hasn't changed, go back
    if (filePath.value.isEmpty && remoteUrl.value.isNotEmpty) {
      Get.back();
      return;
    }

    currentStep.value = 3;
    isSubmitting.value = true;
    try {
      // 1. Upload file to server via POST /uploads
      final uploadRes = await _driverService.uploadFile(
        filePath: filePath.value,
        purpose: 'document',
      );

      String? uploadedUrl;
      String? uploadedFileName;
      String? uploadedFileSize;
      String? uploadedFileType;

      if (uploadRes.success && uploadRes.data != null) {
        uploadedUrl = uploadRes.data?['url']?.toString() ??
            uploadRes.data?['file_url']?.toString() ??
            uploadRes.data?['path']?.toString();
        uploadedFileName = uploadRes.data?['fileName']?.toString();
        uploadedFileSize = uploadRes.data?['fileSize']?.toString();
        uploadedFileType = uploadRes.data?['fileType']?.toString();
      }

      if (uploadedUrl == null || uploadedUrl.isEmpty) {
        uploadedUrl = '/uploads/documents/${fileName.value}';
      }

      // Map doc title to valid API type (license, aadhaar, pan, medical, badge, insurance)
      String apiType = documentTypeKey.toLowerCase();
      if (apiType.contains('license') || apiType.contains('dl') || apiType.contains('driving')) {
        apiType = 'license';
      } else if (apiType.contains('aadhaar') || apiType.contains('aadhar') || apiType.contains('id') || apiType.contains('kyc')) {
        apiType = 'aadhaar';
      } else if (apiType.contains('pan')) {
        apiType = 'pan';
      } else if (apiType.contains('medical') || apiType.contains('fitness')) {
        apiType = 'medical';
      } else if (apiType.contains('insurance') || apiType.contains('contract') || apiType.contains('agreement') || apiType.contains('depot')) {
        apiType = 'insurance';
      } else if (apiType.contains('badge') || apiType.contains('training')) {
        apiType = 'badge';
      }

      // 2. Register document via POST /me/driver/documents
      final finalFileName = fileName.value.isNotEmpty ? fileName.value : (uploadedFileName ?? 'Document');
      final finalFileSize = fileSizeText.value.isNotEmpty ? fileSizeText.value : (uploadedFileSize ?? 'Attached');

      await _driverService.uploadDocumentRecord(
        type: apiType,
        url: uploadedUrl,
        docName: documentTitle,
        fileName: finalFileName,
        fileSize: finalFileSize,
        fileType: fileType.value.isNotEmpty ? fileType.value : (uploadedFileType ?? 'IMAGE'),
      );

      submittedOnDateTime.value = DateTime.now();
      remoteUrl.value = uploadedUrl;
      currentStep.value = 4;

      // Refresh documents controller
      if (Get.isRegistered<DriverDocumentsController>()) {
        DriverDocumentsController.to.fetchDocuments();
      }
      // Refresh profile controller
      if (Get.isRegistered<DriverProfileController>()) {
        Get.find<DriverProfileController>().fetchProfile();
      }
      // Refresh home dashboard
      if (Get.isRegistered<DriverHomeController>()) {
        Get.find<DriverHomeController>().fetchDashboardData();
      }

      Get.off(() => const DocumentSubmittedView());
    } catch (e) {
      Get.snackbar(
        'Submission Failed',
        'Error uploading document: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  void onBackPressed() => Get.back();

  void onInfoTap() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        title: const Text('Document Guidelines', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: const Text(
          'Make sure all 4 corners of the document are clearly visible, text is sharply focused, and there is no light glare. Verification typically takes 24 - 48 hours.',
          style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Got it', style: TextStyle(color: Color(0xFFB042FF)))),
        ],
      ),
    );
  }

  // ---------------- Post-submit actions ----------------
  void onGoToDashboard() {
    if (Get.isRegistered<DriverDashboardController>()) {
      Get.find<DriverDashboardController>().selectedNavIndex.value = 0;
    }
    Get.offAllNamed(Routes.DRIVER_DASHBOARD);
  }

  void onGoToDocumentsRoster() {
    if (Get.isRegistered<DriverDocumentsController>()) {
      DriverDocumentsController.to.fetchDocuments();
    }
    bool found = false;
    Get.until((route) {
      if (route.settings.name == Routes.DRIVER_DOCUMENT) {
        found = true;
        return true;
      }
      return route.isFirst;
    });
    if (!found) {
      Get.offNamed(Routes.DRIVER_DOCUMENT);
    }
  }

  void onUploadAnotherDocument() {
    onGoToDocumentsRoster();
  }

  Future<void> onDeleteDocument() async {
    final id = existingDocumentId;
    if (id == null || id.isEmpty) {
      Get.back();
      return;
    }

    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Remove Document', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to remove "$documentTitle"? You can re-upload it at any time.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Get.back(); // close dialog
              final res = await _driverService.deleteDocument(id);
              if (res.success) {
                Get.snackbar('Deleted', 'Document removed successfully.', backgroundColor: const Color(0xFF15151F), colorText: Colors.white);
                if (Get.isRegistered<DriverDocumentsController>()) {
                  await DriverDocumentsController.to.fetchDocuments();
                }
                if (Get.isRegistered<DriverProfileController>()) {
                  Get.find<DriverProfileController>().fetchProfile();
                }
                Get.back(); // exit preview
              } else {
                Get.snackbar('Error', res.message ?? 'Failed to delete document', backgroundColor: const Color(0xFF15151F), colorText: Colors.redAccent);
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}
