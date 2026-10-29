// lib/app/modules/roles/government/dashboard/controllers/government_dashboard_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

// Alias for backwards compatibility with any existing view references
typedef GovCampaign = GovCampaignModel;

class GovernmentDashboardController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;
  final AuthService _authService = AuthService.to;

  final RxInt selectedNavIndex = 0.obs;
  final RxString selectedAnalyticsSubTab = 'Overview'.obs;

  // Loading States
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isBroadcasting = false.obs;
  final RxBool isUploadingMedia = false.obs;

  // Live Data Observables
  final Rx<GovAnalyticsModel> analytics = GovAnalyticsModel().obs;
  final RxList<GovCampaignModel> campaigns = <GovCampaignModel>[].obs;
  final RxList<GovCampaignModel> filteredCampaigns = <GovCampaignModel>[].obs;
  final RxList<EmergencyBroadcastModel> emergencyBroadcasts = <EmergencyBroadcastModel>[].obs;
  final Rx<LiveTrackingDataModel> liveTracking = LiveTrackingDataModel().obs;
  final Rxn<EmergencyBroadcastModel> activeAlert = Rxn<EmergencyBroadcastModel>();

  // Filter & Search
  final RxString campaignsFilterTab = 'All'.obs; // 'All', 'Active', 'Scheduled', 'Completed', 'Emergency'
  final campaignSearchController = TextEditingController();
  final RxString campaignSearchQuery = ''.obs;
  final RxString sortBy = 'latest'.obs; // 'latest', 'oldest'

  // Emergency Broadcast Form Fields
  final alertMessageController = TextEditingController();
  final RxString selectedSeverity = 'Critical'.obs; // Critical, High, Medium, Low
  final RxString selectedAlertArea = 'Entire Transit Network'.obs;
  final RxBool broadcastToVehicles = true.obs;
  final RxBool broadcastToDisplays = true.obs;
  final RxBool sendPushNotification = true.obs;
  final RxString autoExpireAlert = '6 Hours'.obs;
  final RxString attachedMediaUrl = ''.obs;
  final RxString attachedMediaName = ''.obs;

  @override
  void onInit() {
    super.onInit();
    campaignSearchController.addListener(() {
      campaignSearchQuery.value = campaignSearchController.text.trim();
      filterCampaigns();
    });
    loadDashboardData();
  }

  /// Loads all live data concurrently from APIs
  Future<void> loadDashboardData({bool silent = false}) async {
    if (!silent) isLoading.value = true;
    try {
      final results = await Future.wait([
        _govService.getAgencyAnalytics(),
        _govService.getCampaigns(ownerType: 'government'),
        _govService.getEmergencyBroadcasts(),
        _govService.getLiveTracking(),
      ]);

      // 1. Analytics
      final analyticsRes = results[0];
      if (analyticsRes.isSuccess && analyticsRes.data != null) {
        analytics.value = analyticsRes.data as GovAnalyticsModel;
      }

      // 2. Campaigns
      final campaignsRes = results[1];
      if (campaignsRes.isSuccess && campaignsRes.data != null) {
        campaigns.value = campaignsRes.data as List<GovCampaignModel>;
      }

      // 3. Emergency Broadcasts
      final broadcastsRes = results[2];
      if (broadcastsRes.isSuccess && broadcastsRes.data != null) {
        final list = broadcastsRes.data as List<EmergencyBroadcastModel>;
        emergencyBroadcasts.value = list;

        // Find current active emergency alert
        final activeList = list.where((b) => b.active && b.status != 'revoked').toList();
        if (activeList.isNotEmpty) {
          activeAlert.value = activeList.first;
        } else {
          activeAlert.value = null;
        }
      }

      // 4. Live Telemetry & Tracking
      final trackingRes = results[3];
      if (trackingRes.isSuccess && trackingRes.data != null) {
        liveTracking.value = trackingRes.data as LiveTrackingDataModel;
      }

      filterCampaigns();
    } catch (e) {
      debugPrint('Error loading government dashboard data: $e');
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  /// Pull-to-refresh
  Future<void> onRefresh() async {
    isRefreshing.value = true;
    await loadDashboardData(silent: true);
  }

  void updateNavIndex(int index) {
    selectedNavIndex.value = index;
    if (index == 1) {
      filterCampaigns();
    }
  }

  // ==========================================
  // CAMPAIGNS FILTERING & SEARCH
  // ==========================================
  void setCampaignsFilterTab(String tab) {
    campaignsFilterTab.value = tab;
    filterCampaigns();
  }

  void filterCampaigns() {
    final query = campaignSearchQuery.value.toLowerCase();
    final tab = campaignsFilterTab.value;

    final list = campaigns.where((camp) {
      // Tab filter
      final status = (camp.status ?? '').toLowerCase();
      bool matchesTab = true;
      if (tab == 'Active') {
        matchesTab = status == 'live' || status == 'active';
      } else if (tab == 'Scheduled') {
        matchesTab = status == 'pending_approval' || status == 'scheduled' || status == 'draft';
      } else if (tab == 'Completed') {
        matchesTab = status == 'completed';
      } else if (tab == 'Emergency') {
        matchesTab = status == 'emergency' || (camp.priority ?? '').toLowerCase() == 'emergency';
      }

      // Search filter
      final title = (camp.title ?? camp.name ?? '').toLowerCase();
      final code = (camp.code ?? camp.id ?? '').toLowerCase();
      final cat = (camp.category ?? '').toLowerCase();
      final loc = (camp.displayLocations).toLowerCase();

      final matchesSearch = query.isEmpty ||
          title.contains(query) ||
          code.contains(query) ||
          cat.contains(query) ||
          loc.contains(query);

      return matchesTab && matchesSearch;
    }).toList();

    // Sort
    if (sortBy.value == 'latest') {
      list.sort((a, b) => (b.createdAt ?? DateTime(2025)).compareTo(a.createdAt ?? DateTime(2025)));
    } else {
      list.sort((a, b) => (a.createdAt ?? DateTime(2025)).compareTo(b.createdAt ?? DateTime(2025)));
    }

    filteredCampaigns.value = list;
  }

  // ==========================================
  // EMERGENCY BROADCAST CREATION & REVOCATION
  // ==========================================
  Future<void> broadcastEmergencyAlert() async {
    final msg = alertMessageController.text.trim();
    if (msg.isEmpty) {
      Get.snackbar(
        'Required Field',
        'Please enter the emergency alert message to broadcast.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    isBroadcasting.value = true;
    try {
      int autoExpireMins = 360;
      if (autoExpireAlert.value.contains('2')) autoExpireMins = 120;
      if (autoExpireAlert.value.contains('12')) autoExpireMins = 720;
      if (autoExpireAlert.value.contains('24')) autoExpireMins = 1440;

      final payload = {
        'title': '${selectedSeverity.value} Alert: Transit Override',
        'headline': '${selectedSeverity.value} Emergency Alert',
        'message': msg,
        'bodyText': msg,
        'tickerText': msg,
        'authority': officerDepartment,
        'severity': selectedSeverity.value.toLowerCase(),
        'targetScope': selectedAlertArea.value == 'Entire Transit Network' ? 'all' : 'partial',
        'targetArea': selectedAlertArea.value,
        'pushNotification': sendPushNotification.value,
        'sirenSound': broadcastToDisplays.value,
        'audioChime': broadcastToVehicles.value,
        'autoExpireMinutes': autoExpireMins,
        if (attachedMediaUrl.value.isNotEmpty) 'mediaUrl': attachedMediaUrl.value,
      };

      final response = await _govService.createEmergencyBroadcast(payload);

      if (response.isSuccess) {
        Get.snackbar(
          'Emergency Alert Broadcasted',
          'Override transmitted immediately across selected transit displays.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );

        alertMessageController.clear();
        attachedMediaUrl.value = '';
        attachedMediaName.value = '';

        // Reload broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.isSuccess && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }
      } else {
        Get.snackbar(
          'Broadcast Failed',
          response.message ?? 'Failed to transmit broadcast alert',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'An unexpected error occurred while transmitting alert.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isBroadcasting.value = false;
    }
  }

  Future<void> revokeEmergencyAlert(String id) async {
    try {
      final res = await _govService.revokeEmergencyBroadcast(id);
      if (res.isSuccess) {
        Get.snackbar(
          'Alert Revoked',
          'Emergency override has been successfully deactivated.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.isSuccess && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }
      } else {
        Get.snackbar('Revoke Failed', res.message ?? 'Failed to revoke alert', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to revoke alert.', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> pickMediaForAlert() async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (picked != null) {
        isUploadingMedia.value = true;
        attachedMediaName.value = picked.name;
        final res = await _govService.uploadCampaignMedia(picked.path, purpose: 'emergency');
        if (res.isSuccess && res.data != null) {
          attachedMediaUrl.value = res.data!['url']?.toString() ?? res.data!['file_url']?.toString() ?? '';
          Get.snackbar('Attached', 'Advisory media uploaded successfully', backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('Upload Failed', res.message ?? 'Media upload failed', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
          attachedMediaName.value = '';
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not pick media: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isUploadingMedia.value = false;
    }
  }

  void createNewCampaign() {
    Get.toNamed(Routes.GOVERNMENT_CREATE_CAMPAIGN)?.then((_) => loadDashboardData(silent: true));
  }

  // ==========================================
  // GETTERS & DERIVED DATA
  // ==========================================
  String get officerName {
    final u = _authService.currentUser;
    return u?.name ?? 'Government Authority';
  }

  String get officerDepartment {
    final u = _authService.currentUser;
    return u?.organization?.name ?? 'State Public Transit Department';
  }

  String get officerEmail {
    final u = _authService.currentUser;
    return u?.email ?? 'authority@gov.in';
  }

  void logout() {
    _authService.logout();
  }

  String get currentDateFormatted {
    final now = DateTime.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${now.day} ${months[now.month - 1]}, ${now.year}';
  }

  String get currentDayName {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[DateTime.now().weekday - 1];
  }

  int get kpiActiveCampaignsCount {
    if (analytics.value.activeCampaigns > 0) return analytics.value.activeCampaigns;
    return campaigns.where((c) => (c.status ?? '') == 'live' || (c.status ?? '') == 'active').length;
  }

  int get kpiScheduledCampaignsCount {
    if (analytics.value.pendingApprovals > 0) return analytics.value.pendingApprovals;
    return campaigns.where((c) => (c.status ?? '') == 'pending_approval' || (c.status ?? '') == 'scheduled' || (c.status ?? '') == 'draft').length;
  }

  int get kpiCompletedCampaignsCount {
    if (analytics.value.completedCampaigns > 0) return analytics.value.completedCampaigns;
    return campaigns.where((c) => (c.status ?? '') == 'completed').length;
  }

  int get kpiEmergencyAlertsCount {
    final active = emergencyBroadcasts.where((b) => b.active && (b.status ?? '') != 'revoked').length;
    return active > 0 ? active : (analytics.value.emergencyBroadcasts > 0 ? analytics.value.emergencyBroadcasts : 0);
  }

  int get calculatedTotalQrScans {
    if (analytics.value.totalScans > 0) return analytics.value.totalScans;
    int total = 0;
    for (final c in campaigns) {
      total += (c.qrScansCount ?? 0);
    }
    return total;
  }

  String get kpiLiveCoveragePercentage {
    if (liveTracking.value.total > 0) {
      final pct = ((liveTracking.value.broadcasting / liveTracking.value.total) * 100).round();
      return '$pct%';
    }
    return '${analytics.value.averageReach}%';
  }

  /// Generates Google Static Map URL from active live vehicles or default city center
  String get googleMapPreviewUrl {
    final vehiclesWithGps = liveTracking.value.vehicles.where((v) => v.lat != null && v.lng != null).toList();
    double centerLat = 23.2380;
    double centerLng = 77.4180;

    final markers = <Map<String, dynamic>>[];
    for (final v in vehiclesWithGps.take(10)) {
      markers.add({
        'lat': v.lat,
        'lng': v.lng,
        'color': v.screenStatus == 'Broadcasting' ? 'green' : 'red',
      });
    }

    if (vehiclesWithGps.isNotEmpty) {
      centerLat = vehiclesWithGps.first.lat!;
      centerLng = vehiclesWithGps.first.lng!;
    }

    return ApiConstants.buildGoogleStaticMapUrl(
      lat: centerLat,
      lng: centerLng,
      zoom: 12,
      markers: markers,
    );
  }

  @override
  void onClose() {
    campaignSearchController.dispose();
    alertMessageController.dispose();
    super.onClose();
  }
}
