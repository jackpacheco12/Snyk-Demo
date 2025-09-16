-- Migration: Add book enrichment fields
-- Adds cover image URL and publication year for Open Library API integration

-- Add new columns for book enrichment data
ALTER TABLE books
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS publication_year INTEGER;

-- Create index for publication year queries
CREATE INDEX IF NOT EXISTS idx_books_publication_year ON books(publication_year);

-- Add comments for documentation
COMMENT ON COLUMN books.cover_image_url IS 'URL to book cover image from Open Library API';
COMMENT ON COLUMN books.publication_year IS 'Publication year fetched from Open Library API';