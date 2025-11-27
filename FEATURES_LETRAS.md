# 🏷️ Campo Features en Letras

Se ha añadido un nuevo campo `features` a cada letra para almacenar palabras clave o características principales.

## Descripción

- **Campo**: `features`
- **Tipo**: Array de strings
- **Ubicación**: Dentro de cada objeto en el array `lyrics`
- **Propósito**: Almacenar palabras clave que describen la temática o características de la letra

## Estructura JSON

```json
{
  "lyrics": [
    {
      "title": "Traigo este año",
      "type": "Pasodoble",
      "content": "Letra completa...",
      "url": "https://...",
      "views": "11",
      "features": [
        "amor",
        "carnaval",
        "guitarra",
        "mar",
        "emoción"
      ],
      "last_modification": "10/07/2025 12:10:09"
    }
  ]
}
```

## Uso en la Interfaz Web

### Añadir Features a una Letra

1. Abre el formulario de crear/editar agrupación
2. Ve a la sección "🎵 Letras"
3. Dentro de cada letra, encontrarás la subsección "🏷️ Features/Palabras Clave"
4. Click en "➕ Añadir Feature"
5. Escribe la palabra clave
6. Repite para añadir más features

### Gestión de Features

- **Añadir**: Botón "➕ Añadir Feature"
- **Editar**: Escribe directamente en el campo de texto
- **Eliminar**: Botón "×" junto a cada feature

### Características

- Campos de texto compactos (120px de ancho)
- Diseño en línea con wrap automático
- Placeholders numerados ("Palabra 1", "Palabra 2", etc.)
- Botones de eliminar individuales

## Compatibilidad

✅ **Retrocompatible**: Las letras existentes sin el campo `features` funcionarán correctamente.

El formulario maneja automáticamente:
- Letras sin `features`: Se inicializa como array vacío `[]`
- Letras con `features`: Se muestran y pueden editarse

## Casos de Uso

### Ejemplo 1: Pasodoble sobre el mar
```json
"features": ["mar", "olas", "playa", "verano", "nostalgia"]
```

### Ejemplo 2: Cuplé político
```json
"features": ["política", "sátira", "actualidad", "crítica", "humor"]
```

### Ejemplo 3: Popurrí variado
```json
"features": ["variado", "mezcla", "ritmos", "alegría", "fiesta"]
```

## Beneficios

1. **Búsqueda**: Facilita encontrar letras por temática
2. **Clasificación**: Agrupa letras similares
3. **Análisis**: Permite estudiar tendencias temáticas
4. **Recomendaciones**: Base para sistemas de recomendación

## Migración de Datos Existentes

Las letras existentes **no requieren migración**. El campo `features` es opcional y se inicializa como array vacío cuando se edita una letra antigua.

Si deseas añadir features a letras existentes:
1. Edita la agrupación desde la interfaz web
2. Abre cada letra
3. Añade las features correspondientes
4. Guarda los cambios

## Límite Recomendado

Aunque no hay límite técnico, se recomienda usar **3-5 features** por letra para mantener la relevancia y evitar ruido en búsquedas.

---

**Implementado**: 26/11/2025
