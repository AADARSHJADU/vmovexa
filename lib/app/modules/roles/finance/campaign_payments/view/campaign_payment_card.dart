import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/campaign_payments_controller.dart';
import '../model/campaign_payment_model.dart';

class CampaignPaymentCard extends StatelessWidget {
  final CampaignPaymentModel campaign;
  final CampaignPaymentsController controller;

  const CampaignPaymentCard({
    super.key,
    required this.campaign,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: campaign.isLive
              ? const Color(0xFF10B981).withValues(alpha: 0.35)
              : const Color(0xFF334155),
          width: campaign.isLive ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => controller.onCampaignTap(campaign),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Code Badge + Status Badge + Payment Pill
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Monospace Code Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Text(
                        campaign.code,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF94A3B8),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Status Badge (Live, Approved, Completed, Paused, Rejected)
                    _buildStatusBadge(campaign.status),

                    const Spacer(),

                    // Payment Pill (Paid / Pending)
                    _buildPaymentPill(campaign.isPaid),
                  ],
                ),
                const SizedBox(height: 12),

                // Title & Brand Name
                Text(
                  campaign.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    height: 1.25,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (campaign.brandName.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.sell_outlined, size: 13, color: Color(0xFF818CF8)),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          campaign.brandName,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),

                // Client Details Snippet
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF334155).withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF334155),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.person_outline, size: 14, color: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              campaign.clientDisplayName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (campaign.clientPhone.isNotEmpty || campaign.clientEmail.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                campaign.clientPhone.isNotEmpty ? campaign.clientPhone : campaign.clientEmail,
                                style: const TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 11,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (campaign.durationDays > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 11, color: Color(0xFF94A3B8)),
                              const SizedBox(width: 4),
                              Text(
                                '${campaign.durationDays} ${'days'.tr}',
                                style: const TextStyle(
                                  color: Color(0xFFCBD5E1),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Amount Breakdown Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'total_amount_inc_gst'.tr,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '₹${campaign.totalPayable.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '${'base'.tr}: ₹${campaign.budget.toStringAsFixed(0)} + ${'gst'.tr}: ₹${campaign.taxAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Divider
                Container(height: 1, color: const Color(0xFF334155)),
                const SizedBox(height: 12),

                // Bottom Action Buttons
                Row(
                  children: [
                    if (!campaign.isPaid) ...[
                      // Share Link Button
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => controller.openShareModal(campaign),
                          icon: const Icon(Icons.share_outlined, size: 14, color: Color(0xFF818CF8)),
                          label: Text(
                            'share_link'.tr,
                            style: const TextStyle(
                              color: Color(0xFF818CF8),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF4F46E5)),
                            backgroundColor: const Color(0xFF4F46E5).withValues(alpha: 0.12),
                            padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Record Payment Button
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => controller.openRecordPaymentModal(campaign),
                          icon: const Icon(Icons.payments_outlined, size: 14, color: Color(0xFF10B981)),
                          label: Text(
                            'record_payment'.tr,
                            style: const TextStyle(
                              color: Color(0xFF10B981),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF10B981)),
                            backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.12),
                            padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],

                    // View Details Button with primaryGradient
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.gradientBlue.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(10),
                            onTap: () => controller.onCampaignTap(campaign),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'view_details'.tr,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.arrow_forward, size: 13, color: Colors.white),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color border;
    Color text;
    String label = status.toUpperCase();
    bool isPulse = false;

    switch (status.toLowerCase()) {
      case 'live':
        bg = const Color(0xFF064E3B).withValues(alpha: 0.6);
        border = const Color(0xFF059669);
        text = const Color(0xFF34D399);
        isPulse = true;
        break;
      case 'approved':
        bg = const Color(0xFF1E3A8A).withValues(alpha: 0.6);
        border = const Color(0xFF2563EB);
        text = const Color(0xFF60A5FA);
        break;
      case 'completed':
        bg = const Color(0xFF334155).withValues(alpha: 0.6);
        border = const Color(0xFF475569);
        text = const Color(0xFFCBD5E1);
        break;
      case 'paused':
        bg = const Color(0xFF78350F).withValues(alpha: 0.6);
        border = const Color(0xFFD97706);
        text = const Color(0xFFFBBF24);
        break;
      case 'rejected':
        bg = const Color(0xFF7F1D1D).withValues(alpha: 0.6);
        border = const Color(0xFFDC2626);
        text = const Color(0xFFF87171);
        break;
      default:
        bg = const Color(0xFF1E293B);
        border = const Color(0xFF475569);
        text = const Color(0xFF94A3B8);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isPulse) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: text,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentPill(bool isPaid) {
    if (isPaid) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF064E3B).withValues(alpha: 0.45),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF059669)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, size: 11, color: Color(0xFF34D399)),
            const SizedBox(width: 4),
            Text(
              'paid'.tr.toUpperCase(),
              style: const TextStyle(
                color: Color(0xFF34D399),
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF78350F).withValues(alpha: 0.45),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD97706)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.hourglass_empty, size: 11, color: Color(0xFFFBBF24)),
            const SizedBox(width: 4),
            Text(
              'pending'.tr.toUpperCase(),
              style: const TextStyle(
                color: Color(0xFFFBBF24),
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    }
  }
}
