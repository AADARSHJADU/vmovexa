import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../../../../widgets/custom_button.dart';
import '../controller/revenue_reporting_controller.dart';
import '../model/report_models.dart';

class RevenueReportingView extends GetView<RevenueReportingController> {
  const RevenueReportingView({super.key});

  static const Color kBg = Color(0xFF0D0D15);
  static const Color kCardBg = Color(0xFF151522);
  static const Color kBorderColor = Color(0xFF232336);
  static const Color kInputBg = Color(0xFF1B1B2C);

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.archiveReports.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
            );
          }

          return Column(
            children: [
              _buildTopHeader(),
              Expanded(
                child: RefreshIndicator(
                  color: const Color(0xFF3B82F6),
                  backgroundColor: const Color(0xFF1B1B28),
                  onRefresh: controller.onRefresh,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildReportingPeriodCard(context),
                        const SizedBox(height: 16),
                        _build4LiveKpiCards(currencyFormatter),
                        const SizedBox(height: 16),
                        _buildReportTypeSelectorCard(),
                        const SizedBox(height: 20),
                        _buildArchiveSection(),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildTopHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF13131F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F1F30), width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Financial Reports',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Audited statements for campaigns, SaaS & GST',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: controller.onRefresh,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'Refresh',
          ),
          const SizedBox(width: 6),
          TextButton(
            onPressed: () => Get.toNamed(Routes.GST_MANAGEMENT),
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text(
              'GST Portal →',
              style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 1: REPORTING PERIOD & PRESETS
  // ==========================================
  Widget _buildReportingPeriodCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.calendar_month_rounded, color: Color(0xFF60A5FA), size: 16),
              ),
              const SizedBox(width: 8),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'REPORTING PERIOD',
                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                  ),
                  Text(
                    'Select date range for auditing & statements',
                    style: TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          // From & To Date selectors
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => controller.pickCustomDateRange(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('FROM DATE', style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Obx(() => Text(
                              controller.startDate.value,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                            )),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InkWell(
                  onTap: () => controller.pickCustomDateRange(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF28283E)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TO DATE', style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Obx(() => Text(
                              controller.endDate.value,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                            )),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 4 Quick Presets matching Admin Panel
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildPresetChip('This Month', 'this_month'),
              _buildPresetChip('Last 30 Days', 'last_30'),
              _buildPresetChip('This Quarter', 'this_quarter'),
              _buildPresetChip('This Year', 'this_year'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label, String id) {
    return Obx(() {
      final isSelected = controller.activePreset.value == id;
      return InkWell(
        onTap: () => controller.applyPreset(id),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : const Color(0xFF1C1C2D),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? Colors.transparent : const Color(0xFF28283E),
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white70,
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      );
    });
  }

  // ==========================================
  // SECTION 2: 4 LIVE KPI CARDS
  // ==========================================
  Widget _build4LiveKpiCards(NumberFormat currencyFormatter) {
    return Obx(() {
      final isLoading = controller.summaryLoading.value;

      return GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 1.35,
        children: [
          _buildKpiCard(
            icon: Icons.people_outline_rounded,
            iconColor: const Color(0xFF818CF8),
            bgColor: const Color(0xFF312E81).withOpacity(0.3),
            label: 'ACTIVE SUBSCRIPTIONS',
            value: isLoading ? '...' : controller.activeSubs.value.toString(),
            sub: '${currencyFormatter.format(controller.subRevenue.value)} SaaS',
          ),
          _buildKpiCard(
            icon: Icons.campaign_rounded,
            iconColor: const Color(0xFF60A5FA),
            bgColor: const Color(0xFF1E3A8A).withOpacity(0.3),
            label: 'CAMPAIGNS',
            value: isLoading ? '...' : controller.activeCampaigns.value.toString(),
            sub: '${currencyFormatter.format(controller.campaignRevenue.value)} ads',
          ),
          _buildKpiCard(
            icon: Icons.payments_rounded,
            iconColor: const Color(0xFF34D399),
            bgColor: const Color(0xFF064E3B).withOpacity(0.3),
            label: 'TOTAL REVENUE',
            value: isLoading ? '...' : currencyFormatter.format(controller.totalRevenue.value),
            sub: 'Paid invoices collected',
            isMoney: true,
          ),
          _buildKpiCard(
            icon: Icons.receipt_long_rounded,
            iconColor: const Color(0xFFFBBF24),
            bgColor: const Color(0xFF78350F).withOpacity(0.3),
            label: 'TOTAL TAX (GST)',
            value: isLoading ? '...' : currencyFormatter.format(controller.taxTotal.value),
            sub: 'CGST + SGST total',
            isMoney: true,
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String label,
    required String value,
    required String sub,
    bool isMoney = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: iconColor, size: 14),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              color: Colors.white,
              fontSize: isMoney ? 16 : 18,
              fontWeight: FontWeight.w900,
              fontFamily: isMoney ? 'monospace' : null,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            sub,
            style: const TextStyle(color: Colors.white54, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 3: SELECT REPORT TYPE & GENERATE
  // ==========================================
  Widget _buildReportTypeSelectorCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SELECT REPORT TYPE',
            style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
          ),
          const SizedBox(height: 2),
          Obx(() => Text(
                'Choose statement for ${controller.startDate.value} → ${controller.endDate.value}',
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              )),
          const SizedBox(height: 14),
          // 4 Category Cards
          ...controller.reportTypes.map((rt) {
            return Obx(() {
              final isSelected = controller.selectedReportType.value == rt.id;
              return GestureDetector(
                onTap: () => controller.selectedReportType.value = rt.id,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? rt.bgColor.withOpacity(0.3) : const Color(0xFF181827),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? rt.color : const Color(0xFF28283E),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: rt.color.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(rt.icon, color: rt.color, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              rt.label,
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white70,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              rt.desc,
                              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      if (isSelected)
                        Icon(Icons.check_circle_rounded, color: rt.color, size: 18)
                      else
                        const Icon(Icons.circle_outlined, color: Colors.white24, size: 18),
                    ],
                  ),
                ),
              );
            });
          }),
          const SizedBox(height: 14),
          // Generate Button CTA
          Obx(
                () => CustomButton(
              text: controller.isGenerating.value
                  ? 'Generating Report...'
                  : 'Generate & Download Report',
              onTap: controller.isGenerating.value
                  ? () {}
                  : () => controller.onGenerateReport(),
            ),
          ),
          // Obx(() => SizedBox(
          //       width: double.infinity,
          //       child: ElevatedButton.icon(
          //         onPressed: controller.isGenerating.value ? null : () => controller.onGenerateReport(),
          //         icon: controller.isGenerating.value
          //             ? const SizedBox(
          //                 width: 16,
          //                 height: 16,
          //                 child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
          //               )
          //             : const Icon(Icons.description_rounded, size: 18, color: Colors.white),
          //         label: Text(
          //           controller.isGenerating.value ? 'Generating Report...' : 'Generate & Download Report',
          //           style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          //         ),
          //         style: ElevatedButton.styleFrom(
          //           backgroundColor: const Color(0xFF3B82F6),
          //           padding: const EdgeInsets.symmetric(vertical: 14),
          //           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          //           elevation: 0,
          //         ),
          //       ),
          //     )),
        ],
      ),
    );
  }

  // ==========================================
  // SECTION 4: GENERATED REPORTS ARCHIVE
  // ==========================================
  Widget _buildArchiveSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'GENERATED REPORTS ARCHIVE',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                  ),
                  Text(
                    'Historical statements ready for CSV download',
                    style: TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                ],
              ),
              Obx(() => Text(
                    '${controller.filteredReports.length} items',
                    style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                  )),
            ],
          ),
          const SizedBox(height: 12),
          // Search Archive input
          TextField(
            controller: controller.searchController,
            onChanged: (val) => controller.archiveSearch.value = val,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Search archive by title, ID or period...',
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
              filled: true,
              fillColor: kInputBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 14),
          // Archive List
          Obx(() {
            final list = controller.filteredReports;
            if (list.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 30),
                alignment: Alignment.center,
                child: const Text('No matching reports found in archive', style: TextStyle(color: Colors.white38, fontSize: 12)),
              );
            }

            return Column(
              children: list.map((rep) => _buildArchiveReportTile(rep)).toList(),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildArchiveReportTile(RecentReport rep) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF26263B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.description_rounded, color: Color(0xFF60A5FA), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rep.title,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A).withOpacity(0.4),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            rep.id,
                            style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          rep.fileSizeText,
                          style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                        ),
                        const SizedBox(width: 6),
                        const Text('•', style: TextStyle(color: Colors.white24, fontSize: 10)),
                        const SizedBox(width: 6),
                        Text(
                          rep.dateText,
                          style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF131320),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                const Text('Period: ', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
                Text(rep.period, style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Action Buttons: CSV Download & Delete
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () => controller.downloadReportCsv(rep),
                icon: const Icon(Icons.download_rounded, size: 14, color: Color(0xFF60A5FA)),
                label: const Text('CSV Download', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold)),
                style: TextButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () => controller.confirmDeleteReport(rep),
                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF7F1D1D).withOpacity(0.2),
                  padding: const EdgeInsets.all(6),
                  minimumSize: const Size(28, 28),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                tooltip: 'Delete report',
              ),
            ],
          ),
        ],
      ),
    );
  }
}
