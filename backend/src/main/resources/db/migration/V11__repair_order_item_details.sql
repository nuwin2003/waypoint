ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_brand varchar(16);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS item_description varchar(160);

UPDATE orders o
SET product_brand = outlet.brand,
    item_description = COALESCE(o.item_description, 'Existing order')
FROM outlet
WHERE outlet.id = o.outlet_id
  AND (o.product_brand IS NULL OR o.item_description IS NULL);

ALTER TABLE orders ALTER COLUMN product_brand SET NOT NULL;
ALTER TABLE orders ALTER COLUMN item_description SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_product_brand_check'
          AND conrelid = 'orders'::regclass
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_product_brand_check
            CHECK (product_brand IN ('FRESH', 'STYLE', 'TECH'));
    END IF;
END $$;
