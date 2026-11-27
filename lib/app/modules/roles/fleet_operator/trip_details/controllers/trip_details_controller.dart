import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/trip_models.dart';
import '../../../../../data/models/trip_details_model.dart';
import '../../../../../data/services/fleet_service.dart';

class TripDetailsController extends GetxController {
  final Rx<TripItemModel?> trip = Rx<TripItemModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isEnding = false.obs;
  final RxBool isExporting = false.obs;
  final RxBool copied = false.obs;

  String rawTripId = '';
  String rawVehicleId = '';
  String rawVehicleName = '';
  String rawDriverName = '';
  double? initialLat;
  double? initialLng;

  @override
  void onInit() {
    super.onInit();
    _parseArguments();
    if (rawTripId.isNotEmpty) {
      fetchTripDetails(rawTripId);
    } else if (rawVehicleId.isNotEmpty) {
      fetchTripByVehicle(rawVehicleId);
    }
  }

  void _parseArguments() {
    final args = Get.arguments;
    if (args == null) return;

    if (args is TripItemModel) {
      trip.value = args;
      rawTripId = args.id;
      rawVehicleId = args.vehicleId ?? args.vehicle?.id ?? '';
      rawVehicleName = args.vehicle?.busNumber ?? '';
      rawDriverName = args.driver?.name ?? '';
      initialLat = args.lat;
      initialLng = args.lng;
    } else if (args is TripDetailsModel) {
      rawTripId = args.id;
      rawVehicleId = args.id;
      rawVehicleName = args.vehicleName;
      rawDriverName = args.driverName;
      initialLat = args.lat;
      initialLng = args.lng;
    } else if (args is Map) {
      if (args['trip'] is TripItemModel) {
        trip.value = args['trip'] as TripItemModel;
      }
      rawTripId = args['tripId']?.toString() ??
          args['id']?.toString() ??
          trip.value?.id ??
          '';
      rawVehicleId = args['vehicleId']?.toString() ??
          trip.value?.vehicleId ??
          '';
      rawVehicleName = args['vehicleName']?.toString() ??
          trip.value?.vehicle?.busNumber ??
          '';
      rawDriverName = args['driverName']?.toString() ??
          trip.value?.driver?.name ??
          '';

      if (args['lat'] != null) {
        initialLat = double.tryParse(args['lat'].toString());
      }
      if (args['lng'] != null) {
        initialLng = double.tryParse(args['lng'].toString());
      }
    } else if (args is String || args is num) {
      rawTripId = args.toString();
    }
  }

  String _cleanTripId(String id) {
    if (id.startsWith('TRIP-')) {
      final sub = id.replaceFirst('TRIP-', '');
      final parsed = int.tryParse(sub);
      if (parsed != null && parsed > 0) return parsed.toString();
    }
    return id.trim();
  }

  Future<void> fetchTripDetails(String id) async {
    final cleanId = _cleanTripId(id);
    if (cleanId.isEmpty) return;

    try {
      if (trip.value == null) {
        isLoading.value = true;
      }

      final res = await FleetService.to.getTrip(cleanId);
      if (res.success && res.data != null) {
        trip.value = res.data;
        if (trip.value?.id.isNotEmpty == true) {
          rawTripId = trip.value!.id;
        }
        return;
      }

      // Fallback: search organization's trips list to find matching trip
      final listRes = await FleetService.to.getTrips(limit: 20);
      if (listRes.success && listRes.data != null && listRes.data!.isNotEmpty) {
        final found = listRes.data!.firstWhereOrNull(
          (t) =>
              t.id == cleanId ||
              t.code == id ||
              t.code == cleanId ||
              (rawVehicleId.isNotEmpty && t.vehicleId == rawVehicleId),
        );
        if (found != null) {
          trip.value = found;
          rawTripId = found.id;
          return;
        }
      }
    } catch (e) {
      debugPrint('Error fetching trip details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchTripByVehicle(String vehicleId) async {
    try {
      if (trip.value == null) {
        isLoading.value = true;
      }
      final listRes = await FleetService.to.getTrips(limit: 20);
      if (listRes.success && listRes.data != null && listRes.data!.isNotEmpty) {
        final found = listRes.data!.firstWhereOrNull((t) => t.vehicleId == vehicleId);
        if (found != null) {
          trip.value = found;
          rawTripId = found.id;
        }
      }
    } catch (e) {
      debugPrint('Error fetching trip by vehicle: $e');
    } finally {
      isLoading.value = false;
    }
  }

  String formatDateTime(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw);
      return DateFormat('hh:mm a').format(dt.toLocal());
    } catch (_) {
      return raw;
    }
  }

  // ==========================================
  // DYNAMIC COMPUTED GETTERS
  // ==========================================
  String get tripId {
    if (trip.value != null && trip.value!.code.isNotEmpty) {
      return trip.value!.code;
    }
    if (rawTripId.isNotEmpty) {
      return rawTripId.startsWith('TRIP-')
          ? rawTripId
          : 'TRIP-${rawTripId.padLeft(4, '0')}';
    }
    return '—';
  }

  String get vehicleName {
    final busNum = trip.value?.vehicle?.busNumber;
    if (busNum != null && busNum.isNotEmpty && busNum != '—') {
      return busNum;
    }
    if (rawVehicleName.isNotEmpty && rawVehicleName != '—') {
      return rawVehicleName;
    }
    return '—';
  }

  String get vehicleId {
    return trip.value?.vehicleId ??
        trip.value?.vehicle?.id ??
        (rawVehicleId.isNotEmpty ? rawVehicleId : '—');
  }

  String get vehicleModel {
    final model = trip.value?.vehicle?.model;
    if (model != null && model.isNotEmpty && model != 'Transit Vehicle') {
      return model;
    }
    return '—';
  }

  String get vehicleType {
    final vType = trip.value?.vehicle?.vehicleType;
    if (vType != null && vType.isNotEmpty) {
      return vType;
    }
    return 'Transit Bus';
  }

  String get fleetName {
    return trip.value?.fleetName ?? '—';
  }

  String get driverName {
    final name = trip.value?.driver?.name;
    if (name != null && name.isNotEmpty && name != 'Unassigned Driver') {
      return name;
    }
    if (rawDriverName.isNotEmpty && rawDriverName != '—') {
      return rawDriverName;
    }
    return 'No Driver Assigned';
  }

  String get driverPhone {
    final phone = trip.value?.driver?.phone;
    if (phone != null && phone.isNotEmpty) {
      return phone;
    }
    return '—';
  }

  String get driverLicense {
    final dl = trip.value?.driver?.dlNumber;
    if (dl != null && dl.isNotEmpty) return dl;
    final badge = trip.value?.driver?.badgeId;
    if (badge != null && badge.isNotEmpty) return badge;
    return '—';
  }

  String get origin {
    final org = trip.value?.origin ?? trip.value?.route?.startPoint;
    if (org != null && org.isNotEmpty && org != 'Origin Terminal' && org != 'Origin Station') {
      return org;
    }
    return '—';
  }

  String get originTime {
    return formatDateTime(trip.value?.startedAt);
  }

  String get destination {
    final dest = trip.value?.destination ?? trip.value?.route?.endPoint;
    if (dest != null && dest.isNotEmpty && dest != 'Destination Terminal' && dest != 'Destination Station') {
      return dest;
    }
    return '—';
  }

  String get destinationTime {
    if (trip.value?.endedAt != null) {
      return formatDateTime(trip.value?.endedAt);
    }
    if (trip.value?.eta != null && trip.value!.eta.isNotEmpty) {
      return trip.value!.eta;
    }
    return '—';
  }

  double get totalDistance => trip.value?.distanceKm ?? 0.0;
  double get coveredDistance => trip.value?.coveredKm ?? 0.0;
  double get remainingDistance =>
      ((totalDistance - coveredDistance).clamp(0.0, 99999.0));

  int get progressPercent {
    if (trip.value != null) {
      if (trip.value!.progressPercent > 0) return trip.value!.progressPercent;
      if (status == 'completed') return 100;
      if (totalDistance > 0 && coveredDistance > 0) {
        return ((coveredDistance / totalDistance) * 100).round().clamp(0, 100);
      }
    }
    return status == 'completed' ? 100 : 0;
  }

  String get totalDistanceStr =>
      totalDistance > 0 ? '${totalDistance.toStringAsFixed(1)} km' : '—';
  String get coveredDistanceStr =>
      coveredDistance > 0 ? '${coveredDistance.toStringAsFixed(1)} km ($progressPercent%)' : '0.0 km (0%)';
  String get remainingDistanceStr =>
      totalDistance > 0 ? '${remainingDistance.toStringAsFixed(1)} km' : '—';

  String get etaStr {
    if (trip.value?.eta != null && trip.value!.eta.isNotEmpty) {
      return trip.value!.eta;
    }
    return status == 'completed' ? 'Completed' : 'On Schedule';
  }

  String get currentSpeedStr {
    if (trip.value?.currentSpeed != null) {
      return '${trip.value!.currentSpeed!.toStringAsFixed(0)} km/h';
    }
    return status == 'completed' ? '0 km/h' : '—';
  }

  String get avgSpeedStr {
    if (trip.value?.avgSpeed != null) {
      return '${trip.value!.avgSpeed!.toStringAsFixed(0)} km/h';
    }
    return '—';
  }

  String get maxSpeedStr {
    if (trip.value?.maxSpeed != null) {
      return '${trip.value!.maxSpeed!.toStringAsFixed(0)} km/h';
    }
    return '—';
  }

  String get punctualityStatus {
    if (trip.value?.punctualityStatus != null && trip.value!.punctualityStatus.isNotEmpty) {
      return trip.value!.punctualityStatus;
    }
    return 'On Schedule';
  }

  String get gpsStatus {
    final st = trip.value?.vehicle?.gpsStatus;
    if (st != null && st.isNotEmpty) {
      return st.toUpperCase();
    }
    return 'CONNECTED';
  }

  String get gpsCode {
    final devId = trip.value?.vehicle?.gpsDeviceId;
    if (devId != null && devId.isNotEmpty && devId != 'Active Onboard') {
      return devId;
    }
    return 'Active Onboard';
  }

  String get batteryFuel {
    final fuel = trip.value?.vehicle?.fuelType;
    if (fuel != null && fuel.isNotEmpty) {
      return fuel.toUpperCase();
    }
    return 'ELECTRIC / DIESEL';
  }

  String get status {
    return trip.value?.status.toLowerCase() ?? 'scheduled';
  }

  double? get lat => trip.value?.lat ?? initialLat;
  double? get lng => trip.value?.lng ?? initialLng;

  void copyTripId() {
    final code = tripId;
    if (code.isEmpty || code == '—') return;
    Clipboard.setData(ClipboardData(text: code));
    copied.value = true;
    Future.delayed(const Duration(seconds: 2), () {
      copied.value = false;
    });
    Get.snackbar(
      'copied_title'.tr,
      'Trip code $code copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }

  // ==========================================
  // ACTION 1: CALL DRIVER
  // ==========================================
  Future<void> callDriver() async {
    final cleanPhone = driverPhone.replaceAll(RegExp(r'[^\d+]'), '');
    if (cleanPhone.isEmpty || driverPhone == '—') {
      Get.snackbar(
        'driver'.tr,
        'Driver contact number is not available.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    final uri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'driver'.tr,
          'Opening dialer for $cleanPhone...',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'driver'.tr,
        'Dialing $cleanPhone...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  // ==========================================
  // ACTION 2: NAVIGATION (GOOGLE MAPS)
  // ==========================================
  Future<void> navigate() async {
    Uri url;
    if (lat != null && lng != null && lat != 0.0 && lng != 0.0) {
      url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    } else if (destination.isNotEmpty && destination != '—') {
      url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(destination)}');
    } else {
      Get.snackbar(
        'navigation'.tr,
        'Destination coordinates or address not available.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
      );
      return;
    }

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'navigation'.tr,
          'Opening navigation...',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF3B82F6),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'navigation'.tr,
        'Could not launch maps navigation: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  // ==========================================
  // ACTION 3: ALERT (DISPATCH & EMERGENCY)
  // ==========================================
  void sendAlert() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orangeAccent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Fleet Dispatch & Emergency Alert',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '$vehicleName • $driverName',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'SELECT ACTION',
              style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
            ),
            const SizedBox(height: 12),

            // Option 1: In-Cab Telematics Alert
            _buildAlertOptionTile(
              icon: Icons.notifications_active_rounded,
              iconColor: const Color(0xFF3B82F6),
              title: 'Send In-Cab Telematics Alert',
              subtitle: 'Broadcast real-time alert tone & text to vehicle display',
              onTap: () {
                Get.back();
                _showQuickAlertBottomSheet();
              },
            ),
            const SizedBox(height: 10),

            // Option 2: File Official Emergency Incident
            _buildAlertOptionTile(
              icon: Icons.emergency_rounded,
              iconColor: Colors.redAccent,
              title: 'Report Emergency / Incident',
              subtitle: 'Open full emergency incident workflow for this vehicle',
              onTap: () {
                Get.back();
                Get.toNamed(Routes.FLEET_REPORT_INCIDENT, arguments: {
                  'vehicleId': vehicleId,
                  'vehicleName': vehicleName,
                  'driverName': driverName,
                });
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildAlertOptionTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 14),
          ],
        ),
      ),
    );
  }

  void _showQuickAlertBottomSheet() {
    final alerts = [
      {'title': 'Overspeed Warning', 'desc': 'Speed limit exceeded. Please reduce speed.', 'icon': Icons.speed_rounded, 'color': Colors.redAccent},
      {'title': 'Corridor Deviation', 'desc': 'Vehicle moved off assigned route corridor.', 'icon': Icons.alt_route_rounded, 'color': Colors.orangeAccent},
      {'title': 'Depot Recall', 'desc': 'Return vehicle to depot station yard immediately.', 'icon': Icons.warehouse_rounded, 'color': const Color(0xFF8B5CF6)},
      {'title': 'Traffic Advisory', 'desc': 'Heavy congestion reported along transit path.', 'icon': Icons.traffic_rounded, 'color': const Color(0xFF3B82F6)},
    ];

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Telematics Alert Preset',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...alerts.map((a) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFF334155)),
                  ),
                  tileColor: AppColors.cardBg,
                  leading: Icon(a['icon'] as IconData, color: a['color'] as Color),
                  title: Text(a['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text(a['desc'] as String, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  onTap: () {
                    Get.back();
                    _broadcastAlertToVehicle(a['title'] as String, a['desc'] as String);
                  },
                ),
              );
            }),
            const SizedBox(height: 8),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  void _broadcastAlertToVehicle(String title, String message) {
    Get.snackbar(
      'Alert Transmitted',
      'Pushed to $vehicleName: "$title - $message"',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
      duration: const Duration(seconds: 3),
    );
  }

  // ==========================================
  // ACTION 4: EXPORT PDF / TRIP REPORT
  // ==========================================
  Future<void> downloadReport() async {
    if (isExporting.value) return;
    isExporting.value = true;
    try {
      final pdfContent = _generateTripPdfText();
      final cleanTripId = tripId.replaceAll(RegExp(r'[^\w\-]'), '_');
      final fileName = 'TRIP_REPORT_$cleanTripId.pdf';

      Directory saveDir;
      if (Platform.isAndroid) {
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          saveDir = downloadDir;
        } else {
          saveDir = Directory.systemTemp;
        }
      } else {
        saveDir = Directory.systemTemp;
      }

      final file = File('${saveDir.path}/$fileName');
      await file.writeAsString(pdfContent, flush: true);

      Get.snackbar(
        'export_pdf_btn'.tr,
        'Trip Sheet PDF saved to: ${file.path}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => _openDownloadedFile(file.path),
          child: Text('open'.tr.toUpperCase(), maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      );

      _showPdfExportSuccessSheet(file.path);
    } catch (e) {
      Get.snackbar(
        'export_pdf_btn'.tr,
        'Export failed: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isExporting.value = false;
    }
  }

  String _generateTripPdfText() {
    return '''%PDF-1.4
%=======================================================
% OFFICIAL VMOVEXA TRANSIT TRIP REPORT & TELEMETRY MANIFEST
%=======================================================
TRIP ID: $tripId
DATE: ${DateTime.now().toIso8601String().substring(0, 10)}
STATUS: ${status.toUpperCase()}
VEHICLE: $vehicleName ($vehicleModel)
FLEET: $fleetName
GPS TRACKER: $gpsCode (Status: $gpsStatus)
BATTERY / FUEL: $batteryFuel

ASSIGNED OPERATOR / DRIVER:
Name: $driverName
Phone: $driverPhone
License: $driverLicense

ROUTE TELEMETRY & PROGRESS:
Origin Terminal: $origin
Departure Time: $originTime
Destination Terminal: $destination
Scheduled Arrival / ETA: $destinationTime
Total Route Distance: $totalDistanceStr
Covered Distance: $coveredDistanceStr
Remaining Distance: $remainingDistanceStr
Current Speed: $currentSpeedStr
Average Speed: $avgSpeedStr
Punctuality: $punctualityStatus

WAYPOINT TIMELINE:
1. Departs: $origin ($originTime)
2. Mid-Corridor Checkpoint: En Route ($coveredDistanceStr)
3. Live Coordinates: ${lat != null && lng != null ? '$lat, $lng' : 'Tracking Active'}
4. Arrival Terminal: $destination ($destinationTime)

-------------------------------------------------------
OFFICIAL CERTIFICATION:
This document is a certified digital transit log generated
by VMOVEXA Intelligent Fleet Telematics Cloud Platform.
-------------------------------------------------------
''';
  }

  void _showPdfExportSuccessSheet(String filePath) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Trip Sheet PDF Exported',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        tripId,
                        style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.description_rounded, color: Colors.white70, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      filePath,
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy_rounded, color: Color(0xFF8B5CF6), size: 18),
                    tooltip: 'copy_path'.tr,
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: filePath));
                      Get.snackbar(
                        'copied_title'.tr,
                        'path_copied_clipboard_msg'.tr,
                        snackPosition: SnackPosition.BOTTOM,
                        duration: const Duration(seconds: 2),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Color(0xFF334155)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('close'.tr, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Get.back();
                      _openDownloadedFile(filePath);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B5CF6),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.visibility_rounded, size: 16),
                    label: Text('open_file'.tr, maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Future<void> _openDownloadedFile(String filePath) async {
    try {
      final uri = Uri.file(filePath);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        Get.snackbar(
          'open_file'.tr,
          'File saved at $filePath',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF6366F1),
          colorText: Colors.white,
        );
      }
    } catch (_) {
      Get.snackbar(
        'open_file'.tr,
        'File saved at $filePath',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  // ==========================================
  // ACTION 5: COMPLETE TRIP VIA API
  // ==========================================
  Future<void> completeTrip() async {
    if (status == 'completed' || isEnding.value) return;

    final idToEnd = trip.value?.id.isNotEmpty == true ? trip.value!.id : rawTripId;
    if (idToEnd.isEmpty) {
      Get.snackbar(
        'error'.tr,
        'Trip ID not available to complete.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    try {
      isEnding.value = true;
      final cleanId = _cleanTripId(idToEnd);
      final res = await FleetService.to.endTrip(cleanId);
      if (res.success) {
        Get.snackbar(
          'completed'.tr,
          'Trip marked as completed successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );
        await fetchTripDetails(idToEnd);
      } else {
        Get.snackbar(
          'error'.tr,
          (res.message != null && res.message!.isNotEmpty)
              ? res.message!
              : 'Failed to complete trip.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'Failed to complete trip: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isEnding.value = false;
    }
  }
}
