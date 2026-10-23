import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/edge_device_model.dart';
import 'package:vmovexa/app/modules/roles/technician/hardware_configuration/views/system_settings_tab.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/hardware_config_controller.dart';
import 'display_settings_tab.dart';
import 'network_settings_tab.dart';

class HardwareConfigurationView extends GetView<HardwareConfigController> {
  const HardwareConfigurationView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFF6366F1);
  static const Color kIndigo = Color(0xFF4F46E5);
  static const Color kBlue = Color(0xFF38BDF8);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoadingDevices.value && controller.deviceList.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: kPurple),
            );
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Column(
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 12),
                    _buildDeviceSummaryCard(),
                    const SizedBox(height: 12),
                    _buildTabBar(),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: Obx(() {
                  if (controller.isLoadingConfig.value) {
                    return const Center(
                      child: CircularProgressIndicator(color: kPurple),
                    );
                  }

                  switch (controller.selectedTabIndex.value) {
                    case 1:
                      return const NetworkSettingsTab();
                    case 2:
                      return const SystemSettingsTab();
                    default:
                      return const DisplaySettingsTab();
                  }
                }),
              ),
              _buildFooter(),
            ],
          );
        }),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final boxId = dev?.boxId.isNotEmpty == true ? dev!.boxId : (controller.selectedDeviceId.value.isNotEmpty ? controller.selectedDeviceId.value : 'VMX-BOX-8841');

      return Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Hardware Configuration',
                          style: TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: kPurple.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: kPurple.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            boxId,
                            style: const TextStyle(
                              color: Color(0xFF818CF8),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),

                  ],
                ),
              ),

            ],
          ),
          SizedBox(height: 8,),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${dev?.vehicleReg ?? (dev?.vehicleId != null ? 'Vehicle ${dev!.vehicleId}' : '—')} · ${dev?.depotName ?? 'Central Depot'}',
                style: const TextStyle(color: Colors.white54, fontSize: 11),
                overflow: TextOverflow.ellipsis,
              ),
              GestureDetector(
                onTap: controller.isSaving.value ? null : controller.onSaveConfiguration,
                child: const Column(
                  children: [
                    Icon(Icons.save_outlined, color: kPurple, size: 20),
                    SizedBox(height: 2),
                    Text(
                      'Save Config',
                      style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      );
    });
  }

  // ---------------- Device Switcher & Live Status Strip ----------------
  Widget _buildDeviceSummaryCard() {
    return Obx(() {
      final dev = controller.selectedDevice.value;
      final isOnline = dev?.isOnline ?? true;
      final status = (dev?.status ?? 'online').toLowerCase();

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: (isOnline ? kGreen : Colors.redAccent).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(9),
              ),
              child: Icon(
                Icons.memory_rounded,
                color: isOnline ? kGreen : Colors.redAccent,
                size: 16,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: controller.deviceList.length > 1
                  ? DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: controller.selectedDeviceId.value.isNotEmpty ? controller.selectedDeviceId.value : controller.deviceList.first.id.toString(),
                        isExpanded: true,
                        dropdownColor: const Color(0xFF1E293B),
                        icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                        style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
                        items: controller.deviceList.map((EdgeDeviceModel d) {
                          return DropdownMenuItem<String>(
                            value: d.id.toString(),
                            child: Text(
                              '${d.boxId.isNotEmpty ? d.boxId : d.id.toString()} (${d.vehicleReg.isNotEmpty ? d.vehicleReg : "Bus #${d.vehicleId}"})',
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            final match = controller.deviceList.firstWhereOrNull((d) => d.id.toString() == val);
                            if (match != null) {
                              controller.selectDevice(match);
                            }
                          }
                        },
                      ),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dev?.boxId ?? 'VMX-BOX-8841',
                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${dev?.vehicleReg ?? "Bus #101"} · ${dev?.depotName ?? "Depot"}',
                          style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                        ),
                      ],
                    ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: (isOnline ? kGreen : status == 'warning' ? Colors.amber : Colors.redAccent).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: (isOnline ? kGreen : status == 'warning' ? Colors.amber : Colors.redAccent).withValues(alpha: 0.35),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: isOnline ? kGreen : status == 'warning' ? Colors.amber : Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    isOnline ? 'Configurable' : status.toUpperCase(),
                    style: TextStyle(
                      color: isOnline ? kGreen : status == 'warning' ? Colors.amber : Colors.redAccent,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  // ---------------- 3 Sub-tabs Navigation (Matching Admin Panel) ----------------
  Widget _buildTabBar() {
    final icons = [
      Icons.tune_rounded,
      Icons.wifi_tethering_rounded,
      Icons.layers_outlined,
    ];

    return Obx(
      () => Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: List.generate(controller.tabLabels.length, (index) {
            final isActive = controller.selectedTabIndex.value == index;
            return Expanded(
              child: GestureDetector(
                onTap: () => controller.selectTab(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? kPurple.withValues(alpha: 0.18) : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                    border: isActive ? Border.all(color: kPurple.withValues(alpha: 0.5)) : null,
                  ),
                  child: Column(
                    children: [
                      Icon(icons[index], size: 16, color: isActive ? kPurple : Colors.white38),
                      const SizedBox(height: 3),
                      Text(
                        controller.tabLabels[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isActive ? Colors.white : Colors.white38,
                          fontSize: 9.5,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Footer (Back to Devices + Save Configuration) ----------------
  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: controller.onBackPressed,
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              alignment: Alignment.center,
              child: const Row(
                children: [
                  Icon(Icons.chevron_left, color: Colors.white70, size: 18),
                  SizedBox(width: 4),
                  Text('Back', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(
              () => GestureDetector(
                onTap: controller.isSaving.value ? null : controller.onSaveConfiguration,
                child: Container(
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: controller.isSaving.value
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Save Configuration',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
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
}
