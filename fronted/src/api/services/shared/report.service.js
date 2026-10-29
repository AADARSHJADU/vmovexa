import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

async function callPaginated(promise) {
  try { return unwrapPaginated((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** Shared reports + exports service — used by role Reports/Analytics pages and export buttons. */
export const reportService = {
  // Reports
  getReports: (params) => callPaginated(apiClient.get(ENDPOINTS.REPORTS.LIST, { params })),
  getReport: (id) => call(apiClient.get(ENDPOINTS.REPORTS.ONE(id))),
  generateReport: (reportType, reportParams) => call(apiClient.post(ENDPOINTS.REPORTS.GENERATE, { reportType, params: reportParams || {} })),
  deleteReport: (id) => call(apiClient.delete(ENDPOINTS.REPORTS.DELETE(id))),
  // Exports (async data-export jobs)
  getExports: (params) => call(apiClient.get(ENDPOINTS.EXPORTS.LIST, { params })),
  createExport: (data) => call(apiClient.post(ENDPOINTS.EXPORTS.CREATE, data)),
};

export default reportService;
