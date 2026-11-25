import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/finance_settings_controller.dart';

class FinanceSettingsView extends GetView<FinanceSettingsController> {
  const FinanceSettingsView({super.key});

  static const Color kBg = Color(0xFF0B0F19);
  static const Color kCardBg = Color(0xFF151D2E);
  static const Color kInputBg = Color(0xFF0D1424);
  static const Color kBorder = Color(0x24FFFFFF);
  static const Color kMuted = Color(0xFF94A3B8);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: AppTheme.gradientBlue),
            );
          }

          return Column(
            children: [
              _buildHeader(context),
              _buildTabBar(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Column(
                    children: [
                      Obx(() {
                        switch (controller.activeTabIndex.value) {
                          case 0:
                            return _buildCorporateInfoTab();
                          case 1:
                            return _buildBankAccountTab();
                          case 2:
                            return _buildTermsLogoTab();
                          case 3:
                            return _buildSignatoryProfileTab();
                          default:
                            return _buildCorporateInfoTab();
                        }
                      }),
                      const SizedBox(height: 16),
                      _buildBottomActionBar(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // Header
  // ==========================================
  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorder)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
            onPressed: controller.onBackPressed,
            splashRadius: 22,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'finance_settings'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'finance_settings_sub'.tr,
                  style: const TextStyle(
                    color: kMuted,
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
            onPressed: controller.loadSettings,
            splashRadius: 22,
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4 Tabs Bar
  // ==========================================
  Widget _buildTabBar() {
    final tabs = [
      {'title': 'tab_corporate_info'.tr, 'icon': Icons.business_outlined},
      {'title': 'tab_bank_account'.tr, 'icon': Icons.account_balance_outlined},
      {'title': 'tab_terms_logo'.tr, 'icon': Icons.description_outlined},
      {'title': 'tab_signatory_profile'.tr, 'icon': Icons.badge_outlined},
    ];

    return Container(
      width: double.infinity,
      color: kCardBg.withValues(alpha: 0.6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Obx(
          () => Row(
            children: List.generate(tabs.length, (index) {
              final isSelected = controller.activeTabIndex.value == index;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => controller.activeTabIndex.value = index,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppTheme.primaryGradient : null,
                      color: isSelected ? null : kInputBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? Colors.transparent : kBorder,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          tabs[index]['icon'] as IconData,
                          size: 16,
                          color: isSelected ? Colors.white : kMuted,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          tabs[index]['title'] as String,
                          style: TextStyle(
                            color: isSelected ? Colors.white : kMuted,
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // TAB 1: Corporate Info
  // ==========================================
  Widget _buildCorporateInfoTab() {
    return _buildCardWrapper(
      headerIcon: Icons.apartment_rounded,
      headerIconColor: const Color(0xFF6366F1),
      headerTitle: 'corporate_tax_registration'.tr,
      headerSub: 'corporate_tax_registration_sub'.tr,
      badgeText: 'gst_compliant'.tr,
      badgeColor: const Color(0xFF6366F1),
      children: [
        _buildTextField(
          label: 'official_legal_company_name'.tr,
          controller: controller.companyNameController,
          isRequired: true,
          helperText: 'legal_name_help'.tr,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'trade_brand_name'.tr,
          controller: controller.tradeNameController,
          isRequired: true,
        ),
        const SizedBox(height: 14),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildTextField(
                label: 'corporate_gstin'.tr,
                controller: controller.gstinController,
                isRequired: true,
                textCapitalization: TextCapitalization.characters,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                label: 'income_tax_pan'.tr,
                controller: controller.panController,
                isRequired: true,
                textCapitalization: TextCapitalization.characters,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildTextField(
                label: 'official_billing_email'.tr,
                controller: controller.emailController,
                isRequired: true,
                keyboardType: TextInputType.emailAddress,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                label: 'billing_desk_phone'.tr,
                controller: controller.phoneController,
                isRequired: true,
                keyboardType: TextInputType.phone,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'corporate_website'.tr,
          controller: controller.websiteController,
          keyboardType: TextInputType.url,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'registered_office_address'.tr,
          controller: controller.addressController,
          maxLines: 3,
        ),
      ],
    );
  }

  // ==========================================
  // TAB 2: Bank Account
  // ==========================================
  Widget _buildBankAccountTab() {
    return _buildCardWrapper(
      headerIcon: Icons.account_balance_rounded,
      headerIconColor: const Color(0xFF10B981),
      headerTitle: 'bank_settlement_details'.tr,
      headerSub: 'bank_settlement_details_sub'.tr,
      badgeText: 'verified_payout'.tr,
      badgeColor: const Color(0xFF10B981),
      children: [
        _buildTextField(
          label: 'bank_name'.tr,
          controller: controller.bankNameController,
          isRequired: true,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'account_beneficiary_name'.tr,
          controller: controller.accountNameController,
          isRequired: true,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'account_number_label'.tr,
          controller: controller.accountNumberController,
          isRequired: true,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 14),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildTextField(
                label: 'ifsc_code'.tr,
                controller: controller.ifscCodeController,
                isRequired: true,
                textCapitalization: TextCapitalization.characters,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                label: 'branch_location'.tr,
                controller: controller.branchController,
                isRequired: true,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'corporate_upi_id'.tr,
          controller: controller.upiIdController,
          helperText: 'upi_scan_hint'.tr,
        ),
      ],
    );
  }

  // ==========================================
  // TAB 3: Terms & Logo
  // ==========================================
  Widget _buildTermsLogoTab() {
    return _buildCardWrapper(
      headerIcon: Icons.receipt_long_rounded,
      headerIconColor: const Color(0xFFA855F7),
      headerTitle: 'invoice_terms_logo'.tr,
      headerSub: 'invoice_terms_logo_sub'.tr,
      badgeText: 'invoice_branding'.tr,
      badgeColor: const Color(0xFFA855F7),
      children: [
        // Brand Logo Section
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kInputBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'corporate_brand_logo'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Logo Preview Container
                  Obx(() {
                    final raw = controller.logoUrl.value;
                    final resolved = ApiConstants.resolveFileUrl(raw);
                    final hasImage = resolved.isNotEmpty;

                    return Container(
                      width: 68,
                      height: 68,
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: kBorder),
                      ),
                      alignment: Alignment.center,
                      child: hasImage
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                resolved,
                                width: 68,
                                height: 68,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => const Icon(
                                  Icons.broken_image_outlined,
                                  color: Colors.white54,
                                  size: 28,
                                ),
                              ),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.image_outlined,
                                  color: Colors.white38,
                                  size: 24,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'no_logo'.tr,
                                  style: const TextStyle(
                                    color: Colors.white38,
                                    fontSize: 9,
                                  ),
                                ),
                              ],
                            ),
                    );
                  }),
                  const SizedBox(width: 12),
                  // Actions
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Obx(() {
                          final uploading = controller.isUploadingLogo.value;
                          final hasImage = controller.logoUrl.value.isNotEmpty;

                          return Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              GestureDetector(
                                onTap: uploading ? null : controller.pickAndUploadLogo,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.primaryGradient,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (uploading)
                                        const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      else
                                        const Icon(
                                          Icons.file_upload_outlined,
                                          color: Colors.white,
                                          size: 16,
                                        ),
                                      const SizedBox(width: 6),
                                      Text(
                                        uploading ? 'uploading'.tr : 'choose_logo'.tr,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              if (hasImage)
                                GestureDetector(
                                  onTap: controller.removeLogo,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: const Color(0x22EF4444),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: const Color(0x44EF4444)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                          Icons.delete_outline,
                                          color: Color(0xFFEF4444),
                                          size: 14,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'remove'.tr,
                                          style: const TextStyle(
                                            color: Color(0xFFEF4444),
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Direct URL Input Field
              _buildTextField(
                label: 'URL',
                controller: controller.logoUrlController,
                onChanged: (val) => controller.logoUrl.value = val.trim(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'standard_terms_conditions'.tr,
          controller: controller.termsAndConditionsController,
          isRequired: true,
          maxLines: 5,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'invoice_bottom_disclaimer'.tr,
          controller: controller.footerNoteController,
          helperText: 'invoice_bottom_disclaimer_sub'.tr,
        ),
      ],
    );
  }

  // ==========================================
  // TAB 4: Signatory Profile
  // ==========================================
  Widget _buildSignatoryProfileTab() {
    return _buildCardWrapper(
      headerIcon: Icons.verified_user_rounded,
      headerIconColor: const Color(0xFF38BDF8),
      headerTitle: 'authorized_signatory_profile'.tr,
      headerSub: 'authorized_signatory_profile_sub'.tr,
      badgeText: 'authorized_signer'.tr,
      badgeColor: const Color(0xFF38BDF8),
      children: [
        _buildTextField(
          label: 'authorized_officer_name'.tr,
          controller: controller.signatoryNameController,
          isRequired: true,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'official_designation'.tr,
          controller: controller.signatoryDesignationController,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'employee_id_code'.tr,
          controller: controller.signatoryEmpIdController,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'corporate_finance_email'.tr,
          controller: controller.signatoryEmailController,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 14),
        _buildTextField(
          label: 'desk_contact_phone'.tr,
          controller: controller.signatoryPhoneController,
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 16),

        // Signature Upload Box
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kInputBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'signatory_signature_image'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'override_sig_sub'.tr,
                style: const TextStyle(
                  color: kMuted,
                  fontSize: 10,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Obx(() {
                    final raw = controller.signatorySignatureUrl.value;
                    final resolved = ApiConstants.resolveFileUrl(raw);
                    final hasImage = resolved.isNotEmpty;

                    return Container(
                      width: 64,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      alignment: Alignment.center,
                      child: hasImage
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                resolved,
                                width: 64,
                                height: 52,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => const Icon(
                                  Icons.broken_image_outlined,
                                  color: Colors.white54,
                                  size: 24,
                                ),
                              ),
                            )
                          : const Icon(
                              Icons.draw_outlined,
                              color: Colors.white38,
                              size: 24,
                            ),
                    );
                  }),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(() {
                      final uploading = controller.isUploadingSignature.value;
                      final hasImage = controller.signatorySignatureUrl.value.isNotEmpty;

                      return Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          GestureDetector(
                            onTap: uploading ? null : controller.pickAndUploadSignature,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (uploading)
                                    const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  else
                                    const Icon(
                                      Icons.file_upload_outlined,
                                      color: Colors.white,
                                      size: 15,
                                    ),
                                  const SizedBox(width: 5),
                                  Text(
                                    uploading
                                        ? 'uploading'.tr
                                        : (hasImage
                                            ? 'change_signature'.tr
                                            : 'upload_signature'.tr),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (hasImage)
                            GestureDetector(
                              onTap: controller.removeSignature,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                                decoration: BoxDecoration(
                                  color: const Color(0x22EF4444),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0x44EF4444)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.delete_outline,
                                      color: Color(0xFFEF4444),
                                      size: 14,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'remove'.tr,
                                      style: const TextStyle(
                                        color: Color(0xFFEF4444),
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      );
                    }),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Corporate Stamp / Seal Upload Box
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kInputBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'corporate_stamp_seal'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'override_stamp_sub'.tr,
                style: const TextStyle(
                  color: kMuted,
                  fontSize: 10,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Obx(() {
                    final raw = controller.signatorySealUrl.value;
                    final resolved = ApiConstants.resolveFileUrl(raw);
                    final hasImage = resolved.isNotEmpty;

                    return Container(
                      width: 64,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      alignment: Alignment.center,
                      child: hasImage
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                resolved,
                                width: 64,
                                height: 52,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => const Icon(
                                  Icons.broken_image_outlined,
                                  color: Colors.white54,
                                  size: 24,
                                ),
                              ),
                            )
                          : const Icon(
                              Icons.verified_outlined,
                              color: Colors.white38,
                              size: 24,
                            ),
                    );
                  }),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Obx(() {
                      final uploading = controller.isUploadingSeal.value;
                      final hasImage = controller.signatorySealUrl.value.isNotEmpty;

                      return Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          GestureDetector(
                            onTap: uploading ? null : controller.pickAndUploadSeal,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (uploading)
                                    const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  else
                                    const Icon(
                                      Icons.file_upload_outlined,
                                      color: Colors.white,
                                      size: 15,
                                    ),
                                  const SizedBox(width: 5),
                                  Text(
                                    uploading
                                        ? 'uploading'.tr
                                        : (hasImage
                                            ? 'change_seal'.tr
                                            : 'upload_stamp'.tr),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (hasImage)
                            GestureDetector(
                              onTap: controller.removeSeal,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                                decoration: BoxDecoration(
                                  color: const Color(0x22EF4444),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0x44EF4444)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.delete_outline,
                                      color: Color(0xFFEF4444),
                                      size: 14,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'remove'.tr,
                                      style: const TextStyle(
                                        color: Color(0xFFEF4444),
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      );
                    }),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // Bottom Action Bar
  // ==========================================
  Widget _buildBottomActionBar() {
    return Column(
      children: [
        Obx(() {
          final saving = controller.isSaving.value;
          return GestureDetector(
            onTap: saving ? null : controller.saveSettings,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.gradientBlue.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (saving)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  else
                    const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    saving ? 'saving_changes'.tr : 'save_settings_btn'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: controller.onBackPressed,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 14,horizontal: 25),
            side: const BorderSide(color: kBorder),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            backgroundColor: kCardBg,
          ),
          child: Text(
            'cancel'.tr,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // Helper: Card Wrapper
  // ==========================================
  Widget _buildCardWrapper({
    required IconData headerIcon,
    required Color headerIconColor,
    required String headerTitle,
    required String headerSub,
    required String badgeText,
    required Color badgeColor,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: headerIconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: headerIconColor.withValues(alpha: 0.3)),
                ),
                child: Icon(headerIcon, color: headerIconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      headerTitle,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      headerSub,
                      style: const TextStyle(
                        color: kMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(
                    color: badgeColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: kBorder, height: 1),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  // ==========================================
  // Helper: Text Field
  // ==========================================
  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    bool isRequired = false,
    String? helperText,
    int maxLines = 1,
    TextInputType? keyboardType,
    TextCapitalization textCapitalization = TextCapitalization.none,
    void Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFFE2E8F0),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (isRequired)
              const Text(
                ' *',
                style: TextStyle(color: Color(0xFFEF4444), fontSize: 12),
              ),
          ],
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          textCapitalization: textCapitalization,
          onChanged: onChanged,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: kInputBg,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: kBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppTheme.gradientBlue, width: 1.5),
            ),
          ),
        ),
        if (helperText != null && helperText.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            helperText,
            style: const TextStyle(
              color: kMuted,
              fontSize: 10,
            ),
          ),
        ],
      ],
    );
  }
}
