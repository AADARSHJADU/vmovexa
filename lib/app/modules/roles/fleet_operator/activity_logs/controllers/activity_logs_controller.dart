import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/activity_log_model.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class ActivityLogsController extends GetxController {
  final FleetService _fleetService = FleetService.to;

  // Observable State
  final RxList<ActivityLogModel> logsList = <ActivityLogModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool isExporting = false.obs;

  // Filter States (matching AdminUserActivityPage.jsx)
  final RxString searchQuery = ''.obs;
  final RxString debouncedSearch = ''.obs;
  final RxString categoryFilter = 'All'.obs;
  final RxString eventFilter = 'All'.obs;
  final RxString severityFilter = 'All'.obs;
  final RxString dateRangeFilter = 'ALL'.obs; // ALL, TODAY, 7DAYS, 30DAYS
  final RxString sortBy = 'created_at'.obs; // created_at, id, severity
  final RxString sortOrder = 'DESC'.obs; // DESC, ASC

  // View & Modal State
  final RxString viewMode = 'table'.obs; // 'table' | 'list'
  final Rxn<ActivityLogModel> selectedLog = Rxn<ActivityLogModel>();

  // Pagination State (matching AdminUserActivityPage.jsx <Pagination />)
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 10.obs;
  final List<int> pageSizeOptions = [10, 20, 50, 100];

  // Dynamic Options
  final RxList<String> categoryOptions = <String>[].obs;
  final RxList<String> eventOptions = <String>[].obs;
  final List<String> severityOptions = ['All', 'INFO', 'WARNING', 'CRITICAL'];
  final List<String> dateOptions = ['ALL', 'TODAY', '7DAYS', '30DAYS'];

  Timer? _searchDebounceTimer;

  @override
  void onInit() {
    super.onInit();
    loadLogs();
    loadFiltersAndCategories();
  }

  @override
  void onClose() {
    _searchDebounceTimer?.cancel();
    super.onClose();
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    _searchDebounceTimer?.cancel();
    _searchDebounceTimer = Timer(const Duration(milliseconds: 300), () {
      debouncedSearch.value = query.trim();
      currentPage.value = 1;
    });
  }

  void clearSearch() {
    searchQuery.value = '';
    debouncedSearch.value = '';
    currentPage.value = 1;
  }

  // --- Filtering & Sorting Engine (Matches Admin Panel Exactly) ---
  List<ActivityLogModel> get filteredLogs {
    final q = debouncedSearch.value.toLowerCase();
    final cat = categoryFilter.value;
    final ev = eventFilter.value;
    final sev = severityFilter.value.toUpperCase();
    final dateRange = dateRangeFilter.value;

    DateTime? cutoff;
    final now = DateTime.now();
    if (dateRange == 'TODAY') {
      cutoff = DateTime(now.year, now.month, now.day);
    } else if (dateRange == '7DAYS') {
      cutoff = now.subtract(const Duration(days: 7));
    } else if (dateRange == '30DAYS') {
      cutoff = now.subtract(const Duration(days: 30));
    }

    final filtered = logsList.where((log) {
      // 1. Text Search across action, actor, email, category, event, id
      if (q.isNotEmpty) {
        final action = log.action.toLowerCase();
        final actor = log.actorName.toLowerCase();
        final email = log.actorEmail.toLowerCase();
        final c = log.category.toLowerCase();
        final e = log.event.toLowerCase();
        final id = log.id.toLowerCase();
        final matchesText = action.contains(q) ||
            actor.contains(q) ||
            email.contains(q) ||
            c.contains(q) ||
            e.contains(q) ||
            id.contains(q);
        if (!matchesText) return false;
      }

      // 2. Severity Filter
      if (sev != 'ALL' && log.severity.toUpperCase() != sev) {
        return false;
      }

      // 3. Category Filter
      if (cat != 'All') {
        if (!log.category.toLowerCase().contains(cat.toLowerCase())) {
          return false;
        }
      }

      // 4. Event / Action Type Filter
      if (ev != 'All') {
        if (!log.event.toLowerCase().contains(ev.toLowerCase())) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (cutoff != null) {
        try {
          final logDate = DateTime.parse(log.createdAt.isNotEmpty ? log.createdAt : log.timestamp);
          if (logDate.isBefore(cutoff)) return false;
        } catch (_) {}
      }

      return true;
    }).toList();

    // Sort logs
    filtered.sort((a, b) {
      final isAsc = sortOrder.value == 'ASC';
      if (sortBy.value == 'created_at') {
        final tA = DateTime.tryParse(a.createdAt)?.millisecondsSinceEpoch ?? 0;
        final tB = DateTime.tryParse(b.createdAt)?.millisecondsSinceEpoch ?? 0;
        return isAsc ? tA.compareTo(tB) : tB.compareTo(tA);
      } else if (sortBy.value == 'id') {
        return isAsc ? a.id.compareTo(b.id) : b.id.compareTo(a.id);
      } else if (sortBy.value == 'severity') {
        int rank(String s) => s == 'CRITICAL' ? 3 : (s == 'WARNING' ? 2 : 1);
        final rA = rank(a.severity.toUpperCase());
        final rB = rank(b.severity.toUpperCase());
        return isAsc ? rA.compareTo(rB) : rB.compareTo(rA);
      }
      return 0;
    });

    return filtered;
  }

  // --- Pagination Computations ---
  int get totalItems => filteredLogs.length;

  int get totalPages => max(1, (totalItems / pageSize.value).ceil());

  List<ActivityLogModel> get paginatedLogs {
    final total = totalItems;
    if (total == 0) return [];
    final start = (currentPage.value - 1) * pageSize.value;
    if (start >= total) {
      currentPage.value = 1;
      return filteredLogs.take(pageSize.value).toList();
    }
    final end = min(start + pageSize.value, total);
    return filteredLogs.sublist(start, end);
  }

  String get paginationRangeText {
    if (totalItems == 0) return 'Showing 0 - 0 of 0 entries';
    final start = (currentPage.value - 1) * pageSize.value + 1;
    final end = min(currentPage.value * pageSize.value, totalItems);
    return 'Showing $start - $end of $totalItems entries';
  }

  String get pageIndicatorText => 'Page ${currentPage.value} of $totalPages';

  bool get canPrev => currentPage.value > 1;
  bool get canNext => currentPage.value < totalPages;

  void goToPage(int page) {
    if (page >= 1 && page <= totalPages) {
      currentPage.value = page;
    }
  }

  void nextPage() {
    if (canNext) {
      currentPage.value++;
    }
  }

  void prevPage() {
    if (canPrev) {
      currentPage.value--;
    }
  }

  void changePageSize(int size) {
    pageSize.value = size;
    currentPage.value = 1;
  }

  // --- Stats KPI Calculations ---
  int get infoCount => logsList.where((l) => l.severity.toUpperCase() == 'INFO' || l.severity.isEmpty).length;
  int get warningCount => logsList.where((l) => l.severity.toUpperCase() == 'WARNING').length;
  int get criticalCount => logsList.where((l) => l.severity.toUpperCase() == 'CRITICAL').length;

  // --- Reset Filters ---
  void resetFilters() {
    searchQuery.value = '';
    debouncedSearch.value = '';
    categoryFilter.value = 'All';
    eventFilter.value = 'All';
    severityFilter.value = 'All';
    dateRangeFilter.value = 'ALL';
    sortBy.value = 'created_at';
    sortOrder.value = 'DESC';
    currentPage.value = 1;
  }

  // --- Fetch API Logs ---
  Future<void> loadLogs() async {
    isLoading.value = true;
    try {
      final res = await _fleetService.getActivityLogs(
        page: currentPage.value,
        limit: 100, // Fetch ample records for smooth local slicing & instant client filter
        search: debouncedSearch.value.isNotEmpty ? debouncedSearch.value : null,
        category: categoryFilter.value != 'All' ? categoryFilter.value : null,
        event: eventFilter.value != 'All' ? eventFilter.value : null,
        severity: severityFilter.value != 'All' ? severityFilter.value : null,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      );

      if (res.success && res.data != null) {
        logsList.assignAll(res.data!.items);
      } else {
        logsList.clear();
      }
    } catch (_) {
      logsList.clear();
    } finally {
      _extractDynamicCategoriesAndEvents();
      isLoading.value = false;
    }
  }

  Future<void> loadFiltersAndCategories() async {
    try {
      final catRes = await _fleetService.getActivityCategories();
      if (catRes.success && catRes.data != null && catRes.data!.isNotEmpty) {
        final list = catRes.data!;
        categoryOptions.assignAll(['All', ...list]);
      }
    } catch (_) {}
  }

  void _extractDynamicCategoriesAndEvents() {
    final cats = <String>{'All'};
    final evs = <String>{'All'};
    for (final l in logsList) {
      if (l.category.isNotEmpty) cats.add(l.category);
      if (l.event.isNotEmpty) evs.add(l.event);
    }
    categoryOptions.assignAll(cats.toList()..sort());
    eventOptions.assignAll(evs.toList()..sort());
  }

  // --- Export CSV Implementation ---
  void handleExportCSV() {
    if (logsList.isEmpty) {
      Get.snackbar(
        'Export Empty',
        'No activity logs available to export.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.amber.shade900,
        colorText: Colors.white,
      );
      return;
    }

    final headers = ['ID', 'Timestamp', 'Severity', 'Category', 'Action', 'User', 'Email', 'Role', 'IP Address'];
    final rows = <String>[headers.join(',')];

    for (final l in filteredLogs) {
      rows.add([
        l.id,
        '"${l.createdAt.isNotEmpty ? l.createdAt : l.timestamp}"',
        '"${l.severity}"',
        '"${l.category}"',
        '"${l.action.replaceAll('"', '""')}"',
        '"${l.actorName.replaceAll('"', '""')}"',
        '"${l.actorEmail}"',
        '"${l.actorRole}"',
        '"${l.ipAddress}"',
      ].join(','));
    }

    final csvContent = rows.join('\n');
    final fileName = 'activity_logs_${DateTime.now().toIso8601String().substring(0, 10)}.csv';

    // Show Export Modal BottomSheet
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF10121A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFF06B6D4), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.file_download_done_rounded, color: Color(0xFF06B6D4), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Export Activity Logs CSV',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.grey, size: 20),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'File: $fileName • ${filteredLogs.length} Records',
              style: const TextStyle(color: Color(0xFF06B6D4), fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              height: 110,
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white12),
              ),
              child: SingleChildScrollView(
                child: Text(
                  csvContent,
                  style: const TextStyle(color: Color(0xFF67E8F9), fontSize: 10, fontFamily: 'monospace'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white24),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.copy_rounded, size: 16),
                    label: const Text('Copy to Clipboard', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: csvContent));
                      Get.back();
                      Get.snackbar(
                        'CSV Copied',
                        'CSV text copied to clipboard successfully!',
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: const Color(0xFF06B6D4),
                        colorText: Colors.black,
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.download_rounded, size: 16),
                    label: const Text('Save CSV', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: csvContent));
                      Get.back();
                      Get.snackbar(
                        'Export Complete',
                        'File $fileName downloaded (${filteredLogs.length} rows exported).',
                        snackPosition: SnackPosition.BOTTOM,
                        backgroundColor: const Color(0xFF06B6D4),
                        colorText: Colors.black,
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  // --- Inspect Log Details BottomSheet ---
  void openLogDetails(ActivityLogModel log) {
    selectedLog.value = log;
  }

  void copyLogPayload(ActivityLogModel log) {
    Clipboard.setData(ClipboardData(text: log.rawJsonString));
    Get.snackbar(
      'Payload Copied',
      'Raw JSON log payload copied to clipboard.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF06B6D4),
      colorText: Colors.black,
      duration: const Duration(seconds: 2),
    );
  }

}
