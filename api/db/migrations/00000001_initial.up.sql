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

CREATE TABLE "roles" (
    "name" character varying(32) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
) WITH (oids = false);

INSERT INTO "roles" ("name") VALUES ('admin'), ('guest'), ('professional');

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

CREATE TABLE "images" (
   "id" serial NOT NULL,
   "path" character varying(512) NOT NULL,
   CONSTRAINT "images_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "professionals" (
    "id" "serial" NOT NULL,
    "full_name" character varying(32) NOT NULL,
    "phone" character varying(16) NULL,
    "email" character varying(64) NULL,
    "business_id" character varying(64) NULL, -- ico / company name?
    "location" character varying(512) NOT NULL,
    "location_lat" real NOT NULL,
    "location_lng" real NOT NULL,
    "active" boolean DEFAULT FALSE NOT NULL,
    CONSTRAINT "professionals_pk" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
    "id" serial NOT NULL,
    "professional_id" integer NOT NULL,
	"text" text NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),

    CONSTRAINT "reviews_pk" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "review_images" (
    "review_id" integer NOT NULL,
    "image_id" integer NOT NULL
) WITH (oids = false);

CREATE TABLE "professions" (
    "id" serial NOT NULL,
    "title" character varying(256) NOT NULL,
    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE TABLE "professional_professions" (
    "profession_id" integer NOT NULL,
    "professional_id" integer NOT NULL,
    CONSTRAINT "professional_professions_profession_id_professional_id" PRIMARY KEY ("profession_id", "professional_id")
);

ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_action_fkey" FOREIGN KEY (action) REFERENCES actions(name) NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_subject_fkey" FOREIGN KEY ("user") REFERENCES users(username) NOT DEFERRABLE;
ALTER TABLE ONLY "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE SET DEFAULT NOT DEFERRABLE;
ALTER TABLE ONLY "password_change_requests" ADD CONSTRAINT "requests_user_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;


ALTER TABLE ONLY "reviews" ADD CONSTRAINT "reviews_user_fkey" FOREIGN KEY ("professional_id") REFERENCES professionals(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "review_images" ADD CONSTRAINT "review_images_image_id_fkey" FOREIGN KEY (image_id) REFERENCES images(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "professional_professions" ADD CONSTRAINT "professional_professions_profession_id_fkey" FOREIGN KEY (profession_id) REFERENCES professions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "professional_professions" ADD CONSTRAINT "professional_professions_professional_id_fkey" FOREIGN KEY (professional_id) REFERENCES professionals(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

/*
INSERT INTO "users" ("username", "full_name", "email", "hashed_password", "active", "created_at", "role") VALUES
('miro',	'miro furo',	'mi@fu.sk',	'$2a$10$yfOG6fThT/U2Mgg2kb/JmuPyDna1epzZjosWfXg6WNPY/4FPxGKnq',	't',	'2023-07-21 15:08:18.440608',	'guest');
*/
