import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class AdditionalInformationView extends GetView<ReportIncidentController> {
  const AdditionalInformationView({super.key});

  static const Color kBg = IncidentDetailsView.kBg;
  static const Color kCardBg = IncidentDetailsView.kCardBg;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;
  static const Color kPurple = IncidentDetailsView.kPurple;

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
                    title: 'driver_incident.step_3_title'.tr,
                    subtitle: 'driver_incident.step_3_sub'.tr,
                  ),
                  const SizedBox(height: 14),
                  _buildSectionLabel('driver_incident.severity_req'.tr, required: true),
                  const SizedBox(height: 8),
                  _buildSeverityGrid(),
                  const SizedBox(height: 18),
                  _buildEmergencyMedicalBox(),
                  const SizedBox(height: 18),
                  _buildPoliceAndTowingAssistance(),
                  const SizedBox(height: 18),
                  _buildSectionLabel('driver_incident.who_affected'.tr, required: false),
                  const SizedBox(height: 8),
                  _buildAffectedPartiesGrid(),
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
          onTap: controller.onStep3BackPressed,
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
            '${'driver_incident.step_indicator'.tr} 3 ${'driver_incident.of_4'.tr}',
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

  Widget _buildSectionLabel(String text, {required bool required}) {
    return RichText(
      text: TextSpan(
        text: text,
        style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
        children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
      ),
    );
  }

  // ---------------- Severity Grid (4 Options) ----------------
  Widget _buildSeverityGrid() {
    return Obx(
      () => GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 2.1,
        children: IncidentSeverity.values.map((sev) {
          final isSelected = controller.severity.value == sev;
          Color color;
          switch (sev) {
            case IncidentSeverity.critical:
              color = const Color(0xFFEF4444);
              break;
            case IncidentSeverity.high:
              color = const Color(0xFFF97316);
              break;
            case IncidentSeverity.medium:
              color = const Color(0xFFF59E0B);
              break;
            case IncidentSeverity.low:
              color = const Color(0xFF10B981);
              break;
          }

          return GestureDetector(
            onTap: () => controller.setSeverity(sev),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E1E2F) : kCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? color : Colors.white.withValues(alpha: 0.08),
                  width: isSelected ? 1.5 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: color.withValues(alpha: 0.25),
                          blurRadius: 8,
                        ),
                      ]
                    : null,
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          sev.label,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.white70,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          sev.description,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 9.5),
                        ),
                      ],
                    ),
                  ),
                  if (isSelected)
                    Icon(Icons.check_circle_rounded, color: color, size: 16),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ---------------- Emergency Medical & Casualties Box ----------------
  Widget _buildEmergencyMedicalBox() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF7F1D1D).withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emergency_rounded, color: Color(0xFFF87171), size: 18),
              const SizedBox(width: 8),
              Text(
                'driver_incident.medical_details'.tr,
                style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 12, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Counters Row (Fatalities & Injured)
          Row(
            children: [
              Expanded(
                child: _buildCounterCard(
                  label: 'driver_incident.fatalities_label'.tr,
                  countRx: controller.deadCasualty,
                  accentColor: const Color(0xFFEF4444),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildCounterCard(
                  label: 'driver_incident.injured_label'.tr,
                  countRx: controller.injuredCount,
                  accentColor: const Color(0xFFF59E0B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Admitted Hospital Name
          Text(
            'driver_incident.admitted_hospital'.tr,
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: controller.hospitalNameCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'driver_incident.admitted_hospital_ph'.tr,
                hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Ambulance Assigned Toggle
          Obx(
            () => Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'driver_incident.ambulance_assigned'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                      ),
                      GestureDetector(
                        onTap: () => controller.ambulanceAssigned.value = !controller.ambulanceAssigned.value,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                          decoration: BoxDecoration(
                            color: controller.ambulanceAssigned.value ? const Color(0xFFDC2626) : Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            controller.ambulanceAssigned.value ? 'driver_incident.yes'.tr : 'driver_incident.no'.tr,
                            style: TextStyle(
                              color: controller.ambulanceAssigned.value ? Colors.white : Colors.white70,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (controller.ambulanceAssigned.value) ...[
                    const SizedBox(height: 8),
                    TextField(
                      controller: controller.ambulanceTimingCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 11.5),
                      decoration: InputDecoration(
                        hintText: 'driver_incident.ambulance_time_ph'.tr,
                        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
                        filled: true,
                        fillColor: const Color(0xFF1B1B27),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCounterCard({
    required String label,
    required RxInt countRx,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () {
                  if (countRx.value > 0) countRx.value--;
                },
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.remove, color: Colors.white, size: 16),
                ),
              ),
              Obx(
                () => Text(
                  '${countRx.value}',
                  style: TextStyle(color: accentColor, fontSize: 18, fontWeight: FontWeight.w900),
                ),
              ),
              GestureDetector(
                onTap: () => countRx.value++,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.add, color: accentColor, size: 16),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Police & Towing Assistance ----------------
  Widget _buildPoliceAndTowingAssistance() {
    return Column(
      children: [
        // Police Notified
        Obx(
          () => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_police_outlined, color: Color(0xFF60A5FA), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'driver_incident.police_notified_fir'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => controller.policeNotified.value = !controller.policeNotified.value,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: controller.policeNotified.value ? const Color(0xFF2563EB) : Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          controller.policeNotified.value ? 'driver_incident.yes'.tr : 'driver_incident.no'.tr,
                          style: TextStyle(
                            color: controller.policeNotified.value ? Colors.white : Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                if (controller.policeNotified.value) ...[
                  const SizedBox(height: 8),
                  TextField(
                    controller: controller.policeStationNameCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5),
                    decoration: InputDecoration(
                      hintText: 'driver_incident.police_fir_ph'.tr,
                      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
                      filled: true,
                      fillColor: const Color(0xFF1B1B27),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Towing Assistance & Traffic Disruption Row
        Row(
          children: [
            // Towing toggle
            Expanded(
              child: Obx(
                () => Container(
                  height: 80,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'driver_incident.towing_assistance'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'driver_incident.towing_request_hint'.tr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white38, fontSize: 9),
                            ),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () => controller.towingRequested.value = !controller.towingRequested.value,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: controller.towingRequested.value ? const Color(0xFFD97706) : Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            controller.towingRequested.value ? 'driver_incident.requested'.tr : 'driver_incident.no'.tr,
                            style: TextStyle(
                              color: controller.towingRequested.value ? Colors.white : Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),

            // Traffic Disruption Dropdown
            Expanded(
              child: Obx(
                () => Container(
                  height: 80,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'driver_incident.traffic_disruption_lvl'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: controller.trafficDisruptionLevel.value,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1B1B27),
                          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54, size: 18),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                          items: controller.trafficDisruptionOptions.map((opt) {
                            return DropdownMenuItem<String>(
                              value: opt,
                              child: Text(
                                _getTrafficDisruptionLabel(opt),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) controller.trafficDisruptionLevel.value = val;
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _getTrafficDisruptionLabel(String key) {
    switch (key) {
      case 'minor_delay':
        return 'driver_incident.traffic_minor'.tr;
      case 'lane_blocked':
        return 'driver_incident.traffic_lane_blocked'.tr;
      case 'total_gridlock':
        return 'driver_incident.traffic_gridlock'.tr;
      case 'none':
      default:
        return 'driver_incident.traffic_none'.tr;
    }
  }

  // ---------------- Affected Parties (Chips) ----------------
  Widget _buildAffectedPartiesGrid() {
    return Obx(
      () => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: AffectedParty.values.map((party) {
          final isSelected = controller.affectedParties.contains(party);
          return GestureDetector(
            onTap: () => controller.toggleAffectedParty(party),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF2563EB) : kCardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? const Color(0xFF3B82F6) : Colors.white.withValues(alpha: 0.08),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isSelected ? Icons.check : Icons.add,
                    color: isSelected ? Colors.white : Colors.white38,
                    size: 14,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    party.label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
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
              onTap: controller.onStep3BackPressed,
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
            child: GestureDetector(
              onTap: controller.onStep3NextPressed,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.gradientBlue.withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'driver_incident.next_review'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
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
}
