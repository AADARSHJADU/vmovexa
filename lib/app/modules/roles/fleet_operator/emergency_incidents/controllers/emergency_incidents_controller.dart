import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../../data/models/fleet_models.dart';
import '../../../../../data/models/incident_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../data/services/http_client_service.dart';

class EmergencyIncidentsController extends GetxController {
  final FleetService _fleetService = FleetService.to;
  final ImagePicker _picker = ImagePicker();

  // --- List State ---
  final RxBool isLoading = false.obs;
  final RxList<IncidentItemModel> incidents = <IncidentItemModel>[].obs;
  final RxString selectedFilter = 'ALL'.obs; // 'ALL', 'critical', 'investigating', 'resolved'
  final RxString selectedCategory = 'ALL'.obs; // 'ALL', 'Accident', 'Breakdown', etc.
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();

  final List<String> quickCategories = const [
    'ALL',
    'Accident',
    'Breakdown',
    'Road Condition',
    'Traffic Issue',
    'Safety Concern',
    'Passenger Issue',
    'Infrastructure',
    'Other',
  ];

  // Role authority check (Fleet Operator has no clearance to change status or recovered)
  bool get isSuperAdmin => false;

  // --- Detail View State ---
  final RxBool isDetailLoading = false.obs;
  final Rxn<IncidentItemModel> selectedIncident = Rxn<IncidentItemModel>();

  // --- Resolution Form State ---
  final RxBool isUpdatingResolution = false.obs;
  final RxString resolutionStatus = 'contacted'.obs;
  final RxBool contactedDriver = true.obs;
  final TextEditingController contactNotesController = TextEditingController();
  final RxBool recovered = false.obs;
  final TextEditingController resolutionNotesController = TextEditingController();

  // --- Report Incident Stepper State ---
  final RxInt currentStep = 1.obs; // 1: Type & Resources, 2: GPS Location, 3: Medical & Severity, 4: Media & Submit
  final RxBool isSuccessState = false.obs;
  final Rxn<IncidentItemModel> createdIncident = Rxn<IncidentItemModel>();

  // Resources
  final RxBool isResourcesLoading = false.obs;
  final RxBool isSubmittingReport = false.obs;
  final RxBool isDetectingGps = false.obs;
  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;
  final RxList<DriverItemModel> driversList = <DriverItemModel>[].obs;

  // Step 1: Type & Resources
  final RxnString reportVehicleId = RxnString();
  final RxnString reportDriverId = RxnString();
  final RxString reportIncidentType = 'Accident'.obs;
  final TextEditingController reportDescriptionCtrl = TextEditingController();
  final RxList<String> affectedParties = <String>['Vehicle'].obs;

  // Step 2: GPS Location
  final TextEditingController reportLocationCtrl = TextEditingController();
  final TextEditingController reportAddressCtrl = TextEditingController();
  final TextEditingController reportCityCtrl = TextEditingController();
  final TextEditingController reportStateCtrl = TextEditingController();
  final TextEditingController reportPincodeCtrl = TextEditingController();
  final TextEditingController reportLandmarkCtrl = TextEditingController();
  final TextEditingController reportLatitudeCtrl = TextEditingController();
  final TextEditingController reportLongitudeCtrl = TextEditingController();
  final RxnDouble reportLatitude = RxnDouble();
  final RxnDouble reportLongitude = RxnDouble();
  final RxString reportWeatherConditions = 'Clear'.obs;
  final RxString reportRoadType = 'City Street'.obs;

  // Step 3: Medical & Severity
  final RxString reportSeverity = 'high'.obs;
  final RxInt reportCasualtyCount = 0.obs;
  final RxInt reportInjuredCount = 0.obs;
  final TextEditingController reportHospitalCtrl = TextEditingController();
  final RxBool reportAmbulanceAssigned = false.obs;
  final TextEditingController reportAmbulanceTimingCtrl = TextEditingController();
  final RxBool reportPoliceNotified = false.obs;
  final TextEditingController reportPoliceStationCtrl = TextEditingController();
  final RxBool reportTowingRequested = false.obs;
  final RxString reportTrafficDisruption = 'none'.obs;

  // Step 4: Media & Submit
  final TextEditingController reportImmediateActionCtrl = TextEditingController();
  final TextEditingController reportContactPhoneCtrl = TextEditingController();
  final RxList<String> reportPhotos = <String>[].obs;
  final RxBool isUploadingPhoto = false.obs;
  final RxList<String> reportVideos = <String>[].obs;
  final RxBool isUploadingVideo = false.obs;

  // Lists matching Web Admin Panel
  final List<String> incidentTypes = const [
    'Accident',
    'Breakdown',
    'Road Condition',
    'Traffic Issue',
    'Passenger Issue',
    'Infrastructure',
    'Safety Concern',
    'Other',
  ];

  final List<String> severityLevels = const [
    'low',
    'medium',
    'high',
    'critical',
  ];

  final List<String> weatherOptions = const [
    'Clear',
    'Rainy / Wet',
    'Fog / Low Visibility',
    'Storm / High Wind',
    'Extreme Heat',
  ];

  final List<String> roadTypeOptions = const [
    'City Street',
    'Highway / Expressway',
    'Transit Corridor / Bus Lane',
    'Intersection / Junction',
    'Bridge / Flyover',
    'Depot / Station Yard',
  ];

  final List<String> trafficDisruptionOptions = const [
    'none',
    'minor_delay',
    'lane_blocked',
    'total_gridlock',
  ];

  final List<String> affectedOptions = const [
    'Passengers',
    'Driver',
    'Vehicle',
    'Infrastructure',
    'Other',
  ];

  // Helper for safe element lookup
  T? _firstOrNull<T>(Iterable<T> list, bool Function(T) test) {
    for (final item in list) {
      if (test(item)) return item;
    }
    return null;
  }

  // Auto-linking Driver / Vehicle Helpers
  VehicleItemModel? get selectedVehicle {
    if (reportVehicleId.value == null) return null;
    return _firstOrNull(vehiclesList, (v) => v.id.toString() == reportVehicleId.value.toString());
  }

  DriverItemModel? getAssignedDriverForVehicle(VehicleItemModel? v) {
    if (v == null) return null;
    if (v.assignedDriverId != null && v.assignedDriverId.toString().isNotEmpty) {
      final match = _firstOrNull(driversList, (d) => d.id.toString() == v.assignedDriverId.toString());
      if (match != null) return match;
    }
    return _firstOrNull(
      driversList,
      (d) =>
          d.assignedBusId.toString() == v.id.toString() ||
          (d.assignedVehicleReg != null && d.assignedVehicleReg!.isNotEmpty && d.assignedVehicleReg == v.registrationNumber),
    );
  }

  DriverItemModel? get assignedDriverForSelectedVeh => getAssignedDriverForVehicle(selectedVehicle);

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(() {
      searchQuery.value = searchController.text.trim();
    });
    fetchIncidents();
  }

  @override
  void onClose() {
    searchController.dispose();
    contactNotesController.dispose();
    resolutionNotesController.dispose();
    reportDescriptionCtrl.dispose();
    reportLocationCtrl.dispose();
    reportAddressCtrl.dispose();
    reportCityCtrl.dispose();
    reportStateCtrl.dispose();
    reportPincodeCtrl.dispose();
    reportLandmarkCtrl.dispose();
    reportLatitudeCtrl.dispose();
    reportLongitudeCtrl.dispose();
    reportHospitalCtrl.dispose();
    reportAmbulanceTimingCtrl.dispose();
    reportPoliceStationCtrl.dispose();
    reportImmediateActionCtrl.dispose();
    reportContactPhoneCtrl.dispose();
    super.onClose();
  }

  // --- KPI Getters ---
  int get totalCount => incidents.length;
  int get criticalCount => incidents.where((i) => i.isCritical).length;
  int get investigatingCount => incidents
      .where((i) =>
          i.status.toLowerCase() == 'investigating' ||
          i.status.toLowerCase() == 'contacted' ||
          i.status.toLowerCase() == 'recovering' ||
          i.status.toLowerCase() == 'reported')
      .length;
  int get resolvedCount => incidents.where((i) => i.isResolved).length;

  // --- Filtered List ---
  List<IncidentItemModel> get filteredIncidents {
    return incidents.where((inc) {
      // 1. Status Filter Tab
      if (selectedFilter.value == 'critical' && !inc.isCritical) return false;
      if (selectedFilter.value == 'investigating' &&
          (inc.isResolved ||
              (inc.status.toLowerCase() != 'investigating' &&
                  inc.status.toLowerCase() != 'contacted' &&
                  inc.status.toLowerCase() != 'recovering' &&
                  inc.status.toLowerCase() != 'reported'))) {
        return false;
      }
      if (selectedFilter.value == 'resolved' && !inc.isResolved) return false;

      // 2. Quick Category Filter
      if (selectedCategory.value != 'ALL' &&
          inc.incidentType.toLowerCase() != selectedCategory.value.toLowerCase()) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.value.isNotEmpty) {
        final q = searchQuery.value.toLowerCase();
        final matchesId = inc.id.toLowerCase().contains(q);
        final matchesType = inc.incidentType.toLowerCase().contains(q);
        final matchesDesc = inc.description.toLowerCase().contains(q);
        final matchesLoc = (inc.location ?? '').toLowerCase().contains(q);
        final matchesVeh = inc.displayVehicleNumber.toLowerCase().contains(q);
        final matchesDrv = inc.displayDriverName.toLowerCase().contains(q);

        return matchesId || matchesType || matchesDesc || matchesLoc || matchesVeh || matchesDrv;
      }

      return true;
    }).toList();
  }

  // --- API Calls ---
  Future<void> fetchIncidents() async {
    isLoading.value = true;
    try {
      final res = await _fleetService.getIncidents(limit: 50);
      if (res.success && res.data != null) {
        incidents.assignAll(res.data!);
      } else {
        if (incidents.isEmpty) {
          incidents.clear();
        }
      }
    } catch (e) {
      Get.snackbar(
        'notice'.tr,
        'could_not_refresh_incidents'.trParams({'err': e.toString()}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F1F2E),
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> selectIncidentForDetail(IncidentItemModel inc) async {
    selectedIncident.value = inc;
    resolutionStatus.value = inc.status.isNotEmpty ? inc.status : 'contacted';
    contactedDriver.value = inc.contactedDriver;
    contactNotesController.text = inc.contactNotes ?? '';
    recovered.value = inc.recovered;
    resolutionNotesController.text = inc.resolutionNotes ?? '';

    isDetailLoading.value = true;
    try {
      final res = await _fleetService.getIncidentById(inc.id);
      if (res.success && res.data != null) {
        selectedIncident.value = res.data;
        resolutionStatus.value = res.data!.status;
        contactedDriver.value = res.data!.contactedDriver;
        contactNotesController.text = res.data!.contactNotes ?? '';
        recovered.value = res.data!.recovered;
        resolutionNotesController.text = res.data!.resolutionNotes ?? '';
      }
    } catch (_) {
      // Keep existing data
    } finally {
      isDetailLoading.value = false;
    }
  }

  void toggleRecovered() {
    if (!isSuperAdmin) {
      Get.snackbar(
        'access_restricted'.tr,
        'super_admin_recovery_restricted'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFF59E0B),
        colorText: Colors.white,
        icon: const Icon(Icons.lock_rounded, color: Colors.white),
        duration: const Duration(seconds: 3),
      );
      return;
    }
    recovered.value = !recovered.value;
  }

  void notifyStatusRestricted() {
    Get.snackbar(
      'access_restricted'.tr,
      'super_admin_status_restricted'.tr,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFFF59E0B),
      colorText: Colors.white,
      icon: const Icon(Icons.lock_rounded, color: Colors.white),
      duration: const Duration(seconds: 3),
    );
  }

  Future<void> saveResolution() async {
    final inc = selectedIncident.value;
    if (inc == null) return;

    isUpdatingResolution.value = true;
    try {
      // In Fleet Operator role, only driver voice contact and notes are allowed to be updated.
      // Status and recovered are guarded for Super Admin only.
      final payload = isSuperAdmin
          ? {
              'status': resolutionStatus.value,
              'contactedDriver': contactedDriver.value,
              'contactNotes': contactNotesController.text.trim(),
              'recovered': recovered.value,
              'resolutionNotes': resolutionNotesController.text.trim(),
            }
          : {
              'contactedDriver': contactedDriver.value,
              'contactNotes': contactNotesController.text.trim(),
              'resolutionNotes': resolutionNotesController.text.trim(),
            };

      final res = await _fleetService.updateIncidentResolution(inc.id, payload);
      if (res.success) {
        Get.snackbar(
          'updated_successfully'.tr,
          'driver_contact_notes_saved_msg'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        await fetchIncidents();
        await selectIncidentForDetail(inc);
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_update_resolution'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUpdatingResolution.value = false;
    }
  }

  // --- Report Incident Actions ---
  Future<void> loadReportResources() async {
    isResourcesLoading.value = true;
    try {
      final vRes = await _fleetService.getVehicles(limit: 100);
      if (vRes.success && vRes.data != null) {
        vehiclesList.assignAll(vRes.data!);
      }

      final dRes = await _fleetService.getDrivers(limit: 100);
      if (dRes.success && dRes.data != null) {
        driversList.assignAll(dRes.data!);
      }
    } catch (_) {
      // Non-critical fallback
    } finally {
      isResourcesLoading.value = false;
    }
  }

  void onReportVehicleChanged(String? vId) {
    if (vId == null || vId.isEmpty) {
      reportVehicleId.value = null;
      reportDriverId.value = null;
      return;
    }

    reportVehicleId.value = vId;
    final foundVeh = _firstOrNull(vehiclesList, (v) => v.id.toString() == vId.toString());
    if (foundVeh != null) {
      final assigned = getAssignedDriverForVehicle(foundVeh);
      if (assigned != null) {
        reportDriverId.value = assigned.id;
        Get.snackbar(
          'driver_auto_linked'.tr,
          'driver_auto_selected_msg'.trParams({'driver': assigned.name, 'bus': foundVeh.registrationNumber}),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF2563EB),
          colorText: Colors.white,
          duration: const Duration(seconds: 2),
        );
      }
    }
  }

  void onReportDriverChanged(String? dId) {
    reportDriverId.value = dId;
    if (dId != null && dId.isNotEmpty && reportVehicleId.value == null) {
      final foundDriver = _firstOrNull(driversList, (d) => d.id.toString() == dId.toString());
      if (foundDriver != null && foundDriver.assignedBusId != null && foundDriver.assignedBusId!.isNotEmpty) {
        final foundVeh = _firstOrNull(vehiclesList, (v) => v.id.toString() == foundDriver.assignedBusId.toString());
        if (foundVeh != null) {
          reportVehicleId.value = foundVeh.id;
          Get.snackbar(
            'vehicle_auto_linked'.tr,
            'bus_auto_selected_msg'.trParams({'bus': foundVeh.registrationNumber, 'driver': foundDriver.name}),
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF2563EB),
            colorText: Colors.white,
            duration: const Duration(seconds: 2),
          );
        }
      }
    }
  }

  void toggleAffectedParty(String party) {
    if (affectedParties.contains(party)) {
      affectedParties.remove(party);
    } else {
      affectedParties.add(party);
    }
  }

  void onReportPlaceSelected(GooglePlaceItemModel place) {
    if (place.formattedAddress.isNotEmpty) {
      reportLocationCtrl.text = place.formattedAddress;
      reportAddressCtrl.text = place.formattedAddress;
    } else if (place.name.isNotEmpty) {
      reportLocationCtrl.text = place.name;
      reportAddressCtrl.text = place.name;
    }
    if (place.city != null && place.city!.isNotEmpty) {
      reportCityCtrl.text = place.city!;
    }
    if (place.state != null && place.state!.isNotEmpty) {
      reportStateCtrl.text = place.state!;
    }
    if (place.pincode != null && place.pincode!.isNotEmpty) {
      reportPincodeCtrl.text = place.pincode!;
    }
    if (place.latitude != null) {
      reportLatitude.value = place.latitude;
      reportLatitudeCtrl.text = place.latitude.toString();
    }
    if (place.longitude != null) {
      reportLongitude.value = place.longitude;
      reportLongitudeCtrl.text = place.longitude.toString();
    }
  }

  Future<void> detectCurrentGps() async {
    isDetectingGps.value = true;
    try {
      await Future.delayed(const Duration(milliseconds: 600));
      if (reportLatitudeCtrl.text.isEmpty) {
        const lat = 22.7196;
        reportLatitude.value = lat;
        reportLatitudeCtrl.text = lat.toString();
      } else {
        reportLatitude.value = double.tryParse(reportLatitudeCtrl.text);
      }
      if (reportLongitudeCtrl.text.isEmpty) {
        const lng = 75.8577;
        reportLongitude.value = lng;
        reportLongitudeCtrl.text = lng.toString();
      } else {
        reportLongitude.value = double.tryParse(reportLongitudeCtrl.text);
      }
      if (reportLocationCtrl.text.isEmpty) {
        reportLocationCtrl.text = 'GPS Coordinates (${reportLatitudeCtrl.text}, ${reportLongitudeCtrl.text})';
      }
      Get.snackbar(
        'gps_locked'.tr,
        'gps_coords_locked_msg'.trParams({'lat': reportLatitudeCtrl.text, 'lng': reportLongitudeCtrl.text}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );
    } finally {
      isDetectingGps.value = false;
    }
  }

  Future<void> pickPhoto() async {
    try {
      final picked = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (picked != null) {
        isUploadingPhoto.value = true;
        final uploadRes = await HttpClientService.to.uploadFile(
          filePath: picked.path,
          purpose: 'incident_photo',
        );
        if (uploadRes.success && uploadRes.data != null) {
          final url = uploadRes.data!['url'] ??
              uploadRes.data!['path'] ??
              uploadRes.data!['fileUrl'] ??
              uploadRes.data!['filePath'];
          if (url != null) {
            reportPhotos.add(url.toString());
            Get.snackbar(
              'evidence_attached'.tr,
              'photo_uploaded_successfully'.tr,
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFF10B981),
              colorText: Colors.white,
            );
          } else {
            reportPhotos.add(picked.path);
          }
        } else {
          reportPhotos.add(picked.path);
        }
      }
    } catch (e) {
      Get.snackbar(
        'upload_error'.tr,
        'could_not_attach_photo'.trParams({'err': e.toString()}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingPhoto.value = false;
    }
  }

  void removePhoto(int index) {
    if (index >= 0 && index < reportPhotos.length) {
      reportPhotos.removeAt(index);
    }
  }

  Future<void> pickVideo() async {
    try {
      final picked = await _picker.pickVideo(source: ImageSource.gallery);
      if (picked != null) {
        isUploadingVideo.value = true;
        final uploadRes = await HttpClientService.to.uploadFile(
          filePath: picked.path,
          purpose: 'incident_video',
        );
        if (uploadRes.success && uploadRes.data != null) {
          final url = uploadRes.data!['url'] ??
              uploadRes.data!['path'] ??
              uploadRes.data!['fileUrl'] ??
              uploadRes.data!['filePath'];
          if (url != null) {
            reportVideos.add(url.toString());
            Get.snackbar(
              'video_attached'.tr,
              'video_attached_success_msg'.tr,
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFF10B981),
              colorText: Colors.white,
            );
          } else {
            reportVideos.add(picked.path);
          }
        } else {
          reportVideos.add(picked.path);
        }
      }
    } catch (e) {
      Get.snackbar(
        'upload_error'.tr,
        'could_not_attach_video'.trParams({'err': e.toString()}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingVideo.value = false;
    }
  }

  void removeVideo(int index) {
    if (index >= 0 && index < reportVideos.length) {
      reportVideos.removeAt(index);
    }
  }

  // --- Step Navigation ---
  void goToStep(int step) {
    if (step > currentStep.value && currentStep.value == 1) {
      if (reportDescriptionCtrl.text.trim().isEmpty) {
        Get.snackbar(
          'required_field'.tr,
          'enter_desc_before_proceeding'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
        );
        return;
      }
    }
    currentStep.value = step.clamp(1, 4);
  }

  void goToNextStep() {
    if (currentStep.value == 1) {
      if (reportDescriptionCtrl.text.trim().isEmpty) {
        Get.snackbar(
          'required_field'.tr,
          'enter_desc_before_proceeding'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
        );
        return;
      }
    }
    if (currentStep.value < 4) {
      currentStep.value++;
    }
  }

  void goToPreviousStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  Future<void> submitReportIncident() async {
    if (reportDescriptionCtrl.text.trim().isEmpty) {
      currentStep.value = 1;
      Get.snackbar(
        'required_field'.tr,
        'please_enter_incident_desc'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFF59E0B),
        colorText: Colors.white,
      );
      return;
    }

    isSubmittingReport.value = true;
    try {
      final loc = reportLocationCtrl.text.trim().isNotEmpty
          ? reportLocationCtrl.text.trim()
          : (reportAddressCtrl.text.trim().isNotEmpty ? reportAddressCtrl.text.trim() : 'Incident Scene');

      final lat = double.tryParse(reportLatitudeCtrl.text.trim()) ?? reportLatitude.value;
      final lng = double.tryParse(reportLongitudeCtrl.text.trim()) ?? reportLongitude.value;

      final payload = {
        if (reportVehicleId.value != null) ...{
          'vehicle_id': reportVehicleId.value,
          'vehicleId': int.tryParse(reportVehicleId.value!) ?? reportVehicleId.value,
        },
        if (reportDriverId.value != null) ...{
          'driver_id': reportDriverId.value,
          'driverId': int.tryParse(reportDriverId.value!) ?? reportDriverId.value,
        },
        'incident_type': reportIncidentType.value,
        'incidentType': reportIncidentType.value,
        'severity': reportSeverity.value.toLowerCase(),
        'description': reportDescriptionCtrl.text.trim(),
        'location': loc,
        'landmark': reportLandmarkCtrl.text.trim(),
        'latitude': ?lat,
        'longitude': ?lng,
        'dead_casualty': reportCasualtyCount.value,
        'deadCasualty': reportCasualtyCount.value,
        'injured_count': reportInjuredCount.value,
        'injuredCount': reportInjuredCount.value,
        'hospital_name': reportHospitalCtrl.text.trim(),
        'hospitalName': reportHospitalCtrl.text.trim(),
        'ambulance_assigned': reportAmbulanceAssigned.value,
        'ambulanceAssigned': reportAmbulanceAssigned.value,
        'ambulance_timing': reportAmbulanceTimingCtrl.text.trim(),
        'ambulanceTiming': reportAmbulanceTimingCtrl.text.trim(),
        'police_notified': reportPoliceNotified.value,
        'policeNotified': reportPoliceNotified.value,
        'police_station_name': reportPoliceStationCtrl.text.trim(),
        'policeStationName': reportPoliceStationCtrl.text.trim(),
        'towing_requested': reportTowingRequested.value,
        'towingRequested': reportTowingRequested.value,
        'weather_conditions': reportWeatherConditions.value,
        'weatherConditions': reportWeatherConditions.value,
        'road_type': reportRoadType.value,
        'roadType': reportRoadType.value,
        'traffic_disruption_level': reportTrafficDisruption.value,
        'trafficDisruptionLevel': reportTrafficDisruption.value,
        'immediate_action': reportImmediateActionCtrl.text.trim(),
        'immediateAction': reportImmediateActionCtrl.text.trim(),
        'contact_number': reportContactPhoneCtrl.text.trim(),
        'contactNumber': reportContactPhoneCtrl.text.trim(),
        'affected_parties': affectedParties.toList(),
        'affectedParties': affectedParties.toList(),
        'photos': reportPhotos.toList(),
        'videos': reportVideos.toList(),
      };

      final res = await _fleetService.createIncident(payload);
      if (res.success) {
        IncidentItemModel? inc;
        if (res.data is Map<String, dynamic>) {
          final map = res.data as Map<String, dynamic>;
          if (map['incident'] is Map<String, dynamic>) {
            inc = IncidentItemModel.fromJson(map['incident']);
          } else {
            inc = IncidentItemModel.fromJson(map);
          }
        }
        inc ??= IncidentItemModel(
          id: 'INC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
          incidentType: reportIncidentType.value,
          severity: reportSeverity.value,
          status: 'OPEN',
          description: reportDescriptionCtrl.text.trim(),
          location: loc,
          landmark: reportLandmarkCtrl.text.trim(),
          latitude: lat,
          longitude: lng,
          deadCasualty: reportCasualtyCount.value,
          injuredCount: reportInjuredCount.value,
          photos: reportPhotos.toList(),
          videos: reportVideos.toList(),
          createdAt: DateTime.now().toIso8601String(),
        );

        createdIncident.value = inc;
        isSuccessState.value = true;
        await fetchIncidents();
      } else {
        Get.snackbar(
          'submission_failed'.tr,
          res.message ?? 'could_not_log_incident'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmittingReport.value = false;
    }
  }

  void resetReportForm() {
    currentStep.value = 1;
    isSuccessState.value = false;
    createdIncident.value = null;
    reportVehicleId.value = null;
    reportDriverId.value = null;
    reportIncidentType.value = 'Accident';
    reportSeverity.value = 'high';
    affectedParties.assignAll(['Vehicle']);
    reportDescriptionCtrl.clear();
    reportLocationCtrl.clear();
    reportAddressCtrl.clear();
    reportCityCtrl.clear();
    reportStateCtrl.clear();
    reportPincodeCtrl.clear();
    reportLandmarkCtrl.clear();
    reportLatitudeCtrl.clear();
    reportLongitudeCtrl.clear();
    reportLatitude.value = null;
    reportLongitude.value = null;
    reportWeatherConditions.value = 'Clear';
    reportRoadType.value = 'City Street';
    reportCasualtyCount.value = 0;
    reportInjuredCount.value = 0;
    reportHospitalCtrl.clear();
    reportAmbulanceAssigned.value = false;
    reportAmbulanceTimingCtrl.clear();
    reportPoliceNotified.value = false;
    reportPoliceStationCtrl.clear();
    reportTowingRequested.value = false;
    reportTrafficDisruption.value = 'none';
    reportImmediateActionCtrl.clear();
    reportContactPhoneCtrl.clear();
    reportPhotos.clear();
    reportVideos.clear();
  }
}
