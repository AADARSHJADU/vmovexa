import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/services/http_client_service.dart';
import 'package:vmovexa/app/data/services/technician_service.dart';
import '../model/tech_help_support_models.dart';

class TechTicketConversationController extends GetxController {
  TechnicianService get _techService => TechnicianService.to;

  final TextEditingController messageController = TextEditingController();
  final ScrollController scrollController = ScrollController();

  final Rx<TechSupportTicketModel?> ticket = Rx<TechSupportTicketModel?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isSending = false.obs;
  final RxBool isUploading = false.obs;

  final RxList<File> pendingFiles = <File>[].obs;
  final RxList<Map<String, dynamic>> pendingAttachments = <Map<String, dynamic>>[].obs;

  final ImagePicker _picker = ImagePicker();
  late String ticketId;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is TechSupportTicketModel) {
      ticket.value = args;
      ticketId = args.id;
    } else if (args is Map) {
      ticketId = (args['ticketId'] ?? args['id'] ?? '').toString();
    } else if (args is String) {
      ticketId = args;
    } else {
      ticketId = '';
    }

    if (ticketId.isNotEmpty) {
      fetchTicketDetails();
    }
  }

  @override
  void onClose() {
    messageController.dispose();
    scrollController.dispose();
    super.onClose();
  }

  Future<void> fetchTicketDetails() async {
    isLoading.value = true;
    try {
      final res = await _techService.getSupportTicketDetails(ticketId);
      if (res.success && res.data != null) {
        ticket.value = res.data!;
        _scrollToBottom();
      }
    } catch (e) {
      debugPrint('TechTicketConversation fetch error: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> pickAttachment(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(source: source, imageQuality: 80);
      if (picked == null) return;

      final file = File(picked.path);
      pendingFiles.add(file);
      isUploading.value = true;

      final res = await HttpClientService.to.uploadFile(
        filePath: file.path,
        purpose: 'support',
      );

      if (res.success && res.data != null) {
        final url = res.data!['url'] ?? res.data!['fileUrl'] ?? res.data!['path'] ?? '';
        pendingAttachments.add({
          'url': url,
          'fileName': picked.name,
          'fileType': 'image/jpeg',
          'fileSize': file.lengthSync(),
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
      isUploading.value = false;
    }
  }

  void removePendingAttachment(int index) {
    if (index < pendingFiles.length) pendingFiles.removeAt(index);
    if (index < pendingAttachments.length) pendingAttachments.removeAt(index);
  }

  Future<void> sendReply() async {
    final text = messageController.text.trim();
    if (text.isEmpty && pendingAttachments.isEmpty) return;
    if (isSending.value || isUploading.value) return;

    isSending.value = true;
    try {
      final res = await _techService.sendSupportTicketReply(
        ticketId,
        body: text,
        attachments: pendingAttachments.isNotEmpty ? pendingAttachments.toList() : null,
      );

      if (res.success) {
        messageController.clear();
        pendingFiles.clear();
        pendingAttachments.clear();

        // Optimistically add message or refresh ticket
        if (ticket.value != null && res.data != null) {
          final updatedMsgs = List<TechTicketMessageModel>.from(ticket.value!.messages)..add(res.data!);
          ticket.value = TechSupportTicketModel(
            id: ticket.value!.id,
            code: ticket.value!.code,
            subject: ticket.value!.subject,
            category: ticket.value!.category,
            priority: ticket.value!.priority,
            status: ticket.value!.status,
            description: ticket.value!.description,
            createdAt: ticket.value!.createdAt,
            updatedAt: ticket.value!.updatedAt,
            attachments: ticket.value!.attachments,
            messages: updatedMsgs,
          );
        }

        await fetchTicketDetails();
      } else {
        Get.snackbar(
          'error'.tr,
          res.message ?? 'failed_to_send_reply'.tr,
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
      isSending.value = false;
    }
  }
}
