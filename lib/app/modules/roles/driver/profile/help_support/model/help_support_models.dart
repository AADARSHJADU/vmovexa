import 'package:flutter/material.dart';

// ============================================================================
// 1. Contact / Emergency Hotline Model
// ============================================================================
class DriverContactInfo {
  final String theme; // 'red', 'dark', 'blue', 'slate'
  final String badge;
  final String title;
  final String description;
  final String ctaText;

  DriverContactInfo({
    this.theme = 'red',
    this.badge = 'Transit Emergency SOS',
    this.title = '1800-VMOVEXA / +91 98765 11111',
    this.description = 'Direct line to Central Transit Control Room & Breakdown Towing.',
    this.ctaText = 'Call Control Room Now',
  });

  factory DriverContactInfo.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverContactInfo();
    return DriverContactInfo(
      theme: json['theme']?.toString() ?? 'red',
      badge: json['badge']?.toString() ?? 'Transit Emergency SOS',
      title: json['title']?.toString() ?? '1800-VMOVEXA / +91 98765 11111',
      description: json['description']?.toString() ??
          'Direct line to Central Transit Control Room & Breakdown Towing.',
      ctaText: json['ctaText']?.toString() ?? 'Call Control Room Now',
    );
  }
}

// ============================================================================
// 2. SOP Guides Model
// ============================================================================
class DriverGuideItem {
  final String title;
  final String desc;
  final String icon; // 'Document', 'Car', 'Shield', 'Clock'
  final String? url;

  DriverGuideItem({
    required this.title,
    required this.desc,
    required this.icon,
    this.url,
  });

  factory DriverGuideItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return DriverGuideItem(title: 'Guide', desc: '', icon: 'Document');
    }
    return DriverGuideItem(
      title: json['title']?.toString() ?? 'Guide',
      desc: json['desc']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'Document',
      url: json['url']?.toString() ?? json['docUrl']?.toString() ?? json['pdfUrl']?.toString(),
    );
  }

  bool get hasPdf => url != null && url!.trim().isNotEmpty;

  IconData get iconData {
    switch (icon.toLowerCase()) {
      case 'car':
        return Icons.directions_bus_outlined;
      case 'shield':
        return Icons.medical_services_outlined;
      case 'clock':
        return Icons.schedule_outlined;
      case 'document':
      default:
        return Icons.description_outlined;
    }
  }

  Color get iconColor {
    switch (icon.toLowerCase()) {
      case 'car':
        return const Color(0xFF3F7BF5);
      case 'shield':
        return const Color(0xFFFF5252);
      case 'clock':
        return const Color(0xFFFFA726);
      case 'document':
      default:
        return const Color(0xFFB042FF);
    }
  }
}

// ============================================================================
// 3. Driver FAQ Model
// ============================================================================
class DriverFaqItem {
  final String question;
  final String answer;

  DriverFaqItem({required this.question, required this.answer});

  factory DriverFaqItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverFaqItem(question: '', answer: '');
    return DriverFaqItem(
      question: json['q']?.toString() ?? json['question']?.toString() ?? json['title']?.toString() ?? '',
      answer: json['a']?.toString() ?? json['answer']?.toString() ?? json['content']?.toString() ?? '',
    );
  }
}

// ============================================================================
// 4. Video Academy Model
// ============================================================================
class DriverVideoItem {
  final String id;
  final String title;
  final String duration;
  final String level;
  final String category;
  final String views;
  final String desc;
  final List<String> chapters;

  DriverVideoItem({
    required this.id,
    required this.title,
    required this.duration,
    required this.level,
    required this.category,
    required this.views,
    required this.desc,
    this.chapters = const [],
  });

  factory DriverVideoItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return DriverVideoItem(
        id: '',
        title: '',
        duration: '',
        level: 'Beginner',
        category: 'Training',
        views: '',
        desc: '',
      );
    }

    List<String> ch = [];
    if (json['chapters'] is List) {
      ch = (json['chapters'] as List).map((e) => e.toString()).toList();
    }

    return DriverVideoItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '',
      level: json['level']?.toString() ?? 'Beginner',
      category: json['category']?.toString() ?? 'Training',
      views: json['views']?.toString() ?? '',
      desc: json['desc']?.toString() ?? '',
      chapters: ch,
    );
  }
}

class DriverVideoAcademy {
  final String badge;
  final String title;
  final String description;
  final List<DriverVideoItem> videos;

  DriverVideoAcademy({
    this.badge = 'Driver Transit Academy',
    this.title = 'Driver Video Tutorials & On-Road SOPs',
    this.description = 'Simple and practical video guides for daily shift starts, GPS navigation, and emergency protocols.',
    this.videos = const [],
  });

  factory DriverVideoAcademy.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverVideoAcademy();
    List<DriverVideoItem> vids = [];
    if (json['videos'] is List) {
      vids = (json['videos'] as List)
          .whereType<Map>()
          .map((v) => DriverVideoItem.fromJson(Map<String, dynamic>.from(v)))
          .toList();
    }
    return DriverVideoAcademy(
      badge: json['badge']?.toString() ?? 'Driver Transit Academy',
      title: json['title']?.toString() ?? 'Driver Video Tutorials & On-Road SOPs',
      description: json['description']?.toString() ??
          'Simple and practical video guides for daily shift starts, GPS navigation, and emergency protocols.',
      videos: vids,
    );
  }
}

// ============================================================================
// 5. Aggregate Driver Help Content Model
// ============================================================================
class DriverHelpContentModel {
  final String title;
  final String summary;
  final DriverContactInfo contact;
  final List<DriverGuideItem> guides;
  final List<DriverFaqItem> faqs;
  final DriverVideoAcademy? videoAcademy;

  DriverHelpContentModel({
    required this.title,
    required this.summary,
    required this.contact,
    required this.guides,
    required this.faqs,
    this.videoAcademy,
  });

  factory DriverHelpContentModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return DriverHelpContentModel.defaultDriverHelp();

    Map<String, dynamic>? sections;
    if (json['sections'] is Map) {
      sections = Map<String, dynamic>.from(json['sections'] as Map);
    }

    final contact = DriverContactInfo.fromJson(sections?['contact'] as Map<String, dynamic>?);

    List<DriverGuideItem> guides = [];
    final rawGuides = sections?['guides'];
    if (rawGuides is List && rawGuides.isNotEmpty) {
      guides = rawGuides
          .whereType<Map>()
          .map((g) => DriverGuideItem.fromJson(Map<String, dynamic>.from(g)))
          .toList();
    } else {
      guides = DriverHelpContentModel.defaultGuides;
    }

    List<DriverFaqItem> faqs = [];
    final rawFaqs = sections?['faqs'] ?? json['faqs'];
    if (rawFaqs is List && rawFaqs.isNotEmpty) {
      faqs = rawFaqs
          .whereType<Map>()
          .map((f) => DriverFaqItem.fromJson(Map<String, dynamic>.from(f)))
          .toList();
    } else {
      faqs = DriverHelpContentModel.defaultFaqs;
    }

    DriverVideoAcademy? videoAcademy;
    if (sections?['videoAcademy'] is Map) {
      videoAcademy = DriverVideoAcademy.fromJson(Map<String, dynamic>.from(sections!['videoAcademy'] as Map));
    } else {
      videoAcademy = DriverHelpContentModel.defaultVideoAcademy;
    }

    return DriverHelpContentModel(
      title: json['title']?.toString() ?? 'Driver Help & Documentation',
      summary: json['summary']?.toString() ??
          '24/7 Transit dispatch helpline, emergency road assistance, and driver operating manuals.',
      contact: contact,
      guides: guides,
      faqs: faqs,
      videoAcademy: videoAcademy,
    );
  }

  factory DriverHelpContentModel.defaultDriverHelp() {
    return DriverHelpContentModel(
      title: 'Driver Help & Documentation',
      summary: '24/7 Transit dispatch helpline, emergency road assistance, and driver operating manuals.',
      contact: DriverContactInfo(),
      guides: defaultGuides,
      faqs: defaultFaqs,
      videoAcademy: defaultVideoAcademy,
    );
  }

  static List<DriverGuideItem> get defaultGuides => [
        DriverGuideItem(
          title: 'Driver Handbook',
          desc: 'SOP & Route regulations',
          icon: 'Document',
        ),
        DriverGuideItem(
          title: 'Towing & Recovery',
          desc: 'Breakdown dispatch contacts',
          icon: 'Car',
        ),
        DriverGuideItem(
          title: 'First Aid Protocols',
          desc: 'Passenger medical emergency SOP',
          icon: 'Shield',
        ),
        DriverGuideItem(
          title: 'Depot Timetable',
          desc: 'Shift roster & rest schedules',
          icon: 'Clock',
        ),
      ];

  static List<DriverFaqItem> get defaultFaqs => [
        DriverFaqItem(
          question: 'What should I do in case of an on-road vehicle breakdown?',
          answer:
              'Park safely on the road shoulder, turn on hazard lights, ensure passenger safety, and immediately submit an incident report via the "Report Incident" button or call the Transit Control Room Hotline.',
        ),
        DriverFaqItem(
          question: 'How do I request an urgent route detour or diversion?',
          answer:
              'If waterlogging or road works block your designated lane, follow the nearest marked transit diversion and note the waypoint in your trip log. Control room will automatically update live passenger screens.',
        ),
        DriverFaqItem(
          question: 'When should I renew my Medical Fitness Certificate?',
          answer:
              'Annual medical fitness checks must be submitted at least 15 days before the expiry date to prevent temporary duty suspension on the fleet roster.',
        ),
        DriverFaqItem(
          question: 'How do I report Fastag toll balance errors?',
          answer:
              'If a toll gate fails to read your RFID sticker, proceed using cash voucher if instructed by depot or file a complaint ticket under Tolls & Fastag in the support history tab.',
        ),
      ];

  static DriverVideoAcademy get defaultVideoAcademy => DriverVideoAcademy(
        badge: 'Driver Transit Academy',
        title: 'Driver Video Tutorials & On-Road SOPs',
        description:
            'Simple and practical video guides for daily shift starts, GPS navigation, and emergency protocols.',
        videos: [
          DriverVideoItem(
            id: 'drv-1',
            title: 'Driver Mobile App Onboarding & Shift Start',
            duration: '4:10 min',
            level: 'Beginner',
            category: 'Getting Started',
            views: '5.1k views',
            desc:
                'Logging in with your driver ID, confirming assigned bus number, and doing pre-trip digital safety inspection.',
            chapters: [
              '00:00 Login & Biometrics',
              '01:20 Bus Checklist',
              '02:50 Start Trip',
            ],
          ),
          DriverVideoItem(
            id: 'drv-2',
            title: 'Live Route Navigation & Stop Timetable Sync',
            duration: '5:25 min',
            level: 'Beginner',
            category: 'Navigation',
            views: '3.8k views',
            desc:
                'Following GPS navigation, monitoring passenger stop timings, and handling dynamic road diversions.',
            chapters: [
              '00:00 Map Screen',
              '01:45 Audio Prompts',
              '03:30 Diversion Handling',
            ],
          ),
          DriverVideoItem(
            id: 'drv-3',
            title: 'Emergency SOS & Breakdown Incident Reporting',
            duration: '3:50 min',
            level: 'Advanced',
            category: 'Emergency SOS',
            views: '4.6k views',
            desc:
                'How to trigger the one-touch SOS button to call the control room and dispatch towing during an accident.',
            chapters: [
              '00:00 SOS Button',
              '01:15 Voice Dispatch',
              '02:45 Passenger Safety',
            ],
          ),
          DriverVideoItem(
            id: 'drv-4',
            title: 'Submitting Fuel Receipts & Depot Shift End',
            duration: '3:15 min',
            level: 'Beginner',
            category: 'Shift End',
            views: '2.3k views',
            desc:
                'Snapping photos of fuel receipts, recording final odometer readings, and submitting shift log.',
            chapters: [
              '00:00 Receipt Upload',
              '01:20 Odometer Photo',
              '02:30 Handover Sign-off',
            ],
          ),
        ],
      );
}

// ============================================================================
// 6. Support Ticket & Conversation Models
// ============================================================================
class SupportAttachmentModel {
  final String url;
  final String? fileName;
  final String? fileType;
  final String? fileSize;

  SupportAttachmentModel({
    required this.url,
    this.fileName,
    this.fileType,
    this.fileSize,
  });

  bool get isImage {
    final t = (fileType ?? '').toLowerCase();
    final u = url.toLowerCase();
    return t.startsWith('image/') ||
        u.endsWith('.jpg') ||
        u.endsWith('.jpeg') ||
        u.endsWith('.png') ||
        u.endsWith('.webp') ||
        u.endsWith('.gif');
  }

  factory SupportAttachmentModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return SupportAttachmentModel(url: '');
    return SupportAttachmentModel(
      url: json['url']?.toString() ?? json['fileUrl']?.toString() ?? '',
      fileName: json['fileName']?.toString() ?? json['name']?.toString(),
      fileType: json['fileType']?.toString(),
      fileSize: json['fileSize']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url,
        if (fileName != null) 'fileName': fileName,
        if (fileType != null) 'fileType': fileType,
        if (fileSize != null) 'fileSize': fileSize,
      };
}

class TicketMessageModel {
  final String id;
  final String? ticketId;
  final String? senderId;
  final String? senderRole;
  final String? senderName;
  final String body;
  final String? createdAt;
  final List<SupportAttachmentModel> attachments;
  final bool? _isStaffExplicit;

  TicketMessageModel({
    required this.id,
    this.ticketId,
    this.senderId,
    this.senderRole,
    this.senderName,
    required this.body,
    this.createdAt,
    this.attachments = const [],
    bool? isStaff,
  }) : _isStaffExplicit = isStaff;

  bool get isStaff {
    final staff = _isStaffExplicit;
    if (staff != null) return staff;
    final role = (senderRole ?? '').toLowerCase();
    if (role.contains('driver') || role == 'user' || role == 'me') return false;
    if (role.contains('admin') ||
        role.contains('tech') ||
        role.contains('noc') ||
        role.contains('support') ||
        role.contains('operator')) {
      return true;
    }
    return false;
  }

  bool get isDriverSender => !isStaff;

  String get formattedTime {
    if (createdAt == null || createdAt!.isEmpty) return '';
    try {
      final dt = DateTime.parse(createdAt!).toLocal();
      final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final ampm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '$hour:$min $ampm';
    } catch (_) {
      return createdAt!;
    }
  }

  factory TicketMessageModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TicketMessageModel(id: '', body: '');

    List<SupportAttachmentModel> atts = [];
    if (json['attachments'] is List) {
      atts = (json['attachments'] as List)
          .whereType<Map>()
          .map((a) => SupportAttachmentModel.fromJson(Map<String, dynamic>.from(a)))
          .toList();
    }

    bool? isStaffVal;
    if (json['is_staff'] != null) {
      isStaffVal = json['is_staff'] == true || json['is_staff'] == 1 || json['is_staff'] == 'true';
    } else if (json['isStaff'] != null) {
      isStaffVal = json['isStaff'] == true || json['isStaff'] == 1 || json['isStaff'] == 'true';
    }

    return TicketMessageModel(
      id: json['id']?.toString() ?? '',
      ticketId: json['ticketId']?.toString() ?? json['ticket_id']?.toString(),
      senderId: json['senderId']?.toString() ?? json['sender_id']?.toString(),
      senderRole: json['senderRole']?.toString() ?? json['sender_role']?.toString() ?? json['sender']?['role']?.toString(),
      senderName: json['senderName']?.toString() ?? json['sender_name']?.toString() ?? json['sender']?['name']?.toString(),
      body: json['body']?.toString() ?? json['message']?.toString() ?? json['text']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString(),
      attachments: atts,
      isStaff: isStaffVal,
    );
  }
}

class DriverSupportTicketModel {
  final String id;
  final String code;
  final String subject;
  final String category;
  final String priority; // 'low', 'medium', 'high', 'urgent'
  final String status; // 'open', 'in_progress', 'resolved', 'closed'
  final String description;
  final String? createdAt;
  final String? updatedAt;
  final List<SupportAttachmentModel> attachments;
  final List<TicketMessageModel> messages;

  DriverSupportTicketModel({
    required this.id,
    required this.code,
    required this.subject,
    required this.category,
    this.priority = 'medium',
    this.status = 'open',
    required this.description,
    this.createdAt,
    this.updatedAt,
    this.attachments = const [],
    this.messages = const [],
  });

  bool get isOpen {
    final s = status.toLowerCase();
    return s == 'open' || s == 'in_progress' || s == 'in progress' || s == 'pending';
  }

  bool get isResolved => status.toLowerCase() == 'resolved';
  bool get isClosed => status.toLowerCase() == 'closed';

  Color get statusColor {
    switch (status.toLowerCase()) {
      case 'resolved':
        return const Color(0xFF2ECC71);
      case 'closed':
        return Colors.grey;
      case 'in_progress':
      case 'in progress':
        return const Color(0xFF3F7BF5);
      case 'open':
      default:
        return const Color(0xFFFF9500);
    }
  }

  Color get priorityColor {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return const Color(0xFFFF4D4D);
      case 'high':
        return const Color(0xFFFF9500);
      case 'medium':
        return const Color(0xFF3F7BF5);
      case 'low':
      default:
        return Colors.grey;
    }
  }

  factory DriverSupportTicketModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return DriverSupportTicketModel(id: '', code: '', subject: '', category: 'General', description: '');
    }

    List<SupportAttachmentModel> atts = [];
    if (json['attachments'] is List) {
      atts = (json['attachments'] as List)
          .whereType<Map>()
          .map((a) => SupportAttachmentModel.fromJson(Map<String, dynamic>.from(a)))
          .toList();
    }

    List<TicketMessageModel> msgs = [];
    if (json['messages'] is List) {
      msgs = (json['messages'] as List)
          .whereType<Map>()
          .map((m) => TicketMessageModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    }

    return DriverSupportTicketModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? (json['id'] != null ? '#TKT-${json['id']}' : '#TKT'),
      subject: json['subject']?.toString() ?? json['title']?.toString() ?? 'Support Request',
      category: json['category']?.toString() ?? 'General',
      priority: json['priority']?.toString().toLowerCase() ?? 'medium',
      status: json['status']?.toString().toLowerCase() ?? 'open',
      description: json['description']?.toString() ?? json['message']?.toString() ?? '',
      createdAt: json['created_at']?.toString() ?? json['createdAt']?.toString(),
      updatedAt: json['updated_at']?.toString() ?? json['updatedAt']?.toString(),
      attachments: atts,
      messages: msgs,
    );
  }
}

// Retain legacy lightweight classes for backwards compatibility if referenced
class QuickHelpItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String route;

  QuickHelpItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

class ContactChannel {
  final String title;
  final String subtitle;
  final String statusText;
  final IconData icon;
  final Color statusColor;

  ContactChannel({
    required this.title,
    required this.subtitle,
    required this.statusText,
    required this.icon,
    required this.statusColor,
  });
}
