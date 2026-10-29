import { createAsyncThunk } from '@reduxjs/toolkit';
import { supportService } from '../../../api/services/shared/support.service.js';

export const fetchMyTicketsThunk = createAsyncThunk(
  'support/fetchMine',
  async (params, { rejectWithValue }) => {
    try { return await supportService.myTickets(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchAllTicketsThunk = createAsyncThunk(
  'support/fetchAll',
  async (params, { rejectWithValue }) => {
    try { return await supportService.allTickets(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTicketThunk = createAsyncThunk(
  'support/fetchOne',
  async (id, { rejectWithValue }) => {
    try { return await supportService.getTicket(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createTicketThunk = createAsyncThunk(
  'support/create',
  async (data, { rejectWithValue }) => {
    try { return await supportService.createTicket(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const addTicketMessageThunk = createAsyncThunk(
  'support/addMessage',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await supportService.addMessage(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const setTicketStatusThunk = createAsyncThunk(
  'support/setStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await supportService.setStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);
