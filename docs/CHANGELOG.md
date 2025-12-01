# Registro de Cambios y Mejoras 🚀

## 1. Refactorización de Arquitectura CSS 🎨

Se ha migrado de un archivo CSS monolítico (`index.css` de +1600 líneas) a una arquitectura modular y escalable.

- **Estructura Modular**: Creación del directorio `src/styles/` con subdirectorios para `components`, `layouts`, etc.
- **Archivos Creados**:
    - `variables.css`: Variables globales de diseño.
    - `base.css`: Estilos base y reset.
    - `utilities.css`: Clases de utilidad reutilizables.
    - `animations.css`: Keyframes y animaciones.
    - `components/*.css`: Estilos específicos por componente (Navbar, Sidebar, Cards, etc.).
    - `layouts/*.css`: Estilos de estructura de página.
- **Beneficios**: Mayor mantenibilidad, facilidad de lectura y prevención de conflictos.

## 2. Mejoras en la Vista de Colección 📚

Se ha rediseñado la interfaz de la colección para mejorar la usabilidad y la presentación.

- **Sidebar de Filtros**: Implementación de una barra lateral izquierda colapsable para los filtros de búsqueda.
- **Botón Flotante**: Añadido un botón flotante para re-expandir el sidebar cómodamente.
- **Grid de Tarjetas**: Ajuste del diseño a **3 columnas** (anteriormente 4) para mejorar la legibilidad de las tarjetas.
- **Búsqueda Separada**: División del campo de búsqueda único en dos campos específicos: "Título" y "Autor".

## 3. Optimización de Rendimiento (Búsquedas) ⚡

Se han implementado mejoras críticas para acelerar la experiencia de búsqueda.

- **Frontend (Debounce)**: Implementación de un retraso de 500ms al escribir en los campos de búsqueda. Esto evita peticiones innecesarias al servidor por cada tecla pulsada.
- **Backend (Índices)**: Creación de índices en la base de datos MongoDB para los campos:
    - `name` (Nombre de la agrupación)
    - `authors.name` (Nombre del autor)
    - `category` (Modalidad)
    - `year` (Año)
    - `name + year` (Índice compuesto)
- **Script de Índices**: Creación de `server/create_indexes.js` para generar los índices inmediatamente sin reiniciar el servidor.

## 4. Optimización de Agrupación Destacada 🌟

Se ha optimizado el endpoint que carga la "Agrupación del Día" para que sea instantáneo, independientemente del tamaño de la base de datos.

- **Problema Anterior**: Se descargaban **todas** las agrupaciones de la base de datos para elegir una aleatoria. (Lento y costoso en memoria).
- **Solución Implementada**:
    1.  Se obtiene el conteo total de documentos (`countDocuments`).
    2.  Se calcula el índice aleatorio del día.
    3.  Se descarga **solo ese documento** específico usando `skip()` y `limit(1)`.
- **Resultado**: Carga inmediata (O(1)) en lugar de proporcional al número de datos (O(N)).

## 5. Paginación de Resultados 📄

Se ha implementado un sistema de paginación para evitar la carga masiva de datos.

- **Backend**: El endpoint `/api/agrupaciones` ahora acepta parámetros `page` y `limit`.
- **Frontend**:
    - Carga inicial de solo 12 elementos.
    - **Scroll Infinito** (estilo Twitter): Carga automática al llegar al final de la página.
    - Estado de carga y manejo de errores mejorado.
- **Beneficio**: Experiencia de usuario fluida y carga instantánea.

## 6. Integración de Instagram 📸

Se ha añadido una sección de "Últimas Novedades" en la página de inicio.

- **Tecnología**: Usa `swiper` para el carrusel y `react-social-media-embed` para mostrar los posts.
- **Diseño**: Carrusel **cíclico** con tarjetas de **altura uniforme** para una estética limpia.
- **Contenido**: Muestra posts destacados de cuentas relacionadas con el carnaval.

---
*Documentación generada automáticamente el 01/12/2025*
