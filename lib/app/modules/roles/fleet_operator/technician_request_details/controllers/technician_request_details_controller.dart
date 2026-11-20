import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/models/work_order_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class TechnicianRequestDetailsController extends GetxController {
  final Rx<WorkOrderModel?> order = Rx<WorkOrderModel?>(null);
  final RxBool isLoading = false.obs;

  late String orderId;

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

  Future<void> fetchOrderDetails() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getWorkOrder(orderId);
      if (res.success && res.data != null) {
        order.value = res.data;
      } else if (order.value == null) {
        // order.value = _getDefaultOrder();
      }
    } catch (e) {
      debugPrint('Error fetching work order details: $e');
      if (order.value == null) {
        // order.value = _getDefaultOrder();
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> callTechnician() async {
    final phone = order.value?.technician?.phone ?? '+919876543210';
    if (phone.isEmpty) {
      Get.snackbar(
        'technician'.tr,
        'No phone number recorded for assigned technician.',
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
          'Technician direct phone: $phone',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'technician'.tr,
        'Dialing $phone',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  void openEditOrder() async {
    if (order.value == null) return;
    final result = await Get.toNamed(
      Routes.CREATE_TECHNICIAN_REQUEST,
      arguments: {
        'order': order.value,
        'orderId': order.value!.id,
        'isEdit': true,
      },
    );
    if (result == true) {
      fetchOrderDetails();
    }
  }
}
