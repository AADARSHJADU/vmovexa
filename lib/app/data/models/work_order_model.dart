class WorkOrderTechnician {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String certLevel;
  final bool isBusy;

  WorkOrderTechnician({
    this.id = '',
    this.name = 'Awaiting Dispatch',
    this.phone = '',
    this.email = '',
    this.certLevel = 'Central Field Technician',
    this.isBusy = false,
  });

  factory WorkOrderTechnician.fromJson(Map<String, dynamic> json) {
    return WorkOrderTechnician(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['full_name']?.toString() ?? 'Awaiting Dispatch',
      phone: json['phone']?.toString() ?? json['phone_number']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      certLevel: json['cert_level']?.toString() ?? json['role']?.toString() ?? 'Central Field Technician',
      isBusy: json['is_busy'] == true || json['isBusy'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'cert_level': certLevel,
    'is_busy': isBusy,
  };
}

class WorkOrderTimelineEntry {
  final String title;
  final String description;
  final String timestamp;
  final String status;

  WorkOrderTimelineEntry({
    required this.title,
    required this.description,
    required this.timestamp,
    required this.status,
  });

  factory WorkOrderTimelineEntry.fromJson(Map<String, dynamic> json) {
    return WorkOrderTimelineEntry(
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? json['notes']?.toString() ?? '',
      timestamp: json['timestamp']?.toString() ?? json['created_at']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
    );
  }
}

class WorkOrderModel {
  final String id;
  final String code;
  final String issueCategory;
  final String busNumber;
  final String? vehicleId;
  final String depotName;
  final String? depotId;
  final String urgency; // critical, high, normal, low
  final String status; // submitted, dispatched, on_site, resolved, closed, rejected
  final String description;
  final String? instructions;
  final String? slaDueAt;
  final String? requestedAt;
  final String? resolvedAt;
  final String? resolutionNotes;
  final WorkOrderTechnician? technician;
  final List<WorkOrderTimelineEntry> timeline;

  WorkOrderModel({
    required this.id,
    required this.code,
    this.issueCategory = 'Display Screen Glitch / HDMI Telemetry Sync',
    this.busNumber = '—',
    this.vehicleId,
    this.depotName = 'Central Maintenance Depot',
    this.depotId,
    this.urgency = 'normal',
    this.status = 'submitted',
    this.description = '',
    this.instructions,
    this.slaDueAt,
    this.requestedAt,
    this.resolvedAt,
    this.resolutionNotes,
    this.technician,
    this.timeline = const [],
  });

  factory WorkOrderModel.fromJson(Map<String, dynamic> json) {
    final idStr = json['id']?.toString() ?? '';
    final codeStr = json['code']?.toString() ??
        json['work_order_number']?.toString() ??
        json['workOrderNumber']?.toString() ??
        (idStr.isNotEmpty ? 'WO-${idStr.padLeft(4, '0')}' : 'WO-0001');

    WorkOrderTechnician? tech;
    if (json['technician'] is Map) {
      tech = WorkOrderTechnician.fromJson(Map<String, dynamic>.from(json['technician']));
    } else if (json['assignedTech'] is Map) {
      tech = WorkOrderTechnician.fromJson(Map<String, dynamic>.from(json['assignedTech']));
    } else if (json['technician_name'] != null || json['technicianName'] != null) {
      tech = WorkOrderTechnician(
        id: json['assigned_technician_id']?.toString() ?? '',
        name: (json['technician_name'] ?? json['technicianName']).toString(),
        phone: json['technician_phone']?.toString() ?? '',
      );
    }

    final rawTimeline = json['timeline'] ?? json['audit_trail'] ?? json['history'];
    List<WorkOrderTimelineEntry> timelineEntries = [];
    if (rawTimeline is List) {
      timelineEntries = rawTimeline
          .whereType<Map>()
          .map((item) => WorkOrderTimelineEntry.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }

    final busStr = json['bus_number']?.toString() ??
        json['busNumber']?.toString() ??
        json['vehicle']?['bus_number']?.toString() ??
        json['vehicle_registration']?.toString() ??
        '—';

    final depotStr = json['depot_name']?.toString() ??
        json['depotName']?.toString() ??
        json['depot']?['name']?.toString() ??
        'Main Depot';

    final issueStr = json['issue_category']?.toString() ??
        json['issueCategory']?.toString() ??
        json['title']?.toString() ??
        'Display Screen Glitch / HDMI Telemetry Sync';

    final urgStr = (json['urgency'] ?? json['priority'] ?? 'normal').toString().toLowerCase();
    final statStr = (json['status'] ?? 'submitted').toString().toLowerCase();

    return WorkOrderModel(
      id: idStr,
      code: codeStr,
      issueCategory: issueStr,
      busNumber: busStr,
      vehicleId: json['vehicle_id']?.toString() ?? json['vehicleId']?.toString(),
      depotName: depotStr,
      depotId: json['depot_id']?.toString() ?? json['depotId']?.toString(),
      urgency: urgStr,
      status: statStr,
      description: json['description']?.toString() ?? json['issue_details']?.toString() ?? '',
      instructions: json['instructions']?.toString(),
      slaDueAt: json['sla_due_at']?.toString() ?? json['slaDueAt']?.toString(),
      requestedAt: json['requested_at']?.toString() ??
          json['requestedAt']?.toString() ??
          json['created_at']?.toString(),
      resolvedAt: json['resolved_at']?.toString() ?? json['completed_at']?.toString(),
      resolutionNotes: json['resolution_notes']?.toString(),
      technician: tech,
      timeline: timelineEntries,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'issueCategory': issueCategory,
    'busNumber': busNumber,
    'vehicleId': vehicleId,
    'depotName': depotName,
    'depotId': depotId,
    'urgency': urgency,
    'status': status,
    'description': description,
    'instructions': instructions,
    'slaDueAt': slaDueAt,
    'requestedAt': requestedAt,
    'resolvedAt': resolvedAt,
    'resolutionNotes': resolutionNotes,
    'technician': technician?.toJson(),
  };

  WorkOrderModel copyWith({
    String? id,
    String? code,
    String? issueCategory,
    String? busNumber,
    String? vehicleId,
    String? depotName,
    String? depotId,
    String? urgency,
    String? status,
    String? description,
    String? instructions,
    String? slaDueAt,
    String? requestedAt,
    String? resolvedAt,
    String? resolutionNotes,
    WorkOrderTechnician? technician,
    List<WorkOrderTimelineEntry>? timeline,
  }) {
    return WorkOrderModel(
      id: id ?? this.id,
      code: code ?? this.code,
      issueCategory: issueCategory ?? this.issueCategory,
      busNumber: busNumber ?? this.busNumber,
      vehicleId: vehicleId ?? this.vehicleId,
      depotName: depotName ?? this.depotName,
      depotId: depotId ?? this.depotId,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      description: description ?? this.description,
      instructions: instructions ?? this.instructions,
      slaDueAt: slaDueAt ?? this.slaDueAt,
      requestedAt: requestedAt ?? this.requestedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      resolutionNotes: resolutionNotes ?? this.resolutionNotes,
      technician: technician ?? this.technician,
      timeline: timeline ?? this.timeline,
    );
  }
}
