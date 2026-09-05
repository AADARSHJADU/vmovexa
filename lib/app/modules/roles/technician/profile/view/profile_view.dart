import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controller/profile_controller.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          physics: const BouncingScrollPhysics(),
          children: [
            const SizedBox(height: 8),
            _buildHeader(context),
            const SizedBox(height: 16),
            _buildProfileHeaderCard(),
            const SizedBox(height: 24),
            
            // Account Section
            _buildSectionHeader(
              svgPath: 'assets/icons/profile.svg',
              title: 'Account',
            ),
            const SizedBox(height: 10),
            _buildAccountCard(),
            const SizedBox(height: 24),

            // Preferences Section
            _buildSectionHeader(
              svgPath: 'assets/icons/fleet_operator_icons/appPreferenceA.svg',
              title: 'Preferences',
            ),
            const SizedBox(height: 10),
            _buildPreferencesCard(),
            const SizedBox(height: 24),

            // Security Section
            _buildSectionHeader(
              svgPath: 'assets/icons/fleet_operator_icons/securityA.svg',
              title: 'Security',
            ),
            const SizedBox(height: 10),
            _buildSecurityCard(),
            const SizedBox(height: 24),

            // App Section
            _buildSectionHeader(
              svgPath: 'assets/icons/fleet_operator_icons/AboutA.svg',
              title: 'App',
            ),
            const SizedBox(height: 10),
            _buildAppCard(),
            const SizedBox(height: 28),

            // Log Out Button
            _buildLogOutButton(),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: Container(
            padding: const EdgeInsets.all(8),
            child: const Icon(Icons.arrow_back, color: Colors.white, size: 24),
          ),
        ),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Technician Profile',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'View and manage your profile information.',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Profile Header Card ----------------
  Widget _buildProfileHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Obx(() {
        final data = controller.profile.value;
        if (data == null) {
          return const Center(child: CircularProgressIndicator(color: kPurple));
        }

        return Row(
          children: [
            // Avatar Photo
            Stack(
              children: [
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: kPurple.withOpacity(0.12),
                    border: Border.all(color: kPurple.withOpacity(0.35), width: 1.5),
                  ),
                  child: Center(
                    child: SvgPicture.asset(
                      'assets/icons/profile.svg',
                      width: 34,
                      height: 34,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: kCardBg,
                      shape: BoxShape.circle,
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: kPurple,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.camera_alt_rounded,
                        color: Colors.white,
                        size: 10,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),

            // Profile info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    data.role,
                    style: const TextStyle(
                      color: kPurple,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Tech ID: ${data.techId}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Employee ID: ${data.employeeId}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Edit Profile Button
            OutlinedButton.icon(
              onPressed: controller.editProfile,
              icon: SvgPicture.asset(
                'assets/icons/fleet_operator_icons/editA.svg',
                width: 12,
                height: 12,
              ),
              label: const Text(
                'Edit Profile',
                style: TextStyle(
                  color: kPurple,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: kPurple, width: 1.2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ],
        );
      }),
    );
  }

  // ---------------- Section Header ----------------
  Widget _buildSectionHeader({
    IconData? icon,
    String? svgPath,
    required String title,
  }) {
    return Row(
      children: [
        if (svgPath != null)
          SvgPicture.asset(svgPath, width: 16, height: 16)
        else if (icon != null)
          Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: kPurple,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  // ---------------- Account Options Card ----------------
  Widget _buildAccountCard() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildSettingsRow(
            svgPath: 'assets/icons/profile.svg',
            title: 'Personal Information',
            subtitle: 'Update your personal details',
            onTap: controller.editProfile,
          ),
          _buildDivider(),
          _buildSettingsRow(
            svgPath: 'assets/icons/fleet_operator_icons/changePasswordA.svg',
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: controller.changePassword,
          ),
        ],
      ),
    );
  }

  // ---------------- Preferences Options Card ----------------
  Widget _buildPreferencesCard() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildSettingsRow(
            svgPath: 'assets/icons/fleet_operator_icons/notificationSettingA.svg',
            title: 'Notification Settings',
            subtitle: 'Manage your notification preferences',
            onTap: controller.goToNotificationSettings,
          ),
          // _buildDivider(),
          // Obx(() => _buildSettingsRow(
          //       svgPath: 'assets/icons/fleet_operator_icons/languageA.svg',
          //       title: 'Language',
          //       subtitle: 'Choose your preferred language',
          //       trailing: Row(
          //         mainAxisSize: MainAxisSize.min,
          //         children: [
          //           Text(
          //             controller.selectedLanguage.value,
          //             style: const TextStyle(
          //               color: AppColors.textSecondary,
          //               fontSize: 12,
          //             ),
          //           ),
          //           const SizedBox(width: 4),
          //           const Icon(
          //             Icons.chevron_right_rounded,
          //             color: AppColors.textMuted,
          //             size: 18,
          //           ),
          //         ],
          //       ),
          //       onTap: controller.changeLanguage,
          //     )),
          // _buildDivider(),
          // Obx(() => _buildSettingsRow(
          //       icon: Icons.dark_mode_outlined,
          //       title: 'Dark Mode',
          //       subtitle: 'Choose your theme preference',
          //       trailing: Switch(
          //         value: controller.isDarkMode.value,
          //         onChanged: controller.toggleDarkMode,
          //         activeColor: kPurple,
          //         activeTrackColor: kPurple.withOpacity(0.3),
          //         inactiveThumbColor: AppColors.textSecondary,
          //         inactiveTrackColor: kFieldBg,
          //       ),
          //     )),
        ],
      ),
    );
  }

  // ---------------- Security Options Card ----------------
  Widget _buildSecurityCard() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildSettingsRow(
            svgPath: 'assets/icons/fleet_operator_icons/privacyPolicyA.svg',
            title: 'Privacy Policy',
            subtitle: 'View our privacy policy',
            onTap: controller.goToPrivacyPolicy,
          ),
          _buildDivider(),
          _buildSettingsRow(
            svgPath: 'assets/icons/advertiser_ic/termConditionHeaderA.svg',
            title: 'Terms & Conditions',
            subtitle: 'View terms and conditions',
            onTap: controller.goToTermsConditions,
          ),
          _buildDivider(),
          _buildSettingsRow(
            svgPath: 'assets/icons/advertiser_ic/monitor.svg',
            title: 'Device Sessions',
            subtitle: 'Manage your active sessions',
            onTap: controller.goToDeviceSessions,
          ),
        ],
      ),
    );
  }

  // ---------------- App Options Card ----------------
  Widget _buildAppCard() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: _buildSettingsRow(
        svgPath: 'assets/icons/fleet_operator_icons/AboutA.svg',
        title: 'App Version',
        subtitle: 'You are using the latest version',
        trailing: const Text(
          'v1.0.0',
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  // ---------------- Log Out Button ----------------
  Widget _buildLogOutButton() {
    return GestureDetector(
      onTap: controller.logout,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: Colors.redAccent.withOpacity(0.2),
            width: 1.2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icons/fleet_operator_icons/logoutA.svg',
              width: 18,
              height: 18,
              colorFilter: const ColorFilter.mode(
                Colors.redAccent,
                BlendMode.srcIn,
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'Log Out',
              style: TextStyle(
                color: Colors.redAccent,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Shared Row Builder ----------------
  Widget _buildSettingsRow({
    IconData? icon,
    String? svgPath,
    Widget? leadingWidget,
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    final Widget leading = leadingWidget ??
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: kPurple.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: svgPath != null
              ? SvgPicture.asset(
                  svgPath,
                  width: 18,
                  height: 18,
                )
              : Icon(icon, color: kPurple, size: 18),
        );

    final Widget tail = trailing ??
        const Icon(
          Icons.chevron_right_rounded,
          color: AppColors.textMuted,
          size: 20,
        );

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            leading,
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            tail,
          ],
        ),
      ),
    );
  }

  // Divider
  Widget _buildDivider() {
    return Divider(
      color: Colors.white.withOpacity(0.06),
      height: 1,
      indent: 14,
      endIndent: 14,
    );
  }
}
