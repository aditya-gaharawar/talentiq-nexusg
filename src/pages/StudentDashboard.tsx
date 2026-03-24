import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Target, Route, Briefcase, TrendingUp, BookOpen, Award, ArrowRight, AlertTriangle, ExternalLink, Loader2, Sparkles, CheckCircle2, Lightbulb, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useJobs } from "@/hooks/useJobs";
import { useStudentApplications } from "@/hooks/useApplications";
import { calculatePlacementScore, calculateCareerReadiness, calculateSkillMatch, SKILL_RESOURCES } from "@/lib/skillEngine";
import ResumeUpload from "@/components/ResumeUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCareerRoadmap } from "@/hooks/useCareerRoadmap";
import { ResumeAnalysis, useResumeAnalysis } from "@/hooks/useResumeAnalysis";

const STATUS_COLORS: Record<string, string> = {
  applied: "text-muted-foreground",
  shortlisted: "text-secondary",
  interview: "text-secondary",
  offer: "text-accent",
  rejected: "text-destructive",
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { profile, updateProfile, refetch } = useProfile();
  const { jobs } = useJobs();
  const { applications, applyToJob } = useStudentApplications();
  const [editSkills, setEditSkills] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const { generateRoadmap, loading: roadmapLoading, roadmap } = useCareerRoadmap();
  const { fetchStoredAnalysis, analysis: storedAnalysis } = useResumeAnalysis();
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);

  // Load stored analysis on mount
  useEffect(() => {
    if (profile?.resume_url && !resumeAnalysis) {
      fetchStoredAnalysis().then(a => { if (a) setResumeAnalysis(a); });
    }
  }, [profile?.resume_url]);

  const name = profile?.full_name || user?.user_metadata?.full_name || "Student";
  const skills = profile?.skills || [];
  const cgpa = Number(profile?.cgpa) || 0;

  // Calculate placement score
  const placementScore = calculatePlacementScore({
    cgpa,
    skillScore: Math.min(skills.length * 12, 100),
    projectScore: Math.min((profile?.projects_count || 0) * 20, 100),
    certScore: Math.min((profile?.certifications_count || 0) * 25, 100),
    mockScore: Number(profile?.mock_interview_score) || 0,
    activityScore: Math.min(applications.length * 15, 100),
  });

  const careerReadiness = calculateCareerReadiness({
    cgpa,
    skillsCount: skills.length,
    projectsCount: profile?.projects_count || 0,
    certificationsCount: profile?.certifications_count || 0,
  });

  // Update scores in DB when they change
  useEffect(() => {
    if (profile && (profile.placement_score !== placementScore || profile.career_readiness_score !== careerReadiness)) {
      updateProfile({ placement_score: placementScore, career_readiness_score: careerReadiness } as any);
    }
  }, [placementScore, careerReadiness, profile]);

  // Build radar data from real skills
  const radarData = skills.length > 0
    ? skills.slice(0, 6).map((s, i) => ({ skill: s, value: Math.max(50, 100 - i * 8) }))
    : [{ skill: "Add Skills", value: 0 }];

  const radarChartConfig = {
    value: {
      label: "Skill Value",
      color: "hsl(var(--primary))",
    },
  };

  // Job matching
  const jobMatches = jobs.map(job => {
    const { matchScore } = calculateSkillMatch(skills, job.required_skills || []);
    return { ...job, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

  // Skill gap across all matching jobs
  const allMissingSkills = new Set<string>();
  jobs.forEach(job => {
    const { missingSkills } = calculateSkillMatch(skills, job.required_skills || []);
    missingSkills.forEach(s => allMissingSkills.add(s));
  });

  const handleSaveSkills = async () => {
    const newSkills = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
    await updateProfile({ skills: newSkills } as any);
    setEditSkills(false);
    toast.success("Skills updated! Scores recalculated.");
    await refetch();
  };

  const handleApply = async (jobId: string) => {
    const existing = applications.find(a => a.job_id === jobId);
    if (existing) { toast.error("Already applied"); return; }
    const error = await applyToJob(jobId);
    if (!error) toast.success("Application submitted!");
    else toast.error("Failed to apply");
  };

  const handleResumeComplete = async (_url: string, analysis?: ResumeAnalysis | null) => {
    if (analysis) {
      setResumeAnalysis(analysis);
    }
    // Refetch profile to get updated skills from analysis
    await refetch();
  };

  // Roadmap: use AI-generated or fallback to progress-based
  const fallbackRoadmapSteps = [
    { label: "Complete Profile", description: "Add your name, department, and CGPA", done: !!profile?.full_name && !!profile?.department },
    { label: "Upload Resume", description: "Upload your latest resume for AI analysis", done: !!profile?.resume_url },
    { label: "Add Skills", description: "List your technical and soft skills", done: skills.length > 0 },
    { label: "Apply to Jobs", description: "Start applying to matching job openings", done: applications.length > 0 },
    { label: "Secure Offer", description: "Get selected through interviews", done: applications.some(a => a.status === "offer") },
  ];

  const roadmapSteps = roadmap?.steps || fallbackRoadmapSteps;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="section-container py-8">
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">Welcome back, <span className="text-primary">{name}</span></h1>
              <p className="text-muted-foreground text-sm">Your AI-powered career dashboard</p>
            </div>
            <Dialog open={editSkills} onOpenChange={setEditSkills}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSkillsInput(skills.join(", "))}>
                  <BookOpen size={16} className="mr-2" /> Update Skills
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle className="font-heading">Update Skills</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="React, Python, SQL, Docker (comma separated)"
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    className="bg-muted border-border"
                  />
                  <Button className="w-full" onClick={handleSaveSkills}>Save Skills</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedSection>

        {/* Stats row */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: "Placement Score", value: `${placementScore}%`, sub: placementScore >= 70 ? "High" : placementScore >= 40 ? "Medium" : "Low" },
            { icon: Award, label: "Career Readiness", value: `${careerReadiness}/100`, sub: careerReadiness >= 70 ? "Ready" : "Building" },
            { icon: Briefcase, label: "Applications", value: String(applications.length), sub: "Active" },
            { icon: TrendingUp, label: "Skills", value: `${skills.length}`, sub: allMissingSkills.size > 0 ? `${allMissingSkills.size} gaps` : "Complete" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <Card className="border-border/40 shadow-sm transition-all hover:shadow-md group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={16} className="text-primary" />
                    <span className="text-muted-foreground text-xs">{s.label}</span>
                  </div>
                  <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
                  <p className="text-muted-foreground text-xs font-medium mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Resume Upload */}
        <AnimatedSection className="mb-6">
          <ResumeUpload currentUrl={profile?.resume_url} onUploadComplete={handleResumeComplete} />
          {resumeAnalysis && (
            <Card className="mt-3 border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Resume Analysis & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score + Summary */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Resume Score</p>
                    <p className="font-heading font-bold text-xl text-primary">{resumeAnalysis.resume_score}/100</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Skills Detected</p>
                    <p className="font-heading font-bold text-xl text-foreground">{resumeAnalysis.detected_skills.length}</p>
                  </div>
                </div>
                {resumeAnalysis.summary && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-3 py-1 bg-muted/10">{resumeAnalysis.summary}</p>
                )}

                {/* Detected Skills */}
                {resumeAnalysis.detected_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><CheckCircle2 size={12} className="text-primary" /> Detected Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.detected_skills.map(s => (
                        <Badge key={s} variant="secondary" className="bg-primary/5 text-primary border-primary/10 capitalize text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected Projects */}
                {resumeAnalysis.projects && resumeAnalysis.projects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Briefcase size={12} className="text-muted-foreground" /> Detected Projects</p>
                    <div className="space-y-2">
                      {resumeAnalysis.projects.map((p, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/10">
                          <p className="text-foreground text-sm font-medium">{typeof p === "string" ? p : p.title}</p>
                          {typeof p !== "string" && p.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.technologies.map(t => (
                                <Badge key={t} variant="outline" className="text-[9px] py-0 px-1.5 h-4">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {typeof p !== "string" && p.description && (
                            <p className="text-muted-foreground text-[11px] mt-1 line-clamp-2">{p.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {resumeAnalysis.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><TrendingUp size={12} className="text-primary" /> Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {resumeAnalysis.strengths.map(s => (
                          <Badge key={s} variant="outline" className="text-[10px] border-primary/20 text-primary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeAnalysis.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><AlertTriangle size={12} className="text-destructive" /> Areas to Improve</p>
                      <div className="flex flex-wrap gap-1">
                        {resumeAnalysis.weaknesses.map(w => (
                          <Badge key={w} variant="outline" className="text-[10px] border-destructive/20 text-destructive">
                            {w}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Improvement Suggestions */}
                {resumeAnalysis.suggested_skills && resumeAnalysis.suggested_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Lightbulb size={12} className="text-muted-foreground" /> Suggested Skills to Learn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.suggested_skills.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {resumeAnalysis.suggested_projects && resumeAnalysis.suggested_projects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><ArrowUpRight size={12} className="text-primary" /> Suggested Project Ideas</p>
                    <div className="space-y-1.5">
                      {resumeAnalysis.suggested_projects.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/10">
                          <span className="text-primary text-xs mt-0.5">→</span>
                          <span className="text-foreground text-xs">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeAnalysis.improvement_suggestions && resumeAnalysis.improvement_suggestions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1"><Award size={12} className="text-primary" /> Action Items</p>
                    <div className="space-y-1.5">
                      {resumeAnalysis.improvement_suggestions.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/10">
                          <Badge variant={item.priority === "high" ? "destructive" : "secondary"} className="text-[9px] uppercase px-1.5 h-4 flex-shrink-0">
                            {item.priority}
                          </Badge>
                          <div>
                            <span className="text-foreground text-xs font-medium">{item.category}: </span>
                            <span className="text-muted-foreground text-xs">{item.suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Placement Probability */}
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Placement Probability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                        className="text-primary"
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${placementScore * 2.64} 264` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-heading font-bold text-3xl text-foreground">{placementScore}%</span>
                      <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                        {placementScore >= 70 ? "High" : placementScore >= 40 ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-muted-foreground text-[10px] leading-relaxed">
                  Calculated from CGPA ({cgpa}), {skills.length} skills, {profile?.projects_count || 0} projects, and {applications.length} applications
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Skill Gap Radar */}
          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Skill Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <ChartContainer config={radarChartConfig} className="h-[200px] w-full">
                    <RadarChart data={radarData}>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Radar
                        dataKey="value"
                        stroke="var(--color-value)"
                        fill="var(--color-value)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground text-xs italic">Add skills to see your analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Missing Skills */}
        {allMissingSkills.size > 0 && (
          <AnimatedSection className="mb-6">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-destructive/80" /> Missing Skills & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from(allMissingSkills).slice(0, 6).map(skill => (
                    <div key={skill} className="p-3 rounded-lg bg-muted/20 border border-border/10">
                      <p className="text-foreground text-sm font-medium capitalize">{skill}</p>
                      {SKILL_RESOURCES[skill.toLowerCase()] && (
                        <a
                          href={SKILL_RESOURCES[skill.toLowerCase()]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-[10px] flex items-center gap-1 mt-1 hover:underline font-medium"
                        >
                          Learn <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Career Roadmap */}
        <AnimatedSection className="mb-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Route size={16} className="text-primary" /> Career Roadmap
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRoadmap}
                  disabled={roadmapLoading}
                  className="h-7 text-[10px] px-2"
                >
                  {roadmapLoading ? <Loader2 className="animate-spin mr-1" size={12} /> : <Sparkles className="mr-1" size={12} />}
                  {roadmapLoading ? "Generating..." : "AI Roadmap"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roadmap?.advice && (
                <p className="text-muted-foreground text-xs mb-4 italic border-l-2 border-primary/30 pl-3">{roadmap.advice}</p>
              )}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {roadmapSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-3 py-2 rounded-md text-[11px] font-medium transition-all ${
                        step.done
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground border border-dashed border-border"
                      }`}
                      title={step.description}
                    >
                      {step.label}
                    </motion.div>
                    {i < roadmapSteps.length - 1 && <ArrowRight size={12} className="text-muted-foreground/50" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Matches */}
          <AnimatedSection>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" /> Smart Job Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobMatches.length > 0 ? (
                  <div className="space-y-3">
                    {jobMatches.map((job) => {
                      const applied = applications.some(a => a.job_id === job.id);
                      return (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/10 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="text-foreground text-sm font-medium">{job.company_name}</p>
                            <p className="text-muted-foreground text-xs">{job.job_role}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-primary text-sm font-bold">{job.matchScore}%</p>
                              <p className="text-muted-foreground text-[10px]">
                                {job.salary_offered ? `₹${(Number(job.salary_offered) / 100000).toFixed(0)}L` : "—"}
                              </p>
                            </div>
                            <Button
                              variant={applied ? "ghost" : "outline"}
                              size="sm"
                              disabled={applied}
                              onClick={() => handleApply(job.id)}
                              className="h-7 text-[10px] px-3"
                            >
                              {applied ? "Applied" : "Apply"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No jobs posted yet</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Application Tracker */}
          <AnimatedSection delay={0.1}>
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap size={16} className="text-primary" /> Application Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/10">
                        <div>
                          <p className="text-foreground text-sm font-medium">{app.job?.company_name || "—"}</p>
                          <p className="text-muted-foreground text-xs">{app.job?.job_role || "—"}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-medium capitalize",
                            STATUS_COLORS[app.status]
                          )}
                        >
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-8 italic">No applications yet. Apply to jobs to track them here.</p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
