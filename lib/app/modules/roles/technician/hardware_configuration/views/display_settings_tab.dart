import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';
import 'shared_widgets.dart';

class DisplaySettingsTab extends GetView<HardwareConfigController> {
  const DisplaySettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      children: [
        // ---------------- Display Settings Card ----------------
        SectionCard(
          icon: Icons.tv_outlined,
          title: 'display_settings'.tr,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'display_settings_desc'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingSliderRow(
                  icon: Icons.wb_sunny_outlined,
                  label: 'screen_brightness'.tr,
                  value: controller.brightness.value.clamp(10.0, 100.0),
                  min: 10.0,
                  max: 100.0,
                  onChanged: controller.setBrightness,
                  valueLabel: '${controller.brightness.value.round()}%',
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.timer_outlined,
                  label: 'screen_timeout'.tr,
                  value: controller.screenTimeout.value,
                  items: controller.screenTimeoutOptions,
                  onChanged: controller.setScreenTimeout,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.fullscreen,
                  label: 'display_mode'.tr,
                  value: controller.displayMode.value,
                  items: controller.displayModeOptions,
                  onChanged: controller.setDisplayMode,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.crop_landscape_outlined,
                  label: 'screen_orientation'.tr,
                  value: controller.screenOrientation.value,
                  items: controller.screenOrientationOptions,
                  onChanged: controller.setScreenOrientation,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingToggleRow(
                  icon: Icons.brightness_auto_outlined,
                  label: 'ambient_sensor'.tr,
                  subtitle: 'ambient_sensor_desc'.tr,
                  value: controller.autoBrightness.value,
                  onChanged: controller.toggleAutoBrightness,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ---------------- Audio Settings Card ----------------
        SectionCard(
          icon: Icons.volume_up_outlined,
          title: 'audio_settings'.tr,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'audio_settings_desc'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingSliderRow(
                  icon: Icons.volume_up_outlined,
                  label: 'volume_level'.tr,
                  value: controller.isMuted.value ? 0.0 : controller.audioVolume.value.clamp(0.0, 100.0),
                  min: 0.0,
                  max: 100.0,
                  enabled: !controller.isMuted.value,
                  onChanged: controller.setAudioVolume,
                  valueLabel: controller.isMuted.value ? 'muted_status'.tr : '${controller.audioVolume.value.round()}%',
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.speaker_outlined,
                  label: 'audio_source'.tr,
                  value: controller.audioSource.value,
                  items: controller.audioSourceOptions,
                  onChanged: controller.setAudioSource,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingToggleRow(
                  icon: Icons.volume_off_outlined,
                  label: 'hw_mute'.tr,
                  subtitle: 'hw_mute_desc'.tr,
                  value: controller.isMuted.value,
                  onChanged: controller.toggleMute,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ---------------- Power Management Card ----------------
        SectionCard(
          icon: Icons.power_settings_new_outlined,
          title: 'power_mgmt'.tr,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'power_mgmt_desc'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.battery_charging_full_outlined,
                  label: 'power_mode'.tr,
                  value: controller.powerMode.value,
                  items: controller.powerModeOptions,
                  onChanged: controller.setPowerMode,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _buildTimeInput(
                      label: 'auto_power_on'.tr,
                      controller: controller.autoPowerOnCtrl,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTimeInput(
                      label: 'auto_power_off'.tr,
                      controller: controller.autoPowerOffCtrl,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimeInput({required String label, required TextEditingController controller}) {
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
            decoration: const InputDecoration(
              border: InputBorder.none,
              isDense: true,
              hintText: '06:00 AM',
              hintStyle: TextStyle(color: Colors.white30, fontSize: 12),
            ),
          ),
        ),
      ],
    );
  }
}
