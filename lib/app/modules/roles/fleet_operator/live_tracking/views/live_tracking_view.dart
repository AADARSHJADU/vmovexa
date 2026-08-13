import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/live_tracking_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';

class LiveTrackingView extends GetView<LiveTrackingController> {
  const LiveTrackingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            // Dark Map View Layout
            Positioned.fill(
              child: _buildMapViewSection(),
            ),

            // Top Header Bar Overlay
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: AppColors.background.withOpacity(0.9),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const CustomBackButton(),
                    Column(
                      children: [
                        const Text(
                          'Live Tracking',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'Live',
                              style: TextStyle(
                                color: Color(0xFF10B981),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
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
            ),

            // Floating Top Left Vehicle Specs Card
            Positioned(
              top: 70,
              left: 20,
              child: _buildFloatingVehicleCard(),
            ),

            // Right Map Controls (+ / - / Target)
            Positioned(
              right: 20,
              bottom: 350,
              child: _buildMapControlsPanel(),
            ),

            // Bottom Drawer Panel (Slide up)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _buildBottomDrawer(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapViewSection() {
    return Container(
      color: const Color(0xFF0F172A), // Dark Navy Background Map
      child: CustomPaint(
        painter: TrackingMapPainter(),
      ),
    );
  }

  Widget _buildFloatingVehicleCard() {
    return Container(
      width: 195,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background.withOpacity(0.95),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          // Bus image panel thumbnail representation
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B82F6), size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      controller.vehicleName.value,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      width: 5,
                      height: 5,
                      decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  controller.modelName.value,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.speed_rounded, color: Color(0xFF3B82F6), size: 10),
                        const SizedBox(width: 2),
                        Text('${controller.speed.value} km/h', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    GestureDetector(
                      onTap: controller.callDriver,
                      child: const Icon(Icons.phone_rounded, color: Color(0xFF10B981), size: 12),
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

  Widget _buildMapControlsPanel() {
    return Column(
      children: [
        GestureDetector(
          onTap: () {},
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.background.withOpacity(0.9),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: const Icon(Icons.my_location_rounded, color: Colors.white, size: 20),
          ),
        ),
        const SizedBox(height: 14),
        Container(
          decoration: BoxDecoration(
            color: AppColors.background.withOpacity(0.9),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
          ),
          child: Column(
            children: [
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  child: const Icon(Icons.add, color: Colors.white, size: 20),
                ),
              ),
              Container(width: 24, height: 1, color: AppColors.cardBorder),
              GestureDetector(
                onTap: () {},
                child: Container(
                  width: 42,
                  height: 42,
                  alignment: Alignment.center,
                  child: const Icon(Icons.remove, color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomDrawer(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: const Border(top: BorderSide(color: AppColors.cardBorder, width: 1.5)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Current Trip panel header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.notes_rounded, color: Color(0xFF6366F1), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Current Trip',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                child: const Text('View Route', style: TextStyle(color: Colors.white, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Trip Path Stepper
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    children: [
                      // Vertical Dot Timeline indicator
                      Column(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle),
                          ),
                          Container(width: 1.5, height: 20, color: AppColors.cardBorder),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                          ),
                        ],
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'MG Road, Indiranagar, Bengaluru',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 12),
                            Text(
                              'Kempegowda Bus Station, Bengaluru',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 14),
              // Remaining specs details
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('12.4 km', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  const Text('Distance Remaining', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                  const SizedBox(height: 8),
                  const Text('18 mins', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 13, fontWeight: FontWeight.bold)),
                  const Text('ETA', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Last GPS update tag line
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Last GPS Update: Just now',
                style: TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
              IconButton(
                icon: const Icon(Icons.sync_rounded, color: Color(0xFF10B981), size: 16),
                onPressed: () {},
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Realtime Stats Row: Speed, Battery, Signal, Ignition
          Row(
            children: [
              Expanded(child: _buildRealtimeStatCard('42 km/h', 'Current Speed', Icons.speed_rounded, const Color(0xFF3B82F6))),
              const SizedBox(width: 8),
              Expanded(child: _buildRealtimeStatCard('92%', 'Battery', Icons.battery_charging_full_rounded, const Color(0xFF10B981))),
              const SizedBox(width: 8),
              Expanded(child: _buildRealtimeStatCard('Strong', 'GPS Signal', Icons.signal_cellular_alt_rounded, const Color(0xFF8B5CF6))),
              const SizedBox(width: 8),
              Expanded(child: _buildRealtimeStatCard('ON', 'Ignition Status', Icons.vpn_key_outlined, Colors.orangeAccent)),
            ],
          ),
          const SizedBox(height: 20),

          // Quick actions title
          Row(
            children: const [
              Icon(Icons.bolt_rounded, color: Colors.purpleAccent, size: 16),
              SizedBox(width: 6),
              Text(
                'Quick Actions',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Quick Actions Grid Row
          Row(
            children: [
              Expanded(child: _buildQuickActionItem('Call Driver', Icons.call_outlined, Colors.green, controller.callDriver)),
              const SizedBox(width: 8),
              Expanded(child: _buildQuickActionItem('Navigate', Icons.navigation_outlined, const Color(0xFF3B82F6), () {})),
              const SizedBox(width: 8),
              Expanded(child: _buildQuickActionItem('Trip History', Icons.history_rounded, const Color(0xFF8B5CF6), () {})),
              const SizedBox(width: 8),
              Expanded(child: _buildQuickActionItem('Emergency Alert', Icons.notifications_active_outlined, Colors.red, () {})),
            ],
          ),
          const SizedBox(height: 24),

          // Footer actions: View details, End tracking
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: 'View Trip Details',
                  isOutlined: true,
                  onTap: controller.goToTripDetails,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: OutlinedButton(
                  onPressed: controller.endTracking,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.stop_rounded, color: Colors.redAccent, size: 18),
                      SizedBox(width: 6),
                      Text(
                        'End Tracking',
                        style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildRealtimeStatCard(String value, String label, IconData icon, Color accentColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        children: [
          Icon(icon, color: accentColor, size: 18),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionItem(String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 65,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder, width: 1),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 18),
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

// Custom Painter to draw a clean dark map layout representation with route markers and polylines
class TrackingMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Draw some grid network lines representation (roads)
    canvas.drawLine(Offset(0, size.height * 0.2), Offset(size.width, size.height * 0.22), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.45), Offset(size.width, size.height * 0.38), linePaint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.75), linePaint);
    canvas.drawLine(Offset(size.width * 0.25, 0), Offset(size.width * 0.3, size.height), linePaint);
    canvas.drawLine(Offset(size.width * 0.65, 0), Offset(size.width * 0.6, size.height), linePaint);

    // Draw route path (Glowing blue polyline)
    final routePaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    final routePath = Path()
      ..moveTo(size.width * 0.2, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.6, size.width * 0.5, size.height * 0.45)
      ..quadraticBezierTo(size.width * 0.6, size.height * 0.3, size.width * 0.8, size.height * 0.25);
    
    // Draw neon outer glow for route
    final glowPaint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8.0
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(routePath, glowPaint);
    canvas.drawPath(routePath, routePaint);

    // Draw Starting Point (Blue bubble pin)
    final startPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.7), 6, startPaint);
    
    // Draw Current Moving Bus Pin (Neon center circle)
    final currentPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    
    final currentRing = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final pinOffset = Offset(size.width * 0.5, size.height * 0.45);
    canvas.drawCircle(pinOffset, 8, currentPaint);
    canvas.drawCircle(pinOffset, 12, currentRing);
    
    // Draw Destination Pin (Red teardrop representation)
    final destOffset = Offset(size.width * 0.8, size.height * 0.25);
    final destPaint = Paint()
      ..color = Colors.redAccent
      ..style = PaintingStyle.fill;
    canvas.drawCircle(destOffset, 7, destPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
