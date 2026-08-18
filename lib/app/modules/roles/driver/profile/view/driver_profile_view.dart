import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/controller/driver_profile_controller.dart';

import '../model/driver_document.dart';

class DriverProfileView extends GetView<DriverProfileController> {
  const DriverProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
              () => controller.isLoading.value && controller.documents.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
            color: kPurple,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 8),
                _buildHeader(),
                const SizedBox(height: 16),
                _buildIdentityCard(),
                const SizedBox(height: 14),
                _buildStatsRow(),
                const SizedBox(height: 20),
                _buildSectionTitle('Account'),
                const SizedBox(height: 10),
                _buildAccountCard(),
                const SizedBox(height: 20),
                _buildSectionTitle('Documents'),
                const SizedBox(height: 10),
                _buildDocumentsCard(),
                const SizedBox(height: 20),
                _buildSectionTitle('Support'),
                const SizedBox(height: 10),
                _buildSupportCard(),
                const SizedBox(height: 20),
                _buildLogoutButton(),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Expanded(
          child: Center(
            child: Text('Profile', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }

  // ---------------- Identity card ----------------
  Widget _buildIdentityCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [kPurple, kIndigo]),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person, color: Colors.white, size: 30),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: controller.onChangeAvatar,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: kPurple,
                          shape: BoxShape.circle,
                          border: Border.all(color: kCardBg, width: 2),
                        ),
                        child: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 11),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Obx(
                      () => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(controller.fullName.value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(controller.roleLabel.value, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: controller.onViewCompanyDetails,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.business_outlined, color: kPurple, size: 15),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Obx(
                          () => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(controller.companyName.value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text('Driver ID: ${controller.driverId.value}', style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                        ],
                      ),
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Stats row ----------------
  Widget _buildStatsRow() {
    return Obx(
          () => Row(
        children: [
          Expanded(child: _StatPill(icon: Icons.directions_bus_filled_outlined, count: '${controller.routesCount.value}', label: 'Routes', onTap: () => controller.onStatTap('Routes'))),
          const SizedBox(width: 8),
          Expanded(child: _StatPill(icon: Icons.calendar_today_outlined, count: '${controller.schedulesCount.value}', label: 'Schedules', onTap: () => controller.onStatTap('Schedules'))),
          const SizedBox(width: 8),
          Expanded(child: _StatPill(icon: Icons.notifications_none_rounded, count: '${controller.notificationsCount.value}', label: 'Notifications', onTap: () => controller.onStatTap('Notifications'))),
          const SizedBox(width: 8),
          Expanded(child: _StatPill(icon: Icons.description_outlined, count: '${controller.documentsCount.value}', label: 'Documents', onTap: () => controller.onStatTap('Documents'))),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700));
  }

  // ---------------- Account card ----------------
  Widget _buildAccountCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          _MenuRow(
            icon: Icons.person_outline,
            title: 'Personal Information',
            subtitle: 'View and update your details',
            onTap: controller.onPersonalInformationTap,
          ),
          _rowDivider(),
          _MenuRow(
            icon: Icons.lock_outline,
            title: 'Security',
            subtitle: 'Change password',
            onTap: controller.onSecurityTap,
          ),
          _rowDivider(),
          _MenuRow(
            icon: Icons.notifications_none_rounded,
            title: 'Notification Preferences',
            subtitle: 'Manage notification settings',
            onTap: controller.onNotificationPreferencesTap,
            isLast: true,
          ),
        ],
      ),
    );
  }

  // ---------------- Documents card ----------------
  Widget _buildDocumentsCard() {
    return Obx(
          () => Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          children: List.generate(controller.documents.length, (index) {
            final doc = controller.documents[index];
            final isLast = index == controller.documents.length - 1;
            return Column(
              children: [
                _DocumentRow(document: doc, onTap: () => controller.onDocumentTap(doc)),
                if (!isLast) _rowDivider(),
              ],
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Support card ----------------
  Widget _buildSupportCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          _MenuRow(
            icon: Icons.support_agent_outlined,
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
            onTap: controller.onHelpSupportTap,
          ),
          _rowDivider(),
          _MenuRow(
            icon: Icons.info_outline,
            title: 'About VMOVEXA',
            subtitle: 'App version 1.0.0',
            onTap: controller.onAboutTap,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _rowDivider() => Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14);

  // ---------------- Logout ----------------
  Widget _buildLogoutButton() {
    return GestureDetector(
      onTap: controller.onLogout,
      child: Container(
        width: double.infinity,
        height: 50,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [kBlue, kIndigo]),
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout, color: Colors.white, size: 17),
            SizedBox(width: 8),
            Text('Logout', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Stat pill (Routes / Schedules / Notifications / Documents)
// =====================================================================
class _StatPill extends StatelessWidget {
  final IconData icon;
  final String count;
  final String label;
  final VoidCallback onTap;

  const _StatPill({required this.icon, required this.count, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        decoration: BoxDecoration(
          color: DriverProfileView.kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: DriverProfileView.kBorder),
        ),
        child: Column(
          children: [
            Icon(icon, color: DriverProfileView.kPurple, size: 16),
            const SizedBox(height: 6),
            Text(count, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white38, fontSize: 8.5)),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Menu row (Account / Support sections)
// =====================================================================
class _MenuRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool isLast;

  const _MenuRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: DriverProfileView.kPurple.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: DriverProfileView.kPurple, size: 17),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 18),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Document row with status badge
// =====================================================================
class _DocumentRow extends StatelessWidget {
  final DriverDocument document;
  final VoidCallback onTap;

  const _DocumentRow({required this.document, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: DriverProfileView.kPurple.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(document.icon, color: DriverProfileView.kPurple, size: 16),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(document.title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
              decoration: BoxDecoration(
                color: document.status.color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                document.statusLabel,
                style: TextStyle(color: document.status.color, fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}