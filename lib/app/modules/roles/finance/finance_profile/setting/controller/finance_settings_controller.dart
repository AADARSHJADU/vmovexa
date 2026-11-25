import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import '../model/finance_settings_model.dart';

class FinanceSettingsController extends GetxController {
  final ImagePicker _picker = ImagePicker();

  // Active Tab Index (0: Corporate Info, 1: Bank Account, 2: Terms & Logo, 3: Signatory Profile)
  final RxInt activeTabIndex = 0.obs;

  // Loading States
  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  final RxBool isUploadingLogo = false.obs;
  final RxBool isUploadingSignature = false.obs;
  final RxBool isUploadingSeal = false.obs;

  // Tab 1: Corporate Info
  final TextEditingController companyNameController = TextEditingController();
  final TextEditingController tradeNameController = TextEditingController();
  final TextEditingController gstinController = TextEditingController();
  final TextEditingController panController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController websiteController = TextEditingController();
  final TextEditingController addressController = TextEditingController();

  // Tab 2: Bank Account
  final TextEditingController bankNameController = TextEditingController();
  final TextEditingController accountNameController = TextEditingController();
  final TextEditingController accountNumberController = TextEditingController();
  final TextEditingController ifscCodeController = TextEditingController();
  final TextEditingController branchController = TextEditingController();
  final TextEditingController upiIdController = TextEditingController();

  // Tab 3: Terms & Logo
  final TextEditingController logoUrlController = TextEditingController();
  final TextEditingController termsAndConditionsController = TextEditingController();
  final TextEditingController footerNoteController = TextEditingController();
  final RxString logoUrl = ''.obs;

  // Tab 4: Signatory Profile
  final TextEditingController signatoryNameController = TextEditingController();
  final TextEditingController signatoryDesignationController = TextEditingController();
  final TextEditingController signatoryEmpIdController = TextEditingController();
  final TextEditingController signatoryEmailController = TextEditingController();
  final TextEditingController signatoryPhoneController = TextEditingController();
  final RxString signatorySignatureUrl = ''.obs;
  final RxString signatorySealUrl = ''.obs;

  @override
  void onInit() {
    super.onInit();
    loadSettings();
  }

  @override
  void onClose() {
    companyNameController.dispose();
    tradeNameController.dispose();
    gstinController.dispose();
    panController.dispose();
    emailController.dispose();
    phoneController.dispose();
    websiteController.dispose();
    addressController.dispose();

    bankNameController.dispose();
    accountNameController.dispose();
    accountNumberController.dispose();
    ifscCodeController.dispose();
    branchController.dispose();
    upiIdController.dispose();

    logoUrlController.dispose();
    termsAndConditionsController.dispose();
    footerNoteController.dispose();

    signatoryNameController.dispose();
    signatoryDesignationController.dispose();
    signatoryEmpIdController.dispose();
    signatoryEmailController.dispose();
    signatoryPhoneController.dispose();
    super.onClose();
  }

  // ==========================================
  // API: Load Settings
  // ==========================================
  Future<void> loadSettings() async {
    isLoading.value = true;
    try {
      final res = await FinanceService.to.getSettings();
      FinanceSettingsModel model;
      if (res.success && res.data != null && res.data!.isNotEmpty) {
        model = FinanceSettingsModel.fromJson(res.data!);
      } else {
        model = FinanceSettingsModel.defaults();
      }
      _populateFromModel(model);
    } catch (_) {
      _populateFromModel(FinanceSettingsModel.defaults());
    } finally {
      isLoading.value = false;
    }
  }

  void _populateFromModel(FinanceSettingsModel m) {
    companyNameController.text = m.companyName;
    tradeNameController.text = m.tradeName;
    gstinController.text = m.gstin;
    panController.text = m.pan;
    emailController.text = m.email;
    phoneController.text = m.phone;
    websiteController.text = m.website;
    addressController.text = m.address;

    bankNameController.text = m.bankName;
    accountNameController.text = m.accountName;
    accountNumberController.text = m.accountNumber;
    ifscCodeController.text = m.ifscCode;
    branchController.text = m.branch;
    upiIdController.text = m.upiId;

    logoUrlController.text = m.logoUrl;
    logoUrl.value = m.logoUrl;
    termsAndConditionsController.text = m.termsAndConditions;
    footerNoteController.text = m.footerNote;

    signatoryNameController.text = m.signatoryName;
    signatoryDesignationController.text = m.signatoryDesignation;
    signatoryEmpIdController.text = m.signatoryEmpId;
    signatoryEmailController.text = m.signatoryEmail;
    signatoryPhoneController.text = m.signatoryPhone;
    signatorySignatureUrl.value = m.signatorySignatureUrl;
    signatorySealUrl.value = m.signatorySealUrl;
  }

  // ==========================================
  // Image Upload: Logo
  // ==========================================
  Future<void> pickAndUploadLogo() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null) {
        return;
      }

      isUploadingLogo.value = true;
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'branding',
      );

      if (res.success && res.data != null) {
        final url = (res.data!['url'] ?? res.data!['file_url'] ?? res.data!['path'] ?? '').toString();
        if (url.isNotEmpty) {
          logoUrl.value = url;
          logoUrlController.text = url;
          await FinanceService.to.updateSettings({'logoUrl': url});
          Get.snackbar(
            'invoice_branding'.tr,
            'logo_updated_success'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        }
      } else {
        Get.snackbar(
          'invoice_branding'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'upload_failed_err'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'invoice_branding'.tr,
        'upload_failed_err'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingLogo.value = false;
    }
  }

  Future<void> removeLogo() async {
    logoUrl.value = '';
    logoUrlController.text = '';
    try {
      await FinanceService.to.updateSettings({'logoUrl': ''});
    } catch (_) {}
  }

  // ==========================================
  // Image Upload: Signature
  // ==========================================
  Future<void> pickAndUploadSignature() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null) {
        return;
      }

      isUploadingSignature.value = true;
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'signatures',
      );

      if (res.success && res.data != null) {
        final url = (res.data!['url'] ?? res.data!['file_url'] ?? res.data!['path'] ?? '').toString();
        if (url.isNotEmpty) {
          signatorySignatureUrl.value = url;
          await FinanceService.to.updateSettings({'signatorySignatureUrl': url});
          Get.snackbar(
            'authorized_signer'.tr,
            'signature_updated_success'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        }
      } else {
        Get.snackbar(
          'authorized_signer'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'upload_failed_err'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'authorized_signer'.tr,
        'upload_failed_err'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingSignature.value = false;
    }
  }

  Future<void> removeSignature() async {
    signatorySignatureUrl.value = '';
    try {
      await FinanceService.to.updateSettings({'signatorySignatureUrl': ''});
    } catch (_) {}
  }

  // ==========================================
  // Image Upload: Seal / Stamp
  // ==========================================
  Future<void> pickAndUploadSeal() async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null) {
        return;
      }

      isUploadingSeal.value = true;
      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'stamps',
      );

      if (res.success && res.data != null) {
        final url = (res.data!['url'] ?? res.data!['file_url'] ?? res.data!['path'] ?? '').toString();
        if (url.isNotEmpty) {
          signatorySealUrl.value = url;
          await FinanceService.to.updateSettings({'signatorySealUrl': url});
          Get.snackbar(
            'authorized_signer'.tr,
            'seal_updated_success'.tr,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        }
      } else {
        Get.snackbar(
          'authorized_signer'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'upload_failed_err'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'authorized_signer'.tr,
        'upload_failed_err'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isUploadingSeal.value = false;
    }
  }

  Future<void> removeSeal() async {
    signatorySealUrl.value = '';
    try {
      await FinanceService.to.updateSettings({'signatorySealUrl': ''});
    } catch (_) {}
  }

  // ==========================================
  // API: Save Settings & Update Invoices
  // ==========================================
  Future<void> saveSettings() async {
    isSaving.value = true;
    try {
      final payload = {
        'companyName': companyNameController.text.trim(),
        'tradeName': tradeNameController.text.trim(),
        'gstin': gstinController.text.trim().toUpperCase(),
        'pan': panController.text.trim().toUpperCase(),
        'email': emailController.text.trim(),
        'phone': phoneController.text.trim(),
        'website': websiteController.text.trim(),
        'address': addressController.text.trim(),
        'bankName': bankNameController.text.trim(),
        'accountName': accountNameController.text.trim(),
        'accountNumber': accountNumberController.text.trim(),
        'ifscCode': ifscCodeController.text.trim().toUpperCase(),
        'branch': branchController.text.trim(),
        'upiId': upiIdController.text.trim(),
        'logoUrl': logoUrlController.text.trim().isNotEmpty
            ? logoUrlController.text.trim()
            : logoUrl.value,
        'termsAndConditions': termsAndConditionsController.text.trim(),
        'footerNote': footerNoteController.text.trim(),
        'signatoryName': signatoryNameController.text.trim(),
        'signatoryDesignation': signatoryDesignationController.text.trim(),
        'signatoryEmpId': signatoryEmpIdController.text.trim(),
        'signatoryEmail': signatoryEmailController.text.trim(),
        'signatoryPhone': signatoryPhoneController.text.trim(),
        'signatorySignatureUrl': signatorySignatureUrl.value,
        'signatorySealUrl': signatorySealUrl.value,
      };

      final res = await FinanceService.to.updateSettings(payload);
      if (res.success) {
        Get.snackbar(
          'finance_settings'.tr,
          'settings_saved_success'.tr,
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
        await loadSettings();
      } else {
        Get.snackbar(
          'finance_settings'.tr,
          (res.message != null && res.message!.isNotEmpty) ? res.message! : 'settings_save_failed'.tr,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {
      Get.snackbar(
        'finance_settings'.tr,
        'settings_save_failed'.tr,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isSaving.value = false;
    }
  }

  void onBackPressed() {
    Get.back();
  }
}
