const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

const getJson = async (path, params) => {
  const query = buildQuery(params);
  const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ''}`);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

export const getCityId = async (city) => getJson('/hotels/city-id', { city });

export const getHotelsFromMakCorps = async ({
  cityId,
  page = 0,
  currency = 'USD',
  rooms = 1,
  adults = 2,
  checkin,
  checkout,
}) => getJson('/hotels/makcorps', {
  cityId,
  page,
  currency,
  rooms,
  adults,
  checkin,
  checkout,
});

export const getHotelsFromBookingAPI = async ({
  city,
  bbox,
  page = 1,
  pageSize = 6,
  checkin,
  checkout,
  adults = 2,
  rooms = 1,
  currency = 'USD',
}) => getJson('/hotels/booking', {
  city,
  bbox,
  page,
  pageSize,
  checkin,
  checkout,
  adults,
  rooms,
  currency,
});

export const getManualHotels = async ({ city, search } = {}) =>
  getJson('/hotels/manual', { city, search });

export const createHotelBooking = async ({ hotel, reservation, payment_method }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vous devez etre connecte pour reserver.');
  }

  const response = await fetch(`${API_BASE}/hotels/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hotel, reservation, payment_method }),
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Booking failed.');
  }

  return data;
};

export const getAdminHotels = async ({ city, search } = {}) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}/hotels/admin/hotels?${buildQuery({ city, search })}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to load hotels.');
  }
  return data;
};

export const saveAdminHotel = async (hotel, hotelId = null) => {
  const token = localStorage.getItem('adminToken');
  const method = hotelId ? 'PUT' : 'POST';
  const path = hotelId ? `/hotels/admin/hotels/${hotelId}` : '/hotels/admin/hotels';

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(hotel),
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to save hotel.');
  }
  return data;
};

export const deleteAdminHotel = async (hotelId) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}/hotels/admin/hotels/${hotelId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to delete hotel.');
  }
  return data;
};

export const getHotelReservationsAdmin = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}/hotels/reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to load reservations.');
  }
  return data;
};

export const updateHotelReservationStatus = async (reservationId, status) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE}/hotels/reservations/${reservationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Failed to update reservation.');
  }
  return data;
};
