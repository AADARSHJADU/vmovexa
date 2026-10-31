class VehicleSlotModel {
  final String id;
  final String slotCode;
  final String slotName;
  final String vehicleId;
  final String? busNumber;
  final String routeId;
  final String? routeName;
  final String? routeCode;
  final String? driverId;
  final String? driverName;
  final String shiftType;
  final String startTime;
  final String endTime;
  final String operatingDays;
  final int headwayMinutes;
  final String status;
  final String? notes;

  VehicleSlotModel({
    required this.id,
    required this.slotCode,
    required this.slotName,
    required this.vehicleId,
    this.busNumber,
    required this.routeId,
    this.routeName,
    this.routeCode,
    this.driverId,
    this.driverName,
    this.shiftType = 'morning_peak',
    this.startTime = '08:00',
    this.endTime = '11:30',
    this.operatingDays = 'Mon,Tue,Wed,Thu,Fri,Sat',
    this.headwayMinutes = 15,
    this.status = 'active',
    this.notes,
  });

  factory VehicleSlotModel.fromJson(Map<String, dynamic> json) {
    // Parse nested vehicle
    String? bNum;
    if (json['vehicle'] is Map) {
      final v = json['vehicle'] as Map;
      bNum = v['bus_number']?.toString() ?? v['registration_number']?.toString();
    } else {
      bNum = json['bus_number']?.toString() ?? json['vehicle_registration']?.toString();
    }

    // Parse nested route
    String? rName;
    String? rCode;
    if (json['route'] is Map) {
      final r = json['route'] as Map;
      rName = r['name']?.toString() ?? r['route_name']?.toString();
      rCode = r['code']?.toString() ?? r['route_code']?.toString();
    } else {
      rName = json['route_name']?.toString();
      rCode = json['route_code']?.toString();
    }

    // Parse nested driver
    String? dName;
    if (json['driver'] is Map) {
      final d = json['driver'] as Map;
      dName = d['name']?.toString() ?? d['full_name']?.toString();
    } else {
      dName = json['driver_name']?.toString();
    }

    final idVal = (json['id'] ?? json['_id'] ?? '').toString();
    final codeVal = json['slot_code']?.toString() ?? 'SLOT-$idVal';
    final nameVal = json['slot_name']?.toString() ?? 'Corridor Run #$idVal';

    return VehicleSlotModel(
      id: idVal,
      slotCode: codeVal,
      slotName: nameVal,
      vehicleId: (json['vehicle_id'] ?? json['vehicleId'] ?? '').toString(),
      busNumber: bNum,
      routeId: (json['route_id'] ?? json['routeId'] ?? '').toString(),
      routeName: rName,
      routeCode: rCode,
      driverId: (json['driver_id'] ?? json['driverId'])?.toString(),
      driverName: dName,
      shiftType: json['shift_type']?.toString().toLowerCase() ?? 'morning_peak',
      startTime: (json['start_time'] ?? '08:00').toString().substring(0, 5),
      endTime: (json['end_time'] ?? '11:30').toString().substring(0, 5),
      operatingDays: json['operating_days']?.toString() ?? 'Mon,Tue,Wed,Thu,Fri,Sat',
      headwayMinutes: json['headway_minutes'] is num ? (json['headway_minutes'] as num).toInt() : 15,
      status: json['status']?.toString().toLowerCase() ?? 'active',
      notes: json['notes']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slot_code': slotCode,
      'slot_name': slotName,
      'vehicle_id': vehicleId,
      'route_id': routeId,
      if (driverId != null) 'driver_id': driverId,
      'shift_type': shiftType,
      'start_time': startTime,
      'end_time': endTime,
      'operating_days': operatingDays,
      'headway_minutes': headwayMinutes,
      'status': status,
      if (notes != null) 'notes': notes,
    };
  }
}

class SlotConflictResult {
  final bool hasConflict;
  final String? message;
  final List<dynamic> overlappingSlots;

  SlotConflictResult({
    required this.hasConflict,
    this.message,
    this.overlappingSlots = const [],
  });

  factory SlotConflictResult.fromJson(Map<String, dynamic> json) {
    final conflict = json['hasConflict'] == true ||
        json['conflict'] == true ||
        json['has_conflict'] == true ||
        (json['overlappingSlots'] is List && (json['overlappingSlots'] as List).isNotEmpty);

    return SlotConflictResult(
      hasConflict: conflict,
      message: json['message']?.toString(),
      overlappingSlots: json['overlappingSlots'] is List
          ? json['overlappingSlots'] as List
          : (json['conflicts'] is List ? json['conflicts'] as List : []),
    );
  }
}

