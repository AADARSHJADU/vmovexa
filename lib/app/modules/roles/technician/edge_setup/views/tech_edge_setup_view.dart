import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/tech_edge_setup_controller.dart';

class TechEdgeSetupView extends GetView<TechEdgeSetupController> {
  const TechEdgeSetupView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0C14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Get.back(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'edge_setup_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'RK3588 • USB ADB • deploy_edge.bat',
              style: const TextStyle(color: Colors.white60, fontSize: 10, fontFamily: 'monospace'),
            ),
          ],
        ),
        actions: [
          Obx(
            () => IconButton(
              onPressed: controller.isVerifying.value ? null : () => controller.verifyHandshake(),
              icon: controller.isVerifying.value
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh_rounded, color: Color(0xFF818CF8)),
              tooltip: 'refresh_status'.tr,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSubtitleHeader(),
              const SizedBox(height: 14),
              _buildOneCommandCard(context),
              const SizedBox(height: 14),
              _buildOfflineDownloadCard(context),
              const SizedBox(height: 16),
              _buildHandshakeMonitorCard(context),
              const SizedBox(height: 16),
              _buildDiagnosticsAccordion(context),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- Subtitle Banner ----------------
  Widget _buildSubtitleHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.terminal_rounded, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'edge_setup_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 3),
                Text(
                  'edge_setup_subtitle'.tr,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Card 1: Fully Automatic Installer Card ----------------
  Widget _buildOneCommandCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.35)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tag Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.shield_outlined, color: Color(0xFF818CF8), size: 13),
                const SizedBox(width: 5),
                Text(
                  'one_command_installer'.tr,
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 3 Steps
          _buildStepRow('1', 'step_connect_usb'.tr, 'step_connect_usb_detail'.tr),
          const SizedBox(height: 10),
          _buildStepRow('2', 'step_run_command'.tr, 'step_run_command_detail'.tr),
          const SizedBox(height: 10),
          _buildStepRow('3', 'step_verify_live'.tr, 'step_verify_live_detail'.tr),
          const SizedBox(height: 16),

          // The Command Box
          Text(
            'the_command_label'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF05070D),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'deploy_edge.bat',
                    style: TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 13.5,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                InkWell(
                  onTap: () => controller.copyCommand('deploy_edge.bat', 'deploy_edge.bat'),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.gradientPink.withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.copy_rounded, color: Colors.white, size: 14),
                        SizedBox(width: 5),
                        Text(
                          'Copy',
                          style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'command_note'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, height: 1.35),
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow(String number, String title, String detail) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155).withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  detail,
                  style: const TextStyle(color: Colors.white60, fontSize: 11, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Card 2: Offline Package Download Card ----------------
  Widget _buildOfflineDownloadCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.download_rounded, color: Color(0xFF38BDF8), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'offline_package'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  'offline_package_detail'.tr,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5, height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Obx(
            () => InkWell(
              onTap: controller.isDownloading.value ? null : controller.downloadCorePackage,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: controller.isDownloading.value ? null : AppTheme.primaryGradient,
                  color: controller.isDownloading.value ? const Color(0xFF334155) : null,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: controller.isDownloading.value
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.8),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.file_download_outlined, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'download_zip'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Card 3: Live Telemetry & Handshake Monitor Card ----------------
  Widget _buildHandshakeMonitorCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row with Pulsing Dot
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Color(0xFF10B981), blurRadius: 6, spreadRadius: 1),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'live_handshake_monitor'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Obx(
                () => controller.lastCheckTime.value.isNotEmpty
                    ? Text(
                        controller.lastCheckTime.value,
                        style: const TextStyle(color: Colors.white54, fontSize: 10.5, fontFamily: 'monospace'),
                      )
                    : const SizedBox.shrink(),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Quick Select Dropdown if devices exist
          Obx(() {
            final devList = controller.registeredDevices;
            if (devList.isEmpty) return const SizedBox.shrink();

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: devList.any((d) => d.boxId == controller.targetBoxId.value)
                      ? controller.targetBoxId.value
                      : null,
                  hint: Text('select_deployed_device_hint'.tr, style: const TextStyle(color: Colors.white60, fontSize: 12)),
                  isExpanded: true,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  items: devList.map((d) {
                    final veh = d.vehicleRegistration.isNotEmpty && d.vehicleRegistration != '—'
                        ? ' (${d.vehicleRegistration})'
                        : '';
                    return DropdownMenuItem<String>(
                      value: d.boxId,
                      child: Text('${d.boxId}$veh'),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      controller.targetBoxId.value = val;
                      controller.boxIdTextCtrl.text = val;
                      controller.verifyHandshake(val);
                    }
                  },
                ),
              ),
            );
          }),

          // Box ID Input + Check Button
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller.boxIdTextCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 12.5, fontFamily: 'monospace'),
                  decoration: InputDecoration(
                    hintText: 'enter_box_id_ph'.tr,
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: Color(0xFF10B981)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Obx(
                () => InkWell(
                  onTap: controller.isVerifying.value ? null : () => controller.verifyHandshake(),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    height: 40,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      gradient: controller.isVerifying.value ? null : AppTheme.primaryGradient,
                      color: controller.isVerifying.value ? const Color(0xFF334155) : null,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.gradientPink.withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: controller.isVerifying.value
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'check_status'.tr,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 4 Status Tiles
          _buildLiveTilesGrid(),
          const SizedBox(height: 14),

          // Handshake Result Banner
          _buildHandshakeResultBanner(),
        ],
      ),
    );
  }

  Widget _buildLiveTilesGrid() {
    return Obx(() {
      final data = controller.handshakeData.value;
      final isOnline = data?['isOnline'] == true;
      final isReg = data?['isRegistered'] == true;
      final gps = data?['gps'] as Map?;
      final isGpsLocked = gps?['locked'] == true;
      final telemetry = data?['telemetry'] as Map?;

      return GridView.count(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 1.6,
        children: [
          // Tile 1: DB Registration
          _buildStatusTile(
            title: 'db_registration'.tr,
            badge: isReg ? 'Registered' : 'Pending',
            badgeBg: isReg ? const Color(0xFF10B981).withValues(alpha: 0.2) : const Color(0xFFF59E0B).withValues(alpha: 0.2),
            badgeColor: isReg ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
            mainText: data?['boxId'] ?? controller.targetBoxId.value,
            subText: isReg ? 'verified_in_db'.tr : 'auto_reg_desc'.tr,
          ),

          // Tile 2: Broker State
          _buildStatusTile(
            title: 'broker_state'.tr,
            badge: isOnline ? 'ONLINE' : 'OFFLINE',
            badgeBg: isOnline ? const Color(0xFF10B981).withValues(alpha: 0.2) : const Color(0xFFEF4444).withValues(alpha: 0.2),
            badgeColor: isOnline ? const Color(0xFF34D399) : const Color(0xFFF87171),
            mainText: isOnline ? 'emqx_connected'.tr : 'no_heartbeat'.tr,
            subText: '${'last_seen'.tr} ${controller.lastCheckTime.value.isNotEmpty ? controller.lastCheckTime.value : "—"}',
          ),

          // Tile 3: GPS Telemetry
          _buildStatusTile(
            title: 'gps_fix'.tr,
            badge: isGpsLocked ? '${gps?['satellites'] ?? 0} Sats' : 'No Fix',
            badgeBg: isGpsLocked ? const Color(0xFF38BDF8).withValues(alpha: 0.2) : Colors.white12,
            badgeColor: isGpsLocked ? const Color(0xFF38BDF8) : Colors.white60,
            mainText: isGpsLocked ? '${gps?['speed'] ?? 0} km/h Lock' : 'awaiting_sat'.tr,
            subText: isGpsLocked ? 'Lat/Lng Broadcasting' : 'No valid satellite lock',
          ),

          // Tile 4: HW Vitals
          _buildStatusTile(
            title: 'hw_vitals'.tr,
            badge: 'RK3588',
            badgeBg: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
            badgeColor: const Color(0xFFA78BFA),
            mainText: telemetry != null
                ? '${telemetry['socTemp'] ?? '—'} • ${telemetry['cpuUsage'] ?? '—'}'
                : '— • —',
            subText: telemetry != null
                ? 'RAM: ${telemetry['ramUsage'] ?? '—'} • ${telemetry['connectedScreens'] ?? 0} Screen'
                : 'No telemetry available',
          ),
        ],
      );
    });
  }


  Widget _buildStatusTile({
    required String title,
    required String badge,
    required Color badgeBg,
    required Color badgeColor,
    required String mainText,
    required String subText,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
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
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    badge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: badgeColor,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Text(
            mainText,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            subText,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 9.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }



  Widget _buildHandshakeResultBanner() {
    return Obx(() {
      final isOnline = controller.handshakeData.value?['isOnline'] == true;

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isOnline
              ? const Color(0xFF10B981).withValues(alpha: 0.15)
              : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isOnline
                ? const Color(0xFF10B981).withValues(alpha: 0.4)
                : const Color(0xFF334155),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              isOnline
                  ? Icons.check_circle_rounded
                  : Icons.info_outline_rounded,
              color: isOnline
                  ? const Color(0xFF10B981)
                  : Colors.white60,
              size: 22,
            ),
            const SizedBox(width: 10),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isOnline
                        ? 'prov_verified_banner'.tr
                        : 'ready_prov_banner'.tr,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    softWrap: true,
                    style: TextStyle(
                      color: isOnline
                          ? const Color(0xFF34D399)
                          : Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isOnline
                        ? 'Edge Box ${controller.targetBoxId.value} is active & transmitting live telemetry.'
                        : 'Run deploy_edge.bat on laptop to initialize handshake.',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    softWrap: true,
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 4),

            Flexible(
              child: TextButton(
                onPressed: () => controller.verifyHandshake(),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF818CF8),
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  minimumSize: const Size(0, 36),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  're_test_handshake'.tr,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  softWrap: true,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }


  // ---------------- Card 4: Diagnostics Accordion ----------------
  Widget _buildDiagnosticsAccordion(BuildContext context) {
    final adbCommands = [
      {'key': 'adb_cmd_usb_devices', 'cmd': 'adb devices'},
      {'key': 'adb_cmd_serial_number', 'cmd': 'adb shell getprop ro.serialno'},
      {'key': 'adb_cmd_stream_core_log', 'cmd': 'adb shell "tail -f /data/vmovexa-core/core.log"'},
      {'key': 'adb_cmd_manual_recovery', 'cmd': 'adb shell "/data/vmovexa-core/run.sh"'},
      {'key': 'adb_cmd_open_fully_kiosk', 'cmd': 'adb shell "am start --user 0 -n de.ozerov.fully/.MainActivity -a android.intent.action.VIEW -d http://127.0.0.1:8888"'},
      {'key': 'adb_cmd_reboot_box', 'cmd': 'adb reboot'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          iconColor: Colors.white70,
          collapsedIconColor: Colors.white38,
          title: Text(
            'diagnostics_troubleshoot'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            'diagnostics_troubleshoot_desc'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                children: adbCommands.map((item) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B).withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                item['key']!.tr,
                                style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ),
                            InkWell(
                              onTap: () => controller.copyCommand(item['cmd']!, item['key']!.tr),
                              child: Row(
                                children: [
                                  const Icon(Icons.copy_rounded, color: Color(0xFF818CF8), size: 12),
                                  const SizedBox(width: 4),
                                  Text(
                                    'copy'.tr,
                                    style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10.5, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF05070D),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            item['cmd']!,
                            style: const TextStyle(color: Colors.white60, fontSize: 11, fontFamily: 'monospace'),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
