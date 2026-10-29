# Sistema de Mesa de Ayuda - Help Desk ITIL v4

Sistema profesional de gestión de tickets conforme a ITIL v4 e ISO 20000.

## Características

- ✅ Matriz de prioridad automática según ITIL
- ✅ Clasificación técnica de incidentes y requerimientos
- ✅ Gestión de ciclo de vida de tickets
- ✅ Backend con Node.js/Express y SQLite
- ✅ Persistencia de datos en la nube
- ✅ Interfaz responsiva con Tailwind CSS
- ✅ Exportación de tickets en JSON
- ✅ KPIs en tiempo real

## Instalación Local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor:
```bash
npm start
```

3. Abrir en el navegador:
```
http://localhost:3000
```

## Despliegue en Render

El proyecto está configurado para despliegue gratuito en Render.com.

1. Subir el código a un repositorio de GitHub
2. Conectar el repositorio a Render
3. Render detectará automáticamente el archivo `render.yaml`
4. El servicio se desplegará con un plan gratuito

## API Endpoints

- `GET /api/tickets` - Obtener todos los tickets
- `GET /api/tickets/:id` - Obtener un ticket específico
- `POST /api/tickets` - Crear un nuevo ticket
- `PUT /api/tickets/:id` - Actualizar estado de un ticket
- `DELETE /api/tickets/:id` - Eliminar un ticket
- `GET /api/contadores` - Obtener contadores de IDs

## Estructura del Proyecto

```
├── index.html          # Frontend (HTML + CSS + JS)
├── server.js           # Backend Node.js/Express
├── package.json        # Dependencias del proyecto
├── render.yaml         # Configuración de despliegue en Render
├── .gitignore          # Archivos ignorados por Git
└── README.md           # Documentación
```

## Tecnologías

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Base de Datos**: SQLite
- **Hosting**: Render (gratuito)

## Licencia

MIT
