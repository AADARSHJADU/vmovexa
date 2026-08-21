import 'package:flutter/material.dart';
import 'package:get/get_rx/src/rx_types/rx_types.dart';

enum NotificationType { invoice, payment, subscription, report, gst }

class FinanceNotificationModel {
  final String id;
  final NotificationType type;
  final String title;
  final String description;
  final String time;
  final String dateGroup; // 'Today', 'Yesterday', '01 Aug 2026', etc.
  final RxBool isUnread;
  final IconData icon;
  final Color iconColor;
  final Color iconBgColor;

  FinanceNotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.time,
    required this.dateGroup,
    required bool isUnread,
    required this.icon,
    required this.iconColor,
    required this.iconBgColor,
  }) : this.isUnread = isUnread.obs;
}
