import 'dart:convert';
import 'package:flutter/material.dart';

/// Top summary stat card (Offline / Online / Issues)
class DeviceStat {
  final String count;
  final String title;
  final String subtitle;
  final Color color;
  final IconData icon;

  DeviceStat({
    required this.count,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.icon,
  });
}

/// Quick Action grid item (Display Devices, Hardware Configuration, etc.)
class QuickAction {
  final String title;
  final String subtitle;
  final String icon;
  final Color color;
  final String route;

  QuickAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.route,
  });
}

enum TaskStatus { pending, inProgress, completed }

/// Today's Task list item
class DashboardTask {
  final String id;
  final String title;
  final String subtitle;
  final String icon;
  final Color iconColor;
  TaskStatus status;

  DashboardTask({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.status,
  });

  String get statusLabel {
    switch (status) {
      case TaskStatus.pending:
        return 'Pending';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.completed:
        return 'Completed';
    }
  }

  Color get statusColor {
    switch (status) {
      case TaskStatus.pending:
        return const Color(0xFF7C6FF0);
      case TaskStatus.inProgress:
        return const Color(0xFF3FA9F5);
      case TaskStatus.completed:
        return const Color(0xFF2ECC71);
    }
  }
}

/// Technician Star Breakdown Item (5★ down to 1★)
class TechRatingBreakdownItem {
  final int stars;
  final int count;

  TechRatingBreakdownItem({required this.stars, required this.count});
}

/// Recent Client Feedback & Comment Item
class TechnicianReviewItem {
  final String id;
  final String code;
  final String? busNumber;
  final double rating;
  final String comment;
  final List<String> tags;
  final String? ratedAt;
  final String clientName;
  final String? organizationName;

  TechnicianReviewItem({
    required this.id,
    required this.code,
    this.busNumber,
    required this.rating,
    required this.comment,
    this.tags = const [],
    this.ratedAt,
    required this.clientName,
    this.organizationName,
  });

  factory TechnicianReviewItem.fromJson(Map<String, dynamic> json) {
    List<String> parsedTags = [];
    final rawTags = json['rating_tags'] ?? json['tags'];
    if (rawTags != null) {
      if (rawTags is List) {
        parsedTags = rawTags.map((t) => t.toString()).toList();
      } else if (rawTags is String) {
        try {
          final decoded = jsonDecode(rawTags);
          if (decoded is List) {
            parsedTags = decoded.map((t) => t.toString()).toList();
          } else {
            parsedTags = [rawTags];
          }
        } catch (_) {
          parsedTags = [rawTags];
        }
      }
    }

    String cName = 'Verified Client';
    if (json['ratedByUser'] is Map) {
      cName = json['ratedByUser']['name']?.toString() ?? 'Verified Client';
    } else if (json['clientName'] != null) {
      cName = json['clientName'].toString();
    } else if (json['user'] is Map) {
      cName = json['user']['name']?.toString() ?? 'Verified Client';
    }

    String? orgName;
    if (json['organization'] is Map) {
      orgName = json['organization']['name']?.toString();
    } else if (json['organizationName'] != null) {
      orgName = json['organizationName']?.toString();
    }

    final rawRating = json['rating'] ?? json['score'] ?? 5.0;
    final double ratingVal = (rawRating is num) ? rawRating.toDouble() : double.tryParse(rawRating.toString()) ?? 5.0;

    return TechnicianReviewItem(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      code: json['code']?.toString() ?? (json['id'] != null ? '#${json['id']}' : 'WO-101'),
      busNumber: json['bus_number']?.toString() ?? json['busNumber']?.toString(),
      rating: ratingVal,
      comment: json['rating_comment']?.toString() ?? json['comment']?.toString() ?? '',
      tags: parsedTags,
      ratedAt: json['rated_at']?.toString() ?? json['createdAt']?.toString(),
      clientName: cName,
      organizationName: orgName,
    );
  }
}

/// Comprehensive Technician Dashboard Stats Model
class TechnicianStatsModel {
  final double? averageRating;
  final int totalRatingsCount;
  final String? certLevel;
  final int fiveStarCount;
  final int fourStarCount;
  final int threeStarCount;
  final int twoStarCount;
  final int oneStarCount;
  final int onlineDevices;
  final int offlineDevices;
  final int issuesDevices;
  final int totalDevices;
  final List<TechnicianReviewItem> recentRatings;

  TechnicianStatsModel({
    this.averageRating,
    this.totalRatingsCount = 0,
    this.certLevel,
    this.fiveStarCount = 0,
    this.fourStarCount = 0,
    this.threeStarCount = 0,
    this.twoStarCount = 0,
    this.oneStarCount = 0,
    this.onlineDevices = 0,
    this.offlineDevices = 0,
    this.issuesDevices = 0,
    this.totalDevices = 0,
    this.recentRatings = const [],
  });

  List<TechRatingBreakdownItem> get ratingBreakdown => [
        TechRatingBreakdownItem(stars: 5, count: fiveStarCount),
        TechRatingBreakdownItem(stars: 4, count: fourStarCount),
        TechRatingBreakdownItem(stars: 3, count: threeStarCount),
        TechRatingBreakdownItem(stars: 2, count: twoStarCount),
        TechRatingBreakdownItem(stars: 1, count: oneStarCount),
      ];

  String get formattedRating => averageRating != null ? averageRating!.toStringAsFixed(1) : '0';

  factory TechnicianStatsModel.fromJson(Map<String, dynamic> json) {
    final rawAvg = json['averageRating'] ?? json['average_rating'] ?? json['rating'];
    final double? avg = (rawAvg != null)
        ? ((rawAvg is num) ? rawAvg.toDouble() : double.tryParse(rawAvg.toString()))
        : null;

    final totCount = int.tryParse(json['totalRatingsCount']?.toString() ?? json['total_ratings_count']?.toString() ?? '0') ?? 0;
    final fiveCount = int.tryParse(json['fiveStarCount']?.toString() ?? json['five_star_count']?.toString() ?? '0') ?? 0;
    final fourCount = int.tryParse(json['fourStarCount']?.toString() ?? json['four_star_count']?.toString() ?? '0') ?? 0;
    final threeCount = int.tryParse(json['threeStarCount']?.toString() ?? json['three_star_count']?.toString() ?? '0') ?? 0;
    final twoCount = int.tryParse(json['twoStarCount']?.toString() ?? json['two_star_count']?.toString() ?? '0') ?? 0;
    final oneCount = int.tryParse(json['oneStarCount']?.toString() ?? json['one_star_count']?.toString() ?? '0') ?? 0;

    final onDev = int.tryParse(json['onlineDevices']?.toString() ?? json['online_devices']?.toString() ?? '0') ?? 0;
    final offDev = int.tryParse(json['offlineDevices']?.toString() ?? json['offline_devices']?.toString() ?? '0') ?? 0;
    final issDev = int.tryParse(json['issuesDevices']?.toString() ?? json['issues_devices']?.toString() ?? json['brokenWithIssues']?.toString() ?? '0') ?? 0;
    final totDev = int.tryParse(json['totalDevices']?.toString() ?? json['total_devices']?.toString() ?? '0') ?? 0;

    List<TechnicianReviewItem> reviews = [];
    final rawReviews = json['recentRatings'] ?? json['recent_ratings'] ?? json['ratings'];
    if (rawReviews is List) {
      reviews = rawReviews
          .whereType<Map>()
          .map((r) => TechnicianReviewItem.fromJson(Map<String, dynamic>.from(r)))
          .toList();
    }

    return TechnicianStatsModel(
      averageRating: avg,
      totalRatingsCount: totCount,
      certLevel: json['certLevel']?.toString() ?? json['cert_level']?.toString() ?? 'Master Level 3',
      fiveStarCount: fiveCount,
      fourStarCount: fourCount,
      threeStarCount: threeCount,
      twoStarCount: twoCount,
      oneStarCount: oneCount,
      onlineDevices: onDev,
      offlineDevices: offDev,
      issuesDevices: issDev,
      totalDevices: totDev,
      recentRatings: reviews,
    );
  }

  /// Default graceful mock data when backend has no ratings yet
  factory TechnicianStatsModel.defaultMock() {
    return TechnicianStatsModel(
      averageRating: 4.9,
      totalRatingsCount: 18,
      certLevel: 'Master Level 3',
      fiveStarCount: 16,
      fourStarCount: 2,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0,
      onlineDevices: 28,
      offlineDevices: 3,
      issuesDevices: 1,
      totalDevices: 32,
      recentRatings: [
        TechnicianReviewItem(
          id: 'rev-1',
          code: 'WO-8821',
          busNumber: 'MH-02-EE-4192',
          rating: 5.0,
          comment: 'Quick RK3588 mainboard replacement and verified live ad playback. Zero passenger screen downtime.',
          tags: ['Fast Turnaround', 'Clean Wiring', 'NOC Verified'],
          ratedAt: '2026-11-15T14:30:00Z',
          clientName: 'Sunil Kulkarni',
          organizationName: 'Mumbai Transit Fleet',
        ),
        TechnicianReviewItem(
          id: 'rev-2',
          code: 'WO-8814',
          busNumber: 'MH-04-AB-1029',
          rating: 5.0,
          comment: 'CAN-bus telemetry packet loss diagnosed and fixed with 120-ohm terminator resistor swap.',
          tags: ['Accurate Diagnosis', 'Proactive Maintenance'],
          ratedAt: '2026-11-14T10:15:00Z',
          clientName: 'Rajesh Verma',
          organizationName: 'Apex City Buses',
        ),
      ],
    );
  }
}
