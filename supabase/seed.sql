-- Bolalar Bog'chasi CRM & Telegram Mini App - Test Ma'lumotlari (Seed Data)
-- Yaratilgan sana: 2026-07-13
-- Platforma: Supabase (PostgreSQL)
-- Ushbu skript local Supabase yoki Supabase SQL Editor'da sinov ma'lumotlarini yuklash uchun xizmat qiladi.

-- Pgcrypto extensionini yoqish (agar yoqilmagan bo'lsa, parollarni crypt qilish uchun kerak)
create extension if not exists pgcrypto;

-- 0. Avvalgi test foydalanuvchilarini tozalash (xatolar bo'lmasligi uchun)
delete from auth.identities where user_id in (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'
);

delete from auth.users where id in (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'
);

-- 1. Test Foydalanuvchilarni auth.users jadvaliga to'g'ri qo'shish (Parol: password123)
-- Eslatma: Bu foydalanuvchilar qo'shilishi bilan, on_auth_user_created triggeri ishga tushadi
-- va ularni avtomatik tarzda public.users jadvaliga ham kerakli rollar bilan insert qiladi.
insert into auth.users (
  id, instance_id, aud, role, email, 
  encrypted_password, email_confirmed_at, 
  raw_app_meta_data, raw_user_meta_data, 
  created_at, updated_at
)
values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'admin@bogcha.uz', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Bog''cha Rahbari (Admin)", "role": "ADMIN"}',
    now(),
    now()
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'teacher1@bogcha.uz', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Zuhra Tarbiyachi", "role": "TEACHER"}',
    now(),
    now()
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'parent1@bogcha.uz', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Ali Ota (Aliya otasi)", "role": "PARENT"}',
    now(),
    now()
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'parent2@bogcha.uz', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name": "Vali Ota (Valisher otasi)", "role": "PARENT"}',
    now(),
    now()
  );

-- 2. Test Foydalanuvchilarni auth.identities jadvaliga qo'shish (GoTrue tizimi uchun zarur!)
insert into auth.identities (
  id, user_id, identity_data, provider, 
  provider_id, last_sign_in_at, created_at, updated_at
)
values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "email": "admin@bogcha.uz"}',
    'email',
    'admin@bogcha.uz',
    now(),
    now(),
    now()
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    '{"sub": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "email": "teacher1@bogcha.uz"}',
    'email',
    'teacher1@bogcha.uz',
    now(),
    now(),
    now()
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    '{"sub": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", "email": "parent1@bogcha.uz"}',
    'email',
    'parent1@bogcha.uz',
    now(),
    now(),
    now()
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    '{"sub": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14", "email": "parent2@bogcha.uz"}',
    'email',
    'parent2@bogcha.uz',
    now(),
    now(),
    now()
  );

-- 3. Guruhlarni yaratish
insert into public.groups (id, name, teacher_id)
values
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Kamalak Guruhi', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
on conflict (id) do nothing;

-- 4. Bolalarni yaratish
insert into public.children (id, first_name, last_name, birth_date, parent_id, group_id)
values
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 
    'Aliya', 
    'Alieva', 
    '2021-05-12', 
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', -- parent1 (Ali Ota)
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'  -- Kamalak Guruhi
  ),
  (
    '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 
    'Valisher', 
    'Valiev', 
    '2020-08-20', 
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', -- parent2 (Vali Ota)
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'  -- Kamalak Guruhi
  )
on conflict (id) do nothing;

-- 5. CRM Leads (Landing page'dan yoki ommaviy botdan tushgan arizalar)
insert into public.crm_leads (parent_name, parent_phone, child_name, child_age, status, notes)
values
  ('Umarxo''ja', '+998901234567', 'Jasur', 4, 'NEW', 'O''yinlar va ingliz tili to''garaklari qiziq.'),
  ('Dilnoza', '+998937654321', 'Madina', 3, 'CONTACTED', 'Ertalabki guruhga joylashtirmoqchi bo''lyapti.')
on conflict do nothing;

-- 6. Kunlik Hisobotlar (Daily Logs)
insert into public.daily_logs (child_id, logged_by, date, attended, food_rating, sleep_hours, mood, notes)
values
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', -- Aliya
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- Zuhra Tarbiyachi
    current_date, 
    true, 
    'EXCELLENT', 
    2.0, 
    'Xursand', 
    'Bugun she''r yodladi va rasmni chiroyli chizdi.'
  ),
  (
    '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', -- Valisher
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- Zuhra Tarbiyachi
    current_date, 
    true, 
    'GOOD', 
    1.5, 
    'Sokin', 
    'Biroz injiqlik qildi, lekin ovqatlarini yedi.'
  )
on conflict (child_id, date) do nothing;
