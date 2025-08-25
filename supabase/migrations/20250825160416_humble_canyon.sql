/*
  # Kaks Naturals E-Commerce Database Schema

  1. New Tables
    - `profiles` - User profiles with roles (customer, admin, creator)
    - `categories` - Product categories
    - `products` - Product catalog with inventory management
    - `carts` - Shopping cart functionality
    - `cart_items` - Individual cart items
    - `orders` - Order tracking and management
    - `order_items` - Order line items
    - `promo_codes` - Creator promotional codes
    - `analytics_events` - Event tracking for analytics

  2. Security
    - Enable RLS on all tables
    - Role-based access policies for customers, creators, and admins
    - Secure data access patterns

  3. Features
    - User authentication and profiles
    - Product management with categories
    - Shopping cart and checkout flow
    - Order processing and tracking
    - Promo code system with usage tracking
    - Analytics event collection
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'creator', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price decimal(10,2) NOT NULL,
  compare_at_price decimal(10,2),
  category_id uuid REFERENCES categories(id),
  images text[] DEFAULT '{}',
  stock_quantity integer NOT NULL DEFAULT 0,
  sku text UNIQUE,
  weight decimal(8,2),
  featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES profiles(id),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  shipping_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  promo_code_id uuid REFERENCES promo_codes(id),
  stripe_payment_intent_id text,
  billing_address jsonb,
  shipping_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  product_name text NOT NULL,
  product_sku text,
  created_at timestamptz DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value decimal(10,2) NOT NULL,
  min_order_amount decimal(10,2),
  max_discount decimal(10,2),
  usage_limit integer,
  usage_count integer DEFAULT 0,
  creator_id uuid REFERENCES profiles(id),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb,
  user_id uuid REFERENCES profiles(id),
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public USING (status = 'active');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Carts policies
CREATE POLICY "Users can manage own cart"
  ON carts FOR ALL
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE user_id = auth.uid() OR session_id IS NOT NULL
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Promo codes policies
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  TO public USING (status = 'active');

CREATE POLICY "Creators can view own promo codes"
  ON promo_codes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Analytics events policies
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  TO public WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert sample data
INSERT INTO categories (name, slug, description) VALUES
  ('Skincare', 'skincare', 'Premium natural skincare products'),
  ('Wellness', 'wellness', 'Health and wellness essentials'),
  ('Merchandise', 'merchandise', 'Branded lifestyle products');

INSERT INTO products (name, slug, description, price, category_id, images, stock_quantity, featured) VALUES
  ('Natural Glow Serum', 'natural-glow-serum', 'Radiant skin serum with natural ingredients', 49.99, 
   (SELECT id FROM categories WHERE slug = 'skincare'), 
   ARRAY['https://images.pexels.com/photos/4465829/pexels-photo-4465829.jpeg'], 
   50, true),
  ('Hydrating Face Cream', 'hydrating-face-cream', 'Deep moisturizing cream for all skin types', 34.99,
   (SELECT id FROM categories WHERE slug = 'skincare'),
   ARRAY['https://images.pexels.com/photos/4465624/pexels-photo-4465624.jpeg'],
   75, true),
  ('Wellness Tea Blend', 'wellness-tea-blend', 'Organic herbal tea for daily wellness', 24.99,
   (SELECT id FROM categories WHERE slug = 'wellness'),
   ARRAY['https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg'],
   100, false),
  ('Kaks Naturals Tote Bag', 'kaks-tote-bag', 'Eco-friendly cotton tote bag', 19.99,
   (SELECT id FROM categories WHERE slug = 'merchandise'),
   ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
   200, false);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();