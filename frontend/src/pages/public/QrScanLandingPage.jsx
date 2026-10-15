import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

const ASPECTS = [
  { key: 'driverRating', label: 'Driver' },
  { key: 'busRating', label: 'Bus' },
  { key: 'serviceRating', label: 'Service' },
];

function StarRow({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div role="radiogroup" aria-label={`${label} rating`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} star`}
            onClick={() => onChange(n)}
            style={{
              fontSize: 28,
              lineHeight: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: value >= n ? '#f5b301' : '#cbd5e1',
              padding: '0 2px',
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export const QrScanLandingPage = () => {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landing, setLanding] = useState(null);
  const [ratings, setRatings] = useState({ driverRating: 0, busRating: 0, serviceRating: 0 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
        const msg = err?.response?.data?.message || err?.message || 'This QR code is invalid or inactive.';
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [code]);

  const setRating = (key, n) => setRatings((r) => ({ ...r, [key]: n }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const a of ASPECTS) {
      if (!ratings[a.key] || ratings[a.key] < 1 || ratings[a.key] > 5) {
        toast.error(`Please rate the ${a.label.toLowerCase()} (1-5).`);
        return;
      }
    }
    if (comment.length > 1000) {
      toast.error('Comment must be at most 1000 characters.');
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
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const wrap = { maxWidth: 480, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' };

  if (loading) return <div style={wrap}>Loading…</div>;

  if (error) {
    return (
      <div style={wrap}>
        <h2>QR Code Unavailable</h2>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={wrap}>
        <h2>Thank you! 🎉</h2>
        <p>Your feedback for {landing?.campaign?.title || 'this campaign'} has been recorded.</p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h2 style={{ marginBottom: 4 }}>{landing?.campaign?.brandName || landing?.campaign?.title || 'Rate your ride'}</h2>
      {landing?.campaign?.description && (
        <p style={{ color: '#475569', marginTop: 0 }}>{landing.campaign.description}</p>
      )}
      <p style={{ color: '#64748b', fontSize: 14 }}>
        Scan successful. Please rate the driver, the bus, and the overall service.
      </p>
      <form onSubmit={handleSubmit}>
        {ASPECTS.map((a) => (
          <StarRow key={a.key} label={a.label} value={ratings[a.key]} onChange={(n) => setRating(a.key, n)} />
        ))}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="qr-comment" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Comment (optional)
          </label>
          <textarea
            id="qr-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }}
            placeholder="Share anything about your experience…"
          />
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>{comment.length}/1000</div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: submitting ? '#94a3b8' : '#2563eb',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default QrScanLandingPage;
