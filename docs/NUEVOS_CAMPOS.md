# 🆕 Nuevos Campos Añadidos

Se han agregado los siguientes campos a la estructura de datos de las agrupaciones:

## Campos Nuevos

### 1. **Callejera** (Sí/No)
- **Tipo**: Select (Sí/No)
- **Valor por defecto**: "No"
- **Descripción**: Indica si la agrupación es callejera
- **Ubicación en el formulario**: Sección "Información Adicional"

### 2. **Descripción de la Agrupación**
- **Tipo**: Textarea
- **Valor por defecto**: "" (vacío)
- **Descripción**: Texto descriptivo explicando la agrupación
- **Ubicación en el formulario**: Sección "Información Adicional"
- **Visualización**: Se muestra en la tarjeta (truncado a 150 caracteres)

### 3. **Características de la Agrupación**
- **Tipo**: Array de strings
- **Valor por defecto**: [] (array vacío)
- **Descripción**: Lista de características principales de la agrupación
- **Ubicación en el formulario**: Sección "Información Adicional"
- **Visualización**: Se muestran las primeras 3 en la tarjeta
- **Gestión**: Botones para añadir/eliminar características

### 4. **Componentes de la Agrupación**
- **Tipo**: Array de strings
- **Valor por defecto**: [] (array vacío)
- **Descripción**: Lista de personas que componen la agrupación
- **Ubicación en el formulario**: Sección "Información Adicional"
- **Visualización**: Se muestra el número total en la tarjeta
- **Gestión**: Botones para añadir/eliminar componentes

## Estructura JSON Actualizada

```json
{
  "name": "Nombre de la agrupación",
  "category": "Chirigota Adultos",
  "year": "2025",
  "callejera": "Sí",
  "descripcion": "Descripción detallada de la agrupación...",
  "caracteristicas": [
    "Característica 1",
    "Característica 2",
    "Característica 3",
    "Característica 4",
    "Característica 5"
  ],
  "componentes": [
    "Nombre Componente 1",
    "Nombre Componente 2",
    "Nombre Componente 3"
  ],
  "authors": [...],
  "lyrics": [...],
  "youtube": [...],
  "spotify": [...]
}
```

## Cambios Realizados

### Frontend

1. **AgrupacionForm.jsx**
   - Añadidos campos al estado inicial
   - Creada sección "Información Adicional"
   - Select para Callejera
   - Textarea para Descripción
   - Arrays dinámicos para Características y Componentes

2. **AgrupacionCard.jsx**
   - Badge "🚶 Callejera" si es callejera
   - Sección de descripción (truncada)
   - Lista de características (máximo 3 visibles)
   - Contador de componentes

### Backend

3. **server.js**
   - Añadidos valores por defecto en POST
   - Los campos se guardan automáticamente en MongoDB

## Uso

### Crear/Editar Agrupación

1. Abre el formulario (Nueva o Editar)
2. Navega a la sección "🎪 Información Adicional"
3. Selecciona si es Callejera (Sí/No)
4. Escribe la descripción en el textarea
5. Añade características con el botón "➕ Añadir Característica"
6. Añade componentes con el botón "➕ Añadir Componente"
7. Guarda los cambios

### Visualización

- **Badge Callejera**: Aparece solo si está marcada como "Sí"
- **Descripción**: Se muestra completa en el formulario, truncada en la tarjeta
- **Características**: Las primeras 3 se muestran en lista, el resto se indica con "+X más..."
- **Componentes**: Solo se muestra el número total

## Compatibilidad

✅ **Retrocompatible**: Las agrupaciones existentes sin estos campos seguirán funcionando correctamente.

Los valores por defecto aseguran que:
- `callejera` = "No"
- `descripcion` = ""
- `caracteristicas` = []
- `componentes` = []

## Próximos Pasos

Si necesitas modificar agrupaciones existentes para añadir estos campos:

1. Usa la interfaz web para editar cada agrupación
2. O ejecuta un script de migración en MongoDB para añadir los campos a todas las agrupaciones existentes

### Script de Migración (Opcional)

```javascript
// Ejecutar en MongoDB Compass o mongosh
db.agrupaciones.updateMany(
  { callejera: { $exists: false } },
  { 
    $set: { 
      callejera: "No",
      descripcion: "",
      caracteristicas: [],
      componentes: []
    } 
  }
)
```
