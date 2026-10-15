import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class TermsSectionItem {
  final String id;
  final String title;
  final String content;

  TermsSectionItem({required this.id, required this.title, required this.content});
}

class TermsConditionsController extends GetxController {
  final RxString pageTitle = 'Fleet Manager Terms & Operational Rules'.obs;
  final RxString pageSubtitle = 'Depot dispatch standards, vehicle roadworthiness inspection SLAs, and route punctuality governance'.obs;
  final RxString version = '1.0'.obs;

  final RxList<TermsSectionItem> sections = <TermsSectionItem>[].obs;
  final RxInt expandedIndex = 0.obs; // First clause open by default
  final RxString searchQuery = ''.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadDefaults();
    loadTermsContent();
  }

  void _loadDefaults() {
    sections.assignAll([
      TermsSectionItem(
        id: '1',
        title: '1. Fleet Operator Eligibility & Depot Authorization',
        content: 'By operating a transit fleet on the VMOVEXA platform, the fleet operator certifies possession of valid municipal stage carriage permits, comprehensive commercial vehicle insurance, and statutory vehicle fitness certifications.',
      ),
      TermsSectionItem(
        id: '2',
        title: '2. IoT Telemetry Device Care & Binding',
        content: 'Operators are responsible for maintaining uninterrupted power delivery to onboard IoT GPS trackers and RK3588 transit ad display matrices. Intentional tampering, manual power detachment, or antenna jamming constitutes a material breach.',
      ),
      TermsSectionItem(
        id: '3',
        title: '3. Route Adherence & Punctuality SLAs',
        content: 'Assigned vehicles must adhere strictly to verified transit stops and published timetable schedules. Unscheduled route diversions exceeding 15 minutes must be recorded with valid transit justifications.',
      ),
      TermsSectionItem(
        id: '4',
        title: '4. Driver Staff Vetting & Rostering',
        content: 'Operators must ensure all rostered drivers hold valid commercial driver licenses (HTV/PSV), undergo annual medical fitness assessments, and carry clean criminal background checks.',
      ),
      TermsSectionItem(
        id: '5',
        title: '5. Maintenance & Breakdown Protocols',
        content: 'In the event of road accidents or mechanical breakdowns, the fleet manager must log an incident in the operator console within 30 minutes and deploy an authorized replacement vehicle.',
      ),
      TermsSectionItem(
        id: '6',
        title: '6. Payment Reconciliation & Revenue Sharing',
        content: 'Transit ad revenue sharing and platform subscription fees are calculated on the 1st of each calendar month. Settlement disputes must be filed within 14 business days of invoice issuance.',
      ),
    ]);
  }

  /// Load terms content from GET /content/terms?role=ROLE-FLEET-OPERATOR
  Future<void> loadTermsContent() async {
    try {
      isLoading.value = true;
      if (Get.isRegistered<FleetService>()) {
        final res = await FleetService.to.getContentPage('terms', role: 'ROLE-FLEET-OPERATOR');

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
            final list = <TermsSectionItem>[];
            for (var i = 0; i < parsedList.length; i++) {
              final item = parsedList[i];
              if (item is Map) {
                list.add(TermsSectionItem(
                  id: item['id']?.toString() ?? 'sec-$i',
                  title: item['title']?.toString() ?? item['question']?.toString() ?? 'Clause ${i + 1}',
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
      debugPrint('Error loading terms: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<TermsSectionItem> get filteredSections {
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

  void openHelpMail() {
    Get.snackbar(
      'Terms & Legal Support',
      'Opening email to legal@vmovexa.com...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF6366F1),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }

  void agreeTerms() {
    Get.back();
    Get.snackbar(
      'Terms Acknowledged',
      'Fleet operator operational terms and SLAs acknowledged.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }
}
