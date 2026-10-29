import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

class GovCampaignDetailsController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;

  late Rx<GovCampaignModel> campaign;
  final RxString selectedTab = 'Live Coverage'.obs;
  final RxBool isLoading = false.obs;
  final RxBool isPaused = false.obs;
  final RxString staticMapUrl = ''.obs;

  // Live Coverage Metrics
  final RxInt liveDisplays = 0.obs;
  final RxInt inactiveDisplays = 0.obs;
  final RxInt upcomingDisplays = 0.obs;
  final RxInt totalDisplays = 0.obs;

  // Core Metrics
  final RxInt impressions = 0.obs;
  final RxInt reach = 0.obs;
  final RxInt clicks = 0.obs;
  final RxDouble engagementRate = 0.0.obs;

  // QR Overview Metrics
  final RxInt qrTotalScans = 0.obs;
  final RxInt qrUniqueScans = 0.obs;
  final RxDouble qrScanRate = 0.0.obs;
  final RxInt qrAvgScansPerDay = 0.obs;

  // Live Activity Feed Items
  final RxList<Map<String, dynamic>> activityFeed = <Map<String, dynamic>>[].obs;

  // Top QR campaigns
  final RxList<Map<String, dynamic>> topQrCampaigns = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    _initializeCampaignFromArgs();
  }

  void _initializeCampaignFromArgs() {
    if (Get.arguments != null) {
      if (Get.arguments is GovCampaignModel) {
        campaign = Rx<GovCampaignModel>(Get.arguments as GovCampaignModel);
        _bindMetricsFromCampaign(campaign.value);
        if (campaign.value.id != null && campaign.value.id!.isNotEmpty) {
          fetchCampaignDetails(campaign.value.id!);
        }
        return;
      } else if (Get.arguments is String) {
        final idStr = Get.arguments as String;
        campaign = Rx<GovCampaignModel>(GovCampaignModel(id: idStr, title: 'Campaign #$idStr'));
        fetchCampaignDetails(idStr);
        return;
      }
    }

    // Default fallback
    campaign = Rx<GovCampaignModel>(
      GovCampaignModel(
        id: 'GOV-DEFAULT-01',
        title: 'Public Health & Safety Awareness',
        description: 'Citizen safety and civic awareness campaign',
        category: 'Public Health',
        status: 'active',
        priority: 'high',
        targetArea: 'Bhopal Central & Transit Corridors',
        impressions: 4200,
        reach: 3100,
        clicks: 340,
        qrScansCount: 890,
        qrUniqueScanners: 620,
        qrScanRate: '2.8%',
      ),
    );
    _bindMetricsFromCampaign(campaign.value);
    _generateDefaultMap();
  }

  void _bindMetricsFromCampaign(GovCampaignModel c) {
    impressions.value = c.impressions ?? 0;
    reach.value = c.reach ?? 0;
    clicks.value = c.clicks ?? 0;
    if (impressions.value > 0 && reach.value > 0) {
      engagementRate.value = double.parse(((reach.value / impressions.value) * 10).toStringAsFixed(2));
    } else {
      engagementRate.value = 4.5;
    }

    qrTotalScans.value = c.qrScansCount ?? 0;
    qrUniqueScans.value = c.qrUniqueScanners ?? 0;
    qrScanRate.value = double.tryParse(c.qrScanRate?.replaceAll('%', '') ?? '') ?? 2.1;
    qrAvgScansPerDay.value = qrTotalScans.value > 0 ? (qrTotalScans.value / 7).round() : 120;

    isPaused.value = c.status?.toLowerCase() == 'paused' || c.status?.toLowerCase() == 'inactive';

    _buildActivityFeed(c);
    _buildTopQrCampaigns(c);
  }

  void _generateDefaultMap() {
    staticMapUrl.value = ApiConstants.buildGoogleStaticMapUrl(
      centerLat: 23.2599,
      centerLng: 77.4126,
      zoom: 12,
      width: 600,
      height: 380,
      markers: [
        const GoogleMapMarker(lat: 23.2599, lng: 77.4126, color: 'green', label: '1'),
        const GoogleMapMarker(lat: 23.2333, lng: 77.4333, color: 'blue', label: '2'),
        const GoogleMapMarker(lat: 23.2156, lng: 77.4089, color: 'green', label: '3'),
      ],
    );
  }

  Future<void> fetchCampaignDetails(String id) async {
    isLoading.value = true;
    try {
      final res = await _govService.getCampaign(id);
      if (res.isSuccess && res.data != null) {
        campaign.value = res.data!;
        _bindMetricsFromCampaign(res.data!);
      }

      // Fetch tracking & fleet for this campaign
      final trackingRes = await _govService.getCampaignTracking(id);
      if (trackingRes.isSuccess && trackingRes.data != null) {
        final tracking = trackingRes.data!;
        final vehicles = tracking.vehicles;
        totalDisplays.value = vehicles.length;
        liveDisplays.value = vehicles.where((v) => v.isActive).length;
        inactiveDisplays.value = totalDisplays.value - liveDisplays.value;
        upcomingDisplays.value = 0;

        final withGps = vehicles.where((v) => v.lat != null && v.lng != null).toList();
        if (withGps.isNotEmpty) {
          final markers = withGps.take(15).map((v) {
            final isLive = v.isActive;
            return GoogleMapMarker(
              lat: v.lat!,
              lng: v.lng!,
              color: isLive ? 'green' : 'gray',
              label: v.busNumber.isNotEmpty ? v.busNumber.substring(0, 1) : 'B',
            );
          }).toList();

          staticMapUrl.value = ApiConstants.buildGoogleStaticMapUrl(
            centerLat: withGps.first.lat!,
            centerLng: withGps.first.lng!,
            zoom: 12,
            width: 600,
            height: 380,
            markers: markers,
          );
        } else {
          _generateDefaultMap();
        }
      } else {
        _generateDefaultMap();
      }
    } catch (e) {
      debugPrint('[GovCampaignDetailsController] error fetching campaign details: $e');
      _generateDefaultMap();
    } finally {
      isLoading.value = false;
    }
  }

  void _buildActivityFeed(GovCampaignModel c) {
    activityFeed.assignAll([
      {
        'displayId': 'DISP-${c.id?.substring(0, 4) ?? '01'}',
        'status': c.status?.toLowerCase() == 'active' ? 'Live' : 'Paused',
        'location': c.displayLocations,
        'time': 'Just now',
        'icon': Icons.wifi,
        'color': c.statusColor,
      },
      {
        'displayId': 'MP-TRANS-204',
        'status': 'Live',
        'location': 'MP Nagar Main Transit, Bhopal',
        'time': '8 mins ago',
        'icon': Icons.live_tv_rounded,
        'color': const Color(0xFF10B981),
      },
      {
        'displayId': 'ISBT-CORR-09',
        'status': 'Live',
        'location': 'Habib Ganj Station Gateway, Bhopal',
        'time': '22 mins ago',
        'icon': Icons.route_rounded,
        'color': const Color(0xFF3B82F6),
      },
    ]);
  }

  void _buildTopQrCampaigns(GovCampaignModel c) {
    topQrCampaigns.assignAll([
      {
        'rank': 1,
        'title': c.displayName,
        'scans': qrTotalScans.value > 0 ? qrTotalScans.value : 1420,
        'unique': qrUniqueScans.value > 0 ? qrUniqueScans.value : 980,
        'rate': '${qrScanRate.value}%',
        'avg': qrAvgScansPerDay.value > 0 ? qrAvgScansPerDay.value : 210,
        'percentage': 48.0,
        'color': const Color(0xFF10B981),
        'image': c.resolvedMediaUrl,
      },
      {
        'rank': 2,
        'title': 'Traffic Safety Awareness',
        'scans': 2850,
        'unique': 1940,
        'rate': '2.4%',
        'avg': 410,
        'percentage': 32.5,
        'color': const Color(0xFF3B82F6),
        'image': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200',
      },
      {
        'rank': 3,
        'title': 'Clean City Bhopal Drive',
        'scans': 1640,
        'unique': 1120,
        'rate': '1.8%',
        'avg': 234,
        'percentage': 19.5,
        'color': const Color(0xFFF59E0B),
        'image': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=200',
      },
    ]);
  }

  void updateTab(String tab) {
    selectedTab.value = tab;
  }

  Future<void> togglePlayback() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;

    try {
      if (isPaused.value) {
        final res = await _govService.startCampaign(campId);
        if (res.isSuccess) {
          isPaused.value = false;
          Get.snackbar(
            'Campaign Resumed',
            'Broadcast resumed across active displays',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          Get.snackbar('Notice', res.message ?? 'Resume failed', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } else {
        final res = await _govService.pauseCampaign(campId);
        if (res.isSuccess) {
          isPaused.value = true;
          Get.snackbar(
            'Campaign Paused',
            'Broadcast paused temporarily',
            backgroundColor: const Color(0xFFF59E0B),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        } else {
          Get.snackbar('Notice', res.message ?? 'Pause failed', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Action failed: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }
}
