-- database-schema.sql

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  type text not null,
  initial_balance numeric default 0,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  type text not null
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  account_id uuid references accounts(id),
  category_id uuid references categories(id),
  type text not null,
  description text,
  amount numeric not null,
  transaction_date date not null,
  notes text,
  recurrence text default 'none'
);

create table investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  invested_amount numeric,
  current_amount numeric
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  target_amount numeric,
  current_amount numeric,
  color text,
  is_active boolean not null default true,
  goal_type text not null default 'manual',
  created_at timestamptz not null default now()
);
