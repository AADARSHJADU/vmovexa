import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/work_order_model.dart';
import '../models/edge_device_model.dart';
import '../models/device_telemetry_model.dart';
import '../models/connectivity_test_model.dart';
import '../models/device_config_model.dart';
import '../models/gps_device_model.dart';
import '../models/fleet_models.dart';
import 'http_client_service.dart';

class TechnicianService extends GetxService {
  static TechnicianService get to => Get.find<TechnicianService>();

  HttpClientService get _http => HttpClientService.to;

  // ==========================================================
  // SECTION 1: Technician Self-Service (Work Orders)
  // ==========================================================

  /// GET /me/technician/work-orders
  Future<ApiResponseModel<List<WorkOrderModel>>> getMyWorkOrders({
    int page = 1,
    int limit = 20,
    String status = '',
    String priority = '',
    String search = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status.isNotEmpty) 'status': status,
      if (priority.isNotEmpty) 'priority': priority,
      if (search.isNotEmpty) 'search': search,
    };

    return _http.get<List<WorkOrderModel>>(
      ApiConstants.techWorkOrders,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => WorkOrderModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <WorkOrderModel>[];
      },
    );
  }

  /// GET /me/technician/work-orders/:id
  Future<ApiResponseModel<WorkOrderModel>> getMyWorkOrder(dynamic id) async {
    return _http.get<WorkOrderModel>(
      ApiConstants.techWorkOrderOne(id.toString()),
      requiresAuth: true,
      create: (data) => WorkOrderModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// PATCH /me/technician/work-orders/:id/status
  Future<ApiResponseModel<dynamic>> updateMyWorkOrderStatus(
    dynamic id, {
    required String status,
    String? resolutionNotes,
    List<String>? partsReplaced,
  }) async {
    final body = <String, dynamic>{
      'status': status,
      if (resolutionNotes != null && resolutionNotes.isNotEmpty) 'resolution_notes': resolutionNotes,
      if (partsReplaced != null && partsReplaced.isNotEmpty) 'parts_replaced': partsReplaced,
    };

    return _http.patch(
      ApiConstants.techWorkOrderStatus(id.toString()),
      body: body,
      requiresAuth: true,
    );
  }

  // ==========================================================
  // SECTION 2: Edge Devices & IoT Telemetry
  // ==========================================================

  /// GET /edge-devices
  Future<ApiResponseModel<List<EdgeDeviceModel>>> getEdgeDevices({
    int page = 1,
    int limit = 50,
    String search = '',
    String status = '',
    String? vehicleId,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
      if (status.isNotEmpty) 'status': status,
      if (vehicleId != null && vehicleId.isNotEmpty) 'vehicle_id': vehicleId,
    };

    return _http.get<List<EdgeDeviceModel>>(
      ApiConstants.edgeDevices,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => EdgeDeviceModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => EdgeDeviceModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).map((item) => EdgeDeviceModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <EdgeDeviceModel>[];
      },
    );
  }

  /// GET /edge-devices/:id
  Future<ApiResponseModel<EdgeDeviceModel>> getEdgeDevice(dynamic id) async {
    return _http.get<EdgeDeviceModel>(
      ApiConstants.edgeDeviceOne(id.toString()),
      requiresAuth: true,
      create: (data) => EdgeDeviceModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// POST /edge-devices
  Future<ApiResponseModel<dynamic>> registerEdgeDevice(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.edgeDevices,
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /edge-devices/:id
  Future<ApiResponseModel<dynamic>> updateEdgeDevice(dynamic id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.edgeDeviceOne(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /edge-devices/:id/toggle
  Future<ApiResponseModel<dynamic>> toggleEdgeDevice(dynamic id, bool isActive) async {
    return _http.patch(
      ApiConstants.edgeDeviceToggle(id.toString()),
      body: {'is_active': isActive, 'isActive': isActive},
      requiresAuth: true,
    );
  }

  /// DELETE /edge-devices/:id
  Future<ApiResponseModel<dynamic>> deleteEdgeDevice(dynamic id) async {
    return _http.delete(
      ApiConstants.edgeDeviceOne(id.toString()),
      requiresAuth: true,
    );
  }

  /// POST /edge-devices/:id/reboot
  Future<ApiResponseModel<dynamic>> rebootEdgeDevice(dynamic id, {String? reason}) async {
    return _http.post(
      ApiConstants.edgeDeviceReboot(id.toString()),
      body: {'reason': reason ?? 'Technician remote reboot requested'},
      requiresAuth: true,
    );
  }

  /// POST /edge-devices/:id/factory-reset
  Future<ApiResponseModel<dynamic>> factoryResetEdgeDevice(dynamic id) async {
    return _http.post(
      ApiConstants.edgeDeviceFactoryReset(id.toString()),
      body: {},
      requiresAuth: true,
    );
  }

  /// GET /edge-devices/:id/telemetry
  Future<ApiResponseModel<DeviceTelemetryModel>> getDeviceTelemetry(dynamic deviceId) async {
    return _http.get<DeviceTelemetryModel>(
      ApiConstants.edgeDeviceTelemetry(deviceId.toString()),
      requiresAuth: true,
      create: (data) => DeviceTelemetryModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// GET /edge-devices/:id/connectivity-tests
  Future<ApiResponseModel<List<ConnectivityTestModel>>> getConnectivityTests(dynamic deviceId) async {
    return _http.get<List<ConnectivityTestModel>>(
      ApiConstants.edgeDeviceConnectivityTests(deviceId.toString()),
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => ConnectivityTestModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => ConnectivityTestModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <ConnectivityTestModel>[];
      },
    );
  }

  /// POST /edge-devices/:id/connectivity-tests
  Future<ApiResponseModel<ConnectivityTestModel>> runConnectivityTest(
    dynamic deviceId, {
    String testType = 'full_diagnostics',
  }) async {
    return _http.post<ConnectivityTestModel>(
      ApiConstants.edgeDeviceConnectivityTests(deviceId.toString()),
      body: {'test_type': testType},
      requiresAuth: true,
      create: (data) => ConnectivityTestModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  // ==========================================================
  // SECTION 3: Device Configurations (Display & System)
  // ==========================================================

  /// GET /edge-devices/:id/config
  Future<ApiResponseModel<DeviceConfigModel>> getEdgeConfig(dynamic id) async {
    return _http.get<DeviceConfigModel>(
      ApiConstants.edgeDeviceConfig(id.toString()),
      requiresAuth: true,
      create: (data) => DeviceConfigModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// POST /edge-devices/:id/config
  Future<ApiResponseModel<dynamic>> pushEdgeConfig(dynamic id, Map<String, dynamic> config) async {
    return _http.post(
      ApiConstants.edgeDeviceConfig(id.toString()),
      body: {'config': config},
      requiresAuth: true,
    );
  }

  /// GET /displays/:id/config
  Future<ApiResponseModel<DeviceConfigModel>> getDisplayConfig(dynamic id) async {
    return _http.get<DeviceConfigModel>(
      ApiConstants.displayConfig(id.toString()),
      requiresAuth: true,
      create: (data) => DeviceConfigModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// PATCH /displays/:id/config
  Future<ApiResponseModel<dynamic>> updateDisplayConfig(dynamic id, Map<String, dynamic> config) async {
    return _http.patch(
      ApiConstants.displayConfig(id.toString()),
      body: config,
      requiresAuth: true,
    );
  }

  // ==========================================================
  // SECTION 4: GPS Telematics Devices
  // ==========================================================

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
      if (status.isNotEmpty) 'status': status,
    };

    return _http.get<List<GpsDeviceModel>>(
      ApiConstants.gpsDevices,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => GpsDeviceModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => GpsDeviceModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <GpsDeviceModel>[];
      },
    );
  }

  /// POST /gps-devices/:id/assign
  Future<ApiResponseModel<dynamic>> assignGpsToVehicle(
    dynamic gpsId, {
    required dynamic vehicleId,
    String? mountLocation,
    String? technicianId,
  }) async {
    final body = <String, dynamic>{
      'vehicle_id': vehicleId.toString(),
      'vehicleId': vehicleId.toString(),
      if (mountLocation != null && mountLocation.isNotEmpty) 'mount_location': mountLocation,
      if (technicianId != null && technicianId.isNotEmpty) 'installed_by_technician_id': technicianId,
    };

    return _http.post(
      ApiConstants.gpsDeviceAssign(gpsId.toString()),
      body: body,
      requiresAuth: true,
    );
  }

  /// POST /gps-devices
  Future<ApiResponseModel<dynamic>> registerGpsDevice(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.gpsDevices,
      body: data,
      requiresAuth: true,
    );
  }

  // ==========================================================
  // SECTION 5: Auxiliary Lookups (Vehicles & Depots)
  // ==========================================================

  /// GET /vehicles
  Future<ApiResponseModel<List<VehicleItemModel>>> getVehicles({
    int page = 1,
    int limit = 100,
    String search = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
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
        }
        return <VehicleItemModel>[];
      },
    );
  }

  /// GET /depots
  Future<ApiResponseModel<List<DepotItemModel>>> getDepots({
    int page = 1,
    int limit = 100,
    String search = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
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
        }
        return <DepotItemModel>[];
      },
    );
  }
}
