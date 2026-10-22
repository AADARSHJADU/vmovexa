import 'package:get/get.dart';

class AppNotificationModel {
  final String id;
  final String title;
  final String body;
  final String severity; // 'CRITICAL', 'WARNING', 'INFO'
  final String type; // 'Alerts', 'Maintenance', 'Trips', 'System'
  final String createdAt;
  final String? readAt;
  final RxBool isRead;
  final Map<String, dynamic> metadata;

  AppNotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.severity = 'INFO',
    this.type = 'Alerts',
    this.createdAt = '',
    this.readAt,
    bool isRead = false,
    this.metadata = const {},
  }) : isRead = (isRead || (readAt != null && readAt.isNotEmpty)).obs;

  factory AppNotificationModel.fromJson(Map<String, dynamic> json) {
    final idStr = (json['id'] ?? json['_id'] ?? '').toString();
    final titleStr = (json['title'] ?? 'System Notification').toString();
    final bodyStr = (json['body'] ?? json['message'] ?? '').toString();
    final sevStr = (json['severity'] ?? json['level'] ?? 'INFO').toString().toUpperCase();
    final typeStr = (json['type'] ?? json['category'] ?? 'Alerts').toString();
    final createdStr = (json['created_at'] ?? json['createdAt'] ?? json['timestamp'] ?? '').toString();
    final readAtStr = json['read_at']?.toString() ?? json['readAt']?.toString();
    final bool readBool = json['is_read'] == true || json['isRead'] == true || json['read'] == true || (readAtStr != null && readAtStr.isNotEmpty);

    Map<String, dynamic> meta = {};
    if (json['metadata'] is Map<String, dynamic>) {
      meta = Map<String, dynamic>.from(json['metadata'] as Map);
    } else if (json['data'] is Map<String, dynamic>) {
      meta = Map<String, dynamic>.from(json['data'] as Map);
    }

    return AppNotificationModel(
      id: idStr.isNotEmpty ? idStr : 'NOTIF-${DateTime.now().millisecondsSinceEpoch}',
      title: titleStr,
      body: bodyStr,
      severity: sevStr.isNotEmpty ? sevStr : 'INFO',
      type: typeStr,
      createdAt: createdStr,
      readAt: readAtStr,
      isRead: readBool,
      metadata: meta,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'severity': severity,
      'type': type,
      'created_at': createdAt,
      'read_at': readAt,
      'is_read': isRead.value,
      'metadata': metadata,
    };
  }

  String get formattedTime {
    if (createdAt.isEmpty) return 'Just now';
    try {
      final dt = DateTime.parse(createdAt);
      String pad(int n) => n.toString().padLeft(2, '0');
      return '${dt.year}-${pad(dt.month)}-${pad(dt.day)} ${pad(dt.hour)}:${pad(dt.minute)}';
    } catch (_) {
      return createdAt;
    }
  }

  void markAsRead() {
    isRead.value = true;
  }
}
