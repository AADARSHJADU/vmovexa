import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

import '../controller/subscriptions_controller.dart';
import '../model/subscription_model.dart';

class SubscriptionsView extends GetView<SubscriptionsController> {
  const SubscriptionsView({super.key});

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<SubscriptionsController>()) {
      Get.put(SubscriptionsController());
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F17),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: controller.onRefresh,
          color: const Color(0xFF1C68FD),
          backgroundColor: const Color(0xFF1A1A28),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header: Title, Subtitle, Refresh & Onboard Tenant Button
                      _buildHeader(context),
                      const SizedBox(height: 16),

                      // 5 Top Stat Cards (Status Breakdown with Live Counts)
                      _buildStatCardsRow(),
                      const SizedBox(height: 16),

                      // Search Box + Filter Button (Right side)
                      _buildSearchAndFilterBar(context),
                      const SizedBox(height: 10),

                      // Active Filter Chips & Reset All Button
                      _buildActiveFilterChips(),
                      const SizedBox(height: 12),

                      // 5 Status Tabs Row (Exact Admin Panel Parity)
                      _buildStatusTabsRow(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),

              // Subscriptions / Tenants List
              Obx(() {
                if (controller.isLoading.value && controller.allSubscriptions.isEmpty) {
                  return SliverToBoxAdapter(child: _buildLoadingState());
                }

                final list = controller.filteredSubscriptions;
                if (list.isEmpty) {
                  return SliverToBoxAdapter(child: _buildEmptyState());
                }

                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _buildTenantCard(list[index]),
                        );
                      },
                      childCount: list.length,
                    ),
                  ),
                );
              }),

              const SliverToBoxAdapter(
                child: SizedBox(height: 32),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- Header: Title, Subtitle, Onboard Button ----------------
  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'tenants_title'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'tenants_subtitle'.tr,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Refresh Button
            Obx(
              () => Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2235),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  onPressed: controller.isLoading.value ? null : controller.onRefresh,
                  icon: controller.isRefreshing.value
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white70),
                        )
                      : const Icon(Icons.refresh, color: Colors.white70, size: 20),
                  tooltip: 'refresh_tenants'.tr,
                ),
              ),
            ),
            const SizedBox(width: 8),

            // Onboard Tenant Button with AppTheme.primaryGradient
            GestureDetector(
              onTap: controller.onOnboardTenant,
              child: Container(
                height: 38,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add, color: Colors.white, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      'onboard_tenant'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------- 5 Top Stat Cards (Exact Admin Parity) ----------------
  Widget _buildStatCardsRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(
        () => Row(
          children: [
            // Total Tenants
            _buildStatCard(
              title: 'total_tenants'.tr,
              count: controller.countAll.value,
              accentColor: const Color(0xFF94A3B8),
              tabKey: 'all',
              isSelected: controller.activeTab.value == 'all',
            ),
            const SizedBox(width: 10),

            // Payment Pending (Warning Badge with ping dot)
            _buildStatCard(
              title: 'payment_pending_status'.tr,
              count: controller.countPaymentPending.value,
              accentColor: const Color(0xFFF59E0B),
              tabKey: 'payment_pending',
              isSelected: controller.activeTab.value == 'payment_pending',
              isWarning: true,
            ),
            const SizedBox(width: 10),

            // Active Tenants
            _buildStatCard(
              title: 'active_tenants_title'.tr,
              count: controller.countActive.value,
              accentColor: const Color(0xFF10B981),
              tabKey: 'active',
              isSelected: controller.activeTab.value == 'active',
            ),
            const SizedBox(width: 10),

            // Pending Review
            _buildStatCard(
              title: 'pending_review_title'.tr,
              count: controller.countPending.value,
              accentColor: const Color(0xFF60A5FA),
              tabKey: 'pending_approval',
              isSelected: controller.activeTab.value == 'pending_approval',
            ),
            const SizedBox(width: 10),

            // Suspended
            _buildStatCard(
              title: 'suspended_title'.tr,
              count: controller.countSuspended.value,
              accentColor: const Color(0xFFEF4444),
              tabKey: 'suspended',
              isSelected: controller.activeTab.value == 'suspended',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required int count,
    required Color accentColor,
    required String tabKey,
    required bool isSelected,
    bool isWarning = false,
  }) {
    return GestureDetector(
      onTap: () => controller.selectTab(tabKey),
      child: Container(
        width: 130,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? (isWarning ? const Color(0x28F59E0B) : const Color(0xFF1E2238))
              : const Color(0xFF151522),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? (isWarning ? const Color(0xFFF59E0B) : const Color(0xFF1C68FD))
                : Colors.white.withValues(alpha: 0.08),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: (isWarning ? const Color(0xFFF59E0B) : const Color(0xFF1C68FD)).withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title.toUpperCase(),
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isWarning && count > 0) ...[
                  const SizedBox(width: 4),
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF59E0B),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 6),
            Text(
              count.toString(),
              style: TextStyle(
                color: isWarning ? const Color(0xFFF59E0B) : Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Search Box + Filter Button (Right Side) ----------------
  Widget _buildSearchAndFilterBar(BuildContext context) {
    return Row(
      children: [
        // Search Input Field
        Expanded(
          child: Container(
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF171724),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: TextField(
              controller: controller.searchController,
              onChanged: controller.onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'search_tenants_admin_ph'.tr,
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 18),
                suffixIcon: Obx(
                  () => controller.searchQuery.value.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close, color: Colors.white54, size: 16),
                          onPressed: controller.clearSearch,
                        )
                      : const SizedBox.shrink(),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: InputBorder.none,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),

        // Right-Side Filter Button
        Obx(() {
          final hasFilters = controller.hasExtraFilters;
          return GestureDetector(
            onTap: () => _showFilterSheet(context),
            child: Container(
              height: 42,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                gradient: hasFilters ? AppTheme.primaryGradient : null,
                color: hasFilters ? null : const Color(0xFF171724),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: hasFilters ? Colors.transparent : Colors.white.withValues(alpha: 0.12),
                ),
                boxShadow: hasFilters
                    ? [
                        BoxShadow(
                          color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.tune,
                    color: hasFilters ? Colors.white : const Color(0xFF94A3B8),
                    size: 18,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'filter'.tr,
                    style: TextStyle(
                      color: hasFilters ? Colors.white : const Color(0xFFE2E8F0),
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (hasFilters) ...[
                    const SizedBox(width: 6),
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // ---------------- Active Filter Chips & Reset All Button ----------------
  Widget _buildActiveFilterChips() {
    return Obx(() {
      if (!controller.hasActiveFilters) {
        return const SizedBox.shrink();
      }

      return Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Wrap(
          spacing: 6,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              'active_filters_heading'.tr,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w700),
            ),

            // Tab Chip
            if (controller.activeTab.value != 'all')
              _buildFilterChip(
                label: '${'filter_tab_prefix'.tr} ${_getTabLabel(controller.activeTab.value)}',
                onRemove: () => controller.selectTab('all'),
              ),

            // Payment Status Chip
            if (controller.selectedPaymentStatus.value != 'all')
              _buildFilterChip(
                label: '${'filter_payment_prefix'.tr} ${controller.selectedPaymentStatus.value == 'payment_pending' ? 'payment_pending_status'.tr : 'status_paid'.tr}',
                onRemove: () {
                  controller.selectedPaymentStatus.value = 'all';
                  controller.fetchSubscriptions();
                },
              ),

            // Plan Chip
            if (controller.selectedPlan.value != 'all')
              _buildFilterChip(
                label: '${'filter_plan_prefix'.tr} ${_getPlanName(controller.selectedPlan.value)}',
                onRemove: () {
                  controller.selectedPlan.value = 'all';
                  controller.fetchSubscriptions();
                },
              ),

            // Sort By Chip
            if (controller.sortBy.value != 'newest')
              _buildFilterChip(
                label: '${'filter_sort_prefix'.tr} ${_getSortLabel(controller.sortBy.value)}',
                onRemove: () {
                  controller.sortBy.value = 'newest';
                  controller.fetchSubscriptions();
                },
              ),

            // Search Query Chip
            if (controller.searchQuery.value.trim().isNotEmpty)
              _buildFilterChip(
                label: '${'filter_query_prefix'.tr} "${controller.searchQuery.value.trim()}"',
                onRemove: controller.clearSearch,
              ),

            // Reset All Button
            GestureDetector(
              onTap: controller.handleResetFilters,
              child: Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Text(
                  'reset_all_filters'.tr,
                  style: const TextStyle(
                    color: Color(0xFFEF4444),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildFilterChip({required String label, required VoidCallback onRemove}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF1E243A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF1C68FD).withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10.5, fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close, color: Color(0xFF93C5FD), size: 12),
          ),
        ],
      ),
    );
  }

  // ---------------- 5 Status Tabs Row (Exact Admin Panel Parity) ----------------
  Widget _buildStatusTabsRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(() {
        final tabs = [
          _TabItem('all', 'tenants_tab_all'.tr, controller.countAll.value, false),
          _TabItem('payment_pending', 'tenants_tab_payment_pending'.tr, controller.countPaymentPending.value, true),
          _TabItem('active', 'tenants_tab_active'.tr, controller.countActive.value, false),
          _TabItem('pending_approval', 'tenants_tab_pending_approval'.tr, controller.countPending.value, false),
          _TabItem('suspended', 'tenants_tab_suspended'.tr, controller.countSuspended.value, false),
        ];

        return Row(
          children: tabs.map((t) {
            final isSelected = controller.activeTab.value == t.key;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => controller.selectTab(t.key),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? (t.isWarning
                            ? const LinearGradient(colors: [Color(0xFFD97706), Color(0xFFF59E0B)])
                            : AppTheme.primaryGradient)
                        : null,
                    color: isSelected
                        ? null
                        : (t.isWarning && t.count > 0 ? const Color(0x1EF59E0B) : const Color(0xFF161623)),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected
                          ? Colors.transparent
                          : (t.isWarning && t.count > 0
                              ? const Color(0xFFF59E0B).withValues(alpha: 0.4)
                              : Colors.white.withValues(alpha: 0.08)),
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: (t.isWarning ? const Color(0xFFF59E0B) : const Color(0xFF1C68FD))
                                  .withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (t.isWarning && t.count > 0 && !isSelected) ...[
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFFF59E0B),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                      ],
                      Text(
                        t.label,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : (t.isWarning && t.count > 0 ? const Color(0xFFFBBF24) : const Color(0xFFCBD5E1)),
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Count Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Colors.white.withValues(alpha: 0.25)
                              : Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          t.count.toString(),
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }

  // ---------------- Redesigned Tenant Card (Exact Admin Parity, Zero Dummy Data) ----------------
  Widget _buildTenantCard(Subscription sub) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Logo/Avatar + Name + Code + Badges
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar Logo with gradient fallback
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: (sub.logoUrl == null || sub.logoUrl!.isEmpty)
                      ? AppTheme.primaryGradient
                      : null,
                  color: const Color(0xFF1E2235),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                clipBehavior: Clip.antiAlias,
                child: (sub.logoUrl != null && sub.logoUrl!.isNotEmpty)
                    ? Image.network(
                        sub.logoUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(
                          child: Text(
                            sub.initials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      )
                    : Center(
                        child: Text(
                          sub.initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
              ),
              const SizedBox(width: 12),

              // Name + Code
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sub.companyName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      sub.subscriptionCode,
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontFamily: 'monospace',
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              // Badges: Payment Status + Account Status
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Payment Status Badge
                  _buildPaymentBadge(sub.paymentStatus),
                  const SizedBox(height: 4),

                  // Account Status Badge
                  _buildAccountStatusBadge(sub.status),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),
          Divider(color: Colors.white.withValues(alpha: 0.06), height: 1),
          const SizedBox(height: 12),

          // Metadata Grid: Location, Plan, Active Fleets
          Row(
            children: [
              // Location
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'location'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            (sub.city.isNotEmpty || sub.state.isNotEmpty)
                                ? '${sub.city}${sub.city.isNotEmpty && sub.state.isNotEmpty ? ', ' : ''}${sub.state}'
                                : '—',
                            style: const TextStyle(
                              color: Color(0xFFE2E8F0),
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Plan Tier
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'filter_plan'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: sub.planName.isNotEmpty
                            ? const Color(0x1E60A5FA)
                            : const Color(0x1E94A3B8),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: sub.planName.isNotEmpty
                              ? const Color(0xFF60A5FA).withValues(alpha: 0.3)
                              : Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                      child: Text(
                        sub.planName.isNotEmpty ? sub.planName : 'no_plan_label'.tr,
                        style: TextStyle(
                          color: sub.planName.isNotEmpty ? const Color(0xFF93C5FD) : const Color(0xFF94A3B8),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Active Fleets (Real count from API, no dummy data)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'active_fleets_label'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.directions_bus_outlined, size: 13, color: Color(0xFF60A5FA)),
                        const SizedBox(width: 4),
                        Text(
                          '${sub.fleetsCount} ${sub.fleetsCount == 1 ? 'fleet_single'.tr : 'fleet_multiple'.tr}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Bottom Actions Row: Quick Approve (if pending) & View Details (primaryGradient)
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Approve button if pending approval
              if (sub.status == SubscriptionStatus.pendingApproval || sub.status == SubscriptionStatus.approved) ...[
                GestureDetector(
                  onTap: () => controller.approveTenant(sub.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: const Color(0x1E10B981),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check, color: Color(0xFF10B981), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          'approve_tenant'.tr,
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],

              // Edit Tenant Quick Action Button
              GestureDetector(
                onTap: () => controller.onEditTenant(sub),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0x18FFFFFF),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0x28FFFFFF)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.edit_outlined, color: Colors.white70, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        'edit'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // View Details Button with AppTheme.primaryGradient
              GestureDetector(
                onTap: () => controller.onManageSubscription(sub),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.visibility_outlined, color: Colors.white, size: 14),
                      const SizedBox(width: 5),
                      Text(
                        'view_details'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Badges ----------------
  Widget _buildPaymentBadge(String paymentStatus) {
    final isPaid = paymentStatus == 'paid';
    final color = isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
    final bg = isPaid ? const Color(0x1E10B981) : const Color(0x1EF59E0B);
    final text = isPaid ? 'status_paid'.tr : 'payment_pending_status'.tr;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountStatusBadge(SubscriptionStatus status) {
    String label = 'status_active'.tr;
    Color color = const Color(0xFF10B981);
    Color bg = const Color(0x1E10B981);

    switch (status) {
      case SubscriptionStatus.active:
        label = 'status_active'.tr;
        color = const Color(0xFF10B981);
        bg = const Color(0x1E10B981);
        break;
      case SubscriptionStatus.approved:
        label = 'status_approved'.tr;
        color = const Color(0xFF3B82F6);
        bg = const Color(0x1E3B82F6);
        break;
      case SubscriptionStatus.pendingApproval:
      case SubscriptionStatus.paymentPending:
        label = 'status_pending_approval'.tr;
        color = const Color(0xFFF59E0B);
        bg = const Color(0x1EF59E0B);
        break;
      case SubscriptionStatus.suspended:
      case SubscriptionStatus.inactive:
        label = 'status_suspended'.tr;
        color = const Color(0xFFEF4444);
        bg = const Color(0x1EEF4444);
        break;
      case SubscriptionStatus.expiringSoon:
        label = 'Expiring Soon';
        color = const Color(0xFFFFA726);
        bg = const Color(0x1EFFA726);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 9.5,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Loading & Empty States ----------------
  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(40),
      child: const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF1C68FD),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF151522),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.directions_bus, color: Color(0xFF64748B), size: 28),
          ),
          const SizedBox(height: 14),
          Text(
            'no_tenants_found'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            'no_tenants_found_sub'.tr,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: controller.handleResetFilters,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'reset_all_filters'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Filter Bottom Sheet ----------------
  void _showFilterSheet(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: const BoxDecoration(
          color: Color(0xFF151524),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Sheet Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'filter_tenants_options'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 1. Payment Status Options
              Text(
                'filter_payment_status'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildSheetOption(
                        label: 'payment_all'.tr,
                        isSelected: controller.selectedPaymentStatus.value == 'all',
                        onTap: () => controller.selectedPaymentStatus.value = 'all',
                      ),
                      _buildSheetOption(
                        label: 'payment_pending_status'.tr,
                        isSelected: controller.selectedPaymentStatus.value == 'payment_pending',
                        onTap: () {
                          controller.selectedPaymentStatus.value = 'payment_pending';
                          if (controller.activeTab.value == 'payment_pending') {
                            controller.activeTab.value = 'all';
                          }
                        },
                      ),
                      _buildSheetOption(
                        label: 'paid_active'.tr,
                        isSelected: controller.selectedPaymentStatus.value == 'paid',
                        onTap: () => controller.selectedPaymentStatus.value = 'paid',
                      ),
                    ],
                  )),
              const SizedBox(height: 16),

              // 2. Plan Options
              Text(
                'filter_plan'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildSheetOption(
                        label: 'plan_all'.tr,
                        isSelected: controller.selectedPlan.value == 'all',
                        onTap: () => controller.selectedPlan.value = 'all',
                      ),
                      ...controller.plansList.map((p) {
                        return _buildSheetOption(
                          label: p.name,
                          isSelected: controller.selectedPlan.value == p.id,
                          onTap: () => controller.selectedPlan.value = p.id,
                        );
                      }),
                    ],
                  )),
              const SizedBox(height: 16),

              // 3. Sort By Options
              Text(
                'filter_sort_by'.tr,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildSheetOption(
                        label: 'sort_newest'.tr,
                        isSelected: controller.sortBy.value == 'newest',
                        onTap: () => controller.sortBy.value = 'newest',
                      ),
                      _buildSheetOption(
                        label: 'sort_oldest'.tr,
                        isSelected: controller.sortBy.value == 'oldest',
                        onTap: () => controller.sortBy.value = 'oldest',
                      ),
                      _buildSheetOption(
                        label: 'sort_name_asc'.tr,
                        isSelected: controller.sortBy.value == 'name_asc',
                        onTap: () => controller.sortBy.value = 'name_asc',
                      ),
                      _buildSheetOption(
                        label: 'sort_name_desc'.tr,
                        isSelected: controller.sortBy.value == 'name_desc',
                        onTap: () => controller.sortBy.value = 'name_desc',
                      ),
                      _buildSheetOption(
                        label: 'sort_buses_desc'.tr,
                        isSelected: controller.sortBy.value == 'buses_desc',
                        onTap: () => controller.sortBy.value = 'buses_desc',
                      ),
                      _buildSheetOption(
                        label: 'sort_buses_asc'.tr,
                        isSelected: controller.sortBy.value == 'buses_asc',
                        onTap: () => controller.sortBy.value = 'buses_asc',
                      ),
                    ],
                  )),
              const SizedBox(height: 24),

              // Sheet Action Buttons
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () {
                        controller.handleResetFilters();
                        Get.back();
                      },
                      child: Text(
                        'reset_all_filters'.tr,
                        style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: () {
                        controller.fetchSubscriptions();
                        Get.back();
                      },
                      child: Container(
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            'apply_filters'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildSheetOption({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : const Color(0xFF1C1C2C),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Colors.transparent : Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  // ---------------- Label Helpers ----------------
  String _getTabLabel(String key) {
    switch (key) {
      case 'payment_pending':
        return 'tenants_tab_payment_pending'.tr;
      case 'active':
        return 'tenants_tab_active'.tr;
      case 'pending_approval':
        return 'tenants_tab_pending_approval'.tr;
      case 'suspended':
        return 'tenants_tab_suspended'.tr;
      default:
        return 'tenants_tab_all'.tr;
    }
  }

  String _getPlanName(String planId) {
    final found = controller.plansList.firstWhereOrNull((p) => p.id == planId);
    return found?.name ?? 'Plan #$planId';
  }

  String _getSortLabel(String sortBy) {
    switch (sortBy) {
      case 'oldest':
        return 'sort_oldest'.tr;
      case 'name_asc':
        return 'sort_name_asc'.tr;
      case 'name_desc':
        return 'sort_name_desc'.tr;
      case 'buses_desc':
        return 'sort_buses_desc'.tr;
      case 'buses_asc':
        return 'sort_buses_asc'.tr;
      case 'newest':
      default:
        return 'sort_newest'.tr;
    }
  }
}

class _TabItem {
  final String key;
  final String label;
  final int count;
  final bool isWarning;

  _TabItem(this.key, this.label, this.count, this.isWarning);
}
