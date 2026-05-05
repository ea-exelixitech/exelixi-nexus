import axios from 'axios';
const api = axios.create({ baseURL: '/api', withCredentials: true });
let _token = localStorage.getItem('exelitech_token') || '';
export const setToken = (t: string) => { _token = t; localStorage.setItem('exelitech_token', t); api.defaults.headers.common['Authorization'] = `Bearer ${t}`; };
export const clearToken = () => { _token = ''; localStorage.removeItem('exelitech_token'); delete api.defaults.headers.common['Authorization']; };
if (_token) api.defaults.headers.common['Authorization'] = `Bearer ${_token}`;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
export const orgsApi = {
  listar: () => api.get('/organizations'),
  crear: (d: any) => api.post('/organizations', d),
  actualizar: (id: string, d: any) => api.put(`/organizations/${id}`, d),
  suspender: (id: string) => api.post(`/organizations/${id}/suspender`),
  activar: (id: string) => api.post(`/organizations/${id}/activar`),
};
export const catalogApi = {
  listarModulos: () => api.get('/catalog/modules'),
  crearModulo: (d: any) => api.post('/catalog/modules', d),
  actualizarModulo: (id: string, d: any) => api.put(`/catalog/modules/${id}`, d),
  listarSubs: () => api.get('/catalog/subscriptions'),
  subsPorOrg: (orgId: string) => api.get(`/catalog/subscriptions/${orgId}`),
  activarModulo: (orgId: string, modId: string, d?: any) => api.post(`/catalog/subscriptions/${orgId}/${modId}/activate`, d || {}),
  desactivarModulo: (orgId: string, modId: string) => api.post(`/catalog/subscriptions/${orgId}/${modId}/deactivate`),
};
export const apiKeysApi = {
  listarTodas: () => api.get('/api-keys'),
  listarPorOrg: (orgId: string) => api.get(`/api-keys/org/${orgId}`),
  generar: (d: { organizationId: string; moduleId: string; nombre?: string }) => api.post('/api-keys', d),
  revocar: (id: string) => api.delete(`/api-keys/${id}/revoke`),
};
export const usersApi = {
  listar: () => api.get('/users'),
  crear: (d: any) => api.post('/users', d),
  actualizar: (id: string, d: any) => api.put(`/users/${id}`, d),
};
export default api;
