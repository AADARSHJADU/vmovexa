enum RouteStopType { start, stop, end }

class RouteStop {
  final String name;
  final String time;
  final double distanceKm;
  final RouteStopType type;

  RouteStop({
    required this.name,
    required this.time,
    required this.distanceKm,
    required this.type,
  });
}

class AssignedRoute {
  final String routeName;
  final String fromDepot;
  final String toDepot;
  final String busNumber;
  final bool isOnDuty;

  final String startTime;
  final String endTime;
  final double totalDistanceKm;

  final List<RouteStop> stops;

  // Route Information
  final String routeType;
  final String frequency;
  final String passengersEstimate;

  // Bus Information
  final String vehicleId;
  final String busType;

  AssignedRoute({
    required this.routeName,
    required this.fromDepot,
    required this.toDepot,
    required this.busNumber,
    required this.isOnDuty,
    required this.startTime,
    required this.endTime,
    required this.totalDistanceKm,
    required this.stops,
    required this.routeType,
    required this.frequency,
    required this.passengersEstimate,
    required this.vehicleId,
    required this.busType,
  });
}
