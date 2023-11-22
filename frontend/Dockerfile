FROM nginx

ARG API_EXPOSED_PORT
ARG API_DOCKER
ARG ADMINER_DOCKER
ARG DOMAIN
ARG DOMAIN_TEST_PREFIX
ARG DIGITALOCEAN_API_KEY

ENV VITE_API_PORT=${API_EXPOSED_PORT}
ENV API_DOCKER=${API_DOCKER}
ENV ADMINER_DOCKER=${ADMINER_DOCKER}
ENV DOMAIN=${DOMAIN}
ENV DOMAIN_TEST_PREFIX=${DOMAIN_TEST_PREFIX}
ENV DO_API_KEY=${DIGITALOCEAN_API_KEY}


WORKDIR /app

RUN apt-get update;\
    apt-get install -y npm

COPY ./ ./

RUN npm update; npm install -y
RUN npm run build
RUN mv ./dist/* /usr/share/nginx/html

RUN apt-get install curl -y; apt-get install cron -y
RUN rm /etc/nginx/conf.d/*
RUN if [ "$DOMAIN" != "localhost" ]; then \
    curl https://get.acme.sh | sh -s email=miro.furinda@tuta.io; \
    cd ~/.acme.sh; \
    ./acme.sh --issue --dns dns_dgon -d "$DOMAIN" -d "*.$DOMAIN"; \
    mkdir -p /etc/certs/*.$DOMAIN; \
    ./acme.sh --install-cert -d *.$DOMAIN \
    --key-file /etc/certs/*.$DOMAIN/key.pem \
    --fullchain-file /etc/certs/*.$DOMAIN/cert.pem \
    --reloadcmd     "nginx -s reload"; \
    bash -c "envsubst < remote_nginx.conf | sed 's|$%|$|g' > /etc/nginx/conf.d/*.$DOMAIN.conf"; \
else \
    bash -c "envsubst < localhost_nginx.conf | sed 's|$%|$|g' > /etc/nginx/conf.d/*.$DOMAIN.conf"; \
fi