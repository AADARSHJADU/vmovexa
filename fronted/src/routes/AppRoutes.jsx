import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layouts
import { RoleLayout } from '../layouts/RoleLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Auth guards + RBAC
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { PermissionRoute } from './PermissionRoute';
import { VerifiedDriverRoute } from './VerifiedDriverRoute';
import { ROLE } from '../constants/roles';

// Auth Pages
import { LoginEmail } from '../pages/auth/LoginEmail';
import { LoginPhone } from '../pages/auth/LoginPhone';
import { Signup } from '../pages/auth/Signup';
import { OtpVerification } from '../pages/auth/OtpVerification';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { Success } from '../pages/auth/Success';
import { AcceptInvite } from '../pages/auth/AcceptInvite';
import { ZohoCallback } from '../pages/auth/ZohoCallback';
import { AppleCallback } from '../pages/auth/AppleCallback';

// Fleet Manager Pages
import { FleetManagerDashboard } from '../pages/fleet-manager/FleetManagerDashboard';
import { SetupCompletePage } from '../pages/fleet-manager/SetupCompletePage';
import { AssignDriverPage } from '../pages/fleet-manager/AssignDriverPage';
import { LiveTrackingPage } from '../pages/fleet-manager/LiveTrackingPage';
import { TripsPage } from '../pages/fleet-manager/TripsPage';
import { TripDetailsPage } from '../pages/fleet-manager/TripDetailsPage';
import { ReportsAnalyticsPage } from '../pages/fleet-manager/ReportsAnalyticsPage';
import { NotificationsPage } from '../pages/fleet-manager/NotificationsPage';
import { ProfileSettingsPage } from '../pages/fleet-manager/ProfileSettingsPage';
import { AccountSettingsPage } from '../pages/fleet-manager/AccountSettingsPage';
import { ChangePasswordPage } from '../pages/fleet-manager/ChangePasswordPage';
import { PasswordUpdatedPage } from '../pages/fleet-manager/PasswordUpdatedPage';
import { NotificationSettingsPage } from '../pages/fleet-manager/NotificationSettingsPage';
import { HelpSupportPage } from '../pages/fleet-manager/HelpSupportPage';
import { SupportHistoryPage } from '../pages/fleet-manager/SupportHistoryPage';
import { PrivacyPolicyPage } from '../pages/fleet-manager/PrivacyPolicyPage';
import { TermsPage } from '../pages/fleet-manager/TermsPage';
import { FleetIncidentsPage } from '../pages/fleet-manager/FleetIncidentsPage';
import { FleetReportIncidentPage } from '../pages/fleet-manager/FleetReportIncidentPage';
import { FleetIncidentSuccessPage } from '../pages/fleet-manager/FleetIncidentSuccessPage';

// Advertiser Pages
import { AdvertiserDashboardPage } from '../pages/advertiser/AdvertiserDashboardPage';
import { CampaignsListPage } from '../pages/advertiser/CampaignsListPage';
import { CreateCampaignPage } from '../pages/advertiser/CreateCampaignPage';
import { CampaignSuccessPage } from '../pages/advertiser/CampaignSuccessPage';
import { CampaignLifecyclePage } from '../pages/advertiser/CampaignLifecyclePage';
import { CampaignDetailsPage } from '../pages/advertiser/CampaignDetailsPage';
import { RecordOfflinePaymentPage } from '../pages/advertiser/RecordOfflinePaymentPage';
import { CampaignAnalyticsPage } from '../pages/advertiser/CampaignAnalyticsPage';
import { CampaignPublicPayPage } from '../pages/public/CampaignPublicPayPage';
import { QrScanLandingPage } from '../pages/public/QrScanLandingPage';
import { ReportsHubPage } from '../pages/advertiser/ReportsHubPage';
import { BillingPaymentsPage } from '../pages/advertiser/BillingPaymentsPage';
import { AdvertiserNotificationsPage } from '../pages/advertiser/AdvertiserNotificationsPage';
import { AdvertiserProfilePage } from '../pages/advertiser/AdvertiserProfilePage';
import { AdvertiserSettingsPage } from '../pages/advertiser/AdvertiserSettingsPage';
import { AdvertiserHelpPage } from '../pages/advertiser/AdvertiserHelpPage';
import { AdvertiserPrivacyPolicyPage } from '../pages/advertiser/AdvertiserPrivacyPolicyPage';
import { AdvertiserTermsPage } from '../pages/advertiser/AdvertiserTermsPage';
import { AdvertiserNotificationSettingsPage } from '../pages/advertiser/AdvertiserNotificationSettingsPage';
import { AdvertiserSupportHistoryPage } from '../pages/advertiser/AdvertiserSupportHistoryPage';
import { AdvertiserChangePasswordPage } from '../pages/advertiser/AdvertiserChangePasswordPage';
import { AdvertiserPasswordUpdatedPage } from '../pages/advertiser/AdvertiserPasswordUpdatedPage';

// Government Pages
import { GovernmentDashboardPage } from '../pages/government/GovernmentDashboardPage';
import { GovCampaignsListPage } from '../pages/government/GovCampaignsListPage';
import { GovCreateCampaignPage } from '../pages/government/GovCreateCampaignPage';
import { GovCampaignDetailsPage } from '../pages/government/GovCampaignDetailsPage';
import { GovRecordOfflinePaymentPage } from '../pages/government/GovRecordOfflinePaymentPage';
import { GovEmergencyListPage } from '../pages/government/GovEmergencyListPage';
import { GovEmergencyDetailsPage } from '../pages/government/GovEmergencyDetailsPage';
import { GovEditEmergencyBroadcastPage } from '../pages/government/GovEditEmergencyBroadcastPage';
import { GovEmergencyBroadcastPage } from '../pages/government/GovEmergencyBroadcastPage';
import { GovAnalyticsDashboardPage } from '../pages/government/GovAnalyticsDashboardPage';
import { GovLiveTrackingPage } from '../pages/government/GovLiveTrackingPage';
import { GovReportsPage } from '../pages/government/GovReportsPage';
import { GovBillingPaymentsPage } from '../pages/government/GovBillingPaymentsPage';
import { GovNotificationsPage } from '../pages/government/GovNotificationsPage';
import { GovProfilePage } from '../pages/government/GovProfilePage';
import { GovAccountSettingsPage } from '../pages/government/GovAccountSettingsPage';
import { GovChangePasswordPage } from '../pages/government/GovChangePasswordPage';
import { GovPasswordUpdatedPage } from '../pages/government/GovPasswordUpdatedPage';
import { GovNotificationSettingsPage } from '../pages/government/GovNotificationSettingsPage';
import { GovHelpSupportPage } from '../pages/government/GovHelpSupportPage';
import { GovSupportHistoryPage } from '../pages/government/GovSupportHistoryPage';
import { GovPrivacyPolicyPage } from '../pages/government/GovPrivacyPolicyPage';
import { GovTermsPage } from '../pages/government/GovTermsPage';

// Technician Pages
import { TechnicianDashboard } from '../pages/technician/TechnicianDashboard';
import { TechWorkOrdersPage } from '../pages/technician/TechWorkOrdersPage';
import { TechWorkOrderDetailPage } from '../pages/technician/TechWorkOrderDetailPage';
import { TechEdgeSetupPage } from '../pages/technician/TechEdgeSetupPage';
import { TechHardwareConfigPage } from '../pages/technician/TechHardwareConfigPage';
import { TechConfigSavedPage } from '../pages/technician/TechConfigSavedPage';
import { TechGpsInstallPage } from '../pages/technician/TechGpsInstallPage';
import { TechGpsInstalledPage } from '../pages/technician/TechGpsInstalledPage';
import { TechHardwareStatusPage } from '../pages/technician/TechHardwareStatusPage';
import { TechDiagnosticsPage } from '../pages/technician/TechDiagnosticsPage';
import { TechConnectivityPage } from '../pages/technician/TechConnectivityPage';
import { TechNotificationsPage } from '../pages/technician/TechNotificationsPage';
import { TechProfilePage } from '../pages/technician/TechProfilePage';
import { TechAccountSettingsPage } from '../pages/technician/TechAccountSettingsPage';
import { TechChangePasswordPage } from '../pages/technician/TechChangePasswordPage';
import { TechPasswordUpdatedPage } from '../pages/technician/TechPasswordUpdatedPage';
import { TechNotificationSettingsPage } from '../pages/technician/TechNotificationSettingsPage';
import { TechHelpSupportPage } from '../pages/technician/TechHelpSupportPage';
import { TechSupportHistoryPage } from '../pages/technician/TechSupportHistoryPage';
import { TechPrivacyPolicyPage } from '../pages/technician/TechPrivacyPolicyPage';
import { TechTermsPage } from '../pages/technician/TechTermsPage';

// Driver Pages
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { DriverRoutesPage } from '../pages/driver/DriverRoutesPage';
import { DriverTripsPage } from '../pages/driver/DriverTripsPage';
import { DriverSchedulePage } from '../pages/driver/DriverSchedulePage';
import { DriverReportIncidentPage } from '../pages/driver/DriverReportIncidentPage';
import { DriverIncidentsListPage } from '../pages/driver/DriverIncidentsListPage';
import { DriverIncidentDetailsPage } from '../pages/driver/DriverIncidentDetailsPage';
import { DriverIncidentSuccessPage } from '../pages/driver/DriverIncidentSuccessPage';
import { DriverDocumentsPage } from '../pages/driver/DriverDocumentsPage';
import { DriverUploadDocumentPage } from '../pages/driver/DriverUploadDocumentPage';
import { DriverDocumentSubmittedPage } from '../pages/driver/DriverDocumentSubmittedPage';
import { DriverNotificationsPage } from '../pages/driver/DriverNotificationsPage';
import { DriverProfilePage } from '../pages/driver/DriverProfilePage';
import { DriverAccountSettingsPage } from '../pages/driver/DriverAccountSettingsPage';
import { DriverChangePasswordPage } from '../pages/driver/DriverChangePasswordPage';
import { DriverPasswordUpdatedPage } from '../pages/driver/DriverPasswordUpdatedPage';
import { DriverNotificationSettingsPage } from '../pages/driver/DriverNotificationSettingsPage';
import { DriverHelpSupportPage } from '../pages/driver/DriverHelpSupportPage';
import { DriverSupportHistoryPage } from '../pages/driver/DriverSupportHistoryPage';
import { DriverPrivacyPolicyPage } from '../pages/driver/DriverPrivacyPolicyPage';
import { DriverTermsPage } from '../pages/driver/DriverTermsPage';
import { CreateSupportTicketPage } from '../pages/shared/CreateSupportTicketPage';

// Finance Pages
import { FinanceDashboardPage } from '../pages/finance/FinanceDashboardPage';
import { InvoicesListPage } from '../pages/finance/InvoicesListPage';
import { GenerateInvoicePage } from '../pages/finance/GenerateInvoicePage';
import { InvoiceDesignerPage } from '../pages/finance/InvoiceDesignerPage';
import { InvoicePreviewPage } from '../pages/finance/InvoicePreviewPage';
import { PaymentsListPage } from '../pages/finance/PaymentsListPage';
import { PaymentDetailsPage } from '../pages/finance/PaymentDetailsPage';
import { RevenueReportingPage } from '../pages/finance/RevenueReportingPage';
import { ReportDetailsPage } from '../pages/finance/ReportDetailsPage';
import { ReportGeneratedSuccessPage } from '../pages/finance/ReportGeneratedSuccessPage';
import { GstManagementPage } from '../pages/finance/GstManagementPage';
import { FinancialReconciliationPage } from '../pages/finance/FinancialReconciliationPage';
import { StartReconciliationPage } from '../pages/finance/StartReconciliationPage';
import { ReconciliationCompletePage } from '../pages/finance/ReconciliationCompletePage';
import { FinanceNotificationsPage } from '../pages/finance/FinanceNotificationsPage';
import { FinanceProfilePage } from '../pages/finance/FinanceProfilePage';
import { FinanceAccountSettingsPage } from '../pages/finance/FinanceAccountSettingsPage';
import { FinanceOfficerAccountSettingsPage } from '../pages/finance/FinanceOfficerAccountSettingsPage';
import { FinanceChangePasswordPage } from '../pages/finance/FinanceChangePasswordPage';
import { FinancePasswordUpdatedPage } from '../pages/finance/FinancePasswordUpdatedPage';
import { FinanceNotificationSettingsPage } from '../pages/finance/FinanceNotificationSettingsPage';
import { FinanceHelpSupportPage } from '../pages/finance/FinanceHelpSupportPage';
import { FinanceSupportHistoryPage } from '../pages/finance/FinanceSupportHistoryPage';
import { FinancePrivacyPolicyPage } from '../pages/finance/FinancePrivacyPolicyPage';
import { FinanceTermsPage } from '../pages/finance/FinanceTermsPage';

// Super Admin Pages
import { SuperadminDashboard } from '../pages/superadmin/SuperadminDashboard';
import { SuperEmergencyApprovalsPage } from '../pages/superadmin/SuperEmergencyApprovalsPage';
import { SuperEmergencyDetailsPage } from '../pages/superadmin/SuperEmergencyDetailsPage';
import { TenantsListPage } from '../pages/superadmin/TenantsListPage';
import { OnboardTenantPage } from '../pages/superadmin/OnboardTenantPage';
import { TenantDetailsPage } from '../pages/superadmin/TenantDetailsPage';
import { EditTenantPage } from '../pages/superadmin/EditTenantPage';
import { CentralTechniciansPage } from '../pages/superadmin/CentralTechniciansPage';
import { RegisterTechnicianPage } from '../pages/superadmin/RegisterTechnicianPage';
import { TechnicianDetailsPage } from '../pages/superadmin/TechnicianDetailsPage';
import { AssignedWorkOrdersPage } from '../pages/superadmin/AssignedWorkOrdersPage';
import { SuperWorkOrderDetailPage } from '../pages/superadmin/SuperWorkOrderDetailPage';
import { AssignTechnicianPage } from '../pages/superadmin/AssignTechnicianPage';
import { SuperCampaignsPage } from '../pages/superadmin/campaigns/SuperCampaignsPage';
import { SuperCampaignDetailsPage } from '../pages/superadmin/campaigns/SuperCampaignDetailsPage';
import { EmergencyBroadcastPage } from '../pages/superadmin/EmergencyBroadcastPage';
import { SuperAdvertisersPage } from '../pages/superadmin/SuperAdvertisersPage';
import { OnboardAdvertiserPage } from '../pages/superadmin/OnboardAdvertiserPage';
import { AdvertiserDetailsPage } from '../pages/superadmin/AdvertiserDetailsPage';
import { SuperGovernmentPage } from '../pages/superadmin/SuperGovernmentPage';
import { AuthorizeGovernmentPage } from '../pages/superadmin/AuthorizeGovernmentPage';
import { GovernmentDetailsPage } from '../pages/superadmin/GovernmentDetailsPage';
import { SuperFinanceOfficersPage } from '../pages/superadmin/SuperFinanceOfficersPage';
import { FinanceOfficerDetailsPage } from '../pages/superadmin/FinanceOfficerDetailsPage';
import { RegisterFinanceOfficerPage } from '../pages/superadmin/RegisterFinanceOfficerPage';
import { EdgeDevicesPage } from '../pages/superadmin/EdgeDevicesPage';
import { RegisterEdgeDevicePage } from '../pages/superadmin/RegisterEdgeDevicePage';
import { EdgeDeviceDetailsPage } from '../pages/superadmin/EdgeDeviceDetailsPage';
import { DisplayMatrixPage } from '../pages/superadmin/DisplayMatrixPage';
import { SuperBillingPage } from '../pages/superadmin/SuperBillingPage';
import { SuperPaymentGatewaysPage } from '../pages/superadmin/SuperPaymentGatewaysPage';
import { SuperSubscriptionPlansPage } from '../pages/superadmin/SuperSubscriptionPlansPage';
import { SuperTransactionsPage } from '../pages/superadmin/SuperTransactionsPage';
import { GlobalUsersPage } from '../pages/superadmin/GlobalUsersPage';
import { SuperUserPermissionsPage } from '../pages/superadmin/SuperUserPermissionsPage';
import { SuperRolesPermissionsPage } from '../pages/superadmin/SuperRolesPermissionsPage';
import { SuperUserActivityPage } from '../pages/superadmin/SuperUserActivityPage';
import { MqttSystemLogsPage } from '../pages/superadmin/MqttSystemLogsPage';
import { SuperProfilePage } from '../pages/superadmin/SuperProfilePage';
import { SuperAccountSettingsPage } from '../pages/superadmin/SuperAccountSettingsPage';
import { SuperChangePasswordPage } from '../pages/superadmin/SuperChangePasswordPage';
import { SuperPasswordUpdatedPage } from '../pages/superadmin/SuperPasswordUpdatedPage';
import { SuperChannelSettingsPage } from '../pages/superadmin/SuperChannelSettingsPage';
import { SuperNotificationRulesPage } from '../pages/superadmin/SuperNotificationRulesPage';
import { SuperSmtpSettingsPage } from '../pages/superadmin/SuperSmtpSettingsPage';
import { SuperSmsSettingsPage } from '../pages/superadmin/SuperSmsSettingsPage';
import { SuperWhatsappSettingsPage } from '../pages/superadmin/SuperWhatsappSettingsPage';
import { SuperPushSettingsPage } from '../pages/superadmin/SuperPushSettingsPage';
import { SuperNotificationsPage } from '../pages/superadmin/SuperNotificationsPage';
import { SuperHelpSupportPage } from '../pages/superadmin/SuperHelpSupportPage';
import { SuperSupportHistoryPage } from '../pages/superadmin/SuperSupportHistoryPage';
import { SuperPrivacyPolicyPage } from '../pages/superadmin/SuperPrivacyPolicyPage';
import { SuperTermsPage } from '../pages/superadmin/SuperTermsPage';
import { SuperLanguagesPage } from '../pages/superadmin/SuperLanguagesPage';
import { SuperContentManagerPage } from '../pages/superadmin/SuperContentManagerPage';
import { SuperSupportDeskPage } from '../pages/superadmin/SuperSupportDeskPage';
import { SuperIncidentsPage } from '../pages/superadmin/SuperIncidentsPage';
import { SuperReportIncidentPage } from '../pages/superadmin/SuperReportIncidentPage';
import { SuperIncidentSuccessPage } from '../pages/superadmin/SuperIncidentSuccessPage';
import { NotificationDeliveryLogsPage } from '../pages/superadmin/NotificationDeliveryLogsPage';
import { LiveServerLogsPage } from '../pages/superadmin/LiveServerLogsPage';
import { SuperGoogleApisPage } from '../pages/superadmin/SuperGoogleApisPage';
import { SuperGoogleApisPlaygroundPage } from '../pages/superadmin/SuperGoogleApisPlaygroundPage';

// Organization Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { FleetOperatorsPage } from '../pages/admin/FleetOperatorsPage';
import { AddFleetOperatorPage } from '../pages/admin/AddFleetOperatorPage';
import { FleetOperatorDetailsPage } from '../pages/admin/FleetOperatorDetailsPage';
import { AdminDriversPage } from '../pages/admin/AdminDriversPage';
import { AdminAddDriverPage } from '../pages/admin/AdminAddDriverPage';
import { AdminDriverDetailsPage } from '../pages/admin/AdminDriverDetailsPage';
import { AdminVehiclesPage } from '../pages/admin/AdminVehiclesPage';
import { AddVehiclePage as AdminAddVehiclePage } from '../pages/admin/AddVehiclePage';
import { VehicleSlotsPage } from '../pages/fleet-manager/VehicleSlotsPage';
import { VehicleSlotDetailsPage } from '../pages/fleet-manager/VehicleSlotDetailsPage';
import { ScheduleSlotPage } from '../pages/fleet-manager/ScheduleSlotPage';
import { AdminVehicleSlotsPage } from '../pages/admin/AdminVehicleSlotsPage';
import { AdminVehicleSlotDetailsPage } from '../pages/admin/AdminVehicleSlotDetailsPage';
import { AdminVehicleDetailsPage } from '../pages/admin/AdminVehicleDetailsPage';
import { AdminDepotsPage } from '../pages/admin/AdminDepotsPage';
import { AddDepotPage } from '../pages/admin/AddDepotPage';
import { AdminDepotDetailsPage } from '../pages/admin/AdminDepotDetailsPage';
import { TechRequestsPage } from '../pages/admin/TechRequestsPage';
import { AdminTechRequestDetailsPage } from '../pages/admin/AdminTechRequestDetailsPage';
import { RateTechnicianPage } from '../pages/admin/RateTechnicianPage';
import { NewTechRequestPage } from '../pages/admin/NewTechRequestPage';
import { AdminUserManagementPage } from '../pages/admin/AdminUserManagementPage';
import { AdminUserPermissionsPage } from '../pages/admin/AdminUserPermissionsPage';
import { AdminUserActivityPage } from '../pages/admin/AdminUserActivityPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { AdminAccountSettingsPage } from '../pages/admin/AdminAccountSettingsPage';
import { AdminChangePasswordPage } from '../pages/admin/AdminChangePasswordPage';
import { AdminPasswordUpdatedPage } from '../pages/admin/AdminPasswordUpdatedPage';
import { AdminNotificationSettingsPage } from '../pages/admin/AdminNotificationSettingsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminHelpSupportPage } from '../pages/admin/AdminHelpSupportPage';
import { AdminSupportHistoryPage } from '../pages/admin/AdminSupportHistoryPage';
import { AdminPrivacyPolicyPage } from '../pages/admin/AdminPrivacyPolicyPage';
import { AdminTermsPage } from '../pages/admin/AdminTermsPage';
import { TenantPendingApprovalPage } from '../pages/admin/TenantPendingApprovalPage';
import { TenantSubscriptionCheckoutPage } from '../pages/admin/TenantSubscriptionCheckoutPage';
import { AdminBillingPage } from '../pages/admin/AdminBillingPage';
import { AdminUpgradePlanPage } from '../pages/admin/AdminUpgradePlanPage';
import { AdminGpsDevicesPage } from '../pages/admin/AdminGpsDevicesPage';
import { AddGpsPage as AdminAddGpsPage } from '../pages/admin/AddGpsPage';
import { AssignGpsPage as AdminAssignGpsPage } from '../pages/admin/AssignGpsPage';
import { AssignGpsPage as FleetAssignGpsPage } from '../pages/fleet-manager/AssignGpsPage';
import { GpsDeviceDetailsPage as AdminGpsDeviceDetailsPage } from '../pages/admin/GpsDeviceDetailsPage';
import { AdminAccessGate } from './AdminAccessGate';
import { RolePolicyPage } from '../components/content/RolePolicyPage';
import { AdminIncidentsPage } from '../pages/admin/AdminIncidentsPage';
import { AdminReportIncidentPage } from '../pages/admin/AdminReportIncidentPage';
import { AdminIncidentSuccessPage } from '../pages/admin/AdminIncidentSuccessPage';
import RoutesListPage from '../pages/admin/routes/RoutesListPage';
import AddRoutePage from '../pages/admin/routes/AddRoutePage';
import RouteDetailsPage from '../pages/admin/routes/RouteDetailsPage';
import { FinanceCampaignPaymentsPage } from '../pages/finance/FinanceCampaignPaymentsPage';
import { AdminCampaignMappingPage } from '../pages/admin/AdminCampaignMappingPage';

// Mature Enterprise SVG Icons for Sidebar Navigation
const Icons = {
  Dashboard: (
    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Fleets: (
    <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Depots: (
    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Vehicles: (
    <svg className="w-4 h-4 text-sky-500 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h4m4 6H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z" />
    </svg>
  ),
  Drivers: (
    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Gps: (
    <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Tracking: (
    <svg className="w-4 h-4 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Trips: (
    <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Reports: (
    <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Notifications: (
    <svg className="w-4 h-4 text-amber-400 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Profile: (
    <svg className="w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Help: (
    <svg className="w-4 h-4 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Privacy: (
    <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Terms: (
    <svg className="w-4 h-4 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Campaigns: (
    <svg className="w-4 h-4 text-pink-500 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Analytics: (
    <svg className="w-4 h-4 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Emergency: (
    <svg className="w-4 h-4 text-red-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Approvals: (
    <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Languages: (
    <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
  Ticket: (
    <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Settings: (
    <svg className="w-4 h-4 text-slate-400 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Billing: (
    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Slots: (
    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Terminal: (
    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  EdgeDevice: (
    <svg className="w-4 h-4 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2zm2 4h6v6H9V9z" />
    </svg>
  ),
};

function FleetManagerLegacyRedirect() {
  const location = useLocation();
  const target = location.pathname.replace(/^\/fleet-manager/, '/fleet-operator') || '/fleet-operator/dashboard';
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}

const fleetManagerNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Overview Dashboard', path: '/fleet-operator/dashboard', iconSvg: Icons.Dashboard, permission: 'fleet.dashboard.view' },

  { isHeader: true, label: 'Fleet & Telematics' },
  { label: 'Transit Routes', path: '/fleet-operator/routes', iconSvg: Icons.Trips, permission: 'fleet.routes.view' },
  { label: 'Vehicles & Displays', path: '/fleet-operator/vehicles', iconSvg: Icons.Vehicles, permission: 'fleet.vehicles.view' },
  { label: 'Drivers & Staff', path: '/fleet-operator/drivers', iconSvg: Icons.Drivers, permission: 'fleet.drivers.view' },
  { label: 'Vehicle Slots & Timetable', path: '/fleet-operator/slots', iconSvg: Icons.Slots, permission: ['fleet.slots.view', 'fleet.vehicles.view'] },
  { label: 'Edge Devices', path: '/fleet-operator/edge-devices', iconSvg: Icons.EdgeDevice, permission: 'fleet.devices.read' },
  { label: 'Live Telematics', path: '/fleet-operator/tracking', iconSvg: Icons.Tracking, permission: 'fleet.tracking.view' },
  { label: 'Trips & Dispatch', path: '/fleet-operator/trips', iconSvg: Icons.Trips, permission: 'fleet.trips.view' },
  { label: 'Technician Requests', path: '/fleet-operator/technician-requests', iconSvg: Icons.Tracking, permission: 'work_orders.view' },
  { label: 'Report Incident', path: '/fleet-operator/incident-report', iconSvg: Icons.Emergency, permission: 'fleet.incidents.create' },
  { label: 'Incidents Log', path: '/fleet-operator/incidents', iconSvg: Icons.Reports, permission: 'fleet.incidents.view' },

  { isHeader: true, label: 'Analytics & Alerts' },
  { label: 'Analytics & Reports', path: '/fleet-operator/reports', iconSvg: Icons.Reports, permission: 'fleet.reports.view' },
  { label: 'Activity Logs', path: '/fleet-operator/activity', iconSvg: Icons.Trips, permission: 'activity.view' },
  { label: 'Alerts & Events', path: '/fleet-operator/notifications', iconSvg: Icons.Notifications },

  { isHeader: true, label: 'Account & Support' },
  { label: 'Operator Profile', path: '/fleet-operator/profile', iconSvg: Icons.Profile },
  { label: 'Help & Documentation', path: '/fleet-operator/help', iconSvg: Icons.Help, permission: 'support.view' },
  { label: 'Privacy Policy', path: '/fleet-operator/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & Conditions', path: '/fleet-operator/terms', iconSvg: Icons.Terms },
];

const advertiserNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Overview Dashboard', path: '/advertiser/dashboard', iconSvg: Icons.Dashboard, permission: 'advertiser.dashboard.view' },

  { isHeader: true, label: 'Campaigns' },
  { label: 'Campaigns Hub', path: '/advertiser/campaigns', iconSvg: Icons.Campaigns, permission: 'campaigns.view' },
  { label: 'Create New Campaign', path: '/advertiser/campaigns/create', iconSvg: Icons.Campaigns, permission: 'campaigns.create' },
  { label: 'Lifecycle & Flow', path: '/advertiser/campaigns/flow', iconSvg: Icons.Campaigns, permission: 'campaigns.view' },
  { label: 'Analytics & Heatmaps', path: '/advertiser/analytics', iconSvg: Icons.Analytics, permission: 'campaigns.analytics.view' },
  { label: 'Proof-of-Play Reports', path: '/advertiser/reports', iconSvg: Icons.Reports, permission: 'reports.view' },

  { isHeader: true, label: 'Billing & Alerts' },
  { label: 'Billing & Wallet', path: '/advertiser/billing', iconSvg: Icons.Fleets, permission: 'finance.invoices.view' },
  { label: 'Alerts & Messages', path: '/advertiser/notifications', iconSvg: Icons.Notifications },

  { isHeader: true, label: 'Account & Legal' },
  { label: 'Brand Profile', path: '/advertiser/profile', iconSvg: Icons.Profile },
  { label: 'Account Settings', path: '/advertiser/settings', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/advertiser/help', iconSvg: Icons.Help },
  { label: 'Privacy Policy', path: '/advertiser/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & Conditions', path: '/advertiser/terms', iconSvg: Icons.Terms },
];

const governmentNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Authority Dashboard', path: '/government/dashboard', iconSvg: Icons.Dashboard, permission: 'government.dashboard.view' },

  { isHeader: true, label: 'Public Services' },
  { label: 'Public Campaigns', path: '/government/campaigns', iconSvg: Icons.Campaigns, permission: 'government.campaigns.view' },
  { label: 'Broadcast Campaign', path: '/government/campaigns/create', iconSvg: Icons.Campaigns, permission: 'government.campaigns.create' },
  { label: 'Emergency Broadcast', path: '/government/emergency', iconSvg: Icons.Emergency, permission: 'government.emergency.manage' },
  { label: 'Sovereign Tracking', path: '/government/tracking', iconSvg: Icons.Tracking, permission: 'government.tracking.view' },

  { isHeader: true, label: 'Analytics & Reports' },
  { label: 'Transit Analytics', path: '/government/analytics', iconSvg: Icons.Analytics, permission: 'government.analytics.view' },
  { label: 'Compliance Reports', path: '/government/reports', iconSvg: Icons.Reports, permission: 'government.reports.view' },

  { isHeader: true, label: 'Billing & Alerts' },
  { label: 'Billing & Invoices', path: '/government/billing', iconSvg: Icons.Fleets },
  { label: 'Critical Alerts', path: '/government/notifications', iconSvg: Icons.Notifications },

  { isHeader: true, label: 'Account & Legal' },
  { label: 'Agency Profile', path: '/government/profile', iconSvg: Icons.Profile },
  { label: 'Account Settings', path: '/government/settings', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/government/help', iconSvg: Icons.Help },
  { label: 'Privacy Policy', path: '/government/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & Conditions', path: '/government/terms', iconSvg: Icons.Terms },
];

const technicianNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Overview Dashboard', path: '/technician/dashboard', iconSvg: Icons.Dashboard, permission: 'technician.dashboard.view' },

  { isHeader: true, label: 'Work Orders & Field Tasks' },
  { label: 'Field Work Orders', path: '/technician/work-orders', iconSvg: Icons.Reports, permission: 'work_orders.view' },

  { isHeader: true, label: 'Device Operations' },
  { label: 'Android Edge Setup', path: '/technician/edge-setup', iconSvg: Icons.Terminal, permission: 'technician.devices.view' },
  { label: 'Edge Devices', path: '/technician/devices', iconSvg: Icons.Gps, permission: 'technician.devices.view' },
  { label: 'Hardware Status', path: '/technician/hardware-status', iconSvg: Icons.Analytics, permission: 'technician.hardware-status.view' },
  { label: 'Diagnostics Tests', path: '/technician/diagnostics', iconSvg: Icons.Tracking, permission: 'technician.diagnostics.manage' },

  { isHeader: true, label: 'Alerts & Account' },
  { label: 'Alerts & Events', path: '/technician/notifications', iconSvg: Icons.Notifications },
  { label: 'Technician Profile', path: '/technician/profile', iconSvg: Icons.Profile },
  { label: 'Account Settings', path: '/technician/settings', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/technician/help', iconSvg: Icons.Help, permission: 'support.view' },
  { label: 'Privacy Policy', path: '/technician/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & SLA', path: '/technician/terms', iconSvg: Icons.Terms },
];

const driverNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Overview Dashboard', path: '/driver/dashboard', iconSvg: Icons.Dashboard, permission: 'drivers.portal.view' },

  { isHeader: true, label: 'Dispatch & Routes' },
  { label: 'My Routes', path: '/driver/routes', iconSvg: Icons.Tracking, permission: 'drivers.portal.view' },
  { label: 'Completed Trips', path: '/driver/trips', iconSvg: Icons.Trips, permission: 'drivers.portal.view' },
  { label: 'Shift Schedules', path: '/driver/schedule', iconSvg: Icons.Trips, permission: 'drivers.portal.view' },
  { label: 'Report Incident', path: '/driver/incident-report', iconSvg: Icons.Emergency, permission: 'drivers.incidents.report' },
  { label: 'Incidents Log', path: '/driver/incidents', iconSvg: Icons.Reports, permission: 'drivers.portal.view' },
  { label: 'Driver Documents', path: '/driver/documents', iconSvg: Icons.Fleets, permission: 'drivers.portal.view' },

  { isHeader: true, label: 'Alerts & Account' },
  { label: 'Operational Alerts', path: '/driver/notifications', iconSvg: Icons.Notifications },
  { label: 'Driver Profile', path: '/driver/profile', iconSvg: Icons.Profile },
  { label: 'Account Settings', path: '/driver/settings', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/driver/help', iconSvg: Icons.Help, permission: 'support.view' },
  { label: 'Privacy Policy', path: '/driver/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & Conditions', path: '/driver/terms', iconSvg: Icons.Terms },
];

const financeNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Overview Dashboard', path: '/finance/dashboard', iconSvg: Icons.Dashboard, permission: 'finance.dashboard.view' },

  { isHeader: true, label: 'Financial Management' },
  { label: 'Tenants', path: '/finance/subscriptions', iconSvg: Icons.Fleets, permission: 'finance.subscriptions.view' },
  { label: 'Invoices & Billing', path: '/finance/invoices', iconSvg: Icons.Reports, permission: 'finance.invoices.view' },
  { label: 'Campaign Payments', path: '/finance/campaign-payments', iconSvg: Icons.Campaigns, permission: 'finance.payments.view' },
  { label: 'Payments Ledger', path: '/finance/payments', iconSvg: Icons.Analytics, permission: 'finance.payments.view' },
  { label: 'Revenue Reports', path: '/finance/reports', iconSvg: Icons.Campaigns, permission: 'finance.reports.view' },
  { label: 'GST & Tax Returns', path: '/finance/gst', iconSvg: Icons.Emergency, permission: 'finance.gst.view' },
  { label: 'Bank Reconciliation', path: '/finance/reconciliation', iconSvg: Icons.Tracking, permission: 'finance.reconciliation.view' },

  { isHeader: true, label: 'Alerts & Settings' },
  { label: 'Financial Alerts', path: '/finance/notifications', iconSvg: Icons.Notifications },
  { label: 'Finance Settings', path: '/finance/settings', iconSvg: Icons.Settings, permission: 'finance.invoices.view' },
  { label: 'Finance Profile', path: '/finance/profile', iconSvg: Icons.Profile },
  { label: 'Help & Documentation', path: '/finance/help', iconSvg: Icons.Help, permission: 'support.view' },
  { label: 'Privacy Policy', path: '/finance/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms & SLAs', path: '/finance/terms', iconSvg: Icons.Terms },
];

const superAdminNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Dashboard', path: '/superadmin/dashboard', iconSvg: Icons.Dashboard },
  { label: 'Campaigns', path: '/superadmin/campaigns', iconSvg: Icons.Campaigns },
  { label: 'Report Incident', path: '/superadmin/incident-report', iconSvg: Icons.Emergency },
  { label: 'Emergency Incidents', path: '/superadmin/incidents', iconSvg: Icons.Reports },

  { isHeader: true, label: 'Tenants & Users' },
  { label: 'Tenants', path: '/superadmin/tenants', iconSvg: Icons.Fleets },
  { label: 'Technicians', path: '/superadmin/technicians', iconSvg: Icons.Drivers },
  { label: 'Advertisers', path: '/superadmin/advertisers', iconSvg: Icons.Campaigns },
  { label: 'Govt Agencies', path: '/superadmin/government', iconSvg: Icons.Emergency },
  { label: 'Finance Officers', path: '/superadmin/finance', iconSvg: Icons.Reports },
  { label: 'Assigned Work Orders', path: '/superadmin/technicians/assign', iconSvg: Icons.Tracking },
  { label: 'Users', path: '/superadmin/users', iconSvg: Icons.Profile },
  { label: 'Roles & Permissions', path: '/superadmin/roles', iconSvg: Icons.Fleets },

  { isHeader: true, label: 'Finance & Subscriptions' },
  { label: 'Subscription Plans', path: '/superadmin/plans', iconSvg: Icons.Ticket },
  { label: 'Transactions', path: '/superadmin/transactions', iconSvg: Icons.Analytics },

  { isHeader: true, label: 'Hardware & Displays' },
  { label: 'Edge Devices', path: '/superadmin/devices', iconSvg: Icons.Gps },

  { isHeader: true, label: 'Advertiser' },
  { label: 'Campaigns Hub', path: '/superadmin/advertiser/campaigns', iconSvg: Icons.Campaigns },
  { label: 'Create New Campaign', path: '/superadmin/advertiser/campaigns/create', iconSvg: Icons.Campaigns },
  { label: 'Analytics & Heatmaps', path: '/superadmin/advertiser/analytics', iconSvg: Icons.Analytics },
  { label: 'Proof-of-Play Reports', path: '/superadmin/advertiser/reports', iconSvg: Icons.Reports },
  { label: 'Billing & Wallet', path: '/superadmin/advertiser/billing', iconSvg: Icons.Fleets },

  { isHeader: true, label: 'Government' },
  { label: 'Public Campaigns', path: '/superadmin/government/campaigns', iconSvg: Icons.Campaigns },
  { label: 'Broadcast Campaign', path: '/superadmin/government/campaigns/create', iconSvg: Icons.Campaigns },
  { label: 'Billing & Invoices', path: '/superadmin/government/billing', iconSvg: Icons.Fleets },
  { label: 'Emergency Approvals', path: '/superadmin/emergency-approvals', iconSvg: Icons.Approvals },
  { label: 'Emergency Broadcast', path: '/superadmin/government/emergency', iconSvg: Icons.Emergency },
  { label: 'Sovereign Tracking', path: '/superadmin/government/tracking', iconSvg: Icons.Tracking },
  { label: 'Transit Analytics', path: '/superadmin/government/analytics', iconSvg: Icons.Analytics },
  { label: 'Compliance Reports', path: '/superadmin/government/reports', iconSvg: Icons.Reports },

  { isHeader: true, label: 'Finance Portal' },
  { label: 'Finance Dashboard', path: '/superadmin/finance/dashboard', iconSvg: Icons.Dashboard },
  { label: 'Tenants', path: '/superadmin/finance/subscriptions', iconSvg: Icons.Ticket },
  { label: 'Invoices & Billing', path: '/superadmin/finance/invoices', iconSvg: Icons.Reports },
  { label: 'Campaign Payments', path: '/superadmin/finance/campaign-payments', iconSvg: Icons.Campaigns },
  { label: 'Payments Hub', path: '/superadmin/finance/payments', iconSvg: Icons.Analytics },
  { label: 'Revenue Reports', path: '/superadmin/finance/reports', iconSvg: Icons.Reports },
  { label: 'GST & Tax Compliance', path: '/superadmin/finance/gst', iconSvg: Icons.Fleets },
  { label: 'Financial Reconciliation', path: '/superadmin/finance/reconciliation', iconSvg: Icons.Tracking },

  { isHeader: true, label: 'Technician Portal' },
  { label: 'Field Work Orders', path: '/superadmin/technician/work-orders', iconSvg: Icons.Reports },
  { label: 'Android Edge Setup', path: '/superadmin/technician/edge-setup', iconSvg: Icons.Terminal },
  { label: 'Edge Devices', path: '/superadmin/technician/devices', iconSvg: Icons.Gps },
  { label: 'Hardware Status', path: '/superadmin/technician/hardware-status', iconSvg: Icons.Analytics },
  { label: 'Diagnostics Tests', path: '/superadmin/technician/diagnostics', iconSvg: Icons.Tracking },

  { isHeader: true, label: 'System & Audit' },
  { label: 'Activity Logs', path: '/superadmin/activity', iconSvg: Icons.Trips },
  { label: 'System Health', path: '/superadmin/system', iconSvg: Icons.Tracking },
  { label: 'Live Server & Cron Monitor', path: '/superadmin/system/live-logs', iconSvg: Icons.Emergency },
  { label: 'Notification Delivery Logs', path: '/superadmin/notifications/logs', iconSvg: Icons.Notifications },
  { label: 'Languages & i18n', path: '/superadmin/languages', iconSvg: Icons.Languages },
  { label: 'Content Manager', path: '/superadmin/content', iconSvg: Icons.Terms },
  { label: 'Support Desk', path: '/superadmin/support', iconSvg: Icons.Notifications },

  { isHeader: true, label: 'Settings & Gateways' },
  { label: 'Profile', path: '/superadmin/profile', iconSvg: Icons.Profile },
  { label: 'Payment Gateways', path: '/superadmin/settings/payment-gateways', iconSvg: Icons.Analytics },
  { label: 'Google Maps & APIs', path: '/superadmin/settings/google-apis', iconSvg: Icons.Tracking },
  { label: 'Test Google APIs', path: '/superadmin/test-google-apis', iconSvg: Icons.Gps },
  { label: 'Master Channels & DND', path: '/superadmin/settings/notifications/channels', iconSvg: Icons.Notifications },
  { label: 'Notification Event Rules', path: '/superadmin/settings/notifications/rules', iconSvg: Icons.Fleets },
  { label: 'Email (SMTP) Gateway', path: '/superadmin/settings/notifications/email', iconSvg: Icons.Reports },
  { label: 'SMS & Twilio Gateway', path: '/superadmin/settings/notifications/sms', iconSvg: Icons.Gps },
  { label: 'Push (Firebase) Gateway', path: '/superadmin/settings/notifications/push', iconSvg: Icons.Emergency },
  { label: 'Security Settings', path: '/superadmin/settings/security', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/superadmin/help', iconSvg: Icons.Help },
  { label: 'Privacy Policy', path: '/superadmin/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms of Service', path: '/superadmin/terms', iconSvg: Icons.Terms },
];

const adminNavLinks = [
  { isHeader: true, label: 'Overview' },
  { label: 'Dashboard', path: '/admin/dashboard', iconSvg: Icons.Dashboard },

  { isHeader: true, label: 'Fleet Operations' },
  { label: 'Bus Depots', path: '/admin/depots', iconSvg: Icons.Depots, permission: 'fleet.depots.view' },
  { label: 'Routes', path: '/admin/routes', iconSvg: Icons.Trips, permission: 'fleet.routes.view' },
  { label: 'Fleet Operator', path: '/admin/fleet-operators', iconSvg: Icons.Fleets, permission: 'fleet.fleets.view' },
  { label: 'Drivers', path: '/admin/drivers', iconSvg: Icons.Drivers, permission: 'fleet.drivers.view' },
  { label: 'Vehicles', path: '/admin/vehicles', iconSvg: Icons.Vehicles, permission: 'fleet.vehicles.view' },
  { label: 'Vehicle Slots', path: '/admin/slots', iconSvg: Icons.Slots, permission: ['fleet.slots.view', 'fleet.vehicles.view'] },
  { label: 'Campaign Mapping', path: '/admin/campaigns/mapping', iconSvg: Icons.Campaigns },
  { label: 'Edge Devices', path: '/admin/edge-devices', iconSvg: Icons.EdgeDevice, permission: ['fleet.devices.read', 'fleet.gps.manage', 'devices.gps.manage'] },
  { label: 'Report Incident', path: '/admin/incident-report', iconSvg: Icons.Emergency, permission: 'fleet.incidents.create' },
  { label: 'Incidents Log', path: '/admin/incidents', iconSvg: Icons.Reports, permission: 'fleet.incidents.view' },
  { label: 'Technician Requests', path: '/admin/technician-requests', iconSvg: Icons.Tracking, permission: 'work_orders.view' },

  { isHeader: true, label: 'Organization & Access' },
  { label: 'Team & Users', path: '/admin/users', iconSvg: Icons.Profile, permission: 'users.view' },
  { label: 'Activity Logs', path: '/admin/activity', iconSvg: Icons.Trips, permission: 'activity.view' },
  { label: 'Alerts & Messages', path: '/admin/notifications', iconSvg: Icons.Notifications },

  { isHeader: true, label: 'Finance & Billing' },
  { label: 'SaaS Subscription & Quotas', path: '/admin/billing', iconSvg: Icons.Reports, permission: 'billing.view' },

  { isHeader: true, label: 'Settings & Legal' },
  { label: 'Profile', path: '/admin/profile', iconSvg: Icons.Profile },
  { label: 'Settings', path: '/admin/settings', iconSvg: Icons.Terms },
  { label: 'Help & Documentation', path: '/admin/help', iconSvg: Icons.Help },
  { label: 'Privacy Policy', path: '/admin/privacy', iconSvg: Icons.Privacy },
  { label: 'Terms of Service', path: '/admin/terms', iconSvg: Icons.Terms },
];

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginEmail />} />
        <Route path="/login-phone" element={<LoginPhone />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/auth/zoho/callback" element={<ZohoCallback />} />
        <Route path="/auth/apple/callback" element={<AppleCallback />} />
      </Route>

      {/* Public Policy & Terms Routes */}
      <Route
        path="/terms"
        element={
          <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <RolePolicyPage
                type="terms"
                roleCode="GLOBAL"
                titleFallback="Platform Terms of Service"
                subtitleFallback="Master service level agreements, acceptable usage policies, and sovereign platform compliance standards"
              />
            </div>
          </div>
        }
      />
      <Route
        path="/privacy"
        element={
          <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <RolePolicyPage
                type="privacy"
                roleCode="GLOBAL"
                titleFallback="Global Privacy Policy"
                subtitleFallback="Data protection standards, telematics encryption, and statutory user rights across the VMOVEXA network"
              />
            </div>
          </div>
        }
      />

      {/* Public QR scan landing + customer review (no auth) */}
      <Route path="/qr/:code" element={<QrScanLandingPage />} />
      <Route path="/scan/:code" element={<QrScanLandingPage />} />

      {/* Public Customer Payment Clearance Checkout (Secured by token) */}
      <Route path="/pay/campaign/:id" element={<CampaignPublicPayPage />} />
      <Route path="/campaigns/:id/pay" element={<CampaignPublicPayPage />} />
      <Route path="/advertiser/campaigns/:id/pay" element={<CampaignPublicPayPage />} />

      {/* Fleet Operator Routes (Full Comprehensive Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.FLEET_OPERATOR, ROLE.TENANT_ADMIN]} />}>
          <Route path="/fleet-operator" element={<RoleLayout roleTitle="Fleet Operator" navLinks={fleetManagerNavLinks} />}>
            <Route index element={<Navigate to="/fleet-operator/dashboard" replace />} />

            {/* Dashboard */}
            <Route element={<PermissionRoute permission="fleet.dashboard.view" />}>
              <Route path="dashboard" element={<FleetManagerDashboard />} />
            </Route>

            {/* Fleets redirect to vehicles */}
            <Route path="fleets" element={<Navigate to="/fleet-operator/vehicles" replace />} />
            <Route path="fleets/*" element={<Navigate to="/fleet-operator/vehicles" replace />} />

            {/* Vehicles */}
            <Route element={<PermissionRoute permission="fleet.vehicles.view" />}>
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="vehicles/:id" element={<AdminVehicleDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.vehicles.create" />}>
              <Route path="vehicles/add" element={<AdminAddVehiclePage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.vehicles.update" />}>
              <Route path="vehicles/edit/:id" element={<AdminAddVehiclePage />} />
              <Route path="vehicles/:id/edit" element={<AdminAddVehiclePage />} />
              <Route path="vehicles/:id/setup-complete" element={<SetupCompletePage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.drivers.assign" />}>
              <Route path="vehicles/:id/assign-driver" element={<AssignDriverPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.devices.assign" />}>
              <Route path="vehicles/:id/assign-edge" element={<FleetAssignGpsPage />} />
              <Route path="vehicles/:id/assign-gps" element={<FleetAssignGpsPage />} />
            </Route>

            {/* Drivers */}
            <Route element={<PermissionRoute permission="fleet.drivers.view" />}>
              <Route path="drivers" element={<AdminDriversPage />} />
              <Route path="drivers/:id" element={<AdminDriverDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.drivers.create" />}>
              <Route path="drivers/add" element={<AdminAddDriverPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.drivers.update" />}>
              <Route path="drivers/edit/:id" element={<AdminAddDriverPage />} />
            </Route>

            {/* Depots redirect to dashboard for Fleet Operator */}
            <Route path="depots" element={<Navigate to="/fleet-operator/dashboard" replace />} />
            <Route path="depots/*" element={<Navigate to="/fleet-operator/dashboard" replace />} />

            {/* Routes */}
            <Route element={<PermissionRoute permission="fleet.routes.view" />}>
              <Route path="routes" element={<RoutesListPage />} />
              <Route path="routes/:id" element={<RouteDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.routes.create" />}>
              <Route path="routes/add" element={<AddRoutePage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.routes.update" />}>
              <Route path="routes/edit/:id" element={<AddRoutePage />} />
            </Route>

            {/* Vehicle Slots & Timetable */}
            <Route element={<PermissionRoute permission={['fleet.slots.view', 'fleet.vehicles.view']} />}>
              <Route path="slots" element={<VehicleSlotsPage />} />
              <Route path="slots/:id" element={<VehicleSlotDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission={['fleet.slots.create', 'fleet.vehicles.create', 'fleet.routes.assign']} />}>
              <Route path="slots/schedule" element={<ScheduleSlotPage />} />
              <Route path="slots/add" element={<ScheduleSlotPage />} />
            </Route>
            <Route element={<PermissionRoute permission={['fleet.slots.update', 'fleet.vehicles.update', 'fleet.routes.assign']} />}>
              <Route path="slots/edit/:id" element={<ScheduleSlotPage />} />
            </Route>

            {/* Edge Devices & Connected Telematics */}
            <Route element={<PermissionRoute permission="fleet.devices.read" />}>
              <Route path="edge-devices" element={<AdminGpsDevicesPage />} />
              <Route path="edge-devices/:id" element={<AdminGpsDeviceDetailsPage />} />
              <Route path="gps" element={<Navigate to="/fleet-operator/edge-devices" replace />} />
              <Route path="gps/:id" element={<Navigate to="/fleet-operator/edge-devices" replace />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.devices.create" />}>
              <Route path="edge-devices/add" element={<AdminAddGpsPage />} />
              <Route path="gps/add" element={<Navigate to="/fleet-operator/edge-devices/add" replace />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.devices.update" />}>
              <Route path="edge-devices/edit/:id" element={<AdminAddGpsPage />} />
              <Route path="gps/edit/:id" element={<Navigate to="/fleet-operator/edge-devices" replace />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.devices.assign" />}>
              <Route path="edge-devices/:id/assign" element={<AdminAssignGpsPage />} />
              <Route path="gps/:id/assign" element={<Navigate to="/fleet-operator/edge-devices" replace />} />
            </Route>

            {/* Live Telematics */}
            <Route element={<PermissionRoute permission="fleet.tracking.view" />}>
              <Route path="tracking" element={<LiveTrackingPage />} />
            </Route>

            {/* Trips */}
            <Route element={<PermissionRoute permission="fleet.trips.view" />}>
              <Route path="trips" element={<TripsPage />} />
              <Route path="trips/:id" element={<TripDetailsPage />} />
            </Route>

            {/* Emergency Incidents */}
            <Route element={<PermissionRoute permission="fleet.incidents.view" />}>
              <Route path="incidents" element={<FleetIncidentsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="fleet.incidents.create" />}>
              <Route path="incident-report" element={<FleetReportIncidentPage />} />
              <Route path="incident-report/success" element={<FleetIncidentSuccessPage />} />
            </Route>

            {/* Technician Requests / Maintenance Work Orders */}
            <Route element={<PermissionRoute permission="work_orders.view" />}>
              <Route path="technician-requests" element={<TechRequestsPage />} />
              <Route path="technician-requests/:id" element={<AdminTechRequestDetailsPage />} />
              <Route path="technician-requests/:id/rate" element={<RateTechnicianPage />} />
            </Route>
            <Route element={<PermissionRoute permission="work_orders.create" />}>
              <Route path="technician-requests/new" element={<NewTechRequestPage />} />
            </Route>
            <Route element={<PermissionRoute permission="work_orders.update" />}>
              <Route path="technician-requests/edit/:id" element={<NewTechRequestPage />} />
            </Route>

            {/* Activity Logs */}
            <Route element={<PermissionRoute permission="activity.view" />}>
              <Route path="activity" element={<AdminUserActivityPage />} />
            </Route>

            {/* Reports & Analytics */}
            <Route element={<PermissionRoute permission="fleet.reports.view" />}>
              <Route path="reports" element={<ReportsAnalyticsPage />} />
            </Route>

            {/* Standard Profile & Help Pages */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="profile/account" element={<AccountSettingsPage />} />
            <Route path="profile/security" element={<ChangePasswordPage />} />
            <Route path="profile/security/success" element={<PasswordUpdatedPage />} />
            <Route path="profile/notifications" element={<NotificationSettingsPage />} />
            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<HelpSupportPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<SupportHistoryPage />} />
            </Route>
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>

          {/* Legacy /fleet-manager/* route compatibility redirect */}
          <Route path="/fleet-manager" element={<Navigate to="/fleet-operator/dashboard" replace />} />
          <Route path="/fleet-manager/*" element={<FleetManagerLegacyRedirect />} />
        </Route>
      </Route>

      {/* Advertiser Routes (Full Enterprise Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.ADVERTISER, ROLE.TENANT_ADMIN, ROLE.SUPER_ADMIN]} />}>
          <Route path="/advertiser" element={<RoleLayout roleTitle="Advertiser" navLinks={advertiserNavLinks} />}>
            <Route index element={<Navigate to="/advertiser/dashboard" replace />} />

            <Route element={<PermissionRoute permission="advertiser.dashboard.view" />}>
              <Route path="dashboard" element={<AdvertiserDashboardPage />} />
            </Route>

            <Route element={<PermissionRoute permission="campaigns.view" />}>
              <Route path="campaigns" element={<CampaignsListPage />} />
              <Route path="campaigns/flow" element={<CampaignLifecyclePage />} />
              <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
              <Route path="campaigns/:id/record-payment" element={<RecordOfflinePaymentPage />} />
            </Route>

            <Route element={<PermissionRoute permission="campaigns.create" />}>
              <Route path="campaigns/create" element={<CreateCampaignPage />} />
              <Route path="campaigns/create/success" element={<CampaignSuccessPage />} />
            </Route>

            <Route element={<PermissionRoute permission="campaigns.analytics.view" />}>
              <Route path="campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
              <Route path="analytics" element={<CampaignAnalyticsPage />} />
            </Route>

            <Route element={<PermissionRoute permission="reports.view" />}>
              <Route path="reports" element={<ReportsHubPage />} />
            </Route>

            <Route element={<PermissionRoute permission="billing.invoices.view" />}>
              <Route path="billing" element={<BillingPaymentsPage />} />
            </Route>

            <Route path="notifications" element={<AdvertiserNotificationsPage />} />
            <Route path="profile" element={<AdvertiserProfilePage />} />
            <Route path="profile/account" element={<AdvertiserSettingsPage />} />
            <Route path="profile/security" element={<AdvertiserChangePasswordPage />} />
            <Route path="profile/security/success" element={<AdvertiserPasswordUpdatedPage />} />
            <Route path="profile/notifications" element={<AdvertiserNotificationSettingsPage />} />
            <Route path="settings" element={<AdvertiserSettingsPage />} />
            <Route path="settings/security" element={<AdvertiserChangePasswordPage />} />
            <Route path="settings/security/success" element={<AdvertiserPasswordUpdatedPage />} />
            <Route path="settings/notifications" element={<AdvertiserNotificationSettingsPage />} />
            <Route path="notification-settings" element={<AdvertiserNotificationSettingsPage />} />

            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<AdvertiserHelpPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<AdvertiserSupportHistoryPage />} />
              <Route path="support-history" element={<AdvertiserSupportHistoryPage />} />
            </Route>

            <Route path="privacy" element={<AdvertiserPrivacyPolicyPage />} />
            <Route path="terms" element={<AdvertiserTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Government Routes (Full Comprehensive Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.GOVT_AGENCY, ROLE.TENANT_ADMIN, ROLE.SUPER_ADMIN]} />}>
          <Route path="/government" element={<RoleLayout roleTitle="Government Agency" navLinks={governmentNavLinks} />}>
            <Route index element={<Navigate to="/government/dashboard" replace />} />

            <Route element={<PermissionRoute permission="government.dashboard.view" />}>
              <Route path="dashboard" element={<GovernmentDashboardPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.campaigns.view" />}>
              <Route path="campaigns" element={<GovCampaignsListPage />} />
              <Route path="campaigns/:id" element={<GovCampaignDetailsPage />} />
              <Route path="campaigns/:id/record-payment" element={<GovRecordOfflinePaymentPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.campaigns.create" />}>
              <Route path="campaigns/create" element={<GovCreateCampaignPage />} />
              <Route path="campaigns/create/success" element={<CampaignSuccessPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.emergency.manage" />}>
              <Route path="emergency" element={<GovEmergencyListPage />} />
              <Route path="emergency/new" element={<GovEmergencyBroadcastPage />} />
              <Route path="emergency/create" element={<GovEmergencyBroadcastPage />} />
              <Route path="emergency/:id" element={<GovEmergencyDetailsPage />} />
              <Route path="emergency/:id/edit" element={<GovEditEmergencyBroadcastPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.analytics.view" />}>
              <Route path="analytics" element={<GovAnalyticsDashboardPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.tracking.view" />}>
              <Route path="tracking" element={<GovLiveTrackingPage />} />
            </Route>

            <Route element={<PermissionRoute permission="government.reports.view" />}>
              <Route path="reports" element={<GovReportsPage />} />
            </Route>

            <Route path="billing" element={<GovBillingPaymentsPage />} />
            <Route path="notifications" element={<GovNotificationsPage />} />
            <Route path="profile" element={<GovProfilePage />} />
            <Route path="profile/account" element={<GovAccountSettingsPage />} />
            <Route path="profile/security" element={<GovChangePasswordPage />} />
            <Route path="profile/security/success" element={<GovPasswordUpdatedPage />} />
            <Route path="profile/notifications" element={<GovNotificationSettingsPage />} />
            <Route path="settings" element={<GovAccountSettingsPage />} />
            <Route path="settings/security" element={<GovChangePasswordPage />} />
            <Route path="settings/security/success" element={<GovPasswordUpdatedPage />} />
            <Route path="settings/notifications" element={<GovNotificationSettingsPage />} />

            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<GovHelpSupportPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<GovSupportHistoryPage />} />
            </Route>

            <Route path="privacy" element={<GovPrivacyPolicyPage />} />
            <Route path="terms" element={<GovTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Technician Routes (Full Engineering Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.CENTRAL_TECH, ROLE.TENANT_ADMIN, ROLE.SUPER_ADMIN]} />}>
          <Route path="/technician" element={<RoleLayout roleTitle="Technician" navLinks={technicianNavLinks} />}>
            <Route index element={<Navigate to="/technician/dashboard" replace />} />

            <Route element={<PermissionRoute permission="technician.dashboard.view" />}>
              <Route path="dashboard" element={<TechnicianDashboard />} />
            </Route>

            <Route element={<PermissionRoute permission="work_orders.view" />}>
              <Route path="work-orders" element={<TechWorkOrdersPage />} />
              <Route path="work-orders/:id" element={<TechWorkOrderDetailPage />} />
            </Route>

            <Route element={<PermissionRoute permission="technician.devices.view" />}>
              <Route path="edge-setup" element={<TechEdgeSetupPage />} />
              <Route path="devices/setup" element={<TechEdgeSetupPage />} />
              <Route path="devices" element={<EdgeDevicesPage />} />
              <Route path="devices/:id" element={<EdgeDeviceDetailsPage />} />
              <Route path="devices/:id/edit" element={<RegisterEdgeDevicePage />} />
            </Route>

            <Route element={<PermissionRoute permission="technician.hardware-config.manage" />}>
              <Route path="hardware-config" element={<TechHardwareConfigPage />} />
              <Route path="devices/:id/config" element={<TechHardwareConfigPage />} />
              <Route path="devices/:id/config/saved" element={<TechConfigSavedPage />} />
            </Route>

            <Route element={<PermissionRoute permission={['technician.gps.manage', 'devices.gps.manage']} />}>
              <Route path="gps" element={<TechGpsInstallPage />} />
              <Route path="gps/success" element={<TechGpsInstalledPage />} />
              <Route path="devices/:id/gps" element={<TechGpsInstallPage />} />
            </Route>

            <Route element={<PermissionRoute permission={['devices.register', 'technician.devices.view']} />}>
              <Route path="devices/register" element={<RegisterEdgeDevicePage />} />
              <Route path="devices/new" element={<RegisterEdgeDevicePage />} />
              <Route path="devices/add" element={<RegisterEdgeDevicePage />} />
              <Route path="register-device" element={<RegisterEdgeDevicePage />} />
              <Route path="devices/register/success" element={<Navigate to="/technician/devices" replace />} />
            </Route>

            <Route element={<PermissionRoute permission="technician.hardware-status.view" />}>
              <Route path="hardware-status" element={<TechHardwareStatusPage />} />
              <Route path="devices/:id/status" element={<TechHardwareStatusPage />} />
            </Route>

            <Route element={<PermissionRoute permission={['technician.diagnostics.manage', 'devices.diagnose']} />}>
              <Route path="diagnostics" element={<TechDiagnosticsPage />} />
              <Route path="connectivity" element={<TechConnectivityPage />} />
            </Route>

            <Route path="notifications" element={<TechNotificationsPage />} />
            <Route path="profile" element={<TechProfilePage />} />
            <Route path="profile/account" element={<TechAccountSettingsPage />} />
            <Route path="profile/security" element={<TechChangePasswordPage />} />
            <Route path="profile/security/success" element={<TechPasswordUpdatedPage />} />
            <Route path="profile/notifications" element={<TechNotificationSettingsPage />} />
            <Route path="settings" element={<TechAccountSettingsPage />} />
            <Route path="settings/security" element={<TechChangePasswordPage />} />
            <Route path="settings/security/success" element={<TechPasswordUpdatedPage />} />
            <Route path="settings/notifications" element={<TechNotificationSettingsPage />} />

            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<TechHelpSupportPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<TechSupportHistoryPage />} />
            </Route>

            <Route path="privacy" element={<TechPrivacyPolicyPage />} />
            <Route path="terms" element={<TechTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Driver Routes (Full Operating Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.DRIVER]} />}>
          <Route path="/driver" element={<RoleLayout roleTitle="Driver" navLinks={driverNavLinks} />}>
            <Route index element={<Navigate to="/driver/dashboard" replace />} />
            <Route element={<PermissionRoute permission="drivers.portal.view" />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="documents" element={<DriverDocumentsPage />} />
              <Route element={<VerifiedDriverRoute />}>
                <Route path="routes" element={<DriverRoutesPage />} />
                <Route path="trips" element={<DriverTripsPage />} />
                <Route path="schedule" element={<DriverSchedulePage />} />
                <Route path="incidents" element={<DriverIncidentsListPage />} />
                <Route path="incidents/:id" element={<DriverIncidentDetailsPage />} />
              </Route>
            </Route>
            <Route element={<PermissionRoute permission="drivers.incidents.report" />}>
              <Route element={<VerifiedDriverRoute />}>
                <Route path="report" element={<Navigate to="/driver/incident-report" replace />} />
                <Route path="incident-report" element={<DriverReportIncidentPage />} />
                <Route path="report/success" element={<Navigate to="/driver/incident-report/success" replace />} />
                <Route path="incident-report/success" element={<DriverIncidentSuccessPage />} />
              </Route>
            </Route>
            <Route element={<PermissionRoute permission="drivers.documents.manage" />}>
              <Route path="documents/upload" element={<DriverUploadDocumentPage />} />
              <Route path="documents/upload/success" element={<DriverDocumentSubmittedPage />} />
              <Route path="documents/success" element={<DriverDocumentSubmittedPage />} />
            </Route>
            <Route path="notifications" element={<DriverNotificationsPage />} />
            <Route path="profile" element={<DriverProfilePage />} />
            <Route path="settings" element={<DriverAccountSettingsPage />} />
            <Route path="settings/security" element={<DriverChangePasswordPage />} />
            <Route path="settings/security/success" element={<DriverPasswordUpdatedPage />} />
            <Route path="settings/notifications" element={<DriverNotificationSettingsPage />} />
            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<DriverHelpSupportPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<DriverSupportHistoryPage />} />
            </Route>
            <Route path="privacy" element={<DriverPrivacyPolicyPage />} />
            <Route path="terms" element={<DriverTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Finance Routes (Full Enterprise Financial Portal) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.FINANCE_OFFICER, ROLE.TENANT_ADMIN, ROLE.SUPER_ADMIN]} />}>
          <Route path="/finance" element={<RoleLayout roleTitle="Finance Officer" navLinks={financeNavLinks} />}>
            <Route index element={<Navigate to="/finance/dashboard" replace />} />

            <Route element={<PermissionRoute permission="finance.dashboard.view" />}>
              <Route path="dashboard" element={<FinanceDashboardPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.subscriptions.view" />}>
              <Route path="subscriptions" element={<TenantsListPage />} />
              <Route path="subscriptions/:id" element={<TenantDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission={['finance.subscriptions.create', 'finance.subscriptions.manage']} />}>
              <Route path="subscriptions/onboard" element={<OnboardTenantPage />} />
            </Route>
            <Route element={<PermissionRoute permission={['finance.subscriptions.update', 'finance.subscriptions.manage']} />}>
              <Route path="subscriptions/:id/edit" element={<EditTenantPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.invoices.view" />}>
              <Route path="invoices" element={<InvoicesListPage />} />
              <Route path="invoices/:id" element={<InvoicePreviewPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.invoices.create" />}>
              <Route path="invoices/generate" element={<GenerateInvoicePage />} />
              <Route path="invoices/design" element={<InvoiceDesignerPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.payments.view" />}>
              <Route path="payments" element={<PaymentsListPage />} />
              <Route path="payments/:id" element={<PaymentDetailsPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.payments.view" />}>
              <Route path="campaign-payments" element={<FinanceCampaignPaymentsPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.reports.view" />}>
              <Route path="reports" element={<RevenueReportingPage />} />
              <Route path="reports/:id" element={<ReportDetailsPage />} />
              <Route path="reports/success" element={<ReportGeneratedSuccessPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.gst.view" />}>
              <Route path="gst" element={<GstManagementPage />} />
            </Route>

            <Route element={<PermissionRoute permission="finance.reconciliation.view" />}>
              <Route path="reconciliation" element={<FinancialReconciliationPage />} />
              <Route path="reconciliation/success" element={<ReconciliationCompletePage />} />
            </Route>
            <Route element={<PermissionRoute permission={['finance.reconciliation.manage', 'finance.reconciliation.create', 'finance.reconciliation.update']} />}>
              <Route path="reconciliation/start" element={<StartReconciliationPage />} />
            </Route>

            <Route path="notifications" element={<FinanceNotificationsPage />} />
            <Route path="profile" element={<FinanceProfilePage />} />
            <Route path="profile/account" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="profile/edit" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="profile/security" element={<FinanceChangePasswordPage />} />
            <Route path="profile/security/success" element={<FinancePasswordUpdatedPage />} />
            <Route path="profile/notifications" element={<FinanceNotificationSettingsPage />} />
            <Route element={<PermissionRoute permission="finance.invoices.view" />}>
              <Route path="settings" element={<FinanceAccountSettingsPage />} />
            </Route>
            <Route path="settings/profile" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="settings/security" element={<FinanceChangePasswordPage />} />
            <Route path="settings/security/success" element={<FinancePasswordUpdatedPage />} />
            <Route path="settings/notifications" element={<FinanceNotificationSettingsPage />} />

            <Route element={<PermissionRoute permission="support.view" />}>
              <Route path="help" element={<FinanceHelpSupportPage />} />
              <Route path="help/new" element={<CreateSupportTicketPage />} />
              <Route path="help/history" element={<FinanceSupportHistoryPage />} />
            </Route>

            <Route path="privacy" element={<FinancePrivacyPolicyPage />} />
            <Route path="terms" element={<FinanceTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Super Admin Routes (Master SaaS Platform Management) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.SUPER_ADMIN]} />}>
          <Route path="/superadmin" element={<RoleLayout roleTitle="Super Admin" navLinks={superAdminNavLinks} />}>
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route element={<PermissionRoute permission="campaigns.approve" />}>
              <Route path="emergency-approvals" element={<SuperEmergencyApprovalsPage />} />
              <Route path="emergency-approvals/:id" element={<SuperEmergencyDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="orgs.view" />}>
              <Route path="tenants" element={<TenantsListPage />} />
              <Route path="tenants/:id" element={<TenantDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="orgs.create" />}>
              <Route path="tenants/onboard" element={<OnboardTenantPage />} />
            </Route>
            <Route element={<PermissionRoute permission="orgs.update" />}>
              <Route path="tenants/:id/edit" element={<EditTenantPage />} />
            </Route>
            <Route path="technicians" element={<CentralTechniciansPage />} />
            <Route path="technicians/new" element={<RegisterTechnicianPage />} />
            <Route path="technicians/:id" element={<TechnicianDetailsPage />} />
            <Route path="technicians/:id/edit" element={<RegisterTechnicianPage />} />
            <Route path="technicians/assign" element={<AssignedWorkOrdersPage />} />
            <Route path="technicians/assign/new" element={<AssignTechnicianPage />} />
            <Route path="technicians/assign/:id/assign" element={<AssignTechnicianPage />} />
            <Route path="technicians/assign/:id" element={<SuperWorkOrderDetailPage />} />
            <Route path="advertisers" element={<SuperAdvertisersPage />} />
            <Route path="advertisers/new" element={<OnboardAdvertiserPage />} />
            <Route path="advertisers/:id" element={<AdvertiserDetailsPage />} />
            <Route path="advertisers/:id/edit" element={<OnboardAdvertiserPage />} />
            <Route path="government" element={<SuperGovernmentPage />} />
            <Route path="government/new" element={<AuthorizeGovernmentPage />} />
            <Route path="government/:id" element={<GovernmentDetailsPage />} />
            <Route path="government/:id/edit" element={<AuthorizeGovernmentPage />} />
            <Route path="finance" element={<SuperFinanceOfficersPage />} />
            <Route path="finance/new" element={<RegisterFinanceOfficerPage />} />
            <Route path="finance/:id" element={<FinanceOfficerDetailsPage />} />
            <Route path="finance/:id/edit" element={<RegisterFinanceOfficerPage />} />
            <Route path="campaigns" element={<SuperCampaignsPage />} />
            <Route path="campaigns/:id" element={<SuperCampaignDetailsPage />} />
            <Route path="campaigns/mapping" element={<AdminCampaignMappingPage />} />
            <Route element={<PermissionRoute permission="platform.broadcast" />}>
              <Route path="campaigns/emergency" element={<EmergencyBroadcastPage />} />
            </Route>
            <Route path="devices" element={<EdgeDevicesPage />} />
            <Route path="devices/new" element={<RegisterEdgeDevicePage />} />
            <Route path="devices/add" element={<RegisterEdgeDevicePage />} />
            <Route path="devices/:id" element={<EdgeDeviceDetailsPage />} />
            <Route path="devices/:id/edit" element={<RegisterEdgeDevicePage />} />
            <Route path="displays" element={<DisplayMatrixPage />} />
            <Route element={<PermissionRoute permission="billing.plans.view" />}>
              <Route path="plans" element={<SuperSubscriptionPlansPage />} />
            </Route>
            <Route element={<PermissionRoute permission="billing.plans.manage" />}>
              <Route path="plans/add" element={<SuperSubscriptionPlansPage isAddMode={true} />} />
              <Route path="plans/:id/edit" element={<SuperSubscriptionPlansPage isEditMode={true} />} />
              <Route path="plans/edit/:id" element={<SuperSubscriptionPlansPage isEditMode={true} />} />
            </Route>
            <Route element={<PermissionRoute permission="billing.transactions.view" />}>
              <Route path="transactions" element={<SuperTransactionsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="billing.subscriptions.view" />}>
              <Route path="billing" element={<SuperBillingPage />} />
            </Route>

            {/* Advertiser Section inside SuperAdmin */}
            <Route path="advertiser/campaigns" element={<CampaignsListPage />} />
            <Route path="advertiser/campaigns/create" element={<CreateCampaignPage />} />
            <Route path="advertiser/campaigns/create/success" element={<CampaignSuccessPage />} />
            <Route path="advertiser/campaigns/flow" element={<CampaignLifecyclePage />} />
            <Route path="advertiser/campaigns/:id" element={<CampaignDetailsPage />} />
            <Route path="advertiser/campaigns/:id/record-payment" element={<RecordOfflinePaymentPage />} />
            <Route path="advertiser/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
            <Route path="advertiser/analytics" element={<CampaignAnalyticsPage />} />
            <Route path="advertiser/reports" element={<ReportsHubPage />} />
            <Route path="advertiser/billing" element={<BillingPaymentsPage />} />

            {/* Government Section inside SuperAdmin */}
            <Route path="government/dashboard" element={<GovernmentDashboardPage />} />
            <Route path="government/campaigns" element={<GovCampaignsListPage />} />
            <Route path="government/campaigns/create" element={<GovCreateCampaignPage />} />
            <Route path="government/campaigns/create/success" element={<CampaignSuccessPage />} />
            <Route path="government/campaigns/:id" element={<GovCampaignDetailsPage />} />
            <Route path="government/campaigns/:id/record-payment" element={<GovRecordOfflinePaymentPage />} />
            <Route path="government/emergency" element={<GovEmergencyListPage />} />
            <Route path="government/emergency/new" element={<GovEmergencyBroadcastPage />} />
            <Route path="government/emergency/create" element={<GovEmergencyBroadcastPage />} />
            <Route path="government/emergency/:id" element={<GovEmergencyDetailsPage />} />
            <Route path="government/emergency/:id/edit" element={<GovEditEmergencyBroadcastPage />} />
            <Route path="government/analytics" element={<GovAnalyticsDashboardPage />} />
            <Route path="government/tracking" element={<GovLiveTrackingPage />} />
            <Route path="government/reports" element={<GovReportsPage />} />
            <Route path="government/billing" element={<GovBillingPaymentsPage />} />
            <Route path="government/notifications" element={<GovNotificationsPage />} />

            {/* Finance Portal Section inside SuperAdmin */}
            <Route path="finance/dashboard" element={<FinanceDashboardPage />} />
            <Route path="finance/subscriptions" element={<TenantsListPage />} />
            <Route path="finance/subscriptions/onboard" element={<OnboardTenantPage />} />
            <Route path="finance/subscriptions/:id" element={<TenantDetailsPage />} />
            <Route path="finance/subscriptions/:id/edit" element={<EditTenantPage />} />
            <Route path="finance/invoices" element={<InvoicesListPage />} />
            <Route path="finance/invoices/generate" element={<GenerateInvoicePage />} />
            <Route path="finance/invoices/design" element={<InvoiceDesignerPage />} />
            <Route path="finance/invoices/:id" element={<InvoicePreviewPage />} />
            <Route path="finance/payments" element={<PaymentsListPage />} />
            <Route path="finance/payments/:id" element={<PaymentDetailsPage />} />
            <Route path="finance/campaign-payments" element={<FinanceCampaignPaymentsPage />} />
            <Route path="finance/reports" element={<RevenueReportingPage />} />
            <Route path="finance/reports/:id" element={<ReportDetailsPage />} />
            <Route path="finance/reports/success" element={<ReportGeneratedSuccessPage />} />
            <Route path="finance/gst" element={<GstManagementPage />} />
            <Route path="finance/reconciliation" element={<FinancialReconciliationPage />} />
            <Route path="finance/reconciliation/start" element={<StartReconciliationPage />} />
            <Route path="finance/reconciliation/success" element={<ReconciliationCompletePage />} />
            <Route path="finance/profile" element={<FinanceProfilePage />} />
            <Route path="finance/profile/account" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="finance/profile/edit" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="finance/settings" element={<FinanceAccountSettingsPage />} />
            <Route path="finance/settings/profile" element={<FinanceOfficerAccountSettingsPage />} />
            <Route path="finance/settings/security" element={<FinanceChangePasswordPage />} />
            <Route path="finance/settings/security/success" element={<FinancePasswordUpdatedPage />} />
            <Route path="finance/settings/notifications" element={<FinanceNotificationSettingsPage />} />

            {/* Technician Portal Section inside SuperAdmin */}
            <Route path="technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="technician/work-orders" element={<TechWorkOrdersPage />} />
            <Route path="technician/work-orders/:id" element={<TechWorkOrderDetailPage />} />
            <Route path="technician/edge-setup" element={<TechEdgeSetupPage />} />
            <Route path="technician/devices" element={<EdgeDevicesPage />} />
            <Route path="technician/devices/register" element={<RegisterEdgeDevicePage />} />
            <Route path="technician/devices/new" element={<RegisterEdgeDevicePage />} />
            <Route path="technician/devices/add" element={<RegisterEdgeDevicePage />} />
            <Route path="technician/devices/:id" element={<EdgeDeviceDetailsPage />} />
            <Route path="technician/devices/:id/edit" element={<RegisterEdgeDevicePage />} />
            <Route path="technician/devices/:id/config" element={<TechHardwareConfigPage />} />
            <Route path="technician/devices/:id/config/success" element={<TechConfigSavedPage />} />
            <Route path="technician/devices/:id/gps" element={<TechGpsInstallPage />} />
            <Route path="technician/devices/:id/status" element={<TechHardwareStatusPage />} />
            <Route path="technician/hardware-config" element={<Navigate to="/superadmin/technician/devices" replace />} />
            <Route path="technician/hardware-config/*" element={<Navigate to="/superadmin/technician/devices" replace />} />
            <Route path="technician/gps" element={<Navigate to="/superadmin/technician/devices" replace />} />
            <Route path="technician/hardware-status" element={<TechHardwareStatusPage />} />
            <Route path="technician/diagnostics" element={<TechDiagnosticsPage />} />
            <Route path="technician/connectivity" element={<Navigate to="/superadmin/technician/hardware-status" replace />} />
            <Route path="technician/notifications" element={<TechNotificationsPage />} />

            {/* Direct convenience routes for SuperAdmin */}
            <Route path="work-orders" element={<Navigate to="/superadmin/technician/work-orders" replace />} />
            <Route path="work-orders/:id" element={<Navigate to="/superadmin/technician/work-orders" replace />} />
            <Route path="hardware-config" element={<Navigate to="/superadmin/technician/devices" replace />} />
            <Route path="gps" element={<Navigate to="/superadmin/technician/devices" replace />} />
            <Route path="hardware-status" element={<Navigate to="/superadmin/technician/hardware-status" replace />} />
            <Route path="diagnostics" element={<Navigate to="/superadmin/technician/diagnostics" replace />} />
            <Route path="connectivity" element={<Navigate to="/superadmin/technician/hardware-status" replace />} />

            <Route path="users" element={<GlobalUsersPage />} />
            <Route path="users/:id/permissions" element={<SuperUserPermissionsPage />} />
            <Route element={<PermissionRoute permission="rbac.roles.view" />}>
              <Route path="roles" element={<SuperRolesPermissionsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="platform.audit" />}>
              <Route path="activity" element={<SuperUserActivityPage />} />
              <Route path="system/live-logs" element={<LiveServerLogsPage />} />
              <Route path="notifications/logs" element={<NotificationDeliveryLogsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="platform.mqtt" />}>
              <Route path="system" element={<MqttSystemLogsPage />} />
            </Route>
            <Route element={<PermissionRoute permission="platform.content" />}>
              <Route path="languages" element={<SuperLanguagesPage />} />
              <Route path="content" element={<SuperContentManagerPage />} />
            </Route>
            <Route path="faqs" element={<Navigate to="/superadmin/content" replace />} />
            <Route path="support" element={<SuperSupportDeskPage />} />
            <Route path="incidents" element={<SuperIncidentsPage />} />
            <Route path="incident-report" element={<SuperReportIncidentPage />} />
            <Route path="incident-report/success" element={<SuperIncidentSuccessPage />} />
            <Route path="profile" element={<SuperProfilePage />} />
            <Route element={<PermissionRoute permission="platform.settings" />}>
              <Route path="settings" element={<SuperAccountSettingsPage />} />
              <Route path="settings/payment-gateways" element={<SuperPaymentGatewaysPage />} />
              <Route path="payment-gateways" element={<Navigate to="/superadmin/settings/payment-gateways" replace />} />
              <Route path="settings/notifications/rules" element={<SuperNotificationRulesPage />} />
            </Route>
            <Route path="settings/security" element={<SuperChangePasswordPage />} />
            <Route path="settings/security/success" element={<SuperPasswordUpdatedPage />} />
            <Route element={<PermissionRoute permission="platform.keys" />}>
              <Route path="settings/google-apis" element={<SuperGoogleApisPage />} />
              <Route path="google-apis" element={<Navigate to="/superadmin/settings/google-apis" replace />} />
              <Route path="test-google-apis" element={<SuperGoogleApisPlaygroundPage />} />
              <Route path="settings/google-apis/test" element={<Navigate to="/superadmin/test-google-apis" replace />} />
              <Route path="settings/notifications/email" element={<SuperSmtpSettingsPage />} />
              <Route path="settings/notifications/sms" element={<SuperSmsSettingsPage />} />
              <Route path="settings/notifications/whatsapp" element={<SuperWhatsappSettingsPage />} />
            </Route>
            <Route path="settings/notifications" element={<Navigate to="/superadmin/settings/notifications/channels" replace />} />
            <Route path="settings/notifications/channels" element={<SuperChannelSettingsPage />} />
            <Route path="settings/notifications/push" element={<SuperPushSettingsPage />} />
            <Route path="notifications" element={<SuperNotificationsPage />} />
            <Route path="help" element={<SuperHelpSupportPage />} />
            <Route path="help/new" element={<CreateSupportTicketPage />} />
            <Route path="help/history" element={<SuperSupportHistoryPage />} />
            <Route path="privacy" element={<SuperPrivacyPolicyPage />} />
            <Route path="terms" element={<SuperTermsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Organization Admin Routes (Tenant Scoped Operations & Onboarding Gates) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLE.TENANT_ADMIN]} />}>
          <Route element={<AdminAccessGate />}>
            <Route path="/admin" element={<RoleLayout roleTitle="Organization Admin" navLinks={adminNavLinks} />}>
              <Route path="pending-approval" element={<TenantPendingApprovalPage />} />
              <Route path="subscription" element={<TenantSubscriptionCheckoutPage />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />

              <Route element={<PermissionRoute permission="fleet.fleets.view" />}>
                <Route path="fleet-operators" element={<FleetOperatorsPage />} />
                <Route path="fleet-operators/:id" element={<FleetOperatorDetailsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.fleets.create" />}>
                <Route path="fleet-operators/add" element={<AddFleetOperatorPage />} />
                <Route path="fleet-operators/edit/:id" element={<AddFleetOperatorPage />} />
              </Route>

              <Route element={<PermissionRoute permission="fleet.drivers.view" />}>
                <Route path="drivers" element={<AdminDriversPage />} />
                <Route path="drivers/:id" element={<AdminDriverDetailsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.drivers.create" />}>
                <Route path="drivers/add" element={<AdminAddDriverPage />} />
                <Route path="drivers/edit/:id" element={<AdminAddDriverPage />} />
              </Route>

              <Route element={<PermissionRoute permission="fleet.vehicles.view" />}>
                <Route path="vehicles" element={<AdminVehiclesPage />} />
                <Route path="vehicles/:id" element={<AdminVehicleDetailsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.vehicles.create" />}>
                <Route path="vehicles/add" element={<AdminAddVehiclePage />} />
                <Route path="vehicles/edit/:id" element={<AdminAddVehiclePage />} />
              </Route>

              {/* Vehicle Slots */}
              <Route element={<PermissionRoute permission={['fleet.slots.view', 'fleet.vehicles.view']} />}>
                <Route path="slots" element={<AdminVehicleSlotsPage />} />
                <Route path="slots/schedule" element={<ScheduleSlotPage />} />
                <Route path="slots/add" element={<ScheduleSlotPage />} />
                <Route path="slots/edit/:id" element={<ScheduleSlotPage />} />
                <Route path="slots/:id" element={<AdminVehicleSlotDetailsPage />} />
              </Route>

              <Route element={<PermissionRoute permission="fleet.depots.view" />}>
                <Route path="depots" element={<AdminDepotsPage />} />
                <Route path="depots/:id" element={<AdminDepotDetailsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.depots.create" />}>
                <Route path="depots/add" element={<AddDepotPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.depots.update" />}>
                <Route path="depots/edit/:id" element={<AddDepotPage />} />
              </Route>

              <Route element={<PermissionRoute permission="fleet.routes.view" />}>
                <Route path="routes" element={<RoutesListPage />} />
                <Route path="routes/:id" element={<RouteDetailsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.routes.create" />}>
                <Route path="routes/add" element={<AddRoutePage />} />
                <Route path="routes/edit/:id" element={<AddRoutePage />} />
              </Route>

              <Route path="campaigns/mapping" element={<AdminCampaignMappingPage />} />

              <Route element={<PermissionRoute permission="fleet.incidents.view" />}>
                <Route path="incidents" element={<AdminIncidentsPage />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.incidents.create" />}>
                <Route path="incident-report" element={<AdminReportIncidentPage />} />
                <Route path="incident-report/success" element={<AdminIncidentSuccessPage />} />
              </Route>

              <Route element={<PermissionRoute permission="fleet.devices.read" />}>
                <Route path="edge-devices" element={<AdminGpsDevicesPage />} />
                <Route path="edge-devices/:id" element={<AdminGpsDeviceDetailsPage />} />
                <Route path="gps" element={<Navigate to="/admin/edge-devices" replace />} />
                <Route path="gps/:id" element={<Navigate to="/admin/edge-devices" replace />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.devices.create" />}>
                <Route path="edge-devices/add" element={<AdminAddGpsPage />} />
                <Route path="edge-devices/edit/:id" element={<AdminAddGpsPage />} />
                <Route path="gps/add" element={<Navigate to="/admin/edge-devices/add" replace />} />
                <Route path="gps/edit/:id" element={<Navigate to="/admin/edge-devices" replace />} />
              </Route>
              <Route element={<PermissionRoute permission="fleet.devices.assign" />}>
                <Route path="edge-devices/:id/assign" element={<AdminAssignGpsPage />} />
                <Route path="gps/:id/assign" element={<Navigate to="/admin/edge-devices" replace />} />
              </Route>

              <Route element={<PermissionRoute permission="users.view" />}>
                <Route path="users" element={<AdminUserManagementPage />} />
              </Route>
              <Route element={<PermissionRoute permission="users.permissions.manage" />}>
                <Route path="users/:id/permissions" element={<AdminUserPermissionsPage />} />
              </Route>

              <Route path="roles" element={<Navigate to="/admin/users" replace />} />

              <Route element={<PermissionRoute permission="activity.view" />}>
                <Route path="activity" element={<AdminUserActivityPage />} />
              </Route>

              <Route element={<PermissionRoute permission="work_orders.view" />}>
                <Route path="technician-requests" element={<TechRequestsPage />} />
                <Route path="technician-requests/:id" element={<AdminTechRequestDetailsPage />} />
                <Route path="technician-requests/:id/rate" element={<RateTechnicianPage />} />
              </Route>
              <Route element={<PermissionRoute permission="work_orders.create" />}>
                <Route path="technician-requests/new" element={<NewTechRequestPage />} />
                <Route path="technician-requests/edit/:id" element={<NewTechRequestPage />} />
              </Route>
              <Route path="tech-requests" element={<Navigate to="/admin/technician-requests" replace />} />
              <Route path="tech-requests/new" element={<Navigate to="/admin/technician-requests/new" replace />} />

              <Route path="revenue" element={<Navigate to="/admin/billing" replace />} />
              <Route element={<PermissionRoute permission="billing.invoices.view" />}>
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="billing/upgrade" element={<AdminUpgradePlanPage />} />
              </Route>
              <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />

              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="settings" element={<AdminAccountSettingsPage />} />
              <Route path="settings/security" element={<AdminChangePasswordPage />} />
              <Route path="settings/security/success" element={<AdminPasswordUpdatedPage />} />
              <Route path="settings/notifications" element={<AdminNotificationSettingsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />

              <Route element={<PermissionRoute permission="support.view" />}>
                <Route path="help" element={<AdminHelpSupportPage />} />
                <Route path="help/new" element={<CreateSupportTicketPage />} />
                <Route path="help/history" element={<AdminSupportHistoryPage />} />
              </Route>

              <Route path="privacy" element={<AdminPrivacyPolicyPage />} />
              <Route path="terms" element={<AdminTermsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
