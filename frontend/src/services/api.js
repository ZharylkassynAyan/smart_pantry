const BASE_URL = 'https://smart-pantry-b.onrender.com/api';

// Helper: get auth headers
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper: handle response
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ---- Auth ----

export const register = (name, email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then(handleResponse);

export const login = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const getMe = () =>
  fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() }).then(handleResponse);

// ---- Profile ----

export const getProfile = () =>
  fetch(`${BASE_URL}/profile`, { headers: authHeaders() }).then(handleResponse);

export const updateProfile = (data) =>
  fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

// ---- Pantry ----

export const getPantryItems = () =>
  fetch(`${BASE_URL}/pantry`, { headers: authHeaders() }).then(handleResponse);

export const addPantryItem = (item) =>
  fetch(`${BASE_URL}/pantry`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(item),
  }).then(handleResponse);

export const updatePantryItem = (id, item) =>
  fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(item),
  }).then(handleResponse);

export const deletePantryItem = (id) =>
  fetch(`${BASE_URL}/pantry/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handleResponse);

export const getExpiringItems = () =>
  fetch(`${BASE_URL}/pantry/expiring`, { headers: authHeaders() }).then(handleResponse);

// ---- AI ----

export const getUseFirstSuggestions = () =>
  fetch(`${BASE_URL}/ai/use-first`, { headers: authHeaders() }).then(handleResponse);

export const getRecipeSuggestions = (ingredients = []) =>
  fetch(`${BASE_URL}/ai/recipes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ingredients }),
  }).then(handleResponse);
