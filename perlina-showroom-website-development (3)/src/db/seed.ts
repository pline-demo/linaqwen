import { db, pool } from "./index";
import {
  roles, permissions, rolePermissions, users, userRoles,
  settings, store, collections, subcollections, products, productImages,
  applications, applicationImages, homepageSections, menus, menuItems, seo
} from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding PERLINA database...");

  // ─── ROLES ───
  const [superAdminRole] = await db.insert(roles).values({
    name: "Süper Yönetici", slug: "super-admin", description: "Tüm yetkilere sahip yönetici", isSystem: true
  }).returning();
  const [adminRole] = await db.insert(roles).values({
    name: "Yönetici", slug: "admin", description: "Genel yönetici", isSystem: true
  }).returning();
  const [editorRole] = await db.insert(roles).values({
    name: "Editör", slug: "editor", description: "İçerik editörü", isSystem: false
  }).returning();

  // ─── PERMISSIONS ───
  const permList = [
    { name: "Panel Görüntüleme", slug: "dashboard.view", group: "Panel" },
    { name: "Koleksiyonları Görüntüle", slug: "collections.view", group: "Koleksiyonlar" },
    { name: "Koleksiyon Oluştur", slug: "collections.create", group: "Koleksiyonlar" },
    { name: "Koleksiyon Düzenle", slug: "collections.edit", group: "Koleksiyonlar" },
    { name: "Koleksiyon Sil", slug: "collections.delete", group: "Koleksiyonlar" },
    { name: "Alt Koleksiyonları Görüntüle", slug: "subcollections.view", group: "Alt Koleksiyonlar" },
    { name: "Alt Koleksiyon Oluştur", slug: "subcollections.create", group: "Alt Koleksiyonlar" },
    { name: "Alt Koleksiyon Düzenle", slug: "subcollections.edit", group: "Alt Koleksiyonlar" },
    { name: "Alt Koleksiyon Sil", slug: "subcollections.delete", group: "Alt Koleksiyonlar" },
    { name: "Ürünleri Görüntüle", slug: "products.view", group: "Ürünler" },
    { name: "Ürün Oluştur", slug: "products.create", group: "Ürünler" },
    { name: "Ürün Düzenle", slug: "products.edit", group: "Ürünler" },
    { name: "Ürün Sil", slug: "products.delete", group: "Ürünler" },
    { name: "Uygulamaları Görüntüle", slug: "applications.view", group: "Uygulamalar" },
    { name: "Uygulama Oluştur", slug: "applications.create", group: "Uygulamalar" },
    { name: "Uygulama Düzenle", slug: "applications.edit", group: "Uygulamalar" },
    { name: "Uygulama Sil", slug: "applications.delete", group: "Uygulamalar" },
    { name: "Medya Görüntüle", slug: "media.view", group: "Medya" },
    { name: "Medya Yükle", slug: "media.upload", group: "Medya" },
    { name: "Medya Sil", slug: "media.delete", group: "Medya" },
    { name: "Ana Sayfa Yönet", slug: "homepage.manage", group: "Ana Sayfa" },
    { name: "Mağaza Yönet", slug: "store.manage", group: "Mağaza" },
    { name: "İletişim Talepleri Görüntüle", slug: "contact_requests.view", group: "İletişim" },
    { name: "İletişim Talepleri Yönet", slug: "contact_requests.manage", group: "İletişim" },
    { name: "SEO Yönet", slug: "seo.manage", group: "SEO" },
    { name: "Menü Yönet", slug: "menus.manage", group: "Menüler" },
    { name: "Ayarlar Yönet", slug: "settings.manage", group: "Ayarlar" },
    { name: "Yöneticileri Görüntüle", slug: "admins.view", group: "Yöneticiler" },
    { name: "Yönetici Oluştur", slug: "admins.create", group: "Yöneticiler" },
    { name: "Yönetici Düzenle", slug: "admins.edit", group: "Yöneticiler" },
    { name: "Yönetici Devre Dışı Bırak", slug: "admins.disable", group: "Yöneticiler" },
    { name: "Yönetici Şifre Değiştir", slug: "admins.password", group: "Yöneticiler" },
    { name: "Logları Görüntüle", slug: "logs.view", group: "Loglar" },
    { name: "Yedekleme", slug: "system.backup", group: "Sistem" },
    { name: "Bakım Modu", slug: "system.maintenance", group: "Sistem" },
  ];

  const insertedPerms = await db.insert(permissions).values(permList).returning();

  // Give all permissions to super admin and admin roles
  for (const role of [superAdminRole, adminRole]) {
    for (const perm of insertedPerms) {
      await db.insert(rolePermissions).values({ roleId: role.id, permissionId: perm.id });
    }
  }
  // Editor gets limited perms
  const editorPermSlugs = [
    "dashboard.view", "collections.view", "subcollections.view",
    "products.view", "products.create", "products.edit",
    "applications.view", "applications.create", "applications.edit",
    "media.view", "media.upload", "contact_requests.view"
  ];
  for (const perm of insertedPerms) {
    if (editorPermSlugs.includes(perm.slug)) {
      await db.insert(rolePermissions).values({ roleId: editorRole.id, permissionId: perm.id });
    }
  }

  // ─── USERS ───
  const superHash = await bcrypt.hash("cihan0691", 12);
  const adminHash = await bcrypt.hash("perlinalog", 12);

  const [superUser] = await db.insert(users).values({
    username: "perlinacihan", email: "cihan@perlina.com.tr",
    passwordHash: superHash, fullName: "Cihan (Süper Yönetici)",
    status: "active", isSuperAdmin: true
  }).returning();

  const [adminUser] = await db.insert(users).values({
    username: "@perlinaadmin", email: "admin@perlina.com.tr",
    passwordHash: adminHash, fullName: "Perlina Yönetici",
    status: "active", isSuperAdmin: false
  }).returning();

  await db.insert(userRoles).values({ userId: superUser.id, roleId: superAdminRole.id });
  await db.insert(userRoles).values({ userId: adminUser.id, roleId: adminRole.id });

  // ─── SETTINGS ───
  const settingsData = [
    { key: "site_name", value: "PERLINA", group: "general" },
    { key: "site_description", value: "Premium Perde & Stor Showroom", group: "general" },
    { key: "phone", value: "+90 212 555 0000", group: "contact" },
    { key: "whatsapp", value: "905325550000", group: "contact" },
    { key: "email", value: "info@perlina.com.tr", group: "contact" },
    { key: "address", value: "Masko Mobilyacılar Sitesi, İkitelli OSB, Başakşehir/İstanbul", group: "contact" },
    { key: "instagram", value: "https://instagram.com/perlina", group: "social" },
    { key: "facebook", value: "https://facebook.com/perlina", group: "social" },
    { key: "admin_route", value: "cmyonetim-x7p9", group: "system" },
    { key: "maintenance_mode", value: "false", group: "system" },
    { key: "default_seo_title", value: "PERLINA | Premium Perde & Stor Showroom", group: "seo" },
    { key: "default_meta_description", value: "Tül perde, fon perde, stor perde, zebra perde, jaluzi ve plise çözümleri ile premium showroom deneyimi.", group: "seo" },
  ];
  await db.insert(settings).values(settingsData);

  // ─── STORE ───
  await db.insert(store).values({
    name: "PERLINA Showroom",
    address: "Masko Mobilyacılar Sitesi, 4. Cadde No:12, İkitelli OSB, Başakşehir/İstanbul",
    phone: "+90 212 555 0000",
    whatsapp: "905325550000",
    email: "info@perlina.com.tr",
    workingHours: "Pazartesi - Cumartesi: 09:00 - 19:00\nPazar: Kapalı",
    mapLat: "41.0668",
    mapLng: "28.7936",
    mapZoom: 15,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.5!2d28.7936!3d41.0668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA0JzAwLjUiTiAyOMKwNDcnMzYuOSJF!5e0!3m2!1str!2str!4v1234567890",
    description: "PERLINA, İstanbul'un en prestijli perde ve stor showroom'udur. 500 m² showroom alanımızda, en yeni koleksiyonlarımızı ve profesyonel danışmanlık hizmetimizi deneyimleyin."
  });

  // ─── COLLECTIONS ───
  const colData = [
    { name: "Tül Perde", slug: "tul-perde", shortDescription: "Zarif ve modern tül perde koleksiyonumuz ile mekanlarınıza ışık ve şıklık katın.", featured: true, sortOrder: 1 },
    { name: "Fon Perde", slug: "fon-perde", shortDescription: "Premium kumaş seçenekleri ile fon perde koleksiyonumuz, mekanlarınıza sıcaklık ve karakter kazandırır.", featured: true, sortOrder: 2 },
    { name: "Stor Perde", slug: "stor-perde", shortDescription: "Modern ve fonksiyonel stor perde çözümleri ile alanlarınızı dönüştürün.", featured: true, sortOrder: 3 },
    { name: "Zebra Perde", slug: "zebra-perde", shortDescription: "Işık kontrolü ve estetik tasarımı bir arada sunan zebra perde koleksiyonumuz.", featured: true, sortOrder: 4 },
    { name: "Jaluzi", slug: "jaluzi", shortDescription: "Ahşap ve alüminyum jaluzi seçenekleri ile pencerelerinize değer katın.", featured: false, sortOrder: 5 },
    { name: "Plise", slug: "plise", shortDescription: "Plise perde sistemleri ile farklı pencere formlarına uyum sağlayan şık çözümler.", featured: false, sortOrder: 6 },
    { name: "Dikey Perde", slug: "dikey-perde", shortDescription: "Ofis ve geniş cam yüzeyler için ideal dikey perde sistemleri.", featured: false, sortOrder: 7 },
  ];
  const insertedCols = await db.insert(collections).values(colData).returning();

  // ─── SUBCOLLECTIONS ───
  const subData: Array<{ collectionId: number; name: string; slug: string; description: string; sortOrder: number; featured?: boolean }> = [];

  const tulPerde = insertedCols.find(c => c.slug === "tul-perde")!;
  const fonPerde = insertedCols.find(c => c.slug === "fon-perde")!;
  const storPerde = insertedCols.find(c => c.slug === "stor-perde")!;
  const zebraPerde = insertedCols.find(c => c.slug === "zebra-perde")!;

  subData.push(
    { collectionId: tulPerde.id, name: "Modern Tül", slug: "modern-tul", description: "Çağdaş çizgiler ve sade şıklık sunan modern tül perde modelleri.", sortOrder: 1, featured: true },
    { collectionId: tulPerde.id, name: "Klasik Tül", slug: "klasik-tul", description: "Zamanın ötesinde bir zarafet sunan klasik tül perde tasarımları.", sortOrder: 2 },
    { collectionId: tulPerde.id, name: "Desenli Tül", slug: "desenli-tul", description: "Özel desen ve işlemeler ile fark yaratan tül perde koleksiyonu.", sortOrder: 3, featured: true },
    { collectionId: tulPerde.id, name: "Lazer Kesim Tül", slug: "lazer-kesim-tul", description: "Hassas lazer kesim teknolojisi ile üretilen modern tül perdeler.", sortOrder: 4 },
    { collectionId: fonPerde.id, name: "Kadife Fon", slug: "kadife-fon", description: "Lüks kadife kumaşlarla üretilen premium fon perde koleksiyonu.", sortOrder: 1, featured: true },
    { collectionId: fonPerde.id, name: "Blackout Fon", slug: "blackout-fon", description: "Tam karartma sağlayan blackout fon perde çözümleri.", sortOrder: 2, featured: true },
    { collectionId: fonPerde.id, name: "Keten Fon", slug: "keten-fon", description: "Doğal keten dokusu ile sıcak ve samimi mekanlar yaratın.", sortOrder: 3 },
    { collectionId: storPerde.id, name: "Düz Stor", slug: "duz-stor", description: "Minimalist ve şık düz stor perde modelleri.", sortOrder: 1 },
    { collectionId: storPerde.id, name: "Baskılı Stor", slug: "baskili-stor", description: "Özel baskı ve desenlere sahip stor perde koleksiyonu.", sortOrder: 2 },
    { collectionId: zebraPerde.id, name: "Klasik Zebra", slug: "klasik-zebra", description: "Geleneksel zebra perde modelleri ile ışık kontrolü.", sortOrder: 1 },
    { collectionId: zebraPerde.id, name: "Pliseli Zebra", slug: "pliseli-zebra", description: "Plise detaylarla zenginleştirilmiş zebra perde tasarımları.", sortOrder: 2 },
  );
  const insertedSubs = await db.insert(subcollections).values(subData).returning();

  // ─── PRODUCTS ───
  const prodData = [
    { name: "Aria Modern Tül Perde", slug: "aria-modern-tul-perde", shortDescription: "Hafif dokusu ve modern çizgileri ile mekanlarınıza ferahlık katan premium tül perde.", collectionId: tulPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "modern-tul")?.id, featured: true, sortOrder: 1 },
    { name: "Luna Desenli Tül Perde", slug: "luna-desenli-tul-perde", shortDescription: "Zarif desenleri ile dikkat çeken, ışığı süzülerek geçiren özel tasarım tül perde.", collectionId: tulPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "desenli-tul")?.id, featured: true, sortOrder: 2 },
    { name: "Elegance Kadife Fon Perde", slug: "elegance-kadife-fon-perde", shortDescription: "Zengin kadife dokusu ile premium yaşam alanları için tasarlanmış fon perde.", collectionId: fonPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "kadife-fon")?.id, featured: true, sortOrder: 3 },
    { name: "Noir Blackout Fon Perde", slug: "noir-blackout-fon-perde", shortDescription: "Tam karartma özelliği ile yatak odaları için ideal blackout fon perde.", collectionId: fonPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "blackout-fon")?.id, featured: true, sortOrder: 4 },
    { name: "Natura Keten Fon Perde", slug: "natura-keten-fon-perde", shortDescription: "Doğal keten liflerinden üretilen, sıcak ve davetkar fon perde koleksiyonu.", collectionId: fonPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "keten-fon")?.id, featured: false, sortOrder: 5 },
    { name: "Crystal Stor Perde", slug: "crystal-stor-perde", shortDescription: "Minimalist tasarımı ile modern ofis ve yaşam alanları için ideal stor perde.", collectionId: storPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "duz-stor")?.id, featured: true, sortOrder: 6 },
    { name: "Vision Zebra Perde", slug: "vision-zebra-perde", shortDescription: "İnce bantları ile gün ışığını kontrol eden şık zebra perde.", collectionId: zebraPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "klasik-zebra")?.id, featured: true, sortOrder: 7 },
    { name: "Lazer Kesim Dantel Tül", slug: "lazer-kesim-dantel-tul", shortDescription: "Geleneksel dantel motiflerinin lazer kesim teknolojisi ile buluştuğu eşsiz tül perde.", collectionId: tulPerde.id, subcollectionId: insertedSubs.find(s => s.slug === "lazer-kesim-tul")?.id, featured: false, sortOrder: 8 },
  ];
  const insertedProducts = await db.insert(products).values(prodData).returning();

  // ─── APPLICATIONS ───
  const appData = [
    { title: "Villa Projesi - Zekeriyaköy", slug: "villa-projesi-zekeriyakoy", shortDescription: "Zekeriyaköy'deki lüks villa projemizde tül, fon ve stor perde uygulamaları.", sortOrder: 1 },
    { title: "Ofis Projesi - Maslak", slug: "ofis-projesi-maslak", shortDescription: "Maslak iş merkezinde gerçekleştirdiğimiz zebra perde ve dikey perde uygulaması.", sortOrder: 2 },
    { title: "Rezidans Projesi - Ataşehir", slug: "rezidans-projesi-atasehir", shortDescription: "Ataşehir'deki rezidans projesinde premium blackout ve tül perde uygulamalarımız.", sortOrder: 3 },
    { title: "Otel Projesi - Taksim", slug: "otel-projesi-taksim", shortDescription: "Taksim'deki butik otelde gerçekleştirdiğimiz özel perde tasarım ve uygulamamız.", sortOrder: 4 },
  ];
  await db.insert(applications).values(appData);

  // ─── HOMEPAGE SECTIONS ───
  const hpSections = [
    { sectionKey: "hero", title: "Premium Perde & Stor Showroom", subtitle: "Evinize değer katan tasarımlar", description: "PERLINA ile mekanlarınıza zarafet ve şıklık katın. 500 m² showroom'umuzda en yeni koleksiyonlarımızı keşfedin.", ctaText: "Koleksiyonları Keşfet", ctaUrl: "/koleksiyonlar", ctaText2: "Showroom'u Ziyaret Et", ctaUrl2: "/magazamiz", sortOrder: 1 },
    { sectionKey: "featured_collections", title: "Koleksiyonlarımız", subtitle: "Her mekan için özenle seçilmiş koleksiyonlar", sortOrder: 2 },
    { sectionKey: "featured_products", title: "Öne Çıkan Ürünler", subtitle: "En beğenilen modellerimiz", sortOrder: 3 },
    { sectionKey: "brand_story", title: "PERLINA Hikayesi", description: "Yılların deneyimi ve tutkusuyla, her pencereye özel çözümler üretiyoruz. PERLINA olarak, premium kumaşlar ve modern tasarımlarla mekanlarınıza değer katıyoruz. Showroom'umuzda uzman ekibimizle tanışın.", ctaText: "Daha Fazla", ctaUrl: "/magazamiz", sortOrder: 4 },
    { sectionKey: "applications", title: "Uygulamalarımız", subtitle: "Tamamlanan projelerimizden örnekler", ctaText: "Tüm Uygulamalar", ctaUrl: "/uygulamalarimiz", sortOrder: 5 },
    { sectionKey: "cta", title: "Hayalinizdeki Perdeyi Birlikte Tasarlayalım", description: "Showroom'umuzu ziyaret edin veya WhatsApp üzerinden bizimle iletişime geçin.", ctaText: "WhatsApp ile İletişim", ctaUrl: "#whatsapp", ctaText2: "Teklif Al", ctaUrl2: "/teklif-al", sortOrder: 6 },
    { sectionKey: "store_cta", title: "Showroom'umuzu Ziyaret Edin", description: "İstanbul'un merkezinde, 500 m² premium showroom deneyimi sizi bekliyor.", ctaText: "Yol Tarifi Al", ctaUrl: "/magazamiz", sortOrder: 7 },
  ];
  await db.insert(homepageSections).values(hpSections);

  // ─── MENUS ───
  const [headerMenu] = await db.insert(menus).values({ name: "Ana Menü", slug: "header", description: "Üst menü" }).returning();
  const [footerMenu] = await db.insert(menus).values({ name: "Alt Menü", slug: "footer", description: "Alt menü" }).returning();

  await db.insert(menuItems).values([
    { menuId: headerMenu.id, label: "Koleksiyonlar", url: "/koleksiyonlar", sortOrder: 1 },
    { menuId: headerMenu.id, label: "Ürünler", url: "/urunler", sortOrder: 2 },
    { menuId: headerMenu.id, label: "Uygulamalarımız", url: "/uygulamalarimiz", sortOrder: 3 },
    { menuId: headerMenu.id, label: "Mağazamız", url: "/magazamiz", sortOrder: 4 },
    { menuId: headerMenu.id, label: "İletişim", url: "/iletisim", sortOrder: 5 },
    { menuId: footerMenu.id, label: "Koleksiyonlar", url: "/koleksiyonlar", sortOrder: 1 },
    { menuId: footerMenu.id, label: "Ürünler", url: "/urunler", sortOrder: 2 },
    { menuId: footerMenu.id, label: "Uygulamalarımız", url: "/uygulamalarimiz", sortOrder: 3 },
    { menuId: footerMenu.id, label: "Mağazamız", url: "/magazamiz", sortOrder: 4 },
    { menuId: footerMenu.id, label: "İletişim", url: "/iletisim", sortOrder: 5 },
    { menuId: footerMenu.id, label: "Teklif Al", url: "/teklif-al", sortOrder: 6 },
  ]);

  // ─── SEO ───
  const seoData = [
    { pagePath: "/", seoTitle: "PERLINA | Premium Perde & Stor Showroom", metaDescription: "Tül perde, fon perde, stor perde, zebra perde, jaluzi ve plise çözümleri ile premium showroom deneyimi." },
    { pagePath: "/koleksiyonlar", seoTitle: "Koleksiyonlar | PERLINA", metaDescription: "PERLINA premium perde koleksiyonlarını keşfedin." },
    { pagePath: "/urunler", seoTitle: "Ürünler | PERLINA", metaDescription: "PERLINA premium perde ve stor ürünlerini inceleyin." },
    { pagePath: "/uygulamalarimiz", seoTitle: "Uygulamalarımız | PERLINA", metaDescription: "PERLINA tamamlanmış proje ve uygulamalarını görüntüleyin." },
    { pagePath: "/magazamiz", seoTitle: "Mağazamız | PERLINA", metaDescription: "PERLINA premium perde showroom'unu ziyaret edin." },
    { pagePath: "/iletisim", seoTitle: "İletişim | PERLINA", metaDescription: "PERLINA ile iletişime geçin." },
    { pagePath: "/teklif-al", seoTitle: "Teklif Al | PERLINA", metaDescription: "PERLINA'dan ücretsiz teklif alın." },
  ];
  await db.insert(seo).values(seoData);

  console.log("✅ PERLINA database seeded successfully!");
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
