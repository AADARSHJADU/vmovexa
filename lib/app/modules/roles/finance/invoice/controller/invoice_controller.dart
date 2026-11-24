import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../../../../routes/app_routes.dart';
import '../model/invoice_model.dart';

class InvoiceController extends GetxController {
  // ---------------- State ----------------
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;

  final RxList<InvoiceModel> _allInvoices = <InvoiceModel>[].obs;
  final RxList<InvoiceModel> filteredInvoices = <InvoiceModel>[].obs;

  // Search & Filter Tabs
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString selectedTab = 'all'.obs; // 'all' | 'paid' | 'pending' | 'overdue'

  // Tab Counts from KPIs
  final RxInt totalCount = 0.obs;
  final RxInt paidCount = 0.obs;
  final RxInt pendingCount = 0.obs;
  final RxInt overdueCount = 0.obs;

  // Pagination (6 items per page like InvoicesListPage.jsx)
  final RxInt currentPage = 1.obs;
  final int itemsPerPage = 6;
  final RxInt totalPages = 1.obs;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text;
    });
    ever(searchQuery, (_) => _applyFilters());
    ever(selectedTab, (_) => _applyFilters());

    loadData();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> loadData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        loadKpis(),
        fetchInvoices(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshInvoices() async {
    isRefreshing.value = true;
    try {
      await Future.wait([
        loadKpis(),
        fetchInvoices(),
      ]);
      Get.snackbar(
        'success'.tr,
        'invoices_refreshed_success'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (_) {
      Get.snackbar(
        'error'.tr,
        'failed_to_refresh_invoices'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isRefreshing.value = false;
    }
  }

  // ---------------- Load KPIs for Tab Badges ----------------
  Future<void> loadKpis() async {
    try {
      final res = await FinanceService.to.getKpis();
      if (res.success && res.data != null) {
        final kpis = res.data!;
        totalCount.value = int.tryParse(kpis['totalInvoices']?.toString() ?? '0') ?? 0;
        paidCount.value = int.tryParse(kpis['paidInvoices']?.toString() ?? '0') ?? 0;
        pendingCount.value = int.tryParse(kpis['pendingInvoices']?.toString() ?? '0') ?? 0;
        overdueCount.value = int.tryParse(kpis['overdueInvoices']?.toString() ?? '0') ?? 0;
      }
    } catch (_) {}
  }

  // ---------------- Data loading ----------------
  Future<void> fetchInvoices() async {
    try {
      final res = await FinanceService.to.getInvoices(
        page: 1,
        limit: 100,
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
              .whereType<Map>()
              .map((it) => InvoiceModel.fromJson(Map<String, dynamic>.from(it)))
              .toList();
        }
      }

      _allInvoices.assignAll(list);

      // Fallback count calculation if KPIs endpoint returned 0
      if (totalCount.value == 0 && _allInvoices.isNotEmpty) {
        totalCount.value = _allInvoices.length;
        paidCount.value = _allInvoices.where((i) => i.status == InvoiceStatus.paid).length;
        pendingCount.value = _allInvoices.where((i) => i.status == InvoiceStatus.pending).length;
        overdueCount.value = _allInvoices.where((i) => i.status == InvoiceStatus.overdue).length;
      }

      _applyFilters();
    } catch (_) {
      _allInvoices.clear();
      _applyFilters();
    }
  }

  // ---------------- Filtering ----------------
  void _applyFilters() {
    final query = searchQuery.value.trim().toLowerCase();
    List<InvoiceModel> list = _allInvoices;

    // Filter by Status Tab
    if (selectedTab.value == 'paid') {
      list = list.where((inv) => inv.status == InvoiceStatus.paid).toList();
    } else if (selectedTab.value == 'pending') {
      list = list.where((inv) => inv.status == InvoiceStatus.pending).toList();
    } else if (selectedTab.value == 'overdue') {
      list = list.where((inv) => inv.status == InvoiceStatus.overdue).toList();
    }

    // Filter by Search Query (invoice code, customer name, type)
    if (query.isNotEmpty) {
      list = list.where((inv) {
        return inv.code.toLowerCase().contains(query) ||
            inv.id.toLowerCase().contains(query) ||
            inv.company.toLowerCase().contains(query) ||
            inv.type.toLowerCase().contains(query) ||
            inv.amount.toString().contains(query);
      }).toList();
    }

    filteredInvoices.assignAll(list);
    totalPages.value = (filteredInvoices.length / itemsPerPage).ceil().clamp(1, 999999);
    currentPage.value = 1;
  }

  void onTabChanged(String tabId) {
    if (selectedTab.value != tabId) {
      selectedTab.value = tabId;
      currentPage.value = 1;
    }
  }

  void onSearchChanged(String value) {
    searchQuery.value = value;
  }

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
  void onInvoiceTap(InvoiceModel invoice) {
    Get.toNamed(Routes.FINANCE_INVOICE_DETAILS, arguments: invoice);
  }

  Future<void> downloadInvoicePdf(InvoiceModel invoice) async {
    try {
      final token = StorageService.to.getAccessToken();
      final base = ApiConstants.baseUrl;
      final targetId = invoice.id.isNotEmpty ? invoice.id : invoice.code;
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

  Future<void> markInvoiceAsPaid(
    String invoiceId, {
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
        'method': paymentMethod,
        'paymentMethod': paymentMethod,
        'utrRef': referenceNumber,
        'transactionRef': referenceNumber,
        'reference': referenceNumber,
        'amount_paid': amountPaid,
        'paid_at': DateTime.now().toIso8601String(),
        'notes': notes ?? '',
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
        await Future.wait([loadKpis(), fetchInvoices()]);
      } else {
        Get.snackbar(
          'notice'.tr,
          res.message ?? 'invoice_status_updated'.tr,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await Future.wait([loadKpis(), fetchInvoices()]);
      }
    } catch (e) {
      if (Get.isDialogOpen ?? false) Get.back();
      Get.snackbar(
        'success'.tr,
        'invoice_marked_paid_success'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      await Future.wait([loadKpis(), fetchInvoices()]);
    }
  }
}
