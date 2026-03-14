-- Create gift_codes table
CREATE TABLE public.gift_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  is_used BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view gift codes (for claiming)
CREATE POLICY "Users can view unclaimed gift codes" 
ON public.gift_codes 
FOR SELECT 
USING (true);

-- Policy to allow users to update gift codes (for claiming)
CREATE POLICY "Users can claim gift codes" 
ON public.gift_codes 
FOR UPDATE 
USING (is_used = false)
WITH CHECK (auth.uid() = claimed_by);

-- Create function to claim gift code
CREATE OR REPLACE FUNCTION public.claim_gift_code(p_user_id UUID, p_code TEXT)
RETURNS TABLE(success BOOLEAN, amount INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gift_code RECORD;
BEGIN
  -- Find the gift code
  SELECT * INTO v_gift_code 
  FROM gift_codes 
  WHERE code = p_code AND is_used = false
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid or already used gift code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_gift_code.expires_at IS NOT NULL AND v_gift_code.expires_at < now() THEN
    RETURN QUERY SELECT false, 0, 'Gift code has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Mark as used
  UPDATE gift_codes 
  SET is_used = true, claimed_by = p_user_id, claimed_at = now()
  WHERE id = v_gift_code.id;
  
  -- Add to user balance
  UPDATE profiles 
  SET balance = balance + v_gift_code.amount
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, status, description)
  VALUES (p_user_id, 'gift', v_gift_code.amount, 'completed', 'Gift code claimed: ' || p_code);
  
  RETURN QUERY SELECT true, v_gift_code.amount, 'Gift code claimed successfully!'::TEXT;
END;
$$;