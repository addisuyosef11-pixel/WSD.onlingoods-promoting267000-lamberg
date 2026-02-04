-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a table to track user's daily income and claims
CREATE TABLE public.user_daily_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  today_income NUMERIC NOT NULL DEFAULT 0,
  yesterday_income NUMERIC NOT NULL DEFAULT 0,
  last_claim_date DATE,
  last_order_claim_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_daily_income ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily income"
ON public.user_daily_income
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own daily income"
ON public.user_daily_income
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own daily income"
ON public.user_daily_income
FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_daily_income_updated_at
BEFORE UPDATE ON public.user_daily_income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();