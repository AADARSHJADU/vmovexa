// lib/app/data/services/government_service.dart
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/government_models.dart';
import 'http_client_service.dart';

class GovernmentService extends GetxService {
  static GovernmentService get to => Get.find<GovernmentService>();

  HttpClientService get _http => HttpClientService.to;

  /// 1. GET /api/v1/government/analytics — Agency Analytics & KPIs
  Future<ApiResponseModel<GovAnalyticsModel>> getAgencyAnalytics() async {
    return _http.get<GovAnalyticsModel>(
      ApiConstants.governmentAnalytics,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return GovAnalyticsModel.fromJson(Map<String, dynamic>.from(data));
        }
        return GovAnalyticsModel();
      },
    );
  }

  /// 2. GET /api/v1/campaigns?ownerType=government — List government campaigns
  Future<ApiResponseModel<List<GovCampaignModel>>> getCampaigns({
    String? ownerType = 'government',
    String? status,
    String? search,
    int? page,
    int? limit,
  }) async {
    final query = <String, dynamic>{
      'ownerType': ownerType ?? 'government',
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status.toLowerCase(),
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    return _http.get<List<GovCampaignModel>>(
      ApiConstants.campaigns,
      queryParams: query,
      requiresAuth: true,
      create: (data) {
        final list = <GovCampaignModel>[];
        dynamic rawList;

        if (data is List) {
          rawList = data;
        } else if (data is Map) {
          rawList = data['items'] ?? data['rows'] ?? data['campaigns'] ?? data['data'];
        }

        if (rawList is List) {
          for (final item in rawList) {
            if (item is Map) {
              list.add(GovCampaignModel.fromJson(Map<String, dynamic>.from(item)));
            }
          }
        }
        return list;
      },
    );
  }

  /// 3. GET /api/v1/campaigns/:id — Single campaign details
  Future<ApiResponseModel<GovCampaignModel>> getCampaign(String id) async {
    return _http.get<GovCampaignModel>(
      ApiConstants.campaignOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('campaign') && data['campaign'] is Map
              ? Map<String, dynamic>.from(data['campaign'])
              : Map<String, dynamic>.from(data);
          return GovCampaignModel.fromJson(map);
        }
        return GovCampaignModel();
      },
    );
  }

  /// 4. POST /api/v1/campaigns — Create new government campaign
  Future<ApiResponseModel<GovCampaignModel>> createCampaign(Map<String, dynamic> payload) async {
    final body = {
      'owner_type': 'government',
      'ownerType': 'government',
      ...payload,
    };

    return _http.post<GovCampaignModel>(
      ApiConstants.campaigns,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('campaign') && data['campaign'] is Map
              ? Map<String, dynamic>.from(data['campaign'])
              : Map<String, dynamic>.from(data);
          return GovCampaignModel.fromJson(map);
        }
        return GovCampaignModel();
      },
    );
  }

  /// 5. PUT /api/v1/campaigns/:id — Update existing campaign
  Future<ApiResponseModel<dynamic>> updateCampaign(String id, Map<String, dynamic> data) async {
    return _http.put(
      ApiConstants.campaignOne(id),
      body: data,
      requiresAuth: true,
    );
  }

  /// 6. DELETE /api/v1/campaigns/:id — Delete campaign
  Future<ApiResponseModel<dynamic>> deleteCampaign(String id) async {
    return _http.delete(
      ApiConstants.campaignOne(id),
      requiresAuth: true,
    );
  }

  /// 7. POST /api/v1/campaigns/:id/pause — Pause campaign
  Future<ApiResponseModel<dynamic>> pauseCampaign(String id) async {
    return _http.post(
      ApiConstants.campaignPause(id),
      requiresAuth: true,
    );
  }

  /// 8. POST /api/v1/campaigns/:id/start — Start/Resume campaign
  Future<ApiResponseModel<dynamic>> startCampaign(String id) async {
    return _http.post(
      ApiConstants.campaignStart(id),
      requiresAuth: true,
    );
  }

  /// 9. GET /api/v1/emergency-broadcasts — List emergency broadcasts
  Future<ApiResponseModel<List<EmergencyBroadcastModel>>> getEmergencyBroadcasts({
    int? page,
    int? limit,
  }) async {
    final query = <String, dynamic>{
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
    };

    return _http.get<List<EmergencyBroadcastModel>>(
      ApiConstants.emergencyBroadcasts,
      queryParams: query,
      requiresAuth: true,
      create: (data) {
        final list = <EmergencyBroadcastModel>[];
        dynamic rawList;

        if (data is List) {
          rawList = data;
        } else if (data is Map) {
          rawList = data['items'] ?? data['rows'] ?? data['broadcasts'] ?? data['data'];
        }

        if (rawList is List) {
          for (final item in rawList) {
            if (item is Map) {
              list.add(EmergencyBroadcastModel.fromJson(Map<String, dynamic>.from(item)));
            }
          }
        }
        return list;
      },
    );
  }

  /// 10. POST /api/v1/emergency-broadcasts — Create emergency broadcast override
  Future<ApiResponseModel<EmergencyBroadcastModel>> createEmergencyBroadcast(Map<String, dynamic> data) async {
    final body = {
      'title': data['title'] ?? data['headline'] ?? 'Transit Override Alert',
      'headline': data['headline'] ?? data['title'] ?? 'Emergency Advisory',
      'message': data['message'] ?? data['bodyText'] ?? data['body_text'] ?? '',
      'bodyText': data['bodyText'] ?? data['message'] ?? '',
      'authority': data['authority'] ?? 'Department of Public Safety',
      'severity': (data['severity'] ?? 'critical').toString().toLowerCase(),
      'targetScope': data['targetScope'] ?? (data['targetArea'] != null ? 'partial' : 'all'),
      'targetArea': data['targetArea'] ?? 'Entire Transit Network',
      'tickerText': data['tickerText'] ?? data['message'],
      'sirenSound': data['sirenSound'] ?? true,
      'audioChime': data['audioChime'] ?? true,
      'pushNotification': data['pushNotification'] ?? true,
      'autoExpireMinutes': data['autoExpireMinutes'] ?? 360,
      if (data['mediaUrl'] != null) 'mediaUrl': data['mediaUrl'],
      if (data['mediaType'] != null) 'mediaType': data['mediaType'],
      if (data['targets'] != null) 'targets': data['targets'],
    };

    return _http.post<EmergencyBroadcastModel>(
      ApiConstants.emergencyBroadcasts,
      body: body,
      requiresAuth: true,
      create: (resData) {
        if (resData is Map) {
          final map = resData.containsKey('broadcast') && resData['broadcast'] is Map
              ? Map<String, dynamic>.from(resData['broadcast'])
              : Map<String, dynamic>.from(resData);
          return EmergencyBroadcastModel.fromJson(map);
        }
        return EmergencyBroadcastModel();
      },
    );
  }

  /// 11. POST /api/v1/emergency-broadcasts/:id/revoke — Revoke emergency broadcast
  Future<ApiResponseModel<dynamic>> revokeEmergencyBroadcast(String id) async {
    return _http.post(
      ApiConstants.emergencyBroadcastRevoke(id),
      requiresAuth: true,
    );
  }

  /// 12. GET /api/v1/campaigns/tracking/live — Live vehicle telemetry & screen status
  Future<ApiResponseModel<LiveTrackingDataModel>> getLiveTracking({String? routeId}) async {
    final query = <String, dynamic>{
      if (routeId != null && routeId.isNotEmpty && routeId != 'all') 'routeId': routeId,
    };

    return _http.get<LiveTrackingDataModel>(
      ApiConstants.campaignTrackingLive,
      queryParams: query,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return LiveTrackingDataModel.fromJson(Map<String, dynamic>.from(data));
        }
        return LiveTrackingDataModel();
      },
    );
  }

  /// Get live tracking telemetry for a specific campaign
  Future<ApiResponseModel<LiveTrackingDataModel>> getCampaignTracking(String campaignId) async {
    return getLiveTracking();
  }

  /// 13. GET /api/v1/campaigns/tracking/routes — Transit routes for live tracking
  Future<ApiResponseModel<List<TrackingRouteModel>>> getTrackingRoutes() async {
    return _http.get<List<TrackingRouteModel>>(
      ApiConstants.campaignTrackingRoutes,
      requiresAuth: true,
      create: (data) {
        final list = <TrackingRouteModel>[];
        dynamic rawList;

        if (data is List) {
          rawList = data;
        } else if (data is Map) {
          rawList = data['routes'] ?? data['items'] ?? data['rows'] ?? data['data'];
        }

        if (rawList is List) {
          for (final item in rawList) {
            if (item is Map) {
              list.add(TrackingRouteModel.fromJson(Map<String, dynamic>.from(item)));
            }
          }
        }
        return list;
      },
    );
  }

  /// 14. GET /api/v1/campaigns/fleet-options — Targeting fleet operators & routes
  Future<ApiResponseModel<Map<String, dynamic>>> getFleetOptions() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.campaignFleetOptions,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : {},
    );
  }

  /// 15. Upload Media File (Image / Video) for Campaign or Emergency Broadcast
  Future<ApiResponseModel<Map<String, dynamic>>> uploadCampaignMedia(
    String filePath, {
    String purpose = 'campaign',
  }) async {
    return _http.uploadFile(
      filePath: filePath,
      endpoint: ApiConstants.uploads,
      purpose: purpose,
      fileField: 'file',
      requiresAuth: true,
    );
  }

  /// 16. GET /api/v1/trips/:id — Fetch trip dispatch details
  Future<ApiResponseModel<Map<String, dynamic>>> getTrip(String id) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.tripOne(id),
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// 17. GET /api/v1/trips — Fetch trip list
  Future<ApiResponseModel<dynamic>> getTrips({int limit = 10}) async {
    return _http.get(
      ApiConstants.trips,
      queryParams: {'limit': limit},
      requiresAuth: true,
    );
  }

  /// 18. PATCH /api/v1/trips/:id/end — Complete / end active trip
  Future<ApiResponseModel<dynamic>> endTrip(String id) async {
    return _http.patch(
      ApiConstants.tripEnd(id),
      requiresAuth: true,
    );
  }
}
