import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/vehicle_analytics_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import 'dart:math';

class VehicleAnalyticsView extends GetView<VehicleAnalyticsController> {
  const VehicleAnalyticsView({super.key});

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
                    'Vehicle Analytics',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: controller.downloadReport,
                    icon: const Icon(Icons.file_download_outlined, color: AppColors.textLink, size: 16),
                    label: const Text('Download Report', style: TextStyle(color: AppColors.textLink, fontSize: 11, fontWeight: FontWeight.bold)),
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
                    // Performance circular chart and Bus Card
                    _buildPerformanceCard(),
                    const SizedBox(height: 20),

                    // Horizontal stats row
                    Row(
                      children: [
                        Expanded(child: _buildSummaryItem('Total Distance', controller.totalDistance, Icons.timeline_rounded)),
                        const SizedBox(width: 8),
                        Expanded(child: _buildSummaryItem('Total Trips', '${controller.totalTrips}', Icons.directions_bus_outlined)),
                        const SizedBox(width: 8),
                        Expanded(child: _buildSummaryItem('Running Hours', controller.runningHours, Icons.access_time_rounded)),
                        const SizedBox(width: 8),
                        Expanded(child: _buildSummaryItem('Average Speed', controller.avgSpeed, Icons.speed_rounded)),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Distance Trend chart (This Week)
                    const Text(
                      'Distance Trend (This Week)',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildTrendChartCard(),
                    const SizedBox(height: 24),

                    // Key Metrics
                    const Text(
                      'Key Metrics',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildKeyMetricsCard(),
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

  Widget _buildPerformanceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Circular Performance Indicator on Left
          SizedBox(
            width: 100,
            height: 100,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(90, 90),
                  painter: CircularProgressPainter(score: controller.performanceScore),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${controller.performanceScore}%',
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      controller.performanceText,
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 20),

          // Bus Details on Right
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  height: 65,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.06),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B82F6), size: 36),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      controller.vehicleName,
                      style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle)),
                          const SizedBox(width: 6),
                          const Text('Active', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 8, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  controller.modelName,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
                const SizedBox(height: 2),
                Text(
                  controller.fleetName,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon) {
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
          Icon(icon, color: const Color(0xFF8B5CF6), size: 16),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _buildTrendChartCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('2K', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
              Text('km', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 140,
            width: double.infinity,
            child: CustomPaint(
              painter: TrendLinePainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKeyMetricsCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildMetricRow('Total Distance', controller.totalDistance, Icons.timeline_rounded, const Color(0xFF3B82F6)),
          _buildMetricRow('Total Trips', '${controller.totalTrips}', Icons.directions_bus_outlined, const Color(0xFF10B981)),
          _buildMetricRow('Running Hours', controller.runningHours, Icons.access_time_rounded, Colors.orangeAccent),
          _buildMetricRow('Average Speed', controller.avgSpeed, Icons.speed_rounded, const Color(0xFF8B5CF6), isLast: true),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, IconData icon, Color iconColor, {bool isLast = false}) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: iconColor, size: 16),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        if (!isLast) const Divider(color: AppColors.cardBorder, height: 1),
      ],
    );
  }
}

// Progress Ring Custom Painter
class CircularProgressPainter extends CustomPainter {
  final int score;

  CircularProgressPainter({required this.score});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width / 2, size.height / 2) - 4;

    // Track circle
    final trackPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius, trackPaint);

    // Progress circle (Glow ring gradient)
    final progressPaint = Paint()
      ..shader = const LinearGradient(
        colors: [
          Color(0xFF3B82F6),
          Color(0xFF8B5CF6),
        ],
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    double sweepAngle = (score / 100) * 2 * pi;
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -pi / 2, sweepAngle, false, progressPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Weekly Trend Line Custom Painter
class TrendLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final axisPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 1.0;

    // Draw horizontal grid lines representation
    canvas.drawLine(Offset(0, size.height * 0.25), Offset(size.width, size.height * 0.25), axisPaint);
    canvas.drawLine(Offset(0, size.height * 0.5), Offset(size.width, size.height * 0.5), axisPaint);
    canvas.drawLine(Offset(0, size.height * 0.75), Offset(size.width, size.height * 0.75), axisPaint);

    // Weekday coordinates Mon-Sun
    final dataPoints = [
      Offset(0, size.height * 0.7),     // Mon: 1.2K
      Offset(size.width * 0.16, size.height * 0.6), // Tue: 1.4K
      Offset(size.width * 0.33, size.height * 0.5), // Wed: 1.6K
      Offset(size.width * 0.5, size.height * 0.65),  // Thu: 1.3K
      Offset(size.width * 0.66, size.height * 0.38), // Fri: 1.8K
      Offset(size.width * 0.83, size.height * 0.45), // Sat: 1.7K
      Offset(size.width, size.height * 0.55),        // Sun: 1.5K
    ];

    // Glow blue gradient polyline
    final linePaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path()..moveTo(dataPoints[0].dx, dataPoints[0].dy);
    for (int i = 1; i < dataPoints.length; i++) {
      path.lineTo(dataPoints[i].dx, dataPoints[i].dy);
    }
    
    // Draw neon outer glow for polyline
    final glowPaint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.15)
      ..strokeWidth = 8.0
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, glowPaint);
    canvas.drawPath(path, linePaint);

    // Draw grid points & text labels
    final pointPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final ringPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    final labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final kmValues = ['1.2K', '1.4K', '1.6K', '1.3K', '1.8K', '1.7K', '1.5K'];

    for (int i = 0; i < dataPoints.length; i++) {
      final p = dataPoints[i];
      canvas.drawCircle(p, 4, pointPaint);
      canvas.drawCircle(p, 6, ringPaint);

      // Draw value on top of point
      textPainter.text = TextSpan(
        text: kmValues[i],
        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(p.dx - textPainter.width / 2, p.dy - 18));

      // Draw weekday name label at bottom
      textPainter.text = TextSpan(
        text: labels[i],
        style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(p.dx - textPainter.width / 2, size.height - 10));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
