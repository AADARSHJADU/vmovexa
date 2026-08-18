import 'package:flutter/material.dart';

enum IncidentType {
  accident,
  breakdown,
  roadCondition,
  trafficIssue,
  passengerIssue,
  infrastructure,
  safetyConcern,
  other,
}

extension IncidentTypeX on IncidentType {
  String get label {
    switch (this) {
      case IncidentType.accident:
        return 'Accident';
      case IncidentType.breakdown:
        return 'Breakdown';
      case IncidentType.roadCondition:
        return 'Road Condition';
      case IncidentType.trafficIssue:
        return 'Traffic Issue';
      case IncidentType.passengerIssue:
        return 'Passenger Issue';
      case IncidentType.infrastructure:
        return 'Infrastructure';
      case IncidentType.safetyConcern:
        return 'Safety Concern';
      case IncidentType.other:
        return 'Other';
    }
  }

  String get description {
    switch (this) {
      case IncidentType.accident:
        return 'Road accident or collision';
      case IncidentType.breakdown:
        return 'Vehicle breakdown or malfunction';
      case IncidentType.roadCondition:
        return 'Potholes, damaged road, etc.';
      case IncidentType.trafficIssue:
        return 'Congestion, obstruction, etc.';
      case IncidentType.passengerIssue:
        return 'Passenger complaint or issue';
      case IncidentType.infrastructure:
        return 'Bus stop, sign, light issue, etc.';
      case IncidentType.safetyConcern:
        return 'Unsafe situation or hazard';
      case IncidentType.other:
        return 'Any other issue';
    }
  }

  IconData get icon {
    switch (this) {
      case IncidentType.accident:
        return Icons.warning_amber_rounded;
      case IncidentType.breakdown:
        return Icons.car_repair;
      case IncidentType.roadCondition:
        return Icons.dashboard_customize_outlined;
      case IncidentType.trafficIssue:
        return Icons.traffic;
      case IncidentType.passengerIssue:
        return Icons.person_outline;
      case IncidentType.infrastructure:
        return Icons.inventory_2_outlined;
      case IncidentType.safetyConcern:
        return Icons.shield_outlined;
      case IncidentType.other:
        return Icons.more_horiz;
    }
  }
}

enum AffectedParty { passengers, driver, vehicle, infrastructure, other }

extension AffectedPartyX on AffectedParty {
  String get label {
    switch (this) {
      case AffectedParty.passengers:
        return 'Passengers';
      case AffectedParty.driver:
        return 'Driver';
      case AffectedParty.vehicle:
        return 'Vehicle';
      case AffectedParty.infrastructure:
        return 'Infrastructure';
      case AffectedParty.other:
        return 'Other';
    }
  }

  IconData get icon {
    switch (this) {
      case AffectedParty.passengers:
        return Icons.person_outline;
      case AffectedParty.driver:
        return Icons.airline_seat_recline_normal;
      case AffectedParty.vehicle:
        return Icons.directions_bus_filled_outlined;
      case AffectedParty.infrastructure:
        return Icons.inventory_2_outlined;
      case AffectedParty.other:
        return Icons.more_horiz;
    }
  }
}

enum IncidentSeverity { low, medium, high, critical }

extension IncidentSeverityX on IncidentSeverity {
  String get label {
    switch (this) {
      case IncidentSeverity.low:
        return 'Low';
      case IncidentSeverity.medium:
        return 'Medium';
      case IncidentSeverity.high:
        return 'High';
      case IncidentSeverity.critical:
        return 'Critical';
    }
  }

  String get description {
    switch (this) {
      case IncidentSeverity.low:
        return 'Minor issue, no disruption';
      case IncidentSeverity.medium:
        return 'Moderate issue, minor disruption';
      case IncidentSeverity.high:
        return 'Major issue, service affected';
      case IncidentSeverity.critical:
        return 'Severe issue, service halted';
    }
  }

  IconData get icon {
    switch (this) {
      case IncidentSeverity.low:
        return Icons.info_outline;
      case IncidentSeverity.medium:
        return Icons.warning_amber_rounded;
      case IncidentSeverity.high:
        return Icons.warning_amber_rounded;
      case IncidentSeverity.critical:
        return Icons.error_outline;
    }
  }

  Color get color {
    switch (this) {
      case IncidentSeverity.low:
        return const Color(0xFF2ECC71);
      case IncidentSeverity.medium:
        return const Color(0xFFFFA726);
      case IncidentSeverity.high:
        return const Color(0xFFFF7043);
      case IncidentSeverity.critical:
        return const Color(0xFFFF4D4D);
    }
  }
}
