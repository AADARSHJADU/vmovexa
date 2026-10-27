import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/finance_reports_controller.dart';
import '../../revenue_reporting/view/revenue_reporting_view.dart';
import '../../revenue_reporting/controller/revenue_reporting_controller.dart';
import '../../gst_management/view/gst_management_view.dart';
import '../../gst_management/controller/gst_management_controller.dart';
import '../../financial reconciliation/view/financial_reconciliation_view.dart';
import '../../financial reconciliation/controller/financial_reconciliation_controller.dart';
import '../../subscriptions/view/subscriptions_view.dart';
import '../../subscriptions/controller/subscriptions_controller.dart';

class FinanceReportsView extends GetView<FinanceReportsController> {
  const FinanceReportsView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kIndigo = Color(0xFF6366F1);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<FinanceReportsController>()) {
      Get.put(FinanceReportsController());
    }
    if (!Get.isRegistered<RevenueReportingController>()) {
      Get.lazyPut(() => RevenueReportingController());
    }
    if (!Get.isRegistered<GSTManagementController>()) {
      Get.lazyPut(() => GSTManagementController());
    }
    if (!Get.isRegistered<FinancialReconciliationController>()) {
      Get.lazyPut(() => FinancialReconciliationController());
    }
    if (!Get.isRegistered<SubscriptionsController>()) {
      Get.lazyPut(() => SubscriptionsController());
    }

    final tabs = [
      {'title': 'Revenue', 'icon': Icons.trending_up},
      {'title': 'GST & Tax', 'icon': Icons.receipt_long},
      {'title': 'Reconcile', 'icon': Icons.balance},
      {'title': 'Tenants', 'icon': Icons.people_outline},
    ];

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Reports & Compliance',
                          style: GoogleFonts.raleway(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Revenue P&L, GST Returns, Bank Match & Tenants',
                          style: GoogleFonts.raleway(
                            color: Colors.white54,
                            fontSize: 11.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Top Segmented Bar
            Obx(() {
              final activeIndex = controller.selectedSubTab.value;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0x14FFFFFF)),
                ),
                child: Row(
                  children: List.generate(tabs.length, (index) {
                    final isSelected = activeIndex == index;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => controller.setSubTab(index),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? kIndigo : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                tabs[index]['icon'] as IconData,
                                size: 14,
                                color: isSelected ? Colors.white : Colors.white60,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                tabs[index]['title'] as String,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white60,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  fontSize: 11.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              );
            }),

            // Tab Content
            Expanded(
              child: Obx(() {
                switch (controller.selectedSubTab.value) {
                  case 0:
                    return const RevenueReportingView();
                  case 1:
                    return const GSTManagementView();
                  case 2:
                    return const FinancialReconciliationView();
                  case 3:
                    return const SubscriptionsView();
                  default:
                    return const RevenueReportingView();
                }
              }),
            ),
          ],
        ),
      ),
    );
  }
}
