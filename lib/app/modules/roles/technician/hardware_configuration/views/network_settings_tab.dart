import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';
import 'shared_widgets.dart';

class NetworkSettingsTab extends GetView<HardwareConfigController> {
  const NetworkSettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        _buildCurrentNetworkStatusCard(),
        const SizedBox(height: 16),
        _buildPrivacyProxyCard(),
        const SizedBox(height: 16),
        const InfoNoteBanner(text: 'Changes will be applied to the device over the air after saving.'),
      ],
    );
  }

  // ---------------- Current Network Status Card ----------------
  Widget _buildCurrentNetworkStatusCard() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final isOnline = dev?.isOnline ?? true;

      return SectionCard(
        icon: Icons.wifi,
        title: 'Current Network Status',
        trailingBadge: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: (isOnline ? kGreen : kRed).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: (isOnline ? kGreen : kRed).withValues(alpha: 0.4)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isOnline ? kGreen : kRed,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                isOnline ? 'Connected' : 'Disconnected',
                style: TextStyle(
                  color: isOnline ? kGreen : kRed,
                  fontSize: 10.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Real-time connection telemetry and IP addressing',
              style: TextStyle(color: Colors.white38, fontSize: 11),
            ),
            const SizedBox(height: 14),

            // 4 Telemetry Pills
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              ),
              child: GridView.count(
                crossAxisCount: 2,
                childAspectRatio: 2.3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _telemetryItem('Connection Type:', controller.networkType.value, Colors.white),
                  _telemetryItem(
                    'SSID Network:',
                    controller.ssidCtrl.text.isNotEmpty ? controller.ssidCtrl.text : 'VMOVEXA_DEPOT_5G',
                    Colors.white,
                  ),
                  _telemetryItem('Local IP Address:', controller.ipAddress.value, const Color(0xFF60A5FA)),
                  _telemetryItem(
                    'SIM Network:',
                    dev?.simNetwork ?? 'Jio 5G',
                    kGreen,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Network Interface Dropdown
            SettingDropdownRow(
              icon: Icons.settings_ethernet,
              label: 'Network Interface *',
              value: controller.networkType.value,
              items: controller.networkTypeOptions,
              onChanged: controller.setNetworkType,
            ),
            const SizedBox(height: 14),

            // Wi-Fi SSID input
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Wi-Fi SSID',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: TextField(
                    controller: controller.ssidCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                      hintText: 'Enter Wi-Fi SSID network',
                      hintStyle: TextStyle(color: Colors.white30, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _telemetryItem(String label, String value, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
        const SizedBox(height: 2),
        Text(
          value.isNotEmpty ? value : '—',
          style: TextStyle(color: valueColor, fontSize: 12, fontWeight: FontWeight.w700),
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  // ---------------- Privacy & Enterprise Proxy Card ----------------
  Widget _buildPrivacyProxyCard() {
    return Obx(
      () => SectionCard(
        icon: Icons.shield_outlined,
        title: 'Privacy & Enterprise Proxy',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Route media downloads and telemetry through corporate proxies',
              style: TextStyle(color: Colors.white38, fontSize: 11),
            ),
            const SizedBox(height: 14),
            SettingToggleRow(
              icon: Icons.vpn_lock_outlined,
              label: 'Enable Corporate Peer Proxy',
              subtitle: 'Use encrypted transit VPN tunnels for all outbound requests',
              value: controller.peerProxy.value,
              onChanged: controller.togglePeerProxy,
            ),
            if (controller.peerProxy.value) ...[
              const SizedBox(height: 14),
              SettingDropdownRow(
                icon: Icons.alt_route,
                label: 'Proxy Protocol',
                value: controller.proxyType.value,
                items: controller.proxyTypeOptions,
                onChanged: controller.setProxyType,
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: _buildTextInput(
                      label: 'Proxy Host',
                      hint: 'proxy.vmovexa.internal',
                      controller: controller.proxyHostCtrl,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 1,
                    child: _buildTextInput(
                      label: 'Port',
                      hint: '8080',
                      controller: controller.proxyPortCtrl,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTextInput({required String label, required String hint, required TextEditingController controller}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
            decoration: InputDecoration(
              border: InputBorder.none,
              isDense: true,
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
            ),
          ),
        ),
      ],
    );
  }
}
