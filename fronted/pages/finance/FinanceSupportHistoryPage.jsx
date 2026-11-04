import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { TicketConversation } from '../../components/TicketConversation';
import { useSupport } from '../../hooks/shared/useSupport';

const statusBadge = (s) => ({
  open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
  closed: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
}[s] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700');

export const FinanceSupportHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    { id: 'all', label: t('finance.support.tab_all', 'All'), count: tickets.length },
    { id: 'in_progress', label: t('finance.support.tab_in_progress', 'In Progress'), count: tickets.filter((t) => t.status === 'in_progress').length },
    { id: 'resolved', label: t('finance.support.tab_resolved', 'Resolved'), count: tickets.filter((t) => t.status === 'resolved').length },
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(t.code || t.id || '').toLowerCase().includes(q) ||
        String(t.subject || '').toLowerCase().includes(q) ||
        String(t.category || '').toLowerCase().includes(q);
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'in_progress' && t.status === 'in_progress') ||
        (activeTab === 'resolved' && t.status === 'resolved');
      return matchesSearch && matchesTab;
    });
  }, [tickets, searchQuery, activeTab]);

  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + pageSize);

  const getStatusLabel = (s) => {
    if (s === 'open') return t('finance.support.status_open', 'Open');
    if (s === 'in_progress') return t('finance.support.status_in_progress', 'In Progress');
    if (s === 'resolved') return t('finance.support.status_resolved', 'Resolved');
    if (s === 'closed') return t('finance.support.status_closed', 'Closed');
    return String(s || '').replace('_', ' ') || '—';
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? t('nav.superadmin', 'Super Admin') : t('nav.headers.finance_portal', 'Finance Portal'), path: `${basePath}/dashboard` },
              { label: t('common.help_and_support', 'Help & Support'), path: `${basePath}/help` },
              { label: t('finance.support.inquiries_title', 'Inquiries & Disputes') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.support.inquiries_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('finance.support.inquiries_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('finance.support.refresh_title')}
          />
          <button
            onClick={() => navigate(`${basePath}/help/new`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('finance.support.new_query')}</span>
          </button>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* Toolbar & Filter Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
              {filterTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('finance.support.search_ph')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center">
                <FleetIcons.Ticket className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('finance.support.no_tickets')}</div>
              </div>
            ) : (
              currentTickets.map((ticket) => (
                <div key={ticket.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">{ticket.code ?? ticket.id}</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{ticket.subject ?? '—'}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 font-medium pt-0.5">
                      <span>{t('ag.finance.financesupporthistorypage.category', 'Category:')} {ticket.category ?? '—'}</span>
                      <span>·</span>
                      <span>{t('ag.finance.financesupporthistorypage.date', 'Date:')} {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusBadge(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <button
                      onClick={() => openTicket(ticket.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {t('finance.support.open_ticket')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Global Standard Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </>
      )}
    </div>
  );
};

export default FinanceSupportHistoryPage;
