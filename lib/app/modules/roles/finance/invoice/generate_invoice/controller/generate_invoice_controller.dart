import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../../controller/invoice_controller.dart';
import '../../../home/controller/finance_home_controller.dart';

class GenerateInvoiceItemState {
  final int id;
  final TextEditingController descCtrl;
  final TextEditingController qtyCtrl;
  final TextEditingController rateCtrl;

  GenerateInvoiceItemState({
    required this.id,
    String desc = '',
    int qty = 1,
    num rate = 0,
  })  : descCtrl = TextEditingController(text: desc),
        qtyCtrl = TextEditingController(text: qty > 0 ? qty.toString() : '1'),
        rateCtrl = TextEditingController(text: rate > 0 ? rate.toString() : '');

  double get quantity => double.tryParse(qtyCtrl.text.trim()) ?? 1.0;
  double get unitRate => double.tryParse(rateCtrl.text.trim()) ?? 0.0;
  double get total => quantity * unitRate;

  String get description => descCtrl.text.trim().isEmpty ? 'Item' : descCtrl.text.trim();
  String get hsnSac => '998363';
  double get rate => unitRate;
  double get amount => total;

  void dispose() {
    descCtrl.dispose();
    qtyCtrl.dispose();
    rateCtrl.dispose();
  }
}

class GenerateInvoiceController extends GetxController {
  // ---------------- Stepper State (1 to 4) ----------------
  final RxInt currentStep = 1.obs;
  final RxBool isSubmitting = false.obs;

  // ---------------- STEP 1: Customer Details ----------------
  final customerNameCtrl = TextEditingController();
  final gstinCtrl = TextEditingController();
  final poReferenceCtrl = TextEditingController();
  final billingAddressCtrl = TextEditingController();

  // ---------------- STEP 2: Line Items ----------------
  final RxList<GenerateInvoiceItemState> items = <GenerateInvoiceItemState>[].obs;
  final RxDouble subtotal = 0.0.obs;

  // ---------------- STEP 3: Taxes & Terms ----------------
  final RxString placeOfSupply = '27-Maharashtra'.obs;
  final List<Map<String, String>> placeOfSupplyOptions = const [
    {'value': '27-Maharashtra', 'label': '27 - Maharashtra (CGST 9% + SGST 9%)'},
    {'value': '23-Madhya Pradesh', 'label': '23 - Madhya Pradesh (IGST 18%)'},
    {'value': '07-Delhi', 'label': '07 - Delhi (IGST 18%)'},
    {'value': '29-Karnataka', 'label': '29 - Karnataka (IGST 18%)'},
    {'value': '33-Tamil Nadu', 'label': '33 - Tamil Nadu (IGST 18%)'},
    {'value': '24-Gujarat', 'label': '24 - Gujarat (IGST 18%)'},
  ];

  final Rx<DateTime> dueDate = Rx<DateTime>(DateTime.now().add(const Duration(days: 15)));
  final deliveryTermsCtrl = TextEditingController();

  double get cgst => subtotal.value * 0.09;
  double get sgst => subtotal.value * 0.09;
  double get grandTotal => subtotal.value + cgst + sgst;

  // ---------------- Compatibility & Preview Properties ----------------
  final RxString invoiceNumber = 'INV-2026-PREVIEW'.obs;
  final RxString currency = 'INR - Indian Rupee (₹)'.obs;
  final RxBool isDownloading = false.obs;

  TextEditingController get notesCtrl => deliveryTermsCtrl;
  RxString get billingAddress => RxString(billingAddressCtrl.text.trim());

  String get invoiceDateText {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }
  String get dueDateText => dueDateFormatted;

  String get subtotalText => '₹${subtotal.value.toStringAsFixed(2)}';
  String get cgstText => '₹${cgst.toStringAsFixed(2)}';
  String get sgstText => '₹${sgst.toStringAsFixed(2)}';
  String get totalAmountText => '₹${grandTotal.toStringAsFixed(2)}';

  void onBackPressed() {
    Get.back();
  }

  void onEditInvoice() {
    currentStep.value = 1;
    Get.back();
  }

  Future<void> onDownloadInvoice() async {
    isDownloading.value = true;
    await Future.delayed(const Duration(milliseconds: 700));
    isDownloading.value = false;
    Get.snackbar(
      'Download Started',
      'Invoice preview download initiated',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  @override
  void onInit() {
    super.onInit();
    // Default with 1 line item
    addItem();
  }

  @override
  void onClose() {
    customerNameCtrl.dispose();
    gstinCtrl.dispose();
    poReferenceCtrl.dispose();
    billingAddressCtrl.dispose();
    deliveryTermsCtrl.dispose();
    for (var item in items) {
      item.dispose();
    }
    super.onClose();
  }

  // ---------------- Step 2 Items Actions ----------------
  void addItem() {
    final newItem = GenerateInvoiceItemState(id: DateTime.now().millisecondsSinceEpoch);
    newItem.qtyCtrl.addListener(calculateTotals);
    newItem.rateCtrl.addListener(calculateTotals);
    items.add(newItem);
    calculateTotals();
  }

  void removeItem(int id) {
    if (items.length <= 1) return;
    final item = items.firstWhereOrNull((i) => i.id == id);
    if (item != null) {
      item.dispose();
      items.remove(item);
      calculateTotals();
    }
  }

  void calculateTotals() {
    double sum = 0.0;
    for (var it in items) {
      sum += it.total;
    }
    subtotal.value = sum;
  }

  // ---------------- Date Picker ----------------
  Future<void> pickDueDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: dueDate.value,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF6366F1),
            onPrimary: Colors.white,
            surface: Color(0xFF1E293B),
            onSurface: Colors.white,
          ),
          dialogTheme: const DialogThemeData(
            backgroundColor: Color(0xFF0F172A),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      dueDate.value = picked;
    }
  }

  String get dueDateFormatted {
    final d = dueDate.value;
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  // ---------------- Stepper Navigation ----------------
  void goToStep(int step) {
    if (step < 1 || step > 4) return;
    if (step > 1 && customerNameCtrl.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Customer / Company Name is required',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      currentStep.value = 1;
      return;
    }
    if (step > 2) {
      final validItems = items.where((i) => i.descCtrl.text.trim().isNotEmpty && i.total > 0).toList();
      if (validItems.isEmpty) {
        Get.snackbar(
          'Validation Error',
          'Please add at least one line item with description and rate',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
        currentStep.value = 2;
        return;
      }
    }
    currentStep.value = step;
  }

  void nextStep() {
    goToStep(currentStep.value + 1);
  }

  void previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    } else {
      Get.back();
    }
  }

  // ---------------- STEP 4: Submit & Dispatch Invoice ----------------
  Future<void> submitInvoice() async {
    final customerName = customerNameCtrl.text.trim();
    if (customerName.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Customer name is required',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      currentStep.value = 1;
      return;
    }

    final validItems = items
        .where((i) => i.descCtrl.text.trim().isNotEmpty)
        .map((it) => {
              'description': it.descCtrl.text.trim(),
              'desc': it.descCtrl.text.trim(),
              'quantity': it.quantity,
              'qty': it.quantity,
              'unit_price': it.unitRate,
              'rate': it.unitRate,
              'hsn_sac': '998363',
              'tax_rate': 18,
            })
        .toList();

    if (validItems.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please add at least one valid line item',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      currentStep.value = 2;
      return;
    }

    final payload = <String, dynamic>{
      'billing_name': customerName,
      'customerName': customerName,
      'gstin': gstinCtrl.text.trim(),
      'billing_address': billingAddressCtrl.text.trim(),
      'billingAddress': billingAddressCtrl.text.trim(),
      'po_reference': poReferenceCtrl.text.trim(),
      'poReference': poReferenceCtrl.text.trim(),
      'due_date': dueDateFormatted,
      'dueDate': dueDateFormatted,
      'place_of_supply': placeOfSupply.value,
      'placeOfSupply': placeOfSupply.value,
      'delivery_terms': deliveryTermsCtrl.text.trim(),
      'deliveryTerms': deliveryTermsCtrl.text.trim(),
      'type': 'ad_spend',
      'payerType': 'advertiser',
      'line_items': validItems,
      'items': validItems,
      'subtotal': subtotal.value,
      'tax_amount': cgst + sgst,
      'total_amount': grandTotal,
    };

    isSubmitting.value = true;
    try {
      final res = await FinanceService.to.generateInvoice(payload);
      if (res.success) {
        Get.snackbar(
          'Invoice Generated',
          'Tax invoice has been issued and dispatched successfully.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );

        // Refresh invoices in InvoiceController and FinanceHomeController
        if (Get.isRegistered<InvoiceController>()) {
          Get.find<InvoiceController>().fetchInvoices();
        }
        if (Get.isRegistered<FinanceHomeController>()) {
          Get.find<FinanceHomeController>().fetchDashboardData();
        }

        Get.back();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to generate tax invoice',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'An error occurred: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSubmitting.value = false;
    }
  }
}
