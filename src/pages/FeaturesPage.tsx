import SectionHeading from "@/components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, Lightbulb, Route, Users, Calendar, BarChart3, Building2, Shield } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Resume Parsing", desc: "Extract skills, experience, and qualifications with NLP-powered analysis" },
  { icon: Target, title: "Placement Probability Engine", desc: "Predict placement likelihood with 94% accuracy using ML models" },
  { icon: TrendingUp, title: "Salary Prediction Model", desc: "Forecast expected salary ranges based on skills and market trends" },
  { icon: Lightbulb, title: "Skill Gap Analysis", desc: "Identify missing skills and recommend targeted learning paths" },
  { icon: Route, title: "Career Roadmap Generator", desc: "Personalized step-by-step career development plans" },
  { icon: Users, title: "Recruiter Compatibility Score", desc: "Match candidates to roles based on multi-dimensional scoring" },
  { icon: Calendar, title: "Smart Interview Scheduler", desc: "AI-optimized scheduling that reduces coordination overhead" },
  { icon: BarChart3, title: "Placement Funnel Analytics", desc: "Track conversion rates across every stage of the placement process" },
  { icon: Building2, title: "Multi College SaaS System", desc: "Scalable architecture supporting multi-tenant college networks" },
  { icon: Shield, title: "Blockchain Offer Verification", desc: "Tamper-proof offer letter verification using blockchain technology" },
];

const FeaturesPage = () => (
  <div className="min-h-screen bg-background pt-20">
    <section className="section-padding">
      <div className="section-container">
        <AnimatedSection>
          <SectionHeading
            badge="Features"
            title="Powerful"
            gradientText="Capabilities"
            subtitle="Everything you need to transform campus placements"
          />
        </AnimatedSection>
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "var(--shadow-glow)" }}
                className="glass rounded-2xl p-6 transition-all duration-300 group h-full"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  </div>
);

export default FeaturesPage;
