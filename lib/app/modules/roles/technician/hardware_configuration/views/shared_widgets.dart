import 'package:flutter/material.dart';

const Color kBg = Color(0xFF0B0B14);
const Color kCardBg = Color(0xFF15151F);
const Color kFieldBg = Color(0xFF1B1B27);
const Color kPurple = Color(0xFF6366F1);
const Color kIndigo = Color(0xFF4F46E5);
const Color kBlue = Color(0xFF38BDF8);
const Color kBorder = Color(0x14FFFFFF);
const Color kGreen = Color(0xFF10B981);
const Color kRed = Color(0xFFEF4444);

/// Section card wrapper with an icon + title header + optional trailing badge.
class SectionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? trailingBadge;
  final Widget child;

  const SectionCard({
    super.key,
    required this.icon,
    required this.title,
    this.trailingBadge,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: kPurple, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              ?trailingBadge,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

/// Icon + label + slider + trailing value (Screen Brightness / Volume Level).
class SettingSliderRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final double value;
  final double min;
  final double max;
  final bool enabled;
  final ValueChanged<double> onChanged;
  final String valueLabel;

  const SettingSliderRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    this.min = 0.0,
    this.max = 100.0,
    this.enabled = true,
    required this.onChanged,
    required this.valueLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: enabled ? kPurple : Colors.white24, size: 16),
        const SizedBox(width: 8),
        SizedBox(
          width: 96,
          child: Text(
            label,
            style: TextStyle(
              color: enabled ? Colors.white70 : Colors.white24,
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: enabled ? kPurple : Colors.white24,
              inactiveTrackColor: Colors.white12,
              thumbColor: enabled ? kPurple : Colors.white24,
              overlayColor: kPurple.withValues(alpha: 0.2),
              trackHeight: 3,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
            ),
            child: Slider(
              value: value.clamp(min, max),
              min: min,
              max: max,
              onChanged: enabled ? onChanged : null,
            ),
          ),
        ),
        SizedBox(
          width: 44,
          child: Text(
            valueLabel,
            textAlign: TextAlign.right,
            style: TextStyle(
              color: enabled ? Colors.white : Colors.white38,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

/// Icon + label + trailing compact dropdown, all in one row.
class SettingDropdownRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final double dropdownWidth;

  const SettingDropdownRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
    this.dropdownWidth = 150,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
          ),
        ),
        SizedBox(
          width: dropdownWidth,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: items.contains(value) ? value : (items.isNotEmpty ? items.first : null),
                isExpanded: true,
                dropdownColor: kFieldBg,
                icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 18),
                style: const TextStyle(color: Colors.white, fontSize: 12.5),
                items: items
                    .map((item) => DropdownMenuItem(value: item, child: Text(item, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Icon + label + subtitle + trailing toggle switch, all in one row.
class SettingToggleRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const SettingToggleRow({
    super.key,
    required this.icon,
    required this.label,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle!,
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                ),
              ],
            ],
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: Colors.white,
          activeTrackColor: kPurple,
          inactiveThumbColor: Colors.white54,
          inactiveTrackColor: Colors.white12,
        ),
      ],
    );
  }
}

/// Bottom info banner: "Changes will be applied to the device over the air after saving."
class InfoNoteBanner extends StatelessWidget {
  final String text;
  const InfoNoteBanner({super.key, this.text = 'Changes will be applied to the device after saving.'});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kFieldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Colors.white38, size: 15),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white54, fontSize: 11))),
        ],
      ),
    );
  }
}
