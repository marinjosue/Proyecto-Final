import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Verificar si hay un usuario logueado al cargar la aplicación
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      if (currentUser && token) {
        // Asegurarse de que el usuario tiene un rol definido
        const validatedUser = {
          ...currentUser,
          rol: currentUser.rol || 'usuario'
        };
        
        setUser(validatedUser);
        setIsAuthenticated(true);
        
        // Actualizar el localStorage con el usuario validado
        localStorage.setItem('user', JSON.stringify(validatedUser));
      } else {
        // Si no hay usuario o token, limpiar el estado
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      // En caso de error, reiniciar el estado
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      console.log("Login response:", response); // Depuración
      
      // Verificar que tenemos la respuesta correcta
      // El backend puede devolver user o usuario
      const userData = response.user || response.usuario;
      
      if (!response.token || !userData) {
        throw new Error('La respuesta del servidor no contiene los datos esperados');
      }
      
      // Asegurarnos de que el objeto usuario contiene un rol
      const user = {
        ...userData,
        // Si no viene un rol del backend, asignar 'usuario' como default
        rol: userData.rol || 'usuario'
      };
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("AuthContext - Enviando datos de registro:", userData);
      const response = await authService.register(userData);
      
      console.log("AuthContext - Register response:", response);
      
      // El backend puede devolver user o usuario
      const responseUser = response.user || response.usuario;
      
      // Opcional: Auto-login después del registro
      if (response.token && responseUser) {
        // Asegurarnos de que el objeto usuario contiene un rol
        const user = {
          ...responseUser,
          // Si no viene un rol del backend, asignar 'usuario' como default
          rol: responseUser.rol || 'usuario'
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      }
      
      return { success: true, user: responseUser };
    } catch (error) {
      console.error('AuthContext - Error en registro:', error);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.response) {
        console.error('AuthContext - Error response data:', error.response.data);
        console.error('AuthContext - Error response status:', error.response.status);
        errorMessage = error.response.data?.message || `Error del servidor (${error.response.status})`;
      } else if (error.request) {
        console.error('AuthContext - Network error:', error.request);
        errorMessage = 'Error de conexión con el servidor';
      } else {
        console.error('AuthContext - Error message:', error.message);
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
