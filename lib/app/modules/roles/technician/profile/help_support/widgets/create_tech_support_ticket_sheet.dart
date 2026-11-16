import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import 'package:vmovexa/app/theme/app_theme.dart';

class CreateTechSupportTicketSheet extends StatefulWidget {
  final VoidCallback? onSuccess;

  const CreateTechSupportTicketSheet({super.key, this.onSuccess});

  @override
  State<CreateTechSupportTicketSheet> createState() => _CreateTechSupportTicketSheetState();
}

class _CreateTechSupportTicketSheetState extends State<CreateTechSupportTicketSheet> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _descController = TextEditingController();

  final List<String> _categories = [
    'General Hardware',
    'Display & Screen',
    'CAN-bus & Telematics',
    'Firmware & Flashing',
    'GPS & GNSS Antenna',
    'Power Supply & Wiring',
    'Depot Spares & RMA',
  ];

  final List<Map<String, dynamic>> _priorities = [
    {'value': 'low', 'label': 'low', 'color': const Color(0xFF78909C)},
    {'value': 'medium', 'label': 'medium', 'color': const Color(0xFF3F7BF5)},
    {'value': 'high', 'label': 'high', 'color': const Color(0xFFFFA726)},
    {'value': 'urgent', 'label': 'urgent', 'color': const Color(0xFFFF5252)},
  ];

  String _selectedCategory = 'General Hardware';
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
      final res = await HttpClientService.to.uploadFile(
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
      final res = await TechnicianService.to.createSupportTicket(
        subject: _subjectController.text.trim(),
        category: _selectedCategory,
        priority: _selectedPriority,
        description: _descController.text.trim(),
        attachments: _uploadedAttachments.isNotEmpty ? _uploadedAttachments : null,
      );

      if (res.success) {
        Get.back(); // close modal
        Get.snackbar(
          'ticket_created_success'.tr,
          'ticket_created_success_desc'.tr,
          backgroundColor: const Color(0xFF2ECC71),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );
        widget.onSuccess?.call();
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_create_ticket'.tr,
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
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const cardBg = Color(0xFF15151F);
    const inputBg = Color(0xFF1B1B27);
    const borderColor = Color(0x22FFFFFF);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      decoration: const BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 16,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
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

          // Header
          Row(

            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'raise_support_ticket'.tr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white54, size: 22),
                        onPressed: () => Get.back(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ticket_modal_sub'.tr,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ],
              ),

            ],
          ),
          const SizedBox(height: 16),

          // Form
          Expanded(
            child: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category Selection
                    Text(
                      'category'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: inputBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: borderColor),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          dropdownColor: cardBg,
                          value: _selectedCategory,
                          items: _categories.map((cat) {
                            return DropdownMenuItem(
                              value: cat,
                              child: Text(
                                cat,
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedCategory = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Priority Selection
                    Text(
                      'priority'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: _priorities.map((p) {
                        final isSel = _selectedPriority == p['value'];
                        final Color col = p['color'] as Color;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedPriority = p['value'] as String),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: isSel ? col.withOpacity(0.2) : inputBg,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSel ? col : borderColor,
                                  width: isSel ? 1.5 : 1,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  (p['label'] as String).tr.toUpperCase(),
                                  style: TextStyle(
                                    color: isSel ? col : Colors.white60,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Subject
                    Text(
                      'subject'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _subjectController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: inputBg,
                        hintText: 'brief_issue_summary'.tr,
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: borderColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: borderColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.gradientBlue),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'please_enter_subject'.tr;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Description
                    Text(
                      'description'.tr,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _descController,
                      maxLines: 4,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: inputBg,
                        hintText: 'describe_issue_in_detail'.tr,
                        hintStyle: const TextStyle(color: Colors.white38, fontSize: 13),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: borderColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: borderColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppTheme.gradientBlue),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'please_enter_description'.tr;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Attachments Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'attachments'.tr,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.camera_alt_outlined, color: AppTheme.gradientBlue, size: 20),
                              onPressed: () => _pickAttachment(ImageSource.camera),
                              tooltip: 'camera'.tr,
                            ),
                            IconButton(
                              icon: const Icon(Icons.attach_file_rounded, color: AppTheme.gradientPink, size: 20),
                              onPressed: () => _pickAttachment(ImageSource.gallery),
                              tooltip: 'gallery'.tr,
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (_isUploading)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.gradientBlue),
                            ),
                            SizedBox(width: 8),
                            Text(
                              'Uploading attachment...',
                              style: TextStyle(color: Colors.white54, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    if (_localFiles.isNotEmpty)
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: List.generate(_localFiles.length, (idx) {
                          return Stack(
                            children: [
                              Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: borderColor),
                                  image: DecorationImage(
                                    image: FileImage(_localFiles[idx]),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 2,
                                right: 2,
                                child: GestureDetector(
                                  onTap: () => _removeAttachment(idx),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: const BoxDecoration(
                                      color: Colors.black87,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close, color: Colors.white, size: 12),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ),
                    const SizedBox(height: 20),

                    // Submit Button with AppTheme.primaryGradient
                    GestureDetector(
                      onTap: (_isSubmitting || _isUploading) ? null : _submitTicket,
                      child: Container(
                        width: double.infinity,
                        height: 48,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.gradientBlue.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.send_rounded, color: Colors.white, size: 18),
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
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
