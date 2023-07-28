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
INSERT INTO "users" ("username", "full_name", "email", "hashed_password", "active", "created_at", "role") VALUES
('miro',	'miro furo',	'mi@fu.sk',	'$2a$10$yfOG6fThT/U2Mgg2kb/JmuPyDna1epzZjosWfXg6WNPY/4FPxGKnq',	't',	'2023-07-21 15:08:18.440608',	'guest');
*/
