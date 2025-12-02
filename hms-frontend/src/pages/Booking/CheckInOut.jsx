// hms-frontend/src/pages/Booking/CheckInOut.jsx

import React, { useState, useEffect } from 'react';
import { fetchReservations, processCheckout, fetchOutstandingBalance } from '../../api/apiService';
import { Card, Table, Alert, Spinner, Modal, Button, FormInput } from '../../components';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CheckInOut = ({ setView }) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('checked-in');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    paymentAmount: '',
    paymentType: 'credit_card'
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [outstandingBalance, setOutstandingBalance] = useState(null);

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = reservations.filter(r => r.current_status === statusFilter);

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

  const handleCheckoutSubmit = async () => {
    if (!checkoutData.paymentAmount) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Please enter payment amount.' });
      return;
    }

    const paymentAmount = parseFloat(checkoutData.paymentAmount);
    const outstanding = parseFloat(outstandingBalance?.outstanding_balance || 0);

    if (paymentAmount < outstanding) {
      setAlert({ 
        type: 'warning', 
        title: 'Insufficient Payment', 
        message: `Payment amount must be at least $${outstanding.toFixed(2)} to cover the outstanding balance.` 
      });
      return;
    }

    setCheckoutSubmitting(true);
    try {
      await processCheckout({
        reservationId: selectedReservation.reservation_id,
        paymentAmount: parseFloat(checkoutData.paymentAmount),
        paymentType: checkoutData.paymentType
      });

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Guest checked out successfully. Room marked for cleaning.'
      });
      setShowCheckoutModal(false);
      setCheckoutData({ paymentAmount: '', paymentType: 'credit_card' });
      loadReservations();
    } catch (error) {
      setAlert({ type: 'error', title: 'Checkout Error', message: error.message });
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const calculateNights = (checkin, checkout) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const columns = [
    { 
      key: 'reservation_id', 
      label: 'ID', 
      width: '80px',
      render: (value) => <span className="font-mono text-gray-600">#{value}</span>
    },
    {
      key: 'guest_name',
      label: 'Guest Name',
      width: '180px',
      render: (value) => <span className="font-600 text-gray-900">{value || 'N/A'}</span>
    },
    {
      key: 'room_number',
      label: 'Room',
      width: '100px',
      render: (value) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-600">{value}</span>
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
      key: 'current_status',
      label: 'Status',
      width: '120px',
      render: (value) => {
        const statusConfig = {
          'checked-in': { bg: 'bg-green-50', text: 'text-green-700', label: 'Checked In' },
          'checked-out': { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Checked Out' }
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-600 text-gray-600">Checked In</p>
              <p className="text-3xl font-700 text-gray-900 mt-2">
                {reservations.filter(r => r.current_status === 'checked-in').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-600 text-gray-600">Checked Out</p>
              <p className="text-3xl font-700 text-gray-900 mt-2">
                {reservations.filter(r => r.current_status === 'checked-out').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-600 text-gray-600">Total</p>
              <p className="text-3xl font-700 text-gray-900 mt-2">
                {reservations.filter(r => ['checked-in', 'checked-out'].includes(r.current_status)).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <UserIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-700 text-gray-900">Check-In / Check-Out Management</h3>
          <p className="text-sm text-gray-600 mt-0.5">Process guest arrivals and departures</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by guest name, room, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
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
            actions={(row) => [
              ...(row.current_status === 'checked-in' ? [{
                label: 'Check-Out',
                onClick: async (r) => {
                  setSelectedReservation(r);
                  try {
                    const balance = await fetchOutstandingBalance(r.reservation_id);
                    setOutstandingBalance(balance);
                    setCheckoutData(prev => ({ ...prev, paymentAmount: balance.outstanding_balance || '0' }));
                  } catch (error) {
                    setAlert({ type: 'error', title: 'Error', message: 'Could not fetch balance' });
                    setOutstandingBalance(null);
                  }
                  setShowCheckoutModal(true);
                },
                className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-600'
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

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        title="Process Check-Out"
        onClose={() => {
          setShowCheckoutModal(false);
          setCheckoutData({ paymentAmount: '', paymentType: 'credit_card' });
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCheckoutModal(false);
                setCheckoutData({ paymentAmount: '', paymentType: 'credit_card' });
              }}
              disabled={checkoutSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCheckoutSubmit}
              disabled={checkoutSubmitting}
            >
              {checkoutSubmitting ? 'Processing...' : 'Confirm Check-Out'}
            </Button>
          </>
        }
      >
        {selectedReservation && (
          <div className="space-y-4">
            {/* Guest Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-600">Guest Information</span>
              </div>
              <p className="text-lg font-700 text-gray-900">{selectedReservation.guest_name}</p>
              <p className="text-sm text-gray-600">
                Room {selectedReservation.room_number} • Reservation #{selectedReservation.reservation_id}
              </p>
            </div>

            {/* Stay Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-sm font-600">Stay Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-600 text-gray-900">{selectedReservation.check_in}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-600 text-gray-900">{selectedReservation.check_out}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total nights: {calculateNights(selectedReservation.check_in, selectedReservation.check_out)}
              </p>
            </div>

            {/* Outstanding Balance */}
            {outstandingBalance && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-3">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span className="text-sm font-600">Outstanding Balance</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Charges:</span>
                    <span className="font-700 text-gray-900">${parseFloat(outstandingBalance.total_charges || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payments:</span>
                    <span className="font-700 text-gray-900">${parseFloat(outstandingBalance.total_payments || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-2 flex justify-between">
                    <span className="font-600 text-gray-700">Outstanding:</span>
                    <span className="text-lg font-bold text-amber-700">${parseFloat(outstandingBalance.outstanding_balance || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="space-y-3">
              <FormInput
                label="Payment Amount *"
                name="paymentAmount"
                type="number"
                step="0.01"
                min={outstandingBalance?.outstanding_balance || 0}
                value={checkoutData.paymentAmount}
                onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                required
                placeholder="0.00"
              />
              {outstandingBalance && parseFloat(checkoutData.paymentAmount || 0) < parseFloat(outstandingBalance.outstanding_balance || 0) && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Payment must be at least ${parseFloat(outstandingBalance.outstanding_balance || 0).toFixed(2)}</span>
                </p>
              )}

              <div>
                <label className="block text-sm font-600 text-gray-700 mb-2">
                  Payment Type *
                </label>
                <select
                  name="paymentType"
                  value={checkoutData.paymentType}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                Note: Room will be marked as "dirty" after checkout and needs cleaning before next guest.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckInOut;
