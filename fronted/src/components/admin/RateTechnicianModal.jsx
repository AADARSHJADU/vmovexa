import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';

const RATING_LABELS = {
  1: '1 Star — Unsatisfactory / Incomplete',
  2: '2 Stars — Below Expectations',
  3: '3 Stars — Good / Satisfactory Repair',
  4: '4 Stars — Very Good & Prompt Service',
  5: '5 Stars — Exceptional Quality & Efficiency',
};

const SUGGESTED_TAGS = [
  'Punctual SLA',
  'Fast Issue Resolution',
  'High Technical Skill',
  'Clear Communication',
  'Neat Wiring & Display Calibration',
  'Thorough Hardware Testing',
  'Clean On-Site Protocol',
];

export const RateTechnicianModal = ({
  isOpen,
  onClose,
  workOrder,
  onRatingSubmitted,
  rateTechnicianApi,
}) => {
  const [rating, setRating] = useState(workOrder?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(workOrder?.rating_comment || '');
  const [selectedTags, setSelectedTags] = useState(() => {
    if (Array.isArray(workOrder?.rating_tags)) return workOrder.rating_tags;
    return [];
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !workOrder) return null;

  const techName = workOrder.technician?.name || workOrder.assignedTech?.name || 'Assigned Technician';
  const code = workOrder.code || `WO-${workOrder.id}`;
  const busNumber = workOrder.bus_number || workOrder.vehicle?.bus_number || 'Transit Bus';

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a star rating from 1 to 5');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment: comment.trim() || null,
        tags: selectedTags,
      };

      const result = await rateTechnicianApi(workOrder.id, payload);
      toast.success('Technician rating submitted successfully!');
      if (onRatingSubmitted) {
        onRatingSubmitted(result || { ...workOrder, ...payload });
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shadow-xs">
              <FleetIcons.Star className="w-5 h-5 text-amber-500" filled />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Rate Technician Experience
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                {techName} • <span className="font-mono">{code}</span> ({busNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
          >
            <FleetIcons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Star Rating Selector */}
          <div className="text-center space-y-2 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
              Overall Work Quality & SLA
            </span>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                  title={`${star} Star`}
                >
                  <FleetIcons.Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]'
                        : 'text-slate-300 dark:text-zinc-700'
                    }`}
                    filled={star <= displayRating}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 min-h-[1.25rem]">
              {RATING_LABELS[displayRating] || 'Select stars'}
            </div>
          </div>

          {/* 2. Quick Tags Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Service Highlights (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Written Feedback Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Detailed Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your on-site repair experience, technician responsiveness, hardware behavior, etc..."
              className="w-full p-3 bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !rating}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FleetIcons.Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FleetIcons.Star className="w-3.5 h-3.5 text-amber-300" filled />
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateTechnicianModal;
