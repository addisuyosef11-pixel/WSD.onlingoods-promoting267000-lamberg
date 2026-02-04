-- Add referral_code column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE;

-- Create function to generate random referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS VARCHAR(8)
LANGUAGE plpgsql
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- Update handle_new_user to generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_code VARCHAR(8);
BEGIN
  -- Generate unique referral code
  LOOP
    v_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = v_referral_code);
  END LOOP;

  INSERT INTO public.profiles (user_id, phone, name, balance, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    150, -- Signup bonus of 150 ETB
    v_referral_code
  );
  RETURN NEW;
END;
$function$;

-- Add referred_by column to track who referred the user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Add has_made_first_deposit column to track first deposit status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_made_first_deposit BOOLEAN DEFAULT FALSE;

-- Update handle_deposit_approval to give referral bonus on first deposit
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id UUID;
  v_has_deposited BOOLEAN;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    -- Add deposit amount to user's total balance
    UPDATE public.profiles
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Check if this is user's first deposit and give referral bonus
    SELECT has_made_first_deposit, referred_by INTO v_has_deposited, v_referrer_id
    FROM public.profiles WHERE user_id = NEW.user_id;
    
    IF v_has_deposited = FALSE AND v_referrer_id IS NOT NULL THEN
      -- Mark user as having made first deposit
      UPDATE public.profiles
      SET has_made_first_deposit = TRUE
      WHERE user_id = NEW.user_id;
      
      -- Give 100 ETB bonus to referrer
      UPDATE public.profiles
      SET balance = balance + 100,
          updated_at = now()
      WHERE user_id = v_referrer_id;
      
      -- Record referral bonus transaction
      INSERT INTO public.transactions (user_id, type, amount, status, description)
      VALUES (v_referrer_id, 'referral_bonus', 100, 'completed', 'Referral bonus - invited user made first deposit');
      
      -- Record in referrals table
      INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount)
      VALUES (v_referrer_id, NEW.user_id, 100);
    END IF;
    
    -- Record the deposit transaction
    INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
    VALUES (NEW.user_id, 'deposit', NEW.amount, 'completed', 'Deposit Approved', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_deposit_approved ON public.deposits;
CREATE TRIGGER on_deposit_approved
  AFTER UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deposit_approval();