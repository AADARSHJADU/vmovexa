import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/device_diagnostics_controller.dart';

class DeviceDiagnosticsView extends GetView<DeviceDiagnosticsController> {
  const DeviceDiagnosticsView({super.key});

  // Dark Theme Colors matching Admin Panel
  static const Color kBg = Color(0xFF090A10);
  static const Color kCardBg = Color(0xFF13141F);
  static const Color kCardBorder = Color(0x1AFFFFFF);
  static const Color kFieldBg = Color(0xFF1A1B28);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kEmerald = Color(0xFF10B981);
  static const Color kEmeraldText = Color(0xFF34D399);
  static const Color kEmeraldBg = Color(0x2610B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kAmberText = Color(0xFFFBBF24);
  static const Color kAmberBg = Color(0x26F59E0B);
  static const Color kRed = Color(0xFFEF4444);
  static const Color kRedText = Color(0xFFF87171);
  static const Color kRedBg = Color(0x26EF4444);
  static const Color kBlue = Color(0xFF3B82F6);
  static const Color kBlueBg = Color(0x263B82F6);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.selectedDevice.value == null) {
            return const Center(
              child: CircularProgressIndicator(color: kPurple),
            );
          }

          return RefreshIndicator(
            color: kPurple,
            backgroundColor: kCardBg,
            onRefresh: controller.syncTelemetry,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                _buildSearchAndDeviceSelector(),
                const SizedBox(height: 16),
                _buildSelectedDeviceBanner(),
                const SizedBox(height: 18),
                _buildSubsystemMatrix(),
                const SizedBox(height: 18),
                _buildRunDiagnosticsAction(),
                const SizedBox(height: 18),
                _buildDiagnosticRoutineChecklist(),
                const SizedBox(height: 20),
                _buildConsoleTerminalLogs(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =====================================================================
  // 1. Header with Breadcrumb, Live Engine Badge, Sync & Manage Inventory
  // =====================================================================
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Breadcrumb
        Row(
          children: [
            GestureDetector(
              onTap: controller.onBackPressed,
              child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 16),
            ),
            const SizedBox(width: 8),
            Text(
              'technician'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w500),
            ),
            const Text(
              '  /  ',
              style: TextStyle(color: Colors.white24, fontSize: 12),
            ),
            Expanded(
              child: Text(
                'device_gps_diagnostics_title'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Title with Live Telemetry Engine ping badge
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 6,
          children: [
            Text(
              'device_gps_diagnostics_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 19,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.4,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFF38BDF8),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'live_telemetry_engine_badge'.tr,
                    style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 5),
        Text(
          'diagnostics_page_subtitle'.tr,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 11.5,
            fontWeight: FontWeight.w400,
            height: 1.35,
          ),
        ),
        const SizedBox(height: 12),

        // Action Buttons: Sync & Manage Inventory (Matching Admin Panel)
        Row(
          children: [
            // Sync Button
            Obx(() => InkWell(
                  onTap: controller.isSyncing.value ? null : controller.syncTelemetry,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kCardBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        controller.isSyncing.value
                            ? const SizedBox(
                                width: 13,
                                height: 13,
                                child: CircularProgressIndicator(strokeWidth: 1.8, color: Colors.white70),
                              )
                            : const Icon(Icons.sync_rounded, color: Colors.white70, size: 15),
                        const SizedBox(width: 6),
                        Text(
                          'sync_telemetry_btn'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                )),
            const SizedBox(width: 10),

            // Manage Inventory Button (with Primary Gradient)
            Expanded(
              child: InkWell(
                onTap: controller.goToManageInventory,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGradient.colors.first.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Text(
                          'manage_inventory_btn'.tr,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
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

  // =====================================================================
  // 2. Search & Select Device Bar (with Filter Pills & Horizontal Selector)
  // =====================================================================
  Widget _buildSearchAndDeviceSelector() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Input
          Container(
            height: 40,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kCardBorder),
            ),
            child: Row(
              children: [
                const SizedBox(width: 10),
                const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: (val) => controller.searchQuery.value = val,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'search_box_mac_bus_ph'.tr,
                      hintStyle: const TextStyle(color: Colors.white38, fontSize: 11.5),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                Obx(() {
                  if (controller.searchQuery.value.isNotEmpty) {
                    return IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white38, size: 16),
                      onPressed: () => controller.searchQuery.value = '',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    );
                  }
                  return const SizedBox.shrink();
                }),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Status Filter Pills (ALL, ONLINE, WARNING, OFFLINE)
          Obx(() {
            final active = controller.statusFilter.value;
            final pills = [
              {'id': 'ALL', 'label': 'filter_all'.tr},
              {'id': 'ONLINE', 'label': 'filter_online'.tr},
              {'id': 'WARNING', 'label': 'filter_warning'.tr},
              {'id': 'OFFLINE', 'label': 'filter_offline'.tr},
            ];

            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: pills.map((p) {
                  final isSelected = active == p['id'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: InkWell(
                      onTap: () => controller.statusFilter.value = p['id']!,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          gradient: isSelected ? AppTheme.primaryGradient : null,
                          color: isSelected ? null : kFieldBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isSelected ? Colors.transparent : kCardBorder),
                        ),
                        child: Text(
                          p['label']!,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.white60,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),
          const SizedBox(height: 12),

          // Device Count & Click Switch Header
          Obx(() => Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${'select_target_device_header'.tr} (${controller.filteredDevices.length})',
                    style: const TextStyle(
                      color: Colors.white38,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'click_to_switch_target'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                ],
              )),
          const SizedBox(height: 8),

          // Horizontal Device List Selector
          Obx(() {
            final devices = controller.filteredDevices;
            if (devices.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 20),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kCardBorder, style: BorderStyle.solid),
                ),
                child: Text(
                  'no_edge_devices_match'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              );
            }

            return SizedBox(
              height: 72,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: devices.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final d = devices[index];
                  final isSelected = controller.selectedDevice.value?.idStr == d.idStr;
                  final devOnline = d.isOnline;

                  return InkWell(
                    onTap: () => controller.selectDevice(d),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 175,
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: isSelected ? kPurple.withValues(alpha: 0.15) : kFieldBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? kPurple : kCardBorder,
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: devOnline ? kEmerald : Colors.white38,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  d.displayId,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: devOnline ? kEmeraldBg : const Color(0x1AFFFFFF),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  devOnline ? 'filter_online'.tr : 'filter_offline'.tr,
                                  style: TextStyle(
                                    color: devOnline ? kEmeraldText : Colors.white54,
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 5),
                          Text(
                            d.vehicleRegistration != '—' && d.vehicleRegistration.isNotEmpty
                                ? '${'assigned_transit_label'.tr} ${d.vehicleRegistration}'
                                : 'unassigned_label'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white54, fontSize: 10),
                          ),
                          Text(
                            d.mac.isNotEmpty ? 'MAC: ${d.mac}' : 'MAC: —',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  // =====================================================================
  // 3. Selected Target Device Live Banner (with Ping Platform & Reboot)
  // =====================================================================
  Widget _buildSelectedDeviceBanner() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      if (dev == null) return const SizedBox.shrink();
      final isOnline = controller.isOnline;
      final latency = controller.brokerLatency.value;

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0F101A), Color(0xFF161826), Color(0xFF1E1B38)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0x336366F1)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A6366F1),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Tag, Box ID & Status Pill
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0x263B82F6),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0x403B82F6)),
                  ),
                  child: Text(
                    'target_edge_device_pill'.tr,
                    style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    dev.displayId,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isOnline ? kEmeraldBg : kRedBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isOnline ? kEmerald.withValues(alpha: 0.4) : kRed.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: isOnline ? kEmerald : kRed,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        isOnline ? 'online_live_telemetry_badge'.tr : 'device_offline_badge'.tr,
                        style: TextStyle(
                          color: isOnline ? kEmeraldText : kRedText,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Info Metadata Grid
            Wrap(
              spacing: 12,
              runSpacing: 4,
              children: [
                _buildBannerInfoItem('assigned_transit_label'.tr, dev.vehicleRegistration != '—' ? dev.vehicleRegistration : 'unassigned_label'.tr),
                _buildBannerInfoItem('mac_colon_label'.tr, dev.mac.isNotEmpty ? dev.mac : '—'),
                _buildBannerInfoItem('agent_colon_label'.tr, dev.agentVersion.isNotEmpty ? dev.agentVersion : '—'),
                _buildBannerInfoItem('heartbeat_colon_label'.tr, controller.lastHeartbeatDiff.value, valueColor: kEmeraldText),
              ],
            ),
            const SizedBox(height: 14),

            // Quick Actions: Ping Platform & Reboot Device
            Row(
              children: [
                // Ping Platform Button
                Expanded(
                  child: InkWell(
                    onTap: controller.handlePingBroker,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E2132),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0x3338BDF8)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.speed_rounded, color: Color(0xFF38BDF8), size: 15),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              latency != null
                                  ? '${'ping_platform_btn'.tr} (${latency}ms)'
                                  : 'ping_platform_btn'.tr,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Remote Reboot Button
                Expanded(
                  child: Obx(() => InkWell(
                        onTap: controller.isRebooting.value ? null : controller.onRebootPressed,
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0x26EF4444),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0x40EF4444)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              controller.isRebooting.value
                                  ? const SizedBox(
                                      width: 13,
                                      height: 13,
                                      child: CircularProgressIndicator(strokeWidth: 1.8, color: Colors.white70),
                                    )
                                  : const Icon(Icons.restart_alt_rounded, color: Color(0xFFF87171), size: 15),
                              const SizedBox(width: 6),
                              Text(
                                controller.isRebooting.value ? 'rebooting_btn'.tr : 'reboot_btn'.tr,
                                style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      )),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildBannerInfoItem(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 10.5)),
        const SizedBox(width: 4),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? Colors.white,
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            fontFamily: value.contains(':') ? 'monospace' : null,
          ),
        ),
      ],
    );
  }

  // =====================================================================
  // 4. Live Configuration & Subsystem Diagnostics Matrix (3 Cards)
  // =====================================================================
  Widget _buildSubsystemMatrix() {
    return Obx(() {
      final tele = controller.telemetry.value;
      final dev = controller.selectedDevice.value;
      final isOnline = controller.isOnline;

      // Card 1 GPS Data
      final hasGpsFix = tele?.gpsLocked == true || (tele?.lat != null && tele?.lng != null);
      final gpsDisconnected = tele?.gpsConnected == false;
      final gpsStatusLabel = hasGpsFix
          ? 'gps_3d_lock_badge'.tr
          : (gpsDisconnected ? 'gps_disconnected_badge'.tr : 'gps_no_fix_badge'.tr);
      final coordsText = (tele?.lat != null && tele?.lng != null)
          ? '${tele!.lat!.toStringAsFixed(4)}, ${tele.lng!.toStringAsFixed(4)}'
          : 'awaiting_fix_label'.tr;
      final speedHeadingText = (tele?.speed != null || tele?.heading != null)
          ? '${tele?.speed?.toStringAsFixed(1) ?? "0.0"} km/h · ${tele?.heading != null ? "${tele!.heading!.round()}°" : "—"}'
          : '0.0 km/h · —';

      // Card 2 Thermals & CPU/RAM
      final hasTelemetry = tele != null && tele.socTemp != '—';
      final cpuPct = tele?.cpuUsagePct ?? 0.0;
      final ramPct = tele?.ramUsagePct ?? 0.0;

      // Card 3 MQTT Data
      final brokerLatency = controller.brokerLatency.value;
      final boxId = dev?.displayId ?? '*';

      return Column(
        children: [
          // Subsystem Card 1: GNSS / GPS Subsystem (Emerald Accent)
          _buildSubsystemCard(
            title: 'gnss_gps_subsystem_title'.tr,
            subtitle: 'serial_port_dev_ttyusb0'.tr,
            icon: Icons.gps_fixed_rounded,
            gradientColors: const [Color(0xFF10B981), Color(0xFF14B8A6)],
            statusBadge: _buildMiniStatusBadge(
              label: gpsStatusLabel,
              color: hasGpsFix ? kEmeraldText : (gpsDisconnected ? kRedText : kAmberText),
              bgColor: hasGpsFix ? kEmeraldBg : (gpsDisconnected ? kRedBg : kAmberBg),
              borderColor: hasGpsFix ? kEmerald : (gpsDisconnected ? kRed : kAmber),
            ),
            metrics: [
              _buildMetricItem(
                label: 'satellites_locked_label'.tr,
                value: '${tele?.satellitesCount ?? 0} ${'satellites_count_text'.tr}',
                valueColor: hasGpsFix ? kEmeraldText : Colors.white70,
              ),
              _buildMetricItem(
                label: 'hardware_interface_label'.tr,
                value: gpsDisconnected ? 'gps_serial_disconnected'.tr : '/dev/ttyUSB0 (NMEA)',
                isMonospace: true,
              ),
              _buildMetricItem(
                label: 'coordinates_label'.tr,
                value: coordsText,
                isMonospace: true,
                onCopy: hasGpsFix ? () => controller.copyCoordinates(coordsText) : null,
              ),
              _buildMetricItem(
                label: 'speed_heading_label'.tr,
                value: speedHeadingText,
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Subsystem Card 2: Core RK3588 Health (Blue Accent)
          _buildSubsystemCard(
            title: 'core_rk3588_health_title'.tr,
            subtitle: 'thermals_cpu_ram_desc'.tr,
            icon: Icons.memory_rounded,
            gradientColors: const [Color(0xFF3B82F6), Color(0xFF6366F1)],
            statusBadge: _buildMiniStatusBadge(
              label: hasTelemetry ? 'active_badge'.tr : 'no_data_badge'.tr,
              color: hasTelemetry ? kEmeraldText : Colors.white54,
              bgColor: hasTelemetry ? kEmeraldBg : const Color(0x1AFFFFFF),
              borderColor: hasTelemetry ? kEmerald : const Color(0x33FFFFFF),
            ),
            metrics: [
              _buildMetricItem(
                label: 'soc_temp_label'.tr,
                value: tele?.socTemp ?? '—',
                valueColor: hasTelemetry ? kEmeraldText : Colors.white54,
              ),
              _buildProgressMetricItem(
                label: 'cpu_usage_label'.tr,
                valueStr: tele?.cpuUsage ?? '—',
                progress: cpuPct > 0 ? (cpuPct / 100.0).clamp(0.0, 1.0) : 0.0,
                progressColor: const Color(0xFF38BDF8),
              ),
              _buildProgressMetricItem(
                label: 'ram_consumption_label'.tr,
                valueStr: tele?.ramUsage ?? '—',
                progress: ramPct > 0 ? (ramPct / 100.0).clamp(0.0, 1.0) : 0.0,
                progressColor: const Color(0xFF818CF8),
              ),
              _buildMetricItem(
                label: 'storage_free_label'.tr,
                value: tele?.storageFree ?? '—',
                valueColor: kEmeraldText,
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Subsystem Card 3: MQTT Telemetry Bus & Network (Amber Accent)
          _buildSubsystemCard(
            title: 'mqtt_telemetry_bus_title'.tr,
            subtitle: 'tcp_broker_port_1883'.tr,
            icon: Icons.sensors_rounded,
            gradientColors: const [Color(0xFFF59E0B), Color(0xFFEA580C)],
            statusBadge: _buildMiniStatusBadge(
              label: isOnline ? 'filter_online'.tr : 'filter_offline'.tr,
              color: isOnline ? kEmeraldText : Colors.white54,
              bgColor: isOnline ? kEmeraldBg : const Color(0x1AFFFFFF),
              borderColor: isOnline ? kEmerald : const Color(0x33FFFFFF),
            ),
            metrics: [
              _buildMetricItem(
                label: 'broker_port_label'.tr,
                value: '127.0.0.1:1883',
                isMonospace: true,
              ),
              _buildMetricItem(
                label: 'live_latency_label'.tr,
                value: brokerLatency != null ? '$brokerLatency ms' : '—',
                valueColor: brokerLatency != null ? kEmeraldText : Colors.white70,
              ),
              _buildMetricItem(
                label: 'location_topic_label'.tr,
                value: 'vehicle/$boxId/location',
                isMonospace: true,
              ),
              _buildMetricItem(
                label: 'health_topic_label'.tr,
                value: 'vehicle/$boxId/health',
                isMonospace: true,
              ),
            ],
          ),
        ],
      );
    });
  }

  Widget _buildSubsystemCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required Widget statusBadge,
    required List<Widget> metrics,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: gradientColors),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon, color: Colors.white, size: 16),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                            ),
                          ),
                          Text(
                            subtitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white38, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              statusBadge,
            ],
          ),
          const SizedBox(height: 12),

          // Inner Metrics Box
          Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1B26),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: List.generate(metrics.length, (index) {
                return Padding(
                  padding: EdgeInsets.only(bottom: index == metrics.length - 1 ? 0 : 8),
                  child: metrics[index],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStatusBadge({
    required String label,
    required Color color,
    required Color bgColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: borderColor.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _buildMetricItem({
    required String label,
    required String value,
    Color? valueColor,
    bool isMonospace = false,
    VoidCallback? onCopy,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
              style: TextStyle(
                color: valueColor ?? Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                fontFamily: isMonospace ? 'monospace' : null,
              ),
            ),
            if (onCopy != null) ...[
              const SizedBox(width: 4),
              GestureDetector(
                onTap: onCopy,
                child: const Icon(Icons.copy_rounded, color: Colors.white38, size: 12),
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildProgressMetricItem({
    required String label,
    required String valueStr,
    required double progress,
    required Color progressColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
            Text(
              valueStr,
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
            ),
          ],
        ),
        if (progress > 0) ...[
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: const Color(0xFF282A3A),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            ),
          ),
        ],
      ],
    );
  }

  // =====================================================================
  // 5. Action Bar (Run Subsystems Diagnostic Routine with Primary Gradient)
  // =====================================================================
  Widget _buildRunDiagnosticsAction() {
    return Obx(() {
      final isRunning = controller.isRunning.value;

      return InkWell(
        onTap: isRunning ? null : controller.onRunDiagnosticsPressed,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: double.infinity,
          height: 48,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryGradient.colors.first.withValues(alpha: 0.35),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isRunning) ...[
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                ),
                const SizedBox(width: 8),
                Text(
                  'running_subsystems_btn'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ] else ...[
                const Icon(Icons.track_changes_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  'run_subsystems_btn'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                ),
              ],
            ],
          ),
        ),
      );
    });
  }

  // =====================================================================
  // 6. Diagnostic Routine Live Checklist & Assessment Result Card
  // =====================================================================
  Widget _buildDiagnosticRoutineChecklist() {
    return Obx(() {
      final isRunning = controller.isRunning.value;
      final steps = controller.diagnosticSteps;
      final result = controller.diagnosticResult.value;

      if (!isRunning && steps.isEmpty) return const SizedBox.shrink();

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kCardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Checklist Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              'diag_routine_checklist_title'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          if (result != null) ...[
                            const SizedBox(width: 8),
                            _buildMiniStatusBadge(
                              label: result.status == 'PASSED'
                                  ? 'status_passed_badge'.tr
                                  : 'status_check_required_badge'.tr,
                              color: result.status == 'PASSED' ? kEmeraldText : kAmberText,
                              bgColor: result.status == 'PASSED' ? kEmeraldBg : kAmberBg,
                              borderColor: result.status == 'PASSED' ? kEmerald : kAmber,
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'diag_routine_checklist_desc'.tr,
                        style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 4 Sequential Steps
            ...steps.map((step) {
              final isPass = step.status == 'pass';
              final isWarning = step.status == 'warning';
              final isRunningStep = step.status == 'running';

              Color itemBorder = kCardBorder;
              Color itemBg = kFieldBg;
              if (isPass) {
                itemBorder = const Color(0x3310B981);
                itemBg = const Color(0x1410B981);
              } else if (isWarning) {
                itemBorder = const Color(0x33F59E0B);
                itemBg = const Color(0x14F59E0B);
              } else if (isRunningStep) {
                itemBorder = const Color(0x333B82F6);
                itemBg = const Color(0x143B82F6);
              }

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: itemBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: itemBorder),
                ),
                child: Row(
                  children: [
                    // Step Number / Status Icon
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: isPass
                            ? kEmerald
                            : (isWarning ? kAmber : (isRunningStep ? kBlue : const Color(0xFF2E3048))),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      alignment: Alignment.center,
                      child: isPass
                          ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                          : isWarning
                              ? const Icon(Icons.priority_high_rounded, color: Colors.white, size: 14)
                              : isRunningStep
                                  ? const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.white),
                                    )
                                  : Text(
                                      '${step.id}',
                                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w700),
                                    ),
                    ),
                    const SizedBox(width: 10),

                    // Step Name & Detail
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step.nameKey.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            step.detail,
                            style: const TextStyle(color: Colors.white54, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Status Text Badge
                    Text(
                      isPass
                          ? 'status_pass_badge'.tr
                          : isWarning
                              ? 'status_warning_badge'.tr
                              : isRunningStep
                                  ? 'status_running_badge'.tr
                                  : 'status_pending_badge'.tr,
                      style: TextStyle(
                        color: isPass
                            ? kEmeraldText
                            : (isWarning ? kAmberText : (isRunningStep ? const Color(0xFF60A5FA) : Colors.white38)),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              );
            }),

            // Real Diagnostics Assessment Result Banner
            if (result != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: result.status == 'PASSED' ? const Color(0x1F10B981) : const Color(0x1FF59E0B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: result.status == 'PASSED' ? const Color(0x4D10B981) : const Color(0x4DF59E0B),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      result.status == 'PASSED' ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                      color: result.status == 'PASSED' ? kEmeraldText : kAmberText,
                      size: 18,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'real_diag_assessment_label'.tr,
                            style: TextStyle(
                              color: result.status == 'PASSED' ? kEmeraldText : kAmberText,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            result.summary,
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${'diag_completed_label'.tr} ${result.timestamp}',
                            style: const TextStyle(color: Colors.white38, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      );
    });
  }

  // =====================================================================
  // 7. Real-Time Telemetry & GPS Logs Console Terminal
  // =====================================================================
  Widget _buildConsoleTerminalLogs() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF07080D),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x1FFFFFFF)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black54,
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Terminal Header with Controls
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF10121C),
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
              border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Indicator Row
                Obx(() {
                  final isStreaming = controller.isLiveStreaming.value;
                  final count = controller.filteredLogs.length;

                  return Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isStreaming ? kEmeraldBg : kAmberBg,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isStreaming ? kEmerald.withValues(alpha: 0.4) : kAmber.withValues(alpha: 0.4),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: isStreaming ? kEmerald : kAmber,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isStreaming
                                  ? 'console_live_telemetry_stream'.tr
                                  : 'console_stream_paused'.tr,
                              style: TextStyle(
                                color: isStreaming ? kEmeraldText : kAmberText,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '($count)',
                        style: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'monospace'),
                      ),
                    ],
                  );
                }),
                const SizedBox(height: 10),

                // Tab Bar Filter Pills (ALL, GPS, HEALTH, MQTT, DIAGS) with Primary Gradient on Active
                Obx(() {
                  final activeTab = controller.logFilter.value;
                  final tabs = ['ALL', 'GPS', 'HEALTH', 'MQTT', 'DIAGS'];

                  return SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: tabs.map((tab) {
                        final isSelected = activeTab == tab;

                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: InkWell(
                            onTap: () => controller.logFilter.value = tab,
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: isSelected ? AppTheme.primaryGradient : null,
                                color: isSelected ? null : const Color(0xFF1E2130),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: isSelected ? Colors.transparent : const Color(0x1AFFFFFF),
                                ),
                              ),
                              child: Text(
                                tab,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white60,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  );
                }),
                const SizedBox(height: 8),

                // Controls Row: Search Input + AutoScroll + Pause + Clear + Copy
                Row(
                  children: [
                    // Search input
                    Expanded(
                      child: Container(
                        height: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF181B28),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0x1AFFFFFF)),
                        ),
                        child: TextField(
                          onChanged: (val) => controller.logSearch.value = val,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
                          decoration: InputDecoration(
                            hintText: 'filter_logs_input_ph'.tr,
                            hintStyle: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'monospace'),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.only(bottom: 6),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Auto-scroll toggle
                    Obx(() => _buildTerminalMiniButton(
                          label: '${'auto_scroll_toggle'.tr} ${controller.autoScroll.value ? "on_caps".tr : "off_caps".tr}',
                          isActive: controller.autoScroll.value,
                          onTap: () => controller.autoScroll.toggle(),
                        )),
                    const SizedBox(width: 4),

                    // Pause / Resume toggle
                    Obx(() => _buildTerminalMiniButton(
                          label: controller.isLiveStreaming.value ? 'pause_btn'.tr : 'resume_btn'.tr,
                          onTap: () => controller.isLiveStreaming.toggle(),
                        )),
                    const SizedBox(width: 4),

                    // Clear button
                    _buildTerminalMiniButton(
                      label: 'clear_btn'.tr,
                      onTap: controller.clearLogs,
                    ),
                    const SizedBox(width: 4),

                    // Copy button
                    _buildTerminalMiniButton(
                      label: 'copy_btn'.tr,
                      isGradient: true,
                      onTap: controller.copyLogs,
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Terminal Body
          Container(
            height: 190,
            padding: const EdgeInsets.all(12),
            color: const Color(0xFF07080D),
            child: Obx(() {
              final logs = controller.filteredLogs;

              if (logs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.speed_rounded, color: Colors.white24, size: 28),
                      const SizedBox(height: 6),
                      Text(
                        'listening_for_telemetry_msg'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 11, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'mqtt_broker_socket_active_msg'.tr,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white24, fontSize: 9.5, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                controller: controller.terminalScrollController,
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final log = logs[index];

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '[${log.time}]',
                          style: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'monospace'),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: log.badgeColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(3),
                            border: Border.all(color: log.badgeColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            log.badge,
                            style: TextStyle(
                              color: log.badgeColor,
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            log.message,
                            style: const TextStyle(color: Colors.white70, fontSize: 10, fontFamily: 'monospace'),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              );
            }),
          ),

          // Terminal Footer Info Bar
          Obx(() {
            final dev = controller.selectedDevice.value;
            final isOnline = controller.isOnline;

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Color(0xFF0F111A),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(14)),
                border: Border(top: BorderSide(color: Color(0x14FFFFFF))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      '${'transport_tcp_1883_info'.tr} · ${'target_box_info'.tr} ${dev?.displayId ?? "—"} · ${'port_dev_ttyusb0_info'.tr}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontFamily: 'monospace'),
                    ),
                  ),
                  Text(
                    '${'status_colon_info'.tr} ${isOnline ? 'online_telemetry_active_info'.tr : 'filter_offline'.tr}',
                    style: TextStyle(
                      color: isOnline ? kEmeraldText : Colors.white38,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w800,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTerminalMiniButton({
    required String label,
    required VoidCallback onTap,
    bool isActive = false,
    bool isGradient = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 7),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: isGradient ? AppTheme.primaryGradient : null,
          color: isGradient ? null : (isActive ? const Color(0x3310B981) : const Color(0xFF1E2130)),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isActive ? kEmerald : const Color(0x1AFFFFFF),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? kEmeraldText : Colors.white70,
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
            fontFamily: 'monospace',
          ),
        ),
      ),
    );
  }
}
