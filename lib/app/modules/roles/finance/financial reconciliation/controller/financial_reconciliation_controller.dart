import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/financial_reconciliation_model.dart';

class FinancialReconciliationController extends GetxController with GetTickerProviderStateMixin {
  // Navigation Index (0 for Dashboard, 1 for Start, 2 for Completed)
  final RxInt currentScreenIndex = 0.obs;

  // Filters State
  final RxString selectedDateRange = '01 May 2024 - 31 May 2024'.obs;
  final RxString selectedAccount = 'All Accounts'.obs;
  final RxString selectedStatus = 'All Status'.obs;

  // Tab controllers (used for start and completed views)
  late TabController startTabController;
  late TabController completedTabController;

  final RxInt selectedStartTabIndex = 0.obs;
  final RxInt selectedCompletedTabIndex = 0.obs;

  // Mock Data lists
  final RxList<ReconciliationSummaryCardModel> summaryCards = <ReconciliationSummaryCardModel>[].obs;
  final RxList<ReconciliationItemModel> reconciliationItems = <ReconciliationItemModel>[].obs;
  final RxList<ReconciliationInsightModel> insights = <ReconciliationInsightModel>[].obs;
  final RxList<TransactionModel> matchedTransactions = <TransactionModel>[].obs;
  final RxList<TransactionModel> unmatchedTransactions = <TransactionModel>[].obs;

  // Selected reconciliation account details
  final RxString selectedReconcileAccountName = 'HDFC Bank'.obs;
  final RxString selectedReconcileAccountType = 'Bank Account'.obs;
  final RxString selectedReconcilePeriod = '01 May 2024 - 31 May 2024'.obs;
  final RxString selectedReconcileSource = 'System Transactions'.obs;

  @override
  void onInit() {
    super.onInit();
    startTabController = TabController(length: 2, vsync: this);
    completedTabController = TabController(length: 2, vsync: this);

    startTabController.addListener(() {
      selectedStartTabIndex.value = startTabController.index;
    });

    completedTabController.addListener(() {
      selectedCompletedTabIndex.value = completedTabController.index;
    });

    loadInitialData();
  }

  @override
  void onClose() {
    startTabController.dispose();
    completedTabController.dispose();
    super.onClose();
  }

  void loadInitialData() {
    // 1. Load Summary cards data
    summaryCards.addAll([
      const ReconciliationSummaryCardModel(
        title: 'Total Reconciliations',
        value: '128',
        subtitle: 'This Month',
        percentage: 100.0,
        color: Colors.purple,
        icon: Icons.layers_outlined,
      ),
      const ReconciliationSummaryCardModel(
        title: 'Matched',
        value: '96',
        subtitle: '75.00%',
        percentage: 75.00,
        color: Color(0xFF10B981), // Green
        icon: Icons.check_circle_outline,
      ),
      const ReconciliationSummaryCardModel(
        title: 'Unmatched',
        value: '24',
        subtitle: '18.75%',
        percentage: 18.75,
        color: Color(0xFFF59E0B), // Orange
        icon: Icons.error_outline,
      ),
      const ReconciliationSummaryCardModel(
        title: 'In Progress',
        value: '8',
        subtitle: '6.25%',
        percentage: 6.25,
        color: Color(0xFF3B82F6), // Blue
        icon: Icons.hourglass_empty_outlined,
      ),
    ]);

    // 2. Load Reconciliation items list
    reconciliationItems.addAll([
      const ReconciliationItemModel(
        accountName: 'HDFC Bank',
        accountType: 'Bank Account',
        type: 'Bank Reconciliation',
        status: ReconciliationStatus.matched,
        lastReconciled: '31 May 2024\n10:30 AM',
        icon: Icons.account_balance,
      ),
      const ReconciliationItemModel(
        accountName: 'ICICI Bank',
        accountType: 'Bank Account',
        type: 'Bank Reconciliation',
        status: ReconciliationStatus.unmatched,
        lastReconciled: '30 May 2024\n04:15 PM',
        icon: Icons.account_balance,
      ),
      const ReconciliationItemModel(
        accountName: 'Cash In Hand',
        accountType: 'Cash Account',
        type: 'Cash Reconciliation',
        status: ReconciliationStatus.inProgress,
        lastReconciled: '29 May 2024\n11:20 AM',
        icon: Icons.payments_outlined,
      ),
      const ReconciliationItemModel(
        accountName: 'GST Payable',
        accountType: 'Liability Account',
        type: 'Account Reconciliation',
        status: ReconciliationStatus.matched,
        lastReconciled: '31 May 2024\n09:45 AM',
        icon: Icons.description_outlined,
      ),
      const ReconciliationItemModel(
        accountName: 'Sales Account',
        accountType: 'Income Account',
        type: 'Account Reconciliation',
        status: ReconciliationStatus.unmatched,
        lastReconciled: '28 May 2024\n02:10 PM',
        icon: Icons.analytics_outlined,
      ),
    ]);

    // 3. Load insights
    insights.addAll([
      const ReconciliationInsightModel(
        title: 'Match Rate',
        value: '75.00%',
        changeText: '+5.20% vs last month',
        changeColor: Color(0xFF10B981),
        subtitle: 'Across all accounts',
        icon: Icons.trending_up,
      ),
      const ReconciliationInsightModel(
        title: 'Unmatched Amount',
        value: '₹2,45,630.00',
        changeText: 'Across 24 items',
        changeColor: Color(0xFFF59E0B),
        subtitle: 'Requires action',
        icon: Icons.warning_amber_rounded,
      ),
      const ReconciliationInsightModel(
        title: 'Avg. Time to Reconcile',
        value: '1.8 Days',
        changeText: '-2.3 days vs last month',
        changeColor: Color(0xFF10B981),
        subtitle: 'Faster response time',
        icon: Icons.av_timer_outlined,
      ),
    ]);

    // 4. Load matched transactions
    matchedTransactions.addAll([
      const TransactionModel(
        date: '31 May 2024',
        description: 'UPI Payment - Amazon',
        systemAmount: 1250.0,
        statementAmount: 1250.0,
        variance: 0.0,
        status: ReconciliationStatus.matched,
        isMatched: true,
      ),
      const TransactionModel(
        date: '31 May 2024',
        description: 'NEFT - Vendor Payment',
        systemAmount: 15000.0,
        statementAmount: 15000.0,
        variance: 0.0,
        status: ReconciliationStatus.matched,
        isMatched: true,
      ),
      const TransactionModel(
        date: '30 May 2024',
        description: 'PhonePe Payment - Local Shop',
        systemAmount: 560.0,
        statementAmount: 560.0,
        variance: 0.0,
        status: ReconciliationStatus.matched,
        isMatched: true,
      ),
      const TransactionModel(
        date: '30 May 2024',
        description: 'IMPS - Supplier Payment',
        systemAmount: 8750.0,
        statementAmount: 8750.0,
        variance: 0.0,
        status: ReconciliationStatus.matched,
        isMatched: true,
      ),
    ]);

    // 5. Load unmatched transactions
    unmatchedTransactions.addAll([
      const TransactionModel(
        date: '31 May 2024',
        description: 'Bank Charges - May 2024',
        systemAmount: 1250.0,
        statementAmount: 0.0,
        variance: -1250.0,
        status: ReconciliationStatus.unmatched,
        isMatched: false,
      ),
      const TransactionModel(
        date: '30 May 2024',
        description: 'Interest Credit',
        systemAmount: 2350.0,
        statementAmount: 0.0,
        variance: -2350.0,
        status: ReconciliationStatus.unmatched,
        isMatched: false,
      ),
      const TransactionModel(
        date: '29 May 2024',
        description: 'UPI Payment - Customer Refund',
        systemAmount: 1850.0,
        statementAmount: 0.0,
        variance: -1850.0,
        status: ReconciliationStatus.unmatched,
        isMatched: false,
      ),
      const TransactionModel(
        date: '28 May 2024',
        description: 'NEFT - Supplier',
        systemAmount: 8750.0,
        statementAmount: 0.0,
        variance: -8750.0,
        status: ReconciliationStatus.unmatched,
        isMatched: false,
      ),
      const TransactionModel(
        date: '27 May 2024',
        description: 'Cash Deposit',
        systemAmount: 3245.0,
        statementAmount: 0.0,
        variance: -3245.0,
        status: ReconciliationStatus.unmatched,
        isMatched: false,
      ),
    ]);
  }

  // Filter actions
  void pickDateRange() {
    Get.snackbar(
      'Date Filter',
      'Select date range filter',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void filterByAccount() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF10121A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Select Account',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('All Accounts', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedAccount.value = 'All Accounts';
                Get.back();
              },
            ),
            ListTile(
              title: const Text('HDFC Bank', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedAccount.value = 'HDFC Bank';
                Get.back();
              },
            ),
            ListTile(
              title: const Text('ICICI Bank', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedAccount.value = 'ICICI Bank';
                Get.back();
              },
            ),
          ],
        ),
      ),
    );
  }

  void filterByStatus() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF10121A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Select Status',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('All Status', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedStatus.value = 'All Status';
                Get.back();
              },
            ),
            ListTile(
              title: const Text('Matched', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedStatus.value = 'Matched';
                Get.back();
              },
            ),
            ListTile(
              title: const Text('Unmatched', style: TextStyle(color: Colors.white)),
              onTap: () {
                selectedStatus.value = 'Unmatched';
                Get.back();
              },
            ),
          ],
        ),
      ),
    );
  }

  void applyFilter() {
    Get.snackbar(
      'Filters Applied',
      'Displaying reconciliations matching filters',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  // Navigation transitions
  void startNewReconcile(ReconciliationItemModel item) {
    selectedReconcileAccountName.value = item.accountName;
    selectedReconcileAccountType.value = item.accountType;
    currentScreenIndex.value = 1; // Start Reconciliation Screen
  }

  void completeReconciliation() {
    currentScreenIndex.value = 2; // Reconciliation Completed Screen
  }

  void saveAndExit() {
    currentScreenIndex.value = 0; // Return to Dashboard
    Get.snackbar(
      'Progress Saved',
      'Reconciliation progress has been saved.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void backToDashboard() {
    currentScreenIndex.value = 0; // Back to Dashboard
  }

  void reviewUnmatched() {
    startTabController.animateTo(1);
    selectedStartTabIndex.value = 1;
    Get.snackbar(
      'Unmatched Transactions',
      'Scroll down to review unmatched items',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void createManualMatch() {
    Get.snackbar(
      'Manual Match',
      'Opening manual reconciliation wizard...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void downloadReport() {
    Get.snackbar(
      'Downloading Report',
      'Reconciliation report PDF is downloading...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void markAsComplete() {
    currentScreenIndex.value = 0;
    Get.snackbar(
      'Reconciliation Completed',
      'Reconciliation for ${selectedReconcileAccountName.value} has been marked as complete.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
    );
  }

  void reviewTransaction(TransactionModel tx) {
    Get.snackbar(
      'Reviewing Transaction',
      'Review: ${tx.description}',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void viewAllMatched() {
    Get.snackbar(
      'Matched Transactions',
      'Viewing all matched records...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void viewAllUnmatched() {
    Get.snackbar(
      'Unmatched Transactions',
      'Viewing all unmatched records...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }

  void learnMoreHelp() {
    Get.snackbar(
      'Reconciliation Guide',
      'Opening tutorial page...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10121A),
      colorText: Colors.white,
    );
  }
}
