import 'package:flutter/material.dart';

enum SubscriptionStatus { active, expiringSoon, inactive }

extension SubscriptionStatusX on SubscriptionStatus {
  String get label {
    switch (this) {
      case SubscriptionStatus.active:
        return 'Active';
      case SubscriptionStatus.expiringSoon:
        return 'Expiring Soon';
      case SubscriptionStatus.inactive:
        return 'Inactive';
    }
  }

  Color get color {
    switch (this) {
      case SubscriptionStatus.active:
        return const Color(0xFF2ECC71);
      case SubscriptionStatus.expiringSoon:
        return const Color(0xFFFFA726);
      case SubscriptionStatus.inactive:
        return const Color(0xFFFF4D4D);
    }
  }
}

class Subscription {
  final String id;
  final String subscriptionCode; // "SUB-2026-00024"
  final String companyName;
  final String initials;
  final Color avatarColor;
  final String planName;
  final SubscriptionStatus status;
  final String dateRangeText;
  final int userCount;

  Subscription({
    required this.id,
    required this.subscriptionCode,
    required this.companyName,
    required this.initials,
    required this.avatarColor,
    required this.planName,
    required this.status,
    required this.dateRangeText,
    required this.userCount,
  });
}
