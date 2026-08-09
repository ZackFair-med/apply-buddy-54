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
      const system = `Score candidate CV vs job description and identify actionable gaps.
Return STRICT JSON only:
{
  "matchScore": <0-100 integer>,
  "strengths": ["bullet1", "bullet2"],
  "gaps": [
    {
      "issue": "specific missing requirement or weakness",
      "severity": "critical | important | minor",
      "recommendation": "practical action candidate can take without lying"
    }
  ]
}

Rules:
- Base every gap strictly on the JD and CV text. Do not invent qualifications.
- "critical": only mandatory licenses, certifications, legally required qualifications, or explicitly required experience.
- "important": meaningful missing skills or requirements that impact fit.
- "minor": lower-impact preferences or cosmetic improvements.
- Recommendations must be honest and practical (never recommend falsely claiming qualifications). Max 5 strengths, max 5 gaps.`;
      const text = await callGateway({
        system,
        user: `${contextBlock(input)}\n\nJSON only.`,
        maxTokens: 512,
        json: true,
      });
      const p = parseJson<Partial<MatchAnalysis>>(text);
      const rawGaps = Array.isArray(p.gaps) ? p.gaps : [];
      const gaps = rawGaps
        .filter((g) => g && typeof g.issue === "string" && g.issue.trim())
        .slice(0, 5)
        .map((g) => {
          const sev = String(g.severity ?? "").toLowerCase();
          const severity: "critical" | "important" | "minor" =
            sev === "critical" ? "critical" : sev === "minor" ? "minor" : "important";
          return {
            issue: String(g.issue).trim(),
            severity,
            recommendation: String(g.recommendation ?? "").trim(),
          };
        });

      const rawWeaknesses = Array.isArray(p.weaknesses) ? p.weaknesses : [];
      const weaknesses = rawWeaknesses.map((w) => String(w).trim()).filter(Boolean).slice(0, 5);

      if (gaps.length === 0 && weaknesses.length > 0) {
        weaknesses.forEach((w) => {
          gaps.push({
            issue: w,
            severity: "important",
            recommendation: "Address or highlight relevant experience for this requirement.",
          });
        });
      }

      return {
        matchScore: Math.max(0, Math.min(100, Number(p.matchScore ?? 0))),
        strengths: (Array.isArray(p.strengths) ? p.strengths : []).slice(0, 5),
        weaknesses,
        gaps,
      };
    },

    async extractKeywords(input) {
      const system = `Extract skills from JD vs CV and suggest bullet rewrites to naturally integrate missing skills into candidate CV bullets.
Return STRICT JSON only:
{
  "matchedKeywords": ["skill1", "skill2"],
  "missingKeywords": ["skill1", "skill2"],
  "suggestedRewrites": [
    {
      "original": "exact line from CV",
      "targetKeywords": ["missing skill 1"],
      "suggested": "rewritten bullet integrating missing skills"
    }
  ]
}
Max 12 keywords each, up to 4 suggestedRewrites. Focus: tools, languages, frameworks, certifications, experience.`;
      const text = await callGateway({
        system,
        user: `${contextBlock(input)}\n\nJSON only.`,
        maxTokens: 800,
        json: true,
      });
      const p = parseJson<Partial<KeywordAnalysis>>(text);
      const rawRewrites = Array.isArray(p.suggestedRewrites) ? p.suggestedRewrites : [];
      const suggestedRewrites = rawRewrites
        .filter((r) => r && typeof r.original === "string" && typeof r.suggested === "string")
        .slice(0, 4)
        .map((r) => ({
          original: String(r.original).trim(),
          suggested: String(r.suggested).trim(),
          targetKeywords: Array.isArray(r.targetKeywords)
            ? r.targetKeywords.map(String).slice(0, 5)
            : [],
        }));

      return {
        matchedKeywords: (Array.isArray(p.matchedKeywords) ? p.matchedKeywords : []).slice(0, 12),
        missingKeywords: (Array.isArray(p.missingKeywords) ? p.missingKeywords : []).slice(0, 12),
        suggestedRewrites,
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
