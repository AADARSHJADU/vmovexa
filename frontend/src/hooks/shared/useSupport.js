import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectMyTickets,
  selectAllTickets,
  selectCurrentTicket,
  clearCurrentTicket,
  appendMessageToCurrentTicket,
  updateTicketStatusInState,
  addOrUpdateTicketInLists,
  fetchMyTicketsThunk,
  fetchAllTicketsThunk,
  fetchTicketThunk,
  createTicketThunk,
  addTicketMessageThunk,
  setTicketStatusThunk,
} from '../../store/slices/shared/supportSlice.js';
import { uploadService } from '../../api/services/shared/upload.service.js';
import { getSocket } from '../../api/socket.js';

/** Support tickets — two-way real-time conversation + attachments. Used by all roles + SuperAdmin desk. */
export const useSupport = () => {
  const dispatch = useAppDispatch();
  const myTickets = useAppSelector(selectMyTickets);
  const allTickets = useAppSelector(selectAllTickets);
  const current = useAppSelector(selectCurrentTicket);

  // Global socket listener registration for support real-time events
  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
      if (!socket) return;

      const handleMessage = (msg) => {
        dispatch(appendMessageToCurrentTicket(msg));
      };

      const handleStatus = (data) => {
        dispatch(updateTicketStatusInState(data));
      };

      const handleCreated = (ticket) => {
        dispatch(addOrUpdateTicketInLists(ticket));
      };

      socket.on('support:message', handleMessage);
      socket.on('support:status', handleStatus);
      socket.on('support:created', handleCreated);

      return () => {
        socket.off('support:message', handleMessage);
        socket.off('support:status', handleStatus);
        socket.off('support:created', handleCreated);
      };
    } catch (_) {}
  }, [dispatch]);

  // Subscribe socket to current ticket room when active
  useEffect(() => {
    if (!current?.id) return;
    let socket;
    try {
      socket = getSocket();
      if (socket) {
        socket.emit('subscribe:ticket', current.id);
        return () => {
          socket.emit('unsubscribe:ticket', current.id);
        };
      }
    } catch (_) {}
  }, [current?.id]);

  const loadMyTickets = useCallback((params) => dispatch(fetchMyTicketsThunk(params)).unwrap(), [dispatch]);
  const loadAllTickets = useCallback((params) => dispatch(fetchAllTicketsThunk(params)).unwrap(), [dispatch]);
  const loadTicket = useCallback((id) => dispatch(fetchTicketThunk(id)).unwrap(), [dispatch]);
  const createTicket = useCallback((data) => dispatch(createTicketThunk(data)).unwrap(), [dispatch]);
  const addMessage = useCallback((id, data) => dispatch(addTicketMessageThunk({ id, data })).unwrap(), [dispatch]);
  const setStatus = useCallback((id, status) => dispatch(setTicketStatusThunk({ id, status })).unwrap(), [dispatch]);
  const clearTicket = useCallback(() => dispatch(clearCurrentTicket()), [dispatch]);
  const uploadFile = useCallback((file, purpose = 'support') => uploadService.uploadFile(file, purpose), []);

  return {
    myTickets, allTickets, current,
    loadMyTickets, loadAllTickets, loadTicket, createTicket, addMessage, setStatus, clearTicket, uploadFile,
  };
};

export default useSupport;
