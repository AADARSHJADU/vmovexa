import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../dashboard/controllers/dashboard_controller.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    // Retrieve parent dashboard controller
    final c = Get.find<FleetOpDashboardController>();

    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 32), // Balance spacing
                const Text(
                  'Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.settings_outlined, color: Color(0xFF6366F1), size: 24),
                  onPressed: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main Header Card with Rohan Mehta Photo
                  _buildProfileHeaderCard(),
                  const SizedBox(height: 18),

                  // Stats Strip Card with horizontal alignment & vertical dividers (Image 4 style)
                  _buildStatsCard(),
                  const SizedBox(height: 24),

                  // Account & Settings Section
                  const Text('Account & Settings', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildSettingsPanel(),
                  const SizedBox(height: 24),

                  // Support & Info Section
                  const Text('Support & Information', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildSupportPanel(),
                  const SizedBox(height: 32),

                  // Logout Button
                  ElevatedButton.icon(
                    onPressed: c.logout,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3B82F6),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 18),
                    label: const Text('Logout', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Avatar photo - Rohan Mehta Unsplash Profile Image
          Stack(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF3B82F6), width: 1.5),
                  image: const DecorationImage(
                    image: NetworkImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: const BoxDecoration(
                    color: Color(0xFF3B82F6),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 10),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),

          // Title & Org name (Image 4 style: Rohan Mehta, City Analyst blue tag)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Rohan Mehta',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                const Text(
                  'City Analyst',
                  style: TextStyle(color: Color(0xFF3B82F6), fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Row(
                  children: const [
                    Icon(Icons.business_rounded, color: Color(0xFF6366F1), size: 14),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'VMOVEXA Transport Solutions',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Operator ID: OP987654',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
        ],
      ),
    );
  }

  // Redesigned Stats Card strip matching Image 4
  Widget _buildStatsCard() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Expanded(child: _buildStatsCardSegment('24', 'Fleets Managed', Icons.directions_bus_rounded, const Color(0xFF8B5CF6))),
          _buildStatsVerticalDivider(),
          Expanded(child: _buildStatsCardSegment('156', 'Vehicles', Icons.directions_bus_rounded, const Color(0xFF3B82F6))),
          _buildStatsVerticalDivider(),
          Expanded(child: _buildStatsCardSegment('178', 'Drivers', Icons.person_rounded, const Color(0xFF8B5CF6))),
        ],
      ),
    );
  }

  Widget _buildStatsCardSegment(String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 6),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildStatsVerticalDivider() {
    return Container(
      height: 32,
      width: 1,
      color: AppColors.cardBorder,
    );
  }

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
          _buildMenuRow('Account Settings', 'Personal and organization details', Icons.person_outline_rounded, () => Get.toNamed(Routes.ACCOUNT_SETTINGS)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('Security', 'Change password and security preferences', Icons.security_rounded, () => Get.toNamed(Routes.CHANGE_PASSWORD)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('Notification Settings', 'Manage your notification preferences', Icons.notifications_none_rounded, () => Get.toNamed(Routes.NOTIFICATION_SETTINGS)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('App Preferences', 'Dark mode, language and other preferences', Icons.tune_rounded, () {}),
        ],
      ),
    );
  }

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
          _buildMenuRow('Help & Support', 'Get help and contact support', Icons.headset_mic_outlined, () => Get.toNamed(Routes.HELP_SUPPORT)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('Privacy Policy', 'Read our privacy policy', Icons.description_outlined, () => Get.toNamed(Routes.PRIVACY_POLICY)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('Terms & Conditions', 'Read our terms and conditions', Icons.verified_user_outlined, () => Get.toNamed(Routes.TERMS_CONDITIONS)),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildMenuRow('About VMOVEXA', 'App version 1.0.0', Icons.info_outline_rounded, () {}),
        ],
      ),
    );
  }

  Widget _buildMenuRow(String label, String subtitle, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: Colors.transparent,
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF6366F1), size: 18),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
          ],
        ),
      ),
    );
  }
}
