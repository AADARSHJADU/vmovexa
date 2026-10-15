import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { uploadFile, uploadVideo, resolveFileUrl } from '../../api/services/upload.service';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverReportIncidentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, loadProfile, loadActiveRoute, incidents: incidentsRaw, loadIncidents, reportIncident } = useDriverApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // List Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [listSearch, setListSearch] = useState('');

  useEffect(() => {
    loadProfile().catch(() => {});
    loadActiveRoute().catch(() => {});
    loadIncidents().catch(() => {});
  }, [loadProfile, loadActiveRoute, loadIncidents]);

  const incidentsList = useMemo(() => {
    const raw = incidentsRaw;
    return Array.isArray(raw) ? raw : (raw?.incidents || raw?.items || raw?.rows || []);
  }, [incidentsRaw]);

  const filteredIncidents = useMemo(() => {
    if (!listSearch.trim()) return incidentsList;
    const q = listSearch.toLowerCase();
    return incidentsList.filter(
      (inc) =>
        String(inc.id).toLowerCase().includes(q) ||
        String(inc.incident_type || inc.type || '').toLowerCase().includes(q) ||
        String(inc.description || '').toLowerCase().includes(q) ||
        String(inc.location || '').toLowerCase().includes(q) ||
        String(inc.hospital_name || '').toLowerCase().includes(q)
    );
  }, [incidentsList, listSearch]);

  // Form State
  const [formData, setFormData] = useState({
    incidentType: 'Road Condition',
    description: '',
    location: '',
    landmark: '',
    latitude: null,
    longitude: null,
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    photos: [],
    videos: [],
    severity: 'Low',
    affectedParties: ['Driver'],
    immediateAction: '',
    contactPreference: 'Yes',
    contactNumber: '',
    // Emergency & Medical Fields
    deadCasualty: 0,
    injuredCount: 0,
    hospitalName: '',
    ambulanceAssigned: false,
    ambulanceTiming: '',
    // Assistance & Context Fields
    policeNotified: false,
    policeStationName: '',
    towingRequested: false,
    weatherConditions: 'Clear',
    roadType: 'City Street',
    trafficDisruptionLevel: 'none',
  });

  useEffect(() => {
    if (profile?.phone) {
      setFormData((prev) => (prev.contactNumber ? prev : { ...prev, contactNumber: profile.phone }));
    }
  }, [profile]);

  const incidentTypes = [
    { id: 'Accident', label: 'Accident', desc: 'Road accident or collision', icon: <FleetIcons.Alert className="w-5 h-5 text-red-600" /> },
    { id: 'Breakdown', label: 'Breakdown', desc: 'Vehicle breakdown or fault', icon: <FleetIcons.Settings className="w-5 h-5 text-amber-600" /> },
    { id: 'Road Condition', label: 'Road Condition', desc: 'Potholes, damaged road, etc.', icon: <FleetIcons.Speed className="w-5 h-5 text-blue-600" /> },
    { id: 'Traffic Issue', label: 'Traffic Issue', desc: 'Congestion, diversion, etc.', icon: <FleetIcons.Traffic className="w-5 h-5 text-purple-600" /> },
    { id: 'Passenger Issue', label: 'Passenger Issue', desc: 'Passenger complaint or issue', icon: <FleetIcons.Driver className="w-5 h-5 text-indigo-600" /> },
    { id: 'Infrastructure', label: 'Infrastructure', desc: 'Bus stop, light issues, etc.', icon: <FleetIcons.Layers className="w-5 h-5 text-teal-600" /> },
    { id: 'Safety Concern', label: 'Safety Concern', desc: 'Unsafe situation or hazard', icon: <FleetIcons.Shield className="w-5 h-5 text-rose-600" /> },
    { id: 'Other', label: 'Other', desc: 'Any other road issue', icon: <FleetIcons.Document className="w-5 h-5 text-slate-600" /> },
  ];

  const severityOptions = [
    { id: 'Low', label: 'Low', desc: 'Minor issue, no disruption', color: 'emerald' },
    { id: 'Medium', label: 'Medium', desc: 'Moderate issue, minor disruption', color: 'amber' },
    { id: 'High', label: 'High', desc: 'Major issue, service affected', color: 'orange' },
    { id: 'Critical', label: 'Critical', desc: 'Severe issue, service halted', color: 'red' },
  ];

  const affectedOptions = ['Passengers', 'Driver', 'Vehicle', 'Infrastructure', 'Other'];

  const toggleAffected = (option) => {
    if (formData.affectedParties.includes(option)) {
      setFormData({ ...formData, affectedParties: formData.affectedParties.filter((p) => p !== option) });
    } else {
      setFormData({ ...formData, affectedParties: [...formData.affectedParties, option] });
    }
  };

  // Address & Map Coordinates Change Handler
  const handleAddressChange = (addressPayload) => {
    setFormData((prev) => {
      const fullAddr = addressPayload.address || '';
      const fallbackLoc = addressPayload.city
        ? `${addressPayload.city}, ${addressPayload.state || ''}`.trim()
        : prev.location;
      const finalLoc = fullAddr || fallbackLoc;

      return {
        ...prev,
        location: finalLoc,
        address: fullAddr,
        city: addressPayload.city !== undefined ? addressPayload.city : prev.city,
        state: addressPayload.state !== undefined ? addressPayload.state : prev.state,
        pincode: addressPayload.pincode !== undefined ? addressPayload.pincode : prev.pincode,
        country: addressPayload.country !== undefined ? addressPayload.country : prev.country,
        placeId: addressPayload.placeId !== undefined ? addressPayload.placeId : prev.placeId,
        latitude: addressPayload.latitude != null ? addressPayload.latitude : prev.latitude,
        longitude: addressPayload.longitude != null ? addressPayload.longitude : prev.longitude,
      };
    });
  };

  // GPS Location Handler
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('GPS Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        handleAddressChange({
          address: formData.address || formData.location,
          latitude: lat,
          longitude: lng,
        });
        setDetectingGps(false);
        toast.success(`GPS Location captured (${lat}, ${lng})`);
      },
      (err) => {
        setDetectingGps(false);
        toast.error(err.message || 'Unable to retrieve GPS coordinates');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Multiple Image Upload Handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    const loadingToast = toast.loading(`Uploading ${files.length} photo(s)...`);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadFile(file, 'incident_photo');
        const url = typeof res === 'string' ? res : (res?.url || res?.fileUrl || res?.path);
        if (url) uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls],
      }));
      toast.dismiss(loadingToast);
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.message || 'Failed to upload image files.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Multiple Video Upload Handler
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingVideo(true);
    const loadingToast = toast.loading(`Uploading ${files.length} video(s)...`);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        let res;
        try {
          res = await uploadVideo(file);
        } catch {
          res = await uploadFile(file, 'incident_video');
        }
        const url = typeof res === 'string' ? res : (res?.url || res?.fileUrl || res?.path);
        if (url) uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls],
      }));
      toast.dismiss(loadingToast);
      toast.success(`${uploadedUrls.length} video(s) uploaded successfully!`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.message || 'Failed to upload video files.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const removePhoto = (idx) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const removeVideo = (idx) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
    }));
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      incidentType: formData.incidentType,
      description: formData.description,
      location: formData.location || formData.address || (formData.city ? `${formData.city}, ${formData.state || ''}`.trim() : ''),
      landmark: formData.landmark,
      latitude: formData.latitude,
      longitude: formData.longitude,
      severity: formData.severity,
      affectedParties: formData.affectedParties,
      immediateAction: formData.immediateAction,
      contactPreference: formData.contactPreference,
      contactNumber: formData.contactNumber,
      photos: formData.photos,
      photosCount: formData.photos.length,
      videos: formData.videos,
      videosCount: formData.videos.length,
      deadCasualty: formData.deadCasualty,
      injuredCount: formData.injuredCount,
      hospitalName: formData.hospitalName,
      ambulanceAssigned: formData.ambulanceAssigned,
      ambulanceTiming: formData.ambulanceTiming,
      policeNotified: formData.policeNotified,
      policeStationName: formData.policeStationName,
      towingRequested: formData.towingRequested,
      weatherConditions: formData.weatherConditions,
      roadType: formData.roadType,
      trafficDisruptionLevel: formData.trafficDisruptionLevel,
    };

    setSubmitting(true);
    try {
      const createdIncident = await toast.promise(reportIncident(payload), {
        loading: 'Submitting incident report & notifying managers...',
        success: 'Incident reported successfully to Control Room & Admins!',
        error: (err) => err?.message || 'Failed to submit incident report',
      });
      loadIncidents().catch(() => {});
      navigate('/driver/report/success', { state: { incident: createdIncident } });
    } catch {
      /* toast handles error UI */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Incidents', path: '/driver/incidents' },
              { label: 'Report Incident' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 mt-1">
            <Link
              to="/driver/dashboard"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Back to Dashboard"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver_incident.report_incident', 'Report Incident')}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {t('driver_incident.hero_desc', 'Emergency road incident reporting system for driver safety & dispatch coordination')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/driver/incidents"
            className="px-3.5 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-transparent dark:border-zinc-700"
          >
            <FleetIcons.Alert className="w-4 h-4 text-red-400" />
            <span>View Incidents Log ({incidentsList.length})</span>
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full">
            Step {currentStep} of 4
          </span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Incident Type', desc: 'Category & Weather' },
            { step: 2, title: 'GPS & Media', desc: 'Location, Photos & Video' },
            { step: 3, title: 'Medical & Severity', desc: 'Casualties & Assistance' },
            { step: 4, title: 'Review & Submit', desc: 'Dispatch Confirmation' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                currentStep === s.step
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white text-slate-900 dark:text-blue-600'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {currentStep > s.step ? <FleetIcons.Check className="w-3.5 h-3.5 text-white" /> : s.step}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: INCIDENT TYPE, DESCRIPTION & ROAD CONDITIONS */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('driver_incident.step_1_title', '1. Select Incident Category *')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('driver_incident.step_1_sub', 'Choose the primary event category and road environment context')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {incidentTypes.map((type) => {
              const isSelected = formData.incidentType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, incidentType: type.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white w-fit shadow-xs">{type.icon}</div>
                  <div className="mt-3">
                    <div className="text-xs font-bold leading-tight">{type.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {type.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('driver_incident.description_req', 'Incident Description *')}</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                placeholder={t('driver_incident.desc_placeholder', 'Provide detailed information about what occurred on the road...')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('driver_incident.weather_conditions', 'Weather Conditions')}</label>
                <select
                  value={formData.weatherConditions}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Clear">{t('driver_incident.weather_clear', '☀️ Clear / Daylight')}</option>
                  <option value="Heavy Rain">{t('driver_incident.weather_rain', '🌧️ Heavy Rain / Downpour')}</option>
                  <option value="Fog / Smog">{t('driver_incident.weather_fog', '🌫️ Heavy Fog / Smog')}</option>
                  <option value="Night / Dark">{t('driver_incident.weather_night', '🌙 Night / Low Visibility')}</option>
                  <option value="Storm / Wind">{t('driver_incident.weather_storm', '🌩️ Storm / High Winds')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('driver_incident.road_type', 'Road Type')}</label>
                <select
                  value={formData.roadType}
                  onChange={(e) => setFormData({ ...formData, roadType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="City Street">{t('driver_incident.road_city', '🏙️ City Street / Arterial')}</option>
                  <option value="Express Highway">{t('driver_incident.road_highway', '🛣️ Express Highway / Tollway')}</option>
                  <option value="Flyover Bridge">{t('driver_incident.road_flyover', '🌉 Flyover / Bridge Ramp')}</option>
                  <option value="Bus Stop Bay">{t('driver_incident.road_stop', '🚏 Bus Stop / Terminal')}</option>
                  <option value="Depot Junction">{t('driver_incident.road_depot', '🏢 Bus Depot Premises')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('driver_incident.date_time', 'Date & Time')}</label>
                <input
                  type="text"
                  readOnly
                  value={formData.dateTime}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {t('driver_incident.next_location_media', 'Next: Location & Media →')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & MULTI-MEDIA (PHOTOS & VIDEOS) */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('driver_incident.step_2_title', '2. GPS Location & Multi-Media Evidence')}</h2>
              <p className="text-xs text-slate-500 font-medium">{t('driver_incident.step_2_sub', 'Capture exact GPS coordinates, photos, and video recordings')}</p>
            </div>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              📍 {detectingGps ? 'Detecting GPS...' : 'Auto-Detect GPS Location'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Google Places Autocomplete + Interactive Leaflet/Google Map */}
            <DriverAddressPicker
              addressData={{
                address: formData.address || formData.location,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country,
                placeId: formData.placeId,
                latitude: formData.latitude,
                longitude: formData.longitude,
              }}
              onChange={handleAddressChange}
              disabled={submitting}
              searchLabel="Search Incident Spot / Highway / Landmark (Google Places API)"
              searchPlaceholder="Search road name, highway KM, junction, area, or landmark in India..."
              searchHint="Search incident spot live via Google Places API or click/drag the pin on the map to pinpoint exact road location."
              pinEmoji="🚨"
              pinColor="#dc2626"
              pinLabel="Incident Spot"
              addressLabel="Incident Location / Road Address *"
              addressPlaceholder="e.g. Near SV Road Junction, Bandra West, Mumbai"
            />

            {/* Landmark & Physical Cues */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t('driver_incident.landmark_marker', 'Nearest Landmark / Specific Highway Marker')}
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder={t('driver_incident.landmark_ph', 'e.g. Pillar #14, Toll Gate #2, Opposite HP Petrol Pump, Signal Junction')}
              />
              <p className="text-[11px] text-slate-500">
                {t('driver_incident.landmark_hint', 'Add nearby visual markers for rapid emergency responders, ambulance, and towing team navigation.')}
              </p>
            </div>

            {/* Photos Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Incident Photos ({formData.photos.length} Attached)</label>
                <span className="text-[11px] text-slate-400">{t('driver_incident.multiple_images_allowed', 'Multiple images allowed')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.photos.map((photo, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group h-28 bg-slate-900">
                    <img src={resolveFileUrl(photo)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded">
                      Img #{idx + 1}
                    </span>
                  </div>
                ))}

                <label className={`h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer p-3 transition-colors ${
                  uploadingImage ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <FleetIcons.Camera className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-[11px] font-bold">{uploadingImage ? 'Uploading...' : '+ Add Photos'}</span>
                </label>
              </div>
            </div>

            {/* Videos Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Video Recordings ({formData.videos.length} Attached)</label>
                <span className="text-[11px] text-slate-400">{t('driver_incident.video_clips_hint', 'Attach MP4 / WebM video clips')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.videos.map((vid, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group h-28 bg-black">
                    <video src={resolveFileUrl(vid)} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold z-10"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-amber-400 text-[9px] font-bold rounded">
                      Video #{idx + 1}
                    </span>
                  </div>
                ))}

                <label className={`h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer p-3 transition-colors ${
                  uploadingVideo ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50 text-purple-700'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    disabled={uploadingVideo}
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <span className="text-xl mb-1">🎥</span>
                  <span className="text-[11px] font-bold">{uploadingVideo ? 'Uploading...' : '+ Add Video'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {t('driver_incident.back_btn', '← Back')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formData.location && !formData.address) {
                  toast.error('Please specify or pin the incident location.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {t('driver_incident.next_medical', 'Next: Medical & Emergency →')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MEDICAL EMERGENCY, CASUALTIES & POLICE ASSISTANCE */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('driver_incident.step_3_title', '3. Incident Severity, Medical & Emergency Details')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('driver_incident.step_3_sub', 'Record casualty stats, hospitalizations, ambulance & police dispatch needs')}</p>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{t('driver_incident.severity_req', 'Incident Disruption Severity *')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {severityOptions.map((sev) => {
                const isSelected = formData.severity === sev.id;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{sev.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{sev.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medical & Casualty Emergency Box */}
          <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
              <span>🚑</span>
              <span>{t('driver_incident.medical_details', 'Emergency Medical & Casualty Details')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('driver_incident.fatalities_label', 'Fatalities / Fatal Casualties')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.deadCasualty}
                  onChange={(e) => setFormData({ ...formData, deadCasualty: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3.5 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('driver_incident.injured_label', 'Injured / Hospitalized Count')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.injuredCount}
                  onChange={(e) => setFormData({ ...formData, injuredCount: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('driver_incident.admitted_hospital', 'Admitted Hospital Name')}</label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  placeholder={t('driver_incident.admitted_hospital_ph', 'e.g. Cooper Municipal Hospital')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-red-200/60 pt-3">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-red-100">
                <span className="text-xs font-bold text-slate-800">{t('driver_incident.ambulance_assigned', 'Ambulance Assigned / Dispatched?')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ambulanceAssigned: !formData.ambulanceAssigned })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    formData.ambulanceAssigned ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {formData.ambulanceAssigned ? 'YES' : 'NO'}
                </button>
              </div>

              {formData.ambulanceAssigned && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('driver_incident.ambulance_dispatch_time', 'Ambulance Dispatch / Arrival Time')}</label>
                  <input
                    type="text"
                    value={formData.ambulanceTiming}
                    onChange={(e) => setFormData({ ...formData, ambulanceTiming: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    placeholder={t('driver_incident.ambulance_time_ph', 'e.g. Dispatched 14:15 · ETA 8 mins')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Police & Towing Assistance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{t('driver_incident.police_notified_fir', 'Police Notified / FIR')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, policeNotified: !formData.policeNotified })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    formData.policeNotified ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {formData.policeNotified ? 'YES' : 'NO'}
                </button>
              </div>
              {formData.policeNotified && (
                <input
                  type="text"
                  value={formData.policeStationName}
                  onChange={(e) => setFormData({ ...formData, policeStationName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none mt-1"
                  placeholder={t('driver_incident.police_fir_ph', 'Police Station Name / FIR #')}
                />
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">{t('driver_incident.towing_assistance', 'Towing Assistance')}</span>
                <p className="text-[10px] text-slate-500">{t('driver_incident.towing_request_hint', 'Request roadside tow truck')}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, towingRequested: !formData.towingRequested })}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  formData.towingRequested ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {formData.towingRequested ? 'REQUESTED' : 'NO'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('driver_incident.traffic_disruption_lvl', 'Traffic Disruption Level')}</label>
              <select
                value={formData.trafficDisruptionLevel}
                onChange={(e) => setFormData({ ...formData, trafficDisruptionLevel: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
              >
                <option value="none">{t('driver_incident.traffic_none', '🟢 None / Normal Flow')}</option>
                <option value="minor_delay">🟡 Minor Delay (&lt; 10 mins)</option>
                <option value="lane_blocked">{t('driver_incident.traffic_single_lane', '🟠 Single Lane Blocked')}</option>
                <option value="total_gridlock">{t('driver_incident.traffic_total_gridlock', '🔴 Total Road Gridlock / Blocked')}</option>
              </select>
            </div>
          </div>

          {/* Affected Parties Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{t('driver_incident.who_affected', 'Who was affected? (Select all that apply)')}</label>
            <div className="flex flex-wrap gap-2">
              {affectedOptions.map((opt) => {
                const isChecked = formData.affectedParties.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAffected(opt)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '} {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {t('driver_incident.back_btn', '← Back')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              {t('driver_incident.next_review', 'Next: Review Report →')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('driver_incident.step_4_title', 'Review Your Emergency Incident Report')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('driver_incident.step_4_sub', 'Please verify all information before submitting to control room dispatch')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_category', 'Incident Category:')}</span>
              <span className="font-bold text-slate-900">{formData.incidentType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_desc', 'Description:')}</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{formData.description || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_loc_gps', 'Location & GPS:')}</span>
              <span className="font-bold text-slate-800 text-right">
                {formData.location} {formData.latitude && `(${formData.latitude}, ${formData.longitude})`}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_severity', 'Disruption Severity:')}</span>
              <span className="font-bold text-red-600">● {formData.severity}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_media', 'Attached Media:')}</span>
              <span className="font-bold text-slate-800">
                {formData.photos.length} Photo(s) · {formData.videos.length} Video(s)
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-400">{t('driver_incident.review_casualties', 'Medical Casualties:')}</span>
              <span className="font-bold text-red-700">
                {formData.deadCasualty} Fatalities · {formData.injuredCount} Injured ({formData.hospitalName || 'No hospital specified'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('driver_incident.review_assistance', 'Assistance Requested:')}</span>
              <span className="font-medium text-slate-800">
                Ambulance: {formData.ambulanceAssigned ? 'YES' : 'NO'} | Police: {formData.policeNotified ? 'YES' : 'NO'} | Towing: {formData.towingRequested ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              {t('driver_incident.back_btn', '← Back')}
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{submitting ? 'Submitting Report...' : 'Submit Incident Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* REPORTED INCIDENTS HISTORY MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>📋</span>
                  <span>{t('driver_incident.history_title', 'Reported Incidents History')}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {t('driver_incident.history_sub', 'View full details, GPS coordinates, media evidence, and medical stats for all reported incidents')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowListModal(false);
                  setSelectedIncident(null);
                }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {selectedIncident ? (
                /* DETAILED VIEW FOR SELECTED INCIDENT */
                <div className="space-y-6 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    {t('driver_incident.back_to_list', '← Back to Incident List')}
                  </button>

                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Incident #{selectedIncident.id}</span>
                        <h3 className="text-lg font-black">{selectedIncident.incident_type || selectedIncident.incidentType || 'Incident'}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        (selectedIncident.severity || 'low').toLowerCase() === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : (selectedIncident.severity || 'low').toLowerCase() === 'high'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        ● {selectedIncident.severity || 'low'} Severity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('driver_incident.location_address', 'Location & Address')}</span>
                        <span className="font-medium text-slate-200">{selectedIncident.location || '—'} ({selectedIncident.landmark || 'No landmark'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('driver_incident.gps_coords', 'GPS Coordinates')}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {selectedIncident.latitude && selectedIncident.longitude
                            ? `📍 ${selectedIncident.latitude}, ${selectedIncident.longitude}`
                            : 'GPS Not Recorded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Medical & Casualty Card */}
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                      <span>🚑</span> {t('driver_incident.medical_status_hdr', 'Medical & Assistance Status')}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-red-100">
                        <span className="text-[10px] text-slate-500 font-medium block">Fatalities</span>
                        <span className="text-base font-black text-red-700">{selectedIncident.dead_casualty || 0}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-red-100">
                        <span className="text-[10px] text-slate-500 font-medium block">Injured Count</span>
                        <span className="text-base font-black text-amber-700">{selectedIncident.injured_count || 0}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-red-100">
                        <span className="text-[10px] text-slate-500 font-medium block">{t('driver_incident.admitted_hospital', 'Admitted Hospital')}</span>
                        <span className="text-xs font-bold text-slate-900 truncate block">{selectedIncident.hospital_name || 'None'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-red-100">
                        <span className="text-[10px] text-slate-500 font-medium block">Ambulance</span>
                        <span className="text-xs font-bold text-slate-900 block">
                          {selectedIncident.ambulance_assigned ? `Yes (${selectedIncident.ambulance_timing || 'Assigned'})` : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Photos Grid */}
                  {Array.isArray(selectedIncident.photos) && selectedIncident.photos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-2">Photo Evidence ({selectedIncident.photos.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {selectedIncident.photos.map((p, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-900">
                            <img src={resolveFileUrl(p)} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos Grid */}
                  {Array.isArray(selectedIncident.videos) && selectedIncident.videos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-2">Video Evidence ({selectedIncident.videos.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedIncident.videos.map((v, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 h-32 bg-black">
                            <video src={resolveFileUrl(v)} controls className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* LIST VIEW OF ALL REPORTED INCIDENTS */
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('driver_incident.search_ph', 'Search incidents by ID, category, location or hospital...')}
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {filteredIncidents.length === 0 ? (
                    <div className="py-12 text-center">
                      <span className="text-3xl mb-2 block">📄</span>
                      <p className="text-xs font-bold text-slate-700">{t('driver_incident.no_incidents_yet', 'No incidents reported yet')}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t('driver_incident.no_incidents_hint', 'Use the 4-step wizard behind to report a road emergency')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredIncidents.map((inc) => (
                        <div
                          key={inc.id}
                          onClick={() => setSelectedIncident(inc)}
                          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-blue-700">#{inc.id}</span>
                              <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                {inc.incident_type || inc.incidentType || 'Incident'}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                (inc.severity || 'low').toLowerCase() === 'critical'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {inc.severity || 'low'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{inc.description || 'No description provided'}</p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                              <span>📍 {inc.location || '—'}</span>
                              <span>·</span>
                              <span>🚑 Fatalities: {inc.dead_casualty || 0} | Injured: {inc.injured_count || 0}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-xs font-bold text-slate-700 transition-colors shrink-0 self-start sm:self-center"
                          >
                            View Details →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowListModal(false);
                  setSelectedIncident(null);
                }}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReportIncidentPage;
