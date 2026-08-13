import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../widgets/app_logo_header.dart';
import '../../../../../theme/app_colors.dart';
import '../../display_devices/view/display_devices_view.dart';
import '../../home/view/home_view.dart';
import '../controller/technician_dashboard_controller.dart';


class TechnicianDashboardView extends GetView<TechnicianDashboardController> {
  const TechnicianDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return const HomeView();
            case 1:
              return  DisplayDevicesView();
            case 2:
              return  _buildPlaceholderView('Diagnostics');
            case 3:
              return _buildPlaceholderView('Hardware Staus');
              case 4:
              return _buildPlaceholderView('More');
            default:
              return Placeholder();
          }
        }),
      ),
      // Bottom Navigation Bar

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
            selectedFontSize: 11,
            unselectedFontSize: 11,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.tv),
                label: 'Display Device',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.bar_chart_rounded),
                label: 'Diagnostics',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.monitor_heart_outlined),
                label: 'Hardware Status',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.more_horiz),
                label: 'More',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardHome() {
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
                onPressed: () {},
              ),
              const AppLogoHeader(height: 38),
              Row(
                children: [
                  // Notification Bell with Badge count 5
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 26),
                        onPressed: () {},
                      ),
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFA855F7), // Purple Badge
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
                  const SizedBox(width: 8),
                  // Profile Avatar
                  GestureDetector(
                    onTap: controller.logout,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.socialBtnBg,
                        border: Border.all(color: AppColors.socialBtnBorder, width: 1.2),
                      ),
                      child: const Icon(
                        Icons.person_outline_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                // Title section
                const Text(
                  'Good Morning,',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Fleet Operator',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Manage your fleet operations efficiently.',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 24),

                // Summary Stats Grid (Horizontal scroll list)
                SizedBox(
                  height: 115,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    children: [
                      _buildStatCard(
                        '8',
                        'Fleets',
                        'Active',
                        svgPath: 'assets/icons/truck.svg',
                        iconColor: const Color(0xFF3B82F6),
                      ),

                      _buildStatCard(
                        '142',
                        'Vehicles',
                        '124 Online',
                        svgPath: 'assets/icons/car.svg',
                        iconColor: const Color(0xFF3B82F6),
                      ),

                      _buildStatCard(
                        '156',
                        'Drivers',
                        'Active',
                        svgPath: 'assets/icons/profile.svg',
                        iconColor: const Color(0xFF8B5CF6),
                      ),

                      _buildStatCard(
                        '128',
                        'GPS Devices',
                        'Online',
                        svgPath: 'assets/icons/hotspot.svg',
                        iconColor: const Color(0xFF06B6D4),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Quick Actions
                const Text(
                  'Quick Actions',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                  children: [
                    _buildActionCard(
                      'Fleets',
                      'View and manage fleets',
                      controller.goToFleetList,
                      //icon: Icons.local_shipping_outlined,
                      svgPath: 'assets/icons/truck.svg',
                    ),

                    _buildActionCard(
                      'Vehicles',
                      'Manage vehicles and status',
                      controller.goToVehicles,
                      svgPath: 'assets/icons/car.svg',
                    ),

                    _buildActionCard(
                        'Drivers',
                        'Manage drivers and assignments',
                        controller.goToDrivers,
                        svgPath: 'assets/icons/profile.svg'
                    ),

                    _buildActionCard(
                      'Live Tracking',
                      'Track vehicles in real time',
                      controller.goToLiveTracking,
                      svgPath: 'assets/icons/location.svg',
                    ),

                    _buildActionCard(
                      'GPS Devices',
                      'Manage GPS devices',
                      controller.goToGpsDevices,
                      svgPath: 'assets/icons/hotspot.svg',
                    ),

                    _buildActionCard(
                      'Reports',
                      'View and export reports',
                      controller.goToReports,
                      svgPath: 'assets/icons/neon_bars.svg',
                    ),

                  ],

                ),
                const SizedBox(height: 28),

                // Recent Alerts
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Recent Alerts',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        'View All >',
                        style: TextStyle(
                          color: AppColors.textLink,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Alerts List
                _buildAlertCard('Vehicle MH12AB1234 is offline', 'Last seen 2 hours ago', '08:35 AM', Colors.redAccent),
                const SizedBox(height: 12),
                _buildAlertCard('Low Fuel - Vehicle MH12CD5678', 'Fuel level is below 10%', '07:50 AM', Colors.amber),
                const SizedBox(height: 12),
                _buildAlertCard('Driver Rajesh has started a trip', 'Trip to Mumbai Central', '07:20 AM', Colors.blueAccent),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPlaceholderView(String tabName) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.dashboard_customize_rounded, color: Color(0xFF6366F1), size: 48),
          const SizedBox(height: 16),
          Text(
            '$tabName Dashboard',
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Specialized dashboard features for $tabName are being prepared.',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String value,
      String title,
      String subtitle, {
        IconData? icon,
        String? svgPath,
        Color iconColor = Colors.white,
      }) {
    return Container(
      width: 105,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.cardBorder,
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Icon OR SVG
          if (svgPath != null)
            SvgPicture.asset(
              svgPath,
              width: 22,
              height: 22,
              colorFilter: ColorFilter.mode(
                iconColor,
                BlendMode.srcIn,
              ),
            )
          else if (icon != null)
            Icon(
              icon,
              color: iconColor,
              size: 22,
            ),

          const SizedBox(height: 6),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 2),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.accentGreen,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.accentGreen,
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }


  Widget _buildActionCard(
      String title,
      String subtitle,
      VoidCallback onTap, {
        IconData? icon,
        String? svgPath,
        Color iconColor = const Color(0xFF6366F1),
      }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 10,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon OR SVG
            if (svgPath != null)
              SvgPicture.asset(
                svgPath,
                width: 22,
                height: 22,
                colorFilter: ColorFilter.mode(
                  iconColor,
                  BlendMode.srcIn,
                ),
              )
            else if (icon != null)
              Icon(
                icon,
                color: iconColor,
                size: 22,
              ),

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),

            const Align(
              alignment: Alignment.bottomRight,
              child: Icon(
                Icons.chevron_right_rounded,
                color: AppColors.textMuted,
                size: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertCard(String title, String subtitle, String time, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: accentColor.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.warning_amber_rounded,
              color: accentColor,
              size: 20,
            ),
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
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                time,
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 10,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: accentColor,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
