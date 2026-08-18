import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/schedule_controller.dart';
import '../model/schedule_trip_model.dart';

class ScheduleView extends GetView<ScheduleController> {
  const ScheduleView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kBlue = Color(0xFF3F7BF5);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 16),
                  _buildTabBar(),
                ],
              ),
            ),
            Expanded(
              child: Obx(
                () => controller.isLoading.value && controller.todayTrips.isEmpty
                    ? const Center(child: CircularProgressIndicator(color: kPurple))
                    : RefreshIndicator(
                        color: kPurple,
                        backgroundColor: kCardBg,
                        onRefresh: controller.onRefresh,
                        child: controller.selectedTabIndex.value == 0 ? _buildTodayTab() : _buildUpcomingTab(),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Schedule', style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w800)),
              SizedBox(height: 2),
              Text('View your daily and upcoming schedules.', style: TextStyle(color: Colors.white54, fontSize: 12)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onCalendarTap,
          child: Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: const Icon(Icons.calendar_today_outlined, color: kPurple, size: 17),
          ),
        ),
      ],
    );
  }

  // ---------------- Tab bar (Today / Upcoming) ----------------
  Widget _buildTabBar() {
    return Obx(
      () => Row(
        children: [
          Expanded(child: _TabItem(label: 'Today', isActive: controller.selectedTabIndex.value == 0, onTap: () => controller.selectTab(0))),
          Expanded(child: _TabItem(label: 'Upcoming', isActive: controller.selectedTabIndex.value == 1, onTap: () => controller.selectTab(1))),
        ],
      ),
    );
  }

  // ---------------- TODAY TAB ----------------
  Widget _buildTodayTab() {
    return Obx(
      () => ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
        children: [
          _buildSummaryHeaderCard(
            icon: Icons.calendar_today,
            title: "Today's Schedule",
            subtitle: controller.todayDateLabel.value,
            badgeText: '${controller.todayTripCount} Trips',
          ),
          const SizedBox(height: 18),
          Text(controller.todayGroupLabel.value, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          _buildTodayTimeline(),
          const SizedBox(height: 16),
          _buildInfoBanner(),
          const SizedBox(height: 16),
          _buildScheduleSummaryCard(),
        ],
      ),
    );
  }

  Widget _buildTodayTimeline() {
    return Column(
      children: List.generate(controller.todayTrips.length, (index) {
        final trip = controller.todayTrips[index];
        final isLast = index == controller.todayTrips.length - 1;
        return _TodayTripTimelineRow(trip: trip, isLast: isLast, onTap: () => controller.onTripTap(trip));
      }),
    );
  }

  Widget _buildScheduleSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Schedule Summary', style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _SummaryStatColumn(icon: Icons.alt_route, value: '${controller.todayTripCount}', label: 'Trips')),
              Expanded(child: _SummaryStatColumn(icon: Icons.route_outlined, value: '${controller.todayTotalDistanceKm.toStringAsFixed(1)} km', label: 'Total Distance')),
              Expanded(child: _SummaryStatColumn(icon: Icons.access_time, value: controller.todayTotalDuration.value, label: 'Total Duration')),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- UPCOMING TAB ----------------
  Widget _buildUpcomingTab() {
    return Obx(
      () => ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
        children: [
          _buildSummaryHeaderCard(
            icon: Icons.calendar_today,
            title: 'Upcoming Schedules',
            subtitle: 'Your next scheduled trips.',
            badgeText: '${controller.upcomingTripCount} Trips',
          ),
          const SizedBox(height: 18),
          const Text('Upcoming Trips', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          ...controller.upcomingTrips.map(
            (trip) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _UpcomingTripCard(trip: trip, onTap: () => controller.onTripTap(trip)),
            ),
          ),
          const SizedBox(height: 4),
          _buildInfoBanner(),
        ],
      ),
    );
  }

  // ---------------- Shared: summary header card ----------------
  Widget _buildSummaryHeaderCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required String badgeText,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: kPurple, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: kPurple, fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: kPurple.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.event_note_outlined, color: kPurple, size: 12),
                const SizedBox(width: 4),
                Text(badgeText, style: const TextStyle(color: kPurple, fontSize: 10.5, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Shared: info banner ----------------
  Widget _buildInfoBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: const [
          Icon(Icons.access_time, color: Colors.white38, size: 15),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Timings may change due to traffic or operational updates. Please check notifications for the latest updates.',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Tab item with underline indicator
// =====================================================================
class _TabItem extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _TabItem({required this.label, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white38,
                fontSize: 14,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ),
          Container(
            height: 2.5,
            width: double.infinity,
            decoration: BoxDecoration(
              color: isActive ? ScheduleView.kPurple : Colors.transparent,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Today tab: single trip timeline row (start dot -> trip card -> end dot)
// =====================================================================
class _TodayTripTimelineRow extends StatelessWidget {
  final ScheduleTrip trip;
  final bool isLast;
  final VoidCallback onTap;

  const _TodayTripTimelineRow({required this.trip, required this.isLast, required this.onTap});

  static const Color kPurple = ScheduleView.kPurple;


  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle)),
              Expanded(child: Container(width: 1.5, color: Colors.white12)),
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: kPurple, width: 2)),
              ),
              if (!isLast) ...[
                const SizedBox(height: 14),
              ],
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(trip.startTime, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                  const Text('Start Time', style: TextStyle(color: Colors.white24, fontSize: 9.5)),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: onTap,
                    child: _TripCard(trip: trip),
                  ),
                  const SizedBox(height: 8),
                  Text(trip.endTime, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                  const Text('End Time', style: TextStyle(color: Colors.white24, fontSize: 9.5)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Trip card (used inside Today's timeline)
// =====================================================================
class _TripCard extends StatelessWidget {
  final ScheduleTrip trip;
  const _TripCard({required this.trip});

  static const Color kPurple = ScheduleView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ScheduleView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ScheduleView.kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
                child: const Icon(Icons.directions_bus_filled_outlined, color: kPurple, size: 16),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trip.routeName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text('${trip.fromDepot} \u2192 ${trip.toDepot}', style: const TextStyle(color: Colors.white54, fontSize: 10.5)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(color: trip.status.color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                child: Text(trip.status.label, style: TextStyle(color: trip.status.color, fontSize: 10, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
            child: Text(trip.tripLabel, style: const TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 10),
          Divider(color: Colors.white.withOpacity(0.06), height: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _MiniInfo(icon: Icons.location_on_outlined, label: 'Start Point', value: trip.startPoint)),
              Expanded(child: _MiniInfo(icon: Icons.flag_outlined, label: 'End Point', value: trip.endPoint)),
              Expanded(child: _MiniInfo(icon: Icons.route_outlined, label: 'Distance', value: '${trip.distanceKm} km')),
            ],
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Upcoming tab: trip card with date box
// =====================================================================
class _UpcomingTripCard extends StatelessWidget {
  final ScheduleTrip trip;
  final VoidCallback onTap;

  const _UpcomingTripCard({required this.trip, required this.onTap});

  static const Color kPurple = ScheduleView.kPurple;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ScheduleView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ScheduleView.kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
                      child: const Icon(Icons.calendar_today, color: kPurple, size: 15),
                    ),
                    SizedBox(height: 5,),
                    SizedBox(
                      width: 84,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_formatDate(trip.date), style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 1),
                          Text(trip.dayLabel, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // SizedBox(
                      //   width: 84,
                      //   child: Column(
                      //     crossAxisAlignment: CrossAxisAlignment.start,
                      //     children: [
                      //       Text(_formatDate(trip.date), style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
                      //       const SizedBox(height: 1),
                      //       Text(trip.dayLabel, style: const TextStyle(color: Colors.white38, fontSize: 10)),
                      //     ],
                      //   ),
                      // ),
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
                        child: const Icon(Icons.directions_bus_filled_outlined, color: kPurple, size: 15),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(trip.routeName, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text('${trip.fromDepot} \u2192 ${trip.toDepot}', style: const TextStyle(color: Colors.white54, fontSize: 10)),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                              child: Text(trip.tripLabel, style: const TextStyle(color: kPurple, fontSize: 9.5, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(color: trip.status.color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                  child: Text(trip.status.label, style: TextStyle(color: trip.status.color, fontSize: 10, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Divider(color: Colors.white.withOpacity(0.06), height: 1),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _MiniInfo(icon: Icons.access_time, label: 'Start Time', value: trip.startTime)),
                Expanded(child: _MiniInfo(icon: Icons.location_on_outlined, label: 'Start Point', value: trip.startPoint)),
                Expanded(child: _MiniInfo(icon: Icons.flag_outlined, label: 'End Point', value: trip.endPoint)),
                Expanded(child: _MiniInfo(icon: Icons.route_outlined, label: 'Distance', value: '${trip.distanceKm} km')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }
}

// =====================================================================
// Mini info column (Start Point / End Point / Distance / Start Time)
// =====================================================================
class _MiniInfo extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _MiniInfo({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: ScheduleView.kPurple, size: 11),
            const SizedBox(width: 3),
            Expanded(child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9))),
          ],
        ),
        const SizedBox(height: 3),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

// =====================================================================
// Summary stat column (used in Schedule Summary card)
// =====================================================================
class _SummaryStatColumn extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _SummaryStatColumn({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: ScheduleView.kPurple, size: 18),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9.5), textAlign: TextAlign.center),
      ],
    );
  }
}
