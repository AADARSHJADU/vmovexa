import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/trip_report_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class TripReportView extends GetView<TripReportController> {
  const TripReportView({super.key});

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
                    'Trip Report',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.share_outlined, color: Colors.white, size: 22),
                        onPressed: controller.shareReport,
                      ),
                      IconButton(
                        icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 24),
                        onPressed: controller.downloadReport,
                      ),
                    ],
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
                    // Main Bus Card Header
                    _buildBusCardHeader(),
                    const SizedBox(height: 20),

                    // Route Overview
                    _buildSectionTitle(Icons.navigation_outlined, 'Route Overview'),
                    const SizedBox(height: 12),
                    _buildRouteOverviewCard(),
                    const SizedBox(height: 24),

                    // Trip Analytics
                    _buildSectionTitle(Icons.analytics_outlined, 'Trip Analytics'),
                    const SizedBox(height: 12),
                    _buildTripAnalyticsRow(),
                    const SizedBox(height: 24),

                    // Trip Timeline
                    _buildSectionTitle(Icons.history_toggle_off_rounded, 'Trip Timeline'),
                    const SizedBox(height: 12),
                    _buildTimelineCard(),
                    const SizedBox(height: 24),

                    // Driver Information
                    _buildSectionTitle(Icons.person_outline_rounded, 'Driver Information'),
                    const SizedBox(height: 12),
                    _buildDriverInfoCard(),
                    const SizedBox(height: 32),

                    // Bottom Buttons
                    CustomButton(
                      text: 'Export PDF',
                      onTap: controller.exportPdf,
                    ),
                    const SizedBox(height: 12),
                    CustomButton(
                      text: 'Share Report',
                      isOutlined: true,
                      onTap: controller.shareReport,
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

  Widget _buildSectionTitle(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF8B5CF6), size: 18),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildBusCardHeader() {
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
          // Graphic Bus Image
          Container(
            width: 100,
            height: 90,
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.directions_bus_rounded,
              color: Color(0xFF3B82F6),
              size: 48,
            ),
          ),
          const SizedBox(width: 16),

          // Details List
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Trip ID', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                        const SizedBox(height: 2),
                        Text(
                          controller.tripId,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy_rounded, color: AppColors.textSecondary, size: 14),
                      onPressed: controller.copyTripId,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildCardSpec('Vehicle', controller.vehicleName, Icons.directions_bus_outlined, const Color(0xFF3B82F6)),
                    _buildCardSpec('Driver', controller.driverName, Icons.person_outline_rounded, const Color(0xFF8B5CF6)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildCardSpec('Date', controller.date, Icons.calendar_today_outlined, const Color(0xFF10B981)),
                    Row(
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: const BoxDecoration(color: Color(0xFF8B5CF6), shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Completed',
                          style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
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

  Widget _buildCardSpec(String label, String value, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 13),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildRouteOverviewCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Start & End details
              Expanded(
                flex: 11,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildRouteStep('Start', 'MG Road', 'Indiranagar, Bengaluru', const Color(0xFF8B5CF6)),
                    const SizedBox(height: 20),
                    _buildRouteStep('Destination', 'Kempegowda Bus Station', 'Bengaluru', Colors.redAccent, isPin: true),
                  ],
                ),
              ),

              // Vertical divider
              Container(width: 1, height: 100, color: AppColors.cardBorder, margin: const EdgeInsets.symmetric(horizontal: 14)),

              // Map path view
              Expanded(
                flex: 13,
                child: Container(
                  height: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: const Color(0xFF0F172A),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CustomPaint(
                      painter: MiniMapPainter(),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 14),

          // Horizontal stats list
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildOverviewStat('18.6 km', 'Distance Covered', Icons.swap_calls_rounded),
              _buildOverviewStat('1h 15m', 'Total Duration', Icons.access_time_rounded),
              _buildOverviewStat('38 km/h', 'Average Speed', Icons.speed_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRouteStep(String label, String station, String city, Color pointColor, {bool isPin = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: isPin
              ? Icon(Icons.location_on_rounded, color: pointColor, size: 14)
              : Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: pointColor, width: 2),
                  ),
                ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
              const SizedBox(height: 2),
              Text(station, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 2),
              Text(city, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewStat(String value, String label, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF6366F1), size: 16),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
      ],
    );
  }

  Widget _buildTripAnalyticsRow() {
    return Row(
      children: [
        Expanded(child: _buildAnalyticCard('18.6 km', 'Distance Travelled', Icons.timeline_rounded)),
        const SizedBox(width: 8),
        Expanded(child: _buildAnalyticCard('1h 02m', 'Driving Time', Icons.drive_eta_rounded)),
        const SizedBox(width: 8),
        Expanded(child: _buildAnalyticCard('13m', 'Idle Time', Icons.hourglass_empty_rounded)),
        const SizedBox(width: 8),
        Expanded(child: _buildAnalyticCard('68 km/h', 'Max Speed', Icons.speed_rounded)),
      ],
    );
  }

  Widget _buildAnalyticCard(String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildTimelineCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildTimelineStep('08:10 AM', 'Trip Started', 'MG Road, Indiranagar', const Color(0xFF8B5CF6), isFirst: true),
          _buildTimelineStep('08:25 AM', 'Commercial Street', 'Bengaluru', const Color(0xFF8B5CF6)),
          _buildTimelineStep('08:40 AM', 'Indiranagar', 'Bengaluru', const Color(0xFF8B5CF6)),
          _buildTimelineStep('09:25 AM', 'Trip Completed', 'Kempegowda Bus Station, Bengaluru', Colors.redAccent, isLast: true),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String time, String title, String subtitle, Color color, {bool isFirst = false, bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            if (isLast)
              const Icon(Icons.flag_rounded, color: Colors.green, size: 14)
            else
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
            if (!isLast)
              Container(
                width: 1.5,
                height: 40,
                color: AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    time,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
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
            child: const Center(
              child: Icon(Icons.person_rounded, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(controller.driverName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('+91 98765 43210', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.phone_outlined, color: Color(0xFF10B981), size: 20),
            onPressed: () {},
          ),
        ],
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
