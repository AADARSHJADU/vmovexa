import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class HelpFaqItem {
  final String question;
  final String answer;

  HelpFaqItem({required this.question, required this.answer});
}

class HelpGuideItem {
  final String title;
  final String desc;
  final String icon;

  HelpGuideItem({required this.title, required this.desc, required this.icon});
}

class HelpSupportController extends GetxController {
  final RxString pageTitle = 'Fleet Operations Help & Documentation'.obs;
  final RxString pageSummary = 'Master vehicle telemetry tracking, IoT GPS device installation, and operational fleet analytics.'.obs;
  final RxString supportEmail = 'support@vmovexa.com'.obs;
  final RxString supportPhone = '+91 98765 43210'.obs;
  final RxString supportHours = '24/7 Priority Support'.obs;
  final RxString bannerTitle = "We're Here to Help!".obs;
  final RxString bannerDescription = 'Get dedicated assistance for IoT GPS binding, vehicle telemetry issues, and dispatch inquiries.'.obs;

  final RxList<HelpFaqItem> faqs = <HelpFaqItem>[].obs;
  final RxList<HelpGuideItem> guides = <HelpGuideItem>[].obs;
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
    guides.assignAll([
      HelpGuideItem(title: 'Fleet SOP Manual', desc: 'Depot dispatch & driver shifts', icon: 'Document'),
      HelpGuideItem(title: 'IoT GPS Pairing Guide', desc: 'CAN-bus & OBD-II telemetry binding', icon: 'Car'),
      HelpGuideItem(title: 'Emergency Protocols', desc: 'Accident and breakdown management', icon: 'Shield'),
      HelpGuideItem(title: 'Ad Screen Uptime SOP', desc: 'HDMI player & cache troubleshooting', icon: 'Clock'),
    ]);

    faqs.assignAll([
      HelpFaqItem(
        question: 'How do I bind a new IoT GPS tracker to a vehicle?',
        answer: 'Go to Fleet Vehicles, select "Bind Device", scan or enter the 15-digit IMEI number, and trigger an ignition test to verify live telemetry handshake.',
      ),
      HelpFaqItem(
        question: 'What triggers automated speed violation alerts?',
        answer: 'Vehicles exceeding 60 km/h in urban zones or 80 km/h on transit corridors for more than 15 continuous seconds trigger instant telemetry alerts to the fleet supervisor.',
      ),
      HelpFaqItem(
        question: 'How are ad playback impressions verified?',
        answer: 'The RK3588 display matrix registers GPS-tagged proof-of-play timestamps every time a campaign slot completes, syncing records via MQTT to the analytics engine.',
      ),
      HelpFaqItem(
        question: 'How do I reassign an active vehicle to a different depot?',
        answer: 'Open Vehicle Profile > Actions > Transfer Depot, choose the target depot, and confirm handover with both depot dispatchers.',
      ),
    ]);
  }

  /// Fetch dynamic content from GET /content/help?role=ROLE-FLEET-OPERATOR
  Future<void> loadHelpContent() async {
    try {
      isLoading.value = true;
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getContentPage('help', role: 'ROLE-FLEET-OPERATOR');

        if (res.success && res.data != null) {
          final pageData = res.data is Map ? res.data as Map : {};

          if (pageData['title'] != null && pageData['title'].toString().isNotEmpty) {
            pageTitle.value = pageData['title'].toString();
          }
          if (pageData['summary'] != null && pageData['summary'].toString().isNotEmpty) {
            pageSummary.value = pageData['summary'].toString();
          }

          dynamic rawSections = pageData['sections'];
          Map sectionsMap = {};
          if (rawSections is Map) {
            sectionsMap = rawSections;
          } else if (rawSections is String && rawSections.trim().startsWith('{')) {
            try {
              sectionsMap = jsonDecode(rawSections);
            } catch (_) {}
          }

          // Parse contact details
          if (sectionsMap['contact'] is Map) {
            final c = sectionsMap['contact'] as Map;
            if (c['title'] != null) bannerTitle.value = c['title'].toString();
            if (c['description'] != null) bannerDescription.value = c['description'].toString();
            if (c['badge'] != null) supportHours.value = c['badge'].toString();
            if (c['email'] != null) supportEmail.value = c['email'].toString();
            if (c['phone'] != null) supportPhone.value = c['phone'].toString();
          }

          // Parse guides
          if (sectionsMap['guides'] is List && (sectionsMap['guides'] as List).isNotEmpty) {
            final list = <HelpGuideItem>[];
            for (var g in sectionsMap['guides'] as List) {
              if (g is Map) {
                list.add(HelpGuideItem(
                  title: g['title']?.toString() ?? '',
                  desc: g['desc']?.toString() ?? g['description']?.toString() ?? '',
                  icon: g['icon']?.toString() ?? 'Document',
                ));
              }
            }
            if (list.isNotEmpty) guides.assignAll(list);
          }

          // Parse FAQs
          if (sectionsMap['faqs'] is List && (sectionsMap['faqs'] as List).isNotEmpty) {
            final list = <HelpFaqItem>[];
            for (var f in sectionsMap['faqs'] as List) {
              if (f is Map) {
                list.add(HelpFaqItem(
                  question: f['q']?.toString() ?? f['title']?.toString() ?? f['question']?.toString() ?? '',
                  answer: f['a']?.toString() ?? f['content']?.toString() ?? f['answer']?.toString() ?? '',
                ));
              }
            }
            if (list.isNotEmpty) faqs.assignAll(list);
          } else if (rawSections is List && rawSections.isNotEmpty) {
            // In case sections is array of items
            final list = <HelpFaqItem>[];
            for (var item in rawSections) {
              if (item is Map) {
                list.add(HelpFaqItem(
                  question: item['title']?.toString() ?? item['q']?.toString() ?? '',
                  answer: item['content']?.toString() ?? item['a']?.toString() ?? '',
                ));
              }
            }
            if (list.isNotEmpty) faqs.assignAll(list);
          }
        }
      }
    } catch (e) {
      debugPrint('Error fetching help content: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<HelpFaqItem> get filteredFaqs {
    final query = searchQuery.value.trim().toLowerCase();
    if (query.isEmpty) return faqs;
    return faqs.where((f) {
      return f.question.toLowerCase().contains(query) || f.answer.toLowerCase().contains(query);
    }).toList();
  }

  void toggleFaq(int index) {
    if (expandedFaqIndex.value == index) {
      expandedFaqIndex.value = -1;
    } else {
      expandedFaqIndex.value = index;
    }
  }

  void goToSupportHistory() {
    Get.toNamed(Routes.SUPPORT_HISTORY);
  }

  void openEmail() {
    Get.snackbar(
      'Email Support Desk',
      'Opening email to ${supportEmail.value}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }

  void openCall() {
    Get.snackbar(
      '24/7 Hotline Support',
      'Dialing priority helpline ${supportPhone.value}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }

  void openWhatsapp() {
    Get.snackbar(
      'WhatsApp Support',
      'Connecting to WhatsApp support channel ${supportPhone.value}...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }

  void openGuide(HelpGuideItem guide) {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      guide.title,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                guide.desc,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: const Text(
                  'Standard Operating Procedure is active and enforced across depot dispatch, OBD-II telemetry handshakes, and maintenance workflows.',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Close Guide', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
