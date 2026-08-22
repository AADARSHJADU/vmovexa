import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../controllers/fleet_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class FleetDetailsView extends GetView<FleetDetailsController> {
  const FleetDetailsView({super.key});

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
                    'Fleet Details',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 24),
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
                    // Main Info Card
                    _buildMainInfoCard(),
                    const SizedBox(height: 24),

                    // Quick Actions
                    const Text(
                      'Quick Actions',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Quick Actions Horizontal Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildQuickActionItem(
                          'Add Vehicle',
                          'assets/icons/car.svg',
                          controller.goToAddVehicle,
                        ),
                        _buildQuickActionItem(
                          'Add Driver',
                          'assets/icons/profile.svg',
                          controller.goToAddDriver,
                        ),
                        _buildQuickActionItem(
                          'Assign GPS',
                          'assets/icons/hotspot.svg',
                          controller.goToAssignGps,
                        ),
                        _buildQuickActionItem(
                          'View Reports',
                          'assets/icons/neon_bars.svg',
                              () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Inner Frame Empty State Panel
                    _buildEmptyStateCard(context),
                    const SizedBox(height: 28),

                    // Back to Fleet List link
                    Center(
                      child: GestureDetector(
                        onTap: controller.backToFleetList,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Icon(Icons.arrow_back, color: AppColors.textLink, size: 16),
                            SizedBox(width: 6),
                            Text(
                              'Back to Fleet List',
                              style: TextStyle(
                                color: AppColors.textLink,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
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

  // =====================================================
  // Reusable icon loader.
  // Automatically picks SvgPicture.asset() for .svg paths
  // and Image.asset() for everything else (.png, .jpg, etc).
  // Just change the path string wherever you call this -
  // no need to touch the calling widget's code.
  // =====================================================
  Widget _buildIcon(
      String imagePath, {
        double width = 24,
        double height = 24,
        Color? color,
        BoxFit fit = BoxFit.contain,
      }) {
    final isSvg = imagePath.toLowerCase().endsWith('.svg');

    if (isSvg) {
      return SvgPicture.asset(
        imagePath,
        width: width,
        height: height,
        fit: fit,
        colorFilter: color != null
            ? ColorFilter.mode(color, BlendMode.srcIn)
            : null,
      );
    } else {
      return Image.asset(
        imagePath,
        width: width,
        height: height,
        fit: fit,
        color: color,
      );
    }
  }

  Widget _buildMainInfoCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Bus Logo Container
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.2), width: 1.2),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: _buildIcon(
                    'assets/icons/bus.svg',
                    width: 32,
                    height: 32,
                    color: const Color(0xFF8B5CF6),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      controller.fleet.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Active',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Fleet ID: ${controller.fleet.id}',
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Details Grid (Organization, Date, Description)
          Row(
            children: [
              Expanded(
                child: _buildDetailsItem(
                  'Organization',
                  'VMOVEXA Transport',
                  'assets/icons/building.svg',
                ),
              ),
              Expanded(
                child: _buildDetailsItem(
                  'Created Date',
                  '21 May 2024, 08:35 AM',
                  'assets/icons/note.svg',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildDetailsItem(
            'Description',
            'City bus operations for all downtown routes and services.',
            // Example: switched to PNG here just to show it works with
            // the same _buildIcon() helper without any extra code.
            'assets/icons/calendar.png',
          ),
          const SizedBox(height: 20),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 16),

          // Stat counters Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: _buildStatItem(
                  '0',
                  'Vehicles',
                  'assets/icons/car.svg',
                ),
              ),
              Container(
                width: 1,
                height: 36,
                color: AppColors.cardBorder,
              ),
              Expanded(
                child: _buildStatItem(
                  '0',
                  'Drivers',
                  'assets/icons/profile.svg',
                ),
              ),
              Container(
                width: 1,
                height: 36,
                color: AppColors.cardBorder,
              ),
              Expanded(
                child: _buildStatItem(
                  '0',
                  'GPS Devices',
                  'assets/icons/hotspot.svg',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsItem(
      String title,
      String value,
      String imagePath,
      ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildIcon(
          imagePath,
          width: 24,
          height: 24,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(
      String value,
      String title,
      String svgPath,
      ) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              svgPath,
              width: 16,
              height: 16,
            ),
            const SizedBox(width: 6),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionItem(
      String title,
      String svgPath,
      VoidCallback onTap,
      ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.cardBg,
                  //gradient: AppColors.primaryGradient,
                ),
                child: Center(
                  child: SvgPicture.asset(
                    svgPath,
                    width: 22,
                    height: 22,
                  ),
                ),
              ),

              Positioned(
                right: -4,
                bottom: -4,
                child: Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppColors.primaryGradient,
                    border: Border.all(
                      color: AppColors.cardBg,
                      width: 2,
                    ),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.add,
                      color: Colors.white,
                      size: 10,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyStateCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Bus Icon Illustration
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Image.asset(
                'assets/images/fleet_bus_add.png',
              ),
              Positioned(
                right: 50,
                bottom: 8,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppColors.primaryGradient,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.add,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'No Vehicles Added Yet',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Start by adding your first vehicle\nto this fleet.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Add Vehicle',
            onTap: controller.goToAddVehicle,
            width: 160,
            height: 44,
          ),
        ],
      ),
    );
  }
}

