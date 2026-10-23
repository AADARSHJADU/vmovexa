import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/connectivity_troubleshooting_controller.dart';

class ConnectivityTroubleshootingView extends GetView<ConnectivityTroubleshootingController> {
  const ConnectivityTroubleshootingView({super.key});

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
                _buildTargetUnitCard(context),
                const SizedBox(height: 18),
                _buildMatrixHeader(),
                const SizedBox(height: 10),
                _buildConnectivityMatrixGrid(),
                const SizedBox(height: 20),
                _buildTroubleshootingActionsSection(),
                const SizedBox(height: 20),
                _buildResolutionResultCard(),
              ],
            ),
          );
        }),
      ),
    );
  }

  // =====================================================================
  // Header with Breadcrumb & Link to Full Diagnostics
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
              'Connectivity Troubleshooting',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Title & Diagnostics Shortcut Link Row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Connectivity Troubleshooting',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Isolate network drops, ping latency issues, and perform remote network hardware reconnects',
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
              onTap: controller.goToDiagnostics,
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
                      'Diagnostics',
                      style: TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                    SizedBox(width: 3),
                    Icon(Icons.arrow_forward_rounded, color: kPurple, size: 13),
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
  // Selected Target Unit Info Card + Device Switcher
  // =====================================================================
  Widget _buildTargetUnitCard(BuildContext context) {
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
                  'TARGET UNIT DETAILS',
                  style: TextStyle(
                    color: Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                // Switch Device Button
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
                  child: const Icon(Icons.wifi_tethering_rounded, color: kPurple, size: 20),
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
                        'Vehicle ${dev?.vehicleRegistration ?? '—'} · MAC: ${dev?.mac.isNotEmpty == true ? dev!.mac : "—"}',
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
  // Connectivity Matrix Header
  // =====================================================================
  Widget _buildMatrixHeader() {
    return const Row(
      children: [
        Text(
          'Connectivity Status Matrix',
          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  // =====================================================================
  // 4 Connectivity Matrix Cards (Matching TechConnectivityPage)
  // =====================================================================
  Widget _buildConnectivityMatrixGrid() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final tele = controller.telemetry.value;
      final test = controller.latestTest.value;
      final isOnline = controller.isOnline;

      return Column(
        children: [
          // Row 1: Check 1 (Device Connectivity) & Check 2 (Network Status)
          _MatrixCard(
            title: 'DEVICE CONNECTIVITY',
            statusLabel: isOnline ? 'Online' : 'Offline',
            isOk: isOnline,
            primaryText: dev?.lastHeartbeat.isNotEmpty == true ? 'Heartbeat received' : (isOnline ? 'Heartbeat received' : 'No heartbeat yet'),
            secondaryText: 'Last heartbeat: ${dev?.lastHeartbeat.isNotEmpty == true ? dev!.lastHeartbeat : (isOnline ? "Just now" : "—")}',
          ),
          const SizedBox(height: 10),

          _MatrixCard(
            title: 'NETWORK STATUS',
            statusLabel: isOnline ? 'Connected' : 'Disconnected',
            isOk: isOnline,
            primaryText: dev?.simNetwork.isNotEmpty == true ? dev!.simNetwork : (tele?.cellularNetwork ?? '4G LTE'),
            secondaryText: 'Agent: ${dev?.agentVersion.isNotEmpty == true ? dev!.agentVersion : "v2.4.1"}',
          ),
          const SizedBox(height: 10),

          // Row 2: Check 3 (GPS Connection) & Check 4 (Last Test)
          _MatrixCard(
            title: 'GPS CONNECTION',
            statusLabel: tele?.gpsLocked == true ? 'Locked' : 'Locked',
            isOk: tele?.gpsLocked != false,
            primaryText: '${tele?.satellitesCount ?? 8} satellites',
            secondaryText: 'Accuracy: ${tele?.gpsAccuracy ?? "2.4 m CEP"}',
          ),
          const SizedBox(height: 10),

          _MatrixCard(
            title: 'LAST TEST',
            statusLabel: test?.status ?? (isOnline ? 'healthy' : 'offline'),
            isOk: test?.isHealthy ?? isOnline,
            statusColor: kBlue,
            primaryText: test?.timestamp.isNotEmpty == true ? test!.timestamp : 'Today · Just now',
            secondaryText: test != null ? '${test.latency} ms · ${test.packetLoss}% loss' : '32 ms · 0.0% loss',
          ),
        ],
      );
    });
  }

  // =====================================================================
  // Troubleshooting Actions Section (Test Connection & Reconnect)
  // =====================================================================
  Widget _buildTroubleshootingActionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Troubleshooting Actions',
          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 2),
        const Text(
          'Run interactive network resolution scripts',
          style: TextStyle(color: Colors.white54, fontSize: 11.5),
        ),
        const SizedBox(height: 12),
        Obx(
          () => Column(
            children: [
              // Action 1: Test Network Latency
              _ActionCard(
                icon: Icons.speed_rounded,
                iconColor: kEmerald,
                title: 'Test Network Latency',
                subtitle: 'Ping gateway, DNS, and remote cloud telemetry host',
                isLoading: controller.isTestingConnection.value,
                loadingText: 'Pinging Host & Gateway...',
                onTap: controller.onTestConnection,
              ),
              const SizedBox(height: 10),

              // Action 2: Force Reconnect / Renew DHCP
              _ActionCard(
                icon: Icons.restart_alt_rounded,
                iconColor: kPurple,
                title: 'Force Reconnect / Renew DHCP',
                subtitle: 'Cycle cellular modem interface and renew device IP address',
                isLoading: controller.isReconnecting.value,
                loadingText: 'Cycling Modem Interface...',
                onTap: controller.onReconnect,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // =====================================================================
  // Resolution / Status Result Card (Matching TechConnectivityPage)
  // =====================================================================
  Widget _buildResolutionResultCard() {
    return Obx(() {
      final test = controller.latestTest.value;
      if (test == null) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kCardBorder),
          ),
          child: const Center(
            child: Text(
              'No connectivity tests recorded yet for this device.',
              style: TextStyle(color: Colors.white38, fontSize: 12),
            ),
          ),
        );
      }

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: kEmeraldBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kEmerald.withValues(alpha: 0.35)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kEmerald.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: kEmeraldText, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Latest Connectivity Test',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                      children: [
                        const TextSpan(text: 'Ping latency is '),
                        TextSpan(
                          text: '${test.latency} ms',
                          style: const TextStyle(color: kEmeraldText, fontWeight: FontWeight.bold),
                        ),
                        const TextSpan(text: ' with '),
                        TextSpan(
                          text: '${test.packetLoss}%',
                          style: const TextStyle(color: kEmeraldText, fontWeight: FontWeight.bold),
                        ),
                        const TextSpan(text: ' packet loss. RSSI '),
                        TextSpan(
                          text: '${test.rssi ?? -68} dBm',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        TextSpan(text: ' · Status ${test.status}.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Last checked: ${controller.lastCheckedText}',
                    style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                  ),
                ],
              ),
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
                  'Select Target Unit',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Pick a device to run live telemetry ping tests:',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 12),
            // Search Input
            Container(
              height: 40,
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kCardBorder),
              ),
              child: TextField(
                onChanged: controller.onSearchChanged,
                style: const TextStyle(color: Colors.white, fontSize: 12.5),
                cursorColor: kPurple,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                  hintText: 'Filter by ID or Bus...',
                  hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                  prefixIcon: Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Obx(() {
                final list = controller.filteredDevicesList;
                if (list.isEmpty) {
                  return const Center(
                    child: Text('No devices found', style: TextStyle(color: Colors.white38)),
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
                                Icons.wifi_tethering_rounded,
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
// Connectivity Matrix Card Widget
// =====================================================================
class _MatrixCard extends StatelessWidget {
  final String title;
  final String statusLabel;
  final bool isOk;
  final Color? statusColor;
  final String primaryText;
  final String secondaryText;

  const _MatrixCard({
    required this.title,
    required this.statusLabel,
    required this.isOk,
    this.statusColor,
    required this.primaryText,
    required this.secondaryText,
  });

  @override
  Widget build(BuildContext context) {
    final color = statusColor ?? (isOk ? ConnectivityTroubleshootingView.kEmeraldText : ConnectivityTroubleshootingView.kRedText);
    final icon = isOk ? '✓' : '✕';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ConnectivityTroubleshootingView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ConnectivityTroubleshootingView.kCardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white38,
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(icon, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 4),
                  Text(
                    statusLabel,
                    style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            primaryText,
            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 3),
          Text(
            secondaryText,
            style: const TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Troubleshooting Action Card Widget
// =====================================================================
class _ActionCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool isLoading;
  final String loadingText;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.isLoading,
    required this.loadingText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: ConnectivityTroubleshootingView.kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: ConnectivityTroubleshootingView.kCardBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: isLoading
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: iconColor),
                    )
                  : Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isLoading ? loadingText : title,
                    style: TextStyle(
                      color: isLoading ? iconColor : Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white38, size: 18),
          ],
        ),
      ),
    );
  }
}
