import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../../theme/app_colors.dart';
import '../../controller/gst_management_controller.dart';

class GSTDetailsTab extends GetView<GSTManagementController> {
  const GSTDetailsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Obx(() {
        final overview = controller.gstOverview.value;
        final details = controller.gstDetails.value;

        if (overview == null || details == null) {
          return const Center(child: Text('No data available'));
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOverviewSection(overview),
            const SizedBox(height: 20),
            _buildDetailsSection(),
          ],
        );
      }),
    );
  }

  Widget _buildOverviewSection(overview) {
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
                'GST Overview',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
                    Text(
                      DateFormat('MMM yyyy').format(controller.selectedMonth.value),
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.textSecondary,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildOverviewCard(
                  icon: Icons.description_outlined,
                  iconColor: const Color(0xFF6D28D9),
                  label: 'Total Liability',
                  value: '₹${NumberFormat('#,##,###').format(overview.totalLiability)}',
                  onTap: () => controller.viewDetails('Total Liability'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildOverviewCard(
                  icon: Icons.credit_card,
                  iconColor: const Color(0xFF3B82F6),
                  label: 'Input Tax Credit',
                  value: '₹${NumberFormat('#,##,###').format(overview.inputTaxCredit)}',
                  onTap: () => controller.viewDetails('Input Tax Credit'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildOverviewCard(
                  icon: Icons.account_balance_wallet_outlined,
                  iconColor: const Color(0xFF10B981),
                  label: 'Net Payable',
                  value: '₹${NumberFormat('#,##,###').format(overview.netPayable)}',
                  onTap: () => controller.viewDetails('Net Payable'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildOverviewCard(
                  icon: Icons.file_present_outlined,
                  iconColor: const Color(0xFFF59E0B),
                  label: 'Filed Returns',
                  value: '${overview.filedReturns} / ${overview.totalReturns}',
                  onTap: controller.viewHistory,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                if (onTap != null)
                  const Icon(
                    Icons.arrow_forward,
                    color: AppColors.textMuted,
                    size: 16,
                  ),
              ],
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
      ),
    );
  }

  Widget _buildDetailsSection() {
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
                'My GST Details',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              GestureDetector(
                onTap: controller.editGSTDetails,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryButtonBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryButtonBlue,
                        size: 14,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Edit',
                        style: TextStyle(
                          color: AppColors.primaryButtonBlue,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildDetailRow(Icons.business, 'Business Name', "VMOVEXA Advertising Pvt. Ltd."),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.receipt_long, 'GSTIN', "27AABCV1234D1Z5"),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.location_on_outlined, 'State', "Maharashtra (27)"),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.category_outlined, 'Business Type', "Regular"),
          const SizedBox(height: 16),
          _buildDetailRow(
            Icons.calendar_today,
            'GST Registration Date',
            '01 Apr 2024'
            // DateFormat('dd MMM yyyy').format(details.registrationDate),
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            Icons.check_circle,
            'GST Status',
           "Monthly",
            valueColor: Colors.redAccent,
          ),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.schedule, 'Returns Filing Frequency', "details.filingFrequency.label"),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.percent, 'Composition Scheme', /*details.compositionScheme ? 'Yes' :*/ 'No'),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.email_outlined, 'Primary Email', "finance@vmovexa.com"),
          const SizedBox(height: 16),
          _buildDetailRow(Icons.phone_outlined, 'Primary Contact', "+91 98765 43210"),
          const SizedBox(height: 20),
          // if (details.isVerified)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color:  AppColors.cardBg.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.verified,
                    color: Colors.white,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'GST Details Verified\nYour GST details are verified and up to date.',
                      style: TextStyle(
                        color:  Colors.white,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.inputBg,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            color: AppColors.textSecondary,
            size: 18,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  color: valueColor ?? AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
