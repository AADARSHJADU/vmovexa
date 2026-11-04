import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/controller/upload_document_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/model/document_requirement_model.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/preview_document_view.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_document_view.dart';

import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/controller/driver_profile_controller.dart';

class DriverDocumentsController extends GetxController {
  static DriverDocumentsController get to => Get.find<DriverDocumentsController>();
  DriverService get _driverService => DriverService.to;

  final RxBool isLoading = false.obs;
  final RxList<DocumentRequirement> documents = <DocumentRequirement>[].obs;
  final RxList<DriverDocumentItem> rawDocuments = <DriverDocumentItem>[].obs;

  // ---------------- Driver Compliance & KYC Metrics (matching website) ----------------
  final Rxn<DriverProfileData> driverProfile = Rxn<DriverProfileData>();
  final RxBool isVerified = false.obs;
  final RxBool isRejected = false.obs;
  final RxString rejectionReason = ''.obs;
  final RxString dlNumber = '—'.obs;
  final RxString dlExpiry = '—'.obs;
  final RxString dlStatus = 'Valid'.obs;
  final RxString assignedBus = 'Unassigned'.obs;
  final RxString activeShift = 'Morning Shift'.obs;

  @override
  void onInit() {
    super.onInit();
    fetchDocuments();
  }

  Future<void> fetchDocuments() async {
    isLoading.value = true;
    try {
      // 1. Fetch driver profile metrics
      await _fetchDriverProfile();

      // 2. Fetch driver uploaded documents
      final response = await _driverService.getDocuments();
      if (response.success && response.data != null) {
        rawDocuments.assignAll(response.data!);
        _buildDocumentList(response.data!);
      } else {
        _buildDocumentList([]);
      }
    } catch (e) {
      debugPrint('DriverDocumentsController fetch error: $e');
      _buildDocumentList([]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _fetchDriverProfile() async {
    try {
      final res = await _driverService.getProfile();
      if (res.success && res.data != null) {
        final p = res.data!;
        driverProfile.value = p;
        dlNumber.value = p.licenseNumber?.isNotEmpty == true ? p.licenseNumber! : '—';
        dlExpiry.value = p.licenseExpiry?.isNotEmpty == true ? p.licenseExpiry! : '—';
        if (p.assignedVehicle != null) {
          assignedBus.value = p.assignedVehicle!.displayName;
        }

        final statusStr = (p.status ?? '').toLowerCase();
        isRejected.value = statusStr == 'rejected';
        isVerified.value = !isRejected.value && (p.documentsVerified == true);

        // Check rejection reason if available
        if (isRejected.value) {
          rejectionReason.value = 'Documents failed compliance check. Please re-upload legible files.';
        }
      }
    } catch (e) {
      debugPrint('Error fetching driver profile for documents: $e');
    }
  }

  String normalizeDocType(String? raw) {
    if (raw == null || raw.isEmpty) return 'other';
    final n = raw.toLowerCase().trim();
    if (n.contains('dl') || n.contains('license') || n.contains('licence') || n.contains('driving')) {
      return 'license';
    }
    if (n.contains('aadhaar') || n.contains('aadhar') || n.contains('pan') || n.contains('kyc') || n.contains('identity') || n.contains('id')) {
      return 'aadhaar';
    }
    if (n.contains('medical') || n.contains('fitness') || n.contains('health')) {
      return 'medical';
    }
    if (n.contains('insurance') || n.contains('agreement') || n.contains('contract') || n.contains('depot')) {
      return 'insurance';
    }
    if (n.contains('badge') || n.contains('training') || n.contains('safety')) {
      return 'badge';
    }
    return n;
  }

  void _buildDocumentList(List<DriverDocumentItem> apiDocs) {
    // Map of known required docs matching web app
    final requiredTypes = <String, Map<String, dynamic>>{
      'license': {
        'title': 'Driving License',
        'category': 'Commercial DL',
        'icon': Icons.badge_outlined,
        'mandatory': true,
      },
      'aadhaar': {
        'title': 'ID Proof (Aadhaar / PAN)',
        'category': 'Identity & KYC',
        'icon': Icons.badge_outlined,
        'mandatory': true,
      },
      'medical': {
        'title': 'Medical Certificate',
        'category': 'Medical & Fitness',
        'icon': Icons.medical_services_outlined,
        'mandatory': true,
      },
      'insurance': {
        'title': 'Depot Agreement / Insurance',
        'category': 'Depot Agreement & Contract',
        'icon': Icons.shield_outlined,
        'mandatory': true,
      },
      'badge': {
        'title': 'Driver Badge & Safety',
        'category': 'Training & Safety',
        'icon': Icons.military_tech_outlined,
        'mandatory': false,
      },
    };

    final List<DocumentRequirement> result = [];
    final Set<String> matchedSlots = {};

    // Group api docs by normalized category
    for (var doc in apiDocs) {
      final rawKey = doc.type ?? doc.typeLabel ?? '';
      final normKey = normalizeDocType(rawKey);

      DocumentReqStatus status = DocumentReqStatus.notUploaded;
      final s = (doc.status ?? '').toLowerCase();
      if (doc.isVerified || s == 'verified') {
        status = DocumentReqStatus.uploaded;
      } else if (s == 'rejected') {
        status = DocumentReqStatus.rejected;
      } else {
        status = DocumentReqStatus.underReview;
      }

      final info = requiredTypes[normKey] ?? {
        'title': doc.typeLabel ?? _capitalize(rawKey.isNotEmpty ? rawKey : 'Document'),
        'category': doc.typeLabel ?? 'Compliance Document',
        'icon': Icons.description_outlined,
        'mandatory': false,
      };

      matchedSlots.add(normKey);

      String? validText;
      if (doc.expiryDate != null && doc.expiryDate!.isNotEmpty) {
        validText = 'Valid till ${doc.expiryDate}';
      }

      final fileName = doc.fileName ?? (doc.url != null ? doc.url!.split('/').last : 'Document Attached');

      result.add(DocumentRequirement(
        id: doc.id ?? normKey,
        title: info['title'] as String,
        category: info['category'] as String,
        docType: normKey,
        icon: info['icon'] as IconData,
        isMandatory: info['mandatory'] as bool,
        status: status,
        validTillText: validText,
        fileName: fileName,
        fileUrl: doc.url,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
      ));
    }

    // Add remaining required slots that haven't been uploaded yet
    requiredTypes.forEach((key, info) {
      if (!matchedSlots.contains(key)) {
        result.add(DocumentRequirement(
          id: key,
          title: info['title'] as String,
          category: info['category'] as String,
          docType: key,
          icon: info['icon'] as IconData,
          isMandatory: info['mandatory'] as bool,
          status: DocumentReqStatus.notUploaded,
        ));
      }
    });

    documents.assignAll(result);

    // Sync verification status to other controllers
    final anyPending = result.any((d) => d.isMandatory && d.status != DocumentReqStatus.uploaded);
    final verifiedAll = !anyPending && result.any((d) => d.status == DocumentReqStatus.uploaded);
    isVerified.value = verifiedAll;

    if (Get.isRegistered<DriverHomeController>()) {
      Get.find<DriverHomeController>().isDocumentsVerified.value = verifiedAll;
    }
  }

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }

  Future<void> onRefresh() async => fetchDocuments();

  void onBackPressed() => Get.back();

  void onInfoTap() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Document Guidelines', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Text(
          'Please upload clear, legible copies of your government-issued documents. Supported formats: JPG, PNG, PDF (under 10MB). Documents undergo compliance verification within 24-48 hours.',
          style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Got it', style: TextStyle(color: Color(0xFFB042FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> deleteDocument(String id) async {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        title: const Text('Delete Document', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to remove this document?', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () async {
              Get.back();
              final res = await _driverService.deleteDocument(id);
              if (res.success) {
                Get.snackbar('Deleted', 'Document removed successfully.', backgroundColor: const Color(0xFF15151F), colorText: Colors.white);
                await fetchDocuments();
                if (Get.isRegistered<DriverProfileController>()) {
                  Get.find<DriverProfileController>().fetchProfile();
                }
              } else {
                Get.snackbar('Error', res.message ?? 'Failed to delete', backgroundColor: const Color(0xFF15151F), colorText: Colors.redAccent);
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  void onDocumentTap(DocumentRequirement doc) {
    Get.delete<UploadDocumentController>(force: true);

    if (doc.status == DocumentReqStatus.notUploaded) {
      Get.put(UploadDocumentController(
        documentTitle: doc.title,
        documentIcon: doc.icon,
        documentTypeKey: doc.docType,
      ));
      Get.to(() => const UploadDocumentView());
    } else {
      Get.put(UploadDocumentController(
        documentTitle: doc.title,
        documentIcon: doc.icon,
        documentTypeKey: doc.docType,
        existingDocumentId: doc.id,
        existingUrl: doc.fileUrl,
        existingFileName: doc.fileName,
        existingFileSize: doc.fileSize,
        existingStatus: doc.status.label,
        isReadOnly: doc.status == DocumentReqStatus.uploaded,
      ));
      Get.to(() => const PreviewDocumentView());
    }
  }
}
