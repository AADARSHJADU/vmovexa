import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/incident_model.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/emergency_incidents_controller.dart';

class EmergencyIncidentDetailsView extends GetView<EmergencyIncidentsController> {
  const EmergencyIncidentDetailsView({super.key});

  String _getCategoryLabel(String cat) {
    switch (cat) {
      case 'ALL':
        return 'all_incidents'.tr;
      case 'Accident':
        return 'incident_accident'.tr;
      case 'Breakdown':
        return 'incident_breakdown'.tr;
      case 'Road Condition':
        return 'incident_road_condition'.tr;
      case 'Traffic Issue':
        return 'incident_traffic_issue'.tr;
      case 'Safety Concern':
        return 'incident_safety_concern'.tr;
      case 'Passenger Issue':
        return 'incident_passenger_issue'.tr;
      case 'Infrastructure':
        return 'incident_infrastructure'.tr;
      case 'Other':
        return 'incident_other'.tr;
      default:
        return cat;
    }
  }

  String _getSeverityLabel(String sev) {
    switch (sev.toLowerCase()) {
      case 'low':
        return 'low'.tr.toUpperCase();
      case 'medium':
        return 'medium'.tr.toUpperCase();
      case 'high':
        return 'high'.tr.toUpperCase();
      case 'critical':
        return 'critical'.tr.toUpperCase();
      default:
        return sev.toUpperCase();
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'reported':
        return 'reported'.tr.toUpperCase();
      case 'in_progress':
      case 'in progress':
        return 'in_progress'.tr.toUpperCase();
      case 'investigating':
        return 'investigating'.tr.toUpperCase();
      case 'resolved':
        return 'resolved'.tr.toUpperCase();
      case 'closed':
        return 'closed'.tr.toUpperCase();
      default:
        return status.toUpperCase();
    }
  }

  String _getWeatherLabel(String? w) {
    if (w == null || w.isEmpty) return 'weather_clear'.tr;
    switch (w.toLowerCase()) {
      case 'clear':
        return 'weather_clear'.tr;
      case 'rainy':
      case 'rainy / wet':
        return 'weather_rainy'.tr;
      case 'fog':
      case 'fog / low visibility':
        return 'weather_fog'.tr;
      case 'storm':
      case 'storm / high wind':
        return 'weather_storm'.tr;
      case 'heat':
      case 'extreme heat':
        return 'weather_heat'.tr;
      default:
        return w;
    }
  }

  String _getRoadTypeLabel(String? r) {
    if (r == null || r.isEmpty) return 'road_city_street'.tr;
    switch (r.toLowerCase()) {
      case 'city street':
        return 'road_city_street'.tr;
      case 'highway':
      case 'highway / expressway':
        return 'road_highway'.tr;
      case 'transit corridor':
      case 'transit corridor / bus lane':
        return 'road_transit_corridor'.tr;
      case 'intersection':
      case 'intersection / junction':
        return 'road_intersection'.tr;
      case 'bridge':
      case 'bridge / flyover':
        return 'road_bridge'.tr;
      case 'depot':
      case 'depot / station yard':
        return 'road_depot'.tr;
      default:
        return r;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<EmergencyIncidentsController>()) {
      Get.put(EmergencyIncidentsController());
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopAppBar(),
            Expanded(
              child: Obx(() {
                if (controller.isDetailLoading.value && controller.selectedIncident.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFFEF4444)),
                  );
                }

                final inc = controller.selectedIncident.value;
                if (inc == null) {
                  return Center(
                    child: Text(
                      'no_incident_details_available'.tr,
                      style: const TextStyle(color: Colors.white),
                    ),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card with Severity, Status & Super Admin Clearance Officer Info
                      _buildHeaderCard(inc),
                      const SizedBox(height: 16),

                      // Incident Summary Grid (Driver, Bus, Contact, Recovery)
                      _buildIncidentSummaryBanner(inc),
                      const SizedBox(height: 16),

                      // Vehicle & Driver Details with Direct Calling
                      _buildVehicleDriverCard(inc),
                      const SizedBox(height: 16),

                      // Location & Telemetry with Map Pin Link
                      _buildLocationContextCard(inc),
                      const SizedBox(height: 16),

                      // Emergency Services, Hospitalization & Police Audit
                      _buildEmergencyServicesCard(inc),
                      const SizedBox(height: 16),

                      // Driver Statement & Description
                      _buildStatementAndActionCard(inc),
                      const SizedBox(height: 16),

                      // DRIVER ASSESSMENT SECTION (Notes shift here)
                      _buildDriverAssessmentSection(inc),
                      const SizedBox(height: 16),

                      // Photos & Video Evidence Galleries
                      if (inc.photos.isNotEmpty || inc.videos.isNotEmpty) ...[
                        _buildEvidenceGalleries(context, inc),
                        const SizedBox(height: 16),
                      ],

                      // Control Room Dispatch Action Form (Super Admin Policy Enforced)
                      _buildDispatchActionCard(inc),
                      const SizedBox(height: 40),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(() {
            final inc = controller.selectedIncident.value;
            final title = inc != null ? '${'incident'.tr} #${inc.id}' : 'incident_detail'.tr;
            return Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            );
          }),
          IconButton(
            onPressed: () {
              final inc = controller.selectedIncident.value;
              if (inc != null) {
                controller.selectIncidentForDetail(inc);
              }
            },
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 1. HEADER CARD WITH STATUS & AUTHORITY
  // ==========================================

  Widget _buildHeaderCard(IncidentItemModel inc) {
    final dateStr = inc.createdAt != null && inc.createdAt!.isNotEmpty
        ? DateFormat('dd MMM yyyy · hh:mm a').format(DateTime.tryParse(inc.createdAt!) ?? DateTime.now())
        : 'recorded'.tr;

    final isResolved = ['resolved', 'closed'].contains(inc.status.toLowerCase());

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: inc.severityColor.withValues(alpha: 0.4),
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _getCategoryLabel(inc.incidentType),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              // Severity Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: inc.severityColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: inc.severityColor.withValues(alpha: 0.5)),
                ),
                child: Text(
                  _getSeverityLabel(inc.severity),
                  style: TextStyle(
                    color: inc.severityColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: inc.statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: inc.statusColor.withValues(alpha: 0.5)),
                ),
                child: Text(
                  _getStatusLabel(inc.status),
                  style: TextStyle(
                    color: inc.statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 13, color: Colors.grey),
              const SizedBox(width: 4),
              Text(
                dateStr,
                style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isResolved
                  ? const Color(0xFF10B981).withValues(alpha: 0.15)
                  : const Color(0xFFF59E0B).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: isResolved
                    ? const Color(0xFF10B981).withValues(alpha: 0.4)
                    : const Color(0xFFF59E0B).withValues(alpha: 0.4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isResolved ? Icons.verified_user_rounded : Icons.lock_outline_rounded,
                  size: 11,
                  color: isResolved ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                ),
                const SizedBox(width: 4),
                Text(
                  isResolved ? 'super_admin_cleared'.tr : 'pending_super_admin_clearance'.tr,
                  style: TextStyle(
                    color: isResolved ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 2. INCIDENT SUMMARY BANNER (4-Grid)
  // ==========================================

  Widget _buildIncidentSummaryBanner(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('assigned_driver_caps'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(inc.displayDriverName, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('vehicle_unit_caps'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(inc.displayVehicleNumber, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 18),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('driver_contact_status_label'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Icon(
                          inc.contactedDriver ? Icons.phone_in_talk_rounded : Icons.pending_actions_rounded,
                          size: 13,
                          color: inc.contactedDriver ? const Color(0xFF60A5FA) : const Color(0xFFFBBF24),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            inc.contactedDriver ? 'contacted_acknowledged'.tr : 'pending_driver_contact'.tr,
                            style: TextStyle(
                              color: inc.contactedDriver ? const Color(0xFF60A5FA) : const Color(0xFFFBBF24),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('site_recovery_label'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 9.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Icon(
                          inc.recovered ? Icons.check_circle_rounded : Icons.access_time_rounded,
                          size: 13,
                          color: inc.recovered ? const Color(0xFF34D399) : Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            inc.recovered ? 'recovered_cleared'.tr : 'pending_recovery'.tr,
                            style: TextStyle(
                              color: inc.recovered ? const Color(0xFF34D399) : Colors.grey.shade400,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
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

  // ==========================================
  // 3. VEHICLE & DRIVER CARD
  // ==========================================

  Widget _buildVehicleDriverCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'vehicle_driver_contact'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13.5,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B82F6), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inc.displayVehicleNumber,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'assigned_fleet_vehicle_unit'.tr,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person_rounded, color: Color(0xFF10B981), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      inc.displayDriverName,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      inc.displayDriverPhone.isNotEmpty ? inc.displayDriverPhone : 'no_contact_phone_recorded'.tr,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                    ),
                  ],
                ),
              ),
              if (inc.displayDriverPhone.isNotEmpty)
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.phone, size: 15, color: Colors.white),
                    label: Text('call'.tr, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold)),
                    onPressed: () async {
                      final uri = Uri.parse('tel:${inc.displayDriverPhone}');
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri);
                      }
                    },
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4. LOCATION & TELEMETRY WITH MAP PIN LINK
  // ==========================================

  Widget _buildLocationContextCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'scene_location_telemetry'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (inc.location != null && inc.location!.isNotEmpty) ...[
            _buildInfoRow(Icons.location_on_rounded, 'location'.tr, inc.location!),
            const SizedBox(height: 8),
          ],
          if (inc.landmark != null && inc.landmark!.isNotEmpty) ...[
            _buildInfoRow(Icons.flag_rounded, 'landmark'.tr, inc.landmark!),
            const SizedBox(height: 8),
          ],
          if (inc.latitude != null && inc.longitude != null) ...[
            Row(
              children: [
                const Icon(Icons.my_location_rounded, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('gps_pin_colon'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.w500)),
                        Text('${inc.latitude}, ${inc.longitude}', style: const TextStyle(color: Color(0xFF34D399), fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold))
                      ],
                    ),
                    const SizedBox(height: 5),
                    GestureDetector(
                      onTap: () async {
                        final mapUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=${inc.latitude},${inc.longitude}');
                        if (await canLaunchUrl(mapUrl)) {
                          await launchUrl(mapUrl, mode: LaunchMode.externalApplication);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        ),
                        child: Text('view_map_action'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          _buildInfoRow(
            Icons.cloud_queue_rounded,
            'road_and_weather'.tr,
            '${_getWeatherLabel(inc.weatherConditions)} · ${_getRoadTypeLabel(inc.roadType)}',
          ),
          if (inc.trafficDisruptionLevel != null && inc.trafficDisruptionLevel != 'none') ...[
            const SizedBox(height: 8),
            _buildInfoRow(Icons.traffic_rounded, 'traffic_disruption'.tr, inc.trafficDisruptionLevel!.toUpperCase().replaceAll('_', ' ')),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // 5. EMERGENCY SERVICES & MEDICAL INFO
  // ==========================================

  Widget _buildEmergencyServicesCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'emergency_medical_police_audit'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          // Casualties row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('fatalities_caps'.tr, style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text('${inc.deadCasualty}', style: const TextStyle(color: Color(0xFFEF4444), fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('injured_persons_caps'.tr, style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 9.5, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text('${inc.injuredCount}', style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (inc.hospitalName != null && inc.hospitalName!.isNotEmpty) ...[
            _buildInfoRow(Icons.local_hospital_rounded, 'hospital'.tr, inc.hospitalName!),
            const SizedBox(height: 8),
          ],
          _buildInfoRow(
            Icons.medical_services_rounded,
            'ambulance_label'.tr,
            inc.ambulanceAssigned
                ? 'ambulance_status_assigned'.trParams({'timing': inc.ambulanceTiming ?? 'dispatched'.tr})
                : 'ambulance_status_not_assigned'.tr,
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            Icons.local_police_rounded,
            'police_fir_station'.tr,
            inc.policeNotified
                ? 'police_status_notified'.trParams({'station': inc.policeStationName ?? 'Notified'})
                : 'police_status_none'.tr,
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            Icons.car_repair_rounded,
            'roadside_towing'.tr,
            inc.towingRequested ? 'towing_status_requested'.tr : 'towing_status_none'.tr,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 6. STATEMENT & IMMEDIATE ACTION
  // ==========================================

  Widget _buildStatementAndActionCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'incident_driver_statement_desc'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Text(
            inc.description.isNotEmpty ? inc.description : 'no_detailed_desc_provided'.tr,
            style: TextStyle(color: Colors.grey.shade300, fontSize: 12.5, height: 1.45),
          ),
          if (inc.immediateAction != null && inc.immediateAction!.isNotEmpty) ...[
            const Divider(color: AppColors.cardBorder, height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.flash_on_rounded, size: 16, color: Color(0xFFFBBF24)),
                const SizedBox(width: 8),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 12, height: 1.4),
                      children: [
                        TextSpan(text: 'immediate_action_taken_on_scene'.tr, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        TextSpan(text: inc.immediateAction!, style: TextStyle(color: Colors.grey.shade300)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // 7. DRIVER ASSESSMENT SECTION (Notes Shift Here)
  // ==========================================

  Widget _buildDriverAssessmentSection(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2563EB).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.record_voice_over_rounded, color: Color(0xFF60A5FA), size: 18),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'driver_assessment_voice_title'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          inc.contactedDriver ? 'contact_logged_badge'.tr : 'pending_call_badge'.tr,
                          style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Driver Voice Notes
          if (inc.contactNotes != null && inc.contactNotes!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('driver_voice_assessment_caps'.tr, style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 4),
                  Text(
                    inc.contactNotes!,
                    style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],

          // Resolution / Field Notes
          if (inc.resolutionNotes != null && inc.resolutionNotes!.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('field_remarks_dispatch_caps'.tr, style: const TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 4),
                  Text(
                    inc.resolutionNotes!,
                    style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
          ],

          // If no notes recorded yet
          if ((inc.contactNotes == null || inc.contactNotes!.isEmpty) &&
              (inc.resolutionNotes == null || inc.resolutionNotes!.isEmpty)) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.grey, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'no_driver_assessment_notes_yet'.tr,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 11, height: 1.35),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // 8. EVIDENCE GALLERIES (Photo & Video Preview)
  // ==========================================

  Widget _buildEvidenceGalleries(BuildContext context, IncidentItemModel inc) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Photos Gallery
        if (inc.photos.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.photo_camera_rounded, color: Color(0xFF3B82F6), size: 18),
                        const SizedBox(width: 8),
                        Text('photo_evidence_count'.trParams({'count': inc.photos.length.toString()}), style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Text('tap_photo_to_preview'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 90,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: inc.photos.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final photoUrl = ApiConstants.resolveFileUrl(inc.photos[index]);
                      return GestureDetector(
                        onTap: () => _showPhotoPreviewDialog(context, inc.photos[index], index, inc.photos.length),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Stack(
                            children: [
                              Image.network(
                                photoUrl,
                                width: 110,
                                height: 90,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Container(
                                  width: 110,
                                  height: 90,
                                  color: AppColors.background,
                                  child: const Icon(Icons.broken_image, color: Colors.grey),
                                ),
                              ),
                              Positioned(
                                bottom: 4,
                                left: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.7), borderRadius: BorderRadius.circular(4)),
                                  child: Text('${'photo'.tr} #${index + 1}', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
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
          ),
          const SizedBox(height: 14),
        ],

        // Videos Gallery
        if (inc.videos.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.videocam_rounded, color: Color(0xFFA855F7), size: 18),
                        const SizedBox(width: 8),
                        Text('video_recordings_count'.trParams({'count': inc.videos.length.toString()}), style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Text('tap_video_to_play'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 90,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: inc.videos.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final videoUrl = inc.videos[index];
                      return GestureDetector(
                        onTap: () => _showVideoPreviewDialog(context, videoUrl, index, inc.videos.length),
                        child: Container(
                          width: 140,
                          height: 90,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.4)),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.play_circle_fill_rounded, color: Color(0xFFA855F7), size: 32),
                              const SizedBox(height: 4),
                              Text('${'video'.tr} #${index + 1}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                              Text('tap_to_view'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 9.5)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ==========================================
  // 9. DISPATCH ACTION CARD (SUPER ADMIN POLICY ENFORCED)
  // ==========================================

  Widget _buildDispatchActionCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF3B82F6).withValues(alpha: 0.5),
          width: 1.4,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.assignment_turned_in_rounded, color: Color(0xFF60A5FA), size: 18),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'control_room_dispatch_action'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                        ),
                        child: Text('status_clearance_restricted'.tr, style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9.5, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 12),

          // Super Admin Authority Policy Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.lock_rounded, color: Color(0xFFFBBF24), size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'super_admin_policy_title'.tr,
                        style: const TextStyle(color: Color(0xFFFDE68A), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'super_admin_policy_desc'.tr,
                        style: TextStyle(color: Colors.grey.shade300, fontSize: 10.5, height: 1.35),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Status Selector (Locked for Fleet Operator)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('update_incident_status_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.lock_rounded, size: 11, color: Color(0xFFFBBF24)),
              const SizedBox(width: 3),
              Text('locked_super_admin_only'.tr, style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9.5, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () => controller.notifyStatusRestricted(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'current_status_label'.trParams({'status': _getStatusLabel(inc.status)}),
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(4)),
                    child: Text('super_admin_only_badge'.tr, style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Driver Voice Contact Notes & Assessment (Available to Fleet Operator)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF2563EB).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Obx(() {
                  return Row(
                    children: [
                      Checkbox(
                        value: controller.contactedDriver.value,
                        activeColor: const Color(0xFF2563EB),
                        onChanged: (val) => controller.contactedDriver.value = val ?? false,
                      ),
                      Expanded(
                        child: Text(
                          'mark_driver_contacted_checkbox'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  );
                }),
                const SizedBox(height: 6),
                Text(
                  'driver_voice_contact_notes_label'.tr,
                  style: TextStyle(color: Colors.grey.shade300, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                TextField(
                  controller: controller.contactNotesController,
                  maxLines: 2,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'driver_voice_contact_notes_hint'.tr,
                    hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                    filled: true,
                    fillColor: AppColors.inputBg,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.inputBorder)),
                    contentPadding: const EdgeInsets.all(10),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'notes_shift_helper_text'.tr,
                  style: TextStyle(color: Colors.blue.shade300, fontSize: 10, fontStyle: FontStyle.italic),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Bottom Checkbox: Vehicle & Site Recovered (LOCKED FOR FLEET OPERATOR)
          GestureDetector(
            onTap: () => controller.toggleRecovered(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: Row(
                children: [
                  Obx(() {
                    return Checkbox(
                      value: controller.recovered.value,
                      activeColor: const Color(0xFF10B981),
                      onChanged: (_) => controller.toggleRecovered(),
                    );
                  }),
                  Expanded(
                    child: Text(
                      'vehicle_recovered_checkbox_label'.tr,
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 11.5, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.lock_rounded, size: 10, color: Color(0xFFFBBF24)),
                        const SizedBox(width: 3),
                        Text('super_admin_only_badge'.tr, style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Field Remarks & Dispatch Notes Textarea
          Text('field_remarks_dispatch_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.resolutionNotesController,
            maxLines: 3,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'field_remarks_dispatch_hint'.tr,
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 18),

          // Submit Button (Word "Resolve" replaced completely)
          Obx(() {
            return SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: controller.isUpdatingResolution.value ? null : () => controller.saveResolution(),
                icon: controller.isUpdatingResolution.value
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.phone_in_talk_rounded, size: 16, color: Colors.white),
                label: Text(
                  controller.isUpdatingResolution.value ? 'saving_notes'.tr : 'save_driver_voice_contact_notes'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  // ==========================================
  // SHARED INFO ROW HELPER
  // ==========================================

  Widget _buildInfoRow(IconData icon, String title, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: Colors.grey.shade400),
        const SizedBox(width: 8),
        Text(
          '$title: ',
          style: TextStyle(color: Colors.grey.shade400, fontSize: 12, fontWeight: FontWeight.w500),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // PHOTO & VIDEO PREVIEW DIALOGS
  // ==========================================

  void _showPhotoPreviewDialog(BuildContext context, String photoUrl, int index, int total) {
    final resolved = ApiConstants.resolveFileUrl(photoUrl);
    final isNetwork = resolved.startsWith('http://') || resolved.startsWith('https://');

    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.photo_rounded, color: Color(0xFF38BDF8), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'incident_photo_preview_header'.trParams({'curr': (index + 1).toString(), 'total': total.toString()}),
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 22),
                      onPressed: () => Get.back(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFF334155)),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.65,
                  maxWidth: MediaQuery.of(context).size.width,
                ),
                child: InteractiveViewer(
                  panEnabled: true,
                  boundaryMargin: const EdgeInsets.all(20),
                  minScale: 0.5,
                  maxScale: 4.0,
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    child: isNetwork
                        ? Image.network(
                            resolved,
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return const SizedBox(
                                height: 250,
                                child: Center(
                                  child: CircularProgressIndicator(color: Color(0xFF38BDF8), strokeWidth: 2),
                                ),
                              );
                            },
                            errorBuilder: (_, _, _) => Container(
                              height: 200,
                              color: Colors.black26,
                              child: const Center(
                                child: Icon(Icons.broken_image_rounded, color: Colors.white38, size: 48),
                              ),
                            ),
                          )
                        : Image.file(
                            File(photoUrl),
                            fit: BoxFit.contain,
                            errorBuilder: (_, _, _) => Container(
                              height: 200,
                              color: Colors.black26,
                              child: const Center(
                                child: Icon(Icons.broken_image_rounded, color: Colors.white38, size: 48),
                              ),
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVideoPreviewDialog(BuildContext context, String videoUrl, int index, int total) {
    final resolved = ApiConstants.resolveFileUrl(videoUrl);

    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.videocam_rounded, color: Color(0xFFA855F7), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'video_evidence_preview_header'.trParams({'curr': (index + 1).toString(), 'total': total.toString()}),
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 28),
                decoration: BoxDecoration(
                  color: Colors.black38,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.play_circle_fill_rounded, color: Color(0xFFA855F7), size: 54),
                    const SizedBox(height: 12),
                    Text(
                      '${'video'.tr} #${index + 1}',
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        videoUrl,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    try {
                      final uri = Uri.parse(resolved);
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } catch (e) {
                      Get.snackbar(
                        'notice'.tr,
                        'could_not_open_video_player'.trParams({'err': e.toString()}),
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: const Color(0xFFEF4444),
                        colorText: Colors.white,
                      );
                    }
                  },
                  icon: const Icon(Icons.open_in_new_rounded, size: 16, color: Colors.white),
                  label: Text('open_play_video'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFA855F7),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
