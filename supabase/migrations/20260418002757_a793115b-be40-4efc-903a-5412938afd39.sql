-- 1) Enum for roles
create type public.app_role as enum ('admin', 'user');

-- 2) user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- 3) security definer
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 4) RLS policies for user_roles
create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 5) Auto-promote admin email on signup
create or replace function public.handle_new_user_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'koradesignltd@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_admin
  after insert on auth.users
  for each row execute function public.handle_new_user_admin();

-- 6) Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_frw integer not null default 0,
  image_url text not null,
  category text not null,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins insert products"
  on public.products for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update products"
  on public.products for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete products"
  on public.products for delete
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

create index products_category_idx on public.products(category);
create index products_is_new_idx on public.products(is_new) where is_new;

-- 7) Storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));