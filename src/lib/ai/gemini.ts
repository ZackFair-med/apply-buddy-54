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
  const CV_CONTEXT_LIMIT = 10_000;
  const TRUNCATION_BOUNDARY_WINDOW = 400;
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
    temperature?: number;
  }): Promise<string> {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.user }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.4,
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
    temperature?: number;
  }): Promise<string> {
    if (!useGateway) return callGoogle(opts);
    const body: Record<string, unknown> = {
      model: gatewayModel,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      temperature: opts.temperature ?? 0.4,
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
    let cvPreview = input.cvText;
    if (input.cvText.length > CV_CONTEXT_LIMIT) {
      const initial = input.cvText.slice(0, CV_CONTEXT_LIMIT);
      const windowStart = CV_CONTEXT_LIMIT - TRUNCATION_BOUNDARY_WINDOW;
      const boundaryWindow = initial.slice(windowStart);
      const newlineIndex = boundaryWindow.lastIndexOf("\n");
      const sentenceMatches = [...boundaryWindow.matchAll(/[.!?](?=\s|$)/g)];
      const sentenceIndex = sentenceMatches.at(-1)?.index ?? -1;
      const whitespaceMatches = [...boundaryWindow.matchAll(/\s/g)];
      const whitespaceIndex = whitespaceMatches.at(-1)?.index ?? -1;
      const boundaryIndex =
        newlineIndex >= 0
          ? windowStart + newlineIndex
          : sentenceIndex >= 0
            ? windowStart + sentenceIndex + 1
            : whitespaceIndex >= 0
              ? windowStart + whitespaceIndex
              : CV_CONTEXT_LIMIT;

      cvPreview = `${initial.slice(0, boundaryIndex)}\n[... CV truncated for performance ...]`;
    }
    
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
      const system = `You are evaluating how well a candidate's CV matches a specific job description.

Evaluate ONLY against requirements and preferences stated in THIS job description. Do not award points merely because the candidate has generally impressive, related, or industry-relevant experience.

Treat the candidate's CV as the sole source of truth about the candidate. The job description describes employer requirements; it is NOT evidence that the candidate possesses them. If a qualification, skill, responsibility, experience, license, certification, tool, achievement, or other requirement is not clearly supported by the CV, treat it as unsupported.

For scoring purposes, if a JD requirement is not supported by the CV, treat it as unevidenced and missing from the application. This affects the match score even though the candidate may possess the requirement outside the CV. Never infer or state that the candidate definitely lacks something solely because it is absent from the CV.

Return STRICT JSON only, no prose, no markdown fences:
{
  "matchScore": <integer 0-100>,
  "strengths": ["...", max 5],
  "gaps": [
    {
      "issue": "<specific unsupported or partially supported JD requirement>",
      "severity": "critical" | "important" | "minor",
      "recommendation": "<practical and truthful action>"
    }
  ]
}

SCORING RUBRIC:
- Determine matchScore from coverage of THIS job's actual requirements.
- Give greatest weight, in this general order, to: mandatory/legal requirements and explicit deal-breakers; required experience and core responsibilities; required technical/domain skills and named tools; preferred qualifications and nice-to-have skills.
- Do NOT mechanically count keywords. Evaluate whether the underlying requirement is actually supported by CV evidence.
- A high score requires strong coverage of important requirements, not merely many superficial keyword matches.
- Use these ranges as calibration guidance, not a mechanical mathematical formula:
  - 90-100: Exceptional alignment. Nearly all important requirements are clearly supported and there are no meaningful critical gaps.
  - 75-89: Strong alignment. Most important requirements are supported with limited non-critical gaps.
  - 60-74: Moderate alignment. Several relevant requirements are supported, but meaningful gaps remain.
  - 40-59: Weak alignment. Some relevant evidence exists, but multiple important requirements are unsupported.
  - 0-39: Poor alignment. Major mandatory/core requirements are unsupported or CV evidence has limited relevance to the role.
- A genuine critical gap must materially constrain the score. Do not produce a very high score because minor requirements match when an explicit mandatory requirement is unsupported.

STRENGTH RULES:
- Every strength must identify concrete CV evidence and connect it to a specific JD requirement.
- Prioritize the strongest and most job-relevant evidence.
- Do not list generic qualities unless supported by the CV and relevant to the JD.
- Max 5 strengths.

GAP RULES:
- Base every gap strictly on the JD and CV. Do not invent requirements that the JD does not state.
- Do not treat something as a candidate weakness merely because it is absent from the CV unless it is actually required or preferred by the JD.
- Describe absence of evidence precisely. Use wording such as "The CV does not evidence...", "The CV does not mention...", or "The application does not demonstrate...".
- Do not write that the candidate "lacks", "does not have", or "has no experience with" a requirement unless the CV explicitly establishes that fact.
- Gap severity reflects the importance of the unevidenced JD requirement to this application, not certainty about the candidate's real-world qualifications.
- "critical": only mandatory licenses, certifications, legal requirements, explicitly mandatory qualifications, or explicitly required experience/requirements that could reasonably prevent consideration.
- "important": meaningful missing requirements, skills, responsibilities, tools, or experience that materially reduce fit but are not clear deal-breakers.
- "minor": lower-impact preferences, nice-to-haves, or relatively small alignment improvements.
- Max 5 gaps.

RECOMMENDATION RULES:
- Recommendations must be practical, truthful, and reflect uncertainty when the CV is silent.
- Never assume that an unevidenced qualification, license, certification, skill, tool, or experience is definitely absent outside the CV.
- For an unevidenced license, certification, or qualification: if the candidate holds it, recommend adding it prominently to the CV; if the CV does not establish whether they hold it, recommend verifying whether they meet the requirement; if they do not hold it, clearly state that it remains a qualification gap and may affect eligibility. Do not assume that obtaining it is feasible, quick, or necessarily the appropriate next action.
- For an unevidenced skill or tool: recommend adding specific CV evidence if the candidate has it; otherwise identify it as a genuine development gap.
- For unevidenced years or duration of experience: state that the CV does not demonstrate the required duration; recommend making it explicit if supported, otherwise note that the qualification gap remains.
- Never recommend falsely claiming a qualification, adding unsupported experience, inventing metrics, pretending to know a tool, or hiding or misrepresenting a mandatory qualification gap.
- When a requirement cannot legitimately be addressed through clearer CV evidence, say so.`;
      const text = await callGateway({
        system,
        user: `${contextBlock(input)}\n\nJSON only.`,
        maxTokens: 512,
        json: true,
        temperature: 0,
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
      const system = `Compare the job description's required/preferred terms against the candidate's CV.

In addition to extracting matched and missing requirements, identify up to 6 CV bullet points that could be improved for clarity, relevance, or ATS alignment WITHOUT changing the underlying facts.

Return STRICT JSON only, no prose, no markdown fences:

{
  "matchedKeywords": ["...", max 12],
  "missingKeywords": ["...", max 12],
  "suggestedRewrites": [
    {
      "original": "<exact line/bullet from candidate's CV>",
      "targetKeywords": ["<JD-relevant term that is factually supported by the CV and relevant to this rewrite>"],
      "suggested": "<factual rewrite using only CV-supported evidence>"
    }
  ]
}

Rules:

- Prioritize hard requirements first: licenses/certifications, named tools, languages, frameworks, years of experience.

- Treat the candidate's CV as the sole source of truth for every claim about the candidate. The job description describes the employer's requirements; it may guide relevance, emphasis, terminology, and prioritization, but it is NOT evidence that the candidate possesses a requirement.

- Only include a term in matchedKeywords if the JD requires or prefers it and its underlying factual meaning is clearly supported by the CV, even if the CV uses factually equivalent wording rather than the literal term.

- Only include a term in missingKeywords if the JD requires or prefers it and its underlying factual meaning is not supported by the CV.

- Missing must remain missing. Never insert a missing or otherwise unsupported JD skill or keyword into suggestedRewrites, and never imply that the candidate possesses it.

- targetKeywords may contain only JD-relevant terms whose underlying factual meaning is already supported by the candidate's CV and is relevant to that specific rewrite. It must never contain missing skills to insert, unsupported JD keywords, or inferred candidate qualifications.

- Each item in suggestedRewrites MUST use an actual phrase/bullet from the CV as "original".

- A suggested rewrite must preserve the original evidence's factual meaning, level of responsibility, scope, seniority, and outcome.

- Never invent, add, infer, or exaggerate unsupported skills, responsibilities, tools/software, certifications, licenses, degrees, job titles, employers, achievements, metrics/numbers/percentages, volumes/frequency, duration/years of experience, leadership/seniority, scope of responsibility, or outcomes/impact.

- Do not turn participation or assistance into ownership, leadership, or sole responsibility.

- JD terminology may be used only when it is a clearer or more standard, factually equivalent description of activity already evidenced by the CV.

Example:
CV evidence:
"Helped patients understand how to take their medicines correctly."

JD terminology:
"Medication counselling"

Using "medication counselling" is acceptable because the underlying activity is already supported.

But:
CV evidence:
"Provided medication counselling."

JD requirement:
"Immunization services"

Do NOT add "immunization" because that activity is not evidenced by the CV.

- Rewrites may improve only:
  - clarity
  - conciseness
  - action-oriented wording
  - professional phrasing
  - relevance/emphasis
  - ATS terminology that is factually equivalent to existing CV evidence

- If a safe improvement would require unsupported information, either provide a conservative wording-only improvement or omit that rewrite.

- Prefer high-value rewrites over filling the quota. Return fewer than 6 if only a smaller number are genuinely worth improving.

- Do not rewrite already strong bullets unless the rewrite provides a clear improvement in relevance or clarity.`;
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
      const system = `Write a highly tailored cover letter for the candidate applying to the job described in the context. Write in first person.${toneLine}

Target approximately 220-300 words. Prioritize relevance and substance over reaching a specific word count.

ROLE AND COMPANY IDENTIFICATION:
- Use the explicit JOB TITLE and COMPANY fields when provided.
- If either field is unspecified, infer it from the job description only when it is clearly stated.
- Never invent, guess, or embellish the role or company.
- If the role cannot be established, refer naturally to "this role", "the position", or "this opportunity" rather than inventing a title.
- If the company cannot be established, write naturally without naming one. Do not insert placeholders, fabricate a company, or force awkward substitutes such as "your organization".

FACTUAL INTEGRITY:
- Treat the candidate's CV as the sole source of truth about the candidate. The job description describes what the employer wants; it is NOT evidence about what the candidate has done.
- Never invent, infer, exaggerate, or imply unsupported skills, responsibilities, tools/software, certifications, licenses, degrees, employers, job titles, achievements, metrics/numbers, years of experience, leadership, scope of responsibility, or outcomes/impact.
- Do not convert related experience into experience the candidate does not actually have.
- Do not claim that the candidate meets a requirement merely because it appears in the job description.
- Never invent or imply unsupported facts about the employer, including its culture, mission, values, products, team, working environment, or priorities. Refer to employer information only when explicitly supported by the provided job context.

TAILORING:
- Before writing, identify the 2-3 most important requirements or responsibilities in THIS job description, then select the strongest explicit CV evidence relevant to them.
- Build the letter around those concrete CV-to-JD connections. It must explain why this candidate makes sense for THIS role, not merely summarize the CV.
- Prioritize concrete evidence, role-specific reasoning, and relevant experience, projects, or skills over generic claims.
- When a JD requirement is not evidenced by the CV, do not pretend the candidate possesses it, insert it into the letter, or unnecessarily advertise every weakness. Normally build the strongest truthful case around supported alignment.
- If an important unevidenced requirement genuinely needs acknowledgment to avoid misleading wording, address it briefly and conservatively without speculating about whether the candidate possesses it outside the CV.
- Do not keyword-stuff, copy JD sentences unnecessarily, or repeat CV bullets without explaining their relevance.

STRUCTURE:
- Opening: use the role and company only as resolved by the identification rules above; give a concise, specific reason the candidate is relevant; avoid generic openings such as "I am writing to express my interest..."
- Body: build the argument around 2-3 specific pieces of CV evidence and explain their relevance; do not merely repeat CV bullets; prefer evidence and connection over generic adjectives.
- Closing: briefly reinforce the candidate's potential contribution and end confidently and professionally; avoid clichés such as "I look forward to hearing from you."

STYLE:
- Sound like a capable human applicant rather than an AI-generated template.
- Be concise, specific, natural, and professional.
- Prefer concrete evidence and role-specific reasoning over generic enthusiasm or confidence.
- Stock phrases such as "make a difference", "strong candidate", "leverage my skills", "excited about the opportunity", or "make a positive impact" may be used only when the surrounding sentence adds specific, credible substance; never use them as filler.
- Vary sentence structure and avoid beginning too many consecutive sentences with "I".
- Avoid inflated formality, excessive adjectives, exaggerated confidence, excessive enthusiasm, employer flattery, buzzwords, corporate clichés, repetition, generic filler, and summarizing the entire CV.
- Use plain text only. Do not use markdown, headings, or placeholders such as [Company Name].
- Return ONLY the finished cover letter.`;
      return await callGateway({
        system,
        user: `${contextBlock(input)}\n\nWrite the cover letter.`,
        maxTokens: 1280,
        json: false,
      });
    },

  };
}
