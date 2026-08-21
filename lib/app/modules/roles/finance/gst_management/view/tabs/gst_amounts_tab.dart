import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../../theme/app_colors.dart';
import '../../controller/gst_management_controller.dart';

class GSTAmountsTab extends GetView<GSTManagementController> {
  const GSTAmountsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Obx(() {
        final amounts = controller.gstAmounts.value;

        if (amounts == null) {
          return const Center(child: Text('No GST amounts data available'));
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            _buildSummaryCards(amounts),
            const SizedBox(height: 20),
            _buildGSTBreakdown(amounts),
            const SizedBox(height: 20),
            _buildInfoNote(),
          ],
        );
      }),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           Expanded(
             child: Text(
              'GST Amounts Summary',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
                       ),
           ),
          // SizedBox(height: 10,),
          GestureDetector(
            onTap: () {
              // Show month picker
            },
            child: Container(
              width: 110,
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.inputBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.calendar_today,
                    color: AppColors.textSecondary,
                    size: 14,
                  ),
                  const SizedBox(width: 6),
                  Obx(() => Text(
                    DateFormat('MMM yyyy').format(controller.selectedMonth.value),
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  )),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.keyboard_arrow_down,
                    color: AppColors.textSecondary,
                    size: 16,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards(amounts) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                icon: Icons.description_outlined,
                iconColor: const Color(0xFF6D28D9),
                label: 'Taxable Value',
                value: '₹${NumberFormat('#,##,###').format(amounts.taxableValue)}',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                icon: Icons.percent,
                iconColor: const Color(0xFF3B82F6),
                label: 'Total GST',
                value: '₹${NumberFormat('#,##,###').format(amounts.totalGST)}',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                icon: Icons.credit_card,
                iconColor: const Color(0xFF10B981),
                label: 'Total ITC',
                value: '₹${NumberFormat('#,##,###').format(amounts.totalITC)}',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                icon: Icons.account_balance_wallet_outlined,
                iconColor: const Color(0xFFF59E0B),
                label: 'Net GST Payable',
                value: '₹${NumberFormat('#,##,###').format(amounts.netGSTPayable)}',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGSTBreakdown(amounts) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'GST Breakup',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryButtonBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Amount (₹)',
                  style: TextStyle(
                    color: AppColors.primaryButtonBlue,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildBreakupRow('IGST', amounts.igst),
          const SizedBox(height: 16),
          _buildBreakupRow('CGST', amounts.cgst),
          const SizedBox(height: 16),
          _buildBreakupRow('SGST / UTGST', amounts.sgst),
          const SizedBox(height: 16),
          _buildBreakupRow('CESS', amounts.cess, showNA: amounts.cess == 0),
          const SizedBox(height: 20),
          const Divider(color: AppColors.cardBorder),
          const SizedBox(height: 20),
          _buildBreakupRow(
            'Total GST',
            amounts.totalGST,
            isTotal: true,
            valueColor: const Color(0xFF6D28D9),
          ),
          const SizedBox(height: 16),
          _buildBreakupRow(
            'Input Tax Credit (ITC)',
            amounts.totalITC,
            valueColor: const Color(0xFF10B981),
          ),
          const SizedBox(height: 20),
          const Divider(color: AppColors.cardBorder),
          const SizedBox(height: 20),
          _buildBreakupRow(
            'Net GST Payable',
            amounts.netGSTPayable,
            isTotal: true,
            valueColor: const Color(0xFFF59E0B),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakupRow(
    String label,
    double value, {
    bool isTotal = false,
    Color? valueColor,
    bool showNA = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: isTotal ? AppColors.textPrimary : AppColors.textSecondary,
            fontSize: isTotal ? 15 : 14,
            fontWeight: isTotal ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
        Text(
          showNA ? '-' : NumberFormat('#,##,###').format(value),
          style: TextStyle(
            color: valueColor ?? (isTotal ? AppColors.textPrimary : AppColors.textPrimary),
            fontSize: isTotal ? 16 : 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoNote() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF3B82F6).withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline,
            color: Color(0xFF3B82F6),
            size: 20,
          ),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Net GST Payable is total GST minus Input Tax Credit (ITC).',
              style: TextStyle(
                color: Color(0xFF3B82F6),
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
