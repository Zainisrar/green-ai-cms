-- Migration: Add insights table
-- Created: 2024-10-21

CREATE TABLE IF NOT EXISTS "insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text NOT NULL,
	"highlighted" text NOT NULL,
	"description" text NOT NULL,
	"bg_img" text NOT NULL,
	"keys" jsonb NOT NULL,
	"cta1" jsonb NOT NULL,
	"cta2" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);