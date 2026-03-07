import axios from 'axios';

// NOTE: The backend and database have been completely deleted.
// All API calls below will fail as the server is no longer running.

const api = axios.create({ baseURL: '/api' });
const ml = axios.create({ baseURL: '/ml' }); // ML service has also been deleted

export const intersectionApi = {
  getAll: (params) => api.get('/intersections', { params }),
  create: (data) => api.post('/intersections', data),
  getHotspots: () => api.get('/intersections/hotspots'),
};

export const parkingApi = {
  // Backend database for parking has been removed
  getAll: (params) => api.get('/parking', { params }),
  report: (data) => api.post('/parking', data),
  predict: (data) => api.post('/parking/predict', data),
};

export const bikeApi = {
  getSegments: (params) => api.get('/bike/segments', { params }),
  getSegment: (id) => api.get(`/bike/segments/${id}`),
};

export const routeApi = {
  plan: (data) => api.post('/routes/plan', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const mlApi = {
  // ML service backend has been removed
  predictParking: (data) => ml.post('/parking/predict', data),
  predictGas: (data) => ml.post('/gas-price/predict', data),
  clusterIntersections: (data) => ml.post('/intersection/cluster', data),
  scoreBike: (data) => ml.post('/bike/score', data),
};
