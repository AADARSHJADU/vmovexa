import 'package:flutter/material.dart';

/// Top summary stat card (Offline / Online / Issues)
class DeviceStat {
  final String count;
  final String title;
  final String subtitle;
  final Color color;
  final IconData icon;

  DeviceStat({
    required this.count,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.icon,
  });
}

/// Quick Action grid item (Display Devices, Hardware Configuration, etc.)
class QuickAction {
  final String title;
  final String subtitle;
  final String icon;
  final Color color;
  final String route;

  QuickAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

enum TaskStatus { pending, inProgress, completed }

/// Today's Task list item
class DashboardTask {
  final String id;
  final String title;
  final String subtitle;

  // SVG asset path
  final String icon;

  final Color iconColor;
  TaskStatus status;

  DashboardTask({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.status,
  });

  String get statusLabel {
    switch (status) {
      case TaskStatus.pending:
        return 'Pending';

      case TaskStatus.inProgress:
        return 'In Progress';

      case TaskStatus.completed:
        return 'Completed';
    }
  }

  Color get statusColor {
    switch (status) {
      case TaskStatus.pending:
        return const Color(0xFF7C6FF0);

      case TaskStatus.inProgress:
        return const Color(0xFF3FA9F5);

      case TaskStatus.completed:
        return const Color(0xFF2ECC71);
    }
  }
}
