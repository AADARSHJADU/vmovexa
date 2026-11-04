import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/help_support/model/help_support_models.dart';

class DriverHelpSupportController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Search ----------------
  final RxString searchQuery = ''.obs;
  void onSearchChanged(String value) => searchQuery.value = value;

  void onSearchSubmit() {
    if (searchQuery.value.trim().isEmpty) return;
    Get.toNamed('/help-search-results', arguments: {'query': searchQuery.value.trim()});
  }

  // ---------------- Loading ----------------
  final RxBool isLoading = false.obs;

  // ---------------- Quick Help ----------------
  final RxList<QuickHelpItem> quickHelpItems = <QuickHelpItem>[].obs;

  // ---------------- Contact Support ----------------
  final RxList<ContactChannel> contactChannels = <ContactChannel>[].obs;

  // ---------------- Support Tickets ----------------
  final RxList<SupportTicket> supportTickets = <SupportTicket>[].obs;

  // ---------------- Popular Articles ----------------
  final RxList<PopularArticle> popularArticles = <PopularArticle>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchHelpData();
  }

  Future<void> fetchHelpData() async {
    isLoading.value = true;
    try {
      _loadQuickHelp();
      _loadContactChannels();
      _loadPopularArticles();
      await _loadSupportTickets();
    } catch (e) {
      debugPrint('DriverHelpSupportController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchHelpData();

  void _loadQuickHelp() {
    quickHelpItems.assignAll([
      QuickHelpItem(
        title: 'FAQs',
        subtitle: 'Common questions for drivers',
        icon: Icons.help_outline,
        color: const Color(0xFFB042FF),
        route: '/faqs',
      ),
      QuickHelpItem(
        title: 'Route Guides',
        subtitle: 'Navigation and corridor guides',
        icon: Icons.menu_book_outlined,
        color: const Color(0xFF3F7BF5),
        route: '/guides',
      ),
      QuickHelpItem(
        title: 'Duty Guidelines',
        subtitle: 'Duty hours and break rules',
        icon: Icons.access_time_outlined,
        color: const Color(0xFF2ECC71),
        route: '/duty-guidelines',
      ),
      QuickHelpItem(
        title: 'Emergency SOP',
        subtitle: 'Breakdown and incident protocol',
        icon: Icons.warning_amber_rounded,
        color: const Color(0xFFFFA726),
        route: '/emergency-sop',
      ),
    ]);
  }

  void _loadContactChannels() {
    contactChannels.assignAll([
      ContactChannel(
        type: ContactChannelType.liveChat,
        title: 'Transit Dispatch Chat',
        subtitle: 'Chat with depot dispatch team',
        statusText: 'Available 24/7',
        icon: Icons.chat_bubble_outline,
        statusColor: const Color(0xFF2ECC71),
      ),
      ContactChannel(
        type: ContactChannelType.callSupport,
        title: 'Control Room Helpline',
        subtitle: 'Direct call to transit helpline',
        statusText: '+91 98765 43210',
        icon: Icons.call_outlined,
        statusColor: const Color(0xFF3F7BF5),
      ),
      ContactChannel(
        type: ContactChannelType.emailSupport,
        title: 'Email Support',
        subtitle: 'Write to transit driver support',
        statusText: 'driver.support@vmovexa.com',
        icon: Icons.email_outlined,
        statusColor: const Color(0xFFB042FF),
      ),
    ]);
  }

  Future<void> _loadSupportTickets() async {
    // 1. Try fetching from support tickets API
    try {
      final res = await HttpClientService.to.get(ApiConstants.supportTickets, requiresAuth: true);
      if (res.success && res.data is List && (res.data as List).isNotEmpty) {
        final list = (res.data as List).map((e) {
          final m = Map<String, dynamic>.from(e as Map);
          TicketStatus st = TicketStatus.inProgress;
          final s = (m['status'] ?? '').toString().toLowerCase();
          if (s == 'resolved') st = TicketStatus.resolved;
          if (s == 'closed') st = TicketStatus.closed;

          return SupportTicket(
            id: m['ticket_number']?.toString() ?? m['id']?.toString() ?? '',
            title: m['title']?.toString() ?? m['subject']?.toString() ?? 'Support Request',
            subtitle: m['category']?.toString() ?? '',
            dateText: m['created_at']?.toString() ?? '',
            status: st,
            icon: Icons.confirmation_number_outlined,
          );
        }).toList();
        supportTickets.assignAll(list);
        return;
      }
    } catch (_) {}

    // 2. Fallback to reported incidents from driver service (incidents act as driver tickets)
    try {
      final incidentsRes = await _driverService.getIncidents(page: 1, limit: 10);
      if (incidentsRes.success && incidentsRes.data != null && incidentsRes.data!.isNotEmpty) {
        final list = incidentsRes.data!.map((inc) {
          TicketStatus st = TicketStatus.inProgress;
          final s = (inc.status ?? '').toLowerCase();
          if (s == 'resolved') st = TicketStatus.resolved;
          if (s == 'closed') st = TicketStatus.closed;

          return SupportTicket(
            id: inc.ticketNumber ?? (inc.id ?? 'INC'),
            title: inc.title ?? 'Reported Incident',
            subtitle: 'Severity: ${inc.severity?.toUpperCase() ?? "LOW"}',
            dateText: inc.reportedAt ?? 'Recently',
            status: st,
            icon: Icons.warning_amber_rounded,
          );
        }).toList();

        supportTickets.assignAll(list);
        return;
      }
    } catch (_) {}

    supportTickets.clear();
  }

  void _loadPopularArticles() {
    popularArticles.assignAll([
      PopularArticle(id: 'article_1', title: 'How to report a vehicle breakdown or route hazard?'),
      PopularArticle(id: 'article_2', title: 'Managing duty status: toggle on-duty, off-duty, and breaks'),
      PopularArticle(id: 'article_3', title: 'Uploading and updating your commercial driving license'),
    ]);
  }

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  void onHeadsetTap() {
    Get.toNamed('/contact-support');
  }

  void onQuickHelpTap(QuickHelpItem item) {
    Get.toNamed(item.route);
  }

  void onContactChannelTap(ContactChannel channel) {
    switch (channel.type) {
      case ContactChannelType.liveChat:
        Get.toNamed('/live-chat');
        break;
      case ContactChannelType.callSupport:
        break;
      case ContactChannelType.emailSupport:
        break;
    }
  }

  void onTicketTap(SupportTicket ticket) {
    Get.toNamed('/ticket-detail', arguments: {'ticketId': ticket.id});
  }

  void onViewAllTickets() {
    Get.toNamed('/support-tickets');
  }

  void onArticleTap(PopularArticle article) {
    Get.toNamed('/article-detail', arguments: {'articleId': article.id});
  }

  void onViewAllArticles() {
    Get.toNamed('/help-articles');
  }
}
