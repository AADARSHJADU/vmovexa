import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class CustomCheckbox extends StatelessWidget {
  final bool value;
  final ValueChanged<bool?> onChanged;
  final String text;
  final String boldText;

  const CustomCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    required this.text,
    required this.boldText,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      behavior: HitTestBehavior.opaque,
      child: Row(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: value ? Colors.white : AppColors.inputBg,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: value ? Colors.white : AppColors.inputBorder,
                width: 1.5,
              ),
            ),
            child: value
                ? const Icon(
                    Icons.check,
                    size: 14,
                    color: Colors.black,
                  )
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                ),
                children: [
                  TextSpan(text: text),
                  TextSpan(
                    text: boldText,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
