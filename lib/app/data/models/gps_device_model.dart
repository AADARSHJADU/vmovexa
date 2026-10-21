class GpsDeviceModel {
  final dynamic id;
  final String code;
  final String imei;
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
  final String mountingPosition;
  final String powerWire;
  final String? installedAt;
  final String notes;
  final String imageUrl;
  final dynamic vehicleId;
  final GpsBoundVehicleModel? vehicle;

  GpsDeviceModel({
    required this.id,
    this.code = '',
    this.imei = '',
    this.type = 'external',
    this.vendor = 'Teltonika',
    this.model = 'Teltonika FMB920',
    this.serialNumber = '',
    this.aliasName = '',
    this.status = 'available',
    this.sim = '',
    this.simProvider = 'Jio',
    this.network = 'Jio 4G IoT',
    this.networkType = '4G LTE-M',
    this.batteryCapacity = '1200 mAh',
    this.firmware = 'v3.2.14-PROD',
    this.mountingPosition = 'Behind Driver Dashboard',
    this.powerWire = 'Direct Battery Constant (+12V/24V)',
    this.installedAt,
    this.notes = '',
    this.imageUrl = '',
    this.vehicleId,
    this.vehicle,
  });

  bool get isAvailable {
    final s = status.toLowerCase();
    return s == 'available' || s == 'online';
  }

  bool get isAssigned {
    final s = status.toLowerCase();
    return s == 'assigned' || (vehicleId != null && vehicleId.toString().isNotEmpty && vehicleId != 0);
  }

  bool get isPending {
    return status.toLowerCase() == 'pending_approval';
  }

  bool get isRejected {
    return status.toLowerCase() == 'rejected';
  }

  String get displayCode {
    if (code.isNotEmpty) return code;
    return 'GPS-$id';
  }

  factory GpsDeviceModel.fromJson(Map<String, dynamic> json) {
    GpsBoundVehicleModel? boundVehicle;
    if (json['vehicle'] is Map) {
      boundVehicle = GpsBoundVehicleModel.fromJson(Map<String, dynamic>.from(json['vehicle']));
    }

    return GpsDeviceModel(
      id: json['id'],
      code: (json['code'] ?? json['device_id'] ?? '').toString(),
      imei: (json['imei'] ?? '').toString(),
      type: (json['type'] ?? 'external').toString(),
      vendor: (json['vendor'] ?? 'Teltonika').toString(),
      model: (json['model'] ?? 'Teltonika FMB920').toString(),
      serialNumber: (json['serial_number'] ?? json['serialNumber'] ?? '').toString(),
      aliasName: (json['alias_name'] ?? json['aliasName'] ?? '').toString(),
      status: (json['status'] ?? 'available').toString(),
      sim: (json['sim'] ?? json['sim_number'] ?? json['simNumber'] ?? '').toString(),
      simProvider: (json['sim_provider'] ?? json['simProvider'] ?? 'Jio').toString(),
      network: (json['network'] ?? 'Jio 4G IoT').toString(),
      networkType: (json['network_type'] ?? json['networkType'] ?? '4G LTE-M').toString(),
      batteryCapacity: (json['battery_capacity'] ?? json['batteryCapacity'] ?? '1200 mAh').toString(),
      firmware: (json['firmware'] ?? 'v3.2.14-PROD').toString(),
      mountingPosition: (json['mounting_position'] ?? json['mountingPosition'] ?? 'Behind Driver Dashboard').toString(),
      powerWire: (json['power_wire'] ?? json['powerWire'] ?? 'Direct Battery Constant (+12V/24V)').toString(),
      installedAt: json['installed_at']?.toString() ?? json['installation_date']?.toString(),
      notes: (json['notes'] ?? '').toString(),
      imageUrl: (json['image_url'] ?? json['imageUrl'] ?? '').toString(),
      vehicleId: json['vehicle_id'] ?? json['vehicleId'],
      vehicle: boundVehicle,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'imei': imei,
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
      'mounting_position': mountingPosition,
      'power_wire': powerWire,
      if (installedAt != null) 'installed_at': installedAt,
      'notes': notes,
      'image_url': imageUrl,
      if (vehicleId != null) 'vehicle_id': vehicleId,
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

  GpsBoundVehicleModel({
    required this.id,
    this.busNumber = '',
    this.registrationNumber = '',
    this.model = '',
    this.status = '',
    this.vin = '',
  });

  factory GpsBoundVehicleModel.fromJson(Map<String, dynamic> json) {
    return GpsBoundVehicleModel(
      id: json['id'],
      busNumber: (json['bus_number'] ?? json['busNumber'] ?? json['registration_number'] ?? '').toString(),
      registrationNumber: (json['registration_number'] ?? json['registrationNumber'] ?? '').toString(),
      model: (json['model'] ?? '').toString(),
      status: (json['status'] ?? '').toString(),
      vin: (json['vin'] ?? '').toString(),
    );
  }
}
