import '../../routes/app_routes.dart';

class OrganizationModel {
  final String? id;
  final String? name;
  final String? status;
  final String? plan;
  final String? officeAddress;

  OrganizationModel({
    this.id,
    this.name,
    this.status,
    this.plan,
    this.officeAddress,
  });

  factory OrganizationModel.fromJson(Map<String, dynamic> json) {
    return OrganizationModel(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      status: json['status']?.toString(),
      plan: json['plan']?.toString(),
      officeAddress: json['office_address']?.toString() ?? json['officeAddress']?.toString() ?? json['address']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'plan': plan,
      'office_address': officeAddress,
    };
  }
}

class UserModel {
  final String? id;
  final String? code;
  final String? enrollmentNo;
  final String? name;
  final String? email;
  final String? phone;
  final String? avatarUrl;
  final String? role;
  final String? roleId;
  final String? organizationId;
  final String? organizationName;
  final String? status;
  final OrganizationModel? organization;
  final List<String> permissions;

  // Profile & Preference Fields (persistent across sessions)
  final String? branch;
  final String? officeAddress;
  final String? language;
  final String? timezone;
  final String? companyName;
  final Map<String, dynamic>? advertiser;

  UserModel({
    this.id,
    this.code,
    this.enrollmentNo,
    this.name,
    this.email,
    this.phone,
    this.avatarUrl,
    this.role,
    this.roleId,
    this.organizationId,
    this.organizationName,
    this.status,
    this.organization,
    this.permissions = const [],
    this.branch,
    this.officeAddress,
    this.language,
    this.timezone,
    this.companyName,
    this.advertiser,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedPermissions = [];

    // Check direct permissions array
    if (json['permissions'] is List) {
      for (var p in json['permissions'] as List) {
        if (p is Map) {
          final key = p['key'] ?? p['name'] ?? p['id'];
          if (key != null) parsedPermissions.add(key.toString());
        } else if (p != null) {
          parsedPermissions.add(p.toString());
        }
      }
    }

    // Parse Role: can be Map (e.g. {"id": 2, "code": "ROLE-TENANT-ADMIN"}) or String
    String? parsedRole;
    if (json['role'] is Map) {
      final roleMap = json['role'] as Map;
      parsedRole = roleMap['code']?.toString() ??
          roleMap['name']?.toString() ??
          roleMap['id']?.toString();

      // If permissions were inside role.permissions
      if (parsedPermissions.isEmpty && roleMap['permissions'] is List) {
        for (var p in roleMap['permissions'] as List) {
          if (p is Map) {
            final key = p['key'] ?? p['name'] ?? p['id'];
            if (key != null) parsedPermissions.add(key.toString());
          } else if (p != null) {
            parsedPermissions.add(p.toString());
          }
        }
      }
    } else if (json['role'] != null) {
      parsedRole = json['role']?.toString();
    } else if (json['role_name'] != null) {
      parsedRole = json['role_name']?.toString();
    }

    OrganizationModel? parsedOrg;
    if (json['organization'] is Map<String, dynamic>) {
      parsedOrg = OrganizationModel.fromJson(json['organization'] as Map<String, dynamic>);
    } else if (json['organization'] is Map) {
      parsedOrg = OrganizationModel.fromJson(Map<String, dynamic>.from(json['organization'] as Map));
    }

    Map<String, dynamic>? parsedAdvertiser;
    if (json['advertiser'] is Map) {
      parsedAdvertiser = Map<String, dynamic>.from(json['advertiser'] as Map);
    }

    // Parse branch / division - matching Admin Panel: user.branch || user.division
    String? parsedBranch = json['branch']?.toString() ??
        json['division']?.toString() ??
        parsedAdvertiser?['branch']?.toString();
    if (parsedBranch == null && parsedAdvertiser != null) {
      parsedBranch = 'Regional Advertising Desk';
    }

    // Parse office address / address - exactly matching Admin Panel:
    // user.advertiser?.address || user.organization?.office_address || user.address || ''
    String? parsedAddress = parsedAdvertiser?['address']?.toString() ??
        parsedAdvertiser?['office_address']?.toString() ??
        json['office_address']?.toString() ??
        json['officeAddress']?.toString() ??
        json['address']?.toString() ??
        parsedOrg?.officeAddress;

    // Parse language
    String? parsedLang;
    if (json['language'] is Map) {
      parsedLang = json['language']['name']?.toString() ?? json['language']['code']?.toString();
    } else if (json['language'] != null) {
      parsedLang = json['language']?.toString();
    }

    // Parse timezone
    String? parsedTimezone = json['timezone']?.toString() ??
        json['timeZone']?.toString() ??
        json['time_zone']?.toString();

    // Parse company name - exactly matching Admin Panel:
    // user.advertiser?.company_name || user.advertiser?.name || user.organization?.name || user.company_name || user.companyName || ''
    String? parsedCompanyName = parsedAdvertiser?['company_name']?.toString() ??
        parsedAdvertiser?['name']?.toString() ??
        json['companyName']?.toString() ??
        json['company_name']?.toString() ??
        json['organization_name']?.toString() ??
        parsedOrg?.name;

    // Parse code / empId - exactly matching Admin Panel:
    // user.advertiser?.code || user.enrollment_no || user.code || (user.id ? `ADV-${user.id}` : 'ADV-001')
    String? parsedCode = parsedAdvertiser?['code']?.toString() ??
        json['code']?.toString() ??
        json['enrollment_no']?.toString() ??
        (json['id'] != null ? 'ADV-${json['id']}' : 'ADV-001');

    return UserModel(
      id: json['id']?.toString(),
      code: parsedCode,
      enrollmentNo: json['enrollment_no']?.toString(),
      name: json['name']?.toString(),
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      avatarUrl: json['avatar_url']?.toString() ?? json['avatarUrl']?.toString(),
      role: parsedRole,
      roleId: json['role_id']?.toString(),
      organizationId: json['organization_id']?.toString(),
      organizationName: parsedCompanyName ?? json['organization_name']?.toString() ?? parsedOrg?.name,
      status: json['status']?.toString(),
      organization: parsedOrg,
      permissions: parsedPermissions,
      branch: parsedBranch,
      officeAddress: parsedAddress,
      language: parsedLang,
      timezone: parsedTimezone,
      companyName: parsedCompanyName,
      advertiser: parsedAdvertiser,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'enrollment_no': enrollmentNo,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar_url': avatarUrl,
      'role': role,
      'role_id': roleId,
      'organization_id': organizationId,
      'organization_name': organizationName ?? companyName,
      'status': status,
      'organization': organization?.toJson(),
      'permissions': permissions,
      'branch': branch,
      'office_address': officeAddress,
      'address': officeAddress,
      'language': language,
      'timezone': timezone,
      'company_name': companyName,
      'companyName': companyName,
      if (advertiser != null) 'advertiser': advertiser,
    };
  }

  /// Maps backend role string (e.g. ROLE-TENANT-ADMIN) to frontend display role
  String get displayRole {
    final r = (role ?? '').toUpperCase();
    if (r.contains('TENANT') || r.contains('FLEET')) {
      return 'Fleet Operator';
    } else if (r.contains('ADVERTIS')) {
      return 'Advertisement';
    } else if (r.contains('GOVERN')) {
      return 'Government';
    } else if (r.contains('TECH')) {
      return 'Technician';
    } else if (r.contains('DRIVER')) {
      return 'Driver';
    } else if (r.contains('FINANCE')) {
      return 'Finance';
      // } else if (r.contains('SUPERADMIN')) {
      //   return 'Super Admin';
      // }
    }
    return role ?? 'Fleet Operator';
  }

  /// Resolves the landing route based on user role
  String get dashboardRoute {
    final r = (role ?? '').toUpperCase();
    if (r.contains('TENANT') || r.contains('FLEET')) {
      return Routes.FLEET_OP_DASHBOARD;
    } else if (r.contains('ADVERTIS')) {
      return Routes.ADVERTISER_DASHBOARD;
    } else if (r.contains('GOVT') || r.contains('GOVERN')) {
      return Routes.GOVERNMENT_DASHBOARD;
    } else if (r.contains('TECH')) {
      return Routes.TECHNICIAN_DASHBOARD;
    } else if (r.contains('DRIVER')) {
      return Routes.DRIVER_DASHBOARD;
    } else if (r.contains('FINANCE')) {
      return Routes.FINANCE_DASHBOARD;
    }
    return Routes.FLEET_OP_DASHBOARD;
  }

  UserModel copyWith({
    String? id,
    String? code,
    String? enrollmentNo,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    String? role,
    String? roleId,
    String? organizationId,
    String? organizationName,
    String? status,
    OrganizationModel? organization,
    List<String>? permissions,
    String? branch,
    String? officeAddress,
    String? language,
    String? timezone,
    String? companyName,
  }) {
    return UserModel(
      id: id ?? this.id,
      code: code ?? this.code,
      enrollmentNo: enrollmentNo ?? this.enrollmentNo,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      roleId: roleId ?? this.roleId,
      organizationId: organizationId ?? this.organizationId,
      organizationName: organizationName ?? this.organizationName,
      status: status ?? this.status,
      organization: organization ?? this.organization,
      permissions: permissions ?? this.permissions,
      branch: branch ?? this.branch,
      officeAddress: officeAddress ?? this.officeAddress,
      language: language ?? this.language,
      timezone: timezone ?? this.timezone,
      companyName: companyName ?? this.companyName,
    );
  }
}

