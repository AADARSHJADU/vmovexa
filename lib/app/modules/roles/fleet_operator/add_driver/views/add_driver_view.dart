import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/add_driver_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const CustomBackButton(),
                  const Text(
                    'Add Driver',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.info_outline_rounded, color: Colors.white, size: 24),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Form(
                  key: controller.formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header context card (Assigning to Vehicle info)
                      _buildHeaderContextCard(),
                      const SizedBox(height: 24),

                      // Section 1: Personal Information
                      _buildSectionHeader('Personal Information'),
                      const SizedBox(height: 6),
                      const Text(
                        'Enter the basic details of the driver.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 20),

                      // Name & Emp ID Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Full Name *'),
                                CustomTextField(
                                  hintText: 'Enter full name',
                                  prefixIcon: Icons.person_outline_rounded,
                                  controller: controller.nameController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Employee ID *'),
                                CustomTextField(
                                  hintText: 'Enter employee ID',
                                  prefixIcon: Icons.badge_outlined,
                                  controller: controller.empIdController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Phone Number
                      _buildLabel('Phone Number *'),
                      CustomTextField(
                        hintText: 'Enter phone number',
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        controller: controller.phoneController,
                      ),
                      const SizedBox(height: 18),

                      // Email Address (Optional)
                      _buildLabel('Email Address (Optional)'),
                      CustomTextField(
                        hintText: 'Enter email address',
                        prefixIcon: Icons.mail_outline_rounded,
                        keyboardType: TextInputType.emailAddress,
                        controller: controller.emailController,
                      ),
                      const SizedBox(height: 18),

                      // DOB & Gender Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Date of Birth'),
                                GestureDetector(
                                  onTap: () => controller.selectDate(context, controller.dobController),
                                  child: AbsorbPointer(
                                    child: CustomTextField(
                                      hintText: 'Select date of birth',
                                      prefixIcon: Icons.calendar_today_outlined,
                                      controller: controller.dobController,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Gender'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select gender',
                                    isDropdown: true,
                                    dropdownValue: controller.selectedGender.value,
                                    dropdownItems: controller.genders,
                                    onDropdownChanged: (val) => controller.selectedGender.value = val!,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Address (Optional)
                      _buildLabel('Address (Optional)'),
                      CustomTextField(
                        hintText: 'Enter complete address',
                        prefixIcon: Icons.location_on_outlined,
                        controller: controller.addressController,
                      ),
                      const SizedBox(height: 28),

                      // Section 2: License Information
                      _buildSectionHeader('License Information'),
                      const SizedBox(height: 6),
                      const Text(
                        'Enter the driver\'s license details.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 20),

                      // License Number & License Type Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('License Number *'),
                                CustomTextField(
                                  hintText: 'Enter license number',
                                  prefixIcon: Icons.drive_eta_outlined,
                                  controller: controller.licenseNoController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('License Type *'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select type',
                                    isDropdown: true,
                                    dropdownValue: controller.selectedLicenseType.value,
                                    dropdownItems: controller.licenseTypes,
                                    onDropdownChanged: (val) => controller.selectedLicenseType.value = val!,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Issue Date & Expiry Date Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Issue Date'),
                                GestureDetector(
                                  onTap: () => controller.selectDate(context, controller.issueDateController),
                                  child: AbsorbPointer(
                                    child: CustomTextField(
                                      hintText: 'Select issue date',
                                      prefixIcon: Icons.calendar_today_outlined,
                                      controller: controller.issueDateController,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Expiry Date *'),
                                GestureDetector(
                                  onTap: () => controller.selectDate(context, controller.expiryDateController),
                                  child: AbsorbPointer(
                                    child: CustomTextField(
                                      hintText: 'Select expiry date',
                                      prefixIcon: Icons.calendar_today_outlined,
                                      controller: controller.expiryDateController,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Issuing Authority
                      _buildLabel('Issuing Authority'),
                      CustomTextField(
                        hintText: 'Enter issuing authority',
                        prefixIcon: Icons.gavel_outlined,
                        controller: controller.authorityController,
                      ),
                      const SizedBox(height: 28),

                      // Section 3: Additional Information
                      _buildSectionHeader('Additional Information (Optional)'),
                      const SizedBox(height: 6),
                      const Text(
                        'Other details to help manage the driver.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 20),

                      // Blood Group & Emergency Contact Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Blood Group'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select blood group',
                                    isDropdown: true,
                                    dropdownValue: controller.selectedBloodGroup.value,
                                    dropdownItems: controller.bloodGroups,
                                    onDropdownChanged: (val) => controller.selectedBloodGroup.value = val!,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Emergency Contact'),
                                CustomTextField(
                                  hintText: 'Enter emergency number',
                                  prefixIcon: Icons.phone_android_outlined,
                                  keyboardType: TextInputType.phone,
                                  controller: controller.emergencyContactController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Notes
                      _buildLabel('Notes'),
                      CustomTextField(
                        hintText: 'Enter any additional notes',
                        prefixIcon: Icons.note_alt_outlined,
                        controller: controller.notesController,
                      ),
                      const SizedBox(height: 28),

                      // Section 4: Status
                      _buildSectionHeader('Status'),
                      const SizedBox(height: 6),
                      const Text(
                        'Set the initial status of this driver.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 16),

                      // Radio status buttons
                      Obx(
                        () => Row(
                          children: [
                            Expanded(child: _buildStatusRadioCard('Active', 'Driver is available for assignments', controller.status.value == 'Active')),
                            const SizedBox(width: 14),
                            Expanded(child: _buildStatusRadioCard('Inactive', 'Driver is not available', controller.status.value == 'Inactive')),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Create Driver / Cancel Action Buttons
                      CustomButton(
                        text: 'Add Driver',
                        onTap: controller.addDriver,
                      ),
                      const SizedBox(height: 14),
                      CustomButton(
                        text: 'Cancel',
                        isOutlined: true,
                        onTap: () => Get.back(),
                      ),
                      const SizedBox(height: 20),
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

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildHeaderContextCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Icon Left
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_outline_rounded, color: Color(0xFF8B5CF6), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Assigning to Vehicle',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                SizedBox(height: 4),
                Text(
                  'MH12AB1234',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  'Fleet: City Bus Fleet  •  Type: Bus',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
          const Icon(Icons.directions_bus_rounded, color: Color(0xFF8B5CF6), size: 22),
        ],
      ),
    );
  }

  Widget _buildStatusRadioCard(String title, String subtitle, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setStatus(title),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF10B981) : AppColors.indicatorInactive,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
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
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
