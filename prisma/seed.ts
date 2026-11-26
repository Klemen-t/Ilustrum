import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciant seed de la plataforma educativa ILUSTRUM (Especialitat: FP Informàtica - IC10 SMIX)...");

  // 1. Rols
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "student" },
      update: {},
      create: { name: "student" },
    }),
    prisma.role.upsert({
      where: { name: "teacher" },
      update: {},
      create: { name: "teacher" },
    }),
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
  ]);
  console.log("✅ Rols creats:", roles.map((r) => r.name).join(", "));

  // 2. Rareses amb la nova distribució estricta:
  // Comú 75%, Poc comú 18%, Rar 5%, Èpic 1.8%, Llegendari 0.2%
  const rarities = await Promise.all([
    prisma.rarity.upsert({
      where: { nameKey: "common" },
      update: { probability: 0.75 },
      create: {
        name: "Comú",
        nameKey: "common",
        probability: 0.75,
        colorHex: "#9ca3af",
        glowColor: "#9ca3af40",
        sortOrder: 1,
      },
    }),
    prisma.rarity.upsert({
      where: { nameKey: "uncommon" },
      update: { probability: 0.18 },
      create: {
        name: "Poc comú",
        nameKey: "uncommon",
        probability: 0.18,
        colorHex: "#4ade80",
        glowColor: "#4ade8040",
        sortOrder: 2,
      },
    }),
    prisma.rarity.upsert({
      where: { nameKey: "rare" },
      update: { probability: 0.05 },
      create: {
        name: "Rar",
        nameKey: "rare",
        probability: 0.05,
        colorHex: "#60a5fa",
        glowColor: "#60a5fa40",
        sortOrder: 3,
      },
    }),
    prisma.rarity.upsert({
      where: { nameKey: "epic" },
      update: { probability: 0.018 },
      create: {
        name: "Èpic",
        nameKey: "epic",
        probability: 0.018,
        colorHex: "#c084fc",
        glowColor: "#c084fc40",
        sortOrder: 4,
      },
    }),
    prisma.rarity.upsert({
      where: { nameKey: "legendary" },
      update: { probability: 0.002 },
      create: {
        name: "Llegendari",
        nameKey: "legendary",
        probability: 0.002,
        colorHex: "#fbbf24",
        glowColor: "#fbbf2440",
        sortOrder: 5,
      },
    }),
  ]);
  console.log("✅ Rareses creades:", rarities.map((r) => r.name).join(", "));

  // 3. Categories tècniques per a SMIX
  const categoriesData = [
    { name: "Hardware & Arquitectura", slug: "hardware", color: "#f59e0b", icon: "cpu" },
    { name: "Sistemes Operatius & Shell", slug: "so-linux-windows", color: "#3b82f6", icon: "terminal" },
    { name: "Xarxes Locals & Protocols", slug: "xarxes", color: "#10b981", icon: "network" },
    { name: "Ciberseguretat & Sistemes", slug: "seguretat", color: "#ef4444", icon: "shield" },
    { name: "Serveis de Xarxa & Web", slug: "serveis-web", color: "#8b5cf6", icon: "globe" },
    { name: "Ofimàtica & Eines Tècniques", slug: "ofimatica", color: "#06b6d4", icon: "file-text" },
    { name: "Música d'Autor & Pop Català", slug: "musica-autor", color: "#ec4899", icon: "music" },
    { name: "Power Metal & Hollywood Metal", slug: "power-metal", color: "#ef4444", icon: "flame" },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, color: c.color, icon: c.icon },
        create: c,
      })
    )
  );
  console.log("✅ Categories SMIX creades:", categories.map((c) => c.name).join(", "));

  // 4. Mòduls Oficials de IC10 (SMIX) - 1r i 2n curs
  const subjectsData = [
    // 1r Curs SMIX
    { name: "M01: Muntatge i manteniment d'equips", slug: "smix-m01-mme", color: "#f59e0b" },
    { name: "M02: Sistemes operatius monolloc", slug: "smix-m02-som", color: "#3b82f6" },
    { name: "M03: Aplicacions ofimàtiques", slug: "smix-m03-ao", color: "#06b6d4" },
    { name: "M05: Xarxes locals", slug: "smix-m05-xl", color: "#10b981" },
    { name: "M09: Formació i orientació laboral (FOL)", slug: "smix-m09-fol", color: "#ec4899" },
    { name: "Anglès professional", slug: "smix-angles", color: "#14b8a6" },
    // 2n Curs SMIX
    { name: "M04: Sistemes operatius en xarxa", slug: "smix-m04-sox", color: "#6366f1" },
    { name: "M06: Seguretat informàtica", slug: "smix-m06-si", color: "#ef4444" },
    { name: "M07: Serveis de xarxa", slug: "smix-m07-sx", color: "#8b5cf6" },
    { name: "M08: Aplicacions web", slug: "smix-m08-aw", color: "#eab308" },
    { name: "M10: Empresa i iniciativa emprenedora (EIE)", slug: "smix-m10-eie", color: "#f97316" },
    { name: "M11: Projecte intermodular / Síntesi", slug: "smix-m11-projecte", color: "#84cc16" },
    // Cultura Musical & Temàtics Especials
    { name: "Música Trista - Joan Dausà", slug: "cultura-musica-trista", color: "#a855f7" },
    { name: "Música Bemparida - Rhapsody & Power Metal", slug: "cultura-musica-bemparida", color: "#dc2626" },
  ];

  const subjects = await Promise.all(
    subjectsData.map((s) =>
      prisma.subject.upsert({
        where: { slug: s.slug },
        update: { name: s.name, color: s.color },
        create: s,
      })
    )
  );
  console.log("✅ Mòduls SMIX creats (1r i 2n curs):", subjects.length);

  // 5. Configuració de l'aplicació
  const configs = [
    { key: "rarity.common.probability", value: "0.75" },
    { key: "rarity.uncommon.probability", value: "0.18" },
    { key: "rarity.rare.probability", value: "0.05" },
    { key: "rarity.epic.probability", value: "0.018" },
    { key: "rarity.legendary.probability", value: "0.002" },
    { key: "question.time_limit_seconds", value: "20" },
    { key: "trade.expiry_hours", value: "48" },
    { key: "rate_limit.answers_per_minute", value: "15" },
  ];

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  // Helper de rareses i categories
  const getRarity = (nameKey: string) => rarities.find((r) => r.nameKey === nameKey)!;
  const getCategory = (slug: string) => categories.find((c) => c.slug === slug)!;
  const getSubject = (slug: string) => subjects.find((s) => s.slug === slug)!;

  // ========================================================
  // 6. ÀLBUM 1: Hardware & Muntatge d'Equips (SMIX M01) - 50 CROMOS
  // ========================================================
  const album1 = await prisma.album.upsert({
    where: { id: "album-smix-m01-hardware" },
    update: {
      name: "Hardware & Muntatge d'Equips (SMIX M01)",
      description: "Col·lecció de 50 cromos dels components essencials, microarquitectures i eines de taller del tècnic informàtic.",
      totalCards: 50,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: "album-smix-m01-hardware",
      name: "Hardware & Muntatge d'Equips (SMIX M01)",
      description: "Col·lecció de 50 cromos dels components essencials, microarquitectures i eines de taller del tècnic informàtic.",
      totalCards: 50,
      sortOrder: 1,
      isActive: true,
    },
  });

  // Crear 5 pàgines per a l'Àlbum 1 (10 cromos per pàgina)
  const album1Pages = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.albumPage.upsert({
        where: { albumId_pageNum: { albumId: album1.id, pageNum: i + 1 } },
        update: { layout: "grid-5x2" },
        create: {
          albumId: album1.id,
          pageNum: i + 1,
          layout: "grid-5x2",
        },
      })
    )
  );

  // 50 cromos per a l'Àlbum 1
  const cardsAlbum1Data = [
    // Pàgina 1: Processadors & Sòcols (1-10)
    { num: 1, name: "Intel Core i9-14900K", rarity: "legendary", cat: "hardware", desc: "Flagship de 24 nuclis (8P+16E) i 32 fils fins a 6.0 GHz en sòcol LGA1700." , imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80" },
    { num: 2, name: "AMD Ryzen 9 7950X", rarity: "uncommon", cat: "hardware", desc: "Processador Zen 4 de 16 nuclis i 32 fils a 5.7 GHz en sòcol AM5." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 3, name: "Sòcol Intel LGA1700", rarity: "common", cat: "hardware", desc: "Sòcol Land Grid Array amb 1700 pins al sòcol i contactes al processador." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 4, name: "Sòcol AMD AM5", rarity: "common", cat: "hardware", desc: "Primer sòcol LGA d'AMD per a escriptori amb 1718 pins i suport DDR5." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 5, name: "Intel Core i5-13400F", rarity: "common", cat: "hardware", desc: "Processador de gamma mitjana de 10 nuclis sense gràfics integrats." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 6, name: "AMD Ryzen 5 7600", rarity: "common", cat: "hardware", desc: "Processador de 6 nuclis i 12 fils amb arquitectura Zen 4 i 65W TDP." , imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80" },
    { num: 7, name: "Microarquitectura Zen 4", rarity: "common", cat: "hardware", desc: "Litografia de 5nm de TSMC amb instruccions AVX-512 per a càlcul vectorial." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 8, name: "Bus PCIe 5.0", rarity: "uncommon", cat: "hardware", desc: "Interconnexió amb ample de banda de fins a 32 GT/s per carril." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 9, name: "Memòria Cau L3 Compartida", rarity: "common", cat: "hardware", desc: "Memòria ultraràpida integrada a la CPU de fins a 96MB amb 3D V-Cache." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 10, name: "Intel Core Ultra 9 Meteor Lake", rarity: "common", cat: "hardware", desc: "Arquitectura desglossada en chiplets (tiles) amb NPU d'intel·ligència artificial." , imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 2: Memòria & Emmagatzematge (11-20)
    { num: 11, name: "Memòria RAM DDR5 6000MHz", rarity: "rare", cat: "hardware", desc: "Mòdul DDR5 amb circuits integrats PMIC a la placa i ECC al xip (on-die)." , imageUrl: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80" },
    { num: 12, name: "Memòria RAM DDR4 3200MHz", rarity: "common", cat: "hardware", desc: "Estàndard àmpliament utilitzat de 288 contactes amb voltatge típic de 1.2V." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 13, name: "SSD NVMe M.2 PCIe 4.0", rarity: "uncommon", cat: "hardware", desc: "Unitat d'estat sòlid M.2 2280 amb velocitats de lectura de fins a 7.400 MB/s." , imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80" },
    { num: 14, name: "SSD SATA 2.5 polzades", rarity: "common", cat: "hardware", desc: "Unitat d'emmagatzematge sòlid amb interfície SATA III limitada a 600 MB/s." , imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80" },
    { num: 15, name: "Disc Dur HDD 3.5 7200 RPM", rarity: "common", cat: "hardware", desc: "Unitat magnètica mecànica amb plats giratoris i capçal de lectura/escriptura." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 16, name: "Perfil Intel XMP 3.0", rarity: "common", cat: "hardware", desc: "Perfils d'overclocking predefinits al mòdul SPD de la memòria RAM." , imageUrl: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80" },
    { num: 17, name: "Perfil AMD EXPO", rarity: "common", cat: "hardware", desc: "Estàndard obert per a perfils de sincronització de memòria d'alta freqüència." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 18, name: "Configuració RAID 0 (Stripping)", rarity: "common", cat: "hardware", desc: "Distribució de dades entre discos per màxima velocitat sense tolerància a fallades." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 19, name: "Configuració RAID 1 (Mirroring)", rarity: "common", cat: "hardware", desc: "Duplicació idèntica de la informació en dos discs per tolerància a fallades." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 20, name: "Configuració RAID 5 amb Paritat", rarity: "uncommon", cat: "hardware", desc: "Combina paritat distribuïda i rendiment amb un mínim de 3 discos requerits." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 3: Plaques Base & Xipsets (21-30)
    { num: 21, name: "Placa Base ASUS ROG Maximus", rarity: "rare", cat: "hardware", desc: "Placa mare de gamma alta per a entusiastes amb 24 fases de potència i Wi-Fi 7." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 22, name: "Factor de Forma ATX", rarity: "common", cat: "hardware", desc: "Mida estàndard de 305 x 244 mm amb fins a 7 ranures d'expansió disponibles." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 23, name: "Factor de Forma Micro-ATX", rarity: "common", cat: "hardware", desc: "Mida compacta de 244 x 244 mm ideal per torres mitjanes d'oficina." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 24, name: "Factor de Forma Mini-ITX", rarity: "common", cat: "hardware", desc: "Mida ultracompacta de 170 x 170 mm amb només una ranura PCIe x16." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 25, name: "Firmware UEFI BIOS", rarity: "uncommon", cat: "hardware", desc: "Substitut modern de la BIOS clàssica amb suport GPT, Secure Boot i interfície gràfica." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 26, name: "Pila de Botó CMOS CR2032", rarity: "common", cat: "hardware", desc: "Bateria de liti de 3V que manté l'hora del sistema RTC i la memòria volàtil CMOS." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 27, name: "Fases d'Alimentació VRM", rarity: "common", cat: "hardware", desc: "Mòdul regulador de voltatge que redueix els 12V de la font al voltatge precís de la CPU." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 28, name: "Xipset Intel Z790", rarity: "uncommon", cat: "hardware", desc: "Controlador principal de placa amb suport complet d'overclocking i carrils PCIe gen 5." , imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80" },
    { num: 29, name: "Xipset AMD B650", rarity: "common", cat: "hardware", desc: "Plataforma equilibrada per a processadors AM5 amb excel·lent relació qualitat-preu." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 30, name: "Xip Criptogràfic TPM 2.0", rarity: "common", cat: "hardware", desc: "Mòdul de plataforma segura per a emmagatzematge de claus BitLocker i seguretat." , imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 4: Refrigeració & Alimentació (31-40)
    { num: 31, name: "Font d'Alimentació 850W 80 Plus Gold", rarity: "uncommon", cat: "hardware", desc: "Font eficient amb més d'un 90% d'eficiència energètica i condensadors japonesos." , imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80" },
    { num: 32, name: "Font d'Alimentació Totalment Modular", rarity: "common", cat: "hardware", desc: "Permet connectar només els cables necessaris facilitant la gestió de flux d'aire." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 33, name: "Dissipador d'Aire amb Heatpipes", rarity: "common", cat: "hardware", desc: "Bloc d'aletes d'alumini amb tubs de coure de canvi de fase per conduir la calor." , imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80" },
    { num: 34, name: "Refrigeració Líquida AIO 360mm", rarity: "rare", cat: "hardware", desc: "Circuit tancat de bomba, tub i radiador triple de 360mm per a màxima transferència." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },
    { num: 35, name: "Ventilador PWM de 120mm", rarity: "common", cat: "hardware", desc: "Ventilador amb connector de 4 pins per a control precís de velocitat per polsos." , imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80" },
    { num: 36, name: "Consum Tèrmic de Disseny (TDP)", rarity: "common", cat: "hardware", desc: "Potència màxima de calor que el sistema de refrigeració ha de ser capaç de dissipar." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 37, name: "Pasta Tèrmica d'Alt Rendiment", rarity: "common", cat: "hardware", desc: "Compost tèrmic que elimina les microbufetes d'aire entre l'IHS de la CPU i la base." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 38, name: "Certificació 80 Plus Platinum", rarity: "common", cat: "hardware", desc: "Certificació d'altíssima eficiència del 92-94% sota càrregues de treball contínues." , imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80" },
    { num: 39, name: "Cable PCIe 12VHPWR (ATX 3.0)", rarity: "uncommon", cat: "hardware", desc: "Connector de 16 pins capaç de subministrar fins a 600W de potència directa a la GPU." , imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80" },
    { num: 40, name: "Refrigeració Líquida Custom Loop", rarity: "common", cat: "hardware", desc: "Circuit artesanal amb dipòsit, tubs rígids de metacrilat i blocs d'aigua dedicats." , imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 5: Targetes Gràfiques & Eines de Taller (41-50)
    { num: 41, name: "NVIDIA GeForce RTX 4090 24GB", rarity: "epic", cat: "hardware", desc: "La GPU d'escriptori més potent amb 16.384 nuclis CUDA i arquitectura Ada Lovelace." , imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80" },
    { num: 42, name: "AMD Radeon RX 7900 XTX 24GB", rarity: "common", cat: "hardware", desc: "Targeta gràfica amb disseny de chiplets RDNA 3 i tecnologia DisplayPort 2.1." , imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80" },
    { num: 43, name: "NVIDIA GeForce RTX 4060 8GB", rarity: "common", cat: "hardware", desc: "Targeta gràfica eficient per a resolució 1080p amb suport DLSS 3 Frame Generation." , imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80" },
    { num: 44, name: "Polsera Antiestàtica ESD", rarity: "common", cat: "hardware", desc: "Protecció obligatòria de taller que deriva l'electricitat estàtica a presa de terra." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 45, name: "Tornavís Imantat Phillips PH2", rarity: "common", cat: "hardware", desc: "L'eina bàsica indispensable per al caragolat segur de plaques i fonts a la caixa." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 46, name: "Multímetre Digital True RMS", rarity: "uncommon", cat: "hardware", desc: "Instrument per mesurar tensions contínues (+12V, +5V, +3.3V) a la font d'alimentació." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 47, name: "Tester de Fonts d'Alimentació ATX", rarity: "common", cat: "hardware", desc: "Comprovador ràpid amb pantalla LCD dels rails de voltatge i del senyal Power Good." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 48, name: "Targeta de Diagnòstic PCI POST", rarity: "common", cat: "hardware", desc: "Dispositiu amb visualitzador hexadecimal per detectar codis d'error d'arrencada." , imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 49, name: "Alcohol Isopropílic 99.9%", rarity: "common", cat: "hardware", desc: "Solvent de neteja d'evaporació ràpida ideal per retirar pasta tèrmica ressecada." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 50, name: "Valisa d'Eines del Tècnic SMIX", rarity: "common", cat: "hardware", desc: "Equip complet professional de claus, extractors, alicates i pinces de precisió." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
  ];

  for (const c of cardsAlbum1Data) {
    const pageNum = Math.ceil(c.num / 10);
    const page = album1Pages[pageNum - 1];
    const rarity = getRarity(c.rarity);
    const category = getCategory(c.cat);

    await prisma.card.upsert({
      where: { albumId_number: { albumId: album1.id, number: c.num } },
      update: {
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        pageId: page.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
      create: {
        albumId: album1.id,
        pageId: page.id,
        number: c.num,
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
    });
  }
  console.log("✅ Àlbum 1 (Hardware SMIX M01): 50 cromos creats!");

  // ========================================================
  // 7. ÀLBUM 2: Xarxes Locals & Sistemes Operatius (SMIX M02/M05) - 50 CROMOS
  // ========================================================
  const album2 = await prisma.album.upsert({
    where: { id: "album-smix-m02-m05-xarxes" },
    update: {
      name: "Xarxes Locals & Sistemes Operatius (SMIX M02/M05)",
      description: "Col·lecció de 50 cromos sobre Linux, Windows Server, cablejat estructurat, adreçament IP i protocols de xarxa.",
      totalCards: 50,
      sortOrder: 2,
      isActive: true,
    },
    create: {
      id: "album-smix-m02-m05-xarxes",
      name: "Xarxes Locals & Sistemes Operatius (SMIX M02/M05)",
      description: "Col·lecció de 50 cromos sobre Linux, Windows Server, cablejat estructurat, adreçament IP i protocols de xarxa.",
      totalCards: 50,
      sortOrder: 2,
      isActive: true,
    },
  });

  // Crear 5 pàgines per a l'Àlbum 2
  const album2Pages = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.albumPage.upsert({
        where: { albumId_pageNum: { albumId: album2.id, pageNum: i + 1 } },
        update: { layout: "grid-5x2" },
        create: {
          albumId: album2.id,
          pageNum: i + 1,
          layout: "grid-5x2",
        },
      })
    )
  );

  // 50 cromos per a l'Àlbum 2
  const cardsAlbum2Data = [
    // Pàgina 1: Comandaments Linux & Kernel (1-10)
    { num: 1, name: "Kernel Linux Monolític", rarity: "legendary", cat: "so-linux-windows", desc: "Nucli del sistema operatiu que gestiona la CPU, la memòria i els dispositius mitjançant mòduls." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },
    { num: 2, name: "GNU Bash Shell", rarity: "uncommon", cat: "so-linux-windows", desc: "Intèrpret d'ordres estàndard de la majoria de distribucions GNU/Linux amb suport de scripts." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 3, name: "Comandament sudo (SuperUser DO)", rarity: "common", cat: "so-linux-windows", desc: "Permet a usuaris autoritzats executar ordres amb privilegis de superusuari root." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },
    { num: 4, name: "Permisos Octals chmod 755", rarity: "uncommon", cat: "so-linux-windows", desc: "Assigna lectura, escriptura i execució al propietari, i lectura/execució al grup i altres." , imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
    { num: 5, name: "Comandament grep & Regex", rarity: "common", cat: "so-linux-windows", desc: "Utilitat fonamental de línia d'ordres per cercar patrons de text mitjançant expressions regulars." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 6, name: "Gestor de Serveis systemd (systemctl)", rarity: "common", cat: "so-linux-windows", desc: "Sistema d'inici i gestor de serveis que controla dimonis, unitats i arrencada en paral·lel." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },
    { num: 7, name: "Gestor de Paquets APT & dpkg", rarity: "common", cat: "so-linux-windows", desc: "Eines per a instal·lació, actualització i resolució automàtica de dependències a Debian/Ubuntu." , imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
    { num: 8, name: "Enllaç Simbòlic (ln -s)", rarity: "common", cat: "so-linux-windows", desc: "Fitxer especial que fa d'accés directe apuntant a la ruta d'un altre fitxer o directori." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 9, name: "Protocol Gràfic Wayland", rarity: "common", cat: "so-linux-windows", desc: "Servidor de visualització modern i segur que substitueix el clàssic servidor X11 a Linux." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },
    { num: 10, name: "Distribució Debian GNU/Linux", rarity: "common", cat: "so-linux-windows", desc: "El 'sistema operatiu universal', base sòlida i estable d'Ubuntu, Linux Mint i Kali." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 2: Windows & Active Directory (11-20)
    { num: 11, name: "PowerShell Core 7", rarity: "uncommon", cat: "so-linux-windows", desc: "Intèrpret de comandes basat en objectes .NET per a automatització i administració avançada." , imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
    { num: 12, name: "Registre del Sistema de Windows (regedit)", rarity: "common", cat: "so-linux-windows", desc: "Base de dades jeràrquica centralitzada que emmagatzema paràmetres del sistema i programes." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 13, name: "Directives de Grup (GPO)", rarity: "common", cat: "so-linux-windows", desc: "Conjunt de regles que permeten als administradors configurar equips i usuaris de manera massiva." , imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },
    { num: 14, name: "Sistema de Fitxers NTFS & Llistes ACL", rarity: "common", cat: "so-linux-windows", desc: "Sistema de fitxers de Windows amb suport de permisos d'usuari granulars, xifrat i quotes." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 15, name: "Visor d'Esdeveniments (Event Viewer)", rarity: "common", cat: "so-linux-windows", desc: "Eina per diagnosticar errors de maquinari, seguretat i aplicacions als registres del sistema." , imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80" },
    { num: 16, name: "Sysinternals Process Explorer", rarity: "common", cat: "so-linux-windows", desc: "Monitor avançat de processos que mostra les DLLs carregades i identificadors oberts." , imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80" },
    { num: 17, name: "Windows Subsystem for Linux (WSL2)", rarity: "common", cat: "so-linux-windows", desc: "Capa que executa un nucli Linux autèntic dins de Windows mitjançant virtualització lleugera." , imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80" },
    { num: 18, name: "Control de Comptes d'Usuari (UAC)", rarity: "common", cat: "so-linux-windows", desc: "Mecanisme de seguretat que demana confirmació abans de concedir privilegis administratius." , imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },
    { num: 19, name: "Active Directory Domain Services (AD DS)", rarity: "rare", cat: "so-linux-windows", desc: "Directori centralitzat d'identitats per a la gestió d'usuaris, equips i polítiques en xarxa." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 20, name: "Administrador de Tasques de Windows", rarity: "common", cat: "so-linux-windows", desc: "Utilitat ràpida per visualitzar consum de CPU, RAM, disc, xarxa i finalitzar processos penjats." , imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 3: Cablejat & Capa Física de Xarxa (21-30)
    { num: 21, name: "Cable de Parell Trenat Cat 6A UTP", rarity: "common", cat: "xarxes", desc: "Cable de 4 parells trenats de coure certificat per a transmissions de 10 Gbps fins a 100 metres." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 22, name: "Connector Modular RJ-45", rarity: "common", cat: "xarxes", desc: "Connector de 8 pins (8P8C) emprat habitualment en xarxes Ethernet sota norma T568B." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 23, name: "Eina de Crimpador RJ-45", rarity: "common", cat: "xarxes", desc: "Tenalla de pressió per fixar les fulles de coure del connector als fils del cable de xarxa." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
    { num: 24, name: "Cable de Fibra Òptica Monomode (SMF)", rarity: "uncommon", cat: "xarxes", desc: "Fibra amb nucli de 9 micres que permet transmetre làser a desenes de quilòmetres sense pèrdua." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 25, name: "Cable de Fibra Òptica Multimode (MMF)", rarity: "common", cat: "xarxes", desc: "Fibra amb nucli de 50/62.5 micres que transmet senyal LED en distàncies curtes de CPD." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 26, name: "Mòdul Transceptor SFP+ 10Gbps", rarity: "epic", cat: "xarxes", desc: "Adaptador connectable en calent per interconnectar switches mitjançant fibra òptica." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 27, name: "Switch Gestionable de Nivell 2", rarity: "rare", cat: "xarxes", desc: "Commutador capaç de reenviar trames segons l'adreça MAC i configurar VLANs i QoS." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 28, name: "Patch Panel de 24 Ports Cat 6", rarity: "uncommon", cat: "xarxes", desc: "Panell de pegat on s'insereixen els cables que arriben de les rosetes mitjançant eina d'impacte." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 29, name: "Armari Rack de 19 Polzades", rarity: "common", cat: "xarxes", desc: "Estructura metàl·lica estandarditzada per a allotjament de servidors, switches i SAI." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 30, name: "Comprovador de Continuïtat Tester RJ-45", rarity: "common", cat: "xarxes", desc: "Dispositiu de leds que verifica la continuïtat i el mapa de connexions dels 8 fils del cable." , imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 4: Adreçament IP & Protocols (31-40)
    { num: 31, name: "Format d'Adreçament IPv4", rarity: "common", cat: "xarxes", desc: "Adreça lògica de 32 bits representada en 4 octets decimals com ara 192.168.1.1." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 32, name: "Rangs d'IPs Privades RFC 1918", rarity: "common", cat: "xarxes", desc: "Adreces reservades per a xarxes locals (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) no enrutables a Internet." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 33, name: "Màscara de Subxarxa & Notació CIDR /24", rarity: "uncommon", cat: "xarxes", desc: "Delimita quina part de l'adreça IP correspon a la xarxa (24 bits) i quina als equips (8 bits)." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 34, name: "Protocol d'Adreçament IPv6 (128 bits)", rarity: "common", cat: "xarxes", desc: "Protocol successor d'IPv4 amb format hexadecimal i espai d'adreces pràcticament infinit." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 35, name: "Protocol de Resolució d'Adreces (ARP)", rarity: "common", cat: "xarxes", desc: "Tradueix adreces de xarxa IPv4 a adreces físiques MAC a la xarxa local." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 36, name: "Protocol ICMP & Comandament Ping", rarity: "common", cat: "xarxes", desc: "Envia missatges Echo Request per verificar la connectivitat i mesurar la latència RTT." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 37, name: "Protocol DHCP (Procés DORA)", rarity: "uncommon", cat: "xarxes", desc: "Assignació automàtica de configuració IP mitjançant Discover, Offer, Request i Acknowledge." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 38, name: "Comandament Traceroute / Tracert", rarity: "common", cat: "xarxes", desc: "Descobreix els routers intermedis que travessa un paquet incrementant el valor TTL." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 39, name: "Protocol TCP (Three-Way Handshake)", rarity: "common", cat: "xarxes", desc: "Protocol orientat a connexió amb control de flux que estableix sessions amb SYN, SYN-ACK, ACK." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 40, name: "Protocol de Datagrames UDP", rarity: "common", cat: "xarxes", desc: "Protocol ràpid sense connexió ideal per a streaming de vídeo en directe, jocs online i DNS." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 5: Serveis de Xarxa & Ciberseguretat (41-50)
    { num: 41, name: "Sistema de Noms de Domini (DNS Port 53)", rarity: "common", cat: "serveis-web", desc: "Resolució jeràrquica que tradueix noms de domini llegibles (ex. lacetania.cat) a adreces IP." , imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80" },
    { num: 42, name: "Protocol Segur SSH (Port 22)", rarity: "common", cat: "serveis-web", desc: "Canal xifrat per gestionar terminals remotes i transferir fitxers amb claus asimètriques." , imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
    { num: 43, name: "Xarxes Virtuals VLAN 802.1Q", rarity: "uncommon", cat: "xarxes", desc: "Segmentació lògica de dominis de difusió broadcast dins d'un mateix switch físic." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 44, name: "Enllaç Troncal Trunk 802.1Q", rarity: "common", cat: "xarxes", desc: "Port d'interconnexió entre switches que etiqueta i transporta el trànsit de múltiples VLANs." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 45, name: "Analitzador de Paquets Wireshark", rarity: "rare", cat: "seguretat", desc: "Eina fonamental per inspeccionar trames i paquets capturats en temps real a la targeta de xarxa." , imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80" },
    { num: 46, name: "Tallafoc de Paquets Iptables / Nftables", rarity: "common", cat: "seguretat", desc: "Filtre del nucli de Linux que permet acceptar, rebutjar o fer NAT de paquets de xarxa." , imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },
    { num: 47, name: "Servidor Web Nginx (HTTP/HTTPS)", rarity: "uncommon", cat: "serveis-web", desc: "Servidor web d'alt rendiment i proxy invers asíncron lleuger basat en esdeveniments." , imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80" },
    { num: 48, name: "Protocol de Xifrat TLS 1.3", rarity: "common", cat: "seguretat", desc: "Capa de transport xifrada moderna que garanteix privacitat i integritat a HTTPS." , imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },
    { num: 49, name: "Model OSI de 7 Capes de la ISO", rarity: "common", cat: "xarxes", desc: "Física, Enllaç, Xarxa, Transport, Sessió, Presentació i Aplicació: la base de les telecomunicacions." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
    { num: 50, name: "Router d'Accés per Fibra FTTH", rarity: "common", cat: "xarxes", desc: "Equip terminal de xarxa òptica (ONT/Router) que commuta paquets entre la WAN i la xarxa LAN local." , imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80" },
  ];

  for (const c of cardsAlbum2Data) {
    const pageNum = Math.ceil(c.num / 10);
    const page = album2Pages[pageNum - 1];
    const rarity = getRarity(c.rarity);
    const category = getCategory(c.cat);

    await prisma.card.upsert({
      where: { albumId_number: { albumId: album2.id, number: c.num } },
      update: {
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        pageId: page.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
      create: {
        albumId: album2.id,
        pageId: page.id,
        number: c.num,
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
    });
  }
  console.log("✅ Àlbum 2 (Xarxes & SO SMIX M02/M05): 50 cromos creats!");

  // ========================================================
  // 7b. ÀLBUM 3: Música Trista (Joan Dausà & Melangia) - 50 CROMOS
  // ========================================================
  const album3 = await prisma.album.upsert({
    where: { id: "album-musica-trista" },
    update: {
      name: "Música Trista",
      description: "Col·lecció de 50 cromos inspirada en les cançons, lletres, emocions i la trajectòria de Joan Dausà: des de 'Jo Mai Mai' i 'Judit' fins a 'Ara Som Gegants' i els grans concerts.",
      totalCards: 50,
      sortOrder: 3,
      isActive: true,
    },
    create: {
      id: "album-musica-trista",
      name: "Música Trista",
      description: "Col·lecció de 50 cromos inspirada en les cançons, lletres, emocions i la trajectòria de Joan Dausà: des de 'Jo Mai Mai' i 'Judit' fins a 'Ara Som Gegants' i els grans concerts.",
      totalCards: 50,
      sortOrder: 3,
      isActive: true,
    },
  });

  const album3Pages = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.albumPage.upsert({
        where: { albumId_pageNum: { albumId: album3.id, pageNum: i + 1 } },
        update: { layout: "grid-5x2" },
        create: {
          albumId: album3.id,
          pageNum: i + 1,
          layout: "grid-5x2",
        },
      })
    )
  );

  const cardsAlbum3Data = [
    // Pàgina 1: Cançons Mítiques & Inicis (1-10)
    { num: 1, name: "Joan Dausà - La Gran Bogeria al Sant Jordi", rarity: "legendary", cat: "musica-autor", desc: "El concert històric davant de més de 16.000 persones al Palau Sant Jordi celebrant la gran bogeria de viure.", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80" },
    { num: 2, name: "Jo Mai Mai - El Sopar dels Secrets", rarity: "epic", cat: "musica-autor", desc: "L'himne generacional on un brindis innocent entre amics destapa la confessió d'amor més vulnerable.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80" },
    { num: 3, name: "Judit - Deu Anys Després", rarity: "epic", cat: "musica-autor", desc: "La resposta esperada a 'Jo Mai Mai': una trucada, un retrobament i les cicatrius que el temps no esborra.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 4, name: "Una Altra Manera de Viure", rarity: "rare", cat: "musica-autor", desc: "Cançó d'homenatge al mar Mediterrani i al compromís amb la natura al costat de Maria Rodés i Santi Balmes.", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80" },
    { num: 5, name: "Ara Som Gegants", rarity: "rare", cat: "musica-autor", desc: "El cant triomfal a la superació personal: mai no és tard per tornar a començar, ara som gegants.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },
    { num: 6, name: "La Gran Eufòria", rarity: "uncommon", cat: "musica-autor", desc: "El viatge emocional des de la melangia íntima cap a l'explosió de llum i celebració col·lectiva.", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80" },
    { num: 7, name: "Ho Tenim Tot", rarity: "uncommon", cat: "musica-autor", desc: "Una mirada agraïda a les petites coses essencials: tenir-nos a nosaltres és la veritable riquesa.", imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80" },
    { num: 8, name: "Tot Anirà Bé", rarity: "common", cat: "musica-autor", desc: "Un refugi sonor d'esperança i calidesa en els moments d'incertesa i foscor.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 9, name: "Que Tingues Sort", rarity: "common", cat: "musica-autor", desc: "La sentida versió del clàssic de Lluís Llach portada a la sensibilitat acústica de Dausà.", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80" },
    { num: 10, name: "Queda't Així", rarity: "common", cat: "musica-autor", desc: "L'instant aturat en el temps: voler congelar una mirada i un silenci abans del comiat inevitable.", imageUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 2: Discografia & Etapes (11-20)
    { num: 11, name: "Àlbum Jo Mai Mai (2012)", rarity: "uncommon", cat: "musica-autor", desc: "El disc de debut amb Els Tipus d'Interès que va marcar un abans i un després al pop d'autor català.", imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80" },
    { num: 12, name: "BSO Barcelona, Nit d'Estiu (2013)", rarity: "rare", cat: "musica-autor", desc: "Banda sonora guardonada amb el Premi Gaudí per posar música als amors fugaços de la nit barcelonina.", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80" },
    { num: 13, name: "Àlbum On Serem Demà? (2014)", rarity: "common", cat: "musica-autor", desc: "El segon àlbum d'estudi explorant les pors, la maduresa i la incertesa del futur.", imageUrl: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&auto=format&fit=crop&q=80" },
    { num: 14, name: "BSO Barcelona, Nit d'Hivern (2015)", rarity: "common", cat: "musica-autor", desc: "Melodies nostàlgiques entre llums de Nadal, fred als carrers i retrobaments imprevistos.", imageUrl: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&auto=format&fit=crop&q=80" },
    { num: 15, name: "Àlbum Ara Som Gegants (2018)", rarity: "uncommon", cat: "musica-autor", desc: "Consagració artística amb el Premi Enderrock al millor disc de cançó d'autor de l'any.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },
    { num: 16, name: "Àlbum Ho Tenim Tot (2021)", rarity: "common", cat: "musica-autor", desc: "Maduresa musical amb producció lluminosa de Santos & Fluren i Alizzz.", imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80" },
    { num: 17, name: "Directe al Teatre Grec", rarity: "common", cat: "musica-autor", desc: "Una nit màgica d'estiu sota la pedra de Montjuïc amb arranjaments especials de corda.", imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80" },
    { num: 18, name: "Festival Cruïlla al Capvespre", rarity: "uncommon", cat: "musica-autor", desc: "Milers de persones corejant cada tornada a l'aire lliure vora el mar al Parc del Fòrum.", imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80" },
    { num: 19, name: "Sessions Íntimes de Piano", rarity: "common", cat: "musica-autor", desc: "L'essència més nua de Joan Dausà: només la seva veu i les 88 tecles del piano acústic.", imageUrl: "https://images.unsplash.com/photo-1520523839898-507127053c37?w=600&auto=format&fit=crop&q=80" },
    { num: 20, name: "El Mic & Els Petits Sons", rarity: "common", cat: "musica-autor", desc: "El vincle tendre i entranyable de Joan Dausà posant veu al personatge infantil més estimat de Catalunya.", imageUrl: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 3: Lletres, Nostàlgia & Sentiments (21-30)
    { num: 21, name: "La Confessió a Mitja Veu", rarity: "uncommon", cat: "musica-autor", desc: "Aquell segon etern abans de dir la veritat que pot canviar tota una vida per sempre.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 22, name: "El Sopar entre Amics", rarity: "common", cat: "musica-autor", desc: "Copes de vi negre, rialles còmplices i la tensió silent d'un sentiment guardat anys en secret.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80" },
    { num: 23, name: "La Pluja sobre el Vidre", rarity: "common", cat: "musica-autor", desc: "La malenconia d'un diumenge a la tarda recordant tot allò que podia haver estat.", imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80" },
    { num: 24, name: "El Brindis Incòmode", rarity: "common", cat: "musica-autor", desc: "Alçar la copa amb una rialla fingida mentre per dins el cor batega completament desbocat.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80" },
    { num: 25, name: "Els Records que Cremen", rarity: "uncommon", cat: "musica-autor", desc: "Fotografies antigues i bitllets de tren oblidats al fons d'un calaix de fusta fosca.", imageUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80" },
    { num: 26, name: "L'Abraçada que Cura", rarity: "common", cat: "musica-autor", desc: "La certesa que malgrat les ferides i la tristor, l'afecte sincer sempre ens acaba salvant.", imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80" },
    { num: 27, name: "La Carta que Mai Vam Enviar", rarity: "common", cat: "musica-autor", desc: "Paraules escrites a mà durant la matinada que van quedar guardades per por al rebuig.", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },
    { num: 28, name: "El Buit de l'Absència", rarity: "common", cat: "musica-autor", desc: "Quan una persona marxa i la casa sencera sembla de cop massa gran, buida i silenciosa.", imageUrl: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&auto=format&fit=crop&q=80" },
    { num: 29, name: "La Promesa d'Aqueixa Nit", rarity: "common", cat: "musica-autor", desc: "Jurs secrets fets a la sorra de la platja quan semblava que res al món no s'acabaria mai.", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80" },
    { num: 30, name: "La Llàgrima Compartida", rarity: "rare", cat: "musica-autor", desc: "Aquell plor alliberador enmig d'un concert en adonar-te que no estàs sol en el dolor.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 4: Escenaris & Grans Concerts (31-40)
    { num: 31, name: "El Piano de Cua Solitari", rarity: "rare", cat: "musica-autor", desc: "L'instrument fidel sota un focus càlid, bressol de les melodies més colpidores i sinceres.", imageUrl: "https://images.unsplash.com/photo-1520523839898-507127053c37?w=600&auto=format&fit=crop&q=80" },
    { num: 32, name: "El Clamor del Sant Jordi", rarity: "uncommon", cat: "musica-autor", desc: "La comunió perfecta entre un artista català i una multitud emocionada fins a les llàgrimes.", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80" },
    { num: 33, name: "Llums de Mòbils en la Foscor", rarity: "common", cat: "musica-autor", desc: "Un cel d'estrelles artificials que il·lumina les grades senceres mentre sona 'Judit'.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },
    { num: 34, name: "La Guitarra Acústica Desgastada", rarity: "common", cat: "musica-autor", desc: "Les cordes de fusta que han acompanyat els primers acords a les places i locals petits.", imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80" },
    { num: 35, name: "El Micròfon Banyat en Suor", rarity: "common", cat: "musica-autor", desc: "El testimoni indiscutible de dues hores d'entrega física i vocal sense guardar-se res.", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80" },
    { num: 36, name: "La Saleta de Concerts dels Inicis", rarity: "common", cat: "musica-autor", desc: "El record dels petits escenaris de poble on va començar a forjar-se la màgia dels Tipus d'Interès.", imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80" },
    { num: 37, name: "L'Ovació de Deu Minuts", rarity: "common", cat: "musica-autor", desc: "L'aplaudiment eixordador d'un públic dempeus que es nega a deixar marxar l'artista.", imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80" },
    { num: 38, name: "El Brindis amb el Públic", rarity: "uncommon", cat: "musica-autor", desc: "Alçar una copa dalt de l'escenari per agrair de cor tots aquests anys de complicitat mútua.", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80" },
    { num: 39, name: "El Silenci Previ a l'Acord", rarity: "common", cat: "musica-autor", desc: "El moment màgic on milers de persones callen alhora esperant que soni la primera nota.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },
    { num: 40, name: "El Final de Festa Eufòric", rarity: "common", cat: "musica-autor", desc: "Confeti daurat, abraçades entre músics i la sensació compartida de viure una nit irrepetible.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 5: L'Univers Dausà & Simbologia (41-50)
    { num: 41, name: "La Copa de Vi Buida", rarity: "common", cat: "musica-autor", desc: "La metàfora visual del joc 'Jo Mai Mai' quan la veritat finalment s'imposa al sopar.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80" },
    { num: 42, name: "La Bufanda de Llana a l'Hivern", rarity: "uncommon", cat: "musica-autor", desc: "El caliu contra el fred dels carrers de Barcelona a 'Barcelona, nit d'hivern'.", imageUrl: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&auto=format&fit=crop&q=80" },
    { num: 43, name: "El Rellotge Aturat a les Tres", rarity: "common", cat: "musica-autor", desc: "El temps que deixa de córrer quan dues persones es retroben després de deu anys de silenci.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 44, name: "El Tren que Se'n Va", rarity: "common", cat: "musica-autor", desc: "El símbol del comiat i de les grans decisions que marquen el destí sense bitllet de tornada.", imageUrl: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&auto=format&fit=crop&q=80" },
    { num: 45, name: "La Mirada entre la Gent", rarity: "rare", cat: "musica-autor", desc: "Trobar uns ulls coneguts entre la multitud i comprendre en un instant que res no s'ha oblidat.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 46, name: "El Cor Gegant d'Esperança", rarity: "common", cat: "musica-autor", desc: "La convicció inamovible que l'amor i la tendresa són l'arma més poderosa contra el desànim.", imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80" },
    { num: 47, name: "El Cafè Fred del Matí", rarity: "common", cat: "musica-autor", desc: "Despertar després d'una nit de revelacions amb el cap ple de dubtes, records i enyorança.", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80" },
    { num: 48, name: "La Cançó que Ens Unia", rarity: "uncommon", cat: "musica-autor", desc: "Aquella vella melodia que sona per casualitat a la ràdio i et transporta deu anys enrere d'un cop.", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80" },
    { num: 49, name: "El Petó Sota la Pluja de Tardor", rarity: "common", cat: "musica-autor", desc: "Un clàssic instant de cinema que queda gravat per sempre amb lletres d'or a la memòria.", imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80" },
    { num: 50, name: "L'Ànima de la Cançó Trista", rarity: "common", cat: "musica-autor", desc: "Perquè només a través de la melangia més sincera i profunda és on trobem la veritable bellesa de viure.", imageUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&fit=crop&q=80" },
  ];

  for (const c of cardsAlbum3Data) {
    const pageNum = Math.ceil(c.num / 10);
    const page = album3Pages[pageNum - 1];
    const rarity = getRarity(c.rarity);
    const category = getCategory(c.cat);

    await prisma.card.upsert({
      where: { albumId_number: { albumId: album3.id, number: c.num } },
      update: {
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        pageId: page.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
      create: {
        albumId: album3.id,
        pageId: page.id,
        number: c.num,
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
    });
  }
  console.log("✅ Àlbum 3 (Música Trista - Joan Dausà): 50 cromos creats!");

  // ========================================================
  // 7c. ÀLBUM 4: Música Bemparida (Rhapsody of Fire & Power Metal) - 50 CROMOS
  // ========================================================
  const album4 = await prisma.album.upsert({
    where: { id: "album-musica-bemparida" },
    update: {
      name: "Música Bemparida",
      description: "Col·lecció de 50 cromos èpics dedicada a Rhapsody of Fire (Phapsody on Fire), els himnes 'Dawn of Victory' i 'Emerald Sword', i les grans llegendes del Power Metal simfònic.",
      totalCards: 50,
      sortOrder: 4,
      isActive: true,
    },
    create: {
      id: "album-musica-bemparida",
      name: "Música Bemparida",
      description: "Col·lecció de 50 cromos èpics dedicada a Rhapsody of Fire (Phapsody on Fire), els himnes 'Dawn of Victory' i 'Emerald Sword', i les grans llegendes del Power Metal simfònic.",
      totalCards: 50,
      sortOrder: 4,
      isActive: true,
    },
  });

  const album4Pages = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.albumPage.upsert({
        where: { albumId_pageNum: { albumId: album4.id, pageNum: i + 1 } },
        update: { layout: "grid-5x2" },
        create: {
          albumId: album4.id,
          pageNum: i + 1,
          layout: "grid-5x2",
        },
      })
    )
  );

  const cardsAlbum4Data = [
    // Pàgina 1: Rhapsody of Fire & Emerald Sword Saga (1-10)
    { num: 1, name: "Emerald Sword - L'Espasa Esmaragda Sagrada", rarity: "legendary", cat: "power-metal", desc: "L'arma mística forjada pels déus que el Guerrer de la Pau busca per deslliurar les terres d'Algalord del mal absolut.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
    { num: 2, name: "Dawn of Victory - Glòria Eterna sobre Algalord", rarity: "epic", cat: "power-metal", desc: "L'himne suprem del Power Metal simfònic: doble bombo a 200 BPM, cors gloriosos i solos que fan tremolar el cel.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 3, name: "Holy Thunderforce", rarity: "uncommon", cat: "power-metal", desc: "Velocitat implacable i cors grandiosos en una cavalcada èpica per defensar la ciutat sagrada contra el setge.", imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80" },
    { num: 4, name: "Land of Immortals", rarity: "common", cat: "power-metal", desc: "El primer gran èxit de la saga llegendària, ple d'optimisme èpic, flautes i guitarres neoclàssiques vibrants.", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
    { num: 5, name: "Flames of Revenge", rarity: "common", cat: "power-metal", desc: "Un crit de guerra ferotge contra les hordes del Senyor Fosc Akron per venjar els germans caiguts.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 6, name: "Symphony of Enchanted Lands (1998)", rarity: "rare", cat: "power-metal", desc: "L'obra mestra discogràfica de 1998 que va definir per sempre el gènere del Hollywood Metal simfònic.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },
    { num: 7, name: "Rain of a Thousand Flames", rarity: "uncommon", cat: "power-metal", desc: "L'àlbum més fosc i apocalíptic, on una pluja de flames devora les valls encantades del regne.", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80" },
    { num: 8, name: "Power of the Dragonflame", rarity: "common", cat: "power-metal", desc: "El clímax colossal de la primera saga: cors operístics demolidors i el sacrifici heroic del guerrer.", imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80" },
    { num: 9, name: "The Village of Dwarves", rarity: "common", cat: "power-metal", desc: "Melodia folk tradicional i danses celtes que porten alegria als guerrers abans de la cruenta batalla.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 10, name: "Knightrider of Doom", rarity: "common", cat: "power-metal", desc: "Obertura vertiginosa amb arpegis a la velocitat de la llum i la veu estripada i potent de Fabio Lione.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 2: Herois d'Algalord & Membres (11-20)
    { num: 11, name: "Luca Turilli - El Virtuós del Màstil Neoclàssic", rarity: "epic", cat: "power-metal", desc: "El mestre absolut de la guitarra elèctrica i compositor de les sagues èpiques de Rhapsody.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },
    { num: 12, name: "Alex Staropoli - Els Teclats Orquestrals", rarity: "uncommon", cat: "power-metal", desc: "Teclista virtuós i cervell orquestral que va dissenyar el so majestuós de cinema de tota la banda.", imageUrl: "https://images.unsplash.com/photo-1520523839898-507127053c37?w=600&auto=format&fit=crop&q=80" },
    { num: 13, name: "Fabio Lione - El Timbre Líric Implacable", rarity: "rare", cat: "power-metal", desc: "Una de les veus més poderoses de la història del metall, capaç de passar del tenor líric al crit esquinçador.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 14, name: "Sir Christopher Lee - La Veu Sagrada d'Algalord", rarity: "rare", cat: "power-metal", desc: "El llegendari actor de Saruman que va posar la seva veu cavernosa i noble com a narrador i cantant.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 15, name: "El Guerrer de la Pau", rarity: "uncommon", cat: "power-metal", desc: "L'heroi sense nom que travessa muntanyes de gel i inferns de lava per alçar l'Espasa Esmaragda.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
    { num: 16, name: "Aresius el Savi de les Terres Mitjanes", rarity: "common", cat: "power-metal", desc: "L'ancià bruixot custodi dels llibres prohibits i guia espiritual de la Santa Unió.", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
    { num: 17, name: "Dargor el Senyor de les Ombres", rarity: "common", cat: "power-metal", desc: "El guerrer mestís atrapat entre la foscor del seu creador malèfic i la crida interior de la llum.", imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80" },
    { num: 18, name: "Patrice Guers - El Baix Atronador", rarity: "common", cat: "power-metal", desc: "Les freqüències greus que sostenen les tempestes simfòniques amb una precisió rítmica impecable.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },
    { num: 19, name: "Alex Holzwarth - El Doble Bombo Implacable", rarity: "uncommon", cat: "power-metal", desc: "Bateria alemany que manté ritmes de doble bombo sobrehumans sense perdre ni un pols de velocitat.", imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80" },
    { num: 20, name: "L'Esperit Invencible d'Ancelot", rarity: "common", cat: "power-metal", desc: "La terra antiga on els guerrers alçaven les seves armes sota el jurament de la llibertat eterna.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 3: Armes Màgiques & Encanteris (21-30)
    { num: 21, name: "L'Espasa Esmaragda a la Roca de Gel", rarity: "rare", cat: "power-metal", desc: "Encastada en un glaciar perpetu, només el cor pur del veritable guerrer pot desencadenar el seu poder.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
    { num: 22, name: "El Llibre Sagrat dels Encanteris d'Algalord", rarity: "uncommon", cat: "power-metal", desc: "Manuscrits antics enquadernats amb pell de drac que guarden fórmules de protecció mil·lenàries.", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },
    { num: 23, name: "La Corona de les Set Claus Màgiques", rarity: "common", cat: "power-metal", desc: "L'artefacte místic necessari per obrir les portes del temple prohibit on dorm l'espasa.", imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80" },
    { num: 24, name: "La Cova Secreta de Miravig", rarity: "common", cat: "power-metal", desc: "El laberint subterrani poblat per ombres i proves mortals que custodien el tresor sagrat.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 25, name: "El Foc del Drac Alat", rarity: "rare", cat: "power-metal", desc: "L'alè incandescent de la criatura mítica que combat al costat dels defensors de la llum.", imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80" },
    { num: 26, name: "La Tempesta de Llampecs sobre Algalord", rarity: "common", cat: "power-metal", desc: "Fúria celeste desencadenada durant la nit més fosca de la invasió enemiga.", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
    { num: 27, name: "L'Escut de Diamant dels Elfs", rarity: "common", cat: "power-metal", desc: "Protecció impenetrable capaç de reflectir fins i tot els conjurs màgics més destructius.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
    { num: 28, name: "La Poció de Força dels Nans", rarity: "common", cat: "power-metal", desc: "Beguda forjada a les mines fondes que multiplica el vigor del guerrer abans de la gran càrrega.", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80" },
    { num: 29, name: "El Martell de la Victòria Triomfal", rarity: "uncommon", cat: "power-metal", desc: "Arma mítica que fa tremolar les muralles dels castells malèfics d'un sol impacte.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
    { num: 30, name: "L'Estendard Daurat de la Llibertat", rarity: "common", cat: "power-metal", desc: "La bandera que oneja al capdamunt de la ciutadella anunciant l'arribada triomfal de l'alba.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 4: Gegants del Power Metal Mundial (31-40)
    { num: 31, name: "Helloween - Els Pares del Gènere (Keeper of the Keys)", rarity: "rare", cat: "power-metal", desc: "La banda alemanya pionera que amb Michael Kiske i Kai Hansen va crear la plantilla del Power Metal modern.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },
    { num: 32, name: "Blind Guardian - Els Bards de la Terra Mitjana", rarity: "rare", cat: "power-metal", desc: "Hansi Kürsch i la seva tropa portant el metall acústic i èpic al màxim nivell amb 'The Bard's Song'.", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80" },
    { num: 33, name: "Stratovarius - Les Melodies Ràpides de Finlàndia", rarity: "uncommon", cat: "power-metal", desc: "'Hunting High and Low' i la fusió perfecta de teclats neoclàssics i velocitat escandinava.", imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80" },
    { num: 34, name: "Gamma Ray - El Retorn a la Llibertat", rarity: "common", cat: "power-metal", desc: "Kai Hansen continuant el llegat més autèntic, veloç i directe del Speed/Power Metal alemany.", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80" },
    { num: 35, name: "DragonForce - Velocitat Extrema a 250 BPM", rarity: "uncommon", cat: "power-metal", desc: "Herman Li i Sam Totman polvoritzant el màstil amb 'Through the Fire and Flames'.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },
    { num: 36, name: "Sonata Arctica - La Lluna Plena i els Llops", rarity: "common", cat: "power-metal", desc: "El Power Metal melòdic i hivernal d'Àrtica que va marcar tota una generació amb temes com 'FullMoon'.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 37, name: "HammerFall - Cors Guerrers & Hearts on Fire", rarity: "common", cat: "power-metal", desc: "El ressorgiment suec del Heavy/Power tradicional amb escuts, cuir i martells alçats al cel.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80" },
    { num: 38, name: "Avantasia - L'Òpera Metal Monumental", rarity: "uncommon", cat: "power-metal", desc: "El colossal projecte de Tobias Sammet que reuneix les millors veus del món del metall en un sol escenari.", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80" },
    { num: 39, name: "Angra - Virtuosisme i Foc del Brasil", rarity: "common", cat: "power-metal", desc: "Andre Matos i Kiko Loureiro barrejant Power Metal simfònic amb percussions tradicionals brasileres.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },
    { num: 40, name: "Nightwish - El Metall Simfònic Majestuós", rarity: "common", cat: "power-metal", desc: "Tuomas Holopainen i la veu operística creant les simfonies metàl·liques més grandioses d'Europa.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80" },

    // Pàgina 5: L'Esperit del Metall Simfònic & Bemparit (41-50)
    { num: 41, name: "El Doble Bombo a Velocitat de Galop", rarity: "uncommon", cat: "power-metal", desc: "La base rítmica inconfusible que fa vibrar el pit a cada compàs de la cavalcada metàl·lica.", imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80" },
    { num: 42, name: "El Solo de Guitarra amb Arpegis Sweep Picking", rarity: "uncommon", cat: "power-metal", desc: "Dits volant a velocitats superhumanes per les 24 trasts de la guitarra elèctrica Ibanez.", imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80" },
    { num: 43, name: "La Tornada Himnòdica a Cor Orquestral", rarity: "rare", cat: "power-metal", desc: "Aquell moment màgic on milers de persones criden la tornada a ple pulmó amb els punys alçats.", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80" },
    { num: 44, name: "El Falset Líric Inabastable", rarity: "common", cat: "power-metal", desc: "Notes agudes impossibles que desafien les lleis de l'acústica i posen la pell de gallina.", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80" },
    { num: 45, name: "El Drac Escopint Foc a la Portada del Vinil", rarity: "common", cat: "power-metal", desc: "La il·lustració fantàstica que tot amant del metall vol tenir emmarcada amb orgull a la seva paret.", imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80" },
    { num: 46, name: "El Duel Virtuós entre Guitarra i Teclat", rarity: "common", cat: "power-metal", desc: "Pregunta i resposta a velocitat de vertigen entre Luca Turilli i Alex Staropoli.", imageUrl: "https://images.unsplash.com/photo-1520523839898-507127053c37?w=600&auto=format&fit=crop&q=80" },
    { num: 47, name: "Les Espases Inflables al Moshpit", rarity: "common", cat: "power-metal", desc: "El bon rotllo incomparable dels concerts de Power Metal on tothom somriu i canta abraçat.", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },
    { num: 48, name: "La Batalla Èpica Final dels Cinc Exèrcits", rarity: "common", cat: "power-metal", desc: "El xoc climàtic on la música simfònica acompanya el triomf final del bé sobre la tirania.", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
    { num: 49, name: "El Sol de l'Alba sobre les Muntanyes d'Algalord", rarity: "uncommon", cat: "power-metal", desc: "'Dawn of Victory': quan la llum radiant del matí dissipa les ombres per sempre més.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
    { num: 50, name: "El Valhalla Sagrat del Metall Bemparit", rarity: "common", cat: "power-metal", desc: "Perquè no hi ha res més benparit al món sencer que una bona dosi de Power Metal a tot volum!", imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80" },
  ];

  for (const c of cardsAlbum4Data) {
    const pageNum = Math.ceil(c.num / 10);
    const page = album4Pages[pageNum - 1];
    const rarity = getRarity(c.rarity);
    const category = getCategory(c.cat);

    await prisma.card.upsert({
      where: { albumId_number: { albumId: album4.id, number: c.num } },
      update: {
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        pageId: page.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
      create: {
        albumId: album4.id,
        pageId: page.id,
        number: c.num,
        name: c.name,
        description: c.desc,
        rarityId: rarity.id,
        categoryId: category.id,
        imageUrl: (c as any).imageUrl || null,
        value: rarity.sortOrder * 20,
      },
    });
  }
  console.log("✅ Àlbum 4 (Música Bemparida - Rhapsody & Power Metal): 50 cromos creats!");

  // ========================================================
  // 8. BANC DE PREGUNTES EDUCATIVES REALS DE SMIX (20 segons per pregunta)
  // ========================================================
  const questionsSMIX = [
    {
      statement: "A quin sòcol (socket) es connecten els processadors Intel Core de sobretaula de 12a, 13a i 14a generació?",
      difficulty: "medium",
      points: 10,
      xpReward: 15,
      explanation: "Aquests processadors utilitzen el sòcol LGA1700 (1700 contactes a la placa base).",
      categorySlug: "hardware",
      subjectSlug: "smix-m01-mme",
      answers: [
        { text: "LGA1200", isCorrect: false },
        { text: "LGA1700", isCorrect: true },
        { text: "Socket AM4", isCorrect: false },
        { text: "Socket AM5", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de GNU/Linux permet canviar els permisos d'un fitxer o directori?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda 'chmod' (change mode) permet canviar els permisos (lectura, escriptura, execució).",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "chown", isCorrect: false },
        { text: "chmod", isCorrect: true },
        { text: "ls -l", isCorrect: false },
        { text: "mkdir", isCorrect: false },
      ],
    },
    {
      statement: "Quina és la màscara de subxarxa per defecte d'una xarxa amb prefix de xarxa /24 en notació decimal?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Un prefix /24 significa 24 bits a 1 seguit de 8 bits a 0: 255.255.255.0.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "255.0.0.0", isCorrect: false },
        { text: "255.255.0.0", isCorrect: false },
        { text: "255.255.255.0", isCorrect: true },
        { text: "255.255.255.128", isCorrect: false },
      ],
    },
    {
      statement: "En el model de referència OSI, a quina capa pertany el protocol de transport TCP?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "TCP i UDP operen a la Capa 4 (Capa de Transport) del model OSI.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Capa 2 (Enllaç de Dades)", isCorrect: false },
        { text: "Capa 3 (Xarxa)", isCorrect: false },
        { text: "Capa 4 (Transport)", isCorrect: true },
        { text: "Capa 7 (Aplicació)", isCorrect: false },
      ],
    },
    {
      statement: "Quin dels següents nivells de RAID requereix com a MÍNIM 3 unitats de disc per implementar-se?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "El RAID 5 distribueix la paritat entre discos i requereix almenys 3 discos durs per funcionar.",
      categorySlug: "hardware",
      subjectSlug: "smix-m01-mme",
      answers: [
        { text: "RAID 0", isCorrect: false },
        { text: "RAID 1", isCorrect: false },
        { text: "RAID 5", isCorrect: true },
        { text: "JBOD", isCorrect: false },
      ],
    },
    {
      statement: "Quin port utilitza per defecte el protocol segur SSH per establir sessions de terminal remotes?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El servei SSH (Secure Shell) escolta per defecte al port TCP 22.",
      categorySlug: "serveis-web",
      subjectSlug: "smix-m07-sx",
      answers: [
        { text: "Port 21", isCorrect: false },
        { text: "Port 22", isCorrect: true },
        { text: "Port 80", isCorrect: false },
        { text: "Port 443", isCorrect: false },
      ],
    },
    {
      statement: "Quin és el nom del fitxer a GNU/Linux on es defineixen els usuaris locals del sistema?",
      difficulty: "medium",
      points: 10,
      xpReward: 15,
      explanation: "El fitxer /etc/passwd conté la llista d'usuaris, el seu UID, GID, directori home i shell.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "/etc/shadow", isCorrect: false },
        { text: "/etc/passwd", isCorrect: true },
        { text: "/etc/group", isCorrect: false },
        { text: "/etc/hosts", isCorrect: false },
      ],
    },
    {
      statement: "Quin paràmetre indica la quantitat màxima de calor que el sistema de refrigeració ha de dissipar d'una CPU?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "TDP (Thermal Design Power) expressat en Watts mesura la potència tèrmica de disseny.",
      categorySlug: "hardware",
      subjectSlug: "smix-m01-mme",
      answers: [
        { text: "TDP (Thermal Design Power)", isCorrect: true },
        { text: "IPC (Instructions Per Cycle)", isCorrect: false },
        { text: "VCore (Voltage Core)", isCorrect: false },
        { text: "CAS Latency", isCorrect: false },
      ],
    },
    {
      statement: "Quina és la funció del protocol ARP (Address Resolution Protocol)?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "ARP resol l'adreça física MAC que correspon a una adreça IP coneguda a la xarxa local.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Assignar automàticament adreces IP", isCorrect: false },
        { text: "Traduir noms de domini a adreces IP", isCorrect: false },
        { text: "Descobrir l'adreça MAC a partir d'una adreça IP", isCorrect: true },
        { text: "Xifrar el trànsit de xarxa local", isCorrect: false },
      ],
    },
    {
      statement: "En seguretat informàtica, com s'anomena l'atac basat en enganyar l'usuari amb un correu fraudulent?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El Phishing és una tècnica d'enginyeria social per robar credencials simulant entitats fiables.",
      categorySlug: "seguretat",
      subjectSlug: "smix-m06-si",
      answers: [
        { text: "Denegació de Servei (DoS)", isCorrect: false },
        { text: "Phishing", isCorrect: true },
        { text: "Man in the Middle (MitM)", isCorrect: false },
        { text: "SQL Injection", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de GNU/Linux permet canviar el propietari (usuari i grup) d'un fitxer o carpeta?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda 'chown' (change owner) s'utilitza per assignar un nou propietari o grup a fitxers i directoris.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "chown", isCorrect: true },
        { text: "chmod", isCorrect: false },
        { text: "chgrp", isCorrect: false },
        { text: "attrib", isCorrect: false },
      ],
    },
    {
      statement: "Quin port TCP utilitza per defecte el protocol segur HTTPS per a la navegació web xifrada?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El protocol HTTPS utilitza el port 443 xifrat amb TLS/SSL, mentre que HTTP usa el port 80.",
      categorySlug: "serveis-web",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Port 80", isCorrect: false },
        { text: "Port 443", isCorrect: true },
        { text: "Port 8080", isCorrect: false },
        { text: "Port 21", isCorrect: false },
      ],
    },
    {
      statement: "Quin dels següents rangs d'adreces IPv4 pertany a una xarxa privada segons la norma RFC 1918?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "192.168.0.0/16 (192.168.0.0 a 192.168.255.255) és un dels tres rangs reservats per a xarxes privades.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "8.8.8.8", isCorrect: false },
        { text: "192.168.1.50", isCorrect: true },
        { text: "1.1.1.1", isCorrect: false },
        { text: "200.50.10.1", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de Linux s'utilitza per comprovar l'estat o reiniciar un servei gestionat per systemd?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "systemctl és la utilitat principal de systemd per iniciar, aturar, reiniciar i comprovar serveis.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "service --all", isCorrect: false },
        { text: "systemctl", isCorrect: true },
        { text: "init.d run", isCorrect: false },
        { text: "procstatus", isCorrect: false },
      ],
    },
    {
      statement: "Quin significat tenen els permisos octals 755 (rwxr-xr-x) aplicats a un fitxer a Linux?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "7 (rwx) per al propietari, 5 (r-x) per al grup, i 5 (r-x) per a la resta d'usuaris.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "Accés total a tothom", isCorrect: false },
        { text: "Propietari rwx, grup i altres només r-x", isCorrect: true },
        { text: "Només lectura per a tothom", isCorrect: false },
        { text: "Fitxer bloquejat per al grup", isCorrect: false },
      ],
    },
    {
      statement: "Quin protocol s'encarrega d'assignar automàticament adreça IP, màscara i passarel·la als clients d'una xarxa?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "DHCP (Dynamic Host Configuration Protocol) realitza el procés DORA per configurar equips en xarxa.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "DNS", isCorrect: false },
        { text: "DHCP", isCorrect: true },
        { text: "SNMP", isCorrect: false },
        { text: "FTP", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de xarxa utilitza missatges ICMP Echo Request per comprovar la connectivitat amb un altre equip?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda ping envia paquets ICMP de sol·licitud d'eco i espera la resposta (Echo Reply).",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "ping", isCorrect: true },
        { text: "tracert", isCorrect: false },
        { text: "netstat", isCorrect: false },
        { text: "arp -a", isCorrect: false },
      ],
    },
    {
      statement: "En quin fitxer de Linux es guarden els hash de les contrasenyes dels usuaris amb lectura exclusiva per a root?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "El fitxer /etc/shadow guarda els resums criptogràfics de les contrasenyes i paràmetres de caducitat.",
      categorySlug: "seguretat",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "/etc/passwd", isCorrect: false },
        { text: "/etc/shadow", isCorrect: true },
        { text: "/etc/security", isCorrect: false },
        { text: "/etc/sudoers", isCorrect: false },
      ],
    },
    {
      statement: "Segons l'estàndard T568B de cablejat de xarxa RJ-45, amb quin color comença el pin 1?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "A la norma T568B, el pin 1 és Blanc-Taronja, seguit de Taronja al pin 2.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Blanc-Verd", isCorrect: false },
        { text: "Blanc-Taronja", isCorrect: true },
        { text: "Blau", isCorrect: false },
        { text: "Blanc-Marró", isCorrect: false },
      ],
    },
    {
      statement: "Quina és la funció d'un router a diferència d'un switch en una topologia de xarxa?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "El router treballa a Capa 3 (IP) interconnectant diferents subxarxes i encaminant paquets entre elles.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Regenerar el senyal elèctric", isCorrect: false },
        { text: "Encaminar paquets entre diferents xarxes lògiques IP", isCorrect: true },
        { text: "Connectar dispositius exclusivament mitjançant Wi-Fi", isCorrect: false },
        { text: "Substituir les targetes de xarxa dels ordinadors", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de terminal a GNU/Linux permet cercar fitxers per nom a tot el sistema de fitxers?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda 'find / -name nom_fitxer' cerca recursivament des de l'arrel.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "search", isCorrect: false },
        { text: "find", isCorrect: true },
        { text: "locate-all", isCorrect: false },
        { text: "where", isCorrect: false },
      ],
    },
    {
      statement: "A quin port escolta per defecte el servei de resolució de noms de domini (DNS)?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El servei DNS utilitza el port 53 (habitualment UDP per a consultes i TCP per a transferències de zona).",
      categorySlug: "serveis-web",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "Port 25", isCorrect: false },
        { text: "Port 53", isCorrect: true },
        { text: "Port 110", isCorrect: false },
        { text: "Port 123", isCorrect: false },
      ],
    },
    {
      statement: "Quants bits de longitud té una adreça de xarxa IPv6?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "IPv6 utilitza adreces de 128 bits (16 bytes), davant dels 32 bits que té una adreça IPv4.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "32 bits", isCorrect: false },
        { text: "64 bits", isCorrect: false },
        { text: "128 bits", isCorrect: true },
        { text: "256 bits", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de Linux s'utilitza per visualitzar el contingut d'un fitxer filtrant per un patró de text?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La utilitat 'grep' cerca cadenes de text i expressions regulars dins de fitxers o canonades (pipes).",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "filter", isCorrect: false },
        { text: "grep", isCorrect: true },
        { text: "scan", isCorrect: false },
        { text: "awkward", isCorrect: false },
      ],
    },
    {
      statement: "Com s'anomena l'eina de Microsoft Windows per a la gestió d'usuaris i equips en un domini corporatiu?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Active Directory (AD DS) centralitza la gestió d'identitats, permisos i polítiques de grup (GPO).",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m04-sox",
      answers: [
        { text: "Workgroup Center", isCorrect: false },
        { text: "Active Directory (AD DS)", isCorrect: true },
        { text: "Windows Defender Hub", isCorrect: false },
        { text: "Hyper-V Manager", isCorrect: false },
      ],
    },
    {
      statement: "Quin tipus de commutació o segmentació lògica s'utilitza per separar departaments dins d'un mateix switch físic?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Les VLANs (IEEE 802.1Q) permeten crear xarxes d'àrea local virtuals i aïllar els dominis de difusió.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "VLAN (Virtual LAN)", isCorrect: true },
        { text: "NAT", isCorrect: false },
        { text: "VPN", isCorrect: false },
        { text: "DMZ física", isCorrect: false },
      ],
    },
    {
      statement: "Quin comandament a Linux mostra les adreces IP configurades a les targetes de xarxa?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda 'ip addr' (o 'ip a') de la suite iproute2 és l'eina estàndard actual.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "netconfig", isCorrect: false },
        { text: "ip addr", isCorrect: true },
        { text: "show ip", isCorrect: false },
        { text: "lanstatus", isCorrect: false },
      ],
    },
    {
      statement: "A quin protocol de transport pertany el procés d'obertura de sessió 'Three-Way Handshake' (SYN, SYN-ACK, ACK)?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "TCP és un protocol orientat a connexió fiable que estableix la sessió amb la negociació en 3 passos.",
      categorySlug: "xarxes",
      subjectSlug: "smix-m05-xl",
      answers: [
        { text: "UDP", isCorrect: false },
        { text: "TCP", isCorrect: true },
        { text: "ICMP", isCorrect: false },
        { text: "IGMP", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda de GNU/Linux permet crear un enllaç simbòlic (accés directe) a un fitxer?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "La comanda 'ln -s fitxer_original nom_enllac' crea un enllaç simbòlic cap a la destinació.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "link -create", isCorrect: false },
        { text: "ln -s", isCorrect: true },
        { text: "shortcut -new", isCorrect: false },
        { text: "symlink", isCorrect: false },
      ],
    },
    {
      statement: "Quina comanda permet enviar un senyal de terminació a un procés que ha quedat penjat coneixent el seu PID?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La comanda 'kill <PID>' (o 'kill -9 <PID>') envia senyals al procés per finalitzar-lo.",
      categorySlug: "so-linux-windows",
      subjectSlug: "smix-m02-som",
      answers: [
        { text: "stop", isCorrect: false },
        { text: "kill", isCorrect: true },
        { text: "endproc", isCorrect: false },
        { text: "abort", isCorrect: false },
      ],
    },
  ];

  // ========================================================
  // 8b. PREGUNTES CULTURALS: JOAN DAUSÀ (Música Trista)
  // ========================================================
  const questionsJoanDausa = [
    {
      statement: "Què confessa el protagonista de la mítica cançó 'Jo Mai Mai' durant la partida amb els amics al sopar?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "A 'Jo Mai Mai', el protagonista aprofita la ronda per confessar que porta anys enamorat en secret de la Judit.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Que està enamorat de la Judit des de fa anys", isCorrect: true },
        { text: "Que ha decidit marxar a viure a l'estranger", isCorrect: false },
        { text: "Que va suspendre tots els exàmens de la universitat", isCorrect: false },
        { text: "Que vol obrir un restaurant a la platja", isCorrect: false },
      ],
    },
    {
      statement: "A quina pel·lícula dirigida per Dani de la Orden va compondre la banda sonora Joan Dausà, guanyant el Premi Gaudí?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Joan Dausà va guanyar el Premi Gaudí a la millor música original per 'Barcelona, nit d'estiu' (2013).",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Barcelona, nit d'estiu", isCorrect: true },
        { text: "Pa negre", isCorrect: false },
        { text: "Estiu 1993", isCorrect: false },
        { text: "Alcarràs", isCorrect: false },
      ],
    },
    {
      statement: "Quin famós àlbum de Joan Dausà publicat el 2018 conté els grans himnes 'La gran eufòria' i 'Tot anirà bé'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "'Ara som gegants' (2018) va ser un abans i un després en la carrera de Joan Dausà, omplint grans recintes.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Ara som gegants", isCorrect: true },
        { text: "On serem demà?", isCorrect: false },
        { text: "Ho tenim tot", isCorrect: false },
        { text: "Jo mai mai", isCorrect: false },
      ],
    },
    {
      statement: "A quina cançó de Joan Dausà pertany la tornada triomfal 'Mai no és tard per tornar a començar, ara som gegants'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "És la tornada central de la cançó homònima 'Ara som gegants', un cant a l'esperança i la superació.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Ara som gegants", isCorrect: true },
        { text: "Diria que eres tu", isCorrect: false },
        { text: "Queda't així", isCorrect: false },
        { text: "Truca'm", isCorrect: false },
      ],
    },
    {
      statement: "Quin conegut anunci d'Estrella Damm de 2019 va comptar amb la cançó 'Una altra manera de viure' cantada per Joan Dausà, Santi Balmes i Maria Rodés?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "La campanya 'Actes' d'Estrella Damm conscienciava sobre la contaminació per plàstics i la protecció del mar Mediterrani.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "El compromís amb la protecció i neteja del mar Mediterrani", isCorrect: true },
        { text: "La promoció de la gastronomia tradicional de muntanya", isCorrect: false },
        { text: "La festa de Sant Joan a la ciutat de Menorca", isCorrect: false },
        { text: "Un homenatge als castellers i la cultura popular", isCorrect: false },
      ],
    },
    {
      statement: "A quin gran recinte de Barcelona va reunir Joan Dausà més de 16.000 persones el gener de 2024 amb el concert 'La Gran Bogeria'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Joan Dausà va fer història omplint de gom a gom el Palau Sant Jordi de Barcelona amb 16.400 espectadors.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Palau Sant Jordi", isCorrect: true },
        { text: "Camp Nou", isCorrect: false },
        { text: "Palau de la Música Catalana", isCorrect: false },
        { text: "Gran Teatre del Liceu", isCorrect: false },
      ],
    },
    {
      statement: "Quina cançó va publicar Joan Dausà l'any 2023 com a continuació directa de la història de 'Jo Mai Mai' deu anys després?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La cançó 'Judit' resol la incògnita deu anys després: ella el truca després d'escoltar la cançó a la ràdio.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Judit", isCorrect: true },
        { text: "Clara", isCorrect: false },
        { text: "Martina", isCorrect: false },
        { text: "Laia", isCorrect: false },
      ],
    },
    {
      statement: "De quin municipi de la comarca del Baix Llobregat és originari el cantautor Joan Dausà?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Joan Dausà va néixer a Sant Feliu de Llobregat l'any 1979.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Sant Feliu de Llobregat", isCorrect: true },
        { text: "Cornellà de Llobregat", isCorrect: false },
        { text: "El Prat de Llobregat", isCorrect: false },
        { text: "Castelldefels", isCorrect: false },
      ],
    },
    {
      statement: "A quina cançó de Joan Dausà pertany el conegut vers 'Ho tenim tot, si ens tenim a nosaltres'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "És la frase clau del tema 'Ho tenim tot', que dóna títol al seu àlbum d'estudi de 2021.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Ho tenim tot", isCorrect: true },
        { text: "La gran eufòria", isCorrect: false },
        { text: "Truca'm", isCorrect: false },
        { text: "Te'n vas", isCorrect: false },
      ],
    },
    {
      statement: "A part de la seva carrera com a músic, quina altra professió artística té Joan Dausà (participant com a actor a sèries com 'La Riera')?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Joan Dausà és llicenciat en Administració d'Empreses i també en Art Dramàtic per l'Institut del Teatre, havent treballat com a actor.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Actor teatral i de televisió", isCorrect: true },
        { text: "Pintor i escultor contemporani", isCorrect: false },
        { text: "Ballarí clàssic de dansa", isCorrect: false },
        { text: "Arquitecte i dissenyador d'interiors", isCorrect: false },
      ],
    },
    {
      statement: "Quin instrument de teclat toca habitualment Joan Dausà en les seves interpretacions més íntimes i emotives?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El piano és el company inseparable de Joan Dausà en la composició i en les seves balades més melancòliques.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "El piano", isCorrect: true },
        { text: "L'acordió diatònic", isCorrect: false },
        { text: "L'orgue electrònic Hammond", isCorrect: false },
        { text: "El sintetitzador modular", isCorrect: false },
      ],
    },
    {
      statement: "A quin estimat personatge de titella de la televisió catalana (Club Super3) va posar veu Joan Dausà durant anys?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Joan Dausà va ser durant molts anys la tendra veu del titella Mic al programa infantil de TV3.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Al ninot Mic", isCorrect: true },
        { text: "Al Tomàtic", isCorrect: false },
        { text: "Al Krusty", isCorrect: false },
        { text: "Al Noti", isCorrect: false },
      ],
    },
    {
      statement: "Quin productor musical d'èxit de música urbana i pop (guanyador de Grammy Llatí) va col·laborar en la producció del disc 'Ho tenim tot'?",
      difficulty: "hard",
      points: 20,
      xpReward: 25,
      explanation: "Alizzz (Cristian Quirante) va participar com a productor aportant sons moderns al disc 'Ho tenim tot'.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Alizzz", isCorrect: true },
        { text: "Bizarrap", isCorrect: false },
        { text: "Raül Refree", isCorrect: false },
        { text: "Marc Parrot", isCorrect: false },
      ],
    },
    {
      statement: "Com es titula la commovedora cançó que Joan Dausà va dedicar al naixement de la seva filla?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "La cançó 'Valentina' està inspirada i dedicada directament a la seva filla.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Valentina", isCorrect: true },
        { text: "Julieta", isCorrect: false },
        { text: "Ona", isCorrect: false },
        { text: "Mariona", isCorrect: false },
      ],
    },
    {
      statement: "Quina mítica cançó de Lluís Llach sol cantar Joan Dausà en els seus directes amb una emotiva versió a piano?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La seva versió íntima de 'Que tinguem sort' de Lluís Llach és un dels moments més corejats dels seus concerts.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Que tinguem sort", isCorrect: true },
        { text: "L'estaca", isCorrect: false },
        { text: "Viatge a Itaca", isCorrect: false },
        { text: "Abril 74", isCorrect: false },
      ],
    },
    {
      statement: "Quin grup musical acompanyava inicialment a Joan Dausà en el seu debut discogràfic l'any 2012?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "El primer disc es va publicar sota el nom artístic 'Joan Dausà i els Tipus d'Interès'.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Els Tipus d'Interès", isCorrect: true },
        { text: "Els Amics de les Arts", isCorrect: false },
        { text: "Els Catarres", isCorrect: false },
        { text: "Blaumut", isCorrect: false },
      ],
    },
    {
      statement: "Amb quina cantant i actriu va col·laborar Joan Dausà en el tema acústic 'Diria que eres tu'?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Elena Gadel va sumar la seva dolça veu amb Joan Dausà en aquesta emotiva balada.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Elena Gadel", isCorrect: true },
        { text: "Rosalía", isCorrect: false },
        { text: "Sílvia Pérez Cruz", isCorrect: false },
        { text: "Beth", isCorrect: false },
      ],
    },
    {
      statement: "En quin festival barceloní a l'aire lliure celebrat al Parc del Fòrum ha actuat diverses vegades Joan Dausà amb milers de seguidors?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El Festival Cruïlla de Barcelona ha estat un dels escenaris talismà de Joan Dausà en repetides edicions.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Festival Cruïlla", isCorrect: true },
        { text: "Sónar de Nit", isCorrect: false },
        { text: "Primavera Sound", isCorrect: false },
        { text: "Rock Fest Barcelona", isCorrect: false },
      ],
    },
    {
      statement: "Quin prestigiós guardó de la música en català ha reconegut en diverses ocasions la trajectòria i discos de Joan Dausà?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Els Premis Enderrock de la Música Catalana han premiat els àlbums 'Ara som gegants' i 'Ho tenim tot'.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Premis Enderrock", isCorrect: true },
        { text: "Premis Grammy Llatins", isCorrect: false },
        { text: "MTV European Music Awards", isCorrect: false },
        { text: "Premis Ondas de Televisió", isCorrect: false },
      ],
    },
    {
      statement: "Quin lema o filosofia vital resumeix el concepte de 'La Gran Bogeria' impulsat per Joan Dausà en els seus directes?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "'La Gran Bogeria' és una invitació a viure la vida amb intensitat, a no callar els sentiments i a estimar sense por al futur.",
      categorySlug: "musica-autor",
      subjectSlug: "cultura-musica-trista",
      answers: [
        { text: "Atrevir-se a viure amb intensitat, estimar sense por i gaudir de les emocions que ens fan humans", isCorrect: true },
        { text: "No gastar mai diners i estalviar-ho tot al banc", isCorrect: false },
        { text: "Quedar-se a casa tancat sense parlar amb ningú", isCorrect: false },
        { text: "Apostar a la ruleta dels casinos de Las Vegas", isCorrect: false },
      ],
    },
  ];

  // ========================================================
  // 8c. PREGUNTES POWER METAL: RHAPSODY OF FIRE & POWER METAL
  // ========================================================
  const questionsRhapsodyPowerMetal = [
    {
      statement: "A quin àlbum de Rhapsody publicat l'any 2000 pertany el cèlebre himne del power metal simfònic 'Dawn of Victory'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "'Dawn of Victory' dóna títol al tercer àlbum d'estudi de Rhapsody (2000) i és una de les cançons més emblemàtiques del power metal.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Dawn of Victory", isCorrect: true },
        { text: "Legendary Tales", isCorrect: false },
        { text: "Symphony of Enchanted Lands", isCorrect: false },
        { text: "Triumph or Agony", isCorrect: false },
      ],
    },
    {
      statement: "De quin àlbum de 1998 forma part l'himne èpic 'Emerald Sword', considerat un dels majors clàssics de la banda?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "'Emerald Sword' és el tema estrella de l'àlbum 'Symphony of Enchanted Lands' (1998) de Rhapsody.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Symphony of Enchanted Lands", isCorrect: true },
        { text: "Power of the Dragonflame", isCorrect: false },
        { text: "Rain of a Thousand Flames", isCorrect: false },
        { text: "The Frozen Tears of Angels", isCorrect: false },
      ],
    },
    {
      statement: "Quin nom tenia originàriament la formació italiana abans de canviar-lo a 'Rhapsody of Fire' el 2006 per disputes de copyright?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El grup es deia originàriament 'Thundercross' i després 'Rhapsody'. El 2006 van haver d'afegir 'of Fire' per drets de marca.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Rhapsody (i abans Thundercross)", isCorrect: true },
        { text: "DragonForce", isCorrect: false },
        { text: "Symphony X", isCorrect: false },
        { text: "Luca's Fire", isCorrect: false },
      ],
    },
    {
      statement: "Qui és el virtuosíssim guitarrista i compositor cofundador de Rhapsody famós pels seus solos neoclàssics i tècnica sweep picking?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Luca Turilli és el cervell i guitarrista neoclàssic virtuós que va idear les melodies i sagues èpiques de Rhapsody.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Luca Turilli", isCorrect: true },
        { text: "Yngwie Malmsteen", isCorrect: false },
        { text: "John Petrucci", isCorrect: false },
        { text: "Michael Romeo", isCorrect: false },
      ],
    },
    {
      statement: "Qui va ser durant dues dècades el cantant principal de Rhapsody conegut pel seu increïble registre vocal líric?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Fabio Lione va ser la veu inconfusible de Rhapsody des de 1997 fins al 2016, combinant cant operístic i metall.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Fabio Lione", isCorrect: true },
        { text: "Bruce Dickinson", isCorrect: false },
        { text: "Michael Kiske", isCorrect: false },
        { text: "Andi Deris", isCorrect: false },
      ],
    },
    {
      statement: "Quin famós actor britànic, conegut pel paper de Saruman a 'El Senyor dels Anells', va col·laborar com a narrador i cantant a Rhapsody of Fire?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Sir Christopher Lee va col·laborar a diversos discos de Rhapsody com 'Symphony of Enchanted Lands II' i va cantar el tema 'The Magic of the Wizard's Dream'.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Sir Christopher Lee", isCorrect: true },
        { text: "Sir Ian McKellen", isCorrect: false },
        { text: "Sir Patrick Stewart", isCorrect: false },
        { text: "Sean Bean", isCorrect: false },
      ],
    },
    {
      statement: "Com s'anomena la ciutat capital i terra fantàstica que defensen els guerrers als himnes 'Dawn of Victory' i 'Emerald Sword'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Algalord és la capital del regne encantat que les forces del bé intenten protegir contra les ombres a la saga de l'Espasa Esmaragda.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Algalord", isCorrect: true },
        { text: "Gondor", isCorrect: false },
        { text: "Valyria", isCorrect: false },
        { text: "Azeroth", isCorrect: false },
      ],
    },
    {
      statement: "Com va anomenar la pròpia banda el seu estil musical combinant metall a gran velocitat amb orquestracions simfòniques de cinema?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Rhapsody va definir la seva música com a 'Hollywood Metal' o 'Film Score Metal' per la seva inspiració en les grans bandes sonores de cinema.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Hollywood Metal / Film Score Metal", isCorrect: true },
        { text: "Nu Metal industrial", isCorrect: false },
        { text: "Thrash Metal acústic", isCorrect: false },
        { text: "Funeral Doom Metal", isCorrect: false },
      ],
    },
    {
      statement: "Quina d'aquestes frases icòniques correspon exactament a la gloriosa tornada en anglès d''Emerald Sword'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "La tornada és: 'For the king, for the land, for the mountains, for the green valleys where dragons fly, now it's time to claim the emerald sword!'",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "For the king, for the land, for the mountains, for the green valleys where dragons fly!", isCorrect: true },
        { text: "We will rock you and scream until the morning light!", isCorrect: false },
        { text: "Highway to hell and into the blazing burning fire!", isCorrect: false },
        { text: "Nothing else matters in this cold and bitter dark world!", isCorrect: false },
      ],
    },
    {
      statement: "Quin patró rítmic de bateria caracteritza clàssicament el tema 'Dawn of Victory' i el Power Metal europeu en general?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "El ritme galopant de doble bombo ininterromput (double bass drumming) a més de 180-200 BPM és l'essència motora del gènere.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Doble bombo continu a gran velocitat (double bass drum) a ritme de galop", isCorrect: true },
        { text: "Ritme lent i sincopat de blues acústic", isCorrect: false },
        { text: "Compassos de vals lent en 3/4", isCorrect: false },
        { text: "Patró sincopat de música dembow i reggaeton", isCorrect: false },
      ],
    },
    {
      statement: "Quin grup alemany és considerat el pare absolut del Power Metal europeu amb els seus àlbums 'Keeper of the Seven Keys Part I & II'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Helloween (amb Kai Hansen i Michael Kiske) va inventar les bases melòdiques i ràpides del Power Metal a finals dels anys 80.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Helloween", isCorrect: true },
        { text: "Rammstein", isCorrect: false },
        { text: "Scorpions", isCorrect: false },
        { text: "Accept", isCorrect: false },
      ],
    },
    {
      statement: "Quin grup alemany de Power Metal és cèlebre per les seves lletres inspirades en J.R.R. Tolkien i el tema acústic 'The Bard's Song'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Blind Guardian, liderat per Hansi Kürsch, és conegut com 'els bards del metall' per la seva estreta vinculació amb l'obra de Tolkien.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Blind Guardian", isCorrect: true },
        { text: "Manowar", isCorrect: false },
        { text: "Judas Priest", isCorrect: false },
        { text: "Motörhead", isCorrect: false },
      ],
    },
    {
      statement: "Quin grup finlandès de Power Metal liderat pel teclista Jens Johansson i el cantant Timo Kotipelto va publicar el clàssic 'Hunting High and Low'?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Stratovarius és una de les bandes insígnia del Power Metal nòrdic, amb himnes immortals com 'Hunting High and Low' de l'àlbum Infinite (2000).",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Stratovarius", isCorrect: true },
        { text: "Nightwish", isCorrect: false },
        { text: "Children of Bodom", isCorrect: false },
        { text: "Lordi", isCorrect: false },
      ],
    },
    {
      statement: "Quin grup britànic de Power Metal extrem va assolir fama mundial amb el tema 'Through the Fire and Flames' i el seu solo al videojoc Guitar Hero III?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "DragonForce, amb els guitarristes Herman Li i Sam Totman, es va fer famós mundialment per la seva velocitat frenètica a més de 200 BPM.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "DragonForce", isCorrect: true },
        { text: "Iron Maiden", isCorrect: false },
        { text: "Saxon", isCorrect: false },
        { text: "Def Leppard", isCorrect: false },
      ],
    },
    {
      statement: "Quina arma sagrada cerca el Guerrer de la Pau a la saga concebuda per Luca Turilli i Alex Staropoli?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "L'Espasa Esmaragda (Emerald Sword) és l'artefacte màgic central que dóna nom a tota la saga de 5 àlbums de la banda.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "L'Emerald Sword (Espasa Esmaragda)", isCorrect: true },
        { text: "L'Excalibur del Rei Artur", isCorrect: false },
        { text: "L'Anell Únic de Sauron", isCorrect: false },
        { text: "El Martell Mjolnir de Thor", isCorrect: false },
      ],
    },
    {
      statement: "A quin país i ciutat es va fundar originàriament la banda Rhapsody (of Fire) l'any 1993?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Rhapsody es va fundar l'any 1993 a la ciutat de Trieste, al nord-est d'Itàlia.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Itàlia (Trieste)", isCorrect: true },
        { text: "Alemanya (Hamburg)", isCorrect: false },
        { text: "Finlàndia (Hèlsinki)", isCorrect: false },
        { text: "Suècia (Estocolm)", isCorrect: false },
      ],
    },
    {
      statement: "Quin teclista virtuós i compositor clàssic ha liderat Rhapsody of Fire de manera continuada fins a l'actualitat?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "Alex Staropoli ha estat el membre constant i guardià del so simfònic de Rhapsody of Fire des de la seva fundació.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Alex Staropoli", isCorrect: true },
        { text: "Jens Johansson", isCorrect: false },
        { text: "Jordan Rudess", isCorrect: false },
        { text: "Tuomas Holopainen", isCorrect: false },
      ],
    },
    {
      statement: "Quin és el títol del primer àlbum d'estudi de Rhapsody, publicat el 1997, que va inaugurar la saga de l'Emerald Sword?",
      difficulty: "medium",
      points: 15,
      xpReward: 20,
      explanation: "'Legendary Tales' (1997) va ser el debut discogràfic de la banda que va canviar el panorama del metall melòdic.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Legendary Tales", isCorrect: true },
        { text: "Dawn of Victory", isCorrect: false },
        { text: "Symphony of Enchanted Lands", isCorrect: false },
        { text: "Power of the Dragonflame", isCorrect: false },
      ],
    },
    {
      statement: "Quina emblemàtica banda finlandesa de metall simfònic compta amb el mestre compositor Tuomas Holopainen i temes com 'Wishmaster'?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Nightwish és la màxima referència del metall simfònic escandinau des de mitjans dels anys 90.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Nightwish", isCorrect: true },
        { text: "Epica", isCorrect: false },
        { text: "Within Temptation", isCorrect: false },
        { text: "Therion", isCorrect: false },
      ],
    },
    {
      statement: "Quina colossal òpera metal i projecte musical internacional va ser creada pel cantant d'Edguy, Tobias Sammet?",
      difficulty: "easy",
      points: 10,
      xpReward: 15,
      explanation: "Avantasia és el supergrup d'òpera metall de Tobias Sammet que ha reunit vocalistes com Michael Kiske, Jorn Lande, Bob Catley i Roy Khan.",
      categorySlug: "power-metal",
      subjectSlug: "cultura-musica-bemparida",
      answers: [
        { text: "Avantasia", isCorrect: true },
        { text: "Ayreon", isCorrect: false },
        { text: "Trans-Siberian Orchestra", isCorrect: false },
        { text: "Star One", isCorrect: false },
      ],
    },
  ];

  // ========================================================
  // INICIALITZACIÓ SEGURA DE TOTES LES PREGUNTES
  // ========================================================
  const allQuestions = [
    ...questionsSMIX.map((q) => ({
      ...q,
      albumId:
        q.subjectSlug === "smix-m01-mme" || q.categorySlug === "hardware"
          ? "album-smix-m01-hardware"
          : "album-smix-m02-m05-xarxes",
    })),
    ...questionsJoanDausa.map((q) => ({
      ...q,
      albumId: "album-musica-trista",
    })),
    ...questionsRhapsodyPowerMetal.map((q) => ({
      ...q,
      albumId: "album-musica-bemparida",
    })),
  ];

  for (const q of allQuestions) {
    const subject = getSubject(q.subjectSlug);
    const category = getCategory(q.categorySlug);

    const existing = await prisma.question.findFirst({
      where: { statement: q.statement },
    });

    if (!existing) {
      const created = await prisma.question.create({
        data: {
          statement: q.statement,
          difficulty: q.difficulty,
          points: q.points,
          xpReward: q.xpReward,
          explanation: q.explanation,
          recommendedTime: 20, // 20 segons per respondre!
          subjectId: subject ? subject.id : null,
          categoryId: category ? category.id : null,
          albumId: q.albumId,
          isActive: true,
        },
      });

      for (let i = 0; i < q.answers.length; i++) {
        const a = q.answers[i];
        await prisma.answer.create({
          data: {
            questionId: created.id,
            text: a.text,
            isCorrect: a.isCorrect,
            sortOrder: i + 1,
          },
        });
      }
    } else {
      // Actualitzar l'albumId a les preguntes existents si no en tenien
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          albumId: q.albumId,
        },
      });
    }
  }
  console.log("✅ Banc de preguntes complet inicialitzat amb àlbum assignat:", allQuestions.length);

  // 9. Insígnies del sistema
  const badgesData = [
    { name: "Primer Cromo Descobert", description: "Has aconseguit el teu primer cromo de la col·lecció!", condition: JSON.stringify({ cardsCount: 1 }) },
    { name: "Ràpid com un Llamp", description: "Has contestat correctament en menys de 10 segons obtenint 3 cromos d'un cop!", condition: JSON.stringify({ fastCorrect: true }) },
    { name: "Mestre del Taller SMIX", description: "Has completat la teva primera pàgina sencera de l'àlbum de Hardware!", condition: JSON.stringify({ pageCompleted: 1 }) },
    { name: "Tècnic de Xarxes", description: "Has assolit una ratxa de 5 respostes correctes consecutives!", condition: JSON.stringify({ streak: 5 }) },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: { description: b.description },
      create: { name: b.name, description: b.description, condition: b.condition, isActive: true },
    });
  }
  console.log("✅ Insígnies inicialitzades!");

  // 10. Inscripcions inicials d'usuaris als àlbums
  const allDbAlbums = await prisma.album.findMany({ where: { isActive: true } });
  const allDbUsers = await prisma.user.findMany();
  for (const u of allDbUsers) {
    for (const a of allDbAlbums) {
      await prisma.userAlbumEnrollment.upsert({
        where: { userId_albumId: { userId: u.id, albumId: a.id } },
        update: {},
        create: {
          userId: u.id,
          albumId: a.id,
          isActive: true,
        },
      });
    }
  }
  console.log("✅ Inscripcions inicials d'àlbums sincronitzades!");

  console.log("🎉 Seed SMIX completat amb èxit!");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
