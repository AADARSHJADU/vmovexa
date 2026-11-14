import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/models/work_order_model.dart';
import '../../../../../data/services/driver_service.dart';

class DriverWorkOrderDetailsController extends GetxController {
  final Rx<WorkOrderModel?> order = Rx<WorkOrderModel?>(null);
  final RxBool isLoading = false.obs;

  late String orderId;

  // Rate Technician state
  final RxInt userRating = 5.obs;
  final TextEditingController feedbackController = TextEditingController();
  final RxBool isSubmittingRating = false.obs;
  final RxBool isRated = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      if (args['order'] is WorkOrderModel) {
        order.value = args['order'] as WorkOrderModel;
        orderId = order.value!.id;
      } else if (args['orderId'] != null) {
        orderId = args['orderId'].toString();
      } else {
        orderId = '1';
      }
    } else {
      orderId = '1';
    }

    fetchOrderDetails();
  }

  @override
  void onClose() {
    feedbackController.dispose();
    super.onClose();
  }

  Future<void> fetchOrderDetails() async {
    isLoading.value = true;
    try {
      final res = await DriverService.to.getDriverWorkOrderById(orderId);
      if (res.success && res.data != null) {
        order.value = res.data;
      }
    } catch (e) {
      debugPrint('Error fetching driver work order details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> callTechnician() async {
    final phone = order.value?.technician?.phone ?? '';
    if (phone.isEmpty) {
      Get.snackbar(
        'technician'.tr,
        'no_phone_recorded'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
      return;
    }

    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'technician'.tr,
          '${'technician_direct_phone'.tr}: $phone',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'technician'.tr,
        '${'calling'.tr} $phone',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  Future<void> submitRating() async {
    isSubmittingRating.value = true;
    try {
      final res = await DriverService.to.rateDriverWorkOrder(
        orderId,
        rating: userRating.value,
        feedback: feedbackController.text.trim().isNotEmpty ? feedbackController.text.trim() : null,
      );

      if (res.success) {
        isRated.value = true;
        Get.snackbar(
          'success'.tr,
          'rating_submitted_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_to_submit_rating'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      debugPrint('Error submitting technician rating: $e');
      Get.snackbar(
        'error'.tr,
        'failed_to_submit_rating'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmittingRating.value = false;
    }
  }
}

