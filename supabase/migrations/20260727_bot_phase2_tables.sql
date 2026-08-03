-- Bolalar Bog'chasi CRM - Telegram Bot 2-Bosqich Migratsiyasi
-- Yaratilgan sana: 2026-07-27

-- 1. BOT MENUS TABLE (Dinamik tugmalar)
create table if not exists public.bot_menus (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    action_type text not null check (action_type in ('TEXT', 'URL', 'FILE')),
    content_value text not null,
    location text not null check (location in ('MAIN_CHAT', 'BROADCAST')),
    order_index integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. APPLICATION QUESTIONS TABLE (Dinamik ariza savollari)
create table if not exists public.application_questions (
    id uuid default gen_random_uuid() primary key,
    question_text text not null,
    order_index integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CHAT SESSIONS TABLE (Live Chat Sessiyalari)
create table if not exists public.chat_sessions (
    id uuid default gen_random_uuid() primary key,
    telegram_id text not null,
    user_name text,
    status text default 'OPEN' check (status in ('OPEN', 'CLOSED')),
    last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists idx_chat_sessions_telegram_id on public.chat_sessions(telegram_id);
create index if not exists idx_chat_sessions_status on public.chat_sessions(status);

-- 4. CHAT MESSAGES TABLE (Live Chat Xabarlari)
create table if not exists public.chat_messages (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.chat_sessions(id) on delete cascade,
    sender_type text not null check (sender_type in ('USER', 'ADMIN')),
    text text not null,
    telegram_message_id bigint,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.chat_messages add column if not exists telegram_message_id bigint;
create index if not exists idx_chat_messages_session_id on public.chat_messages(session_id);

-- 5. APPLICATIONS TABLE (Potensial Mijozlar Arizalari)
create table if not exists public.applications (
    id uuid default gen_random_uuid() primary key,
    telegram_id text not null,
    applicant_name text,
    phone_number text,
    status text default 'NEW' check (status in ('NEW', 'REVIEWED', 'REJECTED', 'ACCEPTED')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. APPLICATION ANSWERS TABLE (Ariza Javoblari)
create table if not exists public.application_answers (
    id uuid default gen_random_uuid() primary key,
    application_id uuid references public.applications(id) on delete cascade,
    question_text text not null,
    answer_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. BROADCASTS TABLE (Ommaviy E'lonlar Arxivi)
create table if not exists public.broadcasts (
    id uuid default gen_random_uuid() primary key,
    text text not null,
    photo_url text,
    video_url text,
    inline_buttons jsonb default '[]'::jsonb,
    sent_count integer default 0,
    failed_count integer default 0,
    recipient_messages jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- RLS POLICIES FOR BOT PHASE 2 TABLES
-- =====================================================================
alter table public.bot_menus enable row level security;
alter table public.application_questions enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.applications enable row level security;
alter table public.application_answers enable row level security;
alter table public.broadcasts enable row level security;

-- Public/Anon access for bot execution (Reads & Insert applications/chat)
create policy "Bot menus are readable by all" on public.bot_menus for select using (true);
create policy "Bot menus editable by admin" on public.bot_menus for all using (true);

create policy "Application questions readable by all" on public.application_questions for select using (true);
create policy "Application questions editable by admin" on public.application_questions for all using (true);

create policy "Chat sessions readable by all" on public.chat_sessions for select using (true);
create policy "Chat sessions editable by all" on public.chat_sessions for all using (true);

create policy "Chat messages readable by all" on public.chat_messages for select using (true);
create policy "Chat messages editable by all" on public.chat_messages for all using (true);

create policy "Applications editable by all" on public.applications for all using (true);
create policy "Application answers editable by all" on public.application_answers for all using (true);

-- Seed initial default questions
insert into public.application_questions (question_text, order_index, is_active)
values 
  ('F.I.SH (Ism va familiyangizni kiriting):', 1, true),
  ('Telefon raqamingizni kiriting (+998XXXXXXXXX):', 2, true),
  ('Farzandingizning yoshi nechada?', 3, true),
  ('Qaysi vaqtdan boshlab bog''chaga berishni rejalashtiryapsiz?', 4, true)
on conflict do nothing;
