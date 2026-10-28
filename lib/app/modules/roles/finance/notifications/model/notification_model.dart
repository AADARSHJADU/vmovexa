import 'package:flutter/material.dart';
import 'package:get/get.dart';

class FinanceNotificationModel {
  final String id;
  final String title;
  final String description;
  final String category; // 'Invoices', 'Payments', 'Subscriptions', 'System'
  final String time;
  final String dateGroup;
  final RxBool isUnread;

  FinanceNotificationModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.time,
    required this.dateGroup,
    required bool isUnread,
  }) : isUnread = isUnread.obs;

  factory FinanceNotificationModel.fromJson(Map<String, dynamic> json) {
    final catRaw = (json['category'] ?? 'System').toString();
    String cat = 'System';
    if (catRaw.toLowerCase().contains('inv')) {
      cat = 'Invoices';
    } else if (catRaw.toLowerCase().contains('pay')) {
      cat = 'Payments';
    } else if (catRaw.toLowerCase().contains('sub')) {
      cat = 'Subscriptions';
    }

    final createdAtStr = json['created_at']?.toString() ?? json['createdAt']?.toString();
    String formattedTime = 'Just now';
    String group = 'Today';

    if (createdAtStr != null && createdAtStr.isNotEmpty) {
      try {
        final dt = DateTime.parse(createdAtStr).toLocal();
        final now = DateTime.now();
        final diff = now.difference(dt);
        if (diff.inDays == 0 && now.day == dt.day) {
          group = 'Today';
          final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
          final amPm = dt.hour >= 12 ? 'PM' : 'AM';
          final min = dt.minute.toString().padLeft(2, '0');
          formattedTime = '$hour:$min $amPm';
        } else if (diff.inDays <= 1 || (now.day - dt.day == 1)) {
          group = 'Yesterday';
          final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
          final amPm = dt.hour >= 12 ? 'PM' : 'AM';
          final min = dt.minute.toString().padLeft(2, '0');
          formattedTime = 'Yesterday, $hour:$min $amPm';
        } else {
          group = '${dt.day} ${_monthName(dt.month)} ${dt.year}';
          formattedTime = group;
        }
      } catch (_) {
        formattedTime = createdAtStr;
      }
    }

    final read = json['is_read'] == true || json['read'] == true;

    return FinanceNotificationModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Notification',
      description: json['body']?.toString() ?? json['message']?.toString() ?? json['description']?.toString() ?? '',
      category: cat,
      time: formattedTime,
      dateGroup: group,
      isUnread: !read,
    );
  }

  static String _monthName(int month) {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (month >= 1 && month <= 12) ? m[month - 1] : '';
  }

  IconData get icon {
    switch (category) {
      case 'Invoices':
        return Icons.description_outlined;
      case 'Payments':
        return Icons.currency_exchange_outlined;
      case 'Subscriptions':
        return Icons.card_membership_outlined;
      default:
        return Icons.notifications_none_outlined;
    }
  }

  Color get iconColor {
    switch (category) {
      case 'Invoices':
        return const Color(0xFF60A5FA);
      case 'Payments':
        return const Color(0xFF34D399);
      case 'Subscriptions':
        return const Color(0xFFC084FC);
      default:
        return const Color(0xFF94A3B8);
    }
  }
}
