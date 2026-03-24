import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { useMyJobs } from "@/hooks/useJobs";
import { useRecruiterApplications } from "@/hooks/useApplications";
import PostJobDialog from "@/components/PostJobDialog";
import { calculateSkillMatch } from "@/lib/skillEngine";
import { toast } from "sonner";

const statusOptions = ["applied", "shortlisted", "interview", "offer", "rejected"];

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const org = user?.user_metadata?.organization || "Company";
  const { jobs } = useMyJobs();
  const { applications, updateStatus } = useRecruiterApplications();

  // Build hiring funnel from real data
  const funnelData = [
    { stage: "Applied", count: applications.length, pct: 100 },
    { stage: "Shortlisted", count: applications.filter(a => ["shortlisted", "interview", "offer"].includes(a.status)).length, pct: 0 },
    { stage: "Interview", count: applications.filter(a => ["interview", "offer"].includes(a.status)).length, pct: 0 },
    { stage: "Hired", count: applications.filter(a => a.status === "offer").length, pct: 0 },
  ];
  funnelData.forEach(f => { f.pct = applications.length > 0 ? Math.round((f.count / applications.length) * 100) : 0; });

  // Skill distribution from candidates
  const skillCount = new Map<string, number>();
  applications.forEach(a => {
    (a.student?.skills || []).forEach((s: string) => {
      skillCount.set(s, (skillCount.get(s) || 0) + 1);
    });
  });
  const skillDist = Array.from(skillCount.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Calculate match scores
  const candidates = applications.map(app => {
    const jobRequiredSkills = jobs.find(j => j.id === app.job_id)?.required_skills || [];
    const { matchScore } = calculateSkillMatch(app.student?.skills || [], jobRequiredSkills);
    return {
      ...app,
      name: app.student?.full_name || "Unknown",
      skills: (app.student?.skills || []).join(", "),
      score: matchScore,
      cgpa: app.student?.cgpa || 0,
    };
  }).sort((a, b) => b.score - a.score);

  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / candidates.length)
    : 0;

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const error = await updateStatus(appId, newStatus);
    if (!error) toast.success(`Status updated to ${newStatus}`);
    else toast.error("Failed to update status");
  };

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container py-8">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground"><span className="text-primary">{org}</span> Recruiter Hub</h1>
              <p className="text-muted-foreground text-sm">AI-powered candidate intelligence</p>
            </div>
            <PostJobDialog />
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Candidates", value: String(candidates.length) },
            { icon: Target, label: "Avg Match Score", value: `${avgScore}%` },
            { icon: Calendar, label: "Active Jobs", value: String(jobs.filter(j => j.status === "active").length) },
            { icon: TrendingUp, label: "Offer Rate", value: applications.length > 0 ? `${Math.round((applications.filter(a => a.status === "offer").length / applications.length) * 100)}%` : "0%" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <Card className="border-border/40 shadow-sm transition-all hover:shadow-md group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={16} className="text-primary" />
                    <span className="text-muted-foreground text-xs">{s.label}</span>
                  </div>
                  <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Candidate Ranking */}
        <AnimatedSection className="mb-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users size={16} className="text-primary" /> AI Candidate Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Skills</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((c, i) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-heading font-bold text-sm text-primary">#{i + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                {c.name[0]}
                              </div>
                              <span className="text-foreground text-sm font-medium">{c.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-[11px] max-w-[200px] truncate">{c.skills}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={c.score} className="w-12 h-1.5" />
                              <span className="text-primary text-[11px] font-bold">{c.score}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <select
                              value={c.status}
                              onChange={e => handleStatusChange(c.id, e.target.value)}
                              className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted text-foreground border-none outline-none cursor-pointer hover:bg-muted/80 transition-colors capitalize"
                            >
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-8 italic">No applications received yet. Post a job to start receiving candidates.</p>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hiring Funnel */}
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" /> Hiring Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {funnelData.map((s) => (
                      <div key={s.stage} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span>{s.stage}</span>
                          <span>{s.count} Candidates</span>
                        </div>
                        <Progress value={s.pct} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No data yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Skill Distribution */}
          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Candidate Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {skillDist.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart data={skillDist}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No candidate data yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
