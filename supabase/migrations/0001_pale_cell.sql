/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `login_id` (text, unique)
      - `name` (text)
      - `email` (text)
      - `role` (text)
      - `points` (integer)
      - `avatar_url` (text)
      - `status` (text)
      - `joined_at` (timestamptz)
      - `total_earned` (integer)
      - `last_login` (timestamptz)
      
    - `user_profiles`
      - `user_id` (uuid, foreign key)
      - `phone_number` (text)
      - `address` (text)
      - `birth_date` (date)
      - `bank_name` (text)
      - `branch_name` (text)
      - `account_type` (text)
      - `account_number` (text)
      - `account_holder` (text)
      - `crypto_address` (text)
      - `paypay_id` (text)

    - `point_transactions`
      - `id` (uuid, primary key)
      - `worker_id` (uuid, foreign key)
      - `admin_id` (uuid, foreign key)
      - `amount` (integer)
      - `type` (text)
      - `reason` (text)
      - `created_at` (timestamptz)

    - `withdrawal_requests`
      - `id` (uuid, primary key)
      - `worker_id` (uuid, foreign key)
      - `amount` (integer)
      - `payment_method` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `admin_comment` (text)
      - `processed_at` (timestamptz)
      - `processed_by` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('worker', 'admin')),
  points integer NOT NULL DEFAULT 0,
  avatar_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  total_earned integer NOT NULL DEFAULT 0,
  last_login timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Only admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (role = 'admin');

-- User profiles table
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone_number text,
  address text,
  birth_date date,
  bank_name text,
  branch_name text,
  account_type text CHECK (account_type IN ('普通', '当座')),
  account_number text,
  account_holder text,
  crypto_address text,
  paypay_id text
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Point transactions table
CREATE TABLE point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('add', 'subtract')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON point_transactions
  FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid() OR 
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can create transactions"
  ON point_transactions
  FOR INSERT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Withdrawal requests table
CREATE TABLE withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount >= 1000),
  payment_method text NOT NULL CHECK (payment_method IN ('bank', 'crypto', 'paypay')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_comment text,
  processed_at timestamptz,
  processed_by uuid REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Workers can create requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  USING (
    worker_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'worker')
  );

CREATE POLICY "Only admins can update requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));