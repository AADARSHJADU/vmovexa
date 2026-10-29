import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const adminReportService = {
  getReports: (params) => call(apiClient.get(ENDPOINTS.REPORTS.LIST, { params })),
  generateReport: (data) => call(apiClient.post(ENDPOINTS.REPORTS.GENERATE, data)),
};

export default adminReportService;
