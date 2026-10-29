import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AssignGpsModal } from './AssignGpsModal';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { resolveFileUrl } from '../../api/services/upload.service';

export const GpsDevicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { devices, loadDevices, deleteDevice } = useFleetGps();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Available, Assigned
  const [viewMode, setViewMode] = useState('table'); // default view is 'table' (list)
  const [selectedGpsForAssign, setSelectedGpsForAssign] = useState(null);
  const [, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownRef = useRef(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDevices();
    } catch {
      // handled
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDevices().catch(() => {});
  }, [loadDevices]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const isAvailable = (status) => String(status || '').toLowerCase() === 'available';
  const isAssigned = (status) => String(status || '').toLowerCase() === 'assigned';

  const filteredGps = gpsList.filter(g => {
    const q = search.toLowerCase();
    const matchesSearch = String(g.code || g.id || '').toLowerCase().includes(q) ||
                          String(g.imei || '').toLowerCase().includes(q) ||
                          String(g.vendor || '').toLowerCase().includes(q) ||
                          String(g.model || '').toLowerCase().includes(q);
    
    let matchesTab = true;
    if (activeTab === 'Available') matchesTab = isAvailable(g.status);
    if (activeTab === 'Assigned') matchesTab = isAssigned(g.status);
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredGps.length / pageSize) || 1;
  const paginatedGps = filteredGps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const availableCount = gpsList.filter(g => isAvailable(g.status)).length;
  const assignedCount = gpsList.filter(g => isAssigned(g.status)).length;

  const handleDelete = async (gpsDevice) => {
    if (gpsDevice.vehicle_id) {
      toast.error('Cannot delete a GPS device that is currently assigned to a vehicle.');
      return;
    }
    if (!window.confirm(`Delete GPS Device ${gpsDevice.code || gpsDevice.imei}?`)) return;

    try {
      await toast.promise(deleteDevice(gpsDevice.id), {
        loading: 'Deleting GPS Device...',
        success: 'GPS device deleted successfully',
        error: (err) => err?.message || 'Failed to delete GPS device',
      });
      loadDevices().catch(() => {});
    } catch {
      /* toast handled error */
    }
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200" ref={dropdownRef}>
      {/* 1. Web Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Hardware Telematics' },
          ]}
          className="mb-2"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('fleet.gps.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.gps.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <RefreshButton onClick={handleRefresh} loading={refreshing} />
            <button 
              onClick={() => navigate('/fleet-operator/gps/add')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FleetIcons.Plus className="w-4 h-4 text-white" />
              <span>{t('fleet.gps.register_device')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter Bar & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          </span>
          <input 
            placeholder={t('fleet.gps.search_ph')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'All'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              All ({gpsList.length})
            </button>
            <button
              onClick={() => { setActiveTab('Available'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Available'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => { setActiveTab('Assigned'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Assigned'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Assigned ({assignedCount})
            </button>
          </div>

          {/* View Mode Toggle Switch */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="grid"
          />
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredGps.length === 0 && (
        <div className="p-12 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
          No GPS devices match your criteria.
        </div>
      )}

      {/* 4. GRID VIEW */}
      {viewMode === 'grid' && filteredGps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedGps.map((g) => (
            <div key={g.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 overflow-hidden">
                      {g.image_url ? (
                        <img src={resolveFileUrl(g.image_url)} alt="GPS" className="w-full h-full object-cover" />
                      ) : (
                        <FleetIcons.Gps className="w-6 h-6 text-slate-700 dark:text-zinc-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">{g.code ?? g.id ?? '—'}</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{g.model || g.vendor || 'Teltonika FMB920'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize flex items-center gap-1 shrink-0 ${
                      isAvailable(g.status)
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{g.status ?? 'available'}</span>
                    </span>

                    {/* 3-Dot Menu */}
                    <ActionDropdown menuWidth="w-48">
                      {({ close }) => (
                        <div className="py-1 space-y-0.5 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              close();
                              navigate(`/fleet-operator/gps/edit/${g.id}`);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            <span>{t('fleet.gps.edit_device')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              close();
                              setSelectedGpsForAssign(g);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Link className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>{isAvailable(g.status) ? 'Assign Vehicle' : 'Reassign Vehicle'}</span>
                          </button>
                          <div className="border-t border-slate-100 dark:border-zinc-800 my-1"></div>
                          <button
                            type="button"
                            onClick={() => {
                              close();
                              handleDelete(g);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-4 h-4 text-red-500 dark:text-red-400" />
                            <span>{t('fleet.gps.delete_device')}</span>
                          </button>
                        </div>
                      )}
                    </ActionDropdown>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-xs space-y-2 border border-slate-100 dark:border-zinc-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500 font-sans">{t('fleet.gps.imei_label')}</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{g.imei ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500 font-sans">{t('fleet.gps.sim_phone_label')}</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{g.sim ?? g.sim_number ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-500 font-sans">{t('fleet.gps.carrier_label')}</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 font-sans">{g.network ?? '—'}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-400 dark:text-zinc-500">{t('fleet.gps.battery_label')}</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                      <FleetIcons.Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{g.battery_capacity || g.battery || '1200 mAh'}</span>
                      <span className="text-slate-300 dark:text-zinc-600 mx-1">•</span>
                      <FleetIcons.Gps className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{g.signal ?? 'Good'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1">
                  {g.vehicle_id ? (
                    <>
                      <FleetIcons.Car className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span>Bus #{g.vehicle_id}</span>
                    </>
                  ) : (
                    'Unassigned'
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TABLE VIEW */}
      {viewMode === 'table' && filteredGps.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t('fleet.gps.device_photo')}</th>
                  <th className="py-3.5 px-4">{t('fleet.gps.hardware_model')}</th>
                  <th className="py-3.5 px-4 font-mono">{t('fleet.gps.imei_serial')}</th>
                  <th className="py-3.5 px-4">{t('fleet.gps.sim_network')}</th>
                  <th className="py-3.5 px-4">{t('fleet.gps.battery_signal')}</th>
                  <th className="py-3.5 px-4">{t('fleet.gps.assigned_vehicle')}</th>
                  <th className="py-3.5 px-4">{t('common.status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-800 dark:text-zinc-200">
                {paginatedGps.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Device / Photo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 overflow-hidden">
                          {g.image_url ? (
                            <img src={resolveFileUrl(g.image_url)} alt="GPS" className="w-full h-full object-cover" />
                          ) : (
                            <FleetIcons.Gps className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">{g.code ?? g.id ?? '—'}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500">{g.alias_name || 'GNSS Telematics'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Model */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{g.model || 'Teltonika FMB920'}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">{g.vendor || 'Teltonika'}</div>
                    </td>

                    {/* IMEI */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">{g.imei ?? '—'}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">{g.serial_number || '—'}</div>
                    </td>

                    {/* SIM & Network */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">{g.sim ?? g.sim_number ?? '—'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans">{g.network || 'Jio 4G IoT'} ({g.network_type || '4G LTE'})</div>
                    </td>

                    {/* Battery & Signal */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
                        <FleetIcons.Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{g.battery_capacity || '1200 mAh'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <FleetIcons.Gps className="w-3 h-3" />
                        <span>{g.signal || 'Good (90%)'}</span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      {g.vehicle_id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/40">
                          <FleetIcons.Car className="w-3.5 h-3.5" />
                          Bus #{g.vehicle_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('common.unassigned')}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize inline-flex items-center gap-1 ${
                        isAvailable(g.status)
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{g.status ?? 'available'}</span>
                      </span>
                    </td>

                    {/* Actions Column (3 Dot Menu) */}
                    <td className="py-3.5 px-4 text-right">
                      <ActionDropdown menuWidth="w-48">
                        {({ close }) => (
                          <div className="py-1 space-y-0.5 text-xs font-semibold text-left">
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                navigate(`/fleet-operator/gps/edit/${g.id}`);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Edit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              <span>{t('fleet.gps.edit_device')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                setSelectedGpsForAssign(g);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Link className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                              <span>{isAvailable(g.status) ? 'Assign Vehicle' : 'Reassign Vehicle'}</span>
                            </button>
                            <div className="border-t border-slate-100 dark:border-zinc-800 my-1"></div>
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                handleDelete(g);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Trash className="w-4 h-4 text-red-500 dark:text-red-400" />
                              <span>{t('fleet.gps.delete_device')}</span>
                            </button>
                          </div>
                        )}
                      </ActionDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredGps.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      <AssignGpsModal 
        isOpen={!!selectedGpsForAssign} 
        onClose={() => setSelectedGpsForAssign(null)} 
        gpsDevice={selectedGpsForAssign} 
      />
    </div>
  );
};

