import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/finance_profile/setting/view/finance_settings_view.dart';
import 'package:vmovexa/app/modules/roles/finance/home/view/finance_home_view.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/subscriptions_view.dart';
import 'package:vmovexa/app/modules/roles/placeholder/views/role_placeholder_view.dart';
import '../../../../../theme/app_colors.dart';
import '../../financial reconciliation/view/financial_reconciliation_view.dart';
import '../../invoice/view/invoice_view.dart';
import '../controller/finance_dashboard_controller.dart';



class FinanceDashboardView extends GetView<FinanceDashboardController> {
  const FinanceDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return  FinanceHomeView();
            case 1:
              return  SubscriptionsView();
            case 2:
              return  InvoiceView();
            case 3:
              return RolePlaceholderView();
              // return FinancialReconciliationView();
            case 4:
              // return FinanceSettingsView();
              return RolePlaceholderView();
            default:
              return RolePlaceholderView();
          }
        }),
      ),
      // Bottom Navigation Bar
      bottomNavigationBar: Obx(
            () => Container(
          decoration: const BoxDecoration(
            border: Border(
                top: BorderSide(
                    color: AppColors.cardBorder,
                width: 1.2)),
          ),
          child: BottomNavigationBar(
            currentIndex: controller.selectedNavIndex.value,
            onTap: controller.onNavItemTapped,
            backgroundColor: AppColors.cardBg,
            type: BottomNavigationBarType.fixed,
            selectedItemColor: const Color(0xFF6366F1),
            unselectedItemColor: AppColors.textMuted,
            selectedFontSize: 11,
            unselectedFontSize: 11,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home_outlined),
                label: 'Dashboard',
              ),

              BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long_outlined),
                label: 'Subscriptions',
              ),

              BottomNavigationBarItem(
                icon: Icon(Icons.description_outlined),
                activeIcon: Icon(Icons.description_outlined),
                label: 'Invoices',
              ),

              BottomNavigationBarItem(
                icon: Icon(Icons.bar_chart_outlined),
                activeIcon: Icon(Icons.bar_chart_outlined),
                label: 'Finance',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
