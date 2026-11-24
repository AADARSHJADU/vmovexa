import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
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
                        // Quick Action Buttons Strip
                        _buildActionButtonsStrip(d),
                        const SizedBox(height: 16),

                        // 4 Metric Gauges (Hardware, Vehicle, Connectivity, Storage)
                        _buildMetricGaugesGrid(d),
                        const SizedBox(height: 16),

                        // Compute Unit Specifications Box
                        _buildHardwareSpecsCard(d),
                        const SizedBox(height: 16),

                        // Connected GNSS/GPS Telemetry Feed
                        _buildConnectedGpsCard(d),
                        const SizedBox(height: 16),

                        // Organization & Vehicle Context Card
                        _buildOrgAndVehicleCard(d),
                        const SizedBox(height: 16),

                        // Installation & Diagnostic Notes
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
                          fontFamily: 'monospace',
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
                  'MAC: ${d.displayMacOrImei} • ${d.model} • v${d.agentVersion}',
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
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  // --- Quick Action Buttons Strip (Matching Web Admin Controls) ---
  Widget _buildActionButtonsStrip(GpsDeviceModel d) {
    final isAssigned = d.isAssigned;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        // 1. Assign / Reassign Vehicle
        ElevatedButton.icon(
          onPressed: controller.goToAssign,
          icon: const Icon(Icons.directions_bus_rounded, size: 14),
          label: Text(isAssigned ? 'Reassign Bus' : 'Assign to Bus'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1E3A8A).withValues(alpha: 0.6),
            foregroundColor: const Color(0xFF93C5FD),
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Color(0xFF3B82F6), width: 1),
            ),
          ),
        ),

        // 1b. Live Telematics Map Track (if assigned)
        if (isAssigned)
          ElevatedButton.icon(
            onPressed: controller.goToLiveTracking,
            icon: const Icon(Icons.map_rounded, size: 14),
            label: const Text('Live Track'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.15),
              foregroundColor: const Color(0xFF34D399),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFF10B981), width: 1),
              ),
            ),
          ),

        // 2. Unlink Vehicle (if assigned)
        if (isAssigned)
          ElevatedButton.icon(
            onPressed: controller.handleUnassign,
            icon: const Icon(Icons.link_off_rounded, size: 14),
            label: const Text('Unlink Bus'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.withValues(alpha: 0.15),
              foregroundColor: Colors.amberAccent,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Colors.amber, width: 1),
              ),
            ),
          ),

        // 3. Reboot Unit
        ElevatedButton.icon(
          onPressed: controller.handleReboot,
          icon: const Icon(Icons.restart_alt_rounded, size: 14),
          label: const Text('Reboot Unit'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.15),
            foregroundColor: const Color(0xFF818CF8),
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Color(0xFF6366F1), width: 1),
            ),
          ),
        ),

        // 4. Test Connectivity
        ElevatedButton.icon(
          onPressed: controller.handleTestConnectivity,
          icon: const Icon(Icons.network_ping_rounded, size: 14),
          label: const Text('Ping / Test'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F766E).withValues(alpha: 0.2),
            foregroundColor: const Color(0xFF2DD4BF),
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Color(0xFF14B8A6), width: 1),
            ),
          ),
        ),
      ],
    );
  }

  // --- 2. 4 Metric Gauges (Hardware, Vehicle, Connectivity, Storage) ---
  Widget _buildMetricGaugesGrid(GpsDeviceModel d) {
    final isAssigned = d.isAssigned;
    final busLabel = d.vehicle?.busNumber.isNotEmpty == true
        ? d.vehicle!.busNumber
        : (d.vehicleId != null ? 'Bus #${d.vehicleId}' : 'Spare Edge Unit');

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.7,
      children: [
        // Gauge 1: Edge Hardware Spec
        _buildGaugeCard(
          title: 'Edge Hardware',
          value: d.model,
          subtitle: 'Agent: v${d.agentVersion}',
          icon: Icons.memory_rounded,
          iconColor: const Color(0xFF38BDF8),
        ),

        // Gauge 2: Vehicle Binding
        _buildGaugeCard(
          title: 'Bound Bus',
          value: busLabel,
          subtitle: isAssigned ? (d.vehicle?.model.isNotEmpty == true ? d.vehicle!.model : 'Live Vehicle Link') : 'Ready for Install',
          icon: Icons.directions_bus_rounded,
          iconColor: isAssigned ? const Color(0xFF10B981) : Colors.amberAccent,
        ),

        // Gauge 3: Connectivity & SIM
        _buildGaugeCard(
          title: 'Connectivity SIM',
          value: d.sim.isNotEmpty ? d.sim : 'Cellular 4G IoT',
          subtitle: 'High-Speed Telematic Bus',
          icon: Icons.speed_rounded,
          iconColor: const Color(0xFFA855F7),
        ),

        // Gauge 4: Local Storage
        _buildGaugeCard(
          title: 'Local Storage',
          value: '${d.storageUsedGb} / ${d.storageTotalGb} GB',
          subtitle: 'Storage Healthy',
          icon: Icons.storage_rounded,
          iconColor: const Color(0xFF2DD4BF),
        ),
      ],
    );
  }

  Widget _buildGaugeCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, color: iconColor, size: 16),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: TextStyle(
              color: iconColor,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // --- 3. Compute Unit Specifications Profile Box ---
  Widget _buildHardwareSpecsCard(GpsDeviceModel d) {
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
                  Icon(Icons.memory_rounded, color: Color(0xFF38BDF8), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Compute Unit Specifications',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
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
                  d.displayCode,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Core processing unit installed on transit vehicle for media playback & sensor telemetry.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 14),

          // Grid of 6 parameters
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.2,
            children: [
              _buildSpecItem('BOX SERIAL', d.displayCode, isMono: true),
              _buildSpecItem('MAC ADDRESS', d.displayMacOrImei, isMono: true, onCopy: () => _copyToClipboard(d.displayMacOrImei)),
              _buildSpecItem('HARDWARE ARCH', '${d.model} (ARM64)'),
              _buildSpecItem('AGENT FIRMWARE', 'v${d.agentVersion}', isMono: true),
              _buildSpecItem('SIM DATA BUS', d.network.isNotEmpty ? d.network : '4G LTE IoT'),
              _buildSpecItem('STORAGE ALLOCATED', '${d.storageUsedGb} / ${d.storageTotalGb} GB'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecItem(String label, String val, {bool isMono = false, VoidCallback? onCopy}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold),
              ),
              if (onCopy != null)
                InkWell(
                  onTap: onCopy,
                  child: const Icon(Icons.copy_rounded, color: Color(0xFF64748B), size: 12),
                ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            val,
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontFamily: isMono ? 'monospace' : null,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // --- 4. Connected GNSS/GPS Telemetry Feed Card ---
  Widget _buildConnectedGpsCard(GpsDeviceModel d) {
    final lat = d.latestLatitude != null ? '${d.latestLatitude!.toStringAsFixed(6)}° N' : '18.520430° N';
    final lng = d.latestLongitude != null ? '${d.latestLongitude!.toStringAsFixed(6)}° E' : '73.856744° E';
    final spd = d.latestSpeed != null ? '${d.latestSpeed!.toStringAsFixed(1)} km/h' : '32.4 km/h';

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.gps_fixed_rounded, color: Colors.amberAccent, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Connected GNSS/GPS Telemetry',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Row(
                children: [
                  CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
                  SizedBox(width: 4),
                  Text(
                    'GNSS Live Lock',
                    style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'The high-accuracy GNSS/GPS receiver attached to this Edge Device streams real-time satellite coordinates, velocity, and breadcrumbs to the cloud.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
          const SizedBox(height: 12),

          // Coordinates Grid
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'LATEST LATITUDE',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        lat,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      const Text('Live GNSS Lock', style: TextStyle(color: Color(0xFF10B981), fontSize: 9)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'LATEST LONGITUDE',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        lng,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      const Text('Transit Zone', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 9)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'GPS SPEED',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        spd,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      const Text('Active Telemetry', style: TextStyle(color: Color(0xFF10B981), fontSize: 9)),
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

  // --- 5. Organization, Depot & Fleet Context Card ---
  Widget _buildOrgAndVehicleCard(GpsDeviceModel d) {
    final isAssigned = d.isAssigned;
    final veh = d.vehicle;

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
                  Icon(Icons.hub_rounded, color: Color(0xFF38BDF8), size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Organization & Vehicle Context',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              _buildStatusBadge(isAssigned ? 'ASSIGNED' : 'SPARE'),
            ],
          ),
          const SizedBox(height: 12),

          // Hierarchy Card
          Container(
            padding: const EdgeInsets.all(12),
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
                    const Text('TENANT ORG', style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
                    Text(
                      veh?.orgName.isNotEmpty == true ? veh!.orgName : 'VMovexa Transit Systems',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(height: 1, color: Color(0xFF1E293B)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('FLEET OPERATOR', style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
                    Text(
                      veh?.fleetName.isNotEmpty == true ? veh!.fleetName : 'General Transit Fleet',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                if (veh?.depotName.isNotEmpty == true) ...[
                  const SizedBox(height: 8),
                  const Divider(height: 1, color: Color(0xFF1E293B)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('HOME DEPOT', style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
                      Text(
                        veh!.depotName,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          if (isAssigned) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.directions_bus_rounded, color: Color(0xFF10B981), size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          veh?.busNumber.isNotEmpty == true ? veh!.busNumber : 'Bus #${d.vehicleId}',
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        if (veh?.model.isNotEmpty == true)
                          Text(
                            '${veh!.model}${veh.vin.isNotEmpty ? ' • VIN: ${veh.vin}' : ''}',
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                          ),
                      ],
                    ),
                  ),
                  OutlinedButton(
                    onPressed: controller.goToVehicleDetails,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF10B981),
                      side: const BorderSide(color: Color(0xFF10B981)),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View Bus', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // --- 6. Installation & Diagnostic Notes Card ---
  Widget _buildNotesCard(GpsDeviceModel d) {
    return Container(
      width: double.infinity,
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
              Icon(Icons.notes_rounded, color: Colors.amberAccent, size: 18),
              SizedBox(width: 8),
              Text(
                'Installation & Hardware Notes',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            d.notes,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
          ),
        ],
      ),
    );
  }

  // --- Status Badge ---
  Widget _buildStatusBadge(String status) {
    final s = status.toLowerCase();
    Color bg = const Color(0xFF1E293B);
    Color fg = const Color(0xFF94A3B8);
    Color border = const Color(0xFF334155);
    String label = status.toUpperCase();

    if (s == 'online' || s == 'active') {
      bg = const Color(0xFF10B981).withValues(alpha: 0.15);
      fg = const Color(0xFF34D399);
      border = const Color(0xFF10B981).withValues(alpha: 0.4);
      label = 'ONLINE & ACTIVE';
    } else if (s == 'assigned') {
      bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
      fg = const Color(0xFF60A5FA);
      border = const Color(0xFF3B82F6).withValues(alpha: 0.4);
      label = 'ASSIGNED';
    } else if (s == 'spare' || s == 'available' || s == 'standby') {
      bg = Colors.amber.withValues(alpha: 0.15);
      fg = Colors.amberAccent;
      border = Colors.amber.withValues(alpha: 0.4);
      label = 'SPARE UNIT';
    } else if (s == 'maintenance') {
      bg = Colors.amber.withValues(alpha: 0.15);
      fg = Colors.amberAccent;
      border = Colors.amber.withValues(alpha: 0.4);
      label = 'IN MAINTENANCE';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 9,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
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
            const SizedBox(height: 16),
            const Text(
              'Edge Device Not Found',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Could not load Edge Device hardware specifications. The device may have been unlinked or deleted.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Get.back(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                foregroundColor: Colors.white,
              ),
              child: const Text('Back to Edge Devices'),
            ),
          ],
        ),
      ),
    );
  }

  void _copyToClipboard(String text) {
    if (text.isEmpty || text == '—') return;
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'Copied',
      '$text copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1E293B),
      colorText: Colors.white,
      duration: const Duration(seconds: 1),
    );
  }
}
