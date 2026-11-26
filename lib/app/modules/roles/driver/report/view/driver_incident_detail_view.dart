import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/routes/app_routes.dart';
import '../../../../../theme/app_colors.dart';
import '../../../../../theme/app_theme.dart';
import '../controller/driver_incidents_list_controller.dart';

class DriverIncidentDetailView extends StatefulWidget {
  const DriverIncidentDetailView({super.key});

  @override
  State<DriverIncidentDetailView> createState() => _DriverIncidentDetailViewState();
}

class _DriverIncidentDetailViewState extends State<DriverIncidentDetailView> {
  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kRed = Color(0xFFFF4D4D);
  static const Color kOrange = Color(0xFFFF9500);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kBlue = Color(0xFF3F7BF5);

  DriverIncidentItem? incident;
  bool isLoading = false;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    final args = Get.arguments;
    if (args is DriverIncidentItem) {
      incident = args;
      if (args.id != null) {
        _fetchFreshDetails(args.id!);
      }
    } else if (args is String) {
      _fetchFreshDetails(args);
    }
  }

  Future<void> _fetchFreshDetails(String id) async {
    setState(() => isLoading = (incident == null));
    try {
      final res = await DriverService.to.getIncidentDetails(id);
      if (res.success && res.data != null) {
        setState(() {
          incident = res.data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching incident details: $e');
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  Future<void> _openGoogleMaps(double lat, double lng) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'maps'.tr,
          'could_not_launch_map'.tr,
          backgroundColor: kCardBg,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.accentPurple))
            : incident == null
                ? _buildNotFound()
                : _buildContent(),
      ),
    );
  }

  Widget _buildNotFound() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: kRed.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.warning_amber_rounded, color: kRed, size: 44),
            ),
            const SizedBox(height: 16),
            Text(
              'incident_not_found'.tr,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'incident_not_found_desc'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            InkWell(
              onTap: () => Get.back(),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentPurple.withValues(alpha: 0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Text(
                  'back_to_incidents'.tr,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final item = incident!;
    final sev = (item.severity ?? 'low').toLowerCase();
    Color sevColor = kGreen;
    if (sev == 'critical') sevColor = kRed;
    if (sev == 'high') sevColor = kOrange;
    if (sev == 'medium') sevColor = Colors.amber;

    final st = (item.status ?? 'open').toLowerCase();
    Color stColor = kBlue;
    String stLabel = 'stat_review'.tr;
    if (st.contains('progress') || st.contains('investigat')) {
      stColor = Colors.amber;
      stLabel = 'stat_in_progress'.tr;
    } else if (st.contains('resolv')) {
      stColor = kGreen;
      stLabel = 'stat_resolved'.tr;
    } else if (st.contains('clos')) {
      stColor = Colors.grey;
      stLabel = 'stat_closed'.tr;
    }

    final ticket = item.ticketNumber ?? (item.id != null ? '#${item.id}' : 'INC');
    final incType = item.incidentType ?? item.title ?? 'incident_accident'.tr;

    return Column(
      children: [
        // App Bar Header
        _buildAppBar(ticket, stLabel, stColor),

        // Scrollable Body Content
        Expanded(
          child: RefreshIndicator(
            color: AppColors.accentPurple,
            backgroundColor: kCardBg,
            onRefresh: () async {
              if (item.id != null) {
                await _fetchFreshDetails(item.id!);
              }
            },
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 30),
              children: [
                // 1. Hero Summary Card (Primary Gradient Accent)
                _buildHeroCard(item, incType, sev, sevColor, stLabel, stColor),
                const SizedBox(height: 14),

                // 2. Environmental & Context Card (Weather, Road, Disruption, Parties)
                _buildEnvironmentalCard(item),
                const SizedBox(height: 14),

                // 3. Location & GPS Telemetry Card (with Mini Map & Open Map button)
                _buildLocationGpsCard(item),
                const SizedBox(height: 14),

                // 4. Emergency Medical & Casualty Box
                _buildMedicalCasualtyCard(item),
                const SizedBox(height: 14),

                // 5. Police & Towing Assistance Card
                _buildAssistanceCard(item),
                const SizedBox(height: 14),

                // 6. Incident Description & Immediate Action Taken
                _buildDescriptionActionCard(item),
                const SizedBox(height: 14),

                // 7. Photo Evidence Gallery
                if (item.photos.isNotEmpty) ...[
                  _buildPhotoGallery(item),
                  const SizedBox(height: 14),
                ],

                // 8. Video Evidence Gallery
                if (item.videos.isNotEmpty) ...[
                  _buildVideoGallery(item),
                  const SizedBox(height: 14),
                ],

                // 9. Control Room Dispatch & Clearance Audit Card
                _buildClearanceAuditCard(item, stLabel, stColor),
                const SizedBox(height: 14),

                // 10. Step-by-Step Activity & Audit Trail Timeline
                if (item.activityLogs.isNotEmpty) ...[
                  _buildActivityTimelineCard(item),
                  const SizedBox(height: 14),
                ],

                // 11. Bottom Action Buttons
                _buildBottomActions(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- 1. App Bar ----------------
  Widget _buildAppBar(String ticket, String stLabel, Color stColor) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      decoration: const BoxDecoration(
        color: kBg,
        border: Border(bottom: BorderSide(color: kBorder)),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () => Get.back(),
            borderRadius: BorderRadius.circular(10),
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      ticket,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: stColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: stColor.withValues(alpha: 0.35)),
                      ),
                      child: Text(
                        stLabel,
                        style: TextStyle(color: stColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'incident_audit_record'.tr,
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
              ],
            ),
          ),
          // Quick Report New Incident button with Primary Gradient
          InkWell(
            onTap: () {
              Get.toNamed(Routes.DRIVER_REPORT_INCIDENT)?.then((_) {
                if (Get.isRegistered<DriverIncidentsListController>()) {
                  Get.find<DriverIncidentsListController>().fetchIncidents();
                }
              });
            },
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accentPurple.withValues(alpha: 0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add_alert_rounded, color: Colors.white, size: 14),
                  const SizedBox(width: 5),
                  Text(
                    'report_new'.tr,
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

  // ---------------- 2. Hero Summary Banner Card ----------------
  Widget _buildHeroCard(DriverIncidentItem item, String incType, String sev, Color sevColor, String stLabel, Color stColor) {
    final IconData categoryIcon = _getIncidentIcon(incType);
    final String disruptionText = _formatDisruptionLevel(item.trafficDisruptionLevel);

    return Container(
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Accent Line with primaryGradient
          Container(
            height: 4,
            decoration: const BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  sevColor.withValues(alpha: 0.25),
                                  AppColors.accentPurple.withValues(alpha: 0.15),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: sevColor.withValues(alpha: 0.4)),
                            ),
                            child: Icon(categoryIcon, color: sevColor, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'incident_type_label'.tr.toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white38,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  _getCategoryLocalized(incType),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Severity Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: sevColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: sevColor.withValues(alpha: 0.45)),
                      ),
                      child: Text(
                        '● ${sev.toUpperCase()} ${'severity_label'.tr.toUpperCase()}',
                        style: TextStyle(
                          color: sevColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Divider(color: Colors.white10, height: 1),
                const SizedBox(height: 12),

                // Recorded Date & Disruption Level
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(Icons.access_time_rounded, color: Colors.white38, size: 14),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _formatFullDate(item.reportedAt),
                              style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (disruptionText.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: kFieldBg,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Text(
                          disruptionText,
                          style: const TextStyle(color: Colors.white60, fontSize: 10.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- 3. Environmental Context & Affected Parties ----------------
  Widget _buildEnvironmentalCard(DriverIncidentItem item) {
    final weather = item.weatherConditions ?? 'Clear';
    final road = item.roadType ?? 'City Street';

    return Container(
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
            children: [
              const Icon(Icons.wb_sunny_outlined, color: kOrange, size: 17),
              const SizedBox(width: 8),
              Text(
                'env_context_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Weather & Road Type Grid
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'weather_label'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(_getWeatherIcon(weather), color: Colors.amber, size: 14),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              _getWeatherLocalized(weather),
                              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'road_type_label'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.add_road_rounded, color: AppColors.accentPurple, size: 14),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              _getRoadTypeLocalized(road),
                              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Affected Parties Chips
          if (item.affectedParties.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'affected_parties_title'.tr,
              style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: item.affectedParties.map((party) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accentPurple.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.accentPurple.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.person_pin_circle_outlined, color: AppColors.accentPurple, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        _getAffectedPartyLocalized(party),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- 4. Location & GPS Telemetry Card ----------------
  Widget _buildLocationGpsCard(DriverIncidentItem item) {
    final locAddress = item.locationName ?? item.location?.address ?? 'incident_gps_coords'.tr;
    final hasCoords = item.latitude != null && item.longitude != null;
    final lat = item.latitude ?? 20.5937;
    final lng = item.longitude ?? 78.9629;

    return Container(
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
            children: [
              const Icon(Icons.location_on_rounded, color: kBlue, size: 18),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'loc_address_label'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 5,),
                  if (hasCoords)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: kGreen.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: kGreen.withValues(alpha: 0.35)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.gps_fixed, color: kGreen, size: 11),
                          const SizedBox(width: 4),
                          Text(
                            'gps_recorded'.tr,
                            style: const TextStyle(color: kGreen, fontSize: 9.5, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Address Text
          Text(
            locAddress,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600, height: 1.35),
          ),

          if (item.landmark != null && item.landmark!.isNotEmpty) ...[
            const SizedBox(height: 5),
            Row(
              children: [
                const Icon(Icons.flag_outlined, color: Colors.white38, size: 13),
                const SizedBox(width: 5),
                Text('${'landmark_label'.tr}: ', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                Expanded(
                  child: Text(
                    item.landmark!,
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],

          if (hasCoords) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.explore_outlined, color: Colors.white38, size: 13),
                  const SizedBox(width: 6),
                  Text(
                    '${'lat_label'.tr}: ${lat.toStringAsFixed(5)}, ${'lng_label'.tr}: ${lng.toStringAsFixed(5)}',
                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Mini Map Preview
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                height: 150,
                child: Stack(
                  children: [
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: LatLng(lat, lng),
                        initialZoom: 15.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.none,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.vmovexa.driver',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: LatLng(lat, lng),
                              width: 38,
                              height: 38,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: AppTheme.primaryGradient,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.5),
                                      blurRadius: 6,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: const Icon(Icons.location_on, color: Colors.white, size: 22),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    // Tap overlay to open in Google Maps
                    Positioned.fill(
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => _openGoogleMaps(lat, lng),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Open in Google Maps button with primaryGradient
            InkWell(
              onTap: () => _openGoogleMaps(lat, lng),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentPurple.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.map_outlined, color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'open_google_maps'.tr,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- 5. Emergency Medical & Casualty Box ----------------
  Widget _buildMedicalCasualtyCard(DriverIncidentItem item) {
    final hasCasualty = item.hasCasualties;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: hasCasualty ? kRed.withValues(alpha: 0.08) : kCardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasCasualty ? kRed.withValues(alpha: 0.45) : kBorder,
          width: hasCasualty ? 1.2 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emergency_rounded, color: kRed, size: 18),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'medical_casualty_title'.tr,
                    style: TextStyle(
                      color: hasCasualty ? Colors.white : Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 5,),
                  if (hasCasualty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: kRed.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: kRed),
                      ),
                      child: Text(
                        'casualties_alert'.tr.toUpperCase(),
                        style: const TextStyle(color: kRed, fontSize: 9.5, fontWeight: FontWeight.w900),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 4-grid: Fatalities, Injured, Hospital, Ambulance
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: item.deadCasualty > 0 ? kRed.withValues(alpha: 0.4) : Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('fatalities_label'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(
                        '${item.deadCasualty}',
                        style: TextStyle(
                          color: item.deadCasualty > 0 ? kRed : Colors.white70,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: item.injuredCount > 0 ? kOrange.withValues(alpha: 0.4) : Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('injured_count_label'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 3),
                      Text(
                        '${item.injuredCount}',
                        style: TextStyle(
                          color: item.injuredCount > 0 ? kOrange : Colors.white70,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Hospital & Ambulance Details
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.local_hospital_outlined, color: Colors.white54, size: 14),
                    const SizedBox(width: 8),
                    Text('${'hospital_name_label'.tr}: ', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    Expanded(
                      child: Text(
                        (item.hospitalName != null && item.hospitalName!.isNotEmpty) ? item.hospitalName! : 'none_specified'.tr,
                        style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.airport_shuttle_outlined, color: Colors.white54, size: 14),
                    const SizedBox(width: 8),
                    Text('${'ambulance_dispatch_label'.tr}: ', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    Expanded(
                      child: Text(
                        item.ambulanceAssigned
                            ? '${'assigned_label'.tr} ${(item.ambulanceTiming != null && item.ambulanceTiming!.isNotEmpty) ? "(${item.ambulanceTiming})" : ""}'
                            : 'not_assigned_label'.tr,
                        style: TextStyle(
                          color: item.ambulanceAssigned ? kGreen : Colors.white70,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- 6. Police & Towing Assistance Card ----------------
  Widget _buildAssistanceCard(DriverIncidentItem item) {
    return Container(
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
            children: [
              const Icon(Icons.security_rounded, color: kBlue, size: 18),
              const SizedBox(width: 8),
              Text(
                'police_assistance_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              // Police Dispatch
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'police_label'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.policeNotified
                            ? (item.policeStationName != null && item.policeStationName!.isNotEmpty
                                ? '${'yes_label'.tr} (${item.policeStationName})'
                                : '${'yes_label'.tr} (FIR Lodged)')
                            : 'no_police_dispatch'.tr,
                        style: TextStyle(
                          color: item.policeNotified ? kBlue : Colors.white70,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Towing Request
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'towing_label'.tr,
                        style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.towingRequested ? 'requested_tow_truck'.tr : 'no_towing_requested'.tr,
                        style: TextStyle(
                          color: item.towingRequested ? kOrange : Colors.white70,
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          if (item.contactNumber != null && item.contactNumber!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.phone_in_talk_outlined, color: kGreen, size: 14),
                  const SizedBox(width: 8),
                  Text('${'contact_info_label'.tr}: ', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                  Expanded(
                    child: Text(
                      item.contactNumber!,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- 7. Description & Action Taken ----------------
  Widget _buildDescriptionActionCard(DriverIncidentItem item) {
    return Container(
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
            children: [
              const Icon(Icons.notes_rounded, color: AppColors.accentPurple, size: 18),
              const SizedBox(width: 8),
              Text(
                'incident_description_title'.tr,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            (item.description != null && item.description!.isNotEmpty)
                ? item.description!
                : 'no_additional_description'.tr,
            style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.45),
          ),

          if (item.immediateAction != null && item.immediateAction!.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(color: Colors.white10, height: 1),
            const SizedBox(height: 10),
            Text(
              'immediate_action_title'.tr,
              style: const TextStyle(color: Colors.white38, fontSize: 10.5, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              item.immediateAction!,
              style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4, fontWeight: FontWeight.w500),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- 8. Photo Gallery ----------------
  Widget _buildPhotoGallery(DriverIncidentItem item) {
    return Container(
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
              Row(
                children: [
                  const Icon(Icons.photo_library_outlined, color: Colors.white70, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'photo_evidence_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                '${item.photos.length} ${'attached_files_count'.tr}',
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: item.photos.asMap().entries.map((entry) {
              final idx = entry.key;
              final url = entry.value;
              final fullUrl = url.startsWith('http') ? url : '${ApiConstants.baseUrl.replaceAll('/api/v1', '')}$url';
              return GestureDetector(
                onTap: () => _openImagePreview(context, fullUrl),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 90,
                    height: 90,
                    color: kFieldBg,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          fullUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Icon(Icons.broken_image, color: Colors.white38),
                          ),
                        ),
                        Positioned(
                          bottom: 4,
                          left: 4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.75),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '#${idx + 1}',
                              style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ---------------- 9. Video Gallery ----------------
  Widget _buildVideoGallery(DriverIncidentItem item) {
    return Container(
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
              Row(
                children: [
                  const Icon(Icons.video_library_outlined, color: AppColors.accentPurple, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'video_recordings_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                '${item.videos.length} ${'attached_files_count'.tr}',
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Column(
            children: item.videos.asMap().entries.map((entry) {
              final idx = entry.key;
              final vUrl = entry.value;
              final fileName = vUrl.split('/').last;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: kFieldBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.play_circle_fill_rounded, color: AppColors.accentPurple, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'video_index'.trParams({'index': '${idx + 1}'}),
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            fileName,
                            style: const TextStyle(color: Colors.white54, fontSize: 10.5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ---------------- 10. Control Room & Clearance Audit ----------------
  Widget _buildClearanceAuditCard(DriverIncidentItem item, String stLabel, Color stColor) {
    return Container(
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
            children: [
              const Icon(Icons.verified_user_outlined, color: kBlue, size: 18),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'control_room_audit_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 5,),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: stColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: stColor.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      stLabel,
                      style: TextStyle(color: stColor, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Voice contact & Site recovery
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('voice_contact_label'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        item.contactedDriver ? 'driver_contacted_verified'.tr : 'awaiting_contact_call'.tr,
                        style: TextStyle(
                          color: item.contactedDriver ? kBlue : Colors.amber,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (item.contactNotes != null && item.contactNotes!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          '"${item.contactNotes}"',
                          style: const TextStyle(color: Colors.white60, fontSize: 10, fontStyle: FontStyle.italic),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: kFieldBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('site_recovery_label'.tr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        item.recoveredAt != null ? '${'site_recovered'.tr} (${_formatFullDate(item.recoveredAt)})' : 'pending_site_recovery'.tr,
                        style: TextStyle(
                          color: item.recoveredAt != null ? kGreen : Colors.white60,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Clearance Officer
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: kFieldBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.admin_panel_settings_outlined, color: Colors.white54, size: 15),
                const SizedBox(width: 8),
                Text('${'clearance_officer_label'.tr}: ', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                Expanded(
                  child: Text(
                    item.resolverName ?? 'super_admin_clearance_pending'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          // Super Admin Final Resolution Notes
          if (item.resolution != null && item.resolution!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: kGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kGreen.withValues(alpha: 0.35)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'final_resolution_report'.tr,
                    style: const TextStyle(color: kGreen, fontSize: 11, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.resolution!,
                    style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4),
                  ),
                  if (item.resolvedAt != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '${'resolved_on_label'.tr}: ${_formatFullDate(item.resolvedAt)}',
                      style: const TextStyle(color: Colors.white54, fontSize: 10),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ---------------- 11. Step-by-Step Activity & Audit Trail Timeline ----------------
  Widget _buildActivityTimelineCard(DriverIncidentItem item) {
    return Container(
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
              Row(
                children: [
                  const Icon(Icons.timeline_rounded, color: AppColors.accentPurple, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'action_timeline_title'.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Text(
                '${item.activityLogs.length}',
                style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 14),

          Column(
            children: item.activityLogs.asMap().entries.map((entry) {
              final isLast = entry.key == item.activityLogs.length - 1;
              final log = entry.value;
              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Timeline indicator column
                    Column(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: kBlue,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                        if (!isLast)
                          Expanded(
                            child: Container(
                              width: 1.5,
                              color: Colors.white12,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 12),

                    // Log content
                    Expanded(
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: kFieldBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    log.description ?? 'action_logged'.tr,
                                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                if (log.createdAt != null)
                                  Text(
                                    _formatFullDate(log.createdAt),
                                    style: const TextStyle(color: Colors.white38, fontSize: 9.5),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text('${'by_actor'.tr} ', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                                Text(
                                  log.actorName ?? 'System Operator',
                                  style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: Colors.white10,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    log.actorRole ?? 'Staff',
                                    style: const TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            if (log.oldStatus != null && log.newStatus != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                '${'status_changed_to'.tr}: ${log.oldStatus} → ${log.newStatus}',
                                style: const TextStyle(color: kGreen, fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                            ],
                            if (log.notes != null && log.notes!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                '"${log.notes}"',
                                style: const TextStyle(color: Colors.white60, fontSize: 10, fontStyle: FontStyle.italic),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ---------------- 12. Bottom Actions ----------------
  Widget _buildBottomActions() {
    return Column(
      children: [
        InkWell(
          onTap: () => Get.back(),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accentPurple.withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 17),
                const SizedBox(width: 8),
                Text(
                  'back_to_incidents'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------- Helpers & Modals ----------------
  void _openImagePreview(BuildContext context, String imageUrl) {
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: Alignment.topRight,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 24),
                onPressed: () => Get.back(),
              ),
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.network(
                imageUrl,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => Container(
                  padding: const EdgeInsets.all(20),
                  color: kCardBg,
                  child: Text('could_not_load_image'.tr, style: const TextStyle(color: Colors.white)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatFullDate(String? raw) {
    if (raw == null || raw.isEmpty) return 'Recent';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      final minute = dt.minute.toString().padLeft(2, '0');
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} · ${hour12.toString().padLeft(2, '0')}:$minute $period';
    } catch (_) {
      return raw;
    }
  }

  IconData _getIncidentIcon(String incType) {
    final t = incType.toLowerCase();
    if (t.contains('accident')) return Icons.warning_amber_rounded;
    if (t.contains('breakdown')) return Icons.car_repair_rounded;
    if (t.contains('road')) return Icons.add_road_rounded;
    if (t.contains('traffic')) return Icons.traffic_rounded;
    if (t.contains('passenger')) return Icons.people_outline_rounded;
    if (t.contains('infra')) return Icons.build_circle_outlined;
    if (t.contains('safety')) return Icons.shield_outlined;
    return Icons.report_problem_outlined;
  }

  IconData _getWeatherIcon(String weather) {
    final w = weather.toLowerCase();
    if (w.contains('rain')) return Icons.grain_rounded;
    if (w.contains('fog') || w.contains('smog')) return Icons.cloud_queue_rounded;
    if (w.contains('night') || w.contains('dark')) return Icons.nightlight_round;
    if (w.contains('storm') || w.contains('wind')) return Icons.air_rounded;
    return Icons.wb_sunny_rounded;
  }

  String _formatDisruptionLevel(String? lvl) {
    if (lvl == null || lvl.isEmpty || lvl == 'none') return 'driver_incident.traffic_none'.tr;
    final l = lvl.toLowerCase();
    if (l == 'minor') return 'driver_incident.traffic_minor'.tr;
    if (l == 'lane_blocked') return 'driver_incident.traffic_lane_blocked'.tr;
    if (l == 'gridlock' || l == 'total') return 'driver_incident.traffic_gridlock'.tr;
    return lvl.replaceAll('_', ' ').capitalizeFirst ?? lvl;
  }

  String _getCategoryLocalized(String cat) {
    final c = cat.toLowerCase();
    if (c.contains('accident')) return 'incident_accident'.tr;
    if (c.contains('breakdown')) return 'incident_breakdown'.tr;
    if (c.contains('road')) return 'incident_road_condition'.tr;
    if (c.contains('traffic')) return 'incident_traffic_issue'.tr;
    if (c.contains('passenger')) return 'incident_passenger_issue'.tr;
    if (c.contains('infra')) return 'incident_infrastructure'.tr;
    if (c.contains('safety')) return 'incident_safety_concern'.tr;
    return 'incident_other'.tr;
  }

  String _getWeatherLocalized(String weather) {
    final w = weather.toLowerCase();
    if (w.contains('clear')) return 'driver_incident.weather_clear'.tr;
    if (w.contains('rain')) return 'driver_incident.weather_rain'.tr;
    if (w.contains('fog') || w.contains('smog')) return 'driver_incident.weather_fog'.tr;
    if (w.contains('night') || w.contains('dark')) return 'driver_incident.weather_night'.tr;
    if (w.contains('storm') || w.contains('wind')) return 'driver_incident.weather_storm'.tr;
    return weather;
  }

  String _getRoadTypeLocalized(String road) {
    final r = road.toLowerCase();
    if (r.contains('city')) return 'driver_incident.road_city_street'.tr;
    if (r.contains('highway')) return 'driver_incident.road_highway'.tr;
    if (r.contains('bridge') || r.contains('flyover')) return 'driver_incident.road_bridge'.tr;
    if (r.contains('bus') || r.contains('bay')) return 'driver_incident.road_bus_bay'.tr;
    if (r.contains('depot')) return 'driver_incident.road_depot'.tr;
    return road;
  }

  String _getAffectedPartyLocalized(String party) {
    final p = party.toLowerCase();
    if (p.contains('driver')) return 'affected_driver'.tr;
    if (p.contains('passenger')) return 'affected_passengers'.tr;
    if (p.contains('vehicle') || p.contains('bus')) return 'affected_vehicle'.tr;
    if (p.contains('infra')) return 'affected_infrastructure'.tr;
    return 'affected_other'.tr;
  }
}
