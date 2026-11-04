import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMyTicketsThunk,
  fetchAllTicketsThunk,
  fetchTicketThunk,
  createTicketThunk,
  addTicketMessageThunk,
  setTicketStatusThunk,
} from '../../thunks/shared/support.thunks.js';

export {
  fetchMyTicketsThunk,
  fetchAllTicketsThunk,
  fetchTicketThunk,
  createTicketThunk,
  addTicketMessageThunk,
  setTicketStatusThunk,
};

const initialState = {
  myTickets: [],
  allTickets: [],
  current: null,
  status: 'idle',
  error: null,
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearCurrentTicket(state) { state.current = null; },
    appendMessageToCurrentTicket(state, action) {
      const msg = action.payload;
      if (!msg) return;
      if (state.current && (state.current.id === msg.ticket_id || String(state.current.id) === String(msg.ticket_id))) {
        if (!state.current.messages) state.current.messages = [];
        const exists = state.current.messages.some((m) => m.id === msg.id);
        if (!exists) {
          state.current.messages.push(msg);
        }
      }
    },
    updateTicketStatusInState(state, action) {
      const { id, status } = action.payload || {};
      if (!id || !status) return;
      if (state.current && (state.current.id === id || String(state.current.id) === String(id))) {
        state.current.status = status;
      }
      const updateList = (list) => {
        if (Array.isArray(list)) {
          const item = list.find((t) => t.id === id || String(t.id) === String(id));
          if (item) item.status = status;
        }
      };
      updateList(state.myTickets);
      updateList(state.allTickets);
    },
    addOrUpdateTicketInLists(state, action) {
      const ticket = action.payload;
      if (!ticket || !ticket.id) return;
      const pushOrUpdate = (list) => {
        if (Array.isArray(list)) {
          const idx = list.findIndex((t) => t.id === ticket.id || String(t.id) === String(ticket.id));
          if (idx >= 0) list[idx] = { ...list[idx], ...ticket };
          else list.unshift(ticket);
        }
      };
      pushOrUpdate(state.myTickets);
      pushOrUpdate(state.allTickets);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTicketsThunk.fulfilled, (state, action) => { state.myTickets = action.payload; })
      .addCase(fetchAllTicketsThunk.fulfilled, (state, action) => { state.allTickets = action.payload; })
      .addCase(fetchTicketThunk.fulfilled, (state, action) => { state.current = action.payload; });
  },
});

export default supportSlice.reducer;
export const {
  clearCurrentTicket,
  appendMessageToCurrentTicket,
  updateTicketStatusInState,
  addOrUpdateTicketInLists,
} = supportSlice.actions;
export const selectMyTickets = (state) => state.support.myTickets;
export const selectAllTickets = (state) => state.support.allTickets;
export const selectCurrentTicket = (state) => state.support.current;
