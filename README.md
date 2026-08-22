# YoKaiD

YoKaiD is a Dockerized web app with four runtime services:

- `store`: PostgreSQL database with migrations
- `api_main`: Go API service
- `media_store_main`: Go media upload/storage service
- `fe`: React frontend served by nginx

The project is managed through the root `Makefile`. There is no Docker Compose file.

## Requirements

Install these tools before starting:

- Docker
- Make
- Python 3

Docker must be running and your user must be allowed to run Docker commands.

## 1. Configure Environment

Create your local `.env` file from the example:

```bash
cp .env.example .env
```

For local development, set:

```env
DOMAIN=localhost
APP_NAME=localhost
```

Review the remaining values in `.env`, especially database passwords and external SMS/mail credentials. The Makefile reads `.env` automatically.

## 2. Build Images

From the repository root, build all app images:

```bash
make buildstore
make buildapi
make buildmediastore
make buildfe
```

This creates these local Docker images:

- `store`
- `api`
- `media_store`
- `fe`

## 3. Start Database

Start PostgreSQL:

```bash
make runstore
```

Verify it is running:

```bash
docker ps
```

You should see a container named `store`.

## 4. Initialize Database

Create the local database, app user, run migrations, and grant permissions:

```bash
make initdb main
```

For local setup, `main` uses:

- database name: `${APP_NAME}_main`
- API port: `${API_PORT}`
- media store port: `${MEDIA_STORE_PORT}`

## 5. Start Backend Services

Start the API:

```bash
make runapi main
```

Start the media store:

```bash
make runmediastore main
```

Verify both are running:

```bash
docker ps
```

You should see:

- `api_main`
- `media_store_main`

## App Modes

The API supports different behavior for reviews and professional contact details. These modes are selected when starting the API.

By default, both review creation and contact viewing are free:

```bash
make runapi main
```

Review modes:

- free/default: omit `pay_review`; submitted reviews are immediately active
- `sms`: user receives an SMS payment code in the response and the review is pending until payment is completed
- `verify`: app sends an SMS verification code to the user's phone number and the review is pending until the code is verified

Start the API with SMS payment for reviews:

```bash
make runapi main pay_review=sms
```

Start the API with SMS verification for reviews:

```bash
make runapi main pay_review=verify
```

Contact modes:

- free/default: omit `pay_contact`; professional email and phone are visible
- `sms`: professional contact details are hidden until the user has paid/unlocked contact access

Start the API with SMS payment for professional contact details:

```bash
make runapi main pay_contact=sms
```

You can combine review and contact modes:

```bash
make runapi main pay_review=verify pay_contact=sms
```

After changing app modes, restart the API container:

```bash
docker stop api_main
make runapi main pay_review=verify pay_contact=sms
```

## 6. Start Frontend

Start the frontend nginx container:

```bash
make runfe
```

Then generate and copy the nginx config into the running frontend container:

```bash
make nginxconf main
```

This step is required. The frontend image is a clean production image, so nginx config is generated from `.env` after the container starts. Without this step, the container may be running but `http://localhost` will not respond.

## 7. Open The App

Open:

```text
http://localhost/
```

The frontend proxies:

- `/api` to `api_main:${API_PORT}`
- `/media` to `media_store_main:${MEDIA_STORE_PORT}`

## Useful Commands

Check running containers:

```bash
docker ps
```

Check frontend logs:

```bash
docker logs fe --tail 100
```

Check API logs:

```bash
docker logs api_main --tail 100
```

Check media store logs:

```bash
docker logs media_store_main --tail 100
```

Rebuild and restart only the frontend:

```bash
make buildfe
docker stop fe
make runfe
make nginxconf main
```

Run new DB migrations:

```bash
make migrateup main
```

Roll back one DB migration:

```bash
make migratedown1 main
```

## Optional Modes

The Makefile supports `main` and `test` modes.

Main mode:

```bash
make runapi main
make runmediastore main
make nginxconf main
```

Test mode:

```bash
make initdb test
make runapi test
make runmediastore test
make nginxconf test
```

The test mode uses:

- `${API_PORT_TEST}`
- `${MEDIA_STORE_PORT_TEST}`
- database name `${APP_NAME}_test`
- server name `test.${DOMAIN}`

## Adminer

Start Adminer:

```bash
make runadminer
```

Generate nginx config for Adminer:

```bash
make nginxconf adminer
```

Adminer runs on port `8088` directly, and can also be routed through nginx depending on the generated config.

## Troubleshooting

If `http://localhost` does not work but `docker ps` shows `fe` running, run:

```bash
make nginxconf main
```

Then check:

```bash
docker exec fe ls /etc/nginx/conf.d
```

You should see `localhost.conf`.

If port `80` is already in use, stop the process using it or change the frontend port mapping in the `runfe` target.

If a container name already exists, stop it first:

```bash
docker stop fe
docker stop api_main
docker stop media_store_main
docker stop store
```

The app containers are started with `--rm`, so stopped containers are removed automatically.

If the API cannot connect to the database, make sure the database was initialized:

```bash
make initdb main
```

If `/api` or `/media` calls fail from the frontend, regenerate nginx config:

```bash
make nginxconf main
```

## Frontend Notes

The frontend Dockerfile uses a multi-stage build:

1. A temporary Node image installs dependencies and builds the React app.
2. A clean nginx image serves only the production frontend files.

The final `fe` image does not contain `npm`, source files, or `node_modules`.
