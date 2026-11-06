import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** FAQs — role-based. list(roleCode) returns that role's + global FAQs. Manage for SuperAdmin. */
export const faqService = {
  list: (roleCode) => call(apiClient.get(ENDPOINTS.CONTENT.FAQS, { params: roleCode ? { role: roleCode } : {} })),
  create: (data) => call(apiClient.post(ENDPOINTS.CONTENT.FAQS, data)),
  update: (id, data) => call(apiClient.patch(ENDPOINTS.CONTENT.FAQ_ONE(id), data)),
  remove: (id) => call(apiClient.delete(ENDPOINTS.CONTENT.FAQ_ONE(id))),
};

export default faqService;
