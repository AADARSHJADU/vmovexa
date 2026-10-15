import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/account_settings_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class AccountSettingsView extends StatelessWidget {
  const AccountSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    // Self-binding controller fallback
    final controller = Get.isRegistered<AccountSettingsController>()
        ? Get.find<AccountSettingsController>()
        : Get.put(AccountSettingsController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const Expanded(
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
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: controller.loadUserData,
                    tooltip: 'Reload',
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
                    // Personal Information Section
                    _buildSectionHeaderWithAction(
                      "assets/icons/profile.svg",
                      'Personal Information',
                      'Change Photo',
                      controller.changePhoto,
                    ),
                    const SizedBox(height: 12),
                    _buildPersonalCard(controller),
                    const SizedBox(height: 24),

                    // Organization Information Section
                    _buildSectionHeader(
                      "assets/icons/fleet_operator_icons/fleetsManagedA.svg",
                      'Organization Information',
                    ),
                    const SizedBox(height: 12),
                    _buildOrgCard(controller),
                    const SizedBox(height: 24),

                    // Preferences Section
                    _buildSectionHeader(
                      "assets/icons/fleet_operator_icons/appPreferenceA.svg",
                      'Preferences',
                    ),
                    const SizedBox(height: 12),
                    _buildPreferencesCard(controller),
                    const SizedBox(height: 24),

                    // Security Section
                    _buildSectionHeader(
                      "assets/icons/fleet_operator_icons/securityA.svg",
                      'Security',
                    ),
                    const SizedBox(height: 12),
                    _buildSecurityCard(controller),
                    const SizedBox(height: 36),

                    // Save Changes Action Button
                    Obx(
                      () => Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ElevatedButton(
                          onPressed: controller.isSaving.value ? null : controller.saveChanges,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: controller.isSaving.value
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgPicture.asset(
                                      "assets/icons/fleet_operator_icons/saveChangesA.svg",
                                      colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                                      width: 18,
                                      height: 18,
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'Save Changes',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: controller.cancel,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF1E293B)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: Colors.transparent,
                      ),
                      icon: SvgPicture.asset(
                        "assets/icons/fleet_operator_icons/cancelA.svg",
                        colorFilter: const ColorFilter.mode(Color(0xFF3B82F6), BlendMode.srcIn),
                        width: 16,
                        height: 16,
                      ),
                      label: const Text(
                        'Cancel',
                        style: TextStyle(color: Color(0xFF3B82F6), fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 24),
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
        SvgPicture.asset(icon, width: 16, height: 16),
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
            SvgPicture.asset(icon, width: 16, height: 16),
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

  Widget _buildPersonalCard(AccountSettingsController controller) {
    return Obx(() {
      final avatar = controller.avatarUrl.value;
      final name = controller.fullName.value;

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
            // Left Avatar picture
            GestureDetector(
              onTap: controller.changePhoto,
              child: Stack(
                children: [
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF3B82F6), width: 1.5),
                      color: const Color(0xFF0F172A),
                    ),
                    child: ClipOval(
                      child: controller.isUploadingPhoto.value
                          ? const Center(
                              child: SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              ),
                            )
                          : (avatar.isNotEmpty
                              ? Image.network(
                                  avatar,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(name),
                                )
                              : _buildAvatarFallback(name)),
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
                      child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 11),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),

            // Right details list fields with Prefix Icons & Tap-to-Edit
            Expanded(
              child: Column(
                children: [
                  _buildEditableFieldRow(
                    label: 'Full Name',
                    value: controller.fullName.value.isEmpty ? 'Not set' : controller.fullName.value,
                    icon: "assets/icons/profile.svg",
                    onTap: () => controller.openEditSheet(
                      title: 'Full Name',
                      currentVal: controller.fullName.value,
                      onSaved: (val) => controller.fullName.value = val,
                    ),
                  ),
                  const Divider(color: AppColors.cardBorder, height: 16),
                  _buildEditableFieldRow(
                    label: 'Email',
                    value: controller.email.value.isEmpty ? 'Not set' : controller.email.value,
                    icon: "assets/icons/fleet_operator_icons/emailA.svg",
                    onTap: () => controller.openEditSheet(
                      title: 'Email',
                      currentVal: controller.email.value,
                      keyboardType: TextInputType.emailAddress,
                      onSaved: (val) => controller.email.value = val,
                    ),
                  ),
                  const Divider(color: AppColors.cardBorder, height: 16),
                  _buildEditableFieldRow(
                    label: 'Mobile Number',
                    value: controller.phone.value.isEmpty ? 'Not set' : controller.phone.value,
                    icon: "assets/icons/fleet_operator_icons/mobileNumberA.svg",
                    onTap: () => controller.openEditSheet(
                      title: 'Mobile Number',
                      currentVal: controller.phone.value,
                      keyboardType: TextInputType.phone,
                      onSaved: (val) => controller.phone.value = val,
                    ),
                  ),
                  const Divider(color: AppColors.cardBorder, height: 16),
                  _buildReadOnlyFieldRow('Employee ID', controller.employeeId.value, "assets/icons/fleet_operator_icons/employeeIdA.svg"),
                  const Divider(color: AppColors.cardBorder, height: 16),
                  _buildReadOnlyFieldRow('Role', controller.role.value, "assets/icons/fleet_operator_icons/securityA.svg"),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildAvatarFallback(String name) {
    final initials = name.trim().isNotEmpty
        ? name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'OP';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildEditableFieldRow({
    required String label,
    required String value,
    required String icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          children: [
            SvgPicture.asset(icon, width: 14, height: 14),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.edit_outlined, color: Color(0xFF6366F1), size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildReadOnlyFieldRow(String label, String value, String icon) {
    return Row(
      children: [
        SvgPicture.asset(icon, width: 14, height: 14),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5, fontWeight: FontWeight.w600),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const Icon(Icons.lock_outline_rounded, color: AppColors.textMuted, size: 14),
      ],
    );
  }

  Widget _buildOrgCard(AccountSettingsController controller) {
    return Obx(
      () => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            _buildOrgEditableRow(
              label: 'Company Name',
              value: controller.companyName.value.isEmpty ? 'Not set' : controller.companyName.value,
              icon: "assets/icons/fleet_operator_icons/fleetsManagedA.svg",
              onTap: () => controller.openEditSheet(
                title: 'Company Name',
                currentVal: controller.companyName.value,
                onSaved: (val) => controller.companyName.value = val,
              ),
            ),
            const Divider(color: AppColors.cardBorder, height: 16),
            _buildOrgEditableRow(
              label: 'Branch / Office',
              value: controller.branch.value.isEmpty ? 'Not set' : controller.branch.value,
              icon: "assets/icons/fleet_operator_icons/locationA.svg",
              onTap: () => controller.openEditSheet(
                title: 'Branch / Office',
                currentVal: controller.branch.value,
                onSaved: (val) => controller.branch.value = val,
              ),
            ),
            const Divider(color: AppColors.cardBorder, height: 16),
            _buildOrgEditableRow(
              label: 'Office Address',
              value: controller.officeAddress.value.isEmpty ? 'Tap to enter address' : controller.officeAddress.value,
              icon: "assets/icons/fleet_operator_icons/officeA.svg",
              onTap: () => controller.openEditSheet(
                title: 'Office Address',
                currentVal: controller.officeAddress.value,
                onSaved: (val) => controller.officeAddress.value = val,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrgEditableRow({
    required String label,
    required String value,
    required String icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SvgPicture.asset(icon, width: 14, height: 14),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 3),
                  Text(
                    value,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.edit_outlined, color: Color(0xFF6366F1), size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferencesCard(AccountSettingsController controller) {
    return Obx(
      () => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            _buildPreferenceItem(
              label: 'Language',
              value: controller.language.value,
              icon: "assets/icons/fleet_operator_icons/languageA.svg",
              onTap: () => controller.openEditSheet(
                title: 'Language',
                currentVal: controller.language.value,
                onSaved: (val) => controller.language.value = val,
              ),
            ),
            const Divider(color: AppColors.cardBorder, height: 16),
            _buildPreferenceItem(
              label: 'Time Zone',
              value: controller.timezone.value,
              icon: "assets/icons/fleet_operator_icons/timeZoneA.svg",
              onTap: () => controller.openEditSheet(
                title: 'Time Zone',
                currentVal: controller.timezone.value,
                onSaved: (val) => controller.timezone.value = val,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferenceItem({
    required String label,
    required String value,
    required String icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            SvgPicture.asset(icon, width: 14, height: 14),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11.5, fontWeight: FontWeight.bold)),
            ),
            Text(value, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityCard(AccountSettingsController controller) {
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
                  SvgPicture.asset("assets/icons/fleet_operator_icons/changePasswordA.svg", width: 16, height: 16),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Change Password', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        SizedBox(height: 3),
                        Text('Update your account security password', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 18),
                ],
              ),
            ),
          ),
          const Divider(color: AppColors.cardBorder, height: 16),
          Row(
            children: [
              SvgPicture.asset("assets/icons/fleet_operator_icons/securityA.svg", width: 16, height: 16),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Two-Factor Authentication (2FA)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    SizedBox(height: 3),
                    Text('Add an extra layer of security', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Disabled', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
