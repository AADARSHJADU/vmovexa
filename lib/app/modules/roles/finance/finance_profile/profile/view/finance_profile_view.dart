import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../model/profile_settings_models.dart';
import '../controller/finance_profile_controller.dart';

class FinanceProfileView extends GetView<FinanceProfileController> {
  const FinanceProfileView({super.key});

  static const Color kBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorder = Color(0xFF334155);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kBlue = Color(0xFF3B82F6);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.profileDetails.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPrimaryIndigo))
              : RefreshIndicator(
                  color: kPrimaryIndigo,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildIdentityCard(),
                      const SizedBox(height: 14),
                      _build3CoreStatPills(),
                      const SizedBox(height: 20),
                      const Text(
                        'Officer & Tax Details',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildProfileDetailsCard(),
                      const SizedBox(height: 20),
                      const Text(
                        'Account & Legal',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.corporate_fare_outlined,
                        title: 'Corporate & Invoicing Settings',
                        subtitle: 'Legal entity, GST/PAN, bank accounts & invoice templates',
                        onTap: controller.onCorporateSettingsTap,
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.lock_outline,
                        title: 'Security & Password',
                        subtitle: 'Change portal password and credentials',
                        onTap: controller.onSecurityTap,
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.notifications_none_outlined,
                        title: 'Notification Preferences',
                        subtitle: 'Invoice generation alerts, gateway settlements & reminders',
                        onTap: controller.onNotificationSettingsTap,
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.help_outline,
                        title: 'Help & Documentation',
                        subtitle: 'GST filing guides, reconciliation FAQs, and dispute desk',
                        onTap: controller.onHelpSupportTap,
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.privacy_tip_outlined,
                        title: 'Privacy Policy',
                        subtitle: 'Platform data governance and privacy policies',
                        onTap: controller.onPrivacyPolicyTap,
                      ),
                      const SizedBox(height: 10),
                      _buildMenuRow(
                        icon: Icons.description_outlined,
                        title: 'Terms & SLAs',
                        subtitle: 'Corporate billing contracts and SLA agreements',
                        onTap: controller.onTermsTap,
                      ),
                      const SizedBox(height: 16),
                      _buildMenuRow(
                        icon: Icons.logout,
                        title: 'Log Out',
                        subtitle: 'Sign out from this Finance Officer session',
                        iconColor: Colors.redAccent,
                        titleColor: Colors.redAccent,
                        onTap: controller.onLogout,
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // 1. Header (Mirroring FinanceProfilePage.jsx)
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Finance Portal  /  ',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
            const Text(
              'Finance Profile',
              style: TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            IconButton(
              onPressed: controller.onRefresh,
              icon: const Icon(Icons.refresh, color: Colors.white70, size: 18),
              tooltip: 'Refresh Profile',
            ),
          ],
        ),
        const SizedBox(height: 2),
        const Text(
          'Profile & Finance Account',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 3),
        const Text(
          'Manage finance credentials, tax authorizations, security, and billing desk support',
          style: TextStyle(
            color: Colors.white54,
            fontSize: 11.5,
          ),
        ),
      ],
    );
  }

  // 2. Identity card (Officer Name, Role, Org, Finance ID)
  Widget _buildIdentityCard() {
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
          CircleAvatar(
            radius: 26,
            backgroundColor: kPrimaryIndigo,
            child: Obx(
              () => Text(
                controller.initials.value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Obx(
              () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: kPrimaryIndigo.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: kPrimaryIndigo.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          controller.roleLabel.value,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 10,
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

  // 3. Core Stat Pills (Revenue, Invoices, Settled)
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
              fontSize: 15,
              fontWeight: FontWeight.w900,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // 4. Officer & Tax details card
  Widget _buildProfileDetailsCard() {
    return Obx(
      () => Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          children: List.generate(controller.profileDetails.length, (index) {
            final row = controller.profileDetails[index];
            final isLast = index == controller.profileDetails.length - 1;
            return Column(
              children: [
                _ProfileDetailTile(row: row),
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
      ),
    );
  }

  // 5. Generic menu row
  Widget _buildMenuRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? iconColor,
    Color? titleColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: (iconColor ?? kPrimaryIndigo).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor ?? kPrimaryIndigo, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: titleColor ?? Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
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
            Icon(
              Icons.chevron_right,
              color: titleColor ?? const Color(0xFF94A3B8),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileDetailTile extends StatelessWidget {
  final ProfileDetailRow row;

  const _ProfileDetailTile({required this.row});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Icon(row.icon, color: const Color(0xFF94A3B8), size: 18),
          const SizedBox(width: 12),
          Text(
            row.label,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              row.value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
