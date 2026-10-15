/**
 * useVehicleTracking — subscribes to live `vehicle:position` events over Socket.IO.
 *
 * Tenant users auto-join their `org:<id>` room on connect, so this hook receives
 * position updates for every vehicle in the org. It keeps a map of the latest
 * position per vehicleId and exposes it as `positions`.
 *
 * Optionally pass a `vehicleId` to also emit `subscribe:vehicle` for that vehicle
 * (useful on a single-vehicle live page). Returns `{ positions, connected, getPosition }`.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../../api/socket.js';

export function useVehicleTracking(vehicleId = null) {
  const [positions, setPositions] = useState({}); // { [vehicleId]: { lat, lng, speed, heading, at } }
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onPosition = (payload) => {
      if (!payload || payload.vehicleId == null) return;
      setPositions((prev) => ({ ...prev, [payload.vehicleId]: payload }));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('vehicle:position', onPosition);
    if (socket.connected) setConnected(true);

    if (vehicleId != null) socket.emit('subscribe:vehicle', vehicleId);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('vehicle:position', onPosition);
      if (vehicleId != null) socket.emit('unsubscribe:vehicle', vehicleId);
    };
  }, [vehicleId]);

  const getPosition = useCallback((id) => positions[id] || null, [positions]);

  return { positions, connected, getPosition };
}

export default useVehicleTracking;
