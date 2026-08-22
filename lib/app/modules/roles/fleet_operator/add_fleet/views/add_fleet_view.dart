import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/add_fleet_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class AddFleetView extends GetView<AddFleetController> {
  const AddFleetView({super.key});

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
                    'Add Fleet',
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
                      // Section Header with Logo Upload
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Fleet Information',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 6),
                                Text(
                                  'Enter the basic details of your fleet.',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Upload Logo optional button
                          _buildLogoUploadBox(),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Fleet Name *
                      _buildLabel('Fleet Name *'),
                      CustomTextField(
                        hintText: 'Enter fleet name',
                        //prefixIcon: Icons.home_work_outlined,
                        prefixSvg: 'assets/icons/building1.svg',
                        controller: controller.nameController,
                      ),
                      const SizedBox(height: 18),

                      // Description (Optional)
                      _buildLabel('Description (Optional)'),
                      CustomTextField(
                        hintText: 'Enter a short description',
                        //prefixIcon: Icons.description_outlined,
                        prefixSvg: 'assets/icons/note1.svg',
                        controller: controller.descController,
                      ),
                      const SizedBox(height: 18),

                      // Organization / Company * (Dropdown)
                      _buildLabel('Organization / Company *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select organization',
                          prefixSvg: 'assets/icons/building1.svg',
                          isDropdown: true,
                          dropdownValue: controller.selectedOrg.value,
                          dropdownItems: controller.organizations,
                          onDropdownChanged: (val) => controller.selectedOrg.value = val!,
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Fleet Type * (Dropdown)
                      _buildLabel('Fleet Type *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select fleet type',
                          prefixSvg: 'assets/icons/bus.svg',
                          isDropdown: true,
                          dropdownValue: controller.selectedType.value,
                          dropdownItems: controller.fleetTypes,
                          onDropdownChanged: (val) => controller.selectedType.value = val!,
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section 2: Contact Information
                      const Text(
                        'Contact Information',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Add primary contact details for this fleet.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Contact Person & Phone Number Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Contact Person'),
                                CustomTextField(
                                  hintText: 'Enter contact person',
                                  prefixSvg: 'assets/icons/profile.svg',
                                  prefixWidth: 16,
                                  prefixHeight: 16,
                                  controller: controller.contactPersonController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Phone Number'),
                                CustomTextField(
                                  hintText: 'Enter phone number',
                                  //prefixIcon: Icons.phone_outlined,
                                  prefixAsset: 'assets/icons/phone.png',
                                  prefixWidth: 24,
                                  prefixHeight: 24,
                                  keyboardType: TextInputType.phone,
                                  controller: controller.phoneController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Email Address
                      _buildLabel('Email Address'),
                      CustomTextField(
                        hintText: 'Enter email address',
                        //prefixIcon: Icons.mail_outline_rounded,
                        prefixSvg: 'assets/icons/gmail.svg',
                        prefixWidth: 16,
                        prefixHeight: 16,
                        keyboardType: TextInputType.emailAddress,
                        controller: controller.emailController,
                      ),
                      const SizedBox(height: 28),

                      // Section 3: Operational Information
                      const Text(
                        'Operational Information',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Add operational details to help manage your fleet better.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Home Base & Time Zone Row
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Home Base / Location'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select location',
                                    prefixSvg: 'assets/icons/location.svg',
                                    isDropdown: true,
                                    dropdownValue: controller.selectedLocation.value,
                                    dropdownItems: controller.locations,
                                    onDropdownChanged: (val) => controller.selectedLocation.value = val!,
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
                                _buildLabel('Time Zone'),
                                Obx(
                                  () => CustomTextField(
                                    hintText: 'Select time zone',
                                    //prefixIcon: Icons.public_rounded,
                                    prefixSvg: 'assets/icons/clock.svg',
                                    isDropdown: true,
                                    dropdownValue: controller.selectedTimeZone.value,
                                    dropdownItems: controller.timeZones,
                                    onDropdownChanged: (val) => controller.selectedTimeZone.value = val!,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Default Working Hours
                      _buildLabel('Default Working Hours (Optional)'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select working hours',
                          prefixAsset: 'assets/icons/calendar.png',
                          prefixWidth: 24,
                          prefixHeight: 24,
                          isDropdown: true,
                          dropdownValue: controller.selectedHours.value,
                          dropdownItems: controller.workingHours,
                          onDropdownChanged: (val) => controller.selectedHours.value = val!,
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section 4: Status selection
                      const Text(
                        'Status',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Set the initial status of this fleet.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Radio status buttons
                      Obx(
                        () => Row(
                          children: [
                            Expanded(child: _buildStatusRadioCard('Active', 'Fleet is operational', controller.status.value == 'Active')),
                            const SizedBox(width: 14),
                            Expanded(child: _buildStatusRadioCard('Inactive', 'Fleet is not operational', controller.status.value == 'Inactive')),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Create Fleet Action Button
                      CustomButton(
                        text: 'Create Fleet',
                        onTap: controller.createFleet,
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

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }


  Widget _buildLogoUploadBox() {
    return Container(
      width: 90,
      height: 90,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            //Icon(Icons.add_photo_alternate_outlined, color: Color(0xFF8B5CF6), size: 24),
            Image.asset(
                'assets/icons/gallery_img.png',
              height: 54,
              width: 54,
            ),
            Text(
              'Upload Logo\n(Optional)',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textMuted,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRadioCard(String title, String subtitle, bool isSelected) {
    return GestureDetector(
      onTap: () => controller.setStatus(title),
      child: Container(
        padding: const EdgeInsets.all(16),
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
              width: 18,
              height: 18,
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
                        width: 10,
                        height: 10,
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
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11,
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
