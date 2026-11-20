import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../data/models/work_order_model.dart';
import '../controllers/driver_work_order_details_controller.dart';

class DriverWorkOrderDetailsView extends GetView<DriverWorkOrderDetailsController> {
  const DriverWorkOrderDetailsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(),

            // Content
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value && controller.order.value == null) {
                  return const Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gradientBlue),
                    ),
                  );
                }

                final order = controller.order.value;
                if (order == null) {
                  return Center(
                    child: Text(
                      'work_order_not_found'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  );
                }

                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Progression Stepper
                      _buildStatusProgressStepper(order),
                      const SizedBox(height: 16),

                      // Assigned Technician Card
                      _buildTechnicianCard(order),
                      const SizedBox(height: 16),

                      // Vehicle & Issue Details
                      _buildDetailsCard(order),
                      const SizedBox(height: 16),

                      // Rate Technician Section (if resolved/completed)
                      if (_isResolved(order.status)) ...[
                        _buildRateTechnicianCard(),
                        const SizedBox(height: 16),
                      ],

                      const SizedBox(height: 24),
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
          Obx(() {
            final code = controller.order.value?.code ?? 'Work Order';
            return Text(
              code,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.2,
              ),
            );
          }),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchOrderDetails(),
            tooltip: 'refresh'.tr,
          ),
        ],
      ),
    );
  }

  Widget _buildStatusProgressStepper(WorkOrderModel order) {
    final status = order.status.toLowerCase();
    final steps = [
      {'title': 'status_submitted'.tr, 'stage': 1},
      {'title': 'status_dispatched'.tr, 'stage': 2},
      {'title': 'status_on_site'.tr, 'stage': 3},
      {'title': 'status_resolved'.tr, 'stage': 4},
    ];

    int activeStage = 1;
    if (status == 'dispatched' || status == 'assigned') {
      activeStage = 2;
    } else if (status == 'on_site' || status == 'in_progress') {
      activeStage = 3;
    } else if (status == 'resolved' || status == 'completed' || status == 'closed') {
      activeStage = 4;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'repair_lifecycle'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: List.generate(steps.length * 2 - 1, (index) {
              if (index.isEven) {
                final stepIndex = index ~/ 2;
                final stepStage = steps[stepIndex]['stage'] as int;
                final isDone = activeStage >= stepStage;
                final isCurrent = activeStage == stepStage;

                return Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        gradient: isDone ? AppTheme.primaryGradient : null,
                        color: isDone ? null : Colors.white.withValues(alpha: 0.08),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isCurrent ? Colors.white : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          isDone ? Icons.check_rounded : Icons.circle_rounded,
                          size: isDone ? 16 : 8,
                          color: isDone ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      steps[stepIndex]['title'] as String,
                      style: TextStyle(
                        color: isDone ? Colors.white : AppColors.textSecondary,
                        fontSize: 10,
                        fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ],
                );
              } else {
                final precedingStep = (index - 1) ~/ 2;
                final isPassed = activeStage > (steps[precedingStep]['stage'] as int);

                return Expanded(
                  child: Container(
                    height: 2.5,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      gradient: isPassed ? AppTheme.primaryGradient : null,
                      color: isPassed ? null : Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildTechnicianCard(WorkOrderModel order) {
    final tech = order.technician;
    final hasTech = tech != null && tech.name.isNotEmpty && tech.name != 'Awaiting Dispatch';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'assigned_technician_title'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: hasTech
                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                      : Colors.orange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  hasTech ? 'assigned'.tr : 'pending_dispatch'.tr,
                  style: TextStyle(
                    color: hasTech ? const Color(0xFF10B981) : Colors.orangeAccent,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (hasTech) ...[
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      tech.name.isNotEmpty ? tech.name[0].toUpperCase() : 'T',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
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
                        tech.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        tech.certLevel.isNotEmpty ? tech.certLevel : 'Central Field Technician',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            InkWell(
              onTap: controller.callTechnician,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.phone_rounded, color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'call_technician_btn'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.orangeAccent, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'technician_not_assigned'.tr,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailsCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'defect_information'.tr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('category'.tr, order.issueCategory),
          _buildInfoRow('vehicle_bus'.tr, order.busNumber),
          _buildInfoRow('depot'.tr, order.depotName),
          _buildInfoRow('urgency'.tr, order.urgency.toUpperCase()),
          if (order.requestedAt != null && order.requestedAt!.isNotEmpty)
            _buildInfoRow('requested_at'.tr, order.requestedAt!),
          if (order.slaDueAt != null && order.slaDueAt!.isNotEmpty)
            _buildInfoRow('sla_target'.tr, order.slaDueAt!),

          const SizedBox(height: 10),
          const Divider(color: AppColors.cardBorder, height: 1),
          const SizedBox(height: 10),

          Text(
            'issue_description_label'.tr,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            order.description.isNotEmpty ? order.description : 'No description provided.',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              height: 1.4,
            ),
          ),

          if (order.instructions != null && order.instructions!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              'technician_instructions_label'.tr,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              order.instructions!,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
          ),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildRateTechnicianCard() {
    return Obx(() {
      final isRated = controller.isRated.value;

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 20),
                const SizedBox(width: 8),
                Text(
                  'rate_technician_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (isRated) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'rating_submitted_success'.tr,
                        style: const TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // 5 Star Selector
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) {
                    final starNumber = index + 1;
                    final isSelected = starNumber <= controller.userRating.value;

                    return IconButton(
                      icon: Icon(
                        isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: isSelected ? const Color(0xFFF59E0B) : AppColors.textSecondary,
                        size: 32,
                      ),
                      onPressed: () => controller.userRating.value = starNumber,
                    );
                  }),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: TextField(
                  controller: controller.feedbackController,
                  maxLines: 2,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'rating_feedback_hint'.tr,
                    hintStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(10),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'submit_rating_btn'.tr,
                isLoading: controller.isSubmittingRating.value,
                onTap: controller.submitRating,
                height: 44,
              ),
            ],
          ],
        ),
      );
    });
  }

  bool _isResolved(String status) {
    final s = status.toLowerCase();
    return s == 'resolved' || s == 'completed' || s == 'closed';
  }
}
