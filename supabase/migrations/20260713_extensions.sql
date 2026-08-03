-- Bolalar Bog'chasi CRM & Telegram Mini App - Kengaytirish Migratsiyasi (2-qism)
-- Yaratilgan sana: 2026-07-13
-- Platforma: Supabase (PostgreSQL)
-- Maqsad: Kelgusi Telegram bot, Video striming, QR-davomat va Xavfsizlik bosqichlari uchun bazani tayyorlash.

-- =====================================================================
-- 1. ALTER public.users TABLE (Telegram integratsiyasi uchun)
-- =====================================================================
alter table public.users 
add column if not exists telegram_id bigint unique,
add column if not exists chat_id bigint;

comment on column public.users.telegram_id is 'Telegram foydalanuvchi IDsi (Mini App-ga avtomat kirish uchun).';
comment on column public.users.chat_id is 'Telegram chat IDsi (Bildirishnomalar yuborish uchun).';


-- =====================================================================
-- 2. CREATE public.cameras TABLE (Video kuzatuv tizimi uchun)
-- =====================================================================
create table if not exists public.cameras (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    group_id uuid references public.groups(id) on delete cascade not null,
    stream_path text not null, -- MediaMTX strim yo'li
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.cameras is 'Bog''cha kameralari ro''yxati va ularning oqim yo''llari.';

-- Kameralar uchun indeks
create index if not exists idx_cameras_group on public.cameras(group_id);


-- =====================================================================
-- 3. CREATE public.attendance TABLE (Smart QR-davomat uchun)
-- =====================================================================
create table if not exists public.attendance (
    id uuid default gen_random_uuid() primary key,
    child_id uuid references public.children(id) on delete cascade not null,
    type text not null check (type in ('CHECK_IN', 'CHECK_OUT')),
    verified_by uuid references public.users(id) on delete set null, -- Tasdiqlagan tarbiyachi/admin
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.attendance is 'Bolalarning bog''chaga kelish va ketish davomati (QR-kod orqali tasdiqlangan).';

-- Davomat uchun indekslar
create index if not exists idx_attendance_child on public.attendance(child_id);
create index if not exists idx_attendance_created on public.attendance(created_at);


-- =====================================================================
-- 4. CREATE public.audit_logs TABLE (Tizim Zero-Trust xavfsizlik audit loglari)
-- =====================================================================
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete set null,
    action text not null,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.audit_logs is 'Tizimdagi muhim amallar (kamera ko''rish, login, CRM yuklash) tarixi.';

-- Audit loglar indeksi
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at);


-- =====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR NEW TABLES
-- =====================================================================

-- 5.1. Enable RLS
alter table public.cameras enable row level security;
alter table public.attendance enable row level security;
alter table public.audit_logs enable row level security;

-- 5.2. Policies for public.cameras (Video kameralar)
create policy "Ota-ona faqat o'z farzandining guruhi kamerasini ko'ra oladi"
    on public.cameras for select
    using (group_id in (
        select group_id from public.children where parent_id = auth.uid()
    ));

create policy "Tarbiyachi faqat o'z guruhidagi kameralarni ko'ra oladi"
    on public.cameras for select
    using (public.get_user_role(auth.uid()) = 'TEACHER' and group_id in (
        select id from public.groups where teacher_id = auth.uid()
    ));

create policy "Admin barcha kameralarni ko'ra oladi"
    on public.cameras for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Kameralarni faqat Admin o'zgartira oladi (insert, update, delete)"
    on public.cameras for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 5.3. Policies for public.attendance (QR Davomat)
create policy "Ota-ona faqat o'z farzandining davomatini ko'ra oladi"
    on public.attendance for select
    using (child_id in (
        select id from public.children where parent_id = auth.uid()
    ));

create policy "Tarbiyachi o'z guruhidagi bolalarning davomatini ko'ra oladi"
    on public.attendance for select
    using (public.get_user_role(auth.uid()) = 'TEACHER' and child_id in (
        select id from public.children where group_id in (
            select id from public.groups where teacher_id = auth.uid()
        )
    ));

create policy "Admin barcha davomatlarni ko'ra oladi"
    on public.attendance for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Tarbiyachi va Admin davomat yozuvi qo'sha oladi"
    on public.attendance for insert
    with check (public.get_user_role(auth.uid()) in ('ADMIN', 'TEACHER'));

create policy "Davomat yozuvlarini faqat Admin tahrirlay yoki o'chira oladi"
    on public.attendance for all
    using (public.get_user_role(auth.uid()) = 'ADMIN');

-- 5.4. Policies for public.audit_logs (Audit loglari)
create policy "Audit loglarini faqat Admin ko'ra oladi"
    on public.audit_logs for select
    using (public.get_user_role(auth.uid()) = 'ADMIN');

create policy "Tizim har qanday foydalanuvchi nomidan log yozishi mumkin"
    on public.audit_logs for insert
    with check (true);
