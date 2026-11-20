import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/campaign_model.dart';
import 'package:vmovexa/app/data/services/advertiser_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../campaign_details/controllers/campaign_details_controller.dart';

class PaymentMethodItem {
  final String id;
  final String label;
  final String desc;
  final IconData icon;
  final Color color;

  const PaymentMethodItem({
    required this.id,
    required this.label,
    required this.desc,
    required this.icon,
    required this.color,
  });
}

class RecordOfflinePaymentController extends GetxController {
  final Rx<CampaignModel?> campaign = Rx<CampaignModel?>(null);
  final RxBool isLoadingCampaign = false.obs;
  final RxBool isSubmitting = false.obs;
  final RxBool isUploadingFile = false.obs;

  // Selected payment method (default 'cheque' matching Admin panel)
  final RxString selectedMethod = 'cheque'.obs;

  // 9 Supported Payment Instruments matching Admin Panel
  final List<PaymentMethodItem> paymentMethods = const [
    PaymentMethodItem(
      id: 'cheque',
      label: 'Cheque',
      desc: 'Bank clearance instrument',
      icon: Icons.receipt_long_rounded,
      color: Color(0xFF3B82F6),
    ),
    PaymentMethodItem(
      id: 'demand_draft',
      label: 'Demand Draft',
      desc: 'Prepaid bank draft (DD)',
      icon: Icons.request_quote_rounded,
      color: Color(0xFF8B5CF6),
    ),
    PaymentMethodItem(
      id: 'neft',
      label: 'NEFT',
      desc: 'National Electronic Fund Transfer',
      icon: Icons.sync_alt_rounded,
      color: Color(0xFF14B8A6),
    ),
    PaymentMethodItem(
      id: 'rtgs',
      label: 'RTGS',
      desc: 'Real-Time Gross Settlement',
      icon: Icons.flash_on_rounded,
      color: Color(0xFFF59E0B),
    ),
    PaymentMethodItem(
      id: 'imps',
      label: 'IMPS',
      desc: 'Instant mobile/bank payment',
      icon: Icons.send_to_mobile_rounded,
      color: Color(0xFFEC4899),
    ),
    PaymentMethodItem(
      id: 'upi_manual',
      label: 'UPI / QR',
      desc: 'Manual UPI / QR settlement',
      icon: Icons.qr_code_2_rounded,
      color: Color(0xFF6366F1),
    ),
    PaymentMethodItem(
      id: 'bank_transfer',
      label: 'Bank Transfer',
      desc: 'Direct wire / account deposit',
      icon: Icons.account_balance_rounded,
      color: Color(0xFF0284C7),
    ),
    PaymentMethodItem(
      id: 'cash',
      label: 'Cash',
      desc: 'Direct cash collection at office',
      icon: Icons.payments_rounded,
      color: Color(0xFF10B981),
    ),
    PaymentMethodItem(
      id: 'other',
      label: 'Sanction / Treasury',
      desc: 'Dept order / Govt sanction / Other',
      icon: Icons.assured_workload_rounded,
      color: Color(0xFF64748B),
    ),
  ];

  // Dynamic Form Controllers
  final chequeNumberController = TextEditingController();
  final Rx<DateTime> chequeDate = Rx<DateTime>(DateTime.now());
  final bankNameController = TextEditingController();
  final branchNameController = TextEditingController();
  final accountHolderController = TextEditingController();

  final utrNumberController = TextEditingController();
  final transactionIdController = TextEditingController();
  final referenceNumberController = TextEditingController();

  final Rx<DateTime> collectedAt = Rx<DateTime>(DateTime.now());
  final verifiedByNameController = TextEditingController();
  final remarksController = TextEditingController();
  final proofUrlController = TextEditingController();
  final RxString proofUrl = ''.obs;
  final Rxn<String> uploadedProofLocalPath = Rxn<String>();
  final Rxn<String> uploadedProofFileName = Rxn<String>();

  void clearProofAttachment() {
    proofUrlController.clear();
    proofUrl.value = '';
    uploadedProofLocalPath.value = null;
    uploadedProofFileName.value = null;
  }

  final ImagePicker _picker = ImagePicker();
  AdvertiserService get _service => AdvertiserService.to;

  // Financial Breakdown calculations
  double get baseBudget {
    final c = campaign.value;
    if (c == null) return 0.0;
    final pb = c.paymentBreakdown;
    if (pb != null && pb['baseAmount'] != null) {
      return double.tryParse(pb['baseAmount'].toString()) ?? (c.rawBudget ?? 0.0);
    }
    return c.rawBudget ?? 0.0;
  }

  double get gstAmount {
    final c = campaign.value;
    if (c == null) return 0.0;
    final pb = c.paymentBreakdown;
    if (pb != null && pb['gstAmount'] != null) {
      return double.tryParse(pb['gstAmount'].toString()) ?? (baseBudget * 0.18).roundToDouble();
    }
    return (baseBudget * 0.18).roundToDouble();
  }

  double get totalAmount {
    final c = campaign.value;
    if (c == null) return 0.0;
    final pb = c.paymentBreakdown;
    if (pb != null && pb['totalAmount'] != null) {
      return double.tryParse(pb['totalAmount'].toString()) ?? (baseBudget + gstAmount);
    }
    return baseBudget + gstAmount;
  }

  @override
  void onInit() {
    super.onInit();
    final dynamic arg = Get.arguments;
    if (arg is CampaignModel) {
      campaign.value = arg;
      _initFromCampaign(arg);
    } else if (arg is String) {
      _loadCampaignById(arg);
    } else if (arg is Map && arg['campaign'] is CampaignModel) {
      campaign.value = arg['campaign'] as CampaignModel;
      _initFromCampaign(campaign.value!);
    } else if (arg is Map && arg['id'] != null) {
      _loadCampaignById(arg['id'].toString());
    }

    // Default logged in user name
    try {
      final user = StorageService.to.getUser();
      if (user != null) {
        verifiedByNameController.text = (user.name != null && user.name!.isNotEmpty)
            ? user.name!
            : (user.organizationName ?? 'VMOVEXA Staff');
      }
    } catch (_) {}

    proofUrlController.addListener(() {
      proofUrl.value = proofUrlController.text.trim();
    });
  }

  void _initFromCampaign(CampaignModel c) {
    if (c.clientCompany != null && c.clientCompany!.isNotEmpty) {
      accountHolderController.text = c.clientCompany!;
    } else if (c.clientName != null && c.clientName!.isNotEmpty) {
      accountHolderController.text = c.clientName!;
    }
  }

  Future<void> _loadCampaignById(String id) async {
    isLoadingCampaign.value = true;
    try {
      final res = await _service.getCampaignById(id);
      if (res.success && res.data != null) {
        campaign.value = res.data;
        _initFromCampaign(res.data!);
      }
    } catch (_) {
    } finally {
      isLoadingCampaign.value = false;
    }
  }

  void selectMethod(String methodId) {
    selectedMethod.value = methodId;
  }

  bool get isChequeOrDD => selectedMethod.value == 'cheque' || selectedMethod.value == 'demand_draft';
  bool get isBankTransfer =>
      selectedMethod.value == 'neft' ||
      selectedMethod.value == 'rtgs' ||
      selectedMethod.value == 'imps' ||
      selectedMethod.value == 'bank_transfer';
  bool get isUpi => selectedMethod.value == 'upi_manual';
  bool get isSanction => selectedMethod.value == 'other';
  bool get isCash => selectedMethod.value == 'cash';

  Future<void> pickAndUploadProof() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null) return;

      uploadedProofLocalPath.value = file.path;
      uploadedProofFileName.value = file.name;

      isUploadingFile.value = true;
      Get.snackbar(
        'choose_file_btn'.tr,
        'uploading_status'.tr,
        backgroundColor: const Color(0xFF3B82F6),
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
      );

      final res = await _service.uploadCreativeFile(file.path);
      if (res.success && res.data != null) {
        final url = res.data!['url'] ?? res.data!['file_url'] ?? res.data!['fileUrl'] ?? '';
        if (url.toString().isNotEmpty) {
          proofUrlController.text = url.toString();
          proofUrl.value = url.toString();
          Get.snackbar(
            'success_title'.tr,
            'attachment_uploaded_success'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      } else {
        Get.snackbar(
          'alert_title'.tr,
          res.message ?? 'File upload failed',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error_title'.tr,
        'Upload error: $e',
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingFile.value = false;
    }
  }

  Future<void> submitOfflinePayment() async {
    if (isSubmitting.value) return;

    final c = campaign.value;
    if (c == null) {
      Get.snackbar('alert_title'.tr, 'no_campaign_selected_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }

    if (totalAmount <= 0) {
      Get.snackbar('alert_title'.tr, 'total_budget_positive_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }

    // Validation matching Admin Panel
    if (isChequeOrDD) {
      if (chequeNumberController.text.trim().isEmpty && referenceNumberController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'cheque_dd_required_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
      if (bankNameController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'bank_name_required_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
    }

    if (isBankTransfer) {
      if (utrNumberController.text.trim().isEmpty &&
          referenceNumberController.text.trim().isEmpty &&
          transactionIdController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'utr_required_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
    }

    if (isUpi) {
      if (transactionIdController.text.trim().isEmpty && referenceNumberController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'upi_tx_id_required_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
    }

    if (isSanction) {
      if (referenceNumberController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'sanction_required_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
    }

    if (isCash) {
      if (referenceNumberController.text.trim().isEmpty) {
        Get.snackbar('alert_title'.tr, 'cash_voucher_required_err'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
        return;
      }
    }

    if (verifiedByNameController.text.trim().isEmpty) {
      Get.snackbar('alert_title'.tr, 'verified_by_required_msg'.tr, backgroundColor: const Color(0xFFEF4444), colorText: Colors.white);
      return;
    }

    isSubmitting.value = true;
    try {
      final payload = <String, dynamic>{
        'amount': totalAmount,
        'offlineMethod': selectedMethod.value,
        'referenceNumber': referenceNumberController.text.trim().isNotEmpty
            ? referenceNumberController.text.trim()
            : (utrNumberController.text.trim().isNotEmpty
                ? utrNumberController.text.trim()
                : (chequeNumberController.text.trim().isNotEmpty
                    ? chequeNumberController.text.trim()
                    : (transactionIdController.text.trim().isNotEmpty
                        ? transactionIdController.text.trim()
                        : null))),
        'bankName': bankNameController.text.trim().isNotEmpty ? bankNameController.text.trim() : null,
        'branchName': branchNameController.text.trim().isNotEmpty ? branchNameController.text.trim() : null,
        'accountHolder': accountHolderController.text.trim().isNotEmpty ? accountHolderController.text.trim() : null,
        'chequeNumber': chequeNumberController.text.trim().isNotEmpty ? chequeNumberController.text.trim() : null,
        'chequeDate': isChequeOrDD ? DateFormat('yyyy-MM-dd').format(chequeDate.value) : null,
        'utrNumber': utrNumberController.text.trim().isNotEmpty ? utrNumberController.text.trim() : null,
        'transactionId': transactionIdController.text.trim().isNotEmpty ? transactionIdController.text.trim() : null,
        'remarks': remarksController.text.trim().isNotEmpty ? remarksController.text.trim() : null,
        'proofUrl': proofUrlController.text.trim().isNotEmpty ? proofUrlController.text.trim() : null,
        'collectedAt': collectedAt.value.toIso8601String(),
        'verifiedByName': verifiedByNameController.text.trim().isNotEmpty ? verifiedByNameController.text.trim() : null,
        'currency': 'INR',
      };

      final res = await _service.recordOfflinePayment(c.id, payload);
      if (res.success) {
        // 1. Refresh campaign details controller if already in memory
        if (Get.isRegistered<CampaignDetailsController>()) {
          Get.find<CampaignDetailsController>().refreshCampaignDetails();
        }

        // 2. Safely pop back to Campaign Details
        if (Get.context != null && Navigator.of(Get.context!).canPop()) {
          Navigator.of(Get.context!).pop(true);
        } else {
          Get.offNamed(Routes.CAMPAIGN_DETAILS, arguments: c);
        }

        // 3. Show success snackbar on the destination screen
        Get.snackbar(
          'success_title'.tr,
          'payment_recorded_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );
      } else {
        Get.snackbar(
          'alert_title'.tr,
          res.message ?? 'failed_to_record_payment'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          duration: const Duration(seconds: 4),
        );
      }
    } catch (e) {
      Get.snackbar(
        'error_title'.tr,
        'failed_to_record_payment'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    chequeNumberController.dispose();
    bankNameController.dispose();
    branchNameController.dispose();
    accountHolderController.dispose();
    utrNumberController.dispose();
    transactionIdController.dispose();
    referenceNumberController.dispose();
    verifiedByNameController.dispose();
    remarksController.dispose();
    proofUrlController.dispose();
    super.onClose();
  }
}
