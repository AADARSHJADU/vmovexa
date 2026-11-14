import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import '../controller/driver_incidents_list_controller.dart';

class DriverIncidentsListView extends GetView<DriverIncidentsListController> {
  const DriverIncidentsListView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kRed = Color(0xFFFF4D4D);
  static const Color kOrange = Color(0xFFFF9500);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kBlue = Color(0xFF3F7BF5);

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.isRegistered<DriverIncidentsListController>()
        ? Get.find<DriverIncidentsListController>()
        : Get.put(DriverIncidentsListController());

    // Auto-fetch if empty and not loading
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (ctrl.allIncidents.isEmpty && !ctrl.isLoading.value) {
        ctrl.fetchIncidents();
      }
    });

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            // Top Section (Header, Search, Filters)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(ctrl),
                  const SizedBox(height: 12),
                  _buildSearchBar(ctrl),
                  const SizedBox(height: 10),
                  _buildCategoryPills(ctrl),
                  const SizedBox(height: 8),
                  _buildFilterRow(ctrl),
                ],
              ),
            ),
            const SizedBox(height: 4),

            // Incidents List Content
            Expanded(
              child: Obx(() {
                if (ctrl.isLoading.value && ctrl.allIncidents.isEmpty) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.accentPurple),
                  );
                }

                final list = ctrl.filteredIncidents;
                if (list.isEmpty) {
                  return RefreshIndicator(
                    color: AppColors.accentPurple,
                    backgroundColor: kCardBg,
                    onRefresh: ctrl.onRefresh,
                    child: ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.12),
                        _buildEmptyState(ctrl, context),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.accentPurple,
                  backgroundColor: kCardBg,
                  onRefresh: ctrl.onRefresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 85),
                    itemCount: list.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = list[index];
                      return _buildIncidentCard(context, item, () => ctrl.onIncidentTap(item));
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
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: AppColors.accentPurple.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text(
                'report_new_incident'.tr,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
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
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.warning_rounded, color: kRed, size: 22),
                  const SizedBox(width: 8),
                  Text(
                    'driver_incidents_title'.tr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Obx(
                    () => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.accentPurple.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.accentPurple.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        '${ctrl.allIncidents.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                'driver_incidents_subtitle'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        // Action Buttons: Refresh
        InkWell(
          onTap: ctrl.onRefresh,
          borderRadius: BorderRadius.circular(10),
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
          hintText: 'search_incidents_ph'.tr,
          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
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
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
        ),
      ),
    );
  }

  // ---------------- Quick Category Filter Pills ----------------
  Widget _buildCategoryPills(DriverIncidentsListController ctrl) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(
        () => Row(
          children: DriverIncidentsListController.categories.map((cat) {
            final isSelected = ctrl.selectedCategory.value == cat;
            final label = _getCategoryLabel(cat);

            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => ctrl.setCategory(cat),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : kCardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : kBorder,
                      width: 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.accentPurple.withValues(alpha: 0.35),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white60,
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
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

  // ---------------- Severity & Status Filters Row ----------------
  Widget _buildFilterRow(DriverIncidentsListController ctrl) {
    return Obx(() {
      return Row(
        children: [
          // Severity Dropdown Filter
          Expanded(
            child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: ctrl.selectedSeverity.value != 'ALL' ? AppColors.accentPurple : kBorder,
                  width: ctrl.selectedSeverity.value != 'ALL' ? 1.2 : 1,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: ctrl.selectedSeverity.value,
                  dropdownColor: kFieldBg,
                  isDense: true,
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white54, size: 18),
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                  items: DriverIncidentsListController.severities.map((sev) {
                    return DropdownMenuItem<String>(
                      value: sev,
                      child: Text(_getSeverityLabel(sev)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) ctrl.setSeverity(val);
                  },
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Status Dropdown Filter
          Expanded(
            child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: kCardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: ctrl.selectedStatus.value != 'ALL' ? AppColors.accentPurple : kBorder,
                  width: ctrl.selectedStatus.value != 'ALL' ? 1.2 : 1,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: ctrl.selectedStatus.value,
                  dropdownColor: kFieldBg,
                  isDense: true,
                  icon: const Icon(Icons.arrow_drop_down, color: Colors.white54, size: 18),
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                  items: DriverIncidentsListController.statuses.map((st) {
                    return DropdownMenuItem<String>(
                      value: st,
                      child: Text(_getStatusLabel(st)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) ctrl.setStatus(val);
                  },
                ),
              ),
            ),
          ),

          // Reset Filters Button
          if (ctrl.isFilterActive) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: ctrl.resetFilters,
              child: Container(
                height: 36,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: kRed.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kRed.withValues(alpha: 0.3)),
                ),
                alignment: Alignment.center,
                child: Row(
                  children: [
                    const Icon(Icons.close, color: kRed, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'reset_all_filters'.tr,
                      style: const TextStyle(color: kRed, fontSize: 10.5, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      );
    });
  }

  // ---------------- Incident Card ----------------
  Widget _buildIncidentCard(BuildContext context, DriverIncidentItem item, VoidCallback onTap) {
    final sev = (item.severity ?? 'low').toLowerCase();
    Color sevColor = kGreen;
    if (sev == 'critical') sevColor = kRed;
    if (sev == 'high') sevColor = kOrange;
    if (sev == 'medium') sevColor = Colors.amber;

    final st = (item.status ?? 'open').toLowerCase();
    Color stColor = kBlue;
    String stLabel = 'stat_review'.tr;
    if (st == 'in_progress' || st == 'investigating') {
      stColor = Colors.amber;
      stLabel = 'stat_in_progress'.tr;
    } else if (st == 'resolved') {
      stColor = kGreen;
      stLabel = 'stat_resolved'.tr;
    } else if (st == 'closed') {
      stColor = Colors.grey;
      stLabel = 'stat_closed'.tr;
    }

    final ticket = item.ticketNumber ?? (item.id != null ? '#${item.id}' : 'INC');
    final incType = item.incidentType ?? item.title ?? 'Incident';
    final locationText = item.locationName ?? item.location?.address ?? 'Location not specified';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 1: ID, Type & Status/Severity Badges
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: kFieldBg,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Text(
                          ticket,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              incType,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13.5,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${'incident_reported_at'.tr} ${_formatDate(item.reportedAt)}',
                              style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  children: [
                    // Severity Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: sevColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: sevColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        '● ${sev.toUpperCase()}',
                        style: TextStyle(
                          color: sevColor,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 5),
                    // Status Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: stColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: stColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        stLabel,
                        style: TextStyle(
                          color: stColor,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Description
            if (item.description != null && item.description!.isNotEmpty) ...[
              Text(
                item.description!,
                style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.35),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
            ],

            // Location with Pin
            Row(
              children: [
                const Icon(Icons.location_on_outlined, color: Colors.white38, size: 14),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    item.landmark != null && item.landmark!.isNotEmpty
                        ? '$locationText (${item.landmark})'
                        : locationText,
                    style: const TextStyle(color: Colors.white60, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            // Medical & Assistance Summary Card (if casualties, hospital, or police exist)
            if (item.hasCasualties || item.hospitalName != null || item.policeStationName != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.local_hospital_outlined, color: Color(0xFFFF5252), size: 14),
                            const SizedBox(width: 5),
                            Text(
                              'medical_assistance_label'.tr,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        if (item.hasCasualties)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: kRed.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'casualties_alert'.tr,
                              style: const TextStyle(color: kRed, fontSize: 9.5, fontWeight: FontWeight.w800),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Text(
                          '${'fatalities_label'.tr} ',
                          style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                        ),
                        Text(
                          '${item.deadCasualty}',
                          style: const TextStyle(color: kRed, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          '${'injured_label'.tr} ',
                          style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                        ),
                        Text(
                          '${item.injuredCount}',
                          style: const TextStyle(color: kOrange, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    if (item.hospitalName != null && item.hospitalName!.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Text(
                            '${'hospital_label'.tr} ',
                            style: const TextStyle(color: Colors.white38, fontSize: 10),
                          ),
                          Expanded(
                            child: Text(
                              item.hospitalName!,
                              style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],

            const SizedBox(height: 10),
            const Divider(color: Colors.white10, height: 1),
            const SizedBox(height: 8),

            // Card Footer: Media counters & "View Details" button with AppTheme.primaryGradient
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Media & GPS indicators
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (item.photos.isNotEmpty) ...[
                      const Icon(Icons.camera_alt_outlined, color: Colors.white38, size: 13),
                      const SizedBox(width: 3),
                      Text(
                        '${item.photos.length} ${'photos_count'.tr}',
                        style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                      ),
                      const SizedBox(width: 8),
                    ],
                    if (item.videos.isNotEmpty) ...[
                      const Icon(Icons.videocam_outlined, color: AppColors.accentPurple, size: 13),
                      const SizedBox(width: 3),
                      Text(
                        '${item.videos.length} ${'videos_count'.tr}',
                        style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                      ),
                      const SizedBox(width: 8),
                    ],
                    if (item.latitude != null && item.longitude != null) ...[
                      const Icon(Icons.check_circle_outline, color: kGreen, size: 13),
                      const SizedBox(width: 3),
                      Text(
                        'gps_recorded'.tr,
                        style: const TextStyle(color: kGreen, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ],
                ),


              ],
            ),
            const SizedBox(height: 5),
            // View Details Button with AppTheme.primaryGradient

            InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentPurple.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'view_details'.tr,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 12),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- Empty State ----------------
  Widget _buildEmptyState(DriverIncidentsListController ctrl, BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: kRed.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.warning_amber_rounded, color: kRed, size: 36),
            ),
            const SizedBox(height: 16),
            Text(
              'no_incidents_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'no_incidents_match_criteria'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            if (ctrl.isFilterActive)
              InkWell(
                onTap: ctrl.resetFilters,
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'clear_filters'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ---------------- Helpers ----------------
  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    try {
      final dt = DateTime.parse(raw).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }

  String _getCategoryLabel(String cat) {
    switch (cat) {
      case 'ALL':
        return 'cat_all'.tr;
      case 'Accident':
        return 'cat_accident'.tr;
      case 'Breakdown':
        return 'cat_breakdown'.tr;
      case 'Road Condition':
        return 'cat_road_condition'.tr;
      case 'Traffic Issue':
        return 'cat_traffic_issue'.tr;
      case 'Safety Concern':
        return 'cat_safety_concern'.tr;
      default:
        return cat;
    }
  }

  String _getSeverityLabel(String sev) {
    switch (sev) {
      case 'ALL':
        return 'all_severities'.tr;
      case 'CRITICAL':
        return 'sev_critical'.tr;
      case 'HIGH':
        return 'sev_high'.tr;
      case 'MEDIUM':
        return 'sev_medium'.tr;
      case 'LOW':
        return 'sev_low'.tr;
      default:
        return sev;
    }
  }

  String _getStatusLabel(String st) {
    switch (st) {
      case 'ALL':
        return 'all_statuses'.tr;
      case 'OPEN':
        return 'stat_review'.tr;
      case 'IN_PROGRESS':
        return 'stat_in_progress'.tr;
      case 'RESOLVED':
        return 'stat_resolved'.tr;
      case 'CLOSED':
        return 'stat_closed'.tr;
      default:
        return st;
    }
  }
}
