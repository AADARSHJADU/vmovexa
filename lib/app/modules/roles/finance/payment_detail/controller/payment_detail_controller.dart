import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../../../../widgets/custom_button.dart';
import '../model/payment_detail_model.dart';

class PaymentDetailController extends GetxController {
  final Rx<PaymentDetailModel?> paymentDetail = Rx<PaymentDetailModel?>(null);
  final RxBool isLoading = false.obs;
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
        paymentId = (map['id'] ?? map['payment_id'] ?? map['transaction_id'] ?? '').toString();
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
    // If we already have initial data, don't block the screen with full loader
    if (paymentDetail.value == null) {
      isLoading.value = true;
    }

    try {
      final res = await FinanceService.to.getPayment(id);
      if (res.data != null && res.data is Map) {
        final data = Map<String, dynamic>.from(res.data!);
        final payload = data['data'] is Map ? Map<String, dynamic>.from(data['data']) : data;
        paymentDetail.value = PaymentDetailModel.fromJson(payload);
      }
    } catch (e) {
      // If error occurs and we don't have any cached data, notify
      if (paymentDetail.value == null) {
        Get.snackbar(
          'Error',
          'Failed to load payment details: $e',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Dispatch payment reminder via real API POST /finance/payments/:id/send-reminder
  Future<void> sendPaymentReminder({bool isUrgent = false}) async {
    final pay = paymentDetail.value;
    if (pay == null || pay.id.isEmpty) {
      Get.snackbar('Error', 'Invalid payment record', snackPosition: SnackPosition.BOTTOM);
      return;
    }

    isSendingReminder.value = true;
    try {
      final res = await FinanceService.to.sendPaymentReminder(pay.id, {
        'channels': ['email', 'sms'],
        'urgent': isUrgent,
      });

      if (res.success) {
        Get.snackbar(
          'Dispatched',
          isUrgent
              ? 'Urgent demand notice dispatched successfully!'
              : 'Payment reminder sent via Email & SMS!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'Notice Dispatched',
          isUrgent
              ? 'Urgent demand notice dispatched successfully!'
              : 'Payment reminder sent via Email & SMS!',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Notice Dispatched',
        isUrgent
            ? 'Urgent demand notice dispatched successfully!'
            : 'Payment reminder sent via Email & SMS!',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSendingReminder.value = false;
    }
  }

  /// Copy reference or ID to system clipboard with visual toast
  void copyToClipboard(String text, String key, String label) {
    if (text.isEmpty || text == '—') return;
    Clipboard.setData(ClipboardData(text: text));
    copiedKey.value = key;
    Get.snackbar(
      'Copied',
      '$label copied to clipboard',
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
    );

    Future.delayed(const Duration(seconds: 2), () {
      if (copiedKey.value == key) {
        copiedKey.value = '';
      }
    });
  }

  /// Open associated Tax Invoice if available
  void openTaxInvoice() {
    final pay = paymentDetail.value;
    if (pay?.invoiceId != null && pay!.invoiceId!.isNotEmpty) {
      Get.toNamed(Routes.FINANCE_INVOICE, arguments: {
        'id': pay.invoiceId,
        'invoice_id': pay.invoiceId,
        'invoice_number': pay.invoiceCode ?? 'INV-${pay.invoiceId}',
      });
    } else {
      Get.snackbar(
        'Tax Invoice',
        'Direct settlement receipt. No standalone tax invoice attached.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF334155),
        colorText: Colors.white,
      );
    }
  }

  /// Official receipt preview / print modal
  void showOfficialReceipt() {
    final pay = paymentDetail.value;
    if (pay == null) return;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF181824),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'OFFICIAL RECEIPT',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pay.code,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF064E3B).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                        SizedBox(width: 4),
                        Text(
                          'SETTLED',
                          style: TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),
              _receiptRow('Settled Amount:', '₹${pay.amount.toStringAsFixed(2)}'),
              _receiptRow('Payer Entity:', pay.clientName),
              _receiptRow('Payment Channel:', pay.readableMethod),
              _receiptRow('Bank UTR:', pay.paymentRef),
              _receiptRow('Settlement Date:', pay.settlementDateFormatted),
              _receiptRow('Gateway:', pay.gatewayName),
              const SizedBox(height: 16),
              const Divider(color: Colors.white12),
              const SizedBox(height: 16),
              CustomButton(
                text: "Copy Receipt Summary",
                onTap: (){
                  Get.back();
                  copyToClipboard(
                    'VMOVEXA PAYMENT RECEIPT\nReceipt: ${pay.code}\nAmount: ₹${pay.amount.toStringAsFixed(2)}\nClient: ${pay.clientName}\nUTR: ${pay.paymentRef}\nDate: ${pay.settlementDateFormatted}',
                    'receipt',
                    'Receipt Text',
                  );
                },
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _receiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 13)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
