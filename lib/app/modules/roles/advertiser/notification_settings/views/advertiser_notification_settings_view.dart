import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_back_button.dart';
import '../controllers/advertiser_notification_settings_controller.dart';

class AdvertiserNotificationSettingsView extends GetView<AdvertiserNotificationSettingsController> {
  const AdvertiserNotificationSettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const CustomBackButton(),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('notification_settings'.tr,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text('manage_delivery_channels_sub'.tr,
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => Get.back(),
                    child: Text('done_btn'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFF1E293B), height: 1),

            // Settings Body
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)));
                }

                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Channels Header Card
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder, width: 1.2),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('delivery_channels'.tr,
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text('instant_toggle_sub'.tr,
                                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 5),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
                              ),
                              child: Text('master_plus_5_channels'.tr,
                                style: TextStyle(
                                  color: Color(0xFF60A5FA),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Divider(color: Color(0xFF334155), height: 1),
                            const SizedBox(height: 12),

                            // 1. Master Channel: All Notifications
                            _buildChannelTile(
                              title: 'all_notifications'.tr,
                              description: 'all_notifications_desc'.tr,
                              icon: Icons.notifications_active_rounded,
                              iconColor: const Color(0xFF3B82F6),
                              stateVar: controller.masterPush,
                              fieldKey: 'master_push',
                              isMaster: true,
                            ),

                            const Divider(color: Color(0xFF1E293B), height: 20),

                            // 2. Web Notifications (channel_in_app)
                            _buildChannelTile(
                              title: 'web_notifications_title'.tr,
                              description: 'web_notifications_desc'.tr,
                              icon: Icons.language_rounded,
                              iconColor: const Color(0xFF06B6D4),
                              stateVar: controller.channelInApp,
                              fieldKey: 'channel_in_app',
                            ),

                            const Divider(color: Color(0xFF1E293B), height: 20),

                            // 3. Push Notifications (channel_push)
                            _buildChannelTile(
                              title: 'push_notifications'.tr,
                              description: 'push_notifications_desc'.tr,
                              icon: Icons.smartphone_rounded,
                              iconColor: const Color(0xFF8B5CF6),
                              stateVar: controller.channelPush,
                              fieldKey: 'channel_push',
                            ),

                            const Divider(color: Color(0xFF1E293B), height: 20),

                            // 4. SMS Notifications (channel_sms)
                            _buildChannelTile(
                              title: 'sms_notifications'.tr,
                              description: 'sms_notifications_desc'.tr,
                              icon: Icons.chat_bubble_outline_rounded,
                              iconColor: const Color(0xFFF59E0B),
                              stateVar: controller.channelSms,
                              fieldKey: 'channel_sms',
                            ),

                            const Divider(color: Color(0xFF1E293B), height: 20),

                            // 5. Mail Notifications (channel_email)
                            _buildChannelTile(
                              title: 'mail_notifications_title'.tr,
                              description: 'mail_notifications_desc'.tr,
                              icon: Icons.email_outlined,
                              iconColor: const Color(0xFFEF4444),
                              stateVar: controller.channelEmail,
                              fieldKey: 'channel_email',
                            ),

                            const Divider(color: Color(0xFF1E293B), height: 20),

                            // 6. WhatsApp Notifications (channel_whatsapp)
                            _buildChannelTile(
                              title: 'whatsapp_notifications'.tr,
                              description: 'whatsapp_notifications_desc'.tr,
                              icon: Icons.phone_android_rounded,
                              iconColor: const Color(0xFF10B981),
                              stateVar: controller.channelWhatsapp,
                              fieldKey: 'channel_whatsapp',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Info Helper
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline_rounded, color: Color(0xFF64748B), size: 18),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text('toggle_pref_note'.tr,
                                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChannelTile({
    required String title,
    required String description,
    required IconData icon,
    required Color iconColor,
    required RxBool stateVar,
    required String fieldKey,
    bool isMaster = false,
  }) {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: iconColor.withValues(alpha: 0.3)),
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
                style: TextStyle(
                  color: Colors.white,
                  fontSize: isMaster ? 13.5 : 12.5,
                  fontWeight: isMaster ? FontWeight.bold : FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Obx(() => Switch.adaptive(
              value: stateVar.value,
              activeThumbColor: const Color(0xFF2563EB),
              activeTrackColor: const Color(0xFF2563EB).withValues(alpha: 0.5),
              inactiveThumbColor: const Color(0xFF64748B),
              inactiveTrackColor: const Color(0xFF334155),
              onChanged: (_) => controller.toggleChannel(fieldKey, stateVar),
            )),
      ],
    );
  }
}
