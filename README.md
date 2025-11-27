# 🎭 Carnaval CRUD Web Application

Sistema de gestión web para agrupaciones de carnaval con interfaz moderna y operaciones CRUD completas.

## 🚀 Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar agrupaciones
- 🔍 **Búsqueda y Filtros**: Buscar por nombre/autor, filtrar por categoría y año
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- 🎨 **UI Moderna**: Interfaz oscura con efectos glassmorphism y animaciones
- 📝 **Formularios Dinámicos**: Gestión de arrays complejos (autores, letras, enlaces)
- 🗄️ **MongoDB**: Conexión directa a tu base de datos CarnavalRAG

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- npm o yarn

## 🛠️ Instalación

### 1. Backend (API)

```bash
cd server
npm install
```

Crea un archivo `.env` en la carpeta `server` con:

```env
MONGODB_URI=tu_connection_string_de_mongodb
DB_NAME=CarnavalRAG
PORT=3001
```

> **Nota**: Puedes copiar tu `MONGODB_URI` del archivo `.env` existente en `C:\Users\Usuario\Desktop\Scripts\Carnaval\.env`

### 2. Frontend (React)

```bash
cd ..
npm install
```

## 🚀 Ejecución

### Opción 1: Ejecutar ambos servicios manualmente

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Opción 2: Script combinado (recomendado)

Puedes crear un script para ejecutar ambos servicios simultáneamente. Instala `concurrently`:

```bash
npm install --save-dev concurrently
```

Y añade este script al `package.json` principal:

```json
"scripts": {
  "dev:all": "concurrently \"cd server && npm start\" \"npm run dev\""
}
```

Luego ejecuta:
```bash
npm run dev:all
```

## 📖 Uso

1. **Accede a la aplicación**: Abre tu navegador en `http://localhost:5173`
2. **Backend API**: Corre en `http://localhost:3001`

### Funcionalidades:

- **➕ Nueva Agrupación**: Click en el botón "Nueva Agrupación" para crear una entrada
- **🔍 Buscar**: Escribe en el campo de búsqueda para filtrar por nombre o autor
- **🗂️ Filtrar**: Usa los selectores para filtrar por categoría o año
- **✏️ Editar**: Click en "Editar" en cualquier tarjeta
- **🗑️ Eliminar**: Click en "Eliminar" (con confirmación)

### Campos Soportados:

- **Básicos**: nombre, categoría, año, posición, imagen, link
- **Autores**: Array de objetos con nombre, rol, imagen, link
- **Letras**: Array de objetos con título, tipo, contenido, URL, vistas
- **Enlaces**: Arrays de YouTube y Spotify

## 🗂️ Estructura del Proyecto

```
CarnavalWEB/
├── server/                 # Backend Express
│   ├── server.js          # API REST con endpoints CRUD
│   ├── package.json
│   └── .env               # Configuración MongoDB
├── src/
│   ├── components/
│   │   ├── AgrupacionCard.jsx       # Tarjeta de visualización
│   │   ├── AgrupacionForm.jsx       # Formulario CRUD
│   │   └── DeleteConfirmModal.jsx   # Modal de confirmación
│   ├── App.jsx            # Componente principal
│   ├── index.css          # Estilos globales
│   └── main.jsx
└── package.json
```

## 🔌 API Endpoints

- `GET /api/agrupaciones` - Listar todas (con query params: search, category, year)
- `GET /api/agrupaciones/:id` - Obtener una por ID
- `POST /api/agrupaciones` - Crear nueva
- `PUT /api/agrupaciones/:id` - Actualizar
- `DELETE /api/agrupaciones/:id` - Eliminar

## 🎨 Personalización

Los estilos están centralizados en `src/index.css` con variables CSS:

```css
--primary: #e91e63;
--secondary: #673ab7;
--background: #0a0a0a;
--surface: #1a1a1a;
```

Modifica estas variables para cambiar el tema de colores.

## 🐛 Troubleshooting

### Error de conexión a MongoDB
- Verifica que tu `MONGODB_URI` en `.env` sea correcto
- Asegúrate de que MongoDB esté corriendo (si es local)
- Verifica la IP whitelist si usas MongoDB Atlas

### CORS Error
- Verifica que el backend esté corriendo en el puerto 3001
- El CORS está configurado para aceptar todas las peticiones

### Puerto en uso
- Cambia el puerto en `server/.env` si 3001 está ocupado
- Actualiza `API_URL` en `src/App.jsx` si cambias el puerto

## 📝 Notas

- La colección de MongoDB debe llamarse `agrupaciones`
- Los datos existentes en tu base de datos se mostrarán automáticamente
- El formulario soporta todos los campos del JSON original
- Las imágenes rotas se ocultan automáticamente

## 🔮 Futuras Mejoras

- [ ] Paginación para grandes cantidades de datos
- [ ] Exportar/Importar JSON
- [ ] Validación de formularios más robusta
- [ ] Subida de imágenes
- [ ] Autenticación de usuarios
- [ ] Historial de cambios

---

**Desarrollado para la gestión del Carnaval de Cádiz** 🎭
