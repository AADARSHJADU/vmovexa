import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/campaign_analytics_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';

class CampaignAnalyticsView extends GetView<CampaignAnalyticsController> {
  const CampaignAnalyticsView({super.key});

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
                children: [
                  const CustomBackButton(),
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Campaign Analytics',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.share_outlined, color: Colors.white, size: 18),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 18),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                physics: const BouncingScrollPhysics(),
                child: Obx(() {
                  final c = controller.campaign.value;
                  final bool paused = controller.isPaused.value;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Campaign Header Card
                      _buildCampaignHeaderCard(c, paused),
                      const SizedBox(height: 18),

                      // Metrics Summary Grid
                      _buildMetricsGrid(c),
                      const SizedBox(height: 24),

                      // Chart
                      const Text(
                        'Impressions vs Reach',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      _buildImpressionsReachChart(),
                      const SizedBox(height: 24),

                      // Two lists stacked: Cities & Fleet
                      _buildPerformingCitiesCard(),
                      const SizedBox(height: 18),
                      _buildPerformingFleetCard(),
                      const SizedBox(height: 24),

                      // Bottom Specs
                      _buildBottomSpecsRow(paused),
                      const SizedBox(height: 28),

                      // Action buttons row
                      _buildActionButtonsRow(paused),
                      const SizedBox(height: 16),
                    ],
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCampaignHeaderCard(dynamic c, bool paused) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: c.themeColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: c.themeColor.withOpacity(0.2), width: 1),
            ),
            child: Center(
              child: Icon(Icons.campaign_rounded, color: c.themeColor, size: 28),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(c.title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: paused ? const Color(0xFFF59E0B).withOpacity(0.12) : const Color(0xFF10B981).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        paused ? 'PAUSED' : 'LIVE',
                        style: TextStyle(
                          color: paused ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Retail • ${c.status}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
                const SizedBox(height: 6),
                Row(
                  children: const [
                    Icon(Icons.calendar_month_outlined, color: AppColors.textMuted, size: 12),
                    SizedBox(width: 6),
                    Text(
                      '20 May 2026 - 10 Jun 2026 (21 Days)',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 9),
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

  Widget _buildMetricsGrid(dynamic c) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.45,
      children: [
        _buildMetricCard('Total Impressions', '15.2M', '▲ 18.6% vs 7 days ago', const Color(0xFF8B5CF6)),
        _buildMetricCard('Total Reach', '8.7M', '▲ 16.3% vs 7 days ago', const Color(0xFF3B82F6)),
        _buildMetricCard('Active Screens', '1,182', '▲ 9.4% vs 7 days ago', const Color(0xFF10B981)),
        _buildBudgetSpentCard(),
      ],
    );
  }

  Widget _buildMetricCard(String label, String value, String sub, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(sub, style: TextStyle(color: color, fontSize: 8.5)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetSpentCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('Budget Spent', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('₹1,48,750', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('59.5% of ₹2,50,000', style: TextStyle(color: AppColors.textSecondary, fontSize: 8.5)),
                ],
              ),
              const SizedBox(height: 4),
              Container(
                height: 4,
                width: double.infinity,
                decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(2)),
                child: Row(
                  children: [
                    Container(
                      width: 60, // simulated 59.5% width
                      decoration: BoxDecoration(color: const Color(0xFFF59E0B), borderRadius: BorderRadius.circular(2)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildImpressionsReachChart() {
    return Container(
      height: 190,
      padding: const EdgeInsets.all(12),
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
              Row(
                children: [
                  _buildChartLegendBullet('Impressions', const Color(0xFF8B5CF6)),
                  const SizedBox(width: 14),
                  _buildChartLegendBullet('Reach', const Color(0xFF3B82F6)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.inputBg,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  children: const [
                    Text('Last 7 Days', style: TextStyle(color: Colors.white, fontSize: 9)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted, size: 12),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: ImpressionsReachPainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartLegendBullet(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
      ],
    );
  }

  Widget _buildPerformingCitiesCard() {
    final List<Map<String, dynamic>> items = [
      {'name': 'Delhi', 'val': '2.8M (22%)', 'progress': 0.8},
      {'name': 'Mumbai', 'val': '2.1M (17%)', 'progress': 0.65},
      {'name': 'Bengaluru', 'val': '1.6M (13%)', 'progress': 0.5},
      {'name': 'Hyderabad', 'val': '1.2M (10%)', 'progress': 0.4},
      {'name': 'Pune', 'val': '0.9M (8%)', 'progress': 0.3},
    ];

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.location_on_outlined, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Top Performing Cities', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),
          Column(
            children: items.map((i) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(i['name'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                        Text(i['val'] as String, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: i['progress'] as double,
                      backgroundColor: const Color(0xFF1E293B),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
                      minHeight: 3,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformingFleetCard() {
    final List<Map<String, dynamic>> items = [
      {'name': 'City Ride', 'val': '4.2M (28%)', 'progress': 0.8},
      {'name': 'Metro Connect', 'val': '3.6M (24%)', 'progress': 0.7},
      {'name': 'Urban Link', 'val': '2.7M (18%)', 'progress': 0.55},
    ];

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.directions_bus_rounded, color: Color(0xFF8B5CF6), size: 14),
              SizedBox(width: 8),
              Text('Top Fleet Operators', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),
          Column(
            children: items.map((i) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(i['name'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                        Text(i['val'] as String, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: i['progress'] as double,
                      backgroundColor: const Color(0xFF1E293B),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
                      minHeight: 3,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomSpecsRow(bool paused) {
    return Row(
      children: [
        Expanded(child: _buildBottomSpecsCard('Campaign Status', paused ? 'Paused' : 'Live', paused ? const Color(0xFFF59E0B) : const Color(0xFF10B981))),
        const SizedBox(width: 8),
        Expanded(child: _buildBottomSpecsCard('Remaining Days', '12 Days', Colors.white)),
        const SizedBox(width: 8),
        Expanded(child: _buildBottomSpecsCard('Budget Remaining', '₹1,01,250', const Color(0xFF10B981))),
        const SizedBox(width: 8),
        Expanded(child: _buildBottomSpecsCard('Avg. Frequency', '2.3 Times', Colors.white)),
      ],
    );
  }

  Widget _buildBottomSpecsCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildActionButtonsRow(bool paused) {
    return Column(
      children: [
        Row(
          children: [
            // Pause Button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: controller.togglePauseState,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: Icon(paused ? Icons.play_arrow_rounded : Icons.pause_rounded, color: Colors.white, size: 16),
                label: Text(paused ? 'Resume Campaign' : 'Pause Campaign', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 12),

            // Duplicate Button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: controller.duplicateCampaign,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.copy_rounded, color: Colors.white, size: 14),
                label: const Text('Duplicate Campaign', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Download Report (Full Width)
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)]),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ElevatedButton.icon(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.file_download_outlined, color: Colors.white, size: 16),
            label: const Text('Download Report', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}

// Custom Painter to draw Impressions vs Reach Chart matching Figma Screen
class ImpressionsReachPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double paddingLeft = 32.0;
    final double paddingBottom = 20.0;
    final double paddingTop = 10.0;
    final double paddingRight = 10.0;

    final double width = size.width - paddingLeft - paddingRight;
    final double height = size.height - paddingTop - paddingBottom;

    final paintGrid = Paint()
      ..color = AppColors.cardBorder
      ..strokeWidth = 1.0;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    final List<String> yLabels = ['0', '1M', '2M', '3M'];
    for (int i = 0; i < 4; i++) {
      double y = paddingTop + height - (height * i / 3);
      canvas.drawLine(Offset(paddingLeft, y), Offset(size.width - paddingRight, y), paintGrid);

      textPainter.text = TextSpan(
        text: yLabels[i],
        style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(paddingLeft - textPainter.width - 6, y - textPainter.height / 2));
    }

    final List<String> xLabels = ['13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May'];
    for (int i = 0; i < 7; i++) {
      double x = paddingLeft + (width * i / 6);
      textPainter.text = TextSpan(
        text: xLabels[i],
        style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(x - textPainter.width / 2, size.height - paddingBottom + 4));
    }

    // Impressions Points: Purple (Line values scaled to 0.0 - 1.0)
    // 1.8M, 2.1M, 2.4M, 2.2M, 2.6M, 2.8M, 3.3M
    final List<double> impressions = [0.54, 0.63, 0.72, 0.66, 0.78, 0.84, 0.99];
    // Reach Points: Blue
    // 1.0M, 1.2M, 1.4M, 1.3M, 1.5M, 1.6M, 1.7M
    final List<double> reach = [0.30, 0.36, 0.42, 0.39, 0.45, 0.48, 0.51];

    _drawGraphLine(canvas, paddingLeft, paddingTop, width, height, impressions, const Color(0xFF8B5CF6));
    _drawGraphLine(canvas, paddingLeft, paddingTop, width, height, reach, const Color(0xFF3B82F6));
  }

  void _drawGraphLine(Canvas canvas, double ox, double oy, double w, double h, List<double> values, Color color) {
    final path = Path();
    final paintLine = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    double px0 = ox;
    double py0 = oy + h - (h * values[0]);
    path.moveTo(px0, py0);

    for (int i = 1; i < values.length; i++) {
      double px1 = ox + (w * i / 6);
      double py1 = oy + h - (h * values[i]);

      double cx0 = px0 + (px1 - px0) / 2;
      double cy0 = py0;
      double cx1 = px0 + (px1 - px0) / 2;
      double cy1 = py1;

      path.cubicTo(cx0, cy0, cx1, cy1, px1, py1);

      px0 = px1;
      py0 = py1;
    }

    canvas.drawPath(path, paintLine);

    final dotPaint = Paint()..color = color;
    for (int i = 0; i < values.length; i++) {
      double x = ox + (w * i / 6);
      double y = oy + h - (h * values[i]);
      canvas.drawCircle(Offset(x, y), 3.5, dotPaint);
      canvas.drawCircle(Offset(x, y), 1.5, Paint()..color = Colors.white);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
