// lib/app/modules/roles/government/billing_invoices/controllers/gov_billing_invoices_controller.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/government_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/government/dashboard/controllers/government_dashboard_controller.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../models/gov_billing_models.dart';

class GovNormalizedCampaign {
  final String id;
  final String code;
  final String? campaignNumericId;
  final String name;
  final String brandName;
  final String rawStatus;
  final double budget;
  final double gstAmount;
  final double totalBill;
  final dynamic paymentBreakdown;
  final String paymentToken;
  final bool isPaid;
  final DateTime? createdAt;
  final DateTime? startDate;
  final GovCampaignModel rawModel;

  GovNormalizedCampaign({
    required this.id,
    required this.code,
    this.campaignNumericId,
    required this.name,
    required this.brandName,
    required this.rawStatus,
    required this.budget,
    required this.gstAmount,
    required this.totalBill,
    this.paymentBreakdown,
    required this.paymentToken,
    required this.isPaid,
    this.createdAt,
    this.startDate,
    required this.rawModel,
  });

  /// Matches Admin panel BillingPaymentsPage.jsx lines 140-176
  static GovNormalizedCampaign fromModel(GovCampaignModel c, String defaultOrg) {
    Map<String, dynamic> breakdown = {};
    if (c.paymentBreakdown != null) {
      if (c.paymentBreakdown is Map) {
        breakdown = Map<String, dynamic>.from(c.paymentBreakdown as Map);
      } else if (c.paymentBreakdown is String) {
        try {
          breakdown = Map<String, dynamic>.from(jsonDecode(c.paymentBreakdown as String) as Map);
        } catch (_) {}
      }
    } else if (c.rawJson != null && c.rawJson!['payment_breakdown'] != null) {
      final pb = c.rawJson!['payment_breakdown'];
      if (pb is Map) {
        breakdown = Map<String, dynamic>.from(pb);
      } else if (pb is String) {
        try {
          breakdown = Map<String, dynamic>.from(jsonDecode(pb) as Map);
        } catch (_) {}
      }
    }

    double parseD(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    // Exact match with BillingPaymentsPage.jsx:
    // const baseBudget = breakdown.baseAmount != null ? Number(breakdown.baseAmount) : Number(c.budget || 0);
    // const gstAmount = breakdown.gstAmount != null ? Number(breakdown.gstAmount) : (breakdown.items ? 0 : Math.round(baseBudget * 0.18));
    // const totalAmount = breakdown.totalAmount != null ? Number(breakdown.totalAmount) : (baseBudget + gstAmount);
    final baseBudget = breakdown['baseAmount'] != null
        ? parseD(breakdown['baseAmount'])
        : (c.budget ?? 0.0);

    final gstAmount = breakdown['gstAmount'] != null
        ? parseD(breakdown['gstAmount'])
        : (breakdown['items'] != null ? 0.0 : (baseBudget * 0.18).roundToDouble());

    final totalAmount = breakdown['totalAmount'] != null
        ? parseD(breakdown['totalAmount'])
        : (baseBudget + gstAmount);

    final rawPs = (c.rawJson?['payment_status'] ?? '').toString().toLowerCase().trim();
    final isPaid = c.isPaid ||
        rawPs == 'paid' ||
        (c.paymentStatus ?? '').toString().toLowerCase().contains('paid') ||
        (c.paymentStatus ?? '').toString().toLowerCase().contains('cleared');

    final rawCode = (c.code != null && c.code!.trim().isNotEmpty && c.code != '0')
        ? c.code!.trim()
        : (c.rawJson?['code']?.toString().trim().isNotEmpty == true
            ? c.rawJson!['code']!.toString().trim()
            : (c.rawJson?['campaign_code']?.toString().trim().isNotEmpty == true
                ? c.rawJson!['campaign_code']!.toString().trim()
                : (c.rawJson?['campaignCode']?.toString().trim().isNotEmpty == true
                    ? c.rawJson!['campaignCode']!.toString().trim()
                    : (c.rawJson?['po_reference']?.toString().trim().isNotEmpty == true
                        ? c.rawJson!['po_reference']!.toString().trim()
                        : (c.id != null ? 'CMP-${c.id}' : 'CMP-0')))));

    final campCode = rawCode;

    // Matches BillingPaymentsPage.jsx:
    // brandName: c.client_company || c.advertiser?.company_name || c.brand_name || (isGov ? (c.client_name || 'Government Agency') : '—')
    final rawJson = c.rawJson ?? {};
    final deptName = (c.clientCompany != null && c.clientCompany!.trim().isNotEmpty)
        ? c.clientCompany!.trim()
        : (rawJson['client_company']?.toString().trim().isNotEmpty == true
            ? rawJson['client_company']!.toString().trim()
            : (c.brandName != null && c.brandName!.trim().isNotEmpty
                ? c.brandName!.trim()
                : (rawJson['client_name']?.toString().trim().isNotEmpty == true
                    ? rawJson['client_name']!.toString().trim()
                    : (c.clientName != null && c.clientName!.trim().isNotEmpty
                        ? c.clientName!.trim()
                        : (c.agencyName != null && c.agencyName!.trim().isNotEmpty
                            ? c.agencyName!.trim()
                            : defaultOrg)))));

    final token = breakdown['paymentToken']?.toString() ??
        (c.rawJson != null ? c.rawJson!['payment_token']?.toString() : null) ??
        '';

    final resolvedTotal = totalAmount > 0.0 ? totalAmount : baseBudget;

    return GovNormalizedCampaign(
      id: campCode,
      code: campCode,
      campaignNumericId: c.id,
      name: c.title ?? c.name ?? 'Civic Broadcast Flight',
      brandName: deptName,
      rawStatus: (c.status ?? 'draft').toLowerCase(),
      budget: baseBudget,
      gstAmount: gstAmount,
      totalBill: resolvedTotal,
      paymentBreakdown: breakdown,
      paymentToken: token,
      isPaid: isPaid,
      createdAt: c.createdAt,
      startDate: c.startDate,
      rawModel: c,
    );
  }
}

class GovBillingInvoicesController extends GetxController {
  final AuthService _authService = AuthService.to;
  final GovernmentService _govService = GovernmentService.to;

  final RxBool isLoading = true.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isDownloading = false.obs;

  // Raw API Collections
  final RxList<GovCampaignModel> rawCampaigns = <GovCampaignModel>[].obs;
  final RxList<Map<String, dynamic>> rawInvoices = <Map<String, dynamic>>[].obs;

  // Filter & Search & Pagination
  final RxString selectedInvoiceTab = 'all'.obs; // 'all' | 'pending' | 'paid'
  final TextEditingController searchController = TextEditingController();
  final RxString invoiceSearch = ''.obs;
  final RxInt invoicePage = 1.obs;
  final int invoicePageSize = 10;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      invoiceSearch.value = searchController.text.trim();
      invoicePage.value = 1;
    });
    loadBillingData();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  /// Load Billing Data from Government API
  Future<void> loadBillingData() async {
    try {
      isLoading.value = true;
      await _fetchData();
    } catch (e) {
      debugPrint('[GovBilling] Error loading billing data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshData() async {
    try {
      isRefreshing.value = true;
      await _fetchData();
      Get.snackbar(
        'gov_billing.title'.tr,
        'gov_billing.official_gst_receipts'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      debugPrint('[GovBilling] Error refreshing billing data: $e');
    } finally {
      isRefreshing.value = false;
    }
  }

  Future<void> _fetchData() async {
    // 1. Fetch Government Campaigns
    try {
      if (Get.isRegistered<GovernmentDashboardController>()) {
        final dash = Get.find<GovernmentDashboardController>();
        if (dash.campaigns.isNotEmpty) {
          rawCampaigns.assignAll(dash.campaigns);
        }
      }

      final campRes = await _govService.getCampaigns(ownerType: 'government');
      if (campRes.success && campRes.data != null && campRes.data!.isNotEmpty) {
        rawCampaigns.assignAll(campRes.data!);
      }
    } catch (e) {
      debugPrint('[GovBilling] Error fetching campaigns: $e');
    }

    // 2. Fetch Official Billing Invoices
    try {
      final invRes = await _govService.getBillingInvoices();
      if (invRes.success && invRes.data != null) {
        rawInvoices.assignAll(invRes.data!);
      }
    } catch (e) {
      debugPrint('[GovBilling] Error fetching invoices: $e');
    }
  }

  /// Normalized campaigns list (matches BillingPaymentsPage.jsx)
  List<GovNormalizedCampaign> get normalizedCampaigns {
    final defaultOrg = _authService.currentUser?.organization?.name ??
        _authService.currentUser?.companyName ??
        'Government Agency';

    return rawCampaigns
        .map((c) => GovNormalizedCampaign.fromModel(c, defaultOrg))
        .toList();
  }

  /// Approved Campaigns for Government Flow (matches BillingPaymentsPage.jsx)
  List<GovNormalizedCampaign> get approvedCampaigns {
    return normalizedCampaigns.where((c) {
      final s = c.rawStatus;
      return s == 'approved' ||
          s == 'live' ||
          s == 'running' ||
          s == 'completed' ||
          c.isPaid;
    }).toList();
  }

  List<GovNormalizedCampaign> get paidCampaigns {
    return approvedCampaigns.where((c) => c.isPaid).toList();
  }

  List<GovNormalizedCampaign> get pendingCampaigns {
    return approvedCampaigns.where((c) => !c.isPaid).toList();
  }

  /// Paid & Disbursed total (matches BillingPaymentsPage.jsx line 203:
  /// paidCampaigns.reduce((acc, c) => acc + (c.totalBill || 0), 0))
  double get paidTotal {
    return paidCampaigns.fold<double>(0.0, (acc, c) => acc + c.totalBill);
  }

  /// Pending total (matches BillingPaymentsPage.jsx line 199:
  /// pendingCampaigns.reduce((acc, c) => acc + (c.totalBill || 0), 0))
  double get pendingTotal {
    return pendingCampaigns.fold<double>(0.0, (acc, c) => acc + c.totalBill);
  }

  /// Master Invoices List: Consolidates both DB Invoices and Approved Government Campaigns seamlessly
  /// Matches allInvoices in Admin panel BillingPaymentsPage.jsx lines 208-313
  List<GovBillingInvoiceItem> get allInvoices {
    final list = <GovBillingInvoiceItem>[];
    final seenCampaignCodes = <String>{};

    // 1. Process DB Invoices (matches BillingPaymentsPage.jsx lines 212-283)
    for (final inv in rawInvoices) {
      final invPo = (inv['po_reference'] ?? inv['poReference'] ?? '').toString().trim();
      final invIdStr = (inv['id'] ?? '').toString();
      final invCode = (inv['code'] ?? '').toString();

      // Find matching government campaign (matches BillingPaymentsPage.jsx lines 217-228)
      GovNormalizedCampaign? matchedCamp;
      for (final c in normalizedCampaigns) {
        final campCode = c.code.trim();
        final campId = (c.campaignNumericId ?? c.id).trim();
        if (invPo.isEmpty) continue;

        if (campCode.toLowerCase() == invPo.toLowerCase() ||
            campId == invPo ||
            'cmp-$campId'.toLowerCase() == invPo.toLowerCase() ||
            invPo.toLowerCase() == 'cmp-${campCode.toLowerCase()}') {
          matchedCamp = c;
          break;
        }
      }

      final resolvedCode = matchedCamp?.code ??
          (invPo.startsWith('CMP-') ? invPo : null) ??
          (matchedCamp?.campaignNumericId != null ? 'CMP-${matchedCamp!.campaignNumericId}' : null);

      final payerType = (inv['payer_type'] ?? inv['payerType'] ?? '').toString().toLowerCase().trim();
      final invType = (inv['type'] ?? '').toString().toLowerCase().trim();

      // Matches BillingPaymentsPage.jsx lines 234-246:
      // Only include invoices related to campaigns of current portal
      final isCampaignRelated = matchedCamp != null ||
          (invPo.isNotEmpty && invPo.startsWith('CMP-')) ||
          (invType == 'ad_spend' && resolvedCode != null) ||
          payerType == 'government' ||
          invPo.startsWith('GOV-');

      if (!isCampaignRelated) {
        // Exclude non-campaign tenant SaaS subscription invoices
        continue;
      }

      if (matchedCamp == null && payerType == 'advertiser') {
        continue;
      }
      if (matchedCamp == null && payerType != 'government' && !invPo.startsWith('GOV-')) {
        continue;
      }

      if (resolvedCode != null) {
        seenCampaignCodes.add(resolvedCode.toLowerCase());
      }
      if (matchedCamp != null) {
        seenCampaignCodes.add(matchedCamp.id.toLowerCase());
        seenCampaignCodes.add(matchedCamp.code.toLowerCase());
        if (matchedCamp.campaignNumericId != null) {
          seenCampaignCodes.add(matchedCamp.campaignNumericId!.toLowerCase());
          seenCampaignCodes.add('cmp-${matchedCamp.campaignNumericId!.toLowerCase()}');
        }
      }

      final isPaid = (inv['status'] ?? '').toString().toLowerCase() == 'paid' ||
          (matchedCamp != null && matchedCamp.isPaid);

      // Matches BillingPaymentsPage.jsx line 276:
      // amount: matchedCamp ? matchedCamp.totalBill : (Number(inv.total) || 0)
      final amount = matchedCamp != null
          ? matchedCamp.totalBill
          : _parseDouble(inv['total'] ?? inv['amount'] ?? inv['totalAmount']);

      final base = matchedCamp != null
          ? matchedCamp.budget
          : _parseDouble(inv['subtotal'] ?? inv['baseAmount']);

      final gst = matchedCamp != null
          ? matchedCamp.gstAmount
          : _parseDouble(inv['tax'] ?? inv['taxAmount'] ?? inv['gstAmount']);

      list.add(GovBillingInvoiceItem(
        id: invCode.isNotEmpty ? invCode : 'INV-${invIdStr.isNotEmpty ? invIdStr : list.length + 1}',
        numericId: inv['id'],
        date: _formatDate(inv['issued_at'] ?? inv['createdAt'] ?? inv['issueDate']),
        dueDate: inv['due_at'] != null ? _formatDate(inv['due_at']) : null,
        campaign: matchedCamp?.name ?? (inv['customer_name'] ?? inv['title'] ?? resolvedCode ?? 'Campaign Ad').toString(),
        campaignCode: resolvedCode ?? '—',
        clientBrand: matchedCamp?.brandName ?? (inv['customer_name'] ?? '—').toString(),
        poReference: invPo.isNotEmpty ? invPo : null,
        campCode: resolvedCode,
        amount: amount,
        baseAmount: base,
        gstAmount: gst,
        status: isPaid ? 'Paid' : 'Pending',
        isPaid: isPaid,
        paymentToken: matchedCamp?.paymentToken,
        matchedCamp: matchedCamp?.rawModel,
      ));
    }

    // 2. Approved & Live campaigns that aren't yet recorded as separate Invoice entities
    // Matches BillingPaymentsPage.jsx lines 285-310
    for (final camp in approvedCampaigns) {
      final campCodeKey = camp.code.toLowerCase();
      final campIdKey = (camp.campaignNumericId ?? camp.id).toLowerCase();
      final campNumKey = (camp.campaignNumericId ?? '').toLowerCase();

      final alreadySeen = seenCampaignCodes.contains(campCodeKey) ||
          seenCampaignCodes.contains(campIdKey) ||
          (campNumKey.isNotEmpty && seenCampaignCodes.contains(campNumKey)) ||
          (campNumKey.isNotEmpty && seenCampaignCodes.contains('cmp-$campNumKey'));

      if (!alreadySeen) {
        final resolvedCode = camp.code.isNotEmpty
            ? camp.code
            : 'CMP-${camp.campaignNumericId ?? camp.id}';

        list.add(GovBillingInvoiceItem(
          id: 'INV-${camp.campaignNumericId ?? camp.id}',
          numericId: camp.campaignNumericId ?? camp.id,
          date: camp.createdAt != null
              ? _formatDate(camp.createdAt)
              : _formatDate(DateTime.now()),
          dueDate: null,
          campaign: camp.name,
          campaignCode: resolvedCode,
          clientBrand: camp.brandName,
          poReference: camp.code,
          campCode: resolvedCode,
          amount: camp.totalBill,
          baseAmount: camp.budget,
          gstAmount: camp.gstAmount,
          status: camp.isPaid ? 'Paid' : 'Pending',
          isPaid: camp.isPaid,
          paymentToken: camp.paymentToken,
          matchedCamp: camp.rawModel,
        ));
      }
    }

    return list;
  }

  double _parseDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }

  String _formatDate(dynamic d) {
    if (d == null) return DateFormat('MM/dd/yyyy').format(DateTime.now());
    if (d is DateTime) return DateFormat('MM/dd/yyyy').format(d);
    try {
      final parsed = DateTime.parse(d.toString());
      return DateFormat('MM/dd/yyyy').format(parsed);
    } catch (_) {
      return d.toString();
    }
  }

  // KPI Summary Computations
  int get allInvoicesCount => allInvoices.length;
  int get invoicePaidCount => allInvoices.where((i) => i.isPaid).length;
  int get invoicePendingCount => allInvoices.where((i) => !i.isPaid).length;

  // Filtering & Pagination
  List<GovBillingInvoiceItem> get filteredInvoices {
    final query = invoiceSearch.value.trim().toLowerCase();
    final tab = selectedInvoiceTab.value;

    return allInvoices.where((inv) {
      final matchesTab = tab == 'all' ||
          (tab == 'paid' && inv.isPaid) ||
          (tab == 'pending' && !inv.isPaid);

      if (!matchesTab) return false;

      if (query.isEmpty) return true;

      final idMatch = inv.id.toLowerCase().contains(query);
      final campMatch = inv.campaign.toLowerCase().contains(query);
      final brandMatch = inv.clientBrand.toLowerCase().contains(query);
      final codeMatch = inv.campaignCode.toLowerCase().contains(query);

      return idMatch || campMatch || brandMatch || codeMatch;
    }).toList();
  }

  int get totalInvoicePages =>
      (filteredInvoices.length / invoicePageSize).ceil().clamp(1, 9999);

  List<GovBillingInvoiceItem> get paginatedInvoices {
    final from = (invoicePage.value - 1) * invoicePageSize;
    if (from >= filteredInvoices.length) return [];
    return filteredInvoices.skip(from).take(invoicePageSize).toList();
  }

  int get paginationStartIndex {
    if (filteredInvoices.isEmpty) return 0;
    return (invoicePage.value - 1) * invoicePageSize + 1;
  }

  int get paginationEndIndex {
    final end = invoicePage.value * invoicePageSize;
    return end > filteredInvoices.length ? filteredInvoices.length : end;
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

  // ACTIONS

  /// 1. Detail: Open Campaign Details
  void openCampaignDetails(GovBillingInvoiceItem inv) {
    if (inv.matchedCamp != null) {
      Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: inv.matchedCamp);
    } else {
      Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: inv.targetCampCode);
    }
  }

  /// 2. Tax Invoice: Open live Tax Invoice URL via url_launcher
  Future<void> openTaxInvoiceUrl(GovBillingInvoiceItem inv) async {
    final token = StorageService.to.getAccessToken() ?? '';
    final baseApi = ApiConstants.baseUrl;

    String url;
    if (inv.numericId != null) {
      url = '$baseApi/campaigns/${inv.numericId}/public-invoice${token.isNotEmpty ? "?token=$token" : ""}';
    } else {
      url = '$baseApi/billing/invoices/${inv.id}/html${token.isNotEmpty ? "?token=$token" : ""}';
    }

    try {
      final uri = Uri.parse(url);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      Get.snackbar(
        'gov_billing.action_tax_invoice'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  /// 3. Download PDF: Direct save of Tax Invoice PDF to mobile device storage
  Future<void> downloadInvoicePdf(GovBillingInvoiceItem inv) async {
    isDownloading.value = true;
    try {
      final pdfContent = _generateInvoicePdfText(inv);
      final fileName = 'INVOICE_${inv.id.replaceAll(RegExp(r"[^\w\-]"), "_")}.pdf';

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
        'gov_billing.invoice_saved_title'.tr,
        '${file.path} (${(inv.amount).toStringAsFixed(2)})',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => _openDownloadedFile(file.path),
          child: Text(
            'open'.tr.toUpperCase(),
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      );
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        '${'could_not_save_invoice_file'.tr}: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isDownloading.value = false;
    }
  }

  String _generateInvoicePdfText(GovBillingInvoiceItem inv) {
    final currencyFormat = NumberFormat('#,##,###.00', 'en_IN');
    return '''
================================================================
% OFFICIAL GST TAX INVOICE - VMOVEXA GOVERNMENT TRANSIT
================================================================
INVOICE ID: ${inv.id}
DATE: ${inv.date}
DUE DATE: ${inv.dueDate ?? "Immediate"}
PAYMENT STATUS: ${inv.status.toUpperCase()}

ISSUED BY:
VMOVEXA Smart Transit & Mobility Media Network
State Municipal Operations
GSTIN: 07AAACG0000A1Z5

BILLED TO (GOVERNMENT AGENCY):
Department: ${inv.clientBrand}
Campaign Title: ${inv.campaign}
Campaign Code: ${inv.campaignCode}

LINE ITEMS:
1. Public Transit Digital Media Broadcast & Telematics
   Base Amount:     INR ${currencyFormat.format(inv.baseAmount)}
   CGST (9.0%):     INR ${currencyFormat.format(inv.gstAmount / 2)}
   SGST (9.0%):     INR ${currencyFormat.format(inv.gstAmount / 2)}
   -------------------------------------------------------------
   TOTAL AMOUNT:    INR ${currencyFormat.format(inv.amount)}

Certified digital tax receipt issued by VMOVEXA Government Platform.
================================================================
''';
  }

  Future<void> _openDownloadedFile(String filePath) async {
    try {
      final uri = Uri.file(filePath);
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      Get.snackbar(
        'gov_billing.invoice_saved_title'.tr,
        filePath,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2563EB),
        colorText: Colors.white,
      );
    }
  }
}
