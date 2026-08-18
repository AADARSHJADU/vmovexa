import 'package:flutter/material.dart';

enum NotificationCategory { alert, update, system }

extension NotificationCategoryX on NotificationCategory {
  String get label {
    switch (this) {
      case NotificationCategory.alert:
        return 'Alert';
      case NotificationCategory.update:
        return 'Update';
      case NotificationCategory.system:
        return 'System';
    }
  }

  Color get color {
    switch (this) {
      case NotificationCategory.alert:
        return const Color(0xFFFFA726);
      case NotificationCategory.update:
        return const Color(0xFF3F7BF5);
      case NotificationCategory.system:
        return const Color(0xFFB042FF);
    }
  }
}

class DriverNotification {
  final String id;
  final String title;
  final String message;
  final String timeAgo;
  final IconData icon;
  final NotificationCategory category;
  bool isRead;

  DriverNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timeAgo,
    required this.icon,
    required this.category,
    this.isRead = false,
  });
}
