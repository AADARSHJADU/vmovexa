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

  static const String incidents = '/incidents';
  static String incidentOne(String id) => '/incidents/$id';

  // Driver Self-Service Endpoints (ROLE-DRIVER) — Base: /me/driver
  static const String driverProfile     = '/me/driver/profile';
  static const String driverSchedule    = '/me/driver/schedule';
  static const String driverActiveRoute = '/me/driver/active-route';
  static const String driverTrips       = '/me/driver/trips';
  static const String driverTripStart   = '/me/driver/trip/start';
  static const String driverTripEnd     = '/me/driver/trip/end';
  static const String driverDocuments   = '/me/driver/documents';
  static String driverDocumentOne(String id) => '/me/driver/documents/$id';
  static const String driverIncidents   = '/me/driver/incidents';
  static String driverIncidentOne(String id) => '/me/driver/incidents/$id';
  static const String driverDutyStatus  = '/me/driver/duty-status';

  static const String activityLogs = '/users/activity';
  static const String notifications = '/notifications';
  static const String notificationSettings = '/notifications/settings';

  // Google APIs & Telematics Proxy
  static const String googlePlacesDemo = '/google-apis/demo/places';
  static const String googleRoutesDemo = '/google-apis/demo/routes';
  static const String googleGeocodeDemo = '/google-apis/demo/geocode';
  static const String googleStaticMapDemo = '/google-apis/demo/static-map';
  static const String googleMapsApiKey = 'AIzaSyBqlBrjGRXwr0b2gEq8R0d_BlPBH4FcPSw';

  // Government Endpoints
  static const String government = '/government';
  static String governmentOne(String id) => '/government/$id';
  static const String governmentAnalytics = '/government/analytics';
  static const String governmentClearanceLevels = '/government/clearance-levels';
  static const String governmentDepartmentCategories = '/government/department-categories';
  static const String governmentJurisdictions = '/government/jurisdictions';
  static const String governmentMetaOptions = '/government/meta/options';

  // Government & Public Campaigns Endpoints
  static const String campaigns = '/campaigns';
  static String campaignOne(String id) => '/campaigns/$id';
  static String campaignApprove(String id) => '/campaigns/$id/approve';
  static String campaignReject(String id) => '/campaigns/$id/reject';
  static String campaignPause(String id) => '/campaigns/$id/pause';
  static String campaignStart(String id) => '/campaigns/$id/start';
  static const String campaignFleetOptions = '/campaigns/fleet-options';
  static const String campaignTrackingLive = '/campaigns/tracking/live';
  static const String campaignTrackingRoutes = '/campaigns/tracking/routes';

  // Emergency Broadcasts Endpoints
  static const String emergencyBroadcasts = '/emergency-broadcasts';
  static String emergencyBroadcastOne(String id) => '/emergency-broadcasts/$id';
  static String emergencyBroadcastApprove(String id) => '/emergency-broadcasts/$id/approve';
  static String emergencyBroadcastReject(String id) => '/emergency-broadcasts/$id/reject';
  static String emergencyBroadcastRevoke(String id) => '/emergency-broadcasts/$id/revoke';

  // Billing & Invoices Endpoints
  static const String billingInvoices = '/billing/invoices';
  static String billingInvoiceOne(String id) => '/billing/invoices/$id';
  static String billingInvoiceHtml(String id) => '/billing/invoices/$id/html';
  static String billingInvoicePay(String id) => '/billing/invoices/$id/pay';
  static const String billingSubscription = '/billing/subscription';
  static const String billingTransactions = '/billing/transactions';
  static const String billingPlans = '/billing/plans';
  static const String billingWallet = '/billing/wallet';

  /// Generates Google Static Map URL using the official API key and dark styling
  static String buildGoogleStaticMapUrl({
    double? lat,
    double? lng,
    double? centerLat,
    double? centerLng,
    int zoom = 12,
    int width = 600,
    int height = 300,
    String mapType = 'roadmap',
    dynamic markers,
  }) {
    final effectiveLat = lat ?? centerLat ?? 23.2599;
    final effectiveLng = lng ?? centerLng ?? 77.4126;
    String markersParam = '';
    if (markers is List && markers.isNotEmpty) {
      for (final m in markers) {
        if (m is Map) {
          final mLat = m['lat'];
          final mLng = m['lng'];
          final color = m['color'] ?? 'red';
          if (mLat != null && mLng != null) {
            markersParam += '&markers=color:$color%7C$mLat,$mLng';
          }
        } else if (m is GoogleMapMarker) {
          final labelStr = m.label.isNotEmpty ? '%7Clabel:${m.label}' : '';
          markersParam += '&markers=color:${m.color}$labelStr%7C${m.lat},${m.lng}';
        }
      }
    } else {
      markersParam = '&markers=color:red%7C$effectiveLat,$effectiveLng';
    }
    final styleParam = mapType == 'satellite' || mapType == 'hybrid'
        ? ''
        : '&style=element:geometry%7Ccolor:0x1b2438&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x8fa3bf&style=element:labels.text.stroke%7Ccolor:0x1b2438';
    return 'https://maps.googleapis.com/maps/api/staticmap?center=$effectiveLat,$effectiveLng&zoom=$zoom&size=${width}x$height&scale=2&maptype=$mapType$styleParam$markersParam&key=$googleMapsApiKey';
  }

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

class GoogleMapMarker {
  final double lat;
  final double lng;
  final String color;
  final String label;

  const GoogleMapMarker({
    required this.lat,
    required this.lng,
    this.color = 'red',
    this.label = '',
  });
}
