import 'package:flutter/material.dart';

enum ScheduleTripStatus { onDuty, pending, scheduled, completed }

extension ScheduleTripStatusX on ScheduleTripStatus {
  String get label {
    switch (this) {
      case ScheduleTripStatus.onDuty:
        return 'On Duty';
      case ScheduleTripStatus.pending:
        return 'Pending';
      case ScheduleTripStatus.scheduled:
        return 'Scheduled';
      case ScheduleTripStatus.completed:
        return 'Completed';
    }
  }

  Color get color {
    switch (this) {
      case ScheduleTripStatus.onDuty:
        return const Color(0xFF2ECC71);
      case ScheduleTripStatus.pending:
        return Colors.white54;
      case ScheduleTripStatus.scheduled:
        return const Color(0xFF3F7BF5);
      case ScheduleTripStatus.completed:
        return const Color(0xFFB042FF);
    }
  }
}

class ScheduleTrip {
  final String id;
  final String routeName;
  final String tripLabel; // "Trip 1", "Trip 2"
  final String fromDepot;
  final String toDepot;
  final String startTime;
  final String endTime;
  final String startPoint;
  final String endPoint;
  final double distanceKm;
  final ScheduleTripStatus status;
  final DateTime date;
  final String dayLabel; // "Thursday" — only shown for upcoming trips

  ScheduleTrip({
    required this.id,
    required this.routeName,
    required this.tripLabel,
    required this.fromDepot,
    required this.toDepot,
    required this.startTime,
    required this.endTime,
    required this.startPoint,
    required this.endPoint,
    required this.distanceKm,
    required this.status,
    required this.date,
    required this.dayLabel,
  });
}
