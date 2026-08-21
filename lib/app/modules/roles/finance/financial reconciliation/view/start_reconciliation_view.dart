import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../../../../../theme/app_colors.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';

class StartReconciliationView extends GetView<FinancialReconciliationController> {
  const StartReconciliationView({super.key});

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
                // Reconciliation Summary Block
                _buildSummaryBlock(),
                const SizedBox(height: 20),

                // Summary Overview Header
                const Text(
                  'Summary Overview',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                _buildOverviewStats(),
                const SizedBox(height: 24),

                // Tabs: Matched / Unmatched
                _buildTabs(),
                const SizedBox(height: 12),

                // Transactions Table
                _buildTransactionsTable(),
                const SizedBox(height: 24),

                // Next Steps Card
                _buildNextStepsCard(),
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
                    'Start Reconciliation',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Review and match transactions',
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

  // Summary Card showing Account, Period, Source
  Widget _buildSummaryBlock() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Reconciliation Summary',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              // Account
              Expanded(
                child: Column(
                  children: [
                    const Icon(Icons.account_balance, size: 20, color: Color(0xFFA855F7)),
                    const SizedBox(height: 8),
                    const Text('Account', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 4),
                    Obx(() => Text(
                          controller.selectedReconcileAccountName.value,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        )),
                    Obx(() => Text(
                          controller.selectedReconcileAccountType.value,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                        )),
                  ],
                ),
              ),
              Container(width: 1, height: 50, color: AppColors.cardBorder),
              // Period
              Expanded(
                child: Column(
                  children: [
                    const Icon(Icons.calendar_month, size: 20, color: Color(0xFFA855F7)),
                    const SizedBox(height: 8),
                    const Text('Period', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 4),
                    const Text('01 May 2024', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    const Text('-', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    const Text('31 May 2024', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Container(width: 1, height: 50, color: AppColors.cardBorder),
              // Source
              Expanded(
                child: Column(
                  children: [
                    const Icon(Icons.description_outlined, size: 20, color: Color(0xFFA855F7)),
                    const SizedBox(height: 8),
                    const Text('Statement Source', style: TextStyle(color: AppColors.textMuted, fontSize: 9)),
                    const SizedBox(height: 4),
                    Obx(() => Text(
                          controller.selectedReconcileSource.value,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        )),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 4 Cards: Matched, Unmatched, In Progress, Total Transactions
  Widget _buildOverviewStats() {
    return Row(
      children: [
        // Matched Card
        Expanded(
          child: _buildStatOverviewCard(
            'Matched',
            '96',
            '₹24,56,780.00',
            const Color(0xFF10B981),
            Icons.check_circle_outline,
          ),
        ),
        const SizedBox(width: 8),
        // Unmatched Card
        Expanded(
          child: _buildStatOverviewCard(
            'Unmatched',
            '24',
            '₹2,45,630.00',
            const Color(0xFFF59E0B),
            Icons.error_outline,
          ),
        ),
        const SizedBox(width: 8),
        // In Progress Card
        Expanded(
          child: _buildStatOverviewCard(
            'In Progress',
            '8',
            '₹35,210.00',
            const Color(0xFF3B82F6),
            Icons.hourglass_empty_outlined,
          ),
        ),
        const SizedBox(width: 8),
        // Total Card
        Expanded(
          child: _buildStatOverviewCard(
            'Total Transactions',
            '128',
            '₹27,37,620.00',
            Colors.white,
            Icons.layers_outlined,
            isTotal: true,
          ),
        ),
      ],
    );
  }

  Widget _buildStatOverviewCard(String title, String count, String amount, Color color, IconData icon, {bool isTotal = false}) {
    return Container(
      height: 95,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, size: 16, color: isTotal ? AppColors.textSecondary : color),
          Column(
            children: [
              Text(title, style: const TextStyle(color: AppColors.textMuted, fontSize: 8), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 2),
              Text(count, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  amount,
                  style: TextStyle(
                    color: isTotal ? AppColors.textSecondary : color,
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
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
        controller: controller.startTabController,
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

  // Transactions list matching current selected tab
  Widget _buildTransactionsTable() {
    return Obx(() {
      final isMatchedTab = controller.selectedStartTabIndex.value == 0;
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
                    child: Text('Statement Amount', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(isMatchedTab ? 'Status' : 'Variance', style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            // Table Items
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: txList.length > 4 ? 4 : txList.length, // Show top 4 items for preview
              separatorBuilder: (context, index) => const Divider(color: AppColors.cardBorder, height: 1),
              itemBuilder: (context, index) {
                final tx = txList[index];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
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
                      // Status or Variance
                      Expanded(
                        flex: 2,
                        child: isMatchedTab
                            ? Row(
                                children: [
                                  const Icon(Icons.check_circle, size: 10, color: Color(0xFF10B981)),
                                  const SizedBox(width: 4),
                                  Text(
                                    tx.status.label,
                                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              )
                            : Text(
                                '-₹${tx.variance.abs().toStringAsFixed(2)}',
                                style: const TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.bold),
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
        color: const Color(0xFF1E1B4B).withOpacity(0.3), // Dark deep purple tint
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
                  'Review unmatched transactions and apply manual matches if required.',
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
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            onPressed: () => controller.reviewUnmatched(),
            child: const Text(
              'Review Unmatched',
              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  // Bottom action bar buttons (Save & Exit / Complete Reconciliation)
  Widget _buildBottomActionBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.cardBg,
        border: Border(top: BorderSide(color: AppColors.cardBorder, width: 1.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => controller.saveAndExit(),
              child: Container(
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF060709),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: const Text(
                  'Save & Exit',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: InkWell(
              onTap: () => controller.completeReconciliation(),
              child: Container(
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  // color: const Color(0xFFA855F7), // Purple theme button
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Complete Reconciliation',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
