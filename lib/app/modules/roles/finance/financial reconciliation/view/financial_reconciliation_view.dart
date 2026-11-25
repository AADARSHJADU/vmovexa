import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';
import 'start_reconciliation_view.dart';

const Color kBgColor = Color(0xFF0C0C14);
const Color kCardBg = Color(0xFF13131F);
const Color kInputBg = Color(0xFF1B1B2A);
const Color kBorderColor = Color(0xFF232336);

class FinancialReconciliationView extends GetView<FinancialReconciliationController> {
  const FinancialReconciliationView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBgColor,
      body: SafeArea(
        child: Obx(() {
          switch (controller.currentScreenIndex.value) {
            case 1:
              return const StartReconciliationView();
            case 0:
            default:
              return _buildDashboard(context);
          }
        }),
      ),
    );
  }

  Widget _buildDashboard(BuildContext context) {
    return Column(
      children: [
        _buildAppBar(),
        Expanded(
          child: Obx(() {
            if (controller.isLoadingSummary.value && controller.summary.value == null) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFF1C68FD)));
            }

            final summary = controller.summary.value ?? ReconciliationSummaryModel.empty();

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 4 Summary KPI Cards matching Admin Panel 1:1
                  _buildKpiGrid(summary),
                  const SizedBox(height: 18),

                  // Ledger Accounts Roster Section
                  _buildAccountsSection(context),
                  const SizedBox(height: 24),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }

  // ==========================================
  // TOP APP BAR
  // ==========================================
  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(bottom: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.all(8),
              minimumSize: const Size(36, 36),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'reconciliation'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'reconcile_corporate_sub'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: controller.loadReconciliationSummary,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'refresh'.tr,
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => controller.startWizardForAccount(null),
            child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 15),
                  const SizedBox(width: 6),
                  Text(
                    'start_recon_wizard'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4 SUMMARY KPI CARDS MATCHING ADMIN PANEL 1:1
  // ==========================================
  Widget _buildKpiGrid(ReconciliationSummaryModel summary) {
    return LayoutBuilder(builder: (context, constraints) {
      final cardWidth = (constraints.maxWidth - 10) / 2;
      return Wrap(
        spacing: 10,
        runSpacing: 10,
        children: [
          // 1. Total Transactions
          _buildKpiCard(
            width: cardWidth,
            label: 'total_transactions'.tr.toUpperCase(),
            value: '${summary.totalTransactions}',
            sub: 'recorded_across_accounts'.tr,
            valColor: const Color(0xFF818CF8),
            icon: Icons.receipt_long_outlined,
            iconBg: const Color(0xFF312E81).withValues(alpha: 0.4),
            iconColor: const Color(0xFFA5B4FC),
          ),
          // 2. Matched Feeds
          _buildKpiCard(
            width: cardWidth,
            label: 'matched_feeds'.tr.toUpperCase(),
            value: '${summary.matched}',
            sub: 'auto_matched_bank'.tr,
            valColor: const Color(0xFF34D399),
            icon: Icons.check_circle_outline_rounded,
            iconBg: const Color(0xFF064E3B).withValues(alpha: 0.4),
            iconColor: const Color(0xFF6EE7B7),
          ),
          // 3. Requires Review
          _buildKpiCard(
            width: cardWidth,
            label: 'requires_review'.tr.toUpperCase(),
            value: '${summary.unmatched}',
            sub: 'requires_audit'.tr,
            valColor: const Color(0xFFFB7185),
            icon: Icons.warning_amber_rounded,
            iconBg: const Color(0xFF881337).withValues(alpha: 0.4),
            iconColor: const Color(0xFFFDA4AF),
          ),
          // 4. In Progress
          _buildKpiCard(
            width: cardWidth,
            label: 'in_progress'.tr.toUpperCase(),
            value: '${summary.inProgress}',
            sub: 'pending_bank_clearance'.tr,
            valColor: const Color(0xFFFBBF24),
            icon: Icons.sync_rounded,
            iconBg: const Color(0xFF78350F).withValues(alpha: 0.4),
            iconColor: const Color(0xFFFDE68A),
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required double width,
    required String label,
    required String value,
    required String sub,
    required Color valColor,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: iconColor, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sub,
            style: const TextStyle(color: Colors.white38, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // LEDGER ACCOUNTS ROSTER SECTION
  // ==========================================
  Widget _buildAccountsSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Text(
            'ledger_accounts_roster'.tr.toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'ledger_accounts_sub'.tr,
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
          const SizedBox(height: 14),

          // Search Box with clear button
          Obx(() {
            final searchVal = controller.accountSearch.value;
            return TextField(
              onChanged: (val) {
                controller.accountSearch.value = val;
                controller.currentPage.value = 1;
              },
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'search_accounts_ph'.tr,
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
                suffixIcon: searchVal.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, color: Colors.white38, size: 16),
                        onPressed: () {
                          controller.accountSearch.value = '';
                          controller.currentPage.value = 1;
                        },
                      )
                    : null,
                filled: true,
                fillColor: kInputBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF28283E))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
              ),
            );
          }),
          const SizedBox(height: 14),

          // Accounts List
          Obx(() {
            final accounts = controller.paginatedAccounts;
            if (accounts.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 36),
                alignment: Alignment.center,
                child: Text(
                  controller.accountSearch.value.isNotEmpty
                      ? 'no_matching_accounts'.tr
                      : 'no_accounts_configured'.tr,
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
              );
            }

            return Column(
              children: accounts.map((acc) => _buildAccountCard(acc)).toList(),
            );
          }),

          const SizedBox(height: 12),

          // Pagination
          Obx(() => _buildPagination()),
        ],
      ),
    );
  }

  // Account Card matching Admin Panel 1:1 with primaryGradient action
  Widget _buildAccountCard(ReconciliationAccountModel acc) {
    final isReconciled = acc.status.toLowerCase() == 'reconciled';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kInputBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF28283E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A8A).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  acc.category.toUpperCase(),
                  style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isReconciled
                      ? const Color(0xFF064E3B).withValues(alpha: 0.5)
                      : const Color(0xFF78350F).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: isReconciled
                        ? const Color(0xFF10B981).withValues(alpha: 0.4)
                        : const Color(0xFFF59E0B).withValues(alpha: 0.4),
                  ),
                ),
                child: Text(
                  '● ${acc.status}',
                  style: TextStyle(
                    color: isReconciled ? const Color(0xFF34D399) : const Color(0xFFFBBF24),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            acc.name,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            acc.accountNumber,
            style: const TextStyle(color: Colors.white38, fontSize: 11, fontFamily: 'monospace'),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF131320),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatColumn('txns'.tr.toUpperCase(), '${acc.totalTxns}', Colors.white),
                _buildStatColumn('matched'.tr.toUpperCase(), '${acc.matched}', const Color(0xFF34D399)),
                _buildStatColumn('unmatched'.tr.toUpperCase(), '${acc.unmatched}', const Color(0xFFFB7185)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ledger_balance'.tr.toUpperCase(),
                    style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    acc.ledgerBalance,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => controller.startWizardForAccount(acc),
                child: Container(
                  height: 34,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'reconcile'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 16),
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

  Widget _buildStatColumn(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
        ),
      ],
    );
  }

  // Pagination controls
  Widget _buildPagination() {
    final total = controller.totalPages;
    final current = controller.currentPage.value;
    final count = controller.filteredAccounts.length;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Page $current of $total ($count accounts)',
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left_rounded, color: Colors.white),
              onPressed: current > 1 ? () => controller.currentPage.value-- : null,
              disabledColor: Colors.white24,
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded, color: Colors.white),
              onPressed: current < total ? () => controller.currentPage.value++ : null,
              disabledColor: Colors.white24,
            ),
          ],
        ),
      ],
    );
  }
}
