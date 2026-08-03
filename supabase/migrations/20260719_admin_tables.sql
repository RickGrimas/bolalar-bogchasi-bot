-- Bolalar Bog'chasi CRM & Telegram Mini App - Admin Panel & CMS Migratsiyasi
-- Yaratilgan sana: 2026-07-19
-- Platforma: Supabase (PostgreSQL)

-- =====================================================================
-- 1. CREATE public.messages TABLE (Shaxsiy va Ommaviy Xabarlar)
-- =====================================================================
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.users(id) on delete set null,
    type text not null check (type in ('GLOBAL', 'GROUP', 'PERSONAL')),
    group_id uuid references public.groups(id) on delete cascade,
    child_id uuid references public.children(id) on delete cascade,
    title text,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.messages is 'Admin va Tarbiyachilar tomonidan yuborilgan ommaviy, guruh yoki shaxsiy xabarlar.';

-- Xabarlar uchun indekslar
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_type on public.messages(type);
create index if not exists idx_messages_group on public.messages(group_id);
create index if not exists idx_messages_child on public.messages(child_id);

-- =====================================================================
-- 2. CREATE public.dynamic_pages TABLE (CMS Sahifalar Kontenti)
-- =====================================================================
create table if not exists public.dynamic_pages (
    id uuid default gen_random_uuid() primary key,
    page_name text not null unique, -- 'home', 'about', 'life', 'ai_assistant', 'help', 'account_home', 'diary', 'tasks', 'cameras', 'profile'
    app_type text not null check (app_type in ('MAIN', 'ACCOUNT')),
    content jsonb not null, -- Format: {"uz": {...}, "ru": {...}}
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.dynamic_pages is 'Veb-sayt va Akkaunt tizimidagi sahifalarning ko''p tilli matnlari va sozlamalari.';

create index if not exists idx_dynamic_pages_name on public.dynamic_pages(page_name);
create index if not exists idx_dynamic_pages_app_type on public.dynamic_pages(app_type);

-- =====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR NEW TABLES
-- =====================================================================

alter table public.messages enable row level security;
alter table public.dynamic_pages enable row level security;

-- 3.1. Policies for public.messages (Xabarlar)
create policy "Adminlar barcha xabarlarni ko'ra oladi"
    on public.messages for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Tarbiyachilar o'ziga tegishli xabarlarni ko'ra oladi"
    on public.messages for select
    using (
        public.get_user_role(auth.uid()) = 'TEACHER' and (
            sender_id = auth.uid() or
            type = 'GLOBAL' or
            (type = 'GROUP' and group_id in (select id from public.groups where teacher_id = auth.uid()))
        )
    );

create policy "Ota-onalar o'zlariga tegishli xabarlarni ko'ra oladi"
    on public.messages for select
    using (
        public.get_user_role(auth.uid()) = 'PARENT' and (
            type = 'GLOBAL' or
            (type = 'GROUP' and group_id in (select group_id from public.children where parent_id = auth.uid())) or
            (type = 'PERSONAL' and child_id in (select id from public.children where parent_id = auth.uid()))
        )
    );

create policy "Adminlar xabar qo'sha oladi"
    on public.messages for insert
    with check (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Tarbiyachilar xabar qo'sha oladi"
    on public.messages for insert
    with check (
        public.get_user_role(auth.uid()) = 'TEACHER' and
        sender_id = auth.uid()
    );

create policy "Xabarlarni faqat Admin tahrirlay yoki o'chira oladi"
    on public.messages for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 3.2. Policies for public.dynamic_pages (Sahifalar kontenti)
create policy "Sahifalarni hamma o'qiy oladi"
    on public.dynamic_pages for select
    using (true);

create policy "Sahifalarni faqat Admin boshqara oladi"
    on public.dynamic_pages for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- =====================================================================
-- 4. SUPABASE STORAGE CONFIGURATION (bogcha-assets bucket)
-- =====================================================================

-- Bucket yaratish (storage.buckets jadvaliga insert qilish orqali)
insert into storage.buckets (id, name, public)
values ('bogcha-assets', 'bogcha-assets', true)
on conflict (id) do nothing;

-- Storage RLS siyosatlari
create policy "Bogcha assets are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'bogcha-assets' );

create policy "Only admin can upload assets"
  on storage.objects for insert
  with check (
    bucket_id = 'bogcha-assets' and
    public.get_user_role(auth.uid()) = 'ADMIN'
  );

create policy "Only admin can update assets"
  on storage.objects for update
  using (
    bucket_id = 'bogcha-assets' and
    public.get_user_role(auth.uid()) = 'ADMIN'
  );

create policy "Only admin can delete assets"
  on storage.objects for delete
  using (
    bucket_id = 'bogcha-assets' and
    public.get_user_role(auth.uid()) = 'ADMIN'
  );
