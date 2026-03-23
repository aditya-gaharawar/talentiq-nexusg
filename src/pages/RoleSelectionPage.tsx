import { Link } from "react-router-dom";
import { GraduationCap, Building2, School, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ParticlesBackground from "@/components/ParticlesBackground";

const roles = [
  {
    key: "student",
    icon: GraduationCap,
    title: "Student",
    desc: "Get AI-powered career guidance, skill gap analysis, and placement predictions tailored to your profile.",
    gradient: "from-primary to-secondary",
  },
  {
    key: "recruiter",
    icon: Building2,
    title: "Recruiter / Company",
    desc: "Find top candidates with AI-driven compatibility scoring, smart screening, and hiring analytics.",
    gradient: "from-secondary to-accent",
  },
  {
    key: "placement",
    icon: School,
    title: "Placement Cell",
    desc: "Monitor, predict, and optimize placement outcomes across departments with real-time analytics.",
    gradient: "from-accent to-primary",
  },
];

const RoleSelectionPage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
    <ParticlesBackground />
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
    <div className="section-container relative z-10 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold">T</span>
          </div>
          <span className="font-heading font-bold text-2xl text-foreground">
            Talent<span className="gradient-text">IQ</span>
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-3">
          Who are <span className="gradient-text">you</span>?
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Select your role to get a personalized experience
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {roles.map((role, i) => (
          <motion.div
            key={role.key}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/signup?role=${role.key}`}
              className="glass rounded-2xl p-8 flex flex-col items-center text-center hover:glow-border transition-all duration-300 group block h-full"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6"
              >
                <role.icon size={36} className="text-primary-foreground" />
              </motion.div>
              <h3 className="font-heading font-bold text-foreground text-xl mb-3">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{role.desc}</p>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-muted-foreground text-sm mt-10"
      >
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </motion.p>
    </div>
  </div>
);

export default RoleSelectionPage;
