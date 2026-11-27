import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:vmovexa/app/data/constants/api_constants.dart';
import 'package:vmovexa/app/theme/app_theme.dart';
import '../controller/tech_ticket_conversation_controller.dart';
import '../model/tech_help_support_models.dart';

class TechTicketConversationView extends GetView<TechTicketConversationController> {
  const TechTicketConversationView({super.key});

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
  Widget _buildHeader(TechSupportTicketModel? ticket) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      color: kCardBg,
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        ticket?.code ?? 'ticket'.tr,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (ticket != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: ticket.statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: ticket.statusColor.withOpacity(0.4)),
                        ),
                        child: Text(
                          ticket.status.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: ticket.statusColor,
                            fontSize: 8.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 1),
                Text(
                  ticket?.category ?? 'Hardware Support',
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white54, size: 20),
            onPressed: controller.fetchTicketDetails,
          ),
        ],
      ),
    );
  }

  // ---------------- Summary Card ----------------
  Widget _buildTicketSummaryCard(TechSupportTicketModel ticket) {
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
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: ticket.priorityColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '${'priority'.tr}: ${ticket.priority.toUpperCase()}',
                  style: TextStyle(
                    color: ticket.priorityColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              if (ticket.createdAt != null)
                Text(
                  ticket.createdAt!.length > 10
                      ? ticket.createdAt!.substring(0, 10)
                      : ticket.createdAt!,
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
          const SizedBox(height: 6),
          Text(
            ticket.description,
            style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
          ),
          if (ticket.attachments.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildAttachmentStrip(ticket.attachments),
          ],
        ],
      ),
    );
  }

  // ---------------- Message Bubble ----------------
  Widget _buildMessageBubble(TechTicketMessageModel msg) {
    final isMe = msg.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe)
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(right: 8, bottom: 2),
              decoration: BoxDecoration(
                color: AppTheme.gradientBlue.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.gradientBlue.withOpacity(0.4)),
              ),
              child: const Center(
                child: Icon(Icons.support_agent_rounded, color: AppTheme.gradientBlue, size: 16),
              ),
            ),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: isMe ? AppTheme.primaryGradient : null,
                color: isMe ? null : kCardBg,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isMe ? 16 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 16),
                ),
                border: isMe ? null : Border.all(color: kBorder),
                boxShadow: isMe
                    ? [
                        BoxShadow(
                          color: AppTheme.gradientBlue.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Column(
                crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  if (!isMe) ...[
                    Text(
                      'vmovexa_support'.tr,
                      style: const TextStyle(
                        color: AppTheme.gradientBlue,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 3),
                  ],
                  Text(
                    msg.message,
                    style: const TextStyle(color: Colors.white, fontSize: 12.5, height: 1.35),
                  ),
                  if (msg.attachments.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _buildAttachmentStrip(msg.attachments),
                  ],
                  if (msg.createdAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      msg.createdAt!.length > 16
                          ? msg.createdAt!.substring(11, 16)
                          : msg.createdAt!,
                      style: TextStyle(
                        color: isMe ? Colors.white60 : Colors.white38,
                        fontSize: 9,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (isMe)
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(left: 8, bottom: 2),
              decoration: BoxDecoration(
                color: AppTheme.gradientPink.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.gradientPink.withOpacity(0.4)),
              ),
              child: const Center(
                child: Icon(Icons.build_rounded, color: Colors.white, size: 14),
              ),
            ),
        ],
      ),
    );
  }

  // ---------------- Attachment Strip ----------------
  Widget _buildAttachmentStrip(List<SupportAttachmentModel> atts) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: atts.map((a) {
        final rawUrl = a.url;
        final resolved = rawUrl != null ? ApiConstants.resolveFileUrl(rawUrl) : null;
        if (resolved != null && (resolved.endsWith('.jpg') || resolved.endsWith('.png') || resolved.endsWith('.jpeg'))) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              resolved,
              width: 70,
              height: 70,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 70,
                height: 70,
                color: Colors.white10,
                child: const Icon(Icons.image_not_supported, color: Colors.white38),
              ),
            ),
          );
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.attach_file, color: Colors.white70, size: 12),
              const SizedBox(width: 4),
              Text(
                a.name ?? 'attachment'.tr,
                style: const TextStyle(color: Colors.white70, fontSize: 10),
              ),
            ],
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
