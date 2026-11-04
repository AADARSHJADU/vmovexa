import { useTranslation } from '../../hooks/useTranslation';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TicketConversation } from '../../components/TicketConversation';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useSupport } from '../../hooks/shared/useSupport';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { FleetIcons } from '../../components/FleetIcons';

const statusStyles = {
  open: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60',
  in_progress: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60',
  resolved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60',
  closed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700',
};

export const AdvertiserSupportHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/advertiser' : '/advertiser';

  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMyTickets();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyTickets().catch(() => {});
  }, [loadMyTickets]);

  const tickets = Array.isArray(myTickets) ? myTickets : (myTickets?.rows || myTickets?.items || []);

  const openTicket = async (id) => {
    setOpenId(id);
    await loadTicket(id).catch(() => {});
  };

  const handleReply = async (id, data) => {
    const r = await addMessage(id, data);
    await loadTicket(id);
    await loadMyTickets();
    return r;
  };

  const closeConv = () => {
    setOpenId(null);
    clearTicket();
  };

  const filtered = useMemo(() => {
    return tickets.filter((tk) => {
      const q = search.toLowerCase();
      const matchSearch =
        String(tk.subject || '').toLowerCase().includes(q) ||
        String(tk.code || tk.id || '').toLowerCase().includes(q);
      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'Open' && (tk.status === 'open' || tk.status === 'in_progress')) ||
        (activeTab === 'Resolved' && tk.status === 'resolved') ||
        (activeTab === 'Closed' && tk.status === 'closed');
      return matchSearch && matchTab;
    });
  }, [tickets, search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedTickets = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('roles.advertiser', 'Advertiser'), path: `${basePath}/dashboard`, icon: FleetIcons.Dashboard },
              { label: t('advertiser.profile.help_support', 'Help & Support'), path: `${basePath}/help` },
              { label: t('advertiser.support.breadcrumb', 'Support History') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('advertiser.support.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {t('advertiser.support.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('advertiser.support.refresh_title')}
          />
          <button
            onClick={() => navigate(`${basePath}/help`)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold active:scale-[0.99] transition-all shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('advertiser.support.raise_ticket')}</span>
          </button>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* Search & Tabs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <FleetIcons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('advertiser.support.search_ph')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/60 dark:border-zinc-700">
              {['All', 'Open', 'Resolved', 'Closed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List Cards */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl divide-y divide-slate-100 dark:divide-zinc-800 shadow-sm overflow-hidden">
            {paginatedTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                    <FleetIcons.Headset className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{ticket.code ?? ticket.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-semibold border border-slate-200 dark:border-zinc-700">
                        {ticket.category ?? '—'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.subject ?? '—'}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ticket.status] || 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'}`}>
                    ● {String(ticket.status || '').replace('_', ' ') || '—'}
                  </span>
                  <FleetIcons.ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors hidden sm:block" />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs">
                {t('ag.advertiser.advertisersupporthistorypage.no_support_tickets_match_the_selected_filter', 'No support tickets match the selected filter.')}
              </div>
            )}
          </div>

          {/* Standard Global Pagination */}
          {filtered.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvertiserSupportHistoryPage;
