import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'finance_help_support_controller.dart';

class FinanceRaiseTicketController extends GetxController {
  final ImagePicker _picker = ImagePicker();

  final TextEditingController subjectController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  // Admin panel exact 7 categories
  final List<String> categories = const [
    'General',
    'Technical',
    'Fastag & Tolls',
    'Billing & Payouts',
    'Hardware & Telematics',
    'Driver & Fleet Roster',
    'Route & Schedule',
  ];

  // Admin panel exact 4 priorities
  final List<Map<String, String>> priorities = const [
    {'value': 'low', 'labelKey': 'priority_low'},
    {'value': 'medium', 'labelKey': 'priority_medium'},
    {'value': 'high', 'labelKey': 'priority_high'},
    {'value': 'urgent', 'labelKey': 'priority_urgent'},
  ];

  final RxString selectedCategory = 'General'.obs;
  final RxString selectedPriority = 'medium'.obs;

  // File Attachments list: [{ 'url': ..., 'fileName': ..., 'fileSize': ..., 'fileType': ... }]
  final RxList<Map<String, dynamic>> attachments = <Map<String, dynamic>>[].obs;
  final RxBool isUploadingFile = false.obs;
  final RxBool isSubmitting = false.obs;

  @override
  void onClose() {
    subjectController.dispose();
    descriptionController.dispose();
    super.onClose();
  }

  String getCategoryLabel(String cat) {
    switch (cat) {
      case 'General':
        return 'category_general'.tr;
      case 'Technical':
        return 'category_technical'.tr;
      case 'Fastag & Tolls':
        return 'category_fastag_tolls'.tr;
      case 'Billing & Payouts':
        return 'category_billing_payouts'.tr;
      case 'Hardware & Telematics':
        return 'category_hardware_telematics'.tr;
      case 'Driver & Fleet Roster':
        return 'category_driver_roster'.tr;
      case 'Route & Schedule':
        return 'category_route_schedule'.tr;
      default:
        return cat;
    }
  }

  Future<void> pickAttachment({ImageSource source = ImageSource.gallery}) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        imageQuality: 85,
      );
      if (file == null) return;

      isUploadingFile.value = true;
      Get.snackbar(
        'attach_evidence_files_documents'.tr,
        'uploading_attachment'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
        duration: const Duration(seconds: 1),
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'support',
        requiresAuth: true,
      );

      final fileSize = await file.length();
      if (res.success && res.data != null) {
        final d = res.data!;
        final url = d['url']?.toString() ?? d['path']?.toString() ?? d['fileUrl']?.toString() ?? file.path;
        attachments.add({
          'url': url,
          'fileName': file.name,
          'fileType': 'image',
          'fileSize': fileSize,
        });
        Get.snackbar(
          'attach_evidence_files_documents'.tr,
          'finance_help.attachment_added'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      } else {
        // Fallback: Add file with local reference if server upload failed
        attachments.add({
          'url': file.path,
          'fileName': file.name,
          'fileType': 'image',
          'fileSize': fileSize,
        });
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        '${'finance_help.attachment_failed'.tr}: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingFile.value = false;
    }
  }

  void removeAttachment(int index) {
    if (index >= 0 && index < attachments.length) {
      attachments.removeAt(index);
    }
  }

  Future<void> submitTicket() async {
    final subject = subjectController.text.trim();
    if (subject.isEmpty) {
      Get.snackbar(
        'ticket_subject_required'.tr,
        'finance_help.validation_subject_empty'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    final desc = descriptionController.text.trim();
    if (desc.isEmpty) {
      Get.snackbar(
        'ticket_description_required'.tr,
        'finance_help.validation_desc_empty'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      final payload = {
        'subject': subject,
        'category': selectedCategory.value,
        'priority': selectedPriority.value,
        'description': desc,
        'attachments': attachments.toList(),
      };

      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.createSupportTicket(payload);
        if (res.success) {
          subjectController.clear();
          descriptionController.clear();
          attachments.clear();

          if (Get.isRegistered<FinanceHelpSupportController>()) {
            final helpController = Get.find<FinanceHelpSupportController>();
            await helpController.loadMyTickets();
            helpController.activeTabIndex.value = 1; // switch to tickets tab
          }

          Get.back(); // navigate back

          Get.snackbar(
            'support_ticket_raised_success'.tr,
            'finance_help.ticket_created_success'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            margin: const EdgeInsets.all(16),
            borderRadius: 10,
          );
        } else {
          Get.snackbar(
            'error'.tr,
            res.message ?? 'submission_failed'.tr,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
        }
      } else {
        Get.back();
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }
}
