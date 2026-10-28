import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/finance_profile_controller.dart';

class FinanceProfileView extends GetView<FinanceProfileController> {
  const FinanceProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kGreen = Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    final c = Get.isRegistered<FinanceProfileController>()
        ? Get.find<FinanceProfileController>()
        : Get.put(FinanceProfileController());

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (c.totalRevenue.value == '₹0' && c.invoiceCount.value == '0' && c.settledCount.value == '₹0') {
        c.fetchProfileData();
      }
    });

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value
              ? const Center(child: CircularProgressIndicator(color: kPurple,))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildIdentityHeroCard(),
                      const SizedBox(height: 14),
                      _build3CoreStatPills(),
                      const SizedBox(height: 22),

                      // Section 1: Account & Security (Admin Panel Mirror)
                      const Text(
                        'ACCOUNT & SECURITY',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildMenuCard([
                        _MenuItem(
                          icon: Icons.person_outline,
                          iconColor: const Color(0xFF60A5FA),
                          title: 'Personal Profile Settings',
                          subtitle: 'Officer identity, contact details, profile photo & language preferences',
                          onTap: controller.onPersonalProfileSettingsTap,
                          trailingText: 'Edit →',
                        ),
                        // _MenuItem(
                        //   icon: Icons.corporate_fare_outlined,
                        //   iconColor: const Color(0xFF818CF8),
                        //   title: 'Corporate & Invoicing Settings',
                        //   subtitle: 'VMOVEXA legal entity, GST/PAN, bank accounts & invoice templates',
                        //   onTap: controller.onCorporateSettingsTap,
                        // ),
                        _MenuItem(
                          icon: Icons.lock_outline,
                          iconColor: const Color(0xFFFBBF24),
                          title: 'Security & Password',
                          subtitle: 'Change billing portal password and audit credentials',
                          onTap: controller.onSecurityTap,
                        ),
                        _MenuItem(
                          icon: Icons.notifications_none_outlined,
                          iconColor: const Color(0xFFA78BFA),
                          title: 'Notification Settings',
                          subtitle: 'Invoice generation alerts, gateway settlements, and reminders',
                          onTap: controller.onNotificationSettingsTap,
                        ),
                      ]),

                      const SizedBox(height: 22),

                      // Section 2: Helpdesk & Legal (Admin Panel Mirror)
                      const Text(
                        'HELPDESK & LEGAL',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildMenuCard([
                        _MenuItem(
                          icon: Icons.headset_mic_outlined,
                          iconColor: const Color(0xFF38BDF8),
                          title: 'Help & Support',
                          subtitle: 'GST filing guides, reconciliation FAQs, and dispute desk',
                          onTap: controller.onHelpSupportTap,
                        ),
                        _MenuItem(
                          icon: Icons.shield_outlined,
                          iconColor: const Color(0xFF34D399),
                          title: 'Privacy Policy',
                          subtitle: 'Financial data encryption, banking compliance, and privacy',
                          onTap: controller.onPrivacyPolicyTap,
                        ),
                        _MenuItem(
                          icon: Icons.description_outlined,
                          iconColor: const Color(0xFFF472B6),
                          title: 'Terms & Conditions',
                          subtitle: 'Commercial SLA, corporate tax policies, and refund rules',
                          onTap: controller.onTermsTap,
                        ),
                      ]),

                      const SizedBox(height: 20),

                      // Logout Row
                      InkWell(
                        onTap: controller.onLogout,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.2)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.logout, color: Color(0xFFEF4444), size: 18),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Logout Account',
                                  style: TextStyle(
                                    color: Color(0xFFEF4444),
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              Icon(Icons.chevron_right, color: Color(0xFFEF4444), size: 18),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // 1. Header with Breadcrumb and Edit Profile custom gradient button
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            // const Text(
            //   'Finance Portal  /  ',
            //   style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            // ),
            // const Text(
            //   'Finance Profile',
            //   style: TextStyle(
            //     color: Color(0xFF818CF8),
            //     fontSize: 11,
            //     fontWeight: FontWeight.w600,
            //   ),
            // ),
            // const Spacer(),
            // IconButton(
            //   onPressed: controller.onRefresh,
            //   icon: const Icon(Icons.refresh, color: Colors.white70, size: 18),
            //   tooltip: 'Refresh Profile',
            // ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Profile & Finance Account',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Manage finance credentials, tax authorizations & preferences',
                    style: TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            CustomButton(
              text: 'Edit Profile',
              isGradient: true,
              width: 125,
              height: 38,
              onTap: controller.onEditProfile,
              prefixIcon: const Icon(Icons.edit_outlined, color: Colors.white, size: 14),
            ),
          ],
        ),
      ],
    );
  }

  // 2. Identity Hero Card (Avatar with network image & camera quick upload, Name, Role, Org, ID)
  Widget _buildIdentityHeroCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Avatar Stack with network image & Camera quick upload
          Stack(
            children: [
              Obx(() {
                final url = controller.avatarUrl.value;
                final resolved = ApiConstants.resolveFileUrl(url);
                return Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: kPurple.withValues(alpha: 0.5), width: 1.5),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: resolved.isNotEmpty
                      ? Image.network(
                          resolved,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => _buildAvatarFallback(),
                        )
                      : _buildAvatarFallback(),
                );
              }),
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: controller.changeAvatar,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFB042FF), Color(0xFF6366F1)],
                      ),
                      shape: BoxShape.circle,
                      border: Border.all(color: kCardBg, width: 2),
                    ),
                    child: Obx(
                      () => controller.isUploadingAvatar.value
                          ? const SizedBox(
                              width: 10,
                              height: 10,
                              child: CircularProgressIndicator(
                                strokeWidth: 1.5,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.camera_alt, color: Colors.white, size: 10),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Obx(
              () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          controller.fullName.value,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: kIndigo.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: kIndigo.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          controller.roleLabel.value,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    controller.orgName.value,
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Finance ID: ${controller.financeId.value}',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback() {
    return Container(
      color: const Color(0xFF1E293B),
      alignment: Alignment.center,
      child: Obx(
        () => Text(
          controller.initials.value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // 3. Core Stat Pills (Revenue, Invoices, Settled) from real GET /finance/kpis
  Widget _build3CoreStatPills() {
    return Obx(
      () => Row(
        children: [
          Expanded(
            child: _buildStatPill(
              title: 'REVENUE',
              value: controller.totalRevenue.value,
              valueColor: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatPill(
              title: 'INVOICES',
              value: controller.invoiceCount.value,
              valueColor: const Color(0xFF60A5FA),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildStatPill(
              title: 'SETTLED',
              value: controller.settledCount.value,
              valueColor: const Color(0xFF34D399),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatPill({
    required String title,
    required String value,
    required Color valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 14.5,
              fontWeight: FontWeight.w900,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // Generic menu container
  Widget _buildMenuCard(List<_MenuItem> items) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: List.generate(items.length, (index) {
          final item = items[index];
          final isLast = index == items.length - 1;
          return Column(
            children: [
              InkWell(
                onTap: item.onTap,
                borderRadius: BorderRadius.circular(14),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: item.iconColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(item.icon, color: item.iconColor, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item.subtitle,
                              style: const TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 10.5,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      if (item.trailingText != null) ...[
                        Text(
                          item.trailingText!,
                          style: TextStyle(
                            color: item.iconColor,
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                      ] else ...[
                        const Icon(
                          Icons.chevron_right,
                          color: Color(0xFF64748B),
                          size: 16,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              if (!isLast)
                Divider(
                  color: kBorder,
                  height: 1,
                  indent: 14,
                  endIndent: 14,
                ),
            ],
          );
        }),
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? trailingText;

  _MenuItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.trailingText,
  });
}
