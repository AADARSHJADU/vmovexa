import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

import '../../model/profile_settings_models.dart';

class FinanceProfileController extends GetxController {
  // ---------------- Identity (from session user) ----------------
  final RxString fullName = 'Finance Officer'.obs;
  final RxString roleLabel = 'FINANCE OFFICER'.obs;
  final RxString email = ''.obs;
  final RxString phone = ''.obs;
  final RxString initials = 'F'.obs;
  final RxString orgName = 'VMOVEXA Private Limited'.obs;
  final RxString financeId = 'FIN-101'.obs;

  // ---------------- 3 Core Stat Pills (from real KPIs API) ----------------
  final RxString totalRevenue = '₹0'.obs;
  final RxString invoiceCount = '0'.obs;
  final RxString settledCount = '₹0'.obs;

  // ---------------- Corporate Bank & Tax Settings (from real Settings API) ----------------
  final RxString bankName = ''.obs;
  final RxString accountNumber = ''.obs;
  final RxString ifscCode = ''.obs;
  final RxString gstin = ''.obs;
  final RxString panNumber = ''.obs;
  final RxString corporateAddress = ''.obs;

  final RxList<ProfileDetailRow> profileDetails = <ProfileDetailRow>[].obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserFromStorage();
    fetchProfileData();
  }

  void _loadUserFromStorage() {
    try {
      if (Get.isRegistered<StorageService>()) {
        final user = StorageService.to.getUser();
        if (user != null) {
          final uName = user.name ?? '';
          final uEmail = user.email ?? '';
          final uPhone = user.phone ?? '';
          if (uName.isNotEmpty) {
            fullName.value = uName;
            initials.value = uName[0].toUpperCase();
          }
          if (uEmail.isNotEmpty) email.value = uEmail;
          if (uPhone.isNotEmpty) phone.value = uPhone;
          final dRole = user.displayRole;
          if (dRole.isNotEmpty) roleLabel.value = dRole;
          if (user.id != null) financeId.value = 'FIN-${user.id}';
        }
      }
    } catch (_) {}
  }

  Future<void> fetchProfileData() async {
    isLoading.value = true;
    try {
      // 1. Fetch real KPIs for stats pill row
      final kpiRes = await FinanceService.to.getKpis();
      if (kpiRes.success && kpiRes.data != null) {
        // final rev = double.tryParse((data['total_revenue'] ?? data['totalRevenue'] ?? data['total_revenue_ytd'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        // final inv = double.tryParse((data['total_invoices'] ?? data['totalInvoices'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        // final pay = double.tryParse((data['total_payments'] ?? data['totalPayments'] ?? 0).toString().replaceAll(',', '')) ?? 0.0;
        //
        // totalRevenue.value = _formatCurrency(rev);
        // invoiceCount.value = inv.toInt().toString();
        // settledCount.value = _formatCurrency(pay);
      }

      // 2. Fetch real Corporate Settings
      final settingsRes = await FinanceService.to.getSettings();
      if (settingsRes.success && settingsRes.data != null) {
        final s = settingsRes.data!;
        bankName.value = (s['bank_name'] ?? s['bankName'] ?? '').toString();
        accountNumber.value = (s['account_number'] ?? s['accountNumber'] ?? '').toString();
        ifscCode.value = (s['ifsc_code'] ?? s['ifscCode'] ?? '').toString();
        gstin.value = (s['gstin'] ?? '').toString();
        panNumber.value = (s['pan_number'] ?? s['pan'] ?? '').toString();
        corporateAddress.value = (s['corporate_address'] ?? s['registered_address'] ?? '').toString();
        if (s['company_name'] != null && s['company_name'].toString().isNotEmpty) {
          orgName.value = s['company_name'].toString();
        }
      }

      _buildProfileRows();
    } catch (_) {
      _buildProfileRows();
    } finally {
      isLoading.value = false;
    }
  }

  void _buildProfileRows() {
    profileDetails.assignAll([
      ProfileDetailRow(
        id: 'full_name',
        icon: Icons.person_outline,
        label: 'Officer Name',
        value: fullName.value.isNotEmpty ? fullName.value : '—',
      ),
      ProfileDetailRow(
        id: 'email',
        icon: Icons.mail_outline,
        label: 'Email Address',
        value: email.value.isNotEmpty ? email.value : '—',
      ),
      ProfileDetailRow(
        id: 'mobile',
        icon: Icons.call_outlined,
        label: 'Mobile Number',
        value: phone.value.isNotEmpty ? phone.value : '—',
      ),
      ProfileDetailRow(
        id: 'role',
        icon: Icons.badge_outlined,
        label: 'Role Designation',
        value: roleLabel.value,
      ),
      ProfileDetailRow(
        id: 'gstin',
        icon: Icons.receipt_long_outlined,
        label: 'Corporate GSTIN',
        value: gstin.value.isNotEmpty ? gstin.value : 'Not Configured',
      ),
      ProfileDetailRow(
        id: 'bank',
        icon: Icons.account_balance_outlined,
        label: 'Primary Bank Account',
        value: bankName.value.isNotEmpty
            ? '${bankName.value} (A/C: ${accountNumber.value})'
            : 'Not Configured',
      ),
    ]);
  }

  String _formatCurrency(num amount) {
    if (amount >= 10000000) {
      return '₹${(amount / 10000000).toStringAsFixed(2)} Cr';
    } else if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(2)} L';
    } else {
      return '₹${amount.toStringAsFixed(0)}';
    }
  }

  Future<void> onRefresh() async => fetchProfileData();

  // ---------------- Actions matching Admin Panel ----------------
  void onBackPressed() => Get.back();

  void onEditProfile() {
    Get.toNamed(Routes.FINANCE_SETTINGS);
  }

  void onCorporateSettingsTap() {
    Get.toNamed(Routes.FINANCE_SETTINGS);
  }

  void onSecurityTap() {
    Get.toNamed(Routes.CHANGE_PASSWORD);
  }

  void onNotificationSettingsTap() {
    Get.toNamed(Routes.FINANCE_NOTIFICATION_SETTINGS);
  }

  void onHelpSupportTap() {
    Get.toNamed(Routes.FINANCE_HELP_SUPPORT);
  }

  void onPrivacyPolicyTap() {
    Get.toNamed(Routes.PRIVACY_POLICY);
  }

  void onTermsTap() {
    Get.toNamed(Routes.TERMS_CONDITIONS);
  }

  void onLogout() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        title: const Text(
          'Log Out',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'Are you sure you want to log out from the Finance Officer portal?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              try {
                await AuthService.to.logout();
              } catch (_) {}
              Get.offAllNamed(Routes.LOGIN);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: const Text(
              'Log Out',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
