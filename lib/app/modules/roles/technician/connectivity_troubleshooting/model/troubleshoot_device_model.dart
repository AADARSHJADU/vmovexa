// import 'hardware_status_device_model.dart' show DeviceOnlineState;
import '../../hardware_status/model/hardware_status_device_model.dart';

enum ConnSubStatus { connected, disconnected }

extension ConnSubStatusX on ConnSubStatus {
  String get label => this == ConnSubStatus.connected ? 'Connected' : 'Disconnected';
}

class TroubleshootDevice {
  final String deviceId;
  final String vehicleNumber;
  final String depotLocation;
  final DeviceOnlineState onlineState;
  final ConnSubStatus networkStatus;
  final ConnSubStatus gpsStatus;
  final String lastConnectionText;

  TroubleshootDevice({
    required this.deviceId,
    required this.vehicleNumber,
    required this.depotLocation,
    required this.onlineState,
    required this.networkStatus,
    required this.gpsStatus,
    required this.lastConnectionText,
  });
}
