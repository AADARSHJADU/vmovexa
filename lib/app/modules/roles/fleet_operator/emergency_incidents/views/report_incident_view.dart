import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/location_autocomplete_field.dart';
import '../controllers/emergency_incidents_controller.dart';

class ReportIncidentView extends GetView<EmergencyIncidentsController> {
  const ReportIncidentView({super.key});

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

  String _getAffectedPartyLabel(String party) {
    switch (party.toLowerCase()) {
      case 'passengers':
        return 'party_passengers'.tr;
      case 'driver':
        return 'party_driver'.tr;
      case 'vehicle':
        return 'party_vehicle'.tr;
      case 'infrastructure':
        return 'party_infrastructure'.tr;
      case 'other':
        return 'party_other'.tr;
      default:
        return party;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<EmergencyIncidentsController>()) {
      Get.put(EmergencyIncidentsController());
    }

    // Ensure resources are loaded if empty
    if (controller.vehiclesList.isEmpty && !controller.isResourcesLoading.value) {
      controller.loadReportResources();
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isSuccessState.value) {
            return _buildSuccessView(context);
          }

          return Column(
            children: [
              _buildTopAppBar(),
              _buildStepperNavBar(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (controller.currentStep.value == 1) _buildStep1TypeAndResources(),
                      if (controller.currentStep.value == 2) _buildStep2GpsLocation(),
                      if (controller.currentStep.value == 3) _buildStep3MedicalAndSeverity(),
                      if (controller.currentStep.value == 4) _buildStep4MediaAndSubmit(context),
                      const SizedBox(height: 36),
                    ],
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ==========================================
  // TOP BAR & STEPPER HEADER
  // ==========================================

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          CustomBackButton(
            onTap: () {
              if (controller.currentStep.value > 1) {
                controller.goToPreviousStep();
              } else {
                controller.resetReportForm();
                Get.back();
              }
            },
          ),
          Text(
            'report_emergency_incident'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox()
          // Obx(() {
          //   return Container(
          //     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          //     decoration: BoxDecoration(
          //       color: const Color(0xFFEF4444).withValues(alpha: 0.15),
          //       borderRadius: BorderRadius.circular(16),
          //       border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          //     ),
          //     child: Text(
          //       'Step ${controller.currentStep.value} of 4',
          //       style: const TextStyle(
          //         color: Color(0xFFF87171),
          //         fontSize: 11,
          //         fontWeight: FontWeight.bold,
          //       ),
          //     ),
          //   );
          // }),
        ],
      ),
    );
  }

  Widget _buildStepperNavBar() {
    final steps = [
      {'step': 1, 'title': 'step1_nav_title'.tr, 'desc': 'step1_nav_desc'.tr},
      {'step': 2, 'title': 'step2_nav_title'.tr, 'desc': 'step2_nav_desc'.tr},
      {'step': 3, 'title': 'step3_nav_title'.tr, 'desc': 'step3_nav_desc'.tr},
      {'step': 4, 'title': 'step4_nav_title'.tr, 'desc': 'step4_nav_desc'.tr},
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Obx(() {
        final activeStep = controller.currentStep.value;

        return Row(
          children: steps.map((s) {
            final sNum = s['step'] as int;
            final isCurrent = activeStep == sNum;
            final isCompleted = activeStep > sNum;

            Color bgColor = Colors.transparent;
            Color borderColor = AppColors.inputBorder;
            Color numBg = Colors.white12;
            Color numColor = Colors.white60;
            Color textColor = Colors.white60;

            if (isCurrent) {
              bgColor = const Color(0xFF2563EB).withValues(alpha: 0.18);
              borderColor = const Color(0xFF3B82F6);
              numBg = const Color(0xFF2563EB);
              numColor = Colors.white;
              textColor = Colors.white;
            } else if (isCompleted) {
              bgColor = const Color(0xFF10B981).withValues(alpha: 0.12);
              borderColor = const Color(0xFF10B981).withValues(alpha: 0.4);
              numBg = const Color(0xFF10B981);
              numColor = Colors.white;
              textColor = const Color(0xFF34D399);
            }

            return Expanded(
              child: GestureDetector(
                onTap: () => controller.goToStep(sNum),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: borderColor, width: isCurrent ? 1.4 : 1.0),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: numBg,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isCompleted
                              ? const Icon(Icons.check, size: 13, color: Colors.white)
                              : Text(
                                  '$sNum',
                                  style: TextStyle(
                                    color: numColor,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s['title'] as String,
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 9.5,
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }

  // ==========================================
  // STEP 1: TYPE & TARGET RESOURCES
  // ==========================================

  Widget _buildStep1TypeAndResources() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Header
        _buildSectionHeader(
          title: 'step1_header_title'.tr,
          subtitle: 'step1_header_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Vehicle & Driver Box
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Involved Vehicle (Bus)
              Text('involved_vehicle_bus'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Obx(() {
                if (controller.isResourcesLoading.value) {
                  return const LinearProgressIndicator(color: Color(0xFF3B82F6));
                }
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.reportVehicleId.value,
                      dropdownColor: const Color(0xFF1E293B),
                      hint: Text('unassigned_general_incident'.tr, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 12.5),
                      items: [
                        DropdownMenuItem<String>(
                          value: '',
                          child: Text('unassigned_general_incident'.tr, style: const TextStyle(fontSize: 12)),
                        ),
                        ...controller.vehiclesList.map((v) {
                          final drv = controller.getAssignedDriverForVehicle(v);
                          final drvText = drv != null
                              ? ' (${'driver_with_name'.trParams({'name': drv.name})})'
                              : ' (${'no_assigned_driver_paren'.tr})';
                          return DropdownMenuItem<String>(
                            value: v.id,
                            child: Text(
                              '${v.registrationNumber} — ${v.make} ${v.model}$drvText',
                              style: const TextStyle(fontSize: 12),
                            ),
                          );
                        }),
                      ],
                      onChanged: (val) {
                        controller.onReportVehicleChanged(val == '' ? null : val);
                      },
                    ),
                  ),
                );
              }),
              const SizedBox(height: 12),

              // Assigned Driver
              Text('assigned_driver'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Obx(() {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.reportDriverId.value,
                      dropdownColor: const Color(0xFF1E293B),
                      hint: Text('unassigned_outside_driver'.tr, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 12.5),
                      items: [
                        DropdownMenuItem<String>(
                          value: '',
                          child: Text('unassigned_outside_driver'.tr, style: const TextStyle(fontSize: 12)),
                        ),
                        ...controller.driversList.map((d) {
                          final isAssigned = controller.assignedDriverForSelectedVeh?.id == d.id;
                          final star = isAssigned ? '⭐ ' : '';
                          final autoTag = isAssigned ? ' [${'auto_linked_prefix'.tr.replaceAll(':', '').trim()}]' : '';
                          return DropdownMenuItem<String>(
                            value: d.id,
                            child: Text(
                              '$star${d.name}${d.empId.isNotEmpty ? " (${d.empId})" : ""}$autoTag',
                              style: TextStyle(
                                fontSize: 12,
                                color: isAssigned ? const Color(0xFF60A5FA) : Colors.white,
                                fontWeight: isAssigned ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          );
                        }),
                      ],
                      onChanged: (val) {
                        controller.onReportDriverChanged(val == '' ? null : val);
                      },
                    ),
                  ),
                );
              }),

              // Auto-linked Confirmation Card
              Obx(() {
                final v = controller.selectedVehicle;
                if (v == null) return const SizedBox.shrink();

                final assigned = controller.assignedDriverForSelectedVeh;
                final isReliefOverridden = assigned != null &&
                    controller.reportDriverId.value != null &&
                    controller.reportDriverId.value!.isNotEmpty &&
                    controller.reportDriverId.value != assigned.id;

                if (assigned != null) {
                  return Container(
                    margin: const EdgeInsets.only(top: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF60A5FA), size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: const TextStyle(color: Colors.white, fontSize: 11.5, height: 1.4),
                                  children: [
                                    TextSpan(text: 'auto_linked_prefix'.tr, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF93C5FD))),
                                    TextSpan(
                                      text: 'bus_regularly_operated_by'.trParams({
                                        'bus': v.registrationNumber,
                                        'driver': '${assigned.name}${assigned.empId.isNotEmpty ? " (${assigned.empId})" : ""}',
                                      }),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (isReliefOverridden)
                          Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
                            ),
                            child: Text(
                              'relief_driver_overridden'.tr,
                              style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9.5, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                  );
                } else {
                  return Container(
                    margin: const EdgeInsets.only(top: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline_rounded, color: Color(0xFFFBBF24), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RichText(
                            text: TextSpan(
                              style: const TextStyle(color: Colors.white, fontSize: 11.5, height: 1.4),
                              children: [
                                TextSpan(text: 'no_primary_driver_prefix'.tr, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFDE68A))),
                                TextSpan(
                                  text: 'no_primary_driver_desc'.trParams({'bus': v.registrationNumber}),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Incident Category Grid (8 Categories)
        Text('incident_category_req'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        _buildCategoryGrid(),
        const SizedBox(height: 16),

        // Description (Required)
        Text('${'incident_description'.tr} *', style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        TextField(
          controller: controller.reportDescriptionCtrl,
          maxLines: 3,
          style: const TextStyle(color: Colors.white, fontSize: 12.5),
          decoration: InputDecoration(
            hintText: 'describe_incident_blockages_hint'.tr,
            hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11.5),
            filled: true,
            fillColor: AppColors.inputBg,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.inputBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.inputBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5),
            ),
            contentPadding: const EdgeInsets.all(12),
          ),
        ),
        const SizedBox(height: 16),

        // Affected Entities / Parties (Multi-select chips)
        Text('affected_entities_parties'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Obx(() {
          return Wrap(
            spacing: 8,
            runSpacing: 8,
            children: controller.affectedOptions.map((opt) {
              final isSelected = controller.affectedParties.contains(opt);
              return GestureDetector(
                onTap: () => controller.toggleAffectedParty(opt),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF2563EB) : AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF3B82F6) : AppColors.inputBorder,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isSelected ? '✓ ' : '+ ',
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey.shade400,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _getAffectedPartyLabel(opt),
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey.shade300,
                          fontSize: 11.5,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        }),
        const SizedBox(height: 24),

        // Continue Button
        Align(
          alignment: Alignment.centerRight,
          child: ElevatedButton(
            onPressed: () => controller.goToNextStep(),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('continue_to_gps_location'.tr, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryGrid() {
    final categories = [
      {'id': 'Accident', 'label': 'incident_accident'.tr, 'desc': 'cat_accident_desc'.tr, 'icon': Icons.car_crash_rounded, 'color': const Color(0xFFEF4444)},
      {'id': 'Breakdown', 'label': 'incident_breakdown'.tr, 'desc': 'cat_breakdown_desc'.tr, 'icon': Icons.build_circle_rounded, 'color': const Color(0xFFF59E0B)},
      {'id': 'Road Condition', 'label': 'incident_road_condition'.tr, 'desc': 'cat_road_condition_desc'.tr, 'icon': Icons.alt_route_rounded, 'color': const Color(0xFF3B82F6)},
      {'id': 'Traffic Issue', 'label': 'incident_traffic_issue'.tr, 'desc': 'cat_traffic_issue_desc'.tr, 'icon': Icons.traffic_rounded, 'color': const Color(0xFFA855F7)},
      {'id': 'Passenger Issue', 'label': 'incident_passenger_issue'.tr, 'desc': 'cat_passenger_issue_desc'.tr, 'icon': Icons.personal_injury_rounded, 'color': const Color(0xFF6366F1)},
      {'id': 'Infrastructure', 'label': 'incident_infrastructure'.tr, 'desc': 'cat_infrastructure_desc'.tr, 'icon': Icons.domain_rounded, 'color': const Color(0xFF14B8A6)},
      {'id': 'Safety Concern', 'label': 'incident_safety_concern'.tr, 'desc': 'cat_safety_concern_desc'.tr, 'icon': Icons.shield_rounded, 'color': const Color(0xFFF43F5E)},
      {'id': 'Other', 'label': 'incident_other'.tr, 'desc': 'cat_other_desc'.tr, 'icon': Icons.description_rounded, 'color': const Color(0xFF94A3B8)},
    ];

    return Obx(() {
      final selected = controller.reportIncidentType.value;

      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.3,
        ),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final c = categories[index];
          final cId = c['id'] as String;
          final isSelected = selected == cId;
          final color = c['color'] as Color;

          return GestureDetector(
            onTap: () => controller.reportIncidentType.value = cId,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF2563EB).withValues(alpha: 0.18) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                  width: isSelected ? 1.6 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2563EB).withValues(alpha: 0.3) : AppColors.inputBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(c['icon'] as IconData, size: 18, color: color),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c['label'] as String,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.grey.shade200,
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          c['desc'] as String,
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 9.5),
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
      );
    });
  }

  // ==========================================
  // STEP 2: GPS LOCATION & MAP PIN
  // ==========================================

  Widget _buildStep2GpsLocation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with GPS Auto-Detect Button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildSectionHeader(
                title: 'step2_header_title'.tr,
                subtitle: 'step2_header_sub'.tr,
              ),
            ),
            const SizedBox(width: 8),
            Obx(() {
              return ElevatedButton.icon(
                onPressed: controller.isDetectingGps.value ? null : () => controller.detectCurrentGps(),
                icon: controller.isDetectingGps.value
                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.my_location_rounded, size: 15, color: Colors.white),
                label: Text(
                  controller.isDetectingGps.value ? 'detecting_gps'.tr : 'auto_detect_gps'.tr,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            }),
          ],
        ),
        const SizedBox(height: 14),

        // Google Places Autocomplete Search Box
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: LocationAutocompleteField(
            label: 'search_scene_location_label'.tr,
            hint: 'search_scene_location_hint'.tr,
            controller: controller.reportLocationCtrl,
            addressController: controller.reportAddressCtrl,
            cityController: controller.reportCityCtrl,
            stateController: controller.reportStateCtrl,
            pincodeController: controller.reportPincodeCtrl,
            latController: controller.reportLatitudeCtrl,
            lngController: controller.reportLongitudeCtrl,
            accentColor: const Color(0xFF3B82F6),
            onPlaceSelected: controller.onReportPlaceSelected,
          ),
        ),
        const SizedBox(height: 14),

        // Landmark & Coords Container
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Landmark
              Text('prominent_landmark'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.reportLandmarkCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'prominent_landmark_hint'.tr,
                  hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  filled: true,
                  fillColor: AppColors.inputBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),

              // Latitude & Longitude
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('latitude_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: controller.reportLatitudeCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                          decoration: InputDecoration(
                            hintText: 'e.g. 22.7196',
                            hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                            filled: true,
                            fillColor: AppColors.inputBg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('longitude_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: controller.reportLongitudeCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                          decoration: InputDecoration(
                            hintText: 'e.g. 75.8577',
                            hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                            filled: true,
                            fillColor: AppColors.inputBg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Weather & Road Type
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('weather_condition_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Obx(() {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: AppColors.inputBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.inputBorder),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: controller.reportWeatherConditions.value,
                                dropdownColor: const Color(0xFF1E293B),
                                isExpanded: true,
                                style: const TextStyle(color: Colors.white, fontSize: 11.5),
                                items: controller.weatherOptions.map((w) {
                                  return DropdownMenuItem<String>(value: w, child: Text(_getWeatherLabel(w), style: const TextStyle(fontSize: 11.5)));
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) controller.reportWeatherConditions.value = val;
                                },
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('road_type_label'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Obx(() {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: AppColors.inputBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.inputBorder),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: controller.reportRoadType.value,
                                dropdownColor: const Color(0xFF1E293B),
                                isExpanded: true,
                                style: const TextStyle(color: Colors.white, fontSize: 11.5),
                                items: controller.roadTypeOptions.map((r) {
                                  return DropdownMenuItem<String>(value: r, child: Text(_getRoadTypeLabel(r), style: const TextStyle(fontSize: 11.5)));
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) controller.reportRoadType.value = val;
                                },
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Navigation Buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            OutlinedButton(
              onPressed: () => controller.goToPreviousStep(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('← ${'back'.tr}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ),
            ElevatedButton(
              onPressed: () => controller.goToNextStep(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('continue_to_medical_severity'.tr, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ],
    );
  }

  // ==========================================
  // STEP 3: MEDICAL, CASUALTIES & SEVERITY
  // ==========================================

  Widget _buildStep3MedicalAndSeverity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          title: 'step3_header_title'.tr,
          subtitle: 'step3_header_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Severity Selector (4 Cards)
        Text('emergency_severity_level'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        _buildSeverityGrid(),
        const SizedBox(height: 16),

        // Casualties Block (Red Tinted Card)
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('fatalities_dead_casualties'.tr, style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Obx(() {
                          return Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey, size: 22),
                                onPressed: () {
                                  if (controller.reportCasualtyCount.value > 0) {
                                    controller.reportCasualtyCount.value--;
                                  }
                                },
                              ),
                              Text(
                                controller.reportCasualtyCount.value.toString(),
                                style: const TextStyle(color: Color(0xFFEF4444), fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline, color: Color(0xFFEF4444), size: 22),
                                onPressed: () => controller.reportCasualtyCount.value++,
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('injured_persons_count'.tr, style: const TextStyle(color: Color(0xFFFCD34D), fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Obx(() {
                          return Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey, size: 22),
                                onPressed: () {
                                  if (controller.reportInjuredCount.value > 0) {
                                    controller.reportInjuredCount.value--;
                                  }
                                },
                              ),
                              Text(
                                controller.reportInjuredCount.value.toString(),
                                style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline, color: Color(0xFFF59E0B), size: 22),
                                onPressed: () => controller.reportInjuredCount.value++,
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Admitted Hospital Name
              Text('admitted_hospital_name'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 11.5, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.reportHospitalCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'hospital'.tr,
                  hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  filled: true,
                  fillColor: AppColors.inputBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Emergency Assistance Dispatch Checklist
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('emergency_dispatch_checklist'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),

              // Ambulance
              Obx(() {
                return Column(
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text('ambulance_dispatched_label'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      activeThumbColor: const Color(0xFFEF4444),
                      value: controller.reportAmbulanceAssigned.value,
                      onChanged: (val) => controller.reportAmbulanceAssigned.value = val,
                    ),
                    if (controller.reportAmbulanceAssigned.value)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: TextField(
                          controller: controller.reportAmbulanceTimingCtrl,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'ambulance_timing_hint'.tr,
                            hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                            filled: true,
                            fillColor: AppColors.inputBg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ),
                  ],
                );
              }),

              // Police
              Obx(() {
                return Column(
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text('police_notified_label'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      activeThumbColor: const Color(0xFF3B82F6),
                      value: controller.reportPoliceNotified.value,
                      onChanged: (val) => controller.reportPoliceNotified.value = val,
                    ),
                    if (controller.reportPoliceNotified.value)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: TextField(
                          controller: controller.reportPoliceStationCtrl,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'police_station_hint'.tr,
                            hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                            filled: true,
                            fillColor: AppColors.inputBg,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                        ),
                      ),
                  ],
                );
              }),

              // Towing
              Obx(() {
                return SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('towing_crane_requested_label'.tr, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                  subtitle: Text('towing_crane_sub'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 10)),
                  activeThumbColor: const Color(0xFF10B981),
                  value: controller.reportTowingRequested.value,
                  onChanged: (val) => controller.reportTowingRequested.value = val,
                );
              }),
              const SizedBox(height: 8),

              // Traffic Disruption Level Dropdown
              Text('traffic_disruption_level'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Obx(() {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: AppColors.inputBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.inputBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: controller.reportTrafficDisruption.value,
                      dropdownColor: const Color(0xFF1E293B),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      items: [
                        DropdownMenuItem(value: 'none', child: Text('traffic_normal'.tr, style: const TextStyle(fontSize: 12))),
                        DropdownMenuItem(value: 'minor_delay', child: Text('traffic_minor_delay'.tr, style: const TextStyle(fontSize: 12))),
                        DropdownMenuItem(value: 'lane_blocked', child: Text('traffic_lane_blocked'.tr, style: const TextStyle(fontSize: 12))),
                        DropdownMenuItem(value: 'total_gridlock', child: Text('traffic_total_gridlock'.tr, style: const TextStyle(fontSize: 12))),
                      ],
                      onChanged: (val) {
                        if (val != null) controller.reportTrafficDisruption.value = val;
                      },
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Navigation Buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            OutlinedButton(
              onPressed: () => controller.goToPreviousStep(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('← ${'back'.tr}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ),
            ElevatedButton(
              onPressed: () => controller.goToNextStep(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('continue_to_media_submit'.tr, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSeverityGrid() {
    final severities = [
      {'id': 'low', 'label': _getSeverityLabel('low'), 'desc': 'sev_low_desc'.tr, 'color': const Color(0xFF10B981)},
      {'id': 'medium', 'label': _getSeverityLabel('medium'), 'desc': 'sev_medium_desc'.tr, 'color': const Color(0xFFF59E0B)},
      {'id': 'high', 'label': _getSeverityLabel('high'), 'desc': 'sev_high_desc'.tr, 'color': const Color(0xFFF97316)},
      {'id': 'critical', 'label': _getSeverityLabel('critical'), 'desc': 'sev_critical_desc'.tr, 'color': const Color(0xFFEF4444)},
    ];

    return Obx(() {
      final selected = controller.reportSeverity.value.toLowerCase();

      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.3,
        ),
        itemCount: severities.length,
        itemBuilder: (context, index) {
          final s = severities[index];
          final sId = s['id'] as String;
          final isSelected = selected == sId;
          final color = s['color'] as Color;

          return GestureDetector(
            onTap: () => controller.reportSeverity.value = sId,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? color.withValues(alpha: 0.15) : AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? color : AppColors.cardBorder,
                  width: isSelected ? 1.6 : 1.0,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        s['label'] as String,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey.shade300,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    s['desc'] as String,
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 9.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }

  // ==========================================
  // STEP 4: MEDIA EVIDENCE, CONTACT & SUBMIT
  // ==========================================

  Widget _buildStep4MediaAndSubmit(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          title: 'step4_header_title'.tr,
          subtitle: 'step4_header_sub'.tr,
        ),
        const SizedBox(height: 14),

        // Photo Evidence Section
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Obx(() {
                    return Row(
                      children: [
                        const Icon(Icons.photo_camera_rounded, color: Color(0xFF3B82F6), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'photo_evidence_count'.trParams({'count': controller.reportPhotos.length.toString()}),
                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    );
                  }),
                  Obx(() {
                    return ElevatedButton(
                      onPressed: controller.isUploadingPhoto.value ? null : () => controller.pickPhoto(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        controller.isUploadingPhoto.value ? 'uploading_photo'.tr : 'add_photo_plus'.tr,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    );
                  }),
                ],
              ),
              const SizedBox(height: 10),

              Obx(() {
                if (controller.isUploadingPhoto.value) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6), strokeWidth: 2)),
                  );
                }

                if (controller.reportPhotos.isEmpty) {
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: AppColors.inputBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.inputBorder, style: BorderStyle.solid),
                    ),
                    child: Center(
                      child: Text('no_scene_photos_uploaded'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 11.5)),
                    ),
                  );
                }

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: controller.reportPhotos.length,
                  itemBuilder: (ctx, idx) {
                    final photoUrl = controller.reportPhotos[idx];
                    final resolved = ApiConstants.resolveFileUrl(photoUrl);
                    final isNetwork = resolved.startsWith('http://') || resolved.startsWith('https://');

                    return Stack(
                      children: [
                        GestureDetector(
                          onTap: () => _showPhotoPreviewDialog(context, photoUrl, idx, controller.reportPhotos.length),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              width: double.infinity,
                              height: double.infinity,
                              color: Colors.black26,
                              child: isNetwork
                                  ? Image.network(
                                      resolved,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, _, _) => const Icon(Icons.broken_image, color: Colors.grey),
                                    )
                                  : Image.file(
                                      File(photoUrl),
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, _, _) => const Icon(Icons.broken_image, color: Colors.grey),
                                    ),
                            ),
                          ),
                        ),
                        // Remove 'x' Button
                        Positioned(
                          right: 4,
                          top: 4,
                          child: GestureDetector(
                            onTap: () => controller.removePhoto(idx),
                            child: Container(
                              padding: const EdgeInsets.all(3),
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close, size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Video Evidence Section
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Obx(() {
                    return Row(
                      children: [
                        const Icon(Icons.videocam_rounded, color: Color(0xFFA855F7), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'video_recordings_count'.trParams({'count': controller.reportVideos.length.toString()}),
                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    );
                  }),
                  Obx(() {
                    return ElevatedButton(
                      onPressed: controller.isUploadingVideo.value ? null : () => controller.pickVideo(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFA855F7),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        controller.isUploadingVideo.value ? 'uploading_photo'.tr : 'add_video'.tr,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    );
                  }),
                ],
              ),
              const SizedBox(height: 10),

              Obx(() {
                if (controller.isUploadingVideo.value) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Center(child: CircularProgressIndicator(color: Color(0xFFA855F7), strokeWidth: 2)),
                  );
                }

                if (controller.reportVideos.isEmpty) {
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: AppColors.inputBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.inputBorder),
                    ),
                    child: Center(
                      child: Text('no_videos_attached'.tr, style: TextStyle(color: Colors.grey.shade500, fontSize: 11.5)),
                    ),
                  );
                }

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 2.2,
                  ),
                  itemCount: controller.reportVideos.length,
                  itemBuilder: (ctx, idx) {
                    final videoUrl = controller.reportVideos[idx];

                    return Stack(
                      children: [
                        GestureDetector(
                          onTap: () => _showVideoPreviewDialog(context, videoUrl, idx, controller.reportVideos.length),
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.4)),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            child: Row(
                              children: [
                                const Icon(Icons.play_circle_fill_rounded, color: Color(0xFFA855F7), size: 24),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('video_item_title'.trParams({'num': (idx + 1).toString()}), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                      Text('tap_to_view'.tr, style: TextStyle(color: Colors.grey.shade400, fontSize: 9.5)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Remove 'x' Button
                        Positioned(
                          right: 4,
                          top: 4,
                          child: GestureDetector(
                            onTap: () => controller.removeVideo(idx),
                            child: Container(
                              padding: const EdgeInsets.all(3),
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close, size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Immediate Action & Contact Phone
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('immediate_action_taken_scene'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.reportImmediateActionCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'immediate_action_evacuated_hint'.tr,
                  hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  filled: true,
                  fillColor: AppColors.inputBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),

              Text('on_scene_contact_phone'.tr, style: TextStyle(color: Colors.grey.shade300, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: controller.reportContactPhoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'contact_phone_hint'.tr,
                  hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  filled: true,
                  fillColor: AppColors.inputBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.inputBorder)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Dispatch Broadcast Summary Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF2563EB).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('dispatch_broadcast_summary'.tr, style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              Obx(() {
                final loc = controller.reportLocationCtrl.text.trim().isNotEmpty
                    ? controller.reportLocationCtrl.text.trim()
                    : (controller.reportLandmarkCtrl.text.trim().isNotEmpty ? controller.reportLandmarkCtrl.text.trim() : 'GPS Coordinated');

                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text('category_colon'.trParams({'cat': _getCategoryLabel(controller.reportIncidentType.value)}), style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600)),
                        ),
                        Expanded(
                          child: Text('severity_colon'.trParams({'sev': _getSeverityLabel(controller.reportSeverity.value)}), style: const TextStyle(color: Color(0xFFF87171), fontSize: 11.5, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text('casualties_summary_line'.trParams({'dead': controller.reportCasualtyCount.value.toString(), 'injured': controller.reportInjuredCount.value.toString()}), style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                        ),
                        Expanded(
                          child: Text('scene_colon'.trParams({'scene': loc}), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                        ),
                      ],
                    ),
                  ],
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Navigation & Submit
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            OutlinedButton(
              onPressed: () => controller.goToPreviousStep(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.cardBorder),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('← ${'back'.tr}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ),
            Obx(() {
              return ElevatedButton.icon(
                onPressed: controller.isSubmittingReport.value ? null : () => controller.submitReportIncident(),
                icon: controller.isSubmittingReport.value
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.warning_amber_rounded, size: 18, color: Colors.white),
                label: Text(
                  controller.isSubmittingReport.value ? 'broadcasting_report'.tr : 'broadcast_emergency_report'.tr,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFDC2626),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              );
            }),
          ],
        ),
      ],
    );
  }

  // ==========================================
  // POST-SUBMISSION SUCCESS SCREEN
  // ==========================================

  Widget _buildSuccessView(BuildContext context) {
    final incident = controller.createdIncident.value;
    final dateStr = incident?.createdAt != null
        ? DateFormat('dd MMM yyyy · hh:mm a').format(DateTime.tryParse(incident!.createdAt!) ?? DateTime.now())
        : DateFormat('dd MMM yyyy · hh:mm a').format(DateTime.now());

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Checkmark Icon
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                    blurRadius: 18,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Color(0xFF10B981), size: 40),
            ),
            const SizedBox(height: 18),

            // Title
            Text(
              'incident_reported_success'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'emergency_report_broadcasted_desc'.tr,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400, fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 24),

            // Incident Summary Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('incident_record_id'.tr, style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(
                            '#${incident?.id ?? "INC-NEW"}',
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          incident?.status.toUpperCase() ?? 'OPEN',
                          style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: AppColors.cardBorder, height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('category_label'.tr, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              _getCategoryLabel(incident?.incidentType ?? 'Accident'),
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('severity_level_label'.tr, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              '● ${_getSeverityLabel(incident?.severity ?? "low")}',
                              style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('location_colon_label'.tr, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              incident?.location ?? 'GPS Coordinated',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('timestamp_label'.tr, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text(
                              dateStr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  controller.resetReportForm();
                  Get.back();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('view_in_incidents_log'.tr, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  controller.resetReportForm();
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('report_another_incident'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
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
              // Header
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
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
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
              // Interactive Image with pinch-to-zoom and pan
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
                            errorBuilder: (context, error, stackTrace) => Container(
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
                            errorBuilder: (context, error, stackTrace) => Container(
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

  // ==========================================
  // SHARED HELPERS
  // ==========================================

  Widget _buildSectionHeader({required String title, required String subtitle}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
        ),
      ],
    );
  }
}
