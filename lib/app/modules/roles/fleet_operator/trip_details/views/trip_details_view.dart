import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/trip_details_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class TripDetailsView extends GetView<TripDetailsController> {
  const TripDetailsView({super.key});

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
                    'Trip Details',
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
                    // Top Split Card (Info & Mini Map)
                    _buildTopSplitCard(),
                    const SizedBox(height: 24),

                    // Route Summary Section
                    _buildSectionHeader('Route Summary'),
                    const SizedBox(height: 14),
                    _buildRouteSummaryPanel(),
                    const SizedBox(height: 24),

                    // Live Statistics Section
                    _buildSectionHeader('Live Statistics'),
                    const SizedBox(height: 14),
                    _buildLiveStatsGrid(),
                    const SizedBox(height: 24),

                    // Columns: Timeline & Driver/Vehicle specs
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column: Timeline
                        Expanded(
                          flex: 11,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSubHeader('Trip Timeline'),
                              const SizedBox(height: 14),
                              _buildTimelinePanel(),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Right Column: Specs Card details
                        Expanded(
                          flex: 12,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildSubHeader('Driver Information'),
                              const SizedBox(height: 12),
                              _buildDriverInfoCard(),
                              const SizedBox(height: 20),
                              _buildSubHeader('Vehicle Information'),
                              const SizedBox(height: 12),
                              _buildVehicleInfoCard(),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Quick Actions Section
                    _buildSectionHeader('Quick Actions'),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(child: _buildQuickActionItem('Call Driver', Icons.call_outlined, const Color(0xFF10B981), controller.callDriver)),
                        const SizedBox(width: 10),
                        Expanded(child: _buildQuickActionItem('Navigate', Icons.navigation_outlined, const Color(0xFF3B82F6), controller.navigate)),
                        const SizedBox(width: 10),
                        Expanded(child: _buildQuickActionItem('Send Alert', Icons.warning_amber_rounded, Colors.orangeAccent, controller.sendAlert)),
                        const SizedBox(width: 10),
                        Expanded(child: _buildQuickActionItem('Download Report', Icons.download_rounded, const Color(0xFF8B5CF6), controller.downloadReport)),
                      ],
                    ),
                    const SizedBox(height: 40),

                    // Complete Trip button
                    CustomButton(
                      text: 'Complete Trip',
                      onTap: controller.completeTrip,
                      isGradient: true,
                    ),
                    const SizedBox(height: 14),
                    CustomButton(
                      text: 'View Trip History',
                      isOutlined: true,
                      onTap: () {},
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
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildSubHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 13,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildTopSplitCard() {
    return Container(
      height: 140,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Left Info Panel
          Expanded(
            flex: 13,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'Trip Active',
                      style: TextStyle(
                        color: Color(0xFF8B5CF6),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          'Trip ID: ${controller.tripId}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(
                        Icons.copy_rounded,
                        color: AppColors.textMuted,
                        size: 14,
                      ),
                    ],
                  ),

                  Row(
                    children: [
                      const Icon(
                        Icons.directions_bus_rounded,
                        color: Color(0xFF3B82F6),
                        size: 15,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          controller.vehicleName,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  Row(
                    children: [
                      const Icon(
                        Icons.person_outline_rounded,
                        color: Color(0xFF10B981),
                        size: 15,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          controller.driverName,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: controller.callDriver,
                        child: const Icon(
                          Icons.phone_rounded,
                          color: Color(0xFF10B981),
                          size: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Divider vertical line
          Container(width: 1.2, height: double.infinity, color: AppColors.cardBorder),

          // Right Mini Map View Layout representation
          Expanded(
            flex: 11,
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(topRight: Radius.circular(16), bottomRight: Radius.circular(16)),
                color: Color(0xFF0F172A), // Dark map area
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

  Widget _buildRouteSummaryPanel() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vertical path stepper
          Column(
            children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle)),
              Container(width: 1.5, height: 36, color: AppColors.cardBorder),
              const Icon(Icons.location_on_rounded, color: Colors.redAccent, size: 18),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Start', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                SizedBox(height: 2),
                Text('MG Road, Bengaluru', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                Text('08:10 AM', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                SizedBox(height: 16),
                Text('Destination', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                SizedBox(height: 2),
                Text('Kempegowda Bus Station', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                Text('09:25 AM', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Route statistics specs details
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRouteStatText('18.6 km', 'Total Distance'),
              const SizedBox(height: 12),
              _buildRouteStatText('6.2 km (33%)', 'Distance Covered'),
              const SizedBox(height: 12),
              _buildRouteStatText('12.4 km', 'Distance Remaining'),
              const SizedBox(height: 12),
              _buildRouteStatText('18 mins', 'ETA', color: const Color(0xFF3B82F6)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRouteStatText(String value, String label, {Color color = Colors.white}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
      ],
    );
  }

  Widget _buildLiveStatsGrid() {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.25,
      children: [
        _buildStatCounter('42 km/h', 'Current Speed', Icons.speed_rounded, const Color(0xFF3B82F6)),
        _buildStatCounter('36 km/h', 'Average Speed', Icons.speed_rounded, const Color(0xFF10B981)),
        _buildStatCounter('68 km/h', 'Max Speed', Icons.speed_rounded, Colors.redAccent),
        _buildStatCounter('08m 24s', 'Idle Time', Icons.hourglass_empty_rounded, Colors.orangeAccent),
        _buildStatCounter('5', 'Stops Made', Icons.pause_circle_outline_rounded, Colors.amber),
        _buildStatCounter('Strong', 'GPS Status', Icons.signal_cellular_alt_rounded, const Color(0xFF8B5CF6)),
      ],
    );
  }

  Widget _buildStatCounter(String value, String label, IconData icon, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: iconColor, size: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelinePanel() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildTimelineStep('08:10 AM', 'Trip Started', 'MG Road, Indiranagar', true, isFirst: true),
          _buildTimelineStep('08:25 AM', 'Commercial Street', 'Bengaluru Central', true),
          _buildTimelineStep('08:40 AM', 'Indiranagar', 'Bengaluru East', true),
          _buildTimelineStep('09:05 AM', 'Current Location', 'Near 100 Feet Road', true, isActive: true),
          _buildTimelineStep('09:25 AM', 'Destination', 'Kempegowda Bus Station', false, isLast: true),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String time, String title, String subtitle, bool showLine, {bool isFirst = false, bool isLast = false, bool isActive = false}) {
    Color pointColor = isFirst
        ? const Color(0xFF8B5CF6)
        : (isLast ? Colors.redAccent : (isActive ? const Color(0xFF3B82F6) : AppColors.textMuted));

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: pointColor,
                shape: BoxShape.circle,
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: const Color(0xFF3B82F6).withOpacity(0.4),
                          blurRadius: 6,
                          spreadRadius: 2,
                        )
                      ]
                    : null,
              ),
            ),
            if (showLine)
              Container(
                width: 1.5,
                height: 48,
                color: isActive ? const Color(0xFF3B82F6) : AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      title,
                      style: TextStyle(
                        color: isActive
                            ? const Color(0xFF3B82F6)
                            : Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  const SizedBox(width: 8),

                  Flexible(
                    child: Text(
                      time,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 2),

              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDriverInfoCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
            child: const Center(
              child: Icon(Icons.person_rounded, color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.driverName,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                const Text('+91 98765 43210', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                const SizedBox(height: 2),
                const Text('KA01 2015 123456', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleInfoCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildInfoTextRow('Vehicle Number', controller.vehicleName),
          _buildInfoTextRow('Fleet Name', 'City Bus Fleet'),
          _buildInfoTextRow('Vehicle Type', 'Volvo 8400 Electric'),
          _buildInfoTextRow('GPS Device', 'GPS-TRK-00123'),
          _buildInfoTextRow('Battery', '92%', suffixColor: const Color(0xFF10B981)),
          _buildInfoTextRow('Ignition Status', 'ON', suffixColor: Colors.orangeAccent),
        ],
      ),
    );
  }

  Widget _buildInfoTextRow(String label, String value, {Color suffixColor = Colors.white}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          Text(value, style: TextStyle(color: suffixColor, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 60,
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(height: 6),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
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
