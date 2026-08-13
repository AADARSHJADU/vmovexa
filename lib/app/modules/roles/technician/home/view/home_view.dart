import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/home_controller.dart';
import '../model/home_models.dart';


class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      // NOTE: BottomNavigationBar already built separately in your app shell,
      // so it isn't included here. Just drop this view as the body of that shell.
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.deviceStats.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFFB042FF)),
                )
              : RefreshIndicator(
                  color: const Color(0xFFB042FF),
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildWelcomeCard(),
                      const SizedBox(height: 20),
                      _buildStatsRow(),
                      const SizedBox(height: 24),
                      _buildSectionTitle('Quick Actions'),
                      const SizedBox(height: 12),
                      _buildQuickActionsGrid(),
                      const SizedBox(height: 24),
                      _buildTasksSectionHeader(),
                      const SizedBox(height: 12),
                      _buildTasksList(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header (logo + notification bell) ----------------
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Icon(Icons.menu, color: Colors.white70),
        Row(
          children: [
            ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Color(0xFF6A5CFF), Color(0xFFB042FF)],
              ).createShader(bounds),
              child: const Text(
                'VMOVEXA',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
        Stack(
          clipBehavior: Clip.none,
          children: [
            const Icon(Icons.notifications_none_rounded, color: Colors.white70),
            Positioned(
              right: -2,
              top: -2,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                  color: Color(0xFFB042FF),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------- Welcome + sync status ----------------
  Widget _buildWelcomeCard() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Obx(
            () => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, ${controller.technicianName.value}!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Here's an overview of today's activities.",
                  style: TextStyle(color: Colors.white54, fontSize: 12.5),
                ),
              ],
            ),
          ),
        ),
        Obx(
          () => Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Sync Status',
                  style: TextStyle(color: Colors.white54, fontSize: 11)),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    controller.isSynced.value ? 'Synced' : 'Not Synced',
                    style: TextStyle(
                      color: controller.isSynced.value
                          ? const Color(0xFF2ECC71)
                          : const Color(0xFFFF4D4D),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: controller.isSynced.value
                          ? const Color(0xFF2ECC71)
                          : const Color(0xFFFF4D4D),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
              Text(
                controller.lastSyncedText.value,
                style: const TextStyle(color: Colors.white38, fontSize: 10.5),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Top 3 stat cards ----------------
  Widget _buildStatsRow() {
    return Obx(
      () => Row(
        children: controller.deviceStats
            .map(
              (stat) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _StatCard(
                    stat: stat,
                    onTap: () => controller.onStatCardTap(stat),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  // ---------------- Quick actions 3x2 grid ----------------
  Widget _buildQuickActionsGrid() {
    return Obx(
      () => GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.quickActions.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 0.78,
        ),
        itemBuilder: (context, index) {
          final action = controller.quickActions[index];
          return _QuickActionCard(
            action: action,
            onTap: () => controller.onQuickActionTap(action),
          );
        },
      ),
    );
  }

  // ---------------- Today's Tasks header ----------------
  Widget _buildTasksSectionHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSectionTitle("Today's Tasks"),
        GestureDetector(
          onTap: controller.onViewAllTasks,
          child: const Row(
            children: [
              Text(
                'View All',
                style: TextStyle(
                  color: Color(0xFFB042FF),
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Icon(Icons.chevron_right, color: Color(0xFFB042FF), size: 16),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTasksList() {
    return Obx(
      () => Column(
        children: controller.todaysTasks
            .map(
              (task) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _TaskTile(
                  task: task,
                  onTap: () => controller.onTaskTap(task),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

// =====================================================================
// Stat card widget (Offline / Online / Issues)
// =====================================================================
class _StatCard extends StatelessWidget {
  final DeviceStat stat;
  final VoidCallback onTap;

  const _StatCard({required this.stat, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: stat.color.withOpacity(0.35)),
          // gradient: LinearGradient(
          //   begin: Alignment.topLeft,
          //   end: Alignment.bottomRight,
          //   colors: [
          //     stat.color.withOpacity(0.18),
          //     HomeView.kCardBg,
          //   ],
          // ),
        ),
        child: Column(
          children: [
            Icon(stat.icon, color: stat.color, size: 20),
            const SizedBox(height: 8),
            Text(
              stat.count,
              style: TextStyle(
                color: stat.color,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              stat.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              stat.subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 9.5),
            ),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Quick action card widget
// =====================================================================
class _QuickActionCard extends StatelessWidget {
  final QuickAction action;
  final VoidCallback onTap;

  const _QuickActionCard({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: HomeView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              // decoration: BoxDecoration(
              //   color: action.color.withOpacity(0.15),
              //   shape: BoxShape.circle,
              // ),
              child: Icon(action.icon, color: action.color, size: 22),
            ),
            const Spacer(),
            Center(
              child: Text(
                action.title,
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  height: 1.15,
                ),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              action.subtitle,
              maxLines: 2,
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 9),
            ),
            const SizedBox(height: 4),
            Icon(Icons.chevron_right, color: action.color, size: 14),
          ],
        ),
      ),
    );
  }
}

// =====================================================================
// Task tile widget
// =====================================================================
class _TaskTile extends StatelessWidget {
  final DashboardTask task;
  final VoidCallback onTap;

  const _TaskTile({required this.task, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: HomeView.kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              // decoration: BoxDecoration(
              //   color: task.iconColor.withOpacity(0.15),
              //   shape: BoxShape.circle,
              // ),
              child: Icon(task.icon, color: task.iconColor, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    task.subtitle,
                    style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              // decoration: BoxDecoration(
              //   color: task.statusColor.withOpacity(0.15),
              //   borderRadius: BorderRadius.circular(20),
              // ),
              child: Text(
                task.statusLabel,
                style: TextStyle(
                  color: task.statusColor,
                  fontSize: 9.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}
