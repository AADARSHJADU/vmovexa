import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/technician/hardware_configuration/views/system_settings_tab.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/hardware_config_controller.dart';
import 'display_settings_tab.dart';
import 'network_settings_tab.dart';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/hardware_config_controller.dart';


class HardwareConfigurationView extends GetView<HardwareConfigController> {
  const HardwareConfigurationView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 14),
                  _buildDeviceSummaryCard(),
                  const SizedBox(height: 14),
                  _buildTabBar(),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: Obx(
                    () {
                  switch (controller.selectedTabIndex.value) {
                    case 1:
                      return const NetworkSettingsTab();
                    case 2:
                      return const SystemSettingsTab();
                    default:
                      return const DisplaySettingsTab();
                  }
                },
              ),
            ),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onBackPressed,
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hardware Configuration',
                style: TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 2),
              Text(
                'Configure hardware and display settings.',
                style: TextStyle(color: Colors.white54, fontSize: 11.5),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: controller.onGoToReviewAndSave,
          child: const Column(
            children: [
              Icon(Icons.save_outlined, color: kPurple, size: 20),
              SizedBox(height: 2),
              Text('Save Config', style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Device summary strip ----------------
  Widget _buildDeviceSummaryCard() {
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
              color: kGreen.withOpacity(0.15),
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(Icons.desktop_windows_outlined, color: kGreen, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Obx(
                  () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Device: ${controller.deviceId.value}',
                    style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${controller.vehicleNumber.value} · ${controller.depotLocation.value}',
                    style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                  ),
                ],
              ),
            ),
          ),
          Obx(
                () => Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  controller.isDeviceOnline.value ? 'Online' : 'Offline',
                  style: TextStyle(
                    color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Tab bar (Display / Network / System) ----------------
  Widget _buildTabBar() {
    final icons = [Icons.tv_outlined, Icons.wifi, Icons.settings_outlined];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Obx(
            () => Row(
          children: List.generate(controller.tabLabels.length, (index) {
            final isActive = controller.selectedTabIndex.value == index;
            return Expanded(
              child: GestureDetector(
                onTap: () => controller.selectTab(index),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: isActive ? kFieldBg : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                    border: isActive ? Border.all(color: kPurple.withOpacity(0.4)) : null,
                  ),
                  child: Column(
                    children: [
                      Icon(icons[index], size: 16, color: isActive ? kPurple : Colors.white38),
                      const SizedBox(height: 3),
                      Text(
                        controller.tabLabels[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isActive ? kPurple : Colors.white38,
                          fontSize: 9,
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

  // ---------------- Footer (Back + Save Configuration) ----------------
  Widget _buildFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: controller.onBackPressed,
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPurple.withOpacity(0.4)),
              ),
              alignment: Alignment.center,
              child: const Row(
                children: [
                  Icon(Icons.chevron_left, color: kPurple, size: 18),
                  Text('Back', style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: controller.onGoToReviewAndSave,
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  gradient:AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.save_outlined, color: Colors.white, size: 17),
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
        ],
      ),
    );
  }
}
// class HardwareConfigurationView extends GetView<HardwareConfigController> {
//   const HardwareConfigurationView({super.key});
//
//   static const Color kBg = Color(0xFF0B0B14);
//   static const Color kCardBg = Color(0xFF15151F);
//   static const Color kFieldBg = Color(0xFF1B1B27);
//   static const Color kPurple = Color(0xFFB042FF);
//   static const Color kIndigo = Color(0xFF6A5CFF);
//   static const Color kBlue = Color(0xFF3F7BF5);
//   static const Color kBorder = Color(0x14FFFFFF);
//   static const Color kGreen = Color(0xFF2ECC71);
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: kBg,
//       body: SafeArea(
//         child: Column(
//           children: [
//             Padding(
//               padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
//               child: Column(
//                 children: [
//                   _buildHeader(),
//                   const SizedBox(height: 14),
//                   _buildDeviceSummaryCard(),
//                   const SizedBox(height: 14),
//                   _buildTabBar(),
//                 ],
//               ),
//             ),
//             const SizedBox(height: 12),
//             Expanded(
//               child: Obx(
//                 () {
//                   switch (controller.selectedTabIndex.value) {
//                     case 1:
//                       return const NetworkSettingsTab();
//                     case 2:
//                       return const SystemSettingsTab();
//                     default:
//                       return const DisplaySettingsTab();
//                   }
//                 },
//               ),
//             ),
//             _buildFooter(),
//           ],
//         ),
//       ),
//     );
//   }
//
//   // ---------------- Header ----------------
//   Widget _buildHeader() {
//     return Row(
//       children: [
//         GestureDetector(
//           onTap: controller.onBackPressed,
//           child: const Icon(Icons.arrow_back, color: Colors.white),
//         ),
//         const SizedBox(width: 10),
//         const Expanded(
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Text(
//                 'Hardware Configuration',
//                 style: TextStyle(color: Colors.white, fontSize: 16.5, fontWeight: FontWeight.w700),
//               ),
//               SizedBox(height: 2),
//               Text(
//                 'Configure hardware and display settings.',
//                 style: TextStyle(color: Colors.white54, fontSize: 11.5),
//               ),
//             ],
//           ),
//         ),
//         Obx(
//           () => GestureDetector(
//             onTap: controller.isSaving.value ? null : controller.onSaveConfig,
//             child: const Column(
//               children: [
//                 Icon(Icons.save_outlined, color: kPurple, size: 20),
//                 SizedBox(height: 2),
//                 Text('Save Config', style: TextStyle(color: kPurple, fontSize: 10, fontWeight: FontWeight.w600)),
//               ],
//             ),
//           ),
//         ),
//       ],
//     );
//   }
//
//   // ---------------- Device summary strip ----------------
//   Widget _buildDeviceSummaryCard() {
//     return Container(
//       width: double.infinity,
//       padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
//       decoration: BoxDecoration(
//         color: kCardBg,
//         borderRadius: BorderRadius.circular(12),
//         border: Border.all(color: kBorder),
//       ),
//       child: Row(
//         children: [
//           Container(
//             padding: const EdgeInsets.all(8),
//             decoration: BoxDecoration(
//               color: kGreen.withOpacity(0.15),
//               borderRadius: BorderRadius.circular(9),
//             ),
//             child: const Icon(Icons.desktop_windows_outlined, color: kGreen, size: 16),
//           ),
//           const SizedBox(width: 10),
//           Expanded(
//             child: Obx(
//               () => Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(
//                     'Device: ${controller.deviceId.value}',
//                     style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
//                   ),
//                   const SizedBox(height: 2),
//                   Text(
//                     '${controller.vehicleNumber.value} · ${controller.depotLocation.value}',
//                     style: const TextStyle(color: Colors.white38, fontSize: 10.5),
//                   ),
//                 ],
//               ),
//             ),
//           ),
//           Obx(
//             () => Row(
//               children: [
//                 Container(
//                   width: 6,
//                   height: 6,
//                   decoration: BoxDecoration(
//                     color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
//                     shape: BoxShape.circle,
//                   ),
//                 ),
//                 const SizedBox(width: 4),
//                 Text(
//                   controller.isDeviceOnline.value ? 'Online' : 'Offline',
//                   style: TextStyle(
//                     color: controller.isDeviceOnline.value ? kGreen : Colors.redAccent,
//                     fontSize: 11,
//                     fontWeight: FontWeight.w600,
//                   ),
//                 ),
//               ],
//             ),
//           ),
//         ],
//       ),
//     );
//   }
//
//   // ---------------- Tab bar (Display / Network / System) ----------------
//   Widget _buildTabBar() {
//     final icons = [Icons.tv_outlined, Icons.wifi, Icons.settings_outlined];
//     return Container(
//       padding: const EdgeInsets.all(4),
//       decoration: BoxDecoration(
//         color: kCardBg,
//         borderRadius: BorderRadius.circular(12),
//         border: Border.all(color: kBorder),
//       ),
//       child: Obx(
//         () => Row(
//           children: List.generate(controller.tabLabels.length, (index) {
//             final isActive = controller.selectedTabIndex.value == index;
//             return Expanded(
//               child: GestureDetector(
//                 onTap: () => controller.selectTab(index),
//                 child: Container(
//                   padding: const EdgeInsets.symmetric(vertical: 9),
//                   decoration: BoxDecoration(
//                     color: isActive ? kFieldBg : Colors.transparent,
//                     borderRadius: BorderRadius.circular(9),
//                     border: isActive ? Border.all(color: kPurple.withOpacity(0.4)) : null,
//                   ),
//                   child: Column(
//                     children: [
//                       Icon(icons[index], size: 16, color: isActive ? kPurple : Colors.white38),
//                       const SizedBox(height: 3),
//                       Text(
//                         controller.tabLabels[index],
//                         textAlign: TextAlign.center,
//                         style: TextStyle(
//                           color: isActive ? kPurple : Colors.white38,
//                           fontSize: 9,
//                           fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
//                         ),
//                       ),
//                     ],
//                   ),
//                 ),
//               ),
//             );
//           }),
//         ),
//       ),
//     );
//   }
//
//   // ---------------- Footer (Back + Save Configuration) ----------------
//   Widget _buildFooter() {
//     return Container(
//       width: double.infinity,
//       padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
//       decoration: BoxDecoration(
//         color: kBg,
//         border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
//       ),
//       child: Row(
//         children: [
//           GestureDetector(
//             onTap: controller.onBackPressed,
//             child: Container(
//               height: 50,
//               padding: const EdgeInsets.symmetric(horizontal: 18),
//               decoration: BoxDecoration(
//                 color: kFieldBg,
//                 borderRadius: BorderRadius.circular(12),
//                 border: Border.all(color: kPurple.withOpacity(0.4)),
//               ),
//               alignment: Alignment.center,
//               child: const Row(
//                 children: [
//                   Icon(Icons.chevron_left, color: kPurple, size: 18),
//                   Text('Back', style: TextStyle(color: kPurple, fontSize: 13.5, fontWeight: FontWeight.w700)),
//                 ],
//               ),
//             ),
//           ),
//           const SizedBox(width: 12),
//           Expanded(
//             child: Obx(
//               () => GestureDetector(
//                 onTap: controller.isSaving.value ? null : controller.onSaveConfig,
//                 child: Container(
//                   height: 50,
//                   decoration: BoxDecoration(
//                     gradient: const LinearGradient(colors: [kBlue, kPurple]),
//                     borderRadius: BorderRadius.circular(12),
//                   ),
//                   alignment: Alignment.center,
//                   child: controller.isSaving.value
//                       ? const SizedBox(
//                           width: 20,
//                           height: 20,
//                           child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
//                         )
//                       : const Row(
//                           mainAxisAlignment: MainAxisAlignment.center,
//                           children: [
//                             Icon(Icons.save_outlined, color: Colors.white, size: 17),
//                             SizedBox(width: 8),
//                             Text(
//                               'Save Configuration',
//                               style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
//                             ),
//                           ],
//                         ),
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
