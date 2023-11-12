include ./.env

$(eval exit_status := $(shell apt list > /dev/null 2>&1; echo $$?))

grantperms_cmd := docker exec postgres psql -U $(POSTGRES_ROOT) -d $(APP_NAME) -c \
				"GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $(POSTGRES_APP_USER);\
				 GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $(POSTGRES_APP_USER);"

export

POSTGRES = $(shell docker ps -aq --filter name=postgres)
ADMINER = $(shell docker ps -aq --filter name=adminer)
API = $(shell docker ps -aq --filter name=api)

postgres:
	docker network ls|grep $(DOCKER_NET) > /dev/null || docker network create $(DOCKER_NET); \
	docker run -d --rm --name postgres --network $(DOCKER_NET) -p 5432:5432 \
  		   -e POSTGRES_USER=$(POSTGRES_ROOT) -e POSTGRES_PASSWORD=$(POSTGRES_ROOT_PASS) postgres

createdb:
	docker exec postgres createdb --username=$(POSTGRES_ROOT) --owner=$(POSTGRES_ROOT) $(APP_NAME); \
  	docker exec postgres psql --username=$(POSTGRES_ROOT) --command="\
  		 CREATE USER $(POSTGRES_APP_USER) WITH PASSWORD '$(POSTGRES_APP_PASSWORD)';"

buildapi:
	docker build -t api ./api

runapi:
	docker run -d --rm --name api --network $(DOCKER_NET) -p 8080:8080 --env-file .env api

buildfe:
	docker build -t fe --build-arg API_URL=$(API_URL) --build-arg API_DOCKER_URL=$(API_DOCKER_URL) ./frontend

runfe:
	docker run -d --rm --name fe --network $(DOCKER_NET) -p 80:80 fe

adminer:
	docker run -d --rm --name adminer --network $(DOCKER_NET) -p 8088:8080 adminer

dropdb:
	docker exec postgres dropdb --if-exists --username=$(POSTGRES_ROOT) $(APP_NAME)

grantprivs:
	$(grantperms_cmd);

migrateup:
	@if [ "$(API)" ];then \
  		docker exec -it api migrate -path db/migrations -database "$(DB_URL_ROOT)" -verbose up; $(grantperms_cmd);\
  	fi

migrateup1:
	@if [ "$(API)" ];then \
  		docker exec -it api migrate -path db/migrations -database "$(DB_URL_ROOT)" -verbose up 1; $(grantperms_cmd);\
  	fi

migratedown:
	@if [ "$(API)" ];then \
  		docker exec -it api migrate -path db/migrations -database "$(DB_URL_ROOT)" -verbose down;\
  	fi

migratedown1:
	@if [ "$(API)" ];then \
  		docker exec -it api migrate -path db/migrations -database "$(DB_URL_ROOT)" -verbose down 1;\
  	fi

newmigration:
	@if [ "$(API)" ];then \
  		docker exec migrate create -dir db/migrations -ext sql -seq -digits 8 $(name);\
  	fi

cleanup:
	@if [ "$(POSTGRES)" ]; then make dropdb; docker rm -f $(POSTGRES); fi;
	@if [ "$(ADMINER)" ]; then docker rm -f $(ADMINER); fi;
	@echo "--- CLEANUP FINISHED ---"