export interface TailorInput {
  cvText: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
}

export interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export type CoverLetterTone = "formal" | "warm" | "confident";

export interface AIProvider {
  name: string;
  model: string;
  analyzeMatch(input: TailorInput): Promise<MatchAnalysis>;
  extractKeywords(input: TailorInput): Promise<KeywordAnalysis>;
  generateCoverLetter(input: TailorInput, tone?: CoverLetterTone): Promise<string>;
}

