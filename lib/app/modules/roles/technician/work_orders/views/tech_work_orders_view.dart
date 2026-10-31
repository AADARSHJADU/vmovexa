import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controller/tech_work_orders_controller.dart';
import 'work_order_resolution_sheet.dart';
import 'dispatch_work_order_sheet.dart';

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
        title: const Text(
          'Field Work Orders',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: () => controller.fetchWorkOrders(),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              onPressed: () => DispatchWorkOrderSheet.show(context),
              icon: const Icon(Icons.flash_on_rounded, size: 16, color: Colors.white),
              label: const Text(
                'Dispatch',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar & Priority Filter
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      onChanged: controller.onSearchChanged,
                      decoration: InputDecoration(
                        hintText: 'Search ticket ID, vehicle, issue...',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Status Filter Tabs (matching admin panel tabs)
            Obx(() {
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    _buildFilterTab(
                      label: 'All Tickets',
                      count: controller.totalCount,
                      isSelected: controller.selectedStatusFilter.value == 'all',
                      onTap: () => controller.setStatusFilter('all'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'Dispatched',
                      count: controller.dispatchedCount,
                      isSelected: controller.selectedStatusFilter.value == 'dispatched',
                      color: const Color(0xFF38BDF8),
                      onTap: () => controller.setStatusFilter('dispatched'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'On-Site',
                      count: controller.onSiteCount,
                      isSelected: controller.selectedStatusFilter.value == 'on_site',
                      color: const Color(0xFFF59E0B),
                      onTap: () => controller.setStatusFilter('on_site'),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterTab(
                      label: 'Resolved',
                      count: controller.resolvedCount,
                      isSelected: controller.selectedStatusFilter.value == 'resolved',
                      color: const Color(0xFF10B981),
                      onTap: () => controller.setStatusFilter('resolved'),
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
                          const Text(
                            'No Field Work Orders',
                            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'All hardware tickets in this queue have been cleared.',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
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
                    separatorBuilder: (_, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return _WorkOrderCard(
                        order: order,
                        onTap: () {
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
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.transparent : const Color(0xFF334155),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.gradientPink.withValues(alpha: 0.3),
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
                color: isSelected ? Colors.white : AppColors.textMuted,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected ? Colors.white.withValues(alpha: 0.25) : const Color(0xFF334155),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
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
  final VoidCallback onTap;

  const _WorkOrderCard({required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1F2937), width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code, Urgency, Status
            Row(
              children: [
                Text(
                  order.code,
                  style: const TextStyle(
                    color: Color(0xFF818CF8),
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 8),
                _buildUrgencyPill(order.urgency),
                const Spacer(),
                _buildStatusPill(order.status),
              ],
            ),
            const SizedBox(height: 8),

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
            const SizedBox(height: 8),

            // Bus & Depot info row
            Row(
              children: [
                const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 16),
                const SizedBox(width: 6),
                Text(
                  order.busNumber,
                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 10),
                const Text('•', style: TextStyle(color: Colors.white24)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    order.depotName,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white24, size: 13),
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
    switch (urgency.toLowerCase()) {
      case 'critical':
        bg = const Color(0xFFEF4444).withValues(alpha: 0.18);
        text = const Color(0xFFF87171);
        break;
      case 'high':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.18);
        text = const Color(0xFFFBBF24);
        break;
      default:
        bg = const Color(0xFF38BDF8).withValues(alpha: 0.15);
        text = const Color(0xFF38BDF8);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(
        urgency.toUpperCase(),
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
        label = 'Resolved';
        break;
      case 'on_site':
      case 'in_progress':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.18);
        dot = const Color(0xFFF59E0B);
        label = 'On-Site';
        break;
      default:
        bg = const Color(0xFF6366F1).withValues(alpha: 0.18);
        dot = const Color(0xFF818CF8);
        label = 'Dispatched';
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
