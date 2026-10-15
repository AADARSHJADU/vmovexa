import 'user_model.dart';

class AuthResponseModel {
  final String? accessToken;
  final String? refreshToken;
  final UserModel? user;

  // MFA fields
  final bool mfaRequired;
  final String? mfaToken;
  final String? phoneMasked;

  // Phone OTP request fields
  final String? phone;
  final int? expiresInSeconds;

  // Registration response fields
  final String? organizationId;
  final String? status;
  final String? submittedAt;

  AuthResponseModel({
    this.accessToken,
    this.refreshToken,
    this.user,
    this.mfaRequired = false,
    this.mfaToken,
    this.phoneMasked,
    this.phone,
    this.expiresInSeconds,
    this.organizationId,
    this.status,
    this.submittedAt,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    UserModel? parsedUser;
    if (json['user'] is Map<String, dynamic>) {
      parsedUser = UserModel.fromJson(json['user'] as Map<String, dynamic>);
    } else if (json['user'] != null && json['user'] is Map) {
      parsedUser = UserModel.fromJson(Map<String, dynamic>.from(json['user'] as Map));
    }

    // Try finding access_token in root or in nested tokens map
    String? token = json['access_token']?.toString() ??
        json['accessToken']?.toString() ??
        json['token']?.toString();

    // Try finding refresh_token
    String? rToken = json['refresh_token']?.toString() ??
        json['refreshToken']?.toString();

    // Check nested tokens map if present: "tokens": { "access_token": "...", ... }
    if (json['tokens'] is Map) {
      final tokensMap = json['tokens'] as Map;
      token ??= tokensMap['access_token']?.toString() ??
          tokensMap['accessToken']?.toString() ??
          tokensMap['token']?.toString();
      rToken ??= tokensMap['refresh_token']?.toString() ??
          tokensMap['refreshToken']?.toString();
    }

    return AuthResponseModel(
      accessToken: token,
      refreshToken: rToken,
      user: parsedUser,
      mfaRequired: json['mfa_required'] == true || json['mfaRequired'] == true,
      mfaToken: json['mfa_token']?.toString() ?? json['mfaToken']?.toString(),
      phoneMasked: json['phone_masked']?.toString() ?? json['phoneMasked']?.toString(),
      phone: json['phone']?.toString(),
      expiresInSeconds: json['expires_in_seconds'] is num
          ? (json['expires_in_seconds'] as num).toInt()
          : (json['expiresInSeconds'] is num
              ? (json['expiresInSeconds'] as num).toInt()
              : null),
      organizationId: json['organization_id']?.toString() ?? json['organizationId']?.toString(),
      status: json['status']?.toString(),
      submittedAt: json['submitted_at']?.toString() ?? json['submittedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'user': user?.toJson(),
      'mfa_required': mfaRequired,
      'mfa_token': mfaToken,
      'phone_masked': phoneMasked,
      'phone': phone,
      'expires_in_seconds': expiresInSeconds,
      'organization_id': organizationId,
      'status': status,
      'submitted_at': submittedAt,
    };
  }
}
