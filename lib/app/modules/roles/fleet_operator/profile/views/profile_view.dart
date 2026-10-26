import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/profile_controller.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/modules/roles/fleet_operator/dashboard/controllers/dashboard_controller.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    // Self-binding controller fallback
    final controller = Get.isRegistered<FleetOpProfileController>()
        ? Get.find<FleetOpProfileController>()
        : Get.put(FleetOpProfileController());

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Navigation Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
                  onPressed: controller.loadProfileData,
                  tooltip: 'Refresh Profile',
                ),
                const Text(
                  'Operator Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.3,
                  ),
                ),
                InkWell(
                  onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
                  borderRadius: BorderRadius.circular(20),
                  child: Padding(
                    padding: const EdgeInsets.all(6),
                    child: SvgPicture.asset(
                      'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                      width: 22,
                      height: 22,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Main Scrollable Body with Pull-to-Refresh
          Expanded(
            child: RefreshIndicator(
              onRefresh: controller.loadProfileData,
              color: const Color(0xFF6366F1),
              backgroundColor: AppColors.cardBg,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Hero Profile Card
                    _buildProfileHeaderCard(controller),
                    const SizedBox(height: 16),

                    // 2. 3 Core Stat Pills (Fleets, Vehicles, Drivers)
                    _buildStatsRow(controller),
                    const SizedBox(height: 24),

                    // 3. Account & Security Section
                    const Text(
                      'ACCOUNT & SECURITY',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildSettingsPanel(),
                    const SizedBox(height: 24),

                    // 4. Helpdesk & Legal Section
                    const Text(
                      'HELPDESK & LEGAL',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildSupportPanel(),
                    const SizedBox(height: 28),

                    // 5. Logout Button (Styled to match Admin Panel logout)
                    OutlinedButton.icon(
                      onPressed: controller.confirmLogout,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFEF4444), width: 1.2),
                        backgroundColor: const Color(0xFFEF4444).withOpacity(0.08),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                      label: const Text(
                        'Logout Account',
                        style: TextStyle(
                          color: Color(0xFFEF4444),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 36),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Dynamic Profile Hero Card
  Widget _buildProfileHeaderCard(FleetOpProfileController controller) {
    return Obx(() {
      final name = controller.displayName;
      final role = controller.displayRole;
      final org = controller.organizationName;
      final opId = controller.operatorId;
      final avatar = controller.avatarUrl;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Avatar with Online Indicator
            GestureDetector(
              onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: (avatar != null && avatar.isNotEmpty) ? null : AppColors.primaryGradient,
                      border: Border.all(color: const Color(0xFF6366F1), width: 2),
                      color: const Color(0xFF0F172A),
                    ),
                    child: ClipOval(
                      child: avatar != null && avatar.isNotEmpty
                          ? Image.network(
                              avatar,
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(name),
                            )
                          : _buildAvatarFallback(name),
                    ),
                  ),
                  // Green active dot
                  Positioned(
                    bottom: 2,
                    right: 2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.cardBg, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),

            // Profile info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Role Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.18),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFF3B82F6).withOpacity(0.4),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      role,
                      style: const TextStyle(
                        color: Color(0xFF93C5FD),
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Organization Name
                  Row(
                    children: [
                      const Icon(Icons.business_rounded, color: AppColors.textMuted, size: 13),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          org,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 11,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  // Operator ID
                  Text(
                    'Operator ID: $opId',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 24),
              onPressed: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
            ),
          ],
        ),
      );
    });
  }

  /// Avatar fallback with Initials
  Widget _buildAvatarFallback(String name) {
    final initials = name.trim().isNotEmpty
        ? name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'OP';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }

  /// 3 Core Stat Pills Grid (Fleets, Vehicles, Drivers)
  Widget _buildStatsRow(FleetOpProfileController controller) {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: _buildStatItem(
              value: '${controller.fleetCount.value}',
              label: 'FLEETS',
              iconPath: 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
              iconColor: const Color(0xFF38BDF8),
              onTap: () {
                if (Get.isRegistered<FleetOpDashboardController>()) {
                  Get.find<FleetOpDashboardController>().setNavIndex(1);
                } else {
                  Get.toNamed(Routes.FLEET_LIST);
                }
              },
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _buildStatItem(
              value: '${controller.vehicleCount.value}',
              label: 'VEHICLES',
              iconPath: 'assets/icons/fleet_operator_icons/fleetsManagedA2.svg',
              iconColor: const Color(0xFF818CF8),
              onTap: () {
                if (Get.isRegistered<FleetOpDashboardController>()) {
                  Get.find<FleetOpDashboardController>().setNavIndex(2);
                }
              },
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _buildStatItem(
              value: '${controller.driverCount.value}',
              label: 'DRIVERS',
              iconPath: 'assets/icons/fleet_operator_icons/driverA.svg',
              iconColor: const Color(0xFF34D399),
              onTap: () {
                if (Get.isRegistered<FleetOpDashboardController>()) {
                  Get.find<FleetOpDashboardController>().setNavIndex(3);
                }
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _buildStatItem({
    required String value,
    required String label,
    required String iconPath,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            SvgPicture.asset(
              iconPath,
              width: 18,
              height: 18,
              colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  /// Account & Security Options Panel
  Widget _buildSettingsPanel() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildMenuRow(
            label: 'Account Settings',
            subtitle: 'Personal details, branch and organization info',
            iconPath: 'assets/icons/profile.svg',
            iconBg: const Color(0xFF3B82F6).withOpacity(0.15),
            iconColor: const Color(0xFF60A5FA),
            onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow(
            label: 'Security & Password',
            subtitle: 'Change password and security credentials',
            iconPath: 'assets/icons/fleet_operator_icons/securityA.svg',
            iconBg: const Color(0xFFF59E0B).withOpacity(0.15),
            iconColor: const Color(0xFFFBBF24),
            onTap: () => Get.toNamed(Routes.CHANGE_PASSWORD),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow(
            label: 'Notification Settings',
            subtitle: 'Push alerts, email reports, and SMS triggers',
            iconPath: 'assets/icons/fleet_operator_icons/notificationSettingA.svg',
            iconBg: const Color(0xFFA855F7).withOpacity(0.15),
            iconColor: const Color(0xFFC084FC),
            onTap: () => Get.toNamed(Routes.NOTIFICATION_SETTINGS),
          ),
        ],
      ),
    );
  }

  /// Support & Legal Options Panel
  Widget _buildSupportPanel() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildMenuRow(
            label: 'Help & Support Desk',
            subtitle: 'Submit support tickets, FAQs and guides',
            iconPath: 'assets/icons/fleet_operator_icons/helpSupportA.svg',
            iconBg: const Color(0xFF10B981).withOpacity(0.15),
            iconColor: const Color(0xFF34D399),
            onTap: () => Get.toNamed(Routes.HELP_SUPPORT),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow(
            label: 'Privacy Policy',
            subtitle: 'Data security, encryption, and privacy rights',
            iconPath: 'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
            iconBg: const Color(0xFF06B6D4).withOpacity(0.15),
            iconColor: const Color(0xFF22D3EE),
            onTap: () => Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-FLEET-OPERATOR'}),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow(
            label: 'Terms & Conditions',
            subtitle: 'Service level agreements and governing policies',
            iconPath: 'assets/icons/fleet_operator_icons/securityA.svg',
            iconBg: const Color(0xFF6366F1).withOpacity(0.15),
            iconColor: const Color(0xFF818CF8),
            onTap: () => Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-FLEET-OPERATOR'}),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow(
            label: 'About VMOVEXA',
            subtitle: 'Platform version 1.0.0 (Enterprise Fleet Suite)',
            iconPath: 'assets/icons/fleet_operator_icons/AboutA.svg',
            iconBg: Colors.white.withOpacity(0.08),
            iconColor: Colors.white70,
            onTap: () {
              Get.defaultDialog(
                title: 'About VMOVEXA',
                titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                backgroundColor: AppColors.cardBg,
                content: Column(
                  children: [
                    Image.asset('assets/app_logo/newLogo.png', width: 140, height: 40),
                    const SizedBox(height: 12),
                    const Text(
                      'VMOVEXA Smart Fleet & Transit Console\nVersion 1.0.0 (Build 2026.10)\n\nSecure Enterprise Telematics, Real-Time Fleet Dispatch, and Digital Operations Engine.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                confirm: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                  ),
                  child: const Text('Close', style: TextStyle(color: Colors.white)),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMenuRow({
    required String label,
    required String subtitle,
    required String iconPath,
    required Color iconBg,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: SvgPicture.asset(
                  iconPath,
                  width: 18,
                  height: 18,
                  colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }
}
