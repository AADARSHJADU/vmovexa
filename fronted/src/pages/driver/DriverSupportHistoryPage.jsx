import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { TicketConversation } from '../../components/TicketConversation';
import { useSupport } from '../../hooks/shared/useSupport';
import { useTranslation } from '../../hooks/useTranslation';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverSupportHistoryPage = () => {
  const { t } = useTranslation();
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  useEffect(() => {
    loadMyTickets().catch(() => {});
  }, [loadMyTickets]);

  const supportTickets = useMemo(
    () => (Array.isArray(myTickets) ? myTickets : (myTickets?.rows || myTickets?.items || [])),
    [myTickets]
  );

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [openId, setOpenId] = useState(null);

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

  // Normalise support tickets into card shape.
  const supportCards = useMemo(
    () =>
      supportTickets.map((t) => ({
        id: t.id,
        code: t.code ?? t.id,
        title: t.subject ?? '—',
        category: t.category ?? '—',
        status: t.status || 'open',
        date: t.created_at ? new Date(t.created_at).toLocaleString() : '—',
        description: t.message || t.description || '',
        isTicket: true,
      })),
    [supportTickets]
  );

  const filterTabs = [
    { label: 'All', count: supportCards.length },
    { label: 'Open', count: supportCards.filter((t) => t.status === 'open' || t.status === 'In Progress' || t.status === 'in_progress').length },
    { label: 'Resolved', count: supportCards.filter((t) => t.status === 'Resolved' || t.status === 'resolved').length },
    { label: 'Closed', count: supportCards.filter((t) => t.status === 'Closed' || t.status === 'closed').length },
  ];

  const filteredTickets = useMemo(() => {
    return supportCards.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(t.code || t.id || '').toLowerCase().includes(q) ||
        String(t.title || '').toLowerCase().includes(q) ||
        String(t.category || '').toLowerCase().includes(q) ||
        String(t.description || '').toLowerCase().includes(q);

      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Open') return matchesSearch && (t.status === 'open' || t.status === 'In Progress' || t.status === 'in_progress');
      if (activeTab === 'Resolved') return matchesSearch && (t.status === 'Resolved' || t.status === 'resolved');
      if (activeTab === 'Closed') return matchesSearch && (t.status === 'Closed' || t.status === 'closed');
      return matchesSearch;
    });
  }, [supportCards, searchQuery, activeTab]);

  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'resolved':
      case 'Closed':
      case 'closed':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress':
      case 'in_progress':
      case 'open':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Driver', path: '/driver/dashboard' },
            { label: 'Help & Support', path: '/driver/help' },
            { label: 'Support History' },
          ]}
          className="mb-2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/driver/help"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title={t('driver.support.back')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver.support.title')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
                {t('driver.support.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation view */}
      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* Toolbar & Filter Tabs */}
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
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === tab.label ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('driver.support.search_ph')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center">
                <FleetIcons.Ticket className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('driver.support.no_tickets')}</div>
              </div>
            ) : (
              currentTickets.map((ticket) => (
                <div key={ticket.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">{ticket.code ?? ticket.id}</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{ticket.title}</h3>
                    </div>
                    {ticket.description && <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{ticket.description}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                      <span>Category: {ticket.category}</span>
                      <span>·</span>
                      <span>Date: {ticket.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(ticket.status)}`}>
                      {String(ticket.status || '').replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => openTicket(ticket.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t('common.open')}</span>
                      <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> tickets
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverSupportHistoryPage;
