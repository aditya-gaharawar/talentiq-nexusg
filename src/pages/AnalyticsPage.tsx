import SectionHeading from "@/components/SectionHeading";
import ParticlesBackground from "@/components/ParticlesBackground";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";

const placementProb = [
  { name: "CS", value: 92 }, { name: "ECE", value: 78 }, { name: "ME", value: 65 },
  { name: "Civil", value: 55 }, { name: "IT", value: 88 }, { name: "EEE", value: 70 },
];

const salaryTrend = [
  { year: "2021", avg: 5.2 }, { year: "2022", avg: 6.1 }, { year: "2023", avg: 7.0 },
  { year: "2024", avg: 7.8 }, { year: "2025", avg: 8.5 }, { year: "2026", avg: 9.2 },
];

const skillDemand = [
  { skill: "React", demand: 92 }, { skill: "Python", demand: 88 }, { skill: "ML/AI", demand: 95 },
  { skill: "Cloud", demand: 82 }, { skill: "DevOps", demand: 75 }, { skill: "Data", demand: 90 },
];

const hiringEfficiency = [
  { name: "Screening", manual: 48, ai: 8 }, { name: "Shortlist", manual: 24, ai: 4 },
  { name: "Interview", manual: 16, ai: 6 }, { name: "Offer", manual: 8, ai: 2 },
];

const chartTooltipStyle = {
  background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))",
};

const AnalyticsPage = () => (
  <div className="min-h-screen bg-background pt-20">
    <section className="section-padding relative">
      <ParticlesBackground />
      <div className="section-container relative z-10">
        <AnimatedSection>
          <SectionHeading badge="AI Engine" title="Analytics &" gradientText="AI Engine" subtitle="Powered by advanced machine learning and real-time data processing" />
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-8">
          <StaggerItem>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Placement Probability by Department</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={placementProb}>
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(263, 70%, 50%)" /><stop offset="100%" stopColor="hsl(187, 92%, 42%)" /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" fill="url(#pg)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Salary Forecast Trend (₹ LPA)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={salaryTrend}>
                  <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(187, 92%, 42%)" stopOpacity={0.05} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="avg" stroke="hsl(187, 92%, 42%)" fill="url(#ag)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Skill Demand Heatmap</h3>
              <div className="space-y-3">
                {skillDemand.map((s) => (
                  <div key={s.skill} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-16">{s.skill}</span>
                    <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                      <div className="h-full rounded gradient-primary" style={{ width: `${s.demand}%` }} />
                    </div>
                    <span className="text-foreground text-xs font-semibold w-8">{s.demand}%</span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Hiring Efficiency (Hours)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hiringEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="manual" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Manual" />
                  <Bar dataKey="ai" fill="hsl(187, 92%, 42%)" radius={[4, 4, 0, 0]} name="TalentIQ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <AnimatedSection>
          <div className="glass rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h3 className="font-heading font-bold text-foreground text-2xl mb-3">AI Technology Stack</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {["NLP Engine", "Deep Learning", "Predictive Models", "Graph Neural Networks", "Recommendation System", "Real-time Analytics"].map((t) => (
                <span key={t} className="px-4 py-2 rounded-full glass glow-border text-accent text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </div>
);

export default AnalyticsPage;
