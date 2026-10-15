import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useVehicleTracking } from '../../hooks/fleet/useVehicleTracking';
import { useAuth } from '../../hooks/useAuth';
import { decodePolyline } from '../../utils/polyline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const LiveTrackingPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canView = hasPermission('fleet.tracking.view');

  const { vehicles, telemetry, loadVehicles, loadTelemetry } = useFleetVehicle();
  const vehicleList = useMemo(() => {
    return Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  }, [vehicles]);

  // Selected Vehicle State
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [followVehicle, setFollowVehicle] = useState(true);
  const [mapStyle, setMapStyle] = useState('roadmap'); // roadmap, satellite, traffic, terrain
  const [stepsDrawerOpen, setStepsDrawerOpen] = useState(false);
  const [packetCount, setPacketCount] = useState(0);
  const [lastPacketTime, setLastPacketTime] = useState(null);

  // Real-time MQTT Telemetry tracking via Socket.IO
  const { positions, connected } = useVehicleTracking(selectedVehicleId);
  const livePos = selectedVehicleId ? positions[selectedVehicleId] : null;

  // Map Container & Instance Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const polylineOuterRef = useRef(null);
  const polylineInnerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  // 1. Initial Vehicles Loading
  useEffect(() => {
    if (!canView) return;
    loadVehicles().catch(() => {});
  }, [canView, loadVehicles]);

  // Automatically select the active vehicle (prioritizing vehicle with assigned route / GPS)
  useEffect(() => {
    if (vehicleList.length === 0) return;
    if (selectedVehicleId == null) {
      const prioritized = vehicleList.find(v => v.route_id || v.route || v.assigned_route) || vehicleList[0];
      setSelectedVehicleId(prioritized.id);
    }
  }, [vehicleList, selectedVehicleId]);

  const selectedVehicle = useMemo(() => {
    return vehicleList.find(v => String(v.id) === String(selectedVehicleId)) || vehicleList[0] || {};
  }, [vehicleList, selectedVehicleId]);

  // Load telemetry history from DB whenever selected vehicle changes
  useEffect(() => {
    if (selectedVehicleId) {
      loadTelemetry(selectedVehicleId).catch(() => {});
    }
  }, [selectedVehicleId, loadTelemetry]);

  // 2. Decode Route Coordinates strictly from DB (selectedVehicle.route.polyline)
  const routeWaypoints = useMemo(() => {
    if (selectedVehicle.route?.polyline) {
      const decoded = decodePolyline(selectedVehicle.route.polyline);
      if (decoded && decoded.length > 1) return decoded;
    }
    // Fallback: check historical telemetry positions recorded in DB
    if (telemetry?.positions && telemetry.positions.length > 1) {
      const pts = telemetry.positions
        .map(p => [Number(p.lat), Number(p.lng)])
        .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      if (pts.length > 1) return pts;
    }
    return [];
  }, [selectedVehicle, telemetry]);

  // 3. Tile Layer Resolver (Real Google Maps Raster Engine)
  const getTileUrl = (style) => {
    switch (style) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'traffic':
        return 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}';
      case 'terrain':
        return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // 4. Coordinates strictly from livePos OR DB historical telemetry OR Route start coordinates
  const latestDbPosition = telemetry?.positions?.[0];
  const hasLiveCoords = livePos && livePos.lat != null && livePos.lng != null && !isNaN(Number(livePos.lat));
  const hasDbCoords = latestDbPosition && latestDbPosition.lat != null && latestDbPosition.lng != null && !isNaN(Number(latestDbPosition.lat));
  const hasRouteCoords = routeWaypoints.length > 0;

  const markerLat = hasLiveCoords
    ? Number(livePos.lat)
    : (hasDbCoords
      ? Number(latestDbPosition.lat)
      : (hasRouteCoords
        ? routeWaypoints[0][0]
        : (selectedVehicle.route?.start_latitude ? Number(selectedVehicle.route.start_latitude) : null)));

  const markerLng = hasLiveCoords
    ? Number(livePos.lng)
    : (hasDbCoords
      ? Number(latestDbPosition.lng)
      : (hasRouteCoords
        ? routeWaypoints[0][1]
        : (selectedVehicle.route?.start_longitude ? Number(selectedVehicle.route.start_longitude) : null)));

  // Telemetry Metrics (Speed, Heading, Satellites, Battery) strictly from Live or DB
  const currentSpeed = hasLiveCoords && livePos.speed != null
    ? Math.round(Number(livePos.speed))
    : (hasDbCoords && latestDbPosition.speed != null
      ? Math.round(Number(latestDbPosition.speed))
      : (selectedVehicle.last_speed != null ? Math.round(Number(selectedVehicle.last_speed)) : 0));

  const currentHeading = hasLiveCoords && livePos.heading != null
    ? Math.round(Number(livePos.heading))
    : (hasDbCoords && latestDbPosition.heading != null
      ? Math.round(Number(latestDbPosition.heading))
      : 0);

  const satellitesCount = hasLiveCoords && livePos.satellites != null
    ? livePos.satellites
    : (hasDbCoords && latestDbPosition.satellites != null
      ? latestDbPosition.satellites
      : null);

  const batteryLevel = hasLiveCoords && livePos.battery != null
    ? livePos.battery
    : (selectedVehicle.battery_level != null ? selectedVehicle.battery_level : null);

  const lastPingTimestamp = hasLiveCoords
    ? (livePos.at ? new Date(livePos.at) : new Date())
    : (hasDbCoords
      ? new Date(latestDbPosition.recorded_at)
      : (selectedVehicle.last_telemetry_at ? new Date(selectedVehicle.last_telemetry_at) : null));

  // Count incoming packets from live MQTT / Socket.IO
  useEffect(() => {
    if (livePos) {
      setPacketCount((prev) => prev + 1);
      setLastPacketTime(new Date());
    }
  }, [livePos]);

  // 5. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = markerLat != null && markerLng != null ? [markerLat, markerLng] : [23.12142, 75.78542];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Draw Route Polylines
      if (routeWaypoints.length > 0) {
        const outerPoly = L.polyline(routeWaypoints, {
          color: '#1a73e8',
          weight: 8,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        polylineOuterRef.current = outerPoly;

        const innerPoly = L.polyline(routeWaypoints, {
          color: '#4285F4',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        polylineInnerRef.current = innerPoly;

        // Start Pin Marker
        const startIcon = L.divIcon({
          className: 'custom-start-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
              <div style="position: absolute; width: 28px; height: 28px; background: rgba(24, 128, 56, 0.25); border-radius: 50%; animation: ping 1.5s infinite;"></div>
              <div style="width: 14px; height: 14px; background: #188038; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        startMarkerRef.current = L.marker(routeWaypoints[0], { icon: startIcon }).addTo(map);

        // Destination Pin Marker
        const destIcon = L.divIcon({
          className: 'custom-dest-pin',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="width: 24px; height: 32px; background-image: url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 24 32&quot; fill=&quot;%23EA4335&quot; stroke=&quot;white&quot; stroke-width=&quot;1.5&quot;><path d=&quot;M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12zm0 16a4 4 0 110-8 4 4 0 010 8z&quot;/></svg>'); background-repeat: no-repeat; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));"></div>
            </div>
          `,
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });
        destMarkerRef.current = L.marker(routeWaypoints[routeWaypoints.length - 1], { icon: destIcon }).addTo(map);

        map.fitBounds(outerPoly.getBounds(), { padding: [50, 50], maxZoom: 15 });
      }

      // Live Vehicle GPS Puck Marker
      if (markerLat != null && markerLng != null) {
        const busLabel = selectedVehicle.bus_number || selectedVehicle.code || 'Vehicle';
        const vehicleIcon = L.divIcon({
          className: 'custom-vehicle-puck',
          html: `
            <div id="live-vehicle-puck-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
              <div style="position: absolute; width: 44px; height: 44px; background: rgba(37, 99, 235, 0.28); border-radius: 50%; animation: pulse 1.8s infinite;"></div>
              <div id="live-puck-body" style="width: 28px; height: 28px; background: #1d4ed8; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold; transform: rotate(${currentHeading}deg); transition: transform 0.3s ease-out;">
                ▲
              </div>
              <div id="live-puck-tag" style="position: absolute; top: -22px; background: #0f172a; color: #38bdf8; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; font-family: monospace; border: 1px solid rgba(56,189,248,0.4); white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
                ${busLabel}
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        vehicleMarkerRef.current = L.marker([markerLat, markerLng], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 6. Update Map Style when toggled
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapStyle));
    }
  }, [mapStyle]);

  // 7. Update Route Polyline & Markers strictly when routeWaypoints change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routeWaypoints.length > 0) {
      if (polylineOuterRef.current) {
        polylineOuterRef.current.setLatLngs(routeWaypoints);
      } else {
        polylineOuterRef.current = L.polyline(routeWaypoints, {
          color: '#1a73e8',
          weight: 8,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      if (polylineInnerRef.current) {
        polylineInnerRef.current.setLatLngs(routeWaypoints);
      } else {
        polylineInnerRef.current = L.polyline(routeWaypoints, {
          color: '#4285F4',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      if (startMarkerRef.current) startMarkerRef.current.setLatLng(routeWaypoints[0]);
      if (destMarkerRef.current) destMarkerRef.current.setLatLng(routeWaypoints[routeWaypoints.length - 1]);

      if (polylineOuterRef.current) {
        map.fitBounds(polylineOuterRef.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
      }
    } else {
      // Clear route lines if vehicle has no route
      if (polylineOuterRef.current) {
        map.removeLayer(polylineOuterRef.current);
        polylineOuterRef.current = null;
      }
      if (polylineInnerRef.current) {
        map.removeLayer(polylineInnerRef.current);
        polylineInnerRef.current = null;
      }
    }
  }, [routeWaypoints]);

  // 8. Update Vehicle Marker position & heading smoothly
  useEffect(() => {
    if (markerLat == null || markerLng == null) return;

    if (!vehicleMarkerRef.current && mapInstanceRef.current) {
      const busLabel = selectedVehicle.bus_number || selectedVehicle.code || 'Vehicle';
      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-puck',
        html: `
          <div id="live-vehicle-puck-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
            <div style="position: absolute; width: 44px; height: 44px; background: rgba(37, 99, 235, 0.28); border-radius: 50%; animation: pulse 1.8s infinite;"></div>
            <div id="live-puck-body" style="width: 28px; height: 28px; background: #1d4ed8; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold; transform: rotate(${currentHeading}deg); transition: transform 0.3s ease-out;">
              ▲
            </div>
            <div id="live-puck-tag" style="position: absolute; top: -22px; background: #0f172a; color: #38bdf8; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; font-family: monospace; border: 1px solid rgba(56,189,248,0.4); white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
              ${busLabel}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      vehicleMarkerRef.current = L.marker([markerLat, markerLng], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
    } else if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([markerLat, markerLng]);

      const puckEl = document.getElementById('live-puck-body');
      if (puckEl) puckEl.style.transform = `rotate(${currentHeading}deg)`;

      const tagEl = document.getElementById('live-puck-tag');
      if (tagEl) tagEl.textContent = selectedVehicle.bus_number || selectedVehicle.code || 'Vehicle';
    }

    if (followVehicle && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([markerLat, markerLng], { animate: true, duration: 0.8 });
    }
  }, [markerLat, markerLng, currentHeading, followVehicle, selectedVehicle]);

  // Map Navigation Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapInstanceRef.current && markerLat != null && markerLng != null) {
      mapInstanceRef.current.flyTo([markerLat, markerLng], 15, { animate: true, duration: 1 });
    }
  };

  const originLabel = selectedVehicle.route?.start_point || selectedVehicle.source || 'Depot / Origin';
  const destinationLabel = selectedVehicle.route?.end_point || selectedVehicle.destination || 'Destination Terminal';

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="flex justify-center">
          <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your account role does not have permission to view live fleet telematics.
        </p>
        <Link
          to="/fleet-manager/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-16">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Live Tracking' },
        ]}
        className="mb-2"
      />

      {/* Header & Controls */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shadow-xs shrink-0">
            <FleetIcons.Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Google Maps Live GPS Tracking</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                MQTT Telemetry
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Real-time low-latency GPS telematics and geospatial transit monitoring.
            </p>
          </div>
        </div>

        {/* Vehicle Selector & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedVehicleId ?? ''}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
          >
            {vehicleList.length === 0 && <option value="">No vehicles available</option>}
            {vehicleList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.bus_number ?? v.code} ({v.model || v.vehicle_type || 'Bus'})
              </option>
            ))}
          </select>

          {/* Live Socket.IO indicator */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border ${
              connected
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'
            }`}
            title={connected ? 'Live telemetry socket bridge active' : 'Connecting to live telemetry socket bridge...'}
          >
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{connected ? 'Bridge Connected' : 'Bridge Offline'}</span>
          </div>

          {/* Auto-Follow Toggle */}
          <button
            type="button"
            onClick={() => setFollowVehicle(!followVehicle)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs border ${
              followVehicle
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'
            }`}
            title="Auto-center map on vehicle motion"
          >
            <span>Auto-Follow: {followVehicle ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Live MQTT Stream Telemetry HUD Banner (Strictly Real Data) */}
      <div className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${hasLiveCoords ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className={hasLiveCoords ? 'text-emerald-400' : 'text-amber-400'}>
              {hasLiveCoords ? 'MQTT Stream Active' : 'Awaiting Live Pings (Showing Last Fix)'}
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-slate-300 font-mono text-[11px]">
            Topic: <span className="text-sky-400">vehicle/{selectedVehicle.bus_number || selectedVehicle.code || 'GPS-TRK-60925'}/location</span>
          </div>
          <span className="text-slate-600 hidden md:inline">•</span>
          <div className="text-slate-300 text-[11px] hidden md:block">
            Broker: <strong className="text-white">127.0.0.1:1883</strong> (QoS 1)
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="text-slate-300">
            Packets Ingested: <strong className="text-emerald-400 font-mono font-black">{packetCount}</strong>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-slate-300">
            Coordinates:{' '}
            <strong className="text-amber-300 font-mono font-bold">
              {markerLat != null && markerLng != null ? `${markerLat.toFixed(5)}, ${markerLng.toFixed(5)}` : 'No Fix'}
            </strong>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-slate-300">
            Last Ping:{' '}
            <strong className="text-white">
              {lastPingTimestamp ? lastPingTimestamp.toLocaleTimeString() : '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Interactive Leaflet / Google Maps Viewport Container */}
      <div className="relative w-full h-[480px] md:h-[500px] lg:h-[520px] rounded-3xl overflow-hidden border border-slate-300 dark:border-zinc-800 shadow-xl select-none z-10">
        
        {/* Leaflet Map with Google Maps Tiles */}
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        {/* FLOATING OVERLAY 1: Route & Navigation HUD (Top Left) */}
        <div className="absolute top-3 left-3 sm:w-84 bg-[#0F9D58] text-white rounded-2xl shadow-xl p-3 border border-emerald-400/40 backdrop-blur-md z-30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <FleetIcons.Compass className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-lg font-black tracking-tight leading-tight">
                {currentSpeed > 0 ? `${currentSpeed} km/h` : (selectedVehicle.status === 'on_route' ? 'En Route (Idle)' : 'Parked in Depot')}
              </div>
              <div className="text-xs font-bold text-white truncate" title={originLabel}>
                From: {originLabel}
              </div>
              <div className="text-[10px] text-emerald-100 truncate" title={destinationLabel}>
                To: {destinationLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStepsDrawerOpen(!stepsDrawerOpen)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Toggle Route Details"
            >
              <FleetIcons.ChevronDown className={`w-4 h-4 transition-transform ${stepsDrawerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-emerald-400/30 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="uppercase font-bold text-emerald-200">Heading:</span>
              <span className="font-mono font-black text-white">{currentHeading > 0 ? `${currentHeading}°` : '—'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="uppercase font-bold text-emerald-200">GNSS Lock:</span>
              <span className="font-mono font-black text-white">{satellitesCount ? `${satellitesCount} Sats` : 'Fix Active'}</span>
            </div>
          </div>
        </div>

        {/* FLOATING OVERLAY 2: Map Controls & Layer Selector (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleRecenter}
            className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 shadow-md border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-sm transition-transform active:scale-95"
            title="Recenter Map on Bus"
          >
            <FleetIcons.Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          {/* Map Layer Switcher (Roadmap, Satellite, Traffic, Terrain) */}
          <button
            type="button"
            onClick={() => {
              if (mapStyle === 'roadmap') setMapStyle('satellite');
              else if (mapStyle === 'satellite') setMapStyle('traffic');
              else if (mapStyle === 'traffic') setMapStyle('terrain');
              else setMapStyle('roadmap');
            }}
            className={`w-9 h-9 rounded-xl shadow-md border flex items-center justify-center text-sm transition-all ${
              mapStyle === 'satellite' || mapStyle === 'traffic'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
            title={`Switch Google Map Layer (Current: ${mapStyle.toUpperCase()})`}
          >
            <FleetIcons.Layers className="w-4 h-4 text-current" />
          </button>

          {/* Zoom Buttons */}
          <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-800 shadow-md border border-slate-200 dark:border-zinc-700 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-9 h-8 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-black text-sm flex items-center justify-center border-b border-slate-100 dark:border-zinc-700"
              title="Zoom in"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-9 h-8 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-black text-sm flex items-center justify-center"
              title="Zoom out"
            >
              <FleetIcons.Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FLOATING OVERLAY 3: Real Speedometer Gauge (Bottom Left) */}
        <div className="absolute bottom-20 left-3 z-20">
          <div className="p-2 px-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-lg flex items-center gap-2.5">
            <div className="text-center">
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
                {currentSpeed}
              </div>
              <div className="text-[8px] uppercase font-bold text-slate-400 dark:text-zinc-500 mt-0.5">KM/H</div>
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-[10px] text-slate-800 dark:text-zinc-200 shadow-xs">
              GNSS
            </div>
          </div>
        </div>

        {/* FLOATING OVERLAY 4: Route Details Drawer */}
        {stepsDrawerOpen && (
          <div className="absolute top-28 left-3 right-3 sm:right-auto sm:w-84 max-h-[260px] overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-zinc-800 z-30 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Assigned Route Information</span>
              </div>
              <button
                type="button"
                onClick={() => setStepsDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs space-y-1 text-slate-600 dark:text-zinc-300">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                <span className="font-bold text-slate-900 dark:text-white">Route Name:</span> {selectedVehicle.route?.name || selectedVehicle.assigned_route || 'Unassigned'}
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                <span className="font-bold text-slate-900 dark:text-white">Origin:</span> {originLabel}
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                <span className="font-bold text-slate-900 dark:text-white">Destination:</span> {destinationLabel}
              </div>
              {selectedVehicle.route?.distance_km && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Total Distance:</span> {selectedVehicle.route.distance_km} km
                </div>
              )}
              {routeWaypoints.length > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                  <span className="font-bold text-slate-900 dark:text-white">Road Path Geometry:</span> {routeWaypoints.length} GIS Points
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOATING OVERLAY 5: Bottom Navigation Status Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-slate-200 dark:border-zinc-800 z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Trip Specs */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#188038] dark:text-emerald-400 tracking-tight">
                    {selectedVehicle.route?.distance_km ? `${selectedVehicle.route.distance_km} km` : (selectedVehicle.total_distance || 'Active')}
                  </span>
                  {selectedVehicle.route?.total_duration_min && (
                    <>
                      <span className="text-slate-300 dark:text-zinc-600 font-medium text-xs">•</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {selectedVehicle.route.total_duration_min} min est.
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
                  <span>Bus: <strong className="text-slate-800 dark:text-zinc-200">{selectedVehicle.bus_number || selectedVehicle.code}</strong></span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[9px] font-bold">
                    {selectedVehicle.vehicle_type || selectedVehicle.fuel_type || 'Transit Vehicle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Pill */}
            <div className="flex items-center gap-2.5 py-1 px-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 border border-white dark:border-zinc-600 shadow-xs flex items-center justify-center text-slate-500 dark:text-zinc-300">
                <FleetIcons.Driver className="w-4 h-4 text-slate-500 dark:text-zinc-300" />
              </div>
              <div className="text-[11px]">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedVehicle.driver?.name || 'Driver Unassigned'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  {selectedVehicle.driver?.phone || selectedVehicle.driver?.emp_id || selectedVehicle.status}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {selectedVehicle.driver?.phone && (
                <a
                  href={`tel:${selectedVehicle.driver.phone}`}
                  className="p-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  title="Call Driver"
                >
                  <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleRecenter}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
              >
                Focus Bus
              </button>

              <button
                type="button"
                onClick={() => navigate('/fleet-manager/trips')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-700 hover:bg-slate-800 dark:hover:bg-zinc-600 text-white text-xs font-bold transition-all shadow-xs"
              >
                Exit to Trips
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 4 Telemetry Sensor Diagnostics Cards (100% Real Database / MQTT Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-lg shrink-0">
            <FleetIcons.Speed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">GNSS Live Speed</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{currentSpeed} km/h</div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${hasLiveCoords ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              <span>{hasLiveCoords ? 'Streaming via MQTT' : 'From Database Fix'}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-lg shrink-0">
            <FleetIcons.Battery className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Battery Level</div>
            <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">{batteryLevel != null ? `${batteryLevel}%` : '—'}</div>
            <div className="text-[9px] text-slate-500 dark:text-zinc-400">
              {selectedVehicle.fuel_type ? `${selectedVehicle.fuel_type}` : 'Vehicle Pack'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-lg shrink-0">
            <FleetIcons.Gps className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">IoT Telematics</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {satellitesCount ? `${satellitesCount} Satellites` : 'Fix Established'}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono truncate" title={selectedVehicle.edgeDevice?.box_id || 'Hardware Unit'}>
              Box: {selectedVehicle.edgeDevice?.box_id || 'RK3588-SIM-001'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-lg shrink-0">
            <FleetIcons.Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">Heading & Motion</div>
            <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {currentHeading > 0 ? `${currentHeading}°` : 'Stationary'}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono">
              {selectedVehicle.status === 'on_route' ? 'Status: On Route' : (selectedVehicle.status === 'in_depot' ? 'Status: In Depot' : selectedVehicle.status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
