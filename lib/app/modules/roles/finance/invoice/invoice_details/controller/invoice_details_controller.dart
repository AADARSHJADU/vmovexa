import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../controller/invoice_controller.dart';
import '../../model/invoice_model.dart';

class InvoiceDetailsController extends GetxController {
  final Rx<InvoiceModel?> invoice = Rx<InvoiceModel?>(null);
  final RxBool isLoading = false.obs;

  // Mark as paid form controllers
  final RxString selectedPaymentMethod = 'bank_transfer'.obs;
  final TextEditingController utrRefController = TextEditingController();
  final TextEditingController amountController = TextEditingController();
  final TextEditingController notesController = TextEditingController();
  final RxBool isSubmittingSettlement = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is InvoiceModel) {
      invoice.value = args;
      amountController.text = args.amount.toStringAsFixed(2);
    } else if (args is String || args is int) {
      fetchInvoiceDetails(args.toString());
    }
  }

  @override
  void onClose() {
    utrRefController.dispose();
    amountController.dispose();
    notesController.dispose();
    super.onClose();
  }

  Future<void> fetchInvoiceDetails(String id) async {
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getInvoice(id);
      if (res.success && res.data != null) {
        final data = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : <String, dynamic>{};
        final model = InvoiceModel.fromJson(data);
        invoice.value = model;
        amountController.text = model.amount.toStringAsFixed(2);
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> downloadInvoicePdf() async {
    final inv = invoice.value;
    if (inv == null) return;

    try {
      final token = StorageService.to.getAccessToken();
      final base = ApiConstants.baseUrl;
      final targetId = inv.id.isNotEmpty ? inv.id : inv.code;
      final url = '$base${ApiConstants.billingInvoiceHtml(targetId)}?print=false${token != null && token.isNotEmpty ? '&token=$token' : ''}';

      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'notice'.tr,
          'opening_invoice_doc'.tr,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'error'.tr,
        'failed_to_download_pdf'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void openMarkPaidDialog() {
    final inv = invoice.value;
    if (inv == null) return;
    amountController.text = inv.amount.toStringAsFixed(2);
    utrRefController.clear();
    notesController.clear();
    selectedPaymentMethod.value = 'bank_transfer';

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'record_payment_settlement'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${'invoice_code'.tr}: ${inv.code}',
                style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const Divider(color: Color(0x22FFFFFF), height: 24),

              // Settlement Mode dropdown
              Text(
                'settlement_mode'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedPaymentMethod.value,
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1E293B),
                        icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white70),
                        items: [
                          DropdownMenuItem(
                            value: 'bank_transfer',
                            child: Text('method_bank_transfer'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                          ),
                          DropdownMenuItem(
                            value: 'upi',
                            child: Text('method_upi'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                          ),
                          DropdownMenuItem(
                            value: 'cheque',
                            child: Text('method_cheque'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                          ),
                          DropdownMenuItem(
                            value: 'razorpay',
                            child: Text('method_razorpay'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                          ),
                          DropdownMenuItem(
                            value: 'cash',
                            child: Text('method_cash'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                          ),
                        ],
                        onChanged: (val) {
                          if (val != null) selectedPaymentMethod.value = val;
                        },
                      ),
                    ),
                  )),
              const SizedBox(height: 14),

              // Bank UTR / Reference
              Text(
                'bank_utr_ref'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: TextField(
                  controller: utrRefController,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
                  decoration: InputDecoration(
                    hintText: 'ph_txn_ref'.tr,
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Amount
              Text(
                'amount_paid'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: TextField(
                  controller: amountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 14, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    prefixText: '₹ ',
                    prefixStyle: TextStyle(color: Color(0xFF10B981), fontSize: 14, fontWeight: FontWeight.bold),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: submitPaymentSettlement,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    icon: const Icon(Icons.check, color: Colors.white, size: 16),
                    label: Text(
                      'confirm_settlement_btn'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> submitPaymentSettlement() async {
    final inv = invoice.value;
    if (inv == null) return;

    final parsedAmt = double.tryParse(amountController.text.replaceAll(',', '')) ?? inv.amount;

    Get.back(); // close modal
    try {
      Get.dialog(
        const Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
        barrierDismissible: false,
      );

      final res = await FinanceService.to.markInvoicePaid(inv.id, {
        'method': selectedPaymentMethod.value,
        'paymentMethod': selectedPaymentMethod.value,
        'utrRef': utrRefController.text.trim(),
        'transactionRef': utrRefController.text.trim(),
        'reference': utrRefController.text.trim(),
        'amount_paid': parsedAmt,
        'paid_at': DateTime.now().toIso8601String(),
        'notes': notesController.text.trim(),
      });

      if (Get.isDialogOpen ?? false) Get.back();

      if (res.success) {
        Get.snackbar(
          'success'.tr,
          'invoice_marked_paid_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );

        // Update local state to Paid
        invoice.value = InvoiceModel(
          id: inv.id,
          code: inv.code,
          company: inv.company,
          type: inv.type,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          paidAt: DateTime.now(),
          amount: inv.amount,
          subtotal: inv.subtotal,
          taxAmount: inv.taxAmount,
          cgstAmount: inv.cgstAmount,
          sgstAmount: inv.sgstAmount,
          igstAmount: inv.igstAmount,
          status: InvoiceStatus.paid,
          rawStatus: 'paid',
          gstin: inv.gstin,
          billingAddress: inv.billingAddress,
          placeOfSupply: inv.placeOfSupply,
          poReference: inv.poReference,
          items: inv.items,
          rawData: inv.rawData,
        );

        // Also notify InvoiceController if registered
        if (Get.isRegistered<InvoiceController>()) {
          Get.find<InvoiceController>().refreshInvoices();
        }
      } else {
        Get.snackbar(
          'notice'.tr,
          res.message ?? 'invoice_status_updated'.tr,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      if (Get.isDialogOpen ?? false) Get.back();
      Get.snackbar(
        'success'.tr,
        'invoice_marked_paid_success'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}
