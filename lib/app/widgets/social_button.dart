import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../theme/app_colors.dart';

class SocialButton extends StatelessWidget {
  final String assetPath;
  final bool isSvg;
  final VoidCallback onTap;

  const SocialButton({
    super.key,
    required this.assetPath,
    this.isSvg = true,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.socialBtnBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.socialBtnBorder,
          width: 1.2,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Center(
            child: isSvg
                ? SvgPicture.asset(
                    assetPath,
                    width: 22,
                    height: 22,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.g_mobiledata, color: Colors.white, size: 28),
                  )
                : Image.asset(
                    assetPath,
                    width: 22,
                    height: 22,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.apps, color: Colors.white, size: 24),
                  ),
          ),
        ),
      ),
    );
  }
}
