import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_theme.dart';
import '../controllers/notification_settings_controller.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../auth/login/controllers/login_controller.dart';

class NotificationSettingsView extends StatelessWidget {
  const NotificationSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<NotificationSettingsController>()
        ? Get.find<NotificationSettingsController>()
        : Get.put(NotificationSettingsController());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const Expanded(
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
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                    onPressed: controller.loadSettings,
                    tooltip: 'Refresh Settings',
                  ),
                ],
              ),
            ),

            Expanded(
              child: RefreshIndicator(
                onRefresh: controller.loadSettings,
                color: const Color(0xFF6366F1),
                backgroundColor: const Color(0xFF1E293B),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Choose what alerts you want to receive and how you want to be notified. Changes save instantly.',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                      const SizedBox(height: 20),

                      // Main Push switch card
                      _buildPushConfigCard(controller),
                      const SizedBox(height: 24),

                      // 5 Notification Delivery Channels Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Delivery Channels',
                            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0x263B82F6),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0x4D3B82F6)),
                            ),
                            child: const Text(
                              '5 Channels',
                              style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildChannelsCard(controller),
                      const SizedBox(height: 24),

                      // Alert Preferences Section
                      const Text(
                        'Alert Preferences',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      _buildAlertPreferencesCard(controller),
                      const SizedBox(height: 36),

                      // Save Button (manual override)
                      Obx(
                        () => Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: ElevatedButton(
                            onPressed: controller.isSaving.value ? null : controller.savePreferences,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              minimumSize: const Size(double.infinity, 50),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: controller.isSaving.value
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SvgPicture.asset(
                                        "assets/icons/fleet_operator_icons/saveChangesA.svg",
                                        colorFilter: const ColorFilter.mode(CupertinoColors.white, BlendMode.srcIn),
                                        width: 18,
                                        height: 18,
                                      ),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'Save All Preferences',
                                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPushConfigCard(NotificationSettingsController controller) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Row(
        children: [
          SvgPicture.asset("assets/icons/fleet_operator_icons/notificationSettingA.svg", width: 25, height: 25),
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
                  'Receive instant alerts on your mobile device',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          Obx(
            () => SizedBox(
              width: 40,
              height: 30,
              child: Transform.scale(
                scale: 0.8,
                child: Switch(
                  value: controller.pushNotifications.value,
                  onChanged: (val) => controller.togglePreference('channel_push', controller.pushNotifications, val),
                  activeThumbColor: CupertinoColors.white,
                  activeTrackColor: const Color(0xFF0051F4),
                  inactiveThumbColor: AppColors.textMuted,
                  inactiveTrackColor: AppColors.cardBorder,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelsCard(NotificationSettingsController controller) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        children: [
          _buildChannelToggleRow(
            title: 'In-App Notifications',
            subtitle: 'Dashboard badges and in-app alert banners',
            state: controller.inAppNotifications,
            statusLabel: controller.inAppChannelStatus,
            fieldKey: 'channel_in_app',
            controller: controller,
            icon: "assets/icons/fleet_operator_icons/notificationSettingA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildChannelToggleRow(
            title: 'Push Notifications',
            subtitle: 'Real-time OS notifications sent to your device',
            state: controller.pushNotifications,
            statusLabel: controller.pushChannelStatus,
            fieldKey: 'channel_push',
            controller: controller,
            icon: "assets/icons/fleet_operator_icons/pushNotificationA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildChannelToggleRow(
            title: 'Email Notifications',
            subtitle: 'Critical summaries and dispatch reports via email',
            state: controller.emailNotifications,
            statusLabel: controller.emailChannelStatus,
            fieldKey: 'channel_email',
            controller: controller,
            icon: "assets/icons/fleet_operator_icons/emailA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildChannelToggleRow(
            title: 'SMS Notifications',
            subtitle: 'Direct SMS alerts on your registered phone number',
            state: controller.smsNotifications,
            statusLabel: controller.smsChannelStatus,
            fieldKey: 'channel_sms',
            controller: controller,
            icon: "assets/icons/fleet_operator_icons/smsNotificationA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildChannelToggleRow(
            title: 'WhatsApp Notifications',
            subtitle: 'Instant WhatsApp dispatch and fleet alerts',
            state: controller.whatsappNotifications,
            statusLabel: controller.whatsappChannelStatus,
            fieldKey: 'channel_whatsapp',
            controller: controller,
            icon: "assets/icons/fleet_operator_icons/whatsappA.svg",
          ),
        ],
      ),
    );
  }

  Widget _buildChannelToggleRow({
    required String title,
    required String subtitle,
    required RxBool state,
    required RxString statusLabel,
    required String fieldKey,
    required NotificationSettingsController controller,
    required String icon,
  }) {
    return Row(
      children: [
        SvgPicture.asset(icon, width: 22, height: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 6),
                  Obx(
                    () => Text(
                      '(${statusLabel.value})',
                      style: TextStyle(
                        color: state.value ? const Color(0xFF10B981) : AppColors.textMuted,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5)),
            ],
          ),
        ),
        Obx(
          () => SizedBox(
            width: 40,
            height: 30,
            child: Transform.scale(
              scale: 0.75,
              child: Switch(
                value: state.value,
                onChanged: (val) => controller.togglePreference(fieldKey, state, val),
                activeThumbColor: Colors.white,
                activeTrackColor: const Color(0xFF0051F4),
                inactiveThumbColor: AppColors.textMuted,
                inactiveTrackColor: AppColors.cardBorder,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAlertPreferencesCard(NotificationSettingsController controller) {
    final isAdvertiser = LoginController.currentRole == 'Advertisement';

    if (isAdvertiser) {
      return Container(
        padding: const EdgeInsets.all(12),
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
              'alert_vehicle',
              controller,
              "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
            ),
            const Divider(color: AppColors.cardBorder, height: 20),
            _buildSwitchRow(
              'Payment Notifications',
              'Budget warnings, invoice receipts, and transaction status alerts',
              controller.tripUpdates,
              'alert_trips',
              controller,
              "assets/icons/fleet_operator_icons/locationA.svg",
            ),
            const Divider(color: AppColors.cardBorder, height: 20),
            _buildSwitchRow(
              'System Updates',
              'New feature announcements, reports readiness alerts, and performance metrics updates',
              controller.maintenanceReminders,
              'alert_maintenance',
              controller,
              "assets/icons/fleet_operator_icons/maintainceReminderA.svg",
            ),
            const Divider(color: AppColors.cardBorder, height: 20),
            _buildSwitchRow(
              'Security Alerts',
              'Unauthorized access, password changes, and login attempts',
              controller.securityAlerts,
              'alert_security',
              controller,
              "assets/icons/fleet_operator_icons/securityA.svg",
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
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
            'alert_vehicle',
            controller,
            "assets/icons/fleet_operator_icons/fleetsManagedA2.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildSwitchRow(
            'Trip Updates',
            'Trip start, stop, delays and route changes',
            controller.tripUpdates,
            'alert_trips',
            controller,
            "assets/icons/fleet_operator_icons/locationA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildSwitchRow(
            'Maintenance Reminders',
            'Service due, overdue and maintenance updates',
            controller.maintenanceReminders,
            'alert_maintenance',
            controller,
            "assets/icons/fleet_operator_icons/maintainceReminderA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildSwitchRow(
            'System Notifications',
            'App updates, new features and system messages',
            controller.systemNotifications,
            'alert_system',
            controller,
            "assets/icons/fleet_operator_icons/notificationSettingA.svg",
          ),
          const Divider(color: AppColors.cardBorder, height: 20),
          _buildSwitchRow(
            'Security Alerts',
            'Unauthorized access and suspicious activity',
            controller.securityAlerts,
            'alert_security',
            controller,
            "assets/icons/fleet_operator_icons/securityA.svg",
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchRow(
    String title,
    String subtitle,
    RxBool state,
    String fieldKey,
    NotificationSettingsController controller,
    String icon,
  ) {
    return Row(
      children: [
        SvgPicture.asset(icon, width: 22, height: 22),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
              ),
            ],
          ),
        ),
        Obx(
          () => SizedBox(
            width: 40,
            height: 30,
            child: Transform.scale(
              scale: 0.75,
              child: Switch(
                value: state.value,
                onChanged: (val) => controller.togglePreference(fieldKey, state, val),
                activeThumbColor: Colors.white,
                activeTrackColor: const Color(0xFF0051F4),
                inactiveThumbColor: AppColors.textMuted,
                inactiveTrackColor: AppColors.cardBorder,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
