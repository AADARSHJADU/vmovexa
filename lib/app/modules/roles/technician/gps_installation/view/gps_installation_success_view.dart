import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/gps_installation_controller.dart';
import 'gps_installation_view.dart' show GpsInstallationView;

class GpsInstallationSuccessView extends GetView<GpsInstallationController> {
  const GpsInstallationSuccessView({super.key});

  static const Color kBg = GpsInstallationView.kBg;
  static const Color kCardBg = GpsInstallationView.kCardBg;
  static const Color kPurple = GpsInstallationView.kPurple;
  static const Color kIndigo = GpsInstallationView.kIndigo;
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
              const SizedBox(height: 12),
              Row(
                children: [
                  GestureDetector(
                    onTap: controller.onBackPressed,
                    child: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildSuccessBadge(),
              const SizedBox(height: 18),
              const Text(
                'GPS Installed Successfully!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              const Text(
                'GPS device has been assigned to the vehicle.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 12.5),
              ),
              const SizedBox(height: 22),
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

  // ---------------- Success badge (green ring + check + decorative dots) ----------------
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
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: kGreen, width: 2.5)),
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
      child: Obx(
        () => Column(
          children: [
            _detailRow(
              icon: Icons.directions_bus_filled_outlined,
              label: 'Vehicle',
              value: controller.selectedVehicle.value.isEmpty ? '—' : controller.selectedVehicle.value,
              subValue: controller.selectedVehicleDepot,
              trailing: const _AssignedBadge(),
            ),
            _divider(),
            _detailRow(
              icon: Icons.location_on_outlined,
              label: 'GPS Device ID',
              value: controller.gpsDeviceIdCtrl.text.trim().isEmpty ? '—' : controller.gpsDeviceIdCtrl.text.trim(),
              trailing: const _AssignedBadge(),
            ),
            _divider(),
            _detailRow(
              icon: Icons.event_available_outlined,
              label: 'Installation Status',
              value: 'Installed / Assigned',
              valueColor: kGreen,
              trailing: const Icon(Icons.check_circle, color: kGreen, size: 18),
            ),
            _divider(),
            _detailRow(
              icon: Icons.access_time,
              label: 'Assigned On',
              value: controller.assignedOnText,
            ),
            _divider(),
            _detailRow(
              icon: Icons.person_outline,
              label: 'Assigned By',
              value: controller.assignedByLabel.value,
              isLast: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Divider(color: Colors.white.withOpacity(0.06), height: 1);

  Widget _detailRow({
    required IconData icon,
    required String label,
    required String value,
    String? subValue,
    Color? valueColor,
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
            decoration: BoxDecoration(color: kPurple.withOpacity(0.12), borderRadius: BorderRadius.circular(9)),
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
                  style: TextStyle(
                    color: valueColor ?? Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (subValue != null && subValue.isNotEmpty) ...[
                  const SizedBox(height: 1),
                  Text(subValue, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                ],
              ],
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  // ---------------- Buttons ----------------
  Widget _buildPrimaryButton() {
    return GestureDetector(
      onTap: controller.onViewGpsInstallations,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [kPurple, kIndigo]),
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.desktop_windows_outlined, color: Colors.white, size: 18),
            SizedBox(width: 8),
            Text(
              'View GPS Installations',
              style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecondaryButton() {
    return GestureDetector(
      onTap: controller.onGoToDashboard,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kPurple.withOpacity(0.5)),
        ),
        alignment: Alignment.center,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_outlined, color: kPurple, size: 18),
            SizedBox(width: 8),
            Text(
              'Go to Dashboard',
              style: TextStyle(color: kPurple, fontSize: 14.5, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Small green "Assigned" badge with dot
// =====================================================================
class _AssignedBadge extends StatelessWidget {
  const _AssignedBadge();

  static const Color kGreen = GpsInstallationView.kGreen;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: const [
        Icon(Icons.circle, color: kGreen, size: 7),
        SizedBox(width: 5),
        Text('Assigned', style: TextStyle(color: kGreen, fontSize: 11.5, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
