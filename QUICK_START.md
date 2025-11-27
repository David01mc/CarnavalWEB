# 🚀 Guía de Inicio Rápido

## Paso 1: Configurar el Backend

1. Copia tu cadena de conexión de MongoDB del archivo `.env` principal
2. Crea el archivo `server/.env` con el siguiente contenido:

```env
MONGODB_URI=tu_cadena_de_conexion_mongodb
DB_NAME=CarnavalRAG
PORT=3001
```

## Paso 2: Iniciar el Backend

Abre una terminal en la carpeta del proyecto:

```bash
cd server
npm start
```

Deberías ver:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3001
```

## Paso 3: Iniciar el Frontend

Abre **otra terminal** en la carpeta del proyecto:

```bash
npm run dev
```

Deberías ver algo como:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Paso 4: Abrir la Aplicación

Abre tu navegador en: **http://localhost:5173**

¡Listo! Ya puedes gestionar tus agrupaciones de carnaval 🎭

---

## Solución de Problemas Comunes

### ❌ Error: "Cannot connect to MongoDB"
- Verifica que tu `MONGODB_URI` sea correcto
- Si usas MongoDB Atlas, verifica que tu IP esté en la whitelist

### ❌ Error: "Port 3001 already in use"
- Cambia el puerto en `server/.env` a otro (ej: 3002)
- Actualiza `API_URL` en `src/App.jsx` al nuevo puerto

### ❌ La página está en blanco
- Abre la consola del navegador (F12) para ver errores
- Verifica que el backend esté corriendo
- Verifica que no haya errores de CORS

### ❌ No aparecen datos
- Verifica que la colección se llame `agrupaciones` en MongoDB
- Verifica que el `DB_NAME` en `.env` sea correcto
