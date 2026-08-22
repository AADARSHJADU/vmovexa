import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controller/notification_preferences_controller.dart';
import '../model/notification_pref_model.dart';

class NotificationPreferencesView extends GetView<NotificationPreferencesController> {
  const NotificationPreferencesView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6A5CFF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kGreen = Color(0xFF2ECC71);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value && controller.notificationTypes.isEmpty
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      const SizedBox(height: 8),
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildIdentityCard(),
                      const SizedBox(height: 20),
                      const Text('Notification Channels', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 10),
                      _buildChannelsCard(),
                      const SizedBox(height: 20),
                      _buildNotificationTypesHeader(),
                      const SizedBox(height: 10),
                      _buildNotificationTypesCard(),
                      const SizedBox(height: 14),
                      _buildQuietHoursCard(),
                      const SizedBox(height: 10),
                      _buildFooterNote(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(onTap: controller.onBackPressed, child: const Icon(Icons.arrow_back, color: kPurple)),
        const SizedBox(width: 10),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Notification Preferences', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700)),
              SizedBox(height: 2),
              Text('Manage email and in-app notification settings', style: TextStyle(color: Colors.white54, fontSize: 11.5)),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Identity card ----------------
  Widget _buildIdentityCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: kBorder)),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: const BoxDecoration(gradient: LinearGradient(colors: [kPurple, kIndigo]), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Obx(() => Text(controller.initials.value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(
              () => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(controller.fullName.value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(controller.roleLabel.value, style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(controller.email.value, style: const TextStyle(color: Colors.white54, fontSize: 10.5)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Notification Channels ----------------
  Widget _buildChannelsCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Column(
        children: [
          Obx(
            () => _ChannelToggleRow(
              icon: Icons.mail_outline,
              title: 'Email Notifications',
              subtitle: 'Receive notifications on your email',
              value: controller.emailNotifications.value,
              onChanged: controller.toggleEmailNotifications,
            ),
          ),
          Divider(color: Colors.white.withOpacity(0.06), height: 1, indent: 14, endIndent: 14),
          Obx(
            () => _ChannelToggleRow(
              icon: Icons.notifications_none_rounded,
              title: 'In-app Notifications',
              subtitle: 'Receive notifications within the application',
              value: controller.inAppNotifications.value,
              onChanged: controller.toggleInAppNotifications,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationTypesHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Notification Types', style: TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w700)),
        GestureDetector(
          onTap: controller.onMarkAllAsRead,
          child: const Text('Mark all as read', style: TextStyle(color: kPurple, fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  // ---------------- Notification Types table ----------------
  Widget _buildNotificationTypesCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: const [
                Expanded(child: SizedBox()),
                SizedBox(width: 52, child: Text('Email', textAlign: TextAlign.center, style: TextStyle(color: Colors.white38, fontSize: 10))),
                SizedBox(width: 52, child: Text('In-app', textAlign: TextAlign.center, style: TextStyle(color: Colors.white38, fontSize: 10))),
              ],
            ),
          ),
          Obx(
            () => Column(
              children: List.generate(controller.notificationTypes.length, (index) {
                final type = controller.notificationTypes[index];
                final isLast = index == controller.notificationTypes.length - 1;
                return Column(
                  children: [
                    _NotificationTypeRow(type: type),
                    if (!isLast) Divider(color: Colors.white.withOpacity(0.06), height: 1),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Quiet Hours ----------------
  Widget _buildQuietHoursCard() {
    return GestureDetector(
      onTap: controller.onQuietHoursTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: kCardBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: kBorder)),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.access_time, color: kPurple, size: 18),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Quiet Hours', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                  SizedBox(height: 2),
                  Text('Mute notifications during specific hours', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
                ],
              ),
            ),
            Obx(() => Text(controller.quietHoursText.value, style: const TextStyle(color: kPurple, fontSize: 11, fontWeight: FontWeight.w600))),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right, color: Colors.white24, size: 16),
          ],
        ),
      ),
    );
  }

  // ---------------- Footer note ----------------
  Widget _buildFooterNote() {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.info_outline, color: kPurple, size: 12),
        SizedBox(width: 5),
        Text('Changes are saved automatically', style: TextStyle(color: Colors.white38, fontSize: 10.5)),
      ],
    );
  }
}

// =====================================================================
// Channel toggle row (Email / In-app Notifications)
// =====================================================================
class _ChannelToggleRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ChannelToggleRow({required this.icon, required this.title, required this.subtitle, required this.value, required this.onChanged});

  static const Color kPurple = NotificationPreferencesView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: kPurple.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: kPurple, size: 17),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10.5)),
              ],
            ),
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
      ),
    );
  }
}

// =====================================================================
// Notification type row (icon+title+subtitle, Email toggle, In-app toggle)
// =====================================================================
class _NotificationTypeRow extends StatelessWidget {
  final NotificationTypePref type;

  const _NotificationTypeRow({required this.type});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: type.color.withOpacity(0.15), borderRadius: BorderRadius.circular(9)),
            child: Icon(type.icon, color: type.color, size: 16),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(type.title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(type.subtitle, style: const TextStyle(color: Colors.white38, fontSize: 9.5)),
              ],
            ),
          ),
          SizedBox(
            width: 52,
            child: Obx(
              () => Transform.scale(
                scale: 0.85,
                child: Switch(
                  value: type.emailEnabled.value,
                  onChanged: (v) => type.emailEnabled.value = v,
                  activeColor: Colors.white,
                  activeTrackColor: const Color(0xFFB042FF),
                  inactiveThumbColor: Colors.white54,
                  inactiveTrackColor: Colors.white12,
                ),
              ),
            ),
          ),
          SizedBox(
            width: 52,
            child: Obx(
              () => Transform.scale(
                scale: 0.85,
                child: Switch(
                  value: type.inAppEnabled.value,
                  onChanged: (v) => type.inAppEnabled.value = v,
                  activeColor: Colors.white,
                  activeTrackColor: const Color(0xFFB042FF),
                  inactiveThumbColor: Colors.white54,
                  inactiveTrackColor: Colors.white12,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
