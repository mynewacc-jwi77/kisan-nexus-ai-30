-- Fix the equipment table to properly reference profiles
-- First, ensure the foreign key constraint exists and is correct
ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_owner_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.equipment 
ADD CONSTRAINT equipment_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;