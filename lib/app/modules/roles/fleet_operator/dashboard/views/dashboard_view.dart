import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/dashboard_controller.dart';
import '../widgets/fleet_op_drawer.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../routes/app_routes.dart';
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
              return const VehicleListView();
            case 2:
              return const DriverStaffListView();
            case 3:
              return const ProfileView();
            default:
              return _buildDashboardHome(context);
          }
        }),
      ),

      // 4 Bottom Navigation Bar Tabs (Dashboard, Vehicles, Drivers, Profile)
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
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.dashboard_rounded),
                label: 'dashboard'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.directions_car_rounded),
                label: 'vehicles'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.badge_outlined),
                label: 'drivers'.tr,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.person_outline_rounded),
                label: 'profile'.tr,
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
                  tooltip: 'open_menu'.tr,
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

                  // 4. Assigned Fleet Vehicles Preview
                  _buildAssignedVehiclesSection(),
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
                  Text(
                    'good_morning'.tr,
                    style: const TextStyle(
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
                  tooltip: 'refresh_metrics'.tr,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'fleet_ops_console'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'fleet_ops_sub'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
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
                  label: Text(
                    'live_tracking'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
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
                        color: const Color(0xFF9333EA).withValues(alpha: 0.25),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        Get.toNamed(Routes.ADD_VEHICLE);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.add, color: Colors.white, size: 20),
                            const SizedBox(width: 6),
                            Text(
                              'add_vehicle'.tr,
                              style: const TextStyle(
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
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCardsGrid() {
    return Obx(() {
      final totalVeh = controller.totalVehiclesCount;
      final onRoute = controller.onRouteCount;
      final inDepot = controller.inDepotCount;
      final assignedDrivers = controller.assignedDriversCount;
      final assignedGps = controller.assignedGpsCount;

      return GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
        children: [
          _buildKpiCard(
            title: 'fleet_vehicles'.tr,
            value: '$totalVeh',
            subtitle: '$inDepot ${'in_depot_count'.tr} • $onRoute ${'on_route_count'.tr}',
            subtitleColor: Colors.lightBlueAccent,
            icon: Icons.directions_car_rounded,
            iconColor: Colors.lightBlueAccent,
            onTap: controller.goToVehicles,
          ),
          _buildKpiCard(
            title: 'assigned_drivers_kpi'.tr,
            value: '$assignedDrivers',
            subtitle: '$assignedDrivers of $totalVeh ${'assigned_count'.tr}',
            subtitleColor: const Color(0xFF10B981),
            icon: Icons.badge_outlined,
            iconColor: const Color(0xFF10B981),
            onTap: controller.goToDrivers,
          ),
          _buildKpiCard(
            title: 'gps_units'.tr,
            value: '$assignedGps',
            subtitle: '$assignedGps of $totalVeh ${'connected_count'.tr}',
            subtitleColor: Colors.amberAccent,
            icon: Icons.memory_rounded,
            iconColor: Colors.amberAccent,
            onTap: controller.goToGpsDevices,
          ),
          _buildKpiCard(
            title: 'live_telematics'.tr,
            value: '$onRoute',
            subtitle: '$onRoute ${'moving_on_route'.tr}',
            subtitleColor: const Color(0xFFF43F5E),
            icon: Icons.my_location_rounded,
            iconColor: const Color(0xFFF43F5E),
            onTap: controller.goToLiveTracking,
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
      {'title': 'routes'.tr, 'icon': Icons.alt_route_rounded, 'color': Colors.indigoAccent, 'onTap': () => Get.toNamed(Routes.ROUTES_LIST)},
      {'title': 'vehicles'.tr, 'icon': Icons.directions_car_rounded, 'color': Colors.lightBlueAccent, 'onTap': controller.goToVehicles},
      {'title': 'drivers'.tr, 'icon': Icons.badge_outlined, 'color': const Color(0xFF10B981), 'onTap': controller.goToDrivers},
      {'title': 'trips'.tr, 'icon': Icons.schedule_rounded, 'color': Colors.purpleAccent, 'onTap': controller.goToTrips},
      {'title': 'tracking'.tr, 'icon': Icons.my_location_rounded, 'color': Colors.pinkAccent, 'onTap': controller.goToLiveTracking},
      {'title': 'emergency'.tr, 'icon': Icons.warning_amber_rounded, 'color': Colors.redAccent, 'onTap': () => Get.toNamed(Routes.FLEET_INCIDENTS)},
      {'title': 'gps'.tr, 'icon': Icons.memory_rounded, 'color': Colors.amberAccent, 'onTap': controller.goToGpsDevices},
      {'title': 'reports'.tr, 'icon': Icons.bar_chart_rounded, 'color': Colors.tealAccent, 'onTap': controller.goToReports},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'quick_actions'.tr,
          style: const TextStyle(
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

  Widget _buildAssignedVehiclesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'assigned_fleet_vehicles'.tr,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.9,
              ),
            ),
            TextButton(
              onPressed: controller.goToVehicles,
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
              child: Text(
                '${'view_all'.tr} →',
                style: const TextStyle(color: Color(0xFF6366F1), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.assignedVehicles.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Center(
                child: Text('no_vehicles_registered'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ),
            );
          }

          return Column(
            children: controller.assignedVehicles.map((vehicle) => _buildVehicleCard(vehicle)).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildVehicleCard(VehicleItemModel vehicle) {
    final statusStr = vehicle.status.toLowerCase();
    Color statusColor = const Color(0xFF94A3B8);
    String statusLabel = vehicle.status;
    if (statusStr == 'on_route' || statusStr == 'active') {
      statusColor = const Color(0xFF10B981);
      statusLabel = 'on_route_status'.tr;
    } else if (statusStr == 'in_depot' || statusStr == 'idle') {
      statusColor = Colors.lightBlueAccent;
      statusLabel = 'in_depot_status'.tr;
    } else if (statusStr == 'maintenance') {
      statusColor = Colors.amberAccent;
      statusLabel = 'maintenance_status'.tr;
    }

    final hasGps = vehicle.gpsDeviceId != null && vehicle.gpsDeviceId!.isNotEmpty;
    final driverName = (vehicle.assignedDriverName != null && vehicle.assignedDriverName!.isNotEmpty)
        ? vehicle.assignedDriverName!
        : 'unassigned'.tr;

    return InkWell(
      onTap: () => Get.toNamed(Routes.VEHICLE_DETAILS, arguments: {'id': vehicle.id}),
      borderRadius: BorderRadius.circular(14),
      child: Container(
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
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.lightBlueAccent.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.directions_car_rounded, size: 18, color: Colors.lightBlueAccent),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              vehicle.registrationNumber,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.3,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              [vehicle.make, vehicle.model].where((s) => s.isNotEmpty).join(' • '),
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    statusLabel.toUpperCase(),
                    style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.badge_outlined, size: 13, color: Color(0xFF10B981)),
                      const SizedBox(width: 4),
                      Text(
                        driverName,
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Icon(Icons.memory_rounded, size: 13, color: hasGps ? Colors.amberAccent : AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        hasGps ? 'gps_linked'.tr : 'no_gps'.tr,
                        style: TextStyle(
                          color: hasGps ? Colors.amberAccent : AppColors.textMuted,
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(Icons.speed_rounded, size: 13, color: Colors.cyanAccent),
                      const SizedBox(width: 4),
                      Text(
                        '${(vehicle.speedKmh ?? 0).toStringAsFixed(0)} km/h',
                        style: const TextStyle(color: Colors.cyanAccent, fontSize: 11, fontWeight: FontWeight.w500),
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'iot_gateway_online'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Obx(() => Text(
                  '${controller.assignedGpsCount} ${'gps_trackers_streaming'.tr}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
