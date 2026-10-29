import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { TicketConversation } from '../../components/TicketConversation';
import { useSupport } from '../../hooks/shared/useSupport';

export const GovSupportHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { myTickets, current, loadMyTickets, loadTicket, addMessage, uploadFile, clearTicket } = useSupport();

  const [openId, setOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
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

  const getStatusBadge = (status) => ({
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
  }[status] || 'bg-slate-100 text-slate-700 border-slate-200');

  return (
    <div className="w-full space-y-6 pb-12">

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
                { label: 'Support History' },
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('gov.support.raise_ticket')}</span>
          </button>
        </div>
      </div>

      {openId && current ? (
        <TicketConversation ticket={current} onSendReply={handleReply} uploadFile={uploadFile} onBack={closeConv} />
      ) : (
        <>
          {/* 2. Search & Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <FleetIcons.Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('gov.support.search_ph')}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {['All', 'Open', 'Resolved', 'Closed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tickets List */}
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
            {filtered.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FleetIcons.Ticket className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{ticket.code ?? ticket.id}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {ticket.category ?? '—'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.subject ?? '—'}</p>
                    <p className="text-xs text-slate-500 font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 self-start sm:self-center ${getStatusBadge(ticket.status)}`}>
                  ● {String(ticket.status || '').replace('_', ' ') || '—'}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-xs">
                No support tickets match the selected filter.
              </div>
            )}
          </div>

          {/* 4. Still Need Help Footer Banner */}
          <div className="w-full p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <FleetIcons.Headset className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t('gov.support.still_need_help')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('gov.support.team_ready')}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/government/help')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0 border border-slate-200"
            >
              Contact Support Desk
            </button>
          </div>
        </>
      )}
    </div>
  );
};
