import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/manage_subscription_controller.dart';
import '../model/subscription_model.dart';

class ManageSubscriptionView extends GetView<ManageSubscriptionController> {
  const ManageSubscriptionView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kBorderHighlight = Color(0x28FFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar & Header Summary
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back link
                  GestureDetector(
                    onTap: controller.onBackPressed,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      color: Colors.transparent,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.arrow_back, color: Color(0xFF60A5FA), size: 15),
                          const SizedBox(width: 6),
                          Text(
                            'back_to_subscriptions'.tr,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Organization Top Profile Card with Actions
                  _buildOrganizationHeaderCard(),
                  const SizedBox(height: 12),

                  // 4 Top KPI Stat Cards
                  _buildKpiCardsRow(),
                  const SizedBox(height: 12),

                  // Sub-Tabs Navigation (Exact 3 Tabs)
                  _buildSubTabBar(),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Active Tab Content
            Expanded(
              child: Obx(() {
                switch (controller.selectedTabIndex.value) {
                  case 1:
                    return _buildDepotsTab();
                  case 2:
                    return _buildBillingTab();
                  case 0:
                  default:
                    return _buildOverviewTab();
                }
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Organization Top Header Card with Actions ----------------
  Widget _buildOrganizationHeaderCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Company Avatar / Logo
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: controller.logoUrl == null || controller.logoUrl!.isEmpty
                      ? AppTheme.primaryGradient
                      : null,
                  color: controller.subscription.avatarColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: kBorderHighlight),
                  image: controller.logoUrl != null && controller.logoUrl!.isNotEmpty
                      ? DecorationImage(
                          image: NetworkImage(controller.logoUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                alignment: Alignment.center,
                child: controller.logoUrl == null || controller.logoUrl!.isEmpty
                    ? Text(
                        controller.subscription.initials,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                      )
                    : null,
              ),
              const SizedBox(width: 12),

              // Title, Code & Status Badges
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            controller.companyName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0x283B82F6),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: Text(
                            controller.companyCode,
                            style: const TextStyle(
                              color: Color(0xFF60A5FA),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      controller.locationText.isNotEmpty ? controller.locationText : 'India',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),

                    // Status and Payment badges
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        // Organization Status Badge
                        _buildStatusBadge(controller.currentStatus.value),

                        // Payment Status Badge
                        _buildPaymentStatusBadge(controller.isPaid),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(color: Color(0x14FFFFFF), height: 1),
          const SizedBox(height: 10),

          // Action Buttons Bar (Edit, Approve, Suspend/Reactivate, Reset Pass)
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // 1. Edit Tenant Button (Styled with primaryGradient)
              GestureDetector(
                onTap: controller.onEditTenant,
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
                      const Icon(Icons.edit, color: Colors.white, size: 13),
                      const SizedBox(width: 5),
                      Text(
                        'btn_edit_tenant'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. Approve Application (if pending)
              if (controller.currentStatus.value == SubscriptionStatus.pendingApproval)
                GestureDetector(
                  onTap: controller.isActionLoading.value ? null : controller.onApproveTenant,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 13),
                        const SizedBox(width: 4),
                        Text(
                          'approve_tenant'.tr,
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 11.5, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),

              // 3. Suspend / Reactivate Status Toggle
              GestureDetector(
                onTap: controller.isActionLoading.value ? null : controller.onToggleStatus,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: controller.currentStatus.value == SubscriptionStatus.suspended
                        ? const Color(0x1F10B981)
                        : const Color(0x1FEF4444),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: controller.currentStatus.value == SubscriptionStatus.suspended
                          ? const Color(0x4010B981)
                          : const Color(0x40EF4444),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        controller.currentStatus.value == SubscriptionStatus.suspended
                            ? Icons.play_arrow_outlined
                            : Icons.block_outlined,
                        color: controller.currentStatus.value == SubscriptionStatus.suspended
                            ? const Color(0xFF10B981)
                            : const Color(0xFFEF4444),
                        size: 13,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        controller.currentStatus.value == SubscriptionStatus.suspended
                            ? 'reactivate_btn'.tr
                            : 'suspend_btn'.tr,
                        style: TextStyle(
                          color: controller.currentStatus.value == SubscriptionStatus.suspended
                              ? const Color(0xFF10B981)
                              : const Color(0xFFEF4444),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 4. Reset Admin Password
              GestureDetector(
                onTap: controller.onResetAdminPassword,
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
                      const Icon(Icons.lock_reset, color: Colors.white70, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        'reset_pwd_btn'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
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

  // ---------------- 4 Top KPI Stat Cards Row ----------------
  Widget _buildKpiCardsRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          // 1. Subscription Plan
          _buildKpiCard(
            title: 'subscription_plan_lbl'.tr,
            icon: Icons.confirmation_number_outlined,
            iconColor: const Color(0xFF818CF8),
            mainValue: controller.hasSubscriptionOrPlan ? controller.planName : 'no_plan_selected'.tr,
            subText: controller.hasSubscriptionOrPlan
                ? '₹${controller.planMonthlyPrice.toStringAsFixed(0)} / mo • ${'monthly_saas'.tr}'
                : 'not_subscribed'.tr,
            subTextColor: controller.hasSubscriptionOrPlan ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
          ),
          const SizedBox(width: 10),

          // 2. Payment Status
          _buildKpiCard(
            title: 'payment_status_lbl'.tr,
            icon: controller.isPaid ? Icons.check_circle_outline : Icons.pending_actions,
            iconColor: controller.isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
            mainValue: controller.isPaid ? 'status_paid'.tr : 'payment_pending_status'.tr,
            subText: controller.isPaid ? 'settled_in_good_standing'.tr : 'invoice_payment_pending'.tr,
            subTextColor: controller.isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
          ),
          const SizedBox(width: 10),

          // 3. Fleet Vehicles
          _buildKpiCard(
            title: 'fleet_vehicles_lbl'.tr,
            icon: Icons.directions_bus_outlined,
            iconColor: const Color(0xFF60A5FA),
            mainValue: '${controller.busUsed} / ${controller.busLimit}',
            subText: '${controller.busRemaining} ${'slots_free'.tr}',
            subTextColor: const Color(0xFF60A5FA),
          ),
          const SizedBox(width: 10),

          // 4. Depots & Coverage
          _buildKpiCard(
            title: 'depots_coverage_lbl'.tr,
            icon: Icons.storefront_outlined,
            iconColor: const Color(0xFF2DD4BF),
            mainValue: '${controller.depotUsed} / ${controller.depotLimit} ${'depots'.tr}',
            subText: '${controller.depotRemaining} ${'slots_free'.tr} • ${controller.locationText}',
            subTextColor: const Color(0xFF2DD4BF),
          ),
        ],
      ),
    );
  }

  Widget _buildKpiCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required String mainValue,
    required String subText,
    required Color subTextColor,
  }) {
    return Container(
      width: 175,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, color: iconColor, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            mainValue,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            subText,
            style: TextStyle(
              color: subTextColor,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ---------------- Sub-Tabs Bar (3 Tabs Only) ----------------
  Widget _buildSubTabBar() {
    return Obx(() {
      // Saare observables yahin, Obx ke build ke andar read karo
      final selected = controller.selectedTabIndex.value;
      final depotsCount = controller.depotsList.length;
      final invoicesCount = controller.invoicesList.length;

      final tabs = <_SubTab>[
        _SubTab(0, 'overview_tab'.tr, Icons.description_outlined),
        _SubTab(1, '${'depots_tab'.tr} ($depotsCount)', Icons.directions_bus_outlined),
        _SubTab(2, '${'invoices_tab'.tr} ($invoicesCount)', Icons.receipt_long_outlined),
      ];

      return SizedBox(
        height: 36,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: tabs.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, i) {
            final tab = tabs[i];
            final isActive = selected == tab.index;

            return GestureDetector(
              onTap: () => controller.selectTab(tab.index),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: isActive ? AppTheme.primaryGradient : null,
                  color: isActive ? null : kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isActive ? Colors.transparent : kBorder,
                  ),
                  boxShadow: isActive
                      ? [
                    BoxShadow(
                      color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab.icon,
                      size: 14,
                      color: isActive ? Colors.white : const Color(0xFF94A3B8),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      tab.label,
                      style: TextStyle(
                        color: isActive ? Colors.white : const Color(0xFF94A3B8),
                        fontSize: 11.5,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }
/*  Widget _buildSubTabBar() {
    final tabs = [
      {'index': 0, 'label': 'overview_tab'.tr, 'icon': Icons.description_outlined},
      {
        'index': 1,
        'label': '${'depots_tab'.tr} (${controller.depotsList.length})',
        'icon': Icons.directions_bus_outlined
      },
      {
        'index': 2,
        'label': '${'invoices_tab'.tr} (${controller.invoicesList.length})',
        'icon': Icons.receipt_long_outlined
      },
    ];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final tab = tabs[i];
          final tabIndex = tab['index'] as int;
          final isActive = controller.selectedTabIndex.value == tabIndex;

          return Obx((){
            return  GestureDetector(
              onTap: () => controller.selectTab(tabIndex),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: isActive ? AppTheme.primaryGradient : null,
                  color: isActive ? null : kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isActive ? Colors.transparent : kBorder,
                  ),
                  boxShadow: isActive
                      ? [
                    BoxShadow(
                      color: const Color(0xFF1C68FD).withValues(alpha: 0.35),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab['icon'] as IconData,
                      size: 14,
                      color: isActive ? Colors.white : const Color(0xFF94A3B8),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      tab['label'] as String,
                      style: TextStyle(
                        color: isActive ? Colors.white : const Color(0xFF94A3B8),
                        fontSize: 11.5,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            );
          });
        },
      ),
    );
  }*/

  // =========================================================================
  // TAB 1: ORGANIZATION OVERVIEW (Clean Company & Sub Quota Parity)
  // =========================================================================
  Widget _buildOverviewTab() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      physics: const BouncingScrollPhysics(),
      children: [
        // 1. Company & Administrator Card
        _buildSectionCard(
          title: 'company_admin_title'.tr,
          icon: Icons.person_outline,
          iconColor: const Color(0xFF60A5FA),
          child: Column(
            children: [
              _buildDetailRow('lbl_admin_name'.tr, controller.adminName),
              _buildDetailRow('common_email'.tr, controller.adminEmail),
              _buildDetailRow('common_phone'.tr, controller.adminPhone),
              if (controller.adminEnrollmentNo != null)
                _buildDetailRow('lbl_enrollment_id'.tr, controller.adminEnrollmentNo!),
              _buildDetailRow('lbl_location'.tr, controller.locationText),
              _buildDetailRow('lbl_office_address'.tr, controller.officeAddress),
              _buildDetailRow('lbl_gstin'.tr, controller.gstin.isNotEmpty ? controller.gstin : '—'),
              _buildDetailRow('lbl_cin'.tr, controller.cin.isNotEmpty ? controller.cin : '—'),
              _buildDetailRow('joined_date_lbl'.tr, controller.joinedDate, isLast: true),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 2. Subscription & Account Card
        _buildSectionCard(
          title: 'sub_account_title'.tr,
          icon: Icons.confirmation_number_outlined,
          iconColor: const Color(0xFF818CF8),
          trailingBadge: controller.companyCode,
          child: controller.hasSubscriptionOrPlan
              ? _buildActiveSubscriptionSection()
              : _buildUnsubscribedSection(),
        ),
      ],
    );
  }

  Widget _buildActiveSubscriptionSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Active Plan Banner
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: kFieldBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: kBorder),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            controller.planName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        _buildPaymentStatusBadge(controller.isPaid),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${'lbl_purchased'.tr} ${controller.formattedPurchasedDate}',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${'lbl_renewal'.tr} ${controller.formattedRenewalDate}',
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10.5, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${controller.planMonthlyPrice.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    'per_month'.tr,
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Plan Quotas vs Current Usage Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'quotas_usage_title'.tr,
              style: const TextStyle(
                color: Color(0xFFE2E8F0),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              'active_allocated_lbl'.tr,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
            ),
          ],
        ),

        const SizedBox(height: 10),

        // 1. Buses / Fleet Vehicles Progress Bar
        _buildQuotaProgressCard(
          title: 'fleet_vehicles_buses'.tr,
          icon: Icons.directions_bus_outlined,
          color: const Color(0xFF3B82F6),
          used: controller.busUsed,
          limit: controller.busLimit,
          remaining: controller.busRemaining,
          percent: controller.busPercent,
        ),

        const SizedBox(height: 8),

        // 2. Drivers Progress Bar
        _buildQuotaProgressCard(
          title: 'tab_drivers'.tr,
          icon: Icons.badge_outlined,
          color: const Color(0xFF10B981),
          used: controller.driverUsed,
          limit: controller.driverLimit,
          remaining: controller.driverRemaining,
          percent: controller.driverPercent,
        ),

        const SizedBox(height: 8),

        // 3. Depots & Garages Progress Bar
        _buildQuotaProgressCard(
          title: 'depots_garages_lbl'.tr,
          icon: Icons.storefront_outlined,
          color: const Color(0xFF2DD4BF),
          used: controller.depotUsed,
          limit: controller.depotLimit,
          remaining: controller.depotRemaining,
          percent: controller.depotPercent,
        ),

        const SizedBox(height: 8),

        // 4. Fleet Operators Progress Bar
        _buildQuotaProgressCard(
          title: 'fleet_operators_lbl'.tr,
          icon: Icons.supervised_user_circle_outlined,
          color: const Color(0xFF818CF8),
          used: controller.operatorUsed,
          limit: controller.operatorLimit,
          remaining: controller.operatorRemaining,
          percent: controller.operatorPercent,
        ),

        const SizedBox(height: 12),
        const Divider(color: Color(0x14FFFFFF), height: 1),
        const SizedBox(height: 10),

        // Portal Slug Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'portal_slug_lbl'.tr,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
            ),
            Text(
              controller.portalSlug,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                fontSize: 11.5,
                fontFamily: 'monospace',
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuotaProgressCard({
    required String title,
    required IconData icon,
    required Color color,
    required int used,
    required int limit,
    required int remaining,
    required double percent,
  }) {
    final barColor = percent >= 0.9
        ? const Color(0xFFEF4444)
        : percent >= 0.75
            ? const Color(0xFFF59E0B)
            : color;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              Text(
                '$used / $limit',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percent,
              backgroundColor: const Color(0xFF334155),
              valueColor: AlwaysStoppedAnimation<Color>(barColor),
              minHeight: 5,
            ),
          ),
          const SizedBox(height: 5),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$remaining ${'slots_free'.tr}',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
              ),
              Text(
                '${'plan_limit_cap'.tr} $limit',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUnsubscribedSection() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline, color: Color(0xFFF59E0B), size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'no_subscription_assigned_title'.tr,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'no_sub_assigned_desc'.tr,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.4),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF15151F),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: kBorder),
            ),
            child: Text(
              'locked_quotas_note'.tr,
              style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10.5),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // TAB 2: DEPOT & FLEET ROSTER (Exact Admin Panel Parity)
  // =========================================================================
  Widget _buildDepotsTab() {
    final depots = controller.depotsList;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      physics: const BouncingScrollPhysics(),
      children: [
        // Header Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'registered_depots_title'.tr.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    SizedBox(width: 10,),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0x1F3B82F6),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x403B82F6)),
                      ),
                      child: Text(
                        '${depots.length} ${'active_in_db'.tr}',
                        style: const TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'registered_depots_desc'.tr,
                  maxLines: 2,
                  style: const TextStyle(color: Color(0xFF94A3B8),
                      fontSize: 10.5),
                ),
              ],
            ),

          ],
        ),

        const SizedBox(height: 12),

        // If empty
        if (depots.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorder),
            ),
            child: Column(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0x1A60A5FA),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: const Icon(Icons.storefront_outlined, color: Color(0xFF60A5FA), size: 24),
                ),
                const SizedBox(height: 12),
                Text(
                  'no_depots_yet_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  'no_depots_yet_desc'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.4),
                ),
              ],
            ),
          )
        else
          ...depots.map((d) => _buildDepotCard(d)),
      ],
    );
  }

  Widget _buildDepotCard(TenantDepotItem d) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    d.name,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0x18FFFFFF),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      d.code,
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5, fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: d.status.toLowerCase() == 'operational'
                  ? const Color(0x1F10B981)
                  : const Color(0x1FEF4444),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              d.status.toUpperCase(),
              style: TextStyle(
                color: d.status.toLowerCase() == 'operational'
                    ? const Color(0xFF10B981)
                    : const Color(0xFFEF4444),
                fontSize: 9.5,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            d.address,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildDepotStatBox('capacity_lbl'.tr, '${d.capacity}'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildDepotStatBox('parked_lbl'.tr, '${d.currentParked}'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildDepotStatBox(
                  'ev_bays_lbl'.tr,
                  '${d.evChargers}',
                  valueColor: const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          if (d.contactPhone.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.phone_outlined, color: Color(0xFF94A3B8), size: 12),
                const SizedBox(width: 4),
                Text(
                  d.contactPhone,
                  style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10.5, fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDepotStatBox(String label, String value, {Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // TAB 3: BILLING & TAX INVOICES (Exact Admin Panel Parity)
  // =========================================================================
  Widget _buildBillingTab() {
    final invoices = controller.invoicesList;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      physics: const BouncingScrollPhysics(),
      children: [
        // Summary Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kBorder),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0x1F3B82F6),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0x403B82F6)),
                ),
                child: const Icon(Icons.receipt_long_outlined, color: Color(0xFF60A5FA), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            controller.hasSubscriptionOrPlan
                                ? controller.planName
                                : 'no_subscription_plan'.tr,
                            style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '₹${controller.planMonthlyPrice.toStringAsFixed(0)}/mo',
                          style: const TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${'billed_to_lbl'.tr} ${controller.companyName}',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              _buildPaymentStatusBadge(controller.isPaid),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Invoices Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  'tax_invoices_title'.tr.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0x1F3B82F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${invoices.length}',
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            Text(
              '${'showing_lbl'.tr} ${invoices.length} ${'invoices_lbl'.tr}',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
            ),
          ],
        ),

        const SizedBox(height: 10),

        if (invoices.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: kBorder),
            ),
            child: Column(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0x1AF59E0B),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: const Icon(Icons.receipt_outlined, color: Color(0xFFF59E0B), size: 24),
                ),
                const SizedBox(height: 12),
                Text(
                  'no_invoices_found_title'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  'no_invoices_found_desc'.tr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.4),
                ),
              ],
            ),
          )
        else
          ...invoices.map((inv) => _buildInvoiceCard(inv)),
      ],
    );
  }

  Widget _buildInvoiceCard(TenantInvoiceItem inv) {
    final isPaid = inv.status == 'paid';
    final isOverdue = inv.status == 'overdue';

    final badgeColor = isPaid
        ? const Color(0xFF10B981)
        : isOverdue
            ? const Color(0xFFEF4444)
            : const Color(0xFFF59E0B);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      inv.code,
                      style: const TextStyle(
                        color: Color(0xFF60A5FA),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: () => controller.copyToClipboard(inv.code, 'invoice_code_copied'.tr),
                      child: const Icon(Icons.copy, color: Color(0xFF94A3B8), size: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  inv.issuedAt.isNotEmpty ? inv.issuedAt.split('T').first : '—',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                ),
                const SizedBox(height: 2),
                Text(
                  inv.type.replaceAll('_', ' ').toUpperCase(),
                  style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${inv.total.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: badgeColor.withValues(alpha: 0.4)),
                ),
                child: Text(
                  inv.status.toUpperCase(),
                  style: TextStyle(
                    color: badgeColor,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------- Shared Components & Badges ----------------
  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required Widget child,
    String? trailingBadge,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            // mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: iconColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: iconColor, size: 15),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              if (trailingBadge != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0x1F3B82F6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    trailingBadge,
                    style: const TextStyle(
                      color: Color(0xFF60A5FA),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0x14FFFFFF), height: 1),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(SubscriptionStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: status.badgeBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: status.color.withValues(alpha: 0.4)),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: status.color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildPaymentStatusBadge(bool isPaid) {
    final color = isPaid ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
    final bg = isPaid ? const Color(0x1F10B981) : const Color(0x1FF59E0B);
    final text = isPaid ? 'status_paid'.tr : 'payment_pending_status'.tr;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
class _SubTab {
  final int index;
  final String label;
  final IconData icon;
  const _SubTab(this.index, this.label, this.icon);
}