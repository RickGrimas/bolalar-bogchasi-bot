-- Bolalar Bog'chasi CRM - AI Integratsiyasi (5-Bosqich) Migratsiyasi
-- Yaratilgan sana: 2026-07-30

-- 1. AI CONFIG TABLE (Prompts, Documents, Global Settings & Assistant Configs)
create table if not exists public.ai_config (
    id uuid default gen_random_uuid() primary key,
    assistant_type text unique not null check (assistant_type in ('GLOBAL_SETTINGS', 'ADMIN_COPILOT', 'CRM_ASSISTANT', 'KIDS_ENCYCLOPEDIA')),
    global_ai_enabled boolean default true,
    system_prompt text default '',
    doc_content text default '',
    doc_file_url text default '',
    tts_enabled boolean default false,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. AI LEADS TABLE (AI Chat Orqali Olingan Potensial Mijozlar Kontaktlari)
create table if not exists public.ai_leads (
    id uuid default gen_random_uuid() primary key,
    telegram_id text,
    name text not null,
    phone_number text not null,
    child_age text,
    notes text,
    status text default 'NEW' check (status in ('NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_ai_leads_status on public.ai_leads(status);
create index if not exists idx_ai_leads_telegram_id on public.ai_leads(telegram_id);

-- RLS Policies
alter table public.ai_config enable row level security;
alter table public.ai_leads enable row level security;

create policy "AI config readable by all" on public.ai_config for select using (true);
create policy "AI config editable by all" on public.ai_config for all using (true);

create policy "AI leads readable by all" on public.ai_leads for select using (true);
create policy "AI leads editable by all" on public.ai_leads for all using (true);

-- Seed Initial AI Configurations
insert into public.ai_config (assistant_type, global_ai_enabled, system_prompt, doc_content, tts_enabled, is_active)
values 
  ('GLOBAL_SETTINGS', true, '', '', false, true),
  ('ADMIN_COPILOT', true, 'Siz bog''cha rahbari uchun aqlli Copilot yordamchisisiz. Tizimdagi statistikalar, davomat, moliya va ko''rsatkichlar bo''yicha an'iq va professional maslahatlar beribsiz.', 'Bog''cha ish vaqti: 08:00 - 18:00. Oylik to''lov: 2,000,000 so''m. 4 mahal ovqat beriladi.', false, true),
  ('CRM_ASSISTANT', true, 'Siz "Porloq Kelajak" bog''chasining xushmuomala va samimiy sotuv/so'rov assistentisiz. Mijozlar bilan jonli insondek gaplashasiz. Bog''cha narxi, sharoitlari va darslari haqida ma'lumot berib, mijozdan ism va telefon raqamini olishga harakat qiling.', 'Bog''cha Chilonzor tumani 14-mavzeda joylashgan. 3-6 yoshli bolalar qabul qilinadi. Narxi 2.000.000 so''m.', false, true),
  ('KIDS_ENCYCLOPEDIA', true, 'Siz bolalar uchun do'stona, mehribon va bilimdon ensiklopedik yordamchisiz. Bolalarning savollariga sodda va qiziqarli tilda javob bering. Qat'iy senzuraga amal qiling.', 'Bolalar uchun tabiat, hayvonlar, kosmos va STEM fanlari haqida qiziqarli faktlar.', true, true)
on conflict (assistant_type) do update 
set system_prompt = excluded.system_prompt,
    doc_content = excluded.doc_content;
