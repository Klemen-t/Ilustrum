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

  // Esborrar preguntes anteriors si cal per evitar duplicats
  await prisma.answer.deleteMany({});
  await prisma.questionAttempt.deleteMany({});
  await prisma.question.deleteMany({});

  for (const q of questionsSMIX) {
    const subject = getSubject(q.subjectSlug);
    const category = getCategory(q.categorySlug);

    const created = await prisma.question.create({
      data: {
        statement: q.statement,
        difficulty: q.difficulty,
        points: q.points,
        xpReward: q.xpReward,
        explanation: q.explanation,
        recommendedTime: 20, // 20 segons per respondre!
        subjectId: subject.id,
        categoryId: category.id,
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
  }
  console.log("✅ Banc de preguntes SMIX inicialitzat:", questionsSMIX.length);

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
