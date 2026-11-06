import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../routes/app_routes.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';

class DriverIncidentsListController extends GetxController {
  DriverService get _driverService => DriverService.to;

  final RxBool isLoading = false.obs;
  final RxInt selectedViewTab = 0.obs; // 0 = Incidents (SOS), 1 = Defect Work Orders
  final RxList<DriverIncidentItem> allIncidents = <DriverIncidentItem>[].obs;
  final RxList<WorkOrderModel> allWorkOrders = <WorkOrderModel>[].obs;

  // Search & Filter state
  final RxString searchQuery = ''.obs;
  final RxString selectedSeverity = 'ALL'.obs; // ALL, critical, high, medium, low
  final RxString selectedStatus = 'ALL'.obs; // ALL, open, in_progress, resolved

  final TextEditingController searchController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    fetchAllData();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> fetchAllData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        fetchIncidents(),
        fetchWorkOrders(),
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchIncidents() async {
    try {
      final res = await _driverService.getIncidents(page: 1, limit: 50);
      if (res.success && res.data != null) {
        allIncidents.assignAll(res.data!);
      } else {
        allIncidents.clear();
      }
    } catch (e) {
      debugPrint('DriverIncidentsListController fetchIncidents error: ');
    }
  }

  Future<void> fetchWorkOrders() async {
    try {
      final res = await _driverService.getDriverWorkOrders(page: 1, limit: 50);
      if (res.success && res.data != null) {
        allWorkOrders.assignAll(res.data!);
      } else {
        allWorkOrders.clear();
      }
    } catch (e) {
      debugPrint('DriverIncidentsListController fetchWorkOrders error: ');
    }
  }

  List<DriverIncidentItem> get filteredIncidents {
    return allIncidents.where((inc) {
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

      if (selectedSeverity.value != 'ALL') {
        final sev = (inc.severity ?? 'low').toLowerCase();
        if (sev != selectedSeverity.value.toLowerCase()) {
          return false;
        }
      }

      if (selectedStatus.value != 'ALL') {
        final st = (inc.status ?? 'open').toLowerCase();
        if (st != selectedStatus.value.toLowerCase()) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  List<WorkOrderModel> get filteredWorkOrders {
    return allWorkOrders.where((wo) {
      final q = searchQuery.value.trim().toLowerCase();
      if (q.isNotEmpty) {
        final code = (wo.code).toLowerCase();
        final desc = (wo.description).toLowerCase();
        final cat = (wo.issueCategory).toLowerCase();
        if (!code.contains(q) && !desc.contains(q) && !cat.contains(q)) {
          return false;
        }
      }

      if (selectedSeverity.value != 'ALL') {
        final urg = (wo.urgency).toLowerCase();
        if (urg != selectedSeverity.value.toLowerCase()) {
          return false;
        }
      }

      if (selectedStatus.value != 'ALL') {
        final st = (wo.status).toLowerCase();
        final filterSt = selectedStatus.value.toLowerCase();
        if (filterSt == 'open' && (st != 'submitted' && st != 'pending' && st != 'open')) return false;
        if (filterSt == 'in_progress' && (st != 'dispatched' && st != 'on_site' && st != 'in_progress')) return false;
        if (filterSt == 'resolved' && (st != 'resolved' && st != 'closed')) return false;
      }

      return true;
    }).toList();
  }

  void switchTab(int index) {
    selectedViewTab.value = index;
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

  final RxBool isSubmittingWorkOrder = false.obs;

  Future<bool> createDefectWorkOrder({
    required String issueCategory,
    required String urgency,
    required String description,
  }) async {
    isSubmittingWorkOrder.value = true;
    try {
      final res = await _driverService.reportDriverWorkOrder(
        issueCategory: issueCategory,
        priority: urgency.toLowerCase(),
        description: description,
      );
      if (res.success) {
        Get.snackbar(
          'Defect Reported',
          'Work order dispatched to NOC & technical maintenance team.',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'Submission Error',
          res.message ?? 'Could not submit defect report.',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.redAccent,
          snackPosition: SnackPosition.BOTTOM,
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to report defect: $e',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isSubmittingWorkOrder.value = false;
    }
  }

  Future<void> rateWorkOrder(String workOrderId, int rating, String feedback) async {
    try {
      final res = await _driverService.rateDriverWorkOrder(workOrderId, rating: rating, feedback: feedback);
      if (res.success) {
        Get.snackbar(
          'Rating Submitted',
          'Thank you for rating technician repair quality.',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchWorkOrders();
      } else {
        Get.snackbar(
          'Rating Error',
          res.message ?? 'Could not submit rating.',
          backgroundColor: const Color(0xFF15151F),
          colorText: Colors.redAccent,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to rate: ',
        backgroundColor: const Color(0xFF15151F),
        colorText: Colors.redAccent,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void onReportNewIncident() {
    Get.toNamed(Routes.DRIVER_REPORT_INCIDENT)?.then((_) {
      fetchAllData();
    });
  }

  Future<void> onRefresh() async {
    await fetchAllData();
  }
}
