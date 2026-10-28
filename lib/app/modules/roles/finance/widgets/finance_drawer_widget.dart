import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/storage_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../finance_dashboard/controller/finance_dashboard_controller.dart';
import '../payments/controller/finance_payments_controller.dart';

class FinanceDrawerWidget extends StatelessWidget {
  const FinanceDrawerWidget({super.key});

  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kDarkBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorderColor = Color(0xFF334155);

  @override
  Widget build(BuildContext context) {
    String userName = 'Finance Officer';
    String userEmail = 'finance@vmovexa.com';
    String userRole = 'FINANCE OFFICER';
    String initial = 'F';

    try {
      if (Get.isRegistered<StorageService>()) {
        final u = StorageService.to.getUser();
        if (u != null) {
          final name = u.name ?? '';
          if (name.isNotEmpty) {
            userName = name;
            initial = name[0].toUpperCase();
          }
          final email = u.email ?? '';
          if (email.isNotEmpty) {
            userEmail = email;
          }
        }
      }
    } catch (_) {}

    return Drawer(
      backgroundColor: kDarkBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Officer Profile Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: kCardBg,
                border: Border(
                  bottom: BorderSide(color: kBorderColor, width: 1),
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: kPrimaryIndigo,
                    child: Text(
                      initial,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          userEmail,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: kPrimaryIndigo.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: kPrimaryIndigo.withValues(alpha: 0.4),
                            ),
                          ),
                          child: Text(
                            userRole,
                            style: const TextStyle(
                              color: Color(0xFF818CF8),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Menu Items (Exact Mirror of Admin Panel financeNavLinks)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12),
                children: [
                  // SECTION 1: OVERVIEW
                  _buildSectionHeader('OVERVIEW'),
                  _buildMenuItem(
                    icon: Icons.dashboard_outlined,
                    label: 'Overview Dashboard',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(0);
                    },
                  ),

                  const SizedBox(height: 12),

                  // SECTION 2: FINANCIAL MANAGEMENT
                  _buildSectionHeader('FINANCIAL MANAGEMENT'),
                  _buildMenuItem(
                    icon: Icons.domain_outlined,
                    label: 'Tenants',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(3);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.receipt_long_outlined,
                    label: 'Invoices & Billing',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(1);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.campaign_outlined,
                    label: 'Campaign Payments',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(2);
                      if (Get.isRegistered<FinancePaymentsController>()) {
                        Get.find<FinancePaymentsController>().selectedTab.value = 1;
                      }
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.payments_outlined,
                    label: 'Payments Ledger',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(2);
                      if (Get.isRegistered<FinancePaymentsController>()) {
                        Get.find<FinancePaymentsController>().selectedTab.value = 0;
                      }
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.bar_chart_outlined,
                    label: 'Revenue Reports',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.REVENUE_REPORTING);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.account_balance_outlined,
                    label: 'GST & Tax Returns',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.GST_MANAGEMENT);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.sync_alt_outlined,
                    label: 'Bank Reconciliation',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.FINANCIAL_RECONCILIATION);
                    },
                  ),

                  const SizedBox(height: 12),

                  // SECTION 3: ALERTS & SETTINGS
                  _buildSectionHeader('ALERTS & SETTINGS'),
                  _buildMenuItem(
                    icon: Icons.notifications_none_outlined,
                    label: 'Financial Alerts',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.FINANCE_NOTIFICATIONS);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.settings_outlined,
                    label: 'Finance Settings',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.FINANCE_SETTINGS);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    label: 'Finance Profile',
                    onTap: () {
                      Navigator.pop(context);
                      _switchTab(4);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.help_outline,
                    label: 'Help & Documentation',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.FINANCE_HELP_SUPPORT);
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.privacy_tip_outlined,
                    label: 'Privacy Policy',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.PRIVACY_POLICY, arguments: {'role': 'ROLE-FINANCE-OFFICER'});
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.description_outlined,
                    label: 'Terms & SLAs',
                    onTap: () {
                      Navigator.pop(context);
                      Get.toNamed(Routes.TERMS_CONDITIONS, arguments: {'role': 'ROLE-FINANCE-OFFICER'});
                    },
                  ),
                ],
              ),
            ),

            // Logout Action
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: kBorderColor, width: 1),
                ),
              ),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                tileColor: Colors.red.withValues(alpha: 0.08),
                leading: const Icon(Icons.logout, color: Colors.redAccent, size: 22),
                title: const Text(
                  'Log Out',
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                onTap: () => _handleLogout(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _switchTab(int index) {
    if (Get.isRegistered<FinanceDashboardController>()) {
      Get.find<FinanceDashboardController>().onNavItemTapped(index);
    }
  }

  void _handleLogout(BuildContext context) {
    Navigator.pop(context);
    Get.defaultDialog(
      title: 'Confirm Logout',
      middleText: 'Are you sure you want to log out of your Finance Officer account?',
      textConfirm: 'Log Out',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: Colors.redAccent,
      onConfirm: () {
        try {
          if (Get.isRegistered<StorageService>()) {
            StorageService.to.clearAuth();
          }
        } catch (_) {}
        Get.offAllNamed(Routes.LOGIN);
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textMuted,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      dense: true,
      visualDensity: VisualDensity.compact,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
      leading: Icon(icon, color: Colors.white70, size: 20),
      title: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 13.5,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.textMuted,
        size: 16,
      ),
      onTap: onTap,
    );
  }
}
