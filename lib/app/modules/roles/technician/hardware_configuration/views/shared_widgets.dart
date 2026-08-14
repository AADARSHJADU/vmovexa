import 'package:flutter/material.dart';

const Color kBg = Color(0xFF0B0B14);
const Color kCardBg = Color(0xFF15151F);
const Color kFieldBg = Color(0xFF1B1B27);
const Color kPurple = Color(0xFFB042FF);
const Color kIndigo = Color(0xFF6A5CFF);
const Color kBlue = Color(0xFF3F7BF5);
const Color kBorder = Color(0x14FFFFFF);
const Color kGreen = Color(0xFF2ECC71);
const Color kRed = Color(0xFFFF4D4D);

/// Section card wrapper with an icon + title header (e.g. "Display Settings").
class SectionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const SectionCard({super.key, required this.icon, required this.title, required this.child});

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
            children: [
              Icon(icon, color: kPurple, size: 16),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
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
  final ValueChanged<double> onChanged;
  final String valueLabel;

  const SettingSliderRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.valueLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: kPurple, size: 16),
        const SizedBox(width: 8),
        SizedBox(
          width: 96,
          child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w600)),
        ),
        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: kPurple,
              inactiveTrackColor: Colors.white12,
              thumbColor: kPurple,
              overlayColor: kPurple.withOpacity(0.2),
              trackHeight: 3,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
            ),
            child: Slider(value: value, min: 0, max: 100, onChanged: onChanged),
          ),
        ),
        SizedBox(
          width: 36,
          child: Text(
            valueLabel,
            textAlign: TextAlign.right,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
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
          child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
        ),
        SizedBox(
          width: dropdownWidth,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value.isEmpty ? null : value,
                isExpanded: true,
                dropdownColor: kFieldBg,
                icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white38, size: 18),
                style: const TextStyle(color: Colors.white, fontSize: 12.5),
                items: items.map((item) => DropdownMenuItem(value: item, child: Text(item, overflow: TextOverflow.ellipsis))).toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Icon + label + trailing toggle switch, all in one row.
class SettingToggleRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const SettingToggleRow({
    super.key,
    required this.icon,
    required this.label,
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
          child: Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Colors.white,
          activeTrackColor: kPurple,
          inactiveThumbColor: Colors.white54,
          inactiveTrackColor: Colors.white12,
        ),
      ],
    );
  }
}

/// Bottom info banner: "Changes will be applied to the device after saving."
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
        border: Border.all(color: Colors.white.withOpacity(0.06)),
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

/// Plain label : value row used in read-only "Device Information" lists.
class InfoKeyValueRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailingBadge;

  const InfoKeyValueRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    this.trailingBadge,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: kPurple, size: 15),
          const SizedBox(width: 8),
          Expanded(
            child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          ),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
          if (trailingBadge != null) ...[
            const SizedBox(width: 6),
            trailingBadge!,
          ],
        ],
      ),
    );
  }
}

/// Small green "Up to date" style status badge.
class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const StatusBadge({super.key, required this.label, this.color = kGreen});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
    );
  }
}

/// Navigable row (chevron on the right) used for Date & Time / Time Zone.
class NavRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  const NavRow({super.key, required this.icon, required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(icon, color: kPurple, size: 15),
            const SizedBox(width: 8),
            Expanded(child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12))),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }
}

/// Action row for "Device Management" (Restart / Clear Cache / Factory Reset).
class ActionRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String description;
  final String buttonLabel;
  final Color buttonColor;
  final bool isDanger;
  final VoidCallback onPressed;
  final bool isLoading;

  const ActionRow({
    super.key,
    required this.icon,
    required this.label,
    required this.description,
    required this.buttonLabel,
    required this.buttonColor,
    required this.onPressed,
    this.isDanger = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: isDanger ? kRed : kPurple, size: 15),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                      color: isDanger ? kRed : Colors.white,
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                    )),
                Text(description, style: const TextStyle(color: Colors.white38, fontSize: 10)),
              ],
            ),
          ),
          GestureDetector(
            onTap: isLoading ? null : onPressed,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: buttonColor.withOpacity(0.6)),
              ),
              child: isLoading
                  ? SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: buttonColor),
                    )
                  : Text(buttonLabel, style: TextStyle(color: buttonColor, fontSize: 11.5, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

/// Divider matching the dark theme, used between rows in list-style cards.
class ThinDivider extends StatelessWidget {
  const ThinDivider({super.key});
  @override
  Widget build(BuildContext context) => Divider(color: Colors.white.withOpacity(0.06), height: 1);
}
