ifeq (,$(wildcard .env))
    $(error .env file does not exist.)
endif
include .env
export

command := $(word 1, $(MAKECMDGOALS))
instance_id_arg := $(word 2, $(MAKECMDGOALS))
instance_id := $(if $(instance_id_arg),$(instance_id_arg),$(INSTANCE_ID))

$(instance_id):
	@:

ifneq ($(instance_id),$(INSTANCE_ID))
ifeq ($(command),runapi)
ifeq ($(api_port),)
$(error Missing api_port for $(instance_id). Example: make runapi $(instance_id) api_port=8090 media_store_port=9190)
endif
ifeq ($(media_store_port),)
$(error Missing media_store_port for $(instance_id). Example: make runapi $(instance_id) api_port=8090 media_store_port=9190)
endif
endif
ifeq ($(command),runmediastore)
ifeq ($(media_store_port),)
$(error Missing media_store_port for $(instance_id). Example: make runmediastore $(instance_id) media_store_port=9190)
endif
endif
ifeq ($(command),runweb)
ifeq ($(web_port),)
$(error Missing web_port for $(instance_id). Example: make runweb $(instance_id) web_port=8081 api_port=8090 media_store_port=9190)
endif
ifeq ($(api_port),)
$(error Missing api_port for $(instance_id). Example: make runweb $(instance_id) web_port=8081 api_port=8090 media_store_port=9190)
endif
ifeq ($(media_store_port),)
$(error Missing media_store_port for $(instance_id). Example: make runweb $(instance_id) web_port=8081 api_port=8090 media_store_port=9190)
endif
endif
endif

ifeq ($(command), nginxconf)
nginx_conf := nginx.conf
server_name := $(DOMAIN)

ifneq ($(filter $(instance_id), adminer wip),)
nginx_conf := nginx$(instance_id).conf
endif

ifeq ($(filter $(instance_id), $(INSTANCE_ID) wip),)
server_name := $(instance_id).$(DOMAIN)
endif
endif

pay_review_arg := ""
pay_contact_arg := ""

ifeq ($(instance_id),$(INSTANCE_ID))
default_web_port := $(WEB_PORT)
default_api_port := $(API_PORT)
default_media_store_port := $(MEDIA_STORE_PORT)
default_store_port := $(STORE_PORT)
endif

default_web_port ?= $(WEB_PORT)
default_api_port ?= $(API_PORT)
default_media_store_port ?= $(MEDIA_STORE_PORT)
default_store_port ?= $(STORE_PORT)

web_port_instance := $(if $(web_port),$(web_port),$(default_web_port))
api_port_instance := $(if $(api_port),$(api_port),$(default_api_port))
media_store_port_instance := $(if $(media_store_port),$(media_store_port),$(default_media_store_port))
store_port_instance := $(if $(store_port),$(store_port),$(default_store_port))
store_port_arg := $(if $(store_port_instance),-p $(store_port_instance):5432,)

api_docker_instance := api_$(instance_id)
media_store_docker_instance := media_store_$(instance_id)
store_docker_instance := store_$(instance_id)
server_name_instance := $(DOMAIN)
ifneq ($(instance_id),$(INSTANCE_ID))
server_name_instance := $(instance_id).$(DOMAIN)
endif
web_docker_instance := web_$(instance_id)
ifneq ($(filter $(instance_id), adminer wip),)
web_docker_instance := web_$(INSTANCE_ID)
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


db_name := $(APP_NAME)
db_root_pass_plain := $(subst ",,$(DB_ROOT_PASS))
db_app_pass_plain := $(subst ",,$(DB_APP_PASSWORD))
empty :=
space := $(empty) $(empty)
url_encode = $(subst $(space),%20,$(subst ",%22,$(subst >,%3E,$(subst <,%3C,$(subst @,%40,$(subst :,%3A,$(subst /,%2F,$(subst ?,%3F,$(subst &,%26,$(subst =,%3D,$(subst +,%2B,$(subst %,%25,$(1)))))))))))))
db_root_pass_encoded := $(call url_encode,$(db_root_pass_plain))
db_app_pass_encoded := $(call url_encode,$(db_app_pass_plain))
db_docker_url_root := postgresql://$(DB_ROOT):$(db_root_pass_encoded)@$(store_docker_instance):5432/$(db_name)?sslmode=disable
db_docker_url := postgresql://$(DB_APP_USER):$(db_app_pass_encoded)@$(store_docker_instance):5432/$(db_name)?sslmode=disable

network_cmd = docker network ls|grep $(DOCKER_NET) > /dev/null || docker network create $(DOCKER_NET)
grantperms_cmd := docker exec $(store_docker_instance) psql -U $(DB_ROOT) -d $(db_name) -c \
				"GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $(DB_APP_USER);\
				 GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $(DB_APP_USER);"

buildstore:
	docker build -t store ./store

runstore:
	$(network_cmd); \
	docker run -d --rm --name $(store_docker_instance) --network $(DOCKER_NET) $(store_port_arg) \
  		   -e POSTGRES_USER=$(DB_ROOT) -e POSTGRES_PASSWORD=$(DB_ROOT_PASS) store

initdb:
	docker exec $(store_docker_instance) psql --username=$(DB_ROOT) --command="DROP DATABASE IF EXISTS \"$(db_name)\";"; \
	docker exec $(store_docker_instance) createdb --username=$(DB_ROOT) --owner=$(DB_ROOT) $(db_name); \
	docker exec $(store_docker_instance) psql --username=$(DB_ROOT) --command="\
				DROP ROLE IF EXISTS $(DB_APP_USER); \
				CREATE USER $(DB_APP_USER) WITH PASSWORD '$(DB_APP_PASSWORD)';"; \
	docker exec $(store_docker_instance) migrate -path ./migrations -database $(db_docker_url_root) -verbose up; \
  	$(grantperms_cmd)

nginxconf:
	export DOMAIN=$(DOMAIN); \
	export SERVER_NAME=$(server_name); \
	export API_HOST=$(api_docker_instance); \
	export API_PORT=$(api_port_instance); \
	export MEDIA_STORE_HOST=$(media_store_docker_instance); \
	export MEDIA_STORE_PORT=$(media_store_port_instance); \
	envsubst < frontend/nginx_conf/$(nginx_conf) | sed 's|$$%|$$|g' > nginx.conf; \
	docker cp nginx.conf $(web_docker_instance):/etc/nginx/conf.d/$(server_name).conf; \
	docker exec $(web_docker_instance) rm -f /etc/nginx/conf.d/default.conf; \
	rm nginx.conf; \
	docker restart $(web_docker_instance)

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
	docker run -d --rm --name $(api_docker_instance) --network $(DOCKER_NET) -p $(api_port_instance):$(api_port_instance) api \
	app -api_port=$(api_port_instance) -db_url=$(db_docker_url) \
	-media_store_host=$(media_store_docker_instance) -media_store_port=$(media_store_port_instance) \
	-pay_contact=$(pay_contact_arg) -pay_review=$(pay_review_arg)


buildmediastore:
	docker build -t media_store ./media_store

runmediastore:
	$(network_cmd); \
	docker run -d --rm --name $(media_store_docker_instance) --network $(DOCKER_NET) -p $(media_store_port_instance):$(media_store_port_instance) media_store \
	store -port=$(media_store_port_instance)

buildweb:
	docker build -t web ./frontend

runweb:
	$(network_cmd); \
	docker run -d --rm --name $(web_docker_instance) --network $(DOCKER_NET) -p $(web_port_instance):80 \
	-e SERVER_NAME=$(server_name_instance) \
	-e API_HOST=$(api_docker_instance) \
	-e API_PORT=$(api_port_instance) \
	-e MEDIA_STORE_HOST=$(media_store_docker_instance) \
	-e MEDIA_STORE_PORT=$(media_store_port_instance) \
	web

runadminer:
	$(network_cmd); \
	docker run -d --rm --name adminer --network $(DOCKER_NET) -p 8088:8080 adminer

dropdb:
	docker exec $(store_docker_instance) dropdb --if-exists --username=$(DB_ROOT) $(db_name)

grantprivs:
	$(grantperms_cmd);

migrateup:
	docker exec -it $(store_docker_instance) migrate -path ./migrations -database $(db_docker_url_root) -verbose up; $(grantperms_cmd);\

migrateup1:
	docker exec -it $(store_docker_instance) migrate -path ./migrations -database $(db_docker_url_root) -verbose up 1; $(grantperms_cmd);\

migratedown:
	docker exec -it $(store_docker_instance) migrate -path ./migrations -database $(db_docker_url_root) -verbose down; $(grantperms_cmd);\

migratedown1:
	docker exec -it $(store_docker_instance) migrate -path ./migrations -database $(db_docker_url_root) -verbose down 1; $(grantperms_cmd);\

cleanup:
	docker rm -f; \
	docker image prune -f; \
	docker network prune -f;\
	@echo "--- CLEANUP FINISHED ---"
