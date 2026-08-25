import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../auth/login/controllers/login_controller.dart';


class SupportTicket {
  final String id;
  final String title;
  final String subtitle;
  final String date;
  final String status; // 'Open', 'Resolved', 'Closed'
  final String icon;
  final Color iconColor;

  SupportTicket({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.date,
    required this.status,
    required this.icon,
    required this.iconColor,
  });
}

class SupportHistoryController extends GetxController {
  final searchController = TextEditingController();
  final RxString activeFilter = 'All'.obs;

  final List<SupportTicket> allTickets = [
    SupportTicket(
      id: 'TKT-2026-0518-0012',
      title: 'Vehicle location not updating',
      subtitle: 'Vehicle ID: VH-1024',
      date: '20 May 2026 • 10:30 AM',
      status: 'Open',
      icon:"assets/icons/fleet_operator_icons/truck.svg",
      iconColor: const Color(0xFF3B82F6),
    ),
    SupportTicket(
      id: 'TKT-2026-0512-0009',
      title: 'Device offline',
      subtitle: 'Vehicle ID: VH-1003',
      date: '12 May 2026 • 09:15 AM',
      status: 'Resolved',
      icon: "assets/icons/fleet_operator_icons/yoursupportHistoryA.svg",
      iconColor: const Color(0xFF8B5CF6),
    ),
    SupportTicket(
      id: 'TKT-2026-0505-0007',
      title: 'Fuel data not showing',
      subtitle: 'Vehicle ID: VH-0987',
      date: '05 May 2026 • 04:45 PM',
      status: 'Closed',
      icon: "assets/icons/fleet_operator_icons/pumpA.svg",
      iconColor: Colors.orangeAccent,
    ),
    SupportTicket(
      id: 'TKT-2026-0428-0005',
      title: 'Driver not assigned to vehicle',
      subtitle: 'Vehicle ID: VH-0976',
      date: '28 Apr 2026 • 11:20 AM',
      status: 'Resolved',
      icon: "assets/icons/profile.svg",
      iconColor: const Color(0xFF10B981),
    ),
    SupportTicket(
      id: 'TKT-2026-0415-0003',
      title: 'Login issue in mobile app',
      subtitle: 'App client warning log',
      date: '15 Apr 2026 • 02:10 PM',
      status: 'Closed',
      icon: "assets/icons/fleet_operator_icons/securityA.svg",
      iconColor: Colors.redAccent,
    ),
  ];

  final RxList<SupportTicket> filteredTickets = <SupportTicket>[].obs;

  @override
  void onInit() {
    super.onInit();
    if (LoginController.currentRole == 'Advertisement') {
      allTickets.clear();
      allTickets.addAll([
        SupportTicket(
          id: 'CMP-2026-000124',
          title: 'Campaign not displaying on screens',
          subtitle: 'Campaign ID: CMP-2026-000124',
          date: '08 May 2026 • 11:30 AM',
          status: 'Open',
          icon:"assets/icons/fleet_operator_icons/truck.svg",
          iconColor: const Color(0xFF8B5CF6),
        ),
        SupportTicket(
          id: 'CMP-2026-000089',
          title: 'Invoice download issue',
          subtitle: 'Campaign ID: CMP-2026-000089',
          date: '06 May 2026 • 04:20 PM',
          status: 'Resolved',
          icon: "assets/icons/fleet_operator_icons/truck.svg",
          iconColor: const Color(0xFF3B82F6),
        ),
        SupportTicket(
          id: 'CMP-2026-000067',
          title: 'Payment failed but amount deducted',
          subtitle: 'Campaign ID: CMP-2026-000067',
          date: '03 May 2026 • 09:15 AM',
          status: 'Closed',
          icon:"assets/icons/fleet_operator_icons/truck.svg",
          iconColor: Colors.orangeAccent,
        ),
      ]);
    }
    filteredTickets.assignAll(allTickets);
    ever(activeFilter, (_) => _filterTickets());
    searchController.addListener(_filterTickets);
  }


  void _filterTickets() {
    String query = searchController.text.toLowerCase();
    String filter = activeFilter.value;

    List<SupportTicket> temp = allTickets;
    if (filter != 'All') {
      temp = temp.where((t) => t.status == filter).toList();
    }
    if (query.isNotEmpty) {
      temp = temp.where((t) => t.id.toLowerCase().contains(query) || t.title.toLowerCase().contains(query)).toList();
    }
    filteredTickets.assignAll(temp);
  }

  void filterTicketsByStatus(String status) {
    activeFilter.value = status;
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
