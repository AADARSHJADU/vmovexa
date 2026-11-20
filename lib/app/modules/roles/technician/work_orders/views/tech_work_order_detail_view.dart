import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_work_order_detail_controller.dart';
import 'work_order_resolution_sheet.dart';

class TechWorkOrderDetailView extends GetView<TechWorkOrderDetailController> {
  const TechWorkOrderDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Obx(() {
          final ord = controller.order.value;
          return Text(
            ord != null ? ord.code : 'work_order_details'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          );
        }),
        actions: [
          IconButton(
            tooltip: 'refresh'.tr,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: () => controller.fetchDetail(),
          ),
        ],
      ),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.order.value == null) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFF6366F1)),
            );
          }

          final order = controller.order.value;
          if (order == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 48),
                    const SizedBox(height: 12),
                    Text(
                      'work_order_not_found'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'work_order_not_found_desc'.tr,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => Get.back(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                      ),
                      child: Text('back_to_work_orders'.tr),
                    ),
                  ],
                ),
              ),
            );
          }

          final sla = controller.slaInfo;
          final isResolved = order.status.toLowerCase() == 'resolved' ||
              order.status.toLowerCase() == 'completed' ||
              order.status.toLowerCase() == 'closed';
          final isOnSite = order.status.toLowerCase() == 'on_site' ||
              order.status.toLowerCase() == 'in_progress';
          final isDispatched = order.status.toLowerCase() == 'dispatched' ||
              order.status.toLowerCase() == 'submitted' ||
              order.status.toLowerCase() == 'approved';

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. Top Header Banner
                      _buildHeaderBanner(context, order, sla),
                      const SizedBox(height: 14),

                      // 2. Field Execution Lifecycle Stepper
                      _buildLifecycleStepper(order),
                      const SizedBox(height: 14),

                      // 3. Issue & Symptoms Card
                      _buildIssueSymptomsCard(order),
                      const SizedBox(height: 14),

                      // 4. Resolution Summary Card (if resolved/closed)
                      if (isResolved) ...[
                        _buildResolutionSummaryCard(order),
                        const SizedBox(height: 14),
                      ],

                      // 5. Target Vehicle Information Card
                      _buildVehicleCard(order),
                      const SizedBox(height: 14),

                      // 6. Maintenance Depot Location Card
                      _buildDepotCard(order),
                      const SizedBox(height: 14),

                      // 7. Activity Logs & Audit History
                      _buildAuditTrailCard(order),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),

              // Sticky Bottom Action Bar
              _buildBottomActionBar(order, isDispatched, isOnSite, isResolved),
            ],
          );
        }),
      ),
    );
  }

  // 1. Top Header Banner (Code, SLA, Badges, Date)
  Widget _buildHeaderBanner(BuildContext context, WorkOrderModel order, Map<String, dynamic> sla) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      order.code,
                      style: const TextStyle(
                        color: Color(0xFF818CF8),
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 4),
                    InkWell(
                      onTap: controller.copyCode,
                      child: const Icon(Icons.copy_rounded, color: Color(0xFF818CF8), size: 14),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _buildUrgencyPill(order.urgency),
              const Spacer(),
              _buildStatusPill(order.status),
            ],
          ),
          const SizedBox(height: 10),

          // SLA countdown pill
          if (sla['text'] != null && sla['text'] != '—') ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: sla['bg'] as Color? ?? Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: (sla['color'] as Color? ?? Colors.transparent).withValues(alpha: 0.4),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (sla['icon'] != null) ...[
                    Icon(sla['icon'] as IconData, size: 13, color: sla['color'] as Color?),
                    const SizedBox(width: 5),
                  ],
                  Text(
                    sla['text'].toString(),
                    style: TextStyle(
                      color: sla['color'] as Color? ?? Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],

          // Assigned on date & assigned by
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 12, color: Colors.white38),
              const SizedBox(width: 5),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Text(
                    '${'assigned_on'.tr} ${order.dispatchedAt != null
                        ? DateFormat('MM/dd/yyyy, hh:mm:ss a').format(
                      DateTime.parse(order.dispatchedAt!).toLocal(),
                    )
                        : '—'}',
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                    ),
                  ),

                  if (order.assignedByName != null && order.assignedByName!.isNotEmpty) ...[
                    const SizedBox(width: 4),
                    Text(
                      '${'by'.tr} ${order.assignedByName}',
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ],
              ),

            ],
          ),
        ],
      ),
    );
  }

  // 2. Field Execution Lifecycle Stepper (3 Stages)
  Widget _buildLifecycleStepper(WorkOrderModel order) {
    final status = order.status.toLowerCase();
    final step1Done = true;
    final step2Done = status == 'on_site' || status == 'resolved' || status == 'completed' || status == 'closed';
    final step2Active = status == 'on_site' || status == 'in_progress';
    final step3Done = status == 'resolved' || status == 'completed' || status == 'closed';
    final step3Active = status == 'resolved';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.timeline_rounded, color: Color(0xFF38BDF8), size: 18),
              const SizedBox(width: 8),
              Text(
                'field_execution_lifecycle'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Stepper Grid
          Row(
            children: [
              Expanded(
                child: _buildStepItem(
                  title: '1. ${'dispatched'.tr}',
                  subtitle: order.dispatchedAt != null ? _formatTime(order.dispatchedAt!) : 'recorded'.tr,
                  isDone: step1Done,
                  isActive: false,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStepItem(
                  title: '2. ${'arrived_on_site'.tr}',
                  subtitle: order.onSiteAt != null
                      ? _formatTime(order.onSiteAt!)
                      : (step2Done ? 'recorded'.tr : 'pending_arrival'.tr),
                  isDone: step2Done,
                  isActive: step2Active,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildStepItem(
                  title: '3. ${'resolved_tested'.tr}',
                  subtitle: order.resolvedAt != null
                      ? _formatTime(order.resolvedAt!)
                      : (step3Done ? 'recorded'.tr : 'pending'.tr),
                  isDone: step3Done,
                  isActive: step3Active,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem({
    required String title,
    required String subtitle,
    required bool isDone,
    required bool isActive,
  }) {
    Color borderColor;
    Color bgColor;
    if (isActive) {
      borderColor = const Color(0xFF38BDF8);
      bgColor = const Color(0xFF38BDF8).withValues(alpha: 0.12);
    } else if (isDone) {
      borderColor = const Color(0xFF10B981).withValues(alpha: 0.4);
      bgColor = const Color(0xFF10B981).withValues(alpha: 0.08);
    } else {
      borderColor = const Color(0xFF1E293B);
      bgColor = const Color(0xFF0F172A);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: isActive ? Colors.white : (isDone ? const Color(0xFF34D399) : Colors.white60),
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isDone)
                const Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF10B981))
              else if (isActive)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: Color(0xFF38BDF8),
                    shape: BoxShape.circle,
                  ),
                )
              else
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white24),
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(color: Colors.white38, fontSize: 9.5),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // 3. Issue & Symptoms Card
  Widget _buildIssueSymptomsCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.description_outlined, color: Color(0xFF6366F1), size: 18),
              const SizedBox(width: 8),
              Text(
                'issue_symptoms'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Category Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.3)),
            ),
            child: Text(
              order.issueCategory,
              style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 10),

          // Reported Problem Description
          Text(
            'reported_problem'.tr,
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Text(
              order.description.isNotEmpty ? order.description : 'no_desc_provided'.tr,
              style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
            ),
          ),

          // Special Instructions (if any)
          if (order.instructions != null && order.instructions!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              'special_instructions'.tr,
              style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Text(
                order.instructions!,
                style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 12, height: 1.4),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 4. Resolution Summary Card (if resolved)
  Widget _buildResolutionSummaryCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF065F46).withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
              const SizedBox(width: 8),
              Text(
                'work_order_resolved'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          if (order.resolvedAt != null)
            Text(
              '${'completed_on'.tr} ${order.resolvedAt}',
              style: const TextStyle(color: Colors.white60, fontSize: 11),
            ),

          if (order.resolutionNotes != null && order.resolutionNotes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                order.resolutionNotes!,
                style: const TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.3),
              ),
            ),
          ],

          if (order.partsReplaced.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              'parts_replaced_optional'.tr,
              style: const TextStyle(color: Colors.white60, fontSize: 10.5, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: order.partsReplaced.map((part) {
                return Chip(
                  label: Text(part, style: const TextStyle(color: Colors.white, fontSize: 10)),
                  backgroundColor: const Color(0xFF1E293B),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  // 5. Target Vehicle Card
  Widget _buildVehicleCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 18),
              const SizedBox(width: 8),
              Text(
                'target_vehicle'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Bus Registration
          _buildInfoRow(
            label: 'bus_registration'.tr,
            value: order.busNumber,
            isHighlight: true,
          ),
          if (order.vehicleModel != null && order.vehicleModel!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildInfoRow(
              label: 'chassis_model'.tr,
              value: order.vehicleModel!,
            ),
          ],
          if (order.organizationName != null && order.organizationName!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildInfoRow(
              label: 'operating_fleet'.tr,
              value: order.organizationName!,
            ),
          ],
        ],
      ),
    );
  }

  // 6. Maintenance Depot Location Card
  Widget _buildDepotCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.location_on_rounded, color: Color(0xFFF59E0B), size: 18),
              const SizedBox(width: 8),
              Text(
                'maintenance_depot'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          _buildInfoRow(
            label: 'depot_name'.tr,
            value: order.depotName,
            isHighlight: true,
          ),
          if (order.depotAddress != null && order.depotAddress!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildInfoRow(
              label: 'location_address'.tr,
              value: order.depotAddress!,
            ),
          ],
          if (order.maintenanceBay != null && order.maintenanceBay!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildInfoRow(
              label: 'maintenance_bay'.tr,
              value: order.maintenanceBay!,
            ),
          ],
        ],
      ),
    );
  }

  // 7. Activity Logs & Audit History
  Widget _buildAuditTrailCard(WorkOrderModel order) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.history_rounded, color: Color(0xFF818CF8), size: 18),
              const SizedBox(width: 8),
              Text(
                'audit_trail'.tr.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          if (order.timeline.isNotEmpty)
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: order.timeline.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, idx) {
                final entry = order.timeline[idx];
                return Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.only(top: 4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF818CF8),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.title,
                              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                            ),
                            if (entry.description.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                entry.description,
                                style: const TextStyle(color: Colors.white60, fontSize: 10.5),
                              ),
                            ],
                          ],
                        ),
                      ),
                      Text(
                        entry.timestamp,
                        style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                      ),
                    ],
                  ),
                );
              },
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                'initial_dispatch_logged'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ),
        ],
      ),
    );
  }

  // 8. Sticky Bottom Action Bar
  Widget _buildBottomActionBar(WorkOrderModel order, bool isDispatched, bool isOnSite, bool isResolved) {
    if (!isDispatched && !isOnSite && !isResolved) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Color(0xFF1E293B), width: 1.2)),
      ),
      child: isDispatched
          ? SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                onPressed: controller.isSubmitting.value ? null : controller.markOnSite,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                ),
                icon: const Icon(Icons.pin_drop_rounded, size: 18),
                label: Text(
                  'mark_arrived'.tr,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            )
          : isOnSite
              ? InkWell(
                  onTap: () {
                    WorkOrderResolutionSheet.show(
                      Get.context!,
                      order,
                      onResolved: () => controller.fetchDetail(order.id),
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: double.infinity,
                    height: 46,
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.gradientPink.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle_outline_rounded, size: 18, color: Colors.white),
                          const SizedBox(width: 8),
                          Text(
                            'resolve_job'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF10B981)),
                      const SizedBox(width: 6),
                      Text(
                        'completed_tested'.tr,
                        style: const TextStyle(color: Color(0xFF34D399), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInfoRow({required String label, required String value, bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                color: isHighlight ? Colors.white : Colors.white70,
                fontSize: 12,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUrgencyPill(String urgency) {
    Color bg;
    Color text;
    String label = urgency.toUpperCase();
    switch (urgency.toLowerCase()) {
      case 'critical':
        bg = const Color(0xFFEF4444).withValues(alpha: 0.18);
        text = const Color(0xFFF87171);
        label = 'critical'.tr.toUpperCase();
        break;
      case 'high':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.18);
        text = const Color(0xFFFBBF24);
        label = 'high'.tr.toUpperCase();
        break;
      case 'low':
        bg = const Color(0xFF64748B).withValues(alpha: 0.18);
        text = const Color(0xFF94A3B8);
        label = 'low'.tr.toUpperCase();
        break;
      default:
        bg = const Color(0xFF38BDF8).withValues(alpha: 0.15);
        text = const Color(0xFF38BDF8);
        label = 'normal'.tr.toUpperCase();
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    Color bg;
    Color dot;
    String label = status;
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        bg = const Color(0xFF10B981).withValues(alpha: 0.18);
        dot = const Color(0xFF10B981);
        label = 'resolved'.tr;
        break;
      case 'on_site':
      case 'in_progress':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.18);
        dot = const Color(0xFFF59E0B);
        label = 'on_site'.tr;
        break;
      default:
        bg = const Color(0xFF6366F1).withValues(alpha: 0.18);
        dot = const Color(0xFF818CF8);
        label = 'dispatched'.tr;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(color: dot, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  String _formatTime(String dateTimeStr) {
    final dt = DateTime.tryParse(dateTimeStr);
    if (dt == null) return dateTimeStr;
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}
