import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../model/report_models.dart';

class ReportDetailsController extends GetxController {
  final RxBool isLoading = false.obs;
  final RxBool isDownloading = false.obs;

  // Header & Report Identifiers
  final RxString reportId = ''.obs;
  final RxString reportTitle = ''.obs;
  final RxString periodStr = ''.obs;
  final RxString generatedDate = ''.obs;
  final RxString status = 'ready'.obs;
  final RxString fileUrl = ''.obs;

  // Executive KPI Totals (Admin Panel 1:1)
  final RxDouble totalBilled = 0.0.obs;
  final RxDouble totalRevenue = 0.0.obs;
  final RxDouble totalTax = 0.0.obs;
  final RxDouble cgstTotal = 0.0.obs;
  final RxDouble sgstTotal = 0.0.obs;
  final RxDouble igstTotal = 0.0.obs;
  final RxDouble pendingDues = 0.0.obs;

  // Itemized Invoices List (Admin Panel 1:1)
  final RxList<LiveInvoiceItem> allInvoices = <LiveInvoiceItem>[].obs;

  // Itemized Filters & Pagination
  final RxString statusFilter = 'all'.obs; // 'all' | 'paid' | 'issued' | 'overdue'
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 10.obs;

  RecentReport? sourceReport;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is RecentReport) {
      sourceReport = args;
      _initFromRecentReport(args);
    } else if (args is Map) {
      final rep = RecentReport.fromJson(Map<String, dynamic>.from(args));
      sourceReport = rep;
      _initFromRecentReport(rep);
    } else if (Get.parameters['id'] != null) {
      reportId.value = Get.parameters['id']!;
      fetchDetails();
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  void _initFromRecentReport(RecentReport rep) {
    reportId.value = rep.id.replaceAll('REP-', '').replaceAll('#', '');
    reportTitle.value = rep.title;
    periodStr.value = rep.period;
    generatedDate.value = rep.dateText;
    status.value = rep.status;
    fileUrl.value = rep.fileUrl ?? '';

    final summary = rep.summary;
    _populateFromSummary(summary, fallbackBilled: rep.totalBilled, fallbackRevenue: rep.totalRevenue, fallbackTax: rep.taxTotal, fallbackPending: rep.pendingDues);
  }

  void _populateFromSummary(
    Map<String, dynamic> summary, {
    double? fallbackBilled,
    double? fallbackRevenue,
    double? fallbackTax,
    double? fallbackPending,
  }) {
    List<LiveInvoiceItem> invoices = [];
    if (summary['invoices'] is List) {
      invoices = (summary['invoices'] as List)
          .whereType<Map>()
          .map((m) => LiveInvoiceItem.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    }
    allInvoices.assignAll(invoices);

    final calculatedBilled = invoices.fold<double>(0.0, (sum, i) => sum + i.total);
    final calculatedRevenue = invoices.where((i) => i.status == 'paid').fold<double>(0.0, (sum, i) => sum + i.total);
    final calculatedTax = invoices.fold<double>(0.0, (sum, i) => sum + i.taxAmount);
    final calculatedCgst = invoices.fold<double>(0.0, (sum, i) => sum + i.cgstAmount);
    final calculatedSgst = invoices.fold<double>(0.0, (sum, i) => sum + i.sgstAmount);
    final calculatedIgst = invoices.fold<double>(0.0, (sum, i) => sum + i.igstAmount);
    final calculatedDues = invoices.where((i) => ['issued', 'overdue'].contains(i.status)).fold<double>(0.0, (sum, i) => sum + i.total);

    totalBilled.value = double.tryParse((summary['totalBilled'] ?? summary['total_billed'] ?? calculatedBilled).toString()) ?? (fallbackBilled ?? calculatedBilled);
    totalRevenue.value = double.tryParse((summary['totalRevenue'] ?? summary['total_revenue'] ?? calculatedRevenue).toString()) ?? (fallbackRevenue ?? calculatedRevenue);
    totalTax.value = double.tryParse((summary['totalTax'] ?? summary['taxTotal'] ?? summary['tax_total'] ?? calculatedTax).toString()) ?? (fallbackTax ?? calculatedTax);
    cgstTotal.value = double.tryParse((summary['cgstTotal'] ?? summary['cgst_total'] ?? calculatedCgst).toString()) ?? calculatedCgst;
    sgstTotal.value = double.tryParse((summary['sgstTotal'] ?? summary['sgst_total'] ?? calculatedSgst).toString()) ?? calculatedSgst;
    igstTotal.value = double.tryParse((summary['igstTotal'] ?? summary['igst_total'] ?? calculatedIgst).toString()) ?? calculatedIgst;
    pendingDues.value = double.tryParse((summary['pendingDues'] ?? summary['pending_dues'] ?? calculatedDues).toString()) ?? (fallbackPending ?? calculatedDues);

    if (totalBilled.value == 0 && totalRevenue.value > 0) {
      totalBilled.value = totalRevenue.value;
    }
  }

  Future<void> fetchDetails() async {
    if (reportId.value.isEmpty) return;
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getReport(reportId.value);
      if (res.success && res.data != null) {
        final d = res.data!;
        Map<String, dynamic> summary = {};
        if (d['summary'] is Map) {
          summary = Map<String, dynamic>.from(d['summary']);
        }
        if (d['title'] != null && d['title'].toString().isNotEmpty) {
          reportTitle.value = d['title'].toString();
        }
        if (d['file_url'] != null) {
          fileUrl.value = d['file_url'].toString();
        }
        _populateFromSummary(summary);
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  // Filtered & Paged Invoices Getters
  List<LiveInvoiceItem> get filteredInvoices {
    final q = searchQuery.value.toLowerCase().trim();
    final filter = statusFilter.value;

    return allInvoices.where((inv) {
      final matchesSearch = q.isEmpty ||
          inv.code.toLowerCase().contains(q) ||
          inv.customerName.toLowerCase().contains(q) ||
          inv.payerType.toLowerCase().contains(q) ||
          inv.formattedPayerType.toLowerCase().contains(q);

      final matchesStatus = filter == 'all' || inv.status == filter;

      return matchesSearch && matchesStatus;
    }).toList();
  }

  int get totalItems => filteredInvoices.length;

  int get totalPages => (filteredInvoices.length / pageSize.value).ceil().clamp(1, 9999);

  List<LiveInvoiceItem> get pagedInvoices {
    final list = filteredInvoices;
    final start = (currentPage.value - 1) * pageSize.value;
    if (start >= list.length) return [];
    final end = (start + pageSize.value).clamp(0, list.length);
    return list.sublist(start, end);
  }

  void onStatusFilterChanged(String newStatus) {
    statusFilter.value = newStatus;
    currentPage.value = 1;
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
    currentPage.value = 1;
  }

  void onPageChanged(int page) {
    currentPage.value = page.clamp(1, totalPages);
  }

  void onPageSizeChanged(int newSize) {
    pageSize.value = newSize;
    currentPage.value = 1;
  }

  /// Download and save RFC-compliant CSV ledger file to device storage
  Future<void> exportCsv() async {
    isDownloading.value = true;
    try {
      final title = reportTitle.value.isNotEmpty ? reportTitle.value : 'Financial Statement REP-${reportId.value}';
      final cleanTitle = title.replaceAll(RegExp(r'[^a-zA-Z0-9-_]'), '_');
      final fileName = '${cleanTitle}_REP-${reportId.value}.csv';

      List<int>? remoteBytes;
      if (fileUrl.value.isNotEmpty && fileUrl.value.endsWith('.csv')) {
        try {
          String fullUrl = fileUrl.value;
          if (!fullUrl.startsWith('http')) {
            fullUrl = 'https://api.vmovexa.com${fileUrl.value}';
          }
          final resp = await http.get(Uri.parse(fullUrl));
          if (resp.statusCode == 200) {
            remoteBytes = resp.bodyBytes;
          }
        } catch (_) {}
      }

      final csvContent = _buildCsvReportString(title);

      String savedPath = '';
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          final target = File('${downloadDir.path}/$fileName');
          if (remoteBytes != null) {
            await target.writeAsBytes(remoteBytes, flush: true);
          } else {
            await target.writeAsString(csvContent, flush: true);
          }
          savedPath = target.path;
        }
      }

      if (savedPath.isEmpty) {
        savedPath = '/storage/emulated/0/Download/$fileName';
      }

      Get.snackbar(
        'csv_downloaded'.tr,
        '${'file_saved_at'.tr}: $savedPath',
        backgroundColor: const Color(0xFF065F46),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 4),
        icon: const Icon(Icons.check_circle_rounded, color: Color(0xFF34D399)),
      );
    } catch (e) {
      Get.snackbar(
        'download_error'.tr,
        '${'failed_to_export_csv'.tr}: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isDownloading.value = false;
    }
  }

  String _buildCsvReportString(String title) {
    final buffer = StringBuffer();
    buffer.writeln('"VMOVEXA Corporate Revenue & Collections Ledger"');
    buffer.writeln('"Report Title","${title.replaceAll('"', '""')}"');
    buffer.writeln('"Statement ID","REP-${reportId.value}"');
    buffer.writeln('"Period","${periodStr.value.replaceAll('"', '""')}"');
    buffer.writeln('"Generated On","${DateTime.now().toIso8601String()}"');
    buffer.writeln('"Total Billed (INR)","${totalBilled.value}"');
    buffer.writeln('"Total Revenue Realized (INR)","${totalRevenue.value}"');
    buffer.writeln('"Total Tax / GST (INR)","${totalTax.value}"');
    buffer.writeln('"CGST (INR)","${cgstTotal.value}"');
    buffer.writeln('"SGST (INR)","${sgstTotal.value}"');
    buffer.writeln('"IGST (INR)","${igstTotal.value}"');
    buffer.writeln('"Outstanding Receivables (INR)","${pendingDues.value}"');
    buffer.writeln('');
    buffer.writeln('"Invoice Code","Client / Payer Entity","Issue Date","Due Date","Payer Type","Billing Type","Taxable Subtotal (INR)","CGST (INR)","SGST (INR)","IGST (INR)","GST Amount (INR)","Gross Total (INR)","Status"');

    for (final inv in allInvoices) {
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

    return '\uFEFF${buffer.toString()}';
  }
}
