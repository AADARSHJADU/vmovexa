import 'package:flutter/material.dart';
import 'package:get/get.dart';

class NotificationTypePref {
  final String id;
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final RxBool emailEnabled;
  final RxBool inAppEnabled;

  NotificationTypePref({
    required this.id,
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required bool emailEnabled,
    required bool inAppEnabled,
  })  : emailEnabled = emailEnabled.obs,
        inAppEnabled = inAppEnabled.obs;
}
