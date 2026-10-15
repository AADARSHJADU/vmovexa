import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { TicketConversation } from '../../components/TicketConversation';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useSupport } from '../../hooks/shared/useSupport';

const statusBadge = (s) => ({
  open: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  in_progress: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  resolved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  closed: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
}[s] || 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700');

export const SupportHistoryPage = () => {
  const navigate = useNavigate();
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Open, Resolved, Closed
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        String(t.code || t.id || '').toLowerCase().includes(q) ||
        String(t.subject || '').toLowerCase().includes(q) ||
        String(t.category || '').toLowerCase().includes(q);
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Open' && (t.status === 'open' || t.status === 'in_progress')) ||
        (activeTab === 'Resolved' && t.status === 'resolved') ||
        (activeTab === 'Closed' && t.status === 'closed');
      return matchesSearch && matchesTab;
    });
  }, [tickets, search, activeTab]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Helpdesk', path: '/fleet-manager/help' },
          { label: 'Support History' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/help')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Back to Helpdesk"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Your Support History</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Track resolution status and engineering updates on your submitted tickets.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh tickets list"
          />
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/help')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <FleetIcons.Plus className="w-4 h-4 text-current" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* 2. Search & Filter Tabs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
                <FleetIcons.Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by issue or ticket ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {['All', 'Open', 'Resolved', 'Closed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ticket Cards List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center transition-colors">
                <FleetIcons.Ticket className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">No support tickets yet</div>
              </div>
            ) : (
              paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0">
                      <FleetIcons.Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{ticket.code ?? ticket.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(ticket.status)}`}>
                          {String(ticket.status || '').replace('_', ' ') || '—'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{ticket.subject ?? '—'}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        <span>{ticket.category ?? '—'}</span>
                        <span>•</span>
                        <span>{(ticket.created_at || ticket.createdAt) ? new Date(ticket.created_at || ticket.createdAt).toLocaleString() : '—'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTicket(ticket.id)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>View Ticket Details</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTickets.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </>
      )}
    </div>
  );
};

export default SupportHistoryPage;
