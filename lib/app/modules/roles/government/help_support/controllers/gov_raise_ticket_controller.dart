import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class GovRaiseTicketController extends GetxController {
  final GovernmentService _service = GovernmentService.to;
  final ImagePicker _picker = ImagePicker();

  final TextEditingController subjectController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  // Government categories matching Admin Panel and Government domain
  final List<String> categories = const [
    'General',
    'Technical',
    'Emergency Broadcast',
    'Route & Schedule',
    'Commuter Safety & Telemetry',
    'Statutory Audit & Reports',
    'Transit Display Hardware',
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
          'gov_help.attachments'.tr,
          'gov_help.attach_file'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
      } else {
        attachments.add({
          'url': file.path,
          'fileName': file.name,
          'fileType': 'image',
          'fileSize': await file.length(),
        });
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
        'gov_help.ticket_subject'.tr,
        'gov_help.ticket_subject_hint'.tr,
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
        'gov_help.description'.tr,
        'gov_help.description_hint'.tr,
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
          'gov_help.submit_ticket'.tr,
          'gov_help.ticket_submitted_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );

        // Navigate to Government Support History screen
        Get.offNamed(Routes.GOV_SUPPORT_HISTORY);
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'error'.tr,
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
