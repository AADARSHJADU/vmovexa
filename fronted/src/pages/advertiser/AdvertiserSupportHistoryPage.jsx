import { useTranslation } from '../../hooks/useTranslation';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketConversation } from '../../components/TicketConversation';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useSupport } from '../../hooks/shared/useSupport';
import Breadcrumb from '../../components/ui/Breadcrumb';

const statusStyles = {
  open: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export const AdvertiserSupportHistoryPage = () => {
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
    const matchSearch = String(t.subject || '').toLowerCase().includes(q) || String(t.code || t.id || '').toLowerCase().includes(q);
    const matchTab =
      activeTab === 'All' ||
      (activeTab === 'Open' && (t.status === 'open' || t.status === 'in_progress')) ||
      (activeTab === 'Resolved' && t.status === 'resolved') ||
      (activeTab === 'Closed' && t.status === 'closed');
    return matchSearch && matchTab;
  }), [tickets, search, activeTab]);

  return (
    <div className="w-full space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.dashboard', 'Dashboard'), to: '/advertiser/dashboard' },
              { label: t('advertiser.profile.help_support'), to: '/advertiser/help' },
              { label: t('advertiser.support.title') }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">{t('advertiser.support.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('advertiser.support.desc')}</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('advertiser.support.refresh_title')}
          />
          <button
            onClick={() => navigate('/advertiser/help')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 active:scale-[0.99] transition-all shadow-sm inline-flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('advertiser.support.search_ph')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/60">
              {['All', 'Open', 'Resolved', 'Closed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List Cards */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {filtered.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{ticket.code ?? ticket.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {ticket.category ?? '—'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{ticket.subject ?? '—'}</p>
                    <p className="text-xs text-slate-500 font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ticket.status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    ● {String(ticket.status || '').replace('_', ' ') || '—'}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-xs">
                No support tickets match the selected filter.
              </div>
            )}
          </div>

          {/* Still Need Help Footer Banner */}
          <div className="w-full p-6 bg-slate-900 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold">{t('advertiser.support.still_need_help')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('advertiser.support.team_247')}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/advertiser/help')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shrink-0"
            >
              Contact Support Desk
            </button>
          </div>
        </>
      )}
    </div>
  );
};
