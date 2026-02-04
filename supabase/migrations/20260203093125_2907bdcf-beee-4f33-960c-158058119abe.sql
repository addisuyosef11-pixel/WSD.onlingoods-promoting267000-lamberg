-- Create trigger function to update balance when deposit is approved
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Add deposit amount to user's total balance
    UPDATE public.profiles
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Record the deposit transaction
    INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
    VALUES (NEW.user_id, 'deposit', NEW.amount, 'completed', 'Deposit Approved', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on deposits table
DROP TRIGGER IF EXISTS on_deposit_approved ON public.deposits;
CREATE TRIGGER on_deposit_approved
  AFTER UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deposit_approval();