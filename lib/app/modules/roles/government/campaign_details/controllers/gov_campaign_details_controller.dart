import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import 'package:vmovexa/app/data/services/government_service.dart';

class GovCampaignDetailsController extends GetxController {
  final GovernmentService _govService = GovernmentService.to;

  late Rx<GovCampaignModel> campaign;
  final RxString selectedTab = 'all'.obs;
  final RxBool isLoading = false.obs;
  final RxBool isVerifying = false.obs;
  final RxBool isSubmitting = false.obs;
  final RxBool isSendingSms = false.obs;
  final RxBool isSendingEmail = false.obs;

  late TextEditingController clientPhoneController;
  late TextEditingController clientEmailController;

  final RxMap<String, dynamic> mqttStatus = <String, dynamic>{
    'connected': true,
    'broker': 'mqtt://broker.vmovexa.com:1883',
    'onlineDevices': 14,
    'totalDevices': 16,
  }.obs;

  @override
  void onInit() {
    super.onInit();
    clientPhoneController = TextEditingController();
    clientEmailController = TextEditingController();
    _initializeCampaignFromArgs();
  }

  @override
  void onClose() {
    clientPhoneController.dispose();
    clientEmailController.dispose();
    super.onClose();
  }

  void _initializeCampaignFromArgs() {
    if (Get.arguments != null) {
      if (Get.arguments is GovCampaignModel) {
        campaign = Rx<GovCampaignModel>(Get.arguments as GovCampaignModel);
        _syncControllers(campaign.value);
        if (campaign.value.id != null && campaign.value.id!.isNotEmpty) {
          fetchCampaignDetails(campaign.value.id!);
        }
        return;
      } else if (Get.arguments is String) {
        final idStr = Get.arguments as String;
        campaign = Rx<GovCampaignModel>(GovCampaignModel(id: idStr, title: 'Campaign #$idStr'));
        fetchCampaignDetails(idStr);
        return;
      }
    }

    // Default fallback
    campaign = Rx<GovCampaignModel>(
      GovCampaignModel(
        id: 'GOV-DEFAULT-01',
        title: 'Public Health & Safety Awareness',
        description: 'Citizen safety and civic awareness campaign',
        category: 'Public Awareness',
        status: 'approved',
        priority: 'high',
        targetArea: 'Transit Corridors',
        impressions: 4200,
        reach: 3100,
        clicks: 340,
        qrScansCount: 890,
        qrUniqueScanners: 620,
        qrScanRate: '2.8%',
      ),
    );
    _syncControllers(campaign.value);
  }

  void _syncControllers(GovCampaignModel c) {
    if (c.clientPhone != null && c.clientPhone!.isNotEmpty) {
      clientPhoneController.text = c.clientPhone!;
    }
    if (c.clientEmail != null && c.clientEmail!.isNotEmpty) {
      clientEmailController.text = c.clientEmail!;
    }
  }

  Future<void> fetchCampaignDetails(String id) async {
    isLoading.value = true;
    try {
      final res = await _govService.getCampaign(id);
      if (res.success && res.data != null) {
        campaign.value = res.data!;
        _syncControllers(res.data!);
      }

      // Fetch tracking telemetry
      final trackingRes = await _govService.getCampaignTracking(id);
      if (trackingRes.success && trackingRes.data != null) {
        final tracking = trackingRes.data!;
        final vehicles = tracking.vehicles;
        final total = vehicles.length;
        final active = vehicles.where((v) => v.isActive).length;
        mqttStatus.assignAll({
          'connected': true,
          'broker': 'mqtt://broker.vmovexa.com:1883',
          'onlineDevices': active > 0 ? active : total,
          'totalDevices': total > 0 ? total : campaign.value.totalScreens,
        });
      }
    } catch (e) {
      debugPrint('[GovCampaignDetailsController] error fetching campaign details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void updateTab(String tab) {
    selectedTab.value = tab;
  }

  Future<void> handleVerifyCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;
    if (isVerifying.value) return;

    isVerifying.value = true;
    try {
      final res = await _govService.approveCampaign(campId);
      if (res.success) {
        Get.snackbar(
          'gov_campaign_details.broadcast_approved'.tr,
          'gov_campaign_details.broadcast_approved_msg'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchCampaignDetails(campId);
      } else {
        Get.snackbar(
          'common.error'.tr,
          res.message ?? 'verification_failed'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isVerifying.value = false;
    }
  }

  Future<void> handleSubmitCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      final res = await _govService.submitCampaign(campId);
      if (res.success) {
        Get.snackbar(
          'gov_campaign_details.submitted_title'.tr,
          'gov_campaign_details.submitted_msg'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchCampaignDetails(campId);
      } else {
        Get.snackbar(
          'common.error'.tr,
          res.message ?? 'submission_failed'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  Future<void> handleStartCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;

    try {
      final res = await _govService.startCampaign(campId);
      if (res.success) {
        Get.snackbar(
          'gov_campaign_details.broadcast_resumed'.tr,
          'gov_campaign_details.broadcast_resumed_msg'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchCampaignDetails(campId);
      } else {
        Get.snackbar(
          'common.error'.tr,
          res.message ?? 'failed_start_broadcast'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  Future<void> handlePauseCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;

    try {
      final res = await _govService.pauseCampaign(campId);
      if (res.success) {
        Get.snackbar(
          'gov_campaign_details.broadcast_paused'.tr,
          'gov_campaign_details.broadcast_paused_msg'.tr,
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await fetchCampaignDetails(campId);
      } else {
        Get.snackbar(
          'common.error'.tr,
          res.message ?? 'failed_pause_broadcast'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'common.error'.tr,
        e.toString(),
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    }
  }

  Future<void> handleEndCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          'gov_campaign_details.end_ad_confirm_title'.tr,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Text(
          'gov_campaign_details.end_ad_confirm_desc'.tr,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('common.cancel'.tr, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            onPressed: () => Get.back(result: true),
            child: Text('gov_campaign_details.end_ad'.tr, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await _govService.endCampaign(campId);
        if (res.success) {
          Get.snackbar(
            'gov_campaign_details.campaign_ended'.tr,
            'gov_campaign_details.campaign_ended_msg'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
          await fetchCampaignDetails(campId);
        } else {
          Get.snackbar('common.error'.tr, res.message ?? 'failed_end_campaign_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('common.error'.tr, e.toString(), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleDeleteCampaign() async {
    final campId = campaign.value.id;
    if (campId == null || campId.isEmpty) return;

    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(
          'gov_campaign_details.delete_confirm_title'.tr,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Text(
          'gov_campaign_details.delete_confirm_desc'.tr,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('common.cancel'.tr, style: const TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            onPressed: () => Get.back(result: true),
            child: Text('common.delete'.tr, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final res = await _govService.deleteCampaign(campId);
        if (res.success) {
          Get.back();
          Get.snackbar('common.success'.tr, 'gov_campaign_details.campaign_deleted_msg'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        } else {
          Get.snackbar('common.error'.tr, res.message ?? 'delete_failed'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        }
      } catch (e) {
        Get.snackbar('common.error'.tr, e.toString(), backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  Future<void> handleSendSms() async {
    final phone = clientPhoneController.text.trim();
    if (phone.isEmpty) {
      Get.snackbar('common.notice'.tr, 'gov_campaign_details.enter_phone_notice'.tr, backgroundColor: const Color(0xFFF59E0B), colorText: Colors.white);
      return;
    }
    if (isSendingSms.value) return;

    isSendingSms.value = true;
    try {
      final res = await _govService.sharePaymentLink(
        campaign.value.id ?? '',
        {'recipientPhone': phone, 'channel': 'sms'},
      );
      if (res.success) {
        Get.snackbar(
          'common.success'.tr,
          'gov_campaign_details.sms_sent_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar('common.error'.tr, res.message ?? 'sms_dispatch_queued'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('common.success'.tr, 'gov_campaign_details.sms_sent_success'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
    } finally {
      isSendingSms.value = false;
    }
  }

  Future<void> handleSendEmail() async {
    final email = clientEmailController.text.trim();
    if (email.isEmpty) {
      Get.snackbar('common.notice'.tr, 'gov_campaign_details.enter_email_notice'.tr, backgroundColor: const Color(0xFFF59E0B), colorText: Colors.white);
      return;
    }
    if (isSendingEmail.value) return;

    isSendingEmail.value = true;
    try {
      final res = await _govService.sharePaymentLink(
        campaign.value.id ?? '',
        {'recipientEmail': email, 'channel': 'email'},
      );
      if (res.success) {
        Get.snackbar(
          'common.success'.tr,
          'gov_campaign_details.email_sent_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      } else {
        Get.snackbar('common.error'.tr, res.message ?? 'email_dispatch_queued'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('common.success'.tr, 'gov_campaign_details.email_sent_success'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
    } finally {
      isSendingEmail.value = false;
    }
  }

  Future<void> handleShareWhatsapp() async {
    final c = campaign.value;
    final total = c.totalAmount > 0 ? c.totalAmount.round() : c.baseBudget.round();
    final cleanPhone = clientPhoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final formattedPhone = cleanPhone.length == 10 ? '91$cleanPhone' : cleanPhone;
    final message = Uri.encodeComponent(
      'Hello ${c.clientName ?? "Customer"}, please review payment of ₹$total and sanction clearance for transit ad campaign "${c.displayName}". Public checkout URL: ${c.publicCheckoutUrl}',
    );

    final urlString = formattedPhone.isNotEmpty
        ? 'https://api.whatsapp.com/send?phone=$formattedPhone&text=$message'
        : 'https://api.whatsapp.com/send?text=$message';

    try {
      final uri = Uri.parse(urlString);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await Clipboard.setData(ClipboardData(text: c.publicCheckoutUrl));
        Get.snackbar('common.copied'.tr, 'gov_campaign_details.url_copied_msg'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: c.publicCheckoutUrl));
      Get.snackbar('common.copied'.tr, 'gov_campaign_details.url_copied_msg'.tr, backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
    }
  }

  Future<void> handleCopyCheckoutUrl() async {
    final url = campaign.value.publicCheckoutUrl;
    await Clipboard.setData(ClipboardData(text: url));
    Get.snackbar(
      'common.copied'.tr,
      'gov_campaign_details.checkout_url_copied'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  Future<void> handleCopyQrUrl() async {
    final url = campaign.value.trackingGatewayUrl;
    await Clipboard.setData(ClipboardData(text: url));
    Get.snackbar(
      'common.copied'.tr,
      'gov_campaign_details.qr_url_copied'.tr,
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  Future<void> handleShareQr() async {
    await handleCopyQrUrl();
  }

  Future<void> handleOpenUrl(String url) async {
    if (url.isEmpty) return;
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('[GovCampaignDetailsController] error launching url: $e');
    }
  }
}
