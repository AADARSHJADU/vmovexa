import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/advertiser_dashboard_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserDashboardView extends GetView<AdvertiserDashboardController> {
  const AdvertiserDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 1:
              return _buildCampaignsTab();
            case 2:
              return _buildAnalyticsTab();
            case 3:
              return _buildReportsTab();
            case 4:
              return _buildDynamicTab4Body();
            default:
              return _buildHomeTab();
          }
        }),
      ),
      bottomNavigationBar: Obx(
        () {
          IconData tab4Icon = Icons.person_outline_rounded;
          String tab4Label = 'Profile';

          if (controller.tab4Mode.value == 'billing') {
            tab4Icon = Icons.account_balance_wallet_rounded;
            tab4Label = 'Billing';
          } else if (controller.tab4Mode.value == 'help') {
            tab4Icon = Icons.more_horiz_rounded;
            tab4Label = 'More';
          }

          return Container(
            decoration: const BoxDecoration(
              color: AppColors.cardBg,
              border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
            ),
            child: BottomNavigationBar(
              currentIndex: controller.selectedNavIndex.value,
              onTap: (index) {
                if (index == 4) {
                  // Keep whatever mode it was or let it stick
                } else {
                  // If switching away from index 4, reset mode to profile for next click or let it stay
                }
                controller.changeTab(index);
              },
              backgroundColor: Colors.transparent,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: const Color(0xFF8B5CF6),
              unselectedItemColor: AppColors.textMuted,
              selectedFontSize: 9.5,
              unselectedFontSize: 9.5,
              items: [
                const BottomNavigationBarItem(
                  icon: Icon(Icons.home_filled, size: 20),
                  label: 'Home',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.campaign_rounded, size: 20),
                  label: 'Campaigns',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.bar_chart_rounded, size: 20),
                  label: 'Analytics',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.description_outlined, size: 20),
                  label: 'Reports',
                ),
                BottomNavigationBarItem(
                  icon: Icon(tab4Icon, size: 20),
                  label: tab4Label,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDynamicTab4Body() {
    String mode = controller.tab4Mode.value;
    if (mode == 'billing') {
      return _buildBillingTab();
    } else if (mode == 'help') {
      return _buildHelpSupportTab();
    } else {
      return _buildSettingsTab();
    }
  }

  // ==========================================
  // HOME TAB (Index 0)
  // ==========================================
  Widget _buildHomeTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
                onPressed: () {},
              ),
              const Text(
                'V M O V E X A',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 2),
              ),
              Row(
                children: [
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
                        onPressed: () => Get.toNamed(Routes.NOTIFICATIONS_LIST),
                      ),
                      Positioned(
                        right: 12,
                        top: 12,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 4),
                  GestureDetector(
                    onTap: controller.switchToProfile,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
                      child: const Center(child: Icon(Icons.person_outline_rounded, color: Colors.white, size: 16)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Welcome back,', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                const SizedBox(height: 4),
                const Text('Advertiser!', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text("Here's an overview of your campaigns.", style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                const SizedBox(height: 24),

                _buildMetricsGrid(),
                const SizedBox(height: 28),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Campaign Performance (Last 7 Days)', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    TextButton(
                      onPressed: () => controller.changeTab(2),
                      child: const Text('View All', style: TextStyle(color: Color(0xFF6366F1), fontSize: 11)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _buildPerformanceChart(),
                const SizedBox(height: 28),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Recent Campaigns', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    TextButton(
                      onPressed: () => controller.changeTab(1),
                      child: const Text('View All', style: TextStyle(color: Color(0xFF6366F1), fontSize: 11)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _buildRecentCampaignsList(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMetricsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: 1.35,
      children: [
        _buildMetricCard('Active Campaigns', '12', '2 running now', Icons.campaign_outlined, const Color(0xFFEC4899)),
        _buildMetricCard('Scheduled Campaigns', '8', 'Upcoming', Icons.schedule_rounded, const Color(0xFF3B82F6)),
        _buildMetricCard('Total Impressions', '2.45M', '▲ 18.6% vs last 7 days', Icons.remove_red_eye_outlined, const Color(0xFF10B981), isTrendUp: true),
        _buildBudgetCard(),
      ],
    );
  }

  Widget _buildMetricCard(
      String label,
      String value,
      String subText,
      IconData icon,
      Color iconColor, {
        bool isTrendUp = false,
      }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _buildGradientIconRing(icon, iconColor),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 4),

                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    height: 1.0,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 4),

                Text(
                  subText,
                  style: TextStyle(
                    color: isTrendUp
                        ? const Color(0xFF10B981)
                        : const Color(0xFF60A5FA),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

// Circular ring with gradient border + soft glow + centered icon,
// matching the pink-to-blue circular outline in the screenshot.
  Widget _buildGradientIconRing(IconData icon, Color iconColor) {
    return Container(
      width: 42,
      height: 42,
      padding: const EdgeInsets.all(2), // ring thickness
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [
            Color(0xFFEC4899),
            Color(0xFF3B82F6),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.cardBg,
        ),
        child: Center(
          child: Icon(
            icon,
            color: iconColor,
            size: 22,
          ),
        ),
      ),
    );
  }

// ---------------------------------------------------------------------
// Example usage with your data:
//
// _buildMetricCard(
//   'Active Campaigns',
//   '12',
//   '2 running now',
//   Icons.campaign_outlined,
//   const Color(0xFFEC4899),
//   isTrendUp: false,
// ),
// ---------------------------------------------------------------------

  Widget _buildBudgetCard() {
    return GestureDetector(
      onTap: controller.switchToBilling,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Budget Utilized', style: TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
                const Text('₹ 8.75L', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('65% of total budget', style: TextStyle(color: AppColors.textSecondary, fontSize: 8)),
                  ],
                ),
                const SizedBox(height: 4),
                Container(
                  height: 4,
                  width: double.infinity,
                  decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(2)),
                  child: Row(
                    children: [
                      Container(
                        width: 70,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFEC4899), Color(0xFF8B5CF6)]),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }


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
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9)),
      ],
    );
  }

  Widget _buildRecentCampaignsList() {
    final list = controller.allCampaigns.take(3).toList();
    return Column(
      children: list.map((c) => _buildCampaignRowItem(c)).toList(),
    );
  }

  Widget _buildCampaignRowItem(dynamic c) {
    Color badgeColor = c.status == 'RUNNING' ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
    return GestureDetector(
      onTap: () => controller.goToCampaignDetails(c),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: c.themeColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: c.themeColor.withOpacity(0.3), width: 1),
              ),
              child: Center(child: Icon(Icons.campaign_outlined, color: c.themeColor, size: 22)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(c.title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: badgeColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(c.status, style: TextStyle(color: badgeColor, fontSize: 8, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(c.client, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(c.dates, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                      Text('Budget: ${c.budget}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
          ],
        ),
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: const [
                  Icon(Icons.campaign_rounded, color: Color(0xFF8B5CF6), size: 24),
                  SizedBox(width: 10),
                  Text('Campaigns', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: const TextField(
                        style: TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Search Campaigns...',
                          hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1.2),
                    ),
                    child: const Icon(Icons.tune_rounded, color: Color(0xFF8B5CF6), size: 18),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              height: 36,
              child: Obx(
                () => ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _buildFilterPill('All'),
                    _buildFilterPill('Running'),
                    _buildFilterPill('Scheduled'),
                    _buildFilterPill('Pending'),
                    _buildFilterPill('Completed'),
                    _buildFilterPill('Paused'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            Expanded(
              child: Obx(() {
                if (controller.filteredCampaigns.isEmpty) {
                  return const Center(child: Text('No campaigns found', style: TextStyle(color: AppColors.textMuted)));
                }
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  physics: const BouncingScrollPhysics(),
                  itemCount: controller.filteredCampaigns.length,
                  itemBuilder: (context, index) {
                    final c = controller.filteredCampaigns[index];
                    return _buildDetailedCampaignCard(c);
                  },
                );
              }),
            ),
          ],
        ),
        Positioned(
          bottom: 20,
          right: 20,
          child: FloatingActionButton.extended(
            onPressed: controller.goToCreateCampaign,
            backgroundColor: const Color(0xFF8B5CF6),
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('Create Campaign', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterPill(String filter) {
    bool isSelected = controller.activeFilter.value == filter;
    return GestureDetector(
      onTap: () => controller.filterCampaigns(filter),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF8B5CF6).withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? const Color(0xFF8B5CF6) : AppColors.cardBorder, width: 1),
        ),
        child: Text(filter, style: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary, fontSize: 11)),
      ),
    );
  }

  Widget _buildDetailedCampaignCard(dynamic c) {
    Color badgeColor = c.status == 'RUNNING' ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
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
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: c.themeColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: c.themeColor.withOpacity(0.2), width: 1),
                ),
                child: Center(child: Icon(Icons.photo_library_outlined, color: c.themeColor, size: 24)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(c.title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: badgeColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(c.status, style: TextStyle(color: badgeColor, fontSize: 8, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(c.client, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                    const SizedBox(height: 4),
                    Text(c.dates, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCompactStat('Budget', c.budget),
              _buildCompactStat('Screens', '${c.screens}'),
              _buildCompactStat('Impressions', c.impressions),
              GestureDetector(
                onTap: () => controller.goToCampaignDetails(c),
                child: Row(
                  children: const [
                    Text('View Details', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
                    SizedBox(width: 4),
                    Icon(Icons.chevron_right_rounded, color: Color(0xFF8B5CF6), size: 14),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
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
            children: const [
              Icon(Icons.bar_chart_rounded, color: Color(0xFF8B5CF6), size: 24),
              SizedBox(width: 10),
              Text('Campaign Analytics', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
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
                decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.cardBorder, width: 1)),
                child: Row(
                  children: [
                    Container(width: 60, height: 60, color: const Color(0xFF1E293B), child: const Center(child: Icon(Icons.movie_filter_outlined, color: Color(0xFF8B5CF6)))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Summer Sale 2026', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                child: const Text('Live', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text('Retail • Offer / Promotion', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                          const SizedBox(height: 6),
                          const Text('20 May 2026 - 10 Jun 2026 (21 Days)', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(child: _buildMiniStatBlock('Total Impressions', '15.2M', const Color(0xFF8B5CF6))),
                  const SizedBox(width: 8),
                  Expanded(child: _buildMiniStatBlock('Total Reach', '8.7M', const Color(0xFF3B82F6))),
                  const SizedBox(width: 8),
                  Expanded(child: _buildMiniStatBlock('Active Screens', '1,182', const Color(0xFF10B981))),
                ],
              ),
              const SizedBox(height: 18),

              _buildPerformanceChart(),
              const SizedBox(height: 20),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.cardBorder)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Top Performing Cities', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
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

  Widget _buildMiniStatBlock(String label, String val, Color c) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
      child: Column(
        children: [
          Text(val, style: TextStyle(color: c, fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
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
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
          const SizedBox(height: 4),
          LinearProgressIndicator(value: p, backgroundColor: const Color(0xFF1E293B), valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)), minHeight: 2),
        ],
      ),
    );
  }

  // ==========================================
  // REPORTS TAB (Index 3)
  // ==========================================
  Widget _buildReportsTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: const [
              Icon(Icons.description_outlined, color: Color(0xFF8B5CF6), size: 24),
              SizedBox(width: 10),
              Text('Reports', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
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
                  onDropdownChanged: (val) => controller.selectedReportCampaign.value = val!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CustomTextField(
                  hintText: 'Select Date Range',
                  isDropdown: true,
                  dropdownValue: controller.selectedReportRange.value,
                  dropdownItems: controller.reportRanges,
                  onDropdownChanged: (val) => controller.selectedReportRange.value = val!,
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
              const Text('Report Summary', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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

              const Text('Export Options', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              _buildExportOptionsGrid(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReportCard(String title, String desc, IconData icon, List<Widget> stats, String btnText) {
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
                  Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
                  const SizedBox(width: 8),
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                ],
              ),
              const Text('View Details ›', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 9.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 12),
              label: Text(btnText, style: const TextStyle(color: Colors.white, fontSize: 10)),
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
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(sub, style: const TextStyle(color: Color(0xFF10B981), fontSize: 7)),
      ],
    );
  }

  Widget _buildExportOptionsGrid() {
    final formats = [
      {'title': 'PDF', 'desc': 'Download PDF', 'icon': Icons.picture_as_pdf_outlined},
      {'title': 'Excel', 'desc': 'Download Excel', 'icon': Icons.table_chart_outlined},
      {'title': 'CSV', 'desc': 'Download CSV', 'icon': Icons.grid_view_outlined},
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
                Icon(f['icon'] as IconData, color: const Color(0xFF8B5CF6), size: 18),
                const SizedBox(height: 6),
                Text(f['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(f['desc'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
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
                children: const [
                  Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF8B5CF6), size: 24),
                  SizedBox(width: 10),
                  Text('Billing & Payments', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 20),
                onPressed: controller.switchToProfile,
              ),
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
                const Text('Current Balance', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                const SizedBox(height: 8),
                const Text('₹1,01,250', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                const Text('40.5% of total budget remaining', style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5)),
                const SizedBox(height: 8),
                Container(
                  height: 4,
                  width: double.infinity,
                  decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(2)),
                  child: Row(
                    children: [
                      Container(
                        width: 80,
                        decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(2)),
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
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
          const SizedBox(height: 2),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
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
              Text('Payment Methods', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text('Manage ›', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(6)),
                child: const Text('VISA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10, fontStyle: FontStyle.italic)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('•••• •••• •••• 4567', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    SizedBox(height: 2),
                    Text('Expires 12/28', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
                child: const Text('Primary', style: TextStyle(color: Color(0xFF10B981), fontSize: 8, fontWeight: FontWeight.bold)),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              icon: const Icon(Icons.add, color: Colors.white, size: 14),
              label: const Text('Add New Payment Method', style: TextStyle(color: Colors.white, fontSize: 10.5)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentTransactionsSection() {
    final txs = [
      {'title': 'Payment for Campaign CMP-2026-000124', 'date': '07 Aug 2026, 10:41 AM', 'amt': '₹1,48,750', 'badge': 'Paid', 'col': const Color(0xFF10B981)},
      {'title': 'Payment for Campaign CMP-2026-000089', 'date': '15 Jul 2026, 11:22 AM', 'amt': '₹75,000', 'badge': 'Paid', 'col': const Color(0xFF10B981)},
      {'title': 'Payment for Campaign CMP-2026-000067', 'date': '23 Jun 2026, 09:18 AM', 'amt': '₹50,000', 'badge': 'Paid', 'col': const Color(0xFF10B981)},
      {'title': 'Refund for Campaign CMP-2026-000045', 'date': '10 Jun 2026, 04:35 PM', 'amt': '-₹15,000', 'badge': 'Refunded', 'col': Colors.blueAccent},
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
              Text('Recent Transactions', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text('View All', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
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
                      decoration: BoxDecoration(color: (tx['badge'] as String) == 'Refunded' ? Colors.red.withOpacity(0.12) : const Color(0xFF10B981).withOpacity(0.12), shape: BoxShape.circle),
                      child: Icon((tx['badge'] as String) == 'Refunded' ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded, color: (tx['badge'] as String) == 'Refunded' ? Colors.redAccent : const Color(0xFF10B981), size: 14),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tx['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text(tx['date'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(tx['amt'] as String, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: (tx['col'] as Color).withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
                          child: Text(tx['badge'] as String, style: TextStyle(color: tx['col'] as Color, fontSize: 7, fontWeight: FontWeight.bold)),
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
              Text('Invoices', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text('View All', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            children: invs.map((inv) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    const Icon(Icons.picture_as_pdf_outlined, color: Colors.redAccent, size: 20),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(inv['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(inv['date'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                        ],
                      ),
                    ),
                    Text(inv['amt'] as String, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 14),
                    OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.cardBorder),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      ),
                      icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 10),
                      label: const Text('Download', style: TextStyle(color: Colors.white, fontSize: 8.5)),
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
            decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
            child: Row(
              children: const [
                Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 18),
                SizedBox(width: 10),
                Expanded(child: Text('Secure Payments\nYour payments are encrypted and 100% secure.', style: TextStyle(color: AppColors.textSecondary, fontSize: 8.5))),
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
              decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
              child: Row(
                children: const [
                  Icon(Icons.support_agent_rounded, color: Color(0xFF8B5CF6), size: 18),
                  SizedBox(width: 10),
                  Expanded(child: Text('Need Help?\nContact Billing Support', style: TextStyle(color: AppColors.textSecondary, fontSize: 8.5))),
                  Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 12),
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
            children: const [
              Icon(Icons.person_outline_rounded, color: Color(0xFF8B5CF6), size: 24),
              SizedBox(width: 10),
              Text('Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
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
                _buildSettingsRow('Personal Information', 'Update your personal details', Icons.person_outline_rounded, onTap: () => Get.toNamed(Routes.ADVERTISER_PROFILE)),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Change Password', 'Update your account password', Icons.lock_outline_rounded, onTap: () => Get.toNamed(Routes.CHANGE_PASSWORD)),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Two-Factor Authentication', 'Add an extra layer of security', Icons.verified_user_outlined),
              ]),
              const SizedBox(height: 18),

              // Preferences Section
              _buildSettingsSectionHeader('Preferences'),
              _buildSettingsCard([
                _buildSettingsRow('Notification Settings', 'Manage your notification preferences', Icons.notifications_none_rounded, onTap: () => Get.toNamed(Routes.NOTIFICATION_SETTINGS)),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Language', 'Choose your preferred language', Icons.language_rounded, value: 'English'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsSwitchRow('Dark Mode', 'Choose your theme preference', Icons.dark_mode_outlined),
              ]),
              const SizedBox(height: 18),

              // Security Section
              _buildSettingsSectionHeader('Security'),
              _buildSettingsCard([
                _buildSettingsRow('Privacy Policy', 'View our privacy policy', Icons.shield_outlined, onTap: () => Get.toNamed(Routes.PRIVACY_POLICY)),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Terms & Conditions', 'View terms and conditions', Icons.description_outlined, onTap: () => Get.toNamed(Routes.TERMS_CONDITIONS)),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Device Sessions', 'Manage your active sessions', Icons.monitor_rounded),
              ]),
              const SizedBox(height: 18),

              // Support Section
              _buildSettingsSectionHeader('Support'),
              _buildSettingsCard([
                _buildSettingsRow('Help Center', 'Find answers to common questions', Icons.help_outline_rounded, onTap: controller.switchToHelp),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('Contact Support', 'Get in touch with our support team', Icons.support_agent_rounded, onTap: controller.switchToHelp),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildSettingsRow('About VMOVEXA', 'Learn more about VMOVEXA', Icons.info_outline_rounded),
              ]),
              const SizedBox(height: 18),

              // App Section
              _buildSettingsSectionHeader('App'),
              _buildSettingsCard([
                _buildSettingsRow('App Version', 'You are using the latest version', Icons.phone_android_rounded, value: 'v1.0.0'),
              ]),
              const SizedBox(height: 24),

              // Logout Button
              OutlinedButton.icon(
                onPressed: controller.logout,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent, width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 16),
                label: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold)),
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
        style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 11, fontWeight: FontWeight.bold),
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
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildSettingsRow(String label, String subtitle, IconData icon, {VoidCallback? onTap, String? value}) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF8B5CF6), size: 18),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
              ],
            ),
          ),
          if (value != null) ...[
            Text(value, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
            const SizedBox(width: 8),
          ],
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
        ],
      ),
    );
  }

  Widget _buildSettingsSwitchRow(String label, String subtitle, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF8B5CF6), size: 18),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
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
                children: const [
                  Icon(Icons.help_outline_rounded, color: Color(0xFF8B5CF6), size: 24),
                  SizedBox(width: 10),
                  Text('Help & Support', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 20),
                onPressed: controller.switchToProfile,
              ),
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
                    hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Quick Help Grid
              const Text('Quick Help', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              _buildQuickHelpGrid(),
              const SizedBox(height: 20),

              // Contact Support banner
              _buildContactSupportBanner(),
              const SizedBox(height: 16),

              // Channels
              _buildSupportChannelsGrid(),
              const SizedBox(height: 20),

              // My Support Tickets
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('My Support Tickets', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text('View All ›', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              _buildTicketsCard(),
              const SizedBox(height: 20),

              // Popular Articles
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Popular Articles', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text('View All ›', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold)),
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
      {'title': 'FAQs', 'desc': 'Find answers to common questions', 'icon': Icons.help_outline_rounded},
      {'title': 'Guides', 'desc': 'Step-by-step user guides', 'icon': Icons.book_outlined},
      {'title': 'Video Tutorials', 'desc': 'Watch tutorials and learn', 'icon': Icons.video_library_outlined},
      {'title': 'Best Practices', 'desc': 'Tips to get the best results', 'icon': Icons.lightbulb_outline_rounded},
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.45,
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
              Icon(i['icon'] as IconData, color: const Color(0xFF8B5CF6), size: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(i['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(i['desc'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), maxLines: 2, overflow: TextOverflow.ellipsis),
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
          const Icon(Icons.headset_mic_outlined, color: Color(0xFF8B5CF6), size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('We\'re here to help!', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('Our support team is available 24/7 to assist you with any issues.', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5), maxLines: 2),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF8B5CF6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            child: const Text('Raise a Ticket ›', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildSupportChannelsGrid() {
    final channels = [
      {'title': 'Live Chat', 'sub': 'Chat with our support team', 'info': 'Available Now', 'icon': Icons.chat_bubble_outline_rounded, 'col': const Color(0xFF10B981)},
      {'title': 'Call Support', 'sub': 'Speak with our support executive', 'info': '+91 98765 43210', 'icon': Icons.phone_outlined, 'col': const Color(0xFF8B5CF6)},
      {'title': 'Email Support', 'sub': 'Send us an email anytime', 'info': 'support@vmovexa.com', 'icon': Icons.email_outlined, 'col': Colors.blueAccent},
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
                Icon(ch['icon'] as IconData, color: const Color(0xFF8B5CF6), size: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ch['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(ch['info'] as String, style: TextStyle(color: ch['col'] as Color, fontSize: 7.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
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
      {'id': 'CMP-2026-000124', 'title': 'Campaign not displaying on screens', 'date': '08 May 2026, 11:30 AM', 'badge': 'In Progress', 'col': const Color(0xFFF59E0B)},
      {'id': 'CMP-2026-000089', 'title': 'Invoice download issue', 'date': '06 May 2026, 04:20 PM', 'badge': 'Resolved', 'col': const Color(0xFF10B981)},
      {'id': 'CMP-2026-000067', 'title': 'Payment failed but amount deducted', 'date': '03 May 2026, 09:15 AM', 'badge': 'Closed', 'col': AppColors.textMuted},
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
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t['id'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(t['title'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Text(t['date'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: (t['col'] as Color).withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
                  child: Text(t['badge'] as String, style: TextStyle(color: t['col'] as Color, fontSize: 8, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
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
                    const Icon(Icons.description_outlined, color: AppColors.textSecondary, size: 14),
                    const SizedBox(width: 10),
                    Text(a, style: const TextStyle(color: Colors.white, fontSize: 9.5)),
                  ],
                ),
                const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
              ],
            ),
          );
        }).toList(),
      ),
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

    final paintGrid = Paint()..color = AppColors.cardBorder..strokeWidth = 1.0;

    for (int i = 0; i < 4; i++) {
      double y = paddingTop + height - (height * i / 3);
      canvas.drawLine(Offset(paddingLeft, y), Offset(size.width - paddingRight, y), paintGrid);
    }

    final List<double> p1 = [0.2, 0.45, 0.35, 0.65, 0.58, 0.85];
    final List<double> p2 = [0.1, 0.3, 0.2, 0.45, 0.38, 0.55];

    _drawSmoothCurve(canvas, paddingLeft, paddingTop, width, height, p1, const Color(0xFFEC4899));
    _drawSmoothCurve(canvas, paddingLeft, paddingTop, width, height, p2, const Color(0xFF3B82F6));
  }

  void _drawSmoothCurve(Canvas canvas, double ox, double oy, double w, double h, List<double> values, Color color) {
    final path = Path();
    final paintLine = Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 2.0;

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

