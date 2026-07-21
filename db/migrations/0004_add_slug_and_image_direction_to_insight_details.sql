-- Migration: Add slug and image_direction to insight_details table
-- Created: 2024-10-26

-- Add slug column with temporary default
ALTER TABLE "insight_details" ADD COLUMN "slug" text NOT NULL DEFAULT 'temp-slug';

-- Add image_direction column (enum: left/right, default: left)
ALTER TABLE "insight_details" ADD COLUMN "image_direction" text NOT NULL DEFAULT 'left';

-- Update existing records with unique slug values based on their ID and title
UPDATE "insight_details" 
SET "slug" = 'mining-insight-' || "id" || '-' || LOWER(REPLACE(REPLACE("title", ' ', '-'), '''', ''))
WHERE "slug" = 'temp-slug';

-- Add constraint to ensure image_direction is either 'left' or 'right'
ALTER TABLE "insight_details" ADD CONSTRAINT "insight_details_image_direction_check" 
CHECK ("image_direction" IN ('left', 'right'));

-- Add unique constraint to slug column
ALTER TABLE "insight_details" ADD CONSTRAINT "insight_details_slug_unique" UNIQUE ("slug");

-- Remove default from slug column after adding it
ALTER TABLE "insight_details" ALTER COLUMN "slug" DROP DEFAULT;