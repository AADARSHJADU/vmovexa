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
  final String make;
  final String model;
  final int? year;
  final int capacity;
  final String fuelType;
  final String status;
  final String? assignedDriverName;
  final double? speedKmh;
  final int? batterySocPct;
  final String? fleetName;

  VehicleItemModel({
    required this.id,
    required this.registrationNumber,
    this.make = '',
    this.model = '',
    this.year,
    this.capacity = 0,
    this.fuelType = 'diesel',
    this.status = 'active',
    this.assignedDriverName,
    this.speedKmh,
    this.batterySocPct,
    this.fleetName,
  });

  factory VehicleItemModel.fromJson(Map<String, dynamic> json) {
    return VehicleItemModel(
      id: json['id']?.toString() ?? '',
      registrationNumber: json['registration_number']?.toString() ?? json['registrationNumber']?.toString() ?? 'N/A',
      make: json['make']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      year: json['year'] is int ? json['year'] : int.tryParse(json['year']?.toString() ?? ''),
      capacity: _toInt(json['capacity']),
      fuelType: json['fuel_type']?.toString() ?? json['fuelType']?.toString() ?? 'diesel',
      status: json['status']?.toString() ?? 'active',
      assignedDriverName: json['assigned_driver_name'] ?? json['driver']?['name'],
      speedKmh: (json['speed_kmh'] ?? json['speed']) != null ? double.tryParse((json['speed_kmh'] ?? json['speed']).toString()) : null,
      batterySocPct: json['battery_soc_pct'] != null ? int.tryParse(json['battery_soc_pct'].toString()) : null,
      fleetName: json['fleet_name'] ?? json['fleet']?['name'],
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
  final String licenseNumber;
  final String status;
  final String? assignedVehicleReg;
  final double rating;

  DriverItemModel({
    required this.id,
    required this.name,
    this.phone = '',
    this.email = '',
    this.licenseNumber = '',
    this.status = 'active',
    this.assignedVehicleReg,
    this.rating = 5.0,
  });

  factory DriverItemModel.fromJson(Map<String, dynamic> json) {
    return DriverItemModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['full_name']?.toString() ?? 'Unnamed Driver',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      licenseNumber: json['license_number']?.toString() ?? json['licenseNumber']?.toString() ?? 'N/A',
      status: json['status']?.toString() ?? 'active',
      assignedVehicleReg: json['assigned_vehicle_reg'] ?? json['vehicle']?['registration_number'],
      rating: json['rating'] != null ? (double.tryParse(json['rating'].toString()) ?? 5.0) : 5.0,
    );
  }
}
