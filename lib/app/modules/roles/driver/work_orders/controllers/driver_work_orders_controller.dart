import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/work_order_model.dart';
import '../../../../../data/services/driver_service.dart';
import '../../../../../routes/app_routes.dart';

class DriverWorkOrdersController extends GetxController {
  final RxList<WorkOrderModel> workOrders = <WorkOrderModel>[].obs;
  final RxBool isLoading = false.obs;

  // Search & Filter
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString activeTab = 'all'.obs; // all, pending, in_progress, resolved
  final RxString urgencyFilter = 'all'.obs; // all, critical, high, normal, low

  // Pagination
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 8.obs;
  final RxInt totalPages = 1.obs;

  Timer? _debounceTimer;

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(_onSearchChanged);
    fetchWorkOrders();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    searchController.removeListener(_onSearchChanged);
    searchController.dispose();
    super.onClose();
  }

  void _onSearchChanged() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      final text = searchController.text.trim();
      if (searchQuery.value != text) {
        searchQuery.value = text;
        currentPage.value = 1;
      }
    });
  }

  void setActiveTab(String tab) {
    if (activeTab.value == tab) return;
    activeTab.value = tab;
    currentPage.value = 1;
    fetchWorkOrders();
  }

  void setUrgencyFilter(String urgency) {
    if (urgencyFilter.value == urgency) return;
    urgencyFilter.value = urgency;
    currentPage.value = 1;
  }

  Future<void> fetchWorkOrders() async {
    isLoading.value = true;
    try {
      final res = await DriverService.to.getDriverWorkOrders(
        page: currentPage.value,
        limit: 50,
        status: activeTab.value != 'all' ? activeTab.value : null,
      );

      if (res.success && res.data != null && res.data!.isNotEmpty) {
        workOrders.assignAll(res.data!);
      } else {
        workOrders.clear();
      }
    } catch (e) {
      debugPrint('Error fetching driver work orders: $e');
      workOrders.clear();
    } finally {
      isLoading.value = false;
    }
  }

  // Filtered list based on Search & Urgency
  List<WorkOrderModel> get filteredWorkOrders {
    final q = searchQuery.value.toLowerCase().trim();
    final u = urgencyFilter.value.toLowerCase().trim();
    final tab = activeTab.value.toLowerCase().trim();

    return workOrders.where((w) {
      final code = w.code.toLowerCase();
      final bus = w.busNumber.toLowerCase();
      final category = w.issueCategory.toLowerCase();
      final depot = w.depotName.toLowerCase();
      final tech = (w.technician?.name ?? '').toLowerCase();

      final matchesSearch = q.isEmpty ||
          code.contains(q) ||
          bus.contains(q) ||
          category.contains(q) ||
          depot.contains(q) ||
          tech.contains(q);

      final matchesUrgency = u == 'all' || w.urgency.toLowerCase() == u;

      bool matchesTab = true;
      final st = w.status.toLowerCase();
      if (tab == 'pending') {
        matchesTab = st == 'pending' || st == 'submitted';
      } else if (tab == 'in_progress') {
        matchesTab = st == 'dispatched' || st == 'on_site' || st == 'in_progress' || st == 'assigned';
      } else if (tab == 'resolved') {
        matchesTab = st == 'resolved' || st == 'completed' || st == 'closed';
      }

      return matchesSearch && matchesUrgency && matchesTab;
    }).toList();
  }

  // Pagination on filtered items
  List<WorkOrderModel> get paginatedWorkOrders {
    final list = filteredWorkOrders;
    totalPages.value = (list.length / pageSize.value).ceil().clamp(1, 999);
    final start = (currentPage.value - 1) * pageSize.value;
    if (start >= list.length) {
      return [];
    }
    final end = (start + pageSize.value).clamp(0, list.length);
    return list.sublist(start, end);
  }

  // KPI Metrics
  int get totalWorkOrdersCount => workOrders.length;
  int get activeRepairCount => workOrders.where((w) {
        final s = w.status.toLowerCase();
        return s == 'dispatched' || s == 'on_site' || s == 'in_progress' || s == 'assigned';
      }).length;
  int get pendingDispatchCount => workOrders.where((w) {
        final s = w.status.toLowerCase();
        return s == 'submitted' || s == 'pending';
      }).length;
  int get resolvedCount => workOrders.where((w) {
        final s = w.status.toLowerCase();
        return s == 'resolved' || s == 'completed' || s == 'closed';
      }).length;

  void openCreateWorkOrder() async {
    final result = await Get.toNamed(Routes.DRIVER_CREATE_WORK_ORDER);
    if (result == true) {
      fetchWorkOrders();
    }
  }

  void openWorkOrderDetails(WorkOrderModel order) async {
    final result = await Get.toNamed(
      Routes.DRIVER_WORK_ORDER_DETAILS,
      arguments: {'order': order, 'orderId': order.id},
    );
    if (result == true) {
      fetchWorkOrders();
    }
  }

  void goToPage(int page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }
}

