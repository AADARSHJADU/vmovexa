import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../model/report_models.dart';

class RevenueReportingController extends GetxController {
  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool summaryLoading = false.obs;
  final RxBool isGenerating = false.obs;
  final RxBool downloading = false.obs;

  // ---------------- Workspace Tab: 'ledger' (Live Revenue Ledger) | 'archive' (Compiled Reports) ----------------
  final RxString activeTab = 'ledger'.obs;

  // ---------------- Reporting Period Dates & Presets ----------------
  final RxString startDate = ''.obs;
  final RxString endDate = ''.obs;
  final RxString activePreset = 'this_month'.obs;

  // ---------------- Report Category Selection (Admin Panel 1:1) ----------------
  final RxString selectedReportType = 'revenue_summary'.obs;

  final List<ReportTypeOption> reportTypes = const [
    ReportTypeOption(
      id: 'revenue_summary',
      labelKey: 'finance_report_type_all_revenue',
      label: 'All Revenue (Combined)',
      desc: 'Combined SaaS subscriptions, campaign ad spend & government billing',
      icon: Icons.analytics_outlined,
      color: Color(0xFF3B82F6),
      bgColor: Color(0xFF1E3A8A),
      badge: 'All Revenue',
    ),
    ReportTypeOption(
      id: 'subscription_revenue',
      labelKey: 'finance_report_type_subscription',
      label: 'SaaS Subscription MRR',
      desc: 'Fleet operator recurring plans, license fees & renewal billings',
      icon: Icons.sync_rounded,
      color: Color(0xFF6366F1),
      bgColor: Color(0xFF312E81),
      badge: 'Subscription',
    ),
    ReportTypeOption(
      id: 'campaign_revenue',
      labelKey: 'finance_report_type_campaign',
      label: 'Campaign Ad Revenue',
      desc: 'Ad spend collections, impression ledger & advertiser invoicing',
      icon: Icons.campaign_outlined,
      color: Color(0xFF10B981),
      bgColor: Color(0xFF064E3B),
      badge: 'Ad Spend',
    ),
    ReportTypeOption(
      id: 'government_campaign_revenue',
      labelKey: 'finance_report_type_government',
      label: 'Government Campaign Revenue',
      desc: 'PSA campaigns, department billing and treasury collections',
      icon: Icons.shield_outlined,
      color: Color(0xFFF59E0B),
      bgColor: Color(0xFF78350F),
      badge: 'Government',
    ),
  ];

  // ---------------- Live KPIs (Mirroring Admin Panel 1:1) ----------------
  final RxDouble totalBilled = 0.0.obs;
  final RxInt invoiceCount = 0.obs;
  final RxDouble totalRevenue = 0.0.obs;
  final RxDouble subRevenue = 0.0.obs;
  final RxDouble campaignRevenue = 0.0.obs;
  final RxDouble governmentRevenue = 0.0.obs;
  final RxDouble taxTotal = 0.0.obs;
  final RxDouble cgstTotal = 0.0.obs;
  final RxDouble sgstTotal = 0.0.obs;
  final RxDouble igstTotal = 0.0.obs;
  final RxDouble pendingDues = 0.0.obs;
  final RxInt activeSubs = 0.obs;
  final RxInt activeCampaigns = 0.obs;

  // ---------------- TAB 1: Live Revenue Ledger States ----------------
  final RxList<LiveInvoiceItem> liveInvoices = <LiveInvoiceItem>[].obs;
  final RxString ledgerStatusFilter = 'all'.obs;
  final TextEditingController ledgerSearchController = TextEditingController();
  final RxString ledgerSearch = ''.obs;
  final RxInt ledgerPage = 1.obs;
  final RxInt ledgerPageSize = 6.obs;

  // ---------------- TAB 2: Compiled Reports Archive States ----------------
  final RxList<RecentReport> archiveReports = <RecentReport>[].obs;
  final RxString selectedCategoryFilter = 'all'.obs;
  final RxString archiveSort = 'newest'.obs; // 'newest' | 'oldest'
  final TextEditingController archiveSearchController = TextEditingController();
  final RxString archiveSearch = ''.obs;
  final RxInt archivePage = 1.obs;
  final RxInt archivePageSize = 6.obs;

  // ---------------- Last Generated Report ----------------
  final Rx<RecentReport?> generatedReport = Rx<RecentReport?>(null);

  @override
  void onInit() {
    super.onInit();
    _initDateDefaults();
    fetchData();
  }

  @override
  void onClose() {
    ledgerSearchController.dispose();
    archiveSearchController.dispose();
    super.onClose();
  }

  void _initDateDefaults() {
    final now = DateTime.now();
    final firstDay = DateTime(now.year, now.month, 1);
    startDate.value = DateFormat('yyyy-MM-dd').format(firstDay);
    endDate.value = DateFormat('yyyy-MM-dd').format(now);
  }

  void applyPreset(String presetId) {
    activePreset.value = presetId;
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);

    switch (presetId) {
      case 'this_month':
        startDate.value = DateFormat('yyyy-MM-dd').format(DateTime(now.year, now.month, 1));
        endDate.value = todayStr;
        break;
      case 'last_30':
        startDate.value = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 30)));
        endDate.value = todayStr;
        break;
      case 'this_quarter':
        final qMonth = ((now.month - 1) ~/ 3) * 3 + 1;
        startDate.value = DateFormat('yyyy-MM-dd').format(DateTime(now.year, qMonth, 1));
        endDate.value = todayStr;
        break;
      case 'this_year':
        startDate.value = DateFormat('yyyy-MM-dd').format(DateTime(now.year, 1, 1));
        endDate.value = todayStr;
        break;
      case 'all':
        startDate.value = '2024-01-01';
        endDate.value = todayStr;
        break;
    }
    loadReportSummary();
  }

  Future<void> pickCustomDateRange(BuildContext context) async {
    DateTime start = DateTime.tryParse(startDate.value) ?? DateTime.now();
    DateTime end = DateTime.tryParse(endDate.value) ?? DateTime.now();

    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: DateTimeRange(start: start, end: end),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF3B82F6),
            onPrimary: Colors.white,
            surface: Color(0xFF1E293B),
            onSurface: Colors.white,
          ),
          dialogTheme: const DialogThemeData(backgroundColor: Color(0xFF0F172A)),
        ),
        child: child!,
      ),
    );

    if (picked != null) {
      startDate.value = DateFormat('yyyy-MM-dd').format(picked.start);
      endDate.value = DateFormat('yyyy-MM-dd').format(picked.end);
      activePreset.value = 'custom';
      loadReportSummary();
    }
  }

  Future<void> fetchData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        loadReportSummary(),
        loadReports(),
      ]);
    } catch (_) {}
    finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchData();

  /// GET /finance/report-summary
  Future<void> loadReportSummary() async {
    summaryLoading.value = true;
    try {
      final res = await FinanceService.to.getReportSummary(
        startDate: startDate.value,
        endDate: endDate.value,
      );
      if (res.success && res.data != null) {
        final d = res.data!;
        final billed = double.tryParse((d['totalBilled'] ?? d['total_billed'] ?? d['gross_invoiced'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        final dues = double.tryParse((d['pendingDues'] ?? d['pending_dues'] ?? d['outstanding_receivables'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        totalRevenue.value = double.tryParse((d['totalRevenue'] ?? d['total_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        totalBilled.value = billed > 0 ? billed : totalRevenue.value;
        pendingDues.value = dues;
        subRevenue.value = double.tryParse((d['subRevenue'] ?? d['sub_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        campaignRevenue.value = double.tryParse((d['campaignRevenue'] ?? d['campaign_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        governmentRevenue.value = double.tryParse((d['governmentRevenue'] ?? d['government_revenue'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        taxTotal.value = double.tryParse((d['taxTotal'] ?? d['tax_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        cgstTotal.value = double.tryParse((d['cgstTotal'] ?? d['cgst_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        sgstTotal.value = double.tryParse((d['sgstTotal'] ?? d['sgst_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        igstTotal.value = double.tryParse((d['igstTotal'] ?? d['igst_total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
        activeSubs.value = int.tryParse((d['activeSubs'] ?? d['active_subscriptions'] ?? 0).toString()) ?? 0;
        activeCampaigns.value = int.tryParse((d['activeCampaigns'] ?? d['active_campaigns'] ?? 0).toString()) ?? 0;

        // Parse Live Invoices
        List rawInvoices = [];
        if (d['invoices'] is List) {
          rawInvoices = d['invoices'] as List;
        }

        if (rawInvoices.isNotEmpty) {
          final parsed = rawInvoices
              .whereType<Map>()
              .map((e) => LiveInvoiceItem.fromJson(Map<String, dynamic>.from(e)))
              .toList();
          liveInvoices.assignAll(parsed);
          invoiceCount.value = parsed.length;
        } else {
          // Fallback to fetch invoices from endpoint if report-summary doesn't embed invoices array
          await _fallbackFetchLiveInvoices();
        }
      } else {
        await _fallbackFetchLiveInvoices();
      }
    } catch (_) {
      await _fallbackFetchLiveInvoices();
    } finally {
      summaryLoading.value = false;
    }
  }

  /// Fallback loader for live invoices matching period
  Future<void> _fallbackFetchLiveInvoices() async {
    try {
      final invRes = await FinanceService.to.getInvoices(limit: 50);
      if (invRes.success && invRes.data != null) {
        List items = [];
        if (invRes.data is List) {
          items = invRes.data as List;
        } else if (invRes.data is Map && invRes.data['items'] is List) {
          items = invRes.data['items'] as List;
        } else if (invRes.data is Map && invRes.data['rows'] is List) {
          items = invRes.data['rows'] as List;
        } else if (invRes.data is Map && invRes.data['data'] is List) {
          items = invRes.data['data'] as List;
        }

        final parsed = items
            .whereType<Map>()
            .map((e) => LiveInvoiceItem.fromJson(Map<String, dynamic>.from(e)))
            .toList();

        liveInvoices.assignAll(parsed);
        invoiceCount.value = parsed.length;

        if (totalBilled.value == 0 && parsed.isNotEmpty) {
          double sumBilled = 0;
          double sumTax = 0;
          double sumDues = 0;
          double sumPaid = 0;

          for (final inv in parsed) {
            sumBilled += inv.total;
            sumTax += inv.taxAmount;
            if (inv.status == 'paid') {
              sumPaid += inv.total;
            } else if (inv.status == 'issued' || inv.status == 'overdue') {
              sumDues += inv.total;
            }
          }

          totalBilled.value = sumBilled;
          totalRevenue.value = sumPaid;
          taxTotal.value = sumTax;
          pendingDues.value = sumDues;
        }
      }
    } catch (_) {}
  }

  /// GET /reports
  Future<void> loadReports() async {
    try {
      final res = await FinanceService.to.getReports(page: 1, limit: 50);
      if (res.data != null) {
        List items = [];
        if (res.data is List) {
          items = res.data as List;
        } else if (res.data is Map && res.data['data'] is List) {
          items = res.data['data'] as List;
        } else if (res.data is Map && res.data['items'] is List) {
          items = res.data['items'] as List;
        } else if (res.data is Map && res.data['rows'] is List) {
          items = res.data['rows'] as List;
        }

        final parsed = items
            .whereType<Map>()
            .map((e) => RecentReport.fromJson(Map<String, dynamic>.from(e)))
            .toList();
        archiveReports.assignAll(parsed);
      } else {
        archiveReports.clear();
      }
    } catch (_) {
      archiveReports.clear();
    }
  }

  // ----------------------------------------------------
  // TAB 1 (Live Revenue Ledger) Getters & Filtering
  // ----------------------------------------------------
  List<String> get availableLedgerStatuses {
    final set = <String>{};
    for (final inv in liveInvoices) {
      if (inv.status.isNotEmpty) {
        set.add(inv.status.toLowerCase());
      }
    }
    return set.toList();
  }

  List<LiveInvoiceItem> get filteredLiveInvoices {
    final q = ledgerSearch.value.trim().toLowerCase();
    final filterStatus = ledgerStatusFilter.value;

    return liveInvoices.where((inv) {
      final matchesStatus = filterStatus == 'all' || inv.status == filterStatus;
      final matchesSearch = q.isEmpty ||
          inv.code.toLowerCase().contains(q) ||
          inv.customerName.toLowerCase().contains(q) ||
          inv.formattedPayerType.toLowerCase().contains(q) ||
          inv.formattedBillingStream.toLowerCase().contains(q) ||
          inv.formattedStatusLabel.toLowerCase().contains(q) ||
          inv.total.toString().contains(q);

      return matchesStatus && matchesSearch;
    }).toList();
  }

  List<LiveInvoiceItem> get pagedLiveInvoices {
    final list = filteredLiveInvoices;
    final start = (ledgerPage.value - 1) * ledgerPageSize.value;
    if (start >= list.length) return [];
    final end = (start + ledgerPageSize.value).clamp(0, list.length);
    return list.sublist(start, end);
  }

  int get ledgerTotalPages => (filteredLiveInvoices.length / ledgerPageSize.value).ceil().clamp(1, 9999);

  // ----------------------------------------------------
  // TAB 2 (Compiled Reports Archive) Getters & Filtering
  // ----------------------------------------------------
  List<RecentReport> get filteredArchiveReports {
    final query = archiveSearch.value.trim().toLowerCase();
    final catFilter = selectedCategoryFilter.value;

    final list = archiveReports.where((r) {
      final matchesSearch = query.isEmpty ||
          r.title.toLowerCase().contains(query) ||
          r.id.toLowerCase().contains(query) ||
          r.period.toLowerCase().contains(query);

      final matchesCat = catFilter == 'all' || r.reportType == catFilter;

      return matchesSearch && matchesCat;
    }).toList();

    // Sort matching Admin Panel 5 options
    list.sort((a, b) {
      switch (archiveSort.value) {
        case 'oldest':
          return a.dateText.compareTo(b.dateText);
        case 'amount_high':
          return b.totalBilled.compareTo(a.totalBilled);
        case 'amount_low':
          return a.totalBilled.compareTo(b.totalBilled);
        case 'title':
          return a.title.toLowerCase().compareTo(b.title.toLowerCase());
        case 'newest':
        default:
          return b.dateText.compareTo(a.dateText);
      }
    });

    return list;
  }

  List<RecentReport> get pagedArchiveReports {
    final list = filteredArchiveReports;
    final start = (archivePage.value - 1) * archivePageSize.value;
    if (start >= list.length) return [];
    final end = (start + archivePageSize.value).clamp(0, list.length);
    return list.sublist(start, end);
  }

  int get archiveTotalPages => (filteredArchiveReports.length / archivePageSize.value).ceil().clamp(1, 9999);

  /// Open Compiled Report Details Page (Admin Panel 1:1)
  void openReportDetails(RecentReport rep) {
    Get.toNamed(Routes.REPORT_DETAILS, arguments: rep);
  }

  // ----------------------------------------------------
  // Compile & Export CSV Action (Admin Panel 1:1)
  // ----------------------------------------------------
  Future<void> onGenerateReport() async {
    isGenerating.value = true;
    final typeOption = reportTypes.firstWhere(
      (r) => r.id == selectedReportType.value,
      orElse: () => reportTypes.first,
    );
    final autoTitle = '${typeOption.label} Ledger';
    final periodText = '${startDate.value} to ${endDate.value}';

    try {
      final payload = {
        'reportType': selectedReportType.value,
        'format': 'csv',
        'params': {
          'title': '$autoTitle ($periodText)',
          'period': periodText,
          'reportType': selectedReportType.value,
          'startDate': startDate.value,
          'endDate': endDate.value,
          'format': 'csv',
        },
      };

      final res = await FinanceService.to.generateReport(payload);
      final reportId = (res.data?['id'] ?? 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}').toString();
      final fileUrl = res.data?['file_url']?.toString();

      final newReport = RecentReport(
        id: reportId,
        title: '$autoTitle ($periodText)',
        reportType: selectedReportType.value,
        badge: typeOption.badge,
        period: periodText,
        dateText: DateFormat('dd/MM/yyyy').format(DateTime.now()),
        format: ReportFormat.csv,
        fileSizeText: '26.4 KB',
        fileUrl: fileUrl,
        totalBilled: totalBilled.value,
        totalRevenue: totalRevenue.value,
        subRevenue: subRevenue.value,
        campaignRevenue: campaignRevenue.value,
        taxTotal: taxTotal.value,
        pendingDues: pendingDues.value,
        activeSubs: activeSubs.value,
        activeCampaigns: activeCampaigns.value,
        invoiceCount: liveInvoices.length,
      );

      generatedReport.value = newReport;
      archiveReports.insert(0, newReport);

      // Generate RFC compliant CSV text
      final csvContent = _buildCsvReportString(autoTitle, periodText, selectedReportType.value, liveInvoices);

      // Save to device storage
      final savedPath = await _saveReportToDevice(newReport, csvContent, remoteFileUrl: fileUrl);

      // Switch to compiled reports tab
      activeTab.value = 'archive';

      _showDownloadSuccessSheet(newReport, savedPath, isCompiled: true);
    } catch (_) {
      // In case server generation response falls back, compile client instance
      final newReport = RecentReport(
        id: 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: '$autoTitle ($periodText)',
        reportType: selectedReportType.value,
        badge: typeOption.badge,
        period: periodText,
        dateText: DateFormat('dd/MM/yyyy').format(DateTime.now()),
        format: ReportFormat.csv,
        fileSizeText: '26.4 KB',
        totalBilled: totalBilled.value,
        totalRevenue: totalRevenue.value,
        subRevenue: subRevenue.value,
        campaignRevenue: campaignRevenue.value,
        taxTotal: taxTotal.value,
        pendingDues: pendingDues.value,
        activeSubs: activeSubs.value,
        activeCampaigns: activeCampaigns.value,
        invoiceCount: liveInvoices.length,
      );

      generatedReport.value = newReport;
      archiveReports.insert(0, newReport);

      final csvContent = _buildCsvReportString(autoTitle, periodText, selectedReportType.value, liveInvoices);
      final savedPath = await _saveReportToDevice(newReport, csvContent);

      activeTab.value = 'archive';
      _showDownloadSuccessSheet(newReport, savedPath, isCompiled: true);
    } finally {
      isGenerating.value = false;
    }
  }

  /// Direct Download of Compiled Report (from Tab 2 list item)
  Future<void> downloadCompiledReport(RecentReport report) async {
    downloading.value = true;
    try {
      String? remoteFileUrl = report.fileUrl;
      String? resolvedContent = report.content;

      // Try fetching fresh report details if available
      try {
        final res = await FinanceService.to.getReport(report.id);
        if (res.success && res.data != null) {
          final d = res.data!;
          resolvedContent = (d['content'] ?? d['csv'] ?? d['csv_content'] ?? resolvedContent)?.toString();
          if (d['file_url'] != null) {
            remoteFileUrl = d['file_url'].toString();
          }
        }
      } catch (_) {}

      final csvContent = resolvedContent ?? _buildCsvReportString(
        report.title,
        report.period,
        report.reportType,
        liveInvoices,
        totalBilledOverride: report.totalBilled,
        totalRevenueOverride: report.totalRevenue,
        taxTotalOverride: report.taxTotal,
        pendingDuesOverride: report.pendingDues,
      );

      final savedPath = await _saveReportToDevice(report, csvContent, remoteFileUrl: remoteFileUrl);
      _showDownloadSuccessSheet(report, savedPath, isCompiled: false);
    } catch (e) {
      Get.snackbar(
        'download_error'.tr,
        'Could not save report: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      downloading.value = false;
    }
  }

  /// Builds RFC 4180 compliant CSV string matching Admin Panel buildReportCsv
  String _buildCsvReportString(
    String title,
    String period,
    String repType,
    List<LiveInvoiceItem> invoices, {
    double? totalBilledOverride,
    double? totalRevenueOverride,
    double? taxTotalOverride,
    double? pendingDuesOverride,
  }) {
    final billed = totalBilledOverride ?? totalBilled.value;
    final revenue = totalRevenueOverride ?? totalRevenue.value;
    final tax = taxTotalOverride ?? taxTotal.value;
    final cgst = cgstTotal.value;
    final sgst = sgstTotal.value;
    final igst = igstTotal.value;
    final dues = pendingDuesOverride ?? pendingDues.value;

    final buffer = StringBuffer();
    buffer.writeln('"VMOVEXA Corporate Revenue & Collections Ledger"');
    buffer.writeln('"Title","${title.replaceAll('"', '""')}"');
    buffer.writeln('"Report Type","$repType"');
    buffer.writeln('"Period","${period.replaceAll('"', '""')}"');
    buffer.writeln('"Total Billed (INR)","$billed"');
    buffer.writeln('"Total Revenue Paid (INR)","$revenue"');
    buffer.writeln('"Total Tax / GST (INR)","$tax"');
    buffer.writeln('"CGST (INR)","$cgst"');
    buffer.writeln('"SGST (INR)","$sgst"');
    buffer.writeln('"IGST (INR)","$igst"');
    buffer.writeln('"Outstanding Dues (INR)","$dues"');

    if (invoices.isNotEmpty) {
      buffer.writeln('');
      buffer.writeln('"Invoice Code","Client / Payer","Issue Date","Due Date","Payer Type","Type","Taxable Subtotal (INR)","CGST (INR)","SGST (INR)","IGST (INR)","GST Amount (INR)","Total Amount (INR)","Status"');
      for (final inv in invoices) {
        final row = [
          '"${inv.code}"',
          '"${inv.customerName.replaceAll('"', '""')}"',
          '"${inv.issuedAt}"',
          '"${inv.dueAt}"',
          '"${inv.formattedPayerType}"',
          '"${inv.formattedBillingStream}"',
          inv.subtotal,
          inv.cgstAmount,
          inv.sgstAmount,
          inv.igstAmount,
          inv.taxAmount,
          inv.total,
          '"${inv.status.toUpperCase()}"',
        ].join(',');
        buffer.writeln(row);
      }
    }

    return '\uFEFF${buffer.toString()}';
  }

  /// Writes report file directly to public Downloads folder (/storage/emulated/0/Download)
  Future<String> _saveReportToDevice(RecentReport report, String csvContent, {String? remoteFileUrl}) async {
    final cleanId = report.id.replaceAll('#', '').replaceAll(' ', '_');
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final fileName = 'VMOVEXA_${cleanId}_$timestamp.csv';

    List<int>? fileBytes;
    if (remoteFileUrl != null && remoteFileUrl.isNotEmpty) {
      try {
        String fullUrl = remoteFileUrl;
        if (!fullUrl.startsWith('http')) {
          fullUrl = 'https://api.vmovexa.com$remoteFileUrl';
        }
        final resp = await http.get(Uri.parse(fullUrl));
        if (resp.statusCode == 200) {
          fileBytes = resp.bodyBytes;
        }
      } catch (_) {}
    }

    // 1. Android Public Download Folder
    try {
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          final targetFile = File('${downloadDir.path}/$fileName');
          if (fileBytes != null) {
            await targetFile.writeAsBytes(fileBytes, flush: true);
          } else {
            await targetFile.writeAsString(csvContent, flush: true);
          }
          return targetFile.path;
        }
      }
    } catch (_) {}

    // 2. System Temp Fallback
    try {
      final tempDir = Directory.systemTemp;
      final targetFile = File('${tempDir.path}/$fileName');
      if (fileBytes != null) {
        await targetFile.writeAsBytes(fileBytes, flush: true);
      } else {
        await targetFile.writeAsString(csvContent, flush: true);
      }
      return targetFile.path;
    } catch (e) {
      debugPrint('Fallback storage write error: $e');
    }

    return fileName;
  }

  /// Displays download confirmation bottom sheet with file path
  void _showDownloadSuccessSheet(RecentReport report, String filePath, {bool isCompiled = false}) {
    Clipboard.setData(ClipboardData(text: filePath));

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Color(0xFF181827),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          border: Border(top: BorderSide(color: Color(0xFF28283E))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.download_done_rounded, color: Color(0xFF10B981), size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCompiled ? 'report_compiled_and_downloaded'.tr : 'report_downloaded_success'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        report.title,
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              'file_saved_to_device'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F1A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.insert_drive_file_outlined, color: Color(0xFF60A5FA), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      filePath,
                      style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontFamily: 'monospace'),
                      overflow: TextOverflow.ellipsis,
                    ),
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
                      side: const BorderSide(color: Color(0xFF28283E)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('close'.tr, style: const TextStyle(color: Colors.white70)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: filePath));
                        Get.back();
                        Get.snackbar(
                          'path_copied'.tr,
                          'path_copied_clipboard'.tr,
                          backgroundColor: const Color(0xFF10B981),
                          colorText: Colors.white,
                          snackPosition: SnackPosition.BOTTOM,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(
                        'copy_file_path'.tr,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );

    Get.snackbar(
      isCompiled ? 'report_compiled'.tr : 'report_downloaded'.tr,
      'saved_to_downloads'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  /// Delete Report with confirmation modal
  void confirmDeleteReport(RecentReport report) {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF181827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.delete_forever_rounded, color: Color(0xFFEF4444), size: 20),
            ),
            const SizedBox(width: 10),
            Text(
              'delete_report_question'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'delete_report_confirm_msg'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('cancel'.tr, style: const TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              await _executeDelete(report);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('delete'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _executeDelete(RecentReport report) async {
    try {
      await FinanceService.to.deleteReport(report.id);
    } catch (_) {}
    archiveReports.removeWhere((r) => r.id == report.id);
    Get.snackbar(
      'report_deleted'.tr,
      'report_deleted_msg'.tr,
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void onNotificationTap() => Get.toNamed(Routes.FINANCE_NOTIFICATIONS);
  void onBackPressed() => Get.back();
}
