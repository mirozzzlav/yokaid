CREATE TABLE roles (
    "name"  varchar(32) NOT NULL primary key
);

CREATE TABLE actions (
    "name" varchar(32) NOT NULL primary key
);

CREATE TABLE resources (
    "name" varchar(32) NOT NULL primary key,
    "endpoint" varchar(64) NOT NULL
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
      "resource" varchar(32) NOT NULL -- API endpoint (for example /books)
);