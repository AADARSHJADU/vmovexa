import 'package:get/get.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/bindings/driver_bindings.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/bindings/driver_documents_binding.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/driver_documents/view/driver_documents_view.dart';
import 'package:vmovexa/app/modules/roles/driver/profile/view/driver_profile_view.dart';
import 'package:vmovexa/app/modules/roles/driver/report/bindings/report_incident_binding.dart';
import 'package:vmovexa/app/modules/roles/driver/report/view/incident_details_view.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/bindings/subscriptions_binding.dart';
import 'package:vmovexa/app/modules/roles/finance/subscriptions/view/subscriptions_view.dart';
import 'package:vmovexa/app/modules/roles/technician/technician_dashboard/bindings/technician_dashboard_bindings.dart';
import '../modules/roles/driver/driver_dashboard/bindings/driver_dashboard_bindings.dart';
import '../modules/roles/driver/driver_dashboard/view/driver_dashboard_view.dart';
import '../modules/roles/driver/notification/bindings/notifications_driver_binding.dart';
import '../modules/roles/driver/notification/view/notifications_driver_view.dart';
import '../modules/roles/driver/profile/help_support/bindings/help_support_binding.dart';
import '../modules/roles/driver/profile/help_support/view/driver_help_support_view.dart';
import '../modules/roles/driver/routes/bindings/my_route_binding.dart';
import '../modules/roles/driver/routes/view/my_route_view.dart';
import '../modules/roles/finance/finance_dashboard/bindings/finance_dashboard_bindings.dart';
import '../modules/roles/finance/finance_dashboard/view/finance_dashboard_view.dart';
import '../modules/roles/finance/invoice/bindings/invoice_binding.dart';
import '../modules/roles/finance/invoice/generate_invoice/bindings/generate_invoice_binding.dart';
import '../modules/roles/finance/invoice/generate_invoice/view/generate_invoice_view.dart';
import '../modules/roles/finance/invoice/view/invoice_view.dart';
import '../modules/roles/technician/alert_notification/bindings/alerts_binding.dart';
import '../modules/roles/technician/alert_notification/view/alerts_view.dart';
import '../modules/roles/technician/connectivity_troubleshooting/bindings/connectivity_troubleshooting_binding.dart';
import '../modules/roles/technician/connectivity_troubleshooting/view/connectivity_troubleshooting_view.dart';
import '../modules/roles/technician/device_diagostics/bindings/device_diagnostics_binding.dart';
import '../modules/roles/technician/device_diagostics/view/device_diagnostics_view.dart';
import '../modules/roles/technician/display_devices/register_new_device/bindings/register_device_binding.dart';
import '../modules/roles/technician/display_devices/register_new_device/view/register_device_view.dart';
import '../modules/roles/technician/gps_installation/bindings/gps_installation_binding.dart';
import '../modules/roles/technician/gps_installation/view/gps_installation_view.dart';
import '../modules/roles/technician/hardware_configuration/bindings/hardware_config_binding.dart';
import '../modules/roles/technician/hardware_configuration/views/hardware_configuration_view.dart';
import '../modules/roles/technician/hardware_status/bindings/hardware_status_binding.dart';
import '../modules/roles/technician/hardware_status/view/hardware_status_view.dart';
import '../modules/roles/technician/home/bindings/home_binding.dart' hide HomeBinding;
import '../modules/roles/technician/home/view/home_view.dart' hide HomeView;
import '../modules/roles/technician/profile/bindings/profile_binding.dart';
import '../modules/roles/technician/profile/view/profile_view.dart';
import '../modules/roles/technician/edit_profile/bindings/edit_profile_binding.dart';
import '../modules/roles/technician/edit_profile/view/edit_profile_view.dart';
import '../modules/roles/technician/technician_dashboard/view/technician_dashboard_view.dart';
import 'app_routes.dart';

import '../modules/splash/bindings/splash_binding.dart';
import '../modules/splash/views/splash_view.dart';

import '../modules/onboarding/bindings/onboarding_binding.dart';
import '../modules/onboarding/views/onboarding_view.dart';

import '../modules/auth/register/bindings/register_binding.dart';
import '../modules/auth/register/views/register_view.dart';

import '../modules/auth/login/bindings/login_binding.dart';
import '../modules/auth/login/views/login_view.dart';

import '../modules/home/bindings/home_binding.dart';
import '../modules/home/views/home_view.dart';

import '../modules/auth/otp_verify/bindings/otp_verify_binding.dart';
import '../modules/auth/otp_verify/views/otp_verify_view.dart';

import '../modules/auth/forgot_password/bindings/forgot_password_binding.dart';
import '../modules/auth/forgot_password/views/forgot_password_view.dart';

import '../modules/auth/reset_password/bindings/reset_password_binding.dart';
import '../modules/auth/reset_password/views/reset_password_view.dart';

import '../modules/auth/password_updated/bindings/password_updated_binding.dart';
import '../modules/auth/password_updated/views/password_updated_view.dart';

import '../modules/roles/fleet_operator/dashboard/bindings/dashboard_binding.dart';
import '../modules/roles/fleet_operator/dashboard/views/dashboard_view.dart';

import '../modules/roles/fleet_operator/fleet_list/bindings/fleet_list_binding.dart';
import '../modules/roles/fleet_operator/fleet_list/views/fleet_list_view.dart';

import '../modules/roles/fleet_operator/add_fleet/bindings/add_fleet_binding.dart';
import '../modules/roles/fleet_operator/add_fleet/views/add_fleet_view.dart';

import '../modules/roles/fleet_operator/fleet_details/bindings/fleet_details_binding.dart';
import '../modules/roles/fleet_operator/fleet_details/views/fleet_details_view.dart';

import '../modules/roles/fleet_operator/add_vehicle/bindings/add_vehicle_binding.dart';
import '../modules/roles/fleet_operator/add_vehicle/views/add_vehicle_view.dart';

import '../modules/roles/placeholder/views/role_placeholder_view.dart';

import '../modules/roles/fleet_operator/add_driver/bindings/add_driver_binding.dart';
import '../modules/roles/fleet_operator/add_driver/views/add_driver_view.dart';

import '../modules/roles/fleet_operator/add_gps/bindings/add_gps_binding.dart';
import '../modules/roles/fleet_operator/add_gps/views/add_gps_view.dart';

import '../modules/roles/fleet_operator/assign_driver/bindings/assign_driver_binding.dart';
import '../modules/roles/fleet_operator/assign_driver/views/assign_driver_view.dart';

import '../modules/roles/fleet_operator/assign_gps/bindings/assign_gps_binding.dart';
import '../modules/roles/fleet_operator/assign_gps/views/assign_gps_view.dart';

import '../modules/roles/fleet_operator/setup_complete/bindings/setup_complete_binding.dart';
import '../modules/roles/fleet_operator/setup_complete/views/setup_complete_view.dart';

import '../modules/roles/fleet_operator/live_tracking/bindings/live_tracking_binding.dart';
import '../modules/roles/fleet_operator/live_tracking/views/live_tracking_view.dart';

import '../modules/roles/fleet_operator/trip_details/bindings/trip_details_binding.dart';
import '../modules/roles/fleet_operator/trip_details/views/trip_details_view.dart';

import '../modules/roles/fleet_operator/vehicle_details/bindings/vehicle_details_binding.dart';
import '../modules/roles/fleet_operator/vehicle_details/views/vehicle_details_view.dart';

import '../modules/roles/fleet_operator/notifications/bindings/notifications_binding.dart';
import '../modules/roles/fleet_operator/notifications/views/notifications_view.dart';

import '../modules/roles/fleet_operator/trip_report/bindings/trip_report_binding.dart';
import '../modules/roles/fleet_operator/trip_report/views/trip_report_view.dart';

import '../modules/roles/fleet_operator/vehicle_analytics/bindings/vehicle_analytics_binding.dart';
import '../modules/roles/fleet_operator/vehicle_analytics/views/vehicle_analytics_view.dart';

import '../modules/roles/fleet_operator/account_settings/bindings/account_settings_binding.dart';
import '../modules/roles/fleet_operator/account_settings/views/account_settings_view.dart';

import '../modules/roles/fleet_operator/change_password/bindings/change_password_binding.dart';
import '../modules/roles/fleet_operator/change_password/views/change_password_view.dart';

import '../modules/roles/fleet_operator/notification_settings/bindings/notification_settings_binding.dart';
import '../modules/roles/fleet_operator/notification_settings/views/notification_settings_view.dart';

import '../modules/roles/fleet_operator/help_support/bindings/help_support_binding.dart';
import '../modules/roles/fleet_operator/help_support/views/help_support_view.dart';

import '../modules/roles/fleet_operator/support_history/bindings/support_history_binding.dart';
import '../modules/roles/fleet_operator/support_history/views/support_history_view.dart';

import '../modules/roles/fleet_operator/privacy_policy/bindings/privacy_policy_binding.dart';
import '../modules/roles/fleet_operator/privacy_policy/views/privacy_policy_view.dart';

import '../modules/roles/fleet_operator/terms_conditions/bindings/terms_conditions_binding.dart';
import '../modules/roles/fleet_operator/terms_conditions/views/terms_conditions_view.dart';

class AppPages {
  // static const INITIAL = Routes.SPLASH;
  static const INITIAL = Routes.FINANCE_DASHBOARD;

  static final routes = [
    GetPage(
      name: Routes.SPLASH,
      page: () => const SplashView(),
      binding: SplashBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.ONBOARDING,
      page: () => const OnboardingView(),
      binding: OnboardingBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.REGISTER,
      page: () => const RegisterView(),
      binding: RegisterBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.LOGIN,
      page: () => const LoginView(),
      binding: LoginBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.OTP_VERIFY,
      page: () => const OtpVerifyView(),
      binding: OtpVerifyBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.FORGOT_PASSWORD,
      page: () => const ForgotPasswordView(),
      binding: ForgotPasswordBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.RESET_PASSWORD,
      page: () => const ResetPasswordView(),
      binding: ResetPasswordBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.PASSWORD_UPDATED,
      page: () => const PasswordUpdatedView(),
      binding: PasswordUpdatedBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.FLEET_OP_DASHBOARD,
      page: () => const FleetOpDashboardView(),
      binding: FleetOpDashboardBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.FLEET_LIST,
      page: () => const FleetListView(),
      binding: FleetListBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ADD_FLEET,
      page: () => const AddFleetView(),
      binding: AddFleetBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.FLEET_DETAILS,
      page: () => const FleetDetailsView(),
      binding: FleetDetailsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ADD_VEHICLE,
      page: () => const AddVehicleView(),
      binding: AddVehicleBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ROLE_PLACEHOLDER,
      page: () => const RolePlaceholderView(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.ADD_DRIVER,
      page: () => const AddDriverView(),
      binding: AddDriverBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ADD_GPS,
      page: () => const AddGpsView(),
      binding: AddGpsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ASSIGN_DRIVER,
      page: () => const AssignDriverView(),
      binding: AssignDriverBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ASSIGN_GPS,
      page: () => const AssignGpsView(),
      binding: AssignGpsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.SETUP_COMPLETE,
      page: () => const SetupCompleteView(),
      binding: SetupCompleteBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: Routes.LIVE_TRACKING,
      page: () => const LiveTrackingView(),
      binding: LiveTrackingBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.TRIP_DETAILS,
      page: () => const TripDetailsView(),
      binding: TripDetailsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.VEHICLE_DETAILS,
      page: () => const VehicleDetailsView(),
      binding: VehicleDetailsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.NOTIFICATIONS_LIST,
      page: () => const NotificationsView(),
      binding: NotificationsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.TRIP_REPORT,
      page: () => const TripReportView(),
      binding: TripReportBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.VEHICLE_ANALYTICS,
      page: () => const VehicleAnalyticsView(),
      binding: VehicleAnalyticsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ACCOUNT_SETTINGS,
      page: () => const AccountSettingsView(),
      binding: AccountSettingsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.CHANGE_PASSWORD,
      page: () => const ChangePasswordView(),
      binding: ChangePasswordBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.NOTIFICATION_SETTINGS,
      page: () => const NotificationSettingsView(),
      binding: NotificationSettingsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.HELP_SUPPORT,
      page: () => const HelpSupportView(),
      binding: HelpSupportBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.SUPPORT_HISTORY,
      page: () => const SupportHistoryView(),
      binding: SupportHistoryBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.PRIVACY_POLICY,
      page: () => const PrivacyPolicyView(),
      binding: PrivacyPolicyBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.TERMS_CONDITIONS,
      page: () => const TermsConditionsView(),
      binding: TermsConditionsBinding(),
      transition: Transition.rightToLeft,
    ),
    //technician flow routes

    GetPage(
      name: Routes.TECHNICIAN_DASHBOARD,
      page: () => const TechnicianDashboardView(),
      binding: TechnicianDashboardBindings(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: '/dashboard',
      page: () => const HomeView(),
      binding: HomeBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name:Routes.REGISTER_DISPLAY_DEVICE,
      page: () => const RegisterDeviceView(),
      binding: RegisterDeviceBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.HARDWARE_CONFIGURATION,
      page: () => const HardwareConfigurationView(),
      binding: HardwareConfigBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.GPS_INSTALLATION,
      page: () => const GpsInstallationView(),
      binding: GpsInstallationBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.DEVICE_DIAGNOSTICS,
      page: () => const DeviceDiagnosticsView(),
      binding: DeviceDiagnosticsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.HARDWARE_STATUS,
      page: () => const HardwareStatusView(),
      binding: HardwareStatusBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.CONNECTIVITY_TROUBLESHOOTING,
      page: () => const ConnectivityTroubleshootingView(),
      binding: ConnectivityTroubleshootingBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.ALERT_NOTIFICATION,
      page: () => const AlertsView(),
      binding: AlertsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.TECHNICIAN_PROFILE,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.TECHNICIAN_EDIT_PROFILE,
      page: () => const EditProfileView(),
      binding: EditProfileBinding(),
      transition: Transition.rightToLeft,
    ),
    //Driver flow routes

    GetPage(
      name: Routes.DRIVER_DASHBOARD,
      page: () => const DriverDashboardView(),
      binding: DriverDashboardBindings(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.MY_ROUTE,
      page: () => const MyRouteView(),
      binding: MyRouteBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name:Routes.DRIVER_NOTIFICATION,
      page: () => const NotificationsDriverView(),
      binding: NotificationsDriverBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.DRIVER_REPORT_INCIDENT,
      page: () => const IncidentDetailsView(),
      binding: ReportIncidentBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.DRIVER_PROFILE,
      page: () => const DriverProfileView(),
      binding: DriverProfileBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.DRIVER_DOCUMENT,
      page: () => const DriverDocumentsView(),
      binding: DriverDocumentsBinding(),
    ),
    GetPage(
      name:Routes.DRIVER_HELP_SUPPORT,
      page: () => const DriverHelpSupportView(),
      binding: DriverHelpSupportBinding(),
    ),


    //Finance flow routes

    GetPage(
      name: Routes.FINANCE_DASHBOARD,
      page: () => const FinanceDashboardView(),
      binding: FinanceDashboardBindings(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.FINANCE_SUBSCRIPTIONS,
      page: () => const SubscriptionsView(),
      binding: SubscriptionsBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name: Routes.FINANCE_INVOICE,
      page: () => const InvoiceView(),
      binding: InvoiceBinding(),
      transition: Transition.rightToLeft,
    ),
    GetPage(
      name:Routes.GENERATE_INVOICE,
      page: () => const GenerateInvoiceView(),
      binding: GenerateInvoiceBinding(),
    ),
  ];
}







