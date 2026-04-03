# Migration SQL - Add Review and Rating Fields

Run this SQL in your PostgreSQL database to add the new fields for reviews and ratings:

```sql
-- Add rating and review columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS review TEXT;

-- Add constraints to ensure rating is between 1 and 5
ALTER TABLE books ADD CONSTRAINT rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
```

## Changes Made

This migration adds two new columns to the `books` table:

1. **rating** (INTEGER): Optional field for book ratings (1-5 stars)
   - Can be NULL for books that don't have a rating
   - Validation ensures values are between 1-5 or NULL

2. **review** (TEXT): Optional field for written reviews/critiques
   - Can be NULL for books that don't have a review
   - Unlimited length to support detailed reviews

## Backend Updates

The backend models have been updated to:

- Accept `rating` and `review` fields when creating books
- Allow updating `rating` and `review` fields
- Return these fields in API responses

## Frontend Updates

The frontend now includes:

- Star rating UI (1-5 stars) for completed books
- Text area for detailed reviews/critiques
- Display of ratings and reviews in book details
- Both fields visible only for completed books (though technically they can be set on any book)

## Database Statistics

The `books` table includes updated statistics calculation that now:

- Counts pages from completed books (all pages)
- Counts pages from books currently being read (current_page only)
- This allows tracking progress towards yearly page goals in real-time
