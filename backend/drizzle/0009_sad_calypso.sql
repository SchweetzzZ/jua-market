CREATE TABLE "product_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_image" ADD CONSTRAINT "service_image_service_id_servicos_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."servicos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image_key";--> statement-breakpoint
ALTER TABLE "servicos" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "servicos" DROP COLUMN "image_key";