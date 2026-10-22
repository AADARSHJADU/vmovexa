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
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();

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

  // --- Report Incident Form State ---
  final RxBool isResourcesLoading = false.obs;
  final RxBool isSubmittingReport = false.obs;
  final RxList<VehicleItemModel> vehiclesList = <VehicleItemModel>[].obs;
  final RxList<DriverItemModel> driversList = <DriverItemModel>[].obs;

  final RxnString reportVehicleId = RxnString();
  final RxnString reportDriverId = RxnString();
  final RxString reportIncidentType = 'Accident'.obs;
  final RxString reportSeverity = 'high'.obs;
  final TextEditingController reportDescriptionCtrl = TextEditingController();
  final TextEditingController reportLocationCtrl = TextEditingController();
  final TextEditingController reportLandmarkCtrl = TextEditingController();
  final RxnDouble reportLatitude = RxnDouble();
  final RxnDouble reportLongitude = RxnDouble();
  final RxInt reportCasualtyCount = 0.obs;
  final RxInt reportInjuredCount = 0.obs;
  final TextEditingController reportHospitalCtrl = TextEditingController();
  final RxBool reportAmbulanceAssigned = false.obs;
  final RxBool reportPoliceNotified = false.obs;
  final TextEditingController reportPoliceStationCtrl = TextEditingController();
  final RxBool reportTowingRequested = false.obs;
  final RxString reportTrafficDisruption = 'none'.obs;
  final TextEditingController reportImmediateActionCtrl = TextEditingController();
  final RxList<String> reportPhotos = <String>[].obs;
  final RxBool isUploadingPhoto = false.obs;

  // Types list matching Admin Panel
  final List<String> incidentTypes = const [
    'Accident',
    'Mechanical Breakdown',
    'Medical Emergency',
    'Route Obstruction',
    'Passenger Incident',
    'Theft / Vandalism',
    'Weather Disruption',
    'Other',
  ];

  final List<String> severityLevels = const [
    'low',
    'medium',
    'high',
    'critical',
  ];

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
    reportLandmarkCtrl.dispose();
    reportHospitalCtrl.dispose();
    reportPoliceStationCtrl.dispose();
    reportImmediateActionCtrl.dispose();
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
      // 1. Tab Filter
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

      // 2. Search Query Filter
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
        // Fallback: If empty, show helpful state
        if (incidents.isEmpty) {
          incidents.clear();
        }
      }
    } catch (e) {
      Get.snackbar(
        'Notice',
        'Could not refresh incidents: ${e.toString()}',
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

    // Fetch fresh details from backend
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

  Future<void> saveResolution() async {
    final inc = selectedIncident.value;
    if (inc == null) return;

    isUpdatingResolution.value = true;
    try {
      final payload = {
        'status': resolutionStatus.value,
        'contactedDriver': contactedDriver.value,
        'contactNotes': contactNotesController.text.trim(),
        'recovered': recovered.value,
        'resolutionNotes': resolutionNotesController.text.trim(),
      };

      final res = await _fleetService.updateIncidentResolution(inc.id, payload);
      if (res.success) {
        Get.snackbar(
          'Updated Successfully',
          'Incident resolution & driver contact recorded.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        await fetchIncidents();
        // Refresh currently viewed incident
        await selectIncidentForDetail(inc);
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Failed to update resolution.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
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
              'Evidence Attached',
              'Photo uploaded successfully.',
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: const Color(0xFF10B981),
              colorText: Colors.white,
            );
          }
        } else {
          // If local mock / offline, keep local path
          reportPhotos.add(picked.path);
        }
      }
    } catch (e) {
      Get.snackbar(
        'Upload Error',
        'Could not attach photo: $e',
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

  Future<void> submitReportIncident() async {
    if (reportDescriptionCtrl.text.trim().isEmpty) {
      Get.snackbar(
        'Required Field',
        'Please enter an incident description.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFF59E0B),
        colorText: Colors.white,
      );
      return;
    }

    isSubmittingReport.value = true;
    try {
      final payload = {
        if (reportVehicleId.value != null) 'vehicle_id': reportVehicleId.value,
        if (reportDriverId.value != null) 'driver_id': reportDriverId.value,
        'incident_type': reportIncidentType.value,
        'severity': reportSeverity.value,
        'description': reportDescriptionCtrl.text.trim(),
        'location': reportLocationCtrl.text.trim(),
        'landmark': reportLandmarkCtrl.text.trim(),
        if (reportLatitude.value != null) 'latitude': reportLatitude.value,
        if (reportLongitude.value != null) 'longitude': reportLongitude.value,
        'dead_casualty': reportCasualtyCount.value,
        'injured_count': reportInjuredCount.value,
        'hospital_name': reportHospitalCtrl.text.trim(),
        'ambulance_assigned': reportAmbulanceAssigned.value,
        'police_notified': reportPoliceNotified.value,
        'police_station_name': reportPoliceStationCtrl.text.trim(),
        'towing_requested': reportTowingRequested.value,
        'traffic_disruption_level': reportTrafficDisruption.value,
        'immediate_action': reportImmediateActionCtrl.text.trim(),
        'photos': reportPhotos.toList(),
      };

      final res = await _fleetService.createIncident(payload);
      if (res.success) {
        Get.back(); // Close Report Screen
        Get.snackbar(
          'Incident Logged',
          'Emergency SOS incident recorded & broadcasted.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        resetReportForm();
        await fetchIncidents();
      } else {
        Get.snackbar(
          'Submission Failed',
          res.message ?? 'Could not log incident.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
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
    reportVehicleId.value = null;
    reportDriverId.value = null;
    reportIncidentType.value = 'Accident';
    reportSeverity.value = 'high';
    reportDescriptionCtrl.clear();
    reportLocationCtrl.clear();
    reportLandmarkCtrl.clear();
    reportLatitude.value = null;
    reportLongitude.value = null;
    reportCasualtyCount.value = 0;
    reportInjuredCount.value = 0;
    reportHospitalCtrl.clear();
    reportAmbulanceAssigned.value = false;
    reportPoliceNotified.value = false;
    reportPoliceStationCtrl.clear();
    reportTowingRequested.value = false;
    reportTrafficDisruption.value = 'none';
    reportImmediateActionCtrl.clear();
    reportPhotos.clear();
  }
}
