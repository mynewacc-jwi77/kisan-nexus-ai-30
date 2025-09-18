-- Create profiles table to extend auth.users with farmer-specific data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  farm_size DECIMAL,
  soil_type TEXT,
  languages TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', 'India')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update farmers table to reference auth users
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update equipment table to reference auth users  
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update rentals table to reference auth users
ALTER TABLE public.rentals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create payments table for transaction records
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES public.rentals(id),
  payer_id UUID NOT NULL REFERENCES auth.users(id),
  payee_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
  gateway_transaction_id TEXT,
  gateway_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "System can insert payments" ON public.payments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "System can update payments" ON public.payments
  FOR UPDATE USING (TRUE);

-- Update RLS policies for equipment to be user-specific
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.equipment;

CREATE POLICY "Users can view all equipment" ON public.equipment
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert own equipment" ON public.equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON public.equipment
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON public.equipment
  FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for rentals to be user-specific
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.rentals;

CREATE POLICY "Users can view their rentals" ON public.rentals
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = renter_id);

CREATE POLICY "Users can create rentals" ON public.rentals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their rentals" ON public.rentals
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = renter_id);

-- Create booking notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'payment'))
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);