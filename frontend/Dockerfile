FROM nginx

ARG API_URL
ARG API_DOCKER_URL
ARG ADMINER_DOCKER_URL
ENV VITE_API_URL=${API_URL}

WORKDIR /app

RUN apt-get update;\
    apt-get install -y npm

COPY ./ ./
RUN npm update; npm install -y
RUN npm run build
RUN mv ./dist/* /usr/share/nginx/html
RUN echo "server { \
    listen       80; \
    listen  [::]:80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
	    try_files \$uri \$uri/ /index.html; \
    } \
    location /api { \
        rewrite ^/api(/.*)$ \$1 break; \
        proxy_pass ${API_DOCKER_URL}; \
        proxy_set_header Host api; \
        proxy_set_header X-Real-IP \$remote_addr; \
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto \$scheme; \
    } \
    location /adminer { \
        rewrite ^/adminer(/.*)$ \$1 break; \
        proxy_pass ${ADMINER_DOCKER_URL}; \
        proxy_set_header Host api; \
        proxy_set_header X-Real-IP \$remote_addr; \
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto \$scheme; \
    } \
}" > /etc/nginx/conf.d/default.conf