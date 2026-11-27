import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../../../../../../theme/app_theme.dart';
import '../controller/register_device_controller.dart';
import 'register_device_view.dart' show RegisterDeviceView;

class RegistrationSuccessView extends GetView<RegisterDeviceController> {
  const RegistrationSuccessView({super.key});

  static const Color kBg = RegisterDeviceView.kBg;
  static const Color kCardBg = RegisterDeviceView.kCardBg;
  static const Color kPurple = RegisterDeviceView.kPurple;
  static const Color kIndigo = RegisterDeviceView.kIndigo;
  static const Color kBorder = RegisterDeviceView.kBorder;
  static const Color kGreen = Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(height: 24),
              _buildSuccessBadge(),
              const SizedBox(height: 20),
              Text(
                'device_registered_success'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                'register_edge_device_subtitle'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white54, fontSize: 12.5),
              ),
              const SizedBox(height: 24),
              _buildDetailsCard(),
              const SizedBox(height: 24),
              _buildPrimaryButton(),
              const SizedBox(height: 10),
              _buildSecondaryButton(),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- Animated-looking success badge ----------------
  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 130,
      height: 130,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 84,
            height: 84,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: kGreen.withValues(alpha: 0.12),
              border: Border.all(color: kGreen, width: 2.5),
            ),
            child: const Icon(Icons.check, color: kGreen, size: 38),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDots() {
    const positions = [
      Alignment(-0.75, -0.75),
      Alignment(0.85, -0.55),
      Alignment(-0.95, 0.15),
      Alignment(0.75, 0.75),
      Alignment(-0.35, 0.95),
      Alignment(0.25, -0.98),
    ];
    return positions
        .map(
          (a) => Align(
            alignment: a,
            child: Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
            ),
          ),
        )
        .toList();
  }

  // ---------------- Details card ----------------
  Widget _buildDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          _detailRow(
            icon: Icons.memory_rounded,
            label: 'box_id_label'.tr,
            value: controller.registeredDeviceId,
            trailing: Row(
              children: [
                const Icon(Icons.circle, color: kGreen, size: 7),
                const SizedBox(width: 5),
                Text('common.active'.tr, style: const TextStyle(color: kGreen, fontSize: 11.5, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          _divider(),
          _detailRow(
            icon: Icons.router_rounded,
            label: 'device_info_section'.tr,
            value: controller.registeredDeviceTypeLabel,
          ),
          _divider(),
          Obx(() {
            return _detailRow(
              icon: Icons.directions_bus_filled_outlined,
              label: 'select_vehicle_bus'.tr,
              value: controller.selectedVehicle.value.isEmpty ? '—' : controller.selectedVehicle.value,
              subValue: controller.registeredVehicleDepot,
            );
          }),
          _divider(),
          _detailRow(
            icon: Icons.event_available_outlined,
            label: 'registered_on_label'.tr,
            value: controller.registeredOnText,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withValues(alpha: 0.06), height: 1);

  Widget _detailRow({
    required IconData icon,
    required String label,
    required String value,
    String? subValue,
    Widget? trailing,
    bool isLast = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: kPurple.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, color: kPurple, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                if (subValue != null && subValue.isNotEmpty) ...[
                  const SizedBox(height: 1),
                  Text(subValue, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                ],
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }

  // ---------------- Buttons ----------------
  Widget _buildPrimaryButton() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => Get.offNamed(Routes.TECH_EDGE_SETUP),
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.gradientPink.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.terminal_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'edge_setup'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: controller.onGoToDisplayDevices,
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.devices_other_rounded, color: Colors.white70, size: 18),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'edge_devices'.tr,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSecondaryButton() {
    return GestureDetector(
      onTap: controller.onRegisterAnotherDevice,
      child: Container(
        width: double.infinity,
        height: 50,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.accentPurple),
        ),
        alignment: Alignment.center,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_circle_outline, color: kPurple, size: 18),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                'register_edge_device'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.accentPurple, fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
