import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
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
  final String? docUrl;
  final String? fileName;

  AdvertiserHelpGuideItem({
    required this.title,
    required this.desc,
    required this.icon,
    this.docUrl,
    this.fileName,
  });

  bool get hasPdf => docUrl != null && docUrl!.trim().isNotEmpty;
}

class AdvertiserVideoTutorialItem {
  final String id;
  final String title;
  final String duration;
  final String category;
  final String? url;

  AdvertiserVideoTutorialItem({
    required this.id,
    required this.title,
    required this.duration,
    required this.category,
    this.url,
  });
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
  final RxList<AdvertiserVideoTutorialItem> videoTutorials = <AdvertiserVideoTutorialItem>[].obs;

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
    deskBadge.value = 'advertiser_growth_desk'.tr;
    deskDesc.value = 'four_hour_sla_desk_desc'.tr;

    guides.assignAll([
      AdvertiserHelpGuideItem(
        title: 'campaign_setup_guide_title'.tr,
        desc: 'campaign_setup_guide_desc'.tr,
        icon: Icons.rocket_launch_outlined,
        docUrl: '/uploads/sops/advertiser-campaign-setup.pdf',
        fileName: 'advertiser-campaign-setup.pdf',
      ),
      AdvertiserHelpGuideItem(
        title: 'creative_specs_guide_title'.tr,
        desc: 'creative_specs_guide_desc'.tr,
        icon: Icons.smart_display_outlined,
        docUrl: '/uploads/sops/advertiser-creative-specs.pdf',
        fileName: 'advertiser-creative-specs.pdf',
      ),
      AdvertiserHelpGuideItem(
        title: 'smart_qr_guide_title'.tr,
        desc: 'smart_qr_guide_desc'.tr,
        icon: Icons.qr_code_2_rounded,
        docUrl: '/uploads/sops/advertiser-smart-qr.pdf',
        fileName: 'advertiser-smart-qr.pdf',
      ),
      AdvertiserHelpGuideItem(
        title: 'billing_invoices_guide_title'.tr,
        desc: 'billing_invoices_guide_desc'.tr,
        icon: Icons.receipt_long_outlined,
        docUrl: '/uploads/sops/advertiser-billing-invoices.pdf',
        fileName: 'advertiser-billing-invoices.pdf',
      ),
    ]);

    videoTutorials.assignAll([
      AdvertiserVideoTutorialItem(
        id: '1',
        title: 'tutorial_campaign_setup'.tr,
        duration: '3:45',
        category: 'campaigns_tab'.tr,
        url: 'https://vmovexa.com/academy/campaign-setup',
      ),
      AdvertiserVideoTutorialItem(
        id: '2',
        title: 'tutorial_creative_specs'.tr,
        duration: '4:20',
        category: 'creatives_tab'.tr,
        url: 'https://vmovexa.com/academy/creative-specs',
      ),
      AdvertiserVideoTutorialItem(
        id: '3',
        title: 'tutorial_qr_telemetry'.tr,
        duration: '2:50',
        category: 'analytics_tab'.tr,
        url: 'https://vmovexa.com/academy/qr-telemetry',
      ),
      AdvertiserVideoTutorialItem(
        id: '4',
        title: 'tutorial_billing_invoices'.tr,
        duration: '3:10',
        category: 'billing_tab'.tr,
        url: 'https://vmovexa.com/academy/billing-invoices',
      ),
    ]);

    final defaultFaqs = [
      AdvertiserHelpFaqItem(
        q: 'faq_create_campaign_q'.tr,
        a: 'faq_create_campaign_a'.tr,
      ),
      AdvertiserHelpFaqItem(
        q: 'faq_creative_specs_q'.tr,
        a: 'faq_creative_specs_a'.tr,
      ),
      AdvertiserHelpFaqItem(
        q: 'faq_smart_qr_q'.tr,
        a: 'faq_smart_qr_a'.tr,
      ),
      AdvertiserHelpFaqItem(
        q: 'faq_billing_gst_q'.tr,
        a: 'faq_billing_gst_a'.tr,
      ),
    ];

    allFaqs.assignAll(defaultFaqs);
    filteredFaqs.assignAll(defaultFaqs);
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
          if (c['badge'] != null && c['badge'].toString().isNotEmpty) deskBadge.value = c['badge'].toString();
          if (c['description'] != null && c['description'].toString().isNotEmpty) deskDesc.value = c['description'].toString();
          if (c['phone'] != null && c['phone'].toString().isNotEmpty) contactPhone.value = c['phone'].toString();
          if (c['email'] != null && c['email'].toString().isNotEmpty) contactEmail.value = c['email'].toString();
        }

        if (sectionsMap['guides'] is List && (sectionsMap['guides'] as List).isNotEmpty) {
          final parsedGuides = <AdvertiserHelpGuideItem>[];
          for (var item in sectionsMap['guides'] as List) {
            if (item is Map) {
              final rawDocUrl = (item['docUrl'] ?? item['pdfUrl'] ?? item['url'])?.toString();
              final resolvedUrl = ApiConstants.resolveFileUrl(rawDocUrl);
              final iconStr = item['icon']?.toString() ?? '';
              IconData iconData = Icons.article_outlined;
              if (iconStr == 'Document' || iconStr == 'Rocket') {
                iconData = Icons.rocket_launch_outlined;
              } else if (iconStr == 'Shield' || iconStr == 'Video') {
                iconData = Icons.smart_display_outlined;
              } else if (iconStr == 'Car' || iconStr == 'Qr') {
                iconData = Icons.qr_code_2_rounded;
              } else if (iconStr == 'Clock' || iconStr == 'Receipt') {
                iconData = Icons.receipt_long_outlined;
              }

              parsedGuides.add(AdvertiserHelpGuideItem(
                title: item['title']?.toString() ?? '',
                desc: item['desc']?.toString() ?? item['description']?.toString() ?? '',
                icon: iconData,
                docUrl: resolvedUrl.isNotEmpty ? resolvedUrl : null,
                fileName: item['fileName']?.toString(),
              ));
            }
          }
          if (parsedGuides.isNotEmpty) {
            guides.assignAll(parsedGuides);
          }
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

  Future<void> openGuide(AdvertiserHelpGuideItem guide) async {
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
          'could_not_open_pdf_err'.trParams({'error': e.toString()}),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent.withValues(alpha: 0.85),
          colorText: Colors.white,
        );
      }
    } else {
      Get.snackbar(
        'no_pdf_attached'.tr,
        'no_pdf_attached_desc'.trParams({'title': guide.title}),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent.withValues(alpha: 0.9),
        colorText: Colors.white,
      );
    }
  }

  Future<void> openVideoTutorial(AdvertiserVideoTutorialItem video) async {
    if (video.url != null && video.url!.trim().isNotEmpty) {
      try {
        final uri = Uri.parse(video.url!.trim());
        final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (!launched) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (_) {
        Get.snackbar(
          video.title,
          '${video.category} • ${video.duration}',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF2563EB),
          colorText: Colors.white,
        );
      }
    } else {
      Get.snackbar(
        video.title,
        '${video.category} • ${video.duration}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF2563EB),
        colorText: Colors.white,
      );
    }
  }

  Future<void> callGrowthDesk() async {
    final cleanPhone = contactPhone.value.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar(
        'dialer_error_title'.tr,
        'dialer_error_msg'.trParams({'phone': cleanPhone}),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  Future<void> emailGrowthDesk() async {
    final uri = Uri.parse('mailto:${contactEmail.value}?subject=Advertiser%20Support%20Inquiry');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar(
        'email_error_title'.tr,
        'email_error_msg'.trParams({'email': contactEmail.value}),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
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
          'ticket_created_title'.tr,
          'support_ticket_raised_msg'.tr,
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
          'ticket_failed_title'.tr,
          res.message ?? 'ticket_failed_msg'.tr,
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
        'error'.tr,
        'server_connection_error_msg'.trParams({'error': e.toString()}),
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
