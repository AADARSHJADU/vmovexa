import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../routes/app_routes.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import '../controllers/advertiser_dashboard_controller.dart';
import '../../widgets/advertiser_drawer_widget.dart';

class AdvertiserDashboardView extends GetView<AdvertiserDashboardController> {
  const AdvertiserDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      drawer: const AdvertiserDrawerWidget(),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return _buildHomeTab();
            case 1:
              return _buildCampaignsTab();
            case 2:
              return _buildLifecycleFlowTab();
            case 3:
              return _buildAnalyticsTab();
            case 4:
              return _buildDynamicTab4Body();
            default:
              return _buildHomeTab();
          }
        }),
      ),
      bottomNavigationBar: Obx(() {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.cardBg,
            border: Border(
              top: BorderSide(color: AppColors.cardBorder, width: 1.2),
            ),
          ),
          child: BottomNavigationBar(
            currentIndex: controller.selectedNavIndex.value.clamp(0, 4),
            onTap: controller.changeTab,
            backgroundColor: Colors.transparent,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: const Color(0xFF8B5CF6),
            unselectedItemColor: AppColors.textMuted,
            selectedFontSize: 9.5,
            unselectedFontSize: 9.5,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_rounded, size: 20),
                label: 'Dashboard',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.campaign_rounded, size: 20),
                label: 'Campaigns',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.account_tree_outlined, size: 20),
                label: 'Lifecycle & Flow',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.bar_chart_rounded, size: 20),
                label: 'Analytics',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline_rounded, size: 20),
                label: 'Profile',
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildDynamicTab4Body() {
    String mode = controller.tab4Mode.value;
    if (mode == 'billing') {
      return _buildBillingTab();
    } else if (mode == 'help') {
      return _buildHelpSupportTab();
    } else if (mode == 'reports') {
      return _buildReportsTab();
    } else {
      return _buildSettingsTab();
    }
  }

  // ==========================================
  // HOME / OVERVIEW TAB (Index 0) - Real API
  // ==========================================
  Widget _buildHomeTab() {
    return Column(
      children: [
        // Top App Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                onPressed: controller.openDrawer,
              ),
              Image.asset('assets/app_logo/newLogo.png', width: 140, height: 38),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
                    onPressed: () => Get.toNamed(Routes.NOTIFICATIONS_LIST),
                  ),
                  const SizedBox(width: 4),
                  GestureDetector(
                    onTap: controller.switchToProfile,
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(Icons.person_outline_rounded, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Body with Pull-to-refresh
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => controller.loadDashboardData(isRefresh: true),
            color: const Color(0xFF6366F1),
            backgroundColor: AppColors.cardBg,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 80),
                    child: Center(
                      child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
                    ),
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome & Telemetry Header
                    _buildDashboardHeader(),
                    const SizedBox(height: 20),

                    // 4 Real KPI Cards (from API)
                    _buildKpiGrid(),
                    const SizedBox(height: 24),

                    // 7-Day Performance Bar Chart
                    _buildPerformanceSection(),
                    const SizedBox(height: 24),

                    // Quick Actions
                    _buildQuickActions(),
                    const SizedBox(height: 24),

                    // Recent Campaigns
                    _buildRecentCampaignsHeader(),
                    const SizedBox(height: 12),
                    _buildRecentCampaigns(),
                    const SizedBox(height: 20),
                  ],
                );
              }),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDashboardHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Welcome back,',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${controller.greetingName}!',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Transit display ad campaign telemetry & insights.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                  ),
                ],
              ),
            ),
            // Live MQTT Telemetry Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: controller.isMqttConnected
                      ? const Color(0xFF10B981).withValues(alpha: 0.3)
                      : const Color(0xFFEF4444).withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: controller.isMqttConnected
                          ? const Color(0xFF10B981)
                          : const Color(0xFFEF4444),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${controller.onlineDevicesCount} Online',
                    style: TextStyle(
                      color: controller.isMqttConnected
                          ? const Color(0xFF34D399)
                          : const Color(0xFFF87171),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: '+ Create Campaign',
                isGradient: true,
                height: 42,
                onTap: controller.goToCreateCampaign,
                prefixIcon: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
              ),
            ),
            const SizedBox(width: 10),
            Container(
              height: 42,
              width: 42,
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                onPressed: () => controller.loadDashboardData(isRefresh: true),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKpiGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.32,
      children: [
        _buildKpiCard(
          label: 'Active Campaigns',
          value: '${controller.activeCampaignsCount}',
          sub: '${controller.totalCampaignsCount} total campaigns',
          icon: Icons.campaign_rounded,
          iconColor: const Color(0xFF6366F1),
          bgColor: const Color(0xFF6366F1).withValues(alpha: 0.12),
        ),
        _buildKpiCard(
          label: 'Impressions Delivered',
          value: controller.impressionsDeliveredCount >= 1000
              ? '${(controller.impressionsDeliveredCount / 1000).toStringAsFixed(1)}K'
              : '${controller.impressionsDeliveredCount}',
          sub: '${controller.screenPlaybacksCount} screen playbacks',
          icon: Icons.remove_red_eye_rounded,
          iconColor: const Color(0xFF0EA5E9),
          bgColor: const Color(0xFF0EA5E9).withValues(alpha: 0.12),
        ),
        _buildKpiCard(
          label: 'QR Scan Leads',
          value: '${controller.qrScansCount}',
          sub: 'Passenger engagements',
          icon: Icons.qr_code_scanner_rounded,
          iconColor: const Color(0xFF10B981),
          bgColor: const Color(0xFF10B981).withValues(alpha: 0.12),
        ),
        _buildKpiCard(
          label: 'Budget Spent',
          value: controller.formatMoney(controller.totalSpentAmount),
          sub: 'of ${controller.formatMoney(controller.totalBudgetAmount)} total',
          icon: Icons.currency_rupee_rounded,
          iconColor: const Color(0xFFF59E0B),
          bgColor: const Color(0xFFF59E0B).withValues(alpha: 0.12),
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String label,
    required String value,
    required String sub,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.4,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 16),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                sub,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 9,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceSection() {
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
                children: const [
                  Text(
                    'Campaign Performance',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Last 7 Days verified telemetry',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => controller.changeTab(3),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('View Analytics ›', style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (controller.perfSeries.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Column(
                  children: const [
                    Icon(Icons.bar_chart_rounded, color: AppColors.textMuted, size: 36),
                    SizedBox(height: 8),
                    Text(
                      'No telemetry data recorded in the last 7 days.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            SizedBox(
              height: 140,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: controller.perfSeries.map((d) {
                  final int maxVal = controller.perfSeries
                      .map((p) => (p['impressions'] as int?) ?? 0)
                      .fold(1, (a, b) => a > b ? a : b);
                  final int val = (d['impressions'] as int?) ?? 0;
                  final double ratio = maxVal > 0 ? (val / maxVal).clamp(0.08, 1.0) : 0.08;
                  final String date = d['date']?.toString() ?? '';

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text(
                            val >= 1000 ? '${(val / 1000).toStringAsFixed(1)}k' : '$val',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Container(
                            height: 80 * ratio,
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            date,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 9,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 10),
            const Center(
              child: Text(
                'Daily impressions delivered across transit fleet screens',
                style: TextStyle(color: AppColors.textMuted, fontSize: 9.5),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildQuickActionChip(
                label: 'Create Campaign',
                icon: Icons.add_circle_outline_rounded,
                color: const Color(0xFF6366F1),
                onTap: controller.goToCreateCampaign,
              ),
              const SizedBox(width: 10),
              _buildQuickActionChip(
                label: 'Campaigns Hub',
                icon: Icons.campaign_outlined,
                color: const Color(0xFF0EA5E9),
                onTap: () => controller.changeTab(1),
              ),
              const SizedBox(width: 10),
              _buildQuickActionChip(
                label: 'Lifecycle & Flow',
                icon: Icons.account_tree_outlined,
                color: const Color(0xFF8B5CF6),
                onTap: () => controller.changeTab(2),
              ),
              const SizedBox(width: 10),
              _buildQuickActionChip(
                label: 'Analytics',
                icon: Icons.bar_chart_rounded,
                color: const Color(0xFF10B981),
                onTap: () => controller.changeTab(3),
              ),
              const SizedBox(width: 10),
              _buildQuickActionChip(
                label: 'Billing & Wallet',
                icon: Icons.account_balance_wallet_outlined,
                color: const Color(0xFFF59E0B),
                onTap: controller.switchToBilling,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionChip({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentCampaignsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Recent Campaigns',
          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
        ),
        TextButton(
          onPressed: () => controller.changeTab(1),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: const Text('View All ›', style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildRecentCampaigns() {
    final list = controller.recentCampaigns;
    if (list.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            const Icon(Icons.campaign_outlined, color: AppColors.textMuted, size: 40),
            const SizedBox(height: 8),
            const Text(
              'No campaigns found',
              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Create your first campaign to launch on transit screens.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            CustomButton(
              text: 'Create Campaign',
              isGradient: true,
              height: 38,
              width: 160,
              onTap: controller.goToCreateCampaign,
            ),
          ],
        ),
      );
    }

    return Column(
      children: list.map((c) => _buildRecentCampaignCard(c)).toList(),
    );
  }

  Widget _buildRecentCampaignCard(CampaignModel c) {
    return GestureDetector(
      onTap: () => controller.goToCampaignDetails(c),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: c.statusColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: c.statusColor.withValues(alpha: 0.3)),
              ),
              child: Icon(Icons.campaign_outlined, color: c.statusColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.displayTitle,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${c.displayClient} • ${c.dateRangeText}',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 9.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  c.formattedBudget,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: c.statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: c.statusColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    c.statusLabel,
                    style: TextStyle(
                      color: c.statusColor,
                      fontSize: 8.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // LIFECYCLE & FLOW TAB (Index 2)
  // ==========================================
  Widget _buildLifecycleFlowTab() {
    final stages = [
      {'key': 'all', 'label': 'All'},
      {'key': 'draft', 'label': 'Draft'},
      {'key': 'pending_approval', 'label': 'Pending Approval'},
      {'key': 'approved', 'label': 'Approved'},
      {'key': 'paid', 'label': 'Paid (Ready)'},
      {'key': 'live', 'label': 'Live'},
      {'key': 'paused', 'label': 'Paused'},
      {'key': 'completed', 'label': 'Completed'},
      {'key': 'rejected', 'label': 'Rejected'},
    ];

    return Column(
      children: [
        // Top Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                onPressed: controller.openDrawer,
              ),
              const Text(
                'Lifecycle & Flow',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
                onPressed: () => controller.loadDashboardData(isRefresh: true),
              ),
            ],
          ),
        ),

        // Stages Filter Bar
        Obx(() {
          return SizedBox(
            height: 42,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: stages.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final s = stages[index];
                final key = s['key']!;
                final label = s['label']!;
                final isSelected = controller.activeLifecycleStage.value == key;
                final count = controller.getCountForStage(key);

                return GestureDetector(
                  onTap: () => controller.setLifecycleStage(key),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppTheme.primaryGradient : null,
                      color: isSelected ? null : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? Colors.transparent : AppColors.cardBorder,
                      ),
                    ),
                    child: Row(
                      children: [
                        Text(
                          label,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white.withValues(alpha: 0.25)
                                : AppColors.background,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '$count',
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textMuted,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        }),

        const SizedBox(height: 12),

        // Campaigns List for current stage
        Expanded(
          child: Obx(() {
            final list = controller.lifecycleCampaigns;
            if (list.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.account_tree_outlined, color: AppColors.textMuted, size: 48),
                    const SizedBox(height: 12),
                    Text(
                      'No campaigns in ${controller.activeLifecycleStage.value.replaceAll('_', ' ')} stage',
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Select another stage or create a new campaign.',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final c = list[index];
                return _buildLifecycleCampaignCard(c);
              },
            );
          }),
        ),
      ],
    );
  }

  Widget _buildLifecycleCampaignCard(CampaignModel c) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
              Expanded(
                child: Text(
                  c.displayTitle,
                  style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: c.statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: c.statusColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  c.statusLabel,
                  style: TextStyle(color: c.statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '${c.displayClient} • ${c.dateRangeText}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Budget: ${c.formattedBudget}',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  if (c.canStart)
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: GestureDetector(
                        onTap: () => controller.startCampaign(c.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: const Text('Start', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                  if (c.canPause)
                    Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: GestureDetector(
                        onTap: () => controller.pauseCampaign(c.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF97316).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFF97316).withValues(alpha: 0.4)),
                          ),
                          child: const Text('Pause', style: TextStyle(color: Color(0xFFF97316), fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                  GestureDetector(
                    onTap: () => controller.goToCampaignDetails(c),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Details ›', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // CAMPAIGNS TAB (Index 1)
  // ==========================================
  Widget _buildCampaignsTab() {
    return Stack(
      children: [
        Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  SvgPicture.asset('assets/icons/advertiser_ic/speaker.svg'),
                  const SizedBox(width: 10),
                  const Text(
                    'Campaigns',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: () => controller.fetchCampaigns(),
                    tooltip: 'Refresh Campaigns',
                  ),
                ],
              ),
            ),

            // Search Bar & Sort Dropdown
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        onChanged: controller.searchCampaigns,
                        decoration: const InputDecoration(
                          hintText: 'Search by title, brand, client, id...',
                          hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  PopupMenuButton<String>(
                    tooltip: 'Sort Campaigns',
                    color: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    onSelected: controller.setSort,
                    itemBuilder: (context) {
                      // Read once, outside the map, so the value is stable while the menu builds
                      final current = controller.selectedSort.value;
                      return controller.sortOptions.map((opt) {
                        final isSel = current == opt;
                        return PopupMenuItem<String>(
                          value: opt,
                          child: Row(
                            children: [
                              Icon(
                                isSel ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                color: isSel ? const Color(0xFF8B5CF6) : AppColors.textMuted,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                opt,
                                style: TextStyle(
                                  color: isSel ? Colors.white : AppColors.textSecondary,
                                  fontSize: 12,
                                  fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Row(
                        children: [
                          SvgPicture.asset('assets/icons/advertiser_ic/filter.svg'),
                          const SizedBox(width: 6),
                          Obx(() => Text(
                            controller.selectedSort.value, // RxString read inside Obx
                            style: const TextStyle(
                                color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          )),
                          const Icon(Icons.arrow_drop_down, color: AppColors.textMuted, size: 18),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Status tabs: NO outer Obx; each pill observes its own state
            SizedBox(
              height: 38,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: controller.statusTabs.length, // plain list, fixed tabs
                itemBuilder: (context, idx) {
                  final tab = controller.statusTabs[idx];
                  return _buildFilterPill(tab);
                },
              ),
            ),
            const SizedBox(height: 12),

            // Campaign list
            Expanded(
              child: Obx(() {
                final list = controller.filteredCampaigns; // RxList read inside Obx
                if (list.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.campaign_outlined,
                            size: 48, color: AppColors.textMuted.withOpacity(0.4)),
                        const SizedBox(height: 12),
                        const Text('No campaigns found in this view',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                        const SizedBox(height: 16),
                        CustomButton(
                          width: 160,
                          height: 40,
                          text: 'Create Campaign',
                          isGradient: true,
                          onTap: controller.goToCreateCampaign,
                        ),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  color: const Color(0xFF8B5CF6),
                  backgroundColor: const Color(0xFF1E293B),
                  onRefresh: () => controller.fetchCampaigns(),
                  child: ListView.builder(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 84),
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    itemCount: list.length,
                    itemBuilder: (context, index) => _buildDetailedCampaignCard(list[index]),
                  ),
                );
              }),
            ),
          ],
        ),
        Positioned(
          bottom: 20,
          right: 20,
          child: CustomButton(
            width: 175,
            height: 48,
            text: 'Create Campaign',
            isGradient: true,
            onTap: controller.goToCreateCampaign,
            prefixIcon: const Icon(Icons.add, color: Colors.white, size: 20),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterPill(String filter) {
    return Obx(() {
      final isSelected = controller.activeFilter.value == filter;
      final int count = controller.getTabCount(filter);

      return GestureDetector(
        onTap: () => controller.filterCampaigns(filter),
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : AppColors.cardBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? Colors.transparent : AppColors.cardBorder,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                filter,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontSize: 11.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textMuted,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }
  Widget _buildDetailedCampaignCard(CampaignModel c) {
    final statusColor = c.statusColor;
    final isEditable = ['draft', 'pending_approval', 'rejected', 'pending'].contains(c.status.toLowerCase());
    final isRunning = c.isLive;
    final isPaused = c.isPaused;
    final isApproved = c.status.toLowerCase() == 'approved';

    return GestureDetector(
      onTap: () => controller.goToCampaignDetails(c),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Accent Gradient Line
            Container(
              height: 3,
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Meta Row: ID + Status + 3-Dots Action Menu
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.cardBorder, width: 1),
                        ),
                        child: Text(
                          c.displayCode,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: statusColor.withOpacity(0.4), width: 1),
                            ),
                            child: Text(
                              c.statusLabel,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: 4),

                          // 3-DOTS POPUP MENU
                          PopupMenuButton<String>(
                            icon: const Icon(Icons.more_vert_rounded, color: Colors.white70, size: 20),
                            color: const Color(0xFF1E293B),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            onSelected: (action) {
                              if (action == 'view_details') {
                                controller.goToCampaignDetails(c);
                              } else if (action == 'edit_campaign') {
                                controller.goToEditCampaign(c);
                              } else if (action == 'start_broadcast' || action == 'resume_ad') {
                                controller.startCampaign(c.id);
                              } else if (action == 'pause_ad') {
                                controller.pauseCampaign(c.id);
                              } else if (action == 'end_campaign') {
                                controller.confirmEndCampaign(c);
                              } else if (action == 'view_analytics') {
                                controller.goToCampaignAnalytics(c);
                              } else if (action == 'delete_campaign') {
                                controller.confirmDeleteCampaign(c);
                              }
                            },
                            itemBuilder: (context) => [
                              const PopupMenuItem<String>(
                                value: 'view_details',
                                child: Row(
                                  children: [
                                    Icon(Icons.visibility_outlined, size: 16, color: Colors.white70),
                                    SizedBox(width: 10),
                                    Text('View Details', style: TextStyle(color: Colors.white, fontSize: 12)),
                                  ],
                                ),
                              ),
                              if (isEditable)
                                const PopupMenuItem<String>(
                                  value: 'edit_campaign',
                                  child: Row(
                                    children: [
                                      Icon(Icons.edit_outlined, size: 16, color: Colors.white70),
                                      SizedBox(width: 10),
                                      Text('Edit Campaign', style: TextStyle(color: Colors.white, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              if (isApproved)
                                const PopupMenuItem<String>(
                                  value: 'start_broadcast',
                                  child: Row(
                                    children: [
                                      Icon(Icons.play_arrow_rounded, size: 16, color: Color(0xFF10B981)),
                                      SizedBox(width: 10),
                                      Text('Start Broadcast',
                                          style: TextStyle(
                                              color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (isRunning)
                                const PopupMenuItem<String>(
                                  value: 'pause_ad',
                                  child: Row(
                                    children: [
                                      Icon(Icons.pause_rounded, size: 16, color: Color(0xFFF59E0B)),
                                      SizedBox(width: 10),
                                      Text('Pause Ad',
                                          style: TextStyle(
                                              color: Color(0xFFF59E0B), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (isPaused)
                                const PopupMenuItem<String>(
                                  value: 'resume_ad',
                                  child: Row(
                                    children: [
                                      Icon(Icons.play_arrow_rounded, size: 16, color: Color(0xFF10B981)),
                                      SizedBox(width: 10),
                                      Text('Resume Ad',
                                          style: TextStyle(
                                              color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (isRunning || isPaused)
                                const PopupMenuItem<String>(
                                  value: 'end_campaign',
                                  child: Row(
                                    children: [
                                      Icon(Icons.stop_rounded, size: 16, color: Color(0xFFEF4444)),
                                      SizedBox(width: 10),
                                      Text('End Campaign',
                                          style: TextStyle(
                                              color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              const PopupMenuItem<String>(
                                value: 'view_analytics',
                                child: Row(
                                  children: [
                                    Icon(Icons.bar_chart_rounded, size: 16, color: Colors.white70),
                                    SizedBox(width: 10),
                                    Text('View Analytics', style: TextStyle(color: Colors.white, fontSize: 12)),
                                  ],
                                ),
                              ),
                              if (isEditable)
                                const PopupMenuItem<String>(
                                  value: 'delete_campaign',
                                  child: Row(
                                    children: [
                                      Icon(Icons.delete_outline_rounded, size: 16, color: Color(0xFFEF4444)),
                                      SizedBox(width: 10),
                                      Text('Delete Campaign',
                                          style: TextStyle(
                                              color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title & Brand
                  Text(
                    c.displayTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        c.brandName?.isNotEmpty == true ? c.brandName! : c.displayClient,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      if (c.clientName != null && c.clientName!.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        const Text('·', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3), width: 1),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.person_outline_rounded, size: 10, color: Color(0xFF60A5FA)),
                              const SizedBox(width: 3),
                              Text(
                                'Client: ${c.clientName}',
                                style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Badges Row: Format, QR, Payment
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              (c.mediaType ?? '').toLowerCase().contains('video')
                                  ? Icons.videocam_outlined
                                  : Icons.image_outlined,
                              size: 10,
                              color: const Color(0xFF8B5CF6),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              (c.mediaType ?? 'Video').toUpperCase(),
                              style: const TextStyle(color: Colors.white70, fontSize: 8.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      if (c.promoCode != null && c.promoCode!.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.qr_code_2_rounded, size: 10, color: Color(0xFF10B981)),
                              const SizedBox(width: 3),
                              Text(
                                c.promoCode!,
                                style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                        ),
                        child: Text(
                          'Payment: ${c.paymentBreakdown != null ? 'Paid' : 'Unpaid'}',
                          style: const TextStyle(color: Color(0xFFA5B4FC), fontSize: 8.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),
                  const Divider(color: AppColors.cardBorder, height: 1),
                  const SizedBox(height: 10),

                  // Flight Duration & Amount Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Flight Duration', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                          const SizedBox(height: 2),
                          Text(c.dates,
                              style: const TextStyle(
                                  color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Total Amount', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                          const SizedBox(height: 2),
                          Text(c.budget,
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Target screens pill
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B).withOpacity(0.6),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.tv_rounded, size: 13, color: Color(0xFF8B5CF6)),
                            const SizedBox(width: 6),
                            Text(
                              '${c.screensCount} Target Screens',
                              style: const TextStyle(
                                  color: Color(0xFFC4B5FD), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(
                              '${c.targets.isNotEmpty ? c.targets.length : 1} Cities',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                            ),
                          ],
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




  // ==========================================
  // ANALYTICS TAB (Index 2)
  // ==========================================
  Widget _buildAnalyticsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              SvgPicture.asset('assets/icons/advertiser_ic/campaignAnalytics.svg'),
              // Icon(Icons.bar_chart_rounded, color: Color(0xFF8B5CF6), size: 24),
              SizedBox(width: 10),
              Text(
                'Campaign Analytics',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            physics: const BouncingScrollPhysics(),
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      color: const Color(0xFF1E293B),
                      child: const Center(
                        child: Icon(
                          Icons.movie_filter_outlined,
                          color: Color(0xFF8B5CF6),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Summer Sale 2026',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFF10B981,
                                  ).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'Live',
                                  style: TextStyle(
                                    color: Color(0xFF10B981),
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Retail • Offer / Promotion',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 9.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            '20 May 2026 - 10 Jun 2026 (21 Days)',
                            style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 8.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: _buildMiniStatBlock(
                      'assets/icons/advertiser_ic/totalEmpression.svg',
                      Color(0xffcf66f1),
                      'Total Impressions',
                      '15.2M',
                      const Color(0xFF8B5CF6),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMiniStatBlock(
                      'assets/icons/advertiser_ic/userTwo.svg',
                      Color(0xFF3B82F6),
                      'Total Reach',
                      '8.7M',
                      const Color(0xFF3B82F6),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMiniStatBlock(
                      'assets/icons/advertiser_ic/monitor.svg',
                      Color(0xFF10B981),
                      'Active Screens',
                      '1,182',
                      const Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              _buildPerformanceChart(),
              const SizedBox(height: 20),

              _buildQrAnalyticsCard(),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                     Row(
                       children: [
                         SvgPicture.asset('assets/icons/fleet_operator_icons/locationA.svg'),
                         SizedBox(width: 5),
                         Text(
                          'Top Performing Cities',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                          ),
                         ),
                       ],
                     ),
                    const SizedBox(height: 10),
                    _buildCityBarRow('Delhi (22%)', 0.8),
                    _buildCityBarRow('Mumbai (17%)', 0.65),
                    _buildCityBarRow('Bengaluru (13%)', 0.5),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStatBlock(String icon,Color iconColor,String label, String val, Color c) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          SvgPicture.asset(icon,color:iconColor,),
          // SvgPicture.asset('assets/icons/advertiser_ic/totalEmpression.svg',color: Color(0xffcf66f1),),
          Text(
            val,
            style: TextStyle(
              color: c,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 8),
          ),
        ],
      ),
    );
  }

  Widget _buildCityBarRow(String label, double p) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 9.5,
            ),
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: p,
            backgroundColor: const Color(0xFF1E293B),
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
            minHeight: 2,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // REPORTS TAB (Index 3)
  // ==========================================
  Widget _buildPerformanceChart() {
    return Container(
      height: 180,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Expanded(
            child: CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: ChartPainter(),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem('Impressions', const Color(0xFFEC4899)),
              const SizedBox(width: 14),
              _buildLegendItem('Reach', const Color(0xFF3B82F6)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 9),
        ),
      ],
    );
  }

  Widget _buildReportsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
             SvgPicture.asset('assets/icons/fleet_operator_icons/privacyPolicyA.svg',),
              SizedBox(width: 10),
              Text(
                'Reports',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
          child: Row(
            children: [
              Expanded(
                child: CustomTextField(
                  hintText: 'Select Campaign',
                  isDropdown: true,
                  dropdownValue: controller.selectedReportCampaign.value,
                  dropdownItems: controller.reportCampaigns,
                  onDropdownChanged: (val) =>
                      controller.selectedReportCampaign.value = val!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomTextField(
                  hintText: 'Select Date Range',
                  isDropdown: true,
                  dropdownValue: controller.selectedReportRange.value,
                  dropdownItems: controller.reportRanges,
                  onDropdownChanged: (val) =>
                      controller.selectedReportRange.value = val!,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            physics: const BouncingScrollPhysics(),
            children: [
              const Text(
                'Report Summary',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              _buildReportCard(
                'Campaign Performance',
                'Overview of campaign performance metrics.',
                Icons.bar_chart_rounded,
                [
                  _buildSubStatCol('Total Impressions', '15.2M', '▲ 18.6%'),
                  _buildSubStatCol('Total Reach', '8.7M', '▲ 16.3%'),
                  _buildSubStatCol('Active Screens', '1,182', '▲ 9.4%'),
                  _buildSubStatCol('Duration', '21 Days', 'Active'),
                ],
                'Download PDF',
              ),
              const SizedBox(height: 16),

              _buildReportCard(
                'Financial Report',
                'Detailed spending and budget overview.',
                Icons.currency_rupee_rounded,
                [
                  _buildSubStatCol('Total Budget', '₹2,50,000', '100%'),
                  _buildSubStatCol('Amount Spent', '₹1,48,750', '59.5%'),
                  _buildSubStatCol('Remaining Budget', '₹1,01,250', '40.5%'),
                  _buildSubStatCol('GST (18%)', '₹22,477', 'Paid'),
                ],
                'Download Invoice',
              ),
              const SizedBox(height: 16),

              _buildReportCard(
                'Audience Report',
                'Insights about audience and engagement.',
                Icons.people_outline_rounded,
                [
                  _buildSubStatCol('Top Cities', 'Delhi, Mum', 'Focus'),
                  _buildSubStatCol('Best Routes', 'MG Road', 'High traffic'),
                  _buildSubStatCol('Peak Time', '6 PM-10 PM', 'Evening'),
                  _buildSubStatCol('Avg Frequency', '2.3 times', 'Per user'),
                ],
                'Export CSV',
              ),
              const SizedBox(height: 24),

              const Text(
                'Export Options',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              _buildExportOptionsGrid(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReportCard(
    String title,
    String desc,
    IconData icon,
    List<Widget> stats,
    String btnText,
  ) {
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
                  // Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
                  // const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
               InkWell(
                 onTap: (){
                   controller.switchToBillingPayment();
                 },
                 child: Text(
                  'View Details ›',
                  style: TextStyle(
                    color: Color(0xFF8B5CF6),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                               ),
               ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            desc,
            style: const TextStyle(color:Colors.white, fontSize: 11),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: stats,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              icon: SvgPicture.asset('assets/icons/advertiser_ic/download.svg',width: 15,height: 15,),
              label: Text(
                btnText,
                style: const TextStyle(color: Colors.white, fontSize: 10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubStatCol(String label, String value, String sub) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white,fontWeight: FontWeight.w500, fontSize: 10),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          sub,
          style: const TextStyle(color: Color(0xFF10B981), fontSize: 7),
        ),
      ],
    );
  }

  Widget _buildExportOptionsGrid() {
    final formats = [
      {
        'title': 'PDF',
        'desc': 'Download PDF',
        'icon': 'assets/icons/advertiser_ic/pdf.svg',
      },
      {
        'title': 'Excel',
        'desc': 'Download Excel',
        'icon': "assets/icons/advertiser_ic/excel.svg",
      },
      {
        'title': 'CSV',
        'desc': 'Download CSV',
        'icon': "assets/icons/advertiser_ic/csv.svg",
      },
    ];

    return Row(
      children: formats.map((f) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Column(
              children: [
                // Icon(
                //   f['icon'] as IconData,
                //   color: const Color(0xFF8B5CF6),
                //   size: 18,
                // ),
                SvgPicture.asset(f['icon'].toString(),width: 25,height: 25,),
                const SizedBox(height: 6),
                Text(
                  f['title'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  f['desc'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 8,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ==========================================
  // BILLING TAB (Index 4 - Sub View Mode)
  // ==========================================
  Widget _buildBillingTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                 SvgPicture.asset('assets/icons/advertiser_ic/billingPayments.svg',width: 25,height: 25,),
                  SizedBox(width: 10),
                  Text(
                    'Billing & Payments',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              InkWell(
                  onTap: (){
                    controller.switchToProfile();
                  },
                  child: SvgPicture.asset('assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',width: 25,height: 25,)),
              // IconButton(
              //   icon: const Icon(
              //     Icons.settings_outlined,
              //     color: Colors.white,
              //     size: 20,
              //   ),
              //   onPressed: controller.switchToProfile,
              // ),
            ],
          ),
        ),

        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            physics: const BouncingScrollPhysics(),
            children: [
              _buildWalletBalanceCard(),
              const SizedBox(height: 20),
              _buildPaymentMethodsSection(),
              const SizedBox(height: 20),
              _buildRecentTransactionsSection(),
              const SizedBox(height: 20),
              _buildInvoicesSection(),
              const SizedBox(height: 20),
              _buildBillingFooter(),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildWalletBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Current Balance',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
                const SizedBox(height: 8),
                const Text(
                  '₹1,01,250',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  '40.5% of total budget remaining',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 4,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _buildBalanceStatLine('Total Budget', '₹2,50,000'),
              _buildBalanceStatLine('Amount Spent', '₹1,48,750'),
              _buildBalanceStatLine('Remaining', '₹1,01,250'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceStatLine(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
          ),
          const SizedBox(height: 2),
          Text(
            val,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodsSection() {
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
            children: const [
              Text(
                'Payment Methods',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Manage ›',
                style: TextStyle(
                  color: Color(0xFF8B5CF6),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            children: [
              SvgPicture.asset("assets/icons/advertiser_ic/visa.svg",width: 25,height: 25,),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      '•••• •••• •••• 4567',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Expires 12/28',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 9),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'Primary',
                  style: TextStyle(
                    color: Color(0xFF10B981),
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              icon:  Icon(Icons.add, color:Color(0xffb864de), size: 14),
              label: const Text(
                'Add New Payment Method',
                style: TextStyle(color: Colors.white, fontSize: 10.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentTransactionsSection() {
    final txs = [
      {
        'title': 'Payment for Campaign CMP-2026-000124',
        'date': '07 Aug 2026, 10:41 AM',
        'amt': '₹1,48,750',
        'badge': 'Paid',
        'col': const Color(0xFF10B981),
      },
      {
        'title': 'Payment for Campaign CMP-2026-000089',
        'date': '15 Jul 2026, 11:22 AM',
        'amt': '₹75,000',
        'badge': 'Paid',
        'col': const Color(0xFF10B981),
      },
      {
        'title': 'Payment for Campaign CMP-2026-000067',
        'date': '23 Jun 2026, 09:18 AM',
        'amt': '₹50,000',
        'badge': 'Paid',
        'col': const Color(0xFF10B981),
      },
      {
        'title': 'Refund for Campaign CMP-2026-000045',
        'date': '10 Jun 2026, 04:35 PM',
        'amt': '-₹15,000',
        'badge': 'Refunded',
        'col': Colors.blueAccent,
      },
    ];

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
            children: const [
              Text(
                'Recent Transactions',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'View All',
                style: TextStyle(
                  color: Color(0xFF8B5CF6),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            children: txs.map((tx) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      // decoration: BoxDecoration(
                      //   color: (tx['badge'] as String) == 'Refunded'
                      //       ? Colors.red.withOpacity(0.12)
                      //       : const Color(0xFF10B981).withOpacity(0.12),
                      //   shape: BoxShape.circle,
                      // ),
                      child:
                      (tx['badge'] as String) == 'Refunded' ?
                      SvgPicture.asset("assets/icons/advertiser_ic/arrowUp.svg",width: 18,height: 18,):
                      SvgPicture.asset("assets/icons/advertiser_ic/download.svg",width: 18,height: 18,)
                      // child: Icon(
                      //   (tx['badge'] as String) == 'Refunded'
                      //       ? Icons.arrow_upward_rounded
                      //       : Icons.arrow_downward_rounded,
                      //   color: (tx['badge'] as String) == 'Refunded'
                      //       ? Colors.redAccent
                      //       : const Color(0xFF10B981),
                      //   size: 14,
                      // ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tx['title'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            tx['date'] as String,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 8.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          tx['amt'] as String,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: (tx['col'] as Color).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            tx['badge'] as String,
                            style: TextStyle(
                              color: tx['col'] as Color,
                              fontSize: 7,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoicesSection() {
    final invs = [
      {'title': 'INV-2026-000124', 'date': '07 Aug 2026', 'amt': '₹1,48,750'},
      {'title': 'INV-2026-000089', 'date': '15 Jul 2026', 'amt': '₹75,000'},
      {'title': 'INV-2026-000067', 'date': '23 Jun 2026', 'amt': '₹50,000'},
    ];

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
            children: const [
              Text(
                'Invoices',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'View All',
                style: TextStyle(
                  color: Color(0xFF8B5CF6),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            children: invs.map((inv) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                  SvgPicture.asset("assets/icons/advertiser_ic/pdf.svg",width: 15,height: 15,),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            inv['title'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            inv['date'] as String,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 8.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      inv['amt'] as String,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 14),
                    OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(5)
                        ),
                        side: const BorderSide(color: AppColors.cardBorder),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 6,
                        ),
                      ),
                      icon:SvgPicture.asset("assets/icons/advertiser_ic/download.svg",width: 15,height: 15,),
                      label: const Text(
                        'Download',
                        style: TextStyle(color: Colors.white, fontSize: 8.5),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildBillingFooter() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children:  [
                SvgPicture.asset("assets/icons/fleet_operator_icons/securityA.svg",width: 20,height: 21,),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Secure Payments\nYour payments are encrypted and 100% secure.',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 8.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: GestureDetector(
            onTap: controller.switchToHelp,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  SvgPicture.asset("assets/icons/fleet_operator_icons/helpSupportA.svg",width: 20,height: 21,),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Need Help?\nContact Billing Support',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 8.5,
                      ),
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textMuted,
                    size: 12,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // PROFILE / SETTINGS TAB (Index 4 - Sub View Mode)
  // ==========================================
  Widget _buildSettingsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              SvgPicture.asset('assets/icons/profile.svg'),
              SizedBox(width: 10),
              Text(
                'Settings',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            physics: const BouncingScrollPhysics(),
            children: [
              // Account Section
              _buildSettingsSectionHeader('Account'),
              _buildSettingsCard([
                _buildSettingsRow(
                  'Personal Information',
                  'Update your personal details',
                  'assets/icons/profile.svg',
                  onTap: () => Get.toNamed(Routes.ADVERTISER_PROFILE),
                ),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow(
                  'Change Password',
                  'Update your account password',
                  'assets/icons/fleet_operator_icons/changePasswordA.svg',
                  onTap: () => Get.toNamed(Routes.CHANGE_PASSWORD),
                ),
                // const Divider(color: AppColors.cardBorder, height: 16),
                // _buildSettingsRow('Two-Factor Authentication', 'Add an extra layer of security', 'assets/icons/profile.svg'),
              ]),
              const SizedBox(height: 18),

              // Preferences Section
              _buildSettingsSectionHeader('Preferences'),
              _buildSettingsCard([
                _buildSettingsRow(
                  'Notification Settings',
                  'Manage your notification preferences',
                  'assets/icons/fleet_operator_icons/notification.svg',
                  onTap: () => Get.toNamed(Routes.NOTIFICATION_SETTINGS),
                ),
                // const Divider(color: AppColors.cardBorder, height: 16),
                // _buildSettingsRow('Language', 'Choose your preferred language','assets/icons/profile.svg', value: 'English'),
                // const Divider(color: AppColors.cardBorder, height: 16),
                // _buildSettingsSwitchRow('Dark Mode', 'Choose your theme preference', 'assets/icons/profile.svg'),
              ]),
              const SizedBox(height: 18),

              // Security Section
              _buildSettingsSectionHeader('Security'),
              _buildSettingsCard([
                _buildSettingsRow(
                  'Privacy Policy',
                  'View our privacy policy',
                  'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
                  onTap: () => Get.toNamed(Routes.PRIVACY_POLICY),
                ),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow(
                  'Terms & Conditions',
                  'View terms and conditions',
                  'assets/icons/fleet_operator_icons/securityA.svg',
                  onTap: () => Get.toNamed(Routes.TERMS_CONDITIONS),
                ),
                // const Divider(color: AppColors.cardBorder, height: 16),
                // _buildSettingsRow('Device Sessions', 'Manage your active sessions', 'assets/icons/profile.svg'),
              ]),
              const SizedBox(height: 18),

              // Support Section
              _buildSettingsSectionHeader('Support'),
              _buildSettingsCard([
                _buildSettingsRow(
                  'Help Center',
                  'Find answers to common questions',
                  'assets/icons/fleet_operator_icons/helpSupportA.svg',
                  onTap: controller.switchToHelp,
                ),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow(
                  'Contact Support',
                  'Get in touch with our support team',
                  'assets/icons/fleet_operator_icons/supportHistoryA.svg',
                  onTap: controller.switchToHelp,
                ),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow(
                  'About VMOVEXA',
                  'Learn more about VMOVEXA',
                  'assets/icons/fleet_operator_icons/AboutA.svg',
                ),
              ]),
              const SizedBox(height: 18),

              // App Section
              _buildSettingsSectionHeader('App'),
              _buildSettingsCard([
                _buildSettingsRow(
                  'App Version',
                  'You are using the latest version',
                  'assets/icons/profile.svg',
                  value: 'v1.0.0',
                ),
              ]),
              const SizedBox(height: 24),

              // Logout Button
              OutlinedButton.icon(
                onPressed: controller.logout,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent, width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(
                  Icons.logout_rounded,
                  color: Colors.redAccent,
                  size: 16,
                ),
                label: const Text(
                  'Logout',
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8, top: 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFF8B5CF6),
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsRow(
    String label,
    String subtitle,
    String icon, {
    VoidCallback? onTap,
    String? value,
  }) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          label=="Contact Support"|| label=='About VMOVEXA' || label=='App Version'?
          SvgPicture.asset(icon,width: 22,height: 22,)
              :
          SvgPicture.asset(icon,width: 20,height: 20,),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white, fontSize: 8.5),
                ),
              ],
            ),
          ),
          if (value != null) ...[
            Text(
              value,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
              ),
            ),
            const SizedBox(width: 8),
          ],
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.textMuted,
            size: 18,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSwitchRow(String label, String subtitle, String icon) {
    return Row(
      children: [
        SvgPicture.asset(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 8.5,
                ),
              ),
            ],
          ),
        ),
        Switch(
          value: true,
          onChanged: (val) {},
          activeColor: const Color(0xFF8B5CF6),
          activeTrackColor: const Color(0xFF8B5CF6).withOpacity(0.3),
        ),
      ],
    );
  }

  // ==========================================
  // HELP & SUPPORT TAB (Index 4 - Sub View Mode)
  // ==========================================
  Widget _buildHelpSupportTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  InkWell(
                    onTap: () {
                      controller.switchToProfile();
                    },
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.socialBtnBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppColors.socialBtnBorder,
                          width: 1.2,
                        ),
                      ),
                      child: const Icon(
                        Icons.chevron_left_rounded,
                        color: AppColors.textPrimary,
                        size: 26,
                      ),
                    ),
                  ),
                  SizedBox(width: 10),
                  Text(
                    'Help & Support',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              SvgPicture.asset('assets/icons/fleet_operator_icons/profileHeaderSettingA.svg')
              // IconButton(
              //   icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 20),
              //   onPressed: controller.switchToProfile,
              // ),
            ],
          ),
        ),

        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            physics: const BouncingScrollPhysics(),
            children: [
              // Search input
              Container(
                decoration: BoxDecoration(
                  color: AppColors.inputBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: const TextField(
                  style: TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Search for help articles, FAQs...',
                    hintStyle: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      color: AppColors.textMuted,
                      size: 18,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Quick Help Grid
              const Text(
                'Quick Help',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              _buildQuickHelpGrid(),
              const SizedBox(height: 20),

              // Contact Support banner
              //_buildContactSupportBanner(),
              //const SizedBox(height: 16),

              // Channels
              _buildSupportChannelsGrid(),
              const SizedBox(height: 20),

              // My Support Tickets
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'My Support Tickets',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'View All ›',
                    style: TextStyle(
                      color: Color(0xFF8B5CF6),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildTicketsCard(),
              const SizedBox(height: 20),

              // Popular Articles
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Popular Articles',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'View All ›',
                    style: TextStyle(
                      color: Color(0xFF8B5CF6),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildPopularArticlesCard(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickHelpGrid() {
    final items = [
      {
        'title': 'FAQs',
        'desc': 'Find answers to common questions',
        'icon': 'assets/icons/advertiser_ic/faqsA.svg',
      },
      {
        'title': 'Guides',
        'desc': 'Step-by-step user guides',
        'icon': 'assets/icons/advertiser_ic/guidesA.svg',
      },
      {
        'title': 'Video Tutorials',
        'desc': 'Watch tutorials and learn',
        'icon': 'assets/icons/advertiser_ic/videoTutorial.svg',
      },
      {
        'title': 'Best Practices',
        'desc': 'Tips to get the best results',
        'icon': 'assets/icons/advertiser_ic/pratices.svg',
      },
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.43,
      children: items.map((i) {
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Icon(
              //   i['icon'] as IconData,
              //   color: const Color(0xFF8B5CF6),
              //   size: 20,
              // ),
              SvgPicture.asset( i['icon'].toString()),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    i['title'] as String,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    i['desc'] as String,
                    style: const TextStyle(
                      color:Colors.white,
                      fontSize: 8,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildContactSupportBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.headset_mic_outlined,
            color: Color(0xFF8B5CF6),
            size: 28,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'We\'re here to help!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Our support team is available 24/7 to assist you with any issues.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                  maxLines: 2,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              child: const Text(
                'Raise a Ticket ›',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSupportChannelsGrid() {
    final channels = [
      {
        'title': 'Live Chat',
        'sub': 'Chat with our support team',
        'info': 'Available Now',
        'icon':'assets/icons/fleet_operator_icons/smsNotificationA.svg',
        'col': const Color(0xFF10B981),
      },
      {
        'title': 'Call Support',
        'sub': 'Speak with our support executive',
        'info': '+91 98765 43210',
        'icon': 'assets/icons/fleet_operator_icons/mobileNumberA.svg',
        'col': const Color(0xFF8B5CF6),
      },
      {
        'title': 'Email Support',
        'sub': 'Send us an email anytime',
        'info': 'support@vmovexa.com',
        'icon': 'assets/icons/fleet_operator_icons/emailA.svg',
        'col': Colors.blueAccent,
      },
    ];

    return Row(
      children: channels.map((ch) {
        return Expanded(
          child: Container(
            height: 100,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Icon(
                //   ch['icon'] as IconData,
                //   color: const Color(0xFF8B5CF6),
                //   size: 16,
                // ),
                SvgPicture.asset(ch['icon'].toString()),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ch['title'] as String,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ch['info'] as String,
                      style: TextStyle(
                        color: ch['col'] as Color,
                        fontSize: 7.5,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTicketsCard() {
    final tickets = [
      {
        'id': 'CMP-2026-000124',
        'title': 'Campaign not displaying on screens',
        'date': '08 May 2026, 11:30 AM',
        'badge': 'In Progress',
        'col': const Color(0xFFF59E0B),
        'icon':'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
      },
      {
        'id': 'CMP-2026-000089',
        'title': 'Invoice download issue',
        'date': '06 May 2026, 04:20 PM',
        'badge': 'Resolved',
        'col': const Color(0xFF10B981),
        'icon':'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
      },
      {
        'id': 'CMP-2026-000067',
        'title': 'Payment failed but amount deducted',
        'date': '03 May 2026, 09:15 AM',
        'badge': 'Closed',
        'col': AppColors.textMuted,
        'icon':'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
      },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: tickets.map((t) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SvgPicture.asset(t['icon'].toString(),width: 15,height: 15,),
                SizedBox(width: 10,),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        t['id'] as String,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        t['title'] as String,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 9,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        t['date'] as String,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 8,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: (t['col'] as Color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    t['badge'] as String,
                    style: TextStyle(
                      color: t['col'] as Color,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textMuted,
                  size: 16,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildPopularArticlesCard() {
    final list = [
      'How to create and launch a campaign?',
      'What are the best practices for creatives?',
      'How billing and payments work?',
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: list.map((a) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    SvgPicture.asset('assets/icons/fleet_operator_icons/privacyPolicyA.svg',),
                    const SizedBox(width: 10),
                    Text(
                      a,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                      ),
                    ),
                  ],
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textMuted,
                  size: 16,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildQrAnalyticsCard() {
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
                children:  [
                  // Icon(
                  //   Icons.qr_code_scanner_rounded,
                  //   color: Color(0xFF8B5CF6),
                  //   size: 20,
                  // ),
                  SvgPicture.asset('assets/icons/advertiser_ic/qrAnalytics.svg',width: 18,height: 18,),
                  SizedBox(width: 8),
                  Text(
                    'QR Analytics',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {},
                child: Row(
                  children: const [
                    Text(
                      'View QR Details',
                      style: TextStyle(
                        color: Color(0xFF8B5CF6),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 2),
                    Icon(
                      Icons.chevron_right_rounded,
                      color: Color(0xFF8B5CF6),
                      size: 14,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                _buildQrStatItem(
                  'Total QR Scans',
                  '1,245',
                  '18.6%',
                  'vs last 21 days',
                ),
                _buildQrVerticalDivider(),
                _buildQrStatItem(
                  'Unique Scanners',
                  '1,032',
                  '15.3%',
                  'vs last 21 days',
                ),
                _buildQrVerticalDivider(),
                _buildQrStatItem(
                  'Scan Rate',
                  '8.1%',
                  '1.2%',
                  'vs. Impressions',
                ),
                _buildQrVerticalDivider(),
                _buildQrStatItem(
                  'Leads Generated',
                  '256',
                  '20.4%',
                  'vs last 21 days',
                ),
                _buildQrVerticalDivider(),
                _buildQrStatItem(
                  'Lead Conversion Rate',
                  '20.6%',
                  null,
                  'vs QR scans',
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'QR Scans by Day',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 150,
            child: CustomPaint(
              size: const Size(double.infinity, 150),
              painter: QrBarChartPainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrStatItem(
    String label,
    String value,
    String? trendPercent,
    String comparison,
  ) {
    return SizedBox(
      width: 110,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 8.5,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          if (trendPercent != null)
            Row(
              children: [
                const Icon(
                  Icons.arrow_drop_up_rounded,
                  color: Color(0xFF10B981),
                  size: 14,
                ),
                Text(
                  '$trendPercent',
                  style: const TextStyle(
                    color: Color(0xFF10B981),
                    fontSize: 8.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            )
          else
            const SizedBox(height: 14),
          const SizedBox(height: 2),
          Text(
            comparison,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
          ),
        ],
      ),
    );
  }

  Widget _buildQrVerticalDivider() {
    return Container(
      height: 52,
      width: 1,
      color: AppColors.cardBorder,
      margin: const EdgeInsets.symmetric(horizontal: 10),
    );
  }
}

class ChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double paddingLeft = 24.0;
    final double paddingBottom = 16.0;
    final double paddingTop = 10.0;
    final double paddingRight = 10.0;

    final double width = size.width - paddingLeft - paddingRight;
    final double height = size.height - paddingTop - paddingBottom;

    final paintGrid = Paint()
      ..color = AppColors.cardBorder
      ..strokeWidth = 1.0;

    for (int i = 0; i < 4; i++) {
      double y = paddingTop + height - (height * i / 3);
      canvas.drawLine(
        Offset(paddingLeft, y),
        Offset(size.width - paddingRight, y),
        paintGrid,
      );
    }

    final List<double> p1 = [0.2, 0.45, 0.35, 0.65, 0.58, 0.85];
    final List<double> p2 = [0.1, 0.3, 0.2, 0.45, 0.38, 0.55];

    _drawSmoothCurve(
      canvas,
      paddingLeft,
      paddingTop,
      width,
      height,
      p1,
      const Color(0xFFEC4899),
    );
    _drawSmoothCurve(
      canvas,
      paddingLeft,
      paddingTop,
      width,
      height,
      p2,
      const Color(0xFF3B82F6),
    );
  }

  void _drawSmoothCurve(
    Canvas canvas,
    double ox,
    double oy,
    double w,
    double h,
    List<double> values,
    Color color,
  ) {
    final path = Path();
    final paintLine = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    double px0 = ox;
    double py0 = oy + h - (h * values[0]);
    path.moveTo(px0, py0);

    for (int i = 1; i < values.length; i++) {
      double px1 = ox + (w * i / 5);
      double py1 = oy + h - (h * values[i]);

      double cx0 = px0 + (px1 - px0) / 2;
      double cy0 = py0;
      double cx1 = px0 + (px1 - px0) / 2;
      double cy1 = py1;

      path.cubicTo(cx0, cy0, cx1, cy1, px1, py1);

      px0 = px1;
      py0 = py1;
    }
    canvas.drawPath(path, paintLine);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class QrBarChartPainter extends CustomPainter {
  final List<String> days = [
    '13 May',
    '14 May',
    '15 May',
    '16 May',
    '17 May',
    '18 May',
    '19 May',
  ];
  final List<int> values = [120, 150, 165, 130, 180, 220, 280];

  @override
  void paint(Canvas canvas, Size size) {
    final double paddingLeft = 24.0;
    final double paddingBottom = 16.0;
    final double paddingTop = 15.0;
    final double paddingRight = 10.0;

    final double width = size.width - paddingLeft - paddingRight;
    final double height = size.height - paddingTop - paddingBottom;

    final paintGrid = Paint()
      ..color = AppColors.cardBorder
      ..strokeWidth = 0.8;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    final List<int> yLabels = [0, 100, 200, 300];
    for (int i = 0; i < yLabels.length; i++) {
      double val = yLabels[i].toDouble();
      double y = paddingTop + height - (height * val / 300);

      canvas.drawLine(
        Offset(paddingLeft, y),
        Offset(size.width - paddingRight, y),
        paintGrid,
      );

      textPainter.text = TextSpan(
        text: yLabels[i].toString(),
        style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(paddingLeft - textPainter.width - 6, y - textPainter.height / 2),
      );
    }

    final double colWidth = width / days.length;
    final double barWidth = colWidth * 0.45;

    for (int i = 0; i < days.length; i++) {
      double xCenter = paddingLeft + (colWidth * (i + 0.5));
      double barHeight = (values[i] / 300) * height;

      final double left = xCenter - barWidth / 2;
      final double top = paddingTop + height - barHeight;
      final double right = xCenter + barWidth / 2;
      final double bottom = paddingTop + height;

      final RRect rrect = RRect.fromRectAndCorners(
        Rect.fromLTRB(left, top, right, bottom),
        topLeft: const Radius.circular(4),
        topRight: const Radius.circular(4),
      );

      final barPaint = Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFFC084FC), Color(0xFF8B5CF6)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTRB(left, top, right, bottom));

      canvas.drawRRect(rrect, barPaint);

      textPainter.text = TextSpan(
        text: values[i].toString(),
        style: const TextStyle(
          color: Color(0xFFC084FC),
          fontSize: 8.5,
          fontWeight: FontWeight.bold,
        ),
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(xCenter - textPainter.width / 2, top - textPainter.height - 3),
      );

      textPainter.text = TextSpan(
        text: days[i],
        style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5),
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(
          xCenter - textPainter.width / 2,
          size.height - paddingBottom + 4,
        ),
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
