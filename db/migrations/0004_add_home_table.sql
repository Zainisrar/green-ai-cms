-- Migration: Add home table
-- Created: 2024-10-21

CREATE TABLE IF NOT EXISTS "home" (
	"id" serial PRIMARY KEY NOT NULL,
	"text1" jsonb NOT NULL,
	"text2" jsonb NOT NULL,
	"text3" jsonb NOT NULL,
	"text4" jsonb NOT NULL,
	"text5" jsonb NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS "home_slug_unique" ON "home" ("slug");