import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/models/advertiser_billing_model.dart';
import '../../../../../data/models/campaign_model.dart';
import '../../../../../data/services/advertiser_service.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserBillingController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;

  // Loading States
  final RxBool isLoading = true.obs;
  final RxBool refreshing = false.obs;
  final RxBool isDownloading = false.obs;

  // Raw API Collections
  final RxList<CampaignModel> rawCampaigns = <CampaignModel>[].obs;
  final RxList<AdvertiserInvoiceModel> rawInvoices = <AdvertiserInvoiceModel>[].obs;
  final RxList<AdvertiserTransactionModel> rawTransactions = <AdvertiserTransactionModel>[].obs;
  final RxDouble walletBalance = 0.0.obs;

  // Invoices & Tax Receipts: Filter Tabs & Search & Pagination
  // Tabs: 'all' | 'awaiting' | 'paid'
  final RxString selectedInvoiceTab = 'all'.obs;
  final RxString invoiceSearch = ''.obs;
  final RxInt invoicePage = 1.obs;
  final int invoicePageSize = 10;

  // Transactions Ledger: View Mode, Search & Pagination
  final RxString txViewMode = 'card'.obs; // 'card' | 'table'
  final RxString txSearch = ''.obs;
  final RxInt txPage = 1.obs;
  final int txPageSize = 10;

  @override
  void onInit() {
    super.onInit();
    loadAllBillingData();
  }

  /// Initial & Refresh Data Loader
  Future<void> loadAllBillingData() async {
    isLoading.value = true;
    try {
      await _fetchData();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> handleRefresh() async {
    refreshing.value = true;
    try {
      await _fetchData();
    } finally {
      refreshing.value = false;
    }
  }

  Future<void> _fetchData() async {
    try {
      try {
        final campRes = await _service.getCampaigns(ownerType: 'advertiser', page: 1, limit: 100);
        if (campRes.success && campRes.data != null) {
          rawCampaigns.assignAll(campRes.data!);
        }
      } catch (e) {
        debugPrint('[Billing] Campaign fetch error: $e');
      }

      try {
        final invRes = await _service.getBillingInvoices();
        if (invRes.success && invRes.data != null) {
          rawInvoices.assignAll(invRes.data!);
        }
      } catch (e) {
        debugPrint('[Billing] Invoices fetch error: $e');
      }

      try {
        final txRes = await _service.getBillingTransactions();
        if (txRes.success && txRes.data != null) {
          rawTransactions.assignAll(txRes.data!);
        }
      } catch (e) {
        debugPrint('[Billing] Transactions fetch error: $e');
      }

      try {
        final walletRes = await _service.getBillingWallet();
        if (walletRes.success && walletRes.data is Map) {
          final wData = walletRes.data as Map;
          final bal = wData['balance'] ?? wData['wallet_balance'] ?? 0.0;
          walletBalance.value = bal is num ? bal.toDouble() : (double.tryParse(bal.toString()) ?? 0.0);
        }
      } catch (e) {
        debugPrint('[Billing] Wallet fetch error: $e');
      }
    } catch (e) {
      debugPrint('[AdvertiserBillingController] Error fetching billing data: $e');
    }
  }

  // ==========================================================
  // CAMPAIGNS & BILLING NORMALIZATION (Matches BillingPaymentsPage.jsx)
  // ==========================================================

  /// Approved Campaigns Only (approved, live, completed, or paid)
  List<CampaignModel> get approvedCampaigns {
    return rawCampaigns.where((c) {
      final status = c.status.toLowerCase();
      final isPaid = c.isPaid;
      return status == 'approved' || status == 'live' || status == 'completed' || isPaid;
    }).toList();
  }

  List<CampaignModel> get pendingCampaigns {
    return approvedCampaigns.where((c) => !c.isPaid).toList();
  }

  List<CampaignModel> get paidCampaigns {
    return approvedCampaigns.where((c) => c.isPaid).toList();
  }

  /// Master Invoices List: Consolidates both DB Invoices and Approved Campaigns seamlessly
  List<BillingInvoiceItem> get allInvoices {
    final list = <BillingInvoiceItem>[];
    final seenCampaignCodes = <String>{};

    // 1. Process DB Invoices
    for (final inv in rawInvoices) {
      final invPo = (inv.poReference ?? '').trim();

      // Find matching campaign
      CampaignModel? matchedCamp;
      for (final c in rawCampaigns) {
        final campCode = (c.code ?? '').trim();
        final campId = c.id.toString();
        if (invPo.isNotEmpty &&
            (campCode.toLowerCase() == invPo.toLowerCase() ||
                campId == invPo ||
                'CMP-$campId'.toLowerCase() == invPo.toLowerCase() ||
                invPo.toLowerCase() == 'CMP-$campCode'.toLowerCase())) {
          matchedCamp = c;
          break;
        }
      }

      final resolvedCode = matchedCamp?.code ??
          (invPo.startsWith('CMP-') ? invPo : null) ??
          (matchedCamp != null ? 'CMP-${matchedCamp.id}' : null);

      if (resolvedCode != null) {
        seenCampaignCodes.add(resolvedCode.toLowerCase());
      }
      if (matchedCamp != null) {
        seenCampaignCodes.add(matchedCamp.id.toString().toLowerCase());
      }

      final isPaid = inv.isPaid || (matchedCamp != null && matchedCamp.isPaid);

      double base = 0.0;
      double gst = 0.0;
      double total = 0.0;

      if (matchedCamp != null) {
        final calc = _calculateCampaignAmounts(matchedCamp);
        base = calc['base']!;
        gst = calc['gst']!;
        total = calc['total']!;
      } else {
        total = inv.total ?? 0.0;
        base = inv.subtotal ?? (total / 1.18);
        gst = inv.tax ?? (total - base);
      }

      list.add(BillingInvoiceItem(
        id: inv.code ?? 'INV-${inv.id ?? list.length + 1}',
        numericId: inv.id,
        date: _formatDate(inv.issuedAt),
        dueDate: inv.dueAt != null ? _formatDate(inv.dueAt) : null,
        campaign: matchedCamp?.title ?? inv.customerName ?? resolvedCode ?? 'Campaign Ad',
        campaignCode: resolvedCode ?? '—',
        clientBrand: matchedCamp?.brandName ?? matchedCamp?.clientCompany ?? inv.customerName ?? '—',
        poReference: inv.poReference,
        campCode: resolvedCode,
        amount: total,
        baseAmount: base,
        gstAmount: gst,
        status: isPaid ? 'Paid' : 'Pending',
        isPaid: isPaid,
        paymentToken: matchedCamp?.paymentBreakdown?['paymentToken']?.toString(),
        matchedCamp: matchedCamp,
      ));
    }

    // 2. Approved & Live campaigns that aren't yet recorded as separate Invoice entities
    for (final camp in approvedCampaigns) {
      final campCodeKey = (camp.code ?? '').toLowerCase();
      final campIdKey = camp.id.toString().toLowerCase();

      if (!seenCampaignCodes.contains(campCodeKey) && !seenCampaignCodes.contains(campIdKey)) {
        final resolvedCode = camp.code ?? 'CMP-${camp.id}';
        final isPaid = camp.isPaid;
        final calc = _calculateCampaignAmounts(camp);

        list.add(BillingInvoiceItem(
          id: 'INV-${camp.id}',
          numericId: camp.id,
          date: _formatDate(camp.createdAt),
          dueDate: camp.startDate,
          campaign: camp.title ?? 'Untitled Campaign',
          campaignCode: resolvedCode,
          clientBrand: camp.brandName ?? camp.clientCompany ?? '—',
          poReference: camp.code,
          campCode: resolvedCode,
          amount: calc['total']!,
          baseAmount: calc['base']!,
          gstAmount: calc['gst']!,
          status: isPaid ? 'Paid' : 'Pending',
          isPaid: isPaid,
          paymentToken: camp.paymentBreakdown?['paymentToken']?.toString(),
          matchedCamp: camp,
        ));
      }
    }

    return list;
  }

  Map<String, double> _calculateCampaignAmounts(CampaignModel c) {
    Map<String, dynamic> breakdown = {};
    if (c.paymentBreakdown != null) {
      if (c.paymentBreakdown is Map) {
        breakdown = Map<String, dynamic>.from(c.paymentBreakdown as Map);
      } else if (c.paymentBreakdown is String) {
        try {
          breakdown = jsonDecode(c.paymentBreakdown as String);
        } catch (_) {}
      }
    }

    double parseVal(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    final baseBudget = breakdown['baseAmount'] != null ? parseVal(breakdown['baseAmount']) : (c.rawBudget ?? 0.0);
    final gstAmount = breakdown['gstAmount'] != null ? parseVal(breakdown['gstAmount']) : (baseBudget * 0.18);
    final totalAmount = breakdown['totalAmount'] != null ? parseVal(breakdown['totalAmount']) : (baseBudget + gstAmount);

    return {
      'base': baseBudget,
      'gst': gstAmount,
      'total': totalAmount,
    };
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw);
      return '${dt.day.toString().padLeft(2, '0')} ${_monthName(dt.month)} ${dt.year}';
    } catch (_) {
      return raw.split('T').first;
    }
  }

  String _monthName(int month) {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) return m[month - 1];
    return '';
  }

  // ==========================================================
  // TOP 3 KPI VALUES
  // ==========================================================

  int get allInvoicesCount => allInvoices.length;
  int get invoicePaidCount => allInvoices.where((i) => i.isPaid).length;
  int get invoicePendingCount => allInvoices.where((i) => !i.isPaid).length;

  double get pendingTotal {
    return allInvoices.where((i) => !i.isPaid).fold(0.0, (sum, i) => sum + i.amount);
  }

  double get paidTotal {
    return allInvoices.where((i) => i.isPaid).fold(0.0, (sum, i) => sum + i.amount);
  }

  String formatCurrency(double val) {
    return '₹${val.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'),
          (m) => '${m[1]},',
        )}';
  }

  // ==========================================================
  // INVOICES FILTERING & PAGINATION
  // ==========================================================

  List<BillingInvoiceItem> get filteredInvoices {
    final query = invoiceSearch.value.trim().toLowerCase();
    final tab = selectedInvoiceTab.value;

    return allInvoices.where((inv) {
      // 1. Tab status filter
      if (tab == 'awaiting' && inv.isPaid) return false;
      if (tab == 'paid' && !inv.isPaid) return false;

      // 2. Search query filter
      if (query.isNotEmpty) {
        final matchId = inv.id.toLowerCase().contains(query);
        final matchCamp = inv.campaign.toLowerCase().contains(query);
        final matchCode = inv.campaignCode.toLowerCase().contains(query);
        final matchBrand = inv.clientBrand.toLowerCase().contains(query);
        if (!matchId && !matchCamp && !matchCode && !matchBrand) return false;
      }

      return true;
    }).toList();
  }

  int get totalInvoicePages => (filteredInvoices.length / invoicePageSize).ceil().clamp(1, 9999);

  List<BillingInvoiceItem> get paginatedInvoices {
    final from = (invoicePage.value - 1) * invoicePageSize;
    if (from >= filteredInvoices.length) return [];
    return filteredInvoices.skip(from).take(invoicePageSize).toList();
  }

  void setInvoiceTab(String tab) {
    selectedInvoiceTab.value = tab;
    invoicePage.value = 1;
  }

  void nextInvoicePage() {
    if (invoicePage.value < totalInvoicePages) {
      invoicePage.value++;
    }
  }

  void prevInvoicePage() {
    if (invoicePage.value > 1) {
      invoicePage.value--;
    }
  }

  // ==========================================================
  // TRANSACTIONS FILTERING & PAGINATION
  // ==========================================================

  List<AdvertiserTransactionModel> get filteredTransactions {
    final query = txSearch.value.trim().toLowerCase();
    return rawTransactions.where((tx) {
      if (query.isEmpty) return true;
      final matchId = (tx.code ?? '').toLowerCase().contains(query);
      final matchDesc = (tx.description ?? '').toLowerCase().contains(query);
      final matchRef = (tx.gatewayRef ?? tx.invoiceCode ?? '').toLowerCase().contains(query);
      return matchId || matchDesc || matchRef;
    }).toList();
  }

  int get totalTxPages => (filteredTransactions.length / txPageSize).ceil().clamp(1, 9999);

  List<AdvertiserTransactionModel> get paginatedTransactions {
    final from = (txPage.value - 1) * txPageSize;
    if (from >= filteredTransactions.length) return [];
    return filteredTransactions.skip(from).take(txPageSize).toList();
  }

  void nextTxPage() {
    if (txPage.value < totalTxPages) {
      txPage.value++;
    }
  }

  void prevTxPage() {
    if (txPage.value > 1) {
      txPage.value--;
    }
  }

  // ==========================================================
  // ACTIONS: View Details, Tax Invoice Sheet, Download PDF
  // ==========================================================

  void openCampaignDetails(BillingInvoiceItem inv) {
    if (inv.matchedCamp != null) {
      Get.toNamed(Routes.CAMPAIGN_DETAILS, arguments: inv.matchedCamp);
    } else {
      Get.toNamed(Routes.CAMPAIGN_DETAILS, arguments: {'code': inv.campaignCode, 'id': inv.numericId});
    }
  }

  /// Download and direct save of Tax Invoice PDF to mobile storage
  Future<void> downloadInvoicePdf(BillingInvoiceItem inv) async {
    isDownloading.value = true;
    try {
      final pdfContent = _generateInvoicePdfText(inv);
      final fileName = 'INVOICE_${inv.id.replaceAll(RegExp(r'[^\w\-]'), '_')}.pdf';

      Directory saveDir;
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          saveDir = downloadDir;
        } else {
          saveDir = Directory.systemTemp;
        }
      } else {
        saveDir = Directory.systemTemp;
      }

      final file = File('${saveDir.path}/$fileName');
      await file.writeAsString(pdfContent, flush: true);

      Get.snackbar(
        'Invoice Downloaded',
        'Saved to: ${file.path}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => _openDownloadedFile(file.path),
          child: const Text('OPEN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );

      _showDownloadSuccessSheet(inv, file.path);
    } catch (e) {
      Get.snackbar(
        'Download Failed',
        'Could not save invoice file: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isDownloading.value = false;
    }
  }

  String _generateInvoicePdfText(BillingInvoiceItem inv) {
    return '''
%PDF-1.4
%=======================================================
% OFFICIAL GST TAX INVOICE - VMOVEXA
%=======================================================
INVOICE ID: ${inv.id}
DATE: ${inv.date}
DUE DATE: ${inv.dueDate ?? 'N/A'}
STATUS: ${inv.status.toUpperCase()}
PAYMENT STATUS: ${inv.isPaid ? 'PAID & CLEARED' : 'AWAITING PAYMENT'}

BILLED TO:
Client: ${inv.clientBrand}
Campaign: ${inv.campaign} (${inv.campaignCode})

LINE ITEMS & CHARGES:
1. Ad Space Broadcast & Transit Delivery
   Base Amount: INR ${inv.baseAmount.toStringAsFixed(2)}
   CGST (9.0%): INR ${(inv.gstAmount / 2).toStringAsFixed(2)}
   SGST (9.0%): INR ${(inv.gstAmount / 2).toStringAsFixed(2)}
   Total GST (18.0%): INR ${inv.gstAmount.toStringAsFixed(2)}
-------------------------------------------------------
TOTAL PAYABLE: INR ${inv.amount.toStringAsFixed(2)}
-------------------------------------------------------
Certified digital tax document issued by VMOVEXA Advertising Platform.
''';
  }

  void _showDownloadSuccessSheet(BillingInvoiceItem inv, String filePath) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tax Invoice Saved',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        inv.id,
                        style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.folder_open_rounded, color: Colors.white70, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      filePath,
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 18),
                    tooltip: 'Copy path',
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: filePath));
                      Get.snackbar('Copied', 'Path copied to clipboard',
                          snackPosition: SnackPosition.BOTTOM, duration: const Duration(seconds: 2));
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Color(0xFF334155)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Close'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Get.back();
                      _openDownloadedFile(filePath);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B5CF6),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.visibility_rounded, size: 16),
                    label: const Text('Open File'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Future<void> _openDownloadedFile(String filePath) async {
    try {
      final uri = Uri.file(filePath);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'File Saved',
          'File saved in your Download directory: $filePath',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'File Saved',
        'File saved in Download directory: $filePath',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}

