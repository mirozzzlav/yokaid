CREATE TABLE "verification_codes" (
    "phone" character varying(16) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "code" character(6) NOT NULL,
    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("phone")
) WITH (oids = false);