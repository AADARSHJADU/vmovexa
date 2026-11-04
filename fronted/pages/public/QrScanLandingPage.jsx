import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { FleetIcons } from '../../components/FleetIcons';

function StarRow({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <div className="font-bold text-xs text-slate-700 dark:text-zinc-300 mb-1.5">{label}</div>
      <div role="radiogroup" aria-label={`${label} rating`} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} star`}
            onClick={() => onChange(n)}
            className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
          >
            <FleetIcons.Star
              className={`w-7 h-7 ${value >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export const QrScanLandingPage = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landing, setLanding] = useState(null);
  const [ratings, setRatings] = useState({ driverRating: 0, busRating: 0, serviceRating: 0 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const aspects = [
    { key: 'driverRating', label: t('qr.aspect_driver', 'Driver') },
    { key: 'busRating', label: t('qr.aspect_bus', 'Bus') },
    { key: 'serviceRating', label: t('qr.aspect_service', 'Service') },
  ];

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(ENDPOINTS.QR.SCAN_LANDING(code));
        const data = res.data?.data || res.data;
        if (active) setLanding(data);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || t('qr.unavailable_title', 'This QR code is invalid or inactive.');
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [code, t]);

  const setRating = (key, n) => setRatings((r) => ({ ...r, [key]: n }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const a of aspects) {
      if (!ratings[a.key] || ratings[a.key] < 1 || ratings[a.key] > 5) {
        toast.error(t('qr.rate_aspect_prompt', 'Please rate all aspects (1-5).'));
        return;
      }
    }
    if (comment.length > 1000) {
      toast.error(t('qr.comment_too_long', 'Comment must be at most 1000 characters.'));
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.QR.REVIEW(code), {
        driverRating: ratings.driverRating,
        busRating: ratings.busRating,
        serviceRating: ratings.serviceRating,
        comment: comment || undefined,
        qrScanId: landing?.qrScanId || undefined,
      });
      setDone(true);
      toast.success(t('qr.feedback_success_toast', 'Thank you for your feedback!'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('qr.submit_error_toast', 'Could not submit review.'));
    } finally {
      setSubmitting(false);
    }
  };

  const containerClasses = "max-w-md mx-auto p-6 min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white";

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('qr.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <FleetIcons.Alert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('qr.unavailable_title')}</h2>
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={containerClasses}>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
            <FleetIcons.Check className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('qr.thank_you_title')}</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            {t('qr.feedback_recorded')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {landing?.campaign?.brandName || landing?.campaign?.title || t('qr.rate_your_ride')}
          </h2>
          {landing?.campaign?.description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{landing.campaign.description}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
            {t('qr.scan_successful_desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {aspects.map((a) => (
            <StarRow key={a.key} label={a.label} value={ratings[a.key]} onChange={(n) => setRating(a.key, n)} />
          ))}

          <div>
            <label htmlFor="qr-comment" className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('qr.comment_label')}
            </label>
            <textarea
              id="qr-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('qr.comment_placeholder')}
            />
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 text-right mt-1">{comment.length}/1000</div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('qr.submitting')}</span>
              </>
            ) : (
              <span>{t('qr.submit_rating_btn')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QrScanLandingPage;
