-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.add_profit_to_balance(p_user_id UUID, p_profit DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance + p_profit,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;