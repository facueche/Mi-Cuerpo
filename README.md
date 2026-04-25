# 🚀 Mi Cuerpo - Guía de Configuración

Este proyecto utiliza un stack moderno con **Vite (Frontend)**, **Express (Backend)**, **PostgreSQL (DB)** y **Redis (Cache)**, todo orquestado con Docker.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Docker** y **Docker Compose**
- **Node.js v20** (para el soporte del IDE/Linting local)
- **Make** (disponible por defecto en Linux/Mac; en Windows usa _Git Bash_ o _WSL_)

---

## 🛠️ Paso 1: Variables de Entorno

El sistema depende de archivos `.env` para configurar puertos y credenciales. Debes crear los siguientes archivos basados en esta estructura:

### 1. Raíz del proyecto (`./.env`)

Configura los puertos y credenciales globales:

```env
DB_DATABASE=mi-cuerpo
DB_USERNAME=mi-cuerpo
DB_PASSWORD=secret
DB_PORT=5432

REDIS_PORT=6379

API_PORT=3000
APP_PORT=3001
```

### 2. Backend (`./api/.env`)

Configura la conexión de Prisma y secretos de la API:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://mi-cuerpo:secret@db:5432/mi-cuerpo?schema=public"
# Agrega aquí tus secretos de JWT, API Keys, etc.
```

### 3. Frontend (`./app/.env`)

```env
VITE_PORT=3001
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Paso 2: Puesta en Marcha (Desarrollo)

Sigue este orden exacto para inicializar el proyecto por primera vez:

1.  **Levantar Contenedores:**

    ```bash
    make up
    ```

    _Esto descargará las imágenes y encenderá la DB y Redis._

2.  **Instalación Inicial:**

    ```bash
    make install
    ```

    _Este comando instala las dependencias en tu PC (para el IDE) y dentro de los contenedores, y genera el cliente de Prisma._

3.  **Sincronizar Base de Datos:**
    ```bash
    make prisma-sync
    ```
    _Ejecuta las migraciones pendientes y crea las tablas en Postgres._

---

## 📖 Referencia del Makefile (Desarrollo)

Usa `make [comando]` para gestionar el día a día:

### Gestión de Infraestructura

- `up`: Levanta todo el stack.
- `down`: Apaga todo y libera recursos.
- `build`: Construye las imágenes.
- `restart`: Reinicia todos los servicios.
- `up-one SVC=nombre`: Levanta solo un servicio (ej: `SVC=db`).

### Manejo de Dependencias (Sincronizado Host/Container)

- `npm-install-api PKG="nombre"`: Instala paquetes normales en el Backend.
- `npm-install-dev-api PKG="nombre"`: Instala paquetes de desarrollo (`-D`) en el Backend.
- `npm-install-app PKG="nombre"`: Instala paquetes en el Frontend.
- `npm-install-app-dev PKG="nombre"`: Instala paquetes de desarrollo (`-D`) en el Frontend.
- _Nota: Para múltiples paquetes usa comillas: `PKG="pkg1 pkg2"`._

### Base de Datos y Prisma

- `prisma-new name="descripcion"`: Crea una nueva migración tras cambiar el `schema.prisma`.
- `prisma-sync`: Fuerza la actualización del cliente y las tablas.

---

## 🚢 Paso 3: Producción (Single Server)

Para desplegar en el servidor de producción:

1.  Asegúrate de tener el archivo `docker-compose.prod.yml` listo.
2.  Usa el Makefile de producción:
    ```bash
    make -f deploy/Makefile.prod up
    ```
    _Este comando buildea las imágenes optimizadas, levanta el sistema y aplica las migraciones de Prisma de forma atómica._

---

## 🔍 Solución de Problemas Comunes

**1. El IDE marca errores de "módulo no encontrado"**
Ejecuta `make install`. Esto sincroniza los `node_modules` de tu carpeta local con los del contenedor.

**2. Error: "Container is not running" al instalar paquetes**
Asegúrate de que el contenedor esté encendido con `make up`. Si sigue fallando, revisa los logs: `docker compose -f docker-compose.dev.yml logs api`.

**3. Cambié el `schema.prisma` y no veo los cambios en el código**
Ejecuta `make prisma-sync`. Esto regenera el tipado de TypeScript tanto dentro como fuera de Docker.

**4. Error de permisos en Linux**
Si tienes problemas de escritura en las carpetas, ejecuta:
`sudo chown -R $USER:$USER .`

---

## 📁 Estructura del Proyecto

```text
.
├── api/                # Backend Express + Prisma
├── app/                # Frontend Vite + React/Vue
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Makefile
├── deploy/Makefile.prod
└── .env                # Variables globales
```

---

_Este proyecto fue configurado para maximizar la productividad manteniendo la consistencia entre entornos._
