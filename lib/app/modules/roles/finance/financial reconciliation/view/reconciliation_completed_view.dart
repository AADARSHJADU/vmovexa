import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';

class ReconciliationCompletedView extends GetView<FinancialReconciliationController> {
  const ReconciliationCompletedView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // App Bar / Top Header
        _buildHeader(),

        // Scrollable Body
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Success banner
                _buildSuccessBanner(),
                const SizedBox(height: 20),

                // Statistics row (Total, Matched, Unmatched, Match Rate)
                _buildStatsRow(),
                const SizedBox(height: 24),

                // Tabs: Matched / Unmatched
                _buildTabs(),
                const SizedBox(height: 12),

                // Transactions Table
                _buildTransactionsTable(),
                const SizedBox(height: 24),

                // Next Steps Card
                _buildNextStepsCard(),
                const SizedBox(height: 20),

                // What's Next Card
                _buildWhatsNextCard(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),

        // Bottom Action Bar
        _buildBottomActionBar(),
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
                onPressed: () => controller.backToDashboard(),
              ),
              const SizedBox(width: 8),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Reconciliation Completed',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    "Here's the result of your reconciliation",
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

  // Success Banner Card with Download Report button
  Widget _buildSuccessBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981).withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2), width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle, size: 20, color: Color(0xFF10B981)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reconciliation Successful',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Completed on 31 May 2024, 10:45 AM',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10121A),
              side: const BorderSide(color: Color(0xFF1C1F2E), width: 1.2),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            onPressed: () => controller.downloadReport(),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.download_outlined, size: 12, color: Colors.white),
                SizedBox(width: 4),
                Text(
                  'Download Report',
                  style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Row showing statistics: Total, Matched, Unmatched, and Match Rate
  Widget _buildStatsRow() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Total
          Expanded(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.layers_outlined, size: 14, color: Colors.purple),
                ),
                const SizedBox(height: 6),
                const Text('Total Transactions', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                const SizedBox(height: 4),
                const Text('128', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                const Text('₹27,37,620.00', style: TextStyle(color: AppColors.textSecondary, fontSize: 9)),
              ],
            ),
          ),
          Container(width: 1, height: 45, color: AppColors.cardBorder),
          // Matched
          Expanded(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle_outline, size: 14, color: Color(0xFF10B981)),
                ),
                const SizedBox(height: 6),
                const Text('Matched', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                const SizedBox(height: 4),
                const Text('96', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                const Text('₹24,56,780.00', style: TextStyle(color: Color(0xFF10B981), fontSize: 9)),
              ],
            ),
          ),
          Container(width: 1, height: 45, color: AppColors.cardBorder),
          // Unmatched
          Expanded(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.error_outline, size: 14, color: Color(0xFFF59E0B)),
                ),
                const SizedBox(height: 6),
                const Text('Unmatched', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                const SizedBox(height: 4),
                const Text('24', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                const Text('₹2,45,630.00', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 9)),
              ],
            ),
          ),
          Container(width: 1, height: 45, color: AppColors.cardBorder),
          // Match Rate (with radial indicator placeholder)
          Expanded(
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        value: 0.75,
                        strokeWidth: 3,
                        backgroundColor: AppColors.cardBorder,
                        color: Colors.blue[400],
                      ),
                    ),
                    Icon(Icons.av_timer_outlined, size: 10, color: Colors.blue[400]),
                  ],
                ),
                const SizedBox(height: 6),
                const Text('Match Rate', style: TextStyle(color: AppColors.textMuted, fontSize: 8)),
                const SizedBox(height: 4),
                const Text('75.00%', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Tabs layout
  Widget _buildTabs() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.cardBorder, width: 1.5)),
      ),
      child: TabBar(
        controller: controller.completedTabController,
        dividerColor: Colors.transparent,
        indicatorColor: const Color(0xFFA855F7),
        labelColor: const Color(0xFFA855F7),
        unselectedLabelColor: AppColors.textSecondary,
        labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 12),
        tabs: const [
          Tab(text: 'Matched Transactions (96)'),
          Tab(text: 'Unmatched Transactions (24)'),
        ],
      ),
    );
  }

  // Transactions list
  Widget _buildTransactionsTable() {
    return Obx(() {
      final isMatchedTab = controller.selectedCompletedTabIndex.value == 0;
      final txList = isMatchedTab ? controller.matchedTransactions : controller.unmatchedTransactions;

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
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.cardBorder, width: 1.2),
                ),
              ),
              child: Row(
                children: [
                  const Expanded(
                    flex: 2,
                    child: Text('Date', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  const Expanded(
                    flex: 3,
                    child: Text('Description', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  const Expanded(
                    flex: 2,
                    child: Text('System Amount', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  const Expanded(
                    flex: 2,
                    child: Text('Statement Amount', style: TextStyle(color: AppColors.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(isMatchedTab ? 'Status' : ' Variance', style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  // if (!isMatchedTab)
                  //   const Expanded(
                  //     flex: 1,
                  //     child: Text('', style: TextStyle(color: AppColors.textMuted,
                  //         fontSize: 10, fontWeight: FontWeight.bold)),
                  //   ),
                ],
              ),
            ),
            // Table Items
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: txList.length > 5 ? 5 : txList.length, // Show up to 5 items for completed
              separatorBuilder: (context, index) => const Divider(color: AppColors.cardBorder, height: 1),
              itemBuilder: (context, index) {
                final tx = txList[index];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  child: Row(
                    children: [
                      // Date
                      Expanded(
                        flex: 2,
                        child: Text(tx.date, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                      ),
                      // Description
                      Expanded(
                        flex: 3,
                        child: Text(tx.description, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                      // System Amount
                      Expanded(
                        flex: 2,
                        child: Text('₹${tx.systemAmount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 10)),
                      ),
                      // Statement Amount
                      Expanded(
                        flex: 2,
                        child: Text('₹${tx.statementAmount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 10)),
                      ),
                      // Variance/Status & Review Button
                      Expanded(
                        flex: 3,
                        child: isMatchedTab
                            ? Row(
                                children: [
                                  const Icon(Icons.check_circle, size: 10, color: Color(0xFF10B981)),
                                  const SizedBox(width: 4),
                                  Text(
                                    tx.status.label,
                                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              )
                            : Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      '₹${tx.variance.abs().toStringAsFixed(1)}',
                                      style: const TextStyle(color: Color(0xFFEF4444), fontSize: 10,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  Text('Review', style: TextStyle(color: Color(0xFFA855F7), fontSize: 9, fontWeight: FontWeight.bold)),
                                  // ElevatedButton(
                                  //   style: ElevatedButton.styleFrom(
                                  //     backgroundColor: const Color(0xFF1E1B4B).withOpacity(0.4),
                                  //     side: const BorderSide(color: Color(0xFFA855F7), width: 1),
                                  //     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  //     minimumSize: Size.zero,
                                  //     tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  //     shape: RoundedRectangleBorder(
                                  //       borderRadius: BorderRadius.circular(4),
                                  //     ),
                                  //   ),
                                  //   onPressed: () => controller.reviewTransaction(tx),
                                  //   child: const Text('Review', style: TextStyle(color: Color(0xFFA855F7), fontSize: 9, fontWeight: FontWeight.bold)),
                                  // ),
                                ],
                              ),
                      ),
                      if (!isMatchedTab)
                        Expanded(
                          flex: 1,
                          child: Align(
                            alignment: Alignment.centerRight,
                            child: IconButton(
                              icon: const Icon(Icons.more_vert, color: AppColors.textMuted, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              onPressed: () => controller.reviewTransaction(tx),
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
            // Footer Link Button
            Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
              ),
              child: TextButton(
                onPressed: () => isMatchedTab ? controller.viewAllMatched() : controller.viewAllUnmatched(),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      isMatchedTab ? 'View All Matched' : 'View All Unmatched',
                      style: const TextStyle(color: Color(0xFFA855F7), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                    const Icon(Icons.chevron_right, size: 14, color: Color(0xFFA855F7)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // Next Steps Section
  Widget _buildNextStepsCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1B4B).withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.2), width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFFA855F7).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, size: 18, color: Color(0xFFA855F7)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Next Steps',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  'Review unmatched transactions and create manual matches if required. Once done, mark the reconciliation as complete.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10121A),
              side: const BorderSide(color: Color(0xFF1C1F2E), width: 1.2),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            onPressed: () => controller.createManualMatch(),
            child: const Text(
              'Create Manual Match',
              style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  // What's Next Section
  Widget _buildWhatsNextCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF10121A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.info_outline, size: 18, color: Color(0xFF3B82F6)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "What's Next?",
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 2),
                Text(
                  "You can go back to the reconciliation list or start a new reconciliation.",
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          TextButton(
            onPressed: () {
              if (controller.reconciliationItems.isNotEmpty) {
                controller.startNewReconcile(controller.reconciliationItems.first);
              }
            },
            child: const Row(
              children: [
                Text(
                  'Start New Reconciliation',
                  style: TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontWeight: FontWeight.bold),
                ),
                Icon(Icons.chevron_right, size: 12, color: Color(0xFF3B82F6)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Bottom action bar buttons (Back to Reconciliation List / Mark as Complete)
  Widget _buildBottomActionBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => controller.backToDashboard(),
            child: Container(
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: const Color(0xFF060709),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chevron_left, size: 16, color: Colors.white),
                  SizedBox(width: 4),
                  Text(
                    'Back to Reconciliation List',
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () => controller.markAsComplete(),
            child: Container(
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
               gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Mark as Complete',
                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
