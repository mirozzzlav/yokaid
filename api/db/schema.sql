CREATE TABLE users (
    "id" serial NOT NULL,
    "username" character varying(32) NOT NULL,
    "fullname" character varying(32) NOT NULL,
    "email" character varying(64) NOT NULL,
    "hashed_password" character varying(256) NOT NULL,
    "password_changed_at" timestamp NULL,
    "created_at" timestamp DEFAULT NOW() NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
