import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/services/advertiser_service.dart';

class AdvertiserSupportHistoryController extends GetxController {
  final AdvertiserService _service = AdvertiserService.to;

  final RxList<Map<String, dynamic>> allTickets = <Map<String, dynamic>>[].obs;
  final RxBool isLoading = false.obs;

  // Filter States
  final RxString activeTab = 'All'.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();

  // Pagination States (matching Admin panel AdvertiserSupportHistoryPage)
  final RxInt currentPage = 1.obs;
  final RxInt pageSize = 10.obs;
  final List<int> pageSizeOptions = const [5, 10, 20, 50];

  @override
  void onInit() {
    super.onInit();
    loadTickets();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  Future<void> loadTickets() async {
    try {
      isLoading.value = true;
      final res = await _service.getMyTickets(page: 1, limit: 100);

      if (res.success && res.data != null) {
        final d = res.data;
        if (d is List) {
          allTickets.assignAll(d.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList());
        } else if (d is Map && (d['rows'] is List || d['items'] is List || d['data'] is List)) {
          final list = (d['rows'] ?? d['items'] ?? d['data']) as List;
          allTickets.assignAll(list.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList());
        }
      }
    } catch (e) {
      debugPrint('[SupportHistory] Error loading tickets: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<Map<String, dynamic>> get filteredTickets {
    final q = searchQuery.value.trim().toLowerCase();
    final tab = activeTab.value;

    return allTickets.where((t) {
      final code = (t['code'] ?? t['id'] ?? '').toString().toLowerCase();
      final subject = (t['subject'] ?? '').toString().toLowerCase();
      final category = (t['category'] ?? '').toString().toLowerCase();

      final matchesSearch = q.isEmpty ||
          code.contains(q) ||
          subject.contains(q) ||
          category.contains(q);

      final status = (t['status'] ?? 'open').toString().toLowerCase();

      bool matchesTab = true;
      if (tab == 'Open') {
        matchesTab = status == 'open' || status == 'in_progress';
      } else if (tab == 'Resolved') {
        matchesTab = status == 'resolved';
      } else if (tab == 'Closed') {
        matchesTab = status == 'closed';
      }

      return matchesSearch && matchesTab;
    }).toList();
  }

  int get totalPages {
    final count = filteredTickets.length;
    if (count == 0) return 1;
    return (count / pageSize.value).ceil();
  }

  List<Map<String, dynamic>> get paginatedTickets {
    final list = filteredTickets;
    final from = (currentPage.value - 1) * pageSize.value;
    if (from >= list.length) {
      if (currentPage.value > 1) {
        currentPage.value = 1;
      }
      return list.take(pageSize.value).toList();
    }
    return list.skip(from).take(pageSize.value).toList();
  }

  int get paginationStartIndex {
    if (filteredTickets.isEmpty) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
  }

  int get paginationEndIndex {
    final end = currentPage.value * pageSize.value;
    return end > filteredTickets.length ? filteredTickets.length : end;
  }

  void setTab(String tab) {
    activeTab.value = tab;
    currentPage.value = 1;
  }

  void setSearch(String query) {
    searchQuery.value = query;
    currentPage.value = 1;
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    currentPage.value = 1;
  }

  void setPage(int page) {
    if (page >= 1 && page <= totalPages) {
      currentPage.value = page;
    }
  }

  void nextPage() {
    if (currentPage.value < totalPages) {
      currentPage.value++;
    }
  }

  void prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  void setPageSize(int newSize) {
    pageSize.value = newSize;
    currentPage.value = 1;
  }

  Color getStatusColor(String rawStatus) {
    final status = rawStatus.toLowerCase().replaceAll(' ', '_');
    switch (status) {
      case 'resolved':
        return const Color(0xFF10B981);
      case 'in_progress':
        return const Color(0xFFF59E0B);
      case 'closed':
        return const Color(0xFF64748B);
      case 'open':
      default:
        return const Color(0xFF3B82F6);
    }
  }

  String getStatusLabel(String rawStatus) {
    final status = rawStatus.toLowerCase().replaceAll(' ', '_');
    switch (status) {
      case 'resolved':
        return 'ticket_status_resolved'.tr;
      case 'in_progress':
        return 'ticket_status_in_progress'.tr;
      case 'closed':
        return 'ticket_status_closed'.tr;
      case 'open':
      default:
        return 'ticket_status_open'.tr;
    }
  }
}
