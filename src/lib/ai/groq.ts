import type {
  AIProvider,
  TailorInput,
  MatchAnalysis,
  KeywordAnalysis,
} from "./types";

/**
 * Uses Groq Cloud API for ultra-fast LLM inference.
 * Groq models: groq/llama-3.1-70b-versatile, groq/mixtral-8x7b-32768, etc.
 */
export function createGroqProvider(apiKey: string, model = "groq/llama-3.1-70b-versatile"): AIProvider {
  const modelId = model.includes("/") ? model.split("/")[1] : model;

  async function callGroq(opts: {
    system: string;
    user: string;
    maxTokens: number;
    json: boolean;
  }): Promise<string> {
    const body = JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      temperature: 0.4,
      max_tokens: opts.maxTokens,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body,
    });

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Groq rate limit reached. Try again in a moment.");
      if (res.status === 401 || res.status === 403)
        throw new Error(
          "Groq API key rejected. Check AI_API_KEY in your deployment environment (must be a valid Groq Cloud API key).",
        );
      throw new Error(`Groq error ${res.status}: ${t.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) {
      console.error("Groq empty response", JSON.stringify(data).slice(0, 500));
      throw new Error("Groq returned empty response. Try again.");
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
      console.error("Groq non-JSON response:", text.slice(0, 500));
      throw new Error(`Groq returned invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`);
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
    name: "groq",
    model: modelId,

    async analyzeMatch(input) {
      const system = `You are scoring how well a candidate's CV matches a specific job description.

Score strictly against what THIS job description requires — do not give credit
for generic relevance. If a requirement (license, years of experience, a named
certification) is not clearly stated in the CV, treat it as missing, not assumed.

Return STRICT JSON only, no prose, no markdown fences:
{"matchScore": <integer 0-100>, "strengths": ["...", max 5], "weaknesses": ["...", max 5]}

Rules:
- Each strength must name something concrete in the CV and tie it to something
  the JD actually asks for.
- Each weakness must name something concrete the JD requires or prefers that
  the CV does not address.
- Do not invent or assume qualifications not present in the CV text.`;
      const text = await callGroq({
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
      const system = `Compare the job description's required/preferred terms against the CV.

Return STRICT JSON only:
{"matchedKeywords": ["...", max 12], "missingKeywords": ["...", max 12]}

Rules:
- Prioritize hard requirements first: licenses/certifications, named tools,
  languages, frameworks, years of experience.
- Only include a term in matchedKeywords if it appears in the JD AND is
  clearly supported by the CV.
- Only include a term in missingKeywords if the JD requires or prefers it and
  the CV does not mention it.
- No duplicates, no generic filler ("team player", "communication skills")
  unless the JD names it as an explicit requirement.`;
      const text = await callGroq({
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
      const system = `Write a tailored cover letter in first person, 320-380 words, plain text only
(no markdown, no placeholders like [Company Name]).${toneLine}

Rules:
- Open by naming the actual role and company from the context.
- Ground every claim in the CANDIDATE CV text — never invent credentials,
  licenses, employers, or years of experience not present in the CV.
- Connect 2-3 specific CV details to specific requirements in the job
  description.
- End with a direct, confident closing line — skip "I look forward to
  hearing from you."`;
      return await callGroq({
        system,
        user: `${contextBlock(input)}\n\nWrite the cover letter.`,
        maxTokens: 1280,
        json: false,
      });
    },
  };
}
