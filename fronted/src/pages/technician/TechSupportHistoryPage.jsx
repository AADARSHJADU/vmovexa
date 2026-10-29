import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { TicketConversation } from '../../components/TicketConversation';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSupport } from '../../hooks/shared/useSupport';

const statusBadge = (s) => ({
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
}[s] || 'bg-slate-100 text-slate-600 border-slate-200');

export const TechSupportHistoryPage = () => {
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMyTickets();
    } catch {
      // handled
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
    { label: 'All', count: tickets.length },
    { label: 'In Progress', count: tickets.filter((t) => t.status === 'in_progress').length },
    { label: 'Resolved', count: tickets.filter((t) => t.status === 'resolved').length },
    { label: 'Closed', count: tickets.filter((t) => t.status === 'closed').length },
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(t.code || t.id || '').toLowerCase().includes(q) ||
        String(t.subject || '').toLowerCase().includes(q) ||
        String(t.category || '').toLowerCase().includes(q);
      const matchesTab = activeTab === 'All' ||
        (activeTab === 'In Progress' && t.status === 'in_progress') ||
        (activeTab === 'Resolved' && t.status === 'resolved') ||
        (activeTab === 'Closed' && t.status === 'closed');
      return matchesSearch && matchesTab;
    });
  }, [tickets, searchQuery, activeTab]);

  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Support History' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.support.search_ph')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Audit log of all technical dispatches, hardware requisitions, and firmware resolutions
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link
            to="/technician/help"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Create New Ticket
          </Link>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* Filter Tabs & Search Bar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
              {filterTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => {
                    setActiveTab(tab.label);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.label
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === tab.label ? 'bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('technician.support.search_ph')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('common.view_mode')}</span>
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  tableValue="table"
                  cardValue="card"
                />
              </div>
            </div>
          </div>

          {/* Main Content: Card View OR Table View */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
              <FleetIcons.Ticket className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('technician.support.no_tickets')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('technician.support.raised_appear')}</p>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {currentTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {ticket.code ?? ticket.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge(ticket.status)}`}>
                        {String(ticket.status || '').replace('_', ' ') || '—'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">{ticket.subject ?? '—'}</h3>

                    <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-zinc-500">{t('common.category')}:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{ticket.category ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-zinc-500">{t('common.priority')}:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{ticket.priority ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                      Created: {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}
                    </span>
                    <button
                      onClick={() => openTicket(ticket.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      <span>{t('common.open')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">{t('common.ticket_id')}</th>
                      <th className="py-3 px-4">{t('common.subject')}</th>
                      <th className="py-3 px-4">{t('common.category')}</th>
                      <th className="py-3 px-4">{t('common.priority')}</th>
                      <th className="py-3 px-4">{t('common.created_date')}</th>
                      <th className="py-3 px-4">{t('common.status')}</th>
                      <th className="py-3 px-4 text-right">{t('common.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                    {currentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">{ticket.code ?? ticket.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{ticket.subject ?? '—'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-zinc-200 font-bold">{ticket.category ?? '—'}</td>
                        <td className="py-3.5 px-4">{ticket.priority ?? '—'}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${statusBadge(ticket.status)}`}>
                            {String(ticket.status || '').replace('_', ' ') || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openTicket(ticket.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </>
      )}
    </div>
  );
};
