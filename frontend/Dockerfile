FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY ./ ./

RUN npm ci
RUN npm run build

FROM nginx:stable-bookworm

ENV SERVER_NAME=localhost
ENV API_HOST=api_main
ENV API_PORT=8080
ENV MEDIA_STORE_HOST=media_store_main
ENV MEDIA_STORE_PORT=9090

COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/wip.html /app/fb.html /usr/share/nginx/html/
COPY ./nginx_conf/default.conf.template /etc/nginx/templates/default.conf.template

RUN rm /etc/nginx/conf.d/*
