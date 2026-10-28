import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/api_response_model.dart';
import 'package:vmovexa/app/data/services/auth_service.dart';
import 'package:vmovexa/app/data/services/finance_service.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/modules/roles/finance/home/controller/finance_home_controller.dart';
import 'package:vmovexa/app/routes/app_routes.dart';

class FinanceProfileController extends GetxController {
  // ---------------- Identity (from session user & GET /auth/me) ----------------
  final RxString fullName = 'Finance Officer'.obs;
  final RxString roleLabel = 'FINANCE OFFICER'.obs;
  final RxString email = ''.obs;
  final RxString phone = ''.obs;
  final RxString initials = 'F'.obs;
  final RxString orgName = 'VMOVEXA Private Limited'.obs;
  final RxString financeId = 'FIN-101'.obs;
  final RxString avatarUrl = ''.obs;
  final RxBool isUploadingAvatar = false.obs;

  // ---------------- 3 Core Stat Pills (from real GET /finance/kpis API) ----------------
  final RxString totalRevenue = '₹0'.obs;
  final RxString invoiceCount = '0'.obs;
  final RxString settledCount = '₹0'.obs;

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
          _applyUserData(
            name: user.name,
            uEmail: user.email,
            uPhone: user.phone,
            role: user.displayRole,
            company: user.companyName ?? user.organization?.name,
            id: user.enrollmentNo ?? user.code ?? (user.id != null ? 'FIN-${user.id}' : null),
            avatar: user.avatarUrl,
          );
        }
      }
      // Instant seed from Dashboard if already loaded
      if (Get.isRegistered<FinanceHomeController>()) {
        final home = Get.find<FinanceHomeController>();
        if (home.totalRevenueStr.value.isNotEmpty && home.totalRevenueStr.value != '₹0') {
          totalRevenue.value = home.totalRevenueStr.value;
        }
        if (home.totalInvoicesStr.value.isNotEmpty && home.totalInvoicesStr.value != '0') {
          invoiceCount.value = home.totalInvoicesStr.value;
        }
        if (home.totalPaymentsStr.value.isNotEmpty && home.totalPaymentsStr.value != '₹0') {
          settledCount.value = home.totalPaymentsStr.value;
        }
      }
    } catch (_) {}
  }

  void _applyUserData({
    String? name,
    String? uEmail,
    String? uPhone,
    String? role,
    String? company,
    String? id,
    String? avatar,
  }) {
    if (name != null && name.isNotEmpty) {
      fullName.value = name;
      initials.value = name[0].toUpperCase();
    }
    if (uEmail != null && uEmail.isNotEmpty) email.value = uEmail;
    if (uPhone != null && uPhone.isNotEmpty) phone.value = uPhone;
    if (role != null && role.isNotEmpty) roleLabel.value = role;
    if (company != null && company.isNotEmpty) orgName.value = company;
    if (id != null && id.isNotEmpty) financeId.value = id;
    if (avatar != null) avatarUrl.value = avatar;
  }

  Future<void> fetchProfileData() async {
    isLoading.value = true;
    try {
      // 1. Fetch live profile via GET /auth/me
      if (Get.isRegistered<AuthService>()) {
        final meRes = await AuthService.to.getMe();
        if (meRes.success && meRes.data != null) {
          final u = meRes.data!;
          _applyUserData(
            name: u.name,
            uEmail: u.email,
            uPhone: u.phone,
            role: u.displayRole,
            company: u.companyName ?? u.organization?.name,
            id: u.enrollmentNo ?? u.code ?? (u.id != null ? 'FIN-${u.id}' : null),
            avatar: u.avatarUrl,
          );
        }
      }

      // 2. Fetch KPIs, Invoices, and Payments in parallel - EXACTLY mirroring Admin Panel useFinanceRole
      // (Admin: loadKpis, loadInvoices, loadPayments in FinanceProfilePage.jsx)
      Map<String, dynamic> kpiData = {};
      List<dynamic> invoicesList = [];
      List<dynamic> paymentsList = [];

      try {
        final results = await Future.wait([
          FinanceService.to.getKpis().catchError((_) => ApiResponseModel<Map<String, dynamic>>.failure(message: '')),
          FinanceService.to.getInvoices(limit: 50).catchError((_) => ApiResponseModel<dynamic>.failure(message: '')),
          FinanceService.to.getPayments(limit: 50).catchError((_) => ApiResponseModel<dynamic>.failure(message: '')),
        ]);

        final kpiRes = results[0] as ApiResponseModel<Map<String, dynamic>>;
        final invRes = results[1];
        final payRes = results[2];

        // Unpack KPIs (supports nested maps like 'kpis', 'summary', or 'data')
        if (kpiRes.success && kpiRes.data != null) {
          final raw = kpiRes.data!;
          if (raw['kpis'] is Map) {
            kpiData = Map<String, dynamic>.from(raw['kpis'] as Map);
          } else if (raw['data'] is Map) {
            kpiData = Map<String, dynamic>.from(raw['data'] as Map);
          } else if (raw['summary'] is Map) {
            kpiData = Map<String, dynamic>.from(raw['summary'] as Map);
          } else {
            kpiData = raw;
          }
        }

        // Unpack Invoices
        if (invRes.success && invRes.data != null) {
          dynamic items = invRes.data;
          if (items is Map && items['rows'] is List) {
            invoicesList = items['rows'] as List;
          } else if (items is Map && items['items'] is List) {
            invoicesList = items['items'] as List;
          } else if (items is Map && items['invoices'] is List) {
            invoicesList = items['invoices'] as List;
          } else if (items is List) {
            invoicesList = items;
          }
        }

        // Unpack Payments
        if (payRes.success && payRes.data != null) {
          dynamic items = payRes.data;
          if (items is Map && items['rows'] is List) {
            paymentsList = items['rows'] as List;
          } else if (items is Map && items['items'] is List) {
            paymentsList = items['items'] as List;
          } else if (items is Map && items['payments'] is List) {
            paymentsList = items['payments'] as List;
          } else if (items is List) {
            paymentsList = items;
          }
        }
      } catch (e) {
        debugPrint('Error loading finance metrics: $e');
      }

      // -------------------------------------------------------------
      // 1. REVENUE (Admin: kpis?.totalRevenue != null ? `₹${Number(kpis.totalRevenue).toLocaleString('en-IN')}` : '—')
      // -------------------------------------------------------------
      dynamic rawRev = kpiData['totalRevenue'] ??
          kpiData['total_revenue'] ??
          kpiData['total_revenue_ytd'] ??
          kpiData['revenue'] ??
          kpiData['revenue_this_month'];

      double? parsedRev = rawRev != null
          ? double.tryParse(rawRev.toString().replaceAll(',', '').replaceAll('₹', '').trim())
          : null;

      if (parsedRev != null && parsedRev > 0) {
        totalRevenue.value = _formatIndianCurrency(parsedRev);
      } else {
        // Fallback: calculate from paid payments or invoices
        double calculatedRev = 0;
        for (final p in paymentsList) {
          if (p is Map) {
            final amt = double.tryParse((p['amount'] ?? p['total'] ?? p['paid_amount'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
            calculatedRev += amt;
          }
        }
        if (calculatedRev > 0) {
          totalRevenue.value = _formatIndianCurrency(calculatedRev);
        } else if (parsedRev != null) {
          totalRevenue.value = _formatIndianCurrency(parsedRev);
        } else if (Get.isRegistered<FinanceHomeController>() &&
            Get.find<FinanceHomeController>().totalRevenueStr.value.isNotEmpty &&
            Get.find<FinanceHomeController>().totalRevenueStr.value != '₹0') {
          totalRevenue.value = Get.find<FinanceHomeController>().totalRevenueStr.value;
        } else {
          totalRevenue.value = '₹0';
        }
      }

      // -------------------------------------------------------------
      // 2. INVOICES (Admin: kpis?.totalInvoices != null ? kpis.totalInvoices : (Array.isArray(invoices) ? invoices.length : 0))
      // -------------------------------------------------------------
      dynamic rawInv = kpiData['totalInvoices'] ??
          kpiData['total_invoices'] ??
          kpiData['invoicesCount'] ??
          kpiData['invoices_count'] ??
          kpiData['active_subscriptions_count'];

      int? parsedInv = rawInv != null
          ? int.tryParse(rawInv.toString().replaceAll(',', '').trim())
          : null;

      if (parsedInv != null && parsedInv > 0) {
        invoiceCount.value = _formatIndianNumber(parsedInv);
      } else if (invoicesList.isNotEmpty) {
        invoiceCount.value = _formatIndianNumber(invoicesList.length);
      } else if (parsedInv != null) {
        invoiceCount.value = parsedInv.toString();
      } else if (Get.isRegistered<FinanceHomeController>() &&
          Get.find<FinanceHomeController>().totalInvoicesStr.value.isNotEmpty &&
          Get.find<FinanceHomeController>().totalInvoicesStr.value != '0') {
        invoiceCount.value = Get.find<FinanceHomeController>().totalInvoicesStr.value;
      } else {
        invoiceCount.value = '0';
      }

      // -------------------------------------------------------------
      // 3. SETTLED (Admin: kpis?.totalPayments != null ? `₹${Number(kpis.totalPayments).toLocaleString('en-IN')}` : (Array.isArray(payments) ? payments.length : 0))
      // -------------------------------------------------------------
      dynamic rawPay = kpiData['totalPayments'] ??
          kpiData['total_payments'] ??
          kpiData['settledPayments'] ??
          kpiData['settled_payments'] ??
          kpiData['settled_amount'] ??
          kpiData['gst_collected_this_month'];

      double? parsedPay = rawPay != null
          ? double.tryParse(rawPay.toString().replaceAll(',', '').replaceAll('₹', '').trim())
          : null;

      if (parsedPay != null && parsedPay > 0) {
        settledCount.value = _formatIndianCurrency(parsedPay);
      } else if (paymentsList.isNotEmpty) {
        double settledSum = 0;
        int settledCountNum = 0;
        for (final p in paymentsList) {
          if (p is Map) {
            final st = (p['status'] ?? p['payment_status'] ?? '').toString().toLowerCase();
            final amt = double.tryParse((p['amount'] ?? p['total'] ?? 0).toString().replaceAll(',', '').replaceAll('₹', '')) ?? 0.0;
            if (st == 'settled' || st == 'paid' || st == 'completed' || st == 'success') {
              settledSum += amt;
              settledCountNum++;
            }
          }
        }
        if (settledSum > 0) {
          settledCount.value = _formatIndianCurrency(settledSum);
        } else if (settledCountNum > 0) {
          settledCount.value = _formatIndianNumber(settledCountNum);
        } else {
          settledCount.value = _formatIndianNumber(paymentsList.length);
        }
      } else if (parsedPay != null) {
        settledCount.value = _formatIndianCurrency(parsedPay);
      } else if (Get.isRegistered<FinanceHomeController>() &&
          Get.find<FinanceHomeController>().totalPaymentsStr.value.isNotEmpty &&
          Get.find<FinanceHomeController>().totalPaymentsStr.value != '₹0') {
        settledCount.value = Get.find<FinanceHomeController>().totalPaymentsStr.value;
      } else {
        settledCount.value = '₹0';
      }
    } catch (e) {
      debugPrint('Error fetching finance profile data: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Change photo directly from Profile screen
  void changeAvatar() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF15151F),
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
          border: Border(top: BorderSide(color: Color(0x33B042FF), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Change Profile Photo',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Upload new photo from camera or gallery:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            ),
            const SizedBox(height: 18),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x26B042FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.camera_alt_rounded, color: Color(0xFFB042FF), size: 22),
              ),
              title: const Text(
                'Take Photo with Camera',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.camera);
              },
            ),
            const SizedBox(height: 8),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0x266366F1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.photo_library_rounded, color: Color(0xFF6366F1), size: 22),
              ),
              title: const Text(
                'Choose from Gallery',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
              trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF64748B), size: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Get.back();
                _pickAndUploadAvatar(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Future<void> _pickAndUploadAvatar(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      isUploadingAvatar.value = true;
      Get.snackbar(
        'Uploading Avatar',
        'Uploading image to server...',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFB042FF),
        colorText: Colors.white,
      );

      final res = await HttpClientService.to.uploadFile(
        filePath: pickedFile.path,
        purpose: 'avatar',
      );

      if (res.success && res.data != null) {
        final rawUrl = res.data!['url']?.toString() ??
            res.data!['file_url']?.toString() ??
            res.data!['avatar_url']?.toString() ??
            res.data!['path']?.toString();

        if (rawUrl != null && rawUrl.isNotEmpty) {
          avatarUrl.value = rawUrl;

          // Call PATCH /auth/me
          if (Get.isRegistered<AuthService>()) {
            await AuthService.to.updateMe({
              'avatar_url': rawUrl,
              'avatarUrl': rawUrl,
            });
          }

          Get.snackbar(
            'Success',
            'Profile picture updated successfully.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
          );
        }
      } else {
        Get.snackbar(
          'Upload Failed',
          res.message ?? 'Failed to upload photo.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Upload Error',
        'Error uploading photo: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFEF4444),
        colorText: Colors.white,
      );
    } finally {
      isUploadingAvatar.value = false;
    }
  }

  String _formatIndianCurrency(num amount) {
    try {
      final formatter = NumberFormat.currency(
        locale: 'en_IN',
        symbol: '₹',
        decimalDigits: amount % 1 == 0 ? 0 : 2,
      );
      return formatter.format(amount);
    } catch (_) {
      return '₹${amount.toStringAsFixed(0)}';
    }
  }

  String _formatIndianNumber(num number) {
    try {
      final formatter = NumberFormat('#,##,###', 'en_IN');
      return formatter.format(number);
    } catch (_) {
      return number.toInt().toString();
    }
  }
  Future<void> onRefresh() async => fetchProfileData();

  // ---------------- Navigation Actions (100% Mirroring Admin Panel) ----------------
  void onBackPressed() => Get.back();

  void onEditProfile() {
    Get.toNamed(Routes.FINANCE_EDIT_PROFILE);
  }

  void onPersonalProfileSettingsTap() {
    Get.toNamed(Routes.FINANCE_EDIT_PROFILE);
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
    Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-FINANCE-OFFICER'});
  }

  void onTermsTap() {
    Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-FINANCE-OFFICER'});
  }

  void onLogout() {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF15151F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
                if (Get.isRegistered<AuthService>()) {
                  await AuthService.to.logout();
                }
              } catch (_) {}
              Get.offAllNamed(Routes.LOGIN);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
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
