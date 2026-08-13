import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/assign_driver_controller.dart';
import '../../add_driver/controllers/add_driver_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class AssignDriverView extends GetView<AssignDriverController> {
  const AssignDriverView({super.key});

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
                    'Assign Driver',
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
                    // Vehicle Info context card
                    _buildVehicleContextCard(),
                    const SizedBox(height: 24),

                    const Text(
                      'Select Driver',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Choose an available driver to assign to this vehicle.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 16),

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
                                hintText: 'Search by name, employee ID...',
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
                            _buildTabItem('Available (08)', controller.selectedTab.value == 'Available', () => controller.selectedTab.value = 'Available'),
                            const SizedBox(width: 24),
                            _buildTabItem('Assigned (12)', controller.selectedTab.value == 'Assigned', () => controller.selectedTab.value = 'Assigned'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Drivers List
                    Obx(
                      () => ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: controller.filteredDrivers.length,
                        itemBuilder: (context, index) {
                          final driver = controller.filteredDrivers[index];
                          final isSelected = controller.selectedDriver.value?.empId == driver.empId;
                          return _buildDriverCard(driver, isSelected);
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // No Available Drivers prompt card
                    _buildNoDriversCard(),
                    const SizedBox(height: 32),

                    // Confirm Assignment Button
                    CustomButton(
                      text: 'Assign Driver',
                      onTap: controller.confirmAssignment,
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

  Widget _buildVehicleContextCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Vehicle Icon Container
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.2), width: 1.2),
            ),
            child: const Icon(
              Icons.directions_bus_rounded,
              color: Color(0xFF8B5CF6),
              size: 26,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Vehicle MH12AB1234',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Text('Type: Bus  •  Fleet: City Bus Fleet', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    const SizedBox(width: 10),
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

  Widget _buildDriverCard(DriverModel driver, bool isSelected) {
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
          // Driver Initial avatar
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(
              color: Color(0xFF8B5CF6),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                driver.name.substring(0, 1),
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  driver.name,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text('EMP ID: ${driver.empId}  •  DL: ${driver.dlNo}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text('Expiry: ${driver.dlExpiry}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    const SizedBox(width: 10),
                    Container(
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    Text(driver.status, style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Assign / Selected Button
          OutlinedButton(
            onPressed: () => controller.selectDriver(driver),
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

  Widget _buildNoDriversCard() {
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
            child: const Icon(Icons.person_add_alt_1_outlined, color: AppColors.textMuted, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'No Available Drivers?',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Add a new driver to assign this vehicle.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Add Driver outline action
          OutlinedButton(
            onPressed: controller.goToAddDriver,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.cardBorder),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('+ Add Driver', style: TextStyle(color: Colors.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
