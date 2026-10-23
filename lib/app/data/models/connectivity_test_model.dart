class ConnectivityTestModel {
  final bool dnsResolved;
  final int pingLatencyMs;
  final int mqttLatencyMs;
  final int apiPingMs;
  final double packetLossPct;
  final int? rssi;
  final String timestamp;
  final String status;
  final String? testType;

  ConnectivityTestModel({
    this.dnsResolved = true,
    this.pingLatencyMs = 32,
    this.mqttLatencyMs = 48,
    this.apiPingMs = 54,
    this.packetLossPct = 0.0,
    this.rssi = -68,
    this.timestamp = '',
    this.status = 'healthy',
    this.testType = 'full_diagnostics',
  });

  bool get isHealthy => dnsResolved && packetLossPct <= 5.0 && pingLatencyMs < 200;

  int get latency => pingLatencyMs;
  double get packetLoss => packetLossPct;

  factory ConnectivityTestModel.fromJson(Map<String, dynamic> json) {
    return ConnectivityTestModel(
      dnsResolved: json['dns_resolved'] == true || json['dnsResolved'] == true,
      pingLatencyMs: int.tryParse(json['ping_latency_ms']?.toString() ??
              json['pingLatencyMs']?.toString() ??
              json['latency']?.toString() ??
              '') ??
          32,
      mqttLatencyMs: int.tryParse(json['mqtt_latency_ms']?.toString() ?? json['mqttLatencyMs']?.toString() ?? '') ?? 48,
      apiPingMs: int.tryParse(json['api_ping_ms']?.toString() ?? json['apiPingMs']?.toString() ?? '') ?? 54,
      packetLossPct: double.tryParse(json['packet_loss_pct']?.toString() ??
              json['packetLossPct']?.toString() ??
              json['packet_loss']?.toString() ??
              '') ??
          0.0,
      rssi: int.tryParse(json['rssi']?.toString() ?? json['signal_dbm']?.toString() ?? '') ?? -68,
      timestamp: (json['timestamp'] ?? json['created_at'] ?? '').toString(),
      status: (json['status'] ?? 'healthy').toString(),
      testType: json['test_type']?.toString() ?? json['testType']?.toString() ?? 'full_diagnostics',
    );
  }

  Map<String, dynamic> toJson() => {
    'dns_resolved': dnsResolved,
    'ping_latency_ms': pingLatencyMs,
    'mqtt_latency_ms': mqttLatencyMs,
    'api_ping_ms': apiPingMs,
    'packet_loss_pct': packetLossPct,
    if (rssi != null) 'rssi': rssi,
    'timestamp': timestamp,
    'status': status,
    if (testType != null) 'test_type': testType,
  };
}
