CREATE TABLE roles (
    "name"  varchar(32) NOT NULL primary key
);

CREATE TABLE actions (
    "name" varchar(32) NOT NULL primary key
);

CREATE TABLE users (
    "id" serial NOT NULL PRIMARY KEY,
    "username" varchar(32) NOT NULL UNIQUE,
    "fullname" varchar(32) NOT NULL,
    "email" varchar(64) NOT NULL,
    "hashed_password" varchar(256) NOT NULL,
    "password_changed_at" timestamp NULL,
    "created_at" timestamp DEFAULT NOW() NOT NULL,
    "role" varchar(32) NOT NULL REFERENCES roles("name")
);

CREATE TABLE policies (
    "id" serial NOT NULL PRIMARY KEY,
    "subject" varchar(32) NOT NULL, -- user role or user name
    "action" varchar(64) NOT NULL REFERENCES actions("name"), -- read, write, delete, update
    "resource" varchar(32) NOT NULL -- API endpoint
);

CREATE TABLE professionals (
    "id" serial NOT NULL,
    "user" integer NOT NULL REFERENCES users("id"),
    "rating" integer NOT NULL,
    CONSTRAINT "professionals_pk" PRIMARY KEY ("id")
);

CREATE TABLE rentals (
    "id" serial NOT NULL,
    "rented_from" TIMESTAMP NOT NULL,
    "rented_to" TIMESTAMP NOT NULL,
    "status" varchar NOT NULL,
    "professional" integer NOT NULL references professionals("id"),
    "renter" integer NOT NULL references users("id"),
    CONSTRAINT "rentals_pk" PRIMARY KEY ("id")
);


CREATE TABLE services (
    "name" varchar(64) NOT NULL,
    "desc" TEXT NOT NULL,
    CONSTRAINT "services_pk" PRIMARY KEY ("name")
);

CREATE TABLE professionals_services (
    "professional" integer NOT NULL references professionals("id"),
    "service" varchar(64) NOT NULL references services("name"),
    CONSTRAINT "professionals_services_pk" PRIMARY KEY ("professional","service")
);

INSERT INTO actions values ('read'), ('create'), ('update'), ('delete');
INSERT INTO roles values ('admin'), ('renter'), ('professional');
/*
INSERT INTO "users" ("username", "fullname", "email", "hashed_password", "role")
VALUES (
    'miro', 'miro furo', 'miro@slav.sk',
    '$2y$10$qCU7HWIZ6.ovOSLys1PLDOpyMGwCpE7eTqCB5cwtn2WtsO2iHK.1e', 'admin'
);

INSERT INTO "policies" ("subject", "action", "resource") VALUES ('miro', 'read', '/books');
*/
