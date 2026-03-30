-- Enable pgcrypto extension for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_first_login BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default admin (password: 00000000)
INSERT INTO public.users (username, password_hash, role, is_first_login)
VALUES (
    'admin',
    crypt('00000000', gen_salt('bf')),
    'admin',
    false
) ON CONFLICT (username) DO NOTHING;

-- Create RPC for login
CREATE OR REPLACE FUNCTION public.login_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    role TEXT,
    is_first_login BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role, u.is_first_login
    FROM public.users u
    WHERE u.username = p_username
      AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC for changing password
CREATE OR REPLACE FUNCTION public.change_password(p_user_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.users
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        is_first_login = false
    WHERE id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC to get all users (for admin)
CREATE OR REPLACE FUNCTION public.get_users(p_admin_id UUID)
RETURNS TABLE (
    id UUID,
    username TEXT,
    role TEXT,
    is_first_login BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE users.id = p_admin_id AND users.role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT u.id, u.username, u.role, u.is_first_login, u.created_at
    FROM public.users u
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC for admin to create user
CREATE OR REPLACE FUNCTION public.create_user(p_admin_id UUID, p_username TEXT, p_password TEXT, p_role TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE users.id = p_admin_id AND users.role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.users (username, password_hash, role, is_first_login)
    VALUES (
        p_username,
        crypt(p_password, gen_salt('bf')),
        p_role,
        true
    ) RETURNING users.id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
