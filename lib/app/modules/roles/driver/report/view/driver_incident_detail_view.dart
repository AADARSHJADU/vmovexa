import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/data/models/driver_models.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';

class DriverIncidentDetailView extends StatefulWidget {
  const DriverIncidentDetailView({super.key});

  @override
  State<DriverIncidentDetailView> createState() => _DriverIncidentDetailViewState();
}

class _DriverIncidentDetailViewState extends State<DriverIncidentDetailView> {
  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kPurple = Color(0xFFB042FF);
  static const Color kBorder = Color(0x14FFFFFF);
  static const Color kRed = Color(0xFFFF4D4D);
  static const Color kOrange = Color(0xFFFF9500);
  static const Color kGreen = Color(0xFF2ECC71);
  static const Color kBlue = Color(0xFF3F7BF5);

  DriverIncidentItem? incident;
  bool isLoading = false;

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
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator(color: kPurple))
            : incident == null
                ? _buildNotFound()
                : _buildContent(),
      ),
    );
  }

  Widget _buildNotFound() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: Colors.white38, size: 40),
          const SizedBox(height: 12),
          const Text('Incident not found', style: TextStyle(color: Colors.white, fontSize: 16)),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => Get.back(),
            style: ElevatedButton.styleFrom(backgroundColor: kPurple),
            child: const Text('Back to Incidents'),
          ),
        ],
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
    String stLabel = 'Open';
    if (st == 'in_progress' || st == 'investigating') {
      stColor = Colors.amber;
      stLabel = 'In Progress';
    } else if (st == 'resolved' || st == 'closed') {
      stColor = kGreen;
      stLabel = 'Resolved';
    }

    final ticket = item.ticketNumber ?? (item.id != null ? 'INC-${item.id!.substring(0, item.id!.length > 6 ? 6 : item.id!.length)}' : 'INC');

    return Column(
      children: [
        // App Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => Get.back(),
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
                    Text(
                      ticket,
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                    const SizedBox(height: 1),
                    const Text('Incident Report Details', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: stColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: stColor.withOpacity(0.4)),
                ),
                child: Text(
                  stLabel,
                  style: TextStyle(color: stColor, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),

        // Scrollable content
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            children: [
              // Main Info Card
              Container(
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
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: sevColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: sevColor.withOpacity(0.4)),
                          ),
                          child: Text(
                            'SEVERITY: ${sev.toUpperCase()}',
                            style: TextStyle(color: sevColor, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        Text(
                          _formatFullDate(item.reportedAt),
                          style: const TextStyle(color: Colors.white38, fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      item.title ?? 'Incident',
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      (item.description != null && item.description!.isNotEmpty)
                          ? item.description!
                          : 'No additional description provided.',
                      style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Location Card
              if (item.location != null && item.location!.lat != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: kCardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: kBlue.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.location_on_outlined, color: kBlue, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Incident GPS Coordinates', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text(
                              'Lat: ${item.location!.lat!.toStringAsFixed(5)}, Lng: ${item.location!.lng!.toStringAsFixed(5)}',
                              style: const TextStyle(color: Colors.white54, fontSize: 11, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Resolution status card
              if (item.resolution != null && item.resolution!.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: kGreen.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: kGreen.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: kGreen, size: 18),
                          SizedBox(width: 8),
                          Text('Resolution & Admin Notes', style: TextStyle(color: kGreen, fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.resolution!,
                        style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
                      ),
                      if (item.resolvedAt != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          'Resolved on: ${_formatFullDate(item.resolvedAt)}',
                          style: const TextStyle(color: Colors.white38, fontSize: 10.5),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Photos Gallery
              if (item.mediaUrls.isNotEmpty) ...[
                Container(
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
                          const Text('Attached Media & Photos', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                          Text('${item.mediaUrls.length} file(s)', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: item.mediaUrls.map((url) {
                          final fullUrl = url.startsWith('http') ? url : '${ApiConstants.baseUrl.replaceAll('/api/v1', '')}$url';
                          return GestureDetector(
                            onTap: () => _openImagePreview(context, fullUrl),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                width: 90,
                                height: 90,
                                color: kFieldBg,
                                child: Image.network(
                                  fullUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(Icons.broken_image, color: Colors.white38),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              const SizedBox(height: 20),
            ],
          ),
        ),
      ],
    );
  }

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
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Get.back(),
              ),
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                imageUrl,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Text('Could not load image', style: TextStyle(color: Colors.white)),
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
      return '${dt.day}/${dt.month}/${dt.year} at ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }
}
