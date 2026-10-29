import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { usePaymentGateways } from '../../hooks/superadmin/usePaymentGateways.js';
import { useTranslation } from '../../hooks/useTranslation.js';

export const SuperPaymentGatewaysPage = () => {
  const { t } = useTranslation();
  const {
    gateways,
    selectedGateway,
    loading,
    saving,
    testing,
    testResult,
    simulating,
    simulationResult,
    fetchGateways,
    updateGateway,
    testConnection,
    simulateOrder,
    setSelectedGateway,
    setLocalField,
    resetTestResult,
    resetSimulationResult,
  } = usePaymentGateways();

  // Password / Secret visibility toggles
  const [showTestSecret, setShowTestSecret] = useState(false);
  const [showTestWebhook, setShowTestWebhook] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [showLiveWebhook, setShowLiveWebhook] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    fetchGateways().catch((err) => {
      toast.error(`Failed to load payment gateways: ${err.message}`);
    });
  }, [fetchGateways]);

  const handleSelectGateway = (providerType) => {
    setSelectedGateway(providerType);
    setShowTestSecret(false);
    setShowTestWebhook(false);
    setShowLiveSecret(false);
    setShowLiveWebhook(false);
    resetTestResult();
    resetSimulationResult();
  };

  const handleCopyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    toast.success('Webhook callback URL copied to clipboard!');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!selectedGateway) return;

    const payload = {
      name: selectedGateway.name,
      mode: selectedGateway.mode,
      is_active: selectedGateway.is_active,
      is_default: selectedGateway.is_default,
      merchant_id: selectedGateway.merchant_id || null,
      test_publishable_key: selectedGateway.test_publishable_key || null,
      test_secret_key: selectedGateway.test_secret_key || null,
      test_webhook_secret: selectedGateway.test_webhook_secret || null,
      live_publishable_key: selectedGateway.live_publishable_key || null,
      live_secret_key: selectedGateway.live_secret_key || null,
      live_webhook_secret: selectedGateway.live_webhook_secret || null,
    };

    const tid = toast.loading(`Saving ${selectedGateway.name} settings...`);
    try {
      await updateGateway(selectedGateway.id, payload).unwrap();
      toast.dismiss(tid);
      toast.success(`${selectedGateway.name} settings saved successfully!`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Failed to save gateway settings');
    }
  };

  const handleTestConnection = async () => {
    if (!selectedGateway) return;
    const tid = toast.loading(`Verifying ${selectedGateway.name} ${selectedGateway.mode?.toUpperCase()} connection...`);
    try {
      const res = await testConnection(selectedGateway.id, {
        mode: selectedGateway.mode,
        test_publishable_key: selectedGateway.test_publishable_key,
        test_secret_key: selectedGateway.test_secret_key,
        live_publishable_key: selectedGateway.live_publishable_key,
        live_secret_key: selectedGateway.live_secret_key,
      }).unwrap();
      toast.dismiss(tid);
      toast.success(res?.message || `${selectedGateway.name} connection test passed!`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Connection test failed');
    }
  };

  const handleSimulateOrder = async () => {
    if (!selectedGateway) return;
    const tid = toast.loading(`Simulating test payment order with ${selectedGateway.name}...`);
    try {
      const res = await simulateOrder(selectedGateway.id, {
        mode: selectedGateway.mode,
        amount: 500,
        test_publishable_key: selectedGateway.test_publishable_key,
        test_secret_key: selectedGateway.test_secret_key,
        live_publishable_key: selectedGateway.live_publishable_key,
        live_secret_key: selectedGateway.live_secret_key,
      }).unwrap();
      toast.dismiss(tid);
      toast.success(`${selectedGateway.name} test order simulated!`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Payment simulation failed');
    }
  };

  const gatewayList = (Array.isArray(gateways) ? gateways : []).filter(
    (gw) => String(gw.provider_type || gw.name || '').toLowerCase() === 'razorpay'
  );

  if (loading && gatewayList.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 font-medium text-sm">
          <FleetIcons.Spinner className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span>{t('superadmin.gateways.loading')}</span>
        </div>
      </div>
    );
  }

  const currentGw = selectedGateway || gatewayList[0] || {};
  const origin = window.location.origin;
  const webhookUrl = `${origin}/api/v1/billing/webhook/${currentGw.provider_type || 'gateway'}`;

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin'), to: '/superadmin/dashboard' },
          { label: t('superadmin.gateways.breadcrumb_finance'), to: '/superadmin/billing' },
          { label: t('superadmin.gateways.breadcrumb_title') },
        ]}
      />

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <span>{t('superadmin.gateways.title')}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {t('superadmin.gateways.multi_env')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('superadmin.gateways.subtitle')}
          </p>
        </div>

        {/* Top Navigation Links */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
          <Link
            to="/superadmin/settings/payment-gateways"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-zinc-700 font-bold inline-flex items-center gap-1.5"
          >
            <FleetIcons.CreditCard className="w-3.5 h-3.5" />
            <span>{t('superadmin.gateways.tab_gateways')}</span>
          </Link>
          <Link
            to="/superadmin/plans"
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
          >
            <FleetIcons.Package className="w-3.5 h-3.5" />
            <span>{t('superadmin.gateways.tab_plans')}</span>
          </Link>
          <Link
            to="/superadmin/transactions"
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
          >
            <FleetIcons.BarChart className="w-3.5 h-3.5" />
            <span>{t('superadmin.gateways.tab_transactions')}</span>
          </Link>
          <Link
            to="/superadmin/billing"
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
          >
            <FleetIcons.TrendingUp className="w-3.5 h-3.5" />
            <span>{t('superadmin.gateways.tab_billing')}</span>
          </Link>
        </div>
      </div>

      {/* Gateway Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {gatewayList.map((gw) => {
          const isSelected = (currentGw.id === gw.id) || (currentGw.provider_type === gw.provider_type);
          const isLive = gw.mode === 'live';

          return (
            <div
              key={gw.id || gw.provider_type}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectGateway(gw.provider_type)}
              className={`p-4 sm:p-5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer select-none bg-white dark:bg-zinc-900 ${
                isSelected
                  ? 'border-2 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/10'
                  : 'border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs shrink-0 text-white bg-blue-600">
                    RZ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {gw.name}
                      </h3>
                      {gw.is_default && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                      {gw.code}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    gw.is_active
                      ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/40'
                      : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                  title={gw.is_active ? 'Active' : 'Inactive'}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-semibold">
                  {gw.is_active ? 'Enabled' : 'Disabled'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                    isLive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  {isLive ? (
                    <span className="flex items-center gap-1"><FleetIcons.Rocket className="w-3 h-3" />{t('superadmin.gateways.live_mode')}</span>
                  ) : (
                    <span className="flex items-center gap-1"><FleetIcons.Flask className="w-3 h-3" />{t('superadmin.gateways.test_mode')}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Configuration Console */}
      <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden bg-white dark:bg-zinc-900">
        {/* Gateway Overview Top Banner */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs shrink-0 text-white bg-blue-600">
              RZ
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {currentGw.name} Configuration
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {currentGw.provider_type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Manage credentials, switch active runtime environment, and configure callback webhooks.
              </p>
            </div>
          </div>

          {/* Quick Environment & Status Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Active Mode Switcher */}
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setLocalField('mode', 'test')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentGw.mode === 'test'
                    ? 'shadow-xs font-bold text-white bg-amber-500'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 bg-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Flask className="w-3.5 h-3.5" />{t('superadmin.gateways.btn_test_mode')}</span>
              </button>
              <button
                type="button"
                onClick={() => setLocalField('mode', 'live')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentGw.mode === 'live'
                    ? 'shadow-xs font-bold text-white bg-emerald-600'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 bg-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5"><FleetIcons.Rocket className="w-3.5 h-3.5" />{t('superadmin.gateways.btn_live_mode')}</span>
              </button>
            </div>

            {/* Is Active Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={Boolean(currentGw.is_active)}
                onChange={(e) => setLocalField('is_active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-zinc-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              <span>{t('superadmin.gateways.enable_gateway')}</span>
            </label>

            {/* Is Default Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={Boolean(currentGw.is_default)}
                onChange={(e) => setLocalField('is_default', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-zinc-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
              <span>{t('superadmin.gateways.default_rail')}</span>
            </label>
          </div>
        </div>

        {/* Dynamic Mode Notice Bar */}
        <div className={`px-4 sm:px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
          currentGw.mode === 'live'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
        }`}>
          <div className="flex items-center gap-2">
            {currentGw.mode === 'live' ? (
              <FleetIcons.Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FleetIcons.Flask className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            <span>
              <strong>Active Environment: {currentGw.mode === 'live' ? 'PRODUCTION (LIVE)' : 'SANDBOX (TEST)'}.</strong>
              {' '}Platform will automatically process orders using the {currentGw.mode === 'live' ? 'Production' : 'Sandbox'} credentials below.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            Runtime Route Active
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-5">
          {/* Dual Environment Columns (Test vs Live) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Sandbox / Test Environment Panel */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all bg-white dark:bg-zinc-900/60 ${
                currentGw.mode === 'test'
                  ? 'border-2 border-amber-400 dark:border-amber-500 shadow-xs ring-2 ring-amber-500/10'
                  : 'border border-slate-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FleetIcons.Flask className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('superadmin.gateways.test_keys_title')}
                  </h3>
                </div>
                {currentGw.mode === 'test' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white uppercase tracking-wider">
                    {t('superadmin.gateways.in_use')}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Test Publishable Key */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('superadmin.gateways.test_pub_key')}
                  </label>
                  <input
                    type="text"
                    value={currentGw.test_publishable_key || ''}
                    onChange={(e) => setLocalField('test_publishable_key', e.target.value)}
                    placeholder={currentGw.provider_type === 'razorpay' ? 'rzp_test_...' : 'pk_test_...'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Safe to expose on the web client during test checkouts.
                  </p>
                </div>

                {/* Test Secret Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('superadmin.gateways.test_sec_key')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTestSecret(!showTestSecret)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>{showTestSecret ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showTestSecret ? 'text' : 'password'}
                    value={currentGw.test_secret_key || ''}
                    onChange={(e) => setLocalField('test_secret_key', e.target.value)}
                    placeholder={currentGw.test_secret_key_masked || '••••••••'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Backend private key for test payment authorization and session creation.
                  </p>
                </div>

                {/* Test Webhook Secret */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('superadmin.gateways.test_wh_sec')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTestWebhook(!showTestWebhook)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>{showTestWebhook ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showTestWebhook ? 'text' : 'password'}
                    value={currentGw.test_webhook_secret || ''}
                    onChange={(e) => setLocalField('test_webhook_secret', e.target.value)}
                    placeholder={currentGw.test_webhook_secret_masked || 'whsec_test_...'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Used to verify HMAC signatures of incoming test webhook alerts.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Production / Live Environment Panel */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all bg-white dark:bg-zinc-900/60 ${
                currentGw.mode === 'live'
                  ? 'border-2 border-emerald-500 shadow-xs ring-2 ring-emerald-500/10'
                  : 'border border-slate-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FleetIcons.Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('superadmin.gateways.live_keys_title')}
                  </h3>
                </div>
                {currentGw.mode === 'live' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
                    {t('superadmin.gateways.in_use')}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Live Publishable Key */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {t('superadmin.gateways.live_pub_key')}
                  </label>
                  <input
                    type="text"
                    value={currentGw.live_publishable_key || ''}
                    onChange={(e) => setLocalField('live_publishable_key', e.target.value)}
                    placeholder={currentGw.provider_type === 'razorpay' ? 'rzp_live_...' : 'pk_live_...'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Production client-side public identifier for real payment checkouts.
                  </p>
                </div>

                {/* Live Secret Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('superadmin.gateways.live_sec_key')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLiveSecret(!showLiveSecret)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>{showLiveSecret ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showLiveSecret ? 'text' : 'password'}
                    value={currentGw.live_secret_key || ''}
                    onChange={(e) => setLocalField('live_secret_key', e.target.value)}
                    placeholder={currentGw.live_secret_key_masked || '••••••••'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>{t('superadmin.gateways.production_key_warn')}</span>
                  </p>
                </div>

                {/* Live Webhook Secret */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      {t('superadmin.gateways.live_wh_sec')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLiveWebhook(!showLiveWebhook)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5" />
                      <span>{showLiveWebhook ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showLiveWebhook ? 'text' : 'password'}
                    value={currentGw.live_webhook_secret || ''}
                    onChange={(e) => setLocalField('live_webhook_secret', e.target.value)}
                    placeholder={currentGw.live_webhook_secret_masked || 'whsec_...'}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Verified by server to authorize real invoice receipts and settlement events.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks & Additional Gateway Information */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('superadmin.gateways.webhook_title')}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                {t('superadmin.gateways.cb_url_lbl')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => handleCopyWebhookUrl(webhookUrl)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs bg-slate-900 dark:bg-zinc-800 text-white hover:bg-slate-800 dark:hover:bg-zinc-700 border border-transparent dark:border-zinc-700"
                >
                  <span>{copiedWebhook ? t('superadmin.gateways.copied') : t('superadmin.gateways.copy_url')}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Paste this URL into your {currentGw.name} Dashboard under Webhooks to receive real-time payment success notifications.
              </p>
            </div>

            {/* Merchant ID & Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('superadmin.gateways.merchant_id_lbl')}
                </label>
                <input
                  type="text"
                  value={currentGw.merchant_id || ''}
                  onChange={(e) => setLocalField('merchant_id', e.target.value)}
                  placeholder={t('superadmin.gateways.ph_merchant_id')}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('superadmin.gateways.supported_curr_lbl')}
                </label>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {(Array.isArray(currentGw.supported_currencies) ? currentGw.supported_currencies : ['INR', 'USD']).map((curr) => (
                    <span key={curr} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                      {curr}
                    </span>
                  ))}
                  {(Array.isArray(currentGw.supported_methods) ? currentGw.supported_methods : ['card', 'upi']).map((m) => (
                    <span key={m} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Result Feedback Box if any */}
          {testResult && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
              testResult.ok !== false
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.ok !== false ? (
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <FleetIcons.Ban className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{testResult.message || testResult.error}</span>
                {testResult.latencyMs && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold">
                    {testResult.latencyMs}ms
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetTestResult}
                className="text-xs font-bold hover:underline opacity-80 cursor-pointer"
              >
                {t('superadmin.gateways.dismiss')}
              </button>
            </div>
          )}

          {/* Live Order Simulation Result Card */}
          {simulationResult && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-blue-200/80 dark:border-blue-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <FleetIcons.ShoppingCart className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Live Order Created: {simulationResult.provider?.toUpperCase()} ({simulationResult.mode?.toUpperCase()})
                  </span>
                  {simulationResult.latencyMs && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200 font-bold">
                      {simulationResult.latencyMs}ms
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetSimulationResult}
                  className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {t('superadmin.gateways.dismiss')}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-zinc-900/90 rounded-lg border border-blue-100 dark:border-zinc-800">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                    Order ID
                  </div>
                  <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 truncate" title={simulationResult.orderId || simulationResult.sessionId}>
                    {simulationResult.orderId || simulationResult.sessionId}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900/90 rounded-lg border border-blue-100 dark:border-zinc-800">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('superadmin.gateways.th_amount')}</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    ₹{simulationResult.amount} {simulationResult.currency}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900/90 rounded-lg border border-blue-100 dark:border-zinc-800">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('superadmin.gateways.th_status')}</div>
                  <div className="font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">
                    {simulationResult.status || 'CREATED'}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900/90 rounded-lg border border-blue-100 dark:border-zinc-800">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('superadmin.gateways.th_action')}</div>
                  {simulationResult.sessionUrl ? (
                    <a
                      href={simulationResult.sessionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>{t('superadmin.gateways.checkout_link')}</span>
                      <FleetIcons.ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t('superadmin.gateways.ready_for_checkout')}</span>
                  )}
                </div>
              </div>

              {simulationResult.sessionUrl && (
                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Click to test the live Razorpay payment form in a new browser tab:
                  </span>
                  <a
                    href={simulationResult.sessionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <FleetIcons.CreditCard className="w-3.5 h-3.5" />
                    <span>{t('superadmin.gateways.open_checkout')}</span>
                    <FleetIcons.ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-700/80 disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <FleetIcons.Spinner className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{t('superadmin.gateways.verifying')}</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FleetIcons.Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('superadmin.gateways.test_conn_btn').replace('{mode}', currentGw.mode?.toUpperCase() || 'TEST')}</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={simulating}
                onClick={handleSimulateOrder}
                className="px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-300 dark:border-blue-800/80 shadow-xs bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <FleetIcons.Spinner className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{t('superadmin.gateways.simulating')}</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FleetIcons.ShoppingCart className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>{t('superadmin.gateways.simulate_btn')}</span>
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => fetchGateways()}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
              >
                {t('superadmin.gateways.discard_btn')}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-blue-600 hover:bg-blue-500"
              >
                {saving ? (
                  <>
                    <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                    <span>{t('superadmin.gateways.saving')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('superadmin.gateways.save_btn').replace('{name}', currentGw.name || 'Gateway')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperPaymentGatewaysPage;
