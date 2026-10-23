class DeviceConfigModel {
  final String deviceId;
  final String resolution;
  final String screenOrientation;
  final double brightness;
  final double audioVolume;
  final bool isMuted;
  final String audioSource;
  final String screenPosition;
  final bool autoBrightness;
  final String screenTimeout;
  final String displayMode;
  final String powerMode;
  final String autoPowerOn;
  final String autoPowerOff;
  final String networkType;
  final String ssid;
  final String ipAddress;
  final String subnetMask;
  final String gateway;
  final String dns;
  final bool peerProxy;
  final String proxyType;
  final String proxyHost;
  final String proxyPort;
  final bool autoTime;

  DeviceConfigModel({
    this.deviceId = '',
    this.resolution = '1920x1080',
    this.screenOrientation = 'Landscape',
    this.brightness = 80.0,
    this.audioVolume = 70.0,
    this.isMuted = false,
    this.audioSource = 'Internal Speaker',
    this.screenPosition = 'behind_driver_partition',
    this.autoBrightness = true,
    this.screenTimeout = 'Never',
    this.displayMode = 'Full Screen',
    this.powerMode = 'Normal Operational Mode',
    this.autoPowerOn = '06:00 AM',
    this.autoPowerOff = '11:00 PM',
    this.networkType = 'Wi-Fi',
    this.ssid = '',
    this.ipAddress = '',
    this.subnetMask = '255.255.255.0',
    this.gateway = '192.168.1.1',
    this.dns = '8.8.8.8',
    this.peerProxy = false,
    this.proxyType = 'HTTP',
    this.proxyHost = '',
    this.proxyPort = '',
    this.autoTime = true,
  });

  factory DeviceConfigModel.fromJson(Map<String, dynamic> rawJson) {
    final Map<String, dynamic> json = (rawJson['config'] is Map)
        ? Map<String, dynamic>.from(rawJson['config'])
        : rawJson;

    return DeviceConfigModel(
      deviceId: (rawJson['device_id'] ?? rawJson['display_id'] ?? rawJson['deviceId'] ?? json['device_id'] ?? '').toString(),
      resolution: (json['resolution'] ?? '1920x1080').toString(),
      screenOrientation: (json['screenOrientation'] ?? json['screen_orientation'] ?? json['orientation'] ?? 'Landscape').toString(),
      brightness: double.tryParse(json['brightness']?.toString() ?? json['brightness_day_pct']?.toString() ?? json['brightnessDayPct']?.toString() ?? '') ?? 80.0,
      audioVolume: double.tryParse(json['audioVolume']?.toString() ?? json['audio_volume']?.toString() ?? json['volume_day_pct']?.toString() ?? json['volumeDayPct']?.toString() ?? '') ?? 70.0,
      isMuted: json['isMuted'] == true || json['is_muted'] == true,
      audioSource: (json['audioSource'] ?? json['audio_source'] ?? 'Internal Speaker').toString(),
      screenPosition: (json['screen_position'] ?? json['screenPosition'] ?? 'behind_driver_partition').toString(),
      autoBrightness: json['autoBrightness'] == true || json['auto_brightness'] == true,
      screenTimeout: (json['screenTimeout'] ?? json['screen_timeout'] ?? 'Never').toString(),
      displayMode: (json['displayMode'] ?? json['display_mode'] ?? 'Full Screen').toString(),
      powerMode: (json['powerMode'] ?? json['power_mode'] ?? 'Normal Operational Mode').toString(),
      autoPowerOn: (json['autoPowerOn'] ?? json['auto_power_on'] ?? '06:00 AM').toString(),
      autoPowerOff: (json['autoPowerOff'] ?? json['auto_power_off'] ?? '11:00 PM').toString(),
      networkType: (json['networkType'] ?? json['network_type'] ?? json['connection_type'] ?? 'Wi-Fi').toString(),
      ssid: (json['ssid'] ?? json['wifi_ssid'] ?? json['wifiSsid'] ?? '').toString(),
      ipAddress: (json['ipAddress'] ?? json['ip_address'] ?? '').toString(),
      subnetMask: (json['subnetMask'] ?? json['subnet_mask'] ?? '255.255.255.0').toString(),
      gateway: (json['gateway'] ?? '192.168.1.1').toString(),
      dns: (json['dns'] ?? '8.8.8.8').toString(),
      peerProxy: json['peerProxy'] == true || json['peer_proxy'] == true || json['use_proxy'] == true,
      proxyType: (json['proxyType'] ?? json['proxy_type'] ?? 'HTTP').toString(),
      proxyHost: (json['proxyHost'] ?? json['proxy_host'] ?? json['proxy_address'] ?? '').toString(),
      proxyPort: (json['proxyPort'] ?? json['proxy_port'] ?? '').toString(),
      autoTime: json['autoTime'] != false && json['auto_time'] != false,
    );
  }

  Map<String, dynamic> toJson() => {
    'brightness': brightness,
    'screenTimeout': screenTimeout,
    'autoBrightness': autoBrightness,
    'displayMode': displayMode,
    'screenOrientation': screenOrientation,
    'audioVolume': audioVolume,
    'isMuted': isMuted,
    'audioSource': audioSource,
    'powerMode': powerMode,
    'autoPowerOn': autoPowerOn,
    'autoPowerOff': autoPowerOff,
    'networkType': networkType,
    'ssid': ssid,
    'ipAddress': ipAddress,
    'peerProxy': peerProxy,
    'proxyType': proxyType,
    'proxyHost': proxyHost,
    'proxyPort': proxyPort,
    'autoTime': autoTime,
  };
}
