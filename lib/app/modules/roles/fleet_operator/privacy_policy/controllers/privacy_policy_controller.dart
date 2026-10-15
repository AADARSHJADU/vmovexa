import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class PolicySectionItem {
  final String id;
  final String title;
  final String content;

  PolicySectionItem({required this.id, required this.title, required this.content});
}

class PrivacyPolicyController extends GetxController {
  final RxString pageTitle = 'Fleet Operations Privacy Policy'.obs;
  final RxString pageSubtitle = 'Depot telematics monitoring, shift log privacy, and vehicle tracking data governance'.obs;
  final RxString version = '1.0'.obs;

  final RxList<PolicySectionItem> sections = <PolicySectionItem>[].obs;
  final RxInt expandedIndex = 0.obs; // First section open by default
  final RxString searchQuery = ''.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadDefaults();
    loadPrivacyPolicy();
  }

  void _loadDefaults() {
    sections.assignAll([
      PolicySectionItem(
        id: '1',
        title: '1. Information We Collect',
        content: 'We collect personal identification information (Name, email address, phone number), fleet vehicle telemetry data (GPS coordinates, speed, ignition status, engine diagnostics), and depot operational logs essential for fleet monitoring and dispatch services.',
      ),
      PolicySectionItem(
        id: '2',
        title: '2. Real-time Telemetry & GPS Tracking',
        content: 'Real-time GPS coordinates are captured at scheduled intervals while vehicles are in operation to optimize transit routes, ensure driver and vehicle safety, calculate accurate arrival estimates, and verify proof-of-play metrics for mounted transit screens.',
      ),
      PolicySectionItem(
        id: '3',
        title: '3. Data Security & Storage',
        content: 'All vehicle telemetry and operator credentials are encrypted in transit via TLS 1.3 and at rest using AES-256 standards. System access is restricted to authorized personnel according to role-based access controls.',
      ),
      PolicySectionItem(
        id: '4',
        title: '4. Third-Party Disclosures & Integrations',
        content: 'We do not sell your personal or fleet data. Telemetry logs may be shared with municipal transit authorities, Fastag toll aggregators, or contracted emergency services strictly to fulfill regulatory obligations and emergency dispatch.',
      ),
      PolicySectionItem(
        id: '5',
        title: '5. Data Retention & Access Rights',
        content: 'Operational trip logs and telemetry histories are retained for a minimum of 180 days for audit compliance. Fleet operators maintain the right to inspect, correct, or request deletion of account records subject to statutory retention guidelines.',
      ),
      PolicySectionItem(
        id: '6',
        title: '6. Shift Log Governance & Driver Privacy',
        content: 'Driver biometric attendance and duty logs are processed exclusively for payroll verification and duty allocation, with privacy measures that prevent unauthorized surveillance during non-duty hours.',
      ),
    ]);
  }

  /// Load privacy policy from GET /content/privacy?role=ROLE-FLEET-OPERATOR
  Future<void> loadPrivacyPolicy() async {
    try {
      isLoading.value = true;
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getContentPage('privacy', role: 'ROLE-FLEET-OPERATOR');

        if (res.success && res.data != null) {
          final data = res.data is Map ? res.data as Map : {};

          if (data['title'] != null && data['title'].toString().isNotEmpty) {
            pageTitle.value = data['title'].toString();
          }
          if (data['summary'] != null && data['summary'].toString().isNotEmpty) {
            pageSubtitle.value = data['summary'].toString();
          }
          if (data['version'] != null) {
            version.value = data['version'].toString();
          }

          dynamic rawSections = data['sections'];
          List parsedList = [];
          if (rawSections is List) {
            parsedList = rawSections;
          } else if (rawSections is String && rawSections.trim().startsWith('[')) {
            try {
              parsedList = jsonDecode(rawSections);
            } catch (_) {}
          } else if (rawSections is Map && rawSections['sections'] is List) {
            parsedList = rawSections['sections'] as List;
          }

          if (parsedList.isNotEmpty) {
            final list = <PolicySectionItem>[];
            for (var i = 0; i < parsedList.length; i++) {
              final item = parsedList[i];
              if (item is Map) {
                list.add(PolicySectionItem(
                  id: item['id']?.toString() ?? 'sec-$i',
                  title: item['title']?.toString() ?? item['question']?.toString() ?? 'Section ${i + 1}',
                  content: item['content']?.toString() ?? item['answer']?.toString() ?? item['body']?.toString() ?? '',
                ));
              }
            }
            if (list.isNotEmpty) {
              sections.assignAll(list);
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Error loading privacy policy: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<PolicySectionItem> get filteredSections {
    final query = searchQuery.value.trim().toLowerCase();
    if (query.isEmpty) return sections;
    return sections.where((sec) {
      return sec.title.toLowerCase().contains(query) || sec.content.toLowerCase().contains(query);
    }).toList();
  }

  void toggleIndex(int index) {
    if (expandedIndex.value == index) {
      expandedIndex.value = -1;
    } else {
      expandedIndex.value = index;
    }
  }

  void openQuestionsMail() {
    Get.snackbar(
      'Privacy Governance Support',
      'Opening email to privacy@vmovexa.com...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }
}
