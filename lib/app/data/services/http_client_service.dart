import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../services/storage_service.dart';
import '../../routes/app_routes.dart';

class HttpClientService extends GetxService {
  static HttpClientService get to => Get.find<HttpClientService>();

  final http.Client _client = http.Client();
  Completer<bool>? _refreshCompleter;

  /// Helper to build full Uri
  Uri _buildUri(String endpoint, [Map<String, dynamic>? queryParams]) {
    String url = '${ApiConstants.baseUrl}$endpoint';
    if (queryParams != null && queryParams.isNotEmpty) {
      final filteredParams = <String, String>{};
      queryParams.forEach((key, value) {
        if (value != null) {
          filteredParams[key] = value.toString();
        }
      });
      final uri = Uri.parse(url);
      return uri.replace(queryParameters: {
        ...uri.queryParameters,
        ...filteredParams,
      });
    }
    return Uri.parse(url);
  }

  /// Default headers
  Map<String, String> _buildHeaders({
    Map<String, String>? customHeaders,
    bool requiresAuth = true,
  }) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Type': 'app',
    };

    if (customHeaders != null) {
      headers.addAll(customHeaders);
    }

    if (requiresAuth && Get.isRegistered<StorageService>()) {
      final token = StorageService.to.getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  /// GET Request
  Future<ApiResponseModel<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    T Function(dynamic data)? create,
  }) async {
    return _sendRequest<T>(
      method: 'GET',
      endpoint: endpoint,
      queryParams: queryParams,
      headers: headers,
      requiresAuth: requiresAuth,
      create: create,
    );
  }

  /// POST Request
  Future<ApiResponseModel<T>> post<T>(
    String endpoint, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    T Function(dynamic data)? create,
  }) async {
    return _sendRequest<T>(
      method: 'POST',
      endpoint: endpoint,
      body: body,
      queryParams: queryParams,
      headers: headers,
      requiresAuth: requiresAuth,
      create: create,
    );
  }

  /// PATCH Request
  Future<ApiResponseModel<T>> patch<T>(
    String endpoint, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    T Function(dynamic data)? create,
  }) async {
    return _sendRequest<T>(
      method: 'PATCH',
      endpoint: endpoint,
      body: body,
      queryParams: queryParams,
      headers: headers,
      requiresAuth: requiresAuth,
      create: create,
    );
  }

  /// PUT Request
  Future<ApiResponseModel<T>> put<T>(
    String endpoint, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    T Function(dynamic data)? create,
  }) async {
    return _sendRequest<T>(
      method: 'PUT',
      endpoint: endpoint,
      body: body,
      queryParams: queryParams,
      headers: headers,
      requiresAuth: requiresAuth,
      create: create,
    );
  }

  /// DELETE Request
  Future<ApiResponseModel<T>> delete<T>(
    String endpoint, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    T Function(dynamic data)? create,
  }) async {
    return _sendRequest<T>(
      method: 'DELETE',
      endpoint: endpoint,
      body: body,
      queryParams: queryParams,
      headers: headers,
      requiresAuth: requiresAuth,
      create: create,
    );
  }

  /// Multipart File Upload (e.g. POST /uploads or POST /uploads/avatar)
  Future<ApiResponseModel<Map<String, dynamic>>> uploadFile({
    required String filePath,
    String endpoint = ApiConstants.uploads,
    String purpose = 'avatar',
    String fileField = 'file',
    Map<String, String>? additionalFields,
    bool requiresAuth = true,
  }) async {
    final uri = _buildUri(endpoint);
    final request = http.MultipartRequest('POST', uri);

    if (requiresAuth && Get.isRegistered<StorageService>()) {
      final token = StorageService.to.getAccessToken();
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
    }
    request.headers['Accept'] = 'application/json';
    request.headers['X-Client-Type'] = 'app';

    request.fields['purpose'] = purpose;
    if (additionalFields != null) {
      request.fields.addAll(additionalFields);
    }

    try {
      final file = File(filePath);
      if (!await file.exists()) {
        return ApiResponseModel.failure(
          message: 'Selected image was not found on device.',
          error: 'FILE_NOT_FOUND',
        );
      }

      request.files.add(await http.MultipartFile.fromPath(fileField, filePath));

      if (kDebugMode) {
        debugPrint('➡️ [MULTIPART POST] $uri (file: $filePath, purpose: $purpose)');
      }

      final streamedResponse = await request.send().timeout(const Duration(seconds: 45));
      final response = await http.Response.fromStream(streamedResponse);

      if (kDebugMode) {
        debugPrint('⬅️ [${response.statusCode}] $uri');
        debugPrint('📄 Response: ${response.body}');
      }

      dynamic responseJson;
      try {
        responseJson = jsonDecode(response.body);
      } catch (_) {
        responseJson = {'message': response.body};
      }

      Map<String, dynamic> parsedMap = {};
      if (responseJson is Map<String, dynamic>) {
        if (responseJson['data'] is Map<String, dynamic>) {
          parsedMap = responseJson['data'] as Map<String, dynamic>;
        } else if (responseJson['data'] is String) {
          parsedMap = {'url': responseJson['data']};
        } else {
          parsedMap = responseJson;
        }
      } else if (responseJson is Map) {
        parsedMap = Map<String, dynamic>.from(responseJson);
      }

      final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
      return ApiResponseModel<Map<String, dynamic>>(
        success: isSuccess,
        data: parsedMap,
        message: responseJson is Map ? responseJson['message']?.toString() : null,
        statusCode: response.statusCode,
      );
    } catch (e) {
      if (kDebugMode) debugPrint('Upload error: $e');
      return ApiResponseModel.failure(
        message: 'Upload failed: ${e.toString()}',
        error: 'UPLOAD_ERROR',
      );
    }
  }

  /// Internal request sender with 401 retry handling
  Future<ApiResponseModel<T>> _sendRequest<T>({
    required String method,
    required String endpoint,
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    bool requiresAuth = true,
    bool isRetry = false,
    T Function(dynamic data)? create,
  }) async {
    final uri = _buildUri(endpoint, queryParams);
    final requestHeaders = _buildHeaders(customHeaders: headers, requiresAuth: requiresAuth);

    if (kDebugMode) {
      debugPrint('➡️ [$method] $uri');
      if (body != null) debugPrint('📦 Body: ${jsonEncode(body)}');
    }

    try {
      http.Response response;
      final encodedBody = body != null ? jsonEncode(body) : null;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await _client
              .get(uri, headers: requestHeaders)
              .timeout(ApiConstants.receiveTimeout);
          break;
        case 'POST':
          response = await _client
              .post(uri, headers: requestHeaders, body: encodedBody)
              .timeout(ApiConstants.receiveTimeout);
          break;
        case 'PATCH':
          response = await _client
              .patch(uri, headers: requestHeaders, body: encodedBody)
              .timeout(ApiConstants.receiveTimeout);
          break;
        case 'PUT':
          response = await _client
              .put(uri, headers: requestHeaders, body: encodedBody)
              .timeout(ApiConstants.receiveTimeout);
          break;
        case 'DELETE':
          response = await _client
              .delete(uri, headers: requestHeaders, body: encodedBody)
              .timeout(ApiConstants.receiveTimeout);
          break;
        default:
          throw UnsupportedError('HTTP method $method is not supported.');
      }

      if (kDebugMode) {
        debugPrint('⬅️ [${response.statusCode}] $uri');
        debugPrint('📄 Response: ${response.body}');
      }

      // Check for 401 Unauthorized - handle silent token refresh
      if (response.statusCode == 401 && requiresAuth && !isRetry) {
        if (kDebugMode) {
          debugPrint('⚠️ [AUTH] 401 Unauthorized for $uri. Attempting silent token refresh...');
        }
        final refreshed = await _handleTokenRefresh();
        if (refreshed) {
          if (kDebugMode) {
            debugPrint('🔄 [AUTH] Refresh successful. Retrying original request: $method $uri');
          }
          // Retry the original request once with new token
          return await _sendRequest<T>(
            method: method,
            endpoint: endpoint,
            body: body,
            queryParams: queryParams,
            headers: headers,
            requiresAuth: requiresAuth,
            isRetry: true,
            create: create,
          );
        } else {
          if (kDebugMode) {
            debugPrint('🚨 [AUTH] Token refresh failed or session expired. Logging out.');
          }
          // Refresh failed - force logout
          if (Get.isRegistered<StorageService>()) {
            await StorageService.to.clearAuth();
          }
          if (Get.currentRoute != Routes.LOGIN) {
            Get.offAllNamed(Routes.LOGIN);
          }
          return ApiResponseModel.failure(
            message: 'Session expired. Please log in again.',
            error: 'UNAUTHORIZED',
            statusCode: 401,
          );
        }
      }

      // Parse JSON
      dynamic responseJson;
      try {
        responseJson = jsonDecode(response.body);
      } catch (_) {
        responseJson = {'message': response.body};
      }

      if (responseJson is Map<String, dynamic>) {
        return ApiResponseModel<T>.fromJson(
          responseJson,
          create: create,
          statusCode: response.statusCode,
        );
      } else if (responseJson is Map) {
        return ApiResponseModel<T>.fromJson(
          Map<String, dynamic>.from(responseJson),
          create: create,
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponseModel<T>(
          success: response.statusCode >= 200 && response.statusCode < 300,
          data: responseJson as T?,
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      return ApiResponseModel.failure(
        message: 'Cannot connect to server. Please check your network connection.',
        error: 'NETWORK_ERROR',
      );
    } on TimeoutException {
      return ApiResponseModel.failure(
        message: 'Request timed out. Please check your connection and retry.',
        error: 'TIMEOUT_ERROR',
      );
    } catch (e) {
      return ApiResponseModel.failure(
        message: 'Unexpected error occurred: ${e.toString()}',
        error: 'UNKNOWN_ERROR',
      );
    }
  }

  /// Attempt silent token refresh via POST /auth/refresh
  /// Supports concurrent requests by queueing them on a single Completer future.
  Future<bool> _handleTokenRefresh() async {
    // If a refresh is already in progress, wait for the existing one to resolve!
    if (_refreshCompleter != null) {
      if (kDebugMode) {
        debugPrint('⏳ [AUTH] Token refresh already in progress, awaiting existing operation...');
      }
      return await _refreshCompleter!.future;
    }

    _refreshCompleter = Completer<bool>();

    try {
      if (!Get.isRegistered<StorageService>()) {
        _refreshCompleter!.complete(false);
        return false;
      }
      final refreshToken = StorageService.to.getRefreshToken();
      if (refreshToken == null || refreshToken.trim().isEmpty) {
        if (kDebugMode) {
          debugPrint('⚠️ [AUTH] No refresh token found in storage. Cannot refresh.');
        }
        _refreshCompleter!.complete(false);
        return false;
      }

      final refreshUri = _buildUri(ApiConstants.refreshToken);
      if (kDebugMode) {
        debugPrint('➡️ [REFRESH POST] $refreshUri');
      }

      // Backend requires camelCase "refreshToken" (also provide snake_case as fallback)
      final refreshBody = jsonEncode({
        'refreshToken': refreshToken.trim(),
        'refresh_token': refreshToken.trim(),
      });

      final response = await _client.post(
        refreshUri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: refreshBody,
      ).timeout(ApiConstants.receiveTimeout);

      if (kDebugMode) {
        debugPrint('⬅️ [${response.statusCode}] $refreshUri');
        debugPrint('📄 Refresh Response: ${response.body}');
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        dynamic decoded;
        try {
          decoded = jsonDecode(response.body);
        } catch (_) {}

        if (decoded is Map<String, dynamic> && decoded['data'] != null) {
          final data = decoded['data'];
          String? newAccessToken;
          String? newRefreshToken;

          if (data is Map) {
            // Check nested tokens map: { "tokens": { "accessToken": "..." } }
            if (data['tokens'] is Map) {
              final tokensMap = data['tokens'] as Map;
              newAccessToken = tokensMap['accessToken']?.toString() ??
                  tokensMap['access_token']?.toString() ??
                  tokensMap['token']?.toString();
              newRefreshToken = tokensMap['refreshToken']?.toString() ??
                  tokensMap['refresh_token']?.toString();
            }

            // Root data fields: { "accessToken": "...", "access_token": "..." }
            newAccessToken ??= data['accessToken']?.toString() ??
                data['access_token']?.toString() ??
                data['token']?.toString();
            newRefreshToken ??= data['refreshToken']?.toString() ??
                data['refresh_token']?.toString();
          } else if (data is String && data.isNotEmpty) {
            newAccessToken = data;
          }

          // If server didn't issue a new refresh token, preserve current refresh token
          newRefreshToken ??= refreshToken;

          if (newAccessToken != null && newAccessToken.isNotEmpty) {
            await StorageService.to.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );
            if (kDebugMode) {
              debugPrint('✅ [AUTH] Token refreshed successfully and updated in StorageService.');
            }
            if (!_refreshCompleter!.isCompleted) {
              _refreshCompleter!.complete(true);
            }
            return true;
          }
        }
      }

      if (kDebugMode) {
        debugPrint('❌ [AUTH] Token refresh rejected by server (Status ${response.statusCode})');
      }
      if (!_refreshCompleter!.isCompleted) {
        _refreshCompleter!.complete(false);
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ [AUTH] Failed to refresh token: $e');
      }
      if (_refreshCompleter != null && !_refreshCompleter!.isCompleted) {
        _refreshCompleter!.complete(false);
      }
      return false;
    } finally {
      _refreshCompleter = null;
    }
  }
}
