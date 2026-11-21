import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

class GovHelpFaqItem {
  final String q;
  final String a;

  GovHelpFaqItem({required this.q, required this.a});
}

class GovHelpGuideItem {
  final String title;
  final String desc;
  final IconData icon;
  final String? docUrl;
  final String? fileName;

  GovHelpGuideItem({
    required this.title,
    required this.desc,
    required this.icon,
    this.docUrl,
    this.fileName,
  });

  bool get hasPdf => docUrl != null && docUrl!.trim().isNotEmpty;
}

class GovVideoTutorialItem {
  final String id;
  final String title;
  final String duration;
  final String category;
  final String? url;

  GovVideoTutorialItem({
    required this.id,
    required this.title,
    required this.duration,
    required this.category,
    this.url,
  });
}

class GovHelpSupportController extends GetxController {
  final GovernmentService _service = GovernmentService.to;

  // Header and Contact Details
  final RxString pageTitle = 'gov_help.title'.tr.obs;
  final RxString pageSummary = 'gov_help.summary'.tr.obs;
  final RxString deskBadge = 'gov_help.desk_badge'.tr.obs;
  final RxString contactPhone = '1800-TRANSIT-GOV'.obs;
  final RxString contactEmail = 'civic-desk@vmovexa.com'.obs;
  final RxString deskDesc = 'gov_help.desk_desc'.tr.obs;

  // Data Collections
  final RxList<GovHelpGuideItem> guides = <GovHelpGuideItem>[].obs;
  final RxList<GovHelpFaqItem> allFaqs = <GovHelpFaqItem>[].obs;
  final RxList<GovHelpFaqItem> filteredFaqs = <GovHelpFaqItem>[].obs;
  final RxList<GovVideoTutorialItem> videoTutorials = <GovVideoTutorialItem>[].obs;

  final RxInt expandedFaqIndex = (-1).obs;
  final RxString searchQuery = ''.obs;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadDefaults();
    loadHelpContent();
  }

  void _loadDefaults() {
    pageTitle.value = 'gov_help.title'.tr;
    pageSummary.value = 'gov_help.summary'.tr;
    deskBadge.value = 'gov_help.desk_badge'.tr;
    deskDesc.value = 'gov_help.desk_desc'.tr;

    guides.assignAll([
      GovHelpGuideItem(
        title: 'gov_help.guide1_title'.tr,
        desc: 'gov_help.guide1_desc'.tr,
        icon: Icons.article_outlined,
        docUrl: '/uploads/sops/gov-civic-broadcast-sop.pdf',
        fileName: 'gov-civic-broadcast-sop.pdf',
      ),
      GovHelpGuideItem(
        title: 'gov_help.guide2_title'.tr,
        desc: 'gov_help.guide2_desc'.tr,
        icon: Icons.shield_outlined,
        docUrl: '/uploads/sops/gov-disaster-sos-protocol.pdf',
        fileName: 'gov-disaster-sos-protocol.pdf',
      ),
      GovHelpGuideItem(
        title: 'gov_help.guide3_title'.tr,
        desc: 'gov_help.guide3_desc'.tr,
        icon: Icons.directions_bus_outlined,
        docUrl: '/uploads/sops/gov-commuter-density-heatmaps.pdf',
        fileName: 'gov-commuter-density-heatmaps.pdf',
      ),
      GovHelpGuideItem(
        title: 'gov_help.guide4_title'.tr,
        desc: 'gov_help.guide4_desc'.tr,
        icon: Icons.access_time_outlined,
        docUrl: '/uploads/sops/gov-statutory-audit-logs.pdf',
        fileName: 'gov-statutory-audit-logs.pdf',
      ),
    ]);

    videoTutorials.assignAll([
      GovVideoTutorialItem(
        id: '1',
        title: 'gov_help.guide1_title'.tr,
        duration: '4:15',
        category: 'Emergency Broadcast',
        url: 'https://vmovexa.com/academy/gov-broadcast-sop',
      ),
      GovVideoTutorialItem(
        id: '2',
        title: 'gov_help.guide2_title'.tr,
        duration: '5:30',
        category: 'Disaster Protocol',
        url: 'https://vmovexa.com/academy/gov-disaster-sos',
      ),
      GovVideoTutorialItem(
        id: '3',
        title: 'gov_help.guide3_title'.tr,
        duration: '3:50',
        category: 'Transit Analytics',
        url: 'https://vmovexa.com/academy/gov-density-heatmaps',
      ),
      GovVideoTutorialItem(
        id: '4',
        title: 'gov_help.guide4_title'.tr,
        duration: '4:45',
        category: 'Compliance Audit',
        url: 'https://vmovexa.com/academy/gov-statutory-audit',
      ),
    ]);

    final defaultFaqs = [
      GovHelpFaqItem(
        q: 'gov_help.faq1_q'.tr,
        a: 'gov_help.faq1_a'.tr,
      ),
      GovHelpFaqItem(
        q: 'gov_help.faq2_q'.tr,
        a: 'gov_help.faq2_a'.tr,
      ),
      GovHelpFaqItem(
        q: 'gov_help.faq3_q'.tr,
        a: 'gov_help.faq3_a'.tr,
      ),
      GovHelpFaqItem(
        q: 'gov_help.faq4_q'.tr,
        a: 'gov_help.faq4_a'.tr,
      ),
    ];

    allFaqs.assignAll(defaultFaqs);
    filteredFaqs.assignAll(defaultFaqs);
  }

  /// Fetch dynamic content from GET /content/help?role=ROLE-GOVT-AGENCY
  Future<void> loadHelpContent() async {
    try {
      isLoading.value = true;
      final res = await _service.getContentPage('help', role: 'ROLE-GOVT-AGENCY');

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
          final parsedGuides = <GovHelpGuideItem>[];
          for (var item in sectionsMap['guides'] as List) {
            if (item is Map) {
              final rawDocUrl = (item['docUrl'] ?? item['pdfUrl'] ?? item['url'])?.toString();
              final resolvedUrl = ApiConstants.resolveFileUrl(rawDocUrl);
              final iconStr = item['icon']?.toString() ?? '';
              IconData iconData = Icons.article_outlined;
              if (iconStr == 'Document' || iconStr == 'Rocket') {
                iconData = Icons.article_outlined;
              } else if (iconStr == 'Shield' || iconStr == 'Video') {
                iconData = Icons.shield_outlined;
              } else if (iconStr == 'Car' || iconStr == 'Qr') {
                iconData = Icons.directions_bus_outlined;
              } else if (iconStr == 'Clock' || iconStr == 'Receipt') {
                iconData = Icons.access_time_outlined;
              }

              parsedGuides.add(GovHelpGuideItem(
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
              return GovHelpFaqItem(
                q: item['q']?.toString() ?? item['question']?.toString() ?? '',
                a: item['a']?.toString() ?? item['answer']?.toString() ?? '',
              );
            }
            return GovHelpFaqItem(q: item.toString(), a: '');
          }).where((f) => f.q.isNotEmpty).toList();

          if (parsed.isNotEmpty) {
            allFaqs.assignAll(parsed);
            filterFaqs(searchQuery.value);
          }
        }
      }
    } catch (e) {
      debugPrint('[GovHelpSupport] Dynamic content error: $e');
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

  Future<void> openGuide(GovHelpGuideItem guide) async {
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
        'gov_help.no_pdf_attached'.tr,
        guide.title,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.orangeAccent.withValues(alpha: 0.9),
        colorText: Colors.white,
      );
    }
  }

  Future<void> openVideoTutorial(GovVideoTutorialItem video) async {
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

  Future<void> callCivicDesk() async {
    final cleanPhone = contactPhone.value.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleanPhone');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        cleanPhone,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  Future<void> emailCivicDesk() async {
    final uri = Uri.parse('mailto:${contactEmail.value}?subject=Government%20Authority%20Support%20Inquiry');
    try {
      await launchUrl(uri);
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        contactEmail.value,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }
}
