export interface TailorInput {
  cvText: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
}

export type GapSeverity = "critical" | "important" | "minor";

export interface MatchGap {
  issue: string;
  severity: GapSeverity;
  recommendation: string;
}

export interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  weaknesses?: string[];
  gaps?: MatchGap[];
}

export interface BulletRewrite {
  original: string;
  suggested: string;
  targetKeywords: string[];
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedRewrites?: BulletRewrite[];
}

export type CoverLetterTone = "formal" | "warm" | "confident";

export interface AIProvider {
  name: string;
  model: string;
  analyzeMatch(input: TailorInput): Promise<MatchAnalysis>;
  extractKeywords(input: TailorInput): Promise<KeywordAnalysis>;
  generateCoverLetter(input: TailorInput, tone?: CoverLetterTone): Promise<string>;
}

