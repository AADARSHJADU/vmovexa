class FleetKpisModel {
  final int totalFleets;
  final int activeFleets;
  final int totalVehicles;
  final int activeVehicles;
  final int totalDrivers;
  final int activeDrivers;
  final int totalGps;
  final int onlineGps;
  final int openIncidents;
  final int activeTrips;

  FleetKpisModel({
    this.totalFleets = 0,
    this.activeFleets = 0,
    this.totalVehicles = 0,
    this.activeVehicles = 0,
    this.totalDrivers = 0,
    this.activeDrivers = 0,
    this.totalGps = 0,
    this.onlineGps = 0,
    this.openIncidents = 0,
    this.activeTrips = 0,
  });

  factory FleetKpisModel.fromJson(Map<String, dynamic> json) {
    return FleetKpisModel(
      totalFleets: _toInt(json['total_fleets'] ?? json['fleets'] ?? json['totalFleets']),
      activeFleets: _toInt(json['active_fleets'] ?? json['activeFleets']),
      totalVehicles: _toInt(json['total_vehicles'] ?? json['vehicles'] ?? json['totalVehicles']),
      activeVehicles: _toInt(json['active_vehicles'] ?? json['activeVehicles']),
      totalDrivers: _toInt(json['total_drivers'] ?? json['drivers'] ?? json['totalDrivers']),
      activeDrivers: _toInt(json['active_drivers'] ?? json['activeDrivers']),
      totalGps: _toInt(json['total_gps'] ?? json['gps'] ?? json['devices'] ?? json['totalGps']),
      onlineGps: _toInt(json['online_gps'] ?? json['onlineGps']),
      openIncidents: _toInt(json['open_incidents'] ?? json['incidents'] ?? json['openIncidents']),
      activeTrips: _toInt(json['active_trips'] ?? json['trips'] ?? json['activeTrips']),
    );
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }
}

class FleetItemModel {
  final String id;
  final String name;
  final String description;
  final String status;
  final int vehicleCount;
  final int driverCount;
  final String? depotName;
  final String? updatedAt;

  FleetItemModel({
    required this.id,
    required this.name,
    this.description = '',
    this.status = 'active',
    this.vehicleCount = 0,
    this.driverCount = 0,
    this.depotName,
    this.updatedAt,
  });

  factory FleetItemModel.fromJson(Map<String, dynamic> json) {
    return FleetItemModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unnamed Fleet',
      description: json['description']?.toString() ?? '',
      status: json['status']?.toString() ?? 'active',
      vehicleCount: _toInt(json['vehicle_count'] ?? json['vehiclesCount'] ?? (json['vehicles'] is List ? json['vehicles'].length : 0)),
      driverCount: _toInt(json['driver_count'] ?? json['driversCount'] ?? (json['drivers'] is List ? json['drivers'].length : 0)),
      depotName: json['depot_name'] ?? json['depot']?['name'],
      updatedAt: json['updated_at'] ?? json['updatedAt'] ?? json['created_at'],
    );
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }
}

class VehicleItemModel {
  final String id;
  final String registrationNumber;
  final String vin;
  final String make;
  final String model;
  final int? year;
  final int capacity;
  final String vehicleType;
  final String fuelType;
  final String status;
  final dynamic fleetId;
  final String? fleetName;
  final dynamic depotId;
  final String? depotName;
  final dynamic assignedDriverId;
  final String? assignedDriverName;
  final dynamic routeId;
  final String? assignedRoute;
  final String? source;
  final String? destination;
  final int displaysCount;
  final int leftDisplays;
  final int rightDisplays;
  final int rearDisplays;
  final int emergencyDisplays;
  final String? gpsDeviceId;
  final List<FleetDocumentModel> documents;
  final List<String> photos;
  final double? speedKmh;
  final int? batterySocPct;
  final String? createdAt;
  final String? updatedAt;

  VehicleItemModel({
    required this.id,
    required this.registrationNumber,
    this.vin = '',
    this.make = '',
    this.model = '',
    this.year,
    this.capacity = 42,
    this.vehicleType = 'Non-Sleeper',
    this.fuelType = 'electric',
    this.status = 'active',
    this.fleetId,
    this.fleetName,
    this.depotId,
    this.depotName,
    this.assignedDriverId,
    this.assignedDriverName,
    this.routeId,
    this.assignedRoute,
    this.source,
    this.destination,
    this.displaysCount = 6,
    this.leftDisplays = 2,
    this.rightDisplays = 2,
    this.rearDisplays = 1,
    this.emergencyDisplays = 1,
    this.gpsDeviceId,
    this.documents = const [],
    this.photos = const [],
    this.speedKmh,
    this.batterySocPct,
    this.createdAt,
    this.updatedAt,
  });

  factory VehicleItemModel.fromJson(Map<String, dynamic> json) {
    // Displays Layout calculation
    int leftD = 2;
    int rightD = 2;
    int rearD = 1;
    int emergD = 1;

    if (json['display_layout'] is Map) {
      final layout = Map<String, dynamic>.from(json['display_layout'] as Map);
      leftD = _toInt(layout['left_side'] ?? layout['leftSide'] ?? 2);
      rightD = _toInt(layout['right_side'] ?? layout['rightSide'] ?? 2);
      rearD = _toInt(layout['rear'] ?? 1);
      emergD = _toInt(layout['emergency_exit'] ?? layout['emergencyExit'] ?? 1);
    } else if (json['displays_count'] != null) {
      final total = _toInt(json['displays_count']);
      final perSide = total > 0 ? (total ~/ 3).clamp(1, 10) : 2;
      leftD = perSide;
      rightD = perSide;
      rearD = 1;
      emergD = (total - (perSide * 2) - 1).clamp(0, 10);
    }

    final totalD = _toInt(json['displays_count'] ?? (leftD + rightD + rearD + emergD));

    // Compliance documents
    List<FleetDocumentModel> docs = [];
    if (json['documents'] is List) {
      docs = (json['documents'] as List)
          .whereType<Map>()
          .map((d) => FleetDocumentModel.fromJson(Map<String, dynamic>.from(d)))
          .toList();
    }

    // Bus photos
    List<String> photoList = [];
    if (json['photos'] is List) {
      photoList = (json['photos'] as List).map((p) => p.toString()).toList();
    } else if (json['bus_images'] is List) {
      photoList = (json['bus_images'] as List).map((p) => p.toString()).toList();
    }

    return VehicleItemModel(
      id: json['id']?.toString() ?? '',
      registrationNumber: json['registration_number']?.toString() ?? json['registrationNumber']?.toString() ?? json['bus_number']?.toString() ?? json['busNumber']?.toString() ?? 'N/A',
      vin: json['vin']?.toString() ?? json['chassis_number']?.toString() ?? json['chassisNumber']?.toString() ?? '',
      make: json['make']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      year: json['year'] is int ? json['year'] : int.tryParse(json['year']?.toString() ?? ''),
      capacity: _toInt(json['capacity']),
      vehicleType: json['vehicle_type']?.toString() ?? json['vehicleType']?.toString() ?? 'Non-Sleeper',
      fuelType: json['fuel_type']?.toString() ?? json['fuelType']?.toString() ?? 'electric',
      status: json['status']?.toString() ?? 'active',
      fleetId: json['fleet_id'] ?? json['fleetId'] ?? json['fleet']?['id'],
      fleetName: json['fleet_name'] ?? json['fleet']?['name'],
      depotId: json['depot_id'] ?? json['depotId'] ?? json['depot']?['id'],
      depotName: json['depot_name'] ?? json['depot']?['name'],
      assignedDriverId: json['assigned_driver_id'] ?? json['driver_id'] ?? json['driver']?['id'],
      assignedDriverName: json['assigned_driver_name'] ?? json['driver']?['name'],
      routeId: json['route_id'] ?? json['routeId'] ?? json['route']?['id'],
      assignedRoute: json['assigned_route'] ?? json['route']?['name'],
      source: json['source']?.toString() ?? json['route']?['start_point']?.toString() ?? '',
      destination: json['destination']?.toString() ?? json['route']?['end_point']?.toString() ?? '',
      displaysCount: totalD,
      leftDisplays: leftD,
      rightDisplays: rightD,
      rearDisplays: rearD,
      emergencyDisplays: emergD,
      gpsDeviceId: json['gps_device_id']?.toString() ?? json['edge_device_id']?.toString() ?? json['gpsDevice']?['serial_number']?.toString(),
      documents: docs,
      photos: photoList,
      speedKmh: (json['speed_kmh'] ?? json['speed']) != null ? double.tryParse((json['speed_kmh'] ?? json['speed']).toString()) : null,
      batterySocPct: json['battery_soc_pct'] != null ? int.tryParse(json['battery_soc_pct'].toString()) : null,
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString(),
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString(),
    );
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }
}

class DriverItemModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String empId;
  final String badgeId;
  final String dob;
  final String gender;
  final String bloodGroup;
  final String address;
  final String city;
  final String state;
  final String pincode;
  final String country;
  final double? latitude;
  final double? longitude;
  final String emergencyContactName;
  final String emergencyContactRelation;
  final String emergencyContact;
  final String licenseNumber;
  final String licenseType;
  final String issueDate;
  final String dlExpiry;
  final String issuingAuthority;
  final String medicalFitnessValidUntil;
  final bool aadhaarVerified;
  final bool documentsVerified;
  final bool kycRejected;
  final String? rejectionReason;
  final String? depotId;
  final String depotName;
  final String? assignedBusId;
  final String? assignedVehicleReg;
  final String activeShift;
  final String joiningDate;
  final String experienceYears;
  final String notes;
  final String avatarUrl;
  final String status;
  final double rating;
  final String dlStatus;
  final List<FleetDocumentModel> documents;

  DriverItemModel({
    required this.id,
    required this.name,
    this.phone = '',
    this.email = '',
    this.empId = '',
    this.badgeId = '',
    this.dob = '',
    this.gender = 'Male',
    this.bloodGroup = 'B+',
    this.address = '',
    this.city = '',
    this.state = '',
    this.pincode = '',
    this.country = 'India',
    this.latitude,
    this.longitude,
    this.emergencyContactName = '',
    this.emergencyContactRelation = 'Spouse',
    this.emergencyContact = '',
    this.licenseNumber = '',
    this.licenseType = 'Commercial Heavy (HMV)',
    this.issueDate = '',
    this.dlExpiry = '',
    this.issuingAuthority = '',
    this.medicalFitnessValidUntil = '',
    this.aadhaarVerified = false,
    this.documentsVerified = false,
    this.kycRejected = false,
    this.rejectionReason,
    this.depotId,
    this.depotName = '',
    this.assignedBusId,
    this.assignedVehicleReg,
    this.activeShift = 'Morning Shift (06:00 AM - 02:00 PM)',
    this.joiningDate = '',
    this.experienceYears = '5 Years',
    this.notes = '',
    this.avatarUrl = '',
    this.status = 'active',
    this.rating = 5.0,
    this.dlStatus = 'valid',
    this.documents = const [],
  });

  bool get isVerified => documentsVerified || aadhaarVerified;
  bool get isPendingApproval => status.toLowerCase() == 'pending_approval';
  bool get isOnDuty => status.toLowerCase() == 'on_duty' || status.toLowerCase() == 'on duty';
  bool get isAvailable => status.toLowerCase() == 'available' || status.toLowerCase() == 'active';
  bool get isOffDuty => status.toLowerCase() == 'off_duty' || status.toLowerCase() == 'off duty';
  bool get isComplianceBlocked => status.toLowerCase() == 'compliance_blocked';

  String get displayBadgeId =>
      badgeId.isNotEmpty ? badgeId : (empId.isNotEmpty ? empId : (id.isNotEmpty ? 'DRV-#$id' : '—'));

  String get displayBus {
    if (assignedVehicleReg != null && assignedVehicleReg!.trim().isNotEmpty) {
      return assignedVehicleReg!;
    }
    if (assignedBusId != null && assignedBusId!.trim().isNotEmpty) {
      return 'Bus #${assignedBusId!}';
    }
    return 'Unassigned';
  }

  String get displayDepot => depotName.isNotEmpty ? depotName : 'Main Depot';
  String get displayShift => activeShift.isNotEmpty ? activeShift : 'Morning Shift (06:00 - 14:00)';

  factory DriverItemModel.fromJson(Map<String, dynamic> json) {
    List<FleetDocumentModel> docs = [];
    if (json['documents'] is List) {
      docs = (json['documents'] as List)
          .whereType<Map>()
          .map((d) => FleetDocumentModel.fromJson(Map<String, dynamic>.from(d)))
          .toList();
    } else if (json['docs'] is List) {
      docs = (json['docs'] as List)
          .whereType<Map>()
          .map((d) => FleetDocumentModel.fromJson(Map<String, dynamic>.from(d)))
          .toList();
    }

    final rawAadhaar = json['aadhaar_verified'] ?? json['aadhaarVerified'];
    final rawDocsVerified = json['documents_verified'] ?? json['documentsVerified'] ?? json['verified'];
    final isAadhaar = rawAadhaar == true || rawAadhaar == 1 || rawAadhaar?.toString() == 'true';
    final isDocsVer = rawDocsVerified == true || rawDocsVerified == 1 || rawDocsVerified?.toString() == 'true';

    final isKycRej = json['kyc_rejected'] == true ||
        json['kycRejected'] == true ||
        (json['rejection_reason'] != null && json['rejection_reason'].toString().isNotEmpty && !isDocsVer);

    // Extract depot name
    String dName = '';
    if (json['depot'] is Map) {
      dName = json['depot']['name']?.toString() ?? json['depot']['code']?.toString() ?? '';
    } else if (json['depot'] is String && double.tryParse(json['depot'].toString()) == null) {
      dName = json['depot'].toString();
    } else {
      dName = json['depot_name']?.toString() ?? json['depotName']?.toString() ?? '';
    }

    // Extract bus reg / number
    String? busReg;
    if (json['assignedBus'] is Map) {
      busReg = json['assignedBus']['bus_number']?.toString() ?? json['assignedBus']['busNumber']?.toString() ?? json['assignedBus']['registration_number']?.toString();
    } else if (json['vehicle'] is Map) {
      busReg = json['vehicle']['registration_number']?.toString() ?? json['vehicle']['bus_number']?.toString();
    }
    busReg ??= json['assigned_bus_number']?.toString() ??
        json['assignedBusNumber']?.toString() ??
        json['assigned_vehicle_reg']?.toString() ??
        (json['assignedBus'] is String && double.tryParse(json['assignedBus'].toString()) == null ? json['assignedBus'].toString() : null);

    return DriverItemModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['full_name']?.toString() ?? json['user']?['name']?.toString() ?? 'Unnamed Driver',
      phone: json['phone']?.toString() ?? json['user']?['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? json['user']?['email']?.toString() ?? '',
      empId: json['emp_id']?.toString() ?? json['empId']?.toString() ?? '',
      badgeId: json['badge_id']?.toString() ?? json['badgeId']?.toString() ?? json['code']?.toString() ?? '',
      dob: json['dob']?.toString() ?? '',
      gender: json['gender']?.toString() ?? 'Male',
      bloodGroup: json['blood_group']?.toString() ?? json['bloodGroup']?.toString() ?? 'B+',
      address: json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      country: json['country']?.toString() ?? 'India',
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      emergencyContactName: json['emergency_contact_name']?.toString() ?? json['emergencyContactName']?.toString() ?? '',
      emergencyContactRelation: json['emergency_contact_relation']?.toString() ?? json['emergencyContactRelation']?.toString() ?? 'Spouse',
      emergencyContact: json['emergency_contact']?.toString() ?? json['emergencyContact']?.toString() ?? '',
      licenseNumber: json['license_number']?.toString() ?? json['licenseNumber']?.toString() ?? json['dl_number']?.toString() ?? json['dlNumber']?.toString() ?? 'N/A',
      licenseType: json['license_type']?.toString() ?? json['licenseType']?.toString() ?? 'Commercial Heavy (HMV)',
      issueDate: json['issue_date']?.toString() ?? json['issueDate']?.toString() ?? '',
      dlExpiry: json['license_expiry']?.toString() ?? json['licenseExpiry']?.toString() ?? json['dl_expiry']?.toString() ?? json['dlExpiry']?.toString() ?? '',
      issuingAuthority: json['issuing_authority']?.toString() ?? json['issuingAuthority']?.toString() ?? '',
      medicalFitnessValidUntil: json['medical_fitness_valid_until']?.toString() ?? json['medicalFitnessValidUntil']?.toString() ?? '',
      aadhaarVerified: isAadhaar,
      documentsVerified: isDocsVer,
      kycRejected: isKycRej,
      rejectionReason: json['rejection_reason']?.toString() ?? json['rejectionReason']?.toString(),
      depotId: json['depot_id']?.toString() ?? json['depotId']?.toString() ?? (json['depot'] is Map ? json['depot']['id']?.toString() : null),
      depotName: dName,
      assignedBusId: json['assigned_bus_id']?.toString() ?? json['assignedBusId']?.toString() ?? json['vehicle_id']?.toString() ?? (json['assignedBus'] is Map ? json['assignedBus']['id']?.toString() : null),
      assignedVehicleReg: busReg,
      activeShift: json['active_shift']?.toString() ?? json['activeShift']?.toString() ?? 'Morning Shift (06:00 AM - 02:00 PM)',
      joiningDate: json['joining_date']?.toString() ?? json['joiningDate']?.toString() ?? '',
      experienceYears: json['experience_years']?.toString() ?? json['experienceYears']?.toString() ?? '5 Years',
      notes: json['notes']?.toString() ?? '',
      avatarUrl: json['avatar_url']?.toString() ?? json['avatarUrl']?.toString() ?? json['avatar']?.toString() ?? json['user']?['avatar_url']?.toString() ?? '',
      status: json['status']?.toString() ?? 'active',
      rating: json['rating'] != null ? (double.tryParse(json['rating'].toString()) ?? 5.0) : 5.0,
      dlStatus: json['dl_status']?.toString() ?? json['dlStatus']?.toString() ?? 'valid',
      documents: docs,
    );
  }
}

class DepotItemModel {
  final dynamic id;
  final String name;
  final String code;
  final String address;
  final String city;
  final String state;
  final String pincode;
  final String country;
  final int capacity;
  final int vehicleCount;
  final int currentParked;
  final int evChargers;
  final int maintenanceBays;
  final int washingBays;
  final String depotType;
  final String status;
  final List<String> fuelTypes;
  final List<String> amenities;
  final double? latitude;
  final double? longitude;
  final int geofenceRadius;
  final String contactPerson;
  final String contactPhone;
  final String emergencyPhone;
  final String email;
  final String operatingHours;
  final dynamic assignedOperatorId;
  final String createdAt;
  final String updatedAt;

  DepotItemModel({
    required this.id,
    required this.name,
    this.code = '',
    this.address = '',
    this.city = '',
    this.state = '',
    this.pincode = '',
    this.country = 'India',
    this.capacity = 0,
    this.vehicleCount = 0,
    this.currentParked = 0,
    this.evChargers = 0,
    this.maintenanceBays = 0,
    this.washingBays = 0,
    this.depotType = 'main_terminal',
    this.status = 'operational',
    this.fuelTypes = const [],
    this.amenities = const [],
    this.latitude,
    this.longitude,
    this.geofenceRadius = 300,
    this.contactPerson = '',
    this.contactPhone = '',
    this.emergencyPhone = '',
    this.email = '',
    this.operatingHours = '24x7',
    this.assignedOperatorId,
    this.createdAt = '',
    this.updatedAt = '',
  });

  factory DepotItemModel.fromJson(Map<String, dynamic> json) {
    // Parse fuel types
    List<String> parsedFuels = [];
    final rawFuels = json['fuel_types'] ?? json['fuelTypes'];
    if (rawFuels is List) {
      parsedFuels = rawFuels.map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
    } else if (rawFuels is String && rawFuels.isNotEmpty) {
      parsedFuels = rawFuels.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    // Parse amenities
    List<String> parsedAmenities = [];
    final rawAmenities = json['amenities'];
    if (rawAmenities is List) {
      parsedAmenities = rawAmenities.map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
    } else if (rawAmenities is String && rawAmenities.isNotEmpty) {
      parsedAmenities = rawAmenities.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    final cap = _toInt(json['capacity']);
    final vCount = _toInt(json['vehicle_count'] ?? json['vehiclesCount'] ?? json['vehicles_count'] ?? json['vehicleCount']);
    final parked = _toInt(json['current_parked'] ?? json['currentParked'] ?? vCount);

    return DepotItemModel(
      id: json['id'],
      name: json['name']?.toString() ?? json['code']?.toString() ?? 'Depot #${json['id']}',
      code: json['code']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      country: json['country']?.toString() ?? 'India',
      capacity: cap,
      vehicleCount: vCount,
      currentParked: parked,
      evChargers: _toInt(json['ev_chargers'] ?? json['evChargers']),
      maintenanceBays: _toInt(json['maintenance_bays'] ?? json['maintenanceBays']),
      washingBays: _toInt(json['washing_bays'] ?? json['washingBays']),
      depotType: json['depot_type']?.toString() ?? json['depotType']?.toString() ?? 'main_terminal',
      status: json['status']?.toString() ?? 'operational',
      fuelTypes: parsedFuels,
      amenities: parsedAmenities,
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      geofenceRadius: _toInt(json['geofence_radius'] ?? json['geofenceRadius'] ?? 300),
      contactPerson: json['contact_person']?.toString() ?? json['contactPerson']?.toString() ?? json['contact_name']?.toString() ?? '',
      contactPhone: json['contact_phone']?.toString() ?? json['contactPhone']?.toString() ?? '',
      emergencyPhone: json['emergency_phone']?.toString() ?? json['emergencyPhone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      operatingHours: json['operating_hours']?.toString() ?? json['operatingHours']?.toString() ?? '24x7',
      assignedOperatorId: json['assigned_operator_id'] ?? json['assignedOperatorId'],
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString() ?? '',
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString() ?? '',
    );
  }

  String get displayCode => code.isNotEmpty ? code : 'DEP-$id';

  bool get isOperational => status.toLowerCase() == 'operational';
  bool get isClosed => status.toLowerCase() == 'closed';
  bool get isMaintenance => status.toLowerCase() == 'maintenance';

  int get fillPercentage {
    if (capacity <= 0) return 0;
    return ((currentParked / capacity) * 100).clamp(0, 100).round();
  }

  String get displayType {
    switch (depotType.toLowerCase()) {
      case 'main_terminal':
        return 'Main Terminal';
      case 'sub_depot':
        return 'Sub Depot';
      case 'maintenance_yard':
        return 'Maintenance Yard';
      case 'parking_lot':
        return 'Stabling Lot';
      default:
        return depotType.replaceAll('_', ' ').toUpperCase();
    }
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }
}

class FleetDocumentModel {
  final String name;
  final String category;
  final String purpose;
  final String url;
  final String? localPath;
  final String uploadedAt;
  final bool isUploading;
  final String? docType;
  final String? approvalStatus;

  FleetDocumentModel({
    required this.name,
    required this.category,
    required this.purpose,
    required this.url,
    this.localPath,
    String? uploadedAt,
    this.isUploading = false,
    this.docType,
    this.approvalStatus = 'approved',
  }) : uploadedAt = uploadedAt ?? DateTime.now().toIso8601String();

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'category': category,
      'purpose': purpose,
      'url': url,
      'uploadedAt': uploadedAt,
      if (docType != null) 'doc_type': docType,
      if (approvalStatus != null) 'approval_status': approvalStatus,
    };
  }

  factory FleetDocumentModel.fromJson(Map<String, dynamic> json) {
    final dType = json['doc_type']?.toString() ?? json['docType']?.toString() ?? json['category']?.toString();
    return FleetDocumentModel(
      name: json['name']?.toString() ?? (dType != null ? dType.replaceAll('_', ' ').toUpperCase() : 'Document'),
      category: json['category']?.toString() ?? dType ?? 'Registration Paper',
      purpose: json['purpose']?.toString() ?? json['category']?.toString() ?? 'Registration Paper',
      url: json['url']?.toString() ?? json['file_url']?.toString() ?? json['filePath']?.toString() ?? '',
      uploadedAt: json['uploadedAt']?.toString() ?? json['uploaded_at']?.toString(),
      docType: dType,
      approvalStatus: json['approval_status']?.toString() ?? json['approvalStatus']?.toString() ?? 'approved',
    );
  }

  FleetDocumentModel copyWith({
    String? name,
    String? category,
    String? purpose,
    String? url,
    String? localPath,
    String? uploadedAt,
    bool? isUploading,
    String? docType,
    String? approvalStatus,
  }) {
    return FleetDocumentModel(
      name: name ?? this.name,
      category: category ?? this.category,
      purpose: purpose ?? this.purpose,
      url: url ?? this.url,
      localPath: localPath ?? this.localPath,
      uploadedAt: uploadedAt ?? this.uploadedAt,
      isUploading: isUploading ?? this.isUploading,
      docType: docType ?? this.docType,
      approvalStatus: approvalStatus ?? this.approvalStatus,
    );
  }
}

class FleetDetailModel {
  final String id;
  final String name;
  final String code;
  final String description;
  final String fleetType;
  final String contactPerson;
  final String email;
  final String phone;
  final String designation;
  final String department;
  final String timeZone;
  final String location;
  final String workingHours;
  final int assignedBuses;
  final int activeDriversCount;
  final String status;
  final String logoUrl;
  final String depotName;
  final dynamic depotId;
  final List<FleetDocumentModel> documents;
  final String createdAt;
  final String updatedAt;

  FleetDetailModel({
    required this.id,
    required this.name,
    this.code = '',
    this.description = '',
    this.fleetType = 'Intracity Transit',
    this.contactPerson = '',
    this.email = '',
    this.phone = '',
    this.designation = 'Fleet Operator Lead',
    this.department = 'Transit Operations',
    this.timeZone = 'Asia/Kolkata (IST)',
    this.location = 'Bangalore Central Hub',
    this.workingHours = '05:00 AM - 11:30 PM',
    this.assignedBuses = 0,
    this.activeDriversCount = 0,
    this.status = 'active',
    this.logoUrl = '',
    this.depotName = 'Central Base Depot',
    this.depotId,
    this.documents = const [],
    this.createdAt = '',
    this.updatedAt = '',
  });

  factory FleetDetailModel.fromJson(Map<String, dynamic> json) {
    String rawDepotName = 'Central Base Depot';
    dynamic rawDepotId;
    if (json['depot'] is Map) {
      final d = Map<String, dynamic>.from(json['depot'] as Map);
      rawDepotName = (d['name'] ?? d['code'] ?? 'Central Base Depot').toString();
      rawDepotId = d['id'];
    } else if (json['depot_name'] != null) {
      rawDepotName = json['depot_name'].toString();
    } else if (json['depot'] != null) {
      rawDepotName = json['depot'].toString();
    }
    if (json['depot_id'] != null) rawDepotId = json['depot_id'];
    if (json['depotId'] != null) rawDepotId = json['depotId'];

    List<FleetDocumentModel> docs = [];
    if (json['documents'] is List) {
      docs = (json['documents'] as List)
          .whereType<Map>()
          .map((d) => FleetDocumentModel.fromJson(Map<String, dynamic>.from(d)))
          .toList();
    }

    final idStr = json['id']?.toString() ?? '';
    final codeStr = json['code']?.toString() ?? (idStr.isNotEmpty ? 'FLT-$idStr' : 'FLT-001');

    return FleetDetailModel(
      id: idStr,
      name: json['name']?.toString() ?? 'Unnamed Fleet',
      code: codeStr,
      description: json['description']?.toString() ?? '',
      fleetType: json['fleet_type']?.toString() ?? json['fleetType']?.toString() ?? 'Intracity Transit',
      contactPerson: json['contact_person']?.toString() ?? json['contactPerson']?.toString() ?? json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      designation: json['designation']?.toString() ?? 'Fleet Operator Lead',
      department: json['department']?.toString() ?? 'Transit Operations',
      timeZone: json['time_zone']?.toString() ?? json['timezone']?.toString() ?? 'Asia/Kolkata (IST)',
      location: json['location']?.toString() ?? json['city']?.toString() ?? 'Bangalore Central Hub',
      workingHours: json['working_hours']?.toString() ?? json['workingHours']?.toString() ?? '05:00 AM - 11:30 PM',
      assignedBuses: _toInt(json['assigned_buses'] ?? json['assignedBuses'] ?? json['vehicle_count'] ?? json['vehiclesCount']),
      activeDriversCount: _toInt(json['active_drivers_count'] ?? json['activeDriversCount'] ?? json['driver_count'] ?? json['driversCount']),
      status: json['status']?.toString() ?? 'active',
      logoUrl: (json['logo_url'] ?? json['logoUrl'] ?? json['avatarUrl'] ?? json['avatar_url'] ?? '').toString(),
      depotName: rawDepotName,
      depotId: rawDepotId,
      documents: docs,
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString() ?? '',
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString() ?? '',
    );
  }

  static int _toInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    return int.tryParse(val.toString()) ?? 0;
  }
}

class RouteStopModel {
  final dynamic id;
  final String name;
  final String address;
  final String fullAddress;
  final String? city;
  final String? state;
  final String? pincode;
  final String? country;
  final String type;
  final double? latitude;
  final double? longitude;
  final int sequence;
  final String eta;
  final double distanceKm;
  final int geofenceRadius;
  final String haltReason;

  RouteStopModel({
    required this.id,
    required this.name,
    this.address = '',
    this.fullAddress = '',
    this.city,
    this.state,
    this.pincode,
    this.country,
    this.type = 'waypoint',
    this.latitude,
    this.longitude,
    this.sequence = 1,
    this.eta = '',
    this.distanceKm = 0.0,
    this.geofenceRadius = 50,
    this.haltReason = '',
  });

  factory RouteStopModel.fromJson(Map<String, dynamic> json) {
    return RouteStopModel(
      id: json['id'] ?? 'stop-${DateTime.now().millisecondsSinceEpoch}',
      name: (json['name'] ?? '').toString(),
      address: (json['address'] ?? json['full_address'] ?? '').toString(),
      fullAddress: (json['full_address'] ?? json['address'] ?? '').toString(),
      city: json['city']?.toString(),
      state: json['state']?.toString(),
      pincode: json['pincode']?.toString(),
      country: json['country']?.toString(),
      type: (json['type'] ?? 'waypoint').toString(),
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      sequence: json['sequence'] != null ? int.tryParse(json['sequence'].toString()) ?? 1 : 1,
      eta: (json['eta'] ?? '').toString(),
      distanceKm: json['distance_km'] != null ? double.tryParse(json['distance_km'].toString()) ?? 0.0 : 0.0,
      geofenceRadius: json['geofence_radius'] != null ? int.tryParse(json['geofence_radius'].toString()) ?? 50 : 50,
      haltReason: (json['halt_reason'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (address.isNotEmpty) 'address': address,
      if (fullAddress.isNotEmpty) 'full_address': fullAddress,
      if (city != null) 'city': city,
      if (state != null) 'state': state,
      if (pincode != null) 'pincode': pincode,
      if (country != null) 'country': country,
      'type': type,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      'sequence': sequence,
      if (eta.isNotEmpty) 'eta': eta,
      if (distanceKm > 0) 'distance_km': distanceKm,
      'geofence_radius': geofenceRadius,
      if (haltReason.isNotEmpty) 'halt_reason': haltReason,
    };
  }
}

class RouteAssignmentModel {
  final dynamic id;
  final dynamic vehicleId;
  final String vehicleRegNo;
  final String vehicleModel;
  final String shift;
  final String status;
  final String notes;
  final String createdAt;

  RouteAssignmentModel({
    required this.id,
    required this.vehicleId,
    this.vehicleRegNo = '',
    this.vehicleModel = '',
    this.shift = 'Full Day',
    this.status = 'active',
    this.notes = '',
    this.createdAt = '',
  });

  factory RouteAssignmentModel.fromJson(Map<String, dynamic> json) {
    String regNo = '';
    String model = '';
    if (json['vehicle'] is Map) {
      final v = json['vehicle'] as Map<String, dynamic>;
      regNo = (v['registration_number'] ?? v['reg_no'] ?? '').toString();
      model = (v['model'] ?? v['make'] ?? '').toString();
    } else {
      regNo = (json['vehicle_reg_no'] ?? json['registration_number'] ?? '').toString();
      model = (json['vehicle_model'] ?? json['model'] ?? '').toString();
    }

    return RouteAssignmentModel(
      id: json['id'],
      vehicleId: json['vehicle_id'] ?? (json['vehicle'] is Map ? json['vehicle']['id'] : null),
      vehicleRegNo: regNo.isNotEmpty ? regNo : 'Vehicle #${json['vehicle_id']}',
      vehicleModel: model,
      shift: (json['shift'] ?? 'Full Day').toString(),
      status: (json['status'] ?? 'active').toString(),
      notes: (json['notes'] ?? '').toString(),
      createdAt: (json['created_at'] ?? '').toString(),
    );
  }
}

class RouteItemModel {
  final dynamic id;
  final String name;
  final String code;
  final String startPoint;
  final double? startLatitude;
  final double? startLongitude;
  final String? startCity;
  final String? startState;
  final String? startPincode;
  final String? startCountry;
  final String? startFullAddress;
  final String endPoint;
  final double? endLatitude;
  final double? endLongitude;
  final String? endCity;
  final String? endState;
  final String? endPincode;
  final String? endCountry;
  final String? endFullAddress;
  final double totalDistanceKm;
  final int totalDurationMin;
  final String? polyline;
  final String status;
  final List<RouteStopModel> stops;
  final List<RouteAssignmentModel> assignments;
  final int scheduledBusesCount;
  final String? createdAt;
  final String? updatedAt;

  RouteItemModel({
    required this.id,
    required this.name,
    this.code = '',
    this.startPoint = '',
    this.startLatitude,
    this.startLongitude,
    this.startCity,
    this.startState,
    this.startPincode,
    this.startCountry,
    this.startFullAddress,
    this.endPoint = '',
    this.endLatitude,
    this.endLongitude,
    this.endCity,
    this.endState,
    this.endPincode,
    this.endCountry,
    this.endFullAddress,
    this.totalDistanceKm = 0.0,
    this.totalDurationMin = 0,
    this.polyline,
    this.status = 'active',
    this.stops = const [],
    this.assignments = const [],
    this.scheduledBusesCount = 0,
    this.createdAt,
    this.updatedAt,
  });

  // Backwards compatibility getters
  String get origin => startPoint;
  String get destination => endPoint;
  String get originDisplay => startPoint.isNotEmpty ? startPoint : 'Origin';
  String get destinationDisplay => endPoint.isNotEmpty ? endPoint : 'Destination';
  String get displayCode => code.isNotEmpty ? code : 'RTE-$id';
  bool get isActive => status.toLowerCase() == 'active';
  bool get isPending => status.toLowerCase() == 'pending_approval' || status.toLowerCase() == 'pending';
  bool get isRejected => status.toLowerCase() == 'rejected';
  int get stopsCount => stops.length;
  int get assignedVehiclesCount => assignments.isNotEmpty
      ? assignments.where((a) => a.status.toLowerCase() == 'active').length
      : scheduledBusesCount;

  factory RouteItemModel.fromJson(Map<String, dynamic> json) {
    // Parse stops
    List<RouteStopModel> stopsList = [];
    if (json['stops'] is List) {
      stopsList = (json['stops'] as List)
          .map((s) => RouteStopModel.fromJson(Map<String, dynamic>.from(s)))
          .toList();
    }

    // Parse assignments
    List<RouteAssignmentModel> assignList = [];
    if (json['assignments'] is List) {
      assignList = (json['assignments'] as List)
          .map((a) => RouteAssignmentModel.fromJson(Map<String, dynamic>.from(a)))
          .toList();
    }

    final sPoint = (json['start_point'] ?? json['origin'] ?? json['source'] ?? '').toString();
    final ePoint = (json['end_point'] ?? json['destination'] ?? '').toString();

    final dist = (json['distance_km'] ?? json['total_distance_km'] ?? json['distance']) != null
        ? double.tryParse((json['distance_km'] ?? json['total_distance_km'] ?? json['distance']).toString()) ?? 0.0
        : 0.0;

    final duration = json['total_duration_min'] != null
        ? int.tryParse(json['total_duration_min'].toString()) ?? 0
        : (json['duration_min'] != null ? int.tryParse(json['duration_min'].toString()) ?? 0 : 0);

    final schedBuses = json['scheduled_buses'] != null
        ? int.tryParse(json['scheduled_buses'].toString()) ?? 0
        : (json['buses_count'] != null ? int.tryParse(json['buses_count'].toString()) ?? 0 : 0);

    return RouteItemModel(
      id: json['id'],
      name: (json['name'] ?? json['code'] ?? 'Route #${json['id']}').toString(),
      code: (json['code'] ?? '').toString(),
      startPoint: sPoint,
      startLatitude: json['start_latitude'] != null ? double.tryParse(json['start_latitude'].toString()) : null,
      startLongitude: json['start_longitude'] != null ? double.tryParse(json['start_longitude'].toString()) : null,
      startCity: json['start_city']?.toString(),
      startState: json['start_state']?.toString(),
      startPincode: json['start_pincode']?.toString(),
      startCountry: json['start_country']?.toString(),
      startFullAddress: json['start_full_address']?.toString(),
      endPoint: ePoint,
      endLatitude: json['end_latitude'] != null ? double.tryParse(json['end_latitude'].toString()) : null,
      endLongitude: json['end_longitude'] != null ? double.tryParse(json['end_longitude'].toString()) : null,
      endCity: json['end_city']?.toString(),
      endState: json['end_state']?.toString(),
      endPincode: json['end_pincode']?.toString(),
      endCountry: json['end_country']?.toString(),
      endFullAddress: json['end_full_address']?.toString(),
      totalDistanceKm: dist,
      totalDurationMin: duration,
      polyline: json['polyline']?.toString(),
      status: (json['status'] ?? 'active').toString(),
      stops: stopsList,
      assignments: assignList,
      scheduledBusesCount: schedBuses,
      createdAt: json['created_at']?.toString(),
      updatedAt: json['updated_at']?.toString(),
    );
  }
}

class GpsDeviceItemModel {
  final dynamic id;
  final String deviceName;
  final String serialNumber;
  final String boxId;
  final String status;
  final String model;

  GpsDeviceItemModel({
    required this.id,
    required this.deviceName,
    this.serialNumber = '',
    this.boxId = '',
    this.status = 'online',
    this.model = '',
  });

  factory GpsDeviceItemModel.fromJson(Map<String, dynamic> json) {
    final sNum = (json['serial_number'] ?? json['serialNumber'] ?? json['code'] ?? '').toString();
    final bId = (json['box_id'] ?? json['boxId'] ?? json['imei'] ?? '').toString();
    final dName = (json['device_name'] ?? json['name'] ?? (sNum.isNotEmpty ? sNum : 'GPS Unit #${json['id']}')).toString();

    return GpsDeviceItemModel(
      id: json['id'],
      deviceName: dName,
      serialNumber: sNum,
      boxId: bId,
      status: (json['status'] ?? 'online').toString(),
      model: (json['model'] ?? '').toString(),
    );
  }
}

class GooglePlaceItemModel {
  final String id;
  final String name;
  final String formattedAddress;
  final double? latitude;
  final double? longitude;
  final String? city;
  final String? state;
  final String? pincode;
  final String? country;
  final String? placeId;

  GooglePlaceItemModel({
    required this.id,
    required this.name,
    required this.formattedAddress,
    this.latitude,
    this.longitude,
    this.city,
    this.state,
    this.pincode,
    this.country,
    this.placeId,
  });

  factory GooglePlaceItemModel.fromJson(Map<String, dynamic> json) {
    String pName = '';
    if (json['displayName'] is Map) {
      pName = (json['displayName']['text'] ?? '').toString();
    } else if (json['name'] != null) {
      pName = json['name'].toString();
    }

    final pAddress = (json['formattedAddress'] ?? json['address'] ?? json['formatted_address'] ?? pName).toString();
    if (pName.isEmpty) pName = pAddress;

    double? lat;
    double? lng;
    if (json['location'] is Map) {
      lat = double.tryParse(json['location']['latitude']?.toString() ?? '');
      lng = double.tryParse(json['location']['longitude']?.toString() ?? '');
    } else {
      lat = double.tryParse(json['latitude']?.toString() ?? '');
      lng = double.tryParse(json['longitude']?.toString() ?? '');
    }

    String? city;
    String? state;
    String? pincode;
    String? country;
    String? placeId = json['id']?.toString();

    if (json['_parsed'] is Map) {
      final parsed = json['_parsed'] as Map<String, dynamic>;
      city = parsed['city']?.toString();
      state = parsed['state']?.toString();
      pincode = parsed['pincode']?.toString();
      country = parsed['country']?.toString();
      placeId = parsed['place_id']?.toString() ?? placeId;
    }

    return GooglePlaceItemModel(
      id: placeId ?? 'place-${DateTime.now().millisecondsSinceEpoch}',
      name: pName,
      formattedAddress: pAddress,
      latitude: lat,
      longitude: lng,
      city: city,
      state: state,
      pincode: pincode,
      country: country,
      placeId: placeId,
    );
  }
}

class GoogleRouteComputeResult {
  final double distanceKm;
  final int durationMinutes;
  final String polyline;
  final List<dynamic> legs;

  GoogleRouteComputeResult({
    required this.distanceKm,
    required this.durationMinutes,
    required this.polyline,
    this.legs = const [],
  });

  factory GoogleRouteComputeResult.fromJson(Map<String, dynamic> json) {
    double distKm = 0.0;
    if (json['distanceKm'] != null) {
      distKm = double.tryParse(json['distanceKm'].toString()) ?? 0.0;
    } else if (json['distanceMeters'] != null) {
      distKm = (double.tryParse(json['distanceMeters'].toString()) ?? 0.0) / 1000.0;
    }

    int durationMin = 0;
    if (json['durationMinutes'] != null) {
      durationMin = int.tryParse(json['durationMinutes'].toString()) ?? 0;
    } else if (json['duration'] != null) {
      final s = json['duration'].toString().replaceAll('s', '');
      final sec = int.tryParse(s) ?? 0;
      durationMin = (sec / 60).round();
    }

    String poly = '';
    if (json['polyline'] is Map) {
      poly = (json['polyline']['encodedPolyline'] ?? '').toString();
    } else if (json['polyline'] != null) {
      poly = json['polyline'].toString();
    }

    final legsList = json['legs'] is List ? json['legs'] as List : [];

    return GoogleRouteComputeResult(
      distanceKm: double.parse(distKm.toStringAsFixed(1)),
      durationMinutes: durationMin,
      polyline: poly,
      legs: legsList,
    );
  }
}



