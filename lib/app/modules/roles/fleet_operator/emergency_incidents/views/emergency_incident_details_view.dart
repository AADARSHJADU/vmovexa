import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/incident_model.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/emergency_incidents_controller.dart';

class EmergencyIncidentDetailsView extends GetView<EmergencyIncidentsController> {
  const EmergencyIncidentDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
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
                  return const Center(
                    child: Text(
                      'No incident details available.',
                      style: TextStyle(color: Colors.white),
                    ),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card with Severity & Status
                      _buildHeaderCard(inc),
                      const SizedBox(height: 16),

                      // Vehicle & Driver Details
                      _buildVehicleDriverCard(inc),
                      const SizedBox(height: 16),

                      // Location & Context Card
                      _buildLocationContextCard(inc),
                      const SizedBox(height: 16),

                      // Emergency Services & Medical Info
                      _buildEmergencyServicesCard(inc),
                      const SizedBox(height: 16),

                      // Photos Gallery if any
                      if (inc.photos.isNotEmpty) ...[
                        _buildPhotosGallery(inc),
                        const SizedBox(height: 16),
                      ],

                      // Resolution & Dispatch Control Action Form
                      _buildResolutionActionCard(inc),
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
            final title = inc != null ? 'Incident #${inc.id}' : 'Incident Detail';
            return Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            );
          }),
          const SizedBox(width: 42),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: inc.severityColor.withOpacity(0.4),
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
                  inc.incidentType,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: inc.severityColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: inc.severityColor.withOpacity(0.5)),
                ),
                child: Text(
                  inc.severity.toUpperCase(),
                  style: TextStyle(
                    color: inc.severityColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: inc.statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: inc.statusColor.withOpacity(0.5)),
                ),
                child: Text(
                  inc.formattedStatus.toUpperCase(),
                  style: TextStyle(
                    color: inc.statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            inc.description,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          if (inc.createdAt != null && inc.createdAt!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Reported on: ${inc.createdAt}',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
            ),
          ],
        ],
      ),
    );
  }

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
          const Text(
            'Vehicle & Driver Contact',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.directions_bus_rounded, color: Color(0xFF6366F1), size: 22),
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
                      'Assigned Fleet Vehicle',
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
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person_rounded, color: Color(0xFF10B981), size: 22),
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
                      inc.displayDriverPhone.isNotEmpty ? inc.displayDriverPhone : 'No contact number',
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
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientPink.withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
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
                    icon: const Icon(Icons.phone, size: 16, color: Colors.white),
                    label: const Text('Call', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
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
          const Text(
            'Location & Road Context',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          if (inc.location != null && inc.location!.isNotEmpty) ...[
            _buildInfoRow(Icons.location_on_rounded, 'Location', inc.location!),
            const SizedBox(height: 8),
          ],
          if (inc.landmark != null && inc.landmark!.isNotEmpty) ...[
            _buildInfoRow(Icons.flag_rounded, 'Landmark', inc.landmark!),
            const SizedBox(height: 8),
          ],
          if (inc.latitude != null && inc.longitude != null) ...[
            _buildInfoRow(Icons.my_location_rounded, 'GPS Pin', '${inc.latitude}, ${inc.longitude}'),
            const SizedBox(height: 8),
          ],
          if (inc.roadType != null && inc.roadType!.isNotEmpty) ...[
            _buildInfoRow(Icons.alt_route_rounded, 'Road Type', inc.roadType!),
            const SizedBox(height: 8),
          ],
          if (inc.weatherConditions != null && inc.weatherConditions!.isNotEmpty) ...[
            _buildInfoRow(Icons.wb_sunny_rounded, 'Weather', inc.weatherConditions!),
            const SizedBox(height: 8),
          ],
          if (inc.trafficDisruptionLevel != null && inc.trafficDisruptionLevel != 'none') ...[
            _buildInfoRow(Icons.traffic_rounded, 'Traffic Disruption', inc.trafficDisruptionLevel!.toUpperCase()),
          ],
        ],
      ),
    );
  }

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
          const Text(
            'Emergency & Safety Services',
            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(
            Icons.local_hospital_rounded,
            'Casualties & Injured',
            'Fatalities: ${inc.deadCasualty} • Injured: ${inc.injuredCount}',
          ),
          const SizedBox(height: 8),
          if (inc.hospitalName != null && inc.hospitalName!.isNotEmpty) ...[
            _buildInfoRow(Icons.local_hospital_outlined, 'Hospital', inc.hospitalName!),
            const SizedBox(height: 8),
          ],
          _buildInfoRow(
            Icons.medical_services_rounded,
            'Ambulance Assigned',
            inc.ambulanceAssigned ? 'Yes ${inc.ambulanceTiming ?? ""}' : 'No',
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            Icons.local_police_rounded,
            'Police Notified',
            inc.policeNotified ? 'Yes (${inc.policeStationName ?? "Local Station"})' : 'No',
          ),
          const SizedBox(height: 8),
          _buildInfoRow(
            Icons.car_repair_rounded,
            'Towing Requested',
            inc.towingRequested ? 'Yes (Recovery dispatched)' : 'No',
          ),
          if (inc.immediateAction != null && inc.immediateAction!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildInfoRow(Icons.flash_on_rounded, 'Immediate Action', inc.immediateAction!),
          ],
        ],
      ),
    );
  }

  Widget _buildPhotosGallery(IncidentItemModel inc) {
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
            'Photo Evidence (${inc.photos.length})',
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
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
                return ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    photoUrl,
                    width: 120,
                    height: 90,
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Container(
                      width: 120,
                      height: 90,
                      color: AppColors.background,
                      child: const Icon(Icons.broken_image, color: Colors.grey),
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

  Widget _buildResolutionActionCard(IncidentItemModel inc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF6366F1).withOpacity(0.5),
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.assignment_turned_in_rounded, color: Color(0xFF6366F1), size: 20),
              SizedBox(width: 8),
              Text(
                'Control Room Dispatch & Resolution',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Status Selector
          const Text('Incident Status', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),

          Obx(() {
            const statuses = <String>[
              'contacted',
              'investigating',
              'recovering',
              'resolved',
              'closed',
            ];

            // Prevent DropdownButton assertion error
            final currentStatus = statuses.contains(
              controller.resolutionStatus.value,
            )
                ? controller.resolutionStatus.value
                : 'contacted';

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Colors.white24,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: currentStatus,
                  dropdownColor: AppColors.cardBg,
                  isExpanded: true,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                  ),
                  iconEnabledColor: Colors.white,
                  items: const [
                    DropdownMenuItem<String>(
                      value: 'contacted',
                      child: Text('Contacted Driver & Dispatched'),
                    ),
                    DropdownMenuItem<String>(
                      value: 'investigating',
                      child: Text('Investigating / On Site Control'),
                    ),
                    DropdownMenuItem<String>(
                      value: 'recovering',
                      child: Text('Vehicle Recovery / Towing in Progress'),
                    ),
                    DropdownMenuItem<String>(
                      value: 'resolved',
                      child: Text('Resolved & Route Cleared'),
                    ),
                    DropdownMenuItem<String>(
                      value: 'closed',
                      child: Text('Closed & Filed'),
                    ),
                  ],
                  onChanged: (String? value) {
                    if (value != null) {
                      controller.resolutionStatus.value = value;
                    }
                  },
                ),
              ),
            );
          }),

          /*    Obx(() {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.inputBorder),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: controller.resolutionStatus.value,
                  dropdownColor: AppColors.cardBg,
                  isExpanded: true,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  items: const [
                    DropdownMenuItem(value: 'contacted', child: Text('Contacted Driver & Dispatched')),
                    DropdownMenuItem(value: 'investigating', child: Text('Investigating / On Site Control')),
                    DropdownMenuItem(value: 'recovering', child: Text('Vehicle Recovery / Towing in Progress')),
                    DropdownMenuItem(value: 'resolved', child: Text('Resolved & Route Cleared')),
                    DropdownMenuItem(value: 'closed', child: Text('Closed & Filed')),
                  ],
                  onChanged: (val) {
                    if (val != null) controller.resolutionStatus.value = val;
                  },
                ),
              ),
            );
          }),*/
          const SizedBox(height: 14),

          // Driver Contact Checkbox
          Obx(() {
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Checkbox(
                        value: controller.contactedDriver.value,
                        activeColor: const Color(0xFF6366F1),
                        onChanged: (val) => controller.contactedDriver.value = val ?? false,
                      ),
                      const Expanded(
                        child: Text(
                          'Driver Contacted (Voice Call Completed)',
                          style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  if (controller.contactedDriver.value) ...[
                    const SizedBox(height: 6),
                    TextField(
                      controller: controller.contactNotesController,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: 'e.g. Spoke with driver at 10:45 AM. Confirmed all safe.',
                        hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                        filled: true,
                        fillColor: AppColors.inputBg,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: const BorderSide(color: AppColors.inputBorder),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
          const SizedBox(height: 12),

          // Vehicle Recovered Checkbox
          Obx(() {
            return Row(
              children: [
                Checkbox(
                  value: controller.recovered.value,
                  activeColor: const Color(0xFF10B981),
                  onChanged: (val) => controller.recovered.value = val ?? false,
                ),
                const Expanded(
                  child: Text(
                    'Vehicle & Site Recovered / Route Cleared',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 12),

          // Resolution Notes Textarea
          const Text('Resolution Notes & Action Report', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.resolutionNotesController,
            maxLines: 3,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Enter field observations, backup dispatch status, or final clearance notes...',
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
          const SizedBox(height: 16),

          // Save Button
          Obx(() {
            return CustomButton(
              text: 'Save Incident Resolution',
              onTap: controller.saveResolution,
              isLoading: controller.isUpdatingResolution.value,
              height: 44,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String title, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade400),
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
}
