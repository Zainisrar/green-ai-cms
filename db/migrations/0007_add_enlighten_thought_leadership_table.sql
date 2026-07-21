-- Create enlighten_thought_leadership table
CREATE TABLE IF NOT EXISTS "enlighten_thought_leadership" (
    "id" SERIAL PRIMARY KEY,
    "editorials" JSONB NOT NULL,
    "main_page" JSONB NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);