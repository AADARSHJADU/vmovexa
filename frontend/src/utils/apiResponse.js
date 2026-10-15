/**
 * apiResponse.js — normalize the backend response envelope into a uniform shape.
 * Backend success: { success:true, message, data, meta }
 * Backend error:   { success:false, error:{ code, message, details }, meta }  (with HTTP status)
 *
 * unwrap(res)      → returns the `data` payload (and stashes message on it via _message-free return).
 * normalizeError(err) → returns a plain { code, message, status, details } from an axios error.
 */

export function unwrap(responseBody) {
  // responseBody is the axios `response.data` (already the backend envelope).
  if (responseBody && typeof responseBody === 'object' && 'data' in responseBody) {
    if (responseBody.meta && typeof responseBody.data === 'object' && responseBody.data !== null) {
      const meta = responseBody.meta?.pagination || responseBody.meta;
      try {
        responseBody.data.meta = meta;
      } catch (_) {}
    }
    return responseBody.data;
  }
  return responseBody;
}

export function unwrapPaginated(responseBody) {
  if (responseBody && typeof responseBody === 'object' && 'data' in responseBody) {
    const meta = responseBody.meta?.pagination || responseBody.meta || null;
    const rows = Array.isArray(responseBody.data) ? responseBody.data : (responseBody.data?.rows || []);
    return { rows, meta };
  }
  return { rows: Array.isArray(responseBody) ? responseBody : [], meta: null };
}

export function messageOf(responseBody, fallback = 'OK') {
  return (responseBody && responseBody.message) || fallback;
}

export function normalizeError(err) {
  // axios error with a backend envelope: { success:false, code, message, errors:[] }
  const resp = err && err.response;
  if (resp && resp.data) {
    const d = resp.data;
    const code = d.code || (d.error && d.error.code) || 'ERROR';
    let message = d.message || (d.error && d.error.message) || resp.statusText || 'Something went wrong.';
    const details = d.errors || (d.error && d.error.details) || null;
    if (Array.isArray(details) && details.length > 0) {
      const detailedMessages = details
        .map((item) => item.message || (item.field ? `${item.field}: invalid` : String(item)))
        .filter(Boolean)
        .join('; ');
      if (detailedMessages) {
        message = detailedMessages;
      }
    }
    return {
      code,
      message,
      status: resp.status,
      details,
    };
  }
  if (resp) {
    return { code: 'HTTP_ERROR', message: resp.statusText || 'Request failed.', status: resp.status, details: null };
  }
  // network / no response
  return { code: 'NETWORK_ERROR', message: err && err.message ? err.message : 'Network error.', status: 0, details: null };
}

export default { unwrap, messageOf, normalizeError };
