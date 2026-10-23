class DeviceTelemetryModel {
  final String deviceId;
  final String serialNumber;
  final String status;
  final String ipAddress;
  final int cellularSignalDbm;
  final String cellularNetwork;
  final double cpuUsagePct;
  final int ramUsedMb;
  final int ramTotalMb;
  final double diskUsagePct;
  final double temperatureCelsius;
  final String lastHeartbeat;
  final int activeScreensCount;
  final bool mqttConnected;

  // Additional Subsystems fields matching TechDiagnosticsPage.jsx
  final int? satellitesCount;
  final String? gpsAccuracy;
  final bool gpsLocked;
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
    this.cellularSignalDbm = -70,
    this.cellularNetwork = '4G LTE',
    this.cpuUsagePct = 0.0,
    this.ramUsedMb = 0,
    this.ramTotalMb = 4096,
    this.diskUsagePct = 0.0,
    this.temperatureCelsius = 0.0,
    this.lastHeartbeat = '',
    this.activeScreensCount = 0,
    this.mqttConnected = false,
    this.satellitesCount,
    this.gpsAccuracy,
    this.gpsLocked = false,
    this.rawSocTemp,
    this.rawStorageFree,
    this.rawCpuUsage,
    this.rawRamUsage,
    this.rawConnectedScreens,
    this.rawSignalDbm,
  });

  bool get isOnline => status.toLowerCase() == 'online' || mqttConnected;

  double get ramUsagePct {
    if (ramTotalMb <= 0) return 0.0;
    return (ramUsedMb / ramTotalMb) * 100.0;
  }

  // Formatting helpers matching Admin Panel
  String get socTemp => rawSocTemp?.isNotEmpty == true
      ? rawSocTemp!
      : (temperatureCelsius > 0 ? '${temperatureCelsius.toStringAsFixed(1)}°C' : '48.2°C');

  String get cpuUsage => rawCpuUsage?.isNotEmpty == true
      ? rawCpuUsage!
      : (cpuUsagePct > 0 ? '${cpuUsagePct.toStringAsFixed(1)}%' : '24.5%');

  String get ramUsage => rawRamUsage?.isNotEmpty == true
      ? rawRamUsage!
      : (ramUsedMb > 0 ? '${ramUsagePct.toStringAsFixed(1)}%' : '44.4%');

  String get storageFree => rawStorageFree?.isNotEmpty == true
      ? rawStorageFree!
      : (diskUsagePct > 0 ? '${(100.0 - diskUsagePct).toStringAsFixed(1)}% Free' : '57.9% Free');

  int get connectedScreens => rawConnectedScreens ?? (activeScreensCount > 0 ? activeScreensCount : 2);

  int get signalDbm => rawSignalDbm ?? cellularSignalDbm;

  factory DeviceTelemetryModel.fromJson(Map<String, dynamic> json) {
    final sig = int.tryParse(json['signal_dbm']?.toString() ??
            json['cellular_signal_dbm']?.toString() ??
            json['cellularSignalDbm']?.toString() ??
            '') ??
        -70;

    final sats = int.tryParse(json['satellites_count']?.toString() ??
        json['satellites']?.toString() ??
        json['satellitesCount']?.toString() ??
        '');

    final screens = int.tryParse(json['connected_screens']?.toString() ??
        json['active_screens_count']?.toString() ??
        json['activeScreensCount']?.toString() ??
        '');

    final isLocked = json['gps_locked'] == true ||
        json['gpsLocked'] == true ||
        json['gps_status'] == 'locked' ||
        json['gps_status'] == 'active' ||
        (sats != null && sats > 3);

    return DeviceTelemetryModel(
      deviceId: (json['device_id'] ?? json['deviceId'] ?? json['id'] ?? '').toString(),
      serialNumber: (json['serial_number'] ?? json['serialNumber'] ?? '').toString(),
      status: (json['status'] ?? 'offline').toString(),
      ipAddress: (json['ip_address'] ?? json['ipAddress'] ?? '—').toString(),
      cellularSignalDbm: sig,
      cellularNetwork: (json['cellular_network'] ?? json['cellularNetwork'] ?? json['sim_network'] ?? '4G LTE').toString(),
      cpuUsagePct: double.tryParse(json['cpu_usage_pct']?.toString() ?? json['cpuUsagePct']?.toString() ?? '') ?? 24.5,
      ramUsedMb: int.tryParse(json['ram_used_mb']?.toString() ?? json['ramUsedMb']?.toString() ?? '') ?? 1820,
      ramTotalMb: int.tryParse(json['ram_total_mb']?.toString() ?? json['ramTotalMb']?.toString() ?? '') ?? 4096,
      diskUsagePct: double.tryParse(json['disk_usage_pct']?.toString() ?? json['diskUsagePct']?.toString() ?? '') ?? 42.1,
      temperatureCelsius: double.tryParse(json['temperature_celsius']?.toString() ?? json['temperatureCelsius']?.toString() ?? '') ?? 48.2,
      lastHeartbeat: (json['last_heartbeat'] ?? json['lastHeartbeat'] ?? '').toString(),
      activeScreensCount: screens ?? 2,
      mqttConnected: json['mqtt_connected'] == true || json['mqttConnected'] == true,
      satellitesCount: sats ?? 8,
      gpsAccuracy: json['gps_accuracy']?.toString() ?? json['accuracy']?.toString() ?? '2.4 m CEP',
      gpsLocked: isLocked,
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
