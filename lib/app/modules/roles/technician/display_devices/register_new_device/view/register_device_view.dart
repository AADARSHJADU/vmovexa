import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../../theme/app_theme.dart';
import '../controller/register_device_controller.dart';

class RegisterDeviceView extends GetView<RegisterDeviceController> {
  const RegisterDeviceView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x1FFFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: _buildHeader(),
            ),

            const Divider(color: Color(0xFF1E293B), height: 1),

            // Form Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                children: [
                  // Section 1: Device Information
                  _buildSectionHeader(
                    number: '1',
                    title: 'device_info_section'.tr,
                    desc: 'device_info_desc'.tr,
                    color: kBlue,
                  ),
                  const SizedBox(height: 12),
                  _buildDeviceInfoCard(),

                  const SizedBox(height: 24),

                  // Section 2: Cascading Vehicle & Location Assignment (Admin Parity)
                  _buildSectionHeader(
                    number: '2',
                    title: 'vehicle_assignment_section'.tr,
                    desc: 'vehicle_assignment_desc'.tr,
                    color: kPurple,
                  ),
                  const SizedBox(height: 12),
                  _buildVehicleAssignmentCard(),

                  const SizedBox(height: 24),

                  // Section 3: Device Status
                  _buildSectionHeader(
                    number: '3',
                    title: 'device_status_section'.tr,
                    desc: 'device_status_desc'.tr,
                    color: const Color(0xFF10B981),
                  ),
                  const SizedBox(height: 12),
                  _buildDeviceStatusCard(),
                ],
              ),
            ),

            // Bottom Buttons Bar
            _buildBottomActionBar(context),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        InkWell(
          onTap: controller.onBackPressed,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Obx(() {
            final isEdit = controller.isEditMode.value;
            final boxId = controller.boxIdCtrl.text.trim();
            final title = isEdit ? 'edit_edge_device'.tr : 'register_edge_device'.tr;
            final subtitle = isEdit
                ? (boxId.isNotEmpty ? '${'update_details_for_box'.tr}$boxId' : 'edit_edge_device_subtitle'.tr)
                : 'register_edge_device_subtitle'.tr;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            );
          }),
        ),
        const SizedBox(width: 8),
        Obx(() {
          if (controller.isEditMode.value) return const SizedBox.shrink();
          return InkWell(
            onTap: controller.onScanQr,
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: kPurple.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kPurple.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.qr_code_scanner_rounded, color: kPurple, size: 16),
                  const SizedBox(width: 5),
                  Text(
                    'scan_qr'.tr.isNotEmpty ? 'scan_qr'.tr : 'Scan QR',
                    style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // ---------------- Section Header ----------------
  Widget _buildSectionHeader({
    required String number,
    required String title,
    required String desc,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Text(
            number,
            style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Section 1: Device Info Card ----------------
  Widget _buildDeviceInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Box ID / Serial Number
          Row(
            children: [
              Text(
                'box_id_label'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(width: 4),
              Obx(() => controller.isEditMode.value
                  ? const SizedBox.shrink()
                  : const Text('*', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() {
            final error = controller.boxIdError.value;
            final isEdit = controller.isEditMode.value;

            return TextField(
              controller: controller.boxIdCtrl,
              readOnly: isEdit,
              style: TextStyle(
                color: isEdit ? Colors.white70 : Colors.white,
                fontSize: 12.5,
                fontFamily: 'monospace',
                fontWeight: FontWeight.bold,
              ),
              decoration: InputDecoration(
                hintText: 'box_id_ph'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                filled: true,
                fillColor: isEdit ? const Color(0xFF13151F) : kFieldBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                errorText: error,
                errorStyle: const TextStyle(color: Color(0xFFEF4444), fontSize: 11),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: error != null ? const Color(0xFFEF4444) : const Color(0xFF334155))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: isEdit ? const Color(0xFF334155) : const Color(0xFF3B82F6), width: 1.5)),
                prefixIcon: Icon(isEdit ? Icons.lock_outline_rounded : Icons.qr_code_2_rounded, color: isEdit ? Colors.white38 : Colors.white54, size: 18),
              ),
            );
          }),
          const SizedBox(height: 4),
          Obx(() {
            return Text(
              controller.isEditMode.value ? 'box_id_locked_desc'.tr : 'box_id_desc'.tr,
              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
            );
          }),

          const SizedBox(height: 16),

          // MAC Address (Optional)
          Text(
            'mac_address_label'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller.macCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontFamily: 'monospace'),
            decoration: InputDecoration(
              hintText: 'mac_address_ph'.tr,
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              filled: true,
              fillColor: kFieldBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5)),
              prefixIcon: const Icon(Icons.settings_ethernet_rounded, color: Colors.white54, size: 18),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'mac_address_desc'.tr,
            style: const TextStyle(color: Colors.white38, fontSize: 10.5),
          ),

          const SizedBox(height: 16),

          // Agent / Firmware Version
          Text(
            'agent_version_label'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller.agentVersionCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12.5),
            decoration: InputDecoration(
              hintText: 'agent_version_ph'.tr,
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              filled: true,
              fillColor: kFieldBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5)),
              prefixIcon: const Icon(Icons.memory_rounded, color: Colors.white54, size: 18),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'agent_version_desc'.tr,
            style: const TextStyle(color: Colors.white38, fontSize: 10.5),
          ),
        ],
      ),
    );
  }

  // ---------------- Section 2: Cascading Vehicle & Assignment Card ----------------
  Widget _buildVehicleAssignmentCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step Flow Indicator Banner (Web Parity)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                Text(
                  'flow_label'.tr,
                  style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        Text('flow_step1_org'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 5),
                          child: Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Colors.white38),
                        ),
                        Text('flow_step2_fleet'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 5),
                          child: Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Colors.white38),
                        ),
                        Text('flow_step3_bus'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 1. Organization / Company Select (Required)
          Row(
            children: [
              Text(
                'select_org_label'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(width: 4),
              const Text('*', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() {
            if (controller.isLoadingLookups.value) {
              return _buildLoadingDropdown('Loading organizations...');
            }

            final currentOrgId = controller.selectedOrganizationId.value?.toString();
            final items = controller.organizations.map((org) {
              final codeStr = org.code.isNotEmpty ? ' (${org.code})' : '';
              return DropdownMenuItem<String>(
                value: org.id,
                child: Text(
                  '${org.name}$codeStr',
                  style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }).toList();

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: controller.orgError.value != null ? const Color(0xFFEF4444) : const Color(0xFF334155),
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: currentOrgId,
                  isExpanded: true,
                  dropdownColor: const Color(0xFF1E293B),
                  hint: Text('select_org_ph'.tr, style: const TextStyle(color: Colors.white38, fontSize: 12)),
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54),
                  items: [
                    DropdownMenuItem<String>(
                      value: '',
                      child: Text('select_org_ph'.tr, style: const TextStyle(color: Colors.white54, fontSize: 12.5)),
                    ),
                    ...items,
                  ],
                  onChanged: (val) => controller.onOrganizationChanged(val),
                ),
              ),
            );
          }),
          const SizedBox(height: 4),
          Text('select_org_desc'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),

          const SizedBox(height: 16),

          // 2. Fleet Select (Cascading: Filtered by Organization)
          Obx(() {
            final hasOrg = controller.selectedOrganizationId.value != null && controller.selectedOrganizationId.value.toString().isNotEmpty;
            final availableCount = controller.availableFleets.length;
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'select_fleet_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                if (hasOrg)
                  Text(
                    '($availableCount ${'available_count_fmt'.tr})',
                    style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
              ],
            );
          }),
          const SizedBox(height: 6),
          Obx(() {
            final hasOrg = controller.selectedOrganizationId.value != null && controller.selectedOrganizationId.value.toString().isNotEmpty;
            final availableList = controller.availableFleets;
            final isEnabled = hasOrg && availableList.isNotEmpty;

            final placeholder = !hasOrg
                ? 'select_org_first'.tr
                : availableList.isEmpty
                    ? 'no_fleets_org'.tr
                    : 'select_fleet_ph'.tr;

            final currentFleetId = controller.selectedFleetId.value?.toString();
            final items = availableList.map((fl) {
              final typeStr = fl.fleetType.isNotEmpty ? ' (${fl.fleetType})' : '';
              return DropdownMenuItem<String>(
                value: fl.id,
                child: Text(
                  '${fl.name}$typeStr',
                  style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }).toList();

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isEnabled ? kFieldBg : const Color(0xFF13151F),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isEnabled ? const Color(0xFF334155) : const Color(0xFF1E293B)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: currentFleetId,
                  isExpanded: true,
                  disabledHint: Text(placeholder, style: const TextStyle(color: Colors.white30, fontSize: 12)),
                  dropdownColor: const Color(0xFF1E293B),
                  hint: Text(placeholder, style: TextStyle(color: isEnabled ? Colors.white38 : Colors.white24, fontSize: 12)),
                  icon: Icon(Icons.keyboard_arrow_down_rounded, color: isEnabled ? Colors.white54 : Colors.white24),
                  items: isEnabled
                      ? [
                          DropdownMenuItem<String>(
                            value: '',
                            child: Text('select_fleet_ph'.tr, style: const TextStyle(color: Colors.white54, fontSize: 12.5)),
                          ),
                          ...items,
                        ]
                      : null,
                  onChanged: isEnabled ? (val) => controller.onFleetChanged(val) : null,
                ),
              ),
            );
          }),
          const SizedBox(height: 4),
          Text('select_fleet_desc'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),

          const SizedBox(height: 16),

          // 3. Bus / Vehicle Select (Cascading: Filtered by Organization + Fleet)
          Obx(() {
            final hasOrg = controller.selectedOrganizationId.value != null && controller.selectedOrganizationId.value.toString().isNotEmpty;
            final hasFleet = controller.selectedFleetId.value != null && controller.selectedFleetId.value.toString().isNotEmpty;
            final availableCount = controller.availableVehicles.length;
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'select_bus_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                if (hasOrg && hasFleet)
                  Text(
                    '($availableCount ${'buses_count_fmt'.tr})',
                    style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10.5, fontWeight: FontWeight.bold),
                  ),
              ],
            );
          }),
          const SizedBox(height: 6),
          Obx(() {
            final hasOrg = controller.selectedOrganizationId.value != null && controller.selectedOrganizationId.value.toString().isNotEmpty;
            final hasFleet = controller.selectedFleetId.value != null && controller.selectedFleetId.value.toString().isNotEmpty;
            final availableList = controller.availableVehicles;
            final isEnabled = hasOrg && hasFleet && availableList.isNotEmpty;

            final placeholder = !hasOrg
                ? 'select_org_first'.tr
                : !hasFleet
                    ? 'select_fleet_first'.tr
                    : availableList.isEmpty
                        ? 'no_vehicles_fleet'.tr
                        : 'select_bus_ph'.tr;

            final currentVehicleId = controller.selectedVehicleId.value?.toString();
            final items = availableList.map((v) {
              final label = v.registrationNumber.isNotEmpty ? '${'bus_prefix'.tr}${v.registrationNumber}' : '${'bus_prefix'.tr}${v.id}';
              final sub = v.model.isNotEmpty ? ' (${v.model})' : (v.vehicleType.isNotEmpty ? ' (${v.vehicleType})' : '');
              return DropdownMenuItem<String>(
                value: v.id,
                child: Text(
                  '$label$sub',
                  style: const TextStyle(color: Colors.white, fontSize: 12.5),
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }).toList();

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isEnabled ? kFieldBg : const Color(0xFF13151F),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isEnabled ? const Color(0xFF334155) : const Color(0xFF1E293B)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: currentVehicleId,
                  isExpanded: true,
                  disabledHint: Text(placeholder, style: const TextStyle(color: Colors.white30, fontSize: 12)),
                  dropdownColor: const Color(0xFF1E293B),
                  hint: Text(placeholder, style: TextStyle(color: isEnabled ? Colors.white38 : Colors.white24, fontSize: 12)),
                  icon: Icon(Icons.keyboard_arrow_down_rounded, color: isEnabled ? Colors.white54 : Colors.white24),
                  items: isEnabled
                      ? [
                          DropdownMenuItem<String>(
                            value: '',
                            child: Text('select_bus_ph'.tr, style: const TextStyle(color: Colors.white54, fontSize: 12.5)),
                          ),
                          ...items,
                        ]
                      : null,
                  onChanged: isEnabled ? (val) => controller.onVehicleChanged(val) : null,
                ),
              ),
            );
          }),
          const SizedBox(height: 4),
          Text('select_bus_desc'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),

          const SizedBox(height: 16),

          // Auto-Assigned Depot / Garage Display Card (Web Parity)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'depot_garage'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                ),
                child: Text(
                  'auto_assigned_from_fleet'.tr,
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() {
            final depotName = controller.assignedDepotName;
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF11141D),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warehouse_rounded, color: Color(0xFF3B82F6), size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      depotName ?? 'select_fleet_depot_ph'.tr,
                      style: TextStyle(
                        color: depotName != null ? Colors.white : Colors.white38,
                        fontSize: 12,
                        fontWeight: depotName != null ? FontWeight.bold : FontWeight.normal,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 4),
          Text('depot_inherited_desc'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),

          const SizedBox(height: 16),

          // Internet / SIM Network Provider
          Text(
            'sim_network_provider'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller.simNetworkCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12.5),
            decoration: InputDecoration(
              hintText: 'sim_network_ph'.tr,
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              filled: true,
              fillColor: kFieldBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5)),
              prefixIcon: const Icon(Icons.sim_card_rounded, color: Colors.white54, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingDropdown(String msg) {
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white54)),
          const SizedBox(width: 10),
          Text(msg, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }

  // ---------------- Section 3: Device Status Card ----------------
  Widget _buildDeviceStatusCard() {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Obx(() {
        return SwitchListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          title: Text(
            'enable_device_title'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              'enable_device_desc'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
          value: controller.isActive.value,
          activeThumbColor: const Color(0xFF10B981),
          onChanged: (val) => controller.isActive.value = val,
        );
      }),
    );
  }

  // ---------------- Bottom Action Bar ----------------
  Widget _buildBottomActionBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: controller.onBackPressed,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF334155)),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'cancel'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Obx(() {
              final isSaving = controller.isSaving.value;
              final isEdit = controller.isEditMode.value;
              final btnLabel = isEdit ? 'save_changes'.tr : 'register_device_btn'.tr;

              return InkWell(
                onTap: isSaving ? null : controller.onRegisterDevice,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: isSaving ? null : AppTheme.primaryGradient,
                    color: isSaving ? const Color(0xFF334155) : null,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientPink.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: isSaving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_rounded, color: Colors.white, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                btnLabel,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
