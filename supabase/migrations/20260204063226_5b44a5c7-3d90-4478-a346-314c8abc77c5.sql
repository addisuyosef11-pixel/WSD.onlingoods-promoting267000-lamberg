-- Add sold_out_time column to vip_levels for admin control
ALTER TABLE public.vip_levels 
ADD COLUMN sold_out_time timestamp with time zone NULL;

-- Update B-Series with images
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop' WHERE id = 7;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop' WHERE id = 8;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop' WHERE id = 9;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' WHERE id = 10;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop' WHERE id = 11;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop' WHERE id = 12;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop' WHERE id = 13;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop' WHERE id = 14;
UPDATE public.vip_levels SET image_url = 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop' WHERE id = 15;