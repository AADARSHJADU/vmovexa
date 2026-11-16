import 'package:flutter/material.dart';

// ============================================================================
// 1. Contact / Engineering Escalation NOC Model
// ============================================================================
class TechContactInfo {
  final String theme; // 'slate', 'dark', 'blue', 'red'
  final String badge;
  final String title;
  final String description;
  final String ctaText;

  TechContactInfo({
    this.theme = 'slate',
    this.badge = 'Engineering Escalation NOC',
    this.title = 'noc-tech@vmovexa.com / Extension 404',
    this.description = 'Live hardware engineering dispatch for RK3588, GPS antenna, and CAN-bus troubleshooting.',
    this.ctaText = 'Contact Engineering NOC',
  });

  factory TechContactInfo.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TechContactInfo();
    return TechContactInfo(
      theme: json['theme']?.toString() ?? 'slate',
      badge: json['badge']?.toString() ?? 'Engineering Escalation NOC',
      title: json['title']?.toString() ?? 'noc-tech@vmovexa.com / Extension 404',
      description: json['description']?.toString() ??
          'Live hardware engineering dispatch for RK3588, GPS antenna, and CAN-bus troubleshooting.',
      ctaText: json['ctaText']?.toString() ?? 'Contact Engineering NOC',
    );
  }
}

// ============================================================================
// 2. SOP Guides Model
// ============================================================================
class TechGuideItem {
  final String title;
  final String desc;
  final String icon; // 'Document', 'Car', 'Shield', 'Clock'
  final String? url;

  TechGuideItem({
    required this.title,
    required this.desc,
    required this.icon,
    this.url,
  });

  factory TechGuideItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return TechGuideItem(title: 'Guide', desc: '', icon: 'Document');
    }
    return TechGuideItem(
      title: json['title']?.toString() ?? 'Guide',
      desc: json['desc']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'Document',
      url: json['url']?.toString() ?? json['docUrl']?.toString() ?? json['pdfUrl']?.toString(),
    );
  }

  bool get hasPdf => true; // Always launchable as PDF

  IconData get iconData {
    switch (icon.toLowerCase()) {
      case 'car':
        return Icons.cable_outlined; // CAN-bus
      case 'shield':
        return Icons.security_update_good_outlined; // Firmware runbook
      case 'clock':
        return Icons.inventory_2_outlined; // Depot spares RMA
      case 'document':
      default:
        return Icons.tv_outlined; // Display mounting
    }
  }

  Color get iconColor {
    switch (icon.toLowerCase()) {
      case 'car':
        return const Color(0xFF3F7BF5); // Blue for CAN-bus
      case 'shield':
        return const Color(0xFF2ECC71); // Green for recovery
      case 'clock':
        return const Color(0xFFFFA726); // Orange for depot
      case 'document':
      default:
        return const Color(0xFFDA29F4); // Magenta/Pink for display
    }
  }
}

// ============================================================================
// 3. Technician FAQ Model
// ============================================================================
class TechFaqItem {
  final String question;
  final String answer;

  TechFaqItem({required this.question, required this.answer});

  factory TechFaqItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TechFaqItem(question: '', answer: '');
    return TechFaqItem(
      question: json['q']?.toString() ?? json['question']?.toString() ?? json['title']?.toString() ?? '',
      answer: json['a']?.toString() ?? json['answer']?.toString() ?? json['content']?.toString() ?? '',
    );
  }
}

// ============================================================================
// 4. Video Academy Model
// ============================================================================
class TechVideoItem {
  final String id;
  final String title;
  final String duration;
  final String level;
  final String category;
  final String views;
  final String desc;
  final List<String> chapters;

  TechVideoItem({
    required this.id,
    required this.title,
    required this.duration,
    required this.level,
    required this.category,
    required this.views,
    required this.desc,
    this.chapters = const [],
  });

  factory TechVideoItem.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return TechVideoItem(
        id: '',
        title: '',
        duration: '',
        level: 'Intermediate',
        category: 'Hardware',
        views: '',
        desc: '',
      );
    }

    List<String> ch = [];
    if (json['chapters'] is List) {
      ch = (json['chapters'] as List).map((e) => e.toString()).toList();
    }

    return TechVideoItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '',
      level: json['level']?.toString() ?? 'Intermediate',
      category: json['category']?.toString() ?? 'Hardware',
      views: json['views']?.toString() ?? '',
      desc: json['desc']?.toString() ?? '',
      chapters: ch,
    );
  }
}

class TechVideoAcademy {
  final String badge;
  final String title;
  final String description;
  final List<TechVideoItem> videos;

  TechVideoAcademy({
    this.badge = 'Technician Hardware Academy',
    this.title = 'Hardware Diagnostics & Field Repair Tutorials',
    this.description = 'Step-by-step video manuals for RK3588 board replacement, CAN-bus sniffer diagnostics, and display harness repairs.',
    this.videos = const [],
  });

  factory TechVideoAcademy.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TechVideoAcademy();
    List<TechVideoItem> vids = [];
    if (json['videos'] is List) {
      vids = (json['videos'] as List)
          .whereType<Map>()
          .map((v) => TechVideoItem.fromJson(Map<String, dynamic>.from(v)))
          .toList();
    }
    return TechVideoAcademy(
      badge: json['badge']?.toString() ?? 'Technician Hardware Academy',
      title: json['title']?.toString() ?? 'Hardware Diagnostics & Field Repair Tutorials',
      description: json['description']?.toString() ??
          'Step-by-step video manuals for RK3588 board replacement, CAN-bus sniffer diagnostics, and display harness repairs.',
      videos: vids,
    );
  }
}

// ============================================================================
// 5. Aggregate Technician Help Content Model
// ============================================================================
class TechHelpContentModel {
  final String title;
  final String summary;
  final TechContactInfo contact;
  final List<TechGuideItem> guides;
  final List<TechFaqItem> faqs;
  final TechVideoAcademy? videoAcademy;

  TechHelpContentModel({
    required this.title,
    required this.summary,
    required this.contact,
    required this.guides,
    required this.faqs,
    this.videoAcademy,
  });

  factory TechHelpContentModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return TechHelpContentModel.defaultTechnicianHelp();

    Map<String, dynamic>? sections;
    if (json['sections'] is Map) {
      sections = Map<String, dynamic>.from(json['sections'] as Map);
    }

    final contact = TechContactInfo.fromJson(sections?['contact'] as Map<String, dynamic>?);

    List<TechGuideItem> guides = [];
    final rawGuides = sections?['guides'];
    if (rawGuides is List && rawGuides.isNotEmpty) {
      guides = rawGuides
          .whereType<Map>()
          .map((g) => TechGuideItem.fromJson(Map<String, dynamic>.from(g)))
          .toList();
    } else {
      guides = TechHelpContentModel.defaultGuides;
    }

    List<TechFaqItem> faqs = [];
    final rawFaqs = sections?['faqs'] ?? json['faqs'];
    if (rawFaqs is List && rawFaqs.isNotEmpty) {
      faqs = rawFaqs
          .whereType<Map>()
          .map((f) => TechFaqItem.fromJson(Map<String, dynamic>.from(f)))
          .toList();
    } else {
      faqs = TechHelpContentModel.defaultFaqs;
    }

    TechVideoAcademy? videoAcademy;
    if (sections?['videoAcademy'] is Map) {
      videoAcademy = TechVideoAcademy.fromJson(Map<String, dynamic>.from(sections!['videoAcademy'] as Map));
    } else {
      videoAcademy = TechHelpContentModel.defaultVideoAcademy;
    }

    return TechHelpContentModel(
      title: json['title']?.toString() ?? 'Technician Field Help & Documentation',
      summary: json['summary']?.toString() ??
          'Screen mounting schematics, CAN-bus pinouts, firmware flashing, and depot diagnostic toolkits.',
      contact: contact,
      guides: guides,
      faqs: faqs,
      videoAcademy: videoAcademy,
    );
  }

  factory TechHelpContentModel.defaultTechnicianHelp() {
    return TechHelpContentModel(
      title: 'Technician Field Help & Documentation',
      summary: 'Screen mounting schematics, CAN-bus pinouts, firmware flashing, and depot diagnostic toolkits.',
      contact: TechContactInfo(),
      guides: defaultGuides,
      faqs: defaultFaqs,
      videoAcademy: defaultVideoAcademy,
    );
  }

  static List<TechGuideItem> get defaultGuides => [
        TechGuideItem(
          title: 'Display Mounting Guide',
          desc: 'Commercial 15.6" screen installation',
          icon: 'Document',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ),
        TechGuideItem(
          title: 'CAN-bus J1939 Pinouts',
          desc: 'OBD-II baud rates & telemetry binding',
          icon: 'Car',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ),
        TechGuideItem(
          title: 'Firmware Recovery Runbook',
          desc: 'RK3588 recovery & cache wipe SOP',
          icon: 'Shield',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ),
        TechGuideItem(
          title: 'Depot Spares RMA',
          desc: 'Warranty replacement & parts inventory',
          icon: 'Clock',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ),
      ];

  static List<TechFaqItem> get defaultFaqs => [
        TechFaqItem(
          question: 'How do I perform a hard reset on the RK3588 display board?',
          answer:
              'Hold the recovery button located adjacent to the micro-USB OTG port for 8 seconds while powering on. The blue LED will pulse rapidly indicating recovery mode.',
        ),
        TechFaqItem(
          question: 'What is the standard baud rate for CAN-bus J1939 telematics?',
          answer:
              'Standard transit telemetry interfaces operate at 250 kbps (J1939-11) or 500 kbps (J1939-14) depending on the vehicle chassis generation.',
        ),
        TechFaqItem(
          question: 'How to diagnose screen flickering or black screen issues?',
          answer:
              'Check 12V/24V power supply ripple using a multimeter. Ensure HDMI ribbon cable is seated firmly and ad cache storage is not full.',
        ),
        TechFaqItem(
          question: 'Where do I submit completed repair work orders?',
          answer:
              'Open your Active Tasks, select the assigned vehicle work order, attach photos of the repair and the signed driver handover sheet, and click "Submit & Close".',
        ),
      ];

  static TechVideoAcademy get defaultVideoAcademy => TechVideoAcademy(
        badge: 'Technician Hardware Academy',
        title: 'Hardware Diagnostics & Field Repair Tutorials',
        description:
            'Step-by-step video manuals for RK3588 board replacement, CAN-bus sniffer diagnostics, and display harness repairs.',
        videos: [
          TechVideoItem(
            id: 'tech-1',
            title: 'RK3588 Mainboard Swap & Firmware Recovery',
            duration: '4:45 min',
            level: 'Advanced',
            category: 'Mainboard',
            views: '3.8k views',
            desc:
                'Hands-on guide to de-soldering, thermal paste application, mounting new RK3588 core compute board, and flashing verified boot image.',
            chapters: [
              '00:00 - Safety & ESD Precautions',
              '01:10 - Disassembling Protective Enclosure',
              '02:20 - OTG Firmware Flashing SOP',
              '03:45 - Post-boot Diagnostic Self-Test',
            ],
          ),
          TechVideoItem(
            id: 'tech-2',
            title: 'CAN-bus J1939 Telemetry & OBD-II Calibration',
            duration: '3:30 min',
            level: 'Intermediate',
            category: 'Wiring & Telemetry',
            views: '4.2k views',
            desc:
                'Connecting oscilloscope & USB-CAN sniffer to identify CAN-High/CAN-Low pins, terminating 120-ohm resistors, and reading RPM/speed telemetry.',
            chapters: [
              '00:00 - OBD-II Pinout Overview',
              '01:00 - Baud Rate Selection (250k vs 500k)',
              '02:15 - Sniffing Telemetry Packets',
            ],
          ),
          TechVideoItem(
            id: 'tech-3',
            title: 'Active GPS Antenna Installation & Signal Check',
            duration: '2:50 min',
            level: 'Beginner',
            category: 'Antenna & GNSS',
            views: '2.9k views',
            desc:
                'Roof mounting magnetic GPS puck antenna, routing low-loss RG174 coaxial cable, and locking 8+ satellite constellations with HDOP < 1.2.',
            chapters: [
              '00:00 - Antenna Placement Best Practices',
              '01:15 - SMA Connector Torque & Sealing',
              '02:00 - GNSS Lock Verification',
            ],
          ),
          TechVideoItem(
            id: 'tech-4',
            title: '15.6" Commercial Display Power & HDMI Harnessing',
            duration: '5:15 min',
            level: 'Intermediate',
            category: 'Screen & Power',
            views: '6.1k views',
            desc:
                'Testing 12V/24V buck converter output ripple, LVDS/eDP ribbon cable seating, and anti-glare tempered glass bracket alignment.',
            chapters: [
              '00:00 - Multimeter Power Rail Check',
              '01:45 - Ribbon Cable Inspection',
              '03:30 - Vibration Damper Installation',
            ],
          ),
        ],
      );
}

// ============================================================================
// 6. Support Ticket & Attachment Models
// ============================================================================
class SupportAttachmentModel {
  final String? url;
  final String? name;
  final String? fileType;
  final int? size;

  SupportAttachmentModel({
    this.url,
    this.name,
    this.fileType,
    this.size,
  });

  factory SupportAttachmentModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return SupportAttachmentModel();
    return SupportAttachmentModel(
      url: json['url']?.toString(),
      name: json['name']?.toString() ?? json['filename']?.toString(),
      fileType: json['fileType']?.toString() ?? json['type']?.toString(),
      size: json['size'] is int ? json['size'] as int : int.tryParse(json['size']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() => {
        'url': url,
        'name': name,
        'fileType': fileType,
        if (size != null) 'size': size,
      };
}

class TechTicketMessageModel {
  final String id;
  final String sender; // 'user' or 'support' / 'admin'
  final String message;
  final String? createdAt;
  final List<SupportAttachmentModel> attachments;

  TechTicketMessageModel({
    required this.id,
    required this.sender,
    required this.message,
    this.createdAt,
    this.attachments = const [],
  });

  factory TechTicketMessageModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return TechTicketMessageModel(id: '', sender: 'user', message: '');
    }

    List<SupportAttachmentModel> atts = [];
    if (json['attachments'] is List) {
      atts = (json['attachments'] as List)
          .whereType<Map>()
          .map((a) => SupportAttachmentModel.fromJson(Map<String, dynamic>.from(a)))
          .toList();
    }

    final senderVal = json['sender']?.toString() ?? json['author']?.toString() ?? 'user';

    return TechTicketMessageModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      sender: senderVal,
      message: json['message']?.toString() ?? json['text']?.toString() ?? json['content']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? json['timestamp']?.toString(),
      attachments: atts,
    );
  }

  bool get isUser => sender.toLowerCase() == 'user' || sender.toLowerCase() == 'technician' || sender.toLowerCase() == 'me';
}

class TechSupportTicketModel {
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
  final List<TechTicketMessageModel> messages;

  TechSupportTicketModel({
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
        return const Color(0xFFFFA726);
    }
  }

  Color get priorityColor {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return const Color(0xFFFF4D4D);
      case 'high':
        return const Color(0xFFFF9800);
      case 'low':
        return const Color(0xFF2ECC71);
      case 'medium':
      default:
        return const Color(0xFF3F7BF5);
    }
  }

  factory TechSupportTicketModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return TechSupportTicketModel(id: '', code: '', subject: '', category: '', description: '');
    }

    List<SupportAttachmentModel> atts = [];
    if (json['attachments'] is List) {
      atts = (json['attachments'] as List)
          .whereType<Map>()
          .map((a) => SupportAttachmentModel.fromJson(Map<String, dynamic>.from(a)))
          .toList();
    }

    List<TechTicketMessageModel> msgs = [];
    if (json['messages'] is List) {
      msgs = (json['messages'] as List)
          .whereType<Map>()
          .map((m) => TechTicketMessageModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    }

    return TechSupportTicketModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? json['ticketNumber']?.toString() ?? json['ticketId']?.toString() ?? 'TKT-0000',
      subject: json['subject']?.toString() ?? json['title']?.toString() ?? '',
      category: json['category']?.toString() ?? 'General Hardware',
      priority: json['priority']?.toString() ?? 'medium',
      status: json['status']?.toString() ?? 'open',
      description: json['description']?.toString() ?? '',
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
      attachments: atts,
      messages: msgs,
    );
  }
}
