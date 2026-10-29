import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';

export const AddGpsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { createDevice, loadDevices } = useFleetGps();

  const [formData, setFormData] = useState({
    id: '',
    imei: '',
    model: 'Teltonika FMB920',
    sim: '',
    network: 'Jio 4G IoT',
    networkType: '4G LTE-M',
    batteryCapacity: '1200 mAh',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) return;
    const payload = {
      code: formData.id,
      imei: formData.imei,
      model: formData.model,
      sim_number: formData.sim,
      network: formData.network,
      network_type: formData.networkType,
      battery_capacity: formData.batteryCapacity,
    };
    try {
      await toast.promise(createDevice(payload), {
        loading: 'Saving...',
        success: 'GPS device created',
        error: (err) => err?.message || 'Failed to create GPS device',
      });
      await loadDevices().catch(() => {});
      onClose();
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('fleet.gps.register_new_title')} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input 
            label={t('fleet.gps.hw_id_tag')} 
            placeholder={t('fleet.gps.hw_id_ph')} 
            required 
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
          />
          <Input 
            label={t('fleet.gps.imei_number')} 
            placeholder={t('fleet.gps.imei_ph')} 
            required 
            value={formData.imei}
            onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select 
            label={t('fleet.gps.device_hw_model')} 
            options={[
              { label: t('fleet.gps.model_fmb920_hp'), value: 'Teltonika FMB920' },
              { label: t('fleet.gps.model_fmb125_can'), value: 'Teltonika FMB125' },
              { label: t('fleet.gps.model_gv57_ev'), value: 'Queclink GV57' },
              { label: t('fleet.gps.model_gt06n_std'), value: 'Concox GT06N' },
            ]}
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
          <Input 
            label={t('fleet.gps.sim_card_number')} 
            placeholder="+91 90000 00000" 
            value={formData.sim}
            onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select 
            label={t('fleet.gps.network_provider')} 
            options={[
              { label: 'Jio 4G IoT', value: 'Jio 4G IoT' },
              { label: 'Airtel IoT', value: 'Airtel IoT' },
              { label: 'Vodafone Idea IoT', value: 'Vi IoT' },
            ]}
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
          />
          <Select 
            label={t('fleet.gps.network_protocol')} 
            options={[
              { label: '4G LTE-M (Standard)', value: '4G LTE-M' },
              { label: 'NB-IoT (Low Power)', value: 'NB-IoT' },
              { label: '2G / 3G Fallback', value: '2G / 3G Fallback' },
            ]}
            value={formData.networkType}
            onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
          />
          <Input 
            label={t('fleet.gps.internal_battery')} 
            placeholder={t('fleet.gps.internal_battery_ph')} 
            value={formData.batteryCapacity}
            onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="bg-[var(--primary)] text-white px-6">
            {t('fleet.gps.register_hardware')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
