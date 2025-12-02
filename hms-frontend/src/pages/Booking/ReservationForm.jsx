// hms-frontend/src/pages/Booking/ReservationForm.jsx

import React, { useState, useEffect } from 'react';
import { createNewReservation, fetchAllGuests, fetchRoomTypes, manageGuest } from '../../api/apiService';
import { Card, FormInput, Button, Alert, Spinner } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  HomeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ReservationForm = ({ setView }) => {
  const { staff } = useAuth();
  const [step, setStep] = useState(1); // 1: Guest, 2: Reservation Details, 3: Confirm
  
  // Guest Step
  const [guestMode, setGuestMode] = useState('search'); // 'search' or 'create'
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    nic: '',
    passport: '',
    phone: '',
    email: ''
  });

  // Reservation Step
  const [formData, setFormData] = useState({
    typeId: '',
    checkinDate: '',
    checkoutDate: '',
    status: 'confirmed'
  });
  const [roomTypes, setRoomTypes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (step === 1) {
      loadGuests();
    } else if (step === 2) {
      loadRoomTypes();
    }
  }, [step]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await fetchAllGuests();
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlert({ type: 'error', title: 'Load Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadRoomTypes = async () => {
    try {
      const data = await fetchRoomTypes();
      const types = Array.isArray(data) ? data : [];
      setRoomTypes(types);
      // Set default typeId when room types load
      if (types.length > 0 && !formData.typeId) {
        setFormData(prev => ({ ...prev, typeId: types[0].type_id.toString() }));
      }
    } catch (error) {
      console.error('Failed to load room types:', error);
      setAlert({ type: 'error', title: 'Load Error', message: 'Failed to load room types.' });
    }
  };

  const filteredGuests = guests.filter(g =>
    g.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.nic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGuestSelect = (guest) => {
    setSelectedGuest(guest);
  };

  const handleNewGuestChange = (e) => {
    const { name, value } = e.target;
    setNewGuestData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGuest = async () => {
    if (!newGuestData.name || !newGuestData.email) {
      setAlert({ type: 'warning', title: 'Validation', message: 'Name and email are required.' });
      return;
    }

    try {
      setLoading(true);
      const response = await manageGuest({
        mode: 'CREATE',
        ...newGuestData
      });
      setSelectedGuest({
        guest_id: response.guestId,
        guest_name: response.guestName,
        email: response.guestEmail
      });
      setAlert({ type: 'success', title: 'Success', message: 'Guest created successfully!' });
      setStep(2);
    } catch (error) {
      setAlert({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateReservation = () => {
    const newErrors = {};
    if (!formData.typeId) newErrors.typeId = 'Room type is required';
    if (!formData.checkinDate) newErrors.checkinDate = 'Check-in date is required';
    if (!formData.checkoutDate) newErrors.checkoutDate = 'Check-out date is required';

    if (formData.checkinDate && formData.checkoutDate) {
      const checkin = new Date(formData.checkinDate);
      const checkout = new Date(formData.checkoutDate);
      if (checkout <= checkin) {
        newErrors.checkoutDate = 'Check-out must be after check-in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateReservation()) return;

    if (!selectedGuest || !selectedGuest.guest_id) {
      setAlert({ type: 'error', title: 'Error', message: 'No guest selected.' });
      return;
    }

    if (!staff || !staff.staffId) {
      setAlert({ type: 'error', title: 'Error', message: 'Authentication error. Please log in again.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guestId: selectedGuest.guest_id,
        staffId: staff.staffId,
        typeId: parseInt(formData.typeId),
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        status: formData.status
      };
      
      console.log('Creating reservation with payload:', payload);
      const response = await createNewReservation(payload);
      console.log('Reservation created successfully:', response);

      setAlert({
        type: 'success',
        title: 'Success!',
        message: 'Reservation created successfully. Redirecting...'
      });

      setTimeout(() => setView('dashboard'), 2000);
    } catch (error) {
      console.error('Reservation creation error:', error);
      setAlert({ 
        type: 'error', 
        title: 'Booking Error', 
        message: error.message || 'Failed to create reservation. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full overflow-y-auto py-4">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => {
            if (alert.type !== 'success') setAlert(null);
          }}
        />
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              } font-700`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-sm font-600">
          <span className={step >= 1 ? 'text-blue-600' : 'text-gray-600'}>Guest</span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-gray-600'}>Details</span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-gray-600'}>Confirm</span>
        </div>
      </div>

      {/* Step 1: Guest Selection/Creation */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-700 text-gray-900 mb-6">Select or Create Guest</h3>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setGuestMode('search')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-600 transition-colors ${
                guestMode === 'search'
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Search Existing
            </button>
            <button
              onClick={() => setGuestMode('create')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-600 transition-colors ${
                guestMode === 'create'
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <UserPlusIcon className="w-5 h-5 inline mr-2" />
              Create New
            </button>
          </div>

          {guestMode === 'search' ? (
            <div>
              {/* Search Input */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, email, or NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Guest List */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner text="Loading guests..." />
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredGuests.map((guest) => (
                    <div
                      key={guest.guest_id}
                      onClick={() => handleGuestSelect(guest)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGuest?.guest_id === guest.guest_id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-700 text-gray-900">{guest.guest_name}</p>
                          <p className="text-sm text-gray-600">{guest.email}</p>
                          {guest.phone && <p className="text-sm text-gray-500">{guest.phone}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                            {guest.booking_count} bookings
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredGuests.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No guests found</p>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedGuest}
                  variant="primary"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FormInput
                label="Full Name *"
                name="name"
                value={newGuestData.name}
                onChange={handleNewGuestChange}
                required
                placeholder="Enter guest name"
              />
              <FormInput
                label="Email *"
                name="email"
                type="email"
                value={newGuestData.email}
                onChange={handleNewGuestChange}
                required
                placeholder="guest@example.com"
              />
              <FormInput
                label="Phone"
                name="phone"
                value={newGuestData.phone}
                onChange={handleNewGuestChange}
                placeholder="+1234567890"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="NIC"
                  name="nic"
                  value={newGuestData.nic}
                  onChange={handleNewGuestChange}
                  placeholder="National ID"
                />
                <FormInput
                  label="Passport"
                  name="passport"
                  value={newGuestData.passport}
                  onChange={handleNewGuestChange}
                  placeholder="Passport Number"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={handleCreateGuest}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? 'Creating...' : 'Create & Continue'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Reservation Details */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-700 text-gray-900 mb-6">Reservation Details</h3>

          {/* Selected Guest Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 font-600 mb-1">Guest</p>
            <p className="text-lg font-700 text-blue-900">{selectedGuest?.guest_name}</p>
            <p className="text-sm text-blue-600">{selectedGuest?.email}</p>
          </div>

          <div className="space-y-5">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-600 text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                name="typeId"
                value={formData.typeId}
                onChange={handleReservationChange}
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Check-in Date *"
                name="checkinDate"
                type="date"
                value={formData.checkinDate}
                onChange={handleReservationChange}
                required
                error={errors.checkinDate}
              />
              <FormInput
                label="Check-out Date *"
                name="checkoutDate"
                type="date"
                value={formData.checkoutDate}
                onChange={handleReservationChange}
                required
                error={errors.checkoutDate}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-600 text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleReservationChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setStep(1)} variant="secondary">
              <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(3)} variant="primary">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-700 text-gray-900 mb-6">Confirm Reservation</h3>

          <div className="space-y-4">
            {/* Guest Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <UserPlusIcon className="w-4 h-4" />
                Guest Information
              </p>
              <p className="font-700 text-gray-900">{selectedGuest?.guest_name}</p>
              <p className="text-sm text-gray-600">{selectedGuest?.email}</p>
            </div>

            {/* Reservation Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <HomeIcon className="w-4 h-4" />
                Room & Dates
              </p>
              <p className="font-700 text-gray-900">
                {roomTypes.find(t => t.id === parseInt(formData.typeId))?.name}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-600 text-gray-900">{formData.checkinDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-600 text-gray-900">{formData.checkoutDate}</p>
                </div>
              </div>
            </div>

            {/* Staff Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Created by</p>
              <p className="font-600 text-gray-900">{staff?.userName}</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setStep(2)} variant="secondary" disabled={submitting}>
              <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
              Back
            </Button>
            <Button onClick={handleSubmit} variant="success" disabled={submitting}>
              {submitting ? (
                'Creating...'
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                  Confirm Reservation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
