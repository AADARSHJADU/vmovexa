import 'package:flutter/material.dart';

enum DeviceStatus { online, offline, maintenance }

extension DeviceStatusX on DeviceStatus {
  String get label {
    switch (this) {
      case DeviceStatus.online:
        return 'Online';
      case DeviceStatus.offline:
        return 'Offline';
      case DeviceStatus.maintenance:
        return 'Maintenance';
    }
  }

  Color get color {
    switch (this) {
      case DeviceStatus.online:
        return const Color(0xFF2ECC71);
      case DeviceStatus.offline:
        return const Color(0xFFFF4D4D);
      case DeviceStatus.maintenance:
        return const Color(0xFFFFA726);
    }
  }
}

class DisplayDevice {
  final String id; // e.g. VMX-DP-1001
  final String vehicleNumber; // e.g. Bus MH12 AB 1234
  final String location; // e.g. Mumbai Central Depot
  final DeviceStatus status;
  final String lastSeen; // e.g. Just now / 15 min ago

  DisplayDevice({
    required this.id,
    required this.vehicleNumber,
    required this.location,
    required this.status,
    required this.lastSeen,
  });
}
