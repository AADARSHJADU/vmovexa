import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/fleet_models.dart';
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

  /// GET /drivers
  Future<ApiResponseModel<List<DriverItemModel>>> getDrivers({
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

  /// POST /drivers
  Future<ApiResponseModel<dynamic>> addDriver(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.drivers,
      body: data,
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
  Future<ApiResponseModel<dynamic>> getTrips({int page = 1, int limit = 20}) async {
    return _http.get(
      ApiConstants.trips,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
    );
  }

  /// GET /gps-devices
  Future<ApiResponseModel<dynamic>> getGpsDevices({int page = 1, int limit = 20}) async {
    return _http.get(
      ApiConstants.gpsDevices,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
    );
  }

  /// GET /incidents
  Future<ApiResponseModel<dynamic>> getIncidents({int page = 1, int limit = 20}) async {
    return _http.get(
      ApiConstants.incidents,
      queryParams: {'page': page, 'limit': limit},
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
      ApiConstants.contentPage(type),
      queryParams: {'role': role},
      requiresAuth: true,
    );
  }
}
