import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';
import 'package:vmovexa/app/theme/app_colors.dart';

class ClientAddressMapPicker extends StatefulWidget {
  final TextEditingController searchController;
  final TextEditingController addressController;
  final TextEditingController cityController;
  final TextEditingController stateController;
  final TextEditingController pincodeController;
  final double? initialLat;
  final double? initialLng;
  final Function(double lat, double lng, String address, String city, String state, String pincode)? onLocationChanged;

  const ClientAddressMapPicker({
    super.key,
    required this.searchController,
    required this.addressController,
    required this.cityController,
    required this.stateController,
    required this.pincodeController,
    this.initialLat,
    this.initialLng,
    this.onLocationChanged,
  });

  @override
  State<ClientAddressMapPicker> createState() => _ClientAddressMapPickerState();
}

class _ClientAddressMapPickerState extends State<ClientAddressMapPicker> {
  final MapController _mapController = MapController();
  final List<GooglePlaceItemModel> _predictions = [];
  bool _isLoadingSearch = false;
  bool _showDropdown = false;
  Timer? _debounceTimer;

  // Default coordinates centered on India (Indore/Central India default: 22.7196, 75.8577)
  late double _currentLat;
  late double _currentLng;
  bool _hasCustomPin = false;

  @override
  void initState() {
    super.initState();
    _currentLat = (widget.initialLat != null && widget.initialLat != 0.0) ? widget.initialLat! : 22.7196;
    _currentLng = (widget.initialLng != null && widget.initialLng != 0.0) ? widget.initialLng! : 75.8577;
    _hasCustomPin = (widget.initialLat != null && widget.initialLat != 0.0);
  }

  void _onSearchQueryChanged(String query) {
    if (_debounceTimer?.isActive ?? false) _debounceTimer?.cancel();

    if (query.trim().length < 2) {
      setState(() {
        _predictions.clear();
        _showDropdown = false;
        _isLoadingSearch = false;
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 350), () async {
      setState(() {
        _isLoadingSearch = true;
      });

      try {
        final res = await FleetService.to.searchGooglePlaces(query.trim());
        if (mounted) {
          setState(() {
            _predictions.clear();
            if (res.isSuccess && res.data != null) {
              _predictions.addAll(res.data!);
            }
            _showDropdown = _predictions.isNotEmpty;
            _isLoadingSearch = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _predictions.clear();
            _showDropdown = false;
            _isLoadingSearch = false;
          });
        }
      }
    });
  }

  void _selectPlace(GooglePlaceItemModel place) {
    final lat = place.latitude ?? _currentLat;
    final lng = place.longitude ?? _currentLng;

    setState(() {
      _currentLat = lat;
      _currentLng = lng;
      _hasCustomPin = true;
      _showDropdown = false;
      _predictions.clear();
      widget.searchController.text = place.name;
      if (place.formattedAddress.isNotEmpty) {
        widget.addressController.text = place.formattedAddress;
      }
      if (place.city != null && place.city!.isNotEmpty) {
        widget.cityController.text = place.city!;
      }
      if (place.state != null && place.state!.isNotEmpty) {
        widget.stateController.text = place.state!;
      }
      if (place.pincode != null && place.pincode!.isNotEmpty) {
        widget.pincodeController.text = place.pincode!;
      }
    });

    _mapController.move(LatLng(lat, lng), 15.0);

    widget.onLocationChanged?.call(
      lat,
      lng,
      widget.addressController.text,
      widget.cityController.text,
      widget.stateController.text,
      widget.pincodeController.text,
    );
  }

  Future<void> _reverseGeocode(double lat, double lng) async {
    setState(() {
      _currentLat = lat;
      _currentLng = lng;
      _hasCustomPin = true;
    });

    try {
      final uri = Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng');
      final res = await http.get(uri, headers: {'User-Agent': 'VmovexaDOOHApp/1.0'});
      if (res.statusCode == 200 && mounted) {
        final data = jsonDecode(res.body);
        if (data is Map<String, dynamic>) {
          final addressMap = data['address'] as Map<String, dynamic>?;
          final displayName = data['display_name']?.toString() ?? '';
          final city = addressMap?['city'] ?? addressMap?['town'] ?? addressMap?['village'] ?? addressMap?['county'] ?? '';
          final state = addressMap?['state'] ?? '';
          final postcode = addressMap?['postcode'] ?? '';

          setState(() {
            if (displayName.isNotEmpty) {
              widget.addressController.text = displayName;
              widget.searchController.text = displayName;
            }
            if (city.isNotEmpty) widget.cityController.text = city;
            if (state.isNotEmpty) widget.stateController.text = state;
            if (postcode.isNotEmpty) widget.pincodeController.text = postcode;
          });
        }
      }
    } catch (_) {}

    widget.onLocationChanged?.call(
      lat,
      lng,
      widget.addressController.text,
      widget.cityController.text,
      widget.stateController.text,
      widget.pincodeController.text,
    );
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header info
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.location_on_rounded, color: Color(0xFF3B82F6), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Customer Business Location & Map Geocoding',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Search landmark or tap on map to drop pin for client address',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),
              ),
              if (widget.cityController.text.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    widget.cityController.text,
                    style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),

          // Search Box with autocomplete
          Stack(
            clipBehavior: Clip.none,
            children: [
              TextField(
                controller: widget.searchController,
                onChanged: _onSearchQueryChanged,
                style: const TextStyle(color: Colors.white, fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'Search client office, shop, landmark, or city in India...',
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 18),
                  suffixIcon: _isLoadingSearch
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF8B5CF6)),
                          ),
                        )
                      : (widget.searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: AppColors.textMuted, size: 16),
                              onPressed: () {
                                widget.searchController.clear();
                                setState(() {
                                  _predictions.clear();
                                  _showDropdown = false;
                                });
                              },
                            )
                          : null),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: Color(0xFF8B5CF6)),
                  ),
                ),
              ),

              // Autocomplete suggestions dropdown
              if (_showDropdown && _predictions.isNotEmpty)
                Positioned(
                  top: 50,
                  left: 0,
                  right: 0,
                  child: Container(
                    constraints: const BoxConstraints(maxHeight: 200),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      itemCount: _predictions.length,
                      separatorBuilder: (_, _) => const Divider(color: Color(0xFF334155), height: 1),
                      itemBuilder: (context, index) {
                        final p = _predictions[index];
                        return ListTile(
                          dense: true,
                          visualDensity: VisualDensity.compact,
                          leading: const Icon(Icons.place_rounded, color: Color(0xFF3B82F6), size: 16),
                          title: Text(p.name, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          subtitle: Text(p.formattedAddress, style: const TextStyle(color: AppColors.textMuted, fontSize: 9.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                          onTap: () => _selectPlace(p),
                        );
                      },
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Interactive Map Box
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: LatLng(_currentLat, _currentLng),
                    initialZoom: 14.0,
                    onTap: (tapPosition, point) {
                      _reverseGeocode(point.latitude, point.longitude);
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.vmovexa.app',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(_currentLat, _currentLng),
                          width: 44,
                          height: 44,
                          child: GestureDetector(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF2563EB),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.4),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.business_rounded, color: Colors.white, size: 14),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                // Pin Hint Overlay
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.touch_app_rounded, color: Color(0xFF60A5FA), size: 12),
                        const SizedBox(width: 4),
                        Text(
                          _hasCustomPin
                              ? 'Lat: ${_currentLat.toStringAsFixed(4)}, Lng: ${_currentLng.toStringAsFixed(4)}'
                              : 'Tap anywhere on map to drop pin',
                          style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Structured Address Fields
          const Text(
            'Street Address / Building *',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: widget.addressController,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'Office/Shop No, Building Name, Street, Landmark',
              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              filled: true,
              fillColor: const Color(0xFF0F172A),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
            ),
          ),
          const SizedBox(height: 10),

          // City, State, Pincode in 3 columns
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('City *', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: widget.cityController,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        hintText: 'City',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('State', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: widget.stateController,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        hintText: 'State',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Pincode', style: TextStyle(color: AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: widget.pincodeController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                      decoration: InputDecoration(
                        hintText: 'Pincode',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.cardBorder)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
