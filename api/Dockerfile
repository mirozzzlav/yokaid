FROM golang:1.21
WORKDIR /app

RUN apt-get update;\
    apt-get install -y net-tools;\
    apt-get install sudo;\
    curl -s https://packagecloud.io/install/repositories/golang-migrate/migrate/script.deb.sh | sudo bash;\
    apt-get install -y migrate

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY ./ ./
RUN go build -v -o /usr/local/bin/app

RUN mkdir ./logs && chmod -R 777 ./logs

CMD ["app"]