---
name: system-security-expert
description: Tizimda Zero-Trust modeli, ma'lumotlarni shifrlash va himoyani ta'minlash bo'yicha AI qoidalari.
---

# Tizim Xavfsizligi Qoidalari (Top 10 GitHub Texnologiyalari)

Ushbu skill eng nozik ma'lumotlar (bolalar yuzi, ismlari, kameralar) bilan ishlovchi tizim xavfsizligini ta'minlashga yo'naltirilgan.

## Top 10 GitHub Vositalari & Qoidalar
1. **Zero-Trust Architecture** - Hech qaysi foydalanuvchi yoki so'rov oldindan ishonchli deb hisoblanmaydi. Har bir harakat tasdiqlanadi.
2. **Helmet.js** - Express/Node.js ilovalari uchun HTTP sarlavhalarini (Headers) himoyalash.
3. **CORS Configuration** - Cross-Origin Resource Sharing faqat ruxsat etilgan domenlar (Telegram Web App) uchun ochilishi shart.
4. **express-rate-limit / redis-rate-limit** - DDoS va Brute Force hujumlaridan himoyalash, so'rovlar limitini o'rnatish.
5. **jsonwebtoken (JWT)** - Qisqa umr ko'ruvchi xavfsiz tokenni sign qilish va tekshirish (RS256 yoki HS256).
6. **bcryptjs / argon2** - Parollar yoki maxfiy kalitlarni tuzlash (Salt) va kuchli hashing.
7. **crypto (Node builtin) / cryptography (Python)** - Shaxsiy ma'lumotlarni bazada saqlashdan oldin AES-256-GCM algoritmi bilan shifrlash.
8. **OWASP Top 10 Guidelines** - SQL Injection, XSS, CSRF kabi zaifliklarga qarshi standart xavfsizlik amaliyotlari.
9. **Certbot (Let's Encrypt)** - Barcha tarmoq trafigini TLS 1.3/HTTPS orqali shifrlangan holatda yuborish.
10. **Snyk / npm audit** - Foydalanilayotgan kutubxonalardagi mavjud xavfsizlik tuynuklarini avtomatik tekshirish.

## AI Agentiga Ko'rsatma
Har qanday fayl (ayniqsa, bazaga ulanish, API Gateway routerlari) ustida ishlayotganda xavfsizlik birinchi o'ringa chiqishi kerak. `initData` hmac-sha256 orqali validatsiya qilinmagunicha, API endpointlar ishlamasligi shart. WebRTC va MediaMTX so'rovlari JWT orqali autorizatsiyadan o'tishini ta'minlang.
