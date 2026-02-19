ALTER TABLE "comments" DROP CONSTRAINT "comments_service_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_service_id_servicos_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."servicos"("id") ON DELETE no action ON UPDATE no action;