CREATE TABLE "chatbot_training" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"chunks" integer DEFAULT 0,
	"status" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evolution_certifications_accreditations" ADD COLUMN "cta" jsonb DEFAULT '{"text":"","link":""}'::jsonb;--> statement-breakpoint
ALTER TABLE "insight_details" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "insight_details" ADD COLUMN "image_direction" text DEFAULT 'left' NOT NULL;--> statement-breakpoint
ALTER TABLE "ecosystem_technology_innovation_alliances" DROP COLUMN "why_we_partner";--> statement-breakpoint
ALTER TABLE "insight_details" ADD CONSTRAINT "insight_details_slug_unique" UNIQUE("slug");