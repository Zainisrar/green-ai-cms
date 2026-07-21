-- Migration: Add insight_details table
-- Created: 2024-10-21

CREATE TABLE IF NOT EXISTS "insight_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"bg_img" text NOT NULL,
	"background_img" text,
	"nav" jsonb NOT NULL,
	"title" text NOT NULL,
	"sub" text NOT NULL,
	"desc" text NOT NULL,
	"name1" text NOT NULL,
	"name2" text NOT NULL,
	"card_title" text NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);