# Only for development

# Variables
DC=docker compose -f docker-compose.dev.yml
API_CONT=mi-cuerpo_api_dev
APP_CONT=mi-cuerpo_app_dev

.PHONY: up down restart up-one restart-one install npm-install-api npm-install-app prisma-new prisma-sync clean

# --- Gestión de Infraestructura ---
up:
	$(DC) up -d
	@$(MAKE) prisma-sync

down:
	$(DC) down

build:
	$(DC) up -d --build

build-api:
	$(DC) build api

build-app:
	$(DC) build app

restart:
	$(DC) restart

# Levantar un solo servicio (ej: make up-one SVC=redis)
up-one:
	$(DC) up -d $(SVC)

# Reiniciar un solo servicio (ej: make restart-one SVC=app)
restart-one:
	$(DC) restart $(SVC)

# --- Dependencias (Host + Container) ---
install:
	@echo "Instalando dependencias en API..."
	cd api && npm install
	docker exec -it $(API_CONT) npm install
	@echo "Instalando dependencias en APP..."
	cd app && npm install
	docker exec -it $(APP_CONT) npm install

# Añadir paquetes (ej: make npm-install-api PKG=lodash)
npm-install-api:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-install-api PKG=lodash"; exit 1; fi
	cd api && npm install $(PKG)
	docker exec -it $(API_CONT) npm install $(PKG)
	@echo "✅ Paquete instalado. Si el hot-reload no lo detecta, ejecuta: make restart-one SVC=api"

npm-install-app:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-install-app PKG=lodash"; exit 1; fi
	cd app && npm install $(PKG)
	docker exec -it $(APP_CONT) npm install $(PKG)
	@echo "✅ Paquete instalado. Si el hot-reload no lo detecta, ejecuta: make restart-one SVC=app"

npm-install-dev-api:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-install-dev-api PKG=lodash"; exit 1; fi
	cd api && npm install $(PKG) --save-dev
	docker exec -it $(API_CONT) npm install $(PKG) --save-dev
	@echo "✅ Paquete instalado. Si el hot-reload no lo detecta, ejecuta: make restart-one SVC=api"

npm-install-dev-app:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-install-dev-app PKG=lodash"; exit 1; fi
	cd app && npm install $(PKG) --save-dev
	docker exec -it $(APP_CONT) npm install $(PKG) --save-dev
	@echo "✅ Paquete instalado. Si el hot-reload no lo detecta, ejecuta: make restart-one SVC=app"

npm-uninstall-api:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-uninstall-api PKG=lodash"; exit 1; fi
	cd api && npm uninstall $(PKG)
	docker exec -it $(API_CONT) npm uninstall $(PKG)

npm-uninstall-app:
	@if [ -z "$(PKG)" ]; then echo "Error: Debes especificar un paquete. Ej: make npm-uninstall-app PKG=lodash"; exit 1; fi
	cd app && npm uninstall $(PKG)
	docker exec -it $(APP_CONT) npm uninstall $(PKG)

# --- Prisma --- (ej: make prisma-new name=new-migration)
prisma-new:
	@if [ -z "$(name)" ]; then echo "Error: Debes especificar un nombre. Ej: make prisma-new name=new-migration"; exit 1; fi
	docker exec -it $(API_CONT) npx prisma migrate dev --create-only --name $(name)

prisma-sync:
	docker exec -it $(API_CONT) npx prisma migrate dev
	docker exec -it $(API_CONT) npx prisma generate

prisma-reset:
	docker exec -it $(API_CONT) npx prisma migrate reset

# --- Tests ---
test-api:
	docker exec -it $(API_CONT) npm test

test-app:
	docker exec -it $(APP_CONT) npm test

# --- Utilidades ---
logs-api:
	docker logs -f $(API_CONT)

logs-app:
	docker logs -f $(APP_CONT)

clean:
	docker system prune -f
	docker volume prune -f

sh-api:
	docker exec -it $(API_CONT) sh

sh-app:
	docker exec -it $(APP_CONT) sh

.DEFAULT_GOAL := help

help:
	@echo "========================================================================"
	@echo "             Mi Cuerpo - Entorno de Desarrollo (Docker + Node)"
	@echo "========================================================================"
	@echo "Uso: make [comando] [argumentos]"
	@echo ""
	@echo "Gestión de Infraestructura:"
	@echo "  up                  Levanta todos los contenedores (-d)"
	@echo "  down                Detiene y elimina los contenedores"
	@echo "  build               Construye todos los contenedores (-d)"
	@echo "  build-api           Construye el contenedor de la API (-d)"
	@echo "  build-app           Construye el contenedor de la APP (-d)"
	@echo "  restart             Reinicia todos los servicios"
	@echo "  up-one SVC=name     Levanta un servicio específico (ej: make up-one SVC=db)"
	@echo "  restart-one SVC=n   Reinicia un servicio específico"
	@echo ""
	@echo "Dependencias (Host + Container):"
	@echo "  install             Instala TODO (api y app) en local y contenedor"
	@echo "  npm-install-api PKG=x     Instala un paquete en la API"
	@echo "  npm-install-app PKG=x     Instala un paquete en la APP"
	@echo "  npm-install-dev-api PKG=x Instala un paquete de desarrollo en la API"
	@echo "  npm-install-dev-app PKG=x Instala un paquete de desarrollo en la APP"
	@echo ""
	@echo "Base de Datos y Prisma:"
	@echo "  prisma-new name=x   Crea una nueva migración con un nombre"
	@echo "  prisma-sync         Sincroniza migraciones y regenera el cliente local/docker"
	@echo "  prisma-reset        Reinicia la base de datos"
	@echo ""
	@echo "Tests:"
	@echo "  test-api            Ejecuta los tests de la API"
	@echo "  test-app            Ejecuta los tests de la APP"
	@echo ""
	@echo "Utilidades:"
	@echo "  logs-api            Muestra los logs de la API"
	@echo "  logs-app            Muestra los logs de la APP"
	@echo "  sh-api              Entra a la terminal del contenedor de la API"
	@echo "  sh-app              Entra a la terminal del contenedor de la APP"
	@echo "  clean               Limpia imágenes y volúmenes de Docker no utilizados"
	@echo "========================================================================"
