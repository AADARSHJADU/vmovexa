class GpsDeviceModel {
  final dynamic id;
  final String boxId;
  final String code;
  final String imei;
  final String mac;
  final String type;
  final String vendor;
  final String model;
  final String serialNumber;
  final String aliasName;
  final String status;
  final String sim;
  final String simProvider;
  final String network;
  final String networkType;
  final String batteryCapacity;
  final String firmware;
  final String agentVersion;
  final int storageUsedGb;
  final int storageTotalGb;
  final double? latestLatitude;
  final double? latestLongitude;
  final double? latestSpeed;
  final String mountingPosition;
  final String powerWire;
  final String? installedAt;
  final String notes;
  final String imageUrl;
  final dynamic vehicleId;
  final GpsBoundVehicleModel? vehicle;

  GpsDeviceModel({
    required this.id,
    this.boxId = '',
    this.code = '',
    this.imei = '',
    this.mac = '',
    this.type = 'external',
    this.vendor = 'Teltonika',
    this.model = 'EdgeBox-500',
    this.serialNumber = '',
    this.aliasName = '',
    this.status = 'available',
    this.sim = '',
    this.simProvider = 'Jio',
    this.network = 'Jio 4G IoT',
    this.networkType = '4G LTE-M',
    this.batteryCapacity = '1200 mAh',
    this.firmware = 'v3.2.14-PROD',
    this.agentVersion = '1.0.4',
    this.storageUsedGb = 0,
    this.storageTotalGb = 64,
    this.latestLatitude,
    this.latestLongitude,
    this.latestSpeed,
    this.mountingPosition = 'Behind Driver Dashboard',
    this.powerWire = 'Direct Battery Constant (+12V/24V)',
    this.installedAt,
    this.notes = '',
    this.imageUrl = '',
    this.vehicleId,
    this.vehicle,
  });

  bool get isOnline {
    final s = status.toLowerCase();
    return s == 'online' || s == 'active';
  }

  bool get isAvailable {
    final s = status.toLowerCase();
    return s == 'available' || s == 'online' || s == 'standby';
  }

  bool get isAssigned {
    final s = status.toLowerCase();
    return s == 'assigned' ||
        (vehicleId != null && vehicleId.toString().isNotEmpty && vehicleId != 0 && vehicleId != '0') ||
        (vehicle != null && vehicle!.busNumber.isNotEmpty);
  }

  bool get isPending {
    return status.toLowerCase() == 'pending_approval';
  }

  bool get isRejected {
    return status.toLowerCase() == 'rejected';
  }

  bool get isMaintenance {
    return status.toLowerCase() == 'maintenance';
  }

  String get displayCode {
    if (boxId.isNotEmpty) return boxId;
    if (code.isNotEmpty) return code;
    return 'EDGE-$id';
  }

  String get displayMacOrImei {
    if (mac.isNotEmpty) return mac;
    if (imei.isNotEmpty) return imei;
    if (serialNumber.isNotEmpty) return serialNumber;
    return '—';
  }

  factory GpsDeviceModel.fromJson(Map<String, dynamic> json) {
    GpsBoundVehicleModel? boundVehicle;
    if (json['vehicle'] is Map) {
      boundVehicle = GpsBoundVehicleModel.fromJson(Map<String, dynamic>.from(json['vehicle']));
    }

    final rawBoxId = (json['box_id'] ?? json['boxId'] ?? json['device_id'] ?? json['deviceId'] ?? json['code'] ?? '').toString();
    final rawMac = (json['mac'] ?? json['mac_address'] ?? json['macAddress'] ?? '').toString();
    final rawImei = (json['imei'] ?? '').toString();
    final rawSerial = (json['serial_number'] ?? json['serialNumber'] ?? (rawMac.isNotEmpty ? rawMac : rawImei)).toString();
    final rawAgent = (json['agent_version'] ?? json['agentVersion'] ?? json['firmware_version'] ?? json['firmwareVersion'] ?? '1.0.4').toString();

    // Latest GPS telemetry parsing
    double? lat;
    double? lng;
    double? speed;
    if (json['latestGps'] is Map) {
      final gpsMap = json['latestGps'] as Map;
      lat = double.tryParse(gpsMap['latitude']?.toString() ?? '');
      lng = double.tryParse(gpsMap['longitude']?.toString() ?? '');
      speed = double.tryParse(gpsMap['speed']?.toString() ?? '');
    } else if (json['telemetry'] is Map) {
      final teleMap = json['telemetry'] as Map;
      lat = double.tryParse(teleMap['latitude']?.toString() ?? '');
      lng = double.tryParse(teleMap['longitude']?.toString() ?? '');
      speed = double.tryParse(teleMap['speed']?.toString() ?? '');
    }

    int usedGb = int.tryParse(json['storage_used_gb']?.toString() ?? json['storageUsedGb']?.toString() ?? '12') ?? 12;
    int totalGb = int.tryParse(json['storage_total_gb']?.toString() ?? json['storageTotalGb']?.toString() ?? '64') ?? 64;

    return GpsDeviceModel(
      id: json['id'] ?? rawBoxId,
      boxId: rawBoxId,
      code: (json['code'] ?? rawBoxId).toString(),
      imei: rawImei,
      mac: rawMac.isNotEmpty ? rawMac : rawImei,
      type: (json['type'] ?? json['device_type'] ?? 'external').toString(),
      vendor: (json['vendor'] ?? 'VMovexa').toString(),
      model: (json['model'] ?? json['hardware_model'] ?? 'EdgeBox-500').toString(),
      serialNumber: rawSerial,
      aliasName: (json['alias_name'] ?? json['aliasName'] ?? json['name'] ?? '').toString(),
      status: (json['status'] ?? (json['is_active'] == false ? 'offline' : 'online')).toString(),
      sim: (json['sim'] ?? json['sim_number'] ?? json['sim_network'] ?? json['simNetwork'] ?? '').toString(),
      simProvider: (json['sim_provider'] ?? json['simProvider'] ?? 'Jio').toString(),
      network: (json['network'] ?? json['sim_network'] ?? json['simNetwork'] ?? 'Jio 4G IoT').toString(),
      networkType: (json['network_type'] ?? json['networkType'] ?? '4G LTE-M').toString(),
      batteryCapacity: (json['battery_capacity'] ?? json['batteryCapacity'] ?? '1200 mAh').toString(),
      firmware: (json['firmware'] ?? 'v3.2.14-PROD').toString(),
      agentVersion: rawAgent,
      storageUsedGb: usedGb,
      storageTotalGb: totalGb,
      latestLatitude: lat,
      latestLongitude: lng,
      latestSpeed: speed,
      mountingPosition: (json['mounting_position'] ?? json['mountingPosition'] ?? 'Behind Driver Dashboard').toString(),
      powerWire: (json['power_wire'] ?? json['powerWire'] ?? 'Direct Battery Constant (+12V/24V)').toString(),
      installedAt: json['installed_at']?.toString() ?? json['installation_date']?.toString(),
      notes: (json['notes'] ?? '').toString(),
      imageUrl: (json['image_url'] ?? json['imageUrl'] ?? '').toString(),
      vehicleId: json['vehicle_id'] ?? json['vehicleId'] ?? json['vehicle']?['id'],
      vehicle: boundVehicle,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'box_id': boxId,
      'code': code,
      'imei': imei,
      'mac': mac,
      'type': type,
      'vendor': vendor,
      'model': model,
      'serial_number': serialNumber,
      'alias_name': aliasName,
      'status': status,
      'sim': sim,
      'sim_provider': simProvider,
      'network': network,
      'network_type': networkType,
      'battery_capacity': batteryCapacity,
      'firmware': firmware,
      'agent_version': agentVersion,
      'storage_used_gb': storageUsedGb,
      'storage_total_gb': storageTotalGb,
      'mounting_position': mountingPosition,
      'power_wire': powerWire,
      if (installedAt != null) 'installed_at': installedAt,
      'notes': notes,
      'image_url': imageUrl,
      if (vehicleId != null) 'vehicle_id': vehicleId,
      if (vehicleId != null) 'vehicleId': vehicleId,
    };
  }
}

class GpsBoundVehicleModel {
  final dynamic id;
  final String busNumber;
  final String registrationNumber;
  final String model;
  final String status;
  final String vin;
  final String fleetName;
  final String orgName;
  final String depotName;
  final dynamic fleetId;
  final dynamic orgId;
  final dynamic depotId;

  GpsBoundVehicleModel({
    required this.id,
    this.busNumber = '',
    this.registrationNumber = '',
    this.model = '',
    this.status = '',
    this.vin = '',
    this.fleetName = '',
    this.orgName = '',
    this.depotName = '',
    this.fleetId,
    this.orgId,
    this.depotId,
  });

  factory GpsBoundVehicleModel.fromJson(Map<String, dynamic> json) {
    String fName = '';
    dynamic fId;
    if (json['fleet'] is Map) {
      fName = (json['fleet']['name'] ?? json['fleet']['code'] ?? '').toString();
      fId = json['fleet']['id'];
    } else {
      fName = (json['fleet_name'] ?? json['fleetName'] ?? '').toString();
      fId = json['fleet_id'] ?? json['fleetId'];
    }

    String oName = '';
    dynamic oId;
    if (json['organization'] is Map) {
      oName = (json['organization']['name'] ?? '').toString();
      oId = json['organization']['id'];
    } else {
      oName = (json['organization_name'] ?? json['organizationName'] ?? '').toString();
      oId = json['organization_id'] ?? json['organizationId'];
    }

    String dName = '';
    dynamic dId;
    if (json['depot'] is Map) {
      dName = (json['depot']['name'] ?? '').toString();
      dId = json['depot']['id'];
    } else {
      dName = (json['depot_name'] ?? json['depotName'] ?? '').toString();
      dId = json['depot_id'] ?? json['depotId'];
    }

    return GpsBoundVehicleModel(
      id: json['id'],
      busNumber: (json['bus_number'] ?? json['busNumber'] ?? json['registration_number'] ?? '').toString(),
      registrationNumber: (json['registration_number'] ?? json['registrationNumber'] ?? '').toString(),
      model: (json['model'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      vin: (json['vin'] ?? '').toString(),
      fleetName: fName,
      orgName: oName,
      depotName: dName,
      fleetId: fId,
      orgId: oId,
      depotId: dId,
    );
  }
}
