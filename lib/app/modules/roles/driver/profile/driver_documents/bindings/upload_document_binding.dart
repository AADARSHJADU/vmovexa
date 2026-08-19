import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/controller/upload_document_controller.dart';

/// NOTE: `UploadDocumentController` requires constructor args (documentTitle,
/// documentIcon) because the same wizard is reused for every document type.
/// It is normally instantiated directly via `Get.put(UploadDocumentController(...))`
/// from `DriverDocumentsController.onDocumentTap()` right before navigating here.
///
/// This binding is provided for the case where `UploadDocumentView` is opened
/// as a standalone named route — it registers a sensible default instance if
/// one hasn't already been put.
class UploadDocumentBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<UploadDocumentController>()) {
      final args = Get.arguments;
      Get.put(
        UploadDocumentController(
          documentTitle: (args is Map ? args['documentTitle'] : null) ?? 'Document',
          documentIcon: (args is Map ? args['documentIcon'] : null) ?? Icons.description_outlined,
        ),
      );
    }
  }
}
