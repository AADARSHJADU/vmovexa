import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import '../../../../../routes/app_routes.dart';

class CampaignDetailsController extends GetxController {
  late Rx<CampaignModel> campaign;

  // Active section tab: 'overview', 'media_fleet', 'schedule_budget', 'payment_qr'
  final RxString activeSectionTab = 'overview'.obs;

  final RxInt qrScans = 1420.obs;
  final RxInt vmovexaLeads = 320.obs;
  final RxDouble qrConversion = 22.5.obs;

  final RxBool isLoading = false.obs;
  final RxBool isActionLoading = false.obs;
  final RxList<CampaignReviewModel> reviews = <CampaignReviewModel>[].obs;

  // Share Payment Dialog Form Controllers
  final smsPhoneController = TextEditingController();
  final emailInvoiceController = TextEditingController();
  final RxBool isSharingPayment = false.obs;

  AdvertiserService get _service => AdvertiserService.to;

  @override
  void onInit() {
    super.onInit();
    final dynamic arg = Get.arguments;
    if (arg is CampaignModel) {
      campaign = arg.obs;
    } else if (arg is Map && arg['campaign'] is CampaignModel) {
      campaign = (arg['campaign'] as CampaignModel).obs;
    } else {
      campaign = CampaignModel(
        id: 'CMP-2026-000124',
        title: 'Summer Sale 2026',
        brandName: 'City Mart',
        startDate: '2026-05-20',
        endDate: '2026-06-10',
        budget: 250000.0,
        status: 'pending_approval',
      ).obs;
    }

    _syncFormDefaults();

    // Bind stats if available on campaign model
    if (campaign.value.stats != null) {
      qrScans.value = campaign.value.stats!.qrScans;
      vmovexaLeads.value = campaign.value.stats!.leads;
      qrConversion.value = campaign.value.stats!.conversionRate;
    }

    refreshCampaignDetails();
  }

  void _syncFormDefaults() {
    smsPhoneController.text = campaign.value.clientPhone ?? '';
    emailInvoiceController.text = campaign.value.clientEmail ?? '';
  }

  void setSectionTab(String tab) {
    activeSectionTab.value = tab;
  }

  /// GET /api/v1/campaigns/:id
  Future<void> refreshCampaignDetails() async {
    if (campaign.value.id.isEmpty) return;
    isLoading.value = true;
    try {
      final res = await _service.getCampaignById(campaign.value.id);
      if (res.isSuccess && res.data != null) {
        campaign.value = res.data!;
        _syncFormDefaults();
        if (campaign.value.stats != null) {
          qrScans.value = campaign.value.stats!.qrScans;
          vmovexaLeads.value = campaign.value.stats!.leads;
          qrConversion.value = campaign.value.stats!.conversionRate;
        }
      }

      // Fetch reviews
      final reviewsRes = await _service.getCampaignReviews(campaign.value.id);
      if (reviewsRes.isSuccess && reviewsRes.data != null) {
        reviews.assignAll(reviewsRes.data!);
      }
    } catch (e) {
      debugPrint('Error refreshing campaign details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// POST /api/v1/campaigns/:id/start
  Future<void> startCampaign() async {
    if (isActionLoading.value) return;
    isActionLoading.value = true;
    try {
      final res = await _service.startCampaign(campaign.value.id);
      if (res.isSuccess) {
        Get.snackbar('Success', 'Campaign started! Broadcast is now live on screens',
            backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
        await refreshCampaignDetails();
      } else {
        Get.snackbar('Error', res.message ?? 'Failed to start campaign',
            backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      debugPrint('Error starting campaign: $e');
    } finally {
      isActionLoading.value = false;
    }
  }

  /// POST /api/v1/campaigns/:id/pause
  Future<void> pauseCampaign() async {
    if (isActionLoading.value) return;
    isActionLoading.value = true;
    try {
      final res = await _service.pauseCampaign(campaign.value.id);
      if (res.isSuccess) {
        Get.snackbar('Success', 'Campaign paused successfully',
            backgroundColor: const Color(0xFFF97316), colorText: Colors.white);
        await refreshCampaignDetails();
      } else {
        Get.snackbar('Error', res.message ?? 'Failed to pause campaign',
            backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      debugPrint('Error pausing campaign: $e');
    } finally {
      isActionLoading.value = false;
    }
  }

  /// POST /api/v1/campaigns/:id/end
  Future<void> endCampaign() async {
    if (isActionLoading.value) return;
    isActionLoading.value = true;
    try {
      final res = await _service.endCampaign(campaign.value.id);
      if (res.isSuccess) {
        Get.snackbar('Success', 'Campaign completed and broadcast stopped',
            backgroundColor: const Color(0xFF3B82F6), colorText: Colors.white);
        await refreshCampaignDetails();
      } else {
        Get.snackbar('Error', res.message ?? 'Failed to complete campaign',
            backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      debugPrint('Error ending campaign: $e');
    } finally {
      isActionLoading.value = false;
    }
  }

  Future<void> confirmEndCampaign() async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('End Campaign Broadcast',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
            'Are you sure you want to end "${campaign.value.displayTitle}"? Ad broadcast on screens will be permanently terminated.',
            style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: const Text('End Broadcast',
                style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await endCampaign();
    }
  }

  /// DELETE /api/v1/campaigns/:id
  Future<void> confirmDeleteCampaign() async {
    final confirmed = await Get.dialog<bool>(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Delete Campaign',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
            'Are you sure you want to delete "${campaign.value.displayTitle}"? This action cannot be undone.',
            style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: const Text('Delete',
                style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final res = await _service.deleteCampaign(campaign.value.id);
      if (res.isSuccess) {
        Get.back();
        Get.snackbar('Success', 'Campaign deleted',
            backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      } else {
        Get.snackbar('Error', res.message ?? 'Failed to delete',
            backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    }
  }

  /// Navigation to Edit
  void goToEdit() {
    Get.toNamed(Routes.CREATE_CAMPAIGN, arguments: {'campaign': campaign.value, 'isEdit': true})
        ?.then((_) => refreshCampaignDetails());
  }

  /// Navigation to Analytics
  void goToAnalytics() {
    Get.toNamed(Routes.CAMPAIGN_ANALYTICS, arguments: campaign.value)
        ?.then((_) => refreshCampaignDetails());
  }

  /// POST /api/v1/campaigns/:id/share-payment-link
  Future<void> sharePaymentLink({required String channel, required String recipient}) async {
    if (recipient.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter recipient $channel address',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }

    isSharingPayment.value = true;
    try {
      final payload = {
        'channel': channel,
        if (channel == 'sms') 'recipientPhone': recipient.trim(),
        if (channel == 'email') 'recipientEmail': recipient.trim(),
      };
      final res = await _service.sharePaymentLink(campaign.value.id, payload);
      if (res.isSuccess) {
        Get.back(); // close modal if open
        Get.snackbar('Link Sent', res.message ?? 'Payment checkout link queued successfully',
            backgroundColor: const Color(0xFF10B981), colorText: Colors.white);
      } else {
        Get.snackbar('Error', res.message ?? 'Failed to send payment link',
            backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Unexpected error: $e',
          backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
    } finally {
      isSharingPayment.value = false;
    }
  }

  /// Shows the share checkout link modal
  void showSharePaymentModal() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Share Checkout Link',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // SMS Option
              const Text('Send SMS Checkout Link',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: TextField(
                        controller: smsPhoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Enter client mobile...',
                          hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                          border: InputBorder.none,
                          prefixIcon: Icon(Icons.phone_iphone_rounded, size: 16, color: Color(0xFF60A5FA)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => sharePaymentLink(channel: 'sms', recipient: smsPhoneController.text),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    child: const Text('Send SMS', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Email Option
              const Text('Send Email Invoice & Checkout',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: TextField(
                        controller: emailInvoiceController,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Enter client email...',
                          hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                          border: InputBorder.none,
                          prefixIcon: Icon(Icons.mail_outline_rounded, size: 16, color: Color(0xFF8B5CF6)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => sharePaymentLink(channel: 'email', recipient: emailInvoiceController.text),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C3AED),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    child: const Text('Send Email', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 14),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }
}
