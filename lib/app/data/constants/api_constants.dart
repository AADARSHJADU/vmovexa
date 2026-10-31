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
  static const String fleetQuotas = '/fleets/quotas';

  static const String vehicles = '/vehicles';
  static String vehicleOne(String id) => '/vehicles/$id';
  static String vehicleTelemetry(String id) => '/vehicles/$id/telemetry';
  static String vehicleAssignDriver(String id) => '/vehicles/$id/assign-driver';
  static String vehicleAssignGps(String id) => '/vehicles/$id/assign-gps';
  static String vehicleApprove(String id) => '/vehicles/$id/approve';
  static String vehicleReject(String id) => '/vehicles/$id/reject';
  static String vehicleDocuments(String id) => '/vehicles/$id/documents';
  static String vehicleDocumentApprove(String id, String docId) => '/vehicles/$id/documents/$docId/approve';
  static String vehicleDocumentReject(String id, String docId) => '/vehicles/$id/documents/$docId/reject';

  // Vehicle Slots (Timetable Scheduling)
  static const String vehicleSlots = '/vehicle-slots';
  static String vehicleSlotOne(String id) => '/vehicle-slots/$id';
  static const String vehicleSlotsCheckConflict = '/vehicle-slots/check-conflict';
  static const String vehicleSlotsTimetableGrid = '/vehicle-slots/timetable/grid';

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
  static const String workOrdersDispatch = '/work-orders/dispatch';
  static String workOrderOne(String id) => '/work-orders/$id';
  static String workOrderApprove(String id) => '/work-orders/$id/approve';
  static String workOrderAssign(String id) => '/work-orders/$id/assign';
  static String workOrderRate(String id) => '/work-orders/$id/rate';
  static String workOrderReject(String id) => '/work-orders/$id/reject';
  static String workOrderStatus(String id) => '/work-orders/$id/status';

  // Technician Self-Service Endpoints
  static const String techStats = '/me/technician/stats';
  static const String techWorkOrders = '/me/technician/work-orders';
  static String techWorkOrderOne(String id) => '/me/technician/work-orders/$id';
  static String techWorkOrderStatus(String id) => '/me/technician/work-orders/$id/status';

  // Edge Devices & IoT Telemetry
  static const String edgeDevices = '/edge-devices';
  static String edgeDeviceOne(String id) => '/edge-devices/$id';
  static String edgeDeviceTelemetry(String id) => '/edge-devices/$id/telemetry';
  static String edgeDeviceReboot(String id) => '/edge-devices/$id/reboot';
  static String edgeDeviceConfig(String id) => '/edge-devices/$id/config';
  static String edgeDeviceFactoryReset(String id) => '/edge-devices/$id/factory-reset';
  static String edgeDeviceConnectivityTests(String id) => '/edge-devices/$id/connectivity-tests';
  static String edgeDeviceToggle(String id) => '/edge-devices/$id/toggle';
  static String edgeDeviceAssign(String id) => '/edge-devices/$id/assign';
  static String edgeDeviceHandshake(String boxId) => '/edge-devices/handshake/$boxId';
  static const String edgeDevicePackageDownload = '/edge-devices/package/download';
  static const String edgeDeviceSetupScript = '/edge-devices/setup-script';

  // Digital Transit Displays
  static const String displays = '/displays';
  static String displayOne(String id) => '/displays/$id';
  static String displayConfig(String id) => '/displays/$id/config';

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
  static const String contentFaqs = '/content/faqs';
  static const String supportTickets = '/me/support/tickets';
  static const String createSupportTicket = '/support/tickets';

  // Finance Endpoints
  static const String financeKpis = '/finance/kpis';
  static const String financeSubscriptions = '/finance/subscriptions';
  static String financeSubscriptionOne(String id) => '/finance/subscriptions/$id';
  static const String financeInvoices = '/finance/invoices';
  static String financeInvoiceOne(String id) => '/finance/invoices/$id';
  static String financeInvoiceMarkPaid(String id) => '/finance/invoices/$id/mark-paid';
  static const String financePayments = '/finance/payments';
  static String financePaymentOne(String id) => '/finance/payments/$id';
  static String financePaymentReminder(String id) => '/finance/payments/$id/send-reminder';
  static const String financeCampaignPayments = '/finance/campaign-payments';
  static String financeCampaignPaymentShare(String id) => '/finance/campaign-payments/$id/share-link';
  static String financeCampaignPaymentManual(String id) => '/finance/campaign-payments/$id/manual-pay';
  static const String financeReconciliationSummary = '/finance/reconciliation/summary';
  static const String financeReconciliationTransactions = '/finance/reconciliation/transactions';
  static const String financeReconciliationAutoMatch = '/finance/reconciliation/auto-match';
  static const String financeReconciliationFinalize = '/finance/reconciliation/finalize';
  static const String financeGstSummary = '/finance/gst/summary';
  static const String financeGstr1Json = '/finance/gst/gstr1-json';
  static const String financeSettings = '/finance/settings';
  static const String financeReportSummary = '/finance/report-summary';
  static const String reports = '/reports';
  static String reportOne(String id) => '/reports/$id';
  static const String reportGenerate = '/reports/generate';

  // Organizations & Tenants Endpoints (Multi-Tenant Management)
  static const String organizations = '/organizations';
  static String organizationOne(String id) => '/organizations/$id';
  static String organizationStatus(String id) => '/organizations/$id/status';
  static String organizationApprove(String id) => '/organizations/$id/approve';
  static String organizationReject(String id) => '/organizations/$id/reject';
  static const String billingPlans = '/billing/plans';
  static String billingPlanOne(String id) => '/billing/plans/$id';

  // Billing Gateways
  static const String billingGateways = '/billing/gateways';
  static String billingGatewayOne(String id) => '/billing/gateways/$id';
  static String billingGatewaySimulateOrder(String id) => '/billing/gateways/$id/simulate-order';
  static String billingGatewayTest(String id) => '/billing/gateways/$id/test';
  static String billingGatewayTestConnection(String id) => '/billing/gateways/$id/test-connection';

  // Billing Invoices (Subscription SaaS)
  static const String billingInvoices = '/billing/invoices';
  static String billingInvoiceOne(String id) => '/billing/invoices/$id';
  static String billingInvoiceHtml(String id) => '/billing/invoices/$id/html';
  static String billingInvoicePay(String id) => '/billing/invoices/$id/pay';

  // Billing Revenue & Settlements
  static const String billingRevenueSummary = '/billing/revenue/summary';
  static const String billingRevenueShares = '/billing/revenue/shares';
  static const String billingRevenueSettlements = '/billing/revenue/settlements';
  static const String billingRevenueTopTenants = '/billing/revenue/top-tenants';

  // Billing Subscriptions
  static const String billingSubscription = '/billing/subscription';
  static const String billingSubscriptionCheckStatus = '/billing/subscription/check-status';
  static const String billingSubscriptionOrder = '/billing/subscription/order';
  static const String billingSubscriptionConfirm = '/billing/subscription/confirm';
  static const String billingSubscriptionVerifySession = '/billing/subscription/verify-session';

  // Billing Transactions & Wallet
  static const String billingTransactions = '/billing/transactions';
  static const String billingTransactionsManualOffline = '/billing/transactions/manual-offline';
  static const String billingWallet = '/billing/wallet';

  // Cron & Webhook
  static const String billingCronCheckExpiries = '/billing/cron/check-expiries';
  static String webhookGateway(String gateway) => '/webhooks/$gateway';

  // Campaigns & Advertiser Endpoints
  static const String campaigns = '/campaigns';
  static String campaignOne(String id) => '/campaigns/$id';
  static const String campaignFleetOptions = '/campaigns/fleet-options';
  static const String campaignMqttStatus = '/campaigns/mqtt-status';
  static const String campaignSlotAvailability = '/campaigns/slots/availability';
  static const String campaignTrackingLive = '/campaigns/tracking/live';
  static const String campaignTrackingRoutes = '/campaigns/tracking/routes';
  static const String campaignAnalyticsOverview = '/campaigns/analytics/overview';
  static const String campaignAnalyticsAll = '/campaigns/analytics';
  static String campaignAnalytics(String id) => (id.isNotEmpty && id != 'all') ? '/campaigns/$id/analytics' : '/campaigns/analytics';
  static String campaignReviews(String id) => '/campaigns/$id/reviews';
  static String campaignSubmit(String id) => '/campaigns/$id/submit';
  static String campaignApprove(String id) => '/campaigns/$id/approve';
  static String campaignReject(String id) => '/campaigns/$id/reject';
  static String campaignVerify(String id) => '/campaigns/$id/verify';
  static String campaignStart(String id) => '/campaigns/$id/start';
  static String campaignStop(String id) => '/campaigns/$id/stop';
  static String campaignPause(String id) => '/campaigns/$id/pause';
  static String campaignEnd(String id) => '/campaigns/$id/end';
  static String campaignComplete(String id) => '/campaigns/$id/complete';
  static String campaignPay(String id) => '/campaigns/$id/pay';
  static String campaignPayConfirm(String id) => '/campaigns/$id/confirm-payment';
  static String campaignRecordOfflinePayment(String id) => '/campaigns/$id/record-offline-payment';
  static String campaignSharePaymentLink(String id) => '/campaigns/$id/share-payment-link';
  static String campaignPublicCheckout(String id) => '/campaigns/$id/public-checkout';
  static String campaignPublicInvoice(String id) => '/campaigns/$id/public-invoice';

  // Advertisers Directory Endpoints
  static const String advertisers = '/advertisers';
  static String advertiserOne(String id) => '/advertisers/$id';
  static String advertiserStatus(String id) => '/advertisers/$id/status';
  static const String campaignAdvertisers = '/campaigns/advertisers';
  static String campaignAdvertiserOne(String id) => '/campaigns/advertisers/$id';

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
