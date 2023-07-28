CREATE TABLE "item_categories" (
    "id" serial NOT NULL,
    "name" character varying(256) NOT NULL,
    CONSTRAINT "item_categories_id" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "items" (
    "id" serial NOT NULL,
    "name" character varying(256) NOT NULL,
    "description" text,
    "category_id" integer NOT NULL,
    "spec" jsonb,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "rental_posts" (
    "post_id" integer NOT NULL,
    "item_id" integer NOT NULL,
    "rent_date_from" timestamp NOT NULL,
    "rent_date_to" timestamp NOT NULL,
    "price" real NOT NULL,
    CONSTRAINT "rental_posts_pkey" PRIMARY KEY ("post_id")
);

CREATE TABLE "images" (
   "id" serial NOT NULL,
   "path" character varying(512) NOT NULL,
   CONSTRAINT "images_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE TABLE "item_images" (
    "image_id" integer NOT NULL,
    "item_id" integer NOT NULL,
    CONSTRAINT "item_images_image_id" PRIMARY KEY ("image_id")
) WITH (oids = false);

CREATE TABLE "post_images" (
    "post_id" integer NOT NULL,
    "image_id" integer NOT NULL
) WITH (oids = false);

CREATE TABLE "user_items" (
    "item_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "available_count" integer NOT NULL,
    "total_count" integer NOT NULL,
    "price" real NOT NULL,
    CONSTRAINT "user_items_item_id_user_id" PRIMARY KEY ("item_id", "user_id")
) WITH (oids = false);


ALTER TABLE ONLY "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY (category_id) REFERENCES item_categories(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "rental_posts" ADD CONSTRAINT "rental_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "rental_posts" ADD CONSTRAINT "rental_posts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES items(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "item_images" ADD CONSTRAINT "item_images_image_id_fkey" FOREIGN KEY (image_id) REFERENCES images(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "item_images" ADD CONSTRAINT "item_images_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "post_images" ADD CONSTRAINT "post_images_image_id_fkey" FOREIGN KEY (image_id) REFERENCES images(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "post_images" ADD CONSTRAINT "post_images_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "user_items" ADD CONSTRAINT "user_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "user_items" ADD CONSTRAINT "user_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
