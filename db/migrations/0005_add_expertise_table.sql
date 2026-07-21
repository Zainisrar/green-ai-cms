-- Migration: Add expertise table
-- Created: 2024-10-21

CREATE TABLE IF NOT EXISTS "expertise" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"highlighted" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"slug" text NOT NULL,
	"highlighted_title" text NOT NULL,
	"subtitle_page" text NOT NULL,
	"description_page" text NOT NULL,
	"icons" jsonb NOT NULL,
	"carousel" jsonb NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS "expertise_slug_unique" ON "expertise" ("slug");