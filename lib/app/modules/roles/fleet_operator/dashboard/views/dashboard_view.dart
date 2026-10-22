import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/dashboard_controller.dart';
import '../widgets/fleet_op_drawer.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../routes/app_routes.dart';
import '../../fleet_list/views/fleet_list_view.dart';
import '../../vehicle_list/views/vehicle_list_view.dart';
import '../../driver_staff/views/driver_staff_view.dart';
import '../../profile/views/profile_view.dart';
import '../../../../../data/models/fleet_models.dart';

class FleetOpDashboardView extends GetView<FleetOpDashboardController> {
  const FleetOpDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const FleetOpDrawer(),
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 1:
              return const FleetListView(isEmbedded: true);
            case 2:
              return const VehicleListView();
            case 3:
              return const DriverStaffListView();
            case 4:
              return const ProfileView();
            default:
              return _buildDashboardHome(context);
          }
        }),
      ),

      // 5 Bottom Navigation Bar Tabs
      bottomNavigationBar: Obx(
        () => Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
          ),
          child: BottomNavigationBar(
            currentIndex: controller.selectedNavIndex.value,
            onTap: controller.onNavItemTapped,
            backgroundColor: AppColors.cardBg,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: const Color(0xFF6366F1),
            unselectedItemColor: AppColors.textMuted,
            selectedFontSize: 10,
            unselectedFontSize: 10,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_rounded),
                label: 'Dashboard',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.directions_bus_rounded),
                label: 'Fleets',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.directions_car_rounded),
                label: 'Vehicles',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.badge_outlined),
                label: 'Drivers',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline_rounded),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardHome(BuildContext context) {
    return Column(
      children: [
        // Top App Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Builder(
                builder: (ctx) => IconButton(
                  icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                  onPressed: () => Scaffold.of(ctx).openDrawer(),
                  tooltip: 'Open Menu',
                ),
              ),
              Image.asset('assets/app_logo/newLogo.png', width: 140, height: 36),
              Row(
                children: [
                  // Notifications with badge
                  InkWell(
                    onTap: () => Get.toNamed(Routes.NOTIFICATIONS_LIST),
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        SvgPicture.asset(
                          'assets/icons/notification.svg',
                          width: 24,
                          height: 24,
                        ),
                        Positioned(
                          right: -4,
                          top: -4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Color(0xFFA855F7),
                              shape: BoxShape.circle,
                            ),
                            child: const Text(
                              '5',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // const SizedBox(width: 14),
                  // // Profile Avatar
                  // GestureDetector(
                  //   onTap: () => controller.setNavIndex(4),
                  //   child: Container(
                  //     width: 32,
                  //     height: 32,
                  //     decoration: const BoxDecoration(
                  //       shape: BoxShape.circle,
                  //       gradient: AppColors.primaryGradient,
                  //     ),
                  //     child: const Center(
                  //       child: Text(
                  //         'FO',
                  //         style: TextStyle(
                  //           color: Colors.white,
                  //           fontSize: 12,
                  //           fontWeight: FontWeight.bold,
                  //         ),
                  //       ),
                  //     ),
                  //   ),
                  // ),
                ],
              ),
            ],
          ),
        ),

        // Scrollable Body
        Expanded(
          child: RefreshIndicator(
            onRefresh: controller.refreshDashboard,
            color: const Color(0xFF6366F1),
            backgroundColor: AppColors.cardBg,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Console Welcome Banner
                  _buildWelcomeBanner(),
                  const SizedBox(height: 16),

                  // 2. 4 Metric KPI Cards
                  _buildKpiCardsGrid(),
                  const SizedBox(height: 20),

                  // 3. Quick Actions Grid
                  _buildQuickActions(),
                  const SizedBox(height: 22),

                  // 4. Active Fleet Groups Preview
                  _buildActiveFleetsSection(),
                  const SizedBox(height: 22),

                  // 5. Live Telematics & Alerts Strip
                  _buildAlertsBanner(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeBanner() {
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
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'GOOD MORNING,',
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              Obx(
                () => IconButton(
                  icon: controller.isRefreshing.value
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                  onPressed: controller.refreshDashboard,
                  tooltip: 'Refresh Metrics',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Fleet Operations Console',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Real-time telematics, vehicle dispatch & fleet supervision',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 14),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => Get.toNamed(Routes.LIVE_TRACKING),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white10,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: Colors.white24),
                    ),
                  ),
                  icon: const Icon(Icons.explore_outlined, color: Color(0xFFF43F5E), size: 16),
                  label: const Text(
                    'Live Tracking',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
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
                      onTap:  (){
                        Get.toNamed(Routes.ADD_FLEET);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.symmetric( vertical: 10),
                        child: Row(
                          // mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.add, color: Colors.white, size: 20),
                            SizedBox(width: 6),
                            Text(
                              'Register Fleet',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              // Expanded(
              //   child: ElevatedButton.icon(
              //     onPressed: () => Get.toNamed(Routes.ADD_FLEET),
              //     style: ElevatedButton.styleFrom(
              //       backgroundColor: const Color(0xFF2563EB),
              //       elevation: 0,
              //       padding: const EdgeInsets.symmetric(vertical: 10),
              //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              //     ),
              //     icon: const Icon(Icons.add, color: Colors.white, size: 16),
              //     label: const Text(
              //       'Register Fleet',
              //       style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              //     ),
              //   ),
              // ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCardsGrid() {
    return Obx(() {
      final k = controller.kpis.value;

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
        children: [
          _buildKpiCard(
            title: 'FLEETS',
            value: '${k.totalFleets}',
            subtitle: 'All Active',
            subtitleColor: const Color(0xFF10B981),
            icon: Icons.directions_bus_rounded,
            iconColor: Colors.indigoAccent,
            onTap: controller.goToFleetList,
          ),
          _buildKpiCard(
            title: 'VEHICLES',
            value: '${k.totalVehicles}',
            subtitle: '${k.activeVehicles} on route',
            subtitleColor: Colors.lightBlueAccent,
            icon: Icons.directions_car_rounded,
            iconColor: Colors.lightBlueAccent,
            onTap: controller.goToVehicles,
          ),
          _buildKpiCard(
            title: 'DRIVERS',
            value: '${k.totalDrivers}',
            subtitle: '${k.activeDrivers} assigned',
            subtitleColor: const Color(0xFF10B981),
            icon: Icons.badge_outlined,
            iconColor: const Color(0xFF10B981),
            onTap: controller.goToDrivers,
          ),
          _buildKpiCard(
            title: 'GPS UNITS',
            value: '${k.totalGps}',
            subtitle: '${k.onlineGps} online',
            subtitleColor: Colors.amberAccent,
            icon: Icons.memory_rounded,
            iconColor: Colors.amberAccent,
            onTap: controller.goToGpsDevices,
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required String subtitle,
    required Color subtitleColor,
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.12),
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
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(width: 5, height: 5, decoration: BoxDecoration(color: subtitleColor, shape: BoxShape.circle)),
                    const SizedBox(width: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: subtitleColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'title': 'Fleets', 'icon': Icons.directions_bus_rounded, 'color': Colors.indigoAccent, 'onTap': controller.goToFleetList},
      {'title': 'Vehicles', 'icon': Icons.directions_car_rounded, 'color': Colors.lightBlueAccent, 'onTap': controller.goToVehicles},
      {'title': 'Drivers', 'icon': Icons.badge_outlined, 'color': const Color(0xFF10B981), 'onTap': controller.goToDrivers},
      {'title': 'Trips', 'icon': Icons.schedule_rounded, 'color': Colors.purpleAccent, 'onTap': controller.goToTrips},
      {'title': 'Tracking', 'icon': Icons.my_location_rounded, 'color': Colors.pinkAccent, 'onTap': controller.goToLiveTracking},
      {'title': 'Emergency', 'icon': Icons.warning_amber_rounded, 'color': Colors.redAccent, 'onTap': () => Get.toNamed(Routes.FLEET_INCIDENTS)},
      {'title': 'GPS', 'icon': Icons.memory_rounded, 'color': Colors.amberAccent, 'onTap': controller.goToGpsDevices},
      {'title': 'Reports', 'icon': Icons.bar_chart_rounded, 'color': Colors.tealAccent, 'onTap': controller.goToReports},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'QUICK ACTIONS',
          style: TextStyle(
            color: AppColors.textMuted,
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.9,
          ),
        ),
        const SizedBox(height: 10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: actions.map((act) {
              final color = act['color'] as Color;
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: InkWell(
                  onTap: act['onTap'] as VoidCallback,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 80,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1.2),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(act['icon'] as IconData, size: 20, color: color),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          act['title'] as String,
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
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildActiveFleetsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'ACTIVE FLEET GROUPS',
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.9,
              ),
            ),
            TextButton(
              onPressed: controller.goToFleetList,
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
              child: const Text(
                'View All →',
                style: TextStyle(color: Color(0xFF6366F1), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.activeFleets.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: const Center(
                child: Text('No fleet divisions registered yet.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ),
            );
          }

          return Column(
            children: controller.activeFleets.map((fleet) => _buildFleetCard(fleet)).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildFleetCard(FleetItemModel fleet) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
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
                  fleet.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'ACTIVE',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          if (fleet.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              fleet.description,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              _buildFleetBadge(Icons.directions_bus_rounded, '${fleet.vehicleCount} Vehicles', Colors.indigoAccent),
              const SizedBox(width: 8),
              _buildFleetBadge(Icons.badge_outlined, '${fleet.driverCount} Drivers', const Color(0xFF10B981)),
              if (fleet.depotName != null) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: _buildFleetBadge(Icons.warehouse_rounded, fleet.depotName!, Colors.amberAccent),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFleetBadge(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              text,
              style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertsBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1E1B4B).withValues(alpha: 0.8),
            const Color(0xFF0F172A).withValues(alpha: 0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.security_update_good_rounded, color: Color(0xFF818CF8), size: 22),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'IoT Telematics Gateway Online',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  '32 GPS trackers streaming live coordinates & sensor telemetry.',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
