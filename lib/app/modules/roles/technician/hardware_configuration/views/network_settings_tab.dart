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
        _buildNetworkStatusCard(),
        const SizedBox(height: 16),
        _buildProxySettingsCard(),
        const SizedBox(height: 16),
        const InfoNoteBanner(),
      ],
    );
  }

  Widget _buildNetworkStatusCard() {
    return SectionCard(
      icon: Icons.wifi,
      title: 'Network Status',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (controller.isNetworkConnected.value ? kGreen : Colors.redAccent).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.wifi,
                      color: controller.isNetworkConnected.value ? kGreen : Colors.redAccent,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          controller.isNetworkConnected.value ? 'Connected' : 'Disconnected',
                          style: TextStyle(
                            color: controller.isNetworkConnected.value ? kGreen : Colors.redAccent,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Your device is connected to the network and communicating with the server.',
                          style: TextStyle(color: Colors.white38, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: controller.isTestingConnection.value ? null : controller.onRunConnectionTest,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: kPurple.withOpacity(0.5)),
                      ),
                      child: controller.isTestingConnection.value
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: kPurple),
                            )
                          : const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.podcasts, color: kPurple, size: 13),
                                SizedBox(width: 4),
                                Text('Connection Test',
                                    style: TextStyle(color: kPurple, fontSize: 10.5, fontWeight: FontWeight.w700)),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Obx(
            () => SettingDropdownRow(
              icon: Icons.wifi_tethering,
              label: 'Connection Type',
              value: controller.connectionType.value,
              items: controller.connectionTypeOptions,
              onChanged: controller.setConnectionType,
            ),
          ),
          const ThinDivider(),
          Obx(
            () => NavRow(
              icon: Icons.wifi,
              label: 'Wi-Fi Network (SSID)',
              value: controller.wifiSsid.value,
              onTap: controller.onWifiNetworkTap,
            ),
          ),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.dns_outlined, label: 'IP Address', value: controller.ipAddress.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.router_outlined, label: 'Subnet Mask', value: controller.subnetMask.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.alt_route_outlined, label: 'Gateway', value: controller.gateway.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.dns, label: 'DNS Server', value: controller.dnsServer.value)),
          const ThinDivider(),
          Obx(
            () => InfoKeyValueRow(
              icon: Icons.signal_cellular_alt,
              label: 'Signal Strength',
              value: 'Excellent (${controller.signalStrengthPercent.value}%)',
            ),
          ),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.perm_device_information_outlined, label: 'MAC Address', value: controller.macAddress.value)),
          const ThinDivider(),
          Obx(() => InfoKeyValueRow(icon: Icons.access_time, label: 'Last Connected', value: controller.lastConnected.value)),
        ],
      ),
    );
  }

  Widget _buildProxySettingsCard() {
    return SectionCard(
      icon: Icons.public,
      title: 'Proxy Settings',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => SettingToggleRow(
              icon: Icons.vpn_lock_outlined,
              label: 'Use Proxy',
              value: controller.useProxy.value,
              onChanged: controller.toggleUseProxy,
            ),
          ),
          Obx(() {
            if (!controller.useProxy.value) return const SizedBox();
            return Column(
              children: [
                const SizedBox(height: 14),
                _LabeledDropdown(
                  label: 'Proxy Type',
                  hint: 'Select proxy type',
                  value: controller.proxyType.value.isEmpty ? null : controller.proxyType.value,
                  items: controller.proxyTypeOptions,
                  onChanged: controller.setProxyType,
                ),
                const SizedBox(height: 14),
                _LabeledTextField(
                  label: 'Proxy Address',
                  controller: controller.proxyAddressCtrl,
                  hint: 'Enter address',
                ),
                const SizedBox(height: 14),
                _LabeledTextField(
                  label: 'Proxy Port',
                  controller: controller.proxyPortCtrl,
                  hint: 'Enter port',
                  keyboardType: TextInputType.number,
                ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

// =====================================================================
// Local helper widgets for the proxy form fields
// =====================================================================
class _LabeledDropdown extends StatelessWidget {
  final String label;
  final String hint;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _LabeledDropdown({
    required this.label,
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: kFieldBg,
              icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 20),
              hint: Text(hint, style: const TextStyle(color: Colors.white30, fontSize: 12.5)),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class _LabeledTextField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;
  final TextInputType? keyboardType;

  const _LabeledTextField({
    required this.label,
    required this.controller,
    required this.hint,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 12.5),
            ),
          ),
        ),
      ],
    );
  }
}
