import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../widgets/finance_drawer_widget.dart';
import '../controller/finance_dashboard_controller.dart';
import '../../home/view/finance_home_view.dart';
import '../../invoice/view/invoice_view.dart';
import '../../payments/view/finance_payments_view.dart';
import '../../subscriptions/view/subscriptions_view.dart';
import '../../finance_profile/profile/view/finance_profile_view.dart';

class FinanceDashboardView extends GetView<FinanceDashboardController> {
  const FinanceDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: controller.scaffoldKey,
      drawer: const FinanceDrawerWidget(),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.selectedNavIndex.value) {
            case 0:
              return const FinanceHomeView();
            case 1:
              return const InvoiceView();
            case 2:
              return const FinancePaymentsView();
            case 3:
              return const SubscriptionsView();
            case 4:
              return const FinanceProfileView();
            default:
              return const FinanceHomeView();
          }
        }),
      ),
      bottomNavigationBar: Obx(
        () => Container(
          decoration: const BoxDecoration(
            border: Border(
              top: BorderSide(
                color: AppColors.cardBorder,
                width: 1.2,
              ),
            ),
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
                icon: Icon(Icons.dashboard_outlined),
                activeIcon: Icon(Icons.dashboard),
                label: 'Dashboard',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long),
                label: 'Invoices',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.payments_outlined),
                activeIcon: Icon(Icons.payments),
                label: 'Payments',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.domain_outlined),
                activeIcon: Icon(Icons.domain),
                label: 'Tenants',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
