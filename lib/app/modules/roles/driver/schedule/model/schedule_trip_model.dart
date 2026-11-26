import 'package:flutter/material.dart';
import 'package:get/get.dart';

enum ScheduleTripStatus { onDuty, pending, scheduled, completed }

extension ScheduleTripStatusX on ScheduleTripStatus {
  String get label {
    switch (this) {
      case ScheduleTripStatus.onDuty:
        return 'on_duty'.tr;
      case ScheduleTripStatus.pending:
        return 'pending'.tr;
      case ScheduleTripStatus.scheduled:
        return 'scheduled'.tr;
      case ScheduleTripStatus.completed:
        return 'completed'.tr;
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
        return const Color(0xFF10B981);
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
