import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("XATO: .env faylida SUPABASE_URL va SUPABASE_ANON_KEY kiritilishi shart!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const defaultPages = [
  {
    page_name: 'home',
    app_type: 'MAIN',
    content: {
      uz: {
        title: "Porloq Kelajak Shu Yerdan Boshlanadi",
        subtitle: "Farzandingiz xavfsiz, samimiy va ilg'or ta'lim muhitida rivojlanishi uchun zamonaviy bolalar bog'chasi.",
        slides: [
          { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop", caption: "Zamonaviy va shinam dars xonalari" },
          { url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop", caption: "Erkin va xavfsiz o'yin maydonchasi" },
          { url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop", caption: "Sog'lomlashtirish va suv chiniqtirish g'oyasi" },
          { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop", caption: "Ijodiy fikrlash va tasviriy san'at to'garaklari" }
        ],
        goal: {
          title: "Bog'cha Maqsadi",
          desc: "Bizning bosh maqsadimiz — bolalarning mustaqil fikrlash qobiliyatini rivojlantirish, ularni ijodiy va mantiqiy fikrlashga o'rgatish hamda boshlang'ich maktab ta'limiga yuqori darajada tayyorlashdir.",
          image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop"
        },
        info: {
          title: "Umumiy Ma'lumotlar",
          image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop",
          items: [
            "Guruhlar soni: 8 ta (3 yoshdan 6 yoshgacha)",
            "Mashg'ulotlar: STEM, mental arifmetika, ingliz va rus tillari",
            "Xavfsizlik: 24/7 qorovul va jonli videokuzatuv tizimi"
          ]
        },
        news_title: "Yangiliklar",
        news: [
          { title: "Yozgi Sog'lomlashtirish", desc: "Yoz faslida bolajonlarimiz uchun maxsus chiniqtirish va suzish mashg'ulotlari ko'paytiriladi.", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=200&auto=format&fit=crop" },
          { title: "STEM Xonasi Yangilandi", desc: "Yangi dars yili uchun eng so'nggi rusumdagi intellektual o'yinchoqlar keltirildi.", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=200&auto=format&fit=crop" }
        ]
      },
      ru: {
        title: "Светлое будущее начинается здесь",
        subtitle: "Современный детский сад для безопасного, теплого и передового развития вашего ребенка.",
        slides: [
          { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=600&auto=format&fit=crop", caption: "Современные и уютные учебные классы" },
          { url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop", caption: "Свободная и безопасная игровая площадка" },
          { url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop", caption: "Концепция оздоровления и водного закаливания" },
          { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop", caption: "Кружки творческого мышления и изобразительного искусства" }
        ],
        goal: {
          title: "Цель детского сада",
          desc: "Наша главная цель — развитие навыков самостоятельного мышления детей, обучение их творческому и логическому мышлению, а также высокий уровень подготовки к начальной школе.",
          image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop"
        },
        info: {
          title: "Общая информация",
          image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop",
          items: [
            "Количество групп: 8 (от 3 до 6 лет)",
            "Занятия: STEM, ментальная арифметика, английский и русский языки",
            "Безопасность: 24/7 охрана и система живого видеонаблюдения"
          ]
        },
        news_title: "Новости",
        news: [
          { title: "Летнее оздоровление", desc: "В летний сезон для наших детей проводятся специальные занятия по закаливанию и плаванию.", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=200&auto=format&fit=crop" },
          { title: "Обновление кабинета STEM", desc: "К новому учебному году завезены новейшие интеллектуальные игрушки.", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=200&auto=format&fit=crop" }
        ]
      }
    }
  },
  {
    page_name: 'life',
    app_type: 'MAIN',
    content: {
      uz: {
        title: "Bog'cha hayoti",
        subtitle: "Bolajonlarimizning qiziqarli kunlik faoliyati va tezkor e'lonlar.",
        alert_title: "Tezkor E'lonlar",
        announcements: [
          { date: "15-Iyun", text: "Yozgi to'garaklarimiz boshlandi! Ingliz tili va karate to'garaklariga yozilish qizg'in davom etmoqda." },
          { date: "10-Iyun", text: "Bog'chamizda shifokor nazorati ostida haftalik chiniqtirish darslari boshlandi." }
        ],
        act_title: "Bizning Faoliyatlarimiz",
        activities: [
          { title: "Suv o'yinlari va chiniqish", desc: "Mini hovuzimizda bolajonlar yoz kunlari chiniqishadi va suzish asoslarini o'rganishadi.", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop" },
          { title: "Lego intellektual o'yinlari", desc: "Lego konstruktorlari orqali bolalarning fazoviy tasavvuri va mantiqiy fikrlashi rivojlantiriladi.", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop" },
          { title: "Ijodiy rasm chizish darslari", desc: "Turli xil ranglar, barmoq bo'yoqlari va loy orqali bolalar o'z ijod mahsullarini yaratadilar.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop" }
        ]
      },
      ru: {
        title: "Жизнь сада",
        subtitle: "Интересные ежедневные занятия и мероприятия наших детей.",
        alert_title: "Важное объявление",
        announcements: [
          { date: "15 Июня", text: "Начались наши летние кружки! Активно идет запись на английский язык и карате." },
          { date: "10 Июня", text: "В нашем саду под наблюдением врача начались еженедельные занятия по закаливанию." }
        ],
        act_title: "Наши занятия",
        activities: [
          { title: "Водные игры и закаливание", desc: "В летние дни дети закаляются в мини-бассейне и учатся основам плавания.", image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop" },
          { title: "Интеллектуальные игры Лего", desc: "С помощью конструкторов Лего развивается пространственное и логическое мышление детей.", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop" },
          { title: "Уроки рисования", desc: "С помощью различных красок, пальчиковых красок и пластилина дети создают свои поделки.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop" }
        ]
      }
    }
  },
  {
    page_name: 'about',
    app_type: 'MAIN',
    content: {
      uz: {
        title: "Biz Haqimizda",
        subtitle: "Konsepsiya, qadriyatlar, sharoitlar va qabul qoidalari.",
        stats: [
          { val: "150+", lbl: "Bolajonlar" },
          { val: "12 ta", lbl: "Tarbiyachilar" },
          { val: "5 yillik", lbl: "Tajriba" }
        ],
        sections: [
          { title: "Bog'cha Konsepsiyasi & Qadriyatlari", desc: "Biz bolaning ruhiy, aqliy va jismoniy rivojlanishini uyg'unlikda olib boramiz. Mehr-shafqat, o'zaro yordam va shaxsiy erkinlik bizning bosh qadriyatimizdir." },
          { title: "Qabul va Yosh Chegaralari", desc: "Bog'chamizga 3 yoshdan 6 yoshgacha bo'lgan bolalar qabul qilinadi. Bolalar yosh guruhlari bo'yicha mos ravishda ajratiladi." },
          { title: "Ta'lim Dasturi (STEM)", desc: "Darslarimiz xalqaro STEM standartlariga to'liq mos keladi. Mental arifmetika, ingliz tili, rus tili va mantiqiy o'yinlar o'rganiladi." },
          { title: "Shart-sharoitlar & Binomiz", desc: "Shinam guruh xonalari, yozgi mini-hovuz, keng o'yin hovlisi va maxsus lego to'garak xonalari bolalar ixtiyorida." },
          { title: "Qonun-qoidalar & Kun tartibi", desc: "Bog'chamiz 08:00 dan 18:00 gacha ishlaydi. Bolalar faqat ota-onalari yoki ishonchli shaxslar (QR-kod orqali) tomonidan olib ketiladi." },
          { title: "Oylik To'lov", desc: "Oylik to'lov 2,000,000 so'm bo'lib, unga barcha darslar, to'garaklar, 4 mahal tabiiy taom va shifokor nazorati to'liq kiradi." }
        ],
        team_title: "Bog'cha jamoasi",
        team_subtitle: "Bizning ahil va professional jamoamiz bilan tanishing.",
        team: [
          { name: "Malika Rahimova", role: "Bog'cha mudirasi (Director)", desc: "12 yillik pedagogik va boshqaruv tajribasiga ega oliy toifali mutaxassis. Muassasa rivoji va xavfsizligini ta'minlaydi." },
          { name: "Jahongir Alimov", role: "Ingliz tili o'qituvchisi", desc: "Zamonaviy o'yin va musiqa metodikasi orqali bolalarga ingliz tilini qiziqarli va oson tarzda o'rgatadi." },
          { name: "Elena Petrova", role: "Katta tarbiyachi", desc: "Bolajonlarning kunlik tarbiyaviy mashg'ulotlari, rejim va adaptatsiya jarayonlarini boshqaradi." },
          { name: "Dilnoza Olimova", role: "Musiqa va san'at o'qituvchisi", desc: "Bolalarda estetika va ritm tuyg'ularini rivojlantiradi, bayramlar va qo'shiq kechalarini tashkil etadi." }
        ]
      },
      ru: {
        title: "О нас",
        subtitle: "Концепция, ценности, условия и правила приема.",
        stats: [
          { val: "150+", lbl: "Детей" },
          { val: "12", lbl: "Воспитателей" },
          { val: "5 лет", lbl: "Опыта" }
        ],
        sections: [
          { title: "Концепция и ценности сада", desc: "Мы гармонично развиваем душевную, умственную и физическую стороны ребенка. Милосердие, взаимопомощь и личная свобода — наши главные ценности." },
          { title: "Прием и возрастные ограничения", desc: "В наш сад принимаются дети от 3 до 6 лет. Дети распределяются по возрастным группам." },
          { title: "Программа обучения (STEM)", desc: "Наши уроки полностью соответствуют международным стандартам STEM. Ментальная арифметика, английский и русский языки изучаются в игровой форме." },
          { title: "Условия и наше здание", desc: "Уютные групповые комнаты, летний мини-бассейн, просторный игровой двор и специальные залы для лего в распоряжении детей." },
          { title: "Правила и распорядок дня", desc: "Наш сад работает с 08:00 до 18:00. Детей могут забирать только родители или доверенные лица (по QR-коду)." },
          { title: "Ежемесячная оплата", desc: "Ежемесячная оплата составляет 2 000 000 сумов, включая все уроки, кружки, 4-разовое натуральное питание и медицинский контроль." }
        ],
        team_title: "Наша команда",
        team_subtitle: "Познакомьтесь с нашим дружным и профессиональным коллективом.",
        team: [
          { name: "Малика Рахимова", role: "Заведующая детским садом", desc: "Специалист высшей категории с 12-летним педагогическим и управленческим опытом. Обеспечивает развитие и безопасность учреждения." },
          { name: "Жахонгир Алимов", role: "Учитель английского языка", desc: "Обучает детей английскому языку в игровой и увлекательной форме по современным методикам." },
          { name: "Елена Петрова", role: "Старший воспитатель", desc: "Курирует ежедневные развивающие занятия, режим дня и процессы адаптации детей." },
          { name: "Дильноза Олимова", role: "Учитель музыки и искусства", desc: "Развивает у детей чувство эстетики и ритма, организует праздники и хоровые выступления." }
        ]
      }
    }
  },
  {
    page_name: 'help',
    app_type: 'MAIN',
    content: {
      uz: {
        title: "Yordam sahifasi",
        subtitle: "Tez-tez beriladigan savollar va nosozliklarni ma'lum qilish.",
        faq_title: "Ko'p beriladigan savollar",
        faq: [
          { q: "Bog'chaga bolalarni qabul qilish qachon boshlanadi?", a: "Qabul yil davomida bo'sh o'rinlar mavjudligiga qarab amalga oshiriladi." },
          { q: "Bola kasal bo'lib qolsa, to'lov qayta hisoblanadimi?", a: "Ha, shifokor ma'lumotnomasi taqdim etilganda, ovqatlanish puli kelgusi oyga qayta hisob-kitob qilinadi." },
          { q: "Bog'chada tibbiy nazorat qanday tashkil etilgan?", a: "Bog'chamizda doimiy pediatr va hamshira faoliyat olib boradi. Har kuni ertalab bolalar tekshiriladi." }
        ],
        report_title: "Kamchilik / Xatolik haqida xabar berish"
      },
      ru: {
        title: "Помощь",
        subtitle: "Часто задаваемые вопросы и отправка отчетов об ошибках.",
        faq_title: "Часто задаваемые вопросы",
        faq: [
          { q: "Когда начинается прием детей в детский сад?", a: "Прием ведется в течение всего года в зависимости от наличия свободных мест." },
          { q: "Пересчитывается ли оплата, если ребенок заболел?", a: "Да, при предоставлении медицинской справки плата за питание пересчитывается на следующий месяц." },
          { q: "Как организован медицинский контроль в саду?", a: "В нашем саду постоянно работают педиатр и медсестра. Проверка детей проводится каждое утро." }
        ],
        report_title: "Сообщить о недостатке / ошибке"
      }
    }
  }
];

async function seed() {
  console.log("=== DINAMIK CMS SAHIFALARINI SEED QILISH ===");
  
  // Admin sifatida login qilish
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@bogcha.uz',
    password: 'password123'
  });

  if (authError) {
    console.error("Xato: Admin tizimga kira olmadi. Seed qilinmadi.", authError.message);
    return;
  }

  for (const page of defaultPages) {
    const { error } = await supabase
      .from('dynamic_pages')
      .upsert([page], { onConflict: 'page_name' });

    if (error) {
      console.error(`❌ '${page.page_name}' sahifasini seed qilishda xato:`, error.message);
    } else {
      console.log(`✅ '${page.page_name}' sahifasi muvaffaqiyatli seed qilindi.`);
    }
  }

  await supabase.auth.signOut();
  console.log("=== SEED YAKUNLANDI ===");
}

seed().catch(console.error);
