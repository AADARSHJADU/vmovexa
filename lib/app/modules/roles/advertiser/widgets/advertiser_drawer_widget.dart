import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../dashboard/controllers/advertiser_dashboard_controller.dart';
import '../profile/controllers/advertiser_profile_controller.dart';

class AdvertiserDrawerWidget extends StatelessWidget {
  const AdvertiserDrawerWidget({super.key});

  static const Color kDarkBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorderColor = Color(0xFF334155);

  @override
  Widget build(BuildContext context) {
    final profileCtrl = Get.isRegistered<AdvertiserProfileController>()
        ? Get.find<AdvertiserProfileController>()
        : Get.put(AdvertiserProfileController());

    return Drawer(
      backgroundColor: kDarkBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Advertiser Profile Header
            InkWell(
              onTap: () {
                Navigator.pop(context);
                _switchTab(4); // Navigate to Profile Tab
              },
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: kCardBg,
                  border: Border(
                    bottom: BorderSide(color: kBorderColor, width: 1),
                  ),
                ),
                child: Obx(() {
                  final u = profileCtrl.user.value ??
                      (Get.isRegistered<StorageService>() ? StorageService.to.getUser() : null);

                  final name = profileCtrl.displayName.value.isNotEmpty
                      ? profileCtrl.displayName.value
                      : (u?.companyName?.isNotEmpty == true
                          ? u!.companyName!
                          : (u?.organizationName?.isNotEmpty == true
                              ? u!.organizationName!
                              : (u?.name?.isNotEmpty == true ? u!.name! : 'Commercial Advertiser')));

                  final email = profileCtrl.email.value.isNotEmpty
                      ? profileCtrl.email.value
                      : (u?.email ?? 'advertiser@vmovexa.com');

                  final role = profileCtrl.displayRole.value.isNotEmpty
                      ? profileCtrl.displayRole.value
                      : (u?.role ?? 'COMMERCIAL ADVERTISER');

                  final rawAvatar = profileCtrl.avatarUrl.value.isNotEmpty
                      ? profileCtrl.avatarUrl.value
                      : (u?.avatarUrl ?? '');
                  final resolvedAvatar = ApiConstants.resolveFileUrl(rawAvatar);

                  final initial = name.trim().isNotEmpty ? name.trim()[0].toUpperCase() : 'A';

                  return Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppTheme.primaryGradient,
                          border: Border.all(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.5),
                            width: 1.5,
                          ),
                        ),
                        child: ClipOval(
                          child: resolvedAvatar.isNotEmpty
                              ? Image.network(
                                  resolvedAvatar,
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                  errorBuilder: (ctx, err, stack) => _buildInitials(initial),
                                  loadingBuilder: (ctx, child, progress) {
                                    if (progress == null) return child;
                                    return Center(
                                      child: SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          value: progress.expectedTotalBytes != null
                                              ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                              : null,
                                          color: Colors.white,
                                        ),
                                      ),
                                    );
                                  },
                                )
                              : _buildInitials(initial),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
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
                              email,
                              style: const TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 11.5,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                                ),
                              ),
                              child: Text(
                                role,
                                style: const TextStyle(
                                  color: Color(0xFF818CF8),
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),

            // Scrollable Menu Items (Exact Mirror of Admin Panel advertiserNavLinks)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12),
                children: [
                  // SECTION 1: OVERVIEW & CAMPAIGNS
                  _buildSectionHeader('CAMPAIGN MANAGEMENT'),
                  _buildMenuItem(
                    icon: Icons.dashboard_outlined,
                    label: 'Overview Dashboard',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(0);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.campaign_outlined,
                    label: 'Campaigns Hub',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(1);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.add_circle_outline_rounded,
                    label: 'Create New Campaign',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.CREATE_CAMPAIGN);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.account_tree_outlined,
                    label: 'Lifecycle & Flow',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(2);
                    },
                  ),

                  const SizedBox(height: 12),

                  // SECTION 2: PERFORMANCE & BILLING
                  _buildSectionHeader('PERFORMANCE & BILLING'),
                  _buildMenuItem(
                    icon: Icons.bar_chart_outlined,
                    label: 'Analytics & Heatmaps',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(3);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.description_outlined,
                    label: 'Report & Analytics',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.ADVERTISER_REPORTS);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'Billing & Revenue',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.ADVERTISER_BILLING);
                    },
                  ),

                  const SizedBox(height: 12),

                  // SECTION 3: BRAND & SETTINGS
                  _buildSectionHeader('ACCOUNT & PREFERENCES'),
                  _buildMenuItem(
                    icon: Icons.person_outline_rounded,
                    label: 'Profile',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(4);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.notifications_none_outlined,
                    label: 'Alerts & Messages',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.ADVERTISER_NOTIFICATIONS);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.lock_outline_rounded,
                    label: 'Change Password',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.ADVERTISER_CHANGE_PASSWORD);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.help_outline_rounded,
                    label: 'Help & Documentation',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.ADVERTISER_HELP_SUPPORT);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.privacy_tip_outlined,
                    label: 'Privacy Policy',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-ADVERTISER'});
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.gavel_outlined,
                    label: 'Terms & Conditions',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-ADVERTISER'});
                    },
                  ),
                ],
              ),
            ),

            // Logout Action
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: kBorderColor, width: 1),
                ),
              ),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                tileColor: Colors.red.withValues(alpha: 0.08),
                leading: const Icon(Icons.logout, color: Colors.redAccent, size: 22),
                title: const Text(
                  'Log Out',
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                onTap: () => _handleLogout(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _switchTab(int index) {
    if (Get.isRegistered<AdvertiserDashboardController>()) {
      Get.find<AdvertiserDashboardController>().changeTab(index);
    }
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF64748B),
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      dense: true,
      horizontalTitleGap: 12,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
      leading: Icon(icon, color: const Color(0xFF94A3B8), size: 20),
      title: Text(
        label,
        style: const TextStyle(
          color: Color(0xFFE2E8F0),
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: Color(0xFF475569),
        size: 16,
      ),
      onTap: onTap,
    );
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          backgroundColor: kCardBg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: kBorderColor),
          ),
          title: const Text(
            'Confirm Logout',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: const Text(
            'Are you sure you want to log out of your Commercial Advertiser account?',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 13,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text(
                'Cancel',
                style: TextStyle(color: Color(0xFF94A3B8)),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
                onPressed: () async {
                  Navigator.pop(ctx);
                  if (Get.isRegistered<AdvertiserDashboardController>()) {
                    Get.find<AdvertiserDashboardController>().logout();
                  } else {
                    Get.offAllNamed(Routes.LOGIN);
                  }
                },
                child: const Text(
                  'Log Out',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInitials(String initial) {
    return Center(
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
