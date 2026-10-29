# Instrucciones de Despliegue en Render (Gratuito)

El proyecto está completamente configurado y listo para desplegar. Sigue estos pasos para obtener una URL pública:

## Paso 1: Crear Repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Inicia sesión con tu cuenta de GitHub (crea una si no tienes)
3. Completa los campos:
   - **Repository name**: `helpdesk-itil` (o el nombre que prefieras)
   - **Description**: Sistema de Mesa de Ayuda ITIL v4
   - Marca **Public** (para despliegue gratuito en Render)
   - **Initialize this repository with a README**: NO marcar esta opción
4. Haz clic en **Create repository**

## Paso 2: Subir el Código a GitHub

Abre una terminal o PowerShell en la carpeta del proyecto y ejecuta:

```bash
cd "C:\Users\Aprendiz\OneDrive - Servicio Nacional de Aprendizaje\Escritorio\TICKET MESA DE AYUDA"

# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/helpdesk-itil.git

# Renombrar la rama a main (requerido por GitHub)
git branch -M main

# Subir el código
git push -u origin main
```

Si te pide credenciales, usa tu token de acceso personal de GitHub (no tu contraseña).

## Paso 3: Desplegar en Render

1. Ve a [https://render.com](https://render.com)
2. Crea una cuenta gratuita (usa tu cuenta de GitHub para autenticarte)
3. Haz clic en **New +** → **Web Service**
4. Conecta tu cuenta de GitHub a Render (permite el acceso)
5. Selecciona el repositorio `helpdesk-itil` que acabas de crear
6. Render detectará automáticamente el archivo `render.yaml`
7. Configura:
   - **Name**: helpdesk-itil
   - **Region**: selecciona la más cercana a ti
   - **Branch**: main
8. Haz clic en **Create Web Service**

## Paso 4: Esperar el Despliegue

- Render compilará e instalará las dependencias automáticamente
- El proceso tarda entre 2-5 minutos
- Verás el progreso en tiempo real
- Cuando termine, aparecerá un punto verde ✅

## Paso 5: Obtener la URL Pública

Una vez completado el despliegue:
1. En el dashboard de Render, haz clic en tu servicio
2. Copia la URL que aparece en la sección **Web Service**
3. La URL tendrá el formato: `https://helpdesk-itil.onrender.com`

## Paso 6: Compartir la URL

¡Listo! Comparte la URL con tus compañeros:
- Cualquier persona que abra la URL verá la aplicación
- Los tickets creados por cualquiera se guardarán en la base de datos en la nube
- Los cambios se reflejarán en tiempo real (cada 30 segundos)

## Características del Despliegue

✅ **Completamente Gratuito**: Render ofrece hosting gratuito para servicios web
✅ **Persistencia de Datos**: La base de datos SQLite se guarda en disco persistente
✅ **HTTPS Automático**: Render proporciona certificado SSL gratuito
✅ **Actualizaciones Automáticas**: Cada vez que hagas push a GitHub, Render re-despliega

## Solución de Problemas

### Si el despliegue falla:
- Verifica que el repositorio en GitHub sea público
- Asegúrate de que el archivo `render.yaml` esté en la raíz del repositorio
- Revisa los logs en el dashboard de Render

### Si la base de datos no persiste:
- El archivo `render.yaml` ya configura un disco persistente de 1GB
- Render guarda la base de datos en `/data/helpdesk.db`

### Si necesitas reiniciar el servicio:
- Ve al dashboard de Render
- Haz clic en tu servicio
- Selecciona **Manual Deploy** → **Clear build cache & deploy**

## Archivos del Proyecto

```
├── index.html          # Frontend completo
├── server.js           # Backend con Express y SQLite
├── package.json        # Dependencias
├── render.yaml         # Configuración de despliegue
├── .gitignore          # Archivos ignorados
└── README.md           # Documentación
```

## Soporte

Si encuentras algún problema:
1. Revisa los logs en el dashboard de Render
2. Verifica que el servicio esté activo (punto verde)
3. Asegúrate de estar usando la URL correcta (con https://)
