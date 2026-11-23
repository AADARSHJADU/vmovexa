import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../model/incident_type_model.dart';

class IncidentDetailsView extends GetView<ReportIncidentController> {
  const IncidentDetailsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);

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
                    title: 'driver_incident.step_1_title'.tr,
                    subtitle: 'driver_incident.step_1_sub'.tr,
                  ),
                  const SizedBox(height: 12),
                  _buildIncidentTypeGrid(),
                  const SizedBox(height: 20),
                  _buildSectionLabel('defect_description'.tr, required: true),
                  const SizedBox(height: 10),
                  _buildDescriptionField(),
                  const SizedBox(height: 20),
                  _buildContextSelectorsRow(),
                  const SizedBox(height: 16),
                  _buildDateTimeCard(),
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
          onTap: controller.onCancel,
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
            '${'driver_incident.step_indicator'.tr} 1 ${'driver_incident.of_4'.tr}',
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
        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
        children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
      ),
    );
  }

  // ---------------- Incident type grid (8 Categories) ----------------
  Widget _buildIncidentTypeGrid() {
    return Obx(() {
      final selectedType = controller.selectedIncidentType.value;
      final error = controller.incidentTypeError.value;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: IncidentType.values.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) {
              final type = IncidentType.values[index];
              final isSelected = selectedType == type;

              return _IncidentTypeCard(
                type: type,
                isSelected: isSelected,
                onTap: () => controller.selectIncidentType(type),
              );
            },
          ),
          if (error != null && error.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              error,
              style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5),
            ),
          ],
        ],
      );
    });
  }

  // ---------------- Description Field ----------------
  Widget _buildDescriptionField() {
    return Obx(
      () => Container(
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: controller.descriptionError.value != null ? const Color(0xFFFF4D4D) : Colors.white.withValues(alpha: 0.08),
          ),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              controller: controller.descriptionCtrl,
              maxLines: 4,
              maxLength: ReportIncidentController.descriptionMaxLen,
              style: const TextStyle(color: Colors.white, fontSize: 12.5),
              decoration: InputDecoration(
                hintText: 'brief_desc_hint'.tr,
                hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 12),
                border: InputBorder.none,
                counterText: '',
                contentPadding: EdgeInsets.zero,
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  '${controller.descriptionLen.value}/${ReportIncidentController.descriptionMaxLen}',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 10),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Weather & Road Type Row ----------------
  Widget _buildContextSelectorsRow() {
    return Row(
      children: [
        // Weather Conditions Dropdown
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionLabel('driver_incident.weather_conditions'.tr, required: false),
              const SizedBox(height: 8),
              Obx(
                () => Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.weatherConditions.value,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1B1B27),
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54, size: 20),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      items: controller.weatherOptions.map((opt) {
                        return DropdownMenuItem<String>(
                          value: opt,
                          child: Text(
                            _getWeatherLabel(opt),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) controller.weatherConditions.value = val;
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        // Road Type Dropdown
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionLabel('driver_incident.road_type'.tr, required: false),
              const SizedBox(height: 8),
              Obx(
                () => Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.roadType.value,
                      isExpanded: true,
                      dropdownColor: const Color(0xFF1B1B27),
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54, size: 20),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      items: controller.roadTypeOptions.map((opt) {
                        return DropdownMenuItem<String>(
                          value: opt,
                          child: Text(
                            _getRoadTypeLabel(opt),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) controller.roadType.value = val;
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
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

  // ---------------- Date & Time Card ----------------
  Widget _buildDateTimeCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF2563EB).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.schedule_rounded, color: Color(0xFF60A5FA), size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'date_time_num'.tr,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Obx(
                  () => Text(
                    controller.incidentDateTimeCombined,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text('live_lock'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer (Cancel + Next) ----------------
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
              onTap: controller.onCancel,
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
                    const Icon(Icons.close, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    Text('cancel'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: controller.onStep1NextPressed,
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
                      'driver_incident.next_location_media'.tr,
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

// =====================================================================
// Incident type selection card
// =====================================================================
class _IncidentTypeCard extends StatelessWidget {
  final IncidentType type;
  final bool isSelected;
  final VoidCallback onTap;

  const _IncidentTypeCard({required this.type, required this.isSelected, required this.onTap});

  static const Color kFieldBg = IncidentDetailsView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF1E1E2F) : kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? AppTheme.gradientBlue : Colors.white.withValues(alpha: 0.08),
                width: isSelected ? 1.5 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppTheme.gradientBlue.withValues(alpha: 0.3),
                        blurRadius: 8,
                      ),
                    ]
                  : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : Colors.white.withValues(alpha: 0.05),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(type.icon, color: isSelected ? Colors.white : Colors.white54, size: 20),
                ),
                const SizedBox(height: 6),
                Text(
                  type.label,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  type.description,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white30, fontSize: 8),
                ),
              ],
            ),
          ),
          if (isSelected)
            Positioned(
              top: 5,
              right: 5,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 9),
              ),
            ),
        ],
      ),
    );
  }
}
