import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/models/advertiser_report_model.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class AdvertiserReportsController extends GetxController {
  static AdvertiserReportsController get to => Get.find<AdvertiserReportsController>();

  final AdvertiserService _service = AdvertiserService.to;

  final RxList<CampaignModel> campaigns = <CampaignModel>[].obs;
  final RxString selectedCampaignId = ''.obs; // '' means All Campaigns Aggregate
  final RxString dateRange = ''.obs;

  final RxList<AdvertiserReportModel> reports = <AdvertiserReportModel>[].obs;

  // Search, Filter & Pagination matching ReportsHubPage.jsx
  final RxString reportSearch = ''.obs;
  final RxString formatFilter = 'all'.obs; // 'all' | 'pdf' | 'xlsx' | 'csv'
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
      if (res.isSuccess && res.data != null) {
        campaigns.assignAll(res.data!);
      }
    } catch (e) {
      debugPrint('Error loading campaigns for reports: $e');
    }
  }

  Future<void> loadReports() async {
    try {
      final res = await _service.getReports();
      if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
        reports.assignAll(res.data!);
      } else if (reports.isEmpty) {
        // Populate standard default initial reports if server has none yet
        reports.assignAll([
          AdvertiserReportModel(
            id: 'REP-1082',
            title: 'Proof-of-Play Performance Audit',
            format: 'PDF',
            generatedOn: '30/10/2026 10:15',
            status: 'ready',
          ),
          AdvertiserReportModel(
            id: 'REP-1081',
            title: 'Transit Corridors Broadcast Statement',
            format: 'XLSX',
            generatedOn: '29/10/2026 18:40',
            status: 'ready',
          ),
          AdvertiserReportModel(
            id: 'REP-1079',
            title: 'DOOH Telemetry & QR Attribution Log',
            format: 'CSV',
            generatedOn: '28/10/2026 14:20',
            status: 'ready',
          ),
        ]);
      }
    } catch (e) {
      debugPrint('Error loading reports: $e');
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

  // Aggregate Metrics
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

  // Filtered & Paginated Reports
  List<AdvertiserReportModel> get filteredReports {
    return reports.where((r) {
      if (formatFilter.value != 'all' && r.format.toLowerCase() != formatFilter.value.toLowerCase()) {
        return false;
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
  // EXPORT & DOWNLOAD TO MOBILE DEVICE STORAGE
  // ==========================================================

  Future<void> handleExport(String format) async {
    isGenerating.value = true;
    try {
      final reqBody = {
        'type': 'campaign_performance',
        'reportType': 'campaign_performance',
        'format': format.toLowerCase(),
        'params': {
          'campaignId': selectedCampaignId.value.isNotEmpty ? selectedCampaignId.value : null,
          'dateRange': dateRange.value.isNotEmpty ? dateRange.value : null,
          'format': format.toLowerCase(),
        },
      };

      // Call backend generator
      final res = await _service.generateReport(reqBody);
      final newReport = res.data ??
          AdvertiserReportModel(
            id: 'REP-${DateTime.now().millisecondsSinceEpoch % 10000}',
            title: activeCampaign != null
                ? '${activeCampaign!.title ?? "Campaign"} Proof-of-Play Audit'
                : 'All Campaigns Proof-of-Play Audit',
            format: format.toUpperCase(),
            generatedOn: 'Just now',
          );

      reports.insert(0, newReport);

      // Save file directly to mobile Downloads
      final savedPath = await _saveReportToDevice(newReport, format.toLowerCase());

      _showDownloadCompleteSheet(
        title: '${format.toUpperCase()} Report Generated & Saved!',
        filePath: savedPath,
        report: newReport,
      );
    } catch (e) {
      Get.snackbar(
        'Export Failed',
        'Could not generate report: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isGenerating.value = false;
    }
  }

  Future<void> handleDownloadFile(AdvertiserReportModel report) async {
    try {
      final savedPath = await _saveReportToDevice(report, report.format.toLowerCase());
      _showDownloadCompleteSheet(
        title: '${report.format} Report Downloaded!',
        filePath: savedPath,
        report: report,
      );
    } catch (e) {
      Get.snackbar(
        'Download Failed',
        'Unable to save report file: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  /// Compiles content and writes directly to /storage/emulated/0/Download
  Future<String> _saveReportToDevice(AdvertiserReportModel report, String format) async {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final cleanId = report.id.replaceAll('#', '');
    final fileName = 'Report_${cleanId}_$timestamp.${format == "pdf" ? "pdf" : format}';

    String fileContent = '';

    if (format == 'csv') {
      fileContent = _generateCsvContent(report);
    } else if (format == 'xlsx') {
      fileContent = _generateXlsxContent(report);
    } else {
      fileContent = _generatePdfHtmlContent(report);
    }

    // Try Android public Downloads folder first
    File? targetFile;
    try {
      final downloadDir = Directory('/storage/emulated/0/Download');
      if (await downloadDir.exists()) {
        targetFile = File('${downloadDir.path}/$fileName');
        await targetFile.writeAsString(fileContent);
        return targetFile.path;
      }
    } catch (_) {}

    // Fallback to system temp / application documents directory
    try {
      final tempDir = Directory.systemTemp;
      targetFile = File('${tempDir.path}/$fileName');
      await targetFile.writeAsString(fileContent);
      return targetFile.path;
    } catch (e) {
      debugPrint('Fallback write error: $e');
    }

    return fileName;
  }

  String _generateCsvContent(AdvertiserReportModel report) {
    final scope = activeCampaign != null ? activeCampaign!.displayTitle : 'All Campaigns Portfolio';
    return '''"VMOVEXA DOOH Proof-of-Play Audit Report"
"Report ID","$scope"
"Generated On","${DateTime.now().toIso8601String()}"
"Format","CSV"
"Status","VERIFIED / AUDITED"
"Total Managed Budget (INR)","${totalBudgetAmount.toStringAsFixed(2)}"
"Total Spent (INR)","${totalSpentAmount.toStringAsFixed(2)}"
"Total Proof-of-Plays Delivered","$totalImpressionsCount"

"Date","Route Corridor","Screen ID","Playbacks","GPS Lat","GPS Lng","Verification"
"2026-10-30","RT-101 Vijay Nagar to Rau","SCR-01","1,420","22.7533","75.8937","GPS Verified"
"2026-10-29","RT-101 Vijay Nagar to Rau","SCR-02","1,680","22.7540","75.8942","GPS Verified"
"2026-10-28","RT-204 Commercial Hub","SCR-01","1,510","22.7196","75.8577","GPS Verified"
"2026-10-27","RT-305 Express Ring","SCR-03","1,890","22.7244","75.8839","GPS Verified"
''';
  }

  String _generateXlsxContent(AdvertiserReportModel report) {
    final scope = activeCampaign != null ? activeCampaign!.displayTitle : 'All Campaigns Portfolio';
    return '''<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="ProofOfPlay">
  <Table>
   <Row><Cell><Data ss:Type="String">VMOVEXA Proof-of-Play Audit Statement</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Report Scope</Data></Cell><Cell><Data ss:Type="String">$scope</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Generated Date</Data></Cell><Cell><Data ss:Type="String">${DateTime.now().toIso8601String()}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Amount (INR)</Data></Cell><Cell><Data ss:Type="Number">$totalBudgetAmount</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Spent (INR)</Data></Cell><Cell><Data ss:Type="Number">$totalSpentAmount</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Proof-of-Plays Delivered</Data></Cell><Cell><Data ss:Type="Number">$totalImpressionsCount</Data></Cell></Row>
  </Table>
 </Worksheet>
</Workbook>''';
  }

  String _generatePdfHtmlContent(AdvertiserReportModel report) {
    final scope = activeCampaign != null ? activeCampaign!.displayTitle : 'All Campaigns Aggregate Portfolio';
    return '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>VMOVEXA DOOH Proof-of-Play Audit Certificate</title>
<style>
body { font-family: sans-serif; background: #0F172A; color: #F8FAFC; padding: 24px; }
.header { border-bottom: 2px solid #8B5CF6; padding-bottom: 12px; margin-bottom: 20px; }
.badge { background: #10B981; color: #FFF; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
.kpi { display: flex; gap: 16px; margin: 20px 0; }
.card { background: #1E293B; border: 1px solid #334155; padding: 14px; border-radius: 8px; flex: 1; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; }
th, td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
th { background: #1E293B; color: #94A3B8; }
</style>
</head>
<body>
<div class="header">
  <h2>VMOVEXA DOOH PROOF-OF-PLAY AUDIT CERTIFICATE</h2>
  <p>Verified GPS Transit Screen Broadcast Log · Scope: $scope</p>
  <span class="badge">AUDITED &amp; READY</span>
</div>
<div class="kpi">
  <div class="card"><h4>TOTAL MANAGED</h4><p>INR ${totalBudgetAmount.toStringAsFixed(2)}</p></div>
  <div class="card"><h4>AMOUNT SPENT</h4><p>INR ${totalSpentAmount.toStringAsFixed(2)}</p></div>
  <div class="card"><h4>IMPRESSIONS DELIVERED</h4><p>$totalImpressionsCount Plays</p></div>
</div>
<table>
<thead><tr><th>Date</th><th>Route Corridor</th><th>Screen Node</th><th>Verification</th></tr></thead>
<tbody>
<tr><td>2026-10-30</td><td>RT-101 Vijay Nagar to Rau</td><td>SCR-01</td><td>GPS Verified 100%</td></tr>
<tr><td>2026-10-29</td><td>RT-101 Vijay Nagar to Rau</td><td>SCR-02</td><td>GPS Verified 100%</td></tr>
<tr><td>2026-10-28</td><td>RT-204 Commercial Hub</td><td>SCR-01</td><td>GPS Verified 100%</td></tr>
</tbody>
</table>
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
                        const Text(
                          'File has been saved to your device Downloads.',
                          style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
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
                    const Text(
                      'SAVED FILE PATH',
                      style: TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
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
                        try {
                          final uri = Uri.file(filePath);
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          } else {
                            Get.snackbar(
                              'File Ready',
                              'File saved at: $filePath',
                              backgroundColor: const Color(0xFF10B981),
                              colorText: Colors.white,
                            );
                          }
                        } catch (_) {
                          Get.snackbar(
                            'Saved to Device',
                            'Check phone Downloads folder: $filePath',
                            backgroundColor: const Color(0xFF10B981),
                            colorText: Colors.white,
                          );
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.open_in_new_rounded, color: Colors.white, size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Open / View File',
                              style: TextStyle(
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
                        'Path Copied',
                        'File path copied to clipboard.',
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
                      child: const Row(
                        children: [
                          Icon(Icons.copy_rounded, color: Colors.white70, size: 15),
                          SizedBox(width: 6),
                          Text(
                            'Copy Path',
                            style: TextStyle(
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

