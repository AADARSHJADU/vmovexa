import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/campaign_model.dart';
import 'http_client_service.dart';

class AdvertiserService extends GetxService {
  static AdvertiserService get to => Get.find<AdvertiserService>();

  HttpClientService get _http => HttpClientService.to;

  // ==========================================================
  // SECTION 1: Campaigns Core CRUD & Lifecycle
  // ==========================================================

  /// GET /api/v1/campaigns
  Future<ApiResponseModel<List<CampaignModel>>> getCampaigns({
    String? ownerType = 'advertiser',
    String? status,
    String? search,
    int page = 1,
    int limit = 50,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (ownerType != null && ownerType.isNotEmpty) 'ownerType': ownerType,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status,
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
    };

    return _http.get<List<CampaignModel>>(
      ApiConstants.campaigns,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => CampaignModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => CampaignModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['items'] is List) {
          return (data['items'] as List)
              .whereType<Map>()
              .map((item) => CampaignModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['campaigns'] is List) {
          return (data['campaigns'] as List)
              .whereType<Map>()
              .map((item) => CampaignModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <CampaignModel>[];
      },
    );
  }

  /// GET /api/v1/campaigns/:id
  Future<ApiResponseModel<CampaignModel>> getCampaignById(String id) async {
    return _http.get<CampaignModel>(
      ApiConstants.campaignOne(id),
      requiresAuth: true,
      create: (data) {
        final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
        return CampaignModel.fromJson(map);
      },
    );
  }

  /// POST /api/v1/campaigns
  Future<ApiResponseModel<CampaignModel>> createCampaign(Map<String, dynamic> data) async {
    return _http.post<CampaignModel>(
      ApiConstants.campaigns,
      body: data,
      requiresAuth: true,
      create: (res) {
        final map = res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{};
        return CampaignModel.fromJson(map);
      },
    );
  }

  /// POST /api/v1/uploads (for campaign creative files)
  Future<ApiResponseModel<Map<String, dynamic>>> uploadCreativeFile(String filePath) async {
    return _http.uploadFile(
      filePath: filePath,
      purpose: 'campaigns',
      requiresAuth: true,
    );
  }

  /// PUT /api/v1/campaigns/:id or PATCH
  Future<ApiResponseModel<CampaignModel>> updateCampaign(String id, Map<String, dynamic> data) async {
    return _http.put<CampaignModel>(
      ApiConstants.campaignOne(id),
      body: data,
      requiresAuth: true,
      create: (res) {
        final map = res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{};
        return CampaignModel.fromJson(map);
      },
    );
  }

  /// DELETE /api/v1/campaigns/:id
  Future<ApiResponseModel<dynamic>> deleteCampaign(String id) async {
    return _http.delete<dynamic>(
      ApiConstants.campaignOne(id),
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/submit
  Future<ApiResponseModel<CampaignModel>> submitCampaign(String id) async {
    return _http.post<CampaignModel>(
      ApiConstants.campaignSubmit(id),
      body: {},
      requiresAuth: true,
      create: (res) {
        final map = res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{};
        return CampaignModel.fromJson(map);
      },
    );
  }

  /// POST /api/v1/campaigns/:id/verify
  Future<ApiResponseModel<dynamic>> verifyCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignVerify(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/start
  Future<ApiResponseModel<dynamic>> startCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignStart(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/pause
  Future<ApiResponseModel<dynamic>> pauseCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignPause(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/stop
  Future<ApiResponseModel<dynamic>> stopCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignStop(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/end
  Future<ApiResponseModel<dynamic>> endCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignEnd(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /api/v1/campaigns/:id/complete
  Future<ApiResponseModel<dynamic>> completeCampaign(String id) async {
    return _http.post<dynamic>(
      ApiConstants.campaignComplete(id),
      body: {},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  // ==========================================================
  // SECTION 2: Telematics, Fleet & Slot Options
  // ==========================================================

  /// GET /api/v1/campaigns/fleet-options
  Future<ApiResponseModel<List<FleetOptionModel>>> getFleetOptions() async {
    return _http.get<List<FleetOptionModel>>(
      ApiConstants.campaignFleetOptions,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => FleetOptionModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => FleetOptionModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <FleetOptionModel>[];
      },
    );
  }

  /// GET /api/v1/campaigns/slots/availability
  Future<ApiResponseModel<SlotAvailabilityModel>> getSlotAvailability(Map<String, dynamic> params) async {
    return _http.get<SlotAvailabilityModel>(
      ApiConstants.campaignSlotAvailability,
      queryParams: params,
      requiresAuth: true,
      create: (data) {
        final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
        return SlotAvailabilityModel.fromJson(map);
      },
    );
  }

  /// GET /api/v1/campaigns/mqtt-status
  Future<ApiResponseModel<Map<String, dynamic>>> getMqttStatus() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.campaignMqttStatus,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /api/v1/campaigns/tracking/live
  Future<ApiResponseModel<dynamic>> getLiveTracking() async {
    return _http.get<dynamic>(
      ApiConstants.campaignTrackingLive,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /api/v1/campaigns/tracking/routes
  Future<ApiResponseModel<dynamic>> getTrackingRoutes() async {
    return _http.get<dynamic>(
      ApiConstants.campaignTrackingRoutes,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  // ==========================================================
  // SECTION 3: Analytics & Reviews
  // ==========================================================

  /// GET /api/v1/campaigns/analytics/overview
  Future<ApiResponseModel<Map<String, dynamic>>> getOverviewAnalytics() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.campaignAnalyticsOverview,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /api/v1/campaigns/:id/analytics
  Future<ApiResponseModel<CampaignStats>> getCampaignAnalytics(String id) async {
    return _http.get<CampaignStats>(
      ApiConstants.campaignAnalytics(id),
      requiresAuth: true,
      create: (data) {
        final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
        return CampaignStats.fromJson(map);
      },
    );
  }

  /// GET /api/v1/campaigns/:id/reviews
  Future<ApiResponseModel<List<CampaignReviewModel>>> getCampaignReviews(String id) async {
    return _http.get<List<CampaignReviewModel>>(
      ApiConstants.campaignReviews(id),
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .whereType<Map>()
              .map((item) => CampaignReviewModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .whereType<Map>()
              .map((item) => CampaignReviewModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
        return <CampaignReviewModel>[];
      },
    );
  }

  // ==========================================================
  // SECTION 4: Payments & Billing
  // ==========================================================

  /// POST /api/v1/campaigns/:id/pay
  Future<ApiResponseModel<Map<String, dynamic>>> initiatePayment(String id) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.campaignPay(id),
      body: {},
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /api/v1/campaigns/:id/confirm-payment
  Future<ApiResponseModel<Map<String, dynamic>>> confirmPayment(String id, Map<String, dynamic> data) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.campaignPayConfirm(id),
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  /// POST /api/v1/campaigns/:id/record-offline-payment
  Future<ApiResponseModel<Map<String, dynamic>>> recordOfflinePayment(String id, Map<String, dynamic> data) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.campaignRecordOfflinePayment(id),
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  /// POST /api/v1/campaigns/:id/share-payment-link
  Future<ApiResponseModel<Map<String, dynamic>>> sharePaymentLink(String id, Map<String, dynamic> data) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.campaignSharePaymentLink(id),
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  /// GET /api/v1/billing/wallet
  Future<ApiResponseModel<Map<String, dynamic>>> getWalletBalance() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.billingWallet,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /api/v1/billing/invoices
  Future<ApiResponseModel<dynamic>> getInvoices({int page = 1, int limit = 20}) async {
    return _http.get<dynamic>(
      ApiConstants.billingInvoices,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /api/v1/billing/transactions
  Future<ApiResponseModel<dynamic>> getTransactions([Map<String, dynamic>? params]) async {
    return _http.get<dynamic>(
      ApiConstants.billingTransactions,
      queryParams: params,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  // ==========================================================
  // SECTION 5: Advertiser Organization & Profile
  // ==========================================================

  /// GET /api/v1/advertisers/:id
  Future<ApiResponseModel<Map<String, dynamic>>> getAdvertiserProfile(String id) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.advertiserOne(id),
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// PATCH /api/v1/advertisers/:id
  Future<ApiResponseModel<Map<String, dynamic>>> updateAdvertiserProfile(String id, Map<String, dynamic> data) async {
    return _http.patch<Map<String, dynamic>>(
      ApiConstants.advertiserOne(id),
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }
}

