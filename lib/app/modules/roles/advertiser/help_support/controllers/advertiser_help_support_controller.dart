import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../data/services/advertiser_service.dart';

class AdvertiserHelpFaqItem {
  final String q;
  final String a;

  AdvertiserHelpFaqItem({required this.q, required this.a});
}

class AdvertiserHelpGuideItem {
  final String title;
  final String desc;
  final IconData icon;

  AdvertiserHelpGuideItem({required this.title, required this.desc, required this.icon});
}

class AdvertiserHelpSupportController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;

  // Header and Contact Details
  final RxString pageTitle = 'Advertiser Help & Documentation'.obs;
  final RxString pageSummary = 'Find answers to campaign creation, target route selection, creative specs, and live ROI telemetry.'.obs;
  final RxString deskBadge = 'Advertiser Growth Desk'.obs;
  final RxString contactPhone = '+91 98765 43210'.obs;
  final RxString contactEmail = 'support@vmovexa.com'.obs;
  final RxString deskDesc = 'Dedicated campaign strategist and creative verification desk. 4-hour SLA response.'.obs;

  // Data Collections
  final RxList<AdvertiserHelpGuideItem> guides = <AdvertiserHelpGuideItem>[].obs;
  final RxList<AdvertiserHelpFaqItem> allFaqs = <AdvertiserHelpFaqItem>[].obs;
  final RxList<AdvertiserHelpFaqItem> filteredFaqs = <AdvertiserHelpFaqItem>[].obs;

  final RxInt expandedFaqIndex = (-1).obs;
  final RxString searchQuery = ''.obs;

  final RxBool isLoading = false.obs;

  // Ticket Modal States
  final RxBool isSubmittingTicket = false.obs;
  final RxBool isLoadingTickets = false.obs;
  final RxList<Map<String, dynamic>> myTickets = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadDefaults();
    loadHelpContent();
  }

  void _loadDefaults() {
    guides.assignAll([
      AdvertiserHelpGuideItem(
        title: 'Campaign Setup Guide',
        desc: '6-step launch walkthrough from booking to broadcast',
        icon: Icons.rocket_launch_outlined,
      ),
      AdvertiserHelpGuideItem(
        title: 'Creative Specs (16:9)',
        desc: '1080p MP4, JPG, HTML5 specs & upload constraints',
        icon: Icons.smart_display_outlined,
      ),
      AdvertiserHelpGuideItem(
        title: 'Smart QR Attribution',
        desc: 'Dynamic commuter lead tracking & scan metrics',
        icon: Icons.qr_code_2_rounded,
      ),
      AdvertiserHelpGuideItem(
        title: 'Billing & GST Invoices',
        desc: 'Tax invoice downloads & wallet auto-reload rules',
        icon: Icons.receipt_long_outlined,
      ),
    ]);

    final defaultList = [
      AdvertiserHelpFaqItem(
        q: 'How to create and launch a transit ad campaign?',
        a: 'Navigate to Campaigns and tap "Create Campaign". Follow the step-by-step setup to input basic info, upload your 16:9 creative asset, select target transit fleets, configure schedule and budget, and submit for verification.',
      ),
      AdvertiserHelpFaqItem(
        q: 'What are the recommended creative specifications?',
        a: 'We support MP4 (H.264), JPG, PNG, and HTML5 zip packages. Standard resolution is 1920×1080 (16:9 aspect ratio), maximum duration is 30 seconds for video ads, and file size must be under 50 MB.',
      ),
      AdvertiserHelpFaqItem(
        q: 'How does Smart QR code lead attribution work?',
        a: 'Every campaign generates a trackable QR identity. When passengers scan the QR code displayed on screen, the system records time, location, vehicle ID, and redirects them to your landing page.',
      ),
      AdvertiserHelpFaqItem(
        q: 'How do billing, GST invoices, and deductions work?',
        a: 'Campaigns are charged on a daily or total budget model. GST (18%) is calculated on ad spend. Invoices with tax credits are automatically generated upon verification approval.',
      ),
    ];

    allFaqs.assignAll(defaultList);
    filteredFaqs.assignAll(defaultList);
  }

  /// Fetch dynamic content from GET /content/help?role=ROLE-ADVERTISER
  Future<void> loadHelpContent() async {
    try {
      isLoading.value = true;
      final res = await _service.getContentPage('help', role: 'ROLE-ADVERTISER');

      if (res.success && res.data != null) {
        final data = res.data is Map ? res.data as Map : {};
        if (data['title'] != null && data['title'].toString().isNotEmpty) {
          pageTitle.value = data['title'].toString();
        }
        if (data['summary'] != null && data['summary'].toString().isNotEmpty) {
          pageSummary.value = data['summary'].toString();
        }

        dynamic rawSections = data['sections'];
        Map sectionsMap = {};
        if (rawSections is Map) {
          sectionsMap = rawSections;
        } else if (rawSections is String && rawSections.trim().startsWith('{')) {
          try {
            sectionsMap = jsonDecode(rawSections);
          } catch (_) {}
        }

        if (sectionsMap['contact'] is Map) {
          final c = sectionsMap['contact'] as Map;
          if (c['badge'] != null) deskBadge.value = c['badge'].toString();
          if (c['description'] != null) deskDesc.value = c['description'].toString();
        }

        if (sectionsMap['faqs'] is List && (sectionsMap['faqs'] as List).isNotEmpty) {
          final parsed = (sectionsMap['faqs'] as List).map((item) {
            if (item is Map) {
              return AdvertiserHelpFaqItem(
                q: item['q']?.toString() ?? item['question']?.toString() ?? '',
                a: item['a']?.toString() ?? item['answer']?.toString() ?? '',
              );
            }
            return AdvertiserHelpFaqItem(q: item.toString(), a: '');
          }).where((f) => f.q.isNotEmpty).toList();

          if (parsed.isNotEmpty) {
            allFaqs.assignAll(parsed);
            filterFaqs(searchQuery.value);
          }
        }
      }
    } catch (e) {
      debugPrint('[HelpSupport] Dynamic content error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void filterFaqs(String query) {
    searchQuery.value = query;
    if (query.trim().isEmpty) {
      filteredFaqs.assignAll(allFaqs);
      return;
    }
    final q = query.toLowerCase().trim();
    filteredFaqs.assignAll(
      allFaqs.where((f) => f.q.toLowerCase().contains(q) || f.a.toLowerCase().contains(q)).toList(),
    );
  }

  void toggleFaq(int index) {
    if (expandedFaqIndex.value == index) {
      expandedFaqIndex.value = -1;
    } else {
      expandedFaqIndex.value = index;
    }
  }

  Future<void> callGrowthDesk() async {
    final cleanPhone = contactPhone.value.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar('Dialer Error', 'Could not open phone dialer for $cleanPhone', backgroundColor: Colors.redAccent, colorText: Colors.white);
    }
  }

  Future<void> emailGrowthDesk() async {
    final uri = Uri.parse('mailto:${contactEmail.value}?subject=Advertiser%20Support%20Inquiry');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar('Email Error', 'Could not open mail client for ${contactEmail.value}', backgroundColor: Colors.redAccent, colorText: Colors.white);
    }
  }

  /// Create support ticket via POST /support/tickets
  Future<bool> createSupportTicket({
    required String subject,
    required String category,
    required String priority,
    required String description,
  }) async {
    try {
      isSubmittingTicket.value = true;
      final res = await _service.createTicket({
        'subject': subject.trim(),
        'category': category.trim(),
        'priority': priority.toLowerCase(),
        'description': description.trim(),
      });

      if (res.success) {
        Get.snackbar(
          'Ticket Created',
          'Support ticket raised successfully. Our Growth Desk will respond within 4 hours.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
        return true;
      } else {
        Get.snackbar(
          'Ticket Failed',
          res.message ?? 'Could not create ticket. Please try again.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 10,
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Server connection error: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 10,
      );
      return false;
    } finally {
      isSubmittingTicket.value = false;
    }
  }

  /// Fetch user tickets from GET /me/support/tickets
  Future<void> loadMyTickets() async {
    try {
      isLoadingTickets.value = true;
      final res = await _service.getMyTickets();
      if (res.success && res.data != null) {
        final d = res.data;
        if (d is List) {
          myTickets.assignAll(d.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList());
        } else if (d is Map && (d['rows'] is List || d['items'] is List || d['data'] is List)) {
          final list = (d['rows'] ?? d['items'] ?? d['data']) as List;
          myTickets.assignAll(list.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList());
        }
      }
    } catch (e) {
      debugPrint('[HelpSupport] Load tickets error: $e');
    } finally {
      isLoadingTickets.value = false;
    }
  }
}

