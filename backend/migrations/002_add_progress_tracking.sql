-- Add progress tracking fields to books table

ALTER TABLE books
ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_books_last_updated ON books(last_updated DESC);

-- Add trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_book_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_book_last_updated ON books;
CREATE TRIGGER trigger_update_book_last_updated
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_book_last_updated();