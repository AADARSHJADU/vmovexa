// lib/app/data/services/driver_service.dart
import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import '../models/driver_models.dart';
import 'http_client_service.dart';

class DriverService extends GetxService {
  static DriverService get to => Get.find<DriverService>();

  HttpClientService get _http => HttpClientService.to;

  /// 1. GET /me/driver/profile — My driver profile
  Future<ApiResponseModel<DriverProfileData>> getProfile() async {
    return _http.get<DriverProfileData>(
      ApiConstants.driverProfile,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverProfileData.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverProfileData();
      },
    );
  }

  /// 2. PATCH /me/driver/duty-status — Toggle on-duty / off-duty / available
  Future<ApiResponseModel<DriverDutyStatusResult>> updateDutyStatus({
    required String status, // 'on_duty', 'off_duty', 'available'
    double? lat,
    double? lng,
  }) async {
    String normalized = status.toLowerCase().trim();
    if (normalized == 'onduty' || normalized == 'on-duty' || normalized == 'active') {
      normalized = 'on_duty';
    } else if (normalized == 'offduty' || normalized == 'off-duty' || normalized == 'inactive') {
      normalized = 'off_duty';
    } else if (normalized == 'ready') {
      normalized = 'available';
    }

    final body = <String, dynamic>{
      'status': normalized,
    };

    return _http.patch<DriverDutyStatusResult>(
      ApiConstants.driverDutyStatus,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverDutyStatusResult.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverDutyStatusResult();
      },
    );
  }

  /// 3. GET /me/driver/schedule — Today's schedule
  Future<ApiResponseModel<DriverScheduleData>> getTodaySchedule() async {
    return _http.get<DriverScheduleData>(
      ApiConstants.driverSchedule,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverScheduleData.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverScheduleData();
      },
    );
  }

  /// 4. GET /me/driver/active-route — Currently active route
  Future<ApiResponseModel<DriverActiveRouteData>> getActiveRoute() async {
    return _http.get<DriverActiveRouteData>(
      ApiConstants.driverActiveRoute,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverActiveRouteData.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverActiveRouteData();
      },
    );
  }

  /// 5. POST /me/driver/trip/start — Start a trip for the authenticated driver
  Future<ApiResponseModel<DriverActiveRouteData>> startTrip({
    int? slotId,
    bool forceNew = false,
  }) async {
    final body = <String, dynamic>{
      if (slotId != null && slotId > 0) 'slotId': slotId,
      if (forceNew) 'forceNew': true,
    };

    return _http.post<DriverActiveRouteData>(
      ApiConstants.driverTripStart,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverActiveRouteData.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverActiveRouteData();
      },
    );
  }

  /// 6. POST /me/driver/trip/end — End the active trip for the authenticated driver
  Future<ApiResponseModel<Map<String, dynamic>>> endTrip({
    int? tripId,
    int? slotId,
    num? coveredKm,
  }) async {
    final body = <String, dynamic>{
      if (tripId != null && tripId > 0) 'tripId': tripId,
      if (slotId != null && slotId > 0) 'slotId': slotId,
      if (coveredKm != null && coveredKm >= 0) 'covered_km': coveredKm,
    };

    return _http.post<Map<String, dynamic>>(
      ApiConstants.driverTripEnd,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return Map<String, dynamic>.from(data);
        }
        return <String, dynamic>{};
      },
    );
  }

  /// 7. GET /me/driver/trips — Driver trip history
  Future<ApiResponseModel<DriverTripHistoryData>> getTrips({
    int page = 1,
    int limit = 20,
    String? status,
    String? dateFrom,
    String? dateTo,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty) 'status': status,
      if (dateFrom != null && dateFrom.isNotEmpty) 'date_from': dateFrom,
      if (dateTo != null && dateTo.isNotEmpty) 'date_to': dateTo,
    };

    return _http.get<DriverTripHistoryData>(
      ApiConstants.driverTrips,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverTripHistoryData.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverTripHistoryData();
      },
    );
  }

  /// 6. GET /me/driver/documents — List uploaded documents
  Future<ApiResponseModel<List<DriverDocumentItem>>> getDocuments() async {
    return _http.get<List<DriverDocumentItem>>(
      ApiConstants.driverDocuments,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .map((e) => DriverDocumentItem.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList();
        } else if (data is Map) {
          final list = data['documents'] ?? data['items'] ?? data['rows'] ?? data['data'];
          if (list is List) {
            return list
                .map((e) => DriverDocumentItem.fromJson(Map<String, dynamic>.from(e as Map)))
                .toList();
          }
        }
        return <DriverDocumentItem>[];
      },
    );
  }

  /// 8. POST /me/driver/documents — Upload/update a document record
  Future<ApiResponseModel<DriverDocumentItem>> uploadDocumentRecord({
    required String type, // dl, aadhaar, medical, insurance, training, other
    required String url,
    String? docName,
    String? fileName,
    String? fileSize,
    String? fileType,
    String? expiryDate,
    String? documentNumber,
    String? issuingAuthority,
  }) async {
    String normalizedDocType = type.toLowerCase().trim();
    if (normalizedDocType == 'license' || normalizedDocType == 'driving_license') {
      normalizedDocType = 'dl';
    } else if (normalizedDocType == 'id' || normalizedDocType == 'pan' || normalizedDocType == 'aadhar') {
      normalizedDocType = 'aadhaar';
    } else if (normalizedDocType == 'fitness') {
      normalizedDocType = 'medical';
    } else if (normalizedDocType == 'contract') {
      normalizedDocType = 'insurance';
    } else if (normalizedDocType == 'badge') {
      normalizedDocType = 'training';
    } else if (!const ['dl', 'aadhaar', 'medical', 'insurance', 'training', 'other'].contains(normalizedDocType)) {
      normalizedDocType = 'other';
    }

    final effectiveDocName = (docName != null && docName.trim().isNotEmpty)
        ? docName.trim()
        : (fileName != null && fileName.trim().isNotEmpty ? fileName.trim() : 'Driver Document');

    final body = <String, dynamic>{
      'docType': normalizedDocType,
      'docName': effectiveDocName,
      'fileUrl': url,
      'url': url,
      'previewUrl': url,
      if (fileName != null && fileName.isNotEmpty) 'fileName': fileName,
      if (fileSize != null && fileSize.isNotEmpty) 'fileSize': fileSize,
      if (fileType != null && fileType.isNotEmpty) 'fileType': fileType,
      if (expiryDate != null && expiryDate.isNotEmpty) 'expiryDate': expiryDate,
      if (documentNumber != null && documentNumber.isNotEmpty) 'documentNumber': documentNumber,
      if (issuingAuthority != null && issuingAuthority.isNotEmpty) 'issuingAuthority': issuingAuthority,
    };

    return _http.post<DriverDocumentItem>(
      ApiConstants.driverDocuments,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverDocumentItem.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverDocumentItem();
      },
    );
  }

  /// 9. DELETE /me/driver/documents/:id — Delete a document
  Future<ApiResponseModel<dynamic>> deleteDocument(String id) async {
    return _http.delete(
      ApiConstants.driverDocumentOne(id),
      requiresAuth: true,
    );
  }

  /// 10. GET /me/driver/incidents — List reported incidents
  Future<ApiResponseModel<List<DriverIncidentItem>>> getIncidents({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty) 'status': status,
    };

    return _http.get<List<DriverIncidentItem>>(
      ApiConstants.driverIncidents,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data
              .map((e) => DriverIncidentItem.fromJson(Map<String, dynamic>.from(e)))
              .toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .map((e) => DriverIncidentItem.fromJson(Map<String, dynamic>.from(e)))
              .toList();
        }
        return <DriverIncidentItem>[];
      },
    );
  }

  /// 11. GET /me/driver/incidents/:id — Single incident detail
  Future<ApiResponseModel<DriverIncidentItem>> getIncidentDetails(String id) async {
    return _http.get<DriverIncidentItem>(
      ApiConstants.driverIncidentOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverIncidentItem.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverIncidentItem();
      },
    );
  }

  /// 12. POST /me/driver/incidents — Report a new incident
  Future<ApiResponseModel<DriverIncidentItem>> reportIncident({
    String? incidentType,
    String? title,
    String? description,
    String? severity, // low, medium, high, critical
    dynamic location, // string or Map with lat/lng/address
    String? landmark,
    double? latitude,
    double? longitude,
    List<String>? photos,
    List<String>? mediaUrls,
    List<String>? videos,
    List<String>? affectedParties,
    String? immediateAction,
    String? contactPreference,
    String? contactNumber,
    int? deadCasualty,
    int? injuredCount,
    String? hospitalName,
    bool? ambulanceAssigned,
    String? ambulanceTiming,
    bool? policeNotified,
    String? policeStationName,
    bool? towingRequested,
    String? weatherConditions,
    String? roadType,
    String? trafficDisruptionLevel,
  }) async {
    final effectiveType = incidentType ?? title ?? 'Vehicle Incident';
    final effectivePhotos = (photos != null && photos.isNotEmpty)
        ? photos
        : (mediaUrls ?? <String>[]);

    String? locString;
    double? lat = latitude;
    double? lng = longitude;

    if (location is String) {
      locString = location;
    } else if (location is Map) {
      if (location['lat'] != null) lat = (location['lat'] as num).toDouble();
      if (location['latitude'] != null) lat = (location['latitude'] as num).toDouble();
      if (location['lng'] != null) lng = (location['lng'] as num).toDouble();
      if (location['longitude'] != null) lng = (location['longitude'] as num).toDouble();
      locString = location['address']?.toString() ?? location['location']?.toString();
    }

    final body = <String, dynamic>{
      'incidentType': effectiveType,
      if (title != null && title.isNotEmpty) 'title': title,
      if (description != null && description.isNotEmpty) 'description': description,
      if (severity != null && severity.isNotEmpty) 'severity': severity,
      if (locString != null && locString.isNotEmpty) 'location': locString,
      if (landmark != null && landmark.isNotEmpty) 'landmark': landmark,
      if (lat != null) 'latitude': lat,
      if (lng != null) 'longitude': lng,
      if (effectivePhotos.isNotEmpty) 'photos': effectivePhotos,
      if (videos != null && videos.isNotEmpty) 'videos': videos,
      if (affectedParties != null && affectedParties.isNotEmpty) 'affectedParties': affectedParties,
      if (immediateAction != null && immediateAction.isNotEmpty) 'immediateAction': immediateAction,
      if (contactPreference != null && contactPreference.isNotEmpty) 'contactPreference': contactPreference,
      if (contactNumber != null && contactNumber.isNotEmpty) 'contactNumber': contactNumber,
      if (deadCasualty != null) 'deadCasualty': deadCasualty,
      if (injuredCount != null) 'injuredCount': injuredCount,
      if (hospitalName != null && hospitalName.isNotEmpty) 'hospitalName': hospitalName,
      if (ambulanceAssigned != null) 'ambulanceAssigned': ambulanceAssigned,
      if (ambulanceTiming != null && ambulanceTiming.isNotEmpty) 'ambulanceTiming': ambulanceTiming,
      if (policeNotified != null) 'policeNotified': policeNotified,
      if (policeStationName != null && policeStationName.isNotEmpty) 'policeStationName': policeStationName,
      if (towingRequested != null) 'towingRequested': towingRequested,
      if (weatherConditions != null && weatherConditions.isNotEmpty) 'weatherConditions': weatherConditions,
      if (roadType != null && roadType.isNotEmpty) 'roadType': roadType,
      if (trafficDisruptionLevel != null && trafficDisruptionLevel.isNotEmpty) 'trafficDisruptionLevel': trafficDisruptionLevel,
    };

    return _http.post<DriverIncidentItem>(
      ApiConstants.driverIncidents,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverIncidentItem.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverIncidentItem();
      },
    );
  }

  /// 12. GET /notifications — Get driver notifications
  Future<ApiResponseModel<List<Map<String, dynamic>>>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    return _http.get<List<Map<String, dynamic>>>(
      ApiConstants.notifications,
      queryParams: {'page': page, 'limit': limit},
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        } else if (data is Map && data['rows'] is List) {
          return (data['rows'] as List)
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        }
        return [];
      },
    );
  }

  /// Upload file helper (uses POST /uploads via HttpClientService)
  Future<ApiResponseModel<Map<String, dynamic>>> uploadFile({
    required String filePath,
    String purpose = 'document', // 'document', 'incident', 'avatar'
  }) async {
    return _http.uploadFile(
      filePath: filePath,
      endpoint: ApiConstants.uploads,
      purpose: purpose,
      requiresAuth: true,
    );
  }
}
