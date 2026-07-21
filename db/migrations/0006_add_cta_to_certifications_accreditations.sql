-- Migration: Add CTA field to evolution_certifications_accreditations table
-- Created: 2024-11-02

-- Add CTA field as JSONB to store text and link
ALTER TABLE "evolution_certifications_accreditations" 
ADD COLUMN "cta" jsonb DEFAULT '{"text": "", "link": ""}'::jsonb;

-- Update existing records to have default CTA values (preserves existing data)
UPDATE "evolution_certifications_accreditations" 
SET "cta" = '{"text": "", "link": ""}'::jsonb 
WHERE "cta" IS NULL;