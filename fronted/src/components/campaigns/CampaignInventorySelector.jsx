import React, { useMemo, useState } from 'react';
import { FleetIcons } from '../FleetIcons';

const routeKeyOf = (route) => route.routeKey || `route-${route.id}`;
const targetFor = (targets, route) => targets.find((target) => String(target.routeId) === String(route.id));
const vehicleScreenCapacity = (vehicle, route) =>
  Math.max(Number(vehicle?.displaysCount || 0), (vehicle?.screens || []).length) ||
  Number(route?.screensPerVehicle || 1);

export const CampaignInventorySelector = ({ routes = [], selectedTargets = [], onChange }) => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [expandedRoutes, setExpandedRoutes] = useState({});
  const [expandedBuses, setExpandedBuses] = useState({});
  const cities = useMemo(() => ['All', ...new Set(routes.map((route) => route.city).filter(Boolean))], [routes]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return routes.filter((route) => {
      const haystack = [route.name, route.code, route.city, route.fleetName, ...(route.vehicles || []).map((v) => v.busNumber)].join(' ').toLowerCase();
      return (city === 'All' || route.city === city) && (!query || haystack.includes(query));
    });
  }, [routes, search, city]);

  const makeTarget = (route, vehicleIds = [], screenIds = []) => {
    const routeVehicles = route.vehicles || [];
    let selectedCount = 0;
    let vehicleCount = vehicleIds.length;

    if (routeVehicles.length === 0 && (route.vehicleCount > 0 || route.totalScreens > 0)) {
      vehicleCount = Number(route.vehicleCount) || 1;
      selectedCount = Number(route.totalScreens) || (vehicleCount * (Number(route.screensPerVehicle) || 1));
    } else {
      const selectedVehicles = routeVehicles.filter((vehicle) => vehicleIds.some((id) => String(id) === String(vehicle.id)));
      const registeredIds = new Set(selectedVehicles.flatMap((vehicle) => (vehicle.screens || []).map((screen) => String(screen.id))));
      const allRegisteredSelected = registeredIds.size === 0 || [...registeredIds].every((id) => screenIds.some((screenId) => String(screenId) === id));
      selectedCount = allRegisteredSelected
        ? selectedVehicles.reduce((sum, vehicle) => sum + vehicleScreenCapacity(vehicle, route), 0)
        : screenIds.length;
    }

    return {
      fleetId: route.fleetId,
      fleetName: route.fleetName,
      organizationId: route.organizationId,
      routeId: route.id,
      routeName: route.name,
      routeCode: route.code,
      routeKey: routeKeyOf(route),
      city: route.city,
      vehicleIds,
      screenIds,
      vehicleCount,
      totalScreens: selectedCount,
      screensPerVehicle: vehicleCount ? Math.round(selectedCount / vehicleCount) : (Number(route.screensPerVehicle) || 1),
    };
  };
  const emit = (next) => onChange(next);
  const toggleRoute = (route) => {
    const existing = targetFor(selectedTargets, route);
    if (existing) return emit(selectedTargets.filter((target) => String(target.routeId) !== String(route.id)));
    const vehicles = route.vehicles || [];
    if (vehicles.length === 0) {
      return emit([...selectedTargets, makeTarget(route, [], [])]);
    }
    return emit([...selectedTargets, makeTarget(route, vehicles.map((v) => v.id), vehicles.flatMap((v) => (v.screens || []).map((s) => s.id)))]);
  };
  const toggleBus = (route, vehicle) => {
    const existing = targetFor(selectedTargets, route);
    const vehicleIds = [...(existing?.vehicleIds || [])];
    const selected = vehicleIds.some((id) => String(id) === String(vehicle.id));
    const busScreens = (vehicle.screens || []).map((screen) => screen.id);
    const nextVehicles = selected ? vehicleIds.filter((id) => String(id) !== String(vehicle.id)) : [...vehicleIds, vehicle.id];
    const nextScreens = selected
      ? (existing?.screenIds || []).filter((id) => !busScreens.some((screenId) => String(screenId) === String(id)))
      : [...new Set([...(existing?.screenIds || []), ...busScreens])];
    const rest = selectedTargets.filter((target) => String(target.routeId) !== String(route.id));
    emit(nextVehicles.length ? [...rest, makeTarget(route, nextVehicles, nextScreens)] : rest);
  };
  const toggleScreen = (route, vehicle, screen) => {
    const existing = targetFor(selectedTargets, route);
    const selected = existing?.screenIds?.some((id) => String(id) === String(screen.id));
    const nextScreens = selected
      ? existing.screenIds.filter((id) => String(id) !== String(screen.id))
      : [...(existing?.screenIds || []), screen.id];
    const busScreenIds = (vehicle.screens || []).map((item) => String(item.id));
    const busHasSelection = nextScreens.some((id) => busScreenIds.includes(String(id)));
    const currentVehicles = [...(existing?.vehicleIds || [])];
    const nextVehicles = busHasSelection
      ? [...new Set([...currentVehicles, vehicle.id])]
      : currentVehicles.filter((id) => String(id) !== String(vehicle.id));
    const rest = selectedTargets.filter((target) => String(target.routeId) !== String(route.id));
    emit(nextVehicles.length ? [...rest, makeTarget(route, nextVehicles, nextScreens)] : rest);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div><h2 className="text-lg font-black text-slate-900 dark:text-white">Select Transit Routes, Buses & Screens</h2><p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Search a route, open its buses, then select complete buses or individual screens.</p></div>
        <div className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2">{selectedTargets.length} routes · {selectedTargets.reduce((sum, t) => sum + (t.vehicleIds?.length || t.vehicleCount || 0), 0)} buses · {selectedTargets.reduce((sum, t) => sum + (Number(t.totalScreens) || (t.screenIds?.length || 0)), 0)} screens</div>
      </div>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3">
        <label className="relative"><FleetIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search route, operator or bus number..." className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white" /></label>
        <select value={city} onChange={(event) => setCity(event.target.value)} className="px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white">{cities.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="max-h-[34rem] overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-slate-100 dark:divide-zinc-800">
        {filtered.map((route) => {
          const key = routeKeyOf(route); const selected = targetFor(selectedTargets, route); const expanded = expandedRoutes[key];
          return <div key={key} className={selected ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''}>
            <div className="flex items-center gap-3 p-3">
              <input type="checkbox" checked={Boolean(selected)} onChange={() => toggleRoute(route)} className="w-4 h-4 accent-blue-600" />
              <button type="button" onClick={() => setExpandedRoutes((value) => ({ ...value, [key]: !expanded }))} className="min-w-0 flex-1 text-left"><span className="font-black text-sm text-slate-900 dark:text-white">{route.name}</span><span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">{route.code}</span><p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{route.fleetName} · {route.city || 'Transit Network'}</p></button>
              <div className="text-right shrink-0"><p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{selected ? (selected.vehicleIds?.length || selected.vehicleCount || 0) : (route.vehicleCount ?? 0)} buses</p><p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">{selected ? (selected.totalScreens ?? 0) : (route.totalScreens ?? 0)} screens</p></div>
              <button type="button" onClick={() => setExpandedRoutes((value) => ({ ...value, [key]: !expanded }))} className="px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">{expanded ? 'Hide' : 'Details'}</button>
            </div>
            {expanded && <div className="px-3 pb-3 pl-10 space-y-2">
              {(route.vehicles || []).length === 0 && <p className="text-xs text-amber-700 dark:text-amber-400">No active buses assigned to this route.</p>}
              {(route.vehicles || []).map((vehicle) => {
                const busKey = `${key}-${vehicle.id}`; const busSelected = selected?.vehicleIds?.some((id) => String(id) === String(vehicle.id)); const busExpanded = expandedBuses[busKey];
                return <div key={vehicle.id} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70">
                  <div className="flex items-center gap-3 p-2.5"><input type="checkbox" checked={Boolean(busSelected)} onChange={() => toggleBus(route, vehicle)} className="w-4 h-4 accent-blue-600" /><button type="button" onClick={() => setExpandedBuses((value) => ({ ...value, [busKey]: !busExpanded }))} className="flex-1 text-left text-xs font-black text-slate-800 dark:text-white">{vehicle.busNumber || `Bus #${vehicle.id}`}</button><span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">{vehicleScreenCapacity(vehicle, route)} screens</span><button type="button" onClick={() => setExpandedBuses((value) => ({ ...value, [busKey]: !busExpanded }))} className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{busExpanded ? 'Hide screens' : 'View screens'}</button></div>
                  {busExpanded && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 px-3 pb-3">{(vehicle.screens || []).map((screen) => {
                    const checked = selected?.screenIds?.some((id) => String(id) === String(screen.id));
                    return <label key={screen.id} className={`flex items-center gap-2 rounded-lg border p-2 text-[11px] cursor-pointer ${checked ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}><input type="checkbox" checked={Boolean(checked)} onChange={() => toggleScreen(route, vehicle, screen)} className="accent-blue-600" /><span className="min-w-0 flex-1"><strong className="block truncate dark:text-white">{screen.code}</strong><span className="text-slate-500 dark:text-zinc-400">{screen.type} · {screen.resolution || 'Display'}</span></span><span className={`w-2 h-2 rounded-full ${screen.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} /></label>;
                  })}{(vehicle.screens || []).length === 0 && <p className="text-[11px] text-amber-700 dark:text-amber-400">{vehicle.displayLayout ? `Configured layout: ${vehicle.displayLayout.leftSide} left, ${vehicle.displayLayout.rightSide} right, ${vehicle.displayLayout.rear} rear, ${vehicle.displayLayout.emergencyExit} emergency exit (${vehicleScreenCapacity(vehicle, route)} total). Individual screen IDs are not registered yet; selecting the bus targets its complete screen layout.` : 'No registered or configured screens on this bus.'}</p>}</div>}
                </div>;
              })}
            </div>}
          </div>;
        })}
        {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-500 dark:text-zinc-400">No matching routes found.</div>}
      </div>
    </section>
  );
};

export default CampaignInventorySelector;
