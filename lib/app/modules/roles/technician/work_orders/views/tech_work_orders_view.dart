import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_work_orders_controller.dart';
import 'work_order_resolution_sheet.dart';

class TechWorkOrdersView extends StatelessWidget {
  const TechWorkOrdersView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<TechWorkOrdersController>()
        ? Get.find<TechWorkOrdersController>()
        : Get.put(TechWorkOrdersController());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'assigned_work_orders'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Obx(() => Text(
                  '${controller.totalCount} ${'total'.tr}',
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                )),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'refresh'.tr,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: () => controller.fetchWorkOrders(),
          ),
          // Diagnostics Button (Replaces old Dispatch button)
          Padding(
            padding: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            child: InkWell(
              onTap: () => controller.navigateToDiagnostics(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.gradientPink.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.build_circle_outlined, size: 16, color: Colors.white),
                    const SizedBox(width: 6),
                    Text(
                      'diagnostics_btn'.tr,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar & Priority Filter Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Obx(() {
                      return TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        onChanged: controller.onSearchChanged,
                        controller: TextEditingController.fromValue(
                          TextEditingValue(
                            text: controller.searchQuery.value,
                            selection: TextSelection.collapsed(offset: controller.searchQuery.value.length),
                          ),
                        ),
                        decoration: InputDecoration(
                          hintText: 'search_work_orders_hint'.tr,
                          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                          suffixIcon: controller.searchQuery.value.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 18),
                                  onPressed: () => controller.onSearchChanged(''),
                                )
                              : null,
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(width: 8),

                  // Priority Filter Dropdown Popup
                  Obx(() {
                    final selectedP = controller.selectedPriorityFilter.value;
                    final hasFilter = selectedP.isNotEmpty;
                    return PopupMenuButton<String>(
                      tooltip: 'all_priorities'.tr,
                      onSelected: (val) {
                        controller.setPriorityFilter(val == 'all' ? '' : val);
                      },
                      color: const Color(0xFF1E293B),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Color(0xFF334155)),
                      ),
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: 'all',
                          child: Text(
                            'all_priorities'.tr,
                            style: TextStyle(
                              color: selectedP.isEmpty ? AppTheme.gradientPink : Colors.white,
                              fontSize: 12,
                              fontWeight: selectedP.isEmpty ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'critical',
                          child: Text(
                            'critical'.tr,
                            style: TextStyle(
                              color: selectedP == 'critical' ? const Color(0xFFEF4444) : Colors.white,
                              fontSize: 12,
                              fontWeight: selectedP == 'critical' ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'high',
                          child: Text(
                            'high'.tr,
                            style: TextStyle(
                              color: selectedP == 'high' ? const Color(0xFFF59E0B) : Colors.white,
                              fontSize: 12,
                              fontWeight: selectedP == 'high' ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'normal',
                          child: Text(
                            'normal'.tr,
                            style: TextStyle(
                              color: selectedP == 'normal' ? const Color(0xFF38BDF8) : Colors.white,
                              fontSize: 12,
                              fontWeight: selectedP == 'normal' ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                        PopupMenuItem(
                          value: 'low',
                          child: Text(
                            'low'.tr,
                            style: TextStyle(
                              color: selectedP == 'low' ? Colors.white70 : Colors.white,
                              fontSize: 12,
                              fontWeight: selectedP == 'low' ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      ],
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        decoration: BoxDecoration(
                          color: hasFilter ? AppTheme.gradientPink.withValues(alpha: 0.18) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: hasFilter ? AppTheme.gradientPink : const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.filter_list_rounded,
                              size: 18,
                              color: hasFilter ? AppTheme.gradientPink : AppColors.textMuted,
                            ),
                            if (hasFilter) ...[
                              const SizedBox(width: 4),
                              Text(
                                selectedP.tr.toUpperCase(),
                                style: const TextStyle(
                                  color: AppTheme.gradientPink,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  }),

                  // Reset Button if filter/search is active
                  Obx(() {
                    final isFiltered = controller.searchQuery.value.isNotEmpty ||
                        controller.selectedPriorityFilter.value.isNotEmpty ||
                        controller.selectedStatusFilter.value != 'all';
                    if (!isFiltered) return const SizedBox.shrink();
                    return Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: IconButton(
                        tooltip: 'reset_filters'.tr,
                        icon: const Icon(Icons.restart_alt_rounded, color: Colors.white70, size: 20),
                        onPressed: controller.resetFilters,
                      ),
                    );
                  }),
                ],
              ),
            ),

            // 5 Status Filter Tabs (Matching Admin Panel Web Portal)
            Obx(() {
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    _buildFilterTab(
                      label: 'all_tickets'.tr,
                      count: controller.totalCount,
                      isSelected: controller.selectedStatusFilter.value == 'all',
                      onTap: () => controller.setStatusFilter('all'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'dispatched'.tr,
                      count: controller.dispatchedCount,
                      isSelected: controller.selectedStatusFilter.value == 'dispatched',
                      color: const Color(0xFF38BDF8),
                      onTap: () => controller.setStatusFilter('dispatched'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'on_site'.tr,
                      count: controller.onSiteCount,
                      isSelected: controller.selectedStatusFilter.value == 'on_site',
                      color: const Color(0xFFF59E0B),
                      onTap: () => controller.setStatusFilter('on_site'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'resolved'.tr,
                      count: controller.resolvedCount,
                      isSelected: controller.selectedStatusFilter.value == 'resolved',
                      color: const Color(0xFF10B981),
                      onTap: () => controller.setStatusFilter('resolved'),
                    ),
                    const SizedBox(width: 8),
                    // SLA Overdue Tab (Alert tab)
                    _buildFilterTab(
                      label: 'sla_overdue'.tr,
                      count: controller.overdueCount,
                      isSelected: controller.selectedStatusFilter.value == 'overdue',
                      isAlert: true,
                      color: const Color(0xFFEF4444),
                      onTap: () => controller.setStatusFilter('overdue'),
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 6),

            // Work Orders List
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(
                    child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                  );
                }

                final orders = controller.filteredOrders;
                if (orders.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.assignment_turned_in_outlined, color: AppColors.textMuted, size: 48),
                          const SizedBox(height: 12),
                          Text(
                            'no_field_work_orders'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'all_hardware_tickets_cleared'.tr,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: const Color(0xFF6366F1),
                  backgroundColor: const Color(0xFF1E293B),
                  onRefresh: controller.fetchWorkOrders,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: orders.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _WorkOrderCard(
                        order: order,
                        slaInfo: controller.formatSlaInfo(order),
                        onTap: () {
                          Get.toNamed(
                            Routes.TECHNICIAN_WORK_ORDER_DETAILS,
                            arguments: order,
                          )?.then((_) => controller.fetchWorkOrders());
                        },
                        onMarkOnSite: () => controller.markOnSite(order),
                        onResolve: () {
                          WorkOrderResolutionSheet.show(
                            context,
                            order,
                            onResolved: controller.fetchWorkOrders,
                          );
                        },
                      );
                    },
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterTab({
    required String label,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
    Color? color,
    bool isAlert = false,
  }) {
    Color? tabBorderColor;
    if (isSelected) {
      tabBorderColor = Colors.transparent;
    } else if (isAlert && count > 0) {
      tabBorderColor = const Color(0xFFEF4444).withValues(alpha: 0.5);
    } else {
      tabBorderColor = const Color(0xFF334155);
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          gradient: isSelected
              ? (isAlert
                  ? const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFB91C1C)])
                  : AppTheme.primaryGradient)
              : null,
          color: isSelected
              ? null
              : (isAlert && count > 0
                  ? const Color(0xFFEF4444).withValues(alpha: 0.12)
                  : const Color(0xFF1E293B)),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: tabBorderColor),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: (isAlert ? const Color(0xFFEF4444) : AppTheme.gradientPink).withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? Colors.white
                    : (isAlert && count > 0 ? const Color(0xFFF87171) : AppColors.textMuted),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.25)
                    : (isAlert && count > 0
                        ? const Color(0xFFEF4444).withValues(alpha: 0.25)
                        : const Color(0xFF334155)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : (isAlert && count > 0 ? const Color(0xFFFCA5A5) : Colors.white),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkOrderCard extends StatelessWidget {
  final WorkOrderModel order;
  final Map<String, dynamic> slaInfo;
  final VoidCallback onTap;
  final VoidCallback onMarkOnSite;
  final VoidCallback onResolve;

  const _WorkOrderCard({
    required this.order,
    required this.slaInfo,
    required this.onTap,
    required this.onMarkOnSite,
    required this.onResolve,
  });

  @override
  Widget build(BuildContext context) {
    final status = order.status.toLowerCase();
    final canMarkOnSite = status == 'dispatched' || status == 'submitted' || status == 'approved';
    final canResolve = status == 'on_site' || status == 'in_progress';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: slaInfo['type'] == 'overdue'
                ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                : const Color(0xFF1F2937),
            width: 1.2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code, Urgency, Status
            Row(
              children: [
                Flexible(
                  child: Text(
                    order.code,
                    style: const TextStyle(
                      color: Color(0xFF818CF8),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                _buildUrgencyPill(order.urgency),
                const Spacer(),
                _buildStatusPill(order.status),
              ],
            ),
            const SizedBox(height: 8),

            // SLA Countdown Badge Row (Parity with Web formatSlaInfo)
            if (slaInfo['text'] != null && slaInfo['text'] != '—') ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: slaInfo['bg'] as Color? ?? Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: (slaInfo['color'] as Color? ?? Colors.transparent).withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (slaInfo['icon'] != null) ...[
                      Icon(slaInfo['icon'] as IconData, size: 12, color: slaInfo['color'] as Color?),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      slaInfo['text'].toString(),
                      style: TextStyle(
                        color: slaInfo['color'] as Color? ?? Colors.white,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],

            // Issue Title
            Text(
              order.issueCategory,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),

            if (order.description.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                order.description,
                style: const TextStyle(color: Colors.white60, fontSize: 11),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: 8),

            // Bus & Depot info row
            Row(
              children: [
                const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 15),
                const SizedBox(width: 5),
                Text(
                  order.busNumber,
                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 8),
                const Text('•', style: TextStyle(color: Colors.white24)),
                const SizedBox(width: 8),
                const Icon(Icons.location_on_outlined, color: Color(0xFFF59E0B), size: 14),
                const SizedBox(width: 3),
                Expanded(
                  child: Text(
                    order.depotName,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white24, size: 12),
              ],
            ),

            // Action Buttons Footer
            const SizedBox(height: 10),
            const Divider(color: Color(0xFF1E293B), height: 1),
            const SizedBox(height: 8),
            Wrap(
              alignment: WrapAlignment.end,
              spacing: 8,
              runSpacing: 6,
              children: [
                InkWell(
                  onTap: onTap,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.visibility_outlined, size: 13, color: Colors.white70),
                        const SizedBox(width: 4),
                        Text(
                          'view_details'.tr,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (canMarkOnSite)
                  InkWell(
                    onTap: onMarkOnSite,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.pin_drop_rounded, size: 13, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 4),
                          Text(
                            'mark_on_site'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFFF59E0B),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (canResolve)
                  InkWell(
                    onTap: onResolve,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.gradientPink.withValues(alpha: 0.25),
                            blurRadius: 6,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle_outline_rounded, size: 13, color: Colors.white),
                          const SizedBox(width: 4),
                          Text(
                            'resolve_order'.tr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
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
}
