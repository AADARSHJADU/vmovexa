import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useFaqs } from '../../hooks/shared/useFaqs';
import { ROLE } from '../../constants/roles';

const ROLE_OPTIONS = [
  { code: '', label: 'Global (all roles)' },
  { code: ROLE.TENANT_ADMIN, label: 'Organization Admin' },
  { code: ROLE.FLEET_OPERATOR, label: 'Fleet Operator' },
  { code: ROLE.DRIVER, label: 'Driver' },
  { code: ROLE.CENTRAL_TECH, label: 'Technician' },
  { code: ROLE.ADVERTISER, label: 'Advertiser' },
  { code: ROLE.GOVT_AGENCY, label: 'Government Agency' },
  { code: ROLE.FINANCE_OFFICER, label: 'Finance Officer' },
  { code: ROLE.SUPER_ADMIN, label: 'Super Admin' },
];

export const SuperFaqManagerPage = () => {
  const { t } = useTranslation();
  const { faqs, loadFaqs, createFaq, updateFaq, deleteFaq } = useFaqs();
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({ question: '', answer: '', category: '', roleCode: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const list = Array.isArray(faqs) ? faqs : (faqs?.rows || faqs?.items || []);

  const reload = useCallback(() => loadFaqs(roleFilter || undefined).catch(() => {}), [loadFaqs, roleFilter]);
  useEffect(() => { reload(); }, [reload]);

  const resetForm = () => { setForm({ question: '', answer: '', category: '', roleCode: roleFilter }); setEditingId(null); };

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({ question: f.question || '', answer: f.answer || '', category: f.category || '', roleCode: '' });
  };

  const handleSubmit = async () => {
    if (!form.question.trim()) { toast.error('Question is required.'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await toast.promise(updateFaq(editingId, { question: form.question, answer: form.answer, category: form.category }), {
          loading: 'Saving...', success: 'FAQ updated', error: (e) => e?.message || 'Update failed',
        });
      } else {
        await toast.promise(createFaq({ question: form.question, answer: form.answer, category: form.category, roleCode: form.roleCode || undefined }), {
          loading: 'Adding...', success: 'FAQ added', error: (e) => e?.message || 'Add failed',
        });
      }
      resetForm();
      await reload();
    } catch (_) { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await toast.promise(deleteFaq(id), { loading: 'Deleting...', success: 'FAQ deleted', error: (e) => e?.message || 'Delete failed' });
      await reload();
    } catch (_) { /* */ }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('nav.help_support', 'Help & Support'), path: '/superadmin/help' },
          { label: t('faq.manager_title', 'FAQ Manager') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('faq.manager_title', 'FAQ Manager')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t('faq.manager_sub', 'Add role-specific or global FAQs. Each role sees its own FAQs + global ones on their Help page.')}
          </p>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">{t('faq.view_role', 'View role')}</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            {ROLE_OPTIONS.map((r) => <option key={r.code || 'global'} value={r.code}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Add / edit form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{editingId ? t('faq.edit_faq', 'Edit FAQ') : t('faq.add_new_faq', 'Add New FAQ')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder={t('faq.question_ph', 'Question')}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder={t('faq.category_ph', 'Category (optional)')}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>
        <textarea
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          rows={3}
          placeholder={t('faq.answer_ph', 'Answer')}
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
        />
        {!editingId && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">{t('faq.assign_role', 'Assign to role')}</label>
            <select
              value={form.roleCode}
              onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              {ROLE_OPTIONS.map((r) => <option key={r.code || 'global'} value={r.code}>{r.label}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">{t('common.cancel', 'Cancel')}</button>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" /> {editingId ? t('faq.save_faq', 'Save FAQ') : t('faq.add_faq', 'Add FAQ')}
          </button>
        </div>
      </div>

      {/* FAQ list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {t('faq.faqs_heading', 'FAQs')} ({list.length})
        </h2>
        {list.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{t('faq.no_faqs_yet', 'No FAQs yet for this view.')}</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((f) => (
              <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{f.question}</span>
                    {f.category && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{f.category}</span>}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{f.role_id ? `Role #${f.role_id}` : 'Global'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.answer}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button onClick={() => startEdit(f)} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer">{t('common.edit', 'Edit')}</button>
                  <button onClick={() => handleDelete(f.id)} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-lg transition-colors cursor-pointer">{t('common.delete', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperFaqManagerPage;
