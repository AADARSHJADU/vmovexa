import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/assign_gps_controller.dart';
import '../../add_gps/controllers/add_gps_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class AssignGpsView extends GetView<AssignGpsController> {
  const AssignGpsView({super.key});

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
                    'Assign GPS Device',
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Context card
                    _buildVehicleDriverContextCard(),
                    const SizedBox(height: 24),

                    // Search & Filter Row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 52,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: AppColors.inputBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.inputBorder, width: 1.2),
                            ),
                            child: TextField(
                              controller: controller.searchController,
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              decoration: const InputDecoration(
                                icon: Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                                hintText: 'Search GPS Device ID, IMEI...',
                                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          height: 52,
                          width: 52,
                          decoration: BoxDecoration(
                            color: AppColors.cardBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.cardBorder, width: 1.2),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.filter_list_rounded, color: Colors.white, size: 20),
                            onPressed: () {},
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Tabs
                    Obx(
                      () => Container(
                        decoration: const BoxDecoration(
                          border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
                        ),
                        child: Row(
                          children: [
                            _buildTabItem('Available (06)', controller.selectedTab.value == 'Available', () => controller.selectedTab.value = 'Available'),
                            const SizedBox(width: 24),
                            _buildTabItem('Assigned (12)', controller.selectedTab.value == 'Assigned', () => controller.selectedTab.value = 'Assigned'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Devices list
                    Obx(
                      () => ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: controller.filteredDevices.length,
                        itemBuilder: (context, index) {
                          final device = controller.filteredDevices[index];
                          final isSelected = controller.selectedGps.value?.id == device.id;
                          return _buildGpsCard(device, isSelected);
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // No GPS Devices Available prompt card
                    _buildNoGpsCard(),
                    const SizedBox(height: 32),

                    // Confirm Assignment Button
                    CustomButton(
                      text: 'Assign GPS Device',
                      onTap: controller.confirmAssignment,
                    ),
                    const SizedBox(height: 10),
                    Center(
                      child: Text(
                        'Only available GPS devices can be assigned to a vehicle.',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                      ),
                    ),
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

  Widget _buildVehicleDriverContextCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // GPS device icon left
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.location_on_outlined, color: Color(0xFF6366F1), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Vehicle No. MH12AB1234',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 4),
                        const Text('Active', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Driver: ${controller.driverName}',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Fleet: City Bus Fleet  •  Vehicle Type: Bus',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          border: isSelected
              ? const Border(bottom: BorderSide(color: Color(0xFF6366F1), width: 2.2))
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildGpsCard(GpsModel device, bool isSelected) {
    bool isLowBattery = device.battery.contains('65'); // Or lower for amber/red color
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
          width: 1.2,
        ),
      ),
      child: Row(
        children: [
          // Device graphic / image placeholder
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.settings_input_composite_outlined, color: Color(0xFF8B5CF6), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  device.id,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text('Model: ${device.model}  •  SIM: ${device.simNo.substring(0, 8)}...', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    // Battery indicator
                    Icon(Icons.battery_charging_full_rounded, color: isLowBattery ? Colors.amber : const Color(0xFF10B981), size: 14),
                    const SizedBox(width: 4),
                    Text('Battery: ${device.battery}', style: TextStyle(color: isLowBattery ? Colors.amber : const Color(0xFF10B981), fontSize: 11)),
                    const SizedBox(width: 12),
                    // Signal indicator
                    const Icon(Icons.signal_cellular_alt_rounded, color: Color(0xFF10B981), size: 14),
                    const SizedBox(width: 4),
                    Text('Signal: ${device.signal}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Assign / Selected Button
          OutlinedButton(
            onPressed: () => controller.selectGps(device),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: isSelected ? const Color(0xFF10B981) : const Color(0xFF6366F1)),
              backgroundColor: isSelected ? const Color(0xFF10B981).withOpacity(0.08) : Colors.transparent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text(
              isSelected ? 'Selected' : 'Assign',
              style: TextStyle(
                color: isSelected ? const Color(0xFF10B981) : Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoGpsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.04),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.satellite_alt_outlined, color: AppColors.textMuted, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'No GPS Devices Available?',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Add a new GPS device to enable tracking.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Add GPS outline action
          OutlinedButton(
            onPressed: controller.goToAddGps,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.cardBorder),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('+ Add GPS', style: TextStyle(color: Colors.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
