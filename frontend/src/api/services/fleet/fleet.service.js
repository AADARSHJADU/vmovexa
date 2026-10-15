import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta && (res.data.meta.totalPages !== undefined || res.data.meta.total !== undefined || Array.isArray(res.data.data))) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Fleet Operators = Users with ROLE-FLEET-OPERATOR.
 * All create/list/update operations go through /api/v1/users endpoint.
 * FleetOperatorProfile (depot_id, assigned_buses, active_drivers_count) is auto-created
 * by the backend user.service when roleCode === 'ROLE-FLEET-OPERATOR'.
 */
export const fleetManagerService = {
  // List fleet entities (/api/v1/fleets)
  getFleets: (params) => call(apiClient.get(ENDPOINTS.FLEET.FLEETS, { params })),

  // Get single fleet by ID
  getFleet: (id) => call(apiClient.get(ENDPOINTS.FLEET.FLEET_ONE(id))),

  // Create fleet entity (/api/v1/fleets)
  createFleet: (data) =>
    call(apiClient.post(ENDPOINTS.FLEET.FLEETS, {
      name: data.name || data.fleetName || data.contactPerson,
      code: data.code,
      description: data.description,
      fleetType: data.fleetType || data.fleet_type,
      contactPerson: data.contactPerson || data.contact_person || data.name,
      designation: data.designation,
      department: data.department,
      phone: data.phone,
      email: data.email,
      depotId: data.depotId || data.depot_id,
      location: data.location,
      timeZone: data.timeZone || data.time_zone || 'Asia/Kolkata (IST)',
      workingHours: data.workingHours || data.working_hours,
      assignedBuses: data.assignedBuses || data.assigned_buses || 0,
      activeDriversCount: data.activeDriversCount || data.active_drivers_count || 0,
      logoUrl: data.logoUrl || data.avatarUrl || data.logo_url,
      status: data.status,
      documents: data.documents,
      organizationId: data.organizationId,
    })),

  // Update fleet entity
  updateFleet: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.FLEET_ONE(id), data)),

  // Delete fleet entity
  deleteFleet: (id) => call(apiClient.delete(ENDPOINTS.FLEET.FLEET_ONE(id))),

  // Status toggle
  updateFleetStatus: (id, status) => call(apiClient.patch(ENDPOINTS.FLEET.FLEET_ONE(id), { status })),

  // Approval flow endpoints (/fleets/:id/approve, /fleets/:id/reject)
  approveFleet: (id) => call(apiClient.patch(`${ENDPOINTS.FLEET.FLEET_ONE(id)}/approve`)),
  rejectFleet: (id, reason) => call(apiClient.patch(`${ENDPOINTS.FLEET.FLEET_ONE(id)}/reject`, { reason })),
};

export default fleetManagerService;
