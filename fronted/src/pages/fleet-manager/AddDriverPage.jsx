import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FleetIcons from '../../components/FleetIcons';

export const AddDriverPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignVehiclePlate = searchParams.get('assignVehicle') || '';

  const { createDriver, assignBus, loadDrivers } = useFleetDriver();
  const { vehicles, loadVehicles } = useFleetVehicle();

  useEffect(() => {
    if (assignVehiclePlate) loadVehicles({ exclude_status: 'pending_approval,pending,rejected', limit: 100 }).catch(() => {});
  }, [assignVehiclePlate, loadVehicles]);

  const vehicleList = (Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || [])).filter((v) => {
    const s = String(v?.status || '').toLowerCase().trim();
    return s !== 'pending_approval' && s !== 'pending' && s !== 'rejected';
  });

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    licenseNo: '',
    licenseType: 'Commercial Heavy Vehicle (HMV)',
    issueDate: '',
    licenseExpiry: '15 Dec 2028',
    issuingAuthority: 'RTO Bangalore Central',
    bloodGroup: 'O+',
    emergencyContact: '',
    notes: '',
    status: 'Active', // 'Active' or 'Inactive'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.empId) return;

    const payload = {
      name: formData.name,
      emp_id: formData.empId,
      phone: formData.phone,
      email: formData.email,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      dl_number: formData.licenseNo,
      license_type: formData.licenseType,
      issue_date: formData.issueDate,
      license_expiry: formData.licenseExpiry,
      issuing_authority: formData.issuingAuthority,
      blood_group: formData.bloodGroup,
      emergency_contact: formData.emergencyContact,
      notes: formData.notes,
      status: formData.status,
    };

    try {
      const createdDriver = await toast.promise(createDriver(payload), {
        loading: 'Saving...',
        success: 'Driver created',
        error: (err) => err?.message || 'Failed to create driver',
      });
      await loadDrivers().catch(() => {});

      if (assignVehiclePlate) {
        const target = vehicleList.find(
          (v) => String(v.bus_number) === String(assignVehiclePlate) ||
                 String(v.code) === String(assignVehiclePlate) ||
                 String(v.id) === String(assignVehiclePlate)
        );
        if (createdDriver?.id && target?.id) {
          await assignBus(createdDriver.id, target.id).catch(() => {});
        }
        navigate(`/fleet-operator/vehicles/${target?.id ?? assignVehiclePlate}/assign-gps`);
      } else {
        navigate('/fleet-operator/drivers');
      }
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Drivers', path: '/fleet-operator/drivers' },
            { label: 'Add Driver' },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/fleet-operator/drivers')} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={t('fleet.drivers.back_drivers')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('fleet.drivers.add_new_title')}</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Register verified driver credentials, transport licensing details, and emergency emergency contacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => navigate('/fleet-operator/drivers')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
            >{t('common.cancel')}</button>
          </div>
        </div>
      </div>

      {/* Target Assignment Banner if vehicle specified */}
      {assignVehiclePlate && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              <FleetIcons.Profile className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">{t('fleet.drivers.assigning_vehicle')}</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{assignVehiclePlate}</div>
              <div className="text-[11px] text-slate-600 dark:text-zinc-400">{t('fleet.drivers.unit_assigned')}</div>
            </div>
          </div>
          <div className="text-purple-600 dark:text-purple-400">
            <FleetIcons.Bus className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* 2. Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Personal Information Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Personal Information
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t('fleet.drivers.personal_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('fleet.drivers.ph_name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            {/* Employee ID * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('fleet.drivers.ph_empid')}
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value.toUpperCase() })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
              />
            </div>

            {/* Phone Number * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('fleet.drivers.ph_phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.email_optional')}</label>
              <input
                type="email"
                placeholder={t('fleet.drivers.ph_email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* {t('fleet.drivers.dob')} */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.dob')}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* {t('fleet.drivers.gender')} */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.gender')}</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="Male">{t('common.male')}</option>
                <option value="Female">{t('common.female')}</option>
                <option value="Other">{t('common.other')}</option>
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.residential_address')}</label>
              <input
                type="text"
                placeholder={t('fleet.drivers.address_placeholder')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: License Information Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. {t('fleet.drivers.license_info')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t('fleet.drivers.license_info_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* License Number * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('fleet.drivers.license_number')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('fleet.drivers.license_placeholder')}
                value={formData.licenseNo}
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value.toUpperCase() })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
              />
            </div>

            {/* License Type * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('fleet.drivers.license_type')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.licenseType}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              >
                <option value="Commercial Heavy Vehicle (HMV)">{t('fleet.drivers.lic_hmv')}</option>
                <option value="Commercial Passenger Transport">{t('fleet.drivers.lic_passenger')}</option>
                <option value="Commercial Heavy Vehicle (Interstate)">{t('fleet.drivers.lic_interstate')}</option>
                <option value="Commercial Light Transport">{t('fleet.drivers.lic_light')}</option>
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.issue_date')}</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Expiry Date * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t('fleet.drivers.expiry_date')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('fleet.drivers.expiry_placeholder')}
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            {/* Issuing Authority */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.issuing_authority')}</label>
              <input
                type="text"
                placeholder={t('fleet.drivers.authority_placeholder')}
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Additional Information (Optional) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. {t('fleet.drivers.additional_info')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t('fleet.drivers.additional_info_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.blood_group')}</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="O+">{t('fleet.drivers.blood_o_pos')}</option>
                <option value="B+">{t('fleet.drivers.blood_b_pos')}</option>
                <option value="A+">{t('fleet.drivers.blood_a_pos')}</option>
                <option value="AB+">{t('fleet.drivers.blood_ab_pos')}</option>
                <option value="O-">{t('fleet.drivers.blood_o_neg')}</option>
                <option value="B-">{t('fleet.drivers.blood_b_neg')}</option>
                <option value="A-">{t('fleet.drivers.blood_a_neg')}</option>
                <option value="AB-">{t('fleet.drivers.blood_ab_neg')}</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.emergency_contact')}</label>
              <input
                type="text"
                placeholder={t('fleet.drivers.emergency_contact_placeholder')}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">{t('fleet.drivers.medical_notes')}</label>
              <textarea
                rows={2}
                placeholder={t('fleet.drivers.notes_placeholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Initial Status */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. {t('fleet.drivers.initial_status')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t('fleet.drivers.initial_status_desc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({ ...formData, status: 'Active' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                formData.status === 'Active'
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                formData.status === 'Active' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
              }`}>
                {formData.status === 'Active' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{t('common.active')}</div>
                <div className="text-[11px] text-slate-500 font-medium">{t('fleet.drivers.active_status_desc')}</div>
              </div>
            </div>

            <div
              onClick={() => setFormData({ ...formData, status: 'Inactive' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                formData.status === 'Inactive'
                  ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                formData.status === 'Inactive' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
              }`}>
                {formData.status === 'Inactive' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{t('common.inactive')}</div>
                <div className="text-[11px] text-slate-500 font-medium">{t('fleet.drivers.inactive_status_desc')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bottom Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/drivers')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('fleet.drivers.add_to_roster')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
