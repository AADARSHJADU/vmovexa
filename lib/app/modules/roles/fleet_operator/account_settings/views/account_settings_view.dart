import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/account_settings_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class AccountSettingsView extends GetView<AccountSettingsController> {
  const AccountSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: const [
                  CustomBackButton(),
                  Expanded(
                    child: Center(
                      child: Text(
                        'Account Settings',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 48), // Spacer to balance back button
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
                    // Personal Information Section
                    _buildSectionHeaderWithAction(
                      "assets/icons/profile.svg",
                      'Personal Information',
                      'Change Photo',
                      controller.changePhoto,
                    ),
                    const SizedBox(height: 12),
                    _buildPersonalCard(),
                    const SizedBox(height: 24),

                    // Organization Information Section
                    _buildSectionHeader("assets/icons/fleet_operator_icons/fleetsManagedA.svg", 'Organization Information'),
                    const SizedBox(height: 12),
                    _buildOrgCard(),
                    const SizedBox(height: 24),

                    // Preferences Section
                    _buildSectionHeader("assets/icons/fleet_operator_icons/appPreferenceA.svg", 'Preferences'),
                    const SizedBox(height: 12),
                    _buildPreferencesCard(),
                    const SizedBox(height: 24),

                    // Security Section
                    _buildSectionHeader("assets/icons/fleet_operator_icons/securityA.svg", 'Security'),
                    const SizedBox(height: 12),
                    _buildSecurityCard(),
                    const SizedBox(height: 36),

                    // Save and Cancel Action buttons (Image 1 style)
                    ElevatedButton.icon(
                      onPressed: controller.saveChanges,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: SvgPicture.asset("assets/icons/fleet_operator_icons/saveChangesA.svg",color: Colors.white,),
                      label: const Text('Save Changes', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: controller.cancel,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF1E293B)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        backgroundColor: Colors.transparent,
                      ),
                      icon: SvgPicture.asset("assets/icons/fleet_operator_icons/cancelA.svg",color: Color(0xff017be2),),
                      label: const Text('Cancel', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String icon, String title) {
    return Row(
      children: [
        SvgPicture.asset(icon),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildSectionHeaderWithAction(String icon, String title, String actionLabel, VoidCallback onAction) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            SvgPicture.asset(icon),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        TextButton.icon(
          onPressed: onAction,
          icon: const Icon(Icons.camera_alt_outlined, color: Color(0xFF3B82F6), size: 14),
          label: Text(actionLabel, style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold)),
          style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
        ),
      ],
    );
  }

  Widget _buildPersonalCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Avatar picture - Rohan Mehta Unsplash Profile Image
          Stack(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF3B82F6), width: 1),
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
                    color: Color(0xFF3729e8),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 10),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),

          // Right details list fields with Prefix Icons (Image 1 style)
          Expanded(
            child: Column(
              children: [
                _buildFieldRow('Full Name', controller.fullName.value,  "assets/icons/profile.svg"),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildFieldRow('Email', controller.email.value, "assets/icons/fleet_operator_icons/emailA.svg"),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildFieldRow('Mobile Number', controller.phone.value, "assets/icons/fleet_operator_icons/mobileNumberA.svg"),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildFieldRow('Employee ID', controller.employeeId.value, "assets/icons/fleet_operator_icons/employeeIdA.svg"),
                const Divider(color: AppColors.cardBorder, height: 16),
                _buildFieldRow('Role', controller.role.value,  "assets/icons/fleet_operator_icons/securityA.svg"),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldRow(String label, String value, String icon) {
    return Row(
      children: [
        SvgPicture.asset(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
      ],
    );
  }

  Widget _buildOrgCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildOrgRow('Company Name', controller.companyName.value, "assets/icons/fleet_operator_icons/fleetsManagedA.svg"),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildOrgRow('Branch / Office', controller.branch.value, "assets/icons/fleet_operator_icons/locationA.svg"),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildOrgRow('Office Address', controller.officeAddress.value, "assets/icons/fleet_operator_icons/officeA.svg"),
        ],
      ),
    );
  }

  Widget _buildOrgRow(String label, String value, String icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SvgPicture.asset(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, height: 1.3),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
      ],
    );
  }

  Widget _buildPreferencesCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildPreferenceItem('Language', controller.language.value, "assets/icons/fleet_operator_icons/languageA.svg"),
          const Divider(color: AppColors.cardBorder, height: 16),
          _buildPreferenceItem('Time Zone', controller.timezone.value, "assets/icons/fleet_operator_icons/timeZoneA.svg"),
        ],
      ),
    );
  }

  Widget _buildPreferenceItem(String label, String value, String icon) {
    return Row(
      children: [
     SvgPicture.asset(icon),
        const SizedBox(width: 14),
        Expanded(
          child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
        ),
        Text(value, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(width: 6),
        const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
      ],
    );
  }

  Widget _buildSecurityCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: controller.goToChangePassword,
            child: Container(
              color: Colors.transparent,
              child: Row(
                children: [
                  SvgPicture.asset("assets/icons/fleet_operator_icons/changePasswordA.svg"),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Change Password', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('Update your account password', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
                ],
              ),
            ),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          Row(
            children: [
              SvgPicture.asset("assets/icons/fleet_operator_icons/securityA.svg"),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Two-Factor Authentication (2FA)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Add an extra layer of security', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  ],
                ),
              ),
              const Text('Disabled', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
              const SizedBox(width: 6),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
            ],
          ),
        ],
      ),
    );
  }
}
