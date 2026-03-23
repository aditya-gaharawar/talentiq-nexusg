import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
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

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container py-8">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground"><span className="gradient-text">{org}</span> Recruiter Hub</h1>
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
              <div className="glass rounded-xl p-5 hover:glow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={16} className="text-primary" />
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                </div>
                <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Candidate Ranking */}
        <AnimatedSection className="mb-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> AI Candidate Ranking
            </h3>
            {candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Rank</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Name</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Skills</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Match</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                        className="border-b border-border/50 transition-colors"
                      >
                        <td className="py-3 px-2 text-primary font-heading font-bold text-sm">#{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {c.name[0]}
                            </div>
                            <span className="text-foreground text-sm font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground text-xs max-w-[200px] truncate">{c.skills}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full gradient-primary" style={{ width: `${c.score}%` }} />
                            </div>
                            <span className="text-primary text-xs font-semibold">{c.score}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={c.status}
                            onChange={e => handleStatusChange(c.id, e.target.value)}
                            className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-foreground border-none outline-none cursor-pointer"
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No applications received yet. Post a job to start receiving candidates.</p>
            )}
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hiring Funnel */}
          <AnimatedSection>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Hiring Funnel
              </h3>
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {funnelData.map((s) => (
                    <div key={s.stage} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs w-20">{s.stage}</span>
                      <div className="flex-1 h-6 rounded-lg bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-lg gradient-primary"
                        />
                      </div>
                      <span className="text-foreground text-xs font-semibold w-10">{s.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
              )}
            </div>
          </AnimatedSection>

          {/* Skill Distribution */}
          <AnimatedSection delay={0.1}>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Candidate Skill Distribution</h3>
              {skillDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={skillDist}>
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(263, 70%, 50%)" />
                        <stop offset="100%" stopColor="hsl(187, 72%, 42%)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="count" fill="url(#rg)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No candidate data yet</p>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
