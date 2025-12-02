// hms-frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { 
  fetchReservations, 
  fetchReservationDetails,
  fetchReservationCharges,
  fetchReservationPayments,
  cancelReservation, 
  checkInGuest,
  addMinibarCharge,
  fetchServiceItems,
  fetchAvailableRoomsForCheckin
} from '../api/apiService';
import { Card, Table, Alert, Spinner, Modal, Button, FormInput } from '../components';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ setView }) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checkInRoomId, setCheckInRoomId] = useState('');
  const [reservationDetails, setReservationDetails] = useState(null);
  const [reservationCharges, setReservationCharges] = useState([]);
  const [reservationPayments, setReservationPayments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showMinibarModal, setShowMinibarModal] = useState(false);
  const [minibarData, setMinibarData] = useState({ itemId: '', quantity: 1 });
  const [serviceItems, setServiceItems] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');

  useEffect(() => {
    loadReservations();
    loadServiceItems();
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = reservations;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.current_status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reservation_id?.toString().includes(searchTerm) ||
        r.room_number?.toString().includes(searchTerm)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, searchTerm]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await fetchReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlert({ type: 'error', title: 'Load Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadServiceItems = async () => {
    try {
      const items = await fetchServiceItems();
      setServiceItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Could not load service items:', error);
    }
  };

  const loadReservationDetails = async (reservationId) => {
    try {
      setDetailsLoading(true);
      const [details, charges, payments] = await Promise.all([
        fetchReservationDetails(reservationId),
        fetchReservationCharges(reservationId),
        fetchReservationPayments(reservationId)
      ]);
      setReservationDetails(details);
      setReservationCharges(charges);
      setReservationPayments(payments);
    } catch (error) {
      setAlert({ type: 'error', title: 'Details Error', message: error.message });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRowClick = async (row) => {
    setSelectedReservation(row);
    setShowDetailsModal(true);
    await loadReservationDetails(row.reservation_id);
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Cancel reservation #${reservation.reservation_id}?`)) return;

    try {
      await cancelReservation({ reservationId: reservation.reservation_id });
      setAlert({ type: 'success', title: 'Success', message: 'Reservation cancelled.' });
      loadReservations();
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      setAlert({ type: 'error', title: 'Cancel Error', message: error.message });
    }
  };

  const handleCheckInSubmit = async () => {
    if (!checkInRoomId) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please select a room from the list.' });
      return;
    }

    try {
      await checkInGuest({
        reservationId: selectedReservation.reservation_id,
        assignedRoomNumber: checkInRoomId
      });

      setAlert({
        type: 'success',
        title: 'Check-In Successful',
        message: `Guest checked into room ${checkInRoomId}. Initial room charges applied. Payment: Card - $${selectedReservation.totalcharged || selectedReservation.total_charged || 0}`
      });
      setShowCheckInModal(false);
      setCheckInRoomId('');
      setRoomSearchTerm('');
      setAvailableRooms([]);
      loadReservations();
    } catch (error) {
      // Keep modal open so user can try again with different room
      setAlert({ type: 'error', title: 'Check-In Error', message: error.message });
      // Clear the selected room so user can choose another
      setCheckInRoomId('');
      setRoomSearchTerm('');
    }
  };

  const handleMinibarSubmit = async () => {
    if (!minibarData.itemId || !minibarData.quantity) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please select item and quantity.' });
      return;
    }

    try {
      await addMinibarCharge({
        reservationId: selectedReservation.reservation_id,
        itemId: parseInt(minibarData.itemId),
        quantity: parseInt(minibarData.quantity)
      });

      setAlert({ type: 'success', title: 'Success', message: 'Minibar charge added successfully.' });
      setShowMinibarModal(false);
      setMinibarData({ itemId: '', quantity: 1 });
      if (showDetailsModal) {
        await loadReservationDetails(selectedReservation.reservation_id);
      }
    } catch (error) {
      setAlert({ type: 'error', title: 'Minibar Error', message: error.message });
    }
  };

  const columns = [
    { 
      key: 'reservation_id', 
      label: 'ID', 
      width: '80px',
      render: (value) => <span className="font-mono text-gray-600 font-600">#{value}</span>
    },
    { 
      key: 'guest_name', 
      label: 'Guest Name', 
      width: '180px',
      render: (value) => <span className="font-600 text-gray-900">{value || 'N/A'}</span>
    },
    { 
      key: 'check_in', 
      label: 'Check-in', 
      width: '120px',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    { 
      key: 'check_out', 
      label: 'Check-out', 
      width: '120px',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    { 
      key: 'room_number', 
      label: 'Room', 
      width: '100px',
      render: (value) => value ? 
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-600">{value}</span> : 
        <span className="text-gray-400 text-sm">Unassigned</span>
    },
    { 
      key: 'current_status', 
      label: 'Status', 
      width: '120px',
      render: (value) => {
        const statusConfig = {
          confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
          'checked-in': { bg: 'bg-green-50', text: 'text-green-700', label: 'Checked In' },
          'checked-out': { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Checked Out' },
          cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' }
        };
        const config = statusConfig[value] || { bg: 'bg-gray-50', text: 'text-gray-700', label: value };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg ${config.bg} ${config.text} text-xs font-600`}>
            {config.label}
          </span>
        );
      }
    }
  ];

  const stats = [
    {
      label: 'Total Reservations',
      value: reservations.length,
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      label: 'Checked In',
      value: reservations.filter(r => r.current_status === 'checked-in').length,
      icon: CheckIcon,
      color: 'green'
    },
    {
      label: 'Confirmed',
      value: reservations.filter(r => r.current_status === 'confirmed').length,
      icon: ClockIcon,
      color: 'amber'
    },
    {
      label: 'Cancelled',
      value: reservations.filter(r => r.current_status === 'cancelled').length,
      icon: XMarkIcon,
      color: 'red'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex justify-center">
          <Spinner text="Loading reservations..." />
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            amber: 'bg-amber-50 text-amber-600',
            red: 'bg-red-50 text-red-600'
          };
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-600 text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-700 text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-700 text-gray-900">Active Reservations</h3>
          <p className="text-sm text-gray-600 mt-0.5">Manage and view all bookings</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by guest name, room, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={loadReservations}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-600"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <Table
            columns={columns}
            data={filteredReservations}
            onRowClick={handleRowClick}
            actions={(row) => [
              ...(row.current_status === 'confirmed' ? [{
                label: 'Check-In',
                onClick: async (r) => {
                  setSelectedReservation(r);
                  setCheckInRoomId('');
                  setRoomSearchTerm('');
                  setAvailableRooms([]);
                  setShowCheckInModal(true);
                  // Load available rooms for this reservation's room type
                  try {
                    const rooms = await fetchAvailableRoomsForCheckin(r.type_id || r.typeid);
                    setAvailableRooms(Array.isArray(rooms) ? rooms : []);
                  } catch (error) {
                    console.error('Could not load available rooms:', error);
                    setAvailableRooms([]);
                  }
                },
                className: 'bg-green-50 text-green-700 hover:bg-green-100 font-600'
              }] : []),
              ...(row.current_status === 'checked-in' ? [{
                label: 'Add Minibar',
                onClick: (r) => {
                  setSelectedReservation(r);
                  setShowMinibarModal(true);
                },
                className: 'bg-purple-50 text-purple-700 hover:bg-purple-100 font-600'
              }] : []),
              ...(row.current_status === 'confirmed' ? [{
                label: 'Cancel',
                onClick: handleCancel,
                className: 'bg-red-50 text-red-700 hover:bg-red-100 font-600'
              }] : [])
            ]}
          />
        </div>

        {filteredReservations.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No reservations found</p>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={showCheckInModal}
        title={`Check-in Guest`}
        onClose={() => {
          setShowCheckInModal(false);
          setCheckInRoomId('');
          setRoomSearchTerm('');
          setAvailableRooms([]);
        }}
        footer={
          <>
            <Button 
              variant="secondary"
              onClick={() => {
                setShowCheckInModal(false);
                setCheckInRoomId('');
                setRoomSearchTerm('');
                setAvailableRooms([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="success"
              onClick={handleCheckInSubmit}
              disabled={!checkInRoomId}
            >
              Confirm Check-In
            </Button>
          </>
        }
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Reservation <span className="font-mono">#{selectedReservation.reservation_id}</span></p>
              <p className="text-sm font-600 text-gray-900 mt-1">{selectedReservation.guest_name}</p>
            </div>
            
            {/* Room Selection Dropdown with Search */}
            <div>
              <label className="block text-sm font-600 text-gray-900 mb-2">
                Select Available Room *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={roomSearchTerm}
                  onChange={(e) => setRoomSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-t-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                />
                <div className="border border-t-0 border-gray-300 rounded-b-lg max-h-48 overflow-y-auto bg-white">
                  {availableRooms.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No clean rooms available for this room type
                    </div>
                  ) : (
                    availableRooms
                      .filter(room => 
                        !roomSearchTerm || 
                        room.room_number.toLowerCase().includes(roomSearchTerm.toLowerCase())
                      )
                      .map((room) => (
                        <button
                          key={room.room_id}
                          type="button"
                          onClick={() => {
                            setCheckInRoomId(room.room_number);
                            setRoomSearchTerm('');
                          }}
                          className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            checkInRoomId === room.room_number ? 'bg-blue-50 text-blue-700 font-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-600">Room {room.room_number}</span>
                            <span className="text-xs text-gray-500">{room.type_name}</span>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
              {checkInRoomId && (
                <p className="mt-2 text-sm text-green-600 font-600">
                  ✓ Selected: Room {checkInRoomId}
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              💳 Payment Method: Card | Deposit: ${selectedReservation.totalcharged || selectedReservation.total_charged || 0}
            </div>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        title="Reservation Details"
        onClose={() => {
          setShowDetailsModal(false);
          setReservationDetails(null);
          setReservationCharges([]);
          setReservationPayments([]);
        }}
        size="large"
      >
        {detailsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner text="Loading details..." />
          </div>
        ) : reservationDetails ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">"
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-600">Guest Information</span>
                </div>
                <p className="text-lg font-700 text-gray-900">{reservationDetails.guest_name}</p>
                <p className="text-sm text-gray-600">{reservationDetails.guest_email}</p>
                <p className="text-sm text-gray-600">{reservationDetails.guest_phone}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <BuildingOffice2Icon className="w-5 h-5" />
                  <span className="text-sm font-600">Room Details</span>
                </div>
                <p className="text-lg font-700 text-gray-900">
                  {reservationDetails.room_number || 'Not Assigned'}
                </p>
                <p className="text-sm text-gray-600">{reservationDetails.room_type}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-sm font-600">Stay Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-600 text-gray-900">{reservationDetails.checkin_date}</p>
                  {reservationDetails.actual_checkin_date && (
                    <p className="text-xs text-gray-500">Actual: {new Date(reservationDetails.actual_checkin_date).toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-600 text-gray-900">{reservationDetails.checkout_date}</p>
                  {reservationDetails.actual_checkout_date && (
                    <p className="text-xs text-gray-500">Actual: {new Date(reservationDetails.actual_checkout_date).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span className="text-sm font-600">Financial Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Total Charged</p>
                  <p className="text-xl font-700 text-blue-900">${reservationDetails.total_charged}</p>
                </div>
                <div>
                  <p className="text-blue-600">Total Payments</p>
                  <p className="text-xl font-700 text-green-700">${reservationDetails.total_payments}</p>
                </div>
                <div>
                  <p className="text-blue-600">Balance</p>
                  <p className="text-xl font-700 text-gray-900">${reservationDetails.balance}</p>
                </div>
              </div>
            </div>

            {/* Charges */}
            {reservationCharges.length > 0 && (
              <div>
                <h4 className="text-sm font-700 text-gray-900 mb-3">Charges</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-600 text-gray-600">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-gray-600">Time</th>
                        <th className="px-4 py-3 text-right text-xs font-600 text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservationCharges.map((charge) => (
                        <tr key={charge.transaction_id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{charge.charge_description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{charge.charge_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(charge.charge_time).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-600">
                            ${charge.charge_amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payments */}
            {reservationPayments.length > 0 && (
              <div>
                <h4 className="text-sm font-700 text-gray-900 mb-3">Payments</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-600 text-gray-600">Payment Type</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-gray-600">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-600 text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservationPayments.map((payment) => (
                        <tr key={payment.payment_id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.payment_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(payment.payment_date).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 text-right font-600">
                            ${payment.payment_amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Staff Info */}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>Created by: {reservationDetails.staff_name}</p>
              <p>Status: <span className="font-600 capitalize">{reservationDetails.current_status}</span></p>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Minibar Charge Modal */}
      <Modal
        isOpen={showMinibarModal}
        title="Add Minibar Charge"
        onClose={() => {
          setShowMinibarModal(false);
          setMinibarData({ itemId: '', quantity: 1 });
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMinibarModal(false);
                setMinibarData({ itemId: '', quantity: 1 });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMinibarSubmit}
            >
              Add Charge
            </Button>
          </>
        }
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="text-sm font-600">Guest Information</span>
              </div>
              <p className="text-lg font-700 text-gray-900">{selectedReservation.guest_name}</p>
              <p className="text-sm text-gray-600">
                Room {selectedReservation.room_number} • Reservation #{selectedReservation.reservation_id}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-600 text-gray-700 mb-2">
                  Service Item *
                </label>
                <select
                  value={minibarData.itemId}
                  onChange={(e) => setMinibarData({ ...minibarData, itemId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select item...</option>
                  {serviceItems.map((item) => (
                    <option key={item.itemid} value={item.itemid}>
                      {item.item_name} - ${item.price}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Quantity *"
                name="quantity"
                type="number"
                min="1"
                value={minibarData.quantity}
                onChange={(e) => setMinibarData({ ...minibarData, quantity: e.target.value })}
                required
              />

              {minibarData.itemId && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-700 text-gray-900">
                      ${(
                        (serviceItems.find(i => i.itemid === parseInt(minibarData.itemId))?.price || 0) * 
                        parseInt(minibarData.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
