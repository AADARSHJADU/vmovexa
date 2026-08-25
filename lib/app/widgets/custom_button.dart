import 'package:flutter/material.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../theme/app_colors.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  final bool isGradient;
  final bool isOutlined;
  final double? width;
  final double height;
  final Widget? prefixIcon;

  const CustomButton({
    super.key,
    required this.text,
    required this.onTap,
    this.isGradient = true,
    this.isOutlined = false,
    this.width,
    this.height = 54,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    if (isOutlined) {
      return SizedBox(
        width: width ?? double.infinity,
        height: height,
        child: OutlinedButton(
          onPressed: onTap,
          style: OutlinedButton.styleFrom(
            side: const BorderSide(
              color: AppColors.cardBorder,
              width: 1.5,
            ),
            backgroundColor: AppColors.inputBg,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (prefixIcon != null) ...[
                prefixIcon!,
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Text(
                  text,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      width: width ?? double.infinity,
      height: height,
      decoration: BoxDecoration(
        gradient: isGradient
            ? AppTheme.primaryGradient
            : null,
        color: isGradient ? null : AppColors.primaryButtonBlue,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF9333EA).withOpacity(0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (prefixIcon != null) ...[
                  prefixIcon!,
                  const SizedBox(width: 8),
                ],
                Text(
                  text,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
