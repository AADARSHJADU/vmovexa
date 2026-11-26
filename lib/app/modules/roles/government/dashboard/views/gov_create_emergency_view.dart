import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:vmovexa/app/widgets/custom_text_field.dart';
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
            // 1. Hero Alert Warning Card (Matching Admin Panel GovEmergencyBroadcastPage)
            _buildHeroWarningCard(),
            const SizedBox(height: 20),

            // 2. Alert Broadcast Headline * with live /100 chars counter
            _buildHeadlineSection(),
            const SizedBox(height: 18),

            // 3. Emergency Number (optional) with overlay hint
            _buildEmergencyNumberSection(),
            const SizedBox(height: 18),

            // 4. Severity Level (4 selectable cards matching Admin Panel)
            _buildSeveritySection(),
            const SizedBox(height: 22),

            // 5. Upload Creative Assets or Video URL (EmergencyCreativeEditor & Gallery)
            _buildCreativeEditorSection(context),
            const SizedBox(height: 22),

            // 6. Broadcast Target Scope (All Screens vs Specific Routes & Vehicles)
            _buildTargetScopeSection(),
            const SizedBox(height: 20),

            // 7. Settings Toggles (Push Notification & Auto-Expire)
            _buildSettingsToggles(context),
            const SizedBox(height: 26),

            // 8. Big Submit CTA Button with SuperAdmin note
            _buildSubmitSection(),
            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // 1. HERO WARNING CARD
  // ==========================================
  Widget _buildHeroWarningCard() {
    return Container(
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
                width: 24,
                height: 24,
                colorFilter: const ColorFilter.mode(Color(0xFFEF4444), BlendMode.srcIn),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'gov_emergency.high_priority_transmitter'.tr,
                  style: const TextStyle(
                    color: Color(0xFFEF4444),
                    fontSize: 12.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'gov_emergency.hero_warning_desc_exact'.tr,
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
    );
  }

  // ==========================================
  // 2. HEADLINE SECTION
  // ==========================================
  Widget _buildHeadlineSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
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
            Obx(() => Text(
                  '${controller.headlineCharLength.value}${'gov_emergency.chars_100'.tr}',
                  style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                )),
          ],
        ),
        const SizedBox(height: 8),
        CustomTextField(
          hintText: 'gov_emergency.headline_placeholder_exact'.tr,
          controller: controller.alertHeadlineController,
          maxLines: 2,
          inputFormatters: [LengthLimitingTextInputFormatter(100)],
        ),
      ],
    );
  }

  // ==========================================
  // 3. EMERGENCY NUMBER SECTION
  // ==========================================
  Widget _buildEmergencyNumberSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.phone_in_talk_rounded, color: Color(0xFFEF4444), size: 16),
            const SizedBox(width: 8),
            Text(
              'gov_emergency.emergency_number_label'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 4),
            Text(
              'gov_emergency.optional'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
            ),
          ],
        ),
        const SizedBox(height: 8),
        CustomTextField(
          hintText: 'gov_emergency.emergency_number_placeholder'.tr,
          controller: controller.emergencyNumberController,
          inputFormatters: [LengthLimitingTextInputFormatter(40)],
        ),
        const SizedBox(height: 4),
        Text(
          'gov_emergency.emergency_number_hint'.tr,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
        ),
      ],
    );
  }

  // ==========================================
  // 4. SEVERITY LEVEL (4 SELECTABLE CARDS)
  // ==========================================
  Widget _buildSeveritySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
              'gov_emergency.severity'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Obx(() {
          final currentSev = controller.selectedSeverity.value;
          return GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.1,
            children: [
              _buildSeverityCard(
                level: 'Critical',
                title: 'critical'.tr,
                desc: 'gov_emergency.full_screen_flash'.tr,
                iconData: Icons.notifications_active_rounded,
                iconColor: const Color(0xFFEF4444),
                isSelected: currentSev == 'Critical',
                onTap: () => controller.selectedSeverity.value = 'Critical',
              ),
              _buildSeverityCard(
                level: 'High',
                title: 'high'.tr,
                desc: 'gov_emergency.top_banner_override'.tr,
                iconData: Icons.warning_amber_rounded,
                iconColor: const Color(0xFFF59E0B),
                isSelected: currentSev == 'High',
                onTap: () => controller.selectedSeverity.value = 'High',
              ),
              _buildSeverityCard(
                level: 'Medium',
                title: 'medium'.tr,
                desc: 'gov_emergency.ticker_scroll'.tr,
                iconData: Icons.campaign_rounded,
                iconColor: const Color(0xFF3B82F6),
                isSelected: currentSev == 'Medium',
                onTap: () => controller.selectedSeverity.value = 'Medium',
              ),
              _buildSeverityCard(
                level: 'Low',
                title: 'low'.tr,
                desc: 'gov_emergency.standard_loop'.tr,
                iconData: Icons.info_outline_rounded,
                iconColor: const Color(0xFF94A3B8),
                isSelected: currentSev == 'Low',
                onTap: () => controller.selectedSeverity.value = 'Low',
              ),
            ],
          );
        }),
      ],
    );
  }

  Widget _buildSeverityCard({
    required String level,
    required String title,
    required String desc,
    required IconData iconData,
    required Color iconColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? iconColor.withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? iconColor : AppColors.cardBorder,
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.16),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(iconData, color: iconColor, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? iconColor : Colors.white,
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    desc,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // 5. UPLOAD CREATIVE ASSETS OR VIDEO URL
  // ==========================================
  Widget _buildCreativeEditorSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'gov_emergency.upload_assets_or_url'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            'gov_emergency.attach_multiple_hint'.tr,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10, height: 1.3),
          ),
          const SizedBox(height: 14),

          // 5 Filter Tabs (All Creatives, Image, Video, PDF Document, URL)
          _buildCreativeTypeFilterTabs(),
          const SizedBox(height: 14),

          // Upload Box or URL Input Box based on active tab
          Obx(() {
            if (controller.activeCreativeTab.value == 'URL') {
              return _buildUrlInputBox();
            } else {
              return _buildUploadPickerBox();
            }
          }),
          const SizedBox(height: 16),

          // Attached Creative Assets Gallery
          Obx(() {
            if (controller.mediaItems.isEmpty) return const SizedBox.shrink();
            return _buildAttachedGallery();
          }),

          // Transit Screen Media Preview (16:9 Black Screen + Emergency Number Overlay)
          const SizedBox(height: 16),
          _buildTransitScreenPreview(),
        ],
      ),
    );
  }

  Widget _buildCreativeTypeFilterTabs() {
    final tabs = [
      {'key': 'All', 'label': 'gov_emergency.all_creatives'.tr, 'icon': Icons.folder_open_rounded},
      {'key': 'Image', 'label': 'gov_emergency.type_image'.tr, 'icon': Icons.image_rounded},
      {'key': 'Video', 'label': 'gov_emergency.type_video'.tr, 'icon': Icons.videocam_rounded},
      {'key': 'PDF', 'label': 'gov_emergency.type_pdf'.tr, 'icon': Icons.picture_as_pdf_rounded},
      {'key': 'URL', 'label': 'gov_emergency.type_url'.tr, 'icon': Icons.link_rounded},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(() {
        final active = controller.activeCreativeTab.value;
        return Row(
          children: tabs.map((t) {
            final isSelected = active == t['key'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => controller.activeCreativeTab.value = t['key'] as String,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isSelected ? AppTheme.primaryGradient : null,
                    color: isSelected ? null : Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : AppColors.cardBorder,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(t['icon'] as IconData, color: isSelected ? Colors.white : Colors.white70, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        t['label'] as String,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.white70,
                          fontSize: 10.5,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }

  Widget _buildUrlInputBox() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'gov_emergency.youtube_web_url_label'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller.mediaUrlInputController,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'gov_emergency.paste_url_ph'.tr,
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: controller.addWebMediaUrl,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add_rounded, color: Colors.white, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'gov_emergency.add_to_creatives'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadPickerBox() {
    return GestureDetector(
      onTap: () => controller.pickCreativeMedia(controller.activeCreativeTab.value),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: Colors.white.withOpacity(0.18),
            width: 1.4,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cloud_upload_outlined, color: Colors.white70, size: 24),
            ),
            const SizedBox(height: 10),
            Text(
              'gov_emergency.upload_assets_multi'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              'gov_emergency.drag_drop_files'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
            ),
            const SizedBox(height: 6),
            Text(
              'gov_emergency.upload_limits'.tr,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // ATTACHED CREATIVE ASSETS GALLERY
  // ==========================================
  Widget _buildAttachedGallery() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${'gov_emergency.attached_creative_assets'.tr} (${controller.mediaItems.length})',
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
            ),
            // const SizedBox(width: 8),
            Text(
              'gov_emergency.preview_ready_badge'.tr,
              style: const TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 5),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => controller.pickCreativeMedia('Image'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Text(
                  'gov_emergency.add_more_files'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            // const SizedBox(width: 6),
            GestureDetector(
              onTap: controller.clearAllCreatives,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4)),
                ),
                child: Text(
                  'gov_emergency.clear_all'.tr,
                  style: const TextStyle(color: Color(0xFFF87171), fontSize: 9.5, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.mediaItems.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, idx) {
            final item = controller.mediaItems[idx];
            final isSelected = controller.selectedPreviewIndex.value == idx;
            return Container(
              // padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E293B) : Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                  width: isSelected ? 1.4 : 1,
                ),
              ),
              child: Row(
                children: [
                  // Thumbnail or Icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.black26,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: item.type == 'Image' && item.localPath != null
                        ? Image.file(
                            File(item.localPath!),
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                            const Icon(Icons.image, color: Colors.white54, size: 20),
                          )
                        : Icon(
                            item.type == 'Video'
                                ? Icons.videocam_rounded
                                : item.type == 'PDF'
                                    ? Icons.picture_as_pdf_rounded
                                    : Icons.link_rounded,
                            color: item.type == 'Video'
                                ? const Color(0xFF6366F1)
                                : item.type == 'PDF'
                                    ? const Color(0xFFEF4444)
                                    : const Color(0xFF3B82F6),
                            size: 22,
                          ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${item.type} · ${item.size}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                        ),
                      ],
                    ),
                  ),
                  // Seq & Duration
                  Row(
                    children: [
                      Text(
                        '${'gov_emergency.seq'.tr} ${idx + 1}',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 4),
                      SizedBox(
                        width: 38,
                        height: 28,
                        child: TextField(
                          keyboardType: TextInputType.number,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                          decoration: InputDecoration(
                            contentPadding: EdgeInsets.zero,
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide.none),
                          ),
                          controller: TextEditingController(text: item.displayDurationSec.toString())
                            ..selection = TextSelection.collapsed(offset: item.displayDurationSec.toString().length),
                          onSubmitted: (val) {
                            final n = int.tryParse(val) ?? 15;
                            controller.updateCreativeDuration(item.id, n);
                          },
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'gov_emergency.sec'.tr,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 9),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  // Preview toggle button
                  GestureDetector(
                    onTap: () => controller.selectedPreviewIndex.value = idx,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF3B82F6) : Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          if (isSelected) const Icon(Icons.check_circle_rounded, color: Colors.white, size: 12),
                          if (isSelected) const SizedBox(width: 3),
                          Text(
                            isSelected ? 'gov_emergency.viewing'.tr : 'gov_emergency.preview'.tr,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.white70,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 18),
                    onPressed: () => controller.removeCreativeItem(item.id),
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.only(left: 6),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // ==========================================
  // TRANSIT SCREEN MEDIA PREVIEW (16:9 Black Screen Simulator)
  // ==========================================
  Widget _buildTransitScreenPreview() {
    return Obx(() {
      final items = controller.mediaItems;
      final selectedIdx = controller.selectedPreviewIndex.value;
      final active = items.isNotEmpty && selectedIdx < items.length ? items[selectedIdx] : null;
      final emgNumber = controller.emergencyNumberController.text.trim();

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'gov_emergency.media_preview_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
              ),
              if (active != null)
                Text(
                  ' • ${selectedIdx + 1} / ${items.length}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 10.5),
                ),
            ],
          ),
          const SizedBox(height: 8),
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.2),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Media Content
                  if (active == null)
                    Center(
                      child: Text(
                        'gov_emergency.attach_to_preview'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 11),
                      ),
                    )
                  else if (active.type == 'Image' && active.localPath != null)
                    Image.file(
                      File(active.localPath!),
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Icon(Icons.image, color: Colors.white38, size: 36),
                      ),
                    )
                  else if (active.url != null && active.url!.isNotEmpty && (active.type == 'Image'))
                    Image.network(
                      active.url!,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Icon(Icons.image, color: Colors.white38, size: 36),
                      ),
                    )
                  else
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            active.type == 'Video'
                                ? Icons.play_circle_fill_rounded
                                : active.type == 'PDF'
                                    ? Icons.picture_as_pdf_rounded
                                    : Icons.open_in_browser_rounded,
                            color: Colors.white70,
                            size: 42,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            active.name,
                            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                  // Floating Emergency Helpline Overlay Banner at Bottom-Center
                  if (emgNumber.isNotEmpty)
                    Positioned(
                      bottom: 12,
                      left: 16,
                      right: 16,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDC2626),
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.5),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Text(
                            '${'gov_emergency.emergency_colon'.tr} $emgNumber',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      );
    });
  }

  // ==========================================
  // 6. TARGET BROADCAST SCOPE & ROUTE PICKER
  // ==========================================
  Widget _buildTargetScopeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
              'gov_emergency.target_scope'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // 2 Radio Cards: All Screens vs Specific Routes
        Obx(() {
          final isAll = controller.targetAllScreens.value;
          return Column(
            children: [
              _buildScopeOptionCard(
                title: 'gov_emergency.all_screens_opt'.tr,
                subtitle: 'gov_emergency.all_screens_desc'.tr,
                iconData: Icons.public_rounded,
                isSelected: isAll,
                onTap: () => controller.targetAllScreens.value = true,
              ),
              const SizedBox(height: 10),
              _buildScopeOptionCard(
                title: 'gov_emergency.specific_routes_opt'.tr,
                subtitle: 'gov_emergency.specific_routes_desc'.tr,
                iconData: Icons.alt_route_rounded,
                isSelected: !isAll,
                onTap: () => controller.targetAllScreens.value = false,
              ),
            ],
          );
        }),

        // RouteVehicleScreenPicker (Expanded when Specific Routes is chosen)
        Obx(() {
          if (controller.targetAllScreens.value) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(top: 14),
            child: _buildRouteVehicleScreenPicker(),
          );
        }),
      ],
    );
  }

  Widget _buildScopeOptionCard({
    required String title,
    required String subtitle,
    required IconData iconData,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEF4444).withOpacity(0.12) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFFEF4444) : AppColors.cardBorder,
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFEF4444).withOpacity(0.2) : Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(iconData, color: isSelected ? const Color(0xFFEF4444) : Colors.white70, size: 20),
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
                      fontSize: 11.5,
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
            Icon(
              isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
              color: isSelected ? const Color(0xFFEF4444) : Colors.white38,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // ROUTE & VEHICLE SCREEN PICKER (Dynamic Fleet Data)
  // ==========================================
  Widget _buildRouteVehicleScreenPicker() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Chips Bar: X routes • Y vehicles • Z screens
          Obx(() => Row(
                children: [
                  _buildSummaryBadge(
                    text: '${controller.totalSelectedRoutesCount} ${'gov_emergency.routes_count'.tr}',
                    color: const Color(0xFF3B82F6),
                  ),
                  const SizedBox(width: 6),
                  _buildSummaryBadge(
                    text: '${controller.totalSelectedVehiclesCount} ${'gov_emergency.vehicles_count'.tr}',
                    color: const Color(0xFF8B5CF6),
                  ),
                  const SizedBox(width: 6),
                  _buildSummaryBadge(
                    text: '${controller.totalSelectedScreensCount} ${'gov_emergency.screens_count'.tr}',
                    color: const Color(0xFF10B981),
                  ),
                ],
              )),
          const SizedBox(height: 12),

          // Search Routes Bar
          TextField(
            controller: controller.routeSearchController,
            style: const TextStyle(color: Colors.white, fontSize: 11.5),
            decoration: InputDecoration(
              hintText: 'gov_emergency.search_routes'.tr,
              hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.white38, size: 18),
              filled: true,
              fillColor: const Color(0xFF0F172A),
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),

          // City Filter Tabs
          Obx(() {
            final cities = controller.availableCities;
            final selectedCity = controller.routeCityFilter.value;
            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: cities.map((c) {
                  final isSelected = selectedCity == c;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: GestureDetector(
                      onTap: () => controller.routeCityFilter.value = c,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          gradient: isSelected ? AppTheme.primaryGradient : null,
                          color: isSelected ? null : Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          c == 'All' ? 'gov_emergency.city_all'.tr : c,
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.white70,
                            fontSize: 10,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),
          const SizedBox(height: 12),

          // Routes & Vehicles List
          Obx(() {
            final routes = controller.filteredRoutes;
            if (routes.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'gov_emergency.no_routes_match'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 11),
                  ),
                ),
              );
            }
            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: routes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, idx) {
                final route = routes[idx];

                // Per-item Obx: observables are read inside this tracked builder.
                return Obx(() {
                  final isSelected = controller.isRouteSelected(route);
                  final isExpanded =
                  controller.expandedRouteKeys.contains(route.routeKey);

                  return Container(
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF3B82F6).withOpacity(0.08)
                          : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF3B82F6)
                            : AppColors.cardBorder,
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(10),
                          child: Row(
                            children: [
                              Checkbox(
                                value: isSelected,
                                onChanged: (_) => controller.toggleRoute(route),
                                activeColor: const Color(0xFF3B82F6),
                                checkColor: Colors.white,
                                visualDensity: VisualDensity.compact,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4)),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            route.name,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 5, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withOpacity(0.08),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            route.code,
                                            style: const TextStyle(
                                              color: Colors.white70,
                                              fontSize: 8.5,
                                              fontFamily: 'monospace',
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${route.city} · ${route.vehicleCount} buses · ${route.totalScreens} screens',
                                      style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 9.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (route.vehicles.isNotEmpty)
                                GestureDetector(
                                  onTap: () {
                                    if (isExpanded) {
                                      controller.expandedRouteKeys
                                          .remove(route.routeKey);
                                    } else {
                                      controller.expandedRouteKeys.add(route.routeKey);
                                    }
                                  },
                                  child: Text(
                                    isExpanded
                                        ? 'gov_emergency.hide_vehicles'.tr
                                        : 'gov_emergency.select_vehicles'.tr,
                                    style: const TextStyle(
                                      color: Color(0xFF60A5FA),
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        // Expanded Vehicle Checkboxes
                        if (isExpanded && route.vehicles.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                            child: Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: route.vehicles.map((v) {
                                final isVehSel =
                                controller.isVehicleSelected(route, v.id);
                                return GestureDetector(
                                  onTap: () => controller.toggleVehicle(route, v.id),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isVehSel
                                          ? const Color(0xFF3B82F6).withOpacity(0.2)
                                          : Colors.white.withOpacity(0.04),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: isVehSel
                                            ? const Color(0xFF3B82F6)
                                            : AppColors.cardBorder,
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          isVehSel
                                              ? Icons.check_box_rounded
                                              : Icons.check_box_outline_blank_rounded,
                                          color: isVehSel
                                              ? const Color(0xFF3B82F6)
                                              : Colors.white38,
                                          size: 14,
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(Icons.directions_bus_rounded,
                                            color: Color(0xFF60A5FA), size: 12),
                                        const SizedBox(width: 4),
                                        Text(
                                          v.busNumber,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          '(${v.displaysCount} scr)',
                                          style: const TextStyle(
                                            color: AppColors.textMuted,
                                            fontSize: 8.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                      ],
                    ),
                  );
                });
              },
            );
          }),
          /* Obx(() {
            final routes = controller.filteredRoutes;
            if (routes.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'gov_emergency.no_routes_match'.tr,
                    style: const TextStyle(color: Colors.white38, fontSize: 11),
                  ),
                ),
              );
            }
            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: routes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, idx) {
                final route = routes[idx];
                final isSelected = controller.isRouteSelected(route);
                final isExpanded = controller.expandedRouteKeys.contains(route.routeKey);

                return Container(
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF3B82F6).withOpacity(0.08) : const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Row(
                          children: [
                            Checkbox(
                              value: isSelected,
                              onChanged: (_) => controller.toggleRoute(route),
                              activeColor: const Color(0xFF3B82F6),
                              checkColor: Colors.white,
                              visualDensity: VisualDensity.compact,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          route.name,
                                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.08),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          route.code,
                                          style: const TextStyle(color: Colors.white70, fontSize: 8.5, fontFamily: 'monospace'),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${route.city} · ${route.vehicleCount} buses · ${route.totalScreens} screens',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
                                  ),
                                ],
                              ),
                            ),
                            if (route.vehicles.isNotEmpty)
                              GestureDetector(
                                onTap: () {
                                  if (isExpanded) {
                                    controller.expandedRouteKeys.remove(route.routeKey);
                                  } else {
                                    controller.expandedRouteKeys.add(route.routeKey);
                                  }
                                },
                                child: Text(
                                  isExpanded ? 'gov_emergency.hide_vehicles'.tr : 'gov_emergency.select_vehicles'.tr,
                                  style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 9.5, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                      ),
                      // Expanded Vehicle Checkboxes
                      if (isExpanded && route.vehicles.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: route.vehicles.map((v) {
                              final isVehSel = controller.isVehicleSelected(route, v.id);
                              return GestureDetector(
                                onTap: () => controller.toggleVehicle(route, v.id),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isVehSel ? const Color(0xFF3B82F6).withOpacity(0.2) : Colors.white.withOpacity(0.04),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: isVehSel ? const Color(0xFF3B82F6) : AppColors.cardBorder,
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isVehSel ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
                                        color: isVehSel ? const Color(0xFF3B82F6) : Colors.white38,
                                        size: 14,
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.directions_bus_rounded, color: Color(0xFF60A5FA), size: 12),
                                      const SizedBox(width: 4),
                                      Text(
                                        v.busNumber,
                                        style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '(${v.displaysCount} scr)',
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                    ],
                  ),
                );
              },
            );
          }),*/
        ],
      ),
    );
  }

  Widget _buildSummaryBadge({required String text, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 9.5, fontWeight: FontWeight.bold),
      ),
    );
  }

  // ==========================================
  // 7. SETTINGS TOGGLES (PUSH NOTIFICATION & AUTO-EXPIRE)
  // ==========================================
  Widget _buildSettingsToggles(BuildContext context) {
    return Column(
      children: [
        // Push notification switch
        Obx(() => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
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
                            'gov_emergency.send_push_notification'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'gov_emergency.notify_crew'.tr,
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
        const SizedBox(height: 10),

        // Auto Expire Alert Duration
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'gov_emergency.auto_expire_alert'.tr,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'gov_emergency.resume_regular'.tr,
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 8.5),
                        ),
                      ],
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
      ],
    );
  }

  // ==========================================
  // 8. SUBMIT BUTTON & PRECEDENCE FOOTNOTE
  // ==========================================
  Widget _buildSubmitSection() {
    return Column(
      children: [
        Obx(() => Container(
              width: double.infinity,
              height: 48,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
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
                            controller.isBroadcasting.value
                                ? 'gov_emergency.transmitting'.tr
                                : 'gov_emergency.submit_for_superadmin'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
              ),
            )),
        const SizedBox(height: 8),
        Text(
          'gov_emergency.override_precedence_note'.tr,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5),
          textAlign: TextAlign.center,
        ),
      ],
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
              'gov_emergency.auto_expire_alert'.tr,
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
