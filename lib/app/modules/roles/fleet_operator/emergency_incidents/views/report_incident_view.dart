import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/emergency_incidents_controller.dart';

class ReportIncidentView extends GetView<EmergencyIncidentsController> {
  const ReportIncidentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildTopAppBar(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Warning Header
                    _buildAlertBanner(),
                    const SizedBox(height: 16),

                    // Section 1: Vehicle & Driver Selection
                    _buildVehicleAndDriverSection(),
                    const SizedBox(height: 16),

                    // Section 2: Incident Type & Severity
                    _buildIncidentTypeAndSeveritySection(),
                    const SizedBox(height: 16),

                    // Section 3: Description & Location
                    _buildDescriptionAndLocationSection(),
                    const SizedBox(height: 16),

                    // Section 4: Emergency & Casualties
                    _buildEmergencyAndCasualtiesSection(),
                    const SizedBox(height: 16),

                    // Section 5: Photos & Evidence
                    _buildPhotosSection(),
                    const SizedBox(height: 24),

                    // Submit Button
                    _buildSubmitButton(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
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
        children: const [
          CustomBackButton(),
          Text(
            'Report Emergency Incident',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(width: 42),
        ],
      ),
    );
  }

  Widget _buildAlertBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withOpacity(0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.emergency_rounded, color: Color(0xFFEF4444), size: 24),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Broadcasting an emergency will alert dispatch teams, control room supervisors, and mark the vehicle on live telemetry.',
              style: TextStyle(
                color: Colors.red.shade200,
                fontSize: 11.5,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleAndDriverSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Vehicle & Driver Selection',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Vehicle Dropdown
          const Text('Fleet Vehicle', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 6),
          Obx(() {
            if (controller.isResourcesLoading.value) {
              return const LinearProgressIndicator(color: Color(0xFFEF4444));
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
                  dropdownColor: AppColors.cardBg,
                  hint: const Text('Select Vehicle', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  items: controller.vehiclesList.map((v) {
                    return DropdownMenuItem<String>(
                      value: v.id,
                      child: Text(
                        '${v.registrationNumber} (${v.make} ${v.model})',
                        style: const TextStyle(fontSize: 12),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    controller.reportVehicleId.value = val;
                  },
                ),
              ),
            );
          }),
          const SizedBox(height: 12),

          // Driver Dropdown
          const Text('Assigned Driver', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
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
                  dropdownColor: AppColors.cardBg,
                  hint: const Text('Select Driver (Optional)', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  items: controller.driversList.map((d) {
                    return DropdownMenuItem<String>(
                      value: d.id,
                      child: Text(
                        '${d.name} (${d.phone.isNotEmpty ? d.phone : "No Phone"})',
                        style: const TextStyle(fontSize: 12),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    controller.reportDriverId.value = val;
                  },
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildIncidentTypeAndSeveritySection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Incident Classification',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Incident Type Dropdown
          const Text('Incident Type', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
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
                  value: controller.reportIncidentType.value,
                  dropdownColor: AppColors.cardBg,
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  items: controller.incidentTypes.map((type) {
                    return DropdownMenuItem<String>(
                      value: type,
                      child: Text(type, style: const TextStyle(fontSize: 12)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) controller.reportIncidentType.value = val;
                  },
                ),
              ),
            );
          }),
          const SizedBox(height: 14),

          // Severity Selector
          const Text('Severity Level', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 8),
          Obx(() {
            return Row(
              children: controller.severityLevels.map((sev) {
                final isSelected = controller.reportSeverity.value == sev;
                Color sevColor;
                switch (sev) {
                  case 'critical':
                    sevColor = const Color(0xFFEF4444);
                    break;
                  case 'high':
                    sevColor = const Color(0xFFF97316);
                    break;
                  case 'medium':
                    sevColor = const Color(0xFFF59E0B);
                    break;
                  case 'low':
                  default:
                    sevColor = const Color(0xFF10B981);
                }

                return Expanded(
                  child: GestureDetector(
                    onTap: () => controller.reportSeverity.value = sev,
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? sevColor.withOpacity(0.2) : AppColors.inputBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? sevColor : AppColors.inputBorder,
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          sev.toUpperCase(),
                          style: TextStyle(
                            color: isSelected ? sevColor : Colors.grey.shade400,
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDescriptionAndLocationSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Details & Location',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Description (Required)
          const Text('Incident Description *', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.reportDescriptionCtrl,
            maxLines: 3,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Describe what happened, mechanical fault, road collision, etc.',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 12),

          // Location
          const Text('Location / Road / Area', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.reportLocationCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'e.g. Ring Road, Near Palasia Square',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
          const SizedBox(height: 12),

          // Landmark
          const Text('Nearby Landmark', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.reportLandmarkCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'e.g. Metro Pillar #42',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
          const SizedBox(height: 12),

          // Immediate Action
          const Text('Immediate Action Taken', style: TextStyle(color: Colors.white70, fontSize: 11.5)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.reportImmediateActionCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'e.g. Passengers evacuated, hazard lights engaged',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmergencyAndCasualtiesSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Casualties & Emergency Support',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Casualties & Injured Steppers
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Fatalities', style: TextStyle(color: Colors.white70, fontSize: 11)),
                    const SizedBox(height: 6),
                    Obx(() {
                      return Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: Colors.grey, size: 20),
                            onPressed: () {
                              if (controller.reportCasualtyCount.value > 0) {
                                controller.reportCasualtyCount.value--;
                              }
                            },
                          ),
                          Text(
                            controller.reportCasualtyCount.value.toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: Color(0xFFEF4444), size: 20),
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
                    const Text('Injured Count', style: TextStyle(color: Colors.white70, fontSize: 11)),
                    const SizedBox(height: 6),
                    Obx(() {
                      return Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: Colors.grey, size: 20),
                            onPressed: () {
                              if (controller.reportInjuredCount.value > 0) {
                                controller.reportInjuredCount.value--;
                              }
                            },
                          ),
                          Text(
                            controller.reportInjuredCount.value.toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: Color(0xFFF59E0B), size: 20),
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

          // Hospital Name
          TextField(
            controller: controller.reportHospitalCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Hospital Name (if applicable)',
              hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
              filled: true,
              fillColor: AppColors.inputBg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.inputBorder),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
          const SizedBox(height: 12),

          // Switches: Ambulance, Police, Towing
          Obx(() {
            return SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Ambulance Assigned / Dispatched', style: TextStyle(color: Colors.white, fontSize: 12)),
              activeColor: const Color(0xFFEF4444),
              value: controller.reportAmbulanceAssigned.value,
              onChanged: (val) => controller.reportAmbulanceAssigned.value = val,
            );
          }),
          Obx(() {
            return SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Police Notified', style: TextStyle(color: Colors.white, fontSize: 12)),
              activeColor: const Color(0xFF6366F1),
              value: controller.reportPoliceNotified.value,
              onChanged: (val) => controller.reportPoliceNotified.value = val,
            );
          }),
          Obx(() {
            if (!controller.reportPoliceNotified.value) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: TextField(
                controller: controller.reportPoliceStationCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'Police Station / Officer Name',
                  hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                  filled: true,
                  fillColor: AppColors.inputBg,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.inputBorder),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            );
          }),
          Obx(() {
            return SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Towing / Recovery Dispatched', style: TextStyle(color: Colors.white, fontSize: 12)),
              activeColor: const Color(0xFF10B981),
              value: controller.reportTowingRequested.value,
              onChanged: (val) => controller.reportTowingRequested.value = val,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPhotosSection() {
    return Container(
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
              const Text(
                'Photo Evidence',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              TextButton.icon(
                onPressed: () => controller.pickPhoto(),
                icon: const Icon(Icons.add_a_photo_rounded, size: 16, color: Color(0xFF6366F1)),
                label: const Text('Attach Photo', style: TextStyle(color: Color(0xFF6366F1), fontSize: 12)),
              ),
            ],
          ),
          Obx(() {
            if (controller.isUploadingPhoto.value) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 10),
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFF6366F1), strokeWidth: 2),
                ),
              );
            }

            if (controller.reportPhotos.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Text(
                  'No photos attached yet. You can attach breakdown or damage photos.',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                ),
              );
            }

            return SizedBox(
              height: 70,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: controller.reportPhotos.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  return Stack(
                    children: [
                      Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: const Icon(Icons.image, color: Colors.grey),
                      ),
                      Positioned(
                        right: 2,
                        top: 2,
                        child: GestureDetector(
                          onTap: () => controller.removePhoto(index),
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(
                              color: Colors.black87,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close, size: 14, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Obx(() {
      return CustomButton(
        text: 'Log & Broadcast Incident',
        onTap: controller.submitReportIncident,
        isLoading: controller.isSubmittingReport.value,
        height: 48,
      );
    });
  }
}
