// ── Types ──────────────────────────────────────────────────────────────

export interface Product {
  rank: number;
  name: string;
  brand: string;
  slug: string;
  image: string;
  brandLogo: string;
  rating: number;
  reviewCount: number;
  promoCode: string;
  promoPercent: number;
  originalPrice: string;
  discountPrice: string;
  affiliateLink: string;
  origin: string;
  availability: string;
  productType: string;
  pros: string[];
  cons: string[];
  description: string;
}

export interface SiteConfig {
  domain: string;
  isIndexable?: boolean;
  siteName: string;
  brand: string;
  product: string;
  productCategory: string;
  productFormat: string;
  tagline: string;
  affiliateLink: string;
  promoCode: string;
  originalPrice: string;
  discountPrice: string;
  rating: number;
  author: { name: string; avatar: string; bio: string; };
  seo: { title: string; description: string; ogImage: string; };
  analyticsMeasurementId?: string;
  breadcrumbs: { label: string; href: string }[];
  quickSummary: { assets: string[]; considerations: string[]; };
  pros: string[];
  cons: string[];
  faq: { question: string; answer: string }[];
  products: Product[];
  tocItems: { id: string; label: string }[];
  pages: { type: 'comparatif' | 'blog'; label: string; slug: string }[];
}

const products: Product[] = [
  {
    rank: 1,
    name: "Saveur Camomille",
    brand: "Bonjour Drink",
    slug: "bonjour-drink",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/69b0a99c1aaca2898684c751_camomille.jpg",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/68d666ee3daf1b2e78ab7a9a_logo%20Bonjour%20Drink.svg",
    rating: 9.7,
    reviewCount: 132,
    promoCode: "LMC20",
    promoPercent: 20,
    originalPrice: "39,00 €",
    discountPrice: "31,20 €",
    affiliateLink: "https://taap.it/bonjour-drink-lmc",
    origin: "🇫🇷 Frankreich",
    availability: "Online verfügbar",
    productType: "Pulvergetränk mit Kamille, Passionsblume, Reishi und L-Theanin",
    pros: [
      "Sehr passender Abend- und Entspannungswinkel",
      "Kamille, Passionsblume, Reishi und L-Theanin in einer einfachen Routine",
      "Angenehmes Getränk statt klassischer Kapsel",
      "Starker Rabattcode und klare Markenwelt"
    ],
    cons: [
      "Kein deutsches Spezialprodukt, sondern internationale Bestellung",
      "Pulverformat passt nicht zu jedem Nutzer",
      "Für akute Beschwerden nicht als medizinische Lösung zu verstehen"
    ],
    description: "Bonjour Drink überzeugt besonders, weil die Sorte Kamille den Suchbedarf nach pflanzlichen Beruhigungsmitteln sehr natürlich trifft: ein warmes Getränk, eine verständliche Routine und Inhaltsstoffe wie Kamille, Passionsblume, Reishi und L-Theanin. Die Marke wirkt weniger wie ein klassischer Supplement-Shop und mehr wie eine moderne Alternative für Menschen, die abends runterkommen möchten, ohne direkt zu schweren Schlafmitteln zu greifen. Besonders stark ist die Kombination aus Alltagstauglichkeit, Geschmack und klarer Positionierung. Der Hauptnachteil bleibt, dass Bonjour Drink kein deutsches Produkt ist und der Nutzer die Lieferbedingungen prüfen sollte."
  },
  {
    rank: 2,
    name: "Gélules Reishi",
    brand: "French Mush",
    slug: "french-mush",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/69715e17721682f06355cc2a_REISHI_G_MPP_-_French_Mush.webp",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/68df99d27d2df19761dbfa26_Group_1.svg",
    rating: 8.6,
    reviewCount: 420,
    promoCode: "LMC",
    promoPercent: 12,
    originalPrice: "25,50 €",
    discountPrice: "22,95 €",
    affiliateLink: "https://www.frenchmush.com/r?id=9g3e24",
    origin: "🇫🇷 Frankreich",
    availability: "Online verfügbar",
    productType: "Reishi-Kapseln mit 13:1 Extrakt",
    pros: [
      "Sehr klares Reishi-Produkt ohne unnötige Komplexität",
      "Gute Wahl für Nutzer, die Kapseln bevorzugen",
      "Fokus auf funktionelle Pilze statt breiter Wellness-Mischung",
      "Marke mit internationaler Shop-Struktur"
    ],
    cons: [
      "Reishi ist erklärungsbedürftiger als Kamille oder Magnesium",
      "Weniger Lifestyle als Bonjour Drink",
      "Nicht jeder Nutzer möchte Pilzextrakte einnehmen"
    ],
    description: "French Mush ist eine der stärksten Reishi-Optionen in dieser Auswahl. Während viele Produkte im Markt mehrere Pflanzen, Vitamine und Marketingversprechen mischen, bleibt dieses Produkt relativ klar: Reishi als funktioneller Pilz in Kapselform. Das passt gut zu Nutzern, die ein pflanzliches Beruhigungsmittel suchen, aber keine süße Getränkeroutine möchten. Im Vergleich zu Bonjour Drink ist French Mush sachlicher und stärker supplement-orientiert. Das Ergebnis: sehr relevant, aber etwas weniger niedrigschwellig für Einsteiger als ein Getränk mit Kamillenroutine."
  },
  {
    rank: 3,
    name: "Magnesium Mix",
    brand: "Clearly",
    slug: "clearly",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/697211fa6e50ede3879ea0cc_Mag-Front-1-min.webp",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/68dfaffbcd9575da42dea912_67604f816f6f25a217f35605_Clearly_-_Dark_Blue_150x.avif",
    rating: 8.8,
    reviewCount: 980,
    promoCode: "LMC",
    promoPercent: 15,
    originalPrice: "21,25 €",
    discountPrice: "19,12 €",
    affiliateLink: "https://clearly.eu/products/magnesium-mix?sca_ref=7596565.tJHE2KRYrL",
    origin: "🇪🇺 Europa",
    availability: "Online verfügbar",
    productType: "Magnesium-Pulver mit Citrat, Malat und Glycinat",
    pros: [
      "Drei gängige Magnesiumformen in einem Mix",
      "Europäische Marke mit internationalem Shop",
      "Sehr gut für den breiteren Stress- und Entspannungswinkel",
      "Preislich zugänglich im Vergleich zu komplexen Formeln"
    ],
    cons: [
      "Nicht speziell als Beruhigungsmittel positioniert",
      "Pulverformat statt Kapsel",
      "Weniger pflanzlich als die anderen Top-Produkte"
    ],
    description: "Clearly ist für deutsche Nutzer besonders interessant, weil die Marke europäisch und international aufgestellt ist. Der Magnesium Mix ist kein klassisches pflanzliches Beruhigungsmittel, passt aber sehr gut zur Suchintention rund um Stress, innere Ruhe und Entspannung. Magnesium ist für viele Nutzer verständlicher als Reishi oder adaptogene Mischungen. Die Formel mit Citrat, Malat und Glycinat macht einen seriösen Eindruck, ohne überladen zu wirken. Die Einordnung ist deshalb klar: sehr stark für den Alltag, aber etwas weniger direkt pflanzlich als Bonjour Drink und French Mush."
  },
  {
    rank: 4,
    name: "Rainbow Dust",
    brand: "Spacegoods",
    slug: "spacegoods",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/6963528673d13c41661159e0_68de5ead07f79ba9b66a5006_rainbow-dust-Spacegoods-90210697_800x800_crop_center.webp",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/68de5d566e888bfd06345a73_6760488ab2cb1a8031b28758_logo.svg",
    rating: 8.6,
    reviewCount: 2400,
    promoCode: "LIONSMANE45665",
    promoPercent: 20,
    originalPrice: "44,95 €",
    discountPrice: "35,96 €",
    affiliateLink: "https://taap.it/spacegoods-rainbow-dust",
    origin: "🇬🇧 Vereinigtes Königreich",
    availability: "Online verfügbar",
    productType: "Adaptogenes Getränkepulver mit Pilzen und Ashwagandha",
    pros: [
      "Bekannte internationale Marke mit starkem Branding",
      "Adaptogene, funktionelle Pilze und Ashwagandha in einer Routine",
      "Guter Lifestyle-Fit für moderne Stress- und Fokus-Suchen",
      "Attraktiver Rabatt"
    ],
    cons: [
      "Enthält auch Koffein und ist nicht rein auf Ruhe ausgelegt",
      "Marketing stärker als bei nüchternen Kapselprodukten",
      "Preis höher als einfache Magnesium- oder Reishi-Produkte"
    ],
    description: "Spacegoods bringt Reichweite, Wiedererkennung und einen modernen Adaptogen-Winkel in den Vergleich. Rainbow Dust ist interessant für Nutzer, die Stress, Fokus und Energie nicht getrennt betrachten, sondern eine tägliche funktionelle Routine suchen. Gleichzeitig ist genau das der Grund, warum Spacegoods nicht für jeden Suchenden die erste Wahl ist: Das Produkt ist nicht ausschließlich auf Beruhigung oder Abendroutine ausgerichtet und enthält auch einen aktivierenden Charakter. Für eine deutsche Vergleichsseite ist die Marke trotzdem wertvoll, weil sie international bekannt ist und die Kategorie adaptogene Getränke sehr gut verkörpert."
  },
  {
    rank: 5,
    name: "Calm & Clarity Mints",
    brand: "Neuro Gum",
    slug: "neuro-gum",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/6994516520bc02a20bb2b3fc_neuro-calm-clarity-6pack.webp",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/699240e4102cfd81a3280479_Neuro_Logo_Header.avif",
    rating: 8.5,
    reviewCount: 1200,
    promoCode: "LMC",
    promoPercent: 10,
    originalPrice: "6,80 €",
    discountPrice: "6,12 €",
    affiliateLink: "https://getneuro.eu/r?id=619hb8",
    origin: "🇺🇸 USA / Europa",
    availability: "Online verfügbar",
    productType: "Mints mit GABA und L-Theanin",
    pros: [
      "Sehr klares Calm-Produkt mit GABA und L-Theanin",
      "Praktisches Mint-Format für unterwegs",
      "Gute Ergänzung zu Pulver- und Kapselprodukten",
      "Englischer EU-Shop vorhanden"
    ],
    cons: [
      "Kleineres Produktformat, weniger klassischer Supplement-Eindruck",
      "Nicht so natürlich-pflanzlich wie Kamille oder Reishi",
      "Preisvergleich pro Portion muss geprüft werden"
    ],
    description: "Neuro Gum ist im Ranking die praktischste Option. Calm & Clarity Mints sprechen Nutzer an, die keine Kapseln und kein Getränkepulver wollen, sondern etwas Einfaches für den Alltag. GABA und L-Theanin passen gut zur Suchintention rund um innere Ruhe, Fokus und Stressmanagement. Im Vergleich wirkt das Produkt aber weniger wie ein klassisches pflanzliches Beruhigungsmittel und stärker wie ein moderner Functional-Snack. Das Ergebnis: interessant, zugänglich und alltagstauglich, aber thematisch nicht ganz so sauber wie die stärker pflanzlichen Optionen."
  },
  {
    rank: 6,
    name: "Go Relax",
    brand: "Mushroom Cups",
    slug: "mushroom-cups",
    image: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/698494ba7feb7f3f4173dbe0_GoRelax-Closed_small_b70580a3-596d-45e9-b864-85e3ee8c9baa.webp",
    brandLogo: "https://cdn.prod.website-files.com/68c02c2c477fdd467e6e08a1/698533bb645118c6e83c67c7_mushroomcups_logo.webp",
    rating: 7.8,
    reviewCount: 850,
    promoCode: "ELIASBAHIA",
    promoPercent: 10,
    originalPrice: "15,90 €",
    discountPrice: "14,31 €",
    affiliateLink: "https://mushroomcups.com/products/go-relax-organic-instant-coffee-with-reishi-and-chanterelle-original?ref=LMC",
    origin: "🇪🇺 Europa",
    availability: "Online verfügbar",
    productType: "Instant-Getränk mit Reishi, L-Theanin und Magnesium",
    pros: [
      "Produktname und Formel passen klar zum Relax-Winkel",
      "Reishi, L-Theanin und Magnesium in einem Getränk",
      "Günstiger Einstiegspreis",
      "Gute Ergänzung zu den Top-Marken"
    ],
    cons: [
      "Marke wirkt weniger premium als Spacegoods oder Clearly",
      "Kleineres Sortiment und weniger starke Positionierung",
      "Geschmack und Pilzprofil nicht für jeden Nutzer"
    ],
    description: "Mushroom Cups rundet den Vergleich ab, weil Go Relax den Themenkern sehr direkt trifft: Reishi, L-Theanin und Magnesium in einem trinkbaren Format. Das Produkt ist besonders interessant für Nutzer, die ein einfaches Getränk suchen, aber keine große Premium-Routine starten möchten. Gegenüber Bonjour Drink, Clearly oder Spacegoods fehlt etwas Markenstärke und Differenzierung. Mushroom Cups bleibt trotzdem sinnvoll, weil die Formel den deutschen Suchintent nach pflanzlicher Entspannung gut ergänzt."
  }
];

const config: SiteConfig = {
  domain: "https://pflanzliche-beruhigungsmittel-testsieger.de",
  isIndexable: true,
  siteName: "Pflanzliche Beruhigungsmittel Testsieger",
  brand: "Bonjour Drink",
  product: "Saveur Camomille",
  productCategory: "Pflanzliche Beruhigungsmittel",
  productFormat: "Pulvergetränk",
  tagline: "Vergleich natürlicher Produkte für mehr Ruhe im Alltag",
  affiliateLink: products[0].affiliateLink,
  promoCode: products[0].promoCode,
  originalPrice: products[0].originalPrice,
  discountPrice: products[0].discountPrice,
  rating: products[0].rating,
  author: {
    name: "Tim",
    avatar: "/author-avatar.png",
    bio: "Unabhängiger Produkttester für natürliche Supplements, funktionelle Getränke und Alltagsergänzungen."
  },
  seo: {
    title: "Pflanzliche Beruhigungsmittel Testsieger 2026",
    description: "Vergleich der besten pflanzlichen Beruhigungsmittel 2026: Bonjour Drink, French Mush, Clearly, Spacegoods, Neuro Gum und Mushroom Cups.",
    ogImage: "/og-image.jpg"
  },
  breadcrumbs: [{ label: "Vergleich", href: "/" }],
  quickSummary: {
    assets: [
      "Bonjour Drink bietet den stärksten Mix aus Alltagstauglichkeit, pflanzlichen Inhaltsstoffen und einfacher Abendroutine.",
      "French Mush und Mushroom Cups decken den Reishi-Winkel ab, Clearly den Magnesium-Winkel.",
      "Spacegoods und Neuro Gum ergänzen den Vergleich mit modernen Adaptogen- und Functional-Formaten."
    ],
    considerations: [
      "Keines dieser Produkte ersetzt eine medizinische Beratung bei anhaltender Unruhe, Angst oder Schlafproblemen.",
      "Lieferung nach Deutschland, Preis und Verfügbarkeit sollten vor der Bestellung geprüft werden.",
      "Der beste Testsieger hängt davon ab, ob Sie Getränk, Kapsel, Pulver oder Mint bevorzugen."
    ]
  },
  pros: products[0].pros,
  cons: products[0].cons,
  faq: [
    {
      question: "Was ist der Testsieger unter den pflanzlichen Beruhigungsmitteln?",
      answer: "In unserem Vergleich steht Bonjour Drink auf Platz 1, weil die Sorte Kamille mit Passionsblume, Reishi und L-Theanin eine sehr einfache pflanzliche Routine bietet. Je nach Bedarf können French Mush, Clearly oder Neuro Gum aber besser passen."
    },
    {
      question: "Sind pflanzliche Beruhigungsmittel frei verkäuflich?",
      answer: "Viele Produkte mit Kamille, Reishi, Magnesium, L-Theanin oder ähnlichen Inhaltsstoffen sind frei verkäuflich. Trotzdem sollte man die Hinweise des Herstellers lesen und bei Medikamenten, Schwangerschaft oder bestehenden Beschwerden medizinischen Rat einholen."
    },
    {
      question: "Was ist besser: Kapseln, Pulver oder Mints?",
      answer: "Pulver und Getränke passen gut für eine bewusste Abendroutine. Kapseln sind praktischer, wenn man eine klare Dosierung möchte. Mints sind am einfachsten für unterwegs, wirken aber weniger wie ein klassisches Supplement."
    },
    {
      question: "Welches Produkt passt am besten zu Stress im Alltag?",
      answer: "Für eine ruhige Abendroutine ist Bonjour Drink am passendsten. Für Reishi-Kapseln ist French Mush stark, für Magnesium Clearly, für ein modernes Adaptogen-Getränk Spacegoods und für ein schnelles Format Neuro Gum."
    },
    {
      question: "Sind diese Produkte Schlafmittel?",
      answer: "Nein. Die Produkte in diesem Vergleich sind keine Schlafmittel und keine Arzneimittel. Es handelt sich um funktionelle Getränke oder Nahrungsergänzungen, die eine entspanntere Routine unterstützen können."
    }
  ],
  products,
  tocItems: [
    { id: "kurzfassung", label: "Kurzfassung" },
    { id: "vergleich", label: "Top 6" },
    { id: "ratgeber", label: "Ratgeber" },
    { id: "faq", label: "FAQ" }
  ],
  pages: [
    { type: 'blog', label: 'Rezeptfrei', slug: '/pflanzliche-beruhigungsmittel-rezeptfrei/' }
  ]
};

export default config;
