import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/controller/revenue_reporting_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/revenue_reporting/model/report_models.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class RevenueReportingView extends GetView<RevenueReportingController> {
  const RevenueReportingView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.recentReports.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildReportPeriodCard(context),
                      const SizedBox(height: 16),
                      _buildRevenueSummaryCard(),
                      const SizedBox(height: 16),
                      _buildReportFiltersCard(),
                      const SizedBox(height: 16),
                      _buildGenerateReportButton(),
                      const SizedBox(height: 20),
                      _buildRecentReportsSection(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        // GestureDetector(
        //   onTap: controller.onMenuTap,
        //   child: const Icon(Icons.menu, color: kPurple),
        // ),
        // const SizedBox(width: 12),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Revenue Reporting',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Generate and export revenue reports',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onNotificationTap,
          child: Obx(
            () => Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(
                  Icons.notifications_none_rounded,
                  color: Colors.white70,
                  size: 22,
                ),
                if (controller.notificationCount.value > 0)
                  Positioned(
                    right: -1,
                    top: -1,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: kPurple,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _cardWrapper({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  // ---------------- Report Period ----------------
  Widget _buildReportPeriodCard(BuildContext context) {
    return _cardWrapper(
      title: 'Report Period',
      child: GestureDetector(
        onTap: () => controller.onPickReportPeriod(context),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                color: kPurple,
                size: 15,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Obx(
                  () => Text(
                    controller.reportPeriodText,
                    style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  ),
                ),
              ),
              const Icon(
                Icons.keyboard_arrow_down,
                color: Colors.white38,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- Revenue Summary ----------------
  Widget _buildRevenueSummaryCard() {
    return _cardWrapper(
      title: 'Revenue Summary',
      child: Obx(
        () => Row(
          children: [
            Expanded(
              child: _SummaryStat(
                icon: Icons.account_balance_wallet_outlined,
                color: kPurple,
                value: controller.totalRevenue.value,
                label: 'Total Revenue',
              ),
            ),
            Expanded(
              child: _SummaryStat(
                icon: Icons.description_outlined,
                color: kBlue,
                value: '${controller.totalInvoices.value}',
                label: 'Total Invoices',
              ),
            ),
            Expanded(
              child: _SummaryStat(
                icon: Icons.check_circle_outline,
                color: kGreen,
                value: '${controller.paidInvoices.value}',
                label: 'Paid Invoices',
              ),
            ),
            Expanded(
              child: _SummaryStat(
                icon: Icons.access_time,
                color: kOrange,
                value: '${controller.pendingInvoices.value}',
                label: 'Pending Invoices',
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Report Filters ----------------
  Widget _buildReportFiltersCard() {
    return _cardWrapper(
      title: 'Report Filters',
      child: Column(
        children: [
          Obx(
            () => _FilterDropdown(
              icon: Icons.people_outline,
              value: controller.selectedCustomer.value,
              items: controller.customerOptions,
              onChanged: controller.setCustomer,
            ),
          ),
          const SizedBox(height: 10),
          Obx(
            () => _FilterDropdown(
              icon: Icons.description_outlined,
              value: controller.selectedInvoiceStatus.value,
              items: controller.invoiceStatusOptions,
              onChanged: controller.setInvoiceStatus,
            ),
          ),
          const SizedBox(height: 10),
          Obx(
            () => _FilterDropdown(
              icon: Icons.description_outlined,
              value: controller.selectedGst.value,
              items: controller.gstOptions,
              onChanged: controller.setGst,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Generate Report button ----------------
  Widget _buildGenerateReportButton() {
    return Obx(
      () => GestureDetector(
        onTap: controller.isGenerating.value
            ? null
            : controller.onGenerateReport,
        child: Container(
          width: double.infinity,
          height: 50,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: controller.isGenerating.value
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2.4,
                  ),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.description_outlined,
                      color: Colors.white,
                      size: 17,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Generate Report',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  // ---------------- Recent Reports ----------------
  Widget _buildRecentReportsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recent Reports',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            GestureDetector(
              onTap: controller.onViewAllReports,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'View All',
                    style: TextStyle(
                      color: kPurple,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
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
                    child: _RecentReportCard(
                      report: r,
                      onDownload: () => controller.onDownloadRecentReport(r),
                      onMoreTap: () => controller.onRecentReportOptionsTap(r),
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

const Color kOrange = Color(0xFFFFA726);
const Color kBlue = Color(0xFF3F7BF5);

// =====================================================================
// Revenue summary stat
// =====================================================================
class _SummaryStat extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String value;
  final String label;

  const _SummaryStat({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 17),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white38, fontSize: 8.5),
        ),
      ],
    );
  }
}

// =====================================================================
// Filter dropdown row
// =====================================================================
class _FilterDropdown extends StatelessWidget {
  final IconData icon;
  final String value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _FilterDropdown({
    required this.icon,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  static const Color kFieldBg = RevenueReportingView.kFieldBg;
  static const Color kPurple = RevenueReportingView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        children: [
          Icon(icon, color: kPurple, size: 15),
          const SizedBox(width: 8),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                isExpanded: true,
                dropdownColor: kFieldBg,
                icon: const Icon(
                  Icons.keyboard_arrow_down,
                  color: Colors.white38,
                  size: 18,
                ),
                style: const TextStyle(color: Colors.white, fontSize: 12.5),
                items: items
                    .map(
                      (i) => DropdownMenuItem(
                        value: i,
                        child: Text(i, overflow: TextOverflow.ellipsis),
                      ),
                    )
                    .toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Recent report card
// =====================================================================
class _RecentReportCard extends StatelessWidget {
  final RecentReport report;
  final VoidCallback onDownload;
  final VoidCallback onMoreTap;

  const _RecentReportCard({
    required this.report,
    required this.onDownload,
    required this.onMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: RevenueReportingView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: RevenueReportingView.kBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: report.format.color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(9),
            ),
            alignment: Alignment.center,
            child: Text(
              report.format.label,
              style: TextStyle(
                color: report.format.color,
                fontSize: 8.5,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${report.dateText}  \u2022  ${report.format.label}  \u2022  ${report.fileSizeText}',
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: onDownload,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: RevenueReportingView.kGreen.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.download_outlined,
                color: RevenueReportingView.kGreen,
                size: 16,
              ),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onMoreTap,
            child: const Icon(Icons.more_vert, color: Colors.white38, size: 18),
          ),
        ],
      ),
    );
  }
}
