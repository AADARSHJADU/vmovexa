import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/gps_installation_controller.dart';
import 'gps_installation_view.dart' show GpsInstallationView;

class GpsInstallationSuccessView extends GetView<GpsInstallationController> {
  const GpsInstallationSuccessView({super.key});

  static const Color kBg = GpsInstallationView.kBg;
  static const Color kCardBg = GpsInstallationView.kCardBg;
  static const Color kBorder = GpsInstallationView.kBorder;
  static const Color kGreen = GpsInstallationView.kGreen;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(height: 14),
              Row(
                children: [
                  IconButton(
                    onPressed: controller.onGoToDashboard,
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _buildSuccessBadge(),
              const SizedBox(height: 18),
              Text(
                'gps_installed_success'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                'gps_installed_success_desc'.tr,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white54, fontSize: 12.5, height: 1.35),
              ),
              const SizedBox(height: 24),
              _buildDetailsCard(),
              const Spacer(),
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

  // ==========================================================
  // Success badge (green ring + check + decorative dots)
  // ==========================================================
  Widget _buildSuccessBadge() {
    return SizedBox(
      width: 120,
      height: 120,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ..._buildDots(),
          Container(
            width: 78,
            height: 78,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: kGreen.withValues(alpha: 0.12),
              border: Border.all(color: kGreen, width: 2.5),
            ),
            child: const Icon(Icons.check, color: kGreen, size: 36),
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

  // ==========================================================
  // Summary Details Card (Matching Admin Panel)
  // ==========================================================
  Widget _buildDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Obx(
        () => Column(
          children: [
            // Top Header: Assigned Vehicle & Active Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'assigned_vehicle_caps'.tr,
                      style: const TextStyle(
                        color: Colors.white38,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      controller.installedBusNumber.value.isNotEmpty
                          ? controller.installedBusNumber.value
                          : (controller.selectedVehicle.value?.registrationNumber ?? '—'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: kGreen.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: kGreen.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.circle, color: kGreen, size: 7),
                      const SizedBox(width: 5),
                      Text(
                        'assigned_and_active'.tr,
                        style: const TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Divider(color: Colors.white.withValues(alpha: 0.06), height: 1),
            const SizedBox(height: 12),

            // 4 Fields Grid
            _detailRow(
              label: 'gps_device_id_label'.tr,
              value: controller.installedGpsId.value.isNotEmpty
                  ? controller.installedGpsId.value
                  : (controller.gpsDeviceIdCtrl.text.isNotEmpty ? controller.gpsDeviceIdCtrl.text : '—'),
              isMono: true,
              valueColor: const Color(0xFF60A5FA),
            ),
            const SizedBox(height: 10),
            _detailRow(
              label: 'depot_location_label'.tr,
              value: controller.installedDepot.value.isNotEmpty
                  ? controller.installedDepot.value
                  : controller.selectedVehicleDepot,
            ),
            const SizedBox(height: 10),
            _detailRow(
              label: 'assigned_on_label'.tr,
              value: controller.assignedOnText,
            ),
            const SizedBox(height: 10),
            _detailRow(
              label: 'technician_label'.tr,
              value: controller.assignedByLabel.value,
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow({
    required String label,
    required String value,
    bool isMono = false,
    Color valueColor = Colors.white,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white54, fontSize: 12),
        ),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: 12.5,
            fontFamily: isMono ? 'monospace' : null,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // ==========================================================
  // Action Buttons (Matching Admin Panel)
  // ==========================================================
  Widget _buildPrimaryButton() {
    return InkWell(
      onTap: controller.onViewHardwareStatus,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: double.infinity,
        height: 50,
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
            Text(
              'view_hardware_gps_status'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, color: Colors.white, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryButton() {
    return InkWell(
      onTap: controller.onGoToDashboard,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: double.infinity,
        height: 50,
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        ),
        alignment: Alignment.center,
        child: Text(
          'go_to_dashboard'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
