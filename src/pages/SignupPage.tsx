import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Building2, School, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as "student" | "recruiter" | "placement") || "student";
  const [role, setRole] = useState<"student" | "recruiter" | "placement">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [department, setDepartment] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { key: "student" as const, label: "Student", icon: GraduationCap },
    { key: "recruiter" as const, label: "Recruiter", icon: Building2 },
    { key: "placement" as const, label: "Placement Cell", icon: School },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error("Please fill in all required fields"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must contain both letters and numbers"); return;
    }
    if (phone && !/^\+?[\d\s-]{10,15}$/.test(phone)) {
      toast.error("Please enter a valid phone number"); return;
    }
    setLoading(true);
    try {
      await signUp(email, password, {
        full_name: fullName,
        role,
        organization,
        phone_number: phone,
        department,
        cgpa: cgpa || "0",
      });
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google sign-up failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold">T</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Talent<span className="gradient-text">IQ</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-foreground">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Get started with TalentIQ</p>
        </div>

        <div className="glass rounded-2xl p-8 glow-sm">
          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                  role === r.key
                    ? "gradient-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <r.icon size={14} />
                {r.label}
              </button>
            ))}
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-muted border-border" />
            <Input placeholder="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted border-border" />
            <Input placeholder="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-muted border-border" />
            <Input
              placeholder={role === "recruiter" ? "Company Name" : "College / Institution"}
              value={organization} onChange={(e) => setOrganization(e.target.value)}
              className="bg-muted border-border"
            />
            {role === "student" && (
              <>
                <Input placeholder="Department (e.g. CS, ECE, ME)" value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-muted border-border" />
                <Input placeholder="CGPA (e.g. 8.5)" type="number" step="0.1" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="bg-muted border-border" />
              </>
            )}
            <Input placeholder="Password * (min 8 chars, letters & numbers)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted border-border" />
            <Button variant="hero" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <Button variant="hero-outline" className="w-full" disabled={googleLoading} onClick={handleGoogleSignUp}>
            {googleLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
