import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../controllers/add_driver_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/fleet_models.dart';

class AddDriverView extends GetView<AddDriverController> {
  const AddDriverView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            _buildTopBar(),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Form(
                  key: controller.formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Context Card
                      _buildHeaderContextCard(),
                      const SizedBox(height: 18),

                      // Section 1: Personal Information & Profile Photo
                      _buildSectionCard(
                        icon: Icons.person_outline_rounded,
                        iconColor: const Color(0xFF10B981),
                        title: 'driver_account_profile_photo'.tr,
                        subtitle: 'driver_account_profile_photo_desc'.tr,
                        children: [
                          _buildAvatarUploadCard(context),
                          const SizedBox(height: 16),

                          _buildLabel('full_name_req'.tr),
                          CustomTextField(
                            hintText: 'full_name_hint'.tr,
                            prefixSvg: 'assets/icons/profile.svg',
                            prefixHeight: 18,
                            prefixWidth: 18,
                            controller: controller.nameController,
                          ),
                          const SizedBox(height: 14),

                          // Emp ID & Badge ID
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('employee_id'.tr),
                                    CustomTextField(
                                      hintText: 'EMP-0192',
                                      prefixAsset: 'assets/icons/fleet_operator_icons/id.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      controller: controller.empIdController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('badge_id'.tr),
                                    CustomTextField(
                                      hintText: 'MP09-DRV-04',
                                      prefixAsset: 'assets/icons/fleet_operator_icons/id.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      controller: controller.badgeIdController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Mobile Phone
                          _buildLabel('mobile_phone_req'.tr),
                          CustomTextField(
                            hintText: '9826012345',
                            prefixAsset: 'assets/icons/phone.png',
                            prefixWidth: 22,
                            prefixHeight: 22,
                            useGradientIcon: true,
                            keyboardType: TextInputType.phone,
                            controller: controller.phoneController,
                          ),
                          const SizedBox(height: 14),

                          // Email
                          _buildLabel('email_address_opt'.tr),
                          CustomTextField(
                            hintText: 'driver@transit.in',
                            prefixSvg: 'assets/icons/gmail.svg',
                            prefixWidth: 16,
                            prefixHeight: 16,
                            useGradientIcon: true,
                            keyboardType: TextInputType.emailAddress,
                            controller: controller.emailController,
                          ),
                          const SizedBox(height: 14),

                          // Password (for driver app login)
                          Obx(() {
                            if (controller.isEditMode.value) return const SizedBox.shrink();
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('driver_login_password'.tr),
                                CustomTextField(
                                  hintText: 'create_login_password'.tr,
                                  prefixSvg: 'assets/icons/shield.svg',
                                  isPassword: true,
                                  isObscured: controller.obscurePassword.value,
                                  onToggleObscure: () => controller.obscurePassword.toggle(),
                                  controller: controller.passwordController,
                                ),
                                const SizedBox(height: 14),
                              ],
                            );
                          }),

                          // DOB & Gender Row
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('date_of_birth'.tr),
                                    GestureDetector(
                                      onTap: () => controller.selectDate(context, controller.dobController),
                                      child: AbsorbPointer(
                                        child: CustomTextField(
                                          hintText: 'YYYY-MM-DD',
                                          prefixSvg: 'assets/icons/calendar.svg',
                                          useGradientIcon: true,
                                          controller: controller.dobController,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('gender'.tr),
                                    Obx(
                                      () => CustomTextField(
                                        hintText: 'select_gender'.tr,
                                        prefixSvg: 'assets/icons/profile.svg',
                                        prefixHeight: 18,
                                        prefixWidth: 18,
                                        useGradientIcon: true,
                                        isDropdown: true,
                                        dropdownValue: controller.selectedGender.value,
                                        dropdownItems: controller.genders,
                                        onDropdownChanged: (val) {
                                          if (val != null) controller.selectedGender.value = val;
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Blood Group
                          _buildLabel('blood_group'.tr),
                          Obx(
                            () => CustomTextField(
                              hintText: 'select_blood_group'.tr,
                              prefixSvg: 'assets/icons/droplet.svg',
                              useGradientIcon: true,
                              isDropdown: true,
                              dropdownValue: controller.selectedBloodGroup.value,
                              dropdownItems: controller.bloodGroups,
                              onDropdownChanged: (val) {
                                if (val != null) controller.selectedBloodGroup.value = val;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 2: Residential Address & Geolocation
                      _buildSectionCard(
                        icon: Icons.home_work_outlined,
                        iconColor: const Color(0xFFA855F7),
                        title: 'residential_address'.tr,
                        subtitle: 'residential_address_desc'.tr,
                        children: [
                          _buildLabel('full_street_address_req'.tr),
                          CustomTextField(
                            hintText: 'driver_address_hint'.tr,
                            prefixSvg: 'assets/icons/location.svg',
                            controller: controller.addressController,
                          ),
                          const SizedBox(height: 14),

                          // City & State
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('city_district'.tr),
                                    CustomTextField(
                                      hintText: 'Indore',
                                      prefixSvg: 'assets/icons/building.svg',
                                      controller: controller.cityController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('state_label'.tr),
                                    CustomTextField(
                                      hintText: 'Madhya Pradesh',
                                      prefixSvg: 'assets/icons/building.svg',
                                      controller: controller.stateController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // PIN Code
                          _buildLabel('postal_pin_code_req'.tr),
                          CustomTextField(
                            hintText: '452001',
                            prefixSvg: 'assets/icons/location.svg',
                            keyboardType: TextInputType.number,
                            controller: controller.pincodeController,
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 3: Commercial DL & Compliance
                      _buildSectionCard(
                        icon: Icons.badge_outlined,
                        iconColor: const Color(0xFF38BDF8),
                        title: 'commercial_dl_compliance'.tr,
                        subtitle: 'commercial_dl_desc'.tr,
                        children: [
                          // License Number & License Type
                          _buildLabel('commercial_dl_number_req'.tr),
                          CustomTextField(
                            hintText: 'e.g. MP09-2019-009124',
                            prefixSvg: 'assets/icons/license.svg',
                            useGradientIcon: true,
                            controller: controller.licenseNoController,
                          ),
                          const SizedBox(height: 14),

                          _buildLabel('license_classification_req'.tr),
                          Obx(
                            () => CustomTextField(
                              hintText: 'select_license_type'.tr,
                              prefixSvg: 'assets/icons/shield.svg',
                              useGradientIcon: true,
                              isDropdown: true,
                              dropdownValue: controller.selectedLicenseType.value,
                              dropdownItems: controller.licenseTypes,
                              onDropdownChanged: (val) {
                                if (val != null) controller.selectedLicenseType.value = val;
                              },
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Issue Date & Expiry Date
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('dl_issue_date'.tr),
                                    GestureDetector(
                                      onTap: () => controller.selectDate(context, controller.issueDateController),
                                      child: AbsorbPointer(
                                        child: CustomTextField(
                                          hintText: 'YYYY-MM-DD',
                                          prefixSvg: 'assets/icons/calendar.svg',
                                          useGradientIcon: true,
                                          controller: controller.issueDateController,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('dl_expiry_date_req'.tr),
                                    GestureDetector(
                                      onTap: () => controller.selectDate(context, controller.expiryDateController),
                                      child: AbsorbPointer(
                                        child: CustomTextField(
                                          hintText: 'YYYY-MM-DD',
                                          prefixSvg: 'assets/icons/calendar.svg',
                                          useGradientIcon: true,
                                          controller: controller.expiryDateController,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Issuing RTO Authority
                          _buildLabel('rto_issuing_authority_req'.tr),
                          CustomTextField(
                            hintText: 'rto_authority_hint'.tr,
                            prefixSvg: 'assets/icons/building.svg',
                            controller: controller.authorityController,
                          ),
                          const SizedBox(height: 14),

                          // Medical Fitness Certificate Validity
                          _buildLabel('medical_cert_valid_until'.tr),
                          GestureDetector(
                            onTap: () => controller.selectDate(context, controller.medicalFitnessController),
                            child: AbsorbPointer(
                              child: CustomTextField(
                                hintText: 'YYYY-MM-DD',
                                prefixSvg: 'assets/icons/calendar.svg',
                                useGradientIcon: true,
                                controller: controller.medicalFitnessController,
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Aadhaar KYC Verified Switch
                          Obx(
                            () => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.inputBg,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.inputBorder),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Row(
                                    children: [
                                      Icon(Icons.verified_user_outlined, color: Color(0xFF10B981), size: 20),
                                      SizedBox(width: 10),
                                      Text(
                                        'Aadhaar KYC Verified',
                                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                  Switch(
                                    value: controller.aadhaarVerified.value,
                                    activeThumbColor: const Color(0xFF10B981),
                                    onChanged: (val) => controller.aadhaarVerified.value = val,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 4: Operations & Shift Assignment
                      _buildSectionCard(
                        icon: Icons.schedule_rounded,
                        iconColor: const Color(0xFFFBBF24),
                        title: 'operations_shift_assignment'.tr,
                        subtitle: 'operations_shift_desc'.tr,
                        children: [
                          // Home Depot Dropdown
                          _buildLabel('home_depot_req'.tr),
                          _buildDepotDropdown(),
                          const SizedBox(height: 14),

                          // Assigned Bus Dropdown
                          _buildLabel('designated_bus_opt'.tr),
                          _buildVehicleDropdown(),
                          const SizedBox(height: 16),

                          // Active Shift Presets
                          _buildLabel('active_shift_roster_preset'.tr),
                          _buildShiftPresetsSelector(context),
                          const SizedBox(height: 16),

                          // Driving Experience & Joining Date
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('driving_experience'.tr),
                                    CustomTextField(
                                      hintText: '5 Years',
                                      prefixSvg: 'assets/icons/shield.svg',
                                      controller: controller.experienceYearsController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('joining_date'.tr),
                                    GestureDetector(
                                      onTap: () => controller.selectDate(context, controller.joiningDateController),
                                      child: AbsorbPointer(
                                        child: CustomTextField(
                                          hintText: 'YYYY-MM-DD',
                                          prefixSvg: 'assets/icons/calendar.svg',
                                          controller: controller.joiningDateController,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 5: Emergency Contact Details
                      _buildSectionCard(
                        icon: Icons.emergency_outlined,
                        iconColor: const Color(0xFFEF4444),
                        title: 'emergency_contact_person'.tr,
                        subtitle: 'emergency_contact_desc'.tr,
                        children: [
                          _buildLabel('contact_person_name_req'.tr),
                          CustomTextField(
                            hintText: 'emergency_person_hint'.tr,
                            prefixSvg: 'assets/icons/profile.svg',
                            prefixHeight: 18,
                            prefixWidth: 18,
                            controller: controller.emergencyContactNameController,
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('relationship'.tr),
                                    Obx(
                                      () => CustomTextField(
                                        hintText: 'select_relation'.tr,
                                        prefixSvg: 'assets/icons/profile.svg',
                                        prefixHeight: 18,
                                        prefixWidth: 18,
                                        isDropdown: true,
                                        dropdownValue: controller.selectedEmergencyRelation.value,
                                        dropdownItems: controller.emergencyRelations,
                                        onDropdownChanged: (val) {
                                          if (val != null) controller.selectedEmergencyRelation.value = val;
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('emergency_phone_req'.tr),
                                    CustomTextField(
                                      hintText: '9826099887',
                                      prefixAsset: 'assets/icons/phone.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      keyboardType: TextInputType.phone,
                                      controller: controller.emergencyContactPhoneController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 6: Compliance KYC Documents
                      _buildSectionCard(
                        icon: Icons.folder_shared_outlined,
                        iconColor: const Color(0xFF10B981),
                        title: 'compliance_kyc_documents'.tr,
                        subtitle: 'compliance_kyc_desc'.tr,
                        children: [
                          _buildDocumentsSection(context),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 7: Notes & Status
                      _buildSectionCard(
                        icon: Icons.notes_rounded,
                        iconColor: const Color(0xFF64748B),
                        title: 'status_operational_notes'.tr,
                        subtitle: 'status_notes_desc'.tr,
                        children: [
                          _buildLabel('duty_status'.tr),
                          Obx(
                            () => CustomTextField(
                              hintText: 'select_duty_status'.tr,
                              prefixSvg: 'assets/icons/shield.svg',
                              isDropdown: true,
                              dropdownValue: controller.status.value,
                              dropdownItems: controller.statuses,
                              onDropdownChanged: (val) {
                                if (val != null) controller.status.value = val;
                              },
                            ),
                          ),
                          const SizedBox(height: 14),

                          _buildLabel('internal_notes_opt'.tr),
                          CustomTextField(
                            hintText: 'driver_notes_hint'.tr,
                            prefixSvg: 'assets/icons/note1.svg',
                            controller: controller.notesController,
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Action Buttons
                      Obx(
                        () => CustomButton(
                          text: controller.isSubmitting.value
                              ? 'saving_driver_record'.tr
                              : (controller.isEditMode.value ? 'update_driver_profile'.tr : 'complete_driver_reg'.tr),
                          isLoading: controller.isSubmitting.value,
                          prefixIcon: const Icon(Icons.check_rounded, color: Colors.white, size: 20),
                          onTap: () {
                            if (!controller.isSubmitting.value) {
                              controller.saveDriver();
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      CustomButton(
                        text: 'cancel'.tr,
                        isOutlined: true,
                        onTap: () => Get.back(),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(
            () => Text(
              controller.isEditMode.value ? 'edit_driver_profile'.tr : 'onboard_new_driver'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.help_outline_rounded, color: Colors.white70, size: 22),
            onPressed: () {
              Get.snackbar(
                'Driver Compliance',
                'Enter valid Commercial DL, RTO authority, shift roster and emergency contact.',
                backgroundColor: const Color(0xFF1E293B),
                colorText: Colors.white,
                snackPosition: SnackPosition.BOTTOM,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderContextCard() {
    return Obx(() {
      final isEdit = controller.isEditMode.value;
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.badge_outlined, color: Color(0xFF10B981), size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isEdit ? 'modify_driver_profile'.tr : 'commercial_driver_onboarding'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isEdit
                        ? 'modify_driver_desc'.tr
                        : 'onboard_driver_desc'.tr,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildSectionCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required List<Widget> children,
  }) {
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
              Icon(icon, color: iconColor, size: 20),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 3),
          Text(subtitle, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
          const Divider(color: AppColors.cardBorder, height: 22),
          ...children,
        ],
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _buildDepotDropdown() {
    return Obx(() {
      final items = <DropdownMenuItem<String>>[];
      final seenIds = <String>{};

      for (final depot in controller.depotsList) {
        final idStr = depot.id.toString();
        if (!seenIds.contains(idStr)) {
          seenIds.add(idStr);
          items.add(
            DropdownMenuItem(
              value: idStr,
              child: Text(
                '${depot.name} (${depot.code.isNotEmpty ? depot.code : 'Depot #$idStr'})',
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          );
        }
      }

      // Safe fallback if selected ID isn't in items
      final currentVal = controller.selectedDepotId.value;
      if (currentVal != null && !seenIds.contains(currentVal)) {
        final label = controller.initialDepotName.value.isNotEmpty
            ? controller.initialDepotName.value
            : 'Depot #$currentVal';
        items.insert(
          0,
          DropdownMenuItem(
            value: currentVal,
            child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 13)),
          ),
        );
      }

      return Container(
        height: 52,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.inputBorder, width: 1.2),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: currentVal,
            hint: Text('select_home_depot_base'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
            isExpanded: true,
            dropdownColor: const Color(0xFF1E293B),
            icon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
            items: items,
            onChanged: (val) {
              if (val != null) controller.selectedDepotId.value = val;
            },
          ),
        ),
      );
    });
  }

  Widget _buildVehicleDropdown() {
    return Obx(() {
      final items = <DropdownMenuItem<String>>[
        DropdownMenuItem(
          value: '',
          child: Text('unassigned_floating_roster'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        ),
      ];
      final seenIds = <String>{''};

      for (final veh in controller.vehiclesList) {
        final idStr = veh.id.toString();
        if (!seenIds.contains(idStr)) {
          seenIds.add(idStr);
          items.add(
            DropdownMenuItem(
              value: idStr,
              child: Text(
                '${veh.registrationNumber} • ${veh.vehicleType}',
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          );
        }
      }

      final currentVal = controller.selectedVehicleId.value ?? '';
      if (currentVal.isNotEmpty && !seenIds.contains(currentVal)) {
        final label = controller.initialVehicleReg.value.isNotEmpty
            ? controller.initialVehicleReg.value
            : 'Bus #$currentVal';
        items.insert(
          1,
          DropdownMenuItem(
            value: currentVal,
            child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 13)),
          ),
        );
      }

      return Container(
        height: 52,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.inputBorder, width: 1.2),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: currentVal,
            hint: Text('select_designated_bus'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
            isExpanded: true,
            dropdownColor: const Color(0xFF1E293B),
            icon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
            items: items,
            onChanged: (val) {
              controller.selectedVehicleId.value = (val == null || val.isEmpty) ? null : val;
            },
          ),
        ),
      );
    });
  }

  Widget _buildShiftPresetsSelector(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: controller.shiftPresets.map((p) {
            return Obx(() {
              final isSelected = controller.selectedShiftPreset.value == p.label;
              return InkWell(
                onTap: () => controller.selectShiftPreset(p),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.15) : AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF10B981) : AppColors.inputBorder,
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(p.icon, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 6),
                      Text(
                        p.label,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            });
          }).toList(),
        ),
        const SizedBox(height: 12),

        // Display current timing summary or custom pickers
        Obx(() {
          if (controller.selectedShiftPreset.value == 'Custom Shift') {
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.selectTime(context, controller.shiftStartTime),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('start_time_caps'.tr, style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(controller.shiftStartTime.value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const Icon(Icons.arrow_forward_rounded, color: AppColors.textMuted, size: 16),
                  Expanded(
                    child: InkWell(
                      onTap: () => controller.selectTime(context, controller.shiftEndTime),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('end_time_caps'.tr, style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(controller.shiftEndTime.value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          } else {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time_filled_rounded, color: Color(0xFF10B981), size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'Active Shift: ${controller.activeShiftString}',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            );
          }
        }),
      ],
    );
  }

  Widget _buildAvatarUploadCard(BuildContext context) {
    return Obx(() {
      final avatar = controller.avatarUrl.value;
      final isUploading = controller.isUploadingAvatar.value;
      final name = controller.nameController.text.trim();

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.inputBorder, width: 1.2),
        ),
        child: Row(
          children: [
            // Circle Avatar Preview
            Stack(
              children: [
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    border: Border.all(
                      color: const Color(0xFF10B981).withValues(alpha: 0.5),
                      width: 2,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: isUploading
                      ? const Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        )
                      : _buildAvatarPreview(avatar, name),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: isUploading
                        ? null
                        : () => _showMediaSourceSheet(
                              context: context,
                              title: 'driver_photo_badge'.tr,
                              subtitle: 'select_identity_photo_desc'.tr,
                              onSourceSelected: controller.pickAndUploadAvatar,
                            ),
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.cardBg, width: 1.5),
                      ),
                      child: const Icon(Icons.camera_alt_rounded, size: 13, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),

            // Text details & Action Buttons
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'driver_photo_badge'.tr,
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Identity badge photo for roster & mobile app account',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                  const SizedBox(height: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      InkWell(
                        onTap: isUploading
                            ? null
                            : () => _showMediaSourceSheet(
                                  context: context,
                                  title: 'driver_photo_badge'.tr,
                                  subtitle: 'select_identity_photo_desc'.tr,
                                  onSourceSelected: controller.pickAndUploadAvatar,
                                ),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                avatar.isNotEmpty ? Icons.cached_rounded : Icons.add_a_photo_outlined,
                                size: 13,
                                color: const Color(0xFF10B981),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                avatar.isNotEmpty ? 'Change Photo' : 'Choose Photo',
                                style: const TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (avatar.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        InkWell(
                          onTap: isUploading ? null : controller.removeAvatar,
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.delete_outline_rounded, size: 13, color: Color(0xFFEF4444)),
                                SizedBox(width: 4),
                                Text(
                                  'Remove',
                                  style: TextStyle(
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
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildAvatarPlaceholder(String name) {
    final initials = name.trim().isNotEmpty
        ? name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'DR';
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          color: Color(0xFF10B981),
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildAvatarPreview(String url, String name) {
    if (url.isEmpty) {
      return _buildAvatarPlaceholder(name);
    }
    if (!url.startsWith('http') && !url.startsWith('/uploads')) {
      final file = File(url);
      if (file.existsSync()) {
        return Image.file(file, fit: BoxFit.cover);
      }
    }
    final fullUrl = ApiConstants.resolveFileUrl(url);
    if (fullUrl.startsWith('http')) {
      return Image.network(
        fullUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildAvatarPlaceholder(name),
      );
    }
    return _buildAvatarPlaceholder(name);
  }

  Widget _buildDocumentsSection(BuildContext context) {
    return Obx(() {
      final docs = controller.documents;
      final isUploading = controller.isUploadingDoc.value;
      final selectedCategory = controller.selectedDocCategory.value;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category selector label
          _buildLabel('Select Document Category *'),

          // Dropdown Container
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.inputBorder, width: 1.2),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.kycDocCategories.contains(selectedCategory)
                    ? selectedCategory
                    : controller.kycDocCategories.first,
                isExpanded: true,
                dropdownColor: const Color(0xFF1E293B),
                icon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
                items: controller.kycDocCategories.map((cat) {
                  final isAlreadyUploaded = docs.any((d) => d.category == cat || d.purpose == cat);
                  return DropdownMenuItem<String>(
                    value: cat,
                    child: Row(
                      children: [
                        Icon(
                          isAlreadyUploaded ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                          size: 16,
                          color: isAlreadyUploaded ? const Color(0xFF10B981) : Colors.white38,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            cat + (isAlreadyUploaded ? ' (Uploaded)' : ''),
                            style: TextStyle(
                              color: isAlreadyUploaded ? const Color(0xFF10B981) : Colors.white,
                              fontSize: 13,
                              fontWeight: isAlreadyUploaded ? FontWeight.bold : FontWeight.normal,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    controller.selectedDocCategory.value = val;
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Upload Action Button (Camera or Gallery)
          InkWell(
            onTap: isUploading
                ? null
                : () => _showMediaSourceSheet(
                      context: context,
                      title: 'Upload $selectedCategory',
                      subtitle: 'Choose camera capture or gallery photo for KYC document:',
                      onSourceSelected: controller.pickAndUploadKycDocument,
                    ),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981), width: 1.2),
              ),
              child: isUploading
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)),
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Uploading KYC Document...',
                          style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_a_photo_outlined, color: Color(0xFF10B981), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Take Photo / Upload Picture',
                          style: const TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 16),

          // Attached documents count / header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ATTACHED KYC DOCUMENTS',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: docs.isNotEmpty ? const Color(0xFF10B981).withValues(alpha: 0.15) : AppColors.inputBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: docs.isNotEmpty ? const Color(0xFF10B981).withValues(alpha: 0.4) : AppColors.inputBorder,
                  ),
                ),
                child: Text(
                  '${docs.length} Uploaded',
                  style: TextStyle(
                    color: docs.isNotEmpty ? const Color(0xFF10B981) : AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Documents List
          if (docs.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.inputBg.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.inputBorder, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Icon(Icons.folder_open_rounded, size: 32, color: Colors.white.withValues(alpha: 0.3)),
                  const SizedBox(height: 8),
                  Text(
                    'No compliance documents attached yet.',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Select a document category from the dropdown above and click "Take Photo / Upload Picture"',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: docs.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final d = docs[index];
                return Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: Row(
                    children: [
                      // Document preview thumbnail
                      _buildDocThumbnail(d),
                      const SizedBox(width: 12),

                      // Document info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              d.category.isNotEmpty ? d.category : d.name,
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'KYC Document',
                                    style: TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    d.name,
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Remove button
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                        tooltip: 'Remove Document',
                        onPressed: () => controller.removeDocument(index),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      );
    });
  }

  Widget _buildDocThumbnail(FleetDocumentModel doc) {
    final localPath = doc.localPath;
    final path = (localPath != null && localPath.isNotEmpty) ? localPath : doc.url;
    final isImg = path.toLowerCase().endsWith('.png') ||
        path.toLowerCase().endsWith('.jpg') ||
        path.toLowerCase().endsWith('.jpeg') ||
        path.toLowerCase().endsWith('.webp');

    if (isImg) {
      if (localPath != null && localPath.isNotEmpty && File(localPath).existsSync()) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.file(
            File(localPath),
            width: 44,
            height: 44,
            fit: BoxFit.cover,
          ),
        );
      }
      final resolved = ApiConstants.resolveFileUrl(doc.url);
      if (resolved.startsWith('http')) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            resolved,
            width: 44,
            height: 44,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => _buildDocIconFallback(doc.category),
          ),
        );
      }
    }
    return _buildDocIconFallback(doc.category);
  }

  Widget _buildDocIconFallback(String category) {
    IconData icon = Icons.description_outlined;
    Color color = const Color(0xFF10B981);
    final catLower = category.toLowerCase();
    if (catLower.contains('license')) {
      icon = Icons.badge_outlined;
      color = const Color(0xFF38BDF8);
    } else if (catLower.contains('aadhaar') || catLower.contains('identity')) {
      icon = Icons.verified_user_outlined;
      color = const Color(0xFFA855F7);
    } else if (catLower.contains('medical')) {
      icon = Icons.medical_services_outlined;
      color = const Color(0xFFEF4444);
    }
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Icon(icon, color: color, size: 22),
    );
  }

  void _showMediaSourceSheet({
    required BuildContext context,
    required String title,
    required String subtitle,
    required ValueChanged<ImageSource> onSourceSelected,
  }) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF161926),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF60A5FA).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.camera_alt_rounded, color: Color(0xFF60A5FA), size: 20),
              ),
              title: Text('capture_with_camera'.tr, style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: Text('take_photo_camera_desc'.tr, style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              tileColor: AppColors.cardBg,
              onTap: () {
                Get.back();
                onSourceSelected(ImageSource.camera);
              },
            ),
            const SizedBox(height: 10),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF34D399).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF34D399), size: 20),
              ),
              title: Text('choose_from_gallery'.tr, style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: Text('pick_saved_doc_gallery'.tr, style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              tileColor: AppColors.cardBg,
              onTap: () {
                Get.back();
                onSourceSelected(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}
