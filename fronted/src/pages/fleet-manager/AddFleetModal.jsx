import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { FleetIcons } from '../../components/FleetIcons';

export const AddFleetModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { createFleet, loadFleets } = useFleetManager();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization: '',
    fleetType: 'Intracity Transit',
    contactPerson: '',
    phone: '',
    email: '',
    location: 'Bangalore Central Hub',
    timeZone: 'Asia/Kolkata (IST)',
    workingHours: '05:00 AM - 11:30 PM',
    status: 'Active',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    const payload = {
      name: formData.name,
      description: formData.description,
      organization: formData.organization,
      fleet_type: formData.fleetType,
      contact_person: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      location: formData.location,
      timezone: formData.timeZone,
      working_hours: formData.workingHours,
      status: formData.status,
    };
    try {
      await toast.promise(createFleet(payload), {
        loading: 'Saving...',
        success: 'Fleet created',
        error: (err) => err?.message || 'Failed to create fleet',
      });
      await loadFleets().catch(() => {});
      onClose();
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-3xl p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{t('fleet.add.modal_title')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.add.modal_sub')}</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors"
          >
            <FleetIcons.Close className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          
          {/* Section 1: Fleet Information */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.add.step1_title')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.add.step1_desc')}</p>
              </div>

              {/* Logo Dropzone */}
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors shrink-0">
                <FleetIcons.Camera className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
                <span className="text-[10px] text-slate-600 dark:text-zinc-300 font-bold leading-tight mt-1">{t('fleet.add.upload_logo')}</span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t('fleet.add.optional')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fleet Name * */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.add.fleet_name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fleet.add.fleet_name_placeholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>

              {/* Fleet Type * */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.add.fleet_type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.fleetType}
                  onChange={(e) => setFormData({ ...formData, fleetType: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                >
                  <option value="Intracity Transit">{t('fleet.add.type_intracity')}</option>
                  <option value="Institutional">{t('fleet.add.type_institutional')}</option>
                  <option value="Express Shuttle">{t('fleet.add.type_express')}</option>
                  <option value="Intercity Coach">{t('fleet.add.type_intercity')}</option>
                  <option value="Corporate">{t('fleet.add.type_corporate')}</option>
                </select>
              </div>
            </div>

            {/* Organization / Company * */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {t('fleet.add.organization')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('fleet.add.org_placeholder')}
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Description {t('fleet.add.optional')}
              </label>
              <textarea
                rows={2}
                placeholder={t('fleet.add.description_placeholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.add.step2_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.add.step2_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.contact_person')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.add.contact_person_placeholder')}
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.phone_number')}</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.email_address')}</label>
                <input
                  type="email"
                  placeholder="fleet@vmovexa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operational Information */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.add.step3_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.add.step3_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.home_depot')}</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                >
                  <option value="Bangalore Central Hub">{t('fleet.add.depot_blr_central')}</option>
                  <option value="North Zone Depot">{t('fleet.add.depot_north_zone')}</option>
                  <option value="Airport Terminal Hub">{t('fleet.add.depot_airport_hub')}</option>
                  <option value="South Ring Depot">{t('fleet.add.depot_south_ring')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.time_zone')}</label>
                <select
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                >
                  <option value="Asia/Kolkata (IST)">{t('fleet.add.tz_kolkata')}</option>
                  <option value="UTC">{t('fleet.add.tz_utc')}</option>
                  <option value="America/New_York (EST)">{t('fleet.add.tz_new_york')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.working_hours')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.add.working_hours_placeholder')}
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Status */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.add.step4_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.add.step4_desc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setFormData({ ...formData, status: 'Active' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  formData.status === 'Active'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  formData.status === 'Active' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 dark:border-zinc-600'
                }`}>
                  {formData.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.active')}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">{t('fleet.add.operational_desc')}</div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                  formData.status === 'Inactive'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  formData.status === 'Inactive' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-zinc-600'
                }`}>
                  {formData.status === 'Inactive' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.inactive')}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">{t('fleet.add.not_operational_desc')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-5 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Create Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFleetModal;
