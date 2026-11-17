class DeviceTelemetryModel {
  final String deviceId;
  final String serialNumber;
  final String status;
  final String ipAddress;
  final int? cellularSignalDbm;
  final String cellularNetwork;
  final double? cpuUsagePct;
  final int? ramUsedMb;
  final int? ramTotalMb;
  final double? diskUsagePct;
  final double? temperatureCelsius;
  final String lastHeartbeat;
  final int? activeScreensCount;
  final bool mqttConnected;

  // Additional Subsystems fields matching TechDiagnosticsPage.jsx
  final int? satellitesCount;
  final String? gpsAccuracy;
  final bool gpsLocked;
  final bool? gpsConnected;
  final double? lat;
  final double? lng;
  final double? speed;
  final double? heading;
  final String? rawSocTemp;
  final String? rawStorageFree;
  final String? rawCpuUsage;
  final String? rawRamUsage;
  final int? rawConnectedScreens;
  final int? rawSignalDbm;

  DeviceTelemetryModel({
    this.deviceId = '',
    this.serialNumber = '',
    this.status = 'offline',
    this.ipAddress = '—',
    this.cellularSignalDbm,
    this.cellularNetwork = '4G LTE',
    this.cpuUsagePct,
    this.ramUsedMb,
    this.ramTotalMb,
    this.diskUsagePct,
    this.temperatureCelsius,
    this.lastHeartbeat = '',
    this.activeScreensCount,
    this.mqttConnected = false,
    this.satellitesCount,
    this.gpsAccuracy,
    this.gpsLocked = false,
    this.gpsConnected,
    this.lat,
    this.lng,
    this.speed,
    this.heading,
    this.rawSocTemp,
    this.rawStorageFree,
    this.rawCpuUsage,
    this.rawRamUsage,
    this.rawConnectedScreens,
    this.rawSignalDbm,
  });

  bool get isOnline => status.toLowerCase() == 'online' || mqttConnected;

  double get ramUsagePct {
    if (ramTotalMb == null || ramTotalMb! <= 0 || ramUsedMb == null) return 0.0;
    return (ramUsedMb! / ramTotalMb!) * 100.0;
  }

  // Formatting helpers matching Admin Panel (no fake fallbacks)
  String get socTemp => rawSocTemp?.isNotEmpty == true
      ? rawSocTemp!
      : (temperatureCelsius != null && temperatureCelsius! > 0 ? '${temperatureCelsius!.toStringAsFixed(1)}°C' : '—');

  String get cpuUsage => rawCpuUsage?.isNotEmpty == true
      ? rawCpuUsage!
      : (cpuUsagePct != null && cpuUsagePct! > 0 ? '${cpuUsagePct!.toStringAsFixed(1)}%' : '—');

  String get ramUsage => rawRamUsage?.isNotEmpty == true
      ? rawRamUsage!
      : (ramUsedMb != null && ramUsedMb! > 0 ? '${ramUsagePct.toStringAsFixed(1)}%' : '—');

  String get storageFree => rawStorageFree?.isNotEmpty == true
      ? rawStorageFree!
      : (diskUsagePct != null && diskUsagePct! > 0 ? '${(100.0 - diskUsagePct!).toStringAsFixed(1)}% Free' : '—');

  int? get connectedScreens => rawConnectedScreens ?? activeScreensCount;

  int? get signalDbm => rawSignalDbm ?? cellularSignalDbm;

  factory DeviceTelemetryModel.fromJson(Map<String, dynamic> json) {
    final sig = int.tryParse(json['signal_dbm']?.toString() ??
        json['cellular_signal_dbm']?.toString() ??
        json['cellularSignalDbm']?.toString() ??
        '');

    final rawGps = json['latestGps'] is Map
        ? json['latestGps'] as Map<String, dynamic>
        : (json['latest_gps'] is Map ? json['latest_gps'] as Map<String, dynamic> : null);

    final sats = int.tryParse(json['satellites_count']?.toString() ??
        json['satellites']?.toString() ??
        json['satellitesCount']?.toString() ??
        rawGps?['satellites']?.toString() ??
        '');

    final screens = int.tryParse(json['connected_screens']?.toString() ??
        json['active_screens_count']?.toString() ??
        json['activeScreensCount']?.toString() ??
        '');

    final isLocked = json['gps_locked'] == true ||
        json['gpsLocked'] == true ||
        json['gps_status'] == 'locked' ||
        json['gps_status'] == 'active' ||
        rawGps?['gps_locked'] == true ||
        (sats != null && sats > 3);

    final gpsConn = json['gps_connected'] == true ||
        json['gpsConnected'] == true ||
        (rawGps != null && rawGps['is_stale'] != true);

    final latVal = double.tryParse(json['lat']?.toString() ?? rawGps?['lat']?.toString() ?? '');
    final lngVal = double.tryParse(json['lng']?.toString() ?? rawGps?['lng']?.toString() ?? '');
    final spdVal = double.tryParse(json['speed']?.toString() ?? rawGps?['speed']?.toString() ?? '');
    final hdgVal = double.tryParse(json['heading']?.toString() ?? rawGps?['heading']?.toString() ?? '');

    return DeviceTelemetryModel(
      deviceId: (json['device_id'] ?? json['deviceId'] ?? json['id'] ?? '').toString(),
      serialNumber: (json['serial_number'] ?? json['serialNumber'] ?? '').toString(),
      status: (json['status'] ?? 'offline').toString(),
      ipAddress: (json['ip_address'] ?? json['ipAddress'] ?? '—').toString(),
      cellularSignalDbm: sig,
      cellularNetwork: (json['cellular_network'] ?? json['cellularNetwork'] ?? json['sim_network'] ?? '4G LTE').toString(),
      cpuUsagePct: double.tryParse(json['cpu_usage_pct']?.toString() ?? json['cpuUsagePct']?.toString() ?? ''),
      ramUsedMb: int.tryParse(json['ram_used_mb']?.toString() ?? json['ramUsedMb']?.toString() ?? ''),
      ramTotalMb: int.tryParse(json['ram_total_mb']?.toString() ?? json['ramTotalMb']?.toString() ?? ''),
      diskUsagePct: double.tryParse(json['disk_usage_pct']?.toString() ?? json['diskUsagePct']?.toString() ?? ''),
      temperatureCelsius: double.tryParse(json['temperature_celsius']?.toString() ?? json['temperatureCelsius']?.toString() ?? ''),
      lastHeartbeat: (json['last_heartbeat'] ?? json['lastHeartbeat'] ?? '').toString(),
      activeScreensCount: screens,
      mqttConnected: json['mqtt_connected'] == true || json['mqttConnected'] == true,
      satellitesCount: sats,
      gpsAccuracy: json['gps_accuracy']?.toString() ?? json['accuracy']?.toString(),
      gpsLocked: isLocked,
      gpsConnected: gpsConn,
      lat: latVal,
      lng: lngVal,
      speed: spdVal,
      heading: hdgVal,
      rawSocTemp: json['soc_temp']?.toString(),
      rawStorageFree: json['storage_free']?.toString(),
      rawCpuUsage: json['cpu_usage']?.toString(),
      rawRamUsage: json['ram_usage']?.toString(),
      rawConnectedScreens: screens,
      rawSignalDbm: sig,
    );
  }

  Map<String, dynamic> toJson() => {
    'device_id': deviceId,
    'serial_number': serialNumber,
    'status': status,
    'ip_address': ipAddress,
    'cellular_signal_dbm': cellularSignalDbm,
    'cellular_network': cellularNetwork,
    'cpu_usage_pct': cpuUsagePct,
    'ram_used_mb': ramUsedMb,
    'ram_total_mb': ramTotalMb,
    'disk_usage_pct': diskUsagePct,
    'temperature_celsius': temperatureCelsius,
    'last_heartbeat': lastHeartbeat,
    'active_screens_count': activeScreensCount,
    'mqtt_connected': mqttConnected,
    'satellites_count': satellitesCount,
    'gps_accuracy': gpsAccuracy,
    'gps_locked': gpsLocked,
  };
}
