import 'package:flutter/material.dart';

// ---------------- Financial Overview stat ----------------
class FinancialStat {
  final String label;
  final String value;
  final double trendPercent;
  final bool isPositive;
  final IconData icon;
  final Color color;

  FinancialStat({
    required this.label,
    required this.value,
    required this.trendPercent,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}

// ---------------- Quick Action ----------------
class FinanceQuickAction {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;

  FinanceQuickAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

// ---------------- Key Insight row ----------------
class KeyInsight {
  final String title;
  final String subtitle; // "vs last month"
  final String value;
  final double trendPercent;
  final bool isPositive;
  final IconData icon;
  final Color color;

  KeyInsight({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.trendPercent,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}
