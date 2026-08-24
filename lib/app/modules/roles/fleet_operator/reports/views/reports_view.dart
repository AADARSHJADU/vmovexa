import 'package:flutter/material.dart';
import '../../../../../theme/app_colors.dart';

class ReportsView extends StatelessWidget {
  const ReportsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Header Bar
          _buildHeaderBar(),

          // Scrollable Reports Dashboard
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Metric Stats counters
                  _buildMetricStatsGrid(),
                  const SizedBox(height: 18),

                  // Performance Trend line chart
                  _buildPerformanceTrendCard(),
                  const SizedBox(height: 18),

                  // QR Reports Overview section
                  _buildQrReportsOverviewCard(),
                  const SizedBox(height: 18),

                  // Charts Row: QR Scans Trend & QR Scans by Location
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildQrScansTrendCard(),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildQrLocationDonutCard(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Top QR Performing Campaigns list
                  _buildTopPerformingCampaignsCard(),
                  const SizedBox(height: 18),

                  // Bottom Export Report Banner
                  _buildExportReportBanner(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // HEADER BAR
  // ==========================================
  Widget _buildHeaderBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 12,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Reports',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Track and export campaign performance',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.cardBorder,
                width: 1.2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(
                  Icons.calendar_today_rounded,
                  color: Colors.white,
                  size: 11,
                ),
                SizedBox(width: 6),
                Text(
                  '12 May – 20 May 2025',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                ),
                SizedBox(width: 4),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: Colors.white,
                  size: 12,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // METRICS STATS GRID
  // ==========================================
  Widget _buildMetricStatsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 0.85,
      children: [
        _buildMetricCell('Impressions', '24,560', '↑ 15.2%', const Color(0xFF3B82F6)),
        _buildMetricCell('Reach', '18,430', '↑ 11.6%', const Color(0xFF10B981)),
        _buildMetricCell('Clicks', '3,248', '↑ 9.3%', const Color(0xFF8B5CF6)),
        _buildMetricCell('Engagement', '6.24%', '↑ 4.7%', const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildMetricCell(String label, String val, String inc, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(inc, style: TextStyle(color: color, fontSize: 8.5, fontWeight: FontWeight.bold)),
          const Text('vs last 7 days', style: TextStyle(color: AppColors.textMuted, fontSize: 7)),
        ],
      ),
    );
  }

  // ==========================================
  // PERFORMANCE TREND CARD
  // ==========================================
  Widget _buildPerformanceTrendCard() {
    return Container(
      padding: const EdgeInsets.all(14),
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
            children: [
              const Text('Performance Trend', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              Row(
                children: [
                  _buildChartLegendItem('Impressions', const Color(0xFF3B82F6)),
                  const SizedBox(width: 8),
                  _buildChartLegendItem('Reach', const Color(0xFF10B981)),
                  const SizedBox(width: 8),
                  _buildMiniDropdown('Daily'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Double Line graph trend painter
          SizedBox(
            height: 140,
            width: double.infinity,
            child: CustomPaint(
              painter: ReportsPerformanceTrendPainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartLegendItem(String name, Color color) {
    return Row(
      children: [
        Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
      ],
    );
  }

  Widget _buildMiniDropdown(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 8.5)),
          const SizedBox(width: 2),
          const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 10),
        ],
      ),
    );
  }

  // ==========================================
  // QR REPORTS OVERVIEW
  // ==========================================
  Widget _buildQrReportsOverviewCard() {
    return Container(
      padding: const EdgeInsets.all(14),
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
              Icon(Icons.qr_code_2_rounded, color: Color(0xFF8B5CF6), size: 16),
              const SizedBox(width: 8),
              Text('QR Reports Overview', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),

          // QR Metrics sub grid
          Row(
            children: [
              Expanded(child: _buildQrOverviewCell('Total QR Scans', '8,642', '↑ 18.4%', const Color(0xFF10B981))),
              const SizedBox(width: 8),
              Expanded(child: _buildQrOverviewCell('Unique QR Scans', '6,231', '↑ 15.2%', const Color(0xFF3B82F6))),
              const SizedBox(width: 8),
              Expanded(child: _buildQrOverviewCell('QR Scan Rate', '2.35%', '↑ 10.1%', const Color(0xFF8B5CF6))),
              const SizedBox(width: 8),
              Expanded(child: _buildQrOverviewCell('Avg Scans/Day', '1,234', '↑ 8.7%', const Color(0xFFF59E0B))),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black12,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text('Top Location', style: TextStyle(color: AppColors.textMuted, fontSize: 7.5)),
                      SizedBox(height: 4),
                      Text('Bhopal', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text('1,842 Scans', style: TextStyle(color: AppColors.textSecondary, fontSize: 7.5)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQrOverviewCell(String label, String value, String inc, Color color) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.black12,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5), maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(inc, style: TextStyle(color: color, fontSize: 7.5, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // ==========================================
  // QR SCANS TREND (Image 3 Left side-by-side)
  // ==========================================
  Widget _buildQrScansTrendCard() {
    return Container(
      height: 190,
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('QR Scans Trend', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
              _buildMiniDropdown('Daily'),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              _buildChartLegendItem('Total', const Color(0xFF3B82F6)),
              const SizedBox(width: 6),
              _buildChartLegendItem('Unique', const Color(0xFF10B981)),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: CustomPaint(
              painter: ReportsQrScansTrendPainter(),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // QR SCANS BY LOCATION (Image 3 Right side-by-side)
  // ==========================================
  Widget _buildQrLocationDonutCard() {
    return Container(
      height: 190,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('QR Scans by Location (Top 5)', style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: CustomPaint(
                    painter: ReportsQrLocationDonutPainter(),
                  ),
                ),
                const SizedBox(width: 6),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildDonutLegendItem('Bhopal', '21.3%', const Color(0xFF3B82F6)),
                    const SizedBox(height: 4),
                    _buildDonutLegendItem('Indore', '17.8%', const Color(0xFF10B981)),
                    const SizedBox(height: 4),
                    _buildDonutLegendItem('Jabalpur', '15.3%', const Color(0xFF8B5CF6)),
                    const SizedBox(height: 4),
                    _buildDonutLegendItem('Gwalior', '12.9%', const Color(0xFFF59E0B)),
                    const SizedBox(height: 4),
                    _buildDonutLegendItem('Ujjain', '9.5%', const Color(0xFFEF4444)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDonutLegendItem(String name, String percentage, Color color) {
    return Row(
      children: [
        Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name, style: const TextStyle(color: AppColors.textMuted, fontSize: 7)),
        const SizedBox(width: 4),
        Text(percentage, style: const TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold)),
      ],
    );
  }

  // ==========================================
  // TOP QR PERFORMING CAMPAIGNS LIST
  // ==========================================
  Widget _buildTopPerformingCampaignsCard() {
    final List<Map<String, dynamic>> items = [
      {
        'rank': 1,
        'title': 'Road Safety Awareness',
        'scans': '2,152',
        'unique': '1,542',
        'rate': '2.85%',
        'avg': '307',
        'image': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200',
      },
      {
        'rank': 2,
        'title': 'Monsoon Preparedness',
        'scans': '1,842',
        'unique': '1,321',
        'rate': '2.42%',
        'avg': '263',
        'image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200',
      },
      {
        'rank': 3,
        'title': 'Clean City Initiative',
        'scans': '1,596',
        'unique': '1,134',
        'rate': '2.18%',
        'avg': '228',
        'image': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=200',
      },
      {
        'rank': 4,
        'title': 'Dengue Prevention Drive',
        'scans': '1,254',
        'unique': '964',
        'rate': '1.95%',
        'avg': '179',
        'image': 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=200',
      },
    ];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Top QR Performing Campaigns', style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),

          // Table Header
          Row(
            children: const [
              SizedBox(width: 24),
              Expanded(
                flex: 3,
                child: Text('Campaign', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5)),
              ),
              Expanded(
                child: Text('Total Scans', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5), textAlign: TextAlign.right),
              ),
              Expanded(
                child: Text('Unique', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5), textAlign: TextAlign.right),
              ),
              Expanded(
                child: Text('Scan Rate', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5), textAlign: TextAlign.right),
              ),
              Expanded(
                child: Text('Avg/Day', style: TextStyle(color: AppColors.textMuted, fontSize: 8.5), textAlign: TextAlign.right),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 16),

          // Items rows
          Column(
            children: items.map((i) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    SizedBox(
                      width: 24,
                      child: Text('${i['rank']}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    Expanded(
                      flex: 3,
                      child: Row(
                        children: [
                          Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(4),
                              image: DecorationImage(
                                image: NetworkImage(i['image'] as String),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              i['title'] as String,
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Text(i['scans'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.right),
                    ),
                    Expanded(
                      child: Text(i['unique'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5), textAlign: TextAlign.right),
                    ),
                    Expanded(
                      child: Text(i['rate'] as String, style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.right),
                    ),
                    Expanded(
                      child: Text(i['avg'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 9.5), textAlign: TextAlign.right),
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

  // ==========================================
  // EXPORT REPORT BANNER
  // ==========================================
  Widget _buildExportReportBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF3B82F6).withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFF3B82F6).withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.description_outlined,
                    color: Color(0xFF3B82F6),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Export Report',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Download report in PDF or Excel format.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 9,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          Container(
            height: 36,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF3B82F6),
                  Color(0xFF8B5CF6),
                ],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: ElevatedButton.icon(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14),
              ),
              icon: const Text(
                'Export',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
              label: const Icon(
                Icons.download_rounded,
                color: Colors.white,
                size: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// REPORTS CUSTOM GRAPH PAINTERS
// ==========================================
class ReportsPerformanceTrendPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double chartHeight = size.height - 24;
    final double chartWidth = size.width - 24;

    final List<String> dates = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May', '20 May'];
    final double stepX = chartWidth / (dates.length - 1);

    // Impressions (blue)
    final List<double> impressions = [7500, 9000, 12500, 11000, 14000, 16000, 17500, 17800, 24560];
    // Reach (green)
    final List<double> reach = [4000, 4800, 5200, 5000, 7000, 8000, 9000, 9200, 18430];

    // Grid lines
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    for (int i = 0; i <= 5; i++) {
      final y = chartHeight - (i * chartHeight / 5) + 6;
      canvas.drawLine(Offset(10, y), Offset(size.width, y), gridPaint);
    }

    void drawTrend(List<double> data, Color color) {
      final path = Path();
      final linePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.2;

      final pointPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      for (int i = 0; i < data.length; i++) {
        final x = 12 + (i * stepX);
        final y = chartHeight - (data[i] / 25000 * chartHeight) + 6;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3, pointPaint);
        canvas.drawCircle(Offset(x, y), 5.5, Paint()..color = color.withOpacity(0.18));
      }
      canvas.drawPath(path, linePaint);
    }

    drawTrend(impressions, const Color(0xFF3B82F6));
    drawTrend(reach, const Color(0xFF10B981));

    // Bottom dates labels
    for (int i = 0; i < dates.length; i++) {
      final x = 12 + (i * stepX);
      if (i % 2 == 0 || i == dates.length - 1) {
        final textPainter = TextPainter(
          text: TextSpan(
            text: dates[i],
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(canvas, Offset(x - 14, chartHeight + 10));
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ReportsQrScansTrendPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double chartHeight = size.height - 20;
    final double chartWidth = size.width - 20;

    final List<String> dates = ['12 May', '14 May', '16 May', '18 May', '20 May'];
    final double stepX = chartWidth / (dates.length - 1);

    // Total: 800, 1.4K, 1.2K, 1.6K, 2.2K
    final List<double> total = [800, 1400, 1200, 1600, 2200];
    // Unique: 400, 800, 700, 950, 1400];
    final List<double> unique = [400, 800, 700, 950, 1400];

    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = chartHeight - (i * chartHeight / 4) + 6;
      canvas.drawLine(Offset(10, y), Offset(size.width, y), gridPaint);
    }

    void drawLine(List<double> data, Color color) {
      final path = Path();
      final linePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      final pointPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      for (int i = 0; i < data.length; i++) {
        final x = 12 + (i * stepX);
        final y = chartHeight - (data[i] / 2500 * chartHeight) + 6;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3, pointPaint);
      }
      canvas.drawPath(path, linePaint);
    }

    drawLine(total, const Color(0xFF3B82F6));
    drawLine(unique, const Color(0xFF10B981));

    // Bottom dates labels
    for (int i = 0; i < dates.length; i++) {
      final x = 12 + (i * stepX);
      final textPainter = TextPainter(
        text: TextSpan(
          text: dates[i],
          style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(x - 14, chartHeight + 10));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ReportsQrLocationDonutPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2.3;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    double startAngle = -3.14159 / 2;

    void drawSegment(double percentage, Color color) {
      final sweepAngle = (percentage / 100) * 2 * 3.14159;
      paint.color = color;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle, sweepAngle, false, paint,
      );
      startAngle += sweepAngle;
    }

    drawSegment(21.3, const Color(0xFF3B82F6));
    drawSegment(17.8, const Color(0xFF10B981));
    drawSegment(15.3, const Color(0xFF8B5CF6));
    drawSegment(12.9, const Color(0xFFF59E0B));
    drawSegment(9.5, const Color(0xFFEF4444));

    // Draw center total Scans
    final countPainter = TextPainter(
      text: const TextSpan(
        text: '8,642\nTotal',
        style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold, height: 1.2),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();
    countPainter.paint(canvas, Offset(center.dx - countPainter.width / 2, center.dy - countPainter.height / 2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
