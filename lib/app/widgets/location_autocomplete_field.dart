import 'dart:async';
import 'package:flutter/material.dart';
import 'package:vmovexa/app/data/models/fleet_models.dart';
import 'package:vmovexa/app/data/services/fleet_service.dart';

class LocationAutocompleteField extends StatefulWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final TextEditingController? latController;
  final TextEditingController? lngController;
  final TextEditingController? addressController;
  final TextEditingController? cityController;
  final TextEditingController? stateController;
  final Function(GooglePlaceItemModel place)? onPlaceSelected;
  final VoidCallback? onCleared;
  final Color accentColor;
  final bool required;

  const LocationAutocompleteField({
    super.key,
    required this.label,
    required this.hint,
    required this.controller,
    this.latController,
    this.lngController,
    this.addressController,
    this.cityController,
    this.stateController,
    this.onPlaceSelected,
    this.onCleared,
    this.accentColor = const Color(0xFF6366F1),
    this.required = false,
  });

  @override
  State<LocationAutocompleteField> createState() => _LocationAutocompleteFieldState();
}

class _LocationAutocompleteFieldState extends State<LocationAutocompleteField> {
  final List<GooglePlaceItemModel> _predictions = [];
  bool _isLoading = false;
  bool _showDropdown = false;
  bool _showManualCoords = false;
  Timer? _debounceTimer;

  void _onQueryChanged(String query) {
    if (_debounceTimer?.isActive ?? false) _debounceTimer?.cancel();

    if (query.trim().length < 2) {
      setState(() {
        _predictions.clear();
        _showDropdown = false;
        _isLoading = false;
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 350), () async {
      setState(() {
        _isLoading = true;
      });

      try {
        final res = await FleetService.to.searchGooglePlaces(query.trim());
        if (mounted) {
          setState(() {
            _predictions.clear();
            if (res.success && res.data != null) {
              _predictions.addAll(res.data!);
            }
            _showDropdown = _predictions.isNotEmpty;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _predictions.clear();
            _showDropdown = false;
            _isLoading = false;
          });
        }
      }
    });
  }

  void _selectPlace(GooglePlaceItemModel place) {
    widget.controller.text = place.name;
    if (widget.addressController != null && place.formattedAddress.isNotEmpty) {
      widget.addressController!.text = place.formattedAddress;
    }
    if (widget.latController != null && place.latitude != null) {
      widget.latController!.text = place.latitude.toString();
    }
    if (widget.lngController != null && place.longitude != null) {
      widget.lngController!.text = place.longitude.toString();
    }
    if (widget.cityController != null && place.city != null && place.city!.isNotEmpty) {
      widget.cityController!.text = place.city!;
    }
    if (widget.stateController != null && place.state != null && place.state!.isNotEmpty) {
      widget.stateController!.text = place.state!;
    }

    setState(() {
      _showDropdown = false;
      _predictions.clear();
    });

    if (widget.onPlaceSelected != null) {
      widget.onPlaceSelected!(place);
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label & Toggle Manual Coords
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  widget.label,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (widget.required)
                  const Text(' *', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
              ],
            ),
            if (widget.latController != null && widget.lngController != null)
              InkWell(
                onTap: () {
                  setState(() {
                    _showManualCoords = !_showManualCoords;
                  });
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Row(
                    children: [
                      Icon(
                        _showManualCoords ? Icons.tune_rounded : Icons.gps_fixed_rounded,
                        color: widget.accentColor,
                        size: 13,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _showManualCoords ? 'Hide Coords' : 'Edit Coords',
                        style: TextStyle(
                          color: widget.accentColor,
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
        const SizedBox(height: 6),

        // Search Input Field
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _showDropdown ? widget.accentColor : const Color(0xFF334155),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: widget.controller,
                onChanged: _onQueryChanged,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: widget.hint,
                  hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                  prefixIcon: Icon(Icons.search_rounded, color: widget.accentColor, size: 20),
                  suffixIcon: _isLoading
                      ? Container(
                          width: 16,
                          height: 16,
                          padding: const EdgeInsets.all(12),
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: widget.accentColor,
                          ),
                        )
                      : widget.controller.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, color: Color(0xFF94A3B8), size: 18),
                              onPressed: () {
                                widget.controller.clear();
                                if (widget.addressController != null) widget.addressController!.clear();
                                if (widget.latController != null) widget.latController!.clear();
                                if (widget.lngController != null) widget.lngController!.clear();
                                setState(() {
                                  _predictions.clear();
                                  _showDropdown = false;
                                });
                                if (widget.onCleared != null) widget.onCleared!();
                              },
                            )
                          : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),

              // Predictions Dropdown List
              if (_showDropdown && _predictions.isNotEmpty) ...[
                const Divider(height: 1, color: Color(0xFF334155)),
                Container(
                  constraints: const BoxConstraints(maxHeight: 220),
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E293B),
                    borderRadius: BorderRadius.vertical(bottom: Radius.circular(10)),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    itemCount: _predictions.length,
                    separatorBuilder: (_, _) => const Divider(height: 1, color: Color(0xFF334155)),
                    itemBuilder: (context, index) {
                      final place = _predictions[index];
                      return ListTile(
                        dense: true,
                        horizontalTitleGap: 8,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                        leading: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: widget.accentColor.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.location_on_rounded, color: widget.accentColor, size: 16),
                        ),
                        title: Text(
                          place.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              place.formattedAddress,
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (place.city != null || place.state != null) ...[
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  if (place.city != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      margin: const EdgeInsets.only(right: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF334155),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        place.city!,
                                        style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 9),
                                      ),
                                    ),
                                  if (place.state != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF334155),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        place.state!,
                                        style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 9),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ],
                        ),
                        onTap: () => _selectPlace(place),
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),

        // Manual Coordinates Inputs (when expanded)
        if (_showManualCoords && widget.latController != null && widget.lngController != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: widget.accentColor.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Latitude', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: widget.latController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'e.g. 22.7188',
                          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF334155))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF334155))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: widget.accentColor)),
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
                      const Text('Longitude', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: widget.lngController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'e.g. 75.8560',
                          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF334155))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF334155))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: widget.accentColor)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
