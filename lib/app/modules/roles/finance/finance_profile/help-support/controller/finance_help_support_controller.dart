import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class FinanceFaqItem {
  final String questionKey;
  final String answerKey;
  final String? customQuestion;
  final String? customAnswer;

  FinanceFaqItem({
    required this.questionKey,
    required this.answerKey,
    this.customQuestion,
    this.customAnswer,
  });

  String get question {
    if (customQuestion != null && customQuestion!.trim().isNotEmpty) {
      return customQuestion!;
    }
    final translated = questionKey.tr;
    return (translated.isNotEmpty && translated != questionKey) ? translated : questionKey;
  }

  String get answer {
    if (customAnswer != null && customAnswer!.trim().isNotEmpty) {
      return customAnswer!;
    }
    final translated = answerKey.tr;
    return (translated.isNotEmpty && translated != answerKey) ? translated : answerKey;
  }
}

class FinanceGuideItem {
  final String titleKey;
  final String descKey;
  final String? customTitle;
  final String? customDesc;
  final String icon; // 'Document', 'Clock', 'Shield', 'Car'
  final String? docUrl;
  final String? fileName;

  FinanceGuideItem({
    required this.titleKey,
    required this.descKey,
    this.customTitle,
    this.customDesc,
    required this.icon,
    this.docUrl,
    this.fileName,
  });

  String get title {
    if (customTitle != null && customTitle!.trim().isNotEmpty) {
      return customTitle!;
    }
    final translated = titleKey.tr;
    return (translated.isNotEmpty && translated != titleKey) ? translated : titleKey;
  }

  String get desc {
    if (customDesc != null && customDesc!.trim().isNotEmpty) {
      return customDesc!;
    }
    final translated = descKey.tr;
    return (translated.isNotEmpty && translated != descKey) ? translated : descKey;
  }

  bool get hasPdf => docUrl != null && docUrl!.trim().isNotEmpty;
}

class SupportTicketItem {
  final String id;
  final String subject;
  final String category;
  final String priority;
  final String status; // 'open', 'in_progress', 'resolved', 'closed'
  final String date;

  SupportTicketItem({
    required this.id,
    required this.subject,
    required this.category,
    required this.priority,
    required this.status,
    required this.date,
  });

  factory SupportTicketItem.fromJson(Map<String, dynamic> json) {
    return SupportTicketItem(
      id: json['code']?.toString() ?? json['id']?.toString() ?? 'TCK-001',
      subject: json['subject']?.toString() ?? 'Support Request',
      category: json['category']?.toString() ?? 'General',
      priority: json['priority']?.toString() ?? 'medium',
      status: json['status']?.toString() ?? 'open',
      date: json['created_at']?.toString() ?? json['createdAt']?.toString() ?? 'Recent',
    );
  }
}

class FinanceHelpSupportController extends GetxController {
  // Tabs: 0: FAQs & Guides, 1: My Tickets
  final RxInt activeTabIndex = 0.obs;

  // Search and accordion state for FAQs
  final RxString searchQuery = ''.obs;
  final RxInt expandedFaqIndex = 0.obs;

  // Banner details (fallbacks to roleHelpConstants)
  final RxString bannerBadge = 'finance_help.desk_badge'.obs;
  final RxString bannerTitle = 'finance_help.desk_title'.obs;
  final RxString bannerDesc = 'finance_help.desk_desc'.obs;

  // Guides & FAQs
  final RxList<FinanceGuideItem> guides = <FinanceGuideItem>[].obs;
  final RxList<FinanceFaqItem> allFaqs = <FinanceFaqItem>[].obs;

  // Support Tickets History
  final RxList<SupportTicketItem> myTickets = <SupportTicketItem>[].obs;

  // 4 Filter Tabs for Support Ticket History: All, Open, Resolved, Closed
  final RxString activeHistoryTab = 'All'.obs;
  final RxString historySearchQuery = ''.obs;
  final TextEditingController historySearchController = TextEditingController();

  // Loading flags
  final RxBool isLoading = false.obs;
  final RxBool isSubmittingTicket = false.obs;

  // Ticket Form Controllers (used for quick modal or fallback)
  final subjectController = TextEditingController();
  final descriptionController = TextEditingController();
  final RxString selectedCategory = 'General'.obs;
  final RxString selectedPriority = 'medium'.obs;

  // Admin Panel Exact 7 Categories
  final List<String> categories = const [
    'General',
    'Technical',
    'Fastag & Tolls',
    'Billing & Payouts',
    'Hardware & Telematics',
    'Driver & Fleet Roster',
    'Route & Schedule',
  ];

  // Admin Panel Exact 4 Priorities
  final List<Map<String, String>> priorities = const [
    {'value': 'low', 'labelKey': 'priority_low'},
    {'value': 'medium', 'labelKey': 'priority_medium'},
    {'value': 'high', 'labelKey': 'priority_high'},
    {'value': 'urgent', 'labelKey': 'priority_urgent'},
  ];

  @override
  void onInit() {
    super.onInit();
    _loadDefaultContent();
    loadHelpContent();
    loadMyTickets();
  }

  void _loadDefaultContent() {
    // 4 Finance SOP Guides matching Admin Panel roleHelpConstants.js
    guides.assignAll([
      FinanceGuideItem(
        titleKey: 'finance_help.guide1_title',
        descKey: 'finance_help.guide1_desc',
        icon: 'Document',
      ),
      FinanceGuideItem(
        titleKey: 'finance_help.guide2_title',
        descKey: 'finance_help.guide2_desc',
        icon: 'Clock',
      ),
      FinanceGuideItem(
        titleKey: 'finance_help.guide3_title',
        descKey: 'finance_help.guide3_desc',
        icon: 'Shield',
      ),
      FinanceGuideItem(
        titleKey: 'finance_help.guide4_title',
        descKey: 'finance_help.guide4_desc',
        icon: 'Car',
      ),
    ]);

    // 4 Finance FAQs matching Admin Panel roleHelpConstants.js
    allFaqs.assignAll([
      FinanceFaqItem(
        questionKey: 'finance_help.faq1_q',
        answerKey: 'finance_help.faq1_a',
      ),
      FinanceFaqItem(
        questionKey: 'finance_help.faq2_q',
        answerKey: 'finance_help.faq2_a',
      ),
      FinanceFaqItem(
        questionKey: 'finance_help.faq3_q',
        answerKey: 'finance_help.faq3_a',
      ),
      FinanceFaqItem(
        questionKey: 'finance_help.faq4_q',
        answerKey: 'finance_help.faq4_a',
      ),
    ]);
  }

  Future<void> loadHelpContent() async {
    try {
      isLoading.value = true;
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getContentPage('help', role: 'ROLE-FINANCE-OFFICER');
        if (res.success && res.data != null) {
          final pageData = res.data is Map ? res.data as Map : {};

          dynamic rawSections = pageData['sections'];
          Map sectionsMap = {};
          if (rawSections is Map) {
            sectionsMap = rawSections;
          } else if (rawSections is String && rawSections.trim().startsWith('{')) {
            try {
              sectionsMap = jsonDecode(rawSections);
            } catch (_) {}
          }

          // Parse contact details if dynamically provided
          if (sectionsMap['contact'] is Map) {
            final c = sectionsMap['contact'] as Map;
            if (c['badge'] != null && c['badge'].toString().isNotEmpty) {
              bannerBadge.value = c['badge'].toString();
            }
            if (c['title'] != null && c['title'].toString().isNotEmpty) {
              bannerTitle.value = c['title'].toString();
            }
            if (c['description'] != null && c['description'].toString().isNotEmpty) {
              bannerDesc.value = c['description'].toString();
            }
          }

          // Parse guides if dynamically updated with PDFs
          if (sectionsMap['guides'] is List && (sectionsMap['guides'] as List).isNotEmpty) {
            final list = <FinanceGuideItem>[];
            for (var g in sectionsMap['guides'] as List) {
              if (g is Map) {
                final rawDocUrl = (g['docUrl'] ?? g['pdfUrl'] ?? g['url'])?.toString();
                final resolvedUrl = ApiConstants.resolveFileUrl(rawDocUrl);
                list.add(FinanceGuideItem(
                  titleKey: '',
                  descKey: '',
                  customTitle: g['title']?.toString() ?? '',
                  customDesc: g['desc']?.toString() ?? g['description']?.toString() ?? '',
                  icon: g['icon']?.toString() ?? 'Document',
                  docUrl: resolvedUrl.isNotEmpty ? resolvedUrl : null,
                  fileName: g['fileName']?.toString(),
                ));
              }
            }
            if (list.isNotEmpty) guides.assignAll(list);
          }

          // Parse dynamic FAQs if available
          if (sectionsMap['faqs'] is List && (sectionsMap['faqs'] as List).isNotEmpty) {
            final list = <FinanceFaqItem>[];
            for (var f in sectionsMap['faqs'] as List) {
              if (f is Map) {
                list.add(FinanceFaqItem(
                  questionKey: '',
                  answerKey: '',
                  customQuestion: f['q']?.toString() ?? f['title']?.toString() ?? f['question']?.toString() ?? '',
                  customAnswer: f['a']?.toString() ?? f['content']?.toString() ?? f['answer']?.toString() ?? '',
                ));
              }
            }
            if (list.isNotEmpty) allFaqs.assignAll(list);
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading finance help content: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadMyTickets() async {
    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getMySupportTickets(page: 1, limit: 50);
        if (res.success && res.data != null) {
          final data = res.data;
          List items = [];
          if (data is List) {
            items = data;
          } else if (data is Map && (data['rows'] is List || data['tickets'] is List)) {
            items = (data['rows'] ?? data['tickets']) as List;
          }

          if (items.isNotEmpty) {
            myTickets.assignAll(items.map((e) => SupportTicketItem.fromJson(Map<String, dynamic>.from(e as Map))).toList());
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading finance support tickets: $e');
    }
  }

  // 4 Filter Tabs with live counts matching Admin Panel
  List<Map<String, dynamic>> get historyFilterTabs {
    final total = myTickets.length;
    final openCount = myTickets.where((t) {
      final s = t.status.toLowerCase();
      return s == 'open' || s == 'in_progress';
    }).length;
    final resolvedCount = myTickets.where((t) => t.status.toLowerCase() == 'resolved').length;
    final closedCount = myTickets.where((t) => t.status.toLowerCase() == 'closed').length;

    return [
      {'id': 'All', 'label': 'tab_all'.tr, 'count': total},
      {'id': 'Open', 'label': 'tab_open'.tr, 'count': openCount},
      {'id': 'Resolved', 'label': 'tab_resolved'.tr, 'count': resolvedCount},
      {'id': 'Closed', 'label': 'tab_closed'.tr, 'count': closedCount},
    ];
  }

  List<SupportTicketItem> get filteredHistoryTickets {
    return myTickets.where((t) {
      final q = historySearchQuery.value.trim().toLowerCase();
      final matchesSearch = q.isEmpty ||
          t.id.toLowerCase().contains(q) ||
          t.subject.toLowerCase().contains(q) ||
          t.category.toLowerCase().contains(q);

      final s = t.status.toLowerCase();
      final tab = activeHistoryTab.value;
      final matchesTab = tab == 'All' ||
          (tab == 'Open' && (s == 'open' || s == 'in_progress')) ||
          (tab == 'Resolved' && s == 'resolved') ||
          (tab == 'Closed' && s == 'closed');

      return matchesSearch && matchesTab;
    }).toList();
  }

  void setHistoryTab(String tab) {
    activeHistoryTab.value = tab;
  }

  void setHistorySearch(String val) {
    historySearchQuery.value = val;
  }

  void clearHistorySearch() {
    historySearchController.clear();
    historySearchQuery.value = '';
  }

  void goToRaiseTicket() {
    Get.toNamed(Routes.FINANCE_RAISE_TICKET);
  }

  String getCategoryLabel(String cat) {
    switch (cat) {
      case 'General':
        return 'category_general'.tr;
      case 'Technical':
        return 'category_technical'.tr;
      case 'Fastag & Tolls':
        return 'category_fastag_tolls'.tr;
      case 'Billing & Payouts':
        return 'category_billing_payouts'.tr;
      case 'Hardware & Telematics':
        return 'category_hardware_telematics'.tr;
      case 'Driver & Fleet Roster':
        return 'category_driver_roster'.tr;
      case 'Route & Schedule':
        return 'category_route_schedule'.tr;
      default:
        return cat;
    }
  }

  List<FinanceFaqItem> get filteredFaqs {
    final q = searchQuery.value.trim().toLowerCase();
    if (q.isEmpty) return allFaqs;
    return allFaqs.where((f) {
      return f.question.toLowerCase().contains(q) || f.answer.toLowerCase().contains(q);
    }).toList();
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
  }

  void toggleFaq(int index) {
    expandedFaqIndex.value = expandedFaqIndex.value == index ? -1 : index;
  }

  Future<void> openGuide(FinanceGuideItem guide) async {
    final url = guide.docUrl;
    if (url != null && url.trim().isNotEmpty) {
      try {
        final uri = Uri.parse(url.trim());
        final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (!launched) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (e) {
        Get.snackbar(
          'error'.tr,
          '${'could_not_open_guide'.tr}: $e',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } else {
      Get.snackbar(
        guide.title,
        'finance_help.no_pdf_toast'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF6366F1),
        colorText: Colors.white,
      );
    }
  }

  Future<void> onRefresh() async {
    await loadHelpContent();
    await loadMyTickets();
  }

  void onBackPressed() => Get.back();

  @override
  void onClose() {
    subjectController.dispose();
    descriptionController.dispose();
    historySearchController.dispose();
    super.onClose();
  }
}
