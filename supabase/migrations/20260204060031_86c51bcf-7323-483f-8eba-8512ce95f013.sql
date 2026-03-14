-- Add series and admin-controlled columns to vip_levels
ALTER TABLE public.vip_levels 
ADD COLUMN IF NOT EXISTS series VARCHAR(1) DEFAULT 'P',
ADD COLUMN IF NOT EXISTS daily_income NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cycle_days INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS total_income NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_limit INTEGER DEFAULT 2;

-- Update existing P-Series VIP levels with calculated values
UPDATE public.vip_levels SET 
  series = 'P',
  daily_income = ROUND(price * 0.09),
  cycle_days = 60,
  total_income = ROUND(price * 0.09) * 60,
  purchase_limit = 2
WHERE series IS NULL OR series = 'P';

-- Insert B-Series VIP levels (9 levels)
INSERT INTO public.vip_levels (id, name, price, description, series, daily_income, cycle_days, total_income, purchase_limit)
VALUES 
  (10, 'B-3100', 3100, 'B Series VIP Level 1', 'B', 114, 60, 6840, 2),
  (11, 'B-17100', 17100, 'B Series VIP Level 2', 'B', 633, 60, 37980, 2),
  (12, 'B-34000', 34000, 'B Series VIP Level 3', 'B', 1260, 60, 75600, 2),
  (13, 'B-68000', 68000, 'B Series VIP Level 4', 'B', 2520, 60, 151200, 2),
  (14, 'B-136000', 136000, 'B Series VIP Level 5', 'B', 5040, 60, 302400, 2),
  (15, 'B-272000', 272000, 'B Series VIP Level 6', 'B', 10080, 60, 604800, 2),
  (16, 'B-544000', 544000, 'B Series VIP Level 7', 'B', 20160, 60, 1209600, 2),
  (17, 'B-1088000', 1088000, 'B Series VIP Level 8', 'B', 40320, 60, 2419200, 2),
  (18, 'B-2176000', 2176000, 'B Series VIP Level 9', 'B', 80640, 60, 4838400, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  series = EXCLUDED.series,
  daily_income = EXCLUDED.daily_income,
  cycle_days = EXCLUDED.cycle_days,
  total_income = EXCLUDED.total_income,
  purchase_limit = EXCLUDED.purchase_limit;