CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE payments (
    "id" character varying(32) NOT NULL,
    "user_id" character varying(16) NOT NULL,
    "product_id" character(3) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "state" character varying(16) NOT NULL DEFAULT 'new',
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "professionals" (
    "id" "serial" NOT NULL,
    "full_name" character varying(32) NOT NULL,
    "phone" character varying(16) NOT NULL,
    "email" character varying(64) NULL,
    "business_id" character varying(64) NULL, -- ico / company name?
    "location" character varying(512) NOT NULL,
    "location_lat" real NOT NULL,
    "location_lng" real NOT NULL,
    CONSTRAINT "professionals_pk" PRIMARY KEY ("id"),
    CONSTRAINT "professionals_phone_key" UNIQUE ("phone"),
    CONSTRAINT "professionals_email_key" UNIQUE ("email")
);

CREATE TABLE "reviews" (
    "id" character varying(32) NOT NULL,
    "professional_id" integer NOT NULL,
	"text" text NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "reviews_pk" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE TABLE "professions" (
    "id" serial NOT NULL,
    "title" jsonb NOT NULL,
    CONSTRAINT "professions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "professions_title_key" UNIQUE ("title")
) WITH (oids = false);


CREATE TABLE "professional_professions" (
    "profession_id" integer NOT NULL,
    "professional_id" integer NOT NULL,
    CONSTRAINT "professional_professions_profession_id_professional_id" PRIMARY KEY ("profession_id", "professional_id")
);

ALTER TABLE ONLY "reviews" ADD CONSTRAINT "reviews_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES professionals(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "reviews" ADD CONSTRAINT "reviews_id_fkey" FOREIGN KEY ("id") REFERENCES payments(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "professional_professions" ADD CONSTRAINT "professional_professions_profession_id_fkey" FOREIGN KEY (profession_id) REFERENCES professions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "professional_professions" ADD CONSTRAINT "professional_professions_professional_id_fkey" FOREIGN KEY (professional_id) REFERENCES professionals(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

CREATE TABLE user_professional_contacts (
    "id" character varying(32) NOT NULL,
    "professional_id" integer NOT NULL,
    CONSTRAINT "user_professional_contacts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE ONLY "user_professional_contacts" ADD CONSTRAINT "user_professional_contacts_professional_id_fkey"
    FOREIGN KEY ("professional_id") REFERENCES professionals(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "user_professional_contacts" ADD CONSTRAINT "user_professional_contacts_id_fkey"
    FOREIGN KEY ("id") REFERENCES payments(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

