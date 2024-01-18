ifeq (,$(wildcard .env))
    $(error .env file does not exist.)
endif
include .env
export

command := $(word 1, $(MAKECMDGOALS))
mode := $(word 2, $(MAKECMDGOALS))

ifeq ($(filter $(command), cleanup runadminer runfe buildfe buildapi buildstore buildmediastore runstore nginxconf),)
ifeq ($(filter $(mode),$(MAIN_SERVER) $(TEST_SERVER)),)
$(error Invalid argument mode. Please use $(MAIN_SERVER) or $(TEST_SERVER).)
endif
endif

ifeq ($(command), nginxconf)
nginx_conf := nginx.conf
server_name := $(DOMAIN)

ifeq ($(filter $(mode),$(MAIN_SERVER) $(TEST_SERVER) adminer wip),)
$(error Invalid argument mode. Please use $(MAIN_SERVER), $(TEST_SERVER), wip or adminer.)
endif

ifneq ($(filter $(mode), adminer wip),)
nginx_conf := nginx$(mode).conf
endif

ifneq ($(filter $(mode), $(TEST_SERVER) adminer),)
server_name := $(mode).$(DOMAIN)
endif
endif

pay_review_arg := ""
pay_contact_arg := ""

ifeq ($(mode),$(MAIN_SERVER))
api_port_mode := $(API_PORT)
api_docker_mode := api_$(mode)

media_store_port_mode := $(MEDIA_STORE_PORT)
media_store_docker_mode := media_store_$(mode)
endif

ifeq ($(mode),$(TEST_SERVER))
api_port_mode := $(API_PORT_TEST)
api_docker_mode := api_$(mode)

media_store_port_mode := $(MEDIA_STORE_PORT_TEST)
media_store_docker_mode := media_store_$(mode)
endif

ifeq ($(pay_review), sms)
pay_review_arg := "sms"
endif
ifeq ($(pay_review), verify)
pay_review_arg := "verify"
endif

ifeq ($(pay_contact), sms)
pay_contact_arg := "sms"
endif


db_name := $(APP_NAME)_$(mode)
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
	export DOMAIN=$(DOMAIN); \
	export SERVER_NAME=$(server_name); \
	export API_HOST=$(api_docker_mode); \
	export API_PORT=$(api_port_mode); \
	export MEDIA_STORE_HOST=$(media_store_docker_mode); \
	export MEDIA_STORE_PORT=$(media_store_port_mode); \
	envsubst < frontend/nginx_conf/$(nginx_conf) | sed 's|$$%|$$|g' > nginx.conf; \
	docker cp nginx.conf fe:/etc/nginx/conf.d/$(server_name).conf; \
	docker exec fe rm -f /etc/nginx/conf.d/default.conf; \
	rm nginx.conf; \
	docker restart fe

buildapi:
	docker build -t api ./api \
	--build-arg LOGS_TO_SCREEN=$(LOGS_TO_SCREEN) \
	--build-arg LOGS_TO_FILE=$(LOGS_TO_FILE) \
	--build-arg SUPPORT_MAIL=$(SUPPORT_MAIL) \
	--build-arg APP_NAME=$(APP_NAME) \
	--build-arg MAIL_FROM=$(MAIL_FROM) \
	--build-arg SEND_SMS_URL=$(SEND_SMS_URL) \
	--build-arg SEND_SMS_AUTH=$(SEND_SMS_AUTH) \
	--build-arg SEND_MAIL_URL=$(SEND_MAIL_URL) \
	--build-arg SEND_MAIL_AUTH=$(SEND_MAIL_AUTH) \

runapi:
	$(network_cmd); \
	docker run -d --rm --name $(api_docker_mode) --network $(DOCKER_NET) -p $(api_port_mode):8080 api \
	app -api_port=$(api_port_mode) -db_url=$(db_docker_url) \
	-media_store_host=$(media_store_docker_mode) -media_store_port=$(media_store_port_mode) \
	-pay_contact=$(pay_contact_arg) -pay_review=$(pay_review_arg)


buildmediastore:
	docker build -t media_store ./media_store

runmediastore:
	$(network_cmd); \
	docker run -d --rm --name $(media_store_docker_mode) --network $(DOCKER_NET) -p $(media_store_port_mode):9090 media_store \
	store -port=$(media_store_port_mode)

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

