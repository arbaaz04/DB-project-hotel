// hms-frontend/src/api/apiService.js

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Generic API client for all requests to Node.js backend
 * Handles common error scenarios and response parsing
 */
const apiClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.details || errorBody.error || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    // Handle successful responses
    if (response.status === 204 || response.status === 201) {
      // Try to parse JSON, but if it fails, return success object
      try {
        return await response.json();
      } catch (e) {
        return { success: true, message: 'Operation successful.' };
      }
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`API Timeout [${endpoint}]`);
      throw new Error('Request timeout. Please try again.');
    }
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// ============= AUTHENTICATION =============

export const loginStaff = (data) =>
  apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const manageGuest = (data) =>
  apiClient('/auth/guest', {
    method: 'POST',
    body: JSON.stringify(data)
  });

// ============= READ OPERATIONS =============

export const fetchReservations = () => 
  apiClient('/reservations/list');

export const fetchAllRooms = () => 
  apiClient('/rooms/list/all');

export const fetchAllGuests = () => 
  apiClient('/guests/list');

export const fetchAllStaff = () => 
  apiClient('/staff/list');

export const fetchServiceItems = () => 
  apiClient('/service-items/list');

export const fetchRoomTypes = () =>
  apiClient('/rooms/types');

export const fetchAvailableRoomsForCheckin = (typeId) =>
  apiClient(`/rooms/available/${typeId}`);

export const fetchReservationDetails = (reservationId) =>
  apiClient(`/reservations/${reservationId}`);

export const fetchReservationCharges = (reservationId) =>
  apiClient(`/reservations/${reservationId}/charges`);

export const fetchReservationPayments = (reservationId) =>
  apiClient(`/reservations/${reservationId}/payments`);

export const fetchOutstandingBalance = (reservationId) =>
  apiClient(`/reservations/${reservationId}/balance`);

// ============= TRANSACTIONAL OPERATIONS =============

export const createNewReservation = (data) => 
  apiClient('/reservations/new', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const checkInGuest = (data) =>
  apiClient('/checkin', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const processCheckout = (data) =>
  apiClient('/checkout', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const cancelReservation = (data) =>
  apiClient('/reservations/cancel', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const addMinibarCharge = (data) =>
  apiClient('/reservations/minibar', {
    method: 'POST',
    body: JSON.stringify(data)
  });

// ============= ADMIN OPERATIONS =============

export const manageServiceItem = (data) =>
  apiClient('/admin/service-item', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const manageRoomConfig = (data) =>
  apiClient('/admin/room', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const updateRoomClean = (roomId) =>
  apiClient('/admin/rooms/clean', { 
    method: 'POST', 
    body: JSON.stringify({ roomId }) 
  });

export const fetchRatePlans = () =>
  apiClient('/admin/rate-plans');

export const manageRatePlan = (data) =>
  apiClient('/admin/rate-plan', {
    method: 'POST',
    body: JSON.stringify(data)
  });
