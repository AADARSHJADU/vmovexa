import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';

import '../../../../../theme/app_theme.dart';
import '../../../technician/hardware_configuration/views/shared_widgets.dart';
import '../controller/my_route_controller.dart';
import '../model/assigned_route_model.dart';

class MyRouteView extends GetView<MyRouteController> {
  const MyRouteView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.route.value == null
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : controller.route.value == null
                  ? const Center(
                      child: Text('No route assigned', style: TextStyle(color: Colors.white, fontSize: 13)))
                  : RefreshIndicator(
                      color: kPurple,
                      backgroundColor: kCardBg,
                      onRefresh: controller.onRefresh,
                      child: ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: [
                          const SizedBox(height: 8),
                          _buildHeader(),
                          const SizedBox(height: 16),
                          _buildRouteSummaryCard(controller.route.value!),
                          const SizedBox(height: 16),
                          _buildStartRouteButton(),
                          const SizedBox(height: 20),
                          _buildRouteDetailsHeader(),
                          const SizedBox(height: 10),
                          _buildRouteDetailsCard(controller.route.value!),
                          const SizedBox(height: 16),
                          _buildRouteInformationCard(controller.route.value!),
                          const SizedBox(height: 16),
                          _buildBusInformationCard(controller.route.value!),
                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
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
              Text('Assigned Routes', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('View and manage your assigned routes.', style: TextStyle(color: Colors.white, fontSize: 12)),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onOpenFilterSheet,
          child: const Icon(Icons.tune, color: kPurple, size: 20),
        ),
      ],
    );
  }

  // ---------------- Route summary card ----------------
  Widget _buildRouteSummaryCard(AssignedRoute route) {
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.directions_bus_filled, color: kPurple, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(route.routeName, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text('${route.fromDepot} \u2192 ${route.toDepot}', style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                    const SizedBox(height: 4),
                    Text(route.busNumber, style: const TextStyle(color: kPurple, fontSize: 11.5, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              Obx(
                () => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: kGreen.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle)),
                      const SizedBox(width: 5),
                      Text(
                        controller.isRouteStarted.value ? 'In Progress' : (route.isOnDuty ? 'On Duty' : 'Off Duty'),
                        style: const TextStyle(color: kGreen, fontSize: 10.5, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: Colors.white.withOpacity(0.07), height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _SummaryStat(icon: Icons.access_time, label: 'Start Time', value: route.startTime),
              ),
              Expanded(
                child: _SummaryStat(icon: Icons.flag_outlined, label: 'End Time', value: route.endTime),
              ),
              Expanded(
                child: _SummaryStat(icon: Icons.route_outlined, label: 'Total Distance', value: '${route.totalDistanceKm} km'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Start Route button ----------------
  Widget _buildStartRouteButton() {
    return Obx(
      () => GestureDetector(
        onTap: (controller.isStarting.value || controller.isRouteStarted.value) ? null : controller.onStartRoute,
        child: Container(
          width: double.infinity,
          height: 52,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: controller.isStarting.value
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(controller.isRouteStarted.value ? Icons.check_circle_outline : Icons.play_arrow, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      controller.isRouteStarted.value ? 'Route Started' : 'Start Route',
                      style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  // ---------------- "Route Details" + View on Map ----------------
  Widget _buildRouteDetailsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Route Details', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
        GestureDetector(
          onTap: controller.onViewOnMap,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('View on Map', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
              SizedBox(width: 5),
              Icon(Icons.map_outlined, color: kPurple, size: 15),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Stops timeline card ----------------
  Widget _buildRouteDetailsCard(AssignedRoute route) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: List.generate(route.stops.length, (index) {
          final stop = route.stops[index];
          final isLast = index == route.stops.length - 1;
          return _StopRow(stop: stop, isLast: isLast);
        }),
      ),
    );
  }

  // ---------------- Route Information ----------------
  Widget _buildRouteInformationCard(AssignedRoute route) {
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
          const Text('Route Information', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _InfoColumn(icon: Icons.route_outlined, label: 'Route Type', value: route.routeType)),
              Expanded(child: _InfoColumn(icon: Icons.loop, label: 'Frequency', value: route.frequency)),
              Expanded(child: _InfoColumn(icon: Icons.groups_outlined, label: 'Passengers (Est.)', value: route.passengersEstimate)),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Bus Information ----------------
  Widget _buildBusInformationCard(AssignedRoute route) {
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
          Row(
            children: const [
              Icon(Icons.directions_bus_outlined, color: kPurple, size: 16),
              SizedBox(width: 8),
              Text('Bus Information', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _PlainInfoColumn(label: 'Bus Number', value: route.busNumber.replaceFirst('Bus ', ''))),
              Expanded(child: _PlainInfoColumn(label: 'Vehicle ID', value: route.vehicleId)),
              Expanded(child: _PlainInfoColumn(label: 'Bus Type', value: route.busType)),
            ],
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Summary stat (Start Time / End Time / Total Distance)
// =====================================================================
class _SummaryStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _SummaryStat({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: MyRouteView.kPurple, size: 13),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 10)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

// =====================================================================
// Route stop row (timeline)
// =====================================================================
class _StopRow extends StatelessWidget {
  final RouteStop stop;
  final bool isLast;

  const _StopRow({required this.stop, required this.isLast});

  static const Color kPurple = MyRouteView.kPurple;
  static const Color kGreen = MyRouteView.kGreen;

  @override
  Widget build(BuildContext context) {
    final isStart = stop.type == RouteStopType.start;
    final isEnd = stop.type == RouteStopType.end;
    final dotColor = isStart ? kGreen : kPurple;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              isEnd
                  ? const Icon(Icons.location_on, color: kPurple, size: 18)
                  : Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: isStart ? kGreen : kBg,
                        shape: BoxShape.circle,
                        border: Border.all(color: dotColor, width: 2),
                      ),
                    ),
              if (!isLast) Expanded(child: Container(width: 1.5, color: Colors.white)),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 18, top: isEnd ? 0 : 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(stop.name, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                            if (isStart || isEnd) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (isStart ? kGreen : kPurple).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  isStart ? 'Start' : 'End',
                                  style: TextStyle(color: isStart ? kGreen : kPurple, fontSize: 9.5, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(stop.time, style: const TextStyle(color: Colors.white, fontSize: 10.5)),
                      ],
                    ),
                  ),
                  if (!isStart)
                    Text('${stop.distanceKm} km', style: const TextStyle(color: Colors.white, fontSize: 11)),
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
// Info column with icon (Route Information section)
// =====================================================================
class _InfoColumn extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoColumn({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: MyRouteView.kPurple, size: 13),
            const SizedBox(width: 4),
            Expanded(child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 9.5))),
          ],
        ),
        const SizedBox(height: 5),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

// =====================================================================
// Plain info column (Bus Information section — no icon)
// =====================================================================
class _PlainInfoColumn extends StatelessWidget {
  final String label;
  final String value;

  const _PlainInfoColumn({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 9.5)),
        const SizedBox(height: 5),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
      ],
    );
  }
}
