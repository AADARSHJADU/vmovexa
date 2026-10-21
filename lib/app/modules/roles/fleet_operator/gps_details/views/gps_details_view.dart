import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/constants/api_constants.dart';
import '../../../../../data/models/gps_device_model.dart';
import '../controllers/gps_details_controller.dart';

class GpsDetailsView extends GetView<GpsDetailsController> {
  const GpsDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.device.value == null) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF6366F1)),
            );
          }

          final d = controller.device.value;
          if (d == null) {
            return _buildNotFoundState();
          }

          return Column(
            children: [
              // 1. Top Header Bar
              _buildTopBar(d),

              // 2. Scrollable Body
              Expanded(
                child: RefreshIndicator(
                  onRefresh: controller.fetchDeviceDetails,
                  color: const Color(0xFF10B981),
                  backgroundColor: const Color(0xFF1E293B),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Quick Action Buttons
                        _buildActionButtonsStrip(d),
                        const SizedBox(height: 16),

                        // 4 Metric Gauges
                        _buildMetricGaugesGrid(d),
                        const SizedBox(height: 16),

                        // Hardware Specifications Profile Box
                        _buildHardwareSpecsCard(d),
                        const SizedBox(height: 16),

                        // Vehicle Binding Status Card
                        _buildVehicleBindingCard(d),
                        const SizedBox(height: 16),

                        // Power & Diagnostics Telematics
                        _buildPowerAndDiagnosticsCard(d),
                        const SizedBox(height: 16),

                        // Technician & Installation Notes
                        if (d.notes.isNotEmpty) ...[
                          _buildNotesCard(d),
                          const SizedBox(height: 16),
                        ],

                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // --- 1. Top Header Bar ---
  Widget _buildTopBar(GpsDeviceModel d) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          const CustomBackButton(),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        d.displayCode,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _buildStatusBadge(d.status),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'IMEI: ${d.imei.isNotEmpty ? d.imei : '—'} • ${d.vendor} ${d.model}',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
            onPressed: controller.fetchDeviceDetails,
            tooltip: 'Refresh',
          ),
        ],
      ),
    );
  }

  // --- Quick Action Buttons Strip ---
  Widget _buildActionButtonsStrip(GpsDeviceModel d) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        // Edit Config Button
        ElevatedButton.icon(
          onPressed: controller.goToEdit,
          icon: const Icon(Icons.edit_rounded, size: 14),
          label: const Text('Edit Config'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1E293B),
            foregroundColor: Colors.white,
            side: const BorderSide(color: Color(0xFF334155)),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),

        // Assign / Reassign Vehicle Button
        ElevatedButton.icon(
          onPressed: controller.goToAssign,
          icon: const Icon(Icons.directions_bus_rounded, size: 14),
          label: Text(d.isAssigned ? 'Reassign Vehicle' : 'Assign Vehicle'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF3B82F6).withValues(alpha: 0.15),
            foregroundColor: const Color(0xFF60A5FA),
            side: const BorderSide(color: Color(0xFF3B82F6)),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),

        // Unassign Vehicle Button (if assigned)
        if (d.isAssigned)
          ElevatedButton.icon(
            onPressed: controller.handleUnassign,
            icon: const Icon(Icons.link_off_rounded, size: 14),
            label: const Text('Unassign'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.withValues(alpha: 0.12),
              foregroundColor: Colors.amberAccent,
              side: BorderSide(color: Colors.amber.withValues(alpha: 0.4)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),

        // Approve Button (if pending)
        if (d.isPending)
          ElevatedButton.icon(
            onPressed: controller.handleApprove,
            icon: const Icon(Icons.check_circle_rounded, size: 14),
            label: const Text('Approve'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
              foregroundColor: const Color(0xFF34D399),
              side: const BorderSide(color: Color(0xFF10B981)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),

        // Reject Button (if pending)
        if (d.isPending)
          ElevatedButton.icon(
            onPressed: controller.showRejectDialog,
            icon: const Icon(Icons.cancel_rounded, size: 14),
            label: const Text('Reject'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent.withValues(alpha: 0.15),
              foregroundColor: Colors.redAccent,
              side: const BorderSide(color: Colors.redAccent),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),

        // Delete Button (if not assigned)
        if (!d.isAssigned)
          OutlinedButton.icon(
            onPressed: controller.handleDelete,
            icon: const Icon(Icons.delete_outline_rounded, size: 14, color: Colors.redAccent),
            label: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.5)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
      ],
    );
  }

  // --- 4 Metric Gauges Grid ---
  Widget _buildMetricGaugesGrid(GpsDeviceModel d) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.5,
      children: [
        // Gauge 1: Hardware Spec
        _buildGaugeTile(
          icon: Icons.memory_rounded,
          iconColor: const Color(0xFF3B82F6),
          title: 'HARDWARE SPEC',
          mainText: '${d.vendor} ${d.model}'.trim(),
          subText: 'Firmware: ${d.firmware.isNotEmpty ? d.firmware : 'v3.2.14'}',
        ),

        // Gauge 2: Bound Vehicle
        _buildGaugeTile(
          icon: Icons.directions_bus_rounded,
          iconColor: d.isAssigned ? const Color(0xFF10B981) : Colors.amberAccent,
          title: 'BOUND VEHICLE',
          mainText: d.vehicle?.busNumber.isNotEmpty == true
              ? d.vehicle!.busNumber
              : (d.vehicleId != null ? 'Bus #${d.vehicleId}' : 'Unassigned'),
          subText: d.isAssigned ? 'Active Telematics' : 'Ready for Binding',
          highlight: d.isAssigned,
        ),

        // Gauge 3: SIM Mobile Line
        _buildGaugeTile(
          icon: Icons.sim_card_outlined,
          iconColor: const Color(0xFFA855F7),
          title: 'SIM MOBILE LINE',
          mainText: d.sim.isNotEmpty ? d.sim : 'Unassigned',
          subText: '${d.networkType} (${d.simProvider})',
        ),

        // Gauge 4: Backup Battery & Power
        _buildGaugeTile(
          icon: Icons.battery_charging_full_rounded,
          iconColor: const Color(0xFF14B8A6),
          title: 'BACKUP BATTERY',
          mainText: d.batteryCapacity.isNotEmpty ? d.batteryCapacity : '1200 mAh',
          subText: '12V/24V Connected',
        ),
      ],
    );
  }

  Widget _buildGaugeTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String mainText,
    required String subText,
    bool highlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 14),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                mainText,
                style: TextStyle(
                  color: highlight ? const Color(0xFF60A5FA) : Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                subText,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Hardware Specifications Profile Box ---
  Widget _buildHardwareSpecsCard(GpsDeviceModel d) {
    final photoUrl = ApiConstants.resolveFileUrl(d.imageUrl);

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.memory_rounded, color: Colors.amberAccent, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Telematics Specifications',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Text(
                  d.aliasName.isNotEmpty ? d.aliasName : d.displayCode,
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontFamily: 'monospace'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Photo preview (if available)
          if (photoUrl.isNotEmpty) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                photoUrl,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Key/Value Grid
          _buildDetailRow('Hardware Vendor', d.vendor.isNotEmpty ? d.vendor : 'Teltonika'),
          _buildDetailRow('Hardware Model', d.model.isNotEmpty ? d.model : 'Teltonika FMB920'),
          _buildDetailRow('IMEI Code', d.imei.isNotEmpty ? d.imei : '—', isMono: true),
          _buildDetailRow('Serial Number', d.serialNumber.isNotEmpty ? d.serialNumber : 'N/A', isMono: true),
          _buildDetailRow('SIM Mobile Line', d.sim.isNotEmpty ? d.sim : 'Unassigned', isMono: true),
          _buildDetailRow('Carrier Provider', d.simProvider.isNotEmpty ? d.simProvider : 'Jio 4G IoT'),
          _buildDetailRow('Network Tech', '${d.networkType} (${d.network})'),
          _buildDetailRow('Firmware Release', d.firmware.isNotEmpty ? d.firmware : 'v3.2.14-PROD', isMono: true),
          _buildDetailRow(
            'Installation Date',
            d.installedAt != null && d.installedAt!.isNotEmpty
                ? d.installedAt!
                : 'Not Installed / Stock Inventory',
            isLast: true,
          ),
        ],
      ),
    );
  }

  // --- Vehicle Binding Status Card ---
  Widget _buildVehicleBindingCard(GpsDeviceModel d) {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.directions_bus_rounded, color: Color(0xFF60A5FA), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Vehicle Binding Status',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              _buildStatusBadge(d.isAssigned ? 'ASSIGNED' : 'UNASSIGNED'),
            ],
          ),
          const SizedBox(height: 14),

          if (d.isAssigned) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
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
                          const Text(
                            'ASSIGNED FLEET BUS',
                            style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            d.vehicle?.busNumber.isNotEmpty == true
                                ? d.vehicle!.busNumber
                                : 'Bus #${d.vehicleId}',
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            d.vehicle?.model.isNotEmpty == true ? d.vehicle!.model : 'Transit Bus',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                      if (d.vehicle?.status.isNotEmpty == true)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            d.vehicle!.status.toUpperCase(),
                            style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: Color(0xFF1E293B)),
                  const SizedBox(height: 10),

                  _buildDetailRow('Vehicle ID', '#${d.vehicle?.id ?? d.vehicleId}', isMono: true),
                  _buildDetailRow('VIN / Chassis', d.vehicle?.vin.isNotEmpty == true ? d.vehicle!.vin : 'N/A', isMono: true),
                  _buildDetailRow('Mounting Location', d.mountingPosition.isNotEmpty ? d.mountingPosition : 'Behind Driver Dashboard'),
                  _buildDetailRow('Power Wiring', d.powerWire.isNotEmpty ? d.powerWire : 'Direct Battery Constant (+12V/24V)', isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Button to View Bus Details
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: controller.goToVehicleDetails,
                icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                label: const Text('View Bus Details & Telematics'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.link_off_rounded, color: Colors.amberAccent, size: 36),
                  const SizedBox(height: 8),
                  const Text(
                    'No Vehicle Bound Yet',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'This GPS unit is in warehouse stock inventory ready to be assigned to a transit vehicle.',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton.icon(
                    onPressed: controller.goToAssign,
                    icon: const Icon(Icons.add_link_rounded, size: 16),
                    label: const Text('Pair to Vehicle Now'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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

  // --- Power & Diagnostics Telematics ---
  Widget _buildPowerAndDiagnosticsCard(GpsDeviceModel d) {
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
          const Row(
            children: [
              Icon(Icons.bolt_rounded, color: Colors.amberAccent, size: 18),
              SizedBox(width: 8),
              Text(
                'Power & Diagnostics Telematics',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 14),

          _buildDetailRow('Backup Battery Capacity', d.batteryCapacity.isNotEmpty ? d.batteryCapacity : '1200 mAh'),
          _buildDetailRow('Input Voltage Range', '10V - 30V DC (Vehicle Power)'),
          _buildDetailRow('Power Protection', 'Overvoltage & Surge Protected'),
          _buildDetailRow('GNSS / GPS Receiver', 'GPS, GLONASS, GALILEO'),
          _buildDetailRow('Tracking Sensitivity', '-165 dBm High Accuracy'),
          _buildDetailRow('Ping Frequency', 'Every 5 Seconds', isLast: true),
        ],
      ),
    );
  }

  // --- Technician Notes Card ---
  Widget _buildNotesCard(GpsDeviceModel d) {
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
          const Row(
            children: [
              Icon(Icons.notes_rounded, color: Color(0xFF818CF8), size: 18),
              SizedBox(width: 8),
              Text(
                'Installation / Wiring Notes',
                style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            d.notes,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isMono = false, bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                fontFamily: isMono ? 'monospace' : null,
              ),
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final s = status.toLowerCase();
    Color bg = const Color(0xFF1E293B);
    Color fg = const Color(0xFF94A3B8);
    Color border = const Color(0xFF334155);
    String label = status.toUpperCase();

    if (s == 'available' || s == 'online') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      fg = const Color(0xFF34D399);
      border = const Color(0xFF10B981).withValues(alpha: 0.4);
      label = 'AVAILABLE';
    } else if (s == 'assigned') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      fg = const Color(0xFF60A5FA);
      border = const Color(0xFF3B82F6).withValues(alpha: 0.4);
      label = 'ASSIGNED';
    } else if (s == 'pending_approval') {
      bg = Colors.amber.withValues(alpha: 0.15);
      fg = Colors.amberAccent;
      border = Colors.amber.withValues(alpha: 0.4);
      label = 'PENDING';
    } else if (s == 'rejected') {
      bg = Colors.redAccent.withValues(alpha: 0.15);
      fg = Colors.redAccent;
      border = Colors.redAccent.withValues(alpha: 0.4);
      label = 'REJECTED';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(color: fg, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
      ),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.amberAccent, size: 48),
            const SizedBox(height: 12),
            const Text(
              'GPS Device Not Found',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Could not load hardware details for this device ID.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Get.back(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E293B),
                foregroundColor: Colors.white,
              ),
              child: const Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
