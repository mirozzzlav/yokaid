ifeq (,$(wildcard .env))
    $(error .env file does not exist.)
endif
include .env
export

command := $(word 1, $(MAKECMDGOALS))
mode := $(word 2, $(MAKECMDGOALS))

ifeq ($(filter $(command), cleanup runadminer runfe buildfe buildapi buildstore runstore),)
ifeq ($(filter $(mode),$(MAIN_SERVER) $(TEST_SERVER)),)
$(error Invalid argument mode. Please use $(MAIN_SERVER) or $(TEST_SERVER).)
endif
endif

wip := ""
server_name := $(DOMAIN)
api_host := api_$(MAIN_SERVER)
api_port := $(API_PORT)
api_docker_mode := api_$(mode)
api_port_mode := $(API_PORT)
pay_review := false
pay_contact := false

ifeq ($(mode),$(TEST_SERVER))
api_port_mode := $(API_PORT_TEST)
server_name := $(TEST_SERVER).$(DOMAIN)
endif

ifeq ($(word 3, $(MAKECMDGOALS)),wip)
wip := wip
endif

ifeq ($(word 3, $(MAKECMDGOALS)),pay_review)
pay_review := true
endif

ifeq ($(word 4, $(MAKECMDGOALS)),pay_contact)
pay_contact := true
endif


db_name := someapp_$(mode)
db_root_pass_encoded := $(shell printf '%s' $(DB_ROOT_PASS) | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g')
db_app_pass_encoded := $(shell printf '%s' $(DB_APP_PASSWORD) | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g')
db_docker_url_root := postgresql://$(DB_ROOT):$(db_root_pass_encoded)@store:5432/$(db_name)?sslmode=disable
db_docker_url := postgresql://$(DB_APP_USER):$(db_app_pass_encoded)@store:5432/$(db_name)?sslmode=disable

network_cmd = docker network ls|grep $(DOCKER_NET) > /dev/null || docker network create $(DOCKER_NET)
grantperms_cmd := docker exec store psql -U $(DB_ROOT) -d $(db_name) -c \
				"GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $(DB_APP_USER);\
				 GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $(DB_APP_USER);"

buildstore:
	docker build -t store ./store

runstore:
	$(network_cmd); \
	docker run -d --rm --name store --network $(DOCKER_NET) -p 5432:5432 \
  		   -e POSTGRES_USER=$(DB_ROOT) -e POSTGRES_PASSWORD=$(DB_ROOT_PASS) store

initdb:
	docker exec store psql --username=$(DB_ROOT) --command="DROP DATABASE IF EXISTS \"$(db_name)\";"; \
	docker exec store createdb --username=$(DB_ROOT) --owner=$(DB_ROOT) $(db_name); \
	docker exec store psql --username=$(DB_ROOT) --command="\
			DROP ROLE IF EXISTS $(DB_APP_USER); \
			CREATE USER $(DB_APP_USER) WITH PASSWORD '$(DB_APP_PASSWORD)';"; \
	docker exec store migrate -path ./migrations -database $(db_docker_url_root) -verbose up; \
  	$(grantperms_cmd)

nginxconf:
	export SERVER_NAME=$(server_name); \
	export API_HOST=$(api_docker_mode); \
	export API_PORT=$(api_port_mode); \
	envsubst < frontend/nginx_conf/nginx$(wip).conf | sed 's|$$%|$$|g' > nginx.conf; \
	docker cp nginx.conf fe:/etc/nginx/conf.d/$(server_name).conf; \
	docker exec rm /etc/nginx/conf.d/default.conf 2> /dev/null; \
	rm nginx.conf; \
	docker restart fe

buildapi:
	docker build -t api ./api \
	--build-arg LOGS_TO_SCREEN=$(LOGS_TO_SCREEN) \
	--build-arg LOGS_TO_FILE=$(LOGS_TO_FILE) \
	--build-arg ENABLE_NOTIFICATIONS=$(ENABLE_NOTIFICATIONS) \
	--build-arg APP_NAME=$(APP_NAME) \
	--build-arg MAIL_FROM=$(MAIL_FROM) \
	--build-arg MAIL_API_KEY=$(MAIL_API_KEY) \

runapi:
	$(network_cmd); \
	docker run -d --rm --name $(api_docker_mode) --network $(DOCKER_NET) -p $(api_port_mode):8080 api \
	app -api_port=$(api_port_mode) -db_url=$(db_docker_url) -pay_review=$(pay_review) -pay_contact=$(pay_contact)

buildfe:
	docker build -t fe ./frontend

runfe:
	$(network_cmd); \
	docker run -d --rm --name fe --network $(DOCKER_NET) -p 80:80 fe

runadminer:
	$(network_cmd); \
	docker run -d --rm --name adminer --network $(DOCKER_NET) -p 8088:8080 adminer

dropdb:
	docker exec store dropdb --if-exists --username=$(DB_ROOT) $(db_name)

grantprivs:
	$(grantperms_cmd);

migrateup:
	docker exec -it store migrate -path ./migrations -database $(db_docker_url_root) -verbose up; $(grantperms_cmd);\

migrateup1:
	docker exec -it store migrate -path ./migrations -database $(db_docker_url_root) -verbose up 1; $(grantperms_cmd);\

migratedown:
	docker exec -it store migrate -path ./migrations -database $(db_docker_url_root) -verbose down; $(grantperms_cmd);\

migratedown1:
	docker exec -it store migrate -path ./migrations -database $(db_docker_url_root) -verbose down 1; $(grantperms_cmd);\

cleanup:
	docker rm -f; \
	docker image prune -f; \
	docker network prune -f;\
	@echo "--- CLEANUP FINISHED ---"

