-- ============================================
-- FILE: supabase/migrations/001_initial_schema.sql
-- Smart Pantry Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────
-- TABLE: users (mirrors auth.users)
-- ─────────────────────────────────────
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  diet_pref   TEXT DEFAULT 'all',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Auto-insert user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────
-- TABLE: pantry_items
-- ─────────────────────────────────────
CREATE TABLE public.pantry_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_name    TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'Other',
  quantity     NUMERIC DEFAULT 1,
  unit         TEXT DEFAULT 'units',
  expiry_date  DATE NOT NULL,
  barcode      TEXT,
  image_url    TEXT,
  notes        TEXT,
  status       TEXT DEFAULT 'fresh',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pantry" ON public.pantry_items
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_pantry_expiry ON public.pantry_items(user_id, expiry_date);
CREATE INDEX idx_pantry_status ON public.pantry_items(user_id, status);

-- ─────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────
CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  type         TEXT DEFAULT 'expiry',
  status       TEXT DEFAULT 'unread',
  item_id      UUID REFERENCES public.pantry_items(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, status);

-- ─────────────────────────────────────
-- TABLE: grocery_list
-- ─────────────────────────────────────
CREATE TABLE public.grocery_list (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_name    TEXT NOT NULL,
  quantity     NUMERIC DEFAULT 1,
  unit         TEXT DEFAULT 'units',
  category     TEXT DEFAULT 'Other',
  is_purchased BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grocery_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery list" ON public.grocery_list
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────
-- TABLE: recipes (AI response cache)
-- ─────────────────────────────────────
CREATE TABLE public.recipes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cache_key        TEXT NOT NULL,
  recipes_json     JSONB NOT NULL,
  generated_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recipe cache" ON public.recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_recipes_cache ON public.recipes(user_id, cache_key);

-- ─────────────────────────────────────
-- TABLE: waste_log (Analytics)
-- ─────────────────────────────────────
CREATE TABLE public.waste_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_name    TEXT NOT NULL,
  category     TEXT,
  action       TEXT NOT NULL,
  quantity     NUMERIC DEFAULT 1,
  logged_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.waste_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waste log" ON public.waste_log
  FOR ALL USING (auth.uid() = user_id);
