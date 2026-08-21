import 'package:flutter/material.dart';

enum ReconciliationStatus { matched, unmatched, inProgress }

extension ReconciliationStatusX on ReconciliationStatus {
  String get label {
    switch (this) {
      case ReconciliationStatus.matched:
        return 'Matched';
      case ReconciliationStatus.unmatched:
        return 'Unmatched';
      case ReconciliationStatus.inProgress:
        return 'In Progress';
    }
  }

  Color get color {
    switch (this) {
      case ReconciliationStatus.matched:
        return const Color(0xFF10B981); // green
      case ReconciliationStatus.unmatched:
        return const Color(0xFFF59E0B); // orange
      case ReconciliationStatus.inProgress:
        return const Color(0xFF3B82F6); // blue
    }
  }
}

class ReconciliationSummaryCardModel {
  final String title;
  final String value;
  final String subtitle;
  final double percentage;
  final Color color;
  final IconData icon;

  const ReconciliationSummaryCardModel({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.percentage,
    required this.color,
    required this.icon,
  });
}

class ReconciliationItemModel {
  final String accountName;
  final String accountType;
  final String type;
  final ReconciliationStatus status;
  final String lastReconciled;
  final IconData icon;

  const ReconciliationItemModel({
    required this.accountName,
    required this.accountType,
    required this.type,
    required this.status,
    required this.lastReconciled,
    required this.icon,
  });
}

class ReconciliationInsightModel {
  final String title;
  final String value;
  final String changeText;
  final Color changeColor;
  final String subtitle;
  final IconData icon;

  const ReconciliationInsightModel({
    required this.title,
    required this.value,
    required this.changeText,
    required this.changeColor,
    required this.subtitle,
    required this.icon,
  });
}

class TransactionModel {
  final String date;
  final String description;
  final double systemAmount;
  final double statementAmount;
  final double variance;
  final ReconciliationStatus status;
  final bool isMatched;

  const TransactionModel({
    required this.date,
    required this.description,
    required this.systemAmount,
    required this.statementAmount,
    required this.variance,
    required this.status,
    required this.isMatched,
  });
}
