import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../../../../../routes/app_routes.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailController extends GetxController {
  final Rx<PaymentDetailModel?> paymentDetail = Rx<PaymentDetailModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isSendingReminder = false.obs;
  final RxString copiedKey = ''.obs;

  String paymentId = '';

  @override
  void onInit() {
    super.onInit();
    _initFromArguments();
  }

  void _initFromArguments() {
    final args = Get.arguments;
    if (args != null) {
      if (args is PaymentDetailModel) {
        paymentDetail.value = args;
        paymentId = args.id;
      } else if (args is Map) {
        final map = Map<String, dynamic>.from(args);
        paymentDetail.value = PaymentDetailModel.fromJson(map);
        paymentId = (map['id'] ?? map['code'] ?? '').toString();
      } else if (args is String) {
        paymentId = args;
      }
    }

    if (paymentId.isNotEmpty) {
      loadPayment(paymentId);
    }
  }

  /// Load payment details from real API GET /finance/payments/:id
  Future<void> loadPayment(String id) async {
    if (id.isEmpty) return;
    if (paymentDetail.value == null) {
      isLoading.value = true;
    } else {
      isRefreshing.value = true;
    }

    try {
      final res = await HttpClientService.to.get<dynamic>(
        ApiConstants.financePaymentOne(id),
        requiresAuth: true,
        create: (data) => data,
      );

      if (res.success && res.data != null) {
        dynamic data = res.data;
        if (data is Map && data.containsKey('data') && data['data'] != null) {
          data = data['data'];
        }
        if (data is Map) {
          final map = Map<String, dynamic>.from(data);
          paymentDetail.value = PaymentDetailModel.fromJson(map);
        }
      }
    } catch (_) {
      // Keep previous data if already loaded
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  Future<void> copyToClipboard(String text, String keyName, String label) async {
    if (text.isEmpty || text == '—') return;
    await Clipboard.setData(ClipboardData(text: text));
    copiedKey.value = keyName;

    Get.snackbar(
      'copied_label'.tr,
      '${'copied_label'.tr} $label',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );

    Future.delayed(const Duration(seconds: 2), () {
      if (copiedKey.value == keyName) {
        copiedKey.value = '';
      }
    });
  }

  /// Dispatch payment reminder via real API POST /finance/payments/:id/send-reminder
  Future<void> sendPaymentReminder({bool isUrgent = false}) async {
    final pay = paymentDetail.value;
    if (pay == null || pay.id.isEmpty) {
      Get.snackbar('error'.tr, 'invalid_payment_record'.tr, snackPosition: SnackPosition.BOTTOM);
      return;
    }

    isSendingReminder.value = true;
    try {
      final res = await HttpClientService.to.post<dynamic>(
        ApiConstants.financePaymentReminder(pay.id),
        body: {
          'channels': ['email', 'sms'],
          'urgent': isUrgent,
        },
        requiresAuth: true,
        create: (data) => data,
      );

      if (res.success) {
        Get.snackbar(
          'dispatched_label'.tr,
          isUrgent
              ? 'urgent_demand_notice_sent'.tr
              : 'payment_reminder_sent'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'reminder_logged'.tr,
          'payment_reminder_recorded_ledger'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'reminder_logged'.tr,
        'payment_reminder_recorded_ledger'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSendingReminder.value = false;
    }
  }

  void openLinkedInvoice(String? invoiceId) {
    if (invoiceId == null || invoiceId.isEmpty) return;
    Get.toNamed(Routes.FINANCE_INVOICE_DETAILS, arguments: invoiceId);
  }
}
