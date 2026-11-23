import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:vmovexa/app/modules/roles/driver/report/controller/report_incident_controller.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'incident_details_view.dart' show IncidentDetailsView;

class IncidentLocationMediaView extends GetView<ReportIncidentController> {
  const IncidentLocationMediaView({super.key});

  static const Color kBg = IncidentDetailsView.kBg;
  static const Color kCardBg = IncidentDetailsView.kCardBg;
  static const Color kFieldBg = IncidentDetailsView.kFieldBg;
  static const Color kPurple = IncidentDetailsView.kPurple;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 16),
                  _buildStepper(),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                children: [
                  _buildStepHeader(),
                  const SizedBox(height: 14),
                  _buildGooglePlacesSearch(),
                  const SizedBox(height: 14),
                  _buildInteractiveMap(),
                  const SizedBox(height: 16),
                  _buildAddressFields(),
                  const SizedBox(height: 16),
                  _buildLandmarkCard(),
                  const SizedBox(height: 20),
                  _buildPhotosSection(context),
                  const SizedBox(height: 20),
                  _buildVideosSection(context),
                ],
              ),
            ),
            _buildFooterButtons(),
          ],
        ),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader() {
    return Row(
      children: [
        GestureDetector(
          onTap: controller.onStep2BackPressed,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'report_incident'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 2),
              Text(
                'driver_incident.hero_desc'.tr,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
          ),
          child: Text(
            '${'driver_incident.step_indicator'.tr} 2 ${'driver_incident.of_4'.tr}',
            style: const TextStyle(color: Color(0xFFF87171), fontSize: 11, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }

  // ---------------- 4-Step Stepper Bar ----------------
  Widget _buildStepper() {
    return Obx(
      () => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kCardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
        ),
        child: Row(
          children: List.generate(controller.stepLabels.length, (index) {
            final stepNumber = index + 1;
            final isActive = stepNumber == controller.currentStep.value;
            final isCompleted = stepNumber < controller.currentStep.value;
            final isLast = stepNumber == controller.stepLabels.length;

            return Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: (isActive || isCompleted) ? AppTheme.primaryGradient : null,
                            color: (isActive || isCompleted) ? null : kFieldBg,
                            border: Border.all(
                              color: isActive ? Colors.transparent : (isCompleted ? Colors.transparent : Colors.white24),
                              width: isActive ? 2 : 1,
                            ),
                            boxShadow: isActive
                                ? [
                                    BoxShadow(
                                      color: AppTheme.gradientBlue.withValues(alpha: 0.4),
                                      blurRadius: 8,
                                    ),
                                  ]
                                : null,
                          ),
                          child: isCompleted
                              ? const Icon(Icons.check, color: Colors.white, size: 14)
                              : Text(
                                  '$stepNumber',
                                  style: TextStyle(
                                    color: isActive ? Colors.white : Colors.white38,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          controller.stepLabels[index],
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isActive ? Colors.white : (isCompleted ? Colors.white70 : Colors.white38),
                            fontSize: 9.5,
                            fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!isLast)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: SizedBox(
                        width: 10,
                        child: Divider(
                          color: isCompleted ? AppTheme.gradientBlue : Colors.white12,
                          thickness: 1.5,
                        ),
                      ),
                    ),
                ],
              ),
            );
          }),
        ),
      ),
    );
  }

  // ---------------- Step Title + GPS Auto-Detect Button ----------------
  Widget _buildStepHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'driver_incident.step_2_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 2),
              Text(
                'driver_incident.step_2_sub'.tr,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Obx(
          () => GestureDetector(
            onTap: controller.isDetectingGps.value ? null : controller.onAutoDetectGps,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  controller.isDetectingGps.value
                      ? const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF60A5FA)),
                        )
                      : const Icon(Icons.my_location_rounded, color: Color(0xFF60A5FA), size: 14),
                  const SizedBox(width: 6),
                  Text(
                    controller.isDetectingGps.value ? 'driver_incident.detecting_gps'.tr : 'driver_incident.auto_detect_gps'.tr,
                    style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 10.5, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Google Places Search Field + Dropdown ----------------
  Widget _buildGooglePlacesSearch() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'driver_incident.search_places_label'.tr,
          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Column(
            children: [
              TextField(
                controller: controller.searchPlacesCtrl,
                onChanged: controller.onSearchPlacesChanged,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'driver_incident.search_places_hint'.tr,
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
                  prefixIcon: const Icon(Icons.search_rounded, color: Colors.white54, size: 18),
                  suffixIcon: Obx(
                    () => controller.isSearchingPlaces.value
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.gradientBlue),
                            ),
                          )
                        : (controller.searchPlacesCtrl.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                                onPressed: () {
                                  controller.searchPlacesCtrl.clear();
                                  controller.placesPredictions.clear();
                                  controller.showPlacesDropdown.value = false;
                                },
                              )
                            : const SizedBox.shrink()),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
              ),
              Obx(() {
                if (!controller.showPlacesDropdown.value || controller.placesPredictions.isEmpty) {
                  return const SizedBox.shrink();
                }
                return Container(
                  constraints: const BoxConstraints(maxHeight: 180),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1B1B27),
                    border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: controller.placesPredictions.length,
                    separatorBuilder: (context, index) => Divider(color: Colors.white.withValues(alpha: 0.04), height: 1),
                    itemBuilder: (context, idx) {
                      final place = controller.placesPredictions[idx];
                      return ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: const Icon(Icons.location_on_outlined, color: Color(0xFFEF4444), size: 18),
                        title: Text(
                          place.name,
                          style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          place.formattedAddress,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white54, fontSize: 10),
                        ),
                        onTap: () => controller.onSelectPlace(place),
                      );
                    },
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------- Interactive Map (FlutterMap with Pin) ----------------
  Widget _buildInteractiveMap() {
    return Container(
      height: 190,
      width: double.infinity,
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Obx(
            () => FlutterMap(
              mapController: controller.mapController,
              options: MapOptions(
                initialCenter: LatLng(controller.currentLat.value, controller.currentLng.value),
                initialZoom: controller.hasLocationPin.value ? 15.0 : 6.0,
                onTap: (tapPosition, point) => controller.onMapTapped(point),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.vmovexa.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(controller.currentLat.value, controller.currentLng.value),
                      width: 44,
                      height: 44,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(5),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDC2626),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.5),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 16),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Positioned(
            top: 8,
            left: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.touch_app_rounded, color: Color(0xFF60A5FA), size: 12),
                  const SizedBox(width: 4),
                  Text(
                    'tap_map_set_spot'.tr,
                    style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          Obx(() {
            if (!controller.isReverseGeocoding.value) return const SizedBox.shrink();
            return Positioned(
              top: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 1.5, color: Color(0xFF60A5FA))),
                    const SizedBox(width: 6),
                    Text('resolving_address'.tr, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  // ---------------- Address Fields ----------------
  Widget _buildAddressFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionLabel('driver_incident.address_label'.tr, required: true),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: kCardBg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: TextField(
            controller: controller.addressCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'driver_incident.address_placeholder'.tr,
              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
              border: InputBorder.none,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              flex: 2,
              child: _buildSmallTextField('driver_incident.city'.tr, controller.cityCtrl),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 2,
              child: _buildSmallTextField('driver_incident.state'.tr, controller.stateCtrl),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 1,
              child: _buildSmallTextField('driver_incident.pincode'.tr, controller.pincodeCtrl),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSmallTextField(String label, TextEditingController ctrl) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
          TextField(
            controller: ctrl,
            style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
            decoration: const InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.symmetric(vertical: 4),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- Landmark & Highway Marker Card ----------------
  Widget _buildLandmarkCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'driver_incident.landmark_marker'.tr,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller.landmarkCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'driver_incident.landmark_ph'.tr,
              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 11),
              filled: true,
              fillColor: const Color(0xFF1B1B27),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'driver_incident.landmark_hint'.tr,
            style: const TextStyle(color: Colors.white38, fontSize: 10),
          ),
        ],
      ),
    );
  }

  // ---------------- Photos Section ----------------
  Widget _buildPhotosSection(BuildContext context) {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${'driver_incident.photos_attached'.tr} (${controller.photoPaths.length}/${ReportIncidentController.maxPhotos})',
                style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
              Text(
                'driver_incident.multiple_images_allowed'.tr,
                style: const TextStyle(color: Colors.white38, fontSize: 10.5),
              ),
            ],
          ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.photoPaths.length + (controller.photoPaths.length < ReportIncidentController.maxPhotos ? 1 : 0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.1,
            ),
            itemBuilder: (ctx, index) {
              if (index < controller.photoPaths.length) {
                final path = controller.photoPaths[index];
                return Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        image: DecorationImage(
                          image: FileImage(File(path)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => controller.onRemovePhoto(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 12),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Img #${index + 1}',
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                );
              }

              // Add photo card
              return GestureDetector(
                onTap: () => controller.onUploadPhoto(context),
                child: Container(
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.15), style: BorderStyle.solid),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ShaderMask(
                        shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                        child: const Icon(Icons.add_a_photo_outlined, color: Colors.white, size: 22),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'driver_incident.add_photos'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ---------------- Videos Section ----------------
  Widget _buildVideosSection(BuildContext context) {
    return Obx(
      () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${'driver_incident.videos_attached'.tr} (${controller.videoPaths.length}/${ReportIncidentController.maxVideos})',
            style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
          ),
          Text(
            'driver_incident.video_clips_hint'.tr,
            style: const TextStyle(color: Colors.white38, fontSize: 10.5),
          ),
          // Row(
          //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
          //   children: [
          //     Text(
          //       '${'driver_incident.videos_attached'.tr} (${controller.videoPaths.length}/${ReportIncidentController.maxVideos})',
          //       style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
          //     ),
          //     Text(
          //       'driver_incident.video_clips_hint'.tr,
          //       style: const TextStyle(color: Colors.white38, fontSize: 10.5),
          //     ),
          //   ],
          // ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.videoPaths.length + (controller.videoPaths.length < ReportIncidentController.maxVideos ? 1 : 0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.1,
            ),
            itemBuilder: (ctx, index) {
              if (index < controller.videoPaths.length) {
                return Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      child: const Center(
                        child: Icon(Icons.play_circle_fill_rounded, color: Color(0xFFE11D48), size: 28),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => controller.onRemoveVideo(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 12),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Video #${index + 1}',
                          style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                );
              }

              // Add video card
              return GestureDetector(
                onTap: () => controller.onUploadVideo(context),
                child: Container(
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.video_call_outlined, color: Color(0xFFE11D48), size: 24),
                      const SizedBox(height: 4),
                      Text(
                        'driver_incident.add_video'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String text, {required bool required}) {
    return RichText(
      text: TextSpan(
        text: text,
        style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700),
        children: required ? const [TextSpan(text: ' *', style: TextStyle(color: Color(0xFFFF4D4D)))] : [],
      ),
    );
  }

  // ---------------- Footer Buttons ----------------
  Widget _buildFooterButtons() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      decoration: BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.06))),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: controller.onStep2BackPressed,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.arrow_back, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    Text('driver_incident.back_btn'.tr, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: controller.onStep2NextPressed,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.gradientBlue.withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'driver_incident.next_medical'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
