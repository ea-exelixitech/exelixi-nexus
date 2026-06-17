import axios from 'axios';
const api = axios.create({ 
  baseURL: '/api', 
  headers: {
    'x-api-key': 'bd7c4671ebcc7e9c23cd51fa75df9f57',
    'Content-Type': 'application/json'
  }
});
let _token = localStorage.getItem('exelitech_token') || '';
export const setToken = (t: string) => { _token = t; localStorage.setItem('exelitech_token', t); api.defaults.headers.common['Authorization'] = `Bearer ${t}`; };
export const clearToken = () => { _token = ''; localStorage.removeItem('exelitech_token'); delete api.defaults.headers.common['Authorization']; };
if (_token) api.defaults.headers.common['Authorization'] = `Bearer ${_token}`;

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      let msg = response.data.message || (typeof response.data.error === 'string' ? response.data.error : null) || 'Error en la operación';
      if (response.data.details && Array.isArray(response.data.details) && response.data.details.length > 0) {
        msg = `${msg} (${response.data.details.map((d: any) => d.message).join(', ')})`;
      }
      return Promise.reject({ response: { data: { message: msg } } });
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data) {
      let msg = error.response.data.message || (typeof error.response.data.error === 'string' ? error.response.data.error : null) || 'Error en la operación';
      if (error.response.data.details && Array.isArray(error.response.data.details) && error.response.data.details.length > 0) {
        msg = `${msg} (${error.response.data.details.map((d: any) => d.message).join(', ')})`;
      }
      error.response.data.message = msg;
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
export const companiesApi = {
  listar: () => api.get('/companies'),
  detalle: (id: string) => api.get(`/companies/${id}`),
  crear: (d: any) => api.post('/companies', d),
  actualizar: (id: string, d: any) => api.put(`/companies/${id}`, d),
  eliminar: (id: string) => api.delete(`/companies/${id}`),
  toggleModule: (d: { empresaId: number; moduloId: number; active: boolean }) => api.post('/companies/toggle-module', d),
  toggleSubmodule: (d: { empresaId: number; submoduloId: number; active: boolean }) => api.post('/companies/toggle-submodule', d),
  generateApiKey: (id: number) => api.post(`/companies/${id}/generate-api-key`),
};
export const modulesApi = {
  listarActivos: () => api.get('/modules'),
  listarTodos: () => api.get('/modules/all'),
  crear: (d: any) => api.post('/modules', d),
  actualizar: (id: string, d: any) => api.put(`/modules/${id}`, d),
  eliminar: (id: string) => api.delete(`/modules/${id}`),
  crearSubmodulo: (d: any) => api.post('/modules/submodule', d),
  actualizarSubmodulo: (id: string, d: any) => api.put(`/modules/submodule/${id}`, d),
  eliminarSubmodulo: (id: string) => api.delete(`/modules/submodule/${id}`),
};
export const rolesApi = {
  listar: () => api.get('/roles'),
  crear: (d: any) => api.post('/roles', d),
  actualizar: (id: string, d: any) => api.put(`/roles/${id}`, d),
  eliminar: (id: string) => api.delete(`/roles/${id}`),
  matriz: (roleId: string) => api.get(`/roles/matrix/${roleId}`),
  guardarPermisos: (d: any) => api.post('/roles/permissions', d),
};
export const usersApi = {
  listar: () => api.get('/users'),
  detalle: (id: string) => api.get(`/users/${id}`),
  crear: (d: any) => api.post('/users', d),
  actualizar: (id: string, d: any) => api.put(`/users/${id}`, d),
  cambiarEstado: (id: string) => api.patch(`/users/${id}/status`),
  cambiarPassword: (d: any) => api.post('/users/change-password', d),
};
export const configApi = {
  generarToken: (empresaId: number, producto: string, modulo: string) =>
    api.get(`/config/token/${empresaId}/${producto}/${modulo}`),
};
export const emisionesApi = {
  trafico: (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return api.get(`/emisiones/trafico?${params.toString()}`);
  },
  porEmpresa: (empresaId: number, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return api.get(`/emisiones/empresa/${empresaId}?${params.toString()}`);
  },
  registrar: (data: Record<string, unknown>) => api.post('/emisiones', data),
};

export default api;
