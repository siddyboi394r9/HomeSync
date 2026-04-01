# Supabase Setup Guide

This document outlines the necessary database schema and permissions for the HomeSync application. If you encounter "Could not find table in schema cache" errors, ensure the following setup is applied.

## Database Schema

```sql
-- Households
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID -- NOTE: No FK to auth.users due to cross-schema restrictions
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- NOTE: No FK to auth.users due to cross-schema restrictions
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    household_id UUID REFERENCES public.households(id)
);

-- Bills
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    recurrence TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    remind_days_before INT DEFAULT 3,
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT,
    paid_by UUID REFERENCES public.profiles(id),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE
);

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    period TEXT DEFAULT 'monthly',
    category TEXT DEFAULT 'Food',
    spent DECIMAL(12,2) DEFAULT 0
);
```

## Mandatory Permissions

For the Supabase client (PostgREST) to see the tables, you **MUST** grant permissions to the standard roles:

```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, anon, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, authenticated, anon, service_role;
```

## Security (RLS)

Ensure Row Level Security is enabled and corresponding policies are created to isolate data by `household_id`.

```sql
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage household budgets" ON public.budgets
    FOR ALL USING (household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid()));
```
