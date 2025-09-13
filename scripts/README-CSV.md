# Carga de Productos desde CSV

## Encabezados Requeridos

Tu archivo CSV debe tener exactamente estos encabezados en el primer renglón:

```csv
name,description,category,quality,ambientacion,basePrice,minMargin,maxMargin,status
```

## Descripción de Campos

| Campo | Descripción | Valores Permitidos | Ejemplo |
|-------|-------------|-------------------|---------|
| `name` | Nombre del producto | Texto libre | "Sillas Chiavari Doradas" |
| `description` | Descripción detallada | Texto libre | "Elegantes sillas chiavari en acabado dorado" |
| `category` | Categoría del producto | Ver categorías válidas* | "Mobiliario" |
| `quality` | Nivel de calidad | Plata, Oro, Platino | "Oro" |
| `ambientacion` | Tipo de evento | Conferencia, Club, Ceremonia, Gala | "Gala" |
| `basePrice` | Precio base | Número decimal | "25.00" |
| `minMargin` | Margen mínimo % | Número entero | "20" |
| `maxMargin` | Margen máximo % | Número entero | "50" |
| `status` | Estado del producto | active, inactive | "active" |

### Categorías Válidas:
- Mobiliario
- Menu
- Decoración
- Branding
- Audio y Video
- Espectáculos
- Fotografia
- Memorabilia

## Cómo Usar

### 1. Preparar tu CSV
Usa el archivo `products-template.csv` como base y agrega tus productos.

### 2. Cargar desde línea de comandos
```bash
cd scripts
node csv-loader.js tu-archivo.csv
```

### 3. Cargar desde panel de admin
Sube tu CSV y usa la función de carga desde la interfaz web (próximamente).

## Ejemplo de CSV

```csv
name,description,category,quality,ambientacion,basePrice,minMargin,maxMargin,status
Sillas Chiavari Doradas,Elegantes sillas chiavari en acabado dorado,Mobiliario,Oro,Gala,25.00,20,50,active
Canapés Gourmet,Selección de 12 canapés gourmet,Menu,Oro,Gala,45.00,40,70,active
Centro de Mesa Floral,Arreglo floral premium para centro de mesa,Decoración,Platino,Gala,120.00,30,60,active
```

## Notas Importantes

- Los precios deben usar punto decimal (no coma)
- No uses comillas en las descripciones si contienen comas
- El archivo debe guardarse en formato UTF-8
- Máximo recomendado: 100 productos por archivo