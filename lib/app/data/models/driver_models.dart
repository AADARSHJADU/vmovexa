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
  });

  factory DriverProfileData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverProfileData();
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
      documentsVerified: json['documents_verified'] == true ||
          json['verified'] == true ||
          json['is_verified'] == true,
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

class DriverScheduleData {
  final String? date;
  final DriverShiftData? shift;
  final AssignedRouteBrief? assignedRoute;
  final List<UpcomingTripItem> upcomingTrips;

  DriverScheduleData({
    this.date,
    this.shift,
    this.assignedRoute,
    this.upcomingTrips = const [],
  });

  factory DriverScheduleData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverScheduleData();
    return DriverScheduleData(
      date: json['date']?.toString(),
      shift: json['shift'] is Map
          ? DriverShiftData.fromJson(Map<String, dynamic>.from(json['shift']))
          : null,
      assignedRoute: json['assigned_route'] is Map
          ? AssignedRouteBrief.fromJson(Map<String, dynamic>.from(json['assigned_route']))
          : null,
      upcomingTrips: json['upcoming_trips'] is List
          ? (json['upcoming_trips'] as List)
              .map((e) => UpcomingTripItem.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : [],
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
      routeName: src['routeName']?.toString() ?? routeObj?.name,
      routeNumber: src['routeNumber']?.toString() ?? routeObj?.routeNumber,
      busNumber: src['busNumber']?.toString() ?? src['bus_number']?.toString(),
      vehicleCode: src['vehicleCode']?.toString() ?? src['vehicle_code']?.toString(),
      vehicleType: src['vehicleType']?.toString() ?? src['vehicle_type']?.toString(),
      status: src['status']?.toString(),
      rawStatus: src['rawStatus']?.toString() ?? src['raw_status']?.toString(),
      batteryState: src['batteryState']?.toString(),
      fuelLevel: src['fuelLevel']?.toString(),
      routeType: src['routeType']?.toString() ?? src['route_type']?.toString(),
      frequency: src['frequency']?.toString(),
      passengersEstimate: src['passengersEstimate']?.toString() ?? src['passengers_estimate']?.toString(),
      departureTime: src['departureTime']?.toString() ?? src['start_time']?.toString(),
      endTime: src['endTime']?.toString() ?? src['end_time']?.toString(),
      totalDistance: src['totalDistance']?.toString() ?? src['distance']?.toString(),
      origin: src['origin']?.toString() ?? src['from_stop']?.toString(),
      destination: src['destination']?.toString() ?? src['to_stop']?.toString(),
      nextStop: src['nextStop']?.toString() ?? src['next_stop']?.toString(),
      nextStopEta: src['nextStopEta']?.toString() ?? src['next_stop_eta']?.toString(),
      stops: stopsList,
    );
  }
}

class DriverTripItem {
  final String? id;
  final String? routeName;
  final String? routeNumber;
  final String? vehicleRegNumber;
  final String? status;
  final String? startTime;
  final String? endTime;
  final double distanceKm;
  final int passengersCounted;

  DriverTripItem({
    this.id,
    this.routeName,
    this.routeNumber,
    this.vehicleRegNumber,
    this.status,
    this.startTime,
    this.endTime,
    this.distanceKm = 0.0,
    this.passengersCounted = 0,
  });

  factory DriverTripItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverTripItem();
    final routeMap = json['route'] is Map ? json['route'] as Map : null;
    final vehMap = json['vehicle'] is Map ? json['vehicle'] as Map : null;
    return DriverTripItem(
      id: json['id']?.toString(),
      routeName: routeMap?['name']?.toString() ?? json['route_name']?.toString(),
      routeNumber: routeMap?['route_number']?.toString() ?? json['route_number']?.toString(),
      vehicleRegNumber: vehMap?['registration_number']?.toString() ?? json['registration_number']?.toString(),
      status: json['status']?.toString() ?? 'completed',
      startTime: json['start_time']?.toString(),
      endTime: json['end_time']?.toString(),
      distanceKm: json['distance_km'] != null ? (json['distance_km'] as num).toDouble() : 0.0,
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

  factory DriverTripHistoryData.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverTripHistoryData();
    List<DriverTripItem> items = [];
    if (json['rows'] is List) {
      items = (json['rows'] as List)
          .map((e) => DriverTripItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } else if (json['items'] is List) {
      items = (json['items'] as List)
          .map((e) => DriverTripItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return DriverTripHistoryData(
      rows: items,
      count: json['count'] != null ? (json['count'] as num).toInt() : items.length,
      totalPages: json['totalPages'] != null ? (json['totalPages'] as num).toInt() : 1,
      currentPage: json['currentPage'] != null ? (json['currentPage'] as num).toInt() : 1,
      pageSize: json['pageSize'] != null ? (json['pageSize'] as num).toInt() : 20,
    );
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
      return DriverIncidentLocation(
        lat: data['lat'] != null
            ? (data['lat'] as num).toDouble()
            : (data['latitude'] != null ? (data['latitude'] as num).toDouble() : null),
        lng: data['lng'] != null
            ? (data['lng'] as num).toDouble()
            : (data['longitude'] != null ? (data['longitude'] as num).toDouble() : null),
        address: data['address']?.toString() ?? data['location']?.toString() ?? data['landmark']?.toString(),
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
  final String? status; // 'open', 'in_progress', 'resolved'
  final String? ticketNumber;
  final DriverIncidentLocation? location;
  final List<String> mediaUrls;
  final String? resolution;
  final String? reportedAt;
  final String? resolvedAt;
  final String? landmark;

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
    this.resolution,
    this.reportedAt,
    this.resolvedAt,
    this.landmark,
  });

  List<String> get photos => mediaUrls;

  factory DriverIncidentItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverIncidentItem();
    List<String> media = [];
    if (json['photos'] is List) {
      media = (json['photos'] as List).map((e) => e.toString()).toList();
    } else if (json['media_urls'] is List) {
      media = (json['media_urls'] as List).map((e) => e.toString()).toList();
    } else if (json['media'] is List) {
      media = (json['media'] as List).map((e) => e.toString()).toList();
    }

    final incType = json['incidentType']?.toString() ??
        json['incident_type']?.toString() ??
        json['type']?.toString();

    DriverIncidentLocation? loc;
    if (json['location'] != null) {
      loc = DriverIncidentLocation.fromJson(json['location']);
    } else if (json['latitude'] != null || json['longitude'] != null) {
      loc = DriverIncidentLocation(
        lat: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
        lng: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
        address: json['landmark']?.toString(),
      );
    }

    return DriverIncidentItem(
      id: json['id']?.toString(),
      title: json['title']?.toString() ?? incType ?? 'Incident Report',
      incidentType: incType ?? json['title']?.toString(),
      description: json['description']?.toString() ??
          json['desc']?.toString() ??
          '',
      severity: json['severity']?.toString() ?? 'low',
      status: json['status']?.toString() ?? 'open',
      ticketNumber: json['ticket_number']?.toString() ??
          json['ticket_code']?.toString() ??
          json['code']?.toString(),
      location: loc,
      mediaUrls: media,
      resolution: json['resolution']?.toString() ??
          json['resolution_notes']?.toString() ??
          json['admin_notes']?.toString(),
      reportedAt: json['reported_at']?.toString() ??
          json['createdAt']?.toString() ??
          json['created_at']?.toString(),
      resolvedAt: json['resolved_at']?.toString() ??
          json['updatedAt']?.toString() ??
          json['updated_at']?.toString(),
      landmark: json['landmark']?.toString(),
    );
  }
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
