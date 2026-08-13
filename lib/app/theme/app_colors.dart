import 'package:flutter/material.dart';

class AppColors {
  // Backgrounds
  static const Color background = Color(0xFF060709);
  static const Color cardBg = Color(0xFF10121A);
  static const Color cardBorder = Color(0xFF1C1F2E);
  static const Color inputBg = Color(0xFF0D0E14);
  static const Color inputBorder = Color(0xFF1A1C28);
  static const Color inputBorderFocused = Color(0xFF4F46E5);

  // Brand Gradients & Accents
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [
      Color(0xFF5A2EE5),
      Color(0xFF1E58F0),
    ],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const Color primaryButtonBlue = Color(0xFF2563EB);
  static const Color accentPurple = Color(0xFF6D28D9);
  static const Color accentCyan = Color(0xFF06B6D4);
  static const Color accentGreen = Color(0xFF10B981);

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color textLink = Color(0xFF3B82F6);

  // UI Elements
  static const Color indicatorInactive = Color(0xFF374151);
  static const Color indicatorActive = Color(0xFF6366F1);
  static const Color socialBtnBg = Color(0xFF0D0F18);
  static const Color socialBtnBorder = Color(0xFF1C2030);
}
