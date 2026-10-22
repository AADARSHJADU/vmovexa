import 'dart:convert';

class ActivityLogModel {
  final String id;
  final String action;
  final String description;
  final String category;
  final String event;
  final String severity; // INFO, WARNING, CRITICAL
  final String actorName;
  final String actorEmail;
  final String actorRole;
  final String ipAddress;
  final String createdAt;
  final String timestamp;
  final Map<String, dynamic> rawPayload;

  ActivityLogModel({
    required this.id,
    this.action = '',
    this.description = '',
    this.category = 'System',
    this.event = 'action',
    this.severity = 'INFO',
    this.actorName = 'System',
    this.actorEmail = '',
    this.actorRole = 'Operator',
    this.ipAddress = '127.0.0.1',
    this.createdAt = '',
    this.timestamp = '',
    this.rawPayload = const {},
  });

  factory ActivityLogModel.fromJson(Map<String, dynamic> json) {
    // ID can be int or string
    final rawId = json['id'] ?? json['_id'] ?? '';
    final idStr = rawId.toString();

    final actionStr = (json['action'] ?? json['description'] ?? '').toString();
    final descStr = (json['description'] ?? json['action'] ?? '').toString();
    final catStr = (json['category'] ?? json['log_name'] ?? json['logName'] ?? 'System').toString();
    final eventStr = (json['event'] ?? 'action').toString();
    final sevStr = (json['severity'] ?? 'INFO').toString().toUpperCase();

    // Actor info can be nested in user/actor object or flat
    String actorName = 'System';
    String actorEmail = '';
    String actorRole = '';

    if (json['user'] is Map<String, dynamic>) {
      final u = json['user'] as Map<String, dynamic>;
      actorName = (u['name'] ?? u['fullName'] ?? u['username'] ?? 'System').toString();
      actorEmail = (u['email'] ?? '').toString();
      actorRole = (u['role'] ?? '').toString();
    } else if (json['actor'] is Map<String, dynamic>) {
      final a = json['actor'] as Map<String, dynamic>;
      actorName = (a['name'] ?? a['fullName'] ?? 'System').toString();
      actorEmail = (a['email'] ?? '').toString();
      actorRole = (a['role'] ?? '').toString();
    } else {
      actorName = (json['actorName'] ?? json['actor_name'] ?? json['userName'] ?? 'System').toString();
      actorEmail = (json['actorEmail'] ?? json['actor_email'] ?? json['userEmail'] ?? '').toString();
      actorRole = (json['actorRole'] ?? json['actor_role'] ?? json['role'] ?? '').toString();
    }

    final ip = (json['ipAddress'] ?? json['ip_address'] ?? json['ip'] ?? '127.0.0.1').toString();
    final created = (json['created_at'] ?? json['createdAt'] ?? json['timestamp'] ?? '').toString();
    final timeStr = (json['timestamp'] ?? json['created_at'] ?? json['createdAt'] ?? '').toString();

    // Raw payload properties
    Map<String, dynamic> payload = {};
    if (json['properties'] is Map<String, dynamic>) {
      payload = Map<String, dynamic>.from(json['properties'] as Map);
    } else if (json['payload'] is Map<String, dynamic>) {
      payload = Map<String, dynamic>.from(json['payload'] as Map);
    } else if (json['metadata'] is Map<String, dynamic>) {
      payload = Map<String, dynamic>.from(json['metadata'] as Map);
    } else {
      payload = Map<String, dynamic>.from(json);
    }

    return ActivityLogModel(
      id: idStr.isNotEmpty ? idStr : 'LOG-${DateTime.now().millisecondsSinceEpoch}',
      action: actionStr.isNotEmpty ? actionStr : descStr,
      description: descStr.isNotEmpty ? descStr : actionStr,
      category: catStr.isNotEmpty ? catStr : 'System',
      event: eventStr,
      severity: sevStr.isNotEmpty ? sevStr : 'INFO',
      actorName: actorName,
      actorEmail: actorEmail,
      actorRole: actorRole,
      ipAddress: ip,
      createdAt: created,
      timestamp: timeStr,
      rawPayload: payload,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'action': action,
      'description': description,
      'category': category,
      'event': event,
      'severity': severity,
      'actorName': actorName,
      'actorEmail': actorEmail,
      'actorRole': actorRole,
      'ipAddress': ipAddress,
      'createdAt': createdAt,
      'timestamp': timestamp,
      'rawPayload': rawPayload,
    };
  }

  String get formattedTime {
    if (createdAt.isEmpty && timestamp.isEmpty) return '—';
    try {
      final dt = DateTime.parse(createdAt.isNotEmpty ? createdAt : timestamp);
      final pad = (int n) => n.toString().padLeft(2, '0');
      return '${dt.year}-${pad(dt.month)}-${pad(dt.day)} ${pad(dt.hour)}:${pad(dt.minute)}';
    } catch (_) {
      return createdAt.isNotEmpty ? createdAt : timestamp;
    }
  }

  String get rawJsonString {
    try {
      const encoder = JsonEncoder.withIndent('  ');
      return encoder.convert(rawPayload);
    } catch (_) {
      return rawPayload.toString();
    }
  }
}

class ActivityLogsResult {
  final List<ActivityLogModel> items;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  ActivityLogsResult({
    required this.items,
    this.total = 0,
    this.page = 1,
    this.limit = 10,
    this.totalPages = 1,
  });

  factory ActivityLogsResult.fromJson(dynamic data) {
    List<ActivityLogModel> logs = [];
    int total = 0;
    int page = 1;
    int limit = 10;
    int totalPages = 1;

    if (data is List) {
      logs = data.map((x) => ActivityLogModel.fromJson(Map<String, dynamic>.from(x as Map))).toList();
      total = logs.length;
      totalPages = (total / limit).ceil().clamp(1, 99999);
    } else if (data is Map) {
      final map = Map<String, dynamic>.from(data);
      final rawList = map['items'] ?? map['rows'] ?? map['logs'] ?? map['data'];
      if (rawList is List) {
        logs = rawList.map((x) => ActivityLogModel.fromJson(Map<String, dynamic>.from(x as Map))).toList();
      }
      total = (map['total'] ?? map['count'] ?? logs.length) as int? ?? logs.length;
      page = (map['page'] ?? map['currentPage'] ?? 1) as int? ?? 1;
      limit = (map['limit'] ?? map['pageSize'] ?? 10) as int? ?? 10;
      totalPages = (map['totalPages'] ?? (total > 0 ? (total / limit).ceil() : 1)) as int? ?? 1;
    }

    return ActivityLogsResult(
      items: logs,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages > 0 ? totalPages : 1,
    );
  }
}

