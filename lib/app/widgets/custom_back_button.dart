import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../theme/app_colors.dart';

class CustomBackButton extends StatelessWidget {
  final VoidCallback? onTap;

  const CustomBackButton({
    super.key,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? () => Get.back(),
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: AppColors.socialBtnBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: AppColors.socialBtnBorder,
            width: 1.2,
          ),
        ),
        child: const Icon(
          Icons.chevron_left_rounded,
          color: AppColors.textPrimary,
          size: 26,
        ),
      ),
    );
  }
}
