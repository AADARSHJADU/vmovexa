import 'package:flutter/material.dart';

enum SubscriptionStatus {
  active,
  paymentPending,
  pendingApproval,
  approved,
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
      case SubscriptionStatus.approved:
        return 'Approved';
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
        return const Color(0xFFF59E0B); // Amber
      case SubscriptionStatus.approved:
        return const Color(0xFF3B82F6); // Blue
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
        return const Color(0x1AF59E0B);
      case SubscriptionStatus.approved:
        return const Color(0x1A3B82F6);
      case SubscriptionStatus.suspended:
      case SubscriptionStatus.inactive:
        return const Color(0x1AEF4444);
      case SubscriptionStatus.expiringSoon:
        return const Color(0x1AFFA726);
    }
  }
}

class TenantPlanItem {
  final String id;
  final String name;
  final String code;

  TenantPlanItem({
    required this.id,
    required this.name,
    required this.code,
  });

  factory TenantPlanItem.fromJson(Map<String, dynamic> json) {
    return TenantPlanItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? json['code'] ?? '').toString(),
      code: (json['code'] ?? '').toString(),
    );
  }
}

class TenantDepotItem {
  final String id;
  final String name;
  final String code;
  final String status;
  final String address;
  final int capacity;
  final int currentParked;
  final int evChargers;
  final String contactPhone;

  TenantDepotItem({
    required this.id,
    required this.name,
    required this.code,
    required this.status,
    required this.address,
    required this.capacity,
    required this.currentParked,
    required this.evChargers,
    required this.contactPhone,
  });

  factory TenantDepotItem.fromJson(Map<String, dynamic> json) {
    return TenantDepotItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? 'Depot Terminal').toString(),
      code: (json['code'] ?? 'DEP-001').toString(),
      status: (json['status'] ?? 'operational').toString(),
      address: (json['address'] ?? json['location'] ?? 'Address not specified').toString(),
      capacity: int.tryParse(json['capacity']?.toString() ?? '') ?? 0,
      currentParked: int.tryParse(json['current_parked']?.toString() ?? json['parked']?.toString() ?? '') ?? 0,
      evChargers: int.tryParse(json['ev_chargers']?.toString() ?? json['ev_bays']?.toString() ?? '') ?? 0,
      contactPhone: (json['contact_phone'] ?? json['phone'] ?? '').toString(),
    );
  }
}

class TenantInvoiceItem {
  final String id;
  final String code;
  final String issuedAt;
  final String type;
  final double total;
  final String status;

  TenantInvoiceItem({
    required this.id,
    required this.code,
    required this.issuedAt,
    required this.type,
    required this.total,
    required this.status,
  });

  factory TenantInvoiceItem.fromJson(Map<String, dynamic> json) {
    return TenantInvoiceItem(
      id: (json['id'] ?? '').toString(),
      code: (json['code'] ?? json['invoice_number'] ?? 'INV-001').toString(),
      issuedAt: (json['issued_at'] ?? json['created_at'] ?? '').toString(),
      type: (json['type'] ?? 'saas_subscription').toString(),
      total: double.tryParse(json['total']?.toString() ?? json['amount']?.toString() ?? '') ?? 0.0,
      status: (json['status'] ?? 'paid').toString().toLowerCase(),
    );
  }
}

class Subscription {
  final String id;
  final String subscriptionCode;
  final String companyName;
  final String initials;
  final Color avatarColor;
  final String planName;
  final String? planId;
  final SubscriptionStatus status;
  final String rawStatus;
  final String paymentStatus; // 'paid', 'payment_pending'
  final String dateRangeText;
  final int userCount;
  final String city;
  final String state;
  final String? logoUrl;
  final int fleetsCount;
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
    this.planId,
    required this.status,
    required this.rawStatus,
    this.paymentStatus = 'paid',
    required this.dateRangeText,
    this.userCount = 0,
    this.city = '',
    this.state = '',
    this.logoUrl,
    this.fleetsCount = 0,
    this.busesCount = 0,
    this.depotsCount = 0,
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
    } else if (statusStr == 'approved') {
      status = SubscriptionStatus.approved;
    } else if (statusStr == 'suspended') {
      status = SubscriptionStatus.suspended;
    } else if (statusStr == 'inactive' || statusStr == 'cancelled' || statusStr == 'expired') {
      status = SubscriptionStatus.inactive;
    } else if (statusStr == 'expiring' || statusStr == 'expiring_soon') {
      status = SubscriptionStatus.expiringSoon;
    } else {
      status = SubscriptionStatus.active;
    }

    final rawPaymentStatus = (json['payment_status'] ?? json['paymentStatus'] ?? '').toString().toLowerCase();
    String paymentStatus = 'paid';
    if (rawPaymentStatus.isNotEmpty) {
      paymentStatus = rawPaymentStatus;
    } else if (statusStr == 'payment_pending' || statusStr == 'approved' || statusStr == 'awaiting_subscription') {
      paymentStatus = 'payment_pending';
    } else {
      paymentStatus = 'paid';
    }

    final name = (json['name'] ?? json['organization_name'] ?? json['companyName'] ?? json['tenant_name'] ?? 'Tenant Organization').toString();
    final initials = name.isNotEmpty
        ? name.trim().split(' ').map((p) => p.isNotEmpty ? p[0] : '').take(2).join().toUpperCase()
        : 'TO';

    // Plan resolution matching Admin Panel
    String plan = '';
    String? pId;
    final planData = json['plan'] ?? json['subscription'] ?? json['plan_name'];
    if (planData is Map) {
      plan = (planData['name'] ?? planData['code'] ?? '').toString();
      pId = planData['id']?.toString();
    } else if (planData != null && planData.toString().isNotEmpty) {
      plan = planData.toString();
    }
    if (plan.isEmpty && json['plan_id'] != null) {
      pId = json['plan_id']?.toString();
      plan = 'Plan #$pId';
    }

    // Admin user details
    String aName = '';
    String aEmail = '';
    String aPhone = '';
    final admin = json['admin_user'] ?? json['adminUser'] ?? json['admin'] ?? json['primaryAdmin'];
    if (admin is Map) {
      aName = (admin['name'] ?? admin['full_name'] ?? '').toString();
      aEmail = (admin['email'] ?? '').toString();
      aPhone = (admin['phone'] ?? admin['mobile'] ?? '').toString();
    } else {
      aName = (json['adminName'] ?? json['admin_name'] ?? '').toString();
      aEmail = (json['adminEmail'] ?? json['admin_email'] ?? '').toString();
      aPhone = (json['adminPhone'] ?? json['admin_phone'] ?? '').toString();
    }

    final logo = json['logo_url']?.toString() ??
        json['logoUrl']?.toString() ??
        json['logo']?.toString() ??
        (admin is Map ? admin['avatar_url']?.toString() : null);

    final int fleets = int.tryParse(json['fleets_count']?.toString() ?? json['fleetsCount']?.toString() ?? '') ?? 0;
    final int buses = int.tryParse(json['buses_count']?.toString() ?? json['busesCount']?.toString() ?? '') ?? 0;
    final int depots = int.tryParse(json['depots_count']?.toString() ?? json['depotsCount']?.toString() ?? '') ?? 0;
    final int users = int.tryParse(json['user_count']?.toString() ?? json['usersCount']?.toString() ?? '') ?? 0;

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
      subscriptionCode: (json['code'] ?? json['subscription_code'] ?? json['subscriptionCode'] ?? 'ORG-${json['id'] ?? '001'}').toString(),
      companyName: name,
      initials: initials.isNotEmpty ? initials : 'TO',
      avatarColor: colorList[colorIdx],
      planName: plan,
      planId: pId,
      status: status,
      rawStatus: statusStr,
      paymentStatus: paymentStatus,
      dateRangeText: (json['renewal_date'] ?? json['created_at'] ?? '').toString().split('T').first,
      userCount: users,
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      logoUrl: logo,
      fleetsCount: fleets,
      busesCount: buses,
      depotsCount: depots,
      adminName: aName,
      adminEmail: aEmail,
      adminPhone: aPhone,
      cin: (json['cin'] ?? '').toString(),
      gstin: (json['gstin'] ?? '').toString(),
    );
  }
}
