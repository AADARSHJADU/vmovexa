import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_work_orders_controller.dart';

class DispatchWorkOrderSheet extends StatefulWidget {
  const DispatchWorkOrderSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const DispatchWorkOrderSheet(),
    );
  }

  @override
  State<DispatchWorkOrderSheet> createState() => _DispatchWorkOrderSheetState();
}

class _DispatchWorkOrderSheetState extends State<DispatchWorkOrderSheet> {
  final _formKey = GlobalKey<FormState>();

  final _vehicleIdCtrl = TextEditingController(text: '1');
  final _technicianIdCtrl = TextEditingController(text: '1');
  final _issueCategoryCtrl = TextEditingController(text: 'Hardware Maintenance');
  final _descriptionCtrl = TextEditingController();
  final _instructionsCtrl = TextEditingController();
  final _slaHoursCtrl = TextEditingController(text: '24');
  final _etaCtrl = TextEditingController(text: '2 hours');

  String _selectedUrgency = 'normal';

  static const List<String> _urgencies = ['low', 'normal', 'high', 'critical'];
  static const List<Map<String, String>> _categories = [
    {'value': 'Hardware Maintenance', 'key': 'cat_hw_maintenance'},
    {'value': 'Display Screen Signal Loss', 'key': 'cat_display_loss'},
    {'value': 'GPS Calibration Fault', 'key': 'cat_gps_calib'},
    {'value': 'Power Surge & Fuse Tripped', 'key': 'cat_power_surge'},
    {'value': 'Edge Box Firmware Crash', 'key': 'cat_firmware_crash'},
    {'value': 'Wiring & Harness Damage', 'key': 'cat_wiring_damage'},
    {'value': 'Network & SIM Disconnection', 'key': 'cat_network_sim'},
  ];

  @override
  void dispose() {
    _vehicleIdCtrl.dispose();
    _technicianIdCtrl.dispose();
    _issueCategoryCtrl.dispose();
    _descriptionCtrl.dispose();
    _instructionsCtrl.dispose();
    _slaHoursCtrl.dispose();
    _etaCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final controller = TechWorkOrdersController.to;
    final vehicleId = int.tryParse(_vehicleIdCtrl.text.trim()) ?? 1;
    final technicianId = int.tryParse(_technicianIdCtrl.text.trim()) ?? 1;
    final slaHours = int.tryParse(_slaHoursCtrl.text.trim()) ?? 24;

    final success = await controller.dispatchOrder(
      vehicleId: vehicleId,
      technicianId: technicianId,
      issueCategory: _issueCategoryCtrl.text.trim(),
      urgency: _selectedUrgency,
      slaHours: slaHours,
      eta: _etaCtrl.text.trim().isNotEmpty ? _etaCtrl.text.trim() : null,
      description: _descriptionCtrl.text.trim().isNotEmpty ? _descriptionCtrl.text.trim() : null,
      instructions: _instructionsCtrl.text.trim().isNotEmpty ? _instructionsCtrl.text.trim() : null,
    );

    if (success && mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: Color(0xFF334155), width: 1.2),
        ),
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

            // Sheet Title
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
                    child: const Icon(
                      Icons.send_rounded,
                      color: Color(0xFF818CF8),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'dispatch_work_order_title'.tr,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
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

            // Form
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  children: [
                    // Vehicle ID & Tech ID Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildFormField(
                            label: 'vehicle_id_label'.tr,
                            controller: _vehicleIdCtrl,
                            keyboardType: TextInputType.number,
                            validator: (v) => (v == null || v.isEmpty) ? 'required_field'.tr : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildFormField(
                            label: 'technician_id_label'.tr,
                            controller: _technicianIdCtrl,
                            keyboardType: TextInputType.number,
                            validator: (v) => (v == null || v.isEmpty) ? 'required_field'.tr : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Issue Category Dropdown / Text
                    _buildCategoryDropdown(),
                    const SizedBox(height: 14),

                    // Urgency Pills
                    _buildUrgencySelector(),
                    const SizedBox(height: 14),

                    // SLA Hours & ETA
                    Row(
                      children: [
                        Expanded(
                          child: _buildFormField(
                            label: 'sla_target_hours_label'.tr,
                            controller: _slaHoursCtrl,
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildFormField(
                            label: 'estimated_arrival_eta_label'.tr,
                            controller: _etaCtrl,
                            hintText: 'eta_hint'.tr,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Issue Description
                    _buildFormField(
                      label: 'fault_description_label'.tr,
                      controller: _descriptionCtrl,
                      hintText: 'diagnosed_fault_hint'.tr,
                      maxLines: 2,
                    ),
                    const SizedBox(height: 14),

                    // Dispatch Engineering Instructions
                    _buildFormField(
                      label: 'engineering_instructions_label'.tr,
                      controller: _instructionsCtrl,
                      hintText: 'engineering_instructions_hint'.tr,
                      maxLines: 2,
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Submit Action Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                border: Border(
                  top: BorderSide(color: Color(0xFF334155), width: 1),
                ),
              ),
              child: Obx(() {
                final isSubmitting = TechWorkOrdersController.to.isSubmitting.value;

                return SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.flash_on_rounded, color: Colors.white, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'confirm_dispatch_notify_btn'.tr,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
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

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    String? hintText,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: hintText,
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

  Widget _buildCategoryDropdown() {
    final currentVal = _issueCategoryCtrl.text;
    final match = _categories.firstWhereOrNull((c) => c['value'] == currentVal) ?? _categories.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'issue_category_label'.tr,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
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
              value: match['value'],
              dropdownColor: const Color(0xFF1E293B),
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF94A3B8)),
              items: _categories.map((cat) {
                return DropdownMenuItem<String>(
                  value: cat['value'],
                  child: Text(
                    cat['key']!.tr,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _issueCategoryCtrl.text = val);
                }
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUrgencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'priority_urgency_label'.tr,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: _urgencies.map((urg) {
            final isSelected = _selectedUrgency == urg;
            Color color;
            switch (urg) {
              case 'critical':
                color = const Color(0xFFEF4444);
                break;
              case 'high':
                color = const Color(0xFFF97316);
                break;
              case 'normal':
                color = const Color(0xFF3B82F6);
                break;
              default:
                color = const Color(0xFF10B981);
            }

            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedUrgency = urg),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? color.withValues(alpha: 0.25) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? color : const Color(0xFF334155),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      urg.tr.toUpperCase(),
                      style: TextStyle(
                        color: isSelected ? color : const Color(0xFF94A3B8),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
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

