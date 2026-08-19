import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/device_diagnostics_controller.dart';
import '../model/diagnostic_check_model.dart';

class DeviceDiagnosticsView extends GetView<DeviceDiagnosticsController> {
  const DeviceDiagnosticsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
          children: [
            _buildHeader(),
            const SizedBox(height: 16),
            _buildDeviceSummaryCard(),
            const SizedBox(height: 20),
            const Text(
              'Diagnostic Checks',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            _buildChecksCard(),
            const SizedBox(height: 16),
            _buildRunDiagnosticsButton(),
            const SizedBox(height: 20),
            const Text(
              'Diagnostic Result',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            _buildResultCard(),
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
                'Device Diagnostics',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 2),
              Text(
                'Run and view diagnostic checks for the device.',
                style: TextStyle(color: Colors.white, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Selected device summary ----------------
  Widget _buildDeviceSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kPurple.withOpacity(0.15),
              borderRadius: BorderRadius.circular(11),
            ),
            child: const Icon(Icons.desktop_windows_outlined, color: kPurple, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(
              () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selected Device', style: TextStyle(color: Colors.white, fontSize: 10.5)),
                  const SizedBox(height: 2),
                  Text(
                    controller.deviceId.value,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Text(controller.deviceType.value, style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                ],
              ),
            ),
          ),
          Obx(
            () => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: kPurple.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: kPurple.withOpacity(0.35)),
              ),
              child: Text(
                controller.vehicleNumber.value,
                style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Diagnostic checks list ----------------
  Widget _buildChecksCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Obx(
        () => Column(
          children: List.generate(controller.checks.length, (index) {
            final check = controller.checks[index];
            final isLast = index == controller.checks.length - 1;
            return Column(
              children: [
                _CheckRow(check: check),
                if (!isLast) Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14),
              ],
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Run Diagnostics button ----------------
  Widget _buildRunDiagnosticsButton() {
    return Obx(
      () => GestureDetector(
        onTap: controller.isRunning.value ? null : controller.onRunDiagnosticsPressed,
        child: Container(
          width: double.infinity,
          height: 52,
          decoration: BoxDecoration(
            gradient:AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: controller.isRunning.value
              ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                    ),
                    SizedBox(width: 10),
                    Text(
                      'Running Diagnostics...',
                      style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
                    ),
                  ],
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.monitor_heart_outlined, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Run Diagnostics',
                      style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  // ---------------- Diagnostic Result card ----------------
  Widget _buildResultCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Obx(() {
        if (!controller.hasRunOnce.value || controller.isRunning.value) {
          return Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: kFieldBg, shape: BoxShape.circle),
                child: const Icon(Icons.hourglass_empty, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Run diagnostics to see results.',
                  style: TextStyle(color: Colors.white, fontSize: 12.5),
                ),
              ),
            ],
          );
        }

        final allPassed = controller.allChecksPassed;
        final resultColor = allPassed ? kGreen : (controller.hasFailures ? const Color(0xFFFF4D4D) : const Color(0xFFFFA726));
        final resultIcon = allPassed ? Icons.check : (controller.hasFailures ? Icons.close : Icons.priority_high);
        final resultTitle = allPassed
            ? 'All checks passed'
            : (controller.hasFailures ? 'Some checks failed' : 'Passed with warnings');
        final resultSubtitle = allPassed
            ? 'No issues found with the device.'
            : 'Review the checks above for details.';

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(color: resultColor, shape: BoxShape.circle),
                  child: Icon(resultIcon, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        resultTitle,
                        style: TextStyle(color: resultColor, fontSize: 13.5, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 2),
                      Text(resultSubtitle, style: const TextStyle(color: Colors.white, fontSize: 11.5)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Divider(color: Colors.white.withOpacity(0.06), height: 1),
            const SizedBox(height: 12),
            const Text('Last Run', style: TextStyle(color: Colors.white, fontSize: 10.5)),
            const SizedBox(height: 3),
            Text(
              controller.lastRunText,
              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
            ),
          ],
        );
      }),
    );
  }
}

// =====================================================================
// Single diagnostic check row
// =====================================================================
class _CheckRow extends StatelessWidget {
  final DiagnosticCheck check;
  const _CheckRow({required this.check});

  static const Color kPurple = DeviceDiagnosticsView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: kPurple.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(check.icon, color: kPurple, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(check.title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(check.subtitle, style: const TextStyle(color: Colors.white, fontSize: 10.5)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Icon(
                check.statusIcon,
                color: check.statusColor,
                size: 18,
              ),
              const SizedBox(height: 3),
              Text(
                check.statusLabel,
                style: TextStyle(color: check.statusColor, fontSize: 10.5, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
