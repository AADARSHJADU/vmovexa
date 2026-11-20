import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_profile_controller.dart';

class AdvertiserEditProfileView extends GetView<AdvertiserProfileController> {
  const AdvertiserEditProfileView({super.key});

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
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('account_settings'.tr,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ),
                  const SizedBox(width: 4),
                  Obx(() => Container(
                        height: 36,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: ElevatedButton(
                          onPressed: controller.isSaving.value ? null : () => controller.saveProfile(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: controller.isSaving.value
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.check_rounded, color: Colors.white, size: 16),
                                    const SizedBox(width: 4),
                                    Text('save'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                        ),
                      )),
                ],
              ),
            ),

            // Form Content
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: [
                    // Photo Upload Section
                    _buildPhotoUploadCard(context),
                    const SizedBox(height: 16),

                    // Section 1: Personal Information
                    _buildPersonalInfoCard(),
                    const SizedBox(height: 16),

                    // Section 2: Brand / Agency Information
                    _buildBrandInfoCard(),
                    const SizedBox(height: 16),

                    // Section 3: Regional Preferences & Timezone
                    _buildPreferencesCard(),
                    const SizedBox(height: 24),

                    // Bottom Save Changes Button
                    _buildBottomSaveBar(),
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

  // ==========================================================
  // PHOTO UPLOAD CARD
  // ==========================================================
  Widget _buildPhotoUploadCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Avatar Image Preview
          Obx(() {
            final localFile = controller.selectedImageFile.value;
            final remoteUrl = controller.resolvedAvatarUrl;

            return Stack(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155), width: 1.5),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: localFile != null
                        ? Image.file(localFile, fit: BoxFit.cover)
                        : (remoteUrl.isNotEmpty
                            ? Image.network(
                                remoteUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(),
                              )
                            : _buildAvatarFallback()),
                  ),
                ),
                if (controller.uploadingPhoto.value)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
              ],
            );
          }),
          const SizedBox(width: 14),

          // Title & Description
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('profile_photo'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text('profile_photo_format_hint'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Action Buttons: Change Photo & Remove Photo
          Obx(() {
            final hasPhoto = controller.selectedImageFile.value != null || controller.avatarUrl.value.isNotEmpty;

            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (hasPhoto) ...[
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                    tooltip: 'remove_photo_tooltip'.tr,
                    onPressed: () => controller.removeAvatar(),
                  ),
                  const SizedBox(width: 4),
                ],
                ElevatedButton.icon(
                  onPressed: () => _showImageSourcePicker(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF334155)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.camera_alt_outlined, size: 14, color: Color(0xFF8B5CF6)),
                  label: Text('change_btn'.tr, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback() {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppTheme.primaryGradient,
      ),
      child: Center(
        child: Obx(() {
          final name = controller.displayName.value;
          final initials = name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join('').toUpperCase();
          return Text(
            initials.isNotEmpty ? initials : 'AD',
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          );
        }),
      ),
    );
  }

  void _showImageSourcePicker(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'select_profile_photo'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'choose_upload_option'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.camera_alt_rounded, color: Color(0xFF8B5CF6), size: 20),
              ),
              title: Text('take_photo_camera'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              onTap: () {
                Get.back();
                controller.pickImage(ImageSource.camera);
              },
            ),
            const SizedBox(height: 6),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF3B82F6), size: 20),
              ),
              title: Text('choose_from_gallery'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              onTap: () {
                Get.back();
                controller.pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // SECTION 1: PERSONAL INFORMATION
  // ==========================================================
  Widget _buildPersonalInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text('personal_information_sec'.tr,
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 20),

          // Full Name
          _buildFormField(
            label: 'full_name'.tr,
            controller: controller.nameController,
            hintText: 'enter_full_name_hint'.tr,
            icon: Icons.person_outline_rounded,
          ),
          const SizedBox(height: 12),

          // Email Address
          _buildFormField(
            label: 'email_address'.tr,
            controller: controller.emailController,
            hintText: 'enter_email_hint'.tr,
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 12),

          // Phone Number
          _buildFormField(
            label: 'phone_mobile'.tr,
            controller: controller.phoneController,
            hintText: 'enter_phone_hint'.tr,
            icon: Icons.phone_outlined,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 12),

          // Account Code (Read Only)
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('account_code_system_id'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Obx(() => Text(
                      controller.advId.value,
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SECTION 2: BRAND / AGENCY INFORMATION
  // ==========================================================
  Widget _buildBrandInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 9,
                height: 9,
                decoration: const BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'brand_agency_info_sec'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 20),

          // Company Name
          _buildFormField(
            label: 'brand_company_label'.tr,
            controller: controller.companyController,
            hintText: 'enter_brand_agency_hint'.tr,
            icon: Icons.business_rounded,
          ),
          const SizedBox(height: 12),

          // Branch / Division
          _buildFormField(
            label: 'branch_division'.tr,
            controller: controller.branchController,
            hintText: 'branch_division_example_hint'.tr,
            icon: Icons.location_city_rounded,
          ),
          const SizedBox(height: 12),

          // Billing Address
          _buildFormField(
            label: 'billing_address'.tr,
            controller: controller.addressController,
            hintText: 'enter_office_address_hint'.tr,
            icon: Icons.pin_drop_outlined,
            maxLines: 2,
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // SECTION 3: REGIONAL PREFERENCES & TIMEZONE
  // ==========================================================
  Widget _buildPreferencesCard() {
    final languageOptions = [
      {'code': 'en', 'name': 'English (EN)'},
      {'code': 'hi', 'name': 'Hindi (हिन्दी)'},
      {'code': 'kn', 'name': 'Kannada (ಕನ್ನಡ)'},
      {'code': 'mr', 'name': 'Marathi (मराठी)'},
      {'code': 'te', 'name': 'Telugu (తెలుగు)'},
      {'code': 'ta', 'name': 'Tamil (தமிழ்)'},
    ];

    final timezones = [
      'Asia/Kolkata',
      'UTC',
      'America/New_York',
      'Europe/London',
      'Asia/Dubai',
      'Asia/Singapore',
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text('preferences_timezone_sec'.tr,
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 20),

          // Language Dropdown
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('interface_language'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Obx(() => DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: languageOptions.any((l) => l['code'] == controller.language.value)
                            ? controller.language.value
                            : 'en',
                        dropdownColor: const Color(0xFF1E293B),
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        items: languageOptions.map((l) {
                          return DropdownMenuItem<String>(
                            value: l['code'],
                            child: Text(l['name']!),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) controller.language.value = val;
                        },
                      ),
                    )),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Timezone Dropdown
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('analytics_timezone'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Obx(() => DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: timezones.contains(controller.timeZone.value)
                            ? controller.timeZone.value
                            : 'Asia/Kolkata',
                        dropdownColor: const Color(0xFF1E293B),
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        items: timezones.map((tz) {
                          return DropdownMenuItem<String>(
                            value: tz,
                            child: Text(tz),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) controller.timeZone.value = val;
                        },
                      ),
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // BOTTOM SAVE CHANGES BAR
  // ==========================================================
  Widget _buildBottomSaveBar() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Get.back(),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white70,
              side: const BorderSide(color: Color(0xFF334155)),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('cancel'.tr, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          height: 48,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Obx(() => ElevatedButton(
                onPressed: controller.isSaving.value ? null : () => controller.saveProfile(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: controller.isSaving.value
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                          const SizedBox(width: 8),
                          Text('saving_status'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 18),
                          const SizedBox(width: 6),
                          Text('save_account_changes'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
              )),
        ),
      ],
    );
  }

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
          child: Row(
            crossAxisAlignment: maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
            children: [
              Padding(
                padding: EdgeInsets.only(top: maxLines > 1 ? 10 : 0),
                child: Icon(icon, color: AppColors.textMuted, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: keyboardType,
                  maxLines: maxLines,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: hintText,
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

