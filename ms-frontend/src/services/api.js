import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Interceptor para agregar token de autenticación si existe
api.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL + config.url;
    console.log("🚀 Enviando petición a:", fullUrl);
    console.log("🚀 Método:", config.method.toUpperCase());
    console.log("🚀 Datos:", config.data);
    console.log("🚀 Headers:", config.headers);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token agregado:", token.substring(0, 20) + "...");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response success:");
    console.log("- URL:", response.config.url);
    console.log("- Status:", response.status);
    console.log("- Data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error details:");
    console.error("- URL:", error.config?.url);
    console.error("- Method:", error.config?.method);
    console.error("- Status:", error.response?.status);
    console.error("- Status Text:", error.response?.statusText);
    console.error("- Response Data:", error.response?.data);
    console.error("- Error Message:", error.message);
    console.error("- Full URL:", error.config?.baseURL + error.config?.url);
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error("🔴 Network error - Backend might not be running on port 8000");
    }
    
    if (error.response?.status === 502) {
      console.error("🟡 502 Bad Gateway - Microservicio probablemente arrancando o reiniciándose");
      console.error("🔄 Se reintentará automáticamente...");
    }
    
    if (error.response?.status === 404) {
      console.error("🔴 404 - Endpoint not found. Check if the backend route exists.");
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    console.log("API Service - Login attempt with:", credentials);
    
    // Probar diferentes rutas hasta encontrar la correcta
    const possibleRoutes = [
      '/api/usuarios/login',
      '/usuarios/login', 
      '/auth/login',
      '/api/auth/login',
      '/login'
    ];
    
    let lastError = null;
    
    for (const route of possibleRoutes) {
      try {
        console.log(`🔍 Probando ruta: ${route}`);
        const response = await api.post(route, credentials);
        console.log(`✅ Ruta exitosa: ${route}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Ruta fallida: ${route}`, error.response?.status);
        lastError = error;
        
        // Si obtenemos un 400 (datos incorrectos) pero la ruta existe, usar esta ruta
        if (error.response?.status === 400) {
          console.log(`🎯 Ruta encontrada con error de datos: ${route}`);
          throw error;
        }
        
        continue;
      }
    }
    
    // Si llegamos aquí, ninguna ruta funcionó
    throw lastError;
  },
  
  register: async (userData) => {
    console.log("API Service - Register attempt with:", userData);
    
    // Probar diferentes rutas para registro
    const possibleRoutes = [
      '/api/usuarios/register',
      '/usuarios/register',
      '/auth/register', 
      '/api/auth/register',
      '/register'
    ];
    
    let lastError = null;
    
    for (const route of possibleRoutes) {
      try {
        console.log(`🔍 Probando ruta de registro: ${route}`);
        const response = await api.post(route, userData);
        console.log(`✅ Ruta de registro exitosa: ${route}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Ruta de registro fallida: ${route}`, error.response?.status);
        lastError = error;
        
        // Si obtenemos un 400 pero la ruta existe
        if (error.response?.status === 400) {
          console.log(`🎯 Ruta de registro encontrada: ${route}`);
          throw error;
        }
        
        continue;
      }
    }
    
    throw lastError;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Si hay un error, limpiar el localStorage para evitar errores futuros
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Servicios de conciertos
export const conciertoService = {
  // Obtener todos los conciertos con retry automático
  getConciertos: async () => {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 Intento ${i + 1}/${maxRetries} - Cargando conciertos...`);
        const response = await api.get('/api/conciertos');
        console.log(`✅ Conciertos cargados exitosamente en intento ${i + 1}`);
        return response.data;
      } catch (error) {
        lastError = error;
        console.log(`❌ Intento ${i + 1} falló:`, error.response?.status, error.message);
        
        // Si es 502 (Bad Gateway), esperar un momento y reintentar
        if (error.response?.status === 502 && i < maxRetries - 1) {
          console.log(`⏳ Esperando 2 segundos antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // Si no es 502 o es el último intento, lanzar el error
        throw error;
      }
    }
    
    throw lastError;
  },
  
  // Obtener un concierto por ID con retry
  getConciertoById: async (id) => {
    const maxRetries = 2;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await api.get(`/api/conciertos/${id}`);
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status === 502 && i < maxRetries - 1) {
          console.log(`⏳ Reintentando getConciertoById en 1.5 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  },

  // Obtener zonas por concierto con retry
  getZonasByConcierto: async (conciertoId) => {
    const maxRetries = 2;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await api.get(`/api/zonas/concierto/${conciertoId}`);
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status === 502 && i < maxRetries - 1) {
          console.log(`⏳ Reintentando getZonasByConcierto en 1.5 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  },

  // Crear un nuevo concierto
  createConcierto: async (conciertoData) => {
    const response = await api.post('/api/conciertos', conciertoData);
    return response.data;
  },

  // Actualizar un concierto
  updateConcierto: async (id, conciertoData) => {
    const response = await api.put(`/api/conciertos/${id}`, conciertoData);
    return response.data;
  },

  // Eliminar un concierto
  deleteConcierto: async (id) => {
    const response = await api.delete(`/api/conciertos/${id}`);
    return response.data;
  },

  // Buscar conciertos por criterios
  searchConciertos: async (searchParams) => {
    const response = await api.get('/api/conciertos', { params: searchParams });
    return response.data;
  },

  // Crear una nueva zona
  createZona: async (zonaData) => {
    const response = await api.post('/api/zonas', zonaData);
    return response.data;
  },

  // Actualizar una zona
  updateZona: async (id, zonaData) => {
    const response = await api.put(`/api/zonas/${id}`, zonaData);
    return response.data;
  },

  // Eliminar una zona
  deleteZona: async (id) => {
    const response = await api.delete(`/api/zonas/${id}`);
    return response.data;
  },

  // Obtener zona por ID
  getZonaById: async (id) => {
    const response = await api.get(`/api/zonas/${id}`);
    return response.data;
  }
};

// Servicios de reservas (según el flujo del backend)
export const reservaService = {
  // Crear una reserva
  createReserva: async (reservaData) => {
    const response = await api.post('/api/reservas', reservaData);
    return response.data;
  },
  
  // Confirmar una reserva (esto dispara la generación automática de entradas)
  confirmarReserva: async (reservaId, metodoPago = "tarjeta") => {
    console.log(`Confirmando reserva ${reservaId} con método de pago: ${metodoPago}`);
    try {
      const response = await api.put(`/api/reservas/${reservaId}/confirmar`, {
        metodo_pago: metodoPago
      });
      console.log("✅ Reserva confirmada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error confirmando reserva:", error);
      throw error;
    }
  },
  
  // Obtener reserva por ID
  getReservaById: async (id) => {
    const response = await api.get(`/api/reservas/${id}`);
    return response.data;
  },
  
  // Obtener mi reserva por ID (id de la tabla reservas)
  getMiReservaById: async (reservaId) => {
    if (!reservaId) {
      throw new Error('Debe proporcionar el ID de la reserva');
    }
    console.log("🔍 Obteniendo reserva por ID:", reservaId);
    try {
      const response = await api.get(`/api/reservas/${reservaId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo reserva por ID:", error);
      throw error;
    }
  },
  
  // Eliminar reserva
  deleteReserva: async (id) => {
    const response = await api.delete(`/api/reservas/${id}`);
    return response.data;
  }
};

// Servicios de entradas
export const entradaService = {
  // Obtener mis entradas confirmadas (usando el ID del usuario)
  getMisEntradas: async (usuarioId) => {
    const response = await api.get(`/api/entradas/usuario/${usuarioId}`);
    return response.data;
  },
  
  // Obtener entrada por ID
  getEntradaById: async (id) => {
    const response = await api.get(`/api/entradas/${id}`);
    return response.data;
  }
};

// Simplificar el servicio de carrito para usar reservas
export const cartService = {
  // El carrito será manejado localmente y luego se convertirá en reservas
  createReservaFromCart: async (cartItem) => {
    return await reservaService.createReserva({
      evento_id: cartItem.conciertoId,
      zona_id: cartItem.zonaId,
      cantidad: cartItem.cantidad
    });
  }
};

// Servicios de órdenes/pedidos - ahora basado en entradas
export const orderService = {
  // Obtener entradas del usuario (equivalente a órdenes)
  getUserEntradas: async (usuarioId) => {
    const response = await api.get(`/api/entradas/usuario/${usuarioId}`);
    return response.data;
  },
  
  // Obtener entrada por ID
  getEntradaById: async (id) => {
    const response = await api.get(`/api/entradas/${id}`);
    return response.data;
  }
};

// Servicios de usuarios
export const userService = {
  // Obtener perfil del usuario
  getProfile: async () => {
    const response = await api.get('/api/usuarios/me');
    return response.data;
  },

};

export default api;
