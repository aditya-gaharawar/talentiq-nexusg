import SectionHeading from "@/components/SectionHeading";
import ParticlesBackground from "@/components/ParticlesBackground";
import AnimatedSection, { StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { Brain, Search, BarChart3, Users, Shield, Cpu, Database, Layers } from "lucide-react";

const sections = [
  { icon: Brain, title: "AI Career Engine", desc: "Our proprietary machine learning engine analyzes thousands of data points to predict placement outcomes with 94% accuracy. It continuously learns from placement patterns to improve recommendations." },
  { icon: Search, title: "Smart ATS System", desc: "AI-powered applicant tracking that goes beyond keyword matching. Our semantic analysis understands context, skills relationships, and candidate potential." },
  { icon: BarChart3, title: "Predictive Placement Analytics", desc: "Real-time dashboards with predictive forecasting. Anticipate placement trends, identify at-risk students, and optimize preparation strategies before it's too late." },
  { icon: Users, title: "Recruiter Matching Engine", desc: "Compatibility scoring algorithm that matches candidates with roles based on skills, culture fit, career trajectory, and growth potential." },
];

const archLayers = [
  { icon: Layers, label: "Presentation Layer", desc: "React Dashboard, Mobile App, API" },
  { icon: Cpu, label: "AI/ML Layer", desc: "NLP, Predictive Models, Matching Algorithms" },
  { icon: Database, label: "Data Layer", desc: "Student Profiles, Job Data, Analytics" },
  { icon: Shield, label: "Security Layer", desc: "Blockchain Verification, Encryption, RBAC" },
];

const ProductPage = () => (
  <div className="min-h-screen bg-background pt-20">
    <section className="section-padding relative">
      <ParticlesBackground />
      <div className="section-container relative z-10">
        <AnimatedSection>
          <SectionHeading badge="Product" title="Platform" gradientText="Architecture" subtitle="A comprehensive AI ecosystem built for modern campus placements" />
        </AnimatedSection>
        <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-20">
          {sections.map((s) => (
            <StaggerItem key={s.title}>
              <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-8 transition-all duration-300 group h-full">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <s.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground text-xl mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection>
          <SectionHeading title="System" gradientText="Architecture" />
        </AnimatedSection>
        <div className="max-w-2xl mx-auto space-y-4">
          {archLayers.map((layer, i) => (
            <AnimatedSection key={layer.label} delay={i * 0.1}>
              <motion.div
                whileHover={{ x: 8 }}
                className="glass rounded-xl p-6 flex items-center gap-4 hover:glow-border transition-all"
                style={{ marginLeft: `${i * 20}px`, marginRight: `${(3 - i) * 20}px` }}
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <layer.icon size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground text-sm">{layer.label}</p>
                  <p className="text-muted-foreground text-xs">{layer.desc}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default ProductPage;
