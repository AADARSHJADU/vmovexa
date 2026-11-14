import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/driver_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class CreateSupportTicketSheet extends StatefulWidget {
  final VoidCallback? onSuccess;

  const CreateSupportTicketSheet({super.key, this.onSuccess});

  @override
  State<CreateSupportTicketSheet> createState() => _CreateSupportTicketSheetState();
}

class _CreateSupportTicketSheetState extends State<CreateSupportTicketSheet> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _descController = TextEditingController();

  final List<String> _categories = [
    'General',
    'Technical',
    'Fastag & Tolls',
    'Billing & Payouts',
    'Hardware & Telematics',
    'Driver & Fleet Roster',
    'Route & Schedule',
  ];

  final List<Map<String, dynamic>> _priorities = [
    {'value': 'low', 'label': 'low', 'color': Color(0xFF78909C)},
    {'value': 'medium', 'label': 'medium', 'color': Color(0xFF3F7BF5)},
    {'value': 'high', 'label': 'high', 'color': Color(0xFFFFA726)},
    {'value': 'urgent', 'label': 'urgent', 'color': Color(0xFFFF5252)},
  ];

  String _selectedCategory = 'General';
  String _selectedPriority = 'medium';
  final List<File> _localFiles = [];
  final List<Map<String, dynamic>> _uploadedAttachments = [];
  bool _isUploading = false;
  bool _isSubmitting = false;

  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _subjectController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickAttachment(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 80);
      if (picked == null) return;

      final file = File(picked.path);
      setState(() {
        _localFiles.add(file);
        _isUploading = true;
      });

      // Upload file to server
      final res = await DriverService.to.uploadFile(
        filePath: file.path,
        purpose: 'support',
      );

      if (res.success && res.data != null) {
        final url = res.data!['url'] ?? res.data!['fileUrl'] ?? res.data!['path'] ?? '';
        final name = picked.name;
        setState(() {
          _uploadedAttachments.add({
            'url': url,
            'fileName': name,
            'fileType': 'image/jpeg',
            'fileSize': file.lengthSync(),
          });
        });
      }
    } catch (e) {
      Get.snackbar(
        'upload_error'.tr,
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  void _removeAttachment(int index) {
    setState(() {
      if (index < _localFiles.length) _localFiles.removeAt(index);
      if (index < _uploadedAttachments.length) _uploadedAttachments.removeAt(index);
    });
  }

  Future<void> _submitTicket() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isSubmitting || _isUploading) return;

    setState(() => _isSubmitting = true);

    try {
      final res = await DriverService.to.createSupportTicket(
        subject: _subjectController.text.trim(),
        category: _selectedCategory,
        priority: _selectedPriority,
        description: _descController.text.trim(),
        attachments: _uploadedAttachments.isNotEmpty ? _uploadedAttachments : null,
      );

      if (res.success) {
        Get.back();
        Get.snackbar(
          'ticket_created_success'.tr,
          'ticket_created_success_msg'.tr,
          backgroundColor: const Color(0xFF2ECC71),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );
        widget.onSuccess?.call();
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_to_raise_ticket'.tr,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const cardBg = Color(0xFF15151F);
    const fieldBg = Color(0xFF1B1B27);
    const borderColor = Color(0x22FFFFFF);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: const BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 16,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
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

              // Title row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.confirmation_number_outlined, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'raise_support_ticket'.tr,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'ticket_desc_helper'.tr,
                            style: const TextStyle(color: Colors.white54, fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white54, size: 22),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Subject Field
              Text('ticket_subject'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _subjectController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'ticket_subject_hint'.tr,
                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                  filled: true,
                  fillColor: fieldBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: borderColor)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: borderColor)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.gradientBlue)),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'subject_required'.tr;
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              Text('category'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: fieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: borderColor),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCategory,
                    isExpanded: true,
                    dropdownColor: cardBg,
                    icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white70),
                    items: _categories.map((cat) {
                      return DropdownMenuItem<String>(
                        value: cat,
                        child: Text(cat, style: const TextStyle(color: Colors.white, fontSize: 13)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Priority Selector
              Text('priority'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Row(
                children: _priorities.map((p) {
                  final val = p['value'] as String;
                  final label = p['label'] as String;
                  final isSelected = _selectedPriority == val;
                  final color = p['color'] as Color;

                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedPriority = val),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: isSelected ? color.withOpacity(0.2) : fieldBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? color : borderColor,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            label.tr,
                            style: TextStyle(
                              color: isSelected ? color : Colors.white60,
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Description Field
              Text('description'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'ticket_desc_hint'.tr,
                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 12.5),
                  filled: true,
                  fillColor: fieldBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: borderColor)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: borderColor)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.gradientBlue)),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'description_required'.tr;
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Attachments
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('attachments'.tr, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.camera_alt_outlined, color: AppTheme.gradientBlue, size: 20),
                        tooltip: 'Camera',
                        onPressed: () => _pickAttachment(ImageSource.camera),
                      ),
                      IconButton(
                        icon: const Icon(Icons.image_outlined, color: AppTheme.gradientPink, size: 20),
                        tooltip: 'Gallery',
                        onPressed: () => _pickAttachment(ImageSource.gallery),
                      ),
                    ],
                  ),
                ],
              ),
              if (_isUploading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: LinearProgressIndicator(
                    backgroundColor: fieldBg,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gradientBlue),
                  ),
                ),
              if (_localFiles.isNotEmpty)
                SizedBox(
                  height: 70,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _localFiles.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              _localFiles[idx],
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -4,
                            right: -4,
                            child: GestureDetector(
                              onTap: () => _removeAttachment(idx),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: Colors.redAccent,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, color: Colors.white, size: 14),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // Submit Button with AppTheme.primaryGradient
              GestureDetector(
                onTap: _isSubmitting ? null : _submitTicket,
                child: Container(
                  width: double.infinity,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.gradientBlue.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.send_outlined, color: Colors.white, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'submit_ticket'.tr,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
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
        ),
      ),
    );
  }
}
