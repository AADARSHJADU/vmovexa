import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import '../model/financial_reconciliation_model.dart';

class FinancialReconciliationController extends GetxController {
  // Navigation: 0 = Roster (Dashboard), 1 = Wizard (Start Reconciliation)
  final RxInt currentScreenIndex = 0.obs;

  // State Observables
  final Rx<ReconciliationSummaryModel?> summary = Rx<ReconciliationSummaryModel?>(null);
  final RxList<ReconciliationTransactionModel> transactions = <ReconciliationTransactionModel>[].obs;
  final Rx<ReconciliationAccountModel?> selectedAccount = Rx<ReconciliationAccountModel?>(null);

  // Filters & Pagination
  final RxString accountSearch = ''.obs;
  final RxString viewMode = 'card'.obs; // 'card' or 'table'
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 5.obs;

  // Loading States
  final RxBool isLoadingSummary = false.obs;
  final RxBool isLoadingTxns = false.obs;
  final RxBool isAutoMatching = false.obs;
  final RxBool isFinalizing = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadReconciliationSummary();
  }

  // ==========================================
  // API: Load Reconciliation Summary
  // ==========================================
  Future<void> loadReconciliationSummary() async {
    isLoadingSummary.value = true;
    try {
      final res = await FinanceService.to.getReconciliationSummary();
      if (res.success && res.data != null) {
        summary.value = ReconciliationSummaryModel.fromJson(res.data!);
      } else {
        summary.value = ReconciliationSummaryModel.empty();
      }
    } catch (_) {
      summary.value = ReconciliationSummaryModel.empty();
    } finally {
      isLoadingSummary.value = false;
    }
  }

  // Filtered Accounts
  List<ReconciliationAccountModel> get filteredAccounts {
    final list = summary.value?.accounts ?? [];
    final q = accountSearch.value.trim().toLowerCase();
    if (q.isEmpty) {
      return list;
    }
    return list.where((acc) {
      return acc.name.toLowerCase().contains(q) ||
          acc.category.toLowerCase().contains(q) ||
          acc.accountNumber.toLowerCase().contains(q) ||
          acc.status.toLowerCase().contains(q);
    }).toList();
  }

  // Paginated Accounts
  List<ReconciliationAccountModel> get paginatedAccounts {
    final all = filteredAccounts;
    final start = (currentPage.value - 1) * pageSize.value;
    if (start >= all.length) {
      return [];
    }
    final end = (start + pageSize.value > all.length) ? all.length : start + pageSize.value;
    return all.sublist(start, end);
  }

  int get totalPages {
    final len = filteredAccounts.length;
    if (len == 0) {
      return 1;
    }
    return (len / pageSize.value).ceil();
  }

  // ==========================================
  // WIZARD: Start for Specific Account or Consolidated
  // ==========================================
  Future<void> startWizardForAccount(ReconciliationAccountModel? account) async {
    selectedAccount.value = account;
    currentScreenIndex.value = 1;
    await loadTransactions(account?.id);
  }

  Future<void> loadTransactions([String? accountId]) async {
    isLoadingTxns.value = true;
    try {
      final res = await FinanceService.to.getReconciliationTransactions(
        accountId: accountId ?? selectedAccount.value?.id,
      );
      if (res.success && res.data != null) {
        final raw = res.data;
        if (raw is List) {
          transactions.value = raw
              .map((item) => ReconciliationTransactionModel.fromJson(item as Map<String, dynamic>))
              .toList();
        } else if (raw is Map && raw['transactions'] is List) {
          transactions.value = (raw['transactions'] as List)
              .map((item) => ReconciliationTransactionModel.fromJson(item as Map<String, dynamic>))
              .toList();
        } else {
          transactions.clear();
        }
      } else {
        transactions.clear();
      }
    } catch (_) {
      transactions.clear();
    } finally {
      isLoadingTxns.value = false;
    }
  }

  // ==========================================
  // API: Run Auto-Match Engine
  // ==========================================
  Future<void> runAutoMatch() async {
    isAutoMatching.value = true;
    try {
      final res = await FinanceService.to.autoMatchReconciliation();
      if (res.success) {
        Get.snackbar(
          'reconcile'.tr,
          'recon_auto_match_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar(
          'reconcile'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'recon_auto_match_done'.tr,
          backgroundColor: const Color(0xFF3B82F6),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
      await loadTransactions();
      await loadReconciliationSummary();
    } catch (_) {
      Get.snackbar(
        'reconcile'.tr,
        'recon_auto_match_failed'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isAutoMatching.value = false;
    }
  }

  // ==========================================
  // API: Finalize & Confirm Reconciliation (Admin Panel Parity: No New Page)
  // ==========================================
  Future<void> finalizeReconciliation() async {
    isFinalizing.value = true;
    try {
      final acc = selectedAccount.value;

      final res = await FinanceService.to.finalizeReconciliation({
        'statementDate': DateTime.now().toIso8601String(),
        'accountName': acc?.name ?? 'consolidated_corporate_accounts'.tr,
        'accountId': acc?.id ?? 'corporate_all',
      });

      if (res.success) {
        Get.snackbar(
          'reconciliation'.tr,
          'recon_finalized_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        // Refresh data and return to Roster
        await loadTransactions(acc?.id);
        await loadReconciliationSummary();
        currentScreenIndex.value = 0;
      } else {
        Get.snackbar(
          'reconciliation'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'recon_finalize_failed'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'reconciliation'.tr,
        'recon_finalize_failed'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isFinalizing.value = false;
    }
  }

  // Navigation helpers
  void backToRoster() {
    currentScreenIndex.value = 0;
    loadReconciliationSummary();
  }

  void goToDashboard() {
    Get.back();
  }
}
