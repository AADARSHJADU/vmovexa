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
                  const Text(
                    'Setup Complete',
                    style: TextStyle(
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
                    const Text(
                      'Vehicle Successfully Configured',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'All steps have been completed.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
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
                      text: 'View Vehicle Details',
                      onTap: controller.viewVehicleDetails,
                    ),
                    const SizedBox(height: 14),
                    CustomButton(
                      text: 'Back to Fleet',
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
    return Container(
      height: 180,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background glowing circles representation
          Positioned(
            left: 20,
            top: 20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF3B82F6).withOpacity(0.04),
              ),
            ),
          ),
          Positioned(
            right: 40,
            bottom: 10,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF8B5CF6).withOpacity(0.04),
              ),
            ),
          ),

          // Glowing Hexagonal shield on top center
          Positioned(
            top: 15,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.2), width: 1),
              ),
              child: const Icon(
                Icons.shield_outlined,
                color: Color(0xFF3B82F6),
                size: 22,
              ),
            ),
          ),

          // Bus Graphic image & GPS Device setup layout
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // Bus vector representation
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 24),
                  Container(
                    width: 130,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.4)),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.directions_bus_rounded,
                        color: Color(0xFF3B82F6),
                        size: 38,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text('VMOVEXA Bus', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),

              // GPS Box block representation
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 24),
                  Container(
                    width: 70,
                    height: 80,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.cardBorder, width: 1.5),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Center(
                          child: Text(
                            'VMOVEXA',
                            style: TextStyle(color: Color(0xFF3B82F6), fontSize: 8, fontWeight: FontWeight.bold),
                          ),
                        ),
                        _buildLedTestRow('GPS', true),
                        _buildLedTestRow('GSM', true),
                        _buildLedTestRow('PWR', true),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLedTestRow(String label, bool isOn) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 7)),
        Container(
          width: 5,
          height: 5,
          decoration: BoxDecoration(
            color: isOn ? const Color(0xFF10B981) : Colors.red,
            shape: BoxShape.circle,
            boxShadow: isOn
                ? [
                    const BoxShadow(
                      color: Color(0xFF10B981),
                      blurRadius: 4,
                      spreadRadius: 1,
                    )
                  ]
                : null,
          ),
        ),
      ],
    );
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
          _buildDetailRow('Fleet', controller.fleetName, Icons.apartment_outlined),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('Vehicle', controller.vehicleName, Icons.directions_bus_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('Driver', controller.driverName, Icons.person_outline_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('GPS Device', controller.gpsName, Icons.wifi_tethering_rounded),
          const Divider(color: AppColors.cardBorder, height: 1),
          _buildDetailRow('Status', 'Active', Icons.shield_outlined, isStatus: true),
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
                const Text(
                  'Active',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
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
          _buildTimelineItem('Fleet Created', '${controller.fleetName} has been created successfully.', true),
          _buildTimelineItem('Vehicle Added', 'Vehicle ${controller.vehicleName} has been added.', true),
          _buildTimelineItem('Driver Assigned', '${controller.driverName} has been assigned to this vehicle.', true),
          _buildTimelineItem('GPS Device Connected', 'GPS device ${controller.gpsName} has been connected.', false),
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
                color: const Color(0xFF10B981).withOpacity(0.08),
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
