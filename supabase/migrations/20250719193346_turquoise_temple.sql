/*
  # Create Super Admin User

  1. New User Creation
    - Creates admin user with email: admin@haca.myst
    - Sets password: admin@HACA
    - Assigns admin role and marketing department
    - Creates corresponding profile entry

  2. Security
    - User is created with email confirmed
    - Profile is automatically linked via auth trigger
*/

-- Insert the super admin user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@haca.myst',
  crypt('admin@HACA', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Admin", "role": "admin", "department": "marketing"}',
  false,
  'authenticated'
);

-- The profile will be created automatically by the existing trigger
-- But let's ensure it exists with the correct data
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  department,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'admin@haca.myst',
  'Super Admin',
  'admin'::user_role,
  'marketing'::department,
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'admin@haca.myst'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();