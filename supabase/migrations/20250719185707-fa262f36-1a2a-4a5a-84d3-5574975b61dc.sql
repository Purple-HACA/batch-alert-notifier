-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'project_lead', 'tech_lead', 'finance_lead', 'design_lead');

-- Create departments enum  
CREATE TYPE public.department AS ENUM ('marketing', 'tech', 'finance', 'design');

-- Create batch status enum
CREATE TYPE public.batch_status AS ENUM ('open', 'full', 'closed', 'cancelled');

-- Create notification status enum
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    department department,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    max_capacity INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    status batch_status DEFAULT 'open',
    department department NOT NULL,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook configurations table
CREATE TABLE public.webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    department department NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    webhook_config_id UUID REFERENCES public.webhook_configs(id),
    message TEXT NOT NULL,
    status notification_status DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create security definer function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department(user_id UUID)
RETURNS department
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT department FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for batches
CREATE POLICY "Users can view batches from their department or all if admin" ON public.batches
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'admin' OR 
        get_user_department(auth.uid()) = department
    );

CREATE POLICY "Project leads and admins can manage batches" ON public.batches
    FOR ALL USING (
        get_user_role(auth.uid()) IN ('admin', 'project_lead') AND
        (get_user_role(auth.uid()) = 'admin' OR get_user_department(auth.uid()) = department)
    );

-- RLS Policies for webhook configs
CREATE POLICY "Users can view webhook configs from their department or all if admin" ON public.webhook_configs
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'admin' OR 
        get_user_department(auth.uid()) = department
    );

CREATE POLICY "Leads and admins can manage webhook configs" ON public.webhook_configs
    FOR ALL USING (
        get_user_role(auth.uid()) IN ('admin', 'project_lead', 'tech_lead', 'finance_lead', 'design_lead') AND
        (get_user_role(auth.uid()) = 'admin' OR get_user_department(auth.uid()) = department)
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view notifications from their department or all if admin" ON public.notifications
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'admin' OR 
        EXISTS (
            SELECT 1 FROM public.batches b 
            WHERE b.id = batch_id AND 
            (get_user_department(auth.uid()) = b.department OR get_user_role(auth.uid()) = 'admin')
        )
    );

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'project_lead')::user_role,
        COALESCE(NEW.raw_user_meta_data->>'department', 'marketing')::department
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at
    BEFORE UPDATE ON public.batches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_configs_updated_at
    BEFORE UPDATE ON public.webhook_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();