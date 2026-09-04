import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_button.dart';
import '../../goverment_profile/view/goverment_profile_view.dart';
import '../controllers/government_dashboard_controller.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../widgets/custom_text_field.dart';

class GovernmentDashboardView extends GetView<GovernmentDashboardController> {
  const GovernmentDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final index = controller.selectedNavIndex.value;
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Column(
            children: [
              // Top Navigation Header
              index==4?SizedBox():
              _buildTopHeader(index),

              // Main Tab Content
              Expanded(
                child: IndexedStack(
                  index: index,
                  children: [
                    _buildHomeTab(),
                    _buildCampaignsTab(),
                    _buildEmergencyBroadcastTab(),
                    _buildAnalyticsTab(),
                    GovernmentProfileView(),
                    // _buildMoreTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: _buildBottomNav(),
      );
    });
  }

  Widget _buildTopHeader(int index) {
    String title = 'VMOVEXA';
    String subtitle = 'Government Portal';
    bool showActions = true;

    if (index == 1) {
      title = 'Campaigns';
      subtitle = 'Manage and monitor your government campaigns';
    } else if (index == 3) {
      title = 'Analytics';
      subtitle = 'Performance & Coverage Metrics';
    } else if (index == 4) {
      title = 'Portal Settings';
      subtitle = 'Manage preferences & account';
      showActions = false;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 12,
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                const Icon(
                  Icons.menu_rounded,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 10,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (showActions) ...[
            const SizedBox(width: 8),

            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: () => Get.toNamed(Routes.NOTIFICATIONS_LIST),
                  child: Stack(
                    children: [
                      const Icon(
                        Icons.notifications_outlined,
                        color: Colors.white,
                        size: 22,
                      ),
                      Positioned(
                        top: 1,
                        right: 1,
                        child: Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Image.asset('assets/icons/govermentHeader.png',width: 30,height: 30,)
                // Container(
                //   padding: const EdgeInsets.all(6),
                //   decoration: BoxDecoration(
                //     color: const Color(0xFF3B82F6).withOpacity(0.12),
                //     shape: BoxShape.circle,
                //     border: Border.all(
                //       color: const Color(0xFF3B82F6).withOpacity(0.3),
                //       width: 1.2,
                //     ),
                //   ),
                //   child: const Icon(
                //     Icons.gavel_rounded,
                //     color: Color(0xFF3B82F6),
                //     size: 16,
                //   ),
                // ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: HOME PORTAL
  // ==========================================
  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting & Date Card
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Good Morning, Rajat', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 2),
                  Text('Government Agency', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: const [
                  Text('12 May, 2025', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  SizedBox(height: 2),
                  Text('Monday', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Metrics Summary Row
          SizedBox(
            height: 140,
            child: ListView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              children: [
                _buildHomeMetricCard('12', 'Active Campaigns', '+2 this week', const Color(0xFF3B82F6),
                    "assets/icons/advertiser_ic/speaker.svg"),
                const SizedBox(width: 10),
                _buildHomeMetricCard('08', 'Scheduled Campaigns', '+1 this week',
                    const Color(0xFF8B5CF6),   "assets/icons/advertiser_ic/calender.svg"),
                const SizedBox(width: 10),
                _buildHomeMetricCard('84%', 'Live\nCoverage', '+6% this week',
                    const Color(0xFF10B981),    "assets/icons/lsicon_map.svg"),
                const SizedBox(width: 10),
                _buildHomeMetricCard('02', 'Active\nAlerts', 'Emergency', const Color(0xFFEF4444),
                    "assets/icons/AlertsNew.svg"),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Emergency Broadcast red banner
          _buildEmergencyBroadcastBanner(),
          const SizedBox(height: 20),

          // Live Communication Coverage Map
          const Text('Live Communication Coverage', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          _buildLiveCoverageMapCard(),
          const SizedBox(height: 24),

          // Recent Campaigns Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Campaigns', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              GestureDetector(
                onTap: () => controller.selectedNavIndex.value = 1,
                child: const Text('View All', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildRecentCampaignsList(),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHomeMetricCard(String val, String title, String sub, Color color, String icon) {
    return Container(
      width: 110,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(icon,width: 30,height: 30,),
          const SizedBox(height: 3),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(fontWeight:FontWeight.w500,color: Colors.white, fontSize: 11), maxLines: 2,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(sub, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildEmergencyBroadcastBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xF3d2e32),
        // color: const Color(0xFFEF4444).withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3), width: 1.2),
      ),
      child: Row(
        children: [
         SvgPicture.asset( "assets/icons/active-alert.svg"),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Emergency Broadcast',
                  style: TextStyle(color: Color(0xFFf7887e), fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Send immediate alerts to all or specific displays.',
                  style: TextStyle(color:Color(0xffa8a1a0), fontSize:11,fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xffFF5A1F),
                  Color(0xffF7332E),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: InkWell(
              onTap: () {
                Get.toNamed(
                  Routes.GOVERNMENT_CREATE_CAMPAIGN,
                  arguments: {'type': 'Emergency'},
                );
              },
              borderRadius: BorderRadius.circular(10),
              child: const Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Create Alert',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      color: Colors.white,
                      size: 8,
                    ),
                  ],
                ),
              ),
            ),
          ),
          /*   Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                  colors:[
                    Color(0xffFF5A1F),
                    Color(0xffF7332E),
                  ]),
            ),
            child: ElevatedButton(
              onPressed: () {
                Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN, arguments: {'type': 'Emergency'});
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                // backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              child: Row(
                children: const [
                  Text('Create Alert', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                  SizedBox(width: 4),
                  Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 8),
                ],
              ),
            ),
          ),*/
        ],
      ),
    );
  }

  Widget _buildLiveCoverageMapCard() {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Stack(
        children: [
          // Bhopal City Map Custom Painter representation
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: CustomPaint(
                painter: BhopalCoverageMapPainter(),
              ),
            ),
          ),
          // Stats overlays
          Positioned(
            top: 14,
            left: 14,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder, width: 1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildMapStatRow('assets/icons/fleet_operator_icons/fleetsManagedA2.svg', '248 Vehicles', 'Online', const Color(0xFF3B82F6)),
                  const SizedBox(height: 8),
                  _buildMapStatRow('assets/icons/advertiser_ic/tv.svg', '721 Displays', 'Online', const Color(0xFF10B981)),
                ],
              ),
            ),
          ),
          // City Name overlay
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.8),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF3B82F6), width: 1.2),
              ),
              child: const Text(
                'Bhopal',
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          // Map utilities (zoom and layers overlay controls)
          Positioned(
            bottom: 12,
            right: 12,
            child: Column(
              children: [
                _buildMapControlIcon(Icons.gps_fixed_rounded),
                const SizedBox(height: 6),
                _buildMapControlIcon(Icons.layers_outlined),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapStatRow(String icon, String val, String status, Color color) {
    return Row(
      children: [
       SvgPicture.asset(icon,width: 10,height: 10,),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(val, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            Text(status, style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildMapControlIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Icon(icon, color: Colors.white, size: 14),
    );
  }

  Widget _buildRecentCampaignsList() {
    final recentList = controller.campaigns.take(3).toList();
    return Column(
      children: recentList.map((c) => _buildGovCampaignItemCard(c)).toList(),
    );
  }

  // ==========================================
  // TAB 2: CAMPAIGNS LIST
  // ==========================================
  Widget _buildCampaignsTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Filter Tabs row
          _buildCampaignTabHeader(
            'Create Campaign',
            controller.createNewCampaign,
          ),
          const SizedBox(height: 14),

          // Overview cards row
          Row(
            children: [
              Expanded(child: _buildListStatCard(  "assets/icons/advertiser_ic/speaker.svg",'12', 'Active', const Color(0xFF3B82F6))),
              const SizedBox(width: 8),
              Expanded(child: _buildListStatCard("assets/icons/advertiser_ic/calender.svg",'08', 'Scheduled', const Color(0xFF8B5CF6))),
              const SizedBox(width: 8),
              Expanded(child: _buildListStatCard("assets/icons/completeNew.svg",'24', 'Completed', const Color(0xFF10B981))),
              const SizedBox(width: 8),
              Expanded(child: _buildListStatCard("assets/icons/infoNew.svg",'02', 'Emergency', const Color(0xFFEF4444))),
            ],
          ),
          const SizedBox(height: 16),

          // Search and Sort
          Row(
            children: [
              Expanded(
                child: Container(
                  // height: 40,
                  padding: const EdgeInsets.symmetric(horizontal: 12,vertical: 0),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.search_rounded, color: AppColors.textMuted, size: 16),
                      SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                           textAlign: TextAlign.left,
                          style: TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintTextDirection: TextDirection.ltr,
                            hintText: 'Search campaigns...',
                            hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 11),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                // height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12,vertical: 15),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: const [
                    Text('Sort by: Latest', style: TextStyle(color: Colors.white, fontSize: 10)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 14),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Categorized scrollable list
          Expanded(
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: [
                _buildListSectionTitle('Active Campaigns (12)'),
                _buildGovCampaignItemCard(controller.campaigns[0]),
                _buildGovCampaignItemCard(controller.campaigns[1]),
                _buildGovCampaignItemCard(controller.campaigns[2]),
                const SizedBox(height: 14),

                _buildListSectionTitle('Scheduled Campaigns (8)'),
                _buildGovCampaignItemCard(controller.campaigns[3]),
                const SizedBox(height: 14),

                _buildListSectionTitle('Emergency Campaigns (2)'),
                _buildGovCampaignItemCard(controller.campaigns[4]),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCampaignTabHeader(String btnText, VoidCallback onTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
         Text('Government Campaigns',
             style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        Container(
          width:135,
          height: 40,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF9333EA).withOpacity(0.25),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(14),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add, color: Colors.white, size: 14),
                      const SizedBox(width: 5),
                    Text(
                      btnText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        )
        // CustomButton(
        //   height: 40,
        //   width: 170,
        //   prefixIcon:  const Icon(Icons.add, color: Colors.white, size: 14),
        //   isGradient: true,
        //   text: btnText,
        //   onTap: onTap,
        // ),
        // ElevatedButton.icon(
        //   onPressed: onTap,
        //   style: ElevatedButton.styleFrom(
        //     backgroundColor: const Color(0xFF3B82F6),
        //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        //     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        //   ),
        //   icon: const Icon(Icons.add, color: Colors.white, size: 14),
        //   label: Text(btnText, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        // ),
      ],
    );
  }

  Widget _buildListStatCard(String icon,String val, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10,horizontal: 0),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(icon),
          Column(
            children: [
              Text(val, style: TextStyle(color: color, fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 8.5)),
            ],
          ),

        ],
      ),
    );
  }

  Widget _buildListSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          const Text('View All', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildGovCampaignItemCard(GovCampaign c) {
    final isEmergency = c.type == 'Emergency';
    return GestureDetector(
      onTap: () => Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: c),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left Image
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  image: DecorationImage(
                    image: NetworkImage(c.imagePath),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Middle info
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
                            color: isEmergency ? const Color(0xFFEF4444).withOpacity(0.12) : const Color(0xFF3B82F6).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            c.type.toUpperCase(),
                            style: TextStyle(
                              color: isEmergency ? const Color(0xFFEF4444) : const Color(0xFF3B82F6),
                              fontSize: 7,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                     SvgPicture.asset('assets/icons/calendar.svg',width: 12,height: 12,),
                        const SizedBox(width: 6),
                        Text(c.dates, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        SvgPicture.asset('assets/icons/location.svg',width: 12,height: 12,),
                        const SizedBox(width: 6),
                        Text(c.locations, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),

          // Bottom coverage & reach stats
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Text('Coverage: ', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    Text('${c.coverage}%', style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: c.coverage / 100,
                          backgroundColor: const Color(0xFF1E293B),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                          minHeight: 3.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 20),
              Row(
                children: [
                  const Text('Reach: ', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  Text('${c.reach} Displays', style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

  // ==========================================
  // TAB 3: EMERGENCY BROADCAST
  // ==========================================
  Widget _buildEmergencyBroadcastTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sub bar header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Emergency Broadcast', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.history_rounded, color: AppColors.textSecondary, size: 12),
                    SizedBox(width: 4),
                    Text('Broadcast History', style: TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // EMERGENCY ALERT red glow banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFEF4444).withOpacity(0.15),
                  const Color(0xFFEF4444).withOpacity(0.04),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4), width: 1.5),
            ),
            child: Row(
              children: [
                // Container(
                //   padding: const EdgeInsets.all(10),
                //   decoration: BoxDecoration(
                //     color: const Color(0xFFEF4444).withOpacity(0.2),
                //     shape: BoxShape.circle,
                //     boxShadow: [
                //       BoxShadow(
                //         color: const Color(0xFFEF4444).withOpacity(0.3),
                //         blurRadius: 8,
                //         spreadRadius: 1,
                //       ),
                //     ],
                //   ),
                //   child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
                // ),
                SvgPicture.asset("assets/icons/active-alert.svg",width: 35,height: 35,),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'EMERGENCY ALERT',
                        style: TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'This message will be sent immediately to the selected vehicles and displays.',
                        style: TextStyle(color: Colors.white, fontSize:11, height: 1.3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Alert Message Text Area
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                 SvgPicture.asset('assets/icons/fleet_operator_icons/smsNotificationA.svg',color: Color(0xfff74317),),
                  SizedBox(width: 10,),
                  Text('Alert Message', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              Text('132/500', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
            ],
          ),
          const SizedBox(height: 8),
          CustomTextField(
            hintText: 'Enter alert message...',
            controller: controller.alertMessageController,
            maxLines: 3,
          ),
          const SizedBox(height: 18),

          // Severity Level Grid Selection
          Row(
            children: [
              SvgPicture.asset('assets/icons/fleet_operator_icons/securityA.svg',color: Color(0xfff74317),),
              SizedBox(width: 10,),
              const Text('Severity Level', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Obx(() {
            final severity = controller.selectedSeverity.value;
            return GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 4,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 1.1,
              children: [
                _buildSeverityItem('Critical', 'High Impact', "assets/icons/critical.svg", const Color(0xFFEF4444), severity == 'Critical'),
                _buildSeverityItem('High', 'Important', "assets/icons/high.svg", const Color(0xFFF59E0B), severity == 'High'),
                _buildSeverityItem('Medium', 'Moderate', "assets/icons/medium.svg", const Color(0xFFEAB308), severity == 'Medium'),
                _buildSeverityItem('Low', 'General Info',"assets/icons/low.svg", const Color(0xFF3B82F6), severity == 'Low'),
              ],
            );
          }),
          const SizedBox(height: 18),

          // Target Area row
          Row(
            children: [
              SvgPicture.asset('assets/icons/location.svg',width: 25,height: 25,),
              SizedBox(width: 10,),
              const Text('Target Area', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Color(0xff5e3ea2), width: 1.2),
            ),
            child: Row(
              children: [
                SvgPicture.asset('assets/icons/location.svg',width: 25,height: 25,),
                // Container(
                //   padding: const EdgeInsets.all(8),
                //   decoration: BoxDecoration(
                //     color: const Color(0xFF8B5CF6).withOpacity(0.08),
                //     shape: BoxShape.circle,
                //   ),
                //   child: const Icon(Icons.location_on_rounded, color: Color(0xFF8B5CF6), size: 14),
                // ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Bhopal Region', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text('48°24\'N 11°30\'E', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Broadcast To checklist
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
               Row(
                 children: [
                   SvgPicture.asset('assets/icons/tower.svg',width: 25,height: 25,),
                   SizedBox(width: 10,),
                   Text('Broadcast To', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                 ],
               ),
              Row(
                children: [
                  const Text('Select All', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                  const SizedBox(width: 4),
                  Checkbox(
                    value: true,
                    onChanged: (val) {},
                    activeColor: const Color(0xFF3B82F6),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() => Column(
            children: [
              _buildBroadcastToRow('All Vehicles', '248 Vehicles', 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg', const Color(0xFF3B82F6), controller.broadcastToVehicles.value, (val) => controller.broadcastToVehicles.value = val ?? false),
              const SizedBox(height: 8),
              _buildBroadcastToRow('All Displays', '721 Displays','assets/icons/advertiser_ic/tv.svg', const Color(0xFF10B981), controller.broadcastToDisplays.value, (val) => controller.broadcastToDisplays.value = val ?? false),
            ],
          )),
          const SizedBox(height: 18),

          // Push Notifications toggle
          Obx(() => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children:  [
                 SvgPicture.asset('assets/icons/fleet_operator_icons/notification.svg',width: 18,height: 18,),
                    SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Send Push Notification', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('Notify user app with this alert', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
                      ],
                    ),
                  ],
                ),
                Switch(
                  value: controller.sendPushNotification.value,
                  onChanged: (val) => controller.sendPushNotification.value = val,
                  activeTrackColor: const Color(0xFFFF6A00),
                  activeThumbColor: Colors.white,
                  inactiveTrackColor: Colors.grey.shade300,
                  inactiveThumbColor: Colors.white,
                  trackOutlineColor: WidgetStateProperty.all(Colors.transparent),

                ),
              ],
            ),
          )),
          const SizedBox(height: 12),

          // Auto Expire Alert selector
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children:  [
                    SvgPicture.asset('assets/icons/clock.svg',width: 18,height: 18,),
                    SizedBox(width: 12),
                    Text('Auto Expire Alert', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                Row(
                  children: [
                    Obx(() => Text(controller.autoExpireAlert.value, style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold))),
                    const SizedBox(width: 4),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Broadcast button
          Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFB91C1C)]),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEF4444).withOpacity(0.3),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: ElevatedButton.icon(
              onPressed: controller.broadcastEmergencyAlert,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 25),
              label: const Text('BROADCAST NOW', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
            ),
          ),
          const SizedBox(height: 8),
          const Center(
            child: Text(
              '🔒 This action cannot be undone',
              style: TextStyle(color: AppColors.textMuted, fontSize: 8.5),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSeverityItem(String title, String subtitle, String icon, Color color, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.selectedSeverity.value = title,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.08) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? color : AppColors.cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(icon),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 7), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _buildBroadcastToRow(String title, String count, String icon, Color color, bool value, ValueChanged<bool?> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          SvgPicture.asset(icon),
          // Container(
          //   padding: const EdgeInsets.all(6),
          //   decoration: BoxDecoration(
          //     color: color.withOpacity(0.08),
          //     shape: BoxShape.circle,
          //   ),
          //   child: Icon(icon, color: color, size: 14),
          // ),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                Text(count, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: color,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 4: ANALYTICS DASHBOARD
  // ==========================================
  Widget _buildAnalyticsTab() {
    return Obx(() {
      final isQrTab = controller.selectedAnalyticsSubTab.value == 'QR Analytics';

      return SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date Selector and Sub-tabs Header (Image 5 style)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    _buildSubTabHeaderButton('Overview', !isQrTab),
                    const SizedBox(width: 14),
                    _buildSubTabHeaderButton('QR Analytics', isQrTab, hasNewBadge: true),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder, width: 1.2),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.calendar_today_rounded, color: Colors.white, size: 11),
                      SizedBox(width: 6),
                      Text('12 May – 20 May 2025', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      SizedBox(width: 4),
                      Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 12),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Toggleable Tab Content
            if (!isQrTab) ...[
              // Overview Metric Counters Grid
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 0.65,
                children: [
                  _buildAnalyticsGridCell('Total Campaigns', '24', '↑ 12.5%', const Color(0xFF3B82F6),
                      "assets/icons/advertiser_ic/speaker.svg"),
                  _buildAnalyticsGridCell('Total Displays', '721', '↑ 8.7%', const Color(0xFF10B981),
                      "assets/icons/advertiser_ic/tv.svg"),
                  _buildAnalyticsGridCell('Total Vehicles', '248', '↑ 6.3%', const Color(0xFF8B5CF6),
                      "assets/icons/fleet_operator_icons/car.svg"),
                  _buildAnalyticsGridCell('Average Reach', '84%', '↑ 9.1%', const Color(0xFFF59E0B),
                      "assets/icons/advertiser_ic/eye.svg"),
                ],
              ),
              const SizedBox(height: 18),

              // Performance Overview Chart Card
              _buildPerformanceOverviewChartCard(),
              const SizedBox(height: 18),

              // Campaign Status Donut Card
              _buildCampaignStatusDonutCard(),
              const SizedBox(height: 18),

              // Top Performing Campaigns
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Top Performing Campaigns', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text('View All', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              _buildTopPerformingList(),
              const SizedBox(height: 20),
            ] else ...[
              // QR Analytics Widgets (Image 5)

              // QR Overview metrics grid
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 0.65,
                children: [
                  _buildAnalyticsGridCell('Total QR Scans', '18,642', '↑ 18.4%', const Color(0xFF10B981),
                      "assets/icons/fleet_operator_icons/qr-code-scan.svg"),
                  _buildAnalyticsGridCell('Unique Scans', '12,389', '↑ 15.2%', const Color(0xFF3B82F6),
                      "assets/icons/fleet_operator_icons/infoSharingA.svg"),
                  _buildAnalyticsGridCell('Avg. Scans/Day', '2,663', '↑ 10.1%', const Color(0xFFF59E0B),
                      "assets/icons/advertiser_ic/qrAnalytics.svg"),
                  _buildAnalyticsGridCell('Scan\nRate', '2.35%', '↑ 10.1%', const Color(0xFF8B5CF6),
                      "assets/icons/advertiser_ic/paymentTermsA.svg"),
                ],
              ),
              const SizedBox(height: 18),

              // QR Scans by Campaigns Progress List
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
                        const Text('QR Scans by Campaigns', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                        _buildMiniDropdown('Total Scans'),
                      ],
                    ),
                    const SizedBox(height: 14),
                    _buildQrScansRankingItem(1, 'Road Safety Awareness', '4,512', 24.2, const Color(0xFF8B5CF6)),
                    _buildQrScansRankingItem(2, 'Monsoon Preparedness', '3,856', 20.7, const Color(0xFF3B82F6)),
                    _buildQrScansRankingItem(3, 'Clean City Initiative', '2,941', 15.8, const Color(0xFF10B981)),
                    _buildQrScansRankingItem(4, 'Dengue Prevention Drive', '2,678', 14.4, const Color(0xFFF59E0B)),
                    _buildQrScansRankingItem(5, 'Traffic Rules Matter', '1,987', 10.7, const Color(0xFF8B5CF6)),
                    _buildQrScansRankingItem(6, 'Electric Mobility Drive', '1,245', 6.7, const Color(0xFF3B82F6)),
                    _buildQrScansRankingItem(7, 'General Health Tips', '823', 4.4, const Color(0xFF10B981)),
                    _buildQrScansRankingItem(8, 'Women Safety Campaign', '600', 3.2, const Color(0xFFF59E0B)),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Two Column charts: QR Scans Trend (Line) & QR Scans by Device Type (Donut)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Container(
                      height: 220,
                      padding: const EdgeInsets.all(12),
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
                              const Text('QR Scans Trend', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              _buildMiniDropdown('Daily'),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              _buildChartLegendItem('Total', const Color(0xFF3B82F6)),
                              const SizedBox(width: 6),
                              _buildChartLegendItem('Unique', const Color(0xFF10B981)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Expanded(
                            child: CustomPaint(
                              painter: GovAnalyticsQrTrendPainter(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      height: 220,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cardBorder, width: 1.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('QR Scans by Device Type', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 14),
                          Expanded(
                            child: Row(
                              children: [
                                Expanded(
                                  child: CustomPaint(
                                    painter: GovAnalyticsQrDeviceDonutPainter(),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildDeviceLegendItem('Mobile', '78%', const Color(0xFF3B82F6)),
                                    const SizedBox(height: 4),
                                    _buildDeviceLegendItem('Desktop', '12%', const Color(0xFF10B981)),
                                    const SizedBox(height: 4),
                                    _buildDeviceLegendItem('Tablet', '6%', const Color(0xFFF59E0B)),
                                    const SizedBox(height: 4),
                                    _buildDeviceLegendItem('Others', '4%', const Color(0xFF8B5CF6)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Bottom Insight Banner Card
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.2), width: 1),
                ),
                child: Row(
                  children: [
                   SvgPicture.asset('assets/icons/light.svg',width: 25,height: 25,),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Insight',
                            style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Road Safety Awareness campaign has the highest QR scans contributing 24.2% of total scans.',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        // Switch to QR Analytics sub tab of Road Safety Details
                        controller.selectedNavIndex.value = 1; // go to campaigns tab list
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6).withOpacity(0.12),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('View Qr Analytics', style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ],
        ),
      );
    });
  }

  Widget _buildSubTabHeaderButton(String label, bool isSelected, {bool hasNewBadge = false}) {
    return GestureDetector(
      onTap: () => controller.selectedAnalyticsSubTab.value = label,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isSelected ? const Color(0xFF3B82F6) : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textMuted,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (hasNewBadge) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                decoration: BoxDecoration(
                  color: const Color(0xFFEC4899),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'NEW',
                  style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQrScansRankingItem(int rank, String title, String scans, double percentage, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Text('$rank', style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: percentage / 100,
                    backgroundColor: Colors.black26,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                    minHeight: 3.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(scans, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              Text('${percentage.toStringAsFixed(1)}%', style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceLegendItem(String name, String percentage, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
        const SizedBox(width: 6),
        Text(percentage, style: const TextStyle(color: Colors.white, fontSize: 7.5, fontWeight: FontWeight.bold)),
      ],
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

  Widget _buildAnalyticsGridCell(String title, String val, String percentage, Color color, String icon) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.cardBorder,
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          title=='Scan Rate'|| title=='Unique Scans'?
        SvgPicture.asset(icon,width: 25,height: 25,):
        SvgPicture.asset(icon,width: 21,height: 21,),
          const SizedBox(height: 5),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              height: 1,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          const SizedBox(height: 5),

          Text(
            val,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
              height: 1,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),

          const SizedBox(height: 5),

          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                percentage,
                style: TextStyle(
                  color: color,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  height: 1,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              // const SizedBox(width: 2),
              // Flexible(
              //   child: Text(
              //     'vs last 7d',
              //     style: const TextStyle(
              //       color: Colors.white,
              //       fontSize: 6,
              //       height: 1,
              //     ),
              //     maxLines: 1,
              //     overflow: TextOverflow.ellipsis,
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            'vs last 7d',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 9,
              height: 1,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceOverviewChartCard() {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Text('Performance Overview', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                  SizedBox(width: 4),
                  Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 11),
                ],
              ),
              Row(
                children: [
                  _buildChartLegendItem('Displays', const Color(0xFF3B82F6)),
                  const SizedBox(width: 10),
                  _buildChartLegendItem('Reach', const Color(0xFF10B981)),
                  const SizedBox(width: 10),
                  _buildChartLegendItem('Impressions', const Color(0xFF8B5CF6)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Custom chart painter
          SizedBox(
            height: 180,
            width: double.infinity,
            child: CustomPaint(
              painter: GovAnalyticsChartPainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 8)),
      ],
    );
  }

  Widget _buildCampaignStatusDonutCard() {
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
          const Text('Campaign Status', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),
          Row(
            children: [
              // Donut chart representation
              SizedBox(
                width: 100,
                height: 100,
                child: CustomPaint(
                  painter: GovCampaignDonutPainter(),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text('24', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        Text('Total', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 28),

              // Legend table
              Expanded(
                child: Column(
                  children: [
                    _buildDonutLegendRow('Active', '14 (58%)', const Color(0xFF10B981)),
                    const SizedBox(height: 8),
                    _buildDonutLegendRow('Scheduled', '6 (25%)', const Color(0xFFF59E0B)),
                    const SizedBox(height: 8),
                    _buildDonutLegendRow('Completed', '3 (12%)', const Color(0xFF3B82F6)),
                    const SizedBox(height: 8),
                    _buildDonutLegendRow('Paused', '1 (4%)', const Color(0xFF64748B)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDonutLegendRow(String status, String details, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(width: 7, height: 7, color: color),
            const SizedBox(width: 8),
            Text(status, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
          ],
        ),
        Text(details, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildTopPerformingList() {
    final List<Map<String, dynamic>> items = [
      {'rank': '1', 'name': 'Road Safety Awareness', 'reach': '92%', 'inc': '12%', 'img': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200'},
      {'rank': '2', 'name': 'Monsoon Preparedness', 'reach': '88%', 'inc': '8%', 'img': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200'},
      {'rank': '3', 'name': 'Clean City Initiative', 'reach': '76%', 'inc': '6%', 'img': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=200'},
      {'rank': '4', 'name': 'Dengue Prevention Drive', 'reach': '71%', 'inc': '5%', 'img': 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=200'},
    ];

    return Column(
      children: items.map((i) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder, width: 1),
          ),
          child: Row(
            children: [
              Text(i['rank'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(width: 12),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  image: DecorationImage(image: NetworkImage(i['img'] as String), fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(i['name'] as String, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Reach ${i['reach']}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                  const SizedBox(height: 2),
                  Text('↑ ${i['inc']}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // ==========================================
  // TAB 4: MORE PREFERENCES
  // ==========================================
  Widget _buildMoreTab() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      physics: const BouncingScrollPhysics(),
      children: [
        const SizedBox(height: 10),
        _buildSettingsHeader(),
        const SizedBox(height: 20),
        _buildSettingsItem('Account Info', Icons.person_outline_rounded, 'Rajat, Government Agency'),
        _buildSettingsItem('Target Settings', Icons.gps_fixed_rounded, 'Bhopal Region Default'),
        _buildSettingsItem('Emergency Parameters', Icons.warning_amber_rounded, 'Critical Alert triggers'),
        _buildSettingsItem('Help & Support', Icons.help_outline_rounded, 'Submit ticketing or queries'),
        const SizedBox(height: 32),
        OutlinedButton.icon(
          onPressed: () => Get.offAllNamed(Routes.LOGIN),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Color(0xFFEF4444)),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 16),
          label: const Text('Logout Portal', style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildSettingsHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF3B82F6).withOpacity(0.12),
            child: const Icon(Icons.gavel_rounded, color: Color(0xFF3B82F6), size: 24),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Rajat Shrivastava', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('rajat@government.gov.in', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem(String label, IconData icon, String detail) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF3B82F6), size: 16),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(detail, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
        ],
      ),
    );
  }

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
            onTap: () => controller.updateNavIndex(2),
            // child: Container(
            //   width: 52,
            //   height: 52,
            //   margin: const EdgeInsets.only(bottom: 8, top: 4),
            //   decoration: BoxDecoration(
            //     color: const Color(0xFFEF4444),
            //     shape: BoxShape.circle,
            //     boxShadow: [
            //       BoxShadow(
            //         color: const Color(0xFFEF4444).withOpacity(0.4),
            //         blurRadius: 12,
            //         spreadRadius: 2,
            //       ),
            //     ],
            //   ),
            //   child: const Center(
            //     child: Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
            //   ),
            // ),
            child: SvgPicture.asset('assets/icons/emergencyBottom.svg',width: 55
              ,height: 55,),
          ),
          _buildNavItem(3, Icons.analytics_rounded, 'Analytics'),
          _buildNavItem(4, Icons.person, 'Profile'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int idx, IconData icon, String label) {
    final isSelected = controller.selectedNavIndex.value == idx;
    final color = isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted;
    return GestureDetector(
      onTap: () => controller.updateNavIndex(idx),
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

class GovCampaignDonutPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.width / 2;
    final center = Offset(radius, radius);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    double startAngle = -3.14 / 2;

    // Active (58%)
    paint.color = const Color(0xFF10B981);
    double sweepAngle = 2 * 3.1415 * 0.58;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - 6), startAngle, sweepAngle, false, paint);
    startAngle += sweepAngle;

    // Scheduled (25%)
    paint.color = const Color(0xFFF59E0B);
    sweepAngle = 2 * 3.1415 * 0.25;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - 6), startAngle, sweepAngle, false, paint);
    startAngle += sweepAngle;

    // Completed (12%)
    paint.color = const Color(0xFF3B82F6);
    sweepAngle = 2 * 3.1415 * 0.12;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - 6), startAngle, sweepAngle, false, paint);
    startAngle += sweepAngle;

    // Paused (5%)
    paint.color = const Color(0xFF64748B);
    sweepAngle = 2 * 3.1415 * 0.05;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius - 6), startAngle, sweepAngle, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class GovAnalyticsChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double chartHeight = size.height - 30;
    final double chartWidth = size.width - 40;

    // Grid Lines and Labels
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    // Y Axis indicators
    for (int i = 0; i <= 4; i++) {
      final y = chartHeight - (i * chartHeight / 4) + 10;
      canvas.drawLine(Offset(25, y), Offset(size.width, y), gridPaint);

      // Y Labels (e.g. 0, 250, 500, 750, 1K)
      final textPainter = TextPainter(
        text: TextSpan(
          text: i == 0 ? '0' : (i == 4 ? '1K' : '${i * 250}'),
          style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(5, y - 5));
    }

    // X Axis Dates: 12 May to 20 May (9 points)
    final List<String> dates = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May', '20 May'];
    final double stepX = chartWidth / (dates.length - 1);

    for (int i = 0; i < dates.length; i++) {
      final x = 30 + (i * stepX);
      final textPainter = TextPainter(
        text: TextSpan(
          text: dates[i],
          style: const TextStyle(color: AppColors.textMuted, fontSize: 7),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(x - 12, chartHeight + 16));
    }

    // Data lists mapping blue, green, and purple lines
    final List<double> displaysData = [400, 470, 600, 480, 560, 700, 680, 900];
    final List<double> reachData = [270, 310, 460, 330, 370, 560, 530, 730];
    final List<double> impressionsData = [140, 150, 290, 170, 260, 400, 350, 550];

    void drawLine(List<double> data, Color color) {
      final path = Path();
      final linePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      final pointPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      for (int i = 0; i < data.length; i++) {
        final x = 30 + (i * stepX);
        final y = chartHeight - (data[i] / 1000 * chartHeight) + 10;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3, pointPaint);
      }
      canvas.drawPath(path, linePaint);
    }

    drawLine(displaysData, const Color(0xFF3B82F6));
    drawLine(reachData, const Color(0xFF10B981));
    drawLine(impressionsData, const Color(0xFF8B5CF6));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class BhopalCoverageMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Custom painted stylized dark grid mapping representing a coverage map
    final paint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);

    // Bhopal lake shape representation
    final lakePaint = Paint()
      ..color = const Color(0xFF1D4ED8).withOpacity(0.2)
      ..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(size.width * 0.3, size.height * 0.4)
      ..quadraticBezierTo(size.width * 0.5, size.height * 0.3, size.width * 0.65, size.height * 0.5)
      ..quadraticBezierTo(size.width * 0.5, size.height * 0.7, size.width * 0.3, size.height * 0.6)
      ..close();
    canvas.drawPath(path, lakePaint);

    // Map street grids lines representing street paths
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    for (double i = 0; i < size.width; i += 30) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double j = 0; j < size.height; j += 30) {
      canvas.drawLine(Offset(0, j), Offset(size.width, j), gridPaint);
    }

    // Bus tracking dots representation (live green and blue markers)
    void drawTrackingMarker(double x, double y, Color color) {
      canvas.drawCircle(Offset(x, y), 6, Paint()..color = color.withOpacity(0.2));
      canvas.drawCircle(Offset(x, y), 3, Paint()..color = color);
    }

    drawTrackingMarker(size.width * 0.25, size.height * 0.35, const Color(0xFF3B82F6));
    drawTrackingMarker(size.width * 0.45, size.height * 0.48, const Color(0xFF10B981));
    drawTrackingMarker(size.width * 0.68, size.height * 0.32, const Color(0xFF3B82F6));
    drawTrackingMarker(size.width * 0.52, size.height * 0.72, const Color(0xFF10B981));
    drawTrackingMarker(size.width * 0.78, size.height * 0.65, const Color(0xFF3B82F6));
    drawTrackingMarker(size.width * 0.32, size.height * 0.82, const Color(0xFF10B981));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class GovAnalyticsQrTrendPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double chartHeight = size.height - 20;
    final double chartWidth = size.width - 20;

    final List<String> dates = ['12 May', '14 May', '16 May', '18 May', '20 May'];
    final double stepX = chartWidth / (dates.length - 1);

    // Total scans: 2K, 3.8K, 3K, 4.5K, 6.5K
    final List<double> total = [2000, 3800, 3000, 4500, 6500];
    // Unique scans: 1.2K, 2.2K, 1.8K, 2.8K, 4.2K
    final List<double> unique = [1200, 2200, 1800, 2800, 4200];

    // Grid horizontal lines
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = chartHeight - (i * chartHeight / 4) + 6;
      canvas.drawLine(Offset(10, y), Offset(size.width, y), gridPaint);
    }

    void drawLine(List<double> data, Color color) {
      final path = Path();
      final linePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      final pointPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      for (int i = 0; i < data.length; i++) {
        final x = 12 + (i * stepX);
        final y = chartHeight - (data[i] / 8000 * chartHeight) + 6;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3.5, pointPaint);
      }
      canvas.drawPath(path, linePaint);
    }

    drawLine(total, const Color(0xFF3B82F6));
    drawLine(unique, const Color(0xFF10B981));

    // X-Axis labels
    for (int i = 0; i < dates.length; i++) {
      final x = 12 + (i * stepX);
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

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class GovAnalyticsQrDeviceDonutPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2.2;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    double startAngle = -3.14159 / 2;

    void drawSegment(double percentage, Color color) {
      final sweepAngle = (percentage / 100) * 2 * 3.14159;
      paint.color = color;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      startAngle += sweepAngle;
    }

    drawSegment(78, const Color(0xFF3B82F6));
    drawSegment(12, const Color(0xFF10B981));
    drawSegment(6, const Color(0xFFF59E0B));
    drawSegment(4, const Color(0xFF8B5CF6));

    // Middle text "18,642 Total"
    final countPainter = TextPainter(
      text: const TextSpan(
        text: '18,642\nTotal',
        style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold, height: 1.2),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();
    countPainter.paint(canvas, Offset(center.dx - countPainter.width / 2, center.dy - countPainter.height / 2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

