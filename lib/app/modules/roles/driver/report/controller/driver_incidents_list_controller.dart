import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';

class DriverIncidentsListController extends GetxController {
  DriverService get _driverService => DriverService.to;

  final RxBool isLoading = false.obs;
  final RxList<DriverIncidentItem> allIncidents = <DriverIncidentItem>[].obs;

  // Search & Filter state
  final RxString searchQuery = ''.obs;
  final RxString selectedCategory = 'ALL'.obs; // ALL, Accident, Breakdown, Road Condition, Traffic Issue, Safety Concern
  final RxString selectedSeverity = 'ALL'.obs; // ALL, CRITICAL, HIGH, MEDIUM, LOW
  final RxString selectedStatus = 'ALL'.obs; // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED

  final TextEditingController searchController = TextEditingController();

  static const List<String> categories = [
    'ALL',
    'Accident',
    'Breakdown',
    'Road Condition',
    'Traffic Issue',
    'Safety Concern',
  ];

  static const List<String> severities = [
    'ALL',
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
  ];

  static const List<String> statuses = [
    'ALL',
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ];

  @override
  void onInit() {
    super.onInit();
    fetchIncidents();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> fetchIncidents() async {
    isLoading.value = true;
    try {
      debugPrint('🚀 [DriverIncidentsListController] fetchIncidents() requested');
      final res = await _driverService.getIncidents();
      debugPrint('📥 [DriverIncidentsListController] API result: success=${res.success}, statusCode=${res.statusCode}, dataCount=${res.data?.length}');
      if (res.success && res.data != null) {
        allIncidents.assignAll(res.data!);
        debugPrint('✅ [DriverIncidentsListController] Assigned ${allIncidents.length} incidents to allIncidents');
        for (var inc in allIncidents) {
          debugPrint('   👉 Incident #${inc.id} | Type: ${inc.incidentType} | Sev: ${inc.severity} | Status: ${inc.status} | Loc: ${inc.locationName ?? inc.location?.address}');
        }
      } else {
        allIncidents.clear();
        debugPrint('⚠️ [DriverIncidentsListController] API failure or null data: ${res.message ?? res.error}');
      }
    } catch (e, st) {
      debugPrint('❌ [DriverIncidentsListController] fetchIncidents error: $e\n$st');
    } finally {
      isLoading.value = false;
      debugPrint('🏁 [DriverIncidentsListController] Done. Active items after filtering: ${filteredIncidents.length}');
    }
  }

  List<DriverIncidentItem> get filteredIncidents {
    return allIncidents.where((inc) {
      final q = searchQuery.value.trim().toLowerCase();
      if (q.isNotEmpty) {
        final id = (inc.id ?? '').toLowerCase();
        final type = (inc.incidentType ?? inc.title ?? '').toLowerCase();
        final desc = (inc.description ?? '').toLowerCase();
        final loc = (inc.locationName ?? inc.location?.address ?? '').toLowerCase();
        final landmark = (inc.landmark ?? '').toLowerCase();
        final hospital = (inc.hospitalName ?? '').toLowerCase();
        final police = (inc.policeStationName ?? '').toLowerCase();
        final ticket = (inc.ticketNumber ?? '').toLowerCase();

        final matches = id.contains(q) ||
            type.contains(q) ||
            desc.contains(q) ||
            loc.contains(q) ||
            landmark.contains(q) ||
            hospital.contains(q) ||
            police.contains(q) ||
            ticket.contains(q);

        if (!matches) return false;
      }

      // Category / Type filter
      final activeCat = selectedCategory.value.trim();
      if (activeCat.toUpperCase() != 'ALL') {
        final type = (inc.incidentType ?? inc.title ?? '').toLowerCase();
        final filterCat = activeCat.toLowerCase();
        if (!type.contains(filterCat)) {
          return false;
        }
      }

      // Severity filter
      final activeSev = selectedSeverity.value.trim();
      if (activeSev.toUpperCase() != 'ALL') {
        final sev = (inc.severity ?? 'low').toLowerCase();
        if (sev != activeSev.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      final activeSt = selectedStatus.value.trim();
      if (activeSt.toUpperCase() != 'ALL') {
        final st = (inc.status ?? 'open').toLowerCase();
        final filterSt = activeSt.toLowerCase();
        if (filterSt == 'open') {
          if (st != 'open' && st != 'review' && st != 'pending' && st != 'reported') {
            return false;
          }
        } else if (filterSt == 'in_progress') {
          if (st != 'in_progress' && st != 'investigating' && st != 'active') {
            return false;
          }
        } else if (filterSt == 'resolved') {
          if (st != 'resolved') return false;
        } else if (filterSt == 'closed') {
          if (st != 'closed') return false;
        } else {
          if (st != filterSt) return false;
        }
      }

      return true;
    }).toList();
  }

  bool get isFilterActive =>
      searchQuery.value.trim().isNotEmpty ||
      selectedCategory.value.toUpperCase() != 'ALL' ||
      selectedSeverity.value.toUpperCase() != 'ALL' ||
      selectedStatus.value.toUpperCase() != 'ALL';

  void setCategory(String cat) {
    selectedCategory.value = cat;
  }

  void setSeverity(String sev) {
    selectedSeverity.value = sev;
  }

  void setStatus(String st) {
    selectedStatus.value = st;
  }

  void updateSearch(String query) {
    searchQuery.value = query;
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
  }

  void resetFilters() {
    searchController.clear();
    searchQuery.value = '';
    selectedCategory.value = 'ALL';
    selectedSeverity.value = 'ALL';
    selectedStatus.value = 'ALL';
  }

  void onIncidentTap(DriverIncidentItem incident) {
    Get.toNamed(
      Routes.DRIVER_INCIDENT_DETAILS,
      arguments: incident,
    );
  }

  void onReportNewIncident() {
    Get.toNamed(Routes.DRIVER_REPORT_INCIDENT)?.then((_) {
      fetchIncidents();
    });
  }

  Future<void> onRefresh() async {
    await fetchIncidents();
  }
}
