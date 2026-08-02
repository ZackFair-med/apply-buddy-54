import type {
  AIProvider,
  TailorInput,
  MatchAnalysis,
  KeywordAnalysis,
} from "./types";

/**
 * Uses Lovable AI Gateway (OpenAI-compatible) to call Google Gemini models.
 * Split into three focused calls so we only spend tokens on what the user asks for.
 */
export function createGeminiProvider(apiKey: string, model = "google/gemini-2.5-flash"): AIProvider {
  const gatewayKey = process.env.LOVABLE_API_KEY;
  const useGateway = Boolean(gatewayKey);
  const gatewayModel = model.includes("/") ? model : `google/${model}`;
  // Direct Google API expects a bare model id (no "google/" prefix).
  // Default to an alias that stays valid for new Google AI Studio keys.
  const FALLBACK_GOOGLE_MODEL = "gemini-flash-latest";
  const googleModel = process.env.AI_MODEL
    ? process.env.AI_MODEL.split("/").pop()!
    : FALLBACK_GOOGLE_MODEL;

  async function callGoogle(opts: {
    system: string;
    user: string;
    maxTokens: number;
    json: boolean;
  }): Promise<string> {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.user }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: opts.maxTokens,
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    });

    async function request(modelId: string) {
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body,
        },
      );
    }

    let res = await request(googleModel);
    // Google retires model ids for new API keys (e.g. "gemini-2.5-flash").
    // Retry once on a known-good alias instead of failing the user's request.
    if (res.status === 404 && googleModel !== FALLBACK_GOOGLE_MODEL) {
      console.warn(
        `AI model "${googleModel}" unavailable for this key; falling back to "${FALLBACK_GOOGLE_MODEL}".`,
      );
      res = await request(FALLBACK_GOOGLE_MODEL);
    }

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (res.status === 401 || res.status === 403)
        throw new Error(
          "AI key rejected by Google. Check AI_API_KEY in your deployment environment (it must be a Google AI Studio key with the Generative Language API enabled).",
        );
      if (res.status === 404)
        throw new Error(
          `AI model not available for this key. Remove AI_MODEL or set it to "${FALLBACK_GOOGLE_MODEL}".`,
        );
      throw new Error(`AI error ${res.status}: ${t.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("AI returned empty response. Try again.");
    return text;
  }


  async function callGateway(opts: {
    system: string;
    user: string;
    maxTokens: number;
    json: boolean;
  }): Promise<string> {
    if (!useGateway) return callGoogle(opts);
    const body: Record<string, unknown> = {
      model: gatewayModel,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      temperature: 0.4,
      max_tokens: opts.maxTokens,
    };
    if (opts.json) body.response_format = { type: "json_object" };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": gatewayKey!,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Plans & credits.");
      throw new Error(`AI error ${res.status}: ${t.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) {
      console.error("AI empty response", JSON.stringify(data).slice(0, 500));
      throw new Error("AI returned empty response. Try again.");
    }
    return text;
  }


  function parseJson<T>(text: string): T {
    try {
      const trimmed = text.trim();
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : trimmed;
      return JSON.parse(jsonText) as T;
    } catch (e) {
      console.error("AI non-JSON response:", text.slice(0, 500));
      throw new Error(`AI returned invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`);
    }
  }

  function contextBlock(input: TailorInput): string {
    // Optimize context: truncate CV to first 3000 chars for efficiency
    const cvPreview = input.cvText.length > 3000 
      ? input.cvText.slice(0, 3000) + "\n[... CV truncated for performance ...]"
      : input.cvText;
    
    return `JOB TITLE: ${input.jobTitle ?? "(unspecified)"}
COMPANY: ${input.company ?? "(unspecified)"}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE CV:
${cvPreview}`;
  }

  return {
    name: useGateway ? "lovable-ai" : "gemini",
    model: useGateway ? gatewayModel : googleModel,


    async analyzeMatch(input) {
      const system = `Score CV vs job description. Return STRICT JSON:
{"matchScore": 0-100, "strengths": ["bullet1", "bullet2"], "weaknesses": ["bullet1", "bullet2"]}`;
      const text = await callGateway({
        system,
        user: `${contextBlock(input)}\n\nJSON only.`,
        maxTokens: 512,
        json: true,
      });
      const p = parseJson<Partial<MatchAnalysis>>(text);
      return {
        matchScore: Math.max(0, Math.min(100, Number(p.matchScore ?? 0))),
        strengths: (Array.isArray(p.strengths) ? p.strengths : []).slice(0, 5),
        weaknesses: (Array.isArray(p.weaknesses) ? p.weaknesses : []).slice(0, 5),
      };
    },

    async extractKeywords(input) {
      const system = `Extract skills from JD vs CV. Return STRICT JSON:
{"matchedKeywords": ["skill1", "skill2"], "missingKeywords": ["skill1", "skill2"]}
Max 12 each. Focus: tools, languages, frameworks, certifications.`;
      const text = await callGateway({
        system,
        user: `${contextBlock(input)}\n\nJSON only.`,
        maxTokens: 384,
        json: true,
      });
      const p = parseJson<Partial<KeywordAnalysis>>(text);
      return {
        matchedKeywords: (Array.isArray(p.matchedKeywords) ? p.matchedKeywords : []).slice(0, 12),
        missingKeywords: (Array.isArray(p.missingKeywords) ? p.missingKeywords : []).slice(0, 12),
      };
    },

    async generateCoverLetter(input, tone) {
      const toneLine =
        tone === "formal"
          ? " Professional, respectful tone."
          : tone === "warm"
          ? " Warm, genuine, enthusiastic tone."
          : tone === "confident"
          ? " Confident, impactful, ownership-focused tone."
          : "";
      const system = `Write a concise, tailored cover letter (320-380 words) in first person.${toneLine} Plain text only.`;
      return await callGateway({
        system,
        user: `${contextBlock(input)}\n\nWrite the cover letter.`,
        maxTokens: 1280,
        json: false,
      });
    },

  };
}
