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
  Map,
  MapPin,
  Menu,
  MessageCircle,
  ScanLine,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Wine,
  RefreshCw,
  X
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type WineResearch = {
  summary: string;
  wineColor: string;
  nose: string;
  palate: string;
  finish: string;
  tastingNotes: string[];
  communityRating: string;
  communityConsensus: string;
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
};

const researchedWines: CollectionBottle[] = [
  {
    producer: "Domaine Leflaive", wine: "Puligny-Montrachet 1er Cru Les Pucelles", vintage: "2020",
    region: "Burgundy, France", appellation: "Puligny-Montrachet Premier Cru", grapes: "100% Chardonnay",
    classification: "Premier Cru", cellar: "Location not set", score: "96", window: "Approaching peak",
    drinkingWindow: "2027-2042", quantity: "1 bottle", purchase: "Not added", market: "Researching",
    service: "12 C / no decant", note: "White flowers, Meyer lemon, citrus oil, hazelnut, and crushed chalk. Layered, satin-textured, and mineral.",
    accent: "from-[#a48b55] to-[#596659]"
  },
  {
    producer: "Ridge Vineyards", wine: "Monte Bello Cabernet Sauvignon", vintage: "2019",
    region: "Santa Cruz Mountains, USA", appellation: "Santa Cruz Mountains", grapes: "Cabernet Sauvignon blend",
    classification: "Estate wine", cellar: "Location not set", score: "96", window: "Needs aging",
    drinkingWindow: "2032-2065", quantity: "1 bottle", purchase: "Not added", market: "Researching",
    service: "17 C / 90 min decant", note: "Mountain cassis, mint, crushed stone, cedar, and savory herbs framed by fresh acidity and firm tannins.",
    accent: "from-cellar-moss to-cellar-slate"
  },
  {
    producer: "Giacomo Conterno", wine: "Barolo Monfortino Riserva", vintage: "2013",
    region: "Piedmont, Italy", appellation: "Barolo DOCG", grapes: "100% Nebbiolo",
    classification: "Riserva", cellar: "Location not set", score: "99", window: "Entering peak",
    drinkingWindow: "2026-2055", quantity: "1 bottle", purchase: "Not added", market: "Researching",
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

const regionalCollection = {
  Burgundy: {},
  Bordeaux: {},
  Champagne: {},
  Piedmont: {},
  "Santa Cruz": {}
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
  if (temperature >= 23) {
    return {
      label,
      weather: `${Math.round(temperature)} C / ${condition}`
    };
  }
  if (temperature <= 10 || weatherCode >= 51) {
    return {
      label,
      weather: `${Math.round(temperature)} C / ${condition}`
    };
  }
  return {
    label,
    weather: `${Math.round(temperature)} C / ${condition}`
  };
}

export default function Home() {
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
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionRegion, setCollectionRegion] = useState("All regions");
  const [collectionSort, setCollectionSort] = useState("producer");
  const [selectedMapRegion, setSelectedMapRegion] = useState<keyof typeof regionalCollection>("Burgundy");
  const [sommelierInput, setSommelierInput] = useState("");
  const [sommelierMessages, setSommelierMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    { role: "assistant", text: "Good evening. What are you cooking, or what would you like to open?" }
  ]);
  const [firstName, setFirstName] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [cellarName, setCellarName] = useState("My Cellar");
  const [profileCellarName, setProfileCellarName] = useState("My Cellar");
  const [profileStatus, setProfileStatus] = useState("");
  const [scannerTarget, setScannerTarget] = useState<HTMLElement | null>(null);
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
  const visibleBottles = collectionBottles
    .filter((bottle) => collectionRegion === "All regions" || bottle.region.includes(collectionRegion))
    .filter((bottle) => `${bottle.producer} ${bottle.wine} ${bottle.vintage} ${bottle.region} ${bottle.grapes}`.toLowerCase().includes(collectionSearch.toLowerCase()))
    .sort((a, b) => {
      if (collectionSort === "score") return Number(b.score) - Number(a.score);
      if (collectionSort === "vintage") return String(b.vintage).localeCompare(String(a.vintage));
      return a.producer.localeCompare(b.producer);
    });
  const readyCount = collectionBottles.filter((bottle) => /peak/i.test(bottle.window)).length;
  const cellarStats = [
    [String(collectionTotal), "Bottles"],
    [String(readyCount), "Ready now"],
    [String(Math.max(collectionTotal - readyCount, 0)), "Resting"],
    [String(new Set(collectionBottles.map((bottle) => bottle.region)).size), "Regions"]
  ];
  const selectedRegionBottles = collectionBottles.filter((bottle) => bottle.region.includes(selectedMapRegion));
  const selectedRegionTotal = selectedRegionBottles.reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
  const selectedRegionReady = selectedRegionBottles.filter((bottle) => /peak/i.test(bottle.window)).length;
  const selectedRegionScore = selectedRegionBottles.length
    ? (selectedRegionBottles.reduce((total, bottle) => total + Number(bottle.score), 0) / selectedRegionBottles.length).toFixed(1)
    : "-";
  const selectedRegionTopBottle = selectedRegionBottles
    .slice()
    .sort((a, b) => Number(b.score) - Number(a.score))[0];
  const selectedRegionReadyBottles = selectedRegionBottles.filter((bottle) => /peak/i.test(bottle.window));

  useEffect(() => {
    setScannerTarget(document.getElementById("hero-scanner-slot"));
    try {
      localStorage.removeItem("cellar-removed-bottles");
      localStorage.removeItem("cellar-collection-bottles");
      const saved = JSON.parse(localStorage.getItem("cellar-collection-bottles-v2") ?? "[]");
      if (Array.isArray(saved)) setCollectionBottles(saved);
      const savedFirstName = localStorage.getItem("cellar-profile-first-name") ?? "";
      if (savedFirstName) {
        setFirstName(savedFirstName);
        setProfileFirstName(savedFirstName);
      }
      const savedCellarName = localStorage.getItem("cellar-profile-cellar-name") ?? "";
      if (savedCellarName) {
        setCellarName(savedCellarName);
        setProfileCellarName(savedCellarName);
      }
    } catch {
      setCollectionBottles([]);
    }
  }, []);

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
    try {
      const image = await fileToDataUrl(file);
      const response = await fetch("/api/recognize-wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
        signal: controller.signal
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "AI recognition unavailable." })) as { error?: string };
        throw new Error(error.error ?? "AI recognition unavailable.");
      }
      const recognition = await response.json() as AiRecognition;
      setRecognizedBottle(toCollectionBottle(recognition));
      setRecognitionStatus(`ChatGPT Vision match: ${recognition.vintage} ${recognition.producer}`);
      return;
    } catch (error) {
      console.error("Cellar bottle recognition failed:", error);
      setResearchIndex(-1);
      setRecognitionStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "Recognition took too long. Try a closer label photo."
          : "We could not identify this bottle. Try another photo."
      );
    } finally {
      window.clearTimeout(timeout);
      setIsRecognizing(false);
    }
  }

  function refreshIdentification() {
    if (!bottleImagePreview) return;
    setRecognizedBottle(null);
    setResearchIndex(-1);
    setRecognitionStatus("Upload-only recognition refreshes automatically when you choose a new photo.");
    setIsRecognizing(false);
  }

  function saveProfile() {
    const nameValue = profileFirstName.trim();
    const cellarValue = profileCellarName.trim();
    if (!cellarValue) {
      setProfileStatus("Name your cellar.");
      return;
    }
    localStorage.setItem("cellar-profile-first-name", nameValue);
    localStorage.setItem("cellar-profile-cellar-name", cellarValue);
    setFirstName(nameValue);
    setCellarName(cellarValue);
    setProfileStatus("Profile saved.");
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
      localStorage.setItem("cellar-collection-bottles-v2", JSON.stringify(next));
    } catch {
      setCollectionBottles(next);
    }
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
    const key = `${researchedBottle.producer}-${researchedBottle.vintage}`;
    const existing = collectionBottles.findIndex((bottle) => `${bottle.producer}-${bottle.vintage}` === key);
    const next = [...collectionBottles];
    if (existing >= 0) {
      const quantity = Number.parseInt(next[existing].quantity, 10) + 1;
      next[existing] = { ...next[existing], quantity: `${quantity} bottles` };
    } else {
      next.push({ ...researchedBottle, cellar: cellarName });
    }
    persistCollection(next);
  }

  function deleteBottle(key: string) {
    const next = collectionBottles.filter((bottle) => `${bottle.producer}-${bottle.vintage}` !== key);
    setCollectionBottles(next);
    try {
      localStorage.setItem("cellar-collection-bottles-v2", JSON.stringify(next));
    } catch {
      setCollectionBottles(next);
    }
  }

  function getSommelierReply(question: string) {
    const query = question.toLowerCase();
    const white = collectionBottles.find((bottle) => /chardonnay|riesling|sauvignon|white/i.test(`${bottle.grapes} ${bottle.wine}`));
    const red = collectionBottles.find((bottle) => /pinot noir|cabernet|nebbiolo|syrah|merlot/i.test(`${bottle.grapes} ${bottle.wine}`));
    const bottle = collectionBottles[0];

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

  return (
    <main className="min-h-screen overflow-hidden bg-cellar-cream text-cellar-ink">
      <section className="relative isolate min-h-screen px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(199,162,90,0.12),transparent_30%),linear-gradient(180deg,#fbf7ed_0%,#f6efe1_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(180deg,rgba(59,12,27,0.12),transparent)]" />

        <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-white/60 bg-white/42 px-3 py-3 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-burgundy-900 text-cellar-cream shadow-soft">
              <Wine className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-serif text-xl leading-none tracking-normal">Cellar</p>
              <p className="text-xs uppercase tracking-[0.18em] text-cellar-walnut">Private cellar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#add-bottle" className="hidden items-center gap-2 rounded-md bg-burgundy-700 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-burgundy-900 sm:inline-flex">
              <Camera className="size-4" aria-hidden />
              Add Bottle
            </a>
            <details className="group relative">
              <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-md bg-cellar-ink text-cellar-cream shadow-soft transition hover:bg-burgundy-900 [&::-webkit-details-marker]:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden />
              </summary>
              <nav className="absolute right-0 z-20 mt-3 w-72 rounded-lg border border-white/70 bg-cellar-parchment p-2 shadow-cellar">
                {[
                  ["My Bottles", "#my-collection", Grape],
                  ["Full Collection Overview", "#collection-overview", Wine],
                  ["Overall Collection", "#dashboard", LayoutDashboard],
                  ["Regional Map", "#regional-map", Map],
                  ["AI Sommelier", "#sommelier", MessageCircle],
                  ["Profile & Settings", "#settings", Settings]
                ].map(([label, href, Icon]) => {
                  const NavIcon = Icon as typeof Wine;
                  return (
                    <a
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-cellar-ink transition hover:bg-white"
                      href={href as string}
                      key={label as string}
                      onClick={(event) => (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")}
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
                  <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-cellar-gold/40 bg-white/8 px-3 py-2 text-sm text-cellar-cream/85">
                    <Sparkles className="size-4 text-cellar-gold" aria-hidden />
                    Entering {cellarName}
                  </div>
                  <h1 className="max-w-2xl font-serif text-5xl leading-[0.95] tracking-normal text-white sm:text-7xl">
                    {firstName ? `Welcome back, ${firstName}.` : "Welcome."}
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
            <div id="hero-scanner-slot" />
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

            <section className="rounded-lg bg-burgundy-900 p-5 text-white shadow-cellar" id="sommelier">
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
                {["What pairs with duck?", "What should I open tonight?", "Which wines should I keep aging?"].map((prompt) => (
                  <button className="rounded-full border border-white/20 px-3 py-2 text-xs text-cellar-cream" key={prompt} onClick={() => sendSommelierMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      <section className="bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8" id="collection-overview">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Full collection overview</p>
              <h2 className="mt-2 font-serif text-4xl">Your cellar at a glance</h2>
            </div>
            <a href="#my-collection" className="inline-flex w-fit items-center gap-2 rounded-md bg-cellar-ink px-4 py-2 text-sm font-medium text-cellar-cream">
              Browse cellar <ChevronRight className="size-4" aria-hidden />
            </a>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg bg-white/70 p-5 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  [String(collectionTotal), "Total bottles"],
                  ["0", "Red"],
                  [String(collectionTotal), "White"],
                  ["0", "Sparkling"]
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
                  <a href="#settings" className="inline-flex w-fit items-center gap-2 rounded-md border border-cellar-oak/20 px-3 py-2 text-sm font-medium text-burgundy-700">
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

      <section className="bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {scannerTarget && createPortal(
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
                {(researchIndex < 0 && !recognizedBottle ? [["Identification", "Awaiting photo"]] : [
                  ["Producer", researchedBottle.producer],
                  ["Wine", researchedBottle.wine],
                  ["Vintage", researchedBottle.vintage],
                  ["Region", researchedBottle.region],
                  ["Appellation", researchedBottle.appellation],
                  ["Grapes", researchedBottle.grapes],
                  ["Style", researchedBottle.style ?? researchedBottle.classification],
                  ["Classification", researchedBottle.classification],
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
                {researchedBottle.tastingNotes?.length ? (
                  <div className="rounded-md bg-white/78 px-4 py-3">
                    <p className="text-sm text-cellar-walnut">Tasting notes</p>
                    <ul className="mt-2 grid list-disc grid-cols-2 gap-x-6 gap-y-1 pl-5 text-sm font-medium">
                      {researchedBottle.tastingNotes.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  </div>
                ) : null}
                <button
                  className="w-full rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={isRecognizing || (researchIndex < 0 && !recognizedBottle)}
                  onClick={() => {
                    if (bottleIntent === "collection") saveResearchedBottle();
                    showDialog(
                      bottleIntent === "collection" ? "Bottle added to your collection" : "Wine identified, not saved",
                      bottleIntent === "collection"
                        ? "The researched wine, tasting notes, drinking window, grapes, classification, and service guidance have been saved to My Bottles."
                        : `${researchedBottle.note} This research was not saved to your collection.`
                    );
                  }}
                >
                  {isRecognizing ? "Researching bottle..." : bottleIntent === "collection" ? "Identify and add bottle" : "Identify without saving"}
                </button>
              </div>
            </div>
          </Panel>,
          scannerTarget)}

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
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8" id="my-collection">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">My bottles / {collectionTotal} total</p>
              <h2 className="mt-2 font-serif text-4xl">Your complete collection</h2>
              <p className="mt-2 text-cellar-walnut">Detailed cards for every vintage, bottle, and storage location.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_150px]">
              <label className="flex items-center gap-2 rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2">
                <Search className="size-4 text-burgundy-700" aria-hidden />
                <span className="sr-only">Search collection</span>
                <input className="min-w-0 bg-transparent text-sm outline-none" placeholder="Search bottles" value={collectionSearch} onChange={(event) => setCollectionSearch(event.target.value)} />
              </label>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionRegion} onChange={(event) => setCollectionRegion(event.target.value)}>
                <option>All regions</option>
                <option>Burgundy</option>
                <option>Bordeaux</option>
                <option>Champagne</option>
                <option>Piedmont</option>
                <option>Santa Cruz</option>
              </select>
              <select className="rounded-md border border-cellar-oak/20 bg-white/75 px-3 py-2 text-sm" value={collectionSort} onChange={(event) => setCollectionSort(event.target.value)}>
                <option value="producer">Producer A-Z</option>
                <option value="score">Highest score</option>
                <option value="vintage">Newest vintage</option>
              </select>
            </div>
          </div>

          <p className="mb-4 text-sm font-medium text-cellar-walnut">{visibleBottles.length} collection cards shown</p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleBottles.map((bottle) => (
              <article className="overflow-hidden rounded-lg border border-cellar-oak/15 bg-white/82 shadow-soft" key={`${bottle.producer}${bottle.vintage}`}>
                <div className={`relative h-36 bg-gradient-to-br ${bottle.accent} p-4 text-white`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/65">{bottle.region}</p>
                      <p className="mt-2 font-serif text-4xl">{bottle.vintage}</p>
                    </div>
                    <button
                      className={`grid size-9 place-items-center rounded-md border border-white/25 ${favoriteBottles.includes(bottle.producer) ? "bg-white text-burgundy-700" : "bg-black/15 text-white"}`}
                      aria-label={`Favorite ${bottle.producer}`}
                      aria-pressed={favoriteBottles.includes(bottle.producer)}
                      onClick={() => setFavoriteBottles((current) => current.includes(bottle.producer) ? current.filter((item) => item !== bottle.producer) : [...current, bottle.producer])}
                    >
                      <Heart className="size-4" fill={favoriteBottles.includes(bottle.producer) ? "currentColor" : "none"} aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-burgundy-700">{bottle.producer}</p>
                  <h3 className="mt-2 font-serif text-2xl leading-7">{bottle.wine}</h3>
                  <p className="mt-2 text-sm text-cellar-walnut">{bottle.appellation} / {bottle.classification}</p>
                  {bottle.tastingNotes?.length ? (
                    <ul className="mt-4 grid list-disc grid-cols-2 gap-x-5 gap-y-1 pl-5 text-sm leading-6 text-cellar-walnut">
                      {bottle.tastingNotes.slice(0, 8).map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-cellar-walnut">{bottle.note}</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-cellar-oak/15 py-4 text-sm">
                    {[
                      ["Grapes", bottle.grapes],
                      ["Maturity", bottle.window],
                      ["Drink", bottle.drinkingWindow],
                      ["Quantity", bottle.quantity],
                      ["Storage", bottle.cellar],
                      ["Service", bottle.service]
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-cellar-walnut">{label}</p>
                        <p className="mt-1 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm"><span className="text-cellar-walnut">Purchased</span> {bottle.purchase} <span className="text-cellar-walnut">/ Current</span> {bottle.market}</p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        className="rounded-md bg-cellar-ink px-3 py-2 text-sm font-medium text-white"
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
                </div>
              </article>
            ))}
          </div>
          {visibleBottles.length === 0 && (
            <div className="rounded-lg border border-dashed border-cellar-oak/30 bg-white/50 p-10 text-center text-cellar-walnut">
              {collectionBottles.length ? "No bottles match those filters." : "Your cellar is empty. Add a bottle photo to begin your collection."}
            </div>
          )}
        </div>
      </section>

      <section className="bg-cellar-night px-4 py-10 text-cellar-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Panel dark title="Regional Map" eyebrow="Collection geography" icon={<Map className="size-5" />} id="regional-map">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-cellar-gold/20 bg-[radial-gradient(circle_at_22%_25%,rgba(199,162,90,0.30),transparent_16%),radial-gradient(circle_at_45%_42%,rgba(143,29,58,0.55),transparent_14%),radial-gradient(circle_at_74%_66%,rgba(91,112,85,0.45),transparent_16%),linear-gradient(135deg,#303b36,#111)] p-4">
                <div className="absolute inset-x-6 top-6 h-px bg-cellar-gold/20" />
                <div className="absolute bottom-6 left-8 right-8 h-px bg-cellar-gold/20" />
                <div className="absolute bottom-10 left-1/3 top-10 w-px bg-cellar-gold/20" />
                <div className="absolute bottom-12 right-1/4 top-14 w-px bg-cellar-gold/20" />
                {(Object.keys(regionalCollection) as Array<keyof typeof regionalCollection>).map((region, index) => {
                  const regionCount = collectionBottles
                    .filter((bottle) => bottle.region.includes(region))
                    .reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
                  return (
                  <button
                    className={`absolute min-w-24 rounded-md border px-3 py-2 text-left text-xs font-medium shadow-soft transition ${selectedMapRegion === region ? "border-cellar-gold bg-white text-burgundy-900 ring-2 ring-cellar-gold" : "border-white/20 bg-cellar-gold text-cellar-ink hover:bg-white"}`}
                    key={region}
                    style={{ left: `${12 + index * 15}%`, top: `${22 + (index % 3) * 20}%` }}
                    onClick={() => setSelectedMapRegion(region)}
                    aria-pressed={selectedMapRegion === region}
                  >
                    <span className="flex items-center gap-1"><MapPin className="size-3" aria-hidden /> {region}</span>
                    <span className="mt-1 block text-[11px] opacity-75">{regionCount} bottles</span>
                  </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="rounded-md border border-cellar-gold/25 bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-cellar-gold">Selected region</p>
                  <h3 className="mt-2 font-serif text-3xl text-white">{selectedMapRegion}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-cellar-cream/55">Bottles</p><p className="mt-1 font-medium text-white">{selectedRegionTotal}</p></div>
                    <div><p className="text-cellar-cream/55">Ready now</p><p className="mt-1 font-medium text-white">{selectedRegionReady}</p></div>
                    <div><p className="text-cellar-cream/55">Average score</p><p className="mt-1 font-medium text-white">{selectedRegionScore}</p></div>
                    <div><p className="text-cellar-cream/55">Collection value</p><p className="mt-1 font-medium text-white">{selectedRegionBottles.length ? "Researching" : "-"}</p></div>
                  </div>
                  <p className="mt-4 text-sm text-cellar-cream/65">Top bottle: {selectedRegionTopBottle ? `${selectedRegionTopBottle.vintage} ${selectedRegionTopBottle.producer}` : "None yet"}</p>
                  <p className="mt-2 text-sm text-cellar-cream/65">Ready now: {selectedRegionReadyBottles.length ? selectedRegionReadyBottles.map((bottle) => `${bottle.vintage} ${bottle.producer}`).join(", ") : "No bottles ready in this region yet"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(regionalCollection) as Array<keyof typeof regionalCollection>).map((region) => (
                    <button
                      className={`rounded-md p-3 text-left text-sm transition ${selectedMapRegion === region ? "bg-cellar-gold text-cellar-ink" : "bg-white/8 text-white hover:bg-white/14"}`}
                      key={region}
                      onClick={() => setSelectedMapRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-cellar-gold px-3 py-3 text-sm font-medium text-cellar-ink"
                    onClick={() => {
                      setCollectionRegion(selectedMapRegion);
                      document.getElementById("my-collection")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Search className="size-4" aria-hidden />
                    View bottles
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-3 text-sm font-medium text-white hover:bg-white/15"
                    onClick={() => showDialog(
                      `${selectedMapRegion} summary`,
                      selectedRegionBottles.length
                        ? `${cellarName} has ${selectedRegionTotal} bottle${selectedRegionTotal === 1 ? "" : "s"} from ${selectedMapRegion}. Average score is ${selectedRegionScore}. ${selectedRegionTopBottle ? `The strongest card is ${selectedRegionTopBottle.vintage} ${selectedRegionTopBottle.producer} ${selectedRegionTopBottle.wine}.` : ""}`
                        : `${cellarName} does not have bottles from ${selectedMapRegion} yet.`
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
                document.getElementById("my-collection")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View all regions <ChevronRight className="size-4" aria-hidden />
            </button>
          </Panel>
        </div>
      </section>

      <section className="border-t border-cellar-oak/20 bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8" id="settings">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Profile & Settings</p>
          <h2 className="mt-2 font-serif text-4xl">Your Cellar profile</h2>
          <form
            className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-[1fr_1fr_auto]"
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
            <button className="rounded-md bg-burgundy-700 px-5 py-3 text-sm font-medium text-white" type="submit">Save profile</button>
          </form>
          <p className="mt-2 min-h-5 text-sm text-cellar-walnut" role="status">{profileStatus}</p>
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
                    ["Current window", activeBottle.drinkingWindow]
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
