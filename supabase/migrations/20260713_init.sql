-- Bolalar Bog'chasi CRM & Telegram Mini App - Dastlabki Ma'lumotlar Bazasi Migratsiyasi
-- Yaratilgan sana: 2026-07-13
-- Platforma: Supabase (PostgreSQL)

-- =====================================================================
-- 1. EXTENSIONS & SETTINGS
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 2. TABLES CREATION
-- =====================================================================

-- 2.1. public.users (Foydalanuvchilar jadvali - auth.users bilan bog'langan)
create table public.users (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text not null,
    role text not null check (role in ('ADMIN', 'TEACHER', 'PARENT')),
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.users is 'Tizim foydalanuvchilari (adminlar, tarbiyachilar va ota-onalar) profillari.';

-- 2.2. public.groups (Guruhlar jadvali)
create table public.groups (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    teacher_id uuid references public.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.groups is 'Bog''chadagi sinflar/guruhlar va ularga biriktirilgan tarbiyachilar.';

-- 2.3. public.children (Bolalar jadvali)
create table public.children (
    id uuid default gen_random_uuid() primary key,
    first_name text not null,
    last_name text not null,
    birth_date date not null,
    parent_id uuid references public.users(id) on delete cascade not null,
    group_id uuid references public.groups(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.children is 'Bog''cha tarbiyalanuvchilari (bolalar) va ularning ota-onalari hamda guruhlari.';

-- 2.4. public.crm_leads (CRM Arizalar - Potensial mijozlar)
create table public.crm_leads (
    id uuid default gen_random_uuid() primary key,
    parent_name text not null,
    parent_phone text not null,
    child_name text,
    child_age integer check (child_age >= 0 and child_age <= 15),
    status text not null default 'NEW' check (status in ('NEW', 'CONTACTED', 'ACCEPTED', 'REJECTED')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.crm_leads is 'Bog''cha ommaviy veb-saytidan yoki Telegram botdan tushadigan arizalar (leads).';

-- 2.5. public.daily_logs (Kunlik hisobotlar jadvali)
create table public.daily_logs (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references public.children(id) on delete cascade not null,
    logged_by uuid references public.users(id) on delete set null, -- Hisobotni yozgan tarbiyachi
    date date default current_date not null,
    attended boolean default true not null,
    food_rating text check (food_rating in ('POOR', 'GOOD', 'EXCELLENT', 'NONE')),
    sleep_hours numeric(3,1) check (sleep_hours >= 0.0 and sleep_hours <= 10.0),
    mood text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Bir bola uchun bir kunda faqat bitta hisobot bo'lishi kerak
    unique (child_id, date)
);

comment on table public.daily_logs is 'Bolaning kunlik faoliyati, davomati, ovqatlanishi va uxlashi haqida tarbiyachi hisoboti.';


-- =====================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================
create index idx_users_role on public.users(role);
create index idx_groups_teacher on public.groups(teacher_id);
create index idx_children_parent on public.children(parent_id);
create index idx_children_group on public.children(group_id);
create index idx_crm_leads_status on public.crm_leads(status);
create index idx_daily_logs_child_date on public.daily_logs(child_id, date);


-- =====================================================================
-- 4. AUTOMATIC USER SYNC (Trigger auth.users -> public.users)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, full_name, role, phone)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Foydalanuvchi'),
        coalesce(new.raw_user_meta_data->>'role', 'PARENT'),
        coalesce(new.phone, new.raw_user_meta_data->>'phone', '')
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- =====================================================================
-- 5. SECURITY DEFINER FUNCTIONS FOR RLS (To avoid recursion)
-- =====================================================================
create or replace function public.get_user_role(user_id uuid)
returns text as $$
declare
    user_role text;
begin
    select role into user_role from public.users where id = user_id;
    return user_role;
end;
$$ language plpgsql security definer;


-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- 6.1. Enable RLS on all tables
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.children enable row level security;
alter table public.crm_leads enable row level security;
alter table public.daily_logs enable row level security;

-- 6.2. Policies for public.users
create policy "Foydalanuvchilar o'z profillarini ko'ra oladilar"
    on public.users for select
    using (auth.uid() = id);

create policy "Adminlar va Tarbiyachilar barcha profillarni ko'ra oladilar"
    on public.users for select
    using (public.get_user_role(auth.uid()) in ('ADMIN', 'TEACHER'));

create policy "Foydalanuvchilar o'z telefon yoki ismini o'zgartira oladilar"
    on public.users for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "Foydalanuvchilarni faqat Admin yarata yoki o'chira oladi"
    on public.users for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 6.3. Policies for public.groups
create policy "Guruhlarni hamma ko'ra oladi (faollik va ma'lumot uchun)"
    on public.groups for select
    using (true);

create policy "Guruhlarni faqat Admin boshqara oladi (insert, update, delete)"
    on public.groups for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 6.4. Policies for public.children
create policy "Ota-ona faqat o'z farzandlarini ko'ra oladi"
    on public.children for select
    using (auth.uid() = parent_id);

create policy "Tarbiyachi faqat o'z guruhidagi bolalarni ko'ra oladi"
    on public.children for select
    using (public.get_user_role(auth.uid()) = 'TEACHER' and group_id in (
        select id from public.groups where teacher_id = auth.uid()
    ));

create policy "Admin barcha bolalar ma'lumotlarini ko'ra oladi"
    on public.children for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Bolalar ma'lumotlarini faqat Admin tahrirlay oladi"
    on public.children for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 6.5. Policies for public.crm_leads (Ommaviy veb-sayt uchun chunki kirilmaganlar ham ariza tashlay olishi lozim)
create policy "Veb-saytdan istalgan odam ariza qoldira oladi (Ommaviy Insert)"
    on public.crm_leads for insert
    with check (true);

create policy "Arizalarni faqat Admin ko'ra va tahrirlay oladi"
    on public.crm_leads for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 6.6. Policies for public.daily_logs
create policy "Ota-ona faqat o'z farzandining kunlik hisobotlarini ko'ra oladi"
    on public.daily_logs for select
    using (child_id in (
        select id from public.children where parent_id = auth.uid()
    ));

create policy "Tarbiyachi faqat o'z guruhidagi bolalarning kunlik hisobotlarini ko'radi"
    on public.daily_logs for select
    using (public.get_user_role(auth.uid()) = 'TEACHER' and child_id in (
        select id from public.children where group_id in (
            select id from public.groups where teacher_id = auth.uid()
        )
    ));

create policy "Admin barcha kunlik hisobotlarni ko'ra oladi"
    on public.daily_logs for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Tarbiyachi o'z guruhidagi bolalarga hisobot qo'sha va tahrirlay oladi"
    on public.daily_logs for all
    using (
        public.get_user_role(auth.uid()) = 'TEACHER' and child_id in (
            select id from public.children where group_id in (
                select id from public.groups where teacher_id = auth.uid()
            )
        )
    )
    with check (
        public.get_user_role(auth.uid()) = 'TEACHER' and child_id in (
            select id from public.children where group_id in (
                select id from public.groups where teacher_id = auth.uid()
            )
        )
    );

create policy "Admin barcha hisobotlarni tahrirlay oladi"
    on public.daily_logs for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');
