import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/work_order_model.dart';
import '../../../../../data/services/fleet_service.dart';
import '../../../../../routes/app_routes.dart';

class TechnicianRequestsController extends GetxController {
  final RxList<WorkOrderModel> workOrders = <WorkOrderModel>[].obs;
  final RxBool isLoading = false.obs;

  // Search & Filter
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  final RxString urgencyFilter = 'all'.obs; // all, critical, high, normal, low
  final RxString activeTab = 'all'.obs; // all, submitted, dispatched, on_site, resolved

  // Pagination
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 6.obs;
  final RxInt totalItems = 0.obs;
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
      if (searchQuery.value != searchController.text.trim()) {
        searchQuery.value = searchController.text.trim();
        currentPage.value = 1;
        fetchWorkOrders();
      }
    });
  }

  void setUrgencyFilter(String val) {
    if (urgencyFilter.value == val) return;
    urgencyFilter.value = val;
    currentPage.value = 1;
    fetchWorkOrders();
  }

  void setActiveTab(String val) {
    if (activeTab.value == val) return;
    activeTab.value = val;
    currentPage.value = 1;
    fetchWorkOrders();
  }

  Future<void> fetchWorkOrders() async {
    isLoading.value = true;
    try {
      final res = await FleetService.to.getWorkOrders(
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
        urgency: urgencyFilter.value,
        status: activeTab.value,
      );

      if (res.success && res.data != null) {
        workOrders.assignAll(res.data!);
        totalItems.value = res.data!.length;
        totalPages.value = (totalItems.value / pageSize.value).ceil().clamp(1, 999);
      } else {
        workOrders.clear();
        totalItems.value = 0;
        totalPages.value = 1;
      }
    } catch (e) {
      debugPrint('Error loading technician work orders: $e');
      workOrders.clear();
      totalItems.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  // 3 KPI Counts
  int get totalWorkOrdersCount => workOrders.length;
  int get pendingDispatchCount => workOrders.where((w) {
        final s = w.status.toLowerCase();
        return s.contains('submitted') || s.contains('pending');
      }).length;
  int get criticalCount => workOrders.where((w) {
        return w.urgency.toLowerCase() == 'critical';
      }).length;

  void goToPage(int page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchWorkOrders();
    }
  }

  void openCreateRequest() async {
    final result = await Get.toNamed(Routes.CREATE_TECHNICIAN_REQUEST);
    if (result == true) {
      fetchWorkOrders();
    }
  }

  void openEditRequest(WorkOrderModel order) async {
    final result = await Get.toNamed(
      Routes.CREATE_TECHNICIAN_REQUEST,
      arguments: {
        'order': order,
        'orderId': order.id,
        'isEdit': true,
      },
    );
    if (result == true) {
      fetchWorkOrders();
    }
  }

  void openRequestDetails(WorkOrderModel order) {
    Get.toNamed(
      Routes.TECHNICIAN_REQUEST_DETAILS,
      arguments: {
        'order': order,
        'orderId': order.id,
      },
    );
  }
}
