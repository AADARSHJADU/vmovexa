import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/notification_preferences_controller.dart';

class NotificationPreferencesView extends GetView<NotificationPreferencesController> {
  const NotificationPreferencesView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kBorder = Color(0xFF262638);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kIndigo = Color(0xFF6366F1);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<NotificationPreferencesController>()) {
      Get.put(NotificationPreferencesController());
    }

    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(
          () => controller.isLoading.value
              ? const Center(child: CircularProgressIndicator(color: kPurple))
              : RefreshIndicator(
                  color: kPurple,
                  backgroundColor: kCardBg,
                  onRefresh: controller.onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 16),
                      _buildChannelsCard(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  // 1. Header (Breadcrumb, Title, Subtitle, Done Button)
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: controller.onBackPressed,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kBorder),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'Finance Portal  /  ',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                      ),
                      Text(
                        'Notification Settings',
                        style: TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Finance Notification Settings',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: controller.onBackPressed,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'Done',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          'Manage your delivery preferences across 5 notification channels',
          style: TextStyle(color: Colors.white54, fontSize: 11.5),
        ),
      ],
    );
  }

  // 2. 5 Master Delivery Channels Card (Admin Panel Replica)
  Widget _buildChannelsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'NOTIFICATION DELIVERY CHANNELS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Toggle channels on or off according to your\npreference',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  ),
                ],
              ),
              // Container(
              //   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              //   decoration: BoxDecoration(
              //     gradient: AppTheme.primaryGradient,
              //     borderRadius: BorderRadius.circular(6),
              //   ),
              //   child: const Text(
              //     '5 Channels',
              //     style: TextStyle(
              //       color: Colors.white,
              //       fontSize: 10,
              //       fontWeight: FontWeight.w700,
              //     ),
              //   ),
              // ),
            ],
          ),
          const SizedBox(height: 16),

          // 1. Web / In-App Notifications
          Obx(
            () => _buildChannelTile(
              id: 'channel_in_app',
              title: 'Web Notifications',
              desc: 'Real-time browser popups and in-app dashboard notifications',
              icon: Icons.language,
              iconColor: const Color(0xFF60A5FA),
              enabled: controller.channelInApp.value,
              onToggle: (val) => controller.toggleChannel('channel_in_app', controller.channelInApp.value),
            ),
          ),
          const SizedBox(height: 10),

          // 2. Push Notifications
          Obx(
            () => _buildChannelTile(
              id: 'channel_push',
              title: 'Push Notifications',
              desc: 'Mobile device push notifications and urgent alerts',
              icon: Icons.phone_android,
              iconColor: const Color(0xFF818CF8),
              enabled: controller.channelPush.value,
              onToggle: (val) => controller.toggleChannel('channel_push', controller.channelPush.value),
            ),
          ),
          const SizedBox(height: 10),

          // 3. SMS Notifications
          Obx(
            () => _buildChannelTile(
              id: 'channel_sms',
              title: 'SMS Notifications',
              desc: 'Direct SMS text alerts on your registered mobile number',
              icon: Icons.chat_bubble_outline,
              iconColor: const Color(0xFFFBBF24),
              enabled: controller.channelSms.value,
              onToggle: (val) => controller.toggleChannel('channel_sms', controller.channelSms.value),
            ),
          ),
          const SizedBox(height: 10),

          // 4. Mail Notifications
          Obx(
            () => _buildChannelTile(
              id: 'channel_email',
              title: 'Mail Notifications',
              desc: 'Email summaries, invoices, and critical system notices',
              icon: Icons.mail_outline,
              iconColor: const Color(0xFFFB7185),
              enabled: controller.channelEmail.value,
              onToggle: (val) => controller.toggleChannel('channel_email', controller.channelEmail.value),
            ),
          ),
          const SizedBox(height: 10),

          // 5. WhatsApp Notifications
          Obx(
            () => _buildChannelTile(
              id: 'channel_whatsapp',
              title: 'WhatsApp Notifications',
              desc: 'Instant WhatsApp message alerts and dispatch updates',
              icon: Icons.verified_user_outlined,
              iconColor: const Color(0xFF34D399),
              enabled: controller.channelWhatsapp.value,
              onToggle: (val) => controller.toggleChannel('channel_whatsapp', controller.channelWhatsapp.value),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelTile({
    required String id,
    required String title,
    required String desc,
    required IconData icon,
    required Color iconColor,
    required bool enabled,
    required ValueChanged<bool> onToggle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F0F1A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  desc,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 10.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Switch(
            value: enabled,
            onChanged: onToggle,
            activeTrackColor: const Color(0xFF10B981),
            activeThumbColor: Colors.white,
            inactiveTrackColor: const Color(0xFF262638),
            inactiveThumbColor: const Color(0xFF94A3B8),
          ),
        ],
      ),
    );
  }
}
