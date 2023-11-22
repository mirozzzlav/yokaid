FROM nginx

ARG API_PORT
ARG API_PORT_TEST
ARG DOMAIN
ARG TEST_SERVER
ARG MAIN_SERVER
ARG RUN_TEST_SERVER

# VITE_API_PORT is only for developers when running FE on npm server
ENV VITE_API_PORT=${API_PORT}
ENV RUN_TEST_SERVER=${RUN_TEST_SERVER}
ENV API_HOST=api_${MAIN_SERVER}
ENV API_PORT=${API_PORT}
ENV API_PORT_TEST=${API_PORT_TEST}
ENV SERVER_NAME=${DOMAIN}

WORKDIR /app

RUN apt-get update;\
    apt-get install -y npm

COPY ./ ./

RUN npm update; npm install -y
RUN npm run build
RUN mv ./dist/* /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/*
RUN if [ -n "$RUN_TEST_SERVER" ]; then \
    bash -c "envsubst < nginx.conf | sed 's|$%|$|g' > /etc/nginx/conf.d/$DOMAIN.conf"; \
    API_HOST=api_${TEST_SERVER}; \
    API_PORT=${API_PORT_TEST}; \
    SERVER_NAME=${TEST_SERVER}.${DOMAIN}; \
    bash -c "envsubst < nginx.conf | sed 's|$%|$|g' > /etc/nginx/conf.d/$TEST_SERVER.$DOMAIN.conf"; \
else \
    bash -c "envsubst < nginx.conf | sed 's|$%|$|g' > /etc/nginx/conf.d/$DOMAIN.conf"; \
fi