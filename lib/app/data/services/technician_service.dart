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
import '../models/notification_model.dart';
import '../../modules/roles/technician/profile/help_support/model/tech_help_support_models.dart';
import '../../modules/roles/technician/home/model/home_models.dart';
import 'http_client_service.dart';

class TechnicianService extends GetxService {
  static TechnicianService get to => Get.find<TechnicianService>();

  HttpClientService get _http => HttpClientService.to;

  /// GET /api/v1/notifications
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
              .whereType<Map>()
              .map((item) => AppNotificationModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && (data['rows'] is List || data['items'] is List || data['notifications'] is List)) {
          final list = (data['rows'] ?? data['items'] ?? data['notifications']) as List;
          return list
              .whereType<Map>()
              .map((item) => AppNotificationModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <AppNotificationModel>[];
      },
    );
  }

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
    num? latency,
    num? packetLoss,
    num? rssi,
    String? status,
  }) async {
    final body = <String, dynamic>{
      'status': status ?? 'success',
      'latency': ?latency,
      'packetLoss': ?packetLoss,
      'rssi': ?rssi,
      'test_type': testType,
    };
    return _http.post<ConnectivityTestModel>(
      ApiConstants.edgeDeviceConnectivityTests(deviceId.toString()),
      body: body,
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
  // SECTION 5: Auxiliary Lookups (Organizations, Fleets, Vehicles & Depots)
  // ==========================================================

  /// GET /organizations
  Future<ApiResponseModel<List<OrganizationItemModel>>> getOrganizations({
    int page = 1,
    int limit = 100,
  }) async {
    return _http.get<List<OrganizationItemModel>>(
      ApiConstants.organizations,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((item) => OrganizationItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).map((item) => OrganizationItemModel.fromJson(Map<String, dynamic>.from(item))).toList();
        }
        return <OrganizationItemModel>[];
      },
    );
  }

  /// GET /fleets
  Future<ApiResponseModel<List<FleetItemModel>>> getFleets({
    int page = 1,
    int limit = 200,
    String search = '',
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
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

  // ==========================================================
  // SECTION 6: Technician Stats & Extended Display / Edge Ops
  // ==========================================================

  /// GET /me/technician/stats
  Future<ApiResponseModel<TechnicianStatsModel>> getTechnicianStats() async {
    return _http.get<TechnicianStatsModel>(
      ApiConstants.techStats,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('stats') && data['stats'] is Map
              ? Map<String, dynamic>.from(data['stats'])
              : Map<String, dynamic>.from(data);
          return TechnicianStatsModel.fromJson(map);
        }
        return TechnicianStatsModel.defaultMock();
      },
    );
  }

  /// GET /displays
  Future<ApiResponseModel<dynamic>> getDisplays({
    int page = 1,
    int limit = 50,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
    };
    return _http.get(
      ApiConstants.displays,
      queryParams: queryParams,
      requiresAuth: true,
    );
  }

  /// POST /displays
  Future<ApiResponseModel<dynamic>> registerDisplay(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.displays,
      body: data,
      requiresAuth: true,
    );
  }

  /// POST /edge-devices/:id/assign
  Future<ApiResponseModel<dynamic>> assignEdgeDevice(dynamic id, dynamic vehicleId) async {
    return _http.post(
      ApiConstants.edgeDeviceAssign(id.toString()),
      body: {'vehicleId': vehicleId, 'vehicle_id': vehicleId},
      requiresAuth: true,
    );
  }

  /// GET /edge-devices/handshake/:boxId
  Future<ApiResponseModel<dynamic>> getEdgeDeviceHandshake(String boxId) async {
    return _http.get(
      ApiConstants.edgeDeviceHandshake(boxId),
      requiresAuth: true,
    );
  }

  /// GET /edge-devices/package/download
  Future<ApiResponseModel<dynamic>> getEdgeDevicePackageDownload() async {
    return _http.get(
      ApiConstants.edgeDevicePackageDownload,
      requiresAuth: true,
    );
  }

  /// GET /edge-devices/setup-script
  Future<ApiResponseModel<dynamic>> getEdgeDeviceSetupScript() async {
    return _http.get(
      ApiConstants.edgeDeviceSetupScript,
      requiresAuth: true,
    );
  }

  /// GET /gps-devices/:id
  Future<ApiResponseModel<GpsDeviceModel>> getGpsDevice(dynamic id) async {
    return _http.get<GpsDeviceModel>(
      ApiConstants.gpsDeviceOne(id.toString()),
      requiresAuth: true,
      create: (data) => GpsDeviceModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// PATCH /gps-devices/:id
  Future<ApiResponseModel<dynamic>> updateGpsDevice(dynamic id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.gpsDeviceOne(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// DELETE /gps-devices/:id
  Future<ApiResponseModel<dynamic>> deleteGpsDevice(dynamic id) async {
    return _http.delete(
      ApiConstants.gpsDeviceOne(id.toString()),
      requiresAuth: true,
    );
  }

  /// POST /gps-devices/:id/approve
  Future<ApiResponseModel<dynamic>> approveGpsDevice(dynamic id) async {
    return _http.post(
      ApiConstants.gpsDeviceApprove(id.toString()),
      requiresAuth: true,
    );
  }

  /// POST /gps-devices/:id/reject
  Future<ApiResponseModel<dynamic>> rejectGpsDevice(dynamic id, String reason) async {
    return _http.post(
      ApiConstants.gpsDeviceReject(id.toString()),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  // ==========================================================
  // SECTION 7: Global Work Orders Management
  // ==========================================================

  /// GET /work-orders
  Future<ApiResponseModel<List<WorkOrderModel>>> getGlobalWorkOrders({
    int page = 1,
    int limit = 20,
    String? status,
    String? urgency,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status,
      if (urgency != null && urgency.isNotEmpty && urgency.toLowerCase() != 'all') 'urgency': urgency,
      if (search != null && search.isNotEmpty) 'search': search,
    };
    return _http.get<List<WorkOrderModel>>(
      ApiConstants.workOrders,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.whereType<Map>().map((i) => WorkOrderModel.fromJson(Map<String, dynamic>.from(i))).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List).whereType<Map>().map((i) => WorkOrderModel.fromJson(Map<String, dynamic>.from(i))).toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List).whereType<Map>().map((i) => WorkOrderModel.fromJson(Map<String, dynamic>.from(i))).toList();
        }
        return <WorkOrderModel>[];
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

  /// GET /work-orders/:id
  Future<ApiResponseModel<WorkOrderModel>> getWorkOrder(dynamic id) async {
    return _http.get<WorkOrderModel>(
      ApiConstants.workOrderOne(id.toString()),
      requiresAuth: true,
      create: (data) => WorkOrderModel.fromJson(data is Map ? Map<String, dynamic>.from(data) : {}),
    );
  }

  /// PATCH /work-orders/:id
  Future<ApiResponseModel<dynamic>> updateWorkOrder(dynamic id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.workOrderOne(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /work-orders/:id/approve
  Future<ApiResponseModel<dynamic>> approveWorkOrder(dynamic id) async {
    return _http.patch(
      ApiConstants.workOrderApprove(id.toString()),
      requiresAuth: true,
    );
  }

  /// PATCH /work-orders/:id/assign
  Future<ApiResponseModel<dynamic>> assignWorkOrder(dynamic id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.workOrderAssign(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// POST /work-orders/:id/rate
  Future<ApiResponseModel<dynamic>> rateWorkOrder(dynamic id, Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.workOrderRate(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// PATCH /work-orders/:id/reject
  Future<ApiResponseModel<dynamic>> rejectWorkOrder(dynamic id, String reason) async {
    return _http.patch(
      ApiConstants.workOrderReject(id.toString()),
      body: {'reason': reason},
      requiresAuth: true,
    );
  }

  /// PATCH /work-orders/:id/status
  Future<ApiResponseModel<dynamic>> updateWorkOrderStatus(dynamic id, Map<String, dynamic> data) async {
    return _http.patch(
      ApiConstants.workOrderStatus(id.toString()),
      body: data,
      requiresAuth: true,
    );
  }

  /// POST /work-orders/dispatch
  /// Atomic create + assign work order with SLA & technician
  Future<ApiResponseModel<dynamic>> dispatchWorkOrder(Map<String, dynamic> data) async {
    return _http.post(
      ApiConstants.workOrdersDispatch,
      body: data,
      requiresAuth: true,
    );
  }

  // ==========================================================
  // SECTION 8: Technician Help & Support & Ticketing
  // ==========================================================

  /// GET /content/help?role=ROLE-CENTRAL-TECH — Technician hardware guides, FAQs & academy
  Future<ApiResponseModel<TechHelpContentModel>> getTechnicianHelpContent() async {
    return _http.get<TechHelpContentModel>(
      ApiConstants.contentHelpRole('ROLE-CENTRAL-TECH'),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return TechHelpContentModel.fromJson(Map<String, dynamic>.from(data));
        }
        return TechHelpContentModel.defaultTechnicianHelp();
      },
    );
  }

  /// GET /me/support/tickets — Technician submitted support tickets
  Future<ApiResponseModel<List<TechSupportTicketModel>>> getMySupportTickets({
    int page = 1,
    int limit = 50,
  }) async {
    return _http.get<List<TechSupportTicketModel>>(
      '${ApiConstants.supportTickets}?page=$page&limit=$limit',
      requiresAuth: true,
      create: (data) {
        List items = [];
        if (data is Map) {
          if (data['tickets'] is List) {
            items = data['tickets'] as List;
          } else if (data['items'] is List) {
            items = data['items'] as List;
          } else if (data['data'] is List) {
            items = data['data'] as List;
          } else if (data['rows'] is List) {
            items = data['rows'] as List;
          }
        } else if (data is List) {
          items = data;
        }

        return items
            .whereType<Map>()
            .map((item) => TechSupportTicketModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      },
    );
  }

  /// GET /support/tickets/:id — Single support ticket details with message thread
  Future<ApiResponseModel<TechSupportTicketModel>> getSupportTicketDetails(String id) async {
    return _http.get<TechSupportTicketModel>(
      ApiConstants.supportTicketOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('ticket') && data['ticket'] is Map
              ? Map<String, dynamic>.from(data['ticket'])
              : Map<String, dynamic>.from(data);
          return TechSupportTicketModel.fromJson(map);
        }
        return TechSupportTicketModel(
          id: id,
          code: '#TKT-$id',
          subject: 'Hardware Support Ticket',
          category: 'Hardware',
          description: '',
        );
      },
    );
  }

  /// POST /support/tickets — Raise new support ticket
  Future<ApiResponseModel<TechSupportTicketModel>> createSupportTicket({
    required String subject,
    required String category,
    required String priority,
    required String description,
    List<Map<String, dynamic>>? attachments,
  }) async {
    final body = <String, dynamic>{
      'subject': subject,
      'title': subject,
      'category': category,
      'priority': priority.toLowerCase(),
      'description': description,
      'message': description,
      if (attachments != null && attachments.isNotEmpty) 'attachments': attachments,
    };

    return _http.post<TechSupportTicketModel>(
      ApiConstants.createSupportTicket,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('ticket') && data['ticket'] is Map
              ? Map<String, dynamic>.from(data['ticket'])
              : Map<String, dynamic>.from(data);
          return TechSupportTicketModel.fromJson(map);
        }
        return TechSupportTicketModel(
          id: 'new',
          code: '#TKT-NEW',
          subject: subject,
          category: category,
          priority: priority,
          description: description,
        );
      },
    );
  }

  /// POST /support/tickets/:id/messages — Reply to ticket conversation thread
  Future<ApiResponseModel<TechTicketMessageModel>> sendSupportTicketReply(
    String id, {
    required String body,
    List<Map<String, dynamic>>? attachments,
  }) async {
    final payload = <String, dynamic>{
      'body': body,
      'message': body,
      if (attachments != null && attachments.isNotEmpty) 'attachments': attachments,
    };

    return _http.post<TechTicketMessageModel>(
      ApiConstants.supportTicketMessages(id),
      body: payload,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('message') && data['message'] is Map
              ? Map<String, dynamic>.from(data['message'])
              : Map<String, dynamic>.from(data);
          return TechTicketMessageModel.fromJson(map);
        }
        return TechTicketMessageModel(
          id: 'new-msg',
          sender: 'technician',
          message: body,
          createdAt: DateTime.now().toIso8601String(),
        );
      },
    );
  }
}
