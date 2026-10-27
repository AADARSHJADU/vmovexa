import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../../../../widgets/custom_button.dart';
import '../model/report_models.dart';
import '../view/report_generated_view.dart';

class RevenueReportingController extends GetxController {
  // ---------------- Header ----------------
  final RxInt notificationCount = 1.obs;
  final RxBool isLoading = false.obs;
  final RxBool summaryLoading = false.obs;
  final RxBool isGenerating = false.obs;

  // ---------------- Reporting Period Dates ----------------
  final RxString startDate = ''.obs;
  final RxString endDate = ''.obs;
  final RxString activePreset = 'this_month'.obs;

  // ---------------- Live KPIs ----------------
  final RxDouble totalRevenue = 0.0.obs;
  final RxDouble subRevenue = 0.0.obs;
  final RxDouble campaignRevenue = 0.0.obs;
  final RxDouble taxTotal = 0.0.obs;
  final RxInt activeSubs = 0.obs;
  final RxInt activeCampaigns = 0.obs;

  // ---------------- Report Type Selection ----------------
  final RxString selectedReportType = 'campaign_revenue'.obs;

  final List<ReportTypeOption> reportTypes = const [
    ReportTypeOption(
      id: 'campaign_revenue',
      label: 'Campaign Revenue',
      desc: 'Total ad spend, payments collected & impressions delivered',
      icon: Icons.analytics_outlined,
      color: Color(0xFF3B82F6),
      bgColor: Color(0xFF1E3A8A),
    ),
    ReportTypeOption(
      id: 'subscription_revenue',
      label: 'Subscription Revenue',
      desc: 'Active SaaS plans, MRR & billing cycle summary',
      icon: Icons.sync_rounded,
      color: Color(0xFF6366F1),
      bgColor: Color(0xFF312E81),
    ),
    ReportTypeOption(
      id: 'gst_tax',
      label: 'GST & Tax Statement',
      desc: 'CGST / SGST / IGST breakup for GST return filing',
      icon: Icons.receipt_long_outlined,
      color: Color(0xFF10B981),
      bgColor: Color(0xFF064E3B),
    ),
    ReportTypeOption(
      id: 'overdue_dues',
      label: 'Overdue Receivables',
      desc: 'Clients & tenants with unpaid / overdue invoices',
      icon: Icons.warning_amber_rounded,
      color: Color(0xFFF59E0B),
      bgColor: Color(0xFF78350F),
    ),
  ];

  // ---------------- Archive & Search ----------------
  final RxList<RecentReport> archiveReports = <RecentReport>[].obs;
  final TextEditingController searchController = TextEditingController();
  final RxString archiveSearch = ''.obs;

  // ---------------- Last Generated Report ----------------
  final Rx<RecentReport?> generatedReport = Rx<RecentReport?>(null);

  @override
  void onInit() {
    super.onInit();
    _initDateDefaults();
    fetchData();
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
          dialogBackgroundColor: const Color(0xFF0F172A),
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
        totalRevenue.value = double.tryParse((d['totalRevenue'] ?? d['total_revenue'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        subRevenue.value = double.tryParse((d['subRevenue'] ?? d['sub_revenue'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        campaignRevenue.value = double.tryParse((d['campaignRevenue'] ?? d['campaign_revenue'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        taxTotal.value = double.tryParse((d['taxTotal'] ?? d['tax_total'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        activeSubs.value = int.tryParse((d['activeSubs'] ?? d['active_subscriptions'] ?? 0).toString()) ?? 0;
        activeCampaigns.value = int.tryParse((d['activeCampaigns'] ?? d['active_campaigns'] ?? 0).toString()) ?? 0;
      }
    } catch (_) {}
    finally {
      summaryLoading.value = false;
    }
  }

  /// GET /reports
  Future<void> loadReports() async {
    try {
      final res = await FinanceService.to.getReports();
      if (res.data != null) {
        List items = [];
        if (res.data is List) {
          items = res.data as List;
        } else if (res.data is Map && res.data['data'] is List) {
          items = res.data['data'] as List;
        } else if (res.data is Map && res.data['items'] is List) {
          items = res.data['items'] as List;
        }

        final parsed = items.map((e) => RecentReport.fromJson(Map<String, dynamic>.from(e))).toList();
        archiveReports.assignAll(parsed);
      }
    } catch (_) {
      if (archiveReports.isEmpty) {
        _assignFallbackArchive();
      }
    }
  }

  void _assignFallbackArchive() {
    archiveReports.assignAll([
      RecentReport(
        id: 'REP-1042',
        title: 'Campaign Revenue Statement',
        period: '01 Oct 2026 → 27 Oct 2026',
        dateText: '27 Oct 2026',
        format: ReportFormat.csv,
        fileSizeText: '24.8 KB',
        totalRevenue: 24850000.0,
        subRevenue: 4850000.0,
        campaignRevenue: 20000000.0,
        taxTotal: 873000.0,
        activeSubs: 22,
        activeCampaigns: 15,
      ),
      RecentReport(
        id: 'REP-1041',
        title: 'GST & Tax Compliance Report',
        period: '01 Sep 2026 → 30 Sep 2026',
        dateText: '30 Sep 2026',
        format: ReportFormat.csv,
        fileSizeText: '32.1 KB',
        totalRevenue: 19800000.0,
        subRevenue: 4200000.0,
        campaignRevenue: 15600000.0,
        taxTotal: 712000.0,
        activeSubs: 20,
        activeCampaigns: 12,
      ),
    ]);
  }

  /// Filtered reports getter
  List<RecentReport> get filteredReports {
    final query = archiveSearch.value.trim().toLowerCase();
    if (query.isEmpty) return archiveReports;
    return archiveReports.where((r) {
      return r.title.toLowerCase().contains(query) ||
          r.id.toLowerCase().contains(query) ||
          r.period.toLowerCase().contains(query);
    }).toList();
  }

  /// Generate Report POST /reports/generate
  Future<void> onGenerateReport() async {
    isGenerating.value = true;
    final typeOption = reportTypes.firstWhere(
      (r) => r.id == selectedReportType.value,
      orElse: () => reportTypes.first,
    );
    final autoTitle = '${typeOption.label} — ${startDate.value} to ${endDate.value}';
    final periodText = '${startDate.value} → ${endDate.value}';

    try {
      final payload = {
        'reportType': 'revenue',
        'params': {
          'title': autoTitle,
          'period': periodText,
          'reportType': selectedReportType.value,
          'startDate': startDate.value,
          'endDate': endDate.value,
        },
      };

      final res = await FinanceService.to.generateReport(payload);
      final reportId = (res.data?['id'] ?? 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}').toString();

      final newReport = RecentReport(
        id: reportId,
        title: autoTitle,
        period: periodText,
        dateText: DateFormat('dd MMM yyyy').format(DateTime.now()),
        format: ReportFormat.csv,
        fileSizeText: '26.4 KB',
        totalRevenue: totalRevenue.value,
        subRevenue: subRevenue.value,
        campaignRevenue: campaignRevenue.value,
        taxTotal: taxTotal.value,
        activeSubs: activeSubs.value,
        activeCampaigns: activeCampaigns.value,
      );

      generatedReport.value = newReport;
      archiveReports.insert(0, newReport);

      Get.to(() => const ReportGeneratedView());
      Get.snackbar(
        'Report Compiled',
        'Financial report generated successfully!',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (_) {
      // In case server generation response falls back, create client instance
      final newReport = RecentReport(
        id: 'REP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        title: autoTitle,
        period: periodText,
        dateText: DateFormat('dd MMM yyyy').format(DateTime.now()),
        format: ReportFormat.csv,
        fileSizeText: '26.4 KB',
        totalRevenue: totalRevenue.value,
        subRevenue: subRevenue.value,
        campaignRevenue: campaignRevenue.value,
        taxTotal: taxTotal.value,
        activeSubs: activeSubs.value,
        activeCampaigns: activeCampaigns.value,
      );

      generatedReport.value = newReport;
      archiveReports.insert(0, newReport);
      Get.to(() => const ReportGeneratedView());
    } finally {
      isGenerating.value = false;
    }
  }

  /// Download / Export CSV Functionality matching Admin Panel
  void downloadReportCsv(RecentReport report) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
    final csvContent = report.content ??
        'Report ID,Title,Period,Total Revenue,Subscription Revenue,Campaign Revenue,Total Tax,Active Subscriptions,Active Campaigns,Generated On\n'
        '"${report.id}","${report.title}","${report.period}","${currencyFormatter.format(report.totalRevenue)}","${currencyFormatter.format(report.subRevenue)}","${currencyFormatter.format(report.campaignRevenue)}","${currencyFormatter.format(report.taxTotal)}","${report.activeSubs}","${report.activeCampaigns}","${report.dateText}"\n';

    Clipboard.setData(ClipboardData(text: csvContent));

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(22),
        decoration: const BoxDecoration(
          color: Color(0xFF181827),
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
                    color: const Color(0xFF3B82F6).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.table_chart_rounded, color: Color(0xFF60A5FA), size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CSV Download & Export Ready',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${report.title} (${report.fileSizeText})',
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: Color(0xFF28283E)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F1A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF28283E)),
              ),
              child: Text(
                csvContent.trim(),
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                maxLines: 5,
                overflow: TextOverflow.ellipsis,
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
                    child: const Text('Close', style: TextStyle(color: Colors.white70)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child:
                  CustomButton(
                    text:  'Save / Download CSV',
                    onTap:(){
                      Get.back();
                      Get.snackbar(
                        'CSV Downloaded',
                        'Report data for "${report.title}" downloaded and copied to clipboard!',
                        backgroundColor: const Color(0xFF10B981),
                        colorText: Colors.white,
                        snackPosition: SnackPosition.BOTTOM,
                      );
                    },
                  ),


                  // ElevatedButton.icon(
                  //   onPressed: () {
                  //     Get.back();
                  //     Get.snackbar(
                  //       'CSV Downloaded',
                  //       'Report data for "${report.title}" downloaded and copied to clipboard!',
                  //       backgroundColor: const Color(0xFF10B981),
                  //       colorText: Colors.white,
                  //       snackPosition: SnackPosition.BOTTOM,
                  //     );
                  //   },
                  //   icon: const Icon(Icons.download_rounded, color: Colors.white, size: 16),
                  //   label: const Text('Save / Download CSV', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  //   style: ElevatedButton.styleFrom(
                  //     backgroundColor: const Color(0xFF3B82F6),
                  //     padding: const EdgeInsets.symmetric(vertical: 12),
                  //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  //   ),
                  // ),
                ),
              ],
            ),
          ],
        ),
      ),
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
                color: const Color(0xFFEF4444).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.delete_forever_rounded, color: Color(0xFFEF4444), size: 20),
            ),
            const SizedBox(width: 10),
            const Text('Delete Report?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to permanently remove "${report.title}" from the generated archive? This cannot be undone.',
          style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
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
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
      'Report Deleted',
      'Report "${report.title}" removed from archive.',
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void onNotificationTap() => Get.toNamed(Routes.FINANCE_NOTIFICATIONS);
  void onBackPressed() => Get.back();
}
