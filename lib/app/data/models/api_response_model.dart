class ApiResponseModel<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? code;
  final String? error;
  final List<dynamic>? errors;
  final int? statusCode;

  bool get isSuccess => success;

  ApiResponseModel({
    required this.success,
    this.message,
    this.data,
    this.code,
    this.error,
    this.errors,
    this.statusCode,
  });

  factory ApiResponseModel.fromJson(
    Map<String, dynamic> json, {
    T Function(dynamic data)? create,
    int? statusCode,
  }) {
    final codeVal = json['code']?.toString() ?? json['error']?.toString();
    return ApiResponseModel<T>(
      success: json['success'] == true,
      message: json['message']?.toString(),
      data: json['data'] != null && create != null
          ? create(json['data'])
          : json['data'] as T?,
      code: codeVal,
      error: codeVal,
      errors: json['errors'] is List ? json['errors'] as List<dynamic> : null,
      statusCode: statusCode,
    );
  }

  factory ApiResponseModel.failure({
    required String message,
    String? error,
    String? code,
    List<dynamic>? errors,
    int? statusCode,
  }) {
    return ApiResponseModel<T>(
      success: false,
      message: message,
      code: code ?? error,
      error: error ?? code,
      errors: errors,
      statusCode: statusCode,
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
