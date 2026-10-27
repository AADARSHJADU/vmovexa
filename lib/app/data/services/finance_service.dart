import 'package:get/get.dart';
import '../constants/api_constants.dart';
import '../models/api_response_model.dart';
import 'http_client_service.dart';

class FinanceService extends GetxService {
  static FinanceService get to => Get.find<FinanceService>();

  HttpClientService get _http => HttpClientService.to;

  // ==========================================================
  // SECTION 1: Finance KPIs & Overview
  // ==========================================================

  /// GET /finance/kpis
  Future<ApiResponseModel<Map<String, dynamic>>> getKpis() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeKpis,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /finance/report-summary
  Future<ApiResponseModel<Map<String, dynamic>>> getReportSummary({
    int? month,
    int? year,
    String? period,
    String? startDate,
    String? endDate,
  }) async {
    final queryParams = <String, dynamic>{
      if (month != null) 'month': month,
      if (year != null) 'year': year,
      if (period != null) 'period': period,
      if (startDate != null && startDate.isNotEmpty) 'startDate': startDate,
      if (endDate != null && endDate.isNotEmpty) 'endDate': endDate,
    };

    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeReportSummary,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /reports
  Future<ApiResponseModel<dynamic>> getReports({
    int page = 1,
    int limit = 50,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    return _http.get<dynamic>(
      ApiConstants.reports,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /reports/generate
  Future<ApiResponseModel<Map<String, dynamic>>> generateReport(Map<String, dynamic> data) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.reportGenerate,
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  /// DELETE /reports/:id
  Future<ApiResponseModel<dynamic>> deleteReport(String id) async {
    return _http.delete<dynamic>(
      ApiConstants.reportOne(id),
      requiresAuth: true,
      create: (res) => res,
    );
  }

  // ==========================================================
  // SECTION 2: Invoices
  // ==========================================================

  /// GET /finance/invoices
  Future<ApiResponseModel<dynamic>> getInvoices({
    int page = 1,
    int limit = 20,
    String? status,
    String? search,
    String? startDate,
    String? endDate,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status.toLowerCase(),
      if (search != null && search.isNotEmpty) 'search': search,
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
    };

    return _http.get<dynamic>(
      ApiConstants.financeInvoices,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /finance/invoices/:id
  Future<ApiResponseModel<Map<String, dynamic>>> getInvoice(String id) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeInvoiceOne(id),
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /finance/invoices
  Future<ApiResponseModel<Map<String, dynamic>>> generateInvoice(Map<String, dynamic> data) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.financeInvoices,
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  /// POST /finance/invoices/:id/mark-paid
  Future<ApiResponseModel<Map<String, dynamic>>> markInvoicePaid(
    String id,
    Map<String, dynamic> data,
  ) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.financeInvoiceMarkPaid(id),
      body: data,
      requiresAuth: true,
      create: (res) => res is Map ? Map<String, dynamic>.from(res) : <String, dynamic>{},
    );
  }

  // ==========================================================
  // SECTION 3: Payments & Campaign Payments
  // ==========================================================

  /// GET /finance/payments
  Future<ApiResponseModel<dynamic>> getPayments({
    int page = 1,
    int limit = 20,
    String? status,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status.toLowerCase(),
      if (search != null && search.isNotEmpty) 'search': search,
    };

    return _http.get<dynamic>(
      ApiConstants.financePayments,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /finance/payments/:id
  Future<ApiResponseModel<Map<String, dynamic>>> getPayment(String id) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financePaymentOne(id),
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /finance/payments/:id/send-reminder
  Future<ApiResponseModel<dynamic>> sendPaymentReminder(
    String id, [
    Map<String, dynamic>? data,
  ]) async {
    return _http.post<dynamic>(
      ApiConstants.financePaymentReminder(id),
      body: data ?? {},
      requiresAuth: true,
      create: (res) => res,
    );
  }

  /// GET /finance/campaign-payments
  Future<ApiResponseModel<dynamic>> getCampaignPayments({
    int page = 1,
    int limit = 20,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    return _http.get<dynamic>(
      ApiConstants.financeCampaignPayments,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /finance/campaign-payments/:id/share-link
  Future<ApiResponseModel<dynamic>> shareCampaignPaymentLink(
    String id, [
    Map<String, dynamic>? data,
  ]) async {
    return _http.post<dynamic>(
      ApiConstants.financeCampaignPaymentShare(id),
      body: data ?? {},
      requiresAuth: true,
      create: (res) => res,
    );
  }

  /// POST /finance/campaign-payments/:id/manual-pay
  Future<ApiResponseModel<dynamic>> recordManualCampaignPayment(
    String id,
    Map<String, dynamic> data,
  ) async {
    return _http.post<dynamic>(
      ApiConstants.financeCampaignPaymentManual(id),
      body: data,
      requiresAuth: true,
      create: (res) => res,
    );
  }

  // ==========================================================
  // SECTION 4: Subscriptions / Tenants
  // ==========================================================

  /// GET /finance/subscriptions
  Future<ApiResponseModel<dynamic>> getSubscriptions({
    int page = 1,
    int limit = 20,
    String? search,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status.toLowerCase(),
    };

    return _http.get<dynamic>(
      ApiConstants.financeSubscriptions,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /finance/subscriptions/:id
  Future<ApiResponseModel<Map<String, dynamic>>> getSubscription(String id) async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeSubscriptionOne(id),
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /organizations (Tenants List)
  Future<ApiResponseModel<dynamic>> getOrganizations({
    int page = 1,
    int limit = 50,
    String? search,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
      if (status != null && status.isNotEmpty && status.toLowerCase() != 'all') 'status': status.toLowerCase(),
    };

    return _http.get<dynamic>(
      ApiConstants.organizations,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// GET /billing/plans
  Future<ApiResponseModel<dynamic>> getBillingPlans() async {
    return _http.get<dynamic>(
      ApiConstants.billingPlans,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /organizations (Onboard new tenant)
  Future<ApiResponseModel<Map<String, dynamic>>> createOrganization(Map<String, dynamic> payload) async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.organizations,
      body: payload,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /organizations/:id/approve
  Future<ApiResponseModel<dynamic>> approveOrganization(String id, [Map<String, dynamic>? data]) async {
    return _http.post<dynamic>(
      ApiConstants.organizationApprove(id),
      body: data ?? {},
      requiresAuth: true,
      create: (res) => res,
    );
  }

  /// PATCH /organizations/:id/status
  Future<ApiResponseModel<dynamic>> updateOrganizationStatus(String id, String status) async {
    return _http.patch<dynamic>(
      ApiConstants.organizationStatus(id),
      body: {'status': status},
      requiresAuth: true,
      create: (res) => res,
    );
  }

  // ==========================================================
  // SECTION 5: GST Management
  // ==========================================================

  /// GET /finance/gst/summary
  Future<ApiResponseModel<Map<String, dynamic>>> getGstSummary({
    int? month,
    int? year,
  }) async {
    final queryParams = <String, dynamic>{
      if (month != null) 'month': month,
      if (year != null) 'year': year,
    };

    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeGstSummary,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /finance/gst/gstr1-json
  Future<ApiResponseModel<dynamic>> getGstr1Json({
    int? month,
    int? year,
  }) async {
    final queryParams = <String, dynamic>{
      if (month != null) 'month': month,
      if (year != null) 'year': year,
    };

    return _http.get<dynamic>(
      ApiConstants.financeGstr1Json,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  // ==========================================================
  // SECTION 6: Financial Reconciliation
  // ==========================================================

  /// GET /finance/reconciliation/summary
  Future<ApiResponseModel<Map<String, dynamic>>> getReconciliationSummary() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeReconciliationSummary,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// GET /finance/reconciliation/transactions
  Future<ApiResponseModel<dynamic>> getReconciliationTransactions({
    int page = 1,
    int limit = 50,
    String? status,
    String? accountId,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null && status.isNotEmpty) 'status': status,
      if (accountId != null && accountId.isNotEmpty) 'account': accountId,
    };

    return _http.get<dynamic>(
      ApiConstants.financeReconciliationTransactions,
      queryParams: queryParams,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  /// POST /finance/reconciliation/auto-match
  Future<ApiResponseModel<Map<String, dynamic>>> autoMatchReconciliation() async {
    return _http.post<Map<String, dynamic>>(
      ApiConstants.financeReconciliationAutoMatch,
      body: {},
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// POST /finance/reconciliation/finalize
  Future<ApiResponseModel<dynamic>> finalizeReconciliation(Map<String, dynamic> data) async {
    return _http.post<dynamic>(
      ApiConstants.financeReconciliationFinalize,
      body: data,
      requiresAuth: true,
      create: (data) => data,
    );
  }

  // ==========================================================
  // SECTION 7: Finance Corporate Settings
  // ==========================================================

  /// GET /finance/settings
  Future<ApiResponseModel<Map<String, dynamic>>> getSettings() async {
    return _http.get<Map<String, dynamic>>(
      ApiConstants.financeSettings,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }

  /// PUT /finance/settings
  Future<ApiResponseModel<Map<String, dynamic>>> updateSettings(Map<String, dynamic> data) async {
    return _http.put<Map<String, dynamic>>(
      ApiConstants.financeSettings,
      body: data,
      requiresAuth: true,
      create: (data) => data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{},
    );
  }
}
