import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../model/help_support_models.dart';
import '../widgets/create_support_ticket_sheet.dart';
import '../widgets/video_academy_sheet.dart';

class DriverHelpSupportController extends GetxController {
  DriverService get _driverService => DriverService.to;

  // ---------------- Loading States ----------------
  final RxBool isLoading = false.obs;
  final RxBool isLoadingTickets = false.obs;

  // ---------------- Content & Search ----------------
  final Rx<DriverHelpContentModel> helpContent = DriverHelpContentModel.defaultDriverHelp().obs;
  final RxString searchQuery = ''.obs;
  final RxnInt openFaqIndex = RxnInt(null);

  // ---------------- Recent Tickets ----------------
  final RxList<DriverSupportTicketModel> recentTickets = <DriverSupportTicketModel>[].obs;

  // ---------------- Backwards compatibility stubs ----------------
  final RxList<QuickHelpItem> quickHelpItems = <QuickHelpItem>[].obs;
  final RxList<ContactChannel> contactChannels = <ContactChannel>[].obs;

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
      debugPrint('DriverHelpSupportController fetchHelpData error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchHelpData();

  Future<void> _loadHelpContent() async {
    try {
      final res = await _driverService.getDriverHelpContent();
      if (res.success && res.data != null) {
        helpContent.value = res.data!;
      } else {
        helpContent.value = DriverHelpContentModel.defaultDriverHelp();
      }
    } catch (e) {
      debugPrint('Error loading driver help content: $e');
      helpContent.value = DriverHelpContentModel.defaultDriverHelp();
    }
  }

  Future<void> _loadRecentTickets() async {
    isLoadingTickets.value = true;
    try {
      final res = await _driverService.getMySupportTickets(page: 1, limit: 3);
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
  List<DriverFaqItem> get filteredFaqs {
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
    openFaqIndex.value = null; // reset opened accordion on search
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

  /// Call Transit Emergency SOS Hotline (One-Tap Dialing)
  Future<void> callEmergencySOS() async {
    final title = helpContent.value.contact.title;
    // Extract first phone number
    String telNumber = '18008668392';
    if (title.contains('+91')) {
      final match = RegExp(r'\+91\s*[0-9\s]+').firstMatch(title);
      if (match != null) {
        telNumber = match.group(0)!.replaceAll(RegExp(r'\s+'), '');
      }
    } else {
      telNumber = '18008668392';
    }

    final uri = Uri.parse('tel:$telNumber');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'Emergency Hotline',
          'Call Transit Control Room: $title',
          backgroundColor: const Color(0xFFE53935),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 4),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Emergency Hotline',
        'Call Transit Control Room: $title',
        backgroundColor: const Color(0xFFE53935),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  /// Open SOP Guide directly (same as Fleet Operator & Admin Panel)
  Future<void> openSopGuide(DriverGuideItem guide) async {
    final rawUrl = guide.url;
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
          'Could not open document: $e',
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
        backgroundColor: Colors.orangeAccent.withOpacity(0.9),
        colorText: Colors.white,
      );
    }
  }

  /// Open Driver Transit Academy Video Tutorials bottom sheet
  void openVideoAcademy() {
    final academy = helpContent.value.videoAcademy ??
        DriverHelpContentModel.defaultDriverHelp().videoAcademy!;
    Get.bottomSheet(
      VideoAcademySheet(academy: academy),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  /// Open Raise Ticket modal bottom sheet
  void openRaiseTicketModal() {
    Get.bottomSheet(
      CreateSupportTicketSheet(
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
    Get.toNamed(Routes.DRIVER_SUPPORT_HISTORY)?.then((_) => _loadRecentTickets());
  }

  /// Navigate to single Ticket Conversation / Chat
  void openTicketDetails(DriverSupportTicketModel ticket) {
    Get.toNamed(
      Routes.DRIVER_SUPPORT_TICKET_DETAILS,
      arguments: ticket,
    )?.then((_) => _loadRecentTickets());
  }
}
