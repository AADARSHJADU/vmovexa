import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

/**
 * uploadFile — POST a single file as multipart/form-data to /uploads.
 * Returns { url, fileName, fileType, fileSize, checksum }.
 */
export const uploadService = {
  async uploadFile(file, purpose = 'support') {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('purpose', purpose);
      const endpoint = ENDPOINTS?.UPLOADS?.CREATE || ENDPOINTS?.UPLOADS?.BASE || '/uploads';
      const res = await apiClient.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrap(res.data) || res.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
};

export default uploadService;
