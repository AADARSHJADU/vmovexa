import 'package:flutter/material.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class RouteMapViewerWidget extends StatefulWidget {
  final double? startLat;
  final double? startLng;
  final double? endLat;
  final double? endLng;
  final List<Map<String, dynamic>> stops;
  final String? polyline;
  final double? distanceKm;
  final int? durationMinutes;
  final VoidCallback? onRecalculate;
  final bool isComputing;

  const RouteMapViewerWidget({
    super.key,
    this.startLat,
    this.startLng,
    this.endLat,
    this.endLng,
    this.stops = const [],
    this.polyline,
    this.distanceKm,
    this.durationMinutes,
    this.onRecalculate,
    this.isComputing = false,
  });

  @override
  State<RouteMapViewerWidget> createState() => _RouteMapViewerWidgetState();
}

class _RouteMapViewerWidgetState extends State<RouteMapViewerWidget> {
  String _mapType = 'roadmap'; // 'roadmap', 'satellite', 'terrain'

  bool get _hasValidEndpoints =>
      widget.startLat != null &&
      widget.startLng != null &&
      widget.endLat != null &&
      widget.endLng != null &&
      widget.startLat != 0.0 &&
      widget.startLng != 0.0 &&
      widget.endLat != 0.0 &&
      widget.endLng != 0.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 230,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // 1. Map Image or Placeholder
          Positioned.fill(
            child: _hasValidEndpoints
                ? _buildMapImage()
                : _buildPlaceholder(),
          ),

          // 2. Computing Overlay Loader
          if (widget.isComputing)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.6),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          color: Color(0xFF6366F1),
                          strokeWidth: 2.5,
                        ),
                      ),
                      SizedBox(height: 10),
                      Text(
                        'Computing Driving Route via Google APIs...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // 3. Top Controls: Map Type Toggle
          if (_hasValidEndpoints)
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B).withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildTypeButton('Map', 'roadmap'),
                    _buildTypeButton('Sat', 'satellite'),
                    _buildTypeButton('Terrain', 'terrain'),
                  ],
                ),
              ),
            ),

          // 4. Bottom Metrics Badge Overlay: Distance • Duration
          if (_hasValidEndpoints && widget.distanceKm != null && widget.distanceKm! > 0)
            Positioned(
              bottom: 10,
              left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      '${widget.distanceKm} km',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (widget.durationMinutes != null && widget.durationMinutes! > 0) ...[
                      const Text(' • ', style: TextStyle(color: Color(0xFF64748B))),
                      Text(
                        '~${widget.durationMinutes} mins',
                        style: const TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

          // 5. Recalculate Button
          if (_hasValidEndpoints && widget.onRecalculate != null)
            Positioned(
              bottom: 10,
              right: 10,
              child: InkWell(
                onTap: widget.isComputing ? null : widget.onRecalculate,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF9333EA).withValues(alpha: 0.35),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.refresh_rounded, color: Colors.white, size: 14),
                      SizedBox(width: 4),
                      Text(
                        'Recalculate',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
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

  Widget _buildTypeButton(String label, String type) {
    final isSelected = _mapType == type;
    return InkWell(
      onTap: () {
        setState(() {
          _mapType = type;
        });
      },
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildMapImage() {
    final mapUrl = FleetService.to.buildStaticMapUrl(
      startLat: widget.startLat!,
      startLng: widget.startLng!,
      endLat: widget.endLat!,
      endLng: widget.endLng!,
      stops: widget.stops,
      polyline: widget.polyline,
      mapType: _mapType,
      width: 640,
      height: 340,
    );

    return Image.network(
      mapUrl,
      fit: BoxFit.cover,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Center(
          child: CircularProgressIndicator(
            value: progress.expectedTotalBytes != null
                ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                : null,
            color: const Color(0xFF6366F1),
            strokeWidth: 2,
          ),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: const Color(0xFF0F172A),
          padding: const EdgeInsets.all(16),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.map_outlined, color: Color(0xFF64748B), size: 32),
                const SizedBox(height: 6),
                const Text(
                  'Google Maps Static Preview',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Origin: ${widget.startLat?.toStringAsFixed(4)}, ${widget.startLng?.toStringAsFixed(4)} ➔ Destination: ${widget.endLat?.toStringAsFixed(4)}, ${widget.endLng?.toStringAsFixed(4)}',
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFF0F172A),
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.alt_route_rounded, color: Color(0xFF475569), size: 36),
            SizedBox(height: 10),
            Text(
              'Live Corridor Map Preview',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Search and pick Origin & Destination stations to automatically draw the Google driving corridor and compute road distance.',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 11,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
