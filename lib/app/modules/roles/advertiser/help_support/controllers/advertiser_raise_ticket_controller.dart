import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../data/services/advertiser_service.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserRaiseTicketController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;
  final ImagePicker _picker = ImagePicker();

  final TextEditingController subjectController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  // Admin panel exact categories
  final List<String> categories = const [
    'General',
    'Technical',
    'Fastag & Tolls',
    'Billing & Payouts',
    'Hardware & Telematics',
    'Driver & Fleet Roster',
    'Route & Schedule',
  ];

  // Admin panel exact priorities
  final List<Map<String, String>> priorities = const [
    {'value': 'low', 'key': 'priority_low'},
    {'value': 'medium', 'key': 'priority_medium'},
    {'value': 'high', 'key': 'priority_high'},
    {'value': 'urgent', 'key': 'priority_urgent'},
  ];

  final RxString selectedCategory = 'General'.obs;
  final RxString selectedPriority = 'medium'.obs;

  // File Attachments list: [{ 'url': ..., 'fileName': ..., 'fileSize': ... }]
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

  Future<void> pickAttachment() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null) return;

      isUploadingFile.value = true;
      final res = await _service.uploadSupportFile(file.path);

      if (res.success && res.data != null) {
        final d = res.data!;
        final url = d['url']?.toString() ?? d['path']?.toString() ?? d['fileUrl']?.toString() ?? file.path;
        attachments.add({
          'url': url,
          'fileName': file.name,
          'fileType': 'image',
          'fileSize': await file.length(),
        });
        Get.snackbar(
          'attach_evidence_files_documents'.tr,
          'attachment_added_success'.tr,
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
          'fileSize': await file.length(),
        });
        Get.snackbar(
          'attach_evidence_files_documents'.tr,
          'attachment_added_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF3B82F6),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
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
    final description = descriptionController.text.trim();

    if (subject.isEmpty) {
      Get.snackbar(
        'required_label'.tr,
        'ticket_subject_required'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    if (description.isEmpty) {
      Get.snackbar(
        'required_label'.tr,
        'ticket_description_required'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return;
    }

    try {
      isSubmitting.value = true;
      final payload = {
        'subject': subject,
        'category': selectedCategory.value,
        'priority': selectedPriority.value.toLowerCase(),
        'description': description,
        'attachments': attachments.toList(),
      };

      final res = await _service.createTicket(payload);

      if (res.success) {
        Get.snackbar(
          'ticket_created_title'.tr,
          'support_ticket_raised_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );

        // Navigate to Support History screen
        Get.offNamed(Routes.ADVERTISER_SUPPORT_HISTORY);
      } else {
        Get.snackbar(
          'ticket_failed_title'.tr,
          res.message ?? 'ticket_failed_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
    } finally {
      isSubmitting.value = false;
    }
  }
}
