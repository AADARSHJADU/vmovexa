import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../widgets/custom_text_field.dart';
import '../controllers/government_dashboard_controller.dart';

class GovCreateEmergencyView extends GetView<GovernmentDashboardController> {
  const GovCreateEmergencyView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF131826),
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
          onPressed: () => Get.back(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'gov_emergency.create_title'.tr,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'gov_emergency.create_subtitle'.tr,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444).withOpacity(0.16),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5), width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'gov_emergency.channel_active'.tr,
                  style: const TextStyle(
                    color: Color(0xFFFCA5A5),
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Alert Warning Card (Matching Admin Panel GovEmergencyBroadcastPage)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFFEF4444).withOpacity(0.2),
                    const Color(0xFFEF4444).withOpacity(0.06),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: const Color(0xFFEF4444).withOpacity(0.5),
                  width: 1.4,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.22),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.6), width: 1.2),
                    ),
                    child: Center(
                      child: SvgPicture.asset(
                        'assets/icons/active-alert.svg',
                        width: 26,
                        height: 26,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'gov_emergency.hero_warning_title'.tr,
                          style: const TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 12.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.6,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'gov_emergency.hero_warning_desc'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Alert Broadcast Headline
            Row(
              children: [
                const Icon(Icons.title_rounded, color: Color(0xFFEF4444), size: 16),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.headline_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
                const Text(' *', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            CustomTextField(
              hintText: 'gov_emergency.headline_ph'.tr,
              controller: controller.alertHeadlineController,
              maxLines: 2,
            ),
            const SizedBox(height: 18),

            // Severity Level Grid Selection (4 boxes)
            Row(
              children: [
                SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/securityA.svg',
                  width: 16,
                  height: 16,
                  colorFilter: const ColorFilter.mode(Color(0xFFEF4444), BlendMode.srcIn),
                ),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.severity_level'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Obx(() {
              final sev = controller.selectedSeverity.value;
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 1.05,
                children: [
                  _buildSeverityCard(
                    title: 'Critical',
                    subtitle: 'gov_emergency.critical_impact'.tr,
                    icon: 'assets/icons/critical.svg',
                    color: const Color(0xFFEF4444),
                    isSelected: sev == 'Critical',
                    onTap: () => controller.selectedSeverity.value = 'Critical',
                  ),
                  _buildSeverityCard(
                    title: 'High',
                    subtitle: 'gov_emergency.high_important'.tr,
                    icon: 'assets/icons/high.svg',
                    color: const Color(0xFFF97316),
                    isSelected: sev == 'High',
                    onTap: () => controller.selectedSeverity.value = 'High',
                  ),
                  _buildSeverityCard(
                    title: 'Medium',
                    subtitle: 'gov_emergency.medium_moderate'.tr,
                    icon: 'assets/icons/medium.svg',
                    color: const Color(0xFFF59E0B),
                    isSelected: sev == 'Medium',
                    onTap: () => controller.selectedSeverity.value = 'Medium',
                  ),
                  _buildSeverityCard(
                    title: 'Low',
                    subtitle: 'gov_emergency.low_general'.tr,
                    icon: 'assets/icons/low.svg',
                    color: const Color(0xFF3B82F6),
                    isSelected: sev == 'Low',
                    onTap: () => controller.selectedSeverity.value = 'Low',
                  ),
                ],
              );
            }),
            const SizedBox(height: 18),

            // Detailed Alert Message
            Row(
              children: [
                SvgPicture.asset(
                  'assets/icons/fleet_operator_icons/smsNotificationA.svg',
                  width: 16,
                  height: 16,
                  colorFilter: const ColorFilter.mode(Color(0xFFEF4444), BlendMode.srcIn),
                ),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.message_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
                const Text(' *', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            CustomTextField(
              hintText: 'gov_emergency.message_ph'.tr,
              controller: controller.alertMessageController,
              maxLines: 4,
            ),
            const SizedBox(height: 18),

            // Emergency Helpline / Contact Number
            Row(
              children: [
                const Icon(Icons.phone_in_talk_rounded, color: Color(0xFFEF4444), size: 16),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.helpline_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            CustomTextField(
              hintText: 'gov_emergency.helpline_ph'.tr,
              controller: controller.emergencyNumberController,
            ),
            const SizedBox(height: 18),

            // Target Scope Selection
            Row(
              children: [
                SvgPicture.asset(
                  'assets/icons/tower.svg',
                  width: 18,
                  height: 18,
                  colorFilter: const ColorFilter.mode(Color(0xFFEF4444), BlendMode.srcIn),
                ),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.target_scope_label'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Obx(() {
              final isAll = controller.selectedAlertArea.value == 'Entire Transit Network';
              return Column(
                children: [
                  _buildScopeOption(
                    title: 'gov_emergency.entire_network'.tr,
                    subtitle: 'gov_emergency.target_all_desc'.tr,
                    isSelected: isAll,
                    onTap: () => controller.selectedAlertArea.value = 'Entire Transit Network',
                  ),
                  const SizedBox(height: 8),
                  _buildScopeOption(
                    title: 'gov_emergency.selected_routes'.tr,
                    subtitle: 'Bhopal Central & Ring Road Corridors',
                    isSelected: !isAll,
                    onTap: () => controller.selectedAlertArea.value = 'Bhopal Central Corridors',
                  ),
                ],
              );
            }),
            const SizedBox(height: 18),

            // Advisory Media Attachment (Image / Video)
            Row(
              children: [
                const Icon(Icons.attachment_rounded, color: Color(0xFF3B82F6), size: 16),
                const SizedBox(width: 8),
                Text(
                  'gov_emergency.media_attachment'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Obx(() {
              final hasMedia = controller.attachedMediaUrl.value.isNotEmpty;
              final isUploading = controller.isUploadingMedia.value;

              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: hasMedia ? const Color(0xFF10B981).withOpacity(0.5) : AppColors.cardBorder,
                    width: 1.2,
                  ),
                ),
                child: isUploading
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: CircularProgressIndicator(color: Color(0xFFEF4444), strokeWidth: 2),
                        ),
                      )
                    : hasMedia
                        ? Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.image_rounded, color: Color(0xFF10B981), size: 24),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      controller.attachedMediaName.value.isNotEmpty
                                          ? controller.attachedMediaName.value
                                          : 'Advisory Graphic Attached',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Ready to broadcast on transit screens',
                                      style: TextStyle(color: Color(0xFF10B981), fontSize: 9.5),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                                onPressed: () {
                                  controller.attachedMediaUrl.value = '';
                                  controller.attachedMediaName.value = '';
                                },
                              ),
                            ],
                          )
                        : GestureDetector(
                            onTap: controller.pickMediaForAlert,
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.05),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppColors.cardBorder),
                                  ),
                                  child: const Icon(Icons.cloud_upload_outlined, color: Colors.white60, size: 22),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'gov_emergency.tap_to_upload'.tr,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'gov_emergency.media_desc'.tr,
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.add_photo_alternate_rounded, color: Color(0xFFEF4444), size: 20),
                              ],
                            ),
                          ),
              );
            }),
            const SizedBox(height: 18),

            // Push Notification & Auto Expire Settings Row
            Obx(() => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder, width: 1),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          SvgPicture.asset(
                            'assets/icons/fleet_operator_icons/notification.svg',
                            width: 18,
                            height: 18,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'gov_emergency.push_notify_label'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'gov_emergency.push_notify_desc'.tr,
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Switch(
                        value: controller.sendPushNotification.value,
                        onChanged: (val) => controller.sendPushNotification.value = val,
                        activeTrackColor: const Color(0xFFEF4444),
                        activeThumbColor: Colors.white,
                        inactiveTrackColor: Colors.grey.shade700,
                        inactiveThumbColor: Colors.white,
                        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 12),

            // Auto Expire Alert Duration Selector
            GestureDetector(
              onTap: () => _showDurationPicker(context),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        SvgPicture.asset('assets/icons/clock.svg', width: 18, height: 18),
                        const SizedBox(width: 12),
                        Text(
                          'gov_emergency.auto_expire_label'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Obx(() => Text(
                              controller.autoExpireAlert.value,
                              style: const TextStyle(
                                color: Color(0xFFEF4444),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            )),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 13),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 26),

            // Submit Button
            Obx(() => Container(
                  width: double.infinity,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFEF4444), Color(0xFFB91C1C)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEF4444).withOpacity(0.35),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: controller.isBroadcasting.value ? null : controller.broadcastEmergencyAlert,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: controller.isBroadcasting.value
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'gov_emergency.broadcast_now_btn'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ],
                          ),
                  ),
                )),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildSeverityCard({
    required String title,
    required String subtitle,
    required String icon,
    required Color color,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : AppColors.cardBorder,
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(icon, width: 20, height: 20),
            const SizedBox(height: 6),
            Text(
              title,
              style: TextStyle(
                color: isSelected ? color : Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 7.5),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScopeOption({
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEF4444).withOpacity(0.1) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFFEF4444).withOpacity(0.6) : AppColors.cardBorder,
            width: isSelected ? 1.4 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
              size: 18,
              color: isSelected ? const Color(0xFFEF4444) : AppColors.textMuted,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white70,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDurationPicker(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF131826),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'gov_emergency.auto_expire_label'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 14),
            ...['2 Hours', '6 Hours', '12 Hours', '24 Hours'].map((dur) {
              return ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(dur, style: const TextStyle(color: Colors.white, fontSize: 12.5)),
                trailing: controller.autoExpireAlert.value == dur
                    ? const Icon(Icons.check_rounded, color: Color(0xFFEF4444), size: 18)
                    : null,
                onTap: () {
                  controller.autoExpireAlert.value = dur;
                  Get.back();
                },
              );
            }),
          ],
        ),
      ),
    );
  }
}
