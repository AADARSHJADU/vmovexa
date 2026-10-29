import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from './FleetIcons';
import { resolveFileUrl } from '../api/services/upload.service';

/**
 * TicketConversation — the two-way support chat used by BOTH the SuperAdmin Support Desk
 * and every role's Support History page. Renders the message thread + a reply composer
 * with image/file attachments. Optionally shows a status changer for staff.
 *
 * Props:
 *  - ticket: { id, code, subject, status, priority, category, messages:[...], raiser }
 *  - onSendReply(id, { body, attachments }) : Promise
 *  - uploadFile(file) : Promise<{url,fileName,fileType,fileSize}>
 *  - onSetStatus(id, status) : Promise  (optional — shows status dropdown when provided)
 *  - onBack() : void (optional)
 */
const STATUS_OPTS = ['open', 'in_progress', 'resolved', 'closed'];

function isImage(type) { return (type || '').startsWith('image/'); }

function formatMessageTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${timeStr} · ${dateStr}`;
}

export const TicketConversation = ({ ticket, onSendReply, uploadFile, onSetStatus, onBack }) => {
  const [body, setBody] = useState('');
  const [pending, setPending] = useState([]); // [{url,fileName,fileType,fileSize}]
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  if (!ticket) return null;
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handlePickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const meta = await uploadFile(f);
        setPending((p) => [...p, meta]);
      }
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePending = (idx) => setPending((p) => p.filter((_, i) => i !== idx));

  const handleSend = async () => {
    if (!body.trim() && pending.length === 0) { toast.error('Type a message or attach a file.'); return; }
    setSending(true);
    try {
      await toast.promise(onSendReply(ticket.id, { body: body.trim(), attachments: pending }), {
        loading: 'Sending...', success: 'Reply sent', error: (e) => e?.message || 'Send failed',
      });
      setBody('');
      setPending([]);
    } catch (_) { /* */ } finally { setSending(false); }
  };

  const statusColor = (s) => ({
    open: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
  }[s] || 'bg-slate-100 text-slate-600 border-slate-200');

  const isClosed = ['resolved', 'closed'].includes(ticket?.status);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 shrink-0">←</button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">{ticket.subject}</h3>
              <span className="text-[10px] font-mono text-slate-400">{ticket.code}</span>
              {!isClosed && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Chat</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500">{ticket.category || 'General'} · Priority: {ticket.priority || 'medium'}</p>
          </div>
        </div>
        <div className="shrink-0">
          {onSetStatus ? (
            <select
              value={ticket.status}
              onChange={(e) => onSetStatus(ticket.id, e.target.value)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none ${statusColor(ticket.status)}`}
            >
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          ) : (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(ticket.status)}`}>
              {String(ticket.status || '').replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No messages yet.</p>
        )}
        {messages.map((m, idx) => {
          const staff = !!m.is_staff;
          const senderLabel = staff ? 'Support' : (m.sender?.name || 'You');
          const atts = Array.isArray(m.attachments) ? m.attachments : [];
          return (
            <div key={m.id || `msg-${idx}`} className={`flex ${staff ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${staff ? 'bg-slate-100 text-slate-800' : 'bg-blue-600 text-white'}`}>
                <div className={`text-[10px] font-bold mb-1 ${staff ? 'text-slate-500' : 'text-blue-100'}`}>
                  {senderLabel}
                </div>
                {m.body && <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.body}</p>}
                {atts.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {atts.map((a, attIdx) => {
                      const url = resolveFileUrl(a.file_url || a.url);
                      return isImage(a.file_type) ? (
                        <a key={a.id || `att-${attIdx}`} href={url} target="_blank" rel="noreferrer" className="block">
                          <img src={url} alt={a.file_name || 'image'} className="max-h-40 rounded-lg border border-black/10" />
                        </a>
                      ) : (
                        <a
                          key={a.id || `att-${attIdx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-1.5 text-[11px] font-bold underline ${staff ? 'text-blue-600' : 'text-blue-100'}`}
                        >
                          <FleetIcons.Layers className="w-3.5 h-3.5" /> {a.file_name || 'Attachment'}
                        </a>
                      );
                    })}
                  </div>
                )}
                <div className={`text-[9px] mt-1 ${staff ? 'text-slate-400' : 'text-blue-200'}`}>
                  {formatMessageTime(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer / Read-only Banner */}
      {isClosed ? (
        <div className="border-t border-slate-200 p-4 bg-slate-50/80 text-center rounded-b-2xl">
          <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
            <span>🔒 Ticket {ticket.status.replace('_', ' ')}</span>
            <span className="font-normal text-slate-500">— replies disabled</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {onSetStatus
              ? "Change status back to 'open' or 'in progress' above to re-enable live messaging."
              : "This support ticket has been resolved and closed. Further replies are disabled."}
          </p>
        </div>
      ) : (
        <div className="border-t border-slate-200 p-3 space-y-2">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pending.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] bg-slate-100 rounded-lg px-2 py-1">
                  <span className="truncate max-w-[140px]">{a.fileName}</span>
                  <button onClick={() => removePending(i)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" multiple onChange={handlePickFiles} className="hidden" id="ticket-file-input" />
            <button
              type="button"
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={uploading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 shrink-0 disabled:opacity-50"
              title="Attach image or file"
            >
              <FleetIcons.Plus className="w-4 h-4" />
            </button>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={1}
              placeholder={uploading ? 'Uploading attachment...' : 'Type your reply...'}
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || uploading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketConversation;
