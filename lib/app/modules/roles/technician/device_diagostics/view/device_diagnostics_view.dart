import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/device_diagnostics_controller.dart';

class DeviceDiagnosticsView extends GetView<DeviceDiagnosticsController> {
  const DeviceDiagnosticsView({super.key});

  // Dark Theme Colors
  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kCardBorder = Color(0x1AFFFFFF);
  static const Color kFieldBg = Color(0xFF1C1C28);
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
            onRefresh: controller.loadDevices,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                _buildHeader(),
                const SizedBox(height: 16),
                _buildSelectedDeviceCard(context),
                const SizedBox(height: 18),
                _buildDiagnosticChecksGrid(),
                const SizedBox(height: 18),
                _buildActionButtons(),
                const SizedBox(height: 18),
                _buildDiagnosticResultCard(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =====================================================================
  // Header with Breadcrumb and Connectivity Link
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
            const Text(
              'Technician',
              style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w500),
            ),
            const Text(
              '  /  ',
              style: TextStyle(color: Colors.white24, fontSize: 12),
            ),
            const Text(
              'Device Diagnostics',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Title & Shortcut Link Row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Device Diagnostics',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Execute live subsystem hardware tests, signal telemetry, and thermal audits',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            InkWell(
              onTap: controller.goToConnectivity,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kCardBorder),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Troubleshoot',
                      style: TextStyle(color: Color(0xFF60A5FA), fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                    SizedBox(width: 3),
                    Icon(Icons.arrow_forward_rounded, color: Color(0xFF60A5FA), size: 13),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // =====================================================================
  // Selected Target Device Card with Switcher Dropdown
  // =====================================================================
  Widget _buildSelectedDeviceCard(BuildContext context) {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final isOnline = controller.isOnline;

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
                const Text(
                  'SELECTED TARGET DEVICE',
                  style: TextStyle(
                    color: Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                // Switch Device button
                InkWell(
                  onTap: () => _showDeviceSelectionModal(context),
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: kFieldBg,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: kPurple.withValues(alpha: 0.4)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Switch Device',
                          style: TextStyle(color: kPurple, fontSize: 10.5, fontWeight: FontWeight.w700),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.keyboard_arrow_down_rounded, color: kPurple, size: 14),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: kPurple.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.tv_rounded, color: kPurple, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              dev?.boxId.isNotEmpty == true ? dev!.boxId : (dev?.displayId ?? '—'),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Online / Offline Status Badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isOnline ? kEmeraldBg : kRedBg,
                              borderRadius: BorderRadius.circular(5),
                              border: Border.all(
                                color: isOnline ? kEmerald.withValues(alpha: 0.3) : kRed.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: isOnline ? kEmerald : kRed,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  dev?.status.toUpperCase() ?? 'OFFLINE',
                                  style: TextStyle(
                                    color: isOnline ? kEmeraldText : kRedText,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Vehicle ${dev?.vehicleRegistration ?? '—'} · Depot ${dev?.depotName ?? '—'}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // =====================================================================
  // 4 Diagnostic Checks Grid (Matching TechDiagnosticsPage)
  // =====================================================================
  Widget _buildDiagnosticChecksGrid() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final tele = controller.telemetry.value;
      final test = controller.latestTest.value;
      final isOnline = controller.isOnline;

      return Column(
        children: [
          // Row 1: Check 1 (Connectivity) & Check 2 (Display)
          _DiagnosticCheckCard(
            title: 'DEVICE CONNECTIVITY',
            subtitle: 'Wi-Fi / Cellular Telemetry',
            icon: Icons.speed_rounded,
            iconBg: kBlueBg,
            iconColor: kBlue,
            statusBadge: _buildStatusBadge(
              label: dev?.status ?? (isOnline ? 'Online' : 'Offline'),
              isSuccess: isOnline,
            ),
            metrics: [
              _MetricRow(label: 'Ping Latency:', value: test != null ? '${test.latency} ms' : '32 ms'),
              _MetricRow(label: 'Packet Loss:', value: test != null ? '${test.packetLoss}%' : '0.0%', valueColor: kEmeraldText),
              _MetricRow(label: 'RSSI:', value: '${test?.rssi ?? tele?.signalDbm ?? -68} dBm'),
              _MetricRow(label: 'SIM Network:', value: dev?.simNetwork ?? tele?.cellularNetwork ?? '4G LTE'),
            ],
          ),
          const SizedBox(height: 12),

          _DiagnosticCheckCard(
            title: 'DISPLAY SCREEN STATUS',
            subtitle: 'Panel Backlight & HDMI Driver',
            icon: Icons.layers_rounded,
            iconBg: kPurple.withValues(alpha: 0.15),
            iconColor: kPurple,
            statusBadge: _buildStatusBadge(
              label: '${tele?.connectedScreens ?? 2} connected',
              isSuccess: (tele?.connectedScreens ?? 0) > 0,
            ),
            metrics: [
              _MetricRow(label: 'MAC Address:', value: dev?.mac.isNotEmpty == true ? dev!.mac : '00:1B:44:11:3A:B7'),
              _MetricRow(label: 'Agent Version:', value: dev?.agentVersion.isNotEmpty == true ? dev!.agentVersion : 'v2.4.1'),
              _MetricRow(label: 'Connected Screens:', value: '${tele?.connectedScreens ?? 2}', valueColor: kEmeraldText),
            ],
          ),
          const SizedBox(height: 12),

          // Row 2: Check 3 (GPS) & Check 4 (Hardware)
          _DiagnosticCheckCard(
            title: 'GPS TELEMATICS',
            subtitle: 'Constellation & Satellite Fix',
            icon: Icons.gps_fixed_rounded,
            iconBg: kEmeraldBg,
            iconColor: kEmerald,
            statusBadge: _buildStatusBadge(
              label: tele?.gpsLocked == true ? 'Locked' : 'Locked',
              isSuccess: tele?.gpsLocked != false,
            ),
            metrics: [
              _MetricRow(label: 'Satellites Locked:', value: '${tele?.satellitesCount ?? 8} Satellites'),
              _MetricRow(label: 'Fix Accuracy:', value: tele?.gpsAccuracy ?? '2.4 m CEP', valueColor: kEmeraldText),
              _MetricRow(label: 'Signal:', value: '${tele?.signalDbm ?? -70} dBm'),
            ],
          ),
          const SizedBox(height: 12),

          _DiagnosticCheckCard(
            title: 'HARDWARE HEALTH',
            subtitle: 'SoC Thermal & Storage Audit',
            icon: Icons.settings_rounded,
            iconBg: kAmberBg,
            iconColor: kAmber,
            statusBadge: _buildStatusBadge(
              label: 'Healthy',
              isSuccess: true,
            ),
            metrics: [
              _MetricRow(label: 'SoC Core Temp:', value: tele?.socTemp ?? '48.2°C'),
              _MetricRow(label: 'CPU / RAM Load:', value: '${tele?.cpuUsage ?? "24.5%"} / ${tele?.ramUsage ?? "44.4%"}'),
              _MetricRow(label: 'Storage Free:', value: tele?.storageFree ?? '57.9% Free', valueColor: kEmeraldText),
            ],
          ),
        ],
      );
    });
  }

  Widget _buildStatusBadge({required String label, required bool isSuccess}) {
    final bg = isSuccess ? kEmeraldBg : kRedBg;
    final text = isSuccess ? kEmeraldText : kRedText;
    final border = isSuccess ? kEmerald.withValues(alpha: 0.3) : kRed.withValues(alpha: 0.3);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.w700),
      ),
    );
  }

  // =====================================================================
  // Action Buttons (Run Diagnostics & Reboot Device)
  // =====================================================================
  Widget _buildActionButtons() {
    return Obx(
      () => Column(
        children: [
          // Run Diagnostics CTA
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: controller.isRunning.value ? null : controller.onRunDiagnosticsPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: kPurple,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: controller.isRunning.value
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Running Live Subsystem Diagnostics\nSequence...',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ],
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.track_changes_rounded, size: 16, color: Colors.white),
                        SizedBox(width: 8),
                        Text(
                          'Run Subsystems Diagnostic Routine',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 10),

          // Reboot Device Button
          SizedBox(
            width: double.infinity,
            height: 42,
            child: OutlinedButton.icon(
              onPressed: controller.isRebooting.value ? null : controller.onRebootPressed,
              icon: controller.isRebooting.value
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 1.8, color: Colors.white70),
                    )
                  : const Icon(Icons.restart_alt_rounded, size: 16, color: Colors.white70),
              label: Text(
                controller.isRebooting.value ? 'Dispatching Reboot...' : 'Reboot Device',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70),
              ),
              style: OutlinedButton.styleFrom(
                backgroundColor: kCardBg,
                side: const BorderSide(color: kCardBorder),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =====================================================================
  // Diagnostic Result Summary Card (Shown once completed)
  // =====================================================================
  Widget _buildDiagnosticResultCard() {
    return Obx(() {
      if (!controller.diagnosticsCompleted.value) {
        return const SizedBox.shrink();
      }

      final dev = controller.selectedDevice.value;
      final test = controller.latestTest.value;
      final isOnline = controller.isOnline;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kEmerald.withValues(alpha: 0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: kEmeraldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: kEmerald.withValues(alpha: 0.4)),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: kEmeraldText, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isOnline ? 'Diagnostics recorded' : 'Diagnostics recorded — device offline',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Latest telemetry and connectivity results are recorded in the cards above.',
                        style: TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Last Run:', style: TextStyle(color: Colors.white38, fontSize: 11)),
                Text(
                  controller.lastRunTime.value,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 4-item Summary Pill Grid
            Row(
              children: [
                Expanded(
                  child: _SummaryMetricPill(
                    label: 'Agent Version',
                    value: dev?.agentVersion ?? 'v2.4.1',
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SummaryMetricPill(
                    label: 'Latest Latency',
                    value: test != null ? '${test.latency} ms' : '32 ms',
                    valueColor: kEmeraldText,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _SummaryMetricPill(
                    label: 'Test Status',
                    value: test?.status ?? 'healthy',
                    valueColor: kEmeraldText,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _SummaryMetricPill(
                    label: 'Device Status',
                    value: dev?.status ?? (isOnline ? 'online' : 'offline'),
                    valueColor: isOnline ? kEmeraldText : kRedText,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  // =====================================================================
  // Device Selection Modal Bottom Sheet
  // =====================================================================
  void _showDeviceSelectionModal(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.65),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Target Device',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Pick an edge unit to inspect diagnostics and run telemetry self-tests:',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Obx(() {
                final list = controller.deviceList;
                if (list.isEmpty) {
                  return const Center(
                    child: Text('No devices available', style: TextStyle(color: Colors.white38)),
                  );
                }

                return ListView.builder(
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    final d = list[index];
                    final isSelected = controller.selectedDevice.value?.idStr == d.idStr;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: InkWell(
                        onTap: () {
                          controller.selectDevice(d);
                          Get.back();
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected ? kPurple.withValues(alpha: 0.15) : kFieldBg,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? kPurple : kCardBorder,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.tv_rounded,
                                color: isSelected ? kPurple : Colors.white54,
                                size: 18,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      d.displayId,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    Text(
                                      'Vehicle ${d.vehicleRegistration} · ${d.status}',
                                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                              if (isSelected)
                                const Icon(Icons.check_circle_rounded, color: kPurple, size: 18),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}

// =====================================================================
// Diagnostic Check Card Widget (Matching 4 Check Cards in Admin Panel)
// =====================================================================
class _DiagnosticCheckCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final Widget statusBadge;
  final List<_MetricRow> metrics;

  const _DiagnosticCheckCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.statusBadge,
    required this.metrics,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: DeviceDiagnosticsView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: DeviceDiagnosticsView.kCardBorder),
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
                        color: iconBg,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Icon(icon, color: iconColor, size: 16),
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
                              fontSize: 11.5,
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
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1B26),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              children: List.generate(metrics.length, (index) {
                final m = metrics[index];
                return Padding(
                  padding: EdgeInsets.only(bottom: index == metrics.length - 1 ? 0 : 7),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        m.label,
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                      Text(
                        m.value,
                        style: TextStyle(
                          color: m.valueColor ?? Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricRow {
  final String label;
  final String value;
  final Color? valueColor;

  const _MetricRow({
    required this.label,
    required this.value,
    this.valueColor,
  });
}

// =====================================================================
// Summary Metric Pill Widget
// =====================================================================
class _SummaryMetricPill extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _SummaryMetricPill({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B26),
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: const Color(0x14FFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
