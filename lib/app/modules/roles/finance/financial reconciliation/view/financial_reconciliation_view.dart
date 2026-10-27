import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';
import 'start_reconciliation_view.dart';
import 'reconciliation_completed_view.dart';

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
            case 2:
              return const ReconciliationCompletedView();
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

            final summary = controller.summary.value ?? ReconciliationSummaryModel.fallback();

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 4 Summary KPI Cards
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
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bank Reconciliation',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Reconcile corporate bank accounts, gateway escrow & ledgers',
                  style: TextStyle(color: Colors.white54, fontSize: 11),
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
            tooltip: 'Refresh',
          ),
          // const SizedBox(width: 8),
          // CustomButton(
          //   text: 'Start Wizard',
          //   onTap: () => controller.startWizardForAccount(null),
          //   isGradient: true,
          //   height: 38,
          //   width: 124,
          //   prefixIcon: const Icon(Icons.analytics_outlined, color: Colors.white, size: 15),
          // ),
        ],
      ),
    );
  }

  // ==========================================
  // 4 SUMMARY KPI CARDS
  // ==========================================
  Widget _buildKpiGrid(ReconciliationSummaryModel summary) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.45,
      children: [
        _buildKpiCard(
          label: 'TOTAL\nTRANSACTIONS',
          value: '${summary.totalTransactions}',
          sub: 'Across all accounts',
          valColor: const Color(0xFF818CF8),
          icon: Icons.receipt_long_outlined,
          iconBg: const Color(0xFF312E81).withValues(alpha: 0.4),
          iconColor: const Color(0xFFA5B4FC),
        ),
        _buildKpiCard(
          label: 'MATCHED FEEDS',
          value: '${summary.matched}',
          sub: 'Verified with bank feeds',
          valColor: const Color(0xFF34D399),
          icon: Icons.check_circle_outline_rounded,
          iconBg: const Color(0xFF064E3B).withValues(alpha: 0.4),
          iconColor: const Color(0xFF6EE7B7),
        ),
        _buildKpiCard(
          label: 'REQUIRES REVIEW',
          value: '${summary.unmatched}',
          sub: 'Discrepancies / audit',
          valColor: const Color(0xFFFB7185),
          icon: Icons.warning_amber_rounded,
          iconBg: const Color(0xFF881337).withValues(alpha: 0.4),
          iconColor: const Color(0xFFFDA4AF),
        ),
        _buildKpiCard(
          label: 'IN PROGRESS',
          value: '${summary.inProgress}',
          sub: 'Gateway clearance',
          valColor: const Color(0xFFFBBF24),
          icon: Icons.sync_rounded,
          iconBg: const Color(0xFF78350F).withValues(alpha: 0.4),
          iconColor: const Color(0xFFFDE68A),
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required String label,
    required String value,
    required String sub,
    required Color valColor,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white38, fontSize: 9.5, fontWeight: FontWeight.bold),
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
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LEDGER ACCOUNTS ROSTER',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Corporate banks, gateway escrow,and\npayoutledgers',
                    style: TextStyle(color: Colors.white38, fontSize: 11),
                  ),
                ],
              ),

            ],
          ),
          // const SizedBox(height: 5),
          // Row(
          //   children: [
          //     Obx(() => Container(
          //       decoration: BoxDecoration(
          //         color: kInputBg,
          //         borderRadius: BorderRadius.circular(10),
          //         border: Border.all(color: kBorderColor),
          //       ),
          //       child: Row(
          //         mainAxisSize: MainAxisSize.min,
          //         children: [
          //           IconButton(
          //             icon: Icon(
          //               Icons.table_rows_rounded,
          //               size: 16,
          //               color: controller.viewMode.value == 'table' ? Colors.white : Colors.white38,
          //             ),
          //             onPressed: () => controller.viewMode.value = 'table',
          //             constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          //             padding: EdgeInsets.zero,
          //           ),
          //
          //         ],
          //       ),
          //     )),
          //     IconButton(
          //       icon: Icon(
          //         Icons.grid_view_rounded,
          //         size: 16,
          //         color: controller.viewMode.value == 'card' ? Colors.white : Colors.white38,
          //       ),
          //       onPressed: () => controller.viewMode.value = 'card',
          //       constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          //       padding: EdgeInsets.zero,
          //     ),
          //   ],
          // ),
          const SizedBox(height: 14),

          // Search Box
          TextField(
            onChanged: (val) {
              controller.accountSearch.value = val;
              controller.currentPage.value = 1;
            },
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search accounts by name, number, category...',
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
              filled: true,
              fillColor: kInputBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF28283E))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF60A5FA))),
            ),
          ),
          const SizedBox(height: 14),

          // Accounts List
          Obx(() {
            final accounts = controller.paginatedAccounts;
            if (accounts.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 36),
                alignment: Alignment.center,
                child: const Text('No matching ledger accounts found', style: TextStyle(color: Colors.white38, fontSize: 12)),
              );
            }

            if (controller.viewMode.value == 'table') {
              return Column(
                children: accounts.map((acc) => _buildAccountCard(acc)).toList(),
              );
            } else {
              return Column(
                children: accounts.map((acc) => _buildAccountCard(acc)).toList(),
              );
            }
          }),

          const SizedBox(height: 12),

          // Pagination
          Obx(() => _buildPagination()),
        ],
      ),
    );
  }

  // Row Item for Table-like layout
  Widget _buildAccountRow(ReconciliationAccountModel acc) {
    final isReconciled = acc.status.toLowerCase() == 'reconciled';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      acc.name,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${acc.category} · ${acc.accountNumber}',
                      style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Ledger Balance', style: TextStyle(color: Colors.white38, fontSize: 10)),
                  Text(
                    acc.ledgerBalance,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    'Txns: ${acc.totalTxns} | M: ${acc.matched} | U: ${acc.unmatched}',
                    style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                  ),
                  const SizedBox(width: 10),
                  CustomButton(
                    text: 'Reconcile',
                    onTap: () => controller.startWizardForAccount(acc),
                    isGradient: true,
                    height: 32,
                    width: 95,
                    prefixIcon: const Icon(Icons.sync_alt_rounded, color: Colors.white, size: 13),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Card View item
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
                _buildStatColumn('TOTAL TXNS', '${acc.totalTxns}', Colors.white),
                _buildStatColumn('MATCHED', '${acc.matched}', const Color(0xFF34D399)),
                _buildStatColumn('UNMATCHED', '${acc.unmatched}', const Color(0xFFFB7185)),
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
                  const Text('LEDGER BALANCE', style: TextStyle(color: Colors.white38, fontSize: 9)),
                  Text(
                    acc.ledgerBalance,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                  ),
                ],
              ),
              CustomButton(
                text: 'Reconcile',
                onTap: () => controller.startWizardForAccount(acc),
                isGradient: true,
                height: 36,
                width: 110,
                prefixIcon: const Icon(Icons.sync_alt_rounded, color: Colors.white, size: 14),
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
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
      ],
    );
  }

  // Pagination controls
  Widget _buildPagination() {
    final total = controller.totalPages;
    final current = controller.currentPage.value;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Page $current of $total (${controller.filteredAccounts.length} accounts)',
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
