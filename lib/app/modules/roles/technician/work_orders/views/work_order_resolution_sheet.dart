import 'package:vmovexa/app/widgets/custom_button.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:vmovexa/app/data/models/work_order_model.dart';
import 'package:vmovexa/app/theme/app_colors.dart';
import '../controller/tech_work_orders_controller.dart';

class WorkOrderResolutionSheet extends StatefulWidget {
  final WorkOrderModel order;
  final VoidCallback? onResolved;

  const WorkOrderResolutionSheet({
    super.key,
    required this.order,
    this.onResolved,
  });

  static Future<void> show(BuildContext context, WorkOrderModel order, {VoidCallback? onResolved}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => WorkOrderResolutionSheet(order: order, onResolved: onResolved),
    );
  }

  @override
  State<WorkOrderResolutionSheet> createState() => _WorkOrderResolutionSheetState();
}

class _WorkOrderResolutionSheetState extends State<WorkOrderResolutionSheet> {
  final _notesCtrl = TextEditingController();
  final _partCtrl = TextEditingController();
  final List<String> _parts = [];

  bool _hardwareFixed = true;
  bool _firmwareUpdated = false;
  bool _diagnosticsPassed = true;
  bool _telemetryVerified = true;

  @override
  void initState() {
    super.initState();
    if (widget.order.resolutionNotes != null && widget.order.resolutionNotes!.isNotEmpty) {
      _notesCtrl.text = widget.order.resolutionNotes!;
    }
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    _partCtrl.dispose();
    super.dispose();
  }

  void _addPart() {
    final text = _partCtrl.text.trim();
    if (text.isNotEmpty && !_parts.contains(text)) {
      setState(() {
        _parts.add(text);
        _partCtrl.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.isRegistered<TechWorkOrdersController>()
        ? Get.find<TechWorkOrdersController>()
        : Get.put(TechWorkOrdersController());

    final isResolved = widget.order.status.toLowerCase() == 'resolved' ||
        widget.order.status.toLowerCase() == 'completed' ||
        widget.order.status.toLowerCase() == 'closed';
    final isOnSite = widget.order.status.toLowerCase() == 'on_site' ||
        widget.order.status.toLowerCase() == 'in_progress';

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: Color(0xFF334155), width: 1.5),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 14,
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Grab Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          widget.order.code,
                          style: const TextStyle(
                            color: Color(0xFF818CF8),
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      _buildUrgencyBadge(widget.order.urgency),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close_rounded, color: Colors.white60, size: 22),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              Text(
                widget.order.issueCategory,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              // Bus & Depot info row
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.directions_bus_rounded, color: Color(0xFF38BDF8), size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.order.busNumber,
                            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.order.depotName,
                            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusPill(widget.order.status),
                  ],
                ),
              ),

              if (widget.order.description.isNotEmpty) ...[
                const SizedBox(height: 14),
                const Text(
                  'SYMPTOMS & ISSUE DETAILS',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF151D2F),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Text(
                    widget.order.description,
                    style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                  ),
                ),
              ],

              const SizedBox(height: 18),
              const Divider(color: Color(0xFF334155), height: 1),
              const SizedBox(height: 16),

              if (isResolved) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF065F46).withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Work Order Resolved',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            if (widget.order.resolvedAt != null)
                              Text(
                                'Completed on: ${widget.order.resolvedAt}',
                                style: const TextStyle(color: Colors.white70, fontSize: 11),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // Checklist
                const Text(
                  'DISPATCH & REPAIR CHECKLIST',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 8),
                _buildChecklistTile('Hardware Inspected & Repaired', _hardwareFixed, (v) => setState(() => _hardwareFixed = v)),
                _buildChecklistTile('Firmware & OTA Config Updated', _firmwareUpdated, (v) => setState(() => _firmwareUpdated = v)),
                _buildChecklistTile('Diagnostics Self-Test Passed', _diagnosticsPassed, (v) => setState(() => _diagnosticsPassed = v)),
                _buildChecklistTile('Live Telemetry Signal Verified', _telemetryVerified, (v) => setState(() => _telemetryVerified = v)),

                const SizedBox(height: 14),
                // Parts replaced
                const Text(
                  'PARTS REPLACED (OPTIONAL)',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _partCtrl,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: InputDecoration(
                          hintText: 'e.g. CAB-HDMI-1M, GPS-ANT-ACTIVE',
                          hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          filled: true,
                          fillColor: const Color(0xFF1E293B),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                        onSubmitted: (_) => _addPart(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _addPart,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.gradientPink.withValues(alpha: 0.25),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Text('Add', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
                if (_parts.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _parts.map((p) => Chip(
                      label: Text(p, style: const TextStyle(color: Colors.white, fontSize: 11)),
                      backgroundColor: const Color(0xFF1E293B),
                      deleteIconColor: Colors.white54,
                      onDeleted: () => setState(() => _parts.remove(p)),
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                    )).toList(),
                  ),
                ],

                const SizedBox(height: 14),
                // Resolution Notes
                const Text(
                  'RESOLUTION NOTES & REMARKS *',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _notesCtrl,
                  maxLines: 3,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Describe actions taken (e.g. Replaced ribbon cable, re-crimped antenna lead)...',
                    hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.all(12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF334155))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF6366F1))),
                  ),
                ),

                const SizedBox(height: 20),

                // Action Buttons
                Obx(() {
                  final loading = controller.isSubmitting.value;

                  return Row(
                    children: [
                      if (!isOnSite) ...[
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: loading ? null : () async {
                              final success = await controller.markOnSite(widget.order);
                              if (success) {
                                Get.back();
                                widget.onResolved?.call();
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF38BDF8),
                              side: const BorderSide(color: Color(0xFF38BDF8)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            icon: const Icon(Icons.pin_drop_rounded, size: 16),
                            label: const Text('Mark On-Site', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(width: 10),
                      ],
                      Expanded(
                        child: CustomButton(
                          text: loading ? 'Saving...' : 'Resolve & Close',
                          isLoading: loading,
                          prefixIcon: loading ? null : const Icon(Icons.check_circle_outline_rounded, size: 16, color: Colors.white),
                          height: 44,
                          onTap: () async {
                            if (_notesCtrl.text.trim().isEmpty) {
                              Get.snackbar(
                                'Missing Notes',
                                'Please provide resolution notes before marking resolved.',
                                backgroundColor: const Color(0xFFEF4444).withValues(alpha: 0.2),
                                colorText: Colors.white,
                                snackPosition: SnackPosition.BOTTOM,
                              );
                              return;
                            }

                            final checks = <String>[];
                            if (_hardwareFixed) checks.add('Hardware Inspected/Repaired');
                            if (_firmwareUpdated) checks.add('Firmware Updated');
                            if (_diagnosticsPassed) checks.add('Diagnostics Passed');
                            if (_telemetryVerified) checks.add('Telemetry Verified');

                            final success = await controller.resolveWorkOrder(
                              orderId: widget.order.id,
                              notes: _notesCtrl.text.trim(),
                              parts: _parts,
                              checklist: checks,
                            );
                            if (success) {
                              Get.back();
                              widget.onResolved?.call();
                            }
                          },
                        ),
                      ),
                    ],
                  );
                }),
              ],
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChecklistTile(String title, bool value, Function(bool) onChanged) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            SizedBox(
              width: 24,
              height: 24,
              child: Checkbox(
                value: value,
                onChanged: (v) => onChanged(v ?? false),
                activeColor: const Color(0xFF6366F1),
                checkColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                side: const BorderSide(color: Color(0xFF64748B)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyBadge(String urgency) {
    Color bg;
    Color text;
    switch (urgency.toLowerCase()) {
      case 'critical':
        bg = const Color(0xFFEF4444).withValues(alpha: 0.2);
        text = const Color(0xFFF87171);
        break;
      case 'high':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.2);
        text = const Color(0xFFFBBF24);
        break;
      default:
        bg = const Color(0xFF38BDF8).withValues(alpha: 0.15);
        text = const Color(0xFF38BDF8);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        urgency.toUpperCase(),
        style: TextStyle(color: text, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    Color bg;
    Color text;
    String label = status;
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed':
        bg = const Color(0xFF10B981).withValues(alpha: 0.2);
        text = const Color(0xFF34D399);
        label = 'Resolved';
        break;
      case 'on_site':
      case 'in_progress':
        bg = const Color(0xFFF59E0B).withValues(alpha: 0.2);
        text = const Color(0xFFFBBF24);
        label = 'On-Site';
        break;
      default:
        bg = const Color(0xFF6366F1).withValues(alpha: 0.2);
        text = const Color(0xFF818CF8);
        label = 'Dispatched';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
