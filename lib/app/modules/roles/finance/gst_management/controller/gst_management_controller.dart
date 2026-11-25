import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../model/gst_model.dart';

class GSTManagementController extends GetxController with GetSingleTickerProviderStateMixin {
  late TabController tabController;

  final Rx<GstSummaryModel?> gstSummary = Rx<GstSummaryModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxInt currentTabIndex = 0.obs;

  // Period Month state matching Admin Panel (e.g. '2026-11' or empty for All Time)
  final RxString periodMonth = ''.obs;
  final RxBool isAllTime = false.obs;

  @override
  void onInit() {
    super.onInit();
    // 3 Tabs matching Admin Panel 1:1 ('details', 'gstin', 'amounts')
    tabController = TabController(length: 3, vsync: this);
    tabController.addListener(() {
      currentTabIndex.value = tabController.index;
    });

    final now = DateTime.now();
    periodMonth.value = '${now.year}-${now.month.toString().padLeft(2, '0')}';
    isAllTime.value = false;

    loadGSTData();
  }

  @override
  void onClose() {
    tabController.dispose();
    super.onClose();
  }

  /// Switch tab programmatically
  void setTab(int index) {
    if (index >= 0 && index < 3) {
      tabController.animateTo(index);
      currentTabIndex.value = index;
    }
  }

  /// Load GST summary from real API GET /finance/gst/summary
  Future<void> loadGSTData() async {
    isLoading.value = true;
    try {
      int? month;
      int? year;

      if (!isAllTime.value && periodMonth.value.isNotEmpty) {
        final parts = periodMonth.value.split('-');
        if (parts.length == 2) {
          year = int.tryParse(parts[0]);
          month = int.tryParse(parts[1]);
        }
      }

      final res = await FinanceService.to.getGstSummary(
        month: month,
        year: year,
      );

      if (res.success && res.data != null) {
        final d = res.data!;
        final payload = d['data'] is Map ? Map<String, dynamic>.from(d['data']) : d;
        gstSummary.value = GstSummaryModel.fromJson(payload);
      } else {
        gstSummary.value = GstSummaryModel.empty();
      }
    } catch (_) {
      gstSummary.value = GstSummaryModel.empty();
    } finally {
      isLoading.value = false;
    }
  }

  /// Refresh action with feedback
  Future<void> handleRefresh() async {
    isRefreshing.value = true;
    try {
      await loadGSTData();
      Get.snackbar(
        'refreshed_success'.tr,
        'gst_tax_refreshed_msg'.tr,
        backgroundColor: const Color(0xFF065F46),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
        icon: const Icon(Icons.check_circle_rounded, color: Color(0xFF34D399)),
      );
    } catch (_) {
    } finally {
      isRefreshing.value = false;
    }
  }

  /// Set Period Month
  void setPeriodMonth(String ym) {
    periodMonth.value = ym;
    isAllTime.value = false;
    loadGSTData();
  }

  /// Set All Time Period
  void setAllTime() {
    isAllTime.value = true;
    periodMonth.value = '';
    loadGSTData();
  }

  /// Month selector dialog
  Future<void> pickMonth(BuildContext context) async {
    final now = DateTime.now();
    int currentYear = now.year;
    int currentMonth = now.month;

    if (periodMonth.value.isNotEmpty) {
      final parts = periodMonth.value.split('-');
      if (parts.length == 2) {
        currentYear = int.tryParse(parts[0]) ?? now.year;
        currentMonth = int.tryParse(parts[1]) ?? now.month;
      }
    }

    final selected = await showDatePicker(
      context: context,
      initialDate: DateTime(currentYear, currentMonth, 1),
      firstDate: DateTime(2023, 1, 1),
      lastDate: DateTime(now.year + 1, 12, 31),
      initialDatePickerMode: DatePickerMode.year,
      helpText: 'select_gst_month'.tr,
    );

    if (selected != null) {
      final ym = '${selected.year}-${selected.month.toString().padLeft(2, '0')}';
      setPeriodMonth(ym);
    }
  }
}
