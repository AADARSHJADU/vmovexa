import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
        return const Color(0xFFFF5252);
      case NotificationCategory.update:
        return const Color(0xFF3F7BF5);
      case NotificationCategory.system:
        return const Color(0xFFFFA726);
    }
  }
}

class DriverNotification {
  final String id;
  final String title;
  final String message;
  final String severity; // 'critical', 'warning', 'info'
  final String type;
  final String createdAt;
  final String timeAgo;
  final IconData icon;
  final NotificationCategory category;
  final RxBool isRead;
  final String? actionUrl;
  final String? entityType;
  final String? entityId;
  final Map<String, dynamic> metadata;

  DriverNotification({
    required this.id,
    required this.title,
    required this.message,
    this.severity = 'info',
    this.type = 'Alerts',
    this.createdAt = '',
    required this.timeAgo,
    required this.icon,
    required this.category,
    bool isRead = false,
    this.actionUrl,
    this.entityType,
    this.entityId,
    this.metadata = const {},
  }) : isRead = isRead.obs;

  bool get isCritical => severity.toLowerCase() == 'critical';
  bool get isWarning => severity.toLowerCase() == 'warning';
  bool get isInfo => !isCritical && !isWarning;

  Color get severityColor {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'danger':
      case 'emergency':
      case 'error':
        return const Color(0xFFFF5252);
      case 'warning':
      case 'warn':
        return const Color(0xFFFFA726);
      case 'info':
      default:
        return const Color(0xFF3F7BF5);
    }
  }

  Color get severityBgColor {
    return severityColor.withValues(alpha: 0.15);
  }

  String get actionButtonText {
    final act = (actionUrl ?? '').toLowerCase();
    final et = (entityType ?? '').toLowerCase();
    final t = title.toLowerCase();
    final m = message.toLowerCase();

    if (act.contains('schedule') || et == 'shift' || et == 'schedule' || t.contains('shift') || t.contains('schedule') || t.contains('timetable') || m.contains('shift')) {
      return 'open_shift'.tr;
    }
    if (act.contains('route') || et == 'route' || et == 'trip' || t.contains('route') || t.contains('corridor') || t.contains('bus') || m.contains('route')) {
      return 'open_route'.tr;
    }
    if (act.contains('incident') || et == 'incident' || t.contains('incident') || t.contains('accident') || t.contains('breakdown') || m.contains('incident')) {
      return 'open_incident'.tr;
    }
    if (act.contains('work-order') || act.contains('work_order') || et == 'work_order' || t.contains('technician') || t.contains('work order') || t.contains('defect') || m.contains('work order')) {
      return 'open_work_order'.tr;
    }
    if (act.contains('ticket') || act.contains('support') || et == 'ticket' || t.contains('ticket') || t.contains('support') || m.contains('ticket')) {
      return 'open_ticket'.tr;
    }
    return 'tap_to_view'.tr;
  }

  factory DriverNotification.fromJson(Map<String, dynamic> json) {
    final idStr = (json['id'] ?? json['_id'] ?? 'notif_${DateTime.now().millisecondsSinceEpoch}').toString();
    final titleStr = (json['title'] ?? 'Notification').toString();
    final bodyStr = (json['message'] ?? json['body'] ?? json['text'] ?? '').toString();
    final sevStr = (json['severity'] ?? json['level'] ?? 'info').toString().toLowerCase();
    final typeStr = (json['type'] ?? json['category'] ?? json['event_key'] ?? 'Alerts').toString();
    final createdStr = (json['created_at'] ?? json['createdAt'] ?? json['timestamp'] ?? '').toString();

    final readAtStr = json['read_at']?.toString() ?? json['readAt']?.toString();
    final bool readBool = json['is_read'] == true ||
        json['isRead'] == true ||
        json['read'] == true ||
        (readAtStr != null && readAtStr.isNotEmpty);

    Map<String, dynamic> meta = {};
    if (json['metadata'] is Map) {
      meta = Map<String, dynamic>.from(json['metadata'] as Map);
    } else if (json['data'] is Map) {
      meta = Map<String, dynamic>.from(json['data'] as Map);
    }

    final actionUrlStr = meta['action_url']?.toString() ?? json['action_url']?.toString() ?? json['actionUrl']?.toString();
    final entityTypeStr = (meta['entity_type'] ?? meta['type'] ?? json['entity_type'] ?? '').toString().toLowerCase();
    final entityIdStr = (meta['entity_id'] ?? meta['id'] ?? json['entity_id'])?.toString();

    // Determine category & icon
    NotificationCategory category = NotificationCategory.update;
    if (['critical', 'danger', 'emergency', 'error'].contains(sevStr) || typeStr.toLowerCase().contains('alert')) {
      category = NotificationCategory.alert;
    } else if (typeStr.toLowerCase().contains('system') || typeStr.toLowerCase().contains('setting')) {
      category = NotificationCategory.system;
    }

    IconData iconData = Icons.notifications_active_outlined;
    final lowerTitle = titleStr.toLowerCase();
    final lowerBody = bodyStr.toLowerCase();

    if (lowerTitle.contains('shift') || lowerBody.contains('shift') || lowerTitle.contains('schedule') || entityTypeStr == 'shift' || entityTypeStr == 'schedule') {
      iconData = Icons.schedule_outlined;
    } else if (lowerTitle.contains('route') || lowerBody.contains('route') || lowerTitle.contains('bus') || entityTypeStr == 'route' || entityTypeStr == 'trip') {
      iconData = Icons.directions_bus_filled_outlined;
    } else if (lowerTitle.contains('incident') || lowerBody.contains('incident') || lowerTitle.contains('accident') || lowerTitle.contains('sos') || entityTypeStr == 'incident') {
      iconData = Icons.warning_amber_rounded;
    } else if (lowerTitle.contains('technician') || lowerBody.contains('technician') || lowerTitle.contains('work order') || lowerTitle.contains('defect') || entityTypeStr == 'work_order') {
      iconData = Icons.build_circle_outlined;
    } else if (lowerTitle.contains('ticket') || lowerBody.contains('ticket') || lowerTitle.contains('support') || entityTypeStr == 'ticket') {
      iconData = Icons.confirmation_number_outlined;
    } else if (lowerTitle.contains('document') || lowerBody.contains('document') || lowerTitle.contains('license') || lowerTitle.contains('kyc') || entityTypeStr == 'document') {
      iconData = Icons.description_outlined;
    } else if (category == NotificationCategory.alert) {
      iconData = Icons.warning_amber_rounded;
    }

    return DriverNotification(
      id: idStr,
      title: titleStr,
      message: bodyStr,
      severity: sevStr,
      type: typeStr,
      createdAt: createdStr,
      timeAgo: _formatRelativeTime(createdStr),
      icon: iconData,
      category: category,
      isRead: readBool,
      actionUrl: actionUrlStr,
      entityType: entityTypeStr.isNotEmpty ? entityTypeStr : null,
      entityId: entityIdStr,
      metadata: meta,
    );
  }

  static String _formatRelativeTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'Recently';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inSeconds < 60) {
        return 'Just now';
      } else if (diff.inMinutes < 60) {
        return '${diff.inMinutes}m ago';
      } else if (diff.inHours < 24) {
        return '${diff.inHours}h ago';
      } else if (diff.inDays == 1) {
        return 'Yesterday';
      } else if (diff.inDays < 7) {
        return '${diff.inDays}d ago';
      } else {
        return '${dt.day}/${dt.month}/${dt.year}';
      }
    } catch (_) {
      return 'Recently';
    }
  }
}
