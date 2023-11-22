FROM postgres:latest

WORKDIR /store

COPY ./ ./
RUN apt-get update;\
    apt-get install -y curl;\
    curl -s https://packagecloud.io/install/repositories/golang-migrate/migrate/script.deb.sh | bash;\
    apt-get install -y migrate

# Expose the default PostgreSQL port
EXPOSE 5432

# Specify the default command to run when the container starts
CMD ["postgres", "-c", "listen_addresses=*"]