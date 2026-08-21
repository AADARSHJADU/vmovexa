import 'package:flutter/material.dart';

/// A single label : value row shown in "Profile Details" (tappable to edit that field).
class ProfileDetailRow {
  final String id;
  final IconData icon;
  final String label;
  final String value;

  ProfileDetailRow({
    required this.id,
    required this.icon,
    required this.label,
    required this.value,
  });
}

/// A single row inside a Settings section (Account / Preferences / App).
class SettingsMenuItem {
  final String id;
  final IconData icon;
  final String title;
  final String subtitle;
  final String? trailingText; // e.g. "English", "Dark", "v1.4.0"
  final bool isDanger; // Logout-style red row
  final String route;

  SettingsMenuItem({
    required this.id,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailingText,
    this.isDanger = false,
    required this.route,
  });
}
