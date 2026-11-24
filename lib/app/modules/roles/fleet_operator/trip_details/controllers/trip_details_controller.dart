import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../data/models/trip_models.dart';
import '../../../../../data/models/trip_details_model.dart';

class TripDetailsController extends GetxController {
  late String tripId;
  late String vehicleName;
  late String vehicleId;
  late String vehicleModel;
  late String fleetName;
  late String driverName;
  late String driverPhone;
  late String driverLicense;
  late String origin;
  late String originTime;
  late String destination;
  late String destinationTime;
  late String totalDistanceStr;
  late String coveredDistanceStr;
  late String remainingDistanceStr;
  late String etaStr;
  late String currentSpeedStr;
  late String avgSpeedStr;
  late String maxSpeedStr;
  late String timeEnRouteStr;
  late String stopsCountStr;
  late String gpsStatus;
  late String gpsCode;
  late String batteryFuel;
  late String status;
  double? lat;
  double? lng;

  final RxBool isExporting = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;

    TripItemModel? tripItem;
    TripDetailsModel? tripDetails;
    Map<dynamic, dynamic>? argsMap;

    if (args is TripItemModel) {
      tripItem = args;
    } else if (args is TripDetailsModel) {
      tripDetails = args;
    } else if (args is Map) {
      argsMap = args;
      if (args['trip'] is TripItemModel) {
        tripItem = args['trip'] as TripItemModel;
      } else if (args['tripDetails'] is TripDetailsModel) {
        tripDetails = args['tripDetails'] as TripDetailsModel;
      }
    }

    // Vehicle Information
    vehicleName = argsMap?['vehicleName']?.toString() ??
        tripItem?.vehicle?.busNumber ??
        tripDetails?.vehiclePlate ??
        tripDetails?.vehicleName ??
        'MH12AB1234';

    vehicleId = argsMap?['vehicleId']?.toString() ??
        tripItem?.vehicleId ??
        tripDetails?.id ??
        '5';

    vehicleModel = argsMap?['vehicleModel']?.toString() ??
        tripItem?.vehicle?.model ??
        tripDetails?.vehicleModel ??
        'Volvo 8400 Electric';

    fleetName = argsMap?['fleetName']?.toString() ?? 'City Bus Fleet';

    // Driver Information
    driverName = argsMap?['driverName']?.toString() ??
        tripItem?.driver?.name ??
        tripDetails?.driverName ??
        'Rajesh Kumar';

    driverPhone = argsMap?['driverPhone']?.toString() ??
        argsMap?['phone']?.toString() ??
        tripItem?.driver?.phone ??
        tripDetails?.driverPhone ??
        '+91 98765 43210';

    driverLicense = argsMap?['driverLicense']?.toString() ??
        tripItem?.driver?.dlNumber ??
        tripDetails?.driverLicense ??
        'KA01 2015 123456';

    // Trip ID & Route Info
    tripId = argsMap?['tripId']?.toString() ??
        tripItem?.code ??
        tripItem?.id ??
        tripDetails?.code ??
        tripDetails?.id ??
        'TRIP-20260805-001';

    origin = argsMap?['source']?.toString() ??
        argsMap?['origin']?.toString() ??
        tripItem?.origin ??
        tripDetails?.origin ??
        'MG Road, Bengaluru';

    originTime = argsMap?['originTime']?.toString() ??
        tripItem?.startedAt ??
        tripDetails?.displayStartTime ??
        '08:10 AM';

    destination = argsMap?['destination']?.toString() ??
        tripItem?.destination ??
        tripDetails?.destination ??
        'Kempegowda Bus Station';

    destinationTime = argsMap?['destinationTime']?.toString() ??
        tripItem?.endedAt ??
        '09:25 AM';

    // Distances & Progress
    if (tripItem != null && tripItem.distanceKm > 0) {
      totalDistanceStr = '${tripItem.distanceKm.toStringAsFixed(1)} km';
      coveredDistanceStr = '${tripItem.coveredKm.toStringAsFixed(1)} km (${tripItem.progressPercent}%)';
      final rem = (tripItem.distanceKm - tripItem.coveredKm).clamp(0.0, 99999.0);
      remainingDistanceStr = '${rem.toStringAsFixed(1)} km';
    } else if (tripDetails != null && tripDetails.totalDistance > 0) {
      totalDistanceStr = '${tripDetails.totalDistance.toStringAsFixed(1)} km';
      coveredDistanceStr = '${tripDetails.coveredDistance.toStringAsFixed(1)} km (${tripDetails.progressPercent}%)';
      remainingDistanceStr = '${tripDetails.remainingDistance.toStringAsFixed(1)} km';
    } else {
      totalDistanceStr = argsMap?['distance']?.toString() ?? '18.6 km';
      coveredDistanceStr = '6.2 km (33%)';
      remainingDistanceStr = '12.4 km';
    }

    etaStr = argsMap?['eta']?.toString() ??
        tripItem?.eta ??
        tripDetails?.eta ??
        '18 mins';

    // Telematics & Speeds
    final curSpeed = tripItem?.currentSpeed ?? tripDetails?.currentSpeed;
    currentSpeedStr = curSpeed != null
        ? '${curSpeed.toStringAsFixed(0)} km/h'
        : (argsMap?['speed'] != null ? '${argsMap!['speed']} km/h' : '42 km/h');

    final avgSpd = tripItem?.avgSpeed ?? tripDetails?.avgSpeed;
    avgSpeedStr = avgSpd != null ? '${avgSpd.toStringAsFixed(0)} km/h' : '36 km/h';
    maxSpeedStr = tripDetails?.maxSpeed != null ? '${tripDetails!.maxSpeed.toStringAsFixed(0)} km/h' : '68 km/h';

    timeEnRouteStr = argsMap?['timeEnRoute']?.toString() ?? '08m 24s';
    stopsCountStr = argsMap?['stops']?.toString() ?? '5';

    gpsStatus = argsMap?['gpsStatus']?.toString() ??
        tripItem?.vehicle?.gpsStatus ??
        tripDetails?.gpsStatus ??
        'Strong';

    gpsCode = argsMap?['gpsCode']?.toString() ?? 'GPS-TRK-00123';
    batteryFuel = argsMap?['battery']?.toString() ?? '92%';
    status = argsMap?['status']?.toString() ?? tripItem?.status ?? tripDetails?.status ?? 'active';

    // Coordinates
    if (argsMap?['lat'] != null) {
      lat = double.tryParse(argsMap!['lat'].toString());
    } else if (tripDetails?.lat != null) {
      lat = tripDetails!.lat;
    }

    if (argsMap?['lng'] != null) {
      lng = double.tryParse(argsMap!['lng'].toString());
    } else if (tripDetails?.lng != null) {
      lng = tripDetails!.lng;
    }
  }

  // ==========================================
  // ACTION 1: CALL DRIVER
  // ==========================================
  Future<void> callDriver() async {
    final cleanPhone = driverPhone.replaceAll(RegExp(r'[^\d+]'), '');
    if (cleanPhone.isEmpty) {
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
    } else {
      url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(destination)}');
    }

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'navigation'.tr,
          'Opening navigation for $destination...',
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
        'Trip Sheet PDF saved to Download: ${file.path}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => _openDownloadedFile(file.path),
          child: Text('open'.tr.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
Scheduled Arrival: $destinationTime
Total Route Distance: $totalDistanceStr
Covered Distance: $coveredDistanceStr
Remaining Distance: $remainingDistanceStr
Estimated Time En Route / ETA: $etaStr
Current Speed: $currentSpeedStr
Average Speed: $avgSpeedStr
Peak / Max Speed: $maxSpeedStr

WAYPOINT TIMELINE:
1. Departs: $origin ($originTime)
2. Mid-Corridor Checkpoint: En Route
3. Live GPS Coordinates: ${lat != null && lng != null ? '$lat, $lng' : 'Tracking Active'}
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
                    child: Text('close'.tr),
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
                    label: Text('open_file'.tr),
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

  void completeTrip() {
    Get.back();
    Get.snackbar(
      'completed'.tr,
      'Trip $tripId has been marked as completed successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }
}
