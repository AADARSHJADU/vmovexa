import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';
import { useAdminRoute } from '../../hooks/admin/useAdminRoute';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { adminVehicleService } from '../../api/services/admin/vehicle.service';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const AddVehiclePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const location = useLocation();

  // Detect if rendered inside Fleet Portal (/fleet-operator/*)
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/vehicles' : '/admin/vehicles';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';

  const { user, hasPermission } = useAuth();
  const canCreate = !isFleetPortal || hasPermission('fleet.vehicles.create');
  const canUpdate = !isFleetPortal || hasPermission('fleet.vehicles.update');
  const canAccessForm = isEditMode ? canUpdate : canCreate;

  const { createVehicle, updateVehicle, loadVehicles, assignGps, assignDriver } = useAdminVehicle();
  const { depots, loadDepots } = useAdminDepot();
  const { drivers, loadDrivers } = useAdminDriver();
  const { routes, loadRoutes } = useAdminRoute();
  const { fleetOperators, loadFleetOperators } = useAdminFleetOperator();

  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const driversList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const routesList = Array.isArray(routes) ? routes : (routes?.items || routes?.rows || []);
  const fleetOperatorsList = Array.isArray(fleetOperators) ? fleetOperators : (fleetOperators?.items || fleetOperators?.rows || []);

  const queryFleetId = new URLSearchParams(location.search).get('fleetId') || new URLSearchParams(location.search).get('fleet_id');

  // For Fleet Portal: auto-detect operator's fleet and assigned depot
  const myFleet = isFleetPortal
    ? (fleetOperatorsList.find((f) => String(f.id) === String(user?.id) || (f.email && f.email === user?.email) || f.name === user?.name) || {
        id: user?.fleet_id || user?.id,
        name: user?.fleet_name || user?.name || 'My Fleet',
      })
    : null;

  const rawDepotId = user?.fleetOperatorProfile?.depot_id || myFleet?.depot_id || myFleet?.depot?.id;
  const myDepot = rawDepotId
    ? (depotsList.find((d) => String(d.id) === String(rawDepotId)) || user?.fleetOperatorProfile?.depot || myFleet?.depot || { id: rawDepotId, name: `Depot #${rawDepotId}` })
    : (user?.fleetOperatorProfile?.depot || myFleet?.depot);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busPhotos, setBusPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [documents, setDocuments] = useState({
    rc: null,
    fitness: null,
    transport_license: null,
    insurance: null,
  });
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const [formData, setFormData] = useState({
    fleetId: '',
    fleetName: '',
    plate: '',
    chassisNumber: '',
    model: '',
    capacity: '42 Seater',
    vehicleType: 'Non-Sleeper',
    fuelType: 'Electric (EV)',
    routeId: '',
    assignedRoute: '',
    source: '',
    destination: '',
    gpsDeviceId: '',
    assignedDriverId: '',
    status: isFleetPortal ? 'pending_approval' : 'Active',
    depotId: '',
  });

  // Display Screen Configuration Counters
  const [displayScreens, setDisplayScreens] = useState({
    leftSide: 2,
    rightSide: 2,
    rear: 1,
    emergencyExit: 1,
  });

  const totalDisplays = displayScreens.leftSide + displayScreens.rightSide + displayScreens.rear + displayScreens.emergencyExit;

  const updateScreenCount = (key, delta) => {
    setDisplayScreens((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const vehicleTypeTags = ['24L Sleeper', 'Non-Sleeper', 'Mini Bus', 'AC Bus', 'Electric Bus'];

  useEffect(() => {
    loadDepots().catch(() => {});
    loadDrivers().catch(() => {});
    loadRoutes({ limit: 100, status: 'active' }).catch(() => {});
    loadFleetOperators({ limit: 100 }).catch(() => {});
  }, [loadDepots, loadDrivers, loadRoutes, loadFleetOperators]);

  useEffect(() => {
    if (!isEditMode && queryFleetId) {
      const matched = fleetOperatorsList.find((f) => String(f.id) === String(queryFleetId));
      setFormData((prev) => ({
        ...prev,
        fleetId: String(queryFleetId),
        fleetName: matched ? matched.name : prev.fleetName,
      }));
    } else if (!isEditMode && isFleetPortal) {
      const fleetId = myFleet?.id ? String(myFleet.id) : (user?.id ? String(user.id) : '');
      const fleetName = myFleet?.name || user?.name || '';
      const depotId = rawDepotId ? String(rawDepotId) : (myDepot?.id ? String(myDepot.id) : '');

      setFormData((prev) => ({
        ...prev,
        fleetId: prev.fleetId || fleetId,
        fleetName: prev.fleetName || fleetName,
        depotId: prev.depotId || depotId,
      }));
    }
  }, [isEditMode, queryFleetId, isFleetPortal, fleetOperatorsList, user, rawDepotId]);

  useEffect(() => {
    if (isEditMode && id) {
      adminVehicleService.getVehicle(id)
        .then((found) => {
          if (found) {
            setFormData({
              fleetId: found.fleet_id ? String(found.fleet_id) : '',
              fleetName: found.fleet?.name || '',
              plate: found.bus_number || found.busNumber || found.code || '',
              chassisNumber: found.vin || found.chassis_number || '',
              model: found.model || '',
              capacity: found.capacity || '42 Seater',
              vehicleType: found.vehicle_type || 'Non-Sleeper',
              fuelType: found.fuel_type || 'Electric (EV)',
              routeId: found.route_id ? String(found.route_id) : '',
              assignedRoute: found.assigned_route || (found.route?.name) || '',
              source: found.source || (found.route?.start_point) || '',
              destination: found.destination || (found.route?.end_point) || '',
              gpsDeviceId: found.edgeDevice?.box_id || found.edgeDevice?.serial_number || found.gps_device_id || (found.edge_device_id ? String(found.edge_device_id) : ''),
              assignedDriverId: found.assigned_driver_id ? String(found.assigned_driver_id) : (found.driver?.id ? String(found.driver.id) : ''),
              status: (found.status === 'offline' || found.status === 'Inactive') ? 'Inactive' : 'Active',
              depotId: found.depot_id ? String(found.depot_id) : '',
            });

            // Populate display screens layout
            if (found.displayLayout) {
              setDisplayScreens({
                leftSide: Number(found.displayLayout.left_side ?? 2),
                rightSide: Number(found.displayLayout.right_side ?? 2),
                rear: Number(found.displayLayout.rear ?? 1),
                emergencyExit: Number(found.displayLayout.emergency_exit ?? 1),
              });
            } else if (found.displays_count) {
              const perSide = Math.max(1, Math.floor(found.displays_count / 3));
              setDisplayScreens({ leftSide: perSide, rightSide: perSide, rear: 1, emergencyExit: 1 });
            }

            // Populate compliance documents
            if (Array.isArray(found.documents)) {
              const docsState = { rc: null, fitness: null, transport_license: null, insurance: null };
              found.documents.forEach((d) => {
                const dt = (d.doc_type || d.category || d.purpose || '').toLowerCase();
                if (dt === 'rc') docsState.rc = { doc_type: 'rc', file_url: d.file_url || d.url, name: d.name || 'RC Document', uploaded: true, approval_status: d.approval_status };
                else if (dt === 'fitness') docsState.fitness = { doc_type: 'fitness', file_url: d.file_url || d.url, name: d.name || 'Fitness Certificate', uploaded: true, approval_status: d.approval_status };
                else if (dt === 'transport_license') docsState.transport_license = { doc_type: 'transport_license', file_url: d.file_url || d.url, name: d.name || 'Transport License', uploaded: true, approval_status: d.approval_status };
                else if (dt === 'insurance') docsState.insurance = { doc_type: 'insurance', file_url: d.file_url || d.url, name: d.name || 'Insurance Policy', uploaded: true, approval_status: d.approval_status };
              });
              setDocuments(docsState);

              // Populate bus photos (deduplicated by URL)
              const photoDocs = found.documents
                .filter((d) => d.doc_type === 'bus_photo' || d.category === 'bus_photo' || d.purpose === 'bus_photo');
              const uniquePhotosMap = new Map();
              photoDocs.forEach((d) => {
                const u = d.file_url || d.url;
                if (u && !uniquePhotosMap.has(u)) {
                  uniquePhotosMap.set(u, {
                    id: d.id || Date.now() + Math.random(),
                    url: u,
                    name: d.name || 'Bus Photo',
                  });
                }
              });
              const photoList = Array.from(uniquePhotosMap.values());
              if (photoList.length) setBusPhotos(photoList);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load vehicle details for edit mode:', err);
        });
    }
  }, [id, isEditMode]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        if (Object.keys(updated).length === 0) {
          setFormError(null);
        }
        return updated;
      });
    }
  };

  const handleFleetChange = (val) => {
    const foundOpr = fleetOperatorsList.find((f) => String(f.id) === String(val));
    const autoDepotId = foundOpr?.depot_id || foundOpr?.depot?.id || '';
    setFormData((prev) => ({
      ...prev,
      fleetId: val,
      fleetName: foundOpr ? foundOpr.name : '',
      ...(autoDepotId ? { depotId: String(autoDepotId) } : {}),
    }));
    if (fieldErrors.fleetId) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.fleetId;
        if (autoDepotId) delete next.depotId;
        if (Object.keys(next).length === 0) setFormError(null);
        return next;
      });
    }
  };

  const handleRouteChange = (val) => {
    const picked = routesList.find(
      (r) => String(r.id) === val || r.name === val || r.code === val
    );
    if (picked) {
      setFormData((prev) => ({
        ...prev,
        routeId: String(picked.id),
        assignedRoute: picked.name,
        source: picked.start_point || prev.source,
        destination: picked.end_point || prev.destination,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        routeId: '',
        assignedRoute: val,
      }));
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.assignedRoute;
      if (picked?.start_point) delete next.source;
      if (picked?.end_point) delete next.destination;
      if (Object.keys(next).length === 0) setFormError(null);
      return next;
    });
  };

  const handleFileUpload = (docType, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        doc_type: docType,
        file: file,
        previewUrl: previewUrl,
        name: file.name,
        uploaded: false,
      },
    }));
    toast.success(`${docType.toUpperCase().replace(/_/g, ' ')} selected!`);
  };

  const handleBusPhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newList = files.map((file) => ({
      id: Date.now() + Math.random() + Math.random(),
      file: file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      uploaded: false,
    }));
    setBusPhotos((prev) => [...prev, ...newList]);
    toast.success(`${newList.length} bus photo(s) selected!`);
  };

  const removeBusPhoto = (photoId) => {
    setBusPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const validateVehicleForm = () => {
    const errors = {};

    // 1. Registration Plate Number
    if (!formData.plate || !formData.plate.trim()) {
      errors.plate = 'Registration Plate Number is required.';
    } else if (formData.plate.trim().length < 5) {
      errors.plate = 'Registration plate must be at least 5 characters (e.g. MH12AB1234).';
    } else if (!/^[A-Z0-9\s-]{5,20}$/i.test(formData.plate.trim())) {
      errors.plate = 'Invalid plate format. Letters, numbers, and dashes only.';
    }

    // 2. Chassis Number / VIN
    if (!formData.chassisNumber || !formData.chassisNumber.trim()) {
      errors.chassisNumber = 'Chassis Number / VIN is required.';
    } else if (formData.chassisNumber.trim().length < 6) {
      errors.chassisNumber = 'Chassis / VIN number must be at least 6 characters.';
    } else if (!/^[A-Z0-9-]{6,30}$/i.test(formData.chassisNumber.trim())) {
      errors.chassisNumber = 'Invalid Chassis/VIN format. Alphanumeric characters only.';
    }

    // 3. Model Number
    if (!formData.model || !formData.model.trim()) {
      errors.model = 'Model Number / Name is required.';
    } else if (formData.model.trim().length < 2) {
      errors.model = 'Model must be at least 2 characters (e.g. Volvo B400 Electric).';
    }

    // 4. Vehicle Capacity
    if (!formData.capacity || !formData.capacity.trim()) {
      errors.capacity = 'Vehicle seating capacity is required (e.g. 42 Seater).';
    }

    // 5. Fleet Assignment (only required for Admin)
    if (!formData.fleetId && !isFleetPortal) {
      errors.fleetId = 'Please select an assigned fleet operator.';
    }

    // 6. Depot Assignment (only required for Admin)
    if (!formData.depotId && !isFleetPortal) {
      errors.depotId = 'Please select an assigned home depot.';
    }

    // 7. Route Information
    if (!formData.routeId && (!formData.assignedRoute || !formData.assignedRoute.trim())) {
      errors.assignedRoute = 'Please select or specify an assigned transit route.';
    }

    // 8. Source Station
    if (!formData.source || !formData.source.trim()) {
      errors.source = 'Source station is required.';
    }

    // 9. Destination Terminal
    if (!formData.destination || !formData.destination.trim()) {
      errors.destination = 'Destination terminal is required.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const clientErrors = validateVehicleForm();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Please complete all mandatory vehicle details marked with an asterisk (*).');
      toast.error('Validation error: Please complete required vehicle details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    const submitStatus = isFleetPortal
      ? 'pending_approval'
      : (formData.status === 'Active' || formData.status === 'in_depot' ? 'in_depot' : 'offline');

    try {
      // 1. Upload pending compliance documents on form submit
      const uploadedDocs = [];
      for (const [key, doc] of Object.entries(documents)) {
        if (!doc) continue;
        if (doc.file) {
          try {
            const res = await uploadFile(doc.file, 'vehicle_document');
            const fileUrl = res?.url || res?.file_url || (typeof res === 'string' ? res : '');
            if (fileUrl) {
              uploadedDocs.push({
                doc_type: doc.doc_type || key,
                file_url: fileUrl,
                name: doc.name,
              });
            }
          } catch (err) {
            console.error(`Failed to upload ${key}`, err);
          }
        } else if (doc.file_url || doc.url) {
          uploadedDocs.push({
            doc_type: doc.doc_type || key,
            file_url: doc.file_url || doc.url,
            name: doc.name,
          });
        }
      }

      // 2. Upload pending bus photos on form submit
      const uploadedPhotoDocs = [];
      const uploadedPhotoUrls = [];
      for (const photo of busPhotos) {
        if (photo.file) {
          try {
            const res = await uploadFile(photo.file, 'vehicle_document');
            const fileUrl = res?.url || res?.file_url || (typeof res === 'string' ? res : '');
            if (fileUrl) {
              uploadedPhotoDocs.push({
                doc_type: 'bus_photo',
                file_url: fileUrl,
                name: photo.name || 'Bus Photo',
              });
              uploadedPhotoUrls.push(fileUrl);
            }
          } catch (err) {
            console.error(`Failed to upload bus photo ${photo.name}`, err);
          }
        } else if (photo.url || photo.file_url) {
          const fileUrl = photo.url || photo.file_url;
          uploadedPhotoDocs.push({
            doc_type: 'bus_photo',
            file_url: fileUrl,
            name: photo.name || 'Bus Photo',
          });
          uploadedPhotoUrls.push(fileUrl);
        }
      }

      // 3. Build complete payload
      const payload = {
        organization_id: user?.organization_id || user?.organizationId || undefined,
        bus_number: formData.plate.trim(),
        vin: formData.chassisNumber.trim(),
        chassis_number: formData.chassisNumber.trim(),
        vehicle_type: formData.vehicleType,
        model: formData.model.trim(),
        capacity: formData.capacity.trim(),
        fuel_type: formData.fuelType,
        fleet_id: formData.fleetId || (isFleetPortal ? (myFleet?.id || user?.id) : null),
        depot_id: formData.depotId ? Number(formData.depotId) : (isFleetPortal && rawDepotId ? Number(rawDepotId) : null),
        assigned_driver_id: formData.assignedDriverId ? Number(formData.assignedDriverId) : null,
        assigned_route: formData.assignedRoute || null,
        route_id: formData.routeId ? Number(formData.routeId) : null,
        source: formData.source || null,
        destination: formData.destination || null,
        displays_count: totalDisplays,
        display_layout: {
          left_side: displayScreens.leftSide,
          right_side: displayScreens.rightSide,
          rear: displayScreens.rear,
          emergency_exit: displayScreens.emergencyExit,
          total: totalDisplays,
        },
        gps_device_id: formData.gpsDeviceId || null,
        edge_device_id: formData.gpsDeviceId || null,
        status: submitStatus,
        documents: [...uploadedDocs, ...uploadedPhotoDocs],
        photos: uploadedPhotoUrls,
        bus_images: uploadedPhotoUrls,
      };

      const actionPromise = isEditMode
        ? updateVehicle(id, payload)
        : createVehicle(payload);

      const createdVehicle = await toast.promise(actionPromise, {
        loading: isEditMode ? 'Updating vehicle details...' : 'Uploading files & registering vehicle...',
        success: isEditMode
          ? `Vehicle ${formData.plate} updated successfully!`
          : isFleetPortal
            ? `Vehicle ${formData.plate} submitted for Admin approval!`
            : `Vehicle ${formData.plate} created successfully!`,
        error: (err) => {
          if (typeof err === 'string') return err;
          if (err?.message) return err.message;
          return 'Failed to save vehicle.';
        },
      });

      const targetId = createdVehicle?.id || id;
      if (targetId) {
        if (formData.gpsDeviceId) {
          await assignGps(targetId, formData.gpsDeviceId).catch(() => {});
        }
        if (formData.assignedDriverId) {
          await assignDriver(targetId, formData.assignedDriverId).catch(() => {});
        }
      }

      navigate(basePath);
    } catch (err) {
      console.error('Vehicle save error:', err);
      let errorMsg = 'Failed to save vehicle. Please review the details below and try again.';
      const serverFieldErrors = {};

      if (err) {
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err.message) {
          errorMsg = err.message;
        }

        const msgLower = (errorMsg || '').toLowerCase();
        if (
          err.code === 'DUPLICATE' ||
          msgLower.includes('unique') ||
          msgLower.includes('already exists') ||
          msgLower.includes('duplicate entry')
        ) {
          if (msgLower.includes('vin') || msgLower.includes('chassis')) {
            serverFieldErrors.chassisNumber = 'This chassis / VIN number is already registered.';
            errorMsg = 'A vehicle with this Chassis / VIN number is already registered.';
          } else {
            serverFieldErrors.plate = 'This registration plate number is already registered.';
            errorMsg = 'A vehicle with this Registration Plate Number already exists.';
          }
        }

        if (Array.isArray(err.details)) {
          err.details.forEach((item) => {
            const field = item.field;
            const msg = item.message || 'Invalid value';
            if (field === 'bus_number' || field === 'plate') serverFieldErrors.plate = msg;
            else if (field === 'vin' || field === 'chassis_number') serverFieldErrors.chassisNumber = msg;
            else if (field === 'model') serverFieldErrors.model = msg;
            else if (field === 'capacity') serverFieldErrors.capacity = msg;
            else if (field === 'depot_id' || field === 'depotId') serverFieldErrors.depotId = msg;
            else if (field === 'fuel_type' || field === 'fuelType') serverFieldErrors.fuelType = msg;
            else if (field) serverFieldErrors[field] = msg;
          });
        }
      }

      setFormError(errorMsg);
      setFieldErrors(serverFieldErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessForm) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <FleetIcons.Lock className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked')}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{t('common.access_denied_desc') || 'You do not have permission to add or edit vehicles.'}</p>
        <button onClick={() => navigate(basePath)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          {t('admin.vehicles.title')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Full-Width Breadcrumb Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: t('nav.dashboard') || 'Dashboard', to: dashboardLink },
              { label: 'Vehicles', to: basePath },
              { label: isEditMode ? t('admin.vehicles.edit_vehicle') : t('admin.vehicles.add_vehicle') }
            ]}
            className="mb-2"
          />

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {isEditMode ? `Edit Vehicle: ${formData.plate}` : 'Add Vehicle'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Register vehicle details, specifications, route, and equipment.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(basePath)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{loading ? t('common.loading') : isEditMode ? t('admin.vehicles.edit_vehicle') : isFleetPortal ? 'Submit for Approval' : t('admin.vehicles.add_vehicle')}</span>
          </button>
        </div>
      </div>

      {/* Fleet Portal Approval Warning Banner */}
      {isFleetPortal && !isEditMode && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
          <FleetIcons.Alert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-bold">{t('admin.vehicles.awaiting_approval')}</p>
            <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
              Vehicles registered by Fleet Operators require Admin verification before entering active depot service.
            </p>
          </div>
        </div>
      )}

      {/* Validation & Error Alert Banner */}
      {formError && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 font-bold shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-rose-900">
                  Validation & Submission Error
                </h3>
                <p className="text-xs text-rose-800 font-medium">
                  {formError}
                </p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-rose-700 list-disc list-inside font-medium bg-white/70 p-3 rounded-xl border border-rose-200/60">
                    {Object.entries(fieldErrors).map(([key, msg]) => (
                      <li key={key}>
                        <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFormError(null); setFieldErrors({}); }}
              className="text-rose-500 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              title={t('common.dismiss_error')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        
        {/* Section 1: Vehicle Specifications Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm">
                <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Vehicle Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.vehicles.registration_section_desc')}</p>
              </div>
            </div>

            {/* Parent Fleet & Depot Selectors */}
            {isFleetPortal ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Auto-Assigned Fleet Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">{t('admin.vehicles.fleet_label')}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{formData.fleetName || myFleet?.name || user?.name || 'My Fleet'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Auto-Linked
                  </span>
                </div>

                {/* Auto-Assigned Depot Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">{t('admin.vehicles.depot_label')}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Pin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{myDepot?.name || myDepot?.code || (formData.depotId ? `Depot #${formData.depotId}` : 'Assigned Depot')}</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Fixed
                  </span>
                </div>
              </div>
            ) : (
              /* Admin: Interactive Selectors */
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Operator <span className="text-red-500">*</span>:
                    </span>
                    <select
                      value={formData.fleetId}
                      onChange={(e) => handleFleetChange(e.target.value)}
                      className={`h-9 px-3 rounded-xl border text-xs font-bold text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all ${
                        fieldErrors.fleetId
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white'
                      }`}
                    >
                      <option value="">{t('admin.vehicles.select_operator_placeholder')}</option>
                      {fleetOperatorsList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} {f.code ? `(${f.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.fleetId && (
                    <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3 h-3 text-rose-500 shrink-0" /> {fieldErrors.fleetId}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Depot <span className="text-red-500">*</span>:
                    </span>
                    <select
                      value={formData.depotId}
                      onChange={(e) => handleFieldChange('depotId', e.target.value)}
                      className={`h-9 px-3 rounded-xl border text-xs font-bold text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all ${
                        fieldErrors.depotId
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                          : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white'
                      }`}
                    >
                      <option value="">{t('admin.vehicles.select_depot_placeholder')}</option>
                      {depotsList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name ?? d.code ?? d.id}</option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.depotId && (
                    <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                      <FleetIcons.Alert className="w-3 h-3 text-rose-500 shrink-0" /> {fieldErrors.depotId}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Registration Number * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Bus / Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                id="bus-number-input"
                type="text"
                placeholder={t('admin.vehicles.plate_placeholder')}
                value={formData.plate}
                onChange={(e) => handleFieldChange('plate', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all font-bold ${
                  fieldErrors.plate
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.plate && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.plate}
                </p>
              )}
            </div>

            {/* Chassis Number * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                VIN / Chassis Number <span className="text-red-500">*</span>
              </label>
              <input
                id="vin-input"
                type="text"
                placeholder={t('admin.vehicles.vin_placeholder')}
                value={formData.chassisNumber}
                onChange={(e) => handleFieldChange('chassisNumber', e.target.value.toUpperCase())}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all font-mono ${
                  fieldErrors.chassisNumber
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.chassisNumber && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.chassisNumber}
                </p>
              )}
            </div>

            {/* Model Number * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.vehicles.model_placeholder')}
                value={formData.model}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
                  fieldErrors.model
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.model && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.model}
                </p>
              )}
            </div>

            {/* Vehicle Capacity * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Seating Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.vehicles.capacity_placeholder')}
                value={formData.capacity}
                onChange={(e) => handleFieldChange('capacity', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
                  fieldErrors.capacity
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.capacity && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.capacity}
                </p>
              )}
            </div>

            {/* Vehicle Fuel / Powertrain Type */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.vehicles.fuel_type_label')}</label>
              <select
                value={formData.fuelType}
                onChange={(e) => handleFieldChange('fuelType', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 font-medium"
              >
                <option value="Electric (EV)">{t('admin.vehicles.fuel_electric')}</option>
                <option value="CNG">{t('admin.vehicles.fuel_cng')}</option>
                <option value="Diesel">{t('admin.vehicles.fuel_diesel')}</option>
                <option value="Hybrid">{t('admin.vehicles.fuel_hybrid')}</option>
              </select>
            </div>
          </div>

          {/* Quick Vehicle Type Tag Pills */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">{t('admin.vehicles.vehicle_type_label')}</label>
            <div className="flex flex-wrap items-center gap-2">
              {vehicleTypeTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setFormData({ ...formData, vehicleType: tag })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.vehicleType === tag
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600/30'
                      : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Route Information Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Route Details
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Assign route, origin station, and destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Assigned Route * */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Route <span className="text-red-500">*</span>
                </label>
                <Link
                  to={isFleetPortal ? '/fleet-operator/routes/add' : '/admin/routes/add'}
                  target="_blank"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  + Create Route
                </Link>
              </div>
              <select
                value={formData.routeId || formData.assignedRoute}
                onChange={(e) => handleRouteChange(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all font-medium ${
                  fieldErrors.assignedRoute
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              >
                <option value="">{t('admin.vehicles.select_route_placeholder')}</option>
                {routesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
              {fieldErrors.assignedRoute && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.assignedRoute}
                </p>
              )}
            </div>

            {/* Source * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.vehicles.source_placeholder')}
                value={formData.source}
                onChange={(e) => handleFieldChange('source', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
                  fieldErrors.source
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.source && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.source}
                </p>
              )}
            </div>

            {/* Destination * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.vehicles.dest_placeholder')}
                value={formData.destination}
                onChange={(e) => handleFieldChange('destination', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-all ${
                  fieldErrors.destination
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              {fieldErrors.destination && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.destination}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Vehicle Documents Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Documents
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Upload vehicle compliance and registration documents (PDF, JPG, PNG).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: 'rc', label: 'RC Document', icon: <FleetIcons.Document className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
              { type: 'fitness', label: 'Fitness Certificate', icon: <FleetIcons.Check className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
              { type: 'transport_license', label: 'Transport License', icon: <FleetIcons.FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
              { type: 'insurance', label: 'Insurance Policy', icon: <FleetIcons.Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" /> },
            ].map(({ type, label, icon }) => {
              const uploaded = documents[type];
              const isUploading = uploadingDoc === type;
              return (
                <label
                  key={type}
                  className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative overflow-hidden ${
                    uploaded
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/50'
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
                  ) : uploaded ? (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-2 font-bold">
                        <FleetIcons.Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{uploaded.name || label}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {uploaded.uploaded ? 'Uploaded' : 'Selected'}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {(uploaded.file_url || uploaded.previewUrl || uploaded.url) && (
                          <a
                            href={uploaded.previewUrl || resolveFileUrl(uploaded.file_url || uploaded.url)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800 transition-colors inline-flex items-center"
                          >
                            <FleetIcons.Eye className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" /> View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDocuments((prev) => ({ ...prev, [type]: null }));
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 rounded-md border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer inline-flex items-center"
                        >
                          <FleetIcons.Close className="w-3 h-3 text-rose-600 dark:text-rose-400 mr-1" /> Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{label}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{t('common.click_to_upload')}</div>
                      <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('common.upload_formats')}</div>
                    </>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 3.5: Bus Photos & Gallery Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Vehicle Photos
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Upload photos of the vehicle (Front, Side, Rear, and Interior).
              </p>
            </div>

            <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0">
              <FleetIcons.Camera className="w-4 h-4 text-white" />
              <span>{uploadingPhotos ? t('common.loading') : '+ ' + t('common.upload_photos')}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={uploadingPhotos}
                onChange={handleBusPhotoUpload}
              />
            </label>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {busPhotos.map((photo) => {
              const displayUrl = photo.previewUrl || resolveFileUrl(photo.url || photo.file_url);
              return (
                <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-900 aspect-video sm:aspect-square shadow-sm">
                  <img
                    src={displayUrl}
                    alt={photo.name || 'Bus Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeBusPhoto(photo.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title={t('common.remove_photo')}
                  >
                    <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1.5 text-[10px] text-white font-medium truncate px-2">
                    {photo.name || 'Bus Photo'}
                  </div>
                </div>
              );
            })}

            <label className="border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all aspect-square group">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={uploadingPhotos}
                onChange={handleBusPhotoUpload}
              />
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition-transform">
                <FleetIcons.Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.upload_photos')}</span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('common.select_multiple')}</span>
            </label>
          </div>
        </div>

        {/* Section 4: Display Screen Configuration Card (Smart Advertising Feature) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Screens Configuration
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Configure advertising and route display screens on the vehicle.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
              {totalDisplays} Screens Installed
            </div>
          </div>

          {/* Visual Bus Wireframe Diagram */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
            <div className="absolute top-3 left-4 text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
              BUS DISPLAY NETWORK WIREFRAME
            </div>

            {/* Bus Body SVG Graphic */}
            <div className="my-6 relative w-full max-w-xl flex items-center justify-center">
              <svg viewBox="0 0 500 160" className="w-full h-auto drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Bus Body Outer */}
                <rect x="20" y="30" width="460" height="90" rx="20" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                
                {/* Windshield Front */}
                <path d="M430 35 L470 70 L470 110 L430 110 Z" fill="#0ea5e9" opacity="0.4" />

                {/* Left Side Screens Indicator */}
                <rect x="70" y="45" width="100" height="30" rx="6" fill="#8b5cf6" opacity="0.8" stroke="#c084fc" strokeWidth="1.5" />
                <text x="120" y="65" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">LEFT SIDE ({displayScreens.leftSide})</text>

                {/* Right Side Screens Indicator */}
                <rect x="190" y="45" width="100" height="30" rx="6" fill="#8b5cf6" opacity="0.8" stroke="#c084fc" strokeWidth="1.5" />
                <text x="240" y="65" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">RIGHT SIDE ({displayScreens.rightSide})</text>

                {/* Emergency Exit Screen */}
                <rect x="310" y="45" width="90" height="30" rx="6" fill="#06b6d4" opacity="0.8" stroke="#67e8f9" strokeWidth="1.5" />
                <text x="355" y="65" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">EMERGENCY ({displayScreens.emergencyExit})</text>

                {/* Rear Screen */}
                <rect x="25" y="45" width="30" height="60" rx="4" fill="#ec4899" opacity="0.8" stroke="#f472b6" strokeWidth="1.5" />
                <text x="40" y="78" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90, 40, 78)">REAR ({displayScreens.rear})</text>

                {/* Wheels */}
                <circle cx="90" cy="120" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                <circle cx="90" cy="120" r="8" fill="#94a3b8" />
                <circle cx="390" cy="120" r="18" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                <circle cx="390" cy="120" r="8" fill="#94a3b8" />
              </svg>
            </div>

            {/* 4 Interactive Display Counters */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Left Side */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[11px] text-purple-300 font-bold">{t('admin.vehicles.left_screens')}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateScreenCount('leftSide', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-white w-6">{displayScreens.leftSide}</span>
                  <button
                    type="button"
                    onClick={() => updateScreenCount('leftSide', 1)}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Right Side */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[11px] text-purple-300 font-bold">{t('admin.vehicles.right_screens')}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateScreenCount('rightSide', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-white w-6">{displayScreens.rightSide}</span>
                  <button
                    type="button"
                    onClick={() => updateScreenCount('rightSide', 1)}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rear */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[11px] text-pink-300 font-bold">{t('admin.vehicles.rear_screen')}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateScreenCount('rear', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-white w-6">{displayScreens.rear}</span>
                  <button
                    type="button"
                    onClick={() => updateScreenCount('rear', 1)}
                    className="w-7 h-7 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Emergency Exit */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[11px] text-cyan-300 font-bold">{t('admin.vehicles.emergency_screen')}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateScreenCount('emergencyExit', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-black text-white w-6">{displayScreens.emergencyExit}</span>
                  <button
                    type="button"
                    onClick={() => updateScreenCount('emergencyExit', 1)}
                    className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Driver Assignment Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Driver Assignment
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Link an active driver to this vehicle.
            </p>
          </div>

          <div className="max-w-md">
            {/* Assigned Driver Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.vehicles.driver_section')}</label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => handleFieldChange('assignedDriverId', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all ${
                  fieldErrors.assignedDriverId
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              >
                <option value="">{t('admin.vehicles.no_driver_assigned')}</option>
                {driversList.map((dr) => (
                  <option key={dr.id} value={dr.id}>
                    {dr.name} ({dr.license_number || dr.code || `ID #${dr.id}`})
                  </option>
                ))}
              </select>
              {fieldErrors.assignedDriverId && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.assignedDriverId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Vehicle Status Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Status
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Select operational status for this vehicle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({ ...formData, status: 'Active' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                formData.status === 'Active' || formData.status === 'in_depot'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                formData.status === 'Active' || formData.status === 'in_depot' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 dark:border-zinc-500'
              }`}>
                {(formData.status === 'Active' || formData.status === 'in_depot') && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t('admin.vehicles.active')}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('admin.vehicles.active_desc')}</div>
              </div>
            </div>

            <div
              onClick={() => setFormData({ ...formData, status: 'Inactive' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                formData.status === 'Inactive' || formData.status === 'offline'
                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                formData.status === 'Inactive' || formData.status === 'offline' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-zinc-500'
              }`}>
                {(formData.status === 'Inactive' || formData.status === 'offline') && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t('admin.vehicles.inactive')}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('admin.vehicles.inactive_desc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Cancel Bottom Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{loading ? t('common.loading') : isEditMode ? t('admin.vehicles.edit_vehicle') : isFleetPortal ? 'Submit for Approval' : t('admin.vehicles.add_vehicle')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
