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
  static const List<String> campaignTabs = [
    'All',
    'Approved',
    'Running',
    'Under Review',
    'Scheduled',
    'Draft',
    'Completed',
    'Paused',
    'Rejected',
  ];

  final RxString campaignsFilterTab = 'All'.obs;
  final campaignSearchController = TextEditingController();
  final RxString campaignSearchQuery = ''.obs;
  final RxString sortBy = 'Recent'.obs; // 'Recent', 'Name', 'Budget-High', 'Budget-Low', 'Screens'
  final RxMap<String, int> tabCounts = <String, int>{}.obs;

  // Emergency Broadcast Form Fields
  final alertHeadlineController = TextEditingController();
  final alertMessageController = TextEditingController();
  final emergencyNumberController = TextEditingController();
  final RxString selectedSeverity = 'Critical'.obs; // Critical, High, Medium, Low
  final RxString selectedAlertArea = 'Entire Transit Network'.obs;
  final RxBool broadcastToVehicles = true.obs;
  final RxBool broadcastToDisplays = true.obs;
  final RxBool sendPushNotification = true.obs;
  final RxString autoExpireAlert = '6 Hours'.obs;
  final RxString attachedMediaUrl = ''.obs;
  final RxString attachedMediaName = ''.obs;
  final RxInt unreadNotificationCount = 0.obs;

  // Emergency Broadcasts List Controls & Filter (Mirroring GovEmergencyListPage.jsx)
  final emergencySearchController = TextEditingController();
  final RxString emergencySearchQuery = ''.obs;
  final RxString selectedEmergencyTab = 'All'.obs; // 'All', 'Active', 'Pending Approval', 'Approved', 'Revoked', 'Expired'
  final RxString selectedEmergencySeverity = 'all'.obs; // 'all', 'critical', 'high', 'medium', 'low'
  final RxString selectedEmergencyScope = 'all'.obs; // 'all', 'all_screens', 'partial'
  final RxString selectedEmergencySort = 'newest'.obs; // 'newest', 'oldest', 'severity'

  @override
  void onInit() {
    super.onInit();
    campaignSearchController.addListener(() {
      campaignSearchQuery.value = campaignSearchController.text.trim();
      filterCampaigns();
    });
    emergencySearchController.addListener(() {
      emergencySearchQuery.value = emergencySearchController.text.trim();
    });
    loadDashboardData();
  }

  /// Loads all live data concurrently from APIs
  Future<void> loadDashboardData({bool silent = false}) async {
    if (!silent) isLoading.value = true;
    try {
      fetchUnreadNotificationCount();
      final results = await Future.wait([
        _govService.getAgencyAnalytics(),
        _govService.getCampaigns(ownerType: 'government'),
        _govService.getEmergencyBroadcasts(),
        _govService.getLiveTracking(),
      ]);

      // 1. Analytics
      final analyticsRes = results[0];
      if (analyticsRes.success && analyticsRes.data != null) {
        analytics.value = analyticsRes.data as GovAnalyticsModel;
      }

      // 2. Campaigns
      final campaignsRes = results[1];
      if (campaignsRes.success && campaignsRes.data != null) {
        campaigns.value = campaignsRes.data as List<GovCampaignModel>;
      }

      // 3. Emergency Broadcasts
      final broadcastsRes = results[2];
      if (broadcastsRes.success && broadcastsRes.data != null) {
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
      if (trackingRes.success && trackingRes.data != null) {
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

  Future<void> fetchUnreadNotificationCount() async {
    try {
      final res = await _govService.getNotifications(limit: 50);
      if (res.success && res.data != null) {
        unreadNotificationCount.value = res.data!.where((n) => !n.isRead.value).length;
      }
    } catch (_) {}
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

  void computeTabCounts() {
    final Map<String, int> counts = {};
    for (final tab in campaignTabs) {
      if (tab == 'All') {
        counts[tab] = campaigns.length;
      } else {
        counts[tab] = campaigns.where((c) => c.mappedStatus == tab).length;
      }
    }
    tabCounts.value = counts;
  }

  void filterCampaigns() {
    computeTabCounts();
    final query = campaignSearchQuery.value.toLowerCase();
    final tab = campaignsFilterTab.value;

    final list = campaigns.where((camp) {
      // Tab filter
      final matchesTab = (tab == 'All') || (camp.mappedStatus == tab);

      // Search filter
      final title = (camp.title ?? camp.name ?? '').toLowerCase();
      final brand = (camp.brandName ?? camp.clientCompany ?? camp.departmentOrClient).toLowerCase();
      final client = (camp.clientName ?? '').toLowerCase();
      final code = (camp.code ?? camp.id ?? '').toLowerCase();
      final cat = (camp.category ?? '').toLowerCase();
      final loc = (camp.displayLocations).toLowerCase();

      final matchesSearch = query.isEmpty ||
          title.contains(query) ||
          brand.contains(query) ||
          client.contains(query) ||
          code.contains(query) ||
          cat.contains(query) ||
          loc.contains(query);

      return matchesTab && matchesSearch;
    }).toList();

    // Sort options: 'Recent', 'Name', 'Budget-High', 'Budget-Low', 'Screens'
    if (sortBy.value == 'Name') {
      list.sort((a, b) => a.displayName.toLowerCase().compareTo(b.displayName.toLowerCase()));
    } else if (sortBy.value == 'Budget-High') {
      list.sort((a, b) => b.totalAmount.compareTo(a.totalAmount));
    } else if (sortBy.value == 'Budget-Low') {
      list.sort((a, b) => a.totalAmount.compareTo(b.totalAmount));
    } else if (sortBy.value == 'Screens') {
      list.sort((a, b) => b.totalScreens.compareTo(a.totalScreens));
    } else {
      // 'Recent'
      list.sort((a, b) => (b.createdAt ?? DateTime(2025)).compareTo(a.createdAt ?? DateTime(2025)));
    }

    filteredCampaigns.value = list;
  }

  // ==========================================
  // CAMPAIGN 3-DOTS ACTIONS
  // ==========================================
  Future<void> handleStartCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.startCampaign(id);
      if (res.success) {
        Get.snackbar(
          'Broadcast Started',
          'Campaign broadcast is live on transit screens.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('Failed', res.message ?? 'Could not start campaign', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to start campaign: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handlePauseCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.pauseCampaign(id);
      if (res.success) {
        Get.snackbar(
          'Broadcast Paused',
          'Campaign transit broadcast has been paused.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('Failed', res.message ?? 'Could not pause campaign', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to pause campaign: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handleEndCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_confirm_end_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('gov_confirm_end_msg'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Confirm'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        final res = await _govService.endCampaign(id);
        if (res.success) {
          Get.snackbar(
            'Campaign Ended',
            'Broadcast ended permanently.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('Failed', res.message ?? 'Could not end campaign', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to end campaign: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleApproveCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    try {
      final res = await _govService.approveCampaign(id);
      if (res.success) {
        Get.snackbar(
          'Broadcast Approved',
          'Public service broadcast cleared for transit screens.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        loadDashboardData(silent: true);
      } else {
        Get.snackbar('Failed', res.message ?? 'Approval failed', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Approval failed: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> handleRejectCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final remarksController = TextEditingController();
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_reject_dialog_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('gov_reject_dialog_hint'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: remarksController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              maxLines: 3,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                hintText: 'Enter reason...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Submit'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final reason = remarksController.text.trim();
      try {
        final res = await _govService.rejectCampaign(id, reason.isNotEmpty ? reason : 'Creative specifications incomplete');
        if (res.success) {
          Get.snackbar(
            'Campaign Rejected',
            'Revision remarks submitted.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('Failed', res.message ?? 'Could not reject campaign', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to reject campaign: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleDeleteCampaign(GovCampaignModel c) async {
    final id = c.id ?? '';
    if (id.isEmpty) return;
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('gov_confirm_delete_title'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('gov_confirm_delete_msg'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Cancel'.tr, style: const TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Get.back(result: true),
            child: Text('Confirm'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        final res = await _govService.deleteCampaign(id);
        if (res.success) {
          Get.snackbar(
            'Campaign Deleted',
            'Campaign deleted successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          loadDashboardData(silent: true);
        } else {
          Get.snackbar('Failed', res.message ?? 'Could not delete campaign', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('Error', 'Failed to delete campaign: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  // ==========================================
  // EMERGENCY BROADCAST CREATION & REVOCATION
  // ==========================================
  Future<void> broadcastEmergencyAlert() async {
    final msg = alertMessageController.text.trim();
    if (msg.isEmpty) {
      Get.snackbar(
        'Required Field',
        'gov_emergency.err_message_required'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    final headline = alertHeadlineController.text.trim().isNotEmpty
        ? alertHeadlineController.text.trim()
        : '${selectedSeverity.value} Emergency Alert';

    isBroadcasting.value = true;
    try {
      int autoExpireMins = 360;
      if (autoExpireAlert.value.contains('2')) autoExpireMins = 120;
      if (autoExpireAlert.value.contains('12')) autoExpireMins = 720;
      if (autoExpireAlert.value.contains('24')) autoExpireMins = 1440;

      final payload = {
        'title': '$headline: Transit Override',
        'headline': headline,
        'message': msg,
        'bodyText': msg,
        'tickerText': msg,
        'authority': officerDepartment,
        'severity': selectedSeverity.value.toLowerCase(),
        'targetScope': selectedAlertArea.value == 'Entire Transit Network' ? 'all' : 'partial',
        'targetArea': selectedAlertArea.value,
        if (emergencyNumberController.text.trim().isNotEmpty)
          'emergencyNumber': emergencyNumberController.text.trim(),
        'pushNotification': sendPushNotification.value,
        'sirenSound': broadcastToDisplays.value,
        'audioChime': broadcastToVehicles.value,
        'autoExpireMinutes': autoExpireMins,
        if (attachedMediaUrl.value.isNotEmpty) 'mediaUrl': attachedMediaUrl.value,
      };

      final response = await _govService.createEmergencyBroadcast(payload);

      if (response.success) {
        Get.snackbar(
          'Emergency Alert Broadcasted',
          'gov_emergency.broadcast_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );

        alertHeadlineController.clear();
        alertMessageController.clear();
        emergencyNumberController.clear();
        attachedMediaUrl.value = '';
        attachedMediaName.value = '';

        // Reload broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }

        // Return from Create Screen if pushed
        if (Get.key.currentState?.canPop() ?? false) {
          Get.back();
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
        'An unexpected error occurred while transmitting alert: $e',
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
      if (res.success) {
        Get.snackbar(
          'Alert Revoked',
          'gov_emergency.revoke_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
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

  Future<void> deleteEmergencyBroadcast(String id) async {
    try {
      final res = await _govService.deleteEmergencyBroadcast(id);
      if (res.success) {
        Get.snackbar(
          'Deleted',
          'gov_emergency.delete_success'.tr,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
        );
        // Refresh broadcasts
        final broadcastsRes = await _govService.getEmergencyBroadcasts();
        if (broadcastsRes.success && broadcastsRes.data != null) {
          emergencyBroadcasts.value = broadcastsRes.data!;
          final activeList = broadcastsRes.data!.where((b) => b.active && b.status != 'revoked').toList();
          activeAlert.value = activeList.isNotEmpty ? activeList.first : null;
        }
      } else {
        Get.snackbar('Delete Failed', res.message ?? 'Failed to delete broadcast', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to delete broadcast: $e', backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
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
        if (res.success && res.data != null) {
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

  void logout() async {
    try {
      await _authService.logout();
    } catch (_) {}
    Get.offAllNamed(Routes.LOGIN);
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

  List<GovCampaignModel> get recentCampaigns {
    final nonDraft = campaigns.where((c) => (c.status ?? '').toLowerCase() != 'draft').toList();
    return nonDraft.take(3).toList();
  }

  int get kpiActiveCampaignsCount {
    if (analytics.value.activeCampaigns > 0) return analytics.value.activeCampaigns;
    return campaigns.where((c) {
      final s = (c.status ?? '').toLowerCase();
      return s == 'live' || s == 'active' || s == 'approved';
    }).length;
  }

  int get kpiScheduledCampaignsCount {
    if (analytics.value.pendingApprovals > 0) return analytics.value.pendingApprovals;
    return campaigns.where((c) {
      final s = (c.status ?? '').toLowerCase();
      return s == 'pending_approval' || s == 'scheduled' || s == 'draft';
    }).length;
  }

  int get kpiCompletedCampaignsCount {
    if (analytics.value.completedCampaigns > 0) return analytics.value.completedCampaigns;
    return campaigns.where((c) => (c.status ?? '') == 'completed').length;
  }

  int get kpiVehiclesWithGpsCount => liveTracking.value.withGps;
  int get kpiBroadcastingVehiclesCount => liveTracking.value.broadcasting;
  int get kpiTotalVehiclesCount => liveTracking.value.total;

  int get kpiEmergencyAlertsCount {
    final active = emergencyBroadcasts.where((b) => b.active && (b.status ?? '') != 'revoked').length;
    if (active > 0) return active;
    if (analytics.value.emergencyBroadcasts > 0) return analytics.value.emergencyBroadcasts;
    return emergencyBroadcasts.length;
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

  // ==========================================
  // EMERGENCY BROADCASTS LIST & FILTER GETTERS
  // ==========================================
  Map<String, int> get emergencyCounts {
    final list = emergencyBroadcasts;
    int all = list.length;
    int active = 0;
    int pending = 0;
    int approved = 0;
    int revoked = 0;
    int expired = 0;

    for (final b in list) {
      final st = (b.status ?? '').toLowerCase();
      final isAct = b.active == true || st == 'active';
      if (isAct && st != 'revoked' && st != 'expired') {
        active++;
      } else if (st == 'pending_approval' || st == 'pending') {
        pending++;
      } else if (st == 'approved') {
        approved++;
      } else if (st == 'revoked') {
        revoked++;
      } else if (st == 'expired') {
        expired++;
      }
    }
    return {
      'all': all,
      'active': active,
      'pending': pending,
      'approved': approved,
      'revoked': revoked,
      'expired': expired,
      'inactive': revoked + expired,
    };
  }

  List<EmergencyBroadcastModel> get filteredEmergencyBroadcasts {
    final q = emergencySearchController.text.trim().toLowerCase();
    final tab = selectedEmergencyTab.value;
    final sev = selectedEmergencySeverity.value.toLowerCase();
    final scope = selectedEmergencyScope.value.toLowerCase();
    final sort = selectedEmergencySort.value;

    final filtered = emergencyBroadcasts.where((b) {
      final st = (b.status ?? '').toLowerCase();
      final isAct = b.active == true || st == 'active';

      // Tab filtering (Mirroring GovEmergencyListPage.jsx lines 138-142)
      if (tab == 'Active' && !(isAct && st != 'revoked' && st != 'expired')) return false;
      if (tab == 'Pending Approval' && !(st == 'pending_approval' || st == 'pending')) return false;
      if (tab == 'Approved' && !(st == 'approved' && !isAct)) return false;
      if (tab == 'Revoked' && st != 'revoked') return false;
      if (tab == 'Expired' && st != 'expired') return false;

      // Severity filtering
      if (sev != 'all') {
        if ((b.severity ?? '').toLowerCase() != sev) return false;
      }

      // Scope filtering
      if (scope != 'all') {
        final scp = (b.targetScope ?? '').toLowerCase();
        if (scope == 'all_screens' && (scp != 'all' && scp != 'all_screens')) return false;
        if (scope == 'partial' && (scp == 'all' || scp == 'all_screens')) return false;
      }

      // Keyword Search filtering
      if (q.isNotEmpty) {
        final headline = (b.headline ?? b.title ?? '').toLowerCase();
        final code = (b.code ?? b.id ?? '').toLowerCase();
        final msg = (b.message ?? b.bodyText ?? '').toLowerCase();
        final authority = (b.authority ?? '').toLowerCase();
        final area = (b.targetArea ?? '').toLowerCase();
        if (!headline.contains(q) &&
            !code.contains(q) &&
            !msg.contains(q) &&
            !authority.contains(q) &&
            !area.contains(q)) {
          return false;
        }
      }

      return true;
    }).toList();

    // Sorting (Mirroring GovEmergencyListPage.jsx lines 172-183)
    filtered.sort((a, b) {
      if (sort == 'oldest') {
        final dateA = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final dateB = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return dateA.compareTo(dateB);
      }
      if (sort == 'severity') {
        const rank = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1};
        final rankA = rank[(a.severity ?? '').toLowerCase()] ?? 0;
        final rankB = rank[(b.severity ?? '').toLowerCase()] ?? 0;
        return rankB.compareTo(rankA);
      }
      // default newest
      final dateA = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final dateB = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return dateB.compareTo(dateA);
    });

    return filtered;
  }

  bool get hasActiveEmergencyFilters =>
      selectedEmergencyTab.value != 'All' ||
      emergencySearchController.text.trim().isNotEmpty ||
      selectedEmergencySeverity.value != 'all' ||
      selectedEmergencyScope.value != 'all' ||
      selectedEmergencySort.value != 'newest';

  void resetEmergencyFilters() {
    selectedEmergencyTab.value = 'All';
    emergencySearchController.clear();
    emergencySearchQuery.value = '';
    selectedEmergencySeverity.value = 'all';
    selectedEmergencyScope.value = 'all';
    selectedEmergencySort.value = 'newest';
  }

  @override
  void onClose() {
    campaignSearchController.dispose();
    alertHeadlineController.dispose();
    alertMessageController.dispose();
    emergencyNumberController.dispose();
    emergencySearchController.dispose();
    super.onClose();
  }
}
