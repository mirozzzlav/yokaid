CREATE TABLE roles (
    "id"    serial NOT NULL PRIMARY KEY,
    "name"  varchar(32) NOT NULL
);

CREATE TABLE users (
    "id" serial NOT NULL PRIMARY KEY,
    "username" varchar(32) NOT NULL,
    "fullname" varchar(32) NOT NULL,
    "email" varchar(64) NOT NULL,
    "hashed_password" varchar(256) NOT NULL,
    "password_changed_at" timestamp NULL,
    "created_at" timestamp DEFAULT NOW() NOT NULL,
    "role_id" integer NOT NULL REFERENCES roles("id")
);
