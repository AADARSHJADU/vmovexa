import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import '../../../../../routes/app_routes.dart';

class AdvertiserDashboardController extends GetxController {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  final RxInt selectedNavIndex = 0.obs;
  final RxString tab4Mode = 'profile'.obs; // 'profile', 'billing', 'help'
  final RxString selectedReportCampaign = 'Summer Sale 2026'.obs;
  final RxString selectedReportRange = '20 May 2026 - 10 Jun 2026'.obs;
  final List<String> reportCampaigns = ['Summer Sale 2026', 'Monsoon Offer', 'New Product Launch'];
  final List<String> reportRanges = ['20 May 2026 - 10 Jun 2026', '15 May 2026 - 30 May 2026'];

  void switchToBillingPayment() {
    Get.toNamed(Routes.ADVERTISER_BILLING);
  }

  // Loading & Refreshing States
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isAnalyticsLoading = false.obs;
  final RxBool isBillingLoading = false.obs;

  // Real data state
  final RxList<CampaignModel> allCampaigns = <CampaignModel>[].obs;
  final RxList<CampaignModel> filteredCampaigns = <CampaignModel>[].obs;
  final RxMap<String, dynamic> overviewStats = <String, dynamic>{}.obs;
  final RxMap<String, dynamic> mqttStatus = <String, dynamic>{}.obs;
  final RxList<Map<String, dynamic>> perfSeries = <Map<String, dynamic>>[].obs;
  final RxMap<String, dynamic> walletData = <String, dynamic>{}.obs;
  final RxList<dynamic> invoicesList = <dynamic>[].obs;
  final RxList<dynamic> transactionsList = <dynamic>[].obs;

  // Active status category filter pill selection inside Campaigns Tab
  final RxString activeFilter = 'All'.obs;
  final RxString searchQuery = ''.obs;
  final RxString selectedSort = 'Recent'.obs;
  final List<String> statusTabs = [
    'All',
    'Under Review',
    'Approved',
    'Running',
    'Scheduled',
    'Draft',
    'Completed',
    'Paused',
  ];
  final List<String> sortOptions = ['Recent', 'Name', 'Budget-High', 'Budget-Low', 'Screens'];

  // Lifecycle & Flow (Tab 2) state
  final RxString activeLifecycleTab = 'pipeline'.obs; // 'pipeline' | 'roles' | 'matrix'
  final RxInt selectedPipelineStep = 1.obs;
  final RxBool showDiagram = true.obs;
  final RxString activeLifecycleStage = 'all'.obs;
  final RxString busyCampaignId = ''.obs;

  AdvertiserService get _service => AdvertiserService.to;

  @override
  void onInit() {
    super.onInit();
    ever(activeFilter, (_) => _applyFilter());
    ever(searchQuery, (_) => _applyFilter());
    ever(selectedSort, (_) => _applyFilter());
    loadDashboardData();
  }

  void openDrawer() {
    scaffoldKey.currentState?.openDrawer();
  }

  /// Initial load or pull-to-refresh
  Future<void> loadDashboardData({bool isRefresh = false}) async {
    if (isRefresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }
    try {
      await Future.wait([
        fetchCampaigns(),
        fetchOverviewAnalytics(),
        fetchMqttStatus(),
        fetchBillingData(),
      ]);
    } catch (e) {
      debugPrint('Error loading advertiser dashboard data: $e');
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  }

  /// GET /api/v1/campaigns
  Future<void> fetchCampaigns() async {
    try {
      final res = await _service.getCampaigns(ownerType: 'advertiser');
      if (res.isSuccess && res.data != null) {
        allCampaigns.assignAll(res.data!);
        _applyFilter();
        debugPrint('✅ [Campaigns] loaded ${allCampaigns.length} campaigns');
      } else {
        debugPrint('⚠️ [Campaigns] fetchCampaigns returned: ${res.message}');
      }
    } catch (e, stack) {
      debugPrint('❌ Error fetching campaigns: $e\n$stack');
    }
  }

  /// GET /api/v1/campaigns/analytics/overview
  Future<void> fetchOverviewAnalytics() async {
    isAnalyticsLoading.value = true;
    try {
      final res = await _service.getOverviewAnalytics();
      if (res.isSuccess && res.data != null) {
        overviewStats.assignAll(res.data!);
        _parsePerfSeries(res.data!);
      }
    } catch (e) {
      debugPrint('Error fetching campaign overview analytics: $e');
    } finally {
      isAnalyticsLoading.value = false;
    }
  }

  /// GET /api/v1/campaigns/mqtt-status
  Future<void> fetchMqttStatus() async {
    try {
      final res = await _service.getMqttStatus();
      if (res.isSuccess && res.data != null) {
        mqttStatus.assignAll(res.data!);
      }
    } catch (e) {
      debugPrint('Error fetching mqtt status: $e');
    }
  }

  /// Parses 7-day performance series for the bar chart
  void _parsePerfSeries(Map<String, dynamic> data) {
    final daily = data['daily'];
    if (daily is List && daily.isNotEmpty) {
      final list = <Map<String, dynamic>>[];
      for (final item in daily) {
        if (item is Map) {
          final rawDate = item['date']?.toString() ?? '';
          final impressions = int.tryParse(item['impressions']?.toString() ?? '0') ?? 0;
          final playbacks = int.tryParse((item['screens_played'] ?? item['playbacks'])?.toString() ?? '0') ?? 0;
          list.add({
            'date': _formatDayLabel(rawDate),
            'rawDate': rawDate,
            'impressions': impressions,
            'playbacks': playbacks,
          });
        }
      }
      perfSeries.assignAll(list.take(7).toList());
    } else {
      perfSeries.clear();
    }
  }

  String _formatDayLabel(String rawDate) {
    if (rawDate.isEmpty) return '—';
    try {
      final parsed = DateTime.parse(rawDate);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[parsed.month - 1]} ${parsed.day}';
    } catch (_) {
      return rawDate.length > 5 ? rawDate.substring(5) : rawDate;
    }
  }

  /// GET /api/v1/billing/wallet & invoices & transactions
  Future<void> fetchBillingData() async {
    isBillingLoading.value = true;
    try {
      final walletRes = await _service.getWalletBalance();
      if (walletRes.isSuccess && walletRes.data != null) {
        walletData.assignAll(walletRes.data!);
      }

      final invoicesRes = await _service.getInvoices();
      if (invoicesRes.isSuccess && invoicesRes.data != null) {
        final d = invoicesRes.data;
        if (d is List) {
          invoicesList.assignAll(d);
        } else if (d is Map && d['rows'] is List) {
          invoicesList.assignAll(d['rows']);
        }
      }

      final txRes = await _service.getTransactions();
      if (txRes.isSuccess && txRes.data != null) {
        final d = txRes.data;
        if (d is List) {
          transactionsList.assignAll(d);
        } else if (d is Map && d['rows'] is List) {
          transactionsList.assignAll(d['rows']);
        }
      }
    } catch (e) {
      debugPrint('Error fetching billing data: $e');
    } finally {
      isBillingLoading.value = false;
    }
  }

  // ==========================================================
  // Computed KPI Metrics & UI Helpers
  // ==========================================================

  String get greetingName {
    try {
      if (Get.isRegistered<StorageService>()) {
        final u = StorageService.to.getUser();
        if (u != null) {
          if (u.name != null && u.name!.trim().isNotEmpty) return u.name!.trim();
          if (u.companyName != null && u.companyName!.trim().isNotEmpty) return u.companyName!.trim();
        }
      }
    } catch (_) {}
    return 'Advertiser';
  }

  bool get isMqttConnected {
    return mqttStatus['mqttConnected'] == true || mqttStatus['brokerConnected'] == true;
  }

  int get onlineDevicesCount {
    return int.tryParse((mqttStatus['onlineEdgeDevices'] ?? mqttStatus['onlineDevices'] ?? 0).toString()) ?? 0;
  }

  int get activeCampaignsCount {
    if (overviewStats['activeCampaigns'] != null) {
      return int.tryParse(overviewStats['activeCampaigns'].toString()) ?? 0;
    }
    return allCampaigns.where((c) => c.isLive).length;
  }

  int get totalCampaignsCount {
    if (overviewStats['totalCampaigns'] != null) {
      return int.tryParse(overviewStats['totalCampaigns'].toString()) ?? 0;
    }
    return allCampaigns.length;
  }

  int get impressionsDeliveredCount {
    if (overviewStats['impressionsDelivered'] != null || overviewStats['impressions'] != null) {
      return int.tryParse((overviewStats['impressionsDelivered'] ?? overviewStats['impressions']).toString()) ?? 0;
    }
    int sum = 0;
    for (final c in allCampaigns) {
      sum += c.stats?.impressions ?? 0;
    }
    return sum;
  }

  int get screenPlaybacksCount {
    if (overviewStats['totalPlaybacks'] != null) {
      return int.tryParse(overviewStats['totalPlaybacks'].toString()) ?? 0;
    }
    int sum = 0;
    for (final c in allCampaigns) {
      sum += c.stats?.playbacks ?? 0;
    }
    return sum;
  }

  int get qrScansCount {
    if (overviewStats['totalScans'] != null || overviewStats['scans'] != null) {
      return int.tryParse((overviewStats['totalScans'] ?? overviewStats['scans']).toString()) ?? 0;
    }
    int sum = 0;
    for (final c in allCampaigns) {
      sum += c.stats?.qrScans ?? 0;
    }
    return sum;
  }

  double get totalSpentAmount {
    if (overviewStats['spent'] != null) {
      return double.tryParse(overviewStats['spent'].toString()) ?? 0.0;
    }
    double sum = 0.0;
    for (final c in allCampaigns) {
      sum += c.stats?.spend ?? 0.0;
    }
    return sum;
  }

  double get totalBudgetAmount {
    if (overviewStats['budget'] != null) {
      return double.tryParse(overviewStats['budget'].toString()) ?? 0.0;
    }
    double sum = 0.0;
    for (final c in allCampaigns) {
      sum += c.rawBudget ?? 0.0;
    }
    return sum;
  }

  String formatMoney(num amount) {
    final v = amount.toDouble();
    if (v >= 10000000) return '₹ ${(v / 10000000).toStringAsFixed(2)}Cr';
    if (v >= 100000) return '₹ ${(v / 100000).toStringAsFixed(2)}L';
    if (v >= 1000) return '₹ ${(v / 1000).toStringAsFixed(1)}K';
    return '₹ ${v.toStringAsFixed(0)}';
  }

  List<CampaignModel> get recentCampaigns => allCampaigns.take(5).toList();

  // ==========================================================
  // Lifecycle & Flow Filtering (Tab 2)
  // ==========================================================

  void setLifecycleTab(String tab) {
    activeLifecycleTab.value = tab;
  }

  void selectPipelineStep(int step) {
    selectedPipelineStep.value = step;
  }

  void toggleDiagram() {
    showDiagram.value = !showDiagram.value;
  }

  void setLifecycleStage(String stage) {
    activeLifecycleStage.value = stage;
  }

  int getCountForStage(String stage) {
    if (stage == 'all') return allCampaigns.length;
    return allCampaigns.where((c) => c.stageOf == stage).length;
  }

  List<CampaignModel> get lifecycleCampaigns {
    final stage = activeLifecycleStage.value.toLowerCase();
    if (stage == 'all') return allCampaigns.toList();
    return allCampaigns.where((c) => c.stageOf == stage).toList();
  }

  /// Dispatches payment link to customer
  Future<void> sharePaymentLinkToCustomer(CampaignModel c, {String channel = 'all'}) async {
    busyCampaignId.value = c.id;
    try {
      final res = await _service.sharePaymentLink(c.id, {'channel': channel});
      if (res.isSuccess) {
        Get.snackbar(
          'Success',
          'Payment link dispatched to the customer via $channel.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
        fetchCampaigns();
      } else {
        Get.snackbar(
          'Error',
          res.message ?? 'Could not send payment link',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to share payment link: $e',
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      busyCampaignId.value = '';
    }
  }

  /// Channel picker dialog for sharing payment link
  void openSharePaymentLinkDialog(CampaignModel c) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Send Payment Link',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Campaign: ${c.displayTitle} (${c.displayCode})',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 16),
            const Text(
              'Select Dispatch Channel:',
              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            _buildShareOptionTile(
              icon: Icons.all_inclusive_rounded,
              title: 'All Channels (Recommended)',
              subtitle: 'Dispatches via SMS, Email and WhatsApp simultaneously',
              color: const Color(0xFF6366F1),
              onTap: () {
                Get.back();
                sharePaymentLinkToCustomer(c, channel: 'all');
              },
            ),
            _buildShareOptionTile(
              icon: Icons.sms_outlined,
              title: 'SMS Message',
              subtitle: 'Sends direct checkout SMS to ${c.clientPhone ?? 'client phone'}',
              color: const Color(0xFF0EA5E9),
              onTap: () {
                Get.back();
                sharePaymentLinkToCustomer(c, channel: 'sms');
              },
            ),
            _buildShareOptionTile(
              icon: Icons.email_outlined,
              title: 'Email Invoice',
              subtitle: 'Delivers full tax invoice link to ${c.clientEmail ?? 'client email'}',
              color: const Color(0xFFF59E0B),
              onTap: () {
                Get.back();
                sharePaymentLinkToCustomer(c, channel: 'email');
              },
            ),
            _buildShareOptionTile(
              icon: Icons.chat_bubble_outline_rounded,
              title: 'WhatsApp Message',
              subtitle: 'Sends interactive WhatsApp pay button to client',
              color: const Color(0xFF10B981),
              onTap: () {
                Get.back();
                sharePaymentLinkToCustomer(c, channel: 'whatsapp');
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildShareOptionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 18),
          ],
        ),
      ),
    );
  }

  // ==========================================================
  // Navigation & Filtering
  // ==========================================================

  void switchToBilling() {
    Get.toNamed(Routes.ADVERTISER_BILLING);
  }

  void switchToProfile() {
    tab4Mode.value = 'profile';
    selectedNavIndex.value = 4;
  }

  void switchToHelp() {
    tab4Mode.value = 'help';
    selectedNavIndex.value = 4;
  }

  void changeTab(int index) {
    selectedNavIndex.value = index;
  }

  void filterCampaigns(String filter) {
    activeFilter.value = filter;
  }

  void searchCampaigns(String query) {
    searchQuery.value = query;
  }

  void setSort(String sort) {
    selectedSort.value = sort;
  }

  int getTabCount(String tab) {
    if (tab == 'All') return allCampaigns.length;
    final t = tab.toLowerCase();
    return allCampaigns.where((c) {
      final s = c.status.toLowerCase();
      if (t == 'running') return s == 'live' || s == 'running' || s == 'active';
      if (t == 'approved') return s == 'approved';
      if (t == 'scheduled') return s == 'scheduled';
      if (t == 'draft') return s == 'draft';
      if (t == 'completed') return s == 'completed';
      if (t == 'paused') return s == 'paused';
      if (t == 'under review' || t == 'pending') return s == 'pending_approval' || s == 'pending' || s == 'under review';
      return s == t;
    }).length;
  }

  void _applyFilter() {
    final filter = activeFilter.value.trim().toLowerCase();
    final query = searchQuery.value.trim().toLowerCase();

    List<CampaignModel> results = allCampaigns.toList();

    if (filter != 'all') {
      results = results.where((c) {
        final s = c.status.toLowerCase();
        if (filter == 'running' || filter == 'live') {
          return s == 'live' || s == 'running' || s == 'active';
        } else if (filter == 'approved') {
          return s == 'approved';
        } else if (filter == 'scheduled') {
          return s == 'scheduled';
        } else if (filter == 'pending' || filter == 'under review') {
          return s == 'pending' || s == 'pending_approval' || s == 'under review';
        } else if (filter == 'completed') {
          return s == 'completed';
        } else if (filter == 'paused') {
          return s == 'paused';
        } else if (filter == 'draft') {
          return s == 'draft';
        }
        return s == filter;
      }).toList();
    }

    if (query.isNotEmpty) {
      results = results.where((c) {
        final title = c.displayTitle.toLowerCase();
        final client = c.displayClient.toLowerCase();
        final id = c.id.toLowerCase();
        final code = (c.code ?? '').toLowerCase();
        final phone = (c.clientPhone ?? '').toLowerCase();
        final email = (c.clientEmail ?? '').toLowerCase();
        final brand = (c.brandName ?? '').toLowerCase();
        return title.contains(query) ||
            client.contains(query) ||
            id.contains(query) ||
            code.contains(query) ||
            brand.contains(query) ||
            phone.contains(query) ||
            email.contains(query);
      }).toList();
    }

    if (selectedSort.value == 'Name') {
      results.sort((a, b) => a.displayTitle.toLowerCase().compareTo(b.displayTitle.toLowerCase()));
    } else if (selectedSort.value == 'Budget-High') {
      results.sort((a, b) => (b.rawBudget ?? 0).compareTo(a.rawBudget ?? 0));
    } else if (selectedSort.value == 'Budget-Low') {
      results.sort((a, b) => (a.rawBudget ?? 0).compareTo(b.rawBudget ?? 0));
    } else if (selectedSort.value == 'Screens') {
      results.sort((a, b) => b.screensCount.compareTo(a.screensCount));
    }

    filteredCampaigns.assignAll(results);
    debugPrint('📊 [Campaigns] total=${allCampaigns.length}, filtered=${filteredCampaigns.length}, filter=$filter');
  }

  // ==========================================================
  // Quick Campaign Actions
  // ==========================================================

  Future<void> startCampaign(String id) async {
    final res = await _service.startCampaign(id);
    if (res.isSuccess) {
      Get.snackbar('Success', 'Campaign started successfully',
          backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      fetchCampaigns();
    } else {
      Get.snackbar('Error', res.message ?? 'Failed to start campaign',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> pauseCampaign(String id) async {
    final res = await _service.pauseCampaign(id);
    if (res.isSuccess) {
      Get.snackbar('Success', 'Campaign paused successfully',
          backgroundColor: const Color(0xFFF97316), colorText: Colors.white);
      fetchCampaigns();
    } else {
      Get.snackbar('Error', res.message ?? 'Failed to pause campaign',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> endCampaign(String id) async {
    final res = await _service.endCampaign(id);
    if (res.isSuccess) {
      Get.snackbar('Success', 'Campaign completed successfully',
          backgroundColor: const Color(0xFF3B82F6), colorText: Colors.white);
      fetchCampaigns();
    } else {
      Get.snackbar('Error', res.message ?? 'Failed to end campaign',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> confirmEndCampaign(CampaignModel c) async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('End Campaign', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to end "${c.displayTitle}"? Broadcast will be permanently stopped.',
            style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: const Text('End Broadcast', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await endCampaign(c.id);
    }
  }

  Future<void> deleteCampaign(String id) async {
    final res = await _service.deleteCampaign(id);
    if (res.isSuccess) {
      Get.snackbar('Success', 'Campaign deleted',
          backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      fetchCampaigns();
    } else {
      Get.snackbar('Error', res.message ?? 'Failed to delete campaign',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    }
  }

  Future<void> confirmDeleteCampaign(CampaignModel c) async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Delete Campaign', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete campaign "${c.displayTitle}"? This action cannot be undone.',
            style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: const Text('Delete', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await deleteCampaign(c.id);
    }
  }

  void goToCreateCampaign() {
    Get.toNamed(Routes.CREATE_CAMPAIGN)?.then((_) => fetchCampaigns());
  }

  void goToEditCampaign(CampaignModel campaign) {
    Get.toNamed(Routes.CREATE_CAMPAIGN, arguments: {'campaign': campaign, 'isEdit': true})
        ?.then((_) => fetchCampaigns());
  }

  void goToCampaignAnalytics(CampaignModel campaign) {
    Get.toNamed(Routes.CAMPAIGN_ANALYTICS, arguments: campaign)
        ?.then((_) => fetchCampaigns());
  }

  void goToCampaignDetails(CampaignModel campaign) {
    Get.toNamed(Routes.CAMPAIGN_DETAILS, arguments: campaign)
        ?.then((_) => fetchCampaigns());
  }

  void logout() {
    Get.offAllNamed(Routes.LOGIN);
  }
}
