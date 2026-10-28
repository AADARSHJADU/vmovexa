import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';

class FaqItem {
  final String question;
  final String answer;

  FaqItem({required this.question, required this.answer});
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
      category: json['category']?.toString() ?? 'GENERAL',
      priority: json['priority']?.toString() ?? 'MEDIUM',
      status: json['status']?.toString() ?? 'open',
      date: json['created_at']?.toString() ?? 'Recent',
    );
  }
}

class FinanceHelpSupportController extends GetxController {
  // Tabs: 0: FAQs & Guides, 1: My Tickets
  final RxInt activeTabIndex = 0.obs;

  final RxString searchQuery = ''.obs;
  final RxInt expandedFaqIndex = 0.obs;

  final RxList<FaqItem> allFaqs = <FaqItem>[].obs;
  final RxList<FaqItem> filteredFaqs = <FaqItem>[].obs;

  final RxList<SupportTicketItem> myTickets = <SupportTicketItem>[].obs;

  final RxBool isLoading = false.obs;
  final RxBool isSubmittingTicket = false.obs;

  // New Ticket Form Controllers
  final subjectController = TextEditingController();
  final descriptionController = TextEditingController();
  final RxString selectedCategory = 'INVOICING'.obs;
  final RxString selectedPriority = 'MEDIUM'.obs;

  final List<Map<String, String>> categories = [
    {'code': 'INVOICING', 'name': 'Corporate Invoicing & Taxes'},
    {'code': 'RECONCILIATION', 'name': 'Bank Wire & Auto-Reconciliation'},
    {'code': 'GATEWAY', 'name': 'Payment Gateway & Settlements'},
    {'code': 'GST', 'name': 'GST Filing & GSTR-1 Compliance'},
    {'code': 'SUBSCRIPTION', 'name': 'Tenant Subscription & Plan'},
    {'code': 'OTHER', 'name': 'Other Financial Query'},
  ];

  final List<String> priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  @override
  void onInit() {
    super.onInit();
    loadHelpContent();
    loadMyTickets();
  }

  Future<void> loadHelpContent() async {
    isLoading.value = true;
    try {
      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.getFaqs(role: 'ROLE-FINANCE-OFFICER');
        if (res.success && res.data != null) {
          final data = res.data;
          List items = [];
          if (data is List) {
            items = data;
          } else if (data is Map && (data['rows'] is List || data['faqs'] is List)) {
            items = (data['rows'] ?? data['faqs']) as List;
          }

          if (items.isNotEmpty) {
            allFaqs.assignAll(items.map((e) {
              final map = Map<String, dynamic>.from(e as Map);
              return FaqItem(
                question: map['q']?.toString() ?? map['question']?.toString() ?? map['title']?.toString() ?? '',
                answer: map['a']?.toString() ?? map['answer']?.toString() ?? map['content']?.toString() ?? '',
              );
            }).toList());
          } else {
            _seedDefaultFinanceFaqs();
          }
        } else {
          _seedDefaultFinanceFaqs();
        }
      } else {
        _seedDefaultFinanceFaqs();
      }
    } catch (_) {
      _seedDefaultFinanceFaqs();
    } finally {
      applyFaqSearch();
      isLoading.value = false;
    }
  }

  void _seedDefaultFinanceFaqs() {
    allFaqs.assignAll([
      FaqItem(
        question: 'How do I generate a corporate GST tax invoice?',
        answer: 'Navigate to Invoices > Generate Invoice from the sidebar. Select tenant organization, input SAC/HSN codes, itemize line items with GST rates (18%), and click "Generate Corporate Invoice".',
      ),
      FaqItem(
        question: 'How does automated bank reconciliation work?',
        answer: 'Under Financial Reconciliation, upload MT940 / CSV bank statement. Our reconciliation engine auto-matches transactions by UTR, invoice reference number, and amount within a 99.4% precision index.',
      ),
      FaqItem(
        question: 'Where can I export GSTR-1 compliant JSON files?',
        answer: 'Go to GST & Compliance portal, select the target month and fiscal year, and click "Export GSTR-1 JSON". The exported payload can be uploaded directly to the Government GSTN portal.',
      ),
      FaqItem(
        question: 'How to record manual offline payment receipts (Cheque/NEFT)?',
        answer: 'Open the unpaid invoice details page, click "Mark Paid", choose payment method (NEFT, RTGS, Cheque), enter bank reference UTR number, and confirm settlement.',
      ),
      FaqItem(
        question: 'What are the payment gateway settlement cycles?',
        answer: 'Razorpay and Stripe settlements follow standard T+1 banking day cycles into VMOVEXA designated treasury bank accounts configured under Corporate Settings.',
      ),
    ]);
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
    } catch (_) {}
  }

  void applyFaqSearch() {
    final q = searchQuery.value.toLowerCase().trim();
    if (q.isEmpty) {
      filteredFaqs.assignAll(allFaqs);
    } else {
      filteredFaqs.assignAll(
        allFaqs.where((f) => f.question.toLowerCase().contains(q) || f.answer.toLowerCase().contains(q)).toList(),
      );
    }
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
    applyFaqSearch();
  }

  void toggleFaq(int index) {
    expandedFaqIndex.value = expandedFaqIndex.value == index ? -1 : index;
  }

  Future<void> submitNewTicket() async {
    final subject = subjectController.text.trim();
    if (subject.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Ticket subject cannot be empty.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    final desc = descriptionController.text.trim();
    if (desc.isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Please describe the issue in detail.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
      return;
    }

    isSubmittingTicket.value = true;
    try {
      final payload = {
        'subject': subject,
        'category': selectedCategory.value,
        'priority': selectedPriority.value,
        'description': desc,
      };

      if (Get.isRegistered<FinanceService>()) {
        final res = await FinanceService.to.createSupportTicket(payload);
        if (res.success) {
          subjectController.clear();
          descriptionController.clear();
          Get.back(); // close modal
          await loadMyTickets();
          activeTabIndex.value = 1; // switch to tickets tab

          Get.snackbar(
            'Ticket Created',
            'Your support ticket has been filed with finance desk.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        } else {
          Get.snackbar(
            'Submission Failed',
            res.message ?? 'Could not file ticket.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFFEF4444),
            colorText: Colors.white,
          );
        }
      } else {
        Get.back();
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to submit ticket: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmittingTicket.value = false;
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
    super.onClose();
  }
}
