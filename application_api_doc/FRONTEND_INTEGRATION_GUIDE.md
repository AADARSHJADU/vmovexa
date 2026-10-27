# VMOVEXA ONE — Frontend UI Integration Guide (Master Blueprint)

> **Audience:** Frontend Developers & AI Coding Agents  
> **Purpose:** Step-by-step instructions and copy-pasteable patterns for integrating any backend API into the React UI according to VMOVEXA architecture rules.

---

## 🏛️ 1. Architecture Golden Rules & Data Flow

```
React Component / Page
  └── use[Domain]() Hook                  ← ONLY hook is called by UI
        ├── useAppSelector(select[Domain]) ← Reads state reactively
        └── dispatch(fetch[Domain]Thunk()) ← Dispatches action
                  │
                  ▼
      store/thunks/[domain].thunks.js     ← Handles async logic & normalizeError
                  │
                  ▼
      api/services/[domain].service.js    ← Calls apiClient with endpoint & params
                  │
                  ▼
      api/client.js (axios instance)      ← Injects Bearer token & handles 401 refresh
                  │
                  ▼
      Backend Express API (`/api/v1/...`) ← Processes request & queries MySQL
                  │
                  ▼
      Redux Store Updates State           ← extraReducers update slice
                  │
                  ▼
      Component Re-Renders ✅
```

### 🚨 4 Golden Rules (Never Break These):
1. **Components never call Axios / apiClient directly:** Always interact via custom hooks (`useFleetVehicle()`, `useCampaign()`, `useAuth()`).
2. **Hook wraps Redux:** Hook contains `useAppSelector` (for reading state) + `useAppDispatch` (for triggering operations).
3. **Thunks only call Service:** Thunks never write raw HTTP requests; they delegate to corresponding service functions and handle errors with `rejectWithValue(normalizeError(err))`.
4. **Services only call `apiClient`:** Never use native `fetch()` or raw `axios` instances. All requests go through `api/client.js`.

---

## 🛠️ 2. The 5-Step Integration Blueprint (Full Code Example)

Jab bhi koi naya module ya API integrate karna ho, ye 5 files is order mein banayi/update ki jaati hain:

### STEP 1: API Service Layer (`src/api/services/fleet/vehicle.service.js`)

```javascript
import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

// Helper wrapper to unpack response envelope & catch normalized errors
async function call(promise) {
  try {
    const res = await promise;
    // If backend returns paginated metadata
    if (res?.data?.meta || Array.isArray(res?.data?.data?.rows)) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const fleetVehicleService = {
  // GET with pagination & search params
  getVehicles: (params) => call(apiClient.get(ENDPOINTS.FLEET.VEHICLES, { params })),

  // GET by ID
  getVehicle: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}`)),

  // POST Create
  createVehicle: (data) => call(apiClient.post(ENDPOINTS.FLEET.VEHICLES, data)),

  // PATCH Update
  updateVehicle: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}`, data)),

  // DELETE
  deleteVehicle: (id) => call(apiClient.delete(`${ENDPOINTS.FLEET.VEHICLES}/${id}`)),

  // Custom Action
  assignDriver: (id, driverId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/assign-driver`, { driverId })),
};

export default fleetVehicleService;
```

---

### STEP 2: Redux Async Thunks (`src/store/thunks/fleet/vehicle.thunks.js`)

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetVehicleService } from '../../../api/services/fleet/vehicle.service.js';

export const fetchVehiclesThunk = createAsyncThunk(
  'fleet/vehicle/fetchVehicles',
  async (params, { rejectWithValue }) => {
    try {
      return await fleetVehicleService.getVehicles(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createVehicleThunk = createAsyncThunk(
  'fleet/vehicle/createVehicle',
  async (data, { rejectWithValue }) => {
    try {
      return await fleetVehicleService.createVehicle(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateVehicleThunk = createAsyncThunk(
  'fleet/vehicle/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await fleetVehicleService.updateVehicle(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteVehicleThunk = createAsyncThunk(
  'fleet/vehicle/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await fleetVehicleService.deleteVehicle(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
```

---

### STEP 3: Redux Slice (`src/store/slices/fleet/vehicleSlice.js`)

```javascript
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
} from '../../thunks/fleet/vehicle.thunks.js';

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'fleetVehicle',
  initialState,
  reducers: {
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchVehiclesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Supports unwrapPaginated { rows, meta } or raw rows
        const payload = action.payload;
        if (payload?.rows) {
          state.items = payload.rows;
          state.pagination = {
            page: payload.meta?.page || 1,
            limit: payload.meta?.limit || 20,
            total: payload.meta?.total || payload.rows.length,
            totalPages: payload.meta?.totalPages || 1,
          };
        } else if (Array.isArray(payload)) {
          state.items = payload;
          state.pagination.total = payload.length;
        }
      })
      .addCase(fetchVehiclesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch vehicles';
      })

      // Create
      .addCase(createVehicleThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
          state.pagination.total += 1;
        }
      })

      // Update
      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((v) => v.id === updated.id);
        if (index !== -1) state.items[index] = updated;
      })

      // Delete
      .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((v) => v.id !== id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { clearVehicleError } = vehicleSlice.actions;

// Selectors
export const selectVehicles = (state) => state.fleetVehicle.items;
export const selectVehiclePagination = (state) => state.fleetVehicle.pagination;
export const selectVehicleLoading = (state) => state.fleetVehicle.loading;
export const selectVehicleError = (state) => state.fleetVehicle.error;

export default vehicleSlice.reducer;
```

> **Remember:** Register reducer in `src/store/index.js` under `combineReducers`:  
> `fleetVehicle: vehicleReducer`

---

### STEP 4: Custom Domain Hook (`src/hooks/fleet/useFleetVehicle.js`)

```javascript
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectVehicles,
  selectVehiclePagination,
  selectVehicleLoading,
  selectVehicleError,
} from '../../store/slices/fleet/vehicleSlice.js';
import {
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
} from '../../store/thunks/fleet/vehicle.thunks.js';

export const useFleetVehicle = () => {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectVehicles);
  const pagination = useAppSelector(selectVehiclePagination);
  const loading = useAppSelector(selectVehicleLoading);
  const error = useAppSelector(selectVehicleError);

  // Wrap dispatch with .unwrap() so components can await promises cleanly
  const loadVehicles = useCallback(
    (params) => dispatch(fetchVehiclesThunk(params)).unwrap(),
    [dispatch]
  );

  const createVehicle = useCallback(
    (data) => dispatch(createVehicleThunk(data)).unwrap(),
    [dispatch]
  );

  const updateVehicle = useCallback(
    (id, data) => dispatch(updateVehicleThunk({ id, data })).unwrap(),
    [dispatch]
  );

  const deleteVehicle = useCallback(
    (id) => dispatch(deleteVehicleThunk(id)).unwrap(),
    [dispatch]
  );

  return {
    vehicles,
    pagination,
    loading,
    error,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};

export default useFleetVehicle;
```

---

### STEP 5: React Component UI Implementation (`src/pages/fleet-manager/VehiclesPage.jsx`)

Below is the complete, standard UI template containing:
- Debounced search input (300ms)
- Status filter tabs
- Table view with loading skeleton
- Global `<Pagination />` integration
- Action modal & `react-hot-toast` notifications

```jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const VehiclesPage = () => {
  const { vehicles, pagination, loading, loadVehicles, deleteVehicle } = useFleetVehicle();

  // Local State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Active', 'Maintenance', 'Inactive'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  // 1. Debounce Search Input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Data on page / search / filter change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab !== 'All') params.status = activeTab.toLowerCase();

    loadVehicles(params).catch((err) => {
      toast.error(err.message || 'Failed to load vehicles');
    });
  }, [currentPage, pageSize, debouncedSearch, activeTab, loadVehicles]);

  // 3. Handle Delete with Toast Promise
  const handleDelete = async (id, regNumber) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${regNumber}?`)) return;

    setDeletingId(id);
    try {
      await toast.promise(deleteVehicle(id), {
        loading: 'Deleting vehicle...',
        success: 'Vehicle removed successfully!',
        error: (err) => err.message || 'Failed to delete vehicle',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operations', href: '/fleet-manager/dashboard' },
          { label: 'Vehicles' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Transit Fleet Vehicles
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage buses, edge boxes, GPS devices, and route assignments.
          </p>
        </div>

        <button
          onClick={() => alert('Open Add Vehicle Modal')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          <FleetIcons.Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['All', 'Active', 'Maintenance', 'Inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registration, VIN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Registration</th>
                <th className="px-6 py-3.5">Model</th>
                <th className="px-6 py-3.5">Fleet Division</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
              {loading ? (
                // Shimmer Loading Skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-36" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-16" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500">
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                // Real Data Rows
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">
                      {v.registration_number}
                    </td>
                    <td className="px-6 py-4">{v.make} {v.model} ({v.year})</td>
                    <td className="px-6 py-4">{v.fleet_name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(v.id, v.registration_number)}
                        disabled={deletingId === v.id}
                        className="text-rose-600 hover:text-rose-700 font-bold transition-all disabled:opacity-50"
                      >
                        {deletingId === v.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Global Reusable Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total || 0}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};
```

---

## 📁 3. Multipart File Uploads Integration Pattern

Creative assets (Campaign videos/banners) aur Driver KYC / Vehicle RC documents ko upload karne ka standard pattern:

```javascript
import { commonService } from '../../api/services/common.service';
import toast from 'react-hot-toast';

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Instant local Blob URL preview for UI
  const previewUrl = URL.createObjectURL(file);
  setLocalPreview(previewUrl);

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'campaign_media');

  // 3. Upload with Progress
  const tid = toast.loading('Uploading media asset (0%)...');
  try {
    const res = await commonService.uploadMedia(formData, (progressEvent) => {
      const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      toast.loading(`Uploading media asset (${pct}%)...`, { id: tid });
    });

    toast.success('Media uploaded successfully!', { id: tid });
    setUploadedFileUrl(res.url); // Use this permanent URL in campaign creation payload
  } catch (err) {
    toast.error(err.message || 'Upload failed', { id: tid });
  }
};
```

---

## ⚡ 4. Real-Time Socket.IO Telemetry Integration

Transit bus GPS markers live move karne ke liye component mein Socket.IO ka standard usage:

```javascript
import React, { useEffect } from 'react';
import { getSocket } from '../../api/socket';

export const LiveTrackingComponent = ({ vehicleId }) => {
  useEffect(() => {
    const socket = getSocket();

    // 1. Subscribe to vehicle telematics room
    socket.emit('subscribe:vehicle', vehicleId);

    // 2. Listen to real-time telemetry updates
    const handleTelemetry = (data) => {
      console.log('Live GPS packet received:', data.lat, data.lng, data.speed);
      // Smoothly update marker coordinates on Mapbox / Google Maps
      updateMapMarker(data.lat, data.lng);
    };

    socket.on('vehicle:telemetry', handleTelemetry);

    // 3. Cleanup on unmount
    return () => {
      socket.emit('unsubscribe:vehicle', vehicleId);
      socket.off('vehicle:telemetry', handleTelemetry);
    };
  }, [vehicleId]);

  return <div>Tracking Bus Live...</div>;
};
```

---

## 🔔 5. Global Toast Notification System (`react-hot-toast`)

Page-level static alert divs banane ki zaroorat nahi hai. Sirf `react-hot-toast` use karo:

```javascript
import toast from 'react-hot-toast';

// 1. Success Notification
toast.success('Vehicle registered successfully!');

// 2. Error Notification (from normalized API error)
toast.error(err.message || 'Operation failed');

// 3. Loading Toast with Manual Dismiss
const tid = toast.loading('Exporting CSV report...');
await exportReport();
toast.dismiss(tid);
toast.success('Download ready!');

// 4. Promise Pattern (Best Recommended Pattern)
toast.promise(
  saveCampaignData(payload),
  {
    loading: 'Submitting campaign for SuperAdmin review...',
    success: 'Campaign submitted! Verification SMS sent.',
    error: (err) => err.message || 'Submission failed.',
  }
);
```

---

## 🧭 6. Subpage UI Standards & Layout Guidelines

### 1. Breadcrumbs Component (`src/components/ui/Breadcrumb.jsx`)
Har subpage ke top par standard `<Breadcrumb />` lagana mandatory hai:
- **Root Dashboards (Rule):** `/fleet-manager/dashboard`, `/driver/dashboard`, `/admin/dashboard` etc. par breadcrumb **NAHI** lagega.
- **Subpages (Rule):** `/fleet-manager/fleets`, `/admin/slots`, `/superadmin/activity` etc. par standard hierarchy lagegi:

```jsx
import { Breadcrumb } from '../../components/ui/Breadcrumb';

// Inside component render:
<Breadcrumb
  items={[
    { label: 'Fleet Operations', to: '/fleet-operator/dashboard' },
    { label: 'Vehicle Slots & Timetables' },
  ]}
  className="mb-2"
/>
```

### 2. SVG `FleetIcons` Standard (No Raw Emojis)
Raw unicode emojis (e.g. 🚌, 🚗, ⏰, 🗑️) strictly prohibited hain. Always import SVG icons from `src/components/FleetIcons.jsx`:
```jsx
import { FleetIcons } from '../../components/FleetIcons';

<FleetIcons.Bus className="w-5 h-5 text-blue-500" />
<FleetIcons.Clock className="w-4 h-4 text-zinc-400" />
<FleetIcons.Search className="w-4 h-4 text-zinc-400" />
```

### 3. Responsive Header & Action Buttons
Header container must be responsive across mobile screens:
```jsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
  <div>
    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Vehicle Timetable Slots</h1>
    <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage shift assignments and prevent schedule double-booking</p>
  </div>
  <div className="flex items-center gap-2 w-full sm:w-auto">
    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
      + New Slot
    </button>
  </div>
</div>
```

### 4. Dark Mode Color Tokens
Standardize to the official VMOVEXA dark mode palette:
- Main Page Container: `min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-white`
- Cards / Panels: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl`
- Table Headers: `bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800`
- Table Rows: `border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40`

---

## 🕒 7. Complex Domain Example: Vehicle Slots & Timetables

### Hook Usage (`useVehicleSlot`)
```javascript
import { useVehicleSlot } from '../../hooks/fleet/useVehicleSlot';

const MySlotsPage = () => {
  const {
    slots,
    timetable,
    loading,
    conflictResult,
    checkConflict,
    createVehicleSlot,
    fetchTimetableGrid,
  } = useVehicleSlot();

  // Check collision in real-time on modal form change
  const handleTimeChange = async (startTime, endTime, vehicleId, days) => {
    const conflict = await checkConflict({
      vehicle_id: vehicleId,
      start_time: startTime,
      end_time: endTime,
      operating_days: days,
    });

    if (conflict?.hasConflict) {
      toast.error(conflict.message);
    }
  };

  // ...
};
```

