import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

import '../controller/onboard_tenant_controller.dart';

class OnboardTenantView extends GetView<OnboardTenantController> {
  const OnboardTenantView({super.key});

  static const Color kDarkBg = Color(0xFF0F0F17);
  static const Color kCardBg = Color(0xFF161623);
  static const Color kBorder = Color(0x1FFFFFFF);
  static const Color kFieldBg = Color(0xFF10101C);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<OnboardTenantController>()) {
      Get.put(OnboardTenantController());
    }

    return Scaffold(
      backgroundColor: kDarkBg,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: _buildHeader(),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildStepperBar(),
                ),
                const SizedBox(height: 14),
                Expanded(
                  child: Obx(() {
                    switch (controller.currentStep.value) {
                      case 1:
                        return _buildStep1CompanyInfo(context);
                      case 2:
                        return _buildStep2AdminAccount();
                      case 3:
                        return _buildStep3PlanAndBilling(context);
                      case 4:
                        return _buildStep4ReviewAndConfirm();
                      default:
                        return _buildStep1CompanyInfo(context);
                    }
                  }),
                ),
              ],
            ),

            // Success Modal Dialog Overlay
            Obx(() {
              if (controller.successModalData.value != null) {
                return _buildSuccessModal();
              }
              return const SizedBox.shrink();
            }),
          ],
        ),
      ),
    );
  }

  // ---------------- Header (Mirroring OnboardTenantPage.jsx) ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Get.back(),
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
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Obx(
                () => Text(
                  controller.isEditMode.value ? 'edit_tenant_title'.tr : 'onboard_add_new_tenant'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              const SizedBox(height: 2),
              Obx(
                () => Text(
                  controller.isEditMode.value ? 'edit_tenant_subtitle'.tr : 'onboard_page_subtitle'.tr,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        Obx(
          () => Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF1C68FD).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFF1C68FD).withValues(alpha: 0.3),
              ),
            ),
            child: Text(
              '${'step'.tr} ${controller.currentStep.value} ${'of'.tr} 4',
              style: const TextStyle(
                color: Color(0xFF93C5FD),
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- 4-Step Stepper Bar ----------------
  Widget _buildStepperBar() {
    final steps = [
      {
        'step': 1,
        'title': 'onboard_step1_title'.tr,
        'desc': 'onboard_step1_desc'.tr,
      },
      {
        'step': 2,
        'title': 'onboard_step2_title'.tr,
        'desc': 'onboard_step2_desc'.tr,
      },
      {
        'step': 3,
        'title': 'onboard_step3_title'.tr,
        'desc': 'onboard_step3_desc'.tr,
      },
      {
        'step': 4,
        'title': 'onboard_step4_title'.tr,
        'desc': 'onboard_step4_desc'.tr,
      },
    ];

    return Obx(
      () => Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: steps.map((s) {
            final stepNum = s['step'] as int;
            final isCurrent = controller.currentStep.value == stepNum;
            final isPassed = controller.currentStep.value > stepNum;

            return Expanded(
              child: GestureDetector(
                onTap: () => controller.goToStep(stepNum),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 6,
                    horizontal: 2,
                  ),
                  decoration: BoxDecoration(
                    gradient: isCurrent ? AppTheme.primaryGradient : null,
                    color: isPassed
                        ? kGreen.withValues(alpha: 0.18)
                        : (isCurrent ? null : Colors.transparent),
                    borderRadius: BorderRadius.circular(10),
                    border: isPassed
                        ? Border.all(color: kGreen.withValues(alpha: 0.4))
                        : null,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: isPassed
                              ? kGreen
                              : (isCurrent
                                    ? Colors.white
                                    : const Color(0xFF334155)),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: isPassed
                            ? const Icon(
                                Icons.check,
                                size: 12,
                                color: Colors.white,
                              )
                            : Text(
                                '$stepNum',
                                style: TextStyle(
                                  color: isCurrent
                                      ? const Color(0xFF1C68FD)
                                      : Colors.white70,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s['title'] as String,
                        style: TextStyle(
                          color: isCurrent
                              ? Colors.white
                              : (isPassed
                                    ? const Color(0xFF6EE7B7)
                                    : const Color(0xFF94A3B8)),
                          fontSize: 10,
                          fontWeight: isCurrent
                              ? FontWeight.w800
                              : FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP 1: COMPANY INFO (With Logo Upload & Google Places Autocomplete)
  // =========================================================================
  Widget _buildStep1CompanyInfo(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader(
          'onboard_sec1_title'.tr,
          'onboard_sec1_subtitle'.tr,
        ),
        const SizedBox(height: 14),

        // Company Logo Upload Box (Matching OnboardTenantPage.jsx)
        _buildLogoUploadBox(context),
        const SizedBox(height: 16),

        // Company Name *
        _buildInputField(
          label: 'onboard_company_name_label'.tr,
          controller: controller.nameCtrl,
          placeholder: 'ph_company_name'.tr,
          icon: Icons.business_outlined,
        ),
        const SizedBox(height: 14),

        // Office Address (Google Places Autocomplete)
        _buildGooglePlacesAddressField(context),
        const SizedBox(height: 14),

        // City * & State / UT Dropdown
        Row(
          children: [
            Expanded(
              flex: 3,
              child: _buildInputField(
                label: 'city_label'.tr,
                controller: controller.cityCtrl,
                placeholder: 'ph_city'.tr,
                icon: Icons.location_city_outlined,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('state_label'.tr),
                  const SizedBox(height: 6),
                  Obx(
                    () => Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: kFieldBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      alignment: Alignment.center,
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: controller.selectedState.value,
                          dropdownColor: kCardBg,
                          icon: const Icon(
                            Icons.arrow_drop_down,
                            color: Color(0xFF94A3B8),
                          ),
                          isExpanded: true,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                          ),
                          items: OnboardTenantController.indianStatesAndUts.map(
                            (st) {
                              return DropdownMenuItem<String>(
                                value: st,
                                child: Text(
                                  st,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            },
                          ).toList(),
                          onChanged: (val) {
                            if (val != null)
                              controller.selectedState.value = val;
                          },
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Pincode & CIN Row
        Row(
          children: [
            Expanded(
              flex: 2,
              child: _buildInputField(
                label: 'pincode_label'.tr,
                controller: controller.pincodeCtrl,
                placeholder: 'ph_pincode'.tr,
                keyboardType: TextInputType.number,
                maxLength: 6,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 3,
              child: _buildInputField(
                label: 'cin_label'.tr,
                controller: controller.cinCtrl,
                placeholder: 'ph_cin'.tr,
                maxLength: 21,
                capitalization: TextCapitalization.characters,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // GSTIN (15 Digits - Optional)
        _buildInputField(
          label: 'gstin_label'.tr,
          controller: controller.gstinCtrl,
          placeholder: 'ph_gstin'.tr,
          maxLength: 15,
          capitalization: TextCapitalization.characters,
        ),
        const SizedBox(height: 20),

        // Next Button
        _buildBottomBar(
          nextText: '${'btn_next_admin'.tr} →',
          onNext: controller.nextStep,
        ),
      ],
    );
  }

  // ---------------- Logo Upload Box ----------------
  Widget _buildLogoUploadBox(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'company_logo_label'.tr.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              // Avatar / Image Preview
              Obx(() {
                final file = controller.logoFile.value;
                return Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10101C),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.15),
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: file != null
                      ? Image.file(file, fit: BoxFit.cover)
                      : Center(
                          child: Container(
                            width: double.infinity,
                            height: double.infinity,
                            decoration: const BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                            ),
                            child: Center(
                              child: Text(
                                controller.nameCtrl.text.isNotEmpty
                                    ? controller.nameCtrl.text[0].toUpperCase()
                                    : '🏢',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ),
                        ),
                );
              }),
              const SizedBox(width: 14),

              // Action buttons & info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Upload / Change button with AppTheme.primaryGradient
                        GestureDetector(
                          onTap: () => _showImageSourcePicker(context),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
                            ),
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF1C68FD,
                                  ).withValues(alpha: 0.3),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.add_photo_alternate_outlined,
                                  color: Colors.white,
                                  size: 14,
                                ),
                                const SizedBox(width: 5),
                                Obx(
                                  () => Text(
                                    controller.logoFile.value != null
                                        ? 'change_image'.tr
                                        : 'select_image'.tr,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Remove Logo Button
                        Obx(() {
                          if (controller.logoFile.value == null)
                            return const SizedBox.shrink();
                          return GestureDetector(
                            onTap: controller.removeLogo,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0x1EEF4444),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(
                                    0xFFEF4444,
                                  ).withValues(alpha: 0.4),
                                ),
                              ),
                              child: Text(
                                'remove_logo'.tr,
                                style: const TextStyle(
                                  color: Color(0xFFEF4444),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Obx(() {
                      final f = controller.logoFile.value;
                      if (f != null) {
                        return Text(
                          'ready_to_upload'.tr,
                          style: const TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                          ),
                        );
                      }
                      return Text(
                        'logo_allowed_types'.tr,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 10,
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showImageSourcePicker(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1A1A2A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'select_image_source'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 14),
            ListTile(
              leading: const Icon(
                Icons.photo_library,
                color: Color(0xFF60A5FA),
              ),
              title: Text(
                'gallery'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              onTap: () {
                Get.back();
                controller.pickLogo(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFF60A5FA)),
              title: Text(
                'camera'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              onTap: () {
                Get.back();
                controller.pickLogo(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Google Places Autocomplete Address Field ----------------
  Widget _buildGooglePlacesAddressField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildLabel('office_address_label'.tr),
            Obx(() {
              if (controller.latitude.value != null &&
                  controller.longitude.value != null) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0x1E60A5FA),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: const Color(0xFF60A5FA).withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    'GPS: ${controller.latitude.value!.toStringAsFixed(4)}, ${controller.longitude.value!.toStringAsFixed(4)}',
                    style: const TextStyle(
                      color: Color(0xFF93C5FD),
                      fontSize: 9.5,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            }),
          ],
        ),
        const SizedBox(height: 6),

        // Search Input Field
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            children: [
              TextField(
                controller: controller.officeAddressCtrl,
                onChanged: controller.onAddressSearchChanged,
                maxLines: 2,
                minLines: 1,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
                decoration: InputDecoration(
                  hintText: 'ph_office_address'.tr,
                  hintStyle: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 12,
                  ),
                  prefixIcon: const Icon(
                    Icons.location_on_outlined,
                    color: Color(0xFF94A3B8),
                    size: 18,
                  ),
                  suffixIcon: Obx(() {
                    if (controller.isSearchingPlaces.value) {
                      return const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Color(0xFF1C68FD),
                          ),
                        ),
                      );
                    }
                    if (controller.officeAddressCtrl.text.isNotEmpty) {
                      return IconButton(
                        icon: const Icon(
                          Icons.close,
                          color: Colors.white54,
                          size: 16,
                        ),
                        onPressed: controller.clearAddress,
                      );
                    }
                    return const SizedBox.shrink();
                  }),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 12,
                  ),
                ),
              ),

              // Predictions Dropdown List
              Obx(() {
                if (!controller.showPlacesDropdown.value ||
                    controller.placesPredictions.isEmpty) {
                  return const SizedBox.shrink();
                }

                return Container(
                  constraints: const BoxConstraints(maxHeight: 200),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: kBorder)),
                    color: Color(0xFF141422),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: controller.placesPredictions.length,
                    separatorBuilder: (_, __) => Divider(
                      color: Colors.white.withValues(alpha: 0.05),
                      height: 1,
                    ),
                    itemBuilder: (context, idx) {
                      final place = controller.placesPredictions[idx];
                      return ListTile(
                        dense: true,
                        leading: const Icon(
                          Icons.place,
                          color: Color(0xFF1C68FD),
                          size: 16,
                        ),
                        title: Text(
                          place.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        subtitle: Text(
                          place.formattedAddress,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        onTap: () => controller.selectPlace(place),
                      );
                    },
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'address_hint'.tr,
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 2: ADMIN USER ACCOUNT
  // =========================================================================
  Widget _buildStep2AdminAccount() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader(
          'onboard_sec2_title'.tr,
          'onboard_sec2_subtitle'.tr,
        ),
        const SizedBox(height: 14),

        // Admin Full Name *
        _buildInputField(
          label: 'admin_name_label'.tr,
          controller: controller.adminNameCtrl,
          placeholder: 'ph_admin_name'.tr,
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 14),

        // Admin Email (Login ID) *
        _buildInputField(
          label: 'admin_email_label'.tr,
          controller: controller.adminEmailCtrl,
          placeholder: 'ph_admin_email'.tr,
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 14),

        // Mobile Phone (10 Digits) *
        _buildLabel('admin_phone_label'.tr),
        const SizedBox(height: 6),
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                height: double.infinity,
                decoration: const BoxDecoration(
                  border: Border(right: BorderSide(color: kBorder)),
                ),
                alignment: Alignment.center,
                child: const Text(
                  '+91',
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller.adminPhoneCtrl,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: const InputDecoration(
                    counterText: '',
                    hintText: '9820012345',
                    hintStyle: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Password * with Generator & Show/Hide
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildLabel('password_label'.tr),
            GestureDetector(
              onTap: controller.generateRandomPassword,
              child: Text(
                'auto_generate_password'.tr,
                style: const TextStyle(
                  color: Color(0xFF93C5FD),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Obx(
          () => Container(
            height: 48,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: TextField(
              controller: controller.adminPasswordCtrl,
              obscureText: !controller.showPassword.value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w700,
              ),
              decoration: InputDecoration(
                hintText: 'ph_password'.tr,
                hintStyle: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 12,
                ),
                prefixIcon: const Icon(
                  Icons.lock_outline,
                  color: Color(0xFF94A3B8),
                  size: 18,
                ),
                suffixIcon: IconButton(
                  icon: Icon(
                    controller.showPassword.value
                        ? Icons.visibility_off
                        : Icons.visibility,
                    color: Colors.white54,
                    size: 18,
                  ),
                  onPressed: () => controller.showPassword.toggle(),
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'password_hint'.tr,
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
        ),
        const SizedBox(height: 24),

        // Navigation Buttons
        _buildBottomBar(
          nextText: '${'btn_next_plan'.tr} →',
          onNext: controller.nextStep,
          onBack: controller.prevStep,
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 3: PLAN & BILLING (Locked Quotas, No Dummy Fields)
  // =========================================================================
  Widget _buildStep3PlanAndBilling(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader(
          'onboard_sec3_title'.tr,
          'onboard_sec3_subtitle'.tr,
        ),
        const SizedBox(height: 14),

        // Plan Selection Cards
        _buildLabel('select_plan_tier_label'.tr),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.loadingPlans.value) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: Color(0xFF1C68FD)),
              ),
            );
          }

          if (controller.plans.isEmpty) {
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 24),
              alignment: Alignment.center,
              child: Text(
                'no_plans_available'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
            );
          }

          return Column(
            children: controller.plans.map((p) {
              final isSelected = controller.selectedPlan.value?.id == p.id;
              return GestureDetector(
                onTap: () => controller.selectPlan(p),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? LinearGradient(
                            colors: [
                              const Color(0xFF1C68FD).withValues(alpha: 0.18),
                              const Color(0xFFDA29F4).withValues(alpha: 0.18),
                            ],
                          )
                        : null,
                    color: isSelected ? null : kCardBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF1C68FD) : kBorder,
                      width: isSelected ? 1.8 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFF1C68FD)
                                : const Color(0xFF64748B),
                            width: 2,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: isSelected
                            ? Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: AppTheme.primaryGradient,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${p.busesLimit} ${'buses'.tr} • ${p.depotsLimit} ${'depots'.tr}',
                              style: const TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${p.monthlyPrice.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            'gst_included_label'.tr,
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 9.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 14),

        // Locked Quota Specifications (Only 2 Cards: Buses Quota & Depots Limit, NO Dummy Fields)
        Obx(() {
          final p = controller.selectedPlan.value;
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: kBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'plan_tier_quota_specs'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0x1E1C68FD),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'locked_by_tier'.tr,
                        style: const TextStyle(
                          color: Color(0xFF93C5FD),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildQuotaBox(
                        'buses_quota_label'.tr,
                        '${p?.busesLimit ?? 25} ${'buses'.tr}',
                        'included_fleet_cap'.tr,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildQuotaBox(
                        'depots_limit_label'.tr,
                        '${p?.depotsLimit ?? 2} ${'depots'.tr}',
                        'included_terminal_cap'.tr,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'quota_auto_bound_note'.tr,
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 9.5,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),

        // Payment Mode Selector (Offline vs Online)
        _buildLabel('payment_mode_label'.tr),
        const SizedBox(height: 8),
        Obx(
          () => Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => controller.paymentMode.value = 'offline',
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: controller.paymentMode.value == 'offline'
                          ? kGreen.withValues(alpha: 0.15)
                          : kCardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: controller.paymentMode.value == 'offline'
                            ? kGreen
                            : kBorder,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.account_balance_outlined,
                              color: controller.paymentMode.value == 'offline'
                                  ? kGreen
                                  : const Color(0xFF94A3B8),
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'payment_mode_offline'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'payment_mode_offline_desc'.tr,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 9.5,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => controller.paymentMode.value = 'online',
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: controller.paymentMode.value == 'online'
                          ? const Color(0xFF1C68FD).withValues(alpha: 0.15)
                          : kCardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: controller.paymentMode.value == 'online'
                            ? const Color(0xFF1C68FD)
                            : kBorder,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.credit_card_outlined,
                              color: controller.paymentMode.value == 'online'
                                  ? const Color(0xFF60A5FA)
                                  : const Color(0xFF94A3B8),
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'payment_mode_online'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'payment_mode_online_desc'.tr,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 9.5,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Offline Bank Transfer Fields (Only when Offline)
        Obx(() {
          if (controller.paymentMode.value != 'offline') {
            return const SizedBox.shrink();
          }

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: kGreen.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kGreen.withValues(alpha: 0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.receipt_long_outlined,
                      color: kGreen,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'payment_record_details'.tr,
                      style: const TextStyle(
                        color: Color(0xFF6EE7B7),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Bank Name
                _buildInputField(
                  label: 'bank_name_label'.tr,
                  controller: controller.bankNameCtrl,
                  placeholder: 'ph_bank_name'.tr,
                  icon: Icons.account_balance,
                ),
                const SizedBox(height: 12),

                // Bank Reference / UTR
                _buildInputField(
                  label: 'bank_ref_label'.tr,
                  controller: controller.bankRefCtrl,
                  placeholder: 'ph_bank_ref'.tr,
                  icon: Icons.numbers,
                  capitalization: TextCapitalization.characters,
                ),
                const SizedBox(height: 12),

                // Amount Paid (Read-Only Auto-Locked to Plan)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildLabel('amount_paid_label'.tr),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'fixed_from_plan'.tr,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 9.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D0D17),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      alignment: Alignment.centerLeft,
                      child: Text(
                        '₹ ${controller.selectedPlan.value?.monthlyPrice.toStringAsFixed(0) ?? '25000'}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Payment Date
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('payment_date_label'.tr),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: controller.paymentDate.value,
                          firstDate: DateTime(2020),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null)
                          controller.paymentDate.value = picked;
                      },
                      child: Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: kFieldBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: kBorder),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              DateFormat(
                                'yyyy-MM-dd',
                              ).format(controller.paymentDate.value),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Icon(
                              Icons.calendar_today,
                              color: Color(0xFF94A3B8),
                              size: 16,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 24),

        // Navigation Buttons
        _buildBottomBar(
          nextText: '${'btn_next_review'.tr} →',
          onNext: controller.nextStep,
          onBack: controller.prevStep,
        ),
      ],
    );
  }

  Widget _buildQuotaBox(String label, String value, String sub) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF10101C),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sub,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 4: REVIEW & CONFIRM
  // =========================================================================
  Widget _buildStep4ReviewAndConfirm() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader(
          'onboard_sec4_title'.tr,
          'onboard_sec4_subtitle'.tr,
        ),
        const SizedBox(height: 14),

        // Review 1: Organization Details
        _buildReviewCard(
          title: 'review_sec1_title'.tr,
          onEdit: () => controller.goToStep(1),
          children: [
            _buildReviewRow(
              'lbl_company_name'.tr,
              controller.nameCtrl.text.trim(),
            ),
            _buildReviewRow(
              'lbl_location'.tr,
              '${controller.cityCtrl.text.trim()}, ${controller.selectedState.value}',
            ),
            if (controller.pincodeCtrl.text.isNotEmpty)
              _buildReviewRow(
                'lbl_pincode'.tr,
                controller.pincodeCtrl.text.trim(),
              ),
            if (controller.cinCtrl.text.isNotEmpty)
              _buildReviewRow('lbl_cin'.tr, controller.cinCtrl.text.trim()),
            if (controller.gstinCtrl.text.isNotEmpty)
              _buildReviewRow('lbl_gstin'.tr, controller.gstinCtrl.text.trim()),
            if (controller.latitude.value != null &&
                controller.longitude.value != null)
              _buildReviewRow(
                'lbl_gps'.tr,
                '${controller.latitude.value!.toStringAsFixed(4)}, ${controller.longitude.value!.toStringAsFixed(4)}',
              ),
            if (controller.officeAddressCtrl.text.isNotEmpty)
              _buildReviewRow(
                'lbl_office_address'.tr,
                controller.officeAddressCtrl.text.trim(),
              ),
          ],
        ),
        const SizedBox(height: 12),

        // Review 2: Admin Account
        _buildReviewCard(
          title: 'review_sec2_title'.tr,
          onEdit: () => controller.goToStep(2),
          children: [
            _buildReviewRow(
              'lbl_admin_name'.tr,
              controller.adminNameCtrl.text.trim(),
            ),
            _buildReviewRow(
              'lbl_login_email'.tr,
              controller.adminEmailCtrl.text.trim(),
            ),
            _buildReviewRow(
              'lbl_mobile_phone'.tr,
              '+91 ${controller.adminPhoneCtrl.text.trim()}',
            ),
            Obx(
              () => _buildReviewRow(
                'lbl_temp_password'.tr,
                controller.showReviewPassword.value
                    ? controller.adminPasswordCtrl.text.trim()
                    : '••••••••••••',
                trailing: GestureDetector(
                  onTap: () => controller.showReviewPassword.toggle(),
                  child: Text(
                    controller.showReviewPassword.value ? 'hide'.tr : 'show'.tr,
                    style: const TextStyle(
                      color: Color(0xFF93C5FD),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Review 3: Plan & Payment
        _buildReviewCard(
          title: 'review_sec3_title'.tr,
          onEdit: () => controller.goToStep(3),
          children: [
            _buildReviewRow(
              'lbl_selected_tier'.tr,
              controller.selectedPlan.value?.name ?? 'Standard',
            ),
            _buildReviewRow(
              'lbl_plan_rate'.tr,
              '₹${controller.selectedPlan.value?.monthlyPrice.toStringAsFixed(0) ?? '25000'} ${'per_month'.tr}',
            ),
            _buildReviewRow(
              'lbl_buses_quota'.tr,
              '${controller.selectedPlan.value?.busesLimit ?? 25} ${'buses'.tr}',
            ),
            _buildReviewRow(
              'lbl_depots_limit'.tr,
              '${controller.selectedPlan.value?.depotsLimit ?? 2} ${'depots'.tr}',
            ),
            _buildReviewRow(
              'lbl_payment_mode'.tr,
              controller.paymentMode.value == 'offline'
                  ? 'offline_bank_settlement'.tr
                  : 'online_client_checkout'.tr,
            ),
            if (controller.paymentMode.value == 'offline') ...[
              _buildReviewRow(
                'lbl_settlement_bank'.tr,
                controller.bankNameCtrl.text.trim(),
              ),
              _buildReviewRow(
                'lbl_utr_ref'.tr,
                controller.bankRefCtrl.text.trim(),
              ),
              _buildReviewRow(
                'lbl_amount_paid'.tr,
                '₹ ${controller.selectedPlan.value?.monthlyPrice.toStringAsFixed(0) ?? '25000'}',
              ),
              _buildReviewRow(
                'lbl_payment_date'.tr,
                DateFormat('yyyy-MM-dd').format(controller.paymentDate.value),
              ),
            ],
          ],
        ),
        const SizedBox(height: 14),

        // Contract Declaration Checkbox
        Obx(
          () => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: controller.acceptContract.value
                    ? const Color(0xFF1C68FD)
                    : kBorder,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Checkbox(
                  value: controller.acceptContract.value,
                  activeColor: const Color(0xFF1C68FD),
                  onChanged: (val) =>
                      controller.acceptContract.value = val ?? false,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'contract_confirm_label'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11.5,
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Final Submit Button with AppTheme.primaryGradient
        Obx(
          () => Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: controller.prevStep,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kBorder),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '← ${'back'.tr}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: GestureDetector(
                  onTap:
                      (controller.isSubmitting.value ||
                          !controller.acceptContract.value)
                      ? null
                      : controller.submitTenant,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: controller.acceptContract.value
                          ? AppTheme.primaryGradient
                          : null,
                      color: controller.acceptContract.value
                          ? null
                          : const Color(0xFF1E2235),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: controller.acceptContract.value
                          ? [
                              BoxShadow(
                                color: const Color(
                                  0xFF1C68FD,
                                ).withValues(alpha: 0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    alignment: Alignment.center,
                    child: controller.isSubmitting.value
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2.2,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                              // const SizedBox(width: 8),
                              Obx(
                                () => Text(
                                  controller.isEditMode.value
                                      ? 'btn_save_changes_tenant'.tr
                                      : 'btn_complete_onboarding'.tr,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewCard({
    required String title,
    required VoidCallback onEdit,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
              GestureDetector(
                onTap: onEdit,
                child: Row(
                  children: [
                    const Icon(
                      Icons.edit_outlined,
                      color: Color(0xFF93C5FD),
                      size: 12,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'edit'.tr,
                      style: const TextStyle(
                        color: Color(0xFF93C5FD),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Divider(color: Colors.white.withValues(alpha: 0.06), height: 1),
          const SizedBox(height: 8),
          ...children,
        ],
      ),
    );
  }

  Widget _buildReviewRow(String label, String value, {Widget? trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: trailing != null
                          ? FontWeight.w600
                          : FontWeight.w700,
                    ),
                  ),
                ),
                if (trailing != null) ...[const SizedBox(width: 8), trailing],
              ],
            ),
          ),
        ],
      ),
    );
  }
  // Widget _buildReviewRow(String label, String value, {Widget? trailing}) {
  //   return Padding(
  //     padding: const EdgeInsets.symmetric(vertical: 4),
  //     child: Row(
  //       mainAxisAlignment: MainAxisAlignment.spaceBetween,
  //       children: [
  //         Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5)),
  //         if (trailing != null)
  //           Row(
  //             children: [
  //               Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
  //               const SizedBox(width: 8),
  //               trailing,
  //             ],
  //           )
  //         else
  //           Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
  //       ],
  //     ),
  //   );
  // }

  // =========================================================================
  // SUCCESS MODAL
  // =========================================================================
  Widget _buildSuccessModal() {
    final d = controller.successModalData.value!;
    return Container(
      color: Colors.black.withValues(alpha: 0.75),
      alignment: Alignment.center,
      padding: const EdgeInsets.all(24),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: kGreen.withValues(alpha: 0.4)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: kGreen.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: kGreen, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              'tenant_onboarded_success_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${d['orgName']} (${d['planName']})',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),

            // Credentials Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'primary_admin_credentials_heading'.tr.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'lbl_login_email'.tr,
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        '${d['adminEmail']}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'password_label'.tr,
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        '${d['adminPassword']}',
                        style: const TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 11.5,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: controller.copyCredentials,
                    icon: const Icon(Icons.copy, size: 14),
                    label: Text(
                      'copy_info'.tr,
                      style: const TextStyle(fontSize: 11.5),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: kBorder),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      controller.successModalData.value = null;
                      Get.back();
                    },
                    child: Container(
                      height: 42,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Center(
                        child: Text(
                          'done_view'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // HELPER WIDGETS
  // =========================================================================
  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          subtitle,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFFCBD5E1),
        fontSize: 11.5,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String placeholder,
    IconData? icon,
    TextInputType keyboardType = TextInputType.text,
    int? maxLength,
    TextCapitalization capitalization = TextCapitalization.none,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: kBorder),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            maxLength: maxLength,
            textCapitalization: capitalization,
            maxLines: maxLines,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
            decoration: InputDecoration(
              counterText: '',
              hintText: placeholder,
              hintStyle: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
              ),
              prefixIcon: icon != null
                  ? Icon(icon, color: const Color(0xFF94A3B8), size: 18)
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar({
    required String nextText,
    required VoidCallback onNext,
    VoidCallback? onBack,
  }) {
    return Row(
      children: [
        if (onBack != null) ...[
          Expanded(
            child: GestureDetector(
              onTap: onBack,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                alignment: Alignment.center,
                child: Text(
                  '← ${'back'.tr}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          flex: onBack != null ? 2 : 1,
          child: GestureDetector(
            onTap: onNext,
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                nextText,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
