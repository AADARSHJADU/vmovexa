import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';

const Color kBgColor = Color(0xFF0C0C14);
const Color kCardBg = Color(0xFF13131F);
const Color kInputBg = Color(0xFF1B1B2A);
const Color kBorderColor = Color(0xFF232336);

class StartReconciliationView extends GetView<FinancialReconciliationController> {
  const StartReconciliationView({super.key});

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

    return Column(
      children: [
        // Top App Bar
        _buildAppBar(),

        // Scrollable Body
        Expanded(
          child: Obx(() {
            if (controller.isLoadingTxns.value && controller.transactions.isEmpty) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFF1C68FD)));
            }

            final txns = controller.transactions;
            final matchedCount = txns.where((t) => t.status == 'Matched').length;
            final unmatchedCount = txns.where((t) => t.status != 'Matched').length;

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 3 Snapshot KPI Cards
                  _buildMiniKpiRow(txns.length, matchedCount, unmatchedCount),
                  const SizedBox(height: 16),

                  // Transaction Comparison Feed Container
                  _buildComparisonFeed(txns, currencyFormatter),
                  const SizedBox(height: 20),
                ],
              ),
            );
          }),
        ),

        // Bottom Completion Bar
        _buildBottomBar(),
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
            onPressed: controller.backToRoster,
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
            child: Obx(() {
              final acc = controller.selectedAccount.value;
              final title = acc?.name ?? 'Consolidated Corporate Accounts';
              final sub = '${acc?.accountNumber ?? "All Active Feeds"} · Real-Time Ledger Tally';

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Reconciliation Wizard',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$title ($sub)',
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              );
            }),
          ),
          IconButton(
            onPressed: () => controller.loadTransactions(),
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF1C1C2D),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              minimumSize: const Size(36, 36),
            ),
            tooltip: 'Refresh Transactions',
          ),
          // const SizedBox(width: 8),
          // Obx(() => CustomButton(
          //       text: controller.isAutoMatching.value ? 'Matching…' : 'Auto-Match Records',
          //       onTap: controller.runAutoMatch,
          //       isLoading: controller.isAutoMatching.value,
          //       isGradient: true,
          //       height: 38,
          //       width: 148,
          //       prefixIcon: const Icon(Icons.speed_rounded, color: Colors.white, size: 16),
          //     )),
        ],
      ),
    );
  }

  // ==========================================
  // 3 SNAPSHOT MINI-KPI ROW
  // ==========================================
  Widget _buildMiniKpiRow(int total, int matched, int unmatched) {
    return Row(
      children: [
        Expanded(
          child: _buildMiniCard(
            label: 'TOTAL COMPARED',
            value: '$total',
            valColor: Colors.white,
            border: kBorderColor,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMiniCard(
            label: 'MATCHED (0 VARIANCE)',
            value: '$matched',
            valColor: const Color(0xFF34D399),
            border: const Color(0xFF064E3B),
            bg: const Color(0xFF064E3B).withValues(alpha: 0.15),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMiniCard(
            label: 'UNMATCHED',
            value: '$unmatched',
            valColor: unmatched > 0 ? const Color(0xFFFBBF24) : Colors.white38,
            border: kBorderColor,
          ),
        ),
      ],
    );
  }

  Widget _buildMiniCard({
    required String label,
    required String value,
    required Color valColor,
    required Color border,
    Color? bg,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: bg ?? kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TRANSACTION COMPARISON FEED
  // ==========================================
  Widget _buildComparisonFeed(List<ReconciliationTransactionModel> txns, NumberFormat formatter) {
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
          // Section Title & Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TRANSACTION COMPARISON FEED',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Bank Statement Feed vs VMOVEXA Book Ledger',
                      style: TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                ),
                child: const Text(
                  '● Live Feed Connected',
                  style: TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (txns.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 36),
              alignment: Alignment.center,
              child: const Text('No reconciliation transactions found', style: TextStyle(color: Colors.white38, fontSize: 12)),
            )
          else
            ...txns.map((row) => _buildTxnComparisonRow(row, formatter)),
        ],
      ),
    );
  }

  Widget _buildTxnComparisonRow(ReconciliationTransactionModel row, NumberFormat formatter) {
    final isMatched = row.status == 'Matched' || row.variance == 0.0;

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
          // Row Header: Date & Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(row.date, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  Text(row.refNumber, style: const TextStyle(color: Colors.white38, fontSize: 10.5, fontFamily: 'monospace')),
                ],
              ),
              // Row(
              //   children: [
              //     Container(
              //       padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              //       decoration: BoxDecoration(
              //         color: isMatched
              //             ? const Color(0xFF064E3B).withValues(alpha: 0.5)
              //             : const Color(0xFF881337).withValues(alpha: 0.5),
              //         borderRadius: BorderRadius.circular(6),
              //         border: Border.all(
              //           color: isMatched
              //               ? const Color(0xFF10B981).withValues(alpha: 0.4)
              //               : const Color(0xFFFB7185).withValues(alpha: 0.4),
              //         ),
              //       ),
              //       child: Text(
              //         '● ${row.status}',
              //         style: TextStyle(
              //           color: isMatched ? const Color(0xFF34D399) : const Color(0xFFFB7185),
              //           fontSize: 9.5,
              //           fontWeight: FontWeight.bold,
              //         ),
              //       ),
              //     ),
              //     const SizedBox(width: 6),
              //     Container(
              //       padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              //       decoration: BoxDecoration(
              //         color: const Color(0xFF064E3B).withValues(alpha: 0.3),
              //         borderRadius: BorderRadius.circular(6),
              //       ),
              //       child: const Row(
              //         mainAxisSize: MainAxisSize.min,
              //         children: [
              //           Icon(Icons.check_rounded, color: Color(0xFF34D399), size: 11),
              //           SizedBox(width: 2),
              //           Text('Verified', style: TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold)),
              //         ],
              //       ),
              //     ),
              //   ],
              // ),
            ],
          ),
          const SizedBox(height: 6),

          // Description
          Text(
            row.description,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),

          // 3 Sub-amounts: Bank Statement, Book Ledger, Variance
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF131320),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildAmountCell('BANK STATEMENT', formatter.format(row.bankStatement), Colors.white),
                _buildAmountCell('BOOK LEDGER', formatter.format(row.bookLedger), Colors.white70),
                _buildAmountCell(
                  'VARIANCE',
                  row.variance == 0.0 ? '₹0.00' : formatter.format(row.variance),
                  row.variance == 0.0 ? const Color(0xFF34D399) : const Color(0xFFFB7185),
                  isBold: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountCell(String label, String value, Color valColor, {bool isBold = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 8.5, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor,
            fontSize: 11.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }

  // ==========================================
  // BOTTOM ACTION BAR
  // ==========================================
  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: kBorderColor, width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: CustomButton(
              text: 'Cancel',
              onTap: controller.backToRoster,
              isOutlined: true,
              height: 44,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Obx(() => CustomButton(
                  text: controller.isFinalizing.value ? 'Finalizing…' : 'Confirm Reconciliation',
                  onTap: controller.finalizeReconciliation,
                  isLoading: controller.isFinalizing.value,
                  isGradient: true,
                  height: 44,
                  // prefixIcon: const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 16),
                )),
          ),
        ],
      ),
    );
  }
}
