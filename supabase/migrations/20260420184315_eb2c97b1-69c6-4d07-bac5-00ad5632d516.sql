ALTER TABLE public.products ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}'::text[];

-- Backfill: copy existing single category into array if empty
UPDATE public.products SET categories = ARRAY[category] WHERE (categories IS NULL OR cardinality(categories) = 0) AND category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_categories ON public.products USING GIN(categories);