import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/models/government_models.dart';
import '../../../../../theme/app_colors.dart';
import '../controllers/government_dashboard_controller.dart';

class GovEmergencyDetailsSheet extends StatelessWidget {
  final EmergencyBroadcastModel broadcast;

  const GovEmergencyDetailsSheet({
    super.key,
    required this.broadcast,
  });

  static void show(BuildContext context, EmergencyBroadcastModel item) {
    Get.bottomSheet(
      GovEmergencyDetailsSheet(broadcast: item),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<GovernmentDashboardController>();
    final isAct = broadcast.isLiveOverride;
    final sevColor = broadcast.severityColor;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF131826),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.6),
            blurRadius: 24,
            spreadRadius: 4,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isAct
                        ? const Color(0xFFEF4444).withOpacity(0.2)
                        : Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isAct
                          ? const Color(0xFFEF4444).withOpacity(0.5)
                          : AppColors.cardBorder,
                      width: 1.2,
                    ),
                  ),
                  child: Center(
                    child: SvgPicture.asset(
                      'assets/icons/critical.svg',
                      width: 22,
                      height: 22,
                      colorFilter: ColorFilter.mode(
                        isAct ? const Color(0xFFEF4444) : Colors.white60,
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        broadcast.displayHeadline,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Text(
                            broadcast.displayCode,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 10.5,
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _buildStatusBadge(broadcast),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),
          const Divider(color: AppColors.cardBorder, height: 1),

          // Scrollable Body
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Severity & Scope Badges Bar
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: sevColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: sevColor.withOpacity(0.4), width: 1),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.warning_amber_rounded, size: 12, color: sevColor),
                            const SizedBox(width: 5),
                            Text(
                              '${broadcast.displaySeverity} SEVERITY',
                              style: TextStyle(
                                color: sevColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.35), width: 1),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.gps_fixed_rounded, size: 11, color: Color(0xFF60A5FA)),
                            const SizedBox(width: 5),
                            Text(
                              broadcast.displayScope,
                              style: const TextStyle(
                                color: Color(0xFF60A5FA),
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Issuing Authority
                  _buildSectionHeader('gov_emergency.details_authority'.tr, Icons.account_balance_outlined),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Text(
                      broadcast.authority ?? 'State Public Transit Department',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Alert Message Content
                  _buildSectionHeader('gov_emergency.message_label'.tr, Icons.campaign_rounded),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1),
                    ),
                    child: Text(
                      broadcast.message?.isNotEmpty == true
                          ? broadcast.message!
                          : (broadcast.bodyText ?? 'No description provided'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        height: 1.45,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Attached Media (if any)
                  if (broadcast.mediaUrl != null && broadcast.mediaUrl!.isNotEmpty) ...[
                    _buildSectionHeader('gov_emergency.attached_media'.tr, Icons.image_outlined),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: double.infinity,
                        height: 160,
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Image.network(
                          broadcast.resolvedMediaUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.broken_image_rounded, color: AppColors.textMuted, size: 36),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Details Grid: Timing & Scope
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          'gov_emergency.details_created_at'.tr,
                          broadcast.createdAt != null
                              ? DateFormat('dd MMM yyyy, hh:mm a').format(broadcast.createdAt!)
                              : '—',
                          Icons.schedule_rounded,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildInfoCard(
                          'gov_emergency.details_expiry'.tr,
                          broadcast.displayDuration,
                          Icons.timelapse_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          'gov_emergency.buses_affected'.tr,
                          '${broadcast.affectedBusesCount} Displays Active',
                          Icons.directions_bus_rounded,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildInfoCard(
                          'gov_emergency.details_helpline'.tr,
                          broadcast.emergencyNumber?.isNotEmpty == true
                              ? broadcast.emergencyNumber!
                              : '112 / 108',
                          Icons.phone_in_talk_rounded,
                          isPhone: broadcast.emergencyNumber?.isNotEmpty == true,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Revoke / Delete Actions
                  if (broadcast.isRevocable && broadcast.id != null) ...[
                    Container(
                      width: double.infinity,
                      height: 46,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFEF4444).withOpacity(0.35),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Get.back();
                          _showRevokeConfirmDialog(controller, broadcast);
                        },
                        icon: const Icon(Icons.cancel_outlined, color: Colors.white, size: 16),
                        label: Text(
                          'gov_emergency.revoke_broadcast'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],

                  if (broadcast.canDelete && broadcast.id != null) ...[
                    Container(
                      width: double.infinity,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.6), width: 1.2),
                      ),
                      child: TextButton.icon(
                        onPressed: () {
                          Get.back();
                          _showDeleteConfirmDialog(controller, broadcast);
                        },
                        icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 16),
                        label: Text(
                          'gov_emergency.delete_broadcast'.tr,
                          style: const TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.textSecondary),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String label, String value, IconData icon, {bool isPhone = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 13, color: AppColors.textMuted),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          GestureDetector(
            onTap: isPhone
                ? () {
                    final uri = Uri.parse('tel:$value');
                    launchUrl(uri);
                  }
                : null,
            child: Text(
              value,
              style: TextStyle(
                color: isPhone ? const Color(0xFF60A5FA) : Colors.white,
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                decoration: isPhone ? TextDecoration.underline : TextDecoration.none,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(EmergencyBroadcastModel item) {
    if (item.isLiveOverride) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.5), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.circle, color: Color(0xFF10B981), size: 6),
            SizedBox(width: 4),
            Text(
              'LIVE OVERRIDE',
              style: TextStyle(
                color: Color(0xFF10B981),
                fontSize: 8.5,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }
    if (item.isPendingApproval) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFF59E0B).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'PENDING REVIEW',
          style: TextStyle(
            color: Color(0xFFF59E0B),
            fontSize: 8.5,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    if (item.isApproved) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF3B82F6).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'APPROVED',
          style: TextStyle(
            color: Color(0xFF3B82F6),
            fontSize: 8.5,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    if (item.isRevoked) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFFEF4444).withOpacity(0.18),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Text(
          'REVOKED',
          style: TextStyle(
            color: Color(0xFFEF4444),
            fontSize: 8.5,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Text(
        'EXPIRED',
        style: TextStyle(
          color: AppColors.textMuted,
          fontSize: 8.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showRevokeConfirmDialog(GovernmentDashboardController controller, EmergencyBroadcastModel item) {
    Get.defaultDialog(
      title: 'gov_emergency.confirm_revoke_title'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
      middleText: 'gov_emergency.confirm_revoke_desc'.tr,
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 12),
      backgroundColor: const Color(0xFF151828),
      textConfirm: 'gov_emergency.revoke_broadcast'.tr,
      textCancel: 'common.cancel'.tr,
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white60,
      buttonColor: const Color(0xFFEF4444),
      onConfirm: () {
        Get.back();
        if (item.id != null) {
          controller.revokeEmergencyAlert(item.id!);
        }
      },
    );
  }

  void _showDeleteConfirmDialog(GovernmentDashboardController controller, EmergencyBroadcastModel item) {
    Get.defaultDialog(
      title: 'gov_emergency.confirm_delete_title'.tr,
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
      middleText: 'gov_emergency.confirm_delete_desc'.tr,
      middleTextStyle: const TextStyle(color: Colors.white70, fontSize: 12),
      backgroundColor: const Color(0xFF151828),
      textConfirm: 'gov_emergency.delete_broadcast'.tr,
      textCancel: 'common.cancel'.tr,
      confirmTextColor: Colors.white,
      cancelTextColor: Colors.white60,
      buttonColor: const Color(0xFFEF4444),
      onConfirm: () {
        Get.back();
        if (item.id != null) {
          controller.deleteEmergencyBroadcast(item.id!);
        }
      },
    );
  }
}
