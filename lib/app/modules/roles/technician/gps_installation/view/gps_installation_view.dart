import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import '../controller/gps_installation_controller.dart';

class GpsInstallationView extends GetView<GpsInstallationController> {
  const GpsInstallationView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);
  static const Color kBorder = Color(0x1FFFFFFF);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: _buildHeader(),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                children: [
                  _buildVehicleSelectionCard(),
                  const SizedBox(height: 16),
                  _buildGpsDetailsCard(),
                  const SizedBox(height: 16),
                  _buildCalibrationProtocolCard(),
                  const SizedBox(height: 8),
                ],
              ),
            ),
            _buildFooterActions(),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // Header with Back, Title & Quick Telematics Status Link
  // ==========================================================
  Widget _buildHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        IconButton(
          onPressed: controller.onBackPressed,
          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'GPS Telematics Installation',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
              ),
              SizedBox(height: 3),
              Text(
                'Install, calibrate, and bind a GPS telematics box to a transit fleet vehicle',
                style: TextStyle(color: Colors.white54, fontSize: 11.5, height: 1.3),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        InkWell(
          onTap: controller.onViewHardwareStatus,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.sensors, color: kIndigo, size: 14),
                SizedBox(width: 5),
                Text(
                  'Telematics Status',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // Step 1: Target Vehicle Selection Card
  // ==========================================================
  Widget _buildVehicleSelectionCard() {
    return _cardContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle(
            stepNumber: '1',
            icon: Icons.directions_bus_filled_outlined,
            title: 'Target Vehicle Selection',
            subtitle: 'Select the bus receiving the GPS telematics hardware unit',
          ),
          const SizedBox(height: 14),
          const Text(
            'Select Vehicle *',
            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Obx(() {
            if (controller.isLoadingVehicles.value) {
              return Container(
                height: 48,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                ),
                alignment: Alignment.center,
                child: const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(color: kIndigo, strokeWidth: 2),
                ),
              );
            }

            final list = controller.vehicleList;
            final selectedId = controller.selectedVehicleId.value;

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: controller.vehicleError.value != null
                      ? const Color(0xFFEF4444)
                      : Colors.white.withValues(alpha: 0.08),
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: list.any((v) => v.id == selectedId) ? selectedId : (list.isNotEmpty ? list.first.id : null),
                  isExpanded: true,
                  dropdownColor: const Color(0xFF1E1E2E),
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  hint: const Text('Select a vehicle', style: TextStyle(color: Colors.white30, fontSize: 12)),
                  items: list.map((VehicleItemModel v) {
                    final depotStr = v.depotName != null && v.depotName!.isNotEmpty
                        ? v.depotName!
                        : (v.depotId != null ? 'Depot ${v.depotId}' : 'Depot —');
                    return DropdownMenuItem<String>(
                      value: v.id,
                      child: Text(
                        '${v.registrationNumber} — ${v.vehicleType} ($depotStr)',
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: controller.setSelectedVehicle,
                ),
              ),
            );
          }),
          Obx(() {
            final err = controller.vehicleError.value;
            if (err == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 4, left: 2),
              child: Text(err, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11)),
            );
          }),
          const SizedBox(height: 14),

          // Dynamic Vehicle Information Box
          Obx(() {
            final veh = controller.selectedVehicle.value;
            if (veh == null) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F0F1A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                alignment: Alignment.center,
                child: const Text(
                  'Select a vehicle to view its details.',
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                ),
              );
            }

            final depot = veh.depotName != null && veh.depotName!.isNotEmpty
                ? veh.depotName!
                : (veh.depotId != null ? 'Depot #${veh.depotId}' : '—');
            final vin = veh.vin.isNotEmpty ? veh.vin : 'VMX-VIN-901';
            final org = veh.fleetId != null ? 'Org #${veh.fleetId}' : 'Default Fleet';

            return Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F1A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        veh.registrationNumber,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          fontFamily: 'monospace',
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: Text(
                          'Vehicle #${veh.id}',
                          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${veh.vehicleType} · $depot',
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      Text('VIN: $vin', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                      const Text('·', style: TextStyle(color: Colors.white24, fontSize: 11)),
                      Text(org, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ==========================================================
  // Step 2: GPS Telematics Box ID Card + 3 Hardware Dropdowns
  // ==========================================================
  Widget _buildGpsDetailsCard() {
    return _cardContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle(
            stepNumber: '2',
            icon: Icons.memory,
            title: 'GPS Telematics Box ID',
            subtitle: 'Enter hardware serial or scan QR code on the telematics unit',
          ),
          const SizedBox(height: 14),

          // GPS Device ID with Scan QR button
          const Text(
            'GPS Device ID *',
            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller.gpsDeviceIdCtrl,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w700,
                  ),
                  decoration: InputDecoration(
                    hintText: 'e.g. GPS-MX-00123',
                    hintStyle: const TextStyle(color: Colors.white30, fontSize: 12.5),
                    filled: true,
                    fillColor: kFieldBg,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: kIndigo, width: 1.5),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: controller.onScanQr,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.qr_code_scanner, color: kIndigo, size: 18),
                      SizedBox(width: 6),
                      Text(
                        'Scan QR',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Obx(() {
            final err = controller.gpsDeviceIdError.value;
            if (err == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 4, left: 2),
              child: Text(err, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11)),
            );
          }),
          const SizedBox(height: 16),

          // 3 Hardware Dropdowns (Matching Admin Panel)
          _buildDropdownField(
            label: 'Mounting Position',
            valueRx: controller.mountingPosition,
            options: controller.mountingOptions,
          ),
          const SizedBox(height: 12),

          _buildDropdownField(
            label: 'Power Supply Connection',
            valueRx: controller.powerWire,
            options: controller.powerOptions,
          ),
          const SizedBox(height: 12),

          _buildDropdownField(
            label: 'M2M Cellular SIM',
            valueRx: controller.simCardProvider,
            options: controller.simOptions,
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownField({
    required String label,
    required RxString valueRx,
    required List<String> options,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 6),
        Obx(
          () => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: options.contains(valueRx.value) ? valueRx.value : options.first,
                isExpanded: true,
                dropdownColor: const Color(0xFF1E1E2E),
                icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                items: options.map((opt) {
                  return DropdownMenuItem<String>(
                    value: opt,
                    child: Text(opt, overflow: TextOverflow.ellipsis),
                  );
                }).toList(),
                onChanged: (v) {
                  if (v != null) valueRx.value = v;
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // Step 3: Hardware Calibration Protocol Card
  // ==========================================================
  Widget _buildCalibrationProtocolCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E38).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kIndigo.withValues(alpha: 0.3)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.gps_fixed, color: kAmber, size: 18),
          ),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hardware Calibration Protocol',
                  style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
                ),
                SizedBox(height: 3),
                Text(
                  'Once saved, the telematics unit will receive an over-the-air activation ping. Satellite lock will calibrate within 60 seconds after ignition cycle.',
                  style: TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================================
  // Footer: Cancel & Primary CTA Button
  // ==========================================================
  Widget _buildFooterActions() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: controller.onBackPressed,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              alignment: Alignment.center,
              child: const Text(
                'Cancel',
                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Obx(
              () => InkWell(
                onTap: controller.isInstalling.value ? null : controller.onInstallAssignPressed,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: controller.isInstalling.value
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check, color: Colors.white, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Install / Assign GPS Device',
                              style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
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

  // ==========================================================
  // Reusable Container & Section Header
  // ==========================================================
  Widget _cardContainer({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: child,
    );
  }

  Widget _sectionTitle({
    required String stepNumber,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: kIndigo.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: kIndigo, size: 16),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '$stepNumber. $title',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.4,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Padding(
          padding: const EdgeInsets.only(left: 33),
          child: Text(
            subtitle,
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
        ),
      ],
    );
  }
}
