CREATE TABLE "actions" (
    "name" character varying(32) NOT NULL,
    CONSTRAINT "actions_pkey" PRIMARY KEY ("name")
) WITH (oids = false);

INSERT INTO "actions" ("name") VALUES
('read'),
('create'),
('update'),
('delete');


CREATE TABLE "policies" (
    "id" serial NOT NULL,
    "user" character varying(32),
    "role" character varying(32),
    "action" character varying(64) NOT NULL,
    "resource" character varying(32) NOT NULL,
    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "policies" ("id", "user", "role", "action", "resource") VALUES
(6,	NULL,	'professional',	'read',	'/professionals/list*');


CREATE TABLE "professionals" (
    "id" serial NOT NULL,
    "user" integer NOT NULL,
    "rating" integer NOT NULL,
    CONSTRAINT "professionals_pk" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "professionals_services" (
    "professional" integer NOT NULL,
    "service" character varying(64) NOT NULL,
    CONSTRAINT "professionals_services_pk" PRIMARY KEY ("professional", "service")
) WITH (oids = false);

CREATE TABLE "rentals" (
    "id" serial NOT NULL,
    "rented_from" timestamp NOT NULL,
    "rented_to" timestamp NOT NULL,
    "status" character varying NOT NULL,
    "professional" integer NOT NULL,
    "renter" integer NOT NULL,
    CONSTRAINT "rentals_pk" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "roles" (
    "name" character varying(32) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
) WITH (oids = false);

INSERT INTO "roles" ("name") VALUES
('admin'),
('professional'),
('guest');

CREATE TABLE "services" (
    "name" character varying(64) NOT NULL,
    "desc" text NOT NULL,
    CONSTRAINT "services_pk" PRIMARY KEY ("name")
) WITH (oids = false);

CREATE TABLE "users" (
    "id" serial NOT NULL,
    "username" character varying(32) NOT NULL,
    "fullname" character varying(32) NOT NULL,
    "email" character varying(64) NOT NULL,
    "hashed_password" character varying(256) NOT NULL,
    "password_changed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "role" character varying(32) DEFAULT 'guest' NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username")
) WITH (oids = false);

ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_action_fkey" FOREIGN KEY (action) REFERENCES actions(name) NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "policies" ADD CONSTRAINT "policies_subject_fkey" FOREIGN KEY ("user") REFERENCES users(username) NOT DEFERRABLE;
ALTER TABLE ONLY "professionals" ADD CONSTRAINT "professionals_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) NOT DEFERRABLE;
ALTER TABLE ONLY "professionals_services" ADD CONSTRAINT "professionals_services_professional_fkey" FOREIGN KEY (professional) REFERENCES professionals(id) NOT DEFERRABLE;
ALTER TABLE ONLY "professionals_services" ADD CONSTRAINT "professionals_services_service_fkey" FOREIGN KEY (service) REFERENCES services(name) NOT DEFERRABLE;
ALTER TABLE ONLY "rentals" ADD CONSTRAINT "rentals_professional_fkey" FOREIGN KEY (professional) REFERENCES professionals(id) NOT DEFERRABLE;
ALTER TABLE ONLY "rentals" ADD CONSTRAINT "rentals_renter_fkey" FOREIGN KEY (renter) REFERENCES users(id) NOT DEFERRABLE;
ALTER TABLE ONLY "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE SET DEFAULT NOT DEFERRABLE;

/*
INSERT INTO "users" ("id", "username", "fullname", "email", "hashed_password", "password_changed_at", "created_at", "role") VALUES
(3,	'milan',	'milan ko',	'mi@lan.sk',	'$2y$10$qCU7HWIZ6.ovOSLys1PLDOpyMGwCpE7eTqCB5cwtn2WtsO2iHK.1e',	NULL,	'2023-06-15 16:08:21.721551',	'guest'),
(1,	'miro',	'mi li nko',	'miro.furo@tuta.io',	'$2a$10$XrcRWW8YabW.hRcSXJSkxugBwCo0AgUthlwAE/Nae2fOW8oJZWBBm',	NULL,	'2023-06-05 08:02:39.732293',	'professional');

INSERT INTO "services" ("name", "desc") VALUES
('web development',	'web development desc'),
('hacking',	'pen tests'),
('trubkarcina',	'Trubky vymiena more');
*/
