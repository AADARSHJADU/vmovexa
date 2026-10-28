import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';

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
    loadTermsContent(role: role);
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
      pageTitle.value = 'Finance Officer Terms & Reconciliation Rules';
      pageSubtitle.value = 'Revenue ledger standards, payment gateway settlements, and statutory GST reconciliation';
      sections.assignAll([
        TermsSectionItem(
          id: '1',
          title: '1. Automated Tax Invoicing & SAC Codes',
          content: 'All invoices generated through VMOVEXA must include statutory 6-digit SAC codes, GSTIN breakdown (CGST, SGST, IGST), and legal registered address of the transacting entity.',
        ),
        TermsSectionItem(
          id: '2',
          title: '2. Bank Wire & Auto-Reconciliation Standards',
          content: 'Manual bank transfer uploads must match UTR reference numbers within 48 hours. Discrepant amounts will remain flagged under pending unallocated deposits until verified.',
        ),
        TermsSectionItem(
          id: '3',
          title: '3. Payment Gateway Settlement SLAs',
          content: 'Card, NetBanking, and UPI settlements via Razorpay/Stripe follow T+2 business day settlement schedules. Chargebacks or gateway holds must be reviewed within 7 business days.',
        ),
        TermsSectionItem(
          id: '4',
          title: '4. GST Filing & Statutory Compliance Liability',
          content: 'Officers are responsible for reviewing monthly GSTR-1 and GSTR-3B summary schedules before final filing cutoff dates. The platform provides automated ledger exports for verification.',
        ),
        TermsSectionItem(
          id: '5',
          title: '5. Credit Ledger & Refund Authorization',
          content: 'Refund vouchers and tenant credit memo issuances require dual-tier sign-off and must be supported by valid operational reason codes.',
        ),
      ]);
    } else if (isTech) {
      pageTitle.value = 'Central Technician Terms & SLA';
      pageSubtitle.value = 'Hardware installation protocols, CAN-bus calibration, and depot maintenance standards';
      sections.assignAll([
        TermsSectionItem(
          id: '1',
          title: '1. Hardware Installation Standards',
          content: 'All hardware mountings, wiring harnesses, and edge device installations must adhere to VMOVEXA automotive electrical safety protocols and depot engineering specifications.',
        ),
        TermsSectionItem(
          id: '2',
          title: '2. Edge & GPS Device Handling',
          content: 'Technicians are responsible for careful handling, firmware verification, and tamper-free pairing of edge computing units and GPS trackers during depot dispatches.',
        ),
        TermsSectionItem(
          id: '3',
          title: '3. Diagnostic & Telemetry Verification',
          content: 'Before marking a work order as completed, technicians must verify sensor ping, CAN-bus telemetry, and GPS satellite lock through diagnostic self-tests.',
        ),
        TermsSectionItem(
          id: '4',
          title: '4. Depot Safety & Operational Compliance',
          content: 'All on-site operations must comply with municipal depot safety protocols, vehicle ignition lockouts, and supervisor handover sign-offs.',
        ),
        TermsSectionItem(
          id: '5',
          title: '5. Spare Parts & Inventory Accountability',
          content: 'All serial numbers of replaced sensors, harnesses, and telematics units must be updated in the system inventory register before leaving the depot.',
        ),
        TermsSectionItem(
          id: '6',
          title: '6. Shift SLAs & Emergency Support',
          content: 'Technicians must respond to critical edge offline or tracker failure tickets within assigned resolution windows.',
        ),
      ]);
    } else {
      pageTitle.value = 'Fleet Manager Terms & Operational Rules';
      pageSubtitle.value = 'Depot dispatch standards, vehicle roadworthiness inspection SLAs, and route punctuality governance';
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
  }

  /// Load terms content dynamically based on user role
  Future<void> loadTermsContent({String? role}) async {
    final activeRole = role ?? resolveRole();
    currentRoleCode = activeRole;
    try {
      isLoading.value = true;
      dynamic res;
      if (Get.isRegistered<FinanceService>() && activeRole.contains('FINANCE')) {
        res = await FinanceService.to.getContentPage('terms', role: activeRole);
      } else if (Get.isRegistered<FleetService>()) {
        res = await FleetService.to.getContentPage('terms', role: activeRole);

        // Fallback: If not found and role is technician, try alternate technician role code
        if ((!res.success || res.data == null) && activeRole == 'ROLE-CENTRAL-TECH') {
          final altRes = await FleetService.to.getContentPage('terms', role: 'ROLE-TECHNICIAN');
          if (altRes.success && altRes.data != null) {
            res = altRes;
          }
        }
      } else if (Get.isRegistered<FinanceService>()) {
        res = await FinanceService.to.getContentPage('terms', role: activeRole);
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
    final isTech = currentRoleCode.contains('TECH');
    Get.snackbar(
      'Terms Acknowledged',
      isTech
          ? 'Technician engineering terms and SLAs acknowledged.'
          : 'Fleet operator operational terms and SLAs acknowledged.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
      margin: const EdgeInsets.all(16),
      borderRadius: 10,
    );
  }
}
