import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
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
                  const SizedBox(height: 12),
                  _buildTabBar(ctrl),
                  const SizedBox(height: 12),
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
                if (ctrl.isLoading.value && ctrl.allIncidents.isEmpty && ctrl.allWorkOrders.isEmpty) {
                  return const Center(child: CircularProgressIndicator(color: kPurple));
                }

                if (ctrl.selectedViewTab.value == 0) {
                  // Tab 0: SOS Incidents
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
                      separatorBuilder: (_, index) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = list[index];
                        return _buildIncidentCard(item, () => ctrl.onIncidentTap(item));
                      },
                    ),
                  );
                } else {
                  // Tab 1: Defect Work Orders
                  final list = ctrl.filteredWorkOrders;
                  if (list.isEmpty) {
                    return RefreshIndicator(
                      color: kPurple,
                      backgroundColor: kCardBg,
                      onRefresh: ctrl.onRefresh,
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                          _buildWorkOrdersEmptyState(ctrl,context),
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
                      separatorBuilder: (_, index) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = list[index];
                        return _buildWorkOrderCard(context, item, ctrl);
                      },
                    ),
                  );
                }
              }),
            ),
          ],
        ),
      ),
      floatingActionButton: Obx(() {
        final isWorkOrderTab = ctrl.selectedViewTab.value == 1;
        return FloatingActionButton.extended(
          onPressed: isWorkOrderTab ? () => _showCreateWorkOrderSheet(context, ctrl) : ctrl.onReportNewIncident,
          backgroundColor: Colors.transparent,
          elevation: 6,
          label: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: isWorkOrderTab
                  ? const LinearGradient(colors: [Color(0xFF6A5CFF), Color(0xFFB042FF)])
                  : const LinearGradient(colors: [Color(0xFFE52D27), Color(0xFFB31217)]),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: (isWorkOrderTab ? const Color(0xFF6A5CFF) : const Color(0xFFE52D27)).withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(isWorkOrderTab ? Icons.build_rounded : Icons.warning_amber_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  isWorkOrderTab ? 'report_defect'.tr : 'report_incident'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        );
      }),
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
            Text(
              'incidents_work_orders'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 2),
            Obx(
              () => Text(
                ctrl.selectedViewTab.value == 0
                    ? '${ctrl.filteredIncidents.length} ${'reported_events_sub'.tr}'
                    : '${ctrl.filteredWorkOrders.length} ${'maintenance_tickets_sub'.tr}',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ),
          ],
        ),
        GestureDetector(
          onTap: ctrl.onRefresh,
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

  // ---------------- Tab Bar ----------------
  Widget _buildTabBar(DriverIncidentsListController ctrl) {
    return Obx(() {
      final tab = ctrl.selectedViewTab.value;
      return Container(
        height: 40,
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: kBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => ctrl.switchTab(0),
                child: Container(
                  decoration: BoxDecoration(
                    color: tab == 0 ? kPurple.withOpacity(0.25) : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                    border: tab == 0 ? Border.all(color: kPurple.withOpacity(0.5)) : null,
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.emergency_outlined, color: Colors.white, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        '${'incidents'.tr} (${ctrl.allIncidents.length})',
                        style: TextStyle(
                          color: tab == 0 ? Colors.white : Colors.white60,
                          fontSize: 12,
                          fontWeight: tab == 0 ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => ctrl.switchTab(1),
                child: Container(
                  decoration: BoxDecoration(
                    color: tab == 1 ? kIndigo.withOpacity(0.25) : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                    border: tab == 1 ? Border.all(color: kIndigo.withOpacity(0.5)) : null,
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.build_circle_outlined, color: Colors.white, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        '${'work_orders'.tr} (${ctrl.allWorkOrders.length})',
                        style: TextStyle(
                          color: tab == 1 ? Colors.white : Colors.white60,
                          fontSize: 12,
                          fontWeight: tab == 1 ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
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
          hintText: 'search_driver_incidents_hint'.tr,
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
    String stLabel = 'open'.tr;
    if (st == 'in_progress' || st == 'investigating') {
      stColor = Colors.amber;
      stLabel = 'in_progress'.tr;
    } else if (st == 'resolved' || st == 'closed') {
      stColor = kGreen;
      stLabel = 'resolved'.tr;
    }

    final ticket = item.ticketNumber ?? (item.id != null ? 'INC-' : 'INC');

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
                        '',
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    ],
                  ],
                ),
                Row(
                  children: [
                    Text('view_details'.tr, style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600)),
                    const Icon(Icons.chevron_right, color: kPurple, size: 14),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Work Order Card ----------------
  Widget _buildWorkOrderCard(BuildContext context, WorkOrderModel item, DriverIncidentsListController ctrl) {
    final urg = item.urgency.toLowerCase();
    Color urgColor = kGreen;
    if (urg == 'critical') urgColor = kRed;
    if (urg == 'high') urgColor = kOrange;
    if (urg == 'normal') urgColor = Colors.amber;

    final st = item.status.toLowerCase();
    Color stColor = kBlue;
    String stLabel = item.status;
    if (st == 'dispatched' || st == 'on_site' || st == 'in_progress') {
      stColor = Colors.amber;
      stLabel = 'in_repair'.tr;
    } else if (st == 'resolved' || st == 'closed') {
      stColor = kGreen;
      stLabel = 'resolved'.tr;
    }

    final isResolved = st == 'resolved' || st == 'closed';

    return Container(
      padding: const EdgeInsets.all(14),
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: kFieldBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.code,
                      style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: urgColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: urgColor.withOpacity(0.4)),
                    ),
                    child: Text(
                      item.urgency.toUpperCase(),
                      style: TextStyle(color: urgColor, fontSize: 9.5, fontWeight: FontWeight.bold),
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
                child: Text(
                  stLabel.toUpperCase(),
                  style: TextStyle(color: stColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            item.issueCategory,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
          ),
          if (item.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              item.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white60, fontSize: 12, height: 1.3),
            ),
          ],
          const SizedBox(height: 10),
          // Technician or Depot info
          Row(
            children: [
              const Icon(Icons.engineering_outlined, color: Colors.white38, size: 13),
              const SizedBox(width: 5),
              Text(
                item.technician?.name ?? 'Assigned Depot: ',
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Rating button if resolved
          if (isResolved) ...[
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showRatingDialog(context, item, ctrl),
                icon: const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                label: Text('rate_tech_quality'.tr, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.amber,
                  side: const BorderSide(color: Colors.amber),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- Rate Dialog ----------------
  void _showRatingDialog(BuildContext context, WorkOrderModel item, DriverIncidentsListController ctrl) {
    int selectedStars = 5;
    final feedbackCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: kCardBg,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(builder: (context, setState) {
          return Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${'rate_repair'.tr} (${item.code})', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    IconButton(icon: const Icon(Icons.close, color: Colors.white70), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 6),
                Text('${'technician_label'.tr} ${item.technician?.name ?? "NOC"}', style: const TextStyle(color: Colors.white60, fontSize: 12)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final star = index + 1;
                    return IconButton(
                      icon: Icon(
                        star <= selectedStars ? Icons.star_rounded : Icons.star_border_rounded,
                        color: Colors.amber,
                        size: 32,
                      ),
                      onPressed: () => setState(() => selectedStars = star),
                    );
                  }),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: feedbackCtrl,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'add_feedback_hint'.tr,
                    hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                    filled: true,
                    fillColor: kFieldBg,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ctrl.rateWorkOrder(item.id, selectedStars, feedbackCtrl.text);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPurple,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text('submit_rating'.tr, style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  // ---------------- Empty States ----------------
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
            Text(
              'no_incidents_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              'all_ops_normal_sub'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white38, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkOrdersEmptyState(DriverIncidentsListController ctrl,context) {
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
              child: const Icon(Icons.build_circle_outlined, color: kIndigo, size: 36),
            ),
            const SizedBox(height: 14),
            Text(
              'no_work_orders_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              'no_work_orders_sub'.tr,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: () => _showCreateWorkOrderSheet(context, ctrl),
              icon: const Icon(Icons.add_rounded, size: 16),
              label: Text('report_vehicle_defect'.tr),
              style: ElevatedButton.styleFrom(
                backgroundColor: kIndigo,
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


  // ---------------- Create Work Order Sheet ----------------
  void _showCreateWorkOrderSheet(BuildContext context, DriverIncidentsListController ctrl) {
    const categories = [
      'Engine / Mechanical',
      'Brakes / Steering',
      'Electrical / Battery',
      'Tyres / Wheels',
      'Body / Damage',
      'Air Conditioning / HVAC',
      'GPS / Tracking Device',
      'Display Screen / Media',
      'Other',
    ];

    String selectedCat = categories.first;
    String selectedUrg = 'normal';
    final descCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: kCardBg,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'report_vehicle_defect'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Issue Category dropdown
                    Text('issue_category'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: kFieldBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: kBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedCat,
                          isExpanded: true,
                          dropdownColor: kCardBg,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                          items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => selectedCat = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Urgency chips
                    Text('urgency_priority'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Row(
                      children: ['critical', 'high', 'normal', 'low'].map((u) {
                        final isSel = selectedUrg == u;
                        Color c = kGreen;
                        if (u == 'critical') c = kRed;
                        if (u == 'high') c = kOrange;
                        if (u == 'normal') c = Colors.amber;

                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: GestureDetector(
                              onTap: () => setState(() => selectedUrg = u),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSel ? c.withOpacity(0.2) : kFieldBg,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: isSel ? c : kBorder, width: isSel ? 1.5 : 1),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  u.toUpperCase(),
                                  style: TextStyle(
                                    color: isSel ? Colors.white : Colors.white60,
                                    fontSize: 9.5,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Description textfield
                    Text('defect_description'.tr, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: descCtrl,
                      maxLines: 3,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'describe_malfunction_hint'.tr,
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                        filled: true,
                        fillColor: kFieldBg,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Submit button
                    Obx(() {
                      final loading = ctrl.isSubmittingWorkOrder.value;
                      return SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: loading
                              ? null
                              : () async {
                                  if (descCtrl.text.trim().isEmpty) {
                                    Get.snackbar('required'.tr, 'please_describe_defect'.tr, backgroundColor: kCardBg, colorText: Colors.redAccent);
                                    return;
                                  }
                                  final ok = await ctrl.createDefectWorkOrder(
                                    issueCategory: selectedCat,
                                    urgency: selectedUrg,
                                    description: descCtrl.text.trim(),
                                  );
                                  if (ok && context.mounted) {
                                    Navigator.pop(ctx);
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kIndigo,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: loading
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : Text('dispatch_work_order'.tr, style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return 'Recent';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) {
        return 'm ago';
      } else if (diff.inHours < 24) {
        return 'h ago';
      } else {
        return '//';
      }
    } catch (_) {
      return raw;
    }
  }
}
