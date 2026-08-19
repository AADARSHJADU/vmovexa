import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/help_support/model/help_support_models.dart';

class DriverHelpSupportController extends GetxController {
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
      // TODO: replace with real API/repository calls
      _loadQuickHelp();
      _loadContactChannels();
      _loadSupportTickets();
      _loadPopularArticles();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchHelpData();

  void _loadQuickHelp() {
    quickHelpItems.assignAll([
      QuickHelpItem(
        title: 'FAQs',
        subtitle: 'Find answers to common questions',
        icon: Icons.help_outline,
        color: const Color(0xFFB042FF),
        route: '/faqs',
      ),
      QuickHelpItem(
        title: 'Guides',
        subtitle: 'Step-by-step user guides',
        icon: Icons.menu_book_outlined,
        color: const Color(0xFF3F7BF5),
        route: '/guides',
      ),
      QuickHelpItem(
        title: 'Video Tutorials',
        subtitle: 'Watch tutorials and learn',
        icon: Icons.play_circle_outline,
        color: const Color(0xFF2ECC71),
        route: '/video-tutorials',
      ),
      QuickHelpItem(
        title: 'Best Practices',
        subtitle: 'Tips to get the best results',
        icon: Icons.lightbulb_outline,
        color: const Color(0xFFFFA726),
        route: '/best-practices',
      ),
    ]);
  }

  void _loadContactChannels() {
    contactChannels.assignAll([
      ContactChannel(
        type: ContactChannelType.liveChat,
        title: 'Live Chat',
        subtitle: 'Chat with our support team',
        statusText: 'Available Now',
        icon: Icons.chat_bubble_outline,
        statusColor: const Color(0xFF2ECC71),
      ),
      ContactChannel(
        type: ContactChannelType.callSupport,
        title: 'Call Support',
        subtitle: 'Speak with our support executive',
        statusText: '+91 98765 43210',
        icon: Icons.call_outlined,
        statusColor: const Color(0xFF3F7BF5),
      ),
      ContactChannel(
        type: ContactChannelType.emailSupport,
        title: 'Email Support',
        subtitle: 'Send us an email anytime',
        statusText: 'support@vmovexa.com',
        icon: Icons.email_outlined,
        statusColor: const Color(0xFFB042FF),
      ),
    ]);
  }

  void _loadSupportTickets() {
    supportTickets.assignAll([
      SupportTicket(
        id: 'CMP-2026-000124',
        title: 'Campaign not displaying on screens',
        subtitle: '',
        dateText: '08 May 2026, 11:30 AM',
        status: TicketStatus.inProgress,
        icon: Icons.campaign_outlined,
      ),
      SupportTicket(
        id: 'CMP-2026-000089',
        title: 'Invoice download issue',
        subtitle: '',
        dateText: '06 May 2026, 04:20 PM',
        status: TicketStatus.resolved,
        icon: Icons.description_outlined,
      ),
      SupportTicket(
        id: 'CMP-2026-000067',
        title: 'Payment failed but amount deducted',
        subtitle: '',
        dateText: '03 May 2026, 09:15 AM',
        status: TicketStatus.closed,
        icon: Icons.payments_outlined,
      ),
    ]);
  }

  void _loadPopularArticles() {
    popularArticles.assignAll([
      PopularArticle(id: 'article_1', title: 'How to create and launch a campaign?'),
      PopularArticle(id: 'article_2', title: 'What are the best practices for creatives?'),
      PopularArticle(id: 'article_3', title: 'How billing and payments work?'),
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
        // TODO: integrate url_launcher to dial channel.statusText
        break;
      case ContactChannelType.emailSupport:
        // TODO: integrate url_launcher to open mail composer to channel.statusText
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
