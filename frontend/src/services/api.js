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

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const normalizeMessage = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const clearClientSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('client');
};

const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
};

const isExpiredTokenMessage = (message = '') => {
  const normalized = normalizeMessage(message);
  return normalized.includes('token invalide ou expire')
    || normalized.includes('token manquant')
    || normalized.includes('jwt expired')
    || normalized.includes('jwt malformed');
};

const resolveErrorMessage = (message, authType) => {
  if (!isExpiredTokenMessage(message)) {
    return message || 'Request failed.';
  }

  if (authType === 'admin') {
    clearAdminSession();
    return 'Session admin expiree. Reconnectez-vous pour gerer les hotels.';
  }

  if (authType === 'client') {
    clearClientSession();
    return 'Votre session a expire. Reconnectez-vous pour continuer votre reservation.';
  }

  return message || 'Request failed.';
};

const requestJson = async (path, {
  method = 'GET',
  params,
  body,
  headers = {},
  authType = null,
} = {}) => {
  const query = buildQuery(params);
  const authToken = authType === 'admin'
    ? localStorage.getItem('adminToken')
    : authType === 'client'
      ? localStorage.getItem('token')
      : null;

  const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ''}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await parseJson(response);
  if (!response.ok || data.success === false) {
    throw new Error(resolveErrorMessage(data.message, authType));
  }

  return data;
};

export const getHotelsCatalog = async (params = {}) => requestJson('/hotels', { params });
export const getPopularHotels = async (limit = 4) => requestJson('/hotels/popular', { params: { limit } });
export const getHotelById = async (hotelId) => requestJson(`/hotels/${hotelId}`);
export const getHotelPageCover = async () => requestJson('/hotels/covers');
export const updateHotelPageCover = async (hero) => requestJson('/hotels/covers', {
  method: 'PUT',
  authType: 'admin',
  body: { hero },
});

export const createHotelBooking = async ({
  hotel,
  reservation,
  payment_method,
  promo_code = null,
  applied_promotion = null,
  display_total = null,
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vous devez etre connecte pour reserver.');
  }

  return requestJson('/hotels/book', {
    method: 'POST',
    authType: 'client',
    body: {
      hotel,
      reservation,
      payment_method,
      promo_code,
      applied_promotion,
      display_total,
    },
  });
};

export const getMyHotelReservations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vous devez etre connecte pour voir vos reservations.');
  }

  return requestJson('/hotels/mine', { authType: 'client' });
};

export const getAdminHotels = async ({ city, search } = {}) =>
  requestJson('/hotels/admin/hotels', {
    params: { city, search },
    authType: 'admin',
  });

export const saveAdminHotel = async (hotel, hotelId = null) => {
  const method = hotelId ? 'PUT' : 'POST';
  const path = hotelId ? `/hotels/admin/hotels/${hotelId}` : '/hotels/admin/hotels';

  return requestJson(path, {
    method,
    authType: 'admin',
    body: hotel,
  });
};

export const deleteAdminHotel = async (hotelId) =>
  requestJson(`/hotels/admin/hotels/${hotelId}`, {
    method: 'DELETE',
    authType: 'admin',
  });

export const getHotelReservationsAdmin = async () =>
  requestJson('/hotels/reservations', { authType: 'admin' });

export const updateHotelReservationStatus = async (reservationId, status) =>
  requestJson(`/hotels/reservations/${reservationId}/status`, {
    method: 'PATCH',
    authType: 'admin',
    body: { status },
  });
