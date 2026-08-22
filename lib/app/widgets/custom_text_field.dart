import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../theme/app_colors.dart';

class CustomTextField extends StatelessWidget {
  final String hintText;

  // Prefix
  final IconData? prefixIcon;
  final String? prefixAsset;
  final String? prefixSvg;

  // Suffix
  final IconData? suffixIcon;
  final String? suffixAsset;
  final String? suffixSvg;
  final VoidCallback? onSuffixTap;

  final TextEditingController? controller;
  final bool isPassword;
  final bool isObscured;
  final VoidCallback? onToggleObscure;
  final TextInputType keyboardType;
  final bool isDropdown;
  final String? dropdownValue;
  final List<String>? dropdownItems;
  final ValueChanged<String?>? onDropdownChanged;
  final int maxLines;
  final double? height;
  final bool useGradientIcon;

  final double? prefixWidth;
  final double? prefixHeight;

  const CustomTextField({
    super.key,
    required this.hintText,

    // Prefix - optional
    this.prefixIcon,
    this.prefixAsset,
    this.prefixSvg,

    // Suffix - optional
    this.suffixIcon,
    this.suffixAsset,
    this.suffixSvg,
    this.onSuffixTap,

    this.controller,
    this.isPassword = false,
    this.isObscured = false,
    this.onToggleObscure,
    this.keyboardType = TextInputType.text,
    this.isDropdown = false,
    this.dropdownValue,
    this.dropdownItems,
    this.onDropdownChanged,
    this.maxLines = 1,
    this.height,
    this.useGradientIcon = false,

    this.prefixWidth,
    this.prefixHeight,
  });

  Widget? _buildPrefixIcon() {
    if (prefixSvg != null) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: SvgPicture.asset(
          prefixSvg!,
          width: prefixWidth ?? 20,
          height: prefixHeight ?? 20,
        ),
      );
    }

    if (prefixAsset != null) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Image.asset(
          prefixAsset!,
          width: prefixWidth ?? 20,
          height: prefixHeight ?? 20,
        ),
      );
    }

    if (prefixIcon != null) {
      final iconWidget = Icon(
        prefixIcon,
        color: useGradientIcon ? Colors.white : AppColors.textSecondary,
        size: prefixWidth ?? 20,
      );

      final resultWidget = useGradientIcon
          ? ShaderMask(
        blendMode: BlendMode.srcIn,
        shaderCallback: (bounds) => const LinearGradient(
          colors: [
            Color(0xFF3B82F6),
            Color(0xFF8B5CF6),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ).createShader(bounds),
        child: iconWidget,
      )
          : iconWidget;

      return Padding(
        padding: const EdgeInsets.all(16),
        child: resultWidget,
      );
    }

    return null;
  }

  Widget? _buildSuffixIcon() {
    // Password eye icon gets priority
    if (isPassword) {
      return IconButton(
        icon: Icon(
          isObscured
              ? Icons.visibility_off_outlined
              : Icons.visibility_outlined,
          color: AppColors.textSecondary,
          size: 20,
        ),
        onPressed: onToggleObscure,
      );
    }

    if (suffixSvg != null) {
      return GestureDetector(
        onTap: onSuffixTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: SvgPicture.asset(
            suffixSvg!,
            width: 20,
            height: 20,
          ),
        ),
      );
    }

    if (suffixAsset != null) {
      return GestureDetector(
        onTap: onSuffixTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Image.asset(
            suffixAsset!,
            width: 20,
            height: 20,
          ),
        ),
      );
    }

    if (suffixIcon != null) {
      return IconButton(
        icon: Icon(
          suffixIcon,
          color: AppColors.textSecondary,
          size: 20,
        ),
        onPressed: onSuffixTap,
      );
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    if (isDropdown) {
      final prefixWidget = _buildPrefixIcon();
      return Container(
        height: height ?? 56,
        padding: EdgeInsets.only(
          left: prefixWidget != null ? 0 : 16,
          right: 16,
        ),
        decoration: BoxDecoration(
          color: AppColors.inputBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.inputBorder,
            width: 1.2,
          ),
        ),
        child: Row(
          children: [
            ?prefixWidget,
            Expanded(
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: dropdownValue,
                  hint: Text(
                    hintText,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  dropdownColor: AppColors.cardBg,
                  icon: suffixSvg != null
                      ? SvgPicture.asset(
                          suffixSvg!,
                          width: 20,
                          height: 20,
                        )
                      : suffixAsset != null
                          ? Image.asset(
                              suffixAsset!,
                              width: 20,
                              height: 20,
                            )
                          : suffixIcon != null
                              ? Icon(
                                  suffixIcon,
                                  color: AppColors.textSecondary,
                                  size: 20,
                                )
                              : const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  color: AppColors.textSecondary,
                                ),
                  isExpanded: true,
                  items: dropdownItems?.map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(
                        value,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 14,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: onDropdownChanged,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      height: maxLines > 1 ? null : (height ?? 56),
      decoration: BoxDecoration(
        color: AppColors.inputBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.inputBorder,
          width: 1.2,
        ),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword ? isObscured : false,
        keyboardType: keyboardType,
        maxLines: maxLines,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 14,
        ),
        decoration: InputDecoration(
          border: InputBorder.none,

          contentPadding: maxLines > 1
              ? const EdgeInsets.all(16)
              : EdgeInsets.symmetric(
            horizontal: 16,
            vertical: height != null
                ? (height! - 20) / 2
                : 18,
          ),

          prefixIcon: _buildPrefixIcon(),

          hintText: hintText,
          hintStyle: const TextStyle(
            color: AppColors.textMuted,
            fontSize: 14,
          ),

          suffixIcon: _buildSuffixIcon(),
        ),
      ),
    );
  }
}