-- Add last_income_transfer_at column to track when income was last transferred from today to yesterday
-- Add last_yesterday_claim_at column to track when yesterday's income was last claimed to withdrawable
ALTER TABLE public.user_daily_income 
ADD COLUMN IF NOT EXISTS last_income_transfer_at timestamp with time zone NULL,
ADD COLUMN IF NOT EXISTS last_yesterday_claim_at timestamp with time zone NULL;

-- Add column to track per-product claim times in a separate table for order claims
CREATE TABLE IF NOT EXISTS public.user_product_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  last_claim_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, transaction_id)
);

-- Enable RLS
ALTER TABLE public.user_product_claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product claims" 
ON public.user_product_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product claims" 
ON public.user_product_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product claims" 
ON public.user_product_claims 
FOR UPDATE 
USING (auth.uid() = user_id);