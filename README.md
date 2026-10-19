# YoKaiD

YoKaiD is a Dockerized web app made of these services:

- PostgreSQL store: `<APP_NAME>_store_<instance_id>`
- Go API: `<APP_NAME>_api_<instance_id>`
- Go media store: `<APP_NAME>_media_store_<instance_id>`
- Web container serving the React app through nginx: `<APP_NAME>_web_<instance_id>`

The project is managed through the root `Makefile`. There is no Docker Compose file.

## Requirements

Install:

- Docker
- Make

Docker must be running and your user must be allowed to run Docker commands.

## Configure Environment

Create a local `.env` file:

```bash
cp .env.example .env
```

For local development, set:

```env
DOMAIN=localhost
APP_NAME=yokaid
INSTANCE_ID=main
```

Review the remaining values in `.env`, especially database passwords and external SMS/mail credentials.

## Instance Ids

Most Makefile commands accept an optional instance id as the second argument:

```bash
make runapi main
make runapi test
make runapi demo
```

If you omit the instance id, `INSTANCE_ID` from `.env` is used. By default, that is `main`:

```bash
make runapi
```

is the same as:

```bash
make runapi main
```

Container names use `<APP_NAME>_<service>_<instance_id>`. The following examples assume `APP_NAME=yokaid` in `.env`:

```text
instance id: demo
store: yokaid_store_demo
api: yokaid_api_demo
media store: yokaid_media_store_demo
web: yokaid_web_demo
database: ${APP_NAME}
```

Each instance has its own PostgreSQL container, so the database can have the same name inside every store container.

Each PostgreSQL container uses a named Docker volume with the same name, such as `yokaid_store_main` or `yokaid_store_demo`, mounted at `/var/lib/postgresql/data`. `make runstore <instance_id>` creates the volume automatically if it does not exist and reuses it on subsequent starts. Database data survives stopping and removing the container, including with `--rm`.

Run `make initdb <instance_id>` only when initializing or intentionally resetting the database: it drops and recreates the application database even when the volume already contains data. For an existing database, start the container with `make runstore <instance_id>` and apply migrations with `make migrateup <instance_id>`.

Existing anonymous volumes are not copied into the new named volumes automatically. Back up an existing database before stopping its old container, then restore it into the new one if you need to keep its data.

When upgrading from names without the app prefix, the old `store_main` volume is not automatically renamed or reused as `yokaid_store_main`. Migrate its data before switching if you need to keep it, and stop the old containers before starting the new ones on the same ports. Changing `APP_NAME` also selects different container and volume names.

## Ports

The default instance uses the default ports from `.env`:

- web: `${WEB_PORT}`, usually `80`
- API: `${API_PORT}`, usually `8080`
- media store: `${MEDIA_STORE_PORT}`, usually `9090`

Docker-published ports bind to `127.0.0.1`, so they are only reachable from the host machine by default. Put a host nginx, Caddy, or another public reverse proxy in front of the web port for internet-facing deployments.

Database containers are not published to the host by default. The API talks to PostgreSQL inside Docker through `yokaid_store_<instance_id>:5432`.

Non-default instances must receive explicit web/API/media ports when starting those services. This avoids accidentally colliding with the default stack ports.

Example custom instance:

```bash
make runstore demo
make initdb demo
make runapi demo api_port=8092 media_store_port=9192
make runmediastore demo media_store_port=9192
make runweb demo web_port=8082 api_port=8092 media_store_port=9192
```

Then open:

```text
http://localhost:8082/
```

## Deploy To The VPS Through Git

Deploy published commits from `main` in `git@github.com:mirozzzlav/yokaid.git`. Commit and push the intended changes before deployment; uncommitted local source is not deployed.

On `wondercules.com`, use the existing checkout:

```bash
cd /home/miro/yokaid
git status --short
# Continue only after resolving any source changes shown above.
git fetch origin main
git merge --ff-only origin/main
git rev-parse HEAD
```

Verify the resulting SHA matches the intended published commit before building images and replacing containers. Preserve the server's `.env`, PostgreSQL volume and existing media. For an existing database, apply migrations instead of running `make initdb`, which resets it. Report the deployed SHA after verifying HTTPS and API responses.

The first transition from the earlier file-copy deployment requires reconciling its modified source files on the VPS with the published commit. Back up and review the remote diff before resolving it. Do not overwrite unrelated remote changes or clean ignored server configuration.

## Build Images

From the repository root:

```bash
make buildstore
make buildapi
make buildmediastore
make buildweb
```

Images use `<APP_NAME>_<service>:latest`, shared by all instances of the same app. With `APP_NAME=yokaid`, this creates:

- `yokaid_store:latest`
- `yokaid_api:latest`
- `yokaid_media_store:latest`
- `yokaid_web:latest`

## Start The Main App

Start the database:

```bash
make runstore
```

Initialize the database:

```bash
make initdb
```

Start the API:

```bash
make runapi
```

Start the media store:

```bash
make runmediastore
```

Start the web:

```bash
make runweb
```

Open:

```text
http://localhost/
```

The web proxies:

- `/api` to `yokaid_api_main:${API_PORT}`
- `/media` to `yokaid_media_store_main:${MEDIA_STORE_PORT}`

## Start Another App Instance

Any non-default instance works the same way. Use a custom instance id and explicit ports if it should run next to `main`.

Example `test` instance:

```bash
make runstore test
make initdb test
make runapi test api_port=8090 media_store_port=9190
make runmediastore test media_store_port=9190
make runweb test web_port=8081 api_port=8090 media_store_port=9190
```

Open:

```text
http://localhost:8081/
```

The test web proxies:

- `/api` to `yokaid_api_test:8090`
- `/media` to `yokaid_media_store_test:9190`

## App Payment Modes

The API supports different behavior for reviews and professional contact details. These payment modes are selected when starting the API.

By default, both review creation and contact viewing are free:

```bash
make runapi
```

Review payment modes:

- free/default: omit `pay_review`; submitted reviews are immediately active
- `sms`: user receives an SMS payment code in the response and the review is pending until payment is completed
- `verify`: app sends an SMS verification code to the user's phone number and the review is pending until the code is verified

Examples:

```bash
make runapi pay_review=sms
make runapi pay_review=verify
```

Contact payment modes:

- free/default: omit `pay_contact`; professional email and phone are visible
- `sms`: professional contact details are hidden until the user has paid/unlocked contact access

Example:

```bash
make runapi pay_contact=sms
```

You can combine review and contact modes:

```bash
make runapi pay_review=verify pay_contact=sms
```

For a non-default instance:

```bash
make runapi test api_port=8090 media_store_port=9190 pay_review=verify pay_contact=sms
```

After changing payment modes, restart that API container:

```bash
docker stop yokaid_api_main
make runapi pay_review=verify pay_contact=sms
```

## Web Nginx Config

The web image contains an nginx template at:

```text
/etc/nginx/templates/default.conf.template
```

The official nginx Docker entrypoint converts it into:

```text
/etc/nginx/conf.d/default.conf
```

This happens automatically when the web container starts. The Makefile passes these env vars into the container:

- `SERVER_NAME`
- `API_HOST`
- `API_PORT`
- `MEDIA_STORE_HOST`
- `MEDIA_STORE_PORT`

You do not need to run `make nginxconf main` for normal web startup.

## Useful Commands

Check running containers:

```bash
docker ps
```

Check logs:

```bash
docker logs yokaid_web_main --tail 100
docker logs yokaid_api_main --tail 100
docker logs yokaid_media_store_main --tail 100
docker logs yokaid_store_main --tail 100
```

Run migrations:

```bash
make migrateup
make migrateup1
make migratedown
make migratedown1
```

For another instance:

```bash
make migrateup test
make migratedown1 demo
```

Rebuild and restart the main web:

```bash
make buildweb
docker stop yokaid_web_main
make runweb
```

## Adminer

Start Adminer:

```bash
make runadminer
```

The Adminer container is named `<APP_NAME>_adminer_<INSTANCE_ID>` (for example `yokaid_adminer_main`).

Adminer is available directly on:

```text
http://localhost:8088/
```

The legacy nginx config helper can still generate an Adminer route into the running main web nginx container:

```bash
make nginxconf adminer
```

## Troubleshooting

If a container name already exists, stop it first:

```bash
docker stop yokaid_web_main yokaid_api_main yokaid_media_store_main yokaid_store_main
```

For the `test` instance:

```bash
docker stop yokaid_web_test yokaid_api_test yokaid_media_store_test yokaid_store_test
```

The app containers are started with `--rm`, so stopped containers are removed automatically.

If the web container is running but `localhost` does not work, inspect nginx config:

```bash
docker exec yokaid_web_main ls /etc/nginx/conf.d
docker exec yokaid_web_main nginx -T
```

You should see `default.conf`.

If the API cannot connect to the database, make sure the matching store container is running and initialized:

```bash
make runstore
make initdb
```

For test:

```bash
make runstore test
make initdb test
```

If a custom instance has port conflicts, rerun it with explicit ports:

```bash
make runstore demo
make runapi demo api_port=8092 media_store_port=9192
make runmediastore demo media_store_port=9192
make runweb demo web_port=8082 api_port=8092 media_store_port=9192
```

If you need to connect to a database from a host DB client, publish the DB port explicitly when starting that store:

```bash
make runstore demo store_port=5434
```

The app itself does not need this, because it connects inside Docker.

If you are upgrading from the older single-store setup, stop the old containers and start the instance-specific ones:

```bash
docker stop api_main media_store_main store
make runstore
make initdb
make runapi
make runmediastore
```

## Web Image

The web Dockerfile uses a multi-stage build:

1. A temporary Node image installs dependencies and builds the React app.
2. A clean nginx image serves only the production web files.

The final `<APP_NAME>_web:latest` image does not contain `npm`, source files, or `node_modules`.
