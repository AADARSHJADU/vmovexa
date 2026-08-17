import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controller/edit_profile_controller.dart';

class EditProfileView extends GetView<EditProfileController> {
  const EditProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 8),
            _buildHeader(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                physics: const BouncingScrollPhysics(),
                children: [
                  // Personal Information Section (Editable)
                  _buildSectionHeader(Icons.person_outline_rounded, 'Personal Information'),
                  const SizedBox(height: 12),
                  _buildPersonalFields(context),
                  const SizedBox(height: 24),

                  // Work Information Section (Read-Only)
                  _buildSectionHeader(Icons.business_rounded, 'Work Information'),
                  const SizedBox(height: 12),
                  _buildWorkFields(),
                  const SizedBox(height: 24),

                  // Account & Security Section (Read-Only & Change Password)
                  _buildSectionHeader(Icons.security_rounded, 'Account & Security'),
                  const SizedBox(height: 12),
                  _buildSecurityFields(),
                  const SizedBox(height: 32),

                  // Save Changes Button
                  _buildSaveButton(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
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
                  'Edit Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Update your personal and account details.',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Section Header ----------------
  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
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

  // ---------------- Personal Fields (Editable) ----------------
  Widget _buildPersonalFields(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildEditableTextField(
            label: 'Full Name',
            controller: controller.nameController,
            hint: 'Enter your full name',
            icon: Icons.person_outline_rounded,
          ),
          const SizedBox(height: 16),
          _buildEditableTextField(
            label: 'Email Address',
            controller: controller.emailController,
            hint: 'Enter your email address',
            icon: Icons.mail_outline_rounded,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          _buildEditableTextField(
            label: 'Phone Number',
            controller: controller.phoneController,
            hint: 'Enter your phone number',
            icon: Icons.phone_android_rounded,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          _buildDatePickerField(
            context: context,
            label: 'Date of Birth',
            controller: controller.dobController,
            icon: Icons.calendar_today_rounded,
          ),
          const SizedBox(height: 16),
          _buildGenderDropdownField(
            label: 'Gender',
            controller: controller.genderController,
            icon: Icons.wc_rounded,
          ),
          const SizedBox(height: 16),
          _buildEditableTextField(
            label: 'Address',
            controller: controller.addressController,
            hint: 'Enter your address',
            icon: Icons.location_on_outlined,
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  // ---------------- Work Fields (Read-Only) ----------------
  Widget _buildWorkFields() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Obx(() => Column(
            children: [
              _buildReadOnlyField(
                label: 'Role',
                value: controller.role.value,
                icon: Icons.badge_outlined,
              ),
              const SizedBox(height: 16),
              _buildReadOnlyField(
                label: 'Department',
                value: controller.department.value,
                icon: Icons.corporate_fare_outlined,
              ),
              const SizedBox(height: 16),
              _buildReadOnlyField(
                label: 'Reporting Manager',
                value: controller.reportingManager.value,
                icon: Icons.supervisor_account_outlined,
              ),
              const SizedBox(height: 16),
              _buildReadOnlyField(
                label: 'Work Location',
                value: controller.workLocation.value,
                icon: Icons.place_outlined,
              ),
              const SizedBox(height: 16),
              _buildReadOnlyField(
                label: 'Joined On',
                value: controller.joinedDate.value,
                icon: Icons.calendar_month_outlined,
              ),
            ],
          )),
    );
  }

  // ---------------- Security Fields (Read-Only + Action) ----------------
  Widget _buildSecurityFields() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder, width: 1.2),
      ),
      child: Obx(() => Column(
            children: [
              _buildReadOnlyField(
                label: 'Username',
                value: controller.username.value,
                icon: Icons.alternate_email_rounded,
              ),
              const SizedBox(height: 16),
              _buildReadOnlyField(
                label: 'Password',
                value: '••••••••',
                icon: Icons.lock_outline_rounded,
                suffixWidget: TextButton(
                  onPressed: controller.changePassword,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    'Change',
                    style: TextStyle(
                      color: kPurple,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              // const SizedBox(height: 16),
              // _buildReadOnlyField(
              //   label: 'Two-Factor Authentication',
              //   value: 'Enabled',
              //   icon: Icons.security_rounded,
              //   suffixWidget: Row(
              //     mainAxisSize: MainAxisSize.min,
              //     children: [
              //       Text(
              //         'Enabled',
              //         style: TextStyle(
              //           color: Colors.greenAccent.shade400,
              //           fontSize: 11,
              //           fontWeight: FontWeight.bold,
              //         ),
              //       ),
              //       const SizedBox(width: 4),
              //       const Icon(
              //         Icons.chevron_right_rounded,
              //         color: AppColors.textMuted,
              //         size: 16,
              //       ),
              //     ],
              //   ),
              // ),
            ],
          )),
    );
  }

  // ---------------- Save Button ----------------
  Widget _buildSaveButton() {
    return GestureDetector(
      onTap: controller.saveProfile,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [kPurple, kIndigo]),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: kPurple.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.save_rounded, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Text(
              'Save Changes',
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- UI Helpers ----------------
  Widget _buildEditableTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 13.5),
      decoration: _getInputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: kPurple, size: 18),
      ),
    );
  }

  Widget _buildDatePickerField({
    required BuildContext context,
    required String label,
    required TextEditingController controller,
    required IconData icon,
  }) {
    return TextField(
      controller: controller,
      readOnly: true,
      onTap: () => this.controller.selectDate(context),
      style: const TextStyle(color: Colors.white, fontSize: 13.5),
      decoration: _getInputDecoration(
        labelText: label,
        hintText: 'Select date of birth',
        prefixIcon: Icon(icon, color: kPurple, size: 18),
        suffixIcon: const Icon(Icons.calendar_today_rounded, color: AppColors.textSecondary, size: 16),
      ),
    );
  }

  Widget _buildGenderDropdownField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
  }) {
    final List<String> genders = ['Male', 'Female', 'Other'];
    return DropdownButtonFormField<String>(
      dropdownColor: kCardBg,
      value: genders.contains(controller.text) ? controller.text : genders[0],
      items: genders
          .map((opt) => DropdownMenuItem(
                value: opt,
                child: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 13.5)),
              ))
          .toList(),
      onChanged: (val) => controller.text = val ?? 'Male',
      style: const TextStyle(color: Colors.white, fontSize: 13.5),
      decoration: _getInputDecoration(
        labelText: label,
        hintText: 'Select gender',
        prefixIcon: Icon(icon, color: kPurple, size: 18),
      ),
    );
  }

  Widget _buildReadOnlyField({
    required String label,
    required String value,
    required IconData icon,
    Widget? suffixWidget,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: kFieldBg.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder, width: 1.0),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          if (suffixWidget != null) suffixWidget,
        ],
      ),
    );
  }

  InputDecoration _getInputDecoration({
    required String labelText,
    required String hintText,
    required Widget prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      labelText: labelText,
      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
      hintText: hintText,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 12.5),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: kFieldBg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kBorder, width: 1.2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: kPurple, width: 1.5),
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}
