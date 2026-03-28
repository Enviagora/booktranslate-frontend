/*
  # Initial Schema for Translation Management System

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User ID from auth.users
      - `email` (text) - User email
      - `full_name` (text) - User full name
      - `role` (text) - User role (admin or user)
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `translations`
      - `id` (uuid, primary key) - Translation job ID
      - `user_id` (uuid, foreign key) - User who created the translation
      - `original_filename` (text) - Original file name
      - `source_language` (text) - Source language code
      - `target_language` (text) - Target language code
      - `status` (text) - Translation status (pending, processing, completed, error)
      - `file_url` (text) - URL to the original file
      - `translated_file_url` (text, nullable) - URL to translated file
      - `progress` (integer) - Translation progress percentage (0-100)
      - `error_message` (text, nullable) - Error message if status is error
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Users can view and update their own profile
    - Users can view their own translations
    - Users can create new translations
    - Admins can view all data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  source_language text NOT NULL DEFAULT 'en',
  target_language text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  file_url text NOT NULL,
  translated_file_url text,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Translations table policies
CREATE POLICY "Users can view own translations"
  ON translations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create translations"
  ON translations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translations"
  ON translations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all translations"
  ON translations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all translations"
  ON translations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_status ON translations(status);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();