import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/controller/revenue_reporting_controller.dart' show RevenueReportingController;
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/model/report_models.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'revenue_reporting_view.dart' show RevenueReportingView;

class ReportGeneratedView extends GetView<RevenueReportingController> {
  const ReportGeneratedView({super.key});

  static const Color kBg = RevenueReportingView.kBg;
  static const Color kCardBg = RevenueReportingView.kCardBg;
  static const Color kFieldBg = RevenueReportingView.kFieldBg;
  static const Color kPurple = RevenueReportingView.kPurple;
  static const Color kIndigo = RevenueReportingView.kIndigo;
  static const Color kBorder = RevenueReportingView.kBorder;
  static const Color kGreen = RevenueReportingView.kGreen;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          children: [
            _buildHeader(),
            const SizedBox(height: 18),
            _buildSuccessCard(),
            const SizedBox(height: 16),
            _buildReportSummaryCard(),
            const SizedBox(height: 16),
            _buildReportDetailsCard(),
            const SizedBox(height: 16),
            _buildActionButtons(),
            const SizedBox(height: 20),
            _buildRecentReportsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(onTap: controller.onBackPressed, child: const Icon(Icons.arrow_back, color: Colors.white)),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Report Generated', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Your revenue report is ready', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onNotificationTap,
          child: Obx(
            () => Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 22),
                if (controller.notificationCount.value > 0)
                  Positioned(right: -1, top: -1, child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle))),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Success card with badge + file chip ----------------
  Widget _buildSuccessCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Column(
        children: [
          _buildSuccessBadge(),
          const SizedBox(height: 14),
          const Text('Report Generated Successfully!', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          const Text(
            'Your revenue report has been generated and is ready to download.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54, fontSize: 11.5),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: kFieldBg, borderRadius: BorderRadius.circular(10)),
            child: Row(
              children: [
                Obx(
                  () => Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: controller.generatedFormat.value.color.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
                    child: Text(controller.generatedFormat.value.label, style: TextStyle(color: controller.generatedFormat.value.color, fontSize: 9, fontWeight: FontWeight.w800)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Obx(() => Text(controller.generatedReportTitle.value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))),
                      const SizedBox(height: 2),
                      Obx(() => Text(controller.generatedPeriodText.value, style: const TextStyle(color: Colors.white38, fontSize: 10))),
                    ],
                  ),
                ),
                Obx(
                  () => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: kGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                    child: Text('${controller.generatedFormat.value.label} \u2022 ${controller.generatedFileSize.value}', style: const TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 100,
      height: 100,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(shape: BoxShape.circle, color: kGreen.withOpacity(0.15), border: Border.all(color: kGreen, width: 2)),
            child: const Icon(Icons.check, color: kGreen, size: 30),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDots() {
    const positions = [Alignment(-0.8, -0.6), Alignment(0.85, -0.5), Alignment(-0.9, 0.3), Alignment(0.8, 0.7)];
    return positions
        .map((a) => Align(alignment: a, child: Container(width: 5, height: 5, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle))))
        .toList();
  }

  // ---------------- Report Summary (same 4 stats) ----------------
  Widget _buildReportSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Report Summary', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          Obx(
            () => Row(
              children: [
                Expanded(child: _MiniStat(icon: Icons.account_balance_wallet_outlined, color: kPurple, value: controller.totalRevenue.value, label: 'Total Revenue')),
                Expanded(child: _MiniStat(icon: Icons.description_outlined, color: const Color(0xFF3F7BF5), value: '${controller.totalInvoices.value}', label: 'Total Invoices')),
                Expanded(child: _MiniStat(icon: Icons.check_circle_outline, color: kGreen, value: '${controller.paidInvoices.value}', label: 'Paid Invoices')),
                Expanded(child: _MiniStat(icon: Icons.access_time, color: const Color(0xFFFFA726), value: '${controller.pendingInvoices.value}', label: 'Pending Invoices')),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Report Details ----------------
  Widget _buildReportDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Obx(
        () => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Report Details', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            _detailRow('Report Period', controller.generatedPeriodText.value),
            _detailRow('Generated On', controller.generatedOnText),
            _detailRow('Generated By', controller.generatedByLabel.value),
            _detailRow('Report Format', controller.generatedFormat.value.fullLabel),
            _detailRow('File Size', controller.generatedFileSize.value, isLast: true),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  // ---------------- Action buttons ----------------
  Widget _buildActionButtons() {
    return Column(
      children: [
        Obx(
          () => GestureDetector(
            onTap: controller.isDownloading.value ? null : controller.onDownloadGeneratedReport,
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: controller.isDownloading.value
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4))
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.download_outlined, color: Colors.white, size: 17),
                        SizedBox(width: 8),
                        Text('Download Report', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      ],
                    ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: controller.onEmailReport,
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: kPurple.withOpacity(0.5))),
                  alignment: Alignment.center,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.mail_outline, color: kPurple, size: 15),
                      SizedBox(width: 6),
                      Text('Email Report', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: controller.onShareReport,
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: kPurple.withOpacity(0.5))),
                  alignment: Alignment.center,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.ios_share_outlined, color: kPurple, size: 14),
                      SizedBox(width: 6),
                      Text('Share Report', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------- Recent Reports (same list) ----------------
  Widget _buildRecentReportsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Recent Reports', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
            GestureDetector(
              onTap: controller.onViewAllReports,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('View All', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
                  Icon(Icons.chevron_right, color: kPurple, size: 15),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Obx(
          () => Column(
            children: controller.recentReports
                .map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(color: r.format.color.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
                            alignment: Alignment.center,
                            child: Text(r.format.label, style: TextStyle(color: r.format.color, fontSize: 8.5, fontWeight: FontWeight.w800)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(r.title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 2),
                                Text('${r.dateText}  \u2022  ${r.fileSizeText}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: () => controller.onDownloadRecentReport(r),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: kGreen.withOpacity(0.15), shape: BoxShape.circle),
                              child: const Icon(Icons.download_outlined, color: kGreen, size: 16),
                            ),
                          ),
                          const SizedBox(width: 6),
                          GestureDetector(onTap: () => controller.onRecentReportOptionsTap(r), child: const Icon(Icons.more_vert, color: Colors.white38, size: 18)),
                        ],
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      ],
    );
  }
}

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String value;
  final String label;

  const _MiniStat({required this.icon, required this.color, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 17),
        ),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
        const SizedBox(height: 2),
        Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white38, fontSize: 8.5)),
      ],
    );
  }
}
