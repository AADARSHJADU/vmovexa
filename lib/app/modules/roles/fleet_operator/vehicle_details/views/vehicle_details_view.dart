import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/vehicle_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class VehicleDetailsView extends GetView<VehicleDetailsController> {
  const VehicleDetailsView({super.key});

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
                    'Vehicle Details',
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
                    // Bus Photo Banner Header Card
                    _buildBusBannerCard(),
                    const SizedBox(height: 18),

                    // Stats summary grid
                    _buildStatsSummaryRow(),
                    const SizedBox(height: 20),

                    // Current Location Card with interactive map representation
                    _buildCurrentLocationCard(),
                    const SizedBox(height: 20),

                    // Vehicle Info details
                    _buildSectionHeader('Vehicle Information'),
                    const SizedBox(height: 10),
                    _buildVehicleInfoGrid(),
                    const SizedBox(height: 20),

                    // Driver info details
                    _buildSectionHeader('Driver Information'),
                    const SizedBox(height: 10),
                    _buildDriverInfoCard(),
                    const SizedBox(height: 20),

                    // GPS device details
                    _buildSectionHeader('GPS Device Information'),
                    const SizedBox(height: 10),
                    _buildGpsDeviceCard(),
                    const SizedBox(height: 24),

                    // Quick Actions
                    const Text('Quick Actions', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 5,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                      childAspectRatio: 0.85,
                      children: [
                        _buildQuickActionItem(
                          'Live Tracking',
                          const Color(0xFF3B82F6),
                          controller.startLiveTracking,
                          svgPath: 'assets/icons/live_map.svg',
                        ),

                        _buildQuickActionItem(
                          'Trip History',
                          const Color(0xFF10B981),
                              () {},
                          svgPath: 'assets/icons/live_location.svg',
                        ),

                        _buildQuickActionItem(
                          'Maintenance',
                          Colors.orangeAccent,
                              () {},
                          svgPath: 'assets/icons/maintainance.svg',
                        ),

                        _buildQuickActionItem(
                          'Documents',
                          const Color(0xFF8B5CF6),
                              () {},
                          svgPath: 'assets/icons/note.svg',
                        ),

                        _buildQuickActionItem(
                          'Edit Vehicle',
                          Colors.amber,
                          controller.editVehicle,
                          svgPath: 'assets/icons/edit.svg',
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),

                    // Bottom Action buttons
                    Row(
                      children: [
                        Expanded(
                          child: CustomButton(
                            text: 'Start Live Tracking',
                            onTap: controller.startLiveTracking,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: CustomButton(
                            text: 'Edit Vehicle',
                            isOutlined: true,
                            onTap: controller.editVehicle,
                          ),
                        ),
                      ],
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

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
        ),
        TextButton(
          onPressed: () {},
          child: const Text('View All >', style: TextStyle(color: AppColors.textLink, fontSize: 12)),
        ),
      ],
    );
  }

  Widget _buildBusBannerCard() {
    return Container(
      height: 150,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Stack(
        children: [
          // Full-bleed bus photo on the left half
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            width: 170,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/images/bus1.png',
                  fit: BoxFit.cover,
                ),
                Positioned(
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 40,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          AppColors.cardBg.withOpacity(0.0),
                          AppColors.cardBg,
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Specs detail parameters on right
          Positioned(
            right: 20,
            top: 18,
            bottom: 18,
            left: 190,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    const Text('Active', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w600)),
                  ],
                ),
                Text(
                  controller.vehicleName.value,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  controller.fleetName.value,
                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 12, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      'assets/icons/bus.svg',
                      width: 12,
                      height: 12,
                      colorFilter: const ColorFilter.mode(AppColors.textMuted, BlendMode.srcIn),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        controller.modelName.value,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // "Live" badge - top right corner
          Positioned(
            top: 14,
            right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.5), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.wifi_rounded, color: Color(0xFF60A5FA), size: 10),
                  SizedBox(width: 4),
                  Text(
                    'Live',
                    style: TextStyle(color: Color(0xFF60A5FA), fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSummaryRow() {
    return Row(
      children: [
        Expanded(child: _buildSummaryStatItem('Driver', 'Rajesh Kumar', svgPath: 'assets/icons/profile.svg')),
        const SizedBox(width: 8),
        Expanded(child: _buildSummaryStatItem('GPS Device', 'GPS-TRK-00123', svgPath: 'assets/icons/hotspot.svg')),
        const SizedBox(width: 8),
        Expanded(child: _buildSummaryStatItem('Current Speed', '42 km/h', svgPath: 'assets/icons/speed_m.svg')),
        const SizedBox(width: 8),
        Expanded(child: _buildSummaryStatItem('Last Updated', 'Just now', svgPath: 'assets/icons/calendar.svg')),
      ],
    );
  }

  Widget _buildSummaryStatItem(String label, String value, {IconData? icon, String? svgPath}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (svgPath != null)
            SvgPicture.asset(
              svgPath,
              width: 16,
              height: 16,
              //colorFilter: const ColorFilter.mode(Color(0xFF6366F1), BlendMode.srcIn),
            )
          else if (icon != null)
            Icon(icon, color: const Color(0xFF6366F1), size: 16),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _buildCurrentLocationCard() {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Left Location & Action Text panel
          Expanded(
            flex: 13,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      SvgPicture.asset(
                        'assets/icons/location.svg',
                        width: 16,
                        height: 16,
                        //colorFilter: const ColorFilter.mode(Color(0xFF6366F1), BlendMode.srcIn),
                      ),
                      const SizedBox(width: 6),
                      const Text('Current Location', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Text(
                    'MG Road, Indiranagar, Bengaluru, Karnataka 560038',
                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  GestureDetector(
                    onTap: controller.startLiveTracking,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Track Live',
                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),

                ],
              ),
            ),
          ),

          // Divider vertical line
          Container(width: 1.2, height: double.infinity, color: AppColors.cardBorder),

          // Right visual map layout
          Expanded(
            flex: 9,
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(topRight: Radius.circular(16), bottomRight: Radius.circular(16)),
                color: Color(0xFF0F172A),
              ),
              child: CustomPaint(
                painter: MiniMapPainter(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 3.2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        children: [
          _buildInfoParam('Vehicle Type', 'Electric Bus'),
          _buildInfoParam('Capacity', '40 Seater'),
          _buildInfoParam('Registration No.', 'MH12AB1234'),
          _buildInfoParam('Fuel Type', 'Electric'),
          _buildInfoParam('Chassis No.', 'VOLVO8400E1234567'),
          _buildInfoParam('Insurance Expiry', '18 Jan 2026'),
          _buildInfoParam('Model', 'Volvo 8400 Electric'),
          _buildInfoParam('Fitness Expiry', '30 Dec 2025'),
        ],
      ),
    );
  }

  Widget _buildInfoParam(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
      ],
    );
  }

  Widget _buildDriverInfoCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: SvgPicture.asset(
                  'assets/icons/profile.svg',
                  colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Rajesh Kumar', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('+91 98765 43210', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                SizedBox(height: 2),
                Text('KA01 2015 123456', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: controller.callDriver,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF6366F1)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.call_outlined, color: Colors.white, size: 14),
            label: const Text('Call', style: TextStyle(color: Colors.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildGpsDeviceCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGpsParam('Device ID', 'GPS-TRK-00123'),
              _buildGpsParam('Network Status', 'Jio 4G'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGpsParam('IMEI', '864728041234567'),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Battery', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 2),
                  Row(
                    children: const [
                      Icon(Icons.battery_charging_full_rounded, color: Color(0xFF10B981), size: 14),
                      SizedBox(width: 4),
                      Text('92%', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGpsParam('Signal Strength', 'Strong'),
              _buildGpsParam('Last Seen', 'Just now'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGpsParam(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildQuickActionItem(
      String title,
      Color color,
      VoidCallback onTap, {
        IconData? icon,
        String? svgPath,
      }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: AppColors.cardBorder,
            width: 1.2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (svgPath != null)
              SvgPicture.asset(
                svgPath,
                width: 16,
                height: 16,
              )
            else if (icon != null)
              Icon(
                icon,
                color: color,
                size: 16,
              ),

            const SizedBox(height: 6),

            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 8,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class MiniMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.35), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.65), linePaint);
    canvas.drawLine(Offset(size.width * 0.5, 0), Offset(size.width * 0.45, size.height), linePaint);

    final routePaint = Paint()
      ..color = const Color(0xFF8B5CF6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.1, size.height * 0.8)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.7, size.width * 0.5, size.height * 0.4)
      ..lineTo(size.width * 0.9, size.height * 0.2);

    canvas.drawPath(routePath, routePaint);

    // Points
    canvas.drawCircle(Offset(size.width * 0.1, size.height * 0.8), 4, Paint()..color = const Color(0xFF8B5CF6));
    canvas.drawCircle(Offset(size.width * 0.9, size.height * 0.2), 5, Paint()..color = Colors.redAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}