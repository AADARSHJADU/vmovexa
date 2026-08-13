import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import '../../live_tracking/views/live_tracking_view.dart';
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
                const Text(
                  'Live Map',
                  style: TextStyle(
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
                  _buildMapStatItem('156', 'Active Vehicles', Icons.directions_bus_rounded, const Color(0xFF3B82F6)),
                  _buildVerticalDivider(),
                  _buildMapStatItem('142', 'Moving', Icons.directions_run_rounded, const Color(0xFF10B981)),
                  _buildVerticalDivider(),
                  _buildMapStatItem('10', 'Idle', Icons.person_outline_rounded, Colors.orangeAccent),
                  _buildVerticalDivider(),
                  _buildMapStatItem('4', 'Offline', Icons.power_settings_new_rounded, Colors.redAccent),
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
                          color: AppColors.background.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder, width: 1),
                        ),
                        child: const Icon(Icons.my_location_rounded, color: Colors.white, size: 18),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.background.withOpacity(0.9),
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
        color: AppColors.cardBg.withOpacity(0.96),
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
                      color: const Color(0xFF6366F1).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF6366F1), size: 20),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('MH12AB1234', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text('City Bus Fleet', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    const Text('Moving', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 9, fontWeight: FontWeight.bold)),
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
              _buildRowStat('Driver', 'Rajesh Kumar', Icons.person_outline_rounded),
              _buildRowStat('Speed', '42 km/h', Icons.speed_rounded),
              _buildRowStat('Last Updated', 'Just now', Icons.access_time_rounded),
            ],
          ),
          const SizedBox(height: 12),

          // Address Location field
          Row(
            children: const [
              Icon(Icons.location_on_outlined, color: Color(0xFF6366F1), size: 16),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Eastern Express Highway, Ghatkopar East, Mumbai - 400075',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10, height: 1.3),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
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
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.visibility_outlined, color: Colors.white, size: 16),
                        SizedBox(width: 6),
                        Text('View Details', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
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
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.navigation_outlined, color: Colors.white, size: 14),
                  label: const Text('Navigate', style: TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.cardBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.history_rounded, color: Colors.white, size: 14),
                  label: const Text('Trip History', style: TextStyle(color: Colors.white, fontSize: 11)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRowStat(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF6366F1), size: 14),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }
}
