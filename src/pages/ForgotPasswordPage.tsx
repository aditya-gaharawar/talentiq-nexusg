import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
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
          <h1 className="font-heading font-bold text-2xl text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sent ? "Check your inbox for the reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 glow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
                <Mail size={28} className="text-primary-foreground" />
              </div>
              <p className="text-foreground text-sm">
                We've sent a password reset link to <span className="font-semibold">{email}</span>
              </p>
              <p className="text-muted-foreground text-xs">The link expires in 10 minutes</p>
              <Button variant="hero-outline" className="w-full" onClick={() => setSent(false)}>
                Send Again
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                placeholder="Email Address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className="bg-muted border-border"
              />
              <Button variant="hero" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
