import 'package:flutter/material.dart';

enum DocumentStatus { verified, underReview, uploaded, missing }

extension DocumentStatusX on DocumentStatus {
  Color get color {
    switch (this) {
      case DocumentStatus.verified:
        return const Color(0xFF2ECC71);
      case DocumentStatus.underReview:
        return const Color(0xFFFFA726);
      case DocumentStatus.uploaded:
        return Colors.white54;
      case DocumentStatus.missing:
        return const Color(0xFFFF4D4D);
    }
  }
}

class DriverDocument {
  final String id;
  final String title;
  final IconData icon;
  final DocumentStatus status;
  final String statusLabel; // "Verified", "Under Review", "2 Uploaded", "Missing"

  DriverDocument({
    required this.id,
    required this.title,
    required this.icon,
    required this.status,
    required this.statusLabel,
  });
}