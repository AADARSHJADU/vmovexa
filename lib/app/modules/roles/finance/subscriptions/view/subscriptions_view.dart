import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/controller/subscriptions_controller.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/model/subscription_model.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class SubscriptionsView extends GetView<SubscriptionsController> {
  const SubscriptionsView({super.key});

  static const Color kDarkBg = Color(0xFF0F172A);
  static const Color kCardBg = Color(0xFF1E293B);
  static const Color kBorder = Color(0xFF334155);
  static const Color kFieldBg = Color(0xFF0F172A);
  static const Color kPrimaryBlue = Color(0xFF2563EB);
  static const Color kPrimaryIndigo = Color(0xFF6366F1);
  static const Color kGreen = Color(0xFF10B981);
  static const Color kAmber = Color(0xFFF59E0B);
  static const Color kRed = Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<SubscriptionsController>()) {
      Get.put(SubscriptionsController());
    }

    return Scaffold(
      backgroundColor: kDarkBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.allSubscriptions.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: kPrimaryIndigo),
                )
              : RefreshIndicator(
                  color: kPrimaryIndigo,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 12),
                      _buildHeader(),
                      const SizedBox(height: 14),
                      _buildKpiStatsRow(),
                      const SizedBox(height: 14),
                      _buildSearchRow(),
                      const SizedBox(height: 12),
                      _buildFilterTabs(),
                      const SizedBox(height: 14),
                      _buildTenantsList(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header (Mirroring TenantsListPage.jsx & SubscriptionsListPage.jsx) ----------------
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'Finance Portal  /  ',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            ),
            const Text(
              'Tenants',
              style: TextStyle(
                color: Color(0xFF60A5FA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            IconButton(
              onPressed: controller.onRefresh,
              icon: const Icon(Icons.refresh, color: Colors.white70, size: 20),
              tooltip: 'Refresh Tenants',
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tenant Organizations',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Manage fleet clients, active licenses, and onboarding',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11.5,
                    ),
                  ),
                ],
              ),
            ),
            // Onboard Tenant Primary Button
            GestureDetector(
              onTap: controller.onOnboardTenant,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: kPrimaryIndigo.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add, color: Colors.white, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Onboard Tenant',
                      style: TextStyle(
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

  // ---------------- KPI Stats Cards ----------------
  Widget _buildKpiStatsRow() {
    return Obx(
      () => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildStatChip('Total Orgs', '${controller.totalCount}', Colors.white70),
            const SizedBox(width: 8),
            _buildStatChip('Active', '${controller.activeCount}', kGreen),
            const SizedBox(width: 8),
            _buildStatChip('Pending Approval', '${controller.pendingApprovalCount}', kPrimaryIndigo),
            const SizedBox(width: 8),
            _buildStatChip('Payment Pending', '${controller.paymentPendingCount}', kAmber),
            const SizedBox(width: 8),
            _buildStatChip('Suspended', '${controller.suspendedCount}', kRed),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(String title, String count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            title,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
          ),
          const SizedBox(width: 6),
          Text(
            count,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Search Row ----------------
  Widget _buildSearchRow() {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorder),
      ),
      child: TextField(
        onChanged: controller.onSearchChanged,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'Search by tenant name, city, state, or email...',
          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
          prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
          suffixIcon: Obx(
            () => controller.searchQuery.value.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                    onPressed: () => controller.onSearchChanged(''),
                  )
                : const SizedBox.shrink(),
          ),
        ),
      ),
    );
  }

  // ---------------- Filter Tabs (All, Active, Payment Pending, Pending Approval, Suspended) ----------------
  Widget _buildFilterTabs() {
    return Obx(
      () => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: List.generate(controller.filterLabels.length, (index) {
            final isSelected = controller.selectedFilterIndex.value == index;
            final label = controller.filterLabels[index];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: () => controller.selectFilter(index),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : kCardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : kBorder,
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
                      color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Tenants List ----------------
  Widget _buildTenantsList() {
    return Obx(() {
      final list = controller.filteredSubscriptions;

      if (list.isEmpty) {
        return _buildEmptyState();
      }

      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (ctx, i) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final sub = list[index];
          return _buildTenantCard(sub);
        },
      );
    });
  }

  // ---------------- Single Tenant Card ----------------
  Widget _buildTenantCard(Subscription sub) {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Avatar + Name + Status Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: sub.avatarColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: sub.avatarColor.withValues(alpha: 0.4)),
                ),
                alignment: Alignment.center,
                child: Text(
                  sub.initials,
                  style: TextStyle(
                    color: sub.avatarColor,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Name + Location
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sub.companyName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        if (sub.city.isNotEmpty || sub.state.isNotEmpty) ...[
                          const Icon(Icons.location_on_outlined, size: 12, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              '${sub.city}${sub.city.isNotEmpty && sub.state.isNotEmpty ? ', ' : ''}${sub.state}',
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ] else
                          Text(
                            sub.subscriptionCode,
                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: sub.status.badgeBg,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: sub.status.color.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: sub.status.color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      sub.status.label,
                      style: TextStyle(
                        color: sub.status.color,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          Divider(color: Colors.white.withValues(alpha: 0.06), height: 1),
          const SizedBox(height: 10),

          // Metadata Grid: Plan, Fleet Quota, Admin
          Row(
            children: [
              // Plan
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PLAN TIER',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      sub.planName,
                      style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 11.5, fontWeight: FontWeight.w700),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Quota
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FLEET QUOTA',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${sub.busesCount} Buses • ${sub.depotsCount} Depots',
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              // Admin
              if (sub.adminName.isNotEmpty)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PRIMARY ADMIN',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        sub.adminName,
                        style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Bottom Action Row
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Quick Approve button if pending approval
              if (sub.status == SubscriptionStatus.pendingApproval) ...[
                GestureDetector(
                  onTap: () => controller.approveTenant(sub.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: kGreen.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: kGreen.withValues(alpha: 0.4)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check, color: kGreen, size: 14),
                        SizedBox(width: 4),
                        Text(
                          'Approve',
                          style: TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],

              // Manage / View Details
              GestureDetector(
                onTap: () => controller.onManageSubscription(sub),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: kBorder),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Manage',
                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward_ios, color: Colors.white54, size: 10),
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

  // ---------------- Empty State ----------------
  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: kPrimaryIndigo.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.domain_disabled_outlined, color: kPrimaryIndigo, size: 28),
          ),
          const SizedBox(height: 14),
          const Text(
            'No Tenants Found',
            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          const Text(
            'No tenant organizations match your current search and filter criteria.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 18),
          CustomButton(
            text: 'Onboard New Tenant',
            prefixIcon: const Icon(Icons.add, size: 16, color: Colors.white),
            onTap: controller.onOnboardTenant,
            width: 220,
            height: 44,
          ),
        ],
      ),
    );
  }
}
