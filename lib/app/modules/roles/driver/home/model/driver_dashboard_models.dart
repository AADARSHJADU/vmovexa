import 'package:flutter/material.dart';

enum ScheduleStatus { upcoming, pending, completed, inProgress }

extension ScheduleStatusX on ScheduleStatus {
  String get label {
    switch (this) {
      case ScheduleStatus.upcoming:
        return 'Upcoming';
      case ScheduleStatus.pending:
        return 'Pending';
      case ScheduleStatus.completed:
        return 'Completed';
      case ScheduleStatus.inProgress:
        return 'In Progress';
    }
  }

  Color get color {
    switch (this) {
      case ScheduleStatus.upcoming:
        return const Color(0xFF2ECC71);
      case ScheduleStatus.pending:
        return Colors.white38;
      case ScheduleStatus.completed:
        return const Color(0xFF3F7BF5);
      case ScheduleStatus.inProgress:
        return const Color(0xFFB042FF);
    }
  }
}

class ScheduleEntry {
  final String time;
  final String routeName;
  final String routeDescription;
  final ScheduleStatus status;

  ScheduleEntry({
    required this.time,
    required this.routeName,
    required this.routeDescription,
    required this.status,
  });
}

class OperationalNotification {
  final String id;
  final String message;
  final String subMessage;
  final String timeAgo;
  final String icon;
  final bool isUnread;

  OperationalNotification({
    required this.id,
    required this.message,
    required this.subMessage,
    required this.timeAgo,
    required this.icon,
    this.isUnread = true,
  });
}

class DriverQuickAction {
  final String title;
  final String icon;
  final Color color;
  final String route;
  final int? badgeCount;

  DriverQuickAction({
    required this.title,
    required this.icon,
    required this.color,
    required this.route,
    this.badgeCount,
  });
}
