import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

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

  String currentRoleCode = '';

  @override
  void onInit() {
    super.onInit();
    initForCurrentRole();
  }

  void initForCurrentRole() {
    final role = resolveRole();
    currentRoleCode = role;
    _loadDefaults(role);
    loadPrivacyPolicy(role: role);
  }

  /// Resolve role from navigation arguments, route parameters, or logged-in user session
  String resolveRole() {
    // 1. Arguments passed via Get.toNamed
    if (Get.arguments != null) {
      if (Get.arguments is Map && Get.arguments['role'] != null) {
        return _mapRole(Get.arguments['role'].toString());
      }
      if (Get.arguments is String && Get.arguments.toString().isNotEmpty) {
        return _mapRole(Get.arguments.toString());
      }
    }

    // 2. Route parameters
    if (Get.parameters['role'] != null && Get.parameters['role']!.isNotEmpty) {
      return _mapRole(Get.parameters['role']!);
    }

    // 3. Current active user role from storage
    if (Get.isRegistered<StorageService>()) {
      final user = StorageService.to.getUser();
      if (user?.role != null && user!.role!.isNotEmpty) {
        return _mapRole(user.role!);
      }
      final currentRole = StorageService.to.getCurrentRole();
      if (currentRole != null && currentRole.isNotEmpty) {
        return _mapRole(currentRole);
      }
    }

    return 'ROLE-FLEET-OPERATOR';
  }

  String _mapRole(String role) {
    final upper = role.toUpperCase().trim();
    if (upper.contains('TECH')) return 'ROLE-CENTRAL-TECH';
    if (upper.contains('DRIVER')) return 'ROLE-DRIVER';
    if (upper.contains('GOVT')) return 'ROLE-GOVT-AGENCY';
    if (upper.contains('ADV')) return 'ROLE-ADVERTISER';
    if (upper.contains('SUPER')) return 'ROLE-SUPER-ADMIN';
    if (upper.contains('FINANCE')) return 'ROLE-FINANCE-OFFICER';
    if (upper.contains('TENANT') || upper.contains('FLEET')) return 'ROLE-FLEET-OPERATOR';
    return role;
  }

  void _loadDefaults([String? role]) {
    final activeRole = role ?? resolveRole();
    final isFinance = activeRole.contains('FINANCE');
    final isTech = activeRole.contains('TECH');

    if (isFinance) {
      pageTitle.value = 'Financial Data & Ledger Privacy Policy';
      pageSubtitle.value = 'Banking credential security, PCI-DSS compliance, and statutory financial record retention';
      sections.assignAll([
        PolicySectionItem(
          id: '1',
          title: '1. Banking Encryption & PCI-DSS Compliance',
          content: 'All payment gateway credentials, merchant tokens, bank account hashes, and UPI identifiers are processed with end-to-end TLS 1.3 encryption and strictly adhere to PCI-DSS Level 1 compliance standards.',
        ),
        PolicySectionItem(
          id: '2',
          title: '2. Financial Ledger Isolation & Access Controls',
          content: 'Tenant revenue ledgers, debit/credit entries, and settlement reconciliation logs are strictly isolated under role-based financial controls, preventing unauthorized cross-tenant exposure.',
        ),
        PolicySectionItem(
          id: '3',
          title: '3. Statutory GST & Tax Audit Retention',
          content: 'Tax invoices, SAC codes, and e-way bill records are securely archived for statutory compliance in alignment with Indian GST and corporate tax audit requirements.',
        ),
        PolicySectionItem(
          id: '4',
          title: '4. Payment Gateway Security & Settlement Tokenization',
          content: 'Payment card details and net banking authentication tokens are never stored directly on our core servers; they are tokenized via certified payment aggregators.',
        ),
        PolicySectionItem(
          id: '5',
          title: '5. Audit Trail & Financial Transparency',
          content: 'Every financial reconciliation entry, transaction dispute, and refund approval is immutably timestamped with officer credentials for periodic internal and external audits.',
        ),
      ]);
    } else if (isTech) {
      pageTitle.value = 'Technician Telemetry Privacy Policy';
      pageSubtitle.value = 'Diagnostic sensor isolation, technician geolocation handling, and hardware log security';
      sections.assignAll([
        PolicySectionItem(
          id: '1',
          title: '1. Diagnostic Sensor & Telemetry Isolation',
          content: 'Telemetry and sensor diagnostic data collected during hardware installation and edge device inspection are strictly isolated to system verification and device calibration.',
        ),
        PolicySectionItem(
          id: '2',
          title: '2. Geolocation & Dispatch Privacy',
          content: 'Technician location data is accessed only during assigned work order windows to verify on-site device installations and route dispatches.',
        ),
        PolicySectionItem(
          id: '3',
          title: '3. Hardware Configuration & Credential Safety',
          content: 'All edge unit API keys, MQTT broker credentials, and firmware hashes are encrypted end-to-end and inaccessible to unauthorized parties.',
        ),
        PolicySectionItem(
          id: '4',
          title: '4. Work Order Logs & Audit Governance',
          content: 'Diagnostic history, device pairing records, and completed work orders are retained for maintenance history and operational audit compliance.',
        ),
      ]);
    } else {
      pageTitle.value = 'Fleet Operations Privacy Policy';
      pageSubtitle.value = 'Depot telematics monitoring, shift log privacy, and vehicle tracking data governance';
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
  }

  /// Load privacy policy dynamically based on user role
  Future<void> loadPrivacyPolicy({String? role}) async {
    final activeRole = role ?? resolveRole();
    currentRoleCode = activeRole;
    try {
      isLoading.value = true;
      dynamic res;
      if (Get.isRegistered<FinanceService>() && activeRole.contains('FINANCE')) {
        res = await FinanceService.to.getContentPage('privacy', role: activeRole);
      } else if (Get.isRegistered<FleetService>()) {
        res = await FleetService.to.getContentPage('privacy', role: activeRole);

        // Fallback: If not found and role is technician, try alternate technician role code
        if ((!res.success || res.data == null) && activeRole == 'ROLE-CENTRAL-TECH') {
          final altRes = await FleetService.to.getContentPage('privacy', role: 'ROLE-TECHNICIAN');
          if (altRes.success && altRes.data != null) {
            res = altRes;
          }
        }
      } else if (Get.isRegistered<FinanceService>()) {
        res = await FinanceService.to.getContentPage('privacy', role: activeRole);
      }

      if (res != null && res.success == true && res.data != null) {
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

  void acknowledgePolicy() {
    Get.back();
    Get.snackbar(
      'Policy Acknowledged',
      'You have acknowledged the updated privacy policy terms.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
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
