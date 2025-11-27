# 🚀 Guía de Deployment a Render.com

## Preparación Completada ✅

Tu aplicación ya está lista para deployar en Render. Los siguientes cambios se han realizado:

- ✅ CORS configurado para producción
- ✅ Variables de entorno implementadas
- ✅ API URLs dinámicas (localhost en desarrollo, Render en producción)

## Paso 1: Crear Repositorio en GitHub

```bash
cd C:\Users\Usuario\Desktop\Scripts\Carnaval\CarnavalWEB
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
```

Crea un repositorio en GitHub:
1. Ve a [github.com](https://github.com/new)
2. Nombre: `carnaval-web`
3. Público o Privado (tu elección)
4. NO inicialices con README
5. Copia la URL del repositorio

Conecta y sube:
```bash
git remote add origin https://github.com/david01mc/carnaval-web.git
git push -u origin main
```

## Paso 2: Deploy del Backend en Render

### 2.1 Crear Web Service

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `carnaval-web`

### 2.2 Configurar el Backend

**Configuración Básica:**
- **Name**: `carnaval-api`
- **Root Directory**: `server` ⚠️ **MUY IMPORTANTE: Debe ser exactamente `server`**
- **Environment**: `Node`
- **Region**: `Frankfurt` (o el más cercano a España)
- **Branch**: `main`
- **Build Command**: `npm install` (automáticamente instala dependencias del servidor)
- **Start Command**: `npm start`
- **Plan**: `Free`

> ⚠️ **CRÍTICO**: Si ves el error "Missing script: start", verifica que el **Root Directory** esté configurado como `server` (sin `/` al inicio ni al final)

### 2.3 Variables de Entorno del Backend

Click en "Advanced" → "Add Environment Variable" y añade:

```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@carnavalrag.ju1u34a.mongodb.net/?appName=CarnavalRAG
DB_NAME=CarnavalRAG
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala
JWT_EXPIRES_IN=24h
```

> ⚠️ **IMPORTANTE**: Reemplaza `USERNAME` y `PASSWORD` con tus credenciales reales de MongoDB

### 2.4 Deploy

1. Click en "Create Web Service"
2. Espera 2-5 minutos mientras se despliega
3. Copia la URL (ej: `https://carnavalweb.onrender.com/`)

## Paso 3: Deploy del Frontend en Render

### 3.1 Crear Static Site

1. En Render, click "New +" → "Static Site"
2. Selecciona el mismo repositorio `carnaval-web`

### 3.2 Configurar el Frontend

**Configuración Básica:**
- **Name**: `carnaval-web`
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Branch**: `main`

### 3.3 Variables de Entorno del Frontend

Click en "Advanced" → "Add Environment Variable":

```
VITE_API_URL=https://carnaval-api.onrender.com
```

> ⚠️ **IMPORTANTE**: Usa la URL exacta de tu backend del Paso 2.4

### 3.4 Deploy

1. Click en "Create Static Site"
2. Espera 2-5 minutos
3. Tu app estará en `https://carnaval-web.onrender.com`

## Paso 4: Actualizar CORS del Backend

Una vez tengas la URL del frontend, actualiza el backend:

1. Ve a tu Web Service del backend en Render
2. Click en "Environment"
3. Añade una nueva variable:
   ```
   FRONTEND_URL=https://carnaval-web.onrender.com
   ```
4. El backend se redesplegará automáticamente

## Paso 5: Crear Usuario Admin en Producción

Necesitas crear un usuario admin directamente en MongoDB:

### Opción A: Usar MongoDB Compass

1. Abre MongoDB Compass
2. Conecta a tu cluster
3. Ve a la base de datos `CarnavalRAG`
4. Colección `users`
5. Insert Document:

```json
{
  "username": "admin",
  "email": "admin@carnaval.com",
  "password": "$2a$10$[hash_generado]",
  "role": "admin",
  "createdAt": {"$date": "2025-11-27T00:00:00.000Z"},
  "lastLogin": null
}
```

> **Nota**: Para generar el hash de la contraseña, puedes usar [bcrypt-generator.com](https://bcrypt-generator.com/)

### Opción B: Usar el Script (Localmente)

```bash
cd server
node scripts/createAdmin.js
```

Esto creará el usuario en MongoDB y podrás usarlo en producción.

## Paso 6: Verificar el Deployment

### 6.1 Probar el Backend

Abre en el navegador:
```
https://carnaval-api.onrender.com/api/agrupaciones
```

Deberías ver un JSON con las agrupaciones.

### 6.2 Probar el Frontend

1. Abre `https://carnaval-web.onrender.com`
2. Deberías ver la aplicación cargando
3. Click en "Iniciar Sesión"
4. Ingresa credenciales del admin
5. Verifica que puedes crear/editar/eliminar agrupaciones

## 🎉 ¡Listo!

Tu aplicación está en producción y accesible desde cualquier lugar del mundo.

## URLs Finales

- **Frontend**: `https://carnaval-web.onrender.com`
- **Backend API**: `https://carnaval-api.onrender.com`
- **MongoDB**: MongoDB Atlas (ya configurado)

## ⚠️ Limitaciones del Plan Gratuito

- **Backend se duerme** después de 15 minutos de inactividad
- **Primera carga lenta** (30-60 segundos al despertar)
- **750 horas/mes** de uso gratuito

### Solución: Mantener Backend Activo

Usa [UptimeRobot](https://uptimerobot.com) (gratis):
1. Crea una cuenta
2. Añade un monitor HTTP(S)
3. URL: `https://carnaval-api.onrender.com/api/agrupaciones`
4. Intervalo: 5 minutos
5. ¡Listo! Tu backend se mantendrá despierto

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Render detectará los cambios y redesplegará automáticamente.

## 🆘 Troubleshooting

### El frontend no carga
- Verifica que `VITE_API_URL` esté correctamente configurada
- Revisa los logs en Render Dashboard

### Error de CORS
- Verifica que `FRONTEND_URL` esté en las variables de entorno del backend
- Asegúrate de que la URL del frontend esté en la lista de `allowedOrigins`

### Backend no responde
- El backend puede estar dormido (plan gratuito)
- Espera 30-60 segundos para que despierte
- Considera usar UptimeRobot

### Login no funciona
- Verifica que `JWT_SECRET` esté configurado en el backend
- Asegúrate de haber creado un usuario admin en MongoDB

## 📞 Soporte

Si tienes problemas, revisa:
- Logs en Render Dashboard
- Console del navegador (F12)
- Variables de entorno configuradas correctamente
