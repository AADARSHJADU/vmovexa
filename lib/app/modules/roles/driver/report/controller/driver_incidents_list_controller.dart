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
  final RxString selectedSeverity = 'ALL'.obs; // ALL, critical, high, medium, low
  final RxString selectedStatus = 'ALL'.obs; // ALL, open, in_progress, resolved

  final TextEditingController searchController = TextEditingController();

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
      final res = await _driverService.getIncidents(page: 1, limit: 50);
      if (res.success && res.data != null) {
        allIncidents.assignAll(res.data!);
      } else {
        allIncidents.clear();
      }
    } catch (e) {
      debugPrint('DriverIncidentsListController error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<DriverIncidentItem> get filteredIncidents {
    return allIncidents.where((inc) {
      // Search filter
      final q = searchQuery.value.trim().toLowerCase();
      if (q.isNotEmpty) {
        final title = (inc.title ?? '').toLowerCase();
        final desc = (inc.description ?? '').toLowerCase();
        final id = (inc.id ?? '').toLowerCase();
        final ticket = (inc.ticketNumber ?? '').toLowerCase();
        if (!title.contains(q) && !desc.contains(q) && !id.contains(q) && !ticket.contains(q)) {
          return false;
        }
      }

      // Severity filter
      if (selectedSeverity.value != 'ALL') {
        final sev = (inc.severity ?? 'low').toLowerCase();
        if (sev != selectedSeverity.value.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus.value != 'ALL') {
        final st = (inc.status ?? 'open').toLowerCase();
        if (st != selectedStatus.value.toLowerCase()) {
          return false;
        }
      }

      return true;
    }).toList();
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

  void onIncidentTap(DriverIncidentItem incident) {
    Get.toNamed(
      Routes.DRIVER_INCIDENT_DETAILS,
      arguments: incident,
    );
  }

  void onReportNewIncident() {
    Get.toNamed(Routes.DRIVER_REPORT_INCIDENT)?.then((_) {
      // Refresh list after returning from report wizard
      fetchIncidents();
    });
  }

  Future<void> onRefresh() async {
    await fetchIncidents();
  }
}
