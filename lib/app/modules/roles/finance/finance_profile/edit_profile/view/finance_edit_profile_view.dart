import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/finance_edit_profile_controller.dart';

class FinanceEditProfileView extends GetView<FinanceEditProfileController> {
  const FinanceEditProfileView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);
  static const Color kInputBg = Color(0xFF0F0F1A);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<FinanceEditProfileController>()) {
      Get.put(FinanceEditProfileController());
    }

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            _buildHeader(),
            const SizedBox(height: 16),
            _buildPhotoSection(),
            const SizedBox(height: 20),
            _buildPersonalInformationSection(),
            const SizedBox(height: 20),
            _buildCorporateDepartmentSection(),
            const SizedBox(height: 20),
            _buildPreferencesSection(),
            const SizedBox(height: 28),
            _buildActionButtons(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // 1. Header (Breadcrumb, Title, Subtitle)
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: controller.onBackPressed,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Row(
                  //   children: [
                  //     Text(
                  //       'Finance Portal  /  ',
                  //       style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  //     ),
                  //     Text(
                  //       'Personal Account Settings',
                  //       style: TextStyle(
                  //         color: Color(0xFF818CF8),
                  //         fontSize: 11,
                  //         fontWeight: FontWeight.w600,
                  //       ),
                  //     ),
                  //   ],
                  // ),
                  // SizedBox(height: 2),
                  Text(
                    'Personal Account Settings',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          'Manage personal finance credentials, contact details, avatar photo, and preferences.',
          style: TextStyle(color: Colors.white54, fontSize: 11.5),
        ),
      ],
    );
  }

  // 2. Photo Upload Section
  Widget _buildPhotoSection() {
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
          Stack(
            children: [
              Obx(() {
                final url = controller.avatarUrl.value;
                final resolved = ApiConstants.resolveFileUrl(url);
                return Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: kPurple.withValues(alpha: 0.5), width: 1.5),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: resolved.isNotEmpty
                      ? Image.network(
                          resolved,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => _buildAvatarFallback(),
                        )
                      : _buildAvatarFallback(),
                );
              }),
              Positioned(
                bottom: 2,
                right: 2,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    shape: BoxShape.circle,
                    border: Border.all(color: kCardBg, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Finance Officer Profile Photo',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                const Text(
                  'PNG, JPG, or WebP up to 5MB. Displayed across the portal audit logs.',
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Obx(
                      () => GestureDetector(
                        onTap: controller.isUploadingPhoto.value
                            ? null
                            : controller.openPhotoSourcePicker,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFB042FF), Color(0xFF6366F1)],
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (controller.isUploadingPhoto.value) ...[
                                const SizedBox(
                                  width: 13,
                                  height: 13,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 1.8,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'Uploading...',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ] else ...[
                                const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 14),
                                const SizedBox(width: 6),
                                const Text(
                                  'Change Photo',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Obx(() {
                      if (controller.avatarUrl.value.isEmpty) return const SizedBox.shrink();
                      return GestureDetector(
                        onTap: controller.removePhoto,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                          ),
                          child: const Text(
                            'Remove',
                            style: TextStyle(
                              color: Color(0xFFEF4444),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback() {
    final name = controller.fullNameController.text.trim();
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'F';
    return Container(
      color: const Color(0xFF1E293B),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // 3. Section 1: Officer Personal Information
  Widget _buildPersonalInformationSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF60A5FA),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '1. OFFICER PERSONAL INFORMATION',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildTextField(
            label: 'Officer Full Name',
            isRequired: true,
            controller: controller.fullNameController,
            hint: 'e.g. Rahul Sharma',
            icon: Icons.person_outline,
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Corporate Finance Email',
            isRequired: true,
            controller: controller.emailController,
            hint: 'e.g. rahul@vmovexa.com',
            icon: Icons.mail_outline,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Direct Contact / Mobile Number',
            controller: controller.phoneController,
            hint: 'e.g. +91 98765 88990',
            icon: Icons.call_outlined,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Finance Officer Badge / ID',
            controller: controller.badgeIdController,
            hint: 'FIN-101',
            icon: Icons.badge_outlined,
            enabled: false,
          ),
        ],
      ),
    );
  }

  // 4. Section 2: Corporate Department & Role
  Widget _buildCorporateDepartmentSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFFC084FC),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '2. CORPORATE DEPARTMENT & ROLE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildTextField(
            label: 'Organization Legal Entity',
            controller: controller.companyNameController,
            hint: 'e.g. VMOVEXA Private Limited',
            icon: Icons.business_outlined,
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Assigned Branch / Division',
            controller: controller.branchController,
            hint: 'e.g. Corporate Finance & Taxation Wing',
            icon: Icons.account_tree_outlined,
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Official Office Address',
            controller: controller.addressController,
            hint: 'e.g. 101, Business Hub, BKC, Mumbai',
            icon: Icons.location_on_outlined,
            maxLines: 2,
          ),
        ],
      ),
    );
  }

  // 5. Section 3: Preferences
  Widget _buildPreferencesSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF34D399),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                '3. SYSTEM LANGUAGE & REGIONAL\nPREFERENCES',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Portal Interface Language',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Obx(
            () => Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: kInputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kBorder),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: controller.languages.any((l) => l['code'] == controller.selectedLanguage.value)
                      ? controller.selectedLanguage.value
                      : 'en',
                  dropdownColor: const Color(0xFF15151F),
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                  items: controller.languages.map((lang) {
                    return DropdownMenuItem<String>(
                      value: lang['code'],
                      child: Text(
                        lang['name'] ?? '',
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) controller.selectedLanguage.value = val;
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'Timezone & Financial Ledger Clock',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Obx(
            () => Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: kInputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kBorder),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: controller.timezones.any((tz) => tz['code'] == controller.selectedTimezone.value)
                      ? controller.selectedTimezone.value
                      : 'Asia/Kolkata',
                  dropdownColor: const Color(0xFF15151F),
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                  items: controller.timezones.map((tz) {
                    return DropdownMenuItem<String>(
                      value: tz['code'],
                      child: Text(
                        tz['name'] ?? '',
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) controller.selectedTimezone.value = val;
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Action Buttons (Using CustomButton with gradient as requested)
  Widget _buildActionButtons() {
    return Column(
      children: [
        Obx(
          () => CustomButton(
            text: 'Save Profile Changes',
            isGradient: true,
            isLoading: controller.isSaving.value,
            onTap: controller.saveProfile,
            prefixIcon: const Icon(Icons.save_outlined, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            onPressed: controller.onBackPressed,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: kBorder),
              backgroundColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Cancel',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isRequired = false,
    bool enabled = true,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (isRequired)
              const Text(
                ' *',
                style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: enabled ? kInputBg : const Color(0xFF141420),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kBorder),
          ),
          child: TextField(
            controller: controller,
            enabled: enabled,
            maxLines: maxLines,
            keyboardType: keyboardType,
            style: TextStyle(
              color: enabled ? Colors.white : Colors.white38,
              fontSize: 13,
              fontFamily: !enabled ? 'monospace' : null,
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              isDense: true,
              hintText: hint,
              hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 12),
              prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 18),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}
