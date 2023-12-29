FROM golang:1.21
WORKDIR /store

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY ./ ./
RUN go build -v -o /usr/local/bin/store

RUN mkdir -p ./logs && chmod -R 777 ./logs

CMD ["store"]