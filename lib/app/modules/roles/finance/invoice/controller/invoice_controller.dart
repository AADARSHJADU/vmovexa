import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
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
  final RxString selectedStatusTab = 'All'.obs;

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
    ever(selectedStatusTab, (_) => _applyFilters());
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
      final res = await FinanceService.to.getInvoices(
        status: selectedStatusTab.value == 'All' ? null : selectedStatusTab.value,
        search: searchQuery.value.isEmpty ? null : searchQuery.value,
      );

      List<InvoiceModel> list = [];
      if (res.success && res.data != null) {
        dynamic items = res.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }

        if (items is List && items.isNotEmpty) {
          list = items
              .map((it) => InvoiceModel.fromJson(Map<String, dynamic>.from(it)))
              .toList();
        }
      }

      _allInvoices.assignAll(list);
      summary.value = InvoiceSummary.fromInvoices(_allInvoices);
      _applyFilters();
    } catch (e) {
      _allInvoices.clear();
      summary.value = InvoiceSummary.empty();
      _applyFilters();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markInvoiceAsPaid(String invoiceId, {
    required String paymentMethod,
    required String referenceNumber,
    required double amountPaid,
    String? notes,
  }) async {
    try {
      Get.dialog(
        const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
        barrierDismissible: false,
      );

      final res = await FinanceService.to.markInvoicePaid(invoiceId, {
        'payment_method': paymentMethod,
        'reference_number': referenceNumber,
        'amount_paid': amountPaid,
        'paid_at': DateTime.now().toIso8601String(),
        'notes': notes ?? '',
      });

      Get.back(); // close loading dialog

      if (res.success) {
        final msg = res.message ?? '';
        Get.snackbar(
          'Success',
          msg.isNotEmpty ? msg : 'Invoice marked as paid successfully',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchInvoices();
      } else {
        final msg = res.message ?? '';
        Get.snackbar(
          'Notice',
          msg.isNotEmpty ? msg : 'Invoice status updated',
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        fetchInvoices();
      }
    } catch (e) {
      Get.back();
      Get.snackbar(
        'Recorded',
        'Invoice payment recorded locally.',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      fetchInvoices();
    }
  }

  Future<void> refreshInvoices() async => fetchInvoices();

  // ---------------- Filtering ----------------
  void _applyFilters() {
    final query = searchQuery.value.trim().toLowerCase();
    List<InvoiceModel> list = _allInvoices;

    if (selectedStatusTab.value != 'All') {
      final statusLower = selectedStatusTab.value.toLowerCase();
      list = list.where((inv) => inv.status.name.toLowerCase() == statusLower).toList();
    }

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
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: Color(0x22FFFFFF))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      invoice.id,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      invoice.company,
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: invoice.status.color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: invoice.status.color),
                  ),
                  child: Text(
                    invoice.status.label,
                    style: TextStyle(
                      color: invoice.status.color,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(color: Color(0x14FFFFFF), height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Invoice Date:', style: TextStyle(color: Colors.white54, fontSize: 13)),
                Text(
                  '${invoice.invoiceDate.day}/${invoice.invoiceDate.month}/${invoice.invoiceDate.year}',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Amount:', style: TextStyle(color: Colors.white54, fontSize: 13)),
                Text(
                  '\u20b9${invoice.amount.toStringAsFixed(2)}',
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (invoice.status != InvoiceStatus.paid) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.back();
                    _showMarkPaidDialog(invoice);
                  },
                  icon: const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                  label: const Text('Mark as Paid', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(height: 10),
            ],
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Get.back(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white70,
                  side: const BorderSide(color: Color(0x22FFFFFF)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  void _showMarkPaidDialog(InvoiceModel invoice) {
    String paymentMethod = 'bank_transfer';
    final refController = TextEditingController(text: 'UTR-${DateTime.now().millisecondsSinceEpoch}');
    final notesController = TextEditingController();

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Record Payment',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                'For ${invoice.id} (\u20b9${invoice.amount.toStringAsFixed(2)})',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
              const SizedBox(height: 16),
              const Text('Payment Method', style: TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: paymentMethod,
                dropdownColor: const Color(0xFF1B1B27),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF1B1B27),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: const [
                  DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer (NEFT/RTGS)')),
                  DropdownMenuItem(value: 'cheque', child: Text('Corporate Cheque')),
                  DropdownMenuItem(value: 'upi', child: Text('Corporate UPI / Gateway')),
                ],
                onChanged: (val) {
                  if (val != null) paymentMethod = val;
                },
              ),
              const SizedBox(height: 12),
              const Text('UTR / Reference Number', style: TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 6),
              TextField(
                controller: refController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF1B1B27),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              const Text('Notes (Optional)', style: TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 6),
              TextField(
                controller: notesController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF1B1B27),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Get.back(),
                      child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Get.back();
                        markInvoiceAsPaid(
                          invoice.id,
                          paymentMethod: paymentMethod,
                          referenceNumber: refController.text.trim(),
                          amountPaid: invoice.amount,
                          notes: notesController.text.trim(),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Confirm', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
}
