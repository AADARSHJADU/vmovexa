import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/notification_settings_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../widgets/custom_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../auth/login/controllers/login_controller.dart';


class NotificationSettingsView extends GetView<NotificationSettingsController> {
  const NotificationSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: const [
                  CustomBackButton(),
                  Expanded(
                    child: Center(
                      child: Text(
                        'Notification Settings',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 48), // Spacer to balance back button
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Choose what alerts you want to receive and how you want to be notified.',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                    const SizedBox(height: 20),

                    // Main Push switch card
                    _buildPushConfigCard(),
                    const SizedBox(height: 24),

                    // Alert Preferences Section
                    const Text(
                      'Alert Preferences',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildAlertPreferencesCard(),
                    const SizedBox(height: 24),

                    // Notification Channels Section
                    const Text(
                      'Notification Channels',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildChannelsCard(),
                    const SizedBox(height: 36),

                    // Save Button
                    ElevatedButton.icon(
                      onPressed: controller.savePreferences,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.save_rounded, color: Colors.white, size: 18),
                      label: const Text('Save Preferences', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPushConfigCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.notifications_active_outlined, color: Color(0xFF8B5CF6), size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Push Notifications',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  'Receive real-time alerts on your device',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          Obx(
            () => Switch(
              value: controller.pushNotifications.value,
              onChanged: (val) => controller.pushNotifications.value = val,
              activeColor: const Color(0xFF6366F1),
              activeTrackColor: const Color(0xFF6366F1).withOpacity(0.3),
              inactiveThumbColor: AppColors.textMuted,
              inactiveTrackColor: AppColors.cardBorder,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertPreferencesCard() {
    final isAdvertiser = LoginController.currentRole == 'Advertisement';

    if (isAdvertiser) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          children: [
            _buildSwitchRow(
              'Campaign Updates',
              'Approval status, campaign publication and live state alerts',
              controller.vehicleAlerts,
              Icons.campaign_outlined,
              const Color(0xFF3B82F6),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'Payment Notifications',
              'Budget warnings, invoice receipts, and transaction status alerts',
              controller.tripUpdates,
              Icons.account_balance_wallet_outlined,
              const Color(0xFF8B5CF6),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'System Updates',
              'New feature announcements, reports readiness alerts, and performance metrics updates',
              controller.maintenanceReminders,
              Icons.notifications_none_rounded,
              const Color(0xFF10B981),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'Security Alerts',
              'Unauthorized access, password changes, and login attempts',
              controller.securityAlerts,
              Icons.verified_user_outlined,
              Colors.redAccent,
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildSwitchRow(
            'Vehicle Alerts',
            'Ignition, geofence, overspeed and other vehicle events',
            controller.vehicleAlerts,
            Icons.directions_bus_rounded,
            const Color(0xFF3B82F6),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Trip Updates',
            'Trip start, stop, delays and route changes',
            controller.tripUpdates,
            Icons.location_on_outlined,
            const Color(0xFF8B5CF6),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Maintenance Reminders',
            'Service due, overdue and maintenance updates',
            controller.maintenanceReminders,
            Icons.build_outlined,
            Colors.orangeAccent,
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'System Notifications',
            'App updates, new features and system messages',
            controller.systemNotifications,
            Icons.notifications_none_rounded,
            const Color(0xFF10B981),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Security Alerts',
            'Unauthorized access and suspicious activity',
            controller.securityAlerts,
            Icons.verified_user_outlined,
            Colors.redAccent,
          ),
        ],
      ),
    );
  }


  Widget _buildSwitchRow(
    String title,
    String subtitle,
    RxBool state,
    IconData icon,
    Color iconColor,
  ) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 18),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
              ),
            ],
          ),
        ),
        Obx(
          () => Switch(
            value: state.value,
            onChanged: (val) => state.value = val,
            activeColor: const Color(0xFF6366F1),
            activeTrackColor: const Color(0xFF6366F1).withOpacity(0.3),
            inactiveThumbColor: AppColors.textMuted,
            inactiveTrackColor: AppColors.cardBorder,
          ),
        ),
      ],
    );
  }

  Widget _buildChannelsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildChannelItem('Push Notifications', 'Instant alerts on this device', controller.pushChannelStatus.value, Icons.phone_android_rounded, const Color(0xFF6366F1)),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildChannelItem('Email Notifications', 'Receive important alerts via email', controller.emailChannelStatus.value, Icons.mail_outline_rounded, const Color(0xFF10B981)),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildChannelItem('SMS Notifications', 'Critical alerts via SMS', controller.smsChannelStatus.value, Icons.chat_bubble_outline_rounded, const Color(0xFF8B5CF6)),
        ],
      ),
    );
  }

  Widget _buildChannelItem(String label, String subtitle, String status, IconData icon, Color iconColor) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 18),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
            ],
          ),
        ),
        Row(
          children: [
            Text(
              status,
              style: TextStyle(
                color: status == 'Enabled' ? const Color(0xFF10B981) : AppColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 16),
          ],
        ),
      ],
    );
  }
}
