import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** Content pages (Terms / Privacy / Help). Read for all; manage for SuperAdmin. */
export const contentService = {
  // read
  getPage: (type, params = {}) => call(apiClient.get(ENDPOINTS.CONTENT.PAGE(type), { params })),
  listPages: (params = {}) => call(apiClient.get(ENDPOINTS.CONTENT.LIST, { params })),
  // manage (SuperAdmin)
  createPage: (data) => call(apiClient.post(ENDPOINTS.CONTENT.CREATE, data)),
  updatePage: (id, data) => call(apiClient.patch(ENDPOINTS.CONTENT.ONE(id), data)),
  publishPage: (id) => call(apiClient.post(ENDPOINTS.CONTENT.PUBLISH(id))),
  deletePage: (id) => call(apiClient.delete(ENDPOINTS.CONTENT.ONE(id))),
};

export default contentService;
