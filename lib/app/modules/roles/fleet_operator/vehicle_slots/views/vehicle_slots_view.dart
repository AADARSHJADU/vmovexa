import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/vehicle_slot_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/vehicle_slots_controller.dart';
import 'add_vehicle_slot_sheet.dart';

class VehicleSlotsView extends GetView<VehicleSlotsController> {
  const VehicleSlotsView({super.key});

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
        title: const Text(
          'Vehicle Slots & Timetable',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: () => controller.loadSlots(),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              onPressed: () => AddVehicleSlotSheet.show(context),
              icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
              label: const Text(
                'Schedule',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: controller.loadSlots,
          color: const Color(0xFF6366F1),
          child: Column(
            children: [
              // 4 Stat Strip
              _buildStatsStrip(),

              // Search & View Mode Switcher
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    // Search Bar
                    Expanded(
                      child: TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        onChanged: controller.onSearchChanged,
                        decoration: InputDecoration(
                          hintText: 'Search slot, corridor, bus, driver...',
                          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
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
                    const SizedBox(width: 8),

                    // View Mode Switcher (List vs Timetable Matrix)
                    Obx(() {
                      final isList = controller.viewMode.value == 'list';
                      return Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () => controller.setViewMode('list'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isList ? const Color(0xFF6366F1) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(7),
                                ),
                                child: const Icon(Icons.view_agenda_outlined, color: Colors.white, size: 16),
                              ),
                            ),
                            GestureDetector(
                              onTap: () => controller.setViewMode('timetable'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                decoration: BoxDecoration(
                                  color: !isList ? const Color(0xFF6366F1) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(7),
                                ),
                                child: const Icon(Icons.grid_view_rounded, color: Colors.white, size: 16),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),

              // Filter Tabs
              _buildFilterTabs(),

              const SizedBox(height: 4),

              // Main Content (List or Timetable Grid)
              Expanded(
                child: Obx(() {
                  if (controller.isLoading.value) {
                    return const Center(
                      child: CircularProgressIndicator(color: Color(0xFF6366F1)),
                    );
                  }

                  if (controller.viewMode.value == 'timetable') {
                    return _buildTimetableMatrixView();
                  }

                  final list = controller.paginatedSlots;
                  if (list.isEmpty) {
                    return _buildEmptyState();
                  }

                  return Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: list.length,
                          separatorBuilder: (_, index) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            return _buildSlotCard(list[index]);
                          },
                        ),
                      ),

                      // Pagination Controls
                      _buildPaginationBar(),
                    ],
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsStrip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFF0F172A),
      child: Obx(() {
        return Row(
          children: [
            _buildStatItem('Total Slots', '${controller.totalCount.value}', const Color(0xFF94A3B8)),
            _buildStatDivider(),
            _buildStatItem('Active', '${controller.activeCount.value}', const Color(0xFF10B981)),
            _buildStatDivider(),
            _buildStatItem('Morning', '${controller.morningPeakCount.value}', const Color(0xFFF59E0B)),
            _buildStatDivider(),
            _buildStatItem('Evening', '${controller.eveningPeakCount.value}', const Color(0xFF6366F1)),
          ],
        );
      }),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildStatDivider() {
    return Container(
      width: 1,
      height: 24,
      color: const Color(0xFF334155),
    );
  }

  Widget _buildFilterTabs() {
    return Obx(() {
      final active = controller.activeTab.value;

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Row(
          children: controller.filterTabs.map((tab) {
            final isSelected = active == tab;

            return GestureDetector(
              onTap: () => controller.setTab(tab),
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: isSelected ? AppTheme.primaryGradient : null,
                  color: isSelected ? null : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected ? Colors.transparent : const Color(0xFF334155),
                  ),
                ),
                child: Text(
                  tab,
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }

  Widget _buildSlotCard(VehicleSlotModel slot) {
    final isPaused = slot.status == 'paused';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isPaused ? const Color(0xFFEF4444).withValues(alpha: 0.3) : const Color(0xFF334155),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Name, Code & Status
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      slot.slotName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      slot.slotCode,
                      style: const TextStyle(
                        color: Color(0xFF818CF8),
                        fontSize: 10.5,
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              _buildShiftBadge(slot.shiftType),
              const SizedBox(width: 6),
              _buildStatusPill(slot.status),
            ],
          ),

          const SizedBox(height: 10),

          // Corridor & Bus Strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.alt_route_rounded, color: Color(0xFF38BDF8), size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    slot.routeName ?? 'Corridor Route #${slot.routeId}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (slot.busNumber != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      slot.busNumber!,
                      style: const TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Bottom Row: Timings, Driver & Actions
          Row(
            children: [
              const Icon(Icons.schedule_rounded, color: Color(0xFF94A3B8), size: 14),
              const SizedBox(width: 4),
              Text(
                '${slot.startTime} - ${slot.endTime}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.person_outline_rounded, color: Color(0xFF94A3B8), size: 14),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  slot.driverName ?? 'Unassigned Driver',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              // Action Buttons
              IconButton(
                icon: Icon(
                  isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
                  color: isPaused ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  size: 20,
                ),
                tooltip: isPaused ? 'Activate Slot' : 'Pause Slot',
                onPressed: () => controller.toggleStatus(slot),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                tooltip: 'Delete Slot',
                onPressed: () => controller.deleteSlot(slot.id),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimetableMatrixView() {
    final list = controller.filteredSlots;
    if (list.isEmpty) return _buildEmptyState();

    final hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Hourly Transit Timeline (06:00 — 20:00)',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Operating Shifts',
                  style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(color: Color(0xFF334155), height: 1),
            const SizedBox(height: 12),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SizedBox(
                width: 780,
                child: Column(
                  children: [
                    // Hour Header Row
                    Row(
                      children: [
                        const SizedBox(
                          width: 160,
                          child: Text(
                            'Vehicle / Corridor',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                        ...hours.map((h) => Expanded(
                              child: Center(
                                child: Text(
                                  '${h.toString().padLeft(2, '0')}:00',
                                  style: const TextStyle(
                                    color: Color(0xFF64748B),
                                    fontSize: 9.5,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            )),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Rows
                    ...list.map((slot) {
                      final sHour = int.tryParse(slot.startTime.split(':')[0]) ?? 8;
                      final eHour = int.tryParse(slot.endTime.split(':')[0]) ?? 12;

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 160,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    slot.busNumber ?? 'Bus #${slot.vehicleId}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    slot.routeName ?? slot.slotName,
                                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            ...hours.map((h) {
                              final isActive = h >= sHour && h <= eHour;

                              return Expanded(
                                child: Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 1.5),
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: isActive
                                        ? const Color(0xFF3B82F6).withValues(alpha: 0.85)
                                        : const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(4),
                                    border: isActive
                                        ? Border.all(color: const Color(0xFF60A5FA), width: 0.5)
                                        : null,
                                  ),
                                  child: isActive
                                      ? const Center(
                                          child: Text('•', style: TextStyle(color: Colors.white, fontSize: 10)),
                                        )
                                      : null,
                                ),
                              );
                            }),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaginationBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Color(0xFF1E293B))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Obx(() {
            final page = controller.currentPage.value;
            final total = controller.totalPages;
            final count = controller.filteredSlots.length;
            return Text(
              'Showing Page $page of $total ($count slots)',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
            );
          }),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded, color: Colors.white70),
                onPressed: controller.prevPage,
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded, color: Colors.white70),
                onPressed: controller.nextPage,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.event_busy_rounded, color: Color(0xFF475569), size: 54),
          const SizedBox(height: 12),
          const Text(
            'No Vehicle Slots Found',
            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Schedule transit corridor runs to prevent bus collisions',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => AddVehicleSlotSheet.show(Get.context!),
            icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
            label: const Text('Schedule First Slot', style: TextStyle(color: Colors.white, fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShiftBadge(String shift) {
    Color bg;
    Color text;
    String label;

    switch (shift.toLowerCase()) {
      case 'morning_peak':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.15);
        text = const Color(0xFFFBBF24);
        label = 'Morning Peak';
        break;
      case 'regular_day':
        bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
        text = const Color(0xFF60A5FA);
        label = 'Regular Day';
        break;
      case 'evening_peak':
        bg = const Color(0xFF6366F1).withValues(alpha: 0.15);
        text = const Color(0xFF818CF8);
        label = 'Evening Peak';
        break;
      case 'night_shuttle':
        bg = const Color(0xFFA855F7).withValues(alpha: 0.15);
        text = const Color(0xFFC084FC);
        label = 'Night Shuttle';
        break;
      default:
        bg = const Color(0xFF64748B).withValues(alpha: 0.15);
        text = const Color(0xFF94A3B8);
        label = shift;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 9.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    final isActive = status.toLowerCase() == 'active';
    final color = isActive ? const Color(0xFF10B981) : const Color(0xFFF59E0B);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 4, height: 4, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 4),
          Text(
            isActive ? 'ACTIVE' : 'PAUSED',
            style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

