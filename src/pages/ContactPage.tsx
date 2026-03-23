import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demo request submitted! We'll be in touch soon.");
    setForm({ name: "", email: "", org: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="section-padding">
        <div className="section-container">
          <AnimatedSection>
            <SectionHeading badge="Contact" title="Get in" gradientText="Touch" subtitle="Request a demo or schedule a meeting with our team" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection>
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
                <Input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted border-border" required />
                <Input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted border-border" required />
                <Input placeholder="Organization" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="bg-muted border-border" />
                <Textarea placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-muted border-border min-h-[120px]" required />
                <div className="flex gap-3">
                  <Button variant="hero" type="submit" className="flex-1">Request Demo <Send size={16} /></Button>
                  <Button variant="hero-outline" type="button" className="flex-1">Schedule Meeting</Button>
                </div>
              </form>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "hello@talentiq.ai" },
                  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                  { icon: MapPin, label: "Office", value: "Bangalore, India" },
                ].map((item) => (
                  <motion.div key={item.label} whileHover={{ x: 4 }} className="glass rounded-xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{item.label}</p>
                      <p className="text-foreground font-medium">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
                <div className="glass rounded-xl p-6">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our team typically responds within 24 hours. For enterprise inquiries, we offer personalized demos and proof-of-concept sessions.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
