import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../../model/campaign_payment_model.dart';

class CampaignPaymentDetailsController extends GetxController {
  final RxBool isLoading = true.obs;
  final Rx<CampaignPaymentModel?> campaign = Rx<CampaignPaymentModel?>(null);
  String campaignId = '';

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is CampaignPaymentModel) {
      campaign.value = args;
      campaignId = args.id;
      isLoading.value = false;
      // Fetch fresh in background
      _fetchDetails(campaignId, showSpinner: false);
    } else if (args is String) {
      campaignId = args;
      _fetchDetails(campaignId, showSpinner: true);
    } else if (Get.parameters.containsKey('id')) {
      campaignId = Get.parameters['id'] ?? '';
      _fetchDetails(campaignId, showSpinner: true);
    } else {
      isLoading.value = false;
    }
  }

  Future<void> _fetchDetails(String id, {bool showSpinner = true}) async {
    if (id.isEmpty) return;
    if (showSpinner) isLoading.value = true;
    try {
      final res = await HttpClientService.to.get('/finance/campaign-payments/$id');
      if (res.statusCode == 200 && res.data != null) {
        dynamic data = res.data;
        if (data is Map && data.containsKey('data')) {
          data = data['data'];
        }
        if (data is Map) {
          campaign.value = CampaignPaymentModel.fromJson(Map<String, dynamic>.from(data));
        }
      }
    } catch (_) {
      // Maintain existing model if available
    } finally {
      if (showSpinner) isLoading.value = false;
    }
  }

  Future<void> refreshDetails() async {
    if (campaignId.isNotEmpty) {
      await _fetchDetails(campaignId, showSpinner: true);
    }
  }

  void copyCode(String text, String label) {
    if (text.isEmpty) return;
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'success'.tr,
      '$label ${'copied_to_clipboard'.tr}',
      backgroundColor: const Color(0xFF10B981),
      colorText: Colors.white,
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  String get checkoutUrl {
    final c = campaign.value;
    if (c == null) return '';
    final token = c.paymentToken;
    return '${ApiConstants.baseUrl.replaceAll('/api/v1', '')}/campaigns/${c.id}/pay?token=$token';
  }

  void copyCheckoutUrl() {
    copyCode(checkoutUrl, 'Payment URL');
  }

  String resolveMediaUrl(String rawUrl) {
    if (rawUrl.isEmpty) return '';
    final trimmed = rawUrl.trim();
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    final normalized = trimmed.replaceAll(r'\', '/');
    final backendBase = ApiConstants.baseUrl.replaceAll('/api/v1', '').replaceAll(RegExp(r'/+$'), '');
    final cleanPath = normalized.startsWith('/') ? normalized : '/$normalized';
    return '$backendBase$cleanPath';
  }

  bool isVideoAsset(CampaignMediaAsset asset) {
    final type = asset.mediaType.toLowerCase();
    final url = asset.fileUrl.toLowerCase();
    return type == 'video' ||
        url.endsWith('.mp4') ||
        url.endsWith('.mov') ||
        url.endsWith('.webm') ||
        url.endsWith('.mkv') ||
        url.contains('youtube.com') ||
        url.contains('youtu.be');
  }

  Future<void> openVideo(String rawUrl) async {
    final url = resolveMediaUrl(rawUrl);
    if (url.isEmpty) {
      Get.snackbar(
        'error'.tr,
        'cannot_open_media'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    try {
      final uri = Uri.parse(url);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        await launchUrl(Uri.parse(url), mode: LaunchMode.platformDefault);
      } catch (e) {
        Get.snackbar(
          'error'.tr,
          'cannot_open_media'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    }
  }

  Future<void> openMediaInBrowser(String rawUrl) async {
    final url = resolveMediaUrl(rawUrl);
    if (url.isEmpty) return;
    try {
      final uri = Uri.parse(url);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {}
  }

  void openShareModal() {
    final c = campaign.value;
    if (c == null) return;

    final emailCtrl = TextEditingController(
      text: c.clientEmail.isNotEmpty ? c.clientEmail : c.advertiserEmail,
    );
    final phoneCtrl = TextEditingController(text: c.clientPhone);

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'share_payment_link'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${'campaign'.tr}: ${c.title} (${c.code})',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
              const SizedBox(height: 16),
              Text(
                'recipient_email'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: emailCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'name@company.com',
                  hintStyle: const TextStyle(color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF6366F1)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'recipient_phone'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: '+91 98765 43210',
                  hintStyle: const TextStyle(color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF6366F1)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF94A3B8))),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () async {
                      final email = emailCtrl.text.trim();
                      final phone = phoneCtrl.text.trim();
                      if (email.isEmpty && phone.isEmpty) {
                        Get.snackbar(
                          'error'.tr,
                          'enter_email_or_phone'.tr,
                          backgroundColor: const Color(0xFFEF4444),
                          colorText: Colors.white,
                          snackPosition: SnackPosition.BOTTOM,
                        );
                        return;
                      }
                      Get.back();
                      try {
                        final res = await FinanceService.to.shareCampaignPaymentLink(
                          c.id,
                          {
                            if (email.isNotEmpty) 'email': email,
                            if (phone.isNotEmpty) 'phone': phone,
                          },
                        );
                        if (res.success) {
                          Get.snackbar(
                            'success'.tr,
                            'payment_link_shared_success'.tr,
                            backgroundColor: const Color(0xFF10B981),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        } else {
                          Get.snackbar(
                            'error'.tr,
                            (res.message != null && res.message!.isNotEmpty)
                                ? res.message!
                                : 'failed_to_send_link'.tr,
                            backgroundColor: const Color(0xFFEF4444),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        }
                      } catch (e) {
                        Get.snackbar(
                          'error'.tr,
                          e.toString(),
                          backgroundColor: const Color(0xFFEF4444),
                          colorText: Colors.white,
                          snackPosition: SnackPosition.BOTTOM,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    child: Text('send_payment_link'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void openRecordPaymentModal() {
    final c = campaign.value;
    if (c == null) return;

    final methodRx = 'bank_transfer'.obs;
    final refCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 440),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'record_offline_settlement'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '${'total_payable'.tr}: ₹${c.totalPayable.toStringAsFixed(2)}',
                style: const TextStyle(color: Color(0xFF10B981), fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                'settlement_method'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: methodRx.value,
                        dropdownColor: const Color(0xFF1E293B),
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8)),
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        items: [
                          DropdownMenuItem(value: 'bank_transfer', child: Text('bank_transfer_neft'.tr)),
                          DropdownMenuItem(value: 'upi', child: Text('upi_direct'.tr)),
                          DropdownMenuItem(value: 'cheque', child: Text('cheque_dd'.tr)),
                          DropdownMenuItem(value: 'cash', child: Text('cash'.tr)),
                          DropdownMenuItem(value: 'pos', child: Text('pos_card_swipe'.tr)),
                        ],
                        onChanged: (val) {
                          if (val != null) methodRx.value = val;
                        },
                      ),
                    ),
                  )),
              const SizedBox(height: 12),
              Text(
                'utr_transaction_ref'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: refCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'e.g. UTR1234567890 / CHQ-8899',
                  hintStyle: const TextStyle(color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF10B981)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'reconciliation_notes'.tr,
                style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: notesCtrl,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'notes_placeholder'.tr,
                  hintStyle: const TextStyle(color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF334155)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF10B981)),
                  ),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('cancel'.tr, style: const TextStyle(color: Color(0xFF94A3B8))),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () async {
                      final ref = refCtrl.text.trim();
                      if (ref.isEmpty) {
                        Get.snackbar(
                          'error'.tr,
                          'enter_transaction_ref'.tr,
                          backgroundColor: const Color(0xFFEF4444),
                          colorText: Colors.white,
                          snackPosition: SnackPosition.BOTTOM,
                        );
                        return;
                      }
                      Get.back();
                      try {
                        final res = await FinanceService.to.recordManualCampaignPayment(
                          c.id,
                          {
                            'method': methodRx.value,
                            'reference': ref,
                            'gateway_ref': ref,
                            'amount': c.totalPayable,
                            'paid_at': DateTime.now().toIso8601String(),
                            if (notesCtrl.text.trim().isNotEmpty) 'notes': notesCtrl.text.trim(),
                          },
                        );
                        if (res.success) {
                          Get.snackbar(
                            'success'.tr,
                            'payment_recorded_success'.tr,
                            backgroundColor: const Color(0xFF10B981),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                          await refreshDetails();
                        } else {
                          Get.snackbar(
                            'error'.tr,
                            (res.message != null && res.message!.isNotEmpty)
                                ? res.message!
                                : 'failed_to_record_payment'.tr,
                            backgroundColor: const Color(0xFFEF4444),
                            colorText: Colors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        }
                      } catch (e) {
                        Get.snackbar(
                          'error'.tr,
                          e.toString(),
                          backgroundColor: const Color(0xFFEF4444),
                          colorText: Colors.white,
                          snackPosition: SnackPosition.BOTTOM,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    child: Text('confirm_and_settle'.tr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
