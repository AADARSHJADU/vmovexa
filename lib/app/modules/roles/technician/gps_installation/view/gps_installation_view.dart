import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/gps_installation_controller.dart';

class GpsInstallationView extends GetView<GpsInstallationController> {
  const GpsInstallationView({super.key});

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
              child: _buildHeader(),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildCardWrapper(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader(Icons.directions_bus_filled_outlined, 'Vehicle'),
                        const SizedBox(height: 10),
                        Obx(
                          () => _LabeledDropdown(
                            hint: 'Select Vehicle',
                            value: controller.selectedVehicle.value.isEmpty ? null : controller.selectedVehicle.value,
                            items: controller.vehicleOptions,
                            onChanged: controller.setSelectedVehicle,
                            errorText: controller.vehicleError.value,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Choose the vehicle to install GPS.',
                          style: TextStyle(color: Colors.white38, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildCardWrapper(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader(Icons.location_on_outlined, 'GPS Device ID'),
                        const SizedBox(height: 10),
                        Obx(
                          () => _GpsIdField(
                            controller: controller.gpsDeviceIdCtrl,
                            errorText: controller.gpsDeviceIdError.value,
                            onScanTap: controller.onScanQr,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Scan QR code or enter the GPS device ID manually.',
                          style: TextStyle(color: Colors.white38, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildCardWrapper(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader(Icons.wifi_tethering, 'Installation Status'),
                        const SizedBox(height: 10),
                        Obx(() => _buildStatusBox()),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            _buildFooterButton(),
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
                'GPS Installation',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 2),
              Text(
                'Install or assign a GPS device to a vehicle.',
                style: TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: kPurple.withOpacity(0.15),
            borderRadius: BorderRadius.circular(9),
          ),
          child: Icon(icon, color: kPurple, size: 16),
        ),
        const SizedBox(width: 10),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildCardWrapper({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: child,
    );
  }

  // ---------------- Installation Status box ----------------
  Widget _buildStatusBox() {
    final installed = controller.isInstalled;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 9,
            height: 9,
            margin: const EdgeInsets.only(top: 3),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: installed ? kGreen : Colors.white24,
              border: installed ? null : Border.all(color: Colors.white38),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  installed ? 'Installed / Assigned' : 'Not Installed',
                  style: TextStyle(
                    color: installed ? kGreen : Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  installed
                      ? 'GPS device is assigned to this vehicle.'
                      : 'GPS device not assigned to this vehicle.',
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Footer (Install / Assign GPS) ----------------
  Widget _buildFooterButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Obx(
        () => GestureDetector(
          onTap: controller.isInstalling.value ? null : controller.onInstallAssignPressed,
          child: Container(
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [kPurple, kIndigo]),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: controller.isInstalling.value
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.4),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_on_outlined, color: Colors.white, size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Install / Assign GPS',
                        style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

// =====================================================================
// Labeled dropdown (Vehicle picker)
// =====================================================================
class _LabeledDropdown extends StatelessWidget {
  final String hint;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final String? errorText;

  const _LabeledDropdown({
    required this.hint,
    required this.value,
    required this.items,
    required this.onChanged,
    this.errorText,
  });

  static const Color kFieldBg = GpsInstallationView.kFieldBg;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: errorText != null ? const Color(0xFFFF4D4D) : Colors.white.withOpacity(0.08),
            ),
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
        if (errorText != null) ...[
          const SizedBox(height: 4),
          Text(errorText!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
        ],
      ],
    );
  }
}

// =====================================================================
// GPS Device ID field with scan button
// =====================================================================
class _GpsIdField extends StatelessWidget {
  final TextEditingController controller;
  final String? errorText;
  final VoidCallback onScanTap;

  const _GpsIdField({required this.controller, this.errorText, required this.onScanTap});

  static const Color kFieldBg = GpsInstallationView.kFieldBg;
  static const Color kPurple = GpsInstallationView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: errorText != null ? const Color(0xFFFF4D4D) : Colors.white.withOpacity(0.08),
                  ),
                ),
                child: TextField(
                  controller: controller,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    hintText: 'Enter GPS Device ID',
                    hintStyle: TextStyle(color: Colors.white30, fontSize: 12.5),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onScanTap,
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kPurple.withOpacity(0.4)),
                ),
                child: const Icon(Icons.qr_code_scanner, color: kPurple, size: 20),
              ),
            ),
          ],
        ),
        if (errorText != null) ...[
          const SizedBox(height: 4),
          Text(errorText!, style: const TextStyle(color: Color(0xFFFF4D4D), fontSize: 10.5)),
        ],
      ],
    );
  }
}
