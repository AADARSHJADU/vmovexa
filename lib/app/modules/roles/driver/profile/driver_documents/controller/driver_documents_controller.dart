import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/controller/upload_document_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/model/document_requirement_model.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/preview_document_view.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/upload_document_view.dart';

class DriverDocumentsController extends GetxController {
  final RxBool isLoading = false.obs;
  final RxList<DocumentRequirement> documents = <DocumentRequirement>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDocuments();
  }

  Future<void> fetchDocuments() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository call
      documents.assignAll(_mockDocuments());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchDocuments();

  void onBackPressed() => Get.back();

  void onInfoTap() {
    // TODO: show a help sheet explaining document requirements
  }

  void onDocumentTap(DocumentRequirement doc) {
    // Fresh controller instance per document so wizard state never leaks between docs
    Get.delete<UploadDocumentController>(force: true);
    Get.put(UploadDocumentController(documentTitle: doc.title, documentIcon: doc.icon));

    if (doc.status == DocumentReqStatus.notUploaded) {
      Get.to(() => const UploadDocumentView());
    } else {
      // Already has a file — jump straight to reviewing it in Preview.
      Get.to(() => const PreviewDocumentView());
    }
  }

  // ---------------- Mock data ----------------
  List<DocumentRequirement> _mockDocuments() {
    return [
      DocumentRequirement(
        id: 'driving_license',
        title: 'Driving License',
        icon: Icons.badge_outlined,
        isMandatory: true,
        status: DocumentReqStatus.uploaded,
        validTillText: 'Valid till 14 May 2028',
      ),
      DocumentRequirement(
        id: 'id_proof',
        title: 'ID Proof (Aadhaar / PAN)',
        icon: Icons.badge_outlined,
        isMandatory: true,
        status: DocumentReqStatus.uploaded,
      ),
      DocumentRequirement(
        id: 'insurance',
        title: 'Insurance Document',
        icon: Icons.shield_outlined,
        isMandatory: true,
        status: DocumentReqStatus.underReview,
        validTillText: 'Valid till 20 Dec 2025',
      ),
      DocumentRequirement(
        id: 'medical_certificate',
        title: 'Medical Certificate',
        icon: Icons.description_outlined,
        isMandatory: true,
        status: DocumentReqStatus.notUploaded,
      ),
      DocumentRequirement(
        id: 'other_document',
        title: 'Other Document (If any)',
        icon: Icons.more_horiz,
        isMandatory: false,
        status: DocumentReqStatus.notUploaded,
      ),
    ];
  }
}
