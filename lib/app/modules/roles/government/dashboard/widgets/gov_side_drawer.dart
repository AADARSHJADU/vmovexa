import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controllers/government_dashboard_controller.dart';

class GovSideDrawer extends StatelessWidget {
  const GovSideDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<GovernmentDashboardController>();
    final authService = AuthService.to;
    final user = authService.currentUser;

    final officerName = user?.name ?? 'Government Official';
    final agencyName = user?.organization?.name ?? 'State Public Transit Agency';
    final rawAvatar = user?.avatarUrl;
    final avatarUrl = rawAvatar != null && rawAvatar.isNotEmpty
        ? ApiConstants.resolveFileUrl(rawAvatar)
        : '';

    return Drawer(
      backgroundColor: const Color(0xFF090D16),
      child: SafeArea(
        child: Column(
          children: [
            // 1. Top Drawer Header with Brand Logo & Close Button
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Image.asset(
                        'assets/app_logo/newLogo.png',
                        height: 32,
                        fit: BoxFit.contain,
                        errorBuilder: (ctx, err, stack) => const Text(
                          'VMOVEXA',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.3)),
                        ),
                        child: const Text(
                          'GOV',
                          style: TextStyle(color: Color(0xFFC084FC), fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.keyboard_double_arrow_left_rounded, color: Colors.white70, size: 24),
                    tooltip: 'Collapse Menu',
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
            ),

            // 2. Official Agency Badge & Officer Identity Card
            InkWell(
              onTap: () {
                Get.back();
                controller.selectedNavIndex.value = 4; // Profile tab
              },
              child: Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                        ),
                        border: Border.all(color: Colors.white24, width: 1.5),
                      ),
                      child: ClipOval(
                        child: avatarUrl.isNotEmpty
                            ? Image.network(
                                avatarUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => _buildInitials(officerName),
                              )
                            : _buildInitials(officerName),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
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
                              const Text(
                                'OFFICIAL STATE AGENCY',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            officerName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            agencyName,
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
                    const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 12),
                  ],
                ),
              ),
            ),

            // 3. Scrollable Navigation Sections matching Website Sidebar exactly
            Expanded(
              child: Obx(() {
                final currentIndex = controller.selectedNavIndex.value;
                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // --- OVERVIEW ---
                    _buildSectionHeader('OVERVIEW'),
                    _buildNavItem(
                      icon: Icons.dashboard_rounded,
                      title: 'Dashboard',
                      isActive: currentIndex == 0,
                      onTap: () {
                        Get.back();
                        controller.selectedNavIndex.value = 0;
                      },
                    ),

                    const SizedBox(height: 12),

                    // --- PUBLIC SERVICES ---
                    _buildSectionHeader('PUBLIC SERVICES'),
                    _buildNavItem(
                      icon: Icons.campaign_rounded,
                      title: 'Campaigns Hub',
                      isActive: currentIndex == 1,
                      onTap: () {
                        Get.back();
                        controller.selectedNavIndex.value = 1;
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.add_circle_outline_rounded,
                      title: 'Launch New Campaign',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN);
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.warning_amber_rounded,
                      title: 'Emergency Broadcast',
                      badge: 'ALERT',
                      badgeColor: const Color(0xFFEF4444),
                      isActive: currentIndex == 2,
                      onTap: () {
                        Get.back();
                        controller.selectedNavIndex.value = 2;
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.radar_rounded,
                      title: 'Sovereign Fleet Tracking',
                      badge: 'LIVE',
                      badgeColor: const Color(0xFF10B981),
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.LIVE_TRACKING);
                      },
                    ),

                    const SizedBox(height: 12),

                    // --- ANALYTICS & REPORTS ---
                    _buildSectionHeader('ANALYTICS & REPORTS'),
                    _buildNavItem(
                      icon: Icons.analytics_outlined,
                      title: 'Transit Analytics',
                      isActive: currentIndex == 3,
                      onTap: () {
                        Get.back();
                        controller.selectedNavIndex.value = 3;
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.insert_chart_outlined_rounded,
                      title: 'Reports & Analytics',
                      onTap: () {
                        Get.back();
                        _showReportsDialog(context, controller);
                      },
                    ),

                    const SizedBox(height: 12),

                    // --- BILLING & ALERTS ---
                    _buildSectionHeader('BILLING & ALERTS'),
                    _buildNavItem(
                      icon: Icons.receipt_long_outlined,
                      title: 'Billing & Invoices',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.GOV_BILLING);
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.notifications_none_rounded,
                      title: 'Alerts & Messages',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.NOTIFICATIONS_LIST);
                      },
                    ),

                    const SizedBox(height: 12),

                    // --- ACCOUNT & LEGAL ---
                    _buildSectionHeader('ACCOUNT & LEGAL'),
                    _buildNavItem(
                      icon: Icons.person_outline_rounded,
                      title: 'Profile',
                      isActive: currentIndex == 4,
                      onTap: () {
                        Get.back();
                        controller.selectedNavIndex.value = 4;
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.settings_outlined,
                      title: 'Account Settings',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.ACCOUNT_SETTINGS);
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.help_outline_rounded,
                      title: 'Help & Documentation',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.HELP_SUPPORT);
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.privacy_tip_outlined,
                      title: 'Privacy Policy',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.PRIVACY_POLICY);
                      },
                    ),
                    _buildNavItem(
                      icon: Icons.description_outlined,
                      title: 'Terms of Service',
                      onTap: () {
                        Get.back();
                        Get.toNamed(Routes.TERMS_CONDITIONS);
                      },
                    ),
                  ],
                );
              }),
            ),

            // 4. Logout Portal Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1)),
              ),
              child: InkWell(
                onTap: () => _showLogoutDialog(context, authService),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Logout Portal',
                        style: TextStyle(
                          color: Color(0xFFEF4444),
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 10, top: 8, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 9.5,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isActive = false,
    String? badge,
    Color? badgeColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: isActive
            ? const LinearGradient(
                colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6), Color(0xFFD946EF)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              )
            : null,
      ),
      child: ListTile(
        dense: true,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        leading: Icon(
          icon,
          color: isActive ? Colors.white : const Color(0xFF94A3B8),
          size: 19,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isActive ? Colors.white : const Color(0xFFCBD5E1),
            fontSize: 12,
            fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: (badgeColor ?? const Color(0xFF3B82F6)).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: badgeColor ?? const Color(0xFF3B82F6), width: 0.8),
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    color: badgeColor ?? const Color(0xFF3B82F6),
                    fontSize: 8.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }

  Widget _buildInitials(String name) {
    final initials = name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join();
    return Center(
      child: Text(
        initials.isNotEmpty ? initials.toUpperCase() : 'GO',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
      ),
    );
  }

  void _showReportsDialog(BuildContext context, GovernmentDashboardController controller) {
    Get.dialog(
      Dialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Compliance & Audit Reports',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted, size: 18),
                    onPressed: () => Get.back(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Download verified public broadcast logs, transit reach verification, and official compliance certificates.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
              ),
              const SizedBox(height: 16),
              _buildReportOption(
                title: 'Broadcast Delivery Audit (PDF)',
                subtitle: '${controller.campaigns.length} campaigns logged across active transit fleets',
                icon: Icons.picture_as_pdf_rounded,
                color: Colors.redAccent,
              ),
              const SizedBox(height: 10),
              _buildReportOption(
                title: 'Citizen Engagement Manifest (CSV)',
                subtitle: '${controller.calculatedTotalQrScans} QR interactions recorded',
                icon: Icons.table_chart_rounded,
                color: const Color(0xFF10B981),
              ),
              const SizedBox(height: 10),
              _buildReportOption(
                title: 'Emergency Advisory Compliance Record',
                subtitle: '${controller.emergencyBroadcasts.length} alerts archived',
                icon: Icons.security_rounded,
                color: const Color(0xFF8B5CF6),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReportOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded, color: Color(0xFF3B82F6), size: 20),
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Report Exported',
                '$title has been generated and downloaded.',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFF10B981),
                colorText: Colors.white,
              );
            },
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthService authService) {
    Get.dialog(
      AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Logout Portal?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: const Text(
          'Are you sure you want to log out from the Government Transit Portal?',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              await authService.logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
