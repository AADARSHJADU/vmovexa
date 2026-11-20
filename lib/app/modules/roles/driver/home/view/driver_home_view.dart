import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import '../controller/driver_home_controller.dart';

class DriverHomeView extends GetView<DriverHomeController> {
  const DriverHomeView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value &&
                  controller.shiftSchedules.isEmpty &&
                  !controller.hasActiveRoute
              ? const Center(child: CircularProgressIndicator(color: kPurple))
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
                      _buildGreeting(),
                      const SizedBox(height: 14),
                      _buildVerificationBanner(),
                      const SizedBox(height: 4),
                      _buildActiveRouteCockpitCard(),
                      const SizedBox(height: 16),
                      _buildShiftScheduleCard(),
                      const SizedBox(height: 16),
                      _buildQuickActionsCard(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header (Menu + SOS + Bell) ----------------
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        InkWell(
          onTap: controller.onMenuTap,
          borderRadius: BorderRadius.circular(8),
          child: const Padding(
            padding: EdgeInsets.all(4),
            child: Icon(Icons.menu_rounded, color: Colors.white, size: 26),
          ),
        ),
        Row(
          children: [
            /*// SOS Incident Report Button
            GestureDetector(
              onTap: controller.onReportIncidentTap,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1C68FD).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 15),
                    const SizedBox(width: 5),
                    Text(
                      'sos_report'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),*/
            // Notification Bell
            Obx(
              () => GestureDetector(
                onTap: controller.onNotificationBellTap,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: kCardBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      child: SvgPicture.asset(
                        'assets/icons/notification.svg',
                        width: 20,
                        height: 20,
                      ),
                    ),
                    if (controller.notificationCount.value > 0)
                      Positioned(
                        right: -2,
                        top: -2,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: kPurple,
                            shape: BoxShape.circle,
                          ),
                          constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                          child: Text(
                            '${controller.notificationCount.value}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------- Greeting with Verification Badge ----------------
  Widget _buildGreeting() {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${'good_morning'.tr}, ${controller.driverName.value}!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // KYC Verified / Pending Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: controller.isDocumentsVerified.value
                      ? const Color(0xFF064E3B).withOpacity(0.5)
                      : const Color(0xFF78350F).withOpacity(0.5),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: controller.isDocumentsVerified.value
                        ? const Color(0xFF10B981).withOpacity(0.6)
                        : const Color(0xFFF59E0B).withOpacity(0.6),
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      controller.isDocumentsVerified.value
                          ? Icons.check_circle_rounded
                          : Icons.access_time_rounded,
                      color: controller.isDocumentsVerified.value
                          ? const Color(0xFF10B981)
                          : const Color(0xFFF59E0B),
                      size: 13,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      controller.isDocumentsVerified.value
                          ? 'kyc_verified'.tr
                          : 'verification_pending'.tr,
                      style: TextStyle(
                        color: controller.isDocumentsVerified.value
                            ? const Color(0xFF34D399)
                            : const Color(0xFFFBBF24),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Row(
            children: [
              Text(
                'safe_corridor_transit'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
              const SizedBox(width: 4),
              const Text('·', style: TextStyle(color: Colors.white38, fontSize: 12)),
              const SizedBox(width: 4),
              Text(
                controller.orgName.value,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 4),
              const Text('·', style: TextStyle(color: Colors.white38, fontSize: 12)),
              const SizedBox(width: 4),
              Text(
                '${'badge_label'.tr} ${controller.badgeId.value}',
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Document Verification Pending Banner ----------------
  Widget _buildVerificationBanner() {
    return Obx(() {
      if (controller.isDocumentsVerified.value) return const SizedBox.shrink();
      return Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF2A1C0E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.amber.withOpacity(0.4)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.hourglass_top_rounded, color: Colors.amber, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'doc_verification_pending'.tr,
                    style: const TextStyle(
                      color: Colors.amber,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'doc_verification_pending_sub'.tr,
                    style: const TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.3),
                  ),
                  const SizedBox(height: 10),
                  GestureDetector(
                    onTap: controller.onUploadDocumentsTap,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: Colors.amber,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'upload_view_docs'.tr,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  // ---------------- 1. Active Route Dispatch Cockpit Card ----------------
  Widget _buildActiveRouteCockpitCard() {
    return Obx(() {
      if (!controller.isDocumentsVerified.value) {
        return const SizedBox.shrink();
      }

      if (!controller.hasActiveRoute) {
        return _buildNoActiveRouteCard();
      }

      final active = controller.activeRouteData.value;
      final isCompleted = (active?.rawStatus ?? active?.status ?? '').toLowerCase() == 'completed';
      final isInTransit = (active?.rawStatus ?? active?.status ?? '').toLowerCase() == 'in_progress' ||
          controller.isOnDuty.value;

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row (Avatar, Route Title, Shift Pill, Status)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1C68FD).withOpacity(0.3),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'active_shift_route'.tr.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              controller.routeName.value,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '(${controller.busNumber.value})',
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Status Pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isInTransit
                        ? const Color(0xFF064E3B).withOpacity(0.6)
                        : isCompleted
                            ? const Color(0xFF064E3B).withOpacity(0.4)
                            : const Color(0xFF1E3A8A).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isInTransit
                          ? const Color(0xFF10B981)
                          : isCompleted
                              ? const Color(0xFF10B981)
                              : const Color(0xFF3B82F6),
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isInTransit)
                        Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.only(right: 5),
                          decoration: const BoxDecoration(
                            color: Color(0xFF10B981),
                            shape: BoxShape.circle,
                          ),
                        ),
                      if (isCompleted)
                        const Padding(
                          padding: EdgeInsets.only(right: 4),
                          child: Icon(Icons.check, color: Color(0xFF10B981), size: 12),
                        ),
                      Text(
                        isCompleted
                            ? 'completed'.tr
                            : isInTransit
                                ? 'live_in_transit'.tr
                                : 'scheduled_ready'.tr,
                        style: TextStyle(
                          color: isInTransit
                              ? const Color(0xFF34D399)
                              : isCompleted
                                  ? const Color(0xFF34D399)
                                  : const Color(0xFF93C5FD),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Corridor Info Pill Box
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${controller.routeFrom.value} ➔ ${controller.routeTo.value}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Text(
                        controller.busNumber.value,
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text('·', style: TextStyle(color: Colors.white38)),
                      const SizedBox(width: 6),
                      Text(
                        controller.vehicleType.value,
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                      if (controller.shiftTypeLabel.value.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        const Text('·', style: TextStyle(color: Colors.white38)),
                        const SizedBox(width: 6),
                        Text(
                          controller.shiftTypeLabel.value,
                          style: const TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 3 Telemetry Metrics (Departure, Next Stop, End of Route)
            Row(
              children: [
                Expanded(
                  child: _buildTelemetryColumn(
                    label: isCompleted ? 'departure'.tr : 'departure'.tr,
                    value: controller.departureTime.value,
                    subtext: isCompleted
                        ? 'logged_in_dispatch'.tr
                        : 'scheduled_departure'.tr,
                    isBlue: false,
                  ),
                ),
                Container(width: 1, height: 36, color: Colors.white10),
                Expanded(
                  child: _buildTelemetryColumn(
                    label: 'next_stop'.tr,
                    value: controller.nextStopName.value,
                    subtext: '${'eta'.tr} ${controller.nextStopEta.value}',
                    isBlue: true,
                  ),
                ),
                Container(width: 1, height: 36, color: Colors.white10),
                Expanded(
                  child: _buildTelemetryColumn(
                    label: isCompleted ? 'completed'.tr : 'end_of_route'.tr,
                    value: controller.endOfRouteTime.value,
                    subtext: 'corridor_terminus'.tr,
                    isBlue: false,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Launch Route Cockpit Primary Button
            GestureDetector(
              onTap: controller.onViewRouteDetails,
              child: Container(
                width: double.infinity,
                height: 46,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1C68FD).withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.speed_rounded, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      isCompleted
                          ? 'view_completed_summary'.tr
                          : isInTransit
                              ? 'open_live_cockpit'.tr
                              : 'launch_route_cockpit'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildTelemetryColumn({
    required String label,
    required String value,
    required String subtext,
    required bool isBlue,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: isBlue ? const Color(0xFF60A5FA) : Colors.white38,
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              color: isBlue ? const Color(0xFF93C5FD) : Colors.white,
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              fontFamily: 'monospace',
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            subtext,
            style: const TextStyle(color: Colors.white38, fontSize: 9.5),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------- No Active Route Assigned Fallback ----------------
  Widget _buildNoActiveRouteCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1C68FD).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.directions_bus_outlined, color: Color(0xFF60A5FA), size: 28),
          ),
          const SizedBox(height: 12),
          Text(
            'no_active_route_assigned'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'no_trip_scheduled_desc'.tr,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white54, fontSize: 11.5, height: 1.3),
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: controller.onViewFullSchedule,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.calendar_month_outlined, color: Colors.white, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    'view_timetable_schedule'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- 2. Shift Schedule & Timetable (Latest Shifts) ----------------
  Widget _buildShiftScheduleCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.access_time_filled_rounded, color: Color(0xFF60A5FA), size: 16),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            'shift_schedule_timetable'.tr.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Obx(
                          () => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A).withOpacity(0.5),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.5)),
                            ),
                            child: Text(
                              '${'latest'.tr} ${controller.shiftSchedules.length}',
                              style: const TextStyle(
                                color: Color(0xFF93C5FD),
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'shift_schedule_desc'.tr,
                      style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                    ),
                  ],
                ),
              ),
              // const SizedBox(width: 8),
              // GestureDetector(
              //   onTap: controller.onViewFullSchedule,
              //   child: Container(
              //     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              //     decoration: BoxDecoration(
              //       gradient: const LinearGradient(
              //         colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
              //       ),
              //       borderRadius: BorderRadius.circular(8),
              //     ),
              //     child: Row(
              //       mainAxisSize: MainAxisSize.min,
              //       children: [
              //         Text(
              //           'view_full_roster'.tr,
              //           style: const TextStyle(
              //             color: Colors.white,
              //             fontSize: 10.5,
              //             fontWeight: FontWeight.bold,
              //           ),
              //         ),
              //         const SizedBox(width: 4),
              //         const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 12),
              //       ],
              //     ),
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: Colors.white.withOpacity(0.06), height: 1),
          const SizedBox(height: 10),

          // Shift List
          Obx(() {
            if (controller.shiftSchedules.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Center(
                  child: Text(
                    'no_scheduled_shifts'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ),
              );
            }

            return Column(
              children: List.generate(controller.shiftSchedules.length, (index) {
                final shift = controller.shiftSchedules[index];
                final isLast = index == controller.shiftSchedules.length - 1;
                return _buildShiftRow(shift, isLast);
              }),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildShiftRow(DriverShiftItem shift, bool isLast) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isLast ? Colors.transparent : Colors.white.withOpacity(0.05),
            width: 0.8,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Time
          SizedBox(
            width: 68,
            child: Text(
              shift.startTime ?? '--:--',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                fontFamily: 'monospace',
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Route, Bus, Depots
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      shift.routeNumber ?? 'ROUTE',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 4),
                    if (shift.shiftTypeLabel != null && shift.shiftTypeLabel!.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: Colors.white10,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          shift.shiftTypeLabel!,
                          style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  shift.busNumber ?? '—',
                  style: const TextStyle(
                    overflow: TextOverflow.ellipsis,
                    color: Color(0xFFCBD5E1),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 3),

                const SizedBox(height: 3),
                Text(
                  '${shift.startDepot ?? "Depot"} → ${shift.endDepot ?? "Terminus"}',
                  style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Status & Action
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                decoration: BoxDecoration(
                  color: shift.isCompleted
                      ? const Color(0xFF064E3B).withOpacity(0.5)
                      : shift.isInTransit
                          ? const Color(0xFF1E3A8A).withOpacity(0.5)
                          : Colors.white10,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: shift.isCompleted
                        ? const Color(0xFF10B981)
                        : shift.isInTransit
                            ? const Color(0xFF3B82F6)
                            : Colors.white24,
                    width: 0.6,
                  ),
                ),
                child: Text(
                  shift.status ?? 'Scheduled',
                  style: TextStyle(
                    color: shift.isCompleted
                        ? const Color(0xFF34D399)
                        : shift.isInTransit
                            ? const Color(0xFF93C5FD)
                            : Colors.white70,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              // const SizedBox(height: 4),
              // GestureDetector(
              //   onTap: () => controller.onShiftItemTap(shift),
              //   child: Container(
              //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              //     decoration: BoxDecoration(
              //       gradient: const LinearGradient(
              //         colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
              //       ),
              //       borderRadius: BorderRadius.circular(6),
              //     ),
              //     child: Row(
              //       mainAxisSize: MainAxisSize.min,
              //       children: [
              //         Text(
              //           shift.isCompleted
              //               ? 'summary'.tr
              //               : shift.isInTransit
              //                   ? 'cockpit'.tr
              //                   : 'dispatch'.tr,
              //           style: const TextStyle(
              //             color: Colors.white,
              //             fontSize: 9.5,
              //             fontWeight: FontWeight.bold,
              //           ),
              //         ),
              //         const SizedBox(width: 3),
              //         const Icon(Icons.chevron_right, color: Colors.white, size: 11),
              //       ],
              //     ),
              //   ),
              // ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- 3. Quick Actions Grid ----------------
  Widget _buildQuickActionsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'quick_actions'.tr.toUpperCase(),
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 11.5,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 14),
          Obx(
            () => GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 2.1,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: controller.quickActions.length,
              itemBuilder: (context, index) {
                final act = controller.quickActions[index];
                final isLocked = act.requiresVerification && !controller.isDocumentsVerified.value;

                return GestureDetector(
                  onTap: () => controller.onQuickActionTap(act),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isLocked ? kFieldBg.withOpacity(0.5) : kFieldBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isLocked ? Colors.amber.withOpacity(0.3) : Colors.white.withOpacity(0.06),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            gradient: isLocked
                                ? null
                                : const LinearGradient(
                                    colors: [Color(0xFF1C68FD), Color(0xFFDA29F4)],
                                  ),
                            color: isLocked ? Colors.amber.withOpacity(0.15) : null,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: isLocked
                                ? const Icon(Icons.lock_rounded, color: Colors.amber, size: 16)
                                : SvgPicture.asset(
                                    act.icon,
                                    width: 17,
                                    height: 17,
                                    colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                                  ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                act.title.tr,
                                style: TextStyle(
                                  color: isLocked ? Colors.white60 : Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isLocked
                                    ? 'verification_pending'.tr
                                    : (act.subtitle?.tr ?? ''),
                                style: TextStyle(
                                  color: isLocked ? Colors.amber : Colors.white38,
                                  fontSize: 9.5,
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
