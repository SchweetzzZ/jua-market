ALTER TABLE "products" RENAME COLUMN "category_name" TO "category";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "image" TO "image_url";--> statement-breakpoint
ALTER TABLE "servicos" RENAME COLUMN "category_name" TO "category";--> statement-breakpoint
ALTER TABLE "servicos" RENAME COLUMN "image" TO "image_url";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_name_categories_name_fk";
--> statement-breakpoint
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_category_name_categories_name_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;