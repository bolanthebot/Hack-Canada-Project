import axios from 'axios';

const api = axios.create({ baseURL: '/api' });
const ml = axios.create({ baseURL: '/ml' });

export const intersectionApi = {
  getAll: (params) => api.get('/intersections', { params }),
  create: (data) => api.post('/intersections', data),
  getHotspots: () => api.get('/intersections/hotspots'),
};

export const parkingApi = {
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
  navigate: (data) => api.post('/routes/navigate', data),
  getGasStops: (data) => api.post('/routes/gas-stops', data),
  compare: (data) => api.post('/routes/compare', data),
  marketIntelligence: (data) => api.post('/routes/market-intelligence', data),
  priceForecast: (data) => api.post('/routes/price-forecast', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const mlApi = {
  predictParking: (data) => ml.post('/parking/predict', data),
  predictGas: (data) => ml.post('/gas-price/predict', data),
  clusterIntersections: (data) => ml.post('/intersection/cluster', data),
  scoreBike: (data) => ml.post('/bike/score', data),
};