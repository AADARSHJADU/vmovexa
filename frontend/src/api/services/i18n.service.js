/**
 * i18n.service.js — all i18n API calls via shared apiClient.
 * Pattern: service → apiClient → backend.
 * Used by: I18nContext (and future i18nSlice thunks).
 * Never called directly from components.
 */
import { apiClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap, normalizeError } from '../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const i18nService = {
  /** Get all active languages list */
  getLanguages() {
    return call(apiClient.get(ENDPOINTS.I18N.LANGUAGES));
  },

  /** Get flat key→value translation bundle for a language code */
  getBundle(langCode) {
    return call(apiClient.get(ENDPOINTS.I18N.BUNDLE(langCode)));
  },

  /** List all translation keys (paginated) */
  getKeys(params = {}) {
    return call(apiClient.get(ENDPOINTS.I18N.KEYS, { params }));
  },

  /** Super Admin: create new language */
  createLanguage(payload) {
    return call(apiClient.post(ENDPOINTS.I18N.CREATE_LANGUAGE, payload));
  },

  /** Super Admin: update language meta */
  updateLanguage(id, payload) {
    return call(apiClient.put(ENDPOINTS.I18N.UPDATE_LANGUAGE(id), payload));
  },

  /** Super Admin: delete language */
  deleteLanguage(id) {
    return call(apiClient.delete(ENDPOINTS.I18N.DELETE_LANGUAGE(id)));
  },

  /** Upsert a single translation value */
  upsertTranslation(payload) {
    return call(apiClient.post(ENDPOINTS.I18N.UPSERT, payload));
  },

  /** Bulk-update multiple translations */
  bulkUpdate(payload) {
    return call(apiClient.post(ENDPOINTS.I18N.BULK, payload));
  },

  /** Trigger Google auto-translate for all keys of a language */
  autoTranslate(payload) {
    return call(apiClient.post(ENDPOINTS.I18N.AUTO_TRANSLATE, payload));
  },

  /** Translate a single key via Google */
  translateSingle(payload) {
    return call(apiClient.post(ENDPOINTS.I18N.TRANSLATE_SINGLE, payload));
  },
};

export default i18nService;
