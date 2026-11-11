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
                        title: 'facility_id_type'.tr,
                        subtitle: 'facility_id_type_desc'.tr,
                        children: [
                          _buildLabel('facility_name_req'.tr),
                          CustomTextField(
                            hintText: 'facility_name_hint'.tr,
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
                                    _buildLabel('depot_code'.tr),
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
                                    _buildLabel('operating_status'.tr),
                                    Obx(
                                      () => CustomTextField(
                                        hintText: 'select_status'.tr,
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
                          _buildLabel('facility_classification_req'.tr),
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
                                        _getDepotTypeLabel(item['value'] ?? ''),
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
                        title: 'capacity_bay_infra'.tr,
                        subtitle: 'capacity_bay_infra_desc'.tr,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('total_parking_bays_req'.tr),
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
                                    _buildLabel('ev_fast_chargers'.tr),
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
                                    _buildLabel('maintenance_pits_bays'.tr),
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
                                    _buildLabel('automated_wash_bays'.tr),
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
                        title: 'energy_onsite_amenities'.tr,
                        subtitle: 'energy_onsite_amenities_desc'.tr,
                        children: [
                          _buildLabel('supported_fuel_energy'.tr),
                          Obx(
                            () => Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: controller.availableFuelTypes.map((fuel) {
                                final isSelected = controller.selectedFuelTypes.contains(fuel);
                                return FilterChip(
                                  label: Text(_getFuelTypeLabel(fuel)),
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

                          _buildLabel('onsite_yard_amenities'.tr),
                          Obx(
                            () => Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: controller.availableAmenities.map((amenity) {
                                final isSelected = controller.selectedAmenities.contains(amenity);
                                return FilterChip(
                                  label: Text(_getAmenityLabel(amenity)),
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
                        title: 'geospatial_loc_geofence'.tr,
                        subtitle: 'geospatial_loc_geofence_desc'.tr,
                        children: [
                          _buildLabel('full_street_address_req'.tr),
                          CustomTextField(
                            hintText: 'street_address_hint'.tr,
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

                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildLabel('postal_pin_code_req'.tr),
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
                                    _buildLabel('geofence_radius_meters'.tr),
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
                                    _buildLabel('latitude_label'.tr),
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
                                    _buildLabel('longitude_label'.tr),
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
                        title: 'personnel_operating_helplines'.tr,
                        subtitle: 'personnel_helplines_desc'.tr,
                        children: [
                          _buildLabel('facility_incharge_supervisor'.tr),
                          CustomTextField(
                            hintText: 'incharge_supervisor_hint'.tr,
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
                                    _buildLabel('helpline_phone_digits'.tr),
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
                                    _buildLabel('emergency_desk_phone'.tr),
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
                                    _buildLabel('facility_email'.tr),
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
                                    _buildLabel('operating_hours'.tr),
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
                              ? 'saving_depot_facility'.tr
                              : (controller.isEditMode.value
                                  ? 'update_depot_facility'.tr
                                  : 'register_depot_facility'.tr),
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
        border: Border(bottom: BorderSide(
            color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(
            () => Text(
              controller.isEditMode.value ? 'edit_depot_title'.tr : 'add_depot_title'.tr,
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
                    isEdit ? 'depot_mod_title'.tr : 'depot_reg_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isEdit
                        ? 'depot_mod_desc'.tr
                        : 'depot_reg_desc'.tr,
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

  String _getDepotTypeLabel(String value) {
    switch (value) {
      case 'main_terminal':
        return 'main_operating_terminal'.tr;
      case 'sub_depot':
        return 'sub_depot_outstation'.tr;
      case 'maintenance_yard':
        return 'heavy_maintenance_yard'.tr;
      case 'parking_lot':
        return 'night_stabling_lot'.tr;
      default:
        return value;
    }
  }

  String _getFuelTypeLabel(String fuel) {
    switch (fuel) {
      case 'EV Charging (DC Fast)':
        return 'ev_charging_dc_fast'.tr;
      case 'Diesel':
        return 'diesel_label'.tr;
      case 'CNG (Compressed Natural Gas)':
        return 'cng_compressed_natural_gas'.tr;
      case 'Hydrogen / LNG':
        return 'hydrogen_lng'.tr;
      default:
        return fuel;
    }
  }

  String _getAmenityLabel(String amenity) {
    switch (amenity) {
      case 'Driver Rest Lounge':
        return 'driver_rest_lounge'.tr;
      case '24/7 CCTV & Security Gate':
        return 'cctv_security_gate'.tr;
      case 'Canteen / Cafeteria':
        return 'canteen_cafeteria'.tr;
      case 'Spare Parts & Tool Store':
        return 'spare_parts_store'.tr;
      case 'First Aid / Medical Desk':
        return 'first_aid_medical_desk'.tr;
      case 'Automated Washing Station':
        return 'automated_washing_station'.tr;
      case 'Solar PV Rooftop Generation':
        return 'solar_pv_rooftop'.tr;
      default:
        return amenity;
    }
  }
}
