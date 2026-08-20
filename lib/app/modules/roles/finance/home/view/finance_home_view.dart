import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/finance/home/models/finance_home_models.dart';
import '../controller/finance_home_controller.dart';

class FinanceHomeView extends GetView<FinanceHomeController> {
  const FinanceHomeView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kRed = Color(0xFFFF4D4D);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.financialStats.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildFinancialOverviewCard(),
                      const SizedBox(height: 20),
                      const Text('Quick Actions', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      _buildQuickActionsGrid(),
                      const SizedBox(height: 20),
                      _buildKeyInsightsCard(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onMenuTap,
          child: const Icon(Icons.menu, color: Colors.white70),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Obx(
            () => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Finance Dashboard', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('Welcome back, ${controller.userName.value} \ud83d\udc4b', style: const TextStyle(color: Colors.white54, fontSize: 11.5)),
              ],
            ),
          ),
        ),
        GestureDetector(
          onTap: controller.onNotificationTap,
          child: Obx(
            () => Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none_rounded, color: Colors.white70, size: 23),
                if (controller.notificationCount.value > 0)
                  Positioned(
                    right: -1,
                    top: -1,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(color: kPurple, shape: BoxShape.circle),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 14),
        GestureDetector(
          onTap: controller.onProfileTap,
          child: Container(
            width: 34,
            height: 34,
            decoration: const BoxDecoration(gradient: LinearGradient(colors: [kPurple, kIndigo]), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Obx(
              () => Text(controller.userInitial.value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Financial Overview card ----------------
  Widget _buildFinancialOverviewCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FinanceHomeView.kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: FinanceHomeView.kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Financial Overview', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
              const SizedBox(width: 6),
              GestureDetector(
                onTap: controller.onOverviewInfoTap,
                child: const Icon(Icons.info_outline, color: Colors.white38, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: controller.onDateRangeTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, color: kPurple, size: 13),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Obx(
                      () => Text(controller.dateRangeText.value, style: const TextStyle(color:
                      Colors.white, fontSize: 11.5)),
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down, color: Colors.white, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Obx(
            () => GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: controller.financialStats.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 8,
                childAspectRatio: 1.55,
              ),
              itemBuilder: (context, index) => _FinancialStatItem(stat: controller.financialStats[index]),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Quick Actions 2-col grid ----------------
  Widget _buildQuickActionsGrid() {
    return Obx(
      () => GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.quickActions.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.50,
        ),
        itemBuilder: (context, index) {
          final action = controller.quickActions[index];
          return _QuickActionCard(action: action, onTap: () => controller.onQuickActionTap(action));
        },
      ),
    );
  }

  // ---------------- Key Insights card ----------------
  Widget _buildKeyInsightsCard() {
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Key Insights', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
              GestureDetector(
                onTap: controller.onViewAllInsights,
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('View All', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
                    Icon(Icons.chevron_right, color: kPurple, size: 15),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Obx(
            () => Column(
              children: controller.keyInsights
                  .map(
                    (insight) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: _KeyInsightRow(insight: insight, onTap: () => controller.onInsightTap(insight)),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// Financial overview stat item (icon + value + trend)
// =====================================================================
class _FinancialStatItem extends StatelessWidget {
  final FinancialStat stat;
  const _FinancialStatItem({required this.stat});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: stat.color.withOpacity(0.18), shape: BoxShape.circle),
          child: Icon(stat.icon, color: stat.color, size: 16),
        ),
        const SizedBox(height: 8),
        Text(stat.label, style: const TextStyle(color: Colors.white, fontSize: 9.5)),
        const SizedBox(height: 3),
        Text(stat.value, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800)),
        const SizedBox(height: 3),
        Row(
          children: [
            Icon(
              stat.isPositive ? Icons.arrow_upward : Icons.arrow_downward,
              color: stat.isPositive ? FinanceHomeView.kGreen : FinanceHomeView.kRed,
              size: 11,
            ),
            const SizedBox(width: 2),
            Text(
              '${stat.trendPercent}% vs last period',
              style: TextStyle(
                color: stat.isPositive ? FinanceHomeView.kGreen : FinanceHomeView.kRed,
                fontSize: 8.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// =====================================================================
// Quick action card
// =====================================================================
class _QuickActionCard extends StatelessWidget {
  final FinanceQuickAction action;
  final VoidCallback onTap;

  const _QuickActionCard({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: FinanceHomeView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: FinanceHomeView.kBorder),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: action.color.withOpacity(0.18), shape: BoxShape.circle),
              child: Icon(action.icon, color: action.color, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(action.title, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text(
                    action.subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontSize: 9.5),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white, size: 15),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Key insight row
// =====================================================================
class _KeyInsightRow extends StatelessWidget {
  final KeyInsight insight;
  final VoidCallback onTap;

  const _KeyInsightRow({required this.insight, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final trendColor = insight.isPositive ? FinanceHomeView.kGreen : FinanceHomeView.kRed;
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: insight.color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(insight.icon, color: insight.color, size: 17),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(insight.title, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(insight.subtitle, style: const TextStyle(color: Colors.white, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(insight.value, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(color: trendColor.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(insight.isPositive ? Icons.arrow_upward : Icons.arrow_downward, color: trendColor, size: 10),
                    const SizedBox(width: 2),
                    Text('${insight.trendPercent}%', style: TextStyle(color: trendColor, fontSize: 10, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
