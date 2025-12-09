// hms-frontend/src/pages/Admin/InventoryManager.jsx

import React, { useState, useEffect } from 'react';
import {
  fetchServiceItems,
  fetchAllRooms,
  fetchRoomTypes,
  manageServiceItem,
  manageRoomConfig,
  updateRoomClean
} from '../../api/apiService';
import { Card, Table, Alert, Spinner, Modal, Button, FormInput, Tabs } from '../../components';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Service Items State
  const [serviceItems, setServiceItems] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    mode: 'CREATE',
    itemId: '',
    name: '',
    price: ''
  });

  // Rooms State
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    mode: 'CREATE',
    roomId: '',
    roomNumber: '',
    typeId: '',
    status: 'clean'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [services, roomsList, types] = await Promise.all([
        fetchServiceItems(),
        fetchAllRooms(),
        fetchRoomTypes()
      ]);
      setServiceItems(Array.isArray(services) ? services : []);
      setRooms(Array.isArray(roomsList) ? roomsList : []);
      setRoomTypes(Array.isArray(types) ? types : []);
      
      // Set default typeId if roomTypes loaded
      if (types && types.length > 0 && !roomFormData.typeId) {
        setRoomFormData(prev => ({ ...prev, typeId: types[0].type_id.toString() }));
      }
    } catch (error) {
      setAlert({ type: 'error', title: 'Load Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Service Items Handlers
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSubmit = async () => {
    if (!serviceFormData.name || !serviceFormData.price) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please fill all fields.' });
      return;
    }

    try {
      await manageServiceItem({
        mode: serviceFormData.mode,
        itemId: serviceFormData.mode === 'UPDATE' ? parseInt(serviceFormData.itemId) : null,
        name: serviceFormData.name,
        price: parseFloat(serviceFormData.price)
      });

      setAlert({
        type: 'success',
        title: 'Success',
        message: `Service item ${serviceFormData.mode === 'UPDATE' ? 'updated' : 'created'} successfully.`
      });
      setShowServiceModal(false);
      setServiceFormData({ mode: 'CREATE', itemId: '', name: '', price: '' });
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Service Error', message: error.message });
    }
  };

  const handleDeleteService = async (item) => {
    if (!window.confirm(`Delete service item "${item.item_name}"?`)) return;

    try {
      await manageServiceItem({
        mode: 'DELETE',
        itemId: item.item_id
      });
      setAlert({ type: 'success', title: 'Success', message: 'Service item deleted.' });
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Delete Error', message: error.message });
    }
  };

  const handleEditService = (item) => {
    setServiceFormData({
      mode: 'UPDATE',
      itemId: item.item_id,
      name: item.item_name,
      price: item.item_price
    });
    setShowServiceModal(true);
  };

  // Room Handlers
  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomSubmit = async () => {
    if (!roomFormData.roomNumber || !roomFormData.typeId) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please fill all required fields including room type.' });
      return;
    }

    try {
      await manageRoomConfig({
        mode: roomFormData.mode,
        roomId: roomFormData.mode === 'UPDATE' ? parseInt(roomFormData.roomId) : null,
        roomNumber: roomFormData.roomNumber,
        typeId: parseInt(roomFormData.typeId),
        status: roomFormData.status
      });

      setAlert({
        type: 'success',
        title: 'Success',
        message: `Room ${roomFormData.mode === 'UPDATE' ? 'updated' : 'created'} successfully.`
      });
      setShowRoomModal(false);
      setRoomFormData({ mode: 'CREATE', roomId: '', roomNumber: '', typeId: '1', status: 'clean' });
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Room Error', message: error.message });
    }
  };

  const handleMarkClean = async (room) => {
    if (room.current_status === 'clean') {
      setAlert({ type: 'info', title: 'Info', message: 'Room is already clean.' });
      return;
    }

    try {
      await updateRoomClean(room.room_id);
      setAlert({ type: 'success', title: 'Success', message: 'Room marked as clean.' });
      loadData();
    } catch (error) {
      setAlert({ type: 'error', title: 'Error', message: error.message });
    }
  };

  const handleEditRoom = (room) => {
    setRoomFormData({
      mode: 'UPDATE',
      roomId: room.room_id,
      roomNumber: room.room_number,
      typeId: room.type_id || '1',
      status: room.current_status
    });
    setShowRoomModal(true);
  };

  const serviceColumns = [
    {
      key: 'itemid',
      label: 'ID',
      width: '60px',
      render: (value) => <span className="font-mono text-gray-600">#{value}</span>
    },
    {
      key: 'item_name',
      label: 'Item Name',
      render: (value) => <span className="font-600 text-gray-900 block truncate">{value}</span>
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => <span className="text-gray-900 font-700">${value}</span>
    }
  ];

  const roomColumns = [
    {
      key: 'room_id',
      label: 'ID',
      width: '60px',
      render: (value) => <span className="font-mono text-gray-600">#{value}</span>
    },
    {
      key: 'room_number',
      label: 'Room Number',
      render: (value) => <span className="font-700 text-gray-900 block truncate">{value}</span>
    },
    {
      key: 'type_name',
      label: 'Type',
      render: (value) => <span className="text-gray-700 block truncate">{value}</span>
    },
    {
      key: 'current_status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          clean: { bg: 'bg-green-50', text: 'text-green-700' },
          dirty: { bg: 'bg-amber-50', text: 'text-amber-700' },
          occupied: { bg: 'bg-blue-50', text: 'text-blue-700' }
        };
        const config = statusConfig[value] || { bg: 'bg-gray-50', text: 'text-gray-700' };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg ${config.bg} ${config.text} text-xs font-600 capitalize`}>
            {value}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex justify-center">
          <Spinner text="Loading inventory..." />
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

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2 shrink-0">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-600 transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'services'
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          Service Items
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-600 transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'rooms'
              ? 'bg-blue-50 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BuildingOffice2Icon className="w-5 h-5" />
          Room Management
        </button>
      </div>

      {/* Service Items Tab */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-700 text-gray-900">Service Items</h3>
              <p className="text-sm text-gray-600 mt-0.5">Manage minibar and service charges</p>
            </div>
            <Button
              onClick={() => {
                setServiceFormData({ mode: 'CREATE', itemId: '', name: '', price: '' });
                setShowServiceModal(true);
              }}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1">
            <Table
              columns={serviceColumns}
              data={serviceItems}
              actions={(row) => [
                {
                  label: 'Edit',
                  onClick: handleEditService,
                  className: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                },
                {
                  label: 'Delete',
                  onClick: handleDeleteService,
                  className: 'bg-red-50 text-red-700 hover:bg-red-100'
                }
              ]}
            />
          </div>

          {serviceItems.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No service items found</p>
            </div>
          )}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-700 text-gray-900">Room Management</h3>
              <p className="text-sm text-gray-600 mt-0.5">Configure and maintain hotel rooms</p>
            </div>
            <Button
              onClick={() => {
                const defaultTypeId = roomTypes.length > 0 ? roomTypes[0].type_id.toString() : '';
                setRoomFormData({ mode: 'CREATE', roomId: '', roomNumber: '', typeId: defaultTypeId, status: 'clean' });
                setShowRoomModal(true);
              }}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1">
            <Table
              columns={roomColumns}
              data={rooms}
              actions={(row) => [
                ...(row.current_status === 'dirty' ? [{
                  label: 'Mark Clean',
                  onClick: handleMarkClean,
                  className: 'bg-green-50 text-green-700 hover:bg-green-100'
                }] : []),
                {
                  label: 'Edit',
                  onClick: handleEditRoom,
                  className: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }
              ]}
            />
          </div>

          {rooms.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No rooms found</p>
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      <Modal
        isOpen={showServiceModal}
        title={serviceFormData.mode === 'UPDATE' ? 'Edit Service Item' : 'Add Service Item'}
        onClose={() => setShowServiceModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowServiceModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleServiceSubmit}>
              {serviceFormData.mode === 'UPDATE' ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Item Name"
            name="name"
            value={serviceFormData.name}
            onChange={handleServiceChange}
            required
            placeholder="e.g., Coca Cola, Snickers"
          />
          <FormInput
            label="Price"
            name="price"
            type="number"
            step="0.01"
            value={serviceFormData.price}
            onChange={handleServiceChange}
            required
            placeholder="0.00"
          />
        </div>
      </Modal>

      {/* Room Modal */}
      <Modal
        isOpen={showRoomModal}
        title={roomFormData.mode === 'UPDATE' ? 'Edit Room' : 'Add Room'}
        onClose={() => setShowRoomModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRoomModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRoomSubmit}>
              {roomFormData.mode === 'UPDATE' ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Room Number"
            name="roomNumber"
            value={roomFormData.roomNumber}
            onChange={handleRoomChange}
            required
            placeholder="e.g., 101, 201"
          />
          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2">Room Type</label>
            <select
              name="typeId"
              value={roomFormData.typeId}
              onChange={handleRoomChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select room type...</option>
              {roomTypes.map((type) => (
                <option key={type.type_id} value={type.type_id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          {roomFormData.mode === 'UPDATE' && (
            <div>
              <label className="block text-sm font-600 text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={roomFormData.status}
                onChange={handleRoomChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="clean">Clean</option>
                <option value="dirty">Dirty</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InventoryManager;
