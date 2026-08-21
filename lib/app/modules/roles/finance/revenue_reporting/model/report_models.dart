import 'package:flutter/material.dart';

enum ReportFormat { xlsx, pdf }

extension ReportFormatX on ReportFormat {
  String get label {
    switch (this) {
      case ReportFormat.xlsx:
        return 'XLS';
      case ReportFormat.pdf:
        return 'PDF';
    }
  }

  String get fullLabel {
    switch (this) {
      case ReportFormat.xlsx:
        return 'Excel (XLSX)';
      case ReportFormat.pdf:
        return 'PDF';
    }
  }

  Color get color {
    switch (this) {
      case ReportFormat.xlsx:
        return const Color(0xFF2ECC71);
      case ReportFormat.pdf:
        return const Color(0xFFFF4D4D);
    }
  }

  IconData get icon {
    switch (this) {
      case ReportFormat.xlsx:
        return Icons.grid_on_outlined;
      case ReportFormat.pdf:
        return Icons.picture_as_pdf_outlined;
    }
  }
}

class RecentReport {
  final String id;
  final String title;
  final String dateText;
  final ReportFormat format;
  final String fileSizeText;

  RecentReport({
    required this.id,
    required this.title,
    required this.dateText,
    required this.format,
    required this.fileSizeText,
  });
}
