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

  factory TechnicianProfile.fromJson(Map<String, dynamic> json) {
    return TechnicianProfile(
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      techId: json['techId'] ?? '',
      employeeId: json['employeeId'] ?? '',
      profilePicture: json['profilePicture'],
      email: json['email'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      dateOfBirth: json['dateOfBirth'] ?? '',
      gender: json['gender'] ?? '',
      address: json['address'] ?? '',
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
