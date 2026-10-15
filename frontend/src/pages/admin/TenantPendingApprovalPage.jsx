import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { googleApisService } from '../../api/services/googleApis.service';
import { RefreshButton } from '../../components/ui/RefreshButton';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
];

export const TenantPendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, fetchMe, logout, completeOrganizationProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-refresh fresh user & organization data on mount
  useEffect(() => {
    fetchMe().catch(() => {});
  }, [fetchMe]);

  // Determine if Google / Social user needs to complete organization profile
  const rawOrgName = user?.organization?.name || user?.org?.name || '';
  const isProfileIncomplete =
    !user?.phone ||
    !user?.organization?.city ||
    !user?.organization?.state ||
    rawOrgName === 'Pending Profile Completion' ||
    rawOrgName === 'My Organization' ||
    !rawOrgName;

  const [formData, setFormData] = useState({
    organizationName: rawOrgName === 'Pending Profile Completion' ? '' : rawOrgName,
    phone: user?.phone || '',
    state: user?.organization?.state || '',
    city: user?.organization?.city || '',
    pincode: user?.organization?.pincode || '',
    officeAddress: user?.organization?.office_address || '',
    latitude: user?.organization?.latitude || null,
    longitude: user?.organization?.longitude || null,
    cin: user?.organization?.cin || '',
    gstin: user?.organization?.gstin || '',
  });

  // Sync state when user object reloads
  useEffect(() => {
    if (user?.organization) {
      const org = user.organization;
      setFormData((prev) => ({
        ...prev,
        organizationName: org.name && org.name !== 'Pending Profile Completion' ? org.name : prev.organizationName,
        phone: user.phone || prev.phone,
        state: org.state || prev.state,
        city: org.city || prev.city,
        pincode: org.pincode || prev.pincode,
        officeAddress: org.office_address || prev.officeAddress,
        latitude: org.latitude || prev.latitude,
        longitude: org.longitude || prev.longitude,
        cin: org.cin || prev.cin,
        gstin: org.gstin || prev.gstin,
      }));
    }
  }, [user]);

  // Google Maps location search states
  const [locationQuery, setLocationQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced Google Places Search
  const handleLocationSearchChange = (text) => {
    setLocationQuery(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!text || text.trim().length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingLocation(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await googleApisService.demoPlaces({ query: text.trim() });
        const places = res?.data?.places || res?.places || [];
        setLocationSuggestions(places);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Google Places search error:', err);
        setLocationSuggestions([]);
        setShowSuggestions(true);
      } finally {
        setSearchingLocation(false);
      }
    }, 300);
  };

  // When user selects a Google Maps Place
  const handleSelectPlace = (place) => {
    const parsed = place._parsed || {};
    const fullAddress = parsed.full_address || place.formattedAddress || '';
    const city = parsed.city || place.displayName?.text || '';
    const state = parsed.state || '';
    const pincode = parsed.pincode || '';
    const lat = place.location?.latitude ?? null;
    const lng = place.location?.longitude ?? null;

    // Match state with Indian States list
    let matchedState = '';
    if (state) {
      matchedState = INDIAN_STATES.find(
        (st) =>
          st.toLowerCase() === state.toLowerCase() ||
          state.toLowerCase().includes(st.toLowerCase()) ||
          st.toLowerCase().includes(state.toLowerCase())
      ) || state;
    }

    setFormData((prev) => ({
      ...prev,
      officeAddress: fullAddress,
      city: city || prev.city,
      state: matchedState || prev.state,
      pincode: pincode || prev.pincode,
      latitude: lat,
      longitude: lng,
    }));

    setSelectedPlace({
      name: place.displayName?.text || '',
      fullAddress,
      city,
      state: matchedState || state,
      pincode,
      lat,
      lng,
    });

    const displayLabel = place.displayName?.text
      ? `${place.displayName.text} (${city ? city + ', ' : ''}${state})`
      : fullAddress;
    setLocationQuery(displayLabel);
    setShowSuggestions(false);
    toast.success('Location & coordinates captured from Google Maps!');
  };

  const orgName = rawOrgName || 'Your Fleet Enterprise';
  const orgCity = user?.organization?.city || user?.city || '—';
  const orgState = user?.organization?.state || user?.state || '—';
  const orgAddress = user?.organization?.office_address || user?.organization?.address || null;
  const orgPincode = user?.organization?.pincode || null;
  const orgLat = user?.organization?.latitude || null;
  const orgLng = user?.organization?.longitude || null;
  const adminId = user?.id || user?.code || 'VMX-ADM-PENDING';
  const adminEmail = user?.email || '—';

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const refreshed = await fetchMe();
      const currentStatus = refreshed?.user?.status || refreshed?.status;
      if (currentStatus === 'active') {
        toast.success('Congratulations! Your organization is active! Unlocking dashboard…');
        navigate('/admin/dashboard', { replace: true });
      } else if (currentStatus === 'awaiting_subscription') {
        toast.success('Approved! Please choose your subscription plan.');
        navigate('/admin/subscription', { replace: true });
      } else {
        toast('Your application is still under review by Super Admin.', { icon: '⏳' });
      }
    } catch {
      toast.error('Could not refresh status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!formData.organizationName.trim()) {
      toast.error('Please enter your Organization / Fleet Company Name.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your primary Phone Number.');
      return;
    }
    if (!formData.state) {
      toast.error('Please select your operating State.');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your operating City.');
      return;
    }

    setSubmitting(true);
    try {
      await completeOrganizationProfile({
        organizationName: formData.organizationName.trim(),
        phone: formData.phone.trim(),
        state: formData.state,
        city: formData.city.trim(),
        address: formData.officeAddress.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        cin: formData.cin.trim() || undefined,
        gstin: formData.gstin.trim() || undefined,
      });
      await fetchMe();
      toast.success('Organization profile submitted successfully! Super Admin review initiated.');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit organization details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* If profile is incomplete, render Profile Completion Form */}
      {isProfileIncomplete ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/60 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-zinc-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Step 1 of 2: Profile Completion Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Complete Your Organization Details
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                Welcome <strong className="text-slate-800 dark:text-zinc-200">{user?.name || 'Administrator'}</strong>! Your authentication via Google was successful. Search your office location with Google Maps below to auto-fill your coordinates, address, city, and state.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-6">
            {/* GOOGLE MAPS LOCATION AUTOCOMPLETE SEARCH */}
            <div className="relative space-y-2" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="text-base text-rose-500">📍</span>
                  <span>Google Maps Location Search</span>
                  <span className="text-[11px] font-normal text-slate-400 dark:text-zinc-500">(Auto-fills address, city, state, pin & GPS coordinates)</span>
                </label>
                {formData.latitude && formData.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View on Google Maps</span>
                    <span>↗</span>
                  </a>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => handleLocationSearchChange(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0 || locationQuery.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Search office location, landmark, or city via Google Maps (e.g. Vijay Nagar Indore, Bandra Mumbai)..."
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-inner"
                />
                {searchingLocation && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && locationQuery.trim().length >= 2 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in duration-150">
                  {locationSuggestions.length > 0 ? (
                    <>
                      <div className="p-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50">
                        <span>Google Places Matches ({locationSuggestions.length})</span>
                        <span className="text-blue-600 dark:text-blue-400">Click to auto-fill location</span>
                      </div>
                      {locationSuggestions.map((place) => (
                        <button
                          key={place.id || place.formattedAddress}
                          type="button"
                          onClick={() => handleSelectPlace(place)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border-b border-slate-100 dark:border-zinc-800/60 last:border-0 transition-colors flex items-start gap-3 cursor-pointer group"
                        >
                          <span className="text-base text-rose-500 mt-0.5 group-hover:scale-110 transition-transform shrink-0">📍</span>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {place.displayName?.text || place._parsed?.city || 'Location'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {place.formattedAddress}
                            </div>
                            {(place._parsed?.city || place._parsed?.state) && (
                              <div className="inline-flex items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5">
                                <span>{place._parsed?.city}</span>
                                {place._parsed?.state && <span>• {place._parsed?.state}</span>}
                                {place._parsed?.pincode && <span>• PIN: {place._parsed?.pincode}</span>}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : searchingLocation ? (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>Searching Google Maps for "{locationQuery}"...</span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
                      No Google Maps locations found for "{locationQuery}". Try typing city or landmark name.
                    </div>
                  )}
                </div>
              )}

              {/* Coordinates & Location Verification Badge */}
              {formData.latitude && formData.longitude && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="font-semibold">Google Coordinates Verified:</span>
                    <span className="font-mono text-[11px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md font-bold">
                      {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                    </span>
                    {formData.pincode && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        PIN: {formData.pincode}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, latitude: null, longitude: null }));
                      setSelectedPlace(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-red-500 underline cursor-pointer"
                  >
                    Clear coordinates
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Admin Name (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Admin Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email Address (Google Auth)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              {/* Organization Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Organization / Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Transit Corporation"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Official Phone / Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Operating State */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Operating State <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Operating State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Operating City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Operating City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Office / Street Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Office / Depot Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 402 Transit Hub, Western Express Highway"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Postal Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 400069"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* CIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">CIN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. U74999MH2026PTC123456"
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* GSTIN */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Submitting Profile…</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Request Super Admin Clearance</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Standard Awaiting Verification Dossier */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Tenant Verification Underway</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Organization Awaiting Super Admin Review
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                Your fleet enterprise account for <strong className="text-slate-800 dark:text-zinc-200">{orgName}</strong> has been logged in the system. While platform governance completes verification, your portal controls remain locked.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <RefreshButton
                onClick={handleCheckStatus}
                loading={checking}
                label="Refresh Status"
                loadingLabel="Checking Status…"
                title="Refresh and check approval status"
              />

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Onboarding Pipeline Stepper */}
          <div className="border-t border-b border-slate-100 dark:border-zinc-800 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Tenant Onboarding Pipeline
              </h2>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Stage 2 of 4 In Progress
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Step 1: Completed */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <span className="text-sm">✓</span>
                  <span>1. Form Submitted</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Enterprise details logged</p>
              </div>

              {/* Step 2: Current */}
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-3.5 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <span className="animate-spin text-xs">⏳</span>
                  <span>2. Super Admin Review</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-semibold">Under security audit</p>
              </div>

              {/* Step 3: Upcoming */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 space-y-1 opacity-60">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-bold text-xs">
                  <span>3. Plan Selection</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Subscription activation</p>
              </div>

              {/* Step 4: Final */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 space-y-1 opacity-60">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-bold text-xs">
                  <span>4. Operational Live</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Dashboard unlocked</p>
              </div>
            </div>
          </div>

          {/* Informational Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Legal Details */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <span>🏢</span>
                <span>Organization Dossier</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Legal Entity Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{orgName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned Admin ID:</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">{adminId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Primary Contact:</span>
                  <span className="text-slate-800 dark:text-zinc-200">{adminEmail}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Operating Territory:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">{orgCity}, {orgState}</span>
                </div>
                {orgAddress && (
                  <div className="flex justify-between items-start pb-2 border-b border-slate-200/80 dark:border-zinc-700/60 gap-4">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium shrink-0">Street Address:</span>
                    <span className="text-slate-800 dark:text-zinc-200 font-medium text-right break-words">{orgAddress}</span>
                  </div>
                )}
                {orgPincode && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Postal Pincode:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">{orgPincode}</span>
                  </div>
                )}
                {orgLat && orgLng && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <span>📍</span> GPS Location:
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${orgLat},${orgLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{Number(orgLat).toFixed(4)}°, {Number(orgLng).toFixed(4)}°</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Platform Isolation:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <span>🔒</span> Isolated Tenant Schema
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps / Protocol */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <span>📋</span>
                <span>Next Steps & Governance SLA</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Super Admin audits and validates organization registration in the Central Governance Console.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Upon approval, you will select your SaaS Operating Tier (Starter, Growth, or Enterprise).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Fleet management, depot assignment, drivers, and IoT edge displays will unlock immediately.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-700/60">
                <a
                  href="mailto:support@vmovexa.com?subject=Tenant%20Verification%20Inquiry"
                  className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 inline-flex items-center gap-1.5"
                >
                  <span>Need urgent verification? Contact Super Admin Desk</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Security & Isolation Notice */}
          <div className="p-3.5 bg-slate-100/70 dark:bg-zinc-800/40 rounded-xl border border-slate-200/60 dark:border-zinc-700/40 flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <span className="text-base">🔒</span>
            <span>
              Sidebar controls are temporarily locked to protect tenant data isolation and sovereign transit security protocols until account clearance is complete.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPendingApprovalPage;
