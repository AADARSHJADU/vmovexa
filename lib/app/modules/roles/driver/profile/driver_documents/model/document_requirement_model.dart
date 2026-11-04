import 'package:flutter/material.dart';

enum DocumentReqStatus { uploaded, underReview, notUploaded, rejected }

extension DocumentReqStatusX on DocumentReqStatus {
  String get label {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return 'Verified';
      case DocumentReqStatus.underReview:
        return 'Under Review';
      case DocumentReqStatus.notUploaded:
        return 'Upload';
      case DocumentReqStatus.rejected:
        return 'Rejected';
    }
  }

  Color get color {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return const Color(0xFF10B981);
      case DocumentReqStatus.underReview:
        return const Color(0xFFF59E0B);
      case DocumentReqStatus.notUploaded:
        return const Color(0xFFB042FF);
      case DocumentReqStatus.rejected:
        return const Color(0xFFEF4444);
    }
  }

  IconData get icon {
    switch (this) {
      case DocumentReqStatus.uploaded:
        return Icons.check_circle_rounded;
      case DocumentReqStatus.underReview:
        return Icons.access_time_rounded;
      case DocumentReqStatus.notUploaded:
        return Icons.file_upload_outlined;
      case DocumentReqStatus.rejected:
        return Icons.cancel_outlined;
    }
  }
}

class DocumentRequirement {
  final String id;
  final String title;
  final String category;
  final String docType;
  final IconData icon;
  final bool isMandatory;
  final DocumentReqStatus status;
  final String? validTillText; // null when not applicable
  final String? fileName;
  final String? fileUrl;
  final String? fileSize;
  final String? fileType;
  final String? uploadedAt;
  final String? rejectionReason;

  DocumentRequirement({
    required this.id,
    required this.title,
    this.category = 'Identity & KYC',
    this.docType = 'other',
    required this.icon,
    required this.isMandatory,
    required this.status,
    this.validTillText,
    this.fileName,
    this.fileUrl,
    this.fileSize,
    this.fileType,
    this.uploadedAt,
    this.rejectionReason,
  });
}
