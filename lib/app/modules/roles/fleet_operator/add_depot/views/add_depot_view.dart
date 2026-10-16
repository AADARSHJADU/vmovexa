import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../controllers/add_depot_controller.dart';

class AddDepotView extends GetView<AddDepotController> {
  const AddDepotView({super.key});

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

                      // Section 1: Facility Identification & Classification
                      _buildSectionCard(
                        icon: Icons.warehouse_rounded,
                        iconColor: const Color(0xFF10B981),
                        title: 'Facility Identification & Type',
                        subtitle: 'Official depot name, identifier code, and primary operating classification.',
                        children: [
                          _buildLabel('Facility Name *'),
                          CustomTextField(
                            hintText: 'e.g. North Depot - Vijay Nagar',
                            prefixSvg: 'assets/icons/building.svg',
                            controller: controller.nameController,
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Depot Code'),
                                    CustomTextField(
                                      hintText: 'DEP-VN-01',
                                      prefixAsset: 'assets/icons/fleet_operator_icons/id.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      controller: controller.codeController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Operating Status'),
                                    Obx(
                                      () => CustomTextField(
                                        hintText: 'Select status',
                                        prefixSvg: 'assets/icons/shield.svg',
                                        isDropdown: true,
                                        dropdownValue: controller.selectedStatus.value,
                                        dropdownItems: controller.statuses,
                                        onDropdownChanged: (val) {
                                          if (val != null) controller.selectedStatus.value = val;
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Depot Type Dropdown
                          _buildLabel('Facility Classification *'),
                          Obx(
                            () => Container(
                              height: 52,
                              padding: const EdgeInsets.symmetric(horizontal: 14),
                              decoration: BoxDecoration(
                                color: AppColors.inputBg,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.inputBorder, width: 1.2),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: controller.selectedDepotType.value,
                                  isExpanded: true,
                                  dropdownColor: const Color(0xFF1E293B),
                                  icon: const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
                                  items: controller.depotTypes.map((item) {
                                    return DropdownMenuItem<String>(
                                      value: item['value'],
                                      child: Text(
                                        item['label'] ?? '',
                                        style: const TextStyle(color: Colors.white, fontSize: 13),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) controller.selectedDepotType.value = val;
                                  },
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 2: Capacity & Bay Infrastructure
                      _buildSectionCard(
                        icon: Icons.local_parking_rounded,
                        iconColor: const Color(0xFF38BDF8),
                        title: 'Capacity & Bay Infrastructure',
                        subtitle: 'Bus parking bays, EV fast chargers, and maintenance pit slots.',
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Total Parking Bays *'),
                                    CustomTextField(
                                      hintText: '35',
                                      prefixSvg: 'assets/icons/bus.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.capacityController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('EV Fast Chargers'),
                                    CustomTextField(
                                      hintText: '6',
                                      prefixSvg: 'assets/icons/droplet.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.evChargersController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Maintenance Pits / Bays'),
                                    CustomTextField(
                                      hintText: '2',
                                      prefixSvg: 'assets/icons/license.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.maintenanceBaysController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Automated Wash Bays'),
                                    CustomTextField(
                                      hintText: '1',
                                      prefixSvg: 'assets/icons/calendar.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.washingBaysController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 3: Energy & Supported Amenities
                      _buildSectionCard(
                        icon: Icons.electric_bolt_rounded,
                        iconColor: const Color(0xFFFBBF24),
                        title: 'Energy & On-Site Amenities',
                        subtitle: 'Supported vehicle power types and terminal yard amenities.',
                        children: [
                          _buildLabel('Supported Fuel & Energy Types'),
                          Obx(
                            () => Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: controller.availableFuelTypes.map((fuel) {
                                final isSelected = controller.selectedFuelTypes.contains(fuel);
                                return FilterChip(
                                  label: Text(fuel),
                                  selected: isSelected,
                                  onSelected: (_) => controller.toggleFuelType(fuel),
                                  backgroundColor: AppColors.inputBg,
                                  selectedColor: const Color(0xFF38BDF8).withValues(alpha: 0.2),
                                  side: BorderSide(
                                    color: isSelected ? const Color(0xFF38BDF8) : AppColors.inputBorder,
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : AppColors.textMuted,
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                  avatar: isSelected
                                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFF38BDF8), size: 16)
                                      : null,
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 16),

                          _buildLabel('On-Site Yard Amenities'),
                          Obx(
                            () => Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: controller.availableAmenities.map((amenity) {
                                final isSelected = controller.selectedAmenities.contains(amenity);
                                return FilterChip(
                                  label: Text(amenity),
                                  selected: isSelected,
                                  onSelected: (_) => controller.toggleAmenity(amenity),
                                  backgroundColor: AppColors.inputBg,
                                  selectedColor: const Color(0xFF10B981).withValues(alpha: 0.2),
                                  side: BorderSide(
                                    color: isSelected ? const Color(0xFF10B981) : AppColors.inputBorder,
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : AppColors.textMuted,
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  ),
                                  avatar: isSelected
                                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 16)
                                      : null,
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 4: Location & Geospatial
                      _buildSectionCard(
                        icon: Icons.location_on_outlined,
                        iconColor: const Color(0xFFA855F7),
                        title: 'Geospatial Location & Geofence',
                        subtitle: 'Physical address, GPS coordinates, and arrival boundary radius.',
                        children: [
                          _buildLabel('Full Street Address *'),
                          CustomTextField(
                            hintText: 'e.g. Scheme 54, Near Vijay Nagar Square',
                            prefixSvg: 'assets/icons/location.svg',
                            controller: controller.addressController,
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('City / District'),
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
                                    _buildLabel('State'),
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

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Postal PIN Code (6 Digits)'),
                                    CustomTextField(
                                      hintText: '452010',
                                      prefixSvg: 'assets/icons/location.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.pincodeController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Geofence Radius (Meters)'),
                                    CustomTextField(
                                      hintText: '300',
                                      prefixSvg: 'assets/icons/shield.svg',
                                      keyboardType: TextInputType.number,
                                      controller: controller.geofenceRadiusController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // GPS Coordinates
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Latitude'),
                                    CustomTextField(
                                      hintText: '22.7533',
                                      prefixSvg: 'assets/icons/location.svg',
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      controller: controller.latitudeController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Longitude'),
                                    CustomTextField(
                                      hintText: '75.8937',
                                      prefixSvg: 'assets/icons/location.svg',
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      controller: controller.longitudeController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Section 5: Personnel & Helplines
                      _buildSectionCard(
                        icon: Icons.contact_phone_outlined,
                        iconColor: const Color(0xFFEC4899),
                        title: 'Personnel & Operating Helplines',
                        subtitle: 'Primary in-charge person and 24x7 control desk helpline numbers.',
                        children: [
                          _buildLabel('Facility In-Charge / Supervisor'),
                          CustomTextField(
                            hintText: 'e.g. Ramesh Patel',
                            prefixSvg: 'assets/icons/profile.svg',
                            prefixHeight: 18,
                            prefixWidth: 18,
                            controller: controller.contactPersonController,
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Helpline Phone (10 Digits)'),
                                    CustomTextField(
                                      hintText: '9827011223',
                                      prefixAsset: 'assets/icons/phone.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      keyboardType: TextInputType.phone,
                                      controller: controller.contactPhoneController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Emergency Desk Phone'),
                                    CustomTextField(
                                      hintText: '9827099887',
                                      prefixAsset: 'assets/icons/phone.png',
                                      prefixWidth: 20,
                                      prefixHeight: 20,
                                      useGradientIcon: true,
                                      keyboardType: TextInputType.phone,
                                      controller: controller.emergencyPhoneController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Facility Email'),
                                    CustomTextField(
                                      hintText: 'depot.north@transit.in',
                                      prefixSvg: 'assets/icons/gmail.svg',
                                      prefixWidth: 16,
                                      prefixHeight: 16,
                                      keyboardType: TextInputType.emailAddress,
                                      controller: controller.emailController,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('Operating Hours'),
                                    CustomTextField(
                                      hintText: '24x7',
                                      prefixSvg: 'assets/icons/calendar.svg',
                                      controller: controller.operatingHoursController,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Action Buttons
                      Obx(
                        () => CustomButton(
                          text: controller.isSubmitting.value
                              ? 'Saving Depot Facility...'
                              : (controller.isEditMode.value
                                  ? 'Update Depot Facility'
                                  : 'Register Depot Facility'),
                          isLoading: controller.isSubmitting.value,
                          prefixIcon: const Icon(Icons.check_rounded, color: Colors.white, size: 20),
                          onTap: () {
                            if (!controller.isSubmitting.value) {
                              controller.saveDepot();
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      CustomButton(
                        text: 'Cancel',
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
        border: Border(bottom: BorderSide(
            color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(
            () => Text(
              controller.isEditMode.value ? 'Edit Depot Facility' : 'Add New Depot Facility',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 40),
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
              child: const Icon(Icons.warehouse_rounded, color: Color(0xFF10B981), size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isEdit ? 'Depot Facility Modification' : 'Transit Depot Facility Registration',
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isEdit
                        ? 'Update facility bays, energy chargers, and operating contact numbers.'
                        : 'Register an operating terminal base, vehicle parking capacity, and EV fast chargers.',
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
}
