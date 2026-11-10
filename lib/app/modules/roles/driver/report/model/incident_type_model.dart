import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
        return 'incident_accident'.tr;
      case IncidentType.breakdown:
        return 'incident_breakdown'.tr;
      case IncidentType.roadCondition:
        return 'incident_road_condition'.tr;
      case IncidentType.trafficIssue:
        return 'incident_traffic_issue'.tr;
      case IncidentType.passengerIssue:
        return 'incident_passenger_issue'.tr;
      case IncidentType.infrastructure:
        return 'incident_infrastructure'.tr;
      case IncidentType.safetyConcern:
        return 'incident_safety_concern'.tr;
      case IncidentType.other:
        return 'incident_other'.tr;
    }
  }

  String get description {
    switch (this) {
      case IncidentType.accident:
        return 'desc_accident'.tr;
      case IncidentType.breakdown:
        return 'desc_breakdown'.tr;
      case IncidentType.roadCondition:
        return 'desc_road_condition'.tr;
      case IncidentType.trafficIssue:
        return 'desc_traffic_issue'.tr;
      case IncidentType.passengerIssue:
        return 'desc_passenger_issue'.tr;
      case IncidentType.infrastructure:
        return 'desc_infrastructure'.tr;
      case IncidentType.safetyConcern:
        return 'desc_safety_concern'.tr;
      case IncidentType.other:
        return 'desc_other_issue'.tr;
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
        return 'affected_passengers'.tr;
      case AffectedParty.driver:
        return 'affected_driver'.tr;
      case AffectedParty.vehicle:
        return 'affected_vehicle'.tr;
      case AffectedParty.infrastructure:
        return 'affected_infrastructure'.tr;
      case AffectedParty.other:
        return 'affected_other'.tr;
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
        return 'sev_low'.tr;
      case IncidentSeverity.medium:
        return 'sev_medium'.tr;
      case IncidentSeverity.high:
        return 'sev_high'.tr;
      case IncidentSeverity.critical:
        return 'sev_critical'.tr;
    }
  }

  String get description {
    switch (this) {
      case IncidentSeverity.low:
        return 'desc_sev_low'.tr;
      case IncidentSeverity.medium:
        return 'desc_sev_medium'.tr;
      case IncidentSeverity.high:
        return 'desc_sev_high'.tr;
      case IncidentSeverity.critical:
        return 'desc_sev_critical'.tr;
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
