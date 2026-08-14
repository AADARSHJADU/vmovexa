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
        SectionCard(
          icon: Icons.tv_outlined,
          title: 'Display Settings',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Obx(
                () => SettingSliderRow(
                  icon: Icons.wb_sunny_outlined,
                  label: 'Screen Brightness',
                  value: controller.screenBrightness.value,
                  onChanged: controller.setScreenBrightness,
                  valueLabel: '${controller.screenBrightness.value.round()}%',
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.timer_outlined,
                  label: 'Screen Timeout',
                  value: controller.screenTimeout.value,
                  items: controller.screenTimeoutOptions,
                  onChanged: controller.setScreenTimeout,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingToggleRow(
                  icon: Icons.brightness_auto_outlined,
                  label: 'Auto Brightness',
                  value: controller.autoBrightness.value,
                  onChanged: controller.toggleAutoBrightness,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.crop_landscape_outlined,
                  label: 'Screen Orientation',
                  value: controller.screenOrientation.value,
                  items: controller.screenOrientationOptions,
                  onChanged: controller.setScreenOrientation,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.fullscreen,
                  label: 'Display Mode',
                  value: controller.displayMode.value,
                  items: controller.displayModeOptions,
                  onChanged: controller.setDisplayMode,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          icon: Icons.volume_up_outlined,
          title: 'Audio Settings',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Obx(
                () => SettingSliderRow(
                  icon: Icons.volume_up_outlined,
                  label: 'Volume Level',
                  value: controller.volumeLevel.value,
                  onChanged: controller.setVolumeLevel,
                  valueLabel: '${controller.volumeLevel.value.round()}%',
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingToggleRow(
                  icon: Icons.volume_off_outlined,
                  label: 'Mute',
                  value: controller.isMuted.value,
                  onChanged: controller.toggleMute,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.speaker_outlined,
                  label: 'Audio Output',
                  value: controller.audioOutput.value,
                  items: controller.audioOutputOptions,
                  onChanged: controller.setAudioOutput,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          icon: Icons.bolt_outlined,
          title: 'Power Settings',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.power_settings_new,
                  label: 'Power Mode',
                  value: controller.powerMode.value,
                  items: controller.powerModeOptions,
                  onChanged: controller.setPowerMode,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.wb_twighlight,
                  label: 'Auto Power On',
                  value: controller.autoPowerOn.value,
                  items: controller.timeOptions,
                  onChanged: controller.setAutoPowerOn,
                ),
              ),
              const SizedBox(height: 14),
              Obx(
                () => SettingDropdownRow(
                  icon: Icons.nightlight_outlined,
                  label: 'Auto Power Off',
                  value: controller.autoPowerOff.value,
                  items: controller.timeOptions,
                  onChanged: controller.setAutoPowerOff,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const InfoNoteBanner(),
      ],
    );
  }
}
