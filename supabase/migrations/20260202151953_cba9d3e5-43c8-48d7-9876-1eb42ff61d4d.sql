-- Add withdrawable_balance to profiles
ALTER TABLE public.profiles 
ADD COLUMN withdrawable_balance numeric NOT NULL DEFAULT 0;

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  account_number varchar NOT NULL,
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (is_active = true);

-- Create deposits table
CREATE TABLE public.deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method_id uuid NOT NULL REFERENCES public.payment_methods(id),
  sender_name varchar NOT NULL,
  transaction_ref varchar NOT NULL,
  proof_url text NOT NULL,
  status varchar NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view their own deposits" 
ON public.deposits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own deposits
CREATE POLICY "Users can insert their own deposits" 
ON public.deposits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Create storage bucket for payment method logos
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-logos', 'payment-logos', true);

-- Storage policies for payment proofs
CREATE POLICY "Users can upload their own payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view payment proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-proofs');

-- Storage policies for payment logos
CREATE POLICY "Anyone can view payment logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-logos');

-- Insert default payment methods
INSERT INTO public.payment_methods (name, account_number) VALUES 
  ('Commercial Bank of Ethiopia (CBE)', '1000123456789'),
  ('Bank of Abyssinia', '2000987654321'),
  ('Awash Bank', '3000456789123'),
  ('Telebirr', '0912345678');

-- Function to add profit to withdrawable balance
CREATE OR REPLACE FUNCTION public.add_profit_to_withdrawable(p_user_id uuid, p_profit numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET withdrawable_balance = withdrawable_balance + p_profit,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;