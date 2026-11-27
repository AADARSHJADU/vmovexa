import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/campaign_analytics_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class CampaignAnalyticsView extends GetView<CampaignAnalyticsController> {
  const CampaignAnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'analytics_and_heatmaps'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Obx(() => IconButton(
                        icon: controller.refreshing.value
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFF8B5CF6),
                                ),
                              )
                            : const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
                        onPressed: controller.refreshing.value ? null : () => controller.handleRefresh(),
                        tooltip: 'refresh_analytics_tooltip'.tr,
                      )),
                ],
              ),
            ),

            // Main Content Area
            Expanded(
              child: CampaignAnalyticsContent(controller: controller),
            ),
          ],
        ),
      ),
    );
  }
}

/// Unified reusable Analytics content widget used both in standalone page & Bottom Nav Tab
class CampaignAnalyticsContent extends StatelessWidget {
  final CampaignAnalyticsController controller;

  const CampaignAnalyticsContent({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value && controller.analyticsData.isEmpty) {
        return const Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        );
      }

      return RefreshIndicator(
        onRefresh: controller.handleRefresh,
        color: const Color(0xFF8B5CF6),
        backgroundColor: const Color(0xFF1E293B),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Page Subtitle & Action Row
              _buildTopActionHeader(),
              const SizedBox(height: 14),

              // Campaign Selector Dropdown Card
              _buildCampaignSelectorCard(),
              const SizedBox(height: 16),

              // Exactly 4 KPI Performance Cards (2x2 Grid)
              _buildKpiMetricsGrid(),
              const SizedBox(height: 20),

              // The 3 Tabs Navigation
              _buildTabsNavigation(),
              const SizedBox(height: 16),

              // Active Tab Content
              Obx(() {
                switch (controller.activeTab.value) {
                  case 'routes':
                    return _buildRoutesTab();
                  case 'qr':
                    return _buildQrAttributionTab();
                  case 'overview':
                  default:
                    return _buildPerformanceOverviewTab();
                }
              }),

              const SizedBox(height: 32),
            ],
          ),
        ),
      );
    });
  }

  // ==========================================================
  // TOP ACTION HEADER & EXPORT CSV BUTTON (PRIMARY GRADIENT)
  // ==========================================================
  Widget _buildTopActionHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'analytics_hero_desc'.tr,
          style: const TextStyle(
            color: Colors.white60,
            fontSize: 11.5,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            // Export CSV Button with AppTheme.primaryGradient
            Expanded(
              child: GestureDetector(
                onTap: controller.isExporting.value ? null : () => controller.handleExportCsv(),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 11),
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
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      controller.isExporting.value
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.description_outlined, color: Colors.white, size: 16),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          controller.isExporting.value ? 'exporting_text'.tr : 'export_csv_report'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            // Refresh Button
            GestureDetector(
              onTap: controller.refreshing.value ? null : () => controller.handleRefresh(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    controller.refreshing.value
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white70),
                          )
                        : const Icon(Icons.sync_rounded, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      'refresh_tooltip'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ==========================================================
  // CAMPAIGN SELECTOR CARD (DROPDOWN + DETAILS LINK)
  // ==========================================================
  Widget _buildCampaignSelectorCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /*Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.track_changes_rounded, color: Color(0xFF38BDF8), size: 16),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'active_filter_hdr'.tr,
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'select_campaign'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  '${controller.campaigns.length} ${'campaigns_available_count'.tr}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),*/
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFF38BDF8)
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      child: const Icon(
                        Icons.track_changes_rounded,
                        color: Color(0xFF38BDF8),
                        size: 16,
                      ),
                    ),

                    const SizedBox(width: 10),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'active_filter_hdr'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),

                          Text(
                            'select_campaign'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.cardBorder,
                    ),
                  ),
                  child: Text(
                    '${controller.campaigns.length} ${'campaigns_available_count'.tr}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Custom Dropdown Picker
          GestureDetector(
            onTap: () => _openCampaignPickerSheet(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      controller.isOverview
                          ? 'all_campaigns_overview'.tr
                          : '${controller.currentCampaign?.title ?? controller.title} [${controller.code}]',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54, size: 20),
                ],
              ),
            ),
          ),

          // View Details Action Link if single campaign selected
          if (!controller.isOverview && controller.currentCampaign != null) ...[
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () {
                Get.toNamed(
                  Routes.CAMPAIGN_DETAILS,
                  arguments: {'campaign': controller.currentCampaign},
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'view_campaign_details'.tr,
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.open_in_new_rounded, color: Color(0xFF38BDF8), size: 14),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _openCampaignPickerSheet() {
    Get.bottomSheet(
      Container(
        constraints: BoxConstraints(maxHeight: Get.height * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'select_campaign_analytics'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // All Campaigns option
                    _buildPickerItem(
                      title: 'all_campaigns_overview'.tr,
                      subtitle: 'aggregated_analytics'.tr,
                      code: 'ALL-CAMPAIGNS',
                      isSelected: controller.selectedCampaignId.value == 'all',
                      onTap: () {
                        controller.handleCampaignChange('all');
                        Get.back();
                      },
                    ),
                    const Divider(color: AppColors.cardBorder, height: 16),
                    ...controller.campaigns.map((c) {
                      final isSelected = controller.selectedCampaignId.value == c.id ||
                          controller.selectedCampaignId.value == c.code;
                      final cTitle = (c.title != null && c.title!.isNotEmpty)
                          ? c.title!
                          : ((c.name != null && c.name!.isNotEmpty) ? c.name! : 'Untitled Campaign');
                      final cCode = (c.code != null && c.code!.isNotEmpty) ? c.code! : '#${c.id}';
                      return _buildPickerItem(
                        title: cTitle,
                        subtitle: '${'status_label'.tr}: ${c.status.toUpperCase()} • ${'budget_label'.tr}: ${c.budget}',
                        code: cCode,
                        isSelected: isSelected,
                        onTap: () {
                          controller.handleCampaignChange(c.id);
                          Get.back();
                        },
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildPickerItem({
    required String title,
    required String subtitle,
    required String code,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF8B5CF6) : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? const Color(0xFFC084FC) : Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Text(
                code,
                style: const TextStyle(
                  color: Color(0xFF38BDF8),
                  fontFamily: 'monospace',
                  fontSize: 9.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // EXACTLY 4 TOP KPI PERFORMANCE CARDS (2x2 GRID MATCHING ADMIN PANEL)
  // ==========================================================
  Widget _buildKpiMetricsGrid() {
    final kpis = [
      {
        'label': 'impressions_delivered'.tr,
        'value': controller.impressions.toString(),
        'sub': 'audited_dooh_displays'.tr,
        'accent': [const Color(0xFF3B82F6), const Color(0xFF6366F1)],
        'icon': Icons.visibility_rounded,
        'badge': null,
      },
      {
        'label': 'screen_playbacks'.tr,
        'value': controller.playbacks.toString(),
        'sub': 'gps_verified_slots'.tr,
        'accent': [const Color(0xFF6366F1), const Color(0xFFA855F7)],
        'icon': Icons.tv_rounded,
        'badge': null,
      },
      {
        'label': 'smart_qr_leads'.tr,
        'value': controller.scans.toString(),
        'sub': 'CTR: ${controller.ctr}% ${'scan_rate_text'.tr}',
        'accent': [const Color(0xFF10B981), const Color(0xFF14B8A6)],
        'icon': Icons.smartphone_rounded,
        'badge': null,
      },
      {
        'label': 'total_campaign_amount'.tr,
        'value': '₹${controller.budget.toStringAsFixed(0)}',
        'sub': '${controller.budgetUtilization}% ${'budget_utilized_text'.tr}',
        'accent': [const Color(0xFFF59E0B), const Color(0xFFEA580C)],
        'icon': Icons.currency_rupee_rounded,
        'badge': controller.status.toUpperCase(),
      },
    ];

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildKpiCard(kpis[0])),
            const SizedBox(width: 10),
            Expanded(child: _buildKpiCard(kpis[1])),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _buildKpiCard(kpis[2])),
            const SizedBox(width: 10),
            Expanded(child: _buildKpiCard(kpis[3])),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiCard(Map<String, dynamic> item) {
    final colors = item['accent'] as List<Color>;
    final badge = item['badge'] as String?;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.1),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Accent Line
            Container(
              height: 3.5,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: colors),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item['label'] as String,
                          style: const TextStyle(
                            color: Colors.white54,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(item['icon'] as IconData, color: colors.first, size: 16),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item['value'] as String,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.only(top: 8),
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: AppColors.cardBorder)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item['sub'] as String,
                            style: const TextStyle(color: Colors.white54, fontSize: 9.5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (badge != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: badge == 'LIVE' || badge == 'ACTIVE' || badge == 'सक्रिय'
                                  ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                  : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: badge == 'LIVE' || badge == 'ACTIVE' || badge == 'सक्रिय'
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              badge,
                              style: TextStyle(
                                color: badge == 'LIVE' || badge == 'ACTIVE' || badge == 'सक्रिय'
                                    ? const Color(0xFF34D399)
                                    : const Color(0xFFFBBF24),
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // THE 3 TABS NAVIGATION (USING AppTheme.primaryGradient)
  // ==========================================================
  Widget _buildTabsNavigation() {
    final tabs = [
      {'id': 'overview', 'label': 'performance_trend_and_charts'.tr, 'icon': Icons.bar_chart_rounded},
      {'id': 'routes', 'label': 'transit_route_and_display_nodes'.tr, 'icon': Icons.directions_bus_rounded},
      {'id': 'qr', 'label': 'smart_qr_attribution'.tr, 'icon': Icons.qr_code_2_rounded},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: tabs.map((t) {
          final isSelected = controller.activeTab.value == t['id'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => controller.setActiveTab(t['id'] as String),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: isSelected ? null : Border.all(color: AppColors.cardBorder),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  children: [
                    Icon(
                      t['icon'] as IconData,
                      color: isSelected ? Colors.white : Colors.white70,
                      size: 15,
                    ),
                    const SizedBox(width: 7),
                    Text(
                      t['label'] as String,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ==========================================================
  // TAB 1: PERFORMANCE TREND & CHARTS (OVERVIEW)
  // ==========================================================
  Widget _buildPerformanceOverviewTab() {
    final telemetry = controller.dailyTelemetry;
    final paginated = controller.paginatedTelemetry;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Period Filter Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'telemetry_proof_play_hdr'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'daily_verified_impression_sub'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                    ),
                  ],
                ),
              ),
              // Period Filter Pills with primaryGradient on active
              Row(
                children: [
                  _buildPeriodPill('7d', 'days_7_label'.tr),
                  const SizedBox(width: 4),
                  _buildPeriodPill('30d', 'days_30_label'.tr),
                  const SizedBox(width: 4),
                  _buildPeriodPill('all', 'all'.tr),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (telemetry.isEmpty)
            _buildEmptyState(
              icon: Icons.bar_chart_rounded,
              title: 'no_telemetry_recorded_yet'.tr,
              sub: 'recorded_analytics_rows_will_appear_here_whe'.tr,
            )
          else ...[
            // Daily Telemetry Bar Visual
            _buildDailyBarVisual(telemetry),
            const SizedBox(height: 16),

            // Table of logs
            const Divider(color: AppColors.cardBorder),
            const SizedBox(height: 8),
            _buildTelemetryTable(paginated),

            // Pagination Controls
            const SizedBox(height: 14),
            _buildPaginationControls(
              currentPage: controller.telemetryPage.value,
              totalPages: controller.totalTelemetryPages,
              onPrev: controller.telemetryPage.value > 1
                  ? () => controller.telemetryPage.value--
                  : null,
              onNext: controller.telemetryPage.value < controller.totalTelemetryPages
                  ? () => controller.telemetryPage.value++
                  : null,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPeriodPill(String periodKey, String label) {
    final isSelected = controller.period.value == periodKey;
    return GestureDetector(
      onTap: () => controller.setPeriod(periodKey),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(8),
          border: isSelected ? null : Border.all(color: AppColors.cardBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white60,
            fontSize: 9.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildDailyBarVisual(List<Map<String, dynamic>> data) {
    final maxImp = data.map((d) => (d['impressions'] as int?) ?? 0).fold(0, (a, b) => a > b ? a : b);
    final safeMax = maxImp > 0 ? maxImp : 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 110,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: data.length,
            itemBuilder: (context, i) {
              final item = data[i];
              final imp = (item['impressions'] as int?) ?? 0;
              final heightPct = (imp / safeMax).clamp(0.08, 1.0);

              return Container(
                width: 44,
                margin: const EdgeInsets.only(right: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      '$imp',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Expanded(
                      child: Align(
                        alignment: Alignment.bottomCenter,
                        child: FractionallySizedBox(
                          heightFactor: heightPct,
                          child: Container(
                            width: 24,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  const Color(0xFF3B82F6),
                                  const Color(0xFF8B5CF6).withValues(alpha: 0.8),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item['date'] as String? ?? '—',
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'daily_audited_impressions_sub'.tr,
          style: const TextStyle(color: Colors.white38, fontSize: 10),
        ),
      ],
    );
  }

  Widget _buildTelemetryTable(List<Map<String, dynamic>> rows) {
    return Column(
      children: [
        // Table Header
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  'date'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'impressions'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'playbacks_col'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  'status_label'.tr,
                  textAlign: TextAlign.end,
                  style: const TextStyle(color: Colors.white54, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),

        // Table Rows
        ...rows.map((r) {
          return Container(
            padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B), width: 0.8)),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    r['date'] as String? ?? '—',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    '${r['impressions'] ?? 0}',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    '${r['playbacks'] ?? 0}',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.circle, color: Color(0xFF10B981), size: 5),
                          const SizedBox(width: 4),
                          Text(
                            'verified_badge'.tr,
                            style: const TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // ==========================================================
  // TAB 2: TRANSIT ROUTE & DISPLAY NODES
  // ==========================================================
  Widget _buildRoutesTab() {
    final routes = controller.targetRoutes;
    final paginated = controller.paginatedRoutes;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'targeted_transit_corridors_hdr'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'transit_corridors_sub'.tr,
                    style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  '${routes.length} ${'corridors_count_label'.tr}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (routes.isEmpty)
            _buildEmptyState(
              icon: Icons.directions_bus_rounded,
              title: 'no_targeted_routes'.tr,
              sub: 'select_a_specific_campaign_to_view_its_targeted_transit_corridors'.tr,
            )
          else ...[
            ...paginated.map((route) {
              final name = route['name']?.toString() ?? 'transit_corridor_fallback'.tr;
              final code = route['code']?.toString() ?? 'RT-NODE';
              final city = route['city']?.toString() ?? 'metro_city_fallback'.tr;
              final screens = route['screens'] ?? 1;
              final vehicles = route['vehicles'] ?? 1;
              final start = route['startPoint']?.toString();
              final end = route['endPoint']?.toString();
              final isLive = controller.status.toLowerCase() == 'live';

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Flexible(
                                child: Text(
                                  name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  code,
                                  style: const TextStyle(
                                    color: Color(0xFF38BDF8),
                                    fontFamily: 'monospace',
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isLive
                                ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                : const Color(0xFF64748B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: isLive ? const Color(0xFF10B981) : const Color(0xFF64748B),
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            isLive ? 'broadcasting_status'.tr : controller.status.toUpperCase(),
                            style: TextStyle(
                              color: isLive ? const Color(0xFF34D399) : Colors.white60,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${'city_text'.tr}: $city${(start != null && end != null) ? ' • ${'from_route_prefix'.tr} $start ➔ $end' : ''}',
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                    ),
                    const SizedBox(height: 10),

                    // Metrics Strip
                    Row(
                      children: [
                        _buildRouteMetricPill('screens_caps'.tr, screens.toString(), Icons.tv_rounded),
                        const SizedBox(width: 8),
                        _buildRouteMetricPill('vehicles_caps'.tr, vehicles.toString(), Icons.directions_bus_rounded),
                      ],
                    ),
                  ],
                ),
              );
            }),

            // Pagination Controls
            const SizedBox(height: 14),
            _buildPaginationControls(
              currentPage: controller.routesPage.value,
              totalPages: controller.totalRoutePages,
              onPrev: controller.routesPage.value > 1
                  ? () => controller.routesPage.value--
                  : null,
              onNext: controller.routesPage.value < controller.totalRoutePages
                  ? () => controller.routesPage.value++
                  : null,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRouteMetricPill(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF38BDF8), size: 14),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold),
              ),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // TAB 3: SMART QR ATTRIBUTION
  // ==========================================================
  Widget _buildQrAttributionTab() {
    final hasQr = controller.hasQrCode;
    final qrCodeStr = hasQr ? controller.analyticsData['qrCode'].toString() : '';
    final redirectUrl = controller.currentCampaign?.qrRedirectUrl ??
        controller.analyticsData['qr_redirect_url']?.toString() ??
        '—';
    final reviews = controller.reviewsData.value;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'smart_qr_attribution_hdr'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'realtime_passenger_scan_sub'.tr,
                      style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                    ),
                  ],
                ),
              ),
              if (hasQr)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    '${controller.scans} ${'conversions_title'.tr}',
                    style: const TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // If QR code is not configured or in Overview mode -> Show Empty State matching Admin Panel
          if (!hasQr)
            _buildEmptyState(
              icon: Icons.qr_code_2_rounded,
              title: 'qr_attribution_is_not_configured'.tr,
              sub: 'no_qr_code_record_is_available_for_the_selec'.tr,
            )
          else ...[
            // Visual QR Frame Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  // Stylized VMOVEXA QR Box
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'VMOVEXA',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 7.5,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Icon(Icons.qr_code_2_rounded, color: Colors.black, size: 54),
                        const SizedBox(height: 2),
                        Text(
                          'scan_to_engage'.tr,
                          style: const TextStyle(
                            color: Colors.black54,
                            fontSize: 6.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),

                  // QR Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'dynamic_qr_attr_hdr'.tr,
                          style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          qrCodeStr,
                          style: const TextStyle(
                            color: Color(0xFF38BDF8),
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),

                        // Stats mini grid
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'passenger_scans_kpi'.tr,
                                      style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      controller.scans.toString(),
                                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'scan_rate_kpi'.tr,
                                      style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${controller.ctr}%',
                                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
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
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Target Redirect URL Box
            Container(
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
                    'target_dest_redirect_url'.tr,
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Text(
                      redirectUrl,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10.5,
                        color: Color(0xFF38BDF8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'every_passenger_scan_desc'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                  ),
                ],
              ),
            ),
          ],

          // Customer Reviews Section: STRICTLY HIDDEN IN OVERVIEW MODE (matching Admin Panel)
          if (!controller.isOverview && reviews != null && reviews.count > 0) ...[
            const SizedBox(height: 18),
            const Divider(color: AppColors.cardBorder),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'customer_reviews_qr_hdr'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${reviews.count} ${'reviews_text'.tr}',
                    style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // 3 Rating Averages
            Row(
              children: [
                Expanded(child: _buildReviewAvgCard('driver_title'.tr, reviews.driverAvg)),
                const SizedBox(width: 8),
                Expanded(child: _buildReviewAvgCard('bus_title'.tr, reviews.busAvg)),
                const SizedBox(width: 8),
                Expanded(child: _buildReviewAvgCard('service_title'.tr, reviews.serviceAvg)),
              ],
            ),
            const SizedBox(height: 10),

            // Individual Review Cards
            ...reviews.reviews.take(5).map((r) {
              return Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${'driver_title'.tr} ${r.driverRating}★ • ${'bus_title'.tr} ${r.busRating}★ • ${'service_title'.tr} ${r.serviceRating}★',
                      style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10.5, fontWeight: FontWeight.bold),
                    ),
                    if (r.comment != null && r.comment!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        r.comment!,
                        style: const TextStyle(color: Colors.white70, fontSize: 10),
                      ),
                    ],
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildReviewAvgCard(String label, double val) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 3),
          Text(
            '★ ${val > 0 ? val.toStringAsFixed(1) : "0"}',
            style: const TextStyle(
              color: Color(0xFFF59E0B),
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SHARED PAGINATION CONTROLS
  // ==========================================================
  Widget _buildPaginationControls({
    required int currentPage,
    required int totalPages,
    required VoidCallback? onPrev,
    required VoidCallback? onNext,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '${'page'.tr} $currentPage ${'of'.tr} $totalPages',
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
        Row(
          children: [
            GestureDetector(
              onTap: onPrev,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: onPrev != null ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  'prev_btn'.tr,
                  style: TextStyle(
                    color: onPrev != null ? Colors.white : Colors.white24,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onNext,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: onNext != null ? AppTheme.primaryGradient : null,
                  color: onNext != null ? null : const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: onNext != null ? null : Border.all(color: AppColors.cardBorder),
                  boxShadow: onNext != null
                      ? [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.25),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  'next'.tr,
                  style: TextStyle(
                    color: onNext != null ? Colors.white : Colors.white24,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ==========================================================
  // REUSABLE EMPTY STATE WIDGET
  // ==========================================================
  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String sub,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Icon(icon, color: Colors.white38, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            sub,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white38, fontSize: 10.5, height: 1.4),
          ),
        ],
      ),
    );
  }
}
