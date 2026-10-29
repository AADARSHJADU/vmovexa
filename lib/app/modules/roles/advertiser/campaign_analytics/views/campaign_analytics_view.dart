import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/campaign_analytics_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';

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
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Campaign Analytics',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                    onPressed: () => controller.fetchAnalytics(),
                    tooltip: 'Refresh Analytics',
                  ),
                ],
              ),
            ),

            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF8B5CF6)));
                }

                final c = controller.campaign.value;

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Campaign Header Card with Live Status & Period Filter
                      _buildCampaignHeaderCard(c),
                      const SizedBox(height: 16),

                      // 4 Primary KPI Cards
                      _buildKpiMetricsGrid(),
                      const SizedBox(height: 20),

                      // 4 Sub-Tabs
                      _buildSubTabs(),
                      const SizedBox(height: 16),

                      // Dynamic Tab Body
                      Obx(() {
                        switch (controller.activeSubTab.value) {
                          case 'routes':
                            return _buildRoutesTab();
                          case 'telemetry':
                            return _buildTelemetryTab();
                          case 'qr':
                            return _buildQrReviewsTab(c);
                          case 'overview':
                          default:
                            return _buildOverviewTab(c);
                        }
                      }),

                      const SizedBox(height: 28),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // HEADER CARD WITH LIVE STATUS & PERIOD FILTER
  // ==========================================================
  Widget _buildCampaignHeaderCard(CampaignModel c) {
    final isLive = c.isLive;

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
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isLive ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isLive ? 'LIVE BROADCASTING' : c.status.toUpperCase(),
                    style: TextStyle(
                      color: isLive ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  c.id.isNotEmpty ? (c.id.startsWith('CMP-') ? c.id : '#${c.id}') : '#CMP',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            c.displayTitle,
            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 3),
          Text(
            c.brandName?.isNotEmpty == true ? c.brandName! : c.displayClient,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
          const SizedBox(height: 14),

          // Period Filter Pills (7d, 30d, all)
          Row(
            children: [
              const Text('Period:', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
              const SizedBox(width: 10),
              _buildPeriodPill('7d', '7 Days'),
              const SizedBox(width: 6),
              _buildPeriodPill('30d', '30 Days'),
              const SizedBox(width: 6),
              _buildPeriodPill('all', 'All Time'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodPill(String periodKey, String label) {
    return Obx(() {
      final isSel = controller.selectedPeriod.value == periodKey;
      return GestureDetector(
        onTap: () => controller.setPeriod(periodKey),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            gradient: isSel ? AppTheme.primaryGradient : null,
            color: isSel ? null : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSel ? Colors.transparent : AppColors.cardBorder),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSel ? Colors.white : AppColors.textSecondary,
              fontSize: 10.5,
              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      );
    });
  }

  // ==========================================================
  // 4 PRIMARY KPI METRICS GRID
  // ==========================================================
  Widget _buildKpiMetricsGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                'Total Impressions',
                '${(controller.totalImpressions / 1000).toStringAsFixed(1)}K',
                Icons.visibility_outlined,
                const Color(0xFF3B82F6),
                '+14.2% vs last week',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                'Screen Plays',
                controller.totalPlaybacks.toString(),
                Icons.play_circle_outline_rounded,
                const Color(0xFF10B981),
                'Verified on Edge',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildKpiCard(
                'QR Scans',
                controller.totalQrScans.toString(),
                Icons.qr_code_2_rounded,
                const Color(0xFFF59E0B),
                '${(controller.totalQrScans * 0.4).round()} Conversions',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildKpiCard(
                'Conversion Rate',
                '${controller.conversionRate}%',
                Icons.trending_up_rounded,
                const Color(0xFF8B5CF6),
                'Above DOOH average',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color, String sub) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, color: color, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(sub, style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  // ==========================================================
  // 4 SUB-TABS (Overview, Routes, Telemetry, QR)
  // ==========================================================
  Widget _buildSubTabs() {
    final tabs = [
      {'key': 'overview', 'label': 'Overview'},
      {'key': 'routes', 'label': 'Routes'},
      {'key': 'telemetry', 'label': 'Telemetry Logs'},
      {'key': 'qr', 'label': 'QR & Reviews'},
    ];

    return SizedBox(
      height: 36,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: tabs.length,
        itemBuilder: (context, idx) {
          final t = tabs[idx];

          return Obx((){
            final isSel = controller.activeSubTab.value == t['key'];
            return GestureDetector(
              onTap: () => controller.setSubTab(t['key']!),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  gradient: isSel ? AppTheme.primaryGradient : null,
                  color: isSel ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: isSel ? Colors.transparent : AppColors.cardBorder),
                ),
                child: Center(
                  child: Text(
                    t['label']!,
                    style: TextStyle(
                      color: isSel ? Colors.white : AppColors.textSecondary,
                      fontSize: 11,
                      fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          });
        },
      ),
    );
  }

  // ==========================================================
  // TAB 1: OVERVIEW (Daily Trend Bar Chart & Metrics)
  // ==========================================================
  Widget _buildOverviewTab(CampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Daily Performance Bar Chart
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Daily Telemetry Trend',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  Row(
                    children: [
                      Icon(Icons.circle, size: 8, color: Color(0xFF8B5CF6)),
                      SizedBox(width: 4),
                      Text('Impressions', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                      SizedBox(width: 10),
                      Icon(Icons.circle, size: 8, color: Color(0xFF10B981)),
                      SizedBox(width: 4),
                      Text('Plays', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Bar Chart Visualization
              SizedBox(
                height: 140,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: controller.dailyTrendSeries.map((item) {
                    final imp = item['impressions'] as int;
                    final plays = item['plays'] as int;
                    final impHeight = (imp / 3000 * 100).clamp(20.0, 100.0);
                    final playsHeight = (plays / 500 * 80).clamp(15.0, 80.0);

                    return Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              width: 12,
                              height: impHeight,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                              ),
                            ),
                            const SizedBox(width: 3),
                            Container(
                              width: 10,
                              height: playsHeight,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(item['day'] as String,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Efficiency Metrics Row
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryCol('Airtime Spend', c.budget),
              _buildSummaryCol('Avg CPM', '₹ 19.8'),
              _buildSummaryCol('Daily Avg Plays', '320 / day'),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // TAB 2: ROUTES BREAKDOWN
  // ==========================================================
  Widget _buildRoutesTab() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Route Performance Breakdown',
              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),

          ...controller.routeMetricsList.map((r) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(r['route'] as String,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Uptime: ${r['uptime']}',
                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('${r['city']} · ${r['screens']} Screens',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Plays: ${r['plays']}',
                          style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10, fontWeight: FontWeight.bold)),
                      Text('Impressions: ${r['impressions']}',
                          style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ==========================================================
  // TAB 3: TELEMETRY PROOF LOGS
  // ==========================================================
  Widget _buildTelemetryTab() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Verified Playback Proofs',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Edge Verified',
                    style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          ...controller.telemetryLogsList.map((log) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${log['screen']} · ${log['bus']}',
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          Text('GPS: ${log['lat']}, ${log['lng']}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                        ],
                      ),
                    ],
                  ),
                  Text(log['time'] as String,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.w600)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ==========================================================
  // TAB 4: QR ATTRIBUTION & CUSTOMER REVIEWS
  // ==========================================================
  Widget _buildQrReviewsTab(CampaignModel c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // QR Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Dynamic QR Attribution',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.qr_code_rounded, color: Colors.black, size: 40),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Code: ${c.promoCode ?? 'VMX-QR-${c.id}'}',
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                        const SizedBox(height: 3),
                        Text('Redirect: ${c.qrRedirectUrl ?? 'https://vmovexa.com/ad/${c.id}'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Verified Feedback
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Verified Viewer Ratings',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  Text('${controller.reviews.length} Ratings',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                ],
              ),
              const SizedBox(height: 12),

              if (controller.reviews.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text('No verified customer feedback submitted yet',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: controller.reviews.length,
                  itemBuilder: (context, idx) {
                    final r = controller.reviews[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r.customerName ?? 'Verified Viewer',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                              if (r.comment != null && r.comment!.isNotEmpty)
                                Text(r.comment!,
                                    style: const TextStyle(color: Colors.white70, fontSize: 10)),
                            ],
                          ),
                          Row(
                            children: List.generate(
                              5,
                              (i) => Icon(
                                i < r.rating ? Icons.star_rounded : Icons.star_border_rounded,
                                size: 12,
                                color: const Color(0xFFF59E0B),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCol(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
      ],
    );
  }
}
