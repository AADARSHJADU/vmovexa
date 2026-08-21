import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../model/profile_settings_models.dart';
import '../controller/finance_profile_controller.dart';

class FinanceProfileView extends GetView<FinanceProfileController> {
  const FinanceProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.profileDetails.isEmpty
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
                      const SizedBox(height: 20),
                      const Text('Profile Details', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      _buildProfileDetailsCard(),
                      const SizedBox(height: 16),
                      _buildDocumentsRow(),
                      const SizedBox(height: 12),
                      _buildMenuRow(icon: Icons.shield_outlined, title: 'Security', subtitle: 'Change password and manage account security', onTap: controller.onSecurityTap),
                      const SizedBox(height: 12),
                      _buildMenuRow(icon: Icons.settings_outlined, title: 'Settings', subtitle: 'Manage preferences, notifications and other settings', onTap: controller.onSettingsTap),
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
      children: [
        GestureDetector(onTap: controller.onBackPressed, child: const Icon(Icons.arrow_back, color: Colors.white)),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('My Profile', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('View and manage your profile details', style: TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onEditProfile,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.edit_outlined, color: kPurple, size: 14),
              SizedBox(width: 4),
              Text('Edit', style: TextStyle(color: kPurple, fontSize: 12.5, fontWeight: FontWeight.w700)),
            ],
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
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(gradient: LinearGradient(colors: [kPurple, kIndigo]), shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Obx(() => Text(controller.initials.value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700))),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: controller.onChangeAvatar,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: kFieldBg, shape: BoxShape.circle, border: Border.all(color: kCardBg, width: 2)),
                    child: const Icon(Icons.camera_alt_outlined, color: Colors.white70, size: 11),
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
                  Row(
                    children: [
                      Expanded(child: Text(controller.fullName.value, style: const TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w700))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: kGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(width: 6, height: 6, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            const Text('Active', style: TextStyle(color: kGreen, fontSize: 10, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(controller.roleLabel.value, style: const TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text(controller.email.value, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  const SizedBox(height: 2),
                  Text(controller.phone.value, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Profile details card ----------------
  Widget _buildProfileDetailsCard() {
    return Obx(
      () => Container(
        width: double.infinity,
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
        child: Column(
          children: List.generate(controller.profileDetails.length, (index) {
            final row = controller.profileDetails[index];
            final isLast = index == controller.profileDetails.length - 1;
            return Column(
              children: [
                _ProfileDetailTile(row: row, onTap: () => controller.onDetailRowTap(row)),
                if (!isLast) Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14),
              ],
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Documents row (with "View all") ----------------
  Widget _buildDocumentsRow() {
    return GestureDetector(
      onTap: controller.onDocumentsTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.description_outlined, color: kPurple, size: 18),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Documents', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                  SizedBox(height: 2),
                  Text('View and manage your uploaded documents', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
            ),
            GestureDetector(
              onTap: controller.onViewAllDocuments,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('View all', style: TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                  Icon(Icons.chevron_right, color: kPurple, size: 15),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Generic menu row (Security / Settings) ----------------
  Widget _buildMenuRow({required IconData icon, required String title, required String subtitle, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: kPurple, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
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
// Profile detail tile
// =====================================================================
class _ProfileDetailTile extends StatelessWidget {
  final ProfileDetailRow row;
  final VoidCallback onTap;

  const _ProfileDetailTile({required this.row, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Icon(row.icon, color: FinanceProfileView.kPurple, size: 16),
            const SizedBox(width: 10),
            Expanded(child: Text(row.label, style: const TextStyle(color: Colors.white54, fontSize: 12))),
            Text(row.value, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 15),
          ],
        ),
      ),
    );
  }
}
