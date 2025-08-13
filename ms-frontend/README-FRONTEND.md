# Frontend - Plataforma Encuentro 🎤

Frontend de la plataforma de gestión de conciertos desarrollado con React.

## 🚀 Configuración y Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Backend API ejecutándose en `http://localhost:8000`

### Instalación

1. **Clonar e instalar dependencias:**
```bash
cd ms-frontend
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
REACT_APP_API_BASE_URL=http://localhost:8000
```

3. **Iniciar la aplicación:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🌐 Conexión con el Backend

La aplicación está configurada para conectarse con el backend en `http://localhost:8000`. Las rutas principales que consume son:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuarios

### Conciertos
- `GET /conciertos` - Obtener todos los conciertos
- `GET /conciertos/:id` - Obtener concierto por ID
- `POST /conciertos` - Crear nuevo concierto
- `PUT /conciertos/:id` - Actualizar concierto
- `DELETE /conciertos/:id` - Eliminar concierto

### Carrito
- `GET /cart` - Obtener carrito del usuario
- `POST /cart/add` - Agregar al carrito
- `PUT /cart/items/:id` - Actualizar cantidad
- `DELETE /cart/items/:id` - Eliminar del carrito
- `POST /cart/checkout` - Procesar compra

## 🎯 Funcionalidades

### ✅ Implementadas
- **Autenticación:** Login y registro de usuarios
- **Navegación:** Navbar responsive con estado de autenticación
- **Conciertos:** Lista, detalle y creación de conciertos
- **Carrito:** Agregar, modificar y comprar entradas
- **Protección de rutas:** Rutas protegidas para usuarios autenticados
- **Manejo de errores:** Gestión de errores de API
- **Estados de carga:** Spinners y mensajes informativos

### 🔄 Contextos Globales
- **AuthContext:** Manejo global de autenticación
- **CartContext:** Gestión del carrito de compras

### 🛡️ Rutas Protegidas
- `/cart` - Requiere autenticación
- `/crear-concierto` - Requiere autenticación

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.js
│   └── CartContext.js
├── pages/
│   ├── Cart.jsx
│   ├── ConciertoDetalle.jsx
│   ├── Conciertos.jsx
│   ├── CrearConcierto.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/
│   └── api.js
├── App.jsx
└── index.js
```

## 🔧 Servicios API

El archivo `src/services/api.js` contiene todos los servicios para comunicarse con el backend:

- **authService:** Autenticación y gestión de usuarios
- **conciertoService:** CRUD de conciertos
- **cartService:** Gestión del carrito
- **orderService:** Gestión de órdenes
- **userService:** Gestión de perfil de usuario

## 🎨 Estilos y UI

- **Bootstrap 5:** Framework CSS principal
- **React Bootstrap:** Componentes de Bootstrap para React
- **Gradientes personalizados:** Temas oscuros con acentos coloridos
- **Animaciones:** Usando animate.css

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
```

## 🔧 Configuración del Proxy

El proyecto incluye configuración de proxy en `package.json` para desarrollo:

```json
{
  "proxy": "http://localhost:8000"
}
```

## 📝 Variables de Entorno

Crear archivo `.env` con:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000
PORT=3000
GENERATE_SOURCEMAP=true
```

## 🛠️ Desarrollo

### Agregar nuevas funcionalidades

1. **Nuevas páginas:** Crear en `src/pages/`
2. **Nuevos componentes:** Crear en `src/components/`
3. **Nuevos servicios:** Agregar en `src/services/api.js`
4. **Nuevas rutas:** Agregar en `src/App.jsx`

### Buenas prácticas

- Usar hooks personalizados para lógica compleja
- Implementar manejo de errores en todos los servicios
- Usar contextos para estado global
- Implementar loading states para mejor UX

## 🔍 Debugging

Para debug de API calls, revisar:
1. Console del navegador para errores
2. Network tab para requests HTTP
3. Verificar que el backend esté ejecutándose

## 📦 Dependencias Principales

- `react` - Framework principal
- `react-router-dom` - Navegación
- `axios` - Cliente HTTP
- `bootstrap` - Estilos
- `react-bootstrap` - Componentes UI
- `animate.css` - Animaciones

## 🚀 Despliegue

Para producción:

1. Configurar variables de entorno de producción
2. Ejecutar `npm run build`
3. Servir la carpeta `build/` con un servidor web

---

¡Tu plataforma de conciertos está lista para funcionar! 🎵
