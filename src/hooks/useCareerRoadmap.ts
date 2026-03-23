import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RoadmapStep {
  label: string;
  description: string;
  done: boolean;
}

export interface Roadmap {
  steps: RoadmapStep[];
  advice: string;
}

export const useCareerRoadmap = () => {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const generateRoadmap = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {});
      if (error) throw error;
      if (data?.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error("Roadmap generation error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateRoadmap, loading, roadmap };
};
