import 'package:get/get.dart';
import '../model/diagnostic_check_model.dart';

class DeviceDiagnosticsController extends GetxController {
  // ---------------- Selected device (from route argument / API) ----------------
  final RxString deviceId = 'VMX-DISP-001'.obs;
  final RxString deviceType = 'Display Device'.obs;
  final RxString vehicleNumber = 'Bus MH12 AB 1234'.obs;

  // ---------------- Diagnostic checks ----------------
  final RxList<DiagnosticCheck> checks = <DiagnosticCheck>[].obs;

  // ---------------- Run state ----------------
  final RxBool isRunning = false.obs;
  final Rxn<DateTime> lastRunDateTime = Rxn<DateTime>();
  final RxBool hasRunOnce = false.obs;

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get lastRunText {
    final dt = lastRunDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  bool get allChecksPassed => checks.every((c) => c.state == DiagnosticCheckState.passed);
  bool get hasFailures => checks.any((c) => c.state == DiagnosticCheckState.failed);
  bool get hasWarnings => checks.any((c) => c.state == DiagnosticCheckState.warning);

  int get passedCount => checks.where((c) => c.state == DiagnosticCheckState.passed).length;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      deviceId.value = args['deviceId'] ?? deviceId.value;
      deviceType.value = args['deviceType'] ?? deviceType.value;
      vehicleNumber.value = args['vehicleNumber'] ?? vehicleNumber.value;
    }
    _loadChecks();
  }

  void _loadChecks() {
    checks.assignAll([
      DiagnosticCheck(
        id: 'connectivity',
        title: 'Device Connectivity',
        subtitle: 'Checks internet and device connectivity',
        //icon: Icons.wifi,
        svgPath: 'assets/icons/wifi.svg',
        state: DiagnosticCheckState.passed,
        statusLabel: 'Online',
      ),
      DiagnosticCheck(
        id: 'display',
        title: 'Display Status',
        subtitle: 'Checks display output and screen health',
        //icon: Icons.desktop_windows_outlined,
        svgPath: 'assets/icons/tv.svg',
        state: DiagnosticCheckState.passed,
        statusLabel: 'Normal',
      ),
      DiagnosticCheck(
        id: 'gps',
        title: 'GPS Status',
        subtitle: 'Checks GPS signal and location accuracy',
        //icon: Icons.location_on_outlined,
        svgPath: 'assets/icons/location.svg',
        state: DiagnosticCheckState.passed,
        statusLabel: 'Good Signal',
      ),
      DiagnosticCheck(
        id: 'hardware',
        title: 'Hardware Health',
        subtitle: 'Checks hardware components and sensors',
        //icon: Icons.memory_outlined,
        svgPath: 'assets/icons/fleet_operator_icons/yoursupportHistoryA.svg',
        state: DiagnosticCheckState.passed,
        statusLabel: 'Healthy',
      ),
    ]);
    hasRunOnce.value = true;
    lastRunDateTime.value = DateTime(2025, 5, 14, 10, 30);
  }

  // ---------------- Run diagnostics ----------------
  Future<void> onRunDiagnosticsPressed() async {
    if (isRunning.value) return;
    isRunning.value = true;

    // Reset all checks to "running" state one by one for a live feel
    for (final check in checks) {
      check.state = DiagnosticCheckState.running;
      check.statusLabel = 'Checking...';
    }
    checks.refresh();

    try {
      for (int i = 0; i < checks.length; i++) {
        await Future.delayed(const Duration(milliseconds: 500));
        // TODO: replace with real diagnostic API result per check
        _applyMockResult(checks[i]);
        checks.refresh();
      }
      lastRunDateTime.value = DateTime.now();
      hasRunOnce.value = true;
    } finally {
      isRunning.value = false;
    }
  }

  void _applyMockResult(DiagnosticCheck check) {
    switch (check.id) {
      case 'connectivity':
        check.state = DiagnosticCheckState.passed;
        check.statusLabel = 'Online';
        break;
      case 'display':
        check.state = DiagnosticCheckState.passed;
        check.statusLabel = 'Normal';
        break;
      case 'gps':
        check.state = DiagnosticCheckState.passed;
        check.statusLabel = 'Good Signal';
        break;
      case 'hardware':
        check.state = DiagnosticCheckState.passed;
        check.statusLabel = 'Healthy';
        break;
    }
  }

  void onBackPressed() => Get.back();
}
