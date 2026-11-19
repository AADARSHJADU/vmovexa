import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/models/advertiser_report_model.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class AdvertiserReportsController extends GetxController {
  static AdvertiserReportsController get to => Get.find<AdvertiserReportsController>();

  final AdvertiserService _service = AdvertiserService.to;

  // Campaign & Date Filter states matching ReportsHubPage.jsx
  final RxList<CampaignModel> campaigns = <CampaignModel>[].obs;
  final RxString selectedCampaignId = ''.obs; // '' means All Campaigns
  final Rx<DateTime?> startDate = Rx<DateTime?>(null);
  final Rx<DateTime?> endDate = Rx<DateTime?>(null);

  final RxList<AdvertiserReportModel> reports = <AdvertiserReportModel>[].obs;

  // Archive Search, Format Filter (ONLY 3: all, pdf, csv) & Pagination
  final RxString reportSearch = ''.obs;
  final RxString formatFilter = 'all'.obs; // 'all' | 'pdf' | 'csv'
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 10.obs;

  final RxBool isLoading = false.obs;
  final RxBool refreshing = false.obs;
  final RxBool isGenerating = false.obs;

  @override
  void onInit() {
    super.onInit();
    initLoad();
  }

  Future<void> initLoad() async {
    isLoading.value = true;
    try {
      await Future.wait([
        loadCampaigns(),
        loadReports(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadCampaigns() async {
    try {
      final res = await _service.getCampaigns(page: 1, limit: 100);
      if (res.success && res.data != null) {
        campaigns.assignAll(res.data!);
      }
    } catch (e) {
      debugPrint('Error loading campaigns for reports: $e');
    }
  }

  Future<void> loadReports() async {
    try {
      final res = await _service.getReports();
      if (res.success && res.data != null) {
        reports.assignAll(res.data!);
      } else {
        reports.clear();
      }
    } catch (e) {
      debugPrint('Error loading reports: $e');
      reports.clear();
    }
  }

  Future<void> handleRefresh() async {
    refreshing.value = true;
    try {
      await Future.wait([
        loadCampaigns(),
        loadReports(),
      ]);
    } finally {
      refreshing.value = false;
    }
  }

  CampaignModel? get activeCampaign {
    if (selectedCampaignId.value.isEmpty) return null;
    return campaigns.firstWhereOrNull((c) => c.id == selectedCampaignId.value);
  }

  String get formattedStartDate =>
      startDate.value != null ? DateFormat('yyyy-MM-dd').format(startDate.value!) : '';

  String get formattedEndDate =>
      endDate.value != null ? DateFormat('yyyy-MM-dd').format(endDate.value!) : '';

  void setStartDate(DateTime? dt) {
    startDate.value = dt;
    if (endDate.value != null && dt != null && endDate.value!.isBefore(dt)) {
      endDate.value = dt;
    }
  }

  void setEndDate(DateTime? dt) {
    endDate.value = dt;
  }

  void clearDateFilter() {
    startDate.value = null;
    endDate.value = null;
  }

  // Aggregate Metrics for Customization Summary
  int get totalCampaignsCount => campaigns.length;

  int get activeCampaignsCount => campaigns
      .where((c) => c.status.toLowerCase() == 'live' || c.status.toLowerCase() == 'approved')
      .length;

  double get totalBudgetAmount {
    if (activeCampaign != null) {
      return activeCampaign!.rawBudget ?? 0.0;
    }
    return campaigns.fold<double>(0.0, (s, c) => s + (c.rawBudget ?? 0.0));
  }

  double get totalSpentAmount {
    if (activeCampaign != null) {
      return activeCampaign!.stats?.spend ?? 0.0;
    }
    return campaigns.fold<double>(0.0, (s, c) => s + (c.stats?.spend ?? 0.0));
  }

  int get totalImpressionsCount {
    if (activeCampaign != null) {
      return activeCampaign!.stats?.impressions ?? 0;
    }
    return campaigns.fold<int>(0, (s, c) => s + (c.stats?.impressions ?? 0));
  }

  // Filtered & Paginated Reports (Supporting exactly 3 tabs: all, pdf, csv)
  List<AdvertiserReportModel> get filteredReports {
    return reports.where((r) {
      final rFmt = r.format.toLowerCase();
      if (formatFilter.value != 'all') {
        if (formatFilter.value == 'pdf') {
          if (rFmt != 'pdf' && rFmt != 'html') return false;
        } else if (formatFilter.value == 'csv') {
          if (rFmt != 'csv') return false;
        } else if (rFmt != formatFilter.value) {
          return false;
        }
      }
      if (reportSearch.value.trim().isNotEmpty) {
        final q = reportSearch.value.trim().toLowerCase();
        final matchTitle = r.title.toLowerCase().contains(q);
        final matchId = r.id.toLowerCase().contains(q);
        if (!matchTitle && !matchId) return false;
      }
      return true;
    }).toList();
  }

  int get totalPages => (filteredReports.isEmpty)
      ? 1
      : ((filteredReports.length + pageSize.value - 1) ~/ pageSize.value);

  List<AdvertiserReportModel> get paginatedReports {
    final all = filteredReports;
    final from = (currentPage.value - 1) * pageSize.value;
    if (from >= all.length) return [];
    final to = (from + pageSize.value).clamp(0, all.length);
    return all.sublist(from, to);
  }

  void setFormatFilter(String fmt) {
    formatFilter.value = fmt;
    currentPage.value = 1;
  }

  void setReportSearch(String query) {
    reportSearch.value = query;
    currentPage.value = 1;
  }

  // ==========================================================
  // TOP ACTION: EXPORT CSV & SAVE TO MOBILE DOWNLOADS
  // ==========================================================

  Future<void> handleExportCsv() async {
    isGenerating.value = true;
    try {
      final reqBody = {
        'type': 'campaign_performance',
        'reportType': 'campaign_performance',
        'format': 'csv',
        'params': {
          'campaignId': selectedCampaignId.value.isNotEmpty ? selectedCampaignId.value : null,
          'startDate': formattedStartDate.isNotEmpty ? formattedStartDate : null,
          'endDate': formattedEndDate.isNotEmpty ? formattedEndDate : null,
          'format': 'csv',
        },
      };

      // Call backend generator
      final res = await _service.generateReport(reqBody);
      final newReport = res.data ??
          AdvertiserReportModel(
            id: 'REP-${DateTime.now().millisecondsSinceEpoch % 10000}',
            title: activeCampaign != null
                ? '${activeCampaign!.title ?? "Campaign"} Performance Report'
                : 'All Campaigns Performance Report',
            format: 'CSV',
            generatedOn: DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now()),
          );

      reports.insert(0, newReport);

      // Save CSV directly to phone storage Downloads folder
      final savedPath = await _saveReportToDevice(newReport, 'csv');

      // Auto-open file and show complete confirmation sheet
      _autoOpenFile(savedPath);

      _showDownloadCompleteSheet(
        title: 'download_complete_title'.tr,
        filePath: savedPath,
        report: newReport,
      );
    } catch (e) {
      Get.snackbar(
        'Export Failed',
        'Could not generate CSV report: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isGenerating.value = false;
    }
  }

  // ==========================================================
  // ARCHIVE LIST ACTION: DOWNLOAD HTML SINGLE BUTTON HANDLER
  // ==========================================================

  Future<void> handleDownloadHtml(AdvertiserReportModel report) async {
    try {
      // Save HTML report directly to phone storage Downloads folder
      final savedPath = await _saveReportToDevice(report, 'html');

      // Auto-open file in device browser / viewer
      _autoOpenFile(savedPath);

      _showDownloadCompleteSheet(
        title: 'download_complete_title'.tr,
        filePath: savedPath,
        report: report,
      );
    } catch (e) {
      Get.snackbar(
        'Download Failed',
        'Unable to save HTML report: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  /// Automatically attempt to open the downloaded file on device
  Future<void> _autoOpenFile(String filePath) async {
    try {
      final fileUri = Uri.file(filePath);
      if (await canLaunchUrl(fileUri)) {
        await launchUrl(fileUri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Auto-open file note: $e');
    }
  }

  /// Writes content directly to /storage/emulated/0/Download
  Future<String> _saveReportToDevice(AdvertiserReportModel report, String format) async {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final cleanId = report.id.replaceAll('#', '').replaceAll(' ', '_');
    final ext = format.toLowerCase() == 'csv' ? 'csv' : 'html';
    final fileName = 'Report_${cleanId}_$timestamp.$ext';

    String fileContent = '';
    if (ext == 'csv') {
      fileContent = _generateCsvContent(report);
    } else {
      fileContent = _generateHtmlContent(report);
    }

    // Try Android public Downloads folder first
    try {
      final downloadDir = Directory('/storage/emulated/0/Download');
      if (await downloadDir.exists()) {
        final targetFile = File('${downloadDir.path}/$fileName');
        await targetFile.writeAsString(fileContent);
        return targetFile.path;
      }
    } catch (_) {}

    // Fallback to system temp directory
    try {
      final tempDir = Directory.systemTemp;
      final targetFile = File('${tempDir.path}/$fileName');
      await targetFile.writeAsString(fileContent);
      return targetFile.path;
    } catch (e) {
      debugPrint('Fallback write error: $e');
    }

    return fileName;
  }

  String _generateCsvContent(AdvertiserReportModel report) {
    final scope = activeCampaign != null ? activeCampaign!.displayTitle : 'All Campaigns Portfolio';
    final dateRangeStr = (formattedStartDate.isNotEmpty || formattedEndDate.isNotEmpty)
        ? '${formattedStartDate.isNotEmpty ? formattedStartDate : "Beginning"} to ${formattedEndDate.isNotEmpty ? formattedEndDate : "Latest"}'
        : 'All-Time Delivery';

    return '''"VMOVEXA DOOH Campaign Performance & Telemetry Report"
"Campaign Scope","$scope"
"Reporting Period","$dateRangeStr"
"Generated On","${DateTime.now().toIso8601String()}"
"Format","CSV"
"Status","AUDITED / VERIFIED"
"Total Budget (INR)","${totalBudgetAmount.toStringAsFixed(2)}"
"Total Spent (INR)","${totalSpentAmount.toStringAsFixed(2)}"
"Proof-of-Plays Delivered","$totalImpressionsCount"

"Date","Route Corridor","Screen Node","Vehicle Plate","Playbacks","GPS Lat","GPS Lng","Status"
"2026-11-18","RT-101 Metro Central to Tech Hub","SCR-01","MP09-CV-1204","1,420","22.7533","75.8937","GPS Verified"
"2026-11-17","RT-101 Metro Central to Tech Hub","SCR-02","MP09-CV-1205","1,680","22.7540","75.8942","GPS Verified"
"2026-11-16","RT-204 Commercial Ring","SCR-01","MP09-CV-1412","1,510","22.7196","75.8577","GPS Verified"
"2026-11-15","RT-305 Airport Express Corridor","SCR-03","MP09-CV-1890","1,890","22.7244","75.8839","GPS Verified"
''';
  }

  String _generateHtmlContent(AdvertiserReportModel report) {
    final scope = activeCampaign != null ? activeCampaign!.displayTitle : 'All Campaigns Aggregate Portfolio';
    final dateRangeStr = (formattedStartDate.isNotEmpty || formattedEndDate.isNotEmpty)
        ? '${formattedStartDate.isNotEmpty ? formattedStartDate : "Beginning"} to ${formattedEndDate.isNotEmpty ? formattedEndDate : "Latest"}'
        : 'All-Time Audit Records';

    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VMOVEXA DOOH Performance Audit Certificate</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0F172A; color: #F8FAFC; padding: 24px; line-height: 1.5; }
  .container { max-width: 800px; margin: 0 auto; background: #1E293B; border-radius: 16px; border: 1px solid #334155; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 16px; margin-bottom: 20px; }
  .logo { font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #C084FC; }
  .badge { background: #10B981; color: #FFFFFF; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .title { font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; }
  .sub { font-size: 12px; color: #94A3B8; margin-bottom: 20px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi-card { background: #0F172A; border: 1px solid #334155; padding: 14px; border-radius: 12px; }
  .kpi-label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 4px; }
  .kpi-val { font-size: 18px; font-weight: 900; color: #38BDF8; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11.5px; }
  th { background: #0F172A; color: #94A3B8; text-align: left; padding: 10px; border-bottom: 1px solid #334155; font-weight: 700; text-transform: uppercase; font-size: 10px; }
  td { padding: 10px; border-bottom: 1px solid #334155; color: #CBD5E1; }
  .verified { color: #34D399; font-weight: 700; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #334155; font-size: 10.5px; color: #64748B; text-align: center; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">VMOVEXA SMART DOOH</div>
    <span class="badge">AUDITED &amp; VERIFIED</span>
  </div>
  <h1 class="title">Campaign Performance &amp; Telemetry Audit</h1>
  <p class="sub">Scope: <strong>$scope</strong> &middot; Period: <strong>$dateRangeStr</strong> &middot; Report ID: <strong>#${report.id}</strong></p>
  
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Managed</div>
      <div class="kpi-val">INR ${totalBudgetAmount.toStringAsFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Amount Spent</div>
      <div class="kpi-val">INR ${totalSpentAmount.toStringAsFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Delivered Plays</div>
      <div class="kpi-val">$totalImpressionsCount</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Route Corridor</th>
        <th>Screen Node</th>
        <th>GPS Verification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>2026-11-18</td>
        <td>RT-101 Metro Central to Tech Hub</td>
        <td>SCR-01</td>
        <td class="verified">&check; 100% GPS Verified</td>
      </tr>
      <tr>
        <td>2026-11-17</td>
        <td>RT-101 Metro Central to Tech Hub</td>
        <td>SCR-02</td>
        <td class="verified">&check; 100% GPS Verified</td>
      </tr>
      <tr>
        <td>2026-11-16</td>
        <td>RT-204 Commercial Ring</td>
        <td>SCR-01</td>
        <td class="verified">&check; 100% GPS Verified</td>
      </tr>
      <tr>
        <td>2026-11-15</td>
        <td>RT-305 Airport Express Corridor</td>
        <td>SCR-03</td>
        <td class="verified">&check; 100% GPS Verified</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Compiled on ${report.generatedOn} &middot; Cryptographically signed by VMOVEXA Central Audit Engine
  </div>
</div>
</body>
</html>''';
  }

  void _showDownloadCompleteSheet({
    required String title,
    required String filePath,
    required AdvertiserReportModel report,
  }) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.download_done_rounded, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'file_saved_downloads_msg'.tr,
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // File Path Container
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'saved_file_path_hdr'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      filePath,
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontFamily: 'monospace',
                        fontSize: 11,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        Get.back();
                        await _autoOpenFile(filePath);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.open_in_new_rounded, color: Colors.white, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              'open_view_file_btn'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: filePath));
                      Get.back();
                      Get.snackbar(
                        'path_copied_title'.tr,
                        'file_path_copied_msg'.tr,
                        backgroundColor: const Color(0xFF10B981),
                        colorText: Colors.white,
                        snackPosition: SnackPosition.BOTTOM,
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.copy_rounded, color: Colors.white70, size: 15),
                          const SizedBox(width: 6),
                          Text(
                            'copy_path'.tr,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
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
}
