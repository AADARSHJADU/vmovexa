import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminTechnicianRequest } from '../../hooks/admin/useAdminTechnicianRequest';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const RATING_LABELS = {
  1: '1 Star — Unsatisfactory / Incomplete Repair',
  2: '2 Stars — Below Expectations / Delays Experienced',
  3: '3 Stars — Good / Satisfactory Resolution',
  4: '4 Stars — Very Good & Prompt Engineering Service',
  5: '5 Stars — Exceptional Quality, Speed & Professionalism',
};

const SUGGESTED_TAGS = [
  'Punctual SLA',
  'Fast Issue Resolution',
  'High Technical Skill',
  'Clear Communication',
  'Neat Wiring & Display Calibration',
  'Thorough Hardware Testing',
  'Clean On-Site Protocol',
  'Zero Rekeying Required',
];

export const RateTechnicianPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDriverPortal = location.pathname.startsWith('/driver');
  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isDriverPortal
    ? '/driver/work-orders'
    : isFleetPortal
      ? '/fleet-operator/technician-requests'
      : '/admin/technician-requests';
  const { user } = useAuth();

  const { loadWorkOrderDetail, rateTechnician } = useAdminTechnicianRequest();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      loadWorkOrderDetail(id)
        .then((res) => {
          if (res) {
            setRequest(res);
            if (res.rating) {
              setRating(res.rating);
            }
            if (res.rating_comment) {
              setComment(res.rating_comment);
            }
            if (Array.isArray(res.rating_tags)) {
              setSelectedTags(res.rating_tags);
            }
          } else {
            toast.error(t('ag.admin.ratetechnicianpage.technician_request_not_found', 'Technician request not found'));
            navigate(basePath);
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load technician request details');
          navigate(basePath);
        })
        .finally(() => setLoading(false));
    }
  }, [id, loadWorkOrderDetail, navigate, basePath]);

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
      toast.error(t('ag.admin.ratetechnicianpage.please_select_a_star_rating_between_', 'Please select a star rating between 1 and 5'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment: comment.trim() || null,
        tags: selectedTags,
      };

      await rateTechnician(id, payload);
      toast.success(t('ag.admin.ratetechnicianpage.technician_rating_submitted_successf', 'Technician rating submitted successfully!'));
      navigate(`${basePath}/${id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <FleetIcons.Star className="w-5 h-5 text-amber-500" filled />
        </div>
        <div className="text-slate-600 dark:text-zinc-300 font-bold text-sm">
          {t('ag.admin.ratetechnicianpage.loading_ticket_and_technician_details', 'Loading ticket & technician details...')}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
        <div className="text-slate-400 font-bold text-sm">{t('admin.tech_requests.order_not_found')}</div>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          {t('ag.admin.ratetechnicianpage.back_to_technician_requests', 'Back to Technician Requests')}
        </Link>
      </div>
    );
  }

  const reqNo = request.code || `WO-${request.id}`;
  const tech = request.technician || request.assignedTech;
  const statusKey = (request.status || '').toLowerCase();
  const isResolvedOrClosed = ['resolved', 'closed'].includes(statusKey);
  const isRequester = Boolean(
    isDriverPortal ||
    (request && request.capabilities?.canRate) ||
    (request && user && (
      (request.requested_by_user_id && Number(request.requested_by_user_id) === Number(user.id)) ||
      (request.organization_id && (
        Number(request.organization_id) === Number(user.organization_id) ||
        Number(request.organization_id) === Number(user.organization?.id) ||
        Number(request.organization_id) === Number(user.tenant_id)
      )) ||
      (isFleetPortal && (user.role_id === 2 || String(user.role?.code || '').includes('TENANT')))
    ))
  );

  // Security gate check
  if (!isResolvedOrClosed) {
    return (
      <div className="w-full space-y-6">
        <Breadcrumb
          items={[
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.driver', 'Driver') : isFleetPortal ? t('ag.admin.ratetechnicianpage.fleet_operator', 'Fleet Operator') : t('ag.admin.ratetechnicianpage.organization_admin', 'Organization Admin'), path: isDriverPortal ? '/driver/dashboard' : isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.work_orders', 'Work Orders') : t('ag.admin.ratetechnicianpage.technician_requests', 'Technician Requests'), path: basePath },
            { label: reqNo, path: `${basePath}/${id}` },
            { label: t('ag.admin.ratetechnicianpage.rate_technician', 'Rate Technician') },
          ]}
          className="mb-2"
        />

        <div className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
            <FleetIcons.Clock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            {t('ag.admin.ratetechnicianpage.ticket_resolution_pending', 'Ticket Resolution Pending')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {t('admin.tech_requests.resolution_pending_help')} ({t('admin.tech_requests.current_ticket_status')} <strong className="capitalize text-slate-800 dark:text-zinc-200">{statusKey.replace(/_/g, ' ')}</strong>).
          </p>
          <Link
            to={`${basePath}/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.tech_requests.return_to_order')}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!isRequester) {
    return (
      <div className="w-full space-y-6">
        <Breadcrumb
          items={[
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.driver', 'Driver') : isFleetPortal ? t('ag.admin.ratetechnicianpage.fleet_operator', 'Fleet Operator') : t('ag.admin.ratetechnicianpage.organization_admin', 'Organization Admin'), path: isDriverPortal ? '/driver/dashboard' : isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.work_orders', 'Work Orders') : t('ag.admin.ratetechnicianpage.technician_requests', 'Technician Requests'), path: basePath },
            { label: reqNo, path: `${basePath}/${id}` },
            { label: t('ag.admin.ratetechnicianpage.rate_technician', 'Rate Technician') },
          ]}
          className="mb-2"
        />

        <div className="w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto">
            <FleetIcons.Key className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            {t('ag.admin.ratetechnicianpage.unauthorized_to_rate', 'Unauthorized to Rate')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {t('ag.admin.ratetechnicianpage.only_the_organization_or_client_that_request', 'Only the organization or client that requested this work order is authorized to rate the assigned technician.')}
          </p>
          <Link
            to={`${basePath}/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.tech_requests.return_to_order')}</span>
          </Link>
        </div>
      </div>
    );
  }

  // STRICT USER RULE: Only one-time rating allowed. If already rated, block re-rating.
  if (request.rating !== null && request.rating !== undefined) {
    return (
      <div className="w-full space-y-6">
        <Breadcrumb
          items={[
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.driver', 'Driver') : isFleetPortal ? t('ag.admin.ratetechnicianpage.fleet_operator', 'Fleet Operator') : t('ag.admin.ratetechnicianpage.organization_admin', 'Organization Admin'), path: isDriverPortal ? '/driver/dashboard' : isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
            { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.work_orders', 'Work Orders') : t('ag.admin.ratetechnicianpage.technician_requests', 'Technician Requests'), path: basePath },
            { label: reqNo, path: `${basePath}/${id}` },
            { label: t('ag.admin.ratetechnicianpage.rating_already_submitted', 'Rating Already Submitted') },
          ]}
          className="mb-2"
        />

        <div className="w-full bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <FleetIcons.Check className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            {t('ag.admin.ratetechnicianpage.rating_already_submitted', 'Rating Already Submitted')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
            {t('ag.admin.ratetechnicianpage.this_work_order_has_already_been_rated_with', 'This work order has already been rated with')} <strong className="text-amber-500 font-bold">{request.rating} {t('ag.admin.ratetechnicianpage.stars', 'Stars')}</strong> {t('ag.admin.ratetechnicianpage.on', 'on')} {request.rated_at ? new Date(request.rated_at).toLocaleDateString('en-IN') : t('ag.admin.ratetechnicianpage.record', 'record')}{t('ag.admin.ratetechnicianpage.ratings_can_only_be_given_once_and_cannot_be', '. Ratings can only be given once and cannot be modified.')}
          </p>
          <div className="pt-2">
            <Link
              to={`${basePath}/${id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('admin.tech_requests.return_to_order')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20 min-w-0 max-w-full">
      {/* 1. Global Standard Breadcrumb */}
      <Breadcrumb
        items={[
          { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.driver', 'Driver') : isFleetPortal ? t('ag.admin.ratetechnicianpage.fleet_operator', 'Fleet Operator') : t('ag.admin.ratetechnicianpage.organization_admin', 'Organization Admin'), path: isDriverPortal ? '/driver/dashboard' : isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
          { label: isDriverPortal ? t('ag.admin.ratetechnicianpage.work_orders', 'Work Orders') : t('ag.admin.ratetechnicianpage.technician_requests', 'Technician Requests'), path: basePath },
          { label: reqNo, path: `${basePath}/${id}` },
          { label: t('admin.tech_requests.rate_technician_btn') },
        ]}
        className="mb-2"
      />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{request.rating ? t('ag.admin.ratetechnicianpage.update_technician_rating', 'Update Technician Rating') : t('ag.admin.ratetechnicianpage.rate_technician_experience', 'Rate Technician Experience')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <FleetIcons.Star className="w-3.5 h-3.5 text-amber-500" filled />
              <span>{displayRating}.0 / 5.0</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.admin.ratetechnicianpage.submit_your_verified_performance_review_reso', 'Submit your verified performance review, resolution speed, and quality score for technician')} <strong className="text-slate-800 dark:text-white">{tech?.name || 'Assigned Technician'}</strong>
          </p>
        </div>

        <Link
          to={`${basePath}/${id}`}
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.tech_requests.back_to_request')}</span>
        </Link>
      </div>

      {/* 3. Ticket & Technician Summary Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('ag.admin.ratetechnicianpage.assigned_technician', 'Assigned Technician')}
          </span>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
            {tech?.name || 'Technician'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {tech?.phone || tech?.email || 'Central NOC Pool'}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            {t('ag.admin.ratetechnicianpage.target_vehicle_and_depot', 'Target Vehicle & Depot')}
          </span>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate flex items-center gap-1.5">
            <FleetIcons.Bus className="w-3.5 h-3.5" />
            <span>{request.bus_number || request.vehicle?.bus_number || 'Transit Bus'}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {request.depot_name || request.depot?.name || 'Depot Hub'}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            {t('ag.admin.ratetechnicianpage.issue_category', 'Issue Category')}
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {request.issue_category || 'Hardware Issue'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {t('ag.admin.ratetechnicianpage.urgency', 'Urgency:')} <strong className="capitalize">{request.urgency || 'Normal'}</strong>
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            {t('ag.admin.ratetechnicianpage.resolution_status', 'Resolution Status')}
          </span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <FleetIcons.Check className="w-4 h-4" />
            <span>{t('admin.tech_requests.status_resolved')}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {request.resolved_at ? new Date(request.resolved_at).toLocaleString('en-IN') : t('ag.admin.ratetechnicianpage.completed', 'Completed')}
          </p>
        </div>
      </div>

      {/* 4. Main Interactive Rating Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Section 1: 5-Star Interactive Rating Selector */}
        <div className="text-center space-y-3 bg-gradient-to-b from-amber-50/50 via-white to-transparent dark:from-amber-950/20 dark:via-zinc-900 dark:to-transparent p-6 rounded-2xl border border-amber-200/80 dark:border-amber-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            {t('ag.admin.ratetechnicianpage.overall_work_quality_and_sla_efficiency', 'Overall Work Quality & SLA Efficiency')}
          </span>

          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                title={`${star} Star Rating`}
              >
                <FleetIcons.Star
                  className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                    star <= displayRating
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.4)]'
                      : 'text-slate-200 dark:text-zinc-700 hover:text-slate-300'
                  }`}
                  filled={star <= displayRating}
                />
              </button>
            ))}
          </div>

          <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
            {RATING_LABELS[displayRating] || 'Select stars'}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            {t('ag.admin.ratetechnicianpage.click_on_any_star_to_adjust_your_score_5_sta', 'Click on any star to adjust your score. 5 stars represents prompt arrival, technical precision, and complete system testing.')}
          </p>
        </div>

        {/* Section 2: Quick Feedback Highlight Tags */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              {t('ag.admin.ratetechnicianpage.service_highlights_and_positive_strengths', 'Service Highlights & Positive Strengths')}
            </label>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('ag.admin.ratetechnicianpage.select_all_tags_that_reflect_the_technician_', 'Select all tags that reflect the technician\'s on-site performance:')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Detailed Feedback Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
              {t('ag.admin.ratetechnicianpage.detailed_engineering_and_service_feedback_op', 'Detailed Engineering & Service Feedback (Optional)')}
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {comment.length} {t('ag.admin.ratetechnicianpage.500_characters', '/ 500 characters')}
            </span>
          </div>

          <textarea
            rows={4}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('admin.tech_requests.rate_suggestions_ph')}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium leading-relaxed resize-y"
          />
        </div>

        {/* Section 4: Submission Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Link
            to={`${basePath}/${id}`}
            className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all text-center cursor-pointer"
          >
            {t('ag.admin.ratetechnicianpage.cancel_and_return', 'Cancel & Return')}
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Star className="w-4 h-4 text-white" filled />
            <span>{submitting ? t('ag.admin.ratetechnicianpage.submitting_rating', 'Submitting Rating...') : request.rating ? t('ag.admin.ratetechnicianpage.update_verified_rating', 'Update Verified Rating') : t('ag.admin.ratetechnicianpage.submit_verified_rating', 'Submit Verified Rating')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RateTechnicianPage;
