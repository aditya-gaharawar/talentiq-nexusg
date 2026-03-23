import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlacementStat {
  id: string;
  metric_name: string;
  metric_value: number;
  category: string;
  updated_at: string;
}

export const useRealtimeStats = (category?: string) => {
  const [stats, setStats] = useState<PlacementStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      let query = supabase.from("placement_stats").select("*");
      if (category) query = query.eq("category", category);
      const { data } = await query;
      if (data) setStats(data);
      setLoading(false);
    };

    fetchStats();

    const channel = supabase
      .channel("placement_stats_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "placement_stats" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const newStat = payload.new as PlacementStat;
            if (!category || newStat.category === category) {
              setStats((prev) => {
                const idx = prev.findIndex((s) => s.id === newStat.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = newStat;
                  return updated;
                }
                return [...prev, newStat];
              });
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [category]);

  const getStat = (name: string) => stats.find((s) => s.metric_name === name)?.metric_value;

  return { stats, loading, getStat };
};
