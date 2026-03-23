import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectDetail {
  title: string;
  technologies: string[];
  description: string;
}

export interface ImprovementSuggestion {
  category: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysis {
  detected_skills: string[];
  projects: ProjectDetail[];
  strengths: string[];
  weaknesses: string[];
  resume_score: number;
  summary: string;
  suggested_skills: string[];
  suggested_projects: string[];
  improvement_suggestions: ImprovementSuggestion[];
  sections_detected?: Record<string, boolean>;
}

export const useResumeAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const analyzeResume = async (resumeUrl: string, resumeText?: string): Promise<ResumeAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-analysis", {
        body: { resume_url: resumeUrl, resume_text: resumeText || "" },
      });
      if (error) throw error;
      if (data?.analysis) {
        setAnalysis(data.analysis);
        return data.analysis;
      }
      return null;
    } catch (e) {
      console.error("Resume analysis error:", e);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchStoredAnalysis = async (): Promise<ResumeAnalysis | null> => {
    try {
      const { data } = await supabase
        .from("resume_analysis")
        .select("*")
        .maybeSingle();
      if (data) {
        const stored: ResumeAnalysis = {
          detected_skills: (data as any).detected_skills || [],
          projects: (data as any).projects || [],
          strengths: (data as any).strengths || [],
          weaknesses: (data as any).weaknesses || [],
          resume_score: Number((data as any).resume_score) || 0,
          summary: (data as any).summary || "",
          suggested_skills: (data as any).suggested_skills || [],
          suggested_projects: (data as any).suggested_projects || [],
          improvement_suggestions: (data as any).improvement_suggestions || [],
        };
        setAnalysis(stored);
        return stored;
      }
      return null;
    } catch {
      return null;
    }
  };

  return { analyzeResume, analyzing, analysis, fetchStoredAnalysis };
};
