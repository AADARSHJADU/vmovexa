import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';
import 'start_reconciliation_view.dart';
import 'reconciliation_completed_view.dart';

class FinancialReconciliationView extends GetView<FinancialReconciliationController> {
  const FinancialReconciliationView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Obx(() {
          switch (controller.currentScreenIndex.value) {
            case 1:
              return const StartReconciliationView();
            case 2:
              return const ReconciliationCompletedView();
            case 0:
            default:
              return _buildDashboard();
          }
        }),
      ),
    );
  }

  Widget _buildDashboard() {
    return Column(
      children: [
        // App Bar / Top Header
        _buildHeader(),
        
        // Main Scrollable Content
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Section: Reconciliation Summary
                const Text(
                  'Reconciliation Summary',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                _buildSummaryCardsList(),
                const SizedBox(height: 20),

                // Section: Filters Row
                _buildFiltersRow(),
                const SizedBox(height: 24),

                // Section: Reconciliation List Table
                _buildReconciliationListHeader(),
                const SizedBox(height: 12),
                _buildReconciliationTable(),
                const SizedBox(height: 24),

                // Section: Reconciliation Insights
                const Text(
                  'Reconciliation Insights',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                _buildInsightsRow(),
                const SizedBox(height: 24),

                // Help Banner
                _buildHelpBanner(),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // Header Widget
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.cardBorder, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () {
                  if (Get.previousRoute.isNotEmpty) {
                    Get.back();
                  } else {
                    controller.backToDashboard();
                  }
                },
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Financial Reconciliation',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Reconcile transactions and accounts',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.info_outline, color: Color(0xFFA855F7)),
            onPressed: () => controller.learnMoreHelp(),
          ),
        ],
      ),
    );
  }

  // 4 Top Cards for Summary
  Widget _buildSummaryCardsList() {
    return Obx(() {
      return SizedBox(
        height: 110,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: controller.summaryCards.length,
          itemBuilder: (context, index) {
            final card = controller.summaryCards[index];
            return Container(
              width: 100,
              margin: const EdgeInsets.only(right: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Icon badge
                  Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: card.color.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(card.icon, size: 16, color: card.color),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        card.title,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 9,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        card.value,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        card.subtitle,
                        style: TextStyle(
                          color: card.percentage == 100.0 ? AppColors.textSecondary : card.color,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      );
    });
  }

  // Filters section
  Widget _buildFiltersRow() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Date Filter
              Expanded(
                child: InkWell(
                  onTap: () => controller.pickDateRange(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Obx(() => Text(
                                controller.selectedDateRange.value,
                                style: const TextStyle(color: Colors.white, fontSize: 11),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              )),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              // Account Filter
              Expanded(
                child: InkWell(
                  onTap: () => controller.filterByAccount(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Obx(() => Text(
                                controller.selectedAccount.value,
                                style: const TextStyle(color: Colors.white, fontSize: 11),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              )),
                        ),
                        const Icon(Icons.keyboard_arrow_down, size: 16, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Status Filter
              Expanded(
                child: InkWell(
                  onTap: () => controller.filterByStatus(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Obx(() => Text(
                                controller.selectedStatus.value,
                                style: const TextStyle(color: Colors.white, fontSize: 11),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              )),
                        ),
                        const Icon(Icons.keyboard_arrow_down, size: 16, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Apply Filter Button
              InkWell(
                onTap: () => controller.applyFilter(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF6366F1), width: 1.2),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.filter_list_alt, size: 14, color: Color(0xFF6366F1)),
                      SizedBox(width: 4),
                      Text(
                        'Apply',
                        style: TextStyle(
                          color: Color(0xFF6366F1),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Reconciliation List Header
  Widget _buildReconciliationListHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Reconciliation List',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        InkWell(
          onTap: () {
            if (controller.reconciliationItems.isNotEmpty) {
              controller.startNewReconcile(controller.reconciliationItems.first);
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF10121A),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFF1C1F2E), width: 1.2),
            ),
            child: const Row(
              children: [
                Icon(Icons.add, size: 14, color: Colors.white),
                SizedBox(width: 4),
                Text(
                  'New Reconciliation',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // Reconciliation Table Widget
  Widget _buildReconciliationTable() {
    return Obx(() {
      return Container(
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            // Table Header Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.cardBorder, width: 1.2),
                ),
              ),
              child: const Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Account/Source',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      'Type',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      'Status',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      'Last Reconciled',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        'Actions',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Table Body List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: controller.reconciliationItems.length,
              separatorBuilder: (context, index) => const Divider(color: AppColors.cardBorder, height: 1),
              itemBuilder: (context, index) {
                final item = controller.reconciliationItems[index];
                return InkWell(
                  onTap: () => controller.startNewReconcile(item),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    child: Row(
                      children: [
                        // Account
                        Expanded(
                          flex: 3,
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.cardBorder, width: 1),
                                ),
                                child: Icon(item.icon, size: 16, color: Colors.purple[300]),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.accountName,
                                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item.accountType,
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Type
                        Expanded(
                          flex: 2,
                          child: Text(
                            item.type.replaceAll(' Reconciliation', '\nReconciliation'),
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                          ),
                        ),
                        // Status
                        Expanded(
                          flex: 2,
                          child: Container(
                            alignment: Alignment.centerLeft,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: item.status.color.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: item.status.color.withOpacity(0.6), width: 1),
                              ),
                              child: Text(
                                item.status.label,
                                style: TextStyle(
                                  color: item.status.color,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Last Reconciled
                        Expanded(
                          flex: 2,
                          child: Text(
                            item.lastReconciled,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                          ),
                        ),
                        // Actions
                        Expanded(
                          flex: 1,
                          child: Align(
                            alignment: Alignment.centerRight,
                            child: IconButton(
                              icon: const Icon(Icons.more_vert, color: AppColors.textMuted, size: 18),
                              onPressed: () => controller.startNewReconcile(item),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      );
    });
  }

  // Reconciliation Insights section
  Widget _buildInsightsRow() {
    return Obx(() {
      return SizedBox(
        height: 100,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: controller.insights.length,
          itemBuilder: (context, index) {
            final insight = controller.insights[index];
            return Container(
              width: 140,
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        insight.title,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 9),
                      ),
                      Icon(insight.icon, size: 14, color: AppColors.textMuted),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        insight.value,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              insight.changeText,
                              style: TextStyle(
                                color: insight.changeColor,
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 1),
                      Text(
                        insight.subtitle,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 8),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      );
    });
  }

  // Bottom Help Banner
  Widget _buildHelpBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF6366F1).withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.2), width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.lightbulb_outline, size: 18, color: Color(0xFF6366F1)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need help with reconciliation?',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Learn how reconciliation works or contact support.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => controller.learnMoreHelp(),
            child: const Row(
              children: [
                Text(
                  'Learn More',
                  style: TextStyle(color: Color(0xFF6366F1), fontSize: 10, fontWeight: FontWeight.bold),
                ),
                Icon(Icons.open_in_new, size: 10, color: Color(0xFF6366F1)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
