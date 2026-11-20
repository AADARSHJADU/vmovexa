import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../model/tech_help_support_models.dart';
import '../widgets/create_tech_support_ticket_sheet.dart';
import '../widgets/tech_video_academy_sheet.dart';

class TechHelpSupportController extends GetxController {
  TechnicianService get _techService => TechnicianService.to;

  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool isLoadingTickets = false.obs;

  // ---------------- Content & Search ----------------
  final Rx<TechHelpContentModel> helpContent = TechHelpContentModel.defaultTechnicianHelp().obs;
  final RxString searchQuery = ''.obs;
  final RxnInt openFaqIndex = RxnInt(null);

  // ---------------- Recent Tickets ----------------
  final RxList<TechSupportTicketModel> recentTickets = <TechSupportTicketModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchHelpData();
  }

  Future<void> fetchHelpData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadHelpContent(),
        _loadRecentTickets(),
      ]);
    } catch (e) {
      debugPrint('TechHelpSupportController fetchHelpData error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchHelpData();

  Future<void> _loadHelpContent() async {
    try {
      final res = await _techService.getTechnicianHelpContent();
      if (res.success && res.data != null) {
        helpContent.value = res.data!;
      } else {
        helpContent.value = TechHelpContentModel.defaultTechnicianHelp();
      }
    } catch (e) {
      debugPrint('Error loading technician help content: $e');
      helpContent.value = TechHelpContentModel.defaultTechnicianHelp();
    }
  }

  Future<void> _loadRecentTickets() async {
    isLoadingTickets.value = true;
    try {
      final res = await _techService.getMySupportTickets(page: 1, limit: 3);
      if (res.success && res.data != null) {
        recentTickets.assignAll(res.data!);
      } else {
        recentTickets.clear();
      }
    } catch (e) {
      debugPrint('Error loading recent support tickets: $e');
      recentTickets.clear();
    } finally {
      isLoadingTickets.value = false;
    }
  }

  // ---------------- Live Filtered FAQs ----------------
  List<TechFaqItem> get filteredFaqs {
    final query = searchQuery.value.trim().toLowerCase();
    final allFaqs = helpContent.value.faqs;
    if (query.isEmpty) return allFaqs;

    return allFaqs.where((f) {
      return f.question.toLowerCase().contains(query) ||
          f.answer.toLowerCase().contains(query);
    }).toList();
  }

  void onSearchChanged(String val) {
    searchQuery.value = val;
    openFaqIndex.value = null;
  }

  void toggleFaq(int index) {
    if (openFaqIndex.value == index) {
      openFaqIndex.value = null;
    } else {
      openFaqIndex.value = index;
    }
  }

  // ---------------- Actions ----------------
  void onBackPressed() => Get.back();

  /// Contact Engineering Escalation NOC Desk
  Future<void> contactEngineeringNOC() async {
    final contact = helpContent.value.contact;
    final title = contact.title; // "noc-tech@vmovexa.com / Extension 404"

    // Check if email or tel
    final Uri mailUri = Uri.parse('mailto:noc-tech@vmovexa.com?subject=Hardware%20Escalation%20Dispatch');
    try {
      if (await canLaunchUrl(mailUri)) {
        await launchUrl(mailUri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          contact.badge,
          title,
          backgroundColor: const Color(0xFF1E293B),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 4),
        );
      }
    } catch (e) {
      Get.snackbar(
        contact.badge,
        title,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  /// Open SOP Guide directly in PDF (same as Driver & Fleet Operator)
  Future<void> openSopGuide(TechGuideItem guide) async {
    final rawUrl = (guide.url != null && guide.url!.trim().isNotEmpty)
        ? guide.url!
        : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    final resolvedUrl = ApiConstants.resolveFileUrl(rawUrl);

    if (resolvedUrl.isNotEmpty) {
      try {
        final uri = Uri.parse(resolvedUrl);
        final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (!launched) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (e) {
        Get.snackbar(
          'error'.tr,
          '${'failed_to_load_doc'.tr}: $e',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
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

  /// Open Hardware Video Academy Tutorials bottom sheet
  void openVideoAcademy() {
    final academy = helpContent.value.videoAcademy ??
        TechHelpContentModel.defaultTechnicianHelp().videoAcademy!;
    Get.bottomSheet(
      TechVideoAcademySheet(academy: academy),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  /// Open Raise Ticket modal bottom sheet
  void openRaiseTicketModal() {
    Get.bottomSheet(
      CreateTechSupportTicketSheet(
        onSuccess: () {
          fetchHelpData();
        },
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  /// Navigate to full Support Ticket History
  void openSupportHistory() {
    Get.toNamed(Routes.TECHNICIAN_SUPPORT_HISTORY)?.then((_) => _loadRecentTickets());
  }

  /// Navigate to single Ticket Conversation / Chat
  void openTicketDetails(TechSupportTicketModel ticket) {
    Get.toNamed(
      Routes.TECHNICIAN_SUPPORT_TICKET_DETAILS,
      arguments: ticket,
    )?.then((_) => _loadRecentTickets());
  }
}
