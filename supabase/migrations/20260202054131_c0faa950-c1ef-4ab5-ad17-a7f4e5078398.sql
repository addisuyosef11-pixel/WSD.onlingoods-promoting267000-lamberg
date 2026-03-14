-- Create profiles table for user data (phone as ID concept)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  current_vip_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create VIP levels table
CREATE TABLE public.vip_levels (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vip_level INTEGER REFERENCES public.vip_levels(id) NOT NULL,
  task_order INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user task progress table
CREATE TABLE public.user_task_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  vip_level INTEGER REFERENCES public.vip_levels(id) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- VIP levels are public read
CREATE POLICY "Anyone can view VIP levels" ON public.vip_levels FOR SELECT USING (true);

-- Tasks are public read
CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);

-- User task progress policies
CREATE POLICY "Users can view their own progress" ON public.user_task_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_task_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_task_progress FOR UPDATE USING (auth.uid() = user_id);

-- Insert 5 VIP levels
INSERT INTO public.vip_levels (id, name, price, description) VALUES
(1, 'VIP 1', 50.00, 'Starter VIP package with basic earning tasks'),
(2, 'VIP 2', 150.00, 'Enhanced earning potential with better tasks'),
(3, 'VIP 3', 300.00, 'Premium tasks with higher profits'),
(4, 'VIP 4', 500.00, 'Elite level with exclusive high-value tasks'),
(5, 'VIP 5', 1000.00, 'Ultimate VIP with maximum earning potential');

-- Insert 8 tasks for each VIP level
-- VIP 1 Tasks
INSERT INTO public.tasks (vip_level, task_order, title, price, profit) VALUES
(1, 1, 'Basic Survey Completion', 5.00, 2.50),
(1, 2, 'App Review Task', 8.00, 4.00),
(1, 3, 'Social Media Share', 6.00, 3.00),
(1, 4, 'Product Rating', 7.00, 3.50),
(1, 5, 'Video Watch Task', 9.00, 4.50),
(1, 6, 'Newsletter Signup', 5.00, 2.50),
(1, 7, 'Basic Data Entry', 10.00, 5.00),
(1, 8, 'Referral Bonus', 15.00, 7.50);

-- VIP 2 Tasks
INSERT INTO public.tasks (vip_level, task_order, title, price, profit) VALUES
(2, 1, 'Premium Survey', 15.00, 8.00),
(2, 2, 'App Testing', 20.00, 10.00),
(2, 3, 'Content Creation', 18.00, 9.00),
(2, 4, 'Product Testing', 22.00, 11.00),
(2, 5, 'Video Review', 25.00, 12.50),
(2, 6, 'Market Research', 17.00, 8.50),
(2, 7, 'Data Verification', 23.00, 11.50),
(2, 8, 'Brand Promotion', 30.00, 15.00);

-- VIP 3 Tasks
INSERT INTO public.tasks (vip_level, task_order, title, price, profit) VALUES
(3, 1, 'Advanced Survey', 30.00, 18.00),
(3, 2, 'Software Beta Test', 40.00, 24.00),
(3, 3, 'Content Strategy', 35.00, 21.00),
(3, 4, 'Product Launch Review', 45.00, 27.00),
(3, 5, 'Video Production', 50.00, 30.00),
(3, 6, 'Consumer Research', 38.00, 22.80),
(3, 7, 'Quality Assurance', 42.00, 25.20),
(3, 8, 'Partnership Task', 55.00, 33.00);

-- VIP 4 Tasks
INSERT INTO public.tasks (vip_level, task_order, title, price, profit) VALUES
(4, 1, 'Elite Survey Panel', 50.00, 35.00),
(4, 2, 'Enterprise Testing', 70.00, 49.00),
(4, 3, 'Creative Campaign', 60.00, 42.00),
(4, 4, 'Executive Review', 75.00, 52.50),
(4, 5, 'Media Production', 80.00, 56.00),
(4, 6, 'Strategic Research', 65.00, 45.50),
(4, 7, 'Premium QA Task', 72.00, 50.40),
(4, 8, 'VIP Partnership', 90.00, 63.00);

-- VIP 5 Tasks
INSERT INTO public.tasks (vip_level, task_order, title, price, profit) VALUES
(5, 1, 'Diamond Survey', 100.00, 80.00),
(5, 2, 'Platinum Testing', 150.00, 120.00),
(5, 3, 'Master Campaign', 130.00, 104.00),
(5, 4, 'CEO Review Panel', 160.00, 128.00),
(5, 5, 'Studio Production', 180.00, 144.00),
(5, 6, 'Executive Research', 140.00, 112.00),
(5, 7, 'Ultimate QA', 155.00, 124.00),
(5, 8, 'Elite Partnership', 200.00, 160.00);

-- Function to update balance
CREATE OR REPLACE FUNCTION public.add_profit_to_balance(p_user_id UUID, p_profit DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance + p_profit,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();