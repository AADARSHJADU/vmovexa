import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** Support tickets — full two-way conversation with attachments. */
export const supportService = {
  myTickets: (params) => call(apiClient.get(ENDPOINTS.SUPPORT.MY_TICKETS, { params })),
  allTickets: (params) => call(apiClient.get(ENDPOINTS.SUPPORT.TICKETS, { params })),
  getTicket: (id) => call(apiClient.get(ENDPOINTS.SUPPORT.TICKET_ONE(id))),
  createTicket: (data) => call(apiClient.post(ENDPOINTS.SUPPORT.TICKETS, data)),
  addMessage: (id, data) => call(apiClient.post(ENDPOINTS.SUPPORT.TICKET_MESSAGES(id), data)),
  setStatus: (id, status) => call(apiClient.patch(ENDPOINTS.SUPPORT.TICKET_STATUS(id), { status })),
};

export default supportService;
