import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../model/profile_settings_models.dart';
import '../controller/finance_settings_controller.dart';

class FinanceSettingsView extends GetView<FinanceSettingsController> {
  const FinanceSettingsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kRed = Color(0xFFFF4D4D);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 8),
            _buildHeader(),
            const SizedBox(height: 16),
            _buildIdentityRow(),
            const SizedBox(height: 22),
            _buildSectionLabel('Account'),
            const SizedBox(height: 10),
            _buildMenuCard(controller.accountItems),
            const SizedBox(height: 22),
            _buildSectionLabel('Preferences'),
            const SizedBox(height: 10),
            _buildMenuCard(controller.preferenceItems),
            const SizedBox(height: 22),
            _buildSectionLabel('App'),
            const SizedBox(height: 10),
            _buildMenuCard(controller.appItems),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(onTap: controller.onBackPressed, child: const Icon(Icons.arrow_back, color: Colors.white)),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Manage your preferences and app settings', style: TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Identity row (tap -> profile) ----------------
  Widget _buildIdentityRow() {
    return GestureDetector(
      onTap: controller.onHeaderTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
        child: Row(
          children: [
            Stack(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: const BoxDecoration(gradient: LinearGradient(colors: [kPurple, kIndigo]), shape: BoxShape.circle),
                  alignment: Alignment.center,
                  child: Obx(() => Text(controller.initials.value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700))),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(color: kCardBg, shape: BoxShape.circle, border: Border.all(color: kBg, width: 1.5)),
                    child: const Icon(Icons.camera_alt_outlined, color: Colors.white54, size: 10),
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
                    Text(controller.fullName.value, style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(controller.roleLabel.value, style: const TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(controller.email.value, style: const TextStyle(color: Colors.white54, fontSize: 10.5)),
                    Text(controller.phone.value, style: const TextStyle(color: Colors.white54, fontSize: 10.5)),
                  ],
                ),
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String title) {
    return Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700));
  }

  // ---------------- Menu card (generic — used for all 3 sections) ----------------
  Widget _buildMenuCard(List<SettingsMenuItem> items) {
    return Obx(
      () => Container(
        width: double.infinity,
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
        child: Column(
          children: List.generate(items.length, (index) {
            final item = items[index];
            final isLast = index == items.length - 1;
            return Column(
              children: [
                _MenuItemTile(item: item, onTap: () => controller.onMenuItemTap(item)),
                if (!isLast) Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14),
              ],
            );
          }),
        ),
      ),
    );
  }
}

// =====================================================================
// Menu item tile
// =====================================================================
class _MenuItemTile extends StatelessWidget {
  final SettingsMenuItem item;
  final VoidCallback onTap;

  const _MenuItemTile({required this.item, required this.onTap});

  static const Color kPurple = FinanceSettingsView.kPurple;
  static const Color kRed = FinanceSettingsView.kRed;

  @override
  Widget build(BuildContext context) {
    final color = item.isDanger ? kRed : kPurple;
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(item.icon, color: color, size: 17),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: TextStyle(color: item.isDanger ? kRed : Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(item.subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
            ),
            if (item.trailingText != null) ...[
              Text(item.trailingText!, style: const TextStyle(color: Colors.white54, fontSize: 11.5, fontWeight: FontWeight.w600)),
              const SizedBox(width: 6),
            ],
            Icon(Icons.chevron_right, color: item.isDanger ? kRed.withOpacity(0.6) : Colors.white24, size: 18),
          ],
        ),
      ),
    );
  }
}
