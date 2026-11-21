import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:latlong2/latlong.dart' hide Path;
import '../../../../../theme/app_theme.dart';
import '../../goverment_profile/view/goverment_profile_view.dart';
import '../controllers/government_dashboard_controller.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../routes/app_routes.dart';
import '../widgets/gov_side_drawer.dart';
import 'gov_create_emergency_view.dart';
import 'gov_emergency_details_sheet.dart';

class GovernmentDashboardView extends GetView<GovernmentDashboardController> {
  const GovernmentDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final index = controller.selectedNavIndex.value;
      return Scaffold(
        backgroundColor: AppColors.background,
        drawer: const GovSideDrawer(),
        body: Builder(
          builder: (scaffoldContext) {
            return SafeArea(
              child: Column(
                children: [
                  // Top Navigation Header
                  index == 4 || index == 3 || index == 1 || index == 2 ? const SizedBox() : _buildTopHeader(scaffoldContext, index),

                  // Main Tab Content
                  Expanded(
                    child: IndexedStack(
                      index: index,
                      children: [
                        _buildHomeTab(),
                        _buildCampaignsTab(),
                        _buildEmergencyBroadcastTab(),
                        _buildAnalyticsTab(scaffoldContext),
                        GovernmentProfileView(),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        bottomNavigationBar: SafeArea(
          top: false,
          child: _buildBottomNav(),
        ),
        // bottomNavigationBar: _buildBottomNav(),
      );
    });
  }

  Widget _buildTopHeader(BuildContext context, int index) {
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

    return
    index ==0?
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
          Image.asset('assets/app_logo/newLogo.png',width: 150,height: 40,),
          // const AppLogoHeader(height: 38),
          Row(
            children: [
              // Notification Bell with Badge count 5
              if (showActions) ...[
                const SizedBox(width: 8),

                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Obx(() {
                      final count = controller.unreadNotificationCount.value;
                      return GestureDetector(
                        onTap: () async {
                          await Get.toNamed(Routes.NOTIFICATIONS_LIST);
                          controller.fetchUnreadNotificationCount();
                        },
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            const Icon(
                              Icons.notifications_outlined,
                              color: Colors.white,
                              size: 22,
                            ),
                            if (count > 0)
                              Positioned(
                                top: -4,
                                right: -4,
                                child: Container(
                                  constraints: const BoxConstraints(
                                    minWidth: 16,
                                    minHeight: 16,
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEF4444),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: const Color(0xFF0F172A),
                                      width: 1.5,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.35),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: Text(
                                      count > 99 ? '99+' : (count > 9 ? '9+' : '$count'),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 8.5,
                                        fontWeight: FontWeight.bold,
                                        height: 1.0,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(width: 10),
                    Image.asset('assets/icons/govermentHeader.png',width: 30,height: 30,)
                  ],
                ),
              ],
            ],
          ),
        ],
      ),
    )
        :

      Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 12,
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.menu_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => Scaffold.of(context).openDrawer(),
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
                Obx(() {
                  final count = controller.unreadNotificationCount.value;
                  return GestureDetector(
                    onTap: () async {
                      await Get.toNamed(Routes.NOTIFICATIONS_LIST);
                      controller.fetchUnreadNotificationCount();
                    },
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(
                          Icons.notifications_outlined,
                          color: Colors.white,
                          size: 22,
                        ),
                        if (count > 0)
                          Positioned(
                            top: -4,
                            right: -4,
                            child: Container(
                              constraints: const BoxConstraints(
                                minWidth: 16,
                                minHeight: 16,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEF4444),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: const Color(0xFF0F172A),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.35),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  count > 99 ? '99+' : (count > 9 ? '9+' : '$count'),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.bold,
                                    height: 1.0,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                }),
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
    return RefreshIndicator(
      onRefresh: controller.onRefresh,
      color: const Color(0xFF3B82F6),
      backgroundColor: AppColors.cardBg,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),

            // 1. Header Banner & Quick Actions
            _buildGovHeaderCard(),
            const SizedBox(height: 16),

            // 2. Real 4 KPI Cards (2x2 Grid)
            _buildRealKpiGrid(),
            const SizedBox(height: 16),

            // 3. Emergency Hero Box (Channel Title & Override Dispatch)
            _buildEmergencyHeroCard(),
            const SizedBox(height: 16),

            // 4. Live Transit Coverage (Google Maps via FlutterMap)
            _buildLiveCoverageMapCard(),
            const SizedBox(height: 16),

            // 5. Recent Broadcast Campaigns (List Format)
            _buildRecentBroadcastCampaignsCard(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // 1. Header Banner & Quick Actions
  Widget _buildGovHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Official State Agency Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFF3B82F6),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'official_state_agency'.tr,
                  style: const TextStyle(
                    color: Color(0xFF60A5FA),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Title
          Text(
            '${controller.officerName} ${'public_transit_communication_console'.tr}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 4),

          // Subtitle
          Text(
            'monitor_and_manage_state_public_welfare_camp'.tr,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 14),

          // Action Buttons Row (Refresh, Emergency Alert, Create Campaign)
          Row(
            children: [
              // Refresh Button
              Obx(() => InkWell(
                onTap: controller.isLoading.value ? null : () => controller.loadDashboardData(),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  height: 36,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1.2),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      controller.isLoading.value
                          ? const SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.refresh_rounded, size: 14, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        'refresh'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              )),
              const SizedBox(width: 8),

              // Emergency Alert Button
              Expanded(
                child: InkWell(
                  onTap: () => controller.selectedNavIndex.value = 2,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4), width: 1.2),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.warning_amber_rounded, size: 14, color: Color(0xFFEF4444)),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            'emergency_alert'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFFEF4444),
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Create Campaign Button (Primary Gradient)
              Expanded(
                child: InkWell(
                  onTap: controller.createNewCampaign,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_rounded, size: 15, color: Colors.white),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            'create_campaign'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Real 4 KPI Cards (2x2 Grid)
  Widget _buildRealKpiGrid() {
    return Obx(() {
      final active = controller.kpiActiveCampaignsCount;
      final scheduled = controller.kpiScheduledCampaignsCount;
      final onlineVehicles = controller.kpiVehiclesWithGpsCount;
      final broadcasting = controller.kpiBroadcastingVehiclesCount;
      final totalVehicles = controller.kpiTotalVehiclesCount;
      final alerts = controller.kpiEmergencyAlertsCount;

      return Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildRealKpiCard(
                  title: 'active_campaigns'.tr,
                  val: '$active',
                  sub: 'live_screens'.tr,
                  icon: Icons.flag_rounded,
                  color: const Color(0xFFF59E0B),
                  onTap: () => controller.selectedNavIndex.value = 1,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildRealKpiCard(
                  title: 'pending_scheduled'.tr,
                  val: '$scheduled',
                  sub: 'awaiting_approval_admin'.tr,
                  icon: Icons.access_time_rounded,
                  color: const Color(0xFF0284C7),
                  onTap: () => controller.selectedNavIndex.value = 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildRealKpiCard(
                  title: 'vehicles_gps'.tr,
                  val: '$onlineVehicles',
                  sub: '$broadcasting ${'broadcasting_label'.tr} · $totalVehicles ${'total_label'.tr}',
                  icon: Icons.gps_fixed_rounded,
                  color: const Color(0xFF10B981),
                  onTap: () => Get.toNamed(Routes.LIVE_TRACKING),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildRealKpiCard(
                  title: 'active_alerts'.tr,
                  val: '$alerts',
                  sub: 'active_alerts_sub'.tr,
                  icon: Icons.notifications_active_rounded,
                  color: const Color(0xFFEF4444),
                  isAlert: true,
                  onTap: () => controller.selectedNavIndex.value = 2,
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  Widget _buildRealKpiCard({
    required String title,
    required String val,
    required String sub,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    bool isAlert = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 118,
        padding: const EdgeInsets.all(12),
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
                    title.toUpperCase(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: isAlert ? const Color(0xFFEF4444) : AppColors.textSecondary,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: color.withValues(alpha: 0.25), width: 1),
                  ),
                  child: Center(
                    child: Icon(icon, size: 14, color: color),
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  val,
                  style: TextStyle(
                    color: isAlert ? const Color(0xFFEF4444) : Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  sub,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: isAlert ? const Color(0xFFEF4444).withValues(alpha: 0.85) : AppColors.textMuted,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 3. Emergency Hero Box
  Widget _buildEmergencyHeroCard() {
    return Obx(() {
      final active = controller.activeAlert.value;

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1719),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.35), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFEF4444).withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // If active alert exists, show active banner
            if (active != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEF4444),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${'active_critical_alert'.tr}: ${active.displaySeverity}',
                      style: const TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3), width: 1),
                  ),
                  child: const Center(
                    child: Icon(Icons.warning_amber_rounded, size: 22, color: Color(0xFFEF4444)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'channel_title'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'submit_high_priority_override_alerts_super_a'.tr,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10.5,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Dispatch Alert Action Button
            InkWell(
              onTap: () => controller.selectedNavIndex.value = 2,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFDC2626), Color(0xFFB91C1C)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFDC2626).withValues(alpha: 0.25),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'dispatch_alert'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.white),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // 4. Live Communication Coverage Map
  Widget _buildLiveCoverageMapCard() {
    return Obx(() {
      final vehicles = controller.liveTracking.value.vehicles;
      final withGpsList = vehicles.where((v) => v.lat != null && v.lng != null).toList();
      final hasGps = withGpsList.isNotEmpty;

      final centerLat = hasGps ? withGpsList.first.lat! : 23.2380;
      final centerLng = hasGps ? withGpsList.first.lng! : 77.4180;

      final markers = withGpsList.map((v) {
        final color = v.screenStatus == 'Broadcasting'
            ? const Color(0xFF10B981)
            : (v.screenStatus == 'Standby' ? const Color(0xFFF59E0B) : const Color(0xFF64748B));

        return Marker(
          point: LatLng(v.lat!, v.lng!),
          width: 80,
          height: 40,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.28),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.92),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  v.id,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 7.5,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList();

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF3B82F6),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'live_comm_coverage_maps'.tr.toUpperCase(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'maps_sub'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => Get.toNamed(Routes.LIVE_TRACKING),
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'view_full_map'.tr,
                          style: const TextStyle(
                            color: Color(0xFF3B82F6),
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 3),
                        const Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF3B82F6)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Map Container
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                height: 240,
                width: double.infinity,
                child: Stack(
                  children: [
                    FlutterMap(
                      options: MapOptions(
                        initialCenter: LatLng(centerLat, centerLng),
                        initialZoom: 11.5,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                          userAgentPackageName: 'com.vmovexa.app',
                        ),
                        MarkerLayer(markers: markers),
                      ],
                    ),

                    // Empty state backdrop if no GPS
                    if (!hasGps)
                      Positioned.fill(
                        child: Container(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.65),
                          child: Center(
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 24),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: AppColors.cardBg.withValues(alpha: 0.95),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.cardBorder),
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'no_gps_positions'.tr,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    'gps_appear_desc'.tr,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 9.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),

                    // Floating Bottom Pills (Online Vehicles & Broadcasting Live)
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF10B981),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  '${controller.kpiVehiclesWithGpsCount}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'vehicles_gps'.tr,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 9,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF3B82F6),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  '${controller.kpiBroadcastingVehiclesCount}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'broadcasting_live'.tr,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 9,
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
            ),
          ],
        ),
      );
    });
  }

  // 5. Recent Broadcast Campaigns (List Format)
  Widget _buildRecentBroadcastCampaignsCard() {
    return Obx(() {
      final recent = controller.recentCampaigns;

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.campaign_rounded, size: 16, color: Color(0xFF6366F1)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'recent_campaigns'.tr.toUpperCase(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'recent_sub'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Actions: New Campaign & View All
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // InkWell(
                    //   onTap: controller.createNewCampaign,
                    //   borderRadius: BorderRadius.circular(8),
                    //   child: Container(
                    //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    //     decoration: BoxDecoration(
                    //       gradient: AppTheme.primaryGradient,
                    //       borderRadius: BorderRadius.circular(8),
                    //     ),
                    //     child: Row(
                    //       mainAxisSize: MainAxisSize.min,
                    //       children: [
                    //         const Icon(Icons.add_rounded, size: 12, color: Colors.white),
                    //         const SizedBox(width: 3),
                    //         Text(
                    //           'create_campaign'.tr,
                    //           style: const TextStyle(
                    //             color: Colors.white,
                    //             fontSize: 9.5,
                    //             fontWeight: FontWeight.bold,
                    //           ),
                    //         ),
                    //       ],
                    //     ),
                    //   ),
                    // ),
                    // const SizedBox(width: 6),
                    InkWell(
                      onTap: () => controller.selectedNavIndex.value = 1,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${'view_all'.tr} (${controller.campaigns.length})',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.arrow_forward_rounded, size: 10, color: AppColors.textSecondary),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Content
            if (recent.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 0.8),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Icon(Icons.campaign_outlined, color: AppColors.textMuted, size: 24),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'no_campaigns'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'create_first_campaign'.tr,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: controller.createNewCampaign,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.add_rounded, size: 13, color: Colors.white),
                            const SizedBox(width: 4),
                            Text(
                              'create_first_broadcast'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: List.generate(recent.length, (index) {
                  final camp = recent[index];
                  return Column(
                    children: [
                      _buildRecentCampaignItem(camp),
                      if (index < recent.length - 1)
                        const Divider(color: AppColors.cardBorder, height: 20),
                    ],
                  );
                }),
              ),
          ],
        ),
      );
    });
  }

  Widget _buildRecentCampaignItem(GovCampaignModel camp) {
    final statusColor = _getGovStatusColor(camp.status);
    final mediaThumb = camp.thumbnailOrMedia;

    return InkWell(
      onTap: () => Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: camp),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left Creative Thumbnail Box
                Container(
                  width: 74,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: mediaThumb.isNotEmpty
                            ? Image.network(
                                mediaThumb,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Center(
                                  child: Icon(Icons.campaign_outlined, color: AppColors.textMuted, size: 22),
                                ),
                              )
                            : const Center(
                                child: Icon(Icons.campaign_outlined, color: AppColors.textMuted, size: 22),
                              ),
                      ),
                      // Category overlay pill
                      Positioned(
                        bottom: 3,
                        right: 3,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Text(
                            camp.displayCategory,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 7.5,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),

                // Middle Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Code & Department
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppColors.cardBorder, width: 0.8),
                            ),
                            child: Text(
                              camp.displayCode,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              camp.departmentOrClient,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),

                      // Title
                      Text(
                        camp.displayName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 3),

                      // Date & Time
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 10, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              camp.displayDates,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                            ),
                          ),
                          if (camp.timeDisplay != null) ...[
                            const SizedBox(width: 6),
                            const Icon(Icons.access_time_rounded, size: 10, color: AppColors.textMuted),
                            const SizedBox(width: 3),
                            Text(
                              camp.timeDisplay!,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Bottom Reach, Impressions, Status & Arrow
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Buses & Screens
                Text(
                  '${camp.totalBuses} ${'buses_label'.tr} · ${camp.totalScreens} ${'screens_label'.tr}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                // Impressions
                Text(
                  '${camp.impressions ?? 0} ${'impressions'.tr}',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9.5,
                  ),
                ),


              ],
            ),
            SizedBox(height: 10,),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Status Pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        (camp.status ?? 'active').toUpperCase(),
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 8.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ),
                ),
                // Forward Arrow
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: const Center(
                    child: Icon(Icons.arrow_forward_rounded, size: 12, color: AppColors.textSecondary),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Color _getGovStatusColor(String? status) {
    final s = (status ?? '').toLowerCase();
    if (s == 'live' || s == 'running' || s == 'active') {
      return const Color(0xFF10B981);
    }
    if (s == 'completed') {
      return const Color(0xFF64748B);
    }
    if (s == 'scheduled') {
      return const Color(0xFF6366F1);
    }
    if (s == 'approved') {
      return const Color(0xFF3B82F6);
    }
    if (s == 'paused') {
      return const Color(0xFFF59E0B);
    }
    if (s == 'pending_approval' || s == 'under review') {
      return const Color(0xFFA855F7);
    }
    return const Color(0xFF94A3B8);
  }

  // ==========================================
  // TAB 2: CAMPAIGNS LIST
  // ==========================================
  Widget _buildCampaignsTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Header with Create Campaign button
          _buildCampaignTabHeader(
            'gov_campaigns_create_btn'.tr,
            controller.createNewCampaign,
          ),
          const SizedBox(height: 14),

          // Search and Sort controls
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: controller.campaignSearchController,
                          textAlign: TextAlign.left,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintTextDirection: TextDirection.ltr,
                            hintText: 'gov_campaigns_search_placeholder'.tr,
                            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(vertical: 12),
                            suffixIcon: Obx(() => controller.campaignSearchQuery.value.isNotEmpty
                                ? IconButton(
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                    icon: const Icon(Icons.clear, size: 14, color: AppColors.textMuted),
                                    onPressed: () => controller.campaignSearchController.clear(),
                                  )
                                : const SizedBox.shrink()),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () => _showSortBottomSheet(),
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.tune_rounded, color: Colors.white, size: 15),
                      const SizedBox(width: 6),
                      Obx(() => Text(
                        _getSortLabel(controller.sortBy.value),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      )),
                      const SizedBox(width: 4),
                      const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Filter Tab Pills (Admin Panel parity)
          Obx(() {
            final active = controller.campaignsFilterTab.value;
            return SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: GovernmentDashboardController.campaignTabs.length,
                separatorBuilder: (_, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final tab = GovernmentDashboardController.campaignTabs[index];
                  final isSelected = active == tab;
                  final count = controller.tabCounts[tab] ?? 0;
                  return GestureDetector(
                    onTap: () => controller.setCampaignsFilterTab(tab),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: isSelected ? AppTheme.primaryGradient : null,
                        color: isSelected ? null : AppColors.cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : AppColors.cardBorder,
                          width: 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF9333EA).withOpacity(0.25),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _getTabLabel(tab),
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textSecondary,
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.white.withOpacity(0.25) : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(10),
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
          const SizedBox(height: 14),

          // Live dynamic scrollable list
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value && controller.campaigns.isEmpty) {
                return const Center(
                  child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
                );
              }

              final list = controller.filteredCampaigns;
              if (list.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.campaign_outlined, color: AppColors.textMuted, size: 48),
                      const SizedBox(height: 12),
                      Text(
                        controller.campaignSearchQuery.value.isNotEmpty
                            ? 'No campaigns found for "${controller.campaignSearchQuery.value}"'
                            : 'gov_campaign_no_found'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'gov_campaign_no_match'.tr,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 15),
                      Container(
                        height: 38,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF9333EA).withOpacity(0.25),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: controller.createNewCampaign,
                            borderRadius: BorderRadius.circular(10),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.add, color: Colors.white, size: 15),
                                  const SizedBox(width: 4),
                                  Text(
                                    'gov_campaigns_create_btn'.tr,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: controller.onRefresh,
                color: const Color(0xFF3B82F6),
                backgroundColor: AppColors.cardBg,
                child: ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    final c = list[index];
                    return _buildGovCampaignItemCard(c);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildCampaignTabHeader(String btnText, VoidCallback onTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'gov_campaigns_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),

              ],
            ),
            const SizedBox(height: 2),
            Text(
              'gov_campaigns_subtitle'.tr,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
            ),

          ],
        ),

      ],
    );
  }

  void _showSortBottomSheet() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'gov_sort_by'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const Divider(color: Color(0xFF334155), height: 16),
            ...[
              {'key': 'Recent', 'label': 'gov_sort_recent'.tr},
              {'key': 'Name', 'label': 'gov_sort_name'.tr},
              {'key': 'Budget-High', 'label': 'gov_sort_budget_high'.tr},
              {'key': 'Budget-Low', 'label': 'gov_sort_budget_low'.tr},
              {'key': 'Screens', 'label': 'gov_sort_screens'.tr},
            ].map((opt) {
              final isSelected = controller.sortBy.value == opt['key'];
              return ListTile(
                dense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                title: Text(
                  opt['label']!,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 13,
                  ),
                ),
                trailing: isSelected
                    ? Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check, color: Colors.white, size: 14),
                      )
                    : null,
                onTap: () {
                  controller.sortBy.value = opt['key']!;
                  controller.filterCampaigns();
                  Get.back();
                },
              );
            }),
            const SizedBox(height: 12),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  String _getTabLabel(String tab) {
    switch (tab) {
      case 'All': return 'gov_tab_all'.tr;
      case 'Approved': return 'gov_tab_approved'.tr;
      case 'Running': return 'gov_tab_running'.tr;
      case 'Under Review': return 'gov_tab_under_review'.tr;
      case 'Scheduled': return 'gov_tab_scheduled'.tr;
      case 'Draft': return 'gov_tab_draft'.tr;
      case 'Completed': return 'gov_tab_completed'.tr;
      case 'Paused': return 'gov_tab_paused'.tr;
      case 'Rejected': return 'gov_tab_rejected'.tr;
      default: return tab;
    }
  }

  String _getSortLabel(String sort) {
    switch (sort) {
      case 'Recent': return 'gov_sort_recent'.tr;
      case 'Name': return 'gov_sort_name'.tr;
      case 'Budget-High': return 'gov_sort_budget_high'.tr;
      case 'Budget-Low': return 'gov_sort_budget_low'.tr;
      case 'Screens': return 'gov_sort_screens'.tr;
      default: return sort;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Running': return const Color(0xFF10B981);
      case 'Approved': return const Color(0xFF3B82F6);
      case 'Under Review': return const Color(0xFFF59E0B);
      case 'Scheduled': return const Color(0xFF6366F1);
      case 'Paused': return const Color(0xFFF97316);
      case 'Completed': return const Color(0xFF64748B);
      case 'Draft': return const Color(0xFF71717A);
      case 'Rejected': return const Color(0xFFF43F5E);
      default: return const Color(0xFF94A3B8);
    }
  }

  String _getPaymentStatusLabel(String? status) {
    switch (status) {
      case 'Treasury Paid': return 'gov_payment_treasury_paid'.tr;
      case 'Online Paid': return 'gov_payment_online_paid'.tr;
      case 'Gov Cleared': return 'gov_payment_gov_cleared'.tr;
      default: return 'gov_payment_pending_sanction'.tr;
    }
  }

  Widget _buildGovCampaignItemCard(GovCampaignModel c) {
    final statusColor = _getStatusColor(c.mappedStatus);
    final mediaType = c.primaryMediaType;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.18),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Accent Gradient Line
            Container(
              height: 3.5,
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Top Meta Row: ID + Status + 3-Dots Menu
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF334155), width: 0.8),
                        ),
                        child: Text(
                          c.displayCode,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.14),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: statusColor.withOpacity(0.4), width: 1),
                            ),
                            child: Text(
                              _getTabLabel(c.mappedStatus).toUpperCase(),
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.4,
                              ),
                            ),
                          ),
                          const SizedBox(width: 4),
                          PopupMenuButton<String>(
                            icon: const Icon(Icons.more_vert, color: Colors.white70, size: 18),
                            color: const Color(0xFF1E293B),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            onSelected: (val) {
                              if (val == 'view') {
                                Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: c);
                              } else if (val == 'edit') {
                                Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN, arguments: c);
                              } else if (val == 'start' || val == 'resume') {
                                controller.handleStartCampaign(c);
                              } else if (val == 'pause') {
                                controller.handlePauseCampaign(c);
                              } else if (val == 'end') {
                                controller.handleEndCampaign(c);
                              } else if (val == 'approve') {
                                controller.handleApproveCampaign(c);
                              } else if (val == 'reject') {
                                controller.handleRejectCampaign(c);
                              } else if (val == 'delete') {
                                controller.handleDeleteCampaign(c);
                              }
                            },
                            itemBuilder: (context) => [
                              PopupMenuItem(
                                value: 'view',
                                child: Row(
                                  children: [
                                    const Icon(Icons.visibility_outlined, color: Colors.white70, size: 16),
                                    const SizedBox(width: 8),
                                    Text('gov_action_view_details'.tr, style: const TextStyle(color: Colors.white, fontSize: 12)),
                                  ],
                                ),
                              ),
                              if (['Draft', 'Under Review', 'Rejected'].contains(c.mappedStatus))
                                PopupMenuItem(
                                  value: 'edit',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.edit_outlined, color: Colors.white70, size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_edit_campaign'.tr, style: const TextStyle(color: Colors.white, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Under Review')
                                PopupMenuItem(
                                  value: 'approve',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_approve_broadcast'.tr, style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Approved')
                                PopupMenuItem(
                                  value: 'start',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.play_circle_outline, color: Color(0xFF10B981), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_start_broadcast'.tr, style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Running')
                                PopupMenuItem(
                                  value: 'pause',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.pause_circle_outline, color: Color(0xFFF59E0B), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_pause_broadcast'.tr, style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Paused')
                                PopupMenuItem(
                                  value: 'resume',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.play_circle_outline, color: Color(0xFF10B981), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_resume_broadcast'.tr, style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Running' || c.mappedStatus == 'Paused')
                                PopupMenuItem(
                                  value: 'end',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.stop_circle_outlined, color: Color(0xFFEF4444), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_end_campaign'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (c.mappedStatus == 'Under Review')
                                PopupMenuItem(
                                  value: 'reject',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.cancel_outlined, color: Color(0xFFEF4444), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_reject_broadcast'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              if (['Draft', 'Completed', 'Rejected', 'Under Review'].contains(c.mappedStatus))
                                PopupMenuItem(
                                  value: 'delete',
                                  child: Row(
                                    children: [
                                      const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 16),
                                      const SizedBox(width: 8),
                                      Text('gov_action_delete_campaign'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // 2. Campaign Title & Department Info
                  GestureDetector(
                    onTap: () => Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: c),
                    child: Text(
                      c.displayName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          c.departmentOrClient,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                        ),
                      ),
                      if (c.clientName != null && c.clientName!.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3), width: 0.8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.person_outline, size: 10, color: Color(0xFF60A5FA)),
                              const SizedBox(width: 3),
                              Text(
                                '${'gov_contact_label'.tr} ${c.clientName}',
                                style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),

                  // 3. Badges Row: Media format + QR code + Payment
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      // Format badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF334155), width: 0.8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              mediaType == 'video'
                                  ? Icons.videocam_outlined
                                  : mediaType == 'pdf'
                                      ? Icons.description_outlined
                                      : mediaType == 'url'
                                          ? Icons.link_rounded
                                          : Icons.image_outlined,
                              size: 11,
                              color: mediaType == 'video'
                                  ? const Color(0xFF818CF8)
                                  : mediaType == 'pdf'
                                      ? const Color(0xFFF87171)
                                      : mediaType == 'url'
                                          ? const Color(0xFF60A5FA)
                                          : const Color(0xFF34D399),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              mediaType == 'video'
                                  ? 'gov_campaign_video'.tr
                                  : mediaType == 'pdf'
                                      ? 'gov_campaign_pdf'.tr
                                      : mediaType == 'url'
                                          ? 'gov_campaign_url'.tr
                                          : 'gov_campaign_image'.tr,
                              style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),

                      // QR Code badge (if present)
                      if (c.qrCode != null && c.qrCode!.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3), width: 0.8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.qr_code_2_rounded, size: 11, color: Color(0xFF34D399)),
                              const SizedBox(width: 3),
                              Text(
                                c.qrCode!,
                                style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ),

                      // Payment Status badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3), width: 0.8),
                        ),
                        child: Text(
                          '${'gov_payment_label'.tr} ${_getPaymentStatusLabel(c.paymentStatus)}',
                          style: const TextStyle(color: Color(0xFFA5B4FC), fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // 4. Flight Duration & Budget Row
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155).withOpacity(0.6), width: 0.8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'gov_flight_duration'.tr,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              c.displayDates,
                              style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'gov_budget_grant'.tr,
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              c.totalAmount > 0 ? '₹ ${c.totalAmount.toStringAsFixed(0)}' : 'gov_public_welfare_psa'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // 5. Target Screens Pill
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155), width: 0.8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.tv_rounded, size: 14, color: Color(0xFF60A5FA)),
                        const SizedBox(width: 6),
                        Text(
                          '${'gov_target_screens'.tr.toUpperCase()}: ',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${c.totalScreens} ${'gov_screens_count'.tr}',
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // 6. Bottom Action Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${c.citiesCount} ${c.citiesCount == 1 ? 'gov_city_label'.tr : 'gov_cities_label'.tr} · ${c.fleetOperatorName}',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10.5, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: () => Get.toNamed(Routes.GOV_CAMPAIGN_DETAILS, arguments: c),
                        child: Row(
                          children: [
                            Text(
                              'gov_action_view_details'.tr,
                              style: const TextStyle(
                                color: Color(0xFF60A5FA),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_rounded, size: 13, color: Color(0xFF60A5FA)),
                          ],
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
    );
  }

  // ==========================================
  // TAB 3: EMERGENCY BROADCASTS (Mirroring GovEmergencyListPage.jsx)
  // ==========================================
  Widget _buildEmergencyBroadcastTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // 1. Header with Title, Live Badge, and "+ New Broadcast" button
          _buildEmergencyTabHeader(),
          const SizedBox(height: 12),

          // 2. Main Scrollable List Area
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => controller.loadDashboardData(silent: true),
              color: const Color(0xFFEF4444),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 5 Status Breakdown Stat Cards (Clickable)
                    _buildEmergencyStatCards(),
                    const SizedBox(height: 14),

                    // 6 Status Filter Tabs with Live Badges
                    _buildEmergencyFilterTabs(),
                    const SizedBox(height: 12),

                    // Search Box & Dropdown Filters Bar
                    _buildEmergencySearchAndFilters(),
                    const SizedBox(height: 10),

                    // Active Filters Chips Bar & Reset
                    _buildEmergencyActiveFilterChips(),
                    const SizedBox(height: 10),

                    // Broadcasts Cards List
                    _buildEmergencyBroadcastsList(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Header with "+ New Broadcast" button and Live Overrides beacon
  Widget _buildEmergencyTabHeader() {
    return Obx(() {
      final counts = controller.emergencyCounts;
      final activeCount = counts['active'] ?? 0;

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        'gov_emergency.emergency_broadcasts'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (activeCount > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5), width: 1),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$activeCount ${activeCount > 1 ? 'gov_emergency.overrides_active'.tr : 'gov_emergency.override_active'.tr}',
                              style: const TextStyle(
                                color: Color(0xFFFCA5A5),
                                fontSize: 8.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'gov_emergency.subtitle'.tr,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary, size: 20),
                onPressed: () => controller.loadDashboardData(silent: true),
                tooltip: 'Refresh',
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
              ),
              const SizedBox(width: 6),
              // "+ New Broadcast" button
              Container(
                height: 34,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFEF4444).withOpacity(0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.to(() => const GovCreateEmergencyView())?.then((_) {
                      controller.loadDashboardData(silent: true);
                    });
                  },
                  icon: SvgPicture.asset(
                    'assets/icons/active-alert.svg',
                    width: 14,
                    height: 14,
                  ),
                  label: Text(
                    'gov_emergency.new_broadcast'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  // 5 Status Breakdown Stat Cards (Matching Admin Panel lines 450-520)
  Widget _buildEmergencyStatCards() {
    return Obx(() {
      final counts = controller.emergencyCounts;
      final currentTab = controller.selectedEmergencyTab.value;

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: [
            _buildStatCard(
              title: 'gov_emergency.total_alerts'.tr,
              count: counts['all'] ?? 0,
              subtitle: 'gov_emergency.all_logs'.tr,
              isSelected: currentTab == 'All',
              borderColor: const Color(0xFF64748B),
              accentColor: Colors.white,
              onTap: () => controller.selectedEmergencyTab.value = 'All',
            ),
            const SizedBox(width: 8),
            _buildStatCard(
              title: 'gov_emergency.live_overrides'.tr,
              count: counts['active'] ?? 0,
              subtitle: 'gov_emergency.broadcasting_now'.tr,
              isSelected: currentTab == 'Active',
              borderColor: const Color(0xFF10B981),
              accentColor: const Color(0xFF10B981),
              isLive: true,
              onTap: () => controller.selectedEmergencyTab.value = 'Active',
            ),
            const SizedBox(width: 8),
            _buildStatCard(
              title: 'gov_emergency.pending_approval'.tr,
              count: counts['pending'] ?? 0,
              subtitle: 'gov_emergency.awaiting_superadmin'.tr,
              isSelected: currentTab == 'Pending Approval',
              borderColor: const Color(0xFFF59E0B),
              accentColor: const Color(0xFFF59E0B),
              onTap: () => controller.selectedEmergencyTab.value = 'Pending Approval',
            ),
            const SizedBox(width: 8),
            _buildStatCard(
              title: 'gov_emergency.approved'.tr,
              count: counts['approved'] ?? 0,
              subtitle: 'gov_emergency.authorized_broadcasts'.tr,
              isSelected: currentTab == 'Approved',
              borderColor: const Color(0xFF3B82F6),
              accentColor: const Color(0xFF3B82F6),
              onTap: () => controller.selectedEmergencyTab.value = 'Approved',
            ),
            const SizedBox(width: 8),
            _buildStatCard(
              title: 'gov_emergency.revoked_expired'.tr,
              count: counts['inactive'] ?? 0,
              subtitle: 'gov_emergency.override_terminated'.tr,
              isSelected: currentTab == 'Revoked',
              borderColor: const Color(0xFFEF4444),
              accentColor: const Color(0xFFEF4444),
              onTap: () => controller.selectedEmergencyTab.value = 'Revoked',
            ),
          ],
        ),
      );
    });
  }

  Widget _buildStatCard({
    required String title,
    required int count,
    required String subtitle,
    required bool isSelected,
    required Color borderColor,
    required Color accentColor,
    bool isLive = false,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 124,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? borderColor.withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? borderColor : AppColors.cardBorder,
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? accentColor : AppColors.textMuted,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.4,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isLive && count > 0)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: TextStyle(
                color: accentColor,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                color: accentColor.withOpacity(0.75),
                fontSize: 7.5,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // 6 Status Filter Tabs with Live Badges (Matching Admin Panel lines 525-576)
  Widget _buildEmergencyFilterTabs() {
    return Obx(() {
      final counts = controller.emergencyCounts;
      final selectedTab = controller.selectedEmergencyTab.value;

      final tabs = [
        {'label': 'All', 'title': 'gov_emergency.tab_all'.tr, 'count': counts['all'] ?? 0, 'color': AppColors.primaryButtonBlue},
        {'label': 'Active', 'title': 'gov_emergency.tab_active'.tr, 'count': counts['active'] ?? 0, 'color': const Color(0xFF10B981), 'isLive': true},
        {'label': 'Pending Approval', 'title': 'gov_emergency.tab_pending'.tr, 'count': counts['pending'] ?? 0, 'color': const Color(0xFFF59E0B)},
        {'label': 'Approved', 'title': 'gov_emergency.tab_approved'.tr, 'count': counts['approved'] ?? 0, 'color': const Color(0xFF3B82F6)},
        {'label': 'Revoked', 'title': 'gov_emergency.tab_revoked'.tr, 'count': counts['revoked'] ?? 0, 'color': const Color(0xFFEF4444)},
        {'label': 'Expired', 'title': 'gov_emergency.tab_expired'.tr, 'count': counts['expired'] ?? 0, 'color': const Color(0xFF64748B)},
      ];

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: tabs.map((t) {
            final label = t['label'] as String;
            final isCurrent = selectedTab == label;
            final color = t['color'] as Color;
            final count = t['count'] as int;
            final title = t['title'] as String;
            final isLive = (t['isLive'] as bool?) ?? false;

            return GestureDetector(
              onTap: () => controller.selectedEmergencyTab.value = label,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  gradient: isCurrent ? AppTheme.primaryGradient : null,
                  color: isCurrent ? null : AppColors.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isCurrent ? Colors.transparent : AppColors.cardBorder,
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isLive && count > 0 && !isCurrent) ...[
                      Container(
                        width: 5,
                        height: 5,
                        margin: const EdgeInsets.only(right: 4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                    Text(
                      title,
                      style: TextStyle(
                        color: isCurrent ? Colors.white : AppColors.textSecondary,
                        fontSize: 10,
                        fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: isCurrent
                            ? Colors.black.withOpacity(0.25)
                            : color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '$count',
                        style: TextStyle(
                          color: isCurrent ? Colors.white : color,
                          fontSize: 8.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  // Search Box & Dropdown Filters Bar (Matching Admin Panel lines 580-655)
  Widget _buildEmergencySearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          // Search Input
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: const Color(0xFF131826),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: controller.emergencySearchController,
                    style: const TextStyle(color: Colors.white, fontSize: 11),
                    decoration: InputDecoration(
                      hintText: 'gov_emergency.search_ph'.tr,
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                Obx(() {
                  if (controller.emergencySearchQuery.value.isNotEmpty) {
                    return GestureDetector(
                      onTap: () {
                        controller.emergencySearchController.clear();
                        controller.emergencySearchQuery.value = '';
                      },
                      child: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                    );
                  }
                  return const SizedBox.shrink();
                }),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // 3 Filter Dropdowns: Severity, Scope, Sort By
          Row(
            children: [
              // Severity Filter
              Expanded(
                child: Obx(() => _buildFilterDropdown<String>(
                      value: controller.selectedEmergencySeverity.value,
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Severity')),
                        DropdownMenuItem(value: 'critical', child: Text('Critical')),
                        DropdownMenuItem(value: 'high', child: Text('High')),
                        DropdownMenuItem(value: 'medium', child: Text('Medium')),
                        DropdownMenuItem(value: 'low', child: Text('Low')),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.selectedEmergencySeverity.value = val;
                      },
                    )),
              ),
              const SizedBox(width: 6),

              // Scope Filter
              Expanded(
                child: Obx(() => _buildFilterDropdown<String>(
                      value: controller.selectedEmergencyScope.value,
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Scope')),
                        DropdownMenuItem(value: 'all_screens', child: Text('Entire Network')),
                        DropdownMenuItem(value: 'partial', child: Text('Selected Routes')),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.selectedEmergencyScope.value = val;
                      },
                    )),
              ),
              const SizedBox(width: 6),

              // Sort By
              Expanded(
                child: Obx(() => _buildFilterDropdown<String>(
                      value: controller.selectedEmergencySort.value,
                      items: const [
                        DropdownMenuItem(value: 'newest', child: Text('Newest')),
                        DropdownMenuItem(value: 'oldest', child: Text('Oldest')),
                        DropdownMenuItem(value: 'severity', child: Text('Highest Sev')),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.selectedEmergencySort.value = val;
                      },
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterDropdown<T>({
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      height: 32,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF131826),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          items: items,
          onChanged: onChanged,
          isExpanded: true,
          dropdownColor: const Color(0xFF131826),
          style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w600),
          icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.textMuted, size: 16),
        ),
      ),
    );
  }

  // Active Filters Chips Bar & "Reset All Filters"
  Widget _buildEmergencyActiveFilterChips() {
    return Obx(() {
      if (!controller.hasActiveEmergencyFilters) return const SizedBox.shrink();

      final tab = controller.selectedEmergencyTab.value;
      final sev = controller.selectedEmergencySeverity.value;
      final scope = controller.selectedEmergencyScope.value;
      final q = controller.emergencySearchQuery.value;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
        child: Wrap(
          spacing: 6,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              'gov_emergency.active_filters'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold),
            ),
            if (tab != 'All')
              _buildFilterChip(
                label: 'Tab: $tab',
                color: const Color(0xFFEF4444),
                onClear: () => controller.selectedEmergencyTab.value = 'All',
              ),
            if (sev != 'all')
              _buildFilterChip(
                label: 'Severity: ${sev.toUpperCase()}',
                color: const Color(0xFFF59E0B),
                onClear: () => controller.selectedEmergencySeverity.value = 'all',
              ),
            if (scope != 'all')
              _buildFilterChip(
                label: scope == 'all_screens' ? 'Scope: Network' : 'Scope: Routes',
                color: const Color(0xFF3B82F6),
                onClear: () => controller.selectedEmergencyScope.value = 'all',
              ),
            if (q.isNotEmpty)
              _buildFilterChip(
                label: 'Query: "$q"',
                color: Colors.white60,
                onClear: () {
                  controller.emergencySearchController.clear();
                  controller.emergencySearchQuery.value = '';
                },
              ),
            GestureDetector(
              onTap: controller.resetEmergencyFilters,
              child: Text(
                'gov_emergency.reset_all_filters'.tr,
                style: const TextStyle(
                  color: Color(0xFFEF4444),
                  fontSize: 9.5,
                  fontWeight: FontWeight.bold,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildFilterChip({
    required String label,
    required Color color,
    required VoidCallback onClear,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.14),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.4), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onClear,
            child: Icon(Icons.close_rounded, size: 10, color: color),
          ),
        ],
      ),
    );
  }

  // Broadcasts Cards List (Matching Admin Panel lines 760-960)
  Widget _buildEmergencyBroadcastsList() {
    return Obx(() {
      final list = controller.filteredEmergencyBroadcasts;

      if (list.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: const Center(
                  child: Icon(Icons.warning_amber_rounded, color: AppColors.textMuted, size: 26),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'gov_emergency.no_broadcasts'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                controller.hasActiveEmergencyFilters
                    ? 'gov_emergency.try_adjusting_filters'.tr
                    : 'gov_emergency.no_alerts_logged'.tr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                textAlign: TextAlign.center,
              ),
              if (controller.hasActiveEmergencyFilters) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: controller.resetEmergencyFilters,
                  child: Text(
                    'gov_emergency.reset_all_filters'.tr,
                    style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        );
      }

      return Column(
        children: list.map((b) => _buildEmergencyCard(b)).toList(),
      );
    });
  }

  // Single Broadcast Card
  Widget _buildEmergencyCard(EmergencyBroadcastModel item) {
    final isAct = item.isLiveOverride;
    final sevColor = item.severityColor;

    return GestureDetector(
      onTap: () => GovEmergencyDetailsSheet.show(Get.context!, item),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isAct ? const Color(0xFFEF4444).withOpacity(0.5) : AppColors.cardBorder,
            width: isAct ? 1.4 : 1,
          ),
          boxShadow: isAct
              ? [
                  BoxShadow(
                    color: const Color(0xFFEF4444).withOpacity(0.12),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Siren Icon, Headline, Code, and 3-Dot Actions Menu
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Siren Icon
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isAct
                        ? const Color(0xFFEF4444).withOpacity(0.18)
                        : Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isAct
                          ? const Color(0xFFEF4444).withOpacity(0.4)
                          : AppColors.cardBorder,
                      width: 1,
                    ),
                  ),
                  child: Center(
                    child: SvgPicture.asset(
                      'assets/icons/critical.svg',
                      width: 18,
                      height: 18,
                      colorFilter: ColorFilter.mode(
                        isAct ? const Color(0xFFEF4444) : Colors.white60,
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Headline & Code
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.displayHeadline,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Text(
                            item.displayCode,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 9.5,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (item.authority != null) ...[
                            const SizedBox(width: 6),
                            const Text('·', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                item.authority!,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),

                // 3-Dot Action Menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: AppColors.textSecondary, size: 18),
                  color: const Color(0xFF131826),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.cardBorder, width: 1),
                  ),
                  onSelected: (val) {
                    if (val == 'details') {
                      GovEmergencyDetailsSheet.show(Get.context!, item);
                    } else if (val == 'revoke') {
                      if (item.id != null) {
                        _showRevokeConfirm(item);
                      }
                    } else if (val == 'delete') {
                      if (item.id != null) {
                        _showDeleteConfirm(item);
                      }
                    }
                  },
                  itemBuilder: (ctx) => [
                    PopupMenuItem(
                      value: 'details',
                      child: Row(
                        children: [
                          const Icon(Icons.remove_red_eye_outlined, color: Color(0xFF60A5FA), size: 14),
                          const SizedBox(width: 8),
                          Text('gov_emergency.view_full_details'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
                        ],
                      ),
                    ),
                    if (item.isRevocable && item.id != null)
                      PopupMenuItem(
                        value: 'revoke',
                        child: Row(
                          children: [
                            const Icon(Icons.cancel_outlined, color: Color(0xFFEF4444), size: 14),
                            const SizedBox(width: 8),
                            Text('gov_emergency.revoke_broadcast'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    if (item.canDelete && item.id != null)
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 14),
                            const SizedBox(width: 8),
                            Text('gov_emergency.delete_broadcast'.tr, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11)),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Message Snippet
            Text(
              item.message?.isNotEmpty == true ? item.message! : (item.bodyText ?? ''),
              style: const TextStyle(color: Colors.white70, fontSize: 10.5, height: 1.35),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),

            // Scope & Timing Info Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.gps_fixed_rounded, size: 11, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      item.displayScope,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '(${item.affectedBusesCount} buses)',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const Icon(Icons.schedule_rounded, size: 11, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      item.createdAt != null
                          ? DateFormat('dd MMM, hh:mm a').format(item.createdAt!)
                          : item.displayDuration,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Badges Row: Severity Badge on Left & Status Badge on Right
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Severity Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: sevColor.withOpacity(0.14),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: sevColor.withOpacity(0.35), width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.warning_amber_rounded, size: 10, color: sevColor),
                      const SizedBox(width: 3),
                      Text(
                        item.displaySeverity,
                        style: TextStyle(
                          color: sevColor,
                          fontSize: 8.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),

                // Status Badge
                _buildCardStatusBadge(item),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardStatusBadge(EmergencyBroadcastModel item) {
    if (item.isLiveOverride) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.circle, color: Color(0xFF10B981), size: 5),
            SizedBox(width: 4),
            Text(
              'LIVE OVERRIDE',
              style: TextStyle(
                color: Color(0xFF10B981),
                fontSize: 8,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }
    if (item.isPendingApproval) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFF59E0B).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'PENDING REVIEW',
          style: TextStyle(
            color: Color(0xFFF59E0B),
            fontSize: 8,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    if (item.isApproved) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF3B82F6).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'APPROVED',
          style: TextStyle(
            color: Color(0xFF3B82F6),
            fontSize: 8,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    if (item.isRevoked) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFEF4444).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'REVOKED',
          style: TextStyle(
            color: Color(0xFFEF4444),
            fontSize: 8,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Text(
        'EXPIRED',
        style: TextStyle(
          color: AppColors.textMuted,
          fontSize: 8,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showRevokeConfirm(EmergencyBroadcastModel item) {
    Get.defaultDialog(
      title: 'gov_emergency.confirm_revoke_title'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
      middleText: 'gov_emergency.confirm_revoke_desc'.tr,
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 12),
      backgroundColor: const Color(0xFF151828),
      textConfirm: 'gov_emergency.revoke_broadcast'.tr,
      textCancel: 'common.cancel'.tr,
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white60,
      buttonColor: const Color(0xFFEF4444),
      onConfirm: () {
        Get.back();
        if (item.id != null) {
          controller.revokeEmergencyAlert(item.id!);
        }
      },
    );
  }

  void _showDeleteConfirm(EmergencyBroadcastModel item) {
    Get.defaultDialog(
      title: 'gov_emergency.confirm_delete_title'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
      middleText: 'gov_emergency.confirm_delete_desc'.tr,
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 12),
      backgroundColor: const Color(0xFF151828),
      textConfirm: 'gov_emergency.delete_broadcast'.tr,
      textCancel: 'common.cancel'.tr,
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white60,
      buttonColor: const Color(0xFFEF4444),
      onConfirm: () {
        Get.back();
        if (item.id != null) {
          controller.deleteEmergencyBroadcast(item.id!);
        }
      },
    );
  }

  // ==========================================
  // ==========================================
  // TAB 4: TRANSIT ANALYTICS & TELEMATICS
  // 100% Parity with Admin GovAnalyticsDashboardPage.jsx
  // ==========================================
  Widget _buildAnalyticsTab(BuildContext context) {
    return Obx(() {
      final isQrTab = controller.analyticsMainTab.value == 'qr';

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Fixed Top Header & Tab Switcher (Does not scroll)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildAnalyticsHeaderBanner(context),
                const SizedBox(height: 12),
                _buildAnalyticsMainTabSwitcher(),
                const SizedBox(height: 10),
              ],
            ),
          ),

          // 2. Scrollable Tab Contents
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => controller.refreshTransitAnalytics(),
              color: const Color(0xFF3B82F6),
              backgroundColor: AppColors.cardBg,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!isQrTab) ...[
                      _buildNetworkOverviewContent(),
                    ] else ...[
                      _buildQrAnalyticsContent(),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    });
  }

  // 1. Header Banner with Title, Subtitle, Refresh & Filters (drawer and breadcrumb removed)
  Widget _buildAnalyticsHeaderBanner(BuildContext context) {
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
          // Title & Subtitle
          Text(
            'gov_analytics.title'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            'gov_analytics.sub'.tr,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),

          // Filters and Refresh Row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // Refresh Button
              Obx(() {
                final isRefreshing = controller.isAnalyticsRefreshing.value;
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: isRefreshing ? null : () => controller.refreshTransitAnalytics(),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      height: 36,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.cardBorder, width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isRefreshing)
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          else
                            const Icon(Icons.refresh_rounded, color: Colors.white, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            isRefreshing ? 'updating'.tr : 'common.refresh'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),

              // Category Filter Dropdown
              Obx(() {
                final selectedCat = controller.analyticsCategory.value;

                // Remove duplicates and any 'all' that the API/controller already included
                final categories = controller.analyticsAvailableCategories
                    .where((c) => c != 'all')
                    .toSet()
                    .toList();

                // Guard: value must match exactly one item
                final safeValue =
                (selectedCat == 'all' || categories.contains(selectedCat))
                    ? selectedCat
                    : 'all';

                return Container(
                  height: 36,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: safeValue,
                      dropdownColor: AppColors.cardBg,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded,
                          color: Colors.white70, size: 18),
                      style: const TextStyle(
                          color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      items: [
                        DropdownMenuItem<String>(
                          value: 'all',
                          child: Text('gov_analytics.all_categories'.tr),
                        ),
                        ...categories.map((cat) => DropdownMenuItem<String>(
                          value: cat,
                          child: Text(cat),
                        )),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          controller.analyticsCategory.value = val;
                          controller.fetchAgencyAnalytics(
                            range: controller.analyticsDateRange.value,
                            cat: val,
                          );
                        }
                      },
                    ),
                  ),
                );
              }),
              /*Obx(() {
                final selectedCat = controller.analyticsCategory.value;
                final categories = controller.analyticsAvailableCategories;
                return Container(
                  height: 36,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedCat,
                      dropdownColor: AppColors.cardBg,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      items: [
                        DropdownMenuItem<String>(
                          value: 'all',
                          child: Text('gov_analytics.all_categories'.tr),
                        ),
                        ...categories.map((cat) => DropdownMenuItem<String>(
                          value: cat,
                          child: Text(cat),
                        )),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          controller.analyticsCategory.value = val;
                          controller.fetchAgencyAnalytics(
                            range: controller.analyticsDateRange.value,
                            cat: val,
                          );
                        }
                      },
                    ),
                  ),
                );
              }),*/

              // Date Range Filter Dropdown
              Obx(() {
                final selectedRange = controller.analyticsDateRange.value;
                return Container(
                  height: 36,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedRange,
                      dropdownColor: AppColors.cardBg,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white70, size: 18),
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      items: [
                        DropdownMenuItem<String>(
                          value: '7days',
                          child: Text('gov_analytics.last_7_days'.tr),
                        ),
                        DropdownMenuItem<String>(
                          value: '30days',
                          child: Text('gov_analytics.last_30_days'.tr),
                        ),
                        DropdownMenuItem<String>(
                          value: 'month',
                          child: Text('gov_analytics.current_month'.tr),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          controller.analyticsDateRange.value = val;
                          controller.fetchAgencyAnalytics(
                            range: val,
                            cat: controller.analyticsCategory.value,
                          );
                        }
                      },
                    ),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Main Tab Switcher (Network Overview vs QR Citizen Analytics) with AppTheme.primaryGradient
  Widget _buildAnalyticsMainTabSwitcher() {
    return Obx(() {
      final isQrTab = controller.analyticsMainTab.value == 'qr';

      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            // Network Overview Tab
            Expanded(
              child: GestureDetector(
                onTap: () => controller.analyticsMainTab.value = 'overview',
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    gradient: !isQrTab ? AppTheme.primaryGradient : null,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: !isQrTab
                        ? [
                            BoxShadow(
                              color: const Color(0xFF3B82F6).withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.bar_chart_rounded,
                        color: !isQrTab ? Colors.white : AppColors.textMuted,
                        size: 17,
                      ),
                      const SizedBox(width: 7),
                      Flexible(
                        child: Text(
                          'gov_analytics.network_overview'.tr,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: !isQrTab ? Colors.white : AppColors.textMuted,
                            fontSize: 11.5,
                            fontWeight: !isQrTab ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 4),

            // QR Citizen Analytics Tab
            Expanded(
              child: GestureDetector(
                onTap: () => controller.analyticsMainTab.value = 'qr',
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    gradient: isQrTab ? AppTheme.primaryGradient : null,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: isQrTab
                        ? [
                            BoxShadow(
                              color: const Color(0xFF3B82F6).withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.qr_code_2_rounded,
                        color: isQrTab ? Colors.white : AppColors.textMuted,
                        size: 17,
                      ),
                      const SizedBox(width: 7),
                      Flexible(
                        child: Text(
                          'gov_analytics.qr_citizen_analytics'.tr,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isQrTab ? Colors.white : AppColors.textMuted,
                            fontSize: 11.5,
                            fontWeight: isQrTab ? FontWeight.bold : FontWeight.w500,
                          ),
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
    });
  }

  // ==========================================
  // TAB 1: NETWORK OVERVIEW CONTENT
  // ==========================================
  Widget _buildNetworkOverviewContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 KPI Cards (2x2 Grid)
        _buildNetworkKpiGrid(),
        const SizedBox(height: 16),

        // Performance Trend Daily Bar Chart Card
        _buildPerformanceTrendCard(),
        const SizedBox(height: 16),

        // Campaign Status Breakdown Card
        _buildCampaignStatusCard(),
        const SizedBox(height: 16),

        // Top Performing Public Service Campaigns Card / Table
        _buildTopPerformingSection(),
        const SizedBox(height: 24),
      ],
    );
  }

  // 4 KPI Cards (Total Campaigns, Active Campaigns, Emergency Broadcasts, Transit Fleet Reach)
  Widget _buildNetworkKpiGrid() {
    return Obx(() {
      final totalCampaigns = controller.analyticsTotalCampaigns;
      final activeCampaigns = controller.analyticsActiveCampaigns;
      final completedCampaigns = controller.analyticsCompletedCampaigns;
      final scheduledCampaigns = controller.analyticsScheduledCampaigns;
      final emergencyAlerts = controller.analyticsEmergencyAlerts;
      final reachPct = controller.analyticsNetworkReachPct;
      final activeBuses = controller.analyticsActiveVehiclesCount;
      final totalBuses = controller.analyticsTotalVehiclesCount;

      final reachChange = 'gov_analytics.n_of_n_active_buses'.tr
          .replaceAll('{{active}}', '$activeBuses')
          .replaceAll('{{total}}', '$totalBuses');

      return GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.25,
        children: [
          _buildKpiCard(
            title: 'gov_analytics.kpi_total_campaigns'.tr,
            value: '$totalCampaigns',
            subtitle: '$completedCampaigns ${'gov_analytics.completed_suffix'.tr}',
            dotColor: const Color(0xFF10B981),
            icon: Icons.flag_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.active_campaigns'.tr,
            value: '$activeCampaigns',
            subtitle: '$scheduledCampaigns ${'gov_analytics.pending_scheduled_suffix'.tr}',
            dotColor: const Color(0xFF3B82F6),
            icon: Icons.directions_bus_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.emergency_broadcasts'.tr,
            value: '$emergencyAlerts',
            subtitle: 'gov_analytics.public_alerts_dispatched'.tr,
            dotColor: const Color(0xFFEF4444),
            icon: Icons.warning_amber_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.kpi_fleet_reach'.tr,
            value: '$reachPct%',
            subtitle: reachChange,
            dotColor: const Color(0xFF8B5CF6),
            icon: Icons.track_changes_rounded,
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required Color dotColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
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
                  title.toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Icon(icon, color: Colors.white70, size: 15),
              ),
            ],
          ),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Performance Trend Daily Bar Chart Card
  Widget _buildPerformanceTrendCard() {
    return Obx(() {
      final daysTrend = controller.analyticsDaysTrend;
      final maxDayCount = controller.analyticsMaxDayCount;
      final totalPlays = controller.analyticsTotalPlaysInWindow;
      final totalCampaigns = controller.analyticsTotalCampaigns;
      final activeCampaigns = controller.analyticsActiveCampaigns;
      final totalImpressions = controller.analyticsTotalImpressions;

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
            // Title & Subtitle
            Text(
              'gov_analytics.perf_trend_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              '${'gov_analytics.perf_trend_sub'.tr} — $totalPlays ${'gov_analytics.plays_in_selected_window'.tr}',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10,
              ),
            ),
            const SizedBox(height: 12),

            // 3 Legend Badges
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _buildLegendBadge(const Color(0xFF3B82F6), '${'gov_analytics.total_campaigns_legend'.tr} ($totalCampaigns)'),
                _buildLegendBadge(const Color(0xFF10B981), '${'gov_analytics.active_legend'.tr} ($activeCampaigns)'),
                _buildLegendBadge(const Color(0xFF8B5CF6), '${'gov_analytics.impressions_legend'.tr} ($totalImpressions)'),
              ],
            ),
            const SizedBox(height: 16),

            // Dynamic Bars or Empty State
            if (daysTrend.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5), style: BorderStyle.solid),
                ),
                child: Text(
                  'gov_analytics.no_telemetry_recorded'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              )
            else
              Container(
                height: 170,
                padding: const EdgeInsets.fromLTRB(10, 16, 10, 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final chartHeight = constraints.maxHeight - 28;
                    return SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: daysTrend.map((d) {
                          final count = (d['count'] as num?)?.toDouble() ?? 0.0;
                          final double heightFactor = maxDayCount > 0
                              ? (count / maxDayCount).clamp(0.06, 1.0)
                              : 0.06;
                          final barHeight = chartHeight * heightFactor;
                          final dayLabel = d['day']?.toString() ?? '';

                          return Container(
                            width: 38,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (count > 0)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Text(
                                      count >= 1000 ? '${(count / 1000).toStringAsFixed(1)}k' : '${count.toInt()}',
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                Container(
                                  width: 22,
                                  height: barHeight,
                                  decoration: BoxDecoration(
                                    gradient: count > 0 ? AppTheme.primaryGradient : null,
                                    color: count > 0 ? null : const Color(0xFF334155),
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(5)),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  dayLabel,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      );
    });
  }

  Widget _buildLegendBadge(Color color, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text(
            text,
            style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  // Campaign Status Breakdown Card
  Widget _buildCampaignStatusCard() {
    return Obx(() {
      final total = controller.analyticsTotalCampaigns;
      final active = controller.analyticsActiveCampaigns;
      final scheduled = controller.analyticsScheduledCampaigns;
      final completed = controller.analyticsCompletedCampaigns;
      final emergency = controller.analyticsEmergencyAlerts;

      final activePct = total > 0 ? ((active / total) * 100).round() : 0;
      final scheduledPct = total > 0 ? ((scheduled / total) * 100).round() : 0;
      final completedPct = total > 0 ? ((completed / total) * 100).round() : 0;
      final emergencyPct = total > 0 ? ((emergency / total) * 100).round() : 0;

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
            Text(
              'gov_analytics.status_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              'gov_analytics.distribution_desc'.tr,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
            ),
            const SizedBox(height: 16),

            // Center Visual Ring
            Center(
              child: Container(
                width: 105,
                height: 105,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF3B82F6), width: 7),
                  color: const Color(0xFF0F172A).withValues(alpha: 0.4),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '$total',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        'gov_analytics.total'.tr.toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 8.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 4 Mini Breakdown Cards (2x2 Grid)
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.2,
              children: [
                _buildStatusMiniCard(
                  label: 'gov_analytics.active'.tr,
                  count: '$active ($activePct%)',
                  color: const Color(0xFF10B981),
                ),
                _buildStatusMiniCard(
                  label: 'gov_analytics.scheduled'.tr,
                  count: '$scheduled ($scheduledPct%)',
                  color: const Color(0xFF3B82F6),
                ),
                _buildStatusMiniCard(
                  label: 'gov_analytics.completed'.tr,
                  count: '$completed ($completedPct%)',
                  color: const Color(0xFF94A3B8),
                ),
                _buildStatusMiniCard(
                  label: 'gov_analytics.emergency_alerts'.tr,
                  count: '$emergency ($emergencyPct%)',
                  color: const Color(0xFFEF4444),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildStatusMiniCard({
    required String label,
    required String count,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            count,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  // Top Performing Public Service Campaigns Section (Card vs Table toggle)
  Widget _buildTopPerformingSection() {
    return Obx(() {
      final list = controller.analyticsTopCampaigns;
      final viewMode = controller.analyticsViewMode.value;

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
            // Header with Title, ViewModeToggle & View All
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'gov_analytics.top_campaigns_title'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'gov_analytics.top_campaigns_sub'.tr,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // View Mode Toggle (Card vs Table)
                Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => controller.analyticsViewMode.value = 'card',
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: viewMode == 'card' ? const Color(0xFF3B82F6) : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(
                            Icons.grid_view_rounded,
                            size: 14,
                            color: viewMode == 'card' ? Colors.white : AppColors.textMuted,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => controller.analyticsViewMode.value = 'table',
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: viewMode == 'table' ? const Color(0xFF3B82F6) : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(
                            Icons.table_rows_rounded,
                            size: 14,
                            color: viewMode == 'table' ? Colors.white : AppColors.textMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // View All Button (Switches to Campaigns Tab)
                GestureDetector(
                  onTap: () => controller.updateNavIndex(1),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'gov_analytics.view_all'.tr,
                        style: const TextStyle(
                          color: Color(0xFF3B82F6),
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, color: Color(0xFF3B82F6), size: 16),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Content
            if (list.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5)),
                ),
                child: Text(
                  'gov_analytics.no_campaigns_ranked'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              )
            else if (viewMode == 'card')
              Column(
                children: list.map((item) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black26,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Rank Badge with AppTheme.primaryGradient
                            Container(
                              width: 26,
                              height: 26,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(7),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF3B82F6).withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  '#${item['rank']}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),

                            // Name & Category
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['name']?.toString() ?? '',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item['category']?.toString() ?? '',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Status Pill
                            _buildStatusPill(item['status']?.toString() ?? ''),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Metrics (Reach & Impressions)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A).withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    '${'gov_analytics.reach'.tr.toUpperCase()}: ',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    item['reach']?.toString() ?? '',
                                    style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Text(
                                    '${'gov_analytics.impressions'.tr.toUpperCase()}: ',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    item['impressions']?.toString() ?? '',
                                    style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10.5, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              )
            else
              // Table View
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: DataTable(
                  horizontalMargin: 8,
                  columnSpacing: 16,
                  headingRowHeight: 36,
                  dataRowMinHeight: 42,
                  dataRowMaxHeight: 46,
                  border: TableBorder(
                    horizontalInside: BorderSide(color: AppColors.cardBorder.withValues(alpha: 0.4), width: 1),
                  ),
                  columns: [
                    DataColumn(label: Text('gov_analytics.rank_campaign'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('gov_analytics.category'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('gov_analytics.reach'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('gov_analytics.impressions'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold))),
                    DataColumn(label: Text('gov_analytics.status'.tr.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold))),
                  ],
                  rows: list.map((item) {
                    return DataRow(
                      cells: [
                        DataCell(
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 20,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: Colors.black38,
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(color: AppColors.cardBorder),
                                ),
                                child: Center(
                                  child: Text(
                                    '${item['rank']}',
                                    style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 140),
                                child: Text(
                                  item['name']?.toString() ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                        DataCell(
                          Text(item['category']?.toString() ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                        ),
                        DataCell(
                          Text(item['reach']?.toString() ?? '', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        DataCell(
                          Text(item['impressions']?.toString() ?? '', style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                        DataCell(
                          _buildStatusPill(item['status']?.toString() ?? ''),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      );
    });
  }

  Widget _buildStatusPill(String status) {
    final s = status.toLowerCase();
    Color bg;
    Color border;
    Color textColor;
    String label = status;

    if (s == 'live' || s == 'active') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      border = const Color(0xFF10B981).withValues(alpha: 0.4);
      textColor = const Color(0xFF34D399);
      label = 'common.active'.tr;
    } else if (s == 'completed') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      border = const Color(0xFF3B82F6).withValues(alpha: 0.4);
      textColor = const Color(0xFF60A5FA);
      label = 'common.completed'.tr;
    } else if (s == 'pending_approval' || s == 'scheduled' || s == 'draft') {
      bg = const Color(0xFFF59E0B).withValues(alpha: 0.15);
      border = const Color(0xFFF59E0B).withValues(alpha: 0.4);
      textColor = const Color(0xFFFBBF24);
      label = 'pending'.tr;
    } else {
      bg = const Color(0xFF64748B).withValues(alpha: 0.15);
      border = const Color(0xFF64748B).withValues(alpha: 0.4);
      textColor = const Color(0xFF94A3B8);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 8.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // ==========================================
  // TAB 2: QR CITIZEN ANALYTICS CONTENT
  // ==========================================
  Widget _buildQrAnalyticsContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 4 QR KPI Metrics (2x2 Grid)
        _buildQrKpiGrid(),
        const SizedBox(height: 16),

        // QR Scans by Public Campaign Card
        _buildQrByCampaignCard(),
        const SizedBox(height: 16),

        // Device Type Breakdown (3 cards)
        _buildQrDeviceBreakdownSection(),
        const SizedBox(height: 24),
      ],
    );
  }

  // 4 QR KPI Metrics
  Widget _buildQrKpiGrid() {
    return Obx(() {
      final totalScans = controller.analyticsTotalScans;
      final uniqueScans = controller.analyticsUniqueScans;
      final avgScans = controller.analyticsAvgScansPerDay;
      final scanRate = controller.analyticsOverallScanRate;

      final range = controller.analyticsDateRange.value;
      final days = range == '30days' ? 30 : (range == 'month' ? DateTime.now().day : 7);
      final avgSub = '${'gov_analytics.averaged_over'.tr} $days ${'gov_analytics.days'.tr}';

      return GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.25,
        children: [
          _buildKpiCard(
            title: 'gov_analytics.total_qr_scans'.tr,
            value: '$totalScans',
            subtitle: 'gov_analytics.telemetry_verified'.tr,
            dotColor: const Color(0xFF10B981),
            icon: Icons.qr_code_scanner_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.unique_scanners'.tr,
            value: '$uniqueScans',
            subtitle: 'gov_analytics.unique_devices'.tr,
            dotColor: const Color(0xFF3B82F6),
            icon: Icons.devices_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.avg_scans_day'.tr,
            value: '$avgScans',
            subtitle: avgSub,
            dotColor: const Color(0xFFF59E0B),
            icon: Icons.calendar_month_rounded,
          ),
          _buildKpiCard(
            title: 'gov_analytics.overall_scan_rate'.tr,
            value: scanRate,
            subtitle: 'gov_analytics.imp_conversion'.tr,
            dotColor: const Color(0xFF8B5CF6),
            icon: Icons.trending_up_rounded,
          ),
        ],
      );
    });
  }

  // QR Scans by Public Campaign Card
  Widget _buildQrByCampaignCard() {
    return Obx(() {
      final items = controller.analyticsQrByCampaign;
      final colors = [
        const Color(0xFF3B82F6),
        const Color(0xFFEF4444),
        const Color(0xFF10B981),
        const Color(0xFFF59E0B),
        const Color(0xFF8B5CF6),
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
            Text(
              'gov_analytics.qr_by_campaign_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 14),

            if (items.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5)),
                ),
                child: Text(
                  'gov_analytics.no_qr_engagement'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              )
            else
              Column(
                children: items.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final c = entry.value;
                  final name = c['name']?.toString() ?? '';
                  final scansFormatted = c['scansFormatted']?.toString() ?? '0';
                  final pct = (c['pct'] as num?)?.toDouble() ?? 0.0;
                  final color = colors[idx % colors.length];

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '$scansFormatted ${'gov_analytics.scans_label'.tr} ($pct%)',
                              style: TextStyle(
                                color: color,
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: (pct / 100).clamp(0.0, 1.0),
                            backgroundColor: Colors.black38,
                            valueColor: AlwaysStoppedAnimation<Color>(color),
                            minHeight: 6,
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
    });
  }

  // Device Type Breakdown (3 Cards: Mobile Scans, Tablet Devices, Other / Web)
  Widget _buildQrDeviceBreakdownSection() {
    return Obx(() {
      final stats = controller.analyticsQrDeviceStats;
      final mobile = stats['mobile']!;
      final tablet = stats['tablet']!;
      final web = stats['web']!;

      return Row(
        children: [
          Expanded(
            child: _buildDeviceCard(
              icon: Icons.phone_android_rounded,
              label: 'gov_analytics.mobile_scans'.tr,
              pct: '${mobile['pct']}%',
              count: '${mobile['count']} ${'gov_analytics.scans_label'.tr}',
              countColor: const Color(0xFF10B981),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildDeviceCard(
              icon: Icons.tablet_android_rounded,
              label: 'gov_analytics.tablet_devices'.tr,
              pct: '${tablet['pct']}%',
              count: '${tablet['count']} ${'gov_analytics.scans_label'.tr}',
              countColor: const Color(0xFF3B82F6),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildDeviceCard(
              icon: Icons.language_rounded,
              label: 'gov_analytics.other_web'.tr,
              pct: '${web['pct']}%',
              count: '${web['count']} ${'gov_analytics.scans_label'.tr}',
              countColor: const Color(0xFF94A3B8),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildDeviceCard({
    required IconData icon,
    required String label,
    required String pct,
    required String count,
    required Color countColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.cardBorder, width: 1),
            ),
            child: Icon(icon, color: Colors.white70, size: 16),
          ),
          const SizedBox(height: 8),
          Text(
            label.toUpperCase(),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 8.5,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            pct,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            count,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: countColor,
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      height: 60,
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildNavItem(0, Icons.home_filled, 'home'.tr),
          _buildNavItem(1, Icons.campaign_rounded, 'campaigns'.tr),
          // Middle glowing Emergency button
          Expanded(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => controller.updateNavIndex(2),
                splashColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
                highlightColor: const Color(0xFFEF4444).withValues(alpha: 0.1),
                child: Center(
                  child: SvgPicture.asset(
                    'assets/icons/emergencyBottom.svg',
                    width: 52,
                    height: 52,
                  ),
                ),
              ),
            ),
          ),
          _buildNavItem(3, Icons.analytics_rounded, 'analytics'.tr),
          _buildNavItem(4, Icons.person, 'profile'.tr),
        ],
      ),
    );
  }

  Widget _buildNavItem(int idx, IconData icon, String label) {
    final isSelected = controller.selectedNavIndex.value == idx;
    final color = isSelected ? const Color(0xFF3B82F6) : AppColors.textMuted;
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => controller.updateNavIndex(idx),
          splashColor: const Color(0xFF3B82F6).withValues(alpha: 0.15),
          highlightColor: const Color(0xFF3B82F6).withValues(alpha: 0.08),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 9.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

