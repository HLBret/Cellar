"use client";

import {
  ArrowUpRight,
  BarChart3,
  Camera,
  CloudSun,
  ChevronRight,
  Clock3,
  Compass,
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
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Trash2,
  Upload,
  Utensils,
  Wine,
  X
} from "lucide-react";
import type React from "react";
import { useState } from "react";

const cellarStats = [
  ["742", "Bottles"],
  ["96", "Ready now"],
  ["214", "Resting"],
  ["14", "Regions"]
];

const bottles = [
  {
    producer: "Domaine Armand Rousseau",
    wine: "Gevrey-Chambertin Clos Saint-Jacques",
    vintage: "2018",
    region: "Burgundy, France",
    appellation: "Gevrey-Chambertin Premier Cru",
    grapes: "100% Pinot Noir",
    classification: "Premier Cru",
    cellar: "Rack A / Shelf 3",
    score: "97",
    window: "Approaching peak",
    drinkingWindow: "2028-2040",
    quantity: "6 bottles",
    purchase: "$425",
    market: "$790",
    service: "16 C / 30 min decant",
    note: "Perfumed red cherry, rose, fine spice, and mineral length with beautifully resolved tannins.",
    accent: "from-burgundy-700 to-cellar-walnut"
  },
  {
    producer: "Chateau Leoville Las Cases",
    wine: "Saint-Julien Grand Vin",
    vintage: "2016",
    region: "Bordeaux, France",
    appellation: "Saint-Julien",
    grapes: "Cabernet Sauvignon blend",
    classification: "Second Growth",
    cellar: "Oak wall / Bin 12",
    score: "98",
    window: "Needs aging",
    drinkingWindow: "2030-2060",
    quantity: "12 bottles",
    purchase: "$185",
    market: "$315",
    service: "17 C / 120 min decant",
    note: "Cassis, graphite, cedar, and tobacco with immense structure and a long, precise finish.",
    accent: "from-cellar-ink to-burgundy-900"
  },
  {
    producer: "Ridge Vineyards",
    wine: "Monte Bello Cabernet Sauvignon",
    vintage: "2019",
    region: "Santa Cruz Mountains, USA",
    appellation: "Santa Cruz Mountains",
    grapes: "Cabernet Sauvignon blend",
    classification: "Estate wine",
    cellar: "Fridge 2 / Shelf 4",
    score: "96",
    window: "Wait 5 years",
    drinkingWindow: "2032-2065",
    quantity: "4 bottles",
    purchase: "$230",
    market: "$295",
    service: "17 C / 90 min decant",
    note: "Mountain cassis, mint, crushed stone, and savory herbs framed by fresh acidity.",
    accent: "from-cellar-moss to-cellar-slate"
  },
  {
    producer: "Domaine Leflaive",
    wine: "Puligny-Montrachet Les Pucelles",
    vintage: "2020",
    region: "Burgundy, France",
    appellation: "Puligny-Montrachet Premier Cru",
    grapes: "100% Chardonnay",
    classification: "Premier Cru",
    cellar: "Wine fridge / Shelf 2",
    score: "96",
    window: "Approaching peak",
    drinkingWindow: "2027-2042",
    quantity: "3 bottles",
    purchase: "$510",
    market: "$720",
    service: "12 C / no decant",
    note: "White flowers, citrus oil, hazelnut, and chalk with layered texture and electric freshness.",
    accent: "from-[#a48b55] to-[#596659]"
  },
  {
    producer: "Giacomo Conterno",
    wine: "Barolo Monfortino Riserva",
    vintage: "2013",
    region: "Piedmont, Italy",
    appellation: "Barolo DOCG",
    grapes: "100% Nebbiolo",
    classification: "Riserva",
    cellar: "West cellar / Bin 7",
    score: "99",
    window: "Entering peak",
    drinkingWindow: "2026-2055",
    quantity: "2 bottles",
    purchase: "$680",
    market: "$1,290",
    service: "18 C / 180 min decant",
    note: "Rose, tar, red fruit, iron, and alpine herbs; profound, detailed, and still gaining complexity.",
    accent: "from-[#7a2832] to-[#34211d]"
  },
  {
    producer: "Krug",
    wine: "Grande Cuvee 170eme Edition",
    vintage: "MV",
    region: "Champagne, France",
    appellation: "Champagne",
    grapes: "Pinot Noir, Chardonnay, Meunier",
    classification: "Grande Cuvee",
    cellar: "Wine fridge / Shelf 1",
    score: "97",
    window: "Peak drinking",
    drinkingWindow: "2024-2040",
    quantity: "5 bottles",
    purchase: "$195",
    market: "$255",
    service: "10 C / no decant",
    note: "Toasted brioche, citrus, almond, and orchard fruit with extraordinary depth and fine mousse.",
    accent: "from-[#c2a96f] to-[#4a4d43]"
  }
];

const vintages = [
  ["2015", "97", "Peak", "Rack A"],
  ["2016", "98", "Hold", "Rack A"],
  ["2017", "94", "Open", "Bin 07"],
  ["2018", "97", "Soon", "Rack A"],
  ["2019", "96", "Hold", "Fridge"]
];

const windows = [
  ["Too Young", 16, "bg-sky-800"],
  ["Approaching Peak", 28, "bg-emerald-700"],
  ["Peak Drinking", 34, "bg-cellar-gold"],
  ["Drink Soon", 22, "bg-burgundy-500"]
];

const regionalCollection = {
  Burgundy: { bottles: 221, ready: 43, score: "95.1", producer: "Domaine Armand Rousseau", value: "$182,400" },
  Bordeaux: { bottles: 146, ready: 28, score: "94.6", producer: "Chateau Leoville Las Cases", value: "$96,800" },
  Champagne: { bottles: 64, ready: 31, score: "94.8", producer: "Krug", value: "$31,200" },
  Piedmont: { bottles: 52, ready: 14, score: "95.4", producer: "Giacomo Conterno", value: "$42,700" },
  "Santa Cruz": { bottles: 38, ready: 9, score: "94.2", producer: "Ridge Vineyards", value: "$18,900" }
};

const locationProfiles = {
  paris: {
    label: "Paris, France",
    weather: "18 C / cool evening",
    bottle: "Open the 2017 Barolo",
    reason: "cool Paris weather favors braised short rib, porcini risotto, or aged Comte.",
    service: ["18 C", "45 min", "2026-2034"]
  },
  newYork: {
    label: "New York, USA",
    weather: "26 C / humid",
    bottle: "Open the 2020 Puligny-Montrachet",
    reason: "a warmer, humid night calls for something lifted and precise with roast chicken, grilled corn, or lemony seafood.",
    service: ["11 C", "0 min", "2025-2030"]
  },
  sanFrancisco: {
    label: "San Francisco, USA",
    weather: "15 C / foggy",
    bottle: "Open the 2018 Clos Saint-Jacques",
    reason: "the foggy evening suits aromatic Burgundy with duck, mushrooms, salmon, or a simple roast bird.",
    service: ["16 C", "30 min", "2028-2038"]
  },
  london: {
    label: "London, UK",
    weather: "14 C / rainy",
    bottle: "Open the 2016 Saint-Julien half bottle",
    reason: "a rainy evening makes structured Bordeaux feel right with lamb, lentils, or a savory pie.",
    service: ["17 C", "60 min", "2027-2042"]
  }
};

type TonightProfile = {
  label: string;
  weather: string;
  bottle: string;
  reason: string;
  service: string[];
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

function profileForWeather(label: string, temperature: number, weatherCode: number): TonightProfile {
  const condition = weatherDescriptions[weatherCode] ?? "settled";
  if (temperature >= 23) {
    return {
      label,
      weather: `${Math.round(temperature)} C / ${condition}`,
      bottle: "Open the 2020 Puligny-Montrachet",
      reason: `the ${condition}, ${Math.round(temperature)} C weather calls for something lifted and precise with seafood, roast chicken, or summer vegetables.`,
      service: ["11 C", "0 min", "2025-2030"]
    };
  }
  if (temperature <= 10 || weatherCode >= 51) {
    return {
      label,
      weather: `${Math.round(temperature)} C / ${condition}`,
      bottle: "Open the 2016 Saint-Julien half bottle",
      reason: `the ${condition}, ${Math.round(temperature)} C weather suits structured Bordeaux with lamb, lentils, or a savory pie.`,
      service: ["17 C", "60 min", "2027-2042"]
    };
  }
  return {
    label,
    weather: `${Math.round(temperature)} C / ${condition}`,
    bottle: "Open the 2018 Clos Saint-Jacques",
    reason: `the ${condition}, ${Math.round(temperature)} C evening suits aromatic Burgundy with duck, mushrooms, salmon, or a simple roast bird.`,
    service: ["16 C", "30 min", "2028-2038"]
  };
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<keyof typeof locationProfiles>("paris");
  const [liveTonight, setLiveTonight] = useState<TonightProfile | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [bottleImageName, setBottleImageName] = useState("No bottle photo selected");
  const [bottleImagePreview, setBottleImagePreview] = useState("");
  const [bottleIntent, setBottleIntent] = useState<"collection" | "checking">("collection");
  const [activeDialog, setActiveDialog] = useState<{ title: string; body: string; confirmLabel?: string; onConfirm?: () => void } | null>(null);
  const [favoriteBottles, setFavoriteBottles] = useState<string[]>([]);
  const [removedBottles, setRemovedBottles] = useState<string[]>([]);
  const [selectedVintage, setSelectedVintage] = useState("2018");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [collectionRegion, setCollectionRegion] = useState("All regions");
  const [collectionSort, setCollectionSort] = useState("producer");
  const [selectedMapRegion, setSelectedMapRegion] = useState<keyof typeof regionalCollection>("Burgundy");
  const tonight = liveTonight ?? locationProfiles[selectedLocation];
  const collectionTotal = 742 - bottles
    .filter((bottle) => removedBottles.includes(`${bottle.producer}-${bottle.vintage}`))
    .reduce((total, bottle) => total + Number.parseInt(bottle.quantity, 10), 0);
  const visibleBottles = bottles
    .filter((bottle) => !removedBottles.includes(`${bottle.producer}-${bottle.vintage}`))
    .filter((bottle) => collectionRegion === "All regions" || bottle.region.includes(collectionRegion))
    .filter((bottle) => `${bottle.producer} ${bottle.wine} ${bottle.vintage} ${bottle.region} ${bottle.grapes}`.toLowerCase().includes(collectionSearch.toLowerCase()))
    .sort((a, b) => {
      if (collectionSort === "score") return Number(b.score) - Number(a.score);
      if (collectionSort === "vintage") return String(b.vintage).localeCompare(String(a.vintage));
      return a.producer.localeCompare(b.producer);
    });

  function handleBottleImage(file?: File) {
    if (!file) return;
    setBottleImageName(file.name);
    setBottleImagePreview(URL.createObjectURL(file));
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

  return (
    <main className="min-h-screen overflow-hidden bg-cellar-cream text-cellar-ink">
      <section className="relative isolate min-h-screen px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(199,162,90,0.20),transparent_30%),linear-gradient(135deg,#fbf7ed_0%,#f2e5d0_48%,#d9bfa0_100%)]" />
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
                  ["AI Sommelier", "#sommelier", MessageCircle]
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
                    Entering the west cellar
                  </div>
                  <h1 className="max-w-2xl font-serif text-5xl leading-[0.95] tracking-normal text-white sm:text-7xl">
                    Step inside your private collection.
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

          <aside className="grid gap-6">
            <section className="rounded-lg border border-white/70 bg-cellar-parchment/82 p-5 shadow-soft backdrop-blur" id="cellar">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-burgundy-700">Today&apos;s recommendation</p>
                  <h2 className="mt-2 font-serif text-3xl">{tonight.bottle}</h2>
                </div>
                <button
                  className="grid size-10 place-items-center rounded-md bg-cellar-ink text-white"
                  aria-label="Open recommendation"
                  onClick={() => showDialog(tonight.bottle, `${tonight.reason} Serve at ${tonight.service[0]} and decant for ${tonight.service[1]}.`)}
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
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <label className="flex items-center gap-2 rounded-md bg-white/72 px-3 py-2 text-sm font-medium text-cellar-ink">
                <MapPin className="size-4 text-burgundy-700" aria-hidden />
                <span className="sr-only">Saved location</span>
                <select
                  className="w-full bg-transparent text-sm outline-none"
                  value={selectedLocation}
                  onChange={(event) => {
                    setSelectedLocation(event.target.value as keyof typeof locationProfiles);
                    setLiveTonight(null);
                    setLocationStatus("");
                  }}
                >
                  {Object.entries(locationProfiles).map(([value, profile]) => (
                    <option value={value} key={value}>{profile.label}</option>
                  ))}
                </select>
              </label>
                <button
                  className="grid size-10 place-items-center rounded-md border border-cellar-oak/20 bg-white/72 text-burgundy-700"
                  aria-label="Use my current location"
                  title="Use my current location"
                  onClick={useDeviceLocation}
                >
                  <LocateFixed className="size-4" aria-hidden />
                </button>
              </div>
              {locationStatus && <p className="mt-2 text-xs font-medium text-cellar-walnut" role="status">{locationStatus}</p>}
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-burgundy-50 px-3 py-2 text-sm font-medium text-burgundy-900">
                <CloudSun className="size-4" aria-hidden />
                {tonight.weather}
              </div>
              <p className="mt-4 leading-7 text-cellar-walnut">
                It is entering peak, you own three bottles, and {tonight.reason}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                {tonight.service.map((item) => (
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
              <div className="mt-5 rounded-md bg-white/10 p-4 text-sm leading-6 text-cellar-cream">
                &quot;For duck tonight, choose the 2018 Clos Saint-Jacques if you want perfume and silk. Keep the 2016
                Leoville Las Cases asleep; it has another decade of structure to resolve.&quot;
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 rounded-md bg-white px-3 py-3 text-sm font-medium text-burgundy-900"
                  onClick={() => showDialog("Ask the AI Sommelier", "Try: What should I open with duck tonight? The sommelier will consider maturity, food, weather, and how many bottles remain.")}
                >
                  Ask
                </button>
                <button
                  className="grid size-11 place-items-center rounded-md border border-white/25"
                  aria-label="Search cellar"
                  onClick={() => showDialog("Search your cellar", "Search by producer, region, vintage, grape, drinking window, or a natural-language phrase such as French wines ready now.")}
                >
                  <Search className="size-4" aria-hidden />
                </button>
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

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-lg bg-white/70 p-5 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["742", "Total bottles"],
                  ["318", "Red"],
                  ["186", "White"],
                  ["42", "Sparkling"]
                ].map(([value, label]) => (
                  <div className="rounded-md bg-cellar-parchment p-4" key={label}>
                    <p className="font-serif text-3xl">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cellar-walnut">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["West cellar", "384 bottles", "Burgundy, Bordeaux, Piedmont"],
                  ["Wine fridge", "126 bottles", "Champagne, Riesling, Chardonnay"],
                  ["Offsite storage", "232 bottles", "Long-aging reserves"]
                ].map(([zone, count, detail]) => (
                  <article className="rounded-md border border-cellar-oak/18 bg-white/72 p-4" key={zone}>
                    <h3 className="font-serif text-2xl">{zone}</h3>
                    <p className="mt-2 font-medium text-burgundy-700">{count}</p>
                    <p className="mt-2 text-sm leading-6 text-cellar-walnut">{detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-burgundy-900 p-5 text-cellar-cream shadow-cellar">
              <p className="text-xs uppercase tracking-[0.18em] text-cellar-gold">Collection pulse</p>
              <h3 className="mt-2 font-serif text-3xl text-white">What is happening now</h3>
              <div className="mt-5 space-y-3">
                {[
                  ["Ready to open", "96 bottles are in their recommended window"],
                  ["Entering peak", "18 bottles should be revisited this year"],
                  ["Needs attention", "7 bottles are past the ideal drinking range"],
                  ["Most represented", "Burgundy leads with 221 bottles"]
                ].map(([title, detail]) => (
                  <div className="rounded-md bg-white/8 p-4" key={title}>
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-1 text-sm text-cellar-cream/68">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel title="AI Bottle Recognition" eyebrow="Add Bottle" icon={<ScanLine className="size-5" />} id="add-bottle">
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
                      onChange={(event) => handleBottleImage(event.target.files?.[0])}
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
                      onChange={(event) => handleBottleImage(event.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-md bg-burgundy-50 px-4 py-3 text-sm font-medium text-burgundy-900">
                  {bottleImagePreview
                    ? bottleIntent === "collection" ? "Ready to identify and add to your collection" : "Ready to identify without saving"
                    : "Upload or take a photo to identify the bottle"}
                </div>
                {[
                  ["Producer", "Domaine Leflaive"],
                  ["Wine", "Puligny-Montrachet 1er Cru Les Pucelles"],
                  ["Vintage", "2020"],
                  ["Region", "Burgundy, Cote de Beaune"],
                  ["Style", "Structured Chardonnay, cellar-worthy"]
                ].map(([label, value]) => (
                  <div className="flex items-center justify-between rounded-md bg-white/78 px-4 py-3" key={label}>
                    <span className="text-sm text-cellar-walnut">{label}</span>
                    <span className="text-right font-medium">{value}</span>
                  </div>
                ))}
                <button
                  className="w-full rounded-md bg-burgundy-700 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!bottleImagePreview}
                  onClick={() => showDialog(
                    bottleIntent === "collection" ? "Bottle added to your collection" : "Wine identified, not saved",
                    bottleIntent === "collection"
                      ? "The 2020 Domaine Leflaive Puligny-Montrachet Les Pucelles has been added. You can now set quantity, purchase details, and storage position."
                      : "This was a private lookup only. The wine and photo were not added to your collection."
                  )}
                >
                  {bottleIntent === "collection" ? "Identify and add bottle" : "Identify without saving"}
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Collection Dashboard" eyebrow="Live cellar" icon={<BarChart3 className="size-5" />} id="dashboard">
            <div className="grid gap-3 sm:grid-cols-3">
              {["Ready now 96", "Avg score 94.2", "Wishlist 38"].map((item) => (
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
                  <span className="absolute bottom-4 right-4 rounded-md bg-white/90 px-2 py-1 text-sm font-bold text-cellar-ink">{bottle.score} pts</span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-burgundy-700">{bottle.producer}</p>
                  <h3 className="mt-2 font-serif text-2xl leading-7">{bottle.wine}</h3>
                  <p className="mt-2 text-sm text-cellar-walnut">{bottle.appellation} / {bottle.classification}</p>
                  <p className="mt-4 text-sm leading-6 text-cellar-walnut">{bottle.note}</p>

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
                        onClick={() => showDialog(`${bottle.vintage} ${bottle.producer}`, `${bottle.wine}. ${bottle.note} ${bottle.grapes}; ${bottle.appellation}. Drinking window ${bottle.drinkingWindow}. Store at ${bottle.cellar}. You own ${bottle.quantity}. Serve ${bottle.service}.`)}
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
                          () => setRemovedBottles((current) => [...current, `${bottle.producer}-${bottle.vintage}`])
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
              No bottles match those filters.
            </div>
          )}
        </div>
      </section>

      <section className="bg-cellar-night px-4 py-10 text-cellar-cream sm:px-6 lg:px-8" id="vintages">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel dark title="Vintage Intelligence" eyebrow="Rousseau Clos Saint-Jacques" icon={<Clock3 className="size-5" />}>
            <div className="grid grid-cols-5 gap-2">
              {vintages.map(([year, score, status, value]) => (
                <button
                  className={`rounded-md border p-3 text-left transition ${selectedVintage === year ? "border-cellar-gold bg-white/16" : "border-white/10 bg-white/8 hover:bg-white/14"}`}
                  key={year}
                  aria-pressed={selectedVintage === year}
                  onClick={() => setSelectedVintage(year)}
                >
                  <p className="font-serif text-2xl text-white">{year}</p>
                  <p className="mt-2 text-sm">{score} pts</p>
                  <p className="text-xs text-cellar-cream/58">{status}</p>
                  <p className="mt-3 text-sm text-cellar-gold">{value}</p>
                </button>
              ))}
            </div>
            <p className="mt-5 leading-7 text-cellar-cream/72">
              Selected vintage: {selectedVintage}. The 2018 is more aromatic and generous than 2016, with earlier
              charm. Hold 2016 for structure; open 2017 for delicacy; revisit 2018 from 2029.
            </p>
          </Panel>

          <Panel dark title="Regional Map" eyebrow="Collection geography" icon={<Map className="size-5" />} id="regional-map">
            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-72 rounded-lg bg-[radial-gradient(circle_at_44%_45%,rgba(199,162,90,0.40),transparent_18%),radial-gradient(circle_at_58%_38%,rgba(143,29,58,0.56),transparent_14%),linear-gradient(135deg,#293532,#111)]">
                {(Object.keys(regionalCollection) as Array<keyof typeof regionalCollection>).map((region, index) => (
                  <button
                    className={`absolute rounded-full px-2 py-1 text-xs font-medium transition ${selectedMapRegion === region ? "bg-white text-burgundy-900 ring-2 ring-cellar-gold" : "bg-cellar-gold text-cellar-ink"}`}
                    key={region}
                    style={{ left: `${18 + index * 13}%`, top: `${28 + (index % 3) * 18}%` }}
                    onClick={() => setSelectedMapRegion(region)}
                    aria-pressed={selectedMapRegion === region}
                  >
                    {region}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="rounded-md border border-cellar-gold/25 bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-cellar-gold">Selected region</p>
                  <h3 className="mt-2 font-serif text-3xl text-white">{selectedMapRegion}</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-cellar-cream/55">Bottles</p><p className="mt-1 font-medium text-white">{regionalCollection[selectedMapRegion].bottles}</p></div>
                    <div><p className="text-cellar-cream/55">Ready now</p><p className="mt-1 font-medium text-white">{regionalCollection[selectedMapRegion].ready}</p></div>
                    <div><p className="text-cellar-cream/55">Average score</p><p className="mt-1 font-medium text-white">{regionalCollection[selectedMapRegion].score}</p></div>
                    <div><p className="text-cellar-cream/55">Collection value</p><p className="mt-1 font-medium text-white">{regionalCollection[selectedMapRegion].value}</p></div>
                  </div>
                  <p className="mt-4 text-sm text-cellar-cream/65">Most owned: {regionalCollection[selectedMapRegion].producer}</p>
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
              </div>
            </div>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-cellar-gold px-4 py-2 text-sm font-medium text-cellar-ink"
              onClick={() => {
                setCollectionRegion(selectedMapRegion);
                document.getElementById("my-collection")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View {selectedMapRegion} bottles <ChevronRight className="size-4" aria-hidden />
            </button>
          </Panel>
        </div>
      </section>

      <section className="bg-cellar-parchment px-4 py-10 sm:px-6 lg:px-8" id="journal">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-4">
          {[
            [ThermometerSun, "Drinking Window", "Peak years, last recommended year, and plain-English aging logic."],
            [Utensils, "Food Pairings", "Classic, vegetarian, holiday, cheese, and unexpected pairings."],
            [Compass, "Drink Tonight", "A one-tap recommendation using dinner, guests, weather, and maturity."],
            [ShieldCheck, "Cellar Management", "Rack, shelf, bin, storage locker, bottle status, and opening history."]
          ].map(([Icon, title, body]) => {
            const TypedIcon = Icon as typeof Grape;
            return (
              <div className="rounded-lg bg-white/78 p-5 shadow-soft" key={title as string}>
                <TypedIcon className="size-6 text-burgundy-700" aria-hidden />
                <h3 className="mt-4 font-serif text-2xl">{title as string}</h3>
                <p className="mt-3 leading-6 text-cellar-walnut">{body as string}</p>
              </div>
            );
          })}
        </div>
      </section>

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
