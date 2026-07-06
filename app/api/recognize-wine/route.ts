import { NextResponse } from "next/server";

export const maxDuration = 60;

type WineRecognition = {
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
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    producer: { type: "string" },
    wine: { type: "string" },
    vintage: { type: "string" },
    country: { type: "string" },
    region: { type: "string" },
    appellation: { type: "string" },
    grapes: { type: "string" },
    classification: { type: "string" },
    style: { type: "string" },
    confidence: { type: "number" },
    drinkingWindow: { type: "string" },
    service: { type: "string" },
    note: { type: "string" },
    tastingNotes: {
      type: "array",
      items: { type: "string" }
    },
    producerHistory: { type: "string" },
    vintageSummary: { type: "string" },
    foodPairing: { type: "string" },
    sources: { type: "array", items: { type: "string" } },
    alternatives: { type: "array", items: { type: "string" } }
  },
  required: [
    "producer", "wine", "vintage", "country", "region", "appellation",
    "grapes", "classification", "style", "confidence", "drinkingWindow",
    "service", "note", "tastingNotes", "producerHistory", "vintageSummary", "foodPairing",
    "sources", "alternatives"
  ]
};

function getOpenAiErrorMessage(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as { error?: { message?: string } };
    return parsed.error?.message ?? errorText;
  } catch {
    return errorText;
  }
}

function getResponseText(data: {
  output_text?: string;
  output?: Array<{
    text?: string;
    content?: Array<{
      type?: string;
      text?: string | { value?: string };
    }>;
  }>;
}) {
  if (data.output_text) return data.output_text;
  for (const item of data.output ?? []) {
    if (typeof item.text === "string") return item.text;
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue;
      if (typeof part.text === "string") return part.text;
      if (part.text?.value) return part.text.value;
    }
  }
  return undefined;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeRecognition(value: Partial<WineRecognition>): WineRecognition {
  return {
    producer: asString(value.producer, "Producer not confirmed"),
    wine: asString(value.wine, "Wine name not confirmed"),
    vintage: asString(value.vintage, "NV"),
    country: asString(value.country, "Country not confirmed"),
    region: asString(value.region, "Region not confirmed"),
    appellation: asString(value.appellation, "Appellation not confirmed"),
    grapes: asString(value.grapes, "Grapes not confirmed"),
    classification: asString(value.classification, "Classification not confirmed"),
    style: asString(value.style, "Wine style not confirmed"),
    confidence: typeof value.confidence === "number" ? value.confidence : 0,
    drinkingWindow: asString(value.drinkingWindow, "Drinking window not confirmed"),
    service: asString(value.service, "Serving guidance not confirmed"),
    note: asString(value.note, "Tasting details require further research."),
    tastingNotes: Array.isArray(value.tastingNotes) ? value.tastingNotes.filter((note): note is string => typeof note === "string") : [],
    producerHistory: asString(value.producerHistory, "Producer history requires further research."),
    vintageSummary: asString(value.vintageSummary, "Vintage details require further research."),
    foodPairing: asString(value.foodPairing, "Pairing guidance requires further research."),
    sources: Array.isArray(value.sources) ? value.sources.filter((source): source is string => typeof source === "string") : [],
    alternatives: Array.isArray(value.alternatives) ? value.alternatives.filter((alternative): alternative is string => typeof alternative === "string") : []
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI recognition is not configured. Add OPENAI_API_KEY to .env.local, then restart Cellar." },
      { status: 501 }
    );
  }

  const { image } = await request.json() as { image?: string };
  if (!image) {
    return NextResponse.json({ error: "A bottle image is required." }, { status: 400 });
  }
  if (!/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(image)) {
    return NextResponse.json(
      { error: "Cellar needs a JPEG, PNG, or WebP bottle image." },
      { status: 400 }
    );
  }

  const prompt = [
    "You are Cellar's meticulous wine bottle identification engine.",
    "Inspect the original bottle or label image at high detail.",
    "Read the producer, exact cuvee or wine name, vintage, appellation, region, classification, and visible label wording before using general wine knowledge.",
    "Treat large display text as a possible wine name rather than automatically assuming it is the producer.",
    "Check smaller script and estate text carefully for the producer or bottler.",
    "Determine whether the exact wine is white, red, rose, sparkling, fortified, or sweet before writing any tasting note.",
    "Do not infer wine color from dark bottle glass. Some white wines, including age-worthy white Rioja, are bottled in dark glass.",
    "Set style to an explicit description such as 'Dry white wine' or 'Still red wine'. If color cannot be confirmed, say 'Color not confirmed' and avoid color-specific tasting notes.",
    "Never replace an unfamiliar bottle with a famous or familiar wine.",
    "If the exact identity is uncertain, state that clearly, set confidence below 60, and provide concise alternatives.",
    "Do not invent critic scores, market prices, producer history, vintage facts, or grape composition.",
    "Provide tasting notes, drinking window, service, and food pairing only when the identified wine supports them.",
    "Return 8 to 14 concise one- or two-word aroma and flavor descriptors in tastingNotes. Every descriptor must be plausible for the exact identified wine, color, grapes, and winemaking style.",
    "Sources must describe the evidence used, such as visible front-label text or general wine knowledge; do not claim to have searched a site."
  ].join(" ");

  const model = process.env.OPENAI_WINE_MODEL ?? "gpt-5.4";
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(55000),
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }],
        text: {
          format: {
            type: "json_schema",
            name: "wine_recognition",
            strict: true,
            schema
          }
        }
      })
    });
  } catch {
    console.error("OpenAI recognition request could not reach the API.");
    return NextResponse.json(
      { error: "Bottle recognition is temporarily unavailable." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const message = getOpenAiErrorMessage(await response.text());
    console.error(`OpenAI recognition failed (${response.status}): ${message}`);
    return NextResponse.json(
      { error: "Bottle recognition is temporarily unavailable." },
      { status: response.status }
    );
  }

  let data: Parameters<typeof getResponseText>[0];
  let output: WineRecognition;
  try {
    data = await response.json() as Parameters<typeof getResponseText>[0];
    const responseText = getResponseText(data);
    if (!responseText) throw new Error("missing_output_text");
    output = normalizeRecognition(JSON.parse(responseText) as Partial<WineRecognition>);
  } catch {
    console.error("OpenAI recognition returned unreadable structured output.");
    return NextResponse.json(
      { error: "Bottle recognition is temporarily unavailable." },
      { status: 502 }
    );
  }

  console.log(`OpenAI recognition succeeded: ${output.vintage} ${output.producer} ${output.wine}`);

  return NextResponse.json({
    ...output,
    sources: [...new Set(["OpenAI high-detail image interpretation", ...output.sources])],
    recognitionProvider: "OpenAI"
  });
}
