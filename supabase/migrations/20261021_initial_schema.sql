-- =============================================================================
-- OPTIK I SEE YOU - ADMIN CMS POSTGRESQL SCHEMA (SUPABASE)
-- Initial Migration: 20261021_initial_schema.sql
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'create', 'update', 'delete', 'publish', 'unpublish', 'login'
  module TEXT NOT NULL, -- e.g. 'frames', 'softlens', 'blog', 'media', 'settings', 'auth'
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATALOG COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS catalog_collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  badge TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATALOG FRAMES TABLE
CREATE TABLE IF NOT EXISTS catalog_frames (
  id TEXT PRIMARY KEY,
  sku TEXT,
  name TEXT NOT NULL,
  collection_id TEXT REFERENCES catalog_collections(id) ON DELETE SET NULL,
  collection_name TEXT NOT NULL,
  shape TEXT NOT NULL,
  material TEXT,
  dimensions JSONB,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC,
  price_range TEXT,
  price_includes_lens BOOLEAN DEFAULT false,
  image TEXT NOT NULL,
  cover_image TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  lifestyle_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  poster_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs_image TEXT,
  ar_asset_id TEXT,
  glasses_id TEXT,
  fit_width_ratio NUMERIC,
  ipd_scale_ref NUMERIC,
  model_3d JSONB,
  recommended_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  style TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SOFTLENS SERIES & ACCESSORIES TABLE
CREATE TABLE IF NOT EXISTS softlens_series (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK (category IN ('Softlens', 'Aksesoris dan Perawatan')),
  type TEXT NOT NULL CHECK (type IN ('lens', 'accessory')),
  color_family TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  description TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  diameter TEXT,
  water_content TEXT,
  usage_duration TEXT,
  volume TEXT,
  is_accessory BOOLEAN NOT NULL DEFAULT false,
  base_price NUMERIC NOT NULL DEFAULT 0,
  base_price_formatted TEXT NOT NULL DEFAULT '',
  has_price_range BOOLEAN DEFAULT false,
  max_price NUMERIC,
  max_price_formatted TEXT,
  badge_text TEXT,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  video_url TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Tim Optik I See You',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reading_time INT NOT NULL DEFAULT 1,
  related_cabang TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_path TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  width INT,
  height INT,
  alt_text TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_frames_collection ON catalog_frames(collection_id);
CREATE INDEX IF NOT EXISTS idx_catalog_frames_shape ON catalog_frames(shape);
CREATE INDEX IF NOT EXISTS idx_catalog_frames_published ON catalog_frames(is_published);
CREATE INDEX IF NOT EXISTS idx_softlens_category ON softlens_series(category);
CREATE INDEX IF NOT EXISTS idx_softlens_color_family ON softlens_series(color_family);
CREATE INDEX IF NOT EXISTS idx_softlens_published ON softlens_series(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE softlens_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Public can read published catalog frames
CREATE POLICY "Public read published frames" ON catalog_frames
  FOR SELECT USING (is_published = true);

-- Public can read collections
CREATE POLICY "Public read collections" ON catalog_collections
  FOR SELECT USING (true);

-- Public can read published softlens
CREATE POLICY "Public read published softlens" ON softlens_series
  FOR SELECT USING (is_published = true);

-- Public can read published blog posts
CREATE POLICY "Public read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Public can read website settings
CREATE POLICY "Public read website settings" ON website_settings
  FOR SELECT USING (true);

-- Public can read media files
CREATE POLICY "Public read media files" ON media_files
  FOR SELECT USING (true);

-- Service role has full access (used by Next.js server runtime)
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Service role full access admin_sessions" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Service role full access audit_logs" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Service role full access catalog_collections" ON catalog_collections FOR ALL USING (true);
CREATE POLICY "Service role full access catalog_frames" ON catalog_frames FOR ALL USING (true);
CREATE POLICY "Service role full access softlens_series" ON softlens_series FOR ALL USING (true);
CREATE POLICY "Service role full access blog_posts" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Service role full access media_files" ON media_files FOR ALL USING (true);
CREATE POLICY "Service role full access website_settings" ON website_settings FOR ALL USING (true);
