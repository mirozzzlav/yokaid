CREATE TABLE "actions" (
    "name" character varying(32) NOT NULL,
    CONSTRAINT "actions_pkey" PRIMARY KEY ("name")
) WITH (oids = false);

INSERT INTO "actions" ("name") VALUES ('read'), ('create'), ('update'), ('delete');

CREATE TABLE "policies" (
    "id" serial NOT NULL,
    "user" character varying(32),
    "role" character varying(32),
    "action" character varying(64) NOT NULL,
    "resource" character varying(32) NOT NULL,
    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "posts" (
    "id" serial NOT NULL,
    "author" integer NOT NULL,
    "latitude"  real NOT NULL,
	"longitude" real NOT NULL,
	"headline" character varying(256) NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "posts_pk" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "roles" (
    "name" character varying(32) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
) WITH (oids = false);

INSERT INTO "roles" ("name") VALUES ('admin'), ('guest');

CREATE TABLE "users" (
    "id" serial NOT NULL,
    "username" character varying(32) NOT NULL,
    "full_name" character varying(32) NOT NULL,
    "email" character varying(64) NOT NULL,
    "hashed_password" character varying(256) NULL,
    "active" boolean DEFAULT FALSE NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "role" character varying(32) DEFAULT 'guest' NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username")
) WITH (oids = false);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "password_change_requests" (
    "user_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "token" character varying(64) DEFAULT uuid_generate_v4() NOT NULL,
    CONSTRAINT "password_change_requests_pkey" PRIMARY KEY ("user_id")
) WITH (oids = false);


ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_action_fkey" FOREIGN KEY (action) REFERENCES actions(name) NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_subject_fkey" FOREIGN KEY ("user") REFERENCES users(username) NOT DEFERRABLE;
ALTER TABLE ONLY "posts" ADD CONSTRAINT "posts_user_fkey" FOREIGN KEY ("author") REFERENCES users(id) NOT DEFERRABLE;
ALTER TABLE ONLY "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE SET DEFAULT NOT DEFERRABLE;
ALTER TABLE ONLY "password_change_requests" ADD CONSTRAINT "requests_user_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

/*
INSERT INTO "users" ("id", "username", "full_name", "email", "hashed_password", "created_at", "role") VALUES
(3,	'milan',	'milan ko',	'mi@lan.sk',	'$2y$10$qCU7HWIZ6.ovOSLys1PLDOpyMGwCpE7eTqCB5cwtn2WtsO2iHK.1e',	'2023-06-15 16:08:21.721551',	'guest'),
(1,	'miro',	'mi li nko',	'miro.furo@tuta.io',	'$2a$10$XrcRWW8YabW.hRcSXJSkxugBwCo0AgUthlwAE/Nae2fOW8oJZWBBm',	'2023-06-05 08:02:39.732293',	'professional');
*/
