import React, { useMemo, useState } from 'react';

/**
 * RouteVehicleScreenPicker — Transit Route → Vehicle → Screen selector driven by
 * the real fleet-options data (fleets → routes → vehicles → screens). Emits
 * `onChange(targets)` where each target is:
 *   { fleetName, organizationId, routeId, routeName, routeCode, city, vehicleIds, screensPerVehicle, totalScreens, vehicleCount }
 *
 * Props:
 *  - fleetOptions: array from GET /campaigns/fleet-options
 *  - value: current selected targets array
 *  - onChange: (targets) => void
 */
export const RouteVehicleScreenPicker = ({ fleetOptions = [], value = [], onChange }) => {
  const [cityFilter, setCityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({}); // routeKey -> bool

  // Flatten fleets → routes with vehicles/screens (deduplicated by route id).
  const allRoutes = useMemo(() => {
    const routeMap = new Map();
    (Array.isArray(fleetOptions) ? fleetOptions : []).forEach((fleet) => {
      if (Array.isArray(fleet.routes)) {
        fleet.routes.forEach((r) => {
          const rid = r.id;
          const key = `route-${rid}`;
          const vehicles = Array.isArray(r.vehicles) ? r.vehicles : [];
          const busCount = r.vehicleCount || vehicles.length || 0;
          const screensPerVehicle = vehicles[0]?.displaysCount || r.screensPerVehicle || 1;
          const totalScreens = r.totalScreens || (busCount * screensPerVehicle);

          if (!routeMap.has(rid)) {
            routeMap.set(rid, {
              routeKey: key,
              fleetId: fleet.id,
              fleetName: fleet.name,
              organizationId: fleet.organization_id || fleet.organizationId || null,
              id: r.id,
              name: r.name || `Route ${r.id}`,
              code: r.code || `RT-${r.id}`,
              city: r.city || fleet.city || 'Transit Network',
              vehicles: [...vehicles],
              vehicleCount: busCount,
              screensPerVehicle,
              totalScreens,
              hasVehicles: busCount > 0,
            });
          } else {
            const existing = routeMap.get(rid);
            if (vehicles.length > 0) {
              const existingVehicleIds = new Set(existing.vehicles.map(v => v.id));
              vehicles.forEach(v => {
                if (!existingVehicleIds.has(v.id)) {
                  existing.vehicles.push(v);
                  existingVehicleIds.add(v.id);
                }
              });
              existing.vehicleCount = existing.vehicles.length;
              existing.totalScreens = existing.vehicles.reduce((acc, v) => acc + (v.displaysCount || 1), 0);
              if (!existing.hasVehicles && busCount > 0) {
                existing.fleetId = fleet.id;
                existing.fleetName = fleet.name;
                existing.hasVehicles = true;
              }
            }
          }
        });
      }
    });
    return Array.from(routeMap.values());
  }, [fleetOptions]);

  const cities = useMemo(() => {
    const set = new Set();
    allRoutes.forEach((r) => { if (r.city) set.add(r.city.split(/[,/(&]/)[0].trim()); });
    return ['All', ...Array.from(set)];
  }, [allRoutes]);

  const filtered = useMemo(() => {
    return allRoutes.filter((r) => {
      if (cityFilter !== 'All' && !(r.city || '').toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        return (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q) || (r.fleetName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [allRoutes, cityFilter, search]);

  const isRouteSelected = (route) => value.some((t) => t.routeKey === route.routeKey || t.routeId === route.id);
  const isVehicleSelected = (route, vid) => {
    const t = value.find((x) => x.routeKey === route.routeKey || x.routeId === route.id);
    return t ? (t.vehicleIds || []).includes(vid) : false;
  };

  const emit = (targets) => onChange && onChange(targets);

  const toggleRoute = (route) => {
    const targets = [...value];
    const idx = targets.findIndex((t) => t.routeKey === route.routeKey || t.routeId === route.id);
    if (idx >= 0) {
      targets.splice(idx, 1);
    } else {
      targets.push({
        fleetName: route.fleetName,
        organizationId: route.organizationId,
        routeId: route.id,
        routeName: route.name,
        routeCode: route.code,
        routeKey: route.routeKey,
        city: route.city,
        vehicleIds: route.vehicles.map((v) => v.id),
        screensPerVehicle: route.screensPerVehicle,
        totalScreens: route.totalScreens,
        vehicleCount: route.vehicleCount,
      });
    }
    emit(targets);
  };

  const toggleVehicle = (route, vid) => {
    const targets = [...value];
    const idx = targets.findIndex((t) => t.routeKey === route.routeKey || t.routeId === route.id);
    if (idx < 0) {
      // selecting a vehicle also selects the route
      toggleRoute(route);
      return;
    }
    const t = { ...targets[idx] };
    const ids = [...(t.vehicleIds || [])];
    const vi = ids.indexOf(vid);
    if (vi >= 0) ids.splice(vi, 1); else ids.push(vid);
    t.vehicleIds = ids;
    t.vehicleCount = ids.length;
    t.totalScreens = ids.length * (t.screensPerVehicle || 1);
    if (ids.length === 0) targets.splice(idx, 1); else targets[idx] = t;
    emit(targets);
  };

  const totalRoutes = value.length;
  const totalVehicles = value.reduce((s, t) => s + (t.vehicleCount || 0), 0);
  const totalScreens = value.reduce((s, t) => s + (t.totalScreens || 0), 0);

  if (allRoutes.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-500 dark:text-zinc-400">
        No transit routes available. Fleet operators must register routes & vehicles first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-full">{totalRoutes} routes</span>
          <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-full">{totalVehicles} vehicles</span>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">{totalScreens} screens</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search routes…"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-xs font-medium w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* City tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCityFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all cursor-pointer ${cityFilter === c ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Route list with vehicle/screen drill-down */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map((route) => {
          const selected = isRouteSelected(route);
          const open = expanded[route.routeKey];
          return (
            <div key={route.routeKey} className={`rounded-xl border transition-all ${selected ? 'border-blue-400 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
              <div className="flex items-center justify-between gap-3 p-3">
                <label className="flex items-center gap-3 cursor-pointer min-w-0">
                  <input type="checkbox" checked={selected} onChange={() => toggleRoute(route)} className="accent-blue-600 w-4 h-4 cursor-pointer" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">{route.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-1.5 py-0.5 rounded">{route.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{route.city} · {route.vehicleCount} buses · {route.totalScreens} screens</p>
                  </div>
                </label>
                {route.vehicles.length > 0 && (
                  <button type="button" onClick={() => setExpanded((e) => ({ ...e, [route.routeKey]: !open }))} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 shrink-0 cursor-pointer">
                    {open ? 'Hide vehicles' : 'Select vehicles'}
                  </button>
                )}
              </div>
              {open && route.vehicles.length > 0 && (
                <div className="px-3 pb-3 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-100 dark:border-zinc-800">
                  {route.vehicles.map((v) => {
                    const vsel = isVehicleSelected(route, v.id);
                    const screens = v.displaysCount || route.screensPerVehicle || 1;
                    return (
                      <label key={v.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-[11px] font-semibold mt-2 ${vsel ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300'}`}>
                        <input type="checkbox" checked={vsel} onChange={() => toggleVehicle(route, v.id)} className="accent-blue-600 w-3.5 h-3.5 cursor-pointer" />
                        <span className="truncate">
                          🚌 <span className="text-slate-900 dark:text-white font-bold">{v.bus_number || v.busNumber || `Bus ${v.id}`}</span>
                          <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-normal">📺 {screens} screen{screens > 1 ? 's' : ''}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">No routes match your filter.</div>
        )}
      </div>
    </div>
  );
};

export default RouteVehicleScreenPicker;
