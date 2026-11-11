import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';

class LiveMapView extends StatelessWidget {
  const LiveMapView({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: Column(
        children: [
          // Top Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
                  onPressed: () {},
                ),
                Text(
                  'live_map_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.search_rounded, color: Colors.white, size: 24),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.filter_list_rounded, color: Colors.white, size: 24),
                      onPressed: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Counters Row strip
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildMapStatItem('156', 'active_vehicles_stat'.tr, Icons.directions_bus_rounded, const Color(0xFF3B82F6)),
                  _buildVerticalDivider(),
                  _buildMapStatItem('142', 'moving_stat'.tr, Icons.directions_run_rounded, const Color(0xFF10B981)),
                  _buildVerticalDivider(),
                  _buildMapStatItem('10', 'idle_stat'.tr, Icons.person_outline_rounded, Colors.orangeAccent),
                  _buildVerticalDivider(),
                  _buildMapStatItem('4', 'offline_stat'.tr, Icons.power_settings_new_rounded, Colors.redAccent),
                ],
              ),
            ),
          ),

          // Map and Slide details Panel
          Expanded(
            child: Stack(
              children: [
                // Dark Map painter
                Positioned.fill(
                  child: Container(
                    color: const Color(0xFF0F172A),
                    child: CustomPaint(
                      painter: TrackingMapPainter(),
                    ),
                  ),
                ),

                // Map side controls
                Positioned(
                  right: 16,
                  bottom: 240,
                  child: Column(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder, width: 1),
                        ),
                        child: const Icon(Icons.my_location_rounded, color: Colors.white, size: 18),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.background.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder, width: 1),
                        ),
                        child: Column(
                          children: [
                            const SizedBox(width: 38, height: 38, child: Icon(Icons.add, color: Colors.white, size: 18)),
                            Container(width: 20, height: 1, color: AppColors.cardBorder),
                            const SizedBox(width: 38, height: 38, child: Icon(Icons.remove, color: Colors.white, size: 18)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Bottom Slide details info panel
                Positioned(
                  left: 16,
                  right: 16,
                  bottom: 16,
                  child: _buildDetailsSlidePanel(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapStatItem(String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 6),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
      ],
    );
  }

  Widget _buildVerticalDivider() {
    return Container(width: 1, height: 28, color: AppColors.cardBorder);
  }

  Widget _buildDetailsSlidePanel() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: SvgPicture.asset('assets/icons/bus.svg'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('MH12AB1234', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text('city_bus_fleet'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    Text('moving_stat'.tr, style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 9, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 12),

          // Stat parameters
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildRowStat(
                'driver'.tr,
                'Rajesh Kumar',
                svgPath: 'assets/icons/profile.svg',
              ),
              _buildRowStat(
                'speed'.tr,
                '42 km/h',
                svgPath: 'assets/icons/speed_m.svg',
              ),
              _buildRowStat(
                'last_updated_label'.tr,
                'just_now'.tr,
                svgPath: 'assets/icons/clock.svg',
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Address Location field
          Row(
            children: [
              SvgPicture.asset('assets/icons/location.svg', height: 16),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Eastern Express Highway, Ghatkopar East, Mumbai - 400075',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.3),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
            ],
          ),
          const SizedBox(height: 16),
          // Action buttons
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => Get.toNamed(Routes.VEHICLE_DETAILS),
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.visibility_outlined, color: Colors.white, size: 16),
                        const SizedBox(width: 6),
                        Text('view_details_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.navigation_outlined, color: Colors.white, size: 14),
                  label: Text('navigate_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.history_rounded, color: Colors.white, size: 14),
                  label: Text('trip_history_btn'.tr, style: const TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRowStat(
      String label,
      String value, {
        String? svgPath,
        IconData? icon,
      }) {
    return Row(
      children: [
        if (svgPath != null)
          SvgPicture.asset(
            svgPath,
            width: 14,
            height: 14,
          )
        else if (icon != null)
          Icon(
            icon,
            color: const Color(0xFF6366F1),
            size: 14,
          ),

        const SizedBox(width: 6),

        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 8,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class TrackingMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.4)
      ..strokeWidth = 1.0;

    const double step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
