class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationMeta({
    this.page = 1,
    this.limit = 20,
    this.total = 0,
    this.totalPages = 1,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: (json['page'] is num)
          ? (json['page'] as num).toInt()
          : int.tryParse(json['page']?.toString() ?? '1') ?? 1,
      limit: (json['limit'] is num)
          ? (json['limit'] as num).toInt()
          : int.tryParse(json['limit']?.toString() ?? '20') ?? 20,
      total: (json['total'] is num)
          ? (json['total'] as num).toInt()
          : int.tryParse(json['total']?.toString() ?? '0') ?? 0,
      totalPages: (json['totalPages'] is num)
          ? (json['totalPages'] as num).toInt()
          : (json['pages'] is num)
              ? (json['pages'] as num).toInt()
              : int.tryParse(json['totalPages']?.toString() ?? json['pages']?.toString() ?? '1') ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
        'page': page,
        'limit': limit,
        'total': total,
        'totalPages': totalPages,
      };
}

class ApiResponseModel<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;
  final String? code;
  final List<dynamic>? errors;
  final int? statusCode;
  final Map<String, dynamic>? meta;
  final PaginationMeta? pagination;

  ApiResponseModel({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.code,
    this.errors,
    this.statusCode,
    this.meta,
    this.pagination,
  });

  bool get isSuccess => success;

  factory ApiResponseModel.fromJson(
    Map<String, dynamic> json, {
    T Function(dynamic data)? create,
    int? statusCode,
  }) {
    final metaMap = json['meta'] is Map ? Map<String, dynamic>.from(json['meta'] as Map) : null;
    PaginationMeta? pag;
    if (metaMap != null && metaMap['pagination'] is Map) {
      pag = PaginationMeta.fromJson(Map<String, dynamic>.from(metaMap['pagination'] as Map));
    } else if (json['pagination'] is Map) {
      pag = PaginationMeta.fromJson(Map<String, dynamic>.from(json['pagination'] as Map));
    }

    final codeVal = json['code']?.toString() ?? json['error']?.toString();

    return ApiResponseModel<T>(
      success: json['success'] == true,
      message: json['message']?.toString(),
      data: json['data'] != null && create != null
          ? create(json['data'])
          : json['data'] as T?,
      error: codeVal,
      code: codeVal,
      errors: json['errors'] is List ? json['errors'] as List<dynamic> : null,
      statusCode: statusCode,
      meta: metaMap,
      pagination: pag,
    );
  }

  factory ApiResponseModel.failure({
    required String message,
    String? error,
    String? code,
    List<dynamic>? errors,
    int? statusCode,
    Map<String, dynamic>? meta,
    PaginationMeta? pagination,
  }) {
    final c = code ?? error;
    return ApiResponseModel<T>(
      success: false,
      message: message,
      error: c,
      code: c,
      errors: errors,
      statusCode: statusCode,
      meta: meta,
      pagination: pagination,
    );
  }

  /// Get readable error message for UI
  String get displayErrorMessage {
    if (errors != null && errors!.isNotEmpty) {
      final first = errors!.first;
      if (first is Map) {
        if (first['message'] != null) {
          final fName = first['field']?.toString();
          final msg = first['message'].toString();
          if (fName != null && fName.isNotEmpty && !msg.toLowerCase().contains(fName.toLowerCase())) {
            return '$fName: $msg';
          }
          return msg;
        }
      }
      return first.toString();
    }
    if (message != null && message!.isNotEmpty) {
      return message!;
    }
    if (code != null && code!.isNotEmpty) {
      return code!;
    }
    if (error != null && error!.isNotEmpty) {
      return error!;
    }
    return 'Something went wrong. Please try again.';
  }
}
