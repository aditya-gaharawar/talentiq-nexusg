import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { School, BarChart3, TrendingUp, Users, Award, Download, Activity, Briefcase, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { usePlacementAnalytics } from "@/hooks/usePlacementAnalytics";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const READINESS_COLORS = ["hsl(263, 70%, 50%)", "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)"];

const PlacementDashboard = () => {
  const { user } = useAuth();
  const { data, loading } = usePlacementAnalytics();
  const org = user?.user_metadata?.organization || "Institution";
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [onlineSessions, setOnlineSessions] = useState<any[]>([]);

  // Fetch recent activity (applications)
  useEffect(() => {
    const fetchActivity = async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("*, job:jobs(company_name, job_role)")
        .order("applied_date", { ascending: false })
        .limit(10);
      setRecentActivity(apps || []);
    };
    const fetchSessions = async () => {
      const { data: sessions } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("status", "online")
        .order("last_active_time", { ascending: false })
        .limit(20);
      setOnlineSessions(sessions || []);
    };
    fetchActivity();
    fetchSessions();

    const channel = supabase
      .channel("admin_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchActivity())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_sessions" }, () => fetchSessions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Student readiness based on real placement scores
  const readyCount = data.totalStudents > 0 ? Math.round((data.placedStudents / data.totalStudents) * 100) : 0;
  const readinessData = [
    { name: "Placed", value: data.placedStudents },
    { name: "Active", value: Math.max(0, data.totalStudents - data.placedStudents) },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container py-8">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground"><span className="gradient-text">{org}</span> Placement Cell</h1>
              <p className="text-muted-foreground text-sm">Real-time placement analytics & predictions</p>
            </div>
            <Button variant="hero" size="sm">
              <Download size={16} /> Export Report
            </Button>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Students", value: data.totalStudents.toLocaleString() },
            { icon: Activity, label: "Online Now", value: data.onlineUsers.toLocaleString() },
            { icon: Briefcase, label: "Active Jobs", value: data.totalJobs.toLocaleString() },
            { icon: Clock, label: "Today's Apps", value: data.todayApplications.toLocaleString() },
            { icon: Award, label: "Placement Rate", value: `${data.placementRate}%` },
            { icon: TrendingUp, label: "Avg Salary", value: data.avgSalary > 0 ? `₹${(data.avgSalary / 100000).toFixed(1)}L` : "—" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <div className="glass rounded-xl p-5 hover:glow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={16} className="text-primary" />
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                </div>
                <p className="font-heading font-bold text-xl text-foreground">{s.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Dept Performance */}
          <AnimatedSection>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Department Performance
              </h3>
              {data.deptStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.deptStats}>
                    <defs>
                      <linearGradient id="pdg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(263, 70%, 50%)" />
                        <stop offset="100%" stopColor="hsl(187, 72%, 42%)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dept" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="rate" fill="url(#pdg)" radius={[6, 6, 0, 0]} name="Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No department data yet</p>
              )}
            </div>
          </AnimatedSection>

          {/* Skill Demand */}
          <AnimatedSection delay={0.1}>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Skill Demand Heatmap</h3>
              {data.skillDemand.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.skillDemand} layout="vertical">
                    <defs>
                      <linearGradient id="sdg" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(263, 70%, 50%)" />
                        <stop offset="100%" stopColor="hsl(187, 72%, 42%)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis type="category" dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="count" fill="url(#sdg)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No skill data yet</p>
              )}
            </div>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Salary Distribution */}
          <AnimatedSection>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Salary Distribution</h3>
              <div className="space-y-3">
                {data.salaryDistribution.map((s) => {
                  const maxCount = Math.max(...data.salaryDistribution.map(d => d.count), 1);
                  return (
                    <div key={s.range} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs w-12">{s.range}</span>
                      <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(s.count / maxCount) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-full rounded gradient-primary"
                        />
                      </div>
                      <span className="text-foreground text-xs w-8">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* Placement Funnel */}
          <AnimatedSection delay={0.1}>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Application Funnel</h3>
              <div className="space-y-3">
                {data.funnelData.map((s) => (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-20">{s.stage}</span>
                    <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full rounded gradient-primary"
                      />
                    </div>
                    <span className="text-foreground text-xs w-12">{s.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Placement Status Pie */}
          <AnimatedSection delay={0.2}>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Placement Status</h3>
              {data.totalStudents > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={readinessData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                        <Cell fill="hsl(263, 70%, 50%)" />
                        <Cell fill="hsl(217, 91%, 60%)" />
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {readinessData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "hsl(263, 70%, 50%)" : "hsl(217, 91%, 60%)" }} />
                        <span className="text-muted-foreground text-xs">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No students registered yet</p>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* Real-Time Activity & Online Users */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatedSection>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity size={18} className="text-accent" /> Live Platform Activity
              </h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {recentActivity.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-xs">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-muted-foreground">
                        {new Date(a.applied_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-foreground">
                        Application for <span className="font-medium">{a.job?.job_role || "—"}</span> at {a.job?.company_name || "—"}
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        a.status === "offer" ? "bg-accent/10 text-accent" :
                        a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No activity yet</p>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users size={18} className="text-primary" /> Online Users ({onlineSessions.length})
              </h3>
              {onlineSessions.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {onlineSessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-foreground capitalize">{s.role}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Active {new Date(s.last_active_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No users online</p>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
