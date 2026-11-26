import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/my_route_controller.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';

class MyRouteView extends GetView<MyRouteController> {
  const MyRouteView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x1FFFFFFF);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kRed = Color(0xFFEF4444);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kPurple = Color(0xFFB042FF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoadingActive.value && controller.rawActiveRoute.value == null) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.gradientBlue));
          }

          return RefreshIndicator(
            color: AppTheme.gradientBlue,
            backgroundColor: kCardBg,
            onRefresh: controller.onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              children: [
                _buildHeaderBar(),
                const SizedBox(height: 14),
                _buildSectionTabs(),
                const SizedBox(height: 16),
                if (controller.activeTab.value == 'active')
                  _buildActiveCorridorCockpit()
                else
                  _buildCompletedTripsLog(),
                const SizedBox(height: 30),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =========================================================================
  // 1. Header Bar
  // =========================================================================
  Widget _buildHeaderBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            // InkWell(
            //   onTap: controller.onBackPressed,
            //   borderRadius: BorderRadius.circular(8),
            //   child: const Padding(
            //     padding: EdgeInsets.all(4),
            //     child: Icon(Icons.arrow_back, color: Colors.white, size: 22),
            //   ),
            // ),
            // const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          'driver_routes.assigned_routes_trips'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.3,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      // if (inProgress) ...[
                      //   const SizedBox(width: 8),
                      //   Container(
                      //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      //     decoration: BoxDecoration(
                      //       color: kGreen.withOpacity(0.15),
                      //       borderRadius: BorderRadius.circular(20),
                      //       border: Border.all(color: kGreen.withOpacity(0.4)),
                      //     ),
                      //     child: Row(
                      //       mainAxisSize: MainAxisSize.min,
                      //       children: [
                      //         Container(
                      //           width: 6,
                      //           height: 6,
                      //           decoration: const BoxDecoration(
                      //             color: kGreen,
                      //             shape: BoxShape.circle,
                      //           ),
                      //         ),
                      //         const SizedBox(width: 5),
                      //         Text(
                      //           'driver_routes.live_in_transit'.tr,
                      //           style: const TextStyle(
                      //             color: kGreen,
                      //             fontSize: 10,
                      //             fontWeight: FontWeight.w700,
                      //           ),
                      //         ),
                      //       ],
                      //     ),
                      //   ),
                      // ] else if (isCompleted) ...[
                      //   const SizedBox(width: 8),
                      //   Container(
                      //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      //     decoration: BoxDecoration(
                      //       color: kGreen.withOpacity(0.15),
                      //       borderRadius: BorderRadius.circular(20),
                      //       border: Border.all(color: kGreen.withOpacity(0.4)),
                      //     ),
                      //     child: Row(
                      //       mainAxisSize: MainAxisSize.min,
                      //       children: [
                      //         const Icon(Icons.check_circle, color: kGreen, size: 12),
                      //         const SizedBox(width: 4),
                      //         Text(
                      //           'driver_routes.shift_run_completed'.tr,
                      //           style: const TextStyle(
                      //             color: kGreen,
                      //             fontSize: 10,
                      //             fontWeight: FontWeight.w700,
                      //           ),
                      //         ),
                      //       ],
                      //     ),
                      //   ),
                      // ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'driver_routes.manage_corridor_runs_sub'.tr,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.65),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Column(
              children: [
                InkWell(
                  onTap: controller.onRefresh,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kBorder),
                    ),
                    child: const Icon(Icons.refresh, color: Colors.white, size: 18),
                  ),
                ),
                // InkWell(
                //   onTap: controller.navigateToSchedule,
                //   borderRadius: BorderRadius.circular(10),
                //   child: Container(
                //     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                //     decoration: BoxDecoration(
                //       gradient: AppTheme.primaryGradient,
                //       borderRadius: BorderRadius.circular(10),
                //       boxShadow: [
                //         BoxShadow(
                //           color: const Color(0xFF1C68FD).withOpacity(0.3),
                //           blurRadius: 8,
                //           offset: const Offset(0, 2),
                //         ),
                //       ],
                //     ),
                //     child: Row(
                //       mainAxisSize: MainAxisSize.min,
                //       children: [
                //         const Icon(Icons.schedule, color: Colors.white, size: 14),
                //         const SizedBox(width: 5),
                //         Text(
                //           'driver_routes.shift_timetable'.tr,
                //           style: const TextStyle(
                //             color: Colors.white,
                //             fontSize: 11,
                //             fontWeight: FontWeight.w700,
                //           ),
                //         ),
                //       ],
                //     ),
                //   ),
                // ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // =========================================================================
  // 2. Dual Tab Selector with AppTheme.primaryGradient
  // =========================================================================
  Widget _buildSectionTabs() {
    final active = controller.activeTab.value;
    final inProgress = controller.isTripInProgress;
    final isCompleted = controller.isTripCompleted;

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => controller.switchTab('active'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                  gradient: active == 'active' ? AppTheme.primaryGradient : null,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'driver_routes.active_cockpit'.tr,
                      style: TextStyle(
                        color: active == 'active' ? Colors.white : Colors.white60,
                        fontSize: 12,
                        fontWeight: active == 'active' ? FontWeight.w800 : FontWeight.w600,
                      ),
                    ),
                    if (inProgress) ...[
                      const SizedBox(width: 6),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF34D399),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ] else if (isCompleted) ...[
                      const SizedBox(width: 6),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: GestureDetector(
              onTap: () => controller.switchTab('completed'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                  gradient: active == 'completed' ? AppTheme.primaryGradient : null,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // const Icon(Icons.check_circle_outline, color: Colors.white, size: 14),
                    // const SizedBox(width: 5),
                    Text(
                      'driver_routes.completed_trips_log'.tr,
                      style: TextStyle(
                        color: active == 'completed' ? Colors.white : Colors.white60,
                        fontSize: 12,
                        fontWeight: active == 'completed' ? FontWeight.w800 : FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: active == 'completed' ? Colors.white.withOpacity(0.25) : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${controller.totalCompleted.value}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // TAB 1: ACTIVE CORRIDOR COCKPIT
  // =========================================================================
  Widget _buildActiveCorridorCockpit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // KYC Warning Banner
        if (!controller.isDocumentsVerified) _buildKycWarningBanner(),

        // Section A: Today's Assigned Shifts Timetable
        if (controller.todaySlots.isNotEmpty) ...[
          const SizedBox(height: 14),
          _buildTodaySlotsSection(),
        ],

        // Section B: Main Cockpit Card
        const SizedBox(height: 14),
        if (controller.hasNoAssignments)
          _buildNoAssignmentCard()
        else
          _buildMainCockpitCard(),

        // Section C: Waypoints & Stops
        if (!controller.hasNoAssignments) ...[
          const SizedBox(height: 16),
          _buildWaypointsSection(),
          const SizedBox(height: 16),
          _buildVehicleDepotCard(),
        ],
      ],
    );
  }

  // ---------------- KYC Warning Banner ----------------
  Widget _buildKycWarningBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF451A03).withOpacity(0.35),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kAmber.withOpacity(0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, color: kAmber, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    style: const TextStyle(color: Color(0xFFFDE68A), fontSize: 11.5, height: 1.4),
                    children: [
                      TextSpan(
                        text: '${'driver_routes.kyc_verification_required'.tr} ',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      TextSpan(text: 'driver_routes.kyc_verification_msg'.tr),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: controller.navigateToDocuments,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'driver_routes.upload_documents_btn'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Section A: Today's Shift Timetable Switcher ----------------
  Widget _buildTodaySlotsSection() {
    final slots = controller.todaySlots;

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
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${'driver_routes.todays_assigned_shifts'.tr} (${slots.length})',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            'driver_routes.select_shift_subtitle'.tr,
            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10.5),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 124,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: slots.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final s = slots[index];
                final isSelected = controller.selectedSlotId.value == s.id;
                final badge = _getShiftBadge(s.shiftType);

                return GestureDetector(
                  onTap: () => controller.selectSlot(s),
                  child: Container(
                    width: 210,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF1E1F30) : kFieldBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF1C68FD) : kBorder,
                        width: isSelected ? 1.8 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: const Color(0xFF1C68FD).withOpacity(0.25),
                                blurRadius: 10,
                                offset: const Offset(0, 2),
                              )
                            ]
                          : null,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: badge['bg'] as Color,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                s.shiftTypeLabel ?? (badge['label'] as String),
                                style: TextStyle(
                                  color: badge['text'] as Color,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            if (s.isInProgress)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: kGreen,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  'driver_routes.live_in_transit'.tr,
                                  style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w800),
                                ),
                              )
                            else if (s.isCompleted)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: kGreen.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: kGreen.withOpacity(0.5)),
                                ),
                                child: Text(
                                  'common.completed'.tr,
                                  style: const TextStyle(color: kGreen, fontSize: 8.5, fontWeight: FontWeight.w800),
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: kBlue.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: kBlue.withOpacity(0.5)),
                                ),
                                child: Text(
                                  'driver_routes.scheduled'.tr,
                                  style: const TextStyle(color: kBlue, fontSize: 8.5, fontWeight: FontWeight.w800),
                                ),
                              ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s.routeName ?? '${s.startPoint ?? "—"} \u2794 ${s.endPoint ?? "—"}',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${s.busNumber ?? "—"} \u00B7 ${s.timeWindow ?? s.formattedStartTime ?? ""}',
                              style: const TextStyle(color: kAmber, fontSize: 10.5, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              s.isCompleted && s.duration != null && s.duration != '—'
                                  ? '${'driver_routes.duration_label'.tr} ${s.duration}'
                                  : (s.distanceKm != null ? '${s.distanceKm} ${'driver_routes.km'.tr}' : '—'),
                              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 9.5),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle, color: Color(0xFF1C68FD), size: 14),
                          ],
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

  // ---------------- Section B: Empty State (No Assignment) ----------------
  Widget _buildNoAssignmentCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF1C68FD).withOpacity(0.35),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.directions_bus, color: Colors.white, size: 36),
          ),
          const SizedBox(height: 16),
          Text(
            'driver_routes.no_active_route_assigned'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            'driver_routes.no_active_route_msg'.tr,
            style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11.5, height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          GestureDetector(
            onTap: controller.navigateToSchedule,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.schedule, color: Colors.white, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'driver_routes.view_7day_schedule'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Section B: Main High-Contrast Cockpit Card ----------------
  Widget _buildMainCockpitCard() {
    final r = controller.rawActiveRoute.value;
    final slot = controller.currentSlot;
    final inProgress = controller.isTripInProgress;
    final isCompleted = controller.isTripCompleted;

    final busNumber = r?.busNumber ?? slot?.busNumber ?? r?.vehicle?.busNumber ?? '—';
    final routeCode = r?.routeNumber ?? slot?.routeCode ?? '—';
    final routeName = r?.routeName ?? slot?.routeName ?? '${r?.origin ?? "—"} \u2794 ${r?.destination ?? "—"}';
    final shiftBadge = _getShiftBadge(slot?.shiftType);

    final departureTime = (isCompleted || inProgress ? r?.startedAtFormatted : slot?.formattedStartTime) ??
        r?.departureTime ??
        '—';
    final departureSubtitle = isCompleted
        ? 'driver_routes.trip_started_at'.tr
        : (inProgress ? 'driver_routes.departure_live'.tr : 'driver_routes.slot_departure'.tr);

    final endTimeVal = isCompleted
        ? (r?.endedAtFormatted ?? '—')
        : (slot?.formattedEndTime ?? r?.endTime ?? '—');
    final endSubtitle = isCompleted
        ? '${'driver_routes.duration_label'.tr} ${r?.duration ?? "—"}'
        : (slot?.timeWindow != null ? '${'driver_routes.window'.tr} ${slot!.timeWindow}' : 'driver_routes.slot_end_time'.tr);

    final distanceVal = r?.totalDistance ??
        (slot?.distanceKm != null ? '${slot!.distanceKm} ${'driver_routes.km'.tr}' : '—');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Bus & Route code + Shift badge & Status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          busNumber,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          // padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          // decoration: BoxDecoration(
                          //   color: kBlue.withOpacity(0.15),
                          //   borderRadius: BorderRadius.circular(6),
                          //   border: Border.all(color: kBlue.withOpacity(0.4)),
                          // ),
                          child: Text(
                            routeCode,
                            style: const TextStyle(color: kBlue, fontSize: 10, fontWeight: FontWeight.w800),
                          ),
                        ),

                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      routeName,
                      style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
                    ),
                    if (slot?.slotCode != null) ...[
                      const SizedBox(height: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: kAmber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: kAmber.withOpacity(0.4)),
                        ),
                        child: Text(
                          'slot_code_prefix'.trParams({'code': slot!.slotCode!}),
                          style: const TextStyle(color: kAmber, fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: shiftBadge['bg'] as Color,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      slot?.shiftTypeLabel ?? (shiftBadge['label'] as String),
                      style: TextStyle(color: shiftBadge['text'] as Color, fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (inProgress)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: kGreen.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: kGreen.withOpacity(0.5)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(width: 5, height: 5, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle)),
                          const SizedBox(width: 4),
                          Text('driver_routes.live_in_transit'.tr, style: const TextStyle(color: kGreen, fontSize: 9, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    )
                  else if (isCompleted)
                    Container(
                      // padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      // decoration: BoxDecoration(
                      //   color: kGreen.withOpacity(0.2),
                      //   borderRadius: BorderRadius.circular(20),
                      //   border: Border.all(color: kGreen.withOpacity(0.5)),
                      // ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // const Icon(Icons.check_circle, color: kGreen, size: 10),
                          // const SizedBox(width: 4),
                          Text('driver_routes.shift_run_completed'.tr, style: const TextStyle(color: kGreen, fontSize: 9, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: kBlue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: kBlue.withOpacity(0.5)),
                      ),
                      child: Text('driver_routes.scheduled'.tr, style: const TextStyle(color: kBlue, fontSize: 9, fontWeight: FontWeight.w800)),
                    ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 14),

          // 3-Column Stats Row
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: kBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        departureSubtitle.toUpperCase(),
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 8.5, fontWeight: FontWeight.w800),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        departureTime,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 32, color: kBorder),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        isCompleted ? 'driver_routes.trip_ended_at'.tr.toUpperCase() : 'driver_routes.slot_end_time'.tr.toUpperCase(),
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 8.5, fontWeight: FontWeight.w800),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        endTimeVal,
                        style: TextStyle(
                          color: isCompleted ? kGreen : const Color(0xFF60A5FA),
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'monospace',
                        ),
                        textAlign: TextAlign.center,
                      ),
                      Text(
                        endSubtitle,
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 8.5),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 32, color: kBorder),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        'driver_routes.corridor_distance'.tr.toUpperCase(),
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 8.5, fontWeight: FontWeight.w800),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        distanceVal,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Action Controls: Completed / In Progress / Scheduled
          if (isCompleted)
            _buildCompletedActionControls(r)
          else if (inProgress)
            _buildInProgressActionControls()
          else
            _buildStartTripButton(),
        ],
      ),
    );
  }

  // ---------------- Completed Action Controls ----------------
  Widget _buildCompletedActionControls(DriverActiveRouteData? r) {
    final tripCode = r?.tripCode ?? (r?.tripId != null ? 'TRIP-${r!.tripId}' : '—');

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kGreen.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kGreen.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: kGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 14),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            'driver_routes.shift_completed_success'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: kGreen.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            tripCode,
                            style: const TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      'driver_routes.trip_recorded_history_sub'.tr,
                      style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 10),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 4 summary metric tiles
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text('driver_routes.trip_started_at'.tr.toUpperCase(), style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 7.5, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                      const SizedBox(height: 2),
                      Text(r?.startedAtFormatted ?? '—', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800, fontFamily: 'monospace'), textAlign: TextAlign.center),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text('driver_routes.trip_ended_at'.tr.toUpperCase(), style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 7.5, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                      const SizedBox(height: 2),
                      Text(r?.endedAtFormatted ?? '—', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800, fontFamily: 'monospace'), textAlign: TextAlign.center),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text('driver_routes.voyage_duration'.tr.toUpperCase(), style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 7.5, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                      const SizedBox(height: 2),
                      Text(r?.duration ?? '—', style: const TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.w800, fontFamily: 'monospace'), textAlign: TextAlign.center),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text('driver_routes.distance_covered'.tr.toUpperCase(), style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 7.5, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                      const SizedBox(height: 2),
                      Text(r?.coveredKm != null ? '${r!.coveredKm} km' : '—', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800, fontFamily: 'monospace'), textAlign: TextAlign.center),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => controller.switchTab('completed'),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kBorder),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.assignment_outlined, color: kBlue, size: 14),
                        const SizedBox(width: 5),
                        Text(
                          'driver_routes.view_log'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: controller.isActionLoading.value
                      ? null
                      : () => controller.onStartTrip(forceNew: true),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: controller.isActionLoading.value
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.play_arrow, color: Colors.white, size: 15),
                              const SizedBox(width: 4),
                              Text(
                                'driver_routes.start_additional_run'.tr,
                                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- In Progress Action Controls ----------------
  Widget _buildInProgressActionControls() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: kGreen.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kGreen.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'driver_routes.live_voyage_in_progress'.tr,
                  style: const TextStyle(color: kGreen, fontSize: 11.5, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: controller.isActionLoading.value
              ? null
              : () {
                  Get.dialog(
                    AlertDialog(
                      backgroundColor: kCardBg,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      title: Text(
                        'end_current_trip_q'.tr,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      content: Text(
                        'end_current_trip_msg'.tr,
                        style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12.5),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Get.back(),
                          child: Text('cancel'.tr, style: const TextStyle(color: Colors.white60)),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kRed,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: () {
                            Get.back();
                            controller.onEndTrip();
                          },
                          child: Text('driver_routes.end_trip_save_run'.tr, style: const TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE11D48), Color(0xFFDC2626)],
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: kRed.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: controller.isActionLoading.value
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle_outline, color: Colors.white, size: 17),
                      const SizedBox(width: 6),
                      Text(
                        'driver_routes.end_trip_save_run'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  // ---------------- Scheduled: Start Trip Button ----------------
  Widget _buildStartTripButton() {
    return GestureDetector(
      onTap: controller.isActionLoading.value ? null : () => controller.onStartTrip(),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 13),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1C68FD).withOpacity(0.35),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: controller.isActionLoading.value
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.play_arrow, color: Colors.white, size: 19),
                  const SizedBox(width: 6),
                  Text(
                    'driver_routes.start_trip_btn'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
      ),
    );
  }

  // ---------------- Section C: Waypoints & Stops Timeline ----------------
  Widget _buildWaypointsSection() {
    final stops = controller.rawActiveRoute.value?.stops ?? [];

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
            children: [
              const Icon(Icons.location_on_outlined, color: kBlue, size: 17),
              const SizedBox(width: 7),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'driver_routes.route_stations_stops'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    '${stops.length} ${'driver_routes.designated_stations_sub'.tr}',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (stops.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: Center(
                child: Text(
                  'driver_routes.no_waypoints_recorded'.tr,
                  style: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 11),
                ),
              ),
            )
          else
            Column(
              children: List.generate(stops.length, (idx) {
                final stop = stops[idx];
                final isStart = (stop.type?.toLowerCase() == 'start') || (stop.order == 1) || (idx == 0);
                final isEnd = (stop.type?.toLowerCase() == 'end') || (stop.order == stops.length) || (idx == stops.length - 1);
                final isLast = idx == stops.length - 1;

                return IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Timeline dot and connecting vertical line
                      Column(
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            decoration: BoxDecoration(
                              gradient: isStart ? AppTheme.primaryGradient : null,
                              color: isEnd ? kRed : (isStart ? null : kFieldBg),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isStart ? Colors.transparent : (isEnd ? kRed : Colors.white24),
                                width: 1.5,
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${idx + 1}',
                              style: const TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w800),
                            ),
                          ),
                          if (!isLast)
                            Expanded(
                              child: Container(
                                width: 1.5,
                                color: Colors.white.withOpacity(0.12),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(width: 10),
                      // Stop details
                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(bottom: isLast ? 0 : 16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            stop.name ?? '—',
                                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        if (isStart) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                            decoration: BoxDecoration(
                                              color: kBlue.withOpacity(0.18),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text('driver_routes.origin_depot'.tr, style: const TextStyle(color: kBlue, fontSize: 8.5, fontWeight: FontWeight.w700)),
                                          ),
                                        ] else if (isEnd) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                            decoration: BoxDecoration(
                                              color: kRed.withOpacity(0.18),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text('driver_routes.terminus'.tr, style: const TextStyle(color: kRed, fontSize: 8.5, fontWeight: FontWeight.w700)),
                                          ),
                                        ],
                                      ],
                                    ),
                                    if (stop.eta != null && stop.eta!.isNotEmpty)
                                      Text(
                                        '${'driver_routes.eta'.tr} ${stop.eta}',
                                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10),
                                      ),
                                  ],
                                ),
                              ),
                              if (stop.distance != null && stop.distance!.isNotEmpty)
                                Text(
                                  stop.distance!,
                                  style: const TextStyle(color: Colors.white60, fontSize: 10.5, fontFamily: 'monospace', fontWeight: FontWeight.w700),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
        ],
      ),
    );
  }

  // ---------------- Section C: Assigned Bus & Base Terminal ----------------
  Widget _buildVehicleDepotCard() {
    final r = controller.rawActiveRoute.value;
    final slot = controller.currentSlot;
    final v = r?.vehicle ?? r?.assignedBus;
    final depot = r?.depot ?? v?.depot;
    final fleet = r?.fleet ?? v?.fleet;

    final busNumber = r?.busNumber ?? slot?.busNumber ?? v?.busNumber ?? '—';
    final model = v?.model ?? slot?.vehicleModel ?? '—';
    final depotName = depot?.name ?? '—';
    final fleetName = fleet?.name ?? '—';
    final s = slot;
    final timeWindow = s?.timeWindow ??
        (s != null && s.formattedStartTime != null && s.formattedEndTime != null
            ? '${s.formattedStartTime} - ${s.formattedEndTime}'
            : '—');

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
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.directions_bus, color: Colors.white, size: 16),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('driver_routes.assigned_bus_depot'.tr, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                    Text('driver_routes.operational_vehicle_depot_sub'.tr, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildInfoRow('driver_routes.bus_registration'.tr, busNumber, isBold: true, isMono: true),
          _buildInfoRow('driver_routes.vehicle_model'.tr, model),
          _buildInfoRow('driver_routes.home_depot_base'.tr, depotName),
          _buildInfoRow('driver_routes.operating_fleet'.tr, fleetName),
          _buildInfoRow('driver_routes.scheduled_window'.tr, timeWindow, color: kAmber),
          const SizedBox(height: 8),
          Divider(color: Colors.white.withOpacity(0.08), height: 1),
          const SizedBox(height: 8),
          // Collapsible Hardware & Specs Toggle
          GestureDetector(
            onTap: controller.toggleTechDetails,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  controller.showTechDetails.value
                      ? 'driver_routes.hide_hardware_specs'.tr
                      : 'driver_routes.view_hardware_specs'.tr,
                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.w700),
                ),
                const Icon(Icons.tune, color: Color(0xFF60A5FA), size: 14),
              ],
            ),
          ),
          if (controller.showTechDetails.value) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kBorder),
              ),
              child: Column(
                children: [
                  _buildInfoRow('driver_routes.vehicle_type'.tr, v?.vehicleType ?? '—'),
                  _buildInfoRow('driver_routes.seating_capacity'.tr, v?.capacity != null ? '${v!.capacity} Seats' : '—'),
                  _buildInfoRow('driver_routes.unit_code'.tr, v?.code ?? '—', isMono: true),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false, bool isMono = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 11)),
          Text(
            value,
            style: TextStyle(
              color: color ?? Colors.white,
              fontSize: 11.5,
              fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
              fontFamily: isMono ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // TAB 2: COMPLETED TRIPS LOG
  // =========================================================================
  Widget _buildCompletedTripsLog() {
    final trips = controller.completedTrips;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search & Count Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorder),
          ),
          child: Column(
            children: [
              TextField(
                controller: controller.searchController,
                onChanged: controller.onSearchChanged,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  icon: const Icon(Icons.search, color: Colors.white54, size: 18),
                  hintText: 'driver_routes.search_trips_ph'.tr,
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11.5),
                  border: InputBorder.none,
                  isDense: true,
                  suffixIcon: controller.searchQuery.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                          onPressed: controller.clearSearch,
                        )
                      : null,
                ),
              ),
              Divider(color: Colors.white.withOpacity(0.06), height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${'driver_routes.total_completed_trips'.tr} ${controller.totalCompleted.value}',
                    style: TextStyle(color: Colors.white.withOpacity(0.65), fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  GestureDetector(
                    onTap: controller.navigateToSchedule,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'driver_routes.shift_timetable'.tr,
                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.w700),
                        ),
                        const Icon(Icons.chevron_right, color: Color(0xFF60A5FA), size: 15),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        if (controller.isLoadingCompleted.value)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator(color: AppTheme.gradientBlue)),
          )
        else if (trips.isEmpty)
          _buildEmptyCompletedTrips()
        else
          Column(
            children: [
              ...trips.map((trip) => _buildTripCard(trip)),
              const SizedBox(height: 12),
              _buildPaginationBar(),
            ],
          ),

        // Trip details modal if selected
        if (controller.selectedTripDetails.value != null)
          _buildTripDetailsModal(controller.selectedTripDetails.value!),
      ],
    );
  }

  // ---------------- Empty State for Completed Trips ----------------
  Widget _buildEmptyCompletedTrips() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.history_toggle_off, color: Colors.white30, size: 40),
          const SizedBox(height: 12),
          Text(
            'driver_routes.no_completed_trips'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            controller.searchQuery.value.isNotEmpty
                ? 'No trips matched your search "${controller.searchQuery.value}".'
                : 'driver_routes.no_completed_trips_sub'.tr,
            style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 11, height: 1.4),
            textAlign: TextAlign.center,
          ),
          if (controller.searchQuery.value.isNotEmpty) ...[
            const SizedBox(height: 14),
            TextButton(
              onPressed: controller.clearSearch,
              child: Text('driver_routes.clear_search'.tr, style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11.5, fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- Completed Trip Card ----------------
  Widget _buildTripCard(DriverTripItem trip) {
    final dateStr = _formatDate(trip.startedAt);
    final startTimeStr = _formatTime(trip.startedAt);
    final endTimeStr = _formatTime(trip.endedAt);
    final durationStr = trip.duration ?? _computeDuration(trip.startedAt, trip.endedAt);
    final distanceStr = (trip.coveredKm != null &&
            trip.coveredKm.toString() != '0.00' &&
            trip.coveredKm.toString() != '0')
        ? trip.coveredKm
        : (trip.distanceKm ?? '—');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Trip Code & Date + Completed Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trip.tripCode ?? 'TRIP-${trip.id ?? "—"}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                    ),
                  ),
                  Text(
                    dateStr,
                    style: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 10),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: kGreen.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kGreen.withOpacity(0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle, color: kGreen, size: 11),
                    const SizedBox(width: 4),
                    Text(
                      'common.completed'.tr,
                      style: const TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),
          Divider(color: Colors.white.withOpacity(0.06), height: 1),
          const SizedBox(height: 8),

          // Row 2: Bus Number & Model
          Row(
            children: [
              const Icon(Icons.directions_bus, color: Color(0xFF60A5FA), size: 15),
              const SizedBox(width: 6),
              Text(
                trip.busNumber ?? '—',
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
              ),
              if (trip.vehicleModel != null && trip.vehicleModel!.isNotEmpty) ...[
                const SizedBox(width: 6),
                Text(
                  '\u00B7 ${trip.vehicleModel}',
                  style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 11),
                ),
              ],
            ],
          ),

          const SizedBox(height: 4),

          // Route Name
          Text(
            trip.routeName ?? '${trip.origin ?? "—"} \u2794 ${trip.destination ?? "—"}',
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 8),

          // Row 3: Timings, Duration, Distance & Summary Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$startTimeStr – $endTimeStr',
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                  ),
                  Text(
                    '${'driver_routes.duration_label'.tr} $durationStr  \u00B7  ${distanceStr != null ? "$distanceStr km" : "—"}',
                    style: const TextStyle(color: kGreen, fontSize: 10, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              InkWell(
                onTap: () => _showTripDetailsDialog(trip),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.visibility_outlined, color: Color(0xFF60A5FA), size: 13),
                      const SizedBox(width: 4),
                      Text(
                        'driver_routes.summary'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700),
                      ),
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

  // ---------------- Pagination Controls ----------------
  Widget _buildPaginationBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          InkWell(
            onTap: controller.currentPage.value > 1
                ? () => controller.changePage(controller.currentPage.value - 1)
                : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: controller.currentPage.value > 1 ? kFieldBg : Colors.white10,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('previous'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
            ),
          ),
          Text(
            '${'gov_billing.page'.tr} ${controller.currentPage.value} ${'gov_billing.of'.tr} ${controller.totalPages.value}',
            style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11, fontWeight: FontWeight.w700),
          ),
          InkWell(
            onTap: controller.currentPage.value < controller.totalPages.value
                ? () => controller.changePage(controller.currentPage.value + 1)
                : null,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: controller.currentPage.value < controller.totalPages.value ? kFieldBg : Colors.white10,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('next'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Completed Trip Details Modal ----------------
  void _showTripDetailsDialog(DriverTripItem trip) {
    controller.openTripDetails(trip);
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: SingleChildScrollView(
          child: _buildTripDetailsModal(trip),
        ),
      ),
    ).then((_) {
      controller.closeTripDetails();
    });
  }

  Widget _buildTripDetailsModal(DriverTripItem trip) {
    final displayDistance = (trip.coveredKm != null &&
            trip.coveredKm.toString() != '0.00' &&
            trip.coveredKm.toString() != '0')
        ? '${trip.coveredKm} km'
        : (trip.distanceKm != null ? '${trip.distanceKm} km' : '—');

    return Container(
      margin: const EdgeInsets.only(top: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B2A),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF1C68FD).withOpacity(0.4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.6),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.route, color: Colors.white, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.tripCode ?? 'TRIP-${trip.id ?? "—"}',
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                      ),
                      Text(
                        'driver_routes.trip_summary_title'.tr,
                        style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10),
                      ),
                    ],
                  ),
                ],
              ),
              InkWell(
                onTap: () {
                  controller.closeTripDetails();
                  if (Get.isDialogOpen == true) Get.back();
                },
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(Icons.close, color: Colors.white60, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: Colors.white.withOpacity(0.08), height: 1),
          const SizedBox(height: 12),
          // Corridor route
          _buildInfoRow('driver_routes.corridor_route'.tr, trip.routeName ?? '${trip.origin ?? "—"} \u2794 ${trip.destination ?? "—"}'),
          _buildInfoRow('driver_routes.bus_registration'.tr, trip.busNumber ?? '—', isMono: true),
          _buildInfoRow('driver_routes.distance_covered'.tr, displayDistance),
          _buildInfoRow('driver_routes.departure'.tr, _formatTime(trip.startedAt), isMono: true),
          _buildInfoRow('driver_routes.arrival'.tr, _formatTime(trip.endedAt), isMono: true),
          _buildInfoRow('driver_routes.run_time'.tr, trip.duration ?? _computeDuration(trip.startedAt, trip.endedAt), color: kGreen),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: InkWell(
              onTap: () {
                controller.closeTripDetails();
                if (Get.isDialogOpen == true) Get.back();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: kBorder),
                ),
                child: Text('driver_routes.close'.tr, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // Helper Functions
  // =========================================================================
  Map<String, dynamic> _getShiftBadge(String? shiftType) {
    final type = (shiftType ?? '').toLowerCase();
    if (type.contains('morning')) {
      return {
        'bg': const Color(0xFFFEF3C7).withOpacity(0.15),
        'text': const Color(0xFFFBBF24),
        'label': 'driver_routes.morning_peak'.tr,
      };
    }
    if (type.contains('evening')) {
      return {
        'bg': const Color(0xFFF3E8FF).withOpacity(0.15),
        'text': const Color(0xFFC084FC),
        'label': 'driver_routes.evening_peak'.tr,
      };
    }
    if (type.contains('night')) {
      return {
        'bg': const Color(0xFFE0E7FF).withOpacity(0.15),
        'text': const Color(0xFF818CF8),
        'label': 'driver_routes.night_shuttle'.tr,
      };
    }
    return {
      'bg': const Color(0xFFDBEAFE).withOpacity(0.15),
      'text': const Color(0xFF60A5FA),
      'label': type == 'regular_day' ? 'driver_routes.regular_day'.tr : (shiftType ?? ''),
    };
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return raw;
    }
  }

  String _formatTime(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$hour12:$minute $period';
    } catch (_) {
      return raw;
    }
  }

  String _computeDuration(String? startRaw, String? endRaw) {
    if (startRaw == null || endRaw == null) return '—';
    try {
      final s = DateTime.parse(startRaw).toLocal();
      final e = DateTime.parse(endRaw).toLocal();
      final diff = e.difference(s);
      if (diff.isNegative) return '—';
      final h = diff.inHours;
      final m = diff.inMinutes % 60;
      if (h > 0) return '${h}h ${m}m';
      if (m > 0) return '$m ${'mins_suffix'.tr}';
      return '${diff.inSeconds % 60}s';
    } catch (_) {
      return '—';
    }
  }
}
