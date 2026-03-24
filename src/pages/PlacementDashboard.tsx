import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { School, BarChart3, TrendingUp, Users, Award, Download, Activity, Briefcase, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
    { name: "placed", value: data.placedStudents },
    { name: "active", value: Math.max(0, data.totalStudents - data.placedStudents) },
  ];

  const chartConfig = {
    rate: {
      label: "Rate %",
      color: "hsl(var(--primary))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
    placed: {
      label: "Placed",
      color: "hsl(var(--primary))",
    },
    active: {
      label: "Active",
      color: "hsl(var(--muted))",
    },
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container py-8">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground"><span className="text-primary">{org}</span> Placement Cell</h1>
              <p className="text-muted-foreground text-sm">Real-time placement analytics & predictions</p>
            </div>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" /> Export Report
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
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={16} className="text-primary" />
                    <span className="text-muted-foreground text-xs">{s.label}</span>
                  </div>
                  <p className="font-heading font-bold text-xl text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Dept Performance */}
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" /> Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.deptStats.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart data={data.deptStats}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="dept" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No department data yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Skill Demand */}
          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Skill Demand Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                {data.skillDemand.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <BarChart data={data.skillDemand} layout="vertical">
                      <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={80} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No skill data yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Salary Distribution */}
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.salaryDistribution.map((s) => {
                  const maxCount = Math.max(...data.salaryDistribution.map(d => d.count), 1);
                  return (
                    <div key={s.range} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span>{s.range}</span>
                        <span>{s.count} Students</span>
                      </div>
                      <Progress value={(s.count / maxCount) * 100} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Placement Funnel */}
          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Application Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.funnelData.map((s) => (
                  <div key={s.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span>{s.stage}</span>
                      <span>{s.count.toLocaleString()}</span>
                    </div>
                    <Progress value={s.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Placement Status Pie */}
          <AnimatedSection delay={0.2}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Placement Status</CardTitle>
              </CardHeader>
              <CardContent>
                {data.totalStudents > 0 ? (
                  <div className="flex flex-col items-center">
                    <ChartContainer config={chartConfig} className="h-[140px] w-full">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={readinessData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="var(--color-placed)" />
                          <Cell fill="var(--color-active)" />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {readinessData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.name === "placed" ? "hsl(var(--primary))" : "hsl(var(--muted))" }} />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No students registered yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Real-Time Activity & Online Users */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Live Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {recentActivity.map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/5 text-[11px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-muted-foreground font-medium w-12">
                          {new Date(a.applied_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-foreground flex-1 truncate">
                          Applied for <span className="font-semibold">{a.job?.job_role || "—"}</span>
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 h-4 font-semibold">
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No activity yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users size={16} className="text-primary" /> Online Users
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[9px] font-bold">{onlineSessions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {onlineSessions.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {onlineSessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-foreground font-medium capitalize">{s.role}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {new Date(s.last_active_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No users online</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
