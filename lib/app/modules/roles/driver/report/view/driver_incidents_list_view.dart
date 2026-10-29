import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import '../controller/driver_incidents_list_controller.dart';

class DriverIncidentsListView extends GetView<DriverIncidentsListController> {
  const DriverIncidentsListView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBlue = Color(0xFF3F7BF5);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kRed = Color(0xFFFF4D4D);
  static const Color kOrange = Color(0xFFFF9500);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    // If not registered by binding, fallback put
    final ctrl = Get.isRegistered<DriverIncidentsListController>()
        ? Get.find<DriverIncidentsListController>()
        : Get.put(DriverIncidentsListController());

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Column(
                children: [
                  _buildHeader(ctrl),
                  const SizedBox(height: 14),
                  _buildSearchBar(ctrl),
                  const SizedBox(height: 10),
                  _buildSeverityChips(ctrl),
                  const SizedBox(height: 8),
                  _buildStatusChips(ctrl),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Obx(() {
                if (ctrl.isLoading.value && ctrl.allIncidents.isEmpty) {
                  return const Center(child: CircularProgressIndicator(color: kPurple));
                }

                final list = ctrl.filteredIncidents;
                if (list.isEmpty) {
                  return RefreshIndicator(
                    color: kPurple,
                    backgroundColor: kCardBg,
                    onRefresh: ctrl.onRefresh,
                    child: ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                        _buildEmptyState(ctrl),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: ctrl.onRefresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = list[index];
                      return _buildIncidentCard(item, () => ctrl.onIncidentTap(item));
                    },
                  ),
                );
              }),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: ctrl.onReportNewIncident,
        backgroundColor: Colors.transparent,
        elevation: 6,
        label: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFE52D27), Color(0xFFB31217)]),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFE52D27).withOpacity(0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
              SizedBox(width: 8),
              Text(
                'Report Incident',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader(DriverIncidentsListController ctrl) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Incidents Log',
              style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 2),
            Obx(
              () => Text(
                '${ctrl.filteredIncidents.length} of ${ctrl.allIncidents.length} reported events',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ),
          ],
        ),
        GestureDetector(
          onTap: ctrl.fetchIncidents,
          child: Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorder),
            ),
            child: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
          ),
        ),
      ],
    );
  }

  // ---------------- Search Bar ----------------
  Widget _buildSearchBar(DriverIncidentsListController ctrl) {
    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: TextField(
        controller: ctrl.searchController,
        onChanged: ctrl.updateSearch,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: 'Search by issue, location or ID...',
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12.5),
          prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
          suffixIcon: Obx(
            () => ctrl.searchQuery.value.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.close, color: Colors.white38, size: 16),
                    onPressed: ctrl.clearSearch,
                  )
                : const SizedBox.shrink(),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  // ---------------- Severity Chips ----------------
  Widget _buildSeverityChips(DriverIncidentsListController ctrl) {
    const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(
        () => Row(
          children: severities.map((sev) {
            final isSelected = ctrl.selectedSeverity.value == sev;
            Color chipColor = kPurple;
            if (sev == 'CRITICAL') chipColor = kRed;
            if (sev == 'HIGH') chipColor = kOrange;
            if (sev == 'MEDIUM') chipColor = Colors.amber;
            if (sev == 'LOW') chipColor = kGreen;

            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => ctrl.setSeverity(sev),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected ? chipColor.withOpacity(0.2) : kCardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? chipColor : kBorder,
                      width: isSelected ? 1.2 : 1,
                    ),
                  ),
                  child: Text(
                    sev,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white60,
                      fontSize: 10.5,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ---------------- Status Chips ----------------
  Widget _buildStatusChips(DriverIncidentsListController ctrl) {
    const statuses = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(
        () => Row(
          children: statuses.map((st) {
            final isSelected = ctrl.selectedStatus.value == st;
            final label = st.replaceAll('_', ' ');

            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => ctrl.setStatus(st),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white38,
                      fontSize: 10.5,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ---------------- Incident Card ----------------
  Widget _buildIncidentCard(DriverIncidentItem item, VoidCallback onTap) {
    final sev = (item.severity ?? 'low').toLowerCase();
    Color sevColor = kGreen;
    if (sev == 'critical') sevColor = kRed;
    if (sev == 'high') sevColor = kOrange;
    if (sev == 'medium') sevColor = Colors.amber;

    final st = (item.status ?? 'open').toLowerCase();
    Color stColor = kBlue;
    String stLabel = 'Open';
    if (st == 'in_progress' || st == 'investigating') {
      stColor = Colors.amber;
      stLabel = 'In Progress';
    } else if (st == 'resolved' || st == 'closed') {
      stColor = kGreen;
      stLabel = 'Resolved';
    }

    final ticket = item.ticketNumber ?? (item.id != null ? 'INC-${item.id!.substring(0, item.id!.length > 6 ? 6 : item.id!.length)}' : 'INC');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Ticket + Badges
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: kFieldBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        ticket,
                        style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: sevColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: sevColor.withOpacity(0.4)),
                      ),
                      child: Text(
                        sev.toUpperCase(),
                        style: TextStyle(color: sevColor, fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: stColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(color: stColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        stLabel,
                        style: TextStyle(color: stColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Title
            Text(
              item.title ?? 'Incident',
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
            ),
            if (item.description != null && item.description!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                item.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white60, fontSize: 12, height: 1.3),
              ),
            ],
            const SizedBox(height: 12),

            // Footer info: Date + Photos + Arrow
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time, color: Colors.white38, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(item.reportedAt),
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                    ),
                    if (item.mediaUrls.isNotEmpty) ...[
                      const SizedBox(width: 10),
                      const Icon(Icons.photo_library_outlined, color: Colors.white38, size: 12),
                      const SizedBox(width: 3),
                      Text(
                        '${item.mediaUrls.length}',
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ],
                  ],
                ),
                const Row(
                  children: [
                    Text('View details', style: TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600)),
                    Icon(Icons.chevron_right, color: kPurple, size: 14),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Empty State ----------------
  Widget _buildEmptyState(DriverIncidentsListController ctrl) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: kCardBg,
                shape: BoxShape.circle,
                border: Border.all(color: kBorder),
              ),
              child: const Icon(Icons.check_circle_outline, color: kGreen, size: 36),
            ),
            const SizedBox(height: 14),
            const Text(
              'No Incidents Found',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'All transit operations are running normally without any recorded issues.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: ctrl.onReportNewIncident,
              icon: const Icon(Icons.add_alert_outlined, size: 16),
              label: const Text('Report New Incident'),
              style: ElevatedButton.styleFrom(
                backgroundColor: kPurple,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return 'Recent';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) {
        return '${diff.inMinutes}m ago';
      } else if (diff.inHours < 24) {
        return '${diff.inHours}h ago';
      } else {
        return '${dt.day}/${dt.month}/${dt.year}';
      }
    } catch (_) {
      return raw;
    }
  }
}
