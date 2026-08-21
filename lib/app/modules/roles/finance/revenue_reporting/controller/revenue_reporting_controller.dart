import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/view/report_generated_view.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

import '../model/report_models.dart';

class RevenueReportingController extends GetxController {
  // ---------------- Header ----------------
  final RxInt notificationCount = 1.obs;

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Report Period ----------------
  final Rx<DateTimeRange> reportPeriod = DateTimeRange(start: DateTime(2026, 8, 1), end: DateTime(2026, 8, 31)).obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _formatDate(DateTime dt) => '${dt.day} ${_monthNames[dt.month - 1]} ${dt.year}';

  String get reportPeriodText => '${_formatDate(reportPeriod.value.start)} \u2013 ${_formatDate(reportPeriod.value.end)}';

  Future<void> onPickReportPeriod(BuildContext context) async {
    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: reportPeriod.value,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFB042FF),
            onPrimary: Colors.white,
            surface: Color(0xFF15151F),
            onSurface: Colors.white,
          ),
          dialogBackgroundColor: const Color(0xFF0B0B14),
        ),
        child: child!,
      ),
    );
    if (picked != null) reportPeriod.value = picked;
  }

  // ---------------- Revenue Summary ----------------
  final RxString totalRevenue = '\u20b913,35,000'.obs;
  final RxInt totalInvoices = 48.obs;
  final RxInt paidInvoices = 32.obs;
  final RxInt pendingInvoices = 16.obs;

  // ---------------- Report Filters ----------------
  final RxString selectedCustomer = 'All Customers'.obs;
  final List<String> customerOptions = const ['All Customers', 'VMOVEXA Advertising Pvt. Ltd.', 'CityMove Solutions', 'Urban Adz Media'];

  final RxString selectedInvoiceStatus = 'All Invoice Status'.obs;
  final List<String> invoiceStatusOptions = const ['All Invoice Status', 'Paid', 'Pending', 'Overdue'];

  final RxString selectedGst = 'All GST'.obs;
  final List<String> gstOptions = const ['All GST', 'GST Applicable', 'GST Exempt'];

  void setCustomer(String? v) => selectedCustomer.value = v ?? selectedCustomer.value;
  void setInvoiceStatus(String? v) => selectedInvoiceStatus.value = v ?? selectedInvoiceStatus.value;
  void setGst(String? v) => selectedGst.value = v ?? selectedGst.value;

  // ---------------- Recent Reports ----------------
  final RxList<RecentReport> recentReports = <RecentReport>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchData();
  }

  Future<void> fetchData() async {
    isLoading.value = true;
    try {
      // TODO: replace with real API/repository calls
      recentReports.assignAll(_mockRecentReports());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchData();

  // ---------------- Generated report state (populated by onGenerateReport) ----------------
  final RxBool isGenerating = false.obs;
  final RxString generatedReportTitle = ''.obs;
  final RxString generatedPeriodText = ''.obs;
  final Rx<ReportFormat> generatedFormat = ReportFormat.xlsx.obs;
  final RxString generatedFileSize = ''.obs;
  final Rxn<DateTime> generatedOnDateTime = Rxn<DateTime>();
  final RxString generatedByLabel = 'John Doe'.obs;

  String get generatedOnText {
    final dt = generatedOnDateTime.value;
    if (dt == null) return '—';
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${_formatDate(dt)}, ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  Future<void> onGenerateReport() async {
    isGenerating.value = true;
    try {
      // TODO: replace with a real API call that generates the report server-side
      await Future.delayed(const Duration(seconds: 1, milliseconds: 200));
      generatedReportTitle.value = 'Revenue Report \u2013 ${_monthNames[reportPeriod.value.start.month - 1]} ${reportPeriod.value.start.year}';
      generatedPeriodText.value = reportPeriodText;
      generatedFormat.value = ReportFormat.xlsx;
      generatedFileSize.value = '42 KB';
      generatedOnDateTime.value = DateTime(2026, 9, 1, 10, 30);
      Get.to(() => const ReportGeneratedView());
    } finally {
      isGenerating.value = false;
    }
  }

  // ---------------- Actions ----------------
  void onMenuTap() {
    // TODO: open drawer / navigation menu
  }

  void onNotificationTap() => Get.toNamed(Routes.FINANCE_NOTIFICATIONS);

  void onBackPressed() => Get.back();

  final RxBool isDownloading = false.obs;

  Future<void> onDownloadGeneratedReport() async {
    isDownloading.value = true;
    try {
      // TODO: generate/download the actual report file
      await Future.delayed(const Duration(seconds: 1));
      // Get.snackbar('Download Started', '${generatedReportTitle.value} is downloading.',
      //     backgroundColor: const Color(0xFF15151F), colorText: Colors.white, snackPosition: SnackPosition.BOTTOM);
    } finally {
      isDownloading.value = false;
    }
  }

  void onEmailReport() {
    // TODO: open an email composer / send via API
  }

  void onShareReport() {
    // TODO: integrate share_plus to share the generated file
  }

  void onViewAllReports() => Get.toNamed('/reports');

  void onDownloadRecentReport(RecentReport report) {
    // TODO: download this specific report file
  }

  void onRecentReportOptionsTap(RecentReport report) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.download_outlined, color: Colors.white70),
              title: const Text('Download', style: TextStyle(color: Colors.white)),
              onTap: () {
                Get.back();
                onDownloadRecentReport(report);
              },
            ),
            ListTile(
              leading: const Icon(Icons.share_outlined, color: Colors.white70),
              title: const Text('Share', style: TextStyle(color: Colors.white)),
              onTap: Get.back,
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Color(0xFFFF4D4D)),
              title: const Text('Delete', style: TextStyle(color: Color(0xFFFF4D4D))),
              onTap: () {
                Get.back();
                recentReports.removeWhere((r) => r.id == report.id);
              },
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Mock data ----------------
  List<RecentReport> _mockRecentReports() {
    return [
      RecentReport(id: 'r1', title: 'Revenue Report \u2013 Aug 2026', dateText: '01 Sep 2026', format: ReportFormat.xlsx, fileSizeText: '28 KB'),
      RecentReport(id: 'r2', title: 'Revenue Report \u2013 Jul 2026', dateText: '01 Aug 2026', format: ReportFormat.pdf, fileSizeText: '32 KB'),
    ];
  }
}
