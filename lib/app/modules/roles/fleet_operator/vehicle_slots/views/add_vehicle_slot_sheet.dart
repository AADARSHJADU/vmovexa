import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controllers/vehicle_slots_controller.dart';

class AddVehicleSlotSheet extends StatefulWidget {
  const AddVehicleSlotSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddVehicleSlotSheet(),
    );
  }

  @override
  State<AddVehicleSlotSheet> createState() => _AddVehicleSlotSheetState();
}

class _AddVehicleSlotSheetState extends State<AddVehicleSlotSheet> {
  final _formKey = GlobalKey<FormState>();

  final _slotNameCtrl = TextEditingController(text: 'Corridor Peak Run');
  final _startTimeCtrl = TextEditingController(text: '08:00');
  final _endTimeCtrl = TextEditingController(text: '11:30');
  final _headwayCtrl = TextEditingController(text: '15');
  final _notesCtrl = TextEditingController();

  String? _selectedVehicleId;
  String? _selectedRouteId;
  String? _selectedDriverId;
  String _selectedShift = 'morning_peak';

  final List<String> _selectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  static const List<String> _weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  static const List<Map<String, String>> _shifts = [
    {'id': 'morning_peak', 'label': 'Morning Peak', 'desc': '07:00 - 11:30 Rush Hours'},
    {'id': 'regular_day', 'label': 'Regular Day', 'desc': '11:30 - 16:30 Normal Transit'},
    {'id': 'evening_peak', 'label': 'Evening Peak', 'desc': '16:30 - 20:30 Commuter Rush'},
    {'id': 'night_shuttle', 'label': 'Night Shuttle', 'desc': '20:30 - 00:00 Late Night'},
  ];

  Timer? _conflictDebounce;

  @override
  void initState() {
    super.initState();
    final ctrl = VehicleSlotsController.to;
    if (ctrl.vehicles.isNotEmpty) {
      _selectedVehicleId = ctrl.vehicles.first['id'].toString();
    }
    if (ctrl.routes.isNotEmpty) {
      _selectedRouteId = ctrl.routes.first['id'].toString();
    }
    if (ctrl.drivers.isNotEmpty) {
      _selectedDriverId = ctrl.drivers.first['id'].toString();
    }
    _triggerConflictCheck();
  }

  @override
  void dispose() {
    _conflictDebounce?.cancel();
    _slotNameCtrl.dispose();
    _startTimeCtrl.dispose();
    _endTimeCtrl.dispose();
    _headwayCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  void _triggerConflictCheck() {
    if (_selectedVehicleId == null) return;
    _conflictDebounce?.cancel();
    _conflictDebounce = Timer(const Duration(milliseconds: 350), () {
      VehicleSlotsController.to.checkConflict(
        vehicleId: _selectedVehicleId!,
        startTime: _startTimeCtrl.text.trim(),
        endTime: _endTimeCtrl.text.trim(),
        operatingDays: _selectedDays.join(','),
      );
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedVehicleId == null || _selectedRouteId == null) {
      Get.snackbar('Required', 'Please select a vehicle and route',
          backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(12));
      return;
    }

    final payload = {
      'slot_name': _slotNameCtrl.text.trim(),
      'vehicle_id': _selectedVehicleId,
      'route_id': _selectedRouteId,
      if (_selectedDriverId != null) 'driver_id': _selectedDriverId,
      'shift_type': _selectedShift,
      'start_time': _startTimeCtrl.text.trim(),
      'end_time': _endTimeCtrl.text.trim(),
      'operating_days': _selectedDays.join(','),
      'headway_minutes': int.tryParse(_headwayCtrl.text.trim()) ?? 15,
      'status': 'active',
      if (_notesCtrl.text.trim().isNotEmpty) 'notes': _notesCtrl.text.trim(),
    };

    final success = await VehicleSlotsController.to.createSlot(payload);
    if (success && mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final ctrl = VehicleSlotsController.to;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: Color(0xFF334155), width: 1.2)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            // Handle Bar
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFF475569),
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.calendar_month_rounded, color: Color(0xFF818CF8), size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Schedule Vehicle Slot',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'POST /api/v1/vehicle-slots (Collision-Protected)',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            const Divider(color: Color(0xFF1E293B), height: 1),

            // Real-Time Conflict Detection Banner
            Obx(() {
              final conflict = ctrl.conflictWarning.value;
              final isChecking = ctrl.isCheckingConflict.value;

              if (isChecking) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: const Color(0xFF6366F1).withValues(alpha: 0.1),
                  child: const Row(
                    children: [
                      SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF818CF8)),
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Checking timetable for overlapping shifts & collisions...',
                        style: TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontStyle: FontStyle.italic),
                      ),
                    ],
                  ),
                );
              }

              if (conflict != null && conflict.hasConflict) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.35)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Color(0xFFF87171), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          conflict.message ?? 'Vehicle double-booking detected during selected time window!',
                          style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11.5, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            }),

            // Form Inputs
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  children: [
                    // Slot Name
                    _buildTextField(
                      label: 'Slot Label / Name *',
                      controller: _slotNameCtrl,
                      hint: 'e.g. Morning Peak Red Line',
                      validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: 14),

                    // Vehicle & Route Dropdowns
                    _buildDropdown(
                      label: 'Assigned Vehicle *',
                      value: _selectedVehicleId,
                      items: ctrl.vehicles,
                      onChanged: (val) {
                        setState(() => _selectedVehicleId = val);
                        _triggerConflictCheck();
                      },
                    ),
                    const SizedBox(height: 14),

                    _buildDropdown(
                      label: 'Transit Corridor / Route *',
                      value: _selectedRouteId,
                      items: ctrl.routes,
                      onChanged: (val) => setState(() => _selectedRouteId = val),
                    ),
                    const SizedBox(height: 14),

                    _buildDropdown(
                      label: 'Primary Driver (Optional)',
                      value: _selectedDriverId,
                      items: ctrl.drivers,
                      onChanged: (val) => setState(() => _selectedDriverId = val),
                    ),
                    const SizedBox(height: 14),

                    // Shift Type Selector
                    _buildShiftSelector(),
                    const SizedBox(height: 14),

                    // Time Windows & Headway
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            label: 'Start Time *',
                            controller: _startTimeCtrl,
                            hint: '08:00',
                            onChanged: (_) => _triggerConflictCheck(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildTextField(
                            label: 'End Time *',
                            controller: _endTimeCtrl,
                            hint: '11:30',
                            onChanged: (_) => _triggerConflictCheck(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildTextField(
                            label: 'Headway (Mins)',
                            controller: _headwayCtrl,
                            hint: '15',
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Operating Days Multi-chips
                    _buildDaysSelector(),
                    const SizedBox(height: 14),

                    // Notes
                    _buildTextField(
                      label: 'Operational Notes',
                      controller: _notesCtrl,
                      hint: 'Special instructions, driver changeovers...',
                      maxLines: 2,
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Confirm Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                border: Border(top: BorderSide(color: Color(0xFF334155), width: 1)),
              ),
              child: Obx(() {
                final isSaving = VehicleSlotsController.to.isSaving.value;

                return SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isSaving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: isSaving
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                              )
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 18),
                                  SizedBox(width: 8),
                                  Text(
                                    'Register Slot Schedule',
                                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                ],
                              ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hint,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          onChanged: onChanged,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            filled: true,
            fillColor: const Color(0xFF1E293B),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF334155)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF334155)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF6366F1), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<Map<String, dynamic>> items,
    required void Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: items.any((i) => i['id'].toString() == value) ? value : (items.isNotEmpty ? items.first['id'].toString() : null),
              dropdownColor: const Color(0xFF1E293B),
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8)),
              items: items.map((item) {
                return DropdownMenuItem<String>(
                  value: item['id'].toString(),
                  child: Text(
                    item['label'].toString(),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildShiftSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Operating Shift Type *',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _shifts.map((s) {
            final isSelected = _selectedShift == s['id'];
            return GestureDetector(
              onTap: () => setState(() => _selectedShift = s['id']!),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF6366F1).withValues(alpha: 0.25) : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF818CF8) : const Color(0xFF334155),
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Text(
                  s['label']!,
                  style: TextStyle(
                    color: isSelected ? const Color(0xFF818CF8) : const Color(0xFF94A3B8),
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDaysSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Operating Days',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: _weekDays.map((d) {
            final isSelected = _selectedDays.contains(d);
            return GestureDetector(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    if (_selectedDays.length > 1) _selectedDays.remove(d);
                  } else {
                    _selectedDays.add(d);
                  }
                });
                _triggerConflictCheck();
              },
              child: Container(
                width: 40,
                height: 36,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF3B82F6).withValues(alpha: 0.3) : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF60A5FA) : const Color(0xFF334155),
                  ),
                ),
                child: Center(
                  child: Text(
                    d,
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF64748B),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

