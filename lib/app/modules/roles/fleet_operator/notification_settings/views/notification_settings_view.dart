import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
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
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: controller.savePreferences,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: SvgPicture.asset("assets/icons/fleet_operator_icons/saveChangesA.svg",color: CupertinoColors.white,),
                        label: const Text('Save Preferences', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      ),
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
          SvgPicture.asset("assets/icons/fleet_operator_icons/notificationSettingA.svg",width: 25,height: 25,),
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
                () => Transform.scale(
              scale: 0.75,
              child: Switch(
                value: controller.pushNotifications.value,
                onChanged: (val) =>
                controller.pushNotifications.value = val,
                activeColor: CupertinoColors.white,
                activeTrackColor: const Color(0xFF0051f4),
                inactiveThumbColor: AppColors.textMuted,
                inactiveTrackColor: AppColors.cardBorder,
              ),
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
              "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
              const Color(0xFF3B82F6),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'Payment Notifications',
              'Budget warnings, invoice receipts, and transaction status alerts',
              controller.tripUpdates,
              "assets/icons/fleet_operator_icons/locationA.svg",
              const Color(0xFF8B5CF6),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'System Updates',
              'New feature announcements, reports readiness alerts, and performance metrics updates',
              controller.maintenanceReminders,
              "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
              const Color(0xFF10B981),
            ),
            const Divider(color: AppColors.cardBorder, height: 24),
            _buildSwitchRow(
              'Security Alerts',
              'Unauthorized access, password changes, and login attempts',
              controller.securityAlerts,
              "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
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
            "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
            const Color(0xFF3B82F6),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Trip Updates',
            'Trip start, stop, delays and route changes',
            controller.tripUpdates,
            "assets/icons/fleet_operator_icons/locationA.svg",
            const Color(0xFF8B5CF6),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Maintenance Reminders',
            'Service due, overdue and maintenance updates',
            controller.maintenanceReminders,
            "assets/icons/fleet_operator_icons/maintainceReminderA.svg",
            Colors.orangeAccent,
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'System Notifications',
            'App updates, new features and system messages',
            controller.systemNotifications,
            "assets/icons/fleet_operator_icons/notificationSettingA.svg",
            const Color(0xFF10B981),
          ),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildSwitchRow(
            'Security Alerts',
            'Unauthorized access and suspicious activity',
            controller.securityAlerts,
            "assets/icons/fleet_operator_icons/securityA.svg",
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
    String icon,
    Color iconColor,
  ) {
    return Row(
      children: [
      SvgPicture.asset(icon),
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
              () => Transform.scale(
            scale: 0.75,
            child: Switch(
              value: state.value,
              onChanged: (val) => state.value = val,
              activeColor: Colors.white,
              activeTrackColor: const Color(0xFF0051f4),
              inactiveThumbColor: AppColors.textMuted,
              inactiveTrackColor: AppColors.cardBorder,
            ),
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
          _buildChannelItem('Push Notifications', 'Instant alerts on this device',
              controller.pushChannelStatus.value,   "assets/icons/fleet_operator_icons/pushNotificationA.svg", const Color(0xFF6366F1)),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildChannelItem('Email Notifications', 'Receive important alerts via email',
              controller.emailChannelStatus.value, "assets/icons/fleet_operator_icons/emailA.svg", const Color(0xFF10B981)),
          const Divider(color: AppColors.cardBorder, height: 24),
          _buildChannelItem('SMS Notifications', 'Critical alerts via SMS',
              controller.smsChannelStatus.value, "assets/icons/fleet_operator_icons/smsNotificationA.svg", const Color(0xFF8B5CF6)),
        ],
      ),
    );
  }

  Widget _buildChannelItem(String label, String subtitle, String status, String icon, Color iconColor) {
    return Row(
      children: [
       SvgPicture.asset(icon),
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
