import 'package:flutter/material.dart';

enum DiagnosticCheckState {
  pending,
  running,
  passed,
  warning,
  failed,
}

class DiagnosticCheck {
  final String id;
  final String title;
  final String subtitle;
  final IconData? icon;
  final String? svgPath;

  DiagnosticCheckState state;
  String statusLabel;

  DiagnosticCheck({
    required this.id,
    required this.title,
    required this.subtitle,
    this.icon,
    this.svgPath,
    this.state = DiagnosticCheckState.pending,
    this.statusLabel = '',
  });

  /// Check whether SVG is available
  bool get hasSvg => svgPath != null && svgPath!.isNotEmpty;

  /// Check whether Icon is available
  bool get hasIcon => icon != null;

  Color get statusColor {
    switch (state) {
      case DiagnosticCheckState.passed:
        return const Color(0xFF2ECC71);

      case DiagnosticCheckState.warning:
        return const Color(0xFFFFA726);

      case DiagnosticCheckState.failed:
        return const Color(0xFFFF4D4D);

      case DiagnosticCheckState.running:
        return const Color(0xFFB042FF);

      case DiagnosticCheckState.pending:
        return Colors.white38;
    }
  }

  IconData get statusIcon {
    switch (state) {
      case DiagnosticCheckState.passed:
        return Icons.check_circle;

      case DiagnosticCheckState.warning:
        return Icons.warning_amber_rounded;

      case DiagnosticCheckState.failed:
        return Icons.cancel;

      case DiagnosticCheckState.running:
        return Icons.autorenew;

      case DiagnosticCheckState.pending:
        return Icons.radio_button_unchecked;
    }
  }
}