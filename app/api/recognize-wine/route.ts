import { NextResponse } from "next/server";

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
    producerHistory: { type: "string" },
    vintageSummary: { type: "string" },
    foodPairing: { type: "string" },
    sources: { type: "array", items: { type: "string" } },
    alternatives: { type: "array", items: { type: "string" } }
  },
  required: [
    "producer",
    "wine",
    "vintage",
    "country",
    "region",
    "appellation",
    "grapes",
    "classification",
    "style",
    "confidence",
    "drinkingWindow",
    "service",
    "note",
    "producerHistory",
    "vintageSummary",
    "foodPairing",
    "sources",
    "alternatives"
  ]
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_WINE_MODEL ?? "gpt-5.5";
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Using local recognition fallback." },
      { status: 501 }
    );
  }

  const { image } = await request.json() as { image?: string };
  if (!image) {
    return NextResponse.json({ error: "A bottle image is required." }, { status: 400 });
  }

  const prompt = [
    "You are Cellar's wine recognition engine.",
    "Identify the wine bottle or label in the image and return structured cellar data.",
    "If the label is unclear, give the most likely match, lower the confidence, and include likely alternatives.",
    "Do not invent a critic score or market value. Focus on producer, cuvee, vintage, region, grapes, service, maturity, tasting notes, and food pairings.",
    "Sources should describe the source type used, such as 'OpenAI Vision label reading' or 'general wine knowledge'."
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image }
          ]
        }
      ],
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

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  const output = data.output_text ? JSON.parse(data.output_text) as WineRecognition : null;
  if (!output) {
    return NextResponse.json({ error: "Recognition did not return structured wine data." }, { status: 502 });
  }

  return NextResponse.json(output);
}
