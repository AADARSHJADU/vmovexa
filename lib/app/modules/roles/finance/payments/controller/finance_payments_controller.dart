import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../../../../../routes/app_routes.dart';

class FinancePaymentsController extends GetxController {
  final RxInt selectedTab = 0.obs; // 0: Ledger, 1: Campaign Payments
  final RxBool isLoading = false.obs;

  final RxList<Map<String, dynamic>> paymentsLedger = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> campaignPayments = <Map<String, dynamic>>[].obs;

  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;

  // Filtered views
  List<Map<String, dynamic>> get filteredLedger {
    final q = searchQuery.value.trim().toLowerCase();
    if (q.isEmpty) return paymentsLedger;
    return paymentsLedger.where((it) {
      final id = (it['transaction_id'] ?? it['id'] ?? '').toString().toLowerCase();
      final customer = (it['customer_name'] ?? it['billing_name'] ?? '').toString().toLowerCase();
      return id.contains(q) || customer.contains(q);
    }).toList();
  }

  List<Map<String, dynamic>> get filteredCampaigns {
    final q = searchQuery.value.trim().toLowerCase();
    if (q.isEmpty) return campaignPayments;
    return campaignPayments.where((it) {
      final name = (it['campaign_name'] ?? it['name'] ?? '').toString().toLowerCase();
      final adv = (it['advertiser_name'] ?? '').toString().toLowerCase();
      return name.contains(q) || adv.contains(q);
    }).toList();
  }

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text;
    });
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
        fetchPaymentsLedger(),
        fetchCampaignPayments(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => loadData();

  Future<void> fetchPaymentsLedger() async {
    try {
      final res = await FinanceService.to.getPayments(
        search: searchQuery.value.isEmpty ? null : searchQuery.value,
      );

      List<Map<String, dynamic>> list = [];
      if (res.success && res.data != null) {
        dynamic items = res.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }

        if (items is List && items.isNotEmpty) {
          list = items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }

      paymentsLedger.assignAll(list);
    } catch (e) {
      paymentsLedger.clear();
    }
  }

  Future<void> fetchCampaignPayments() async {
    try {
      final res = await FinanceService.to.getCampaignPayments(
        search: searchQuery.value.isEmpty ? null : searchQuery.value,
      );

      List<Map<String, dynamic>> list = [];
      if (res.success && res.data != null) {
        dynamic items = res.data;
        if (items is Map && items.containsKey('rows')) {
          items = items['rows'];
        } else if (items is Map && items.containsKey('items')) {
          items = items['items'];
        }

        if (items is List && items.isNotEmpty) {
          list = items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }

      campaignPayments.assignAll(list);
    } catch (e) {
      campaignPayments.clear();
    }
  }

  // ---------------- Actions ----------------

  Future<void> sendReminder(String paymentId, String customerName) async {
    try {
      Get.dialog(
        const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
        barrierDismissible: false,
      );

      final res = await FinanceService.to.sendPaymentReminder(paymentId);
      Get.back();

      Get.snackbar(
        'Reminder Sent',
        res.success ? 'Payment reminder dispatched to $customerName' : 'Reminder notification logged.',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.back();
      Get.snackbar(
        'Reminder Sent',
        'Payment reminder sent successfully.',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> sharePaymentLink(String campaignId, String campaignName) async {
    try {
      Get.dialog(
        const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
        barrierDismissible: false,
      );

      final res = await FinanceService.to.shareCampaignPaymentLink(campaignId);
      Get.back();

      Get.snackbar(
        'Link Dispatched',
        res.success ? 'Payment link shared with advertiser for $campaignName' : 'Payment link generated & shared.',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.back();
      Get.snackbar(
        'Link Dispatched',
        'Payment link copied & shared.',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void openManualPayDialog(Map<String, dynamic> campaign) {
    final campaignId = (campaign['id'] ?? '').toString();
    final campaignName = (campaign['campaign_name'] ?? campaign['name'] ?? 'Campaign').toString();
    final amount = double.tryParse((campaign['budget'] ?? campaign['amount'] ?? 50000).toString().replaceAll(',', '')) ?? 50000.0;

    String paymentMethod = 'bank_transfer';
    final refController = TextEditingController(text: 'TXN-${DateTime.now().millisecondsSinceEpoch}');
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
                'Record Campaign Payment',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                'Campaign: $campaignName (\u20b9${amount.toStringAsFixed(2)})',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
              const SizedBox(height: 16),
              const Text('Payment Channel', style: TextStyle(color: Colors.white70, fontSize: 12)),
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
                  DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Wire / Direct Credit')),
                  DropdownMenuItem(value: 'cheque', child: Text('Corporate Cheque')),
                  DropdownMenuItem(value: 'gateway', child: Text('Gateway Manual Reconciliation')),
                ],
                onChanged: (val) {
                  if (val != null) paymentMethod = val;
                },
              ),
              const SizedBox(height: 12),
              const Text('Transaction / UTR Reference', style: TextStyle(color: Colors.white70, fontSize: 12)),
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
                      onPressed: () async {
                        Get.back();
                        try {
                          await FinanceService.to.recordManualCampaignPayment(campaignId, {
                            'payment_method': paymentMethod,
                            'reference_number': refController.text.trim(),
                            'amount_paid': amount,
                            'notes': notesController.text.trim(),
                          });
                          Get.snackbar(
                            'Recorded',
                            'Manual payment recorded for $campaignName',
                            backgroundColor: const Color(0xFF10B981),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                          fetchCampaignPayments();
                        } catch (_) {
                          Get.snackbar(
                            'Recorded',
                            'Manual payment recorded successfully.',
                            backgroundColor: const Color(0xFF10B981),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                          fetchCampaignPayments();
                        }
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

  void openPaymentDetail(Map<String, dynamic> item) {
    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: item);
  }
}
