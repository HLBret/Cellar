import { NextResponse } from "next/server";

type ResearchSource = {
  title: string;
  url: string;
  provider: string;
};

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
  sources: ResearchSource[];
};

type ResponsesData = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
    action?: {
      sources?: Array<{ type?: string; url?: string }>;
    };
  }>;
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    wineColor: { type: "string" },
    nose: { type: "string" },
    palate: { type: "string" },
    finish: { type: "string" },
    tastingNotes: {
      type: "array",
      items: { type: "string" }
    },
    communityRating: { type: "string" },
    communityConsensus: { type: "string" },
    criticScores: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          source: { type: "string" },
          score: { type: "string" },
          note: { type: "string" }
        },
        required: ["source", "score", "note"]
      }
    },
    drinkWindow: {
      type: "object",
      additionalProperties: false,
      properties: {
        start: { type: "string" },
        peak: { type: "string" },
        end: { type: "string" },
        status: { type: "string" },
        reason: { type: "string" }
      },
      required: ["start", "peak", "end", "status", "reason"]
    },
    communityPairings: {
      type: "array",
      items: { type: "string" }
    },
    sommelierPairings: {
      type: "array",
      items: { type: "string" }
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          provider: { type: "string" }
        },
        required: ["title", "url", "provider"]
      }
    }
  },
  required: [
    "summary", "wineColor", "nose", "palate", "finish", "tastingNotes", "communityRating",
    "communityConsensus", "criticScores", "drinkWindow",
    "communityPairings", "sommelierPairings", "sources"
  ]
};

function getResponseText(data: ResponsesData) {
  if (data.output_text) return data.output_text;
  return data.output
    ?.flatMap((item) => item.content ?? [])
    .find((part) => part.type === "output_text")
    ?.text;
}

function getErrorMessage(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as { error?: { message?: string } };
    return parsed.error?.message ?? errorText;
  } catch {
    return errorText;
  }
}

function providerFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Web source";
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI web research is not configured." },
      { status: 501 }
    );
  }

  const bottle = await request.json() as {
    producer?: string;
    wine?: string;
    vintage?: string;
    region?: string;
    appellation?: string;
  };
  if (!bottle.producer || !bottle.wine || !bottle.vintage) {
    return NextResponse.json(
      { error: "Producer, wine, and vintage are required for research." },
      { status: 400 }
    );
  }

  const prompt = [
    `Research this exact wine and vintage: ${bottle.vintage} ${bottle.producer} ${bottle.wine}.`,
    `Known region/appellation: ${bottle.region ?? "unknown"} / ${bottle.appellation ?? "unknown"}.`,
    "Use web search in real time. Prioritize the producer's official site, CellarTracker, Vivino, Wine Spectator, Decanter, and Robert Parker Wine Advocate.",
    "First verify the exact wine's color and style from an exact-cuvee source. Do not infer color from bottle glass or from the broader region.",
    "Set wineColor to a concise value such as White wine, Red wine, Rose wine, Orange wine, or Sparkling wine.",
    "Make every tasting descriptor, food pairing, and drinking-window statement consistent with that verified color, grape blend, and winemaking method.",
    "Only use information visible in public search results or publicly accessible pages. Do not bypass subscriptions, logins, robots restrictions, or licensing restrictions.",
    "Never transfer a rating, review, or drinking window from a different vintage. If the exact vintage is unavailable, leave the field as 'Not publicly available'.",
    "Paraphrase tasting notes briefly. Do not reproduce long critic or community reviews.",
    "Return 10 to 16 concise one- or two-word aroma and flavor descriptors in tastingNotes.",
    "Label every critic score with its source. Keep community ratings separate from professional scores.",
    "Build the drink window from cited exact-vintage evidence when available; otherwise provide a conservative estimate and clearly say it is a sommelier estimate.",
    "Use community pairing recommendations when they are actually found. Put your own wine-knowledge suggestions only in sommelierPairings.",
    "Include direct source URLs for every factual rating, note, or window used."
  ].join("\n");

  const model = process.env.OPENAI_RESEARCH_MODEL ?? process.env.OPENAI_WINE_MODEL ?? "gpt-5.4";
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt,
        tools: [{
          type: "web_search",
          search_context_size: "high"
        }],
        tool_choice: "required",
        max_tool_calls: 8,
        include: ["web_search_call.action.sources"],
        text: {
          format: {
            type: "json_schema",
            name: "wine_research",
            strict: true,
            schema
          }
        }
      })
    });
  } catch {
    console.error("OpenAI wine research request could not reach the API.");
    return NextResponse.json(
      { error: "Live wine research is temporarily unavailable." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const message = getErrorMessage(await response.text());
    console.error(`OpenAI wine research failed (${response.status}): ${message}`);
    return NextResponse.json(
      { error: "Live wine research is temporarily unavailable." },
      { status: response.status }
    );
  }

  const data = await response.json() as ResponsesData;
  const responseText = getResponseText(data);
  if (!responseText) {
    console.error("OpenAI wine research returned no output text.");
    return NextResponse.json(
      { error: "Live wine research is temporarily unavailable." },
      { status: 502 }
    );
  }

  let research: WineResearch;
  try {
    research = JSON.parse(responseText) as WineResearch;
  } catch {
    console.error("OpenAI wine research returned unreadable structured output.");
    return NextResponse.json(
      { error: "Live wine research is temporarily unavailable." },
      { status: 502 }
    );
  }

  const searchedUrls = data.output
    ?.filter((item) => item.type === "web_search_call")
    .flatMap((item) => item.action?.sources ?? [])
    .map((source) => source.url)
    .filter((url): url is string => Boolean(url)) ?? [];
  const mergedSources = [...research.sources];
  for (const url of searchedUrls) {
    if (!mergedSources.some((source) => source.url === url)) {
      const provider = providerFromUrl(url);
      mergedSources.push({ title: provider, url, provider });
    }
  }

  return NextResponse.json({
    ...research,
    sources: mergedSources,
    researchedAt: new Date().toISOString()
  });
}
