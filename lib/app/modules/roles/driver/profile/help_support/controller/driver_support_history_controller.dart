import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../model/help_support_models.dart';
import '../widgets/create_support_ticket_sheet.dart';

class DriverSupportHistoryController extends GetxController {
  DriverService get _driverService => DriverService.to;

  final RxBool isLoading = false.obs;
  final RxList<DriverSupportTicketModel> allTickets = <DriverSupportTicketModel>[].obs;

  final RxString activeTab = 'All'.obs;
  final RxString searchQuery = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchTickets();
  }

  Future<void> fetchTickets() async {
    isLoading.value = true;
    try {
      final res = await _driverService.getMySupportTickets(page: 1, limit: 50);
      if (res.success && res.data != null) {
        allTickets.assignAll(res.data!);
      } else {
        allTickets.clear();
      }
    } catch (e) {
      debugPrint('DriverSupportHistoryController fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> onRefresh() async => fetchTickets();

  void setTab(String tab) {
    activeTab.value = tab;
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
  }

  // Count getters
  int get countAll => allTickets.length;
  int get countOpen => allTickets.where((t) => t.isOpen).length;
  int get countResolved => allTickets.where((t) => t.isResolved).length;
  int get countClosed => allTickets.where((t) => t.isClosed).length;

  List<DriverSupportTicketModel> get filteredTickets {
    final query = searchQuery.value.trim().toLowerCase();
    final tab = activeTab.value;

    return allTickets.where((ticket) {
      // 1. Tab filter
      bool tabMatch = true;
      if (tab == 'Open') {
        tabMatch = ticket.isOpen;
      } else if (tab == 'Resolved') {
        tabMatch = ticket.isResolved;
      } else if (tab == 'Closed') {
        tabMatch = ticket.isClosed;
      }

      if (!tabMatch) return false;

      // 2. Query filter
      if (query.isEmpty) return true;

      return ticket.code.toLowerCase().contains(query) ||
          ticket.subject.toLowerCase().contains(query) ||
          ticket.category.toLowerCase().contains(query) ||
          ticket.description.toLowerCase().contains(query);
    }).toList();
  }

  void openRaiseTicketModal() {
    Get.bottomSheet(
      CreateSupportTicketSheet(
        onSuccess: () {
          fetchTickets();
        },
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  void openTicketDetails(DriverSupportTicketModel ticket) {
    Get.toNamed(
      Routes.DRIVER_SUPPORT_TICKET_DETAILS,
      arguments: ticket,
    )?.then((_) => fetchTickets());
  }
}
