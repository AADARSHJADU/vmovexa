import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class ReviewIncidentView extends GetView<ReportIncidentController> {
  const ReviewIncidentView({super.key});

  static const Color kBg = IncidentDetailsView.kBg;
  static const Color kCardBg = IncidentDetailsView.kCardBg;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;

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
                  _buildStepper(),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildSectionHeader(
                    title: 'driver_incident.step_4_title'.tr,
                    subtitle: 'driver_incident.step_4_sub'.tr,
                  ),
                  const SizedBox(height: 14),
                  _buildReviewCard(),
                  const SizedBox(height: 16),
                  _buildDisclaimerNotice(),
                ],
              ),
            ),
            _buildFooterButtons(),
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
          onTap: controller.onStep4BackPressed,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'report_incident'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 2),
              Text(
                'driver_incident.hero_desc'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          ),
          child: Text(
            '${'driver_incident.step_indicator'.tr} 4 ${'driver_incident.of_4'.tr}',
            style: const TextStyle(color: Color(0xFFF87171), fontSize: 11, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }

  // ---------------- 4-Step Stepper Bar ----------------
  Widget _buildStepper() {
    return Obx(
      () => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
        ),
        child: Row(
          children: List.generate(controller.stepLabels.length, (index) {
            final stepNumber = index + 1;
            final isActive = stepNumber == controller.currentStep.value;
            final isCompleted = stepNumber < controller.currentStep.value;
            final isLast = stepNumber == controller.stepLabels.length;

            return Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: (isActive || isCompleted) ? AppTheme.primaryGradient : null,
                            color: (isActive || isCompleted) ? null : kFieldBg,
                            border: Border.all(
                              color: isActive ? Colors.transparent : (isCompleted ? Colors.transparent : Colors.white24),
                              width: isActive ? 2 : 1,
                            ),
                            boxShadow: isActive
                                ? [
                                    BoxShadow(
                                      color: AppTheme.gradientBlue.withValues(alpha: 0.4),
                                      blurRadius: 8,
                                    ),
                                  ]
                                : null,
                          ),
                          child: isCompleted
                              ? const Icon(Icons.check, color: Colors.white, size: 14)
                              : Text(
                                  '$stepNumber',
                                  style: TextStyle(
                                    color: isActive ? Colors.white : Colors.white38,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          controller.stepLabels[index],
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isActive ? Colors.white : (isCompleted ? Colors.white70 : Colors.white38),
                            fontSize: 9.5,
                            fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!isLast)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: SizedBox(
                        width: 10,
                        child: Divider(
                          color: isCompleted ? AppTheme.gradientBlue : Colors.white12,
                          thickness: 1.5,
                        ),
                      ),
                    ),
                ],
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildSectionHeader({required String title, required String subtitle}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
      ],
    );
  }

  // ---------------- Review Card (Summary of All 4 Steps) ----------------
  Widget _buildReviewCard() {
    return Obx(() {
      final incType = controller.selectedIncidentType.value;
      final fullLoc = controller.addressCtrl.text.trim().isNotEmpty
          ? controller.addressCtrl.text.trim()
          : (controller.locationCtrl.text.trim().isNotEmpty ? controller.locationCtrl.text.trim() : '—');
      final coordsStr = controller.hasLocationPin.value
          ? '(${controller.currentLat.value.toStringAsFixed(4)}, ${controller.currentLng.value.toStringAsFixed(4)})'
          : '';
      final landmarkStr = controller.landmarkCtrl.text.trim().isNotEmpty
          ? ' · ${controller.landmarkCtrl.text.trim()}'
          : '';

      final sev = controller.severity.value;
      Color sevColor;
      switch (sev) {
        case IncidentSeverity.critical:
          sevColor = const Color(0xFFEF4444);
          break;
        case IncidentSeverity.high:
          sevColor = const Color(0xFFF97316);
          break;
        case IncidentSeverity.medium:
          sevColor = const Color(0xFFF59E0B);
          break;
        case IncidentSeverity.low:
          sevColor = const Color(0xFF10B981);
          break;
      }

      final hosp = controller.hospitalNameCtrl.text.trim().isNotEmpty ? controller.hospitalNameCtrl.text.trim() : 'no_hospital_specified'.tr;
      final casualtiesStr = '${controller.deadCasualty.value} ${'fatalities'.tr} · ${controller.injuredCount.value} ${'injured_count'.tr} ($hosp)';

      final yesText = 'yes'.tr;
      final noText = 'no'.tr;
      final ambulanceStr = controller.ambulanceAssigned.value ? yesText : noText;
      final policeStr = controller.policeNotified.value ? yesText : noText;
      final towingStr = controller.towingRequested.value ? yesText : noText;
      final assistanceStr = '${'ambulance_label'.tr}: $ambulanceStr | ${'police_label'.tr}: $policeStr | ${'towing_label'.tr}: $towingStr';

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Column(
          children: [
            // Incident Category
            _buildReviewRow(
              label: 'driver_incident.review_category'.tr,
              valueWidget: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(incType.icon, color: const Color(0xFFC084FC), size: 16),
                  const SizedBox(width: 6),
                  Text(incType.label, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            _divider(),

            // Description
            _buildReviewRow(
              label: 'driver_incident.review_desc'.tr,
              valueWidget: Text(
                controller.descriptionCtrl.text.trim().isEmpty ? '—' : controller.descriptionCtrl.text.trim(),
                textAlign: TextAlign.right,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            _divider(),

            // Location & GPS
            _buildReviewRow(
              label: 'driver_incident.review_loc_gps'.tr,
              valueWidget: Text(
                '$fullLoc $coordsStr$landmarkStr',
                textAlign: TextAlign.right,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
              ),
            ),
            _divider(),

            // Disruption Severity
            _buildReviewRow(
              label: 'driver_incident.review_severity'.tr,
              valueWidget: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 8, height: 8, decoration: BoxDecoration(color: sevColor, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text(sev.label, style: TextStyle(color: sevColor, fontSize: 12, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
            _divider(),

            // Weather & Road Type
            _buildReviewRow(
              label: 'review_environment'.tr,
              valueWidget: Text(
                '${_getWeatherLabel(controller.weatherConditions.value)} · ${_getRoadTypeLabel(controller.roadType.value)}',
                style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600),
              ),
            ),
            _divider(),

            // Attached Media
            _buildReviewRow(
              label: 'driver_incident.review_media'.tr,
              valueWidget: Text(
                '${controller.photoPaths.length} ${'photos_count'.tr} · ${controller.videoPaths.length} ${'videos_count'.tr}',
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
            _divider(),

            // Medical Casualties
            _buildReviewRow(
              label: 'driver_incident.review_casualties'.tr,
              valueWidget: Text(
                casualtiesStr,
                textAlign: TextAlign.right,
                maxLines: 2,
                style: const TextStyle(color: Color(0xFFF87171), fontSize: 11.5, fontWeight: FontWeight.bold),
              ),
            ),
            _divider(),

            // Assistance Requested
            _buildReviewRow(
              label: 'driver_incident.review_assistance'.tr,
              valueWidget: Text(
                assistanceStr,
                textAlign: TextAlign.right,
                maxLines: 2,
                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ),
            _divider(),

            // Affected Parties
            _buildReviewRow(
              label: 'review_affected_parties'.tr,
              valueWidget: Text(
                controller.affectedPartiesText,
                textAlign: TextAlign.right,
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
    });
  }

  String _getWeatherLabel(String key) {
    switch (key) {
      case 'Heavy Rain':
        return 'driver_incident.weather_rain'.tr;
      case 'Fog / Smog':
        return 'driver_incident.weather_fog'.tr;
      case 'Night / Dark':
        return 'driver_incident.weather_night'.tr;
      case 'Storm / Wind':
        return 'driver_incident.weather_storm'.tr;
      case 'Clear':
      default:
        return 'driver_incident.weather_clear'.tr;
    }
  }

  String _getRoadTypeLabel(String key) {
    switch (key) {
      case 'Express Highway':
        return 'driver_incident.road_highway'.tr;
      case 'Flyover Bridge':
        return 'driver_incident.road_bridge'.tr;
      case 'Bus Stop Bay':
        return 'driver_incident.road_bus_bay'.tr;
      case 'Depot Junction':
        return 'driver_incident.road_depot'.tr;
      case 'City Street':
      default:
        return 'driver_incident.road_city_street'.tr;
    }
  }

  Widget _buildReviewRow({required String label, required Widget valueWidget}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: 14),
          Flexible(child: valueWidget),
        ],
      ),
    );
  }

  Widget _divider() {
    return Divider(color: Colors.white.withValues(alpha: 0.05), height: 16);
  }

  // ---------------- Emergency NOC Broadcast Disclaimer ----------------
  Widget _buildDisclaimerNotice() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2563EB).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded, color: Color(0xFF60A5FA), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'incident_submit_broadcast_warning'.tr,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 10.5, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer Buttons ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onStep4BackPressed,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.arrow_back, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    Text('driver_incident.back_btn'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Obx(
              () => GestureDetector(
                onTap: controller.isSubmitting.value ? null : controller.onSubmitIncident,
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientBlue.withValues(alpha: 0.4),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: controller.isSubmitting.value
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'driver_incident.submit_btn'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
