import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/work_order_model.dart';
import '../controllers/technician_request_details_controller.dart';

class TechnicianRequestDetailsView extends GetView<TechnicianRequestDetailsController> {
  const TechnicianRequestDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(),

            // Content Body
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.order.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF3B82F6)),
                  );
                }

                final order = controller.order.value;
                if (order == null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.info_outline_rounded, color: AppColors.textMuted, size: 44),
                        const SizedBox(height: 10),
                        const Text(
                          'Work order record not found.',
                          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 14),
                        CustomButton(
                          text: 'Back to Work Orders',
                          onTap: () => Get.back(),
                          width: 180,
                          height: 42,
                        ),
                      ],
                    ),
                  );
                }

                final isEditable = !['resolved', 'closed', 'rejected'].contains(order.status.toLowerCase());

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card
                      _buildHeaderCard(order, isEditable),
                      const SizedBox(height: 16),

                      // 4-Stat Overview Grid
                      _buildOverviewGrid(order),
                      const SizedBox(height: 16),

                      // Problem Scope Specifications Card
                      _buildProblemScopeCard(order),
                      const SizedBox(height: 16),

                      // Assigned Technician Card
                      _buildTechnicianCard(order.technician),
                      const SizedBox(height: 16),

                      // Audit Trail & Timeline Card
                      _buildTimelineCard(order),
                      const SizedBox(height: 30),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CustomBackButton(),
          const Text(
            'Work Order Details',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchOrderDetails(),
            tooltip: 'Refresh Order',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(WorkOrderModel order, bool isEditable) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      order.code,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                    _buildUrgencyBadge(order.urgency),
                    _buildStatusCapsule(order.status),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Service: ${order.issueCategory}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Requested: ${order.requestedAt != null ? _formatDateTime(order.requestedAt!) : 'Recent'}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 10.5,
              fontFamily: 'monospace',
            ),
          ),
          if (isEditable) ...[
            const SizedBox(height: 14),
            CustomButton(
              text: 'Edit Request Details',
              prefixIcon: const Icon(Icons.edit_outlined, size: 15, color: Colors.white),
              onTap: controller.openEditOrder,
              height: 44,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOverviewGrid(WorkOrderModel order) {
    final hasTech = order.technician != null && order.technician!.name.isNotEmpty && order.technician!.name != 'Awaiting Dispatch';

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.8,
      children: [
        _buildOverviewItem(
          title: 'TARGET DEPOT',
          value: order.depotName,
          subtitle: 'Service facility',
          valColor: Colors.white,
        ),
        _buildOverviewItem(
          title: 'TARGET BUS',
          value: order.busNumber,
          subtitle: 'Unit requiring service',
          valColor: const Color(0xFF60A5FA),
          isMono: true,
        ),
        _buildOverviewItem(
          title: 'ASSIGNED ENGINEER',
          value: hasTech ? order.technician!.name : 'Awaiting Dispatch',
          subtitle: hasTech ? 'Central Field Tech' : 'Pool queue',
          valColor: hasTech ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
        ),
        _buildOverviewItem(
          title: 'CURRENT STATUS',
          value: order.status.replaceFirst('_', ' ').toUpperCase(),
          subtitle: 'Dispatch state',
          valColor: Colors.white,
        ),
      ],
    );
  }

  Widget _buildOverviewItem({
    required String title,
    required String value,
    required String subtitle,
    required Color valColor,
    bool isMono = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 7.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.4,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 12.5,
              fontWeight: FontWeight.w900,
              fontFamily: isMono ? 'monospace' : null,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 9,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildProblemScopeCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PROBLEM SCOPE & SYMPTOMS',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Issue Classification', order.issueCategory),
          const SizedBox(height: 10),
          _buildInfoRow('Detailed Symptoms', order.description.isNotEmpty ? order.description : 'No symptoms notes provided'),
          if (order.instructions != null && order.instructions!.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildInfoRow('Special Instructions', order.instructions!),
          ],
          if (order.resolutionNotes != null && order.resolutionNotes!.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildInfoRow('Resolution Notes', order.resolutionNotes!, valColor: const Color(0xFF34D399)),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? valColor}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: valColor ?? Colors.white,
            fontSize: 11.5,
            height: 1.3,
          ),
        ),
      ],
    );
  }

  Widget _buildTechnicianCard(WorkOrderTechnician? tech) {
    final hasTech = tech != null && tech.name.isNotEmpty && tech.name != 'Awaiting Dispatch';
    final initial = hasTech ? tech.name[0].toUpperCase() : 'T';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'ASSIGNED CENTRAL ENGINEER',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: hasTech
                    ? const Color(0xFF064E3B).withValues(alpha: 0.5)
                    : const Color(0xFF1E212D),
                child: Text(
                  initial,
                  style: TextStyle(
                    color: hasTech ? const Color(0xFF34D399) : AppColors.textMuted,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hasTech ? tech.name : 'Awaiting Dispatch from Central Pool',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      hasTech ? (tech.phone.isNotEmpty ? tech.phone : tech.email) : 'Ticket queued with super admin pool',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                    Text(
                      hasTech ? tech.certLevel : 'Tier Level 1-3 Dispatch',
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 9.5,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (hasTech && tech.phone.isNotEmpty) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: controller.callTechnician,
                icon: const Icon(Icons.call_rounded, size: 15, color: Colors.white),
                label: Text(
                  'Call Technician (${tech.name.split(' ')[0]})',
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1F2937),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: const BorderSide(color: AppColors.cardBorder),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineCard(WorkOrderModel order) {
    final timeline = order.timeline;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AUDIT TRAIL & DISPATCH TIMELINE',
            style: TextStyle(
              color: Colors.white,
              fontSize: 11.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 14),
          if (timeline.isEmpty) ...[
            _buildTimelineStep(
              title: 'Work Order Filed',
              description: 'Submitted to VMOVEXA Central Pool by Depot Supervisor',
              timestamp: order.requestedAt != null ? _formatDateTime(order.requestedAt!) : 'Recent',
              isLast: true,
              isCompleted: true,
            ),
          ] else ...[
            for (int i = 0; i < timeline.length; i++)
              _buildTimelineStep(
                title: timeline[i].title,
                description: timeline[i].description,
                timestamp: _formatDateTime(timeline[i].timestamp),
                isLast: i == timeline.length - 1,
                isCompleted: true,
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineStep({
    required String title,
    required String description,
    required String timestamp,
    required bool isLast,
    required bool isCompleted,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(
              isCompleted ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isCompleted ? const Color(0xFF10B981) : AppColors.textMuted,
              size: 16,
            ),
            if (!isLast)
              Container(
                width: 1.5,
                height: 36,
                color: AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    timestamp,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 9.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 10.5,
                ),
              ),
              if (!isLast) const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUrgencyBadge(String urgency) {
    Color color;
    Color bg;
    String label = urgency.toUpperCase();

    switch (urgency.toLowerCase()) {
      case 'critical':
        color = const Color(0xFFF43F5E);
        bg = const Color(0xFF881337).withValues(alpha: 0.3);
        break;
      case 'high':
        color = const Color(0xFFF59E0B);
        bg = const Color(0xFF78350F).withValues(alpha: 0.3);
        break;
      case 'low':
        color = const Color(0xFF10B981);
        bg = const Color(0xFF064E3B).withValues(alpha: 0.3);
        break;
      case 'normal':
      default:
        color = const Color(0xFF60A5FA);
        bg = const Color(0xFF1E3A8A).withValues(alpha: 0.3);
        label = 'NORMAL';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatusCapsule(String status) {
    Color bg;
    Color border;
    Color text;
    String label;
    bool showPulse = false;

    final s = status.toLowerCase();
    if (s.contains('resolved') || s.contains('closed')) {
      bg = const Color(0xFF064E3B).withValues(alpha: 0.3);
      border = const Color(0xFF059669);
      text = const Color(0xFF34D399);
      label = 'Resolved & Tested';
    } else if (s.contains('dispatched')) {
      bg = const Color(0xFF1E3A8A).withValues(alpha: 0.3);
      border = const Color(0xFF2563EB);
      text = const Color(0xFF60A5FA);
      label = 'Dispatched to Depot';
    } else if (s.contains('on_site') || s.contains('on site')) {
      bg = const Color(0xFF78350F).withValues(alpha: 0.3);
      border = const Color(0xFFD97706);
      text = const Color(0xFFFBBF24);
      label = 'On Site';
      showPulse = true;
    } else if (s.contains('rejected')) {
      bg = const Color(0xFF881337).withValues(alpha: 0.3);
      border = const Color(0xFFE11D48);
      text = const Color(0xFFFB7185);
      label = 'Rejected';
    } else {
      bg = const Color(0xFF78350F).withValues(alpha: 0.2);
      border = const Color(0xFFD97706).withValues(alpha: 0.6);
      text = const Color(0xFFFBBF24);
      label = 'Pending Assignment';
      showPulse = true;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border.withValues(alpha: 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showPulse) ...[
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                color: text,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: TextStyle(
              color: text,
              fontSize: 9.5,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final amPm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}, $hour:$min $amPm';
    } catch (_) {
      return raw;
    }
  }
}
