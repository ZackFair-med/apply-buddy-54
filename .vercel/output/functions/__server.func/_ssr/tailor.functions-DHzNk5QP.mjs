import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B3XILrvZ.mjs";
import { i as objectType, n as enumType, o as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { n as logNonFatal } from "./errors-CRpvjv8q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tailor.functions-DHzNk5QP.js
/**
* Uses Lovable AI Gateway (OpenAI-compatible) to call Google Gemini models.
* Split into three focused calls so we only spend tokens on what the user asks for.
*/
function createGeminiProvider(apiKey, model = "google/gemini-2.5-flash") {
	const gatewayKey = process.env.LOVABLE_API_KEY;
	const useGateway = Boolean(gatewayKey);
	const gatewayModel = model.includes("/") ? model : `google/${model}`;
	const FALLBACK_GOOGLE_MODEL = "gemini-flash-latest";
	const googleModel = process.env.AI_MODEL ? process.env.AI_MODEL.split("/").pop() : FALLBACK_GOOGLE_MODEL;
	async function callGoogle(opts) {
		const body = JSON.stringify({
			systemInstruction: { parts: [{ text: opts.system }] },
			contents: [{
				role: "user",
				parts: [{ text: opts.user }]
			}],
			generationConfig: {
				temperature: .4,
				maxOutputTokens: opts.maxTokens,
				...opts.json ? { responseMimeType: "application/json" } : {}
			}
		});
		async function request(modelId) {
			return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-goog-api-key": apiKey
				},
				body
			});
		}
		let res = await request(googleModel);
		if (res.status === 404 && googleModel !== FALLBACK_GOOGLE_MODEL) {
			console.warn(`AI model "${googleModel}" unavailable for this key; falling back to "${FALLBACK_GOOGLE_MODEL}".`);
			res = await request(FALLBACK_GOOGLE_MODEL);
		}
		if (!res.ok) {
			const t = await res.text();
			if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
			if (res.status === 401 || res.status === 403) throw new Error("AI key rejected by Google. Check AI_API_KEY in your deployment environment (it must be a Google AI Studio key with the Generative Language API enabled).");
			if (res.status === 404) throw new Error(`AI model not available for this key. Remove AI_MODEL or set it to "${FALLBACK_GOOGLE_MODEL}".`);
			throw new Error(`AI error ${res.status}: ${t.slice(0, 300)}`);
		}
		const text = (await res.json()).candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
		if (!text) throw new Error("AI returned empty response. Try again.");
		return text;
	}
	async function callGateway(opts) {
		if (!useGateway) return callGoogle(opts);
		const body = {
			model: gatewayModel,
			messages: [{
				role: "system",
				content: opts.system
			}, {
				role: "user",
				content: opts.user
			}],
			temperature: .4,
			max_tokens: opts.maxTokens
		};
		if (opts.json) body.response_format = { type: "json_object" };
		const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"Lovable-API-Key": gatewayKey
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			const t = await res.text();
			if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
			if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Plans & credits.");
			throw new Error(`AI error ${res.status}: ${t.slice(0, 300)}`);
		}
		const data = await res.json();
		const text = data.choices?.[0]?.message?.content ?? "";
		if (!text) {
			console.error("AI empty response", JSON.stringify(data).slice(0, 500));
			throw new Error("AI returned empty response. Try again.");
		}
		return text;
	}
	function parseJson(text) {
		try {
			const trimmed = text.trim();
			const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
			const jsonText = jsonMatch ? jsonMatch[1] : trimmed;
			return JSON.parse(jsonText);
		} catch (e) {
			console.error("AI non-JSON response:", text.slice(0, 500));
			throw new Error(`AI returned invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`);
		}
	}
	function contextBlock(input) {
		const cvPreview = input.cvText.length > 3e3 ? input.cvText.slice(0, 3e3) + "\n[... CV truncated for performance ...]" : input.cvText;
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
			const p = parseJson(await callGateway({
				system: `Score CV vs job description. Return STRICT JSON:
{"matchScore": 0-100, "strengths": ["bullet1", "bullet2"], "weaknesses": ["bullet1", "bullet2"]}`,
				user: `${contextBlock(input)}\n\nJSON only.`,
				maxTokens: 512,
				json: true
			}));
			return {
				matchScore: Math.max(0, Math.min(100, Number(p.matchScore ?? 0))),
				strengths: (Array.isArray(p.strengths) ? p.strengths : []).slice(0, 5),
				weaknesses: (Array.isArray(p.weaknesses) ? p.weaknesses : []).slice(0, 5)
			};
		},
		async extractKeywords(input) {
			const p = parseJson(await callGateway({
				system: `Extract skills from JD vs CV. Return STRICT JSON:
{"matchedKeywords": ["skill1", "skill2"], "missingKeywords": ["skill1", "skill2"]}
Max 12 each. Focus: tools, languages, frameworks, certifications.`,
				user: `${contextBlock(input)}\n\nJSON only.`,
				maxTokens: 384,
				json: true
			}));
			return {
				matchedKeywords: (Array.isArray(p.matchedKeywords) ? p.matchedKeywords : []).slice(0, 12),
				missingKeywords: (Array.isArray(p.missingKeywords) ? p.missingKeywords : []).slice(0, 12)
			};
		},
		async generateCoverLetter(input, tone) {
			return await callGateway({
				system: `Write a concise, tailored cover letter (320-380 words) in first person.${tone === "formal" ? " Professional, respectful tone." : tone === "warm" ? " Warm, genuine, enthusiastic tone." : tone === "confident" ? " Confident, impactful, ownership-focused tone." : ""} Plain text only.`,
				user: `${contextBlock(input)}\n\nWrite the cover letter.`,
				maxTokens: 1280,
				json: false
			});
		}
	};
}
/**
* Uses Groq Cloud API for ultra-fast LLM inference.
* Groq models: groq/llama-3.1-70b-versatile, groq/mixtral-8x7b-32768, etc.
*/
function createGroqProvider(apiKey, model = "groq/llama-3.1-70b-versatile") {
	const modelId = model.includes("/") ? model.split("/")[1] : model;
	async function callGroq(opts) {
		const body = JSON.stringify({
			model: modelId,
			messages: [{
				role: "system",
				content: opts.system
			}, {
				role: "user",
				content: opts.user
			}],
			temperature: .4,
			max_tokens: opts.maxTokens,
			...opts.json ? { response_format: { type: "json_object" } } : {}
		});
		const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"authorization": `Bearer ${apiKey}`
			},
			body
		});
		if (!res.ok) {
			const t = await res.text();
			if (res.status === 429) throw new Error("Groq rate limit reached. Try again in a moment.");
			if (res.status === 401 || res.status === 403) throw new Error("Groq API key rejected. Check AI_API_KEY in your deployment environment (must be a valid Groq Cloud API key).");
			throw new Error(`Groq error ${res.status}: ${t.slice(0, 300)}`);
		}
		const data = await res.json();
		const text = data.choices?.[0]?.message?.content ?? "";
		if (!text) {
			console.error("Groq empty response", JSON.stringify(data).slice(0, 500));
			throw new Error("Groq returned empty response. Try again.");
		}
		return text;
	}
	function parseJson(text) {
		try {
			const trimmed = text.trim();
			const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
			const jsonText = jsonMatch ? jsonMatch[1] : trimmed;
			return JSON.parse(jsonText);
		} catch (e) {
			console.error("Groq non-JSON response:", text.slice(0, 500));
			throw new Error(`Groq returned invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`);
		}
	}
	function contextBlock(input) {
		const cvPreview = input.cvText.length > 3e3 ? input.cvText.slice(0, 3e3) + "\n[... CV truncated for performance ...]" : input.cvText;
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
			const p = parseJson(await callGroq({
				system: `You are scoring how well a candidate's CV matches a specific job description.

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
- Do not invent or assume qualifications not present in the CV text.`,
				user: `${contextBlock(input)}\n\nJSON only.`,
				maxTokens: 512,
				json: true
			}));
			return {
				matchScore: Math.max(0, Math.min(100, Number(p.matchScore ?? 0))),
				strengths: (Array.isArray(p.strengths) ? p.strengths : []).slice(0, 5),
				weaknesses: (Array.isArray(p.weaknesses) ? p.weaknesses : []).slice(0, 5)
			};
		},
		async extractKeywords(input) {
			const p = parseJson(await callGroq({
				system: `Compare the job description's required/preferred terms against the CV.

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
  unless the JD names it as an explicit requirement.`,
				user: `${contextBlock(input)}\n\nJSON only.`,
				maxTokens: 384,
				json: true
			}));
			return {
				matchedKeywords: (Array.isArray(p.matchedKeywords) ? p.matchedKeywords : []).slice(0, 12),
				missingKeywords: (Array.isArray(p.missingKeywords) ? p.missingKeywords : []).slice(0, 12)
			};
		},
		async generateCoverLetter(input, tone) {
			return await callGroq({
				system: `Write a tailored cover letter in first person, 320-380 words, plain text only
(no markdown, no placeholders like [Company Name]).${tone === "formal" ? " Professional, respectful tone." : tone === "warm" ? " Warm, genuine, enthusiastic tone." : tone === "confident" ? " Confident, impactful, ownership-focused tone." : ""}

Rules:
- Open by naming the actual role and company from the context.
- Ground every claim in the CANDIDATE CV text — never invent credentials,
  licenses, employers, or years of experience not present in the CV.
- Connect 2-3 specific CV details to specific requirements in the job
  description.
- End with a direct, confident closing line — skip "I look forward to
  hearing from you."`,
				user: `${contextBlock(input)}\n\nWrite the cover letter.`,
				maxTokens: 1280,
				json: false
			});
		}
	};
}
/**
* Returns an AI provider based on env vars.
*   AI_PROVIDER=gemini (default)
*   AI_API_KEY=<key>
*   AI_MODEL=<optional override>
*/
function getAIProvider() {
	const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
	const apiKey = process.env.AI_API_KEY;
	if (!apiKey) throw new Error("AI_API_KEY is not configured");
	switch (provider) {
		case "gemini": return createGeminiProvider(apiKey, process.env.AI_MODEL || void 0);
		case "groq": return createGroqProvider(apiKey, process.env.AI_MODEL || void 0);
		default: throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
	}
}
var inputSchema = objectType({
	cvId: stringType().uuid(),
	jobDescription: stringType().min(30).max(3e4),
	jobTitle: stringType().max(200).optional(),
	company: stringType().max(200).optional(),
	jobId: stringType().uuid().optional()
});
var letterInputSchema = inputSchema.extend({ tone: enumType([
	"formal",
	"warm",
	"confident"
]).optional() });
async function loadContext(supabase, data) {
	const { data: cv, error } = await supabase.from("cvs").select("id, parsed_text, parse_error, label").eq("id", data.cvId).maybeSingle();
	if (error) throw new Error(error.message);
	if (!cv) throw new Error("CV not found");
	if (!cv.parsed_text) throw new Error(`CV text not available${cv.parse_error ? `: ${cv.parse_error}` : ". Re-upload the file."}`);
	return {
		cvText: cv.parsed_text,
		jobDescription: data.jobDescription,
		jobTitle: data.jobTitle,
		company: data.company
	};
}
async function upsertSession(supabase, userId, data, patch, provider) {
	const { data: existing, error: lookupError } = await supabase.from("tailor_sessions").select("id").eq("user_id", userId).eq("cv_id", data.cvId).eq("job_description", data.jobDescription).order("created_at", { ascending: false }).limit(1).maybeSingle();
	if (lookupError) {
		logNonFatal("tailor.upsertSession.lookup", lookupError);
		return;
	}
	const { error: writeError } = existing?.id ? await supabase.from("tailor_sessions").update(patch).eq("id", existing.id) : await supabase.from("tailor_sessions").insert({
		user_id: userId,
		cv_id: data.cvId,
		job_id: data.jobId ?? null,
		job_description: data.jobDescription,
		provider: provider.name,
		model: provider.model,
		...patch
	});
	if (writeError) logNonFatal("tailor.upsertSession.write", writeError);
}
async function guardLimit(supabase, userId, task) {
	const { enforceAiLimit, LimitReachedError } = await import("./usage.server-DuYUCagG.mjs");
	try {
		await enforceAiLimit(supabase, userId, task);
		return null;
	} catch (e) {
		if (e instanceof LimitReachedError || e instanceof Error && e.message.startsWith("LIMIT_REACHED")) return {
			limitReached: true,
			feature: task,
			message: e.message
		};
		if (!(e instanceof Error)) return {
			limitReached: true,
			feature: task,
			message: "Limit reached"
		};
		throw e;
	}
}
var analyzeMatch_createServerFn_handler = createServerRpc({
	id: "4abacc882bd13bcdc7a0a5dcb68d2f908b598dee19711ba74816a9bf895ce960",
	name: "analyzeMatch",
	filename: "src/lib/tailor.functions.ts"
}, (opts) => analyzeMatch.__executeServer(opts));
var analyzeMatch = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(analyzeMatch_createServerFn_handler, async ({ data, context }) => {
	const limited = await guardLimit(context.supabase, context.userId, "match_score");
	if (limited) return limited;
	const { logUsage } = await import("./usage.server-DuYUCagG.mjs");
	const input = await loadContext(context.supabase, data);
	const provider = getAIProvider();
	const result = await provider.analyzeMatch(input);
	await upsertSession(context.supabase, context.userId, data, {
		match_score: result.matchScore,
		strengths: result.strengths,
		weaknesses: result.weaknesses
	}, provider);
	const { error: historyError } = await context.supabase.from("match_history").insert({
		user_id: context.userId,
		cv_id: data.cvId,
		job_id: data.jobId ?? null,
		job_title: data.jobTitle ?? null,
		company: data.company ?? null,
		match_score: result.matchScore,
		strengths: result.strengths,
		weaknesses: result.weaknesses
	});
	if (historyError) logNonFatal("tailor.matchHistory", historyError);
	await logUsage(context.supabase, context.userId, "match_score");
	return result;
});
var extractKeywords_createServerFn_handler = createServerRpc({
	id: "8ca2404dc8aefb21eebf56d676fd57337f9420879476ad174be364776cfe7a32",
	name: "extractKeywords",
	filename: "src/lib/tailor.functions.ts"
}, (opts) => extractKeywords.__executeServer(opts));
var extractKeywords = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(extractKeywords_createServerFn_handler, async ({ data, context }) => {
	const limited = await guardLimit(context.supabase, context.userId, "keywords");
	if (limited) return limited;
	const { logUsage } = await import("./usage.server-DuYUCagG.mjs");
	const input = await loadContext(context.supabase, data);
	const provider = getAIProvider();
	const result = await provider.extractKeywords(input);
	await upsertSession(context.supabase, context.userId, data, {
		matched_keywords: result.matchedKeywords,
		missing_keywords: result.missingKeywords
	}, provider);
	await logUsage(context.supabase, context.userId, "keywords");
	return result;
});
var generateCoverLetter_createServerFn_handler = createServerRpc({
	id: "db1ed20c317dc9f90eff319ec6aa929a298d1332e777ffd1bdd52a5215228f82",
	name: "generateCoverLetter",
	filename: "src/lib/tailor.functions.ts"
}, (opts) => generateCoverLetter.__executeServer(opts));
var generateCoverLetter = createServerFn({ method: "POST" }).validator((d) => letterInputSchema.parse(d)).middleware([requireSupabaseAuth]).handler(generateCoverLetter_createServerFn_handler, async ({ data, context }) => {
	const limited = await guardLimit(context.supabase, context.userId, "cover_letter");
	if (limited) return limited;
	const { logUsage } = await import("./usage.server-DuYUCagG.mjs");
	let tone = data.tone;
	if (tone) {
		const { data: profile, error: profileError } = await context.supabase.from("profiles").select("plan").eq("id", context.userId).maybeSingle();
		if (profileError) throw new Error(profileError.message);
		if (profile?.plan !== "paid") tone = void 0;
	}
	const input = await loadContext(context.supabase, data);
	const provider = getAIProvider();
	const coverLetter = await provider.generateCoverLetter(input, tone);
	await upsertSession(context.supabase, context.userId, data, { cover_letter: coverLetter }, provider);
	await logUsage(context.supabase, context.userId, "cover_letter");
	return { coverLetter };
});
//#endregion
export { analyzeMatch_createServerFn_handler, extractKeywords_createServerFn_handler, generateCoverLetter_createServerFn_handler };
