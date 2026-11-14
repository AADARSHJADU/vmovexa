import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/driver_ticket_conversation_controller.dart';
import '../model/help_support_models.dart';

class DriverTicketConversationView extends GetView<DriverTicketConversationController> {
  const DriverTicketConversationView({super.key});

  static const Color kBg = Color(0xFF0B0B14);
  static const Color kCardBg = Color(0xFF15151F);
  static const Color kFieldBg = Color(0xFF1B1B27);
  static const Color kBorder = Color(0x1AFFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: Obx(() {
          final ticket = controller.ticket.value;
          final isClosed = ticket != null && (ticket.isClosed || ticket.isResolved);

          return Column(
            children: [
              // Header
              _buildHeader(ticket),
              const Divider(color: Colors.white12, height: 1),

              // Conversation Messages Thread
              Expanded(
                child: controller.isLoading.value && ticket == null
                    ? const Center(
                        child: CircularProgressIndicator(color: AppTheme.gradientBlue),
                      )
                    : RefreshIndicator(
                        color: AppTheme.gradientBlue,
                        backgroundColor: kCardBg,
                        onRefresh: controller.fetchTicketDetails,
                        child: ListView(
                          controller: controller.scrollController,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          children: [
                            if (ticket != null) ...[
                              // Original ticket description card
                              _buildTicketSummaryCard(ticket),
                              const SizedBox(height: 16),
                            ],

                            // Messages list
                            if (ticket != null && ticket.messages.isNotEmpty) ...[
                              ...ticket.messages.map((msg) => _buildMessageBubble(msg)),
                            ] else if (!controller.isLoading.value) ...[
                              Center(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 24),
                                  child: Text(
                                    'no_messages_yet'.tr,
                                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
              ),

              // Pending Attachments Bar
              if (controller.pendingFiles.isNotEmpty) _buildPendingAttachmentsBar(),

              // Closed notice or Reply Composer
              if (isClosed)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  color: const Color(0xFF1E222D),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.lock_outline, color: Colors.white54, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'ticket_closed_notice'.tr,
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                )
              else
                _buildComposer(),
            ],
          );
        }),
      ),
    );
  }

  // ---------------- Header ----------------
  Widget _buildHeader(DriverSupportTicketModel? ticket) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: kCardBg,
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kBorder),
              ),
              child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      ticket?.code ?? '#TKT',
                      style: const TextStyle(
                        color: AppTheme.gradientBlue,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (ticket != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          ticket.category,
                          style: const TextStyle(color: Colors.white70, fontSize: 10),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  ticket?.subject ?? 'support_ticket'.tr,
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (ticket != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
              decoration: BoxDecoration(
                color: ticket.statusColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: ticket.statusColor.withOpacity(0.3)),
              ),
              child: Text(
                ticket.status.toUpperCase(),
                style: TextStyle(
                  color: ticket.statusColor,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ---------------- Ticket Summary Card ----------------
  Widget _buildTicketSummaryCard(DriverSupportTicketModel ticket) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kCardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: ticket.priorityColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'PRIORITY: ${ticket.priority.toUpperCase()}',
                  style: TextStyle(
                    color: ticket.priorityColor,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (ticket.createdAt != null)
                Text(
                  ticket.createdAt!,
                  style: const TextStyle(color: Colors.white38, fontSize: 10),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            ticket.subject,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (ticket.description.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              ticket.description,
              style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
            ),
          ],
          if (ticket.attachments.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildAttachmentsPreview(ticket.attachments),
          ],
        ],
      ),
    );
  }

  // ---------------- Message Bubble ----------------
  Widget _buildMessageBubble(TicketMessageModel msg) {
    final isDriver = !msg.isStaff;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isDriver ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isDriver) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF2C3E50),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: Icon(Icons.headset_mic_outlined, color: Colors.blueAccent, size: 16),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: isDriver ? AppTheme.primaryGradient : null,
                color: isDriver ? null : kCardBg,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(14),
                  topRight: const Radius.circular(14),
                  bottomLeft: Radius.circular(isDriver ? 14 : 2),
                  bottomRight: Radius.circular(isDriver ? 2 : 14),
                ),
                border: isDriver ? null : Border.all(color: kBorder),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: isDriver ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Sender name row
                  if (!isDriver)
                    Padding(
                      padding:  EdgeInsets.only(bottom: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            msg.senderName??'',
                            style: const TextStyle(
                              color: Colors.blueAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: Colors.blueAccent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: const Text(
                              'NOC / TECH',
                              style: TextStyle(color: Colors.blueAccent, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Message body
                  Text(
                    msg.body,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12.5,
                      height: 1.35,
                    ),
                  ),

                  // Message attachments
                  if (msg.attachments.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _buildAttachmentsPreview(msg.attachments),
                  ],

                  // Time
                  if (msg.createdAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      msg.formattedTime,
                      style: TextStyle(
                        color: isDriver ? Colors.white60 : Colors.white38,
                        fontSize: 9.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (isDriver) const SizedBox(width: 8),
        ],
      ),
    );
  }

  // ---------------- Attachments Preview ----------------
  Widget _buildAttachmentsPreview(List<SupportAttachmentModel> attachments) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: attachments.map((att) {
        final fullUrl = ApiConstants.resolveFileUrl(att.url);
        final isImg = att.isImage;

        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 80,
            height: 80,
            color: kFieldBg,
            child: isImg && fullUrl.isNotEmpty
                ? Image.network(
                    fullUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Center(
                      child: Icon(Icons.broken_image, color: Colors.white38, size: 24),
                    ),
                  )
                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.insert_drive_file_outlined, color: Colors.white70, size: 24),
                        const SizedBox(height: 4),
                        Text(
                          att.fileName ?? 'file',
                          style: const TextStyle(color: Colors.white70, fontSize: 8),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
          ),
        );
      }).toList(),
    );
  }

  // ---------------- Pending Attachments Bar ----------------
  Widget _buildPendingAttachmentsBar() {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: kCardBg,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: controller.pendingFiles.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, idx) {
          return Stack(
            clipBehavior: Clip.none,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.file(
                  controller.pendingFiles[idx],
                  width: 54,
                  height: 54,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                top: -4,
                right: -4,
                child: GestureDetector(
                  onTap: () => controller.removePendingAttachment(idx),
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 12),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ---------------- Reply Composer ----------------
  Widget _buildComposer() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        color: kCardBg,
        border: Border(top: BorderSide(color: kBorder)),
      ),
      child: Row(
        children: [
          // Attachment action
          PopupMenuButton<ImageSource>(
            icon: const Icon(Icons.attach_file, color: Colors.white60, size: 22),
            color: kCardBg,
            onSelected: controller.pickAttachment,
            itemBuilder: (context) => [
              PopupMenuItem(
                value: ImageSource.camera,
                child: Row(
                  children: [
                    const Icon(Icons.camera_alt_outlined, color: AppTheme.gradientBlue, size: 18),
                    const SizedBox(width: 8),
                    Text('camera'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                  ],
                ),
              ),
              PopupMenuItem(
                value: ImageSource.gallery,
                child: Row(
                  children: [
                    const Icon(Icons.image_outlined, color: AppTheme.gradientPink, size: 18),
                    const SizedBox(width: 8),
                    Text('gallery'.tr, style: const TextStyle(color: Colors.white, fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),

          // Message input field
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: kFieldBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: kBorder),
              ),
              child: TextField(
                controller: controller.messageController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                maxLines: 3,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: 'type_message_hint'.tr,
                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 12.5),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Send button with AppTheme.primaryGradient
          GestureDetector(
            onTap: controller.sendReply,
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.gradientBlue.withOpacity(0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: controller.isSending.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
