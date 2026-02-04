-- Add withdrawal_password to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS withdrawal_password VARCHAR(255);

-- Create transactions table for all financial activities
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'vip_purchase', 'deposit', 'withdrawal', 'task_earning'
  amount NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  reference_id UUID, -- Link to related record (vip_level, deposit, etc.)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to auto-approve VIP purchase transactions
CREATE OR REPLACE FUNCTION public.process_vip_purchase(
  p_user_id UUID,
  p_vip_level INTEGER,
  p_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deduct from balance
  UPDATE public.profiles
  SET balance = balance - p_amount,
      current_vip_level = GREATEST(COALESCE(current_vip_level, 0), p_vip_level),
      updated_at = now()
  WHERE user_id = p_user_id AND balance >= p_amount;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Record transaction as completed (auto-approved)
  INSERT INTO public.transactions (user_id, type, amount, status, description)
  VALUES (p_user_id, 'vip_purchase', p_amount, 'completed', 'VIP Level ' || p_vip_level || ' Purchase');
  
  RETURN TRUE;
END;
$$;

-- Function to process withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Check if user has enough withdrawable balance
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = p_user_id AND withdrawable_balance >= p_amount
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Deduct from withdrawable balance
  UPDATE public.profiles
  SET withdrawable_balance = withdrawable_balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create pending withdrawal transaction
  INSERT INTO public.transactions (user_id, type, amount, status, description)
  VALUES (p_user_id, 'withdrawal', p_amount, 'pending', 'Withdrawal Request')
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;