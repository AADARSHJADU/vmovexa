import 'package:flutter/material.dart';

enum AlertSeverity { critical, warning, info, resolved }

extension AlertSeverityX on AlertSeverity {
  String get label {
    switch (this) {
      case AlertSeverity.critical:
        return 'Critical';
      case AlertSeverity.warning:
        return 'Warning';
      case AlertSeverity.info:
        return 'Info';
      case AlertSeverity.resolved:
        return 'Resolved';
    }
  }

  Color get color {
    switch (this) {
      case AlertSeverity.critical:
        return const Color(0xFFFF4D4D);
      case AlertSeverity.warning:
        return const Color(0xFFFFA726);
      case AlertSeverity.info:
        return const Color(0xFF3F7BF5);
      case AlertSeverity.resolved:
        return const Color(0xFF2ECC71);
    }
  }

  IconData get icon {
    switch (this) {
      case AlertSeverity.critical:
        return Icons.error_outline;
      case AlertSeverity.warning:
        return Icons.warning_amber_rounded;
      case AlertSeverity.info:
        return Icons.info_outline;
      case AlertSeverity.resolved:
        return Icons.check_circle_outline;
    }
  }
}

class AlertItem {
  final String id;
  final String title;
  final String message;
  final String deviceId;
  final String vehicleNumber;
  final String depotLocation;
  final DateTime timestamp;
  final AlertSeverity severity;
  bool isRead;

  AlertItem({
    required this.id,
    required this.title,
    required this.message,
    required this.deviceId,
    required this.vehicleNumber,
    required this.depotLocation,
    required this.timestamp,
    required this.severity,
    this.isRead = false,
  });
}
