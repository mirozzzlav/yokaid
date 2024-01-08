FROM nginx
WORKDIR /app

RUN apt-get update;\
    apt-get install -y npm

COPY ./ ./

RUN npm update; npm install -y
RUN npm run build
RUN mv ./dist/* /usr/share/nginx/html
RUN cp ./wip.html ./fb.html /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/*