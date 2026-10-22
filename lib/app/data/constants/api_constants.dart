import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // Determine default base URL based on platform
  static String get defaultBaseUrl {
    if (kIsWeb) {
      return 'https://hotpink-llama-677284.hostingersite.com/api/v1';
    }
    try {
      if (Platform.isAndroid) {
        // Android Emulator loops back to host machine via 10.0.2.2
        return 'https://hotpink-llama-677284.hostingersite.com/api/v1';
      }
    } catch (_) {}
    return 'https://hotpink-llama-677284.hostingersite.com/api/v1';
  }

  static String baseUrl = defaultBaseUrl;

  static void setBaseUrl(String url) {
    baseUrl = url;
  }

  // Auth Endpoints
  static const String loginEmail = '/auth/login-email';
  static const String loginPhone = '/auth/login-phone';
  static const String verifyOtp = '/auth/verify-otp';
  static const String register = '/auth/register';
  static const String requestSignupOtp = '/auth/request-signup-otp';
  static const String verifySignupOtp = '/auth/verify-signup-otp';
  static const String resubmitRegistration = '/auth/resubmit-registration';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String completeOrgProfile = '/auth/complete-organization-profile';

  // Social Auth Endpoints
  static const String googleLogin = '/auth/social/firebase/google';
  static const String googleRegister = '/auth/social/firebase/google/register';
  static const String zohoUrl = '/auth/social/zoho/url';
  static const String zohoAuth = '/auth/social/zoho';
  static const String appleUrl = '/auth/social/apple/url';
  static const String appleAuth = '/auth/social/apple';
  static const String appleFirebaseLogin = '/auth/social/firebase/apple';
  static const String appleFirebaseRegister = '/auth/social/firebase/apple/register';
  static const String socialAccounts = '/auth/social';

  // Staff Invitations Endpoints
  static const String invitationsValidate = '/invitations/validate';
  static const String invitationsAccept = '/invitations';

  // Fleet Operator Endpoints
  static const String dashboardKpis = '/dashboard/admin/kpis';
  static const String liveSummary = '/dashboard/live-summary';
  static const String fleets = '/fleets';
  static String fleetOne(String id) => '/fleets/$id';
  static String fleetAssignVehicle(String id) => '/fleets/$id/assign-vehicle';
  static String fleetUnassignVehicle(String id) => '/fleets/$id/unassign-vehicle';
  static String fleetApprove(String id) => '/fleets/$id/approve';
  static String fleetReject(String id) => '/fleets/$id/reject';

  static const String vehicles = '/vehicles';
  static String vehicleOne(String id) => '/vehicles/$id';
  static String vehicleTelemetry(String id) => '/vehicles/$id/telemetry';
  static String vehicleAssignDriver(String id) => '/vehicles/$id/assign-driver';
  static String vehicleAssignGps(String id) => '/vehicles/$id/assign-gps';

  static const String drivers = '/drivers';
  static String driverOne(String id) => '/drivers/$id';
  static String driverAssignBus(String id) => '/drivers/$id/assign-bus';
  static String driverStatus(String id) => '/drivers/$id/status';
  static String driverApprove(String id) => '/drivers/$id/approve';
  static String driverReject(String id) => '/drivers/$id/reject';
  static String driverVerifyDocs(String id) => '/drivers/$id/verify-documents';
  static String driverDocs(String id) => '/drivers/$id/documents';

  static const String depots = '/depots';
  static String depotOne(String id) => '/depots/$id';

  static const String routes = '/routes';
  static String routeOne(String id) => '/routes/$id';
  static String routeApprove(String id) => '/routes/$id/approve';
  static String routeReject(String id) => '/routes/$id/reject';
  static String routeAssignVehicle(String id) => '/routes/$id/assign-vehicle';
  static String routeVehicles(String id) => '/routes/$id/vehicles';
  static String routeAssignmentApprove(String id) => '/routes/assignments/$id/approve';
  static String routeAssignmentReject(String id) => '/routes/assignments/$id/reject';
  static String routeAssignmentDelete(String id) => '/routes/assignments/$id';

  static const String trips = '/trips';
  static String tripOne(String id) => '/trips/$id';
  static String tripEnd(String id) => '/trips/$id/end';

  static const String gpsDevices = '/gps-devices';
  static String gpsDeviceOne(String id) => '/gps-devices/$id';
  static String gpsDeviceAssign(String id) => '/gps-devices/$id/assign';
  static String gpsDeviceApprove(String id) => '/gps-devices/$id/approve';
  static String gpsDeviceReject(String id) => '/gps-devices/$id/reject';

  static const String incidents = '/incidents';
  static String incidentOne(String id) => '/incidents/$id';
  static String incidentStatus(String id) => '/incidents/$id/status';
  static String incidentResolution(String id) => '/incidents/$id/resolution';

  static const String workOrders = '/work-orders';
  static String workOrderOne(String id) => '/work-orders/$id';

  static const String activityLogs = '/activity-logs';
  static const String activityLogsCategories = '/activity-logs/categories';
  static const String activityLogsFilters = '/activity-logs/filters';
  static String activityLogOne(String id) => '/activity-logs/$id';
  static const String notifications = '/notifications';
  static const String notificationSettings = '/notifications/settings';
  static String notificationRead(String id) => '/notifications/$id/read';
  static const String notificationReadAll = '/notifications/read-all';
  static String notificationDelete(String id) => '/notifications/$id';

  // Google APIs & Telematics Proxy
  static const String googlePlacesDemo = '/google-apis/demo/places';
  static const String googleRoutesDemo = '/google-apis/demo/routes';
  static const String googleGeocodeDemo = '/google-apis/demo/geocode';
  static const String googleStaticMapDemo = '/google-apis/demo/static-map';
  static const String googleMapsApiKey = 'AIzaSyBqlBrjGRXwr0b2gEq8R0d_BlPBH4FcPSw';

  // Uploads & Content Endpoints
  static const String uploads = '/uploads';
  static const String uploadAvatar = '/uploads/avatar';
  static const String content = '/content';
  static String contentPage(String type) => '/content/$type';
  static const String supportTickets = '/me/support/tickets';

  /// Resolves a relative file URL (e.g. /uploads/avatar/xxx.jpg) to full URL
  static String resolveFileUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final trimmed = url.trim();
    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')) {
      return trimmed;
    }
    final hostBase = baseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
    final path = trimmed.startsWith('/') ? trimmed : '/$trimmed';
    return '$hostBase$path';
  }

  // Request timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
