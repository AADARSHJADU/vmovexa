import 'device_telemetry_model.dart';

class EdgeDeviceModel {
  final dynamic id;
  final String boxId;
  final String deviceId;
  final String name;
  final String serialNumber;
  final String mac;
  final String model;
  final String deviceType;
  final String screenSize;
  final String resolution;
  final String orientation;
  final String status;
  final bool isActive;
  final dynamic vehicleId;
  final String vehicleRegistration;
  final dynamic depotId;
  final String depotName;
  final String ipAddress;
  final String firmwareVersion;
  final String agentVersion;
  final String simNetwork;
  final String lastHeartbeat;
  final String notes;
  final String createdAt;
  final String createdByName;
  final DeviceTelemetryModel? telemetry;

  EdgeDeviceModel({
    required this.id,
    this.boxId = '',
    this.deviceId = '',
    this.name = '',
    this.serialNumber = '',
    this.mac = '',
    this.model = '',
    this.deviceType = 'Display Device',
    this.screenSize = '22"',
    this.resolution = '1920x1080',
    this.orientation = 'Landscape',
    this.status = 'offline',
    this.isActive = true,
    this.vehicleId,
    String? vehicleReg,
    String vehicleRegistration = '—',
    this.depotId,
    this.depotName = '—',
    this.ipAddress = '—',
    this.firmwareVersion = 'v1.0.0',
    this.agentVersion = 'v2.4.1',
    this.simNetwork = 'Airtel 4G IoT',
    this.lastHeartbeat = '',
    this.notes = '',
    this.createdAt = '',
    this.createdByName = 'System',
    this.telemetry,
  }) : vehicleRegistration = (vehicleReg != null && vehicleReg.isNotEmpty) ? vehicleReg : vehicleRegistration;

  bool get isOnline => status.toLowerCase() == 'online';
  String get vehicleReg => vehicleRegistration;
  bool get isOffline => status.toLowerCase() == 'offline';
  bool get hasIssues =>
      status.toLowerCase() == 'maintenance' ||
      status.toLowerCase() == 'warning' ||
      status.toLowerCase() == 'error';

  String get displayId => boxId.isNotEmpty
      ? boxId
      : (deviceId.isNotEmpty ? deviceId : 'VMX-DEV-$id');
  String get idStr => id?.toString() ?? '';

  factory EdgeDeviceModel.fromJson(Map<String, dynamic> json) {
    DeviceTelemetryModel? tele;
    if (json['telemetry'] is Map) {
      tele = DeviceTelemetryModel.fromJson(Map<String, dynamic>.from(json['telemetry']));
    }

    final vehStr = (json['vehicle_registration'] ??
            json['vehicleRegistration'] ??
            json['bus_number'] ??
            json['busNumber'] ??
            json['vehicle']?['registration_number'] ??
            json['vehicle']?['bus_number'] ??
            '—')
        .toString();

    final depStr = (json['depot_name'] ??
            json['depotName'] ??
            json['depot']?['name'] ??
            '—')
        .toString();

    final rawBoxId = (json['box_id'] ?? json['boxId'] ?? json['device_id'] ?? json['deviceId'] ?? json['code'] ?? '').toString();
    final rawMac = (json['mac'] ?? json['mac_address'] ?? json['macAddress'] ?? json['serial_number'] ?? json['serialNumber'] ?? '').toString();
    final rawAgent = (json['agent_version'] ?? json['agentVersion'] ?? json['firmware_version'] ?? json['firmwareVersion'] ?? 'v2.4.1').toString();
    final rawSim = (json['sim_network'] ?? json['simNetwork'] ?? json['network_type'] ?? 'Airtel 4G IoT').toString();

    return EdgeDeviceModel(
      id: (json['id'] ?? json['_id'] ?? json['device_id'] ?? '').toString(),
      boxId: rawBoxId,
      deviceId: rawBoxId,
      name: (json['name'] ?? json['device_name'] ?? json['deviceName'] ?? rawBoxId).toString(),
      serialNumber: rawMac,
      mac: rawMac,
      model: (json['model'] ?? json['hardware_model'] ?? json['hardwareModel'] ?? 'VMX-DISP-PRO').toString(),
      deviceType: (json['device_type'] ?? json['deviceType'] ?? json['type'] ?? 'Passenger Display').toString(),
      screenSize: (json['screen_size'] ?? json['screenSize'] ?? '22"').toString(),
      resolution: (json['resolution'] ?? '1920x1080').toString(),
      orientation: (json['orientation'] ?? 'Landscape').toString(),
      status: (json['status'] ?? (json['is_active'] == false ? 'offline' : 'online')).toString().toLowerCase(),
      isActive: json['is_active'] ?? json['isActive'] ?? true,
      vehicleId: json['vehicle_id'] ?? json['vehicleId'] ?? json['vehicle']?['id'],
      vehicleRegistration: vehStr,
      depotId: json['depot_id'] ?? json['depotId'] ?? json['depot']?['id'],
      depotName: depStr,
      ipAddress: (json['ip_address'] ?? json['ipAddress'] ?? tele?.ipAddress ?? '—').toString(),
      firmwareVersion: (json['firmware_version'] ?? json['firmwareVersion'] ?? 'v1.0.0').toString(),
      agentVersion: rawAgent,
      simNetwork: rawSim,
      lastHeartbeat: (json['last_heartbeat'] ?? json['lastHeartbeat'] ?? tele?.lastHeartbeat ?? '').toString(),
      notes: (json['notes'] ?? '').toString(),
      createdAt: (json['created_at'] ?? json['createdAt'] ?? '').toString(),
      createdByName: (json['createdByUser']?['name'] ?? json['created_by_name'] ?? 'System').toString(),
      telemetry: tele,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'box_id': boxId,
    'boxId': boxId,
    'device_id': deviceId,
    'name': name,
    'serial_number': serialNumber,
    'mac': mac,
    'model': model,
    'device_type': deviceType,
    'screen_size': screenSize,
    'resolution': resolution,
    'orientation': orientation,
    'status': status,
    'is_active': isActive,
    'isActive': isActive,
    if (vehicleId != null) 'vehicle_id': vehicleId,
    if (vehicleId != null) 'vehicleId': vehicleId,
    'vehicle_registration': vehicleRegistration,
    if (depotId != null) 'depot_id': depotId,
    if (depotId != null) 'depotId': depotId,
    'depot_name': depotName,
    'ip_address': ipAddress,
    'firmware_version': firmwareVersion,
    'agent_version': agentVersion,
    'sim_network': simNetwork,
    'last_heartbeat': lastHeartbeat,
    'notes': notes,
    'created_at': createdAt,
    if (telemetry != null) 'telemetry': telemetry!.toJson(),
  };
}
