# 🔄 Auto-Propagación de Imágenes y Descripciones de Autores

## ✨ Funcionalidad Automática

Cuando editas una agrupación desde la interfaz web y actualizas la **imagen** o **descripción** de un autor, **automáticamente se propaga** a todas las demás agrupaciones que tengan ese mismo autor.

## 🎯 Cómo Funciona

### Desde la Interfaz Web

1. **Edita cualquier agrupación**
2. **Actualiza la imagen o descripción de un autor**
3. **Guarda los cambios**
4. **¡Listo!** El cambio se aplica automáticamente en todas las agrupaciones con ese autor

### Ejemplo Práctico

```
Tienes "David Corrales González" en 15 agrupaciones diferentes.

1. Editas la agrupación "Los cobardes"
2. Añades la imagen de David: https://i.imgur.com/ABC123.jpg
3. Guardas

✅ Resultado: Las 15 agrupaciones ahora tienen la imagen de David
```

## 🔧 Implementación Técnica

### Backend (server.js)

El endpoint `PUT /api/agrupaciones/:id` ahora:

1. **Actualiza la agrupación actual**
2. **Detecta cambios en autores** (imagen o descripción)
3. **Propaga automáticamente** a otras agrupaciones con el mismo nombre de autor

```javascript
// Pseudo-código
for cada autor en la agrupación actualizada:
  si el autor tiene imagen o descripción:
    buscar todas las agrupaciones con ese autor
    actualizar imagen/descripción en todas ellas
```

### Campos que se Propagan

- ✅ `image` - URL de la imagen del autor
- ✅ `descripcion` - Descripción del autor
- ❌ `name` - No se propaga (es el identificador)
- ❌ `role` - No se propaga (puede variar por agrupación)
- ❌ `link` - No se propaga (puede variar)

## 📸 Subir Imágenes de Autores

### Opción 1: Imgur (Recomendada)

1. Ve a https://imgur.com/upload
2. Sube la foto del autor
3. Click derecho → "Copiar dirección de imagen"
4. Pega el link en el campo "Imagen URL" del autor
5. Guarda

**Ejemplo de URL:** `https://i.imgur.com/ABC123.jpg`

### Opción 2: Cloudinary

1. Crea cuenta en https://cloudinary.com (gratis)
2. Sube la imagen
3. Copia la URL
4. Pégala en el formulario

### Opción 3: GitHub

Si tienes un repositorio público:

1. Sube la imagen a `images/authors/nombre-autor.jpg`
2. Usa la URL raw: `https://raw.githubusercontent.com/usuario/repo/main/images/authors/nombre-autor.jpg`

## 🎬 Flujo Completo

### Añadir Imagen a un Autor

```
1. Click en "Editar" en cualquier agrupación que tenga ese autor
2. Busca el autor en la sección "Autores"
3. Pega la URL de la imagen en "Imagen URL"
4. Click en "Guardar"
5. ✅ La imagen se propaga automáticamente a todas las agrupaciones
```

### Verificar Propagación

```
1. Busca otra agrupación con el mismo autor
2. Click en "Editar"
3. Verás que la imagen ya está ahí
```

## ⚡ Ventajas

### ✅ Automático
- No necesitas scripts de Python
- No necesitas ejecutar comandos
- Todo desde la interfaz web

### ✅ Instantáneo
- Los cambios se aplican inmediatamente
- No hay que esperar procesos batch

### ✅ Consistente
- Todos los autores con el mismo nombre tienen la misma imagen
- No hay duplicación de datos inconsistentes

### ✅ Fácil de Usar
- Editas una vez
- Se actualiza en todas partes

## 🔍 Casos de Uso

### Caso 1: Añadir Imagen a Autor Existente

```
Autor: "Juan Carlos Aragón"
Apariciones: 12 agrupaciones
Estado actual: Sin imagen

Acción:
1. Edita cualquiera de las 12 agrupaciones
2. Añade imagen de Juan Carlos
3. Guarda

Resultado:
✅ Las 12 agrupaciones ahora tienen su imagen
```

### Caso 2: Actualizar Imagen de Autor

```
Autor: "Antonio Martínez Ares"
Apariciones: 8 agrupaciones
Estado actual: Imagen antigua

Acción:
1. Edita cualquier agrupación
2. Cambia la URL de la imagen
3. Guarda

Resultado:
✅ Las 8 agrupaciones tienen la nueva imagen
```

### Caso 3: Añadir Descripción

```
Autor: "David Corrales González"
Apariciones: 15 agrupaciones
Estado actual: Sin descripción

Acción:
1. Edita cualquier agrupación
2. Escribe descripción del autor
3. Guarda

Resultado:
✅ Las 15 agrupaciones tienen la descripción
```

## 📝 Notas Importantes

### Identificación por Nombre Exacto

La propagación funciona por **nombre exacto**:
- ✅ "David Corrales González" = "David Corrales González"
- ❌ "David Corrales" ≠ "David Corrales González"
- ❌ "david corrales gonzález" ≠ "David Corrales González" (case sensitive)

### Campos No Propagados

- **Role**: Puede variar (ej: "Autor" en una, "Director" en otra)
- **Link**: Puede ser específico de la agrupación
- **Name**: Es el identificador, no se modifica

### Rendimiento

- La propagación es rápida (milisegundos)
- No afecta la experiencia del usuario
- Se ejecuta en segundo plano después de guardar

## 🆚 Comparación con Scripts Python

| Característica | Auto-Propagación Web | Scripts Python |
|----------------|---------------------|----------------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Velocidad | Instantáneo | Manual |
| Interfaz | Visual | Terminal |
| Requiere código | No | Sí |
| Uso recomendado | Día a día | Batch masivo |

## 💡 Recomendaciones

1. **Usa Imgur** para alojar las imágenes (gratis y fácil)
2. **Edita desde la web** para cambios individuales
3. **Usa scripts Python** solo para actualizaciones masivas
4. **Verifica el nombre exacto** del autor antes de editar
5. **Usa URLs directas** de imágenes (que terminen en .jpg, .png, etc.)

---

**Implementado**: 26/11/2025
**Funcionalidad**: Auto-propagación automática desde interfaz web
