import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../routes/app_routes.dart';
import '../controllers/advertiser_profile_controller.dart';

class AdvertiserProfileView extends GetView<AdvertiserProfileController> {
  const AdvertiserProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Brand Profile',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_note_rounded, color: Color(0xFF8B5CF6), size: 24),
                    onPressed: () => Get.toNamed(Routes.ADVERTISER_EDIT_PROFILE),
                    tooltip: 'Edit Profile',
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
                    onPressed: () => controller.loadProfileData(),
                    tooltip: 'Refresh Profile',
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: AdvertiserProfileContent(controller: controller),
            ),
          ],
        ),
      ),
    );
  }
}

/// Unified Profile Content widget matching AdvertiserProfilePage.jsx
class AdvertiserProfileContent extends StatelessWidget {
  final AdvertiserProfileController controller;
  final bool showHeaderBanner;

  const AdvertiserProfileContent({
    super.key,
    required this.controller,
    this.showHeaderBanner = true,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(
          child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
        );
      }

      return RefreshIndicator(
        onRefresh: controller.loadProfileData,
        color: const Color(0xFF8B5CF6),
        backgroundColor: AppColors.cardBg,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          children: [
            // 1. Header Banner (with Logout)
            if (showHeaderBanner) ...[
              _buildHeaderBanner(),
              const SizedBox(height: 16),
            ],

            // 2. Hero Profile Card & 3 Stat Pills
            _buildHeroProfileCard(),
            const SizedBox(height: 20),

            // 3. Account & Security Section
            _buildAccountSecuritySection(),
            const SizedBox(height: 20),

            // 4. Helpdesk & Legal Section
            _buildHelpdeskLegalSection(),
            const SizedBox(height: 20),

            // 5. Logout Button (Below Terms & Conditions)
            _buildLogoutButton(),
            const SizedBox(height: 32),
          ],
        ),
      );
    });
  }

  // ==========================================================
  // 1. HEADER BANNER
  // ==========================================================
  Widget _buildHeaderBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Profile & Account',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 4),
          Text(
            'Manage your advertiser account credentials, brand profiles, and security preferences.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.35),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // 2. HERO PROFILE CARD MATCHING ADMIN PANEL
  // ==========================================================
  Widget _buildHeroProfileCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar with Online Indicator
              Stack(
                children: [
                  Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFF334155), width: 1.5),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Obx(() {
                        final url = controller.resolvedAvatarUrl;
                        if (url.isNotEmpty) {
                          return Image.network(
                            url,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(),
                          );
                        }
                        return _buildAvatarFallback();
                      }),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF1E293B), width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Name, Role & Company
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Obx(() => Text(
                                controller.displayName.value,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              )),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                      ),
                      child: Obx(() => Text(
                            controller.displayRole.value,
                            style: const TextStyle(
                              color: Color(0xFF93C5FD),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          )),
                    ),
                    const SizedBox(height: 6),
                    Obx(() => Text(
                          controller.orgName.value,
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5, fontWeight: FontWeight.w500),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )),
                    const SizedBox(height: 2),
                    Obx(() => Text(
                          'Advertiser ID: ${controller.advId.value}',
                          style: const TextStyle(color: Color(0xFF64748B), fontSize: 10, fontFamily: 'monospace'),
                        )),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFF334155), height: 1),
          const SizedBox(height: 14),

          // 3 Core Stat Pills (Campaigns, Active, Wallet Balance)
          Row(
            children: [
              // Pill 1: Campaigns
              Expanded(
                child: Obx(() => _buildStatPill(
                      label: 'CAMPAIGNS',
                      val: '${controller.campaignCount.value}',
                      valColor: Colors.white,
                    )),
              ),
              const SizedBox(width: 8),

              // Pill 2: Active
              Expanded(
                child: Obx(() => _buildStatPill(
                      label: 'ACTIVE',
                      val: '${controller.activeCampaigns.value}',
                      valColor: const Color(0xFF10B981),
                    )),
              ),
              const SizedBox(width: 8),

              // Pill 3: Wallet Balance
              Expanded(
                child: Obx(() => _buildStatPill(
                      label: 'WALLET BALANCE',
                      val: controller.walletBalance.value,
                      valColor: const Color(0xFF60A5FA),
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback() {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppTheme.primaryGradient,
      ),
      child: Center(
        child: Obx(() {
          final name = controller.displayName.value;
          final initials = name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase();
          return Text(
            initials.isNotEmpty ? initials : 'AD',
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          );
        }),
      ),
    );
  }

  Widget _buildStatPill({required String label, required String val, required Color valColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.3),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            val,
            style: TextStyle(color: valColor, fontSize: 15, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // 3. ACCOUNT & SECURITY SECTION
  // ==========================================================
  Widget _buildAccountSecuritySection() {
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
          const Text(
            'ACCOUNT & SECURITY',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),

          // 1. Account Settings (Edit Profile)
          _buildActionItem(
            icon: Icons.person_outline_rounded,
            title: 'Account Settings',
            subtitle: 'Update personal contact details and brand information',
            iconColor: const Color(0xFF3B82F6),
            onTap: () => Get.toNamed(Routes.ADVERTISER_EDIT_PROFILE),
          ),
          const SizedBox(height: 10),

          // 2. Security & Password
          _buildActionItem(
            icon: Icons.key_rounded,
            title: 'Security & Password',
            subtitle: 'Change your access credentials and protect your account',
            iconColor: const Color(0xFFF59E0B),
            onTap: () => Get.toNamed(Routes.ADVERTISER_CHANGE_PASSWORD),
          ),
          const SizedBox(height: 10),

          // 3. Notification Settings
          _buildActionItem(
            icon: Icons.notifications_none_rounded,
            title: 'Notification Settings',
            subtitle: 'Choose how and when you receive campaign & system alerts',
            iconColor: const Color(0xFF8B5CF6),
            onTap: () => Get.toNamed(Routes.ADVERTISER_NOTIFICATION_SETTINGS),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // 4. HELPDESK & LEGAL SECTION
  // ==========================================================
  Widget _buildHelpdeskLegalSection() {
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
          const Text(
            'HELPDESK & LEGAL',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),

          // 1. Help & Support
          _buildActionItem(
            icon: Icons.headset_mic_outlined,
            title: 'Help & Support',
            subtitle: 'Reach our support desk for campaign, slot, or billing issues',
            iconColor: const Color(0xFF06B6D4),
            onTap: () => Get.toNamed(Routes.ADVERTISER_HELP_SUPPORT),
          ),
          const SizedBox(height: 10),

          // 2. Privacy Policy
          _buildActionItem(
            icon: Icons.shield_outlined,
            title: 'Privacy Policy',
            subtitle: 'Review how VMOVEXA processes and protects your data',
            iconColor: const Color(0xFF10B981),
            onTap: () => Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-ADVERTISER'}),
          ),
          const SizedBox(height: 10),

          // 3. Terms & Conditions
          _buildActionItem(
            icon: Icons.description_outlined,
            title: 'Terms & Conditions',
            subtitle: 'Read platform usage terms, media flight guidelines, and SLA',
            iconColor: const Color(0xFF8B5CF6),
            onTap: () => Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-ADVERTISER'}),
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: iconColor.withValues(alpha: 0.3)),
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildLogoutButton() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3), width: 1.2),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: controller.logout,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Log Out of Account',
                  style: TextStyle(
                    color: Color(0xFFEF4444),
                    fontSize: 13.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}