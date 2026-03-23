import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  avgSalary: number;
  totalJobs: number;
  totalApplications: number;
  deptStats: { dept: string; total: number; placed: number; rate: number }[];
  salaryDistribution: { range: string; count: number }[];
  funnelData: { stage: string; count: number; pct: number }[];
  skillDemand: { skill: string; count: number }[];
  onlineUsers: number;
  todayApplications: number;
}

export const usePlacementAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalStudents: 0, placedStudents: 0, placementRate: 0, avgSalary: 0,
    totalJobs: 0, totalApplications: 0, deptStats: [], salaryDistribution: [],
    funnelData: [], skillDemand: [], onlineUsers: 0, todayApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Fetch all data in parallel
      const [
        { data: students },
        { data: placements },
        { data: jobs },
        { data: applications },
        { data: sessions },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "student"),
        supabase.from("placements").select("*"),
        supabase.from("jobs").select("*"),
        supabase.from("applications").select("*"),
        supabase.from("user_sessions").select("*").eq("status", "online"),
      ]);

      const totalStudents = students?.length || 0;
      const placedStudents = placements?.length || 0;
      const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
      const avgSalary = placements && placements.length > 0
        ? Math.round(placements.reduce((sum, p) => sum + Number(p.salary || 0), 0) / placements.length)
        : 0;

      // Department stats
      const deptMap = new Map<string, { total: number; placed: number }>();
      students?.forEach(s => {
        const dept = (s as any).department || "Other";
        const entry = deptMap.get(dept) || { total: 0, placed: 0 };
        entry.total++;
        deptMap.set(dept, entry);
      });
      placements?.forEach(p => {
        const dept = p.department || "Other";
        const entry = deptMap.get(dept) || { total: 0, placed: 0 };
        entry.placed++;
        deptMap.set(dept, entry);
      });
      const deptStats = Array.from(deptMap.entries()).map(([dept, v]) => ({
        dept, total: v.total, placed: v.placed,
        rate: v.total > 0 ? Math.round((v.placed / v.total) * 100) : 0,
      }));

      // Salary distribution
      const salaryRanges = [
        { range: "0-3L", min: 0, max: 300000 },
        { range: "3-5L", min: 300000, max: 500000 },
        { range: "5-8L", min: 500000, max: 800000 },
        { range: "8-12L", min: 800000, max: 1200000 },
        { range: "12-20L", min: 1200000, max: 2000000 },
        { range: "20L+", min: 2000000, max: Infinity },
      ];
      const salaryDistribution = salaryRanges.map(r => ({
        range: r.range,
        count: placements?.filter(p => Number(p.salary || 0) >= r.min && Number(p.salary || 0) < r.max).length || 0,
      }));

      // Application funnel
      const allApps = applications || [];
      const funnelData = [
        { stage: "Applied", count: allApps.length, pct: 100 },
        { stage: "Shortlisted", count: allApps.filter(a => ["shortlisted", "interview", "offer"].includes(a.status)).length, pct: 0 },
        { stage: "Interview", count: allApps.filter(a => ["interview", "offer"].includes(a.status)).length, pct: 0 },
        { stage: "Offer", count: allApps.filter(a => a.status === "offer").length, pct: 0 },
      ];
      funnelData.forEach(f => { f.pct = allApps.length > 0 ? Math.round((f.count / allApps.length) * 100) : 0; });

      // Skill demand from jobs
      const skillCount = new Map<string, number>();
      jobs?.forEach(j => {
        ((j as any).required_skills || []).forEach((s: string) => {
          skillCount.set(s, (skillCount.get(s) || 0) + 1);
        });
      });
      const skillDemand = Array.from(skillCount.entries())
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Today's applications
      const today = new Date().toISOString().split("T")[0];
      const todayApplications = allApps.filter(a => a.applied_date?.startsWith(today)).length;

      setData({
        totalStudents, placedStudents, placementRate, avgSalary,
        totalJobs: jobs?.length || 0,
        totalApplications: allApps.length,
        deptStats, salaryDistribution, funnelData, skillDemand,
        onlineUsers: sessions?.length || 0,
        todayApplications,
      });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    // Subscribe to realtime changes on key tables
    const channel = supabase
      .channel("analytics_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "placements" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_sessions" }, () => fetchAnalytics())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { data, loading, refetch: fetchAnalytics };
};
