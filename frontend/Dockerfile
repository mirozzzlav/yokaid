FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY ./ ./

RUN npm ci
RUN npm run build

FROM nginx:stable-bookworm

COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --from=builder /app/wip.html /app/fb.html /usr/share/nginx/html/

RUN rm /etc/nginx/conf.d/*
