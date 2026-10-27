import 'package:flutter/material.dart';

enum SubscriptionStatus {
  active,
  paymentPending,
  pendingApproval,
  suspended,
  expiringSoon,
  inactive,
}

extension SubscriptionStatusX on SubscriptionStatus {
  String get label {
    switch (this) {
      case SubscriptionStatus.active:
        return 'Active';
      case SubscriptionStatus.paymentPending:
        return 'Payment Pending';
      case SubscriptionStatus.pendingApproval:
        return 'Pending Approval';
      case SubscriptionStatus.suspended:
        return 'Suspended';
      case SubscriptionStatus.expiringSoon:
        return 'Expiring Soon';
      case SubscriptionStatus.inactive:
        return 'Inactive';
    }
  }

  Color get color {
    switch (this) {
      case SubscriptionStatus.active:
        return const Color(0xFF10B981); // Emerald
      case SubscriptionStatus.paymentPending:
        return const Color(0xFFF59E0B); // Amber
      case SubscriptionStatus.pendingApproval:
        return const Color(0xFF6366F1); // Indigo
      case SubscriptionStatus.suspended:
      case SubscriptionStatus.inactive:
        return const Color(0xFFEF4444); // Red
      case SubscriptionStatus.expiringSoon:
        return const Color(0xFFFFA726); // Orange
    }
  }

  Color get badgeBg {
    switch (this) {
      case SubscriptionStatus.active:
        return const Color(0x1A10B981);
      case SubscriptionStatus.paymentPending:
        return const Color(0x1AF59E0B);
      case SubscriptionStatus.pendingApproval:
        return const Color(0x1A6366F1);
      case SubscriptionStatus.suspended:
      case SubscriptionStatus.inactive:
        return const Color(0x1AEF4444);
      case SubscriptionStatus.expiringSoon:
        return const Color(0x1AFFA726);
    }
  }
}

class Subscription {
  final String id;
  final String subscriptionCode;
  final String companyName;
  final String initials;
  final Color avatarColor;
  final String planName;
  final SubscriptionStatus status;
  final String rawStatus;
  final String dateRangeText;
  final int userCount;
  final String city;
  final String state;
  final String? logoUrl;
  final int busesCount;
  final int depotsCount;
  final String adminName;
  final String adminEmail;
  final String adminPhone;
  final String cin;
  final String gstin;

  Subscription({
    required this.id,
    required this.subscriptionCode,
    required this.companyName,
    required this.initials,
    required this.avatarColor,
    required this.planName,
    required this.status,
    required this.rawStatus,
    required this.dateRangeText,
    required this.userCount,
    this.city = '',
    this.state = '',
    this.logoUrl,
    this.busesCount = 25,
    this.depotsCount = 2,
    this.adminName = '',
    this.adminEmail = '',
    this.adminPhone = '',
    this.cin = '',
    this.gstin = '',
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    final statusStr = (json['status'] ?? 'active').toString().toLowerCase();
    SubscriptionStatus status = SubscriptionStatus.active;

    if (statusStr == 'payment_pending' || statusStr == 'payment pending') {
      status = SubscriptionStatus.paymentPending;
    } else if (statusStr == 'pending_approval' || statusStr == 'pending approval' || statusStr == 'pending') {
      status = SubscriptionStatus.pendingApproval;
    } else if (statusStr == 'suspended') {
      status = SubscriptionStatus.suspended;
    } else if (statusStr == 'inactive' || statusStr == 'cancelled' || statusStr == 'expired') {
      status = SubscriptionStatus.inactive;
    } else if (statusStr == 'expiring' || statusStr == 'expiring_soon') {
      status = SubscriptionStatus.expiringSoon;
    } else {
      status = SubscriptionStatus.active;
    }

    final name = (json['name'] ?? json['organization_name'] ?? json['companyName'] ?? json['tenant_name'] ?? 'Tenant Organization').toString();
    final initials = name.isNotEmpty
        ? name.trim().split(' ').map((p) => p.isNotEmpty ? p[0] : '').take(2).join().toUpperCase()
        : 'TO';

    // Plan resolution
    String plan = 'Standard Tier';
    final planData = json['plan'] ?? json['subscription'] ?? json['plan_name'];
    if (planData is Map) {
      plan = (planData['name'] ?? planData['code'] ?? 'Standard Tier').toString();
    } else if (planData != null && planData.toString().isNotEmpty) {
      plan = planData.toString();
    }

    // Admin user details
    String aName = '';
    String aEmail = '';
    String aPhone = '';
    final admin = json['admin_user'] ?? json['adminUser'] ?? json['admin'];
    if (admin is Map) {
      aName = (admin['name'] ?? admin['full_name'] ?? '').toString();
      aEmail = (admin['email'] ?? '').toString();
      aPhone = (admin['phone'] ?? admin['mobile'] ?? '').toString();
    } else {
      aName = (json['adminName'] ?? json['admin_name'] ?? '').toString();
      aEmail = (json['adminEmail'] ?? json['admin_email'] ?? '').toString();
      aPhone = (json['adminPhone'] ?? json['admin_phone'] ?? '').toString();
    }

    // Color based on initials hash
    final colorList = const [
      Color(0xFF2563EB), // Blue
      Color(0xFF6366F1), // Indigo
      Color(0xFF10B981), // Emerald
      Color(0xFFF59E0B), // Amber
      Color(0xFF8B5CF6), // Purple
      Color(0xFFEC4899), // Pink
      Color(0xFF06B6D4), // Cyan
    ];
    final colorIdx = initials.hashCode.abs() % colorList.length;

    return Subscription(
      id: (json['id'] ?? '').toString(),
      subscriptionCode: (json['subscription_code'] ?? json['subscriptionCode'] ?? 'ORG-${json['id'] ?? '001'}').toString(),
      companyName: name,
      initials: initials.isNotEmpty ? initials : 'TO',
      avatarColor: colorList[colorIdx],
      planName: plan,
      status: status,
      rawStatus: statusStr,
      dateRangeText: (json['renewal_date'] ?? json['created_at'] ?? 'Active License').toString().split('T').first,
      userCount: int.tryParse(json['user_count']?.toString() ?? '') ?? 5,
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      logoUrl: json['logo_url']?.toString() ?? json['logoUrl']?.toString(),
      busesCount: int.tryParse(json['buses_count']?.toString() ?? json['busesCount']?.toString() ?? '') ?? 25,
      depotsCount: int.tryParse(json['depots_count']?.toString() ?? json['depotsCount']?.toString() ?? '') ?? 2,
      adminName: aName,
      adminEmail: aEmail,
      adminPhone: aPhone,
      cin: (json['cin'] ?? '').toString(),
      gstin: (json['gstin'] ?? '').toString(),
    );
  }
}
