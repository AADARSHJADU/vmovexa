import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

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

  /// Check whether an order has passed its SLA target
  bool isOrderOverdue(WorkOrderModel order) {
    final st = order.status.toLowerCase();
    if (st == 'resolved' || st == 'completed' || st == 'closed' || st == 'rejected') {
      return false;
    }
    if (order.slaDueAt == null || order.slaDueAt!.isEmpty) return false;
    final due = DateTime.tryParse(order.slaDueAt!);
    if (due == null) return false;
    return DateTime.now().isAfter(due);
  }

  // Filter tabs: All, Dispatched/Assigned, On-Site, Resolved, SLA Overdue
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
        list = list.where((o) => o.status.toLowerCase() == 'resolved' || o.status.toLowerCase() == 'completed' || o.status.toLowerCase() == 'closed').toList();
      } else if (filter == 'overdue') {
        list = list.where(isOrderOverdue).toList();
      } else {
        list = list.where((o) => o.status.toLowerCase() == filter).toList();
      }
    }

    // Priority / Urgency filter
    if (selectedPriorityFilter.value.isNotEmpty) {
      list = list.where((o) => o.urgency.toLowerCase() == selectedPriorityFilter.value.toLowerCase()).toList();
    }

    // Search query across code, bus, issue category, depot name, and description
    if (searchQuery.value.trim().isNotEmpty) {
      final q = searchQuery.value.trim().toLowerCase();
      list = list.where((o) {
        return o.code.toLowerCase().contains(q) ||
            o.busNumber.toLowerCase().contains(q) ||
            o.issueCategory.toLowerCase().contains(q) ||
            o.depotName.toLowerCase().contains(q) ||
            o.description.toLowerCase().contains(q);
      }).toList();
    }

    return list;
  }

  // Summary counts matching Web Portal KPI Metrics
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
        return s == 'resolved' || s == 'completed' || s == 'closed';
      }).length;
  int get overdueCount => allOrders.where(isOrderOverdue).length;

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

  void resetFilters() {
    searchQuery.value = '';
    selectedStatusFilter.value = 'all';
    selectedPriorityFilter.value = '';
  }

  void navigateToDiagnostics() {
    Get.toNamed(Routes.DEVICE_DIAGNOSTICS);
  }

  /// Format SLA status and countdown matching Web formatSlaInfo
  Map<String, dynamic> formatSlaInfo(WorkOrderModel order) {
    final st = order.status.toLowerCase();
    if (st == 'resolved' || st == 'completed' || st == 'closed') {
      return {
        'type': 'resolved',
        'text': 'sla_resolved'.tr,
        'color': const Color(0xFF10B981),
        'bg': const Color(0xFF10B981).withValues(alpha: 0.15),
        'icon': Icons.check_circle_rounded,
      };
    }
    if (order.slaDueAt == null || order.slaDueAt!.isEmpty) {
      return {
        'type': 'none',
        'text': '—',
        'color': Colors.white38,
        'bg': Colors.transparent,
        'icon': null,
      };
    }
    final due = DateTime.tryParse(order.slaDueAt!);
    if (due == null) {
      return {
        'type': 'none',
        'text': '—',
        'color': Colors.white38,
        'bg': Colors.transparent,
        'icon': null,
      };
    }
    final now = DateTime.now();
    final diff = due.difference(now);
    if (diff.isNegative) {
      final overdueMins = diff.inMinutes.abs();
      final h = overdueMins ~/ 60;
      final m = overdueMins % 60;
      final timeStr = h > 0 ? '${h}h ${m}m' : '${m}m';
      return {
        'type': 'overdue',
        'text': '${'sla_overdue_by'.tr} $timeStr',
        'color': const Color(0xFFEF4444),
        'bg': const Color(0xFFEF4444).withValues(alpha: 0.16),
        'icon': Icons.warning_amber_rounded,
      };
    } else {
      final remMins = diff.inMinutes;
      final h = remMins ~/ 60;
      final m = remMins % 60;
      final timeStr = h > 0 ? '${h}h ${m}m' : '${m}m';
      final isUrgent = diff.inHours < 1;
      return {
        'type': 'pending',
        'text': '$timeStr ${'sla_left'.tr}',
        'color': isUrgent ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8),
        'bg': (isUrgent ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8)).withValues(alpha: 0.15),
        'icon': Icons.access_time_rounded,
      };
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
          'status_updated'.tr,
          '${order.code} ${'order_marked_on_site'.tr}',
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'error'.tr,
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
        'error'.tr,
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
      final res = await TechnicianService.to.updateMyWorkOrderStatus(
        orderId,
        status: 'resolved',
        resolutionNotes: notes.trim(),
        partsReplaced: parts,
      );

      if (res.success) {
        Get.snackbar(
          'resolved'.tr,
          'order_resolved_success'.tr,
          backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12),
        );
        await fetchWorkOrders();
        return true;
      } else {
        Get.snackbar(
          'error'.tr,
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
        'error'.tr,
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
          'dispatched'.tr,
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
          'error'.tr,
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
        'error'.tr,
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
