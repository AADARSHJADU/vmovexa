import 'package:vmovexa/app/data/models/user_model.dart';

class TechnicianProfile {
  final String name;
  final String role;
  final String techId;
  final String employeeId;
  final String? profilePicture;
  final String email;
  final String phoneNumber;
  final String dateOfBirth;
  final String gender;
  final String address;
  final String department;
  final String reportingManager;
  final String workLocation;
  final String joinedDate;
  final String username;

  TechnicianProfile({
    required this.name,
    required this.role,
    required this.techId,
    required this.employeeId,
    this.profilePicture,
    required this.email,
    required this.phoneNumber,
    required this.dateOfBirth,
    required this.gender,
    required this.address,
    required this.department,
    required this.reportingManager,
    required this.workLocation,
    required this.joinedDate,
    required this.username,
  });

  factory TechnicianProfile.fromUserModel(UserModel user) {
    final email = user.email ?? '';
    final usernameFromEmail = email.contains('@') ? email.split('@').first : 'technician';
    final orgName = user.organizationName ?? user.organization?.name ?? 'Field Operations';
    final branchName = user.branch ?? 'Main Depot';

    return TechnicianProfile(
      name: (user.name != null && user.name!.trim().isNotEmpty) ? user.name!.trim() : 'Technician',
      role: (user.role != null && user.role!.trim().isNotEmpty) ? user.role!.trim() : 'Senior Technician',
      techId: user.code ?? user.id ?? 'TECH-001',
      employeeId: user.enrollmentNo ?? user.code ?? 'EMP-001',
      profilePicture: user.avatarUrl,
      email: email,
      phoneNumber: user.phone ?? '',
      dateOfBirth: '15 May 1990',
      gender: 'Male',
      address: user.officeAddress ?? user.branch ?? '',
      department: orgName,
      reportingManager: 'Operations Lead',
      workLocation: branchName,
      joinedDate: '10 Jan 2022',
      username: usernameFromEmail,
    );
  }

  TechnicianProfile copyWith({
    String? name,
    String? role,
    String? techId,
    String? employeeId,
    String? profilePicture,
    String? email,
    String? phoneNumber,
    String? dateOfBirth,
    String? gender,
    String? address,
    String? department,
    String? reportingManager,
    String? workLocation,
    String? joinedDate,
    String? username,
  }) {
    return TechnicianProfile(
      name: name ?? this.name,
      role: role ?? this.role,
      techId: techId ?? this.techId,
      employeeId: employeeId ?? this.employeeId,
      profilePicture: profilePicture ?? this.profilePicture,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      department: department ?? this.department,
      reportingManager: reportingManager ?? this.reportingManager,
      workLocation: workLocation ?? this.workLocation,
      joinedDate: joinedDate ?? this.joinedDate,
      username: username ?? this.username,
    );
  }

  factory TechnicianProfile.fromJson(Map<String, dynamic> json) {
    return TechnicianProfile(
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      techId: json['techId'] ?? '',
      employeeId: json['employeeId'] ?? '',
      profilePicture: json['profilePicture'] ?? json['avatar_url'] ?? json['avatarUrl'],
      email: json['email'] ?? '',
      phoneNumber: json['phoneNumber'] ?? json['phone'] ?? '',
      dateOfBirth: json['dateOfBirth'] ?? '',
      gender: json['gender'] ?? '',
      address: json['address'] ?? json['office_address'] ?? '',
      department: json['department'] ?? '',
      reportingManager: json['reportingManager'] ?? '',
      workLocation: json['workLocation'] ?? '',
      joinedDate: json['joinedDate'] ?? '',
      username: json['username'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'role': role,
      'techId': techId,
      'employeeId': employeeId,
      'profilePicture': profilePicture,
      'email': email,
      'phoneNumber': phoneNumber,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'address': address,
      'department': department,
      'reportingManager': reportingManager,
      'workLocation': workLocation,
      'joinedDate': joinedDate,
      'username': username,
    };
  }
}
