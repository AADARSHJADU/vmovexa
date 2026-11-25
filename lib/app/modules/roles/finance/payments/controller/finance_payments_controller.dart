import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../../../../../routes/app_routes.dart';

class FinancePaymentsController extends GetxController {
  // Active Status Tab: 0: 'all', 1: 'paid', 2: 'pending', 3: 'failed'
  final RxInt selectedTab = 0.obs;
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;

  // Payments List from Backend
  final RxList<Map<String, dynamic>> payments = <Map<String, dynamic>>[].obs;

  // Pagination
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 10.obs;
  final RxInt totalItems = 0.obs;
  final RxInt totalPages = 1.obs;

  // Live Stats Count from API
  final RxInt allCount = 0.obs;
  final RxInt paidCount = 0.obs;
  final RxInt pendingCount = 0.obs;
  final RxInt failedCount = 0.obs;

  // Search & Debounce
  final TextEditingController searchController = TextEditingController();
  final RxString searchQuery = ''.obs;
  Timer? _searchDebounceTimer;

  // Advanced Filters
  final RxString selectedPayerType = ''.obs;
  final RxString selectedPurpose = ''.obs;
  final RxString selectedMethod = ''.obs;
  final RxString selectedPaymentMode = ''.obs;
  final RxString startDate = ''.obs;
  final RxString endDate = ''.obs;
  final RxString minAmount = ''.obs;
  final RxString maxAmount = ''.obs;

  // Dynamic Options from API or Standard Presets
  final RxList<String> payerTypeOptions = <String>[].obs;
  final RxList<String> purposeOptions = <String>[].obs;
  final RxList<String> methodOptions = <String>[].obs;
  final RxList<String> paymentModeOptions = <String>[].obs;

  int get activeFilterCount {
    int count = 0;
    if (selectedPayerType.value.isNotEmpty) count++;
    if (selectedPurpose.value.isNotEmpty) count++;
    if (selectedMethod.value.isNotEmpty) count++;
    if (selectedPaymentMode.value.isNotEmpty) count++;
    if (startDate.value.isNotEmpty) count++;
    if (endDate.value.isNotEmpty) count++;
    if (minAmount.value.isNotEmpty) count++;
    if (maxAmount.value.isNotEmpty) count++;
    return count;
  }

  @override
  void onInit() {
    super.onInit();
    searchController.addListener(_onSearchQueryChanged);
    loadPayments();
  }

  @override
  void onClose() {
    _searchDebounceTimer?.cancel();
    searchController.dispose();
    super.onClose();
  }

  void _onSearchQueryChanged() {
    final text = searchController.text.trim();
    if (searchQuery.value != text) {
      searchQuery.value = text;
      _searchDebounceTimer?.cancel();
      _searchDebounceTimer = Timer(const Duration(milliseconds: 350), () {
        currentPage.value = 1;
        loadPayments();
      });
    }
  }

  void switchTab(int index) {
    if (selectedTab.value == index) return;
    selectedTab.value = index;
    currentPage.value = 1;
    loadPayments();
  }

  Future<void> onRefresh() async {
    isRefreshing.value = true;
    await loadPayments();
    isRefreshing.value = false;
  }

  Future<void> loadPayments() async {
    isLoading.value = true;
    try {
      final queryParams = <String, dynamic>{
        'page': currentPage.value,
        'limit': pageSize.value,
      };

      if (searchQuery.value.isNotEmpty) {
        queryParams['search'] = searchQuery.value;
      }

      // Status parameter matching Admin Panel logic
      if (selectedTab.value == 1) {
        queryParams['status'] = 'success';
      } else if (selectedTab.value == 2) {
        queryParams['status'] = 'pending,created';
      } else if (selectedTab.value == 3) {
        queryParams['status'] = 'failed';
      }

      // Filter parameters
      if (selectedPayerType.value.isNotEmpty) {
        queryParams['payerType'] = selectedPayerType.value;
      }
      if (selectedPurpose.value.isNotEmpty) {
        queryParams['purpose'] = selectedPurpose.value;
      }
      if (selectedMethod.value.isNotEmpty) {
        queryParams['method'] = selectedMethod.value;
      }
      if (selectedPaymentMode.value.isNotEmpty) {
        queryParams['paymentMode'] = selectedPaymentMode.value;
      }
      if (startDate.value.isNotEmpty) {
        queryParams['startDate'] = startDate.value;
      }
      if (endDate.value.isNotEmpty) {
        queryParams['endDate'] = endDate.value;
      }
      if (minAmount.value.isNotEmpty) {
        queryParams['minAmount'] = minAmount.value;
      }
      if (maxAmount.value.isNotEmpty) {
        queryParams['maxAmount'] = maxAmount.value;
      }

      final res = await HttpClientService.to.get<dynamic>(
        ApiConstants.financePayments,
        queryParams: queryParams,
        requiresAuth: true,
        create: (data) => data,
      );

      List<Map<String, dynamic>> itemsList = [];

      if (res.success && res.data != null) {
        dynamic data = res.data;

        // Unpack nested payload if needed
        if (data is Map && data.containsKey('data') && data['data'] != null) {
          data = data['data'];
        }

        // Parse items list
        dynamic rawItems;
        if (data is Map) {
          if (data.containsKey('items')) {
            rawItems = data['items'];
          } else if (data.containsKey('rows')) {
            rawItems = data['rows'];
          } else if (data.containsKey('payments')) {
            rawItems = data['payments'];
          }

          // Parse pagination
          if (data.containsKey('total')) {
            totalItems.value = int.tryParse(data['total'].toString()) ?? 0;
          } else if (data.containsKey('count')) {
            totalItems.value = int.tryParse(data['count'].toString()) ?? 0;
          }

          if (data.containsKey('totalPages')) {
            totalPages.value = int.tryParse(data['totalPages'].toString()) ?? 1;
          } else {
            totalPages.value = totalItems.value > 0 ? (totalItems.value / pageSize.value).ceil() : 1;
          }

          // Parse stats object
          if (data.containsKey('stats') && data['stats'] is Map) {
            final stats = Map<String, dynamic>.from(data['stats']);
            allCount.value = int.tryParse((stats['all'] ?? 0).toString()) ?? 0;
            paidCount.value = int.tryParse((stats['successful'] ?? stats['paid'] ?? 0).toString()) ?? 0;
            pendingCount.value = int.tryParse((stats['pending'] ?? 0).toString()) ?? 0;
            failedCount.value = int.tryParse((stats['failed'] ?? 0).toString()) ?? 0;
          }

          // Parse dynamic filter options if returned
          if (data.containsKey('filterOptions') && data['filterOptions'] is Map) {
            final filterOpts = Map<String, dynamic>.from(data['filterOptions']);
            if (filterOpts['payerTypes'] is List) {
              payerTypeOptions.assignAll(List<String>.from(filterOpts['payerTypes'].map((e) => e.toString())));
            }
            if (filterOpts['purposes'] is List) {
              purposeOptions.assignAll(List<String>.from(filterOpts['purposes'].map((e) => e.toString())));
            }
            if (filterOpts['methods'] is List) {
              methodOptions.assignAll(List<String>.from(filterOpts['methods'].map((e) => e.toString())));
            }
            if (filterOpts['paymentModes'] is List) {
              paymentModeOptions.assignAll(List<String>.from(filterOpts['paymentModes'].map((e) => e.toString())));
            }
          }
        } else if (data is List) {
          rawItems = data;
          totalItems.value = data.length;
          totalPages.value = (data.length / pageSize.value).ceil();
        }

        if (rawItems is List) {
          itemsList = rawItems.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }

      payments.assignAll(itemsList);

      // Fallback stats if stats weren't provided in the response
      if (allCount.value == 0 && totalItems.value > 0 && selectedTab.value == 0) {
        allCount.value = totalItems.value;
      }
    } catch (_) {
      payments.clear();
    } finally {
      isLoading.value = false;
    }
  }

  void resetFilters() {
    selectedPayerType.value = '';
    selectedPurpose.value = '';
    selectedMethod.value = '';
    selectedPaymentMode.value = '';
    startDate.value = '';
    endDate.value = '';
    minAmount.value = '';
    maxAmount.value = '';
    searchQuery.value = '';
    searchController.clear();
    currentPage.value = 1;
    loadPayments();
  }

  void applyFilters({
    String? payerType,
    String? purpose,
    String? method,
    String? paymentMode,
    String? fromDate,
    String? toDate,
    String? minAmt,
    String? maxAmt,
  }) {
    if (payerType != null) selectedPayerType.value = payerType;
    if (purpose != null) selectedPurpose.value = purpose;
    if (method != null) selectedMethod.value = method;
    if (paymentMode != null) selectedPaymentMode.value = paymentMode;
    if (fromDate != null) startDate.value = fromDate;
    if (toDate != null) endDate.value = toDate;
    if (minAmt != null) minAmount.value = minAmt;
    if (maxAmt != null) maxAmount.value = maxAmt;
    currentPage.value = 1;
    loadPayments();
  }

  void goToPage(int page) {
    if (page < 1 || page > totalPages.value || page == currentPage.value) return;
    currentPage.value = page;
    loadPayments();
  }

  void changePageSize(int size) {
    if (pageSize.value == size) return;
    pageSize.value = size;
    currentPage.value = 1;
    loadPayments();
  }

  void navigateToDetails(Map<String, dynamic> pay) {
    final id = (pay['id'] ?? pay['code'] ?? '').toString();
    Get.toNamed(Routes.PAYMENT_DETAIL, arguments: pay.isNotEmpty ? pay : id);
  }
}
