import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';

export const AddDriverModal = ({ isOpen, onClose }) => {
  const { createDriver, loadDrivers } = useFleetDriver();

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    phone: '',
    email: '',
    licenseNo: '',
    licenseType: 'Commercial Heavy Vehicle (HMV)',
    licenseExpiry: '15 Dec 2028',
    issuingAuthority: 'RTO Bangalore Central',
    bloodGroup: 'O+',
    emergencyContact: '',
    gender: 'Male',
    address: '',
    status: 'Available',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    const payload = {
      name: formData.name,
      emp_id: formData.empId,
      phone: formData.phone,
      email: formData.email,
      dl_number: formData.licenseNo,
      license_type: formData.licenseType,
      license_expiry: formData.licenseExpiry,
      issuing_authority: formData.issuingAuthority,
      blood_group: formData.bloodGroup,
      emergency_contact: formData.emergencyContact,
      gender: formData.gender,
      address: formData.address,
      status: formData.status,
    };
    try {
      await toast.promise(createDriver(payload), {
        loading: 'Saving...',
        success: 'Driver created',
        error: (err) => err?.message || 'Failed to create driver',
      });
      await loadDrivers().catch(() => {});
      onClose();
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Driver Profile" className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="Full Name *" 
              placeholder="Driver Full Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input 
              label="Employee ID *" 
              placeholder="e.g. EMP00129" 
              required 
              value={formData.empId}
              onChange={(e) => setFormData({ ...formData, empId: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input 
              label="Phone Number *" 
              placeholder="+91 98000 00000" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input 
              label="Email Address" 
              type="email"
              placeholder="driver@vmovexa.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Select 
              label="Gender" 
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
          </div>
          <Input 
            label="Residential Address" 
            placeholder="Full address..." 
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* License Information */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">2. Commercial License Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="License Number *" 
              placeholder="e.g. DL-KA01202200456" 
              required 
              value={formData.licenseNo}
              onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value.toUpperCase() })}
            />
            <Select 
              label="License Type" 
              options={[
                { label: 'Commercial Heavy Vehicle (HMV)', value: 'Commercial Heavy Vehicle (HMV)' },
                { label: 'Commercial Passenger Transport', value: 'Commercial Passenger Transport' },
                { label: 'Commercial Light Transport', value: 'Commercial Light Transport' },
              ]}
              value={formData.licenseType}
              onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="License Expiry Date" 
              placeholder="DD/MM/YYYY" 
              value={formData.licenseExpiry}
              onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            />
            <Input 
              label="Issuing RTO Authority" 
              placeholder="e.g. RTO Bangalore Central" 
              value={formData.issuingAuthority}
              onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
            />
          </div>
        </div>

        {/* Additional & Emergency Info */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">3. Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              label="Emergency Contact Number" 
              placeholder="+91 98000 00000" 
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
            <Select 
              label="Blood Group" 
              options={[
                { label: 'O+ Positive', value: 'O+' },
                { label: 'A+ Positive', value: 'A+' },
                { label: 'B+ Positive', value: 'B+' },
                { label: 'AB+ Positive', value: 'AB+' },
                { label: 'O- Negative', value: 'O-' },
              ]}
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[var(--primary)] text-white px-6">
            Register Driver
          </Button>
        </div>
      </form>
    </Modal>
  );
};
