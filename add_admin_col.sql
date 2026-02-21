-- Add the is_admin column to the existing profiles table
alter table profiles 
add column if not exists is_admin boolean default false;
