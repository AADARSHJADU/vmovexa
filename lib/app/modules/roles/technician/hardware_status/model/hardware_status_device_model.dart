import 'package:flutter/material.dart';

enum DeviceOnlineState { online, offline }

enum GpsSubStatus { active, weakSignal, noSignal }

enum DisplaySubStatus { normal, dim, noOutput }

enum HardwareSubStatus { healthy, issue }

extension DeviceOnlineStateX on DeviceOnlineState {
  String get label => this == DeviceOnlineState.online ? 'Online' : 'Offline';
  Color get color => this == DeviceOnlineState.online ? const Color(0xFF2ECC71) : const Color(0xFFFF4D4D);
}

extension GpsSubStatusX on GpsSubStatus {
  String get label {
    switch (this) {
      case GpsSubStatus.active:
        return 'Active';
      case GpsSubStatus.weakSignal:
        return 'Weak Signal';
      case GpsSubStatus.noSignal:
        return 'No Signal';
    }
  }

  Color get color {
    switch (this) {
      case GpsSubStatus.active:
        return const Color(0xFF2ECC71);
      case GpsSubStatus.weakSignal:
        return const Color(0xFFFFA726);
      case GpsSubStatus.noSignal:
        return const Color(0xFFFF4D4D);
    }
  }

  IconData get icon => this == GpsSubStatus.noSignal ? Icons.location_off_outlined : Icons.location_on_outlined;
}

extension DisplaySubStatusX on DisplaySubStatus {
  String get label {
    switch (this) {
      case DisplaySubStatus.normal:
        return 'Normal';
      case DisplaySubStatus.dim:
        return 'Dim';
      case DisplaySubStatus.noOutput:
        return 'No Output';
    }
  }

  Color get color {
    switch (this) {
      case DisplaySubStatus.normal:
        return const Color(0xFFB042FF);
      case DisplaySubStatus.dim:
        return const Color(0xFFFFA726);
      case DisplaySubStatus.noOutput:
        return const Color(0xFFFF4D4D);
    }
  }

  IconData get icon => Icons.desktop_windows_outlined;
}

extension HardwareSubStatusX on HardwareSubStatus {
  String get label => this == HardwareSubStatus.healthy ? 'Healthy' : 'Issue';
  Color get color => this == HardwareSubStatus.healthy ? const Color(0xFF2ECC71) : const Color(0xFFFFA726);
  IconData get icon => this == HardwareSubStatus.healthy ? Icons.shield_outlined : Icons.warning_amber_rounded;
}

class HardwareStatusDevice {
  final String deviceId;
  final String vehicleNumber;
  final String depotLocation;
  final DeviceOnlineState onlineState;
  final GpsSubStatus gpsStatus;
  final DisplaySubStatus displayStatus;
  final HardwareSubStatus hardwareStatus;

  HardwareStatusDevice({
    required this.deviceId,
    required this.vehicleNumber,
    required this.depotLocation,
    required this.onlineState,
    required this.gpsStatus,
    required this.displayStatus,
    required this.hardwareStatus,
  });

  bool get hasIssue =>
      hardwareStatus == HardwareSubStatus.issue ||
      gpsStatus == GpsSubStatus.noSignal ||
      displayStatus == DisplaySubStatus.noOutput;
}
