import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { fleetVehicleService } from '../../api/services/fleet/vehicle.service';
import { uploadFile } from '../../api/services/upload.service';

export const EditVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateVehicle, loadVehicles, assignGps } = useFleetVehicle();
  const { fleets, loadFleets } = useFleetManager();
  const { devices, loadDevices } = useFleetGps();

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [existingDocs, setExistingDocs] = useState([]);

  const fleetList = Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const [formData, setFormData] = useState({
    fleetId: '',
    fleetName: '',
    plate: '',
    chassisNumber: '',
    model: '',
    capacity: '42 Seater',
    vehicleType: 'Non-Sleeper',
    fuelType: 'Electric (EV)',
    assignedRoute: 'Route 101: Indiranagar to Majestic',
    source: 'Indiranagar Central',
    destination: 'Kempegowda Bus Station (Majestic)',
    gpsDeviceId: '',
    status: 'Active',
  });

  const [displayScreens, setDisplayScreens] = useState({
    leftSide: 2,
    rightSide: 2,
    rear: 1,
    emergencyExit: 1,
  });

  const totalDisplays = displayScreens.leftSide + displayScreens.rightSide + displayScreens.rear + displayScreens.emergencyExit;

  const [newDocuments, setNewDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => { loadFleets().catch(() => {}); }, [loadFleets]);
  useEffect(() => { loadDevices().catch(() => {}); }, [loadDevices]);

  useEffect(() => {
    let active = true;
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const data = await fleetVehicleService.getVehicle(id);
        if (active && data) {
          setVehicle(data);
          setFormData({
            fleetId: data.fleet_id ? String(data.fleet_id) : '',
            fleetName: data.fleet?.name || '',
            plate: data.bus_number || '',
            chassisNumber: data.vin || data.chassis_number || '',
            model: data.model || '',
            capacity: data.capacity || '42 Seater',
            vehicleType: data.vehicle_type || 'Non-Sleeper',
            fuelType: data.fuel_type || 'Electric (EV)',
            assignedRoute: 'Route 101: Indiranagar to Majestic',
            source: data.source || '',
            destination: data.destination || '',
            gpsDeviceId: '',
            status: (data.status === 'offline' || data.status === 'Inactive') ? 'Inactive' : (data.status === 'pending_approval' ? 'Pending Approval' : (data.status === 'rejected' ? 'Rejected' : 'Active')),
          });
          if (data.displays_count) {
            const part = Math.max(0, Math.floor(data.displays_count / 4));
            setDisplayScreens({
              leftSide: part,
              rightSide: part,
              rear: part,
              emergencyExit: data.displays_count - (part * 3),
            });
          }
          if (Array.isArray(data.documents)) {
            setExistingDocs(data.documents);
          }
        }
      } catch (err) {
        toast.error('Failed to load vehicle details');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) fetchVehicle();
    return () => { active = false; };
  }, [id]);

  const updateScreenCount = (key, delta) => {
    setDisplayScreens(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    try {
      setUploadingDoc(docType);
      const res = await uploadFile(file, 'vehicle_document');
      const fileUrl = res?.url || res?.file_url || (typeof res === 'string' ? res : URL.createObjectURL(file));
      const docItem = {
        doc_type: docType,
        file_url: fileUrl,
        name: file.name,
        uploaded_at: new Date(),
        approval_status: 'pending',
      };
      setNewDocuments(prev => [...prev.filter(d => d.doc_type !== docType), docItem]);
      toast.success(`${docType.toUpperCase().replace('_', ' ')} uploaded!`);
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plate) return;

    const payload = {
      bus_number: formData.plate,
      vin: formData.chassisNumber,
      chassis_number: formData.chassisNumber,
      vehicle_type: formData.vehicleType,
      model: formData.model,
      capacity: formData.capacity,
      fuel_type: formData.fuelType,
      fleet_id: formData.fleetId || null,
      source: formData.source,
      destination: formData.destination,
      displays_count: totalDisplays,
      documents: newDocuments,
    };

    if (formData.status === 'Inactive') {
      payload.status = 'offline';
    }

    try {
      await toast.promise(updateVehicle(id, payload), {
        loading: 'Updating vehicle...',
        success: 'Vehicle updated successfully!',
        error: (err) => err?.message || 'Failed to update vehicle',
      });

      if (formData.gpsDeviceId) {
        await assignGps(id, formData.gpsDeviceId).catch(() => {});
      }

      await loadVehicles().catch(() => {});
      navigate('/fleet-manager/vehicles');
    } catch {
      /* handled by toast */
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Vehicles Directory', path: '/fleet-manager/vehicles' },
          { label: vehicle?.bus_number ? `Vehicle ${vehicle.bus_number}` : `Vehicle #${id}` },
          { label: 'Edit Vehicle' },
        ]}
        className="mb-2"
      />

      {/* Header Container */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/fleet-manager/vehicles')} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Back to Vehicles"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Edit Vehicle {vehicle?.bus_number ? `(${vehicle.bus_number})` : `#${id}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Update vehicle profile, route assignments, specifications, and uploaded compliance documents.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => navigate('/fleet-manager/vehicles')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        
        {/* Section 1: Vehicle Specification */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm">
                <FleetIcons.Bus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Fleet & Vehicle Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Registration, model, chassis number, and seating.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Assigned Fleet:</span>
              <select
                value={formData.fleetId}
                onChange={(e) => {
                  const selected = fleetList.find(f => String(f.id) === String(e.target.value));
                  setFormData({ ...formData, fleetId: e.target.value, fleetName: selected?.name || '' });
                }}
                className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">No Fleet Assigned</option>
                {fleetList.map((f) => (
                  <option key={f.id} value={f.id}>{f.name ?? f.code ?? f.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Chassis / VIN</label>
              <input
                type="text"
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Model Name / Number</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Vehicle Capacity</label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Powertrain / Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Electric (EV)">Electric (EV) Battery</option>
                <option value="CNG">CNG Clean Transit</option>
                <option value="Diesel">Diesel Heavy Engine</option>
                <option value="Hybrid">Hybrid Powertrain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Route */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Route Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Source Station</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Destination Station</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vehicle Documents (Approval Workflow) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Vehicle Documents & Admin Verification
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Uploaded compliance papers are submitted to admin for verification and approval.
            </p>
          </div>

          {/* Existing Documents List */}
          {existingDocs.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Existing Uploaded Documents</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">{doc.doc_type?.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Uploaded: {new Date(doc.uploaded_at || doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        doc.approval_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : doc.approval_status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {doc.approval_status ? doc.approval_status.toUpperCase() : 'PENDING'}
                      </span>
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[10px] font-bold flex items-center gap-1"
                        >
                          <FleetIcons.Eye className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Documents */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Upload / Update Documents</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { type: 'rc', label: 'RC Document', IconComp: FleetIcons.FileText },
                { type: 'fitness', label: 'Fitness Cert', IconComp: FleetIcons.File },
                { type: 'transport_license', label: 'Transport License', IconComp: FleetIcons.CheckCircle },
                { type: 'insurance', label: 'Insurance Policy', IconComp: FleetIcons.Shield },
              ].map(({ type, label, IconComp }) => {
                const newDoc = newDocuments.find(d => d.doc_type === type);
                const isUploading = uploadingDoc === type;
                return (
                  <label
                    key={type}
                    className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      newDoc 
                        ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' 
                        : 'border-slate-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(type, e.target.files[0]);
                      }}
                    />
                    {isUploading ? (
                      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin my-3"></div>
                    ) : newDoc ? (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm mb-1 font-bold">
                          <FleetIcons.Check className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{newDoc.name || label}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">New File Uploaded</div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm mb-1">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{label}</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Upload File</div>
                      </>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Display Screen Config */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Display Screen Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">IoT Advertising Screens</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
              {totalDisplays} Displays Installed
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'leftSide', label: 'Left Side' },
              { key: 'rightSide', label: 'Right Side' },
              { key: 'rear', label: 'Rear' },
              { key: 'emergencyExit', label: 'Emergency Exit' },
            ].map(({ key, label }) => (
              <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">{label}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateScreenCount(key, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 font-bold flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white w-6">{displayScreens[key]}</span>
                  <button
                    type="button"
                    onClick={() => updateScreenCount(key, 1)}
                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: GPS */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-3">
            5. GPS Device Assignment
          </h2>
          <div className="max-w-md">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Assign Active GPS Unit</label>
            <select
              value={formData.gpsDeviceId}
              onChange={(e) => setFormData({ ...formData, gpsDeviceId: e.target.value })}
              className="w-full h-11 mt-1 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="">Keep current GPS / Unassigned</option>
              {gpsList.map((g) => (
                <option key={g.id} value={g.id}>
                  {(g.code ?? g.id)} ({g.model ?? '—'}{g.status ? ` - ${g.status}` : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <button
            type="button"
            onClick={() => navigate('/fleet-manager/vehicles')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>Save Vehicle Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVehiclePage;
