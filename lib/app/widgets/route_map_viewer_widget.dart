import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:vmovexa/app/utils/polyline_decoder.dart';
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
  final double height;

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
    this.height = 280,
  });

  @override
  State<RouteMapViewerWidget> createState() => _RouteMapViewerWidgetState();
}

class _RouteMapViewerWidgetState extends State<RouteMapViewerWidget> {
  final MapController _mapController = MapController();
  String _mapType = 'roadmap'; // 'roadmap', 'satellite', 'osm'
  List<LatLng> _decodedPolylinePoints = [];

  bool get _hasAnyCoordinates =>
      (widget.startLat != null && widget.startLat != 0.0) ||
      (widget.endLat != null && widget.endLat != 0.0);

  String _getTileUrl(String type) {
    switch (type) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'osm':
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  }

  @override
  void initState() {
    super.initState();
    _decodeCurrentPolyline();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fitRouteBounds();
    });
  }

  @override
  void didUpdateWidget(covariant RouteMapViewerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.polyline != widget.polyline) {
      _decodeCurrentPolyline();
    }
    if (oldWidget.startLat != widget.startLat ||
        oldWidget.startLng != widget.startLng ||
        oldWidget.endLat != widget.endLat ||
        oldWidget.endLng != widget.endLng ||
        oldWidget.stops.length != widget.stops.length ||
        oldWidget.polyline != widget.polyline) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _fitRouteBounds();
      });
    }
  }

  void _decodeCurrentPolyline() {
    if (widget.polyline != null && widget.polyline!.isNotEmpty) {
      _decodedPolylinePoints = decodePolyline(widget.polyline);
    } else {
      _decodedPolylinePoints = [];
    }
  }

  List<LatLng> _collectAllKeyPoints() {
    final points = <LatLng>[];

    if (widget.startLat != null &&
        widget.startLng != null &&
        widget.startLat != 0.0 &&
        widget.startLng != 0.0) {
      points.add(LatLng(widget.startLat!, widget.startLng!));
    }

    for (final s in widget.stops) {
      final sLat = double.tryParse((s['latitude'] ?? s['lat'] ?? '').toString());
      final sLng = double.tryParse((s['longitude'] ?? s['lng'] ?? '').toString());
      if (sLat != null && sLng != null && sLat != 0.0 && sLng != 0.0) {
        points.add(LatLng(sLat, sLng));
      }
    }

    if (widget.endLat != null &&
        widget.endLng != null &&
        widget.endLat != 0.0 &&
        widget.endLng != 0.0) {
      points.add(LatLng(widget.endLat!, widget.endLng!));
    }

    return points;
  }

  void _fitRouteBounds() {
    if (!mounted) return;

    final keyPoints = _collectAllKeyPoints();
    final allPoints = <LatLng>[...keyPoints];

    if (_decodedPolylinePoints.isNotEmpty) {
      allPoints.addAll(_decodedPolylinePoints);
    }

    if (allPoints.isEmpty) return;

    try {
      if (allPoints.length == 1) {
        _mapController.move(allPoints.first, 14.0);
      } else {
        double minLat = allPoints.first.latitude;
        double maxLat = allPoints.first.latitude;
        double minLng = allPoints.first.longitude;
        double maxLng = allPoints.first.longitude;

        for (final p in allPoints) {
          if (p.latitude < minLat) minLat = p.latitude;
          if (p.latitude > maxLat) maxLat = p.latitude;
          if (p.longitude < minLng) minLng = p.longitude;
          if (p.longitude > maxLng) maxLng = p.longitude;
        }

        final bounds = LatLngBounds(
          LatLng(minLat, minLng),
          LatLng(maxLat, maxLng),
        );

        _mapController.fitCamera(
          CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.symmetric(horizontal: 45, vertical: 45),
          ),
        );
      }
    } catch (_) {
      // MapController might not be mounted yet
    }
  }

  LatLng _getInitialCenter() {
    if (widget.startLat != null &&
        widget.startLng != null &&
        widget.startLat != 0.0 &&
        widget.startLng != 0.0) {
      return LatLng(widget.startLat!, widget.startLng!);
    }
    if (widget.endLat != null &&
        widget.endLng != null &&
        widget.endLat != 0.0 &&
        widget.endLng != 0.0) {
      return LatLng(widget.endLat!, widget.endLng!);
    }
    // Default fallback center: Indore / Central India
    return const LatLng(22.7196, 75.8577);
  }

  @override
  Widget build(BuildContext context) {
    final hasPoints = _hasAnyCoordinates;

    return Container(
      width: double.infinity,
      height: widget.height,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // 1. Real Interactive FlutterMap
          if (hasPoints)
            Positioned.fill(
              child: _buildFlutterMap(),
            )
          else
            Positioned.fill(
              child: _buildPlaceholder(),
            ),

          // 2. Computing Overlay Loader
          if (widget.isComputing)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.65),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Color(0xFF38BDF8),
                            strokeWidth: 2.2,
                          ),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Calculating Driving Route...',
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
            ),

          // 3. Top-Right: Map Type Toggle
          if (hasPoints)
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.88),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildTypeButton('Map', 'roadmap'),
                    _buildTypeButton('Sat', 'satellite'),
                    _buildTypeButton('OSM', 'osm'),
                  ],
                ),
              ),
            ),

          // 4. Top-Left: Points Counter Badge
          if (hasPoints)
            Positioned(
              top: 10,
              left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.88),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${_collectAllKeyPoints().length} Route Points',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // 5. Bottom-Left: Distance & Duration Badge
          if (hasPoints && widget.distanceKm != null && widget.distanceKm! > 0)
            Positioned(
              bottom: 10,
              left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.92),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.alt_route_rounded, color: Color(0xFF38BDF8), size: 14),
                    const SizedBox(width: 6),
                    Text(
                      '${widget.distanceKm!.toStringAsFixed(1)} km',
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
                          color: Color(0xFF34D399),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

          // 6. Bottom-Right Controls: Zoom & Recalculate
          if (hasPoints)
            Positioned(
              bottom: 10,
              right: 10,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Re-center / Fit bounds button
                  InkWell(
                    onTap: _fitRouteBounds,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.88),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: const Icon(Icons.crop_free_rounded, color: Colors.white70, size: 16),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Recalculate button
                  if (widget.onRecalculate != null)
                    InkWell(
                      onTap: widget.isComputing ? null : widget.onRecalculate,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF9333EA).withValues(alpha: 0.35),
                              blurRadius: 6,
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
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFlutterMap() {
    final keyPoints = _collectAllKeyPoints();
    final center = _getInitialCenter();

    // Determine polyline points
    List<LatLng> polylinePoints = [];
    if (_decodedPolylinePoints.isNotEmpty) {
      polylinePoints = _decodedPolylinePoints;
    } else if (keyPoints.length >= 2) {
      polylinePoints = keyPoints;
    }

    // Build markers
    final markers = <Marker>[];

    // Origin Marker (Green 'A')
    if (widget.startLat != null &&
        widget.startLng != null &&
        widget.startLat != 0.0 &&
        widget.startLng != 0.0) {
      markers.add(
        Marker(
          point: LatLng(widget.startLat!, widget.startLng!),
          width: 36,
          height: 36,
          child: _buildPinBadge('A', const Color(0xFF10B981)),
        ),
      );
    }

    // Intermediate Stops Markers (Numbered '1', '2', '3'...)
    for (int i = 0; i < widget.stops.length; i++) {
      final s = widget.stops[i];
      final sLat = double.tryParse((s['latitude'] ?? s['lat'] ?? '').toString());
      final sLng = double.tryParse((s['longitude'] ?? s['lng'] ?? '').toString());
      if (sLat != null && sLng != null && sLat != 0.0 && sLng != 0.0) {
        markers.add(
          Marker(
            point: LatLng(sLat, sLng),
            width: 32,
            height: 32,
            child: _buildPinBadge('${i + 1}', const Color(0xFF6366F1)),
          ),
        );
      }
    }

    // Destination Marker (Red 'B')
    if (widget.endLat != null &&
        widget.endLng != null &&
        widget.endLat != 0.0 &&
        widget.endLng != 0.0) {
      markers.add(
        Marker(
          point: LatLng(widget.endLat!, widget.endLng!),
          width: 36,
          height: 36,
          child: _buildPinBadge('B', const Color(0xFFEF4444)),
        ),
      );
    }

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: center,
        initialZoom: 13.0,
        minZoom: 3.0,
        maxZoom: 19.0,
        interactionOptions: const InteractionOptions(
          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
        ),
      ),
      children: [
        // Tile Layer
        TileLayer(
          urlTemplate: _getTileUrl(_mapType),
          userAgentPackageName: 'com.vmovexa.app',
          maxZoom: 20,
        ),

        // Route Polyline Layer
        if (polylinePoints.isNotEmpty)
          PolylineLayer(
            polylines: [
              // Outer glow shadow
              Polyline(
                points: polylinePoints,
                color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                strokeWidth: 8.5,
                strokeCap: StrokeCap.round,
                strokeJoin: StrokeJoin.round,
              ),
              // Crisp vibrant route line
              Polyline(
                points: polylinePoints,
                color: const Color(0xFF3B82F6),
                strokeWidth: 4.5,
                strokeCap: StrokeCap.round,
                strokeJoin: StrokeJoin.round,
              ),
            ],
          ),

        // Markers Layer
        MarkerLayer(markers: markers),
      ],
    );
  }

  Widget _buildPinBadge(String label, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
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

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFF0F172A),
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.alt_route_rounded, color: Color(0xFF475569), size: 40),
            SizedBox(height: 10),
            Text(
              'Interactive Corridor Map Preview',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Select Origin & Destination stations to automatically draw the real-world driving corridor and calculate distance.',
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
