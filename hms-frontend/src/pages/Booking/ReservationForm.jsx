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
    <div className="h-full flex flex-col space-y-4 pb-6">
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

      {/* Step 1: Guest Selection/Creation */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 h-full">
          {/* Guest Management Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setGuestMode('search')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-600 transition-colors ${
                    guestMode === 'search'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Search
                </button>
                <button
                  onClick={() => setGuestMode('create')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-600 transition-colors ${
                    guestMode === 'create'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New Guest
                </button>
              </div>

              {guestMode === 'search' ? (
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-600 text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Name, email, or NIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                  />
                  
                  {loading ? (
                    <div className="flex justify-center py-12 flex-1">
                      <Spinner text="Loading guests..." />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      <h3 className="text-sm font-700 text-gray-900 mb-3">Available Guests</h3>
                      <div className="max-h-64 overflow-y-auto space-y-2 flex-1">
                        {filteredGuests.map((guest) => (
                          <button
                            key={guest.guest_id}
                            onClick={() => handleGuestSelect(guest)}
                            className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                              selectedGuest?.guest_id === guest.guest_id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-600 text-gray-900 text-sm">{guest.guest_name}</p>
                                <p className="text-xs text-gray-600">{guest.email}</p>
                                {guest.phone && <p className="text-xs text-gray-500">{guest.phone}</p>}
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {guest.booking_count} bookings
                              </span>
                            </div>
                          </button>
                        ))}
                        {filteredGuests.length === 0 && (
                          <p className="text-center text-gray-500 py-8 text-sm">No guests found</p>
                        )}
                      </div>

                      {selectedGuest && (
                        <button
                          onClick={() => setStep(2)}
                          className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white text-sm font-600 rounded-lg hover:bg-blue-700"
                        >
                          Continue with {selectedGuest.guest_name}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <FormInput
                    label="Name"
                    name="name"
                    value={newGuestData.name}
                    onChange={handleNewGuestChange}
                    required
                    placeholder="Full name"
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={newGuestData.email}
                    onChange={handleNewGuestChange}
                    required
                    placeholder="Email"
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    value={newGuestData.phone}
                    onChange={handleNewGuestChange}
                    placeholder="Phone"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormInput
                      label="NIC"
                      name="nic"
                      value={newGuestData.nic}
                      onChange={handleNewGuestChange}
                      placeholder="NIC"
                    />
                    <FormInput
                      label="Passport"
                      name="passport"
                      value={newGuestData.passport}
                      onChange={handleNewGuestChange}
                      placeholder="Passport"
                    />
                  </div>
                  <button
                    onClick={handleCreateGuest}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Guest'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Reservation Details */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-700 text-blue-600">{selectedGuest?.guest_name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-700 text-gray-900">{selectedGuest?.guest_name}</h3>
              <p className="text-sm text-gray-600">{selectedGuest?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                label="Check-in *"
                name="checkinDate"
                type="date"
                value={formData.checkinDate}
                onChange={handleReservationChange}
                required
                error={errors.checkinDate}
              />
              <FormInput
                label="Check-out *"
                name="checkoutDate"
                type="date"
                value={formData.checkoutDate}
                onChange={handleReservationChange}
                required
                error={errors.checkoutDate}
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button onClick={() => setStep(1)} variant="secondary">
              Back
            </Button>
            <Button onClick={() => setStep(3)} variant="primary">
              Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-700 text-gray-900 mb-6">Review Reservation</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Guest Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700 font-600 mb-2">Guest</p>
              <p className="text-lg font-700 text-gray-900">{selectedGuest?.guest_name}</p>
              <p className="text-sm text-gray-600">{selectedGuest?.email}</p>
              {selectedGuest?.phone && <p className="text-sm text-gray-600">{selectedGuest.phone}</p>}
            </div>

            {/* Reservation Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-700 font-600 mb-2">Room Details</p>
              <p className="text-lg font-700 text-gray-900">
                {roomTypes.find(t => t.type_id === parseInt(formData.typeId))?.name}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
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
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
            <Button onClick={() => setStep(2)} variant="secondary" disabled={submitting}>
              Back
            </Button>
            <Button onClick={handleSubmit} variant="success" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
