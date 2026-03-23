import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User has been authenticated via recovery link
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) { toast.error("Please fill in all fields"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must contain both letters and numbers"); return;
    }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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
          <h1 className="font-heading font-bold text-2xl text-foreground">
            {success ? "Password Updated" : "Set New Password"}
          </h1>
        </div>

        <div className="glass rounded-2xl p-8 glow-sm">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-accent mx-auto" />
              <p className="text-foreground text-sm">Your password has been updated. Redirecting to login...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                placeholder="New Password (min 8 chars, letters & numbers)"
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} className="bg-muted border-border"
              />
              <Input
                placeholder="Confirm New Password"
                type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} className="bg-muted border-border"
              />
              <Button variant="hero" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
