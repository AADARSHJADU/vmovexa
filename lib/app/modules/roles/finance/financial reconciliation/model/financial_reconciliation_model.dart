class ReconciliationSummaryModel {
  final int totalTransactions;
  final int matched;
  final int unmatched;
  final int inProgress;
  final List<ReconciliationAccountModel> accounts;

  ReconciliationSummaryModel({
    required this.totalTransactions,
    required this.matched,
    required this.unmatched,
    required this.inProgress,
    required this.accounts,
  });

  factory ReconciliationSummaryModel.fromJson(Map<String, dynamic> json) {
    var rawAccounts = json['accounts'];
    List<ReconciliationAccountModel> accountList = [];
    if (rawAccounts is List) {
      accountList = rawAccounts
          .map((a) => ReconciliationAccountModel.fromJson(a as Map<String, dynamic>))
          .toList();
    }

    return ReconciliationSummaryModel(
      totalTransactions: (json['totalTransactions'] ?? json['total_transactions'] ?? 0) is int
          ? (json['totalTransactions'] ?? json['total_transactions'] ?? 0)
          : int.tryParse((json['totalTransactions'] ?? json['total_transactions'] ?? 0).toString()) ?? 0,
      matched: (json['matched'] ?? json['auto_matched_count'] ?? 0) is int
          ? (json['matched'] ?? json['auto_matched_count'] ?? 0)
          : int.tryParse((json['matched'] ?? json['auto_matched_count'] ?? 0).toString()) ?? 0,
      unmatched: (json['unmatched'] ?? json['unmatched_count'] ?? 0) is int
          ? (json['unmatched'] ?? json['unmatched_count'] ?? 0)
          : int.tryParse((json['unmatched'] ?? json['unmatched_count'] ?? 0).toString()) ?? 0,
      inProgress: (json['inProgress'] ?? json['in_progress'] ?? 0) is int
          ? (json['inProgress'] ?? json['in_progress'] ?? 0)
          : int.tryParse((json['inProgress'] ?? json['in_progress'] ?? 0).toString()) ?? 0,
      accounts: accountList,
    );
  }

  factory ReconciliationSummaryModel.fallback() {
    return ReconciliationSummaryModel(
      totalTransactions: 128,
      matched: 114,
      unmatched: 9,
      inProgress: 5,
      accounts: [
        ReconciliationAccountModel(
          id: 'acc-hdfc-01',
          name: 'HDFC Corporate Transit Collection',
          category: 'Transit Collection',
          accountNumber: '•••• •••• 9821',
          totalTxns: 48,
          matched: 45,
          unmatched: 3,
          ledgerBalance: '₹14,50,000',
          status: 'Reconciled',
        ),
        ReconciliationAccountModel(
          id: 'acc-icici-nodal',
          name: 'ICICI Bank Nodal Escrow Account',
          category: 'Nodal Escrow',
          accountNumber: '•••• •••• 4410',
          totalTxns: 36,
          matched: 34,
          unmatched: 2,
          ledgerBalance: '₹8,25,000',
          status: 'Reconciled',
        ),
        ReconciliationAccountModel(
          id: 'acc-razorpay-va',
          name: 'Razorpay Smart Collect Virtual Account',
          category: 'Virtual Gateway',
          accountNumber: 'VPA: vmovexa.collection@razorpay',
          totalTxns: 28,
          matched: 24,
          unmatched: 4,
          ledgerBalance: '₹4,80,000',
          status: 'Pending',
        ),
        ReconciliationAccountModel(
          id: 'acc-axis-payout',
          name: 'Axis Bank Corporate Operating & Payouts',
          category: 'Corporate Operating',
          accountNumber: '•••• •••• 1152',
          totalTxns: 16,
          matched: 11,
          unmatched: 5,
          ledgerBalance: '₹2,65,000',
          status: 'Pending',
        ),
      ],
    );
  }
}

class ReconciliationAccountModel {
  final String id;
  final String name;
  final String category;
  final String accountNumber;
  final int totalTxns;
  final int matched;
  final int unmatched;
  final String ledgerBalance;
  final String status;

  ReconciliationAccountModel({
    required this.id,
    required this.name,
    required this.category,
    required this.accountNumber,
    required this.totalTxns,
    required this.matched,
    required this.unmatched,
    required this.ledgerBalance,
    required this.status,
  });

  factory ReconciliationAccountModel.fromJson(Map<String, dynamic> json) {
    final balanceRaw = json['ledgerBalance'] ?? json['balance'] ?? 0;
    String formattedBalance;
    if (balanceRaw.toString().startsWith('₹')) {
      formattedBalance = balanceRaw.toString();
    } else {
      final numVal = double.tryParse(balanceRaw.toString()) ?? 0.0;
      formattedBalance = '₹${numVal.toStringAsFixed(2)}';
    }

    return ReconciliationAccountModel(
      id: (json['id'] ?? json['accountId'] ?? '').toString(),
      name: (json['name'] ?? json['accountName'] ?? 'Corporate Account').toString(),
      category: (json['category'] ?? json['accountType'] ?? 'Bank Account').toString(),
      accountNumber: (json['accountNumber'] ?? json['account_number'] ?? '•••• ••••').toString(),
      totalTxns: (json['totalTxns'] ?? json['total_txns'] ?? 0) is int
          ? (json['totalTxns'] ?? json['total_txns'] ?? 0)
          : int.tryParse((json['totalTxns'] ?? json['total_txns'] ?? 0).toString()) ?? 0,
      matched: (json['matched'] ?? 0) is int
          ? (json['matched'] ?? 0)
          : int.tryParse((json['matched'] ?? 0).toString()) ?? 0,
      unmatched: (json['unmatched'] ?? 0) is int
          ? (json['unmatched'] ?? 0)
          : int.tryParse((json['unmatched'] ?? 0).toString()) ?? 0,
      ledgerBalance: formattedBalance,
      status: (json['status'] ?? 'Reconciled').toString(),
    );
  }
}

class ReconciliationTransactionModel {
  final String id;
  final String date;
  final String refNumber;
  final String description;
  final double bankStatement;
  final double bookLedger;
  final double variance;
  final String status;
  final bool isMatched;

  ReconciliationTransactionModel({
    required this.id,
    required this.date,
    required this.refNumber,
    required this.description,
    required this.bankStatement,
    required this.bookLedger,
    required this.variance,
    required this.status,
    required this.isMatched,
  });

  factory ReconciliationTransactionModel.fromJson(Map<String, dynamic> json) {
    final statement = double.tryParse((json['bankStatement'] ?? json['statement_amount'] ?? 0).toString()) ?? 0.0;
    final ledger = double.tryParse((json['bookLedger'] ?? json['system_amount'] ?? 0).toString()) ?? 0.0;
    final variance = double.tryParse((json['variance'] ?? (statement - ledger)).toString()) ?? 0.0;
    final status = (json['status'] ?? (variance == 0.0 ? 'Matched' : 'Discrepancy')).toString();

    return ReconciliationTransactionModel(
      id: (json['id'] ?? '').toString(),
      date: (json['date'] ?? 'Recent').toString(),
      refNumber: (json['refNumber'] ?? json['ref_number'] ?? json['reference'] ?? 'TXN-001').toString(),
      description: (json['description'] ?? 'Transaction Entry').toString(),
      bankStatement: statement,
      bookLedger: ledger,
      variance: variance,
      status: status,
      isMatched: status == 'Matched' || (json['isMatched'] == true),
    );
  }

  static List<ReconciliationTransactionModel> fallbackList() {
    return [
      ReconciliationTransactionModel(
        id: 'txn-1',
        date: '27 Oct 2026',
        refNumber: 'TXN-9821-4821',
        description: 'Razorpay Escrow Transfer - Campaign Payout',
        bankStatement: 1420500.0,
        bookLedger: 1420500.0,
        variance: 0.0,
        status: 'Matched',
        isMatched: true,
      ),
      ReconciliationTransactionModel(
        id: 'txn-2',
        date: '26 Oct 2026',
        refNumber: 'TXN-9821-4819',
        description: 'HDFC Corporate Card Settlement - Fleet Fuel',
        bankStatement: 85400.0,
        bookLedger: 85400.0,
        variance: 0.0,
        status: 'Matched',
        isMatched: true,
      ),
      ReconciliationTransactionModel(
        id: 'txn-3',
        date: '25 Oct 2026',
        refNumber: 'TXN-9821-4812',
        description: 'Client Wire Deposit - Enterprise Media Campaign',
        bankStatement: 250000.0,
        bookLedger: 250000.0,
        variance: 0.0,
        status: 'Matched',
        isMatched: true,
      ),
      ReconciliationTransactionModel(
        id: 'txn-4',
        date: '24 Oct 2026',
        refNumber: 'TXN-9821-4805',
        description: 'Automated Tax Surcharge Adjustment',
        bankStatement: 12450.0,
        bookLedger: 12450.0,
        variance: 0.0,
        status: 'Matched',
        isMatched: true,
      ),
      ReconciliationTransactionModel(
        id: 'txn-5',
        date: '23 Oct 2026',
        refNumber: 'TXN-9821-4798',
        description: 'Bank Gateway Clearing Fee',
        bankStatement: 3200.0,
        bookLedger: 3200.0,
        variance: 0.0,
        status: 'Matched',
        isMatched: true,
      ),
    ];
  }
}

class ReconciliationCompletedData {
  final String accountName;
  final String period;
  final String balance;
  final String matchedRate;
  final String discrepancy;

  ReconciliationCompletedData({
    required this.accountName,
    required this.period,
    required this.balance,
    required this.matchedRate,
    required this.discrepancy,
  });

  factory ReconciliationCompletedData.fromJson(Map<String, dynamic> json, {String? defaultAccount}) {
    return ReconciliationCompletedData(
      accountName: (json['accountName'] ?? defaultAccount ?? 'HDFC Corporate Transit Collection').toString(),
      period: (json['period'] ?? 'October 2026').toString(),
      balance: (json['balance'] ?? '₹14,50,000').toString(),
      matchedRate: (json['matchedRate'] ?? '100%').toString(),
      discrepancy: (json['discrepancy'] ?? 'Zero Variance (Balanced)').toString(),
    );
  }
}
