/**
 * store/index.js — the Redux Toolkit root store.
 * Add future feature slices here (users, dashboard, campaigns, ...).
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
// SuperAdmin Slices
import superDashboardReducer from './slices/superadmin/dashboardSlice.js';
import superOrganizationReducer from './slices/superadmin/organizationSlice.js';
import superUserReducer from './slices/superadmin/userSlice.js';
import superRoleReducer from './slices/superadmin/roleSlice.js';
import superCampaignReducer from './slices/superadmin/campaignSlice.js';
import superDeviceReducer from './slices/superadmin/deviceSlice.js';
import superBillingReducer from './slices/superadmin/billingSlice.js';
import superActivityReducer from './slices/superadmin/activitySlice.js';
import superEmergencyReducer from './slices/superadmin/emergencySlice.js';
import superTechnicianReducer from './slices/superadmin/technicianSlice.js';
import superAdvertiserReducer from './slices/superadmin/advertiserSlice.js';
import superGovernmentReducer from './slices/superadmin/governmentSlice.js';
import superFinanceOfficerReducer from './slices/superadmin/financeOfficerSlice.js';
// Admin Slices
import adminDashboardReducer from './slices/admin/dashboardSlice.js';
import adminFleetOperatorReducer from './slices/admin/fleetOperatorSlice.js';
import adminDriverReducer from './slices/admin/driverSlice.js';
import adminVehicleReducer from './slices/admin/vehicleSlice.js';
import adminDepotReducer from './slices/admin/depotSlice.js';
import adminRevenueReducer from './slices/admin/revenueSlice.js';
import adminUserReducer from './slices/admin/userSlice.js';
import adminRoleReducer from './slices/admin/roleSlice.js';
import adminActivityReducer from './slices/admin/activitySlice.js';
import adminTechnicianRequestReducer from './slices/admin/technicianRequestSlice.js';
import adminReportReducer from './slices/admin/reportSlice.js';
import adminRouteReducer from './slices/admin/routeSlice.js';
// Fleet Slices
import fleetManagerReducer from './slices/fleet/fleetSlice.js';
import fleetVehicleReducer from './slices/fleet/vehicleSlice.js';
import fleetDriverReducer from './slices/fleet/driverSlice.js';
import fleetGpsReducer from './slices/fleet/gpsSlice.js';
import fleetTripReducer from './slices/fleet/tripSlice.js';
import fleetRouteReducer from './slices/fleet/routeSlice.js';
import fleetIncidentReducer from './slices/fleet/incidentSlice.js';
import vehicleSlotReducer from './slices/fleet/vehicleSlotSlice.js';
// Driver Slices
import driverAppReducer from './slices/driver/driverSlice.js';
// Technician Slices
import technicianAppReducer from './slices/technician/technicianSlice.js';
// Finance Slices
import financeRoleReducer from './slices/finance/financeSlice.js';
// Advertiser Slices
import advertiserRoleReducer from './slices/advertiser/advertiserSlice.js';
// Government Slices
import governmentRoleReducer from './slices/government/governmentSlice.js';
// Shared Slices (cross-role)
import notificationsReducer from './slices/shared/notificationSlice.js';
import i18nAdminReducer from './slices/shared/i18nAdminSlice.js';
import reportsSharedReducer from './slices/shared/reportSlice.js';
import contentReducer from './slices/shared/contentSlice.js';
import faqReducer from './slices/shared/faqSlice.js';
import supportReducer from './slices/shared/supportSlice.js';
import notificationLogsReducer from './slices/notificationLogSlice.js';
import systemLogsReducer from './slices/systemLogSlice.js';
import whatsappNotificationReducer from './slices/whatsappNotificationSlice.js';
import emailTemplatesReducer from './slices/superadmin/emailTemplateSlice.js';
import smsTemplatesReducer from './slices/superadmin/smsTemplateSlice.js';
import paymentGatewaysReducer from './slices/superadmin/paymentGatewaySlice.js';
import googleApisReducer from './slices/googleApisSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notificationLogs: notificationLogsReducer,
    systemLogs: systemLogsReducer,
    whatsappNotification: whatsappNotificationReducer,
    emailTemplates: emailTemplatesReducer,
    smsTemplates: smsTemplatesReducer,
    paymentGateways: paymentGatewaysReducer,
    googleApis: googleApisReducer,
    // SuperAdmin
    superDashboard: superDashboardReducer,
    superOrganization: superOrganizationReducer,
    superUser: superUserReducer,
    superRole: superRoleReducer,
    superCampaign: superCampaignReducer,
    superDevice: superDeviceReducer,
    superBilling: superBillingReducer,
    superActivity: superActivityReducer,
    superEmergency: superEmergencyReducer,
    superTechnician: superTechnicianReducer,
    superAdvertiser: superAdvertiserReducer,
    superGovernment: superGovernmentReducer,
    superFinanceOfficer: superFinanceOfficerReducer,
    // Admin
    adminDashboard: adminDashboardReducer,
    adminFleetOperator: adminFleetOperatorReducer,
    adminDriver: adminDriverReducer,
    adminVehicle: adminVehicleReducer,
    adminDepot: adminDepotReducer,
    adminRevenue: adminRevenueReducer,
    adminUser: adminUserReducer,
    adminRole: adminRoleReducer,
    adminActivity: adminActivityReducer,
    adminTechnicianRequest: adminTechnicianRequestReducer,
    adminReport: adminReportReducer,
    adminRoute: adminRouteReducer,
    // Fleet
    fleetManager: fleetManagerReducer,
    fleetVehicle: fleetVehicleReducer,
    fleetDriver: fleetDriverReducer,
    fleetGps: fleetGpsReducer,
    fleetTrip: fleetTripReducer,
    fleetRoute: fleetRouteReducer,
    fleetIncident: fleetIncidentReducer,
    vehicleSlot: vehicleSlotReducer,
    // Role-specific Apps
    driverApp: driverAppReducer,
    technicianApp: technicianAppReducer,
    financeRole: financeRoleReducer,
    advertiserRole: advertiserRoleReducer,
    governmentRole: governmentRoleReducer,
    government: governmentRoleReducer,
    // Shared
    notifications: notificationsReducer,
    i18nAdmin: i18nAdminReducer,
    reportsShared: reportsSharedReducer,
    content: contentReducer,
    faq: faqReducer,
    support: supportReducer,
  },
});

export default store;
