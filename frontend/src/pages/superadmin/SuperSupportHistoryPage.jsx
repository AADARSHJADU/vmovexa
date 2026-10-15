import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { TicketConversation } from '../../components/TicketConversation';
import { useSupport } from '../../hooks/shared/useSupport';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';

const statusBadge = (s) => ({
  open: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  in_progress: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  resolved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  closed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}[s] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700');

export const SuperSupportHistoryPage = () => {
  const { t } = useTranslation();
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();
  const [openId, setOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { loadMyTickets().catch(() => {}); }, [loadMyTickets]);

  const tickets = Array.isArray(myTickets) ? myTickets : (myTickets?.rows || myTickets?.items || []);

  const openTicket = async (id) => { setOpenId(id); await loadTicket(id).catch(() => {}); };
  const handleReply = async (id, data) => { const r = await addMessage(id, data); await loadTicket(id); await loadMyTickets(); return r; };
  const closeConv = () => { setOpenId(null); clearTicket(); };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Help & Support', to: '/superadmin/help' },
          ...(openId && current ? [
            { label: 'Ticket History', onClick: closeConv },
            { label: current.code || `Ticket #${openId}` },
          ] : [
            { label: 'NOC Escalation & Ticket History' },
          ]),
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('help.escalations_title', 'NOC Escalation & Ticket History')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {t('help.escalations_sub', 'Platform infrastructure incident logs and tenant quota upgrades')}
          </p>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('help.ticket_id', 'Ticket ID')}</th>
                  <th className="py-3 px-4">{t('help.subject', 'Subject & Description')}</th>
                  <th className="py-3 px-4">{t('help.priority', 'Priority')}</th>
                  <th className="py-3 px-4">{t('help.status', 'Status')}</th>
                  <th className="py-3 px-4">{t('help.resolved_date', 'Created Date')}</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500">No support tickets yet</td>
                  </tr>
                ) : (
                  tickets
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((tk) => (
                    <tr key={tk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">{tk.code ?? tk.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{tk.subject ?? '—'}</td>
                      <td className="py-3.5 px-4"><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">{tk.priority ?? '—'}</span></td>
                      <td className="py-3.5 px-4"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge(tk.status)}`}>{String(tk.status || '').replace('_', ' ') || '—'}</span></td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 font-mono">{tk.created_at ? new Date(tk.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openTicket(tk.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Open →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(tickets.length / pageSize) || 1}
              onPageChange={setCurrentPage}
              totalItems={tickets.length}
              pageSize={pageSize}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
