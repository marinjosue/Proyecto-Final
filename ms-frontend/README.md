# Plataforma Encuentro 🎭🎵 - Frontend

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> Frontend moderno para la plataforma de gestión de conciertos y eventos "Encuentro"

## 🎬 Descripción

Encuentro es una plataforma completa para la gestión de conciertos y eventos musicales que permite a los usuarios explorar eventos, comprar boletos, gestionar reservas y entradas, todo en una interfaz moderna y fácil de usar. El proyecto está construido con React y se comunica con un backend basado en microservicios.

![Imagen de la Aplicación](https://via.placeholder.com/800x400?text=Plataforma+Encuentro)

## 🚀 Configuración y Despliegue

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

## ✨ Características Principales

### Sistema de Usuarios y Autenticación
- Registro de usuarios con validación de campos
- Inicio de sesión seguro con JWT
- Perfiles de usuario con diferentes roles (Admin/Cliente)
- Rutas protegidas basadas en roles

### Gestión de Conciertos
- Exploración de conciertos disponibles
- Vista detallada con información completa del evento
- Para administradores: Creación, edición y eliminación de conciertos

### Sistema de Reservas y Entradas
- Selección de zonas y cantidad de entradas
- Creación de reservas temporales (1 minuto para confirmar)
- Confirmación de reservas con selección de método de pago
- Generación automática de entradas con códigos QR

### Carrito de Compras
- Gestión integrada con el sistema de reservas
- Visualización clara de elementos seleccionados

## 🎨 Diseño UI Mejorado

### Tema y Estilo General
- Tema oscuro con acentos de color para mejor contraste
- Paleta de colores principal: Negro/gris oscuro (#222831, #1a1e25) con acentos en rosa (#ff4081)
- Uso de gradientes para añadir profundidad
- Tipografía moderna y legible

### Componentes Personalizados
- **Navbar mejorado**:
  - Diseño con gradiente y efectos de hover
  - Menú desplegable de usuario con información completa
  - Indicador de carrito con animación
  - Badges y estilos específicos para roles de usuario
  - Diseño responsive optimizado

- **Tarjetas de Concierto**:
  - Efectos de elevación y escala en hover
  - Información clara y bien estructurada
  - Badges para estado del concierto

- **Gestión de Reservas**:
  - Contador de tiempo con barra de progreso visual
  - Tarjetas informativas con estados claramente diferenciados
  - Animaciones para transiciones de estado

- **Formularios**:
  - Diseño limpio y accesible
  - Validación visual inmediata
  - Mensajes de error específicos

## 🌐 Conexión con el Backend

La aplicación está configurada para conectarse con el backend en `http://localhost:8000`. Las rutas principales que consume son:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuarios

### Conciertos
- `GET /api/conciertos` - Obtener todos los conciertos
- `GET /api/conciertos/:id` - Obtener concierto por ID
- `POST /api/conciertos` - Crear nuevo concierto
- `PUT /api/conciertos/:id` - Actualizar concierto
- `DELETE /api/conciertos/:id` - Eliminar concierto

### Reservas y Entradas
- `POST /api/reservas` - Crear reserva
- `GET /api/reservas/:id` - Obtener reserva por ID
- `PUT /api/reservas/:id/confirmar` - Confirmar reserva
- `DELETE /api/reservas/:id` - Eliminar reserva
- `GET /api/entradas/usuario/:id` - Obtener entradas del usuario

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   ├── Navbar.css    # Estilos personalizados para Navbar
│   └── ProtectedRoute.jsx
├── context/          # Gestión de estado global
│   ├── AuthContext.js
│   └── CartContext.js
├── pages/            # Páginas de la aplicación
│   ├── Cart.jsx
│   ├── ConciertoDetalle.jsx
│   ├── Conciertos.jsx
│   ├── CrearConcierto.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── MisReservas.jsx
│   ├── Register.jsx
│   └── admin/        # Páginas específicas de administrador
│       ├── AdminConciertos.jsx
│       ├── CrearEditarConcierto.jsx
│       └── GestionarZonas.jsx
├── services/         # Servicios de API
│   └── api.js        # Cliente API configurado con Axios
├── App.css
├── App.js/jsx
├── index.css
└── index.js
```

## 🛠️ Servicios API

El archivo `src/services/api.js` contiene todos los servicios para comunicarse con el backend:

- **authService:** Autenticación y gestión de usuarios
- **conciertoService:** CRUD de conciertos
- **reservaService:** Gestión de reservas temporales y confirmaciones
- **entradaService:** Consulta de entradas confirmadas
- **cartService:** Gestión del carrito de compras
- **orderService:** Gestión de órdenes

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test
```

## 🛡️ Rutas Protegidas
- `/cart` - Requiere autenticación
- `/mis-reservas` - Requiere autenticación
- `/admin/*` - Requiere autenticación y rol de administrador

## 📚 Buenas Prácticas Implementadas

- **Componentes Funcionales con Hooks**: Uso de React moderno
- **Manejo de Estado Global**: Uso de Context API para autenticación y carrito
- **Comunicación con Backend**: Cliente Axios configurado con interceptores para manejo de errores
- **Diseño Responsive**: Adaptable a diferentes dispositivos
- **Manejo de Errores**: Validación y feedback visual para el usuario
- **Código Modular**: Componentes reutilizables y funciones con responsabilidades claras

## 🔍 Debugging y Solución de Problemas

Para debug de API calls, revisar:
1. Console del navegador para errores
2. Network tab para requests HTTP
3. Verificar que el backend esté ejecutándose
4. Revisar los logs detallados que incluyen información sobre URLs, métodos, datos y respuestas

## 📦 Dependencias Principales

- `react` - Framework principal
- `react-router-dom` - Navegación
- `axios` - Cliente HTTP
- `bootstrap` - Framework CSS
- `react-bootstrap` - Componentes UI
- `react-qr-code` - Generación de códigos QR para entradas

## 👥 Equipo

- **Desarrollador Frontend**: [Tu Nombre]
- **Desarrollador Backend**: [Nombre del Desarrollador Backend]

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

¡Tu plataforma de conciertos está lista para funcionar! 🎵
