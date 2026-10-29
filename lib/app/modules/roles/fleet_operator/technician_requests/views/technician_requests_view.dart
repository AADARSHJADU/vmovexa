import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../data/models/work_order_model.dart';
import '../controllers/technician_requests_controller.dart';

class TechnicianRequestsView extends GetView<TechnicianRequestsController> {
  const TechnicianRequestsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            _buildTopAppBar(),

            // Scrollable Content
            Expanded(
              child: RefreshIndicator(
                color: const Color(0xFF6366F1),
                backgroundColor: AppColors.cardBg,
                onRefresh: () => controller.fetchWorkOrders(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card with "New Technician Request" Button
                      _buildHeaderBanner(),
                      const SizedBox(height: 16),

                      // 3 Stat KPI Cards
                      _buildKpiMetricsGrid(),
                      const SizedBox(height: 16),

                      // Search and Filter Controls
                      _buildSearchAndFilters(),
                      const SizedBox(height: 16),

                      // Work Orders List
                      _buildWorkOrdersList(),
                      const SizedBox(height: 20),

                      // Pagination Footer
                      _buildPaginationFooter(),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
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
            'Technician Requests',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
            onPressed: () => controller.fetchWorkOrders(),
            tooltip: 'Refresh Work Orders',
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner() {
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
              const Expanded(
                child: Text(
                  'Central Technician Work Orders Desk',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Dispatch requests submitted to VMOVEXA Central Pool for hardware installation, screen repairs, and GPS calibration.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 14),
          CustomButton(
            text: 'New Technician Request',
            prefixIcon: const Icon(Icons.add_rounded, size: 18, color: Colors.white),
            onTap: controller.openCreateRequest,
            height: 48,
          ),
        ],
      ),
    );
  }

  Widget _buildKpiMetricsGrid() {
    return Obx(() {
      return Row(
        children: [
          Expanded(
            child: _buildKpiCard(
              title: 'TOTAL WORK ORDERS',
              value: '${controller.totalWorkOrdersCount} Requests',
              valColor: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildKpiCard(
              title: 'PENDING DISPATCH',
              value: '${controller.pendingDispatchCount} Awaiting Tech',
              valColor: const Color(0xFFF59E0B),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildKpiCard(
              title: 'CRITICAL PRIORITY',
              value: '${controller.criticalCount} High Urgency',
              valColor: const Color(0xFFF43F5E),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required Color valColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 7.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.3,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valColor,
              fontSize: 11.5,
              fontWeight: FontWeight.w900,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          // Search Input
          Container(
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.inputBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.inputBorder),
            ),
            child: TextField(
              controller: controller.searchController,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Search work order code, issue, vehicle...',
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                suffixIcon: Obx(() => controller.searchQuery.value.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, color: AppColors.textMuted, size: 16),
                        onPressed: () {
                          controller.searchController.clear();
                        },
                      )
                    : const SizedBox.shrink()),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Priority Filter Pills (All, Critical, High, Normal)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildUrgencyPill('all', 'All Priorities'),
                const SizedBox(width: 8),
                _buildUrgencyPill('critical', 'Critical Only'),
                const SizedBox(width: 8),
                _buildUrgencyPill('high', 'High Priority'),
                const SizedBox(width: 8),
                _buildUrgencyPill('normal', 'Normal Priority'),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Status Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterTab('all', 'All Orders'),
                const SizedBox(width: 8),
                _buildFilterTab('submitted', 'Pending'),
                const SizedBox(width: 8),
                _buildFilterTab('dispatched', 'Dispatched'),
                const SizedBox(width: 8),
                _buildFilterTab('on_site', 'On Site'),
                const SizedBox(width: 8),
                _buildFilterTab('resolved', 'Resolved'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUrgencyPill(String id, String label) {
    return Obx(() {
      final isSelected = controller.urgencyFilter.value == id;
      return GestureDetector(
        onTap: () => controller.setUrgencyFilter(id),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF3B82F6).withValues(alpha: 0.2) : const Color(0xFF141824),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? const Color(0xFF60A5FA) : AppColors.textSecondary,
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildFilterTab(String id, String label) {
    return Obx(() {
      final isSelected = controller.activeTab.value == id;
      return GestureDetector(
        onTap: () => controller.setActiveTab(id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: isSelected ? AppTheme.primaryGradient : null,
            color: isSelected ? null : const Color(0xFF1E212D),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? Colors.transparent : AppColors.cardBorder,
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
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontSize: 10.5,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildWorkOrdersList() {
    return Obx(() {
      if (controller.isLoading.value) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 40),
          alignment: Alignment.center,
          child: const Column(
            children: [
              CircularProgressIndicator(color: Color(0xFF3B82F6)),
              SizedBox(height: 12),
              Text(
                'Loading technician work orders...',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
              ),
            ],
          ),
        );
      }

      if (controller.workOrders.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.build_circle_outlined, size: 44, color: AppColors.textMuted),
              const SizedBox(height: 10),
              const Text(
                'No Work Orders Found',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              const Text(
                'No technician work orders matching your criteria.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: () {
                  controller.searchController.clear();
                  controller.setUrgencyFilter('all');
                  controller.setActiveTab('all');
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF3B82F6)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Reset Filter', style: TextStyle(color: Color(0xFF3B82F6), fontSize: 11)),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.workOrders.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = controller.workOrders[index];
          return _buildWorkOrderCard(order);
        },
      );
    });
  }

  Widget _buildWorkOrderCard(WorkOrderModel order) {
    final isEditable = !['resolved', 'closed', 'rejected'].contains(order.status.toLowerCase());
    final hasTech = order.technician != null && order.technician!.name.isNotEmpty && order.technician!.name != 'Awaiting Dispatch';

    return GestureDetector(
      onTap: () => controller.openRequestDetails(order),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Code Badge, Urgency Pill, Status Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E3A8A).withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        order.code,
                        style: const TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    _buildUrgencyBadge(order.urgency),
                  ],
                ),
                _buildStatusCapsule(order.status),
              ],
            ),
            const SizedBox(height: 10),

            // Issue Title
            Text(
              order.issueCategory,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (order.description.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                order.description,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 12),

            // Target Bus & Depot Container
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0D14),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.directions_bus_rounded, color: Color(0xFF3B82F6), size: 14),
                      const SizedBox(width: 6),
                      Text(
                        order.busNumber,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${order.depotName})',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                      ),
                    ],
                  ),
                  Text(
                    order.requestedAt != null ? _formatDate(order.requestedAt!) : 'Recent',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Footer Row: Assigned Tech + Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.engineering_rounded, color: AppColors.textSecondary, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      hasTech ? order.technician!.name : 'Awaiting Dispatch',
                      style: TextStyle(
                        color: hasTech ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (isEditable) ...[
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, size: 16, color: Color(0xFF60A5FA)),
                        onPressed: () => controller.openEditRequest(order),
                        tooltip: 'Edit Request',
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(4),
                      ),
                      const SizedBox(width: 6),
                    ],
                    const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.textMuted),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
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
      label = 'On Site Troubleshooting';
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

  Widget _buildPaginationFooter() {
    return Obx(() {
      if (controller.workOrders.isEmpty) return const SizedBox.shrink();

      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Page ${controller.currentPage.value} of ${controller.totalPages.value}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
          ),
          Row(
            children: [
              IconButton(
                onPressed: controller.currentPage.value > 1
                    ? () => controller.goToPage(controller.currentPage.value - 1)
                    : null,
                icon: const Icon(Icons.chevron_left_rounded),
                color: Colors.white,
                disabledColor: AppColors.textMuted,
              ),
              IconButton(
                onPressed: controller.currentPage.value < controller.totalPages.value
                    ? () => controller.goToPage(controller.currentPage.value + 1)
                    : null,
                icon: const Icon(Icons.chevron_right_rounded),
                color: Colors.white,
                disabledColor: AppColors.textMuted,
              ),
            ],
          ),
        ],
      );
    });
  }

  String _formatDate(String raw) {
    try {
      final dt = DateTime.parse(raw).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) {
      return raw;
    }
  }
}
