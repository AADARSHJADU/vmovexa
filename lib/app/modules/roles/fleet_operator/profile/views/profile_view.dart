import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
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
                InkWell(
                    onTap: (){
                      Get.toNamed(Routes.ACCOUNT_SETTINGS);
                    },
                    child: SvgPicture.asset('assets/icons/fleet_operator_icons/profileHeaderSettingA.svg',)),
                // IconButton(
                //   icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 24),
                //   onPressed: () => Get.toNamed(Routes.ACCOUNT_SETTINGS),
                // ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main Header Card
                  _buildProfileHeaderCard(),
                  const SizedBox(height: 18),

                  // Stats Strip Grid row
                  _buildStatsRow(),
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
                  OutlinedButton.icon(
                    onPressed: c.logout,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
                      backgroundColor: Colors.transparent,
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
          // Avatar photo
          Stack(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black,
                ),
                child: const Center(
                  child: Icon(Icons.person_rounded, color: Colors.white, size: 36),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Color(0xFF003ed4),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 10),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),

          // Title & Org name
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
                  'Fleet Operator',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    SvgPicture.asset('assets/icons/fleet_operator_icons/fleetsManagedA.svg',),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        'VMOVEXA Transport Solutions',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
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

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(child: _buildStatItem('24', 'Fleets Managed', Icons.local_shipping_outlined)),
        const SizedBox(width: 8),
        Expanded(child: _buildStatItem('156', 'Vehicles', Icons.directions_car_outlined)),
        const SizedBox(width: 8),
        Expanded(child: _buildStatItem('178', 'Drivers', Icons.person_outline_rounded)),
      ],
    );
  }

  Widget _buildStatItem(String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF8B5CF6), size: 18),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
            textAlign: TextAlign.center,
          ),
        ],
      ),
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
