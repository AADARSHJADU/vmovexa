import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/goverment_profile_controller.dart';
import '../../dashboard/controllers/government_dashboard_controller.dart';

class GovernmentProfileView extends StatelessWidget {
  const GovernmentProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<GovernmentProfileController>()
        ? Get.find<GovernmentProfileController>()
        : Get.put(GovernmentProfileController());

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Navigation Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => Scaffold.of(context).openDrawer(),
                ),
                const Text(
                  'Officer Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Refresh Profile',
                      onPressed: c.loadProfileData,
                    ),
                    const SizedBox(width: 12),
                    InkWell(
                      onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: SvgPicture.asset(
                          'assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',
                          width: 20,
                          height: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Main Scrollable Content with Pull-To-Refresh
          Expanded(
            child: RefreshIndicator(
              onRefresh: c.loadProfileData,
              color: const Color(0xFF6366F1),
              backgroundColor: const Color(0xFF1E293B),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Hero Officer Profile Card
                    _buildHeroProfileCard(c),
                    const SizedBox(height: 18),

                    // 2. 3 Core Metric Stat Pills matching Web
                    _buildStatsRow(c),
                    const SizedBox(height: 24),

                    // 3. Account & Security Section
                    const Text(
                      'ACCOUNT & SECURITY',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildAccountSecurityPanel(),
                    const SizedBox(height: 24),

                    // 4. Helpdesk & Legal Section
                    const Text(
                      'HELPDESK & LEGAL',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildHelpdeskLegalPanel(),
                    const SizedBox(height: 32),

                    // 5. Logout Account Button
                    OutlinedButton.icon(
                      onPressed: () => c.confirmLogout(context),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: const Color(0xFFEF4444).withValues(alpha: 0.5), width: 1.2),
                        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.08),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 1. Hero Officer Profile Card with online badge & photo changer
  Widget _buildHeroProfileCard(GovernmentProfileController c) {
    return Obx(() {
      final avatar = c.avatarUrl;
      final isUploading = c.isUploadingPhoto.value;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Circular Avatar with online indicator & camera overlay
            GestureDetector(
              onTap: c.changePhoto,
              child: Stack(
                children: [
                  Container(
                    width: 74,
                    height: 74,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF0F172A),
                      border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4), width: 2),
                      image: avatar.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(avatar),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: avatar.isEmpty
                        ? const Center(
                            child: Icon(Icons.person_rounded, color: Colors.white70, size: 38),
                          )
                        : null,
                  ),

                  // Uploading spinner or edit camera icon
                  if (isUploading)
                    Container(
                      width: 74,
                      height: 74,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black.withValues(alpha: 0.6),
                      ),
                      child: const Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        ),
                      ),
                    )
                  else
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.cardBg, width: 2),
                        ),
                        child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 12),
                      ),
                    ),

                  // Emerald Online status dot (top right)
                  Positioned(
                    top: 2,
                    right: 2,
                    child: Container(
                      width: 13,
                      height: 13,
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

            // Officer Information
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          c.officerName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),

                  // Role Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: const Color(0x203B82F6),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0x603B82F6), width: 0.8),
                    ),
                    child: Text(
                      c.officerRole,
                      style: const TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Department / Organization
                  Row(
                    children: [
                      const Icon(Icons.account_balance_rounded, color: Color(0xFF94A3B8), size: 12),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          c.officerOrg,
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),

                  // Officer Badge ID
                  Text(
                    'Badge ID: ${c.officerId}',
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  /// 2. 3 Core Metric Stat Pills matching Web
  Widget _buildStatsRow(GovernmentProfileController c) {
    return Obx(() {
      final isLoading = c.isLoadingStats.value;
      final campaigns = c.campaignsCount.value;
      final broadcasts = c.broadcastsCount.value;
      final monitored = c.monitoredUnitsCount.value;

      return Row(
        children: [
          // 1. Campaigns
          Expanded(
            child: _buildStatItem(
              label: 'CAMPAIGNS',
              value: isLoading ? '...' : campaigns.toString(),
              valueColor: Colors.white,
              iconColor: const Color(0xFF818CF8),
              icon: Icons.campaign_rounded,
              onTap: () {
                if (Get.isRegistered<GovernmentDashboardController>()) {
                  Get.find<GovernmentDashboardController>().selectedNavIndex.value = 1;
                }
              },
            ),
          ),
          const SizedBox(width: 8),

          // 2. Broadcasts (Red accent matching Web)
          Expanded(
            child: _buildStatItem(
              label: 'BROADCASTS',
              value: isLoading ? '...' : broadcasts.toString(),
              valueColor: const Color(0xFFEF4444),
              iconColor: const Color(0xFFEF4444),
              icon: Icons.warning_amber_rounded,
              onTap: () {
                if (Get.isRegistered<GovernmentDashboardController>()) {
                  Get.find<GovernmentDashboardController>().selectedNavIndex.value = 2;
                }
              },
            ),
          ),
          const SizedBox(width: 8),

          // 3. Monitored Units (Blue accent matching Web)
          Expanded(
            child: _buildStatItem(
              label: 'MONITORED',
              value: isLoading ? '...' : monitored.toString(),
              valueColor: const Color(0xFF3B82F6),
              iconColor: const Color(0xFF3B82F6),
              icon: Icons.directions_bus_rounded,
              onTap: () {
                Get.toNamed(Routes.LIVE_TRACKING);
              },
            ),
          ),
        ],
      );
    });
  }

  Widget _buildStatItem({
    required String label,
    required String value,
    required Color valueColor,
    required Color iconColor,
    required IconData icon,
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
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                color: valueColor,
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
                letterSpacing: 0.4,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  /// 3. Account & Security Panel matching Web GovProfilePage
  Widget _buildAccountSecurityPanel() {
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
            subtitle: 'Department details, ministry clearance, and contact info',
            iconData: Icons.badge_outlined,
            iconColor: const Color(0xFF3B82F6),
            onTap: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
          ),
          const Divider(color: AppColors.cardBorder, height: 14),
          _buildMenuRow(
            label: 'Security & Password',
            subtitle: 'Change official password and security clearance',
            iconData: Icons.lock_outline_rounded,
            iconColor: const Color(0xFF8B5CF6),
            onTap: () => Get.toNamed(Routes.CHANGE_PASSWORD),
          ),
          const Divider(color: AppColors.cardBorder, height: 14),
          _buildMenuRow(
            label: 'Notification Settings',
            subtitle: 'Emergency broadcast alarms, compliance dispatches, and alerts',
            iconData: Icons.notifications_none_rounded,
            iconColor: const Color(0xFFF59E0B),
            onTap: () => Get.toNamed(Routes.NOTIFICATION_SETTINGS),
          ),
        ],
      ),
    );
  }

  /// 4. Helpdesk & Legal Panel matching Web GovProfilePage
  Widget _buildHelpdeskLegalPanel() {
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
            label: 'Help & Support',
            subtitle: 'Public transit docs, regulatory FAQs, and ministry support',
            iconData: Icons.headset_mic_outlined,
            iconColor: const Color(0xFF10B981),
            onTap: () => Get.toNamed(Routes.HELP_SUPPORT),
          ),
          const Divider(color: AppColors.cardBorder, height: 14),
          _buildMenuRow(
            label: 'Privacy Policy',
            subtitle: 'Sovereign citizen data privacy, security encryption, and audit',
            iconData: Icons.shield_outlined,
            iconColor: const Color(0xFF06B6D4),
            onTap: () => Get.toNamed(Routes.PRIVACY_POLICY),
          ),
          const Divider(color: AppColors.cardBorder, height: 14),
          _buildMenuRow(
            label: 'Terms & Conditions',
            subtitle: 'Statutory governance SLAs, public notices, and usage terms',
            iconData: Icons.description_outlined,
            iconColor: const Color(0xFF94A3B8),
            onTap: () => Get.toNamed(Routes.TERMS_CONDITIONS),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuRow({
    required String label,
    required String subtitle,
    required IconData iconData,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: iconColor.withValues(alpha: 0.25), width: 1),
              ),
              child: Icon(iconData, color: iconColor, size: 18),
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
                      height: 1.25,
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
