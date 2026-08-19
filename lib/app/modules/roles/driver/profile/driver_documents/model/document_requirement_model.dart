import 'package:flutter/material.dart';

enum DocumentReqStatus { uploaded, underReview, notUploaded }

extension DocumentReqStatusX on DocumentReqStatus {
  String get label {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return 'Uploaded';
      case DocumentReqStatus.underReview:
        return 'Under Review';
      case DocumentReqStatus.notUploaded:
        return 'Upload';
    }
  }

  Color get color {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return const Color(0xFF2ECC71);
      case DocumentReqStatus.underReview:
        return const Color(0xFFFFA726);
      case DocumentReqStatus.notUploaded:
        return const Color(0xFFB042FF);
    }
  }

  IconData get icon {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return Icons.check_circle_outline;
      case DocumentReqStatus.underReview:
        return Icons.access_time;
      case DocumentReqStatus.notUploaded:
        return Icons.file_upload_outlined;
    }
  }
}

class DocumentRequirement {
  final String id;
  final String title;
  final IconData icon;
  final bool isMandatory;
  final DocumentReqStatus status;
  final String? validTillText; // null when not applicable

  DocumentRequirement({
    required this.id,
    required this.title,
    required this.icon,
    required this.isMandatory,
    required this.status,
    this.validTillText,
  });
}
