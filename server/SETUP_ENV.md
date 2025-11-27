# Instrucciones para configurar el archivo .env del servidor

## Opción 1: Crear manualmente

1. Crea un archivo llamado `.env` en la carpeta `server/`
2. Añade el siguiente contenido:

```
MONGODB_URI=tu_cadena_de_conexion_mongodb
DB_NAME=CarnavalRAG
PORT=3001
```

3. Reemplaza `tu_cadena_de_conexion_mongodb` con tu cadena de conexión real

## Opción 2: Copiar desde tu .env existente

Si tienes un archivo `.env` en `C:\Users\Usuario\Desktop\Scripts\Carnaval\` con tu MONGODB_URI:

```powershell
# Desde la carpeta CarnavalWEB
echo "MONGODB_URI=TU_CADENA_AQUI" > server\.env
echo "DB_NAME=CarnavalRAG" >> server\.env
echo "PORT=3001" >> server\.env
```

## Verificar que funciona

Después de crear el archivo, ejecuta:

```powershell
cd server
npm start
```

Deberías ver:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3001
```

## Ejemplo de MONGODB_URI

Tu cadena de conexión debería verse algo así:

```
mongodb+srv://usuario:password@cluster.mongodb.net/
```

o para MongoDB local:

```
mongodb://localhost:27017/
```
