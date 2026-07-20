"use client";

import {
  ArrowUpRight,
  BarChart3,
  Camera,
  CloudSun,
  ChevronRight,
  Grape,
  Heart,
  ImageIcon,
  LayoutDashboard,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  ScanLine,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  LogOut,
  Users,
  Wine,
  RefreshCw,
  X
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type WineResearch = {
  summary: string;
  wineColor: string;
  nose: string;
  palate: string;
  finish: string;
  tastingNotes: string[];
  communityRating: string;
  communityConsensus: string;
  marketPriceRange: string;
  marketPriceNote: string;
  criticScores: Array<{
    source: string;
    score: string;
    note: string;
  }>;
  drinkWindow: {
    start: string;
    peak: string;
    end: string;
    status: string;
    reason: string;
  };
  communityPairings: string[];
  sommelierPairings: string[];
  sources: Array<{
    title: string;
    url: string;
    provider: string;
  }>;
  researchedAt?: string;
};

type CollectionBottle = {
  cloudId?: string;
  producer: string;
  wine: string;
  vintage: string;
  region: string;
  appellation: string;
  grapes: string;
  classification: string;
  style?: string;
  cellar: string;
  score: string;
  window: string;
  drinkingWindow: string;
  quantity: string;
  purchase: string;
  market: string;
  priceRange?: string;
  service: string;
  note: string;
  accent: string;
  confidence?: number;
  recognitionSource?: string;
  sources?: string[];
  alternatives?: string[];
  producerHistory?: string;
  vintageSummary?: string;
  foodPairing?: string;
  tastingNotes?: string[];
  research?: WineResearch;
  scannedAt?: string;
};

type CurrencyCode = "GBP" | "USD" | "EUR";
type ViewId = "home" | "add-bottle" | "collection-overview" | "dashboard" | "my-collection" | "regional-map" | "sommelier" | "settings";

type ExchangeRates = Record<CurrencyCode, number>;
type CellarAccount = {
  id: string;
  name: string;
  email: string;
  password?: string;
  cellarId?: string;
  createdAt: string;
};

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
    };
  };
};

type CloudBottleRow = {
  id: string;
  cellar_id: string;
  data: CollectionBottle;
};

const accountsStorageKey = "cellar-shared-accounts-v1";
const sessionStorageKey = "cellar-active-account-v1";
const supabaseSessionStorageKey = "cellar-supabase-session-v1";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

function storageKeyForAccount(account: CellarAccount | null, key: string) {
  return account ? `cellar-account:${account.id}:${key}` : key;
}

const researchedWines: CollectionBottle[] = [
  {
    producer: "Domaine Leflaive", wine: "Puligny-Montrachet 1er Cru Les Pucelles", vintage: "2020",
    region: "Burgundy, France", appellation: "Puligny-Montrachet Premier Cru", grapes: "100% Chardonnay",
    classification: "Premier Cru", cellar: "Location not set", score: "96", window: "Approaching peak",
    drinkingWindow: "2027-2042", quantity: "1 bottle", purchase: "Not added", market: "Researching", priceRange: "Research pending",
    service: "12 C / no decant", note: "White flowers, Meyer lemon, citrus oil, hazelnut, and crushed chalk. Layered, satin-textured, and mineral.",
    accent: "from-[#a48b55] to-[#596659]"
  },
  {
    producer: "Ridge Vineyards", wine: "Monte Bello Cabernet Sauvignon", vintage: "2019",
    region: "Santa Cruz Mountains, USA", appellation: "Santa Cruz Mountains", grapes: "Cabernet Sauvignon blend",
    classification: "Estate wine", cellar: "Location not set", score: "96", window: "Needs aging",
    drinkingWindow: "2032-2065", quantity: "1 bottle", purchase: "Not added", market: "Researching", priceRange: "Research pending",
    service: "17 C / 90 min decant", note: "Mountain cassis, mint, crushed stone, cedar, and savory herbs framed by fresh acidity and firm tannins.",
    accent: "from-cellar-moss to-cellar-slate"
  },
  {
    producer: "Giacomo Conterno", wine: "Barolo Monfortino Riserva", vintage: "2013",
    region: "Piedmont, Italy", appellation: "Barolo DOCG", grapes: "100% Nebbiolo",
    classification: "Riserva", cellar: "Location not set", score: "99", window: "Entering peak",
    drinkingWindow: "2026-2055", quantity: "1 bottle", purchase: "Not added", market: "Researching", priceRange: "Research pending",
    service: "18 C / 180 min decant", note: "Rose, tar, red fruit, iron, and alpine herbs; profound, detailed, and still gaining complexity.",
    accent: "from-[#7a2832] to-[#34211d]"
  }
];

const windows = [
  ["Too Young", 16, "bg-sky-800"],
  ["Approaching Peak", 28, "bg-emerald-700"],
  ["Peak Drinking", 34, "bg-cellar-gold"],
  ["Drink Soon", 22, "bg-burgundy-500"]
];

const regionCoordinates: Record<string, { left: number; top: number }> = {
  Burgundy: { left: 48, top: 35 },
  Bordeaux: { left: 46, top: 39 },
  Champagne: { left: 49, top: 32 },
  Rioja: { left: 44, top: 42 },
  Piedmont: { left: 51, top: 40 },
  Tuscany: { left: 52, top: 45 },
  Napa: { left: 16, top: 41 },
  "Santa Cruz": { left: 16, top: 43 },
  "Finger Lakes": { left: 27, top: 38 },
  Mosel: { left: 50, top: 34 },
  "Rhône": { left: 48, top: 41 },
  Mendoza: { left: 31, top: 72 },
  Chile: { left: 28, top: 72 },
  Barossa: { left: 82, top: 73 },
  Marlborough: { left: 88, top: 78 },
  Douro: { left: 43, top: 43 },
  Stellenbosch: { left: 53, top: 76 }
};

type AiRecognition = {
  producer: string;
  wine: string;
  vintage: string;
  country: string;
  region: string;
  appellation: string;
  grapes: string;
  classification: string;
  style: string;
  confidence: number;
  drinkingWindow: string;
  service: string;
  note: string;
  tastingNotes: string[];
  producerHistory: string;
  vintageSummary: string;
  foodPairing: string;
  sources: string[];
  alternatives: string[];
  recognitionProvider?: string;
};

type TonightProfile = {
  label: string;
  weather: string;
};

const weatherDescriptions: Record<number, string> = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "foggy",
  51: "light drizzle",
  53: "drizzly",
  55: "rainy",
  61: "light rain",
  63: "rainy",
  65: "heavy rain",
  71: "light snow",
  73: "snowy",
  75: "heavy snow",
  80: "rain showers",
  81: "rain showers",
  82: "heavy showers",
  95: "thunderstorms"
};

const fallbackRates: ExchangeRates = {
  GBP: 1,
  USD: 1.29,
  EUR: 1.16
};

const currencyLabels: Record<CurrencyCode, string> = {
  GBP: "GBP (£)",
  USD: "USD ($)",
  EUR: "Euro (€)"
};

const currencySymbols: Record<CurrencyCode, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€"
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function fileToDataUrl(file: File) {
  const original = await readFileAsDataUrl(file);
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(original);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = () => resolve(original);
    image.src = original;
  });
}

function toCollectionBottle(recognition: AiRecognition): CollectionBottle {
  return {
    producer: recognition.producer || "Unknown producer",
    wine: recognition.wine || "Unidentified wine",
    vintage: recognition.vintage || "NV",
    region: [recognition.region, recognition.country].filter(Boolean).join(", ") || "Region unknown",
    appellation: recognition.appellation || "Appellation unknown",
    grapes: recognition.grapes || "Grapes not confirmed",
    classification: recognition.classification || recognition.style || "Wine",
    style: recognition.style,
    cellar: "Location not set",
    score: String(Math.round(Math.max(0, Math.min(100, recognition.confidence || 0)))),
    window: recognition.drinkingWindow ? "Research suggested" : "Needs review",
    drinkingWindow: recognition.drinkingWindow || "Confirm after identification",
    quantity: "1 bottle",
    purchase: "Not added",
    market: "Researching",
    priceRange: "Research after opening details",
    service: recognition.service || "Confirm serving guidance",
    note: recognition.note || "AI recognition completed, but tasting detail was limited.",
    tastingNotes: recognition.tastingNotes,
    accent: "from-[#7a2832] to-[#34211d]",
    confidence: recognition.confidence,
    recognitionSource: recognition.recognitionProvider || "OpenAI",
    sources: recognition.sources,
    alternatives: recognition.alternatives,
    producerHistory: recognition.producerHistory,
    vintageSummary: recognition.vintageSummary,
    foodPairing: recognition.foodPairing
  };
}

function profileForWeather(label: string, temperature: number, weatherCode: number): TonightProfile {
  const condition = weatherDescriptions[weatherCode] ?? "settled";
  const fahrenheit = Math.round((temperature * 9) / 5 + 32);
  if (temperature >= 23) {
    return {
      label,
      weather: `${fahrenheit} F / ${condition}`
    };
  }
  if (temperature <= 10 || weatherCode >= 51) {
    return {
      label,
      weather: `${fahrenheit} F / ${condition}`
    };
  }
  return {
    label,
    weather: `${fahrenheit} F / ${condition}`
  };
}

function regionLabel(region: string) {
  const lower = region.toLowerCase();
  const knownRegion = Object.keys(regionCoordinates).find((name) => lower.includes(name.toLowerCase()));
  if (knownRegion) return knownRegion;
  return region.split(",")[0]?.trim() || "Unknown region";
}

function mapPositionForRegion(region: string, index: number) {
  const known = regionCoordinates[region];
  if (known) return known;
  return {
    left: 18 + ((index * 17) % 66),
    top: 28 + ((index * 13) % 44)
  };
}

function sourceCurrencyForRange(range: string): CurrencyCode {
  if (range.includes("$")) return "USD";
  if (range.includes("€")) return "EUR";
  return "GBP";
}

function amountToGbp(amount: number, sourceCurrency: CurrencyCode, rates: ExchangeRates) {
  if (sourceCurrency === "GBP") return amount;
  return amount / rates[sourceCurrency];
}

function formatCurrencyAmount(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 100 ? 0 : 2
  }).format(amount);
}

function displayPriceRange(priceRange: string | undefined, currency: CurrencyCode, rates: ExchangeRates) {
  if (!priceRange || /research|pending|not enough|not publicly/i.test(priceRange)) {
    return priceRange || "Research after opening details";
  }
  const matches = [...priceRange.matchAll(/([\d,]+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((amount) => Number.isFinite(amount));
  const looksLikeBrokenRange = /(?:[$£€]\s*(?:-|to)|(?:-|to)\s*[$£€])/i.test(priceRange) && matches.length < 2;
  if (!matches.length || looksLikeBrokenRange) return "Price range needs research";
  const sourceCurrency = sourceCurrencyForRange(priceRange);
  const cleaned = matches
    .filter((amount) => amount > 0 && amount < 50000)
    .slice(0, 2);
  if (!cleaned.length) return "Price range needs research";
  const converted = cleaned.map((amount) => amountToGbp(amount, sourceCurrency, rates) * rates[currency]);
  const suffix = priceRange.match(/per .*/i)?.[0] ?? "per 750 ml bottle";
  if (converted.length === 1) return `${formatCurrencyAmount(converted[0], currency)} ${suffix}`;
  return `${formatCurrencyAmount(Math.min(...converted), currency)}-${formatCurrencyAmount(Math.max(...converted), currency)} ${suffix}`;
}

function wineTypeForBottle(bottle: CollectionBottle) {
  const text = `${bottle.style ?? ""} ${bottle.classification} ${bottle.wine} ${bottle.grapes} ${bottle.appellation}`.toLowerCase();
  if (/sparkling|champagne|prosecco|cava|franciacorta|pet[- ]?nat|crémant|cremant/.test(text)) return "Sparkling";
  if (/rosé|rose wine|rosado|rosato/.test(text)) return "Rosé";
  if (/orange wine|skin contact|amber wine/.test(text)) return "Orange";
  const whiteMatches = text.match(/white|blanc|bianco|blanco|chardonnay|riesling|sauvignon blanc|chenin blanc|pinot grigio|pinot gris|albariño|albarino|viura|macabeo|verdejo|semillon|sémillon|gewürztraminer|gewurztraminer|grüner|gruner/g)?.length ?? 0;
  const redMatches = text.match(/red|rouge|rosso|tinto|cabernet|merlot|pinot noir|nebbiolo|syrah|shiraz|grenache|garnacha|sangiovese|tempranillo|malbec|zinfandel|mourvèdre|mourvedre|gamay/g)?.length ?? 0;
  if (redMatches > whiteMatches) return "Red";
  if (whiteMatches > redMatches) return "White";
  return "Other";
}

function viewFromHash(hash: string): ViewId {
  const value = hash.replace("#", "");
  if (["add-bottle", "collection-overview", "dashboard", "my-collection", "regional-map", "sommelier", "settings"].includes(value)) {
    return value as ViewId;
  }
  return "home";
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [liveTonight, setLiveTonight] = useState<TonightProfile | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [bottleImageName, setBottleImageName] = useState("No bottle photo selected");
  const [bottleImagePreview, setBottleImagePreview] = useState("");
  const [bottleIntent, setBottleIntent] = useState<"collection" | "checking">("collection");
  const [researchIndex, setResearchIndex] = useState(-1);
  const [recognizedBottle, setRecognizedBottle] = useState<CollectionBottle | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState("Upload or take a photo to identify the bottle");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [activeDialog, setActiveDialog] = useState<{ title: string; body: string; confirmLabel?: string; onConfirm?: () => void } | null>(null);
  const [activeBottle, setActiveBottle] = useState<CollectionBottle | null>(null);
  const [isResearchingBottle, setIsResearchingBottle] = useState(false);
  const [bottleResearchError, setBottleResearchError] = useState("");
  const [favoriteBottles, setFavoriteBottles] = useState<string[]>([]);
  const [collectionBottles, setCollectionBottles] = useState<CollectionBottle[]>([]);
  const [checkedBottles, setCheckedBottles] = useState<CollectionBottle[]>([]);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionRegion, setCollectionRegion] = useState("All regions");
  const [collectionType, setCollectionType] = useState("All types");
  const [collectionGrape, setCollectionGrape] = useState("All grapes");
  const [collectionWindow, setCollectionWindow] = useState("All windows");
  const [collectionResearch, setCollectionResearch] = useState("All research");
  const [collectionSort, setCollectionSort] = useState("producer");
  const [selectedMapRegion, setSelectedMapRegion] = useState("");
  const [sommelierInput, setSommelierInput] = useState("");
  const [sommelierMessages, setSommelierMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    { role: "assistant", text: "Good evening. What are you cooking, or what would you like to open?" }
  ]);
  const [firstName, setFirstName] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [cellarName, setCellarName] = useState("My Cellar");
  const [profileCellarName, setProfileCellarName] = useState("My Cellar");
  const [currency, setCurrency] = useState<CurrencyCode>("GBP");
  const [profileCurrency, setProfileCurrency] = useState<CurrencyCode>("GBP");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(fallbackRates);
  const [exchangeStatus, setExchangeStatus] = useState("Using backup exchange rates.");
  const [profileStatus, setProfileStatus] = useState("");
  const [accounts, setAccounts] = useState<CellarAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<CellarAccount | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "create">("create");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const researchedBottle = recognizedBottle ?? researchedWines[Math.max(researchIndex, 0)];
  const tonight = liveTonight ?? {
    label: "",
    weather: "Location not set"
  };
  const recommendedBottle = collectionBottles[0];
  const recommendationService = recommendedBottle
    ? [...recommendedBottle.service.split("/").map((item) => item.trim()), recommendedBottle.drinkingWindow]
    : ["No bottle", "No service", "No window"];
  const collectionTotal = collectionBottles.reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
  const typeCount = (type: string) => collectionBottles
    .filter((bottle) => wineTypeForBottle(bottle) === type)
    .reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
  const grapeOptions = Array.from(new Set(collectionBottles.flatMap((bottle) =>
    bottle.grapes
      .split(/,|\/|\+| and /i)
      .map((grape) => grape.replace(/\d+%/g, "").trim())
      .filter(Boolean)
  ))).sort();
  const windowOptions = Array.from(new Set(collectionBottles.map((bottle) => bottle.window).filter(Boolean))).sort();
  const visibleBottles = collectionBottles
    .filter((bottle) => collectionRegion === "All regions" || regionLabel(bottle.region) === collectionRegion)
    .filter((bottle) => collectionType === "All types" || wineTypeForBottle(bottle) === collectionType)
    .filter((bottle) => collectionGrape === "All grapes" || bottle.grapes.toLowerCase().includes(collectionGrape.toLowerCase()))
    .filter((bottle) => collectionWindow === "All windows" || bottle.window === collectionWindow)
    .filter((bottle) => {
      if (collectionResearch === "All research") return true;
      if (collectionResearch === "Researched") return Boolean(bottle.research) || !/research/i.test(bottle.priceRange ?? "");
      return !bottle.research && /research/i.test(bottle.priceRange ?? "");
    })
    .filter((bottle) => `${bottle.producer} ${bottle.wine} ${bottle.vintage} ${bottle.region} ${bottle.grapes}`.toLowerCase().includes(collectionSearch.toLowerCase()))
    .sort((a, b) => {
      if (collectionSort === "score") return Number(b.score) - Number(a.score);
      if (collectionSort === "vintage") return String(b.vintage).localeCompare(String(a.vintage));
      return a.producer.localeCompare(b.producer);
    });
  const groupedVisibleBottles = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"]
    .map((type) => ({
      type,
      bottles: visibleBottles.filter((bottle) => wineTypeForBottle(bottle) === type)
    }))
    .filter((group) => group.bottles.length);
  const readyCount = collectionBottles.filter((bottle) => /peak/i.test(bottle.window)).length;
  const mapRegions = useMemo(() => {
    const grouped = new Map<string, CollectionBottle[]>();
    collectionBottles.forEach((bottle) => {
      const label = regionLabel(bottle.region);
      grouped.set(label, [...(grouped.get(label) ?? []), bottle]);
    });
    return Array.from(grouped.entries()).map(([region, bottles], index) => ({
      region,
      bottles,
      position: mapPositionForRegion(region, index)
    }));
  }, [collectionBottles]);
  const activeMapRegion = selectedMapRegion || mapRegions[0]?.region || "";
  const cellarStats = [
    [String(collectionTotal), "Bottles"],
    [String(readyCount), "Ready now"],
    [String(Math.max(collectionTotal - readyCount, 0)), "Resting"],
    [String(new Set(collectionBottles.map((bottle) => bottle.region)).size), "Regions"]
  ];
  const selectedRegionBottles = activeMapRegion ? collectionBottles.filter((bottle) => regionLabel(bottle.region) === activeMapRegion) : [];
  const selectedRegionTotal = selectedRegionBottles.reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
  const selectedRegionReady = selectedRegionBottles.filter((bottle) => /peak/i.test(bottle.window)).length;
  const selectedRegionScore = selectedRegionBottles.length
    ? (selectedRegionBottles.reduce((total, bottle) => total + Number(bottle.score), 0) / selectedRegionBottles.length).toFixed(1)
    : "-";
  const selectedRegionTopBottle = selectedRegionBottles
    .slice()
    .sort((a, b) => Number(b.score) - Number(a.score))[0];
  const selectedRegionReadyBottles = selectedRegionBottles.filter((bottle) => /peak/i.test(bottle.window));
  const scopedStorageKey = (key: string) => storageKeyForAccount(currentAccount, key);

  async function supabaseRequest<T>(path: string, options: RequestInit = {}, token = supabaseSession?.access_token): Promise<T> {
    if (!hasSupabaseConfig) throw new Error("Supabase is not configured.");
    const headers = new Headers(options.headers);
    headers.set("apikey", supabaseAnonKey);
    headers.set("Authorization", `Bearer ${token ?? supabaseAnonKey}`);
    if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
    const response = await fetch(`${supabaseUrl}${path}`, { ...options, headers });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Supabase request failed with ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  function readableSupabaseError(error: unknown) {
    if (!(error instanceof Error)) return "Supabase returned an unknown error.";
    try {
      const parsed = JSON.parse(error.message) as {
        msg?: string;
        message?: string;
        error?: string;
        error_description?: string;
      };
      return parsed.msg ?? parsed.message ?? parsed.error_description ?? parsed.error ?? error.message;
    } catch {
      return error.message;
    }
  }

  async function ensureCloudCellar(session: SupabaseSession, displayName: string) {
    const existingMemberships = await supabaseRequest<Array<{ cellar_id: string }>>(
      `/rest/v1/cellar_members?select=cellar_id&user_id=eq.${session.user.id}&limit=1`,
      {},
      session.access_token
    );
    if (existingMemberships[0]?.cellar_id) return existingMemberships[0].cellar_id;

    const cellarNameValue = `${displayName.split(" ")[0] || displayName}'s Cellar`;
    const createdCellars = await supabaseRequest<Array<{ id: string }>>(
      "/rest/v1/cellars?select=id",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify([{ name: cellarNameValue, owner_id: session.user.id }])
      },
      session.access_token
    );
    const cellarId = createdCellars[0]?.id;
    if (!cellarId) throw new Error("Cellar could not be created.");
    await supabaseRequest(
      "/rest/v1/cellar_members",
      {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify([{ cellar_id: cellarId, user_id: session.user.id, role: "owner" }])
      },
      session.access_token
    );
    return cellarId;
  }

  async function loadCloudBottles(session: SupabaseSession, account: CellarAccount) {
    if (!account.cellarId) return [];
    const rows = await supabaseRequest<CloudBottleRow[]>(
      `/rest/v1/bottles?select=id,cellar_id,data&cellar_id=eq.${account.cellarId}&order=created_at.desc`,
      {},
      session.access_token
    );
    const bottles = rows.map((row) => ({ ...row.data, cloudId: row.id, cellar: row.data.cellar || cellarName }));
    setCollectionBottles(bottles);
    localStorage.setItem(storageKeyForAccount(account, "cellar-collection-bottles-v2"), JSON.stringify(bottles));
    return bottles;
  }

  function findLocalBottlesForMigration() {
    const bottleMap = new Map<string, CollectionBottle>();
    const candidateKeys = [
      "cellar-collection-bottles-v2",
      ...Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? "")
        .filter((key) => key.includes("cellar-collection-bottles-v2"))
    ];
    for (const key of new Set(candidateKeys)) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(saved)) continue;
        for (const bottle of saved) {
          if (!bottle?.producer || !bottle?.wine || !bottle?.vintage) continue;
          const migrationKey = `${bottle.producer}-${bottle.wine}-${bottle.vintage}`;
          bottleMap.set(migrationKey, { ...bottle, cloudId: undefined });
        }
      } catch {
        // Ignore old or malformed local storage buckets.
      }
    }
    return Array.from(bottleMap.values());
  }

  async function syncCloudBottles(next: CollectionBottle[], account = currentAccount, session = supabaseSession) {
    if (!account?.cellarId || !session) return;
    await supabaseRequest(
      `/rest/v1/bottles?cellar_id=eq.${account.cellarId}`,
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
      session.access_token
    );
    if (!next.length) return;
    const rows = await supabaseRequest<CloudBottleRow[]>(
      "/rest/v1/bottles?select=id,cellar_id,data",
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(next.map(({ cloudId, ...data }) => ({ cellar_id: account.cellarId, data })))
      },
      session.access_token
    );
    const savedBottles = rows.map((row) => ({ ...row.data, cloudId: row.id }));
    setCollectionBottles(savedBottles);
    localStorage.setItem(storageKeyForAccount(account, "cellar-collection-bottles-v2"), JSON.stringify(savedBottles));
  }

  function accountFromSession(session: SupabaseSession, cellarId?: string): CellarAccount {
    const name = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Cellar user";
    return {
      id: session.user.id,
      name,
      email: session.user.email ?? "",
      cellarId,
      createdAt: new Date().toISOString()
    };
  }

  function loadCellarData(account: CellarAccount | null) {
    const collectionKey = storageKeyForAccount(account, "cellar-collection-bottles-v2");
    const checksKey = storageKeyForAccount(account, "cellar-checked-bottles-v1");
    const firstNameKey = storageKeyForAccount(account, "cellar-profile-first-name");
    const cellarNameKey = storageKeyForAccount(account, "cellar-profile-cellar-name");
    const currencyKey = storageKeyForAccount(account, "cellar-profile-currency");

    try {
      localStorage.removeItem("cellar-removed-bottles");
      localStorage.removeItem("cellar-collection-bottles");
      const saved = JSON.parse(localStorage.getItem(collectionKey) ?? "[]");
      const legacy = account ? JSON.parse(localStorage.getItem("cellar-collection-bottles-v2") ?? "[]") : [];
      const bottles = Array.isArray(saved) && saved.length ? saved : Array.isArray(legacy) ? legacy : [];
      if (account && !localStorage.getItem(collectionKey) && bottles.length) {
        localStorage.setItem(collectionKey, JSON.stringify(bottles));
      }
      setCollectionBottles(bottles);
    } catch {
      setCollectionBottles([]);
    }
    try {
      const savedChecks = JSON.parse(localStorage.getItem(checksKey) ?? "[]");
      const legacyChecks = account ? JSON.parse(localStorage.getItem("cellar-checked-bottles-v1") ?? "[]") : [];
      const checks = Array.isArray(savedChecks) && savedChecks.length ? savedChecks : Array.isArray(legacyChecks) ? legacyChecks : [];
      if (account && !localStorage.getItem(checksKey) && checks.length) {
        localStorage.setItem(checksKey, JSON.stringify(checks));
      }
      setCheckedBottles(checks);
    } catch {
      setCheckedBottles([]);
    }
    try {
      const savedFirstName = localStorage.getItem(firstNameKey) ?? "";
      const savedCellarName = localStorage.getItem(cellarNameKey) ?? "";
      const savedCurrency = localStorage.getItem(currencyKey) as CurrencyCode | null;
      const accountFirstName = account?.name.split(" ")[0] ?? "";
      const nextFirstName = savedFirstName || accountFirstName;
      const nextCellarName = savedCellarName || (account ? `${account.name.split(" ")[0] || account.name}'s Cellar` : "My Cellar");
      setFirstName(nextFirstName);
      setProfileFirstName(nextFirstName);
      setCellarName(nextCellarName);
      setProfileCellarName(nextCellarName);
      if (savedCurrency && savedCurrency in currencyLabels) {
        setCurrency(savedCurrency);
        setProfileCurrency(savedCurrency);
      }
    } catch {
      setFirstName("");
    }
  }

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    setActiveView(viewFromHash(window.location.hash));
    const handleHashChange = () => {
      setActiveView(viewFromHash(window.location.hash));
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    };
    window.addEventListener("hashchange", handleHashChange);
    if (!window.location.hash) window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    void (async () => {
      try {
        if (hasSupabaseConfig) {
          const savedCloudSession = JSON.parse(localStorage.getItem(supabaseSessionStorageKey) ?? "null") as SupabaseSession | null;
          if (savedCloudSession?.access_token && savedCloudSession.user?.id) {
            setSupabaseSession(savedCloudSession);
            const cellarId = await ensureCloudCellar(savedCloudSession, savedCloudSession.user.user_metadata?.name || "Cellar");
            const cloudAccount = accountFromSession(savedCloudSession, cellarId);
            setCurrentAccount(cloudAccount);
            setAuthMode("signin");
            loadCellarData(cloudAccount);
            await loadCloudBottles(savedCloudSession, cloudAccount);
            setAccountStatus(`Signed in to ${cloudAccount.name}'s shared cellar.`);
            return;
          }
        }
        const savedAccounts = JSON.parse(localStorage.getItem(accountsStorageKey) ?? "[]");
        const normalizedAccounts = Array.isArray(savedAccounts) ? savedAccounts : [];
        const sessionId = localStorage.getItem(sessionStorageKey);
        const sessionAccount = normalizedAccounts.find((account: CellarAccount) => account.id === sessionId) ?? null;
        setAccounts(normalizedAccounts);
        setCurrentAccount(sessionAccount);
        setAuthMode(sessionAccount ? "signin" : "create");
        loadCellarData(sessionAccount);
      } catch (error) {
        console.error("Cellar account restore failed:", error);
        loadCellarData(null);
      } finally {
        setAuthReady(true);
      }
    })();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    async function loadExchangeRates() {
      try {
        const response = await fetch("https://api.frankfurter.app/latest?from=GBP&to=USD,EUR");
        if (!response.ok) throw new Error("Exchange rates unavailable");
        const data = await response.json() as { rates?: { USD?: number; EUR?: number }; date?: string };
        const nextRates = {
          GBP: 1,
          USD: data.rates?.USD ?? fallbackRates.USD,
          EUR: data.rates?.EUR ?? fallbackRates.EUR
        };
        setExchangeRates(nextRates);
        setExchangeStatus(`Live exchange rates loaded${data.date ? ` for ${data.date}` : ""}.`);
      } catch {
        setExchangeRates(fallbackRates);
        setExchangeStatus("Live exchange rates unavailable. Using backup rates.");
      }
    }
    void loadExchangeRates();
  }, []);

  useEffect(() => {
    if (!mapRegions.length) {
      if (selectedMapRegion) setSelectedMapRegion("");
      return;
    }
    if (!mapRegions.some((item) => item.region === selectedMapRegion)) {
      setSelectedMapRegion(mapRegions[0].region);
    }
  }, [mapRegions, selectedMapRegion]);

  async function handleBottleImage(file?: File) {
    if (!file) return;
    setRecognizedBottle(null);
    setRecognitionStatus("Thinking...");
    setIsRecognizing(true);
    setResearchIndex(-1);
    setBottleImageName(file.name);
    setBottleImagePreview(URL.createObjectURL(file));

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 70000);
    let failureCode = "CLIENT_UNKNOWN";
    try {
      const image = await fileToDataUrl(file);
      const response = await fetch("/api/recognize-wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
        signal: controller.signal
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "AI recognition unavailable.", code: `HTTP_${response.status}` })) as { error?: string; code?: string };
        failureCode = error.code ?? `HTTP_${response.status}`;
        throw new Error(error.error ?? "AI recognition unavailable.");
      }
      const recognition = await response.json() as AiRecognition;
      const bottle = toCollectionBottle(recognition);
      setRecognizedBottle(bottle);
      if (bottleIntent === "checking") rememberCheckedBottle(bottle);
      setRecognitionStatus(`Identified ${recognition.vintage} ${recognition.producer}. Researching per-bottle price range...`);
      void enrichScannedBottleWithResearch(bottle, bottleIntent);
      return;
    } catch (error) {
      console.error("Cellar bottle recognition failed:", error);
      setResearchIndex(-1);
      if (error instanceof DOMException && error.name === "AbortError") failureCode = "CLIENT_TIMEOUT";
      setRecognitionStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? `Recognition took too long. Try a closer label photo. Reference: ${failureCode}`
          : `We could not identify this bottle. Try another photo. Reference: ${failureCode}`
      );
    } finally {
      window.clearTimeout(timeout);
      setIsRecognizing(false);
    }
  }

  function refreshIdentification() {
    setRecognizedBottle(null);
    setResearchIndex(-1);
    setBottleImagePreview("");
    setBottleImageName("No bottle photo selected");
    setRecognitionStatus("Upload or take a photo to identify the bottle");
    setIsRecognizing(false);
  }

  function saveProfile() {
    const nameValue = profileFirstName.trim();
    const cellarValue = profileCellarName.trim();
    if (!cellarValue) {
      setProfileStatus("Name your cellar.");
      return;
    }
    localStorage.setItem(scopedStorageKey("cellar-profile-first-name"), nameValue);
    localStorage.setItem(scopedStorageKey("cellar-profile-cellar-name"), cellarValue);
    localStorage.setItem(scopedStorageKey("cellar-profile-currency"), profileCurrency);
    setFirstName(nameValue);
    setCellarName(cellarValue);
    setCurrency(profileCurrency);
    setProfileStatus("Profile saved.");
  }

  function saveAccounts(next: CellarAccount[]) {
    setAccounts(next);
    localStorage.setItem(accountsStorageKey, JSON.stringify(next));
  }

  function resetAuthForm() {
    setAccountName("");
    setAccountEmail("");
    setAccountPassword("");
  }

  async function createAccount() {
    const name = accountName.trim();
    const email = accountEmail.trim().toLowerCase();
    const password = accountPassword;
    if (!name || !email || !password) {
      setAccountStatus("Enter a name, email, and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAccountStatus("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setAccountStatus("Use at least 6 characters for the password.");
      return;
    }
    if (hasSupabaseConfig) {
      setAccountStatus("Creating your shared cellar account...");
      try {
        const session = await supabaseRequest<SupabaseSession>(
          "/auth/v1/signup",
          {
            method: "POST",
            body: JSON.stringify({ email, password, data: { name } })
          },
          supabaseAnonKey
        );
        if (!session.access_token) {
          setAccountStatus("Account created. Check your email to confirm it, then sign in.");
          setAuthMode("signin");
          resetAuthForm();
          return;
        }
        const cellarId = await ensureCloudCellar(session, name);
        const cloudAccount = accountFromSession(session, cellarId);
        setSupabaseSession(session);
        setCurrentAccount(cloudAccount);
        localStorage.setItem(supabaseSessionStorageKey, JSON.stringify(session));
        localStorage.setItem(sessionStorageKey, cloudAccount.id);
        localStorage.setItem(storageKeyForAccount(cloudAccount, "cellar-profile-first-name"), name.split(" ")[0] ?? name);
        localStorage.setItem(storageKeyForAccount(cloudAccount, "cellar-profile-cellar-name"), `${name.split(" ")[0] || name}'s Cellar`);
        localStorage.setItem(storageKeyForAccount(cloudAccount, "cellar-profile-currency"), profileCurrency);
        loadCellarData(cloudAccount);
        await syncCloudBottles(collectionBottles, cloudAccount, session);
        resetAuthForm();
        setAccountStatus(`Signed in as ${name}. Your shared cellar is now cloud-backed.`);
      } catch (error) {
        console.error("Supabase sign up failed:", error);
        setAccountStatus(`Could not create the cloud account: ${readableSupabaseError(error)}`);
      }
      return;
    }
    if (accounts.some((account) => account.email === email)) {
      setAccountStatus("That email already has an account. Sign in instead.");
      setAuthMode("signin");
      return;
    }
    const nextAccount = {
      id: `account-${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    const nextAccounts = [...accounts, nextAccount];
    saveAccounts(nextAccounts);
    localStorage.setItem(sessionStorageKey, nextAccount.id);
    setCurrentAccount(nextAccount);
    setProfileFirstName(name.split(" ")[0] ?? name);
    setProfileCellarName(`${name.split(" ")[0] || name}'s Cellar`);
    localStorage.setItem(storageKeyForAccount(nextAccount, "cellar-profile-first-name"), name.split(" ")[0] ?? name);
    localStorage.setItem(storageKeyForAccount(nextAccount, "cellar-profile-cellar-name"), `${name.split(" ")[0] || name}'s Cellar`);
    localStorage.setItem(storageKeyForAccount(nextAccount, "cellar-profile-currency"), profileCurrency);
    loadCellarData(nextAccount);
    resetAuthForm();
    setAccountStatus(`Signed in as ${name}. This account now owns the shared cellar on this device.`);
  }

  async function signInAccount() {
    const email = accountEmail.trim().toLowerCase();
    const password = accountPassword;
    if (hasSupabaseConfig) {
      if (!email || !password) {
        setAccountStatus("Enter your email and password.");
        return;
      }
      setAccountStatus("Signing in to your shared cellar...");
      try {
        const session = await supabaseRequest<SupabaseSession>(
          "/auth/v1/token?grant_type=password",
          {
            method: "POST",
            body: JSON.stringify({ email, password })
          },
          supabaseAnonKey
        );
        const cellarId = await ensureCloudCellar(session, session.user.user_metadata?.name || email);
        const cloudAccount = accountFromSession(session, cellarId);
        setSupabaseSession(session);
        setCurrentAccount(cloudAccount);
        localStorage.setItem(supabaseSessionStorageKey, JSON.stringify(session));
        localStorage.setItem(sessionStorageKey, cloudAccount.id);
        const localBottlesToMigrate = findLocalBottlesForMigration();
        loadCellarData(cloudAccount);
        const cloudBottles = await loadCloudBottles(session, cloudAccount);
        if (!cloudBottles.length && localBottlesToMigrate.length) {
          await syncCloudBottles(localBottlesToMigrate, cloudAccount, session);
          setAccountStatus(`Signed in to ${cloudAccount.name}'s shared cellar. Migrated ${localBottlesToMigrate.length} local bottle${localBottlesToMigrate.length === 1 ? "" : "s"} to Supabase.`);
        } else {
          setAccountStatus(`Signed in to ${cloudAccount.name}'s shared cellar.`);
        }
        resetAuthForm();
      } catch (error) {
        console.error("Supabase sign in failed:", error);
        setAccountStatus(`Could not sign in: ${readableSupabaseError(error)}`);
      }
      return;
    }
    const account = accounts.find((item) => item.email === email && item.password === password);
    if (!account) {
      setAccountStatus("Email or password did not match an account.");
      return;
    }
    localStorage.setItem(sessionStorageKey, account.id);
    setCurrentAccount(account);
    loadCellarData(account);
    resetAuthForm();
    setAccountStatus(`Signed in to ${account.name}'s shared cellar.`);
  }

  async function signOutAccount() {
    if (supabaseSession) {
      await supabaseRequest(
        "/auth/v1/logout",
        { method: "POST" },
        supabaseSession.access_token
      ).catch(() => undefined);
    }
    localStorage.removeItem(supabaseSessionStorageKey);
    localStorage.removeItem(sessionStorageKey);
    setSupabaseSession(null);
    setCurrentAccount(null);
    loadCellarData(null);
    setAccountStatus("Signed out. Sign in again to access the shared cellar.");
  }

  async function loadWeather(latitude: number, longitude: number, label: string) {
    setLocationStatus("Checking local conditions...");
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );
      if (!response.ok) throw new Error("Weather unavailable");
      const data = await response.json() as { current: { temperature_2m: number; weather_code: number } };
      setLiveTonight(profileForWeather(label, data.current.temperature_2m, data.current.weather_code));
      setLocationStatus(`Using live weather for ${label}`);
    } catch {
      setLocationStatus("Live weather could not be loaded. Try again.");
    }
  }

  async function searchLocation() {
    const query = locationQuery.trim();
    if (!query) {
      setLocationStatus("Type a city or postcode first.");
      return;
    }
    setLocationStatus("Finding that location...");
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );
      if (!response.ok) throw new Error("Location unavailable");
      const data = await response.json() as {
        results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number }>;
      };
      const result = data.results?.[0];
      if (!result) {
        setLocationStatus("No matching location found.");
        return;
      }
      const label = [result.name, result.admin1, result.country].filter(Boolean).filter((item, index, all) => all.indexOf(item) === index).join(", ");
      await loadWeather(result.latitude, result.longitude, label);
    } catch {
      setLocationStatus("That location could not be loaded. Try another.");
    }
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location services are not available on this device.");
      return;
    }
    setLocationStatus("Waiting for location permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void loadWeather(latitude, longitude, `Current location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      },
      () => setLocationStatus("Location access was not granted. You can type a city instead."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  function showDialog(title: string, body: string, confirmLabel?: string, onConfirm?: () => void) {
    setActiveDialog({ title, body, confirmLabel, onConfirm });
  }

  function persistCollection(next: CollectionBottle[]) {
    setCollectionBottles(next);
    try {
      localStorage.setItem(scopedStorageKey("cellar-collection-bottles-v2"), JSON.stringify(next));
    } catch {
      setCollectionBottles(next);
    }
    void syncCloudBottles(next).catch((error) => {
      console.error("Cellar cloud sync failed:", error);
      setAccountStatus("Saved on this device, but cloud sync failed. Check Supabase policies.");
    });
  }

  async function enrichScannedBottleWithResearch(bottle: CollectionBottle, intent: "collection" | "checking") {
    try {
      const response = await fetch("/api/research-wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producer: bottle.producer,
          wine: bottle.wine,
          vintage: bottle.vintage,
          region: bottle.region,
          appellation: bottle.appellation
        })
      });
      if (!response.ok) throw new Error("Research unavailable");
      const research = await response.json() as WineResearch;
      const updatedBottle = {
        ...bottle,
        research,
        note: research.summary || bottle.note,
        style: research.wineColor || bottle.style,
        tastingNotes: research.tastingNotes.length ? research.tastingNotes : bottle.tastingNotes,
        drinkingWindow: research.drinkWindow.start && research.drinkWindow.end
          ? `${research.drinkWindow.start}-${research.drinkWindow.end}`
          : bottle.drinkingWindow,
        window: research.drinkWindow.status || bottle.window,
        priceRange: research.marketPriceRange || bottle.priceRange,
        market: research.marketPriceRange || bottle.market,
        foodPairing: [...research.communityPairings, ...research.sommelierPairings].join(", ") || bottle.foodPairing
      };
      setRecognizedBottle((current) =>
        current?.producer === bottle.producer && current.wine === bottle.wine && current.vintage === bottle.vintage
          ? updatedBottle
          : current
      );
      if (intent === "checking") rememberCheckedBottle(updatedBottle);
      setCollectionBottles((current) => {
        const next = current.map((item) =>
          item.producer === bottle.producer && item.wine === bottle.wine && item.vintage === bottle.vintage
            ? updatedBottle
            : item
        );
        if (next !== current && next.some((item) => item === updatedBottle)) {
          try {
            localStorage.setItem(scopedStorageKey("cellar-collection-bottles-v2"), JSON.stringify(next));
          } catch {
            // Keep the in-memory update even if local storage is full.
          }
          void syncCloudBottles(next).catch((error) => {
            console.error("Cellar cloud research sync failed:", error);
          });
        }
        return next;
      });
      setRecognitionStatus(`Identified ${bottle.vintage} ${bottle.producer}. Per-bottle price range updated.`);
    } catch {
      setRecognitionStatus(`Identified ${bottle.vintage} ${bottle.producer}. Price range needs research from bottle details.`);
    }
  }

  function rememberCheckedBottle(bottle: CollectionBottle) {
    setCheckedBottles((current) => {
      const key = `${bottle.producer}-${bottle.wine}-${bottle.vintage}`;
      const next = [
        { ...bottle, quantity: "1 bottle", scannedAt: new Date().toISOString() },
        ...current.filter((item) => `${item.producer}-${item.wine}-${item.vintage}` !== key)
      ].slice(0, 12);
      try {
        localStorage.setItem(scopedStorageKey("cellar-checked-bottles-v1"), JSON.stringify(next));
      } catch {
        // Local memory is optional; keep the in-session list even if storage is unavailable.
      }
      return next;
    });
  }

  function addBottleToCollection(bottle: CollectionBottle) {
    const key = `${bottle.producer}-${bottle.vintage}`;
    const existing = collectionBottles.findIndex((item) => `${item.producer}-${item.vintage}` === key);
    const next = [...collectionBottles];
    if (existing >= 0) {
      const quantity = Number.parseInt(next[existing].quantity, 10) + 1;
      next[existing] = { ...next[existing], quantity: `${quantity} bottles` };
    } else {
      next.push({ ...bottle, cellar: cellarName });
    }
    persistCollection(next);
  }

  async function openBottleDetails(bottle: CollectionBottle) {
    setActiveBottle(bottle);
    setBottleResearchError("");
    setIsResearchingBottle(true);
    try {
      const response = await fetch("/api/research-wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producer: bottle.producer,
          wine: bottle.wine,
          vintage: bottle.vintage,
          region: bottle.region,
          appellation: bottle.appellation
        })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Live wine research is unavailable." })) as { error?: string };
        throw new Error(error.error ?? "Live wine research is unavailable.");
      }
      const research = await response.json() as WineResearch;
      const updatedBottle = {
        ...bottle,
        research,
        note: research.summary || bottle.note,
        style: research.wineColor || bottle.style,
        tastingNotes: research.tastingNotes.length ? research.tastingNotes : bottle.tastingNotes,
        drinkingWindow: research.drinkWindow.start && research.drinkWindow.end
          ? `${research.drinkWindow.start}-${research.drinkWindow.end}`
          : bottle.drinkingWindow,
        window: research.drinkWindow.status || bottle.window,
        priceRange: research.marketPriceRange || bottle.priceRange,
        market: research.marketPriceRange || bottle.market,
        foodPairing: [...research.communityPairings, ...research.sommelierPairings].join(", ") || bottle.foodPairing
      };
      setActiveBottle(updatedBottle);
      persistCollection(collectionBottles.map((item) =>
        item.producer === bottle.producer && item.wine === bottle.wine && item.vintage === bottle.vintage
          ? updatedBottle
          : item
      ));
    } catch (error) {
      console.error("Cellar bottle research failed:", error);
      setBottleResearchError("Live wine research is temporarily unavailable.");
    } finally {
      setIsResearchingBottle(false);
    }
  }

  function saveResearchedBottle() {
    if (researchIndex < 0 && !recognizedBottle) return;
    addBottleToCollection(researchedBottle);
    refreshIdentification();
  }

  function deleteBottle(key: string) {
    const next = collectionBottles.filter((bottle) => `${bottle.producer}-${bottle.vintage}` !== key);
    persistCollection(next);
  }

  function getSommelierReply(question: string) {
    const query = question.toLowerCase();
    const white = collectionBottles.find((bottle) => /chardonnay|riesling|sauvignon|white/i.test(`${bottle.grapes} ${bottle.wine}`));
    const red = collectionBottles.find((bottle) => /pinot noir|cabernet|nebbiolo|syrah|merlot/i.test(`${bottle.grapes} ${bottle.wine}`));
    const bottle = collectionBottles[0];

    if (/pair with a meal|pair a meal|meal pairing/.test(query)) {
      return collectionBottles.length
        ? "Tell me what you are making, how it is prepared, and whether you want something classic or adventurous. I will choose the best options from your cellar."
        : "Tell me what you are making and I can recommend the style to look for. Once bottles are in your cellar, I will choose exact bottles.";
    }
    if (/duck|lamb|beef|steak/.test(query)) {
      return red
        ? `Open your ${red.vintage} ${red.producer} ${red.wine}. Serve it ${red.service}; its ${red.window.toLowerCase()} profile should suit the richness of the dish.`
        : "Your cellar does not yet contain an ideal red for that dish. Look for Pinot Noir with duck, Cabernet with beef, or Nebbiolo with lamb.";
    }
    if (/fish|salmon|seafood|chicken|vegetable/.test(query)) {
      return white
        ? `Choose your ${white.vintage} ${white.producer} ${white.wine}. ${white.note} Serve it ${white.service}.`
        : "Look for a mineral Chardonnay, dry Riesling, or restrained Sauvignon Blanc. Add one to Cellar and I can recommend the exact bottle.";
    }
    if (/tonight|open|ready|drink now/.test(query)) {
      return bottle
        ? `Your best current option is the ${bottle.vintage} ${bottle.producer} ${bottle.wine}. Its drinking window is ${bottle.drinkingWindow}; serve it ${bottle.service}.`
        : "Your collection is empty, so I cannot choose a bottle yet. Tell me what is for dinner and I can still recommend a style.";
    }
    if (/age|aging|hold|keep/.test(query)) {
      return bottle
        ? `The ${bottle.vintage} ${bottle.wine} is ${bottle.window.toLowerCase()}, with a researched window of ${bottle.drinkingWindow}. Revisit it at the beginning of that window.`
        : "Add a bottle and I will assess its vintage, region, producer, structure, and drinking window.";
    }
    if (/pair|food|cook|dinner/.test(query)) {
      return "Tell me the main ingredient and preparation, such as roast duck, grilled salmon, mushroom risotto, or steak.";
    }
    return bottle
      ? `I see ${collectionTotal} bottle${collectionTotal === 1 ? "" : "s"} in your cellar. Ask about pairing, serving, maturity, or whether to open the ${bottle.vintage} ${bottle.wine}.`
      : "I can help with pairings, serving temperatures, regions, and aging. Add a bottle for collection-specific advice.";
  }

  function sendSommelierMessage(prompt?: string) {
    const question = (prompt ?? sommelierInput).trim();
    if (!question) return;
    const reply = getSommelierReply(question);
    setSommelierMessages((current) => [...current, { role: "user", text: question }, { role: "assistant", text: reply }]);
    setSommelierInput("");
  }

  function navigateToView(view: ViewId) {
    setActiveView(view);
    const hash = view === "home" ? "" : `#${view}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash || window.location.pathname);
    }
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-cellar-cream px-4 text-cellar-ink">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Cellar</p>
          <h1 className="mt-3 font-serif text-4xl">Opening your cellar...</h1>
        </div>
      </main>
    );
  }

  if (!currentAccount) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cellar-night px-4 py-10 text-cellar-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(199,162,90,.22),transparent_30%),linear-gradient(180deg,#2a1118,#130b0d)]" />
        <div className="absolute inset-x-8 bottom-0 top-28 rounded-t-full border border-cellar-gold/18 bg-[linear-gradient(90deg,rgba(75,48,41,.42),rgba(23,18,17,.16),rgba(75,48,41,.42))]" />
        <section className="relative w-full max-w-xl rounded-lg border border-cellar-gold/20 bg-cellar-parchment p-6 text-cellar-ink shadow-cellar sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Cellar</p>
          <h1 className="mt-3 font-serif text-4xl">Sign in to your cellar</h1>
          <p className="mt-3 leading-7 text-cellar-walnut">
            Create your profile or sign in before entering your shared collection.
          </p>
          <form
            className="mt-6 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (authMode === "create") void createAccount();
              else void signInAccount();
            }}
          >
            {authMode === "create" && (
              <input
                className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Name"
                autoComplete="name"
                aria-label="Account name"
              />
            )}
            <input
              className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value)}
              placeholder="Email"
              autoComplete="email"
              type="email"
              aria-label="Account email"
            />
            <input
              className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
              value={accountPassword}
              onChange={(event) => setAccountPassword(event.target.value)}
              placeholder="Password"
              autoComplete={authMode === "create" ? "new-password" : "current-password"}
              type="password"
              aria-label="Account password"
            />
            <button className="rounded-md bg-burgundy-700 px-5 py-3 text-sm font-medium text-white" type="submit">
              {authMode === "create" ? "Create profile and enter" : "Sign in"}
            </button>
          </form>
          <button
            className="mt-4 text-sm font-medium text-burgundy-700"
            onClick={() => {
              setAuthMode((mode) => mode === "create" ? "signin" : "create");
              setAccountStatus("");
            }}
            type="button"
          >
            {authMode === "create" ? "Already have an account? Sign in" : "Need an account? Create one"}
          </button>
          <p className="mt-4 min-h-5 text-sm text-cellar-walnut" role="status">
            {accountStatus || (hasSupabaseConfig ? "Cloud sign-in is active." : "Local preview sign-in is active.")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-cellar-cream text-cellar-ink">
      <div className="relative z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <header className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-white/60 bg-white/42 px-3 py-3 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-serif text-xl leading-none tracking-normal">Cellar</p>
              <p className="text-xs uppercase tracking-[0.18em] text-cellar-walnut">Private cellar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#add-bottle" onClick={(event) => { event.preventDefault(); navigateToView("add-bottle"); }} className="hidden items-center gap-2 rounded-md bg-burgundy-700 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-burgundy-900 sm:inline-flex">
              <Camera className="size-4" aria-hidden />
              Add Bottle
            </a>
            <a
              href="#add-bottle"
              onClick={(event) => { event.preventDefault(); navigateToView("add-bottle"); }}
              className="grid size-11 place-items-center rounded-md bg-burgundy-700 text-white shadow-soft transition hover:bg-burgundy-900 sm:hidden"
              aria-label="Identify a new bottle"
              title="Identify a new bottle"
            >
              <Plus className="size-5" aria-hidden />
            </a>
            <details className="group relative">
              <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-md bg-cellar-ink text-cellar-cream shadow-soft transition hover:bg-burgundy-900 [&::-webkit-details-marker]:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden />
              </summary>
              <nav className="absolute right-0 z-20 mt-3 w-72 rounded-lg border border-white/70 bg-cellar-parchment p-2 shadow-cellar">
                {[
                  ["Home", "home", Wine],
                  ["Add Bottle", "add-bottle", Camera],
                  ["My Bottles", "my-collection", Grape],
                  ["Full Collection Overview", "collection-overview", Wine],
                  ["Overall Collection", "dashboard", LayoutDashboard],
                  ["Regional Map", "regional-map", MapIcon],
                  ["AI Sommelier", "sommelier", MessageCircle],
                  ["Profile & Settings", "settings", Settings]
                ].map(([label, view, Icon]) => {
                  const NavIcon = Icon as typeof Wine;
                  const viewId = view as ViewId;
                  return (
                    <a
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-cellar-ink transition hover:bg-white ${activeView === viewId ? "bg-white" : ""}`}
                      href={viewId === "home" ? "#" : `#${viewId}`}
                      key={label as string}
                      onClick={(event) => {
                        event.preventDefault();
                        navigateToView(viewId);
                        (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
                      }}
                    >
                      <NavIcon className="size-4 text-burgundy-700" aria-hidden />
                      {label as string}
                    </a>
                  );
                })}
              </nav>
            </details>
          </div>
        </header>
      </div>
      <section className={`relative isolate min-h-screen px-4 pb-8 pt-4 sm:px-6 lg:px-8 ${activeView === "home" ? "" : "hidden"}`}>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(199,162,90,0.12),transparent_30%),linear-gradient(180deg,#fbf7ed_0%,#f6efe1_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(59,12,27,0.12),transparent)]" />

        <div className="mx-auto grid max-w-7xl gap-6 pt-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="grid content-start gap-6">
          <section className="relative overflow-hidden rounded-lg bg-cellar-night p-5 text-cellar-cream shadow-cellar sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(199,162,90,0.24),transparent_24%),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:auto,44px_44px,44px_44px]" />
            <div className="absolute inset-x-8 bottom-0 top-24 rounded-t-full border border-cellar-gold/18 bg-[linear-gradient(90deg,rgba(75,48,41,.42),rgba(23,18,17,.16),rgba(75,48,41,.42))]" />
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.48))]" />
            <div className="absolute inset-y-28 left-8 hidden w-28 flex-col justify-between opacity-70 lg:flex">
              {[0, 1, 2, 3].map((row) => <CellarShelf key={row} />)}
            </div>
            <div className="absolute inset-y-28 right-8 hidden w-28 flex-col justify-between opacity-70 lg:flex">
              {[0, 1, 2, 3].map((row) => <CellarShelf key={row} />)}
            </div>
            <div className="relative grid gap-8 lg:grid-cols-[1fr_260px]">
              <div className="flex min-h-[560px] flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-cellar-gold/35 bg-cellar-gold/10 text-cellar-gold">
                      <Wine className="size-4" aria-hidden />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-cellar-cream/72">
                      Entering {cellarName}
                    </span>
                  </div>
                  <h1 className="max-w-2xl font-serif text-4xl leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                    {firstName ? (
                      <>
                        Welcome back,
                        <span className="mt-1 block sm:ml-3 sm:mt-0 sm:inline">{firstName}.</span>
                      </>
                    ) : "Welcome."}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-cellar-cream/76 sm:text-lg">
                    Browse the bottles resting in each rack, see what is ready to open, and ask the sommelier which
                    vintage deserves the table tonight.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {cellarStats.map(([value, label]) => (
                    <div className="rounded-md border border-white/10 bg-white/8 p-4 backdrop-blur" key={label}>
                      <p className="font-serif text-3xl text-white">{value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cellar-cream/55">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden items-end justify-center lg:flex">
                <BottleArt />
              </div>
            </div>
          </section>
          </div>

          <aside className="grid gap-6">
            <section className="rounded-lg border border-white/70 bg-cellar-parchment/82 p-5 shadow-soft backdrop-blur" id="cellar">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Today&apos;s recommendation</p>
                  <h2 className="mt-2 font-serif text-3xl">
                    {recommendedBottle ? `Open the ${recommendedBottle.vintage} ${recommendedBottle.wine}` : "No bottles to recommend yet"}
                  </h2>
                </div>
                <button
                  className="grid size-10 place-items-center rounded-md bg-cellar-ink text-white"
                  aria-label="Open recommendation"
                  disabled={!recommendedBottle}
                  onClick={() => recommendedBottle && showDialog(
                    `${recommendedBottle.vintage} ${recommendedBottle.wine}`,
                    `${recommendedBottle.note} Serve ${recommendedBottle.service}. Drinking window ${recommendedBottle.drinkingWindow}.`
                  )}
                >
                  <ArrowUpRight className="size-5" aria-hidden />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <label className="flex items-center gap-2 rounded-md bg-white/72 px-3 py-2 text-sm font-medium text-cellar-ink">
                  <MapPin className="size-4 shrink-0 text-burgundy-700" aria-hidden />
                  <span className="sr-only">Type a city or postcode</span>
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void searchLocation();
                    }}
                    placeholder="City or postcode"
                  />
                </label>
                <button
                  className="rounded-md bg-burgundy-700 px-4 text-sm font-medium text-white"
                  onClick={() => void searchLocation()}
                >
                  Use
                </button>
              </div>
              <button
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cellar-oak/20 bg-white/72 px-3 py-3 text-sm font-medium text-burgundy-700"
                onClick={useDeviceLocation}
              >
                <LocateFixed className="size-4" aria-hidden />
                Use my location
              </button>
              {locationStatus && <p className="mt-2 text-xs font-medium text-cellar-walnut" role="status">{locationStatus}</p>}
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-burgundy-50 px-3 py-2 text-sm font-medium text-burgundy-900">
                <CloudSun className="size-4" aria-hidden />
                {tonight.weather}
              </div>
              <p className="mt-4 leading-7 text-cellar-walnut">
                {recommendedBottle
                  ? `From your collection, this is the best match for ${tonight.weather}. ${recommendedBottle.note}`
                  : "Add a bottle to receive a recommendation from your own collection."}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                {recommendationService.map((item) => (
                  <div className="rounded-md bg-white/72 px-2 py-3 font-medium" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-burgundy-900 p-5 text-white shadow-cellar">
              <div className="flex items-center gap-3">
                <MessageCircle className="size-5 text-cellar-gold" aria-hidden />
                <h2 className="font-serif text-2xl">AI Sommelier</h2>
              </div>
              <div className="mt-4 flex min-h-56 max-h-80 flex-col gap-2 overflow-y-auto rounded-md bg-black/15 p-3" aria-live="polite">
                {sommelierMessages.map((message, index) => (
                  <div
                    className={`max-w-[88%] rounded-md px-3 py-2 text-sm leading-6 ${message.role === "user" ? "self-end bg-white text-burgundy-900" : "self-start bg-white/10 text-cellar-cream"}`}
                    key={`${message.role}-${index}`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <form
                className="mt-3 grid grid-cols-[1fr_auto] gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendSommelierMessage();
                }}
              >
                <input
                  className="min-w-0 rounded-md border-0 bg-white px-3 py-3 text-sm text-cellar-ink outline-none"
                  value={sommelierInput}
                  onChange={(event) => setSommelierInput(event.target.value)}
                  placeholder="Ask the sommelier"
                  aria-label="Message the AI Sommelier"
                />
                <button className="grid size-11 place-items-center rounded-md bg-cellar-gold text-cellar-ink" aria-label="Send message" type="submit">
                  <Send className="size-4" aria-hidden />
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Pair with a meal", "What should I open tonight?", "Which wines should I keep aging?"].map((prompt) => (
                  <button className="rounded-full border border-white/20 px-3 py-2 text-xs text-cellar-cream" key={prompt} onClick={() => sendSommelierMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      <section className={`min-h-screen bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8 ${activeView === "collection-overview" ? "" : "hidden"}`} id="collection-overview">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Full collection overview</p>
              <h2 className="mt-2 font-serif text-4xl">Your cellar at a glance</h2>
            </div>
            <a href="#my-collection" onClick={(event) => { event.preventDefault(); navigateToView("my-collection"); }} className="inline-flex w-fit items-center gap-2 rounded-md bg-cellar-ink px-4 py-2 text-sm font-medium text-cellar-cream">
              Browse cellar <ChevronRight className="size-4" aria-hidden />
            </a>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg bg-white/70 p-5 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  [String(collectionTotal), "Total bottles"],
                  [String(typeCount("Red")), "Red"],
                  [String(typeCount("White")), "White"],
                  [String(typeCount("Sparkling")), "Sparkling"]
                ].map(([value, label]) => (
                  <div className="rounded-md bg-cellar-parchment p-4" key={label}>
                    <p className="font-serif text-3xl">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cellar-walnut">{label}</p>
                  </div>
                ))}
              </div>
              <article className="mt-5 rounded-md border border-cellar-oak/18 bg-white/72 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-serif text-3xl">{cellarName}</h3>
                    <p className="mt-2 text-sm leading-6 text-cellar-walnut">
                      One private cellar for every bottle, vintage, tasting note, and storage detail.
                    </p>
                  </div>
                  <a href="#settings" onClick={(event) => { event.preventDefault(); navigateToView("settings"); }} className="inline-flex w-fit items-center gap-2 rounded-md border border-cellar-oak/20 px-3 py-2 text-sm font-medium text-burgundy-700">
                    Rename cellar <Settings className="size-4" aria-hidden />
                  </a>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-cellar-parchment p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Ready now</p>
                    <p className="mt-2 font-serif text-3xl">{readyCount}</p>
                  </div>
                  <div className="rounded-md bg-cellar-parchment p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Regions</p>
                    <p className="mt-2 font-serif text-3xl">{new Set(collectionBottles.map((bottle) => bottle.region)).size}</p>
                  </div>
                  <div className="rounded-md bg-cellar-parchment p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Most represented</p>
                    <p className="mt-2 font-medium">{collectionTotal ? collectionBottles[0].region : "None yet"}</p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </div>
      </section>

      <section className={`min-h-screen bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8 ${activeView === "add-bottle" || activeView === "dashboard" ? "" : "hidden"}`}>
        <div className="mx-auto max-w-7xl">
          {activeView === "add-bottle" && (
          <Panel title="Bottle Recognition" eyebrow="Add Bottle" icon={<ScanLine className="size-5" />} id="add-bottle">
            <div className="-mt-16 mb-5 flex justify-end">
              <button
                className="grid size-9 place-items-center rounded-md bg-cellar-cream text-burgundy-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Refresh wine identification"
                title="Refresh identification"
                disabled={!bottleImagePreview || isRecognizing}
                onClick={refreshIdentification}
              >
                <RefreshCw className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-2 rounded-md bg-cellar-cream p-1" aria-label="Bottle scan purpose">
              <button
                className={`rounded-md px-3 py-3 text-sm font-medium transition ${bottleIntent === "collection" ? "bg-burgundy-700 text-white shadow-soft" : "text-cellar-walnut"}`}
                aria-pressed={bottleIntent === "collection"}
                onClick={() => setBottleIntent("collection")}
              >
                Add to my collection
              </button>
              <button
                className={`rounded-md px-3 py-3 text-sm font-medium transition ${bottleIntent === "checking" ? "bg-cellar-ink text-white shadow-soft" : "text-cellar-walnut"}`}
                aria-pressed={bottleIntent === "checking"}
                onClick={() => setBottleIntent("checking")}
              >
                Just checking
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(240px,0.9fr)_1fr]">
              <div
                className="rounded-lg border border-dashed border-burgundy-300 bg-white/65 p-4 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleBottleImage(event.dataTransfer.files[0]);
                }}
              >
                <div className="flex min-h-64 flex-col items-center justify-center rounded-md bg-cellar-parchment/80 p-4">
                  {bottleImagePreview ? (
                    <img className="max-h-56 w-full rounded-md object-cover shadow-soft" src={bottleImagePreview} alt="Selected bottle" />
                  ) : (
                    <>
                      <div className="grid size-24 place-items-center rounded-full bg-burgundy-50 text-burgundy-700">
                        <ImageIcon className="size-9" aria-hidden />
                      </div>
                      <p className="mt-4 font-medium">Drop a bottle or label photo</p>
                      <p className="mt-1 text-sm text-cellar-walnut">Front label, back label, or full bottle</p>
                    </>
                  )}
                </div>

                <p className="mt-3 truncate text-sm font-medium text-cellar-ink">{bottleImageName}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-burgundy-700 px-3 py-3 text-sm font-medium text-white">
                    <Upload className="size-4" aria-hidden />
                    Upload
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        handleBottleImage(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-cellar-ink px-3 py-3 text-sm font-medium text-white">
                    <Camera className="size-4" aria-hidden />
                    Camera
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => {
                        handleBottleImage(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-md bg-burgundy-50 px-4 py-3 text-sm font-medium text-burgundy-900">
                  {recognitionStatus}
                </div>
                {researchedBottle.tastingNotes?.length ? (
                  <div className="rounded-md bg-white/78 px-4 py-3">
                    <p className="text-sm text-cellar-walnut">Tasting notes</p>
                    <ul className="mt-2 grid list-disc grid-cols-2 gap-x-6 gap-y-1 pl-5 text-sm font-medium">
                      {researchedBottle.tastingNotes.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  </div>
                ) : null}
                {(researchIndex < 0 && !recognizedBottle ? [["Identification", "Awaiting photo"]] : [
                  ["Producer", researchedBottle.producer],
                  ["Wine", researchedBottle.wine],
                  ["Vintage", researchedBottle.vintage],
                  ["Region", researchedBottle.region],
                  ["Appellation", researchedBottle.appellation],
                  ["Grapes", researchedBottle.grapes],
                  ["Style", researchedBottle.style ?? researchedBottle.classification],
                  ["Classification", researchedBottle.classification],
                  ["Bottle price range", displayPriceRange(researchedBottle.priceRange, currency, exchangeRates)],
                  ["Drinking window", researchedBottle.drinkingWindow],
                  ["Serving", researchedBottle.service],
                  ["Producer notes", researchedBottle.producerHistory ?? "Available when AI recognition is connected"],
                  ["Vintage notes", researchedBottle.vintageSummary ?? "Available when AI recognition is connected"],
                  ["Pairing", researchedBottle.foodPairing ?? "Available when AI recognition is connected"],
                  ["Other likely matches", researchedBottle.alternatives?.join(" / ") ?? "None shown"]
                ]).map(([label, value]) => (
                  <div className="flex items-center justify-between rounded-md bg-white/78 px-4 py-3" key={label}>
                    <span className="text-sm text-cellar-walnut">{label}</span>
                    <span className="text-right font-medium">{value}</span>
                  </div>
                ))}
                <button
                  className="w-full rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={isRecognizing || (researchIndex < 0 && !recognizedBottle)}
                  onClick={() => {
                    if (bottleIntent === "collection") saveResearchedBottle();
                    if (bottleIntent === "checking") rememberCheckedBottle(researchedBottle);
                    showDialog(
                      bottleIntent === "collection" ? "Bottle added to your collection" : "Bottle saved to scan history",
                      bottleIntent === "collection"
                        ? "The researched wine, tasting notes, drinking window, grapes, classification, and service guidance have been saved to My Bottles."
                        : `${researchedBottle.note} This bottle is in your Just checking history, but was not added to your collection.`
                    );
                  }}
                >
                  {isRecognizing ? "Researching bottle..." : bottleIntent === "collection" ? "Identify and add bottle" : "Check bottle"}
                </button>
                {checkedBottles.length ? (
                  <div className="rounded-lg border border-cellar-oak/15 bg-white/72 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Just checking</p>
                        <h3 className="font-serif text-2xl">Scan history</h3>
                      </div>
                      <span className="rounded-full bg-cellar-cream px-3 py-1 text-xs font-medium text-cellar-walnut">{checkedBottles.length} checked</span>
                    </div>
                    <div className="grid gap-2">
                      {checkedBottles.map((bottle) => (
                        <div className="flex items-center justify-between gap-3 rounded-md bg-cellar-parchment px-3 py-3" key={`${bottle.producer}-${bottle.wine}-${bottle.vintage}`}>
                          <button className="min-w-0 flex-1 text-left" onClick={() => void openBottleDetails(bottle)}>
                            <p className="truncate text-sm font-semibold">{bottle.vintage} {bottle.producer}</p>
                            <p className="truncate text-xs text-cellar-walnut">{bottle.wine} / {regionLabel(bottle.region)}</p>
                            <p className="mt-1 text-[11px] font-medium text-burgundy-700">Per-bottle range: {displayPriceRange(bottle.priceRange, currency, exchangeRates)}</p>
                            {bottle.scannedAt ? <p className="mt-1 text-[11px] text-cellar-walnut">Checked {new Date(bottle.scannedAt).toLocaleString()}</p> : null}
                          </button>
                          <button
                            className="shrink-0 rounded-md bg-burgundy-700 px-3 py-2 text-xs font-medium text-white"
                            onClick={() => {
                              addBottleToCollection(bottle);
                              showDialog("Bottle added to your collection", `${bottle.vintage} ${bottle.producer} ${bottle.wine} has been added to My Bottles.`);
                            }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>
          )}

          {activeView === "dashboard" && (
          <Panel title="Collection Dashboard" eyebrow="Live cellar" icon={<BarChart3 className="size-5" />} id="dashboard">
            <div className="grid gap-3 sm:grid-cols-3">
              {[`${collectionTotal} bottles`, `Ready now ${readyCount}`, `${new Set(collectionBottles.map((bottle) => bottle.region)).size} regions`].map((item) => (
                <div className="rounded-md bg-white/75 p-4 font-medium" key={item}>{item}</div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {windows.map(([label, width, color]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{width}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-cellar-cream">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          )}
        </div>
      </section>

      <section className={`min-h-screen px-4 py-12 sm:px-6 lg:px-8 ${activeView === "my-collection" ? "" : "hidden"}`} id="my-collection">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">My bottles / {collectionTotal} total</p>
              <h2 className="mt-2 font-serif text-4xl">Your complete collection</h2>
              <p className="mt-2 text-cellar-walnut">Detailed cards for every vintage, bottle, and storage location.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.2fr)_140px_130px_150px_150px_140px_140px]">
              <label className="flex items-center gap-2 rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2">
                <Search className="size-4 text-burgundy-700" aria-hidden />
                <span className="sr-only">Search collection</span>
                <input className="min-w-0 bg-transparent text-sm outline-none" placeholder="Search bottles" value={collectionSearch} onChange={(event) => setCollectionSearch(event.target.value)} />
              </label>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionRegion} onChange={(event) => setCollectionRegion(event.target.value)}>
                <option>All regions</option>
                {mapRegions.map(({ region }) => <option key={region}>{region}</option>)}
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionType} onChange={(event) => setCollectionType(event.target.value)}>
                <option>All types</option>
                {["Red", "White", "Rosé", "Sparkling", "Orange", "Other"].map((type) => <option key={type}>{type}</option>)}
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionGrape} onChange={(event) => setCollectionGrape(event.target.value)}>
                <option>All grapes</option>
                {grapeOptions.map((grape) => <option key={grape}>{grape}</option>)}
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionWindow} onChange={(event) => setCollectionWindow(event.target.value)}>
                <option>All windows</option>
                {windowOptions.map((window) => <option key={window}>{window}</option>)}
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionResearch} onChange={(event) => setCollectionResearch(event.target.value)}>
                <option>All research</option>
                <option>Researched</option>
                <option>Needs research</option>
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionSort} onChange={(event) => setCollectionSort(event.target.value)}>
                <option value="producer">Producer A-Z</option>
                <option value="score">Highest score</option>
                <option value="vintage">Newest vintage</option>
              </select>
            </div>
          </div>

          <p className="mb-4 text-sm font-medium text-cellar-walnut">{visibleBottles.length} collection cards shown</p>
          <div className="space-y-10">
            {groupedVisibleBottles.map(({ type, bottles }) => (
              <section className="rounded-lg border border-cellar-oak/15 bg-white/46 p-4 shadow-soft" key={type}>
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-cellar-oak/15 pb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">{type} wines</p>
                    <h3 className="mt-1 font-serif text-3xl">{type} shelf</h3>
                  </div>
                  <span className="rounded-full bg-cellar-parchment px-3 py-1 text-xs font-semibold text-cellar-walnut">{bottles.length} cards</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {bottles.map((bottle) => (
                    <article className="group overflow-hidden rounded-lg border border-cellar-oak/15 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-cellar" key={`${bottle.producer}${bottle.vintage}`}>
                      <div className="relative grid min-h-72 grid-cols-[128px_1fr] gap-4 overflow-hidden bg-[linear-gradient(135deg,#fbf7ed,#efe2c9)] p-5">
                        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_25%_10%,rgba(199,162,90,.28),transparent_24%)]" />
                        <DigitalBottle bottle={bottle} />
                        <div className="relative min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-xs uppercase tracking-[0.16em] text-burgundy-700">{regionLabel(bottle.region)}</p>
                              <h3 className="mt-2 font-serif text-2xl leading-7">{bottle.wine}</h3>
                            </div>
                            <button
                              className={`grid size-9 shrink-0 place-items-center rounded-md border border-cellar-oak/20 ${favoriteBottles.includes(bottle.producer) ? "bg-burgundy-700 text-white" : "bg-white/70 text-burgundy-700"}`}
                              aria-label={`Favorite ${bottle.producer}`}
                              aria-pressed={favoriteBottles.includes(bottle.producer)}
                              onClick={() => setFavoriteBottles((current) => current.includes(bottle.producer) ? current.filter((item) => item !== bottle.producer) : [...current, bottle.producer])}
                            >
                              <Heart className="size-4" fill={favoriteBottles.includes(bottle.producer) ? "currentColor" : "none"} aria-hidden />
                            </button>
                          </div>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-cellar-walnut">{bottle.producer}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-burgundy-50 px-3 py-1 text-xs font-semibold text-burgundy-900">{wineTypeForBottle(bottle)}</span>
                            <span className="rounded-full bg-cellar-parchment px-3 py-1 text-xs font-semibold text-cellar-walnut">{bottle.window}</span>
                            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-cellar-walnut">{bottle.quantity}</span>
                          </div>
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-cellar-walnut">{bottle.appellation} / {bottle.grapes}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(bottle.tastingNotes?.length ? bottle.tastingNotes.slice(0, 5) : [bottle.style ?? bottle.classification]).map((note) => (
                              <span className="rounded-full border border-cellar-oak/15 bg-white/70 px-2.5 py-1 text-xs font-medium text-cellar-ink" key={note}>{note}</span>
                            ))}
                          </div>
                          <div className="mt-5 rounded-md bg-white/70 p-3">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-cellar-walnut">Per-bottle price range</p>
                            <p className="mt-1 font-medium">{displayPriceRange(bottle.priceRange, currency, exchangeRates)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-cellar-oak/15 p-4">
                        <p className="text-xs leading-5 text-cellar-walnut">Stored in {bottle.cellar}<br />Drink {bottle.drinkingWindow}</p>
                        <div className="flex shrink-0 gap-2">
                          <button
                            className="rounded-md bg-cellar-ink px-4 py-2 text-sm font-medium text-white"
                            onClick={() => void openBottleDetails(bottle)}
                          >
                            Full details
                          </button>
                          <button
                            className="grid size-10 place-items-center rounded-md border border-burgundy-700/25 text-burgundy-700 transition hover:bg-burgundy-700 hover:text-white"
                            aria-label={`Delete ${bottle.vintage} ${bottle.producer}`}
                            onClick={() => showDialog(
                              `Remove ${bottle.vintage} ${bottle.producer}?`,
                              `This will remove ${bottle.quantity} of ${bottle.wine} from your collection. This action cannot be undone.`,
                              "Delete bottles",
                              () => deleteBottle(`${bottle.producer}-${bottle.vintage}`)
                            )}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          {visibleBottles.length === 0 && (
            <div className="rounded-lg border border-dashed border-cellar-oak/30 bg-white/50 p-10 text-center text-cellar-walnut">
              {collectionBottles.length ? "No bottles match those filters." : "Your cellar is empty. Add a bottle photo to begin your collection."}
            </div>
          )}
        </div>
      </section>

      <section className={`min-h-screen bg-cellar-night px-4 py-10 text-cellar-cream sm:px-6 lg:px-8 ${activeView === "regional-map" ? "" : "hidden"}`}>
        <div className="mx-auto max-w-7xl">
          <Panel dark title="Regional Map" eyebrow="Collection geography" icon={<MapIcon className="size-5" />} id="regional-map">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[380px] overflow-hidden rounded-lg border border-cellar-gold/20 bg-[#172222] p-4">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:52px_52px]" />
                <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 1000 520" aria-hidden>
                  <path fill="#52674f" d="M92 160 150 114l86 8 55 47-16 63 34 47-60 44-88-24-72-61z" />
                  <path fill="#52674f" d="m246 322 64 16 36 54-31 72-50-20-31-70z" />
                  <path fill="#5d7358" d="m438 137 82-26 95 26 64-5 54 44-28 45-100-2-48 36-90-20-56-41z" />
                  <path fill="#5d7358" d="m526 245 84 15 46 73-20 102-56 4-36-68-58-39z" />
                  <path fill="#536a56" d="m684 151 96-31 96 40 40 78-73 40-104-28-71 18-42-52z" />
                  <path fill="#536a56" d="m786 344 88 16 49 53-35 43-104-16-31-55z" />
                </svg>
                {mapRegions.length ? mapRegions.map(({ region, bottles, position }) => {
                  const regionCount = bottles.reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
                  return (
                  <button
                    className={`absolute min-w-24 -translate-x-1/2 -translate-y-1/2 rounded-md border px-3 py-2 text-left text-xs font-medium shadow-soft transition ${activeMapRegion === region ? "border-cellar-gold bg-white text-burgundy-900 ring-2 ring-cellar-gold" : "border-white/20 bg-cellar-gold text-cellar-ink hover:bg-white"}`}
                    key={region}
                    style={{ left: `${position.left}%`, top: `${position.top}%` }}
                    onClick={() => setSelectedMapRegion(region)}
                    aria-pressed={activeMapRegion === region}
                  >
                    <span className="flex items-center gap-1"><MapPin className="size-3" aria-hidden /> {region}</span>
                    <span className="mt-1 block text-[11px] opacity-75">{regionCount} bottles</span>
                  </button>
                  );
                }) : (
                  <div className="absolute inset-0 grid place-items-center px-8 text-center text-sm text-cellar-cream/70">
                    Add a bottle and Cellar will place its origin on the world map.
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="rounded-md border border-cellar-gold/25 bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-cellar-gold">Selected region</p>
                  <h3 className="mt-2 font-serif text-3xl text-white">{activeMapRegion || "No regions yet"}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-cellar-cream/55">Bottles</p><p className="mt-1 font-medium text-white">{selectedRegionTotal}</p></div>
                    <div><p className="text-cellar-cream/55">Ready now</p><p className="mt-1 font-medium text-white">{selectedRegionReady}</p></div>
                    <div><p className="text-cellar-cream/55">Average score</p><p className="mt-1 font-medium text-white">{selectedRegionScore}</p></div>
                    <div><p className="text-cellar-cream/55">Collection value</p><p className="mt-1 font-medium text-white">{selectedRegionBottles.length ? "Researching" : "-"}</p></div>
                  </div>
                  <p className="mt-4 text-sm text-cellar-cream/65">Top bottle: {selectedRegionTopBottle ? `${selectedRegionTopBottle.vintage} ${selectedRegionTopBottle.producer}` : "None yet"}</p>
                  <p className="mt-2 text-sm text-cellar-cream/65">Ready now: {selectedRegionReadyBottles.length ? selectedRegionReadyBottles.map((bottle) => `${bottle.vintage} ${bottle.producer}`).join(", ") : "No bottles ready in this region yet"}</p>
                </div>
                {mapRegions.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {mapRegions.map(({ region }) => (
                    <button
                      className={`rounded-md p-3 text-left text-sm transition ${activeMapRegion === region ? "bg-cellar-gold text-cellar-ink" : "bg-white/8 text-white hover:bg-white/14"}`}
                      key={region}
                      onClick={() => setSelectedMapRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-cellar-gold px-3 py-3 text-sm font-medium text-cellar-ink"
                    disabled={!activeMapRegion}
                    onClick={() => {
                      setCollectionRegion(activeMapRegion);
                      navigateToView("my-collection");
                    }}
                  >
                    <Search className="size-4" aria-hidden />
                    View bottles
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-3 text-sm font-medium text-white hover:bg-white/15"
                    disabled={!activeMapRegion}
                    onClick={() => showDialog(
                      `${activeMapRegion || "Region"} summary`,
                      selectedRegionBottles.length
                        ? `${cellarName} has ${selectedRegionTotal} bottle${selectedRegionTotal === 1 ? "" : "s"} from ${activeMapRegion}. Average score is ${selectedRegionScore}. ${selectedRegionTopBottle ? `The strongest card is ${selectedRegionTopBottle.vintage} ${selectedRegionTopBottle.producer} ${selectedRegionTopBottle.wine}.` : ""}`
                        : `${cellarName} does not have bottles from ${activeMapRegion || "this region"} yet.`
                    )}
                  >
                    <Sparkles className="size-4" aria-hidden />
                    Region summary
                  </button>
                </div>
              </div>
            </div>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-cellar-gold/25 px-4 py-2 text-sm font-medium text-cellar-cream hover:bg-white/10"
              onClick={() => {
                setCollectionRegion("All regions");
                navigateToView("my-collection");
              }}
            >
              View all regions <ChevronRight className="size-4" aria-hidden />
            </button>
          </Panel>
        </div>
      </section>

      <section className={`min-h-screen bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8 ${activeView === "sommelier" ? "" : "hidden"}`} id="sommelier-page">
        <div className="mx-auto max-w-4xl">
          <section className="rounded-lg bg-burgundy-900 p-5 text-white shadow-cellar sm:p-7" id="sommelier">
            <div className="flex items-center gap-3">
              <MessageCircle className="size-5 text-cellar-gold" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cellar-gold">AI Sommelier</p>
                <h2 className="mt-2 font-serif text-4xl">Ask about your cellar</h2>
              </div>
            </div>
            <div className="mt-6 flex min-h-[420px] max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-md bg-black/15 p-3" aria-live="polite">
              {sommelierMessages.map((message, index) => (
                <div
                  className={`max-w-[88%] rounded-md px-3 py-2 text-sm leading-6 ${message.role === "user" ? "self-end bg-white text-burgundy-900" : "self-start bg-white/10 text-cellar-cream"}`}
                  key={`${message.role}-${index}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <form
              className="mt-3 grid grid-cols-[1fr_auto] gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendSommelierMessage();
              }}
            >
              <input
                className="min-w-0 rounded-md border-0 bg-white px-3 py-3 text-sm text-cellar-ink outline-none"
                value={sommelierInput}
                onChange={(event) => setSommelierInput(event.target.value)}
                placeholder="Ask the sommelier"
                aria-label="Message the AI Sommelier"
              />
              <button className="grid size-11 place-items-center rounded-md bg-cellar-gold text-cellar-ink" aria-label="Send message" type="submit">
                <Send className="size-4" aria-hidden />
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Pair with a meal", "What should I open tonight?", "Which wines should I keep aging?"].map((prompt) => (
                <button className="rounded-full border border-white/20 px-3 py-2 text-xs text-cellar-cream" key={prompt} onClick={() => sendSommelierMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className={`min-h-screen border-t border-cellar-oak/20 bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8 ${activeView === "settings" ? "" : "hidden"}`} id="settings">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Profile & Settings</p>
          <h2 className="mt-2 font-serif text-4xl">Your Cellar profile</h2>
          <section className="mt-6 max-w-4xl rounded-lg border border-cellar-oak/20 bg-white/70 p-5 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-burgundy-700 text-white">
                  <Users className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-serif text-2xl">Shared cellar account</p>
                  <p className="mt-1 text-sm leading-6 text-cellar-walnut">
                    Create one login for the people who share this cellar.
                  </p>
                </div>
              </div>
              {currentAccount && (
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-cellar-oak/25 px-4 py-2 text-sm font-medium text-burgundy-700"
                  onClick={() => void signOutAccount()}
                  type="button"
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              )}
            </div>
            {currentAccount ? (
              <div className="mt-5 grid gap-3 rounded-md bg-cellar-parchment p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Signed in</p>
                  <p className="mt-1 font-medium">{currentAccount.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Email</p>
                  <p className="mt-1 font-medium">{currentAccount.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">Shared bottles</p>
                  <p className="mt-1 font-medium">{collectionTotal}</p>
                </div>
              </div>
            ) : (
              <form
                className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (authMode === "create") void createAccount();
                  else void signInAccount();
                }}
              >
                {authMode === "create" && (
                  <input
                    className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    placeholder="Name"
                    autoComplete="name"
                    aria-label="Account name"
                  />
                )}
                <input
                  className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  type="email"
                  aria-label="Account email"
                />
                <input
                  className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
                  value={accountPassword}
                  onChange={(event) => setAccountPassword(event.target.value)}
                  placeholder="Password"
                  autoComplete={authMode === "create" ? "new-password" : "current-password"}
                  type="password"
                  aria-label="Account password"
                />
                <button className="rounded-md bg-cellar-ink px-5 py-3 text-sm font-medium text-white" type="submit">
                  {authMode === "create" ? "Create account" : "Sign in"}
                </button>
              </form>
            )}
            {!currentAccount && (
              <button
                className="mt-3 text-sm font-medium text-burgundy-700"
                onClick={() => {
                  setAuthMode((mode) => mode === "create" ? "signin" : "create");
                  setAccountStatus("");
                }}
                type="button"
              >
                {authMode === "create" ? "Already have an account? Sign in" : "Need an account? Create one"}
              </button>
            )}
            <p className="mt-3 min-h-5 text-sm text-cellar-walnut" role="status">
              {accountStatus || (currentAccount
                ? hasSupabaseConfig ? "Cloud sharing is active for this cellar." : "This browser is using the shared cellar account."
                : hasSupabaseConfig ? "Create or sign in to a Supabase account to share this cellar across devices." : "Accounts are saved locally until Supabase authentication is connected.")}
            </p>
          </section>
          <form
            className="mt-5 grid max-w-4xl gap-2 sm:grid-cols-[1fr_1fr_170px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile();
            }}
          >
            <input
              className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
              value={profileFirstName}
              onChange={(event) => setProfileFirstName(event.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              aria-label="First name"
            />
            <input
              className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
              value={profileCellarName}
              onChange={(event) => setProfileCellarName(event.target.value)}
              placeholder="Cellar name"
              aria-label="Cellar name"
            />
            <select
              className="rounded-md border border-cellar-oak/25 bg-white px-4 py-3 outline-none"
              value={profileCurrency}
              onChange={(event) => setProfileCurrency(event.target.value as CurrencyCode)}
              aria-label="Preferred currency"
            >
              {(Object.keys(currencyLabels) as CurrencyCode[]).map((code) => (
                <option value={code} key={code}>{currencyLabels[code]}</option>
              ))}
            </select>
            <button className="rounded-md bg-burgundy-700 px-5 py-3 text-sm font-medium text-white" type="submit">Save profile</button>
          </form>
          <p className="mt-2 min-h-5 text-sm text-cellar-walnut" role="status">{profileStatus || `${exchangeStatus} Showing prices in ${currencyLabels[currency]}.`}</p>
        </div>
      </section>

      {activeBottle && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-cellar-night/75 p-3 backdrop-blur-sm sm:p-6" role="presentation" onClick={() => setActiveBottle(null)}>
          <section
            className="mx-auto my-3 w-full max-w-5xl rounded-lg bg-cellar-parchment shadow-cellar sm:my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wine-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-cellar-oak/20 p-5 sm:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">{activeBottle.vintage} / {activeBottle.region}</p>
                  <span className="rounded-md bg-burgundy-50 px-2 py-1 text-xs font-medium text-burgundy-900">
                    {activeBottle.research?.wineColor || activeBottle.style || "Wine color not confirmed"}
                  </span>
                </div>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl" id="wine-detail-title">{activeBottle.producer}</h2>
                <p className="mt-1 text-lg text-cellar-walnut">{activeBottle.wine}</p>
              </div>
              <button className="grid size-10 shrink-0 place-items-center rounded-md bg-cellar-ink text-white" aria-label="Close wine details" onClick={() => setActiveBottle(null)}>
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="max-w-3xl leading-7 text-cellar-walnut">
                  {activeBottle.research?.summary ?? activeBottle.note}
                </p>
                <button
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-55"
                  disabled={isResearchingBottle}
                  onClick={() => void openBottleDetails(activeBottle)}
                >
                  <RefreshCw className={`size-4 ${isResearchingBottle ? "animate-spin" : ""}`} aria-hidden />
                  {isResearchingBottle ? "Researching" : "Refresh research"}
                </button>
              </div>

              {bottleResearchError && (
                <p className="mt-5 rounded-md bg-burgundy-50 px-4 py-3 text-sm font-medium text-burgundy-900" role="alert">
                  {bottleResearchError}
                </p>
              )}

              {isResearchingBottle && !activeBottle.research && (
                <div className="mt-6 border-t border-cellar-oak/20 py-10 text-center">
                  <RefreshCw className="mx-auto size-6 animate-spin text-burgundy-700" aria-hidden />
                  <p className="mt-3 font-medium">Searching current wine sources...</p>
                </div>
              )}

              {activeBottle.research ? (
                <>
                  <section className="mt-7 border-t border-cellar-oak/20 pt-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Tasting profile</p>
                    <ul className="mt-4 grid list-disc grid-cols-2 gap-x-8 gap-y-2 pl-5 text-sm font-medium sm:grid-cols-3 lg:grid-cols-4">
                      {activeBottle.research.tastingNotes.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Nose", activeBottle.research.nose],
                        ["Palate", activeBottle.research.palate],
                        ["Finish", activeBottle.research.finish],
                        ["Community", activeBottle.research.communityConsensus]
                      ].map(([label, value]) => (
                        <div key={label}>
                          <h3 className="font-serif text-xl">{label}</h3>
                          <p className="mt-2 text-sm leading-6 text-cellar-walnut">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-7 grid gap-7 border-t border-cellar-oak/20 pt-6 lg:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Ratings & reviews</p>
                      <p className="mt-3 font-medium">Community rating: {activeBottle.research.communityRating}</p>
                      <div className="mt-4 space-y-4">
                        {activeBottle.research.criticScores.length ? activeBottle.research.criticScores.map((score) => (
                          <div className="border-l-2 border-cellar-gold pl-4" key={`${score.source}-${score.score}`}>
                            <p className="font-medium">{score.source}: {score.score}</p>
                            <p className="mt-1 text-sm leading-6 text-cellar-walnut">{score.note}</p>
                          </div>
                        )) : <p className="text-sm text-cellar-walnut">No exact-vintage critic score was publicly available.</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Drink window</p>
                      <h3 className="mt-3 font-serif text-2xl">{activeBottle.research.drinkWindow.status}</h3>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div><p className="text-cellar-walnut">Open from</p><p className="mt-1 font-medium">{activeBottle.research.drinkWindow.start}</p></div>
                        <div><p className="text-cellar-walnut">Peak</p><p className="mt-1 font-medium">{activeBottle.research.drinkWindow.peak}</p></div>
                        <div><p className="text-cellar-walnut">Drink by</p><p className="mt-1 font-medium">{activeBottle.research.drinkWindow.end}</p></div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-cellar-walnut">{activeBottle.research.drinkWindow.reason}</p>
                      <div className="mt-5 rounded-md bg-white/55 p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-burgundy-700">Current per-bottle price range</p>
                        <p className="mt-2 font-serif text-2xl">{displayPriceRange(activeBottle.research.marketPriceRange, currency, exchangeRates)}</p>
                        <p className="mt-2 text-sm leading-6 text-cellar-walnut">{activeBottle.research.marketPriceNote}</p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-7 grid gap-7 border-t border-cellar-oak/20 pt-6 lg:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Community pairings</p>
                      <p className="mt-3 leading-7 text-cellar-walnut">
                        {activeBottle.research.communityPairings.length ? activeBottle.research.communityPairings.join(" / ") : "No public community pairings were found."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-burgundy-700">Sommelier pairings</p>
                      <p className="mt-3 leading-7 text-cellar-walnut">
                        {activeBottle.research.sommelierPairings.join(" / ") || "No additional pairings suggested."}
                      </p>
                    </div>
                  </section>

                  {activeBottle.research.researchedAt && (
                    <p className="mt-7 border-t border-cellar-oak/20 pt-4 text-xs text-cellar-walnut">
                      Updated {new Date(activeBottle.research.researchedAt).toLocaleString()}
                    </p>
                  )}
                </>
              ) : !isResearchingBottle && (
                <section className="mt-7 grid gap-5 border-t border-cellar-oak/20 pt-6 sm:grid-cols-2">
                  {[
                    ["Appellation", activeBottle.appellation],
                    ["Grapes", activeBottle.grapes],
                    ["Service", activeBottle.service],
                    ["Current window", activeBottle.drinkingWindow],
                    ["Bottle price range", displayPriceRange(activeBottle.priceRange, currency, exchangeRates)]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs uppercase tracking-[0.14em] text-cellar-walnut">{label}</p>
                      <p className="mt-2 font-medium">{value}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </section>
        </div>
      )}

      {activeDialog && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-cellar-night/70 p-4 backdrop-blur-sm" role="presentation" onClick={() => setActiveDialog(null)}>
          <section
            className="w-full max-w-lg rounded-lg bg-cellar-parchment p-6 shadow-cellar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Cellar</p>
                <h2 className="mt-2 font-serif text-3xl" id="dialog-title">{activeDialog.title}</h2>
              </div>
              <button className="grid size-10 shrink-0 place-items-center rounded-md bg-cellar-ink text-white" aria-label="Close" onClick={() => setActiveDialog(null)}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-5 leading-7 text-cellar-walnut">{activeDialog.body}</p>
            {activeDialog.onConfirm ? (
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button className="rounded-md border border-cellar-oak/25 px-4 py-3 text-sm font-medium" onClick={() => setActiveDialog(null)}>Cancel</button>
                <button
                  className="rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white"
                  onClick={() => {
                    activeDialog.onConfirm?.();
                    setActiveDialog(null);
                  }}
                >
                  {activeDialog.confirmLabel}
                </button>
              </div>
            ) : (
              <button className="mt-6 w-full rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white" onClick={() => setActiveDialog(null)}>Done</button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Panel({
  title,
  eyebrow,
  icon,
  id,
  dark = false,
  children
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  id?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`rounded-lg p-5 shadow-soft ${dark ? "bg-white/5 text-cellar-cream" : "bg-white/58"}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className={`grid size-10 place-items-center rounded-md ${dark ? "bg-cellar-gold text-cellar-ink" : "bg-burgundy-900 text-white"}`}>
          {icon}
        </div>
        <div>
          <p className={`text-xs uppercase tracking-[0.18em] ${dark ? "text-cellar-gold" : "text-burgundy-700"}`}>{eyebrow}</p>
          <h2 className="font-serif text-3xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function DigitalBottle({ bottle }: { bottle: CollectionBottle }) {
  const type = wineTypeForBottle(bottle);
  const glassClass = type === "White" || type === "Rosé" || type === "Sparkling"
    ? "from-[#e6d79d] via-[#6d7957] to-[#17231d]"
    : "from-[#271315] via-[#101010] to-[#050505]";
  const labelTint = type === "Red"
    ? "border-burgundy-900/20 bg-[#f7efe4]"
    : type === "White"
      ? "border-cellar-gold/35 bg-[#fffaf0]"
      : type === "Rosé"
        ? "border-rose-200 bg-[#fff1f3]"
        : "border-cellar-gold/40 bg-white";

  return (
    <div className="relative grid place-items-center">
      <div className="absolute bottom-0 h-5 w-28 rounded-full bg-black/20 blur-md transition duration-500 group-hover:scale-110" />
      <div className="relative h-72 w-28 origin-bottom transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-2deg]">
        <div className="absolute left-1/2 top-0 z-20 h-3 w-11 -translate-x-1/2 rounded-full bg-cellar-gold shadow-sm" />
        <div className={`absolute left-1/2 top-2 z-10 h-20 w-9 -translate-x-1/2 rounded-t-md bg-gradient-to-r ${glassClass} shadow-[inset_8px_0_12px_rgba(255,255,255,.16),inset_-10px_0_16px_rgba(0,0,0,.38)]`} />
        <div className="absolute left-1/2 top-7 z-20 h-10 w-10 -translate-x-1/2 rounded-sm border-y border-cellar-gold/35 bg-burgundy-700/80 shadow-sm" />
        <div className={`absolute left-1/2 top-[70px] h-16 w-24 -translate-x-1/2 rounded-t-[48px] bg-gradient-to-r ${glassClass} shadow-[inset_10px_0_14px_rgba(255,255,255,.12),inset_-12px_0_16px_rgba(0,0,0,.38)]`} />
        <div className={`absolute bottom-0 left-1/2 h-[190px] w-28 -translate-x-1/2 overflow-hidden rounded-t-[2.25rem] rounded-b-[1.1rem] bg-gradient-to-r ${glassClass} shadow-[inset_14px_0_20px_rgba(255,255,255,.12),inset_-18px_0_24px_rgba(0,0,0,.46),0_20px_30px_rgba(32,23,21,.24)]`}>
          <div className="absolute left-4 top-3 h-44 w-3 rounded-full bg-white/18 blur-sm transition duration-500 group-hover:translate-x-1" />
          <div className="absolute bottom-3 left-1/2 h-5 w-14 -translate-x-1/2 rounded-full border border-white/10 bg-black/22" />
          <div className={`absolute left-2 right-2 top-16 rounded-sm border px-2 py-3 text-center shadow-soft ${labelTint}`}>
            <p className="truncate text-[9px] uppercase tracking-[0.16em] text-burgundy-900">{bottle.producer}</p>
            <p className="mt-1 font-serif text-lg leading-none text-cellar-ink">{bottle.vintage}</p>
            <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-3 text-cellar-ink">{bottle.wine}</p>
            <p className="mt-2 truncate text-[8px] uppercase tracking-[0.12em] text-cellar-walnut">{bottle.appellation}</p>
            <p className="mt-1 text-[8px] font-semibold text-burgundy-700">{type}</p>
          </div>
          <div className="absolute left-3 right-3 top-[148px] h-px bg-cellar-gold/35" />
          <div className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/18 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
        </div>
      </div>
    </div>
  );
}

function CellarShelf() {
  return (
    <div className="rounded-md border border-cellar-gold/12 bg-cellar-walnut/38 p-2">
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((bottle) => (
          <span className="h-5 rounded-full bg-gradient-to-r from-black via-burgundy-900 to-black shadow-sm" key={bottle} />
        ))}
      </div>
    </div>
  );
}

function BottleArt() {
  return (
    <div className="relative h-[520px] w-[210px]">
      <div className="absolute left-1/2 top-0 h-28 w-16 -translate-x-1/2 rounded-t-full bg-gradient-to-r from-black via-burgundy-900 to-black" />
      <div className="absolute left-1/2 top-24 h-[390px] w-44 -translate-x-1/2 rounded-t-[72px] rounded-b-3xl bg-gradient-to-r from-[#070504] via-burgundy-900 to-[#080505] shadow-cellar" />
      <div className="absolute left-1/2 top-60 w-36 -translate-x-1/2 rounded-md bg-cellar-parchment p-4 text-center text-cellar-ink shadow-soft">
        <p className="text-xs uppercase tracking-[0.24em] text-burgundy-700">Grand Cru</p>
        <p className="mt-2 font-serif text-2xl">Cellar</p>
        <p className="mt-1 text-sm">AI Selected</p>
        <div className="mx-auto mt-4 h-px w-16 bg-cellar-gold" />
        <p className="mt-4 font-serif text-3xl">2018</p>
      </div>
      <div className="absolute bottom-0 left-1/2 h-5 w-36 -translate-x-1/2 rounded-full bg-black/35 blur-md" />
    </div>
  );
}
