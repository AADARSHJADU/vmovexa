import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/invoice/generate_invoice/model/invoice_models.dart';

import '../view/invoice_preview_view.dart';

class GenerateInvoiceController extends GetxController {
  // ==========================================================
  // Customer Details
  // ==========================================================
  final Rx<InvoiceCustomer?> selectedCustomer = Rx<InvoiceCustomer?>(null);
  final List<InvoiceCustomer> customerOptions = [
    InvoiceCustomer(
      id: 'cust_1',
      name: 'VMOVEXA Advertising Pvt. Ltd.',
      gstin: '29ABCDE1234F1Z5',
      billingAddress: '123, MG Road, Indiranagar, Bengaluru, Karnataka - 560038',
      placeOfSupply: 'Karnataka (29)',
    ),
    InvoiceCustomer(
      id: 'cust_2',
      name: 'CityMove Solutions',
      gstin: '27ABCDE5678F1Z2',
      billingAddress: '45, FC Road, Shivaji Nagar, Pune, Maharashtra - 411005',
      placeOfSupply: 'Maharashtra (27)',
    ),
    InvoiceCustomer(
      id: 'cust_3',
      name: 'Urban Adz Media',
      gstin: '07ABCDE9012F1Z8',
      billingAddress: '12, Connaught Place, New Delhi - 110001',
      placeOfSupply: 'Delhi (07)',
    ),
  ];

  void setCustomer(String? customerId) {
    selectedCustomer.value = customerOptions.firstWhereOrNull((c) => c.id == customerId);
    if (selectedCustomer.value != null) {
      billingAddress.value = selectedCustomer.value!.billingAddress;
      placeOfSupply.value = selectedCustomer.value!.placeOfSupply;
      customerError.value = null;
    }
  }

  final RxString billingAddress = ''.obs;
  final gstinCtrl = TextEditingController();

  final RxnString customerError = RxnString();
  final RxnString billingAddressError = RxnString();

  // ==========================================================
  // Invoice Details
  // ==========================================================
  final Rx<DateTime> invoiceDate = DateTime(2026, 8, 7).obs;
  final Rx<DateTime> dueDate = DateTime(2026, 8, 21).obs;
  final poReferenceCtrl = TextEditingController(text: 'PO-12345');

  final RxString currency = 'INR - Indian Rupee'.obs;
  final List<String> currencyOptions = const ['INR - Indian Rupee', 'USD - US Dollar', 'EUR - Euro'];

  final RxString placeOfSupply = ''.obs;
  final List<String> placeOfSupplyOptions = const [
    'Karnataka (29)', 'Maharashtra (27)', 'Delhi (07)', 'Tamil Nadu (33)', 'Gujarat (24)',
  ];

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _formatDate(DateTime dt) => '${dt.day.toString().padLeft(2, '0')} ${_monthNames[dt.month - 1]} ${dt.year}';

  String get invoiceDateText => _formatDate(invoiceDate.value);
  String get dueDateText => _formatDate(dueDate.value);

  Future<void> onPickInvoiceDate(BuildContext context) async {
    final picked = await _showThemedDatePicker(context, invoiceDate.value);
    if (picked != null) invoiceDate.value = picked;
  }

  Future<void> onPickDueDate(BuildContext context) async {
    final picked = await _showThemedDatePicker(context, dueDate.value);
    if (picked != null) dueDate.value = picked;
  }

  Future<DateTime?> _showThemedDatePicker(BuildContext context, DateTime initial) {
    return showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFB042FF),
            onPrimary: Colors.white,
            surface: Color(0xFF15151F),
            onSurface: Colors.white,
          ),
          dialogBackgroundColor: const Color(0xFF0B0B14),
        ),
        child: child!,
      ),
    );
  }

  void setCurrency(String? value) => currency.value = value ?? currency.value;
  void setPlaceOfSupply(String? value) => placeOfSupply.value = value ?? '';

  // ==========================================================
  // Invoice Items
  // ==========================================================
  final RxList<InvoiceLineItem> items = <InvoiceLineItem>[].obs;

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.amount);
  double get cgst => subtotal * 0.09;
  double get sgst => subtotal * 0.09;
  double get totalAmount => subtotal + cgst + sgst;

  String _formatCurrency(double value) {
    // Simple Indian-style digit grouping (e.g. 1,80,25,000.00) without extra packages.
    final isNegative = value < 0;
    final fixed = value.abs().toStringAsFixed(2);
    final parts = fixed.split('.');
    final intPart = parts[0];

    String result;
    if (intPart.length <= 3) {
      result = intPart;
    } else {
      final last3 = intPart.substring(intPart.length - 3);
      String remaining = intPart.substring(0, intPart.length - 3);
      final groups = <String>[];
      while (remaining.length > 2) {
        groups.insert(0, remaining.substring(remaining.length - 2));
        remaining = remaining.substring(0, remaining.length - 2);
      }
      if (remaining.isNotEmpty) groups.insert(0, remaining);
      result = '${groups.join(',')},$last3';
    }
    return '${isNegative ? '-' : ''}\u20b9$result.${parts[1]}';
  }

  String get subtotalText => _formatCurrency(subtotal);
  String get cgstText => _formatCurrency(cgst);
  String get sgstText => _formatCurrency(sgst);
  String get totalAmountText => _formatCurrency(totalAmount);

  void onAddItem(BuildContext context) {
    final descCtrl = TextEditingController();
    final hsnCtrl = TextEditingController();
    final qtyCtrl = TextEditingController(text: '1');
    final rateCtrl = TextEditingController();

    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Add Invoice Item', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _dialogField('Item Description', descCtrl),
              const SizedBox(height: 10),
              _dialogField('HSN/SAC', hsnCtrl),
              const SizedBox(height: 10),
              _dialogField('Quantity', qtyCtrl, keyboardType: TextInputType.number),
              const SizedBox(height: 10),
              _dialogField('Rate (\u20b9)', rateCtrl, keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          TextButton(
            onPressed: () {
              final qty = double.tryParse(qtyCtrl.text.trim()) ?? 0;
              final rate = double.tryParse(rateCtrl.text.trim()) ?? 0;
              if (descCtrl.text.trim().isEmpty || qty <= 0 || rate <= 0) {
                Get.snackbar('Missing Information', 'Please fill all item fields correctly',
                    backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
                return;
              }
              items.add(InvoiceLineItem(
                id: 'item_${DateTime.now().millisecondsSinceEpoch}',
                description: descCtrl.text.trim(),
                hsnSac: hsnCtrl.text.trim().isEmpty ? '—' : hsnCtrl.text.trim(),
                quantity: qty,
                rate: rate,
              ));
              Get.back();
            },
            child: const Text('Add Item', style: TextStyle(color: Color(0xFFB042FF), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _dialogField(String label, TextEditingController ctrl, {TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54, fontSize: 12),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.white.withOpacity(0.15))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFB042FF))),
      ),
    );
  }

  void onRemoveItem(String id) => items.removeWhere((i) => i.id == id);

  // ==========================================================
  // Notes
  // ==========================================================
  final notesCtrl = TextEditingController(text: 'Thank you for your business!');
  static const int notesMaxLen = 500;
  final RxInt notesLen = 0.obs;

  // ==========================================================
  // Generated invoice
  // ==========================================================
  final RxString invoiceNumber = 'INV-2026-000157'.obs;
  final RxBool isGenerating = false.obs;

  @override
  void onInit() {
    super.onInit();
    notesCtrl.addListener(() => notesLen.value = notesCtrl.text.length);
    notesLen.value = notesCtrl.text.length;
  }

  @override
  void onClose() {
    gstinCtrl.dispose();
    poReferenceCtrl.dispose();
    notesCtrl.dispose();
    super.onClose();
  }

  bool _validate() {
    bool isValid = true;
    if (selectedCustomer.value == null) {
      customerError.value = 'Please select a customer';
      isValid = false;
    } else {
      customerError.value = null;
    }
    if (billingAddress.value.trim().isEmpty) {
      billingAddressError.value = 'Please select a billing address';
      isValid = false;
    } else {
      billingAddressError.value = null;
    }
    return isValid;
  }

  Future<void> onGenerateInvoicePressed() async {
    if (!_validate()) {
      Get.snackbar('Missing Information', 'Please fill all required fields marked with *',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (items.isEmpty) {
      Get.snackbar('No Items Added', 'Please add at least one invoice item',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
      return;
    }

    isGenerating.value = true;
    try {
      // TODO: replace with a real API call that creates the invoice server-side
      await Future.delayed(const Duration(milliseconds: 800));
      Get.to(() => const InvoicePreviewView());
    } finally {
      isGenerating.value = false;
    }
  }

  void onEditInvoice() => Get.back();

  final RxBool isDownloading = false.obs;

  Future<void> onDownloadInvoice() async {
    isDownloading.value = true;
    try {
      // TODO: generate a PDF (e.g. via the pdf skill/package) and save/share it
      await Future.delayed(const Duration(seconds: 1));
      Get.snackbar('Invoice Downloaded', '${invoiceNumber.value}.pdf has been saved.',
          backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isDownloading.value = false;
    }
  }

  void onBackPressed() => Get.back();

  void onInfoTap() {
    // TODO: show a help sheet explaining invoice fields
  }
}
