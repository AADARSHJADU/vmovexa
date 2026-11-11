import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/setup_complete_controller.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class SetupCompleteView extends GetView<SetupCompleteController> {
  const SetupCompleteView({super.key});

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
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white, size: 26),
                    onPressed: controller.backToFleet,
                  ),
                  Text(
                    'setup_complete_title'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 48), // Balancing spacing
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 12),
                    // Illustration Layout card
                    _buildIllustrationCard(),
                    const SizedBox(height: 24),

                    // Headings
                    Text(
                      'vehicle_successfully_configured'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'all_steps_completed_sub'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Setup parameters details list
                    _buildParameterDetailsList(),
                    const SizedBox(height: 28),

                    // Steps Checklist timeline
                    _buildTimelineSteps(),
                    const SizedBox(height: 40),

                    // Bottom Action buttons
                    CustomButton(
                      text: 'view_vehicle_details_btn'.tr,
                      onTap: controller.viewVehicleDetails,
                    ),
                    const SizedBox(height: 14),
                    CustomButton(
                      text: 'back_to_fleet_btn'.tr,
                      isOutlined: true,
                      onTap: controller.backToFleet,
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIllustrationCard() {
    return Image.asset('assets/images/device_bus.png');
  }

  Widget _buildParameterDetailsList() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildDetailRow('fleet_label'.tr, controller.fleetName, Icons.apartment_outlined),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('vehicle_label'.tr, controller.vehicleName, Icons.directions_bus_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('driver'.tr, controller.driverName, Icons.person_outline_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('gps_device_label'.tr, controller.gpsName, Icons.wifi_tethering_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('status'.tr, 'active'.tr, Icons.shield_outlined, isStatus: true),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF6366F1), size: 20),
          const SizedBox(width: 14),
          Text(
            label,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const Spacer(),
          if (isStatus)
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                ),
                const SizedBox(width: 6),
                Text(
                  'active'.tr,
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ],
            )
          else
            Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
          const SizedBox(width: 10),
          const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
        ],
      ),
    );
  }

  Widget _buildTimelineSteps() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTimelineItem(
            'fleet_created_title'.tr,
            'fleet_created_sub'.trParams({'fleet': controller.fleetName}),
            true,
          ),
          _buildTimelineItem(
            'vehicle_added_title'.tr,
            'vehicle_added_sub'.trParams({'vehicle': controller.vehicleName}),
            true,
          ),
          _buildTimelineItem(
            'driver_assigned_title'.tr,
            'driver_assigned_sub'.trParams({'driver': controller.driverName}),
            true,
          ),
          _buildTimelineItem(
            'gps_connected_title'.tr,
            'gps_connected_sub'.trParams({'gps': controller.gpsName}),
            false,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String title, String subtitle, bool showLine) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            // Hexagon checkmark indicator representation
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.08),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF10B981), width: 1.5),
              ),
              child: const Center(
                child: Icon(Icons.check, color: Color(0xFF10B981), size: 14),
              ),
            ),
            if (showLine)
              Container(
                width: 1.5,
                height: 38,
                color: const Color(0xFF10B981),
              ),
          ],
        ),
        const SizedBox(width: 16),
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
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }
}
