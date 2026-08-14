import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/add_vehicle_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class AddVehicleView extends GetView<AddVehicleController> {
  const AddVehicleView({super.key});

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
                    'Add Vehicle',
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
                      // Section 1: Fleet Information
                      _buildSectionHeader('1. Fleet Information'),
                      const SizedBox(height: 12),

                      _buildLabel('Fleet *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select Fleet',
                          isDropdown: true,
                          dropdownValue: controller.selectedFleet.value,
                          dropdownItems: controller.fleets,
                          onDropdownChanged: (val) => controller.selectedFleet.value = val!,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Registration Number & Chassis Number
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Registration Number *'),
                                CustomTextField(
                                  hintText: 'Enter registration number',
                                  controller: controller.regNoController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Chassis Number *'),
                                CustomTextField(
                                  hintText: 'Enter chassis number',
                                  controller: controller.chassisNoController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Model Number & Vehicle Capacity
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Model Number *'),
                                CustomTextField(
                                  hintText: 'Enter model number',
                                  controller: controller.modelNoController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Vehicle Capacity (Seats) *'),
                                CustomTextField(
                                  hintText: 'Enter capacity',
                                  keyboardType: TextInputType.number,
                                  controller: controller.capacityController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      _buildLabel('Vehicle Type *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select type',
                          isDropdown: true,
                          dropdownValue: controller.selectedVehicleType.value,
                          dropdownItems: controller.vehicleTypes,
                          onDropdownChanged: (val) => controller.selectedVehicleType.value = val!,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Quick select pills
                      SizedBox(
                        height: 40,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: controller.capacityPills.length,
                          itemBuilder: (context, index) {
                            final pill = controller.capacityPills[index];
                            return Obx(
                              () {
                                bool isSelected = controller.selectedCapacityPill.value == pill;
                                return GestureDetector(
                                  onTap: () => controller.selectedCapacityPill.value = pill,
                                  child: Container(
                                    margin: const EdgeInsets.only(right: 10),
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    decoration: BoxDecoration(
                                      color: isSelected ? const Color(0xFF6366F1).withOpacity(0.12) : AppColors.cardBg,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: isSelected ? const Color(0xFF6366F1) : AppColors.cardBorder,
                                        width: 1.2,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        pill,
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : AppColors.textSecondary,
                                          fontSize: 12,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section 2: Route Information
                      _buildSectionHeader('2. Route Information'),
                      const SizedBox(height: 12),

                      _buildLabel('Assigned Route *'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select route',
                          isDropdown: true,
                          dropdownValue: controller.selectedRoute.value,
                          dropdownItems: controller.routes,
                          onDropdownChanged: (val) => controller.selectedRoute.value = val!,
                        ),
                      ),
                      const SizedBox(height: 14),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Source *'),
                                CustomTextField(
                                  hintText: 'Enter source',
                                  controller: controller.sourceController,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Destination *'),
                                CustomTextField(
                                  hintText: 'Enter destination',
                                  controller: controller.destController,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Section 3: Vehicle Documents
                      _buildSectionHeader('3. Vehicle Documents'),
                      const SizedBox(height: 14),

                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 14,
                        crossAxisSpacing: 14,
                        childAspectRatio: 1.45,
                        children: [
                          _buildDocUploadCard('RC', 'Upload RC'),
                          _buildDocUploadCard('Fitness Certificate', 'Upload Certificate'),
                          _buildDocUploadCard('Transport License', 'Upload License'),
                          _buildDocUploadCard('Insurance', 'Upload Insurance'),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Section 4: Display Screen Configuration
                      _buildSectionHeader('4. Display Screen Configuration'),
                      const SizedBox(height: 6),
                      const Text(
                        'Configure the number of advertising display screens on the vehicle.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Custom schematic drawing of a bus side layout
                      Container(
                        height: 150,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder, width: 1.2),
                        ),
                        child: Image.asset('assets/images/bus-image1.png'),
                        /*CustomPaint(
                          painter: BusLayoutPainter(),
                        ),*/
                      ),
                      const SizedBox(height: 20),

                      // Screen configuration counters
                      Obx(
                        () => Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Display Screens',
                                  style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '${controller.totalDisplays} Displays Installed',
                                  style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(child: _buildCounterItem('Left Side Display', controller.leftDisplay.value, controller.incrementLeft, controller.decrementLeft)),
                                const SizedBox(width: 14),
                                Expanded(child: _buildCounterItem('Right Side Display', controller.rightDisplay.value, controller.incrementRight, controller.decrementRight)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(child: _buildCounterItem('Rear Display', controller.rearDisplay.value, controller.incrementRear, controller.decrementRear)),
                                const SizedBox(width: 14),
                                Expanded(child: _buildCounterItem('Emergency Exit Display', controller.emergencyDisplay.value, controller.incrementEmergency, controller.decrementEmergency)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section 5: GPS Assignment
                      _buildSectionHeader('5. GPS Assignment'),
                      const SizedBox(height: 12),

                      _buildLabel('GPS Device'),
                      Obx(
                        () => CustomTextField(
                          hintText: 'Select device',
                          isDropdown: true,
                          dropdownValue: controller.selectedGps.value,
                          dropdownItems: controller.gpsDevices,
                          onDropdownChanged: (val) => controller.selectedGps.value = val!,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // QR Scan or existing selection buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.cardBorder),
                                backgroundColor: AppColors.cardBg,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              icon: const Icon(Icons.qr_code_scanner_rounded, color: Color(0xFF8B5CF6), size: 20),
                              label: const Text('Scan QR Code', style: TextStyle(color: Colors.white, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.cardBorder),
                                backgroundColor: AppColors.cardBg,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                              icon: const Icon(Icons.tap_and_play_rounded, color: Color(0xFF8B5CF6), size: 20),
                              label: const Text('Select Existing', style: TextStyle(color: Colors.white, fontSize: 12)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      // Section 6: Vehicle Status
                      _buildSectionHeader('6. Vehicle Status'),
                      const SizedBox(height: 16),

                      Obx(
                        () => Row(
                          children: [
                            Expanded(child: _buildStatusRadioCard('Active', 'Vehicle is active and operational', controller.status.value == 'Active')),
                            const SizedBox(width: 14),
                            Expanded(child: _buildStatusRadioCard('Inactive', 'Vehicle is not operational', controller.status.value == 'Inactive')),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Bottom actions: Cancel & Confirm
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              text: 'Cancel',
                              isOutlined: true,
                              onTap: () => Get.back(),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: CustomButton(
                              text: 'Add Vehicle',
                              onTap: controller.addVehicle,
                            ),
                          ),
                        ],
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

  Widget _buildDocUploadCard(String title, String placeholder) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_upload_outlined, color: Color(0xFF6366F1), size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'PDF, JPG or PNG',
            style: TextStyle(color: AppColors.textMuted, fontSize: 9),
          ),
        ],
      ),
    );
  }

  Widget _buildCounterItem(String title, int count, VoidCallback onInc, VoidCallback onDec) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Row(
            children: [
              GestureDetector(
                onTap: onDec,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.remove, color: Colors.white, size: 14),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '$count',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: onInc,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.add, color: Colors.white, size: 14),
                ),
              ),
            ],
          ),
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

// Custom Painter to draw a clean bus side silhouette with display screens highlighted
class BusLayoutPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.inputBg
      ..style = PaintingStyle.fill;

    // Draw bus body base shape
    final busRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(size.width / 2, size.height / 2 - 10), width: size.width * 0.75, height: 55),
      const Radius.circular(10),
    );
    canvas.drawRRect(busRect, paint);

    // Draw wheels
    final wheelPaint = Paint()
      ..color = Colors.black
      ..style = PaintingStyle.fill;
    
    final wheelStroke = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawCircle(Offset(size.width / 2 - 80, size.height / 2 + 18), 12, wheelPaint);
    canvas.drawCircle(Offset(size.width / 2 - 80, size.height / 2 + 18), 12, wheelStroke);

    canvas.drawCircle(Offset(size.width / 2 + 65, size.height / 2 + 18), 12, wheelPaint);
    canvas.drawCircle(Offset(size.width / 2 + 65, size.height / 2 + 18), 12, wheelStroke);
    
    canvas.drawCircle(Offset(size.width / 2 + 90, size.height / 2 + 18), 12, wheelPaint);
    canvas.drawCircle(Offset(size.width / 2 + 90, size.height / 2 + 18), 12, wheelStroke);

    // Draw active neon display screens indicators
    final screenPaint = Paint()
      ..color = const Color(0xFFEC4899).withOpacity(0.08)
      ..style = PaintingStyle.fill;
    
    final screenBorder = Paint()
      ..color = const Color(0xFFEC4899)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    // Left display window
    final leftRect = Rect.fromLTWH(size.width / 2 - 100, size.height / 2 - 30, 48, 24);
    canvas.drawRect(leftRect, screenPaint);
    canvas.drawRect(leftRect, screenBorder);

    // Right display window
    final rightRect = Rect.fromLTWH(size.width / 2 - 40, size.height / 2 - 30, 95, 24);
    final rightBorder = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    canvas.drawRect(rightRect, screenPaint);
    canvas.drawRect(rightRect, rightBorder);

    // Rear display window
    final rearRect = Rect.fromLTWH(size.width / 2 + 65, size.height / 2 - 30, 25, 24);
    canvas.drawRect(rearRect, screenPaint);
    canvas.drawRect(rearRect, screenBorder);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
