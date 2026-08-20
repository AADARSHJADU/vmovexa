import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../routes/app_routes.dart';
import '../model/invoice_model.dart';

class InvoiceController extends GetxController {
  // ---------------- State ----------------
  final RxBool isLoading = true.obs;

  final RxList<InvoiceModel> _allInvoices = <InvoiceModel>[].obs;
  final RxList<InvoiceModel> filteredInvoices = <InvoiceModel>[].obs;

  final Rx<InvoiceSummary> summary = InvoiceSummary.empty().obs;

  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;

  final Rx<DateTimeRange?> selectedDateRange = Rx<DateTimeRange?>(null);

  final RxInt currentPage = 1.obs;
  final int itemsPerPage = 8;
  final RxInt totalPages = 1.obs;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text;
    });
    ever(searchQuery, (_) => _applyFilters());
    fetchInvoices();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  // ---------------- Data loading ----------------
  Future<void> fetchInvoices() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API / repository call.
      final data = _mockInvoices();
      _allInvoices.assignAll(data);
      selectedDateRange.value = DateTimeRange(
        start: DateTime(2026, 8, 1),
        end: DateTime(2026, 8, 7),
      );
      summary.value = InvoiceSummary.fromInvoices(_allInvoices);
      _applyFilters();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshInvoices() async => fetchInvoices();

  // ---------------- Filtering ----------------
  void _applyFilters() {
    final query = searchQuery.value.trim().toLowerCase();
    List<InvoiceModel> list = _allInvoices;

    if (query.isNotEmpty) {
      list = list.where((inv) {
        return inv.id.toLowerCase().contains(query) ||
            inv.company.toLowerCase().contains(query) ||
            inv.amount.toString().contains(query);
      }).toList();
    }

    filteredInvoices.assignAll(list);
    totalPages.value = (filteredInvoices.length / itemsPerPage).ceil().clamp(1, 999999);
    currentPage.value = 1;
  }

  void onSearchChanged(String value) => searchQuery.value = value;

  // ---------------- Pagination ----------------
  List<InvoiceModel> get pagedInvoices {
    final start = (currentPage.value - 1) * itemsPerPage;
    if (start >= filteredInvoices.length) return [];
    final end = (start + itemsPerPage).clamp(0, filteredInvoices.length);
    return filteredInvoices.sublist(start, end);
  }

  void nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++;
  }

  void previousPage() {
    if (currentPage.value > 1) currentPage.value--;
  }

  // ---------------- Actions ----------------
  Future<void> pickDateRange(BuildContext context) async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: selectedDateRange.value,
    );
    if (picked != null) {
      selectedDateRange.value = picked;
      // TODO: refetch invoices scoped to the new date range.
    }
  }

  void onGenerateInvoice() {
    Get.toNamed(Routes.GENERATE_INVOICE);
    // TODO: navigate to generate-invoice screen via Get.toNamed(Routes.GENERATE_INVOICE)
  }

  void onFilterTap() {
    // TODO: open filter bottom sheet / dialog
  }

  void onInvoiceTap(InvoiceModel invoice) {
    // TODO: navigate to invoice detail via Get.toNamed(Routes.INVOICE_DETAIL, arguments: invoice)
  }

  String get dateRangeLabel {
    final range = selectedDateRange.value;
    if (range == null) return 'Select date range';
    String fmt(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')} ${_month(d.month)} ${d.year}';
    return '${fmt(range.start)} - ${fmt(range.end)}';
  }

  String _month(int m) => const [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ][m - 1];

  // ---------------- Mock data ----------------
  List<InvoiceModel> _mockInvoices() {
    return [
      InvoiceModel(id: 'INV-2026-000156', company: 'VMOVEXA Advertising Pvt. Ltd.', invoiceDate: DateTime(2026, 8, 7), amount: 148750, status: InvoiceStatus.paid),
      InvoiceModel(id: 'INV-2026-000155', company: 'CityMove Solutions', invoiceDate: DateTime(2026, 8, 6), amount: 75000, status: InvoiceStatus.paid),
      InvoiceModel(id: 'INV-2026-000154', company: 'Urban Adz Media', invoiceDate: DateTime(2026, 8, 6), amount: 50000, status: InvoiceStatus.pending),
      InvoiceModel(id: 'INV-2026-000153', company: 'GoTransit Publicity', invoiceDate: DateTime(2026, 8, 5), amount: 120000, status: InvoiceStatus.overdue),
      InvoiceModel(id: 'INV-2026-000152', company: 'QuickRide Advertising', invoiceDate: DateTime(2026, 8, 4), amount: 80000, status: InvoiceStatus.paid),
      InvoiceModel(id: 'INV-2026-000151', company: 'MetroVista Communications', invoiceDate: DateTime(2026, 8, 3), amount: 60000, status: InvoiceStatus.pending),
      InvoiceModel(id: 'INV-2026-000150', company: 'BrandBuzz Digital', invoiceDate: DateTime(2026, 8, 2), amount: 90000, status: InvoiceStatus.paid),
      InvoiceModel(id: 'INV-2026-000149', company: 'AdSphere Network', invoiceDate: DateTime(2026, 8, 1), amount: 110000, status: InvoiceStatus.overdue),
      InvoiceModel(id: 'INV-2026-000148', company: 'Pixel Route Media', invoiceDate: DateTime(2026, 7, 31), amount: 45000, status: InvoiceStatus.paid),
      InvoiceModel(id: 'INV-2026-000147', company: 'Transit Ads Co.', invoiceDate: DateTime(2026, 7, 30), amount: 62000, status: InvoiceStatus.pending),
    ];
  }
}
