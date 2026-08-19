import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    final baseTheme = ThemeData.dark();
    return baseTheme.copyWith(
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primaryButtonBlue,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryButtonBlue,
        surface: AppColors.cardBg,
      ),
      // Set Raleway globally so all Text widgets across the app automatically use Raleway
      textTheme: GoogleFonts.ralewayTextTheme(baseTheme.textTheme).apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),
    );
  }

  static const Color gradientBlue = Color(0xff1C68FD);
  static const Color gradientPink = Color(0xffDA29F4);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [
      gradientBlue,
      gradientPink,
    ],
  );

}
