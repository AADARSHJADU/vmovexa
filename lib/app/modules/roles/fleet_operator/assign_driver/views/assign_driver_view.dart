import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
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
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: CustomBackButton(),
                  ),
                  Text(
                    'assign_driver'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),


            Expanded(
              child: SingleChildScrollView(
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vehicle Info context card
                    _buildVehicleContextCard(),
                    const SizedBox(height: 24),

                    Text(
                      'select_driver'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'choose_available_driver_msg'.tr,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
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
                              decoration: InputDecoration(
                                icon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                                hintText: 'search_driver_hint'.tr,
                                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
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

                    // Tabs (Reactive counts & active state)
                    Obx(
                      () => Container(
                        decoration: const BoxDecoration(
                          border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
                        ),
                        child: Row(
                          children: [
                            _buildTabItem(
                              '${'available_tab'.tr} (${controller.availableCount.toString().padLeft(2, '0')})',
                              controller.selectedTab.value == 'Available',
                              () => controller.switchTab('Available'),
                            ),
                            const SizedBox(width: 20),
                            _buildTabItem(
                              '${'assigned_tab'.tr} (${controller.assignedCount.toString().padLeft(2, '0')})',
                              controller.selectedTab.value == 'Assigned',
                              () => controller.switchTab('Assigned'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Drivers List with synchronous reactive map
                    Obx(() {
                      if (controller.isLoading.value) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                          ),
                        );
                      }

                      // Explicitly access selectedDriver.value so this Obx always rebuilds when selection changes
                      final _ = controller.selectedDriver.value;

                      if (controller.filteredDrivers.isEmpty) {
                        return Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppColors.cardBg,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.cardBorder, width: 1.2),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.person_off_outlined, color: AppColors.textMuted, size: 36),
                              const SizedBox(height: 10),
                              Text(
                                'No ${controller.selectedTab.value.toLowerCase()} drivers found${controller.searchPattern.value.isNotEmpty ? ' matching "${controller.searchPattern.value}"' : ''}.',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        );
                      }

                      return Column(
                        children: controller.filteredDrivers.map((driver) {
                          return _buildDriverCard(driver);
                        }).toList(),
                      );
                    }),
                    const SizedBox(height: 16),

                    // No Available Drivers prompt card / Add Driver Helper
                    _buildNoDriversCard(),
                    const SizedBox(height: 28),

                    // Confirm Assignment Button
                    Obx(
                      () => CustomButton(
                        text: controller.isSubmitting.value ? 'assigning'.tr : 'assign_driver'.tr,
                        isLoading: controller.isSubmitting.value,
                        prefixIcon: controller.isSubmitting.value
                            ? null
                            : const Icon(Icons.assignment_ind_outlined, color: Colors.white, size: 18),
                        onTap: () {
                          if (!controller.isSubmitting.value) {
                            controller.confirmAssignment();
                          }
                        },
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

  Widget _buildVehicleContextCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Vehicle Icon Container
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.2), width: 1.2),
                ),
                child: Center(
                  child: ShaderMask(
                    blendMode: BlendMode.srcIn,
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [
                        Color(0xFF3B82F6),
                        Color(0xFF8B5CF6),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ).createShader(bounds),
                    child: Padding(
                      padding: const EdgeInsets.all(6.0),
                      child: SvgPicture.asset('assets/icons/bus11.svg'),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  'Vehicle ${controller.vehicleName}',
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildVehicleInfoDetail('type'.tr, controller.vehicleType, _buildGradientIcon(Icons.directions_bus_outlined, size: 18)),
              _buildDivider(),
              _buildVehicleInfoDetail('fleet'.tr, controller.fleetName, _buildGradientIcon(Icons.business_rounded, size: 18)),
              _buildDivider(),
              _buildVehicleStatusDetail('status'.tr, 'active'.tr),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(String label, bool isSelected, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? Colors.transparent : AppColors.cardBorder,
              width: 1.0,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDriverCard(DriverModel driver) {
    return Obx(() {
      final isSelected = controller.isDriverSelected(driver);
      return Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
            width: isSelected ? 1.8 : 1.2,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => controller.selectDriver(driver),
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Driver circular image avatar with status dot
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.15),
                        backgroundImage: (driver.avatarUrl != null && driver.avatarUrl!.isNotEmpty)
                            ? NetworkImage(driver.avatarUrl!)
                            : null,
                        child: (driver.avatarUrl == null || driver.avatarUrl!.isEmpty)
                            ? Text(
                                driver.name.isNotEmpty ? driver.name.substring(0, 1).toUpperCase() : 'D',
                                style: const TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold, fontSize: 16),
                              )
                            : null,
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: driver.isAvailable ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.background, width: 1.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  // Driver details structured in two columns to prevent overflow
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Col 1: Driver name and IDs
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                driver.name,
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  _buildGradientIcon(Icons.badge_outlined, size: 12),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      driver.empId,
                                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  _buildGradientIcon(Icons.credit_card_outlined, size: 12),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      driver.dlNo,
                                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Col 2: License Expiry & Status
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'license_expiry'.tr,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  _buildGradientIcon(Icons.calendar_today_outlined, size: 10),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      driver.dlExpiry,
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'status'.tr,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                              ),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: driver.isAvailable ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      driver.status,
                                      style: TextStyle(
                                        color: driver.isAvailable ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Assign / Selected Button
                  OutlinedButton(
                    onPressed: () => controller.selectDriver(driver),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: isSelected ? const Color(0xFF10B981) : const Color(0xFF8B5CF6)),
                      backgroundColor: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.15) : Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isSelected) ...[
                          const Icon(Icons.check, color: Color(0xFF10B981), size: 13),
                          const SizedBox(width: 4),
                        ],
                        Text(
                          isSelected ? 'selected'.tr : 'assign'.tr,
                          style: TextStyle(
                            color: isSelected ? const Color(0xFF10B981) : Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    });
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
          Image.asset(
            'assets/icons/fleet_operator_icons/add_driver_illustration.png',
            width: 74,
            height: 74,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'no_available_drivers_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  'add_driver_assign_msg'.tr,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    OutlinedButton(
                      onPressed: controller.goToAddDriver,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF8B5CF6)),
                        backgroundColor: const Color(0xFF8B5CF6).withValues(alpha: 0.05),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      child: Text('+ ${'add_driver'.tr}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 16),
                    TextButton(
                      onPressed: controller.skipForNow,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'skip_for_now'.tr,
                        style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGradientIcon(IconData icon, {double size = 12}) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) => const LinearGradient(
        colors: [
          Color(0xFF3B82F6),
          Color(0xFF8B5CF6),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(bounds),
      child: Icon(
        icon,
        size: size,
        color: Colors.white,
      ),
    );
  }

  Widget _buildVehicleInfoDetail(String label, String value, Widget icon) {
    return Expanded(
      child: Row(
        children: [
          icon,
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleStatusDetail(String label, String status) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
              Text(
                status,
                style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 24,
      width: 1.2,
      margin: const EdgeInsets.symmetric(horizontal: 12),
      color: AppColors.cardBorder,
    );
  }
}
