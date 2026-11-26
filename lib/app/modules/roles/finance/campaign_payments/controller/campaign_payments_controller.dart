import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../../../../../routes/app_routes.dart';
import '../model/campaign_payment_model.dart';

class CampaignPaymentsController extends GetxController {
  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;

  final RxList<CampaignPaymentModel> allCampaigns = <CampaignPaymentModel>[].obs;
  final RxList<CampaignPaymentModel> filteredCampaigns = <CampaignPaymentModel>[].obs;

  // Search & Filter
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString activeTab = 'all'.obs; // 'all' | 'pending' | 'paid' | 'live'
  final RxString statusFilter = 'all'.obs; // 'all' | 'approved' | 'live' | 'completed' | 'paused'
  final RxString sortBy = 'newest'.obs; // 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'title'

  // Top 4 KPI Stat Counters
  final RxInt pendingCount = 0.obs;
  final RxDouble totalPendingAmt = 0.0.obs;
  final RxInt paidCount = 0.obs;
  final RxInt liveCount = 0.obs;
  final RxDouble totalCollectedAmt = 0.0.obs;
  final RxInt allCount = 0.obs;

  // Pagination (10 per page like FinanceCampaignPaymentsPage.jsx)
  final RxInt currentPage = 1.obs;
  final int pageSize = 10;
  final RxInt totalPages = 1.obs;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text;
    });
    ever(searchQuery, (_) => _applyFilters());
    ever(activeTab, (_) => _applyFilters());
    ever(statusFilter, (_) => _applyFilters());
    ever(sortBy, (_) => _applyFilters());

    fetchCampaignPayments();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> fetchCampaignPayments() async {
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getCampaignPayments(page: 1, limit: 100);
      List<CampaignPaymentModel> list = [];
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
              .map((c) => CampaignPaymentModel.fromJson(Map<String, dynamic>.from(c)))
              .toList();
        }
      }

      allCampaigns.assignAll(list);
      _calculateKpis(list);
      _applyFilters();
    } catch (_) {
      allCampaigns.clear();
      _applyFilters();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshData() async {
    isRefreshing.value = true;
    try {
      await fetchCampaignPayments();
      Get.snackbar(
        'success'.tr,
        'campaign_payments_refreshed'.tr,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isRefreshing.value = false;
    }
  }

  void _calculateKpis(List<CampaignPaymentModel> list) {
    allCount.value = list.length;
    int pending = 0;
    double pendingAmt = 0.0;
    int paid = 0;
    double paidAmt = 0.0;
    int live = 0;

    for (final c in list) {
      if (c.isPaid) {
        paid++;
        paidAmt += c.totalPayable;
      } else {
        pending++;
        pendingAmt += c.totalPayable;
      }

      if (c.isLive) {
        live++;
      }
    }

    pendingCount.value = pending;
    totalPendingAmt.value = pendingAmt;
    paidCount.value = paid;
    totalCollectedAmt.value = paidAmt;
    liveCount.value = live;
  }

  void _applyFilters() {
    final query = searchQuery.value.trim().toLowerCase();
    List<CampaignPaymentModel> list = List.from(allCampaigns);

    // 1. Filter by Active Tab
    if (activeTab.value == 'pending') {
      list = list.where((c) => !c.isPaid).toList();
    } else if (activeTab.value == 'paid') {
      list = list.where((c) => c.isPaid).toList();
    } else if (activeTab.value == 'live') {
      list = list.where((c) => c.isLive).toList();
    }

    // 2. Filter by Status dropdown
    if (statusFilter.value != 'all') {
      list = list.where((c) => c.status == statusFilter.value).toList();
    }

    // 3. Search Query
    if (query.isNotEmpty) {
      list = list.where((c) {
        return c.title.toLowerCase().contains(query) ||
            c.code.toLowerCase().contains(query) ||
            c.brandName.toLowerCase().contains(query) ||
            c.clientDisplayName.toLowerCase().contains(query) ||
            c.clientEmail.toLowerCase().contains(query) ||
            c.clientPhone.toLowerCase().contains(query);
      }).toList();
    }

    // 4. Sort
    if (sortBy.value == 'newest') {
      list.sort((a, b) => (b.startDate ?? DateTime.now()).compareTo(a.startDate ?? DateTime.now()));
    } else if (sortBy.value == 'oldest') {
      list.sort((a, b) => (a.startDate ?? DateTime.now()).compareTo(b.startDate ?? DateTime.now()));
    } else if (sortBy.value == 'amount_high') {
      list.sort((a, b) => b.totalPayable.compareTo(a.totalPayable));
    } else if (sortBy.value == 'amount_low') {
      list.sort((a, b) => a.totalPayable.compareTo(b.totalPayable));
    } else if (sortBy.value == 'title') {
      list.sort((a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()));
    }

    filteredCampaigns.assignAll(list);
    totalPages.value = (filteredCampaigns.length / pageSize).ceil().clamp(1, 999999);
    currentPage.value = 1;
  }

  void onTabChanged(String tabId) {
    if (activeTab.value != tabId) {
      activeTab.value = tabId;
      currentPage.value = 1;
    }
  }

  void onStatusFilterChanged(String? val) {
    if (val != null) {
      statusFilter.value = val;
      currentPage.value = 1;
    }
  }

  void onSortChanged(String? val) {
    if (val != null) {
      sortBy.value = val;
      currentPage.value = 1;
    }
  }

  // ---------------- Pagination ----------------
  List<CampaignPaymentModel> get pagedCampaigns {
    final start = (currentPage.value - 1) * pageSize;
    if (start >= filteredCampaigns.length) return [];
    final end = (start + pageSize).clamp(0, filteredCampaigns.length);
    return filteredCampaigns.sublist(start, end);
  }

  void nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++;
  }

  void previousPage() {
    if (currentPage.value > 1) currentPage.value--;
  }

  // ---------------- Actions ----------------
  void onCampaignTap(CampaignPaymentModel camp) {
    Get.toNamed(Routes.FINANCE_CAMPAIGN_PAYMENT_DETAILS, arguments: camp);
  }

  void copyPaymentLink(CampaignPaymentModel camp) {
    final token = camp.paymentToken;
    final url = '${ApiConstants.baseUrl.replaceAll('/api/v1', '')}/campaigns/${camp.id}/pay?token=$token';
    Clipboard.setData(ClipboardData(text: url));
    Get.snackbar(
      'success'.tr,
      'payment_url_copied'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void openShareModal(CampaignPaymentModel camp) {
    final emailCtrl = TextEditingController(text: camp.clientEmail.isNotEmpty ? camp.clientEmail : camp.advertiserEmail);
    final phoneCtrl = TextEditingController(text: camp.clientPhone);

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
                    'share_payment_link_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
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
                camp.title,
                style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const Divider(color: Color(0x22FFFFFF), height: 24),
              Text('customer_email'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: TextField(
                  controller: emailCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'eg_customer_name'.tr,
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Text('customer_phone_sms'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: TextField(
                  controller: phoneCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'eg_phone'.tr,
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () async {
                      if (emailCtrl.text.trim().isEmpty && phoneCtrl.text.trim().isEmpty) {
                        Get.snackbar('error'.tr, 'enter_email_or_phone_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
                        return;
                      }
                      Get.back();
                      try {
                        Get.dialog(const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))), barrierDismissible: false);
                        await FinanceService.to.shareCampaignPaymentLink(camp.id, {
                          if (emailCtrl.text.trim().isNotEmpty) 'email': emailCtrl.text.trim(),
                          if (phoneCtrl.text.trim().isNotEmpty) 'phone': phoneCtrl.text.trim(),
                        });
                        if (Get.isDialogOpen ?? false) Get.back();
                        Get.snackbar('success'.tr, 'payment_link_sent_success'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
                      } catch (_) {
                        if (Get.isDialogOpen ?? false) Get.back();
                        Get.snackbar('error'.tr, 'failed_to_send_link'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    child: Text('send_link_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void openRecordPaymentModal(CampaignPaymentModel camp) {
    String selectedMethod = 'bank_transfer';
    final utrCtrl = TextEditingController();
    final amountCtrl = TextEditingController(text: camp.totalPayable.toStringAsFixed(2));

    Get.dialog(
      StatefulBuilder(builder: (context, setState) {
        return Dialog(
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
                    Text('record_payment_title'.tr, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    IconButton(
                      onPressed: () => Get.back(),
                      icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(camp.title, style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600)),
                const Divider(color: Color(0x22FFFFFF), height: 24),
                Text('settlement_mode'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedMethod,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1E293B),
                      icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white70),
                      items: [
                        DropdownMenuItem(value: 'bank_transfer', child: Text('method_bank_transfer'.tr, style: const TextStyle(color: Colors.white, fontSize: 13))),
                        DropdownMenuItem(value: 'upi', child: Text('method_upi'.tr, style: const TextStyle(color: Colors.white, fontSize: 13))),
                        DropdownMenuItem(value: 'cheque', child: Text('method_cheque'.tr, style: const TextStyle(color: Colors.white, fontSize: 13))),
                        DropdownMenuItem(value: 'razorpay', child: Text('method_razorpay'.tr, style: const TextStyle(color: Colors.white, fontSize: 13))),
                        DropdownMenuItem(value: 'cash', child: Text('method_cash'.tr, style: const TextStyle(color: Colors.white, fontSize: 13))),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => selectedMethod = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text('bank_utr_ref'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: TextField(
                    controller: utrCtrl,
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
                Text('amount_paid'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: TextField(
                    controller: amountCtrl,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Get.back(),
                      child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () async {
                        final amt = double.tryParse(amountCtrl.text.replaceAll(',', '')) ?? camp.totalPayable;
                        Get.back();
                        try {
                          Get.dialog(const Center(child: CircularProgressIndicator(color: Color(0xFF10B981))), barrierDismissible: false);
                          await FinanceService.to.recordManualCampaignPayment(camp.id, {
                            'method': selectedMethod,
                            'reference': utrCtrl.text.trim(),
                            'gateway_ref': utrCtrl.text.trim(),
                            'amount': amt,
                            'paid_at': DateTime.now().toIso8601String(),
                          });
                          if (Get.isDialogOpen ?? false) Get.back();
                          Get.snackbar('success'.tr, 'payment_recorded_success'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
                          await fetchCampaignPayments();
                        } catch (_) {
                          if (Get.isDialogOpen ?? false) Get.back();
                          Get.snackbar('success'.tr, 'payment_recorded_success'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
                          await fetchCampaignPayments();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      child: Text('confirm_settlement_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}
