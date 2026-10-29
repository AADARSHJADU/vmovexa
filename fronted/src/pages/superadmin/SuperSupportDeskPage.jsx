import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useSupport } from '../../hooks/shared/useSupport';
import { TicketConversation } from '../../components/TicketConversation';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const STATUS_FILTERS = ['All', 'open', 'in_progress', 'resolved', 'closed'];

export const SuperSupportDeskPage = () => {
  const { t } = useTranslation();
  const { allTickets, current, loadAllTickets, loadTicket, addMessage, setStatus, uploadFile, clearTicket } = useSupport();
  const [filter, setFilter] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const tickets = Array.isArray(allTickets) ? allTickets : (allTickets?.rows || allTickets?.items || []);

  const reload = useCallback(() => {
    const params = filter === 'All' ? undefined : { status: filter };
    return loadAllTickets(params).catch(() => {});
  }, [loadAllTickets, filter]);

  useEffect(() => { reload(); }, [reload]);

  const openTicket = async (id) => {
    setOpenId(id);
    await loadTicket(id).catch(() => {});
  };

  const handleReply = useCallback(async (id, data) => {
    const r = await addMessage(id, data);
    await loadTicket(id);
    await reload();
    return r;
  }, [addMessage, loadTicket, reload]);

  const handleStatus = useCallback(async (id, status) => {
    await toast.promise(setStatus(id, status), { loading: 'Updating...', success: 'Status updated', error: (e) => e?.message || 'Failed' });
    await loadTicket(id);
    await reload();
  }, [setStatus, loadTicket, reload]);

  const closeConversation = () => { setOpenId(null); clearTicket(); };

  const statusColor = (s) => ({
    open: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    in_progress: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    resolved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    closed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  }[s] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700');

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
          { label: t('nav.help_support', 'Help & Support'), path: '/superadmin/help' },
          ...(openId && current ? [
            { label: t('help.support_desk_title', 'Support Desk'), onClick: closeConversation },
            { label: current.code || `Ticket #${openId}` },
          ] : [
            { label: t('help.support_desk_title', 'Support Desk') },
          ]),
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('help.support_desk_title', 'Support Desk')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t('help.support_desk_sub', 'Every support ticket across all tenants and roles. Open a ticket to reply and change its status.')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors shrink-0 ${filter === s ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {s === 'All' ? t('common.all', 'All') : s === 'open' ? t('help.status_open', 'Open') : s === 'in_progress' ? t('help.status_in_progress', 'In Progress') : s === 'resolved' ? t('help.status_resolved', 'Resolved') : t('help.status_closed', 'Closed')}
            </button>
          ))}
        </div>
      </div>

      {openId && current ? (
        <TicketConversation
          ticket={current}
          onSendReply={handleReply}
          uploadFile={uploadFile}
          onSetStatus={handleStatus}
          onBack={closeConversation}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('help.ticket', 'Ticket')}</th>
                  <th className="py-3 px-4">{t('help.raised_by', 'Raised By')}</th>
                  <th className="py-3 px-4">{t('common.category', 'Category')}</th>
                  <th className="py-3 px-4">{t('help.priority', 'Priority')}</th>
                  <th className="py-3 px-4">{t('help.status', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {tickets.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">{t('help.no_tickets_found', 'No tickets found.')}</td></tr>
                ) : tickets
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{ticket.subject}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{ticket.code}</div>
                    </td>
                    <td className="py-3.5 px-4">{ticket.raiser?.name || ticket.raiser?.email || '—'}</td>
                    <td className="py-3.5 px-4">{ticket.category || '—'}</td>
                    <td className="py-3.5 px-4 capitalize">{ticket.priority || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusColor(ticket.status)}`}>
                        {String(ticket.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => openTicket(ticket.id)} className="px-2.5 py-1 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer">{t('common.open', 'Open')}</button>
                    </td>
                  </tr>
                ))}
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
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperSupportDeskPage;
