import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/fleet_models.dart';
import '../models/gps_device_model.dart';
import '../models/vehicle_telemetry_model.dart';
import '../models/trip_models.dart';
import '../models/work_order_model.dart';
import '../models/incident_model.dart';
import '../models/activity_log_model.dart';
import '../models/notification_model.dart';
import 'http_client_service.dart';

class FleetService extends GetxService {
  static FleetService get to => Get.find<FleetService>();

  HttpClientService get _http => HttpClientService.to;

  /// GET /dashboard/admin/kpis
  Future<ApiResponseModel<FleetKpisModel>> getDashboardKpis() async {
    return _http.get<FleetKpisModel>(
      ApiConstants.dashboardKpis,
      requiresAuth: true,
      create: (data) => FleetKpisModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// GET /fleets
  Future<ApiResponseModel<List<FleetItemModel>>> getFleets({
    int page = 1,
    int limit = 20,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty) 'status': status,
    };

    return _http.get<List<FleetItemModel>>(
      ApiConstants.fleets,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => FleetItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => FleetItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => FleetItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <FleetItemModel>[];
      },
    );
  }

  /// POST /fleets
  Future<ApiResponseModel<dynamic>> createFleet(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.fleets,
      body: data,
      requiresAuth: true,
    );
  }

  /// GET /fleets/:id
  Future<ApiResponseModel<dynamic>> getFleet(String id) async {
    return _http.get(
      ApiConstants.fleetOne(id),
      requiresAuth: true,
    );
  }

  /// PATCH /fleets/:id
  Future<ApiResponseModel<dynamic>> updateFleet(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.fleetOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /fleets/:id/approve
  Future<ApiResponseModel<dynamic>> approveFleet(String id) async {
    return _http.patch(
      ApiConstants.fleetApprove(id),
      requiresAuth: true,
    );
  }

  /// PATCH /fleets/:id/reject
  Future<ApiResponseModel<dynamic>> rejectFleet(String id, String reason) async {
    return _http.patch(
      ApiConstants.fleetReject(id),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  /// PATCH /fleets/:id (status update)
  Future<ApiResponseModel<dynamic>> updateFleetStatus(String id, String status) async {
    return _http.patch(
      ApiConstants.fleetOne(id),
      body: {'status': status},
      requiresAuth: true,
    );
  }

  /// POST /fleets/:id/assign-vehicle
  Future<ApiResponseModel<dynamic>> assignVehicleToFleet(String fleetId, String vehicleId) async {
    return _http.post(
      ApiConstants.fleetAssignVehicle(fleetId),
      body: {'vehicle_id': vehicleId},
      requiresAuth: true,
    );
  }

  /// POST /fleets/:id/unassign-vehicle
  Future<ApiResponseModel<dynamic>> unassignVehicleFromFleet(String fleetId, String vehicleId) async {
    return _http.post(
      ApiConstants.fleetUnassignVehicle(fleetId),
      body: {'vehicle_id': vehicleId},
      requiresAuth: true,
    );
  }


  /// GET /depots
  Future<ApiResponseModel<List<DepotItemModel>>> getDepots({
    int page = 1,
    int limit = 100,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty && status != 'all') 'status': status,
    };

    return _http.get<List<DepotItemModel>>(
      ApiConstants.depots,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => DepotItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => DepotItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => DepotItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <DepotItemModel>[];
      },
    );
  }

  /// GET /depots/:id
  Future<ApiResponseModel<DepotItemModel>> getDepot(String id) async {
    return _http.get<DepotItemModel>(
      ApiConstants.depotOne(id),
      requiresAuth: true,
      create: (data) => DepotItemModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// POST /depots
  Future<ApiResponseModel<dynamic>> addDepot(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.depots,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /depots/:id
  Future<ApiResponseModel<dynamic>> updateDepot(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.depotOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// DELETE /depots/:id
  Future<ApiResponseModel<dynamic>> deleteDepot(String id) async {
    return _http.delete(
      ApiConstants.depotOne(id),
      requiresAuth: true,
    );
  }

  /// PATCH /depots/:id (Status Toggle)
  Future<ApiResponseModel<dynamic>> updateDepotStatus(String id, String status) async {
    return _http.patch(
      ApiConstants.depotOne(id),
      body: {'status': status},
      requiresAuth: true,
    );
  }


  /// GET /vehicles
  Future<ApiResponseModel<List<VehicleItemModel>>> getVehicles({
    int page = 1,
    int limit = 20,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty) 'status': status,
    };

    return _http.get<List<VehicleItemModel>>(
      ApiConstants.vehicles,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => VehicleItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => VehicleItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => VehicleItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <VehicleItemModel>[];
      },
    );
  }

  /// POST /vehicles
  Future<ApiResponseModel<dynamic>> addVehicle(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.vehicles,
      body: data,
      requiresAuth: true,
    );
  }

  /// GET /vehicles/:id
  Future<ApiResponseModel<dynamic>> getVehicle(String id) async {
    return _http.get(
      ApiConstants.vehicleOne(id),
      requiresAuth: true,
    );
  }

  /// PATCH /vehicles/:id
  Future<ApiResponseModel<dynamic>> updateVehicle(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.vehicleOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// DELETE /vehicles/:id
  Future<ApiResponseModel<dynamic>> deleteVehicle(String id) async {
    return _http.delete(
      ApiConstants.vehicleOne(id),
      requiresAuth: true,
    );
  }

  /// PATCH /vehicles/:id/assign-driver
  Future<ApiResponseModel<dynamic>> assignDriverToVehicle(String vehicleId, String driverId) async {
    return _http.patch(
      ApiConstants.vehicleAssignDriver(vehicleId),
      body: {'driverId': driverId, 'driver_id': driverId},
      requiresAuth: true,
    );
  }

  /// PATCH /vehicles/:id/assign-gps
  Future<ApiResponseModel<dynamic>> assignGpsToVehicle(String vehicleId, String gpsDeviceId) async {
    return _http.patch(
      ApiConstants.vehicleAssignGps(vehicleId),
      body: {'gpsDeviceId': gpsDeviceId, 'gps_device_id': gpsDeviceId},
      requiresAuth: true,
    );
  }

  /// GET /vehicles/:id/telemetry
  Future<ApiResponseModel<VehicleTelemetryModel>> getVehicleTelemetry(String id) async {
    return _http.get<VehicleTelemetryModel>(
      ApiConstants.vehicleTelemetry(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map<String, dynamic>) {
          return VehicleTelemetryModel.fromJson(data);
        } else if (data is Map) {
          return VehicleTelemetryModel.fromJson(Map<String, dynamic>.from(data));
        }
        return VehicleTelemetryModel(vehicleId: id);
      },
    );
  }

  /// GET /routes
  Future<ApiResponseModel<List<RouteItemModel>>> getRoutes({
    int page = 1,
    int limit = 100,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty) 'status': status,
    };

    return _http.get<List<RouteItemModel>>(
      ApiConstants.routes,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => RouteItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => RouteItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => RouteItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <RouteItemModel>[];
      },
    );
  }

  /// GET /routes/:id
  Future<ApiResponseModel<RouteItemModel>> getRoute(String id) async {
    return _http.get<RouteItemModel>(
      ApiConstants.routeOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map<String, dynamic>) {
          return RouteItemModel.fromJson(data);
        } else if (data is Map) {
          return RouteItemModel.fromJson(Map<String, dynamic>.from(data));
        }
        throw Exception('Invalid route data format');
      },
    );
  }

  /// POST /routes
  Future<ApiResponseModel<dynamic>> addRoute(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.routes,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /routes/:id
  Future<ApiResponseModel<dynamic>> updateRoute(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.routeOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// DELETE /routes/:id
  Future<ApiResponseModel<dynamic>> deleteRoute(String id) async {
    return _http.delete(
      ApiConstants.routeOne(id),
      requiresAuth: true,
    );
  }

  /// POST /routes/:id/approve
  Future<ApiResponseModel<dynamic>> approveRoute(String id) async {
    return _http.post(
      ApiConstants.routeApprove(id),
      requiresAuth: true,
    );
  }

  /// POST /routes/:id/reject
  Future<ApiResponseModel<dynamic>> rejectRoute(String id, String reason) async {
    return _http.post(
      ApiConstants.routeReject(id),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  /// POST /routes/:id/assign-vehicle
  Future<ApiResponseModel<dynamic>> assignVehicleToRoute(String id, Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.routeAssignVehicle(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// GET /routes/:id/vehicles
  Future<ApiResponseModel<List<RouteAssignmentModel>>> getRouteVehicles(String id) async {
    return _http.get<List<RouteAssignmentModel>>(
      ApiConstants.routeVehicles(id),
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => RouteAssignmentModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => RouteAssignmentModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => RouteAssignmentModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <RouteAssignmentModel>[];
      },
    );
  }

  /// POST /routes/assignments/:id/approve
  Future<ApiResponseModel<dynamic>> approveRouteAssignment(String assignmentId) async {
    return _http.post(
      ApiConstants.routeAssignmentApprove(assignmentId),
      requiresAuth: true,
    );
  }

  /// POST /routes/assignments/:id/reject
  Future<ApiResponseModel<dynamic>> rejectRouteAssignment(String assignmentId, String reason) async {
    return _http.post(
      ApiConstants.routeAssignmentReject(assignmentId),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  /// DELETE /routes/assignments/:id
  Future<ApiResponseModel<dynamic>> deleteRouteAssignment(String assignmentId) async {
    return _http.delete(
      ApiConstants.routeAssignmentDelete(assignmentId),
      requiresAuth: true,
    );
  }

  /// POST /google-apis/demo/places (Google Places Search)
  Future<ApiResponseModel<List<GooglePlaceItemModel>>> searchGooglePlaces(String query) async {
    return _http.post<List<GooglePlaceItemModel>>(
      ApiConstants.googlePlacesDemo,
      body: {'query': query},
      requiresAuth: true,
      create: (data) {
        if (data is Map && data['places'] is List) {
          return (data['places'] as List)
              .map((p) => GooglePlaceItemModel.fromJson(Map<String, dynamic>.from(p)))
              .toList();
        } else if (data is List) {
          return data
              .map((p) => GooglePlaceItemModel.fromJson(Map<String, dynamic>.from(p)))
              .toList();
        }
        return <GooglePlaceItemModel>[];
      },
    );
  }

  /// POST /google-apis/demo/routes (Google Routes Driving Path Computation)
  Future<ApiResponseModel<GoogleRouteComputeResult>> computeGoogleRoute({
    required double startLat,
    required double startLng,
    required double endLat,
    required double endLng,
    List<Map<String, double>> intermediates = const [],
  }) async {
    final payload = <String, dynamic>{
      'origin': '$startLat,$startLng',
      'destination': '$endLat,$endLng',
      if (intermediates.isNotEmpty) 'intermediates': intermediates,
    };

    return _http.post<GoogleRouteComputeResult>(
      ApiConstants.googleRoutesDemo,
      body: payload,
      requiresAuth: true,
      create: (data) {
        if (data is Map<String, dynamic>) {
          return GoogleRouteComputeResult.fromJson(data);
        } else if (data is Map) {
          return GoogleRouteComputeResult.fromJson(Map<String, dynamic>.from(data));
        }
        throw Exception('Invalid route computation response');
      },
    );
  }

  /// Build Google Static Maps URL with origin, destination, intermediate stops and polyline path
  String buildStaticMapUrl({
    required double startLat,
    required double startLng,
    required double endLat,
    required double endLng,
    List<Map<String, dynamic>> stops = const [],
    String? polyline,
    String mapType = 'roadmap',
    int width = 640,
    int height = 340,
  }) {
    final buffer = StringBuffer('https://maps.googleapis.com/maps/api/staticmap?');
    buffer.write('size=${width}x$height');
    buffer.write('&maptype=$mapType');

    // Origin Pin (Green 'A')
    buffer.write('&markers=color:green%7Clabel:A%7C$startLat,$startLng');

    // Intermediate Waypoints (Blue '1', '2', '3'...)
    for (int i = 0; i < stops.length; i++) {
      final s = stops[i];
      final sLat = s['latitude'] ?? s['lat'];
      final sLng = s['longitude'] ?? s['lng'];
      if (sLat != null && sLng != null) {
        final label = (i + 1) <= 9 ? '${i + 1}' : 'S';
        buffer.write('&markers=color:blue%7Clabel:$label%7C$sLat,$sLng');
      }
    }

    // Destination Pin (Red 'B')
    buffer.write('&markers=color:red%7Clabel:B%7C$endLat,$endLng');

    // Driving Polyline path
    if (polyline != null && polyline.isNotEmpty) {
      buffer.write('&path=color:0x2563ebff%7Cweight:5%7Cenc:${Uri.encodeComponent(polyline)}');
    }

    buffer.write('&key=${ApiConstants.googleMapsApiKey}');
    return buffer.toString();
  }

  /// GET /gps-devices (typed as `List<GpsDeviceItemModel>`)
  Future<ApiResponseModel<List<GpsDeviceItemModel>>> getGpsDevicesList({
    int page = 1,
    int limit = 100,
  }) async {
    return _http.get<List<GpsDeviceItemModel>>(
      ApiConstants.gpsDevices,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => GpsDeviceItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => GpsDeviceItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => GpsDeviceItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <GpsDeviceItemModel>[];
      },
    );
  }


  /// GET /drivers
  Future<ApiResponseModel<List<DriverItemModel>>> getDrivers({
    int page = 1,
    int limit = 100,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty) 'status': status,
    };

    return _http.get<List<DriverItemModel>>(
      ApiConstants.drivers,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => DriverItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => DriverItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => DriverItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <DriverItemModel>[];
      },
    );
  }

  /// GET /drivers/:id
  Future<ApiResponseModel<dynamic>> getDriver(String id) async {
    return _http.get(
      ApiConstants.driverOne(id),
      requiresAuth: true,
    );
  }

  /// POST /drivers
  Future<ApiResponseModel<dynamic>> addDriver(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.drivers,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id
  Future<ApiResponseModel<dynamic>> updateDriver(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.driverOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// DELETE /drivers/:id
  Future<ApiResponseModel<dynamic>> deleteDriver(String id) async {
    return _http.delete(
      ApiConstants.driverOne(id),
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id/status
  Future<ApiResponseModel<dynamic>> updateDriverStatus(String id, String status) async {
    return _http.patch(
      ApiConstants.driverStatus(id),
      body: {'status': status},
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id/assign-bus
  Future<ApiResponseModel<dynamic>> assignBusToDriver(String driverId, String vehicleId) async {
    return _http.patch(
      ApiConstants.driverAssignBus(driverId),
      body: {'vehicle_id': vehicleId, 'vehicleId': vehicleId},
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id/verify-documents
  Future<ApiResponseModel<dynamic>> verifyDriverDocuments(String id) async {
    return _http.patch(
      ApiConstants.driverVerifyDocs(id),
      body: {'verified': true, 'documents_verified': true},
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id/approve
  Future<ApiResponseModel<dynamic>> approveDriver(String id) async {
    return _http.patch(
      ApiConstants.driverApprove(id),
      requiresAuth: true,
    );
  }

  /// PATCH /drivers/:id/reject
  Future<ApiResponseModel<dynamic>> rejectDriver(String id, String reason) async {
    return _http.patch(
      ApiConstants.driverReject(id),
      body: {'reason': reason, 'rejection_reason': reason},
      requiresAuth: true,
    );
  }

  /// GET /dashboard/live-summary
  Future<ApiResponseModel<dynamic>> getLiveSummary() async {
    return _http.get(
      ApiConstants.liveSummary,
      requiresAuth: true,
    );
  }

  /// GET /trips
  Future<ApiResponseModel<List<TripItemModel>>> getTrips({
    int page = 1,
    int limit = 20,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty && status.toLowerCase() != 'all') 'status': status,
    };

    return _http.get<List<TripItemModel>>(
      ApiConstants.trips,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => TripItemModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => TripItemModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List)
              .whereType<Map>()
              .map((item) => TripItemModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <TripItemModel>[];
      },
    );
  }

  /// GET /trips/:id
  Future<ApiResponseModel<TripItemModel>> getTrip(String id) async {
    return _http.get<TripItemModel>(
      ApiConstants.tripOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map<String, dynamic>) {
          return TripItemModel.fromJson(data);
        } else if (data is Map && data['rows'] is List && (data['rows'] as List).isNotEmpty) {
          return TripItemModel.fromJson(Map<String, dynamic>.from(data['rows'][0]));
        } else if (data is Map && data['data'] is Map) {
          return TripItemModel.fromJson(Map<String, dynamic>.from(data['data']));
        } else if (data is Map) {
          return TripItemModel.fromJson(Map<String, dynamic>.from(data));
        }
        return TripItemModel(id: id, code: 'TRIP-$id');
      },
    );
  }

  /// PATCH /trips/:id/end
  Future<ApiResponseModel<dynamic>> endTrip(String id) async {
    return _http.patch(
      ApiConstants.tripEnd(id),
      body: {'status': 'completed'},
      requiresAuth: true,
    );
  }

  /// POST /trips
  Future<ApiResponseModel<dynamic>> createTrip(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.trips,
      body: data,
      requiresAuth: true,
    );
  }


  /// GET /incidents
  Future<ApiResponseModel<List<IncidentItemModel>>> getIncidents({
    int page = 1,
    int limit = 20,
    String? status,
    String? severity,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty && status != 'ALL') 'status': status,
      if (severity != null && severity.isNotEmpty && severity != 'ALL') 'severity': severity,
      if (search != null && search.isNotEmpty) 'search': search,
    };
    return _http.get<List<IncidentItemModel>>(
      ApiConstants.incidents,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => IncidentItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => IncidentItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => IncidentItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['incidents'] is List) {
          return (data['incidents'] as List).map((item) => IncidentItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <IncidentItemModel>[];
      },
    );
  }

  /// GET /incidents/:id
  Future<ApiResponseModel<IncidentItemModel>> getIncidentById(String id) async {
    return _http.get<IncidentItemModel>(
      ApiConstants.incidentOne(id),
      requiresAuth: true,
      create: (data) => IncidentItemModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// POST /incidents
  Future<ApiResponseModel<dynamic>> createIncident(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.incidents,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /incidents/:id/resolution
  Future<ApiResponseModel<dynamic>> updateIncidentResolution(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.incidentResolution(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /incidents/:id/status
  Future<ApiResponseModel<dynamic>> updateIncidentStatus(String id, String status) async {
    return _http.patch(
      ApiConstants.incidentStatus(id),
      body: {'status': status},
      requiresAuth: true,
    );
  }

  /// GET /notifications/settings
  Future<ApiResponseModel<dynamic>> getNotificationSettings() async {
    return _http.get(
      ApiConstants.notificationSettings,
      requiresAuth: true,
    );
  }

  /// PATCH /notifications/settings
  Future<ApiResponseModel<dynamic>> updateNotificationSettings(Map<String, dynamic> settings) async {
    return _http.patch(
      ApiConstants.notificationSettings,
      body: settings,
      requiresAuth: true,
    );
  }

  /// GET /content/:type?role=ROLE-FLEET-OPERATOR
  Future<ApiResponseModel<dynamic>> getContentPage(String type, {String role = 'ROLE-FLEET-OPERATOR'}) async {
    return _http.get(
      ApiConstants.techWorkOrders,
      // ApiConstants.contentPage(type),
      queryParams: {'role': role},
      requiresAuth: true,
    );
  }

  // ==================== GPS / EDGE TRACKING DEVICES ====================

  /// GET /gps-devices
  Future<ApiResponseModel<List<GpsDeviceModel>>> getGpsDevices({
    int page = 1,
    int limit = 50,
    String search = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty && status.toLowerCase() != 'all') 'status': status,
    };

    return _http.get<List<GpsDeviceModel>>(
      ApiConstants.gpsDevices,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => GpsDeviceModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => GpsDeviceModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List)
              .whereType<Map>()
              .map((item) => GpsDeviceModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <GpsDeviceModel>[];
      },
    );
  }

  /// GET /gps-devices/:id
  Future<ApiResponseModel<GpsDeviceModel>> getGpsDevice(String id) async {
    return _http.get<GpsDeviceModel>(
      ApiConstants.gpsDeviceOne(id),
      requiresAuth: true,
      create: (data) => GpsDeviceModel.fromJson(
        data is Map ? Map<String, dynamic>.from(data) : {},
      ),
    );
  }

  /// POST /gps-devices
  Future<ApiResponseModel<dynamic>> createGpsDevice(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.gpsDevices,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /gps-devices/:id
  Future<ApiResponseModel<dynamic>> updateGpsDevice(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.gpsDeviceOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// POST /gps-devices/:id/assign
  Future<ApiResponseModel<dynamic>> assignGpsVehicle(String id, dynamic vehicleId) async {
    return _http.post(
      ApiConstants.gpsDeviceAssign(id),
      body: {'vehicleId': vehicleId},
      requiresAuth: true,
    );
  }

  /// POST /gps-devices/:id/approve
  Future<ApiResponseModel<dynamic>> approveGpsDevice(String id) async {
    return _http.post(
      ApiConstants.gpsDeviceApprove(id),
      requiresAuth: true,
    );
  }

  /// POST /gps-devices/:id/reject
  Future<ApiResponseModel<dynamic>> rejectGpsDevice(String id, String reason) async {
    return _http.post(
      ApiConstants.gpsDeviceReject(id),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  /// DELETE /gps-devices/:id
  Future<ApiResponseModel<dynamic>> deleteGpsDevice(String id) async {
    return _http.delete(
      ApiConstants.gpsDeviceOne(id),
      requiresAuth: true,
    );
  }

  // ==================== WORK ORDERS & TECHNICIAN REQUESTS ====================

  /// GET /work-orders
  Future<ApiResponseModel<List<WorkOrderModel>>> getWorkOrders({
    int page = 1,
    int limit = 20,
    String search = '',
    String urgency = '',
    String status = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (urgency.isNotEmpty && urgency.toLowerCase() != 'all') 'urgency': urgency,
      if (status.isNotEmpty && status.toLowerCase() != 'all') 'status': status,
    };

    return _http.get<List<WorkOrderModel>>(
      ApiConstants.workOrders,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List)
              .whereType<Map>()
              .map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <WorkOrderModel>[];
      },
    );
  }

  /// GET /work-orders/:id
  Future<ApiResponseModel<WorkOrderModel>> getWorkOrder(String id) async {
    return _http.get<WorkOrderModel>(
      ApiConstants.workOrderOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map<String, dynamic>) {
          return WorkOrderModel.fromJson(data);
        } else if (data is Map && data['rows'] is List && (data['rows'] as List).isNotEmpty) {
          return WorkOrderModel.fromJson(Map<String, dynamic>.from(data['rows'][0]));
        } else if (data is Map && data['data'] is Map) {
          return WorkOrderModel.fromJson(Map<String, dynamic>.from(data['data']));
        } else if (data is Map) {
          return WorkOrderModel.fromJson(Map<String, dynamic>.from(data));
        }
        return WorkOrderModel(id: id, code: 'WO-$id');
      },
    );
  }

  /// POST /work-orders
  Future<ApiResponseModel<dynamic>> createWorkOrder(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.workOrders,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /work-orders/:id
  Future<ApiResponseModel<dynamic>> updateWorkOrder(String id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.workOrderOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// GET /activity-logs
  Future<ApiResponseModel<ActivityLogsResult>> getActivityLogs({
    int page = 1,
    int limit = 10,
    String? search,
    String? category,
    String? event,
    String? severity,
    String? startDate,
    String? endDate,
    String? sortBy,
    String? sortOrder,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category != 'All') 'category': category,
      if (event != null && event != 'All') 'event': event,
      if (severity != null && severity != 'All') 'severity': severity,
      if (startDate != null && startDate.isNotEmpty) 'startDate': startDate,
      if (endDate != null && endDate.isNotEmpty) 'endDate': endDate,
      if (sortBy != null && sortBy.isNotEmpty) 'sortBy': sortBy,
      if (sortOrder != null && sortOrder.isNotEmpty) 'sortOrder': sortOrder,
    };

    return _http.get<ActivityLogsResult>(
      ApiConstants.activityLogs,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => ActivityLogsResult.fromJson(data),
    );
  }

  /// GET /activity-logs/categories
  Future<ApiResponseModel<List<String>>> getActivityCategories() async {
    return _http.get<List<String>>(
      ApiConstants.activityLogsCategories,
      requiresAuth: true,
      create: (data) {
        if (data is List) return data.map((e) => e.toString()).toList();
        if (data is Map && data['categories'] is List) {
          return (data['categories'] as List).map((e) => e.toString()).toList();
        }
        return <String>[];
      },
    );
  }

  /// GET /activity-logs/filters
  Future<ApiResponseModel<Map<String, dynamic>>> getActivityFilters() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.activityLogsFilters,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : {},
    );
  }

  /// GET /notifications
  Future<ApiResponseModel<List<AppNotificationModel>>> getNotifications({
    int page = 1,
    int limit = 50,
  }) async {
    return _http.get<List<AppNotificationModel>>(
      ApiConstants.notifications,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .map((e) => AppNotificationModel.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList();
        } else if (data is Map && (data['rows'] is List || data['items'] is List || data['notifications'] is List)) {
          final list = (data['rows'] ?? data['items'] ?? data['notifications']) as List;
          return list
              .map((e) => AppNotificationModel.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList();
        }
        return <AppNotificationModel>[];
      },
    );
  }

  /// POST /notifications/:id/read
  Future<ApiResponseModel<dynamic>> markNotificationRead(String id) async {
    return _http.post(
      ApiConstants.notificationRead(id),
      body: {},
      requiresAuth: true,
    );
  }

  /// POST /notifications/read-all
  Future<ApiResponseModel<dynamic>> markAllNotificationsRead() async {
    return _http.post(
      ApiConstants.notificationReadAll,
      body: {},
      requiresAuth: true,
    );
  }

  /// DELETE /notifications/:id
  Future<ApiResponseModel<dynamic>> deleteNotification(String id) async {
    return _http.delete(
      ApiConstants.notificationDelete(id),
      requiresAuth: true,
    );
  }

  /// DELETE /notifications
  Future<ApiResponseModel<dynamic>> clearAllNotifications() async {
    return _http.delete(
      ApiConstants.notifications,
      requiresAuth: true,
    );
  }
}
