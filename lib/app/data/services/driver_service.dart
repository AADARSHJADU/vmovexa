import 'package:flutter/foundation.dart';
import '../models/work_order_model.dart';
import '../../modules/roles/driver/profile/help_support/model/help_support_models.dart';
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

  /// 3. GET /me/driver/schedule — Driver schedule & timetable
  Future<ApiResponseModel<DriverScheduleData>> getTodaySchedule({
    String? tab,
    int? page,
    int? limit,
    String? search,
    String? shiftType,
    String? status,
  }) async {
    final query = <String, String>{
      if (tab != null && tab.isNotEmpty && tab != 'all') 'tab': tab,
      if (page != null) 'page': page.toString(),
      if (limit != null) 'limit': limit.toString(),
      if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      if (shiftType != null && shiftType != 'ALL') 'shift_type': shiftType,
      if (status != null && status != 'ALL') 'status': status,
    };
    return _http.get<DriverScheduleData>(
      ApiConstants.driverSchedule,
      queryParams: query.isNotEmpty ? query : null,
      requiresAuth: true,
      create: (data) {
        if (data != null) {
          return DriverScheduleData.fromJson(data);
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
    int? page,
    int? limit,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': ?page,
      'limit': ?limit,
      if (status != null && status.isNotEmpty && status.toUpperCase() != 'ALL') 'status': status,
    };

    return _http.get<List<DriverIncidentItem>>(
      ApiConstants.driverIncidents,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
      requiresAuth: true,
      create: (data) {
        debugPrint('🔍 [DriverService.getIncidents] Raw data payload type: ${data.runtimeType}');
        final list = <DriverIncidentItem>[];
        dynamic rawList;
        if (data is List) {
          rawList = data;
        } else if (data is Map) {
          rawList = data['incidents'] ?? data['items'] ?? data['rows'] ?? data['data'];
        }

        if (rawList is List) {
          debugPrint('🔍 [DriverService.getIncidents] Found ${rawList.length} raw incident items in response');
          for (int i = 0; i < rawList.length; i++) {
            final item = rawList[i];
            try {
              if (item is Map) {
                final parsed = DriverIncidentItem.fromJson(Map<String, dynamic>.from(item));
                list.add(parsed);
                debugPrint('✅ [DriverService.getIncidents] Parsed incident #$i: ID=${parsed.id}, type=${parsed.incidentType}, severity=${parsed.severity}, status=${parsed.status}, photos=${parsed.photos.length}');
              } else {
                debugPrint('⚠️ [DriverService.getIncidents] Skipped item #$i (not a Map: ${item.runtimeType})');
              }
            } catch (err, st) {
              debugPrint('❌ [DriverService.getIncidents] Failed to parse incident item #$i: $err\n$st');
            }
          }
        } else {
          debugPrint('⚠️ [DriverService.getIncidents] No list found in payload: $data');
        }

        debugPrint('🎉 [DriverService.getIncidents] Returning ${list.length} DriverIncidentItems');
        return list;
      },
    );
  }

  /// 11. GET /me/driver/incidents/:id — Single incident detail
  Future<ApiResponseModel<DriverIncidentItem>> getIncidentDetails(String id) async {
    return _http.get<DriverIncidentItem>(
      ApiConstants.driverIncidentOne(id),
      requiresAuth: true,
      create: (data) {
        debugPrint('🔍 [DriverService.getIncidentDetails] Raw data received for ID $id');
        try {
          if (data is Map) {
            final target = (data['incident'] is Map)
                ? Map<String, dynamic>.from(data['incident'] as Map)
                : Map<String, dynamic>.from(data);
            return DriverIncidentItem.fromJson(target);
          }
        } catch (err, st) {
          debugPrint('❌ [DriverService.getIncidentDetails] Error parsing incident detail: $err\n$st');
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
      'latitude': ?lat,
      'longitude': ?lng,
      if (effectivePhotos.isNotEmpty) 'photos': effectivePhotos,
      if (videos != null && videos.isNotEmpty) 'videos': videos,
      if (affectedParties != null && affectedParties.isNotEmpty) 'affectedParties': affectedParties,
      if (immediateAction != null && immediateAction.isNotEmpty) 'immediateAction': immediateAction,
      if (contactPreference != null && contactPreference.isNotEmpty) 'contactPreference': contactPreference,
      if (contactNumber != null && contactNumber.isNotEmpty) 'contactNumber': contactNumber,
      'deadCasualty': ?deadCasualty,
      'injuredCount': ?injuredCount,
      if (hospitalName != null && hospitalName.isNotEmpty) 'hospitalName': hospitalName,
      'ambulanceAssigned': ?ambulanceAssigned,
      if (ambulanceTiming != null && ambulanceTiming.isNotEmpty) 'ambulanceTiming': ambulanceTiming,
      'policeNotified': ?policeNotified,
      if (policeStationName != null && policeStationName.isNotEmpty) 'policeStationName': policeStationName,
      'towingRequested': ?towingRequested,
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
    int limit = 50,
    String? severity,
    String? search,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (severity != null && severity.isNotEmpty) 'severity': severity,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    return _http.get<List<Map<String, dynamic>>>(
      ApiConstants.notifications,
      queryParams: params,
      requiresAuth: true,
      create: (data) {
        if (data is List) {
          return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        } else if (data is Map) {
          final list = data['rows'] ?? data['items'] ?? data['data'] ?? data['notifications'];
          if (list is List) {
            return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          }
        }
        return [];
      },
    );
  }

  /// 12a. POST /notifications/:id/read — Mark driver notification as read
  Future<ApiResponseModel<dynamic>> markNotificationRead(String id) async {
    return _http.post(
      ApiConstants.notificationRead(id),
      body: {},
      requiresAuth: true,
    );
  }

  /// 12b. POST /notifications/read-all — Mark all driver notifications read
  Future<ApiResponseModel<dynamic>> markAllNotificationsRead() async {
    return _http.post(
      ApiConstants.notificationReadAll,
      body: {},
      requiresAuth: true,
    );
  }

  /// 12c. DELETE /notifications/:id — Remove notification
  Future<ApiResponseModel<dynamic>> deleteNotification(String id) async {
    return _http.delete(
      ApiConstants.notificationDelete(id),
      requiresAuth: true,
    );
  }

  /// 12d. DELETE /notifications — Clear all notifications
  Future<ApiResponseModel<dynamic>> clearAllNotifications() async {
    return _http.delete(
      ApiConstants.notifications,
      requiresAuth: true,
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

  /// 16. GET /me/driver/work-orders — List maintenance tickets reported by driver
  Future<ApiResponseModel<List<WorkOrderModel>>> getDriverWorkOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final query = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      if (status != null && status.isNotEmpty && status != 'all') 'status': status,
    };

    return _http.get<List<WorkOrderModel>>(
      ApiConstants.driverWorkOrders,
      queryParams: query,
      requiresAuth: true,
      create: (data) {
        final list = <WorkOrderModel>[];
        dynamic rawList;

        if (data is List) {
          rawList = data;
        } else if (data is Map) {
          rawList = data['items'] ?? data['rows'] ?? data['workOrders'] ?? data['data'];
        }

        if (rawList is List) {
          for (final item in rawList) {
            if (item is Map) {
              list.add(WorkOrderModel.fromJson(Map<String, dynamic>.from(item)));
            }
          }
        }
        return list;
      },
    );
  }

  /// 17. GET /me/driver/work-orders/:id — View single defect ticket status & technician notes
  Future<ApiResponseModel<WorkOrderModel>> getDriverWorkOrderById(String id) async {
    return _http.get<WorkOrderModel>(
      ApiConstants.driverWorkOrderOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('workOrder') && data['workOrder'] is Map
              ? Map<String, dynamic>.from(data['workOrder'])
              : Map<String, dynamic>.from(data);
          return WorkOrderModel.fromJson(map);
        }
        return WorkOrderModel(id: id, code: 'WO-$id');
      },
    );
  }

  /// 18. POST /me/driver/work-orders — Report vehicle defect or hardware malfunction
  Future<ApiResponseModel<WorkOrderModel>> reportDriverWorkOrder({
    required String description,
    String? issueCategory,
    String? priority = 'normal',
    String? vehicleId,
    List<String>? attachmentUrls,
  }) async {
    final body = {
      'description': description,
      'issueCategory': issueCategory ?? 'Vehicle Breakdown / Mechanical Issue',
      'category': issueCategory ?? 'breakdown',
      'priority': priority ?? 'normal',
      'urgency': priority ?? 'normal',
      if (vehicleId != null && vehicleId.isNotEmpty) 'vehicleId': vehicleId,
      if (attachmentUrls != null && attachmentUrls.isNotEmpty) 'attachments': attachmentUrls,
    };

    return _http.post<WorkOrderModel>(
      ApiConstants.driverWorkOrders,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('workOrder') && data['workOrder'] is Map
              ? Map<String, dynamic>.from(data['workOrder'])
              : Map<String, dynamic>.from(data);
          return WorkOrderModel.fromJson(map);
        }
        return WorkOrderModel(id: 'new', code: 'WO-NEW', description: description);
      },
    );
  }

  /// 19. POST /me/driver/work-orders/:id/rate — Rate technician repair quality upon resolution
  Future<ApiResponseModel<dynamic>> rateDriverWorkOrder(
    String id, {
    required int rating,
    String? feedback,
  }) async {
    return _http.post(
      ApiConstants.driverWorkOrderRate(id),
      body: {
        'rating': rating,
        if (feedback != null && feedback.trim().isNotEmpty) 'feedback': feedback.trim(),
        if (feedback != null && feedback.trim().isNotEmpty) 'notes': feedback.trim(),
      },
      requiresAuth: true,
    );
  }

  /// 20. GET /content/help?role=ROLE-DRIVER — Driver central knowledge base, guides, FAQs & academy
  Future<ApiResponseModel<DriverHelpContentModel>> getDriverHelpContent() async {
    return _http.get<DriverHelpContentModel>(
      ApiConstants.contentHelpRole('ROLE-DRIVER'),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          return DriverHelpContentModel.fromJson(Map<String, dynamic>.from(data));
        }
        return DriverHelpContentModel.defaultDriverHelp();
      },
    );
  }

  /// 21. GET /me/support/tickets — Driver submitted support tickets
  Future<ApiResponseModel<List<DriverSupportTicketModel>>> getMySupportTickets({
    int page = 1,
    int limit = 50,
  }) async {
    return _http.get<List<DriverSupportTicketModel>>(
      '${ApiConstants.supportTickets}?page=$page&limit=$limit',
      requiresAuth: true,
      create: (data) {
        List items = [];
        if (data is Map) {
          if (data['tickets'] is List) {
            items = data['tickets'] as List;
          } else if (data['items'] is List) {
            items = data['items'] as List;
          } else if (data['data'] is List) {
            items = data['data'] as List;
          } else if (data['rows'] is List) {
            items = data['rows'] as List;
          }
        } else if (data is List) {
          items = data;
        }

        return items
            .whereType<Map>()
            .map((item) => DriverSupportTicketModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      },
    );
  }

  /// 22. GET /support/tickets/:id — Single support ticket details with message thread
  Future<ApiResponseModel<DriverSupportTicketModel>> getSupportTicketDetails(String id) async {
    return _http.get<DriverSupportTicketModel>(
      ApiConstants.supportTicketOne(id),
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('ticket') && data['ticket'] is Map
              ? Map<String, dynamic>.from(data['ticket'])
              : Map<String, dynamic>.from(data);
          return DriverSupportTicketModel.fromJson(map);
        }
        return DriverSupportTicketModel(
          id: id,
          code: '#TKT-$id',
          subject: 'Support Ticket',
          category: 'General',
          description: '',
        );
      },
    );
  }

  /// 23. POST /support/tickets — Raise new support ticket
  Future<ApiResponseModel<DriverSupportTicketModel>> createSupportTicket({
    required String subject,
    required String category,
    required String priority,
    required String description,
    List<Map<String, dynamic>>? attachments,
  }) async {
    final body = <String, dynamic>{
      'subject': subject,
      'title': subject,
      'category': category,
      'priority': priority.toLowerCase(),
      'description': description,
      'message': description,
      if (attachments != null && attachments.isNotEmpty) 'attachments': attachments,
    };

    return _http.post<DriverSupportTicketModel>(
      ApiConstants.createSupportTicket,
      body: body,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('ticket') && data['ticket'] is Map
              ? Map<String, dynamic>.from(data['ticket'])
              : Map<String, dynamic>.from(data);
          return DriverSupportTicketModel.fromJson(map);
        }
        return DriverSupportTicketModel(
          id: 'new',
          code: '#TKT-NEW',
          subject: subject,
          category: category,
          priority: priority,
          description: description,
        );
      },
    );
  }

  /// 24. POST /support/tickets/:id/messages — Reply to ticket conversation thread
  Future<ApiResponseModel<TicketMessageModel>> sendSupportTicketReply(
    String id, {
    required String body,
    List<Map<String, dynamic>>? attachments,
  }) async {
    final payload = <String, dynamic>{
      'body': body,
      'message': body,
      if (attachments != null && attachments.isNotEmpty) 'attachments': attachments,
    };

    return _http.post<TicketMessageModel>(
      ApiConstants.supportTicketMessages(id),
      body: payload,
      requiresAuth: true,
      create: (data) {
        if (data is Map) {
          final map = data.containsKey('message') && data['message'] is Map
              ? Map<String, dynamic>.from(data['message'])
              : Map<String, dynamic>.from(data);
          return TicketMessageModel.fromJson(map);
        }
        return TicketMessageModel(
          id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
          body: body,
          senderName: 'You',
          senderRole: 'driver',
          isStaff: false,
          createdAt: DateTime.now().toIso8601String(),
        );
      },
    );
  }
}
