import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { TicketConversation } from '../../components/TicketConversation';
import { useSupport } from '../../hooks/shared/useSupport';

export const GovSupportHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
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

  const tickets = useMemo(
    () => (Array.isArray(myTickets) ? myTickets : (myTickets?.rows || myTickets?.items || [])),
    [myTickets]
  );

  const openTicket = async (id) => { setOpenId(id); await loadTicket(id).catch(() => {}); };
  const handleReply = async (id, data) => { const r = await addMessage(id, data); await loadTicket(id); await loadMyTickets(); return r; };
  const closeConv = () => { setOpenId(null); clearTicket(); };

  const filterTabs = [
    { id: 'All', label: t('common.all', 'All'), count: tickets.length },
    { id: 'Open', label: t('common.open', 'Open'), count: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length },
    { id: 'Resolved', label: t('common.resolved', 'Resolved'), count: tickets.filter((t) => t.status === 'resolved').length },
    { id: 'Closed', label: t('common.closed', 'Closed'), count: tickets.filter((t) => t.status === 'closed').length },
  ];

  const filtered = useMemo(() => tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchTab =
      activeTab === 'All' ||
      (activeTab === 'Open' && (t.status === 'open' || t.status === 'in_progress')) ||
      (activeTab === 'Resolved' && t.status === 'resolved') ||
      (activeTab === 'Closed' && t.status === 'closed');
    const matchSearch = String(t.subject || '').toLowerCase().includes(q) || String(t.code || t.id || '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  }), [tickets, search, activeTab]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTickets = filtered.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status) => ({
    open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
    closed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  }[status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700');

  const getStatusLabel = (s) => {
    if (s === 'open') return t('common.open', 'Open');
    if (s === 'in_progress') return t('common.in_progress', 'In Progress');
    if (s === 'resolved') return t('common.resolved', 'Resolved');
    if (s === 'closed') return t('common.closed', 'Closed');
    return String(s || '').replace('_', ' ') || '—';
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/government/help')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <Breadcrumb
              items={[
                { label: 'Government', path: '/government/dashboard' },
                { label: 'Help & Support', path: '/government/help' },
                { label: t('gov.support.title', 'Support History') },
              ]}
              className="mb-2"
            />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{t('gov.support.title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">{t('gov.support.desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('gov.support.refresh')}
          />
          <button
            onClick={() => navigate('/government/help')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-98"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('gov.support.raise_ticket')}</span>
          </button>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* 2. Search & Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
                <FleetIcons.Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={t('gov.support.search_ph')}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === tab.id ? 'bg-white/20 dark:bg-zinc-900/20' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tickets List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
            {currentTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                    <FleetIcons.Ticket className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {ticket.code ?? ticket.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-semibold border border-slate-200 dark:border-zinc-700">
                        {ticket.category ?? '—'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.subject ?? '—'}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${getStatusBadge(ticket.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{getStatusLabel(ticket.status)}</span>
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-all shrink-0">
                    <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-500 dark:text-zinc-400 text-xs">
                {t('ag.government.govsupporthistorypage.no_support_tickets_match_the_selected_filter', 'No support tickets match the selected filter.')}
              </div>
            )}
          </div>

          {/* 4. Pagination */}
          {filtered.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
                pageSizeOptions={[6, 10, 20, 50]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GovSupportHistoryPage;
