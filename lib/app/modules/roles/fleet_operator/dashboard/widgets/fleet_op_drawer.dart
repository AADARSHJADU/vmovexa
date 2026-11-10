import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/widgets/language_selector_sheet.dart';
import '../controllers/dashboard_controller.dart';

class FleetOpDrawer extends StatelessWidget {
  const FleetOpDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<FleetOpDashboardController>();

    return Drawer(
      backgroundColor: const Color(0xFF0A0C14),
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header with Live Profile Avatar
            Obx(() {
              final user = controller.user.value ?? (Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null);
              final userName = user?.name ?? 'Fleet Operator';
              final userEmail = user?.email ?? 'operator@vmovexa.com';
              final userRole = user?.role ?? 'ROLE-FLEET-OPERATOR';
              final rawAvatar = user?.avatarUrl;
              final avatarUrl = ApiConstants.resolveFileUrl(rawAvatar);

              return InkWell(
                onTap: () {
                  Get.back();
                  controller.setNavIndex(3); // Navigate to Profile tab
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: avatarUrl.isEmpty ? AppColors.primaryGradient : null,
                          border: Border.all(color: const Color(0xFF6366F1), width: 1.8),
                          color: const Color(0xFF0F172A),
                        ),
                        child: ClipOval(
                          child: avatarUrl.isNotEmpty
                              ? Image.network(
                                  avatarUrl,
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => _buildFallbackInitial(userName),
                                )
                              : _buildFallbackInitial(userName),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              userName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              userEmail,
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 11,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 5),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                userRole.replaceAll('ROLE-', '').replaceAll('-', ' '),
                                style: const TextStyle(
                                  color: Color(0xFF818CF8),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

            // Scrollable Menu Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                children: [
                  // --- SECTION 1: OVERVIEW ---
                  _buildSectionHeader('overview_dashboard'.tr.toUpperCase()),
                  _buildDrawerItem(
                    icon: Icons.dashboard_rounded,
                    title: 'overview_dashboard'.tr,
                    color: const Color(0xFF6366F1),
                    onTap: () {
                      Get.back();
                      controller.setNavIndex(0);
                    },
                  ),

                  const SizedBox(height: 12),
                  // --- SECTION 2: FLEET & TELEMATICS ---
                  _buildSectionHeader('fleet_telematics'.tr.toUpperCase()),
                  _buildDrawerItem(
                    icon: Icons.alt_route_rounded,
                    title: 'transit_routes'.tr,
                    color: Colors.tealAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.ROUTES_LIST);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.directions_car_rounded,
                    title: 'vehicles_displays'.tr,
                    color: Colors.lightBlueAccent,
                    onTap: () {
                      Get.back();
                      controller.setNavIndex(1);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.badge_outlined,
                    title: 'drivers_staff'.tr,
                    color: const Color(0xFF10B981),
                    onTap: () {
                      Get.back();
                      controller.setNavIndex(2);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.calendar_month_rounded,
                    title: 'vehicle_slots_timetable'.tr,
                    color: Colors.cyanAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.FLEET_VEHICLE_SLOTS);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.memory_rounded,
                    title: 'edge_devices'.tr,
                    color: Colors.orangeAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.GPS_LIST);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.my_location_rounded,
                    title: 'live_telematics'.tr,
                    color: const Color(0xFFF43F5E),
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.LIVE_TRACKING);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.schedule_rounded,
                    title: 'trips_dispatch'.tr,
                    color: Colors.purpleAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.FLEET_TRIPS);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.build_circle_outlined,
                    title: 'technician_requests'.tr,
                    color: Colors.cyanAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.TECHNICIAN_REQUESTS);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.warning_amber_rounded,
                    title: 'report_incident'.tr,
                    color: Colors.redAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.FLEET_REPORT_INCIDENT);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.assignment_outlined,
                    title: 'incidents_log'.tr,
                    color: Colors.amberAccent,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.FLEET_INCIDENTS);
                    },
                  ),

                  const SizedBox(height: 12),
                  // --- SECTION 3: ANALYTICS & ALERTS ---
                  _buildSectionHeader('analytics_alerts'.tr.toUpperCase()),
                  _buildDrawerItem(
                    icon: Icons.bar_chart_rounded,
                    title: 'analytics_reports'.tr,
                    color: const Color(0xFF10B981),
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.VEHICLE_ANALYTICS);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.history_rounded,
                    title: 'activity_logs'.tr,
                    color: const Color(0xFF06B6D4),
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.ACTIVITY_LOGS);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.notifications_active_outlined,
                    title: 'alerts_events'.tr,
                    color: const Color(0xFFA855F7),
                    badgeText: '5',
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.NOTIFICATIONS_LIST);
                    },
                  ),

                  const SizedBox(height: 12),
                  // --- SECTION 4: ACCOUNT & SUPPORT ---
                  _buildSectionHeader('settings'.tr.toUpperCase()),
                  _buildDrawerItem(
                    icon: Icons.person_outline_rounded,
                    title: 'profile'.tr,
                    color: Colors.white70,
                    onTap: () {
                      Get.back();
                      controller.setNavIndex(3);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.language_rounded,
                    title: 'change_language'.tr,
                    color: const Color(0xFF60A5FA),
                    onTap: () {
                      Get.back();
                      LanguageSelectorSheet.show(context);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.help_outline_rounded,
                    title: 'help_support'.tr,
                    color: Colors.white70,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.HELP_SUPPORT);
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.shield_outlined,
                    title: 'privacy_policy'.tr,
                    color: Colors.white70,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-FLEET-OPERATOR'});
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.article_outlined,
                    title: 'terms_conditions'.tr,
                    color: Colors.white70,
                    onTap: () {
                      Get.back();
                      Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-FLEET-OPERATOR'});
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.logout_rounded,
                    title: 'logout'.tr,
                    color: Colors.redAccent,
                    onTap: () {
                      Get.back();
                      controller.logout();
                    },
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, top: 8, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF6B7280),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
    String? badgeText,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        splashColor: color.withValues(alpha: 0.1),
        highlightColor: color.withValues(alpha: 0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (badgeText != null) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    badgeText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackInitial(String name) {
    final initials = name.trim().isNotEmpty
        ? name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'F';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
