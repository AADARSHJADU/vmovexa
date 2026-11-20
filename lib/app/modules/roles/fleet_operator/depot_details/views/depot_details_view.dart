import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/fleet_models.dart';
import '../controllers/depot_details_controller.dart';

class DepotDetailsView extends GetView<DepotDetailsController> {
  const DepotDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            _buildTopBar(),

            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.depot.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF10B981)),
                  );
                }

                final d = controller.depot.value;
                if (d == null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 40, color: Colors.white38),
                        const SizedBox(height: 12),
                        Text('depot_not_found'.tr, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        CustomButton(
                          text: 'back_to_depots'.tr,
                          onTap: () => Get.back(),
                          width: 160,
                          height: 42,
                        ),
                      ],
                    ),
                  );
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Facility Card with quick actions
                      _buildHeaderCard(d),
                      const SizedBox(height: 16),

                      // 4 KPI Metric Cards
                      _buildKpiMetrics(d),
                      const SizedBox(height: 16),

                      // Parking Capacity Meter Card
                      _buildCapacityMeterCard(d),
                      const SizedBox(height: 16),

                      // Geospatial & Geofence Card
                      _buildGeospatialCard(d),
                      const SizedBox(height: 16),

                      // Energy & Amenities Card
                      _buildEnergyAndAmenitiesCard(d),
                      const SizedBox(height: 16),

                      // Personnel & Contact Helplines Card
                      _buildPersonnelCard(d),
                      const SizedBox(height: 24),

                      // Bottom Action Buttons
                      _buildBottomActions(d),
                      const SizedBox(height: 30),
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

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          Obx(() {
            final name = controller.depot.value?.name ?? 'depot_dossier'.tr;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            );
          }),
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: Color(0xFF10B981), size: 22),
            tooltip: 'edit_facility'.tr,
            onPressed: controller.goToEdit,
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(DepotItemModel d) {
    final statusColor = d.isOperational
        ? const Color(0xFF10B981)
        : d.isMaintenance
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                ),
                child: Text(
                  d.displayCode,
                  style: const TextStyle(
                    color: Color(0xFF38BDF8),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              // const SizedBox(width: 8),
              // Container(
              //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              //   decoration: BoxDecoration(
              //     color: const Color(0xFFA855F7).withValues(alpha: 0.15),
              //     borderRadius: BorderRadius.circular(6),
              //   ),
              //   child: Text(
              //     d.displayType.toUpperCase(),
              //     style: const TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold),
              //   ),
              // ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                ),
                child: Text(
                  d.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Text(
            d.name,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          if (d.address.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    d.address,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildKpiMetrics(DepotItemModel d) {
    return Row(
      children: [
        Expanded(
          child: _buildKpiBox(
            title: 'total_bays_kpi'.tr,
            value: '${d.capacity}',
            subtitle: 'max_capacity_sub'.tr,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildKpiBox(
            title: 'ev_chargers_kpi'.tr,
            value: '${d.evChargers}',
            subtitle: 'dc_fast_ports_sub'.tr,
            color: const Color(0xFF38BDF8),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildKpiBox(
            title: 'maint_pits_kpi'.tr,
            value: '${d.maintenanceBays}',
            subtitle: 'inspection_bays_sub'.tr,
            color: const Color(0xFFF59E0B),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildKpiBox(
            title: 'wash_bays_kpi'.tr,
            value: '${d.washingBays}',
            subtitle: 'cleaning_units_sub'.tr,
            color: const Color(0xFFA855F7),
          ),
        ),
      ],
    );
  }

  Widget _buildKpiBox({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 8, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          Text(
            subtitle,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 9),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildCapacityMeterCard(DepotItemModel d) {
    final fillPct = d.fillPercentage;
    final fillBarColor = fillPct > 90
        ? const Color(0xFFEF4444)
        : fillPct > 70
            ? const Color(0xFFF59E0B)
            : const Color(0xFF10B981);

    return Container(
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
                  const Icon(Icons.directions_bus_filled_rounded, color: Color(0xFF38BDF8), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'yard_occupancy_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                '$fillPct%',
                style: TextStyle(color: fillBarColor, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: d.capacity > 0 ? (d.currentParked / d.capacity).clamp(0.0, 1.0) : 0.0,
              minHeight: 8,
              backgroundColor: Colors.white.withValues(alpha: 0.1),
              valueColor: AlwaysStoppedAnimation<Color>(fillBarColor),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${'stationed_buses_prefix'.tr}${d.currentParked}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
              Text(
                '${'total_capacity_prefix'.tr}${d.capacity} ${'bays_suffix'.tr}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGeospatialCard(DepotItemModel d) {
    return Container(
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
                  const Icon(Icons.pin_drop_rounded, color: Color(0xFFA855F7), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'geospatial_perimeter_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.3)),
                ),
                child: Text(
                  '${'radius_prefix'.tr}${d.geofenceRadius}m',
                  style: const TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 22),

          _buildDetailRow('complete_address_label'.tr, d.address.isNotEmpty ? d.address : 'address_not_specified'.tr),
          const SizedBox(height: 8),
          _buildDetailRow('city_state_label'.tr, '${d.city.isNotEmpty ? d.city : '—'}, ${d.state.isNotEmpty ? d.state : '—'} ${d.pincode.isNotEmpty ? "(${d.pincode})" : ""}'),
          const SizedBox(height: 8),
          _buildDetailRow(
            'gps_coords_label'.tr,
            d.latitude != null && d.longitude != null
                ? '${d.latitude!.toStringAsFixed(6)}, ${d.longitude!.toStringAsFixed(6)}'
                : 'not_specified'.tr,
          ),
        ],
      ),
    );
  }

  Widget _buildEnergyAndAmenitiesCard(DepotItemModel d) {
    return Container(
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
            children: [
              const Icon(Icons.bolt_rounded, color: Color(0xFFFBBF24), size: 18),
              const SizedBox(width: 8),
              Text(
                'energy_amenities_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 22),

          // Fuel types
          Text('supported_fuel_energy_caps'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (d.fuelTypes.isEmpty)
            const Text('EV Charging, Diesel', style: TextStyle(color: Colors.white70, fontSize: 12))
          else
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: d.fuelTypes.map((fuel) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF38BDF8).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('⛽', style: TextStyle(fontSize: 11)),
                      const SizedBox(width: 5),
                      Text(fuel, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              }).toList(),
            ),
          const SizedBox(height: 14),

          // Amenities
          Text('onsite_yard_amenities_caps'.tr, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (d.amenities.isEmpty)
            const Text('Driver Rest Lounge, 24/7 Security', style: TextStyle(color: Colors.white70, fontSize: 12))
          else
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: d.amenities.map((a) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 12),
                      const SizedBox(width: 5),
                      Text(a, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildPersonnelCard(DepotItemModel d) {
    return Container(
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
            children: [
              const Icon(Icons.support_agent_rounded, color: Color(0xFFEC4899), size: 18),
              const SizedBox(width: 8),
              Text(
                'personnel_helplines_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(color: AppColors.cardBorder, height: 22),

          _buildDetailRow('facility_incharge_label'.tr, d.contactPerson.isNotEmpty ? d.contactPerson : 'not_assigned'.tr),
          const SizedBox(height: 8),
          _buildDetailRow('helpline_phone_label'.tr, d.contactPhone.isNotEmpty ? d.contactPhone : '—'),
          const SizedBox(height: 8),
          _buildDetailRow('emergency_desk_label'.tr, d.emergencyPhone.isNotEmpty ? d.emergencyPhone : '—'),
          const SizedBox(height: 8),
          _buildDetailRow('official_email_label'.tr, d.email.isNotEmpty ? d.email : '—'),
          const SizedBox(height: 8),
          _buildDetailRow('operating_hours_label'.tr, d.operatingHours.isNotEmpty ? d.operatingHours : '24x7'),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 130,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
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

  Widget _buildBottomActions(DepotItemModel d) {
    return Obx(() {
      final isUpdating = controller.isUpdatingStatus.value;
      return Column(
        children: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isUpdating ? null : controller.toggleStatus,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    foregroundColor: const Color(0xFFF59E0B),
                    side: const BorderSide(color: Color(0xFFF59E0B)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: isUpdating
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFF59E0B)))
                      : Icon(d.isOperational ? Icons.cancel_outlined : Icons.check_circle_outline_rounded, size: 18),
                  label: Text(
                    d.isOperational ? 'close_facility_btn'.tr : 'reopen_facility_btn'.tr,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: CustomButton(
                  text: 'edit_facility'.tr,
                  prefixIcon: const Icon(Icons.edit_outlined, size: 18, color: Colors.white),
                  onTap: controller.goToEdit,
                  height: 44,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: controller.confirmDelete,
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFEF4444),
              side: BorderSide(color: const Color(0xFFEF4444).withValues(alpha: 0.5)),
              minimumSize: const Size(double.infinity, 44),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.delete_outline_rounded, size: 18),
            label: Text('delete_depot_btn'.tr, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      );
    });
  }
}
