import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/gov_campaign_details_controller.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../routes/app_routes.dart';

class GovCampaignDetailsView extends GetView<GovCampaignDetailsController> {
  const GovCampaignDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar Header
            _buildTopBar(),

            // Campaign Meta Summary (Unsplash Image + Active Badge)
            _buildCampaignMetaHeader(),

            // Custom Stepped Tab Bar
            _buildTabsRow(),

            // Dynamic Tab Content Scroll view
            Expanded(
              child: Obx(() {
                final tab = controller.selectedTab.value;
                if (tab == 'Live Coverage') {
                  return _buildLiveCoverageTab();
                } else if (tab == 'Core') {
                  return _buildCoreTab();
                } else if (tab == 'QR Analytics') {
                  return _buildQrAnalyticsTab();
                } else {
                  // Fallback for Performance, Audience, Locations, Devices placeholder view
                  return _buildPlaceholderTab(tab);
                }
              }),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ==========================================
  // TOP BAR HEADER
  // ==========================================
  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Text(
            'Campaign Details',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          IconButton(
            icon: const Icon(Icons.more_horiz_rounded, color: Colors.white, size: 22),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  // ==========================================
  // CAMPAIGN META HEADER
  // ==========================================
  Widget _buildCampaignMetaHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Obx(() {
        final c = controller.campaign.value;
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  image: DecorationImage(
                    image: NetworkImage(c.imagePath),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          c.title,
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Active',
                            style: TextStyle(color: Color(0xFF10B981), fontSize: 7.5, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.calendar_month_outlined, color: AppColors.textMuted, size: 10),
                        const SizedBox(width: 4),
                        Text(
                          c.dates,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                        ),
                        const SizedBox(width: 12),
                        const Icon(Icons.location_on_outlined, color: AppColors.textMuted, size: 10),
                        const SizedBox(width: 4),
                        Text(
                          c.locations,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  // ==========================================
  // CUSTOM TABS ROW
  // ==========================================
  Widget _buildTabsRow() {
    final List<String> tabs = [
      'Core',
      'Performance',
      'Audience',
      'Locations',
      'Live Coverage',
      'Devices',
      'QR Analytics'
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: SizedBox(
        height: 36,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: tabs.length,
          itemBuilder: (context, idx) {
            final t = tabs[idx];
            return Obx(() {
              final isSelected = controller.selectedTab.value == t;
              return GestureDetector(
                onTap: () => controller.updateTab(t),
                child: Container(
                  margin: const EdgeInsets.only(right: 14),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: isSelected ? const Color(0xFF3B82F6) : Colors.transparent,
                        width: 2,
                      ),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      t,
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                ),
              );
            });
          },
        ),
      ),
    );
  }

  // ==========================================
  // TAB 1: LIVE COVERAGE / MAP (Image 1)
  // ==========================================
  Widget _buildLiveCoverageTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Coverage panel
          Container(
            padding: const EdgeInsets.all(14),
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
                    const Text('Live Coverage / Map', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                    _buildMiniDropdown('All Locations'),
                  ],
                ),
                const SizedBox(height: 12),

                // Stylized Bhopal Live Map Painter
                Container(
                  height: 240,
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CustomPaint(
                            painter: BhopalLiveCoverageMapPainter(),
                          ),
                        ),
                      ),
                      // Legend panel at top-right
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.8),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.cardBorder, width: 1),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLegendItem('Live', '28', const Color(0xFF10B981)),
                              const SizedBox(height: 4),
                              _buildLegendItem('Inactive', '6', const Color(0xFFF59E0B)),
                              const SizedBox(height: 4),
                              _buildLegendItem('Upcoming', '4', const Color(0xFF3B82F6)),
                            ],
                          ),
                        ),
                      ),
                      // Location Pin Overlay labels
                      const Positioned(
                        top: 70,
                        left: 100,
                        child: Text('Chuna Bhatti', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                      ),
                      const Positioned(
                        top: 140,
                        right: 100,
                        child: Text('Arera Colony', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                      ),
                      const Positioned(
                        bottom: 90,
                        left: 30,
                        child: Text('Bairagarh', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                      ),
                      const Positioned(
                        bottom: 90,
                        right: 110,
                        child: Text('TT Nagar', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                      ),

                      // Zoom key overlays
                      Positioned(
                        bottom: 10,
                        right: 10,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.cardBorder, width: 1),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.gps_fixed_rounded, color: Colors.white, size: 14),
                              const Divider(color: AppColors.cardBorder, height: 12),
                              const Icon(Icons.add, color: Colors.white, size: 14),
                              const Divider(color: AppColors.cardBorder, height: 12),
                              const Icon(Icons.remove, color: Colors.white, size: 14),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Metrics Badges Row
                Row(
                  children: [
                    Expanded(child: _buildMetricTile('28', 'Live Displays', '70%', const Color(0xFF10B981))),
                    const SizedBox(width: 8),
                    Expanded(child: _buildMetricTile('6', 'Inactive Displays', '15%', const Color(0xFFF59E0B))),
                    const SizedBox(width: 8),
                    Expanded(child: _buildMetricTile('4', 'Upcoming', '10%', const Color(0xFF3B82F6))),
                    const SizedBox(width: 8),
                    Expanded(child: _buildMetricTile('40', 'Total Displays', '100%', const Color(0xFF8B5CF6))),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Live Activity Feed Row Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Live Activity Feed', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
              Text('View All', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 10.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 10),

          // Live Activity Items List
          Column(
            children: controller.activityFeed.map((item) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: item['color'].withOpacity(0.08),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 16),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Display #${item['displayId']} is now ${item['status']}',
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item['location'] as String,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      item['time'] as String,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 8.5),
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

  Widget _buildLegendItem(String label, String val, Color color) {
    return Row(
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
        const SizedBox(width: 14),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildMetricTile(String val, String title, String percentage, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          Text(val, style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 7), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Text(percentage, style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildMiniDropdown(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black38,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 9.5)),
          const SizedBox(width: 4),
          const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 10),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: CORE SUMMARY (Image 2)
  // ==========================================
  Widget _buildCoreTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Campaign Summary', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),

          // Overview stats grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 0.82,
            children: [
              _buildCoreStatCard('Impressions', '1,982', '↑ 15.2%', const Color(0xFF3B82F6)),
              _buildCoreStatCard('Reach', '1,456', '↑ 11.6%', const Color(0xFF10B981)),
              _buildCoreStatCard('Clicks', '248', '↑ 9.3%', const Color(0xFF8B5CF6)),
              _buildCoreStatCard('Engagement', '6.24%', '↑ 4.7%', const Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 18),

          // Campaign Core Info Table
          const Text('Campaign Core Info', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Column(
              children: [
                _buildInfoRow('Campaign Name', 'Road Safety Awareness'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Campaign Type', 'Awareness'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Objective', 'Increase Road Safety Awareness'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Start Date', '12 May 2025'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('End Date', '20 May 2025'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Status', 'Active'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Budget', '₹50,000'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Daily Budget', '₹5,000'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Target Locations', 'Bhopal, MP'),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildInfoRow('Description', 'Promoting road safety rules and responsible driving through outdoor advertising across key locations.'),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Daily Performance Trend Line Chart
          Container(
            padding: const EdgeInsets.all(14),
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
                    const Text('Daily Performance Trend', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        _buildChartLegendItem('Impressions', const Color(0xFF3B82F6)),
                        const SizedBox(width: 8),
                        _buildChartLegendItem('Reach', const Color(0xFF10B981)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Double Line Chart Custom Paint
                SizedBox(
                  height: 140,
                  width: double.infinity,
                  child: CustomPaint(
                    painter: GovDetailsCoreTrendPainter(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // View Full Performance
          Container(
            width: double.infinity,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.5), width: 1.2),
            ),
            child: TextButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.bar_chart_rounded, color: Color(0xFF3B82F6), size: 14),
              label: const Text('View Full Performance', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11.5, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoreStatCard(String label, String val, String inc, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(inc, style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold)),
          const Text('vs last 7 days', style: TextStyle(color: AppColors.textMuted, fontSize: 7)),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String key, String val) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(key, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
        ),
        Expanded(
          child: Text(val, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.right),
        ),
      ],
    );
  }

  Widget _buildChartLegendItem(String name, Color color) {
    return Row(
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
      ],
    );
  }

  // ==========================================
  // TAB 3: QR ANALYTICS (Image 3)
  // ==========================================
  Widget _buildQrAnalyticsTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('QR Overview', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
              ElevatedButton.icon(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cardBg,
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                ),
                icon: const Icon(Icons.download_rounded, color: Colors.white, size: 11),
                label: const Text('Export', style: TextStyle(color: Colors.white, fontSize: 9.5)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // QR Metric cards grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 0.82,
            children: [
              _buildCoreStatCard('Total QR Scans', '4,512', '↑ 12.5%', const Color(0xFF10B981)),
              _buildCoreStatCard('Unique Scans', '3,102', '↑ 11.8%', const Color(0xFF3B82F6)),
              _buildCoreStatCard('QR Scan Rate', '2.45%', '↑ 9.3%', const Color(0xFF8B5CF6)),
              _buildCoreStatCard('Avg Scans/Day', '642', '↑ 8.7%', const Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 18),

          // Campaign QR Code & Details Layout
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder, width: 1.2),
                  ),
                  child: Column(
                    children: [
                      const Text('Campaign QR Code', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      Container(
                        width: 100,
                        height: 100,
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF3B82F6), width: 1),
                        ),
                        child: CustomPaint(painter: DummyQrCodePainter()),
                      ),
                      const SizedBox(height: 10),
                      const Text('Scan to view campaign', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                      const SizedBox(height: 4),
                      const Text('Use this QR code in offline media and creatives.', style: TextStyle(color: AppColors.textSecondary, fontSize: 7.5), textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.cardBorder),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                padding: EdgeInsets.zero,
                              ),
                              child: const Text('Download', style: TextStyle(color: Colors.white, fontSize: 9)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.cardBorder),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                padding: EdgeInsets.zero,
                              ),
                              child: const Text('Share', style: TextStyle(color: Colors.white, fontSize: 9)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder, width: 1.2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('QR Code Details', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      _buildInfoRow('Destination URL', 'https://vmovexa.com/c/safe-roads-save-lives'),
                      const Divider(color: AppColors.cardBorder, height: 12),
                      _buildInfoRow('QR Type', 'Dynamic'),
                      const Divider(color: AppColors.cardBorder, height: 12),
                      _buildInfoRow('Created On', '10 May 2025'),
                      const Divider(color: AppColors.cardBorder, height: 12),
                      _buildInfoRow('Last Updated', '10 May 2025'),
                      const Divider(color: AppColors.cardBorder, height: 12),
                      _buildInfoRow('Status', 'Active'),
                      const Divider(color: AppColors.cardBorder, height: 12),
                      _buildInfoRow('Total Scans', '4,512'),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // QR Scans Trend
          Container(
            padding: const EdgeInsets.all(14),
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
                    const Text('QR Scans Trend', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        _buildChartLegendItem('Total Scans', const Color(0xFF3B82F6)),
                        const SizedBox(width: 8),
                        _buildChartLegendItem('Unique Scans', const Color(0xFF10B981)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Scans line trend painter
                SizedBox(
                  height: 140,
                  width: double.infinity,
                  child: CustomPaint(
                    painter: GovDetailsCoreTrendPainter(), // Reuse line trend
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // QR Scans by Campaigns
          const Text('QR Scans by Campaigns', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Column(
            children: controller.topQrCampaigns.map((i) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: [
                    Text('${i['rank']}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 10),
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        image: DecorationImage(
                          image: NetworkImage(i['image'] as String),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(i['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          // Progress Bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(2),
                            child: LinearProgressIndicator(
                              value: (i['percentage'] as double) / 100,
                              backgroundColor: Colors.black26,
                              valueColor: AlwaysStoppedAnimation<Color>(i['color'] as Color),
                              minHeight: 3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${i['scans']}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                        Text('${i['percentage']}%', style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
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

  // ==========================================
  // PLACEHOLDER TAB FOR OTHERS
  // ==========================================
  Widget _buildPlaceholderTab(String tabName) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.analytics_outlined, color: const Color(0xFF3B82F6).withOpacity(0.3), size: 48),
          const SizedBox(height: 12),
          Text(
            '$tabName Analytics',
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Visual metrics and breakdown updates are processing.',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 10.5),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // BOTTOM NAVIGATION BAR
  // ==========================================
  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_filled, 'Home'),
          _buildNavItem(1, Icons.campaign_rounded, 'Campaigns'),
          // Middle glowing Emergency button
          GestureDetector(
            onTap: () {
              final GovernmentDashboardController dashboardController = Get.find<GovernmentDashboardController>();
              dashboardController.selectedNavIndex.value = 2;
              Get.back();
            },
            child: Container(
              width: 52,
              height: 52,
              margin: const EdgeInsets.only(bottom: 8, top: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withOpacity(0.4),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Center(
                child: Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
              ),
            ),
          ),
          _buildNavItem(3, Icons.analytics_rounded, 'Analytics'),
          _buildNavItem(4, Icons.more_horiz_rounded, 'More'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int idx, IconData icon, String label) {
    // We default to Analytics tab highlighted since campaign details is accessed via Analytics
    final bool isSelected = idx == 3;
    final color = isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted;
    return GestureDetector(
      onTap: () {
        final GovernmentDashboardController dashboardController = Get.find<GovernmentDashboardController>();
        dashboardController.selectedNavIndex.value = idx;
        Get.back();
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: color, fontSize: 8.5, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// CUSTOM MAP & CHART PAINTERS
// ==========================================
class BhopalLiveCoverageMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);

    // Bhopal lake shape
    final lakePaint = Paint()
      ..color = const Color(0xFF1D4ED8).withOpacity(0.12)
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(size.width * 0.25, size.height * 0.4)
      ..quadraticBezierTo(size.width * 0.45, size.height * 0.3, size.width * 0.6, size.height * 0.5)
      ..quadraticBezierTo(size.width * 0.45, size.height * 0.68, size.width * 0.25, size.height * 0.58)
      ..close();
    canvas.drawPath(path, lakePaint);

    // Street grid lines
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.02)
      ..strokeWidth = 1.0;

    for (double i = 0; i < size.width; i += 24) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double j = 0; j < size.height; j += 24) {
      canvas.drawLine(Offset(0, j), Offset(size.width, j), gridPaint);
    }

    // Bus Live status dots (glowing green/orange/blue)
    void drawMarker(double x, double y, Color color, {bool selectedBeacon = false}) {
      if (selectedBeacon) {
        // Beacon ring indicator
        canvas.drawCircle(Offset(x, y), 12, Paint()..color = color.withOpacity(0.15));
        canvas.drawCircle(Offset(x, y), 8, Paint()..color = Colors.white);
        canvas.drawCircle(Offset(x, y), 5, Paint()..color = color);
      } else {
        canvas.drawCircle(Offset(x, y), 8, Paint()..color = color.withOpacity(0.2));
        canvas.drawCircle(Offset(x, y), 4, Paint()..color = color);
      }
    }

    drawMarker(size.width * 0.38, size.height * 0.35, const Color(0xFF10B981)); // Chuna Bhatti
    drawMarker(size.width * 0.32, size.height * 0.48, const Color(0xFFF59E0B));
    drawMarker(size.width * 0.53, size.height * 0.42, const Color(0xFF3B82F6), selectedBeacon: true);
    drawMarker(size.width * 0.75, size.height * 0.4, const Color(0xFF10B981)); // Arera Colony
    drawMarker(size.width * 0.24, size.height * 0.72, const Color(0xFF10B981)); // Bairagarh
    drawMarker(size.width * 0.32, size.height * 0.85, const Color(0xFFF59E0B));
    drawMarker(size.width * 0.48, size.height * 0.75, const Color(0xFF10B981)); // TT Nagar
    drawMarker(size.width * 0.48, size.height * 0.94, const Color(0xFF10B981));
    drawMarker(size.width * 0.64, size.height * 0.7, const Color(0xFF10B981));
    drawMarker(size.width * 0.66, size.height * 0.9, const Color(0xFFF59E0B));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class GovDetailsCoreTrendPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double chartHeight = size.height - 24;
    final double chartWidth = size.width - 24;

    // Dates indices: 12 May to 20 May (9 points)
    final List<String> dates = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May', '20 May'];
    final double stepX = chartWidth / (dates.length - 1);

    // Impressions Data (Line 1 in blue)
    final List<double> impressions = [1000, 1200, 1700, 1100, 1300, 1800, 1750, 2300, 2400];
    // Reach Data (Line 2 in green)
    final List<double> reach = [500, 700, 1100, 800, 1000, 1300, 1250, 1800, 1900];

    // Grid Horizontal Lines
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = chartHeight - (i * chartHeight / 4) + 6;
      canvas.drawLine(Offset(10, y), Offset(size.width, y), gridPaint);
    }

    void drawTrend(List<double> data, Color color) {
      final path = Path();
      final linePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.2;

      final pointPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      for (int i = 0; i < data.length; i++) {
        final x = 12 + (i * stepX);
        // Scale values (max 2.5K)
        final y = chartHeight - (data[i] / 2500 * chartHeight) + 6;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3, pointPaint);
        canvas.drawCircle(Offset(x, y), 5, Paint()..color = color.withOpacity(0.2));
      }
      canvas.drawPath(path, linePaint);
    }

    // Draw lines
    drawTrend(impressions, const Color(0xFF3B82F6));
    drawTrend(reach, const Color(0xFF10B981));

    // Bottom Dates labels
    for (int i = 0; i < dates.length; i++) {
      final x = 12 + (i * stepX);
      if (i % 2 == 0 || i == dates.length - 1) {
        final textPainter = TextPainter(
          text: TextSpan(
            text: dates[i],
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(canvas, Offset(x - 14, chartHeight + 10));
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class DummyQrCodePainter extends CustomPainter {
  final Color color;
  DummyQrCodePainter({this.color = const Color(0xFF1E293B)});

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final finderPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    _drawFinderPattern(canvas, 2, 2, finderPaint);
    _drawFinderPattern(canvas, size.width - 20, 2, finderPaint);
    _drawFinderPattern(canvas, 2, size.height - 20, finderPaint);

    final pixelPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    for (double i = 4; i < size.width - 4; i += 6) {
      for (double j = 4; j < size.height - 4; j += 6) {
        if ((i < 22 && j < 22) || (i > size.width - 22 && j < 22) || (i < 22 && j > size.height - 22)) {
          continue;
        }
        if ((i + j).toInt() % 4 == 0 || (i * j).toInt() % 5 == 2) {
          canvas.drawRect(Rect.fromLTWH(i, j, 4, 4), pixelPaint);
        }
      }
    }
  }

  void _drawFinderPattern(Canvas canvas, double x, double y, Paint paint) {
    canvas.drawRect(Rect.fromLTWH(x, y, 18, 18), paint);
    canvas.drawRect(Rect.fromLTWH(x + 3, y + 3, 12, 12), Paint()..color = Colors.white);
    canvas.drawRect(Rect.fromLTWH(x + 6, y + 6, 6, 6), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

