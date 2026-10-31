import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';

class TechWorkOrdersController extends GetxController {
  static TechWorkOrdersController get to => Get.find<TechWorkOrdersController>();

  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;

  final RxList<WorkOrderModel> allOrders = <WorkOrderModel>[].obs;
  final RxString selectedStatusFilter = 'all'.obs;
  final RxString selectedPriorityFilter = ''.obs;
  final RxString searchQuery = ''.obs;

  final RxInt currentPage = 1.obs;
  final int pageSize = 20;

  // Filter tabs: All, Dispatched/Assigned, On-Site, Resolved
  List<WorkOrderModel> get filteredOrders {
    var list = allOrders.toList();

    // Status filter
    if (selectedStatusFilter.value != 'all') {
      final filter = selectedStatusFilter.value.toLowerCase();
      if (filter == 'dispatched') {
        list = list.where((o) {
          final s = o.status.toLowerCase();
          return s == 'dispatched' || s == 'assigned' || s == 'submitted';
        }).toList();
      } else if (filter == 'on_site') {
        list = list.where((o) => o.status.toLowerCase() == 'on_site' || o.status.toLowerCase() == 'in_progress').toList();
      } else if (filter == 'resolved') {
        list = list.where((o) => o.status.toLowerCase() == 'resolved' || o.status.toLowerCase() == 'completed').toList();
      } else {
        list = list.where((o) => o.status.toLowerCase() == filter).toList();
      }
    }

    // Priority filter
    if (selectedPriorityFilter.value.isNotEmpty) {
      list = list.where((o) => o.urgency.toLowerCase() == selectedPriorityFilter.value.toLowerCase()).toList();
    }

    // Search query
    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((o) {
        return o.code.toLowerCase().contains(q) ||
            o.busNumber.toLowerCase().contains(q) ||
            o.issueCategory.toLowerCase().contains(q) ||
            o.depotName.toLowerCase().contains(q);
      }).toList();
    }

    return list;
  }

  // Summary counts
  int get totalCount => allOrders.length;
  int get dispatchedCount => allOrders.where((o) {
        final s = o.status.toLowerCase();
        return s == 'dispatched' || s == 'assigned' || s == 'submitted';
      }).length;
  int get onSiteCount => allOrders.where((o) {
        final s = o.status.toLowerCase();
        return s == 'on_site' || s == 'in_progress';
      }).length;
  int get resolvedCount => allOrders.where((o) {
        final s = o.status.toLowerCase();
        return s == 'resolved' || s == 'completed';
      }).length;

  @override
  void onInit() {
    super.onInit();
    fetchWorkOrders();
  }

  Future<void> fetchWorkOrders() async {
    isLoading.value = true;
    try {
      final res = await TechnicianService.to.getMyWorkOrders(
        page: currentPage.value,
        limit: pageSize,
      );
      if (res.success && res.data != null) {
        allOrders.assignAll(res.data!);
      }
    } catch (_) {
    } finally {
      isLoading.value = false;
    }
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
  }

  void setStatusFilter(String status) {
    selectedStatusFilter.value = status;
  }

  void setPriorityFilter(String priority) {
    if (selectedPriorityFilter.value == priority) {
      selectedPriorityFilter.value = ''; // toggle off
    } else {
      selectedPriorityFilter.value = priority;
    }
  }

  /// Mark Work Order as Arrived On-Site
  Future<bool> markOnSite(WorkOrderModel order) async {
    isSubmitting.value = true;
    try {
      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        order.id,
        status: 'on_site',
        resolutionNotes: 'Technician arrived on-site and initiated diagnostics',
      );
      if (res.success) {
        Get.snackbar(
          'Status Updated',
          '${order.code} marked as On-Site Troubleshooting',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'Error',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Submit Resolution (Mark resolved/completed)
  Future<bool> resolveWorkOrder({
    required String orderId,
    required String notes,
    List<String> parts = const [],
    List<String> checklist = const [],
  }) async {
    isSubmitting.value = true;
    try {
      String finalNotes = notes.trim();
      if (checklist.isNotEmpty) {
        finalNotes += '\n[Checklist Passed: ${checklist.join(', ')}]';
      }

      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        orderId,
        status: 'resolved',
        resolutionNotes: finalNotes,
        partsReplaced: parts,
      );

      if (res.success) {
        Get.snackbar(
          'Resolved & Tested',
          'Work order marked resolved successfully. Awaiting supervisor sign-off.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'Error',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Dispatch Work Order (POST /api/v1/work-orders/dispatch)
  Future<bool> dispatchOrder({
    required int vehicleId,
    required String issueCategory,
    required int technicianId,
    int? organizationId,
    int? fleetId,
    String urgency = 'normal',
    String? description,
    String? instructions,
    int slaHours = 24,
    String? eta,
  }) async {
    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'vehicleId': vehicleId,
        'issueCategory': issueCategory.trim(),
        'technicianId': technicianId,
        'organizationId': organizationId ?? 1,
        if (fleetId != null && fleetId > 0) 'fleetId': fleetId,
        'urgency': urgency.toLowerCase(),
        if (description != null && description.trim().isNotEmpty) 'description': description.trim(),
        if (instructions != null && instructions.trim().isNotEmpty) 'instructions': instructions.trim(),
        'slaHours': slaHours,
        if (eta != null && eta.trim().isNotEmpty) 'eta': eta.trim(),
      };

      final res = await TechnicianService.to.dispatchWorkOrder(payload);
      if (res.success) {
        Get.snackbar(
          'Work Order Dispatched',
          'Work order dispatched successfully to technician.',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'Dispatch Failed',
          res.displayErrorMessage,
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(12),
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }
}
