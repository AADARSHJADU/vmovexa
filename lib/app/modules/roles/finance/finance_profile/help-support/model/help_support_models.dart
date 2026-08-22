import 'package:flutter/material.dart';

// ---------------- Quick Help ----------------
class QuickHelpItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;

  QuickHelpItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

// ---------------- Contact Support ----------------
enum ContactChannelType { liveChat, callSupport, emailSupport }

class ContactChannel {
  final ContactChannelType type;
  final String title;
  final String subtitle;
  final String statusText; // "Available Now", phone number, email address
  final IconData icon;
  final Color statusColor;

  ContactChannel({
    required this.type,
    required this.title,
    required this.subtitle,
    required this.statusText,
    required this.icon,
    required this.statusColor,
  });
}

// ---------------- Support Tickets ----------------
enum TicketStatus { inProgress, resolved, closed }

extension TicketStatusX on TicketStatus {
  String get label {
    switch (this) {
      case TicketStatus.inProgress:
        return 'In Progress';
      case TicketStatus.resolved:
        return 'Resolved';
      case TicketStatus.closed:
        return 'Closed';
    }
  }

  Color get color {
    switch (this) {
      case TicketStatus.inProgress:
        return const Color(0xFFB042FF);
      case TicketStatus.resolved:
        return const Color(0xFF3F7BF5);
      case TicketStatus.closed:
        return const Color(0xFF2ECC71);
    }
  }
}

class SupportTicket {
  final String id; // "CMP-2026-000124"
  final String title;
  final String subtitle;
  final String dateText;
  final TicketStatus status;
  final IconData icon;

  SupportTicket({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.dateText,
    required this.status,
    required this.icon,
  });
}

// ---------------- Popular Articles ----------------
class PopularArticle {
  final String id;
  final String title;

  PopularArticle({required this.id, required this.title});
}
