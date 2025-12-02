// hms-frontend/src/pages/Admin/RatePlanManager.jsx

import React, { useState, useEffect } from 'react';
import {
  fetchRatePlans,
  fetchRoomTypes,
  manageRatePlan
} from '../../api/apiService';
import { Card, Table, Alert, Spinner, Modal, Button, FormInput } from '../../components';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const RatePlanManager = () => {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [ratePlans, setRatePlans] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    mode: 'CREATE',
    ratePlanId: '',
    typeId: '',
    name: '',
    dailyRate: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plans, types] = await Promise.all([
        fetchRatePlans(),
        fetchRoomTypes()
      ]);
      setRatePlans(Array.isArray(plans) ? plans : []);
      setRoomTypes(Array.isArray(types) ? types : []);
    } catch (error) {
      setAlert({ type: 'error', title: 'Load Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.typeId || !formData.name || !formData.dailyRate || !formData.startDate || !formData.endDate) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please fill all required fields.' });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Start date must be before end date.' });
      return;
    }

    try {
      await manageRatePlan({
        mode: formData.mode,
        ratePlanId: formData.mode === 'UPDATE' ? parseInt(formData.ratePlanId) : null,
        typeId: parseInt(formData.typeId),
        name: formData.name,
        dailyRate: parseFloat(formData.dailyRate),
        startDate: formData.startDate,
        endDate: formData.endDate
      });

      setAlert({
        type: 'success',
        title: 'Success',
        message: `Rate plan ${formData.mode === 'UPDATE' ? 'updated' : 'created'} successfully.`
      });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Error', message: error.message });
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete rate plan "${plan.plan_name}"?`)) return;

    try {
      await manageRatePlan({
        mode: 'DELETE',
        ratePlanId: plan.rate_plan_id
      });
      setAlert({ type: 'success', title: 'Success', message: 'Rate plan deleted.' });
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Delete Error', message: error.message });
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      mode: 'UPDATE',
      ratePlanId: plan.rate_plan_id,
      typeId: plan.type_id,
      name: plan.plan_name,
      dailyRate: plan.daily_rate,
      startDate: plan.start_date,
      endDate: plan.end_date
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      mode: 'CREATE',
      ratePlanId: '',
      typeId: roomTypes.length > 0 ? roomTypes[0].type_id : '',
      name: '',
      dailyRate: '',
      startDate: '',
      endDate: ''
    });
  };

  const columns = [
    {
      key: 'rate_plan_id',
      label: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-gray-600">#{value}</span>
    },
    {
      key: 'type_name',
      label: 'Room Type',
      width: '200px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <BuildingOffice2Icon className="w-4 h-4 text-gray-400" />
          <span className="font-600 text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'plan_name',
      label: 'Plan Name',
      width: '250px',
      render: (value) => <span className="text-gray-900">{value}</span>
    },
    {
      key: 'daily_rate',
      label: 'Daily Rate',
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-1">
          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
          <span className="text-gray-900 font-700">${parseFloat(value).toFixed(2)}</span>
        </div>
      )
    },
    {
      key: 'start_date',
      label: 'Start Date',
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'end_date',
      label: 'End Date',
      width: '150px',
      render: (value) => {
        const isExpired = new Date(value) < new Date();
        return (
          <div className="flex items-center gap-1 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className={isExpired ? 'text-red-600' : 'text-gray-700'}>
              {new Date(value).toLocaleDateString()}
            </span>
            {isExpired && (
              <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Expired</span>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex justify-center">
          <Spinner text="Loading rate plans..." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Rate Plans Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-700 text-gray-900">Rate Plans</h3>
            <p className="text-sm text-gray-600 mt-0.5">Manage daily rates for different room types and seasons</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            variant="primary"
            size="sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Rate Plan
          </Button>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1">
          <Table
            columns={columns}
            data={ratePlans}
            actions={(row) => [
              {
                label: 'Edit',
                onClick: handleEdit,
                className: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              },
              {
                label: 'Delete',
                onClick: handleDelete,
                className: 'bg-red-50 text-red-700 hover:bg-red-100'
              }
            ]}
          />
        </div>

        {ratePlans.length === 0 && (
          <div className="px-6 py-12 text-center">
            <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No rate plans found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first rate plan to set pricing</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={formData.mode === 'UPDATE' ? 'Edit Rate Plan' : 'Add Rate Plan'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {formData.mode === 'UPDATE' ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2">Room Type *</label>
            <select
              name="typeId"
              value={formData.typeId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select room type...</option>
              {roomTypes.map((type) => (
                <option key={type.type_id} value={type.type_id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Plan Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Summer Peak, Winter Special, Holiday Rate"
          />

          <FormInput
            label="Daily Rate ($) *"
            name="dailyRate"
            type="number"
            step="0.01"
            value={formData.dailyRate}
            onChange={handleChange}
            required
            placeholder="0.00"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date *"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <FormInput
              label="End Date *"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-600 mb-1">💡 Tip:</p>
            <p>Rate plans determine pricing for reservations. The system automatically calculates total charges based on the active rate plan for each night of the stay.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RatePlanManager;
