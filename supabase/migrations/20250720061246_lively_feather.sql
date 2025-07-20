/*
  # Create Super Admin User

  1. New User Creation
    - Creates a super admin user with email: admin@myst.com
    - Sets password to: admin@myst.com
    - Assigns admin role and tech department
    - Ensures user is active

  2. Security
    - User will be created in auth.users table
    - Profile will be automatically created via trigger
    - User will have full admin privileges
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
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@myst.com',
  crypt('admin@myst.com', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Insert the profile for the super admin
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  department,
  is_active
) 
SELECT 
  u.id,
  'admin@myst.com',
  'Super Administrator',
  'admin'::user_role,
  'tech'::department,
  true
FROM auth.users u 
WHERE u.email = 'admin@myst.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Super Administrator',
  role = 'admin'::user_role,
  department = 'tech'::department,
  is_active = true;