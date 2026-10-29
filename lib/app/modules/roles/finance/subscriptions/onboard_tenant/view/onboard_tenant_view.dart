import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/onboard_tenant_controller.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class OnboardTenantView extends GetView<OnboardTenantController> {
  const OnboardTenantView({super.key});

  static const Color kDarkBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorder = Color(0xFF334155);
  static const Color kFieldBg = Color(0xFF0F172A);
  static const Color kPrimaryBlue = Color(0xFF2563EB);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
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
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Add New Tenant',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.2,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Register organization, plan & admin account',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        Obx(
          () => Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: kPrimaryIndigo.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: kPrimaryIndigo.withValues(alpha: 0.3)),
            ),
            child: Text(
              'Step ${controller.currentStep.value} of 4',
              style: const TextStyle(
                color: Color(0xFF818CF8),
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
      {'step': 1, 'title': 'Company Info', 'desc': 'Name & Location'},
      {'step': 2, 'title': 'Admin Account', 'desc': 'User & Password'},
      {'step': 3, 'title': 'Plan & Billing', 'desc': 'Plan & Payment'},
      {'step': 4, 'title': 'Review & Save', 'desc': 'Confirm Details'},
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
            final int stepNum = s['step'] as int;
            final isCurrent = controller.currentStep.value == stepNum;
            final isPassed = controller.currentStep.value > stepNum;

            Color bgColor = Colors.transparent;
            Color textColor = const Color(0xFF94A3B8);
            if (isCurrent) {
              bgColor = kPrimaryIndigo;
              textColor = Colors.white;
            } else if (isPassed) {
              bgColor = kGreen.withValues(alpha: 0.15);
              textColor = kGreen;
            }

            return Expanded(
              child: GestureDetector(
                onTap: () => controller.goToStep(stepNum),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? Colors.white
                              : isPassed
                                  ? kGreen
                                  : const Color(0xFF334155),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          isPassed ? '✓' : '$stepNum',
                          style: TextStyle(
                            color: isCurrent
                                ? kPrimaryIndigo
                                : isPassed
                                    ? Colors.white
                                    : const Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s['title'] as String,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 10,
                          fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
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
  // STEP 1: COMPANY INFO
  // =========================================================================
  Widget _buildStep1CompanyInfo(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader('1. Organization Details', 'Company profile, avatar, location, and legal tax numbers'),
        const SizedBox(height: 14),

        // Company Avatar / Profile Selector
        _buildAvatarSelector(),
        const SizedBox(height: 16),

        // Company Name *
        _buildInputField(
          label: 'Company / Organization Name *',
          controller: controller.nameCtrl,
          placeholder: 'e.g. City Bus Services Pvt Ltd',
          icon: Icons.business_outlined,
        ),
        const SizedBox(height: 14),

        // State / UT Dropdown *
        _buildLabel('State / Union Territory *'),
        const SizedBox(height: 6),
        Obx(
          () => Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.selectedState.value,
                dropdownColor: kCardBg,
                icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8)),
                isExpanded: true,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                items: OnboardTenantController.indianStatesAndUts.map((st) {
                  return DropdownMenuItem<String>(
                    value: st,
                    child: Text(st),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) controller.selectedState.value = val;
                },
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // City * & Pincode Row
        Row(
          children: [
            Expanded(
              flex: 3,
              child: _buildInputField(
                label: 'City *',
                controller: controller.cityCtrl,
                placeholder: 'e.g. Mumbai',
                icon: Icons.location_city_outlined,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: _buildInputField(
                label: 'Pincode (6 Digits)',
                controller: controller.pincodeCtrl,
                placeholder: '400001',
                keyboardType: TextInputType.number,
                maxLength: 6,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // CIN & GSTIN Row
        Row(
          children: [
            Expanded(
              child: _buildInputField(
                label: 'CIN (Optional, 21 Chars)',
                controller: controller.cinCtrl,
                placeholder: 'U60200MH2021PTC109921',
                maxLength: 21,
                capitalization: TextCapitalization.characters,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildInputField(
                label: 'GSTIN (Optional, 15 Chars)',
                controller: controller.gstinCtrl,
                placeholder: '27AAACM1234F1Z8',
                maxLength: 15,
                capitalization: TextCapitalization.characters,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Office Address
        _buildInputField(
          label: 'Office Registered Address',
          controller: controller.officeAddressCtrl,
          placeholder: 'Complete physical address, depot or headquarters...',
          icon: Icons.pin_drop_outlined,
          maxLines: 2,
        ),
        const SizedBox(height: 20),

        // Next Button
        _buildBottomBar(
          nextText: 'Next Step: Admin Account →',
          onNext: controller.nextStep,
        ),
      ],
    );
  }

  // Avatar Selector Widget
  Widget _buildAvatarSelector() {
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
          const Text(
            'COMPANY PROFILE AVATAR',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: OnboardTenantController.presetAvatars.map((av) {
                return Obx(() {
                  final isSelected = controller.selectedAvatarId.value == av.id;
                  return GestureDetector(
                    onTap: () => controller.selectedAvatarId.value = av.id,
                    child: Container(
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: av.color.withValues(alpha: isSelected ? 0.25 : 0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? av.color : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(av.icon, color: av.color, size: 18),
                          const SizedBox(width: 6),
                          Text(
                            av.title,
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                });
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 2: ADMIN USER ACCOUNT
  // =========================================================================
  Widget _buildStep2AdminAccount() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader('2. Primary Admin Account', 'Create the initial administrator user who will log in to manage this company'),
        const SizedBox(height: 14),

        // Admin Full Name *
        _buildInputField(
          label: 'Admin Full Name *',
          controller: controller.adminNameCtrl,
          placeholder: 'e.g. Ramesh Kulkarni',
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 14),

        // Admin Email (Login ID) *
        _buildInputField(
          label: 'Admin Email (Login ID) *',
          controller: controller.adminEmailCtrl,
          placeholder: 'e.g. admin@citybus.com',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 14),

        // Mobile Phone (10 Digits) *
        _buildLabel('Mobile Phone (10 Digits) *'),
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
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller.adminPhoneCtrl,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(
                    counterText: '',
                    hintText: '9820012345',
                    hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 12),
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
            _buildLabel('Password *'),
            GestureDetector(
              onTap: controller.generateRandomPassword,
              child: const Text(
                'Generate Strong Password',
                style: TextStyle(
                  color: Color(0xFF818CF8),
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
                hintText: 'Set password',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF94A3B8), size: 18),
                suffixIcon: IconButton(
                  icon: Icon(
                    controller.showPassword.value ? Icons.visibility_off : Icons.visibility,
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
        const Text(
          'Min 8 chars: 1 uppercase (A-Z), 1 number (0-9), 1 special (!@#\$)',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
        ),
        const SizedBox(height: 24),

        // Navigation Buttons
        _buildBottomBar(
          nextText: 'Next Step: Plan & Payment →',
          onNext: controller.nextStep,
          onBack: controller.prevStep,
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 3: PLAN & BILLING
  // =========================================================================
  Widget _buildStep3PlanAndBilling(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        _buildSectionHeader('3. Subscription Plan & Payment Details', 'Select plan tier and payment mode (GST included in plan price)'),
        const SizedBox(height: 14),

        // Plan Selection Cards
        _buildLabel('Select Plan Tier *'),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.loadingPlans.value) {
            return const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator(color: kPrimaryIndigo)));
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
                    color: isSelected ? kPrimaryIndigo.withValues(alpha: 0.12) : kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? kPrimaryIndigo : kBorder,
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
                            color: isSelected ? kPrimaryIndigo : const Color(0xFF64748B),
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
                                  color: kPrimaryIndigo,
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
                              '${p.busesLimit} Buses • ${p.depotsLimit} Depots • ${p.adRevenueShareRate}% Ad Rev Share',
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
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
                          const Text(
                            '/mo (GST incl.)',
                            style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5),
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

        // Locked Quota Specifications
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
                    const Text(
                      'PLAN QUOTA SPECIFICATIONS',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      'Locked to ${p?.name ?? 'Plan'}',
                      style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildQuotaBox('Buses Quota', '${p?.busesLimit ?? 25} Buses'),
                    const SizedBox(width: 8),
                    _buildQuotaBox('Depots Limit', '${p?.depotsLimit ?? 2} Depots'),
                    const SizedBox(width: 8),
                    _buildQuotaBox('Ad Rev Share', '${p?.adRevenueShareRate ?? 65}%', color: kGreen),
                  ],
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 16),

        // Payment Mode Selector (Offline vs Online)
        _buildLabel('Payment Mode *'),
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
                        color: controller.paymentMode.value == 'offline' ? kGreen : kBorder,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.account_balance_outlined,
                                color: controller.paymentMode.value == 'offline' ? kGreen : const Color(0xFF94A3B8),
                                size: 16),
                            const SizedBox(width: 6),
                            const Text(
                              'Offline Transfer',
                              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Cheque / Bank UTR Instant record',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
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
                          ? kPrimaryIndigo.withValues(alpha: 0.15)
                          : kCardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: controller.paymentMode.value == 'online' ? kPrimaryIndigo : kBorder,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.payment_outlined,
                                color: controller.paymentMode.value == 'online' ? kPrimaryIndigo : const Color(0xFF94A3B8),
                                size: 16),
                            const SizedBox(width: 6),
                            const Text(
                              'Online Checkout',
                              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Client completes payment online',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Offline Bank Transfer Fields (if offline)
        Obx(() {
          if (controller.paymentMode.value != 'offline') {
            return const SizedBox.shrink();
          }

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
                const Text(
                  'BANK SETTLEMENT DETAILS',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                _buildInputField(
                  label: 'Bank Name *',
                  controller: controller.bankNameCtrl,
                  placeholder: 'State Bank of India / HDFC Bank',
                  icon: Icons.account_balance,
                ),
                const SizedBox(height: 10),
                _buildInputField(
                  label: 'Bank Reference / UTR Number *',
                  controller: controller.bankRefCtrl,
                  placeholder: 'e.g. UTR1234567890',
                  icon: Icons.receipt_outlined,
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 20),

        // Navigation Buttons
        _buildBottomBar(
          nextText: 'Next Step: Review & Confirm →',
          onNext: controller.nextStep,
          onBack: controller.prevStep,
        ),
      ],
    );
  }

  Widget _buildQuotaBox(String label, String value, {Color? color}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: kFieldBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9)),
            const SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                color: color ?? Colors.white,
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
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
        _buildSectionHeader('4. Review All Details & Create Tenant', 'Please verify organization info, admin credentials, and subscription plan before final submission'),
        const SizedBox(height: 14),

        // Review 1: Organization Details
        _buildReviewCard(
          title: '1. Organization & Identity',
          onEdit: () => controller.goToStep(1),
          children: [
            _buildReviewRow('Company Name', controller.nameCtrl.text.trim()),
            _buildReviewRow('Location', '${controller.cityCtrl.text.trim()}, ${controller.selectedState.value}'),
            if (controller.pincodeCtrl.text.isNotEmpty)
              _buildReviewRow('Pincode', controller.pincodeCtrl.text.trim()),
            if (controller.cinCtrl.text.isNotEmpty)
              _buildReviewRow('CIN', controller.cinCtrl.text.trim()),
            if (controller.gstinCtrl.text.isNotEmpty)
              _buildReviewRow('GSTIN', controller.gstinCtrl.text.trim()),
            if (controller.officeAddressCtrl.text.isNotEmpty)
              _buildReviewRow('Office Address', controller.officeAddressCtrl.text.trim()),
          ],
        ),
        const SizedBox(height: 12),

        // Review 2: Admin Account
        _buildReviewCard(
          title: '2. Primary Admin Account',
          onEdit: () => controller.goToStep(2),
          children: [
            _buildReviewRow('Admin Name', controller.adminNameCtrl.text.trim()),
            _buildReviewRow('Admin Email', controller.adminEmailCtrl.text.trim()),
            _buildReviewRow('Mobile Phone', '+91 ${controller.adminPhoneCtrl.text.trim()}'),
            _buildReviewRow(
              'Password',
              controller.showReviewPassword.value
                  ? controller.adminPasswordCtrl.text.trim()
                  : '••••••••••••',
              trailing: GestureDetector(
                onTap: () => controller.showReviewPassword.toggle(),
                child: Text(
                  controller.showReviewPassword.value ? 'Hide' : 'Show',
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Review 3: Plan & Payment
        _buildReviewCard(
          title: '3. Subscription & Billing',
          onEdit: () => controller.goToStep(3),
          children: [
            _buildReviewRow('Plan Tier', controller.selectedPlan.value?.name ?? 'Standard'),
            _buildReviewRow('Monthly Amount', '₹${controller.selectedPlan.value?.monthlyPrice.toStringAsFixed(0) ?? '25000'} (GST Incl.)'),
            _buildReviewRow('Buses Quota', '${controller.selectedPlan.value?.busesLimit ?? 25} Buses'),
            _buildReviewRow('Depots Limit', '${controller.selectedPlan.value?.depotsLimit ?? 2} Depots'),
            _buildReviewRow('Payment Mode', controller.paymentMode.value == 'offline' ? 'Offline Bank Transfer' : 'Online Checkout'),
            if (controller.paymentMode.value == 'offline') ...[
              _buildReviewRow('Bank Name', controller.bankNameCtrl.text.trim()),
              _buildReviewRow('Bank UTR / Ref', controller.bankRefCtrl.text.trim()),
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
                color: controller.acceptContract.value ? kPrimaryIndigo : kBorder,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Checkbox(
                  value: controller.acceptContract.value,
                  activeColor: kPrimaryIndigo,
                  onChanged: (val) => controller.acceptContract.value = val ?? false,
                ),
                const Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(top: 6),
                    child: Text(
                      'I confirm that all provided tenant details, admin credentials, and subscription payment records are accurate and approved for onboarding.',
                      style: TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.4),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Final Submit Button
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
                    child: const Text(
                      '← Back',
                      style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: GestureDetector(
                  onTap: controller.isSubmitting.value ? null : controller.submitTenant,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: kPrimaryIndigo.withValues(alpha: 0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: controller.isSubmitting.value
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                              SizedBox(width: 8),
                              Text(
                                'Create Tenant Account',
                                style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
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

  Widget _buildReviewCard({required String title, required VoidCallback onEdit, required List<Widget> children}) {
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
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5, fontWeight: FontWeight.w800),
              ),
              GestureDetector(
                onTap: onEdit,
                child: const Row(
                  children: [
                    Icon(Icons.edit_outlined, color: Color(0xFF818CF8), size: 12),
                    SizedBox(width: 4),
                    Text(
                      'Edit',
                      style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.w700),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5)),
          const SizedBox(width: 12),
          if (trailing != null) ...[
            Row(
              children: [
                Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(width: 8),
                trailing,
              ],
            ),
          ] else
            Expanded(
              child: Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                textAlign: TextAlign.right,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
        ],
      ),
    );
  }

  // =========================================================================
  // SUCCESS MODAL DIALOG
  // =========================================================================
  Widget _buildSuccessModal() {
    final d = controller.successModalData.value!;
    return Container(
      color: Colors.black87,
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 24),
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
            const Text(
              'Tenant Account Provisioned!',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Text(
              '${d['orgName']} has been created under ${d['planName']}',
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
                  const Text('PRIMARY ADMIN LOGIN CREDENTIALS', style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Email:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      Text('${d['adminEmail']}', style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Password:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      Text('${d['adminPassword']}', style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11.5, fontFamily: 'monospace', fontWeight: FontWeight.w700)),
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
                    label: const Text('Copy Info', style: TextStyle(fontSize: 11.5)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: kBorder),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: CustomButton(
                    text: 'Done / View',
                    onTap: () {
                      controller.successModalData.value = null;
                      Get.back();
                    },
                    height: 42,
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
          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.3),
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
      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5, fontWeight: FontWeight.w600),
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
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              counterText: '',
              hintText: placeholder,
              hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              prefixIcon: icon != null ? Icon(icon, color: const Color(0xFF94A3B8), size: 18) : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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
                height: 46,
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                alignment: Alignment.center,
                child: const Text(
                  '← Back',
                  style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          flex: 2,
          child: GestureDetector(
            onTap: onNext,
            child: Container(
              height: 46,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: kPrimaryIndigo.withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                nextText,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
