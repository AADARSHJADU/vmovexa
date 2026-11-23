class ApiResponseModel<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;
  final List<dynamic>? errors;
  final int? statusCode;
  final Map<String, dynamic>? meta;

  ApiResponseModel({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.errors,
    this.statusCode,
    this.meta,
  });

  factory ApiResponseModel.fromJson(
    Map<String, dynamic> json, {
    T Function(dynamic data)? create,
    int? statusCode,
  }) {
    return ApiResponseModel<T>(
      success: json['success'] == true,
      message: json['message']?.toString(),
      data: json['data'] != null && create != null
          ? create(json['data'])
          : json['data'] as T?,
      error: json['error']?.toString(),
      errors: json['errors'] is List ? json['errors'] as List<dynamic> : null,
      statusCode: statusCode,
      meta: json['meta'] is Map<String, dynamic>
          ? json['meta'] as Map<String, dynamic>
          : (json['meta'] is Map ? Map<String, dynamic>.from(json['meta'] as Map) : null),
    );
  }

  factory ApiResponseModel.failure({
    required String message,
    String? error,
    List<dynamic>? errors,
    int? statusCode,
    Map<String, dynamic>? meta,
  }) {
    return ApiResponseModel<T>(
      success: false,
      message: message,
      error: error,
      errors: errors,
      statusCode: statusCode,
      meta: meta,
    );
  }

  /// Get readable error message for UI
  String get displayErrorMessage {
    if (message != null && message!.isNotEmpty) {
      return message!;
    }
    if (errors != null && errors!.isNotEmpty) {
      final first = errors!.first;
      if (first is Map && first['message'] != null) {
        return first['message'].toString();
      }
      return first.toString();
    }
    if (error != null && error!.isNotEmpty) {
      return error!;
    }
    return 'Something went wrong. Please try again.';
  }
}
