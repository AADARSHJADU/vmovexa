import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/driver/report/model/incident_type_model.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/incident_submitted_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/incident_location_media_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/additional_information_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/review_incident_view.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/modules/roles/driver/home/controller/driver_home_controller.dart';
import 'driver_incidents_list_controller.dart';

class ReportIncidentController extends GetxController {
  DriverService get _driverService => DriverService.to;
  final ImagePicker _picker = ImagePicker();

  // ---------------- 4-Step Stepper (Aligned with Admin Panel) ----------------
  final RxInt currentStep = 1.obs; // 1=Incident Type, 2=GPS & Media, 3=Medical & Severity, 4=Review & Submit
  List<String> get stepLabels => [
    'driver_incident.step1_name'.tr,
    'driver_incident.step2_name'.tr,
    'driver_incident.step3_name'.tr,
    'driver_incident.step4_name'.tr,
  ];

  List<String> get stepSubtitles => [
    'driver_incident.step1_desc'.tr,
    'driver_incident.step2_desc'.tr,
    'driver_incident.step3_desc'.tr,
    'driver_incident.step4_desc'.tr,
  ];

  // ==========================================================
  // STEP 1 — Incident Category & Context
  // ==========================================================
  final Rx<IncidentType> selectedIncidentType = IncidentType.roadCondition.obs;
  void selectIncidentType(IncidentType type) => selectedIncidentType.value = type;

  final descriptionCtrl = TextEditingController();
  static const int descriptionMaxLen = 500;
  final RxInt descriptionLen = 0.obs;

  final RxString weatherConditions = 'Clear'.obs;
  final List<String> weatherOptions = [
    'Clear',
    'Heavy Rain',
    'Fog / Smog',
    'Night / Dark',
    'Storm / Wind',
  ];

  final RxString roadType = 'City Street'.obs;
  final List<String> roadTypeOptions = [
    'City Street',
    'Express Highway',
    'Flyover Bridge',
    'Bus Stop Bay',
    'Depot Junction',
  ];

  final Rx<DateTime> selectedDateTime = DateTime.now().obs;

  static const List<String> _monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get incidentDateText {
    final dt = selectedDateTime.value;
    return '${_monthNamesShort[dt.month - 1]} ${dt.day}, ${dt.year}';
  }

  String get incidentTimeText {
    final dt = selectedDateTime.value;
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  String get incidentDateTimeCombined => '$incidentDateText · $incidentTimeText';

  final RxnString incidentTypeError = RxnString();
  final RxnString descriptionError = RxnString();

  // ==========================================================
  // STEP 2 — GPS Location & Multi-Media Evidence
  // ==========================================================
  final searchPlacesCtrl = TextEditingController();
  final RxBool isSearchingPlaces = false.obs;
  final RxList<GooglePlaceItemModel> placesPredictions = <GooglePlaceItemModel>[].obs;
  final RxBool showPlacesDropdown = false.obs;
  Timer? _placesDebounceTimer;

  final MapController mapController = MapController();
  // Default coordinates centered on India (Central India: Nagpur / New Delhi default)
  final RxDouble currentLat = 20.5937.obs;
  final RxDouble currentLng = 78.9629.obs;
  final RxBool hasLocationPin = false.obs;
  final RxBool isDetectingGps = false.obs;
  final RxBool isReverseGeocoding = false.obs;

  final locationCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  final cityCtrl = TextEditingController();
  final stateCtrl = TextEditingController();
  final pincodeCtrl = TextEditingController();
  final landmarkCtrl = TextEditingController();
  String country = 'India';
  String placeId = '';

  final RxList<String> photoPaths = <String>[].obs; // local file paths
  static const int maxPhotos = 5;

  final RxList<String> videoPaths = <String>[].obs; // local video file paths
  static const int maxVideos = 3;

  void onSearchPlacesChanged(String query) {
    if (_placesDebounceTimer?.isActive ?? false) _placesDebounceTimer?.cancel();

    if (query.trim().length < 2) {
      placesPredictions.clear();
      showPlacesDropdown.value = false;
      isSearchingPlaces.value = false;
      return;
    }

    _placesDebounceTimer = Timer(const Duration(milliseconds: 350), () async {
      isSearchingPlaces.value = true;
      try {
        final res = await FleetService.to.searchGooglePlaces(query.trim());
        placesPredictions.clear();
        if (res.success && res.data != null) {
          placesPredictions.addAll(res.data!);
        }
        showPlacesDropdown.value = placesPredictions.isNotEmpty;
      } catch (_) {
        placesPredictions.clear();
        showPlacesDropdown.value = false;
      } finally {
        isSearchingPlaces.value = false;
      }
    });
  }

  void onSelectPlace(GooglePlaceItemModel place) {
    final lat = place.latitude ?? currentLat.value;
    final lng = place.longitude ?? currentLng.value;

    currentLat.value = lat;
    currentLng.value = lng;
    hasLocationPin.value = true;
    showPlacesDropdown.value = false;
    placesPredictions.clear();

    searchPlacesCtrl.text = place.name;
    final fullAddr = place.formattedAddress.isNotEmpty ? place.formattedAddress : place.name;
    addressCtrl.text = fullAddr;
    locationCtrl.text = fullAddr;
    if (place.city != null && place.city!.isNotEmpty) cityCtrl.text = place.city!;
    if (place.state != null && place.state!.isNotEmpty) stateCtrl.text = place.state!;
    if (place.pincode != null && place.pincode!.isNotEmpty) pincodeCtrl.text = place.pincode!;
    if (place.country != null && place.country!.isNotEmpty) country = place.country!;
    if (place.placeId != null && place.placeId!.isNotEmpty) placeId = place.placeId!;

    try {
      mapController.move(LatLng(lat, lng), 15.0);
    } catch (_) {}
  }

  Future<void> onAutoDetectGps() async {
    isDetectingGps.value = true;
    try {
      double targetLat = currentLat.value;
      double targetLng = currentLng.value;
      bool foundActiveGps = false;

      // 1. Try to get driver's current route location
      try {
        final active = await _driverService.getActiveRoute();
        if (active.success && active.data?.route?.stops.isNotEmpty == true) {
          final stops = active.data!.route!.stops;
          final idx = (active.data!.currentStopIndex < stops.length) ? active.data!.currentStopIndex : 0;
          if (stops[idx].lat != null && stops[idx].lng != null) {
            targetLat = stops[idx].lat!;
            targetLng = stops[idx].lng!;
            foundActiveGps = true;
          }
        }
      } catch (_) {}

      // Fallback coordinates if default India center
      if (!foundActiveGps && (targetLat == 20.5937 || targetLat == 0.0)) {
        targetLat = 19.0760; // Mumbai / Western corridor default
        targetLng = 72.8777;
      }

      await reverseGeocode(targetLat, targetLng);
      Get.snackbar(
        'gps_locked'.tr,
        'coordinates_resolved'.trParams({'lat': targetLat.toStringAsFixed(4), 'lng': targetLng.toStringAsFixed(4)}),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'gps_error'.tr,
        'could_not_acquire_gps'.trParams({'error': e.toString()}),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isDetectingGps.value = false;
    }
  }

  Future<void> reverseGeocode(double lat, double lng) async {
    currentLat.value = lat;
    currentLng.value = lng;
    hasLocationPin.value = true;
    isReverseGeocoding.value = true;

    try {
      final uri = Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng');
      final res = await http.get(uri, headers: {'User-Agent': 'VmovexaDOOHApp/1.0'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map<String, dynamic>) {
          final addressMap = data['address'] as Map<String, dynamic>?;
          final displayName = data['display_name']?.toString() ?? '';
          final city = addressMap?['city'] ?? addressMap?['town'] ?? addressMap?['village'] ?? addressMap?['county'] ?? '';
          final state = addressMap?['state'] ?? '';
          final postcode = addressMap?['postcode'] ?? '';

          if (displayName.isNotEmpty) {
            addressCtrl.text = displayName;
            searchPlacesCtrl.text = displayName;
            locationCtrl.text = displayName;
          }
          if (city.isNotEmpty) cityCtrl.text = city;
          if (state.isNotEmpty) stateCtrl.text = state;
          if (postcode.isNotEmpty) pincodeCtrl.text = postcode;
        }
      }
    } catch (_) {
      final fallback = 'GPS Location (${lat.toStringAsFixed(5)}, ${lng.toStringAsFixed(5)})';
      addressCtrl.text = fallback;
      locationCtrl.text = fallback;
      searchPlacesCtrl.text = fallback;
    } finally {
      isReverseGeocoding.value = false;
      try {
        mapController.move(LatLng(lat, lng), 15.0);
      } catch (_) {}
    }
  }

  void onMapTapped(LatLng point) {
    reverseGeocode(point.latitude, point.longitude);
  }

  Future<void> onUploadPhoto(BuildContext context) async {
    if (photoPaths.length >= maxPhotos) {
      Get.snackbar(
        'limit_reached'.tr,
        'max_photos_limit_msg'.trParams({'max': maxPhotos.toString()}),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('upload_incident_photo'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppTheme.gradientPink),
              title: Text('take_photo'.tr, style: const TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 80);
                if (file != null) {
                  photoPaths.add(file.path);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF3F7BF5)),
              title: Text('choose_from_gallery'.tr, style: const TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
                if (file != null) {
                  photoPaths.add(file.path);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void onRemovePhoto(int index) {
    if (index >= 0 && index < photoPaths.length) {
      photoPaths.removeAt(index);
    }
  }

  Future<void> onUploadVideo(BuildContext context) async {
    if (videoPaths.length >= maxVideos) {
      Get.snackbar(
        'limit_reached'.tr,
        'max_videos_limit_msg'.trParams({'max': maxVideos.toString()}),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('upload_video_recording'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.videocam_rounded, color: Color(0xFFE11D48)),
              title: Text('record_video'.tr, style: const TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickVideo(source: ImageSource.camera, maxDuration: const Duration(minutes: 2));
                if (file != null) {
                  videoPaths.add(file.path);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.video_library_rounded, color: AppTheme.gradientBlue),
              title: Text('choose_video_from_gallery'.tr, style: const TextStyle(color: Colors.white)),
              onTap: () async {
                Get.back();
                final file = await _picker.pickVideo(source: ImageSource.gallery, maxDuration: const Duration(minutes: 2));
                if (file != null) {
                  videoPaths.add(file.path);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void onRemoveVideo(int index) {
    if (index >= 0 && index < videoPaths.length) {
      videoPaths.removeAt(index);
    }
  }

  // ==========================================================
  // STEP 3 — Incident Severity, Medical & Emergency Details
  // ==========================================================
  final Rx<IncidentSeverity> severity = IncidentSeverity.low.obs;
  void setSeverity(IncidentSeverity value) => severity.value = value;

  // Medical & Casualties
  final RxInt deadCasualty = 0.obs;
  final RxInt injuredCount = 0.obs;
  final hospitalNameCtrl = TextEditingController();
  final RxBool ambulanceAssigned = false.obs;
  final ambulanceTimingCtrl = TextEditingController();

  // Police & Assistance
  final RxBool policeNotified = false.obs;
  final policeStationNameCtrl = TextEditingController();
  final RxBool towingRequested = false.obs;
  final RxString trafficDisruptionLevel = 'none'.obs;
  final List<String> trafficDisruptionOptions = [
    'none',
    'minor_delay',
    'lane_blocked',
    'total_gridlock',
  ];

  final RxSet<AffectedParty> affectedParties = <AffectedParty>{AffectedParty.driver}.obs;
  void toggleAffectedParty(AffectedParty party) {
    if (affectedParties.contains(party)) {
      affectedParties.remove(party);
    } else {
      affectedParties.add(party);
    }
  }

  final immediateActionCtrl = TextEditingController();
  final contactNumberCtrl = TextEditingController();

  // ==========================================================
  // STEP 4 — Review & Submission State
  // ==========================================================
  final RxBool isSubmitting = false.obs;
  final RxString incidentId = ''.obs;
  final Rxn<DateTime> submittedOnDateTime = Rxn<DateTime>();

  static const List<String> _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String get submittedOnText {
    final dt = submittedOnDateTime.value;
    if (dt == null) return '—';
    final month = _monthNames[dt.month - 1];
    final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$month ${dt.day}, ${dt.year} \u2022 ${hour12.toString().padLeft(2, '0')}:$minute $period';
  }

  String get affectedPartiesText =>
      affectedParties.isEmpty ? '—' : affectedParties.map((p) => p.label).join(', ');

  @override
  void onInit() {
    super.onInit();
    descriptionCtrl.addListener(() => descriptionLen.value = descriptionCtrl.text.length);
    _initDriverLocation();
  }

  Future<void> _initDriverLocation() async {
    try {
      final active = await _driverService.getActiveRoute();
      if (active.success && active.data?.route != null) {
        final r = active.data!.route!;
        final name = r.name ?? (r.stops.isNotEmpty ? '${r.stops.first.name ?? ""} ⇄ ${r.stops.last.name ?? ""}'.trim() : '');
        if (name.isNotEmpty) {
          locationCtrl.text = name;
          addressCtrl.text = name;
        }
        if (r.stops.isNotEmpty && r.stops.first.lat != null && r.stops.first.lng != null) {
          currentLat.value = r.stops.first.lat!;
          currentLng.value = r.stops.first.lng!;
          hasLocationPin.value = true;
        }
        return;
      }
      final sched = await _driverService.getTodaySchedule();
      if (sched.success && sched.data?.assignedRoute != null) {
        final r = sched.data!.assignedRoute!;
        final name = '${r.fromStop ?? ""} ⇄ ${r.toStop ?? ""}'.trim();
        if (name.isNotEmpty) {
          locationCtrl.text = name;
          addressCtrl.text = name;
        }
      }
    } catch (_) {}
  }

  @override
  void onClose() {
    _placesDebounceTimer?.cancel();
    // searchPlacesCtrl.dispose();
    // // descriptionCtrl.dispose();
    // locationCtrl.dispose();
    // addressCtrl.dispose();
    // cityCtrl.dispose();
    // stateCtrl.dispose();
    // pincodeCtrl.dispose();
    // landmarkCtrl.dispose();
    // hospitalNameCtrl.dispose();
    // ambulanceTimingCtrl.dispose();
    // policeStationNameCtrl.dispose();
    // immediateActionCtrl.dispose();
    // contactNumberCtrl.dispose();
    // mapController.dispose();
    super.onClose();
  }

  // ---------------- Validation & Navigation ----------------
  void onCancel() => Get.back();

  void onStep1NextPressed() {
    if (descriptionCtrl.text.trim().isEmpty) {
      descriptionError.value = 'please_describe_road_incident'.tr;
      Get.snackbar(
        'missing_information'.tr,
        'please_describe_road_incident'.tr,
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    descriptionError.value = null;
    currentStep.value = 2;
    Get.to(() => const IncidentLocationMediaView());
  }

  void onStep2BackPressed() {
    currentStep.value = 1;
    Get.back();
  }

  void onStep2NextPressed() {
    final effectiveLoc = addressCtrl.text.trim().isNotEmpty
        ? addressCtrl.text.trim()
        : locationCtrl.text.trim();

    if (effectiveLoc.isEmpty && !hasLocationPin.value) {
      Get.snackbar(
        'missing_location'.tr,
        'please_specify_location'.tr,
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    currentStep.value = 3;
    Get.to(() => const AdditionalInformationView());
  }

  void onStep3BackPressed() {
    currentStep.value = 2;
    Get.back();
  }

  void onStep3NextPressed() {
    currentStep.value = 4;
    Get.to(() => const ReviewIncidentView());
  }

  void onStep4BackPressed() {
    currentStep.value = 3;
    Get.back();
  }

  Future<void> onSubmitIncident() async {
    isSubmitting.value = true;
    try {
      // 1. Upload photos first
      List<String> uploadedPhotoUrls = [];
      for (final path in photoPaths) {
        if (File(path).existsSync()) {
          final upRes = await _driverService.uploadFile(filePath: path, purpose: 'incident_photo');
          if (upRes.success && upRes.data != null) {
            final url = upRes.data?['url']?.toString() ?? upRes.data?['file_url']?.toString() ?? upRes.data?['path']?.toString();
            if (url != null && url.isNotEmpty) {
              uploadedPhotoUrls.add(url);
            }
          }
        }
      }

      // 2. Upload videos
      List<String> uploadedVideoUrls = [];
      for (final path in videoPaths) {
        if (File(path).existsSync()) {
          final upRes = await _driverService.uploadFile(filePath: path, purpose: 'incident_video');
          if (upRes.success && upRes.data != null) {
            final url = upRes.data?['url']?.toString() ?? upRes.data?['file_url']?.toString() ?? upRes.data?['path']?.toString();
            if (url != null && url.isNotEmpty) {
              uploadedVideoUrls.add(url);
            }
          }
        }
      }

      // 3. Map canonical API values
      final String sev = severity.value.apiValue;
      final String incTypeName = selectedIncidentType.value.apiValue;
      final List<String> canonicalAffected = affectedParties.map((p) => p.apiValue).toList();
      final fullAddress = addressCtrl.text.trim().isNotEmpty
          ? addressCtrl.text.trim()
          : (locationCtrl.text.trim().isNotEmpty ? locationCtrl.text.trim() : (cityCtrl.text.isNotEmpty ? '${cityCtrl.text}, ${stateCtrl.text}'.trim() : 'Road Corridor'));

      // 4. Submit to API POST /me/driver/incidents
      final response = await _driverService.reportIncident(
        incidentType: incTypeName,
        title: incTypeName,
        description: descriptionCtrl.text.trim(),
        severity: sev,
        location: fullAddress,
        landmark: landmarkCtrl.text.trim(),
        latitude: hasLocationPin.value ? currentLat.value : null,
        longitude: hasLocationPin.value ? currentLng.value : null,
        photos: uploadedPhotoUrls,
        videos: uploadedVideoUrls,
        mediaUrls: uploadedPhotoUrls,
        affectedParties: canonicalAffected,
        immediateAction: immediateActionCtrl.text.trim(),
        contactPreference: 'Yes',
        contactNumber: contactNumberCtrl.text.trim(),
        deadCasualty: deadCasualty.value,
        injuredCount: injuredCount.value,
        hospitalName: hospitalNameCtrl.text.trim(),
        ambulanceAssigned: ambulanceAssigned.value,
        ambulanceTiming: ambulanceTimingCtrl.text.trim(),
        policeNotified: policeNotified.value,
        policeStationName: policeStationNameCtrl.text.trim(),
        towingRequested: towingRequested.value,
        weatherConditions: weatherConditions.value,
        roadType: roadType.value,
        trafficDisruptionLevel: trafficDisruptionLevel.value,
      );

      // Check if server rejected request
      if (!response.success) {
        final errMsg = response.message ?? response.error ?? 'submission_failed'.tr;
        debugPrint('❌ [ReportIncidentController] Server error: $errMsg');
        Get.snackbar(
          'submission_failed'.tr,
          errMsg,
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.redAccent,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 4),
        );
        return;
      }

      // If incident is breakdown / vehicle defect, also dispatch driver work order so NOC technician receives it immediately
      if (selectedIncidentType.value == IncidentType.breakdown ||
          selectedIncidentType.value == IncidentType.infrastructure) {
        try {
          await _driverService.reportDriverWorkOrder(
            description: '${descriptionCtrl.text.trim()}\nLocation: $fullAddress\nLandmark: ${landmarkCtrl.text.trim()}',
            issueCategory: incTypeName,
            priority: sev.toLowerCase() == 'critical' ? 'critical' : (sev.toLowerCase() == 'high' ? 'high' : 'normal'),
            attachmentUrls: [...uploadedPhotoUrls, ...uploadedVideoUrls],
          );
        } catch (_) {}
      }

      final now = DateTime.now();
      submittedOnDateTime.value = now;

      final DriverIncidentItem createdItem = response.data ?? DriverIncidentItem(
        id: 'INC-${now.millisecondsSinceEpoch}',
        ticketNumber: 'INC-${now.year}-${(now.millisecondsSinceEpoch % 100000).toString().padLeft(5, '0')}',
        title: incTypeName,
        incidentType: incTypeName,
        description: descriptionCtrl.text.trim(),
        severity: sev.toLowerCase(),
        status: 'open',
        reportedAt: now.toIso8601String(),
        locationName: fullAddress,
        landmark: landmarkCtrl.text.trim(),
        latitude: hasLocationPin.value ? currentLat.value : null,
        longitude: hasLocationPin.value ? currentLng.value : null,
        mediaUrls: uploadedPhotoUrls,
        videoUrls: uploadedVideoUrls,
        deadCasualty: deadCasualty.value,
        injuredCount: injuredCount.value,
        hospitalName: hospitalNameCtrl.text.trim(),
        policeStationName: policeStationNameCtrl.text.trim(),
        ambulanceAssigned: ambulanceAssigned.value,
        ambulanceTiming: ambulanceTimingCtrl.text.trim(),
        policeNotified: policeNotified.value,
        towingRequested: towingRequested.value,
        weatherConditions: weatherConditions.value,
        roadType: roadType.value,
        trafficDisruptionLevel: trafficDisruptionLevel.value,
        contactPreference: 'Yes',
        immediateAction: immediateActionCtrl.text.trim(),
        contactNumber: contactNumberCtrl.text.trim(),
        affectedParties: canonicalAffected,
      );

      incidentId.value = createdItem.ticketNumber ?? (createdItem.id ?? 'INC-${now.millisecondsSinceEpoch % 100000}');

      // Persist locally so it's immediately and permanently visible
      if (Get.isRegistered<StorageService>()) {
        await StorageService.to.saveLocalIncident(createdItem);
      }

      // Add to driver incidents list controller in-memory
      if (Get.isRegistered<DriverIncidentsListController>()) {
        Get.find<DriverIncidentsListController>().addLocalIncident(createdItem);
      }

      currentStep.value = 4;
      Get.off(() => const IncidentSubmittedView());
    } catch (e) {
      Get.snackbar(
        'submission_failed'.tr,
        'could_not_report_incident'.trParams({'error': e.toString()}),
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  // ---------------- Post-submit actions ----------------
  void onGoToHome() {
    resetWizard();
    if (Get.isRegistered<DriverHomeController>()) {
      Get.find<DriverHomeController>().fetchDashboardData();
    }
    Get.offAllNamed(Routes.DRIVER_DASHBOARD, arguments: {'tab': 0});
  }

  void onViewIncidentsList() {
    resetWizard();
    if (Get.isRegistered<DriverIncidentsListController>()) {
      Get.find<DriverIncidentsListController>().fetchIncidents();
    }
    Get.offAllNamed(Routes.DRIVER_DASHBOARD, arguments: {'tab': 3});
  }

  void onShareReport() {
    Get.snackbar(
      'share_report'.tr,
      'ticket_number_copied'.trParams({'ticket': incidentId.value}),
      backgroundColor: const Color(0xFF15151F),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void resetWizard() {
    currentStep.value = 1;
    selectedIncidentType.value = IncidentType.roadCondition;
    descriptionCtrl.clear();
    locationCtrl.clear();
    addressCtrl.clear();
    cityCtrl.clear();
    stateCtrl.clear();
    pincodeCtrl.clear();
    landmarkCtrl.clear();
    searchPlacesCtrl.clear();
    placesPredictions.clear();
    showPlacesDropdown.value = false;
    weatherConditions.value = 'Clear';
    roadType.value = 'City Street';
    selectedDateTime.value = DateTime.now();
    photoPaths.clear();
    videoPaths.clear();
    severity.value = IncidentSeverity.low;
    deadCasualty.value = 0;
    injuredCount.value = 0;
    hospitalNameCtrl.clear();
    ambulanceAssigned.value = false;
    ambulanceTimingCtrl.clear();
    policeNotified.value = false;
    policeStationNameCtrl.clear();
    towingRequested.value = false;
    trafficDisruptionLevel.value = 'none';
    affectedParties.clear();
    affectedParties.add(AffectedParty.driver);
    immediateActionCtrl.clear();
    contactNumberCtrl.clear();
    incidentId.value = '';
    submittedOnDateTime.value = null;
    incidentTypeError.value = null;
    descriptionError.value = null;
    _initDriverLocation();
  }
}
