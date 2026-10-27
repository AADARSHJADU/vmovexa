import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/widgets/custom_button.dart';
import '../controller/financial_reconciliation_controller.dart';
import '../model/financial_reconciliation_model.dart';

const Color kBgColor = Color(0xFF0C0C14);
const Color kCardBg = Color(0xFF13131F);
const Color kBorderColor = Color(0xFF232336);

class ReconciliationCompletedView extends GetView<FinancialReconciliationController> {
  const ReconciliationCompletedView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Obx(() {
            final audit = controller.completedData.value ??
                ReconciliationCompletedData(
                  accountName: controller.selectedAccount.value?.name ?? 'HDFC Corporate Transit Current A/C',
                  period: 'October 2026',
                  balance: controller.selectedAccount.value?.ledgerBalance ?? '₹14,50,000',
                  matchedRate: '100%',
                  discrepancy: 'Zero Variance (Balanced)',
                );

            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 12),

                // Emerald Verified Badge
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B).withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(26),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF10B981).withValues(alpha: 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.check_rounded, color: Color(0xFF34D399), size: 44),
                  ),
                ),
                const SizedBox(height: 20),

                // Title & Subtitle
                const Text(
                  'Reconciliation Completed!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Your bank statement records and internal VMOVEXA ledger have been matched and balanced with zero variance.',
                  style: TextStyle(color: Colors.white60, fontSize: 12, height: 1.4),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Audit Summary Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: kBorderColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'ACCOUNT AUDITED',
                                  style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  audit.accountName,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF064E3B).withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                            ),
                            child: const Text(
                              '100% Balanced',
                              style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      const Divider(color: Color(0xFF28283E)),
                      const SizedBox(height: 10),

                      // 2x2 Grid of Audit Details
                      Row(
                        children: [
                          Expanded(child: _buildAuditField('Reconciled Period:', audit.period, Colors.white)),
                          Expanded(child: _buildAuditField('Audited Ledger Balance:', audit.balance, Colors.white, isMono: true)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _buildAuditField('Reconciliation Result:', '${audit.matchedRate} Matched', const Color(0xFF34D399))),
                          Expanded(child: _buildAuditField('Net Discrepancy:', audit.discrepancy, const Color(0xFF34D399))),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 3 Action Buttons (Direct Admin Panel Parity)
                CustomButton(
                  text: 'Download BRS Audit Certificate',
                  onTap: controller.downloadBrsCertificate,
                  isGradient: true,
                  height: 48,
                  prefixIcon: const Icon(Icons.description_outlined, color: Colors.white, size: 18),
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'Back to Reconciliation Roster',
                  onTap: controller.backToRoster,
                  isOutlined: true,
                  height: 48,
                  prefixIcon: const Icon(Icons.format_list_bulleted_rounded, color: Colors.white70, size: 18),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: controller.goToDashboard,
                  child: const Text(
                    'Go to Dashboard',
                    style: TextStyle(color: Colors.white60, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildAuditField(String label, String value, Color valColor, {bool isMono = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor,
            fontSize: 12.5,
            fontWeight: FontWeight.bold,
            fontFamily: isMono ? 'monospace' : null,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
