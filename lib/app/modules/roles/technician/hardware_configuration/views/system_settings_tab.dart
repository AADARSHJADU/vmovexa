import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';
import 'shared_widgets.dart';

class SystemSettingsTab extends GetView<HardwareConfigController> {
  const SystemSettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        _buildDeviceHardwareInfoCard(),
        const SizedBox(height: 16),
        _buildRemoteDeviceOperationsCard(),
        const SizedBox(height: 16),
        const InfoNoteBanner(text: 'Changes will be applied to the device over the air after saving.'),
      ],
    );
  }

  // ---------------- Device Hardware Information Card ----------------
  Widget _buildDeviceHardwareInfoCard() {
    return Obx(() {
      final dev = controller.selectedDevice.value;

      return SectionCard(
        icon: Icons.memory_outlined,
        title: 'Device Hardware Information',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Cryptographic identifiers and ledger serial keys',
              style: TextStyle(color: Colors.white38, fontSize: 11),
            ),
            const SizedBox(height: 14),
            GridView.count(
              crossAxisCount: 2,
              childAspectRatio: 2.1,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _infoTile('MAC Address:', dev?.mac ?? '00:1A:2B:3C:4D:5E', isMonospace: true),
                _infoTile('Box ID:', dev?.boxId ?? 'VMX-BOX-8841'),
                _infoTile('Status:', (dev?.status ?? 'online').toUpperCase(), isStatus: true, status: dev?.status ?? 'online'),
                _infoTile(
                  'Edge Agent Engine:',
                  '${dev?.agentVersion ?? "v2.4.1"} · ${dev?.simNetwork ?? "Jio 5G"}',
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _infoTile(String label, String value, {bool isMonospace = false, bool isStatus = false, String status = ''}) {
    Color valueColor = Colors.white;
    if (isStatus) {
      final st = status.toLowerCase();
      if (st == 'online') {
        valueColor = const Color(0xFF10B981);
      } else if (st == 'warning') {
        valueColor = const Color(0xFFF59E0B);
      } else {
        valueColor = const Color(0xFFEF4444);
      }
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              fontFamily: isMonospace ? 'monospace' : null,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------- Remote Device Operations Card ----------------
  Widget _buildRemoteDeviceOperationsCard() {
    return SectionCard(
      icon: Icons.settings_remote_outlined,
      title: 'Remote Device Operations',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Perform software restarts and factory provisioning wipes',
            style: TextStyle(color: Colors.white38, fontSize: 11),
          ),
          const SizedBox(height: 16),

          // Reboot Button
          Obx(
            () => SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: controller.isRebooting.value ? null : controller.onRebootController,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                ),
                icon: controller.isRebooting.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.refresh_rounded, size: 18),
                label: const Text(
                  'Reboot Display Controller',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Factory Reset Button
          Obx(
            () => SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: controller.isResetting.value ? null : controller.onFactoryReset,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.12),
                  foregroundColor: const Color(0xFFEF4444),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                  ),
                ),
                icon: controller.isResetting.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFEF4444)),
                      )
                    : const Icon(Icons.warning_amber_rounded, size: 18),
                label: const Text(
                  'Remote Factory Reset',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
