# Agenda Diaria

Aplicación sencilla de agenda diaria con backend en NodeJS y frontend en JavaScript plano.

## Estructura

```
Proyecto 1/
├── BACKEND/
│   ├── package.json
│   └── server.js
└── FRONTEND/
    ├── index.html
    └── app.js
```

## Instalación y Ejecución

### Backend

1. Navegar a la carpeta BACKEND:
   ```bash
   cd BACKEND
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```

El backend correrá en `http://localhost:3000`

### Frontend

1. Abrir el archivo `FRONTEND/index.html` en un navegador web

## Funcionalidades

- **Crear eventos**: Título, descripción, fecha y hora
- **Ver eventos**: Lista ordenada por fecha y hora
- **Eliminar eventos**: Confirmación antes de eliminar

## API Endpoints

- `GET /api/eventos` - Obtener todos los eventos
- `GET /api/eventos/:id` - Obtener evento por ID
- `POST /api/eventos` - Crear nuevo evento
- `PUT /api/eventos/:id` - Actualizar evento
- `DELETE /api/eventos/:id` - Eliminar evento

## Notas

- No utiliza base de datos (almacenamiento en memoria)
- Los datos se pierden al reiniciar el servidor
- Código simple y minimalista para propósitos de aprendizaje
