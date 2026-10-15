import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { TicketConversation } from '../../components/TicketConversation';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { CreateTicketModal } from '../../components/ui/CreateTicketModal';
import { useSupport } from '../../hooks/shared/useSupport';
import Breadcrumb from '../../components/ui/Breadcrumb';

const statusBadge = (s) => ({
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
}[s] || 'bg-slate-100 text-slate-600 border-slate-200');

export const AdminSupportHistoryPage = () => {
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();
  const [openId, setOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMyTickets();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMyTickets().catch(() => {}); }, [loadMyTickets]);

  const tickets = Array.isArray(myTickets) ? myTickets : (myTickets?.rows || myTickets?.items || []);

  const openTicket = async (id) => { setOpenId(id); await loadTicket(id).catch(() => {}); };
  const handleReply = async (id, data) => { const r = await addMessage(id, data); await loadTicket(id); await loadMyTickets(); return r; };
  const closeConv = () => { setOpenId(null); clearTicket(); };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/admin/dashboard' },
              { label: 'Help & Support', to: '/admin/help' },
              { label: 'Support Tickets' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Support Ticket History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Tickets submitted to VMOVEXA Platform Support</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh support tickets"
          />
          <Link
            to="/admin/help/new"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
            <span>Raise New Support Ticket</span>
          </Link>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadMyTickets().catch(() => {})}
      />

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FleetIcons.Ticket className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No support tickets submitted yet</div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FleetIcons.Plus className="w-3.5 h-3.5" />
                <span>Raise Your First Ticket</span>
              </button>
            </div>
          ) : (
            <>
              {tickets
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((t) => (
                <div key={t.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700">{t.code ?? t.id}</span>
                      <h3 className="text-xs font-bold text-slate-900">{t.subject ?? '—'}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                      <span>Category: {t.category ?? '—'}</span>
                      <span>·</span>
                      <span>Created: {(t.created_at || t.createdAt) ? new Date(t.created_at || t.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusBadge(t.status)}`}>
                      {String(t.status || '').replace('_', ' ') || '—'}
                    </span>
                    <button
                      onClick={() => openTicket(t.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-4">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
