# For production

# Variables
DC=docker compose -f docker-compose.prod.yml
API_CONT=mi-cuerpo_api
APP_CONT=mi-cuerpo_app
DB_CONT=mi-cuerpo_db
BACKUP_DIR=./api/backups

.PHONY: up down restart up-one restart-one prisma-deploy logs clean-images

# --- Gestión de Infraestructura ---

# Levanta todo, buildea cambios y corre migraciones
up:
	@$(MAKE) -f ./deploy/Makefile db-backup
	$(DC) up -d --build
	@echo "Esperando a que el contenedor de la API esté completamente listo..."
	@until [ "$$(docker inspect -f '{{.State.Running}}' mi-cuerpo_api 2>/dev/null)" = "true" ]; do sleep 1; done
	@$(MAKE) -f ./deploy/Makefile prisma-deploy

down:
	$(DC) down

restart:
	$(DC) restart

# Levantar uno solo y migrar si es la API
up-one:
	$(DC) up -d --build $(SVC)
	@if [ "$(SVC)" = "api" ]; then $(MAKE) -f ./deploy/Makefile prisma-deploy; fi

restart-one:
	$(DC) restart $(SVC)
	@if [ "$(SVC)" = "api" ]; then $(MAKE) -f ./deploy/Makefile prisma-deploy; fi

# --- Prisma ---

# Aplica migraciones pendientes sin resetear la base de datos
prisma-deploy:
	@echo "Aplicando migraciones de producción..."
	docker exec -it $(API_CONT) npx prisma db push --accept-data-loss

# --- Backups (pg_dump) ---

# Genera un respaldo .sql cronológico en la carpeta local de la API
db-backup:
	@echo "Generando backup preventivo de la base de datos..."
	@mkdir -p $(BACKUP_DIR)
	@if [ "$$(docker ps -q -f name=$(DB_CONT))" ]; then \
		docker exec -i $(DB_CONT) pg_dumpall -c -U $$(grep DB_USERNAME ./api/.env | cut -d '=' -f2) > $(BACKUP_DIR)/backup_$$(date +%Y%m%d_%H%M%S).sql; \
		echo "Backup guardado en $(BACKUP_DIR)/"; \
	else \
		echo "El contenedor de la base de datos no está corriendo. Se saltea el backup."; \
	fi

# --- Monitoreo y Limpieza ---

# Ver logs en tiempo real de todo el stack
logs:
	$(DC) logs -f

# Limpiar imágenes antiguas (útil tras varios builds en el servidor)
clean-images:
	docker image prune -af
