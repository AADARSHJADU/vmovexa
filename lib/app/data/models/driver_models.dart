// lib/app/data/models/driver_models.dart

class AssignedVehicle {
  final String? id;
  final String? registrationNumber;
  final String? make;
  final String? model;

  AssignedVehicle({
    this.id,
    this.registrationNumber,
    this.make,
    this.model,
  });

  factory AssignedVehicle.fromJson(Map<String, dynamic>? json) {
    if (json == null) return AssignedVehicle();
    return AssignedVehicle(
      id: json['id']?.toString(),
      registrationNumber: json['registration_number']?.toString(),
      make: json['make']?.toString(),
      model: json['model']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'registration_number': registrationNumber,
    'make': make,
    'model': model,
  };

  String get displayName {
    if (registrationNumber != null && registrationNumber!.isNotEmpty) {
      if (make != null && make!.isNotEmpty) {
        return '$registrationNumber ($make ${model ?? ""})'.trim();
      }
      return registrationNumber!;
    }
    return 'Not Assigned';
  }
}

class DriverOrganization {
  final String? id;
  final String? name;

  DriverOrganization({this.id, this.name});

  factory DriverOrganization.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverOrganization();
    return DriverOrganization(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
  };
}

class DriverProfileData {
  final String? id;
  final String? name;
  final String? phone;
  final String? email;
  final String? licenseNumber;
  final String? licenseExpiry;
  final String? licenseType;
  final String? address;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final String? dutyStatus; // 'on_duty', 'off_duty', 'on_break'
  final String? status; // 'active', etc.
  final AssignedVehicle? assignedVehicle;
  final DriverOrganization? organization;
  final String? joinedAt;
  final String? avatarUrl;
  final bool? documentsVerified;
  final bool? verified;
  final bool? kycRejected;

  DriverProfileData({
    this.id,
    this.name,
    this.phone,
    this.email,
    this.licenseNumber,
    this.licenseExpiry,
    this.licenseType,
    this.address,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.dutyStatus,
    this.status,
    this.assignedVehicle,
    this.organization,
    this.joinedAt,
    this.avatarUrl,
    this.documentsVerified,
    this.verified,
    this.kycRejected,
  });

  factory DriverProfileData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverProfileData();
    final rawDocsVerified = json['documents_verified'] ?? json['documentsVerified'];
    final bool? docsVerified = rawDocsVerified != null
        ? (rawDocsVerified == true || rawDocsVerified == 1 || rawDocsVerified.toString() == 'true')
        : (json['verified'] != null
            ? (json['verified'] == true || json['verified'] == 1 || json['verified'].toString() == 'true')
            : null);
    final isVerified = docsVerified ?? (json['is_verified'] == true || json['is_verified'] == 1 || json['is_verified']?.toString() == 'true');
    final isKycRej = json['kyc_rejected'] == true ||
        json['kycRejected'] == true ||
        json['kyc_rejected'] == 1 ||
        json['kyc_rejected']?.toString() == 'true';

    return DriverProfileData(
      id: json['id']?.toString(),
      name: json['name']?.toString() ?? json['full_name']?.toString(),
      phone: json['phone']?.toString(),
      email: json['email']?.toString(),
      licenseNumber: json['license_number']?.toString(),
      licenseExpiry: json['license_expiry']?.toString(),
      licenseType: json['license_type']?.toString(),
      address: json['address']?.toString(),
      emergencyContactName: json['emergency_contact_name']?.toString(),
      emergencyContactPhone: json['emergency_contact_phone']?.toString(),
      dutyStatus: json['duty_status']?.toString() ?? 'off_duty',
      status: json['status']?.toString() ?? 'active',
      assignedVehicle: json['assigned_vehicle'] is Map
          ? AssignedVehicle.fromJson(Map<String, dynamic>.from(json['assigned_vehicle']))
          : null,
      organization: json['organization'] is Map
          ? DriverOrganization.fromJson(Map<String, dynamic>.from(json['organization']))
          : null,
      joinedAt: json['joined_at']?.toString(),
      avatarUrl: json['avatar_url']?.toString() ?? json['avatar']?.toString(),
      documentsVerified: isVerified,
      verified: isVerified,
      kycRejected: isKycRej,
    );
  }

  bool get isOnDuty => dutyStatus == 'on_duty';
}

class DriverShiftData {
  final String? startTime;
  final String? endTime;
  final String? shiftType;

  DriverShiftData({this.startTime, this.endTime, this.shiftType});

  factory DriverShiftData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverShiftData();
    return DriverShiftData(
      startTime: json['start_time']?.toString(),
      endTime: json['end_time']?.toString(),
      shiftType: json['shift_type']?.toString(),
    );
  }
}

class AssignedRouteBrief {
  final String? id;
  final String? name;
  final String? routeNumber;
  final String? fromStop;
  final String? toStop;

  AssignedRouteBrief({
    this.id,
    this.name,
    this.routeNumber,
    this.fromStop,
    this.toStop,
  });

  factory AssignedRouteBrief.fromJson(Map<String, dynamic>? json) {
    if (json == null) return AssignedRouteBrief();
    return AssignedRouteBrief(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      routeNumber: json['route_number']?.toString(),
      fromStop: json['from_stop']?.toString(),
      toStop: json['to_stop']?.toString(),
    );
  }
}

class UpcomingTripItem {
  final String? id;
  final String? scheduledDeparture;
  final String? fromStop;
  final String? toStop;
  final String? status; // 'pending', 'in_progress', 'completed'

  UpcomingTripItem({
    this.id,
    this.scheduledDeparture,
    this.fromStop,
    this.toStop,
    this.status,
  });

  factory UpcomingTripItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return UpcomingTripItem();
    return UpcomingTripItem(
      id: json['id']?.toString(),
      scheduledDeparture: json['scheduled_departure']?.toString(),
      fromStop: json['from_stop']?.toString(),
      toStop: json['to_stop']?.toString(),
      status: json['status']?.toString() ?? 'pending',
    );
  }
}

class DriverShiftItem {
  final String? id;
  final String? slotId;
  final String? slotCode;
  final String? routeNumber;
  final String? routeName;
  final String? busNumber;
  final String? shiftTypeLabel;
  final String? startTime;
  final String? endTime;
  final String? date;
  final String? startDepot;
  final String? endDepot;
  final String? distance;
  final String? duration;
  final String? frequency;
  final String? tripLabel;
  final String? status;
  final bool isCompleted;
  final bool isInTransit;
  final bool isToday;

  DriverShiftItem({
    this.id,
    this.slotId,
    this.slotCode,
    this.routeNumber,
    this.routeName,
    this.busNumber,
    this.shiftTypeLabel,
    this.startTime,
    this.endTime,
    this.date,
    this.startDepot,
    this.endDepot,
    this.distance,
    this.duration,
    this.frequency,
    this.tripLabel,
    this.status,
    this.isCompleted = false,
    this.isInTransit = false,
    this.isToday = true,
  });

  factory DriverShiftItem.fromJson(Map<String, dynamic> json) {
    final statusStr = json['status']?.toString() ?? 'Scheduled';
    final isComp = json['isCompleted'] == true || statusStr.toLowerCase() == 'completed';
    final isTransit = statusStr.toLowerCase() == 'in transit' || statusStr.toLowerCase() == 'in_progress';
    final dateStr = json['date']?.toString() ?? 'Today';
    final isTodayVal = json['isToday'] == true || dateStr.toLowerCase().contains('today');

    return DriverShiftItem(
      id: json['id']?.toString(),
      slotId: json['slot_id']?.toString() ?? json['slotId']?.toString(),
      slotCode: json['slot_code']?.toString() ?? json['slotCode']?.toString(),
      routeNumber: json['route_number']?.toString() ?? json['routeNumber']?.toString() ?? (json['route'] is Map ? json['route']['code']?.toString() : null) ?? '—',
      routeName: json['route_name']?.toString() ?? json['routeName']?.toString() ?? (json['route'] is Map ? json['route']['name']?.toString() : null),
      busNumber: json['bus_number']?.toString() ?? json['busNumber']?.toString() ?? (json['vehicle'] is Map ? json['vehicle']['bus_number']?.toString() : null) ?? '—',
      shiftTypeLabel: json['shift_type_label']?.toString() ?? json['shiftTypeLabel']?.toString() ?? json['shift_type']?.toString(),
      startTime: json['startTime']?.toString() ?? json['shift_start']?.toString() ?? json['start_time']?.toString() ?? json['departureTime']?.toString() ?? '—',
      endTime: json['endTime']?.toString() ?? json['shift_end']?.toString() ?? json['end_time']?.toString() ?? '—',
      date: dateStr,
      startDepot: json['startDepot']?.toString() ?? json['start_depot']?.toString() ?? json['from_stop']?.toString() ?? json['origin']?.toString() ?? '—',
      endDepot: json['endDepot']?.toString() ?? json['end_depot']?.toString() ?? json['to_stop']?.toString() ?? json['destination']?.toString() ?? '—',
      distance: json['distance']?.toString() ?? (json['distance_km'] != null ? '${json['distance_km']} km' : null),
      duration: json['duration']?.toString(),
      frequency: json['frequency']?.toString() ?? json['headway']?.toString() ?? '15 mins',
      tripLabel: json['trip_label']?.toString() ?? json['tripLabel']?.toString(),
      status: statusStr,
      isCompleted: isComp,
      isInTransit: isTransit,
      isToday: isTodayVal,
    );
  }
}

class DriverScheduleData {
  final String? date;
  final DriverShiftData? shift;
  final AssignedRouteBrief? assignedRoute;
  final List<UpcomingTripItem> upcomingTrips;
  final List<DriverShiftItem> schedules;
  final int totalCount;
  final int todayCount;
  final int upcomingCount;

  DriverScheduleData({
    this.date,
    this.shift,
    this.assignedRoute,
    this.upcomingTrips = const [],
    this.schedules = const [],
    this.totalCount = 0,
    this.todayCount = 0,
    this.upcomingCount = 0,
  });

  factory DriverScheduleData.fromJson(dynamic json) {
    if (json == null) return DriverScheduleData();
    if (json is List) {
      final items = json
          .whereType<Map>()
          .map((e) => DriverShiftItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return DriverScheduleData(
        schedules: items,
        totalCount: items.length,
        todayCount: items.where((s) => s.isToday).length,
        upcomingCount: items.where((s) => !s.isToday).length,
      );
    }
    if (json is! Map) return DriverScheduleData();

    final map = Map<String, dynamic>.from(json);

    List<DriverShiftItem> shifts = [];
    final rawList = map['schedules'] ?? map['items'] ?? map['rows'] ?? map['shifts'] ?? (map['data'] is List ? map['data'] : null);
    if (rawList is List) {
      shifts = rawList
          .whereType<Map>()
          .map((e) => DriverShiftItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }

    final total = int.tryParse(map['total']?.toString() ?? '') ??
        int.tryParse(map['count']?.toString() ?? '') ??
        shifts.length;
    final tCount = int.tryParse(map['todayCount']?.toString() ?? '') ??
        shifts.where((s) => s.isToday).length;
    final uCount = int.tryParse(map['upcomingCount']?.toString() ?? '') ??
        shifts.where((s) => !s.isToday).length;

    return DriverScheduleData(
      date: map['date']?.toString(),
      shift: map['shift'] is Map
          ? DriverShiftData.fromJson(Map<String, dynamic>.from(map['shift']))
          : null,
      assignedRoute: map['assigned_route'] is Map
          ? AssignedRouteBrief.fromJson(Map<String, dynamic>.from(map['assigned_route']))
          : null,
      upcomingTrips: map['upcoming_trips'] is List
          ? (map['upcoming_trips'] as List)
              .map((e) => UpcomingTripItem.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : [],
      schedules: shifts,
      totalCount: total,
      todayCount: tCount,
      upcomingCount: uCount,
    );
  }
}

class RouteStopDetail {
  final String? id;
  final String? name;
  final String? type;
  final bool passed;
  final String? eta;
  final String? distance;
  final double? lat;
  final double? lng;
  final int? order;

  RouteStopDetail({
    this.id,
    this.name,
    this.type,
    this.passed = false,
    this.eta,
    this.distance,
    this.lat,
    this.lng,
    this.order,
  });

  factory RouteStopDetail.fromJson(Map<String, dynamic>? json) {
    if (json == null) return RouteStopDetail();
    return RouteStopDetail(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      type: json['type']?.toString(),
      passed: json['passed'] == true,
      eta: json['eta']?.toString(),
      distance: json['distance']?.toString(),
      lat: json['lat'] != null ? (json['lat'] as num).toDouble() : null,
      lng: json['lng'] != null ? (json['lng'] as num).toDouble() : null,
      order: json['order'] != null ? (json['order'] as num).toInt() : null,
    );
  }
}

class ActiveRouteInfo {
  final String? id;
  final String? name;
  final String? routeNumber;
  final List<RouteStopDetail> stops;

  ActiveRouteInfo({this.id, this.name, this.routeNumber, this.stops = const []});

  factory ActiveRouteInfo.fromJson(Map<String, dynamic>? json) {
    if (json == null) return ActiveRouteInfo();
    return ActiveRouteInfo(
      id: json['id']?.toString() ?? json['tripId']?.toString(),
      name: json['name']?.toString() ?? json['routeName']?.toString() ?? json['route_name']?.toString(),
      routeNumber: json['route_number']?.toString() ?? json['routeNumber']?.toString(),
      stops: json['stops'] is List
          ? (json['stops'] as List)
              .map((e) => RouteStopDetail.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : [],
    );
  }
}

class DriverSlotModel {
  final int? id;
  final String? slotCode;
  final String? shiftType;
  final String? shiftTypeLabel;
  final String? status;
  final bool isInProgress;
  final bool isCompleted;
  final String? busNumber;
  final String? vehicleModel;
  final String? routeName;
  final String? routeCode;
  final String? startPoint;
  final String? endPoint;
  final String? timeWindow;
  final String? formattedStartTime;
  final String? formattedEndTime;
  final String? duration;
  final dynamic distanceKm;

  DriverSlotModel({
    this.id,
    this.slotCode,
    this.shiftType,
    this.shiftTypeLabel,
    this.status,
    this.isInProgress = false,
    this.isCompleted = false,
    this.busNumber,
    this.vehicleModel,
    this.routeName,
    this.routeCode,
    this.startPoint,
    this.endPoint,
    this.timeWindow,
    this.formattedStartTime,
    this.formattedEndTime,
    this.duration,
    this.distanceKm,
  });

  factory DriverSlotModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverSlotModel();
    final rawStatus = (json['rawStatus'] ?? json['status'] ?? '').toString().toLowerCase();
    final inProg = json['isInProgress'] == true || rawStatus == 'in_progress' || rawStatus == 'in transit';
    final comp = json['isCompleted'] == true || rawStatus == 'completed';

    return DriverSlotModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? ''),
      slotCode: json['slot_code']?.toString() ?? json['slotCode']?.toString(),
      shiftType: json['shift_type']?.toString() ?? json['shiftType']?.toString(),
      shiftTypeLabel: json['shift_type_label']?.toString() ?? json['shiftTypeLabel']?.toString(),
      status: json['status']?.toString(),
      isInProgress: inProg,
      isCompleted: comp,
      busNumber: json['bus_number']?.toString() ?? json['busNumber']?.toString(),
      vehicleModel: json['vehicle_model']?.toString() ?? json['vehicleModel']?.toString(),
      routeName: json['route_name']?.toString() ?? json['routeName']?.toString(),
      routeCode: json['route_code']?.toString() ?? json['routeCode']?.toString(),
      startPoint: json['start_point']?.toString() ?? json['startPoint']?.toString(),
      endPoint: json['end_point']?.toString() ?? json['endPoint']?.toString(),
      timeWindow: json['time_window']?.toString() ?? json['timeWindow']?.toString(),
      formattedStartTime: json['formatted_start_time']?.toString() ?? json['formattedStartTime']?.toString() ?? json['start_time']?.toString(),
      formattedEndTime: json['formatted_end_time']?.toString() ?? json['formattedEndTime']?.toString() ?? json['end_time']?.toString(),
      duration: json['duration']?.toString(),
      distanceKm: json['distance_km'] ?? json['distanceKm'],
    );
  }
}

class DriverVehicleModel {
  final String? busNumber;
  final String? plateNumber;
  final String? model;
  final String? vehicleType;
  final dynamic capacity;
  final String? code;
  final DriverDepotModel? depot;
  final DriverFleetModel? fleet;

  DriverVehicleModel({
    this.busNumber,
    this.plateNumber,
    this.model,
    this.vehicleType,
    this.capacity,
    this.code,
    this.depot,
    this.fleet,
  });

  factory DriverVehicleModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverVehicleModel();
    return DriverVehicleModel(
      busNumber: json['bus_number']?.toString() ?? json['busNumber']?.toString() ?? json['registration_number']?.toString(),
      plateNumber: json['plate_number']?.toString() ?? json['registration_number']?.toString(),
      model: json['model']?.toString(),
      vehicleType: json['vehicle_type']?.toString() ?? json['type']?.toString(),
      capacity: json['capacity'],
      code: json['code']?.toString(),
      depot: json['depot'] is Map ? DriverDepotModel.fromJson(Map<String, dynamic>.from(json['depot'])) : null,
      fleet: json['fleet'] is Map ? DriverFleetModel.fromJson(Map<String, dynamic>.from(json['fleet'])) : null,
    );
  }
}

class DriverDepotModel {
  final String? name;
  final String? code;

  DriverDepotModel({this.name, this.code});

  factory DriverDepotModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverDepotModel();
    return DriverDepotModel(
      name: json['name']?.toString(),
      code: json['code']?.toString(),
    );
  }
}

class DriverFleetModel {
  final String? name;
  final String? code;

  DriverFleetModel({this.name, this.code});

  factory DriverFleetModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverFleetModel();
    return DriverFleetModel(
      name: json['name']?.toString(),
      code: json['code']?.toString(),
    );
  }
}

class DriverActiveRouteData {
  final String? tripId;
  final ActiveRouteInfo? route;
  final int currentStopIndex;
  final String? tripStartedAt;
  final int passengersOnboard;

  // Rich fields from activeTrip
  final String? routeName;
  final String? routeNumber;
  final String? busNumber;
  final String? vehicleCode;
  final String? vehicleType;
  final String? status;
  final String? rawStatus;
  final String? batteryState;
  final String? fuelLevel;
  final String? routeType;
  final String? frequency;
  final String? passengersEstimate;
  final String? departureTime;
  final String? endTime;
  final String? totalDistance;
  final String? origin;
  final String? destination;
  final String? nextStop;
  final String? nextStopEta;
  final List<RouteStopDetail> stops;

  // Additional nested rich fields from activeRoute & shift slots
  final List<DriverSlotModel> todaySlots;
  final DriverSlotModel? selectedSlot;
  final DriverSlotModel? slot;
  final DriverVehicleModel? assignedBus;
  final DriverVehicleModel? vehicle;
  final DriverDepotModel? depot;
  final DriverFleetModel? fleet;
  final String? startedAtFormatted;
  final String? endedAtFormatted;
  final String? duration;
  final dynamic coveredKm;
  final String? tripCode;

  DriverActiveRouteData({
    this.tripId,
    this.route,
    this.currentStopIndex = 0,
    this.tripStartedAt,
    this.passengersOnboard = 0,
    this.routeName,
    this.routeNumber,
    this.busNumber,
    this.vehicleCode,
    this.vehicleType,
    this.status,
    this.rawStatus,
    this.batteryState,
    this.fuelLevel,
    this.routeType,
    this.frequency,
    this.passengersEstimate,
    this.departureTime,
    this.endTime,
    this.totalDistance,
    this.origin,
    this.destination,
    this.nextStop,
    this.nextStopEta,
    this.stops = const [],
    this.todaySlots = const [],
    this.selectedSlot,
    this.slot,
    this.assignedBus,
    this.vehicle,
    this.depot,
    this.fleet,
    this.startedAtFormatted,
    this.endedAtFormatted,
    this.duration,
    this.coveredKm,
    this.tripCode,
  });

  factory DriverActiveRouteData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverActiveRouteData();

    // Check if activeTrip is nested
    final Map<String, dynamic> src = (json['activeTrip'] is Map)
        ? Map<String, dynamic>.from(json['activeTrip'])
        : json;

    final stopsList = src['stops'] is List
        ? (src['stops'] as List)
            .map((e) => RouteStopDetail.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <RouteStopDetail>[];

    ActiveRouteInfo? routeObj;
    if (src['route'] is Map) {
      routeObj = ActiveRouteInfo.fromJson(Map<String, dynamic>.from(src['route']));
    } else if (src['routeName'] != null || src['routeNumber'] != null || stopsList.isNotEmpty) {
      routeObj = ActiveRouteInfo(
        id: src['id']?.toString() ?? src['tripId']?.toString(),
        name: src['routeName']?.toString() ?? src['name']?.toString(),
        routeNumber: src['routeNumber']?.toString() ?? src['route_number']?.toString(),
        stops: stopsList,
      );
    }

    final slotsList = json['todaySlots'] is List
        ? (json['todaySlots'] as List)
            .map((e) => DriverSlotModel.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <DriverSlotModel>[];

    DriverSlotModel? selSlot;
    if (json['selectedSlot'] is Map) {
      selSlot = DriverSlotModel.fromJson(Map<String, dynamic>.from(json['selectedSlot']));
    }

    DriverSlotModel? slotObj;
    if (src['slot'] is Map) {
      slotObj = DriverSlotModel.fromJson(Map<String, dynamic>.from(src['slot']));
    } else if (selSlot != null) {
      slotObj = selSlot;
    }

    DriverVehicleModel? vehObj;
    if (src['vehicle'] is Map) {
      vehObj = DriverVehicleModel.fromJson(Map<String, dynamic>.from(src['vehicle']));
    } else if (json['assignedBus'] is Map) {
      vehObj = DriverVehicleModel.fromJson(Map<String, dynamic>.from(json['assignedBus']));
    }

    DriverDepotModel? depotObj;
    if (src['depot'] is Map) {
      depotObj = DriverDepotModel.fromJson(Map<String, dynamic>.from(src['depot']));
    } else if (json['depot'] is Map) {
      depotObj = DriverDepotModel.fromJson(Map<String, dynamic>.from(json['depot']));
    } else if (vehObj?.depot != null) {
      depotObj = vehObj!.depot;
    }

    DriverFleetModel? fleetObj;
    if (src['fleet'] is Map) {
      fleetObj = DriverFleetModel.fromJson(Map<String, dynamic>.from(src['fleet']));
    } else if (json['fleet'] is Map) {
      fleetObj = DriverFleetModel.fromJson(Map<String, dynamic>.from(json['fleet']));
    } else if (vehObj?.fleet != null) {
      fleetObj = vehObj!.fleet;
    }

    final tripInfo = src['trip'] is Map ? src['trip'] as Map : null;
    final tripCodeVal = tripInfo?['trip_code']?.toString() ??
        tripInfo?['code']?.toString() ??
        src['tripCode']?.toString() ??
        (src['id'] != null ? 'TRIP-${src['id']}' : null);

    return DriverActiveRouteData(
      tripId: src['tripId']?.toString() ?? src['trip_id']?.toString() ?? src['id']?.toString(),
      route: routeObj,
      currentStopIndex: src['current_stop_index'] != null
          ? (src['current_stop_index'] as num).toInt()
          : 0,
      tripStartedAt: src['trip_started_at']?.toString() ?? src['departureTime']?.toString() ?? src['start_time']?.toString(),
      passengersOnboard: src['passengers_onboard'] != null
          ? (src['passengers_onboard'] as num).toInt()
          : 0,
      routeName: src['routeName']?.toString() ?? routeObj?.name ?? slotObj?.routeName,
      routeNumber: src['routeNumber']?.toString() ?? routeObj?.routeNumber ?? slotObj?.routeCode,
      busNumber: src['busNumber']?.toString() ?? src['bus_number']?.toString() ?? slotObj?.busNumber ?? vehObj?.busNumber,
      vehicleCode: src['vehicleCode']?.toString() ?? src['vehicle_code']?.toString() ?? vehObj?.code,
      vehicleType: src['vehicleType']?.toString() ?? src['vehicle_type']?.toString() ?? vehObj?.vehicleType,
      status: src['status']?.toString() ?? slotObj?.status,
      rawStatus: src['rawStatus']?.toString() ?? src['raw_status']?.toString() ?? slotObj?.status,
      batteryState: src['batteryState']?.toString(),
      fuelLevel: src['fuelLevel']?.toString(),
      routeType: src['routeType']?.toString() ?? src['route_type']?.toString(),
      frequency: src['frequency']?.toString(),
      passengersEstimate: src['passengersEstimate']?.toString() ?? src['passengers_estimate']?.toString(),
      departureTime: src['departureTime']?.toString() ?? src['start_time']?.toString() ?? slotObj?.formattedStartTime,
      endTime: src['endTime']?.toString() ?? src['end_time']?.toString() ?? slotObj?.formattedEndTime,
      totalDistance: src['totalDistance']?.toString() ?? src['distance']?.toString() ?? (slotObj?.distanceKm != null ? '${slotObj!.distanceKm} km' : null),
      origin: src['origin']?.toString() ?? src['from_stop']?.toString() ?? slotObj?.startPoint,
      destination: src['destination']?.toString() ?? src['to_stop']?.toString() ?? slotObj?.endPoint,
      nextStop: src['nextStop']?.toString() ?? src['next_stop']?.toString(),
      nextStopEta: src['nextStopEta']?.toString() ?? src['next_stop_eta']?.toString(),
      stops: stopsList,
      todaySlots: slotsList,
      selectedSlot: selSlot,
      slot: slotObj,
      assignedBus: vehObj,
      vehicle: vehObj,
      depot: depotObj,
      fleet: fleetObj,
      startedAtFormatted: src['started_at_formatted']?.toString() ?? src['started_at']?.toString() ?? slotObj?.formattedStartTime,
      endedAtFormatted: src['ended_at_formatted']?.toString() ?? src['ended_at']?.toString() ?? slotObj?.formattedEndTime,
      duration: src['duration']?.toString() ?? slotObj?.duration,
      coveredKm: src['covered_km'] ?? src['distance_km'] ?? slotObj?.distanceKm,
      tripCode: tripCodeVal,
    );
  }
}

class DriverTripItem {
  final String? id;
  final String? tripCode;
  final String? routeName;
  final String? routeNumber;
  final String? origin;
  final String? destination;
  final String? busNumber;
  final String? vehicleModel;
  final String? vehiclePlateNumber;
  final String? status;
  final String? startedAt;
  final String? endedAt;
  final dynamic distanceKm;
  final dynamic coveredKm;
  final String? duration;
  final int passengersCounted;

  DriverTripItem({
    this.id,
    this.tripCode,
    this.routeName,
    this.routeNumber,
    this.origin,
    this.destination,
    this.busNumber,
    this.vehicleModel,
    this.vehiclePlateNumber,
    this.status,
    this.startedAt,
    this.endedAt,
    this.distanceKm,
    this.coveredKm,
    this.duration,
    this.passengersCounted = 0,
  });

  factory DriverTripItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverTripItem();
    final routeMap = json['route'] is Map ? json['route'] as Map : null;
    final vehMap = json['vehicle'] is Map ? json['vehicle'] as Map : null;
    final rawTripCode = json['code']?.toString() ??
        json['trip_code']?.toString() ??
        (json['id'] != null ? 'TRIP-${json['id'].toString().padLeft(4, '0')}' : null);

    return DriverTripItem(
      id: json['id']?.toString(),
      tripCode: rawTripCode,
      routeName: routeMap?['name']?.toString() ?? json['route_name']?.toString(),
      routeNumber: routeMap?['route_number']?.toString() ?? routeMap?['code']?.toString() ?? json['route_number']?.toString(),
      origin: json['origin']?.toString() ?? routeMap?['start_point']?.toString() ?? routeMap?['from_stop']?.toString(),
      destination: json['destination']?.toString() ?? routeMap?['end_point']?.toString() ?? routeMap?['to_stop']?.toString(),
      busNumber: vehMap?['bus_number']?.toString() ??
          vehMap?['registration_number']?.toString() ??
          vehMap?['code']?.toString() ??
          json['bus_number']?.toString() ??
          (json['vehicle_id'] != null ? 'Bus #${json['vehicle_id']}' : null),
      vehicleModel: vehMap?['model']?.toString() ?? vehMap?['vehicle_type']?.toString() ?? vehMap?['plate_number']?.toString() ?? json['vehicle_model']?.toString(),
      vehiclePlateNumber: vehMap?['plate_number']?.toString() ?? vehMap?['registration_number']?.toString() ?? vehMap?['bus_number']?.toString(),
      status: json['status']?.toString() ?? 'completed',
      startedAt: json['started_at']?.toString() ?? json['start_time']?.toString() ?? json['createdAt']?.toString(),
      endedAt: json['ended_at']?.toString() ?? json['end_time']?.toString(),
      distanceKm: json['distance_km'] ?? routeMap?['distance_km'] ?? json['distance'],
      coveredKm: json['covered_km'] ?? json['distance_km'] ?? routeMap?['distance_km'] ?? json['distance'],
      duration: json['duration']?.toString(),
      passengersCounted: json['passengers_counted'] != null ? (json['passengers_counted'] as num).toInt() : 0,
    );
  }
}

class DriverTripHistoryData {
  final List<DriverTripItem> rows;
  final int count;
  final int totalPages;
  final int currentPage;
  final int pageSize;

  DriverTripHistoryData({
    this.rows = const [],
    this.count = 0,
    this.totalPages = 1,
    this.currentPage = 1,
    this.pageSize = 20,
  });

  factory DriverTripHistoryData.fromDynamic(
    dynamic data, {
    int fallbackPage = 1,
    int fallbackLimit = 20,
    Map<String, dynamic>? meta,
  }) {
    if (data == null) return DriverTripHistoryData();

    List<DriverTripItem> items = [];
    int? count;
    int? totalPages;
    int? currentPage;
    int? pageSize;

    if (data is List) {
      items = data
          .whereType<Map>()
          .map((e) => DriverTripItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      count = items.length;
    } else if (data is Map) {
      final map = Map<String, dynamic>.from(data);
      final rawList = map['rows'] ?? map['items'] ?? map['trips'] ?? map['data'];
      if (rawList is List) {
        items = rawList
            .whereType<Map>()
            .map((e) => DriverTripItem.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
      if (map['count'] is num) count = (map['count'] as num).toInt();
      if (map['total'] is num) count = (map['total'] as num).toInt();
      if (map['totalItems'] is num) count = (map['totalItems'] as num).toInt();
      if (map['totalPages'] is num) totalPages = (map['totalPages'] as num).toInt();
      if (map['total_pages'] is num) totalPages = (map['total_pages'] as num).toInt();
      if (map['currentPage'] is num) currentPage = (map['currentPage'] as num).toInt();
      if (map['current_page'] is num) currentPage = (map['current_page'] as num).toInt();
      if (map['page'] is num) currentPage = (map['page'] as num).toInt();
      if (map['pageSize'] is num) pageSize = (map['pageSize'] as num).toInt();
      if (map['page_size'] is num) pageSize = (map['page_size'] as num).toInt();
      if (map['limit'] is num) pageSize = (map['limit'] as num).toInt();
    }

    final pagination = meta?['pagination'] is Map ? meta!['pagination'] as Map : null;
    if (pagination != null) {
      if (pagination['total'] is num) count = (pagination['total'] as num).toInt();
      if (pagination['totalPages'] is num) totalPages = (pagination['totalPages'] as num).toInt();
      if (pagination['total_pages'] is num) totalPages = (pagination['total_pages'] as num).toInt();
      if (pagination['page'] is num) currentPage = (pagination['page'] as num).toInt();
      if (pagination['limit'] is num) pageSize = (pagination['limit'] as num).toInt();
    }

    final finalCount = count ?? items.length;
    final finalPageSize = pageSize ?? fallbackLimit;
    final calculatedPages = finalPageSize > 0 ? (finalCount / finalPageSize).ceil() : 1;
    final finalTotalPages = totalPages ?? (calculatedPages > 0 ? calculatedPages : 1);
    final finalCurrentPage = currentPage ?? fallbackPage;

    return DriverTripHistoryData(
      rows: items,
      count: finalCount,
      totalPages: finalTotalPages > 0 ? finalTotalPages : 1,
      currentPage: finalCurrentPage > 0 ? finalCurrentPage : 1,
      pageSize: finalPageSize > 0 ? finalPageSize : 20,
    );
  }

  factory DriverTripHistoryData.fromJson(Map<String, dynamic>? json) {
    return DriverTripHistoryData.fromDynamic(json);
  }
}

class DriverDocumentItem {
  final String? id;
  final String? type; // 'license', 'aadhaar', 'pan', 'medical', 'badge', etc.
  final String? typeLabel;
  final String? url;
  final String? fileName;
  final String? fileSize;
  final String? fileType;
  final String? status; // 'verified', 'pending', 'rejected', 'under_review'
  final String? uploadedAt;
  final String? verifiedAt;
  final String? expiryDate;
  final bool isVerified;

  DriverDocumentItem({
    this.id,
    this.type,
    this.typeLabel,
    this.url,
    this.fileName,
    this.fileSize,
    this.fileType,
    this.status,
    this.uploadedAt,
    this.verifiedAt,
    this.expiryDate,
    this.isVerified = false,
  });

  factory DriverDocumentItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverDocumentItem();
    final verified = json['verified'] == true ||
        json['is_verified'] == true ||
        (json['status']?.toString().toLowerCase() == 'verified');
    final rawStatus = verified
        ? 'verified'
        : (json['status']?.toString() ?? 'pending');

    return DriverDocumentItem(
      id: json['id']?.toString() ?? json['_id']?.toString(),
      type: json['type']?.toString() ??
          json['doc_type']?.toString() ??
          json['docType']?.toString() ??
          json['category']?.toString(),
      typeLabel: json['type_label']?.toString() ??
          json['typeLabel']?.toString() ??
          json['doc_name']?.toString() ??
          json['docName']?.toString() ??
          json['name']?.toString() ??
          json['file_name']?.toString(),
      url: json['url']?.toString() ??
          json['file_url']?.toString() ??
          json['fileUrl']?.toString() ??
          json['preview_url']?.toString() ??
          json['previewUrl']?.toString() ??
          json['path']?.toString(),
      fileName: json['file_name']?.toString() ??
          json['fileName']?.toString() ??
          json['name']?.toString() ??
          json['doc_name']?.toString(),
      fileSize: json['file_size']?.toString() ??
          json['fileSize']?.toString() ??
          json['size']?.toString() ??
          json['formattedSize']?.toString(),
      fileType: json['file_type']?.toString() ?? json['fileType']?.toString(),
      status: rawStatus,
      uploadedAt: json['uploaded_at']?.toString() ??
          json['uploadedAt']?.toString() ??
          json['uploaded_on']?.toString() ??
          json['createdAt']?.toString(),
      verifiedAt: json['verified_at']?.toString() ?? json['verifiedAt']?.toString(),
      expiryDate: json['expiry_date']?.toString() ??
          json['expiryDate']?.toString() ??
          json['valid_till']?.toString() ??
          json['validTill']?.toString(),
      isVerified: verified,
    );
  }
}

class DriverIncidentLocation {
  final double? lat;
  final double? lng;
  final String? address;

  DriverIncidentLocation({this.lat, this.lng, this.address});

  factory DriverIncidentLocation.fromJson(dynamic data) {
    if (data == null) return DriverIncidentLocation();
    if (data is String) {
      return DriverIncidentLocation(address: data);
    }
    if (data is Map) {
      double? parseCoord(dynamic val) {
        if (val == null) return null;
        if (val is num) return val.toDouble();
        return double.tryParse(val.toString().trim());
      }

      final latVal = parseCoord(data['lat'] ?? data['latitude']);
      final lngVal = parseCoord(data['lng'] ?? data['longitude']);
      final addr = data['address']?.toString() ??
          data['location']?.toString() ??
          data['landmark']?.toString() ??
          data['name']?.toString();

      return DriverIncidentLocation(
        lat: latVal,
        lng: lngVal,
        address: addr,
      );
    }
    return DriverIncidentLocation();
  }

  Map<String, dynamic> toJson() => {
    if (lat != null) 'lat': lat,
    if (lng != null) 'lng': lng,
    if (address != null) 'address': address,
  };
}

class DriverIncidentItem {
  final String? id;
  final String? title;
  final String? incidentType;
  final String? description;
  final String? severity; // 'low', 'medium', 'high', 'critical'
  final String? status; // 'open', 'in_progress', 'resolved', 'closed'
  final String? ticketNumber;
  final DriverIncidentLocation? location;
  final List<String> mediaUrls;
  final List<String> videoUrls;
  final String? resolution;
  final String? reportedAt;
  final String? resolvedAt;
  final String? landmark;
  final int deadCasualty;
  final int injuredCount;
  final String? hospitalName;
  final String? policeStationName;
  final bool ambulanceAssigned;
  final String? ambulanceTiming;
  final bool policeNotified;
  final bool towingRequested;
  final String? weatherConditions;
  final String? roadType;
  final String? trafficDisruptionLevel;
  final String? contactPreference;
  final bool contactedDriver;
  final String? contactNotes;
  final String? recoveredAt;
  final String? resolverName;
  final String? resolverEmail;
  final String? resolutionNotes;
  final double? latitude;
  final double? longitude;
  final String? locationName;
  final String? immediateAction;
  final String? contactNumber;
  final List<String> affectedParties;
  final List<DriverIncidentActivityLog> activityLogs;

  DriverIncidentItem({
    this.id,
    this.title,
    this.incidentType,
    this.description,
    this.severity,
    this.status,
    this.ticketNumber,
    this.location,
    this.mediaUrls = const [],
    this.videoUrls = const [],
    this.resolution,
    this.reportedAt,
    this.resolvedAt,
    this.landmark,
    this.deadCasualty = 0,
    this.injuredCount = 0,
    this.hospitalName,
    this.policeStationName,
    this.ambulanceAssigned = false,
    this.ambulanceTiming,
    this.policeNotified = false,
    this.towingRequested = false,
    this.weatherConditions,
    this.roadType,
    this.trafficDisruptionLevel,
    this.contactPreference,
    this.contactedDriver = false,
    this.contactNotes,
    this.recoveredAt,
    this.resolverName,
    this.resolverEmail,
    this.resolutionNotes,
    this.latitude,
    this.longitude,
    this.locationName,
    this.immediateAction,
    this.contactNumber,
    this.affectedParties = const [],
    this.activityLogs = const [],
  });

  List<String> get photos => mediaUrls;
  List<String> get videos => videoUrls;
  bool get hasCasualties => deadCasualty > 0 || injuredCount > 0;

  factory DriverIncidentItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverIncidentItem();

    // 1. Photos extraction
    List<String> media = [];
    final rawPhotos = json['photos'] ?? json['media_urls'] ?? json['media'] ?? json['attachments'];
    if (rawPhotos is List) {
      media = rawPhotos.where((e) => e != null).map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
    } else if (rawPhotos is String && rawPhotos.trim().isNotEmpty) {
      if (rawPhotos.contains(',')) {
        media = rawPhotos.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      } else {
        media = [rawPhotos.trim()];
      }
    }

    // 2. Videos extraction
    List<String> vids = [];
    final rawVideos = json['videos'] ?? json['video_urls'];
    if (rawVideos is List) {
      vids = rawVideos.where((e) => e != null).map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
    } else if (rawVideos is String && rawVideos.trim().isNotEmpty) {
      if (rawVideos.contains(',')) {
        vids = rawVideos.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      } else {
        vids = [rawVideos.trim()];
      }
    }

    // 3. Incident Type / Title
    final incType = json['incident_type']?.toString() ??
        json['incidentType']?.toString() ??
        json['type']?.toString() ??
        json['title']?.toString();

    // 4. Coordinates extraction helper
    double? parseDouble(dynamic val) {
      if (val == null) return null;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString().trim());
    }

    double? latVal = parseDouble(json['latitude'] ?? json['lat']);
    double? lngVal = parseDouble(json['longitude'] ?? json['lng']);

    String? locName;
    if (json['location'] is String) {
      locName = json['location'] as String;
    } else if (json['location'] is Map) {
      locName = json['location']['address']?.toString() ??
          json['location']['name']?.toString() ??
          json['location']['location']?.toString();
      latVal ??= parseDouble(json['location']['lat'] ?? json['location']['latitude']);
      lngVal ??= parseDouble(json['location']['lng'] ?? json['location']['longitude']);
    }
    locName ??= json['landmark']?.toString();

    DriverIncidentLocation? loc;
    if (json['location'] != null) {
      loc = DriverIncidentLocation.fromJson(json['location']);
    } else if (latVal != null || lngVal != null || locName != null) {
      loc = DriverIncidentLocation(
        lat: latVal,
        lng: lngVal,
        address: locName,
      );
    }

    // 5. Affected Parties
    List<String> affected = [];
    final rawAffected = json['affected_parties'] ?? json['affectedParties'];
    if (rawAffected is List) {
      affected = rawAffected.where((e) => e != null).map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
    } else if (rawAffected is String && rawAffected.trim().isNotEmpty) {
      if (rawAffected.contains(',')) {
        affected = rawAffected.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      } else {
        affected = [rawAffected.trim()];
      }
    }

    // 6. Int parsing helper
    int toInt(dynamic val, [int fallback = 0]) {
      if (val == null) return fallback;
      if (val is int) return val;
      if (val is num) return val.toInt();
      return int.tryParse(val.toString().trim()) ?? fallback;
    }

    // 7. Bool parsing helper
    bool toBool(dynamic val) {
      if (val == null) return false;
      if (val is bool) return val;
      if (val is num) return val == 1;
      final str = val.toString().toLowerCase().trim();
      return str == 'true' || str == '1' || str == 'yes';
    }

    // 8. Activity logs
    List<DriverIncidentActivityLog> logs = [];
    final rawLogs = json['activityLogs'] ?? json['activity_logs'];
    if (rawLogs is List) {
      logs = rawLogs
          .whereType<Map>()
          .map((e) => DriverIncidentActivityLog.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }

    // 9. Resolver details
    String? resName;
    String? resEmail;
    if (json['resolver'] is Map) {
      resName = json['resolver']['name']?.toString();
      resEmail = json['resolver']['email']?.toString();
    } else if (json['resolver'] is String) {
      resName = json['resolver'] as String;
    }
    resName ??= json['resolver_name']?.toString() ?? json['resolverName']?.toString();

    final resNotes = json['resolution_notes']?.toString() ??
        json['resolutionNotes']?.toString() ??
        json['resolution']?.toString() ??
        json['admin_notes']?.toString();

    return DriverIncidentItem(
      id: json['id']?.toString(),
      title: json['title']?.toString() ?? incType ?? 'Incident Report',
      incidentType: incType ?? json['title']?.toString() ?? 'Incident',
      description: json['description']?.toString() ??
          json['desc']?.toString() ??
          '',
      severity: json['severity']?.toString().toLowerCase().trim() ?? 'low',
      status: json['status']?.toString().toLowerCase().trim() ?? 'open',
      ticketNumber: json['ticket_number']?.toString() ??
          json['ticket_code']?.toString() ??
          json['ticketNumber']?.toString() ??
          json['code']?.toString(),
      location: loc,
      mediaUrls: media,
      videoUrls: vids,
      resolution: resNotes,
      reportedAt: json['reported_at']?.toString() ??
          json['reportedAt']?.toString() ??
          json['createdAt']?.toString() ??
          json['created_at']?.toString(),
      resolvedAt: json['resolved_at']?.toString() ??
          json['resolvedAt']?.toString() ??
          json['updatedAt']?.toString() ??
          json['updated_at']?.toString(),
      landmark: json['landmark']?.toString(),
      deadCasualty: toInt(json['dead_casualty'] ?? json['deadCasualty']),
      injuredCount: toInt(json['injured_count'] ?? json['injuredCount']),
      hospitalName: json['hospital_name']?.toString() ?? json['hospitalName']?.toString(),
      policeStationName: json['police_station_name']?.toString() ?? json['policeStationName']?.toString(),
      ambulanceAssigned: toBool(json['ambulance_assigned'] ?? json['ambulanceAssigned']),
      ambulanceTiming: json['ambulance_timing']?.toString() ?? json['ambulanceTiming']?.toString(),
      policeNotified: toBool(json['police_notified'] ?? json['policeNotified']),
      towingRequested: toBool(json['towing_requested'] ?? json['towingRequested']),
      weatherConditions: json['weather_conditions']?.toString() ?? json['weatherConditions']?.toString(),
      roadType: json['road_type']?.toString() ?? json['roadType']?.toString(),
      trafficDisruptionLevel: json['traffic_disruption_level']?.toString() ?? json['trafficDisruptionLevel']?.toString(),
      contactPreference: json['contact_preference']?.toString() ?? json['contactPreference']?.toString(),
      contactedDriver: toBool(json['contacted_driver'] ?? json['contactedDriver']),
      contactNotes: json['contact_notes']?.toString() ?? json['contactNotes']?.toString(),
      recoveredAt: json['recovered_at']?.toString() ?? json['recoveredAt']?.toString(),
      resolverName: resName,
      resolverEmail: resEmail,
      resolutionNotes: resNotes,
      latitude: latVal ?? loc?.lat,
      longitude: lngVal ?? loc?.lng,
      locationName: locName ?? loc?.address,
      immediateAction: json['immediate_action']?.toString() ?? json['immediateAction']?.toString(),
      contactNumber: json['contact_number']?.toString() ?? json['contactNumber']?.toString(),
      affectedParties: affected,
      activityLogs: logs,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'incidentType': incidentType,
    'description': description,
    'severity': severity,
    'status': status,
    'ticketNumber': ticketNumber,
    'location': location?.toJson(),
    'photos': mediaUrls,
    'videos': videoUrls,
    'resolution': resolution,
    'reportedAt': reportedAt,
    'resolvedAt': resolvedAt,
    'landmark': landmark,
    'deadCasualty': deadCasualty,
    'injuredCount': injuredCount,
    'hospitalName': hospitalName,
    'policeStationName': policeStationName,
    'ambulanceAssigned': ambulanceAssigned,
    'ambulanceTiming': ambulanceTiming,
    'policeNotified': policeNotified,
    'towingRequested': towingRequested,
    'weatherConditions': weatherConditions,
    'roadType': roadType,
    'trafficDisruptionLevel': trafficDisruptionLevel,
    'contactPreference': contactPreference,
    'contactedDriver': contactedDriver,
    'contactNotes': contactNotes,
    'recoveredAt': recoveredAt,
    'resolverName': resolverName,
    'resolverEmail': resolverEmail,
    'resolutionNotes': resolutionNotes,
    'latitude': latitude,
    'longitude': longitude,
    'locationName': locationName,
    'immediateAction': immediateAction,
    'contactNumber': contactNumber,
    'affectedParties': affectedParties,
    'activityLogs': activityLogs.map((e) => e.toJson()).toList(),
  };
}

class DriverIncidentActivityLog {
  final String? id;
  final String? description;
  final String? actorName;
  final String? actorRole;
  final String? oldStatus;
  final String? newStatus;
  final String? notes;
  final String? createdAt;

  DriverIncidentActivityLog({
    this.id,
    this.description,
    this.actorName,
    this.actorRole,
    this.oldStatus,
    this.newStatus,
    this.notes,
    this.createdAt,
  });

  factory DriverIncidentActivityLog.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverIncidentActivityLog();
    final props = json['properties'] is Map ? json['properties'] as Map : null;
    return DriverIncidentActivityLog(
      id: json['id']?.toString(),
      description: json['description']?.toString() ?? props?['action']?.toString() ?? 'Action Logged',
      actorName: json['actor_name']?.toString() ?? json['causer_name']?.toString() ?? json['userName']?.toString() ?? 'System Operator',
      actorRole: json['actor_role']?.toString() ?? json['causer_role']?.toString() ?? json['userRole']?.toString() ?? 'Staff',
      oldStatus: props?['old_status']?.toString(),
      newStatus: props?['new_status']?.toString(),
      notes: props?['notes']?.toString() ?? props?['contact_notes']?.toString() ?? props?['resolution_notes']?.toString(),
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString() ?? json['timestamp']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'description': description,
    'actor_name': actorName,
    'actor_role': actorRole,
    'old_status': oldStatus,
    'new_status': newStatus,
    'notes': notes,
    'createdAt': createdAt,
  };
}

class DriverDutyStatusResult {
  final String? dutyStatus;
  final String? dutyStartedAt;

  DriverDutyStatusResult({this.dutyStatus, this.dutyStartedAt});

  factory DriverDutyStatusResult.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverDutyStatusResult();
    return DriverDutyStatusResult(
      dutyStatus: json['duty_status']?.toString(),
      dutyStartedAt: json['duty_started_at']?.toString(),
    );
  }
}
