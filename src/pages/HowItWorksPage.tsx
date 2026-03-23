import SectionHeading from "@/components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { Upload, Brain, Target, Lightbulb, Route, Briefcase, RefreshCw, ClipboardList, Users, BarChart3, Calendar, LayoutDashboard, Monitor, PieChart, TrendingUp, Search } from "lucide-react";

const studentSteps = [
  { icon: Upload, label: "Upload Resume" },
  { icon: Brain, label: "AI Resume Parsing" },
  { icon: Target, label: "Placement Probability Prediction" },
  { icon: Lightbulb, label: "Skill Gap Detection" },
  { icon: Route, label: "Personalized Career Roadmap" },
  { icon: Briefcase, label: "Smart Job Matching" },
  { icon: RefreshCw, label: "Continuous Learning Loop" },
];

const recruiterSteps = [
  { icon: ClipboardList, label: "Post Job Requirements" },
  { icon: Users, label: "AI Candidate Ranking" },
  { icon: Target, label: "Compatibility Score Generation" },
  { icon: Search, label: "Automated Assessments" },
  { icon: Calendar, label: "Smart Interview Scheduling" },
  { icon: BarChart3, label: "Hiring Analytics Dashboard" },
];

const placementSteps = [
  { icon: LayoutDashboard, label: "Central Monitoring Dashboard" },
  { icon: Monitor, label: "Department Readiness Score" },
  { icon: TrendingUp, label: "Placement Trend Analysis" },
  { icon: PieChart, label: "Funnel Optimization" },
  { icon: Target, label: "Predictive Placement Forecast" },
];

const WorkflowColumn = ({ title, steps }: { title: string; steps: { icon: any; label: string }[] }) => (
  <div className="glass rounded-2xl p-8 h-full">
    <h3 className="font-heading font-semibold text-foreground text-xl mb-8 text-center">{title}</h3>
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          whileHover={{ x: 4 }}
          className="flex items-center gap-4 group"
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <step.icon size={18} className="text-primary-foreground" />
            </div>
            {i < steps.length - 1 && <div className="w-px h-4 bg-border mt-1" />}
          </div>
          <div>
            <span className="text-accent text-xs font-semibold">Step {i + 1}</span>
            <p className="text-foreground text-sm font-medium">{step.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const HowItWorksPage = () => (
  <div className="min-h-screen bg-background pt-20">
    <section className="section-padding">
      <div className="section-container">
        <AnimatedSection>
          <SectionHeading badge="How It Works" title="Three Workflows," gradientText="One Platform" subtitle="Seamless experiences tailored for every stakeholder" />
        </AnimatedSection>
        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          <StaggerItem><WorkflowColumn title="🎓 Student Workflow" steps={studentSteps} /></StaggerItem>
          <StaggerItem><WorkflowColumn title="🏢 Recruiter Workflow" steps={recruiterSteps} /></StaggerItem>
          <StaggerItem><WorkflowColumn title="🏫 Placement Cell Workflow" steps={placementSteps} /></StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  </div>
);

export default HowItWorksPage;
