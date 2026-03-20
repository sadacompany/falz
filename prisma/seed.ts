import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding FALZ database...\n");

  // ─── PLANS ────────────────────────────────────────────────────────────────

  console.log("  Creating plans...");

  const basicPlan = await prisma.plan.upsert({
    where: { slug: "basic" },
    update: {},
    create: {
      name: "Basic",
      slug: "basic",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "SAR",
      maxListings: 10,
      maxAgents: 2,
      maxMediaPerListing: 5,
      features: {
        customDomain: false,
        advancedAnalytics: false,
        pdfReports: false,
        csvExport: false,
        blogEnabled: true,
        apiAccess: false,
        prioritySupport: false,
      },
      isActive: true,
      sortOrder: 0,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      priceMonthly: 29900,
      priceYearly: 299000,
      currency: "SAR",
      maxListings: 50,
      maxAgents: 10,
      maxMediaPerListing: 20,
      features: {
        customDomain: true,
        advancedAnalytics: true,
        pdfReports: true,
        csvExport: true,
        blogEnabled: true,
        apiAccess: false,
        prioritySupport: false,
      },
      isActive: true,
      sortOrder: 1,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      priceMonthly: 79900,
      priceYearly: 799000,
      currency: "SAR",
      maxListings: 9999,
      maxAgents: 9999,
      maxMediaPerListing: 50,
      features: {
        customDomain: true,
        advancedAnalytics: true,
        pdfReports: true,
        csvExport: true,
        blogEnabled: true,
        apiAccess: true,
        prioritySupport: true,
      },
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log(`    Basic:      ${basicPlan.id}`);
  console.log(`    Pro:        ${proPlan.id}`);
  console.log(`    Enterprise: ${enterprisePlan.id}`);

  // ─── SUPER ADMIN USERS ─────────────────────────────────────────────────────

  console.log("\n  Creating super admin users...");

  const adminUser = await prisma.user.upsert({
    where: { phone: "+966500000001" },
    update: {},
    create: {
      phone: "+966500000001",
      email: "admin@falz.sa",
      passwordHash: await hashPassword("Admin123!"),
      name: "FALZ Admin",
      nameAr: "مدير فالز",
      isSuperAdmin: true,
      isActive: true,
    },
  });

  const supportAdmin = await prisma.user.upsert({
    where: { phone: "+966500000002" },
    update: {},
    create: {
      phone: "+966500000002",
      email: "support@falz.sa",
      passwordHash: await hashPassword("Admin123!"),
      name: "FALZ Support",
      nameAr: "دعم فالز",
      isSuperAdmin: true,
      isActive: true,
    },
  });

  console.log(`    Admin:   ${adminUser.id} (admin@falz.sa)`);
  console.log(`    Support: ${supportAdmin.id} (support@falz.sa)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // OFFICE 1: Dar Al-Aseel (Riyadh)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n  Creating Office 1: Dar Al-Aseel (Riyadh)...");

  const office1 = await prisma.office.upsert({
    where: { slug: "dar-al-aseel" },
    update: {},
    create: {
      name: "Dar Al-Aseel Real Estate",
      nameAr: "دار الأصيل العقارية",
      slug: "dar-al-aseel",
      description:
        "Dar Al-Aseel Real Estate is a leading real estate brokerage firm in Riyadh, Saudi Arabia. We specialize in residential and commercial properties, offering professional services in sales, leasing, and property management across the Kingdom.",
      descriptionAr:
        "دار الأصيل العقارية هي شركة وساطة عقارية رائدة في الرياض، المملكة العربية السعودية. نتخصص في العقارات السكنية والتجارية، ونقدم خدمات احترافية في البيع والتأجير وإدارة الممتلكات في جميع أنحاء المملكة.",
      falLicenseNo: "1200000XXX",
      phone: "+966501234567",
      email: "info@dar-al-aseel.sa",
      whatsapp: "+966501234567",
      website: "https://dar-al-aseel.sa",
      address: "King Fahd Road, Al Olaya District, Riyadh",
      addressAr: "طريق الملك فهد، حي العليا، الرياض",
      city: "Riyadh",
      cityAr: "الرياض",
      district: "Al Olaya",
      districtAr: "العليا",
      lat: 24.7136,
      lng: 46.6753,
      subdomain: "dar-al-aseel",
      defaultLanguage: "ar",
      socialLinks: {
        twitter: "https://twitter.com/dar_al_aseel",
        instagram: "https://instagram.com/dar_al_aseel",
        snapchat: "dar_al_aseel",
        linkedin: "https://linkedin.com/company/dar-al-aseel",
        tiktok: "https://tiktok.com/@dar_al_aseel",
      },
      seoTitle: "Dar Al-Aseel Real Estate | Riyadh Properties",
      seoTitleAr: "دار الأصيل العقارية | عقارات الرياض",
      seoDescription:
        "Find your dream property in Riyadh with Dar Al-Aseel Real Estate. Villas, apartments, offices, and land for sale and rent.",
      seoDescriptionAr:
        "ابحث عن عقارك المثالي في الرياض مع دار الأصيل العقارية. فلل، شقق، مكاتب، وأراضي للبيع والإيجار.",
      pageSections: [
        { type: "hero", order: 1, enabled: true, content: { title: "Find Your Dream Property", titleAr: "اعثر على عقار أحلامك", subtitle: "Luxury properties in the heart of Riyadh", subtitleAr: "عقارات فاخرة في قلب الرياض" } },
        { type: "featured", order: 2, enabled: true, content: {} },
        { type: "about", order: 3, enabled: true, content: { title: "About Us", titleAr: "من نحن", body: "With over 10 years of experience in the Saudi real estate market.", bodyAr: "أكثر من 10 سنوات من الخبرة في سوق العقارات السعودي." } },
        { type: "services", order: 4, enabled: true, content: { title: "Our Services", titleAr: "خدماتنا", items: ["Property Sales", "Property Management", "Real Estate Consulting"] } },
        { type: "cta", order: 5, enabled: true, content: { title: "Ready to find your home?", titleAr: "مستعد لإيجاد منزلك؟", subtitle: "Contact us today", subtitleAr: "تواصل معنا اليوم" } },
        { type: "footer", order: 99, enabled: true, content: { showLogo: true, showNavLinks: true, showContactInfo: true, showSocialLinks: true } },
      ],
      isApproved: true,
      isActive: true,
    },
  });

  // Theme for Office 1
  await prisma.themeSettings.upsert({
    where: { officeId: office1.id },
    update: {},
    create: {
      officeId: office1.id,
      preset: "navy-gold",
      primaryColor: "#1B2A4A",
      accentColor: "#C8A45D",
      backgroundColor: "#FFFFFF",
      textColor: "#1a1a1a",
      mutedTextColor: "#6b7280",
      fontFamily: "Inter, Noto Sans Arabic",
      fontFamilyAr: "Noto Sans Arabic, Inter",
      borderRadius: "md",
      cardStyle: "elevated",
    },
  });

  // Subscription for Office 1
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 12);

  await prisma.subscription.deleteMany({ where: { officeId: office1.id } });
  await prisma.subscription.create({
    data: {
      officeId: office1.id,
      planId: proPlan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentProvider: "mock",
      metadata: { seeded: true },
    },
  });

  // ─── Office 1 Users ─────────────────────────────────────────────────────

  const o1Owner = await prisma.user.upsert({
    where: { email: "ahmed@dar-al-aseel.sa" },
    update: {},
    create: {
      email: "ahmed@dar-al-aseel.sa",
      passwordHash: await hashPassword("Owner123!"),
      name: "Ahmed Al-Rashid",
      nameAr: "أحمد الراشد",
      phone: "+966501111111",
      isActive: true,
    },
  });

  const o1Manager = await prisma.user.upsert({
    where: { email: "sara@dar-al-aseel.sa" },
    update: {},
    create: {
      email: "sara@dar-al-aseel.sa",
      passwordHash: await hashPassword("Manager123!"),
      name: "Sara Al-Mohsen",
      nameAr: "سارة المحسن",
      phone: "+966502222222",
      isActive: true,
    },
  });

  const o1Agent1 = await prisma.user.upsert({
    where: { email: "khalid@dar-al-aseel.sa" },
    update: {},
    create: {
      email: "khalid@dar-al-aseel.sa",
      passwordHash: await hashPassword("Agent123!"),
      name: "Khalid Al-Otaibi",
      nameAr: "خالد العتيبي",
      phone: "+966503333333",
      isActive: true,
    },
  });

  const o1Agent2 = await prisma.user.upsert({
    where: { email: "nora@dar-al-aseel.sa" },
    update: {},
    create: {
      email: "nora@dar-al-aseel.sa",
      passwordHash: await hashPassword("Agent123!"),
      name: "Nora Al-Shammari",
      nameAr: "نورة الشمري",
      phone: "+966504444444",
      isActive: true,
    },
  });

  console.log(`    Owner:   ${o1Owner.id} (ahmed@dar-al-aseel.sa)`);
  console.log(`    Manager: ${o1Manager.id} (sara@dar-al-aseel.sa)`);
  console.log(`    Agent 1: ${o1Agent1.id} (khalid@dar-al-aseel.sa)`);
  console.log(`    Agent 2: ${o1Agent2.id} (nora@dar-al-aseel.sa)`);

  // Memberships
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o1Owner.id, officeId: office1.id } },
    update: {},
    create: { userId: o1Owner.id, officeId: office1.id, role: "OWNER", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o1Manager.id, officeId: office1.id } },
    update: {},
    create: { userId: o1Manager.id, officeId: office1.id, role: "MANAGER", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o1Agent1.id, officeId: office1.id } },
    update: {},
    create: { userId: o1Agent1.id, officeId: office1.id, role: "AGENT", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o1Agent2.id, officeId: office1.id } },
    update: {},
    create: { userId: o1Agent2.id, officeId: office1.id, role: "AGENT", isActive: true },
  });

  // Agent profiles for Office 1
  await prisma.agentProfile.upsert({
    where: { userId: o1Agent1.id },
    update: {},
    create: {
      userId: o1Agent1.id,
      officeId: office1.id,
      bio: "Specialist in luxury villas and residential compounds in North Riyadh. Over 5 years of experience.",
      bioAr: "متخصص في الفلل الفاخرة والمجمعات السكنية في شمال الرياض. أكثر من 5 سنوات من الخبرة.",
      phone: "+966503333333",
      whatsapp: "+966503333333",
      email: "khalid@dar-al-aseel.sa",
      specialties: ["residential", "villa", "compound"],
      languages: ["ar", "en"],
      isPublic: true,
      slug: "khalid-al-otaibi",
    },
  });

  await prisma.agentProfile.upsert({
    where: { userId: o1Agent2.id },
    update: {},
    create: {
      userId: o1Agent2.id,
      officeId: office1.id,
      bio: "Expert in apartment sales and rental in central Riyadh. Fluent in Arabic and English.",
      bioAr: "خبيرة في بيع وتأجير الشقق في وسط الرياض. تتحدث العربية والإنجليزية بطلاقة.",
      phone: "+966504444444",
      whatsapp: "+966504444444",
      email: "nora@dar-al-aseel.sa",
      specialties: ["residential", "apartment"],
      languages: ["ar", "en"],
      isPublic: true,
      slug: "nora-al-shammari",
    },
  });

  // ─── Office 1 Properties ────────────────────────────────────────────────

  console.log("  Creating Office 1 properties...");

  // Delete existing properties for this office to allow re-seeding
  await prisma.propertyMedia.deleteMany({ where: { property: { officeId: office1.id } } });
  await prisma.lead.deleteMany({ where: { officeId: office1.id } });
  await prisma.property.deleteMany({ where: { officeId: office1.id } });

  const o1PropertiesData = [
    {
      title: "Luxury Villa in Al-Malqa",
      titleAr: "فيلا فاخرة في الملقا",
      slug: "luxury-villa-al-malqa",
      description: "Stunning 5-bedroom luxury villa in the prestigious Al-Malqa district. Features a private pool, landscaped garden, modern kitchen, maid's room, and driver's quarters. Built with premium materials and smart home systems.",
      descriptionAr: "فيلا فاخرة مذهلة بـ 5 غرف نوم في حي الملقا الراقي. تتميز بمسبح خاص وحديقة منسقة ومطبخ حديث وغرفة خادمة وغرفة سائق. مبنية بمواد عالية الجودة وأنظمة المنزل الذكي.",
      price: BigInt(4500000),
      dealType: "SALE" as const,
      propertyType: "VILLA" as const,
      area: 550,
      bedrooms: 5,
      bathrooms: 6,
      amenities: ["pool", "garden", "parking", "maid_room", "driver_room", "smart_home", "central_ac"],
      tags: ["luxury", "villa", "al-malqa", "pool"],
      isFeatured: true,
      city: "Riyadh", cityAr: "الرياض",
      district: "Al-Malqa", districtAr: "الملقا",
      street: "Prince Sultan Street", streetAr: "شارع الأمير سلطان",
      lat: 24.8050, lng: 46.6260,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o1Agent1.id,
      publishedAt: daysAgo(15),
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      ],
    },
    {
      title: "Modern Apartment in Al-Olaya",
      titleAr: "شقة عصرية في العليا",
      slug: "modern-apartment-al-olaya",
      description: "Brand new 3-bedroom apartment in the heart of Al-Olaya business district. Floor-to-ceiling windows with stunning city views. Modern finishes, open kitchen, gym and pool access.",
      descriptionAr: "شقة جديدة بالكامل بـ 3 غرف نوم في قلب حي العليا التجاري. نوافذ من الأرض للسقف مع إطلالات خلابة على المدينة. تشطيبات حديثة، مطبخ مفتوح، ووصول للنادي والمسبح.",
      price: BigInt(1200000),
      dealType: "SALE" as const,
      propertyType: "APARTMENT" as const,
      area: 180,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["parking", "gym", "pool", "security", "elevator", "central_ac"],
      tags: ["apartment", "modern", "al-olaya", "city-view"],
      isFeatured: true,
      city: "Riyadh", cityAr: "الرياض",
      district: "Al-Olaya", districtAr: "العليا",
      street: "King Fahd Road", streetAr: "طريق الملك فهد",
      lat: 24.6914, lng: 46.6853,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o1Agent2.id,
      publishedAt: daysAgo(10),
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      ],
    },
    {
      title: "Commercial Land on King Fahd Road",
      titleAr: "أرض تجارية على طريق الملك فهد",
      slug: "commercial-land-king-fahd",
      description: "Prime commercial land on King Fahd Road near Exit 5. 2,500 sqm, ideal for mixed-use development or high-rise project. Excellent visibility and access.",
      descriptionAr: "أرض تجارية مميزة على طريق الملك فهد بالقرب من مخرج 5. مساحة 2500 متر مربع، مثالية للتطوير متعدد الاستخدامات أو مشروع أبراج. رؤية ممتازة وسهولة وصول.",
      price: BigInt(12000000),
      dealType: "SALE" as const,
      propertyType: "LAND" as const,
      area: 2500,
      bedrooms: null,
      bathrooms: null,
      amenities: [],
      tags: ["land", "commercial", "investment", "king-fahd-road"],
      isFeatured: false,
      city: "Riyadh", cityAr: "الرياض",
      district: "Al-Sahafa", districtAr: "الصحافة",
      street: "King Fahd Road", streetAr: "طريق الملك فهد",
      lat: 24.7600, lng: 46.6500,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o1Owner.id,
      publishedAt: daysAgo(5),
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      ],
    },
    {
      title: "Furnished Apartment in Al-Yasmin",
      titleAr: "شقة مفروشة في الياسمين",
      slug: "furnished-apartment-al-yasmin",
      description: "Fully furnished 3-bedroom apartment in Al-Yasmin. Modern furniture, equipped kitchen, washer/dryer. Near schools and malls. Available for yearly rent.",
      descriptionAr: "شقة مفروشة بالكامل بـ 3 غرف نوم في الياسمين. أثاث حديث، مطبخ مجهز، غسالة/مجفف. قريبة من المدارس والمولات. متاحة للإيجار السنوي.",
      price: BigInt(85000),
      dealType: "RENT" as const,
      propertyType: "APARTMENT" as const,
      area: 180,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["furnished", "parking", "central_ac", "kitchen_appliances", "washer_dryer"],
      tags: ["furnished", "apartment", "al-yasmin", "rent"],
      isFeatured: false,
      city: "Riyadh", cityAr: "الرياض",
      district: "Al-Yasmin", districtAr: "الياسمين",
      street: "Al-Yasmin Main Road", streetAr: "شارع الياسمين الرئيسي",
      lat: 24.8254, lng: 46.6387,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o1Agent1.id,
      publishedAt: daysAgo(25),
      images: [
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      ],
    },
    {
      title: "Villa with Pool in Al-Rimal",
      titleAr: "فيلا مع مسبح في الرمال",
      slug: "villa-pool-al-rimal",
      description: "Beautiful family villa with private swimming pool in Al-Rimal district. 4 bedrooms, landscaped garden, outdoor seating, and 2-car garage.",
      descriptionAr: "فيلا عائلية جميلة مع مسبح خاص في حي الرمال. 4 غرف نوم، حديقة منسقة، جلسة خارجية، ومرآب لسيارتين.",
      price: BigInt(2800000),
      dealType: "SALE" as const,
      propertyType: "VILLA" as const,
      area: 380,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ["pool", "garden", "parking", "maid_room", "central_ac", "outdoor_seating"],
      tags: ["villa", "pool", "family", "al-rimal"],
      isFeatured: true,
      city: "Riyadh", cityAr: "الرياض",
      district: "Al-Rimal", districtAr: "الرمال",
      street: "Al-Rimal Boulevard", streetAr: "بوليفارد الرمال",
      lat: 24.7635, lng: 46.7891,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o1Agent2.id,
      publishedAt: daysAgo(8),
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      ],
    },
  ];

  const o1Properties = [];
  for (const p of o1PropertiesData) {
    const { images, ...data } = p;
    const property = await prisma.property.create({ data: { officeId: office1.id, ...data } });
    o1Properties.push(property);

    if (images.length > 0) {
      await prisma.propertyMedia.createMany({
        data: images.map((url, i) => ({
          propertyId: property.id,
          url,
          type: "IMAGE" as const,
          sortOrder: i,
        })),
      });
    }
    console.log(`    ${property.slug}`);
  }

  // ─── Office 1 Blog ──────────────────────────────────────────────────────

  console.log("  Creating Office 1 blog...");

  await prisma.blogPostCategory.deleteMany({ where: { post: { officeId: office1.id } } });
  await prisma.blogPostTag.deleteMany({ where: { post: { officeId: office1.id } } });
  await prisma.blogPost.deleteMany({ where: { officeId: office1.id } });
  await prisma.blogCategory.deleteMany({ where: { officeId: office1.id } });
  await prisma.blogTag.deleteMany({ where: { officeId: office1.id } });

  const o1CatTips = await prisma.blogCategory.create({
    data: { officeId: office1.id, name: "Real Estate Tips", nameAr: "نصائح عقارية", slug: "real-estate-tips" },
  });
  const o1CatNews = await prisma.blogCategory.create({
    data: { officeId: office1.id, name: "Market News", nameAr: "أخبار السوق", slug: "market-news" },
  });

  const o1TagRiyadh = await prisma.blogTag.create({
    data: { officeId: office1.id, name: "Riyadh", nameAr: "الرياض", slug: "riyadh" },
  });
  const o1TagTips = await prisma.blogTag.create({
    data: { officeId: office1.id, name: "Tips", nameAr: "نصائح", slug: "tips" },
  });

  const o1Post1 = await prisma.blogPost.create({
    data: {
      officeId: office1.id,
      title: "Tips for Buying Property in Riyadh",
      titleAr: "نصائح لشراء عقار في الرياض",
      slug: "tips-for-buying-property-in-riyadh",
      excerpt: "A comprehensive guide to buying property in Riyadh.",
      excerptAr: "دليل شامل لشراء العقارات في الرياض.",
      content: "Buying property in Riyadh is one of the most significant financial decisions you'll make. Here are essential tips:\n\n## Research the Market\nUnderstanding current prices and trends is crucial.\n\n## Choose the Right Neighborhood\nPopular areas include Al-Malqa, Al-Olaya, Al-Yasmin, and Al-Narjis.\n\n## Verify the FAL License\nAlways ensure the office has a valid FAL license.",
      contentAr: "شراء عقار في الرياض هو أحد أهم القرارات المالية. إليك نصائح أساسية:\n\n## ابحث في السوق\nفهم الأسعار الحالية والاتجاهات أمر بالغ الأهمية.\n\n## اختر الحي المناسب\nتشمل الأحياء الشهيرة الملقا والعليا والياسمين والنرجس.\n\n## تحقق من ترخيص فال\nتأكد دائمًا من أن المكتب لديه ترخيص فال ساري.",
      status: "PUBLISHED",
      authorId: o1Owner.id,
      publishedAt: daysAgo(7),
    },
  });

  const o1Post2 = await prisma.blogPost.create({
    data: {
      officeId: office1.id,
      title: "Best Residential Districts in Riyadh 2026",
      titleAr: "أفضل الأحياء السكنية في الرياض 2026",
      slug: "best-districts-riyadh-2026",
      excerpt: "Discover the top residential neighborhoods in Riyadh for 2026.",
      excerptAr: "اكتشف أفضل الأحياء السكنية في الرياض لعام 2026.",
      content: "Riyadh's residential landscape continues to evolve.\n\n## North Riyadh\n### Al-Malqa\nThe gold standard for luxury living.\n\n### Al-Yasmin\nFamily favorite with strong community feel.\n\n## Central Riyadh\n### Al-Olaya\nThe business heart of Riyadh.",
      contentAr: "يستمر المشهد السكني في الرياض في التطور.\n\n## شمال الرياض\n### الملقا\nالمعيار الذهبي للحياة الفاخرة.\n\n### الياسمين\nالمفضل للعائلات.\n\n## وسط الرياض\n### العليا\nالقلب التجاري للرياض.",
      status: "PUBLISHED",
      authorId: o1Owner.id,
      publishedAt: daysAgo(3),
    },
  });

  await prisma.blogPostCategory.createMany({
    data: [
      { postId: o1Post1.id, categoryId: o1CatTips.id },
      { postId: o1Post2.id, categoryId: o1CatNews.id },
    ],
  });
  await prisma.blogPostTag.createMany({
    data: [
      { postId: o1Post1.id, tagId: o1TagRiyadh.id },
      { postId: o1Post1.id, tagId: o1TagTips.id },
      { postId: o1Post2.id, tagId: o1TagRiyadh.id },
    ],
  });

  // ─── Office 1 Leads ─────────────────────────────────────────────────────

  console.log("  Creating Office 1 leads...");

  await prisma.leadActivity.deleteMany({ where: { lead: { officeId: office1.id } } });
  await prisma.lead.deleteMany({ where: { officeId: office1.id } });

  const o1Lead1 = await prisma.lead.create({
    data: {
      officeId: office1.id,
      name: "Mohammed Al-Harbi",
      phone: "+966551234567",
      email: "mohammed.h@gmail.com",
      message: "Interested in your available properties in Riyadh.",
      source: "CONTACT_FORM",
      status: "NEW",
      agentId: o1Agent1.id,
      createdAt: daysAgo(1),
    },
  });

  await prisma.lead.create({
    data: {
      officeId: office1.id,
      propertyId: o1Properties[0].id,
      name: "Noura Al-Dosari",
      phone: "+966559876543",
      email: "noura.d@hotmail.com",
      message: "I would like to schedule a viewing for the luxury villa in Al-Malqa.",
      source: "PROPERTY_INQUIRY",
      status: "CONTACTED",
      agentId: o1Owner.id,
      createdAt: daysAgo(3),
    },
  });

  await prisma.lead.create({
    data: {
      officeId: office1.id,
      propertyId: o1Properties[1].id,
      name: "Faisal Al-Qahtani",
      phone: "+966554443333",
      email: "faisal.q@outlook.com",
      message: "Interested in the apartment in Al-Olaya. What is the lease term?",
      source: "WHATSAPP_CLICK",
      status: "QUALIFIED",
      agentId: o1Agent1.id,
      createdAt: daysAgo(5),
    },
  });

  // ─── Office 1 Analytics ─────────────────────────────────────────────────

  console.log("  Creating Office 1 analytics...");

  await prisma.analyticsEvent.deleteMany({ where: { officeId: office1.id } });

  const eventTypes = ["page_view", "page_view", "page_view", "property_view", "property_view", "whatsapp_click", "phone_click", "lead_submit"];
  const o1Pages = ["/dar-al-aseel", "/dar-al-aseel/properties", "/dar-al-aseel/about", "/dar-al-aseel/contact"];
  const referrers = [
    { referrer: null, referrerType: "direct" },
    { referrer: "https://www.google.com", referrerType: "search" },
    { referrer: "https://twitter.com/dar_al_aseel", referrerType: "social" },
    { referrer: "https://www.aqar.fm", referrerType: "referral" },
  ];
  const userAgents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) Chrome/120.0.0.0 Mobile",
  ];

  const o1Analytics = [];
  for (let i = 0; i < 50; i++) {
    const eventType = pickRandom(eventTypes);
    const ref = pickRandom(referrers);
    const day = randomBetween(0, 29);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - day);
    createdAt.setHours(randomBetween(6, 23), randomBetween(0, 59), 0, 0);

    o1Analytics.push({
      officeId: office1.id,
      propertyId: eventType.includes("view") || eventType === "lead_submit" ? pickRandom(o1Properties).id : null,
      eventType,
      sessionId: `session_${randomBetween(1000, 9999)}`,
      visitorId: `visitor_${randomBetween(1, 20)}`,
      referrer: ref.referrer,
      referrerType: ref.referrerType,
      userAgent: pickRandom(userAgents),
      ip: `${randomBetween(1, 255)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(1, 254)}`,
      city: "Riyadh",
      page: eventType === "property_view" ? `/dar-al-aseel/properties/${pickRandom(o1Properties).slug}` : pickRandom(o1Pages),
      metadata: {},
      createdAt,
    });
  }
  await prisma.analyticsEvent.createMany({ data: o1Analytics });

  // ─── Office 1 Notifications ─────────────────────────────────────────────

  await prisma.notification.deleteMany({ where: { officeId: office1.id } });
  await prisma.notification.createMany({
    data: [
      {
        officeId: office1.id, userId: o1Owner.id,
        type: "lead_new", title: "New Lead Received", titleAr: "عميل محتمل جديد",
        message: "A new lead has been submitted by Mohammed Al-Harbi.",
        messageAr: "تم تقديم عميل محتمل جديد بواسطة محمد الحربي.",
        link: "/dashboard/leads", isRead: false, createdAt: daysAgo(1),
      },
      {
        officeId: office1.id, userId: o1Agent1.id,
        type: "lead_assigned", title: "Lead Assigned to You", titleAr: "تم تعيين عميل محتمل لك",
        message: "You have been assigned a new lead: Faisal Al-Qahtani.",
        messageAr: "تم تعيين عميل محتمل جديد لك: فيصل القحطاني.",
        link: "/dashboard/leads", isRead: true, createdAt: daysAgo(5),
      },
    ],
  });

  // ─── Office 1 Audit Logs ────────────────────────────────────────────────

  await prisma.auditLog.deleteMany({ where: { officeId: office1.id } });
  await prisma.auditLog.createMany({
    data: [
      {
        officeId: office1.id, userId: o1Owner.id,
        action: "office_created", entity: "Office", entityId: office1.id,
        details: { name: "Dar Al-Aseel Real Estate" },
        ip: "86.51.23.101", createdAt: daysAgo(30),
      },
      {
        officeId: office1.id, userId: o1Owner.id,
        action: "property_published", entity: "Property", entityId: o1Properties[0].id,
        details: { title: "Luxury Villa in Al-Malqa" },
        ip: "86.51.23.101", createdAt: daysAgo(15),
      },
    ],
  });

  console.log("  ✅ Office 1 complete!\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // OFFICE 2: Al Fares Properties (Jeddah)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("  Creating Office 2: Al Fares Properties (Jeddah)...");

  const office2 = await prisma.office.upsert({
    where: { slug: "al-fares-properties" },
    update: {},
    create: {
      name: "Al Fares Properties",
      nameAr: "عقارات الفارس",
      slug: "al-fares-properties",
      description: "Leading real estate company in Jeddah serving the western region with premium properties. Specializing in sea-view villas, commercial spaces, and waterfront living.",
      descriptionAr: "شركة عقارية رائدة في جدة تخدم المنطقة الغربية بعقارات مميزة. متخصصة في الفلل المطلة على البحر والمساحات التجارية والحياة الساحلية.",
      falLicenseNo: "2100005678",
      phone: "+966126789012",
      email: "info@al-fares.sa",
      whatsapp: "+966559876543",
      address: "Corniche Road, Al-Hamra District",
      addressAr: "طريق الكورنيش، حي الحمراء",
      city: "Jeddah",
      cityAr: "جدة",
      district: "Al-Hamra",
      districtAr: "الحمراء",
      lat: 21.5433,
      lng: 39.1728,
      subdomain: "al-fares",
      defaultLanguage: "ar",
      socialLinks: {
        twitter: "https://twitter.com/alfares_re",
        instagram: "https://instagram.com/alfares_re",
        linkedin: "https://linkedin.com/company/alfares-re",
      },
      seoTitle: "Al Fares Properties | Jeddah Real Estate",
      seoTitleAr: "عقارات الفارس | عقارات جدة",
      seoDescription: "Premium properties in Jeddah - sea-view villas, apartments, and commercial spaces.",
      seoDescriptionAr: "عقارات مميزة في جدة - فلل بإطلالة بحرية وشقق ومساحات تجارية.",
      pageSections: [
        { type: "hero", order: 1, enabled: true, content: { title: "Your Trusted Partner in Jeddah", titleAr: "شريكك الموثوق في جدة", subtitle: "Sea-view properties and coastal living", subtitleAr: "عقارات بإطلالة بحرية وحياة ساحلية" } },
        { type: "featured", order: 2, enabled: true, content: {} },
        { type: "about", order: 3, enabled: true, content: { title: "About Al Fares", titleAr: "عن الفارس", body: "Serving the Jeddah market for over 15 years with trusted expertise.", bodyAr: "نخدم سوق جدة لأكثر من 15 عامًا بخبرة موثوقة." } },
        { type: "services", order: 4, enabled: true, content: { title: "Our Services", titleAr: "خدماتنا", items: ["Property Sales", "Rental Management", "Property Valuation"] } },
        { type: "cta", order: 5, enabled: true, content: { title: "Explore Jeddah Properties", titleAr: "استكشف عقارات جدة", subtitle: "Get in touch with our team", subtitleAr: "تواصل مع فريقنا" } },
        { type: "footer", order: 99, enabled: true, content: { showLogo: true, showNavLinks: true, showContactInfo: true, showSocialLinks: true } },
      ],
      isApproved: true,
      isActive: true,
    },
  });

  // Theme for Office 2
  await prisma.themeSettings.upsert({
    where: { officeId: office2.id },
    update: {},
    create: {
      officeId: office2.id,
      preset: "deep-green-gold",
    },
  });

  // Subscription for Office 2
  await prisma.subscription.deleteMany({ where: { officeId: office2.id } });
  await prisma.subscription.create({
    data: {
      officeId: office2.id,
      planId: basicPlan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentProvider: "mock",
      metadata: { seeded: true },
    },
  });

  // ─── Office 2 Users ─────────────────────────────────────────────────────

  const o2Owner = await prisma.user.upsert({
    where: { email: "mohammed@al-fares.sa" },
    update: {},
    create: {
      email: "mohammed@al-fares.sa",
      passwordHash: await hashPassword("Owner123!"),
      name: "Mohammed Al-Fares",
      nameAr: "محمد الفارس",
      phone: "+966552222001",
      isActive: true,
    },
  });

  const o2Manager = await prisma.user.upsert({
    where: { email: "layla@al-fares.sa" },
    update: {},
    create: {
      email: "layla@al-fares.sa",
      passwordHash: await hashPassword("Manager123!"),
      name: "Layla Al-Ghamdi",
      nameAr: "ليلى الغامدي",
      phone: "+966552222002",
      isActive: true,
    },
  });

  const o2Agent1 = await prisma.user.upsert({
    where: { email: "omar@al-fares.sa" },
    update: {},
    create: {
      email: "omar@al-fares.sa",
      passwordHash: await hashPassword("Agent123!"),
      name: "Omar Al-Zahrani",
      nameAr: "عمر الزهراني",
      phone: "+966552222003",
      isActive: true,
    },
  });

  const o2Agent2 = await prisma.user.upsert({
    where: { email: "fatimah@al-fares.sa" },
    update: {},
    create: {
      email: "fatimah@al-fares.sa",
      passwordHash: await hashPassword("Agent123!"),
      name: "Fatimah Al-Otaibi",
      nameAr: "فاطمة العتيبي",
      phone: "+966552222004",
      isActive: true,
    },
  });

  console.log(`    Owner:   ${o2Owner.id} (mohammed@al-fares.sa)`);
  console.log(`    Manager: ${o2Manager.id} (layla@al-fares.sa)`);
  console.log(`    Agent 1: ${o2Agent1.id} (omar@al-fares.sa)`);
  console.log(`    Agent 2: ${o2Agent2.id} (fatimah@al-fares.sa)`);

  // Memberships for Office 2
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o2Owner.id, officeId: office2.id } },
    update: {},
    create: { userId: o2Owner.id, officeId: office2.id, role: "OWNER", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o2Manager.id, officeId: office2.id } },
    update: {},
    create: { userId: o2Manager.id, officeId: office2.id, role: "MANAGER", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o2Agent1.id, officeId: office2.id } },
    update: {},
    create: { userId: o2Agent1.id, officeId: office2.id, role: "AGENT", isActive: true },
  });
  await prisma.membership.upsert({
    where: { userId_officeId: { userId: o2Agent2.id, officeId: office2.id } },
    update: {},
    create: { userId: o2Agent2.id, officeId: office2.id, role: "AGENT", isActive: true },
  });

  // Agent profiles for Office 2
  await prisma.agentProfile.upsert({
    where: { userId: o2Agent1.id },
    update: {},
    create: {
      userId: o2Agent1.id,
      officeId: office2.id,
      bio: "Specialist in sea-view properties and waterfront living in Jeddah.",
      bioAr: "متخصص في العقارات المطلة على البحر والحياة الساحلية في جدة.",
      phone: "+966552222003",
      whatsapp: "+966552222003",
      email: "omar@al-fares.sa",
      specialties: ["residential", "villa", "sea-view"],
      languages: ["ar", "en"],
      isPublic: true,
      slug: "omar-al-zahrani",
    },
  });

  await prisma.agentProfile.upsert({
    where: { userId: o2Agent2.id },
    update: {},
    create: {
      userId: o2Agent2.id,
      officeId: office2.id,
      bio: "Focused on commercial and office space leasing in Jeddah.",
      bioAr: "متخصصة في تأجير المساحات التجارية والمكتبية في جدة.",
      phone: "+966552222004",
      whatsapp: "+966552222004",
      email: "fatimah@al-fares.sa",
      specialties: ["commercial", "office"],
      languages: ["ar", "en", "fr"],
      isPublic: true,
      slug: "fatimah-al-otaibi",
    },
  });

  // ─── Office 2 Properties ────────────────────────────────────────────────

  console.log("  Creating Office 2 properties...");

  await prisma.propertyMedia.deleteMany({ where: { property: { officeId: office2.id } } });
  await prisma.lead.deleteMany({ where: { officeId: office2.id } });
  await prisma.property.deleteMany({ where: { officeId: office2.id } });

  const o2PropertiesData = [
    {
      title: "Sea-View Villa in Obhur",
      titleAr: "فيلا بإطلالة بحرية في أبحر",
      slug: "sea-view-villa-obhur",
      description: "Breathtaking 6-bedroom villa with direct sea view and private beach access in Obhur. Infinity pool, rooftop terrace, and premium finishes throughout.",
      descriptionAr: "فيلا خلابة بـ 6 غرف نوم مع إطلالة مباشرة على البحر ودخول خاص للشاطئ في أبحر. مسبح لا متناهي وتراس على السطح وتشطيبات فاخرة.",
      price: BigInt(8500000),
      dealType: "SALE" as const,
      propertyType: "VILLA" as const,
      area: 750,
      bedrooms: 6,
      bathrooms: 7,
      amenities: ["pool", "garden", "parking", "sea_view", "private_beach", "rooftop", "smart_home"],
      tags: ["luxury", "villa", "sea-view", "obhur"],
      isFeatured: true,
      city: "Jeddah", cityAr: "جدة",
      district: "Obhur", districtAr: "أبحر",
      street: "Obhur Corniche", streetAr: "كورنيش أبحر",
      lat: 21.7200, lng: 39.1050,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o2Agent1.id,
      publishedAt: daysAgo(12),
      images: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
        "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80",
      ],
    },
    {
      title: "Office Space in Al-Tahlia",
      titleAr: "مكتب في التحلية",
      slug: "office-space-tahlia",
      description: "Modern 200sqm office space in Al-Tahlia Street. Perfect for startups and consulting firms. Meeting rooms, reception area, and dedicated parking.",
      descriptionAr: "مساحة مكتبية حديثة 200 متر مربع في شارع التحلية. مثالية للشركات الناشئة والاستشارات. قاعات اجتماعات واستقبال ومواقف مخصصة.",
      price: BigInt(85000),
      dealType: "RENT" as const,
      propertyType: "OFFICE" as const,
      area: 200,
      bedrooms: null,
      bathrooms: 2,
      amenities: ["parking", "security", "elevator", "reception", "meeting_rooms"],
      tags: ["office", "rent", "al-tahlia", "commercial"],
      isFeatured: true,
      city: "Jeddah", cityAr: "جدة",
      district: "Al-Tahlia", districtAr: "التحلية",
      street: "Al-Tahlia Street", streetAr: "شارع التحلية",
      lat: 21.5700, lng: 39.1650,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o2Agent2.id,
      publishedAt: daysAgo(20),
      images: [
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
        "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
      ],
    },
    {
      title: "Corniche Apartment",
      titleAr: "شقة على الكورنيش",
      slug: "corniche-apartment",
      description: "Stunning 4-bedroom apartment overlooking the Jeddah Corniche. Modern finishes, open layout, gym and pool in the building. Walking distance to restaurants and cafes.",
      descriptionAr: "شقة مذهلة بـ 4 غرف نوم تطل على كورنيش جدة. تشطيبات حديثة وتصميم مفتوح ونادي ومسبح في المبنى. على مسافة قريبة من المطاعم والمقاهي.",
      price: BigInt(2200000),
      dealType: "SALE" as const,
      propertyType: "APARTMENT" as const,
      area: 280,
      bedrooms: 4,
      bathrooms: 4,
      amenities: ["parking", "gym", "pool", "sea_view", "security", "elevator"],
      tags: ["apartment", "corniche", "sea-view", "jeddah"],
      isFeatured: false,
      city: "Jeddah", cityAr: "جدة",
      district: "Al-Hamra", districtAr: "الحمراء",
      street: "Corniche Road", streetAr: "طريق الكورنيش",
      lat: 21.5450, lng: 39.1700,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o2Agent1.id,
      publishedAt: daysAgo(7),
      images: [
        "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      ],
    },
    {
      title: "Commercial Building in Al-Rawda",
      titleAr: "مبنى تجاري في الروضة",
      slug: "commercial-building-rawda",
      description: "Full commercial building with 12 units in Al-Rawda district. Currently fully occupied with strong rental yield. Excellent investment opportunity.",
      descriptionAr: "مبنى تجاري كامل يضم 12 وحدة في حي الروضة. مشغول بالكامل حاليًا بعائد إيجاري قوي. فرصة استثمارية ممتازة.",
      price: BigInt(15000000),
      dealType: "SALE" as const,
      propertyType: "BUILDING" as const,
      area: 1800,
      bedrooms: null,
      bathrooms: 12,
      amenities: ["parking", "security", "elevator", "generator"],
      tags: ["building", "investment", "commercial", "al-rawda"],
      isFeatured: false,
      city: "Jeddah", cityAr: "جدة",
      district: "Al-Rawda", districtAr: "الروضة",
      street: "Al-Rawda Main Street", streetAr: "شارع الروضة الرئيسي",
      lat: 21.5600, lng: 39.1900,
      status: "PUBLISHED" as const,
      availability: "AVAILABLE" as const,
      agentId: o2Owner.id,
      publishedAt: daysAgo(14),
      images: [
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
      ],
    },
  ];

  const o2Properties = [];
  for (const p of o2PropertiesData) {
    const { images, ...data } = p;
    const property = await prisma.property.create({ data: { officeId: office2.id, ...data } });
    o2Properties.push(property);

    if (images.length > 0) {
      await prisma.propertyMedia.createMany({
        data: images.map((url, i) => ({
          propertyId: property.id,
          url,
          type: "IMAGE" as const,
          sortOrder: i,
        })),
      });
    }
    console.log(`    ${property.slug}`);
  }

  // ─── Office 2 Leads ─────────────────────────────────────────────────────

  console.log("  Creating Office 2 leads...");

  await prisma.leadActivity.deleteMany({ where: { lead: { officeId: office2.id } } });
  await prisma.lead.deleteMany({ where: { officeId: office2.id } });

  await prisma.lead.create({
    data: {
      officeId: office2.id,
      propertyId: o2Properties[0].id,
      name: "Hassan Al-Malki",
      phone: "+966550003333",
      email: "hassan@example.com",
      message: "I want to schedule a visit to the sea-view villa in Obhur.",
      source: "WHATSAPP_CLICK",
      status: "NEW",
      agentId: o2Agent1.id,
      createdAt: daysAgo(2),
    },
  });

  await prisma.lead.create({
    data: {
      officeId: office2.id,
      name: "Aisha Al-Juhani",
      phone: "+966550004444",
      email: "aisha@example.com",
      message: "Looking for office space near Al-Tahlia. Budget around 100K SAR/year.",
      source: "CONTACT_FORM",
      status: "QUALIFIED",
      agentId: o2Agent2.id,
      createdAt: daysAgo(4),
    },
  });

  // ─── Office 2 Analytics ─────────────────────────────────────────────────

  await prisma.analyticsEvent.deleteMany({ where: { officeId: office2.id } });

  const o2Analytics = [];
  for (let i = 0; i < 30; i++) {
    const eventType = pickRandom(eventTypes);
    const ref = pickRandom(referrers);
    const day = randomBetween(0, 29);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - day);
    createdAt.setHours(randomBetween(6, 23), randomBetween(0, 59), 0, 0);

    o2Analytics.push({
      officeId: office2.id,
      propertyId: eventType.includes("view") || eventType === "lead_submit" ? pickRandom(o2Properties).id : null,
      eventType,
      sessionId: `session_${randomBetween(1000, 9999)}`,
      visitorId: `visitor_${randomBetween(1, 15)}`,
      referrer: ref.referrer,
      referrerType: ref.referrerType,
      userAgent: pickRandom(userAgents),
      ip: `${randomBetween(1, 255)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(1, 254)}`,
      city: "Jeddah",
      page: eventType === "property_view" ? `/al-fares-properties/properties/${pickRandom(o2Properties).slug}` : `/al-fares-properties`,
      metadata: {},
      createdAt,
    });
  }
  await prisma.analyticsEvent.createMany({ data: o2Analytics });

  // ─── Office 2 Notifications ─────────────────────────────────────────────

  await prisma.notification.deleteMany({ where: { officeId: office2.id } });
  await prisma.notification.createMany({
    data: [
      {
        officeId: office2.id, userId: o2Owner.id,
        type: "lead_new", title: "New Lead Received", titleAr: "عميل محتمل جديد",
        message: "Hassan Al-Malki is interested in the sea-view villa.",
        messageAr: "حسن المالكي مهتم بالفيلا المطلة على البحر.",
        link: "/dashboard/leads", isRead: false, createdAt: daysAgo(2),
      },
    ],
  });

  await prisma.auditLog.deleteMany({ where: { officeId: office2.id } });
  await prisma.auditLog.createMany({
    data: [
      {
        officeId: office2.id, userId: o2Owner.id,
        action: "office_created", entity: "Office", entityId: office2.id,
        details: { name: "Al Fares Properties" },
        ip: "78.93.15.204", createdAt: daysAgo(30),
      },
    ],
  });

  console.log("  ✅ Office 2 complete!\n");

  // ─── DONE ──────────────────────────────────────────────────────────────────

  console.log("\n✅ Seed completed successfully!\n");
  console.log("  Login credentials:");
  console.log("  ──────────────────────────────────────────────────────");
  console.log("  Super Admins:");
  console.log("    admin@falz.sa             / Admin123!");
  console.log("    support@falz.sa           / Admin123!");
  console.log("");
  console.log("  Office 1 - Dar Al-Aseel (Riyadh):");
  console.log("    ahmed@dar-al-aseel.sa     / Owner123!   (Owner)");
  console.log("    sara@dar-al-aseel.sa      / Manager123! (Manager)");
  console.log("    khalid@dar-al-aseel.sa    / Agent123!   (Agent)");
  console.log("    nora@dar-al-aseel.sa      / Agent123!   (Agent)");
  console.log("");
  console.log("  Office 2 - Al Fares Properties (Jeddah):");
  console.log("    mohammed@al-fares.sa      / Owner123!   (Owner)");
  console.log("    layla@al-fares.sa         / Manager123! (Manager)");
  console.log("    omar@al-fares.sa          / Agent123!   (Agent)");
  console.log("    fatimah@al-fares.sa       / Agent123!   (Agent)");
  console.log("  ──────────────────────────────────────────────────────\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
