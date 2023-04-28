# Load the environment variables from the .env file
include ./api/.env
include ./frontend/.env
export

DOCKER_NET = $(APP_NAME)_network
POSTGRES = $(shell docker ps -aq --filter name=postgres)
ADMINER = $(shell docker ps -aq --filter name=adminer)

postgres:
	docker network ls|grep $(DOCKER_NET) > /dev/null || docker network create $(DOCKER_NET); docker run --name postgres --network $(DOCKER_NET) -p 5432:5432 -e POSTGRES_USER=$(POSTGRES_USER) -e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) -d postgres

adminer:
	docker run --name adminer --network $(DOCKER_NET) -p 8000:8080 -d adminer

createdb:
	docker exec -it postgres createdb --username=$(POSTGRES_USER) --owner=$(POSTGRES_USER) $(APP_NAME)

dropdb:
	docker exec -it postgres dropdb --if-exists --username=$(POSTGRES_USER) $(APP_NAME)

migrateup:
	migrate -path api/db/migrations -database "$(DB_URL)" -verbose up

migrateup1:
	migrate -path api/db/migrations -database "$(DB_URL)" -verbose up 1

migratedown:
	migrate -path api/db/migrations -database "$(DB_URL)" -verbose down

migratedown1:
	migrate -path api/db/migrations -database "$(DB_URL)" -verbose down 1

newmigration:
	migrate create -dir api/db/migrations -ext sql -seq -digits 8 $(name)
	

cleanup:
	@if [ "$(POSTGRES)" ]; then make dropdb; docker rm -f $(POSTGRES); fi;
	@if [ "$(ADMINER)" ]; then docker rm -f $(ADMINER); fi;
	@echo "--- CLEANUP FINISHED ---"

sqlc:
	cd ./api/db && sqlc generate

server:
	go run main.go config.go